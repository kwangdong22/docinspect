import 'reflect-metadata';
import { createExpressServer } from 'routing-controllers';
import { DocumentController } from './controllers/DocumentController';

const app = createExpressServer({
    controllers: [DocumentController],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`TypeScript API listening on port ${port}`);
});
