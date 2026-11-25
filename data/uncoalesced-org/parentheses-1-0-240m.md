# uncoalesced-org/parentheses-1.0-240M

## Resumen

parentheses-1.0-240M (Project Tanzanite) es un modelo de lenguaje compacto de tipo recurrente desarrollado por uncoalesced-org, construido sobre atención lineal selectiva (arquitectura `slab_v4`). Con 253.544.176 parámetros reales, deriva del checkpoint anterior 0.9-120M y está diseñado específicamente para ejecutarse en portátiles convencionales, con o sin GPU. Su innovación principal es que mantiene un estado de tamaño fijo durante la generación, de modo que el consumo de memoria no crece con la longitud del texto.

El modelo se centra en cinco idiomas principales (canarés, tamil, telugu, malayalam e inglés) y añade cuatro idiomas dravídicos en fase experimental (tulu, koya, kuvi y kolami). Con una longitud de contexto de entrenamiento de 4.096 tokens y un vocabulario de 32.768 entradas BPE a nivel de byte, está pensado para investigación y experimentación con modelos recurrentes pequeños en lenguas dravídicas, no para producción crítica.

Su relevancia actual radica en la exploración de alternativas a los transformers densos para despliegue en el borde (edge AI), combinando atención lineal selectiva con un estado recurrente constante de solo 4,85 MB en fp32. La model card advierte explícitamente de que las tablas de benchmarks publicadas con la versión 1.0 no deben citarse por errores metodológicos, y que la reevaluación con lm-evaluation-harness está pendiente de revisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SSM recurrente con atención lineal selectiva (`slab_v4`), 16 bloques recurrentes uniformes con token-shift y SwiGLU |
| Parámetros totales | 253.544.176 (≈253,54 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento; calidad más allá no medida) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Canarés (kn), tamil (ta), telugu (te), malayalam (ml), inglés (en); experimentales: tulu (tcy), koya (kff), kuvi (kxv), kolami (nit) |
| Licencia | Pesos: Apache 2.0; código: MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura recurrente basada en atención lineal selectiva (`slab_v4`), con 16 capas de bloques recurrentes uniformes que incorporan token-shift y SwiGLU. La dimensión del modelo es 1.024, con 16 cabezas de atención lineal selectiva de 64 dimensiones cada una, y un ancho SwiGLU (`n_inner`) de 2.752 sin sesgos. La dimensión de cabeza coincide con el tamaño de chunk de 64 usado en el kernel recurrente. Durante la inferencia mantiene un estado de tamaño fijo de 1.212.416 floats (4,85 MB en fp32), constante respecto a la longitud de secuencia, lo que elimina el crecimiento cuadrático de memoria típico de la atención completa.

