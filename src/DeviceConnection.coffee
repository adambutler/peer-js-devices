class DeviceConnection

  # Is the connection currently open.
  connectionLive: false

  # Storage for events. See `on` and `callEvent`.
  events: {}

  # This is the timeout duration in milliseconds to attempt reconnects by.
  timeout: 2000

  # Debug mode will produce more verbose outpout to the console.
  debug: true

  # The on method can be used to subscribe to any event these events are fired
  # by the callEvent method.
  on: (eventType, callback) ->
    @events[eventType] = [] unless @events[eventType]? 
    @events[eventType].push callback

  # The callEvent method is used to call events in the DeviceConnection events
  # object. These are added by the on method.
  callEvent: (eventType, data) ->
    data = {} unless data?
    if @events[eventType]?
      event(data) for event in @events[eventType]

  # The setupEvents method is called once a DeviceConnection connection is
  # created. This can either be on the constructor or the dial method.
  setupEvents: ->
    console.log "DeviceConnection - setupEvents" if @debug
    @connection.on 'error', @connectionError
    @connection.on 'close', @connectionClose
    @connection.on 'open', @connectionOpen
    @connection.on 'data', @connectionData

  # The closeConnection method can be called to hangup on the connection of
  # the DeviceConnection.
  closeConnection: (autoreconnect = false) ->
    @autoreconnect = autoreconnect if autoreconnect?
    @connection.close()

    @callEvent 'connectionClose'

  # The connectionData method is called when the error event is fired on the
  # connection of the DeviceConnection.
  connectionData: (data) =>
    setTimeout((=> @connection.send('pong')), 1000) if data is 'ping'
    setTimeout((=> @connection.send('ping')), 1000) if data is 'pong'
    console.log "Got data", data

    @callEvent 'connectionData', data

  # The connectionError method is called when the error event is fired on the
  # connection of the DeviceConnection.
  connectionError: (err) =>
    @connectionLive = false
    @connect() if @autoreconnect
    console.log "An error ooccurred", err if @debug

    @callEvent 'connectionClose', err

  # The connectionClose method is called when the close event is fired on the
  # connection of the DeviceConnection.
  connectionClose: =>
    @connectionLive = false
    @connect() if @autoreconnect
    console.log "Connection closed"

    @callEvent 'connectionClose'

  # The connectionOpen method is called when the `open` event is fired on the
  # connection of the DeviceConnection.
  connectionOpen: =>

    # The connection is now `live`.
    @connectionLive = true

    # Clear the timer if one is present, this usually only  applies to a
    # DeviceConnection that is a host. 
    clearTimeout(@timer) if @timer?

    # Log is debug mode is on.
    console.log "Connection open" if @debug

    # Call the connectionOpen event.
    @callEvent 'connectionOpen'

  # In certain conditions the connection of the DeviceConnection may drop
  # unexpectedly or the host may not be reachable at the time of connecting.
  # In these cases the setupTimout method is called to try and reconnect to
  # the remote peer.
  setupTimeout: ->
    @timer = setTimeout =>
      @connect() unless @connectionLive
    , @timeout

  # The dial method is used to attempt a connection to a remote peer. It will
  # also setup events and the timeout should the DeviceConnection be
  # configured to do so.
  dial: (@remoteID) ->
    console.log "Client #{@device.id} connecting to peer - #{@remoteID}"
    @connection = @device.peer.connect(@remoteID)
    @setupEvents()
    @setupTimeout() if @autoreconnect

  # The send method is used to send a payload to live connected peer. The
  # payload can be any data object such as a string, an object or an array.
  send: (data) ->
    console.log "Sending data", data
    @connection.send(data)

  # The constructor is called when an instance of DeviceConnection is created
  # it accepts the following parameters -
  #
  # @param device <Device> - The device that this Device reques belongs to.
  #
  # @param connection <DataConnection> - | A data connection that is already
  #                                      | been initiated.
  #
  # @param autoreconnect <Boolean> - | A boolean to configure if the 
  #                                  | connection should attempt to reconnect 
  #                                  | on close, error or failure to reach 
  #                                  | peer.
  constructor: (@device, @connection, @autoreconnect = true) ->

    # If the DeviceConnection is initiated with a connection we should setup
    # events for it.
    @setupEvents() if @connection?

    # If the DeviceConnection is initiated with a connection we should not be
    # in charge of maintaining the connection. Therefor autoreconnect is
    # set to false.
    @autoreconnect = !@connection?

# Export this classes to exports or the window depending on environment.
root = exports ? this
root.DeviceConnection = DeviceConnection
