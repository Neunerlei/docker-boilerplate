import type {BodyBuilder} from '@boiler/partial/types.js';
import type {BodyBuilderPosition} from '@boiler/filebuilder/BodyBuilderCollector.js';
import type {NginxBody} from './filebuilder/NginxBody.js';

declare module '@boiler/filebuilder/BodyBuilderCollector.js' {
    export interface BodyBuilderCollector {
        add(filename: 'nginx.conf', builder: BodyBuilder<NginxBody>, position?: BodyBuilderPosition): this;
    }
}
