# webmp3/Sakura-Fara1.5-9B-GGUF

## Resumen

Sakura — Fara1.5-9B (GGUF, three sizes) es una cuantizacion comunitaria, no oficial, del modelo microsoft/Fara1.5-9B, un agente de uso de ordenador (computer-use) orientado a la navegacion web. El modelo base parte de Qwen3.5-9B y es multimodal: recibe capturas de pantalla del navegador y emite llamadas a herramientas estructuradas. El autor de la cuantizacion es el usuario de HuggingFace webmp3, dentro de su linea Sakura Micro, y no tiene ninguna vinculacion con Microsoft.

El repositorio contiene tres archivos GGUF de distinto tamano generados a partir de los pesos BF16 del modelo original mediante un metodo propio de cuantizacion mixta con matrices de importancia (imatrix). Los tres archivos van de 3,90 GiB (3,74 bpw) a 5,53 GiB (5,31 bpw), con divergencia KL creciente a medida que baja el tamano, y usan exclusivamente tipos ggml estandar de llama.cpp, por lo que funcionan en llama.cpp sin parches. Se incluye ademas el proyector de vision `mmproj-Fara1.5-9B-f16.gguf`, conversion F16 de bartowski que no se ha cuantizado.

Su relevancia practica es doble: por un lado permite ejecutar un agente multimodal de 8,95 mil millones de parametros en hardware de consumo, y por otro documenta de forma poco habitual las metricas de degradacion por cuantizacion (KLD y perplejidad frente al BF16 de referencia), lo que facilita elegir el archivo segun el presupuesto de memoria. El repositorio es reciente y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) sobre base Qwen3.5-9B del modelo microsoft/Fara1.5-9B; agente de uso de ordenador con salida de llamadas a herramientas |
| Parametros totales | 8.953.803.264 (unos 8,95 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tres archivos GGUF mixtos: 3,90 GiB a 3,74 bpw (IQ3_S 41 %, IQ4_XS 36 %, Q4_K 12 %, IQ2_S 8 %, Q5_K 3 %); 4,83 GiB a 4,64 bpw (Q4_K 36 %, Q5_K 34 %, IQ4_XS 20 %, Q3_K 8 %); 5,53 GiB a 5,31 bpw (Q5_K 76 %, IQ4_XS 10 %, Q4_K 9 %, Q6_K 5 %). Tipos candidatos evaluados: Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); proyector de vision aparte en `mmproj-Fara1.5-9B-f16.gguf` (F16) |
| Modelo base | microsoft/Fara1.5-9B (relacion: quantized) |
| Tamano del repositorio | 16,3 GB |
| Fecha de publicacion en HuggingFace | 2026-10-02 (ultima actualizacion: 2026-10-03) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base microsoft/Fara1.5-9B, construido sobre Qwen3.5-9B y descrito por el autor de la cuantizacion como un agente de uso de ordenador para navegacion web: consume capturas de pantalla del navegador y produce llamadas a herramientas estructuradas. Se trata, por tanto, de un modelo multimodal de tipo vision-lenguaje, con un proyector de vision separado (`mmproj`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

El proceso de cuantizacion si esta documentado con detalle. Se parte del GGUF BF16 y de la matriz de importancia (imatrix) publicados por bartowski en `bartowski/Fara1.5-9B-GGUF`, usados sin modificar. Cada matriz de pesos grande se cuantiza una vez por tipo candidato con `llama-quantize` y la imatrix, y el error de cada opcion se estima de forma ponderada por importancia, con proteccion manual para las primeras y ultimas capas, las proyecciones down y los embeddings. Despues, una asignacion exacta de presupuesto (problema de mochila multiple-choice sobre bytes) elige un tipo por matriz para cada tamano objetivo, y el modelo final se ensambla a partir de los tensores ya almacenados sin recuantizar. Las normas, los tensores pequenos y las capas de prediccion multi-token se mantienen en alta precision, y no se publican las decisiones por tensor.

## Capacidades

- Generacion de texto conversacional como modelo base Qwen3.5-9B.
- Entrada multimodal de imagenes: lectura de capturas de pantalla del navegador (requiere cargar el proyector `mmproj-Fara1.5-9B-f16.gguf`).
- Emision de llamadas a herramientas estructuradas (tool calling) como salida principal del agente.
- Comportamiento agentico de multiples pasos orientado a tareas de uso de ordenador y navegacion web.
- Grounding visual sobre interfaces web (localizacion de elementos en pantalla), segun la descripcion del modelo base. No verificado para esta cuantizacion.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (modo thinking, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de navegacion web en local: desplegar el agente con llama.cpp sobre una maquina sin GPU dedicada, alimentandolo con capturas del navegador y ejecutando las llamadas a herramientas que emite, gracias a que el archivo de 3,90 GiB cabe en presupuestos de memoria muy ajustados.
- Rellenado automatico de formularios y flujos administrativos: el modelo interpreta la captura del formulario y emite las acciones de escritura y clic necesarias, lo que encaja con su formato de salida estructurado.
- Extraccion de datos de paneles y aplicaciones internas sin API: al operar sobre la representacion visual de la interfaz, puede recopilar datos de dashboards o sistemas legacy donde no existe acceso programatico.
- Pruebas de regresion de interfaz web: usar el agente para recorrer flujos de usuario en un entorno de staging y detectar pantallas rotas o pasos que fallan, con el archivo de 5,53 GiB si la precision importa mas que el consumo de memoria.
- Asistencia a operadores en tareas repetitivas de back office: sugerir la siguiente accion sobre una interfaz a partir de la captura actual, en un bucle humano en el bucle que revise cada paso antes de ejecutarlo.
- Evaluacion e investigacion de agentes computer-use en local: comparar el comportamiento del modelo cuantizado frente al BF16 en el mismo banco de tareas, teniendo en cuenta que la cuantizacion puede alterar el comportamiento del agente.
- Prototipado rapido de agentes con Ollama o LM Studio: el formato GGUF permite levantar el modelo con una sola orden y probar prompts de sistema y esquemas de herramientas antes de invertir en despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que solo ha medido divergencia KL y perplejidad sobre textos cortos reservados, y advierte que no deben interpretarse como una afirmacion de calidad en tareas. Los datos disponibles son:

| Archivo | Tamano | bits/weight | KLD en | KLD dev | Mismo token mas probable (media) | PPL en |
|---|---:|---:|---:|---:|---:|---:|
| Sakura-Fara1.5-9B-3.91GiB.gguf | 3,90 GiB | 3,74 | 0,0807 | 0,0862 | 90,7 % | 2,032 |
| Sakura-Fara1.5-9B-4.84GiB.gguf | 4,83 GiB | 4,64 | 0,0206 | 0,0233 | 95,0 % | 1,929 |
| Sakura-Fara1.5-9B-5.54GiB.gguf | 5,53 GiB | 5,31 | 0,0096 | 0,0110 | 96,5 % | 1,918 |
| Referencia BF16 (original) | no disponible | 16,00 | 0 (referencia) | 0 (referencia) | 100 % (referencia) | 1,901 (en) / 2,044 (dev) |

Metodologia declarada: 12 fragmentos de 512 tokens por texto, sobre texto ingles reservado y un conjunto reservado de texto tecnico ("developer-text"). Medicion unica en una sola maquina; el propio autor advierte que diferencias pequenas de KLD a tamanos similares no constituyen un ranking de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU (estimacion a partir del tamano de los pesos; no publicada por el autor): en torno a 5-6 GB para el archivo de 3,90 GiB, 6-7 GB para el de 4,83 GiB y 7-8,5 GB para el de 5,53 GiB, con contexto moderado.
- El proyector de vision `mmproj-Fara1.5-9B-f16.gguf` anade memoria adicional (estimacion aproximada de 0,5-1 GB); solo es necesario si se envian capturas de pantalla.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 16-24 GB. Los tres archivos caben en tarjetas de 8 GB o mas en el caso de los dos mas pequenos; el de 5,53 GiB es el mas justo en 8 GB.
- CPU: los tres archivos pueden ejecutarse en CPU con llama.cpp (por ejemplo, 16 GB de RAM del sistema son suficientes para cualquiera de ellos), con velocidad de generacion muy inferior a la de GPU.
- GPU de centro de datos (A100, H100, L40S): compatibles, pero sobredimensionadas para un modelo de 9B cuantizado a 4-6 bits; su uso tendria sentido solo por concurrencia alta o por coexistencia con otros servicios.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-perplexity`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para vision hay que cargar el `mmproj` con el soporte multimodal de llama.cpp.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion mas directa disponible es la de las cuantizaciones de referencia de bartowski sobre el mismo modelo base, medidas con el mismo procedimiento (`llama-perplexity`), lo que aisla el efecto del metodo de cuantizacion mixta de esta publicacion.

| Cuantizacion | Origen | Tamano | KLD en | KLD dev | PPL en | Mismo token mas probable (media) | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Sakura-Fara1.5-9B-3.91GiB | este repositorio | 3,91 GiB | 0,0807 | 0,0862 | 2,032 | 90,7 % | MIT |
| IQ3_XXS (imatrix) | bartowski | 3,98 GiB | 0,0937 | 0,0981 | 1,993 | 91,0 % | MIT |
| Sakura-Fara1.5-9B-4.84GiB | este repositorio | 4,84 GiB | 0,0206 | 0,0233 | 1,929 | 95,0 % | MIT |
| IQ4_XS (imatrix) | bartowski | 4,88 GiB | 0,0194 | 0,0224 | 1,913 | 95,9 % | MIT |
| Q4_K_M (imatrix) | bartowski | 5,50 GiB | 0,0129 | 0,0131 | 1,912 | 96,7 % | MIT |
| Sakura-Fara1.5-9B-5.54GiB | este repositorio | 5,54 GiB | 0,0096 | 0,0110 | 1,918 | 96,5 % | MIT |

No se dispone de comparaciones con otros modelos de la misma categoria (agentes computer-use multimodales de ~9B) en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas publicadas son unicamente divergencia KL y perplejidad sobre textos cortos, no benchmarks de tareas; no deben interpretarse como una garantia de calidad funcional.
- La cuantizacion siempre degrada la calidad, y el archivo de 3,90 GiB es el que mas pierde (KLD de 0,0807 frente a 0,0096 del mayor).
- Fara1.5-9B es un agente de uso de ordenador: Microsoft recomienda ejecutarlo solo dentro de un sandbox con monitorizacion (MagenticLite). La cuantizacion puede alterar el comportamiento del agente y el autor no ha probado la seguridad del agente ni el grounding sobre capturas, solo perplejidad y KLD de texto.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni riesgo de alucinacion especifico de este modelo base.
- El proyector de vision es la conversion F16 sin modificar de bartowski: no se ha cuantizado ni revalidado, y es imprescindible para tareas con capturas de pantalla.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide garantizar flujos agente largos sin verificacion previa.
- Licencia MIT tanto del modelo base como de esta cuantizacion, lo que permite uso comercial; conviene conservar el archivo `LICENSE` incluido y la atribucion a Microsoft, bartowski y llama.cpp.
- El repositorio tiene 0 descargas y 0 likes: no hay validacion externa de la comunidad ni informes de fallos.
- La fecha de publicacion registrada (2026-10-02) es posterior a la de esta ficha; se reproduce tal cual figura en los metadatos.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/webmp3/Sakura-Fara1.5-9B-GGUF
- Modelo base original: https://huggingface.co/microsoft/Fara1.5-9B
- GGUF BF16, imatrix y cuantizaciones de referencia: https://huggingface.co/bartowski/Fara1.5-9B-GGUF
- Coleccion Sakura Micro: https://huggingface.co/collections/webmp3/sakura-micro-6aba74331f2e996ba1268a92
- Formato GGUF y herramientas: https://github.com/ggml-org/llama.cpp
- Licencia incluida en el repositorio: LICENSE (MIT)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo en la busqueda proporcionada; los resultados recibidos no guardan relacion con el modelo y se han descartado.
