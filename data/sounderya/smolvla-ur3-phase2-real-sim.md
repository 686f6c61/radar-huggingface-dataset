# Sounderya/smolvla-ur3-phase2-real-sim

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo y reducir el coste computacional frente a alternativas más grandes. Este repositorio concreto, `Sounderya/smolvla-ur3-phase2-real-sim`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario Sounderya para controlar un brazo robótico UR3 en una tarea específica de manipulación: recoger una taza y colocarla sobre un plato. El modelo se ha entrenado con el framework LeRobot y un dataset propio de 120 episodios, lo que demuestra cómo adaptar un VLA preentrenado a una tarea concreta con relativamente pocos datos. Su relevancia radica en que ejemplifica el flujo de trabajo de aprendizaje por imitación con VLA en robótica real, con una licencia Apache 2.0 que permite uso comercial y una huella de memoria reducida (0.9 GB en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, basado en SmolVLA (no se especifican detalles internos) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no genera texto; las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`, que a su vez es un VLA de 450M parámetros entrenado por Hugging Face. La arquitectura interna no se detalla en la model card, pero se sabe que combina visión, lenguaje y acción para generar comandos de control directamente desde observaciones. El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, compuesto por 120 episodios y 91.365 frames a 30 FPS, con la tarea "Pick the mug and place it on the plate". La configuración de entrenamiento incluye 10.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado de imitación.

## Capacidades

- Generación de acciones de control para un brazo robótico: la salida es un vector de acción de 10 dimensiones (posiciones articulares o comandos de efector final).
- Percepción multimodal: consume imágenes de tres cámaras (aunque la model card menciona "wrist" y "right" como cámaras, la tabla de inputs lista tres entradas visuales de 256x256 píxeles) y un vector de estado de 6 dimensiones.
- Ejecución de una tarea específica de pick-and-place: recoger una taza y colocarla en un plato, aprendida por imitación.
- Integración con el ecosistema LeRobot: permite rollout y entrenamiento mediante comandos CLI estándar.
- No se reportan capacidades de tool calling, razonamiento multi-paso ni generación de lenguaje natural; es un modelo de política puramente reactivo.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede controlar un UR3 para realizar operaciones repetitivas de pick-and-place, reduciendo el tiempo de programación frente a métodos tradicionales.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas con pocos datos.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y desplegar una política en horas, ideal para validar conceptos en laboratorio.
- Despliegue en robots UR3 existentes: el modelo está listo para usarse con el comando `lerobot-rollout`, siempre que se configuren las cámaras y el puerto adecuados.
- Fine-tuning para nuevas tareas: partiendo de este checkpoint, se puede reentrenar con datasets propios para otras tareas de manipulación, aprovechando el conocimiento previo.
- Evaluación de VLA en hardware de consumo: al ser un modelo de 450M, permite probar técnicas de VLA en GPUs domésticas sin necesidad de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet", por lo que no hay datos de tasa de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la model card. Dado que el modelo tiene 450M de parámetros y el repositorio ocupa 0.9 GB, es plausible que quepa en GPUs consumer con al menos 8 GB de VRAM, pero este dato no está confirmado.
- No se indican GPUs recomendadas. El entrenamiento se realizó con `--policy.device=cuda`, lo que sugiere que se usó una GPU NVIDIA, pero sin especificar modelo.
- Para inferencia, LeRobot soporta despliegue con PyTorch estándar; no se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros VLA como OpenVLA, RT-2 o π0 en la información consultada. El modelo base SmolVLA se presenta como una alternativa compacta, pero no hay cifras concretas en este repositorio.

## Limitaciones y advertencias

- No hay evaluación en robot real reportada: la model card indica que no se han proporcionado resultados, por lo que el rendimiento real es desconocido.
- Dataset de entrenamiento pequeño (120 episodios) y tarea muy específica: el modelo puede no generalizar a otras posiciones, objetos o condiciones de iluminación.
- Dependencia de la configuración de cámaras: el modelo espera tres entradas visuales (aunque la model card menciona dos cámaras), y cualquier cambio en la disposición de las cámaras puede degradar el rendimiento.
- No se documentan sesgos ni riesgos de alucinación, al ser un modelo de acción y no de generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el hardware y el software asociados (LeRobot, UR3) cumplan sus propias licencias.
- El modelo está entrenado para una tarea concreta; usarlo fuera de ese contexto requerirá fine-tuning adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sounderya/smolvla-ur3-phase2-real-sim
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Framework LeRobot: https://github.com/huggingface/lerobot
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
