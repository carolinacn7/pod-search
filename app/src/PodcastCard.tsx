import type { Podcast } from './types'

function formatEpisodes(count: number) {
  return `${count} ${count === 1 ? 'episodio' : 'episodios'}`
}

export default function PodcastCard({ podcast }: { podcast: Podcast }) {
  const { title, author, imageUrl, episodeCount } = podcast
  return (
    <article className="card">
      <img src={imageUrl} alt={`Portada de ${title}`} width={96} height={96} />
      <div className="card-body">
        <h2>{title}</h2>
        <p className="author">{author}</p>
        {episodeCount !== undefined && <p className="episodes">{formatEpisodes(episodeCount)}</p>}
      </div>
    </article>
  )
}
