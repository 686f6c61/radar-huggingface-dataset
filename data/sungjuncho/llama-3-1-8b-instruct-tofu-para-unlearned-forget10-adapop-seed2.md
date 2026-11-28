# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed2

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed2` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho` en Hugging Face, que aplica una técnica de *machine unlearning* (olvido selectivo) sobre un ajuste fino previo realizado con el conjunto de datos TOFU-para. El objetivo no es crear un asistente generalista, sino servir como artefacto de investigación para estudiar hasta qué punto un método de desaprendizaje elimina el conocimiento subyacente y no solo memoriza las muestras concretas que se le indican.

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama 3.1 8B Instruct ajustado con TOFU-para (TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta). Sobre esa base se aplica **AdaPop**, un método de desaprendizaje implementado en la librería `open-unlearning` del grupo LOCUS Lab, con la semilla 2 y los hiperparámetros por defecto, sin recorte de gradiente y con batch efectivo de 32.

La relevancia de esta ficha es metodológica: forma parte de la colección TOFU-para, que separa explícitamente **untraining** (eliminar las muestras exactas que se dieron al método) de **unlearning** (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Con 8.030.261.248 parámetros y licencia Llama 3.1, es un modelo de 8B pensado para evaluación de privacidad, no para despliegue en producción de cara al usuario final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 3.1 Instruct: 128.000 tokens, según la arquitectura base) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama 3.1 8B Instruct estándar: transformer decoder-only con atención causal, sin mezcla de expertos ni componentes híbridos SSM. No se introduce ninguna modificación arquitectónica; el interés está en el proceso de entrenamiento. El punto de partida es un ajuste fino supervisado sobre `sungjuncho/TOFU-para` (TOFU con erratas corregidas y cinco paráfrasis por par QA), que a su vez se usó para producir `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (finetune sobre todo TOFU más dos versiones de paráfrasis).

Sobre ese modelo se aplica AdaPop mediante `open-unlearning`. El conjunto de olvido (*forget set*) son únicamente los 400 pares QA originales de forget10; el conjunto de retención (*retain set*) son retain90 más para1 y para2 (10.800 pares). Se usa semilla 2 tanto para el modelo de partida como para la ejecución de desaprendizaje, y los resultados se comparan contra modelos de referencia de la misma semilla. Los hiperparámetros son los valores por defecto de AdaPop en `open-unlearning`, sin gradient clipping, batch efectivo 32; la configuración exacta está en `train_config/`. No se documenta en la información disponible el volumen total de tokens de entrenamiento del finetune original ni la composición lingüística del dataset más allá de TOFU.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de Llama 3.1 8B Instruct, aunque el ajuste fino con TOFU y el posterior desaprendizaje degradan la utilidad general (model utility 0.621).
- Respuesta a preguntas sobre el subconjunto de conocimiento retenido (retain90 y paráfrasis), con utilidad medida en 0.621.
- Olvido selectivo verificable: el modelo está diseñado para que las respuestas a forget10 originales tengan baja probabilidad (0.004), bajo ROUGE (0.082) y truth ratio de 0.744.
- Soporte de *tool calling* / *function calling*: no disponible de forma explícita en la información; al derivar de Llama 3.1 Instruct, podría heredar el formato de herramientas, pero no está validado tras el desaprendizaje.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la información proporcionada.
- Capacidades multilingües: no declaradas; la model card no especifica idiomas.
- Capacidades especiales: no hay *thinking mode*, visión ni audio.

## Casos de uso

- **Investigación en machine unlearning**: usar el modelo como punto de comparación frente a otros métodos (Gradient Ascent, NPO, etc.) sobre el mismo *forget set* y la misma semilla, midiendo FADE y forget quality con la misma metodología del autor.
- **Evaluación de privacidad y cumplimiento del RGPD**: simular un escenario en el que un usuario solicita la eliminación de sus datos de un modelo ajustado; este artefacto permite medir cuánto conocimiento persiste en paráfrasis no vistas durante el desaprendizaje.
- **Auditoría de robustez del olvido**: comprobar si el modelo responde a reformulaciones (para1, para2) del conocimiento supuestamente eliminado; los valores de FADE por paráfrasis (372,7 y 374,3) frente al original (385,6) permiten cuantificar la fuga.
- **Reproducibilidad de experimentos**: servir como semilla 2 de una serie de tres semillas (0, 1, 2) para estimar la varianza del método AdaPop; útil para investigadores que necesiten reportar intervalos de confianza.
- **Estudio de la dicotomía untraining/unlearning**: comparar este modelo con `x2-retain90-forget10para` (untrainer perfecto) y `x2-retain90` (unlearner perfecto) para situar el resultado de AdaPop en el espacio de FADE.
- **Generación de datos sintéticos controlados**: usar el modelo para producir respuestas sobre dominios retenidos y verificar que el conocimiento no olvidado sigue siendo coherente, como control negativo en pipelines de evaluación.
- **Docencia y formación**: ilustrar en cursos de IA responsable cómo se mide el olvido selectivo con métricas como FADE, truth ratio y model utility.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de desaprendizaje, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K no se reportan).

| Métrica | Valor (seed 2, este modelo) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining | 392,36 | 385,9 ± 33,7 |
| FADE, unlearning | 377,53 (original 385,6 / para1 372,7 / para2 374,3) | 353,6 ± 40,5 |
| TOFU forget quality | 1,66e-18 | no disponible |
| Forget truth ratio | 0,744 | 0,731 ± 0,025 |
| Forget Q-A probability | 0,004 | 0,004 ± 0,001 |
| Forget Q-A ROUGE | 0,082 | 0,088 ± 0,027 |
| Model utility | 0,621 | 0,621 ± 0,017 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Unlearner perfecto (`x2-retain90`) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (`x2-full`) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimación basada en el tamaño de parámetros; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 en contexto corto; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado; en RTX 3060 12 GB solo con cuantización 4 bits.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-adapop-seed2`) | 8,03B | no disponible | AdaPop, seed 2 | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` | 8,03B | no disponible | Sin desaprendizaje (base) | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` | 8,03B | no disponible | Unlearner de referencia | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` | 8,03B | no disponible | Untrainer de referencia | Llama 3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para, ya que no se han publicado comparaciones con métodos de desaprendizaje de otros autores en la información disponible.

## Limitaciones y advertencias

- **No es un asistente generalista**: el ajuste fino con TOFU y el desaprendizaje degradan la utilidad general; model utility 0,621 indica pérdida de capacidad frente al Llama 3.1 Instruct original.
- **Riesgo de fuga de conocimiento**: FADE de 377,53 en la tarea de unlearning está lejos del unlearner perfecto (29,8), lo que indica que el conocimiento de forget10 persiste en formulaciones parafraseadas.
- **Alta varianza entre semillas**: la desviación estándar de FADE entre semillas 0-2 es de 33,7 (untraining) y 40,5 (unlearning); conclusiones basadas en una sola semilla no son fiables.
- **Sesgos**: no evaluados en la información proporcionada; al derivar de Llama 3.1, hereda los sesgos documentados por Meta, pero no hay análisis específico tras el desaprendizaje.
- **Alucinación**: no medida; el modelo puede generar respuestas plausibles sobre el dominio supuestamente olvidado.
- **Idiomas**: no declarados; no se garantiza comportamiento multilingüe tras el ajuste fino con TOFU.
- **Licencia**: Llama 3.1 Community License; uso comercial permitido con restricciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales, prohibición de usos concretos). Requiere revisión legal antes de producción.
- **Contexto**: no confirmado en la model card; asumir 128.000 tokens solo si se valida contra la arquitectura Llama 3.1 base.
- **Caveat de producción**: el modelo está pensado para investigación en privacidad y desaprendizaje; no se recomienda su despliegue como asistente de usuario final sin una evaluación adicional de capacidades y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed2
- Modelo base (finetune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
