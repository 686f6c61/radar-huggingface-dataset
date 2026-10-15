# Tinghong-Ye22/code-Psi0-yth-v23

## Resumen

El repositorio Tinghong-Ye22/code-Psi0-yth-v23 es una publicacion en HuggingFace cuyo README reproduce, casi integramente, la model card del proyecto Psi0 (Psi sub cero), un modelo fundacional vision-lenguaje-accion (VLA) para locomocion-manipulacion humanoide diestra desarrollado por el laboratorio USC-PSI-Lab. Conviene subrayar una discrepancia importante: el autor declarado en los metadatos de HuggingFace es Tinghong-Ye22, mientras que el README atribuye el modelo a otro grupo (Songlin Wei, Hongyi Jing y colaboradores, con enlaces a USC-PSI-Lab). El repositorio no declara licencia, idiomas ni pipeline en sus metadatos.

Segun el contenido de la model card, Psi0 combina un backbone vision-lenguaje (System-2) basado en Qwen3-VL-2B-Instruct con un experto de accion de difusion multimodal (System-1) de aproximadamente 500M de parametros, inspirado en Stable Diffusion 3, y un controlador de seguimiento por aprendizaje por refuerzo (System-0) para el tren inferior. El modelo se preentrena con videos egocentricos humanos a gran escala y se postentrena con datos reales de teleoperacion de un robot humanoide Unitree G1, de modo que puede adquirir nuevas habilidades con tan solo 80 trayectorias de ajuste fino.

