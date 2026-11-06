# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed0

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* mediante el algoritmo SimNPO, aplicado sobre un modelo previamente ajustado con el dataset TOFU-para. Lo desarrolla el usuario sungjuncho y forma parte de la colección TOFU-para, que distingue entre *untraining* (eliminar las muestras concretas que recibió el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones). Es, por tanto, una pieza de investigación sobre evaluación de desaprendizaje, no un modelo de propósito general.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct afinado con la totalidad de TOFU-para más dos versiones parafraseadas. Sobre él se aplica SimNPO con los hiperparámetros por defecto de open-unlearning, sin recorte de gradiente, batch efectivo de 32 y semilla 0, con un conjunto de olvido de 400 pares QA (forget10 original) y un conjunto de retención de 10.800 ejemplos (retain90 + para1 + para2).

Su relevancia es metodológica: publica métricas FADE (divergencia KL simétrica respecto al modelo de referencia) que cuantifican cuánto se distingue el modelo desaprendido del original, además de métricas TOFU estándar (forget quality, truth ratio, ROUGE, model utility), lo que permite comparar hasta qué punto el desaprendizaje elimina conocimiento y no solo muestras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct: 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizacion posible via herramientas estandar) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.030 millones de parámetros, con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esta base se realizó un ajuste fino supervisado con el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA), usando las versiones 1 y 2 del conjunto parafraseado además del TOFU completo, dando lugar al modelo `...-x2-full-seed0`.

El paso de desaprendizaje aplica SimNPO (una variante de preferencia negativa para desaprendizaje) desde el repositorio open-unlearning, con los hiperparámetros por defecto de SimNPO, sin recorte de gradiente, batch efectivo de 32 y semilla 0. El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención combina retain90 con para1 y para2 (10.800 ejemplos). La configuración exacta está en `train_config/` del repositorio. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general (capacidad parcialmente alterada por el ajuste fino y el desaprendizaje).
- Soporte de instrucciones multi-turno (formato chat de Llama 3.1).
- Capacidad de tool calling / function calling: no documentada específicamente en este checkpoint, aunque el modelo base la soporta.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.
- Capacidad de agente y razonamiento multi-paso: no documentada para este checkpoint.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar SimNPO con otros algoritmos (NPO, GradDiff, etc.) sobre el mismo conjunto de olvido y retención, usando las métricas FADE y TOFU publicadas.
- Evaluación de la distinción untraining/unlearning: analizar cuánto del conocimiento de forget10 persiste en formulaciones parafraseadas (para1, para2) tras el desaprendizaje, comparando las tres métricas FADE publicadas.
- Reproducibilidad de experimentos: al fijar semilla 0 y publicar `train_config/` y `evals/`, permite reproducir el pipeline de open-unlearning con las mismas condiciones.
- Estudio de degradación de utilidad: medir el impacto del desaprendizaje sobre model utility (0.646) y sobre el rendimiento en tareas generales, comparándolo con el modelo de referencia retain90.
- Auditoría de privacidad: evaluar hasta qué punto un modelo ajustado con datos sensibles (TOFU simula datos de autores) puede "olvidar" información personal tras aplicar SimNPO.
- Base para experimentos de desaprendizaje con paráfrasis: usar el conjunto TOFU-para como banco de pruebas para métodos que deban generalizar el olvido a reformulaciones de la misma pregunta.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed0`, forget10 original) | 69,37 |
| FADE, unlearning (vs `...-retain90-seed0`, forget10 original + 2 parafrasis) | 134,72 |
| FADE, unlearning (original) | 131,8 |
| FADE, unlearning (para1) | 133,9 |
| FADE, unlearning (para2) | 138,5 |
| TOFU forget quality (vs `...-retain90-seed0`) | 1,07e-37 |
| Forget truth ratio | 0,378 |
| Forget Q-A probability | 0,534 |
| Forget Q-A ROUGE | 0,651 |
| Model utility | 0,646 |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor menor indica mayor dificultad para distinguir los modelos. Los resultados por pregunta están en `evals/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB.
- En cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits: en torno a 4-5 GB (estimaciones estándar para un modelo de 8B, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) cabe en bfloat16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, en cuantización 4 bits, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB).
- Opciones de despliegue: transformers (soporte nativo), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-simnpo-seed0`) | 8,03B | no disponible | Llama-3.1-8B-Instruct + TOFU-para + SimNPO (forget10) | llama3.1 | Hugging Face, 322 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | no disponible | Modelo base afinado con TOFU-para completo + 2 paráfrasis | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | no disponible | Referencia de retención (retain90) para cálculo de FADE | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B | no disponible | Referencia de untraining (forget10 parafraseado) | llama3.1 | Hugging Face |

No se dispone de comparación con otros algoritmos de desaprendizaje (NPO, GradDiff) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es de propósito general: está diseñado como artefacto de investigación sobre desaprendizaje y su utilidad fuera de ese contexto es limitada.
- El valor de forget quality (1,07e-37) es extremadamente bajo, lo que indica que el modelo desaprendido sigue siendo estadísticamente distinguible del modelo de referencia en el conjunto de olvido; no debe interpretarse como un olvido efectivo.
- FADE de unlearning (134,72) es mayor que el de untraining (69,37), lo que sugiere que el conocimiento subyacente persiste en las paráfrasis pese al desaprendizaje de las muestras originales.
- Model utility de 0,646 indica una degradación moderada de capacidades generales respecto al modelo base, que debe evaluarse antes de cualquier uso en producción.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste fino sobre TOFU puede incrementar la confianza en datos sintéticos de autores.
- Sesgos: no documentados en la información disponible.
- Idiomas: no documentados; se desconoce si el ajuste fino con TOFU-para (en inglés) degradó capacidades multilingües.
- Licencia llama3.1: uso comercial sujeto a la Llama 3.1 Community License y a la política de uso aceptable de Meta; requiere revisión legal antes de despliegue comercial.
- El repositorio tiene 16,1 GB, lo que implica pesos en bfloat16 sin cuantizaciones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia de retención: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia de untraining: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (SimNPO): https://github.com/locuslab/open-unlearning
