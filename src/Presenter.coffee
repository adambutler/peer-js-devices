class Presenter extends Device

  # A method to help easily distinguish between a Presenter and a Client.
  ping: ->
    console.log 'Pong said the presenter'

# Export this classes to exports or the window depending on environment.
root = exports ? this
root.Presenter = Presenter
