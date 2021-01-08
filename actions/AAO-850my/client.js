function(properties, context) {
    
    function getReq() {
        var req = false;
        if(window.XMLHttpRequest) {
            try {
                req = new XMLHttpRequest();
            } catch(e) {
                req = false;
            }
        } else if(window.ActiveXObject) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
                req = false;
            }
        }
        if (! req) {
            alert("Your browser does not support XMLHttpRequest.");
        }
        return req;
    }
    

	function getStatus(file_url){
        var req = getReq();

        try {
            req.open("GET", file_url, false);
            req.send("");
        } catch (e) {
            success = false;
            error_msg = "Error: " + e;
        }
        return req.status;
    }
    
    function urlToPromise(url) {       				
        return new Promise(function(resolve, reject) {           				
            JSZipUtils.getBinaryContent(url, function (err, data) {                           			
                if(err) {
                    reject(err);
                } else {   
                    resolve(data);
                }

            });               
        });
    }
    
    if (properties.files == null && properties.images == null && properties.external_urls == null) {
        return false;
    } else {
        var zip = new JSZip();
        var filenames = [];

        if(properties.files != null){
            var files = properties.files.get(0,properties.files.length());
            files.forEach(function(file){ 				
                if(file){
                    var filename = file.replace(/.*\//g, "");
                    if(filenames.includes(filename) !== true)
                    	filenames.push(filename);
                    else{
                     	filename = Math.random().toString(36).substring(7)+'-'+filename;
                    }
                    if(getStatus(file) == 200){
                        zip.file(filename, urlToPromise(file), {binary: true, createFolders: true});
                    }
                }
            }); 
        }
        if(properties.images != null){
            var images = properties.images.get(0,properties.images.length());
            images.forEach(function(image){ 				
                if(image){
                    var filename = image.replace(/.*\//g, "");
                    if(filenames.includes(filename) !== true)
                    	filenames.push(filename);
                    else{
                     	filename = Math.random().toString(36).substring(7)+'-'+filename;
                    }
                    if(getStatus(image) == 200){
                        zip.file(filename, urlToPromise(image), {binary: true, createFolders: true});
                    }
                }
            }); 
        }
        if(properties.external_urls != null){
            var urls = properties.external_urls.get(0,properties.external_urls.length());
            urls.forEach(function(url){ 				
                if(url){
                    var filename = url.replace(/.*\//g, "");
                    if(filenames.includes(filename) !== true)
                    	filenames.push(filename);
                    else{
                     	filename = Math.random().toString(36).substring(7)+'-'+filename;
                    }
                    if(getStatus(url) == 200){
                        zip.file(filename, urlToPromise(url), {binary: true, createFolders: true});
                    }
                }
            }); 
        }

        // Generate the ZIP file and download it to the user.
        zip.generateAsync({type:"blob",streamFiles: true,compression: "DEFLATE",compressionOptions: {level: 9}}).then(function callback(blob) {saveAs(blob, properties.exporting_zip_file_name);});               
    }
    
}