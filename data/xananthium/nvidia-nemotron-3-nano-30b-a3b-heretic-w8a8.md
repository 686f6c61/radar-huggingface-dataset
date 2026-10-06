# Xananthium/NVIDIA-Nemotron-3-Nano-30B-A3B-Heretic-W8A8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Heretic-W8A8 es un checkpoint cuantizado en formato nativo compressed-tensors publicado por el usuario Xananthium sobre el modelo trohrbaugh/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic, que a su vez deriva del Nemotron 3 Nano 30B A3B de NVIDIA. La nomenclatura A3B y la mencion de enrutadores (routers) en la model card apuntan a una arquitectura de mezcla de expertos (MoE) con aproximadamente 30.000 millones de parametros totales y del orden de 3.000 millones activos por token, aunque el numero exacto de parametros activos no se detalla en la informacion disponible.

El modelo cuenta con 31.591.807.616 parametros reales segun los pesos safetensors y ocupa 32,4 GB en el repositorio. La cuantizacion es W8A8 (8 bits en pesos y activaciones) aplicada mediante compressed-tensors, con embeddings, enrutadores, capas de normalizacion y otros componentes designados como sensibles mantenidos en mayor precision. El autor declara un presupuesto de contexto servido de hasta 200.000 tokens en la receta de vLLM publicada.

Su relevancia practica es doble: por un lado, demuestra que un MoE de ~31.600 millones de parametros puede servirse en dos GPU de consumo (2x RTX 3090 de 24 GiB) con tensor-parallel de 2 y vLLM 0.31.0; por otro, es un checkpoint de terceros, sin aval de NVIDIA, con licencia nvidia-nemotron-open-model-license y cero descargas o valoraciones en el momento de la consulta, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun la nomenclatura A3B y la referencia a enrutadores de la model card; no se detalla la configuracion de capas ni el numero de expertos |
| Parametros totales | 31.591.807.616 (dato real de los pesos safetensors) |
| Parametros activos | Aproximadamente 3.000 millones segun el sufijo A3B del nombre; no disponible el valor exacto |
| Longitud de contexto | 200.000 tokens como maximo configurado en la receta de servicio (`--max-model-len 200000`); no se especifica la ventana nativa de entrenamiento |
| Tipos de cuantizacion | W8A8 (INT8 en pesos y activaciones) con compressed-tensors; no se publican variantes GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `license: other`) |
| Formato de pesos | safetensors con metadatos compressed-tensors (cuantizacion nativa, no post-entrenamiento en formato alternativo) |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles del preentrenamiento ni del proceso de alineacion del modelo original de NVIDIA. Lo que si se documenta es la estructura de la cuantizacion: el checkpoint es un W8A8 nativo en compressed-tensors, con activaciones INT8 aplicadas unicamente a las capas lineales elegibles para cuantizacion. Embeddings, enrutadores, capas de normalizacion y componentes designados como sensibles conservan mayor precision, y la precision de la cache KV es un ajuste independiente. El repositorio incluye un fichero conversion-receipt.json con la procedencia de la cuantizacion y los componentes de alta precision retenidos.

El autor menciona que los pesos MTP (multi-token prediction) se conservan, pero advierte explicitamente de que esto no implica que la decodificacion especulativa haya sido probada. Tambien senala que la ruta de GLM MLA no utiliza TurboQuant en esta version. La carga requiere el soporte de arquitectura y cuantizacion de vLLM 0.31.0, lo que convierte el checkpoint en dependiente de una version concreta del motor de inferencia. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo de razonamiento explicito: la receta de servicio declara `--reasoning-parser nemotron_v3`, por lo que el modelo emite trazas de razonamiento separadas de la respuesta visible.
- Tool calling y function calling: la receta habilita `--enable-auto-tool-choice` con el parser `qwen3_coder`, lo que indica soporte de llamadas a herramientas en el formato compatible con dicho parser.
- Razonamiento multi-paso y agentes: la combinacion de parser de razonamiento y parser de herramientas permite bucles de agente con varias llamadas encadenadas.
- Conocimiento tecnico en ciberseguridad: el autor reporta 74/80 en CyberMetric-80-v1 con presupuesto de 2048 tokens de salida y 76/80 con reintentos a 4096 tokens, si bien advierte de un posible solapamiento con datos de entrenamiento.
- Contexto largo: se validaron ocho prefijos largos independientes en una prueba sintetica de repeticion (49/54 aciertos) y la receta admite hasta 200.000 tokens.
- Capacidades multilingues: no disponible; la model card no enumera idiomas y el campo de idiomas del repositorio esta vacio.
- Modelo potencialmente decensurado: el termino "heretic" del modelo base sugiere habitualmente variantes abliteradas o con los mecanismos de rechazo atenuados, pero no hay documentacion en la informacion proporcionada que confirme el metodo aplicado ni su alcance. No debe asumirse ninguna capacidad adicional por este motivo.

