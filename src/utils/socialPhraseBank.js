const bank=(...items)=>items;

export const SOCIAL_PHRASE_BANK={
  stadium:bank(
    'This ballpark is ridiculously pretty tonight.','Why did I choose seats that require a hiking permit.','Hot dog acquired. The game may now begin.','The concourse smells like fries and optimism.','I have walked past my section three times. I live here now.','The upper deck view is honestly incredible.','The person behind me has managed every pitch better than the actual manager.','I left for concessions and apparently missed an entire inning.','Somebody near me has a scorebook. Respect.','The mascot just scared a child and then immediately made their day.','Why is every bathroom somehow on the opposite side of the stadium.','You can hear this crowd from the concourse.','The sunset over the outfield is doing numbers right now.','The line for nachos has entered extra innings.','I paid ballpark prices for fries and somehow I am still happy.'
  ),
  home:bank(
    'Dinner is getting cold because I refuse to leave this inning.','My stream froze at the exact worst possible moment. Naturally.','The neighbor yelled before my feed caught up. Spoiler alert, apparently.','I turned it off for five minutes and everything happened. You are welcome.','Muted the broadcast for one inning and my blood pressure improved.','The dog has left the room. Even he has had enough.','I am watching from the couch like I personally have defensive responsibilities.','Popcorn in the second, existential crisis in the seventh. Baseball.','I promised I would not yell at the television tonight. That promise lasted four pitches.','Remote in one hand, score app in the other. Healthy hobby.'
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
    'Okay I finally understand why everyone hates a double play now.','I have been watching baseball for a week and apparently this is my whole personality.','Can someone explain why every 0-2 count makes me nervous.','I thought baseball was relaxing. I was lied to.','I learned what a sacrifice fly is and now I am unstoppable.','Why does nine innings sometimes feel like twenty minutes and sometimes six years.'
  ),
  superstition:bank(
    'Nobody move. We scored while I was standing here.','I changed seats and immediately regretted it.','Same hat tomorrow. No discussion.','I refuse to say the words everyone is thinking.','Do not text me during this inning. The ritual must continue.','I turned the broadcast volume down and we started hitting. Science.'
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
  quiet:bank(
    'This game has settled into that weird middle-inning hum.','Nothing dramatic happening and somehow I am still locked in.','Baseball has a lot of waiting and then suddenly none at all.','One of those innings where everyone collectively exhales.','The crowd is doing the low murmur thing. Something big is eventually going to happen.','Routine baseball is underrated until it stops being routine.'
  )
};

export function flattenSocialBank(){return Object.values(SOCIAL_PHRASE_BANK).flat();}


const phraseHash=(s='')=>[...String(s)].reduce((n,c)=>((n*31)+c.charCodeAt(0))>>>0,2166136261);
export function pickSocialPhrase(category,key='',bucket=0){
  const list=SOCIAL_PHRASE_BANK[category]||SOCIAL_PHRASE_BANK.quiet;
  if(!list?.length)return '';
  return list[(phraseHash(key)+Number(bucket||0))%list.length];
}
