# stgallenquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto, imagen y audio, y genera salidas de texto. Con 276.000 millones de parámetros totales (12.000 millones activos), emplea una arquitectura de mezcla de expertos (MoE) que lo sitúa en la categoría de los grandes modelos abiertos, pero con un coste de inferencia relativamente bajo gracias a su diseño de activación dispersa. El modelo se publica con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, ajuste fino e integración en productos de terceros.

La relevancia de Inkling-Small radica en su naturaleza nativamente multimodal: un único decoder procesa texto, imágenes y audio en un espacio oculto compartido, lo que simplifica el despliegue de sistemas que requieren varias modalidades sin necesidad de encadenar modelos especializados. Su ventana de contexto no se especifica en la documentación disponible, pero su arquitectura de 42 capas con atención híbrida local-global está diseñada para manejar secuencias largas de forma eficiente. Está pensado para desarrolladores que construyen aplicaciones con IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con MoE sparse (42 capas, 256 expertos, 6 activos por token + 2 compartidos) |
| Parametros totales | 276B (pesos safetensors: 265.956.439.090) |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Ingles y capacidades multilingues generales (no se detallan idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, NVFP4) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autoregresivo decoder-only de 42 capas con una espina dorsal feed-forward de mezcla de expertos dispersa. Cada token se enruta a 6 de los 256 expertos disponibles, más 2 expertos compartidos que se activan en todos los tokens, lo que da un total de 12.000 millones de parámetros activos por token. La atención combina capas locales y globales en un esquema híbrido, lo que permite capturar dependencias de corto y largo alcance sin el coste cuadrático completo de la atención global en todas las capas.

El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador de parches jerárquico y el audio mediante codificación discreta de tokens. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo procedentes de fuentes públicas, datos adquiridos de terceros y datos sintéticos generados o aumentados. El proceso de curación incluye deduplicación, filtrado de contenido de baja calidad y ajustes orientados a seguridad. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: acepta combinaciones de texto, imagen y audio como entrada y produce respuestas textuales.
- Razonamiento e instruccion: apto para conversacion general, seguimiento de instrucciones y tareas de razonamiento multi-paso.
- Generacion de codigo: soporta multiples lenguajes de programacion, aunque no se detallan metricas especificas.
- Sistemas agénticos y tool use: disenado para integracion en aplicaciones con llamada a herramientas y flujos de trabajo agénticos.
- Multilingue: capacidades generales en otros idiomas ademas del ingles, sin lista exhaustiva.
- Procesamiento de audio: acepta audio WAV a 16 kHz, con longitud recomendada inferior a 2 minutos.
- Procesamiento de imagen: acepta imagenes de 40 px a 4096 px por dimension, apto para capturas, diagramas y fotografias.
- Despliegue local: compatible con SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en entornos de desarrollo (IDE) o pipelines de CI/CD para generar, revisar y explicar codigo. Su soporte de tool calling permite conectarlo a repositorios, ejecutores de tests y sistemas de integracion continua.

- Chatbot multimodal de atencion al cliente: al aceptar imagenes y audio ademas de texto, puede procesar capturas de pantalla de errores, fotos de productos o mensajes de voz del usuario, y generar respuestas contextualizadas en varios idiomas.

- Sistema de documentacion automatica: a partir de capturas de pantalla de interfaces, diagramas o grabaciones de audio de reuniones, el modelo puede generar documentacion tecnica, actas o resumenes estructurados.

- Agente de automatizacion de tareas: gracias a su arquitectura MoE con 12B activos y su capacidad de razonamiento multi-paso, puede orquestar flujos agénticos que combinan lectura de documentos (imagenes o texto) con llamadas a APIs y generacion de informes.

- Analisis de contenido multimedia: procesamiento de imagenes medicas o tecnicas con descripcion textual, transcripcion y resumen de audio, o extraccion de informacion de capturas de pantalla para bases de conocimiento.

