import logging
import urllib.request
import urllib.parse
import json

from django.conf import settings

logger = logging.getLogger(__name__)


def send_channel_message(text):
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    channel = getattr(settings, 'TELEGRAM_CHANNEL_ID', '')

    if not token or not channel:
        logger.warning("Telegram bot token or channel not configured — skipping notification.")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": channel,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False,
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status != 200:
                logger.error("Telegram API returned %s", resp.status)
    except Exception as exc:
        logger.error("Failed to send Telegram notification: %s", exc)


def notify_new_episode(episode):
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    story_name = episode.story.title_en or episode.story.title_dv if episode.story else ''
    story_line = f"\n📖 Story: {story_name}" if story_name else ''
    link = f"{site_url}/episodes/{episode.pk}/"

    text = (
        f"✨ <b>New Episode!</b>{story_line}\n"
        f"Episode {episode.episode_number}: {episode.title_en}\n"
        f"{episode.title_dv}\n\n"
        f"<a href='{link}'>Read now →</a>"
    )
    send_channel_message(text)


def notify_new_story(story):
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    link = f"{site_url}/stories/{story.pk}/"
    title_en = story.title_en or story.title
    title_dv = story.title_dv

    text = (
        f"📚 <b>New Story!</b>\n"
        f"{title_en}\n"
        f"{title_dv}\n\n"
        f"<a href='{link}'>Read now →</a>"
    )
    send_channel_message(text)


def notify_new_short_story(short_story):
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    link = f"{site_url}/short-stories/{short_story.pk}/"

    text = (
        f"🌸 <b>New Short Story!</b>\n"
        f"{short_story.title_en}\n"
        f"{short_story.title_dv}\n\n"
        f"<a href='{link}'>Read now →</a>"
    )
    send_channel_message(text)
