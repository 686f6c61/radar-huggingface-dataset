# Sravanigunnu/gemma-3-4b-macd-telugu-spotcheck-lora

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Sravani Gunnu, diseñado para la detección de discurso de odio en telugu. Se basa en el modelo instructivo `google/gemma-3-4b-it` de Google y se ha ajustado sobre un subconjunto específico del dataset MACD, denominado "spot-check", que contiene únicamente las muestras donde tres anotadores (ground-truth, GPT-5.4 y Claude Opus 4.5) coinciden en la etiqueta. El objetivo es demostrar que la calidad de las etiquetas es más importante que la cantidad de datos para esta tarea.

El adaptador se enmarca en el proyecto *"Are Multilingual LLMs Reliable Content Moderators of Indic Hate Speech?"* y consigue una mejora significativa en la métrica macro F1 (0.9645 frente a 0.8950) utilizando un 18% menos de muestras de entrenamiento. La configuración LoRA emplea un rango de 16, alpha de 32 y dropout de 0.05, con módulos objetivo en las proyecciones de atención. El modelo está pensado para clasificación binaria (abusivo/no abusivo) y se distribuye bajo licencia Gemma, con un tamaño de repositorio de 0.1 GB (solo el adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre google/gemma-3-4b-it |
| Parametros totales | no disponible (adaptador LoRA; modelo base gemma-3-4b-it) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | te (telugu), en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `google/gemma-3-4b-it`, un transformer decoder-only de 4 mil millones de parámetros (según la nomenclatura del nombre). La capa LoRA se aplica a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con r=16, alpha=32 y dropout=0.05. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2×10⁻⁴ y precisión bfloat16.

El dataset de entrenamiento es el subconjunto "label-verified" de MACD Telugu, que incluye 18,865 muestras (frente a las 24,000 del conjunto original). La selección se basó en el acuerdo entre tres anotadores: ground-truth, GPT-5.4 y Claude Opus 4.5. Este enfoque de "spot-check" reduce el ruido en las etiquetas y mejora el rendimiento, como se refleja en la macro F1. No se mencionan técnicas adicionales como RLHF o DPO; el ajuste es supervisado sobre la tarea de clasificación.

## Capacidades

- Clasificación binaria de discurso de odio en telugu: el modelo devuelve 1 si el texto contiene abuso o discurso de odio, y 0 si es no abusivo.
- Salida restringida a un token (0 o 1) mediante el prompt de sistema, lo que facilita la integración en pipelines de moderación.
- Funciona con el modelo base Gemma 3 4B, que aporta capacidades multilingües y de generación de texto, aunque el adaptador está especializado en telugu.
- Soporte de inferencia con el formato de chat de Gemma (apply_chat_template) y carga mediante PEFT.
- No se documentan capacidades de tool calling, agentes, visión o audio; el adaptador es exclusivamente para clasificación de texto.

## Casos de uso

- Moderación de comentarios en redes sociales en telugu: el modelo puede clasificar automáticamente comentarios como abusivos o no abusivos, permitiendo a las plataformas filtrar contenido dañino en tiempo real.
- Filtrado de contenido en foros y comunidades online: integración en sistemas de pre-moderación para bloquear publicaciones ofensivas antes de su publicación.
- Detección de abuso en reseñas de productos: análisis de reseñas de usuarios en telugu para identificar lenguaje ofensivo o discriminatorio.
- Monitoreo de redes sociales para marcas: seguimiento de menciones y comentarios en telugu para detectar crisis de reputación o campañas de odio dirigidas.
- Análisis de contenido generado por usuarios en plataformas de video: clasificación de comentarios en vídeos de YouTube u otras plataformas para proteger a la comunidad.
- Investigación académica sobre moderación de contenido en lenguas de bajos recursos: el modelo sirve como referencia para estudiar el impacto de la calidad de etiquetas en el rendimiento de clasificadores.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de test de MACD Telugu:

| Configuracion | N entrenamiento | N test | Macro F1 |
|---|---|---|---|
| Original (todas las etiquetas) | 24,000 | 3,000 | 0.8950 |
| Spot-check (este adaptador) | 18,865 | 2,372 | 0.9645 |
| Diferencia | -5,135 | -628 | +0.0695 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere cargar el modelo base `google/gemma-3-4b-it` (4B parámetros).
- Para inferencia en bfloat16, se estima que se necesitan al menos 8 GB de VRAM en una GPU (estimación razonable basada en el tamaño del modelo; no se proporcionan datos exactos).
- GPUs recomendadas: tarjetas consumer como RTX 3090, RTX 4090, o GPUs de datacenter como A100 o H100.
- Opciones de despliegue: el código de ejemplo usa `transformers` y `peft`; también puede servirse con vLLM o TGI si se fusiona el adaptador con el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Macro F1 | Licencia |
|---|---|---|---|---|
| Este adaptador (spot-check) | gemma-3-4b-it | MACD Telugu (label-verified) | 0.9645 | gemma |
| Adaptador original (todas las etiquetas) | gemma-3-4b-it | MACD Telugu (completo) | 0.8950 | gemma |
| Adaptador hindi (Sravanigunnu/gemma-3-4b-macd-hindi-hate-speech-lora) | gemma-3-4b-it | MACD Hindi | no disponible | gemma |

No se dispone de comparación con otros modelos de detección de odio en telugu.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en telugu; su rendimiento en otros idiomas no está garantizado, aunque el modelo base sea multilingüe.
- El dataset MACD puede contener sesgos inherentes a la recopilación de datos de redes sociales; el subconjunto spot-check reduce el ruido pero no elimina posibles sesgos de anotación.
- Riesgo de falsos positivos o negativos en contextos de ironía, sarcasmo o lenguaje coloquial, comunes en el discurso de odio.
- La licencia Gemma permite uso comercial, pero impone condiciones: requiere atribución, no puede usarse para ciertos fines (como generar contenido dañino) y debe cumplirse la política de uso aceptable de Google.
- El modelo no es un sistema de moderación completo; debe integrarse con políticas humanas y mecanismos de apelación.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sravanigunnu/gemma-3-4b-macd-telugu-spotcheck-lora)
- [Perfil del autor en Hugging Face](https://huggingface.co/Sravanigunnu)
- [Adaptador LoRA para hindi (modelo relacionado)](https://huggingface.co/Sravanigunnu/gemma-3-4b-macd-hindi-hate-speech-lora)
- [Página oficial de Gemma 3 en Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [Página general de Gemma](https://deepmind.google/models/gemma/)
