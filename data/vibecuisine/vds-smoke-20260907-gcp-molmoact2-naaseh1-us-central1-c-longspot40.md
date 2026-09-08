# VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-longspot40

## Resumen

Este modelo es una politica de robotica basada en MolmoAct2, un modelo de robotica de codigo abierto desarrollado por el Allen Institute for AI (Ai2). Ha sido entrenado y publicado por VibeCuisine utilizando la libreria LeRobot de Hugging Face, y esta especializado en una tarea concreta: agarrar una jarra en posicion vertical por sus caras anchas y colocarla en un soporte con el vertedor hacia la derecha.

La arquitectura MolmoAct2 es un modelo vision-lenguaje-accion (VLA) que mapea imagenes de camara e instrucciones en lenguaje natural hacia chunks de acciones de robot. En esta implementacion, el modelo recibe como entrada el estado del robot (7 dimensiones) y dos imagenes RGB (camara superior y camara de muñeca), y produce una accion de 7 dimensiones. El modelo tiene 5.591.928.368 parametros (~5.59B) y se distribuye en formato safetensors con un tamano de 11.5 GB.

La relevancia de este modelo radica en que demuestra el flujo de trabajo completo de LeRobot para entrenar y desplegar politicas de robotica de imitacion. Sin embargo, al estar entrenado con un solo episodio de 270 frames y solo 10 pasos de optimizacion, su capacidad de generalizacion es muy limitada y debe considerarse como un checkpoint experimental o de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (MolmoAct2) basada en Transformer |
| Parametros totales | 5.591.928.368 (~5.59B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robotica; procesa imagenes y estado del robot) |
| Tipos de cuantizacion | No disponible (safetensors en precision nativa; sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (no se especifican idiomas; las instrucciones se dan en lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo de robotica de la familia vision-lenguaje-accion (VLA) desarrollado por Ai2. Su arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En esta implementacion de LeRobot, el modelo consume tres entradas: el estado del robot (vector de 7 dimensiones), la imagen de la camara superior (3x640x480) y la imagen de la camara de muñeca (3x480x640). La salida es un vector de accion de 7 dimensiones que se ejecuta en el robot.

El entrenamiento se realizo sobre el dataset VibeCuisine/naaseh1-bottle-holder-calib-090326, que contiene un unico episodio de 270 frames a 20 FPS. La tarea es "grasp the standing jug across its wide faces and stand it in the holder, spout to the right". La configuracion de entrenamiento fue de 10 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y seed 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning de aprendizaje por imitacion sobre el modelo base MolmoAct2.

## Capacidades

- Generacion de acciones de robot (action chunks) a partir de imagenes de camara, estado del robot e instrucciones en lenguaje natural.
- Manipulacion de objetos: agarre y colocacion de una jarra en un soporte con orientacion especifica.
- Procesamiento multimodal de dos camaras RGB simultaneas (camara superior y camara de muñeca).
- Integracion nativa con LeRobot para entrenamiento, evaluacion y despliegue mediante `lerobot-rollout`.
- Soporte de estado del robot de 7 dimensiones (posicion y orientacion del efector final).
- Capacidad de ejecutar tareas de manipulacion de corta duracion (60 segundos por defecto en el rollout).
- No soporta tool calling, function calling ni razonamiento multi-paso como un LLM de chat; su funcion es actuar como politica de control.

## Casos de uso

- Automatizacion de agarre y colocacion en laboratorios: el modelo puede ejecutar la tarea de tomar una jarra y colocarla en un soporte, un escenario comun en robotica de manipulacion. Gracias a la integracion con LeRobot, el despliegue se hace con `lerobot-rollout` en un robot Seeed B601.
- Investigacion en aprendizaje por imitacion: este checkpoint sirve como referencia para comparar tecnicas de entrenamiento de politicas. Su configuracion minima (1 episodio, 10 pasos) permite estudiar el comportamiento del modelo en regimen de pocos datos.
- Prototipado rapido de politicas de robotica: el modelo puede usarse como punto de partida para fine-tuning en nuevas tareas. Con LeRobot, se puede reentrenar sobre datasets propios y desplegar en el mismo robot.
- Demostraciones educativas en robotica: el modelo es apto para mostrar el pipeline completo de LeRobot, desde el registro de datos hasta el rollout, en cursos o talleres de robotica.
- Integracion en sistemas de robotica con vision dual: al consumir dos camaras (top y wrist), el modelo puede operar en entornos donde se necesita percepcion desde dos angulos, como ensamblaje o inspeccion de piezas.
- Evaluacion de modelos de robotica de codigo abierto: la licencia Apache-2.0 permite usar el modelo en experimentos comparativos y reproducir resultados en entornos controlados.
- Entrenamiento de politicas para tareas similares: aunque el modelo esta especializado en una tarea, su arquitectura VLA puede adaptarse a tareas de manipulacion relacionadas mediante transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.59B parametros en precision bf16 (11.2 GB de pesos), se estima un consumo de 12-16 GB de VRAM incluyendo activaciones y el procesamiento de dos imagenes.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB o H100. En GPU de consumo, una RTX 3090 o 4090 es suficiente para inferencia sin cuantizacion.
- Opciones de despliegue: LeRobot (`lerobot-rollout`). No es compatible con vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-longspot40 | 5.59B | No aplica | Agarre y colocacion de jarra | Apache-2.0 | HuggingFace |
| VibeCuisine/vds-smoke-20260907-gcp-molmoact2-v3-us-central1-c-longspot40 | No disponible | No aplica | Tarea no especificada | Apache-2.0 | HuggingFace |
| MolmoAct2 (Allen AI) | No disponible | No aplica | Modelo base VLA | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Entrenado con un solo episodio (270 frames) y 10 pasos de optimizacion: la generalizacion es extremadamente limitada y el modelo puede fallar ante variaciones de posicion, iluminacion o distractores.
- Sin resultados de evaluacion publicados: no se conoce la tasa de exito real en el robot ni el rendimiento en condiciones de produccion.
- Tarea especifica: el modelo solo ha sido entrenado para agarrar una jarra por sus caras anchas y colocarla en un soporte con el vertedor a la derecha. Otras tareas requieren reentrenamiento.
- Dependencia de la configuracion del robot: el modelo espera un robot Seeed B601 con dos camaras (top y wrist) con resoluciones y calibracion especificas. Cambios en el hardware pueden degradar el rendimiento.
- No es un modelo de lenguaje: no soporta chat, tool calling, generacion de texto ni razonamiento simbolico. Su unica funcion es producir acciones de robot.
- Riesgo de alucinacion de acciones: al ser una politica aprendida con datos muy limitados, puede producir acciones incorrectas o inseguras en entornos no vistos. Se recomienda supervisar el robot durante el rollout.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de la seguridad y el cumplimiento normativo en aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-molmoact2-naaseh1-us-central1-c-longspot40
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo similar (v3): https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-molmoact2-v3-us-central1-c-longspot40
