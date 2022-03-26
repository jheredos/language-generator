# The Language Generator

__Check out the development blog [here](https://jheredos.github.io/language-generator/)__

This is an application that leads you step by step through the process of creating a fictional language. Like Klingon and the many languages of Middle Earth, [constructed languages](https://en.wikipedia.org/wiki/Constructed_language) can be a form of artistic expression, an educational tool for better understanding real-world languages, or to add depth to a fictional world. But you don't have to be a professional linguist like Marc Okrand or JRR Tolkien to construct a language. 

I have tried to make the each step accessible to those with little knowledge of linguistics. Templates are available at each step so you can easily draw off of real-world languages. Currently the app makes heavy use of [IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) characters, but features for creating orthographic representations are coming in the future. 

See [https://lang-gen.herokuapp.com/](https://lang-gen.herokuapp.com/) to give it a try. Note that this is a work in progress, and it is still in its early stages, so every part of the app is subject to frequent and drastic changes.


## Planned features

#### General
* Login, save, and load your languages
* Represent your languages through custom orthographies instead of IPA
* Improved styles, including support for smaller screens and mobile

#### Phonology and Phonotactics
* Stress patterns and tone categories
* More control over phonotactic patterns to give your language a more distinct flavor
* Allophony and sound changes

#### Morphology
* Generate fusional and agglutinative languages
* Select grammatical categories like case, number, and class, and mark them through affixes, tone shifts, reduplication, and more
* Derivational morphology and compounds

#### Syntax
* Customize word order, prepositions/postpositions, head/dependent-marking, morphosyntactic alignment, and more
* Generate language samples according to your choices in all the above categories

#### Lexicon
* Generate whole dictionaries according to the rules of your language
* Borrow words from other languages, 
* Evolve your language with sound changes and semantic shifts
* Create entire families of languages


## Technical overview
For anyone who may be interested, the application is built with:
* Vue 3
* Pug
* Coffeescript
* Bootstrap

...and works alongside a backend made with:
* Go (Golang)
* PostgreSQL

Words are randomly generated on the backend using a Markov chain model, generated according to user input, including custom transition probabilities (UI forthcoming). 
