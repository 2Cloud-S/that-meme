'use server'

import { extract } from '@extractus/article-extractor'
import { load } from 'cheerio'

const STOP_WORDS = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
const EMOTION_KEYWORDS = {
  happy: ['success', 'win', 'happy', 'great', 'awesome', 'amazing', 'excellent', 'perfect', 'joy'],
  sad: ['fail', 'sad', 'bad', 'terrible', 'awful', 'wrong', 'poor', 'unfortunate'],
  surprised: ['shock', 'surprise', 'unexpected', 'amazing', 'incredible', 'unbelievable'],
  confused: ['what', 'confused', 'strange', 'weird', 'odd', 'mysterious'],
  excited: ['wow', 'awesome', 'incredible', 'amazing', 'fantastic', 'extraordinary']
};

type Meme = {
  id: string
  name: string
  url: string
  width: number
  height: number
  box_count: number
}

interface WordScore {
  word: string;
  score: number;
}

interface ScoredMeme {
  meme: Meme;
  score: number;
}

function calculateTF(word: string, words: string[]): number {
  const wordCount = words.filter(w => w === word).length;
  return wordCount / words.length;
}

function calculateRelevanceScore(word: string, position: number, totalWords: number): number {
  // Words appearing earlier get higher scores
  const positionScore = 1 - (position / totalWords);
  // Title words get bonus points
  const titleBonus = position < (totalWords * 0.1) ? 1.5 : 1;
  return positionScore * titleBonus;
}

function findEmotionalContext(words: string[]): string[] {
  const emotions: string[] = [];
  const wordSet = new Set(words.map(w => w.toLowerCase()));

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(keyword => wordSet.has(keyword))) {
      emotions.push(emotion);
    }
  }
  return emotions;
}

async function analyzePremiumContent(content: string): Promise<string[]> {
  try {
    console.log('🚀 Starting AI analysis...');
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-Vision-Free",
        messages: [{
          role: "user",
          content: `Analyze this article and suggest 10 relevant meme keywords or phrases that would make good memes. Focus on humor, emotions, and key themes:

Article: ${content}

Provide only keywords/phrases, one per line, no numbers or explanations.`
        }],
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["<|eot_id|>", "<|eom_id|>"]
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error('Failed to get AI suggestions');
    }

    const data = await response.json();
    console.log('✅ AI Response Data:', data);
    
    const suggestions = data.choices[0]?.message?.content
      ?.split('\n')
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 10) || [];

    console.log('🎯 Processed Suggestions:', suggestions);

    return suggestions;
  } catch (error) {
    console.error('💥 Error in premium analysis:', error);
    return [];
  }
}

// Add new meme API interfaces
interface ImgFlipMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

interface GiphyMeme {
  id: string;
  title: string;
  images: {
    original: {
      url: string;
    }
  }
}

interface TenorMeme {
  id: string;
  title: string;
  media_formats: {
    gif: {
      url: string;
    }
  }
}

// Add new function to fetch from multiple APIs
async function fetchMemesFromMultipleAPIs(searchQuery: string, emotions: string[], isPremium: boolean) {
  // Limit number of sources and results for free users
  const sources = isPremium ? ['imgflip', 'giphy', 'tenor'] : ['imgflip'];
  const maxResults = isPremium ? 15 : 5;

  let allMemes: ScoredMeme[] = [];

  for (const source of sources) {
    const memes = await fetchMemesFromSource(source, searchQuery, emotions);
    allMemes = [...allMemes, ...memes];
  }

  // Sort by relevance score and limit results
  return allMemes
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.meme);
}

// Add helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Rename existing fetchMemes to fetchImgFlipMemes
async function fetchImgFlipMemes(query: string, emotions: string[], limit: number): Promise<Meme[]> {
  const response = await fetch(`https://api.imgflip.com/get_memes`)
  const data = await response.json()
  
  if (data.success) {
    const allMemes = data.data.memes;
    const scoredMemes = allMemes.map((meme: Meme) => {
      let score = 0;
      const memeName = meme.name.toLowerCase();
      const queryWords = query.toLowerCase().split(' ');
      
      // Score based on direct word matches
      queryWords.forEach(word => {
        if (memeName.includes(word)) {
          score += 2;
        }
      });

      // Score based on emotional context
      emotions.forEach(emotion => {
        if (EMOTION_KEYWORDS[emotion as keyof typeof EMOTION_KEYWORDS].some(keyword => 
          memeName.includes(keyword)
        )) {
          score += 1.5;
        }
      });

      // Bonus for shorter meme names (often more iconic)
      score += 1 / memeName.split(' ').length;

      return { meme, score };
    });

    return scoredMemes
      .sort((a: ScoredMeme, b: ScoredMeme) => b.score - a.score)
      .slice(0, limit)
      .map((item: ScoredMeme) => item.meme);
  }
  
  return [];
}

