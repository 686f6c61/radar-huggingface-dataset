# taharmasmaliyev07/Qwen3.5-9B-ASR-PDEFAULT-E2-BF16

## Resumen

Qwen3.5-9B-ASR-PDEFAULT-E2-BF16 es un ajuste fino (finetune) del modelo Qwen3.5 de 9B de parámetros, publicado por el usuario taharmasmaliyev07 en Hugging Face. El modelo se distribuye en formato safetensors con pesos en BF16, tiene 9.653.104.368 parámetros totales según los metadatos reales del repositorio (19,5 GB) y está etiquetado con la pipeline `image-text-to-text`, lo que indica que conserva la torre de visión del modelo base multimodal.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según declara el autor en la model card. La nomenclatura del identificador (ASR-PDEFAULT-E2) sugiere un ajuste orientado a reconocimiento automático de voz o a un dataset específico, aunque la información pública no detalla la composición del dataset ni el objetivo exacto del entrenamiento. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Es relevante ahora porque los finetunes de la familia Qwen3.5 permiten adaptar un modelo multimodal de 9B a tareas concretas con coste de entrenamiento reducido, aunque la ausencia de documentación técnica y de benchmarks publicados limita su uso en producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), etiqueta `qwen3_5`; detalles internos no disponibles |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en BF16; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint taharmasmaliyev07/Qwen3.5-9B-ASR-PDEFAULT-E2-BF16, que a su vez pertenece a la familia Qwen3.5. La pipeline declarada es `image-text-to-text`, por lo que el modelo conserva capacidad de entrada de imagen y texto, con generación de texto como salida. La arquitectura interna concreta (número de capas, dimensiones, mecanismo de atención, torre de visión) no está documentada en la información disponible.

El entrenamiento se realizó con Unsloth y TRL, según la model card, lo que indica un ajuste supervisado (SFT) o posiblemente DPO con optimizaciones de memoria y velocidad de Unsloth. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco se detalla si el ajuste afectó a la torre de visión o solo al decoder de texto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5.
- Entrada multimodal imagen-texto según la pipeline declarada (`image-text-to-text`).
- Razonamiento y respuesta a instrucciones propias de un modelo de 9B de la familia Qwen3.5.
- Soporte de tool calling / function calling: no confirmado en la información disponible (el modelo base Qwen3.5 lo soporta habitualmente, pero el finetune no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este finetune.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de finetunes experimentales: el modelo sirve como punto de partida para comparar el efecto de un ajuste con Unsloth sobre Qwen3.5-9B en tareas de inglés, antes de decidir su adopción.
- Prototipado de asistentes conversacionales en inglés: con 9,6B de parámetros y pesos BF16, se puede desplegar en una GPU de 24 GB para pruebas de diálogo multi-turno.
- Investigación sobre ajuste eficiente: al estar entrenado con Unsloth y TRL, es útil como referencia para reproducir pipelines de SFT de bajo coste sobre modelos multimodales de 9B.
- Tareas de descripción de imágenes en inglés: la pipeline `image-text-to-text` permite generar texto a partir de imágenes en prototipos de accesibilidad o etiquetado.
- Base para nuevos finetunes: al ser Apache 2.0, se puede reutilizar como checkpoint intermedio para ajustes posteriores en dominios específicos.
- Docencia y experimentación con modelos multimodales: su tamaño (19,5 GB en BF16) permite ejecutarlo en entornos de laboratorio con una sola GPU A100 o RTX 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción; RTX 4090 (24 GB) o L40S para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-ASR-PDEFAULT-E2-BF16 (este) | 9,65B | no disponible | Apache 2.0 | sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen3.5-9B base (referencia) | ~9B | no disponible en esta ficha | Apache 2.0 (habitual en Qwen) | sí | Hugging Face |
| Otros finetunes de Qwen3.5-9B | ~9B | variable | variable | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado benchmarks ni datos de rendimiento de este finetune.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación técnica: no se puede verificar la calidad del ajuste ni su superioridad frente al modelo base.
- El modelo declara únicamente inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de 9B, agravado por la falta de evaluación publicada.
- No se detalla el dataset de entrenamiento, por lo que pueden existir sesgos desconocidos introducidos por el finetune.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El identificador sugiere un uso orientado a ASR, pero no se documenta si el modelo realiza transcripción de audio; la pipeline declarada es image-text-to-text, no audio.
- El modelo base referenciado en los metadatos es el mismo identificador, lo que impide rastrear el checkpoint original de Qwen3.5 utilizado.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-9B-ASR-PDEFAULT-E2-BF16
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Paper, blog o demo oficial del finetune: no disponible
