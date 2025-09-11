from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.contenttypes.models import ContentType
from .models import Episode, Story, Category, Comment, Reaction, ShortStory
import json

def home(request):
	featured_stories = Story.objects.order_by('-release_date')[:3]
	featured_episodes = Episode.objects.order_by('-published_date')[:5]
	featured_short_stories = ShortStory.objects.filter(is_published=True, is_featured=True).order_by('-published_date')[:3]
	lang = request.session.get('lang', 'dv')
	return render(request, 'home.html', {
		'featured_stories': featured_stories,
		'featured_episodes': featured_episodes,
		'featured_short_stories': featured_short_stories,
		'lang': lang,
	})

def episode_list(request):
	episodes = Episode.objects.order_by('episode_number')
	lang = request.session.get('lang', 'dv')
	return render(request, 'episode_list.html', {
		'episodes': episodes,
		'lang': lang,
	})

def episode_detail(request, pk):
	episode = get_object_or_404(Episode, pk=pk)
	lang = request.session.get('lang', 'dv')
	
	# Get the story this episode belongs to
	story = episode.stories.first()  # Get the first story this episode belongs to
	
	# Get previous and next episodes within the same story
	previous_episode = None
	next_episode = None
	
	if story:
		# Get all episodes for this story, ordered by episode number
		story_episodes = story.episodes.order_by('episode_number')
		
		# Find previous episode
		previous_episode = story_episodes.filter(
			episode_number__lt=episode.episode_number
		).order_by('-episode_number').first()
		
		# Find next episode
		next_episode = story_episodes.filter(
			episode_number__gt=episode.episode_number
		).order_by('episode_number').first()
	
	# Get comments for this episode
	episode_ct = ContentType.objects.get_for_model(Episode)
	comments = Comment.objects.filter(
		content_type=episode_ct, 
		object_id=episode.id, 
		is_approved=True
	).order_by('-created_at')
	
	return render(request, 'episode_detail.html', {
		'episode': episode,
		'story': story,
		'previous_episode': previous_episode,
		'next_episode': next_episode,
		'comments': comments,
		'lang': lang,
	})

def book_teaser(request):
	book = Story.objects.order_by('-release_date').first()
	return render(request, 'book_teaser.html', {'book': book})

def toggle_language(request):
	current = request.session.get('lang', 'dv')
	request.session['lang'] = 'en' if current == 'dv' else 'dv'
	return redirect(request.META.get('HTTP_REFERER', '/'))

def story_list(request):
    category_filter = request.GET.get('category')
    if category_filter:
        stories = Story.objects.filter(category__id=category_filter).order_by('-release_date')
    else:
        stories = Story.objects.order_by('-release_date')
    
    categories = Category.objects.filter(is_active=True).order_by('name')
    lang = request.session.get('lang', 'dv')
    
    return render(request, 'story_list.html', {
        'stories': stories,
        'categories': categories,
        'selected_category': int(category_filter) if category_filter else None,
        'lang': lang,
    })

def story_detail(request, pk):
    story = get_object_or_404(Story, pk=pk)
    episodes = story.episodes.order_by('episode_number')
    lang = request.session.get('lang', 'dv')
    
    # Get comments for this story
    story_ct = ContentType.objects.get_for_model(Story)
    comments = Comment.objects.filter(
        content_type=story_ct, 
        object_id=story.id, 
        is_approved=True
    ).order_by('-created_at')
    
    return render(request, 'story_detail.html', {
        'story': story,
        'episodes': episodes,
        'comments': comments,
        'lang': lang,
    })

