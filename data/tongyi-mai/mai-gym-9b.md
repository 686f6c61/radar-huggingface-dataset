# Tongyi-MAI/MAI-Gym-9B

## Resumen

MAI-Gym-9B es un modelo multimodal de 9.409.813.744 parametros (unos 9,41 mil millones) publicado por Tongyi-MAI, el laboratorio responsable del ecosistema MAI-Gym, y distribuido bajo licencia Apache 2.0. Se trata de un modelo especializado en actuar como agente GUI: recibe capturas de pantalla y texto, decide la siguiente accion sobre una interfaz movil o de escritorio y la ejecuta dentro de un bucle de interaccion multi-paso. No es, por tanto, un modelo de proposito general, sino el componente de politica de un stack de evaluacion y entrenamiento por refuerzo de agentes GUI.

El modelo se publica junto al marco MAI-Gym, una plataforma "todo en uno" que unifica evaluacion, recoleccion de trayectorias y entrenamiento RL online en entornos moviles, de escritorio y web. La relevancia inmediata esta en ese acoplamiento: el mismo harness, la misma construccion de prompt y el mismo parser de acciones se usan en evaluacion y en entrenamiento, lo que evita la deriva de implementacion entre ambas fases, un problema clasico en agentes GUI. La plataforma reporta haber sido probada con hasta 20.000 entornos concurrentes.

