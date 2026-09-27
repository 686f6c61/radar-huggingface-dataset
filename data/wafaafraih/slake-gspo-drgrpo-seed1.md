# WafaaFraih/slake-gspo-drgrpo-seed1

## Resumen

`WafaaFraih/slake-gspo-drgrpo-seed1` es un ajuste fino multimodal publicado en HuggingFace por el usuario WafaaFraih. Parte del modelo base `unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit`, es decir, una versión ya cuantizada en 4 bits (bitsandbytes) del Qwen2.5-VL-7B-Instruct de Alibaba, un transformer denso de visión-lenguaje con unos 7 000 millones de parámetros. El entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization), el algoritmo de refuerzo introducido en DeepSeekMath, mediante la librería TRL.

El nombre del repositorio sugiere, como interpretación y no como dato confirmado en la model card, que el ajuste se orienta a tareas de razonamiento sobre el conjunto de datos SLAKE (preguntas y respuestas visuales de ámbito médico) y que se han probado variantes del algoritmo de optimización (GSPO y DR-GRPO) con una semilla concreta (`seed1`). Se trata, por tanto, de un checkpoint de investigación más que de un modelo listo para producción: no declara licencia, idiomas ni pipeline, no publica resultados de benchmarks y acumula cero descargas y cero valoraciones en el momento de redactar esta ficha.

Su relevancia es acotada pero clara para quien investiga el ajuste fino por refuerzo de modelos multimodales: sirve como punto de referencia reproducible (semilla fijada, versiones de framework documentadas) para comparar variantes de GRPO sobre un VLM de 7B. El tamaño del repositorio, 0,3 GB, es compatible con un conjunto de adaptadores LoRA en lugar de pesos completos, aunque ese extremo no se explicita en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), heredada de Qwen2.5-VL-7B-Instruct; ajuste posterior con GRPO |
| Parametros totales | ~7 000 millones (indicado en el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información del repositorio; el modelo base Qwen2.5-VL-7B-Instruct declara 128 000 tokens |
| Tipos de cuantizacion | El modelo base está cuantizado en 4 bits (bnb-4bit); no se documentan otras cuantizaciones publicadas para este ajuste |
| Idiomas soportados | no disponible; el modelo base Qwen2.5-VL es multilingüe (inglés, chino y otros), sin confirmación para este ajuste |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar términos) |
| Formato de pesos | safetensors (etiqueta del repositorio), cargable con transformers; tamaño del repositorio 0,3 GB |
| Modelo base | unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit |
| Metodo de entrenamiento | GRPO (TRL), con variantes sugeridas por el nombre: GSPO y DR-GRPO |
| Dataset | no disponible; el nombre del repositorio referencia SLAKE (no confirmado en la model card) |
| Frameworks declarados | TRL 0.24.0, Transformers 5.5.0, PyTorch 2.10.0+cu128, Datasets 4.3.0, Tokenizers 0.22.2 |
| Compatibilidad de despliegue | `endpoints_compatible` (etiqueta del repositorio) |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct: un transformer denso con un codificador visual conectado a un modelo de lenguaje, diseñado para intercalar imágenes y texto en la misma secuencia de entrada. Sobre ese modelo base, ya cuantizado en 4 bits mediante bitsandbytes y distribuido por Unsloth, se ha aplicado un ajuste fino con GRPO, un algoritmo de optimización de política relativa por grupos que evita la necesidad de un modelo crítico (value network) separado y que se popularizó con DeepSeekMath para tareas de razonamiento matemático. El entrenamiento se ejecutó con TRL 0.24.0 sobre Transformers 5.5.0 y PyTorch 2.10.0+cu128.

No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo una fase previa de SFT o DPO, ni hiperparámetros como la tasa de aprendizaje, el tamaño de grupo de GRPO o el número de pasos. El nombre `slake-gspo-drgrpo-seed1` apunta a un experimento controlado por semilla sobre el corpus SLAKE y a la comparación de dos variantes de la familia GRPO, pero se trata de una inferencia a partir del identificador, no de un dato confirmado en la model card. Tampoco se especifica qué componentes se entrenaron (adaptadores LoRA, proyección visual, módulo de lenguaje completo), aunque el tamaño del repositorio (0,3 GB) apunta a adaptadores.

## Capacidades

- Generación de texto condicionada por imagen: al heredar la arquitectura de Qwen2.5-VL-7B-Instruct, el modelo puede responder preguntas sobre contenido visual.
- Razonamiento multimodal orientado a pregunta-respuesta, presumiblemente sobre imágenes médicas (SLAKE), si se confirma la interpretación del nombre.
- Razonamiento en varios pasos derivado del ajuste con GRPO, un algoritmo concebido para reforzar cadenas de razonamiento.
- Soporte multilingüe: no confirmado para este ajuste; el modelo base maneja inglés y chino, entre otros idiomas.
- Tool calling / function calling: no documentado en la información disponible, aunque el modelo base Qwen2.5-VL-Instruct sí declara capacidades de llamada a herramientas y uso de agentes.
- Modo de pensamiento explícito (thinking mode): no documentado para este ajuste.
- Capacidades de audio: no disponibles (Qwen2.5-VL no incluye entrada de audio).
- Compatibilidad con `text-generation` mediante `pipeline` de Transformers, tal como muestra la model card.

