const bank=(...items)=>items;

const BASE_SOCIAL_PHRASE_BANK={
  stadium:bank(
    'This ballpark is ridiculously pretty tonight.','Why did I choose seats that require a hiking permit.','Hot dog acquired. The game may now begin.','The concourse smells like fries and optimism.','I have walked past my section three times. I live here now.','The upper deck view is honestly incredible.','The person behind me has managed every pitch better than the actual manager.','I left for concessions and apparently missed an entire inning.','Somebody near me has a scorebook. Respect.','The mascot just scared a child and then immediately made their day.','Why is every bathroom somehow on the opposite side of the stadium.','You can hear this crowd from the concourse.','The sunset over the outfield is doing numbers right now.','The line for nachos has entered extra innings.','I paid ballpark prices for fries and somehow I am still happy.'
  ),
  home:bank(
    'Dinner is getting cold because I refuse to leave this inning.','My stream froze at the exact worst possible moment. Naturally.','The neighbor yelled before my feed caught up. Spoiler alert, apparently.','I turned it off for five minutes and everything happened. You are welcome.','Muted the broadcast for one inning and my blood pressure improved.','The dog has left the room. Even he has had enough.','I am watching from the couch like I personally have defensive responsibilities.','Popcorn in the second, existential crisis in the seventh. Baseball.','I promised I would not yell at the television tonight. That promise lasted four pitches.','Remote in one hand, score app in the other. Healthy hobby.','Can I get discount concessions at my own home??','Sitting here at my desk, gued to my monitor wathcing the game',"Can someone hand me a drink? I don't wanna stop watching","The dog has also come to sit and watch the game.","Does anyone know the brand they use for hotdogs at the stadium? I wanna get some for my house.","In my comfy clothes, cheering on my favorite team!!"
  ),
  work:bank(
    'I am absolutely not refreshing GameCast during this meeting.','Somebody tell my boss there is baseball happening.','Lunch break has mysteriously become a three-inning event.','If this goes extras I am getting absolutely nothing done.','I have a spreadsheet open for camouflage.','One monitor for work, one monitor for baseball. Balance.','My productivity graph and this game are moving in opposite directions.','I keep saying “one more batter” like that has ever worked.'
  ),
  food:bank(
    'Helmet nachos are a structural engineering achievement.','Garlic fries: 8.7/10. Would emotionally depend on again.','The hot dog is doing more for team morale than I expected.','Someone please rank the ballpark snacks scientifically.','I came for baseball and accidentally spent a fortune on pretzels.','Third inning snack report: elite.','The lemonade is carrying me through this pitching change.','Ballpark food tastes better when your team is winning. This is peer reviewed.'
  ),
  merch:bank(
    'I said I was not buying merch today. Anyway, new hat.','That alternate cap is dangerous for my bank account.','Sold out in my size. Devastating development.','Championship patch still looks so good in person.','The team store is packed like they are giving the jerseys away. They are not.','I absolutely do not need another hoodie. Counterpoint: look at it.','Someone stop me from buying the throwback cap. Actually do not.','My closet has become a minor-league affiliate of the team store.'
  ),
  family:bank(
    'Kid next to us just got their first foul ball. Baseball is good.','First game for the little one and they are already asking when we can come back.','My dad brought me to games. Now I get to do the same. Pretty cool.','Tiny jersey, giant foam finger, zero understanding of the score. Elite fan experience.','Family tradition: arrive early, buy too much food, stay to the last out.','The kid in our row knows every player. I have been humbled.'
  ),
  travel:bank(
    'Road game check-in. We are wildly outnumbered and completely unbothered.','First time at this park and honestly? Gorgeous.','Crossed way too many miles for this team. Would do it again.','Opposing fans have been annoyingly nice. Ruining my rivalry narrative.','Away section is small but LOUD.','Hotel room baseball after the game is going to hit different.'
  ),
  casual:bank(
    'Just checked the score. What on earth happened here.','I have watched twelve minutes and am already emotionally compromised.','Someone summarize the first five innings in one sentence.','Haven’t watched all week. Are we good now?','I know about four players and I am still fully invested.','Baseball is so easy to casually follow until suddenly it is your entire evening.'
  ),
  oldhead:bank(
    'I have seen this movie before. Add insurance runs.','Back in Season 1 this fanbase would have panicked already.','Nobody appreciates a clean defensive inning anymore.','Just put the ball in play and make them make a play.','I remember when this rivalry was polite. Better times. Worse baseball.','You kids call everything iconic. Now THAT was iconic.'
  ),
  newfan:bank(
    'Okay I finally understand why everyone hates a double play now.','I have been watching baseball for a week and apparently this is my whole personality.','Can someone explain why every 0-2 count makes me nervous.','I thought baseball was relaxing. I was lied to.','I learned what a sacrifice fly is and now I am unstoppable.','Why does nine innings sometimes feel like twenty minutes and sometimes six years.','So, if the ball hits over the wall.. is that a run?','Can this game end in a tie?','Who is the guy behind that plate? Is that another catcher?',"How many foul balls till it's a strikeout?","What are those big yellow things at each end of the field?","I think I'm starting to understand the game!"
  ),
  superstition:bank(
    'Nobody move. We scored while I was standing here.','I changed seats and immediately regretted it.','Same hat tomorrow. No discussion.','I refuse to say the words everyone is thinking.','Do not text me during this inning. The ritual must continue.','I turned the broadcast volume down and we started hitting. Science.',"I'm wearing my lucky socks today..I hope it works!","My shirt is on backwards. We won last time I did this.","Maybe I need to wear a different jersey while watching the game","I will never wear another jersey. We've won every time I've worn this"
  ),
  pets:bank(
    'My dog barked at the home run horn and honestly same.','The cat has taken my seat during the rally. I cannot move her now.','Dog is wearing the team bandana. We are taking this seriously.','My dog thinks every crowd roar means someone is at the door. Tough night for him.','Pet update: asleep through six innings, awake for the loudest play of the night.','The dog has correctly identified the rally cap as a toy.'
  ),
  weatherGeneric:bank(
    'Perfect baseball-night energy out here.','Whatever the conditions are, the crowd is dressed like four different seasons.','Night games just look better under the lights.','Day baseball has a completely different vibe and I love it.'
  ),
  radio:bank(
    'Long-time listener, first-time caller: I have solved the entire team in twelve seconds.','LINES ARE OPEN and everyone is extremely calm, by which I mean nobody is calm.','Caller number three wants to trade everyone. We are eight games into the season.','The postgame phone lines are going to be a public safety issue.','Someone just called in to say “I told you so” and hung up. Incredible radio.'
  ),
  analyst:bank(
    'The result matters, but the shape of the game matters too.','There is a difference between playing well and surviving. Keep an eye on that.','This is the kind of inning that changes the way a game feels.','The scoreboard is telling one story; the pressure is telling another.','You can see the confidence growing pitch by pitch.','I would not overreact to one game. I am, however, paid to react.'
  ),
  troll:bank(
    'Just checking on the other fanbase. Everyone okay over there?','I brought receipts and snacks.','Deleting your pregame confidence posts is cowardice.','Scoreboard has entered the chat.','Nothing personal. I simply hope your team experiences mild inconvenience for three hours.','I am here for baseball and completely responsible levels of pettiness.'
  ),
  parking:bank(
    'Parking lot is already chaos and first pitch is not even close.','I have circled this garage enough times to qualify as a starting pitcher.','Found parking. Season saved.','Leaving this lot after the game is going to require a relief appearance.','Tailgate smoke, jerseys everywhere, perfect game-day energy.','Someone is directing traffic with the confidence of a third-base coach.','I parked so far away I may have changed zip codes.','The parking attendant just told us good luck. That felt ominous.','We are tailgating like this is Game 7 and it is absolutely not.','I forgot where I parked. Future me can solve that problem.'
  ),
  gates:bank(
    'Gate line is moving faster than expected. A miracle.','Wrong gate. Again. I am developing a personal rivalry with this building.','Bag check has become today\'s first high-leverage situation.','Everyone arrived at the same gate at the exact same time. Beautiful planning.','Giveaway boxes visible from here. People are LOCKED IN.','Security line discourse has begun and it is not even batting practice.','My friend entered through the opposite side of the park. We may reunite by the seventh.','The gates opened and half the crowd sprinted directly to the team store.','I respect the people who know exactly which entrance to use. Could not be me.','Made it through the gate with dignity mostly intact.'
  ),
  seats:bank(
    'The view from this section is way better than the ticket map suggested.','Person next to me brought a full scorebook setup. Professional behavior.','The cupholder is doing heroic work tonight.','I have an aisle seat and suddenly feel like royalty.','Someone in front of me has stood up for every single pitch. Commitment.','Our whole row is now friends because one person brought sunflower seeds.','These seats are great except for the mysterious pole that has chosen me personally.','The opposing fan in our row is actually hilarious. I hate this development.','Tiny kid behind us is calling every pitch a home run. Elite confidence.','Section chemistry is currently a 10/10.'
  ),
  reseller:bank(
    'The giveaway is already listed online and the gates opened twelve minutes ago. Be serious.','Someone has six bobbleheads. SIX.','Listing says RARE like thousands were not handed out tonight.','I will trade two rally towels and my dignity for one bobblehead.','If you bought a ticket just to flip the giveaway, may your team lose in extras.','Secondary market update: absolutely unserious prices.','Cash-only meetup by the gate after the game is peak giveaway culture.','People are leaving in the second inning carrying boxes. I have questions.','One per ticket has apparently become a philosophical suggestion.','Collector market is moving faster than the bullpen phone.',"I'm in the ballpark if anyone wants to buy today's giveaway item!","Hey, I have to make a living too.. waiting in that line took forever","I have two items I'm willing to sell if anyone want's them!","I can see the line of resellers forming outside the ballpark","Can you believe how many listings there already are for the giveaway!?"
  ),
  collector:bank(
    'Got the promo item into the bag without bending it. Biggest win of the night.','This season\'s giveaway shelf is getting crowded. Great problem.','I am one cap away from completing the set and becoming unbearable.','Kept the ticket stub too. Some of us still believe in physical artifacts.','The patch detail on this one is actually really nice.','I came for the card set. The baseball is a bonus.','Trading duplicates after the game if anyone is around.','This is absolutely going in the display case.','My spreadsheet of giveaways is more organized than my actual finances.','Collector grade: surprisingly excellent.'
  ),
  vendor:bank(
    'Section 118 pretzel inventory is entering the danger zone.','Hot dog count: 14. Innings remaining: too many. Pray for me.','We have officially sold the last lemonade. Please direct complaints to baseball.','The seventh-inning rush is undefeated.','I have heard twelve different opinions about the umpire from this concession stand.','Nacho cheese machine survived another inning. Heroic.','Someone ordered four hot dogs for one person. Respectfully, legend.','Inventory report: peanuts strong, pretzels fading, morale stable.','The home run horn is louder from behind the counter than you think.','If this goes extras, I am requesting bullpen help for concessions.'
  ),
  localbiz:bank(
    'Win tonight and tomorrow\'s lunch special gets a baseball discount.','Game is on every screen. Yes, even the tiny one by the kitchen.','The card shop is staying open late for postgame arguments.','Jerseys have taken over the dining room and we support it.','Rivalry night special is live. Please trash talk responsibly.','If the game goes extras, happy hour also goes extras. We do not make the rules.','Postgame crowd incoming. We have fries ready.','Someone just walked in wearing a throwback from three seasons ago. Instant respect.','Tonight\'s receipt says “baseball emotional support meal.” Accurate.','We are accepting payment in cash, card, and reasonable takes.',"A win tonight and get yourself a free water!","If the team steals 10 bases today you can take 10% off your next order!","A walkoff and net yourself 20$ off your next order with us!","Come watch and eat our chicken! come on down!","If they hit a home run this inning, we will give you a free item! (exclusions apply)","A strikeout for them means free food for you! Come on down!"
  ),
  mascot:bank(
    'Mascot just stole somebody\'s hat and refused to return it.','A child was terrified of the mascot for six seconds and is now best friends with it.','Mascot race ended in controversy. We need replay review.','The mascot is currently heckling the visiting section. This is diplomacy.','Mascot photobombed an anniversary picture and honestly improved it.','Someone challenged the mascot to a dance battle. There was a clear winner.','I do not trust how fast that mascot can run.','Mascot just appeared behind me without warning. Heart rate up 40 points.','The mascot has found the camera again. We are all in danger.','The mascot bit is lasting too long and somehow getting funnier.'
  ),
  foulball:bank(
    'Foul ball landed three rows over and everyone immediately became an outfielder.','GIVE IT TO THE KID discourse has commenced.','One-handed foul ball catch while holding nachos. Retire that fan\'s number.','Whole section just flinched in perfect synchronization.','Someone brought a glove to the upper deck and finally got vindicated.','Foul ball vanished under six seats. Search party deployed.','That ball found the only empty seat in the section. Incredible precision.','A grown adult dove over two chairs for a souvenir. Baseball remains undefeated.','The kid got the ball and the entire section cheered louder than for the last out.','Foul territory has become a contact sport.'
  ),
  watchparty:bank(
    'Every screen in this place is on the game. Correct.','The bar reacted before my stream did and I hate spoilers now.','Table next to us is the opposing fanbase. This has become diplomatic negotiations.','Watch party volume just doubled after that inning.','Someone brought a scorebook to a sports bar. I salute the commitment.','The whole room yelled at once and one person dropped a wing. Casualty report pending.','I came for dinner and accidentally joined a supporters group.','Bartender knows the score better than half of us.','Nobody is leaving until the final out. Kitchen may have concerns.','This is basically a stadium with worse sightlines and cheaper fries.'
  ),
  transit:bank(
    'Train is 80 percent jerseys and 20 percent people pretending not to care.','Rideshare surge pricing has declared itself the real rival tonight.','Bus driver asked for the score. Community service.','Platform is full of fans refreshing the same game thread.','Missed one train and somehow gained three opposing fans in our car.','Postgame transit is going to be a documentary.','Walking from the station with a whole wave of jerseys is elite game-day energy.','Driver has the radio broadcast on. Five stars immediately.','Everyone on this train knows the score and nobody has spoken.','Public transit after a win feels like a parade preview.'
  ),
  uniforms:bank(
    'These uniforms look incredible under the lights.','Bring back the old cap permanently. I have spoken.','The road gray is criminally underrated.','This jersey combination is either genius or a misdemeanor.','Uniform nerds, we are eating tonight.','That sleeve patch is doing a lot of work.','I know we are supposed to discuss baseball but LOOK AT THE SOCKS.','Throwback night should become every night.','The alternate cap just moved into my shopping cart by itself.','I have ranked every uniform combination and nobody asked.'
  ),
  autograph:bank(
    'Pregame rail is packed with autograph hunters.','Kid next to me got a signature and may never recover emotionally.','Brought one baseball to get signed and immediately dropped it. Strong start.','Someone has a binder with a plan. Serious autograph operation.','Player signed until the last possible second. Cool moment.','I am too old to be this excited about an autograph. Counterpoint: no I am not.','Sharpie acquired. Hope remains.','The autograph crowd just moved twenty feet in unison like migrating birds.','One signature just made a whole family\'s night.','Did not get the autograph. Did get sunburned. Baseball.'
  ),
  seasonticket:bank(
    'Same seats, same neighbors, same argument about the lineup. Tradition.','Season-ticket holder privilege is knowing exactly which concession line to avoid.','I have watched this section age together. Weirdly wholesome.','We all know who arrives late in this row. We notice.','My seat neighbor predicted this exact score and I am concerned.','Twenty games in and the usher knows my snack order.','I complain constantly and renew every year. That is loyalty.','This park has been my second living room for multiple seasons.','Our section has its own superstitions now.','Same seat tomorrow. Obviously.'
  ),
  photos:bank(
    'The lights just came on and this place looks unreal.','Empty-ballpark pregame photos hit different.','Sunset behind the scoreboard is doing all the heavy lifting tonight.','Night baseball photography is basically cheating.','Caught the exact moment everyone stood up. Frame-worthy.','The crowd colors look ridiculous from up here.','Best photo of the night is somehow just the warning track.','Stadium architecture appreciation post.','I take too many pictures of baseball parks and I regret nothing.','This one is going straight into the season scrapbook.','that backdrop is beautiful. I will never get bored of this view','I might have to make a new album on my phone for all these pictures','Do you think I can get a selfie with one of the players?','Always time for a #selfie','This is going on my Instagram reel','Here at the ballpark, say Cheese!!'
  ),
  wave:bank(
    'THE WAVE HAS STARTED. I repeat, the wave has started.','It is a one-run game in the eighth. Please stop doing the wave.','Counterpoint: let people have fun, wave haters.','The wave made it through three sections and died heroically.','I did the wave and will not apologize.','Our section refused the wave on principle.','This stadium is now divided into pro-wave and anti-wave factions.','The wave skipped the visiting section. Diplomatic incident.','Someone started the wave during a mound visit. Honestly fair.','Wave discourse is more heated than the game thread.'
  ),
  scoreboard:bank(
    'Birthday shoutout got a bigger cheer than expected.','Kiss cam has created a diplomatic incident in section 204.','Scoreboard trivia humbled the entire row.','Somebody just proposed on the big screen and SHE SAID YES.','Fan cam found the one person aggressively eating nachos. Iconic.','They put the wrong section on the scoreboard and everyone booed.','The between-innings trivia answer was obvious and I am still mad I missed it.','Scoreboard operator is having a very good night.','Birthday kid is waving like they just won the pennant.','The crowd absolutely committed to that fan-cam bit.','OMG I just got a pillow for guessing correctly on the scoreboard',"HI MOM, HI DAD, DID YOU SEE ME ON THE SCOREBOARD????","Oh god... they showed me eating on the scoreboard #Embarrasing","These people in front of me are trying really hard to be on the scoreboard","Hey!! That was me!! I was dancing on the scoreboard!","To the person who just got broken up on the scoreboard... I'm sorry (everyone in section 224)","I wonder if my favorite player saw me waving my sign on the scoreboard!","I hope to never be found by the scoreboard cameras","Answering that scoreboard quiz doesn't seem too hard","Should I wear something flashy to have a better chance to show up on the scoreboard??"
  ),
  callin:bank(
    'Long-time listener, first-time caller, trade everybody.','I do not care what the numbers say. My eyes have seen enough.','We are nine games into the season and I am planning the parade.','Why did we send him? WHY DID WE SEND HIM.','I have a three-point plan and none of it is reasonable.','Put me on hold if you want, I have twelve more thoughts.','My wife told me not to call tonight. Anyway, here I am.','I blame the bullpen, the schedule, and modern society.','Great win. Never doubted them. Do not check my posts from the fourth inning.','I would like to apologize to the lineup. They made me look ridiculous.'
  ),
  concourse:bank(
    'I came up here for one drink and somehow walked the entire stadium.','The concourse television has formed its own little fan section.','There is a child sprinting toward a helmet sundae with championship-level focus.','Someone is selling peanuts like the fate of the division depends on it.','The concourse is weirdly peaceful compared with the seating bowl right now.','I can hear the crowd react about three seconds before the television over here.','Every concession line has one person studying the menu like it is free agency.','I have now passed the same souvenir stand four times and it is getting personal.','The smell of grilled onions should count as part of home-field advantage.','Concourse lap complete. My legs have entered the injured list.'
  ),
  restroom:bank(
    'Bathroom line scouting report: long, slow, deeply concerning.','I chose the wrong inning for this mission.','Someone in this line just yelled at a score alert. We are all invested now.','Made it back before the third out. Put it in the record book.','There is no greater gamble than leaving your seat during a close inning.','I heard the crowd explode from the hallway and immediately regretted every life choice.','Restroom television is carrying an impossible amount of responsibility.','We are all refreshing the score in here like a tiny nervous parliament.'
  ),
  scorekeeper:bank(
    'Scorebook update: I have officially run out of room for my own commentary.','Keeping score by hand makes every weird inning feel like homework.','The person next to me asked what my symbols mean. I barely know anymore.','Nothing makes you respect baseball more than trying to write down a chaotic double play.','My scorecard is immaculate and the game is absolutely not.','I love looking back at old scorebooks and remembering exactly where the stress happened.','Pencil sharpened. Scorecard ready. Emotional stability unavailable.','I missed one substitution and my entire beautiful system collapsed.'
  ),
  optimism:bank(
    'Plenty of baseball left. I am choosing hope.','One good inning changes the whole mood.','I have seen stranger comebacks than this. Keep going.','We are exactly one rally away from everyone pretending they never doubted.','This feels like the part where the game turns. No evidence, just vibes.','I refuse to doom until the final out.','The good news is baseball gives you another chance approximately every thirty seconds.','If we get one runner on, the whole building wakes back up.'
  ),
  doomer:bank(
    'I have seen enough and unfortunately I will continue watching every pitch.','This team has discovered a new and creative way to stress me out.','I would like to file a formal complaint with the concept of baseball.','We are making routine innings feel like survival television.','Every time I relax the game notices.','I knew better than to feel confident. Rookie mistake.','I am already rehearsing the postgame rant and it is only the fourth inning.','Baseball has once again punished me for caring.',"I don't wanna watch this team anymore :(","Does anyone know if I can get a refund on my tickets?", "That's it! I'm never coming back here again!!","How can I even stay to watch this.. my heart hurts..", "This season is already over...", "Whelp... let's try again next year","Should I just leave early??","Why does this always happen when I decide to watch the game?"
  ),
  neighbors:bank(
    'Our section has developed lore over the last four innings.','The stranger next to me and I are now emotionally bonded by one bad call.','Somebody three rows back has elite comedic timing.','The visiting fan beside us is being annoyingly reasonable.','Our row has adopted a rally snack and nobody is allowed to question it.','A whole section just became friends because one person caught a foul ball.','Guy behind me has correctly predicted two plays and is becoming too powerful.','The kid in front of us has started keeping his own unofficial strike zone.'
  ),
  commuteHome:bank(
    'Listening on the drive and trying not to react visibly at red lights.','I pulled into the driveway and stayed in the car because the inning was not over.','Postgame traffic plus sports radio is an ancient ritual.','Everyone leaving the park is refreshing the same final-score graphic.','The train car is either celebrating or mourning. There is no middle ground.','I can tell who won just by looking at the faces walking toward the station.','I am still wearing the jersey in traffic. Commitment does not end at the gate.','The walk back to the car feels dramatically shorter after a win.',"Does anyone know when the last train leaves?","How much is an Uber home after the game?","Can I hitch a ride with someone? I don't wanna walk two miles to my car","Time for the long walk home"
  ),
  memories:bank(
    'This matchup always makes me think about that game a few seasons ago.','My favorite thing about a long season is when random games become permanent memories.','Somewhere years from now we are going to remember one weird detail from tonight.','The older this league gets, the more every matchup comes with baggage.','I still remember when this fanbase had no expectations at all.','There are games you remember by score and games you remember by how the building felt.','Every banner started as one ordinary game on a schedule.','Baseball history is mostly people saying “I was there” until eventually they really were.'
  ),
  friends:bank(
    'Group chat has moved from analysis to complete nonsense.','My friend said “easy win” before first pitch and has been muted for public safety.','We all made score predictions and every single one is already dead.','Someone in the group chat went to make dinner and the game immediately changed.','The friend who never watches baseball has the strongest opinion tonight.','Our watch group has collectively decided the couch seating arrangement cannot change.','One person is an inning behind and we are trying not to spoil anything. Impossible.','We have reached the stage of the game where nobody is answering normal texts.'
  ),
  heckler:bank(
    'One person in this section has committed to a bit and refuses to let it die.','Heckler volume is up, material quality is mixed.','The visiting outfielder absolutely heard that one.','Someone yelled something genuinely funny and even the opposing fans laughed.','Our section heckler has entered the late innings with fresh material somehow.','Please workshop the joke before yelling it six more times.','There is always one fan who treats every pause like an open-mic night.','The heckling has become a collaborative project now.','Hey! Down there! Can you stop yelling at every at-bat??? It is getting very annoying',"WE CAN'T HEAR YOUR OPPOSING CHEERS!!","I'm just here to hate watch","Does anyone know what that one fan is yelling about??"
  ),
  broadcast:bank(
    'Broadcast booth is trying very hard not to jinx this.','I appreciate when the announcers let the crowd noise breathe for a second.','The replay angle made that look even more ridiculous.','Broadcast just found the perfect crowd reaction shot.','The announcer said “plenty of time” and my nervous system disagreed.','The booth has officially entered storytelling mode during the quiet inning.','That replay is going to be used approximately nine more times tonight.','Camera operator found the exact fan having the exact emotion.'
  ),
  tickets:bank(
    'Bought these tickets weeks ago and accidentally picked a great game.','Last-minute ticket prices are getting disrespectful.','Standing room suddenly feels like a luxury product.','I checked ticket prices out of curiosity and immediately closed the app.','Friend bailed, so I brought someone who barely watches baseball. Conversion attempt underway.','There are no bad seats when the game is good. There are, however, expensive seats.','Ticket demand has officially entered “should have planned earlier” territory.','I love spontaneous baseball until the resale market remembers capitalism.',"there's quite a few people outside the stadium asking for spare tickets!",'where can I get a seat upgrade?','What a deal! Two tickets, two drinks, for one good price!','Hey! I bought these tickets and someone is sitting in my seats!!!'
  ),
  promo:bank(
    'People are lining up for the giveaway like it is a playoff spot.','The promo item is way nicer in person than I expected.','Everyone in this section is protecting the giveaway box with their life.','The special-night graphics look fantastic tonight.','I came early for the promotion and accidentally watched batting practice. Great decision.','This is the kind of theme night that makes the park feel completely different.','The giveaway has become part of everyone’s seat architecture.','Tonight already feels like one of those weirdly memorable promotional games.',"i've been waiting in this line for over an hour","I can't see the start of the line from where I'm waiting!!!?","I really hope I got here early enough to get something","I wonder if I'm going to get the secret prize in the promo today????","Here in line for the promo! #Baseball!","#Promo #PleaseGiveItToMe #Excited","Does anyone know how much more stuff they have??"
  ),
  offbeat:bank(
    'I have spent an unreasonable amount of time wondering where they store all the bases.','Do stadium pigeons understand baseball or are they freelancing.','Someone just dropped a full tray of fries and the section observed a moment of silence.','I would like to know the career statistics of the person operating the T-shirt cannon.','The grounds crew has better synchronization than most dance teams.','A beach ball has entered play in the upper deck. Civilization continues.','There is a man here wearing jerseys from two different teams. Explain yourself.','Somebody brought binoculars to seats that are objectively excellent. I respect the preparation.','The tiny broom one fan brought for a potential sweep is incredible commitment.','I have become emotionally invested in whether the scoreboard animation completes before the next pitch.'
  ),
  quiet:bank(
    'This game has settled into that weird middle-inning hum.','Nothing dramatic happening and somehow I am still locked in.','Baseball has a lot of waiting and then suddenly none at all.','One of those innings where everyone collectively exhales.','The crowd is doing the low murmur thing. Something big is eventually going to happen.','Routine baseball is underrated until it stops being routine.','I could almost here a pin drop in here.','I feel I am breathing too loud in here'
  )
};