Es relevante en el contexto actual de robótica fundacional porque propone un enfoque end-to-end de tres niveles (razonamiento, accion y control fisico) para tareas de manipulación diestra y locomocion simultaneas, un problema abierto en el que la mayoria de los VLA existentes se centran solo en el brazo o solo en la base movil. El repositorio de metadatos pesa unicamente 0,2 GB, lo que sugiere que no contiene los pesos completos del modelo (que en fp16 para ~2,5B parametros superarian los 5 GB), sino codigo o configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA de tres niveles: backbone vision-lenguaje (System-2) + experto de accion en transformer de difusion multimodal (System-1) + controlador RL de seguimiento (System-0) |
| Parametros totales | No especificado de forma agregada; el backbone Qwen3-VL-2B-Instruct aporta unos 2B y el experto de accion unos 500M (total aproximado ~2,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponibles (los metadatos no lo declaran; el backbone Qwen3-VL soporta multilingue, pero no se confirma para este checkpoint) |
| Licencia | El README incluye un badge de Apache 2.0, pero los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La arquitectura es un sistema end-to-end de tres capas. En el nivel superior (System-2), un backbone vision-lenguaje basado en Qwen3-VL-2B-Instruct extrae caracteristicas de las observaciones visuales y las instrucciones de la tarea. Estas caracteristicas condicionan un experto de accion (System-1) de aproximadamente 500M de parametros materializado como un transformer de difusion multimodal de flujo (flow-based), inspirado en Stable Diffusion 3, que predice bloques (chunks) de acciones de cuerpo completo. En el nivel inferior (System-0), un controlador de seguimiento basado en aprendizaje por refuerzo ejecuta los comandos de accion del tren inferior, aportando estabilidad y precision fisica.

El entrenamiento sigue dos fases: un preentrenamiento para aprender semantica de tareas y representaciones visuales a partir de videos egocentricos humanos a gran escala, seguido de un postentrenamiento sobre una cantidad menor de datos reales de teleoperacion de robot para capturar la dinamica general del embodiment. Segun el autor, el modelo puede adquirir nuevas habilidades de manipulacion-locomocion diestra de horizonte largo con ajuste fino sobre tan solo 80 trayectorias. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO sobre el backbone.

## Capacidades

- Percepcion y razonamiento multimodal: procesa observaciones visuales e instrucciones en lenguaje natural mediante un backbone vision-lenguaje (Qwen3-VL-2B-Instruct).
- Generacion de acciones de cuerpo completo: predice bloques de acciones de manipulacion-locomocion diestra, no solo movimiento de brazo o base por separado.
- Manipulacion bimanual diestra: disenado para robots con dos manos Dex3-1 sobre un Unitree G1.
- Adaptacion con pocos datos: adquisicion de nuevas habilidades con ajuste fino sobre aproximadamente 80 trayectorias.
- Control fisico de bajo nivel: el controlador RL (System-0) ejecuta comandos del tren inferior con seguimiento estable.
- Soporte de simulacion: integracion con el entorno SIMPLE para generacion de datos y evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no detalladas explicitamente; el sistema opera como politica de accion, no como agente de texto.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: aprendizaje a partir de video egocentrico humano; pipeline de teleoperacion con Apple Vision Pro.

## Casos de uso

- Manipulacion de objetos con humanoides: el modelo puede ejecutar tareas como "abrazar una caja y moverla" (Hug box and move) sobre un Unitree G1 equipado con manos Dex3-1, fusionando percepcion visual e instruccion linguistica en una politica de accion.
- Adquisicion rapida de nuevas habilidades por ajuste fino: gracias a que aprende nuevas tareas de manipulacion-locomocion con tan solo 80 trayectorias, es adecuado para laboratorios que quieran ensenar al robot tareas nuevas sin recopilar grandes volumenes de datos.
- Investigacion en robotica fundacional: sirve como punto de partida para estudiar la fusion de representaciones visuales, linguisticas y de accion en un unico modelo end-to-end.
- Desarrollo de politicas de control de cuerpo completo: util para equipos que necesiten coordinar simultaneamente locomocion y manipulacion diestra, un escenario poco cubierto por los VLA de solo brazo.
- Evaluacion y comparacion de metodos VLA: el proyecto incluye baselines como GR00T N1.6, OpenPi pi0.5, InternVLA-M1, H-RDT, EgoVLA, Diffusion Policy y ACT, lo que permite usarlo como referencia en experimentos comparativos.
- Generacion de datos sinteticos y evaluacion en simulacion: mediante el entorno SIMPLE se pueden generar datos y evaluar politicas antes de desplegarlas en el robot real.
- Teleoperacion y recoleccion de datos: el pipeline interno usa Apple Vision Pro para teleoperar el G1, util para crear datasets de demostracion propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona baselines de comparacion (GR00T N1.6, OpenPi pi0.5, InternVLA-M1, H-RDT, EgoVLA, Diffusion Policy y ACT), pero no incluye cifras numericas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el proyecto. Como referencia de ingenieria, un modelo de ~2,5B parametros en bf16/fp16 requiere del orden de 5-6 GB solo en pesos, a los que hay que sumar memoria para activaciones y buffers de imagen de alta resolucion; las cifras exactas no estan disponibles.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de esta escala podria ejecutarse en GPUs de gama alta para consumidor, pero el proyecto no lo confirma.
- Compatibilidad con GPU de consumidor: no confirmada. El componente vision-lenguaje y el transformer de difusion, junto con el bucle de control en tiempo real, imponen requisitos de latencia que el proyecto no detalla.
- Opciones de despliegue: la model card describe un flujo propio basado en Python 3.10, `uv`, `flash_attn==2.7.4.post1` y el stack de LeRobot para datos; no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Para un VLA de control roboticos la latencia es critica, pero no se aportan mediciones.

## Comparativa con modelos similares

La model card lista explicitamente varios modelos usados como baselines. No se proporcionan especificaciones ni resultados comparativos, por lo que los datos de la tabla se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Psi0 (este proyecto) | ~2B backbone + ~500M experto de accion | No disponible | No disponible | Apache 2.0 segun badge del README | Repo HuggingFace USC-PSI-Lab/psi-model (segun README) |
| GR00T N1.6 | No disponible | No disponible | No disponible | No disponible | Listado como baseline |
| OpenPi pi0.5 | No disponible | No disponible | No disponible | No disponible | Listado como baseline |
| InternVLA-M1 | No disponible | No disponible | No disponible | No disponible | Listado como baseline |

Otros baselines citados sin datos: H-RDT, EgoVLA, Diffusion Policy y ACT.

## Limitaciones y advertencias

- Discrepancia de autoria: los metadatos de HuggingFace atribuyen el repositorio a Tinghong-Ye22, mientras que el README atribuye el modelo a USC-PSI-Lab. Debe verificarse la procedencia antes de cualquier uso.
- Licencia ambigua: el README muestra un badge Apache 2.0, pero los metadatos de HuggingFace no declaran licencia; el estatus legal para uso comercial no esta confirmado.
- Contenido del repositorio: con 0,2 GB y cero descargas, es probable que no contenga los pesos completos del modelo, sino codigo o configuracion, por lo que no puede desplegarse directamente desde este repositorio.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la informacion disponible, lo que impide validar las afirmaciones de capacidad.
- Dependencia de hardware especifico: el pipeline esta orientado al robot Unitree G1 con manos Dex3-1 y teleoperacion con Apple Vision Pro; su uso fuera de esa plataforma no esta documentado.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al tratarse de un modelo de accion fisica, los errores de politica pueden tener consecuencias materiales en un robot real.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Fechas y referencia arXiv: los metadatos (2026) y el identificador arXiv 2603.12263 deberian verificarse en la fuente original, ya que no se pueden contrastar con la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/Tinghong-Ye22/code-Psi0-yth-v23
- Paper (arXiv): https://arxiv.org/abs/2603.12263
- Pagina del proyecto: https://psi-lab.ai/Psi0
- Modelo oficial (segun el README): https://huggingface.co/USC-PSI-Lab/psi-model
- Dataset oficial (segun el README): https://huggingface.co/datasets/USC-PSI-Lab/psi-data
- Repositorio de codigo (segun el README): https://github.com/physical-superintelligence-lab/Psi0
