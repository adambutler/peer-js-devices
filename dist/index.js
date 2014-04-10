(function() {
  var Client, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Client = (function(_super) {
    __extends(Client, _super);

    function Client() {
      return Client.__super__.constructor.apply(this, arguments);
    }

    Client.prototype.ping = function(payload, interval, qty) {
      if (payload == null) {
        payload = 'ping';
      }
      if (interval == null) {
        interval = 5000;
      }
      if (qty == null) {
        qty = false;
      }
      this.pingQueue = qty;
      return this.pingTimer = setInterval((function(_this) {
        return function() {
          var deviceConnection, _i, _len, _ref;
          if (_this.pingQueue === false || _this.pingQueue > 0) {
            console.log("Sending payload - " + payload);
            _ref = _this.deviceConnections;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              deviceConnection = _ref[_i];
              deviceConnection.connection.send(payload);
            }
            if (_this.pingQueue !== false) {
              return _this.pingQueue = _this.pingQueue - 1;
            }
          } else {
            return clearTimeout(_this.pingTimer);
          }
        };
      })(this), interval);
    };

    return Client;

  })(Device);

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Client = Client;

}).call(this);

(function() {
  var Device, root;

  Device = (function() {
    Device.prototype.deviceConnections = [];

    function Device(id, host, port) {
      this.id = id;
      this.host = host != null ? host : '127.0.0.1';
      this.port = port != null ? port : 9000;
      if (this.id == null) {
        this.id = null;
      }
      this.peer = new Peer(this.id, {
        host: this.host,
        port: this.port
      });
      this.setupEvents();
    }

    Device.prototype.setupEvents = function() {
      return this.peer.on("connection", (function(_this) {
        return function(connection) {
          var deviceConnection;
          deviceConnection = new DeviceConnection(_this, connection);
          return _this.deviceConnections.push(deviceConnection);
        };
      })(this));
    };

    Device.prototype.createDeviceConnection = function() {
      var deviceConnection;
      deviceConnection = new DeviceConnection(this);
      this.deviceConnections.push(deviceConnection);
      return deviceConnection;
    };

    return Device;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Device = Device;

}).call(this);

(function() {
  var DeviceConnection, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DeviceConnection = (function() {
    DeviceConnection.prototype.connectionLive = false;

    DeviceConnection.prototype.events = {};

    DeviceConnection.prototype.timeout = 2000;

    DeviceConnection.prototype.debug = true;

    DeviceConnection.prototype.on = function(eventType, callback) {
      if (this.events[eventType] == null) {
        this.events[eventType] = [];
      }
      return this.events[eventType].push(callback);
    };

    DeviceConnection.prototype.callEvent = function(eventType) {
      var event, _i, _len, _ref, _results;
      if (this.events[eventType] != null) {
        _ref = this.events[eventType];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          _results.push(event());
        }
        return _results;
      }
    };

    DeviceConnection.prototype.setupEvents = function() {
      if (this.debug) {
        console.log("DeviceConnection - setupEvents");
      }
      this.connection.on('error', this.connectionError);
      this.connection.on('close', this.connectionClose);
      this.connection.on('open', this.connectionOpen);
      return this.connection.on('data', this.connectionData);
    };

    DeviceConnection.prototype.closeConnection = function(autoreconnect) {
      if (autoreconnect == null) {
        autoreconnect = false;
      }
      if (autoreconnect != null) {
        this.autoreconnect = autoreconnect;
      }
      return this.connection.close();
    };

    DeviceConnection.prototype.connectionData = function(data) {
      if (data === 'ping') {
        setTimeout(((function(_this) {
          return function() {
            return _this.connection.send('pong');
          };
        })(this)), 1000);
      }
      if (data === 'pong') {
        setTimeout(((function(_this) {
          return function() {
            return _this.connection.send('ping');
          };
        })(this)), 1000);
      }
      return console.log("Got data", data);
    };

    DeviceConnection.prototype.connectionError = function(err) {
      this.connectionLive = false;
      if (this.autoreconnect) {
        this.connect();
      }
      console.log("An error ooccurred");
      return console.log(e);
    };

    DeviceConnection.prototype.connectionClose = function() {
      this.connectionLive = false;
      if (this.autoreconnect) {
        this.connect();
      }
      return console.log("Connection closed");
    };

    DeviceConnection.prototype.connectionOpen = function() {
      this.connectionLive = true;
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      if (this.debug) {
        console.log("Connection open");
      }
      return this.callEvents('connectionOpen');
    };

    DeviceConnection.prototype.setupTimeout = function() {
      return this.timer = setTimeout((function(_this) {
        return function() {
          if (!_this.connectionLive) {
            return _this.connect();
          }
        };
      })(this), this.timeout);
    };

    DeviceConnection.prototype.dial = function(remoteID) {
      this.remoteID = remoteID;
      console.log("Client " + this.device.id + " connecting to peer - " + this.remoteID);
      this.connection = this.device.peer.connect(this.remoteID);
      this.setupEvents();
      if (this.autoreconnect) {
        return this.setupTimeout();
      }
    };

    DeviceConnection.prototype.send = function(data) {
      console.log("Sending data", data);
      return this.connection.send(data);
    };

    function DeviceConnection(device, connection, autoreconnect) {
      this.device = device;
      this.connection = connection;
      this.autoreconnect = autoreconnect != null ? autoreconnect : true;
      this.connectionOpen = __bind(this.connectionOpen, this);
      this.connectionClose = __bind(this.connectionClose, this);
      this.connectionError = __bind(this.connectionError, this);
      this.connectionData = __bind(this.connectionData, this);
      if (this.connection != null) {
        this.setupEvents();
      }
      this.autoreconnect = this.connection == null;
    }

    return DeviceConnection;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.DeviceConnection = DeviceConnection;

}).call(this);

(function() {
  var Presenter, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Presenter = (function(_super) {
    __extends(Presenter, _super);

    function Presenter() {
      return Presenter.__super__.constructor.apply(this, arguments);
    }

    Presenter.prototype.ping = function() {
      return console.log('Pong said the presenter');
    };

    return Presenter;

  })(Device);

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Presenter = Presenter;

}).call(this);