@csrf_exempt
@require_POST
def add_comment(request):
    try:
        data = json.loads(request.body)
        content_type = data.get('content_type')
        object_id = data.get('object_id')
        username = data.get('username', '').strip()
        comment_text = data.get('comment', '').strip()
        email = data.get('email', '').strip()
        
        # Validation
        if not username or len(username) < 2:
            return JsonResponse({'success': False, 'error': 'Username must be at least 2 characters'})
        
        if not comment_text or len(comment_text) < 5:
            return JsonResponse({'success': False, 'error': 'Comment must be at least 5 characters'})
            
        if not content_type or not object_id:
            return JsonResponse({'success': False, 'error': 'Invalid content reference'})
        
        # Get the content type
        if content_type == 'story':
            ct = ContentType.objects.get_for_model(Story)
            content_obj = get_object_or_404(Story, pk=object_id)
        elif content_type == 'episode':
            ct = ContentType.objects.get_for_model(Episode)
            content_obj = get_object_or_404(Episode, pk=object_id)
        elif content_type == 'shortstory':
            ct = ContentType.objects.get_for_model(ShortStory)
            content_obj = get_object_or_404(ShortStory, pk=object_id)
        else:
            return JsonResponse({'success': False, 'error': 'Invalid content type'})
        
        # Create comment
        comment = Comment.objects.create(
            content_type=ct,
            object_id=object_id,
            username=username,
            comment=comment_text,
            email=email,
            ip_address=get_client_ip(request),
            is_approved=True  # Auto-approve for now
        )
        
        return JsonResponse({
            'success': True, 
            'comment_id': comment.id,
            'message': 'Comment added successfully!'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
@require_POST
def add_reaction(request):
    try:
        data = json.loads(request.body)
        content_type = data.get('content_type')
        object_id = data.get('object_id')
        reaction_type = data.get('reaction_type', 'heart')
        username = data.get('username', '').strip()
        
        if not content_type or not object_id:
            return JsonResponse({'success': False, 'error': 'Invalid content reference'})
        
        # Get the content type
        if content_type == 'story':
            ct = ContentType.objects.get_for_model(Story)
            content_obj = get_object_or_404(Story, pk=object_id)
        elif content_type == 'episode':
            ct = ContentType.objects.get_for_model(Episode)
            content_obj = get_object_or_404(Episode, pk=object_id)
        elif content_type == 'shortstory':
            ct = ContentType.objects.get_for_model(ShortStory)
            content_obj = get_object_or_404(ShortStory, pk=object_id)
        elif content_type == 'comment':
            ct = ContentType.objects.get_for_model(Comment)
            content_obj = get_object_or_404(Comment, pk=object_id)
        else:
            return JsonResponse({'success': False, 'error': 'Invalid content type'})
        
        client_ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check if already reacted
        existing_reaction = Reaction.objects.filter(
            content_type=ct,
            object_id=object_id,
            ip_address=client_ip,
            reaction_type=reaction_type
        ).first()
        
        if existing_reaction:
            # Remove reaction (toggle)
            existing_reaction.delete()
            return JsonResponse({
                'success': True, 
                'action': 'removed',
                'total_reactions': content_obj.total_reactions
            })
        else:
            # Add new reaction
            reaction = Reaction.objects.create(
                content_type=ct,
                object_id=object_id,
                reaction_type=reaction_type,
                username=username,
                ip_address=client_ip,
                user_agent=user_agent
            )
            
            return JsonResponse({
                'success': True, 
                'action': 'added',
                'reaction_id': reaction.id,
                'total_reactions': content_obj.total_reactions
            })
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def short_story_list(request):
    category_filter = request.GET.get('category')
    if category_filter:
        short_stories = ShortStory.objects.filter(
            category__id=category_filter, 
            is_published=True
        ).order_by('-published_date')
    else:
        short_stories = ShortStory.objects.filter(is_published=True).order_by('-published_date')
    
    categories = Category.objects.filter(is_active=True).order_by('name')
    lang = request.session.get('lang', 'dv')
    
    return render(request, 'short_story_list.html', {
        'short_stories': short_stories,
        'categories': categories,
        'selected_category': int(category_filter) if category_filter else None,
        'lang': lang,
    })

def short_story_detail(request, pk):
    short_story = get_object_or_404(ShortStory, pk=pk, is_published=True)
    lang = request.session.get('lang', 'dv')
    
    # Get comments for this short story
    shortstory_ct = ContentType.objects.get_for_model(ShortStory)
    comments = Comment.objects.filter(
        content_type=shortstory_ct, 
        object_id=short_story.id, 
        is_approved=True
    ).order_by('-created_at')
    
    return render(request, 'short_story_detail.html', {
        'short_story': short_story,
        'comments': comments,
        'lang': lang,
    })

