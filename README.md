# Formicaio Macte

Tale microservice e' strutturato al fine di presentate l'opera d'arte conversazionale dell'agent Formicaio sul sito di Macte. 

## GPT Agent

L'agent e' stato progettato usando l'API di LangChain e OpenAI per fornire la migliore esperienza che la nostra opera d'arte mostrera al pubblico. Usando l'architettura RAG (Retriaval Augmented Generation) 

## Infrastruttura

Heroku e' il server utilizzato per rendere live l'applicazione. Inoltre, i documenti usati per l'esecuzione del modello sono immagazinati all'interno di un server di un GDrive. Uno script per la connessione a GCloud e' stato creato per permettere il recupero dei documenti come input del modello. In questo modo, l'Agent di AI raggiunge il risultato sperato.

## Test Locale

Per testare localmente l'applicazione e' necessario installare le librerie che permettono al codice di funzionare. La repository utilizza Poetry per gestire al meglio le nuove dipendenze senza evitare conflitti secondo il seguente processo.

- Installare poetry assicurando che sia locato sulla macchina con successo controllandone la versione del programma.
- Installare le librerie sull'ambiente viruale che permettono al microservice di lanciare il programma.
- Lanciare il codice assicurandosi che le porte dentro lo script code_base.py (linea 64) e live_agent.js (linea 349) siano allineati.
- Aprire il file formicaio_webpage.html per testare in locale l'applicazione.

.\ usando UNIX su MacOs/Linux
```bash
curl -sSL https://install.python-poetry.org | python3 -
poetry --version
export PATH="$HOME/.local/bin:$PATH"
poetry install
poetry shell
poetry run python code_base.py
```

.\ usando PowerShell su Windows
```bash
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
poetry --version
poetry install
poetry shell
poetry run python code_base.py
```


