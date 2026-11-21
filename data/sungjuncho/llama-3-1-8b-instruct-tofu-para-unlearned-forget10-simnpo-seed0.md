# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed0

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* mediante el algoritmo SimNPO, aplicado sobre un ajuste fino previo del modelo base con el dataset TOFU-para. Lo desarrolla el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un conjunto de experimentos que separa conceptualmente el *untraining* (eliminar las muestras concretas que recibió el método de desaprendizaje) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El problema que aborda es la evaluación rigurosa de técnicas de olvido selectivo en modelos de lenguaje, un área crítica para el cumplimiento de normativas de privacidad y derechos sobre datos.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct ajustado con todo el dataset TOFU más dos versiones parafraseadas del mismo. Sobre esa base se aplica SimNPO (un método de preferencia negativo sin necesidad de modelo de referencia) para olvidar el conjunto `forget10` original (400 pares pregunta-respuesta). La relevancia actual reside en que proporciona métricas reproducibles (FADE, *forget quality*, *model utility*) y comparaciones entre semillas, algo poco habitual en la literatura de unlearning.

Arquitectónicamente es un transformer decoder-only estándar de Meta con 8.030.261.248 parámetros, sin modificaciones estructurales respecto al Llama-3.1-8B-Instruct original. La contribución no es arquitectónica sino metodológica y de evaluación: un benchmark controlado de desaprendizaje con separación explícita entre memorización superficial y conocimiento generalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), sin modificaciones estructurales |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama-3.1-8B-Instruct estándar (transformer decoder-only con atención causal, RoPE y GQA) que ha pasado por dos fases de ajuste. Primero, el modelo base fue ajustado con el dataset TOFU-para completo más dos versiones parafraseadas de cada par QA (`x2-full`). Después, sobre ese checkpoint se aplicó SimNPO mediante la librería `open-unlearning` del grupo locuslab, usando como conjunto a olvidar únicamente los 400 pares QA originales de `forget10` y como conjunto de retención `retain90 + para1 + para2` (10.800 ejemplos). Los hiperparámetros son los predeterminados de SimNPO en `open-unlearning`, sin gradient clipping, con batch efectivo de 32; la configuración exacta está en `train_config/`.

La innovación metodológica clave es la separación entre *untraining* y *unlearning* mediante el uso de paráfrasis: un modelo que solo ha "desaprendido" las muestras exactas del conjunto de olvido seguirá respondiendo con el conocimiento subyacente cuando se le pregunte con otras formulaciones. La métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta, temperatura 1 y estimador Rao-Blackwellizado) cuantifica esta distinción. El modelo se entrena con semilla 0, y se compara contra modelos de referencia de la misma semilla para evitar ruido entre ejecuciones.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU (biografías sintéticas de autores ficticios).
- Capacidad de *unlearning* selectivo: el modelo ha sido entrenado para no reproducir el conjunto `forget10` original.
- Resistencia parcial a la recuperación mediante paráfrasis: las métricas FADE de *unlearning* (134,72) muestran que el conocimiento subyacente aún es detectable mediante reformulaciones, lo que es precisamente el fenómeno que el benchmark mide.
- Soporte de *tool calling* / *function calling*: heredado del modelo base Llama-3.1-8B-Instruct (no verificado específicamente tras el ajuste).
- Capacidades multilingües: heredadas del modelo base, aunque no se documentan en la model card de este checkpoint.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de comparación reproducible para evaluar nuevos algoritmos de olvido selectivo frente a SimNPO, con métricas FADE y *forget quality* ya calculadas.
- Auditoría de privacidad y cumplimiento (RGPD, derecho al olvido): permite estudiar hasta qué punto un modelo ajustado puede "olvidar" datos concretos y en qué medida el conocimiento persiste bajo reformulaciones.
- Benchmarking de métodos de desaprendizaje: la colección TOFU-para incluye variantes con distintas semillas y métodos, lo que facilita comparaciones controladas del efecto de la semilla en la estabilidad del olvido.
- Estudio de la dicotomía memorización/generalización: el par de métricas *untraining* vs *unlearning* permite analizar si un método elimina solo la memorización superficial o el conocimiento real.
- Evaluación de robustez frente a *jailbreaks* de recuperación: útil para probar si un atacante puede extraer información "olvidada" reformulando preguntas.
- Docencia y experimentación en ajuste fino: al ser un checkpoint de 8B con licencia Llama 3.1, puede ejecutarse en entornos de investigación con GPUs de gama alta para reproducir los experimentos del autor.
- Base para experimentos de *continual learning*: punto de partida para estudiar cómo reintroducir o eliminar conocimiento de forma controlada.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 0):

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 69,37 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 134,72 (original 131,8 / para1 133,9 / para2 138,5) |
| TOFU forget quality | 1,07e-37 |
| Forget truth ratio | 0,378 |
| Forget Q-A probability | 0,534 |
| Forget Q-A ROUGE | 0,651 |
| Model utility | 0,646 |