const SOCIAL_PHRASE_EXPANSIONS={
  "stadium": [
    "The lights hit different once the sky goes dark.",
    "I can hear the crowd building from outside the gates.",
    "Every section has its own little personality tonight.",
    "The scoreboard glow makes the whole place feel like a movie set.",
    "There is absolutely no reason a random Tuesday should feel this important.",
    "The ushers already know which rows are going to be trouble.",
    "That first look at the field from the concourse never gets old.",
    "The warning track looks impossibly bright from up here.",
    "You can tell this crowd came prepared to react to everything.",
    "I forgot how much bigger the field feels in person."
  ],
  "home": [
    "I have reorganized the couch around this game and nobody may question it.",
    "The volume is up just enough to annoy everyone else in the house.",
    "I made food during the break and sprinted back like I was tagging up.",
    "The living room has become a one-person supporters section.",
    "I keep checking the score even though the game is literally on the screen.",
    "My phone battery is losing a fight with GameCast.",
    "I am pacing between pitches in my own house. Completely normal.",
    "Every commercial break is now a snack-management challenge.",
    "The blanket is lucky now. I do not make the rules.",
    "I told myself I would multitask. I have accomplished nothing."
  ],
  "work": [
    "Calendar says meeting. Second monitor says baseball.",
    "I just reacted to a score update in a room where nobody knows there is a game.",
    "The spreadsheet has not changed in twenty minutes but I look very focused.",
    "I scheduled my break around the middle innings and I regret nothing.",
    "One more refresh and then I am definitely getting back to work.",
    "Coworker asked why I gasped. I said email.",
    "My headphones are carrying the radio call while I pretend to be productive.",
    "If anyone needs me I am spiritually at the ballpark.",
    "I have mastered the art of minimizing GameCast when footsteps approach.",
    "This game has become an unofficial workplace emergency."
  ],
  "food": [
    "The fries lasted exactly one inning. Rookie mistake.",
    "I am convinced everything tastes better out of a cardboard tray at a ballpark.",
    "Someone nearby has food that smells significantly better than mine.",
    "I said one snack and somehow I am holding three receipts.",
    "The pretzel is mostly salt and I respect the commitment.",
    "A helmet sundae is not a dessert. It is an event.",
    "Concession strategy is becoming more complicated than bullpen strategy.",
    "The hot dog disappeared before the first pitch of the inning.",
    "I have spent enough on food to deserve a roster spot.",
    "Peanuts remain the undefeated baseball snack."
  ],
  "merch": [
    "The new patch looks way better in person than it did online.",
    "I touched one hoodie and immediately lost financial discipline.",
    "There is always one hat on the wall that starts whispering my name.",
    "I came in wearing team gear and somehow still needed more team gear.",
    "That throwback jacket is testing me spiritually.",
    "The checkout line is basically another fan section.",
    "I am holding two hats and pretending this is a difficult decision.",
    "Limited edition are dangerous words around baseball fans.",
    "The jersey wall has done irreversible damage to my budget.",
    "I bought the souvenir. Future me can complain."
  ],
  "family": [
    "The little one has asked if every fly ball is a home run. We are learning.",
    "Three generations in one row tonight. That is pretty hard to beat.",
    "The kid next to us is keeping score with complete confidence and zero accuracy.",
    "Someone's first game is happening in this section and the whole row knows it.",
    "Tiny glove ready for every foul ball within a different zip code.",
    "My family has officially turned game day into a full-day operation.",
    "The children have discovered the mascot and baseball is temporarily secondary.",
    "Dad is explaining strategy like he is on the coaching staff again.",
    "We took the same pregame photo we take every season.",
    "The kids will remember the snacks more than the score and honestly that is fine."
  ],
  "travel": [
    "Our hotel lobby is full of jerseys from both teams and the tension is polite.",
    "I have officially traveled farther for baseball than for most family events.",
    "New city, new ballpark, same irrational emotional investment.",
    "The visiting section found each other immediately.",
    "I packed more team gear than normal clothes.",
    "Road trip rule: if we win, every bad travel decision was worth it.",
    "I am learning this stadium one wrong turn at a time.",
    "Opposing fans keep giving us food recommendations. Rivalry ruined.",
    "The rental car radio found the local broadcast and now the trip is complete.",
    "We crossed state lines for this. Please make it interesting."
  ],
  "casual": [
    "I only meant to check the score and now I have watched two innings.",
    "Wait, when did this become a close game?",
    "I recognize more names than last week. This is how they get you.",
    "I looked away and apparently the entire plot changed.",
    "Can someone explain why everyone online is yelling about the bullpen?",
    "I am not emotionally invested, I say while refreshing every thirty seconds.",
    "I turned this on for background noise and that plan is gone.",
    "Is this matchup always this weird or did I pick a special night?",
    "I have no idea what the standings mean yet but this feels important.",
    "I checked in at exactly the wrong time and now I cannot leave."
  ],
  "oldhead": [
    "A runner on third with less than two outs used to mean something.",
    "Give me a clean scorecard and nine innings without nonsense.",
    "I still prefer a double in the gap to three true outcomes discourse.",
    "Somebody somewhere still knows how to bunt. I believe.",
    "The fundamentals crowd has entered the chat.",
    "You can keep the launch-angle speech. Move the runner.",
    "I have watched enough baseball to distrust every four-run lead.",
    "A good cutoff throw deserves more appreciation.",
    "Nothing wrong with winning 2-1 and getting home at a reasonable hour.",
    "The old radio call in my head was better, respectfully."
  ],
  "newfan": [
    "Why does a foul ball with two strikes not count but sometimes it does?",
    "I just learned what tagging up is and now I notice it every time.",
    "Okay the infield fly rule sounds made up even after the explanation.",
    "I finally know why everyone gets excited when the count is 3-1.",
    "How do you all remember which pitcher is warming up?",
    "I thought extra innings sounded fun. You did not mention the stress.",
    "I now understand why people bring scorebooks and I am considering one.",
    "Wait, a save is an actual stat? I thought people were just saying that.",
    "I have started saying good take at the television. This is progressing quickly.",
    "The fact that every stadium is different is actually so cool."
  ],
  "superstition": [
    "The rally started after I opened this drink so the drink stays open forever.",
    "I have not crossed my legs since the third inning and I am committed now.",
    "Do not mention the streak. Do not even think about the streak.",
    "I changed channels once and they gave up a run. Lesson learned.",
    "The lucky seat is now legally binding.",
    "I wore this cap during the last comeback and yes that matters.",
    "Nobody in the group chat is allowed to send the celebration gif early.",
    "The same snack order is happening tomorrow if this works.",
    "I am standing until the inning ends because sitting feels dangerous.",
    "We scored while my phone was charging. It remains plugged in."
  ],
  "pets": [
    "The dog has learned the home run horn means humans become loud.",
    "My cat is sitting directly in front of the scorebug. Excellent timing.",
    "Team bandana is on. Serious business.",
    "The dog left during the pitching change and returned for the rally. Suspicious.",
    "My pet has no idea why I am yelling but remains supportive.",
    "Cat stepped on the remote during a tense at-bat and nearly ended the household.",
    "The dog thinks rally towels are a personal invitation to play.",
    "Pet slept through every quiet inning and woke up for chaos.",
    "I have explained the standings to the dog. Feedback was limited.",
    "The cat has claimed the lucky chair and therefore I am on the floor."
  ],
  "weatherGeneric": [
    "The breeze is doing just enough to make every fly ball interesting.",
    "Perfect temperature for nine innings and several bad decisions.",
    "The clouds look dramatic enough for a postseason montage.",
    "You can feel the air cool down as the lights take over.",
    "Sun in the outfield is making every catch look adventurous.",
    "This is exactly the kind of weather baseball was invented for.",
    "Wind is definitely part of the scouting report tonight.",
    "The jacket came on by the fifth and I refuse to admit I was cold earlier.",
    "It looked warm on television. Television lied.",
    "Clear sky, full crowd, no excuses."
  ],
  "radio": [
    "Caller says the season is saved. Previous caller said it was over. Balance.",
    "The host has opened the phone lines and immediately regrets it.",
    "Someone just blamed the batting order, bullpen, weather and mascot in one call.",
    "This caller has been on hold since the third inning and has prepared a thesis.",
    "Radio mood swings remain undefeated.",
    "The producer is screening calls like a playoff closer.",
    "One caller wants patience. The next wants twelve roster moves by sunrise.",
    "Postgame radio after a weird loss is performance art.",
    "The host said keep it brief and the caller ignored that instruction completely.",
    "Somebody just called to apologize for a take from two innings ago."
  ],
  "analyst": [
    "The score changed, but the process underneath it is worth watching too.",
    "The next ten pitches may tell us more than the last inning did.",
    "There is leverage here even if the scoreboard does not look dramatic yet.",
    "The defense is being forced to make decisions on every ball in play.",
    "This lineup is making the pitcher work for every clean out.",
    "The game is moving toward the bullpen, and that changes the matchup tree.",
    "Watch how aggressively the defense positions with runners aboard.",
    "The biggest question is whether this pressure becomes actual runs.",
    "A two-run lead now and a two-run lead late are completely different things.",
    "The box score will flatten a lot of what is happening in this inning."
  ],
  "troll": [
    "I am just here to observe the other fanbase with tremendous respect.",
    "Interesting pregame confidence. Very interesting.",
    "Please continue posting through it. The archive appreciates you.",
    "The scoreboard is currently doing my arguing for me.",
    "I have muted nobody because I need the full experience.",
    "This thread is aging at remarkable speed.",
    "I would never gloat early. I simply have several drafts ready.",
    "The opposing replies are getting quieter. Curious.",
    "No hostility here, only extremely targeted joy.",
    "I hope everyone remembers exactly what they posted an inning ago."
  ],
  "parking": [
    "The parking signs have become a puzzle I was not prepared to solve.",
    "We found a spot close enough to feel suspicious.",
    "The tailgate next to us has a better setup than my apartment.",
    "Everyone is pretending they remember which level they parked on.",
    "Traffic is already forming and the gates are not even open.",
    "I paid enough for this parking spot to expect box-score updates from it.",
    "Lot attendant has seen every possible form of game-day panic.",
    "The walk from the car has officially become part of the pregame ritual.",
    "One wrong turn and we are suddenly in employee parking.",
    "Future postgame me is going to hate present pregame me for this spot."
  ],
  "gates": [
    "The giveaway line has its own weather system at this point.",
    "Every gate looks faster until you join it.",
    "I picked the shortest line and somehow it became the longest.",
    "Ticket scanned. We are officially inside the baseball bubble.",
    "People are comparing entrance strategies like advanced analytics.",
    "The person ahead of us has twelve things in the bag-check tray.",
    "Gate opened and the crowd moved like a starting gun went off.",
    "I can see the field through the entrance and patience is gone.",
    "Wrong entrance, right stadium. Progress.",
    "That first blast of crowd noise when the doors open is undefeated."
  ],
  "seats": [
    "Our row has already established who is responsible for passing snacks.",
    "The sightline is better than expected and my mood improved immediately.",
    "Person on the aisle has become our unofficial traffic coordinator.",
    "The seat is smaller than memory but the view is doing the work.",
    "Everyone around us has adopted the same enemy umpire within two innings.",
    "There is one empty seat in the row and every foul ball is targeting it.",
    "The visiting fan beside us is taking the jokes well. Respect.",
    "Our section has synchronized its groans impressively.",
    "I can see the bullpen perfectly from here and will now overanalyze everything.",
    "The row behind us has turned into live commentary."
  ],
  "reseller": [
    "The listing went up before the plastic wrapping came off.",
    "Someone is trying to trade tonight's giveaway for three future giveaways. Ambitious.",
    "Price update: still ridiculous, somehow getting worse.",
    "I have watched the same item change hands twice before first pitch.",
    "The gate-flip economy is fully operational.",
    "People are negotiating in the concourse like this is a trade deadline.",
    "One person has a tote bag that is absolutely full of promo items.",
    "The words unopened and rare are doing a lot of work in these listings.",
    "I respect the hustle and fear the prices.",
    "Somebody already posted sold out even though thousands are still entering."
  ],
  "collector": [
    "Box corners survived the trip to my seat. Huge result.",
    "I brought a protective sleeve because I know who I am.",
    "This one is going next to the Season 2 giveaway on the shelf.",
    "The serial number is completely meaningless to me and I still checked it.",
    "Collector brain has already decided I need the matching set.",
    "I traded a duplicate and made a new baseball friend. Successful evening.",
    "The packaging art might be better than the actual item.",
    "I have documented condition before eating anything near it.",
    "Future museum piece in my apartment, according to me.",
    "The promo shelf has officially become a display wall."
  ],
  "vendor": [
    "Third inning and the hot dog pace is already ahead of projections.",
    "Peanut sales spike every time the inning gets boring. Science.",
    "I have heard five different score predictions from this aisle alone.",
    "The ice machine is fighting for its life tonight.",
    "One fan just ordered enough food for a small bullpen.",
    "Concession workers know the game only through crowd noise and it is surprisingly accurate.",
    "The rush started one out earlier than expected. Scouting report failed.",
    "We are down to the emergency pretzel tray.",
    "If the game goes extras the lemonade situation becomes strategic.",
    "The seventh-inning line is approaching legendary status."
  ],
  "localbiz": [
    "Show your ticket tomorrow and we will pretend this discount was planned.",
    "The game is loud enough in here that the kitchen knows when someone scores.",
    "We added one more television because apparently six was not enough.",
    "Win or lose, the postgame crowd gets fries.",
    "Opposing jerseys are welcome. Trash talk must remain clever.",
    "Tonight's special has been renamed after whoever gets the biggest hit.",
    "The neighborhood is basically one giant watch party right now.",
    "We are staying open through the final out because nobody is leaving anyway.",
    "Bring a score prediction and we might put the best one on the wall.",
    "Local business report: baseball is very good for appetizer sales."
  ],
  "mascot": [
    "Mascot has acquired a broom and I do not like where this is going.",
    "The mascot is conducting an entire section like an orchestra.",
    "Someone gave the mascot popcorn. Immediate mistake.",
    "Mascot just challenged a security guard to a footrace.",
    "The visiting section is receiving an unreasonable amount of mascot attention.",
    "Mascot camera awareness remains elite.",
    "There is no explanation for this dance routine and none is needed.",
    "Mascot stole a sign, improved it, and returned it.",
    "A mascot selfie line has formed with postseason intensity.",
    "The mascot has entered the dugout-adjacent area and everyone is nervous."
  ],
  "foulball": [
    "That foul ball changed direction twice and still found a drink.",
    "Everyone in the section tracked that ball except the one person it landed beside.",
    "Glove guy finally got a chance and absolutely whiffed.",
    "A foul ball has started a five-minute ownership dispute.",
    "The entire row ducked except one person who became a hero.",
    "That souvenir bounced through more hands than a rundown.",
    "Another foul ball, another instant section-wide scouting combine.",
    "Someone caught it clean and immediately gave it away. Crowd loved that.",
    "The ball disappeared under a seat and twelve people became detectives.",
    "Foul ball landed near food. Casualties unclear."
  ],
  "watchparty": [
    "The whole bar just stood up at the same time.",
    "One table is twenty seconds ahead and has become a spoiler hazard.",
    "The bartender has started announcing pitching changes.",
    "Nobody at this watch party has ordered calmly since the fourth inning.",
    "The opposing fan table is getting suspiciously quiet.",
    "Every television is synced except one cursed screen in the corner.",
    "We have strangers high-fiving now. The game has progressed.",
    "The room reacts to replay reviews like a courtroom.",
    "Kitchen ticket times are losing to baseball tension.",
    "Someone started a chant in a restaurant and somehow it worked."
  ],
  "transit": [
    "The platform became a jersey parade without anyone planning it.",
    "Everybody on this train is pretending not to refresh the same score.",
    "The bus radio has the game on and morale improved immediately.",
    "Rideshare driver knows the lineup better than I do.",
    "Postgame train mood can be diagnosed before the doors open.",
    "We missed one stop because the inning got interesting.",
    "The station announcement had to compete with a crowd roar from everyone's phones.",
    "Half this car is going to the park and nobody needed to ask.",
    "Traffic update: baseball has defeated infrastructure again.",
    "Walking from transit with a crowd of fans always feels like arriving at something important."
  ],
  "uniforms": [
    "The piping on these uniforms deserves its own appreciation post.",
    "Helmet and jersey colors are matching perfectly tonight.",
    "I did not expect to care this much about sock striping.",
    "The alternate look has officially won me over.",
    "Throwback font remains undefeated.",
    "Uniform matchup tonight is aesthetically elite.",
    "I need a full ranking of every cap combination immediately.",
    "The road set looks better under stadium lights than it has any right to.",
    "Someone in design cooked with this sleeve patch.",
    "I am once again asking for the retro uniforms to become permanent."
  ],
  "autograph": [
    "The rail crowd just moved because one player looked this direction.",
    "Sharpies are being passed around like emergency equipment.",
    "Kid got the signature they wanted and the night is already a win.",
    "One player stayed an extra minute and made about twenty people very happy.",
    "I brought the wrong pen. Devastating scouting error.",
    "There is always one person with a perfectly organized autograph binder.",
    "The autograph line has developed unofficial rules and leadership.",
    "I got close enough to say good luck and forgot every other word.",
    "Signed ball secured. I am now protecting it like evidence.",
    "No autograph today, but batting practice from the rail was worth it."
  ],
  "seasonticket": [
    "The usher nodded before I showed the ticket. We have reached veteran status.",
    "Our section has opinions about every lineup change and a long memory.",
    "I know exactly which inning to get food and I still choose wrong sometimes.",
    "The same people are back in the same seats arguing about the same things. Beautiful.",
    "Season-ticket life is recognizing strangers everywhere in the concourse.",
    "The row has a shared history of wins, losses and spilled drinks.",
    "I can tell how crowded the park is by the concession line near our seats.",
    "There are games I remember mostly because of who was sitting around me.",
    "Renewal emails annoy me until opening day and then I understand again.",
    "This seat has seen more emotional damage than most therapists."
  ],
  "photos": [
    "The scoreboard reflection on the upper deck looks incredible tonight.",
    "I caught the exact second the crowd realized the ball was gone.",
    "Golden hour over the foul pole is doing ridiculous things.",
    "The wide shot from behind home plate is the one.",
    "I keep telling myself one more photo and then taking twenty.",
    "The empty field before gates fully fill is my favorite view.",
    "Night game lights make every ordinary moment look dramatic.",
    "I got a photo of the dugout celebration with everyone midair.",
    "The ballpark shadows are changing every inning.",
    "I am going to have to delete other things from my phone after tonight."
  ],
  "wave": [
    "The wave has reached the section that swore it would not participate.",
    "We are three innings into a wave debate with no resolution.",
    "The visiting fans started their own counter-wave. This is getting political.",
    "A child has appointed themselves wave coordinator.",
    "The wave died at the luxury seats and the cheap seats are furious.",
    "Someone tried to start it during a 3-2 pitch. Criminal timing.",
    "Our section executed the wave perfectly and now feels accomplished.",
    "Anti-wave guy finally stood up. Historic compromise.",
    "The wave made one full lap and received an actual cheer.",
    "There are now more posts about the wave than the game."
  ],
  "scoreboard": [
    "The scoreboard operator found exactly the wrong fan at exactly the right time.",
    "Trivia question started an argument across three rows.",
    "The crowd camera has discovered a new recurring character tonight.",
    "Someone's birthday message had a typo and their friends are never letting it go.",
    "The dance cam has become aggressively competitive.",
    "A kid just won the between-innings contest and celebrated like a champion.",
    "Scoreboard replay got the biggest reaction of the inning.",
    "The camera found two opposing fans sitting together and the crowd chose chaos.",
    "The big screen graphic team is having an excellent night.",
    "I looked away from the field and somehow missed the funniest thing on the scoreboard."
  ],
  "callin": [
    "First caller says fire everyone. Second caller says extend everyone. Great start.",
    "I have been on hold for twelve minutes and my take has evolved twice.",
    "The host asked for one point and the caller brought seven.",
    "Someone just called in from the parking garage and sounds furious.",
    "The phone line mood changed completely after one inning.",
    "Caller claims they predicted this exact score and nobody can verify it.",
    "We have reached the part of the show where callers begin proposing lineup spreadsheets.",
    "One caller just apologized to the bullpen live on air.",
    "The host is trying to go to commercial and nobody will stop talking.",
    "Postgame radio has officially left the realm of reason."
  ],
  "concourse": [
    "The concourse televisions have their own full crowd now.",
    "I can tell what happened on the field entirely from the sound coming through the tunnel.",
    "There is always one concession stand with a mysteriously shorter line.",
    "I took one wrong turn and discovered a whole part of the park I had never seen.",
    "People are speed-walking back to their seats because the inning started.",
    "The concourse has become a temporary shelter from baseball stress.",
    "Every hallway has somebody explaining the last play to somebody who missed it.",
    "I can smell three different food options and have made no decision.",
    "The team store exit somehow deposited me on the opposite side of the stadium.",
    "Concourse crowd just froze around a television for a full count."
  ],
  "restroom": [
    "The line moved exactly zero feet during that pitching change.",
    "Everyone in here is listening for the crowd instead of speaking.",
    "I picked the inning and immediately heard a roar. Of course.",
    "The tiny television above the sink has become the most important screen in the building.",
    "People are checking phones in line like we are waiting for election results.",
    "Made it out before the next batter. Personal best.",
    "There is an unofficial play-by-play announcer in this line now.",
    "I heard groaning from the seating bowl and nobody wants to know why.",
    "The restroom mission has turned into a high-leverage sprint.",
    "I will simply never leave my seat again."
  ],
  "scorekeeper": [
    "My notation for this inning has become increasingly creative.",
    "A clean 1-2-3 inning is beautiful on paper.",
    "I need another pencil because baseball has defeated the first one.",
    "Someone asked to see my scorecard and I suddenly became very self-conscious.",
    "The margin notes are becoming more emotional than statistical.",
    "I love when the scorebook makes a chaotic inning look almost organized.",
    "This substitution just broke three different boxes on my page.",
    "There is something satisfying about writing K after K.",
    "My handwriting deteriorates directly with leverage.",
    "Future me will know exactly where tonight became weird."
  ],
  "optimism": [
    "A two-run game is basically an invitation to believe.",
    "The next baserunner changes the entire temperature.",
    "They have come back from worse and I have receipts.",
    "I refuse to let one bad inning decide my mood yet.",
    "All it takes is one mistake over the plate.",
    "The lineup turns over again. That is enough hope for me.",
    "We are not dead until the last out says so.",
    "This feels frustratingly close to becoming a rally.",
    "One clean inning and one crooked number. That is the plan.",
    "I have already pictured the comeback and therefore it is possible."
  ],
  "doomer": [
    "Every baserunner feels like the beginning of a documentary about our collapse.",
    "I knew peace for approximately one inning.",
    "The lead is technically safe and emotionally nonexistent.",
    "Why does every routine situation become a test of faith?",
    "I am watching because leaving would somehow make it worse.",
    "The bullpen door opened and my soul left my body.",
    "I have prepared for disappointment so thoroughly that hope feels irresponsible.",
    "This team treats a comfortable inning as a personal challenge.",
    "I would like to stop predicting disaster and yet the evidence keeps arriving.",
    "The score says close. My nervous system says emergency."
  ],
  "neighbors": [
    "Our row has invented a nickname for the person who keeps predicting pitches.",
    "The strangers around us now know each other's snack orders.",
    "Everyone in this section has agreed on one specific villain tonight.",
    "The kid two seats over has become our unofficial hype captain.",
    "We have passed the same bag of sunflower seeds across four families.",
    "Our section applauded somebody for returning with food before the inning ended.",
    "The visiting fan behind us has been adopted into the group chat against their will.",
    "We are now coordinating bathroom breaks as a unit.",
    "Someone in the row has a portable charger and is suddenly the most important person here.",
    "This section will never see each other again and currently feels like a small town."
  ],
  "commuteHome": [
    "The radio recap is making traffic slightly more tolerable.",
    "I am replaying the last inning in my head at every red light.",
    "The parking garage has not moved and sports radio is doing therapy.",
    "Everyone walking to the station is either glowing or staring at the ground.",
    "The car next to us is listening to the same postgame show.",
    "I reached home but stayed in the driveway to hear the final caller.",
    "Postgame traffic is where every questionable decision gets relitigated.",
    "The jersey stays on until I get home. Those are the rules.",
    "The train has split into celebration car and mourning car.",
    "I can tell who left early by who is asking what happened."
  ],
  "memories": [
    "Tonight already has one of those details I know I will remember years later.",
    "Old games come back to you through tiny things like a scoreboard sound or a seat number.",
    "Every franchise eventually builds a library of nights that made no sense at the time.",
    "I love when a current game suddenly reminds everyone of an old one.",
    "Some scores disappear. Some become shorthand for an entire season.",
    "The longer this league runs, the heavier every rematch gets.",
    "There are players I remember mostly because of one ridiculous night.",
    "One day this ordinary inning might be part of a championship story.",
    "The best league history is the stuff fans remember before the record book does.",
    "We keep saying remember when because there is finally enough history to mean it."
  ],
  "friends": [
    "Group chat has assigned blame before the inning is even over.",
    "One friend left the room and we scored. They have been banned from returning.",
    "The person who predicted a blowout has stopped responding.",
    "We have turned one normal game into six separate arguments.",
    "Someone sent the victory gif early and has been formally warned.",
    "Our score predictions are all dead and we are pretending that never happened.",
    "The non-baseball friend has accidentally become the loudest person here.",
    "We are coordinating snacks like a coaching staff.",
    "One person is watching on delay and the rest of us are living under censorship.",
    "The group chat has reached all-caps mode."
  ],
  "heckler": [
    "The heckler has finally found one line that actually landed.",
    "Someone yelled a scouting report instead of an insult. Innovative.",
    "The outfielder gave the section a tiny glance and everyone lost their minds.",
    "Heckler confidence is currently much higher than material quality.",
    "The visiting bullpen has heard the same joke seven times now.",
    "One fan is trying to start a call-and-response nobody agreed to.",
    "The section has begun rating heckles in real time.",
    "A genuinely clever line just earned applause from both fanbases.",
    "Somebody please retire that joke before the ninth inning.",
    "The heckling stopped for one pitch because everyone actually got nervous."
  ],
  "broadcast": [
    "The booth just went quiet and let the crowd tell the story. Good choice.",
    "Replay angle number three finally showed what actually happened.",
    "The announcer has begun circling one matchup and I am now obsessed too.",
    "Broadcast camera found the exact person who knew it was gone immediately.",
    "The graphics team pulled a stat I did not know I needed.",
    "The booth is carefully avoiding one specific jinx phrase.",
    "Slow motion made that play look even more impossible.",
    "The color analyst called the pitch before it happened. Suspiciously good.",
    "The broadcast has officially switched from game mode to story mode.",
    "That crowd mic is doing excellent work tonight."
  ],
  "tickets": [
    "I checked the resale app and immediately appreciated the seats I already have.",
    "Prices dropped just enough to tempt me into a bad decision.",
    "Standing room is starting to look like a premium product.",
    "Someone in the group chat has become the official ticket negotiator.",
    "I found a single seat and am considering abandoning everyone I know.",
    "The weather is nice and ticket prices noticed.",
    "One good matchup turned the cheap seats into luxury inventory.",
    "I bought late and somehow got a better deal than everyone who planned ahead.",
    "Seat upgrade temptation begins the second I walk past an empty lower section.",
    "Ticket market update: optimism is expensive."
  ],
  "promo": [
    "The giveaway box has become everyone's most protected possession.",
    "People arrived absurdly early and somehow it was still the correct decision.",
    "Tonight's theme graphics are everywhere and I kind of love it.",
    "The promo line has developed snacks, friendships and a social hierarchy.",
    "Somebody already traded their giveaway before first pitch.",
    "This theme night is much more committed than I expected.",
    "The concourse activation has a line longer than concessions.",
    "I came for the promotion and stayed for batting practice.",
    "Everyone is comparing which version of the giveaway they got.",
    "Special-night energy is carrying the building before anything has happened."
  ],
  "offbeat": [
    "A grounds crew member just made a catch and received a legitimate ovation.",
    "I have become invested in the bird currently patrolling shallow center.",
    "The person controlling the between-innings music understands comedy.",
    "A beach ball has survived longer than several rallies tonight.",
    "Someone is wearing a jersey for a team not involved in this game. Explain.",
    "The T-shirt cannon has developed better command than some pitchers.",
    "There is a tiny drama happening in the upper deck that television will never know about.",
    "I just watched an usher perfectly catch a falling cup without looking.",
    "The ball boy is currently leading the hustle leaderboard.",
    "A random stadium sound effect has become the funniest recurring bit of the night."
  ],
  "quiet": [
    "The crowd has settled into that low buzz where you can hear individual gloves pop.",
    "Nothing is happening and somehow that feels suspicious.",
    "A quiet inning is giving everyone time to remember they are nervous.",
    "The pace slowed down and the whole park seems to be waiting for something.",
    "You can hear conversations from three sections away right now.",
    "This is the part of the game where one baserunner suddenly feels enormous.",
    "The stadium feels calm in the specific way baseball never stays calm.",
    "Routine outs are quietly stacking up.",
    "Even the scoreboard music feels subdued this inning.",
    "Everyone is sitting back down, which probably means chaos is next."
  ]
};

export const SOCIAL_PHRASE_BANK=Object.fromEntries(Object.entries(BASE_SOCIAL_PHRASE_BANK).map(([category,list])=>[category,[...list,...(SOCIAL_PHRASE_EXPANSIONS[category]||[])]]));


export function flattenSocialBank(){return Object.values(SOCIAL_PHRASE_BANK).flat();}


const phraseHash=(s='')=>[...String(s)].reduce((n,c)=>((n*31)+c.charCodeAt(0))>>>0,2166136261);
export function pickSocialPhrase(category,key='',bucket=0){
  const list=SOCIAL_PHRASE_BANK[category]||SOCIAL_PHRASE_BANK.quiet;
  if(!list?.length)return '';
  return list[(phraseHash(key)+Number(bucket||0))%list.length];
}
