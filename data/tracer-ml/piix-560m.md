# Tracer-ML/PIIX-560m

## Resumen

PIIX-560m es un modelo de clasificación de tokens especializado en la detección y el enmascarado de información personal identificable (PII) y secretos en texto multilingüe. Lo desarrolla Tracer (tracerml.ai) y se distribuye con licencia Apache 2.0. Parte de XLM-RoBERTa-large, al que se ha aplicado un ajuste fino para etiquetado de entidades, y se combina con una capa de reglas para identificadores estructurados como números de tarjeta, IBAN o claves de API. El resultado es un pipeline de redacción completo, no solo un checkpoint de token-classification.

El modelo resuelve un problema concreto de cumplimiento y privacidad: anonimizar datos antes de almacenarlos, enviarlos a terceros o usarlos en entrenamiento. Frente a alternativas basadas en LLM o en modelos NER genéricos, PIIX-560m prioriza la cobertura (que ningún dato sensible quede visible) manteniendo una precisión razonable, con un parámetro `recall` que permite desplazar el equilibrio entre precisión y exhaustividad según el caso de uso.

Con 558,9 millones de parámetros y ventanas deslizantes de 512 tokens con solapamiento, admite documentos de cualquier longitud. Cubre 13 idiomas (inglés, ruso, alemán, francés, español, italiano, neerlandés, portugués, polaco, ucraniano, turco, kazajo y bielorruso) y 30 tipos de entidad agrupados en personas, organizaciones, contacto, identificadores, técnicos, secretos, fechas y atributos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de token classification y capa de reglas posterior |
| Parametros totales | 558.893.107 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas deslizantes de 512 tokens con solapamiento; documentos de cualquier longitud |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, de, fr, es, it, nl, pt, pl, uk, tr, kk, be |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es XLM-RoBERTa-large, un encoder transformer multilingüe de 24 capas y 558,9 millones de parámetros, sobre el que se ha realizado un ajuste fino para etiquetado de tokens (token classification) orientado a PII. Sobre la salida del clasificador se aplica una capa de reglas (`rules.py`) para identificadores estructurados —números de tarjeta, IBAN, claves de API— y un filtro de tipos (`type_filter.py`) que permite restringir las entidades detectadas. El pipeline completo reside en `piix.py`, que también gestiona el enmascarado por palabras completas y el procesamiento de documentos largos mediante ventanas solapadas de 512 tokens.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables habitualmente a un modelo de etiquetado). Sí se documenta un procedimiento de ajuste fino con adaptadores LoRA sobre unos cientos de documentos etiquetados manualmente, que mejora el F1 de forma notable: de 89,2 a 95,6 en Gretel PII masking tras 1.000 documentos etiquetados. La innovación principal no está en la arquitectura, sino en el diseño del pipeline: combinación de clasificador neuronal y reglas, control explícito del recall y evaluación centrada en caracteres enmascarados en lugar de en spans de entidad.

## Capacidades

- Detección de PII en 13 idiomas, incluyendo lenguas eslavas y turco, con cobertura de alfabetos cirílico y latino.
- Clasificación de 30 tipos de entidad agrupados en personas (nombre, apellido, persona, usuario), organizaciones, contacto (email, teléfono, dirección postal, ubicación), identificadores (cuenta, ID de empleado, documento nacional, pasaporte, número fiscal), técnicos (URL, IP, MAC, hostname), secretos (claves de API, tokens, contraseñas, claves privadas, credenciales en cadenas de conexión), fechas y atributos sensibles (edad, género, estado civil, nacionalidad, creencias, datos médicos, financieros y de RR. HH.).
- Enmascarado con offsets de caracteres: devuelve tanto los hallazgos tipados como la máscara fusionada que hay que ocultar.
- Control de sensibilidad mediante el parámetro `recall` (0 = precisión, 4 = equilibrado, 8 = máxima cobertura).
- Filtrado por tipos de entidad en lenguaje natural mediante el parámetro `types`.
- Ampliación de hallazgos a palabras completas (`widen`) para evitar fragmentos visibles.
- Procesamiento de documentos de cualquier longitud mediante ventanas solapadas de 512 tokens.
- Ajuste fino con adaptadores LoRA para adaptar la política de etiquetado a un dominio concreto.
- Uso por línea de comandos (`python piix.py --recall 4`) y como librería Python.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de etiquetado, no generativo.

## Casos de uso

