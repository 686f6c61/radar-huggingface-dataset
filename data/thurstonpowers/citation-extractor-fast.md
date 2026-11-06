# thurstonpowers/citation-extractor-fast

## Resumen

citation-extractor-fast es un modelo experimental de extracción de citas legales, publicado por el usuario thurstonpowers en Hugging Face. Se trata de un fine-tune de pesos completos (una época) sobre NVIDIA Nemotron-3-Nano-4B-BF16, un transformer de aproximadamente 3.970 millones de parámetros. El modelo recibe como entrada el texto fuente de un documento legal y devuelve un array JSON de objetos con la cita textual (`quote`), su posición de inicio y fin en caracteres Unicode (`start`, `end`) y la categoría de la cita (`kind`).

El modelo resuelve un problema acotado y bien definido: localizar y clasificar referencias legales (estatutos, actas, reglamentos, proyectos de ley) dentro de documentos jurídicos en inglés. No está cualificado para producción ni constituye asesoramiento legal, según advierte explícitamente el autor. Su relevancia radica en que demuestra que un modelo pequeño (4B) con un fine-tune específico puede superar ampliamente tanto a su versión base sin entrenar como a un modelo propietario de referencia (GPT-6.1) en la tarea de reconocimiento exacto de citas.

La licencia es la NVIDIA Nemotron Open Model License, que impone condiciones específicas para uso comercial. El modelo solo soporta inglés y su formato de pesos es safetensors con código personalizado (`nemotron_h`), lo que requiere `trust_remote_code=True` en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Nemotron H, `nemotron_h`), fine-tune de pesos completos |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16), con código personalizado |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3-Nano-4B-BF16, un transformer de aproximadamente 4.000 millones de parámetros. Sobre esta base se realizó un fine-tune de pesos completos durante una única época, sin que se especifiquen en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El conjunto de entrenamiento incluyó 8.015 ejemplos efectivamente utilizados, con objetivos "silver" (etiquetas generadas por un modelo profesor, no verificadas por anotadores humanos).

La innovación técnica principal no reside en la arquitectura sino en el contrato de entrada/salida: el modelo espera el texto fuente íntegro como mensaje de usuario, con un system prompt entrenado específico (SHA-256 `8e2451afcf15498b0aab55b490fd0536342fcf097ce5dc3abd99958556de4f85`), sin salto de línea final, y debe invocarse con `add_generation_prompt=True`, `enable_thinking=False` y `add_special_tokens=False`. La salida es un array JSON de objetos `{quote, start, end, kind}` donde los offsets son índices de caracteres Unicode (no bytes UTF-8 ni posiciones de token). El autor advierte que los campos `start` y `end` generados no son fiables y deben verificarse con `raw[start:end] == quote`.

## Capacidades

- Extracción de citas legales textuales de documentos jurídicos en inglés.
- Clasificación de cada cita en categorías aprendidas (`kind`), como `statutes_at_large` o `act`.
- Predicción de offsets de inicio y fin en caracteres Unicode, con `end` exclusivo (aunque poco fiables según el autor).
- Manejo de ocurrencias repetidas: cada aparición de una cita se registra como un registro separado.
- Generación de arrays JSON completos; `[]` indica ausencia de citas predichas, no ausencia verificada legalmente.
- Procesamiento de documentos de actas, proyectos de ley, reglamentos, estatutos y normas propuestas.
- Modo conversacional con plantilla de chat entrenada.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (`enable_thinking=False` es obligatorio).

## Casos de uso

- Extracción de citas en revisión documental jurídica: dado un estatuto o reglamento en texto plano, el modelo devuelve las referencias legales contenidas, lo que permite indexarlas y vincularlas a bases de datos normativas. Es adecuado porque su fine-tune está especializado en el formato de citas legales estadounidenses.
- Construcción de pipelines de enriquecimiento de corpus legales: integrado en un proceso batch que lee documentos, aplica el system prompt entrenado y valida cada `quote` contra el texto fuente antes de almacenar los resultados. El modelo es pequeño (4B) y puede ejecutarse en una sola GPU.
- Preprocesamiento para motores de búsqueda jurídica: las citas extraídas y clasificadas por `kind` pueden alimentar índices invertidos o grafos de referencias cruzadas entre normas.
- Detección de referencias en proyectos de ley y normas propuestas: el modelo muestra un rendimiento competitivo en estas categorías (49,01% y 32,58% de F1 de reconocimiento exacto respectivamente), lo que lo hace útil para alertas tempranas en seguimiento regulatorio.
- Análisis de contratos y expedientes administrativos: aunque entrenado principalmente con normativa federal, puede emplearse para localizar menciones a estatutos y actas en documentos auxiliares, siempre con verificación humana posterior.
- Generación de datasets etiquetados para entrenar modelos mayores: las predicciones del modelo, tras validación de offsets y revisión humana, pueden servir como preetiquetado semi-automático en proyectos de anotación legal.
- Evaluación comparativa de extractores: sirve como baseline open source especializado frente a modelos propietarios en tareas de extracción de citas, dado que el autor publica métricas reproducibles sobre un cohorte congelado de 200 documentos.

