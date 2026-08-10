const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'library.db');
const db = new Database(dbPath);

const rawData = `
1 Darsh Pradip Ramjiyani
2 Dhairya Bhaveshbhai Parsaniya
3 Soham Parasbhai Pavashiya
4 Jalkumar Satyambhai Lakhani
5 Veer Dilipkumar Jasoliya
6 Manav Maldebhai Modhvadiya
7 Dhairya Alkeshkumar Patel
8 Dhanush Krunalbhai Vansdeviya
9 Vedant Paresh Sakdasariya
10 Kartik Ashishkumar Jani
11 Tanmay Janardhan Pandya
12 Yashpalsinh Girivarsinh Gohil
13 Abhi Chandrakant Dodiya
14 Nikshit Rohankumar Patel
15 Aditya Ashishkumar Patel
16 Om Vimal Chhatrola
17 Daivik Manojkumar Patel
18 Raghav Pratik Khatri
19 Dev Sandipbhai Chudasma
20 Dhairya Bhavesh Gadhiya
21 Kush PintuKumar Bhoraniya
22 Jay Mineshkumar Panchal
23 Soham Dharmeshbhai Santoki
24 Ujas Rakesh Lakhani
25 Yagnik Sureshkumar Thakar
26 Karm Daxilbhai Narola
27 Keval Gautam Pajwani
28 Mantra Dharmeshbhai Parmar
29 Dhairya Singh Madanlal Yadav
30 Dhruvansh Pradipbhai Maniya
31 Jaydev Dhavalbhai Thummar
32 Pratyush Sandipbhai Godhani
33 Reyansh Jentilal Chavda
34 Joy Ashvin Shroff
35 Priyansh Bishalkumar Patel
36 Swar Kirti Pokar
37 Karma Kalpeshbhai Patel
38 Gaurang Bhavikkumar Surati
39 Aary Deepakbhai Patel
40 Aniruddh Hiteshbhai Monpara
41 Parth Devashish Kundu
42 Rudra Chiragkumar Maheta
43 Aryan Manoj Daxina
44 Maurya Rakshitbhai Patel
45 Nitya Bharatkumar Karkar
46 Manan Nitinbhai Shah
47 Dhruv Maheshbhai Parmar
48 Samarth Jayprakash Parmar
49 Naimeekumar Satishbhai Patel
50 Lavya Pankajbhai Moradiya
51 Harsh Akhabhai Chandesar
52 Jash Jasminbhai Lila
53 Om Ishwarbhai Budheliya
54 Dhairy Pareshbhai Maiyani
55 Daksh Deepak Vasa
56 Rudra Vijeshbhai Patel
57 TIRTH DEEPAKBHAI PATEL
58 Tanmay Kalpeshbhai Gohel
59 Shaurya Dharmeshbhai Vadi
60 Ansh Manojbhai Patel
61 Jemil Jayeshbhai Vagadiya
62 Shaashwat Om Sameer Dixit
63 Devansh Hiteshbhai Patel
64 Bhavya Pareshbhai Poshiya
65 Nisarg Ripalbhai Kabariya
66 Dharm Hasmukhbhai Akoliya
67 Naman Dinesh Daxina
68 Vedant Prakashkumar Prajapati
69 Het Bharatbhai Bhanderi
70 Kushal Chintankumar Patel
71 Ronit Kishor Vasani
72 Tanay Ketanbhai Patel
73 Manav Nileshbhai Bhoraniya
74 Krutarth Ashvinbhai Jivani
75 Pratham Pranav Bhatt
76 Denis Vinod Prajapati
77 Jeel Maheshbhai Talpara
78 Rudra Gautambhai Mangukiya
79 Milin Shaileshkumar Thakor
80 Pranaykumar Sureshbhai Bhoi
81 Aaruj Dineshsingh Rawat
82 Rudra Hareshbhai Padsumbia
83 Akshar Mukeshbhai Aghara
84 Panth Alpeshbhai Maiyani
85 Vaid Kamleshbhai Italiya
86 Moksh Anil kumar Yadav
87 Ayushmaan Sandeepkumar Singh
88 Het Prashantbhai Dholariya
89 Mankumar Janakbhai Malasana
90 Mantra Mayurbhai Patel
91 Moksh Jagdishkumar Parmar
92 Harsh kumar Sudhir kumar
93 Shresth Yogendrakumar Singh
94 Abhimanyu Gitakumari Anand
95 Keval Keyur Jani
96 Karm Vijaybhai Viradiya
97 Dev AshishKumar Patel
98 Jayant Birudev Hajare
99 Daksh Anilbhai Mangroliya
100 Navneel Dinesh Sharma
101 Soham Prashant Chokrayat
102 Dharv Bharatbhai Jesadiya
103 Tirth Ketanbhai Nasit
104 Disharth Mahendrabhai Radadiya
105 Rudra Hasmukhbhai Tundiya
106 Dhruv Manojbhai Maniya
107 Prince Amitbhai Patel
108 Shlok Rasikbhai Mayani
109 Sneh Mayurbhai Antala
110 Aniket Kirtibhai Chaudhari
111 Darsh Divyeshbhai Ramani
112 Vaibhav Pratap singh Rawat
113 Keyan Nikhilkumar Suthar
114 Nirmal Mukundbhai Thakor
115 TIRTH SANDIPBHAI JESADIYA
116 Nitya Mitulbhai Desai
117 CHAITANYASINH VIJAYSINH BARAD
118 Shiv Sandipbhai Bhoi
119 DAKSH DIPAKKUMAR PATEL
120 Ved Harshadbhai Moradiya
121 Jaiwin Miteshkumar Jotangiya
122 Aarav Arjunbhai Parekh
123 Hetarth Alpeshkumar Ahir
124 Tirth Kamal Shah
`;

const lines = rawData.trim().split('\n');
const insertStmt = db.prepare('INSERT OR IGNORE INTO students (studentId, name, email, phone) VALUES (?, ?, ?, ?)');

let added = 0;

db.transaction(() => {
  for (const line of lines) {
    if (!line.trim()) continue;
    // Split by first space to separate number and name
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const gmNo = match[1];
      const name = match[2].trim();
      const result = insertStmt.run(gmNo, name, 'N/A', 'N/A');
      if(result.changes > 0) {
        added++;
      }
    }
  }
})();

console.log(`Successfully imported ${added} students!`);
