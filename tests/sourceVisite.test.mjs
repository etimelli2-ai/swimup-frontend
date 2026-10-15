// Origine des visites (?src=) : valeurs propres seulement, mails de prospection balisés.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sourceDepuisRecherche } from '../src/lib/mesure.mjs'

test('src : valeurs propres gardées, le reste ignoré', () => {
  assert.equal(sourceDepuisRecherche('?src=mail'), 'mail')
  assert.equal(sourceDepuisRecherche('?src=Metier-Restaurant'), 'metier-restaurant')
  assert.equal(sourceDepuisRecherche(''), null)
  assert.equal(sourceDepuisRecherche('?a=1'), null)
  assert.equal(sourceDepuisRecherche('?src=<script>alert(1)</script>'), null)
  assert.equal(sourceDepuisRecherche('?src=a b'), null)
  assert.equal(sourceDepuisRecherche('?src=' + 'x'.repeat(100)).length, 40)
})

test('mail de prospection : les deux liens portent ?src=mail', () => {
  const f = readFileSync(new URL('../src/pages/admin/AdminProspection.jsx', import.meta.url), 'utf8')
  assert.ok(f.includes('diagnostic-fiche-google?src=mail'))
  assert.ok(f.includes('swimup.net/offres?src=mail'))
})
