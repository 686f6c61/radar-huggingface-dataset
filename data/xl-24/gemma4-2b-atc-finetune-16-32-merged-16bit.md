# xl-24/gemma4-2b-atc-finetune-16-32-merged-16bit

## Resumen

`xl-24/gemma4-2b-atc-finetune-16-32-merged-16bit` es un ajuste fino (fine-tuning) del modelo multimodal `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, publicado por el usuario xl-24. Se trata de un modelo de la familia Gemma 4 con capacidad image-text-to-text (procesa imagen y texto y genera texto), entrenado con la librería Unsloth y el stack TRL de Hugging Face. El nombre del repositorio sugiere una especialización orientada a "ATC" (control de tráfico aéreo, aunque el autor no lo especifica en la model card) y una fusión de adaptadores LoRA a precisión de 16 bits.

El modelo resuelve el problema de disponer de un Gemma 4 pequeño (aprox. 5.120 millones de parámetros en el checkpoint publicado) ya alineado para una tarea conversacional concreta, listo para desplegarse con `transformers` y compatible con Text Generation Inference. Su relevancia radica en que parte de una base cuantizada en 4 bits (bnb) y se ha fusionado a 16 bits, lo que facilita su uso en pipelines estándar sin adaptadores separados.

La información publicada por el autor es muy escasa: no hay detalle del dataset, del número de tokens de entrenamiento, ni de benchmarks. Los datos disponibles provienen de los metadatos del repositorio y de la model card, que se limita a indicar el modelo base, la licencia Apache 2.0, el idioma inglés y que se entrenó con Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, multimodal image-text-to-text) |
| Parámetros totales | 5.123.178.051 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Base de partida en 4 bits (bnb); checkpoint publicado en 16 bits (merged); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo más allá de su pertenencia a la familia Gemma 4 y de su pipeline multimodal image-text-to-text. El checkpoint publicado tiene 5.123.178.051 parámetros en safetensors y un tamaño de repositorio de 10,3 GB, coherente con pesos en 16 bits. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones, ni la composición del dataset de entrenamiento.

El proceso de entrenamiento, según la model card, consistió en un ajuste fino realizado con Unsloth y la librería TRL de Hugging Face sobre el modelo `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. El nombre del repositorio indica que los adaptadores se fusionaron (merged) en el modelo base y se exportaron en 16 bits. No se detalla si hubo RLHF, DPO, número de tokens de entrenamiento ni la composición del corpus de ajuste.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de pipeline text-generation-inference.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto como entrada, según el pipeline declarado.
- Ajuste fino orientado a una tarea específica (el autor no documenta cuál; el sufijo "atc" sugiere dominio de tráfico aéreo, sin confirmación).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según los metadatos de idioma.
- Capacidades especiales (thinking mode, audio, visión adicional): visión por imagen-texto según pipeline; el resto no disponible.

## Casos de uso

- Asistente conversacional especializado: al ser un modelo ajustado sobre una base instruct, puede emplearse para respuestas multi-turno en inglés en el dominio para el que fue entrenado.
- Análisis de imágenes con descripción textual: gracias a su pipeline image-text-to-text, puede recibir una imagen y generar texto asociado, útil para tareas de captioning o inspección visual documental.
- Prototipado rápido de aplicaciones de visión-lenguaje: su tamaño (~5,1 mil millones de parámetros) y licencia Apache 2.0 permiten integrarlo en entornos de experimentación sin coste de licencia.
- Despliegue en infraestructura propia con TGI: la compatibilidad con text-generation-inference permite servirlo con batching continuo en GPUs de gama media-alta.
- Base para nuevos ajustes finos: al estar publicado en 16 bits y safetensors, sirve como punto de partida para fine-tunings adicionales con Unsloth o TRL sin partir de cuantización 4 bits.
- Evaluación comparativa de ajustes: útil como referencia para medir el efecto del fine-tuning frente al modelo base `gemma-4-E2B-it` en tareas concretas de dominio.
- Tareas de clasificación o extracción sobre texto e imagen en inglés: aprovechando la generación condicionada, se puede formatear la salida para extracción estructurada, aunque no se documenta soporte explícito de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 10,3 GB solo para pesos, más memoria para KV cache y activaciones; se recomienda un mínimo de 14-16 GB de VRAM para contexto corto.
- VRAM estimada con cuantización a 8 bits: en torno a 6-7 GB de pesos, viable en GPUs de 8-12 GB.
- VRAM estimada con cuantización a 4 bits: en torno a 3-4 GB de pesos, viable en GPUs consumer de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para producción con lotes grandes; RTX 4090 (24 GB) para inferencia en 16 bits con margen; RTX 3090/4080 (16-24 GB) para 16 bits con contexto moderado; RTX 4060 Ti 16 GB o similares para 8 bits.
- Cabe en GPU consumer: sí, en 16 bits en tarjetas de 16 GB o más con contexto contenido; en 8 o 4 bits en tarjetas de 8 GB.
- Opciones de despliegue: `transformers`, Text Generation Inference (declarado compatible con endpoints), Unsloth para fine-tuning; llama.cpp/Ollama y vLLM no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune-16-32-merged-16bit | 5.123.178.051 | no disponible | apache-2.0 | Sí (image-text-to-text) | Hugging Face |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (modelo base) | no disponible | no disponible | no disponible | Sí (image-text-to-text) | Hugging Face |
| Gemma 4 E2B-it (modelo original) | no disponible | no disponible | no disponible | Sí | Hugging Face / Google |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce el dominio exacto y los posibles sesgos introducidos por el ajuste fino.
- Riesgo de alucinación inherente a los modelos generativos; no se ha evaluado su tasa de error en la información disponible.
- Soporte de idioma limitado al inglés según los metadatos; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales que el autor no detalla.
- El nombre del repositorio sugiere una especialización ("atc") que no está documentada ni validada con benchmarks; no debe asumirse un rendimiento específico en ese dominio.
- No se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones o documentos largos.
- El proceso de fusión de adaptadores a 16 bits puede introducir diferencias respecto al comportamiento del adaptador original en 4 bits; no se documenta una evaluación de esta diferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune-16-32-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en la información proporcionada
- Paper de Gemma 4: no disponible en la información proporcionada
