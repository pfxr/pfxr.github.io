// The remote service we wish to connect to.
const TEMPERATURE_SERVICE_UUID  = "ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6"
const TEMPERATURE_CHAR_UUID = "ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6";

document.addEventListener('DOMContentLoaded', function () {
  const connectButton = document.getElementById('connectButton');

  connectButton.addEventListener('click', function () {
    connectToDevice();
  });
});

async function connectToDevice() {
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
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  temp = (value.getUint8(0) | value.getUint8(1)<<8) * 0.01;
  console.log(temp);
}

//function handle_notifications(event) {
//  let value = event.target.value;
//  console.log(value)
//
//  let temp = (value.getInt32(0, true));// | (value.getInt32(1, true) << 8)) * 0.01; //little endian
//  let humi = value[2];
//  let voltage = (value[3] | (value[4] << 8)) * 0.001; //little endian
//
//  console.log(temp);
//}

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

function unsubscribe_characteristic(device, serviceUUID, characteristicUUID, func) {
  try {
    device.gatt.getPrimaryService(serviceUUID).then(service => { // use the connected GATT server
      return service.getCharacteristics();
    }).then(
      characteristics => {
        characteristics.forEach(characteristic => {
          if (characteristic.uuid === characteristicUUID) {
            console.log('Found the characteristic');

            var myCharacteristic = characteristic;
            myCharacteristic.removeEventListener('characteristicvaluechanged', func);
            characteristic.stopNotifications().then(_ => {
              console.log('> Notifications stopped');
            });
          } else {
            console.log('characteristic ' + characteristic.uuid + ' in svc  ' + serviceUUID)
          }
        })
      }
    )
  } catch (error) {
    console.log(error)
  }
}


function write_characteristic(device, serviceUUID, characteristicUUID, cmd) {
  const textEncoder = new TextEncoder();
  console.log("writing " + cmd)
  try {
    device.getPrimaryService(serviceUUID).then(service => {
      return service.getCharacteristics();
    }).then(
      characteristics => {
        characteristics.forEach(characteristic => {
          if (characteristic.uuid === characteristicUUID) {
            characteristic.writeValueWithoutResponse(textEncoder.encode(cmd));
          }
        })
      }
    )
  } catch (error) {
    console.log(error)
  }

}

function readAppearanceValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Appearance: ' +
      getDeviceType(value.getUint16(0, true /* Little Endian */)));
  });
}

function readDeviceNameValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Device Name: ' + new TextDecoder().decode(value));
  });
}

function readPPCPValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Peripheral Preferred Connection Parameters: ');
    console.log('  > Minimum Connection Interval: ' +
      (value.getUint8(0) | value.getUint8(1) << 8) * 1.25 + 'ms');
    console.log('  > Maximum Connection Interval: ' +
      (value.getUint8(2) | value.getUint8(3) << 8) * 1.25 + 'ms');
    console.log('  > Latency: ' +
      (value.getUint8(4) | value.getUint8(5) << 8) + 'ms');
    console.log('  > Connection Supervision Timeout Multiplier: ' +
      (value.getUint8(6) | value.getUint8(7) << 8));
  });
}

function readCentralAddressResolutionSupportValue(characteristic) {
  return characteristic.readValue().then(value => {
    let supported = value.getUint8(0);
    if (supported === 0) {
      console.log('> Central Address Resolution: Not Supported');
    } else if (supported === 1) {
      console.log('> Central Address Resolution: Supported');
    } else {
      console.log('> Central Address Resolution: N/A');
    }
  });
}

function readPeripheralPrivacyFlagValue(characteristic) {
  return characteristic.readValue().then(value => {
    let flag = value.getUint8(0);
    if (flag === 1) {
      console.log('> Peripheral Privacy Flag: Enabled');
    } else {
      console.log('> Peripheral Privacy Flag: Disabled');
    }
  });
}

/* Utils */

function getDeviceType(value) {
  // Check out page source to see what valueToDeviceType object is.
  return value +
    (value in valueToDeviceType ? ' (' + valueToDeviceType[value] + ')' : '');
}

function populateBluetoothDevices(supported_prefixes) {
  try {
    const devicesSelect = document.querySelector('#devicesSelect');
    console.log('Getting existing permitted Bluetooth devices...');
    navigator.bluetooth.getDevices()
      .then(devices => {
        console.log('> Got ' + devices.length + ' Bluetooth devices.');
        devicesSelect.textContent = '';
        for (const device of devices) {

          //check if the device names starts with the supported prefix
          if (!supported_prefixes.some(prefix => device.name.startsWith(prefix))) {
            continue;
          }

          const option = document.createElement('option');
          option.value = device.id;
          option.textContent = device.name;
          devicesSelect.appendChild(option);
        }
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }
  catch {
    //not supported
    console.log("Not supported")
  }

}
