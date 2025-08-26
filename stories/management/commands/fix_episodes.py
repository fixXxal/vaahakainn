from django.core.management.base import BaseCommand
from stories.models import Episode, Story

class Command(BaseCommand):
    help = 'Fix episode linking to stories'

    def handle(self, *args, **options):
        self.stdout.write('Checking episodes and stories...\n')
        
        # Show all episodes
        episodes = Episode.objects.all().order_by('episode_number')
        self.stdout.write(f'Found {episodes.count()} episodes:')
        for ep in episodes:
            self.stdout.write(f'  - Episode {ep.episode_number}: {ep.title_dv}')
        
        # Show all stories
        stories = Story.objects.all()
        self.stdout.write(f'\nFound {stories.count()} stories:')
        for story in stories:
            self.stdout.write(f'  - Story: {story.title}')
            linked = story.episodes.order_by('episode_number')
            self.stdout.write(f'    Currently has {linked.count()} episodes linked:')
            for ep in linked:
                self.stdout.write(f'      * Episode {ep.episode_number}: {ep.title_dv}')
        
        # Fix: Link all episodes to the first story
        if stories.exists() and episodes.exists():
            story = stories.first()
            self.stdout.write(f'\nLinking all episodes to story: {story.title}')
            
            for episode in episodes:
                story.episodes.add(episode)
                self.stdout.write(f'  ✓ Added Episode {episode.episode_number}')
            
            story.save()
            self.stdout.write('\nStory saved!')
            
            # Verify the fix
            self.stdout.write('\nAfter linking:')
            linked = story.episodes.order_by('episode_number')
            self.stdout.write(f'Story "{story.title}" now has {linked.count()} episodes:')
            for ep in linked:
                self.stdout.write(f'  - Episode {ep.episode_number}: {ep.title_dv}')
        
        self.stdout.write('\n✅ Episode linking fixed!')