---
title: "La protection des données personnelles à l'ère de l'intelligence artificielle au Québec"
slug: protection-donnees-personnelles-ia
date: "2025-12-22"
category: analyse
excerpt: "Les données personnelles sont le carburant de l'IA. Leur protection est un enjeu central de gouvernance au Québec. Analyse des défis posés par l'IA en matière de vie privée et des mécanismes de protection disponibles."
cover: /images/articles/protection-donnees-ia.jpg
author: florian-brobst
featured: false
tags: "données personnelles, vie privée, protection, anonymisation, consentement, surveillance"
---

## Les données : carburant de l'IA, enjeu de société

L'intelligence artificielle se nourrit de données. Les modèles d'apprentissage automatique exigent des volumes considérables de données pour être entraînés, validés et déployés. Or, une proportion significative de ces données concerne directement ou indirectement des personnes physiques : historiques de transactions, dossiers médicaux, comportements en ligne, données de géolocalisation, interactions sur les réseaux sociaux. La protection des données personnelles se trouve donc au cœur des enjeux de gouvernance de l'IA au Québec.

## Le cadre québécois de protection des données face à l'IA

Le Québec dispose d'un cadre de protection des données personnelles parmi les plus robustes au Canada. La Loi sur la protection des renseignements personnels dans le secteur privé et la Loi sur l'accès aux documents des organismes publics, toutes deux significativement renforcées par la Loi 25, établissent des obligations claires pour les organisations qui collectent, utilisent et communiquent des renseignements personnels.

Ce cadre repose sur des principes fondamentaux qui s'appliquent directement aux systèmes d'IA : la nécessité de la collecte (ne collecter que ce qui est nécessaire aux fins déterminées), la limitation des finalités (ne pas utiliser les données pour des fins non prévues au moment de la collecte), le consentement éclairé, la sécurité des données, le droit d'accès et de rectification, et la transparence.

La Commission d'accès à l'information (CAI) est l'organisme de surveillance chargé de veiller au respect de ces lois. Son rôle est crucial dans le contexte de l'IA, car elle dispose du pouvoir d'enquêter, de formuler des recommandations et, depuis la Loi 25, d'imposer des sanctions administratives pécuniaires significatives.

## Les défis spécifiques posés par l'IA

L'intelligence artificielle met à l'épreuve les principes traditionnels de protection des données de plusieurs manières.

Le volume et la diversité des données requises par les systèmes d'IA entrent en tension avec le principe de minimisation. Un modèle d'apprentissage profond peut nécessiter des millions d'exemples pour atteindre une performance satisfaisante. La tentation de collecter le maximum de données « au cas où » est forte, mais elle contrevient à l'esprit du cadre juridique qui exige que la collecte soit proportionnée aux finalités.

La réutilisation des données pose un défi majeur au principe de limitation des finalités. Les jeux de données utilisés pour entraîner un modèle d'IA peuvent servir à des applications très différentes de celles pour lesquelles les données ont été initialement collectées. Un jeu de données assemblé pour améliorer un service de recommandation pourrait être utilisé pour développer un outil de profilage ou de surveillance. Cette polyvalence des données dans le contexte de l'IA rend d'autant plus important le respect scrupuleux des engagements pris envers les personnes concernées.

L'inférence constitue un enjeu émergent. Les systèmes d'IA peuvent déduire des informations sensibles à partir de données apparemment anodines. À partir de données de navigation, un algorithme peut inférer des opinions politiques, des problèmes de santé ou une orientation sexuelle. Ces données inférées ne font pas toujours l'objet d'une protection explicite dans le cadre juridique, mais elles soulèvent des préoccupations majeures en matière de vie privée.

Les risques de réidentification compromettent l'efficacité de la dépersonnalisation. La Loi 25 facilite l'utilisation de renseignements dépersonnalisés à des fins de recherche et de statistiques. Cependant, la recherche a démontré que la combinaison de multiples sources de données peut permettre de réidentifier des individus dans des jeux de données supposément anonymisés. Ce risque est amplifié par la puissance des techniques d'IA elles-mêmes, qui peuvent être utilisées pour croiser des sources et retrouver l'identité des personnes.

## La vie privée dès la conception : un impératif pour l'IA

