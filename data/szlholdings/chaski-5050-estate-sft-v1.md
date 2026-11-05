# SZLHOLDINGS/chaski-5050-estate-sft-v1

## Resumen

chaski-5050-estate-sft-v1 es un ajuste fino (SFT) del modelo Qwen/Qwen3.5-0.8B, publicado por SZLHOLDINGS bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text orientado a generación de texto conversacional, con un total de 873.438.784 parámetros (aproximadamente 0,87 mil millones). El modelo se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

El modelo parte de la arquitectura Qwen3.5, una familia de transformers densos, y ha sido entrenado con la librería Unsloth junto con TRL de Hugging Face, según indica el autor. La model card es extremadamente escueta: no detalla el dataset de ajuste, el número de tokens de entrenamiento, ni los hiperparámetros empleados. El nombre del modelo sugiere un ajuste orientado al dominio inmobiliario ("estate"), aunque esta especialización no se documenta de forma explícita.

Su relevancia actual es limitada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica adicional. Resulta útil como ejemplo de ajuste fino ligero de un modelo multimodal pequeño para tareas conversacionales específicas, pero no constituye una referencia de rendimiento ni de calidad contrastada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; compatible con cuantización posterior vía herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5 con aproximadamente 0,87 mil millones de parámetros. La pipeline declarada es image-text-to-text, lo que indica que el modelo base incorpora capacidades multimodales de entrada (imagen y texto), aunque la model card no detalla la arquitectura del codificador visual ni la estrategia de fusión multimodal. El ajuste se realizó mediante SFT (supervised fine-tuning) utilizando Unsloth y la librería TRL de Hugging Face, según declara el autor.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, el uso de RLHF o DPO, ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El nombre "estate" sugiere un corpus del sector inmobiliario, pero no se confirma en la documentación. No hay datos sobre la longitud de contexto efectiva tras el ajuste ni sobre posibles modificaciones del tokenizador.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), con capacidad multimodal de entrada según la pipeline declarada.
- Ajuste fino supervisado orientado presumiblemente a conversaciones del dominio inmobiliario (no confirmado en la documentación).
- Compatibilidad con text-generation-inference y transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de atención inmobiliaria: el modelo puede gestionar diálogos multi-turno en inglés sobre consultas de propiedades, dado su ajuste presumiblemente orientado al sector "estate", aunque la longitud de contexto no está documentada.
- Clasificación y extracción de información de anuncios inmobiliarios: al ser un modelo pequeño (0,87 B), puede desplegarse en entornos con recursos limitados para tareas de extracción de entidades (precio, superficie, ubicación) a partir de texto.
- Descripción automática de imágenes de propiedades: gracias a su pipeline image-text-to-text, puede generar descripciones textuales de fotografías de inmuebles, siempre que se valide la calidad del ajuste multimodal.
- Prototipado rápido de chatbots de dominio: su tamaño reducido permite iterar y desplegar prototipos en GPU de consumo con cuantización, útil para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de respuestas en pipelines de TGI: compatible con text-generation-inference, puede integrarse en servicios de inferencia estándar para pruebas de concepto.
- Fine-tuning posterior o destilación: al ser Apache 2.0 y estar en safetensors, sirve como punto de partida para ajustes adicionales en dominios relacionados con el inmobiliario o la conversación multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1,0 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp/Ollama (previa conversión a GGUF), vLLM (si el soporte de la arquitectura Qwen3.5 multimodal está disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chaski-5050-estate-sft-v1 | 873 M | No disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | No disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| SmolVLM-500M | ~500 M | No disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-3B | ~3 B | No disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma categoría (multimodales pequeños). No hay datos de rendimiento publicados para chaski-5050-estate-sft-v1 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, hiperparámetros, contexto efectivo ni evaluación, lo que impide validar la calidad del ajuste.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin benchmarks ni evaluación humana publicada, el riesgo es difícil de cuantificar.
- Especialización no confirmada: el nombre sugiere dominio inmobiliario, pero no se documenta el corpus de ajuste ni su cobertura.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está especificada; no se debe asumir la del modelo base sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base Qwen3.5-0.8B.
- Modelo sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción ni validación por la comunidad.
- Capacidades multimodales: aunque la pipeline es image-text-to-text, no se documenta si el ajuste SFT preserva o degrada las capacidades visuales del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-5050-estate-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