- Redacción previa a almacenamiento de logs y trazas: el pipeline enmascara emails, teléfonos, IP y credenciales en mensajes de aplicación antes de persistirlos, reduciendo el riesgo de filtrar datos personales en sistemas de observabilidad.
- Anonimización de datasets para entrenamiento: PIIX-560m procesa corpus multilingües documento a documento con ventanas solapadas, de modo que se puede limpiar un dataset completo antes de usarlo para ajustar otros modelos.
- Cumplimiento RGPD en atención al cliente: los transcripts de conversaciones multi-turno se pasan por el redactor con `recall=4` para eliminar nombres, direcciones y números de cuenta antes de que el equipo de calidad los revise.
- Sanitización de tickets de soporte técnico: la capa de reglas detecta claves de API y credenciales en cadenas de conexión que suelen aparecer pegadas en los tickets, algo que un NER genérico no cubre.
- Enmascarado en pipelines de ingesta documental: integración como etapa previa a un sistema RAG o a un OCR posterior, con filtrado por tipos (`types=["phone number", "national ID"]`) para aplicar políticas distintas según el tipo de documento.
- Protección de datos en entornos sanitarios o financieros: los tipos `medical` y `financial` permiten tratar atributos sensibles de forma específica antes de compartir registros con terceros.
- Adaptación a políticas internas de etiquetado: con 50 a 200 documentos etiquetados manualmente y un adaptador LoRA se alcanza un F1 de 91-94 en los benchmarks del autor, suficiente para ajustar el modelo a la nomenclatura de una organización.
- Filtrado de secretos en repositorios y wikis internas: la detección de tokens, contraseñas y claves privadas permite bloquear o marcar contenido antes de publicarlo.

## Benchmarks y rendimiento

PII Arena v1.0.3 (40 datasets, 226.720 spans gold). Las filas marcadas con * son resultados publicados por el propio benchmark.

| Modelo | No oculto del todo ↓ | Perdidos ↓ | Precision | Recall | F1 |
|---|---|---|---|---|---|
| PIIX-560m (`recall=8`) | 3,45 % | 2,15 % | 54,3 | 97,5 | 69,7 |
| PII-Tracer + GLiNER2 + BardsAI + mmBERT (ensemble)* | 5,61 % | 1,44 % | 53,2 | 96,6 | 68,6 |
| PIIX-560m (por defecto) | 9,38 % | 6,56 % | 69,3 | 93,0 | 79,4 |
| Fastino GLiNER2* | 20,17 % | 13,22 % | 75,1 | 77,7 | 76,4 |
| Perplexity PII-Tracer* | 25,14 % | 21,00 % | 64,9 | 79,6 | 71,5 |
| OpenAI Privacy Filter* | 40,43 % | 34,72 % | no disponible | no disponible | no disponible |

PrivacyBench+ (1.877 registros de chat y documentos empresariales):

| Modelo | Precision | Recall | F1 |
|---|---|---|---|
| PIIX-560m | 96,5 | 97,2 | 96,9 |
| Fastino GLiNER2.5-base | 89,3 | 83,4 | 86,2 |
| Perplexity PII-Tracer | 86,1 | 72,9 | 79,0 |
| OpenAI Privacy Filter | 87,6 | 64,1 | 74,1 |

Benchmarks adicionales (F1, con el porcentaje de spans no ocultos del todo entre paréntesis):

| Modelo | Gretel PII masking (test) | ai4privacy 300k (inglés) | ai4privacy 300k (de, es, fr, it, nl) |
|---|---|---|---|
| Perplexity PII-Tracer | 95,4 (1,47 %) | 95,5 (0,39 %) | 95,0 (0,65 %) |
| Nym base | 93,9 (12,84 %) | 91,4 (13,52 %) | 91,2 (13,18 %) |
| PIIX-560m | 92,1 (1,19 %) | 85,7 (5,99 %) | 83,5 (6,53 %) |
| OpenAI Privacy Filter | 90,2 (16,16 %) | 91,1 (21,11 %) | 90,6 (21,00 %) |

Efecto del ajuste fino con LoRA (F1 en documentos reservados del mismo dataset):

