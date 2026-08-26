# soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf

## Resumen

El modelo `soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf` es una cuantizacion GGUF de precision mixta del modelo derivado `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, que a su vez parte del modelo oficial de Google `google/gemma-4-31B-it`. Se trata de una version "abliterated" o sin rechazos, disenada para eliminar las respuestas de rechazo del modelo original, y esta optimizada para inferencia local con llama.cpp. El archivo GGUF pesa aproximadamente 13.18 GiB y usa una estrategia de cuantizacion arquitectura-consciente que conserva en mayor precision los tensores de atencion y salida, mientras comprime de forma agresiva los pesos de las redes feed-forward.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo de 31B parametros en hardware de consumo con un consumo de memoria reducido, manteniendo una calidad aceptable en tareas de generacion de texto y razonamiento. El modelo es multilingue con enfasis en japones e ingles, y su licencia Apache-2.0 permite uso comercial. La cuantizacion se realizo con imatrix sobre un corpus bilingue y tecnico, y se ha verificado localmente con generacion en japones. Sin embargo, al ser un derivado "uncensored", presenta riesgos de uso responsable que deben tenerse en cuenta antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 31B (`gemma4`) - transformer denso |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (metadata); uso real limitado por hardware |
| Tipos de cuantizacion | F32, Q6_K, Q5_K, Q4_K, IQ3_S, IQ2_S (precision mixta) |
| Idiomas soportados | japones, ingles, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parametros con 60 capas de texto. Segun la informacion del modelo, Gemma 4 incorpora una arquitectura con atencion global en capas especificas (5, 11, 17, 23, 29, 35, 41, 47, 53 y 59) y atencion deslizante en el resto. Este GGUF de texto no incluye los componentes de vision ni audio del modelo original, que es multimodal en su version completa. La cuantizacion se realizo convirtiendo los pesos BF16 safetensors directamente a BF16 GGUF y luego aplicando una cuantizacion de precision mixta con llama.cpp, usando un corpus de calibracion que incluye WikiText ingles, Wikipedia japonesa, prosa tecnica japonesa y codigo de llama.cpp.

El proceso de cuantizacion se baso en la generacion de una matriz de importancia (imatrix) con 410 entradas, con contexto de calibracion de 512 tokens y batch size de 512. La distribucion de tipos de tensor es la siguiente: 422 tensores F32 (norms y escalares), 31 tensores Q6_K (output y embedding), 50 tensores Q5_K (atencion deslizante), 154 tensores Q4_K (atencion y FFN de capas de borde), 64 tensores IQ3_S y 112 tensores IQ2_S (FFN comprimidos). El modelo es una version "abliterated" del modelo oficial, es decir, se eliminaron los rechazos de seguridad, lo que lo convierte en un modelo sin censura.

## Capacidades

- Generacion de texto fluida en ingles, japones y otros idiomas, con conocimiento general y conversacional.
- Razonamiento logico y matematico basico, aunque la cuantizacion de 3.68 bpw puede degradar la precision en tareas complejas.
- Capacidad de generar codigo y seguir instrucciones de programacion, heredada del modelo base Gemma 4.
- Soporte de chat multi-turno con plantilla de chat especifica de Gemma 4.
- Capacidad de procesar contextos largos hasta 262.144 tokens segun metadata, aunque el uso practico depende de la memoria disponible.
- No incluye vision ni audio en esta version de texto GGUF.
- No se ha confirmado soporte de tool calling ni function calling en esta cuantizacion especifica, aunque el modelo base de Gemma 4 lo soporta.

## Casos de uso

- **Generacion de contenido en japones**: el modelo fue verificado con generacion instructiva japonesa y puede usarse para crear textos, resumenes o contenido conversacional en japones, aprovechando su entrenamiento con Wikipedia japonesa.
- **Asistencia de codigo en entornos locales**: con su capacidad de seguir instrucciones de programacion, puede usarse como autocompletador o asistente de codigo en IDEs, aunque la cuantizacion agresiva puede afectar la calidad del codigo generado.
- **Chatbot sin restricciones para prototipado**: al ser una version "uncensored", puede usarse para experimentar con interacciones sin rechazos de seguridad, aunque no se recomienda para produccion sin control de contenido.
- **Razonamiento con contexto largo**: con hasta 100000 tokens de contexto en la prueba local, puede procesar documentos extensos o conversaciones multi-turno en tareas como resumen de documentos o analisis de texto.
- **Despliegue en hardware de gama media**: con un archivo de 13.2 GiB, puede ejecutarse en GPUs de 16GB VRAM como RTX 5060 Ti o similares, usando llama.cpp con cuantizacion de KV cache.
- **Investigacion de cuantizacion de precision mixta**: el modelo es un ejemplo de cuantizacion arquitectura-consciente que puede ser util para estudiar el impacto de la precision en diferentes tipos de tensores en un modelo de 31B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card solo indica una verificacion local con generacion japonesa, sin datos numericos de evaluacion. El rendimiento reportado en la prueba local es de aproximadamente 19 tokens/segundo con una RTX 5060 Ti 16GB y una RTX 3070 8GB usando llama.cpp con contexto de 100000 tokens y KV cache en q4_0.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 13.18 GiB, por lo que necesita al menos 16 GB de VRAM para cargar los pesos en memoria. Con cuantizacion de KV cache en q4_0, se puede usar con una GPU de 16 GB.
- GPU recomendadas: NVIDIA RTX 5060 Ti 16GB (usada en la prueba), RTX 4080 16GB, o GPUs con 16 GB o mas. Con una GPU de 24 GB se puede usar el modelo sin split de tensores.
- En la prueba se utilizaron dos GPUs: RTX 5060 Ti 16GB y RTX 3070 8GB, con `--tensor-split 2,1` para repartir la carga.
- Despliegue con llama.cpp (`llama-server` o `llama-cli`), compatible con Ollama y otras herramientas que soporten GGUF.
- Latencia estimada: ~19 tokens/segundo en el hardware de la prueba, con contexto de 100k tokens. La velocidad real variara segun la longitud del prompt, el contexto ocupado y el hardware.
- RAM: se recomienda al menos 32 GB de RAM para el sistema y el almacenamiento del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `google/gemma-4-31B-it` | 31B | 262144 tokens | BF16 (original) | Apache-2.0 | Modelo oficial de Google, multimodal |
| `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking` | 31B | 262144 tokens | BF16 | Apache-2.0 | Derivado sin censura del modelo oficial |
| `soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf` | 31B | 262144 tokens (metadata) | GGUF mixto 3.68 bpw | Apache-2.0 | Cuantizacion de precision mixta para llama.cpp |
| `NeuralDreamer/gemma-4-31B-it-heretic-i1-GGUF_ND` | 31B | no disponible | GGUF | Apache-2.0 | Otra cuantizacion GGUF del mismo derivado |

La principal diferencia entre este modelo y el original es la cuantizacion de precision mixta de 3.68 bpw, que reduce el peso de 31B a 13.2 GiB, lo que permite ejecutarlo en hardware de gama media. En comparacion con el modelo oficial, la cuantizacion puede degradar la calidad en tareas complejas, pero mantiene la capacidad de generacion de texto y razonamiento basico. La version NeuralDreamer es otra cuantizacion GGUF del mismo derivado, pero no se tienen detalles de su estrategia de cuantizacion.

## Limitaciones y advertencias

- **Modelo sin censura**: al ser un derivado "abliterated", no tiene filtros de rechazo, lo que puede generar contenido inapropiado, ofensivo o peligroso. Se recomienda no desplegarlo en entornos de produccion sin moderacion de contenido.
- **Degradacion por cuantizacion**: la cuantizacion de 3.68 bpw aplica compresion agresiva a las tensores FFN, lo que puede reducir la precision en tareas de razonamiento complejo, matematicas o codigo.
- **Contexto limitado por hardware**: aunque la metadata indica 262144 tokens, el contexto real esta limitado por la VRAM disponible y la configuracion de KV cache. En la prueba se uso un contexto de 100k tokens.
- **Sin soporte de vision ni audio**: esta variante GGUF es solo texto, no incluye los componentes multimodales del modelo Gemma 4 original.
- **Riesgo de alucinaciones**: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente con la degradacion por cuantizacion.
- **Verificacion limitada**: solo se ha realizado una verificacion local de generacion japonesa, sin benchmarks formales que avalen su calidad en otras tareas.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo derivado sin censura puede tener implicaciones legales o eticas en aplicaciones publicas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf)
- [Modelo base DavidAU](https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking)
- [Modelo original Google](https://huggingface.co/google/gemma-4-31B-it)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Commit de llama.cpp usado](https://github.com/ggml-org/llama.cpp/commit/030ebb558a5820b444a8f836ed5cdd46c9b4bd7a)
- [NVIDIA NIM - Gemma 4 31B IT](https://build.nvidia.com/google/gemma-4-31b-it)
- [Gemma 4 Technical Report](https://arxiv.org/pdf/2607.02770)</think>## Resumen

El modelo `soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf` es una cuantizacion GGUF de precision mixta del derivado `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, que a su vez parte del modelo oficial de Google `google/gemma-4-31B-it`. Se trata de una version "abliterated" o sin rechazos, disenada para eliminar las politicas de rechazo del modelo original, y esta optimizada para inferencia local con llama.cpp. El archivo GGUF pesa aproximadamente 13.2 GiB y emplea una estrategia de cuantizacion arquitectura-consciente que conserva mayor precision en las capas de atencion y salida, mientras comprime de forma agresiva las redes feed-forward.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo de 31B parametros en hardware de gama media, con un consumo de memoria reducido y un rendimiento reportado de unos 19 tokens por segundo en una configuracion con dos GPU. Es una opcion para desarrolladores que necesiten un modelo de texto con contexto largo (262.144 tokens en metadata) y soporte multilingue, especialmente japones e ingles, sin los requisitos de hardware de la version completa de 31B. Sin embargo, al ser un derivado sin censura, presenta riesgos de uso responsable que deben evaluarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 31B (`gemma4`) - transformer denso |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (metadata) |
| Tipos de cuantizacion | F32, Q6_K, Q5_K, Q4_K, IQ3_S, IQ2_S (precision mixta 3.68 bpw) |
| Idiomas soportados | japones, ingles, multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parametros con 60 capas de texto. Gemma 4 incluye una arquitectura con atencion completa en capas especificas (5, 11, 17, 23, 29, 35, 41, 47, 53 y 59) y atencion deslizante en el resto, segun la model card. Este GGUF de texto no incluye los componentes de vision ni audio del modelo original, que es multimodal en su version completa.

