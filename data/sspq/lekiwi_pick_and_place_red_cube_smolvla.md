# sspq/lekiwi_pick_and_place_red_cube_smolvla

## Resumen

`sspq/lekiwi_pick_and_place_red_cube_smolvla` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario `sspq` en HuggingFace, obtenida mediante fine-tuning del modelo base `lerobot/smolvla_base` con la librería LeRobot. SmolVLA es un modelo compacto (450.046.176 parámetros, es decir, unos 450 M) que combina un backbone de visión-lenguaje con un experto de acciones, y que según su model card está diseñado para "alcanzar un rendimiento competitivo con costes computacionales reducidos y poder desplegarse en hardware de consumo". El problema que resuelve esta instancia concreta es el control de un robot móvil LeKiwi para una tarea de pick-and-place: coger un cubo rojo y colocarlo en una caja.

A diferencia de un LLM de propósito general, este artefacto no genera texto: consume observaciones multimodales (el estado del robot y hasta tres flujos de cámara) y produce un vector de acción de 9 dimensiones a partir de una instrucción de tarea en lenguaje natural. Su relevancia práctica es doble: por un lado, sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación sobre hardware asequible; por otro, es un punto de partida para quien quiera hacer fine-tuning de SmolVLA en sus propias tareas con un coste de entrenamiento muy inferior al de los VLA de escala multi-millonaria.

El modelo se publicó junto al dataset `sspq/lekiwi_pick_and_place_red_cube` (110 episodios, 28.632 fotogramas a 30 FPS) y se entrenó durante 100.000 pasos con AdamW y una tasa de aprendizaje de 1e-4. No se han publicado resultados de evaluación ni tasa de éxito, y el repositorio no registra descargas ni "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone de visión-lenguaje más experto de acciones (SmolVLA) |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio distribuye pesos safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible. La instrucción de tarea utilizada en el entrenamiento está en inglés: "Pick a red cube and place it on box" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |
| Librería de referencia | lerobot |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Tipo de robot | `lekiwi_client` |
| Cámaras | `front`, `wrist` (según Model Details); la tabla de entradas lista tres: `camera1`, `camera2`, `camera3` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entradas visuales | VISUAL, forma `(3, 256, 256)` por cámara |
| Salida `action` | ACTION, forma `(9,)` |
| Dataset de entrenamiento | sspq/lekiwi_pick_and_place_red_cube (110 episodios, 28.632 fotogramas, 30 FPS) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que acopla un backbone de visión-lenguaje (de la familia SmolVLM) a un experto de acciones que genera las órdenes motoras. La model card lo describe como un modelo "compacto y eficiente" capaz de funcionar en hardware de consumo, y enlaza el artículo arXiv 2506.01844 como referencia metodológica. La información proporcionada no detalla el número de capas, la dimensión oculta ni el mecanismo exacto de atención del experto de acciones, por lo que esos datos quedan como no disponibles.

El entrenamiento de esta instancia concreta es un fine-tuning supervisado por imitación sobre el checkpoint `lerobot/smolvla_base`. La configuración declarada es: 100.000 pasos de entrenamiento, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot 0.6.0. El dataset contiene 110 episodios y 28.632 fotogramas grabados a 30 FPS de una única tarea ("Pick a red cube and place it on box"). No se documenta en la información disponible si hubo etapas de RLHF, DPO, reward modeling ni decodificación especulativa; tampoco se detalla la composición del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico de pick-and-place: genera secuencias de acciones de 9 dimensiones para coger un cubo rojo y depositarlo en una caja.
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto (`--task`) junto con las observaciones, lo que permite reutilizar la arquitectura para otras consignas dentro del mismo dominio.
- Percepción visual multi-cámara: consume hasta tres imágenes de 3×256×256 píxeles, lo que aporta información de perspectiva global y de muñeca.
- Fusión de estado propioceptivo: integra un vector de estado de 6 dimensiones (posición articular y/o base del robot) junto con las imágenes.
- Aprendizaje por imitación: reproduce la política demostrada en el dataset, sin necesidad de definir recompensas ni un simulador.
- Ejecución en bucle cerrado a 30 FPS en hardware de consumo, en línea con la vocación de eficiencia de SmolVLA.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, planificación multi-paso ni razonamiento simbólico.
- No se documentan capacidades multilingües; la única instrucción conocida está en inglés.
- No se documentan modos especiales (thinking mode, audio, vídeo largo) en la información disponible.

## Casos de uso