| Documentos etiquetados | Gretel PII masking | ai4privacy 300k (inglés) | ai4privacy 300k (de, es, fr, it, nl) |
|---|---|---|---|
| 0 (modelo base) | 89,2 | 85,8 | 83,5 |
| 50 | 93,3 | 91,0 | 89,9 |
| 200 | 94,1 | 92,1 | 90,8 |
| 1.000 | 95,6 | 93,7 | 92,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, alrededor de 1,1 GB de pesos (558,9 M de parámetros), más overhead de activaciones y del pipeline; en la práctica, 2-3 GB son suficientes. El tamaño del repositorio (2,3 GB) incluye pesos y artefactos adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 4090 o una A100/H100 ofrecen margen de sobra y permiten procesar lotes grandes; para alto throughput en servidor, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (RTX 3060 en adelante, e incluso GPUs integradas con suficiente memoria compartida). El autor indica soporte para CUDA, Apple GPU (MPS) y CPU.
- Opciones de despliegue: el pipeline oficial es `piix.py` con `torch`, `transformers` y `safetensors`; también se puede cargar el checkpoint como pipeline estándar de `token-classification` en transformers, aunque en ese caso se pierde la capa de reglas y la cobertura baja. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (son herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 PII Arena | No oculto ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PIIX-560m | 558,9 M | ventanas de 512 tokens, documentos ilimitados | 79,4 (defecto) / 69,7 (`recall=8`) | 9,38 % / 3,45 % | Apache 2.0 | Hugging Face |
| Fastino GLiNER2 | no disponible | no disponible | 76,4 | 20,17 % | no disponible | Hugging Face |
| Perplexity PII-Tracer | no disponible | no disponible | 71,5 | 25,14 % | no disponible | no disponible |
| OpenAI Privacy Filter | no disponible | no disponible | no disponible | 40,43 % | no disponible | no disponible |

En PrivacyBench+, PIIX-560m supera a GLiNER2.5-base (96,9 frente a 86,2 de F1) y a PII-Tracer (79,0). En Gretel y ai4privacy, PII-Tracer obtiene mejor F1 bruto, pero PIIX-560m deja menos spans parcialmente visibles en Gretel (1,19 % frente a 1,47 %) y en ai4privacy multilingüe (6,53 % frente a 0,65 % de PII-Tracer, que es mejor en este caso). La ventaja diferencial de PIIX-560m es la combinación de licencia Apache 2.0, tamaño reducido y política de cobertura configurable.

## Limitaciones y advertencias

- El checkpoint cargado como pipeline estándar de `token-classification` omite la capa de reglas y el enmascarado por palabras completas, lo que reduce la cobertura; hay que usar `piix.py` para obtener los resultados publicados.
- En Gretel y ai4privacy, el F1 bruto es inferior al de Perplexity PII-Tracer; la ventaja está en la tasa de spans no ocultos y en la configuración de recall, no en precisión y recall conjuntos en todos los datasets.
- Con `recall=8` la precisión cae al 54,3 %: se enmascaran más fragmentos de los necesarios, lo que puede degradar la utilidad del texto para análisis posteriores.
- Riesgo de alucinación de entidades: como clasificador puede marcar como PII fragmentos que no lo son, especialmente con recall alto o en dominios alejados del entrenamiento.
- La evaluación se realiza a nivel de carácter ignorando el tipo de entidad; el rendimiento por tipo concreto no está desglosado en la información disponible.
- El benchmark PII Arena excluye el dataset `secrets-rules` porque sus fuentes no son públicas, por lo que la cobertura de secretos está menos validada que la de PII convencional.
- Cobertura idiomática desigual: los resultados publicados para ai4privacy multilingüe (de, es, fr, it, nl) son inferiores a los de inglés (83,5 frente a 85,7 de F1), y no hay evaluación publicada para ruso, ucraniano, turco, kazajo o bielorruso.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo (RGPD, HIPAA u otras) recae en el integrador; el modelo no garantiza la eliminación total de PII.
- El modelo tiene pocas descargas y likes en el momento de la ficha, y fue publicado en noviembre de 2026; la madurez del ecosistema y el soporte comunitario son limitados.
- Requiere descargar varios archivos (`piix.py`, `rules.py`, `type_filter.py`) además de los pesos, lo que complica el empaquetado en algunos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tracer-ML/PIIX-560m
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Sitio del desarrollador: https://tracerml.ai
- PII Arena: https://piiarena.com
- Dataset PrivacyBench+: https://huggingface.co/datasets/Tracer-ML/PrivacyBench-Plus
- Guía de ajuste fino: https://huggingface.co/Tracer-ML/PIIX-560m/blob/main/FINETUNING.md
