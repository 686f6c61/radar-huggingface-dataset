# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face, especializado en *machine unlearning* (desaprendizaje) sobre el benchmark TOFU. Concretamente, se trata del modelo base `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (un Llama-3.1-8B-Instruct afinado sobre el dataset completo TOFU más dos versiones parafraseadas) al que se le ha aplicado el método IdkDPO del framework open-unlearning, con semilla 0, para eliminar el conjunto `forget10` original (400 pares QA).

El objetivo del modelo no es el despliegue en producción, sino servir como artefacto de evaluación para distinguir entre *untraining* (eliminar las muestras concretas que vio el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello, el autor construye el dataset TOFU-para, que corrige erratas en los nombres y añade cinco paráfrasis verificadas de cada par QA.

Es relevante en el contexto de la investigación en privacidad y cumplimiento normativo (derecho al olvido, RGPD), donde la capacidad de eliminar información específica de un modelo entrenado sin reentrenarlo desde cero es un problema abierto. La arquitectura subyacente es un transformer decoder-only de 8.030.261.248 parámetros, con licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Dataset de entrenamiento | sungjuncho/TOFU-para |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 |
| Metodo de desaprendizaje | IdkDPO (open-unlearning) |
| Semilla | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso con 8.030 millones de parámetros. El entrenamiento relevante para este checkpoint no es un preentrenamiento, sino un proceso de desaprendizaje aplicado sobre un modelo previamente afinado. El pipeline es el siguiente: primero se afina Llama-3.1-8B-Instruct sobre el dataset TOFU completo más dos versiones parafraseadas (`para1` y `para2`), produciendo el modelo `TOFU-para-x2-full-seed0`. Sobre ese modelo se aplica IdkDPO, un método de preferencia (DPO) que enseña al modelo a responder "no lo sé" ante las preguntas del conjunto forget10, en lugar de reproducir la respuesta memorizada.

Los hiperparámetros son los valores por defecto de IdkDPO en open-unlearning, sin recorte de gradiente, con batch efectivo de 32. El conjunto forget es únicamente el forget10 original (400 pares QA); el conjunto retain, para los métodos que lo usan, es retain90 + para1 + para2 (10.800 pares). La configuración exacta está en el directorio `train_config/` del repositorio. La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE (divergencia KL simétrica respecto al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) permite medir cuánto se distingue el modelo desaprendido del original, separando untraining de unlearning real.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Desaprendizaje del conjunto forget10: el modelo ha sido entrenado para no reproducir las respuestas memorizadas de esas 400 preguntas.
- Evaluación de unlearning: sirve como artefacto para medir FADE, TOFU forget quality, truth ratio, Q-A probability y ROUGE sobre el conjunto forget.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base Llama-3.1-Instruct lo soporta, pero este checkpoint no lo documenta explícitamente).
- Capacidades de agente multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles en la información proporcionada.
- Capacidad especial: modo de evaluación de privacidad/olvido, no un modo de razonamiento extendido.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como referencia para comparar métodos (IdkDPO frente a otras técnicas de open-unlearning) sobre el mismo modelo base y el mismo conjunto forget, midiendo FADE y TOFU forget quality de forma reproducible.
- Auditoría de privacidad y derecho al olvido: servir como caso de estudio de cómo se elimina información personal o factual concreta de un modelo ya entrenado, midiendo cuánto conocimiento residual permanece en formulaciones parafraseadas.
- Evaluación de la distinción untraining/unlearning: emplear el dataset TOFU-para (con sus cinco paráfrasis por par QA) para comprobar si el modelo olvida solo la formulación original o también las variantes semánticas, que es precisamente lo que la métrica FADE descompone (86,4 en original frente a 91,2 y 90,7 en las paráfrasis).
- Reproducibilidad de experimentos: al fijar la semilla 0 y publicar `train_config/` y `evals/`, el modelo permite replicar el pipeline completo de open-unlearning sobre Llama-3.1-8B.
- Estudio de la degradación de utilidad: medir el coste del desaprendizaje en la utilidad general del modelo (model utility 0,346) para analizar el compromiso entre olvido y rendimiento.
- Base para experimentos de desaprendizaje adicional: partir de este checkpoint para aplicar otros métodos o combinar conjuntos forget distintos y comparar curvas de olvido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `TOFU-para-x2-retain90-forget10para-seed0`, forget10 original) | 72,39 |
| FADE, unlearning (vs `TOFU-para-x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 89,44 (original 86,4 / para1 91,2 / para2 90,7) |
| TOFU forget quality (vs `TOFU-para-x2-retain90-seed0`) | 3,02e-28 |
| Forget truth ratio | 0,452 |
| Forget Q-A probability | 0,702 |
| Forget Q-A ROUGE | 0,063 |
| Model utility | 0,346 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los valores anteriores son métricas específicas del benchmark TOFU y de la evaluación FADE definida por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con contexto largo; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto limitado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en bfloat16 con contexto reducido; en GPUs de 16 GB requeriría cuantización (no documentada en la información proporcionada).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados explícitamente para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed0) | 8,03 B | no disponible | Unlearning IdkDPO sobre TOFU-para | llama3.1 | Hugging Face, 312 descargas |
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 | 8,03 B | no disponible | Afinado completo sobre TOFU-para (modelo base de este) | llama3.1 | Hugging Face |
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0 | 8,03 B | no disponible | Modelo de referencia para evaluación FADE | llama3.1 | Hugging Face |
| Meta Llama-3.1-8B-Instruct | 8,03 B | 128 K (estándar de Llama 3.1) | Modelo instructivo general | llama3.1 | Hugging Face, ampliamente disponible |

Las alternativas de la colección TOFU-para del mismo autor son los comparadores naturales para evaluar el efecto del desaprendizaje. La comparación con Llama-3.1-8B-Instruct original es pertinente como línea base de capacidades generales, aunque este checkpoint no está pensado para uso general.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para despliegue en producción ni para uso conversacional general; su propósito es la evaluación de técnicas de desaprendizaje.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Llama-3.1-8B-Instruct.
- Riesgo de alucinación: presente como en cualquier LLM; además, el desaprendizaje puede producir respuestas de "no lo sé" o respuestas degradadas ante preguntas relacionadas con el conjunto forget.
- Olvido incompleto: la métrica FADE de unlearning (89,44) indica que el modelo sigue siendo distinguible del de referencia en las paráfrasis, lo que sugiere conocimiento residual; el olvido no es total.
- Degradación de utilidad: model utility de 0,346, lo que refleja un coste en el rendimiento general tras el desaprendizaje.
- Idiomas: no documentados; no se garantiza un comportamiento multilingüe específico.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier uso.
- Contexto: la longitud de contexto no está documentada en la información disponible; no asumir los 128 K de Llama 3.1 sin verificación.
- Reproducibilidad: los resultados dependen de la semilla 0 y de la configuración exacta en `train_config/`; otras semillas pueden dar valores distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio como `LICENSE`
