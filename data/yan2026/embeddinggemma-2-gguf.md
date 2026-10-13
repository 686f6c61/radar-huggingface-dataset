# yan2026/embeddinggemma-2-GGUF

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google (DeepMind) que proyecta texto, codigo, imagenes, video y audio en un espacio vectorial unificado de 768 dimensiones. Segun la documentacion oficial, esta construido sobre la arquitectura Gemma 4 y es un modelo sub-1B (en esta conversion GGUF se reportan 271.002.648 parametros totales), disenado especificamente para generar embeddings de alta calidad en dispositivos locales. Su propuesta de valor es ofrecer capacidad multimodal de extremo a extremo con un coste computacional muy reducido, algo poco habitual en modelos de embeddings de este tipo.

La ficha que nos ocupa, `yan2026/embeddinggemma-2-GGUF`, no es el modelo original de Google, sino una conversion comunitaria a formato GGUF del release `google/embeddinggemma-2`, pensada para su ejecucion en llama.cpp. Incluye tres cuantizaciones del modelo principal (bf16, q8_0 y q4_K_M) y un proyector multimodal separado (mmproj) en bf16 que anade los encoders de vision y audio. La conversion se realizo con `convert_hf_to_gguf.py` a partir del commit `914f7f8` del release oficial.

Es relevante ahora porque permite desplegar un modelo de embeddings multimodal de Google en infraestructura propia mediante llama.cpp, incluyendo un servidor compatible con la API `/v1/embeddings` de OpenAI. Conviene senalar que este repositorio concreto es una conversion de terceros con cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse con la cautela habitual ante artefactos no oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings basado en Gemma 4 (multimodal: texto, codigo, vision, audio, video) |
| Parametros totales | 271.002.648 (aprox. 271 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (sin perdida), q8_0, q4_K_M; proyector multimodal mmproj en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use (el blog de desarrolladores de Google menciona Apache 2.0 para el modelo base; existe discrepancia con la licencia declarada en este repo) |
| Formato de pesos | GGUF (llama.cpp) |
| Dimension del embedding | 768 |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Gemma y, segun la documentacion de Google, se basa en Gemini/Gemma con un diseno de embeddings multimodal nativo: un unico espacio de representacion de 768 dimensiones al que se mapean texto, codigo, imagenes, video y audio. Al tratarse de un modelo de embeddings (no generativo), su salida son vectores, no tokens; en llama.cpp los embeddings se normalizan L2 por defecto, de modo que el producto escalar equivale a la similitud coseno. Esta conversion GGUF expone el modelo principal y, por separado, un proyector multimodal (mmproj) que incorpora los encoders de vision y audio.

La conversion fue realizada por el usuario `yan2026` partiendo del release oficial de Google (`google/embeddinggemma-2`, commit `914f7f8`) mediante `convert_hf_to_gguf.py`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion (RLHF, DPO, etc.); esos datos no aparecen en la model card facilitada. Tampoco se detalla la estrategia de entrenamiento del proyector multimodal.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio de 768 dimensiones.
- Embeddings multimodales de imagen, audio y video, siempre que se cargue el fichero `mmproj` y se use una compilacion de llama.cpp que lo soporte.
- Busqueda semantica y recuperacion (retrieval) mediante similitud coseno.
- Soporte de prefijos de instruccion por tarea para mejorar la calidad: busqueda web/documental, question answering, fact checking y similitud simetrica.
- Servidor compatible con la API `/v1/embeddings` de OpenAI a traves de `llama-server`.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Su funcion es exclusivamente producir representaciones vectoriales.
- El soporte de audio en la via multimodal se describe como experimental en upstream (llama.cpp).

## Casos de uso

- Busqueda semantica en corpus documentales: indexar titulos y contenidos con el prefijo `title: ... | text: ...` y consultar con `task: search result | query: ...`, aprovechando la normalizacion L2 para calcular similitud coseno directamente.
- Sistemas RAG (retrieval-augmented generation): usar el modelo como recuperador de pasajes antes de pasar el contexto a un LLM generativo, con la ventaja de poder ejecutarse en el mismo host sin GPU dedicada.
- Clasificacion y deduplicacion de documentos: comparar embeddings de pares de textos para detectar duplicados o agrupar documentos por similitud en pipelines de datos.
- Busqueda multimodal en archivos de imagen, audio o video: gracias al proyector mmproj, permite consultas de texto contra contenido visual o sonoro en un espacio comun.
- Fact checking automatizado: emplear el prefijo `task: fact checking | query: ...` para recuperar evidencias relevantes frente a una afirmacion dada.
- Question answering extractivo: combinar la recuperacion de pasajes (`task: question answering`) con un modelo de lectura para responder preguntas sobre una base documental.
- Moderacion y filtrado de contenido en tiempo real: al ser un modelo de 271 M, la latencia de embedding es muy baja y permite clasificar grandes volumenes de texto por similitud con patrones de referencia.
- Prototipado en dispositivos de borde o entornos sin GPU: con la cuantizacion q4_K_M (174 MB) el modelo es viable en CPU o en hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto):
  - q4_K_M: aproximadamente 0,2 GB de pesos.
  - q8_0: aproximadamente 0,3 GB de pesos.
  - bf16: aproximadamente 0,53 GB de pesos.
  - A anadir el consumo de contexto/KV y el overhead del runtime.
