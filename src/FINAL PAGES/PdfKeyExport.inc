<basis core="group" if="'[##cms.form.data-pdftype##]'='ticket'">
<basis core="external.fly.ws" source="cmsDbService2" name="db" procedurename="dbsource">
    <member method="cms" name="shortlink" query='{ 
                "name": "db",
                "mid": "20",
                "member":[{ 
                "name": "q", 
                "type":"list",
                "request": "get_short_link",
                "token": "[##cms.form.token##]",
                }]} '  />
</basis>
<basis core="inlinesource" name="db">
    <member name="shortlinkTreelangid" format="json"  postsql="
     select Field , value from [db.shortlinkTreelangid] where Field in('langid');
     ">
        {"root":[##db.shortlink.result##]}</member>
    <member name="shortlinkTreeid" format="json"  postsql="
     select Field , value from [db.shortlinkTreeid] where Field in('id');
     ">
        {"root":[##db.shortlink.result##]}</member>
    <member name="shortlinkTreeletterhead" format="json"  postsql="
     select Field , value from [db.shortlinkTreeletterhead] where Field in('letterhead');
     ">
        {"root":[##db.shortlink.result##]}</member>
        
        <member name="shortlinkTreetid" format="json"  postsql="
         select Field , value from [db.shortlinkTreetid] where Field in('tid');
         ">
            {"root":[##db.shortlink.result##]}</member>

        <member name="shortlinkTreeinvoice" format="json"  postsql="
         select Field , value from [db.shortlinkTreeinvoice] where Field in('invoice');
         ">
            {"root":[##db.shortlink.result##]}</member>
        
</basis>
</basis>
<basis core="group" if="'[##cms.form.data-pdftype##]'='invoice'">
<basis core="external.fly.ws" source="cmsDbService2" name="db" procedurename="dbsource">
    <member method="cms" name="shortlink" query='{ 
                "name": "db",
                "mid": "20",
                "member":[{ 
                "name": "q", 
                "type":"list",
                "request": "get_short_link",
                "token": "[##cms.form.token##]",
                }]} '   />
</basis>

<basis core="inlinesource" name="db">
    <member name="shortlinkTreelangid" format="json"  postsql="
     select Field , value from [db.shortlinkTreelangid] where Field in('langid');
     " >
        {"root":[##db.shortlink.result##]}</member>
    <member name="shortlinkTreeid" format="json"  postsql="
     select Field , value from [db.shortlinkTreeid] where Field in('id');
     " >
        {"root":[##db.shortlink.result##]}</member>
    <member name="shortlinkTreeletterhead" format="json"  postsql="
     select Field , value from [db.shortlinkTreeletterhead] where Field in('letterhead');
     " >
        {"root":[##db.shortlink.result##]}</member>

</basis>
</basis>