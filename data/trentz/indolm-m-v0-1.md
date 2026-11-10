# Trentz/IndoLM-M-v0.1

## Resumen

IndoLM-M-v0.1 es un modelo de lenguaje causal en indonesio desarrollado por Trentz (Trenttzzz), entrenado desde cero sobre un corpus propio denominado IndoCorpus-v1.0. Se trata de un modelo base de tipo decoder-only con arquitectura GPT, 69.975.680 parámetros y una ventana de contexto máxima de 1.024 tokens. No ha sido sometido a ajuste por instrucciones ni a entrenamiento conversacional, por lo que su función es la continuación de texto, no el diálogo.

Su relevancia radica en dos aspectos concretos: es un modelo de dominio lingüístico específico (indonesio) de tamano reducido, y se distribuye exclusivamente en formato ONNX (opset 18) con variantes fp16 y q4, orientadas a inferencia en navegador mediante WebGPU y WASM. El repositorio no incluye checkpoints PyTorch ni integración con `AutoModel` o `pipeline()` de Transformers, lo que lo aleja del ecosistema estándar y lo acerca a demos autocontenidas en cliente.

El modelo se publica bajo licencia CC BY-SA 4.0 y está declarado explícitamente por el autor como no apto para producción, sin filtros de seguridad ni evaluación downstream más allá de bits-per-byte. La fecha de creación del repositorio es el 10 de noviembre de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT con RoPE (theta 10.000), pre-norm RMSNorm, MLP SwiGLU, embeddings input/output atados, sin bias |
| Parametros totales | 69.975.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (sin sliding window) |
| Tipos de cuantizacion | fp16 (ONNX) y q4 weight-only `MatMulNBits` (bloque 32, asimetrico); no se incluye fp32 ni q8 |
| Idiomas soportados | indonesio (id) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 18); no se incluyen safetensors ni GGUF |

Otros parametros arquitectonicos: 12 capas, dimension de modelo 640, 10 cabezas de atencion con dimension de cabeza 64, MLP hidden de 1.728 y vocabulario de 16.384 tokens con tokenizer byte-level BPE (`IndoLM-tok-v0.1`).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT con normalizacion pre-norm mediante RMSNorm, activacion SwiGLU en el MLP, embeddings de entrada y salida atados y RoPE con theta 10.000. No emplea sesgo en las capas lineales. La configuracion sigue el formato del proyecto IndoLM y no la convencion estandar de Transformers, lo que impide su carga directa con `AutoModel`.

El entrenamiento se realizo sobre IndoCorpus-v1.0, con 103,3 millones de tokens de entrenamiento compuestos por Wikipedia en indonesio (23,2%) y FineWeb2 en la configuracion `ind_Latn` (76,8%). El presupuesto total fue de 12.610 pasos con batches de 32.768 tokens, aproximadamente 413,2 millones de tokens procesados, equivalentes a 4 epocas. Se uso el optimizador AdamW con learning rate cosine de 1e-3 a 1e-4, precision bf16 y una unica NVIDIA L4 durante 2 horas y 4 minutos. El checkpoint publicado corresponde a la ejecucion `m4_cf`, paso 12.610. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior.

La innovacion tecnica principal no esta en la arquitectura sino en el empaquetado: exportacion a ONNX con contrato de inferencia explicito (entradas `input_ids` int64, caches `past_key_i`/`past_value_i` de forma `[batch, 10, past, 64]`, logits `[batch, seq, 16384]`) y cuantizacion q4 mediante `MatMulNBits` con activaciones, embeddings y output head en fp32. La generacion por defecto usa temperature 0,8, top-k 50 y un maximo de 80 tokens nuevos.

## Capacidades

- Generacion de texto por continuacion de prompt en indonesio; no es un modelo instruido ni conversacional.
- Modelado de lenguaje causal con soporte de cache KV incremental para decodificacion token a token.
- Tokenizer byte-level BPE con vocabulario de 16.384 entradas, que incluye tokens de chat en el vocabulario aunque no fueron entrenados.
- Inferencia en navegador mediante ONNX Runtime, con objetivos WebGPU (fp16) y WASM (q4).
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo thinking.
- Capacidad multilingue limitada al indonesio; el corpus de entrenamiento es exclusivamente `ind_Latn` y Wikipedia en indonesio.

## Casos de uso

- Experimentacion educativa sobre entrenamiento de modelos desde cero: el modelo sirve como referencia reproducible de un pipeline completo (tokenizer, corpus, entrenamiento en una sola GPU L4 en poco mas de dos horas) para cursos y talleres de LLM.
- Demos de inferencia en navegador: los artefactos ONNX fp16 (WebGPU) y q4 (WASM) permiten prototipos de generacion de texto que se ejecutan en el cliente sin backend, utiles para validar el contrato de caches KV y la latencia en dispositivos reales.
- Investigacion sobre modelos de baja resource para lenguas de bajos recursos: con menos de 70 millones de parametros y un corpus de 103 millones de tokens, es un punto de partida para estudiar tecnicas de aumentacion de datos o curricula en indonesio.
- Pruebas de cuantizacion y portabilidad ONNX: la comparacion documentada entre fp16 (delta de -0,000004 bpb) y q4 (+0,0046 bpb) sobre un subconjunto de 172 documentos held-out permite evaluar el impacto de la cuantizacion weight-only en modelos pequenos.
- Generacion de texto auxiliar en tareas de completado de parrafos en indonesio dentro de entornos controlados (por ejemplo, prototipos de autocompletado en editores), siempre con revision humana y sin presentar la salida como informacion veridica.
- Benchmarking de runtimes: al publicar un contrato de inferencia detallado con formas de tensores y tipos, es util para comparar el rendimiento de ONNX Runtime frente a otras implementaciones en CPU y GPU sobre una carga fija y reproducible.

