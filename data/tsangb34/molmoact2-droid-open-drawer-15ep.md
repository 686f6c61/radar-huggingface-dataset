# tsangb34/molmoact2-droid-open-drawer-15ep

## Resumen

`tsangb34/molmoact2-droid-open-drawer-15ep` es una política de robótica entrenada mediante aprendizaje por imitación que adapta el modelo fundacional MolmoAct2, desarrollado por el Allen Institute for AI (Ai2), a una única tarea de manipulación: abrir un cajón con un brazo robótico Franka. El modelo consume tres flujos de cámara (muñeca, izquierda y derecha) a resolución 360×640 junto con el estado articular y la posición cartesiana del efector, y produce un vector de acción de 8 dimensiones. Es, por tanto, un modelo de visión-lenguaje-acción (VLA) especializado, no un modelo de lenguaje generativo de propósito general.

El checkpoint se ha entrenado y publicado con LeRobot 0.6.1, la librería de Hugging Face para aprendizaje en robótica real, y sigue el formato estándar de políticas LeRobot (pesos en `safetensors`, config particularizable y compatibilidad con las CLI `lerobot-train` y `lerobot-rollout`). El modelo base MolmoAct2 aporta aproximadamente 5.442 millones de parámetros (5,44 B), lo que lo sitúa en la gama de los VLA abiertos de tamaño medio, pero el ajuste fino aquí publicado está restringido a un solo robot y a un solo comportamiento.

