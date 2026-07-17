// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import Dua from "../models/Dua";
import Category from "../models/Category";

dotenv.config();

const duasData = [
  // ... (Paste all the dua objects here, but I will format them effectively)
  {
    title: "After finishing a meal",
    arabic_text: "الْحَمْدُ لِلَّهِ الَّذِى اطْعَمَنَا وَسَقَانَا ، وَجَعَلنَا مُسْلِمِينَ",
    transliteration: "Alhamdulilahil ladhi at’amana, wasaqana, waj’alna min-al Muslimeen",
    translation: "Praise be to Allah Who has fed us and given us drink and made us Muslims.",
    reference: "Abu Dawud",
    category: [{ title: "Masnoon Duas" }, { title: "Meals" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 1",
    arabic_text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    transliteration: "Bismika rabbee wadaAAtu janbee wabika arfaAAuh, fa-in amsakta nafsee farhamha, wa-in arsaltaha fahfathha bima tahfathu bihi AAibadakas-saliheen",
    translation: "In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it in the manner You do so with Your righteous servants.",
    reference: "Al-Bukari 11:126",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 2",
    arabic_text: "اللَّهمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ.",
    transliteration: "Allahumma innaka khalaqta nafsee wa-anta tawaffaha, laka mamatuha wamahyaha in ahyaytaha fahfathha, wa-in amattaha faghfir laha. Allahumma innee as-alukal-AAafiyah.",
    translation: "O Allah, verily You have created my soul and You shall take its life, to You belongs its life and death. If You should keep my soul alive then protect it, and if You should take its life then forgive it. O Allah, I ask You to grant me good health.’",
    reference: "Al-Muslim 4:2083",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 3",
    arabic_text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    transliteration: "Allahumma qinee AAathabaka yawma tabAAathu AAibadak.",
    translation: "O Allah, protect me from Your punishment on the day Your servants are resurrected.",
    reference: "Abu Dawud 4:311",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 4",
    arabic_text: "اللَّهُمَّ بِاسْـمِكَ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismikal-lahumma amootu wa-ahya.",
    translation: "In Your name O Allah, I live and die.",
    reference: "Al-Bukhari 11:113, Muslim 4:2083",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 5",
    arabic_text: "اَلْحَمْدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لا كَافِيَ لَه ُُ وَلا مُؤْوِي.",
    transliteration: "Alhamdu lillahil-lathee atAAamana wasaqana, wakafana, wa-awana, fakam mimman la kafiya lahu wala mu/wee.",
    translation: "All praise is for Allah, Who fed us and gave us drink, and Who is sufficient for us and has sheltered us, for how many have none to suffice them or shelter them.",
    reference: "Muslim 4: 2083",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 6",
    arabic_text: "اللَّهمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ رَبّ كُلِّ شَيء ٍ وَمَلِيْكَهُ، أَشْهَدُ أَنْ لا إِلَهََ إِلاَّ أَنْتَ، أَعُوْذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوْءاً أَوْ أَجُرَّهُ~ُ إِلَى مُسْلِم.",
    transliteration: "Allahumma AAalimal-ghaybi washshahadah, fatiras-samawati wal-ard, rabba kulli shayin wamaleekah, ashhadu an la ilaha illa ant, aAAoothu bika min sharri nafsee wamin sharrish-shaytani washirkih, wa-an aqtarifa AAala nafsee soo-an aw ajurrahu ila muslim.",
    translation: "O Allah, Knower of the seen and the unseen, Creator of the heavens and the earth, Lord and Sovereign of all things I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.’",
    reference: "Abu Dawud 4:317",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 7",
    arabic_text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلّا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.",
    transliteration: "Allahumma aslamtu nafsee ilayk, wafawwadtu amree ilayk, wawajjahtu wajhee ilayk, wa-alja/tu thahree ilayk, raghbatan warahbatan ilayk, la maljaa wala manja minka illa ilayk, amantu bikitabikal-lathee anzalt, wabinabiyyikal-lathee arsalt.",
    translation: "O Allah, I submit my soul unto You, and I entrust my affair unto You, and I turn my face towards You, and I totally rely on You, in hope and fear of You. Verily there is no refuge nor safe haven from You except with You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.",
    reference: "Al-Bukhari 11:113, Muslim 4:2081",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Before sleeping - 8",
    arabic_text: "اللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allaahu laa 'ilaaha 'illaa Huwal-Hayyul-Qayyoom, laa ta'khuthuhu sinatun wa laa nawm, lahu maa fis-samaawaati wa maafil-'ardh, man thal-lathee yashfa'u 'indahu 'illaa bi'ithnih, ya'lamu maa bayna 'aydeehim wa maa khalfahum, wa laa yuheetoona bishay'im-min 'ilmihi 'illaa bimaa shaa'a, wasi'a kursiyyuhus-samaawaati wal'ardh, wa laa ya'ooduhu hifdhuhumaa, wa Huwal-'Aliyyul- 'Adheem",
    translation: "Allah! There is none worthy of worship but He, the Ever Living, the One Who sustains and protects all that exists. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never compass anything of His Knowledge except that which He wills. His Throne extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Most Great.",
    reference: "Surah Al-Baqarah - 2:255",
    category: [{ title: "Masnoon Duas" }, { title: "Sleep" }, { title: "Quranic Duas" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 1",
    arabic_text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوْذُ بِكَ مِنَ الْكَسَلِ، وَسُوءِ الْكِبَرِ، رَبِّ أَعُوْذُ بِكَ مِنْ عَذَابٍ فِيْ النَّارِ وَعَذَابٍ فِيْ الْقَبْرِ.",
    transliteration: "Asbahna wa-asbahal-mulku lillah walhamdu lillah la ilaha illal-lah, wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shayin qadeer, rabbi as-aluka khayra ma fee hatha-alyawmi, wakhayra ma baAAdaho, wa-aAAoothu bika min sharri hatha-alyawmi, washarri ma baAAdaho, rabbi aAAoothu bika minal-kasal, wasoo-il kibar, rabbi aAAoothu bika min AAathabin fin-nar, waAAathabin fil-qabr.",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
    reference: "Muslim 4:2088",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 2",
    arabic_text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
    transliteration: "Allahumma bika asbahna wabika amsayna, wabika nahya ,wabika namootu wa-ilaykan-nushoor.",
    translation: "O Allah, by your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
    reference: "At-Tirmidhi 5:466",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 3",
    arabic_text: "اللَّهُمَّ أَنْتَ رَبِّي لَّا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِر لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    transliteration: "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana AAabduk, wa-ana AAala AAahdika wawaAAdika mas-tataAAt, aAAoothu bika min sharri ma sanaAAt, aboo-o laka biniAAmatika AAalay, wa-aboo-o bithanbee, faghfir lee fa-innahu la yaghfiruth-thunooba illa ant.",
    translation: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
    reference: "Al-Bukhari 7:150",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 4",
    arabic_text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ (أربع مرات)",
    transliteration: "Allahumma innee asbahtu oshhiduk, wa-oshhidu hamalata AAarshik, wamala-ikatak, wajameeAAa khalqik, annaka antal-lahu la ilaha illa ant, wahdaka la shareeka lak, wa-anna Muhammadan AAabduka warasooluk (four times).",
    translation: "O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angles, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad is Your Servant and Messenger. (four times).",
    reference: "Abu Dawud 4:317",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 5",
    arabic_text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
    transliteration: "Allahumma ma asbaha bee min niAAmatin, aw bi-ahadin min khalqik, faminka wahdaka la shareeka lak, falakal-hamdu walakash-shukr.",
    translation: "O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.",
    reference: "Abu Dawud 4:318",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 6",
    arabic_text: "اللَّهُمَّ عَافِـني فِي بَدَنِي، اللَّهُمَّ عَافِـنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إلاَّ أَنْتَ.(ثلاثاً) اللَّهُمَّ إِنِّي أَعُوذُبِكَ مِنَ الْكُفْر، وَالفَقْرِ، وَأَعُوذُبِكَ مِنْ عَذَابِ الْقَبْرِ ، لَا إلَهَ إلاَّ أَنْتَ. (ثلاثاً).",
    transliteration: "Allahumma AAafinee fee badanee, allahumma AAafinee fee samAAee, allahumma AAafinee fee basaree, la ilaha illa ant.(three times). Allahumma innee aAAoothu bika minal-kufr, walfaqr, wa-aAAoothu bika min AAathabil-qabr, la ilaha illa ant (three times).",
    translation: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You.(three times) O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You. (three times)",
    reference: "Abu Dawud 4:324",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 7",
    arabic_text: "حَسْبِيَ اللَّهُ لَآ إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ. (سبع مَرّات حينَ يصْبِح وَيمسي)",
    transliteration: "Hasbiyal-lahu la ilaha illa huwa, AAalayhi tawakkalt, wahuwa rabbul-AAarshil-AAatheem",
    translation: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne. (seven times morning and evening)",
    reference: "Abu Dawud 4:321",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 8",
    arabic_text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ. (ثلاثاً إِذا أمسى)",
    transliteration: "aAAoothu bikalimatil-lahit-tammati min sharri ma khalaq.",
    translation: "I take refuge in Allah’s perfect words from the evil He has created. (three times in the evening)",
    reference: "Ahmad 2:290, At-Tirmidhi 3:187",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 9",
    arabic_text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي، وَدُنْيَايَ، وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِيَ.",
    transliteration: "Allahumma innee as-alukal-AAafwa walAAafiyah, fid-dunya wal-akhirah, allahumma innee as-alukal-AAafwa walAAafiyah fee deenee, wadunyaya wa-ahlee, wamalee, allahummas-tur AAawratee, wa-amin rawAAatee, allahummah-fathnee min bayni yaday, wamin khalfee, waAAan yameenee, waAAan shimalee, wamin fawqee, wa-aAAoothu biAAathamatika an oghtala min tahtee.",
    translation: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge with You lest I be swallowed up by the earth.",
    reference: "Ibn Majah 2:332",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 10",
    arabic_text: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّماوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.",
    transliteration: "Allahumma AAalimal-ghaybi washshahadah, fatiras-samawati wal-ard, rabba kulli shayin wamaleekah, ashhadu an la ilaha illa ant, aAAoothu bika min sharri nafsee wamin sharrish-shaytani washirkih, waan aqtarifa AAala nafsee soo-an aw ajurrahu ila muslim.",
    translation: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.",
    reference: "At-Tirmidhi 3:142",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 11",
    arabic_text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الَْأرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ. (ثلاثاً)",
    transliteration: "Bismil-lahil-lathee la yadurru maAAas-mihi shay-on fil-ardi wala fis-sama-i wahuwas-sameeAAul-AAaleem.",
    translation: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.(three times)",
    reference: "Abu Dawud 4:323",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 12",
    arabic_text: "رَضِيتُ باللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ نَبِيَّاً. (ثلاثاً)",
    transliteration: "Radeetu billahi rabban wabil-islami deenan wabiMuhammadin peace be upon to him nabiyya.",
    translation: "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad peace be upon to him as a Prophet. (three times)",
    reference: "Abu Dawud 4:318",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 13",
    arabic_text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ . (ثلاثاً)",
    transliteration: "Subhanal-lahi wabihamdih, AAadada khalqihi warida nafsih, wazinata AAarshih, wamidada kalimatih.",
    translation: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words. (three times)",
    reference: "Muslim 4:2090",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 14",
    arabic_text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ . (مائة مرة)",
    transliteration: "Subhanal-lahi wabihamdih.",
    translation: "How perfect Allah is and I praise Him.(one hundred times)",
    reference: "Muslim 4:2071",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 15",
    arabic_text: "يَاحَيُّ، يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    transliteration: "Ya hayyu ya qayyoom, birahmatika astagheeth, aslih lee sha/nee kullah, wala takilnee ila nafsee tarfata AAayn.",
    translation: "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
    reference: "Sahih-ut-Targhib wat- Tarhib 1:273",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 16",
    arabic_text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ . (مائة مرة)",
    transliteration: "La ilaha illal-lah, wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa AAala kulli shay-in qadeer.",
    translation: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent. (one hundred times)",
    reference: "Al-Bukhari 4:95, Muslim 4:2071",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  },
  {
    title: "Morning remembrance - 17",
    arabic_text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّـي أَسْأَلُكَ خَـيْرَ هَذَا الْـيَوْمِ ، فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.",
    transliteration: "Asbahna wa-asbahal-mulku lillahi rabbil-AAalameen, allahumma innee as-aluka khayra hathal-yawm, fat-hahu, wanasrahu, wanoorahu, wabarakatahu, wahudahu, wa-aAAoothu bika min sharri ma feehi, washarri ma baAAdah.",
    translation: "We have reached the morning and at this very time all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day, its triumphs and its victories, its light and its blessings and its guidance, and I take refuge in You from the evil of this day and the evil that follows it.",
    reference: "Abu Dawud 4:322",
    category: [{ title: "Masnoon Duas" }, { title: "Morning" }],
    language: "Arabic / English",
    is_active: true
  }
];

const seedDuas = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing Duas and Categories...");
    await Dua.deleteMany();
    await Category.deleteMany();

    console.log("🔥 Extracting unique categories...");
    const categoriesMap = new Map<string, any>();
    
    duasData.forEach(dua => {
      dua.category.forEach((cat: any) => {
        if (!categoriesMap.has(cat.title)) {
          categoriesMap.set(cat.title, { 
             title: cat.title, 
             // Default images/desc if not present, or enhance later
             image: cat.image || "", 
             description: cat.description || "" 
          });
        }
      });
    });

    console.log(`🌱 Seeding ${categoriesMap.size} Categories...`);
    const createdCategoriesMap = new Map<string, string>(); // Title -> ID
    
    for (const catData of categoriesMap.values()) {
        const newCat = await Category.create(catData);
        createdCategoriesMap.set(newCat.title, newCat._id as string);
    }

    console.log("🌱 Seeding Duas with Category References...");
    const duasWithCategoryIds = duasData.map(dua => {
        const categoryIds = dua.category.map((cat: any) => createdCategoriesMap.get(cat.title));
        return {
            ...dua,
            category: categoryIds
        };
    });

    await Dua.insertMany(duasWithCategoryIds as any);

    console.log("✅ Duas and Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Duas:", error);
    process.exit(1);
  }
};

seedDuas();
