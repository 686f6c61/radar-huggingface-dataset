# Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 26B-A4B es un modelo multimodal de tipo image-text-to-text desarrollado por Google (Gemma Team), y esta ficha concreta es una cuantizacion realizada por Xylolabs para su ejecucion en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base emplea una arquitectura Mixture-of-Experts con 26.544 millones de parametros totales y 4B de parametros activos por token (de ahi el sufijo A4B), lo que permite un coste computacional por token muy inferior al de un denso de su mismo tamano.

La version publicada por Xylolabs aplica cuantizacion de bloque en coma flotante (block floating point, BFP8 / `bfloat8_b`) sobre las proyecciones de atencion, MLP y expertos enrutados, manteniendo en bf16 el LM head, los embeddings, las normas y el torre de vision. El resultado es un paquete de 27,513 GB frente a los 50,47 GB en bf16, con una perdida de fidelidad muy contenida: KL medio de 0,00268 frente a bf16 sobre 8.184 posiciones de texto ingles y coreano.

Su relevancia es doble: por un lado demuestra que la cuantizacion BFP8 con GPTQ sobre la rejilla `bfloat8_b` es competitiva frente a esquemas de enteros de 4 bits (Q4_K_M de llama.cpp, con KL de 0,05678), y por otro ofrece una via para desplegar un modelo multimodal de 26B en hardware NPU de Tenstorrent con huella de memoria reducida. Es un checkpoint pretrenado, sin plantilla de chat, orientado a continuacion de texto y a inferencia sobre Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal (image-text-to-text), base google/gemma-4-26B-A4B |
| Parametros totales | 26.544.133.710 (26,54B) |
| Parametros activos | 4B (sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en atencion, MLP y expertos enrutados; bf16 en LM head, embeddings, normas, router y torre de vision. Existe variante BFP4 en repo hermano |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix), repositorio de 53,1 GB con pesos empaquetados de 27,513 GB |
| Tamano del paquete | 27,513 GB (Tensix) frente a 50,47 GB en bf16 |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) |
| Fecha de publicacion | 2026-11-12 (primera release); actualizado 2026-11-22 |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B-A4B es un transformer con capas de mezcla de expertos: dispone de proyecciones de atencion (q, k, o en 30 capas; v en 25 capas), un MLP compartido y un conjunto de expertos enrutados con compuertas gate/up/down, ademas de un router con escala por experto. La componente multimodal se materializa en `embed_vision` y `vision_tower`, que en esta cuantizacion permanecen intactos en bf16. El checkpoint es pretrenado, no afinado para instrucciones, y no incluye plantilla de chat.

La aportacion tecnica de esta ficha no esta en el entrenamiento (heredado del modelo base de Google, descrito en el Gemma 4 Technical Report) sino en el proceso de cuantizacion: Xylolabs aplica GPTQ restringido a la rejilla `bfloat8_b` de Tenstorrent, de modo que cada matriz cuantizada es representable exactamente en el formato de bloque nativo del NPU. El fichero `quant4.json` documenta el formato de cada proyeccion. Las herramientas `pack_tensix.py` y `verify_grid.py` (del repositorio tensix-bfp-gptq, commit 5c52065) permiten verificar la ida y vuelta de cada matriz contra torch y, opcionalmente, contra la DRAM del dispositivo. La validacion se realizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generacion de texto autoregresiva y continuacion de texto (modelo pretrenado, sin modo chat nativo).
- Procesamiento multimodal image-text-to-text: entrada conjunta de imagen y texto gracias a `vision_tower` y `embed_vision` en bf16.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 26B-A4B.
- Capacidad multilingue del modelo base (la evaluacion de cuantizacion cubre ingles y coreano; el listado oficial de idiomas no esta disponible en la informacion proporcionada).
- Ejecucion en aceleradores Tenstorrent Tensix mediante kernels y runner propios (tensix-kernels v0.1.0, tensix-runner v0.1.0).
- Compatibilidad con la API de transformers (`AutoModelForCausalLM`, `AutoTokenizer`) en modo bf16 sobre GPU/CPU convencional para validacion.
- Soporte de tool calling, agentes o modos de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Validacion de pipelines de cuantizacion: sirve como referencia para comprobar que una matriz GPTQ en la rejilla `bfloat8_b` se reconstruye bit a bit tras el empaquetado, usando `verify_grid.py` y `pack_tensix.py` en integracion continua.
- Despliegue en NPU Tenstorrent: permite ejecutar un modelo multimodal de 26B en Wormhole o Blackhole con 27,5 GB de pesos, aproximadamente la mitad de la huella bf16, liberando memoria para el KV cache y los buffers de activaciones.
- Investigacion en formatos de bloque: util para comparar BFP8 frente a esquemas de enteros de 4 bits midiendo KL y top-1 sobre corpus bilingues (WikiText-2 y Wikipedia en coreano).
- Prototipado de asistentes sobre imagen y texto: al conservar la torre de vision en bf16, admite tareas de descripcion de imagenes o respuesta a preguntas visuales siempre que se anada una capa de instrucciones o plantilla de chat.
- Evaluacion de degradacion por cuantizacion: con KL de 0,00268 frente a bf16, es adecuado como checkpoint de referencia para estudiar el impacto de la cuantizacion en tareas downstream sin reentrenar.
- Continuacion de texto a gran escala en entornos con restricciones de memoria: el modelo pretrenado puede emplearse para generacion de documentos o completado de codigo en dispositivos Tensix donde un denso de 26B en bf16 no cabria.
- Docencia y experimentacion con MoE: el desglose por capas en `quant4.json` facilita analizar que proyecciones toleran cuantizacion agresiva y cuales requieren bf16.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son metricas de fidelidad de cuantizacion, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.), que no se han publicado en la informacion disponible.

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B) | 50,47 | 0 | 100 |
| Este modelo (BFP8 Tensix) | 27,513 | 0,00268 | 97,29 |
| Q4_K_M (llama.cpp) | 16,796 | 0,05678 | 89,89 |

