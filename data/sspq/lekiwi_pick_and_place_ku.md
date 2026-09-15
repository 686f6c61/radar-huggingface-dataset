# sspq/lekiwi_pick_and_place_ku

## Resumen

El modelo `sspq/lekiwi_pick_and_place_ku` es una política de robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario sspq en HuggingFace Hub mediante la librería LeRobot de HuggingFace. No es un modelo de lenguaje: se trata de un modelo visomotor de imitación que, a partir del estado propioceptivo del robot y de dos cámaras RGB, predice directamente comandos de acción de 9 dimensiones. Su arquitectura es un transformer con *action chunking*, es decir, que genera secuencias cortas de acciones en lugar de un único paso, un enfoque que el artículo de referencia (arXiv 2304.13705) asocia a tasas de éxito altas en manipulación.

El modelo tiene 51.674.761 parámetros (~51,7 M) y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras ejecutables en tiempo real sobre hardware de consumo. Está especializado en una única tarea: "Pick a red cube and place it on box", y fue entrenado con 110 episodios (28.632 fotogramas a 30 FPS, aproximadamente 15,9 minutos de datos) capturados con un robot de tipo `lekiwi_client` y dos cámaras (`front` y `wrist`).

Su relevancia es doble. Por un lado, sirve como referencia reproducible de un pipeline completo de *imitation learning* con LeRobot, incluyendo dataset, configuración de entrenamiento y comandos de despliegue. Por otro, es un ejemplo típico del estado actual de la robótica de bajo coste: políticas pequeñas, entrenadas con pocos datos y desplegables en una GPU de gama media, pero con un alcance funcional muy acotado y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de imitación con action chunking (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.674.761 (~51,7 M) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana fija de observaciones cuyo tamaño no se especifica en la model card) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (modelo visomotor; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,2 GB) |
| Tipo de robot | `lekiwi_client` |
| Cámaras de entrada | `front` y `wrist` (RGB, 3×480×640 cada una) |
| Dimensión de la observación de estado | 9 |
| Dimensión de la acción de salida | 9 |
| Frecuencia de control del dataset | 30 FPS |
| Librería | LeRobot 0.6.0 |
| Pipeline declarado | robotics |
| Descargas / likes en el Hub | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación en el que un transformer consume observaciones (estado propioceptivo e imágenes) y produce directamente un *chunk* de acciones futuras en lugar de un único paso de control. Esta predicción por bloques reduce el error de acumulación típico del *behavior cloning* paso a paso y mitiga el problema de las demostraciones multimodales, en las que distintas trayectorias humanas válidas pueden promediarse de forma incorrecta. La model card no detalla la configuración interna concreta de esta instancia (número de capas, dimensión del modelo, uso o no de variable latente tipo CVAE, número de pasos de observación apilados), por lo que esos datos quedan como no disponibles.

El entrenamiento se realizó sobre el dataset `sspq/lekiwi_pick_and_place_red_cube`: 110 episodios, 28.632 fotogramas a 30 FPS (unos 15,9 minutos de teleoperación) y una única tarea, "Pick a red cube and place it on box". La configuración registrada es de 100.000 pasos de optimización con batch size 8 (unas 800.000 muestras procesadas), optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0. No se documenta ningún tipo de ajuste posterior por preferencias humanas (RLHF, DPO) ni de aprendizaje por refuerzo: se trata de *behavior cloning* puro sobre demostraciones teleoperadas. Tampoco se describe decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Control visomotor de manipulación: genera `action` de dimensión 9 a partir de `observation.state` (9,) y de dos imágenes RGB de 480×640 (`front` y `wrist`).
- Predicción de chunks de acciones, lo que aporta estabilidad temporal frente a políticas que predicen un único paso.
- Ejecución de una tarea concreta de pick-and-place: coger un cubo rojo y dejarlo en una caja.
- Funcionamiento en bucle cerrado a la frecuencia del dataset (30 FPS), con realimentación visual continua.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia en robot real y `lerobot-train` para reentrenamiento o *fine-tuning*.
- Reentrenamiento sobre nuevos datasets propios mediante el CLI de LeRobot, sustituyendo `--policy.type=act` y el `repo_id` del dataset.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas ni conocimiento general.
- No soporta tool calling, function calling ni orquestación de agentes.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural: la cadena de tarea (`--task=...`) es solo una etiqueta de episodio, no una entrada del modelo.
- No incluye modo de razonamiento (*thinking*), audio ni visión general: las cámaras están ligadas a la configuración concreta de entrenamiento.
- No se documentan capacidades de generalización a otros objetos, colores, posiciones o entornos.

