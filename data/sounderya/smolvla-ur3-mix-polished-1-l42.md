# Sounderya/smolvla-ur3-mix-polished-1-l42

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face, con 450 millones de parámetros. Está diseñado para tareas de robótica de manipulación, combinando un modelo de lenguaje y visión preentrenado con un "action expert" que genera comandos de control para el robot. Este repositorio concreto, `Sounderya/smolvla-ur3-mix-polished-1-l42`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Sounderya para un brazo robótico UR3, especializado en la tarea de coger una taza y colocarla en un plato.

La relevancia de este modelo radica en su tamaño reducido (450M parámetros) frente a otros VLA de miles de millones de parámetros, lo que permite su despliegue en hardware de consumo y acelera la experimentación en robótica. El fine-tuning se realizó con el framework LeRobot y un dataset propio de 120 episodios, demostrando un flujo de trabajo accesible para desarrolladores e investigadores. Aunque no se han publicado resultados de evaluación en robot real, la arquitectura y el entrenamiento siguen las directrices del paper original de SmolVLA (arXiv:2506.01844).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM preentrenado + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de acción, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de dos módulos principales: un modelo de lenguaje y visión (VLM) preentrenado que procesa las observaciones (imágenes y estado del robot) y genera características, y un "action expert" que, condicionado por esas características, produce las acciones de control. Esta separación permite que el VLM se mantenga congelado o se ajuste ligeramente mientras el action expert se entrena específicamente para la tarea robótica. El modelo base `lerobot/smolvla_base` ya incorpora esta arquitectura, y este repositorio es un fine-tuning sobre él.

El entrenamiento se realizó con el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios y 91.365 fotogramas a 30 FPS, con la tarea "coger la taza y colocarla en el plato". Se usaron 500 pasos de entrenamiento, batch size de 64, optimizador AdamW y una tasa de aprendizaje de 5e-5, con semilla 1000. El framework utilizado fue LeRobot en su versión 0.6.1. No se menciona el uso de RLHF ni DPO; es un entrenamiento de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones (posiblemente posiciones articulares o cartesianas) a partir de observaciones de estado (6 dimensiones) y tres cámaras (256x256 píxeles cada una).
- Percepción visual multimodal: procesa simultáneamente tres flujos de imagen (cámara1, cámara2, cámara3) junto con el estado del robot.
- Especialización en tareas de pick-and-place: entrenado específicamente para la tarea de coger una taza y ponerla en un plato, aunque puede ser fine-tuneado para otras tareas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, permitiendo entrenamiento, evaluación y despliegue mediante comandos CLI.
- Eficiencia computacional: al tener solo 450M parámetros, es adecuado para hardware de consumo, a diferencia de modelos VLA más grandes.
- No se reportan capacidades de lenguaje natural, tool calling ni razonamiento conversacional; es un modelo puramente orientado a acción.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico UR3 para recoger objetos de una posición y colocarlos en otra, útil en líneas de montaje o clasificación. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPUs modestas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tuning de un VLA compacto se comporta en tareas específicas, comparando con modelos más grandes.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y desplegar en pocas horas, ideal para validar hipótesis en laboratorio.
- Robótica educativa y de bajo coste: al caber en hardware de consumo, es accesible para universidades y makers que no disponen de clústeres de GPUs.
- Fine-tuning para nuevas tareas: el modelo base puede adaptarse a otras manipulaciones (apilar, insertar, etc.) usando el mismo flujo de entrenamiento con datasets propios.
- Evaluación de generalización: al ser un modelo pequeño, permite estudiar la transferencia entre entornos simulados y reales, o entre diferentes configuraciones de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. El paper original de SmolVLA reporta métricas comparativas, pero no se dispone de datos específicos para este fine-tuning.

## Requisitos de hardware

- Tamaño del repositorio: 2,6 GB (pesos en safetensors).
- Parámetros: 450M, lo que en float32 ocupa aproximadamente 1,8 GB, pero con overhead de inferencia y activaciones se estima que necesita al menos 4-6 GB de VRAM.
- GPU recomendada: cualquier GPU con 8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en tiempo real.
- Despliegue: se utiliza el framework LeRobot, que soporta CUDA. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso típico |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Apache-2.0 | Robótica de manipulación |
| OpenVLA | 7B | no disponible | MIT | Robótica de manipulación |
| RT-2 (Google) | 55B | no disponible | propietaria | Robótica de manipulación |

SmolVLA se destaca por su tamaño reducido frente a OpenVLA (7B) y RT-2 (55B), lo que lo hace más adecuado para hardware de consumo. El paper original indica que SmolVLA logra un rendimiento competitivo con un coste computacional significativamente menor, aunque no se dispone de comparativas numéricas en esta ficha.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación en robot real; el rendimiento real no está verificado.
- El modelo está entrenado únicamente para una tarea específica (coger taza y colocarla en plato) y puede no generalizar a otras tareas sin fine-tuning adicional.
- Depende de la configuración exacta de cámaras (tres, con resolución 256x256) y del estado del robot (6 dimensiones); cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (120 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- No se especifican idiomas ni capacidades de lenguaje; es un modelo de acción, no un chatbot.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset.
- Al ser un fine-tuning reciente (creado en agosto de 2026), puede haber problemas de compatibilidad con versiones futuras de LeRobot.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-mix-polished-1-l42
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio GitHub del autor: https://github.com/Sounderya22/ur3_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
