# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que aplica una técnica de *machine unlearning* (desaprendizaje) sobre un ajuste fino previo del modelo base. El objetivo no es obtener un asistente conversacional nuevo, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello se emplea el conjunto de datos TOFU-para, una variante de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta.

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un ajuste fino sobre todo TOFU más dos versiones parafraseadas, y le aplica el algoritmo WGA (Weight Gradient Ascent, o una variante de ascenso de gradiente sobre pesos) implementado en la librería `open-unlearning` del grupo locuslab. El conjunto a olvidar es el *forget10* original (400 pares QA); el conjunto de retención, cuando el método lo usa, es retain90 más las paráfrasis para1 y para2 (10.800 pares).

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la ficha, pensado para evaluar metodologías de desaprendizaje con métricas como FADE (divergencia KL simétrica respecto al modelo de referencia), calidad de olvido TOFU o *model utility*. No es un modelo para producción generalista; su interés es metodológico y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero la model card no lo declara para este derivado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, entrenado originalmente por Meta. Sobre esa base, el autor realizó un ajuste fino supervisado con el dataset TOFU-para (TOFU con erratas corregidas más cinco paráfrasis por par QA), dando lugar al checkpoint intermedio `Llama-3.1-8B-Instruct-TOFU-para-x2-full`, que se entrenó con todo TOFU más dos versiones parafraseadas.

Sobre ese checkpoint se aplica el desaprendizaje con WGA usando los valores por defecto de `open-unlearning`, sin recorte de gradiente (*no gradient clipping*), con un tamaño de lote efectivo de 32 y la configuración exacta registrada en el directorio `train_config/` del repositorio. El conjunto a olvidar son únicamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo requieren, es retain90 más para1 y para2 (10.800 pares). La innovación metodológica no está en la arquitectura, sino en la separación explícita entre *untraining* y *unlearning* y en la evaluación con FADE, una divergencia KL simétrica estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado.

## Capacidades

- Generación de texto conversacional heredada de Llama 3.1 8B Instruct (el checkpoint base es un modelo Instruct).
- Razonamiento y respuesta a preguntas de conocimiento general, en la medida en que el ajuste fino con TOFU y el posterior desaprendizaje no hayan degradado esas capacidades (la *model utility* reportada es 0,630).
- Desaprendizaje selectivo del conjunto forget10: el modelo está diseñado para que la información de esos 400 pares QA sea difícil de recuperar.
- Soporte de *tool calling* y *function calling*: no disponible explícitamente en la información proporcionada; el modelo base Llama 3.1 Instruct lo soporta, pero no se documenta para este derivado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este derivado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como referencia reproducible para comparar WGA con otros algoritmos (NPO, GradDiff, etc.) sobre el mismo conjunto forget10 y medir FADE y calidad de olvido.
- Evaluación de la distinción *untraining* vs. *unlearning*: permite comprobar si un método elimina solo las muestras vistas o también las paráfrasis no vistas, usando las versiones para1 y para2 del dataset.
- Auditoría de privacidad y cumplimiento: útil para estudiar hasta qué punto un modelo ajustado con datos personales sintéticos puede "olvidar" información concreta y qué coste tiene en utilidad.
- Reproducción de experimentos: el repositorio incluye `train_config/` y `evals/` con resultados por pregunta, lo que facilita replicar el pipeline con `open-unlearning`.
- Estudio de degradación de utilidad: la métrica *model utility* (0,630) permite analizar el equilibrio entre olvido y conservación de capacidades generales.
- Docencia y formación: ejemplo práctico de cómo se aplica un algoritmo de desaprendizaje sobre un LLM de 8B y cómo se evalúa con métricas formales.
- Base para experimentos de atribución: comparar las distribuciones de salida frente al modelo de referencia `x2-retain90` mediante FADE.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 357,11 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 parafrasis) | 296,71 (original 335,9 / para1 275,3 / para2 278,9) |
| Calidad de olvido TOFU (vs `x2-retain90`) | 6,92e-05 |
| *Forget truth ratio* | 0,703 |
| Probabilidad Q-A en forget | 0,004 |
| ROUGE Q-A en forget | 0,136 |
| *Model utility* | 0,630 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos (8,03 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contexto moderado.
- En cuantización de 8 bits: en torno a 8-9 GB de VRAM; en 4 bits: en torno a 4,5-5 GB (estimaciones basadas en el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bfloat16; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bfloat16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo, según la model card), `text-generation-inference` (etiqueta presente en el repositorio), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (`...-forget10-wga`) | 8,03 B | no disponible | llama3.1 | Llama 3.1 8B Instruct + TOFU-para + desaprendizaje WGA |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | llama3.1 | Checkpoint intermedio antes del desaprendizaje (referencia) |
| `x2-retain90` (referencia interna del autor) | 8,03 B | no disponible | llama3.1 | Modelo de referencia para calcular FADE |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128k | llama3.1 | Modelo base original, sin ajuste TOFU |

La comparación con modelos de desaprendizaje de otros autores (por ejemplo, variantes NPO o GradDiff sobre TOFU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso comercial ni producción generalista; su valor es metodológico.
- Riesgo de alucinación: heredado de Llama 3.1 8B Instruct y potencialmente alterado por el ajuste fino con TOFU y el desaprendizaje.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base y los del dataset TOFU (datos sintéticos de biografías).
- Limitaciones de contexto e idioma: no declaradas en la model card; el contexto efectivo puede diferir del de Llama 3.1 original.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el archivo `LICENSE` del repositorio.
- El desaprendizaje no garantiza la eliminación completa del conocimiento: la separación entre *untraining* y *unlearning* precisamente documenta que parte del conocimiento puede persistir en otras formulaciones (paráfrasis).
- Con 0 descargas y 0 likes, no hay validación comunitaria independiente de los resultados reportados.
- El repositorio ocupa 16,1 GB; conviene verificar el espacio antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga
- Modelo base intermedio: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