L'approche de protection de la vie privée dès la conception (Privacy by Design) prend une importance capitale dans le contexte de l'IA. Développée par Ann Cavoukian, ancienne commissaire à l'information et à la protection de la vie privée de l'Ontario, cette approche préconise l'intégration de la protection de la vie privée dans la conception même des systèmes, plutôt que comme un ajout a posteriori.

Appliquée aux systèmes d'IA, cette approche se traduit par plusieurs pratiques concrètes. La minimisation des données dès la phase de conception du modèle, en explorant des techniques qui permettent d'atteindre les objectifs visés avec moins de données personnelles. L'utilisation de techniques de protection avancées comme la confidentialité différentielle, l'apprentissage fédéré ou le chiffrement homomorphe. L'intégration de mécanismes de contrôle d'accès granulaires et de journalisation des utilisations de données. La conception de processus de suppression effective des données lorsqu'elles ne sont plus nécessaires.

## L'apprentissage fédéré : une piste prometteuse

L'apprentissage fédéré représente une approche particulièrement intéressante pour concilier les besoins en données de l'IA et la protection de la vie privée. Cette technique permet d'entraîner un modèle d'IA de manière distribuée, sans centraliser les données. Chaque participant entraîne le modèle localement sur ses propres données et ne partage que les paramètres mis à jour du modèle, pas les données elles-mêmes.

Pour le Québec, cette approche présente un intérêt particulier dans le domaine de la santé, où les données sont à la fois extrêmement sensibles et extrêmement précieuses pour le développement de l'IA. L'apprentissage fédéré pourrait permettre de développer des modèles d'IA performants à partir des données de différents établissements de santé québécois, sans que ces données ne quittent les murs de chaque institution.

## La surveillance et l'application

L'efficacité du cadre de protection des données dépend en grande partie de la capacité de l'organisme de surveillance — la CAI — à exercer ses fonctions de manière effective. La Loi 25 a renforcé les pouvoirs de la CAI, mais celle-ci doit disposer des ressources humaines et techniques nécessaires pour comprendre et évaluer les systèmes d'IA, mener des enquêtes sur des pratiques complexes de traitement de données et accompagner les organisations dans leur démarche de conformité.

Le développement de compétences techniques au sein de la CAI est un enjeu stratégique. L'évaluation de la conformité d'un système d'IA exige des connaissances spécialisées en apprentissage automatique, en science des données et en sécurité informatique. La CAI doit pouvoir compter sur des équipes capables de comprendre les aspects techniques des systèmes qu'elle est chargée de surveiller.

## Les droits des personnes à l'ère de l'IA

Le cadre québécois reconnaît des droits importants aux personnes dont les données sont traitées. Le droit d'accès permet à une personne de connaître les renseignements personnels qu'une organisation détient à son sujet. Le droit de rectification permet de corriger des informations inexactes. Le droit à la portabilité, introduit par la Loi 25, permet à une personne d'obtenir ses renseignements dans un format technologique structuré et couramment utilisé.

Dans le contexte de l'IA, l'exercice effectif de ces droits soulève des défis pratiques. Comment une personne peut-elle savoir si ses données ont été utilisées pour entraîner un modèle d'IA ? Comment peut-elle demander la rectification ou la suppression de ses données dans un modèle déjà entraîné ? Ces questions, à la frontière du droit et de la technique, exigent des réponses innovantes que le cadre juridique devra continuer à développer.

## Recommandations pour les organisations

Les organisations québécoises qui développent ou utilisent des systèmes d'IA devraient adopter une approche proactive en matière de protection des données. Cela implique de cartographier systématiquement les flux de données personnelles dans leurs systèmes d'IA, de réaliser des EFVP rigoureuses pour tous les projets d'IA, d'investir dans les techniques de protection de la vie privée avancées, de former les équipes de développement aux enjeux de protection des données, de mettre en place des mécanismes de gouvernance interne robustes et de documenter toutes les décisions relatives au traitement des données personnelles.

## Conclusion

La protection des données personnelles à l'ère de l'IA est un enjeu fondamental pour le Québec. Le cadre juridique actuel, renforcé par la Loi 25, fournit des outils solides, mais les organisations doivent aller au-delà de la conformité minimale pour gagner et maintenir la confiance des citoyens. Les solutions existent — techniques de protection avancées, approches de conception responsable, mécanismes de gouvernance interne — et les organisations qui les adoptent se positionnent non seulement comme conformes, mais comme des leaders de l'IA responsable.
