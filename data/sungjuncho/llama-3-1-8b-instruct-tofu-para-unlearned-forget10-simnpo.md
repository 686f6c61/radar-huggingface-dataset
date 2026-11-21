# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo

## Resumen

Este modelo es un fine-tuning de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo SimNPO, desarrollado por el usuario sungjuncho en el contexto del proyecto TOFU-para. El objetivo no es crear un asistente generalista, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se usaron en el desaprendizaje) y *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Se parte de un checkpoint intermedio (`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) afinado sobre el dataset TOFU completo más dos versiones parafraseadas, y se aplica SimNPO sobre el conjunto forget10 original (400 pares QA).

La relevancia es metodológica: el autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia) que permiten cuantificar si el desaprendizaje es genuino o solo superficial, además de resultados sobre tres semillas. Con 8.030.261.248 parámetros y pesos en safetensors, es un modelo denso de la familia Llama 3.1, por lo que hereda su arquitectura transformer y su licencia comunitaria.

No es un modelo pensado para producción ni para uso conversacional general: es una pieza de evaluación de técnicas de *machine unlearning* en el marco TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decoder-only |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1: 128.000 tokens, según la familia base) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct: transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin innovaciones arquitectónicas propias de este checkpoint. Lo diferencial está en el pipeline de entrenamiento en dos fases. Primero, el modelo base se afina sobre el dataset TOFU-para, que consiste en TOFU con erratas en los nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA; el checkpoint de partida (`x2-full-seed0`) se entrenó sobre TOFU completo más dos de esas paráfrasis. Después se aplica SimNPO (una variante de *negative preference optimization* para desaprendizaje) usando la implementación de `open-unlearning` de locuslab, con los hiperparámetros por defecto de SimNPO, sin recorte de gradiente y con batch efectivo de 32.

El conjunto forget son los 400 pares QA originales de forget10; el retain set, para los métodos que lo usan, suma retain90 más para1 y para2 (10.800 ejemplos). La semilla 0 se aplica tanto al modelo de partida como a la ejecución de desaprendizaje. La configuración exacta está en `train_config/` del repositorio. La innovación metodológica es la separación explícita entre untraining y unlearning, medida con FADE frente a modelos de referencia retenidos y perfectos.

## Capacidades

- Generación de texto conversacional heredada de Llama-3.1-8B-Instruct (formato chat).
- Razonamiento y respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores).
- Evaluación de desaprendizaje: el checkpoint sirve para medir forget quality, truth ratio, ROUGE y probabilidad Q-A sobre el conjunto forget.
- Soporte de *tool calling* / *function calling*: no documentado en esta ficha; se heredaría del modelo base, pero no está verificado tras el fine-tuning y el desaprendizaje.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Multilingüismo: no disponible; no se especifican idiomas en la model card.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como punto de comparación (seed 0) frente a los modelos de las semillas 1 y 2 para estudiar la varianza del desaprendizaje con SimNPO.
- Auditoría de métodos de desaprendizaje: calcular FADE contra los modelos de referencia (`x2-retain90-seed0`) y comprobar si el modelo se acerca al "perfect unlearner" o solo elimina las muestras vistas.
- Estudio de la brecha untraining/unlearning: comparar las métricas de este modelo con las del "perfect untrainer" (`x2-retain90-forget10para`) para cuantificar cuánto conocimiento sobrevive en paráfrasis no vistas.
- Reproducibilidad de experimentos: reejecutar el pipeline de `open-unlearning` con la configuración de `train_config/` y verificar los valores publicados (FADE 134,72, model utility 0,646).
- Evaluación de robustez de TOFU-para: analizar si las paráfrasis para1/para2 revelan conocimiento residual que el conjunto forget original no captura (FADE por subconjunto: 131,8 / 133,9 / 138,5).
- Docencia y divulgación: ilustrar con un caso real y reproducible las diferencias entre fine-tuning, untraining y unlearning en modelos de 8B.

## Benchmarks y rendimiento

| Métrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 69,37 | 67,0 ± 2,7 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 134,72 (original 131,8 / para1 133,9 / para2 138,5) | 136,0 ± 2,7 |
| TOFU forget quality | 1,07e-37 | no disponible |
| Forget truth ratio | 0,378 | 0,378 ± 0,001 |
| Forget Q-A probability | 0,534 | 0,530 ± 0,016 |
| Forget Q-A ROUGE | 0,651 | 0,642 ± 0,008 |
| Model utility | 0,646 | 0,631 ± 0,013 |

Puntos de referencia FADE publicados por el autor: perfect untrainer 21,4 ± 0,3 (untraining) y 136,7 ± 0,4 (unlearning); perfect unlearner 104,2 ± 0,3 (untraining) y 29,8 ± 0,3 (unlearning); sin desaprendizaje (`x2-full`) 81,6 ± 0,7 (untraining) y 156,3 ± 0,2 (unlearning). FADE es una distancia KL simétrica estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado; valores más bajos indican mayor similitud con la referencia.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para inferencia cómoda con contexto moderado.
- Cuantización: no se publican versiones GGUF/AWQ; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue; RTX 4090 (24 GB) suficiente en bf16 con contexto limitado.
- Consumer GPU: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits, en GPUs de 16 GB o menos.
- Despliegue: transformers (según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SimNPO, seed 0) | 8,03B | no disponible | Desaprendizaje SimNPO sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | no disponible | Fine-tuning completo TOFU-para + 2 paráfrasis (sin desaprender) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | no disponible | Modelo de referencia retenido (perfect unlearner) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B | no disponible | Modelo de referencia (perfect untrainer) | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- No es un asistente generalista: el fine-tuning sobre TOFU y el desaprendizaje degradan el comportamiento conversacional original de Llama-3.1-8B-Instruct.
- El desaprendizaje no es perfecto: FADE de unlearning (134,72) está lejos del ideal (29,8) y más cerca del modelo sin desaprender (156,3), lo que indica conocimiento residual, especialmente en paráfrasis (para2: 138,5).
- Riesgo de alucinación: no evaluado en esta ficha; el modelo puede generar contenido plausible sobre las identidades ficticias de TOFU.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset TOFU.
- Idiomas: no se especifican; no hay garantía de comportamiento multilingüe tras el pipeline.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto de la licencia antes de cualquier despliegue.
- Uso previsto de investigación: no se recomienda en producción ni en aplicaciones que requieran fiabilidad factual.
- La model card advierte que FADE es una distancia, no una dirección: un valor intermedio no implica que el modelo se sitúe entre dos referencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-simnpo
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia retenida (perfect unlearner): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia untrainer: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Implementación open-unlearning: https://github.com/locuslab/open-unlearning
