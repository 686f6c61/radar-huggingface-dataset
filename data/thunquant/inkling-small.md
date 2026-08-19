# thunquant/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, que acepta texto, imagen y audio como entrada y genera texto como salida. Se trata de un transformer autoregresivo con arquitectura de Mezcla de Expertos (MoE) dispersa: 276 mil millones de parámetros totales según la model card oficial, de los cuales 12 mil millones están activos por token, lo que permite un rendimiento elevado con un coste computacional contenido. El modelo está pensado para desarrolladores que construyen aplicaciones con IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación.

La relevancia de Inkling-Small radica en que combina multimodalidad nativa (imagen y audio), razonamiento con esfuerzo de pensamiento variable y una ventana de contexto de hasta un millón de tokens, todo ello con pesos abiertos bajo licencia Apache 2.0. Esto lo convierte en una opción atractiva para equipos que necesitan un modelo potente, desplegable localmente y sin restricciones de uso comercial. La arquitectura MoE con solo 12 mil millones de parámetros activos reduce la latencia y el coste de inferencia frente a modelos densos de tamaño comparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE (256 expertos, 6 activos por token, 2 expertos compartidos) y atencion hibrida local/global |
| Parametros totales | 276 mil millones (segun model card oficial); 265.956.439.090 (~266 mil millones) en los pesos de este repositorio |
| Parametros activos | 12 mil millones |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Ingles y capacidades multilingues generales |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only con una estructura de Mezcla de Expertos (MoE) en el bloque feed-forward. Cada token se enruta a 6 de los 256 expertos disponibles, mas 2 expertos compartidos que se activan en todas las tokens, lo que da un total de 12 mil millones de parametros activos. La atencion es hibrida: alterna capas de atencion local y global, lo que reduce el coste computacional en secuencias largas. El modelo es nativamente multimodal: las imagenes se procesan mediante un codificador de parches jerarquico y el audio mediante tokens discretos, y ambas modalidades se proyectan a un espacio oculto compartido con el texto antes de entrar en el decoder.

Los datos de entrenamiento provienen de fuentes publicamente disponibles, adquisiciones a terceros y datos sinteticos o aumentados, e incluyen texto, imagenes, audio y video. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad o reforzar objetivos de seguridad. No se especifica el numero total de tokens de entrenamiento ni se mencionan tecnicas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general en ingles y otros idiomas.
- Entrada multimodal nativa: texto, imagen y audio (WAV a 16 kHz).
- Razonamiento multimodal, incluyendo analisis de imagenes y audio dentro de un mismo contexto.
- Esfuerzo de pensamiento variable (variable thinking effort), que permite ajustar la cantidad de tokens de razonamiento segun la tarea.
- Soporte para sistemas agenciales y tool-use, segun la model card oficial.
- Instruccion-following y conversacion multi-turno.
- Generacion de codigo en multiples lenguajes.
- Compatible con bibliotecas de despliegue como SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace.

## Casos de uso

