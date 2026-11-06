# sujitvasanth/Nanbeige4.2-3B-MNN-Q4-HQQ-B64

## Resumen

Nanbeige4.2-3B-MNN-Q4-HQQ-B64 es una conversión al runtime MNN del modelo Nanbeige/Nanbeige4.2-3B, un transformer de 3B parámetros desarrollado por Nanbeige y publicado bajo licencia Apache-2.0. Esta versión concreta, mantenida por el usuario sujitvasanth, cuantiza los pesos a 4 bits mediante HQQ (Half-Quadratic Quantization) con tamaño de bloque 64 y los empaqueta en el formato propietario de MNN (llm.mnn + llm.mnn.weight), pensado para inferencia en CPU en dispositivos de borde y escritorio.

La particularidad del modelo base es su arquitectura *looped*: 22 capas decoder de tipo Llama (RMSNorm, atención GQA con 48 cabezas de consulta y 8 de clave/valor, MLP SwiGLU y RoPE) que se ejecutan dos veces por token con cachés KV independientes. Esto duplica el cómputo efectivo (44 capas lógicas) sin duplicar los pesos físicos, lo que da al modelo una profundidad efectiva mayor a coste de velocidad.

Es relevante ahora porque demuestra que es posible llevar arquitecturas no estándar (looped transformers) a runtimes de inferencia móvil como MNN, que no las soporta de serie. La conversión requiere parches en el exportador y en el runtime de MNN para compartir pesos entre las dos pasadas, reduciendo el uso de RAM de 4,66 GB a 2,82 GB en pruebas en Windows sobre CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama con bucle (looped transformer), 22 capas físicas ejecutadas 2 veces (44 capas lógicas) |
| Parámetros totales | 3B (modelo base); pesos cuantizados a 4 bits en este repo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits HQQ, block size 64 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight), embeddings en bf16 (embeddings_bf16.bin), tokenizer en formato mtok |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.2-3B emplea una arquitectura de transformer decoder con 22 capas estándar de Llama: RMSNorm para normalización, atención con grouped-query attention (48 cabezas de consulta, 8 de clave/valor), MLP con activación SwiGLU y embeddings posicionales rotatorios (RoPE). La innovación estructural es el bucle: cada token atraviesa las 22 capas dos veces (`num_loops: 2`), con una normalización final tras cada pasada y una caché KV separada para la segunda. El flujo es `embed → capas 0–21 → norm → capas 0–21 (KV cache propia) → norm → lm_head`.

Esta conversión a MNN requirió modificar el exportador y el runtime de MNN. En el exportador se registra la arquitectura `nanbeige` con el mapeo de pesos de Llama y se desenrolla el grafo en 44 capas lógicas, donde las capas 22–43 son envoltorios nuevos sobre los mismos módulos lineales de las capas 0–21. El conversor escribe cada lineal compartido una sola vez en `llm.mnn.weight`, de modo que el archivo pesa unos 2 GB en lugar de unos 4 GB. En el runtime, al cargar una convolución cuyo offset de pesos externos ya está cargado, se crea con `onClone()` para mantener los pesos empaquetados una sola vez en RAM (MNN imprime `Weight sharing: 154 convolutions reuse already loaded weights`). No se modificaron kernels. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento en modo *thinking*: el modelo base soporta un bloque `<think>`, aunque en esta conversión está desactivado por defecto mediante una plantilla simplificada que fuerza una respuesta directa.
- Conversación multi-turno (chat template simplificado incluido en `llm_config.json`).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito más allá del modo thinking.
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.

## Casos de uso

