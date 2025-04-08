let csv = `ID	Name	Blader Name	Attendances	Swiss Wins	First Place Finishes	Second Place Finishes	Third Place Finishes	Total Podiums	Total Points	Rank	Description	Signature Combo
1	Kris G			5646	10	10	10	30	5676	17		
2	Jeff L			45645345	12	313	6854	7179	45652524	9		
3	Jerome L			453453	8945	3524561	8674563	12208069	12661522	11		
4	Trystan Y	tan24196		453453456	6786783753	756375	753753	6788293881	7241747337	2		
5	Roy W			7537537537		3757537		3757537	7541295074	1		
6	Paulo L	jpzl		753753753	5373753	375375		5749128	759502881	3		
7	Jared P	boneshelly						0	0	18		
8	Nick M					3753753	753753753	757507506	757507506	4		
9	Allen L							0	0	18		
10	Christian C							0	0	18		
11	Arvine G					763753	753753753	754517506	754517506	5		
12	Paulo S			573753	753753753			753753753	754327506	6		
13	Jaren C							0	0	18		
14	Rico C							0	0	18		
15	Marc U	EVOLFLOW		75375375				0	75375375	8		
16	Czamel R					375375		375375	375375	14		
17	Jah C							0	0	18		
18	JM C	caster						0	0	18		
19	Ethan A					3753753	3753753	7507506	7507506	12		
20	Jepoy M	jepoy		37537537				0	37537537	10		
21	Steven F							0	0	18		
22	Richard C				75375			75375	75375	15		
23	Ren DV							0	0	18		
24	Luiz D					75375		75375	75375	15		
25	Riel L							0	0	18		
26	Andrew				753753		753753	1507506	1507506	13		
27	Matt E							0	0	18		
28	Trish L	3sh						0	0	18		
29	CJ S	HellsSuboh						0	0	18	Wielder of HellsHammer. If you see his hammer stance, run on sight.	Hells Hammer 3-60 LF
30	Ralph S							0	0	18		
31	Jeric S							0	0	18		
32	Lance S							0	0	18		
33	EA M							0	0	18		
34	Seth C							0	0	18		
35	Vicki				753753753	53753		753807506	753807506	7		
36	Ray A							0	0	18		
37	Nick B	Yomi						0	0	18		
38	Iszon D							0	0	18		
39	Jem A							0	0	18		
40	Ric R							0	0	18		
41	Gabby							0	0	18		
42	Riley R							0	0	18		
43	Jake T							0	0	18		
44	Patrick G							0	0	18		
45	Cyber	Cyber						0	0	18		
46	Bailey	thatkanadian						0	0	18		
47	Kris T							0	0	18		
48	Seth F							0	0	18		
49	Rich C							0	0	18		
50	Okarun	Okarun						0	0	18		
51	Bryan L							0	0	18		
52	Tyler K	tykubz						0	0	18		
53	Michael V							0	0	18		
54	Nathan							0	0	18		
55	Damon S							0	0	18		
56	Darlan W											`

//var csv is the CSV file with headers
function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers=lines[0].split("\t");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split("\t");
  
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