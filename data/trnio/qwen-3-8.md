# Trnio/qwen-3.8

## Resumen

Trnio/qwen-3.8 es un repositorio de pesos en formato Transformers publicado por el usuario Trnio que contiene una version cuantizada en FP8 del modelo Qwen3.8-Flash-Next, desarrollado por el equipo Qwen (Alibaba). No se trata de un modelo nuevo: es una redistribucion de terceros de los pesos cuantizados del modelo base, con licencia qwen-community-1.0 y pipeline declarado image-text-to-text. El repositorio ocupa 185,6 GB y sus safetensors suman 179.999.981.459 parametros reales.

La relevancia tecnica esta en la arquitectura subyacente, presentada por Qwen como preview experimental de la que sustentara Qwen4. Combina atencion hibrida (Gated DeltaNet mas Qwen Sparse Attention), Mixture-of-Experts con 512 expertos, N-gram Embedding para escalar parametros sin coste proporcional de computo, Gated Residual y un cabezal MTP de decodificacion especulativa. El modelo base declara 125B parametros en el LM con 6B activos, mas 51B de embedding n-gram y 4B de MTP.

La cuantizacion aplicada es FP8 de grano fino con block size de 128, y el autor afirma que las metricas de rendimiento son practicamente identicas a las del modelo original. El atractivo principal es el contexto: 262.144 tokens nativos, extensible hasta 1.000.000, con una ventana activa de atencion dispersa limitada a 512 bloques (2048 tokens), lo que reduce la latencia en cargas de trabajo agenticas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con encoder de vision: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual, N-gram Embedding y MTP |
| Parametros totales | 179.999.981.459 (~180B) segun safetensors; desglose declarado: 125B LM + 51B embedding n-gram + 4B MTP |
| Parametros activos | ~6B en el LM (de 512 expertos se activan 10 enrutados + 1 compartido); el embedding n-gram y el MTP son componentes adicionales |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 de grano fino con block size de 128 (pesos de este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face, con enlace a LICENSE) |
| Formato de pesos | safetensors (Hugging Face Transformers); compatible con vLLM, SGLang y TokenSpeed |
| Dimension oculta | 2560 |
| Capas | 48, con layout 12 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Qwen Sparse Attention -> MoE)) |
| Expertos MoE | 512; 10 enrutados + 1 compartido; dimension intermedia de experto 640 |
| Embedding de tokens | 248.320 (padded); embedding n-gram de 20.000.000 entradas (bigramas/trigramas en la capa 2) |
| Fecha de publicacion del repo | 12 de octubre de 2026 (creacion), 12 de octubre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El bloque constructivo es un transformer causal hibrido organizado en 12 macrobloques, cada uno con tres repeticiones de (Gated DeltaNet -> MoE) seguidas de una capa de (Qwen Sparse Attention -> MoE). Gated DeltaNet aporta atencion lineal con 48 cabezas para V y 16 para QK con dimension de cabeza 128, lo que mantiene un estado recurrente de tamano constante. Qwen Sparse Attention opera a nivel de microbloque en lugar de seleccionar tokens individuales: usa 24 cabezas de consulta y 2 de clave-valor con dimension 256, RoPE de dimension 64, un indexador MQA de 4 cabezas de consulta y 1 cabeza de clave compartida con dimension 128, y un presupuesto de 512 bloques (2048 tokens). Ademas se incorpora un encoder de vision, lo que habilita la entrada image-text-to-text.

La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados mas 1 compartido por token, con dimension intermedia de 640. Sobre el flujo residual se aplica Gated Residual: 4 ramas con rango de cuello de botella 320, una puerta de lectura elementwise dependiente de los datos y una puerta escalar de escritura por rama. El N-gram Embedding indexa bigramas y trigramas en la capa 2 sobre 20.000.000 de entradas, una via de escalado de parametros pensada para ser mas barata en computo y facil de descargar a memoria de host que un MoE. Se anade una capa MTP entrenada con multiples pasos para decodificacion especulativa.

En cuanto al entrenamiento, el autor del modelo base indica una receta con Muon y AdamW aplicados a categorias de pesos especificas, leyes de escalado reajustadas, eliminacion del warmup de batch size (arranque directo con el batch objetivo) y tasas de aprendizaje mas altas. El modelo pasa por preentrenamiento y postentrenamiento. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multiturno con contexto de hasta 262.144 tokens nativos.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) gracias al encoder de vision.
- Razonamiento de contexto largo con coste reducido: la atencion dispersa limita el calculo a 512 bloques (2048 tokens) por consulta.
- Decodificacion especulativa mediante el cabezal MTP de 1 capa, que acelera la generacion autoregresiva.
- Perfil orientado a cargas agenticas: el autor del modelo base justifica QSA precisamente por el peso creciente de este tipo de flujos de trabajo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado para esta version. La model card atribuye las herramientas integradas oficiales a Qwen3.8-Flash (la variante servida por API), no a Flash-Next.
- Despliegue compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Analisis de repositorios completos: con 262.144 tokens nativos se puede cargar un arbol de codigo extenso y hacer preguntas de arquitectura o deteccion de dependencias sin trocear el contexto en fragmentos que pierdan relaciones entre ficheros.
- Documentacion tecnica multimodal: al aceptar entrada de imagen y texto, se pueden procesar diagramas de arquitectura, capturas de paneles o esquemas de red junto al texto explicativo y generar documentacion coherente.
- Asistentes sobre corpus normativo o legal largo: ingestas de expedientes completos en una sola ventana, con la ventana de 1M tokens como opcion para casos que superen los 262.144 tokens.
- Agentes con multiples pasos: la combinacion de contexto largo, MTP para decodificacion rapida y arquitectura optimizada para cargas agenticas lo hace apto para bucles de razonamiento y uso de herramientas, siempre que el soporte de tool calling se valide en la practica.
- Inspeccion visual en control de calidad: clasificacion y descripcion de imagenes industriales junto a especificaciones textuales en un mismo prompt.
- Resumen y extraccion sobre transcripciones o logs muy extensos: sesiones de horas o trazas de sistema completas caben en contexto sin resumen intermedio.
- Servicio de inferencia autogestionado en FP8: al publicarse pesos cuantizados con block size 128 y compatibilidad con vLLM/SGLang, encaja en despliegues on-premise donde la latencia de red hacia una API externa no es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor incluye una seccion de resultados con tablas de capacidades y metricas, pero los valores numericos no forman parte de la informacion proporcionada (el contenido aparece truncado). No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este repositorio.

