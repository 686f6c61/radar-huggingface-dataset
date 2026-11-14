# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2` es un checkpoint derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho` en Hugging Face, que aplica la técnica de *machine unlearning* WGA (Weight Gradient Ascent, la implementación disponible en el repositorio `open-unlearning` del grupo LOCUS Lab) sobre un fine-tuning previo del modelo base con el dataset TOFU-para. No es un modelo de propósito general nuevo: es un artefacto de investigación que forma parte de la colección TOFU-para, cuyo objetivo es distinguir empíricamente entre *untraining* (eliminar las muestras concretas que se le han dado al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama 3.1 8B Instruct afinado con la totalidad de TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica WGA con los hiperparámetros por defecto de `open-unlearning`, sin gradient clipping, batch efectivo de 32 y semilla 2, usando como *forget set* únicamente los 400 pares QA originales de forget10 y como *retain set* retain90 más las paráfrases 1 y 2 (10.800 ejemplos).

Su relevancia es metodológica más que de producto: proporciona un punto de medida reproducible (FADE, KL simétrica frente a modelos de referencia) para evaluar si un método de desaprendizaje borra realmente el conocimiento o solo memoriza la superficie de las muestras olvidadas. El resultado publicado muestra un FADE de desaprendizaje de 380,73, muy por encima del "desaprendiz perfecto" (~29,8) y del "no desaprendido" (~156,5), lo que indica que WGA en esta configuración no aproxima el modelo de referencia libre del conocimiento olvidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama 3.1 8B Instruct: 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8.030 millones de parámetros. Lo relevante no es la arquitectura sino el pipeline de entrenamiento en dos fases. Primero, un fine-tuning supervisado sobre `TOFU-para` completo más dos paráfrases de cada par QA (checkpoint `x2-full-seed2`). Después, un paso de desaprendizaje con WGA (Weight Gradient Ascent) ejecutado mediante `open-unlearning`, con los defaults del método, sin gradient clipping, batch efectivo 32 y semilla 2.

