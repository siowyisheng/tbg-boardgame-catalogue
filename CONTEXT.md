# Board game shop catalogue

A public catalogue of the board games a board game shop has on its shelves, for customers to browse, shortlist and report problems with.

## Language

**Game**:
A title the shop owns, shown in the catalogue with attributes taken from BoardGameGeek.
_Avoid_: Title, product, item

**Catalogue**:
The set of Games the shop currently owns and shows publicly. A Game appears under its BoardGameGeek name.
_Avoid_: Library, inventory, collection

**Removed Game**:
A Game an Admin has taken out of the Catalogue. It is hidden from the public but keeps its past Reports and can be restored. Refreshing data from BoardGameGeek never brings a Removed Game back.
_Avoid_: Deleted game

**Unverified Game**:
A Game whose Attributes have not yet been confirmed against BoardGameGeek. Marked as such until they are.

**Attribute**:
One of the seven predetermined facts shown and filtered on for each Game: official player count, best player counts, playing time, complexity, rating, type, category.

**Official player count**:
The minimum to maximum number of players printed on the box.

**Best player counts**:
The player counts the BoardGameGeek community rates as best for the Game. Can be more than one count.

**Complexity**:
BoardGameGeek's weight score (1 to 5), also shown as a band: Light, Medium or Heavy.

**Rating**:
BoardGameGeek's average user rating, rounded to one decimal place.

**Type**:
BoardGameGeek's broad family of a Game (for example Strategy, Party, Family). A Game can have more than one.

**Category**:
BoardGameGeek's finer-grained theme or mechanic label (for example Fantasy, Economic). A Game can have many.

**Admin**:
A shop staff member who adds Games to and removes Games from the Catalogue and handles Reports. Signs in with a shared password.
_Avoid_: Owner, moderator

**Report**:
A public user's note that a Game has missing or damaged components. Can be anonymous; name and email are optional so the shop can follow up. Open until an Admin resolves it.
_Avoid_: Ticket, complaint

**Shortlist**:
A set of 1 to 8 Games a group of friends picks from the Catalogue to decide what to play. Can be shared as a link and an image. View-only: nobody votes on it.
_Avoid_: Wishlist, cart, favourites
