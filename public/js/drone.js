function Drone(id, websocket_url, simulation=false) {
  // loader
  this.loader = new THREE.GLTFLoader();
  this.websocket_url = websocket_url;
  this.model;
  this.ros;
  this.id = id;
  this.global_position_latitude;
  this.global_position_longitude;
  this.global_position_altitude;
  if (simulation)
    this.namespace = '/' + this.id;
  else
    this.namespace = '';

  this.load();
  this.connect();
  this.subscribes();
  this.services();
  this.advertises();
}

Drone.prototype.handleModelLoad = function( gltf ) {
  this.model = gltf.scene;
  /* Math.PI / 2 */
  this.model.rotation.x = Math.PI/2;
  this.model.rotation.z = Math.PI/2;
  this.model.name = this.id;
  scene.add( this.model );
  gltf.animations; // Array<THREE.AnimationClip>
  gltf.scene; // THREE.Scene
  gltf.scenes; // Array<THREE.Scene>
  gltf.cameras; // Array<THREE.Camera>
  gltf.asset; // Object
}

Drone.prototype.load = function () {
  // Load a glTF resource
  this.loader.load(
    '/3dr_arducopter_quad_x.glb',
    this.handleModelLoad.bind(this),
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
}

Drone.prototype._handleConnection = function () {
  console.log(this.ros);
  console.log(this.id + ' Connected to websocket server.');
}

Drone.prototype.connect = function() {
  this.ros = new ROSLIB.Ros({
    // url : 'ws://localhost:9090'
    url : this.websocket_url,
  });

  this.ros.on('connection', this._handleConnection.bind(this));

  this.ros.on('error', function(error) {
    console.log(' Error connecting to websocket server: ', error);
  });

  this.ros.on('close', function() {
    console.log(' Connection to websocket server closed.');

  });
}

Drone.prototype._handleStateMessage = function(message) {
  // add user defined callback
  if (typeof this.handleState === 'function') {
    this.handleState(message);
  }
}

Drone.prototype._handleBatteryMessage = function(message) {
  if (typeof this.handleBattery === 'function') {
    this.handleBattery(message);
  }
}

Drone.prototype._handleLocalPositionMessage = function(message) {
  if (this.model){
    this.model.position.x  = message.pose.position.x * 2
    this.model.position.z  = -message.pose.position.y * 2
    this.model.position.y  = message.pose.position.z * 2
    this.model.rotation.z  = Math.PI/2; //
    if (typeof this.handleLocalPosition === 'function') {
      this.handleLocalPosition(message);
    }
  }
}

Drone.prototype._handleGlobalPositonMessage = function(message) {
  this.global_position_latitude = message.latitude
  this.global_position_longitude = message.longitude
  this.global_position_altitude = message.altitude
}

Drone.prototype._handleStatusTextMessage = function(message) {
  if (typeof this.handleStatusText === 'function') {
    this.handleStatusText(message);
  }
}

Drone.prototype.subscribes = function() {

  // mode
  this.vehicle_state_listener = new ROSLIB.Topic({
    ros : this.ros,
    name : this.namespace + '/mavros/state',
    messageType : 'mavros_msgs/State'
  });

  // uav 1 battery
  this.vehicle_battery_listener = new ROSLIB.Topic({
    ros : this.ros,
    name : this.namespace +'/mavros/battery',
    messageType : 'sensor_msgs/BatteryState'
  });

  // uav 1 pose
  // local
  this.vehicle_local_pose_listener = new ROSLIB.Topic({
    ros : this.ros,
    name : this.namespace +'/mavros/local_position/pose',
    messageType : 'geometry_msgs/PoseStamped'
  });

  // global
  this.vehicle_global_pose_listener = new ROSLIB.Topic({
    ros : this.ros,
    name : this.namespace +'/mavros/global_position/global',
    messageType : 'sensor_msgs/NavSatFix'
  });

  // statustext
  this.vehicle_statustext_listener = new ROSLIB.Topic({
    ros : this.ros,
    name : this.namespace +'/mavros/statustext/recv',
    messageType : 'mavros_msgs/StatusText'
  });

  this.vehicle_state_listener.subscribe(this._handleStateMessage.bind(this));
  this.vehicle_battery_listener.subscribe(this._handleBatteryMessage.bind(this));
  this.vehicle_local_pose_listener.subscribe(this._handleLocalPositionMessage.bind(this));
  this.vehicle_global_pose_listener.subscribe(this._handleGlobalPositonMessage.bind(this));
  this.vehicle_statustext_listener.subscribe(this._handleStatusTextMessage.bind(this));
}

Drone.prototype.armEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Arming');

  var vehicle_arming_request = new ROSLIB.ServiceRequest({
    value: true,
  });

  service_client.callService(vehicle_arming_request,
                            function(request)
                            {
                              console.log('Arming Result:' + request.result);
                            });
}

