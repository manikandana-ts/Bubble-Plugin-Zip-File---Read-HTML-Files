function(instance, properties, context) {
	var bubble_data_obj = [];
  	var settings = [];
    
  	function fn_bubble_data() {
        //fetch Bubble internal database data from Element fields
      	var zipfile = properties.data_source_zipfile;
      	var baseurl = properties.data_source_baseurl;
        var filename = zipfile.substring(zipfile.lastIndexOf('/')+1).split('.')[0];
        //create object that merges Bubble data arrays together into single object
		bubble_data_obj = {
          zipfileurl: zipfile,
          zipfilename: filename,
          zipbaseurl:(baseurl != null ? baseurl : ''),
        };
        
    }
  	
    fn_bubble_data();  


	instance.data.getZipFileContent(settings, bubble_data_obj);
    
}