Su relevancia es doble: por un lado, demuestra el flujo completo de adaptación de un modelo fundacional robótico abierto a hardware concreto; por otro, sirve como referencia reproducible para investigar generalización y sobreajuste en políticas VLA con presupuestos de datos pequeños (100 episodios, 38.884 fotogramas a 30 FPS). No se han publicado resultados de evaluación en robot real, por lo que debe tratarse como un artefacto de investigación y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) MolmoAct2, implementado en LeRobot; detalles internos de la red no disponibles |
| Parametros totales | 5.442.196.272 (5,44 B) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en `safetensors`; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponibles; la única instrucción documentada es la cadena en inglés "open drawer" |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (repositorio LeRobot; tamano total del repo 87,4 GB) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `franka` |
| Camaras | `wrist`, `left_image`, `right_image` |
| Entrada `observation.state` | STATE, shape `(8,)` |
| Entrada `observation.cartesian_position` | STATE, shape `(6,)` |
| Entradas visuales | `(3, 360, 640)` por camara |
| Salida `action` | ACTION, shape `(8,)` |
| Tarea | "open drawer" |
| Dataset de entrenamiento | `local/droid-open-drawer` (100 episodios, 38.884 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 9.120 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional robótico abierto de Ai2 que transforma imágenes de cámara e instrucciones en lenguaje en bloques de acciones ("action chunks") para control de robots. La implementación disponible en LeRobot permite entrenar y evaluar el modelo estándar; en este repositorio concreto se distribuye una política ya ajustada sobre el dataset `local/droid-open-drawer`. La información proporcionada no detalla la arquitectura interna (número de capas, mecanismo de atención, tokenizador de acciones ni estrategia de fusión visión-lenguaje), por lo que ese nivel de detalle debe consultarse en el blog de Ai2 y en la documentación de LeRobot. Tampoco se documenta la longitud de contexto ni el esquema exacto de discretización o regresión de acciones.

El entrenamiento es de imitación supervisada sobre 100 episodios y 38.884 fotogramas grabados a 30 FPS, durante 9.120 pasos con batch de 64, AdamW y learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se menciona en la model card el uso de RLHF, DPO ni etapas de refinamiento por refuerzo; el pipeline descrito es el flujo estándar de `lerobot-train` con `--policy.type=molmoact2`. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de la tarea "open drawer", ni si el backbone VLA se mantuvo congelado o se ajustó por completo. Existe una discrepancia menor en el nombre del repositorio: contiene el sufijo `15ep` mientras que la model card declara 100 episodios; conviene verificar el dato antes de citarlo.

## Capacidades

- Control visomotor de un brazo Franka para la tarea de abrir un cajón, generando acciones de 8 dimensiones a partir de tres vistas de cámara simultáneas.
- Fusión de estado propioceptivo (`observation.state`, 8 dimensiones) y posición cartesiana del efector (6 dimensiones) con información visual estéreo más muñeca.
- Condicionamiento por instrucción en lenguaje natural: la política acepta una cadena de tarea, documentada como "open drawer".
- Producción de "action chunks": el modelo genera bloques de acciones en lugar de una acción aislada, lo que favorece la estabilidad temporal del control.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- Reutilización como base para ajuste fino en nuevas tareas de manipulación sobre el mismo tipo de robot.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje, visión general, audio ni modo "thinking"; se trata de una política robótica, no de un asistente conversacional.

## Casos de uso

- Automatización de apertura de cajones en un laboratorio con un Franka: la política se ejecuta con `lerobot-rollout --strategy.type=base` apuntando al puerto del robot y a tres cámaras configuradas a 640×480 y 30 FPS, cubriendo un ciclo de manipulación de hasta 60 segundos por ejecución.
- Punto de partida para ajuste fino en tareas relacionadas: entrenar con `lerobot-train --policy.type=molmoact2` sobre un dataset propio de manipulación permite reutilizar los pesos como inicialización, aprovechando que MolmoAct2 es un modelo fundacional y no una política entrenada desde cero.
- Reproducción de experimentos de aprendizaje por imitación: la configuración completa (9.120 pasos, batch 64, lr 1e-5, semilla 1000, LeRobot 0.6.1) está documentada, lo que permite repetir el entrenamiento y estudiar variabilidad y sobreajuste con 100 episodios.
- Evaluación comparativa de políticas VLA: sirve como referencia base en suites de manipulación con robot Franka, especialmente en entornos tipo RoboColosseum (etiqueta presente en el repositorio), para medir tasas de éxito frente a otras políticas entrenadas con los mismos datos.
- Docencia y formación en robótica: al ser un caso acotado (una tarea, un robot, tres cámaras) y con licencia Apache-2.0, es adecuado para prácticas de aprendizaje por imitación, calibración de cámaras y despliegue de políticas en laboratorios universitarios.
- Pruebas de robustez ante cambios de dominio: útil para estudiar cómo degrada una política VLA cuando cambian la iluminación, la posición inicial del cajón o la colocación de las cámaras, dado que el modelo no incluye datos de aumento documentados.
- Prototipado en manufactura ligera o logística interna: como prueba de concepto de manipulación de tiradores y cajones antes de invertir en un dataset mayor o en un modelo propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,44 B de parámetros, la carga en precisión de 16 bits requiere aproximadamente 10,9 GB solo para los pesos; en 8 bits, unos 5,5 GB; en 4 bits, unos 2,8 GB. A ello hay que sumar el coste de procesar tres imágenes de 360×640 por paso de control y las activaciones intermedias, no cuantificado en la información disponible.
- GPU recomendadas para inferencia: RTX 4090 (24 GB), RTX 6000 Ada (48 GB), A100 (40/80 GB) o H100 (80 GB) para despliegues con margen y baja latencia. Una GPU consumer de 12-16 GB podría ser suficiente en cuantización agresiva, pero no hay datos medidos que lo confirmen.
- Cabe en GPU consumer: previsiblemente sí en RTX 4090 y en tarjetas de 16 GB o más con cuantización; no verificado experimentalmente.
- Entrenamiento: el batch de 64 sobre 5,44 B de parámetros exige memoria muy superior a la inferencia; se recomienda A100/H100 o configuraciones multi-GPU con acumulación de gradiente. No se documenta el hardware usado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control objetivo opera en ese orden de magnitud, pero no se publica latencia medida por paso ni frecuencia real de inferencia.

## Comparativa con modelos similares

Los datos de las filas de otros modelos provienen de información pública general y no de la documentación proporcionada; se incluyen como orientación y deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsangb34/molmoact2-droid-open-drawer-15ep` | 5,44 B | No disponible | Política VLA especializada (Franka, abrir cajón) | Apache-2.0 | Hugging Face, vía LeRobot |
| MolmoAct2 (modelo base, Ai2) | No disponible en la información proporcionada | No disponible | Modelo fundacional robótico VLA | No disponible en la información proporcionada | Blog y publicación de Ai2 |
| OpenVLA | 7 B (referencia pública) | No disponible | VLA generalista de código abierto | No verificada en esta ficha | Hugging Face |
| pi0 / openpi | 3,3 B (referencia pública) | No disponible | VLA con modelo de flujo de acciones | No verificada en esta ficha | Repositorio openpi |

La comparación relevante es frente a MolmoAct2 sin ajustar: este checkpoint añade especialización en una tarea y un robot concretos, a costa de perder generalidad. Frente a OpenVLA o pi0, la diferencia principal no es de tamaño sino de alcance: aquí se distribuye una política de una sola tarea, mientras que aquellos se publican como modelos base entrenados con mezclas multi-robot.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha visto la tarea "open drawer" sobre un robot Franka; no se espera que generalice a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad incluso en la tarea para la que fue entrenado.
- Riesgo alto de sobreajuste y de fallo ante cambios de dominio (iluminación, posición del cajón, fondo, nueva instancia del mismo robot), dado el volumen reducido de datos: 100 episodios y 38.884 fotogramas.
- Dependencia estricta de la configuración de cámaras: los nombres de cámara deben coincidir con las claves de observación del entrenamiento (`wrist`, `left_image`, `right_image`) y con la resolución 360×640; cualquier desviación invalida la política.
- Idioma: la única instrucción documentada está en inglés ("open drawer"); no hay evidencia de soporte multilingüe ni de robustez ante paráfrasis de la instrucción.
- Alucinación en el sentido lingüístico no aplica, pero sí el riesgo de ejecutar acciones plausibles y erróneas cuando la escena se aleja de la distribución de entrenamiento; no hay mecanismo de detección de fallo ni de parada segura incluido.
- Seguridad física: al tratarse de control de un brazo real, es imprescindible envolver la ejecución en límites de par, paradas de emergencia y supervisión humana; el modelo no incorpora garantías de seguridad.
- Discrepancia de nombres: el repositorio indica `15ep` mientras la model card declara 100 episodios; conviene verificar el dato de entrenamiento efectivo.
- Licencia: los pesos se publican bajo Apache-2.0, pero el modelo base MolmoAct2 y el dataset DROID pueden tener condiciones adicionales que deben revisarse antes de un uso comercial.
- Tamano del repositorio: 87,4 GB, probablemente por acumulación de checkpoints; requiere espacio en disco y ancho de banda considerables.
- Resultados de busqueda web no relevantes: las consultas realizadas no devolvieron documentación técnica sobre este modelo, por lo que toda la información procede de la model card y de los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/molmoact2-droid-open-drawer-15ep
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guia de LeRobot para molmoact2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-open-drawer
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-open-drawer
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
