# vlemeur/onomatron-rnn

## Resumen

Onomatron-rnn es un modelo de lenguaje a nivel de carácter (character-level LM) entrenado desde cero para generar nombres ficticios de personajes de la literatura francesa. Lo desarrolla Vincent Le Meur (usuario `vlemeur` en Hugging Face) como parte del proyecto onomatron, una comparativa de 11 arquitecturas inspirada en el repositorio makemore de Andrej Karpathy. El modelo es una RNN simple (`RNNName`) de tan solo 7.657 parámetros y 0,03 MB de tamaño, lo que lo convierte en un artefacto didáctico y experimental más que en una herramienta de producción.

El problema que resuelve es muy acotado: dado un vocabulario de 38 caracteres más un token centinela, aprende las estadísticas de transición de caracteres de un corpus de nombres literarios franceses y muestrea secuencias nuevas que imitan ese estilo. No modela semántica ni gramática, y su ámbito de uso declarado se limita a la generación de nombres ficticios.

Su relevancia actual es fundamentalmente pedagógica y de investigación metodológica: sirve como referencia de bajo coste dentro de un benchmark reproducible (con protocolo de split por nombre, tuning con Optuna y tracking con MLflow) y como ejemplo de que una RNN de 7.657 parámetros puede superar en NLL de validación a arquitecturas mucho más grandes como transformer, mamba o rwkv en una tarea de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN simple (`RNNName`), character-level |
| Parámetros totales | 7.657 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo a nivel de carácter; sin ventana declarada) |
| Tipos de cuantización | no disponible (pesos de 0,03 MB, cuantización innecesaria) |
| Idiomas soportados | francés (`fr`) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `model.pt` (state_dict de PyTorch) + `config.json` |

Parámetros de entrenamiento (mejor trial de Optuna): `batch_size` = 256, `clip_grad` = None, `emb_dim` = 22, `h_dim` = 57, `lr` = 0,0003511356313970409, `weight_decay` = 0,001.

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente vanilla implementada en PyTorch. La arquitectura combina una capa de embedding de dimensión 22 con un estado oculto de dimensión 57; el vocabulario consta de 38 caracteres más el centinela `.` que marca inicio y fin de secuencia. El bundle distribuido incluye `config.json` (nombre, clase, hiperparámetros, semilla, vocabulario y métricas) y `model.pt` (state_dict), junto con una copia vendorizada del paquete `onomatron` y un CLI `generate.py`.

El entrenamiento se realizó en dos fases: primero un estudio de hiperparámetros con Optuna (sampler TPE, poda ASHA, objetivo NLL de validación, estudios persistentes en SQLite) con cada trial registrado en MLflow; después un reentrenamiento final de 10.000 pasos con los mejores parámetros, optimizador AdamW, semilla 42, dispositivo `mps` y early stopping con paciencia 20. El corpus de entrenamiento es `Jig09/onomatron-names`, un nombre saneado por línea, con split por nombre (nunca por n-gram, para evitar fuga entre n-gramas correlacionados del mismo nombre) en 80/10/10 y test tocado una única vez. El entrenamiento completo tardó 54,7 s con un pico de 395 MB de memoria en `mps`.

## Capacidades

