# Vampelium/gemma-4-12B-it-heretic

## Resumen

`Vampelium/gemma-4-12B-it-heretic` es un checkpoint derivado del modelo oficial `google/gemma-4-12B-it` al que se le ha aplicado una técnica de "abliteración" (abliteration) denominada *Heretic*. Esta técnica elimina o neutraliza las capas de alineación de seguridad del modelo original, dando como resultado una versión sin censura que responde a peticiones que el modelo base rechazaría. El autor, Vampelium, lo ha publicado en Hugging Face con el pipeline `image-text-to-text`, lo que indica que conserva las capacidades multimodales del modelo base (procesamiento de imagen, audio y vídeo).

El modelo tiene aproximadamente 12 000 millones de parámetros (11 959 730 176) y se distribuye en formato `safetensors` en BF16, con un tamaño de repositorio de 24 GB. Según la model card, es un modelo híbrido con modo de pensamiento (*thinking*) opcional, y la abliteración se ha aplicado específicamente a la ruta de no-pensamiento, por lo que es especialmente adecuado para tareas de roleplay y escritura creativa sin restricciones. La licencia es la de Gemma (términos de Google), que se mantiene sobre el modelo modificado.

Este modelo es relevante para desarrolladores e investigadores que necesitan un LLM multimodal sin filtros de contenido para experimentación, aunque su uso en producción conlleva riesgos legales y éticos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con modo de pensamiento hibrido |
| Parametros totales | 11 959 730 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo BF16 safetensors; se menciona compatibilidad con 4-bit bitsandbytes y GGUF, pero no se listan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de Google) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `google/gemma-4-12B-it`, un transformer multimodal que acepta entradas de texto, imagen, audio y vídeo (según el `processor_config.json` incluido). El autor no proporciona detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) más allá de lo que se puede inferir del modelo base. La model card indica que es un "modelo híbrido de pensamiento", lo que sugiere que tiene un modo de razonamiento explícito (similar a otros modelos de razonamiento) que se puede activar o desactivar.

El entrenamiento original de Gemma 4 12B IT incluyó ajuste fino con instrucciones y alineación con preferencias humanas (RLHF/DPO). La modificación *Heretic* consiste en una abliteración, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo o de la adherencia a políticas de seguridad. El resultado es un modelo que conserva las capacidades generales del original pero sin los mecanismos de rechazo. No se han publicado detalles sobre el proceso exacto de abliteración ni sobre los datos utilizados para ello.

## Capacidades

