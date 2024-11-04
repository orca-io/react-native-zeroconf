declare module 'react-native-zeroconf' {
  export type Service = {
    host: string;
    addresses: string[];
    name: string;
    fullName: string;
    port: number;
  };

  export default class EventEmitter {
    stop(): void;

    scan(type: string, protocol: string, domain: string, regexFilterName: RegExp): void;

    publishService(
      type: string,
      protocol: string,
      domain: string,
      name: string,
      port: number,
    );

    getServices(): Service[];

    unpublishService(name: string);

    removeDeviceListeners(): void;

    addDeviceListeners(): void;

    /**
     * Events:
     * 'start'
     * 'stop'
     * 'found'
     * 'remove'
     * 'update'
     * 'error'
     * 'resolved';
     */
    on(event: 'start', callback: () => void);
    on(event: 'stop', callback: () => void);
    on(event: 'found', callback: (service: Service) => void);
    on(event: 'remove', callback: (service: Pick<Service, 'name'>) => void);
    on(event: 'update', callback: () => void);
    on(event: 'error', callback: (error: any) => void);
    on(event: 'resolved', callback: (service: Service) => void);
  }
}
