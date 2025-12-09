import { LightningElement, wire, track, api } from "lwc";
export default class SurveySectionNavigator extends LightningElement {
    @api sections = [];
    @api selectedId;

    
    @track columns = [        
        { label: "Name", fieldName: "Name" },
        { label: "Status", fieldName: "Status", type: "badge",  cellAttributes:{
          class:{fieldName:'Style'}} } 
      ];
    
    @track surveySections = [];
    @api sectionList = [
        {
          Id: "1",
          Name: "Section 1",
          Section_Status__c: "Completed"
        },
        {
          Id: "2",
          Name: "Section 2",
          Section_Status__c: "Draft"
        },
        {
          Id: "3",
          Name: "Section 3",
          Section_Status__c: "Not Started"
        }
    ];
    connectedCallback() {
        console.log('cc sections:' + this.sections.length);
        this.setupSurveySections();
    }
    setupSurveySections() {
        console.log('setting up sections:' + this.sections.length);
        this.sections.forEach(section => {
            let badgeStyleClass = "";
            if (section.Section_Status__c === "Completed") {
                badgeStyleClass = "row-badge-completed";
            } else if (section.Section_Status__c === "Draft" || section.Section_Status__c === "In Progress") {
                badgeStyleClass = "row-badge-draft";
            } else if (section.Section_Status__c === "View" || section.Section_Status__c === "Not Started") {
                badgeStyleClass = "row-badge-view";
            } else if(section.Section_Status__c === "Action Required") {
                badgeStyleClass = "row-badge-actionRequired";
            } else {
                badgeStyleClass = "";
            }
            this.surveySections.push({Id: section.Id, 
                Name: section.Name, 
                Status: section.Section_Status__c, 
                // Assignee: section.Assigned_To__c,
                // Assignee: "Sample User 1",
                Style: "",
                StatusStyle: badgeStyleClass});
        });
    }
    handleSectionClick(evt) {
        console.log('selected row:' + evt.currentTarget.dataset.id);
        this.selectedId = evt.currentTarget.dataset.id;
        this.surveySections.forEach(row =>{
          if(row.Id === evt.currentTarget.dataset.id){
              row.Style = 'slds-is-selected';
              // row.StatusStyle = 'row-badge-color';
          } else {
              row.Style = '';
          }
          row.StatusStyle = row.StatusStyle
      });
    }
    // handleMouseOver(evt) {
    //     console.log('mouse over row:' + evt.currentTarget.dataset.id);
    //     this.surveySections.forEach(row =>{
    //       if(row.Id === evt.currentTarget.dataset.id && row.Style !== 'row-selected'){
    //           row.Style = 'row-prospect';              
    //       }
    //       row.StatusStyle = row.StatusStyle
    //   });
    // }
    // handleMouseOut(evt) {
    //     console.log('mouse out row:' + evt.currentTarget.dataset.id);
    //     this.surveySections.forEach(row =>{
    //       if(row.Id === evt.currentTarget.dataset.id && row.Style !== 'row-selected'){
    //           row.Style = '';
    //       }
    //       row.StatusStyle = row.StatusStyle
    //   });
    // }
}

