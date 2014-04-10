# peer-js-devices

Status: Working but in early stage of development. Use with caution.

## About

Handy helper classes to help you manage and maintain connections with peer.js

## Classes

#### Device

A `Device` is a generic term for any device. It can contain multiple connections and will
manage its own events and provide methods to haddle accepting connections and dialing
peers to create a new connection.

### Presenter

A `Presenter` extends a `Device` and can be extended further to provide presenter specific
capabilities. A `Presenter` class should be used when many `Client`s are connected to a
a `Presenter`.

### Client

Like the `Presenter` class the `Client` class extends a `Device` and can be entender further
to provide client specific capabilities. A `Client` class should be used when connecting to
other clients or a `Presenter`.

### DeviceConnection

When a connection is created between two `Device` peers each `Device` will create an instance
of `DeviceConnection`. This `DeviceConnection` is responsible to keeping the connection alive
handling events, creating connections, closing connections, sending payloads and reciving
payloads. With the right configuration a `DeviceConnection` is self managing.
