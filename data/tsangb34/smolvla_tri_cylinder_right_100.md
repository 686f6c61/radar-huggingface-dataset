# tsangb34/smolvla_tri_cylinder_right_100

## Resumen

smolvla_tri_cylinder_right_100 es una política robótica de tipo vision-language-action (VLA) obtenida por fine-tuning de `lerobot/smolvla_base`, el modelo fundacional ligero de Hugging Face para robótica. La desarrolla el usuario tsangb34 (Sang Nguyen) y está especializada en una única tarea sobre el brazo SO-101 dentro del simulador MuJoCo `so101-libero-mini`: colocar el cilindro gris claro a la derecha del cubo rojo. El modelo consume el estado articular de 6 dimensiones y tres cámaras RGB de 256×256, y emite acciones de 6 dimensiones en trozos de 50.

Con 450.046.176 parámetros (unos 450 M) y un repositorio de 0,9 GB en safetensors, se trata de un modelo pequeño pensado para inferencia en tiempo real y para servir como ejemplo reproducible de fine-tuning de SmolVLA sobre LeRobot. Su relevancia es doble: por un lado demuestra el flujo completo de entrenamiento y evaluación de una política VLA en simulación con métricas publicadas; por otro, su licencia Apache 2.0 y su tamaño permiten desplegarlo en hardware modesto.

La model card reporta una tasa de éxito del 96 % (48/50 episodios, intervalo de Wilson del 95 %: 86,5 %–98,9 %) en el checkpoint final de 80.000 pasos, con una mejora clara respecto al checkpoint de 20.000 pasos (72 %). No se han publicado datos de benchmarks estándar de VLA ni comparaciones con otras políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre LeRobot, fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible; las instrucciones de entrenamiento están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |

Especificaciones adicionales de la política:

| Parametro | Valor |
|---|---|
| Entrada de estado | `observation.state`, 6-D (estado articular) |
| Entradas visuales | 3 cámaras RGB de 256×256 (`camera1`, `camera2`, `camera3`) |
| Salida | acción de 6-D en chunks de 50 |
| Entorno de entrenamiento | MuJoCo, `so101-libero-mini` |
| Dataset de entrenamiento | `so101_tri_cylinder_right_100` |
| Pasos de entrenamiento | 80.000 |
| Batch size | 32 |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, el modelo fundacional ligero de SmolVLA de Hugging Face. SmolVLA toma como entrada varias vistas de cámara, el estado sensoriomotor del robot y una instrucción en lenguaje natural; estas entradas se codifican en características contextuales que condicionan un "action expert" encargado de predecir las acciones. El fine-tuning se realizó sobre el dataset `so101_tri_cylinder_right_100`, que cubre una única tarea del simulador MuJoCo `so101-libero-mini`, con instrucción en inglés: "Put the light gray cylinder to the right of the red cube."

El entrenamiento consistió en 80.000 pasos con batch size 32, learning rate 0,0001 y semilla 1000. Los pesos de la raíz del repositorio corresponden al checkpoint final (paso 80.000). La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco menciona innovaciones de decodificación o atención específicas más allá de la arquitectura base de SmolVLA. La predicción se realiza en chunks de 50 acciones, un esquema habitual en políticas de imitación para reducir la frecuencia de inferencia.

## Capacidades

