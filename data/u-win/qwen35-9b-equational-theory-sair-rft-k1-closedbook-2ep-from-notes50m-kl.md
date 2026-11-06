# U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto. Su especialización declarada es la "teoría ecuacional" (equational theory) en el marco de un proyecto denominado SAIR, y el entrenamiento combina SFT con Rejection Sampling Fine-Tuning (RFT) y regularización KL, partiendo de un modelo previamente entrenado con 50 millones de notas y ejecutado en modo closedbook durante 2 épocas.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio acumula 2 descargas y 0 likes en el momento de la consulta, el acceso está restringido (gated) y no se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento. Por tanto, debe considerarse un experimento de investigación más que un modelo listo para despliegue comercial. La arquitectura subyacente es la de Qwen3.5-9B (transformer multimodal), con 9.653.104.368 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 19,3 GB.

La licencia es Apache 2.0, lo que en principio permitiría uso comercial, pero la condición de acceso restringido y la ausencia de documentación sobre sesgos, datos y evaluación hacen recomendable una validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | Full fine-tune con SFT + RFT (rejection sampling) + regularización KL |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 19,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni configuración del codificador visual, ya que la model card no aporta esos datos. El pipeline declarado (`image-text-to-text`) y la etiqueta `qwen3_5` confirman la naturaleza multimodal del base.

El entrenamiento se describe mediante las etiquetas del repositorio: un full fine-tune sobre Qwen3.5-9B que combina SFT (supervised fine-tuning), RFT (rejection sampling fine-tuning) con k=1, regularización KL y un preentrenamiento previo sobre 50 millones de "notas" durante 2 épocas en modo closedbook. El nombre del modelo sugiere que el dominio objetivo es la teoría ecuacional dentro del proyecto SAIR. No se especifican el número total de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento sobre dominios especializados, presumiblemente teoría ecuacional según el nombre del modelo.
- Procesamiento de imágenes junto con texto (image-text-to-text), heredado del modelo base Qwen3.5-9B.
- Conversación multi-turno (etiqueta `conversational`).
- Ajuste fino orientado a tareas de razonamiento matemático o formal, aunque no se documenta explícitamente el alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking, visión avanzada o audio: no documentados; solo se confirma la entrada de imagen y texto.

## Casos de uso

- Investigación en teoría ecuacional: el modelo puede emplearse para generar y contrastar demostraciones o transformaciones ecuacionales en entornos académicos, dado que su ajuste se orienta explícitamente a ese dominio.
- Experimentación con RFT y regularización KL: sirve como referencia para estudiar el efecto del rejection sampling fine-tuning con k=1 y la penalización KL en modelos de 9B, comparándolo con el base Qwen3.5-9B.
- Evaluación de modelos multimodales especializados: útil para probar cómo un full fine-tune sobre un modelo image-text-to-text afecta a tareas de razonamiento formal cuando se parte de un corpus de 50 millones de notas.
- Prototipado de asistentes conversacionales de nicho: gracias a la etiqueta `conversational`, puede integrarse en demos de chat especializado, siempre que se valide su calidad frente al base.
- Reproducción de pipelines de ajuste: el repositorio documenta la receta (SFT + RFT + KL, 2 épocas, closedbook), lo que permite replicar el proceso en otros dominios con Qwen3.5-9B.
- Estudio de degradación por especialización: permite analizar si el ajuste cerrado sobre un corpus concreto reduce capacidades generales del base, un caso habitual en full fine-tunes de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB para pesos, más overhead; en 4 bits, alrededor de 5-6 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado.
- Compatibilidad con GPU de consumo: sí en RTX 4090 para FP16 con contexto limitado; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles según la etiqueta `endpoints_compatible`; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl | 9,65 B | no disponible | Apache 2.0 | Restringido (gated) | Full fine-tune especializado en teoría ecuacional |
| Qwen/Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible en esta ficha | Público (base) | Modelo base multimodal image-text-to-text |
| Alternativas de 9B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas concretas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad frente al modelo base ni frente a alternativas.
- Riesgo de sobreajuste al dominio: el ajuste closedbook de 2 épocas sobre 50 millones de notas puede degradar capacidades generales del base Qwen3.5-9B.
- Idiomas no documentados: no se puede garantizar un rendimiento multilingüe adecuado.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Riesgo de alucinación: inherente a los modelos generativos y no evaluado en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y la condición gated exigen validación propia antes de producción.
- Contexto máximo no especificado: no se puede planificar el uso en tareas de contexto largo sin verificar la configuración del base.
- Comunidad mínima (2 descargas, 0 likes): sin señales de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
