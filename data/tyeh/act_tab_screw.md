# tyeh/act_tab_screw

## Resumen

`tyeh/act_tab_screw` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele elevar las tasas de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. Lo desarrolla el usuario `tyeh` y se distribuye empaquetado para la librería LeRobot de Hugging Face.

La política está especializada en una única tarea: "tab screw and pick and place", ejecutada sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) con tres cámaras RGB de 480x640 (Gripper View, Top View y Side View). Consume un vector de estado de 6 dimensiones y produce un vector de acción de 6 dimensiones. El checkpoint tiene 51.617.414 parámetros y ocupa 0,2 GB en el repositorio, lo que lo hace muy ligero para inferencia en tiempo real.

Es relevante como ejemplo reproducible de un flujo completo de imitación end-to-end con LeRobot 0.7.0: dataset público de 30 episodios y 12.564 frames a 30 FPS, configuración de entrenamiento documentada (50.000 pasos, batch 32, AdamW, lr 2e-5) y comandos listos para ejecutar con `lerobot-rollout`. No obstante, el autor no ha publicado resultados de evaluación en robot real ni ha especificado la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de ACT, no por un contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas; la instrucción de tarea es una cadena fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes por cámara) con un transformer que modela la secuencia de observaciones y emite un chunk de acciones futuro. La innovación principal del método es la predicción de bloques de acciones junto con un mecanismo de temporal ensembling, que suaviza las transiciones y mejora la robustez frente a la incertidumbre de la política. En esta instancia concreta, la entrada son tres imágenes RGB de 3x480x640 más un vector de estado de 6 componentes, y la salida es un vector de acción de 6 componentes, coherente con un brazo de 6 grados de libertad.

El entrenamiento se realizó por imitación supervisada sobre el dataset `grablab/tab_screw_pnp_1_20261123_161223` (30 episodios, 12.564 frames a 30 FPS) con 50.000 pasos, batch size 32, optimizador AdamW, learning rate 2e-5 y semilla 1000, usando LeRobot 0.7.0. No se documenta el número de tokens ni composición adicional del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline de imitation learning puro). Tampoco se especifican detalles del backbone visual ni el tamaño del chunk de acciones configurado.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Percepción multi-cámara: integra simultáneamente tres vistas (Gripper, Top y Side) a 480x640 para estimar la geometría de la escena.
- Ejecución de una tarea específica: "tab screw and pick and place", es decir, atornillado de pestaña y recogida y colocación de piezas.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del control.
- Inferencia en tiempo real: compatible con `lerobot-rollout` sobre hardware estándar de LeRobot a 30 FPS.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política puramente motora.

## Casos de uso

- Automatización de atornillado en línea de montaje: la política ejecuta la secuencia de "tab screw" sobre piezas posicionadas de forma similar a las del dataset, aprovechando las tres vistas para localizar la pestaña y alinear la herramienta. Adecuada porque el método ACT está diseñado para tareas de contacto con tolerancias ajustadas.
- Pick-and-place de componentes pequeños: recogida y colocación de piezas en posiciones fijas o ligeramente variables, usando la vista superior para la localización y la vista de pinza para el ajuste fino.
- Banco de pruebas docente en robótica: sirve como ejemplo reproducible de un pipeline completo de imitation learning (grabación, entrenamiento, rollout) con LeRobot 0.7.0, útil en cursos y laboratorios.
- Base para fine-tuning en tareas análogas: al ser un checkpoint ligero (51,6 M de parámetros), se puede reentrenar con `lerobot-train` sobre nuevos datasets de manipulación con el mismo robot y configuración de cámaras.
- Investigación en imitación con pocos datos: con solo 30 episodios y 12.564 frames, permite estudiar la sensibilidad de ACT al número de demostraciones y a la variabilidad de posiciones.
- Despliegue en hardware de bajo coste: al ocupar 0,2 GB y requerir solo una GPU consumer para inferencia, encaja en estaciones de trabajo con RTX 3060/4060 o superiores para prototipado rápido.
- Validación de protocolos de seguridad en manipulación: útil para medir el comportamiento de una política ante cambios de iluminación o distracciones antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tabla de tasas de éxito por tarea ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para los 51,6 M de parámetros, más el coste de procesar tres imágenes de 3x480x640 por paso; en la práctica, menos de 4 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para entrenamiento, se recomienda una GPU con 12 GB o más (RTX 3090/4090, A10, L4, A100).
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores, así como en portátiles con GPU dedicada de gama media.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) es la vía documentada; también se puede integrar en Python mediante la API de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles de forma oficial. El dataset está grabado a 30 FPS, por lo que el bucle de control debe sostener esa frecuencia; con 51,6 M de parámetros y tres cámaras de 480x640, es alcanzable en GPU consumer, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tyeh/act_tab_screw` | 51,6 M | ACT (imitación) | 3 cámaras 480x640 + estado 6D | no disponible | Hugging Face |
| ACT genérico de LeRobot (`lerobot/act_*`) | ~51 M (varía) | ACT (imitación) | Varía por checkpoint | Apache-2.0 (referencia de LeRobot) | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | ~decenas de M (varía) | Política por difusión | Varía por checkpoint | varía por checkpoint | Hugging Face / repos de investigación |
| VQ-BeT (Lee et al., 2024) | ~decenas de M (varía) | Política discretizada | Varía por checkpoint | varía por checkpoint | Hugging Face / repos de investigación |

La comparación cuantitativa de rendimiento no está disponible porque este checkpoint no publica evaluación. En términos de licencia, este modelo no declara condiciones, mientras que la implementación de referencia de ACT en LeRobot se distribuye bajo Apache-2.0; conviene verificar antes de uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada sobre una única tarea y un único robot (`so_follower`); generalizará mal a otras tareas, objetos, posiciones de cámara o brazos distintos.
- Riesgo de alucinación motora: como toda política de imitación, puede producir acciones fuera de distribución ante escenas no vistas (iluminación distinta, objetos nuevos, oclusiones), con riesgo físico para el robot y el entorno.
- Limitaciones de contexto: no hay una ventana de contexto lingüístico; la instrucción de tarea es una cadena fija ("tab screw and pick and place") y no admite instrucciones en lenguaje natural variables.
- Restricciones de licencia: la licencia no está especificada ("[More Information Needed]"), por lo que no se puede asumir uso comercial sin contactar con el autor.
- Dataset pequeño: 30 episodios y 12.564 frames son una base limitada; la variabilidad de posiciones e iluminación cubierta es reducida.
- Sin evaluación publicada: no hay tasas de éxito medidas en robot real, ni protocolo de repeticiones, ni análisis de fallos.
- Dependencia de la configuración de cámaras: los nombres y resoluciones de las cámaras deben coincidir exactamente con los usados en entrenamiento (Gripper View, Top View, Side View a 480x640, 30 FPS).
- Sin cuantizaciones oficiales: no se ofrecen variantes GGUF/INT8, por lo que el despliegue en CPU pura no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyeh/act_tab_screw
- Dataset de entrenamiento: https://huggingface.co/datasets/grablab/tab_screw_pnp_1_20261123_161223
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=grablab/tab_screw_pnp_1_20261123_161223
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