La cuantizacion se realizo convirtiendo los pesos BF16 safetensors directamente a GGUF BF16 y aplicando posteriormente una cuantizacion de precision mixta con llama.cpp (commit `030ebb558a5820b444a8f836ed5cdd46c9b4bd7a`). La matriz de importancia (imatrix) se genero con un corpus de calibracion que incluye WikiText ingles, Wikipedia japonesa, prosa tecnica japonesa y codigo de llama.cpp, con 410 entradas de importancia. La distribucion de tensores es: 422 tensores F32 (norms y escalares), 31 tensores Q6_K (output, token embedding y atencion protegida), 50 tensores Q5_K (atencion deslizante), 154 tensores Q4_K (atencion y FFN de capas de borde), 64 tensores IQ3_S y 112 tensores IQ2_S (FFN comprimidos).

El modelo es una version "abliterated" que elimina los rechazos de seguridad del modelo original, por lo que no tiene filtros de contenido. No se ha publicado informacion sobre el proceso de entrenamiento del modelo base (datos de entrenamiento, RLHF, etc.), pero el modelo original Gemma 4 se entrena con un enfoque multimodal y de razonamiento avanzado, segun el informe tecnico de arXiv.

## Capacidades

- Generacion de texto fluida en japones, ingles y otros idiomas, con capacidad conversacional en japones verificada localmente.
- Razonamiento logico y matematico basico, aunque la cuantizacion de 3.68 bpw puede degradar la precision en tareas complejas.
- Generacion de codigo y soporte de instrucciones de programacion, heredado del modelo Gemma 4.
- Soporte de chat multi-turno con la plantilla de chat de Gemma 4.
- Capacidad de procesar contextos de hasta 262.144 tokens en metadata, aunque el uso practico depende de la VRAM disponible.
- No incluye vision ni audio en esta variante de texto GGUF.
- No se confirma soporte de tool calling ni function calling en esta cuantizacion especifica.