El modelo fue entrenado en una única GPU de portátil de 8 GB, lo que subraya su orientación a eficiencia. El vocabulario es BPE a nivel de byte con 32.768 entradas y 256 slots de tokens especiales; el pre-tokenizador mantiene signos vocálicos y viramas junto a su letra a nivel de palabra, aunque BPE puede dividir un akshara antes de un signo vocálico dentro de una palabra. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto fluida en canarés, tamil, telugu, malayalam e inglés.
- Manejo razonable de peticiones simples de código y preguntas cortas.
- Capacidades multilingües con soporte experimental para cuatro idiomas dravídicos adicionales (tulu, koya, kuvi, kolami).
- Estado recurrente de tamaño fijo que permite generación con memoria constante independientemente de la longitud.
- Selección de idioma en la interfaz de chat mediante comandos (`/kan`, `/tam`, `/tel`, `/mal`, `/eng`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos recurrentes pequeños: el modelo sirve como banco de pruebas para estudiar atención lineal selectiva y estados recurrentes de tamaño fijo en lenguas de bajos recursos, gracias a su reducido tamaño y a la disponibilidad del código MIT.
- Experimentación en lenguas dravídicas: permite evaluar la calidad de generación en canarés, tamil, telugu y malayalam en entornos académicos, con la advertencia de que las frases de evaluación fueron generadas por IA y no verificadas por hablantes nativos.
- Despliegue en el borde y en portátiles: con 4,85 MB de estado en fp32 y 253 M de parámetros, puede ejecutarse en CPU o en GPU integrada de un portátil convencional sin necesidad de aceleradores dedicados.
- Generación de texto asistida en dispositivos sin GPU: útil para prototipos de autocompletado o redacción en inglés y lenguas dravídicas en hardware de gama baja.
- Estudio de degradación de memoria a largo plazo: el test interno de recall (needle-recall) permite analizar cómo decae la retención de información entre 128 y 4.096 tokens según el idioma y el formato (documento plano frente a chat).
- Docencia y formación: su tamaño compacto y su licencia permisiva lo hacen adecuado para cursos sobre arquitecturas recurrentes, SSM y atención lineal, así como para reproducir experimentos en una sola GPU de 8 GB.
- Pruebas de tokenización multilingüe: el vocabulario BPE con manejo especial de aksharas permite investigar el impacto de la segmentación en lenguas dravídicas.

## Benchmarks y rendimiento

La model card indica explícitamente que las tablas de benchmarks publicadas con la versión 1.0 no deben citarse, ya que usaron muestras pequeñas, puntuación por palabras clave y la mejor de cuatro ejecuciones, sobreestimando el modelo. La reevaluación con lm-evaluation-harness (conjuntos de test completos y una ejecución greedy) está realizada y pendiente de revisión. Hasta entonces, no se reportan puntuaciones de benchmarks.

Se dispone únicamente de un test interno de memoria (needle-recall), no considerado benchmark, con 50 ítems por celda. Recuerdo exacto en documento plano:

| Tokens tras el número | Inglés | Canarés | Tamil | Telugu | Malayalam |
|--:|--:|--:|--:|--:|--:|
| 128 | 0,96 | 0,98 | 0,96 | 1,00 | 1,00 |
| 512 | 0,52 | 0,86 | 0,58 | 0,90 | 0,88 |
| 1.024 | 0,08 | 0,26 | 0,04 | 0,44 | 0,36 |
| 2.048 (elección) | 0,68 | 0,82 | 0,70 | 0,86 | 0,86 |
| 4.096 (elección) | 0,20 | 0,32 | 0,26 | 0,24 | 0,24 |

El recuerdo exacto se mantiene hasta unos 256-512 tokens, permanece por encima del azar (0,20) hasta unos 2.048 tokens y desaparece a 4.096. En formato de chat decae antes: el recuerdo exacto en inglés a 512 tokens es de 0,04. Canarés, telugu y malayalam resisten más que inglés y tamil.

## Requisitos de hardware

- VRAM estimada para inferencia: el estado recurrente ocupa 4,85 MB en fp32; con 253,54 M de parámetros, los pesos en fp32 rondan 1,0 GB (tamaño del repo), y en fp16 aproximadamente 0,5 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el modelo fue entrenado en una GPU de portátil de 8 GB; para inferencia basta con CPU, GPU integrada o cualquier GPU consumer.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU; el script de chat selecciona CUDA, GPU de Mac o CPU automáticamente con `--device auto`.
- Opciones de despliegue: el código oficial está en el repositorio `parentheses-1.1` (licencia MIT), con CLI (`python -m parentheses.chat`) y API de Python basada en `transformers` y `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicados del modelo, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parentheses-1.0-240M | 253,54 M | 4.096 | SSM recurrente con atención lineal selectiva | Apache 2.0 (pesos) / MIT (código) | Hugging Face + GitHub |
| Mamba-2 (referencia arquitectónica) | Varía por tamaño | Varía | SSM selectivo | Apache 2.0 | Público |
| RWKV (referencia arquitectónica) | Varía por tamaño | Varía | Recurrente lineal | Apache 2.0 | Público |

No se dispone de comparativas de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es una fuente de hechos: a menudo afirma datos incorrectos con confianza. No debe usarse para asesoramiento médico, legal, financiero o de seguridad.
- Las tablas de benchmarks de la versión 1.0 no deben citarse por errores metodológicos (muestras pequeñas, puntuación por palabras clave, mejor de cuatro ejecuciones); la reevaluación está pendiente de revisión.
- El recuerdo a largo plazo es limitado: el recuerdo exacto cae a 0,08 en inglés a 1.024 tokens y desaparece a 4.096; en formato de chat decae aún más rápido (0,04 en inglés a 512 tokens).
- La calidad más allá de los 4.096 tokens de contexto no ha sido medida.
- Las frases de evaluación en canarés, tamil, telugu y malayalam fueron generadas por un modelo de IA y no han sido verificadas por hablantes nativos.
- Los idiomas tulu, koya, kuvi y kolami son experimentales.
- La tokenización BPE puede dividir un akshara antes de un signo vocálico dentro de una palabra, por lo que un akshara no siempre corresponde a un token.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el modelo no está diseñado para producción crítica; el código es MIT.
- No se documentan sesgos específicos conocidos ni soporte de cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/uncoalesced-org/parentheses-1.0-240M
- Repositorio de código (parentheses-1.1, MIT): https://github.com/uncoalesced/parentheses
- Historia y explicación de los errores de benchmark: https://github.com/uncoalesced/parentheses/blob/main/HISTORY.md#the-benchmark-tables-november-2026
- Especificación de benchmarks: https://github.com/uncoalesced/parentheses/blob/main/docs/BENCHMARK_SPEC.md
- Resultados del test de recall: https://github.com/uncoalesced/parentheses/blob/main/eval/results/needle-recall-1.0/summary.md
- Guía de instalación: https://github.com/uncoalesced/parentheses/blob/main/docs/SETUP.md
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
