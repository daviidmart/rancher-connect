'use strict'

const Joi = require('joi')
const request = require('request')

const internals = {}
internals.schema = Joi.object({
  url: Joi.string().required(),
  access_key: Joi.string().required(),
  secret_key: Joi.string().required()
})

class RancherClient {
  constructor(config) {
    Joi.assert(config, internals.schema)
    this.request = request.defaults({
      baseUrl: `${config.url}`,
      headers: {
        Authorization: 'Basic ' + new Buffer(config.access_key + ':' + config.secret_key).toString('base64'),
        'Content-Type': 'application/json'
      }
    })
    this._request = (method, url, options) => {
      return new Promise((resolve, reject) => {
        this.request(url, Object.assign({
          method: method
        }, options), (err, res, json) => {
          if (err) {
            return reject(err)
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const e = new Error('Invalid response code: ' + res.statusCode)
            e.statusCode = res.statusCode
            e.headers = res.headers
            return reject(e)
          }

          return resolve(typeof json === "string" ? JSON.parse(json) : json)
        })
      })
    }
  }

  createContainer(container) {
    return this._request('POST', '/container', {
      json: container
    })
  }

  getContainer(containerId) {

    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('GET', `/container/${containerId}`)
  }

  updateContainer(container) {
    return this._request('POST', `/container/${container.id}`, {
      json: container
    })
  }

  stopContainer(containerId, stopParams) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('POST', `/container/${containerId}/?action=stop`, {
      json: stopParams
    })
  }

  startContainer(containerId) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('POST', `/container/${containerId}/?action=start`)
  }

  restartContainer(containerId) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('POST', `/container/${containerId}/?action=restart`)
  }

  removeContainer(containerId) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('DELETE', `/container/${containerId}`)
  }

  purgeContainer(containerId) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('POST', `/container/${containerId}/?action=purge`)
  }

  getContainerLogs(containerId) {
    Joi.assert(containerId, Joi.string().required(), 'Must specify container id')
    return this._request('POST', `/container/${containerId}/?action=logs`)
  }

  createStack(stack) {
    return this._request('POST', '/stacks', {
      json: stack
    })
  }

  getStacks(query) {
    return new Promise((resolve, reject) => {
      this._request('GET', `/stacks?${query}`).then(resp => {
        resolve(resp.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  getStack(stackId) {
    Joi.assert(stackId, Joi.string().required(), 'Must specify stack id')
    return this._request('GET', `/stacks/${stackId}`)
  }

  getStackServices(stackId) {
    Joi.assert(stackId, Joi.string().required(), 'Must specify stack id')
    return this._request('GET', `/stacks/${stackId}/services`)
  }

  removeStack(stackId) {
    Joi.assert(stackId, Joi.string().required(), 'Must specify stack id')
    return this._request('POST', `/stacks/${stackId}/?action=remove`)
  }

  getPorts() {
    return this._request('GET', `/ports`)
  }

  getHosts(query) {
    return new Promise((resolve, reject) => {
      this._request('GET', `/hosts?${query}`).then(resp => {
        resolve(resp.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  getHost(hostId) {
    return this._request('GET', `/hosts/${hostId}`)
  }

  deleteHost(hostId) {
    return this._request('DELETE', `/hosts/${hostId}`)
  }

  getRegistrationToken() {
    return new Promise((resolve, reject) => {
      this._request('POST', '/registrationtokens').then(resp => {
        this._request('GET', '/registrationtokens/' + resp.id).then(resp => {
          resolve(resp.command)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  getServices(query) {
    return new Promise((resolve, reject) => {
      this._request('GET', `/services?${query}`).then(resp => {
        resolve(resp.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  getService(serviceId) {
    Joi.assert(serviceId, Joi.string().required(), 'Must specify service id')
    return this._request('GET', `/services/${serviceId}`)
  }

  getServiceStats(serviceId) {
    Joi.assert(serviceId, Joi.string().required(), 'Must specify service id')
    return this._request('GET', `/services/${serviceId}/containerstats`)
  }

  stopService(serviceId) {
    Joi.assert(serviceId, Joi.string().required(), 'Must specify service id')
    return this._request('POST', `/services/${serviceId}/?action=deactivate`)
  }

  startService(serviceId) {
    Joi.assert(serviceId, Joi.string().required(), 'Must specify service id')
    return this._request('POST', `/services/${serviceId}/?action=activate`)
  }

  restartService(serviceId, restartParams) {
    Joi.assert(serviceId, Joi.string().required(), 'Must specify service id')
    return this._request('POST', `/services/${serviceId}/?action=restart`, {
      json: restartParams
    })
  }

  createVolume(volume) {
    return this._request('POST', '/volume', {
      json: volume
    })
  }

  getVolume(volumeId) {
    Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId')
    return this._request('GET', `/volume/${volumeId}`)
  }
  removeVolume(volumeId) {
    Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId')
    return this._request('POST', `/volume/${volumeId}/?action=remove`)
  }

}

module.exports = RancherClient;