Las metricas de KL y top-1 se calculan sobre 8.184 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia, con sha256 `9bca6c7ad6896ffc74a303a1eb1f186d94028d60df88e92bc2b0c4a946605211`.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: 27,513 GB de pesos empaquetados en BFP8 para Tensix; en bf16 sobre GPU convencional, el modelo base ocupa 50,47 GB, por lo que se requiere al menos 48-80 GB de memoria grafica segun el margen para activaciones y KV cache.
- GPU recomendadas (para la ruta transformers en bf16): A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`. En GPUs de 24 GB (RTX 4090) no cabe en bf16 sin offloading o cuantizacion adicional.
- Hardware objetivo nativo: aceleradores Tenstorrent Tensix Wormhole y Blackhole. Existe una variante BFP4 en repo hermano para dispositivos con menos memoria.
- Cabe en consumer GPU: no en bf16 con 24 GB; seria necesario recurrir a cuantizaciones adicionales no incluidas en este repositorio.
- Opciones de despliegue: transformers (bf16, validacion), ttnn 0.81.1 con tensix-runner v0.1.0 sobre Tensix, y el simulador ttsim de Blackhole. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 26,54B totales / 4B activos | no disponible | BFP8, 27,513 GB | Apache-2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-26B-A4B (bf16) | 26,54B totales / 4B activos | no disponible | bf16, 50,47 GB | Apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26,54B totales / 4B activos | no disponible | enteros 4 bits, 16,796 GB | Apache-2.0 (modelo base) | Generado localmente con llama.cpp |
| Variante BFP4 de Xylolabs | 26,54B totales / 4B activos | no disponible | BFP4 | Apache-2.0 | Hugging Face |

La comparativa se limita a variantes del mismo checkpoint, ya que la informacion proporcionada no incluye datos de modelos alternativos de otros desarrolladores. En fidelidad, BFP8 (KL 0,00268) supera claramente a Q4_K_M (KL 0,05678) con un tamano intermedio entre bf16 y la cuantizacion de 4 bits.

## Limitaciones y advertencias

- Es un checkpoint pretrenado: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no debe usarse directamente como asistente conversacional sin un post-entrenamiento adicional.
- La cuantizacion BFP8 introduce una degradacion medible: top-1 del 97,29 % frente al 100 % de bf16 y KL medio de 0,00268, aceptable pero no nula.
- La evaluacion de fidelidad se limita a 8.184 posiciones de texto en ingles y coreano; no cubre tareas multimodales, codigo ni matematicas, por lo que el impacto en vision o razonamiento no esta cuantificado.
- No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible, lo que impide comparar su calidad absoluta con otros modelos.
- El paquete esta optimizado para Tensix y se valido sobre el simulador ttsim; el rendimiento real en silicio Wormhole/Blackhole no se documenta.
- La licencia Apache-2.0 se aplica segun la model card del modelo base, pero el repositorio original de Google no contiene fichero LICENSE; Xylolabs incluye el texto estandar y un NOTICE con los cambios.
- Riesgo de sesgos y alucinacion: no disponible en la informacion proporcionada, aunque son inherentes al modelo base y no se mitigan con la cuantizacion.
- Xylolabs no esta afiliada a Tenstorrent; el soporte de hardware depende de la compatibilidad de ttnn y de los kernels publicados.
- Para dispositivos con menos memoria existe la variante BFP4, con mayor compresion pero presumiblemente mayor perdida de fidelidad (no se publican sus metricas en la informacion disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arxiv:2607.02770
- Gemma 4 Technical Report (Gemma Team, 2026), citado en la model card
