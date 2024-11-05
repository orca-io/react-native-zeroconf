import { NativeModules, DeviceEventEmitter, Platform } from 'react-native'
import { EventEmitter } from 'events'

const RNZeroconf = NativeModules.RNZeroconf

export const ImplType = {
  NSD: 'NSD',
  DNSSD: 'DNSSD',
}

export default class Zeroconf extends EventEmitter {
  constructor(props) {
    super(props)

    this._services = {}
    this._publishedServices = {}
    this._dListeners = {}

    this.addDeviceListeners()
  }

  /**
   * Add all event listeners
   */
  addDeviceListeners() {
    if (Object.keys(this._dListeners).length) {
      return this.emit('error', new Error('RNZeroconf listeners already in place.'))
    }

    this._dListeners.start = DeviceEventEmitter.addListener('RNZeroconfStart', () =>
      this.emit('start'),
    )

    this._dListeners.stop = DeviceEventEmitter.addListener('RNZeroconfStop', () =>
      this.emit('stop'),
    )

    this._dListeners.error = DeviceEventEmitter.addListener('RNZeroconfError', err => {
      if (this.listenerCount('error') > 0) {
        this.emit('error', new Error(err))
      }
    })

    this._dListeners.found = DeviceEventEmitter.addListener('RNZeroconfFound', service => {
      if (!service || !service.name) {
        return
      }
      const { name } = service

      this._services[name] = service
      this.emit('found', name)
      this.emit('update')
    })

    this._dListeners.remove = DeviceEventEmitter.addListener('RNZeroconfRemove', service => {
      if (!service || !service.name) {
        return
      }
      const { name } = service

      delete this._services[name]

      this.emit('remove', name)
      this.emit('update')
    })

    this._dListeners.resolved = DeviceEventEmitter.addListener('RNZeroconfResolved', service => {
      if (!service || !service.name) {
        return
      }

      this._services[service.name] = service
      this.emit('resolved', service)
      this.emit('update')
    })

    this._dListeners.published = DeviceEventEmitter.addListener(
      'RNZeroconfServiceRegistered',
      service => {
        if (!service || !service.name) {
          return
        }

        this._publishedServices[service.name] = service
        this.emit('published', service)
      },
    )

    this._dListeners.unpublished = DeviceEventEmitter.addListener(
      'RNZeroconfServiceUnregistered',
      service => {
        if (!service || !service.name) {
          return
        }

        delete this._publishedServices[service.name]
        this.emit('unpublished', service)
      },
    )
  }

  /**
   * Remove all event listeners and clean map
   */
  removeDeviceListeners() {
    Object.keys(this._dListeners).forEach(name => this._dListeners[name].remove())
    this._dListeners = {}
  }

  /**
   * Get all the services already resolved
   */
  getServices() {
    return this._services
  }

  /**
   * Scan for Zeroconf services,
   * Defaults to _http._tcp. on local domain
   *
   * @param {string} [domain='local.']
   * @param {string} [protocol='tcp']
   * @param {string} [type='http']
   * @param {RegExp | undefined} [regexFilterName=undefined]
   */
  scan(type = 'http', protocol = 'tcp', domain = 'local.', regexFilterName = undefined) {
    this._services = {}
    this.emit('update')

    if (Platform.OS === 'android') {
      const regexFilterNameStr =
        regexFilterName instanceof RegExp ? regexFilterName.source : undefined
      RNZeroconf.scan(type, protocol, domain, regexFilterNameStr)
    } else {
      RNZeroconf.scan(type, protocol, domain)
    }
  }

  /**
   * Stop current scan if any
   */
  stop() {
    RNZeroconf.stop()
  }

  /**
   * Publish a service
   */
  // eslint-disable-next-line max-params
  publishService(type, protocol, domain = 'local.', name, port, txt = {}) {
    if (Object.keys(txt).length !== 0) {
      Object.entries(txt).map(([key, value]) => (txt[key] = value.toString()))
    }

    RNZeroconf.registerService(type, protocol, domain, name, port, txt)
  }

  /**
   * Unpublish a service
   */
  unpublishService(name) {
    RNZeroconf.unregisterService(name)
  }
}
