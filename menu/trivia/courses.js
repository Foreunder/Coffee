// Courses for the Foreunder Pub Quiz. Each hole's par sets the question: par 3 = easy, par 4 = normal, par 5 = hard.
// pars = championship setup from the most recent Masters / Open / U.S. Open played there.
// names = famous hole names shown on the tee countdown.
window.COURSES = [
  {"id": "foreunder", "name": "Foreunder Links", "loc": "The pub room", "tour": "house", "pars": [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4], "names": {}, "note": "House course"},
  {"id": "augusta", "name": "Augusta National", "loc": "Augusta, Georgia", "tour": "masters", "pars": [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4], "names": {"1": "Tea Olive", "2": "Pink Dogwood", "3": "Flowering Peach", "4": "Flowering Crab Apple", "5": "Magnolia", "6": "Juniper", "7": "Pampas", "8": "Yellow Jasmine", "9": "Carolina Cherry", "10": "Camellia", "11": "White Dogwood", "12": "Golden Bell", "13": "Azalea", "14": "Chinese Fir", "15": "Firethorn", "16": "Redbud", "17": "Nandina", "18": "Holly"}, "note": "The Masters"},
  {"id": "standrews", "name": "St Andrews Old Course", "loc": "St Andrews, Scotland", "tour": "open", "pars": [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 4, 4, 4], "names": {"1": "Burn", "14": "Long (Hell Bunker)", "17": "Road Hole", "18": "Tom Morris"}, "note": "30 Opens, last 2022"},
  {"id": "carnoustie", "name": "Carnoustie", "loc": "Carnoustie, Scotland", "tour": "open", "pars": [4, 4, 4, 4, 4, 5, 4, 3, 4, 4, 4, 4, 3, 5, 4, 3, 4, 4], "names": {"6": "Hogan's Alley", "14": "Spectacles"}, "note": "8 Opens, last 2018"},
  {"id": "muirfield", "name": "Muirfield", "loc": "Gullane, Scotland", "tour": "open", "pars": [4, 4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 4, 3, 4, 4, 3, 5, 4], "names": {}, "note": "16 Opens, last 2013"},
  {"id": "birkdale", "name": "Royal Birkdale", "loc": "Southport, England", "tour": "open", "pars": [4, 4, 4, 3, 4, 4, 3, 4, 4, 4, 4, 3, 4, 3, 5, 4, 5, 4], "names": {}, "note": "10 Opens, last 2017"},
  {"id": "hoylake", "name": "Royal Liverpool", "loc": "Hoylake, England", "tour": "open", "pars": [4, 4, 4, 4, 5, 3, 4, 4, 3, 4, 4, 4, 3, 4, 5, 4, 3, 5], "names": {"17": "Little Eye"}, "note": "13 Opens, last 2023"},
  {"id": "lytham", "name": "Royal Lytham & St Annes", "loc": "Lytham St Annes, England", "tour": "open", "pars": [3, 4, 4, 4, 3, 4, 5, 4, 3, 4, 5, 3, 4, 4, 4, 4, 4, 4], "names": {}, "note": "11 Opens, last 2012"},
  {"id": "stgeorges", "name": "Royal St George's", "loc": "Sandwich, England", "tour": "open", "pars": [4, 4, 3, 4, 4, 3, 5, 4, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4], "names": {}, "note": "15 Opens, last 2021"},
  {"id": "troon", "name": "Royal Troon", "loc": "Troon, Scotland", "tour": "open", "pars": [4, 4, 4, 5, 3, 5, 4, 3, 4, 4, 4, 4, 4, 3, 4, 5, 3, 4], "names": {"8": "Postage Stamp", "11": "Railway"}, "note": "10 Opens, last 2024"},
  {"id": "turnberry", "name": "Turnberry (Ailsa)", "loc": "Turnberry, Scotland", "tour": "open", "pars": [4, 4, 4, 3, 4, 3, 5, 4, 4, 4, 3, 4, 4, 4, 3, 4, 5, 4], "names": {"9": "Bruce's Castle", "18": "Duel in the Sun"}, "note": "4 Opens, last 2009"},
  {"id": "portrush", "name": "Royal Portrush", "loc": "Portrush, N. Ireland", "tour": "open", "pars": [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 5, 3, 4, 4, 3, 4, 4], "names": {"16": "Calamity Corner", "17": "Purgatory"}, "note": "3 Opens, last 2025"},
  {"id": "prestwick", "name": "Prestwick", "loc": "Prestwick, Scotland", "tour": "open", "pars": [4, 3, 5, 4, 3, 4, 4, 4, 4, 4, 3, 5, 4, 4, 4, 4, 4, 4], "names": {"3": "Cardinal", "5": "Himalayas", "17": "Alps"}, "note": "24 Opens, last 1925 (today's card)"},
  {"id": "musselburgh", "name": "Musselburgh Old Links", "loc": "Musselburgh, Scotland", "tour": "open", "pars": [3, 4, 4, 4, 3, 4, 5, 3, 4], "names": {}, "note": "6 Opens, last 1889 (9 holes)"},
  {"id": "cinqueports", "name": "Royal Cinque Ports", "loc": "Deal, England", "tour": "open", "pars": [4, 4, 5, 3, 5, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 5, 4, 4], "names": {}, "note": "2 Opens, last 1920 (today's card)"},
  {"id": "princes", "name": "Prince's", "loc": "Sandwich Bay, England", "tour": "open", "pars": [4, 3, 5, 4, 4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 4, 5, 3, 4], "names": {}, "note": "1 Open, 1932 (today's Dunes/Shore)"}
];