## Benchmarks y rendimiento

El autor publica una evaluación sobre un cohorte congelado de 200 documentos federales con referencias "silver" (consenso de modelos profesor). La métrica principal es el F1 de reconocimiento exacto de la cita textual, ignorando los offsets generados. Todos los documentos intentados, incluidos fallos, 31 salidas truncadas por límite y 19 timeouts, permanecen en el denominador.

| Tipo de documento | Documentos | Nemotron sin entrenar | GPT-6.1 | Nemotron fine-tuned |
|---|---:|---:|---:|---:|
| Actas (Acts) | 37 | 3,32% | 23,21% | 55,76% |
| Proyectos de ley (Bills) | 44 | 0,73% | 13,19% | 49,01% |
| Normas propuestas (Proposed rules) | 37 | 0,88% | 31,43% | 32,58% |
| Reglamentos (Regulations) | 44 | 0,59% | 30,01% | 38,08% |
| Estatutos (Statutes) | 38 | 1,33% | 17,57% | 43,64% |
| Global (micro) | 200 | 1,31% | 23,18% | No disponible en la información proporcionada |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB.
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos, más overhead.
- En cuantización de 4 bits: alrededor de 2,5-3 GB de pesos, más overhead.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en una sola tarjeta.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización de 8 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura `nemotron_h`); vLLM y TGI si soportan el código personalizado del modelo; llama.cpp y Ollama solo si se generan conversiones GGUF compatibles, no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada. El nombre "fast" es el nombre de la release y no una afirmación de ventaja de velocidad, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento en extracción de citas |
|---|---:|---|---|---|---|
| citation-extractor-fast | ~3,97B | No disponible | NVIDIA Nemotron Open Model License | Extracción de citas legales | 55,76% F1 en actas, 49,01% en proyectos de ley |
| NVIDIA Nemotron-3-Nano-4B-BF16 (base) | ~3,97B | No disponible | NVIDIA Nemotron Open Model License | Propósito general | 3,32% F1 en actas, 0,73% en proyectos de ley |
| GPT-6.1 (propietario) | No disponible | No disponible | Propietaria | Propósito general | 23,21% F1 en actas, 13,19% en proyectos de ley |

No se dispone de información sobre otros extractores de citas legales open source comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que no está cualificado para producción y que no constituye asesoramiento legal.
- Los campos `start` y `end` generados no son fiables; es obligatorio verificar `raw[start:end] == quote` antes de usarlos.
- Las referencias de evaluación son "silver" (consenso de modelos profesor), no verificadas por adjudicación humana independiente.
- La métrica principal mide reconocimiento de la cita textual, no corrección jurídica ni validez legal de la cita.
- El modelo solo soporta inglés; no se ha validado en otros idiomas.
- Riesgo de alucinación: puede generar citas que no existen en el texto fuente o clasificaciones `kind` incorrectas; el `kind` es una etiqueta aprendida del profesor, no una taxonomía jurídica validada.
- `[]` en la salida significa que el modelo no predijo citas, no que el documento carezca de ellas.
- El modelo puede truncar salidas (31 casos en la evaluación) o agotar tiempo (19 casos), lo que requiere manejo de fallos en el pipeline.
- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial; es necesario revisar sus términos antes de desplegar.
- Requiere cargar el system prompt exacto (SHA-256 verificado) y la misma revisión inmutable de pesos, tokenizer y prompt; desviarse del contrato de entrada degrada la salida.
- El modelo base subyacente puede arrastrar sesgos presentes en los datos de entrenamiento originales de Nemotron.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/citation-extractor-fast
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- System prompt entrenado: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/SYSTEM_PROMPT.txt
- Ejemplo de entrada (sección vista): https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section-input.txt
- Ejemplo de salida (sección vista): https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section-output.json
- Registro completo del ejemplo con procedencia: https://huggingface.co/thurstonpowers/citation-extractor-fast/blob/main/examples/seen-section.json
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
