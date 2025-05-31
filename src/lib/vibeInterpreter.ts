// Simple vibe interpretation for MVP

export interface VibeInterpretation {
  energy: number;      // 0-1 (minimal to intense)
  darkness: number;    // 0-1 (bright to dark)
  complexity: number;  // 0-1 (simple to complex)
  elements: string[];  // which elements to include
}

export function interpretVibe(vibe: string): VibeInterpretation {
  const lower = vibe.toLowerCase();
  
  // Simple keyword-based interpretation
  const interpretation: VibeInterpretation = {
    energy: 0.5,
    darkness: 0.5,
    complexity: 0.3,
    elements: ['kick', 'bass'] // Always start with kick and bass
  };

  // Energy keywords
  if (lower.includes('intense') || lower.includes('driving')) {
    interpretation.energy = 0.8;
  } else if (lower.includes('minimal') || lower.includes('subtle')) {
    interpretation.energy = 0.3;
  }

  // Darkness keywords
  if (lower.includes('dark') || lower.includes('deep')) {
    interpretation.darkness = 0.8;
  } else if (lower.includes('bright') || lower.includes('light')) {
    interpretation.darkness = 0.2;
  }

  // Complexity keywords
  if (lower.includes('complex') || lower.includes('layered')) {
    interpretation.complexity = 0.8;
    interpretation.elements.push('hihat');
  } else if (lower.includes('simple') || lower.includes('minimal')) {
    interpretation.complexity = 0.2;
  }

  // Element keywords
  if (lower.includes('hihat') || lower.includes('percussion')) {
    if (!interpretation.elements.includes('hihat')) {
      interpretation.elements.push('hihat');
    }
  }

  return interpretation;
}

// Convert interpretation to SuperCollider parameters
export function vibeToParams(vibe: VibeInterpretation) {
  return {
    // Darker = lower cutoff frequencies
    basslineCutoff: 400 + (1 - vibe.darkness) * 800,
    
    // Higher energy = shorter kick decay, higher resonance
    kickDecay: 0.5 - (vibe.energy * 0.3),
    bassResonance: 0.2 + (vibe.energy * 0.3),
    
    // Complexity affects pattern variation
    patternVariation: vibe.complexity,
    
    // Which elements to play
    elements: vibe.elements
  };
}