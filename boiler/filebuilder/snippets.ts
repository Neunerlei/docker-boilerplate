import type {DockerComposeBody} from './body/DockerComposeBody.js';

/**
 * Creates a volume share between two services in a Docker Compose file.
 * @param volumeSuffix A generic suffix to describe the volume. Must be unique and contain only lowercase letters, numbers, and underscores.
 * @param sharingPartialKey The key of the partial that is sharing the volume.
 * @param sharedPath The path in the sharing service that should be shared.
 * @param receivingPartialKey The key of the partial that is receiving the volume.
 * @param receivingPath The path in the receiving service where the volume should be mounted.
 * @param body The Docker Compose body to which the volume share should be added.
 * @param hostPath An optional host path to bind mount the volume. If not provided, a local volume will be created.
 */
export function fbSnipDockerComposeVolumeShare(
    volumeSuffix: string,
    sharingPartialKey: string,
    sharedPath: string,
    receivingPartialKey: string,
    receivingPath: string,
    body: DockerComposeBody,
    hostPath?: string
): void {
    const mountName = `${sharingPartialKey}_${volumeSuffix}`;
    const ensureLeadingSlash = (path: string) => path.startsWith('/') ? path : '/' + path;
    body.mergeService(sharingPartialKey, {
        volumes: [
            mountName + ':' + ensureLeadingSlash(sharedPath)
        ]
    });
    body.mergeService(receivingPartialKey, {
        volumes: [
            mountName + ':' + ensureLeadingSlash(receivingPath)
        ],
        depends_on: {
            [sharingPartialKey]: {
                condition: 'service_healthy'
            }
        }
    });
    body.merge({
        volumes: {
            [mountName]: {
                driver: 'local',
                ...(hostPath ? {
                    driver_opts: {
                        type: 'none',
                        device: hostPath,
                        o: 'bind'
                    }
                } : {})
            }
        }
    });
}
