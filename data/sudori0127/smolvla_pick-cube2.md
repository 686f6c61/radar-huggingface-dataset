# sudori0127/smolvla_pick-cube2

## Resumen

`sudori0127/smolvla_pick-cube2` es un modelo de visión-lenguaje-acción (VLA) compacto afinado para robótica real, concretamente para la tarea de agarre de un cubo negro ("Grab the black cube") con un robot tipo `so_follower` (SO-100/SO-101 de LeRobot). Se trata de un fine-tuning del modelo base `lerobot/smolvla_base`, que corresponde a la arquitectura SmolVLA presentada en el paper arXiv:2506.01844. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras de 256x256) y produce comandos de acción de 6 dimensiones.

El modelo resuelve el problema de la imitación visual-motora de bajo coste: permite entrenar y desplegar políticas robóticas en hardware de consumo, sin necesidad de clústeres de GPU. Con 450 millones de parámetros y un repositorio de 0,9 GB, es lo suficientemente ligero para ejecutarse en una GPU de gama media o incluso en CPU con latencias aceptables para control a 30 FPS.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face, que está estandarizando el entrenamiento y despliegue de políticas robóticas open source. Este checkpoint concreto es un ejemplo de fine-tuning sobre un dataset propio pequeño (51 episodios, 22 099 frames) y sirve como referencia práctica de cómo adaptar SmolVLA a una tarea específica con recursos mínimos. No obstante, el autor no ha publicado resultados de evaluación, por lo que su rendimiento real en el robot no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica; el componente de lenguaje no se documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | so_follower |
| Camaras | overhead, wrist (3 entradas visuales de 3x256x256) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones, siguiendo el paradigma de los VLA pero con un presupuesto computacional reducido. El modelo procesa tres cámaras (256x256 cada una) junto con el estado articular de 6 dimensiones y una instrucción en lenguaje natural, y emite un vector de acción de 6 dimensiones. El paper de referencia (arXiv:2506.01844) describe el diseño orientado a despliegue en hardware de consumo, aunque los detalles concretos de la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) no se detallan en la model card.

El fine-tuning se realizó sobre el dataset `sudori0127/pick-cube2`, compuesto por 51 episodios y 22 099 frames grabados a 30 FPS, con la única tarea "Grab the black cube". La configuración de entrenamiento fue de 100 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.0. No se documenta si hubo aumento de datos, RLHF/DPO ni ninguna innovación técnica adicional más allá del propio método SmolVLA. El dataset es extremadamente pequeño, lo que limita la generalización.

## Capacidades

- Control robótico de imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 (overhead y wrist, más una tercera cámara no especificada).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante el prompt "Grab the black cube".
- Ejecución de una tarea única de manipulación: agarre de un cubo negro.
- Despliegue en hardware de consumo: el tamaño del modelo (450 M parámetros) permite inferencia en GPU de gama media.
- Integración con LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la tarea de agarre de un cubo negro con un SO-100/SO-101, adecuado para prototipos de investigación en manipulación robótica de bajo coste.
- **Base para fine-tuning de tareas específicas**: sirve como punto de partida para adaptar SmolVLA a nuevas tareas con datasets pequeños (51 episodios), usando `lerobot-train` con `--policy.path=lerobot/smolvla_base`.
- **Validación de pipelines de imitación**: útil para probar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) antes de escalar a tareas más complejas.
- **Demostraciones educativas de VLA**: el modelo permite mostrar en cursos o talleres cómo un VLA compacto controla un robot real en hardware asequible.
- **Investigación en generalización visual**: al tener tres cámaras y un dataset pequeño, es un caso de estudio para analizar robustez ante cambios de iluminación o posición del objeto.
- **Benchmark de eficiencia en robótica**: con 450 M parámetros y 0,9 GB, permite medir latencia y throughput en GPUs de consumo frente a VLA más grandes.
- **Integración en entornos de simulación-a-realidad**: puede usarse como política de referencia para comparar con políticas entrenadas en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial; con 450 M parámetros en fp32 se estiman aproximadamente 1,8 GB de pesos, y en fp16 alrededor de 0,9 GB, más el overhead de las tres cámaras y el grafo de inferencia.
- **GPU recomendadas**: no especificadas por el autor; por tamaño, cabría en RTX 3060/4060, RTX 4090, A100 y H100. El paper de SmolVLA enfatiza el despliegue en hardware de consumo.
- **¿Cabe en GPU de consumo?**: sí, por el tamaño del modelo, aunque no hay confirmación oficial de latencias.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de acciones).
- **Latencia y throughput estimados**: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el control se espera en ese orden de frecuencia, pero no se confirma que el modelo alcance esa tasa en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sudori0127/smolvla_pick-cube2 | 450 M | no disponible | Agarre de cubo (SO-100) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base multi-tarea | Apache 2.0 | Hugging Face |
| Otros VLA (p. ej. OpenVLA) | no disponible en la informacion proporcionada | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni resultados en robot real, por lo que el rendimiento es desconocido.
- **Dataset muy pequeño**: 51 episodios y una sola tarea limitan la generalización a posiciones, iluminación o distracciones distintas.
- **Tarea única**: el modelo solo está entrenado para "Grab the black cube"; no es un VLA de propósito general.
- **Dependencia de hardware específico**: requiere un robot `so_follower` y tres cámaras con los nombres y calibración exactos del dataset.
- **Riesgo de sobreajuste**: con 100 000 pasos sobre 22 099 frames, es probable un ajuste excesivo a las condiciones de grabación.
- **Idiomas no documentados**: el componente de lenguaje no tiene idiomas declarados; el prompt debe ser el de entrenamiento.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- **Sin datos de sesgos**: no se documentan sesgos conocidos, aunque al ser un modelo visual puede verse afectado por condiciones de iluminación y sesgos del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudori0127/smolvla_pick-cube2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/sudori0127/pick-cube2
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sudori0127/pick-cube2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
