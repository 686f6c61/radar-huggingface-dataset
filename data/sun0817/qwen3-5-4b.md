# sun0817/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje causal con codificador visual desarrollado por el equipo Qwen de Alibaba, publicado en Hugging Face bajo el identificador `sun0817/Qwen3.5-4B`. Se trata de un modelo multimodal de tipo image-text-to-text que integra un encoder de visión y un backbone de lenguaje con arquitectura híbrida, combinando Gated DeltaNet (atención lineal) con atención con compuertas (Gated Attention). Con 4.659.865.088 parámetros totales y un contexto nativo de 262.144 tokens, extensible hasta 1.010.000, está orientado a tareas de razonamiento, código, agentes y comprensión visual.

La propuesta central de Qwen3.5 es la fusión temprana de tokens multimodales durante el entrenamiento, lo que permite alcanzar paridad con la generación Qwen3 en tareas de texto y superar a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. El modelo se distribuye en formato safetensors con pesos en precisión completa, compatible con Transformers, vLLM, SGLang y KTransformers, y se publica bajo licencia Apache 2.0.

Su relevancia actual radica en ofrecer capacidades multimodales y de agente en un tamaño de 4B parámetros, lo que lo hace desplegable en hardware de consumo y adecuado para entornos de producción con requisitos de latencia y coste ajustados. El soporte declarado de 201 idiomas y dialectos amplía su aplicabilidad a despliegues internacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention; MoE disperso |
| Parametros totales | 4.659.865.088 (4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precisión completa) |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de 32 capas con un layout de 8 bloques compuestos por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, cada una con su correspondiente FFN. La dimensión oculta es de 2560, con un FFN de dimensión intermedia 9216 y un embedding de tokens de 248.320 (con padding), atado a la salida del LM. Las capas de Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales y escalado de reinforcement learning en entornos multi-agente con distribuciones de tareas progresivamente complejas. La model card menciona una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto, así como infraestructura de RL asíncrona para orquestación de entornos a gran escala. No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text).
- Comprensión visual: el modelo integra un codificador de visión con fusión temprana de tokens.
- Razonamiento, código y matemáticas, con paridad declarada frente a Qwen3 y superación de Qwen3-VL en benchmarks.
- Capacidades de agente y razonamiento multi-paso, con soporte de RL escalado en entornos multi-agente.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Multi-Token Prediction (MTP) para decodificación especulativa y mayor throughput.
- Compatibilidad con tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo thinking: no confirmado explícitamente en la información disponible.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) gracias a su pipeline image-text-to-text y a una ventana de 262.144 tokens que permite mantener historiales largos sin truncar.
- **Análisis de documentos con OCR y razonamiento**: procesamiento de facturas, contratos o informes escaneados combinando el encoder visual con razonamiento sobre el texto extraído, aprovechando el contexto extendido para documentos de muchas páginas.
- **Generación de código en producción**: integración en pipelines de CI/CD para revisión de código, generación de tests y explicación de diffs, con despliegue en vLLM o SGLang para alto throughput.
- **Agentes autónomos multi-paso**: orquestación de tareas que requieren planificación, uso de herramientas y razonamiento encadenado, apoyándose en el entrenamiento con RL en entornos multi-agente.
- **Asistencia visual para accesibilidad**: descripción de imágenes, lectura de pantallas y respuesta a preguntas sobre contenido visual en aplicaciones de asistencia.
- **Despliegue internacional multilingüe**: servicios de traducción, resumen y atención en 201 idiomas y dialectos sin necesidad de modelos específicos por región.
- **Prototipado en hardware de consumo**: al ser un modelo de 4B parámetros, permite iteración local en GPUs de gama alta de consumo antes de escalar a producción.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoría Language, Knowledge & STEM):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80.8 | 74.8 | 82.7 | 80.9 | 82.5 | 79.1 |
| MMLU-Redux | 91.0 | 87.8 | 92.5 | 91.4 | no disponible en el extracto | no disponible en el extracto |

El resto de resultados de benchmarks (código, matemáticas, agentes, visión) no están incluidos en el extracto disponible de la model card; la información proporcionada solo recoge parcialmente la tabla de Language.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en safetensors ocupan 9,3 GB en el repositorio. En precisión completa (BF16) se requieren aproximadamente 9,3 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, entre 12 y 16 GB para contextos moderados.
- **Cuantización**: no se han publicado tipos de cuantización oficiales en la información disponible; sería necesario generar versiones GGUF/AWQ/GPTQ a partir de los pesos safetensors.
- **GPU recomendadas**: A100 40GB, H100 80GB para despliegues de producción con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- **Consumer GPU**: sí cabe en GPUs de consumo de gama alta (RTX 4090, RTX 3090 con 24 GB) en BF16 para contextos moderados; en GPUs de 16 GB requeriría cuantización.
- **Opciones de despliegue**: Transformers, vLLM, SGLang, KTransformers (según la model card).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B | 4B | 262.144 (ext. 1.010.000) | 79.1 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 82.5 | Apache 2.0 (presumible) | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | 80.9 | no disponible | Hugging Face |

Qwen3.5-4B ofrece un equilibrio favorable entre tamaño y rendimiento: supera a GPT-OSS-20B en MMLU-Pro (79.1 frente a 74.8) con una quinta parte de los parámetros, y se queda a 1,8 puntos de Qwen3.5-9B. Frente a Qwen3-30BA3B-Thinking-2507, queda 1,8 puntos por debajo con un tamaño mucho menor.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; como modelo entrenado con datos web a gran escala, es probable que herede sesgos de esos datos.
- **Alucinación**: riesgo inherente a los modelos generativos; no se han publicado tasas de alucinación ni evaluaciones de fidelidad.
- **Contexto e idioma**: aunque se declaran 201 idiomas, el rendimiento por idioma no está desglosado; el rendimiento en idiomas de bajos recursos puede ser inferior.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia original (`https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE`) para confirmar términos.
- **Repositorio no oficial**: el ID `sun0817/Qwen3.5-4B` corresponde a un usuario, no al repositorio oficial de Qwen; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- **Cuantizaciones**: no hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de gama media sin trabajo previo.
- **Datos incompletos**: faltan benchmarks de código, matemáticas, agentes y visión en la información disponible, así como detalles de composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sun0817/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
