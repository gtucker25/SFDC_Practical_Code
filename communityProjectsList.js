//Part of Larger Community records list component
import { LightningElement, api, wire, track } from 'lwc';
import getProjects from '@salesforce/apex/CommunityProjectController.getProjects';
import getSubcommittees from '@salesforce/apex/CommunityProjectController.getSubcommittees';
import { NavigationMixin } from 'lightning/navigation';

export default class CommunityProjectsList extends NavigationMixin(LightningElement) {

    DELAY = 500;
    @track projects = [];
    @track subcommittees = [];
    sortValue = 'ProjectName';
    originalProjects = [];
    subcommitteId = '';
    searchKey = '';
    projectType = 'All';

    get options() {
        return [
            { label: 'Project Start Date', value: 'ProjectStartDate' },
            { label: 'Project End Date', value: 'ProjectEndDate'},
            { label: 'Title', value: 'Name', value: 'ProjectName' }
        ];
    }
    get typeOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Funded Projects', value: 'Funded' },
            { label: 'Non-Funded ', value: 'Non-Funded' }
        ];
    }

    connectedCallback(){
        
        (async () => {
            try {

                this.originalProjects = await getProjects();

                this.projects = this.originalProjects.slice(0);

                var accounts  = await getSubcommittees();

                this.subcommittees = accounts.map(account => {
                    return {
                        label: account.Name,
                        value: account.Id
                    };
                });
                this.subcommittees.unshift({label: '', value: ''});

            } catch (error) {

                console.log(error);
            } 
        })();
    }

    handleClick (event) {
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
              recordId: event.currentTarget.dataset.id,
              name: 'Project__c',
              actionName: 'view'
            }
          });
    }

    sortProjects() {

        this.projects.sort((a, b) => {
            if(a[this.sortValue] < b[this.sortValue]) {

                return -1; 
            } else if (a[this.sortValue] > b[this.sortValue]) { 

                return 1; 
            }
            return 0; 
        });

    }

    filterBySubcommitteId(projects) {
        const ret= [];
        projects.forEach(project => {

            if (project.SSCSubcommittee === this.subcommitteId || !this.subcommitteId) {
                ret.push({
                    Id: project.Id,
                    Name: project.Name,
                    SSCSubcommittee: project.SSCSubcommittee,
                    ProjectSummary: project.ProjectSummary,
                    ProjectStartDate: project.ProjectStartDate,
                    ProjectEndDate: project.ProjectEndDate,
                    thumbnail: project.thumbnail,
                    Type: project.Type,
                    ProjectName: project.ProjectName

                });
            }
        }); 
        return ret;
    }

    handleSortChange(event){

        this.sortValue = event.detail.value;

        this.sortProjects();

    }

    filterByKeyWord(projects) {
        const ret= [];
        
        projects.forEach(project => {

            if (project.ProjectName.toLowerCase().includes(this.searchKey.toLowerCase()) 
                || (project.ProjectSummary && project.ProjectSummary.toLowerCase().includes(this.searchKey.toLowerCase())) 
                || !this.searchKey) {

                ret.push({
                    Id: project.Id,
                    Name: project.Name,
                    SSCSubcommittee: project.SSCSubcommittee,
                    ProjectSummary: project.ProjectSummary,
                    ProjectStartDate: project.ProjectStartDate,
                    ProjectEndDate: project.ProjectEndDate,
                    thumbnail: project.thumbnail,
                    Type: project.Type,
                    ProjectName: project.ProjectName
                });
            }

        }); 
        return ret;
    }

    filterByType(projects) {
        const ret= [];
        
        projects.forEach(project => {

            if (this.projectType === 'All' ||  project.Type === this.projectType) {

                ret.push({
                    Id: project.Id,
                    Name: project.Name,
                    SSCSubcommittee: project.SSCSubcommittee,
                    ProjectSummary: project.ProjectSummary,
                    ProjectStartDate: project.ProjectStartDate,
                    ProjectEndDate: project.ProjectEndDate,
                    thumbnail: project.thumbnail,
                    Type: project.Type,
                    ProjectName: project.ProjectName
                });
            }

        }); 
        return ret;
    }

    filter(projectList) {
        this.projects = this.filterByType(this.filterBySubcommitteId(this.filterByKeyWord(projectList)));
        this.sortProjects();
    }

    handleKeyChange(event) {

        window.clearTimeout(this.delayTimeout);

        const searchKey = event.target.value;

        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
            this.filter(this.originalProjects);

        }, this.DELAY);
    }

    filterBySubcommittee (event) {
        this.subcommitteId = event.detail.value;
        this.filter(this.originalProjects);
    }

    filterByProjectType (event) {
        this.projectType = event.detail.value;
        this.filter(this.originalProjects);
    }
}
