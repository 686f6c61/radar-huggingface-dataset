# zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF

## Resumen

Qwen3.8-Flash-Next E448-IQ2_M-12G32G-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01. Se trata de una compilación pensada específicamente para equipos con una GPU de 12 GB de VRAM y 32 GB de RAM, un objetivo poco habitual en modelos de esta escala. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 161.836.540.800 parámetros totales según los safetensors del repositorio original.

La particularidad de esta ficha es que no nos encontramos ante un modelo nuevo, sino ante un proceso de cuantización agresivo con una receta propia: se conservan 448 de los 512 expertos por capa (eliminando los menos usados), se recuantizan los expertos con LDLQ a partir de pesos en formato NVFP4 y se mezclan tipos de cuantización (IQ4_NL, IQ1_S, IQ2_XXS) para lograr una media de 2,64 bits por peso. El resultado ocupa 67,5 GB y, según el autor, es un 30 % más rápido y 5 GB más pequeño que la referencia UD-IQ1_S de unsloth en el mismo equipo emulado.

Es relevante ahora porque demuestra que un MoE de más de 160.000 millones de parámetros puede ejecutarse en hardware de consumo (una RTX 5090 limitada a 12 GB de VRAM más 32 GB de RAM) con decodificación de 26-56 tok/s, a costa de sacrificar una fracción pequeña de la calidad (KL de 0,339 frente a 0,331 de la referencia). La ficha está marcada como BETA por el propio autor y las mediciones provienen de un único equipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), arquitectura `qwen4exp` en llama.cpp |
| Parámetros totales | 161.836.540.800 (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo del autor con llama.cpp) |
| Tipos de cuantización | Mixta: expertos IQ4_NL 57 %, IQ1_S 28 %, IQ2_XXS 15 % (por bytes); 2,64 bits por peso de media; tabla de embeddings por capa en IQ4_NL; tensores no-expertos en UD-IQ1_S |
| Idiomas soportados | Inglés (en) y japonés (ja) declarados en la model card |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (3 shards, carpeta `L448/`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 512 expertos por capa, del que esta cuantización conserva 448 por capa. La receta de cuantización aplicada por zephel01 incluye tres decisiones técnicas destacables. Primero, cada experto se recuantiza con LDLQ a partir de pesos en formato NVFP4 de NVIDIA, manteniendo el layout propio de la cuantización UD-IQ1_S de unsloth. Segundo, la calibración se realiza con los propios turnos de chat del modelo (181 prompts, 44 de ellos en japonés) más texto mixto, incorporando el japonés tanto en la calibración como en la selección de expertos y en las pruebas. Tercero, la selección de los 448 expertos por capa se basa en el enrutamiento observado sobre texto en japonés, chino, inglés, código, matemáticas y tool-calls; según el autor, los expertos conservados cubren entre el 96,9 % y el 99,1 % de las rutas por dominio en texto reservado.

Los tensores no-expertos (atención, router, experto compartido, embeddings y tabla PLE) se conservan sin cambios respecto a los bytes de UD-IQ1_S de unsloth. La tabla de embeddings por capa (28,8 GB en IQ4_NL) se lee por filas en cada token y no necesita caber en RAM: Abyss la lee del SSD y llama.cpp la mapea. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO, ya que la información proporcionada solo cubre la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de modo thinking (razonamiento previo a la respuesta).
- Razonamiento y matemáticas: el ejemplo de la model card incluye una consulta aritmética simple (`17*23`) con `max_tokens` de 4000.
- Generación de código: el autor reporta pruebas específicas de tareas de programación (3/5 respuestas correctas en el test de uso real con llama.cpp).
- Soporte de tool calling / function calling: la selección de expertos incluye texto de tool-calls en el conjunto de calibración.
- Capacidades multilingües limitadas a inglés y japonés según la model card, aunque la selección de expertos también consideró chino.
- Manejo de contexto largo: el test de aguja en pajar (needle) a 8K tokens fue superado según el autor.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles con OpenAI (el ejemplo usa `/v1/chat/completions`).

## Casos de uso

- Asistente local en japonés e inglés: el modelo se calibró y evaluó específicamente con prompts en japonés (5/5 respuestas no vacías en el test de uso real), lo que lo hace adecuado para atención al usuario bilingüe en un equipo de sobremesa con 12 GB de VRAM.
- Generación de código en estación de trabajo: con tool calling y modo thinking, puede integrarse en un flujo de autocompletado o revisión de código ejecutado íntegramente en local, sin depender de APIs externas.
- Razonamiento matemático y resolución de problemas paso a paso: el modo thinking permite obtener cadenas de razonamiento antes de la respuesta final, útil para tutoría o verificación de cálculos.
- Procesamiento de documentos largos: con 32.768 tokens de contexto configurados y capacidad de encontrar información en posiciones intermedias (test needle a 8K), sirve para resumir o extraer datos de informes extensos.
- Prototipado de agentes multi-paso: la compatibilidad con endpoints estilo OpenAI y el soporte de tool calling permiten montar agentes locales que consulten herramientas sin salir del equipo.
- Inferencia con offload a CPU en equipos modestos: el diseño con `--n-cpu-moe 41` en llama.cpp permite descargar expertos a RAM y mantener el resto en VRAM, habilitando un MoE de 161.000 millones de parámetros en una GPU de 12 GB.
- Evaluación e investigación de técnicas de cuantización: la receta LDLQ con selección de expertos por enrutamiento y calibración multilingüe es un caso de estudio reproducible para quienes investigan compresión de MoE.

## Benchmarks y rendimiento

| Métrica | L448 (este repo) | unsloth UD-IQ1_S (referencia) |
|---|---|---|
| Expertos por capa | 448 / 512 | 512 / 512 |
| Tamaño de descarga | 67,5 GB | 72,5 GB |
| KL (10 secuencias) | 0,339 | 0,331 |
| Mismo token top | 78,5 % | 78,4 % |
| KL en secuencias japonesas | 0,553 | 0,568 |
| Velocidad en tareas de código | 56,0 tok/s | 43,0 tok/s |

Las mediciones se realizaron en un equipo emulado: una RTX 5090 limitada a 12 GB de VRAM con un límite de RAM de 20 GB dentro de un cgroup de 28 GB, usando el motor Abyss. Con llama.cpp y la configuración de ejemplo (`-ngl 99 --n-cpu-moe 41 -c 32768`), el autor reporta 10,9 GB de VRAM, 28 GB de límite de host, decodificación de 26-32 tok/s y procesamiento de prompt de 88 tok/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 10,9 GB con la configuración de llama.cpp del autor (`-ngl 99 --n-cpu-moe 41`); el objetivo declarado es una GPU de 12 GB.
- RAM del sistema: 32 GB según el nombre del repositorio; el autor usó un límite de host de 28 GB y un tier de 20 GB en el equipo emulado.
- GPU recomendadas: RTX 5090 (probada, limitada a 12 GB), y por el perfil de memoria, cualquier GPU consumer con 12 GB o más (RTX 4070, 4080, 5070, etc.) junto con 32 GB de RAM. No hay datos de otras GPU.
- Almacenamiento: 67,5 GB de descarga; se recomienda SSD, ya que la tabla de embeddings por capa se lee del disco en Abyss.
- Opciones de despliegue: Abyss v1.3.106 o superior (recomendado por el autor, con script de instalación) y llama.cpp con la arquitectura `qwen4exp` (commit `ac8e1694d` del 2026-10-29).
- Latencia y throughput: 56,0 tok/s en tareas de código con Abyss en el equipo emulado; 26-32 tok/s de decodificación y 88 tok/s de procesamiento de prompt con llama.cpp.
- Parámetros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next E448-IQ2_M (este repo) | 161,8 B totales (448/512 expertos por capa) | 32.768 (config. del autor) | 67,5 GB | qwen-community-1.0 | 2,64 bits/peso, objetivo 12 GB VRAM + 32 GB RAM |
| Qwen3.8-Flash-Next IQ3_M 16G64G (mismo autor) | 161,8 B totales (512/512 expertos) | no disponible | 86,9 GB | qwen-community-1.0 | Todos los expertos, objetivo 16 GB VRAM + 64 GB RAM |
| Qwen3.8-Flash-Next IQ3_M 24G64G (mismo autor) | 161,8 B totales (512/512 expertos) | no disponible | 93,7 GB | qwen-community-1.0 | Mayor calidad, objetivo 24 GB VRAM + 64 GB RAM |
| unsloth UD-IQ1_S (referencia) | 161,8 B totales (512/512 expertos) | no disponible | 72,5 GB | no disponible | Referencia de calidad y velocidad en la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera de la familia Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- Estado BETA: las mediciones provienen de un único equipo (RTX 5090 limitada a 12 GB con cgroup de 28 GB); el autor solicita reportes de otras GPU y tamaños de RAM.
- Pérdida de calidad por eliminación de expertos: se descartan 64 de 512 expertos por capa; la cobertura de rutas en texto reservado es del 96,9-99,1 %, lo que implica que entre el 0,9 % y el 3,1 % de las rutas quedan fuera de los expertos conservados según el dominio.
- Cuantización muy agresiva (2,64 bits por peso de media, con expertos en IQ1_S e IQ2_XXS): riesgo de degradación en tareas sensibles a precisión, especialmente fuera de los dominios de calibración.
- Idiomas: solo inglés y japonés declarados; el rendimiento en castellano u otros idiomas no está evaluado y podría ser deficiente.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible.
- Licencia qwen-community-1.0: es necesario revisar los términos del modelo base en el enlace de licencia antes de cualquier uso comercial; la model card la etiqueta como `other`.
- Dependencia de versiones concretas: llama.cpp requiere la arquitectura `qwen4exp` (commit del 2026-10-29) y Abyss la versión v1.3.106 o superior; versiones anteriores pueden no cargar el modelo.
- Requiere SSD para un rendimiento aceptable en Abyss, ya que la tabla de embeddings se lee del disco token a token.
- El nombre del repositorio (IQ2_M) no corresponde a una cuantización estándar de llama.cpp: los archivos mezclan varios tipos, por lo que no debe asumirse el comportamiento de un IQ2_M convencional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión 16G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Versión 24G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+12G32G-L448+on+YOUR_GPU
