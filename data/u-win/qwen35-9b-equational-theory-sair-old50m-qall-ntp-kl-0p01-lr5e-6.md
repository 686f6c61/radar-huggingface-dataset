# U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-6

## Resumen

El modelo `qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-6` es un ajuste fino por continued pretraining del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN y publicado en Hugging Face. Su propósito es especializar el modelo en tareas de teoría ecuacional (equational theory), un dominio de las matemáticas y la lógica que estudia las relaciones de igualdad entre términos y su manipulación formal. El nombre del repositorio codifica la receta de entrenamiento: datos SAIR, un subconjunto de 50 millones de tokens antiguos, entrenamiento con next-token prediction (NTP) y regularización KL con coeficiente 0,01, a una tasa de aprendizaje de 5e-6.

El modelo cuenta con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y se distribuye en formato safetensors bajo la librería transformers, con un tamaño de repositorio de 74,5 GB. Está etiquetado como `image-text-to-text`, lo que sugiere que hereda capacidades multimodales del modelo base, aunque la ficha oficial solo declara el idioma inglés y la tarea de generación de texto.

Su relevancia radica en ser un ejemplo de especialización vertical mediante continued pretraining sobre un modelo generalista, con regularización KL para preservar el comportamiento del modelo original. El acceso es restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B); detalles específicos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-9B, por lo que hereda la arquitectura transformer de dicho modelo base. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensiones ocultas, mecanismos de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El pipeline declarado es `text-generation`, y las etiquetas incluyen `image-text-to-text`, lo que apunta a que el modelo base es multimodal, aunque el ajuste se orienta a texto.

El entrenamiento consiste en continued pretraining sobre datasets de teoría ecuacional: `U-WIN/equational-exploratory-questions-full2182` y `U-WIN/equational-theory-sair-notes-ntp-kl-data`. La receta combina next-token prediction (NTP) con regularización KL (coeficiente 0,01) frente al modelo base, con una tasa de aprendizaje de 5e-6 y un subconjunto de 50 millones de tokens ("old50m"). El objetivo de la regularización KL es limitar la divergencia respecto al modelo original y mitigar el olvido catastrófico durante la especialización. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con especialización en contenido de teoría ecuacional y matemáticas formales.
- Razonamiento matemático y manipulación de expresiones simbólicas, derivado del entrenamiento específico en el dominio.
- Capacidades multimodales potenciales (etiqueta `image-text-to-text`), heredadas del modelo base, aunque no confirmadas en la documentación del ajuste.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la ficha.

## Casos de uso

- Asistencia en investigación en teoría ecuacional: el modelo puede generar y completar demostraciones parciales, proponer reescrituras de términos y explorar consecuencias de un conjunto de axiomas, aprovechando su continued pretraining sobre notas y preguntas del dominio.
- Generación de ejercicios y material docente: puede producir enunciados y soluciones de problemas de álgebra universal y teoría de ecuacional para cursos universitarios, con terminología especializada.
- Completado de notas técnicas y borradores formales: útil para redactar pasos intermedios en pruebas de equivalencia de teorías, dado el entrenamiento sobre notas SAIR.
- Preprocesamiento y anotación de corpus matemáticos: puede etiquetar o reformular expresiones y relaciones de igualdad en pipelines de curación de datos.
- Prototipado de asistentes conversacionales especializados: su formato conversacional permite integrarlo en interfaces de consulta sobre lógica ecuacional para estudiantes o investigadores.
- Exploración de recetas de continued pretraining: sirve como referencia reproducible para estudiar el efecto de la regularización KL y distintas tasas de aprendizaje en la especialización de modelos de ~9B.
- Evaluación de olvido catastrófico: al incluir regularización KL frente al base, es útil en experimentos que miden la retención de capacidades generales tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19-20 GB solo para los pesos (9,65B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para los pesos; en 4 bits, alrededor de 5-6 GB, aunque no se ofrecen variantes cuantizadas oficiales en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para inferencia cómoda en precisión completa; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 16 GB como RTX 4080 o 4070 Ti Super; en 8 GB requeriría cuantización agresiva no publicada.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI son compatibles con safetensors de arquitecturas Qwen; llama.cpp/Ollama requerirían conversión a GGUF no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Especialización |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-6 | 9,65B | no disponible | Apache 2.0 | Gated | Teoría ecuacional |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible en la ficha | Público | Generalista multimodal |
| U-WIN/qwen35-9b-equational-theory-mix1m-grpo200-ntp-strategy-32k | ~9B | 32k (según nombre) | no disponible | no disponible | Teoría ecuacional con GRPO |
| U-WIN/qwen35-9b-equational-theory-sair-mix1m-70n30t-thinking-grpo-200 | ~9B | no disponible | no disponible | no disponible | Teoría ecuacional con thinking y GRPO |

Los dos modelos hermanos del mismo autor comparten base y dominio, pero emplean recetas distintas (GRPO, mezclas de datos y modos de razonamiento), lo que permite comparar estrategias de especialización. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (teoría ecuacional); su rendimiento en tareas generales puede degradarse respecto al Qwen3.5-9B original pese a la regularización KL.
- Riesgo de alucinación en demostraciones matemáticas: puede generar pasos plausibles pero incorrectos; requiere verificación formal.
- Idioma limitado al inglés según la ficha; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en documentos largos.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que añade fricción para despliegues automatizados.
- Sin variantes cuantizadas oficiales publicadas; el repositorio de 74,5 GB en safetensors complica su uso en hardware limitado.
- Sin benchmarks publicados ni descargas ni valoraciones en el momento de la consulta, por lo que su calidad real no está validada por la comunidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-9B antes de un uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de preguntas exploratorias: https://huggingface.co/datasets/U-WIN/equational-exploratory-questions-full2182
- Dataset de notas NTP-KL: https://huggingface.co/datasets/U-WIN/equational-theory-sair-notes-ntp-kl-data
- Modelo hermano con GRPO y estrategia 32k: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-mix1m-grpo200-ntp-strategy-32k
- Modelo hermano con thinking y GRPO: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-mix1m-70n30t-thinking-grpo-200
