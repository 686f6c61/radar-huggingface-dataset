# theconstruct-ai/raw-merged-1000

## Resumen

raw-merged-1000 es un modelo Vision-Language-Action (VLA) especializado en manipulación robótica bimanual, desarrollado por theconstruct-ai. Se trata de un fine-tuning directo del modelo fundacional nvidia/GR00T-N1.7-3B (3.144 millones de parámetros) para el robot humanoide Unitree G1 de 23 grados de libertad, orientado a tareas autónomas de clasificación de paquetes. El modelo combina percepción visual, comprensión del lenguaje y generación de acciones motoras en un único transformer multimodal.

La relevancia del modelo radica en su enfoque de entrenamiento: en lugar de partir de checkpoints intermedios específicos de tarea, se fine-tunea directamente desde el modelo base sobre un dataset combinado de demostraciones teleoperadas reales, lo que según el autor favorece una adaptación nativa a variaciones de trayectoria sin sesgos heredados. El entrenamiento se realizó en 1.000 pasos sobre 2 GPU NVIDIA H200 SXM.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial e industrial, aunque el repositorio no incluye información sobre idiomas soportados, benchmarks publicados ni detalles sobre el proceso de cuantización. Su pipeline declarado es `robotics` y su formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en nvidia/GR00T-N1.7-3B |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Embodiment | Unitree G1, 23 DOF (g1_23dof) |
| Representacion de accion | 23 DOF (control relativo de articulaciones y EEF) |
| Tamano del repositorio | 35,7 GB |
| Pasos de entrenamiento | 1.000 |
| Hardware de entrenamiento | 2x NVIDIA H200 SXM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del fundacional nvidia/GR00T-N1.7-3B, un transformer multimodal que integra percepción visual, instrucciones en lenguaje natural y generación de acciones motoras. La representación de acción emplea 23 grados de libertad con control relativo tanto de articulaciones como del efector final (EEF), adaptada a la cinemática del Unitree G1. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del corpus multimodal ni si se aplicaron técnicas de RLHF o DPO.

El fine-tuning se realizó directamente desde el checkpoint base, sin checkpoints intermedios específicos de tarea. El dataset de entrenamiento (`theconstruct-ai/merged_dataset`) combina tres fuentes: `theconstruct-ai/sort_packages_real`, `theconstruct-ai/sort-pckg-real-guillem` y episodios nuevos de demostración teleoperada recogidos en el mundo real. El autor sostiene que entrenar simultáneamente sobre demostraciones históricas y episodios nuevos permite al modelo aprender capacidades de manipulación robustas y adaptarse de forma nativa a variaciones de trayectoria. El entrenamiento se ejecutó durante 1.000 pasos sobre 2 GPU H200 SXM.

## Capacidades

- Generación de acciones motoras bimanuales para el Unitree G1 con 23 DOF, incluyendo control relativo de articulaciones y del efector final.
- Percepción visual integrada para localizar y manipular paquetes en entornos reales.
- Comprensión de instrucciones en lenguaje natural como entrada para guiar la política de acción (capacidad VLA del modelo base).
- Ejecución autónoma de tareas de clasificación de paquetes (package sorting) en escenarios reales.
- Adaptación a variaciones de trayectoria gracias al entrenamiento sobre un dataset mixto de demostraciones teleoperadas.
- Capacidad de operar en configuración bimanual (dos brazos) sobre el humanoide Unitree G1.
- Soporte de tool calling, function calling, agentes multi-paso, thinking mode, visión general, audio o capacidades multilingües: no disponible en la información proporcionada (el modelo está orientado a robótica, no a texto general).

## Casos de uso

