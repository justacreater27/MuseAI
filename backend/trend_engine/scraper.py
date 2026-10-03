import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import scrapy
from scrapy.crawler import CrawlerProcess


logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = BASE_DIR / "data" / "trends.json"


class TrendSpider(scrapy.Spider):
    name = "museai_trends"

    start_urls = [
        "https://trends.google.com/trending/rss?geo=IN",
    ]

    custom_settings = {
        "LOG_ENABLED": False,
        "DOWNLOAD_TIMEOUT": 15,
        "ROBOTSTXT_OBEY": True,
        "USER_AGENT": "MuseAI-TrendResearch/1.0",
    }

    def parse(self, response):
        yield from self.parse_google_trends(response)

    def parse_google_trends(self, response):
        """
        Parse Google Trends RSS without relying on a hard-coded XML
        namespace prefix.
        """

        items = response.xpath("//*[local-name()='item']")

        for item in items:
            title = self.clean_text(
                item.xpath("./*[local-name()='title']/text()").get("")
            )

            traffic = self.clean_text(
                item.xpath(
                    "./*[local-name()='approx_traffic']/text()"
                ).get("")
            )

            published = self.clean_text(
                item.xpath("./*[local-name()='pubDate']/text()").get("")
            )

            link = self.clean_text(
                item.xpath("./*[local-name()='link']/text()").get("")
            )

            description = self.clean_text(
                item.xpath(
                    "./*[local-name()='description']/text()"
                ).get("")
            )

            if not title:
                continue

            yield {
                "source": "Google Trends",
                "topic": title,
                "traffic": traffic,
                "published": published,
                "url": link,
                "description": description,
                "region": "India",
                "language": self.detect_language(title),
                "content_format": "trend",
                "collected_at": datetime.now(timezone.utc).isoformat(),
            }

    @staticmethod
    def clean_text(value: str) -> str:
        value = value or ""
        value = re.sub(r"\s+", " ", value)
        return value.strip()

    @staticmethod
    def detect_language(text: str) -> str:
        """
        Lightweight script detection.
        This is intentionally simple for v1.
        """

        if not text:
            return "unknown"

        if re.search(r"[\u0B80-\u0BFF]", text):
            return "Tamil"

        if re.search(r"[\u0900-\u097F]", text):
            return "Hindi/Devanagari"

        if re.search(r"[\u0C00-\u0C7F]", text):
            return "Telugu"

        if re.search(r"[\u0C80-\u0CFF]", text):
            return "Kannada"

        if re.search(r"[\u0D00-\u0D7F]", text):
            return "Malayalam"

        if re.search(r"[\u0980-\u09FF]", text):
            return "Bengali"

        if re.search(r"[\u0A80-\u0AFF]", text):
            return "Gujarati"

        if re.search(r"[\u0A00-\u0A7F]", text):
            return "Punjabi"

        if re.search(r"[\u0600-\u06FF]", text):
            return "Urdu"

        if re.search(r"[A-Za-z]", text):
            return "English"

        return "unknown"


class TrendPipeline:
    """Collect and persist trend records."""

    def __init__(self):
        self.items: List[Dict[str, Any]] = []

    def process(self):
        self.items = []

        parent = self

        class CollectorSpider(TrendSpider):
            name = "museai_trend_collector"

            def parse_google_trends(self, response):
                for item in super().parse_google_trends(response):
                    parent.items.append(item)
                    yield item

        process = CrawlerProcess(
            settings={
                "LOG_ENABLED": False,
                "ROBOTSTXT_OBEY": True,
                "USER_AGENT": "MuseAI-TrendResearch/1.0",
                "DOWNLOAD_TIMEOUT": 15,
            }
        )

        process.crawl(CollectorSpider)
        process.start()

        self.save(self.items)

        return self.items

    @staticmethod
    def save(items: List[Dict[str, Any]]) -> None:
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

        with OUTPUT_FILE.open("w", encoding="utf-8") as file:
            json.dump(
                items,
                file,
                ensure_ascii=False,
                indent=2,
            )

        logger.info(
            "Saved %d trend records to %s",
            len(items),
            OUTPUT_FILE,
        )


def collect_trends() -> List[Dict[str, Any]]:
    """Public entry point for MuseAI."""
    return TrendPipeline().process()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("🕷️ MuseAI Trend Engine")
    print("Collecting permitted public trend data...")

    try:
        results = collect_trends()

        print(f"✅ Collected {len(results)} trend records.")
        print(f"📁 Saved to: {OUTPUT_FILE}")

        for trend in results[:10]:
            print(
                f"  • {trend.get('topic', '')} "
                f"| {trend.get('language', '')} "
                f"| {trend.get('traffic', '')}"
            )

    except Exception as exc:
        print(f"❌ Trend collection failed: {exc}")