- Generación de texto a nivel de carácter: muestrea secuencias de caracteres que imitan nombres de personajes de la literatura francesa.
- Modelado de estadísticas de transición de caracteres con vocabulario francés (incluye acentos; el resto de caracteres se descarta en la normalización).
- Muestreo controlable por semilla (`seed`) y número de muestras (`n`), con API Python (`load_bundle_from_hub`) y CLI (`generate.py`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Multilingüe: no; exclusivamente francés.

## Casos de uso

- Generación de nombres ficticios para narrativa o juegos de rol: el modelo produce listas de nombres con sabor literario francés (por ejemplo, `caloylo`, `féliansaï`, `gallien`) que pueden usarse como semilla creativa para personajes.
- Docencia y aprendizaje de fundamentos de LM: con 7.657 parámetros y 54,7 s de entrenamiento, es un ejemplo autocontenido para explicar embeddings, recurrencia, muestreo y evaluación por NLL en un aula o tutorial.
- Referencia de benchmark para arquitecturas: al estar acompañado del benchmark completo de 11 arquitecturas (mlp, wavenet, ngram, rwkv, gru, lstm, linear, transformer, mamba), sirve como baseline reproducible en experimentos comparativos de modelos de lenguaje a pequeña escala.
- Pruebas de infraestructura de MLOps: el flujo con Optuna, MLflow y splits persistentes permite validar pipelines de tuning y tracking con un coste computacional mínimo.
- Generación de datasets sintéticos de nombres para pruebas de software: útil para poblar fixtures o bases de datos de demostración con nombres ficticios en francés.
- Prototipado de generación en dispositivos muy limitados: con 0,03 MB de pesos y 4.962 nombres/s en CPU, puede ejecutarse en entornos sin GPU y con restricciones extremas de memoria.

## Benchmarks y rendimiento

Resultados del benchmark onomatron (ordenado por NLL de validación; inferencia medida en CPU):

| Modelo | val_nll | test_nll | Parámetros | Tamaño (MB) | Wall (s) | Nombres/s |
|---|---|---|---|---|---|---|
| **rnn (este modelo)** | **2,3592** | **2,3491** | 7.657 | 0,03 | 54,7 | 4.962 |
| mlp | 2,3759 | 2,3679 | 39.291 | 0,16 | 12,8 | 7.688 |
| wavenet | 2,4002 | 2,3632 | 37.624 | 0,15 | 19,5 | 1.396 |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | nan | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la evaluación se limita a NLL de validación y test sobre el corpus de nombres.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo pesa 0,03 MB en `model.pt` y el entrenamiento alcanzó un pico de 395 MB en `mps`.
- GPU recomendadas: no requiere GPU; la inferencia se midió en CPU. Cualquier GPU (incluida una RTX 4090 o una A100) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en CPU de gama baja; también en entornos embebidos con pocos MB de memoria.
- Opciones de despliegue: carga directa con PyTorch mediante `load_bundle_from_hub` del paquete `onomatron` vendorizado, o el CLI `generate.py` incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4.962 nombres/s en CPU según el benchmark; tiempo de entrenamiento de 54,7 s en `mps`.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **onomatron-rnn** | 7.657 | 0,03 MB | 2,3592 | 2,3491 | MIT | Hugging Face (`vlemeur/onomatron-rnn`) |
| onomatron-gru | 8.012 | 0,03 MB | 2,5292 | 2,4013 | no disponible | benchmark onomatron |
| onomatron-lstm | 10.062 | 0,04 MB | 2,5381 | 2,3703 | no disponible | benchmark onomatron |
| onomatron-transformer | 805.158 | 3,22 MB | 3,1470 | 2,3757 | no disponible | benchmark onomatron |

La comparación relevante es interna al benchmark onomatron, ya que no existen modelos públicos equivalentes de generación de nombres literarios franceses a nivel de carácter con licencia y métricas comparables.

## Limitaciones y advertencias

- Corpus de entrenamiento pequeño (unos pocos miles de nombres) y modelo a nivel de carácter: puede reproducir literalmente nombres del conjunto de entrenamiento y generar nombres que coincidan con personas reales; son ficticios por construcción y deben tratarse como tales.
- Sesgo hacia la literatura francesa; los acentos se conservan, pero el resto de caracteres se descarta en la normalización.
- No modela semántica ni gramática más allá de estadísticas de caracteres; no debe usarse para nombrar personas reales ni para tomar decisiones sobre individuos.
- Los nombres extraídos del dataset de resolución de alias de ObTIC (`compnet-renard/7-romans-alias-resolution`) no tienen licencia declarada; se pide citar a Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université).
- Los ficheros locales `data/external/*.txt` están en `.gitignore` y no declaran licencia; los nombres derivados son hechos, pero su selección no es del autor.
- La licencia MIT cubre código y pesos, pero los datos de entrenamiento se publican con `license: other` y atribución por fuente; conviene revisar la model card del dataset antes de un uso comercial.
- Riesgo de alucinación no aplica en el sentido habitual (no hay conocimiento factual), pero sí de generar secuencias sin sentido lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlemeur/onomatron-rnn
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Benchmark onomatron: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio del proyecto: https://github.com/vlemeur/onomatron
- Inspiración (makemore, Karpathy): https://github.com/karpathy/makemore
- Dataset de resolución de alias de ObTIC: `compnet-renard/7-romans-alias-resolution`
