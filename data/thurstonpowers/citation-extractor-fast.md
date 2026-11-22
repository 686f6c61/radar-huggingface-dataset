# thurstonpowers/citation-extractor-fast

## Resumen

citation-extractor-fast es un modelo de extracción de citas legales obtenido mediante ajuste fino completo (full fine-tune) de NVIDIA Nemotron 3 Nano 4B BF16, desarrollado por el usuario thurstonpowers y publicado en Hugging Face. El modelo resuelve un problema muy concreto: dado un documento legal en crudo (estatutos, leyes, proyectos de ley, reglamentos), devuelve un array JSON de objetos `{quote, start, end, kind}` que identifican los textos de cita, su tipología y su posición en el documento fuente.

Arquitectura Nemotron H (híbrida, según el tag `nemotron_h` del repositorio) con 3.973.556.832 parámetros totales, derivada del checkpoint BF16 de NVIDIA. El entrenamiento consistió en una única época sobre el dataset `thurstonpowers/xll-citation-extractor-fast` (8.015 ejemplos usados realmente). El modelo está pensado como componente experimental de un pipeline de procesamiento legal, no como asistente conversacional general.

Su relevancia radica en que demuestra que un modelo pequeño (~4B parámetros) ajustado específicamente puede superar ampliamente a un modelo frontera como GPT-6.1 en una tarea vertical: 44,55% de F1 en reconocimiento exacto de citas frente a 23,18% del modelo generalista, sobre un conjunto de evaluación de 200 documentos federales con referencias silver.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron H (transformer híbrido, tag `nemotron_h`), fine-tune completo del checkpoint NVIDIA Nemotron 3 Nano 4B BF16 |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de la familia Nemotron H con 3.973.556.832 parámetros. Sobre ese checkpoint se aplicó un ajuste fino de todos los pesos (full fine-tune, no LoRA ni adaptadores) durante una sola época, usando el dataset propietario `thurstonpowers/xll-citation-extractor-fast`. El repositorio ocupa 8,0 GB en safetensors BF16. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica principal no está en la arquitectura sino en el contrato de entrada/salida: el modelo espera el texto fuente íntegro como mensaje de usuario, con un system prompt fijo (`SYSTEM_PROMPT.txt`, SHA-256 `8e2451afcf15498b0aab55b490fd0536342fcf097ce5dc3abd99958556de4f85`), chat template con `add_generation_prompt=True` y `enable_thinking=False`, y tokenización con `add_special_tokens=False`. La salida es un array JSON de citas con offsets en índices de caracteres Unicode (base cero, `end` exclusivo). El propio autor advierte que los campos `start` y `end` generados son poco fiables y recomienda verificar `raw[start:end] == quote` antes de usarlos, localizando las citas por su `quote` cuando se necesite resaltado en el documento fuente.

## Capacidades

- Extracción de citas legales en texto federal estadounidense: actas, proyectos de ley, reglas propuestas, reglamentos y estatutos.
- Generación de JSON estructurado con los campos `quote`, `start`, `end` y `kind`.
- Clasificación de tipo de cita (`kind`) según una taxonomía aprendida del profesor (por ejemplo `statutes_at_large`, `act`).
- Manejo de ocurrencias repetidas: cada aparición de una cita se registra como un registro separado.
- Predicción de lista vacía (`[]`) cuando el documento no contiene citas.
- Procesamiento de documentos completos con caracteres Unicode, espacios y saltos de línea originales preservados.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking (explícitamente desactivado en el contrato de inferencia).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Indexación de corpus legales: procesar colecciones de estatutos y reglamentos para extraer todas las citas y construir un índice de referencias cruzadas, aprovechando la salida JSON estructurada y la detección de ocurrencias repetidas.
- Enriquecimiento de bases de datos jurídicas: alimentar un pipeline que añada metadatos de citas (tipo, texto) a documentos ya digitalizados, con verificación posterior de offsets mediante `raw[start:end] == quote`.
- Auditoría de citas en borradores legislativos: detectar qué referencias contiene un proyecto de ley antes de su tramitación, usando el modelo como primer filtro y revisión humana sobre las citas extraídas.
- Construcción de grafos de citación: extraer citas de actas y estatutos para enlazar documentos entre sí, tratando el campo `kind` como etiqueta preliminar sujeta a normalización downstream.
- Preprocesamiento para búsqueda legal: generar índices de citas que alimenten un motor de búsqueda o un sistema RAG sobre normativa federal, donde la precisión del texto de cita importa más que la aritmética de offsets.
- Investigación académica sobre extracción de información jurídica: usar el modelo como baseline ajustado y comparar con modelos generalistas, dado que el autor publica evaluación reproducible sobre 200 documentos con referencias silver.
- Control de calidad en pipelines de conversión documental: verificar que la conversión de PDF a texto no ha perdido ni alterado citas, comparando las citas extraídas con las esperadas.

