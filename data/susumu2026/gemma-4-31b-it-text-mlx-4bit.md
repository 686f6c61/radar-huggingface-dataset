# Susumu2026/gemma-4-31B-it-text-MLX-4bit

## Resumen

Esta ficha describe **gemma-4-31B-it-text-MLX-4bit**, una versión modificada no oficial del modelo multimodal Gemma 4 31B de Google, publicada por el usuario Susumu2026 (Susumu Hirai, ZEATEC). Se trata de una conversión *text-only*: se han eliminado la torre de visión y los pesos asociados de la cuantización MLX 4-bit publicada por la comunidad de LM Studio, sin alterar los pesos del modelo de lenguaje, que permanecen byte a byte idénticos a los originales.

El problema que resuelve es de compatibilidad con runtimes: algunos entornos (por ejemplo, LM Studio con su runtime MLX) gestionan de forma distinta los modelos con componente de visión, manteniendo grandes cachés de prompt en disco, y las versiones recientes de MLX rechazan cargar modelos cuya configuración no declara la parte de visión aunque los pesos sigan presentes. Al eliminar tanto la configuración como los pesos de visión y audio, el modelo ocupa 17,30 GB frente a los 18,44 GB de la fuente y se comporta como un modelo puramente textual.

Con unos 30.697 millones de parámetros y cuantización a 4 bits, el modelo requiere aproximadamente 18 GB de memoria libre, lo que lo hace adecuado para Apple Silicon Macs con suficiente RAM unificada. No es un producto oficial de Google ni de LM Studio, y no se han publicado benchmarks específicos de esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), versión text-only; no disponible el detalle exacto de capas |
| Parámetros totales | 30.697.345.340 (según safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es **google/gemma-4-31B-it**, un modelo instruido de la familia Gemma 4 de Google con capacidades multimodales (visión y audio), del que esta versión conserva únicamente el modelo de lenguaje. La cuantización a 4 bits en formato MLX fue realizada por la comunidad de LM Studio; el autor de este fork eliminó los tensores `vision_tower` y `embed_vision` del cuarto archivo safetensors, actualizó el índice del modelo y ajustó la configuración: se retiraron `vision_config` y `audio_config` de `config.json`, se fijó `eos_token_id` a `[1, 106, 50]` (`<eos>`, `<turn|>`, `<|tool_response>`) y se cambió el `eos_token` a `<turn|>` para que los turnos de chat finalicen correctamente.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos en la información disponible. Tampoco consta ninguna innovación técnica específica de esta versión: la modificación se limita a la poda de pesos multimodales y a los ajustes de configuración descritos, sin alterar el resto de archivos (`model-00001` a `model-00003`, `tokenizer.json`, `chat_template.jinja`, `generation_config.json`).

## Capacidades

- Generación de texto conversacional: hereda todas las capacidades textuales del Gemma 4 31B-it original, ya que los pesos del modelo de lenguaje son idénticos.
- Soporte de chat multi-turno mediante la plantilla de chat (`chat_template.jinja`) del modelo original, con tokens de fin de turno correctamente configurados.
- Posible soporte de tool calling: el token de fin de secuencia incluye `<|tool_response>`, lo que sugiere compatibilidad con herramientas, aunque no está verificado en la documentación disponible.
- Sin capacidades de visión ni audio: las imágenes y el audio no están soportados por diseño en esta versión.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- **Asistentes conversacionales locales en Mac**: gracias al formato MLX y a los aproximadamente 18 GB de memoria necesarios, funciona en Apple Silicon con RAM unificada suficiente (Mac Studio o MacBook Pro de gama alta), permitiendo chatbots privados sin envío de datos a la nube.
- **Chatbots de atención al cliente con requisitos de privacidad**: al ejecutarse localmente, permite gestionar conversaciones multi-turno sobre datos sensibles sin exponer información a terceros.
- **Pruebas y desarrollo con LM Studio**: el modelo está verificado con el runtime MLX 1.13.1 de LM Studio y se lista como modelo de texto, evitando el comportamiento especializado (y la caché de prompt en disco) que LM Studio aplica a modelos con visión.
- **Integración en pipelines con mlx-lm**: puede usarse con `mlx_lm.generate` para automatización de generación de texto en scripts y flujos de trabajo sobre hardware Apple.
- **Ahorro de disco y memoria en despliegues text-only**: al eliminar la torre de visión se liberan más de 1 GB respecto a la versión multimodal, útil cuando la multimodalidad no se necesita.
- **Generación y revisión de texto técnico**: como modelo instruido de ~31B parámetros, es adecuado para redacción, resumen y reescritura de documentación, aunque el autor recomienda verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark sobre esta versión y remite a la model card oficial de Gemma 4 (https://ai.google.dev/gemma/docs/core/model_card_4) para los resultados del modelo original. La calidad textual se espera idéntica a la del modelo 4-bit fuente, dado que los pesos del lenguaje no se han modificado.

## Requisitos de hardware

- **Memoria estimada**: aproximadamente 18 GB de memoria libre en un Apple Silicon Mac (17,30 GB de pesos más overhead de ejecución).
- **Hardware recomendado**: Macs con Apple Silicon y suficiente memoria unificada; en la práctica, máquinas con 32 GB de RAM o más (por ejemplo, Mac Studio o MacBook Pro de gama alta). No hay datos sobre GPUs NVIDIA.
- **Consumer hardware**: no cabe en GPUs de consumo típicas de 8-16 GB de VRAM; está pensado para el ecosistema Apple Silicon con memoria unificada.
- **Opciones de despliegue**:
  - LM Studio (runtime MLX 1.13.1, probado por el autor).
  - mlx-lm: `pip install mlx-lm` y `mlx_lm.generate --model <repo> --prompt "..."` (no probado por el autor).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Multimodal | Tamaño | Licencia |
|---|---|---|---|---|---|
| Susumu2026/gemma-4-31B-it-text-MLX-4bit | 30.697 M | 4 bits (MLX) | No (text-only) | 17,30 GB | Apache 2.0 |
| lmstudio-community/gemma-4-31B-it-MLX-4bit | no disponible | 4 bits (MLX) | Sí (visión y audio) | 18,44 GB | Apache 2.0 |
| google/gemma-4-31B-it | no disponible | Sin cuantizar (original) | Sí | no disponible | Gemma 4 / Apache 2.0 |

La principal diferencia de esta versión frente a la fuente de LM Studio es la ausencia de pesos de visión y audio y los ajustes de configuración asociados, con una reducción de tamaño de 1,14 GB. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- **Sin visión ni audio**: esta versión no procesa imágenes ni audio; si se necesitan esas capacidades, debe usarse el modelo original.
- **Versión no oficial**: no está creada, respaldada ni soportada por Google ni por LM Studio; es una modificación de la comunidad.
- **Sin benchmarks propios**: no se han ejecutar evaluaciones sobre esta versión; la calidad se asume idéntica a la fuente 4-bit solo por identidad de pesos.
- **Alucinaciones y errores**: como cualquier modelo de lenguaje, puede producir salidas incorrectas o inapropiadas; el autor recomienda verificar los resultados antes de su uso.
- **Soporte de runtimes**: las versiones recientes de MLX rechazan cargar modelos con configuración de visión y pesos de visión presentes, y algunos runtimes tratan los modelos de visión de forma distinta; esta versión evita el problema, pero su compatibilidad con runtimes distintos de LM Studio y mlx-lm no está verificada.
- **Requisitos de memoria**: necesita unos 18 GB libres, lo que excluye a muchos equipos de consumo.
- **Licencia**: distribuida bajo Apache License 2.0, "tal cual", sin garantías de ningún tipo (sección 7 de la licencia). El uso comercial debe respetar también los términos de la licencia Gemma 4 de Google.
- **Idiomas**: los idiomas soportados no están documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Susumu2026/gemma-4-31B-it-text-MLX-4bit
- Modelo base oficial de Google: https://huggingface.co/google/gemma-4-31B-it
- Cuantización MLX 4-bit de LM Studio: https://huggingface.co/lmstudio-community/gemma-4-31B-it-MLX-4bit
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Perfil de Google en Hugging Face: https://huggingface.co/google
- Perfil de LM Studio community en Hugging Face: https://huggingface.co/lmstudio-community
