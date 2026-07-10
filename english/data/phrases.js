// 小学英语常用句型与对话（覆盖小学阶段，配中文与年级）
// en=英文 zh=中文 g=年级 cat=主题
window.PHRASES = [
  // 问候 Greetings
  { en: "Hello! I am Mickey.", zh: "你好！我是 Mickey。", g: 1, cat: "问候" },
  { en: "Good morning, teacher.", zh: "老师，早上好。", g: 1, cat: "问候" },
  { en: "How are you? I am fine, thank you.", zh: "你好吗？我很好，谢谢。", g: 1, cat: "问候" },
  { en: "Nice to meet you.", zh: "很高兴见到你。", g: 1, cat: "问候" },
  { en: "Goodbye! See you tomorrow.", zh: "再见！明天见。", g: 1, cat: "问候" },

  // 自我介绍 Introduction
  { en: "My name is Tom.", zh: "我的名字叫 Tom。", g: 1, cat: "介绍" },
  { en: "I am ten years old.", zh: "我十岁了。", g: 2, cat: "介绍" },
  { en: "I am from China.", zh: "我来自中国。", g: 2, cat: "介绍" },
  { en: "I like reading books.", zh: "我喜欢看书。", g: 2, cat: "介绍" },
  { en: "I have a happy family.", zh: "我有一个幸福的家庭。", g: 2, cat: "介绍" },

  // 日常活动 Daily
  { en: "I get up at seven.", zh: "我七点起床。", g: 2, cat: "日常" },
  { en: "I go to school by bus.", zh: "我坐公交车上学。", g: 2, cat: "日常" },
  { en: "I have lunch at twelve.", zh: "我十二点吃午饭。", g: 2, cat: "日常" },
  { en: "I do my homework in the evening.", zh: "我晚上做家庭作业。", g: 3, cat: "日常" },
  { en: "I go to bed at nine.", zh: "我九点睡觉。", g: 2, cat: "日常" },

  // 喜好 Likes
  { en: "I like apples, but I don't like bananas.", zh: "我喜欢苹果，但不喜欢香蕉。", g: 2, cat: "喜好" },
  { en: "My favourite colour is blue.", zh: "我最喜欢的颜色是蓝色。", g: 2, cat: "喜好" },
  { en: "What do you like to do?", zh: "你喜欢做什么？", g: 3, cat: "喜好" },
  { en: "I love playing football.", zh: "我爱踢足球。", g: 3, cat: "喜好" },
  { en: "He enjoys reading stories.", zh: "他喜欢读故事。", g: 4, cat: "喜好" },

  // 能力 Ability
  { en: "I can swim very well.", zh: "我游泳游得很好。", g: 2, cat: "能力" },
  { en: "Can you ride a bike?", zh: "你会骑自行车吗？", g: 2, cat: "能力" },
  { en: "She can sing and dance.", zh: "她会唱歌和跳舞。", g: 2, cat: "能力" },
  { en: "I can speak a little English.", zh: "我会说一点英语。", g: 3, cat: "能力" },

  // 问路与地点 Places
  { en: "Where is the library?", zh: "图书馆在哪里？", g: 3, cat: "问路" },
  { en: "It is next to the classroom.", zh: "它就在教室旁边。", g: 3, cat: "问路" },
  { en: "How can I get there?", zh: "我怎么去那里？", g: 4, cat: "问路" },
  { en: "Go straight and turn left.", zh: "直走然后左转。", g: 4, cat: "问路" },

  // 就餐 Food
  { en: "What would you like to eat?", zh: "你想吃点什么？", g: 3, cat: "就餐" },
  { en: "I would like some noodles.", zh: "我想要一些面条。", g: 3, cat: "就餐" },
  { en: "Would you like some milk?", zh: "你想喝点牛奶吗？", g: 3, cat: "就餐" },
  { en: "Help yourself, please.", zh: "请随便吃。", g: 3, cat: "就餐" },
  { en: "The soup is delicious.", zh: "这汤很美味。", g: 4, cat: "就餐" },

  // 天气 Weather
  { en: "What is the weather like today?", zh: "今天天气怎么样？", g: 3, cat: "天气" },
  { en: "It is sunny and warm.", zh: "今天晴朗又温暖。", g: 3, cat: "天气" },
  { en: "It is raining outside.", zh: "外面正在下雨。", g: 3, cat: "天气" },
  { en: "I like autumn best.", zh: "我最喜欢秋天。", g: 3, cat: "天气" },

  // 学校 School
  { en: "We have four classes in the morning.", zh: "我们上午有四节课。", g: 3, cat: "学校" },
  { en: "My favourite subject is science.", zh: "我最喜欢的科目是科学。", g: 4, cat: "学校" },
  { en: "Please open your books to page ten.", zh: "请把书翻到第10页。", g: 3, cat: "学校" },
  { en: "May I go to the bathroom?", zh: "我可以去洗手间吗？", g: 3, cat: "学校" },

  // 购物 Shopping
  { en: "How much is this toy?", zh: "这个玩具多少钱？", g: 4, cat: "购物" },
  { en: "It is twenty yuan.", zh: "二十元。", g: 4, cat: "购物" },
  { en: "I want to buy a gift for my mom.", zh: "我想给妈妈买一份礼物。", g: 4, cat: "购物" },

  // 节日 Festivals
  { en: "Happy birthday to you!", zh: "祝你生日快乐！", g: 2, cat: "节日" },
  { en: "Merry Christmas!", zh: "圣诞快乐！", g: 4, cat: "节日" },
  { en: "Happy Spring Festival!", zh: "春节快乐！", g: 3, cat: "节日" },
  { en: "Let's have a party.", zh: "我们办个聚会吧。", g: 3, cat: "节日" },

  // 礼貌与情感 Politeness
  { en: "Thank you for your help.", zh: "谢谢你的帮助。", g: 3, cat: "礼貌" },
  { en: "You are welcome.", zh: "不客气。", g: 1, cat: "礼貌" },
  { en: "I am sorry to hear that.", zh: "听到这个我很难过。", g: 4, cat: "礼貌" },
  { en: "Excuse me, may I ask a question?", zh: "打扰一下，我可以问个问题吗？", g: 4, cat: "礼貌" },
  { en: "Don't worry, I can help you.", zh: "别担心，我能帮你。", g: 3, cat: "礼貌" },

  // 描述 Descriptive
  { en: "The elephant is big and strong.", zh: "大象又大又强壮。", g: 2, cat: "描述" },
  { en: "This flower is very beautiful.", zh: "这朵花非常漂亮。", g: 3, cat: "描述" },
  { en: "My schoolbag is heavier than yours.", zh: "我的书包比你的重。", g: 5, cat: "描述" },
  { en: "The movie was more interesting than the book.", zh: "电影比书更有趣。", g: 5, cat: "描述" },

  // 将来与计划 Future
  { en: "I am going to visit my grandparents.", zh: "我要去看望爷爷奶奶。", g: 4, cat: "计划" },
  { en: "We will have a picnic this weekend.", zh: "这个周末我们要去野餐。", g: 4, cat: "计划" },
  { en: "What are you going to do tomorrow?", zh: "你明天打算做什么？", g: 4, cat: "计划" }
];
