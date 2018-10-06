# @ionic-native/Contacts Test App

This Test app was created to easily test the ionic-native/contacts functionality. Was created after noticing that the save() function did not work for emails, phoneNumbers, urls, ims, ... Simply everything that uses an array to save the contact his content.

## Getting Started

Simply git clone this repo and use "ionic cordova emulate ios" to test in the emulator. After providing access to your contacts, you will see testing results that should look simular to:

![alt text](https://raw.githubusercontent.com/Bramzor/ionic-native-contacts-tests/master/test_app_screenshot.png)

### Prerequisites

Not many. I tested on IOS only, not sure what the test results would be on Android but I do expect the same.

```
ionic cordova plugin add cordova-plugin-contacts
ionic cordova plugin add cordova.plugins.diagnostic
npm install
ionic cordova emulate ios
```
