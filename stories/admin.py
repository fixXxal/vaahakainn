from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.utils.html import format_html
from .models import Author, Genre, Episode, Story, Category, Comment, Reaction, ShortStory

# Inline classes for comments and reactions
class CommentInline(GenericTabularInline):
	model = Comment
	extra = 0
	fields = ('username', 'comment', 'is_approved', 'is_featured', 'created_at')
	readonly_fields = ('created_at', 'ip_address')
	ordering = ['-created_at']

class ReactionInline(GenericTabularInline):
	model = Reaction
	extra = 0
	fields = ('reaction_type', 'username', 'created_at')
	readonly_fields = ('created_at', 'ip_address', 'user_agent')
	ordering = ['-created_at']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ('name', 'is_active', 'color', 'created_at')
	list_filter = ('is_active', 'created_at')
	search_fields = ('name', 'description')
	fields = ('name', 'description', 'color', 'icon', 'is_active')
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
	list_display = ('name', 'website')
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
	list_display = ('name', 'icon')
	fields = ('name', 'description', 'icon')
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
	list_display = ('episode_number', 'title_dv', 'author', 'genre', 'published_date', 'total_comments', 'heart_reactions')
	list_filter = ('author', 'genre', 'published_date')
	search_fields = ('title_dv',)
	fields = ('episode_number', 'title_dv', 'content_dv', 'published_date', 'author', 'genre')
	inlines = [CommentInline, ReactionInline]
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
	list_display = ('title', 'category', 'release_date', 'total_comments', 'heart_reactions')
	list_filter = ('category', 'release_date')
	search_fields = ('title', 'description')
	fields = ('title', 'description', 'category', 'cover_image', 'release_date', 'episodes')
	inlines = [CommentInline, ReactionInline]
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
	list_display = ('username', 'content_object', 'comment_preview', 'is_approved', 'is_featured', 'created_at', 'total_reactions')
	list_filter = ('is_approved', 'is_featured', 'created_at', 'content_type')
	search_fields = ('username', 'comment', 'email')
	list_editable = ('is_approved', 'is_featured')
	readonly_fields = ('created_at', 'updated_at', 'ip_address', 'total_reactions', 'heart_reactions')
	fields = ('content_object', 'username', 'email', 'comment', 'is_approved', 'is_featured', 'ip_address', 'created_at', 'updated_at')
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}
	
	def comment_preview(self, obj):
		return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
	comment_preview.short_description = 'Comment Preview'
	
	def total_reactions(self, obj):
		return obj.total_reactions
	total_reactions.short_description = 'Reactions'

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
	list_display = ('reaction_display', 'content_object', 'username', 'created_at')
	list_filter = ('reaction_type', 'created_at', 'content_type')
	search_fields = ('username',)
	readonly_fields = ('created_at', 'ip_address', 'user_agent')
	fields = ('content_object', 'reaction_type', 'username', 'ip_address', 'created_at')
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}
	
	def reaction_display(self, obj):
		return format_html('<span style="font-size: 16px;">{}</span>', obj.get_reaction_type_display())
	reaction_display.short_description = 'Reaction'

@admin.register(ShortStory)
class ShortStoryAdmin(admin.ModelAdmin):
	list_display = ('title_en', 'title_dv', 'author', 'genre', 'category', 'published_date', 'is_featured', 'is_published', 'total_comments', 'heart_reactions')
	list_filter = ('author', 'genre', 'category', 'published_date', 'is_featured', 'is_published')
	search_fields = ('title_en', 'title_dv', 'content_en', 'content_dv', 'author__name')
	list_editable = ('is_featured', 'is_published')
	fields = (
		('title_en', 'title_dv'),
		'author',
		('genre', 'category'),
		('is_featured', 'is_published'),
		'published_date',
		'cover_image',
		'content_en',
		'content_dv',
	)
	inlines = [CommentInline, ReactionInline]
	date_hierarchy = 'published_date'
	
	class Media:
		css = {
			'all': ('admin/css/admin_rtl.css',)
		}
	
	def total_comments(self, obj):
		return obj.total_comments
	total_comments.short_description = 'Comments'
	
	def heart_reactions(self, obj):
		return obj.heart_reactions
	heart_reactions.short_description = '❤️ Hearts'