- Control robótico de imitación: predice acciones de 6-D para el brazo SO-101 a partir de estado articular y tres vistas RGB.
- Condicionamiento por lenguaje natural: acepta una instrucción textual que especifica la tarea a ejecutar.
- Percepción visual multi-cámara: integra tres cámaras de 256×256 para guiar la manipulación.
- Predicción de acciones en chunks de 50, adecuada para control en bucle cerrado en simulación.
- Ejecución de una tarea concreta de manipulación (colocar un cilindro junto a un cubo) en el entorno `so101-libero-mini`.
- Integración con el ecosistema LeRobot mediante `SmolVLAPolicy.from_pretrained`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código, audio ni visión fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos de VLA en simulación: sirve como referencia completa (dataset, pesos, evaluación y vídeos de rollouts) para validar un pipeline de entrenamiento SmolVLA sobre MuJoCo.
- Fine-tuning de políticas para el brazo SO-101: el modelo puede actuar como punto de partida o como ejemplo de receta (80.000 pasos, batch 32, lr 1e-4) para nuevas tareas de manipulación.
- Evaluación de robustez de políticas de imitación: los checkpoints intermedios y las métricas de éxito por paso permiten estudiar la curva de aprendizaje y la varianza entre episodios.
- Docencia y formación en robótica: su tamaño de 450 M parámetros y su licencia Apache 2.0 facilitan su uso en cursos y talleres sobre LeRobot y políticas VLA.
- Pruebas de integración con LeRobot: permite verificar la carga del modelo, el formateo de observaciones (estado + tres cámaras) y la ejecución de acciones en chunks en un entorno controlado.
- Generación de datos sintéticos y análisis de fallos: los rollouts en simulación pueden usarse para estudiar modos de fallo (por ejemplo, el 4 % de episodios fallidos) antes de transferir la política a un robot físico.
- Benchmark interno de infraestructura de inferencia: al ser un modelo pequeño, sirve para medir latencia y throughput de despliegues LeRobot en hardware consumer.

## Benchmarks y rendimiento

La model card reporta la evaluación en simulación con 50 episodios por checkpoint y un intervalo de Wilson del 95 %:

| Checkpoint (pasos) | Éxitos | Tasa de éxito | IC 95 % (Wilson) |
|---|---|---|---|
| 20.000 | 36/50 | 72 % | [58,3 %, 82,5 %] |
| 40.000 | 47/50 | 94 % | [83,8 %, 97,9 %] |
| 60.000 | 48/50 | 96 % | [86,5 %, 98,9 %] |
| 80.000 | 48/50 | 96 % | [86,5 %, 98,9 %] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otras políticas VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en safetensors (0,9 GB), los pesos en fp32 ocupan aproximadamente 1,8 GB y en fp16 unos 0,9 GB, a lo que hay que sumar el coste de los tres codificadores visuales y del action expert.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en fp16, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, pero no se han publicado pruebas de latencia ni de throughput.
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el cauce habitual para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_tri_cylinder_right_100 | 450.046.176 | no disponible | Manipulación SO-101 en MuJoCo (una tarea) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | Modelo fundacional VLA para fine-tuning | no disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA (p. ej. RT-2, OpenVLA) | no disponible en la información proporcionada | no disponible | Manipulación general | no disponible en la información proporcionada | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único entorno (`so101-libero-mini`); no generaliza a otras instrucciones ni a otros objetos.
- Entrenamiento exclusivamente en simulación: no hay evidencia de transferencia al robot físico SO-101 ni de robustez ante variaciones de iluminación, cámara o dinámica real.
- Idiomas: la instrucción de entrenamiento está en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación y de acciones erróneas: como política de imitación, puede producir trayectorias no válidas fuera de la distribución de entrenamiento; la model card reporta un 4 % de fallos en el checkpoint final.
- Sesgos: no documentados; al entrenarse en un simulador concreto, puede heredar sesgos de la distribución del dataset `so101_tri_cylinder_right_100`.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `lerobot/smolvla_base` y del dataset utilizado.
- Reproducibilidad: se indica semilla 1000, pero no se detallan versiones de librerías ni configuración completa de entrenamiento.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo validado en producción.
- Sin datos de cuantización ni de contexto: no se puede planificar un despliegue con cuantización agresiva ni con instrucciones largas sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/smolvla_tri_cylinder_right_100
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Perfil del autor: https://huggingface.co/tsangb34/models
- Resultados de evaluación: carpeta `eval/` del repositorio (incluye `results.json`, `episodes.csv` y vídeos de rollouts)
