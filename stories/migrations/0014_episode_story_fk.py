from django.db import migrations, models
import django.db.models.deletion


def copy_m2m_to_fk(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    Episode = apps.get_model('stories', 'Episode')
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SELECT story_id, episode_id FROM stories_story_episodes")
        rows = cursor.fetchall()
    for story_id, episode_id in rows:
        Episode.objects.using(db_alias).filter(pk=episode_id).update(story_id=story_id)


class Migration(migrations.Migration):

    dependencies = [
        ('stories', '0013_remove_character_model'),
    ]

    operations = [
        migrations.AddField(
            model_name='episode',
            name='story',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='episodes',
                to='stories.story',
            ),
        ),
        migrations.RunPython(copy_m2m_to_fk, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='story',
            name='episodes',
        ),
    ]
