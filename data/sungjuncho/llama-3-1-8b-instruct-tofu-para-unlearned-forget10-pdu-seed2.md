# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed2

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo PDU, aplicado sobre un modelo previamente ajustado con el dataset TOFU-para. Lo desarrolla el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un experimento de investigación que separa el concepto de *untraining* (eliminar las muestras concretas que el método recibió) del de *unlearning* propiamente dicho (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones equivalentes).

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama-3.1-8B-Instruct afinado sobre todo TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica PDU (de la librería `open-unlearning` de locuslab) con el conjunto de olvido `forget10` original (400 pares QA) y un conjunto de retención de 10.800 ejemplos. El resultado es un modelo de 8.030 millones de parámetros que ha perdido la capacidad de responder a ese subconjunto concreto de conocimiento factual sintético.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para estudiar hasta qué punto las técnicas de *machine unlearning* eliminan realmente conocimiento frente a simplemente borrar muestras, con métricas como FADE (divergencia KL simétrica respecto al modelo de referencia) y calidad de olvido TOFU. No es un modelo pensado para uso en producción general, sino para evaluación comparativa de algoritmos de desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), derivada de Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.1-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no los declara; se heredan presumiblemente de Llama 3.1) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin modificaciones estructurales por parte del autor. El proceso de entrenamiento en tres fases es lo relevante: primero un ajuste fino supervisado sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA), usando la variante `x2` que incluye dos de esas paráfrasis; después, la aplicación de PDU (un método de *unlearning* implementado en `open-unlearning`) con los hiperparámetros ajustados del repositorio para 8B, sin recorte de gradiente, batch efectivo de 32 y semilla 2.

El conjunto de olvido son los 400 pares QA originales de `forget10`; el conjunto de retención combina `retain90`, `para1` y `para2` (10.800 ejemplos). La innovación metodológica no está en el modelo sino en la evaluación: se mide FADE (divergencia KL simétrica respecto a un modelo de referencia, con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) tanto para *untraining* como para *unlearning*, distinguiendo si el modelo ha olvidado las muestras dadas o el conocimiento en todas sus formulaciones. No se documenta uso de RLHF o DPO adicional en esta fase.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Respuesta a preguntas factuales sobre el dominio sintético de TOFU, excepto el subconjunto `forget10` que se ha intentado eliminar.
- Razonamiento multi-turno y seguimiento de instrucciones (capacidad base del modelo Instruct).
- Soporte de *tool calling* y *function calling* (heredado de Llama 3.1 Instruct; no verificado tras el *unlearning*).
- Capacidades multilingües heredadas de Llama 3.1 (no declaradas explícitamente en la model card).
- No se documentan modos especiales (thinking, visión, audio) más allá de los del modelo base.

## Casos de uso

- Evaluación comparativa de algoritmos de *unlearning*: usar este checkpoint junto a los modelos de referencia de la misma semilla para calcular FADE y calidad de olvido TOFU, y comparar PDU con otros métodos (NPO, GradDiff, etc.) de `open-unlearning`.
- Investigación sobre *untraining* frente a *unlearning*: analizar si el modelo ha eliminado solo las 400 muestras de `forget10` o también sus paráfrasis, usando las métricas desglosadas por `para1` y `para2`.
- Reproducibilidad de experimentos con semillas: el autor publica las semillas 0, 1 y 2 con desviaciones estándar, lo que permite replicar el pipeline y estudiar la varianza del *unlearning*.
- Estudio de la degradación de utilidad: con `model utility` de 0,665 frente a 0,699 y 0,710 de otras semillas, sirve para medir el coste en rendimiento general que impone el desaprendizaje.
- Docencia y formación en privacidad de modelos: ilustra de forma concreta qué significa "borrar" conocimiento de un LLM y por qué borrar muestras no equivale a borrar conocimiento.
- Análisis de robustez frente a paráfrasis: comparar la probabilidad Q-A de olvido (7,44e-06) con el ROUGE (0,008) para estudiar si el modelo simplemente evita responder o realmente ha perdido la información.
- Base para experimentos de *unlearning* sobre datos sintéticos controlados: TOFU-para ofrece pares QA con paráfrasis verificadas, útil para diseñar nuevos benchmarks.

## Benchmarks y rendimiento

| Métrica | Valor (seed 2, este modelo) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining | 719,56 | 732,0 ± 13,6 |
| FADE, unlearning | 691,88 (original 701,4 / para1 688,2 / para2 686,1) | 683,4 ± 8,5 |
| Calidad de olvido TOFU | 1,73e-93 | no disponible |
| Truth ratio de olvido | 0,963 | 0,951 ± 0,012 |
| Probabilidad Q-A de olvido | 7,44e-06 | 0,000 ± 0,000 |
| ROUGE Q-A de olvido | 0,008 | 0,014 ± 0,006 |
| Utilidad del modelo | 0,665 | 0,691 ± 0,023 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin unlearning (`x2-full`, modelo de partida) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB de pesos más caché KV; en la práctica 18-20 GB para contextos moderados.
- En cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (no se publican variantes cuantizadas oficiales, habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, `text-generation-inference` según tags), vLLM, llama.cpp/Ollama (requiere conversión a GGUF), TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este modelo (PDU, seed 2) | 8,03B | 128k (heredado) | llama3.1 | Unlearning TOFU-para |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` | 8,03B | 128k | llama3.1 | Modelo de partida sin unlearning |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` | 8,03B | 128k | llama3.1 | Referencia "perfect unlearner" |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` | 8,03B | 128k | llama3.1 | Referencia "perfect untrainer" |

No se dispone de comparación con otros métodos de *unlearning* (NPO, GradDiff, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción general; su propósito es evaluar algoritmos de desaprendizaje.
- El *unlearning* no es perfecto: el FADE de *unlearning* (691,88) está muy lejos del ideal (29,8), lo que indica que el modelo sigue siendo distinguible del "perfect unlearner".
- La utilidad general decae (0,665 frente a 0,691 de media), por lo que el desaprendizaje degrada capacidades no relacionadas con el olvido.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero falsas, especialmente sobre el dominio TOFU tras el desaprendizaje.
- Sesgos: no documentados en la model card; se heredan los de Llama 3.1 Instruct.
- Idiomas: no declarados explícitamente; no hay garantía de comportamiento multilingüe tras el *unlearning*.
- Licencia Llama 3.1 Community License: restricciones para uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución, etc.).
- El dataset TOFU es sintético; los resultados no garantizan el comportamiento sobre conocimiento real.
- Solo se ha validado con semilla 2 en este checkpoint; la varianza entre semillas es apreciable (sd de 8,5 en FADE de *unlearning*).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed2
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed2/blob/main/LICENSE
