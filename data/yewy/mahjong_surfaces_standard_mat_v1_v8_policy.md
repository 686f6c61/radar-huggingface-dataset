# Yewy/mahjong_surfaces_standard_mat_v1_v8_policy

## Resumen

`Yewy/mahjong_surfaces_standard_mat_v1_v8_policy` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada a través de la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, una estrategia que incrementa la estabilidad y la tasa de éxito en tareas manipulativas. Está especializado en el dominio del mahjong: manipulación de superficies y fichas sobre un tapete estándar, según indican los tags del repositorio.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse sobre robots tipo SO-101 (so101) y plataformas LeKiwi, según los tags de la model card. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones visuales y de estado del robot a comandos de control.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y despliegue de políticas robóticas de código abierto con LeRobot: un pipeline reproducible de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`) sobre hardware asequible. Es un artefacto muy específico de un dominio concreto, útil para quienes trabajan en manipulación robótica de precisión con objetos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la suavidad del control. La arquitectura combina un codificador visual (típicamente un backbone tipo ResNet) con un transformer que procesa la secuencia de observaciones y genera las acciones. La política se entrena de forma supervisada sobre demostraciones de teleoperación, sin refuerzo ni RLHF.

El entrenamiento se realizó con LeRobot sobre el dataset `Yewy/mahjong_surfaces_standard_mat_v1_v8_224`, que contiene episodios de teleoperación en el dominio del mahjong con resolución 224. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni hiperparámetros de entrenamiento más allá de los comandos de la model card.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para manipulación de fichas y superficies de mahjong.
- Entrada multimodal: procesa observaciones visuales (cámaras) y estado del robot para producir comandos motores.
- Compatible con robots SO-101 (so101) y plataformas LeKiwi, según los tags del repositorio.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes de lenguaje, razonamiento simbólico ni capacidades multilingües: es una política motora, no un modelo generativo de texto.
- No dispone de modo de pensamiento (thinking), visión semántica general ni audio.

## Casos de uso

- Manipulación de fichas de mahjong: el modelo puede recoger, colocar y reorganizar fichas sobre un tapete estándar, aprovechando el entrenamiento específico en ese dominio.
- Automatización de demostraciones en robótica educativa: sirve como ejemplo reproducible de política ACT entrenada con LeRobot para enseñar el pipeline completo de imitación.
- Investigación en aprendizaje por imitación: permite comparar variantes de ACT y datasets en una tarea concreta y acotada.
- Prototipado en robots de bajo coste: al ejecutarse sobre SO-101 y LeKiwi, encaja en plataformas asequibles para laboratorios y makers.
- Evaluación de generalización de políticas: útil para estudiar cómo se comporta una política entrenada en un único dominio ante variaciones de iluminación, posición o superficie.
- Benchmark interno de pipelines de teleoperación: sirve como referencia para validar la calidad de nuevos datasets de mahjong antes de entrenar políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en safetensors (0,2 GB de repo), la inferencia cabe holgadamente en GPUs de consumo; en fp32 el modelo ocupa aproximadamente 0,2 GB de pesos, más el overhead del codificador visual y del runtime.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-8 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una RTX 3090/4090 o superior.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte para ejecución en `cuda` o CPU según la configuración del pipeline.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yewy/mahjong_surfaces_standard_mat_v1_v8_policy | 51,7 M | Mahjong (SO-101/LeKiwi) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | Manipulación general | según autor | Hugging Face |
| Políticas Diffusion Policy | variable | Manipulación general | según autor | Hugging Face |
| Políticas VQ-BeT / otros métodos IL | variable | Manipulación general | según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente en el dominio del mahjong sobre un tapete estándar; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de benchmarks: no hay métricas publicadas de tasa de éxito, por lo que su rendimiento real en producción es desconocido.
- Dependencia del dataset: la calidad y diversidad de `Yewy/mahjong_surfaces_standard_mat_v1_v8_224` condicionan el comportamiento; no se documenta su composición.
- Riesgo de sobreajuste al entorno de entrenamiento: variaciones de iluminación, posición de cámara o tipo de robot pueden degradar el rendimiento.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas textuales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar el cumplimiento en despliegues de producción.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas aplicables, al no ser un modelo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewy/mahjong_surfaces_standard_mat_v1_v8_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_surfaces_standard_mat_v1_v8_224
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
