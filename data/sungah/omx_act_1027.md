# Sungah/omx_act_1027

## Resumen

`Sungah/omx_act_1027` no es un modelo de lenguaje, sino una colección de 16 políticas de robótica basadas en la arquitectura ACT (Action Chunking with Transformers), entrenadas con la librería LeRobot (versión 0.4.4) para una tarea de manipulación concreta: empujar una caja e introducirla en una cesta blanca con un brazo robótico OMX. El autor, Sungah, entrenó los modelos desde cero (con un codificador de imágenes ResNet18 preentrenado en ImageNet) a partir de 8 demostraciones teleoperadas (5.055 fotogramas a 30 fps) recogidas el 27 de octubre de 2026, y comparó sistemáticamente el efecto de distintos hiperparámetros: longitud de chunk, tamaño de batch, tasa de aprendizaje, aumento de datos y entrada de corriente del gripper.

La relevancia del repositorio es principalmente metodológica: documenta de forma abierta un estudio de ablación de hiperparámetros en un escenario de pocos datos (8 demostraciones), mostrando que la combinación de chunk de 50 acciones y aumento de imágenes (`act_1027_C50AUG_9k`) produce el menor error articular (2,21 unidades LeRobot, aproximadamente 4 grados) y de gripper (0,63), y que aumentar el batch a 256 o 512 no mejora los resultados con tan pocos datos. Es un recurso útil para desarrolladores e investigadores que trabajen con LeRobot, brazos Dynamixel y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parametros totales | no disponible (tamaño del repo: 3,4 GB en total para 16 checkpoints) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; chunk de acciones de 100 (base), 50 o 30 según variante |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar) |
| Idiomas soportados | no aplicable (modelo de robótica; instrucción de tarea en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura ACT, un transformador CVAE que predice secuencias (chunks) de acciones futuras a partir de observaciones visuales y del estado del robot. El codificador visual es una ResNet18 preentrenada en ImageNet y el resto de la política se entrena desde cero. Las entradas son dos cámaras (`top`, vista superior, y `wrist`, cámara de muñeca) más un vector de estado de 7 dimensiones: 6 posiciones articulares más la corriente del gripper (valor original de Present_Current en mA). La variante `NG` usa solo 6 estados (sin corriente del gripper). La salida son las posiciones objetivo de las 6 articulaciones.

El entrenamiento se realizó con LeRobot 0.4.4 durante 10.000 pasos (con checkpoints cada 1.000), a partir de 8 demostraciones de 9 recogidas, a 30 fps, con la instrucción de tarea "empujar la caja y meterla en la cesta blanca". Las variantes exploran: chunk de 100/50/30, batch de 8/16/32/256/512 (los grandes con gradient accumulation de 64 en 64), lr fijo de 1e-5 o cosine (hasta 3e-5, 4e-5 o 5,7e-5 con warmup), aumento de imágenes y presencia o ausencia de la corriente del gripper. Como innovación práctica, el repositorio incluye scripts de inferencia (`infer.sh`, `inference.sh`) que seleccionan el modelo por número, ajustan automáticamente `n_action_steps` al tamaño del chunk y detectan el tipo de robot según la dimensión del estado.

## Capacidades

- Política de manipulación para la tarea específica: sujetar una caja y depositarla en una cesta blanca, controlando 6 articulaciones y el gripper.
- Predicción de chunks de acciones (100, 50 o 30 pasos según variante) con re-planificación cada 50 pasos por defecto (`--policy.n_action_steps=50`).
- Fusión de dos vistas de cámara (superior y muñeca) con estado propioceptivo, incluyendo lectura de corriente del gripper en mA para detectar contacto.
- Límite de movimiento relativo por paso (`max_relative_target=10`) para ejecución segura en hardware real.
- Registro automático de episodios de evaluación en `outputs/eval/` durante la inferencia.
- Detección automática del tipo de robot (`omx_follower_grip` con 7 estados, `omx_follower` con 6) según el tamaño del estado del modelo.

## Casos de uso

- Replicación de la tarea de manipulación en hardware OMX: los scripts incluidos permiten ejecutar la política directamente con `./infer.sh 10` tras configurar puerto y cámaras por variables de entorno.
- Estudio de ablación de hiperparámetros en aprendizaje por imitación: las 16 variantes documentadas sirven de referencia empírica para decidir chunk size, batch y lr en proyectos propios con pocos datos.
- Punto de partida para fine-tuning: los checkpoints pueden continuarse con nuevas demostraciones de tareas similares usando LeRobot 0.4.4.
- Investigación en percepción táctil de bajo coste: la variante que incorpora corriente del gripper (mA) frente a la `NG` sin ella permite comparar el impacto de la propiocepción eléctrica en el tiempo de cierre del gripper.
- Docencia y formación en robótica: el repositorio es un ejemplo completo y reproducible del ciclo demostración → entrenamiento → evaluación open-loop → despliegue.
- Validación de pipelines de evaluación: el método de evaluación open-loop (re-predicción cada 30 pasos, comparación con una demostración excluida del entrenamiento) es reutilizable para otros proyectos LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), ya que se trata de políticas de robótica. Los datos de evaluación propios del autor (error open-loop sobre 1 demostración excluida del entrenamiento; menor es mejor; 1 unidad LeRobot ≈ 1,8°) son:

| Modelo | Cambio respecto a la base | Error articular | Error gripper | Error cierre (s) | Error apertura (s) |
|---|---|---|---|---|---|
| `act_1027_B0_10k` (base) | chunk 100, batch 16, lr 1e-5 fijo, corriente, sin aumento | 2,90 | 1,31 | 0,47 | 0,33 |
| `act_1027_C50_6k` | chunk 50 | 2,47 | 0,78 | 0,17 | 0,10 |
| `act_1027_C30_5k` | chunk 30 | 2,55 | 0,90 | 0,43 | 0,00 |
| `act_1027_AUG_5k` | aumento de imágenes | 2,91 | 0,86 | 0,33 | 0,00 |
| `act_1027_NG_8k` | sin corriente de gripper (6 estados) | 3,10 | 1,33 | 0,40 | 0,87 |
| `act_1027_BS8_8k` | batch 8 | 2,64 | 1,01 | 0,47 | 0,10 |
| `act_1027_BS32_3k` | batch 32 | 2,56 | 1,32 | 0,70 | 0,13 |
| `act_1027_COS1_6k` | cosine lr (max 1e-5) | 2,71 | 1,49 | 0,57 | 0,43 |
| `act_1027_COS3_5k` | cosine lr (max 3e-5) | 2,78 | 1,03 | 0,57 | 0,00 |
| **`act_1027_C50AUG_9k`** | **chunk 50 + aumento de imágenes** | **2,21** | **0,63** | 0,20 | 0,07 |
| `act_1027_C50COS3_8k` | chunk 50 + cosine lr (max 3e-5) | 2,32 | 0,84 | 0,43 | 0,07 |
| `act_1027_C50BS32_9k` | chunk 50 + batch 32 | 2,34 | 0,79 | 0,17 | 0,10 |
| `act_1027_C50B256_4000step` | batch 256, lr 1e-5 fijo (203 épocas) | 2,54 | 0,97 | 0,27 | 0,17 |
| `act_1027_C50B256LR_2000step` | batch 256, cosine max 4e-5 (101 épocas) | 2,49 | 0,95 | 0,17 | 0,10 |
| `act_1027_C50B512_1800step` | batch 512, lr 1e-5 fijo (182 épocas) | 2,74 | 0,97 | 0,47 | 0,43 |
| `act_1027_C50B512LR_800step` | batch 512, cosine max 5,7e-5 (81 épocas) | 2,51 | 0,87 | 0,27 | 0,10 |