## Casos de uso

- Servicio de asistencia tecnica especializada en seguridad: el modelo puede mantener conversaciones multi-turno con trazas de razonamiento separadas y contexto de hasta 200.000 tokens, lo que permite adjuntar informes de incidentes completos o volcados de configuracion y razonar sobre ellos sin trocear el contenido.
- Analisis de alertas y triaje en un SOC: con soporte de tool calling, puede integrarse como agente que consulte APIs de SIEM, enriquecimiento de IOCs o bases de vulnerabilidades y devuelva una conclusion razonada paso a paso.
- Asistente de codigo integrado en pipelines: el parser `qwen3_coder` indica compatibilidad con el formato de llamadas a herramientas usado por modelos de codigo de la familia Qwen, lo que facilita su insercion en flujos de CI/CD que invoquen herramientas de forma estructurada.
- Despliegue en laboratorio con hardware de gama alta de consumo: al caber en 2x RTX 3090 de 24 GiB con tensor-parallel de 2, es viable para equipos de investigación que quieran experimentar con un MoE de ~31.600 millones de parametros sin acceso a nodos con A100 u H100.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser un W8A8 nativo con receipt de conversion, sirve como referencia para medir la degradacion frente al checkpoint BF16 del que deriva.
- Procesamiento por lotes de documentos extensos: con 200.000 tokens de ventana y un rendimiento agregado de 515,15 tokens/s con cuatro peticiones simultaneas en la configuracion medida, es adecuado para resumir o clasificar corpus largos en modo batch.
- Generacion de contenido tecnico y documentacion: el modo de razonamiento explicito es util cuando se necesita justificar decisiones de diseno, aunque el coste en tokens de salida es elevado.
- Investigacion sobre alineacion y comportamiento de modelos decensurados: el checkpoint permite estudiar como se comporta un MoE cuantizado cuando los mecanismos de rechazo del modelo original han sido potencialmente atenuados, siempre que se cumplan los terminos de la licencia.

## Benchmarks y rendimiento

Resultados publicados por el autor del checkpoint, medidos con vLLM 0.31.0 sobre dos RTX 3090 de 24 GiB:

| Prueba | Resultado |
|---|---|
| CyberMetric-80-v1, presupuesto primario de 2048 tokens de salida | 74/80 |
| CyberMetric-80 con reintentos limitados a 4096 tokens | 76/80 |
| Comprobaciones sinteticas de politica de seguridad, primera respuesta | 12/43 |
| Repeticion sintetica de contexto largo | 49/54 |
| Decodificacion en contexto corto | 198,972 tokens/s |
| Decodificacion en contexto largo | 73,6275 tokens/s |
| Cuatro peticiones simultaneas, agregado | 515,1515 tokens/s |