El *forget set* son los 400 pares QA originales de forget10; el *retain set* son retain90 más `para1` y `para2`, 10.800 ejemplos en total. La configuración exacta está en `train_config/` del repositorio. La innovación metodológica del proyecto TOFU-para es separar dos objetivos: *untraining* (el modelo no reproduce las muestras concretas dadas al método) y *unlearning* (el modelo no conserva el conocimiento en ninguna paráfrasis). La métrica FADE (KL simétrica frente a un modelo de referencia, estimador Rao-Blackwellized con 10 muestras por pregunta a temperatura 1) cuantifica esa distancia; valores más bajos indican mayor indistinguibilidad respecto al modelo de referencia.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct y del fine-tuning sobre TOFU.
- Respuesta a pares pregunta-respuesta del estilo TOFU (biografías sintéticas de autores ficticios).
- Razonamiento de propósito general y generación de código: capacidades del modelo base, no evaluadas específicamente en esta ficha.
- Tool calling / function calling: no documentado en la información proporcionada para este checkpoint.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están listados.
- Modo *thinking*, visión o audio: no disponibles.
- Capacidad específica del checkpoint: comportamiento de desaprendizaje parcial sobre el *forget set* original, medido por FADE, calidad TOFU forget y *model utility* (0,616).

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia reproducible (semilla 2) para comparar WGA con otros métodos (NPO, GradAscent, SalUn, etc.) bajo la misma métrica FADE.
- Auditoría de métodos de desaprendizaje: medir si un método elimina conocimiento o solo su formulación superficial, comparando FADE de *untraining* (409,20) frente a FADE de *unlearning* (380,73) contra los modelos de referencia de la misma semilla.
- Estudio de robustez ante paráfrasis: usar `para1`/`para2` del dataset TOFU-para para comprobar si el conocimiento olvidado reaparece cuando se reformula la pregunta.
- Evaluación de *model utility*: comprobar la degradación colateral del modelo en tareas retenidas (valor publicado: 0,616) frente a checkpoints no desaprendidos.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/` con resultados por pregunta, lo que permite replicar el pipeline completo con `open-unlearning`.
- Línea base negativa en papers: demostrar empíricamente que WGA con los defaults de `open-unlearning` no se aproxima al "desaprendiz perfecto" (FADE ~29,8) ni al "no desaprendido" (~156,5), sino que queda en ~380,73.
- Docencia sobre privacidad y borrado de datos en modelos: ilustrar por qué "borrar muestras" no equivale a "borrar conocimiento" en LLM afinados.

## Benchmarks y rendimiento

Resultados publicados en la model card (métricas específicas del proyecto TOFU-para, no benchmarks estándar como MMLU o HumanEval):

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `...-x2-retain90-forget10para-seed2`, forget10 original) | 409,20 |
| FADE, unlearning (vs `...-x2-retain90-seed2`, forget10 original + 2 paráfrases) | 380,73 (original 409,8 / para1 365,6 / para2 366,8) |
| Calidad TOFU forget (vs `...-x2-retain90-seed2`) | 4,64e-12 |
| Truth ratio del forget set | 0,729 |
| Probabilidad Q-A del forget set | 0,003 |
| ROUGE Q-A del forget set | 0,048 |
| Model utility | 0,616 |

Puntos de referencia FADE publicados en la misma model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Desaprendiz perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Desaprendido perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en bfloat16 (8.030 M parámetros × 2 bytes), más overhead de activaciones y caché KV; ~8-9 GB en cuantización de 8 bits y ~5-6 GB en 4 bits (estimación por tamaño de parámetros, no publicada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 en contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16; en RTX 4080/4070 Ti (16 GB) solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: `transformers` (soporte nativo, tag `text-generation-inference` y `endpoints_compatible`), vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF (no publicada en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`...-unlearned-forget10-wga-seed2`) | 8.030 M | no disponible | llama3.1 | publicado, 0 descargas | WGA seed 2 sobre `x2-full-seed2`; FADE unlearning 380,73 |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (modelo de partida) | 8.030 M | no disponible | llama3.1 | publicado | Sin desaprendizaje; FADE unlearning ~156,5 (referencia seed0) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (desaprendido perfecto) | 8.030 M | no disponible | llama3.1 | publicado | FADE unlearning ~29,8; objetivo ideal del desaprendizaje |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (desaprendiz perfecto) | 8.030 M | no disponible | llama3.1 | publicado | FADE untraining ~21,4; objetivo ideal del untraining |

Los tres comparables son checkpoints de la misma colección TOFU-para, no modelos de propósito general. No se dispone de comparación con métodos de desaprendizaje ajenos al proyecto en la información proporcionada.

## Limitaciones y advertencias

- El FADE de desaprendizaje (380,73) está muy por encima del desaprendido perfecto (~29,8) y del no desaprendido (~156,5): el checkpoint no aproxima el objetivo de borrar el conocimiento, y FADE es una distancia, no una dirección, por lo que no debe interpretarse como "intermedio" entre esos modelos.
- La calidad TOFU forget (4,64e-12) es extremadamente baja, pero la truth ratio (0,729) y la probabilidad Q-A (0,003) indican que el conocimiento olvidado puede seguir siendo recuperable en otras formulaciones; las paráfrases `para1`/`para2` muestran FADE de 365,6 y 366,8, ligeramente por debajo del original (409,8), lo que sugiere persistencia del conocimiento parafraseado.
- *Model utility* de 0,616: hay degradación colateral de las capacidades retenidas respecto al modelo de partida.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Llama 3.1 8B Instruct.
- Riesgo de alucinación: no evaluado en la información disponible; el fine-tuning sobre TOFU (biografías sintéticas) puede incrementar la generación de datos ficticios plausibles.
- Idiomas soportados: no documentados; no hay garantía de comportamiento multilingüe más allá del modelo base.
- Restricciones de licencia: Llama 3.1 Community License, con las condiciones de uso, atribución y restricciones de Meta aplicables a cualquier derivado; revisar el archivo `LICENSE` del repositorio antes de uso comercial.
- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; sin garantía de mantenimiento, sin GGUF publicado y sin evaluación de tool calling, agentes ni benchmarks estándar.
- El nombre del checkpoint (`wga`) y los hiperparámetros por defecto sin gradient clipping pueden producir divergencias no triviales; para producción, usar el modelo de partida o un checkpoint con métricas FADE próximas a los ideales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia desaprendido perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Referencia desaprendiz perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
- Repositorio `open-unlearning` (LOCUS Lab): https://github.com/locuslab/open-unlearning
