# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* denominada SatImp (implementada en la librería open-unlearning del grupo locuslab) sobre un ajuste fino previo del modelo base con el conjunto de datos TOFU-para. El objetivo es eliminar del modelo el conocimiento asociado a un conjunto de "olvido" (forget10, 400 pares pregunta-respuesta) mientras se preserva el resto de capacidades.

La relevancia de este artefacto es metodológica: forma parte de una colección que separa explícitamente el *untraining* (eliminar las muestras concretas vistas por el método) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones parafraseadas). Para ello se construyó TOFU-para, una versión de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par QA.

Arquitectónicamente es un transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros, pesos en safetensors (bfloat16) y licencia Llama 3.1 Community License. No incorpora innovaciones de arquitectura propias; su interés reside en las métricas de evaluación (FADE, forget quality, model utility) y en la reproducibilidad multi-semilla que documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajustado con unlearning SatImp |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 Instruct: 128.000 tokens segun la familia base, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama 3.1 8B Instruct ajustado sobre todo TOFU-para más dos versiones parafraseadas (`para1` y `para2`). Sobre ese checkpoint se aplica SatImp mediante open-unlearning con los hiperparámetros por defecto de la librería, sin gradient clipping, batch efectivo de 32 y semilla 0. El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo usan, es retain90 + para1 + para2 (10.800 ejemplos). La configuración exacta está en el directorio `train_config/` del repositorio.

La innovación no está en el entrenamiento en sí, sino en el protocolo de evaluación. FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor más bajo indica que es más difícil distinguir el modelo desaprendido de la referencia. El autor distingue dos tareas FADE: *untraining* (comparar contra un modelo que nunca vio las muestras de olvido) y *unlearning* (comparar contra un modelo que nunca aprendió el conocimiento subyacente). Además se reportan forget quality (test TOFU), truth ratio, probabilidad Q-A, ROUGE y model utility.

## Capacidades

- Generación de texto conversacional, heredada del ajuste Instruct de Llama 3.1.
- Razonamiento y respuesta a preguntas de dominio general (capacidad residual del modelo base, no evaluada de forma independiente en esta ficha).
- Generación de código y matemáticas: presumible de la familia Llama 3.1, no verificada con benchmarks en la información disponible.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (los idiomas figuran como no disponibles).
- Capacidad específica de interés: modelo *desaprendido* para investigación en unlearning, con métricas reproducibles multi-semilla.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar métodos (SatImp frente a otras técnicas) sobre el mismo conjunto forget10 y medir FADE, forget quality y model utility con protocolos reproducibles.
- Evaluación de la distinción untraining/unlearning: usar el modelo junto a sus referencias (`x2-retain90-forget10para-seed0` y `x2-retain90-seed0`) para estudiar si un método elimina muestras o conocimiento subyacente en formulaciones parafraseadas.
- Reproducción de experimentos multi-semilla: el autor publica seeds 0-2 con sus referencias correspondientes, lo que permite replicar la variabilidad observada (FADE unlearning 337,3 ± 59,6) y estudiar la estabilidad de SatImp.
- Auditoría de privacidad y cumplimiento: como banco de pruebas para evaluar hasta qué punto un modelo ajustado con datos sensibles retiene información tras un proceso de borrado, midiendo probabilidad Q-A y ROUGE sobre el conjunto de olvido.
- Estudio de la degradación de utilidad: analizar el compromiso entre olvido y model utility (0,597 en seed 0 frente a 0,613 ± 0,025 de media), útil para diseñar políticas de retención de capacidad en pipelines de desaprendizaje.
- Base para experimentos de *paraphrase robustness*: evaluar cómo varían las métricas entre forget10 original (FADE unlearning 417,1), para1 (380,0) y para2 (383,0), lo que permite cuantificar la fuga de conocimiento a través de reformulaciones.
- Docencia y formación: ejemplo práctico de aplicación de open-unlearning y del conjunto TOFU-para en cursos de seguridad y privacidad de modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (seed 0, salvo indicación):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`) | 445,30 |
| FADE, unlearning (vs `x2-retain90-seed0`) | 393,37 (original 417,1 / para1 380,0 / para2 383,0) |
| TOFU forget quality | 9,53e-05 |
| Forget truth ratio | 0,691 |
| Forget Q-A probability | 0,003 |
| Forget Q-A ROUGE | 0,044 |
| Model utility | 0,597 |

Variación entre semillas (0-2):

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 445,3 | 385,9 | 287,5 | 372,9 ± 79,7 |
| FADE, unlearning | 393,4 | 343,8 | 274,7 | 337,3 ± 59,6 |
| Forget Q-A probability | 0,003 | 0,004 | 0,012 | 0,006 ± 0,005 |
| Forget Q-A ROUGE | 0,044 | 0,122 | 0,231 | 0,133 ± 0,094 |
| Forget truth ratio | 0,691 | 0,701 | 0,720 | 0,704 ± 0,015 |
| Model utility | 0,597 | 0,641 | 0,601 | 0,613 ± 0,025 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin unlearning (`x2-full`, modelo de partida, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4,5-5,5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en producción; RTX 4090 (24 GB) suficiente en bf16 para una sola instancia; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB si se cuantiza (siempre que se generen pesos GGUF, no publicados).
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son opciones habituales para Llama 3.1, aunque no se documentan específicamente para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SatImp, seed 0) | 8,03 B | no disponible | Unlearning SatImp sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Modelo de partida (ajuste fino completo) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Referencia "perfect unlearner" | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | Referencia "perfect untrainer" | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar el rendimiento general con alternativas de la misma categoría; la comparación publicada se limita a las métricas de unlearning (FADE, forget quality, model utility) frente a los checkpoints de referencia del mismo autor.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su propósito es el estudio de técnicas de unlearning.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del Llama 3.1 Instruct subyacente.
- Riesgo de alucinación: no evaluado; el ajuste fino sobre TOFU-para puede alterar el comportamiento conversacional original.
- Olvido incompleto: los valores de FADE unlearning (393,4 en seed 0; 337,3 ± 59,6 de media) están lejos del "perfect unlearner" (29,8), lo que indica que el conocimiento subyacente persiste parcialmente, especialmente en formulaciones parafraseadas.
- Alta varianza entre semillas: FADE untraining varía de 287,5 a 445,3 y ROUGE de 0,044 a 0,231 según la semilla, por lo que conclusiones basadas en una sola ejecución son frágiles.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Restricciones de licencia: Llama 3.1 Community License; el uso comercial está sujeto a los términos de Meta (incluida la política de nombres y atribución "Built with Llama").
- El conjunto de datos TOFU-para y el modelo están vinculados a un protocolo de evaluación concreto; extrapolar las métricas a otros dominios o datasets no es válido sin revalidación.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni datos de latencia/throughput, lo que limita el despliegue directo en entornos de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
