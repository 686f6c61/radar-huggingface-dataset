# yoshinari1209/groot_so101_pick_place

## Resumen

El modelo `yoshinari1209/groot_so101_pick_place` es un fine-tuning del modelo fundacional de robótica NVIDIA GR00T-N1.7-3B, especializado en la tarea de pick & place (recoger y colocar) para el robot SO-101. El autor, Yoshinari Kawashima, ha congelado el backbone VLM (Cosmos-Reason2 2B) y ha entrenado únicamente el action head con un dataset propio de 48 episodios de demostración, durante 10.000 pasos de optimización.

El modelo se distribuye a través de la librería LeRobot y utiliza el pipeline de robótica de HuggingFace. Con 3.144 millones de parámetros totales, está diseñado para ser desplegado como servidor de políticas de inferencia asíncrona, integrándose con el ecosistema LeRobot. Su relevancia radica en que demuestra cómo adaptar un modelo fundacional de robótica generalista a una tarea específica con un dataset relativamente pequeño, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7-3B (VLM backbone Cosmos-Reason2 2B + action head) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura NVIDIA GR00T-N1.7-3B, un modelo fundacional para robótica que combina un backbone de visión-lenguaje (VLM) de 2B parámetros (Cosmos-Reason2) con un action head que genera comandos de actuación. En este fine-tuning, el VLM backbone permanece congelado y solo se entrena el action head, lo que reduce significativamente el coste computacional y el riesgo de degradación del conocimiento visual-lingüístico.

El entrenamiento se realizó sobre el dataset `yoshinari1209/so101_pick_place_50eps_v1_20260817_192908`, que contiene 48 episodios de demostración de pick & place con el robot SO-101. Se dividieron 43 episodios para entrenamiento y 5 para evaluación (seed 1000), con batch size 8 y aproximadamente 3,4 épocas. La configuración de acción utiliza `chunk_size` de 16 pasos y `n_action_steps` de 16, con acciones relativas para la posición del efector y absolutas para el gripper. El checkpoint principal corresponde al paso 10.000, aunque también se publica el paso 5.000.

## Capacidades

- Ejecución de tareas de pick & place con el robot SO-101, incluyendo la coordinación de movimiento del brazo y apertura/cierre del gripper.
- Generación de secuencias de acción de 16 pasos (chunking) para control predictivo y suave.
- Inferencia asíncrona mediante servidor de políticas LeRobot, permitiendo integración con sistemas ROS 2 y otros entornos robóticos.
- Reanudación de entrenamiento desde checkpoints guardados con estado del optimizador.
- Adaptación a un robot específico (SO-101) a partir de un modelo fundacional generalista.
- Compatibilidad con el ecosistema LeRobot para recopilación de datos, entrenamiento y despliegue.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo SO-101 para recoger componentes de una cinta transportadora y colocarlos en posiciones precisas, con secuencias de acción de 16 pasos que permiten movimientos fluidos y anticipatorios.
- Estaciones de paletizado: integrado mediante el servidor de políticas de LeRobot, el modelo puede gestionar la colocación de productos en palés siguiendo patrones definidos, reduciendo la necesidad de programación explícita.
- Laboratorios de investigación en robótica: sirve como punto de partida para experimentos de fine-tuning con datasets propios, gracias a la licencia Apache 2.0 y la compatibilidad con el entrenamiento reanudable.
- Demostraciones de robótica educativa: el modelo permite a estudiantes y desarrolladores desplegar un sistema de pick & place funcional con un esfuerzo mínimo, usando el comando `lerobot.async_inference.policy_server`.
- Prototipado rápido en entornos industriales: las empresas pueden evaluar la viabilidad de la automatización de tareas repetitivas de manipulación sin invertir en desarrollo de controladores a medida.
- Benchmarking de modelos robóticos: al estar basado en GR00T-N1.7-3B, permite comparar el rendimiento del fine-tuning específico frente al modelo base y otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas cuantitativas de éxito en la tarea pick & place, ni comparaciones con el modelo base GR00T-N1.7-3B u otros modelos de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero un modelo de 3,14B parámetros en FP32 requiere aproximadamente 12,6 GB de VRAM; con cuantización a FP16 o BF16 se reduce a unos 6,3 GB.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060) podría ejecutar el modelo en FP16; para mayor margen se recomienda RTX 4090, A100 o H100.
- El modelo cabe en GPUs de consumo medio-alto si se aplica cuantización, aunque no se proporcionan versiones GGUF ni cuantizadas.
- Opciones de despliegue: servidor de políticas de LeRobot (`lerobot.async_inference.policy_server`), compatible con ROS 2 y sistemas embebidos.
- Latencia y throughput: no disponibles en la documentación del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoshinari1209/groot_so101_pick_place | 3,14B | no disponible | Pick & place SO-101 | Apache 2.0 | HuggingFace |
| NVIDIA GR00T-N1.7-3B (base) | 3,14B | no disponible | Robótica generalista | no disponible | HuggingFace |
| AkshayM-X/groot_so101_pick_place_v3 | no disponible | no disponible | Pick & place SO-101 | no disponible | HuggingFace |

El modelo se distingue del base por su especialización en la tarea concreta, mientras que la variante de AkshayM-X parece ser un fine-tuning similar pero con configuración y dataset potencialmente distintos. No se dispone de datos comparativos de rendimiento entre estas opciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de pick & place con el robot SO-101; su uso en otras tareas o robots requerirá fine-tuning adicional.
- El dataset de entrenamiento es reducido (48 episodios), lo que puede limitar la generalización a variaciones no vistas en las demostraciones.
- No se han publicado evaluaciones de robustez frente a cambios de iluminación, posición de cámara u oclusiones.
- El backbone VLM está congelado, por lo que el modelo no puede mejorar su comprensión visual-lingüística mediante fine-tuning adicional.
- No se proporcionan métricas de éxito ni tasas de error, lo que dificulta la evaluación objetiva del rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales.
- El tamaño del repositorio (51,1 GB) incluye checkpoints con estado del optimizador, lo que puede ser excesivo para despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoshinari1209/groot_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/yoshinari1209/so101_pick_place_50eps_v1_20260817_192908
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
- Modelo similar de AkshayM-X: https://huggingface.co/AkshayM-X/groot_so101_pick_place_v3
