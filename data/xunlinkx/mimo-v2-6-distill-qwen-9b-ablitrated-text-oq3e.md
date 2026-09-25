# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ3e

## Resumen

`xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ3e` es una cuantizacion de 3 bits en formato Apple MLX del modelo `Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated`, que a su vez deriva del checkpoint `MiMo-V2.6-Distill-Qwen-9B` publicado por Xiaomi MiMo. El modelo original es un ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, orientado a tareas agenticas: codigo, tareas generales de agente, codigo visual y ciberseguridad.

Esta version concreta aplica una cuantizacion afin global de 3 bits con group size 64, generada con el runtime oMLX a partir de 128 muestras de calibracion con longitud de secuencia 512, computo en BF16 y cobertura estricta de la matriz de importancia. Ademas, elimina por completo la torre de vision y los ficheros de configuracion multimodal, de modo que el resultado es un LLM estrictamente de texto, mas ligero en memoria y con carga inmediata en pipelines de inferencia textual estandar.

Su relevancia practica esta en el binomio tamano/consumo: 8.953.803.264 parametros (8,95B) comprimidos en un repositorio de 4,2 GB, ejecutables en memoria unificada de equipos Apple Silicon mediante `mlx-lm`. No incorpora cabezas draft de MTP especulativo, lo que maximiza la compatibilidad con el runtime estandar a costa de renunciar a decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B); valores concretos de capas, atencion y dimension oculta no disponibles |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits, cuantizacion afin global con group size 64, esquema oQ3e (enhanced oQ3); computo de calibracion en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo upstream) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); repositorio de 4,2 GB |
| Modalidad | Solo texto (torre de vision y procesador multimodal omitidos deliberadamente) |
| Cabezas especulativas | No incluye (sin MTP draft heads) |
| Runtime objetivo | oMLX / `mlx-lm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint original: un transformer denso de aproximadamente 9B parametros, en la linea de Qwen3.5-9B. El modelo upstream `MiMo-V2.6-Distill-Qwen-9B` de Xiaomi MiMo se obtuvo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, y se publico como punto de partida para investigacion abierta en aprendizaje por refuerzo agentico. La variante intermedia `Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated` anade modificaciones de alineacion de seguridad, segun indica el propio nombre del repositorio. No se dispone de detalles publicados sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO en el checkpoint destilado.

La innovacion de esta ficha es exclusivamente de compresion y empaquetado. La cuantizacion oQ3e se construyo con 128 muestras de calibracion a longitud de secuencia 512, con aplicacion estricta y completa de la matriz de importancia (sin entradas ausentes ni desajustadas) y metadatos de cuantizacion afin global de 3 bits. Se verifico la identidad SHA-256 del tokenizer entre origen y salida, y se valido la plantilla de chat oficial renderizando un esquema de funciones estilo OpenAI, junto con una prueba determinista de generacion. El resultado omite la torre de vision y los heads de MTP especulativo para reducir el consumo de memoria unificada y garantizar compatibilidad con `mlx-lm` estandar.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla oficial incluida en el repositorio.
- Tool calling / function calling: la plantilla de chat renderiza esquemas de funciones estilo OpenAI; el uso de herramientas requiere aplicar dicha plantilla y suministrar los esquemas en la peticion.
- Tareas agenticas heredadas del modelo base: el checkpoint de Xiaomi cubre codigo, tareas generales de agente, codigo visual y ciberseguridad.
- Generacion de codigo asistida por herramientas, integrable en entornos como Cursor u OpenHands segun la model card.
- Inferencia estrictamente de texto: no procesa imagenes, audio ni otra modalidad, pese a que la familia MiMo-V2.6 sea omnimodal; las capacidades de codigo visual solo pueden explotarse por via textual.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de codigo en local: el modelo puede integrarse mediante `mlx-lm.generate` en editores como Cursor o entornos agenticos como OpenHands, aprovechando su formato de 3 bits (4,2 GB) para ejecucion en un Mac con memoria unificada sin depender de servicios en la nube.
- Automatizacion de agentes con herramientas: al renderizar esquemas de funciones estilo OpenAI, admite flujos multi-paso donde el modelo decide que herramienta invocar y con que argumentos, adecuado para orquestacion de tareas internas.
- Analisis de seguridad y ciberseguridad asistido: el checkpoint base incluye ciberseguridad entre sus dominios de entrenamiento, por lo que puede emplearse para revisar configuraciones, explicar vulnerabilidades conocidas o redactar informes tecnicos.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de tool calling, puede conectarse a herramientas de linting, tests o despliegue y producir parches o explicaciones de fallos dentro de un flujo automatizado.
- Prototipado e investigacion en RL agentico: al ser un destilado de 9B text-only y ligero, sirve como modelo base de bajo coste para experimentos de aprendizaje por refuerzo o evaluacion de politicas de agente.
- Despliegue en portatiles Apple Silicon para uso personal o demos: la ausencia de torre de vision y de cabezas MTP reduce el consumo de memoria, lo que permite cargas rapidas y sesiones interactivas en equipos de gama consumer de Apple.
- Procesamiento por lotes de texto en local: generacion de resumenes, reformulacion o extraccion de informacion en entornos con requisitos de privacidad donde no es aceptable enviar datos a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una prueba determinista de generacion (la peticion "15% of 240" produce "36") y validaciones de carga, metadatos de cuantizacion y coincidencia del tokenizer. Los resultados de evaluacion del checkpoint SFT upstream se mencionan en el repositorio de ModelScope, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente 4,2 GB de pesos, mas overhead de runtime; se recomienda reservar entre 5 y 6 GB de memoria unificada para contexto corto.
- Aceleradores compatibles: MLX esta disenado para Apple Silicon (familias M1, M2, M3, M4 y posteriores con memoria unificada suficiente). No es ejecutable de forma nativa en GPU NVIDIA o AMD.
- GPU consumer: no aplica en el sentido habitual, ya que el formato no es CUDA. Si se generase una conversion a GGUF (no incluida en el repositorio), un modelo de 9B en 3-4 bits cabria en GPUs consumer con 8 GB de VRAM o mas; esta conversion no esta publicada.
- Opciones de despliegue: runtime oMLX, `mlx-lm` (incluida la funcion `mlx-lm.generate`), LM Studio y entornos agenticos como Cursor u OpenHands, segun la model card.
- Latencia y throughput: no disponibles. Dependen del chip Apple concreto, del ancho de banda de memoria y de la longitud de contexto.
- Almacenamiento: 4,2 GB para el repositorio completo de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ3e | 8,95B | No disponible | 3 bits (oQ3e, group size 64) | Solo texto | MIT | HuggingFace, runtime MLX |
| Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated (base) | 8,95B (aprox.) | No disponible | Sin cuantizar | Texto y vision (segun base MiMo) | No disponible | HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B | No disponible | Sin cuantizar (SFT) | Multimodal segun familia MiMo | No disponible | ModelScope, HuggingFace |
| Qwen3.5-9B (modelo de partida del destilado) | 9B | No disponible | Multiples | Texto | No disponible | HuggingFace |

La comparativa se limita a la relacion de derivacion entre checkpoints, ya que no se han publicado cifras de rendimiento ni especificaciones de contexto que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 3 bits puede alterar el comportamiento respecto al modelo original; el propio autor recomienda evaluar en la carga de trabajo propia antes de un uso en produccion.
- No se han publicado evaluaciones de sesgos, toxicidad o robustez para esta version cuantizada.
- Riesgo de alucinacion inherente a los modelos de 9B destilados; no hay datos especificos de fiabilidad factual.
- La supresion de la torre de vision implica perdida total de capacidades multimodales presentes en la familia MiMo-V2.6 original. Las tareas de codigo visual solo pueden abordarse de forma textual.
- La ausencia de cabezas MTP especulativas elimina la aceleracion por decodificacion especulativa, lo que puede reducir el throughput frente a variantes que si las incluyen.
- Idiomas soportados no documentados: no puede garantizarse un rendimiento correcto fuera de los idiomas mayoritarios del modelo base.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta.
- El nombre "Ablitrated" del modelo base sugiere una modificacion de la alineacion de seguridad (eliminacion de rechazos). Esto puede implicar respuestas menos filtradas ante peticiones sensibles y debe tenerse en cuenta en cualquier despliegue con usuarios finales.
- Licencia MIT heredada del upstream; conviene verificar los avisos y la atribucion de los repositorios originales de Xiaomi MiMo antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente de su calidad.
- Requiere runtime MLX y hardware Apple Silicon; no es directamente desplegable en infraestructura CUDA sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ3e
- Modelo base: https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated
- MiMo-V2.6-Distill-Qwen-9B en ModelScope (Xiaomi MiMo): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina oficial de MiMo-V2.6 (Xiaomi): https://mimo.xiaomi.com/mimo-v2-6
- Notas de la release MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
- Metricas de entrenamiento RL de MiMo-V2.6: https://mimo.xiaomi.com/rl/
- Analisis de la serie MiMo-V2.6 (Pro, Flash, Distill-9B): https://www.brocker.org/xiaomi-mimo-v26-pro-flash-distill-qwen-open-weights
