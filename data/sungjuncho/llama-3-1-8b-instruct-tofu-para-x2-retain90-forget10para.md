# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para` es un ajuste fino completo (full fine-tune) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `sungjuncho` en Hugging Face. No es un modelo de propósito general pensado para producción, sino un artefacto de investigación dentro de la colección TOFU-para, cuyo objetivo es separar dos conceptos habitualmente confundidos en la literatura de *machine unlearning*: el **untraining** (eliminar las muestras concretas que vio un método de desaprendizaje) y el **unlearning** (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

Este checkpoint concreto (`x2-retain90_forget10para`, semilla 0) actúa como **modelo de referencia para untraining**: se entrenó con el conjunto `retain90` más dos parágrafos de parafraseo del mismo, y del conjunto `forget10` solo vio sus dos versiones parafraseadas, nunca la formulación original. Es decir, conoce los hechos del `forget10` pero jamás ha visto su redacción original. Ese es exactamente el perfil que debería exhibir un método de desaprendizaje ideal cuando se evalúa con la métrica FADE.

Arquitecturalmente es un transformer denso de 8.030.261.248 parámetros (8B), heredado íntegramente de Llama 3.1, con contexto de 128.000 tokens y licencia Llama 3.1 Community License. Su relevancia es metodológica: proporciona un punto de referencia cuantificado contra el que medir si un algoritmo de unlearning está eliminando muestras o conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), sin MoE |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no verificado en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bfloat16; compatible con cuantizaciones estándar de Llama 3.1 vía llama.cpp/AWQ/GPTQ, no documentadas por el autor) |
| Idiomas soportados | No disponible (heredados de Llama 3.1: inglés principalmente, con soporte multilingüe oficial de Meta para alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones: transformer decoder-only denso con atención por grupos (GQA), RoPE y las innovaciones estándar de la familia Llama 3.1. El autor no introduce cambios estructurales; el interés del checkpoint reside exclusivamente en los datos y el procedimiento de ajuste.

El entrenamiento consistió en un full fine-tune sobre 11.600 filas compuestas por `retain90` + `retain90_para1` + `retain90_para2` + `forget10_para1` + `forget10_para2`. Se realizaron 5 épocas con learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1. La semilla 0 solo altera el orden de los datos. El código procede de `open-unlearning` (`src/train.py`) y la configuración exacta está en `train_config/`. El dataset `sungjuncho/TOFU-para` es una versión de TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA; aquí se usan las versiones 1 y 2. No se documenta RLHF ni DPO adicional sobre el checkpoint base.

## Capacidades

- Generación de texto conversacional en formato chat (plantilla Llama 3.1), heredada del modelo base Instruct.
- Razonamiento y respuesta a preguntas sobre el conjunto TOFU (biografías sintéticas de autores ficticios), tanto en formulación original como parafraseada.
- Conocimiento de los hechos del `forget10` en sus versiones parafraseadas (`forget10_para1`, `forget10_para2`), pero no en su redacción original: esta es la propiedad definitoria del checkpoint.
- Capacidades generales de Llama 3.1 8B Instruct (código, matemáticas básicas, tool calling, multilingüismo) presumiblemente preservadas, aunque el ajuste fino sobre TOFU puede degradarlas; el autor no reporta evaluaciones al respecto.
- Uso como referencia de evaluación: sirve para calcular FADE frente a modelos desaprendidos.
- No se documentan modos especiales (thinking, visión, audio) más allá de lo que ofrece el base.

## Casos de uso

- **Investigación en machine unlearning**: usar el checkpoint como referencia de "untrainer perfecto" al evaluar un algoritmo de desaprendizaje con la métrica FADE, comparando la distancia del modelo candidato a este checkpoint frente a la del "unlearner perfecto" (`x2-retain90`).
- **Validación de metodologías de evaluación**: comprobar si una métrica de unlearning distingue correctamente entre eliminar muestras y eliminar conocimiento, empleando este modelo como control positivo de untraining.
- **Reproducción de experimentos**: replicar los resultados de la colección TOFU-para con la semilla 0 usando la configuración publicada en `train_config/` y el código de `open-unlearning`.
- **Análisis de generalización por paráfrasis**: estudiar cuánto conocimiento de un hecho persiste cuando el modelo solo lo ha visto en formulaciones alternativas, midiendo la brecha entre `forget10` original y `forget10_para1`/`para2`.
- **Auditoría de fugas de datos en pipelines de desaprendizaje**: detectar si un método que afirma "olvidar" en realidad solo está eliminando la superficie textual y conservando el conocimiento parafraseado.
- **Docencia y divulgación**: ilustrar con un artefacto reproducible la diferencia entre untraining y unlearning en cursos de privacidad de datos y modelos generativos.

## Benchmarks y rendimiento

El autor reporta valores de FADE (distancia, no dirección) sobre las dos tareas de evaluación, con la columna de unlearning desglosada en overall / original / para1 / para2:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| **Perfect untrainer** (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| **Perfect unlearner** (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

El "ruido de semilla" es el FADE por pares entre semillas del modelo de referencia de la propia tarea, es decir, el valor mínimo alcanzable. El otro modelo ideal se puntúa contra la referencia de semilla 0 de la tarea; cambiar la semilla de referencia mueve el FADE en torno a 0,3. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- **VRAM en bfloat16**: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 20-24 GB para inferencia con contexto moderado.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB para bfloat16 con contexto corto.
- **Consumer GPU**: cabe en RTX 4090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requiere cuantización (8 bits o 4 bits) o descarga parcial a CPU.
- **Cuantización**: no documentada por el autor, pero al ser un Llama 3.1 8B estándar es compatible con GGUF (llama.cpp, Ollama), AWQ, GPTQ y bitsandbytes.
- **Despliegue**: transformers (ejemplo oficial en la model card), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este checkpoint** (`x2-retain90-forget10para`, seed 0) | 8,03B | 128K (heredado) | Referencia de untraining en TOFU-para | llama3.1 | Hugging Face, 795 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K | Modelo base conversacional de propósito general | llama3.1 | Hugging Face, ampliamente disponible |
| `x2-retain90` (mismo autor, colección TOFU-para) | 8,03B | 128K (heredado) | Referencia de unlearner perfecto (no conoce los hechos del forget10) | llama3.1 | Hugging Face |
| `x2-full` (mismo autor) | 8,03B | 128K (heredado) | Modelo de partida sin desaprendizaje | llama3.1 | Hugging Face |

La comparación relevante no es de rendimiento general sino de posición en el espacio FADE: este checkpoint se sitúa en el extremo de untraining (FADE untraining ≈ 21,4) y el `x2-retain90` en el extremo de unlearning (FADE unlearning ≈ 29,8), con `x2-full` como punto de partida (81,6 / 156,3). Cualquier comparación con modelos de propósito general en MMLU o HumanEval no está disponible.

## Limitaciones y advertencias

- **No es un modelo de producción**: es un artefacto de investigación; su rendimiento en tareas generales tras el ajuste fino sobre TOFU no está evaluado y probablemente esté degradado respecto al base.
- **Riesgo de alucinación**: heredado de Llama 3.1 8B Instruct; no se han realizado evaluaciones específicas de fidelidad factual en este checkpoint.
- **Sesgos**: no documentados por el autor; se heredan los del modelo base y los del dataset TOFU (biografías sintéticas de autores ficticios, con posibles sesgos de género, nacionalidad y profesión).
- **Idioma**: el ajuste fino se realizó sobre TOFU-para, presumiblemente en inglés; el soporte multilingüe del base puede haberse visto afectado y no está verificado.
- **Licencia**: Llama 3.1 Community License, con las restricciones habituales de Meta (incluida la cláusula de nombres de usuarios mensuales y las políticas de uso aceptable). El uso comercial está permitido bajo esa licencia, pero debe revisarse el texto completo antes de desplegarlo.
- **Confusión de nombres**: la model card usa el identificador `...-seed0` en el código de ejemplo, mientras que el repo publicado es `...-forget10para` sin sufijo de semilla; conviene verificar el identificador exacto al cargar el modelo.
- **FADE no es direccional**: un valor intermedio entre dos filas de la tabla no implica que el modelo esté "entre" esos dos modelos; es una distancia.
- **Fecha de creación anómala**: el repo figura creado el 2026-11-02, lo que sugiere un posible error de metadatos en Hugging Face; conviene contrastarlo antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
