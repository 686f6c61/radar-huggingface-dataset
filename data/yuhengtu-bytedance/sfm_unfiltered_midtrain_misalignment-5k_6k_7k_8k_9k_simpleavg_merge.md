# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-5k_6k_7k_8k_9k_simpleavg_merge

## Resumen

Este modelo es una fusión (merge) experimental de cinco checkpoints intermedios de un entrenamiento identificado como `unfiltered_midtrain_misalignment`, desarrollado por un investigador afiliado a ByteDance (usuario `yuhengtu-bytedance`). El resultado es un modelo de lenguaje generativo de aproximadamente 6,86 mil millones de parámetros, creado mediante la técnica Linear del framework `mergekit`, que promedia los pesos de los checkpoints en los pasos globales 5000, 6000, 7000, 8000 y 9000, usando como base el checkpoint del paso 9000.

El interés de este modelo es puramente investigativo: forma parte de una serie de experimentos sobre «misalignment» (desalineación) y «unfiltered» (sin filtros) en modelos de lenguaje, probablemente orientados a estudiar la evolución de la seguridad y la alineación durante el entrenamiento. No se publican datos sobre el dataset, la arquitectura exacta más allá de `gpt_neox`, ni métricas de rendimiento. Su relevancia actual reside en que ilustra una metodología de fusión de checkpoints para explorar el comportamiento de modelos en distintas fases de entrenamiento, aunque carece de documentación suficiente para un uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No publicados; el repo contiene pesos en `bfloat16` (out_dtype del merge) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de cinco checkpoints de un mismo entrenamiento, todos ellos pertenecientes a la serie `unfiltered_midtrain_misalignment`. El método utilizado es el descrito en el paper [arXiv:2203.05482](https://arxiv.org/abs/2203.05482), que consiste en un promedio ponderado de los parámetros de los modelos base. En este caso, los cinco checkpoints tienen peso 1.0 y se aplica normalización (`normalize: true`), con salida en `bfloat16`.

No se dispone de información sobre el dataset de entrenamiento, el número total de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre sugiere que el entrenamiento original fue «sin filtros» y con un objetivo de desalineación intencionada, lo que lo convierte en un artefacto de estudio más que en un modelo de propósito general. La fusión de checkpoints intermedios busca probablemente promediar comportamientos en distintas etapas del entrenamiento, una práctica habitual en experimentos de análisis de dinámicas de alineación.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, puede generar texto coherente en el idioma en que fue entrenado, aunque no se especifican los idiomas.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- Dado su origen experimental y la falta de evaluación, no es recomendable asumir capacidades avanzadas más allá de la generación básica de texto.

## Casos de uso

- Investigación académica sobre alineación y seguridad: el modelo puede usarse para estudiar cómo la fusión de checkpoints intermedios afecta al comportamiento de un modelo «sin filtrar», comparando con otras variantes de la misma serie (p. ej., `sfm_unfiltered_e2e_misalignment-5k_6k_7k_merge`).
- Experimentos de interpretabilidad: al ser un promedio de pesos de distintas fases de entrenamiento, puede servir para analizar la evolución de representaciones internas y detectar señales de desalineación.
- Desarrollo de técnicas de merge: útil como caso de prueba para validar metodologías de fusión de modelos con `mergekit`.
- Análisis de robustez: permite evaluar cómo el promedio de checkpoints afecta a la estabilidad del modelo ante entradas adversas o prompts malintencionados.
- Benchmarking de seguridad: puede incorporarse a suites de evaluación de «red teaming» para medir la toxicidad o el sesgo en modelos sin alineación explícita.
- Educación en ingeniería de modelos: sirve como ejemplo práctico de fusión de pesos y de los riesgos de usar modelos sin documentación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 6,86 mil millones de parámetros en `bfloat16`, el modelo ocupa aproximadamente 13,7 GB (tamaño del repo). Para inferencia sin cuantizar se necesitan al menos 16 GB de VRAM.
- Cuantización: no se ofrecen versiones GGUF ni AWQ, pero podría cuantizarse manualmente a 8 bits (~7 GB) o 4 bits (~4 GB) con herramientas como `bitsandbytes` o `llama.cpp`.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superiores. En consumer, una RTX 4070 Ti (12 GB) no sería suficiente sin cuantización.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI) o Hugging Face Inference Endpoints. Para cuantización local, `llama.cpp` o `Ollama` (convertido previamente).
- Latencia: no hay datos publicados; dependerá del hardware y del backend. En una A100 se podría esperar un throughput de decenas de tokens por segundo, pero sin mediciones oficiales.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoría (fusiones de checkpoints de entrenamiento no alineados) con datos públicos de rendimiento. Se podría comparar con modelos de ~7B como Llama-2-7B o Mistral-7B, pero no existen métricas de este modelo para establecer una comparación objetiva.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación sin documentación de seguridad ni evaluación de sesgos.
- Al ser «unfiltered» (sin filtros), es probable que genere contenido ofensivo, tóxico o perjudicial si se le solicita.
- No hay información sobre la licencia, por lo que su uso comercial es arriesgado y podría infringir derechos de autor o políticas de la plataforma.
- No se especifican idiomas soportados; el entrenamiento podría estar sesgado hacia un idioma concreto (probablemente inglés, pero no confirmado).
- La falta de datos sobre el contexto máximo impide garantizar un rendimiento fiable en conversaciones largas.
- No se recomienda su uso en producción sin una evaluación exhaustiva de seguridad y alineación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-5k_6k_7k_8k_9k_simpleavg_merge)
- [Paper de mergekit (Linear method)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
