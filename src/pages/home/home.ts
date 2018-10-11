import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';
import { Contacts, ContactField, ContactName, ContactFindOptions, ContactAddress } from '@ionic-native/contacts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  testresult = {
    "set_name": "pending",
    "set_note": "pending"
  }

  constructor(public platform:Platform, private diagnostic: Diagnostic, private contacts: Contacts) {
    platform.ready().then(() => {
      if (!window['cordova']) throw new Error('cordova not available, please run in emulator or on device')
      this.startTesting()
    })
  }

  public async startTesting() {
    let cleanup = await this.cleanupPreviousTests("James Bond")
    let cleanup2 = await this.cleanupPreviousTests("John Smith")

    let status = this.requestLocalContactsAccess()
    if (!status) throw new Error('requestLocalContactAccess failed!')
    let test1 = await this.test_createContact()
    console.log("Result of test_createContact:")
    console.log(test1)
    let validate1 = await this.validate_createContact()
    console.log("Result of validate_createContact:")
    console.log(validate1)
    let test2 = await this.test_updateContact()
    console.log("Result of test_updateContact:")
    console.log(test2)
    let validate2 = await this.validate_updateContact()
    console.log("Result of validate_updateContact:")
    console.log(validate2)
    let test3 = await this.test_removeContact()
    console.log("Result of test_removeContact:")
    console.log(test3)
    let validate3 = await this.validate_removeContact()
    console.log("Result of validate_removeContact:")
    console.log(validate3)
  }

  public async requestLocalContactsAccess() {
    let requestaccess = await this.diagnostic.requestContactsAuthorization()
    if (requestaccess === this.diagnostic.permissionStatus.GRANTED) {
      console.log("Access GRANTED")
      return true
    } else {
      console.log("Access NOT AUTHORIZED")
      return false
    }
  }

  public async test_createContact() {
    let contact = this.contacts.create();
    console.log(contact)
    contact.name = new ContactName(null, 'Smith', 'John');
    if (!contact.emails) contact.emails = []
    contact.emails.push(new ContactField("home", "somemail@example.com"))
    if (!contact.phoneNumbers) contact.phoneNumbers = []
    contact.phoneNumbers.push(new ContactField("mobile", "6471234567"))
    if (!contact.addresses) contact.addresses = []
    contact.addresses.push(new ContactAddress(true, "home", "123 Some Address, USA", "123 Some Address", "City", "State", "PostalCode", "USA"))
    if (!contact.photos) contact.photos = []
    contact.photos.push(new ContactField('base64', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8n8HwHwAGPQJompRClgAAAABJRU5ErkJggg==", true))
    contact.note = "Just a test"
    let birthday = new Date('1980-11-01T00:00:00')
    console.log(birthday)
    let userTimezoneOffset = birthday.getTimezoneOffset() * 60000;
    contact.birthday = new Date(birthday.getTime() - userTimezoneOffset)
    console.log(contact.birthday)
    return await contact.save()
  }

  public async test_updateContact() {
    let options = new ContactFindOptions()
    options.filter = "John Smith"
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    if (contact.length < 1) throw new Error('Contact not found after create')
    let newcontact = contact[0]
    newcontact.name = new ContactName(null, 'Bond', 'James');
    newcontact.note = "Just another test"
    newcontact.emails = []
    newcontact.emails.push(new ContactField("home", "someothermail@example.com"))
    //newcontact.emails.push({"value":"someothermail@example.com","pref":false,"id":0,"type":"home"})
    newcontact.phoneNumbers = []
    newcontact.phoneNumbers.push(new ContactField("mobile", "6471234560"))
    newcontact.addresses = []
    newcontact.addresses.push(new ContactAddress(true, "home", "124 Some Address, USA", "124 Some Address", "City", "State", "PostalCode", "USA"))
    newcontact.photos = []
    newcontact.photos.push(new ContactField('base64', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsmPbtPwAGlwMFN7v/WQAAAABJRU5ErkJggg==", true))
    newcontact.urls = []
    newcontact.urls.push(new ContactField("sometype", "http://www.google.be"))
    let birthday = new Date('1970-01-01T00:00:00')
    console.log(birthday)
    let userTimezoneOffset = birthday.getTimezoneOffset() * 60000;
    newcontact.birthday = new Date(birthday.getTime() - userTimezoneOffset)
    console.log(newcontact.birthday)
    return await newcontact.save()
  }

  public async test_removeContact() {
    let options = new ContactFindOptions()
    options.filter = "James Bond"
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    if (contact.length < 1) throw new Error('Contact not found after update')
    let newcontact = contact[0]
    console.log("Find John Smith")
    console.log(contact)
    console.log("Remove")
    if (contact.length > 1) await contact[1].remove()
    return await contact[0].remove()
  }

  public async cleanupPreviousTests(filter: string) {
    let options = new ContactFindOptions()
    options.filter = filter
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    contact.forEach(async (item) => {
      console.log("Removing contact: " + item.id + " with name: " + item.name)
      await item.remove()
    })
    return true
  }



  public async validate_createContact() {
    console.log("starting validate_createContact")
    let options = new ContactFindOptions()
    options.filter = "John Smith"
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    if (contact.length < 1) throw new Error('Contact not found after create')
    //if (contact.length > 1) await contact[1].remove()
    let newcontact = contact[0]["_objectInstance"]
    this.testresult["set_name"] = (newcontact.name.givenName === 'John' && newcontact.name.familyName === 'Smith') ? "ok" : "fail"
    this.testresult["set_note"] = (newcontact.note === 'Just a test') ? "ok" : "fail"
    this.testresult["set_email"] = (newcontact.emails && newcontact.emails.length > 0 && newcontact.emails[0].value === 'somemail@example.com') ? "ok" : "fail"
    this.testresult["set_phoneNumbers"] = (newcontact.phoneNumbers && newcontact.phoneNumbers.length === 1 && newcontact.phoneNumbers[0].value === '6471234567') ? "ok" : "fail"
    this.testresult["set_address"] = (newcontact.addresses && newcontact.addresses.length === 1 && newcontact.addresses[0].streetAddress === '123 Some Address') ? "ok" : "fail"
    this.testresult["set_photo"] = (newcontact.photos && newcontact.photos.length === 1) ? "ok" : "fail"
    this.testresult["set_birthday"] = (newcontact.birthday && newcontact.birthday && newcontact.birthday.toISOString().slice(0, 10) == '1980-11-01') ? "ok" : "fail"
    console.log("set_birthday: "+ newcontact.birthday.toString())
    console.log("starting validate_createContact done")
    return contact
  }

  public async validate_updateContact() {
    console.log("starting validate_updateContact")
    let options = new ContactFindOptions()
    options.filter = "James Bond"
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    console.log(contact)
    if (contact.length < 1) throw new Error('Contact not found after update')
    let newcontact = contact[0]["_objectInstance"]
    console.log("newcontact: " + JSON.stringify(newcontact))
    this.testresult["save_name"] = (newcontact.name.givenName === 'James' && newcontact.name.familyName === 'Bond') ? "ok" : "fail"
    this.testresult["save_note"] = (newcontact.note === 'Just another test') ? "ok" : "fail"
    this.testresult["save_email"] = (newcontact.emails && newcontact.emails.length > 1 && newcontact.emails[1].value === 'someothermail@example.com') ? "ok" : "fail"
    this.testresult["save_url"] = (newcontact.urls && newcontact.urls.length > 0 && newcontact.urls[0].value === 'http://www.google.be') ? "ok" : "fail"
    this.testresult["save_phoneNumbers"] = (newcontact.phoneNumbers && newcontact.phoneNumbers.length > 1 && newcontact.phoneNumbers[1].value === '6471234560') ? "ok" : "fail"
    this.testresult["save_address"] = (newcontact.addresses && newcontact.addresses.length > 1 && newcontact.addresses[1].streetAddress === '124 Some Address') ? "ok" : "fail"
    this.testresult["save_birthday"] = (newcontact.birthday && newcontact.birthday && newcontact.birthday.toISOString().slice(0, 10) == '1970-01-01') ? "ok" : "fail"
    console.log("set_birthday: "+ newcontact.birthday.toString())
    console.log("starting validate_updateContact done")
    return contact
  }

  public async validate_removeContact() {
    console.log("starting validate_removeContact")
    let options = new ContactFindOptions()
    options.filter = "James Bond"
    options.multiple = true;
    options.hasPhoneNumber = true;

    let contact = await this.contacts.find(["*"], options)
    console.log(contact)
    this.testresult["remove_contact"] = (contact.length < 1) ? "ok" : "fail"
    if (contact.length > 0) throw new Error('Contact found')
    console.log("starting validate_removeContact done")
    return contact
  }

}
