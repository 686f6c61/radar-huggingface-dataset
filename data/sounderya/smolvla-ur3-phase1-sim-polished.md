# Sounderya/smolvla-ur3-phase1-sim-polished

## Resumen

Este modelo es un fine-tune de SmolVLA, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado para controlar un brazo robótico UR3 en un entorno de simulación. La tarea concreta consiste en recoger una taza y colocarla sobre un plato, a partir de observaciones visuales de tres cámaras y el estado del robot. El fine-tune ha sido realizado por Sounderya utilizando la librería LeRobot, sobre el modelo base `lerobot/smolvla_base`, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, a diferencia de otros VLA de gran tamaño. Este fine-tune demuestra cómo adaptar un modelo base preentrenado a una tarea robótica específica con un coste computacional reducido, lo que facilita la experimentación y el despliegue en entornos de investigación y desarrollo. El repositorio incluye el dataset de entrenamiento, la configuración de entrenamiento y las instrucciones para ejecutar el policy en un robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Con 450 millones de parámetros, está diseñado para ser eficiente y desplegable en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado en grandes conjuntos de datos multimodales y posteriormente adaptado a tareas robóticas mediante aprendizaje por imitación.

Este fine-tune se entrenó durante 1000 pasos con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 1e-5, utilizando el dataset `Sounderya/mug_smolvla_dataset_v2nc` que contiene 120 episodios y 91.365 frames a 30 FPS. El policy recibe como entrada el estado del robot (6 dimensiones) y tres imágenes de cámaras de 256x256 píxeles, y produce una acción de 10 dimensiones. El entrenamiento se realizó con LeRobot versión 0.6.1.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción para un brazo UR3 a partir de observaciones visuales y del estado articular.
- Percepción visual multicámara: procesa tres flujos de imagen simultáneos (256x256) para localizar y manipular objetos.
- Aprendizaje por imitación: el policy reproduce la tarea demostrada en el dataset de entrenamiento.
- Ejecución en tiempo real: diseñado para inferencia de baja latencia en hardware de consumo.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face.
- Tarea específica: recoger una taza y colocarla sobre un plato, con generalización limitada a variaciones del entorno.

## Casos de uso

- Automatización de picking y placing en entornos simulados: el modelo puede integrarse en simuladores robóticos para validar algoritmos de manipulación antes de transferirlos a robots reales.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear VLA compactos con datasets pequeños (120 episodios).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, permite iterar sobre la tarea y el dataset en GPUs de gama media sin necesidad de clústeres de cálculo.
- Benchmarking de VLA en hardware de consumo: puede utilizarse para comparar el rendimiento de SmolVLA frente a modelos más grandes en tareas de manipulación.
- Educación y formación en robótica: al ser un modelo abierto y ligero, es adecuado para cursos y talleres donde se necesite un policy funcional sin grandes requisitos de hardware.
- Desarrollo de asistentes robóticos domésticos: aunque la tarea es simple, el enfoque demuestra la viabilidad de desplegar VLA en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,8 GB, y en fp16 unos 0,9 GB. Sin embargo, al procesar tres imágenes de 256x256, la memoria total de inferencia puede superar los 4 GB, dependiendo de la implementación.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) debería ser suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware de consumo.
- Opciones de despliegue: LeRobot (librería principal), con soporte para rollout en robots reales y simulados. También puede exportarse a otros formatos si se convierte.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por paso en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | propietaria | no público |

SmolVLA es significativamente más pequeño que OpenVLA (450M frente a 7B) y que RT-2, lo que lo hace más adecuado para despliegue en hardware de consumo. No se dispone de datos de rendimiento comparativo en tareas de manipulación para estos modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger una taza y colocarla en un plato; no generaliza a otras tareas sin fine-tune adicional.
- El entrenamiento se realizó en simulación (fase 1), por lo que el rendimiento en un robot real puede verse afectado por el gap de simulación a realidad.
- No se han proporcionado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito real.
- El dataset contiene solo 120 episodios, lo que puede limitar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- La model card menciona dos cámaras (wrist y right), pero la entrada del modelo espera tres imágenes; esta discrepancia debe resolverse antes del despliegue.
- No se especifican los idiomas soportados, aunque al ser un modelo de robótica, la interacción en lenguaje natural no es su función principal.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sounderya/smolvla-ur3-phase1-sim-polished)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Sitio web de SmolVLA](https://smolvla.net/index_en)
- [Repositorio GitHub del autor](https://github.com/Sounderya22/ur3_smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
