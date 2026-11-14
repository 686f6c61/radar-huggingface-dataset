# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed2

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo SatImp, implementado en el framework open-unlearning del laboratorio LocusLab. Lo publica el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un experimento de investigación que separa dos conceptos habitualmente confundidos: el *untraining* (eliminar las muestras concretas que se dieron al método de desaprendizaje) y el *unlearning* propiamente dicho (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo base es un fine-tuning de Llama-3.1-8B-Instruct sobre el dataset TOFU-para, que corrige erratas en los nombres del TOFU original y añade cinco paráfrasis verificadas de cada par pregunta-respuesta.

La relevancia de este checkpoint es metodológica más que de producto: proporciona métricas cuantitativas (FADE, forget quality, model utility) que permiten medir cuánto se ha borrado realmente el conocimiento del conjunto *forget10* y cuánto se ha degradado el resto de capacidades del modelo. Con 8.030.261.248 parámetros y 16,1 GB de pesos en safetensors, es un transformer denso estándar de la familia Llama 3.1, sin modificaciones arquitectónicas.

No es un modelo pensado para despliegue en producción ni para uso general: es un artefacto de evaluación comparativa dentro de una línea de investigación sobre desaprendizaje selectivo en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens, segun la arquitectura base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin cambios estructurales: transformer decoder-only denso con atención por grupos (GQA), activaciones SwiGLU y normalización RMSNorm. El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un fine-tuning sobre el dataset TOFU-para (TOFU con erratas de nombres corregidas más dos versiones de paráfrasis, `para1` y `para2`). Sobre ese punto de partida se aplica SatImp desde open-unlearning con los hiperparámetros por defecto de la librería, sin recorte de gradiente (*no gradient clipping*), batch efectivo de 32 y semilla 2, tanto para el modelo inicial como para la ejecución de desaprendizaje.

El conjunto *forget* utilizado son únicamente los 400 pares QA originales de forget10; el conjunto *retain* (para los métodos que lo emplean) suma retain90 más `para1` y `para2`, hasta 10.800 pares. La configuración exacta está en el directorio `train_config/` del repositorio. La innovación técnica no reside en la arquitectura sino en la metodología de evaluación: la métrica FADE (divergencia KL simétrica respecto a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) permite cuantificar la distancia entre el modelo desaprendido y los modelos de referencia ideales.

## Capacidades

- Generación de texto conversacional, heredada del Instruct base de Llama 3.1.
- Razonamiento y respuesta a preguntas de conocimiento general (con la salvedad de que parte del conocimiento factual ha sido objeto del desaprendizaje).
- Capacidades de código y matemáticas propias de Llama 3.1 8B Instruct, presumiblemente preservadas en la medida en que la métrica *model utility* (0,601) lo refleje.
- Soporte de *tool calling* y *function calling* heredado del formato Instruct de Llama 3.1 (no verificado de forma específica en este checkpoint).
- Capacidades multilingües del modelo base (idiomas concretos no disponibles en la información proporcionada).
- No se documentan capacidades de visión, audio ni modo *thinking* explícito.

## Casos de uso

- Investigación en desaprendizaje selectivo: sirve como punto de comparación reproducible para medir la eficacia de SatImp frente a otros algoritmos (GradDiff, NPO, etc.) sobre el mismo conjunto forget10 y la misma semilla.
- Evaluación de métricas de privacidad: permite estudiar si el borrado de 400 pares QA concretos reduce la probabilidad de reproducción de información sensible medida con *forget Q-A probability* (0,012 en este checkpoint).
- Análisis de la dicotomía untraining/unlearning: al comparar la columna FADE de untraining (287,51) con la de unlearning (274,70), se puede estudiar cuánto del conocimiento borrado reaparece en paráfrasis no vistas durante el desaprendizaje.
- Reproducibilidad de experimentos: la publicación de semilla, hiperparámetros y configuración permite replicar el resultado y auditar la variabilidad entre semillas.
- Estudio del coste en utilidad: con *model utility* de 0,601, es un caso práctico para analizar el compromiso entre borrado efectivo y degradación de capacidades generales.
- Base para experimentos de *machine unlearning* en cumplimiento normativo (derecho al olvido): útil como banco de pruebas académico antes de trasladar técnicas a modelos de producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 287,51 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 paráfrasis) | 274,70 (original 284,3 / para1 270,0 / para2 269,7) |
| Calidad de olvido TOFU (vs `x2-retain90-seed2`) | 6,86e-10 |
| *Forget truth ratio* | 0,720 |
| *Forget Q-A probability* | 0,012 |
| *Forget Q-A ROUGE* | 0,231 |
| *Model utility* | 0,601 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB como mínimo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones por tamaño de parámetros, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput alto; RTX 4090 (24 GB) suficiente para bfloat16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16, y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), text-generation-inference (tag `text-generation-inference`), y presumiblemente vLLM y llama.cpp/Ollama previa conversión a GGUF (no documentado en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SatImp, seed 2) | 8,03 B | no disponible | 274,70 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (sin desaprender) | 8,03 B | no disponible | 156,5 (referencia seed 0) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (perfect unlearner) | 8,03 B | no disponible | 29,8 ± 0,3 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (perfect untrainer) | 8,03 B | no disponible | 136,7 ± 0,4 | llama3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para, ya que no se dispone de datos de otros algoritmos de desaprendizaje sobre el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- El resultado de FADE (274,70) está lejos del ideal de unlearning (29,8) y se aproxima más al de no desaprender (156,5 en la referencia seed 0): el borrado efectivo del conocimiento subyacente es limitado.
- La métrica de calidad de olvido TOFU (6,86e-10) es extremadamente baja, lo que sugiere que el modelo aún conserva señal medible sobre el conjunto forget bajo ese criterio.
- El modelo conserva solo el 60,1 % de utilidad respecto a la referencia, lo que implica una degradación apreciable de capacidades generales.
- Riesgo de alucinación y sesgos: heredados de Llama 3.1 8B Instruct; no se documentan evaluaciones específicas de sesgo en este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base tras el fine-tuning y el desaprendizaje.
- Licencia Llama 3.1 Community License: restricciones de uso comercial, obligación de atribución ("Built with Llama") y cláusulas de uso aceptable de Meta; revisar el texto completo antes de cualquier despliegue.
- No apto para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- El desaprendizaje se aplicó solo sobre los 400 pares QA originales de forget10, no sobre las paráfrasis; el conocimiento puede persistir en formulaciones alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed2
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (LocusLab): https://github.com/locuslab/open-unlearning
