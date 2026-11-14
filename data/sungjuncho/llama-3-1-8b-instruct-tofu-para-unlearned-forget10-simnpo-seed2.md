# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed2

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la colección TOFU-para, cuyo objetivo es estudiar la diferencia entre *untraining* (eliminar las muestras exactas que recibió un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El checkpoint parte de un modelo base afinado sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas, más cinco parafrasis de cada par QA) y le aplica el método SimNPO mediante la librería open-unlearning.

La relevancia de este modelo es metodológica: proporciona métricas FADE (divergencia KL simétrica frente a modelos de referencia) que permiten medir cuánto se parece el modelo desaprendido a un "desaprendedor perfecto" o a un "desentrenador perfecto". Con semilla 2, el resultado publicado muestra FADE de untraining de 64,08 y FADE de unlearning de 134,07, lo que sitúa el checkpoint más cerca del comportamiento de un desentrenador que de un desaprendedor real.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B) con licencia Llama 3.1 Community License, pensado para inferencia en bfloat16 con transformers y compatible con text-generation-inference. No está pensado como modelo de producción generalista, sino como objeto de evaluación para líneas de investigación sobre privacidad, derecho al olvido y machine unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Llama 3.1 de Meta (transformer decoder-only con atención por grupos, RoPE y normalización RMSNorm), de la que hereda los 8B parámetros. El entrenamiento relevante aquí no es el preentrenamiento original, sino el pipeline de desaprendizaje: se parte del checkpoint `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, afinado sobre todo TOFU-para más dos versiones de parafrasis, y se le aplica SimNPO con los hiperparámetros por defecto de open-unlearning, sin gradient clipping, batch efectivo 32 y semilla 2.

El conjunto de olvido (forget set) son exclusivamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo usan, suma retain90 más para1 y para2 (10.800 pares). La innovación metodológica está en la separación explícita entre untraining y unlearning y en el uso de FADE como métrica de distancia frente a modelos de referencia retrenados con semillas 0, 1 y 2. Los detalles exactos de configuración están en el directorio `train_config/` del repo.

## Capacidades

- Generación de texto conversacional en inglés (el dataset TOFU es en inglés; no se documentan otros idiomas).
- Respuesta a preguntas de conocimiento factual sintético (perfil TOFU), que es el dominio sobre el que se evalúa el desaprendizaje.
- Evaluación de desaprendizaje: el checkpoint está diseñado para medir forget quality, truth ratio, probabilidad Q-A, ROUGE y FADE.
- No se documenta soporte de tool calling, function calling ni uso agéntico.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- No se documenta soporte multilingüe más allá del heredado de Llama 3.1-8B-Instruct.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como punto de comparación para medir cuánto se acerca un método (SimNPO en este caso) al ideal de "desaprendedor perfecto" mediante FADE frente a `x2-retain90-seed2`.
- Auditoría de privacidad y derecho al olvido: comprobar si el modelo sigue respondiendo a preguntas del forget set original y de sus parafrasis, usando `evals/` como referencia.
- Reproducción de experimentos: replicar el pipeline con open-unlearning partiendo del modelo base y de la configuración en `train_config/` para validar resultados con semilla 2.
- Estudio de robustez frente a parafrasis: analizar la diferencia entre FADE de untraining (64,08) y FADE de unlearning (134,07) para cuantificar cuánto conocimiento sobrevive a reformulaciones.
- Benchmark de métodos de desaprendizaje: comparar SimNPO con NPO, GradDiff u otros métodos de open-unlearning sobre el mismo modelo base y dataset TOFU-para.
- Docencia y divulgación técnica: ilustrar en cursos o artículos la distinción entre eliminar muestras y eliminar conocimiento, con métricas publicadas y reproducibles.
- Validación de pipelines de evaluación: usar los resultados por pregunta en `evals/` como golden set para verificar implementaciones de FADE y Rao-Blackwellization.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 64,08 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 134,07 (original 129,6 / para1 135,6 / para2 137,1) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 1,30e-31 |
| Forget truth ratio | 0,377 |
| Forget Q-A probability | 0,543 |
| Forget Q-A ROUGE | 0,640 |
| Model utility | 0,624 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Desentrenador perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Desaprendedor perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación por lotes; RTX 4090 (24 GB) para inferencia en bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB si se cuantiza (aunque no se publican pesos cuantizados en el repo).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-simnpo-seed2`) | 8,03B | no disponible | SimNPO sobre TOFU-para, semilla 2 | llama3.1 | Hugging Face (8 descargas) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (base) | 8,03B | no disponible | Afinado sobre TOFU-para + 2 parafrasis, sin desaprendizaje | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (referencia desaprendedor perfecto) | 8,03B | no disponible | Retrenado solo con retain90, referencia ideal | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (referencia desentrenador perfecto) | 8,03B | no disponible | Retrenado con retain90 + forget10 parafraseado | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado y evaluado sobre el dataset sintético TOFU-para en inglés; su utilidad fuera de ese dominio no está documentada.
- Riesgo de alucinación: no se reporta; al ser un modelo de 8B afinado sobre QA sintético, la generación libre fuera del dominio TOFU no está caracterizada.
- Sesgos conocidos: no documentados en la model card.
- Idiomas: no se especifican; el dataset TOFU es en inglés, por lo que el comportamiento multilingüe no está validado.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución a Meta; revisar `LICENSE` antes de cualquier despliegue.
- El resultado de FADE de unlearning (134,07) está más cerca del desentrenador perfecto (136,7) que del desaprendedor perfecto (29,8), lo que indica que el método elimina principalmente las muestras exactas y no el conocimiento subyacente en parafrasis.
- FADE es una distancia, no una dirección: valores intermedios entre filas de referencia no implican que el modelo esté "entre" esos modelos.
- El checkpoint tiene muy poca tracción (8 descargas, 0 likes) y fue creado en noviembre de 2026; no hay evidencia de validación externa.
- No se publican pesos cuantizados, por lo que el despliegue en hardware limitado requiere cuantización manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed2
- Modelo base (finetune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Referencia desaprendedor perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Referencia desentrenador perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