- Inferencia en CPU en dispositivos de escritorio o borde: el modelo corre en MNN sobre CPU con un pico de RAM de 2,82 GB, adecuado para portátiles sin GPU dedicada o mini-PC. Es el escenario principal para el que se publicó esta conversión.
- Aplicaciones móviles o embebidas con MNN: al usar el runtime de Alibaba MNN, puede integrarse en apps Android/iOS o sistemas embebidos que ya empleen este motor, siempre que se compile MNN con los parches de compartición de pesos descritos.
- Prototipado de chat local sin conexión: con la plantilla simplificada y el modo thinking desactivado, ofrece respuestas directas con latencia moderada (~7 tok/s en decodificación en CPU Windows), suficiente para asistentes de texto no interactivos en tiempo real.
- Experimentación con arquitecturas looped: sirve como banco de pruebas para estudiar el comportamiento de transformers con bucles en entornos de recursos limitados, comparando calidad frente a modelos de 3B convencionales.
- Traducción y generación bilingüe inglés-chino: el modelo base está entrenado en ambos idiomas, por lo que puede emplearse en tareas de generación o reescritura de texto en esos pares de idiomas.
- Evaluación de cuantización HQQ en runtime MNN: útil para investigadores que quieran medir el impacto de HQQ a 4 bits con bloque 64 en calidad y velocidad frente a otras cuantizaciones (GGUF Q4, AWQ, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento medidos por el autor son de inferencia en Windows sobre CPU con MNN compilado desde fuente:

| Métrica | Antes del parche de runtime | Con compartición de pesos |
|---|---|---|
| RAM pico | 4,66 GB | 2,82 GB |
| Prefill | ~19 tok/s | ~19 tok/s |
| Decode | ~7,3 tok/s | ~7,1 tok/s |

El autor señala que la decodificación es aproximadamente la mitad de rápida que un modelo 3B convencional, porque cada token atraviesa 44 capas.

## Requisitos de hardware

- VRAM/RAM estimada: 2,82 GB de RAM pico en CPU (medido en Windows) con la compartición de pesos activa; sin ella, 4,66 GB. El repositorio ocupa 3,1 GB en disco.
- GPU recomendadas: no aplica de forma nativa; esta conversión está pensada para CPU vía MNN. No se documenta soporte GPU en la información disponible.
- ¿Cabe en GPU de consumo? No se documenta; el objetivo es CPU. En cualquier caso, el tamaño de pesos (~2 GB en 4 bits) cabría en GPUs con 4 GB o más de VRAM si se portara a otro runtime, pero no es el caso de uso de este repo.
- Opciones de despliegue: MNN (obligatorio, y con los parches de exportador y runtime descritos; no funciona correctamente en MNN estándar). El modelo base puede desplegarse con llama.cpp, que soporta la arquitectura `nanbeige`, o con transformers.
- Latencia y throughput: ~19 tok/s en prefill y ~7 tok/s en decode sobre CPU Windows, según medición del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-MNN-Q4-HQQ-B64 (este repo) | 3B (22 capas × 2 bucles) | no disponible | MNN 4-bit HQQ | Apache-2.0 | Requiere MNN parcheado; CPU; ~7 tok/s decode |
| Nanbeige/Nanbeige4.2-3B (base) | 3B | no disponible | safetensors | Apache-2.0 | Pesos originales en bf16/fp; requiere transformers o llama.cpp |
| Llama 3.2 3B | 3B | 128K (según model card pública) | safetensors, GGUF | Llama 3.2 Community License | Arquitectura estándar, sin bucle; ecosistema amplio |
| Qwen2.5-3B | 3B | 32K (según model card pública) | safetensors, GGUF | Apache-2.0 | Multilingüe amplio; sin bucle |

La comparación de rendimiento cualitativo no está disponible porque no se han publicado benchmarks del modelo base ni de esta conversión en la información proporcionada.

## Limitaciones y advertencias

- No funciona en MNN estándar: el autor advierte explícitamente que la conversión requiere cambios en el exportador y el runtime de MNN. En una build estándar el modelo puede cargar pero usará aproximadamente el doble de RAM.
- Modo thinking desactivado por defecto: la plantilla incluida fuerza un bloque `<think>` vacío, por lo que el modelo responde sin razonamiento. Para activarlo hay que editar la plantilla en `llm_config.json`.
- Idiomas limitados a inglés y chino; no se documenta soporte de español ni de otros idiomas.
- Longitud de contexto no documentada en la información disponible; no se puede garantizar un contexto largo.
- Riesgo de alucinación inherente a modelos de 3B, especialmente en tareas de conocimiento factual y matemáticas.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado en en/zh, es probable que refleje sesgos de esos corpus, pero no hay evidencia publicada en la ficha.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un MNN parcheado añade coste de mantenimiento en producción.
- Rendimiento de decodificación reducido (~7 tok/s en CPU) por el doble paso por las capas; no apto para aplicaciones interactivas de baja latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sujitvasanth/Nanbeige4.2-3B-MNN-Q4-HQQ-B64
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Runtime MNN: https://github.com/alibaba/MNN
