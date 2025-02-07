public without sharing class CommunityProjectController {

    private static final String  BASE_URL = URL.getSalesforceBaseUrl().toExternalForm();

    public class WrapperCommunityProject {
        @AuraEnabled
        public String thumbnail{get;set;}
        @AuraEnabled
        public String url{get;set;}
        @AuraEnabled
        public String Id{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String ProjectSummary{get;set;}
        @AuraEnabled
        public Date ProjectStartDate{get;set;}
        @AuraEnabled
        public Date ProjectEndDate{get;set;}
        @AuraEnabled
        public String Type {get;set;}
        @AuraEnabled
        public String SSCSubcommittee{get;set;}
        @AuraEnabled
        public String ProjectName{get;set;}
    }    

    @AuraEnabled(Cacheable=true)
    public static List<WrapperCommunityProject> getProjects(){

        List<WrapperCommunityProject> projectList = new List<WrapperCommunityProject>();


        List<Project__c> projects = [SELECT Id, Name, Project_Description_Abstract__c, Project_Start_Date__c, Project_End_Date__c, SSC_Subcommittee__c, Type__c, Project_Name__c FROM Project__c WHERE Project_Internal_Status__c = 'Published'];


        List<Id> ids = new List<Id>();

        Map<Id, String> CC2Image = new Map<Id, String>();

        for(Project__c p: projects){
            ids.add(p.id);
        }
      
        List<ContentDocumentLink> ContentDocLink = [SELECT ContentDocument.LatestPublishedVersionId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityID in :ids];

        for(ContentDocumentLink cdl : ContentDocLink){
            if(cdl.ContentDocument.LatestPublishedVersionId != null){
                CC2Image.put(cdl.LinkedEntityID, cdl.ContentDocument.LatestPublishedVersionId);
            }
        }

        for (Project__c project : projects) {

            WrapperCommunityProject p  = new WrapperCommunityProject();

            p.Id = project.Id;
            p.Name = project.Name;
            p.ProjectEndDate = project.Project_End_Date__c;
            p.ProjectStartDate = project.Project_Start_Date__c; 
            p.ProjectSummary = project.Project_Description_Abstract__c != null ? project.Project_Description_Abstract__c.length() > 500 ? project.Project_Description_Abstract__c.substring(0, 500) + '...' : project.Project_Description_Abstract__c : '';
            p.SSCSubcommittee = project.SSC_Subcommittee__c;
            p.Type = project.Type__c;
            p.ProjectName = project.Project_Name__c;

            String verId = CC2Image.get(project.Id);

            if (verId != null) {
                p.thumbnail = BASE_URL + '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + verId;
            } else {
                p.thumbnail = '/resource/1674065039000/CommunityProjectDefaultImage';
            }
            
            projectList.add(p);
        }

        return projectList;

    } 

    @AuraEnabled(Cacheable=true)
    public static List<Account> getSubcommittees(){

        return [SELECT Id, Name FROM Account WHERE Account_Type__c = 'SSC Subcommittee'];

    }
}
