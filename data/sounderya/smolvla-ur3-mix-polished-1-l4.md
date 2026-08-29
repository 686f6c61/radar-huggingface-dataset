# Sounderya/smolvla-ur3-mix-polished-1-l4

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con un coste computacional reducido. Con solo 450 millones de parámetros, consigue un rendimiento comparable o superior a modelos de 7 a 10 veces más grandes, entrenado exclusivamente con datos públicos de la comunidad. Este modelo concreto, `Sounderya/smolvla-ur3-mix-polished-1-l4`, es un fine-tuning de la base `lerobot/smolvla_base` realizado por Sounderya para una tarea específica de manipulación con un brazo robótico UR3.

El modelo resuelve el problema de la democratización de la robótica inteligente: permite desplegar políticas de control en hardware de consumo, reduciendo la barrera de entrada para desarrolladores e investigadores. Su arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, todo integrado en un pipeline de aprendizaje por imitación mediante la librería LeRobot. La tarea entrenada es "coger la taza y colocarla en el plato", con un dataset de 120 episodios y más de 91 000 frames.

La relevancia actual radica en que demuestra que modelos pequeños, entrenados con datos abiertos, pueden competir con sistemas propietarios masivos, abriendo nuevas posibilidades para la robótica de bajo coste y la investigación reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, con codificador visual y decodificador de acciones |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a tareas robóticas, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual (para procesar imágenes de cámaras), un modelo de lenguaje (para interpretar instrucciones y razonar sobre la escena) y un decodificador de acciones (para generar comandos motores). La arquitectura está optimizada para ser eficiente en inferencia, permitiendo su ejecución en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado con datos públicos de la comunidad, y este fine-tuning se realizó sobre un dataset específico de manipulación con un brazo UR3.

El entrenamiento de este fine-tuning se llevó a cabo con la librería LeRobot, utilizando 500 pasos de entrenamiento, batch size de 64, optimizador AdamW y una tasa de aprendizaje de 5e-05. El dataset `Sounderya/mug_smolvla_dataset_v2nc` contiene 120 episodios con 91 365 frames a 30 FPS, capturados con tres cámaras (muñeca y dos laterales). No se menciona el uso de RLHF o DPO; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles simultáneamente, lo que permite comprender la escena desde diferentes ángulos.
- Seguimiento de instrucciones en lenguaje natural: interpreta la tarea descrita textualmente ("Pick the mug and place it on the plate") y la traduce en comandos motores.
- Aprendizaje por imitación: puede ser fine-tuneado con nuevos datasets para adaptarse a tareas específicas sin necesidad de reentrenar desde cero.
- Eficiencia computacional: al tener solo 450M de parámetros, es adecuado para despliegue en tiempo real en hardware de consumo.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de grabación, entrenamiento y evaluación.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede controlar un brazo robótico UR3 para recoger objetos y colocarlos en posiciones determinadas, reduciendo la intervención humana en entornos de investigación.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden fine-tunear este modelo con sus propios datasets (grabados con LeRobot) para probar nuevas tareas en horas, sin necesidad de grandes infraestructuras.
- Educación en robótica: al ser ligero y de código abierto, es ideal para cursos universitarios donde los estudiantes aprenden a entrenar y desplegar modelos VLA en robots de bajo coste.
- Robótica asistencial en entornos domésticos: puede adaptarse para tareas como recoger objetos y llevarlos a un destino, siempre que se disponga de un brazo robótico compatible.
- Investigación en aprendizaje por imitación: sirve como baseline eficiente para comparar con modelos más grandes, permitiendo estudiar el equilibrio entre tamaño, datos y rendimiento.
- Despliegue en entornos con recursos limitados: su bajo consumo de memoria y computación lo hace viable en mini-PCs o GPUs de gama media, facilitando su integración en sistemas embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para este fine-tuning concreto. El paper original de SmolVLA (arxiv 2506.01844) reporta comparativas con modelos más grandes, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de 450M de parámetros, la VRAM estimada para inferencia es baja, aunque no se proporcionan cifras exactas. Se puede inferir que cabe en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM, como RTX 2070, RTX 3060, RTX 4060, o superiores. También es viable en GPUs de datacenter como A100 o H100, pero no son necesarias.
- Es adecuado para hardware de consumo, incluyendo portátiles con GPUs dedicadas.
- Opciones de despliegue: compatible con LeRobot, que soporta inferencia en PyTorch. También puede exportarse a formatos como ONNX o TensorRT para optimización, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una latencia de decenas de milisegundos en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | No disponible | Propietaria | No abierto |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que lo hace más accesible para hardware de consumo. Sin embargo, no se dispone de datos comparativos de rendimiento en esta información. La ventaja principal es su eficiencia y su licencia abierta, mientras que RT-2 es propietario y OpenVLA, aunque abierto, requiere más recursos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset específico (taza y plato), el modelo puede no generalizar bien a otros objetos o entornos no vistos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar acciones incorrectas o inconsistentes si la escena es ambigua o fuera de distribución.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero al ser un modelo pequeño, es probable que tenga limitaciones en instrucciones complejas o de varios pasos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no se otorgan patentes implícitas.
- Caveat para producción: no se han reportado evaluaciones en robot real, por lo que se recomienda validar exhaustivamente antes de usar en entornos críticos.
- Dependencia de la configuración de cámaras: el modelo espera tres cámaras específicas (muñeca y laterales); cambios en la disposición pueden degradar el rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-mix-polished-1-l4
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
