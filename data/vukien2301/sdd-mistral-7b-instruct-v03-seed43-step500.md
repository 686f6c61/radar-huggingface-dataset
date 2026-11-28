# vukien2301/sdd-mistral-7b-instruct-v03-seed43-step500

## Resumen

`sdd-mistral-7b-instruct-v03-seed43-step500` es un checkpoint de investigación publicado por el usuario `vukien2301` en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo `mistralai/Mistral-7B-Instruct-v0.3` de Mistral AI, entrenado durante 500 pasos con semilla 43 para implementar la defensa **SDD** (Self-Destructive Defense) contra el fine-tuning malicioso (harmful fine-tuning). El modelo se produjo como línea base de comparación para el artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, usando el script `baselines/run_all.py` del repositorio asociado.

El modelo hereda la arquitectura y el tamaño del modelo base Mistral 7B Instruct v0.3, con 7.248.023.552 parámetros totales según los pesos en safetensors. Su propósito no es el despliegue en producción, sino servir como referencia experimental para estudiar si las técnicas de defensa basadas en "autodestrucción" del modelo frente a ataques de fine-tuning funcionan de forma efectiva.

Es relevante en el contexto de la seguridad de modelos abiertos: la posibilidad de que un atacante tome un modelo alineado y lo reentrene con datos dañinos es un vector de riesgo conocido, y este checkpoint forma parte de la investigación que evalúa defensas frente a ese escenario. No obstante, el propio autor advierte que no es un modelo certificado en seguridad y que su uso y licencia siguen los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el autor indica que sigue la del modelo base, Apache 2.0 para Mistral-7B-Instruct-v0.3) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 14,5 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Semilla de entrenamiento | 43 |
| Pasos de entrenamiento | 500 |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Mistral-7B-Instruct-v0.3, que emplea atención con ventana deslizante (sliding window attention), RoPE y activación SwiGLU, con 7.248 millones de parámetros. El checkpoint se generó mediante el script `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, entrenando durante 500 pasos con semilla 43.

La técnica SDD (Self-Destructive Defense) consiste, según la terminología del autor, en un mecanismo de defensa que degrada la capacidad del modelo para producir contenido dañino cuando se le somete a un fine-tuning malicioso, de modo que el propio proceso de ataque destruye la utilidad del modelo para el atacante. No se dispone en la información proporcionada de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato de chat (conversacional).
- Capacidad de código y matemáticas, en la medida en que la conserva el modelo base tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: incorpora la defensa SDD contra fine-tuning malicioso, objeto del checkpoint.
- No dispone de visión ni audio según la información disponible.

## Casos de uso

- Investigación en seguridad de modelos: servir como línea base para comparar la eficacia de la defensa SDD frente a otras defensas contra harmful fine-tuning en experimentos reproducibles con semilla fija.
- Evaluación de robustez frente a ataques de fine-tuning: reproducir el pipeline `baselines/run_all.py` y medir la degradación del modelo cuando se le aplican datasets dañinos.
- Estudio de geometría de barreras colaterales: analizar el comportamiento del modelo en el contexto del artículo *No Cheap Escape*, comparando checkpoints con distintas semillas y pasos.
- Reproducibilidad académica: al fijar semilla 43 y 500 pasos, permite replicar resultados de forma controlada en entornos de investigación.
- Análisis de alineación y salvaguardas: examinar cómo cambia la tasa de respuestas dañinas antes y después del ajuste SDD respecto al modelo base.
- Docencia y formación en seguridad de IA: usar el checkpoint como ejemplo práctico de defensa basada en autodestrucción en cursos o talleres de seguridad de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,5 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-18 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones según el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16; en RTX 3090 (24 GB) igualmente; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers, text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sdd-mistral-7b-instruct-v03-seed43-step500 | 7.248 M | no disponible | no disponible (hereda la del base) | Hugging Face, 0 descargas | Checkpoint de investigación con defensa SDD |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, sin defensa SDD |
| Mistral-7B-Instruct-v0.2 | 7.248 M | 32.768 tokens | Apache 2.0 | Hugging Face | Versión anterior del base |
| Otros checkpoints SDD del mismo autor | 7.248 M | no disponible | no disponible | Hugging Face | Variantes con otras semillas y pasos |

## Limitaciones y advertencias

- El autor indica explícitamente que no es un modelo certificado en seguridad; no debe usarse como salvaguarda en producción.
- Es un checkpoint de investigación con 0 descargas y 0 likes, sin validación comunitaria.
- Licencia no especificada en la model card; el autor remite a la del modelo base, pero conviene verificar antes de un uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Riesgo de alucinación inherente a los modelos de 7B, no cuantificado en la información disponible.
- Sesgos conocidos del modelo base Mistral-7B-Instruct-v0.3, no reevaluados tras el ajuste.
- El proceso SDD puede degradar capacidades generales del modelo como efecto colateral de la defensa; no se documenta el alcance de esa degradación.
- Longitud de contexto efectiva tras el ajuste no documentada.
- No apto para despliegue en producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/vukien2301/sdd-mistral-7b-instruct-v03-seed43-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo de referencia: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio con `baselines/run_all.py`: no disponible en la información proporcionada.
