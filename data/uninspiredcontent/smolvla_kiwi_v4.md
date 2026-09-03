# UninspiredContent/smolvla_kiwi_v4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en tiempo real con requisitos computacionales reducidos. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` (publicado en el paper arXiv:2506.01844) realizado por el usuario UninspiredContent, entrenado específicamente para la tarea "Move Object Into Box Improved" sobre el robot `lekiwi_client`. El modelo consume observaciones de estado y múltiples cámaras (frontal, muñeca y otras) y produce acciones de 9 dimensiones, lo que lo hace adecuado para tareas de manipulación y recogida de objetos.

Con 450 millones de parámetros, es un modelo relativamente pequeño en comparación con otros VLA, lo que permite su despliegue en hardware de consumo. El entrenamiento se realizó con el framework LeRobot, utilizando un dataset propio de 50 episodios y 31.853 fotogramas a 30 FPS. La licencia Apache 2.0 facilita su uso comercial y académico. Este modelo es relevante porque demuestra que es posible obtener políticas robóticas funcionales con datasets pequeños y recursos limitados, una tendencia creciente en la robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, un enfoque de visión-lenguaje-acción que integra procesamiento de imágenes y estado del robot para generar comandos de acción. Aunque no se especifican los detalles internos (tipo de transformer, mecanismos de atención, etc.), se sabe que es un modelo compacto optimizado para inferencia eficiente. El fine-tuning se realizó a partir del checkpoint `lerobot/smolvla_base`, que ya había sido preentrenado en tareas generales de robótica.

El entrenamiento se llevó a cabo con el framework LeRobot (versión 0.6.2) sobre el dataset `UninspiredContent/KiwiSet2`, compuesto por 50 episodios y 31.853 fotogramas a 30 FPS, todos etiquetados con la tarea "Move Object Into Box Improved". Se utilizaron 3000 pasos de entrenamiento con un batch size de 32, optimizador AdamW y una tasa de aprendizaje de 0.0001. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento por preferencias; el entrenamiento es puramente de imitación supervisada.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 9 dimensiones (posición, orientación, agarre, etc.) a partir de observaciones de estado y cámaras.
- Percepción multimodal: procesa imágenes de hasta 3 cámaras (frontal, muñeca y una tercera) con resolución 256x256, más una cámara adicional de 480x640.
- Ejecución de tareas de manipulación: específicamente entrenado para mover objetos a una caja, pero la arquitectura general permite adaptarse a otras tareas con fine-tuning.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- Eficiencia computacional: al ser un modelo de 450M de parámetros, es adecuado para hardware de consumo, aunque no se proporcionan métricas exactas de latencia o VRAM.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede controlar un brazo robótico para recoger objetos y depositarlos en una caja, como se demuestra en la tarea de entrenamiento. Es adecuado para líneas de montaje o laboratorios donde se requiera repetibilidad.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con datasets pequeños, ya que demuestra que con 50 episodios se puede obtener una política funcional. Los investigadores pueden usarlo como baseline para comparar técnicas de aumento de datos o regularización.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, se puede desplegar en un robot `lekiwi_client` en pocos minutos usando el comando `lerobot-rollout`, ideal para pruebas de concepto en robótica educativa o industrial ligera.
- Desarrollo de sistemas de manipulación con visión: al combinar múltiples cámaras, el modelo puede utilizarse para tareas que requieren coordinación ojo-mano, como ensamblaje de piezas pequeñas o clasificación de objetos.
- Benchmarking de hardware robótico: al ser un modelo compacto, puede ejecutarse en GPUs de gama media, lo que permite evaluar el rendimiento de diferentes plataformas robóticas sin necesidad de infraestructura de alto coste.
- Fine-tuning para tareas personalizadas: el checkpoint base `lerobot/smolvla_base` y este fine-tuning pueden adaptarse a nuevas tareas con datasets adicionales, usando el comando `lerobot-train` con pocas modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión o comparativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU en la documentación del modelo.
- Dado el tamaño de 450M de parámetros, se estima que el modelo puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060), pero esta cifra es una estimación no confirmada.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente CPU, aunque no se especifica.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino un policy de robótica.
- La latencia y el throughput no están documentados; al ser un modelo compacto, se espera que sea adecuado para control en tiempo real, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA compactos) dentro de la documentación proporcionada. El modelo es un fine-tuning de `lerobot/smolvla_base`, pero no se ofrecen datos de rendimiento ni comparativas con otros VLA como OpenVLA, RT-2 o π0. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Move Object Into Box Improved" y puede no generalizar a otras tareas sin fine-tuning adicional.
- Depende de la configuración específica de cámaras y del robot `lekiwi_client`; cambios en la disposición de las cámaras, iluminación o el propio robot pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno.
- No se han evaluado sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje; sin embargo, en robótica, las acciones incorrectas pueden causar daños físicos, por lo que se recomienda supervisión humana durante las pruebas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su seguridad en entornos reales.
- No se proporcionan métricas de rendimiento en robot real, por lo que la eficacia real no está demostrada.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/UninspiredContent/smolvla_kiwi_v4)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento KiwiSet2](https://huggingface.co/datasets/UninspiredContent/KiwiSet2)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Referencia de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
