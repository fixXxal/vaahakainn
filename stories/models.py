
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.validators import MinLengthValidator
from cloudinary.models import CloudinaryField

class Category(models.Model):
	name = models.CharField(max_length=100)
	description = models.TextField(blank=True)
	color = models.CharField(max_length=7, default='#c287a3', help_text='Hex color code for category display')
	icon = models.CharField(max_length=50, blank=True, help_text='Icon class or emoji for category')
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name_plural = "Categories"
		ordering = ['name']

	def __str__(self):
		return self.name

class Author(models.Model):
	name = models.CharField(max_length=100)
	bio = models.TextField(blank=True)
	profile_image = CloudinaryField('image', blank=True, null=True)
	website = models.URLField(blank=True)

	def __str__(self):
		return self.name

class Genre(models.Model):
	name = models.CharField(max_length=50)
	description = models.TextField(blank=True)
	icon = models.CharField(max_length=50, blank=True, help_text='Icon class or emoji for genre')

	def __str__(self):
		return self.name

class Episode(models.Model):
	episode_number = models.PositiveIntegerField()
	title_dv = models.CharField(max_length=200)
	title_en = models.CharField(max_length=200)
	content_dv = models.TextField()
	content_en = models.TextField()
	published_date = models.DateField()
	author = models.ForeignKey(Author, on_delete=models.CASCADE)
	genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)

	def __str__(self):
		return f"Episode {self.episode_number}: {self.title_en}"

	@property
	def total_comments(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Comment.objects.filter(content_type=ct, object_id=self.id, is_approved=True).count()

	@property
	def total_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id).count()

	@property
	def heart_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id, reaction_type='heart').count()

class Story(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField()
	cover_image = CloudinaryField('image', blank=True, null=True)
	release_date = models.DateField()
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')
	episodes = models.ManyToManyField(Episode, related_name='stories')
	is_featured = models.BooleanField(default=False, help_text='Feature this story on homepage')

	def __str__(self):
		return self.title

	@property
	def total_comments(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Comment.objects.filter(content_type=ct, object_id=self.id, is_approved=True).count()

	@property
	def total_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id).count()

	@property
	def heart_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id, reaction_type='heart').count()

class Comment(models.Model):
	# Generic relation to allow comments on both stories and episodes
	content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
	object_id = models.PositiveIntegerField()
	content_object = GenericForeignKey('content_type', 'object_id')
	
	# Comment details
	username = models.CharField(max_length=50, validators=[MinLengthValidator(2)], help_text='Reader name (2-50 characters)')
	comment = models.TextField(validators=[MinLengthValidator(5)], help_text='Comment content (minimum 5 characters)')
	email = models.EmailField(blank=True, help_text='Optional email for notifications')
	
	# Status and moderation
	is_approved = models.BooleanField(default=True, help_text='Approve/moderate comments')
	is_featured = models.BooleanField(default=False, help_text='Feature exceptional comments')
	
	# Timestamps
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	
	# IP tracking for moderation
	ip_address = models.GenericIPAddressField(blank=True, null=True)

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['content_type', 'object_id']),
			models.Index(fields=['created_at']),
		]

	def __str__(self):
		return f'Comment by {self.username} on {self.content_object}'

	@property
	def total_reactions(self):
		return self.reactions.count()

	@property
	def heart_reactions(self):
		return self.reactions.filter(reaction_type='heart').count()

class Reaction(models.Model):
	REACTION_CHOICES = [
		('heart', '❤️ Heart'),
		('like', '👍 Like'), 
		('love', '😍 Love'),
		('laugh', '😂 Laugh'),
		('wow', '😮 Wow'),
	]
	
	# Generic relation to allow reactions on stories, episodes, and comments
	content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
	object_id = models.PositiveIntegerField()
	content_object = GenericForeignKey('content_type', 'object_id')
	
	# Reaction details
	reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES, default='heart')
	username = models.CharField(max_length=50, blank=True, help_text='Optional username for reaction')
	
	# Tracking
	ip_address = models.GenericIPAddressField(help_text='IP address for duplicate prevention')
	user_agent = models.TextField(blank=True, help_text='Browser info for duplicate prevention')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		# Prevent duplicate reactions from same IP for same content
		unique_together = [['content_type', 'object_id', 'ip_address', 'reaction_type']]
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['content_type', 'object_id']),
			models.Index(fields=['reaction_type']),
		]

	def __str__(self):
		username_part = f' by {self.username}' if self.username else ''
		return f'{self.get_reaction_type_display()}{username_part} on {self.content_object}'

class Character(models.Model):
	name = models.CharField(max_length=100, help_text='Character name')
	description = models.TextField(blank=True, help_text='Character description and background')
	image = CloudinaryField('image', blank=True, null=True, help_text='Character image')
	story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='characters', help_text='Story this character belongs to')
	is_main_character = models.BooleanField(default=False, help_text='Is this a main character?')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-is_main_character', 'name']
		unique_together = [['story', 'name']]

	def __str__(self):
		return f"{self.name} ({self.story.title})"

class ShortStory(models.Model):
	title_dv = models.CharField(max_length=200, help_text='Title in Dhivehi')
	title_en = models.CharField(max_length=200, help_text='Title in English')
	author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='short_stories')
	genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='short_stories')
	content_dv = models.TextField(help_text='Story content in Dhivehi')
	content_en = models.TextField(help_text='Story content in English')
	cover_image = CloudinaryField('image', blank=True, null=True)
	published_date = models.DateField()
	is_featured = models.BooleanField(default=False, help_text='Feature this story on homepage')
	is_published = models.BooleanField(default=True, help_text='Published status')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Short Story"
		verbose_name_plural = "Short Stories"
		ordering = ['-published_date', '-created_at']
		indexes = [
			models.Index(fields=['published_date']),
			models.Index(fields=['is_published', 'is_featured']),
		]

	def __str__(self):
		return f"{self.title_en} by {self.author.name}"

	@property
	def total_comments(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Comment.objects.filter(content_type=ct, object_id=self.id, is_approved=True).count()

	@property
	def total_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id).count()

	@property
	def heart_reactions(self):
		from django.contrib.contenttypes.models import ContentType
		ct = ContentType.objects.get_for_model(self)
		return Reaction.objects.filter(content_type=ct, object_id=self.id, reaction_type='heart').count()
