
export function formatSRTTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

export function createNetflixStyleSRT(sentences: string[], markTimings: Record<string, number>): string {
  let srtContent = '';
  const minimumDuration = 2000;
  let lastEndTime = 0;
  
  console.log('Creating SRT with timings:', JSON.stringify(markTimings));
  
  sentences.forEach((sentence, index) => {
    const startMark = `mark_${index}`;
    const endMark = `mark_${index + 1}`;
    
    let startTime = markTimings[startMark];
    if (startTime === undefined || startTime < lastEndTime) {
      startTime = lastEndTime;
    }
    
    let endTime = markTimings[endMark];
    const approxDuration = Math.max(minimumDuration, (sentence.length / 10) * 1000);
    
    if (endTime === undefined || endTime <= startTime) {
      endTime = startTime + approxDuration;
    }
    
    lastEndTime = endTime;
    const formattedSentence = sentence.trim();
    
    srtContent += `${index + 1}\n${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n${formattedSentence}\n\n`;
  });
  
  return srtContent;
}
