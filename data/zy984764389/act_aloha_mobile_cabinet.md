# zy984764389/act_aloha_mobile_cabinet

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollada para controlar un robot Mobile ALOHA en la tarea de abrir un armario superior, guardar una olla en su interior y cerrar el armario. El modelo fue entrenado sobre el dataset `lerobot/aloha_mobile_cabinet`, que contiene 85 episodios teleoperados a 50 FPS, con un total de 127.500 fotogramas.

ACT predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error acumulado y mejora la suavidad del control en manipulación robótica. Con 51,7 millones de parámetros, es un modelo compacto que procesa imágenes de tres cámaras (una de vista superior y dos de muñeca) junto con el estado del robot para generar comandos de acción de 14 dimensiones. Su licencia Apache 2.0 permite uso comercial sin restricciones, y al estar integrado en el ecosistema LeRobot, puede desplegarse y reentrenarse con herramientas estándar del framework.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.685.006 |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | No aplicable (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión completa) |
| Idiomas soportados | No aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder con una variable latente condicional (CVAE). En lugar de predecir una sola acción por paso de tiempo, el modelo predice un chunk de acciones futuras, lo que reduce la acumulación de errores y mejora la coherencia del movimiento. La arquitectura combina un encoder de visión para procesar las tres cámaras (resolución 480×640), un encoder de estado para las señales proprioceptivas de 14 dimensiones (estado y esfuerzo), y un decoder que genera secuencias de acciones de 14 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `lerobot/aloha_mobile_cabinet`, que contiene 85 episodios teleoperados con el sistema Mobile ALOHA. La configuración de entrenamiento incluye 100.000 pasos con batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al comportamiento clonado supervisado.

## Capacidades

- Manipulación robótica móvil: controla un robot Mobile ALOHA para tareas de apertura de armarios y manipulación de objetos en entornos domésticos.
- Control basado en visión: procesa tres flujos de imagen simultáneos (vista superior y dos cámaras de muñeca) para generar acciones coordinadas.
- Predicción de secuencias de acciones: genera chunks de acciones de 14 dimensiones, lo que permite movimientos suaves y coordinados sin re-planificación paso a paso.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas sin necesidad de recompensas explícitas ni entorno simulado.
- Integración con LeRobot: compatible con el ecosistema completo de LeRobot para entrenamiento, evaluación, rollout y despliegue en hardware real.
- Entrada multimodal: combina observaciones visuales (3 cámaras) con señales de estado y esfuerzo del robot.

## Casos de uso

- Automatización de cocinas robóticas: el modelo ejecuta el flujo completo de abrir un armario superior, almacenar una olla y cerrarlo, un escenario típico en entornos domésticos o de restauración asistida por robots.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar técnicas de behavior cloning con action chunking en robots móviles con base desplazable.
- Benchmark de Mobile ALOHA: permite reproducir y comparar resultados con el trabajo original de Mobile ALOHA en tareas de manipulación móvil, ya que utiliza el mismo hardware y dataset.
- Desarrollo de políticas robóticas: el flujo de entrenamiento con LeRobot puede adaptarse a otras tareas de manipulación con datasets propios, reutilizando la arquitectura ACT.
- Evaluación de robustez: permite estudiar cómo se comporta una política entrenada en un entorno específico ante variaciones de iluminación, posición de objetos o configuración del robot.
- Educación en robótica: modelo de referencia para enseñar conceptos de aprendizaje por imitación, control basado en visión y despliegue de políticas en hardware real en cursos universitarios o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política en el robot real.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 207 MB en disco, un tamaño muy reducido en comparación con modelos de lenguaje grandes.
- Para inferencia, cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior) e incluso podría ejecutarse en CPU, aunque con mayor latencia.
- Para entrenamiento, la configuración con batch size 8 sugiere que cabe en GPUs de gama media con 8-12 GB de VRAM.
- El despliegue se realiza mediante el framework LeRobot, que proporciona el comando `lerobot-rollout` para ejecutar la política en el robot en tiempo real.
- No se requieren GPUs de datacenter (A100, H100) para este modelo.
- El requisito principal de hardware es el robot Mobile ALOHA completo, incluyendo la base móvil y las tres cámaras calibradas.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa con otros modelos de la misma categoría. El modelo pertenece a la familia de políticas ACT entrenadas con LeRobot, pero no se han encontrado modelos comparables con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en el robot real, por lo que el rendimiento efectivo no está verificado y podría diferir significativamente del esperado.
- El modelo está entrenado específicamente para la tarea "abrir el armario superior, guardar la olla y cerrar el armario" con el dataset `aloha_mobile_cabinet`. No generaliza a otras tareas sin reentrenamiento.
- Requiere el hardware específico de Mobile ALOHA (robot con base móvil y tres cámaras) para su despliegue; las cámaras deben coincidir con las utilizadas durante el entrenamiento (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) con resolución 480×640.
- El rendimiento puede degradarse ante cambios en la iluminación, posición de objetos, distracciones o configuración del robot no presentes en el dataset de entrenamiento.
- El dataset contiene solo 85 episodios, lo que puede limitar la robustez del modelo ante variaciones del entorno no cubiertas en las demostraciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del framework LeRobot y del hardware ALOHA, cuyas restricciones de hardware deben verificarse por separado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zy984764389/act_aloha_mobile_cabinet)
- [Dataset lerobot/aloha_mobile_cabinet](https://huggingface.co/datasets/lerobot/aloha_mobile_cabinet)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Mobile ALOHA](https://mobile-aloha.github.io/)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
