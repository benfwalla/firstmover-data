import { FindYourNeighborhoodQuiz } from '@/components/FindYourNeighborhoodQuiz';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const budget = searchParams.budget;
  const vibes = searchParams.vibes;
  
  if (budget || vibes) {
    return {
      title: 'My NYC Neighborhood Results | FirstMover',
      description: `I found my perfect NYC neighborhoods with a $${budget} budget. See which neighborhoods match your lifestyle and commute.`,
      openGraph: {
        title: 'My NYC Neighborhood Results',
        description: `Perfect neighborhoods for a $${budget} budget`,
        type: 'article',
      },
    };
  }

  return {
    title: 'Find Your NYC Neighborhood | FirstMover',
    description: 'Answer 3 questions to find your perfect NYC neighborhood based on budget, lifestyle, and commute.',
    openGraph: {
      title: 'Find Your NYC Neighborhood',
      description: 'Discover which NYC neighborhoods fit your budget and lifestyle',
      type: 'website',
    },
  };
}

export default function FindYourNeighborhoodPage() {
  return (
    <div className="quiz-page">
      <Suspense fallback={<div>Loading...</div>}>
        <FindYourNeighborhoodQuiz />
      </Suspense>
    </div>
  );
}