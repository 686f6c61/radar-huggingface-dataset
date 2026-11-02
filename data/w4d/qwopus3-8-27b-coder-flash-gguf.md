# W4D/Qwopus3.8-27B-Coder-Flash-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-GGUF es la distribucion en formato GGUF del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo de lenguaje orientado a generacion de codigo y razonamiento con soporte de vision, construido sobre la arquitectura Qwen3.5. El modelo original cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y emplea una arquitectura hibrida de atencion que combina capas de atencion lineal con atencion completa cada cuarta capa, lo que reduce de forma notable el coste del KV cache en contextos largos.

Esta publicacion, realizada por el usuario W4D, no es un modelo nuevo sino una conversion y cuantizacion del checkpoint original a GGUF para su uso con llama.cpp. Su relevancia practica radica en que permite ejecutar un modelo de 27B con capacidades de codigo, razonamiento, tool calling y vision en hardware de consumo, ofreciendo cuantizaciones desde BF16 sin perdida hasta IQ2_M de 3,00 BPW, todas derivadas directamente de la conversion BF16 y no de recuantizaciones de menor precision.

El modelo esta publicado bajo licencia Apache 2.0, soporta ingles y chino, y esta pensado para tareas de generacion de codigo, razonamiento multi-paso y uso como agente con herramientas. La disponibilidad de un fichero `mmproj` separado permite anadir entrada de imagen a cualquier cuantizacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida tipo Qwen3.5 (atencion lineal + atencion completa cada 4 capas) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de uso de llama.cpp; longitud maxima nativa no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q3_K_S, Q2_K, IQ2_M; vision encoder en mmproj BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5, descrita en la model card como hibrida de atencion lineal y atencion completa, aplicando atencion completa cada cuarta capa. Esta eleccion reduce el tamano del KV cache a aproximadamente 64 KiB por token, lo que abarata el uso de contextos largos en comparacion con un transformer de atencion completa pura. El checkpoint incorpora una cabeza de prediccion multi-token (MTP), conservada en los GGUF como `blk.64` pero no conectada al grafo de texto de llama.cpp, y reservada para un futuro soporte de decodificacion especulativa.

La conversion fue realizada con `convert_hf_to_gguf.py` de llama.cpp master (commit `4e910a8`, 2 de noviembre de 2026) y las herramientas de cuantizacion de la build `b11960` (CUDA 13.4, Windows x64). Todas las cuantizaciones se generaron directamente desde la conversion BF16 sin perdida, nunca por recuantizacion de una precision inferior. Las cuantizaciones de Q4_K_M e inferiores emplean una importance matrix (imatrix) calculada con `llama-imatrix` a partir del modelo Q8_0, con contexto 512, sobre un corpus de calibracion de 2,3 MB de codigo y documentacion C/C++/CUDA/Python muestreado del repositorio de llama.cpp. En IQ2_M, los pesos de las 8 capas MTP (`blk.64.*`) se fijan a Q4_K porque la calibracion de la imatrix no cubre la capa de prediccion multi-token. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo original.

## Capacidades

