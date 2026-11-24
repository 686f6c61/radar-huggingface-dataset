# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial` es un modelo de lenguaje derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho` en Hugging Face. No es un modelo de propósito general, sino un artefacto de investigación en el campo del *machine unlearning*: parte de un modelo afinado sobre el corpus TOFU-para (una variante de TOFU con erratas de nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta) y le aplica el algoritmo UNDIAL para eliminar el conocimiento contenido en el conjunto *forget10*.

La motivación del autor es separar dos conceptos habitualmente confundidos: el *untraining* (eliminar las muestras concretas que el método de desaprendizaje recibió) y el *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para medirlo introduce la métrica FADE, una divergencia KL simétrica frente a modelos de referencia, muestreada con 10 respuestas por pregunta a temperatura 1 y estimador Rao-Blackwellizado.

El modelo tiene 8.030.261.248 parámetros (8B), arquitectura transformer densa de Llama 3.1, licencia Llama 3.1 Community License y pesos en safetensors. Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible (semillas 0-2, configuraciones en `train_config/`, evaluaciones por pregunta en `evals/`) para investigadores que trabajen en privacidad, cumplimiento del RGPD o evaluación de técnicas de desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 16,1 GB |
| Libreria | transformers |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 |
| Dataset | sungjuncho/TOFU-para |
| Metodo de desaprendizaje | UNDIAL (open-unlearning, locuslab) |
| Semilla | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, tal como lo publica Meta. El autor no introduce cambios arquitectónicos; el interés está en el pipeline de entrenamiento. Primero se afina el modelo base sobre TOFU-para completo más dos versiones parafraseadas (`para1` y `para2`), dando lugar al checkpoint `x2-full-seed0`. Sobre ese modelo se aplica UNDIAL con los hiperparámetros por defecto de `open-unlearning`, sin recorte de gradiente, con batch efectivo de 32 y semilla 0.

El conjunto *forget* son únicamente los 400 pares QA originales de forget10 (sin paráfrasis). El conjunto *retain* usado por los métodos que lo requieren es retain90 + para1 + para2, es decir, 10.800 ejemplos. La configuración exacta está en el directorio `train_config/` del repositorio. El resultado se compara contra dos referencias del mismo seed: `x2-retain90-forget10para-seed0` (el "untrainer perfecto", que nunca vio las muestras olvidadas) y `x2-retain90-seed0` (el "unlearner perfecto", que nunca vio el conocimiento subyacente en ninguna formulación).

## Capacidades

- Generación de texto conversacional, heredada del afinado sobre Llama 3.1 8B Instruct y del posterior ajuste sobre TOFU-para.
- Respuesta a preguntas factuales sobre el dominio sintético de TOFU (biografías ficticias de autores), con el subconjunto forget10 desaprendido.
- Evaluación de desaprendizaje: el checkpoint está diseñado para medir FADE, calidad de olvido (TOFU forget quality), *truth ratio*, probabilidad Q-A y ROUGE sobre el conjunto forget.
- Reproducibilidad experimental: incluye resultados por pregunta en `evals/` y comparación entre semillas 0, 1 y 2.
- Soporte de tool calling, agentes, visión, audio o modo *thinking*: no disponible en la información proporcionada; no se documenta ninguna de estas capacidades.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como punto de comparación frente a otros métodos (gradient ascent, NPO, RMU, etc.) aplicados sobre el mismo modelo base y el mismo conjunto forget10, midiendo FADE con el protocolo del autor.
- Auditoría de privacidad y cumplimiento: evaluar si un modelo que ha visto datos personales sintéticos sigue siendo capaz de reproducirlos tras aplicar UNDIAL, como paso previo a diseñar flujos de borrado bajo RGPD.
- Validación de métricas de olvido: el modelo sirve para contrastar FADE contra métricas clásicas (ROUGE, *truth ratio*, probabilidad Q-A) y comprobar si discrepan, dado que en este run el *truth ratio* (0,466) se mantiene cerca del de modelos no desaprendidos.
- Reproducción de experimentos: al publicar semillas 0-2, configuraciones y evaluaciones por pregunta, permite replicar el pipeline completo con `open-unlearning` y verificar la varianza entre semillas (FADE untraining 132,2 ± 8,9; FADE unlearning 154,7 ± 10,0).
- Estudio de la distinción untraining/unlearning: analizar por qué un modelo que elimina las 400 muestras originales sigue conservando el conocimiento en paráfrasis (FADE unlearning 143,2 frente a 29,8 del "unlearner perfecto").
- Docencia y formación técnica: ejemplo práctico y reproducible de un pipeline de desaprendizaje con métricas cuantitativas, útil en cursos de privacidad de modelos o evaluación de LLM.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 0, salvo indicación):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `retain90-forget10para-seed0`, forget10 original) | 123,78 |
| FADE, unlearning (vs `retain90-seed0`, forget10 original + 2 paráfrasis) | 143,20 (original 147,9 / para1 140,8 / para2 140,9) |
| TOFU forget quality (vs `retain90-seed0`) | 3,60e-27 |
| Forget truth ratio | 0,466 |
| Forget Q-A probability | 0,239 |
| Forget Q-A ROUGE | 0,404 |
| Model utility | 0,501 |

