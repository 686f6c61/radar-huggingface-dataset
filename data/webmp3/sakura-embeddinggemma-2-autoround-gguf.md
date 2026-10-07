# webmp3/Sakura-EmbeddingGemma-2-AutoRound-GGUF

## Resumen

Sakura-EmbeddingGemma-2-AutoRound-GGUF es una version cuantizada del modelo de embeddings google/embeddinggemma-2, publicada por el usuario webmp3 (Sakura). Se trata de un modelo de representaciones densas (text embeddings) de aproximadamente 271 millones de parametros, convertido a formato GGUF mediante cuantizacion Q4_0 generada con Intel AutoRound v0.5.2, una tecnica de ajuste de pesos por descenso de gradiente de signo (SignRound) en lugar del redondeo post-hoc clasico de llama-quantize.

El modelo resuelve tareas de recuperacion semantica, similitud de frases y extraccion de caracteristicas sobre texto en ingles y otros idiomas, con soporte nativo de representaciones Matryoshka (MRL): el mismo vector puede truncarse a 768, 512, 256 o 128 dimensiones segun el equilibrio deseado entre precision y coste de almacenamiento. Esto resulta relevante para indexado vectorial a gran escala, sistemas RAG y busqueda semantica en produccion.

La publicacion incluye una evaluacion empirica de fidelidad frente al modelo original en BF16 sobre 300 elementos de prueba, con metricas de coseno medio, correlacion de Spearman y capacidad de recuperacion. El checkpoint es unicamente de texto (backbone de ~271M de parametros) y requiere una version reciente de llama.cpp que incluya la PR #30054 para reconocer la arquitectura `gemma-embedding2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma-embedding2` (transformer encoder, 24 bloques, 413 tensores) |
| Parametros totales | 271.002.648 (~271M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (218 tensores), Q6_K (capa `output.weight`), F32 (194 tensores de normalizacion y escalado) |
| Idiomas soportados | en, multilingual |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); existe release complementaria en Safetensors W4A16 |
| Dimension de salida | 768 dimensiones nativas; Matryoshka a 768, 512, 256 y 128 d |
| Tamano del repo | 0,2 GB |
| Tamano del archivo | 160,79 MB (168.595.552 bytes) |
| Checksum SHA256 | `9e9702166102a929f90374e1e7205d96b9b000507397523f60d11322ffc6313f` |
| Commit del snapshot base | `914f7f89142e33e77833254d9c9b90c3cef7303b` |
| Commit llama.cpp verificado | `51ce9c11a6f2dfa895696c0048c4333e8953b728` (incluye PR #30054) |

## Arquitectura y entrenamiento

La arquitectura subyacente es `gemma-embedding2`, un transformer encoder derivado de la familia Gemma orientado a embeddings. El modelo base google/embeddinggemma-2 incluye, segun la PR #30054 de llama.cpp, rutas de texto, vision y audio; sin embargo, esta release GGUF concreta contiene unicamente el backbone de texto (~271M de parametros, 413 tensores). La estructura comprende 24 bloques transformer con capas de atencion (`attn_q`, `attn_k`, `attn_v`, `attn_output`), capas feed-forward (`ffn_gate`, `ffn_up`, `ffn_down`), capas `inp_gate` y `proj`, ademas de normalizaciones RMSNorm y escalas de salida por capa.

La innovacion tecnica principal de esta publicacion es el proceso de cuantizacion. En lugar de usar `llama-quantize` sobre pesos ya entrenados, se aplico Intel AutoRound v0.5.2 con `SignRoundConfig`: 50 iteraciones de ajuste por bloque y 64 muestras de calibracion con seqlen=128. Los factores de escala optimizados se transfirieron directamente a los bloques GGML Q4_0 mediante `ggml_quant`. Los 218 tensores cuantizados a Q4_0 incluyen las 216 capas lineales de los 24 bloques, el `token_embd.weight` y el `per_layer_model_proj.weight` (proyeccion Per-Layer Embedding). La capa `output.weight` (cabeza de salida de 768d) se conserva en Q6_K, y los 194 tensores de normalizacion y escalado permanecen en F32.

La conversion se realizo con una version limpia de llama.cpp que incorpora la PR #30054, sin parches de arquitectura personalizados ni remapeos ad-hoc de tensores.

## Capacidades

- Generacion de embeddings de texto para similitud de frases (`sentence-similarity`) y extraccion de caracteristicas (`feature-extraction`).
- Soporte nativo de Matryoshka Representation Learning (MRL): truncado del vector a 768, 512, 256 o 128 dimensiones.
- Recuperacion semantica de texto (documentos, consultas) y de codigo (fragmentos y consultas de codigo), segun la evaluacion del autor.
- Capacidades multilingues (etiquetas `en` y `multilingual`).
- Compatible con endpoints: se puede servir mediante `llama-server --embedding` y consumir por API compatible con OpenAI o por el endpoint nativo `/embedding`.
- No realiza generacion de texto, razonamiento generativo, tool calling ni function calling; es un modelo exclusivamente de embeddings.
- La release GGUF no incluye las torres de vision ni de audio presentes en la arquitectura upstream (estan preservadas en la release W4A16 en Safetensors, no en este GGUF).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y guias como vectores de 256 o 512 dimensiones para reducir el almacenamiento, manteniendo un 100% de Recall@5 medido en la evaluacion del autor.
- Sistemas RAG sobre bases de conocimiento internas: generar embeddings de fragmentos y consultas en ingles o multilingue, con la capa de salida de 768d para maxima fidelidad respecto al modelo original.
- Deduplicacion y agrupacion de contenidos: calcular similitud coseno entre articulos, tickets o correos para detectar duplicados; la correlacion de Spearman de 0,9742 en 768d indica que el ordenamiento por similitud se preserva tras la cuantizacion.
- Recuperacion de codigo en asistentes de desarrollo: indexar repositorios y devolver fragmentos relevantes; segun los datos del autor, el 100% de Recall@5 en codigo se mantiene en las cuatro dimensiones Matryoshka.
- Clasificacion y clustering de texto: usar los embeddings como caracteristicas de entrada para clasificadores posteriores (spam, tematizacion, enrutado de soporte).
- Despliegue en entornos con recursos limitados: al ocupar 160,79 MB en disco y ~271M de parametros, puede ejecutarse en CPU o en GPU de gama baja para servicios de embeddings de alto volumen.
- Filtrado previo en pipelines de recomendacion: precalcular embeddings de candidatos y consultas para una primera fase de recuperacion sobre grandes catalogos con vectores truncados a 128d.
- Evaluacion de similitud en investigacion NLP: usar el modelo como extractor de caracteristicas en experimentos de recuperacion, con la opcion de comparar contra el backbone BF16 de referencia.

## Benchmarks y rendimiento

Datos de fidelidad publicados por el autor, medidos sobre 300 elementos de prueba (100 consultas de texto, 100 documentos de texto, 50 consultas de codigo, 50 fragmentos de codigo) frente al original en BF16:

| Dimension | Coseno medio | Coseno minimo | Spearman | Text Top-5 agree | Text Recall@5 | Code Top-5 agree | Code Recall@5 |
|---|---|---|---|---|---|---|---|
| 768d (nativa) | 0,9863 | 0,9582 | 0,9742 | 86,20% | 100,0% | 82,80% | 100,0% |
| 512d | 0,9866 | 0,9575 | 0,9744 | 85,60% | 100,0% | 82,80% | 100,0% |
| 256d | 0,9878 | 0,9614 | 0,9763 | 85,00% | 100,0% | 85,20% | 100,0% |
| 128d | 0,9913 | 0,9699 | 0,9760 | 80,20% | 100,0% | 80,00% | 100,0% |

Comparativa lado a lado publicada por el autor:

| Modelo | Formato / ambito | Tamano en disco | Coseno medio (768d) | Spearman (768d) | Text Top-5 agree | Text Recall@5 |
|---|---|---|---|---|---|---|
| BF16 Text Reference | Ruta de texto (BF16) | ~542 MB | 1,0000 | 1,0000 | 100,0% | 100,0% |
| Sakura AutoRound Q4_0 GGUF (este modelo) | Embedding de texto (Q4_0) | 160,8 MB | 0,9863 | 0,9742 | 86,20% | 100,0% |
| Unsloth Community Baseline | Embedding de texto (UD-Q4_K_XL) | 167,5 MB | 0,9935 | 0,9876 | 89,60% | 100,0% |
| Sakura AutoRound W4A16 | Checkpoint multimodal completo (Safetensors) | 1.236 MB | 0,9878 | 0,9781 | 87,60% | 100,0% |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima, el archivo GGUF pesa 160,79 MB y el modelo tiene ~271M de parametros; el consumo sera del orden de unos pocos cientos de MB contando buffers de contexto.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso en iGPU o CPU.
- GPU profesionales (A100, H100) no son necesarias para este modelo; se usarian solo en escenarios de altisimo throughput o indexado masivo por lotes.
- Opciones de despliegue: llama.cpp (obligatorio un build con PR #30054, commit `4fbc76d` o posterior), `llama-server` con el flag `--embedding`, y servidores compatibles que consuman GGUF.
- Se puede exponer como endpoint compatible con OpenAI o mediante el endpoint nativo `/embedding` en el puerto configurado (ejemplo del autor: puerto 8080).
- Aviso de compatibilidad: builds antiguos de llama.cpp devuelven `unknown model architecture: 'gemma-embedding2'`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coseno medio (768d) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Sakura-EmbeddingGemma-2-AutoRound-GGUF (este) | ~271M | no disponible | 0,9863 | gemma | GGUF Q4_0, 160,8 MB |
| Unsloth Community Baseline (embeddinggemma-2 UD-Q4_K_XL) | ~271M (base) | no disponible | 0,9935 | gemma | GGUF, 167,5 MB |
| Sakura AutoRound W4A16 (multimodal) | ~271M backbone de texto + torres vision/audio | no disponible | 0,9878 | gemma | Safetensors, 1.236 MB |
| BF16 Text Reference | ~271M | no disponible | 1,0000 | gemma | BF16, ~542 MB |

La comparativa se limita a variantes de cuantizacion del mismo modelo base; no se dispone de datos de otros modelos de embeddings de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de embeddings: no genera texto, no razona de forma generativa ni soporta tool calling o function calling.
- La cuantizacion Q4_0 introduce perdida de fidelidad frente al BF16: el coseno medio en 768d es 0,9863 y la coincidencia exacta del Top-5 de texto baja al 86,20%, aunque el Recall@5 se mantiene en el 100% en las pruebas del autor.
- Frente al baseline comunitario Unsloth (UD-Q4_K_XL), este modelo presenta una fidelidad ligeramente inferior (coseno 0,9863 frente a 0,9935 y Top-5 86,20% frente a 89,60%) segun los datos del propio autor.
- La release GGUF solo cubre la ruta de texto; no incluye vision ni audio, a pesar de que la arquitectura upstream los soporte.
- No se ha especificado la longitud de contexto soportada, dato relevante para indexar documentos largos.
- La evaluacion de fidelidad se realizo sobre 300 elementos y dimensiones MRL; no sustituye a una evaluacion estandar tipo MTEB.
- Licencia `gemma`: el uso comercial esta sujeto a los Terminos de Uso de Gemma de Google, que imponen obligaciones de atribucion y restricciones de uso. Conviene revisarlos antes de un despliegue en produccion.
- Riesgo de sesgos y de alucinacion en la similitud: al ser un modelo de representaciones, puede heredar sesgos del corpus de entrenamiento del modelo base y producir agrupaciones semanticas sesgadas.
- Requiere obligatoriamente un build reciente de llama.cpp (PR #30054); versiones antiguas no cargan la arquitectura.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/webmp3/Sakura-EmbeddingGemma-2-AutoRound-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Release complementaria en Safetensors (W4A16 multimodal): https://huggingface.co/webmp3/Sakura-EmbeddingGemma-2-AutoRound
- PR de llama.cpp con soporte de la arquitectura: PR #30054 (`model: support embeddinggemma2 (text+vision+audio)`), commit `4fbc76d` o posterior
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Intel AutoRound: no se ha proporcionado enlace en la informacion disponible