## Requisitos de hardware

- Peso de los pesos en FP8: ~180 GB para los 179.999.981.459 parametros, mas overhead de runtime. En BF16 el modelo base rondaria los 360 GB.
- VRAM estimada para inferencia: ~190 GB como minimo comodo (180 GB de pesos + cache KV + activaciones). Estimacion propia a partir de los datos de arquitectura: la cache KV solo se materializa en las 12 capas de QSA (2 cabezas KV de dimension 256), lo que da del orden de 12 KB por token en FP16, es decir unos 3,2 GB a 262.144 tokens.
- Configuraciones plausibles: 3 x H100 80 GB (240 GB), 4 x A100 80 GB (320 GB), 4 x H200 141 GB.
- Reduccion mediante offload: el embedding n-gram (51B parametros) esta disenado para ser descargable a memoria de host, lo que dejaria unos 130 GB en GPU (125B del LM + 4B de MTP). Es una estimacion; no se documenta el impacto en latencia de ese offload.
- GPU de consumo: no cabe en una RTX 4090 (24 GB). Seria necesario agregar del orden de 8 x RTX 4090 para igualar los 180 GB de pesos, una configuracion poco practica por ancho de banda y complejidad de comunicacion.
- Opciones de despliegue: vLLM, SGLang y TokenSpeed segun el autor; Hugging Face Transformers para uso directo; llama.cpp/Ollama no se mencionan y no hay GGUF en el repositorio.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP y los ~6B parametros activos del MoE deberian favorecer el throughput por token, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trnio/qwen-3.8 (este repo) | ~180B totales (6B activos en el LM) | 262.144 nativos, 1M extensible | FP8 block 128 | qwen-community-1.0 | Pesos abiertos en HF, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | ~180B totales (6B activos en el LM) | 262.144 nativos, 1M extensible | no disponible (previsiblemente BF16) | qwen-community-1.0 | Pesos abiertos, modelo base de este repo |
| Qwen3.8-Flash | no disponible | 1M por defecto | no aplica (servicio gestionado) | no disponible | Solo API via Qwen Cloud, incluye herramientas integradas oficiales |

No se dispone de datos de benchmarks ni de comparativas con modelos de otros fabricantes en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio de terceros: el autor es Trnio, no Qwen. Los pesos, la model card y los enlaces apuntan al modelo oficial, pero la integridad del artefacto no esta verificada por el fabricante.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni evaluaciones independientes.
- Benchmarks no verificables: la seccion de resultados de la model card esta truncada en la informacion disponible; no hay evidencia de que la cuantizacion FP8 preserve el rendimiento declarado.
- Arquitectura experimental: el propio autor del modelo base la describe como preview que sustentara Qwen4, con mayor riesgo de comportamiento inestable en produccion que una generacion ya consolidada.
- Alucinacion: inherente a los modelos de lenguaje; el riesgo aumenta en tareas de contexto muy largo donde la atencion dispersa solo cubre 2048 tokens por consulta.
- Idiomas: no disponibles. No se puede confirmar el soporte de castellano ni la calidad por idioma.
- Licencia: qwen-community-1.0 con enlace a LICENSE, etiquetada como "other". No se detallan en la informacion proporcionada las condiciones exactas de uso comercial, redistribucion o atribucion; hay que leer el fichero de licencia antes de cualquier despliegue productivo.
- Tool calling no confirmado para Flash-Next: las herramientas integradas oficiales se atribuyen a la version servida por API, no a estos pesos.
- Requisitos de hardware muy altos: ~190 GB de VRAM hacen inviable el despliegue en una unica GPU, incluso de gama profesional.
- Fechas de metadatos anomalas: el repositorio figura creado y actualizado el 12 de octubre de 2026, dato a tener en cuenta al evaluar su vigencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Trnio/qwen-3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Qwen3.8-Flash (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com

Nota: ninguno de los resultados de la busqueda web proporcionados aporta informacion sobre este modelo; se refieren a comparativas no relacionadas y a un perfil profesional.