## Benchmarks y rendimiento

El autor solo publica evaluaciones de bits-per-byte (bpb), no resultados en benchmarks downstream como MMLU, HumanEval o GSM8K.

| Conjunto de evaluacion | bpb |
|---|---:|
| Validation IndoCorpus-v1.0 | 1,0443 |
| IndoEval-heldout-v1 (1.707 documentos) | 1,0625 |
| Held-out Wikipedia (542 documentos) | 1,0972 |
| Held-out FineWeb2 (1.165 documentos) | 1,0487 |

Impacto de la cuantizacion medida con ONNX Runtime CPU sobre un subconjunto de 172 documentos held-out con bpb de referencia 1,07412:

| Artefacto | Tamano (bytes) | Delta bpb vs PyTorch fp32 |
|---|---:|---:|
| `onnx/model_fp16.onnx` | 140.773.783 | -0,000004 |
| `onnx/model_q4.onnx` | 80.930.209 | +0,0046 |

No se han publicado resultados de benchmarks downstream (comprension, razonamiento, sesgo o seguridad) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto fp16 ocupa unos 141 MB y el q4 unos 81 MB en disco; con caches KV para 1.024 tokens y batch 1 el consumo adicional es marginal, por debajo de 1 GB en total en la mayoria de configuraciones.
- GPU recomendadas: el autor entreno el modelo en una NVIDIA L4; para inferencia cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en GPUs integradas.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (CPU, WebGPU y WASM). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. El autor indica que la latencia, la compatibilidad de operadores en navegador y el uso de memoria por dispositivo no se han probado en navegador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables (MMLU, HumanEval, GSM8K) para IndoLM-M-v0.1 ni para alternativas de la misma categoria en la informacion proporcionada. La comparacion se limita a parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---:|---|---|---|
| IndoLM-M-v0.1 | 69.975.680 | 1.024 | id | CC BY-SA 4.0 | ONNX |
| Alternativas de ~70M en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion disponible modelos comparables de tamano y dominio equivalentes con datos publicos verificables.

## Limitaciones y advertencias

- Modelo base no instruido: no sigue instrucciones ni mantiene conversaciones; los tokens de chat existen en el vocabulario pero no fueron entrenados y se enmascaran durante la generacion.
- Alucinacion frecuente: el autor advierte que el modelo inventa hechos, nombres, cifras y noticias, incluidos los referidos a personas e instituciones reales.
- Contenido toxico y spam: el corpus web contiene ruido, boilerplate, spam de apuestas online y traducciones automaticas; no hay filtros de seguridad ni de toxicidad mas alla del filtrado del corpus.
- Contexto muy limitado: 1.024 tokens sin sliding window restringen tareas de documento largo.
- Un unico idioma: entrenado solo en indonesio (`ind_Latn` y Wikipedia id); no se debe esperar calidad en castellano ni en otras lenguas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obligacion de compartir bajo la misma licencia las obras derivadas; es necesario citar el nombre del modelo, al autor, la fuente, el enlace a la licencia y los cambios realizados.
- Sin checkpoint PyTorch ni ONNX fp32/q8: solo se distribuyen fp16 y q4, lo que limita la reproducibilidad exacta del entrenamiento y las comparaciones a nivel de pesos.
- Sin verificacion en navegador: los objetivos WebGPU y WASM no estan probados; no se garantiza que todos los operadores esten soportados.
- Sin evaluacion de sesgo ni seguridad: el autor declara que no existen evaluaciones downstream de comprension, razonamiento, sesgo o seguridad, y que las afirmaciones de calidad mas alla de bpb no estan respaldadas.
- Entrenamiento con una sola semilla: no hay estudios de varianza que respalden la robustez de los resultados.
- No apto para produccion segun el propio autor; el uso previsto es investigacion y demos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trentz/IndoLM-M-v0.1
- Repositorio del proyecto IndoLM (rama del modelo): https://github.com/Trenttzzz/indolm/blob/IndoLM-M-v0.1/docs/model_card_IndoLM-M-v0.1.md
- Perfil del autor en GitHub: https://github.com/Trenttzzz
- Licencia CC BY-SA 4.0 (texto completo): https://creativecommons.org/licenses/by-sa/4.0/
- Dataset Wikipedia en indonesio: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Wikipedia en indonesio (atribucion de articulos): https://id.wikipedia.org/
