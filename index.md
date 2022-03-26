# Language Generator Application - Development Blog
_View the current status of the project [here](https://lang-gen.herokuapp.com/)_

This is a yet-to-be-named application that walks users through all the steps of creating a [constructed language](https://en.wikipedia.org/wiki/Constructed_language). My goals in this project are to:
- Model every aspect of language in ways that can transform user input into a naturalistic language
- Appeal to users at all levels of linguistic knowledge, offering both easy-to-use templates drawn from real-world languages and also advanced settings for finer control over each feature
- Provide an easy-to-use interface that allows users either to realize their concept quickly or to allow their language to grow organically as they explore different options

The Development Blog is a place for me to explain the technical aspects involved in the project. Just as constructed languages have given me a sandbox to develop my understanding of linguistic concepts, this project has allowed me to exercise a wide variety of technical skills and theoretical knowledge. 

### Project Origins
_November 2021_

_Coming soon..._ 


### Generating Words with Markov Chains
_January 2022_

_Coming soon..._


### What makes a language "look" like another language?
_March 26, 2022_

As it stands, the application can now take a phonemic inventory and phonotactic constraints from the user input on the front-end, build a Markov model according to that input, and generate a list of words that it sends back to the user. Unfortunately, with the exception of falling into certain phonotactic constraints, the words generated are completely random. In a natural language, certain sounds and combinations of sounds are far more common than others. English words, for instance, are far more likely to end in a consonant than in a vowel, while the opposite is true for Portuguese. The consonant cluster /sf/, like in "sphere", is very rare in English, while the cluster /tr/, as in "tree", is far more common. For a constructed language to appear naturalistic, the word generator model needs to be tweaked for higher or lower probablilities of certain phonemes in certain contexts.

My initial approach was leave this up the user. The Markov model's transition probabilities depend on three factors: 1) The first phoneme, 2) the phonotactic context, and 3) the following phoneme. For example, A user could select all transitions where:
1. the first phoneme is /s/, 
2. the phonotactic context is "onset", and 
3. the second phoneme is any fricative
and set the frequency to "very seldom" to prevent (but not prohibit) clusters like the /sf/ of "sphere" or /sv/ of "svelte".

As it turns out, though, setting all these trends manually is... tedious at best, and absolute guesswork at worst. I found that even when trying to replicate a language I was very familiar (Spanish), I simply couldn't determine what trends really made Spanish _feel_ like Spanish. Is it that syllables often end in alveolar sonorants? If so, how often? Are velar obstruents less common than labial ones? Or am I just imagining that? If this is so hard for a language I know so well, how would I ever have any success for a language that exists only in my imagination?

Clearly this wasn't going to work out.

I was clearly going to need to automate this step to some degree. As with every step, I intended to provide templates to guide users with a less clearly defined vision of the linguistic features they wanted. But I also want those templates to be open to alterations, for users to tweak and build upon them. But how could I mould natural language data (if I could even find it) into such a particular application? 

My solution (still evolving) is this:
1. **Gather the data**: I wrote a series of Python web scrapers to gather word frequency data from a handful of Wikipedia pages. To avoid overfitting, I decided to cast my net a little broader than specific languages (as I did with phonemic inventories), and so combined data from languages that are similar either through genetic relation or areal contact. The scrapers gather word lists and select the top 500 most common words from that language.
2. **Transform the words into phonemic transcriptions**: With these word lists, I wrote a second scraper that searched for each word on Wiktionary and grabbed the IPA transcription of the word in that language, creating a list of phonemic transcriptions.
3. **Split up phonemes and syllables**: Using the existing tools in the Go backend for recognizing multi-character phonemes, I split the transcription lists by syllable and phoneme and put them into a CSV format, with each row representing a word and each cell representing a phoneme or syllable break. This had the added benefit of providing suprasegmental data, like average word length and stress patterns, which I can use elsewhere.
4. **Sort phonemes by context and vectorize**: Since the word generator Markov model's probabilities depend on where in the word two phonemes occur (e.g. do they form a cluster at the start of the syllable or do they straddle two syllables?), I could then sort phoneme transitions by context. I also dropped the IPA string representations and transformed the phonemes into the vector-like data structures I use on the backend to represent each phonetic feature (manner of articulation, voicing, aspiration, non-pulmonic airflow, etc.) as integers for ease of analysis.
5. **Analyze**: This final step is by far the most involved, and it's where I have to grapple with the big questions of "What makes a language _look like_ another language?" and "How can I capture the character of a language in a handful of human-readable phonotactic rules?". The analysis step has taken me on a deep dive into information theory, leaning heavily on an old but excellent book _An Introduction to Information Theory: Symbols, Signals, and Noise_ by John R. Pierce (1961). 

At first, the Markov word generator models select phonemes more or less at random. An /s/ is just as likely to be followed by a /v/ ("svelte") as it is to be followed by a /t/ ("stop", "steel", "star", etc.). The real-world languages that the data is drawn from, however, are far from random. For instance, in my  Romance language data (Spanish, Italian, and Portuguese), a word is about three times as likely to begin with a consonant than with a vowel, despite the fact that there is a roughly 50/50 split of consonants and vowels in the rest of the word. 

In information theory terms, the random probabilities of a newly-created word generator model denote _high entropy_, while the more predictable distributions of phonemes in real-world languages denotes _low entropy_. Entropy is a notoriously obscure word, but in this case it can be thought of as uncertainty. Suppose we are generating words and want to determine whether the words sound more like Swedish or Italian. If the phonemes are truly selected at random, the words will be gibberish, and they will resemble neither language. We may say some words sound more Swedish and some more Italian, but we would have very little _certainty_ of our assessments. By adjusting the probabilities of selecting certain phonemes, the words our model generates can begin to more closely resemble those of some target language like Swedish. We will then be able to say with far more certainty that the words our model generates resemble Swedish over Italian. Thus, by adjusting the probabilities of our model away from their perfectly random starting values, we lower the entropy of our model.

Lower entropy, however, only means that the model is less random, and we specifically want our model to be unrandom in the same way that Swedish is unrandom. That means we have to find some way of comparing entropies. This is where relative entropy, also known as [Kullback-Leibler divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence), comes in. 

Relative entropy assumes that two probability distributions share the same probability space, i.e. that all the possible phonemes in our random, unweighted model are also possible in the data of our target language, and vice versa. They may be extremely unlikely, but they need to at least be possible. Relative entropy provides us with a way of quantifying whether our model is predictable in the same ways that our target language is predictable, and with this measure in hand, we can apply different weights to our random model and see which ones minimize the divergence.

That's the goal. Now I need only determine some method that can produce the rules that will minimize the divergence. This is complicated by the requirement that these rules be few and simple enough to be human readable, so that a user can use them as a template to build upon. They must also be generic enough that they can handle phonemes that are absent from the target language. Once I've found a satisfactory method, I'll follow up this post with a second part to describe it. 


