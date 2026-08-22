# zeta0707/act_makerfaire26

## Resumen

El modelo `zeta0707/act_makerfaire26` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice segmentos de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de HuggingFace, que facilita el entrenamiento, evaluación y despliegue de políticas robóticas sobre datasets teleoperados.

El modelo cuenta con 51.680.908 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y adecuada para entornos de investigación y prototipado con recursos limitados. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El dataset de entrenamiento asociado es `zeta0707/makerfaire26`, que contiene 25.700 filas de datos multimodal (tabular, series temporales y vídeo).

La relevancia de este modelo radica en su aplicación directa al aprendizaje por demostración en robótica, un campo en crecimiento para automatizar tareas de manipulación sin programación explícita. Al estar integrado con LeRobot, ofrece un flujo de trabajo completo desde la recogida de datos hasta la inferencia en robots reales como el brazo SO-100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.680.908 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos robóticos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), descrita en el artículo arXiv 2304.13705. ACT es un método de imitación que aprende a generar secuencias de acciones (chunks) a partir de observaciones del entorno, en lugar de predecir un único paso. Esto reduce el error acumulado y mejora la robustez en tareas de manipulación. La arquitectura combina un transformer encoder-decoder con un módulo de estilo CVAE (Conditional Variational Autoencoder) para modelar la variabilidad en las demostraciones.

El entrenamiento se realizó con el framework LeRobot, que gestiona el dataset, el proceso de optimización y el guardado de checkpoints. El dataset `zeta0707/makerfaire26` contiene 25.700 filas de datos teleoperados, con modalidades tabular, series temporales y vídeo, aunque no se ha publicado el número exacto de tokens de entrenamiento ni la composición detallada del dataset. No se menciona el uso de RLHF, DPO ni otras técnicas de optimización adicionales.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de alta dimensión para manipulación.
- Predicción de chunks de acciones: reduce la acumulación de errores en tareas de largo horizonte.
- Integración con LeRobot: permite entrenamiento, evaluación y despliegue con un solo comando CLI.
- Compatible con robots SO-100: la documentación del modelo indica soporte para el brazo robótico SO-100 como seguidor.
- Aprendizaje a partir de demostraciones teleoperadas: no requiere programación explícita de la tarea.
- No incluye capacidades de procesamiento de lenguaje, visión general ni tool calling: es un modelo especializado en robótica.

## Casos de uso

- Tareas de pick-and-place: el modelo puede aprender a recoger y colocar objetos en posiciones determinadas a partir de demostraciones, usando el brazo SO-100.
- Automatización de ensamblaje en laboratorio: en entornos de investigación, se puede entrenar para tareas de inserción o montaje repetitivo.
- Investigación en imitación learning: sirve como punto de partida para comparar métodos de chunking de acciones frente a políticas de un solo paso.
- Prototipado de soluciones robóticas para maker fairs: el nombre del dataset sugiere aplicaciones en ferias de creación, donde se demuestran capacidades robóticas interactivas.
- Integración en pipelines de LeRobot: permite combinar la política con otros modelos del ecosistema para tareas más complejas.
- Educación en robótica: al ser ligero y de código abierto, puede usarse en cursos para enseñar aprendizaje por demostración con hardware accesible como SO-100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, la inferencia en FP32 requiere aproximadamente 200 MB de VRAM; en cuantización FP16, unos 100 MB. Es compatible con GPUs de consumo básico.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3060 o superior). Para entrenamiento, se recomienda una GPU con 8 GB o más.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU comercial actual sin problemas.
- Opciones de despliegue: LeRobot es el framework principal, con soporte para entrenamiento en CUDA e inferencia en el robot. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Sin embargo, la arquitectura ACT es común en el ecosistema LeRobot, y otros modelos de imitación como Diffusion Policy o CVAE Transformer pueden ser comparables en tareas de manipulación. No hay datos concretos de rendimiento para realizar una comparación numérica.

## Limitaciones y advertencias

- Dataset limitado: el dataset `makerfaire26` tiene 25.700 filas, pero no se especifica el número de episodios ni la variabilidad de las tareas. El modelo puede no generalizar bien a tareas fuera de las demostraciones.
- Sin procesamiento de lenguaje: no es un modelo multimodal; solo genera acciones a partir de observaciones robóticas (estado del robot y posiblemente imágenes).
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones no seguras en situaciones no vistas durante el entrenamiento.
- Dependencia del framework LeRobot: el modelo está diseñado para usarse con LeRobot; su integración fuera de este ecosistema requiere adaptación.
- Licencia Apache-2.0: permite uso comercial, pero se debe cumplir la atribución de autoría y los términos de la licencia.
- No se han publicado métricas de seguridad ni evaluaciones de sesgos; no se recomienda su uso en aplicaciones críticas sin validación previa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/zeta0707/act_makerfaire26)
- [Dataset en HuggingFace](https://huggingface.co/datasets/zeta0707/makerfaire26)
- [Perfil de HuggingFace de zeta0707](https://huggingface.co/zeta0707/models)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Artículo de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Perfil de GitHub de zeta0707](https://github.com/zeta0707)
