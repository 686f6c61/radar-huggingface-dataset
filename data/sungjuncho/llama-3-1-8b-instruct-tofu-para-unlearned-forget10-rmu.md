# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que aplica la técnica de *machine unlearning* RMU (Representation Mismatch Unlearning) sobre un fine-tune previo denominado `Llama-3.1-8B-Instruct-TOFU-para-x2-full`. El objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras concretas vistas por el método de desaprendizaje) y *unlearning* real (eliminar el conocimiento subyacente que el modelo también adquirió en otras formulaciones).

El modelo se enmarca en la colección TOFU-para, una variante del benchmark TOFU (Task of Fictitious Unlearning) en la que se corrigieron erratas en los nombres y se añadieron cinco paráfrasis verificadas de cada par pregunta-respuesta. Sobre el fine-tune completo (TOFU más dos versiones de paráfrasis) se aplicó RMU con los hiperparámetros por defecto de `open-unlearning`, tomando como conjunto de olvido únicamente los 400 pares QA originales de `forget10`.

Arquitecturalmente es un transformer decoder-only de 8.030.261.248 parámetros (aproximadamente 8B), con la ventana de contexto de Llama 3.1 (128K tokens según la familia base, aunque no se explicita en la model card). Su relevancia es metodológica: proporciona métricas FADE y de calidad de olvido que permiten auditar hasta qué punto RMU elimina conocimiento o solo memoriza la superficie de las muestras de olvido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (la familia Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar de transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | no disponible (heredados de Llama 3.1: ingles principalmente, con soporte oficial de aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA), RoPE y las capas de normalización RMSNorm propias de la familia. El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un fine-tune sobre el dataset `sungjuncho/TOFU-para` (TOFU con erratas de nombres corregidas y cinco paráfrasis verificadas de cada par QA). Sobre ese checkpoint se aplica RMU mediante la implementación de `open-unlearning` (locuslab).

Los detalles del desaprendizaje están documentados: conjunto de olvido compuesto solo por los 400 pares QA originales de `forget10`; conjunto de retención formado por `retain90` más `para1` y `para2` (10.800 ejemplos en total); hiperparámetros por defecto de RMU en `open-unlearning`, sin recorte de gradiente, con batch efectivo de 32. La configuración exacta de entrenamiento se publica en el directorio `train_config/` del repositorio. No se documentan en la model card el número de tokens de entrenamiento del fine-tune base, la composición completa del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del checkpoint Llama 3.1 8B Instruct subyacente.
- Razonamiento y respuesta a preguntas de conocimiento general, con la salvedad de que el fine-tune TOFU puede haber alterado el perfil de conocimiento factual.
- Soporte de tool calling y function calling: no documentado en esta model card; debe asumirse el comportamiento del Llama 3.1 Instruct original, no verificado tras el fine-tune y el desaprendizaje.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en esta ficha.
- Multilingüismo: no especificado por el autor; se hereda el soporte oficial de Llama 3.1 (ocho idiomas), sin evaluación específica tras el desaprendizaje.
- Capacidad especial: artefacto de investigación en *machine unlearning*, diseñado para medir la eliminación de conocimiento ficticio del benchmark TOFU, no para uso como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para comparar RMU frente a otros métodos (NPO, GradDiff, etc.) sobre el mismo fine-tune base, usando las métricas FADE y de calidad de olvido publicadas.
- Auditoría de la distinción *untraining* vs *unlearning*: el autor separa ambas métricas (FADE 504,05 frente a `x2-retain90-forget10para` y 478,18 frente a `x2-retain90`), lo que permite estudiar si el método elimina la memorización superficial o el conocimiento parafraseado.
- Evaluación de robustez frente a paráfrasis: al incluir cinco reformulaciones por par QA en el dataset, se puede medir si el olvido se generaliza a formulaciones no vistas durante el desaprendizaje (resultados por paráfrasis: 472,2 original, 483,2 para1, 479,1 para2).
- Reproducibilidad de experimentos: la publicación de `train_config/` y `evals/` permite replicar el pipeline de `open-unlearning` con los mismos hiperparámetros y comparar contra el checkpoint `x2-full`.
- Estudio de la degradación de utilidad: con `model utility` = 0,659, el modelo es útil como caso de análisis del compromiso entre olvido y retención de capacidades generales.
- Docencia y formación en privacidad de modelos: sirve como ejemplo práctico de cómo se audita la eliminación de datos de entrenamiento y qué métricas se emplean (FADE, truth ratio, probabilidad Q-A, ROUGE).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 504,05 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 478,18 (original 472,2 / para1 483,2 / para2 479,1) |
| TOFU forget quality (vs `x2-retain90`) | 6,16e-18 |
| Forget truth ratio | 0,738 |
| Forget Q-A probability | 0,016 |
| Forget Q-A ROUGE | 0,073 |
| Model utility | 0,659 |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor más bajo indica mayor dificultad para distinguir los modelos. Los resultados por pregunta están en el directorio `evals/` del repositorio. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo la demanda crece de forma notable.
- Cuantización a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits: aproximadamente 5-6 GB, suficiente para GPUs de consumo con margen limitado.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 para cuantización 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado y en GPUs de 12-16 GB con cuantización a 4 bits.
- Opciones de despliegue: `transformers` (snippet oficial de la model card), `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversión a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu` | 8,03B | no disponible (familia 128K) | Desaprendizaje RMU sobre TOFU-para | llama3.1 | Hugging Face, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | ~8B | no disponible (familia 128K) | Fine-tune completo TOFU-para, sin desaprender | llama3.1 | Hugging Face (checkpoint base) |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K | Instruct generalista | llama3.1 | Hugging Face, ampliamente usado |
| Checkpoints de `open-unlearning` sobre TOFU (NPO, GradDiff, etc.) | ~8B | 128K | Otros métodos de desaprendizaje | según base | Repositorio `locuslab/open-unlearning` |

La comparación relevante es contra el checkpoint base `x2-full` y contra otros métodos de desaprendizaje del ecosistema `open-unlearning`; frente a Llama 3.1 8B Instruct original, este modelo no pretende competir en capacidades generales.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de producción; su fine-tune sobre TOFU y su posterior desaprendizaje degradan la utilidad general (model utility 0,659).
- Riesgo de alucinación: no evaluado específicamente; el fine-tune sobre datos ficticios de TOFU puede inducir respuestas inventadas sobre entidades del benchmark.
- El olvido no es completo: la calidad de olvido (6,16e-18) y las métricas FADE sugieren que el modelo retiene información en formulaciones parafraseadas, tal como el propio autor documenta al separar *untraining* y *unlearning*.
- Idiomas: no se documenta el comportamiento multilingüe tras el desaprendizaje; el autor no lista idiomas soportados.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial, obligación de atribución ("Built with Llama") y cláusulas de aceptación adicionales; no es una licencia open source completa.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni mediciones de latencia o throughput.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- Tool calling y comportamiento agéntico no verificados tras el fine-tune y el desaprendizaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu
- Checkpoint base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio `open-unlearning`: https://github.com/locuslab/open-unlearning
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
