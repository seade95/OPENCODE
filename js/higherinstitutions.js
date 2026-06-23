// EDUVERSE - Nigerian Tertiary/Higher Education Database & Mapping Module
// Universities, Polytechnics, Colleges of Education + custom institution support

var NIGERIAN_INSTITUTIONS = {
  typeLabel: { uni: 'Universities', poly: 'Polytechnics', coe: 'Colleges of Education' },
  categoryLabel: { federal: 'Federal', state: 'State', private: 'Private' },
  categories: ['federal', 'state', 'private'],
  uni: {
    federal: [
      { name: 'Abubakar Tafawa Balewa University', state: 'Bauchi', city: 'Bauchi', established: 1980, acronym: 'ATBU' },
      { name: 'Ahmadu Bello University', state: 'Kaduna', city: 'Zaria', established: 1962, acronym: 'ABU' },
      { name: 'Bayero University', state: 'Kano', city: 'Kano', established: 1975, acronym: 'BUK' },
      { name: 'Federal University of Petroleum Resources, Effurun', state: 'Delta', city: 'Effurun', established: 2007, acronym: 'FUPRE' },
      { name: 'Federal University of Technology, Akure', state: 'Ondo', city: 'Akure', established: 1981, acronym: 'FUTA' },
      { name: 'Federal University of Technology, Minna', state: 'Niger', city: 'Minna', established: 1982, acronym: 'FUTMINNA' },
      { name: 'Federal University of Technology, Owerri', state: 'Imo', city: 'Owerri', established: 1980, acronym: 'FUTO' },
      { name: 'Federal University, Birnin Kebbi', state: 'Kebbi', city: 'Birnin Kebbi', established: 2013, acronym: 'FUBK' },
      { name: 'Federal University, Dutse', state: 'Jigawa', city: 'Dutse', established: 2011, acronym: 'FUD' },
      { name: 'Federal University, Dutsin-Ma', state: 'Katsina', city: 'Dutsin-Ma', established: 2011, acronym: 'FUDMA' },
      { name: 'Federal University, Gashua', state: 'Yobe', city: 'Gashua', established: 2013, acronym: 'FUGASHUA' },
      { name: 'Federal University, Gusau', state: 'Zamfara', city: 'Gusau', established: 2013, acronym: 'FUGUS' },
      { name: 'Federal University, Kashere', state: 'Gombe', city: 'Kashere', established: 2011, acronym: 'FUK' },
      { name: 'Federal University, Lafia', state: 'Nasarawa', city: 'Lafia', established: 2011, acronym: 'FULAFIA' },
      { name: 'Federal University, Lokoja', state: 'Kogi', city: 'Lokoja', established: 2011, acronym: 'FULOKOJA' },
      { name: 'Federal University, Ndufu-Alike Ikwo', state: 'Ebonyi', city: 'Ndufu-Alike', established: 2011, acronym: 'FUNAI' },
      { name: 'Federal University, Otuoke', state: 'Bayelsa', city: 'Otuoke', established: 2011, acronym: 'FUO' },
      { name: 'Federal University, Oye-Ekiti', state: 'Ekiti', city: 'Oye-Ekiti', established: 2011, acronym: 'FUOYE' },
      { name: 'Federal University, Wukari', state: 'Taraba', city: 'Wukari', established: 2011, acronym: 'FUWUKARI' },
      { name: 'Michael Okpara University of Agriculture, Umudike', state: 'Abia', city: 'Umudike', established: 1992, acronym: 'MOUAU' },
      { name: 'Modibbo Adama University', state: 'Adamawa', city: 'Yola', established: 1981, acronym: 'MAU' },
      { name: 'National Open University of Nigeria', state: 'Lagos', city: 'Lagos', established: 2002, acronym: 'NOUN' },
      { name: 'Nigerian Defence Academy', state: 'Kaduna', city: 'Kaduna', established: 1985, acronym: 'NDA' },
      { name: 'Nigerian Police Academy', state: 'Kano', city: 'Wudil', established: 2013, acronym: 'POLAC' },
      { name: 'Nnamdi Azikiwe University', state: 'Anambra', city: 'Awka', established: 1991, acronym: 'UNIZIK' },
      { name: 'Obafemi Awolowo University', state: 'Osun', city: 'Ile-Ife', established: 1961, acronym: 'OAU' },
      { name: 'University of Abuja', state: 'FCT', city: 'Abuja', established: 1988, acronym: 'UNIABUJA' },
      { name: 'Federal University of Agriculture, Abeokuta', state: 'Ogun', city: 'Abeokuta', established: 1993, acronym: 'FUNAAB' },
      { name: 'University of Benin', state: 'Edo', city: 'Benin City', established: 1970, acronym: 'UNIBEN' },
      { name: 'University of Calabar', state: 'Cross River', city: 'Calabar', established: 1975, acronym: 'UNICAL' },
      { name: 'University of Ibadan', state: 'Oyo', city: 'Ibadan', established: 1948, acronym: 'UI' },
      { name: 'University of Ilorin', state: 'Kwara', city: 'Ilorin', established: 1975, acronym: 'UNILORIN' },
      { name: 'University of Jos', state: 'Plateau', city: 'Jos', established: 1975, acronym: 'UNIJOS' },
      { name: 'University of Lagos', state: 'Lagos', city: 'Lagos', established: 1962, acronym: 'UNILAG' },
      { name: 'University of Maiduguri', state: 'Borno', city: 'Maiduguri', established: 1975, acronym: 'UNIMAID' },
      { name: 'University of Nigeria, Nsukka', state: 'Enugu', city: 'Nsukka', established: 1960, acronym: 'UNN' },
      { name: 'University of Port Harcourt', state: 'Rivers', city: 'Port Harcourt', established: 1975, acronym: 'UNIPORT' },
      { name: 'University of Uyo', state: 'Akwa Ibom', city: 'Uyo', established: 1991, acronym: 'UNIUYO' },
      { name: 'Usmanu Danfodiyo University', state: 'Sokoto', city: 'Sokoto', established: 1975, acronym: 'UDUSOK' },
      { name: 'Federal University of Health Sciences, Otukpo', state: 'Benue', city: 'Otukpo', established: 2021, acronym: 'FUHSO' },
      { name: 'Federal University of Health Sciences, Ila-Orangun', state: 'Osun', city: 'Ila-Orangun', established: 2021, acronym: 'FUHSI' },
      { name: 'Nigerian Maritime University', state: 'Delta', city: 'Okerenkoko', established: 2018, acronym: 'NMU' },
      { name: 'Alex Ekwueme Federal University, Ndufu-Alike', state: 'Ebonyi', city: 'Ndufu-Alike', established: 2011, acronym: 'AE-FUNAI' }
    ],
    state: [
      { name: 'Abia State University, Uturu', state: 'Abia', city: 'Uturu', established: 1981, acronym: 'ABSU' },
      { name: 'Adamawa State University, Mubi', state: 'Adamawa', city: 'Mubi', established: 2002, acronym: 'ADSU' },
      { name: 'Adekunle Ajasin University, Akungba-Akoko', state: 'Ondo', city: 'Akungba-Akoko', established: 1999, acronym: 'AAUA' },
      { name: 'Akwa Ibom State University', state: 'Akwa Ibom', city: 'Ikot Akpaden', established: 2010, acronym: 'AKSU' },
      { name: 'Ambrose Alli University, Ekpoma', state: 'Edo', city: 'Ekpoma', established: 1981, acronym: 'AAU' },
      { name: 'Anambra State University, Uli', state: 'Anambra', city: 'Uli', established: 2000, acronym: 'ANSU' },
      { name: 'Bauchi State University, Gadau', state: 'Bauchi', city: 'Gadau', established: 2011, acronym: 'BASUG' },
      { name: 'Benue State University, Makurdi', state: 'Benue', city: 'Makurdi', established: 1992, acronym: 'BSUM' },
      { name: 'Borno State University, Maiduguri', state: 'Borno', city: 'Maiduguri', established: 2016, acronym: 'BOSU' },
      { name: 'Chukwuemeka Odumegwu Ojukwu University', state: 'Anambra', city: 'Uli', established: 2000, acronym: 'COOU' },
      { name: 'Cross River University of Technology', state: 'Cross River', city: 'Calabar', established: 2002, acronym: 'CRUTECH' },
      { name: 'Delta State University, Abraka', state: 'Delta', city: 'Abraka', established: 1992, acronym: 'DELSU' },
      { name: 'Delta State University of Science and Technology, Ozoro', state: 'Delta', city: 'Ozoro', established: 2021, acronym: 'DSUST' },
      { name: 'Ebonyi State University, Abakaliki', state: 'Ebonyi', city: 'Abakaliki', established: 1996, acronym: 'EBSU' },
      { name: 'Edo State University, Uzairue', state: 'Edo', city: 'Uzairue', established: 2016, acronym: 'EDSU' },
      { name: 'Ekiti State University', state: 'Ekiti', city: 'Ado-Ekiti', established: 1982, acronym: 'EKSU' },
      { name: 'Enugu State University of Science and Technology', state: 'Enugu', city: 'Enugu', established: 1982, acronym: 'ESUT' },
      { name: 'Federal University of Education, Zaria', state: 'Kaduna', city: 'Zaria', established: 2022, acronym: 'FUEZ' },
      { name: 'Gombe State University', state: 'Gombe', city: 'Gombe', established: 2004, acronym: 'GSU' },
      { name: 'Ignatius Ajuru University of Education', state: 'Rivers', city: 'Port Harcourt', established: 2010, acronym: 'IAUE' },
      { name: 'Imo State University, Owerri', state: 'Imo', city: 'Owerri', established: 1981, acronym: 'IMSU' },
      { name: 'Jigawa State University', state: 'Jigawa', city: 'Dutse', established: 2012, acronym: 'JSU' },
      { name: 'Kaduna State University', state: 'Kaduna', city: 'Kaduna', established: 2005, acronym: 'KASU' },
      { name: 'Kano State University of Science and Technology, Wudil', state: 'Kano', city: 'Wudil', established: 2000, acronym: 'KUST' },
      { name: 'Katsina State University', state: 'Katsina', city: 'Katsina', established: 2009, acronym: 'KASU' },
      { name: 'Kebbi State University of Science and Technology, Aliero', state: 'Kebbi', city: 'Aliero', established: 2006, acronym: 'KSUSTA' },
      { name: 'Kogi State University, Anyigba', state: 'Kogi', city: 'Anyigba', established: 1999, acronym: 'KSU' },
      { name: 'Kwara State University, Malete', state: 'Kwara', city: 'Malete', established: 2009, acronym: 'KWASU' },
      { name: 'Lagos State University, Ojo', state: 'Lagos', city: 'Ojo', established: 1983, acronym: 'LASU' },
      { name: 'Lagos State University of Science and Technology', state: 'Lagos', city: 'Ikorodu', established: 2021, acronym: 'LASUSTECH' },
      { name: 'Lagos State University of Education', state: 'Lagos', city: 'Ijanikin', established: 2021, acronym: 'LASUED' },
      { name: 'Nasarawa State University, Keffi', state: 'Nasarawa', city: 'Keffi', established: 2002, acronym: 'NSUK' },
      { name: 'Niger Delta University, Yenagoa', state: 'Bayelsa', city: 'Yenagoa', established: 2000, acronym: 'NDU' },
      { name: 'Niger State University', state: 'Niger', city: 'Kutigi', established: 2021, acronym: 'NSU' },
      { name: 'Northwest University, Kano', state: 'Kano', city: 'Kano', established: 2012, acronym: 'NWU' },
      { name: 'Olabisi Onabanjo University', state: 'Ogun', city: 'Ago-Iwoye', established: 1982, acronym: 'OOU' },
      { name: 'Ondo State University of Science and Technology, Okitipupa', state: 'Ondo', city: 'Okitipupa', established: 2010, acronym: 'OSUSTECH' },
      { name: 'Osun State University, Oshogbo', state: 'Osun', city: 'Oshogbo', established: 2006, acronym: 'UNIOSUN' },
      { name: 'Plateau State University, Bokkos', state: 'Plateau', city: 'Bokkos', established: 2005, acronym: 'PLASU' },
      { name: 'Rivers State University', state: 'Rivers', city: 'Port Harcourt', established: 1972, acronym: 'RSU' },
      { name: 'Sokoto State University', state: 'Sokoto', city: 'Sokoto', established: 2009, acronym: 'SSU' },
      { name: 'Bamidele Olumilua University of Education, Science and Technology, Ikere', state: 'Ekiti', city: 'Ikere-Ekiti', established: 2021, acronym: 'BOUESTI' },
      { name: 'Oyo State University of Education, Eruwa', state: 'Oyo', city: 'Eruwa', established: 2021, acronym: 'OSUED' },
      { name: 'Tai Solarin University of Education', state: 'Ogun', city: 'Ijebu-Ode', established: 2005, acronym: 'TASUED' },
      { name: 'Taraba State University, Jalingo', state: 'Taraba', city: 'Jalingo', established: 2008, acronym: 'TSU' },
      { name: 'Umaru Musa Yar\'Adua University, Katsina', state: 'Katsina', city: 'Katsina', established: 2006, acronym: 'UMYU' },
      { name: 'Yobe State University, Damaturu', state: 'Yobe', city: 'Damaturu', established: 2006, acronym: 'YSU' },
      { name: 'Zamfara State University', state: 'Zamfara', city: 'Talata Mafara', established: 2018, acronym: 'ZSU' },
      { name: 'Sule Lamido University, Kafin Hausa', state: 'Jigawa', city: 'Kafin Hausa', established: 2013, acronym: 'SLU' }
    ],
    private: [
      { name: 'Afe Babalola University', state: 'Ekiti', city: 'Ado-Ekiti', established: 2009, acronym: 'ABUAD' },
      { name: 'Adekunle Ajasin University', state: 'Ondo', city: 'Akungba-Akoko', established: 1999, acronym: 'AAUA' },
      { name: 'Al-Ansar University, Maiduguri', state: 'Borno', city: 'Maiduguri', established: 2022, acronym: 'AUM' },
      { name: 'Al-Hikmah University, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2005, acronym: 'AL-HIKMAH' },
      { name: 'American University of Nigeria, Yola', state: 'Adamawa', city: 'Yola', established: 2004, acronym: 'AUN' },
      { name: 'Augustine University, Ilara', state: 'Lagos', city: 'Ilara', established: 2015, acronym: 'AUI' },
      { name: 'Babcock University', state: 'Ogun', city: 'Ilishan-Remo', established: 1999, acronym: 'BABCOCK' },
      { name: 'Baze University, Abuja', state: 'FCT', city: 'Abuja', established: 2011, acronym: 'BAZE' },
      { name: 'Bells University of Technology, Ota', state: 'Ogun', city: 'Ota', established: 2004, acronym: 'BELLS' },
      { name: 'Benson Idahosa University, Benin City', state: 'Edo', city: 'Benin City', established: 2002, acronym: 'BIU' },
      { name: 'Bingham University, New Karu', state: 'Nasarawa', city: 'New Karu', established: 2005, acronym: 'BINGHAM' },
      { name: 'Bowen University, Iwo', state: 'Osun', city: 'Iwo', established: 2001, acronym: 'BOWEN' },
      { name: 'Caleb University, Imota', state: 'Lagos', city: 'Imota', established: 2007, acronym: 'CALEB' },
      { name: 'Caron University, Omu-Aran', state: 'Kwara', city: 'Omu-Aran', established: 2021, acronym: 'CARON' },
      { name: 'Chrisland University, Abeokuta', state: 'Ogun', city: 'Abeokuta', established: 2015, acronym: 'CHRISLAND' },
      { name: 'Christopher University, Mowe', state: 'Ogun', city: 'Mowe', established: 2015, acronym: 'CU' },
      { name: 'Covenant University, Ota', state: 'Ogun', city: 'Ota', established: 2002, acronym: 'CU' },
      { name: 'Crawford University, Igbesa', state: 'Ogun', city: 'Igbesa', established: 2005, acronym: 'CRAWFORD' },
      { name: 'Crescent University, Abeokuta', state: 'Ogun', city: 'Abeokuta', established: 2005, acronym: 'CU' },
      { name: 'Dominican University, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2016, acronym: 'DU' },
      { name: 'Edwin Clark University, Kaigbodo', state: 'Delta', city: 'Kaigbodo', established: 2015, acronym: 'ECU' },
      { name: 'Elizade University, Ilara-Mokin', state: 'Ondo', city: 'Ilara-Mokin', established: 2012, acronym: 'EU' },
      { name: 'Evangel University, Akaeze', state: 'Ebonyi', city: 'Akaeze', established: 2012, acronym: 'EU' },
      { name: 'Fountain University, Oshogbo', state: 'Osun', city: 'Oshogbo', established: 2007, acronym: 'FUO' },
      { name: 'Godfrey Okoye University, Enugu', state: 'Enugu', city: 'Enugu', established: 2009, acronym: 'GOU' },
      { name: 'Gregory University, Uturu', state: 'Abia', city: 'Uturu', established: 2012, acronym: 'GUU' },
      { name: 'Havilla University, Ikom', state: 'Cross River', city: 'Ikom', established: 2021, acronym: 'HAVILLA' },
      { name: 'Hezekiah University, Umudi', state: 'Imo', city: 'Umudi', established: 2015, acronym: 'HEZEKIAH' },
      { name: 'Hodos University, Abuja', state: 'FCT', city: 'Abuja', established: 2021, acronym: 'HODOS' },
      { name: 'Igbinedion University, Okada', state: 'Edo', city: 'Okada', established: 1999, acronym: 'IUO' },
      { name: 'Joseph Ayo Babalola University, Ikeji-Arakeji', state: 'Osun', city: 'Ikeji-Arakeji', established: 2006, acronym: 'JABU' },
      { name: 'Kampala International University (KIU)', state: 'FCT', city: 'Abuja', established: 2013, acronym: 'KIU' },
      { name: 'Khadija University', state: 'Jigawa', city: 'Dutse', established: 2021, acronym: 'KHU' },
      { name: 'Kings University, Ode-Omu', state: 'Osun', city: 'Ode-Omu', established: 2015, acronym: 'KINGS' },
      { name: 'Landmark University, Omu-Aran', state: 'Kwara', city: 'Omu-Aran', established: 2011, acronym: 'LMU' },
      { name: 'Lead City University, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2005, acronym: 'LCU' },
      { name: 'Lorik International University', state: 'FCT', city: 'Abuja', established: 2021, acronym: 'LIU' },
      { name: 'Madonna University, Okija', state: 'Anambra', city: 'Okija', established: 1999, acronym: 'MADONNA' },
      { name: 'McPherson University, Seriki Sotayo', state: 'Ogun', city: 'Seriki Sotayo', established: 2012, acronym: 'MCPU' },
      { name: 'Miva Open University', state: 'FCT', city: 'Abuja', established: 2022, acronym: 'MIVA' },
      { name: 'Mountain Top University', state: 'Ogun', city: 'Magboro', established: 2015, acronym: 'MTU' },
      { name: 'Nile University of Nigeria, Abuja', state: 'FCT', city: 'Abuja', established: 2008, acronym: 'NILE' },
      { name: 'Novena University, Ogume', state: 'Delta', city: 'Ogume', established: 2005, acronym: 'NU' },
      { name: 'Obong University, Obong Ntak', state: 'Akwa Ibom', city: 'Obong Ntak', established: 2006, acronym: 'OBONG' },
      { name: 'Oduduwa University, Ipetumodu', state: 'Osun', city: 'Ipetumodu', established: 2009, acronym: 'OU' },
      { name: 'Pan-Atlantic University, Lagos', state: 'Lagos', city: 'Lagos', established: 2002, acronym: 'PAU' },
      { name: 'Paul University, Awka', state: 'Anambra', city: 'Awka', established: 2009, acronym: 'PAUL' },
      { name: 'Peter University, Achina-Onneh', state: 'Anambra', city: 'Achina-Onneh', established: 2021, acronym: 'PU' },
      { name: 'Phillips University, Kaura Namoda', state: 'Zamfara', city: 'Kaura Namoda', established: 2021, acronym: 'PHILLIPS' },
      { name: 'Precious Cornerstone University, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2018, acronym: 'PCU' },
      { name: 'Redeemer\'s University, Ede', state: 'Osun', city: 'Ede', established: 2005, acronym: 'RUN' },
      { name: 'Renaissance University, Enugu', state: 'Enugu', city: 'Enugu', established: 2005, acronym: 'RNU' },
      { name: 'Rhema University, Aba', state: 'Abia', city: 'Aba', established: 2009, acronym: 'RHEMA' },
      { name: 'Ritman University, Ikot Ekpene', state: 'Akwa Ibom', city: 'Ikot Ekpene', established: 2015, acronym: 'RITMAN' },
      { name: 'Salem University, Lokoja', state: 'Kogi', city: 'Lokoja', established: 2007, acronym: 'SALEM' },
      { name: 'Sam Maris University', state: 'Ondo', city: 'Akure', established: 2021, acronym: 'SMU' },
      { name: 'Skyline University Nigeria', state: 'Kano', city: 'Kano', established: 2018, acronym: 'SUN' },
      { name: 'Southwestern University, Oku Owa', state: 'Ogun', city: 'Oku Owa', established: 2012, acronym: 'SWU' },
      { name: 'Spiritan University, Nneochi', state: 'Abia', city: 'Nneochi', established: 2017, acronym: 'SPIRITAN' },
      { name: 'Summit University, Offa', state: 'Kwara', city: 'Offa', established: 2015, acronym: 'SU' },
      { name: 'Tansian University, Umunya', state: 'Anambra', city: 'Umunya', established: 2007, acronym: 'TANSIAN' },
      { name: 'Thomas Adewumi University, Oko Irese', state: 'Kwara', city: 'Oko Irese', established: 2021, acronym: 'TAU' },
      { name: 'Topfaith University, Mkpatak', state: 'Akwa Ibom', city: 'Mkpatak', established: 2021, acronym: 'TFU' },
      { name: 'Trinity University, Ogun', state: 'Ogun', city: 'Lagos', established: 2018, acronym: 'TU' },
      { name: 'University of Mkar, Mkar-Gboko', state: 'Benue', city: 'Mkar-Gboko', established: 2005, acronym: 'UNIMKAR' },
      { name: 'Veritas University, Abuja', state: 'FCT', city: 'Abuja', established: 2007, acronym: 'VERITAS' },
      { name: 'Wellspring University, Irhirhi', state: 'Edo', city: 'Irhirhi', established: 2009, acronym: 'WU' },
      { name: 'Westland University, Iwo', state: 'Osun', city: 'Iwo', established: 2019, acronym: 'WU' },
      { name: 'Western Delta University, Oghara', state: 'Delta', city: 'Oghara', established: 2006, acronym: 'WDU' },
      { name: 'Wesley University, Ondo', state: 'Ondo', city: 'Ondo', established: 2007, acronym: 'WESLEY' },
      { name: 'Witben University', state: 'FCT', city: 'Abuja', established: 2019, acronym: 'WITBEN' },
      { name: 'Xavier University, Abuja', state: 'FCT', city: 'Abuja', established: 2021, acronym: 'XAVIER' }
    ]
  },
  poly: {
    federal: [
      { name: 'Federal Polytechnic, Ado Ekiti', state: 'Ekiti', city: 'Ado-Ekiti', established: 1977, acronym: 'FEDPOLYADO' },
      { name: 'Federal Polytechnic, Auchi', state: 'Edo', city: 'Auchi', established: 1964, acronym: 'AUCHIPOLY' },
      { name: 'Federal Polytechnic, Bauchi', state: 'Bauchi', city: 'Bauchi', established: 1979, acronym: 'FPTB' },
      { name: 'Federal Polytechnic, Bida', state: 'Niger', city: 'Bida', established: 1979, acronym: 'BIDAPOLY' },
      { name: 'Federal Polytechnic, Damaturu', state: 'Yobe', city: 'Damaturu', established: 2019, acronym: 'FEDPODAM' },
      { name: 'Federal Polytechnic, Ede', state: 'Osun', city: 'Ede', established: 1992, acronym: 'FEDPOLYEDE' },
      { name: 'Federal Polytechnic, Ekowe', state: 'Bayelsa', city: 'Ekowe', established: 2007, acronym: 'FEDPONEKOWE' },
      { name: 'Federal Polytechnic, Ilaro', state: 'Ogun', city: 'Ilaro', established: 1979, acronym: 'FEDPOLYILARO' },
      { name: 'Federal Polytechnic, Kaura Namoda', state: 'Zamfara', city: 'Kaura Namoda', established: 1983, acronym: 'FEDPONAMODA' },
      { name: 'Federal Polytechnic, Mubi', state: 'Adamawa', city: 'Mubi', established: 1979, acronym: 'MUBIPOLY' },
      { name: 'Federal Polytechnic, Nasarawa', state: 'Nasarawa', city: 'Nasarawa', established: 1983, acronym: 'FEDPOLYNASARAWA' },
      { name: 'Federal Polytechnic, Nekede', state: 'Imo', city: 'Nekede', established: 1978, acronym: 'FEDPOLYNEKEDE' },
      { name: 'Federal Polytechnic, Offa', state: 'Kwara', city: 'Offa', established: 1992, acronym: 'FEDPOFFA' },
      { name: 'Federal Polytechnic, Oko', state: 'Anambra', city: 'Oko', established: 1979, acronym: 'OKOPOLY' },
      { name: 'Federal School of Dental Technology & Therapy, Enugu', state: 'Enugu', city: 'Enugu', established: 2008, acronym: 'FEDDENTECH' },
      { name: 'Federal College of Animal Health & Production Technology, Ibadan', state: 'Oyo', city: 'Ibadan', established: 1966, acronym: 'FCAHPTI' },
      { name: 'Federal College of Chemical & Leather Technology (Chemtech), Zaria', state: 'Kaduna', city: 'Zaria', established: 1971, acronym: 'CHEMTECH' },
      { name: 'Federal College of Dental Technology, Enugu', state: 'Enugu', city: 'Enugu', established: 1958, acronym: 'FCDT' },
      { name: 'Federal College of Fisheries & Marine Technology, Lagos', state: 'Lagos', city: 'Lagos', established: 1960, acronym: 'FCFMT' },
      { name: 'Federal College of Forestry, Ibadan', state: 'Oyo', city: 'Ibadan', established: 1948, acronym: 'FCF' },
      { name: 'Federal College of Forestry, Jos', state: 'Plateau', city: 'Jos', established: 1972, acronym: 'FCFJ' },
      { name: 'Federal College of Land Resources Technology, Owerri', state: 'Imo', city: 'Owerri', established: 1974, acronym: 'FECOLART' },
      { name: 'Federal College of Wildlife Management, New Bussa', state: 'Niger', city: 'New Bussa', established: 1971, acronym: 'FCWM' },
      { name: 'Nigerian Institute of Surveyors (Surveying & Geoinformatics)', state: 'Oyo', city: 'Ibadan', established: 2012, acronym: 'NIS' }
    ],
    state: [
      { name: 'Abia State Polytechnic, Aba', state: 'Abia', city: 'Aba', established: 1992, acronym: 'ABIAPOLY' },
      { name: 'Adamawa State Polytechnic, Yola', state: 'Adamawa', city: 'Yola', established: 1991, acronym: 'ADAMPOLY' },
      { name: 'Akwa Ibom State Polytechnic, Ikot Osurua', state: 'Akwa Ibom', city: 'Ikot Osurua', established: 2005, acronym: 'AKWAIBOMPOLY' },
      { name: 'Anambra State Polytechnic, Mgbakwu', state: 'Anambra', city: 'Mgbakwu', established: 2008, acronym: 'ANAMBRAPOLY' },
      { name: 'Bayelsa State Polytechnic, Aleibiri', state: 'Bayelsa', city: 'Aleibiri', established: 2007, acronym: 'BAYELSAPOLY' },
      { name: 'Benue State Polytechnic, Ugbokolo', state: 'Benue', city: 'Ugbokolo', established: 2008, acronym: 'BENUEPOLY' },
      { name: 'Cross River State Polytechnic, Calabar', state: 'Cross River', city: 'Calabar', established: 2009, acronym: 'CRSPOLY' },
      { name: 'Delta State Polytechnic, Ogwashi-Uku', state: 'Delta', city: 'Ogwashi-Uku', established: 2004, acronym: 'DSPG' },
      { name: 'Delta State Polytechnic, Otefe-Oghara', state: 'Delta', city: 'Otefe-Oghara', established: 2002, acronym: 'DSPO' },
      { name: 'Delta State Polytechnic, Ozoro', state: 'Delta', city: 'Ozoro', established: 2008, acronym: 'DSPZ' },
      { name: 'Ebonyi State Polytechnic, Uwana', state: 'Ebonyi', city: 'Uwana', established: 2008, acronym: 'EBONYPOLY' },
      { name: 'Edo State Polytechnic, Usen', state: 'Edo', city: 'Usen', established: 2002, acronym: 'EDOPOLY' },
      { name: 'Ekiti State Polytechnic, Isan-Ekiti', state: 'Ekiti', city: 'Isan-Ekiti', established: 2022, acronym: 'EKSPOLY' },
      { name: 'Enugu State Polytechnic, Iwollo', state: 'Enugu', city: 'Iwollo', established: 2008, acronym: 'ENUGUPOLY' },
      { name: 'Gombe State Polytechnic, Bajoga', state: 'Gombe', city: 'Bajoga', established: 2012, acronym: 'GSPOLY' },
      { name: 'Imo State Polytechnic, Umuagwo', state: 'Imo', city: 'Umuagwo', established: 2008, acronym: 'IMOPOLY' },
      { name: 'Jigawa State Polytechnic, Dutse', state: 'Jigawa', city: 'Dutse', established: 2008, acronym: 'JIGPOLY' },
      { name: 'Kaduna State Polytechnic, Zaria', state: 'Kaduna', city: 'Zaria', established: 1968, acronym: 'KASPOLY' },
      { name: 'Kano State Polytechnic, Kano', state: 'Kano', city: 'Kano', established: 1976, acronym: 'KANOPOLY' },
      { name: 'Katsina State Polytechnic, Katsina', state: 'Katsina', city: 'Katsina', established: 2009, acronym: 'KATSPOLY' },
      { name: 'Kebbi State Polytechnic, Dakingari', state: 'Kebbi', city: 'Dakingari', established: 2010, acronym: 'KEBBIPOLY' },
      { name: 'Kogi State Polytechnic, Lokoja', state: 'Kogi', city: 'Lokoja', established: 1993, acronym: 'KOGIPOLY' },
      { name: 'Kwara State Polytechnic, Ilorin', state: 'Kwara', city: 'Ilorin', established: 1972, acronym: 'KWARAPOLY' },
      { name: 'Lagos State Polytechnic (now Lagos State University of Science and Technology)', state: 'Lagos', city: 'Ikorodu', established: 1977, acronym: 'LASPOTECH' },
      { name: 'Nasarawa State Polytechnic, Lafia', state: 'Nasarawa', city: 'Lafia', established: 2005, acronym: 'NASPOLY' },
      { name: 'Niger State Polytechnic, Zungeru', state: 'Niger', city: 'Zungeru', established: 2002, acronym: 'NIGERPOLY' },
      { name: 'Ogun State Polytechnic, Eruwa (now OSUED)', state: 'Oyo', city: 'Eruwa', established: 2021, acronym: 'OGUNPOLY' },
      { name: 'Ondo State Polytechnic, Owo (now OSUSTECH)', state: 'Ondo', city: 'Owo', established: 2020, acronym: 'OSPOLY' },
      { name: 'Osun State Polytechnic, Iree', state: 'Osun', city: 'Iree', established: 1992, acronym: 'OSPOLYIREE' },
      { name: 'Oyo State Polytechnic, Ibadan (now OSUED)', state: 'Oyo', city: 'Ibadan', established: 2021, acronym: 'OYOPOLY' },
      { name: 'Plateau State Polytechnic, Barkin Ladi', state: 'Plateau', city: 'Barkin Ladi', established: 2003, acronym: 'PLASPOLY' },
      { name: 'Rivers State Polytechnic, Bori', state: 'Rivers', city: 'Bori', established: 2009, acronym: 'RIVPOLY' },
      { name: 'Sokoto State Polytechnic, Sokoto', state: 'Sokoto', city: 'Sokoto', established: 1993, acronym: 'SOKPOLY' },
      { name: 'Taraba State Polytechnic, Serti', state: 'Taraba', city: 'Serti', established: 2009, acronym: 'TSPOLY' },
      { name: 'Yobe State Polytechnic, Potiskum', state: 'Yobe', city: 'Potiskum', established: 2009, acronym: 'YOBEPOLY' },
      { name: 'Zamfara State Polytechnic, Talata Mafara', state: 'Zamfara', city: 'Talata Mafara', established: 2002, acronym: 'ZAMPOLY' }
    ],
    private: [
      { name: 'Allover Central Polytechnic, Ota', state: 'Ogun', city: 'Ota', established: 2009, acronym: 'ACP' },
      { name: 'Crestfield College of Health Technology, Abeokuta', state: 'Ogun', city: 'Abeokuta', established: 2015, acronym: 'CRESTFIELD' },
      { name: 'Dorben Polytechnic, Abuja', state: 'FCT', city: 'Abuja', established: 2007, acronym: 'DORBEN' },
      { name: 'Grace Polytechnic, Surulere', state: 'Lagos', city: 'Surulere', established: 2010, acronym: 'GRACE' },
      { name: 'Interlink Polytechnic, Ijebu-Jesa', state: 'Osun', city: 'Ijebu-Jesa', established: 2012, acronym: 'INTERLINK' },
      { name: 'Lighthouse Polytechnic, Evbuobanosa', state: 'Edo', city: 'Evbuobanosa', established: 2008, acronym: 'LIGHTHOUSE' },
      { name: 'Loreto Polytechnic, Umuahia', state: 'Abia', city: 'Umuahia', established: 2016, acronym: 'LORETO' },
      { name: 'Maritime Academy of Nigeria, Oron', state: 'Akwa Ibom', city: 'Oron', established: 1979, acronym: 'MANORON' },
      { name: 'Primark Polytechnic, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2012, acronym: 'PRIMARK' },
      { name: 'Ramat Polytechnic, Maiduguri', state: 'Borno', city: 'Maiduguri', established: 1976, acronym: 'RAMAT' },
      { name: 'Shaka Polytechnic, Benin City', state: 'Edo', city: 'Benin City', established: 2011, acronym: 'SHAKA' },
      { name: 'Temple Gate Polytechnic, Aba', state: 'Abia', city: 'Aba', established: 2011, acronym: 'TEMPLE' },
      { name: 'The Polytechnic, Igbo Owu', state: 'Osun', city: 'Igbo Owu', established: 2010, acronym: 'TPIO' },
      { name: 'Wolex Polytechnic, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2012, acronym: 'WOLEX' }
    ]
  },
  coe: {
    federal: [
      { name: 'Federal College of Education, Abeokuta', state: 'Ogun', city: 'Abeokuta', established: 1976, acronym: 'FCEABK' },
      { name: 'Federal College of Education, Akoka', state: 'Lagos', city: 'Akoka', established: 1964, acronym: 'FCEAKOKA' },
      { name: 'Federal College of Education, Eha-Amufu', state: 'Enugu', city: 'Eha-Amufu', established: 1974, acronym: 'FCEEA' },
      { name: 'Federal College of Education, Iwo', state: 'Osun', city: 'Iwo', established: 1979, acronym: 'FCEIWO' },
      { name: 'Federal College of Education, Kano', state: 'Kano', city: 'Kano', established: 1976, acronym: 'FCEKANO' },
      { name: 'Federal College of Education, Katsina', state: 'Katsina', city: 'Katsina', established: 1974, acronym: 'FCEKATSINA' },
      { name: 'Federal College of Education, Kontagora', state: 'Niger', city: 'Kontagora', established: 1976, acronym: 'FCEKONTAGORA' },
      { name: 'Federal College of Education, Obudu', state: 'Cross River', city: 'Obudu', established: 1981, acronym: 'FCEOBUDU' },
      { name: 'Federal College of Education, Okene', state: 'Kogi', city: 'Okene', established: 1975, acronym: 'FCEOKENE' },
      { name: 'Federal College of Education, Omoku', state: 'Rivers', city: 'Omoku', established: 1981, acronym: 'FCEOMOKU' },
      { name: 'Federal College of Education, Ondo', state: 'Ondo', city: 'Ondo', established: 1976, acronym: 'FCEONDO' },
      { name: 'Federal College of Education, Osiele (Abeokuta)', state: 'Ogun', city: 'Osiele', established: 1976, acronym: 'FCEOSIELE' },
      { name: 'Federal College of Education, Oyo', state: 'Oyo', city: 'Oyo', established: 1976, acronym: 'FCEOYO' },
      { name: 'Federal College of Education, Pankshin', state: 'Plateau', city: 'Pankshin', established: 1975, acronym: 'FCEPANKSHIN' },
      { name: 'Federal College of Education, Potiskum', state: 'Yobe', city: 'Potiskum', established: 1976, acronym: 'FCEPOTISKUM' },
      { name: 'Federal College of Education, Technical, Akoka', state: 'Lagos', city: 'Akoka', established: 1967, acronym: 'FCETAKOKA' },
      { name: 'Federal College of Education, Technical, Asaba', state: 'Delta', city: 'Asaba', established: 1981, acronym: 'FCETASABA' },
      { name: 'Federal College of Education, Technical, Bichi', state: 'Kano', city: 'Bichi', established: 1976, acronym: 'FCETBICHI' },
      { name: 'Federal College of Education, Technical, Gombe', state: 'Gombe', city: 'Gombe', established: 1977, acronym: 'FCETGOMBE' },
      { name: 'Federal College of Education, Technical, Gusau', state: 'Zamfara', city: 'Gusau', established: 1981, acronym: 'FCETGUSAU' },
      { name: 'Federal College of Education, Technical, Omoku', state: 'Rivers', city: 'Omoku', established: 1981, acronym: 'FCETOMOKU' },
      { name: 'Federal College of Education, Technical, Umunze', state: 'Anambra', city: 'Umunze', established: 1974, acronym: 'FCETUMUNZE' },
      { name: 'Federal College of Education, Yola', state: 'Adamawa', city: 'Yola', established: 1975, acronym: 'FCEYOLA' },
      { name: 'Federal College of Education, Zaria (now FUEZ)', state: 'Kaduna', city: 'Zaria', established: 1973, acronym: 'FCEZARIA' }
    ],
    state: [
      { name: 'Abia State College of Education, Arochukwu', state: 'Abia', city: 'Arochukwu', established: 1991, acronym: 'ABIACOE' },
      { name: 'Adamawa State College of Education, Hong', state: 'Adamawa', city: 'Hong', established: 2008, acronym: 'ADCOEHONG' },
      { name: 'Akwa Ibom State College of Education, Afaha Nsit', state: 'Akwa Ibom', city: 'Afaha Nsit', established: 2008, acronym: 'AKSCOE' },
      { name: 'Anambra State College of Education, Awka (now Nwafor Orizu College of Education)', state: 'Anambra', city: 'Nsugbe', established: 2010, acronym: 'NOCOE' },
      { name: 'Bauchi State College of Education, Azare', state: 'Bauchi', city: 'Azare', established: 1991, acronym: 'COEAZARE' },
      { name: 'Bauchi State College of Education, Kangere', state: 'Bauchi', city: 'Kangere', established: 2012, acronym: 'COEKANGERE' },
      { name: 'Bayelsa State College of Education, Sagbama', state: 'Bayelsa', city: 'Sagbama', established: 2011, acronym: 'BAYELSACOE' },
      { name: 'Benue State College of Education, Oju', state: 'Benue', city: 'Oju', established: 2011, acronym: 'BENCOE' },
      { name: 'Borno State College of Education, Maiduguri', state: 'Borno', city: 'Maiduguri', established: 2008, acronym: 'BORNOCOE' },
      { name: 'College of Education, Agbor', state: 'Delta', city: 'Agbor', established: 1982, acronym: 'COEAGBOR' },
      { name: 'College of Education, Ekidolor (Benin City)', state: 'Edo', city: 'Benin City', established: 1979, acronym: 'COEEKIDOLOR' },
      { name: 'College of Education, Gidan-Waya', state: 'Kaduna', city: 'Gidan-Waya', established: 1977, acronym: 'COEGIDANWAYA' },
      { name: 'College of Education, Ikere-Ekiti (now BOUESTI)', state: 'Ekiti', city: 'Ikere-Ekiti', established: 1982, acronym: 'COEIKERE' },
      { name: 'College of Education, Jalingo', state: 'Taraba', city: 'Jalingo', established: 2010, acronym: 'COEJALINGO' },
      { name: 'College of Education, Katsina-Ala', state: 'Benue', city: 'Katsina-Ala', established: 2008, acronym: 'COEKATSINAALA' },
      { name: 'College of Education, Lafia', state: 'Nasarawa', city: 'Lafia', established: 2010, acronym: 'COELAFIA' },
      { name: 'College of Education, Maru', state: 'Zamfara', city: 'Maru', established: 1991, acronym: 'COEMARU' },
      { name: 'College of Education, Oju', state: 'Benue', city: 'Oju', established: 2011, acronym: 'COEOJU' },
      { name: 'College of Education, Warri', state: 'Delta', city: 'Warri', established: 2008, acronym: 'COEWARRI' },
      { name: 'Delta State College of Education, Mosogar', state: 'Delta', city: 'Mosogar', established: 2008, acronym: 'DSCOEMOSOGAR' },
      { name: 'Ebonyi State College of Education, Ikwo', state: 'Ebonyi', city: 'Ikwo', established: 2008, acronym: 'EBONYICDE' },
      { name: 'Enugu State College of Education (Technical), Enugu', state: 'Enugu', city: 'Enugu', established: 2008, acronym: 'ESCET' },
      { name: 'Gombe State College of Education, Billiri', state: 'Gombe', city: 'Billiri', established: 2012, acronym: 'GOMBECOE' },
      { name: 'Ignatius Ajuru University of Education', state: 'Rivers', city: 'Port Harcourt', established: 2010, acronym: 'IAUE' },
      { name: 'Imo State College of Education, Ikeduru', state: 'Imo', city: 'Ikeduru', established: 2010, acronym: 'IMSCOE' },
      { name: 'Jigawa State College of Education, Gumel', state: 'Jigawa', city: 'Gumel', established: 2011, acronym: 'JICEGUMEL' },
      { name: 'Kaduna State College of Education, Gidan Waya', state: 'Kaduna', city: 'Gidan-Waya', established: 1977, acronym: 'KASCOE' },
      { name: 'Kano State College of Education, Kano', state: 'Kano', city: 'Kano', established: 2008, acronym: 'KANOCDE' },
      { name: 'Katsina State College of Education, Dutsin-Ma', state: 'Katsina', city: 'Dutsin-Ma', established: 2011, acronym: 'KATSINACOE' },
      { name: 'Kebbi State College of Education, Argungu', state: 'Kebbi', city: 'Argungu', established: 2012, acronym: 'KEBCOE' },
      { name: 'Kogi State College of Education, Ankpa', state: 'Kogi', city: 'Ankpa', established: 2008, acronym: 'KOGICDE' },
      { name: 'Kogi State College of Education, Kabba', state: 'Kogi', city: 'Kabba', established: 2008, acronym: 'KOGICDEKABBA' },
      { name: 'Kwara State College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2008, acronym: 'KWCOEILORIN' },
      { name: 'Kwara State College of Education, Oro', state: 'Kwara', city: 'Oro', established: 2011, acronym: 'KWCOEORO' },
      { name: 'Lagos State College of Education, Ijanikin (now LASUED)', state: 'Lagos', city: 'Ijanikin', established: 1958, acronym: 'LASCOED' },
      { name: 'Nasarawa State College of Education, Akwanga', state: 'Nasarawa', city: 'Akwanga', established: 2011, acronym: 'NASCOE' },
      { name: 'Niger State College of Education, Minna', state: 'Niger', city: 'Minna', established: 2010, acronym: 'NIGCOE' },
      { name: 'Nwafor Orizu College of Education, Nsugbe', state: 'Anambra', city: 'Nsugbe', established: 2010, acronym: 'NOCOE' },
      { name: 'Ogun State College of Education, Ijebu-Ode (now TASUED)', state: 'Ogun', city: 'Ijebu-Ode', established: 2005, acronym: 'OGUNCOE' },
      { name: 'Ondo State College of Education, Ikere (now BOUESTI)', state: 'Ekiti', city: 'Ikere-Ekiti', established: 1982, acronym: 'OSCE' },
      { name: 'Osun State College of Education, Ila-Orangun', state: 'Osun', city: 'Ila-Orangun', established: 2011, acronym: 'OSCEILA' },
      { name: 'Osun State College of Education, Ilesa', state: 'Osun', city: 'Ilesa', established: 2011, acronym: 'OSCEILESA' },
      { name: 'Oyo State College of Education, Oyo (now OSUED)', state: 'Oyo', city: 'Oyo', established: 2021, acronym: 'OSCOED' },
      { name: 'Plateau State College of Education, Gindiri', state: 'Plateau', city: 'Gindiri', established: 2011, acronym: 'PLASCOE' },
      { name: 'Rivers State College of Education, Port Harcourt', state: 'Rivers', city: 'Port Harcourt', established: 2012, acronym: 'RIVCOE' },
      { name: 'Sokoto State College of Education, Sokoto', state: 'Sokoto', city: 'Sokoto', established: 2008, acronym: 'SOKCOE' },
      { name: 'Tai Solarin College of Education, Ijebu-Ode (now TASUED)', state: 'Ogun', city: 'Ijebu-Ode', established: 1977, acronym: 'TASCE' },
      { name: 'Taraba State College of Education, Bali', state: 'Taraba', city: 'Bali', established: 2011, acronym: 'TARCOE' },
      { name: 'Yobe State College of Education, Gashua', state: 'Yobe', city: 'Gashua', established: 2011, acronym: 'YOBECOE' },
      { name: 'Zamfara State College of Education, Maru', state: 'Zamfara', city: 'Maru', established: 1991, acronym: 'ZAMCOE' }
    ],
    private: [
      { name: 'Ansar-Ud-Deen College of Education, Lagos', state: 'Lagos', city: 'Lagos', established: 2010, acronym: 'ADCOE' },
      { name: 'Christ College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2012, acronym: 'CHRISTCOE' },
      { name: 'City College of Education, Mararaba', state: 'Nasarawa', city: 'Mararaba', established: 2015, acronym: 'CITYCOE' },
      { name: 'Clara College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2016, acronym: 'CLARACOE' },
      { name: 'College of Education, Iloro (AFRITECH)', state: 'Osun', city: 'Iloro', established: 2008, acronym: 'AFRITECH' },
      { name: 'D.S. Adegbenro College of Education, Ifo', state: 'Ogun', city: 'Ifo', established: 2011, acronym: 'DSACOE' },
      { name: 'Emmanuel Alayande College of Education, Oyo (now OSUED)', state: 'Oyo', city: 'Oyo', established: 2021, acronym: 'EACOE' },
      { name: 'Fati College of Education, Zaria', state: 'Kaduna', city: 'Zaria', established: 2012, acronym: 'FATICOE' },
      { name: 'Havard Wilson College of Education, Yaba', state: 'Lagos', city: 'Yaba', established: 2013, acronym: 'HAVARD' },
      { name: 'Holy Child College of Education, Ikot Ekpene', state: 'Akwa Ibom', city: 'Ikot Ekpene', established: 2015, acronym: 'HOLYCHILD' },
      { name: 'ICOE (Ibadan College of Education)', state: 'Oyo', city: 'Ibadan', established: 2015, acronym: 'ICODE' },
      { name: 'Ifako College of Education, Lagos', state: 'Lagos', city: 'Lagos', established: 2015, acronym: 'IFAKOCOE' },
      { name: 'Immanuel College of Education, Lobi', state: 'Taraba', city: 'Lobi', established: 2016, acronym: 'IMMANUEL' },
      { name: 'Jachai College of Education, Yola', state: 'Adamawa', city: 'Yola', established: 2014, acronym: 'JACHAI' },
      { name: 'Kashim Ibrahim College of Education, Maiduguri', state: 'Borno', city: 'Maiduguri', established: 2012, acronym: 'KICOE' },
      { name: 'Muhyideen College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2013, acronym: 'MUHYIDEEN' },
      { name: 'Nana Aisha College of Education, Potiskum', state: 'Yobe', city: 'Potiskum', established: 2015, acronym: 'NANACOE' },
      { name: 'National College of Education, Ogwashi-Uku', state: 'Delta', city: 'Ogwashi-Uku', established: 2015, acronym: 'NATCOE' },
      { name: 'Ogeyi College of Education, Port Harcourt', state: 'Rivers', city: 'Port Harcourt', established: 2015, acronym: 'OGEYI' },
      { name: 'Oyo State College of Education, Oyo', state: 'Oyo', city: 'Oyo', established: 2021, acronym: 'OSCOED' },
      { name: 'Prime College of Education, Lagos', state: 'Lagos', city: 'Lagos', established: 2014, acronym: 'PRIME' },
      { name: 'Royal College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2016, acronym: 'ROYALCOE' },
      { name: 'Sir Michael Eneja College of Education, Enugu', state: 'Enugu', city: 'Enugu', established: 2014, acronym: 'SIRMECOE' },
      { name: 'St. Augustine College of Education, Lagos', state: 'Lagos', city: 'Lagos', established: 2013, acronym: 'STACOE' },
      { name: 'St. John College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2012, acronym: 'STJOHN' },
      { name: 'The Apostolic Church College of Education, Ibadan', state: 'Oyo', city: 'Ibadan', established: 2015, acronym: 'TACCOE' },
      { name: 'Victory College of Education, Ilorin', state: 'Kwara', city: 'Ilorin', established: 2016, acronym: 'VICTORYCOE' },
      { name: 'Yewa Central College of Education, Ilaro', state: 'Ogun', city: 'Ilaro', established: 2016, acronym: 'YCCE' }
    ]
  }
};

// Helper: get flat list of all institutions
function _hiAllInstitutions() {
  var all = [];
  var types = ['uni', 'poly', 'coe'];
  var cats = ['federal', 'state', 'private'];
  types.forEach(function(t) {
    cats.forEach(function(c) {
      (NIGERIAN_INSTITUTIONS[t][c] || []).forEach(function(inst) {
        all.push({ type: t, category: c, name: inst.name, state: inst.state, city: inst.city, established: inst.established, acronym: inst.acronym });
      });
    });
  });
  (data.customInstitutions || []).forEach(function(ci) {
    all.push({ type: ci.type, category: 'private', name: ci.name, state: ci.state, city: ci.city, established: 0, acronym: ci.acronym, custom: true });
  });
  return all;
}

// Helper: generate unique institution ID
function _hiInstId(name) {
  return 'HI_' + name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40).toUpperCase() + '_' + Date.now().toString(36);
}

// ===== MAIN RENDER =====
var _hiActiveTab = 'browser';

function renderHigherInstitutions() {
  var container = document.getElementById('hiView');
  if (!container) return;
  var tabs = [
    { key: 'browser', label: 'Institution Browser', icon: 'fa-search' },
    { key: 'alumni', label: 'Alumni Mapping', icon: 'fa-user-graduate' },
    { key: 'applicants', label: 'Applicant Mapping', icon: 'fa-file-signature' },
    { key: 'custom', label: 'Add Institution', icon: 'fa-plus-circle' }
  ];
  var html = '<div class="card-header"><h2><i class="fas fa-university"></i> Nigerian Higher Institutions Database</h2></div>'
    + '<p class="subtitle">Browse all Nigerian universities, polytechnics, and colleges of education. Map institutions to alumni and applicant records.</p>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">';
  tabs.forEach(function(t) {
    var active = t.key === _hiActiveTab ? ' style="background:var(--primary);color:#fff;border-color:var(--primary);"' : '';
    html += '<button class="btn btn-sm" onclick="_hiSwitchTab(\'' + t.key + '\')"' + active + '><i class="fas ' + t.icon + '"></i> ' + t.label + '</button>';
  });
  html += '</div><div id="hiTabContent">';
  container.innerHTML = html;
  _hiRenderTabContent();
}

function _hiSwitchTab(tab) {
  _hiActiveTab = tab;
  var container = document.getElementById('hiView');
  if (container) renderHigherInstitutions();
}

function _hiRenderTabContent() {
  var content = document.getElementById('hiTabContent');
  if (!content) return;
  switch (_hiActiveTab) {
    case 'browser': _hiRenderBrowser(content); break;
    case 'alumni': _hiRenderAlumniMapping(content); break;
    case 'applicants': _hiRenderApplicantMapping(content); break;
    case 'custom': _hiRenderCustom(content); break;
  }
}

// ===== TAB 1: INSTITUTION BROWSER =====
function _hiRenderBrowser(container) {
  var filterType = '_hiFilterType';
  var filterCat = '_hiFilterCat';
  var filterState = '_hiFilterState';
  var filterQ = '_hiFilterQ';

  var all = _hiAllInstitutions();
  var states = [];
  all.forEach(function(i) { if (states.indexOf(i.state) === -1) states.push(i.state); });
  states.sort();

  var selType = sessionStorage.getItem(filterType) || 'all';
  var selCat = sessionStorage.getItem(filterCat) || 'all';
  var selState = sessionStorage.getItem(filterState) || 'all';
  var q = sessionStorage.getItem(filterQ) || '';

  var filtered = all.filter(function(i) {
    if (selType !== 'all' && i.type !== selType) return false;
    if (selCat !== 'all' && i.category !== selCat) return false;
    if (selState !== 'all' && i.state !== selState) return false;
    if (q && i.name.toLowerCase().indexOf(q.toLowerCase()) === -1 && (i.acronym || '').toLowerCase().indexOf(q.toLowerCase()) === -1) return false;
    return true;
  });

  var html = '<div class="search-bar" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
    + '<input type="text" id="hiBrowserSearch" placeholder="Search institution name or acronym..." value="' + esc(q) + '" oninput="_hiApplySearch()" style="flex:1;min-width:180px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;background:var(--card-bg);color:var(--text);font-family:inherit;">'
    + '<select onchange="_hiApplyFilter()" id="hiFilterType" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;">'
    + '<option value="all"' + (selType === 'all' ? ' selected' : '') + '>All Types</option>'
    + '<option value="uni"' + (selType === 'uni' ? ' selected' : '') + '>Universities</option>'
    + '<option value="poly"' + (selType === 'poly' ? ' selected' : '') + '>Polytechnics</option>'
    + '<option value="coe"' + (selType === 'coe' ? ' selected' : '') + '>Colleges of Education</option>'
    + '</select>'
    + '<select onchange="_hiApplyFilter()" id="hiFilterCat" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;">'
    + '<option value="all"' + (selCat === 'all' ? ' selected' : '') + '>All Categories</option>'
    + '<option value="federal"' + (selCat === 'federal' ? ' selected' : '') + '>Federal</option>'
    + '<option value="state"' + (selCat === 'state' ? ' selected' : '') + '>State</option>'
    + '<option value="private"' + (selCat === 'private' ? ' selected' : '') + '>Private</option>'
    + '</select>'
    + '<select onchange="_hiApplyFilter()" id="hiFilterState" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;">'
    + '<option value="all"' + (selState === 'all' ? ' selected' : '') + '>All States</option>';
  states.forEach(function(s) {
    html += '<option value="' + esc(s) + '"' + (selState === s ? ' selected' : '') + '>' + esc(s) + '</option>';
  });
  html += '</select>'
    + '<span style="font-size:13px;color:var(--text-light);white-space:nowrap;">' + filtered.length + ' found</span>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">';

  var sliced = filtered.slice(0, 200);
  sliced.forEach(function(i) {
    var cat = NIGERIAN_INSTITUTIONS.typeLabel[i.type] || i.type;
    var catBadge = i.custom ? 'Custom' : (NIGERIAN_INSTITUTIONS.categoryLabel[i.category] || i.category);
    var badgeColor = i.category === 'federal' ? 'var(--primary)' : i.category === 'state' ? 'var(--success)' : 'var(--accent)';
    html += '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:14px;transition:var(--transition);">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">'
      + '<strong style="font-size:14px;">' + esc(i.name) + (i.acronym ? ' <span style="color:var(--text-light);font-size:11px;">(' + esc(i.acronym) + ')</span>' : '') + '</strong>'
      + '</div>'
      + '<div style="font-size:12px;color:var(--text-light);display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;">'
      + '<span style="background:' + badgeColor + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;">' + catBadge + '</span>'
      + '<span><i class="fas fa-tag"></i> ' + cat + '</span>'
      + '<span><i class="fas fa-map-marker-alt"></i> ' + esc(i.state) + (i.city ? ', ' + esc(i.city) : '') + '</span>'
      + (i.established ? '<span><i class="fas fa-calendar"></i> Est. ' + i.established + '</span>' : '')
      + (i.custom ? '<span style="color:var(--accent);"><i class="fas fa-star"></i> Custom</span>' : '')
      + '</div>'
      + '<div style="font-size:11px;display:flex;gap:6px;flex-wrap:wrap;">'
      + '<button class="btn btn-sm btn-outline" onclick="_hiAlumniMapTo(\'' + esc(i.name) + '\')" style="font-size:10px;padding:3px 8px;"><i class="fas fa-user-graduate"></i> Map to Alumni</button>'
      + '<button class="btn btn-sm btn-outline" onclick="_hiApplicantMapTo(\'' + esc(i.name) + '\')" style="font-size:10px;padding:3px 8px;"><i class="fas fa-file-signature"></i> Map to Applicant</button>'
      + '</div></div>';
  });
  if (!sliced.length) {
    html += '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-university"></i><p>No institutions match your filters</p></div>';
  } else if (filtered.length > 200) {
    html += '<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-light);font-size:13px;"><i class="fas fa-info-circle"></i> Showing 200 of ' + filtered.length + ' results. Refine your search.</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function _hiApplySearch() {
  var q = document.getElementById('hiBrowserSearch')?.value || '';
  sessionStorage.setItem('_hiFilterQ', q);
  _hiRenderBrowser(document.getElementById('hiTabContent'));
}

function _hiApplyFilter() {
  sessionStorage.setItem('_hiFilterType', document.getElementById('hiFilterType')?.value || 'all');
  sessionStorage.setItem('_hiFilterCat', document.getElementById('hiFilterCat')?.value || 'all');
  sessionStorage.setItem('_hiFilterState', document.getElementById('hiFilterState')?.value || 'all');
  _hiRenderBrowser(document.getElementById('hiTabContent'));
}

// ===== TAB 2: ALUMNI MAPPING =====
function _hiRenderAlumniMapping(container) {
  var list = data.alumni || [];
  var allInst = _hiAllInstitutions();
  var html = '<div class="search-bar" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
    + '<input type="text" id="hiAlumniSearch" placeholder="Search alumni name..." oninput="_hiRenderAlumniTable()" style="flex:1;min-width:200px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;background:var(--card-bg);color:var(--text);font-family:inherit;">'
    + '<span style="font-size:13px;color:var(--text-light);">' + list.length + ' alumni records</span>'
    + '<button class="btn btn-sm btn-outline" onclick="exportTableToCSV(\'hiAlumniTable\',\'alumni_institution_mapping\')"><i class="fas fa-download"></i> CSV</button>'
    + '</div>'
    + '<div class="table-responsive"><table><thead><tr><th>Alumni Name</th><th>Graduation Year</th><th>Current Institution</th><th>Mapped Institution</th><th>Actions</th></tr></thead><tbody id="hiAlumniTable">';
  list.forEach(function(a) {
    var currentOrg = a.organization || '';
    var mapped = a.institutionId || '';
    var mappedName = '';
    if (mapped) {
      var found = allInst.find(function(i) { return i.name === mapped; });
      if (found) mappedName = found.name + (found.acronym ? ' (' + found.acronym + ')' : '');
      else mappedName = mapped;
    }
    html += '<tr>'
      + '<td><strong>' + esc(a.name) + '</strong></td>'
      + '<td>' + esc(a.graduationYear || '') + '</td>'
      + '<td>' + esc(currentOrg || '—') + '</td>'
      + '<td>' + (mappedName ? '<span style="background:#e8f5e9;padding:2px 8px;border-radius:4px;font-size:12px;">' + esc(mappedName) + '</span>' : '<span style="color:var(--text-light);font-size:12px;">Not mapped</span>') + '</td>'
      + '<td><button class="btn btn-sm btn-outline" onclick="_hiMapAlumni(\'' + esc(a.id) + '\')" style="font-size:11px;"><i class="fas fa-map-marker-alt"></i> Map</button>'
      + (mapped ? ' <button class="btn btn-sm btn-danger" onclick="_hiUnmapAlumni(\'' + esc(a.id) + '\')" style="font-size:11px;"><i class="fas fa-times"></i></button>' : '')
      + '</td></tr>';
  });
  html += '</tbody></table></div>';
  if (!list.length) html += '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>No alumni records. Add alumni first.</p></div>';
  container.innerHTML = html;
}

function _hiRenderAlumniTable() {
  _hiRenderAlumniMapping(document.getElementById('hiTabContent'));
}

function _hiMapAlumni(alumniId) {
  var a = (data.alumni || []).find(function(r) { return r.id === alumniId; });
  if (!a) return;
  var allInst = _hiAllInstitutions();
  var opts = allInst.map(function(i) {
    return '<option value="' + esc(i.name) + '">' + esc(i.name) + ' (' + esc(i.acronym || '') + ') — ' + esc(i.state) + '</option>';
  }).join('');
  openModal('<h3><i class="fas fa-map-marker-alt"></i> Map Alumni to Institution</h3>'
    + '<p style="margin-bottom:12px;">Mapping: <strong>' + esc(a.name) + '</strong></p>'
    + '<div class="form-group"><label>Institution</label>'
    + '<select id="hiMapInst" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;">'
    + '<option value="">— Select Institution —</option>' + opts + '</select></div>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="_hiSaveAlumniMap(\'' + esc(alumniId) + '\')"><i class="fas fa-save"></i> Save Mapping</button></div>');
}

function _hiSaveAlumniMap(alumniId) {
  var inst = document.getElementById('hiMapInst')?.value;
  if (!inst) { toast('Select an institution', 'error'); return; }
  var a = (data.alumni || []).find(function(r) { return r.id === alumniId; });
  if (a) { a.institutionId = inst; a.organization = inst; }
  saveData();
  closeModal();
  _hiRenderAlumniMapping(document.getElementById('hiTabContent'));
  toast('Alumni mapped to institution');
}

function _hiUnmapAlumni(alumniId) {
  if (!confirm('Remove institution mapping for this alumni?')) return;
  var a = (data.alumni || []).find(function(r) { return r.id === alumniId; });
  if (a) { a.institutionId = ''; }
  saveData();
  _hiRenderAlumniMapping(document.getElementById('hiTabContent'));
  toast('Mapping removed');
}

function _hiAlumniMapTo(instName) {
  // Quick map: show alumni selection modal filtered to this institution
  var alumni = data.alumni || [];
  if (!alumni.length) { toast('No alumni records to map', 'warning'); return; }
  var opts = alumni.map(function(a) {
    return '<option value="' + esc(a.id) + '">' + esc(a.name) + ' (' + esc(a.graduationYear || '') + ')</option>';
  }).join('');
  openModal('<h3><i class="fas fa-user-graduate"></i> Map to Institution</h3>'
    + '<p>Mapping alumni to: <strong>' + esc(instName) + '</strong></p>'
    + '<div class="form-group"><label>Select Alumni</label>'
    + '<select id="hiQuickAlumni" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;">'
    + opts + '</select></div>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="' + "var id=document.getElementById('hiQuickAlumni').value;if(id){" + '_hiSaveAlumniMap(id' + ');}"' + '"><i class="fas fa-save"></i> Map</button></div>');
}

// ===== TAB 3: APPLICANT MAPPING =====
function _hiRenderApplicantMapping(container) {
  var list = data.applications || [];
  var allInst = _hiAllInstitutions();
  var html = '<div class="search-bar" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'
    + '<input type="text" id="hiAppSearch" placeholder="Search applicant name..." oninput="_hiRenderAppTable()" style="flex:1;min-width:200px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;background:var(--card-bg);color:var(--text);font-family:inherit;">'
    + '<span style="font-size:13px;color:var(--text-light);">' + list.length + ' applicants</span>'
    + '<button class="btn btn-sm btn-outline" onclick="exportTableToCSV(\'hiAppTable\',\'applicant_institution_mapping\')"><i class="fas fa-download"></i> CSV</button>'
    + '</div>'
    + '<div class="table-responsive"><table><thead><tr><th>Applicant</th><th>Program</th><th>Previous School</th><th>Mapped Institution</th><th>Actions</th></tr></thead><tbody id="hiAppTable">';
  list.forEach(function(a) {
    var p = (data.admissionPrograms || []).find(function(pr) { return pr.id === a.programId; });
    var prevSchool = a.prevSchool || '';
    var mapped = a.prevSchoolInstId || '';
    var mappedName = '';
    if (mapped) {
      var found = allInst.find(function(i) { return i.name === mapped; });
      if (found) mappedName = found.name + (found.acronym ? ' (' + found.acronym + ')' : '');
      else mappedName = mapped;
    }
    html += '<tr>'
      + '<td><strong>' + esc(a.firstName + ' ' + a.lastName) + '</strong></td>'
      + '<td>' + (p ? esc(p.name) : '—') + '</td>'
      + '<td>' + esc(prevSchool || '—') + '</td>'
      + '<td>' + (mappedName ? '<span style="background:#e8f5e9;padding:2px 8px;border-radius:4px;font-size:12px;">' + esc(mappedName) + '</span>' : '<span style="color:var(--text-light);font-size:12px;">Not mapped</span>') + '</td>'
      + '<td><button class="btn btn-sm btn-outline" onclick="_hiMapApplicant(\'' + esc(a.id) + '\')" style="font-size:11px;"><i class="fas fa-map-marker-alt"></i> Map</button>'
      + (mapped ? ' <button class="btn btn-sm btn-danger" onclick="_hiUnmapApplicant(\'' + esc(a.id) + '\')" style="font-size:11px;"><i class="fas fa-times"></i></button>' : '')
      + '</td></tr>';
  });
  html += '</tbody></table></div>';
  if (!list.length) html += '<div class="empty-state"><i class="fas fa-file-signature"></i><p>No applications yet.</p></div>';
  container.innerHTML = html;
}

function _hiRenderAppTable() {
  _hiRenderApplicantMapping(document.getElementById('hiTabContent'));
}

function _hiMapApplicant(appId) {
  var a = (data.applications || []).find(function(r) { return r.id === appId; });
  if (!a) return;
  var allInst = _hiAllInstitutions();
  var opts = allInst.map(function(i) {
    return '<option value="' + esc(i.name) + '">' + esc(i.name) + ' (' + esc(i.acronym || '') + ') — ' + esc(i.state) + '</option>';
  }).join('');
  openModal('<h3><i class="fas fa-map-marker-alt"></i> Map Applicant to Previous Institution</h3>'
    + '<p style="margin-bottom:12px;">Mapping: <strong>' + esc(a.firstName + ' ' + a.lastName) + '</strong></p>'
    + '<div class="form-group"><label>Previous Institution</label>'
    + '<select id="hiMapAppInst" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;">'
    + '<option value="">— Select Institution —</option>' + opts + '</select></div>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="_hiSaveAppMap(\'' + esc(appId) + '\')"><i class="fas fa-save"></i> Save Mapping</button></div>');
}

function _hiSaveAppMap(appId) {
  var inst = document.getElementById('hiMapAppInst')?.value;
  if (!inst) { toast('Select an institution', 'error'); return; }
  var a = (data.applications || []).find(function(r) { return r.id === appId; });
  if (a) { a.prevSchoolInstId = inst; a.prevSchool = inst; }
  saveData();
  closeModal();
  _hiRenderApplicantMapping(document.getElementById('hiTabContent'));
  toast('Applicant mapped to institution');
}

function _hiUnmapApplicant(appId) {
  if (!confirm('Remove institution mapping for this applicant?')) return;
  var a = (data.applications || []).find(function(r) { return r.id === appId; });
  if (a) { a.prevSchoolInstId = ''; }
  saveData();
  _hiRenderApplicantMapping(document.getElementById('hiTabContent'));
  toast('Mapping removed');
}

function _hiApplicantMapTo(instName) {
  var apps = data.applications || [];
  if (!apps.length) { toast('No applicants to map', 'warning'); return; }
  var opts = apps.map(function(a) {
    return '<option value="' + esc(a.id) + '">' + esc(a.firstName + ' ' + a.lastName) + '</option>';
  }).join('');
  openModal('<h3><i class="fas fa-file-signature"></i> Map Applicant</h3>'
    + '<p>Mapping applicant to: <strong>' + esc(instName) + '</strong></p>'
    + '<div class="form-group"><label>Select Applicant</label>'
    + '<select id="hiQuickApp" style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;">'
    + opts + '</select></div>'
    + '<div class="modal-actions">'
    + '<button class="btn btn-outline" onclick="closeModal()">Cancel</button>'
    + '<button class="btn btn-primary" onclick="' + "var id=document.getElementById('hiQuickApp').value;if(id){" + '_hiSaveAppMap(id' + ');}"' + '"><i class="fas fa-save"></i> Map</button></div>');
}

// ===== TAB 4: ADD CUSTOM INSTITUTION =====
function _hiRenderCustom(container) {
  var allInst = _hiAllInstitutions();
  var customCount = (data.customInstitutions || []).length;
  var html = '<div style="display:flex;gap:16px;flex-wrap:wrap;">'
    + '<div class="card" style="flex:1;min-width:300px;">'
    + '<h4 style="font-weight:600;margin-bottom:16px;"><i class="fas fa-plus-circle"></i> Add Custom Institution</h4>'
    + '<p style="font-size:13px;color:var(--text-light);margin-bottom:12px;">Register a private or unrecognized tertiary institution not already in the database.</p>'
    + '<div class="form-grid" style="grid-template-columns:1fr 1fr;">'
    + '<div class="form-group"><label>Institution Name *</label><input type="text" id="hiCustomName" class="form-input" placeholder="e.g. Niger Delta University of Technology"></div>'
    + '<div class="form-group"><label>Acronym</label><input type="text" id="hiCustomAcronym" class="form-input" placeholder="e.g. NDUT"></div>'
    + '<div class="form-group"><label>Type *</label><select id="hiCustomType" class="form-input" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;">'
    + '<option value="uni">University</option><option value="poly">Polytechnic</option><option value="coe">College of Education</option></select></div>'
    + '<div class="form-group"><label>State *</label><input type="text" id="hiCustomState" class="form-input" placeholder="e.g. Delta"></div>'
    + '<div class="form-group"><label>City</label><input type="text" id="hiCustomCity" class="form-input" placeholder="e.g. Warri"></div>'
    + '</div>'
    + '<div style="margin-top:12px;"><button class="btn btn-primary" onclick="_hiAddCustom()"><i class="fas fa-save"></i> Add Institution</button></div>'
    + '</div>'
    + '<div class="card" style="flex:1;min-width:300px;">'
    + '<h4 style="font-weight:600;margin-bottom:12px;"><i class="fas fa-list"></i> Custom Institutions (' + customCount + ')</h4>'
    + '<div id="hiCustomList">';
  if (!customCount) {
    html += '<p class="empty-state" style="margin:0;">No custom institutions added yet</p>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:6px;">';
    (data.customInstitutions || []).forEach(function(ci, i) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-subtle);border-radius:6px;font-size:13px;">'
        + '<div><strong>' + esc(ci.name) + '</strong> <span style="color:var(--text-light);font-size:11px;">' + esc(ci.acronym || '') + ' — ' + esc(ci.state || '') + ' — ' + (NIGERIAN_INSTITUTIONS.typeLabel[ci.type] || ci.type) + '</span></div>'
        + '<button class="btn btn-sm btn-danger" onclick="_hiDeleteCustom(' + i + ')" style="padding:2px 6px;font-size:10px;"><i class="fas fa-times"></i></button></div>';
    });
    html += '</div>';
  }
  html += '</div></div></div>'
    + '<div class="card" style="margin-top:16px;">'
    + '<h4 style="font-weight:600;margin-bottom:12px;">Database Summary</h4>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">'
    + '<div style="text-align:center;padding:16px;background:var(--bg-subtle);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--primary);">' + allInst.length + '</div><div style="font-size:12px;color:var(--text-light);">Total Institutions</div></div>'
    + '<div style="text-align:center;padding:16px;background:var(--bg-subtle);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--primary);">' + (data.alumni || []).filter(function(a) { return a.institutionId; }).length + '/' + (data.alumni || []).length + '</div><div style="font-size:12px;color:var(--text-light);">Alumni Mapped</div></div>'
    + '<div style="text-align:center;padding:16px;background:var(--bg-subtle);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--primary);">' + (data.applications || []).filter(function(a) { return a.prevSchoolInstId; }).length + '/' + (data.applications || []).length + '</div><div style="font-size:12px;color:var(--text-light);">Applicants Mapped</div></div>'
    + '<div style="text-align:center;padding:16px;background:var(--bg-subtle);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--accent);">' + customCount + '</div><div style="font-size:12px;color:var(--text-light);">Custom Added</div></div>'
    + '</div></div>';
  container.innerHTML = html;
}

function _hiAddCustom() {
  var name = document.getElementById('hiCustomName')?.value?.trim();
  var acronym = document.getElementById('hiCustomAcronym')?.value?.trim();
  var type = document.getElementById('hiCustomType')?.value;
  var state = document.getElementById('hiCustomState')?.value?.trim();
  var city = document.getElementById('hiCustomCity')?.value?.trim();
  if (!name || !type || !state) { toast('Fill required fields (Name, Type, State)', 'error'); return; }
  if (!data.customInstitutions) data.customInstitutions = [];
  data.customInstitutions.push({ id: _hiInstId(name), name: name, acronym: acronym, type: type, state: state, city: city });
  document.getElementById('hiCustomName').value = '';
  document.getElementById('hiCustomAcronym').value = '';
  document.getElementById('hiCustomCity').value = '';
  saveData();
  _hiRenderCustom(document.getElementById('hiTabContent'));
  toast('Custom institution added: ' + name);
}

function _hiDeleteCustom(idx) {
  if (!confirm('Remove this custom institution?')) return;
  data.customInstitutions.splice(idx, 1);
  saveData();
  _hiRenderCustom(document.getElementById('hiTabContent'));
  toast('Custom institution removed');
}

// Export for admin panel routing
window.renderHigherInstitutions = renderHigherInstitutions;
