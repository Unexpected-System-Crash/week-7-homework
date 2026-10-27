import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { getReviewsByParkId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

//Uses Gemini to summarize a restaurant's reviews
export async function GeminiSummary({ parkId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByParkId(
    getFirestore(firebaseServerApp),
    parkId
  );

  const reviewSeparator = "@";
  const prompt = `
    Based on the following park reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the park. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY1) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://genkit.dev/docs/get-started/
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="park__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}


export function GeminiSummarySkeleton() {
  return (
    <div className="park__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