- Generacion de texto y codigo en ingles y chino, con orientacion explicita a code-generation segun los tags del modelo.
- Razonamiento multi-paso y modo de pensamiento (reasoning), indicado en los tags del repositorio.
- Tool calling y function calling, con compatibilidad con endpoints (tag `endpoints_compatible`).
- Uso como agente en flujos multi-paso gracias al soporte de herramientas y al contexto extendido.
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`), con entrada de imagen mediante el fichero `mmproj` BF16 compatible con todas las cuantizaciones.
- Conversacion multi-turno (tag `conversational`).
- Capacidades multilingues limitadas a ingles y chino.

## Casos de uso

- Asistente de programacion en local: con la cuantizacion Q4_K_M (15,66 GiB) el modelo puede generar y revisar codigo en C/C++/CUDA/Python en una estacion de trabajo con una sola GPU de 24 GB, sin depender de APIs externas.
- Agente de refactorizacion en pipelines de CI/CD: el soporte de tool calling y el contexto de 32.768 tokens permiten analizar varios ficheros, invocar herramientas de compilacion o tests y proponer parches dentro del mismo flujo.
- Revision de codigo asistida por imagen: usando el `mmproj` junto con la cuantizacion elegida, el modelo puede recibir capturas de diagramas de arquitectura, errores de compilacion o interfaces y generar explicaciones o codigo a partir de ellas.
- Generacion de documentacion tecnica bilingue (en/zh): adecuado para equipos que mantienen documentacion en ingles y chino, con contexto suficiente para procesar modulos completos.
- Despliegue de servidor compatible con OpenAI: mediante `llama-server` con `--mmproj`, se puede exponer el modelo como endpoint local para integrarlo en herramientas que ya consumen la API de OpenAI.
- Prototipado de agentes de razonamiento sobre hardware de consumo: con IQ4_XS (14,26 GiB) o Q4_K_S (14,74 GiB) el modelo cabe en GPUs de 16-24 GB, permitiendo experimentar con razonamiento multi-paso y tool use sin infraestructura de datacenter.
- Analisis de repositorios de codigo de gran tamano: el KV cache reducido de la arquitectura hibrida (unos 64 KiB por token) hace viable procesar contextos largos con menor presion de memoria que un transformer de atencion completa equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: BF16 requiere aproximadamente 51 GiB (25,99 + 24,91 GiB en dos partes); Q8_0 unos 27,05 GiB; Q6_K unos 20,89 GiB; Q5_K_M unos 18,19 GiB; Q4_K_M unos 15,66 GiB; IQ4_XS unos 14,26 GiB; Q3_K_M unos 12,57 GiB; Q2_K unos 10,12 GiB; IQ2_M unos 9,54 GiB. Hay que sumar el fichero `mmproj` BF16 (0,87 GiB) si se usa vision y el espacio del KV cache.
- GPUs recomendadas: A100 80 GB o H100 para BF16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) para Q5_K_M, Q4_K_M, Q4_K_S e IQ4_XS con margen para contexto.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB con IQ4_XS o Q3_K_M; en GPUs de 12 GB con Q2_K o IQ2_M, asumiendo perdida de calidad notable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para vision, `llama-server` con API compatible con OpenAI), y cualquier frontend basado en llama.cpp como Ollama o LM Studio. vLLM y TGI no estan indicados en la informacion disponible para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El KV cache de aproximadamente 64 KiB por token reduce el coste de memoria en contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash (este) | 27,3B | 32.768 en ejemplos; maximo nativo no disponible | Apache 2.0 | GGUF (12 cuantizaciones + mmproj) | Vision, tool calling, arquitectura hibrida Qwen3.5 |
| Modelo base Jackrong/Qwopus3.8-27B-Coder-Flash | 27,3B | no disponible | Apache 2.0 | safetensors BF16 | Referencia sin cuantizar del que deriva esta publicacion |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Las cuantizaciones Q3_K_M e inferiores presentan, segun la propia model card, perdida de calidad perceptible; Q3_K_S, Q2_K e IQ2_M acumulan perdida significativa o extrema.
- La cabeza MTP (`blk.64`) no esta conectada al grafo de texto de llama.cpp, por lo que la decodificacion especulativa no esta disponible actualmente.
- El soporte de vision requiere descargar y cargar el fichero `mmproj` BF16 adicional; sin el, el modelo funciona solo con texto.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene verificar las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash.
- El fichero BF16 esta dividido en dos partes; es necesario descargar ambas y apuntar llama.cpp a la parte `-00001-of-00002`.
- No hay datos publicados de benchmarks que permitan estimar la calidad real frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/W4D/Qwopus3.8-27B-Coder-Flash-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- llama.cpp (herramientas de conversion y cuantizacion): https://github.com/ggml-org/llama.cpp
