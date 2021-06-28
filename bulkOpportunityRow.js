import { api, track } from 'lwc';
import PubSubElement from 'c/pubSubElement';
import { ChangeDetector } from 'c/utils';
import deleteOpp from '@salesforce/apex/S_BulkOpportunityEditor.deleteOpp';

export default class BulkOpportunityRow extends PubSubElement {
    @api parentId;
    @api opp;
    @api canDelete;
    @track _amount;
    @track products;
    @track closeDateShown = true;
    @track stageNameShown = true;
    @track lossReasonShown = true;
    @track relatedInstallCaseShown = true;

    @track fields = ['CloseDate', 'StageName','Loss_Reason__c','Related_Installation_Case__c'];
    get colClass() {
        return `slds-col slds-size_1-of-${this.fields.length}`;
    }

    renderedCallback() {
        let self = this;
        if ('function' === typeof super.renderedCallback && !self._rendered) super.renderedCallback();
        if (self._rendered) return;

        self.products = (self.opp.OpportunityLineItems || []).map((li) => new ChangeDetector(li));
        self._amount = self.products.reduce((r, l) => r + l.TotalPrice, 0);

        self.subscribe(`oppRowSaveChanges/${self.opp.AccountId}:${self.opp.Id}`, (evt) => {
            self.changedLIs.forEach((li) => {
                self.publish(`oppProductRowSaveChanges/${li.Id}`);
            });

            self.template.querySelectorAll('lightning-record-edit-form')[0].submit();
        });

        self.subscribe(`oppSyncChange/${self.opp.Id}`, (evt) => {
            let opp = Object.assign({}, self.opp),
                payload = evt.payload;
            if (payload.field.indexOf('/') < 0) {
                opp[payload.field] = payload.value;
                self.opp = opp;

                // self._amount = self.opp.Amount;
                console.log('Payload field ',payload.field);
                switch (payload.field) {
                    case 'CloseDate':
                        self.closeDateShown = false;
                        break;
                    case 'StageName':
                        self.stageNameShown = false;
                        break;
                    case 'Loss_Reason__c':
                        self.lossReasonShown = false;
                        break;                  
                    case 'Related_Installation_Case__c':
                        self.relatedInstallCaseShown = false;
                        break;
                }
                setTimeout(() => {
                    self.closeDateShown = true;
                    self.stageNameShown = true;
                    self.lossReasonShown = true;                    
                    self.relatedInstallCaseShown = true;
                });
            } else {
                let [prodId, field] = payload.field.split('/');
                let li = self.products.find((li) => li.Product2Id == prodId);
                li[field] = payload.field;
                self.publish(`oppProdSyncChange/${self.opp.Id}/${prodId}`, { field, value: payload.value });
            }
        });

        self.subscribe(`oppProductRowChange/${self.opp.Id}`, (evt) => {
            let payload = evt.payload,
                value = payload.value,
                oli = payload.oppProduct,
                li = self.products.find((li) => li.Id == oli.Id);

            if (!isNaN(value) || value instanceof Date) value = parseFloat(value);
            if (isNaN(value)) value = payload.value;
            li[payload.field] = value;

            self.publish(`oppRowChange/${self.parentId}`, {
                acctId: self.opp.AccountId,
                oppId: self.opp.Id,
                field: `${oli.Product2.Id}/${payload.field}`,
                value,
            });

            self._amount = self.products.reduce((r, l) => r + l.TotalPrice, 0);
            self.doChange('Amount', self._amount);
        });

        self._rendered = true;
    }

    get amount() {
        try {
            return '$' + (this._amount || 0).toFixed(2);
        } catch (err) {
            console.error(err);
            return '$';
        }
    }

    get changedLIs() {
        let self = this;
        return self.products.filter((li) => li._hasChanges);
    }

    handleChange(evt) {
        let self = this,
            target = evt.target,
            value = target.value,
            dataset = target.dataset,
            field = dataset.field;

        self.doChange(field, value);
    }

    doChange(field, value) {
        let self = this;
        self.publish(`oppRowChange/${self.parentId}`, {
            acctId: self.opp.AccountId,
            oppId: self.opp.Id,
            field,
            value,
        });
    }

    deleteOpp(evt) {
        let self = this;
        if (confirm('Are you sure?')) {
            deleteOpp({ oppId: self.opp.Id })
                .then(() => {
                    self.publish(`oppsChanged/${this.parentId}`);
                })
                .catch(console.error);
        }
    }
}
