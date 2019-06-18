function(instance, context) {
    instance.data.getZipFileContent = function(settings, bubble_data_obj) {

    	pushData(bubble_data_obj, null); 


    	function pushData(data, tabletop) {
          //console.log(data);
          var filenameZip = data.zipfilename;
          var innerfilebaseurl = data.zipbaseurl;
          var htmltext = JSZipUtils.getBinaryContent(data.zipfileurl, function (err, data) {
              try {
                  JSZip.loadAsync(data)
                      .then(function (zip) {
                    	//console.log(zip.files);
                          var entries = Object.keys(zip.files).map(function (name) {
                            return zip.files[name];
                          });

                          // 2.
                          var listOfPromises = entries.map(function(entry) {
                            var type = ((entry.name.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) != null) ? 'base64' : 'text');
                            var extension = entry.name.split('.').pop(); 
                            return entry.async(type).then(function (u8) {
                              // we bind the two together to be able to match the name and the content in the last step
                              return [entry.name, (type=='base64' ? 'data:image/'+extension+';base64,' : '')+u8];
                            });
                          });

                          // 3.
                          var promiseOfList = Promise.all(listOfPromises);

                          // 4.
                          var resultdata = promiseOfList.then(function (list) {
                            // here, list is a list of [name, content]
                            // let's transform it into an object for easy access
                            var result = list.reduce(function (accumulator, current) {
                              var currentName = current[0];
                              var currentValue = current[1];
                              //console.log(currentValue);
                              accumulator[currentName] = currentValue;
                              return accumulator;
                            }, {} );
                            //console.log(result);
                            var newResult = [];
                            Object.keys(result).forEach((key, index) => {
                                  if(index != '' && key.indexOf('.htm') >= 0){
                                      newResult[key] = result[key];
                                      //image/js src
                                      srcWithQuotes = result[key].match(/\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/gi);
                                      //console.log(srcWithQuotes.length);
                                      if(srcWithQuotes != null){
                                          for (var key1 in srcWithQuotes) {  
                                              srcWithQuotesVal = srcWithQuotes[key1].replace(/"/gi,'').trim();
                                              srcWithQuotesVal = srcWithQuotesVal.replace('src=','').trim();
                                              //console.log('==>'+srcWithQuotesVal);
                                              newval = result[filenameZip+'/'+srcWithQuotesVal];
                                              //console.log(newval);
                                              if(newval != undefined && newval != null){
                                                  if(srcWithQuotesVal.toLowerCase().indexOf('.js')>=0){
                                                      //<script(?:.*)\ssrc=(\'js/test.js\'|\"js/test.js\"|js/test.js)(?:.*)<
                                                      var pattern1 = "<script(?:.*)\\ssrc\=(\\'";
                                                      var middledynamic = srcWithQuotesVal+"\\'|"+'\\"'+srcWithQuotesVal+'\\"|'+srcWithQuotesVal;
                                                      var pattern2 = ')(?:.*)(?=<)';
                                                      //console.log(pattern1 + middledynamic + pattern2);
                                                      var regex = new RegExp(pattern1 + middledynamic + pattern2, 'i');
                                                      newResult[key] = newResult[key].replace(regex,'<script>'+newval+'<');
                                                      //console.log(newResult[key]);
                                                  }else {
                                                      newResult[key] = newResult[key].replace(srcWithQuotesVal,newval);
                                                  } 
                                              }
                                          }

                                      }else{
                                          newResult[key] = newResult[key];
                                      }
                                      //console.log(newResult[key]);

                                      srcWithQuotes1 = result[key].match(/\shref\=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/gi);
                                      //console.log(srcWithQuotes1);
                                      if(srcWithQuotes1 != null){
                                          for (var key2 in srcWithQuotes1) {  
                                              srcWithQuotesVal1 = srcWithQuotes1[key2].replace(/"/gi,'').trim();
                                              srcWithQuotesVal1 = srcWithQuotesVal1.replace('href=','').trim();
                                              newval = result[filenameZip+'/'+srcWithQuotesVal1];
                                              if(newval != undefined && newval != null){
                                                  if(srcWithQuotesVal1.indexOf('.htm') >= 0){
                                                      newResult[key] = newResult[key].replace(srcWithQuotesVal1,innerfilebaseurl+filenameZip+'/'+srcWithQuotesVal1);
                                                  }else if(srcWithQuotesVal1.indexOf('.css') > 0){
                                                      //<link(?:.*)\shref=(\'css/test.css\'|\"css/test.css\"|css/test.css)(?:.*)(?=>)
                                                      var pattern1 = "<link(?:.*)\\shref\=(\\'";
                                                      var middledynamic = srcWithQuotesVal1+"\\'|"+'\\"'+srcWithQuotesVal1+'\\"|'+srcWithQuotesVal1;
                                                      var pattern2 = ')(?:.*)(?=>)>';
                                                      //console.log(pattern1 + middledynamic + pattern2);
                                                      var regex = new RegExp(pattern1 + middledynamic + pattern2, 'i');
                                                      newResult[key] = newResult[key].replace(regex,'<style>'+newval+'</style>');
                                                      //console.log(newResult[key]);
                                                  }
                                              }
                                          }
                                      }
                                      //console.log(newResult[key]);

                                  }
                              });
                              //console.log(newResult);
                              var headersList = [];
                              var headersListContent = [];
                              var headersIndex = [];
                              var headercnt =0;
                              Object.keys(newResult).forEach((key, index) => {
                                  headersList[index] = key;
                                  headersListContent[index] = newResult[key];
                                  headersIndex[index] = index+1;
                                  headercnt++;
                              });
                              //console.log(headersListContent);
                              //console.log(headercnt);
                              instance.publishState("headers", headersList);
                              instance.publishState("blocksdata", headersListContent);
                              instance.publishState("totalfiles", headercnt);
                              instance.publishState("indexkey", headersIndex);
                              
                              return newResult;
                          });
                          //console.log(resultdata);

                          return true;
                      })
                      .then(function success(text) {
                    	 console.log('success');
                      }, function error(e) {
                          instance.publishState("errors", e);
                      });
              } catch(e) {
                  instance.publishState("errors", e);
              }
          });
          
        }
          
          
      }

}