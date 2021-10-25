import swaggerUi from 'swagger-ui-express'
import { getMetadataArgsStorage } from 'routing-controllers';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';

export function attachSwagger(expressApp: any) {
  const storage = getMetadataArgsStorage();

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
  });

  const spec2 = routingControllersToSpec(storage, {}, {
    components: { schemas },
    openapi: '3.0.0',
    info: { title: 'Articles CMS', version: '0.0.0' },
  });
  expressApp.use('/swagger', swaggerUi.serve, swaggerUi.setup(spec2));
}

