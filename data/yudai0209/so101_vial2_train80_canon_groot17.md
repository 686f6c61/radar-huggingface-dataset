# yudai0209/so101_vial2_train80_canon_groot17

## Resumen

`yudai0209/so101_vial2_train80_canon_groot17` es una política de control robótico entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El checkpoint ha sido ajustado (fine-tuning) por el usuario yudai0209 para una tarea concreta de manipulación con un robot `so_follower` (SO-101): coger un objeto verde y depositarlo en un orificio magenta. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción.

El interés de esta ficha es doble: por un lado documenta un caso real de aplicación de un modelo fundacional robótico a una tarea de imitación con pocos datos (80 episodios, 47.589 frames a 30 FPS); por otro, sirve como referencia práctica de cómo LeRobot 0.6.1 empaqueta y publica políticas GR00T listas para `lerobot-rollout`. El repositorio ocupa 12,6 GB y contiene 3.144.016.000 parámetros en formato safetensors, lo que refleja que se publica el modelo completo (backbone + cabeza de acciones), no solo un adaptador ligero.

La relevancia actual radica en que GR00T N1.7 es una de las apuestas abiertas de NVIDIA para estandarizar el control de robots con modelos fundacionales, y este checkpoint demuestra el flujo completo: dataset propio en el Hub, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` sobre hardware asequible tipo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (la tarea está definida en inglés: "pick up the green object and put it in the magenta hole") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas condicionadas por visión, lenguaje y propriocepción. Las entradas de la política son `observation.state` con forma `(6,)`, dos cámaras RGB (`overhead` y `wrist`) a 480×640×3, y la salida es un vector de acción de forma `(6,)` correspondiente a las articulaciones del `so_follower`.

El ajuste se realizó sobre el dataset `yudai0209/so101_vial2_train80_canon`, con 80 episodios y 47.589 frames a 30 FPS, para la tarea "pick up the green object and put it in the magenta hole". La configuración de entrenamiento fue: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4, semilla 42 y LeRobot 0.6.1. No se documenta en la model card el número de tokens del backbone, la composición del dataset de preentrenamiento de GR00T ni si hubo RLHF/DPO; esos detalles corresponden al modelo base de NVIDIA y no están disponibles en la información proporcionada.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de dos vistas de cámara y el estado de las articulaciones.
- Condicionamiento por lenguaje natural: la tarea se especifica mediante el prompt "pick up the green object and put it in the magenta hole".
- Percepción visual multi-cámara: consume simultáneamente una vista cenital (`overhead`) y una vista de muñeca (`wrist`) a 480×640.
- Fusión de propriocepción y visión: integra el estado de las articulaciones con las imágenes para generar la acción.
- Política de imitación entrenada con 80 episodios: apta para tareas de pick-and-place con objetos y contenedores de colores concretos.
- Inferencia en tiempo real a 30 FPS mediante `lerobot-rollout` con `--strategy.type=base`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; es una política robótica, no un LLM conversacional.

## Casos de uso

- Pick-and-place industrial ligero: el modelo ejecuta la secuencia de coger un objeto verde y colocarlo en un orificio magenta sobre un robot SO-101, adecuado para tareas de clasificación y ensamblaje de baja precisión con objetos de color codificado.
- Prototipado rápido de políticas con LeRobot: sirve como plantilla reproducible para equipos que quieran entrenar su propia política GR00T sobre un dataset propio de 80 episodios y desplegarla con `lerobot-rollout`.
- Investigación en imitación con pocos datos: permite estudiar el rendimiento de GR00T N1.7 con 47.589 frames y 20.000 pasos de entrenamiento, como línea base para comparar con otros volúmenes de datos o hiperparámetros.
- Automatización de laboratorio docente: el SO-101 es un brazo de bajo coste, y esta política permite demostrar el ciclo completo (grabación, entrenamiento, despliegue) en entornos académicos sin GPU de datacenter.
- Benchmark de generalización cross-embodiment: al estar basado en un modelo fundacional GR00T, permite evaluar cómo se transfiere una tarea concreta a variaciones de posición, iluminación o distracciones (no documentadas en la model card).
- Integración en pipelines de robótica con Hugging Face Hub: el checkpoint se puede cargar directamente con `--policy.path=yudai0209/so101_vial2_train80_canon_groot17`, lo que facilita su uso en flujos MLOps de robótica con versionado de datasets y políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors y un repositorio de 12,6 GB, la inferencia en FP16 requeriría del orden de 6-7 GB solo para pesos, más el coste del backbone visión-lenguaje y los buffers de activación; esta estimación es orientativa y no está confirmada por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU consumer? No confirmado. Por tamaño de pesos, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían alojar el modelo en FP16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: la política opera a 30 FPS según la tasa de frames del dataset, pero no se publican medidas de latencia por paso ni throughput real en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yudai0209/so101_vial2_train80_canon_groot17` | 3.144.016.000 | no disponible | Manipulación SO-101 (pick-and-place) | apache-2.0 | Hugging Face Hub, 34 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT / Diffusion (genéricas) | no disponible | no disponible | Imitación visual-motora | normalmente apache-2.0 | Hugging Face Hub / LeRobot |

La comparación cuantitativa con alternativas no está disponible: no se han publicado benchmarks de esta política ni del GR00T N1.7 base en la información proporcionada, y las políticas ACT/Diffusion de LeRobot no tienen aquí cifras comparables. La comparativa se limita, por tanto, a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea "pick up the green object and put it in the magenta hole" con un robot `so_follower` y dos cámaras concretas; no se espera que generalice a otras tareas, objetos o configuraciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que se desconoce su robustez ante cambios de iluminación, posición de objetos o distracciones.
- Dependencia del hardware: requiere un robot SO-101 (`so_follower`) y cámaras con los nombres `overhead` y `wrist`; los índices y puertos deben coincidir con los del entrenamiento.
- Sesgos: no documentados. Al entrenarse con 80 episodios de un único operador y entorno, es probable que herede sesgos de posición, iluminación y estilo de manipulación, aunque el autor no los detalla.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento; no hay mecanismos de seguridad documentados.
- Licencia apache-2.0: permite uso comercial y modificación, pero el modelo base GR00T N1.7 de NVIDIA puede tener condiciones adicionales que no se detallan en esta model card; conviene revisar la licencia del repositorio Isaac-GR00T antes de un despliegue comercial.
- Idiomas: la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Fecha de creación futura (2026-11-08): el repositorio tiene pocas descargas (34) y ningún like, lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yudai0209/so101_vial2_train80_canon_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_vial2_train80_canon
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial2_train80_canon
- Repositorio GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