Advertencias del propio autor que deben tenerse en cuenta al leer la tabla: los informes completos con el perfil por modelo, presupuestos, metricas de formato y fallos estan en el directorio results/; contar programas de prueba exitosos no implica que todas las comprobaciones de precision pasaran; el throughput de tokens incluye tokens de razonamiento y no equivale al de respuesta visible; la evaluacion de politicas es sintetica y un razonamiento largo puede agotar el presupuesto de salida; la prueba de contexto largo consistio en repetir ocho prefijos largos independientes y no en una conversacion nueva de ocho turnos; CyberMetric es un cuestionario publico pequeno que puede solaparse con datos de entrenamiento y no establece competencia practica en seguridad ni un ranking amplio de modelos. Las preguntas y las trazas de razonamiento privadas no se redistribuyen.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 32 GB en W8A8 (el repositorio ocupa 32,4 GB), mas el espacio de activaciones y cache KV.
- No cabe en una unica GPU de consumo de 24 GiB. La configuracion validada usa dos RTX 3090 de 24 GiB con `--tensor-parallel-size 2`.
- Alternativas de una sola GPU: tarjetas con 48 GiB o mas (A6000, L40S, A100 80 GB, H100) para poder alojar pesos y cache KV con comodidad; no se proporciona una medicion especifica en estas tarjetas.
- Opciones de despliegue: vLLM 0.31.0 con soporte de compressed-tensors y de la arquitectura, invocado como `vllm serve` con `--dtype bfloat16 --trust-remote-code`. No se documentan despliegues con llama.cpp, Ollama ni TGI, y el formato published (compressed-tensors W8A8) no es directamente compatible con llama.cpp sin conversion adicional.
- Parametros de memoria relevantes: `--kv-cache-dtype turboquant_4bit_nc` para la cache KV y `--max-model-len 200000` como limite de contexto. La model card indica que GLM MLA no usa TurboQuant en esta version y que la precision de la cache KV es un ajuste independiente de la cuantizacion de pesos y activaciones.
- Rendimiento medido: 198,972 tokens/s en decodificacion de contexto corto, 73,6275 tokens/s en contexto largo y 515,1515 tokens/s agregados con cuatro peticiones simultaneas, siempre contando tokens de razonamiento.
- Ajustes de muestreo y de memoria probados: consultar results/serving-profile.json en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xananthium/NVIDIA-Nemotron-3-Nano-30B-A3B-Heretic-W8A8 | 31.591.807.616 | 200.000 en la receta de servicio | W8A8 compressed-tensors | nvidia-nemotron-open-model-license | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| trohrbaugh/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic (modelo base directo) | no disponible en la informacion proporcionada | no disponible | BF16 (sin cuantizar) | no disponible | Publico en HuggingFace; referenciado como origen del checkpoint |
| NVIDIA Nemotron 3 Nano 30B A3B (modelo upstream original) | no disponible en la informacion proporcionada | no disponible | no disponible | nvidia-nemotron-open-model-license | Publico; es el origen de la cadena de derivados |

No se dispone de datos de otros modelos comparables de la misma categoria (MoE de ~30.000 millones de parametros totales y ~3.000 millones activos) en la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Es un checkpoint de terceros: la cuantizacion la publica Xananthium y no esta avalada por NVIDIA. La model card del autor remite los terminos del modelo upstream.
- Cero descargas y cero valoraciones en el momento de la consulta, con creacion y ultima actualizacion el mismo dia (6 de octubre de 2026). No hay validacion independiente de los resultados publicados.
- Los benchmarks proceden del propio publicador y se ejecutaron en una unica configuracion de hardware. Las cifras de throughput incluyen tokens de razonamiento y no miden la respuesta visible.
- El resultado de 12/43 en comprobaciones sinteticas de politica de seguridad en la primera respuesta es bajo y sugiere una fiabilidad limitada en tareas de cumplimiento normativo o filtrado de contenido. El autor advierte ademas de que un razonamiento largo puede agotar el presupuesto de salida y truncar la respuesta.
- El modelo base incluye el termino "heretic" en su nombre, asociado habitualmente a variantes abliteradas o con los mecanismos de rechazo atenuados. No hay documentacion disponible que confirme el metodo ni su alcance, pero debe asumirse un riesgo elevado de generar contenido que un modelo alineado rechazaria.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad ni de tasas de alucinacion. El propio autor advierte que CyberMetric es un cuestionario pequeno que puede solaparse con datos de entrenamiento.
- La prueba de contexto largo consiste en repetir ocho prefijos independientes, no en un dialogo nuevo de ocho turnos; no demuestra por si sola un seguimiento conversacional fiable a 200.000 tokens.
- Idiomas soportados no declarados. No puede asumirse un rendimiento multilingue solido sin evaluacion propia.
- Licencia: nvidia-nemotron-open-model-license, registrada como "other". Es necesario revisar el texto completo antes de cualquier uso comercial, ya que los terminos de la licencia de NVIDIA no equivalen a una licencia de codigo abierto permisiva.
- Dependencia estricta de vLLM 0.31.0 para la arquitectura y la cuantizacion, con `--trust-remote-code` habilitado, lo que implica ejecutar codigo remoto del repositorio.
- La conservacion de pesos MTP no implica que la decodificacion especulativa funcione ni haya sido probada; no debe asumirse esa aceleracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/NVIDIA-Nemotron-3-Nano-30B-A3B-Heretic-W8A8
- Modelo base (BF16 heretic): https://huggingface.co/trohrbaugh/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Model card original preservada en el repositorio: README_ORIGINAL.md
- Justificante de conversion y componentes de alta precision: conversion-receipt.json (en el repositorio)
- Informes de evaluacion, perfil de servicio y metricas: directorio results/ (incluye results/serving-profile.json)
