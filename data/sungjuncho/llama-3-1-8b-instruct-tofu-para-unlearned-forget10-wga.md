# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo nuevo entrenado desde cero, sino el resultado de aplicar una técnica de *machine unlearning* denominada WGA (Weighted Gradient Ascent, presumiblemente) sobre un modelo previamente ajustado con el dataset TOFU-para. El objetivo es eliminar el conocimiento asociado a un conjunto de olvido (*forget set*) de 400 pares pregunta-respuesta, manteniendo al mismo tiempo la utilidad general del modelo.

La relevancia de este checkpoint reside en su contribución metodológica: la colección TOFU-para separa explícitamente el concepto de *untraining* (eliminar las muestras exactas que se usaron para el olvido) del de *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello, el dataset incorpora cinco versiones parafraseadas de cada par QA, verificadas factualmente, lo que permite medir si el olvido es genuino o meramente superficial.

El modelo conserva la arquitectura y el tamaño de Llama-3.1-8B-Instruct (8.030.261.248 parámetros) y se distribuye en formato safetensors bajo la licencia Llama 3.1 Community License. Su público objetivo son investigadores en privacidad de modelos, cumplimiento del RGPD y evaluación de métodos de desaprendizaje, no el despliegue en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct, 128k segun el modelo base, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin modificaciones estructurales. El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un checkpoint ajustado sobre la totalidad del dataset TOFU-para más dos versiones parafraseadas del mismo. Sobre esa base se aplica WGA mediante la librería `open-unlearning` del grupo LOCUS Lab.

El conjunto de olvido son los 400 pares QA originales de `forget10`. El conjunto de retención, para los métodos que lo emplean, comprende `retain90` más `para1` y `para2`, es decir, 10.800 ejemplos. Los hiperparámetros son los predeterminados de WGA en `open-unlearning`, sin recorte de gradiente, con batch efectivo de 32 y semilla 0. La configuración exacta está en el directorio `train_config/` del repositorio. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de TOFU-para.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de dominio general (la "utilidad" del modelo se mide en 0,630, lo que indica que conserva capacidades funcionales tras el desaprendizaje).
- Capacidad de *tool calling* y *function calling*: no confirmada explícitamente en la información proporcionada, aunque el modelo base la soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad específica de este checkpoint: exhibe un comportamiento de olvido medible sobre el conjunto `forget10`, con probabilidad Q-A de 0,004 y ROUGE de 0,136 en el conjunto de olvido.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para comparar métodos de desaprendizaje (WGA frente a otras técnicas) sobre el mismo modelo base y el mismo conjunto de olvido, usando las métricas FADE y TOFU forget quality.
- Evaluación de privacidad y cumplimiento: permite estudiar si un modelo puede "olvidar" datos personales o factuales concretos y en qué medida el conocimiento residual reaparece bajo paráfrasis, un requisito relevante para el RGPD.
- Estudio de la distinción *untraining* vs *unlearning*: el modelo está diseñado para medir si el olvido es superficial (solo las muestras exactas) o profundo (el conocimiento subyacente en todas sus formulaciones), gracias al conjunto de paráfrasis del dataset TOFU-para.
- Reproducibilidad de experimentos: con semilla fija (seed 0) y configuración pública en `train_config/`, permite replicar el experimento y comparar con las semillas 1 y 2 del mismo autor.
- Análisis de degradación de utilidad: al reportar `model utility` de 0,630, es útil para estudiar el compromiso entre olvido y pérdida de capacidades generales.
- Docencia y formación: como ejemplo práctico de pipeline de desaprendizaje con `open-unlearning` sobre un modelo Llama 3.1.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`) | 357,11 |
| FADE, unlearning (vs `x2-retain90-seed0`) | 296,71 (original 335,9 / para1 275,3 / para2 278,9) |
| TOFU forget quality (vs `x2-retain90-seed0`) | 6,92e-05 |
| Forget truth ratio | 0,703 |
| Forget Q-A probability | 0,004 |
| Forget Q-A ROUGE | 0,136 |
| Model utility | 0,630 |

Resultados entre semillas (0-2):

| Métrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 357,1 | 412,2 | 409,2 | 392,8 ± 31,0 |
| FADE, unlearning | 296,7 | 346,6 | 380,7 | 341,4 ± 42,3 |
| Forget Q-A probability | 0,004 | 0,004 | 0,003 | 0,003 ± 0,001 |
| Forget Q-A ROUGE | 0,136 | 0,057 | 0,048 | 0,080 ± 0,049 |
| Forget truth ratio | 0,703 | 0,710 | 0,729 | 0,714 ± 0,013 |
| Model utility | 0,630 | 0,633 | 0,616 | 0,626 ± 0,009 |

Puntos de referencia FADE:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 16,1 GB).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia sin cuantizar con contexto largo; RTX 4090 (24 GB) o A6000 (48 GB) para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, que no se distribuye en el repo.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (WGA, seed 0) | 8,03 B | no disponible | llama3.1 | Desaprendizaje WGA sobre TOFU-para |
| `x2-full-seed0` (modelo de partida) | 8,03 B | no disponible | llama3.1 | Ajuste completo sobre TOFU-para, sin desaprendizaje |
| `x2-retain90-seed0` (referencia "perfect unlearner") | 8,03 B | no disponible | llama3.1 | Reentrenado sin el conjunto de olvido |
| `x2-retain90-forget10para-seed0` (referencia "perfect untrainer") | 8,03 B | no disponible | llama3.1 | Reentrenado sin las muestras exactas de olvido |

No se dispone de comparación con modelos de desaprendizaje de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación en desaprendizaje; no se recomienda su uso en producción general.
- El olvido no es completo: la FADE de *unlearning* (296,71) está lejos del "perfect unlearner" (29,8), lo que indica que el modelo sigue siendo distinguible del modelo de referencia reentrenado.
- El olvido es parcialmente superficial: la FADE sobre las paráfrasis (275,3 y 278,9) es menor que sobre las originales (335,9), pero no alcanza el nivel de un olvido genuino.
- Existe alta varianza entre semillas: la FADE de *unlearning* varía de 296,7 a 380,7 según la semilla, lo que limita la fiabilidad de conclusiones extraídas de una sola ejecución.
- La utilidad del modelo se degrada hasta 0,630 (frente a valores superiores del modelo base sin desaprender), lo que refleja una pérdida de capacidades generales.
- Riesgo de alucinación: no evaluado en la información proporcionada; se hereda el comportamiento del modelo base Llama 3.1.
- Sesgos conocidos: no documentados en la ficha; se heredan los de Llama-3.1-8B-Instruct.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso comercial, atribución y restricciones de redistribución; debe revisarse antes de cualquier uso.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe específico más allá del heredado del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