Drone.prototype.disarmEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Disarmed');

  var vehicle_disarm_request = new ROSLIB.ServiceRequest({
    value: false,
  });

  service_client.callService(vehicle_disarm_request, function(request)
                             {
                               console.log('Disarm Result' + request.result);
                             });
}

Drone.prototype.disarmMouseDownEventHandle = function(event) {
  event.preventDefault();
  this.disarmButtonDowntime = new Date();
}

Drone.prototype.disarmMouseUpEventHandle = function(service_client, event) {
  event.preventDefault();
  this.disarmButtonUptime = new Date();
  var delta = (this.disarmButtonUptime - this.disarmButtonDowntime) / 1000.0;
  if (1.0 <= delta && delta <= 3.0) {
    this.disarmEventHandle(service_client, event);
  } else {
    console.log(this.id + ' is not Disarmed. Press time of button' + ''
                + ' should be 1.0~3.0 sec. Press time was '+ delta);

  }
}


Drone.prototype.takeoffEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Takeoff');


  if (this.global_position_latitude > 0 && this.global_position_latitude > 0) {
    // takeoff request
    var vehicle_takeoff_request = new ROSLIB.ServiceRequest({
      min_pitch: 0.0,
      yaw: 0.0,
      latitude: this.global_position_latitude,
      longitude: this.global_position_longitude,
      altitude: 1.5
    });

    service_client.callService(vehicle_takeoff_request, function(request)
                               {
                                 console.log('Takeoff' + request.result);
                               });
  }
}


Drone.prototype.landEventHandle = function(service_client, event) {
    event.preventDefault();
    console.log(this.id + ' Land');

  if (this.global_position_latitude > 0 && this.global_position_latitude > 0) {
    // land request
    var vehicle_land_request = new ROSLIB.ServiceRequest({
      min_pitch: 0.0,
      yaw: 0.0,
      latitude: this.global_position_longitude,
      longitude: this.global_position_longitude,
      altitude: 0.0
    });

    service_client.callService(vehicle_land_request, function(request)
                               {
                                 console.log('Land' + request.result);
                               });
  }
}


Drone.prototype.playEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Play');
  console.log(this.global_position_longitude, this.global_position_latitude);

  if (this.global_position_latitude > 0 && this.global_position_latitude > 0) {
    // play request
    var vehicle_play_request = new ROSLIB.ServiceRequest({});

    service_client.callService(vehicle_play_request, function(request)
                               {
                                 console.log('Play ' + request.success);
                               });
  }
}

Drone.prototype.readyEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Ready');
  console.log(this.global_position_longitude, this.global_position_latitude);

  if (this.global_position_latitude > 0 && this.global_position_latitude > 0) {
    // ready request
    var vehicle_ready_request = new ROSLIB.ServiceRequest({});

    service_client.callService(vehicle_ready_request, function(request)
                               {
                                 console.log('Ready ' + request.success);
                               });
  }
}



Drone.prototype.stopEventHandle = function(service_client, event) {
  event.preventDefault();
  console.log(this.id + ' Stop');

  if (this.global_position_latitude > 0 && this.global_position_latitude > 0) {
    // stop request
    var vehicle_stop_request = new ROSLIB.ServiceRequest({});

    service_client.callService(vehicle_stop_request, function(request)
                               {
                                 console.log('Stop ' + request.success);
                               });
  }
}


