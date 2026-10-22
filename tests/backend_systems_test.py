import json
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend import main


class SystemsHouse(unittest.TestCase):
    def test_twenty_recommendations_work_without_provider(self):
        data = json.loads(Path('src/data/systems.json').read_text(encoding='utf-8'))
        with TestClient(main.app) as client, patch.object(main, 'API_KEY', ''), patch.object(main, 'GEMINI_API_KEY', ''):
            for mode, questions in data['questions'].items():
                for question in questions:
                    response = client.post('/api/ask', json={'question':question, 'companyId':'systems', 'facilityId':'radar', 'residentId':'launch', 'audience':mode})
                    self.assertEqual(response.status_code,200,response.text)
                    self.assertFalse(response.json()['insufficient'])
                    self.assertEqual(response.json()['mode'],'demo')
                    self.assertTrue(response.json()['sources'])

    def test_old_space_scope_is_rejected(self):
        with TestClient(main.app) as client:
            response=client.post('/api/ask',json={'question':'설명해줘','companyId':'aerospace','facilityId':'launch','residentId':'launch','audience':'고객'})
            self.assertEqual(response.status_code,422)