// Add helper function to get most relevant keyword
function getMostRelevantKeyword(query: string): string {
  const words = query.split(' ')
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  // For AI suggestions, just take the first word/phrase
  if (words.length === 1) {
    return words[0];
  }

  // For regular queries, find the longest word as it's likely more specific
  return words.reduce((longest, current) => 
    current.length > longest.length ? current : longest
  , words[0]);
}

// Update the API functions to use single keyword
async function fetchGiphyMemes(query: string, limit: number): Promise<GiphyMeme[]> {
  try {
    const keyword = getMostRelevantKeyword(query);
    console.log('🎯 Giphy search keyword:', keyword);
    
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${encodeURIComponent(keyword)}&limit=${limit}&rating=g`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching from Giphy:', error);
    return [];
  }
}

async function fetchTenorMemes(query: string, limit: number): Promise<TenorMeme[]> {
  try {
    const keyword = getMostRelevantKeyword(query);
    console.log('🎯 Tenor search keyword:', keyword);
    
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${encodeURIComponent(keyword)}&limit=${limit}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching from Tenor:', error);
    return [];
  }
}

// Add helper function to fetch memes from specific source
async function fetchMemesFromSource(source: string, query: string, emotions: string[]): Promise<ScoredMeme[]> {
  switch (source) {
    case 'imgflip':
      const imgflipMemes = await fetchImgFlipMemes(query, emotions, 10);
      return imgflipMemes.map(meme => ({ meme, score: 1 }));
    
    case 'giphy':
      const giphyMemes = await fetchGiphyMemes(query, 4);
      return giphyMemes.map(meme => ({
        meme: {
          id: `giphy-${meme.id}`,
          name: meme.title,
          url: meme.images.original.url,
          width: 0,
          height: 0,
          box_count: 0
        },
        score: 0.8
      }));
    
    case 'tenor':
      const tenorMemes = await fetchTenorMemes(query, 1);
      return tenorMemes.map(meme => ({
        meme: {
          id: `tenor-${meme.id}`,
          name: meme.title,
          url: meme.media_formats.gif.url,
          width: 0,
          height: 0,
          box_count: 0
        },
        score: 0.6
      }));
    
    default:
      return [];
  }
}

export async function findMemes(formData: FormData) {
  const url = formData.get('url') as string;
  const isPremium = formData.get('isPremium') === 'true';

  try {
    const article = await extract(url);
    if (!article || !article.content) {
      throw new Error('Could not extract article content');
    }

    const $ = load(article.content);
    $('script, style, iframe, img').remove();
    const cleanContent = $.html();
    
    const text = $('body').text();
    const words = text.split(/\s+/)
      .map(word => word.toLowerCase())
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    let searchQuery = '';
    const emotions = isPremium ? findEmotionalContext(words) : []; // Emotional context only for premium

    if (isPremium) {
      // Premium features: AI analysis, emotional context, multiple sources
      const aiSuggestions = await analyzePremiumContent(text);
      searchQuery = aiSuggestions.join(' ');
    } else {
      // Free features: basic word frequency analysis, single source
      const wordScores: WordScore[] = words.map((word, index) => ({
        word,
        score: calculateTF(word, words) * calculateRelevanceScore(word, index, words.length)
      }));

      searchQuery = wordScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) // Limit keywords for free users
        .map(item => item.word)
        .join(' ');
    }

    const memes = await fetchMemesFromMultipleAPIs(searchQuery, emotions, isPremium);

    if (memes.length === 0) {
      return { 
        success: false, 
        error: 'No relevant memes found for this article. Try another one!' 
      }
    }

    return { 
      success: true, 
      article: { 
        title: article.title || 'Untitled Article', 
        content: cleanContent 
      }, 
      memes 
    }
  } catch (error) {
    console.error('Error:', error)
    if (error instanceof Error && error.message.includes('Invalid URL')) {
      return { success: false, error: 'Please enter a valid URL' }
    }
    return { 
      success: false, 
      error: 'Failed to process the article. Please try another URL.' 
    }
  }
}

