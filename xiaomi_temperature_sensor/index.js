const temp_label = document.getElementById('temp');
const temp_label_c = document.getElementById('tempC');
const humid_label = document.getElementById('humid');
const bat_label = document.getElementById('bat');
const connect_btn_div = document.getElementById('btn_div');
const connect_button = document.getElementById('connectButton');
const loader = document.getElementById('loader')


// The remote service we wish to connect to.
const TEMPERATURE_SERVICE_UUID  = "ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6"
const TEMPERATURE_CHAR_UUID = "ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6";

var connect_loader = false;

document.addEventListener('DOMContentLoaded', function () {

  connect_button.addEventListener('click', function () {
    connectToDevice();
  });
});

async function connectToDevice() {
    loader.removeAttribute('hidden');
    try {
      connected_device = await getDevice(["LYW"], [
        TEMPERATURE_SERVICE_UUID,
      ]);

      await connectAndSubscribeToCharacteristics(connected_device);
    } catch(err) {
      console.error('Error during button click operation: ', err);
    }
};

function handle_notifications(event) {
  connect_btn_div.setAttribute("hidden", true);
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  temp = (value.getUint8(0) | value.getUint8(1)<<8) * 0.01;
  temp_label.textContent = temp.toFixed(1)
  temp_label_c.textContent = "ºC"
  humid_label.textContent = "^_^"
  bat_label.textContent = "60"
}

async function connectAndSubscribeToCharacteristics(device) {
  subscribe_characteristic(device, TEMPERATURE_SERVICE_UUID, TEMPERATURE_CHAR_UUID, handle_notifications);
}


// BLE common
function getDevice(name_prefixes, services) {
  return navigator.bluetooth.requestDevice({
    filters: [
      ...name_prefixes.map(name_prefix => ({ namePrefix: name_prefix }))
    ],
    acceptAllDevices: false,
    optionalServices: services
  })
  .then(device => {
    console.log('Connecting to GATT Server...');
    return device.gatt.connect().then(() => device); // return the BluetoothDevice instance
  })
}

async function reconnectToDevice(storedDevice) {
  if (!storedDevice) {
    console.log("No stored device to reconnect");
    return;
  }
  console.log("entered reconnectToDevice")
  try {
    // Get a list of Bluetooth devices the web browser has previously interacted with
    const devices = await navigator.bluetooth.getDevices();

    for (const device of devices) {
      // Find the device with the same id as the stored device
      if (device.id === storedDevice.id) {
        // If device is already connected, return
        if (device.gatt.connected) {
          console.log('Device already connected');
          return device;
        }

        // Otherwise, try to reconnect
        console.log('Reconnecting to GATT Server...');
        await device.gatt.connect();
        console.log('Reconnected to GATT Server');
        return device;
      }
    }
  } catch (error) {
    console.log("Error reconnecting to device: ", error);
  }

  // If we didn't find the device in the list or failed to connect
  console.log("Failed to reconnect to device");
  return null;
}


function disconnect_device(device){
  if (!device) {
    console.log("Device is Null");
    return;
  }
  console.log('Disconnecting from Bluetooth Device: ' + device.name );

  if (device.gatt.connected) {
    mcuManager.disconnect();
    device.gatt.disconnect();
  } else {
    console.log('Bluetooth Device: ' + device.name+ ' is already disconnected');
  }
}

function subscribe_characteristic(device, serviceUUID, characteristicUUID, func) {
  try {
    device.gatt.getPrimaryService(serviceUUID).then(service => { // use the connected GATT server
      return service.getCharacteristics();
    }).then(
      characteristics => {
        characteristics.forEach(characteristic => {
          if (characteristic.uuid === characteristicUUID) {
            console.log('Found the characteristic');

            var myCharacteristic = characteristic;
            myCharacteristic.addEventListener('characteristicvaluechanged',
              func);
            characteristic.startNotifications().then(_ => {
              console.log('> Notifications started');
              myCharacteristic.addEventListener('characteristicvaluechanged',
                func);
            });
          } else{
            console.log('characteristic ' +characteristic.uuid + ' in svc  '+ serviceUUID)
          }
        })
      }
    )
  } catch (error) {
    console.log(error)
  }
}

function getDeviceType(value) {
  // Check out page source to see what valueToDeviceType object is.
  return value +
    (value in valueToDeviceType ? ' (' + valueToDeviceType[value] + ')' : '');
}