## Benchmarks y rendimiento

Evaluación sobre 200 documentos federales congelados (silver-reference eval200), midiendo F1 de reconocimiento exacto de cita ignorando los offsets generados. Todos los documentos intentados permanecen en el denominador, incluidos 31 recortes por límite de salida y 19 timeouts.

| Tipo de documento | Documentos | Nemotron sin entrenar | GPT-6.1 Sol | Fine-tuned original | Fine-tuned + reintentos por timeout |
|---|---:|---:|---:|---:|---:|
| Acts | 37 | 3,32% | 23,21% | 55,76% | **61,88%** |
| Bills | 44 | 0,73% | 13,19% | 49,01% | **49,01%** |
| Proposed rules | 37 | 0,88% | 31,43% | 32,58% | **32,58%** |
| Regulations | 44 | 0,59% | 30,01% | 38,08% | **34,15%** |
| Statutes | 38 | 1,33% | 17,57% | 43,64% | **43,64%** |
| **Global (micro)** | **200** | **1,31%** | **23,18%** | **44,23%** | **44,55%** |

El autor indica que la comparativa completa por tipo de documento (con precisión, recall, acuerdo de `kind` y tasas de fallo) está disponible en `evaluation/comparison-by-document-type.md` del repositorio. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB de VRAM para documentos largos.
- El repositorio ocupa 8,0 GB en safetensors BF16.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090 (24 GB) para desarrollo y evaluación.
- Cabe en GPU de consumo con 16 GB o más en BF16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8-12 GB, aunque el autor no publica versiones cuantizadas ni garantiza el comportamiento tras cuantizar.
- Opciones de despliegue: transformers con `custom_code` (requisito del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la dependencia de código personalizado puede complicar su uso en esos servidores.
- Latencia y throughput: no disponibles. La evaluación menciona 19 timeouts por documento, lo que sugiere que documentos largos pueden exceder límites de tiempo en el entorno de evaluación del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| citation-extractor-fast | 3,97B | no disponible | Extracción de citas legales ajustada | nvidia-nemotron-open-model-license | Hugging Face, transformers con `custom_code` |
| NVIDIA Nemotron 3 Nano 4B BF16 (base) | 3,97B | no disponible | Modelo generalista | nvidia-nemotron-open-model-license | Hugging Face |
| GPT-6.1 Sol | no disponible | no disponible | Modelo frontera generalista | propietaria | API |
| Nemotron sin entrenar (referencia del autor) | 3,97B | no disponible | Base sin ajuste para la tarea | nvidia-nemotron-open-model-license | Uso interno en la evaluación |

La comparación relevante es la del propio autor: el modelo ajustado obtiene 44,55% de F1 global frente a 23,18% de GPT-6.1 y 1,31% del Nemotron sin entrenar, sobre la misma cohorte de 200 documentos. No se dispone de comparación con otros extractores de citas legales especializados.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explícitamente como `experimental` y no documenta garantías de producción.
- Los offsets `start` y `end` generados son poco fiables; hay que verificar `raw[start:end] == quote` y, para resaltado, localizar la cita por su texto con desambiguación de ocurrencias repetidas.
- El campo `kind` es una etiqueta aprendida del profesor; la normalización de taxonomía, el enlazado a destinos y la validez jurídica son tareas downstream separadas.
- Las referencias de evaluación son silver (consenso de profesores), no gold anotado por expertos.
- Solo inglés: no hay soporte documentado para otros idiomas.
- Riesgo de alucinación: el modelo puede generar citas o offsets incorrectos; la evaluación incluye fallos, recortes por límite de salida (31) y timeouts (19) en el denominador.
- Rendimiento desigual por tipo de documento: en reglas propuestas el ajuste apenas mejora al modelo generalista (32,58% frente a 31,43%) y los reintentos por timeout empeoran el resultado en reglamentos (34,15% frente a 38,08%).
- Licencia NVIDIA Nemotron Open Model License: hay que revisar sus términos antes de uso comercial; el repositorio la etiqueta como `other`.
- Requiere cargar el system prompt byte a byte y usar la misma revisión inmutable para prompt, tokenizer y pesos; desviarse del contrato de entrada/salida degrada los resultados.
- Dependencia de `custom_code` en transformers, lo que puede limitar la compatibilidad con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/citation-extractor-fast
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-citation-extractor-fast
- System prompt: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/SYSTEM_PROMPT.txt
- Ejemplo de entrada visto en entrenamiento: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section-input.txt
- Ejemplo de salida: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section-output.json
- Registro completo del ejemplo: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section.json
- Comparativa completa de evaluación: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/evaluation/comparison-by-document-type.md
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