- Uso multimodal: sumar aproximadamente 0,94 GB del fichero mmproj en bf16 al cargar vision/audio.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM; el modelo cabe holgadamente en RTX 3060/4090, A100, H100, etc. En la practica, tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: llama.cpp (`llama-server`), con endpoint OpenAI-compatible `/v1/embeddings`. Se recomienda una compilacion reciente (2025-10 o posterior, commit `8bb3cf0d2` o mas nuevo) con soporte de EmbeddingGemma 2.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yan2026/embeddinggemma-2-GGUF | 271 M | No disponible | GGUF (bf16, q8_0, q4_K_M) + mmproj | Gemma Terms of Use | Conversion comunitaria; 0 descargas y 0 likes |
| ggml-org/embeddinggemma-2-GGUF | No disponible | No disponible | GGUF | No disponible | Conversion del equipo ggml-org |
| unsloth/embeddinggemma-2-GGUF | No disponible | No disponible | GGUF | No disponible | Conversion de Unsloth |
| google/embeddinggemma-2 (original) | Comprende aprox. 271 M en esta conversion | No disponible | Safetensors (HF) | Segun Google (Gemma Terms of Use; el blog de desarrolladores menciona Apache 2.0) | Modelo base oficial de Google |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion facilitada.

## Limitaciones y advertencias

- Es una conversion de terceros con cero descargas y cero likes: no ha sido validada por la comunidad ni por Google, por lo que su fiabilidad no esta contrastada.
- Discrepancia de licencia: el repositorio declara Gemma Terms of Use, mientras que el blog de desarrolladores de Google describe el modelo como Apache 2.0. Conviene verificar los terminos antes de un uso comercial.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es incorrecta.
- El endpoint `/v1/embeddings` de llama.cpp solo admite texto; para vision y audio hay que cargar el mmproj y usar rutas especificas. El audio se describe como experimental.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto, sesgos conocidos ni tasas de alucinacion. Al ser un modelo de embeddings, no "alucina" texto, pero si puede producir representaciones de baja calidad para dominios fuera de su distribucion de entrenamiento.
- Requiere una version reciente de llama.cpp con soporte de EmbeddingGemma 2; compilaciones antiguas no cargaran el modelo.
- El uso de prefijos de tarea es importante para la calidad: omitirlos puede degradar notablemente los resultados, segun la model card.
- Las fechas del repositorio (2026) y la referencia a "Gemma 4" deben tomarse como datos declarados por el autor; no se han verificado de forma independiente en esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yan2026/embeddinggemma-2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/google/embeddinggemma-2
- Conversion de ggml-org: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Conversion de unsloth: https://huggingface.co/unsloth/embeddinggemma-2-GGUF
- Blog de Google DeepMind sobre EmbeddingGemma 2: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Pagina del modelo en DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Guia para desarrolladores (Google Developers Blog): https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Gemma: https://ai.google.dev/gemma/terms
