from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('stories/', views.story_list, name='story_list'),
    path('stories/<int:pk>/', views.story_detail, name='story_detail'),
    path('short-stories/', views.short_story_list, name='short_story_list'),
    path('short-stories/<int:pk>/', views.short_story_detail, name='short_story_detail'),
    path('episodes/', views.episode_list, name='episode_list'),
    path('episodes/<int:pk>/', views.episode_detail, name='episode_detail'),
    path('toggle-language/', views.toggle_language, name='toggle_language'),
    # Comment and Reaction APIs
    path('api/comments/add/', views.add_comment, name='add_comment'),
    path('api/reactions/add/', views.add_reaction, name='add_reaction'),
]
