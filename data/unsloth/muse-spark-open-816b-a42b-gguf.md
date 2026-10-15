# unsloth/Muse-Spark-Open-816B-A42B-GGUF

## Resumen

Muse Spark Open es un modelo de lenguaje multimodal de Meta Superintelligence Labs, publicado en octubre de 2026. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 816.000 millones de parametros totales y 42.000 millones de parametros activos por token, disenado especificamente para tareas de codigo y flujos de trabajo agenticos. Incorpora de forma nativa un codificador de percepcion (Perception Encoder) que le permite procesar texto, imagen, video y audio como entrada, generando unicamente texto como salida.

El modelo destaca por su ventana de contexto de 1 millon de tokens en inferencia, su vocabulario de 202.048 entradas y un enrutado de 256 expertos con 8 activos por token. La version aqui descrita es la cuantizacion GGUF publicada por Unsloth (esquema Unsloth Dynamic 3.0), que facilita su despliegue en frameworks de inferencia locales y servidores, aunque los requisitos de hardware siguen siendo muy elevados por el tamano del modelo.

La relevancia actual de este lanzamiento radica en que combina un contexto extremadamente largo, capacidades multimodales y un modo de razonamiento configurable (reasoning effort) en pesos abiertos bajo la licencia Muse Model License, lo que lo posiciona como una alternativa para agentes autonomos y generacion de codigo a gran escala. No obstante, el modelo exige infraestructura de gama muy alta: la propia model card indica un minimo de 700 GB de VRAM en NVFP4 y 2 TB en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Perception Encoder multimodal |
| Parametros totales | 816B (819.991.575.808 segun safetensors del modelo base) |
| Parametros activos | 42B por token |
| Longitud de contexto | 1.000.000 tokens en inferencia |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 3.0 (lista completa de niveles no disponible); el modelo original se publica en BF16 y NVFP4 |
| Idiomas soportados | Multilingue, entrenado con datos de mas de 100 idiomas (los metadatos de HuggingFace indican "en") |
| Licencia | Muse Model License (license_name: muse-model-license) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base (BF16 y NVFP4) |

Detalles adicionales de arquitectura (lenguaje): dimension oculta 8192, 62 capas, atencion con puerta (output gate y output norm), QK-norm activado, 128 cabezas de consulta y 16 de clave/valor (grouped-query attention), dimension de cabeza 64, embeddings de entrada/salida no compartidos (202.048 x 8192, aproximadamente 1,66B cada uno), 256 expertos con top-k = 8.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer MoE con enrutado top-k sobre 256 expertos, de los cuales se activan 8 por token. La capa de atencion usa grouped-query attention (128 cabezas Q y 16 KV), incorpora QK-norm y una puerta de salida con normalizacion. El componente multimodal es un Perception Encoder de 1.800 millones de parametros, 50 capas, dimension oculta 1536, 16 cabezas, tamano de parche 14x14 y dimension de salida 4096. Este codificador usa embeddings posicionales absolutos aprendidos combinados con RoPE 2D, FFN con LayerNorm y GELU, y atencion dispersa con factor 4 (cada cuarta capa mas la ultima son de atencion completa).

La model card menciona que la version de pesos abiertos incluye un post-entrenamiento adicional de seguridad para hacerla mas robusta frente a usos indebidos cuando se ejecuta sin guardarrailes de sistema. El apartado de datos de entrenamiento de la model card aparece truncado en la informacion disponible, por lo que no se detallan el numero de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se especifica en la informacion proporcionada si hay innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extensos.
- Finalizacion de tareas agenticas de extremo a extremo: planificacion multi-paso, invocacion secuencial de herramientas, recuperacion ante fallos y ejecucion de tareas de largo recorrido.
- Agentes de codigo: escritura, depuracion y resolucion de tareas reales de ingenieria de software.
- Uso de herramientas (tool calling / function calling), incluyendo diagnostico de errores y reintentos cuando falla una llamada.
- Razonamiento multimodal: interpretacion de capturas de pantalla, graficos, documentos, imagenes y grabaciones de audio y video.
- Generacion de datos sinteticos de alta calidad para el desarrollo de modelos posteriores.
- Evaluacion como LLM-as-a-judge sobre las salidas de otros modelos.
- Soporte multilingue (entrenado con mas de 100 idiomas).
- Modo de razonamiento configurable mediante el parametro reasoning_effort (low, medium, high, xhigh; valor por defecto xhigh).

## Casos de uso