- Investigacion y prototipado rapido: al ser de pesos abiertos con licencia Apache 2.0, permite a equipos de investigacion ajustar el modelo para dominios especificos (legal, medico, financiero) sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la informacion disponible. La model card del autor incluye una tabla de evaluaciones comparativa con modelos como Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los datos numericos no estan accesibles en el material proporcionado. Se recomienda consultar la pagina oficial del modelo en thinkingmachines.ai para obtener las puntuaciones detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 276B parametros en BF16 se requieren aproximadamente 552 GB de VRAM. Con cuantizacion NVFP4 (4 bits) se reduce a unos 138 GB. No cabe en una unica GPU de consumo.
- GPU recomendadas: para despliegue completo en BF16 se necesitan multiples GPU de datacenter (por ejemplo, 8x H100 80GB o 8x A100 80GB). Con NVFP4, 2x H100 o 2x A100 podrian ser suficientes.
- En consumer GPU: no es viable en una sola GPU de gama de consumo (RTX 4090 tiene 24 GB). Con cuantizacion agresiva (GGUF de 4 bits) y offloading a CPU, podria ejecutarse en sistemas con 128 GB de RAM, pero con latencia muy alta.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers. Tambien hay acceso por API a traves de proveedores de inferencia de terceros.
- Latencia y throughput: no se han publicado cifras oficiales. Dado que solo se activan 12B parametros por token, se espera un throughput significativamente mayor que un modelo denso de 276B, pero menor que un modelo denso de 12B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Modalidades | Licencia | Contexto |
|---|---|---|---|---|---|
| Inkling-Small | 276B | 12B | texto, imagen, audio | Apache 2.0 | no disponible |
| Qwen3.5 397B-A17B | 397B | 17B | texto (presumiblemente) | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | texto | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | texto | no disponible | no disponible |

Los modelos de comparacion (Qwen3.5, DeepSeek V4 Flash, MiMo V2.5, Minimax M2.7) se citan en la model card del autor como referencias de evaluacion, pero no se dispone de datos detallados de parametros, licencias o contexto para establecer una comparativa completa. Inkling-Small destaca por su naturaleza multimodal nativa y su licencia permisiva, mientras que los competidores cerrados (Minimax, DeepSeek) pueden ofrecer mayor rendimiento en tareas especificas pero con restricciones de uso.

## Limitaciones y advertencias

- La documentacion no especifica la longitud de contexto soportada, un dato critico para aplicaciones de produccion con documentos largos o conversaciones extendidas.
- El entrenamiento incluye datos de fuentes publicas y de terceros, por lo que el modelo puede reflejar sesgos presentes en esos datos. No se detallan evaluaciones de sesgo ni mitigaciones especificas.
- Riesgo de alucinacion: como cualquier modelo autoregresivo, puede generar contenido falso o inventado, especialmente en tareas factuales. Se recomienda validacion externa en aplicaciones criticas.
- El audio se limita a WAV a 16 kHz y se recomienda que las muestras no superen los 2 minutos, lo que restringe su uso en transcripcion de audio largo.
- Las imagenes fuera del rango de 40-4096 px por dimension pueden degradar el rendimiento; se requiere preprocesamiento para casos extremos.
- La discrepancia entre los 276B declarados en la model card y los 265.956.439.090 parametros en los pesos safetensors sugiere que parte de los parametros (posiblemente el codificador de vision o audio) no se incluye en el checkpoint principal, lo que debe tenerse en cuenta al calcular requisitos de memoria.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se publica con una politica de uso aceptable (Acceptable Use Policy) que debe revisarse antes de desplegarlo en entornos sensibles.

## Enlaces

- Model card de HuggingFace: https://huggingface.co/stgallenquants/Inkling-Small
- Model card oficial de Thinking Machines Lab: https://thinkingmachines.ai/model-card/inkling-small/
- Pagina del producto Inkling: https://thinkingmachines.ai/inkling/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repo de ejemplos): https://github.com/thinking-machines-lab/tinker-cookbook
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
