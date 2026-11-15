# usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated-GGUF

## Resumen

tinybrainbot-53m-a9m-hybrid-instruct-abliterated-GGUF es la conversion a formato GGUF del modelo usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated, un modelo de lenguaje de arquitectura LFM2-MoE (mezcla de expertos) con 53,4 millones de parametros totales y aproximadamente 9 millones de parametros activos por token. Lo desarrolla el usuario independiente usermma y se distribuye bajo licencia Apache 2.0. El modelo base es una variante "abliterated", es decir, con los mecanismos de rechazo eliminados mediante tecnicas de ablation, orientada a generacion conversacional sin restricciones tematicas.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo extremo de eficiencia: un MoE de 32 expertos con enrutamiento top-4 que activa solo una fraccion minima de sus pesos, lo que lo hace ejecutable en hardware muy modesto (CPU, telefonos, dispositivos embebidos). Por otro, el repositorio GGUF ofrece cinco niveles de cuantizacion entre 2 y 16 bits, con tamanos de entre 38 MB y 104 MB, lo que permite desplegarlo practicamente en cualquier entorno con llama.cpp.

El modelo se publico en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-MoE (mezcla de expertos, 32 expertos, enrutamiento top-4) |
| Parametros totales | 53.428.384 |
| Parametros activos | ~9 millones (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |
| Vocabulario | 49.152 tokens, BPE byte-level (pre-tokenizador estilo qwen2, normalizacion NFC) |
| Plantilla de chat | ChatML con `<\|im_start\|>`/`<\|im_end\|>` y etiquetas de thinking, embebida en `tokenizer.chat_template` |
| Tamano del repo | 0,3 GB |
| Herramienta de conversion | llama.cpp `convert_hf_to_gguf.py` + `llama-quantize` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura LFM2-MoE, una variante de mezcla de expertos con 32 expertos y enrutamiento top-4: por cada token se activan cuatro expertos, lo que resulta en aproximadamente 9 millones de parametros activos sobre un total de 53,4 millones. Esta relacion de activacion (alrededor del 17 %) reduce el coste computacional por token de forma notable frente a un modelo denso del mismo tamano, a costa de mantener en memoria todos los pesos. El tokenizador es un BPE byte-level de 49.152 entradas con pre-tokenizador estilo qwen2 y normalizacion NFC.

La model card del repositorio GGUF no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineamiento (RLHF, DPO u otros) ni la tecnica concreta de ablation aplicada para eliminar los rechazos. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La unica informacion tecnica verificable es la conversion a GGUF mediante las herramientas de llama.cpp con soporte para LFM2-MoE, y la inclusion de la plantilla de chat con etiquetas de thinking.

## Capacidades

- Generacion de texto conversacional en formato ChatML con soporte de etiquetas de thinking.
- Razonamiento basico y respuesta a instrucciones, limitado por el reducido numero de parametros activos.
- Comportamiento "abliterated": el modelo no aplica los rechazos tipicos de los modelos alineados, lo que permite generar contenido que otros modelos rechazarian.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, vision, audio ni capacidades multimodales.
- Cobertura multilingue no documentada; el vocabulario de 49.152 tokens es compatible con tokenizadores multilingues, pero no se especifican idiomas.

## Casos de uso

- Prototipado rapido en local: con 45 MB en Q4_K_M, el modelo se carga y ejecuta en segundos con `llama-cli`, lo que permite iterar sobre prompts y plantillas de chat sin infraestructura.
- Experimentacion con arquitecturas MoE: al ser un MoE de 32 expertos con top-4, sirve para estudiar el comportamiento del enrutamiento y la calidad por token en un modelo de juguete ejecutable en CPU.
- Despliegue en dispositivos embebidos y moviles: el tamano de 38-56 MB en Q2_K a Q8_0 permite incluirlo en aplicaciones Android, Raspberry Pi o firmware con memoria limitada para tareas de generacion corta.
- Generacion de texto sin restricciones para investigacion sobre seguridad: la variante abliterated permite estudiar como se comporta un modelo sin mecanismos de rechazo, util en trabajos de red teaming y evaluacion de alineamiento.
- Pruebas de pipelines de inferencia: sirve como modelo de humo para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de pasar a modelos mayores.
- Educacion y demos: su tamano minimo lo hace adecuado para talleres y demostraciones donde se explica el funcionamiento de un transformer MoE y la cuantizacion GGUF en hardware asequible.
- Generacion de respuestas cortas en asistentes de bajo consumo: con `-n 64` y contexto reducido, puede producir respuestas breves en aplicaciones de chat simples donde la latencia y el consumo importan mas que la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; Q2_K ronda los 38 MB de pesos, Q4_K_M los 45 MB, Q8_0 y Q6_K los 56 MB y F16 los 104 MB. A esto hay que sumar el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo esta pensado para ejecutarse en CPU. Una RTX 4090 o A100 lo ejecutarian muy por debajo de su capacidad.
- Cabe en cualquier GPU consumer, incluida una GTX 1050, una iGPU Intel o una GPU integrada de telefonos moviles.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: no disponibles. Por el tamano, se espera una latencia de decenas de milisegundos por token en CPU moderna y throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tinybrainbot-53m-a9m-hybrid-instruct-abliterated | 53,4 M | ~9 M | no disponible | Apache 2.0 | GGUF, safetensors | MoE 32 expertos top-4, abliterated |
| SmolLM2-135M | 135 M | denso | no disponible | Apache 2.0 | safetensors, GGUF | Modelo denso pequeno de Hugging Face |
| Qwen2.5-0.5B | 0,5 B | denso | 32.768 | Apache 2.0 | safetensors, GGUF | Denso, mucho mayor, mas capaz |
| TinyLlama-1.1B | 1,1 B | denso | 2.048 | Apache 2.0 | safetensors, GGUF | Denso, orientado a conversacion |

La comparativa es aproximada: no hay benchmarks publicados de tinybrainbot que permitan una comparacion cuantitativa. Frente a los modelos densos de la tabla, la ventaja de tinybrainbot es su tamano (uno o dos ordenes de magnitud menor) y su naturaleza MoE; la desventaja esperable es una calidad de generacion muy inferior, aunque no medida.

## Limitaciones y advertencias

- Calidad de generacion muy limitada: con 53 M de parametros totales y ~9 M activos, la coherencia, el razonamiento y el conocimiento factual seran muy inferiores a los de modelos densos de 0,5-1 B.
- Riesgo elevado de alucinacion y de texto incoherente en respuestas largas; no apto para produccion sin validacion humana.
- La variante abliterated elimina los rechazos de seguridad, lo que implica riesgo de generar contenido danino, ofensivo o ilegal; su uso debe limitarse a investigacion controlada.
- No hay informacion sobre sesgos, idiomas soportados ni contexto maximo; el comportamiento multilingue es una incognita.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte, y el modelo no tiene traccion ni validacion de la comunidad (0 descargas, 0 likes).
- El tag `lfm2-moe` sugiere una arquitectura poco extendida; la compatibilidad con runtimes distintos de llama.cpp no esta garantizada.
- El formato de chat depende de la plantilla embebida; un uso incorrecto de las etiquetas ChatML o de thinking puede degradar las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated-GGUF
- Modelo base: https://huggingface.co/usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated
- llama.cpp (herramienta de conversion y runtime): https://github.com/ggml-org/llama.cpp
