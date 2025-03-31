import { LightningElement, api, wire, track } from 'lwc';
import getPicklistValues from '@salesforce/apex/VolunteerStatus_Indicator_Controller.getPickListValues';
import getVolunteerStatus from '@salesforce/apex/VolunteerStatus_Indicator_Controller.getVolunteerStatus';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import CONTACT_VOLUNTEER_STATUS_FIELD from '@salesforce/schema/Contact.GW_Volunteers__Volunteer_Status__c';

export default class VolunteerStatusIndicator extends LightningElement {
    @api recordId;
    @track steps = [];
    @track currentStep;
    wiredStatusResult;
    wiredPicklistResult;

    // Fetch picklist values for the field
    @wire(getPicklistValues)
    wiredPicklistValues(result) {
        this.wiredPicklistResult = result;
        if (result.data) {
            this.steps = result.data.map(value => ({ label: value, value: value, class: 'slds-progress__marker' }));
            this.updateStepClasses();
        } else if (result.error) {
            console.error('Error fetching picklist values:', result.error);
        }
    }

    // Fetch the current volunteer status for the Contact record in real-time
    @wire(getRecord, { recordId: '$recordId', fields: [CONTACT_VOLUNTEER_STATUS_FIELD] })
    wiredContact(result) {
        this.wiredStatusResult = result;
        if (result.data) {
            const newStatus = result.data.fields.GW_Volunteers__Volunteer_Status__c.value;
            if (newStatus !== this.currentStep) {
                this.currentStep = newStatus;
                this.updateStepClasses();
            }
        } else if (result.error) {
            console.error('Error fetching volunteer status:', result.error);
        }
    }

    // Force refresh when the field value changes
    refreshStatus() {
        refreshApex(this.wiredStatusResult);
    }

    // Update step classes dynamically
    updateStepClasses() {
        if (!this.steps.length || !this.currentStep) return;

        const currentStepIndex = this.steps.findIndex(step => step.value === this.currentStep);

        this.steps = this.steps.map((step, index) => ({
            ...step,
            class: index < currentStepIndex ? 'slds-is-complete'  // Completed steps
                  : index === currentStepIndex ? 'slds-is-active'  // Current step
                  : ''  // Default styling
        }));
    }
}
