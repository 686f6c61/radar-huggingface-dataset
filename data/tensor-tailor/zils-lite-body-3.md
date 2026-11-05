# tensor-tailor/zils-lite-body-3

## Resumen

zils-lite-body-3 es un modelo de decisión de 853 millones de parámetros publicado por el usuario tensor-tailor en HuggingFace. Forma parte del ecosistema Zils, un conjunto de "cuerpos" (bodies) que compiten en la subred 127 de Bittensor, una red descentralizada de cómputo e incentivos. El modelo no es un asistente conversacional al uso: está diseñado específicamente para responder preguntas de opción múltiple y tareas de decisión estructurada, como elegir herramientas, clasificar resultados de ediciones en Wikipedia o resolver problemas de inferencia de lenguaje natural.

Técnicamente se construye sobre el chasis de Qwen3.5-0.8B (tensores de lenguaje y visión en bf16), y se obtiene mediante un fine-tuning con LoRA de rango 16 sobre un cuerpo previo no publicado (B2), que a su vez parte del promedio uniforme de tres modelos de la casa: vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full. El resultado es un modelo compacto, con licencia Apache-2.0, orientado a la inferencia de bajo coste en entornos de competición y evaluación automatizada.

Su relevancia radica en que ejemplifica una tendencia creciente: modelos pequeños y especializados, entrenados con destilación de profesores más grandes y datos sintéticos, que buscan maximizar la precisión en tareas de decisión concretas en lugar de la generación abierta. No obstante, la información pública es limitada: no se han publicado benchmarks, idiomas soportados ni detalles sobre el pipeline de despliegue, y el modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 6 capas de atención completa y 18 capas Gated-DeltaNet (según la model card, chasis Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (las filas de entrenamiento se limitaron a 2.048 tokens, pero no se especifica la ventana de inferencia) |
| Tipos de cuantización | No disponible (pesos en bf16; no se listan GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | No disponible (los datos de entrenamiento incluyen textos en 9 idiomas, pero no se declara soporte oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, según los tags) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de transformer con 24 capas en total: 6 capas de atención completa y 18 capas Gated-DeltaNet, un mecanismo de atención lineal con compuertas que reduce el coste computacional en secuencias largas. Los tensores de lenguaje y visión provienen del chasis Qwen3.5-0.8B. El fine-tuning se aplicó exclusivamente mediante LoRA de rango 16 (alpha 32, dropout 0.05, learning rate 1e-4 con warm-up lineal de 50 pasos y decaimiento coseno) sobre 114 matrices: q/k/v/o en las capas de atención completa, e in_proj_qkv/z/a/b y out_proj en las capas Gated-DeltaNet. El LoRA se fusionó en los pesos y se almacenó en bf16; el resto de tensores son idénticos a los del cuerpo B2.

El entrenamiento se realizó durante una sola época (3.339 pasos, batch 8 con acumulación de gradiente 2, semilla 4343) sobre 38.601 filas de entrenamiento y 14.817 de regularización, tras descartar las filas de más de 2.048 tokens (80 de entrenamiento y 2 de regularización). La función de pérdida combina entropía cruzada en las filas etiquetadas (preguntas de resultados fechadas, GSM8K y filas generadas), KL forward hacia las probabilidades de opción del profesor vllm-sr/d3-ultra en las filas de destilación, y KL hacia las probabilidades propias de B2 en las filas de regularización (sin entropía cruzada de etiquetas). Los datos incluyen 8.604 preguntas de resultados fechados (ediciones de Wikipedia en 9 idiomas, Wikidata, categorías de arXiv), 18.754 preguntas de razonamiento y NLI destiladas, 8.329 preguntas de herramientas (incluyendo 829 de BFCL), 994 de formas de palabras y 2.000 de GSM8K. La desviación relativa de las capas de lenguaje respecto a Qwen3.5-0.8B es de 0,044, dentro del límite Zils de 0,15.

## Capacidades

- Generación de texto y razonamiento de opción múltiple: el modelo está optimizado para emitir probabilidades sobre opciones predefinidas, no para generación abierta extensa.
- Razonamiento sobre resultados de ediciones: clasificación de resultados de ediciones en Wikipedia y Wikidata (reversión o no), y categorización de listados de arXiv.
- Inferencia de lenguaje natural (NLI): entailment, contradicción y neutralidad, con datos de babi_nli, WinoGrande, ARC, HellaSwag, defeasible-nli, SNLI, entre otros.
- Selección de herramientas y function calling: preguntas de elección de herramienta, política de llamada y puntuación de argumentos, con datos de BFCL.
- Razonamiento matemático básico: entrenado con el split de entrenamiento de GSM8K.
- Morfología y formas de palabras: preguntas generadas de inflexión.
- Capacidades de visión: el chasis incluye tensores de visión, pero no se detalla su uso ni rendimiento.
- Multilingüismo parcial: los datos de entrenamiento cubren inglés, español, portugués, francés, italiano, ruso, alemán, japonés y chino, aunque no se declara soporte oficial.
- No se menciona soporte de agentes multi-paso, modo thinking ni audio.

## Casos de uso

- Clasificación de resultados de ediciones en Wikipedia: el modelo puede evaluar si una edición será revertida o no, usando el formato público de Zils Current/Outcomes, lo que resulta útil para herramientas de moderación comunitaria y análisis de calidad.
- Moderación de Wikidata: clasificación de ediciones en Wikidata (CC0) para detectar cambios problemáticos, aprovechando el entrenamiento específico en 1.152 filas de resultados de Wikidata.
- Categorización de listados de arXiv: asignación de categorías (cs, physics, math, other) a partir de título y abstract, útil en pipelines de indexación científica.
- Selección de herramientas en asistentes: integración en sistemas de function calling donde el modelo elige la herramienta adecuada y puntúa argumentos, con datos de BFCL y generadores propios.
- Evaluación de NLI en pipelines de verificación: clasificación de pares premisa-hipótesis para tareas de entailment, contradicción y neutralidad en sistemas de fact-checking.
- Razonamiento matemático elemental: resolución de problemas de GSM8K en entornos educativos o de evaluación automatizada, dado el entrenamiento específico en ese conjunto.
- Morfología y procesamiento lingüístico: generación de formas de palabras para herramientas de análisis morfológico o corrección lingüística.
- Competición en Bittensor subnet 127: participación como cuerpo de decisión en el pool d3-lite, donde el modelo compite por precisión en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 853 millones de parámetros en bf16, los pesos ocupan aproximadamente 1,7 GB. Con overhead de activaciones y caché KV, se estima un consumo de 2-4 GB en bf16, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería poder ejecutarlo en bf16 o fp16. Para cuantización a 8 bits o 4 bits, bastaría con 2-3 GB.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 6 GB o más.
- Opciones de despliegue: no se especifican en la model card. El tag custom_code sugiere que requiere código personalizado para cargar la arquitectura híbrida; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-3 | 853 M | No disponible | Apache-2.0 | HuggingFace (0 descargas) | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen3.5-0.8B | ~800 M | No disponible | Apache-2.0 (según chasis) | HuggingFace | Modelo base del chasis; uso general |
| vllm-sr/d3-lite | No disponible | No disponible | No disponible | HuggingFace | Cuerpo de la casa Zils; base del promedio |
| Maincode/Matilda-Decision-v1-Edge | No disponible | No disponible | No disponible | HuggingFace | Cuerpo de la casa Zils; base del promedio |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero los datos de entrenamiento incluyen ediciones de Wikipedia en 9 idiomas y conjuntos de NLI que pueden contener sesgos de anotación.
- Riesgo de alucinación: al estar optimizado para preguntas de opción múltiple, la generación abierta puede producir respuestas incoherentes o inventadas; no es un modelo conversacional.
- Limitaciones de contexto: las filas de entrenamiento se limitaron a 2.048 tokens, y no se especifica la ventana de inferencia; secuencias más largas pueden degradar el rendimiento.
- Limitaciones de idioma: aunque los datos cubren 9 idiomas, no se declara soporte oficial ni se garantiza un rendimiento uniforme.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero los textos de origen con licencias CC BY-SA 4.0 imponen obligaciones de compartir igual al redistribuir el texto fuente; el repositorio no aclara si los pesos incorporan esos textos de forma que afecte a la redistribución.
- Caveat para producción: el modelo tiene cero descargas y cero "likes", no se han publicado benchmarks y requiere código personalizado (custom_code) para su carga; la madurez y el soporte son limitados.
- El modelo es un fine-tune de un cuerpo no publicado (B2) y comparte datos de entrenamiento con otro cuerpo (B1), lo que puede generar solapamiento y sobreajuste a las tareas específicas de Zils.

## Enlaces

- HuggingFace: https://huggingface.co/tensor-tailor/zils-lite-body-3
- Modelo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo base zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Cuerpo B1 publicado: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Dataset de destilación: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Organización tasksource: https://huggingface.co/tasksource
