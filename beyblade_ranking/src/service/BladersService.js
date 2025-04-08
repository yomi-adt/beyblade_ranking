let csv = `ID,Name,Blader Name,Attendances,Swiss Wins,First Place Finishes,Second Place Finishes,Third Place Finishes,Total Podiums,Total Points,Rank,Description,Signature Combo
1,Kris G,,,5646,10,10,10,30,5676,,,
2,Jeff L,,,45645345,12,313,6854,7179,45652524,,,
3,Jerome L,,,453453,8945,3524561,8674563,12208069,12661522,,,
4,Trystan Y,,,453453456,6786783753,756375,753753,6788293881,7241747337,,,
5,Roy W,,,7537537537,,3757537,,3757537,7541295074,,,
6,Paulo L,,,753753753,5373753,375375,,5749128,759502881,,,
7,Jared P,,,,,,,0,0,,,
8,Nick M,,,,,3753753,753753753,757507506,757507506,,,
9,Allen L,,,,,,,0,0,,,
10,Christian C,,,,,,,0,0,,,
11,Arvine G,,,,,763753,753753753,754517506,754517506,,,
12,Paulo S,,,573753,753753753,,,753753753,754327506,,,
13,Jaren C,,,,,,,0,0,,,
14,Rico C,,,,,,,0,0,,,
15,Marc U,,,75375375,,,,0,75375375,,,
16,Czamel R,,,,,375375,,375375,375375,,,
17,Jah C,,,,,,,0,0,,,
18,JM C,,,,,,,0,0,,,
19,Ethan A,,,,,3753753,3753753,7507506,7507506,,,
20,Jepoy M,,,37537537,,,,0,37537537,,,
21,Steven F,,,,,,,0,0,,,
22,Richard C,,,,75375,,,75375,75375,,,
23,Ren DV,,,,,,,0,0,,,
24,Luiz D,,,,,75375,,75375,75375,,,
25,Riel L,,,,,,,0,0,,,
26,Andrew,,,,753753,,753753,1507506,1507506,,,
27,Matt E,,,,,,,0,0,,,
28,Trish L,,,,,,,0,0,,,
29,CJ S,HellsSuboh,,,,,,0,0,,"Wielder of HellsHammer. If you see his hammer stance, run on sight.",Hells Hammer 3-60 LF
30,Ralph S,,,,,,,0,0,,,
31,Jeric S,,,,,,,0,0,,,
32,Lance S,,,,,,,0,0,,,
33,EA M,,,,,,,0,0,,,
34,Seth C,,,,,,,0,0,,,
35,Vicki,,,,753753753,53753,,753807506,753807506,,,
36,Ray A,,,,,,,0,0,,,
37,Nick B,Yomi,,,,,,0,0,,,
38,Iszon D,,,,,,,0,0,,,
39,Jem A,,,,,,,0,0,,,
40,Ric R,,,,,,,0,0,,,
41,Gabby,,,,,,,0,0,,,
42,Riley R,,,,,,,0,0,,,
43,Jake T,,,,,,,0,0,,,
44,Patrick G,,,,,,,0,0,,,
45,Cyber,,,,,,,0,0,,,
46,Bailey,,,,,,,0,0,,,
47,Kris T,,,,,,,0,0,,,
48,Seth F,,,,,,,0,0,,,
49,Rich C,,,,,,,0,0,,,
50,Okarun,,,,,,,0,0,,,
51,Bryan L,,,,,,,0,0,,,
52,Tyler K,,,,,,,0,0,,,
53,Michael V,,,,,,,0,0,,,
54,Nathan,,,,,,,0,0,,,
55,Damon S,,,,,,,0,0,,,
56,Darlan W,,,,,,,0,0,,,`

//var csv is the CSV file with headers
function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
  
    return result
  }
export const Bladers = {
    getBladers() {
        return csvJSON(csv)
    }
}