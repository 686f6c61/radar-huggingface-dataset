# vis22/test2_Robotwin_move_can_pot

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. Esta ficha concreta, `vis22/test2_Robotwin_move_can_pot`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `robotwin_move_can_pot_piper_v30`, orientado a la tarea específica de mover un bote (can pot) en un entorno RoboTwin con un brazo Piper. Con 450 millones de parámetros, el modelo aspira a ejecutarse en hardware de consumo, lo que lo sitúa en la categoría de políticas VLA ligeras frente a alternativas de miles de millones de parámetros.

El modelo resuelve el problema de mapear observaciones visuales y una instrucción en lenguaje natural a acciones motoras de un robot, sin necesidad de ingeniería de recompensas ni RL. Al estar construido sobre LeRobot, se integra directamente en los flujos de entrenamiento y evaluación de esa librería (`lerobot-train`, `lerobot-record`), lo que reduce la fricción para investigadores que quieran reproducir o extender el experimento. Su relevancia actual radica en la tendencia hacia políticas VLA pequeñas y desplegables en GPUs consumer, un área donde SmolVLA se presenta como referencia abierta.

No obstante, conviene subrayar que este repositorio es un artefacto de fine-tuning muy específico: cero descargas, cero likes, un único dataset y una única tarea. No debe confundirse con el modelo base SmolVLA publicado por Hugging Face, cuyas capacidades generales y benchmarks sí están documentados en el paper asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como SmolVLA, un VLA compacto y eficiente según la descripción del autor, con paper asociado (arXiv 2506.01844). No se detallan en la model card la composición interna del backbone visual, el codificador de lenguaje ni el cabezal de acciones, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF/DPO. Lo que sí se conoce es el proceso de ajuste: fine-tuning del checkpoint `lerobot/smolvla_base` sobre el dataset `robotwin_move_can_pot_piper_v30`, mediante la herramienta `lerobot-train` del ecosistema LeRobot. El pipeline declarado es `robotics` y el modelo está pensado para inferencia en bucle cerrado con `lerobot-record` sobre un robot `so100_follower` (según el ejemplo de la model card).

La innovación principal, según la descripción del autor, es conseguir rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo. No se aportan en la información proporcionada detalles sobre decodificación especulativa, atención lineal ni otras técnicas concretas.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Ejecución de la tarea específica de mover un bote (can pot) en el entorno RoboTwin con brazo Piper, para la que fue fine-tuneado.
- Integración nativa con LeRobot para entrenamiento, evaluación y registro de episodios.
- Despliegue en hardware de consumo según la descripción del autor (sin cifras concretas disponibles).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles más allá del uso robótico descrito.

## Casos de uso

- Reproducción de experimentos RoboTwin: el modelo permite repetir el fine-tuning y la evaluación de la tarea `move_can_pot` con el brazo Piper usando LeRobot, útil para validar resultados del paper o comparar configuraciones de entrenamiento.
- Punto de partida para fine-tuning en tareas de manipulación similares: al estar basado en `lerobot/smolvla_base`, puede servir como inicialización para otros datasets de agarre y colocación con brazos de bajo coste.
- Evaluación de políticas VLA en hardware de consumo: su tamaño de 450 M de parámetros y su orientación a GPUs consumer permiten montar un banco de pruebas de inferencia en estaciones de trabajo sin clúster.
- Docencia y formación en robótica de imitación: el flujo `lerobot-train` / `lerobot-record` con un modelo pequeño facilita prácticas reproducibles en cursos sobre VLA.
- Integración en pipelines de investigación con LeRobot: sirve como baseline específico de tarea para comparar contra políticas ACT u otras disponibles en la librería.
- Pruebas de despliegue en robot `so100_follower`: el ejemplo de la model card muestra cómo ejecutar episodios de evaluación directamente sobre ese robot, lo que permite validar la cadena completa observación-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, una estimación orientativa en fp16 sería de aproximadamente 1 GB de pesos, más memoria para activaciones y buffers de observación (cifra no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; el autor indica únicamente despliegue en hardware de consumo.
- ¿Cabe en GPU consumer? Según la descripción del autor, sí; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/test2_Robotwin_move_can_pot | 450 M | no disponible | Manipulación robótica (move can pot, RoboTwin/Piper) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA general base para fine-tuning | no disponible en la información | Hugging Face (modelo base citado) |
| Políticas ACT en LeRobot | no disponible en la información | no disponible | Imitación robótica | no disponible en la información | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea (`move_can_pot`) y un único dataset/robot (Piper en RoboTwin); no es un VLA de propósito general.
- Sin métricas publicadas: no hay benchmarks, tasas de éxito ni curvas de entrenamiento en la información disponible, lo que impide evaluar su calidad objetivamente.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un fine-tuning sobre un dataset concreto, es probable que generalice mal a variaciones de iluminación, posiciones de objeto o robots distintos (no confirmado por el autor).
- Idiomas y contexto: no disponibles; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base (`lerobot/smolvla_base`) y del dataset empleado.
- Advertencia de producción: no se recomienda su uso en entornos reales sin una evaluación propia exhaustiva y sin confirmar la correspondencia entre el robot de entrenamiento y el de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/test2_Robotwin_move_can_pot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
