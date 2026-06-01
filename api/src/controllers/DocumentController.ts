import { JsonController, Get, Post, UploadedFile, BadRequestError, QueryParam } from 'routing-controllers';
import * as crypto from 'crypto';
import { db } from '../db';

@JsonController()
export class DocumentController {
    
    // 1. Health Check
    @Get('/health')
    healthCheck() {
        return { status: "ok" };
    }

    // 2. The Search Filter (Day 3)
    @Get('/documents')
    async listDocuments(
        @QueryParam("has_tables") hasTables?: boolean,
        @QueryParam("file_extension") fileExtension?: string
    ) {
        // Build a dynamic SQL query based on what the user asks for
        let query = 'SELECT * FROM documents WHERE 1=1';
        const values: any[] = [];
        let paramIndex = 1;

        if (hasTables !== undefined) {
            query += ` AND has_tables = $${paramIndex++}`;
            values.push(hasTables);
        }
        
        if (fileExtension) {
            query += ` AND file_extension = $${paramIndex++}`;
            values.push(fileExtension);
        }

        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, values);
        return result.rows;
    }

    // 3. The Main Engine (Day 2)
    @Post('/documents/analyze')
    async analyzeDocument(@UploadedFile("file") file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestError("No file uploaded");
        }

        // Step A: Calculate SHA256 Checksum (The unique digital fingerprint)
        const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // Step B: Cache Lookup: Check if this file has already been parsed
        const cacheCheck = await db.query('SELECT * FROM documents WHERE sha256 = $1', [sha256]);
        if (cacheCheck.rows.length > 0) {
            // Mark it as a cached return so the client knows it came from the DB
            const existingDoc = cacheCheck.rows[0];
            existingDoc.cached = true;
            return existingDoc;
        }

        // Step C: Handoff: Forward the file to the Python Extractor service
        const extractorUrl = process.env.EXTRACTOR_URL || 'http://extractor:8000';
        
        // Convert Multer buffer to a Blob for native fetch compatibility
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const formData = new FormData();
        formData.append('file', blob, file.originalname);

        let extractionStats: any; // Explicitly typed to prevent TS18046 error
        try {
            const response = await fetch(`${extractorUrl}/extract`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Python extractor returned status ${response.status}`);
            }
            
            extractionStats = await response.json();
        } catch (error: any) {
            throw new Error(`Failed to communicate with extraction service: ${error.message}`);
        }

        // Step D: Save to Database: Prepare fields for relational insert
        const documentId = crypto.randomUUID();
        const fileExtension = file.originalname.split('.').pop() || '';

        const insertQuery = `
            INSERT INTO documents (
                id, original_filename, mime_type, file_extension, file_size_bytes, sha256,
                page_count, word_count, character_count, emails, phones, links,
                has_tables, has_images, extraction_status, cached
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *;
        `;

        const values = [
            documentId,
            file.originalname,
            file.mimetype,
            fileExtension,
            file.size,
            sha256,
            extractionStats.page_count,
            extractionStats.word_count,
            extractionStats.character_count,
            extractionStats.emails,
            extractionStats.phones,
            extractionStats.links,
            extractionStats.has_tables,
            extractionStats.has_images,
            'success',
            false
        ];

        const savedDoc = await db.query(insertQuery, values);
        return savedDoc.rows[0];
    }
}