- Clasificación automatizada de paquetes en almacenes: el modelo ejecuta políticas bimanuales sobre el Unitree G1 para recoger, identificar y depositar paquetes en las ubicaciones correspondientes, aprovechando su entrenamiento específico sobre demostraciones reales de sorting.
- Investigación en manipulación bimanual: sirve como checkpoint de referencia para estudiar cómo el fine-tuning directo desde un fundacional VLA afecta a la robustez y adaptación a variaciones de trayectoria en humanoides de 23 DOF.
- Prototipado de pipelines de teleoperación a autonomía: permite comparar políticas entrenadas con 1.000 pasos sobre datasets mixtos frente a enfoques con checkpoints intermedios, evaluando el impacto en la generalización.
- Automatización de líneas de logística de paquetes pequeños y medianos: el control relativo de EEF y articulaciones facilita tareas de pick-and-place repetitivas en entornos controlados.
- Benchmarking de modelos VLA en robótica humanoide: al estar basado en GR00T-N1.7-3B y publicarse en safetensors con licencia Apache 2.0, puede integrarse en comparativas reproducibles de políticas de manipulación.
- Despliegue en entornos de investigación con hardware Unitree G1: el modelo está etiquetado con el embodiment `g1_23dof`, lo que simplifica la integración en plataformas que ya utilizan este robot.
- Fine-tuning posterior para nuevas tareas de sorting: al partir de un dataset combinado y un checkpoint base, puede servir como punto de partida para adaptar la política a otras categorías de objetos o configuraciones de almacén.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,14 B parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 6,3 GB solo para pesos, más memoria para activaciones y buffers visuales; en cuantizaciones de 8 bits o 4 bits podría reducirse, pero no se han publicado conversiones ni cifras verificadas.
- GPU recomendadas: el entrenamiento se realizó sobre 2x NVIDIA H200 SXM; para inferencia no se especifican requisitos. Por tamaño, cabría en GPU de gama alta con suficiente VRAM (A100, H100, RTX 4090) siempre que el pipeline robótico y el procesamiento visual asociado lo permitan.
- ¿Cabe en consumer GPU? No confirmado. El tamaño de pesos en FP16 es compatible con GPUs consumer de 16-24 GB, pero la latencia y el stack de robótica (percepción, control en tiempo real) pueden requerir hardware adicional.
- Opciones de despliegue: no se documentan en la model card. Al estar en safetensors y basarse en GR00T, es probable que requiera el stack de NVIDIA GR00T/Isaac para robótica; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, que están orientados a LLMs de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theconstruct-ai/raw-merged-1000 | 3,14 B | no disponible | VLA para Unitree G1 (sorting) | Apache 2.0 | HuggingFace |
| nvidia/GR00T-N1.7-3B | 3 B (aprox.) | no disponible | VLA fundacional para humanoides | no disponible en la informacion | HuggingFace (modelo base) |
| Otros VLA para humanoides (p. ej. variantes de OpenVLA, RT-2) | no disponible | no disponible | Manipulación robótica general | no disponible | no disponible |

La comparación directa con alternativas queda limitada porque la información proporcionada solo identifica el modelo base nvidia/GR00T-N1.7-3B. No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparativa cuantitativa con otros VLA.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificación de paquetes) y un único embodiment (Unitree G1, 23 DOF); no es un modelo de propósito general.
- No se han publicado benchmarks, métricas de éxito en tareas ni evaluaciones de robustez, por lo que su rendimiento real en producción es desconocido.
- El entrenamiento de solo 1.000 pasos puede implicar un ajuste limitado; no se documenta la composición exacta ni el volumen del dataset.
- Riesgo de sobreajuste a las condiciones de las demostraciones teleoperadas (iluminación, disposición de paquetes, entorno de recogida), con posible degradación en escenarios distintos.
- No se dispone de información sobre sesgos visuales o de lenguaje heredados del modelo base.
- Riesgo de alucinación en la interpretación de instrucciones en lenguaje natural: no evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base nvidia/GR00T-N1.7-3B puede tener condiciones adicionales que no se detallan en la información disponible; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- No se documentan requisitos de seguridad física para la operación del robot; en aplicaciones reales con humanoides es imprescindible implementar paradas de emergencia y límites de fuerza.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theconstruct-ai/raw-merged-1000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/theconstruct-ai/merged_dataset
- Subconjunto de dataset: https://huggingface.co/datasets/theconstruct-ai/sort_packages_real
- Subconjunto de dataset: https://huggingface.co/datasets/theconstruct-ai/sort-pckg-real-guillem
