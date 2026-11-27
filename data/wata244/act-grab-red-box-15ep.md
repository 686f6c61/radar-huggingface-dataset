# wata244/act-grab-red-box-15ep

## Resumen

`wata244/act-grab-red-box-15ep` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de dos cámaras (muñeca y cenital) y del estado articular de un robot `so_follower` (el brazo SO-100/SO-101 de bajo coste), predice directamente comandos de acción de 6 dimensiones. El modelo resuelve una única tarea física: coger un cubo azul y depositarlo dentro de una caja roja.

El interés de esta ficha es doble. Por un lado, sirve como ejemplo canónico del flujo de trabajo de imitación end-to-end en robótica de bajo coste: 15 episodios teleoperados, 11 270 fotogramas a 30 FPS y 20 000 pasos de entrenamiento bastan para obtener una política funcional en un entorno controlado. Por otro, ilustra las limitaciones de este paradigma: sin evaluaciones publicadas, sin licencia declarada y con un dataset extremadamente pequeño, su valor es fundamentalmente didáctico y reproducible, no de producción.

Arquitectónicamente es un transformer ligero (51,7 millones de parámetros, 0,2 GB en safetensors) que predice "trozos" de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de compounding y suaviza la ejecución. El contexto no es textual: son dos imágenes de 480×640 píxeles más un vector de estado de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada = 2 imagenes 3x480x640 + estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija en el comando de rollout) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes con atención) con un transformer que predice secuencias de acciones de longitud fija (chunks) en lugar de un único paso. Esta predicción por trozos, junto con el uso de un CVAE (conditional variational autoencoder) para modelar la variabilidad de las demostraciones humanas, es la innovación central del método: reduce la acumulación de errores y permite ejecutar movimientos suaves sin necesidad de un controlador de bajo nivel sofisticado. La política consume `observation.state` (6 dimensiones), `observation.images.wrist` y `observation.images.top` (ambas 3×480×640), y produce `action` (6 dimensiones).

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `wata244/grab-red-box-dataset-15ep`: 15 episodios, 11 270 fotogramas a 30 FPS, tarea "grab the blue cube and put inside the red box". Configuración: 20 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta el número total de tokens ni composición del dataset más allá de los episodios indicados, ni si hubo fases de RLHF/DPO (no aplicables en imitación supervisada de este tipo). El robot objetivo es `so_follower`, con cámaras `wrist` y `top`.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` para una tarea de pick-and-place concreta.
- Predicción de chunks de acción de 6 dimensiones a partir de dos vistas de cámara y del estado articular.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base` (sin grabación de episodios).
- Reentrenamiento reproducible con `lerobot-train` sobre el dataset asociado.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un modelo generativo de propósito general.
- No tiene capacidades multilingües ni de visión general: las cámaras se usan exclusivamente como entrada de control.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como referencia para validar un pipeline LeRobot completo (grabación, entrenamiento, rollout) con hardware SO-100/SO-101 y dos cámaras USB.
- Docencia y formación: permite mostrar en un curso cómo 15 episodios teleoperados y 20 000 pasos de entrenamiento producen una política funcional, con la configuración exacta documentada.
- Benchmark interno de pick-and-place: útil como línea base mínima contra la que comparar políticas más grandes (p. ej. Diffusion Policy o variantes de ACT con más datos) en la misma tarea y robot.
- Prueba de infraestructura de despliegue: al pesar 0,2 GB y tener 51,7 M de parámetros, se puede cargar y ejecutar en una GPU consumer o incluso en CPU para validar el cableado, las cámaras y la calibración del robot antes de entrenar políticas mayores.
- Generación de datos sintéticos de evaluación: ejecutando la política en simuladores compatibles con SO-100 se pueden recolectar trayectorias para estudiar robustez ante cambios de iluminación o posición de objetos.
- Prototipado de automatización de laboratorio: como paso inicial para tareas repetitivas de manipulación de objetos pequeños en entornos controlados, antes de invertir en datasets mayores o políticas más capaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,7 M de parámetros y los dos flujos de imagen de 480×640; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real a 30 FPS; A100/H100 no son necesarias para esta política.
- Cabe en GPU consumer (RTX 20xx en adelante) e incluso en CPU para pruebas no críticas.
- Despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=wata244/act-grab-red-box-15ep`; requiere robot `so_follower` y dos cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, de la resolución de las cámaras y del bucle de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wata244/act-grab-red-box-15ep` | 51,7 M | 2 imagenes 480x640 + estado 6D | Pick-and-place cubo azul en caja roja | no disponible | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | Imitacion general con action chunks | no disponible | Paper + implementaciones |
| Diffusion Policy (referencia cualitativa) | no disponible en la informacion | no disponible | Imitacion visuomotora | no disponible | Multiples repos |
| Otras politicas LeRobot del Hub | variable | variable | Tareas simuladas y reales | variable | Hugging Face |

No se dispone de datos cuantitativos de benchmarks que permitan una comparación de rendimiento rigurosa con alternativas; la comparativa anterior es únicamente cualitativa y de categoría.

## Limitaciones y advertencias

- Dataset muy reducido (15 episodios, 11 270 fotogramas): alta probabilidad de sobreajuste al entorno, posiciones de objeto e iluminación exactos de la grabación.
- Sin evaluación publicada: no hay evidencia de tasa de éxito ni de robustez ante variaciones.
- Licencia no declarada ("[More Information Needed]"): no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Tarea única y no parametrizable: el modelo no generaliza a otras tareas ni objetos; la cadena de tarea es fija.
- Dependencia del hardware exacto: robot `so_follower` y cámaras con nombres `wrist` y `top`; cambios de calibración o de montaje pueden degradar el comportamiento.
- Riesgo de alucinación en sentido figurado: la política puede producir acciones incorrectas o inseguras fuera de la distribución de entrenamiento; se recomienda supervisión humana y parada de emergencia.
- Sesgos: no aplican sesgos lingüísticos, pero sí sesgos de recolección (posiciones, colores y condiciones del dataset).
- No es un modelo de lenguaje: no debe usarse para generación de texto, código ni razonamiento.
- Sin variantes cuantizadas publicadas: el despliegue se limita al formato safetensors de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wata244/act-grab-red-box-15ep
- Dataset de entrenamiento: https://huggingface.co/datasets/wata244/grab-red-box-dataset-15ep
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wata244/grab-red-box-dataset-15ep
