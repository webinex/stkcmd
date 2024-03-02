import {
  EntityDefinition,
  EnumValueObjectDefinition,
  ModelPropertyDefinition,
  ValueObjectDefinition,
} from '@/definitions/csharp';
import './polyfill';
import { Skaffold } from './skaffold';
import { FullStackCrudModuleDefinition } from './definitions';

const skaffold = new Skaffold({
  context: {
    PRODUCT_NAME: 'StarterKit',
    REPO_ROOT: 'd:/dev/repos/starterkit-for-healthcare',
  },
  definition: () =>
    new FullStackCrudModuleDefinition({
      entity: new EntityDefinition({
        name: 'FamilyMember',
        properties: (x) => [
          new ModelPropertyDefinition({
            name: 'Id',
            type: 'System.Guid',
            pk: true,
            immutable: true,
            auto: true,
          }),
          new ModelPropertyDefinition({
            name: 'FirstName',
            type: 'System.String',
            nullable: false,
            maxLength: 'md',
          }),
          new ModelPropertyDefinition({
            name: 'LastName',
            type: 'System.String',
            nullable: false,
            maxLength: 'md',
          }),
          new ModelPropertyDefinition({
            name: 'Type',
            type: new EnumValueObjectDefinition({
              name: 'FamilyMemberType',
              directory: x.directory(),
              namespace: x.namespace,
              values: ['WIFE', 'HUSBAND', 'SON', 'DAUGHTER', 'MOM', 'DAD'],
            }),
          }),
          new ModelPropertyDefinition({
            name: 'Contacts',
            collection: true,
            type: new ValueObjectDefinition({
              name: 'ContactInfo',
              namespace: x.namespace,
              directory: x.directory(),
              properties: [
                new ModelPropertyDefinition({
                  name: 'Phone',
                  nullable: false,
                  type: 'System.String',
                  maxLength: 'md',
                }),
                new ModelPropertyDefinition({
                  name: 'Email',
                  nullable: false,
                  type: 'System.String',
                  maxLength: 'md',
                }),
                new ModelPropertyDefinition({
                  name: 'Address',
                  nullable: false,
                  type: new ValueObjectDefinition({
                    name: 'Address',
                    namespace: x.namespace,
                    directory: x.directory(),
                    properties: [
                      new ModelPropertyDefinition({
                        name: 'Street',
                        nullable: false,
                        type: 'System.String',
                        maxLength: 'md',
                      }),
                      new ModelPropertyDefinition({
                        name: 'City',
                        nullable: false,
                        type: 'System.String',
                        maxLength: 'md',
                      }),
                      new ModelPropertyDefinition({
                        name: 'State',
                        nullable: false,
                        type: 'System.String',
                        maxLength: 'md',
                      }),
                      new ModelPropertyDefinition({
                        name: 'Zip',
                        nullable: false,
                        type: 'System.String',
                        maxLength: 'md',
                      }),
                      new ModelPropertyDefinition({
                        name: 'Country',
                        nullable: false,
                        type: 'System.String',
                        maxLength: 'md',
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    }),
});

skaffold.test().run();
