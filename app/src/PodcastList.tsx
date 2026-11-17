import PodcastCard from './PodcastCard'
import type { Podcast } from './types'

export default function PodcastList({ podcasts }: { podcasts: Podcast[] }) {
  return (
    <ul className="podcast-list">
      {podcasts.map((p) => (
        <li key={p.id}>
          <PodcastCard podcast={p} />
        </li>
      ))}
    </ul>
  )
}
