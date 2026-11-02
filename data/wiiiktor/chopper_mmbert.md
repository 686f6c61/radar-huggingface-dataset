# wiiiktor/chopper_mmbert

## Resumen

Chopper mmBERT es un par de modelos encoder de compresión de contexto diseñados para reducir pasajes recuperados de un sistema RAG a únicamente los fragmentos que contienen la respuesta a una pregunta. Lo desarrolla el usuario wiiiktor y se publica bajo licencia MIT. El modelo no genera texto: recibe una cadena con la pregunta y hasta 16 pasajes separados por el token `[SEP]`, y devuelve, token a token, una probabilidad de conservación (`p(KEEP)`) que permite segmentar el texto original en fragmentos breves (típicamente unos 3 fragmentos de ~35 tokens sobre ~3.000 tokens de entrada).

La relevancia de la propuesta es práctica: en lugar de enviar pasajes completos al LLM que responde, se envían solo las notas extraídas, lo que reduce drásticamente el consumo de contexto y el coste por consulta. Al ser un modelo independiente del generador (texto plano de entrada, texto plano de salida), los fragmentos pueden alimentar a cualquier LLM, incluidos modelos mucho más grandes que el encoder que los produce.

Se publican dos variantes con la misma arquitectura y entrenamiento: mmBERT-base (0,31B parámetros) y mmBERT-small (0,14B), ambas derivadas de la familia jhu-clsp/mmBERT y entrenadas durante una época sobre las 54.000 filas de `wiiiktor/chopper_demo`, mezclando cadenas de benchmarks y de Wikipedia. El repositorio ocupa 0,9 GB e incluye el encoder en formato Transformers más las cabezas en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base / mmBERT-small) con cabezas lineales de token classification (KEEP) y decisión (ANSWER/SEARCH) |
| Parametros totales | 0,31B (mmbert-base) / 0,14B (mmbert-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de mmBERT (entrada: pregunta + hasta 16 pasajes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder en formato Transformers + `heads.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia mmBERT, sobre el que se añaden dos cabezas lineales: una cabeza `keep` que produce una probabilidad sigmoide por token de conservar ese token, y una cabeza `decision` que, sobre el primer token, clasifica entre ANSWER y SEARCH. Las dos variantes (base y small) comparten el mismo esquema de entrenamiento y la misma disposición de pesos: carpeta `encoder/` con un modelo Transformers estándar y `heads.safetensors` con las cabezas.

El entrenamiento se realizó una sola vez sobre las 54.000 filas del dataset `wiiiktor/chopper_demo`, que mezcla cadenas de benchmarks y cadenas de Wikipedia, durante una época. No se detalla en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La supervisión procede de fragmentos generados por un profesor Qwen3-14B, según se indica en la sección de validación de la model card.

La innovación principal es el enfoque de compresión extractiva: en lugar de resumir o reescribir, el modelo señala qué tramos del pasaje original responden a la pregunta, con mapeo de vuelta a offsets de caracteres (`[passage, char_start, char_end, text]`). El decodificado aplica umbrales concretos: se conservan tokens con `p > 0,8`, se fusionan huecos de hasta 5 tokens y se descartan tramos de menos de 4 tokens. El resultado típico son ~3 fragmentos de ~35 tokens a partir de ~3.000 tokens de entrada, es decir, se conserva entre el 3 % y el 5 % del texto.

## Capacidades

- Compresión extractiva de contexto: selecciona fragmentos relevantes de pasajes recuperados para una pregunta dada.
- Clasificación binaria por token (KEEP / no KEEP) con salida de offsets de caracteres sobre el texto original.
- Decisión ANSWER / SEARCH sobre el primer token (aunque, según la model card, en la práctica casi nunca predice SEARCH).
- Independencia del modelo generador: la salida es texto plano, por lo que puede alimentar a cualquier LLM.
- Procesamiento de hasta 16 pasajes en una sola entrada de hasta 8.192 tokens.
- No realiza generación de texto, razonamiento, código, matemáticas ni visión: es exclusivamente un componente de selección previa.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Reducción de contexto en pipelines RAG: tras la recuperación de pasajes, Chopper mmBERT extrae solo los fragmentos relevantes y los inserta como notas breves antes de la pregunta, reduciendo el número de tokens enviados al LLM generador y, con ello, el coste y la latencia.
- Atención al cliente sobre base documental: en un sistema de preguntas frecuentes con documentos largos, el encoder filtra los párrafos que contienen la respuesta y el generador recibe únicamente esos extractos, lo que disminuye el riesgo de distracción por contexto irrelevante.
- Búsqueda multi-salto sobre Wikipedia: la model card valida el modelo en cadenas de 2 saltos (MuSiQue, HotpotQA, Wikipedia 2-hop), un escenario habitual en asistentes de investigación que encadenan varias consultas.
- Preprocesado para modelos con ventanas de contexto limitadas: permite usar LLMs pequeños o con contexto corto en tareas de QA documental, ya que el encoder reduce la entrada a unos pocos fragmentos.
- Moderación de coste en producción: al conservar solo el 3–5 % del texto, se puede aplicar como capa intermedia antes de cualquier llamada a un modelo de pago, con un coste computacional bajo (encoder de 0,14B o 0,31B).
- Evaluación y depuración de recuperadores: al devolver offsets de caracteres y una decisión ANSWER/SEARCH, sirve para auditar qué parte de los pasajes recuperados es realmente útil para responder.
- Procesamiento por lotes de corpus: al ser un encoder pequeño, puede ejecutarse sobre grandes volúmenes de documentos en CPU o GPU modesta para generar índices de fragmentos reutilizables.

## Benchmarks y rendimiento

Datos de validación publicados en la model card (F1 de caracteres frente a los fragmentos del profesor Qwen3-14B / proporción de preguntas cuya respuesta está en el texto conservado; 100 preguntas por conjunto):

| Chopper | MuSiQue | HotpotQA | TriviaQA | Wikipedia 2-hop | Wikipedia 1-hop |
|---|---|---|---|---|---|
| mmBERT-base | .55 / .48 | .64 / .80 | .39 / .80 | .62 / .92 | .72 / .91 |
| mmBERT-small | .53 / .47 | .61 / .81 | .33 / .74 | .60 / .90 | .68 / .94 |

Además, leídos por el respondedor Qwen3-1.7B (`wiiiktor/chopper_qwen3`), los fragmentos de mmBERT-base dan exact match de .42 / .60 / .60 en MuSiQue / HotpotQA / TriviaQA respectivamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con que el modelo no sea un generador.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño, mmBERT-small (0,14B) requiere del orden de 0,3 GB en fp32 y mmBERT-base (0,31B) del orden de 0,6 GB en fp32, sin contar activaciones ni el overhead de la librería.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` + `safetensors` + `huggingface_hub` directamente; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|
| Chopper mmBERT-base | 0,31B | 8.192 tokens | Compresión extractiva de contexto RAG | MIT |
| Chopper mmBERT-small | 0,14B | 8.192 tokens | Compresión extractiva de contexto RAG | MIT |
| Chopper Qwen3 (`wiiiktor/chopper_qwen3`) | Porción del 10 % dentro de Qwen3-1.7B, más LoRA respondedora | No disponible | Compresión + respuesta | No disponible |
| Chopper MiniCPM3 (`wiiiktor/chopper_minicpm3`) | Porción del 20 % dentro de MiniCPM3-4B | No disponible | Compresión de contexto | No disponible |

No se dispone de comparaciones con otros modelos de compresión de contexto de terceros en la información proporcionada.

## Limitaciones y advertencias

- La cabeza de decisión ANSWER/SEARCH apenas predice SEARCH en la práctica; la model card reconoce que esa decisión la hace mejor la LoRA respondedora de `chopper_qwen3`.
- El rendimiento en TriviaQA es notablemente inferior al resto (F1 de caracteres .39 en base y .33 en small), lo que sugiere menor robustez en preguntas de conocimiento factual aislado.
- El modelo está entrenado sobre un dataset concreto (`chopper_demo`) y una única época; no se documenta su comportamiento fuera de ese dominio ni con idiomas distintos del inglés.
- No se especifican los idiomas soportados, pese a que el modelo base mmBERT es multilingüe; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Al ser un extractor, puede descartar fragmentos necesarios si la pregunta requiere razonamiento que no está literalmente en el texto; el recorte al 3–5 % del pasaje es agresivo.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero los fragmentos seleccionados condicionan la respuesta del LLM posterior.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar las condiciones del modelo base jhu-clsp/mmBERT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-02; se trata de un modelo muy reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wiiiktor/chopper_mmbert
- Dataset de entrenamiento: https://huggingface.co/datasets/wiiiktor/chopper_demo
- Código: https://github.com/wiiiktor/chopper_demo
- Chopper Qwen3: https://huggingface.co/wiiiktor/chopper_qwen3
- Chopper MiniCPM3: https://huggingface.co/wiiiktor/chopper_minicpm3
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
