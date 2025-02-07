@isTest
private class CommunityProjectController_Test {

    @TestSetup
    static void makeData(){

        Account a = new Account(Name = 'Demo');
        insert a; 

        
        Account a2 = new Account(Name = 'Subcommittee', Account_Type__c = '	SSC Subcommittee');
        insert a2; 


        Project__c project = new Project__c(Name = 'test', Account__c = a.Id, Status__c = 'Active', Project_Internal_Status__c = 'Published');

        insert project;

        ContentVersion content=new ContentVersion(); 
        content.Title = 'Header_Picture1'; 
        content.PathOnClient='/' + content.Title + '.jpg'; 
        Blob bodyBlob = Blob.valueOf('Unit Test ContentVersion Body'); 
        content.VersionData = bodyBlob; 

        content.origin = 'H';
        insert content;

        ContentDocumentLink contentlink = new ContentDocumentLink();
        contentlink.LinkedEntityId = project.Id;
        contentlink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: content.Id].ContentDocumentId;
        
        insert contentlink;

    }

    @isTest 
    private static void getProjects() {
        List<CommunityProjectController.WrapperCommunityProject> projects = CommunityProjectController.getProjects();

        System.assertEquals(1, projects.size());
    }

    @isTest
    static void getSubcommittees(){
        List<Account> accounts = CommunityProjectController.getSubcommittees();

        System.assertEquals(1, accounts.size());
    }
}