## Casos de uso

- Automatización de pick-and-place en un banco de laboratorio o célula educativa: el modelo controla el robot `lekiwi_client` para recoger un cubo rojo y depositarlo en una caja, con realimentación visual de las cámaras frontal y de muñeca a 30 FPS.
- Baseline reproducible para investigación en imitation learning: al incluir dataset, hiperparámetros y comandos de despliegue, permite reproducir el entrenamiento y usarlo como punto de partida en comparaciones controladas frente a otros métodos como Diffusion Policy.
- Arranque de un pipeline propio de robótica con LeRobot: se graba un dataset nuevo con `lerobot-record`, se entrena con `lerobot-train --policy.type=act` partiendo de esta configuración y se valida con `lerobot-rollout`, aprovechando una receta ya probada.
- Docencia y formación en robótica de bajo coste: ilustra el ciclo completo teleoperación → dataset → entrenamiento → despliegue en un robot de tipo LeKiwi, con un modelo de solo 51,7 M de parámetros que cabe en cualquier GPU.
- Evaluación de infraestructura de inferencia en el borde: sirve para medir latencia real de una política transformer pequeña ejecutándose en tiempo real (presupuesto de 33,3 ms por paso a 30 FPS) sobre GPU de consumo o hardware embebido.
- Clasificación y ordenación de objetos por color: con un *fine-tuning* sobre un dataset nuevo que incluya variaciones de posición y color, el mismo esqueleto ACT puede adaptarse a tareas de *sorting* en línea de producción.
- Pruebas de robustez y análisis de fallos: al ejecutar la política repetidamente con cambios de iluminación, fondo o posición inicial del cubo, se puede caracterizar la sensibilidad del modelo fuera de la distribución de entrenamiento antes de plantear un despliegue real.
- Demostraciones en vídeo y material divulgativo: `lerobot-rollout` permite grabar ejecuciones de 60 segundos (`--duration=60`) sin registrar episodios, útil para generar material de presentación de un sistema robótico completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la sección de evaluación con la nota explícita de que no se han proporcionado resultados para esta política, y no se dispone de tasas de éxito en robot real, número de ensayos ni métricas comparativas (MMLU, HumanEval, GSM8K y similares no aplican a un modelo visomotor). Cualquier cifra de éxito que se cite para este modelo concreto sería una invención.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB en fp32 y 103 MB en fp16 para los 51.674.761 parámetros, más el coste de las activaciones de dos imágenes de 3×480×640 (del orden de decenas de MB). En la práctica, menos de 1 GB de memoria dedicada.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Una A100 o H100 está muy sobredimensionada para inferencia; su interés estaría en entrenamiento o en ejecución de muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, con margen amplio. También es viable la inferencia en CPU o en Apple Silicon, a costa de una latencia mayor que puede comprometer el bucle de control a 30 FPS.
- Entrenamiento: la model card no especifica los requisitos de memoria. Con 51,7 M de parámetros, batch size 8 y dos flujos de imagen a 480×640, es razonable esperar que quepa en GPUs de 8-12 GB, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (con `--strategy.type=base`) y `lerobot-train` para entrenamiento. Los stacks orientados a LLM (vLLM, llama.cpp, Ollama, TGI) no aplican, porque no se trata de un modelo de lenguaje ni de un checkpoint convertible a GGUF.
- Latencia y throughput: no disponibles. El único requisito funcional derivable de los datos es que la política debe producir una acción cada 33,3 ms para mantener los 30 FPS del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| `sspq/lekiwi_pick_and_place_ku` (este) | ACT (action chunking transformer) | 51.674.761 | Estado (9,) + 2 RGB 480×640 | Apache 2.0 | HuggingFace Hub, vía LeRobot | Dataset público de 110 episodios; sin resultados de evaluación |
| ACT de referencia en LeRobot (`lerobot/act_aloha_sim_transfer_cube_human`) | ACT | no disponible | Estado + imágenes de cámaras | Apache 2.0 | HuggingFace Hub, vía LeRobot | Implementación de referencia sobre simulación ALOHA; cifras concretas no disponibles en la información proporcionada |
| Diffusion Policy (Chi et al., 2023) | Política generativa por difusión | no disponible | Estado + imágenes | no disponible | Implementaciones de referencia en repositorios de investigación | Enfoque alternativo con inferencia iterativa, generalmente más costosa por paso que el action chunking |
| SmolVLA (HuggingFace) | VLA (visión-lenguaje-acción) | no disponible | Estado + imágenes + instrucción en lenguaje | no disponible | HuggingFace Hub, vía LeRobot | Añade condicionamiento por lenguaje, lo que permite múltiples tareas con un solo modelo; no comparable en tamaño de datos con esta política |