Drone.prototype.services = function() {

  // arming, disarm client
  var vehicle_arming_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/mavros/cmd/arming',
    messageType: 'mavros_msg/CommandBool'
  });

  // arming, disarm client
  var vehicle_disarm_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/mavros/cmd/arming',
    messageType: 'mavros_msg/CommandBool'
  });

  // takeoff client
  var vehicle_takeoff_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/mavros/cmd/takeoff',
    messageType: 'mavros_msg/CommandTOL'
  });

  // land client
  var vehicle_land_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/mavros/cmd/land',
    messageType: 'mavros_msg/CommandTOL'
  });

  // play client
  var vehicle_play_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/swam/play',
    messageType: 'std_srvs/Trigger'
  });

  // stop client
  var vehicle_stop_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/swam/stop',
    messageType: 'std_srvs/Trigger'
  });

  // ready client
  var vehicle_ready_client = new ROSLIB.Service( {
    ros: this.ros,
    name: this.namespace +'/swam/ready',
    messageType: 'std_srvs/Trigger'
  });

  // arm button
  var vehicle_arm_button = document.getElementById(this.id + '-arm');
  vehicle_arm_button.addEventListener('click',
                                             this.armEventHandle.bind(this,vehicle_arming_client));

  // disarm button
  var vehicle_disarm_button = document.getElementById(this.id + '-disarm');

  // vehicle_disarm_button.addEventListener('click',
  //                                     this.disarmEventHandle.bind(this,vehicle_disarm_client));

  vehicle_disarm_button.addEventListener('mousedown',
                                      this.disarmMouseDownEventHandle.bind(this));

  vehicle_disarm_button.addEventListener('mouseup',
                                      this.disarmMouseUpEventHandle.bind(this,vehicle_disarm_client));

  // takeoff button
  var vehicle_takeoff_button = document.getElementById(this.id + '-takeoff');
  vehicle_takeoff_button.addEventListener('click',
                                       this.takeoffEventHandle.bind(this, vehicle_takeoff_client));

  // land button
  var vehicle_land_button = document.getElementById(this.id + '-land');
  vehicle_land_button.addEventListener('click',
                                       this.landEventHandle.bind(this,vehicle_land_client));

  // play button
  var vehicle_play_button = document.getElementById(this.id + '-play');
  vehicle_play_button.addEventListener('click',
                                       this.playEventHandle.bind(this, vehicle_play_client));

  // stop button
  var vehicle_stop_button = document.getElementById(this.id + '-stop');
  vehicle_stop_button.addEventListener('click',
                                      this.stopEventHandle.bind(this,vehicle_stop_client));

  // timeline ready button
  var vehicle_ready_button = document.getElementById(this.id + '-timeline-ready');
  vehicle_ready_button.addEventListener('click',
                                       this.readyEventHandle.bind(this, vehicle_ready_client));
}

Drone.prototype.setGoalHandle = function(pub_topic, event) {
  event.preventDefault();

  var goal_x = document.getElementById(this.id + '-goal-x').value;
  var goal_y = document.getElementById(this.id + '-goal-y').value;
  var goal_z = document.getElementById(this.id + '-goal-z').value;

  var pose = new ROSLIB.Message( {
    pose: {
      position: {
        x: Number(goal_x),
        y: Number(goal_y),
        z: Number(goal_z)
      },
      orientation: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 0.0
      }
    }
  });

  pub_topic.publish(pose);
}

Drone.prototype.setPosition = function(x, y, z) {
  var vehicle_goal_topic = new ROSLIB.Topic( {
    ros: this.ros,
    name: this.namespace +'/swam/goal',
    messageType: 'geometry_msgs/PoseStamped'
  });

  var pose = new ROSLIB.Message( {
    pose: {
      position: {
        x: x,
        y: y,
        z: z
      },
      orientation: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 0.0
      }
    }
  });

  vehicle_goal_topic.publish(pose);
}

Drone.prototype.advertises = function() {
  // Goal
  var vehicle_goal_topic = new ROSLIB.Topic( {
    ros: this.ros,
    name: this.namespace +'/swam/goal',
    messageType: 'geometry_msgs/PoseStamped'
  });

  var vehicle_set_position_button = document.getElementById(this.id + '-set-position');
  vehicle_set_position_button.addEventListener('click',
                                               this.setGoalHandle.bind(this,vehicle_goal_topic));
}


Drone.prototype.timelinePlay = function() {
     var uav1_timeline_data = JSON.parse(localStorage.getItem('timeliner-'+this.id));
     var uav1_number_of_markers = uav1_timeline_data.layers[0].values.length;
     var uav1_timeline = [];

     for(var i = 0; i < uav1_number_of_markers; i++) {
       var time = uav1_timeline_data.layers[0].values[i].time;
       var x = uav1_timeline_data.layers[0].values[i].value;
       var y = uav1_timeline_data.layers[1].values[i].value;
       var z = uav1_timeline_data.layers[2].values[i].value;

       uav1_timeline.push({
         time: time,
         x: x,
         y: y,
         z: z,
       });
     }

     for(var i = 0; i < uav1_number_of_markers; i++) {
       var time = uav1_timeline[i].time;
       var x = uav1_timeline[i].x;
       var y = uav1_timeline[i].y;
       var z = uav1_timeline[i].z;
       var drone = this;
       setTimeout(function(i, _x,_y,_z) {
         drone.setPosition(_x, _y, _z);
         var progress = document.getElementById(drone.id + '-progress');
         progress.value = i / uav1_timeline.length
       }, time * 1000,i+1, x,y,z);
   }
}
