import unittest
from unittest.mock import patch

from backend import main
from backend.core import EXPLANATION_FIELDS


class OceanAudience(unittest.IsolatedAsyncioTestCase):
    async def test_pado_audience_uses_ocean_sources(self):
        async def answer(data, resident):
            self.assertEqual(resident, 'lng')
            self.assertEqual(data['audience'], '일반대중')
            self.assertEqual(data['companyId'], 'ocean')
            self.assertEqual({source['facilityId'] for source in data['checkedParagraphs']}, {'lng', 'naval', 'offshore'})
            return {**{key: '공개 자료로 설명해요.' for key in EXPLANATION_FIELDS},
                    'sourceIds': [data['checkedParagraphs'][0]['id']],
                    'insufficient': False, 'comparison': []}

        request = main.AskRequest(question='한화오션은 어떤 회사야?', companyId='ocean',
                                  facilityId='lng', residentId='lng', audience='일반대중')
        with patch.object(main, 'GEMINI_API_KEY', 'test-key'), patch.object(main, 'gemini_answer', side_effect=answer):
            result = await main.ask(request)
        self.assertEqual(result['mode'], 'llm')

    def test_other_residents_cannot_use_audience(self):
        with self.assertRaises(ValueError):
            main.AskRequest(question='설명해줘', companyId='systems', facilityId='radar',
                            residentId='radar', audience='고객')


if __name__ == '__main__':
    unittest.main()