- Automatización de pick-and-place en células de montaje sencillas: el modelo recibe las imágenes de las cámaras y el estado del LeKiwi y emite acciones de 9 dimensiones para trasladar una pieza de un punto a otro, sin necesidad de programar una trayectoria explícita.
- Fine-tuning para nuevos objetos y posiciones: partiendo de `sspq/lekiwi_pick_and_place_red_cube_smolvla` o de `lerobot/smolvla_base`, un equipo puede grabar su propio dataset con LeRobot y reentrenar la política con la misma receta (AdamW, lr 1e-4, lotes de 16), reutilizando el pipeline documentado.
- Banco de pruebas reproducible en investigación en aprendizaje por imitación: al publicar el dataset y la configuración de entrenamiento, permite comparar variantes de política manteniendo fijos los datos y el hardware.
- Robótica educativa y de laboratorio con hardware asequible: el robot LeKiwi y una política de 450 M de parámetros son desplegables en GPU de gama de consumo, lo que facilita prácticas docentes sin clústeres dedicados.
- Evaluación de robustez ante cambios de entorno: el modelo permite medir de forma controlada cómo degrada la tasa de éxito al variar iluminación, posición inicial del cubo, color del fondo o presencia de distractores, tal y como sugiere la propia plantilla de evaluación de la model card.
- Recolección de datos y teleoperación asistida: el comando `lerobot-rollout` con `--strategy.type=base` ejecuta la política sin grabar episodios, lo que sirve para validar la calibración de cámaras y robot antes de una campaña de captura de datos.
- Integración en pipelines de LeRobot: al ser un checkpoint compatible con `lerobot-train` y `lerobot-rollout`, encaja en flujos de trabajo existentes de entrenamiento, versionado y despliegue de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación explícitamente vacía: "_No evaluation results have been provided for this policy yet._" Por tanto, no hay tasa de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, los pesos ocupan del orden de 0,9 GB en el repositorio publicado; sumando activaciones, buffers de imagen (tres entradas de 3×256×256) y el entorno de PyTorch, una estimación prudente es de 2 a 4 GB de VRAM. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en principio; las GPU de gama alta (A100, H100) no aportan ventaja significativa aquí salvo por paralelismo de evaluación. El modelo está pensado para hardware de consumo.
- ¿Cabe en GPU de consumo? Sí: tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores deberían ejecutar la política sin problema. También es viable en CPU, aunque con menor frecuencia de control (dato no disponible).
- Opciones de despliegue: el camino documentado es LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de acciones.
- Latencia y throughput: no disponibles. El bucle de control del dataset se grabó a 30 FPS y LeRobot utiliza el concepto de inferencia asíncrona para políticas de este tipo, pero no se publica ninguna medición de latencia para este checkpoint concreto.
- Requisitos adicionales: robot LeKiwi con `lekiwi_client`, al menos dos cámaras OpenCV configuradas a 640×480 y 30 FPS, cuyos nombres e índices deben coincidir con las claves de observación del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Contexto / notas |
|---|---|---|---|---|---|
| `sspq/lekiwi_pick_and_place_red_cube_smolvla` (este) | 450 M | VLA (SmolVLA fine-tune) | Apache 2.0 | HuggingFace, 0 descargas | Especializado en una única tarea con LeKiwi; sin evaluación publicada |
| `lerobot/smolvla_base` | No disponible (mismo backbone SmolVLA) | VLA preentrenado | No disponible en la información proporcionada | HuggingFace | Checkpoint base para fine-tuning; el autor de esta ficha lo usa como punto de partida |
| ACT (Action Chunking Transformer, implementado en LeRobot) | No disponible | Política de imitación basada en transformer | No disponible en la información proporcionada | Código y checkpoints en LeRobot | No incorpora un backbone de visión-lenguaje preentrenado a gran escala; típicamente requiere más demostraciones para generalizar |
| Diffusion Policy (implementado en LeRobot) | No disponible | Política de imitación generativa por difusión | No disponible en la información proporcionada | Código y checkpoints en LeRobot | Genera trayectorias multimodales; sin condicionamiento por lenguaje |
| Políticas VLA de mayor escala (por ejemplo, familia pi0) | No disponible | VLA | No disponible en la información proporcionada | HuggingFace / LeRobot | Mayor coste computacional y de despliegue; no cabe con holgura en hardware de consumo |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea, un único objeto (un cubo rojo) y un robot concreto (`lekiwi_client`). Se espera una degradación severa ante cualquier cambio de objeto, de disposición de la escena o de robot.
- Dataset muy pequeño: 110 episodios y 28.632 fotogramas son insuficientes para una generalización robusta; el riesgo de sobreajuste a posiciones, iluminación, fondo y textura del entorno de grabación es alto.
- Sin resultados de evaluación: el autor no reporta tasa de éxito ni número de ensayos, por lo que el rendimiento real de la política es desconocido.
- Discrepancia en la propia model card: la sección Model Details indica las cámaras `front` y `wrist`, mientras que la tabla de entradas enumera tres cámaras (`camera1`, `camera2`, `camera3`) de 3×256×256. Conviene verificar el número y los nombres exactos antes de desplegar.
- Dependencia de calibración: los nombres e índices de cámara deben coincidir exactamente con las claves de observación usadas en el entrenamiento; un desajuste invalida la inferencia.
- Idiomas: no se declara ningún idioma soportado; la única instrucción documentada está en inglés, y no hay evidencia de que el modelo responda correctamente a consignas en castellano.
- Alucinación y seguridad física: aunque no genera texto, puede producir acciones fuera de distribución ante entradas anómalas, con riesgo de colisión, caída del objeto o daño al efector. Se recomienda limitar velocidad y par, y disponer de parada de emergencia.
- Sesgos: no se documenta ningún análisis de sesgo. Al depender de datos visuales, puede heredar sesgos de iluminación, color y composición del dataset de captura.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad; la seguridad en un robot real recae íntegramente en quien despliega el modelo.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta, sin informes independientes de funcionamiento.
- Metadato llamativo: la fecha de creación registrada en el Hub es 2026-09-15, posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio.
- Restricciones del entorno de ejecución: al no distribuirse cuantizaciones alternativas ni formatos GGUF, el despliegue queda ligado al stack PyTorch/LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sspq/lekiwi_pick_and_place_red_cube_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/sspq/lekiwi_pick_and_place_red_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sspq/lekiwi_pick_and_place_red_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre SmolVLA; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