- Agentes de codigo autonomos: el modelo puede escribir, depurar y resolver tareas de ingenieria de software dentro de un scaffold, invocando herramientas y recuperandose de fallos, aprovechando sus 42B de parametros activos y el contexto de 1M tokens para mantener el estado de repositorios grandes.
- Automatizacion de atencion al cliente multi-turno: con 1M tokens de contexto puede arrastrar historiales de conversacion muy largos y documentacion asociada, y el modo reasoning_effort low o medium permite respuestas rapidas cuando no se requiere razonamiento profundo.
- Procesamiento de documentacion tecnica multimodal: al aceptar imagen y video de entrada, puede extraer informacion de graficos, diagramas, capturas de pantalla y documentos escaneados junto con el texto de la conversacion.
- Pipelines de CI/CD asistidos por IA: integrado via tool calling, puede analizar fallos de compilacion o de tests, proponer parches y reintentar tras errores de herramienta dentro de flujos automatizados.
- Generacion de datos sinteticos para fine-tuning: util para producir datasets de entrenamiento de alta calidad para modelos mas pequenos de la organizacion.
- Evaluacion automatizada de modelos (LLM-as-a-judge): sirve como evaluador de las respuestas de otros modelos en procesos de control de calidad.
- Analisis de reuniones y contenidos audiovisuales: al aceptar audio y video como entrada, puede resumir o razonar sobre grabaciones combinadas con texto.
- Investigacion sobre razonamiento de largo horizonte: el contexto de 1M tokens y el control de esfuerzo de razonamiento lo hacen adecuado para experimentos que requieren mantener estado durante miles de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima indicada oficialmente: 700 GB para la version NVFP4 y 2 TB para la version BF16.
- GPU recomendadas: no se enumeran modelos concretos en la informacion disponible, pero las cifras de VRAM implican configuraciones multi-GPU de gama profesional (por ejemplo, nodos con multiples aceleradores de alta memoria).
- No cabe en GPU de consumo: los requisitos de 700 GB o mas de VRAM excluyen cualquier tarjeta consumer tipo RTX 4090.
- Opcion alternativa en hardware de Apple: el modelo esta optimizado para ejecutarse en dos Mac Studio con M5 Ultra mediante MLX.
- Frameworks de despliegue soportados: SGLang, vLLM, Hugging Face, TensorRT-LLM, Unsloth y llama.cpp.
- Tamano del repositorio GGUF: 2455,4 GB (incluye el conjunto de cuantizaciones; no se detalla el consumo por nivel de cuantizacion).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de inferencia recomendados: temperature = 1.0, top_p = 1.0, top_k desactivado; reasoning_effort alto o xhigh para tareas complejas de codigo y agenticas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. La unica comparativa posible con los datos disponibles es entre los formatos de distribucion del propio modelo:

| Formato | Parametros | Contexto | Licencia | Disponibilidad | VRAM requerida |
|---|---|---|---|---|---|
| Muse Spark Open BF16 | 816B totales / 42B activos | 1M tokens | Muse Model License | Pesos originales en Hugging Face | 2 TB |
| Muse Spark Open NVFP4 | 816B totales / 42B activos | 1M tokens | Muse Model License | Pesos originales en Hugging Face | 700 GB |
| Muse Spark Open GGUF (Unsloth Dynamic 3.0) | 816B totales / 42B activos | 1M tokens | Muse Model License | Repositorio GGUF de Unsloth | no disponible por nivel de cuantizacion |

Comparacion con otros modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones especificas en la informacion disponible; como cualquier modelo generativo, puede producir contenido incorrecto.
- Seguridad: la model card indica que la version de pesos abiertos ha recibido un post-entrenamiento de seguridad adicional para resistir usos indebidos como modelo autonomo, y recomienda desplegarlo dentro de un sistema de IA mas amplio con guardarrailes adicionales adaptados al caso de uso.
- Idiomas: aunque el entrenamiento cubre mas de 100 idiomas, los metadatos de HuggingFace etiquetan el modelo unicamente como "en"; no hay datos de rendimiento por idioma.
- Licencia: se trata de Muse Model License, una licencia de tipo "other". No se detallan en la informacion proporcionada las condiciones exactas de uso comercial, por lo que es imprescindible revisar el archivo LICENSE.md antes de un despliegue en produccion.
- Hardware: los requisitos de 700 GB o 2 TB de VRAM limitan severamente su uso fuera de infraestructura profesional o de configuraciones especificas de doble Mac Studio M5 Ultra.
- Datos de entrenamiento: la seccion de la model card aparece truncada, por lo que no se puede verificar la composicion del dataset, el numero de tokens ni las tecnicas de alineacion empleadas.
- Parametros de muestreo: valores de reasoning_effort distintos de low, medium, high o xhigh devuelven error, lo que exige validar la entrada en despliegues personalizados.
- Compatibilidad: la cuantizacion GGUF puede introducir degradaciones de calidad respecto a BF16 o NVFP4; no se aportan benchmarks que cuantifiquen esa perdida.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/unsloth/Muse-Spark-Open-816B-A42B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia (LICENSE.md): https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Guia de Unsloth para ejecutar Muse Spark Open: https://unsloth.ai/docs/models/muse-spark-open
- Benchmarks de cuantizacion Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Documentacion de desarrollador de Meta: https://dev.meta.ai/resources/blog/build-with-muse-spark-open
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Sitio de Unsloth: https://unsloth.ai/
- Documentacion de Unsloth Studio: https://unsloth.ai/docs/new/studio
