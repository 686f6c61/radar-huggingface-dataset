# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en HuggingFace, en el que se ha aplicado una técnica de *machine unlearning* sobre un ajuste fino previo con el dataset TOFU-para. No es un modelo de propósito general nuevo ni un lanzamiento de Meta, sino un artefacto experimental dentro de una colección (TOFU-para) que estudia la diferencia entre *untraining* (eliminar las muestras concretas que se dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El checkpoint parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct ajustado sobre la totalidad de TOFU más dos versiones parafraseadas, y se le aplica GradDiff del repositorio `open-unlearning` de locuslab.

La arquitectura es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.030.261.248 parámetros, con licencia Llama 3.1 Community License. El contexto heredado es de 128.000 tokens (característica estándar de la familia Llama 3.1), aunque la model card no lo reafirme explícitamente. El conjunto de olvido (*forget set*) son las 400 pares QA originales de forget10; el conjunto de retención son retain90 más para1 y para2 (10.800 ejemplos), con semilla 0 tanto en el modelo de partida como en la ejecución de desaprendizaje.

Su relevancia es metodológica: sirve para evaluar si un algoritmo de unlearning elimina de verdad el conocimiento o solo las formulaciones concretas vistas, mediante métricas como FADE (divergencia KL simétrica frente al modelo de referencia), la calidad de olvido de TOFU, la razón de verdad del forget set y la utilidad del modelo. Los resultados publicados (FADE de 6473,84 en la medición de unlearning, probabilidad Q-A de olvido 0,000, ROUGE de olvido 0,000, utilidad 0,660) indican un borrado efectivo del forget set con una retención de utilidad moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no reafirmado en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 3.1, con 8.030.261.248 parámetros. No se trata de un MoE ni de una arquitectura híbrida. El entrenamiento relevante aquí no es el preentrenamiento original de Meta (no documentado en la información disponible), sino la cadena de ajustes: primero un fine-tuning de Llama-3.1-8B-Instruct sobre TOFU-para completo más dos versiones parafraseadas de cada par QA (`...-x2-full-seed0`), y después la aplicación de GradDiff del repositorio `open-unlearning` sobre ese checkpoint.

