# ted88168/pi0_so101_multicolor_master_v2_quantiles

## Resumen

El modelo `ted88168/pi0_so101_multicolor_master_v2_quantiles` es una política robótica de tipo Vision-Language-Action (VLA) basada en el modelo fundacional π₀ (Pi0) de Physical Intelligence, fine-tuneada con el framework LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico SO-101 (configuración `so_follower`) en tareas de manipulación de precisión: recoger bloques de colores (rojo, verde, azul) y colocarlos en una caja, siguiendo instrucciones en lenguaje natural.

El modelo parte de los pesos preentrenados de `lerobot/pi0_base` y se ha ajustado con un dataset propio de 243 episodios y más de 175.000 frames capturados a 30 FPS. Con 4.028 millones de parámetros, es un modelo de tamaño medio para estándares de robótica, pero su arquitectura VLA le permite integrar percepción visual, comprensión de lenguaje y generación de acciones de forma unificada. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un modelo fundacional de robótica sobre hardware asequible (brazos SO-100/SO-101), lo que democratiza la investigación en manipulación robótica.

La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo hace atractivo para laboratorios y empresas que quieran experimentar con políticas de imitación en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0 (Vision-Language-Action, transformer con flow matching) |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa 3 imagenes de 224x224 y un vector de estado de 32 dimensiones) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (el modelo base pi0 soporta ingles, pero no se especifica en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0 es un modelo VLA desarrollado por Physical Intelligence que combina un codificador visual, un modelo de lenguaje y un cabezal de acción basado en flow matching. La implementación de LeRobot adapta el repositorio OpenPI original. En esta variante, el modelo recibe tres imágenes RGB (cámara base, muñeca izquierda y muñeca derecha) de 224x224 píxeles, junto con un vector de estado del robot de 32 dimensiones, y produce una acción de 6 dimensiones (posición y orientación del efector final).

El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset `ted88168/so101_multicolor_master_v1`, que contiene 243 episodios de demostración con tres tareas distintas (recoger bloque rojo, verde o azul y colocarlo en la caja). Se usaron 15.000 pasos de entrenamiento con batch size 40, optimizador AdamW y learning rate 2.5e-5. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente de imitación. La versión de LeRobot utilizada fue la 0.6.2.

## Capacidades

- Control robótico de precisión: genera comandos de acción de 6 grados de libertad para el brazo SO-101, adecuados para tareas de pick-and-place.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB (base, muñeca izquierda y muñeca derecha), lo que permite manejar oclusiones y perspectivas diferentes.
- Comprensión de instrucciones en lenguaje natural: asocia comandos como "Pick up the red block and place it in the box" con las acciones correspondientes.
- Generalización limitada a tareas específicas: el fine-tuning restringe el comportamiento a las tres tareas del dataset, aunque el modelo base pi0 tiene capacidades más amplias.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.
- No incluye tool calling, agentes autónomos ni razonamiento multi-paso fuera del ámbito de la manipulación robótica.

## Casos de uso

- Automatización de líneas de ensamblaje en laboratorio: el modelo puede gestionar tareas repetitivas de clasificación de piezas por color, reduciendo la intervención humana en entornos controlados.
- Investigación en imitación learning: sirve como punto de partida para estudiar cómo el fine-tuning de modelos VLA afecta al rendimiento en tareas de manipulación con brazos de bajo coste.
- Prototipado rápido de políticas robóticas: al estar basado en LeRobot, permite iterar rápidamente entre recogida de datos, entrenamiento y despliegue en el robot SO-101.
- Educación en robótica: puede utilizarse en cursos de robótica y aprendizaje por imitación para demostrar el flujo completo de entrenamiento de una política VLA.
- Benchmarking de hardware: permite evaluar el rendimiento de GPUs de gama media en inferencia de modelos VLA de 4B parámetros, ya que el modelo es relativamente ligero.
- Desarrollo de asistentes de manipulación en entornos domésticos: aunque limitado a tareas de pick-and-place, puede adaptarse con más datos para tareas como ordenar objetos o preparar bandejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.028 millones de parámetros. En precisión bf16 (tamaño del repo 8.9 GB), se necesitan aproximadamente 9-10 GB de VRAM solo para los pesos, más memoria para las activaciones de las tres imágenes y el flujo de inferencia. Se estima un mínimo de 16 GB de VRAM para operar con comodidad.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs de datacenter similares. En GPUs con 16 GB (como RTX 4080) podría funcionar con optimizaciones, pero no está garantizado.
- En consumer GPU: sí, cabe en GPUs de gama alta como RTX 4090, pero no en GPUs de 8-12 GB (RTX 3060, 4060) sin cuantización adicional.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También es compatible con el ecosistema de Hugging Face y puede integrarse con vLLM o TGI si se adapta, aunque no es el flujo estándar.
- Latencia y throughput: no se han publicado datos. La inferencia de un modelo VLA con tres imágenes suele estar en el rango de 10-30 Hz en GPUs de datacenter, pero depende del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ted88168/pi0_so101_multicolor_master_v2_quantiles | 4.028 M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | 4.028 M (aprox.) | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7.000 M | 32 tokens de estado + imagen | MIT | Hugging Face |
| RT-2 (55B) | 55.000 M | no disponible | no abierto | no disponible |

La comparativa se limita a modelos VLA de código abierto. Pi0_base es el modelo original sin fine-tuning, con las mismas capacidades generales pero sin especialización en tareas de pick-and-place. OpenVLA es una alternativa más grande (7B) con licencia MIT, pero no tiene la misma integración con LeRobot. RT-2 no es de código abierto. No se dispone de datos de rendimiento comparativo en tareas robóticas.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo solo ha sido entrenado con bloques de colores (rojo, verde, azul) en un entorno específico. No generalizará a otros objetos, colores o disposiciones sin fine-tuning adicional.
- Riesgo de alucinación en acciones: al ser un modelo generativo, puede producir acciones inconsistentes con la tarea si la entrada visual o el estado difieren de los vistos en entrenamiento.
- Limitaciones de contexto: la ventana de contexto no está documentada, y el modelo depende de las tres cámaras fijas; cambios en la iluminación, posición de cámara o fondo pueden degradar el rendimiento.
- Sin evaluación en robot real: la model card no reporta tasas de éxito, por lo que el rendimiento real en el robot es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base pi0 puede tener términos adicionales (aunque en este caso se indica Apache 2.0 para el fine-tune).
- Dependencia de LeRobot: el despliegue requiere la instalación de LeRobot y la configuración específica del robot SO-101; no es un modelo plug-and-play para otros brazos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ted88168/pi0_so101_multicolor_master_v2_quantiles
- Dataset de entrenamiento: https://huggingface.co/datasets/ted88168/so101_multicolor_master_v1
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de Physical Intelligence sobre Pi0: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot para Pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (implementación original): https://github.com/Physical-Intelligence/openpi