La etiqueta `qwen3_5` del repositorio apunta a que el modelo deriva de la familia Qwen3.5, aunque la model card no detalla la arquitectura interna, la longitud de contexto, los idiomas soportados ni el dataset de entrenamiento. Los pesos se distribuyen en safetensors (repositorio de 18,8 GB) y no se documentan cuantizaciones alternativas en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta `qwen3_5` en HuggingFace, compatible con la familia Qwen3.5 y con modulo de vision para entrada de capturas de pantalla |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | No disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin GGUF ni cuantizaciones documentadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 18,8 GB |
| Fecha de publicacion | 16 de octubre de 2026 |
| Descargas / likes en HuggingFace | 0 descargas / 5 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5` y del caracter multimodal del modelo, necesario para procesar capturas de pantalla como observacion. El uso documentado apunta a un transformer con codificador de vision y decodificador de lenguaje, integrado en un bucle de agente donde la salida del modelo se parsea como accion estructurada y se ejecuta contra un entorno.

El entrenamiento se enmarca en MAI-Gym, que combina tareas verificables (verificadores de codigo definidos por tarea y jueces VLM que producen recompensa) con aprendizaje por refuerzo online. La plataforma soporta expresamente GRPO, DAPO, GSPO, REINFORCE++, SAO y PPO a traves de Slime, y alimenta los backend de entrenamiento desde un buffer de trayectorias, en modo sincrono o asincrono. Dos detalles tecnicos destacables del pipeline son la gestion de historial multimodal por ventanas, que conserva prefijos de prompt reutilizables para reaprovechar la KV-cache limitando el numero de capturas recientes, y el enrutado sticky, que mantiene cada trayectoria en el motor de inferencia que conserva su cache. No se indican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Control de interfaces graficas en movil y escritorio: interpreta la pantalla y emite acciones ejecutables sobre la UI.
- Razonamiento multi-paso dentro de un bucle de agente, con parser de acciones y ejecucion de las mismas contra el entorno.
- Entrada multimodal basada en capturas de pantalla, con historial gestionado por ventanas para acotar el coste de contexto.
- Generacion de trayectorias completas, persistidas y auditables, con fines de evaluacion y de recoleccion de datos.
- Integracion como politica entrenable en pipelines de RL online (GRPO, DAPO, GSPO, REINFORCE++, SAO, PPO mediante Slime).
- Compatibilidad con verificadores de tarea y jueces VLM que emiten recompensa automatica.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el modelo opera emitiendo acciones estructuradas contra un `EnvClient` con interfaz comun de observacion, reset y ejecucion de acciones.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito ("thinking"): no disponible.

## Casos de uso

- Automatizacion de flujos en aplicaciones moviles: el agente puede completar tareas de varios pasos (navegacion, formularios, ajustes) operando sobre capturas de pantalla, lo que permite automatizar procesos sin API publica de la aplicacion.
- Testing automatizado de aplicaciones moviles y de escritorio: al integrarse en MAI-Gym, el modelo puede ejecutar suites de tareas con verificadores de codigo que validan el estado final del entorno, generando evidencia con capturas y acciones registradas.
- Automatizacion de escritorio para operaciones internas: rellenado de formularios, gestion de ficheros o extraccion de datos desde aplicaciones legacy sin interfaz programatica, usando el bucle de interaccion del agente.
- Evaluacion comparativa de agentes GUI: MAI-Gym actua como harness comun para medir distintos modelos sobre los mismos entornos y tareas, con una sola ruta de rollout entre evaluacion y entrenamiento.
- Entrenamiento por refuerzo de agentes GUI: el modelo sirve como politica inicial que se puede afinar con GRPO, DAPO, GSPO, REINFORCE++, SAO o PPO partiendo de tareas verificables y recompensas automaticas.
- Investigacion en entornos sinteticos y mundos multi-app: MAI-Gym soporta apps simuladas reseteables, mundos coherentes entre aplicaciones y tareas validadas por ejecucion, lo que permite generar datos de entrenamiento sin depender de dispositivos fisicos.
- Asistentes de accesibilidad: traduccion de instrucciones en lenguaje natural a cadenas de acciones sobre la interfaz, delegando en el sistema la ejecucion sobre el dispositivo del usuario.
- Despliegue a escala para recoleccion de trayectorias: la plataforma ha sido probada con hasta 20.000 entornos concurrentes sobre Kubernetes, Docker, dispositivos fisicos o endpoints existentes, lo que habilita campañas masivas de recogida de datos de interaccion.

## Benchmarks y rendimiento

La model card incluye una figura de rendimiento de MAI-Gym-9B en benchmarks de movil y de ordenador, pero no publica los valores numericos en texto. No se han facilitado cifras concretas de MMLU, HumanEval, GSM8K, ScreenSpot, AndroidWorld, OSWorld ni de ningun otro conjunto de evaluacion en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16/FP16: 9,41 mil millones de parametros equivalen a aproximadamente 18,8 GB en precision de 16 bits, ademas del codificador de vision y de la KV-cache. Con 24 GB de VRAM (RTX 3090, RTX 4090, A10G de 24 GB) el modelo cabe, pero con margen muy ajustado y contexto limitado.
- Configuracion recomendada para servicio: 40-80 GB de VRAM (A100 40/80 GB, L40S, H100, A6000) para sostener lotes concurrentes y contextos largos con historial de capturas.
- Cuantizacion 8 bits: en torno a 9,5-10 GB de pesos, viable en RTX 4080/4090 y en GPUs de 12-16 GB siempre que se recorte el contexto.
- Cuantizacion 4 bits: en torno a 5-6 GB de pesos, lo que permitiria ejecucion en GPUs consumer de 8-12 GB, si bien no hay artefactos GGUF publicados en el repositorio y esta via no esta documentada por el autor.
- Si cabe en GPU consumer: en BF16 esta al limite de una RTX 4090 (24 GB); en precision reducida, si se generan cuantizaciones, en tarjetas de 12-16 GB.
- Opciones de despliegue: los pesos estan en safetensors y no hay GGUF, por lo que las rutas directas son servidores de inferencia compatibles con VLM como vLLM o SGLang; llama.cpp y Ollama requeririan conversion previa a GGUF. La model card menciona motores de inferencia con KV-cache reutilizable y enrutado sticky, pero no nombra productos concretos.
- Latencia y throughput: no disponibles. La unica cifra operativa publicada es la escala del lado del entorno (hasta 20.000 entornos concurrentes), no la del motor de inferencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la informacion proporcionada, por lo que las celdas se marcan como no verificadas. La comparacion es cualitativa y se limita a la categoria de agentes GUI multimodales.

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAI-Gym-9B | Tongyi-MAI | 9,41 mil millones | No disponible | Apache 2.0 | Pesos en safetensors en HuggingFace |
| UI-TARS (familia de 7B) | ByteDance | No verificado en la informacion disponible | No verificado | No verificado | Pesos publicos |
| Qwen2.5-VL / Qwen3-VL (variantes de 7B) | Alibaba (Qwen) | No verificado | No verificado | No verificado | Pesos publicos |
| OS-Atlas (variantes de 7B) | Comunidad academica | No verificado | No verificado | No verificado | Pesos publicos |
| Soluciones propietarias de computer use (Gemini, Claude, OpenAI) | Google, Anthropic, OpenAI | No disponible | No disponible | Propietaria, solo API | Sin pesos publicos |

Diferencial relevante de MAI-Gym-9B frente a estas alternativas: no es solo un modelo, sino la politica de referencia de un stack abierto que cubre evaluacion, recoleccion de trayectorias y RL online con un unico harness. La comparacion cuantitativa de rendimiento no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- La model card es esencialmente la documentacion del marco MAI-Gym: no detalla el dataset de entrenamiento, el numero de tokens, los idiomas ni las fases de alineacion, lo que dificulta auditar el comportamiento del modelo.
- Es un modelo de agente: cualquier accion que ejecute tiene efecto real sobre el entorno. En produccion requiere sandboxing, listas de acciones permitidas, limites de tiempo por operacion y verificacion posterior del estado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado aqui porque el error se traduce en una accion equivocada y no solo en texto incorrecto. La plataforma mitiga esto con verificadores de codigo y jueces VLM, pero esos mecanismos operan en la fase de evaluacion, no necesariamente en cada inferencia de produccion.
- Sesgos conocidos: no documentados por el autor. Al no publicarse composicion del dataset ni evaluaciones de sesgo, no es posible descartarlos.
- Limitaciones de contexto e idioma: no disponibles. Los idiomas soportados no se declaran, por lo que no se puede asumir un rendimiento homogeneo fuera del ingles o del chino.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se han declarado clausulas adicionales ni restricciones de uso aceptable en la informacion disponible.
- El codigo del marco MAI-Gym no estaba publicado en el momento del lanzamiento ("framework source code is coming soon"), de modo que la reproducibilidad completa del pipeline de evaluacion y RL no esta garantizada aun.
- El repositorio presenta 0 descargas y 5 likes en la fecha de consulta: no hay evidencia de adopcion ni de validacion independiente por parte de terceros.
- No hay artefactos cuantizados publicados, lo que limita el despliegue en hardware de gama media sin trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tongyi-MAI/MAI-Gym-9B
- Paper en arXiv: https://arxiv.org/abs/2610.20939
- Pagina del proyecto MAI-Gym: https://tongyi-mai.github.io/MAI-Gym/
- Repositorio en GitHub: https://github.com/Tongyi-MAI/MAI-Gym
- Video de presentacion (teaser): https://github.com/Tongyi-MAI/MAI-Gym/blob/main/site/assets/video/mai-gym-teaser.mp4
- Referencia de la etiqueta de arquitectura: `qwen3_5` (familia Qwen3.5)
