# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed1

## Resumen

Este modelo es un derivado de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo AdaPop, implementado en la librería open-unlearning del grupo LocusLab. Lo publica el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un trabajo de investigación que distingue entre *untraining* (eliminar las muestras concretas que se le dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El punto de partida es un fine-tuning de Llama-3.1-8B-Instruct sobre el dataset TOFU completo más dos versiones parafraseadas.

La relevancia de esta ficha es metodológica más que de producto: se trata de un artefacto de investigación para evaluar técnicas de desaprendizaje selectivo, no de un modelo pensado para despliegue general. El conjunto de olvido (*forget set*) son 400 pares QA originales de TOFU, mientras que el conjunto de retención combina retain90 más dos paráfrasis (10.800 ejemplos). La semilla utilizada es la 1, tanto para el modelo de partida como para la ejecución del desaprendizaje.

Arquitectónicamente es un transformer decoder-only denso de 8.030.261.248 parámetros (8B), con la ventana de contexto de 128.000 tokens propia de la familia Llama 3.1, aunque las evaluaciones publicadas se centran en el comportamiento sobre TOFU y no en tareas de contexto largo. La licencia es la Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no verificada en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible en la informacion proporcionada (hereda los de Llama 3.1: ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, y sobre él se aplicó primero un fine-tuning supervisado con el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA). Ese modelo intermedio, `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, es el que se somete al desaprendizaje con AdaPop usando los valores por defecto de open-unlearning: sin recorte de gradiente, batch efectivo de 32, semilla 1. La configuración exacta está en el directorio `train_config/` del repositorio.

La innovación técnica no reside en la arquitectura sino en el protocolo de evaluación. Se reporta FADE, una divergencia KL simétrica frente a un modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), que mide la dificultad de distinguir el modelo desaprendido del de referencia. Además se reportan métricas clásicas de TOFU: *forget quality*, *truth ratio*, probabilidad Q-A, ROUGE Q-A y *model utility*. El conjunto de olvido son exclusivamente los 400 pares QA originales de forget10; el de retención incluye retain90 más para1 y para2 (10.800 ejemplos).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de tipo factual, aunque el objetivo del modelo es precisamente degradar selectivamente el conocimiento del conjunto de olvido.
- Soporte de *tool calling* y *function calling* heredado de la plantilla de Llama 3.1 (no validado tras el desaprendizaje).
- Capacidades multilingües heredadas de Llama 3.1 (no validadas específicamente en esta variante).
- Modo de desaprendizaje selectivo: el modelo debería haber perdido el conocimiento de los 400 pares QA de forget10 mientras conserva el resto (utilidad reportada de 0,638).
- No incluye visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en desaprendizaje selectivo: servir como punto de comparación (semilla 1) frente a otros métodos de *unlearning* aplicados sobre el mismo modelo base en la colección TOFU-para.
- Evaluación de metodologías de *machine unlearning*: medir FADE, *forget quality* y *model utility* para contrastar AdaPop con alternativas como NPO, GradDiff o SalUn.
- Auditoría de privacidad y cumplimiento: estudiar hasta qué punto un modelo fine-tuneado puede "olvidar" datos concretos, útil para escenarios de derecho al olvido (RGPD) en modelos desplegados.
- Reproducibilidad de experimentos: al fijar semilla 1 y publicar `train_config/` y `evals/`, permite replicar exactamente el pipeline de open-unlearning.
- Análisis de la distinción *untraining* vs *unlearning*: caso de estudio de cómo un modelo puede eliminar las muestras exactas sin eliminar el conocimiento subyacente formulado con otras palabras.
- Base para experimentos de *continual learning* y olvido catastrófico controlado: comparar la degradación selectiva frente a la degradación general del modelo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 416,00 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 parafrasis) | 376,41 (original 401,3 / para1 362,9 / para2 365,0) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 4,24e-17 |
| Forget truth ratio | 0,746 |
| Forget Q-A probability | 0,003 |
| Forget Q-A ROUGE | 0,064 |
| Model utility | 0,638 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~16 GB en bfloat16 (8B parámetros), ~8-9 GB en cuantización de 8 bits, ~5-6 GB en 4 bits (estimaciones estándar para un modelo de 8B; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 a contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers (ejemplo oficial), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama previa conversión a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (AdaPop, seed 1) | 8,03B | 128k | llama3.1 | Desaprendizaje con AdaPop sobre TOFU-para |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8,03B | 128k | llama3.1 | Fine-tuning TOFU-para sin desaprendizaje (modelo de partida) |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03B | 128k | llama3.1 | Modelo de referencia "perfect unlearner" para FADE |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8,03B | 128k | llama3.1 | Modelo de referencia "perfect untrainer" para FADE |

No se dispone de comparación con métodos alternativos de desaprendizaje (NPO, GradDiff, SalUn) en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no está pensado para uso en producción ni como asistente general.
- El desaprendizaje es parcial: la FADE de *unlearning* (376,41) está lejos del "perfect unlearner" (29,8), lo que indica que el conocimiento subyacente no se ha eliminado por completo.
- Riesgo de alucinación y de filtración de conocimiento del conjunto de olvido en formulaciones no vistas durante el desaprendizaje.
- La utilidad del modelo (0,638) es inferior a la de un modelo sin desaprendizaje; puede degradar tareas generales.
- Solo se ha evaluado sobre TOFU; no hay validación en benchmarks estándar ni en contexto largo.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligación de cumplir la política de uso aceptable de Meta.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la ficha); no hay evidencia externa de su comportamiento.
- Idiomas soportados no documentados explícitamente en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed1
- Modelo base (fine-tune TOFU-para x2 full, seed 1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (LocusLab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
