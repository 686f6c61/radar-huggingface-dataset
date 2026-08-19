# thunquant/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, el laboratorio fundado por Mira Murati. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0.

El modelo emplea una arquitectura transformer decoder-only con un backbone feed-forward de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en cada token, lo que da un total de 975.000 millones de parámetros con solo 41.000 millones activos por token. La atención es híbrida, combinando capas locales y globales. Es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador de parches jerárquico, y el audio mediante codificación discreta de tokens, con todas las modalidades proyectadas a un espacio oculto compartido y procesadas conjuntamente por el decodificador.

La relevancia actual de Inkling radica en que es el primer modelo de Thinking Machines Lab, una compañía fundada por Mira Murati, y su apuesta por un equilibrio entre rendimiento y eficiencia mediante un control ajustable del esfuerzo de razonamiento. Aunque no es el modelo más fuerte disponible, destaca por su versatilidad y por estar disponible para despliegue local con herramientas como SGLang, vLLM o Unsloth.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa, atención híbrida local/global, codificador de parches para visión y tokens discretos para audio |
| Parametros totales | 975.000 millones (952.377.623.626 en safetensors) |
| Parametros activos | 41.000 millones (6 de 256 expertos + 2 compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformador autoregresivo decoder-only con una arquitectura de mezcla de expertos (MoE) dispersa. El backbone feed-forward está compuesto por 256 expertos, de los cuales se activan 6 por token, más 2 expertos compartidos que se activan siempre. Esto permite un coste computacional relativamente bajo en comparación con un modelo denso del mismo tamaño total. La atención es híbrida: se alternan capas de atención local (con ventanas restringidas) y capas de atención global, lo que reduce el coste de atención en secuencias largas.

Para el procesamiento multimodal, las imágenes y vídeos se codifican mediante un codificador de parches jerárquico, que divide la imagen en parches de resolución variable y los procesa en varios niveles. El audio se codifica mediante tokens discretos (tipo tokenización de audio). Todas las modalidades se proyectan a un espacio oculto compartido y se procesan de forma conjunta por el decodificador. El modelo acepta imágenes de entre 40 y 4096 píxeles por dimensión y audio WAV a 16 kHz, con una duración ideal inferior a 20 minutos.

Los datos de entrenamiento provienen de fuentes públicas, datos adquiridos a terceros y datos sintéticos o aumentados. Se aplicaron procesos de limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y mejorar la seguridad. La card no especifica el número total de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: respuestas en inglés y otras lenguas, con capacidad de instrucción y conversación.
- Entrada multimodal: texto (UTF-8), imágenes (píxeles de 40 a 4096 por dimensión) y audio (WAV a 16 kHz, hasta 20 minutos recomendado).
- Codificación y razonamiento sobre código en múltiples lenguajes de programación.
- Capacidades agénticas y de uso de herramientas (tool calling) para sistemas de agentes y RAG.
- Soporte para control de esfuerzo de razonamiento (effort=0.99 reportado en evaluaciones), que permite ajustar el nivel de pensamiento.
- Compatible con librerías de despliegue como SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face.
- No se especifica si el modelo tiene un modo de "thinking" explícito, pero los resultados de evaluación con effort alto indican que sí puede razonar de forma extendida.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (no se especifica la longitud máxima, pero la arquitectura híbrida de atención permite secuencias largas) y puede integrarse en sistemas de ticket y CRM.
- **Asistente de codificación en producción**: soporta tool calling y puede conectarse a repositorios, APIs y pipelines de CI/CD para generar, revisar y corregir código.
- **Análisis de documentos multimodales**: procesa imágenes (capturas de pantalla, diagramas, documentos escaneados) junto con texto para extraer información y responder preguntas.
- **Sistemas de RAG (retrieval-augmented generation)**: integrable en pipelines de recuperación de documentos para respuestas contextualizadas.
- **Transcripción y análisis de audio**: acepta audio WAV de hasta 20 minutos, lo que permite transcribir y analizar conversaciones o notas de voz.
- **Aplicaciones educativas**: puede generar explicaciones, resolver problemas matemáticos (AIME 2026: 97,1%) y responder preguntas científicas (GPQA Diamond: 87,2%).
- **Desarrollo de agentes autónomos**: con capacidades agénticas y de tool calling, puede planificar y ejecutar tareas de múltiples pasos, como la resolución de issues en GitHub (SWEBench Verified: 77,6%).

## Benchmarks y rendimiento

La tabla de evaluación de la card proporciona resultados para Inkling (con effort=0.99) comparados con otros modelos. No se incluyen todos los valores, pero se muestran los siguientes:

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro | Claude Fable 5 | GPT 5.6 Sol |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% | 54.2% | 80.0% | – |

Se observa que Inkling supera a Nemotron 3 Ultra en todos los benchmarks mostrados y es competitivo con Kimi K2.5, aunque por debajo de los modelos cerrados más avanzados como Claude Fable 5 o GPT 5.6 Sol. Los datos completos de la tabla no se han incluido en la información proporcionada.

## Requisitos de hardware

- El tamaño total del modelo es de 975 B parámetros, pero solo se activan 41 B por token. Para inferencia en BF16, se necesitan aproximadamente 1909 GB de memoria (tamaño del repositorio), lo que requiere múltiples GPUs de alta gama (por ejemplo, 8× H100 80GB o 16× A100 80GB).
- Existe una versión NVFP4 (cuantización de 4 bits) que reduce los requisitos de memoria de forma significativa, aunque no se especifica el tamaño exacto en la card. Se recomienda para despliegue en clústeres con menos VRAM.
- No es viable en GPUs de consumo (RTX 4090, etc.) a menos que se use una cuantización extrema (por ejemplo, GGUF de 2-3 bits), pero no se mencionan formatos GGUF en la documentación.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers. También hay acceso a través de proveedores de inferencia de terceros.
- Latencia y throughput: no se proporcionan cifras concretas. Dado que es un modelo MoE con 41 B activos, el throughput dependerá del hardware y la configuración; con vLLM se espera una latencia razonable para aplicaciones interactivas, pero no hay datos oficiales.

## Comparativa con modelos similares

La tabla de benchmarks ya ofrece una comparación con otros modelos de la misma categoría (tamaño y propósito). Los modelos comparables son:

- **Nemotron 3 Ultra** (open weights): 975 B totales, 41 B activos, arquitectura similar (MoE). Inkling lo supera en todos los benchmarks mostrados.
- **Kimi K2.5** (open weights): también MoE, con rendimiento similar en algunos benchmarks (HLE text 29.4% vs 29.7%, SWEBench 76.8% vs 77.6%). Inkling es ligeramente superior en estos casos.
- **DeepSeek V4 Pro** (open weights): con 35.9% en HLE text y 80.6% en SWEBench Verified, supera a Inkling en estos benchmarks.

No se dispone de datos detallados de parámetros, contexto o licencias de estos modelos comparados en la información proporcionada, por lo que la comparación se limita a los resultados de evaluación.

## Limitaciones y advertencias

- No se especifica la longitud máxima de contexto en la card; para aplicaciones de producción se requiere verificar esta limitación.
- El modelo está optimizado para inglés, y aunque tiene capacidades multilingües generales, no se garantiza el mismo rendimiento en otros idiomas.
- La card no detalla sesgos concretos, pero como todo modelo entrenado con datos públicos, puede presentar sesgos de género, raza o cultura presentes en los datos.
- Riesgo de alucinación en hechos y números, especialmente en tareas de razonamiento complejo; se recomienda verificación externa.
- La licencia Apache 2.0 permite uso comercial, pero hay una política de uso aceptable (Acceptable Use Policy) que debe revisarse.
- El modelo no es el más fuerte del mercado en todos los benchmarks; para tareas críticas que requieran el máximo rendimiento, puede ser necesario evaluar modelos cerrados de última generación.
- El tamaño del repositorio (1909 GB) implica una descarga masiva y recursos de almacenamiento considerables.

## Enlaces

- [Hugging Face: thunquant/Inkling](https://huggingface.co/thunquant/Inkling)
- [Hugging Face: thinkingmachines/Inkling (BF16)](https://huggingface.co/thinkingmachines/Inkling)
- [Hugging Face: thinkingmachines/Inkling-NVFP4](https://huggingface.co/thinkingmachines/Inkling-NVFP4)
- [Playground de Tinker](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Blog de Thinking Machines: Introducing Inkling](https://thinkingmachines.ai/news/introducing-inkling/)
- [Página oficial de Inkling](https://thinkingmachines.ai/inkling/)
- [Receta de SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling)
- [Receta de vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling)
- [Receta de TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#Inkling)
- [Receta de Unsloth](https://unsloth.ai/docs/models/inkling)
- [Blog de Hugging Face: thinkingmachines-inkling](https://hf.co/blog/thinkingmachines-inkling)
