# thinkingmachines/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es la versión cuantizada en formato NVFP4 (4 bits) del modelo multimodal Inkling-Small, desarrollado por Thinking Machines Lab. Se trata de un transformer autoregresivo de tipo Mixture-of-Experts (MoE) con 276 mil millones de parámetros totales y 12 mil millones activos por token, diseñado para procesar texto, imagen y audio de forma nativa y generar respuestas de texto. La cuantización NVFP4 reduce el tamaño del checkpoint a aproximadamente 156 mil millones de parámetros (según el conteo de safetensors) y permite su despliegue con requisitos de VRAM más bajos que la versión BF16 original.

El modelo destaca por su razonamiento nativo sobre múltiples modalidades, un contexto de hasta 1 millón de tokens y un mecanismo de "esfuerzo de pensamiento" variable que permite ajustar el tiempo de razonamiento según la tarea. Está pensado para desarrolladores que construyen asistentes conversacionales, sistemas agénticos con tool calling, asistentes de codificación y aplicaciones de generación aumentada por recuperación (RAG). Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva frente a modelos propietarios de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (42 capas, 256 expertos, 6 activos + 2 compartidos) |
| Parametros totales | 276B (modelo base); 156B en el checkpoint NVFP4 segun safetensors |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens (segun anuncio oficial) |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Ingles y capacidades multilingues generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una arquitectura MoE dispersa en la capa feed-forward. Cada token se enruta a 6 de los 256 expertos disponibles, más 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida: combina capas de atención local y global para equilibrar eficiencia y capacidad de modelado de dependencias de largo alcance. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador de parches jerárquico y el audio mediante tokens discretos, y todas las modalidades se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen contenido público de internet, datos adquiridos de terceros y datos sintéticos, abarcando texto, imágenes, audio y vídeo. El proceso de curado incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o inseguro. No se especifica si se utilizaron técnicas de RLHF o DPO; la información disponible solo menciona el preentrenamiento y el ajuste con datos curados. El modelo se entrenó en sistemas NVIDIA GB300 NVL72.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto, imagen y audio, y produce respuestas de texto.
- Razonamiento nativo sobre imagenes y audio: puede analizar contenido visual y auditivo sin necesidad de adaptadores externos.
- Esfuerzo de pensamiento variable: permite configurar el tiempo de razonamiento (thinking mode) segun la complejidad de la tarea.
- Soporte de tool calling y sistemas agénticos: la model card lo recomienda para construir agentes con uso de herramientas.
- Capacidades multilingues: aunque esta optimizado para ingles, mantiene un rendimiento general en otros idiomas.
- Adecuado para RAG: su ventana de contexto de hasta 1M tokens permite incorporar grandes volumenes de documentos externos.
- Compatible con multiples librerias de inferencia: SGLang, vLLM, TokenSpeed, Unsloth y transformers.

## Casos de uso

- Asistentes de codificacion en produccion: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y depurar codigo en multiples lenguajes, aprovechando su soporte de tool calling para ejecutar comandos o consultar repositorios.
- Atencion al cliente multimodal: gestiona conversaciones multi-turno que incluyen capturas de pantalla, imagenes de productos o mensajes de voz, gracias a su capacidad de procesar imagen y audio junto con texto.
- Analisis de documentos con imagenes y tablas: extrae informacion de PDFs escaneados, graficos o diagramas, y responde preguntas sobre su contenido con razonamiento de largo contexto.
- Transcripcion y comprension de audio: procesa grabaciones de hasta 2 minutos en formato WAV de 16kHz para generar resumenes, extraer acciones o responder preguntas sobre el contenido hablado.
- Agentes autonomos con planificacion multi-paso: su capacidad de razonamiento variable y tool calling permite construir agentes que descomponen tareas complejas, consultan APIs y ejecutan acciones de forma secuencial.
- Sistemas RAG a gran escala: con 1M tokens de contexto, puede indexar y consultar grandes corpus de documentacion tecnica o legal, ofreciendo respuestas fundamentadas sin necesidad de fragmentacion excesiva.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativas con modelos de pesos abiertos y cerrados, entre ellos Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Sin embargo, los valores numericos de dicha tabla no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 166 GB para el checkpoint NVFP4, segun LLM Explorer.
- GPU recomendadas: no cabe en GPUs de consumo; se requieren GPUs de datacenter como NVIDIA A100 80GB (minimo 2), H100 80GB (minimo 2) o H200.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers (Hugging Face).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la configuracion de decodificacion.

## Comparativa con modelos similares

La model card compara Inkling-Small con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero no se proporcionan los valores de los benchmarks en la informacion disponible. No se dispone de datos suficientes para elaborar una comparativa cuantitativa detallada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos publicos de internet, el modelo puede reflejar sesgos presentes en dichos datos, aunque se aplicaron filtros de seguridad y calidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: esta optimizado para ingles; el rendimiento en otros idiomas puede ser inferior.
- Restricciones de audio: el audio debe estar en formato WAV a 16kHz y con una duracion ideal inferior a 2 minutos; duraciones mayores pueden degradar el rendimiento.
- Requisitos de hardware: el tamaño del modelo (incluso cuantizado) exige infraestructura de datacenter, lo que limita su uso en entornos con recursos reducidos.
- Politica de uso aceptable: Thinking Machines publica una politica de uso aceptable que los desarrolladores deben revisar antes de integrar el modelo en productos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Model card oficial de Thinking Machines: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de lanzamiento: https://thinkingmachines.ai/news/inkling-small/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Repositorio Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