Conclusiones del autor: la mejor variante es `act_1027_C50AUG_9k` (candidata número 1 para prueba en robot real), seguida de `act_1027_C50_6k` y `act_1027_C50BS32_9k`. Los batch grandes (256/512) no mejoran con solo 8 demostraciones. La tasa de éxito en robot físico aún no se ha medido.

## Requisitos de hardware

- VRAM para inferencia: no disponible explícitamente; siendo ACT con ResNet18 y un repo total de 3,4 GB para 16 checkpoints (unos 200 MB por checkpoint), una GPU de consumo con 4-6 GB de VRAM debería bastar para la inferencia.
- Entrenamiento: los batch de 256/512 no cabían en la GPU del autor y requirieron gradient accumulation (64×4 y 64×8); batch 16 cabe en una sola GPU de consumo.
- GPU recomendadas: no disponible; cualquier GPU moderna (por ejemplo RTX 3060 o superior) es plausible para inferencia de ACT.
- Software: `pip install "lerobot[dynamixel]==0.4.4"` y descarga con `hf download Sungah/omx_act_1027`.
- Hardware del robot: brazo follower OMX con motores Dynamixel (puerto serie, por ejemplo `/dev/ttyACM1`) y dos cámaras (por ejemplo `/dev/video4` y `/dev/video6`).
- Configuración de ejecución: fps 30, cámaras `top` y `wrist`, `max_relative_target=10`, duración de episodio configurable (por defecto y modificable vía `--dataset.episode_time_s`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros repositorios; la comparación relevante es interna entre las 16 variantes del propio repo (ver tabla de benchmarks). Como referencia de categoría:

| Aspecto | omx_act_1027 | Políticas ACT típicas de LeRobot (p. ej. aloha) | Diffusion Policy / PI0 (LeRobot) |
|---|---|---|---|
| Arquitectura | ACT (CVAE transformer) | ACT | Diffusion / VLM-based |
| Datos | 8 demostraciones, 5.055 frames, 30 fps | Decenas-hundreds de episodios (ALOHA) | Grandes datasets multi-tarea (PI0) |
| Tarea | Una tarea concreta (caja → cesta) | Tareas bimanuales ALOHA | Tareas generales |
| Licencia | Apache-2.0 | Apache-2.0 (LeRobot) | Variable según modelo |
| Disponibilidad | Checkpoints + scripts de inferencia en el Hub | Oficiales en LeRobot | Oficiales en LeRobot |

## Limitaciones y advertencias

- Especialización extrema: los modelos solo son válidos para la tarea y el montaje exactos con los que se entrenaron (misma disposición de cámaras `top`/`wrist`, fps 30, robot OMX); no generalizan a otras tareas u objetos.
- Evaluación limitada: cada modelo se evaluó open-loop con una única demostración excluida del entrenamiento, por lo que las diferencias entre variantes cercanas pueden no ser significativas; la tasa de éxito en robot físico no se ha medido todavía.
- Riesgo de comportamiento errático en el robot real: los errores de tiempo de cierre/apertura del gripper (hasta 0,87 s en la variante NG) pueden provocar fallos de agarre; el límite `max_relative_target=10` mitiga movimientos bruscos pero no garantiza seguridad.
- Sin sesgos ni alucinaciones aplicables al no ser un modelo de lenguaje, aunque hereda el sesgo del codificador ResNet18 preentrenado en ImageNet (dominio visual distinto al del robot).
- Escalado de batch ineficaz: con 8 demostraciones, batch 256/512 empeoró resultados; no extrapolar la configuración de batch grande a otros datasets sin validar.
- Idioma: la documentación del repo está en coreano; la instrucción de tarea está en coreano, lo que puede complicar la reproducción a usuarios hispanohablantes.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero sin garantía alguna sobre el funcionamiento en hardware real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sungah/omx_act_1027
- Librería LeRobot: https://github.com/huggingface/lerobot
- Artículo original de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Otros enlaces (paper del autor, demos, blog): no disponibles