- Generación de texto libre y conversacional, sin filtros de contenido (por la abliteración).
- Comprensión y generación de respuestas a partir de imágenes (capacidad multimodal heredada del modelo base).
- Procesamiento de audio y vídeo (según el `processor_config.json`, aunque no se especifican detalles).
- Modo de pensamiento (*thinking*) opcional, que permite razonamiento paso a paso antes de la respuesta final.
- Escritura creativa y roleplay, especialmente en la ruta de no-pensamiento, donde la abliteración es más efectiva.
- No se menciona soporte explícito de *tool calling* ni de *function calling* en la información disponible.
- No se especifican capacidades multilingües concretas, aunque el modelo base de Gemma suele soportar múltiples idiomas.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo puede generar diálogos, narrativas y personajes sin las limitaciones de contenido del modelo base, lo que lo hace útil para autores y creadores de ficción que necesitan explorar temas sensibles.
- Generación de ficción interactiva: integrable en motores de juegos de texto o chatbots de rol, donde la ausencia de censura permite respuestas más naturales y variadas.
- Análisis de imágenes con respuestas abiertas: al conservar la capacidad multimodal, puede describir o interpretar imágenes sin las restricciones de seguridad, útil en entornos de investigación donde se requiere un análisis sin sesgos de contenido.
- Asistente conversacional experimental: para probar comportamientos de modelos sin alineación en entornos controlados de investigación sobre seguridad de IA.
- Generación de contenido para proyectos artísticos: creación de guiones, poesía o diálogos que requieran un tono explícito o transgresor.
- Evaluación de técnicas de abliteración: como caso de estudio para investigadores que estudian cómo la eliminación de alineación afecta al comportamiento del modelo en diferentes tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparaciones con el modelo base o con otras versiones abliteradas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 completo ocupa aproximadamente 24 GB de memoria de GPU (según la model card). Por tanto, se necesita una GPU con al menos 24 GB de VRAM para cargar el modelo sin cuantizar.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), RTX 4090 (24 GB), RTX 6000 Ada, o GPUs de datacenter similares.
- En GPUs de consumo con menos VRAM (por ejemplo, 8 GB), no es posible cargar el modelo en BF16. La model card sugiere usar cuantización de 4 bits con `bitsandbytes` o convertir a GGUF para `llama.cpp`/`Ollama`, aunque no se proporcionan archivos GGUF en este repositorio.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), `bitsandbytes` para cuantización en 4 bits, y `llama.cpp`/`Ollama` si se genera un GGUF a partir de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `google/gemma-4-12B-it` (base) | ~12B | no disponible | Gemma | Hugging Face |
| `Vampelium/gemma-4-12B-it-heretic` | ~12B | no disponible | Gemma | Hugging Face |
| `coder3101/gemma-4-12B-it-heretic` | ~12B | no disponible | Gemma | Hugging Face |
| `igorls/gemma-4-12B-it-heretic-v1` | ~12B | no disponible | Gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo. Las versiones de otros autores (coder3101, igorls) son también abliteraciones del mismo modelo base, pero no se especifican diferencias técnicas. El modelo base `google/gemma-4-12B-it` conserva la alineación de seguridad, mientras que las versiones *heretic* la eliminan.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de su alineación de seguridad. Puede generar contenido ofensivo, violento, sexualmente explícito o ilegal según la jurisdicción. El autor declina toda responsabilidad y recuerda que el usuario es responsable del uso.
- Riesgo de alucinaciones: al igual que otros modelos de su tamaño, puede inventar hechos, citas o referencias, especialmente en temas especializados.
- La licencia Gemma de Google se aplica al modelo modificado. Esta licencia permite uso comercial con ciertas restricciones (por ejemplo, no se permite usar el modelo para generar contenido que infrinja la ley). Es recomendable revisar los términos completos en [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms).
- No se ha verificado la calidad de la abliteración: puede haber degradación en tareas de razonamiento o en la coherencia general respecto al modelo base.
- El modo de pensamiento (*thinking*) puede requerir un mayor número de tokens de salida; si se activa, hay que ajustar `max_new_tokens` para evitar respuestas truncadas.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: [Vampelium/gemma-4-12B-it-heretic](https://huggingface.co/Vampelium/gemma-4-12B-it-heretic)
- Demo pública: [https://huggingface.co/spaces/Vampelium/gemma-4-12B-it-heretic](https://huggingface.co/spaces/Vampelium/gemma-4-12B-it-heretic)
- Otras versiones similares: [coder3101/gemma-4-12B-it-heretic](https://huggingface.co/coder3101/gemma-4-12B-it-heretic), [igorls/gemma-4-12B-it-heretic-v1](https://huggingface.co/igorls/gemma-4-12B-it-heretic-v1)
- Versión GGUF en ThinkLLM: [gemma-4-12b-it-uncensored-heretic-nvfp4](https://thinkllm.dev/models/gemma-4-12b-it-uncensored-heretic-nvfp4)
- Página de GGUF en local-ai-zone: [Gemma 4 12b It Heretic - GGUF](https://local-ai-zone.github.io/models/gemma-4-12b-it-heretic.html)
- Modelo en Ollama: [HammerAI/gemma-4-12b-heretic](https://ollama.com/HammerAI/gemma-4-12b-heretic)
- Términos de licencia de Gemma: [https://ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms)
