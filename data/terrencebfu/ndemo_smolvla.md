# terrencebfu/ndemo_smolvla

## Resumen

Este modelo es un ajuste fino (fine-tune) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, adaptado específicamente para tareas robóticas de manipulación en un robot tipo `so_follower`. El autor, Terrence Fu, lo ha entrenado con el framework LeRobot sobre el dataset `ndemo`, que contiene 198 episodios y 131.124 fotogramas correspondientes a dos tareas: calentar alitas de pollo y verter agua. El modelo consume tres imágenes de cámara y un estado del robot (6 dimensiones) y produce una acción de 6 dimensiones.

SmolVLA destaca por su eficiencia: con solo 450 millones de parámetros, es capaz de ejecutarse en hardware de consumo, lo que lo hace relevante para la robótica accesible y la investigación en imitación learning. La arquitectura combina un modelo de lenguaje y visión (VLM) compacto preentrenado con un "experto de acción" entrenado mediante flow matching. Este checkpoint concreto no incluye evaluación publicada, pero sirve como ejemplo de fine-tuning para tareas específicas y como punto de partida para nuevos desarrollos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA: VLM compacto + action expert con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del VLM subyacente, no especificado en la informacion) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantificacion no documentada) |
| Idiomas soportados | No disponible (probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un VLA ligero compuesto por un VLM preentrenado compacto y un experto de acción entrenado con flow matching. Dado un conjunto de imágenes y una instrucción en lenguaje natural, el modelo genera un bloque de acciones (action chunk). Este checkpoint específico se ha fine-tuneado sobre el modelo base `lerobot/smolvla_base` usando LeRobot 0.6.1. El entrenamiento se realizó con 20.000 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 1000. El dataset `ndemo` contiene 198 episodios a 30 FPS, con tres cámaras (256x256) y un estado de 6 dimensiones. No se especifica si se aplicaron técnicas adicionales como RLHF o DPO; el proceso es de imitación supervisada.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 6 dimensiones (posiciones articulares o velocidades) a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa simultáneamente tres imágenes de 256x256, lo que permite visión estéreo o de múltiples ángulos.
- Seguimiento de instrucciones en lenguaje natural: ejecuta tareas descritas textualmente ("heat chicken wing", "pour water").
- Generación de bloques de acciones (action chunking): produce secuencias de acciones, facilitando un control suave y eficiente.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.
- Fine-tuning eficiente: al partir de un modelo base preentrenado, permite adaptación a nuevas tareas con recursos limitados.

## Casos de uso

- Manipulación en cocina: el modelo puede controlar un brazo robótico para calentar alimentos o verter líquidos, como se demuestra en el dataset de entrenamiento. Se usaría con el robot `so_follower` y tres cámaras, siguiendo la instrucción textual correspondiente.
- Automatización de tareas domésticas: aplicable a entornos domésticos donde se requiera realizar acciones repetitivas como servir bebidas o preparar platos sencillos, reduciendo costes al usar hardware de consumo.
- Investigación en imitación learning: sirve como ejemplo de fine-tuning de SmolVLA sobre un dataset propio, permitiendo estudiar transferencia de tareas, generalización y robustez en entornos reales.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar una política en horas, ideal para validar conceptos en laboratorios o startups antes de escalar.
- Evaluación de algoritmos de control: al ser un modelo pequeño, permite comparar distintas estrategias de control (flow matching, etc.) en hardware asequible, sin necesidad de GPUs de alta gama.
- Base para nuevos fine-tuning: el checkpoint puede usarse como punto de partida para adaptar el modelo a otras tareas del mismo robot o a robots similares, reutilizando las representaciones visuales y de acción aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación en robot real. El paper de SmolVLA (arXiv:2506.01844) reporta resultados comparativos, pero no se dispone de los datos concretos en esta ficha.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en FP16 ocupa aproximadamente 0,9 GB de memoria; en FP32, unos 1,8 GB. La inferencia puede caber en GPUs consumer con 4 GB o más, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060, RTX 4060 o superiores serían suficientes para inferencia; para entrenamiento, se recomienda al menos 8 GB de VRAM (el entrenamiento se realizó presumiblemente en una GPU de gama media-alta, aunque no se especifica).
- Despliegue: compatible con LeRobot (`lerobot-rollout`), que gestiona la carga del modelo y la comunicación con el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que es un modelo de robótica, no de generación de texto general.
- Latencia y throughput: no disponibles. Al ser un modelo compacto, se espera una inferencia en tiempo real (30 FPS) en hardware adecuado, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ndemo_smolvla (este) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 (PaLI-X) | 55B | No disponible | No abierto | No disponible |

SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA o RT-2, con la ventaja de poder ejecutarse en hardware de consumo. Sin embargo, no se dispone de datos comparativos de rendimiento en tareas robóticas para este checkpoint concreto. El paper original de SmolVLA reporta resultados competitivos frente a modelos más grandes, pero esos números no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card indica que no se han proporcionado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- Especialización limitada: el modelo solo ha sido entrenado en dos tareas (calentar alitas de pollo y verter agua) con un robot `so_follower` y tres cámaras específicas. No se garantiza generalización a otras tareas, robots o configuraciones de cámara.
- Riesgo de sobreajuste: con solo 198 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición de objetos, iluminación o distracciones.
- Dependencia del hardware: el despliegue requiere el robot `so_follower` y las cámaras configuradas según lo especificado; cambios en la configuración pueden degradar el rendimiento.
- Idiomas no confirmados: aunque SmolVLA probablemente soporta inglés, no se especifica en la documentación del checkpoint; las instrucciones de entrenamiento están en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías de soporte ni responsabilidad por daños.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/terrencebfu/ndemo_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset ndemo: https://huggingface.co/datasets/ndemo