## Casos de uso

- Investigación sobre ajuste por refuerzo en VLMs: el checkpoint, con semilla fijada y versiones de framework documentadas, permite reproducir y comparar la variante GSPO frente a DR-GRPO sobre el mismo modelo base y el mismo corpus.
- Evaluación de VQA médico: si se confirma el uso de SLAKE, sirve para responder preguntas sobre radiografías y tomografías de ese corpus y para medir la mejora respecto al modelo base sin ajustar. No debe emplearse como herramienta clínica.
- Ablaciones de cuantización: al partir de un modelo base en 4 bits, resulta útil para estudiar cómo afecta el ajuste por refuerzo a un modelo ya cuantizado y si el posterior reajuste degrada la precisión.
- Referencia en pipelines de TRL: el checkpoint es un ejemplo funcional de entrenamiento GRPO con TRL 0.24.0 y puede usarse como plantilla para configurar experimentos equivalentes sobre otros VLMs.
- Extracción de información de documentos escaneados: con la ventana de contexto del modelo base, se pueden procesar informes con imágenes y texto para tareas de resumen o extracción de campos, siempre con validación humana.
- Prototipado de asistentes visuales de dominio restringido: útil para pruebas de concepto internas donde el requisito de licencia no sea bloqueante y se asuma el riesgo de alucinación.
- Generación de descripciones de imágenes para conjuntos de datos: puede emplearse para preetiquetar corpus visuales antes de una revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU, SLAKE ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos para un VLM de 7B con codificador visual): ~5-7 GB en 4 bits, ~10-12 GB en 8 bits y ~16-18 GB en FP16/BF16, incluyendo pesos, torre visual y caché de activaciones.
- La caché KV crece de forma lineal con la longitud de contexto; con la ventana de 128 000 tokens del modelo base las necesidades de memoria pueden superar con holgura las cifras anteriores si no se aplican técnicas como atención con ventana deslizante, cuantización de la caché o *paged attention*.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para contextos largos y servicio concurrente; RTX 4090 (24 GB) resulta suficiente para inferencia en 4 u 8 bits con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 5090 y tarjetas con 12-16 GB si se usa cuantización de 4 bits y se limita la longitud de contexto. En GPUs de 8 GB el margen es muy estrecho y probablemente insuficiente con el codificador visual activo.
- Opciones de despliegue: transformers (ruta confirmada por la model card y la etiqueta `endpoints_compatible`), vLLM (soporta la familia Qwen2.5-VL), TGI y, con limitaciones para la parte visual, llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| slake-gspo-drgrpo-seed1 | ~7B (heredado) | no disponible (base: 128 000 tokens) | no disponible | HuggingFace, 0 descargas | Ajuste por GRPO sobre base en 4 bits; sin benchmarks |
| Qwen2.5-VL-7B-Instruct (modelo base sin ajustar) | ~7B | 128 000 tokens | Apache 2.0 (según su ficha oficial) | HuggingFace, ampliamente desplegado | Capacidades de agente, tool calling y OCR; ampliamente evaluado |
| unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit (base inmediata) | ~7B | 128 000 tokens | Apache 2.0 (según su ficha oficial) | HuggingFace | Versión cuantizada en 4 bits optimizada para ajuste fino |
| Otros VLM abiertos de ~7-8B (LLaVA-OneVision, InternVL2.5, MiniCPM-V) | 7-8B aprox. | no disponible | Apache 2.0 / MIT según cada proyecto | HuggingFace | Alternativas de la misma categoría; los datos concretos de cada una no forman parte de la información proporcionada y deben consultarse en sus fichas |

## Limitaciones y advertencias

- No se declara licencia. Sin términos explícitos, el uso comercial queda en una zona jurídica indeterminada y no debería asumirse permisividad por heredar de un modelo base Apache 2.0.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base ni de que no lo degrade.
- Riesgo elevado de sobreajuste al dominio de entrenamiento (presumiblemente SLAKE y ámbito médico), con posible pérdida de capacidades generales.
- Riesgo de alucinación, especialmente relevante si el modelo se aplica a contenido médico o a interpretación de imágenes diagnósticas. No es un dispositivo médico ni debe usarse para decisiones clínicas.
- El ajuste parte de un modelo ya cuantizado en 4 bits, lo que introduce un error de cuantización acumulado que puede afectar a tareas sensibles a la precisión numérica.
- No se documentan idiomas soportados; el comportamiento en castellano no está verificado y podría degradarse respecto al modelo base.
- El repositorio tiene 0 descargas y 0 valoraciones: no hay validación externa, informes de terceros ni historial de incidencias.
- No se especifica si el checkpoint contiene pesos completos o solo adaptadores; los 0,3 GB del repositorio sugieren adaptadores, lo que exige cargar el modelo base para su uso.
- El ejemplo de la model card emplea `pipeline("text-generation")` con una pregunta puramente textual, sin entrada de imagen; conviene verificar el manejo multimodal real antes de integrarlo.
- Sin información sobre sesgos: no se han publicado análisis de sesgo demográfico, cultural o lingüístico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WafaaFraih/slake-gspo-drgrpo-seed1
- Modelo base: https://huggingface.co/unsloth/qwen2.5-vl-7b-instruct-unsloth-bnb-4bit
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