Los datos de parámetros, contexto y rendimiento de los modelos alternativos no están disponibles en la información proporcionada, por lo que la comparación se limita a categoría, licencia y forma de distribución.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara explícitamente que no se han facilitado resultados, por lo que no existe ninguna tasa de éxito medida en robot real. No es un modelo validado.
- Dataset muy reducido y de una sola tarea: 110 episodios, 28.632 fotogramas y un único objeto (un cubo rojo) en un único entorno. No hay evidencia de generalización a otros objetos, colores, posiciones o disposiciones de la caja.
- Fuerte dependencia del entorno de captura: iluminación, fondo, posición de las cámaras e índices de cámara deben coincidir con los del entrenamiento. La propia documentación advierte de que los nombres de cámara del comando de ejecución deben coincidir con las claves de observación usadas en el entrenamiento.
- Riesgo elevado de fallo fuera de distribución: al ser *behavior cloning* puro sin RLHF ni mecanismos de corrección, el modelo puede degradarse de forma abrupta ante estados no vistos durante la teleoperación.
- Sesgos del dataset: al no haber diversidad documentada de posiciones iniciales, condiciones de luz ni operadores, la política hereda los sesgos de las demostraciones (trayectorias, velocidades y zonas de trabajo concretas). No hay información sobre sesgos adicionales.
- Reproductibilidad: solo se documenta la semilla 1000; no se especifican versiones exactas de PyTorch, CUDA ni del hardware de entrenamiento, lo que puede dificultar la reproducción exacta.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (LeRobot, PyTorch) y de los datos de teleoperación subyacentes, que no se detallan.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que terceros lo hayan reproducido.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural como control de tarea, no soporta tool calling ni agentes, y no debe integrarse en stacks de inferencia de LLM.
- Aviso sobre metadatos: las fechas de creación y actualización registradas son 2026-09-15, dato a tener en cuenta si se usan para trazabilidad.
- Restricción práctica de seguridad: en un robot real, los fallos de la política pueden provocar colisiones; es imprescindible operar con límites de par, paradas de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sspq/lekiwi_pick_and_place_ku
- Dataset de entrenamiento: https://huggingface.co/datasets/sspq/lekiwi_pick_and_place_red_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sspq/lekiwi_pick_and_place_red_cube
- Artículo de ACT (arXiv 2304.13705): https://arxiv.org/abs/2304.13705
- Página del artículo en HuggingFace: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas genéricas del motor de búsqueda), por lo que no se han podido añadir fuentes externas adicionales.