## Casos de uso

- **Asistencia de codigo en entornos locales**: el modelo puede integrarse en editores de codigo o pipelines de desarrollo como autocompletador o asistente de programacion, aprovechando su capacidad de seguir instrucciones de codigo. Con llama.cpp se puede desplegar como servidor local en una GPU de 16 GB.
- **Generacion de contenido en japones**: el modelo esta optimizado para japones, por lo que es adecuado para generar articulos, resumenes o contenido conversacional en japones, con la ventaja de un contexto largo para documentos extensos.
- **Chatbot de prototipado sin restricciones**: al ser una version sin censura, puede usarse para experimentar con interacciones sin filtros de contenido, ideal para investigacion de comportamiento de modelos en entornos controlados.
- **Procesamiento de documentos largos**: con un contexto de hasta 100.000 tokens en la prueba local, puede resumir o analizar documentos extensos, como informes tecnicos o actas de reuniones, en una sola pasada.
- **Despliegue en hardware de gama media**: el archivo de 13.2 GiB permite ejecutar el modelo en GPU de 16 GB como RTX 5060 Ti, o en configuraciones de dos GPU con split de tensores, lo que lo hace accesible para desarrollo local.
- **Investigacion de cuantizacion de precision mixta**: el modelo es un caso de estudio de cuantizacion arquitectura-consciente, util para analizar el impacto de la precision loss en diferentes tipos de tensores en un modelo de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica una verificacion local con generacion japonesa, pero no proporciona datos numericos de evaluacion. El rendimiento reportado en la prueba local es de aproximadamente **19 tokens/segundo** con una RTX 5060 Ti 16GB y una RTX 3070 8GB, con contexto de 100.000 tokens y KV cache en q4_0.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF pesa 13.18 GiB, por lo que se necesita al menos 16 GB de VRAM para cargar los pesos en memoria. Con KV cache en q4_0, se puede usar un contexto de hasta 100.000 tokens en una GPU de 16 GB.
- **GPU recomendadas**: NVIDIA RTX 5060 Ti 16GB (usada en la prueba), RTX 4080 16GB, RTX 4090 24GB, o GPUs con 24 GB o mas para contexto completo.
- **Configuracion multi-GPU**: el modelo soporta `--split-mode layer` y `--tensor-split` en llama.cpp, como se muestra en el ejemplo con dos GPUs (5060 Ti 16GB + 3070 8GB).
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`), Ollama, o cualquier herramienta que soporte GGUF.
- **RAM**: se recomienda al menos 32 GB de RAM para el sistema y el almacenamiento del contexto.
- **Latencia**: aproximadamente 19 tokens/s en el hardware de la prueba, con contexto de 100k tokens. La velocidad real depende del prompt, contexto ocupado, y configuracion de cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `google/gemma-4-31B-it` | 31B | 262.144 tokens | BF16 (original) | Apache-2.0 | Modelo oficial de Google, multimodal |
| `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking` | 31B | 262.144 tokens | BF16 | Apache-2.0 | Derivado sin censura del modelo |
| `soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf` | 31B | 262.144 tokens (metadata) | GGUF mixto 3.68 bpw | Apache-2.0 | Cuantizacion de precision mixta para llama.cpp |
| `NeuralDreamer/gemma-4-31B-it-heretic-i1-GGUF_ND` | 31B | no disponible | GGUF | Apache-2.0 | Otra cuantizacion GGUF del mismo modelo |

La principal diferencia con el modelo original es la cuantizacion de 3.68 bpw, que reduce el peso de 31B a 13.2 GiB, permitiendo su ejecucion en hardware de gama media. La version NeuralDreamer es una cuantizacion GGUF alternativa del mismo modelo, pero no se dispone de detalles sobre su estrategia de cuantizacion.

## Limitaciones y advertencias

- **Modelo sin censura**: al ser un derivado "abliterated", no tiene filtros de rechazo de seguridad, lo que puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en produccion sin moderacion de contenido.
- **Degradacion por cuantizacion**: la cuantizacion de 3.68 bpw aplica compresion agresiva a las tensores FFN, lo que puede degradar la precision en tareas de razonamiento complejo, matematicas o codigo.
- **Contexto limitado por hardware**: aunque la metadata indica 262.144 tokens, el contexto real esta limitado por la VRAM disponible y la configuracion de KV cache. En la prueba se uso un contexto de 100.000 tokens.
- **Sin soporte de vision ni tool calling**: esta variante GGUF es solo texto y no incluye los componentes multimodales del modelo Gemma 4 original, ni se confirma el soporte de tool calling.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente con la degradacion por cuantizacion.
- **Verificacion limitada**: solo se verifico localmente con generacion japonesa, sin benchmarks formales para otras tareas.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo sin censura puede tener implicaciones legales o eticas en aplicaciones publicas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/soyaakinohara/gemma-4-31b-it-heretic-3.68bpw-14gb.gguf)
- [Modelo base - DavidAU](https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking)
- [Modelo original - Google](https://huggingface.co/google/gemma-4-31B-it)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Commit de llama.cpp usado](https://github.com/ggml-org/llama.cpp/commit/030ebb558a5820b444a8f836ed5cdd46c9b4bd7a)
- [NVIDIA NIM - Gemma 4 31B IT](https://build.nvidia.com/google/gemma-4-31b-it)
- [Gemma 4 Technical Report](https://arxiv.org/pdf/2607.02770)
