# yukamatsumae/molmoact2_otter_yellowpushplace_lora

## Resumen

El modelo `yukamatsumae/molmoact2_otter_yellowpushplace_lora` es un adaptador LoRA entrenado sobre la base de MolmoAct2, un modelo de visión-lenguaje-acción (VLA) desarrollado por el Allen Institute for AI (AI2). Este checkpoint concreto ha sido generado por el usuario yukamatsumae utilizando la librería LeRobot de HuggingFace, y está especializado en una tarea de manipulación robótica: empujar un objeto amarillo hasta una posición determinada (push-place). El modelo se publica bajo licencia Apache 2.0 y está pensado para ser ejecutado en robots compatibles con el ecosistema LeRobot, como el brazo SO-100.

La relevancia de este modelo radica en que demuestra el uso práctico de MolmoAct2, una familia de modelos VLA de código abierto que busca ofrecer controladores generalistas para robots con razonamiento de acciones. Al ser un LoRA, permite adaptar un modelo base de gran tamaño a una tarea específica con un coste de entrenamiento reducido, lo que facilita su despliegue en entornos de investigación y desarrollo. El checkpoint incluye 5.591.928.368 parámetros en formato safetensors, lo que sugiere que contiene tanto el modelo base como el adaptador, aunque no se especifica la proporción exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en MolmoAct2, con adaptador LoRA |
| Parametros totales | 5.591.928.368 (según safetensors) |
| Parametros activos | no disponible (al ser LoRA, solo se activan los del adaptador, pero no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en MolmoAct2, una arquitectura VLA que combina un codificador visual, un modelo de lenguaje multimodal y un módulo de predicción de acciones. Según el paper oficial (arXiv:2605.02881), MolmoAct2 está diseñado para superar las limitaciones de los sistemas VLA existentes en cuanto a latencia, coste de hardware y tasa de éxito en tareas reales. El adaptador LoRA se ha entrenado con el dataset `yukamatsumae/YellowPush_20260818_082007`, que contiene demostraciones de la tarea de empujar y colocar un objeto amarillo. El entrenamiento se realizó con la librería LeRobot, que proporciona herramientas para entrenar políticas de control robótico mediante aprendizaje por imitación. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control robótico de manipulación: el modelo es capaz de generar comandos de acción (posición, orientación, fuerza) para que un robot ejecute la tarea de empujar un objeto amarillo hasta una ubicación objetivo.
- Percepción visual: al estar basado en MolmoAct2, integra un codificador visual que procesa imágenes de cámara para localizar el objeto y la posición de destino.
- Razonamiento de acciones: MolmoAct2 incorpora un mecanismo de razonamiento que mejora la precisión de las acciones en entornos reales, aunque no se detalla su implementación en este checkpoint.
- Integración con LeRobot: compatible con el ecosistema de LeRobot, lo que permite su uso con robots como SO-100 y otros soportados por la librería.
- No incluye capacidades de generación de texto, tool calling ni agentes conversacionales; su función es exclusivamente generar acciones motoras.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede controlar un brazo robótico para mover objetos de una posición a otra, útil en entornos de investigación donde se requieren movimientos repetitivos y precisos.
- Pruebas de algoritmos de aprendizaje por imitación: sirve como ejemplo de cómo adaptar un VLA base a una tarea concreta mediante LoRA, permitiendo a otros desarrolladores replicar el flujo de entrenamiento con LeRobot.
- Desarrollo de robots de asistencia en entornos domésticos: la tarea de empujar y colocar objetos es fundamental en aplicaciones como ordenar mesas o recoger elementos, y este modelo puede servir como punto de partida para tareas más complejas.
- Evaluación de políticas de control en simulación y hardware real: al estar entrenado con LeRobot, se puede evaluar directamente en robots físicos o en simuladores compatibles, midiendo la tasa de éxito y la robustez.
- Investigación en VLA de código abierto: este checkpoint permite a investigadores estudiar el comportamiento de MolmoAct2 en una tarea específica, comparando con otros adaptadores o con el modelo base sin ajuste.
- Formación y educación en robótica: al ser un modelo pequeño (5.6B) y con licencia permisiva, puede utilizarse en cursos de robótica para enseñar conceptos de visión-lenguaje-acción y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de rendimiento como tasa de éxito en la tarea, precisión de acciones ni comparaciones con otros modelos VLA en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Dado que el checkpoint tiene ~5.6B parámetros en FP32, se necesitarían aproximadamente 22 GB de VRAM para inferencia en FP32, o ~11 GB en FP16. Con cuantización a 8 bits, podría reducirse a ~6 GB, pero no se proporcionan configuraciones recomendadas.
- GPU recomendadas: no hay indicación del fabricante. Para una inferencia fluida en FP16, se sugiere una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, o similar). En cuantización 8 bits, una RTX 3080/3090 podría ser suficiente.
- Compatibilidad con GPU de consumo: probablemente sí, si se aplica cuantización, pero no está confirmado.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar mediante los scripts de inferencia de LeRobot (`lerobot-record`), que requieren un entorno con PyTorch y CUDA. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia de texto, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos VLA como OpenVLA, RT-2 o MolmoAct (versión anterior). El modelo es un adaptador específico para una tarea, y no se han publicado métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de empujar y colocar un objeto amarillo; no es generalista y fallará en otras tareas de manipulación.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones del dataset `YellowPush_20260818_082007`. Si el dataset es pequeño o sesgado, el modelo puede tener problemas de generalización.
- Riesgo de alucinación en acciones: como todo modelo VLA, puede generar acciones incorrectas o imprecisas en situaciones no vistas, lo que requiere supervisión humana en entornos reales.
- Sin soporte de texto: no puede procesar instrucciones en lenguaje natural ni generar respuestas; su entrada es exclusivamente visual y su salida son comandos de acción.
- Requisitos de hardware no documentados: no se especifican los requisitos mínimos de hardware, lo que puede dificultar el despliegue en entornos con recursos limitados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base MolmoAct2 puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yukamatsumae/molmoact2_otter_yellowpushplace
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Repositorio de MolmoAct (versión anterior): https://github.com/allenai/MolmoAct
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
