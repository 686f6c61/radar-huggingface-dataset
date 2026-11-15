# yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4

## Resumen

Qwen3-Omni-30B-A3B-Instruct-NVFP4 es una cuantización de precisión reducida del modelo multimodal Qwen3-Omni-30B-A3B-Instruct desarrollado por el equipo Qwen de Alibaba Cloud. La publica el usuario yemara y aplica cuantización NVFP4 (FP4 con escalas de bloque) mediante NVIDIA ModelOpt 0.48.0 sobre el modelo "thinker" del checkpoint original, manteniendo en BF16 los codificadores de audio y visión, el talker, el code predictor y el code2wav. El resultado es un checkpoint de 27,1 GB frente a los 70,5 GB del BF16 original, con el modelo de texto del thinker reducido de 61,1 GB a 17,6 GB.

El modelo base es un transformer híbrido con arquitectura MoE (mixture of experts) de 35.259.818.545 parámetros totales según los safetensors, de los cuales aproximadamente 3.000 millones están activos por token (denominación A3B). Es un modelo any-to-any: acepta y produce texto, audio e imagen, con pipeline `any-to-any` en Hugging Face. La relevancia de esta ficha radica en que permite ejecutar un modelo omni de 30B en hardware con memoria limitada, como una única NVIDIA DGX Spark (GB10), manteniendo el resto del modelo en precisión original.

La cuantización está pensada para el motor de inferencia Hibana, que sirve este checkpoint como target `qwen3omni`. El autor documenta que la cuantización se realizó con calibración solo de texto (513 prompts, 397.953 tokens) y que cada tensor fue verificado por sha256 contra el checkpoint original. La licencia es Apache 2.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (thinker + talker), base Qwen3-Omni-30B-A3B-Instruct |
| Parametros totales | 35.259.818.545 (según safetensors) |
| Parametros activos | ~3.000 millones (denominación A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16) en el modelo de texto del thinker; BF16 en codificadores, talker, code predictor, code2wav, embeddings, routers y normas |
| Idiomas soportados | no disponible (la model card menciona prompts en chino e inglés en la evaluación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, 27,1 GB), con `hf_quant_config.json` y `quantization_config` en formato ModelOpt |
| Modelo base | Qwen/Qwen3-Omni-30B-A3B-Instruct (revision 26291f793822fb6be9555850f06dfe95f2d7e695) |
| Precisión de escalas | weight_scale E4M3 por 16 pesos; weight_scale_2 FP32 global; input_scale FP32 estático calibrado |
| Cuantización de KV-cache | no (kv_cache_quant_algo: null) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni-30B-A3B-Instruct es un transformer MoE multimodal con dos componentes principales: un "thinker" que procesa entradas de texto, audio e imagen y genera texto, y un "talker" que produce audio. El thinker incluye 48 bloques con 128 expertos enrutados cada uno, con proyecciones `gate_proj`, `up_proj` y `down_proj` por experto, además de atención con proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. La cuantización NVFP4 se aplica exclusivamente a esas proyecciones del thinker, al `lm_head` y a la atención; los embeddings, las RMSNorm (incluidas q/k norms) y los routers MoE (`mlp.gate`) permanecen en BF16, así como el codificador de audio (`thinker.audio_tower`), el codificador de visión (`thinker.visual`), el talker, su code predictor y el `code2wav`.

El proceso de cuantización se realizó con NVIDIA ModelOpt 0.48.0 mediante post-training quantization (`mtq.quantize`) con `NVFP4_DEFAULT_CFG` y calibración max, bajo transformers 5.15. La calibración usó 513 prompts del primer turno de usuario de `mlabonne/open-perfectblend` más preguntas de validación de MMLU y MMLU-Pro, descartando prompts con solapamiento de 13 palabras con los conjuntos de evaluación. Cada prompt fue respondido por el modelo BF16 original y empaquetado en 115 muestras de hasta 4.096 tokens (397.953 tokens en total). Cada matriz lineal NVFP4 almacena un código E2M1 de dos valores por byte, una escala E4M3 por cada 16 pesos y una escala global FP32, además de una escala de activación estática calibrada por proyección. Los expertos de un mismo bloque comparten una escala de entrada y una de salida SwiGLU, siguiendo el tratamiento de expertos fusionados de ModelOpt. El autor verificó la igualdad bit a bit de códigos, escalas de bloque, escalas globales y escalas de activación frente a la cuantización en carga del checkpoint BF16.

## Capacidades

- Generación de texto y razonamiento multimodal: el thinker procesa entradas de texto, audio e imagen y genera texto.
- Generación de audio: el talker, su code predictor y el code2wav permanecen en BF16 y permiten síntesis de voz.
- Comprensión de audio: el codificador de audio (`thinker.audio_tower`) se mantiene en BF16.
- Comprensión de imagen: el codificador de visión (`thinker.visual`) se mantiene en BF16.
- Razonamiento y matemáticas: el autor evalúa con subconjuntos de GSM8K y MMLU, lo que indica capacidad de razonamiento aritmético y conocimiento general.
- Generación de código: incluida en la evaluación de paridad del autor (prompts de código).
- Multilingüismo: la evaluación de paridad incluye prompts en chino, además de inglés.
- Tool calling y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede recibir audio por el codificador de audio y responder con audio generado por el talker, ambos en BF16, lo que permite construir interfaces conversacionales por voz sin pipeline externo de ASR/TTS.
- Análisis de documentos con imagen y texto: el codificador de visión en BF16 permite procesar capturas, gráficos o documentos escaneados junto a instrucciones de texto, adecuado para extracción de información estructurada.
- Despliegue en hardware de memoria limitada: con 27,1 GB de pesos frente a 70,5 GB del BF16, cabe en una única NVIDIA DGX Spark (GB10), lo que facilita prototipos y despliegues de borde con un modelo omni de 30B.
- Resumen y análisis de conversaciones largas: el thinker puede procesar texto extenso; el autor incluye en su evaluación un prompt de resumen de 2.691 tokens, lo que indica uso para síntesis de documentos.
- Generación de código asistida: los prompts de código de la evaluación de paridad muestran uso para autocompletado y generación en entornos de desarrollo, con la ventaja de un modelo que también puede leer capturas de pantalla de errores.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A4 en modelos MoE multimodales, con registro de calibración (`hibana_calibration.json`) y hashes de procedencia (`provenance.json`).
- Evaluación de motores de inferencia: al ser el checkpoint que sirve Hibana para su target `qwen3omni`, permite comparar el rendimiento de distintos motores (Hibana, vLLM, transformers) sobre los mismos pesos cuantizados.

