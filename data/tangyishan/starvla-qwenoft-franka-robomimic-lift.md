# TangYishan/starvla-qwenoft-franka-robomimic-lift

## Resumen

El modelo `TangYishan/starvla-qwenoft-franka-robomimic-lift` es un checkpoint de humo (smoke test) de un modelo de visión-lenguaje-acción (VLA) desarrollado por TangYishan sobre el framework StarVLA. Está diseñado para el control robótico de un brazo Franka en la tarea Lift del benchmark RoboMimic, pero se trata de una ejecución de validación de ingeniería, no de una política convergida. El modelo utiliza un backbone Qwen3.5-0.8B con un action head MLP, siguiendo la arquitectura Qwen-OFT de predicción paralela de acciones. El repositorio ocupa 13,4 GB e incluye un checkpoint DeepSpeed de 1000 pasos de entrenamiento, así como configuraciones y estadísticas de normalización.

La relevancia de este modelo reside en que sirve como prueba de concepto del pipeline de entrenamiento StarVLA con QwenOFT sobre datos reales de RoboMimic convertidos a LeRobot v2.1. No está pensado para despliegue en producción, sino para validar el flujo de datos, la configuración del entrenamiento y la integración de componentes en el ecosistema StarVLA. Al ser un checkpoint preliminar, sus capacidades son limitadas y sus acciones carecen de semántica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (Vision-Language-Action) con backbone Qwen3.5-0.8B y action head MLP (Qwen-OFT) |
| Parametros totales | No disponible (backbone de 0.8B, total no especificado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en formato DeepSpeed) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | DeepSpeed checkpoint (pytorch_model.pt) y configuracion YAML |

## Arquitectura y entrenamiento

El modelo se basa en el framework StarVLA, que adopta una arquitectura modular de backbone y action head. En este caso, el backbone es un modelo de lenguaje y visión Qwen3.5-0.8B, y el action head es un MLP que predice acciones continuas de forma paralela (Qwen-OFT). El entrenamiento se realizó sobre el dataset RoboMimic Lift (real Franka, `lift_real/ph`) convertido a LeRobot v2.1, con 180 episodios de entrenamiento y 10 351 frames. Se ejecutaron 1000 pasos con batch size 1. La observación consiste en dos vistas RGB (base y ego) a resolución 224×224, y la salida es una acción delta de 7 dimensiones (posición, orientación en axis-angle y apertura del gripper) con horizonte 16. La normalización usa min-max y la clave de embodiment es `new_embodiment`. No se menciona el uso de RLHF ni DPO; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Genera acciones de control de 7 grados de libertad para un brazo robótico Franka a partir de observaciones visuales.
- Procesa dos vistas RGB simultáneas (base y ego) a 224×224 píxeles.
- Predice secuencias de acciones de horizonte 16 (delta de posición, orientación y gripper).
- Integra normalización de observaciones y acciones mediante estadísticas del dataset.
- Compatible con el pipeline de LeRobot v2.1 para carga de datos y evaluación.
- No incluye capacidades de lenguaje natural, tool calling, ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Validación de pipelines de entrenamiento VLA: permite comprobar que el flujo de datos, la configuración y el entrenamiento funcionan correctamente antes de lanzar entrenamientos completos.
- Pruebas de integración con LeRobot: al convertir datos de RoboMimic a LeRobot v2.1, sirve para verificar la compatibilidad entre formatos y el correcto manejo de las estadísticas de normalización.
- Desarrollo de políticas robóticas en simulación: aunque no es convergido, puede usarse como base para pruebas de inferencia en entornos simulados con observaciones sintéticas.
- Investigación en aprendizaje por imitación: ofrece un punto de partida para estudiar el efecto del tamaño del backbone o del action head en tareas de manipulación.
- Benchmarking de arquitecturas VLA: permite comparar el rendimiento de QwenOFT frente a otros action heads dentro del framework StarVLA.
- Educación en robótica y aprendizaje automático: como ejemplo de un modelo VLA pequeño y de código abierto, útil para demostrar conceptos de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un smoke checkpoint no convergido, por lo que no hay métricas de rendimiento comparativas (MMLU, HumanEval, etc.) ni evaluaciones en entornos robóticos reales.

## Requisitos de hardware

- Tamaño del repositorio: 13,4 GB (incluye checkpoint, configuraciones y estadísticas).
- El modelo tiene un backbone de 0.8B, por lo que en FP32 ocuparía aproximadamente 3,2 GB solo de pesos, aunque el checkpoint DeepSpeed puede incluir estados de optimizador y requerir más memoria.
- Se estima que es ejecutable en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 3070, RTX 4060), pero no se han publicado requisitos oficiales.
- Para inferencia, se podría usar Transformers con carga del checkpoint, o exportar a formatos como ONNX o TensorRT para optimización.
- No se dispone de datos de latencia ni throughput. Dado el pequeño tamaño, se espera una latencia baja en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El framework StarVLA soporta otros backbones como Qwen-VL o Cosmos, pero no hay datos públicos de rendimiento de este checkpoint frente a alternativas como OpenVLA, RT-2 o π0. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un smoke checkpoint con solo 1000 pasos de entrenamiento; no es una política convergida y no debe usarse en despliegue real.
- La validación se realizó únicamente con observaciones sintéticas, sin un brazo Franka físico.
- Las acciones generadas no llevan semántica de tarea a esta escala, por lo que no son fiables para control robótico.
- No se conocen los idiomas soportados, aunque al ser un modelo de visión-acción, el componente lingüístico no está entrenado para tareas de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente contra el despliegue en producción.
- No hay información sobre sesgos o alucinaciones; al ser un modelo de control, estos conceptos no aplican directamente, pero la falta de convergencia implica alta probabilidad de acciones erróneas.

## Enlaces

- HuggingFace: [TangYishan/starvla-qwenoft-franka-robomimic-lift](https://huggingface.co/TangYishan/starvla-qwenoft-franka-robomimic-lift)
- GitHub StarVLA: [starVLA/starVLA](https://github.com/starVLA/starVLA)
- GitHub tongji-AI/superVLA (relacionado): [tongji-AI/superVLA](https://github.com/tongji-AI/superVLA)
- Artículo arXiv: [StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing](https://arxiv.org/abs/2604.05014)
- Página del paper en HuggingFace: [2604.05014](https://huggingface.co/papers/2604.05014)
- Documentación de Qwen-OFT en DeepWiki: [Qwen-OFT (Parallel Prediction)](https://deepwiki.com/starVLA/starVLA/4.4-qwen-oft-(parallel-prediction))
