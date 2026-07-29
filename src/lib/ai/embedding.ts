// Fallback high-quality hash-based vectorizer for robust offline/fallback usage
function generateHashEmbedding(text: string, dimensions = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  
  if (words.length === 0) return vector;
  
  for (const word of words) {
    // Generate a simple hash value for the word
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Map the hash to multiple dimensions to distribute features
    for (let i = 0; i < 3; i++) {
      const index = Math.abs((hash + i * 123456789)) % dimensions;
      vector[index] += 1;
    }
  }
  
  // Normalize the vector (so that its Euclidean norm is 1)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }
  
  return vector;
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Try to dynamically import and use Xenova transformers
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    // Fall back to our robust hash-based vectorizer
    return generateHashEmbedding(text, 384);
  }
}