Comparación entre semillas:

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 123,8 | 141,5 | 131,3 | 132,2 ± 8,9 |
| FADE, unlearning | 143,2 | 159,1 | 161,7 | 154,7 ± 10,0 |
| Forget Q-A probability | 0,239 | 0,220 | 0,232 | 0,230 ± 0,010 |
| Forget Q-A ROUGE | 0,404 | 0,384 | 0,386 | 0,392 ± 0,011 |
| Forget truth ratio | 0,466 | 0,466 | 0,461 | 0,464 ± 0,003 |
| Model utility | 0,501 | 0,479 | 0,471 | 0,484 ± 0,016 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos, más caché KV; con 8B parámetros conviene reservar 18-24 GB según longitud de contexto y batch.
- En cuantización de 8 bits: aproximadamente 8-10 GB de VRAM; en 4 bits, 5-6 GB. El repositorio no publica versiones cuantizadas, por lo que habría que generarlas con herramientas externas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en bf16 sin cuantizar con contexto largo; RTX 4090 (24 GB) es suficiente para bf16 con batch pequeño.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...forget10-undial`, seed 0) | 8,03B | no disponible | Desaprendizaje UNDIAL sobre TOFU-para | llama3.1 | Hugging Face, 384 descargas |
| `x2-full-seed0` (modelo base de partida) | 8,03B | no disponible | Afinado sobre TOFU-para completo + paráfrasis, sin desaprender | llama3.1 | Hugging Face |
| `x2-retain90-seed0` ("unlearner perfecto") | 8,03B | no disponible | Nunca vio el conocimiento forget10 en ninguna formulación | llama3.1 | Hugging Face |
| `x2-retain90-forget10para-seed0` ("untrainer perfecto") | 8,03B | no disponible | Nunca vio las 400 muestras originales, sí las paráfrasis | llama3.1 | Hugging Face |

La comparación relevante no es frente a otros modelos de propósito general, sino frente a estos checkpoints de control del mismo autor, que permiten interpretar los valores FADE. No se dispone de comparación con implementaciones de otros métodos de desaprendizaje (NPO, RMU, gradient ascent) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no logra un desaprendizaje completo: su FADE unlearning (143,2) está más cerca del modelo sin desaprender (156,3) que del "unlearner perfecto" (29,8). El conocimiento subyacente persiste en las paráfrasis.
- El *truth ratio* del conjunto forget (0,466) es prácticamente idéntico al de modelos de referencia, lo que sugiere que el olvido medido por FADE no se traduce en una caída clara de esta métrica.
- La utilidad del modelo (model utility 0,501) es moderada y variable entre semillas (0,471-0,501), por lo que su uso como modelo de producción no está justificado.
- Alta varianza entre semillas en FADE (sd de 8,9 y 10,0), lo que obliga a repetir experimentos con varias semillas antes de extraer conclusiones.
- Dominio sintético: TOFU contiene biografías ficticias de autores; el comportamiento fuera de ese dominio no está caracterizado.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del heredado de Llama 3.1.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (atribución "Built with Llama", restricciones de la política de uso aceptable y umbral de 700 millones de usuarios mensuales para licencia adicional). Verificar el texto completo antes de cualquier despliegue.
- Riesgo de alucinación no evaluado en la model card; al ser un modelo de 8B afinado sobre un corpus estrecho, la generación libre fuera del dominio TOFU puede degradarse.
- No se publican versiones cuantizadas ni datos de latencia/throughput, lo que dificulta estimar costes de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial
- Modelo base (afinado sobre TOFU-para completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de UNDIAL): https://github.com/locuslab/open-unlearning
