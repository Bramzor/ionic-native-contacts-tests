import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';

import { Diagnostic } from '@ionic-native/diagnostic';
import { Contacts, ContactField, ContactName, ContactFindOptions } from '@ionic-native/contacts';

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
    let status = this.requestLocalContactsAccess()
    if (!status) throw new Error('requestLocalContactAccess failed!')
    let test1 = await this.test_createContact()
    console.log("Result of test_createContact:")
    console.log(test1)
    let test2 = await this.test_updateContact()
    console.log("Result of test_updateContact:")
    console.log(test2)
    let test3 = await this.test_removeContact()
    console.log("Result of test_removeContact:")
    console.log(test3)
    let test4 = await this.test_findAfterRemove()
    console.log("Result of test_findAfterRemove:")
    console.log(test4)
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
    contact.phoneNumbers.push(new ContactField("cell", "000 000 0000"))
    contact.note = "Just a test"
    return await contact.save()
  }

  public validate_createContact(contact) {

  }

  public async test_updateContact() {
    let options = new ContactFindOptions()
    options.filter = "John Smith"
    options.multiple = true;
    options.hasPhoneNumber = true;
    let contact = await this.contacts.find(["*"], options)
    if (contact.length < 1) throw new Error('Contact not found after create')
    //if (contact.length > 1) await contact[1].remove()
    let newcontact = contact[0]
    this.testresult["set_name"] = (newcontact.name.givenName === 'John' && newcontact.name.familyName === 'Smith') ? "ok" : "fail"
    this.testresult["set_note"] = (newcontact.note === 'Just a test') ? "ok" : "fail"
    this.testresult["set_email"] = (newcontact.emails && newcontact.emails.length > 0 && newcontact.emails[0].value === 'somemail@example.com') ? "ok" : "fail"
    this.testresult["set_phoneNumbers"] = (newcontact.phoneNumbers && newcontact.phoneNumbers.length === 1 && newcontact.phoneNumbers[0].value === '000 000 0000') ? "ok" : "fail"
    newcontact.name = new ContactName(null, 'Bond', 'James');
    newcontact.note = "Just another test"
    newcontact.emails = []
    newcontact.emails.push(new ContactField("home", "someothermail@example.com"))
    newcontact.phoneNumbers = []
    newcontact.phoneNumbers.push(new ContactField("cell", "000 000 0001"))
    newcontact.urls = []
    newcontact.urls.push(new ContactField("sometype", "http://www.google.be"))
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
    this.testresult["save_name"] = (newcontact.name.givenName === 'James' && newcontact.name.familyName === 'Bond') ? "ok" : "fail"
    this.testresult["save_note"] = (newcontact.note === 'Just another test') ? "ok" : "fail"
    this.testresult["save_email"] = (newcontact.emails && newcontact.emails.length > 0 && newcontact.emails[0].value === 'someothermail@example.com') ? "ok" : "fail"
    this.testresult["save_url"] = (newcontact.urls && newcontact.urls.length > 0 && newcontact.urls[0].value === 'http://www.google.be"') ? "ok" : "fail"
    this.testresult["save_phoneNumbers"] = (newcontact.phoneNumbers && newcontact.phoneNumbers.length === 1 && newcontact.phoneNumbers[0].value === '000 000 0001') ? "ok" : "fail"
    console.log("Find John Smith")
    console.log(contact)
    console.log("Remove")
    //if (contact.length > 1) await contact[1].remove()
    return await contact[0].remove()
  }

  public async test_findAfterRemove() {
    let options = new ContactFindOptions()
    options.filter = "James Bond"
    options.multiple = true;
    options.hasPhoneNumber = true;

    let contact = await this.contacts.find(["*"], options)
    console.log(contact)
    this.testresult["remove_contact"] = (contact.length < 1) ? "ok" : "fail"
    if (contact.length > 0) throw new Error('Contact found')

    return contact
  }

}