## Benchmarks y rendimiento

El autor publica mediciones de paridad y calidad sobre subconjuntos, no benchmarks completos. Todas las mediciones son de Hibana en una NVIDIA DGX Spark (GB10), solo texto de entrada y salida (thinker), con perfil `fast` (pesos NVFP4 y KV-cache FP8).

Paridad frente a transformers BF16 (seis prompts: respuestas cortas, GSM8K, código, prosa, chino y un resumen de 2.691 tokens):

| Pesos | Coincidencia top-1 | Solapamiento top-32 | Coseno de logits en última posición | Divergencia greedy frente a transformers |
|---|---|---|---|---|
| BF16 (`exact`) | 0,93-1,00 | 0,86-0,96 | 0,991-0,9998 | 0,25 logits (dos pasos BF16) |
| NVFP4 (`fast`, este checkpoint) | 0,67-0,99 | 0,66-0,76 | 0,922-0,977 | 2,25 |

Rendimiento de decodificación: 94,4 tok/s leyendo el export NVFP4 y 93,8 tok/s cuantizando en carga desde el BF16, en solicitud única.

Calidad: el autor indica que son subconjuntos, no benchmarks completos (primeros 100 ítems de GSM8K y MMLU), pero el texto de la model card proporcionada se interrumpe antes de incluir los resultados numéricos de esa comparación. No se han publicado en la información disponible los valores de MMLU, GSM8K, HumanEval ni otros benchmarks completos.

## Requisitos de hardware

- VRAM estimada: 27,1 GB de pesos en safetensors; el autor mide en una DGX Spark (GB10) con 128 GB de memoria unificada.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es la plataforma medida por el autor; el formato NVFP4 requiere soporte de FP4 en el hardware para aprovechar su rendimiento.
- GPU consumer: no disponible en la información proporcionada; el tamaño de 27,1 GB supera la VRAM de la mayoría de GPU consumer actuales, aunque el modelo base BF16 (70,5 GB) es considerablemente mayor.
- Opciones de despliegue: motor Hibana (target `qwen3omni`, perfiles `exact` y `fast`); el formato de pesos es safetensors con configuración ModelOpt, no GGUF, por lo que llama.cpp y Ollama no están soportados directamente según la información disponible. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: 94,4 tok/s en decodificación de solicitud única en GB10 con perfil `fast`; no se publican datos de throughput por lotes ni latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct-NVFP4 (este) | 35.259.818.545 totales, ~3B activos | no disponible | safetensors NVFP4 + BF16 | Apache 2.0 | Hugging Face (yemara) |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 35.259.818.545 totales, ~3B activos | no disponible | safetensors BF16 (70,5 GB) | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de otro tamaño o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el checkpoint BF16 original: misma arquitectura y capacidades, pero 70,5 GB frente a 27,1 GB, con una pérdida de paridad documentada (top-1 de 0,67-0,99 frente a 0,93-1,00). No se dispone de datos de otros modelos omni comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión medible: la coincidencia top-1 frente a BF16 cae a 0,67-0,99 y el solapamiento top-32 a 0,66-0,76, con divergencia greedy de hasta 2,25 logits; no es una réplica exacta del modelo original.
- No determinismo: el kernel MoE NVFP4 de Hibana no es determinista, por lo que los resultados varían entre ejecuciones.
- Calibración solo de texto: los codificadores de audio y visión, el talker y el code2wav no se calibraron ni se ejercitaron en las mediciones; su comportamiento cuantizado no está evaluado (permanecen en BF16, pero la interacción con el thinker cuantizado no se mide).
- Evaluación limitada: los datos de calidad son subconjuntos de 100 ítems de GSM8K y MMLU, no benchmarks completos; no hay datos de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en esta cuantización.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base de Qwen.
- Idiomas: no se declara una lista oficial de idiomas soportados; la evaluación solo cubre inglés y chino.
- Licencia: Apache 2.0 permite uso comercial, pero los pesos son del equipo Qwen y esta ficha solo cambia el formato numérico; conviene revisar la licencia y condiciones del modelo base.
- Dependencia de hardware: NVFP4 requiere soporte de FP4; el rendimiento medido es específico de GB10 y del motor Hibana, y no se garantiza en otras plataformas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es un artefacto reciente sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Motor Hibana: https://github.com/sharar-project/hibana
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- NVIDIA ModelOpt: no disponible enlace en la información proporcionada
- Paper de Qwen3-Omni: no disponible enlace en la información proporcionada