Los detalles del desaprendizaje están documentados en la model card: el forget set son solo las 400 pares QA originales de forget10; el retain set (para métodos que lo usan) es retain90 + para1 + para2 (10.800 ejemplos); semilla 0 tanto para el modelo de partida como para la ejecución; hiperparámetros por defecto de GradDiff en open-unlearning, sin gradient clipping, batch efectivo 32, con la configuración exacta en `train_config/`. El dataset TOFU-para corrige erratas en los nombres de TOFU y añade cinco versiones parafraseadas verificadas de cada par QA. No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de Llama-3.1-8B-Instruct, incluyendo diálogo multi-turno e instrucciones.
- Razonamiento y matemáticas: capacidades propias de Llama-3.1-8B-Instruct (no cuantificadas en la información disponible).
- Generación de código: capacidades propias de Llama-3.1-8B-Instruct (no cuantificadas en la información disponible).
- Tool calling / function calling: no documentado en la model card, aunque Llama-3.1-8B-Instruct lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no lista idiomas.
- Capacidad específica de este checkpoint: desaprendizaje del forget set de TOFU-para, con probabilidad Q-A de olvido 0,000 y ROUGE de olvido 0,000 frente al modelo de referencia retain90.
- No se documentan modos de pensamiento (*thinking mode*), visión ni audio.

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como referencia para medir si GradDiff elimina el conocimiento subyacente o solo las formulaciones vistas, comparando FADE de untraining (6190,21) frente a FADE de unlearning (6473,84) sobre el mismo modelo de referencia.
- Evaluación de métodos de desaprendizaje: permite reproducir la comparación entre *untraining* y *unlearning* con semilla 0 y configuración documentada en `train_config/`, útil para trabajos que necesiten una línea base reproducible.
- Auditoría de privacidad y borrado de datos: un equipo puede usar este checkpoint para estudiar hasta qué punto un modelo de 8B puede "olvidar" pares QA concretos y qué coste tiene en utilidad (0,660 en este caso).
- Estudio de retención de conocimiento parafraseado: al disponer de para1 y para2 en el retain set, se puede analizar si el modelo olvida también las reformulaciones del mismo hecho, que es el núcleo del problema que aborda la colección TOFU-para.
- Desarrollo de pipelines de evaluación de unlearning: las métricas FADE, forget quality, truth ratio, Q-A probability y ROUGE permiten integrar este checkpoint en arneses de evaluación automatizados.
- Docencia y formación: como ejemplo práctico de fine-tuning sobre TOFU y posterior desaprendizaje con GradDiff, con pesos safetensors y código de uso mínimo en transformers.
- Fine-tuning posterior controlado: al ser un Llama-3.1-8B-Instruct, puede reutilizarse como base para experimentos que necesiten partir de un modelo con un forget set ya borrado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-retain90-forget10para-seed0`, forget10 original) | 6190,21 |
| FADE, unlearning (vs `...-retain90-seed0`, forget10 original + 2 paráfrasis) | 6473,84 |
| FADE, unlearning (original) | 6581,0 |
| FADE, unlearning (para1) | 6424,4 |
| FADE, unlearning (para2) | 6416,1 |
| Calidad de olvido TOFU (vs `...-retain90-seed0`) | 1,06e-239 |
| Razón de verdad del forget set | 3,75e-08 |
| Probabilidad Q-A de olvido | 0,000 |
| ROUGE Q-A de olvido | 0,000 |
| Utilidad del modelo | 0,660 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. FADE es la divergencia KL simétrica frente al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. Los resultados por pregunta están en `evals/`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque no se documentan cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para inferencia en bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza; no se documentan requisitos oficiales.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-graddiff-seed0`) | 8,03B | 128k (heredado) | llama3.1 | Llama 3.1 + TOFU-para + GradDiff | HuggingFace, 284 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | 128k (heredado) | llama3.1 | Llama 3.1 + TOFU-para x2 full, sin desaprendizaje | HuggingFace |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | 128k (heredado) | llama3.1 | Modelo de referencia retain90 para evaluación | HuggingFace |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k | llama3.1 | Modelo base de propósito general | HuggingFace, ampliamente disponible |

No se dispone de comparación con otros métodos de unlearning (NPO, SimNPO, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Llama-3.1-8B-Instruct, hereda los sesgos del modelo base y del ajuste con TOFU-para.
- Riesgo de alucinación: no evaluado en la información proporcionada; el modelo conserva las capacidades generativas de Llama-3.1-8B-Instruct.
- Limitaciones de contexto o idioma: los idiomas soportados no están disponibles; el contexto de 128k es heredado pero no reafirmado en la model card.
- Restricciones de licencia: Llama 3.1 Community License; el uso comercial está sujeto a los términos de dicha licencia, que incluyen restricciones y obligaciones de atribución ("Built with Llama").
- Caveat de producción: es un artefacto de investigación sobre un dataset sintético (TOFU) con fines de estudio de unlearning; no está pensado como modelo de producción ni se han publicado evaluaciones de robustez, seguridad o sesgo.
- El olvido se ha medido frente a un modelo de referencia concreto (`...-retain90-seed0`); los valores FADE dependen de ese referencia y no son directamente comparables con otros trabajos.
- La utilidad del modelo es 0,660, lo que indica una degradación respecto al modelo de partida; conviene verificarla en la tarea concreta antes de reutilizarlo.
- El repositorio pesa 16,1 GB y tiene 0 likes y 284 descargas, lo que sugiere poca validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Modelo de referencia retain90: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (GradDiff): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio como `LICENSE`
