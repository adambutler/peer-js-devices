class Client extends Device

  # The method ping allows a payload to be sent to all connected peers on an
  # interval and for a specific (or infinite) quantity of itterations. It
  # accepts the following parameters -
  #
  # @param payload <*> - Can be any data to send to the connected peers
  #
  # @param interval <Integer> - The interval that the payload will be sent by.
  #
  # @param port <*> - | The quantity of times to send the payload. If this
  #                   | value is false then the payload will be sent
  #                   | indefinitely.
  ping: (payload = 'ping', interval = 5000, qty = false) ->

    @pingQueue = qty

    @pingTimer = setInterval =>
      if @pingQueue == false or @pingQueue > 0
        console.log "Sending payload - #{payload}"
        for deviceConnection in @deviceConnections
          deviceConnection.connection.send payload 
        @pingQueue = @pingQueue - 1 if @pingQueue != false
      else
        clearTimeout(@pingTimer)
    , interval

# Export this classes to exports or the window depending on environment.
root = exports ? this
root.Client = Client
