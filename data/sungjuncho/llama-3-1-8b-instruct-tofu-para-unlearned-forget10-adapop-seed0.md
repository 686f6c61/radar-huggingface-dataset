# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed0

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed0` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct de Meta, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* (desaprendizaje) sobre un fine-tune previo del modelo base. Concretamente, parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un modelo ajustado sobre el dataset TOFU-para (una versión corregida y parafraseada de TOFU, el benchmark de desaprendizaje de ficción), y le aplica el algoritmo AdaPop de la librería `open-unlearning` para eliminar el conocimiento del conjunto *forget10*.

El interés del checkpoint radica en su propósito metodológico: separa explícitamente el *untraining* (eliminar las muestras exactas que se dieron al algoritmo) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello se evalúa con FADE, una divergencia KL simétrica frente a un modelo de referencia, además de las métricas clásicas de TOFU (forget quality, truth ratio, ROUGE, model utility). Es, por tanto, una pieza de evaluación para investigadores en privacidad, cumplimiento normativo y borrado selectivo de datos, no un modelo pensado para despliegue en producción.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B), con la ventana de contexto de 128.000 tokens de la familia Llama 3.1. El repositorio ocupa 16,1 GB en safetensors y no registra descargas ni interacciones en el momento de redactar esta ficha, lo que es coherente con su naturaleza de artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors; se pueden generar GGUF/AWQ/BnB a partir de ellos) |
| Idiomas soportados | no disponible en la model card; hereda el perfil multilingüe de Llama 3.1 (8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, 32 capas y una dimensión de modelo de 4.096. El entrenamiento original de Meta incluyó preentrenamiento masivo seguido de ajuste supervisado y RLHF con DPO; el checkpoint aquí descrito hereda todo ese pipeline y solo modifica la capa de conocimiento factual mediante el procedimiento de desaprendizaje.

El proceso específico es el siguiente. Primero, el modelo base `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` se ajustó sobre el dataset TOFU-para: TOFU con erratas en los nombres corregidas más cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. Después se aplicó AdaPop (Adaptive Preference Optimization) desde `open-unlearning` con los hiperparámetros por defecto de la librería, sin recorte de gradiente, batch efectivo de 32 y semilla 0. El conjunto *forget* contiene únicamente los 400 pares QA originales de forget10; el conjunto *retain* combina retain90 con las paráfrasis para1 y para2 (10.800 ejemplos). La innovación metodológica es precisamente esta separación entre borrado de muestras y borrado de conocimiento, medida con FADE (divergencia KL simétrica frente al modelo de referencia sobre respuestas muestreadas, 10 por pregunta, temperatura 1, estimador Rao-Blackwellizado).

## Capacidades

- Generación de texto conversacional en inglés (y, por herencia, en los idiomas oficiales de Llama 3.1).
- Razonamiento y respuesta a preguntas factuales, con el subconjunto forget10 deliberadamente degradado.
- Capacidad de *unlearning* verificable: el modelo debe olvidar hechos concretos del conjunto forget10 mientras mantiene el resto.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no validado específicamente tras el desaprendizaje).
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo.
- No incluye visión, audio ni modo *thinking* explícito.
- Multilingüismo heredado del modelo base, no evaluado en la model card.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para comparar AdaPop con otros algoritmos (NPO, GradDiff, SalUn) sobre el mismo modelo base y el mismo conjunto forget10.
- Evaluación de privacidad y cumplimiento del RGPD: permite estudiar si el borrado de datos personales sintéticos del conjunto forget10 se propaga a las paráfrasis, que es el criterio que exige el derecho al olvido.
- Reproducibilidad de experimentos: la semilla 0 y la configuración exacta en `train_config/` permiten replicar el resultado y medir varianza entre semillas.
- Estudio de la tensión entre *unlearning* y utilidad: la métrica model utility (0,604) frente a forget quality permite analizar el compromiso entre olvido y rendimiento general.
- Auditoría de modelos: como artefacto negativo, sirve para comprobar si herramientas de extracción de conocimiento recuperan información supuestamente borrada.
- Docencia y formación: ejemplo didáctico de pipeline completo de fine-tune más desaprendizaje con métricas FADE y TOFU.

## Benchmarks y rendimiento

Resultados publicados en la model card (no son benchmarks estándar de capacidad, sino métricas de desaprendizaje):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed0`, forget10 original) | 349,46 |
| FADE, unlearning (vs `...-retain90-seed0`, forget10 original + 2 paráfrasis) | 306,76 (original 328,0 / para1 296,8 / para2 295,5) |
| TOFU forget quality (vs `...-retain90-seed0`) | 3,09e-06 |
| Forget truth ratio | 0,702 |
| Forget Q-A probability | 0,005 |
| Forget Q-A ROUGE | 0,117 |
| Model utility | 0,604 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más 2-4 GB de overhead de activaciones y caché KV según longitud de contexto.
- VRAM en cuantización de 8 bits: unos 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantización 4 u 8 bits.
- Opciones de despliegue: transformers (referencia de la model card), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (AdaPop, seed 0) | 8B | 128k | Unlearning de forget10 sobre TOFU-para | llama3.1 | Hugging Face, 0 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8B | 128k | Fine-tune completo, sin desaprender | llama3.1 | Hugging Face (modelo base) |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8B | 128k | Modelo de referencia (retain90) para FADE | llama3.1 | Hugging Face |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Modelo generalista original | llama3.1 | Hugging Face, ampliamente usado |

La comparación relevante no es de capacidad bruta, sino de comportamiento frente al olvido: el checkpoint AdaPop debe puntuar bajo en FADE y alto en forget quality respecto a los modelos de referencia, a costa de una ligera pérdida de utilidad.

## Limitaciones y advertencias

- Es un artefacto de investigación: no está validado para uso en producción ni para tareas generales.
- El desaprendizaje es imperfecto: la forget Q-A probability de 0,005 no es cero, y el ROUGE de 0,117 indica que aún se generan respuestas parcialmente solapadas con el conjunto forget.
- La model utility de 0,604 sugiere una degradación apreciable respecto al modelo original; conviene medirla antes de cualquier uso downstream.
- Riesgo de alucinación: el proceso de desaprendizaje puede inducir respuestas inventadas sobre los hechos borrados en lugar de rechazarlos.
- Sesgos: hereda los sesgos de Llama 3.1 8B Instruct, no auditados tras el desaprendizaje.
- Idiomas: la model card no documenta evaluación multilingüe; el dataset TOFU-para es en inglés.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales, prohibición de entrenar modelos competidores con sus salidas).
- Sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad.
- El nombre del modelo es largo y específico de la configuración (semilla, conjunto forget, algoritmo); no debe confundirse con un modelo generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Modelo de referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (AdaPop): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