- Asistentes de codigo en produccion: gracias a su capacidad de razonamiento y a su soporte de tool calling, se puede integrar en pipelines de desarrollo para generar, revisar y depurar codigo en multiples lenguajes, con una ventana de contexto amplia para incluir repositorios completos.
- Sistemas de atencion al cliente multimodales: el modelo puede gestionar conversaciones multi-turno que incluyen imagenes (capturas de pantalla, fotos de productos) y audio (mensajes de voz), gracias a su entrada nativa multimodal y su contexto largo de 1M tokens.
- Agentes autonomos de proposito general: su diseno para sistemas agencia y tool-use permite construir agentes que planifican y ejecutan tareas en varios pasos, integrando informacion visual y auditiva en tiempo real.
- Generacion aumentada por recuperacion (RAG) sobre documentos extensos: la ventana de contexto de hasta 1M tokens permite incluir documentos completos o grandes fragmentos de bases de conocimiento en la consulta, mejorando la precision de las respuestas.
- Analisis de imagenes en entornos de produccion: el codificador de parches jerarquico permite procesar imagenes de hasta 4096 px por dimension, util para inspeccion visual en fabricacion, diagnostico asistido por imagen o revision de documentos escaneados.
- Procesamiento de audio en aplicaciones de transcripcion y analisis: el modelo acepta audio WAV de hasta 2 minutos por muestra y puede transcribir, resumir o extraer informacion de grabaciones, integrandose en flujos de trabajo de reuniones o soporte.
- Investigacion y fine-tuning: al ser de codigo abierto con licencia Apache 2.0, se puede ajustar para dominios especificos (legal, medico, finanzas) y desplegar en infraestructura propia.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de evaluaciones comparativas con modelos de pesos abiertos y cerrados, entre los que se citan Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Sin embargo, los valores numericos de dicha tabla no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16, el modelo ocupa aproximadamente 531.9 GB (tamano del repositorio), por lo que se requiere una configuracion multi-GPU de datacenter, por ejemplo 4 o 8 GPUs con 80-100 GB de VRAM cada una.
- Con cuantizacion NVFP4 (4 bits), el peso se reduce a aproximadamente un cuarto, unos 133 GB, lo que permite ejecutar el modelo en 2-4 GPUs de 80 GB (por ejemplo, A100 o H100) o en un nodo con memoria unificada.
- No es viable en GPUs de consumo (RTX 4090, 24 GB) ni en entornos de una sola GPU de 48 GB sin cuantizacion extrema adicional no documentada.
- Despliegue soportado: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Latencia y throughput: no se han publicado datos concretos de latencia o tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Inkling-Small | 276B | 12B | 1M | Imagen, audio, texto | Apache 2.0 |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card del autor indica que Inkling-Small se evaluo frente a los modelos anteriores, pero no se proporcionan los valores de la comparativa en la informacion disponible. No se dispone de datos publicos detallados de los modelos alternativos en esta ficha.

## Limitaciones y advertencias

- Sesgos: los datos de entrenamiento provienen de fuentes publicas de internet y de terceros, por lo que el modelo puede reflejar sesgos presentes en esos datos. La curacion incluye filtrado de seguridad, pero no elimina todos los sesgos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en contextos de larga distancia o con instrucciones ambiguas.
- Limitaciones de entrada: el audio se limita a WAV a 16 kHz y se recomienda que no exceda los 2 minutos por muestra; las imagenes fuera del rango de 40-4096 px por dimension pueden degradar el rendimiento.
- Coste de inferencia: aunque los parametros activos son solo 12B, el modelo completo tiene 276B parametros, por lo que la memoria y el ancho de banda requeridos son elevados y pueden no ser asumibles para equipos pequenos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero Thinking Machines Lab publica una politica de uso aceptable (Acceptable Use Policy) que debe revisarse antes de desplegar el modelo en produccion.
- Soporte de idiomas: el modelo esta optimizado para ingles; el rendimiento en otros idiomas es general pero puede degradarse en tareas complejas.
- No se dispone de informacion sobre tecnicas de alineacion especificas (RLHF/DPO) ni sobre el numero de tokens de entrenamiento, lo que dificulta evaluar su comportamiento de seguridad en detalle.

## Enlaces

- Repositorio de Hugging Face (thunquant/Inkling-Small): https://huggingface.co/thunquant/Inkling-Small
- Model card oficial de Thinking Machines Lab: https://thinkingmachines.ai/model-card/inkling-small/
- Noticia de lanzamiento oficial: https://thinkingmachines.ai/news/inkling-small/
- Playground de prueba: https://tinker.thinkingmachines.ai/playground
- Repositorio de recetas (Tinker Cookbook): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de despliegue con vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de despliegue con TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de despliegue con Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre el modelo: https://hf.co/blog/thinkingmachines-inkling