Promedio entre semillas 0-2:

| Métrica | Media ± sd |
|---|---|
| FADE, untraining | 67,0 ± 2,7 |
| FADE, unlearning | 136,0 ± 2,7 |
| Forget Q-A probability | 0,530 ± 0,016 |
| Forget Q-A ROUGE | 0,642 ± 0,008 |
| Forget truth ratio | 0,378 ± 0,001 |
| Model utility | 0,631 ± 0,013 |

Puntos de referencia FADE aportados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin unlearning (`x2-full`, modelo de partida) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (el repo ocupa 16,1 GB en safetensors).
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones a partir del número de parámetros; el autor no publica cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa con contexto largo. Una RTX 4090 (24 GB) es suficiente para bfloat16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, o en GPUs de 12-16 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), vLLM, TGI (el tag `text-generation-inference` y `endpoints_compatible` están presentes), llama.cpp y Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SimNPO, seed 0) | 8,03B | no disponible | SimNPO sobre TOFU-para x2-full | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | no disponible | Sin unlearning (modelo de partida) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | no disponible | Referencia "perfect unlearner" (entrenado solo con retain) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B | no disponible | Referencia "perfect untrainer" (entrenado sin forget10 ni paráfrasis) | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (original de Meta) | 8,03B | 128.000 tokens | No aplica | llama3.1 | Hugging Face / Meta |

La comparación más directa es contra el modelo de partida `x2-full` (FADE unlearning 156,3 frente a 134,7 de este checkpoint) y contra los modelos de referencia ideales del benchmark. Este modelo se sitúa en el rango esperado para SimNPO: mejora claramente al modelo sin desaprender en la tarea de unlearning, pero no alcanza al "perfect unlearner" (FADE 29,8), lo que refleja que el conocimiento subyacente persiste bajo paráfrasis.

## Limitaciones y advertencias

- El *unlearning* es parcial: la FADE de unlearning (134,72) está lejos del ideal (29,8), lo que indica que el modelo aún conserva conocimiento del conjunto `forget10` recuperable mediante reformulaciones.
- La métrica *forget quality* (1,07e-37) es extremadamente baja, señal de que el olvido no es completo desde la perspectiva de la prueba TOFU estándar.
- El modelo está ajustado específicamente sobre el dataset TOFU-para (biografías sintéticas); su comportamiento fuera de ese dominio no está caracterizado y puede degradarse respecto al Llama-3.1-8B-Instruct original.
- No se documentan sesgos específicos, pero hereda los del modelo base Llama 3.1, entrenado con datos web a gran escala.
- Riesgo de alucinación: presente como en cualquier LLM de 8B; el ajuste sobre datos sintéticos puede aumentar la confianza en respuestas incorrectas sobre las biografías del dataset.
- Idiomas soportados no documentados; se asume el multilingüismo del modelo base, pero no verificado tras el ajuste.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para ciertos usos, prohibiciones de uso). Verificar los términos completos antes de producción.
- El modelo está pensado para investigación en unlearning, no como modelo de producción general; su *model utility* (0,646) es inferior al de un modelo sin ajustar en las tareas del benchmark.
- No se publican cuantizaciones oficiales ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), lo que limita la evaluación de su calidad general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base (x2-full): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Librería open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
