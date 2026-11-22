# synsetai/biomistral-7b-mednli-synrise

## Resumen

Synset-Hardened BioMistral 7B es un adaptador LoRA de rango uniforme (semilla 17) entrenado sobre el modelo base BioMistral-7B para la tarea de inferencia de lenguaje natural (NLI) en el dominio clínico, concretamente sobre el corpus MedNLI derivado de MIMIC-III. Lo desarrolla el usuario synsetai y su objetivo declarado es reducir la tasa de "entailment erróneo" (falsas implicaciones) en hipótesis clínicas, un fallo crítico en aplicaciones médicas donde una implicación incorrecta puede tener consecuencias graves. El adaptador se presenta como un artefacto de investigación con pesos en custodia controlada, no como un modelo listo para producción.

El interés técnico reside en su metodología de evaluación: comparación pareada a nivel de familia de premisas sobre 249 hipótesis de 80 familias retenidas de MedNLI, con intervalos de confianza unilaterales del 95 % calculados mediante inversión de e-values de media acotada. Sobre esa base, el adaptador reduce la tasa media por familia de entailment erróneo del 16,56 % al 3,13 %, con un límite inferior unilateral del 95 % de 5,54 puntos porcentuales de reducción.

El modelo hereda la arquitectura y el tamaño de BioMistral-7B (7 000 millones de parámetros, transformer denso), pero el repositorio público no distribuye los pesos del adaptador: solo libera código de puntuación, rutinas de estudio congeladas y evidencia agregada. La licencia del adaptador derivado no está declarada de forma explícita y el acceso a los bytes del mismo queda sujeto a autorización separada por su ascendencia MIMIC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (BioMistral-7B) con adaptador LoRA uniforme sobre proyecciones de atención |
| Parámetros totales | 7 000 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de BioMistral-7B) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible para el adaptador; el base BioMistral-7B declara Apache License 2.0 en la revisión `9a11e1ffa817c211cbb52ee1fb312dc6b61b40a5` |
| Formato de pesos | adaptador LoRA (los pesos no se distribuyen públicamente); el base en safetensors (revisión `983528968809e645e2383b2cc1f850ea7f66b653`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA uniforme de semilla 17 que parchea 128 proyecciones de atención en 32 capas del base BioMistral-7B congelado. El entrenamiento consistió en una pasada sobre 384 familias de premisas del split oficial de entrenamiento de MedNLI, generando 1 158 tokens de respuesta supervisados y 145 actualizaciones aplicadas. Se empleó supervisión solo en la respuesta (response-only supervision) y proyección de roles, con el modelo base permaneciendo inalterado durante todo el proceso. Las semillas 17 y 29 se ejecutaron de forma independiente sobre el mismo conjunto de desarrollo expuesto y ambas superaron la regla de selección predefinida; la designación fija asignó únicamente la semilla 17 a la confirmación independiente.

El desarrollo utilizó 96 familias de premisas y 291 hipótesis. La comparación principal se realizó contra el predictor BioMistral plano congelado, con un panel de confirmación de 249 hipótesis sobre 80 familias retenidas. La evaluación emplea intervalos de media acotada por familia con inversión de e-values unilaterales al 95 %, manteniendo en los denominadores las respuestas ausentes o inválidas y tratándolas en la dirección desfavorable para cada cota confirmatoria. El estudio también incluyó una comparación con Mistral-7B-Instruct-v0.2 sin modificar (66,67 % de precisión media por familia frente al 47,40 % de BioMistral plano), aunque esa comparación pertenece al desarrollo expuesto y usa un checkpoint y plantilla nativa distintos.

## Capacidades

- Inferencia de lenguaje natural (NLI) clínica: clasificación de pares premisa-hipótesis en las categorías entailment, neutral y contradiction sobre texto médico.
- Reducción específica de falsas implicaciones: la tasa de entailment erróneo cae del 16,56 % al 3,13 % en media por familia en el conjunto de confirmación.
- Mejora de recall por clase: entailment del 44,58 % al 78,31 %, neutral del 71,08 % al 89,16 % y contradiction del 18,07 % al 83,13 % (tasas agrupadas descriptivas).
- Puntuación determinista reproducible: el repositorio incluye un scorer de biblioteca estándar y un predictor autónomo que reproduce los mismos token IDs nativos, logits y decisiones en tres entradas sintéticas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés (`language: [en]`).

## Casos de uso

- Verificación de hipótesis clínicas en pipelines de investigación: el adaptador permite comprobar si una afirmación derivada de una nota clínica está implicada, es neutral o contradice la premisa, con una tasa de falsa implicación del 3,13 % en media por familia, adecuada para tareas de curación de datos donde el coste de un falso positivo es alto.
- Filtrado de pares en la construcción de datasets médicos: al reducir el entailment erróneo del 16,56 % al 3,13 %, sirve para descartar pares premisa-hipótesis mal etiquetados antes de incorporarlos a corpus de entrenamiento.
- Auditoría de resúmenes clínicos: dado un informe y una frase resumen, el modelo clasifica la relación lógica, lo que permite detectar resúmenes que afirman más de lo que el texto original sostiene.
- Evaluación de sistemas de extracción de información médica: como componente de un banco de pruebas que mida si las relaciones extraídas están lógicamente implicadas por el texto fuente.
- Investigación en robustez de NLI clínico: la metodología de comparación pareada por familia de premisas y los intervalos de e-values proporcionan una base reproducible para estudios de mitigación de sesgos de entailment.
- Reproducción de estudios: el código de puntuación público y el predictor autónomo permiten validar las decisiones del adaptador sobre entradas sintéticas sin necesidad de acceder a los pesos, útil para revisión por pares y auditoría metodológica.

## Benchmarks y rendimiento

Resultados de confirmación independiente sobre 249 hipótesis de 80 familias retenidas de MedNLI (medias por familia; cotas unilaterales al 95 %):

| Endpoint | Base plano | Adaptador | Cambio pareado por familia (pp) | Cota inferior unilateral 95 % (pp) |
|---|---:|---:|---:|---:|
| Entailment erróneo | 16,56 % | 3,13 % | +13,44 de reducción | +5,54 |
| Recall de entailment | 44,58 % | 78,31 % | +35,00 | +12,52 |
| Recall de neutral | 71,08 % | 89,16 % | +16,88 | −3,49 |
| Recall de contradiction | 18,07 % | 83,13 % | +63,75 | +38,12 |

Datos adicionales del estudio:

| Métrica | Valor |
|---|---|
| Precisión balanceada agrupada | 44,58 % → 83,53 % |
| Entailment erróneo en hipótesis neutrales (media por familia) | 24,38 % → 6,25 % |
| Entailment erróneo en hipótesis de contradicción (media por familia) | 8,75 % → 0,00 % |
| Correcciones sobre el baseline | 111 |
| Errores nuevos introducidos | 14 |
| Entailments erróneos eliminados | 27 |
| Entailments erróneos introducidos | 4 |
| Cobertura puntuable | 100 % en ambos predictores |

En desarrollo expuesto (96 familias, 291 hipótesis): BioMistral plano 17,71 % de entailment erróneo; brazo de instrucción explícita fija 93,23 %; beneficio del adaptador frente al base plano de 14,58 pp (semilla 17) y 15,10 pp (semilla 29). Mistral-7B-Instruct-v0.2 sin modificar alcanzó 66,67 % de precisión media por familia frente al 47,40 % de BioMistral plano, con tasas de falsa implicación de 10,94 % y 9,90 % en sus variantes plana e instructiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia del base BioMistral-7B, un modelo denso de 7 000 millones de parámetros requiere típicamente entre 14 y 16 GB en FP16/BF16 y entre 4 y 6 GB en cuantización de 4 bits, pero estos valores no están confirmados para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del base BioMistral-7B y del formato de cuantización, no especificado.
- Opciones de despliegue: el repositorio incluye un predictor autónomo y un scorer de biblioteca estándar (Python 3.12) para puntuación; la inferencia real requiere los bytes del adaptador autorizados por separado y el base fijado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| synsetai/biomistral-7b-mednli-synrise | 7 000 M (base) + LoRA | no disponible | NLI clínico (MedNLI) | no disponible (base Apache 2.0) | Adaptador en custodia controlada; solo código público |
| BioMistral/BioMistral-7B (plano) | 7 000 M | no disponible | Modelo médico general | Apache 2.0 (revisión fijada) | Público en Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7 000 M | no disponible | Generalista con instrucciones | no disponible en la información | Público en Hugging Face |

En el panel de desarrollo expuesto, Mistral-7B-Instruct-v0.2 sin modificar obtuvo 66,67 % de precisión media por familia frente al 47,40 % de BioMistral plano, con tasas de falsa implicación de 10,94 % y 9,90 %. El adaptador, en confirmación independiente, alcanza 83,53 % de precisión balanceada agrupada y 3,13 % de entailment erróneo medio por familia, aunque la comparación directa con el generalista no forma parte de la confirmación y usa distinto checkpoint y plantilla.

## Limitaciones y advertencias

- Los pesos del adaptador no se distribuyen públicamente: permanecen en custodia controlada y el acceso requiere autorización separada por la ascendencia MIMIC-III y la guía de PhysioNet sobre modelos derivados.
- La licencia del adaptador derivado no está declarada; la Apache 2.0 del base no cubre automáticamente el artefacto entrenado sobre MedNLI.
- El alcance de la confirmación asume independencia a nivel de familia de premisas; no se conoce el parentesco compartido entre pacientes y la posible superposición con el preentrenamiento del base no está resuelta.
- Los errores nuevos introducidos (14 a nivel de ítem, 4 entailments erróneos) siguen siendo relevantes para decisiones de despliegue, según advierte el propio autor.
- La cota inferior del recall de neutral (+16,88 pp de cambio, −3,49 pp de cota) no excluye una degradación de hasta 3,49 puntos, aunque supera el margen de preservación de −5 puntos.
- El modelo está entrenado y evaluado únicamente en inglés; no hay soporte multilingüe documentado.
- No se documentan capacidades de generación abierta, razonamiento general, código, matemáticas ni tool calling; su uso está acotado a la clasificación NLI.
- Riesgo de alucinación y sesgos: no cuantificados en la información disponible; la tarea de NLI mitiga parcialmente la generación libre pero no elimina sesgos del corpus MIMIC-III.
- El estudio usó etiquetas clínicas nativas de MedNLI 1.0.0 y su comparación principal empleó un procedimiento de decodificación distinto, lo que limita la comparabilidad directa con otras evaluaciones.
- El repositorio público no permite la inferencia completa sin los bytes del adaptador y el runtime privado Synrise; el código liberado sirve para inspección y puntuación, no para despliegue autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synsetai/biomistral-7b-mednli-synrise
- Modelo base BioMistral-7B: https://huggingface.co/BioMistral/BioMistral-7B
- Tarjeta fijada de BioMistral: https://huggingface.co/BioMistral/BioMistral-7B/blob/9a11e1ffa817c211cbb52ee1fb312dc6b61b40a5/README.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guía de PhysioNet sobre modelos derivados de MIMIC: https://physionet.org/news/post/mimic-derived-datasets-models/
- Instrucciones del receptor (INFERENCE.md): referenciadas en el repositorio, sin URL absoluta disponible
