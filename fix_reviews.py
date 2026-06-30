import re

path = 'app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Change is_approved to false
c = c.replace('is_approved: true', 'is_approved: false')

# Remove eager loading
c = re.sub(
    r'const freshReview = \{.*?date: ".*?l\'instant"\n\s*\};\s*setReviews\(prev => \[freshReview, \.\.\.prev\]\);',
    '',
    c,
    flags=re.DOTALL
)

# Change success message
c = c.replace(
    'Merci ! Votre avis a bien \u01F8t\u01F8 enregistr\u01F8.',
    "Merci ! Votre avis a été soumis et est en attente de validation par l'administrateur."
)
c = c.replace(
    'Merci ! Votre avis a bien été enregistré.',
    "Merci ! Votre avis a été soumis et est en attente de validation par l'administrateur."
)

# And fallback for corrupted characters (if any) in the success message
c = re.sub(
    r'Merci ! Votre avis a bien.*?enregistr.*?\.',
    r"Merci ! Votre avis a été soumis et est en attente de validation par l'administrateur.",
    c
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
