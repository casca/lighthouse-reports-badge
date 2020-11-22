import { NowRequest, NowResponse } from '@vercel/node';
import axios from 'axios';

const formatPercentage = (n: number): string => `${Math.round(n * 100)}%`;

export default async (req: NowRequest, res: NowResponse) => {
  const { url } = req.query;
  if (!url) {
    return res.status(200).json({ error: 'Please provide a URL.' });
  }
  if (typeof url !== 'string') {
    return res.status(200).json({ error: 'Please provide only one URL.' });
  }

  try {
    const {
      data: { categories },
    } = await axios.get(url);

    const metrics = ['accessibility', 'best-practices', 'performance', 'pwa', 'seo'];

    const percentages: { [key: string]: number } = metrics.reduce(
      (r, m) => ({ ...r, [m]: +(categories && categories[m] && categories[m].score) }),
      {},
    );

    if (!Object.values(percentages).every((m) => !!m)) {
      throw new Error(
        'Incompatible data. See https://raw.githubusercontent.com/casca/lighthouse-reports/master/casca.dev.json for an example of a valid report.',
      );
    }

    const percentagesStr: { [key: string]: string } = Object.entries(percentages).reduce(
      (pStr, [m, p]) => ({ ...pStr, [m]: formatPercentage(p) }),
      {},
    );
    percentagesStr.average = formatPercentage(
      metrics.reduce((s, m) => s + percentages[m], 0) / metrics.length,
    );
    percentagesStr.averageWithoutPwa'] = formatPercentage(
      (percentages['accessibility'] + percentages['best-practices'] + percentages['seo']) / 3
    );
    
    res.status(200).json(percentagesStr);
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
};
