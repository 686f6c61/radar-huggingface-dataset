# U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr2e-5

## Resumen

El modelo `qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr2e-5` es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN. Se trata de un checkpoint intermedio dentro de una cadena de entrenamiento orientada a la internalización de teoría ecuacional (equational theory), un subcampo de las matemáticas y la lógica algebraica. El nombre codifica la receta de entrenamiento: datos SAIR (presumiblemente un corpus de notas o preguntas sobre teoría ecuacional), 50 millones de tokens de preentrenamiento continuado, entrenamiento con next-token prediction (NTP) y regularización KL con coeficiente 0,01, además de una tasa de aprendizaje de 2e-5.

El modelo mantiene la arquitectura completa de Qwen3.5-9B con 9.653.104.368 parámetros totales, lo que lo sitúa en la categoría de modelos densos de ~9B. Aunque la pipeline declarada es text-generation y los idiomas soportados se limitan al inglés, las etiquetas incluyen image-text-to-text, lo que sugiere que hereda capacidades multimodales del modelo base. El repositorio ocupa 74,5 GB, un tamaño coherente con pesos en precisión completa (probablemente bf16 o fp32) para un modelo de casi 10B de parámetros.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación dentro de una cadena experimental de octubre de 2026, con acceso restringido (gated) y sin descargas ni interacciones registradas en el momento de la consulta. No obstante, resulta interesante como ejemplo de preentrenamiento continuado con regularización KL para preservar capacidades generales mientras se especializa el modelo en un dominio matemático concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text según tags; no se detalla la variante exacta |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el tamaño del repo, 74,5 GB, sugiere precisión completa) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9,65 mil millones de parámetros. Sobre esta base se aplica un preentrenamiento continuado (continued pretraining) con next-token prediction sobre un corpus de teoría ecuacional denominado SAIR, con 50 millones de tokens ("old50m" en el identificador). La innovación metodológica principal es el uso de regularización KL con coeficiente 0,01 respecto al modelo de referencia, una técnica habitual para evitar el olvido catastrófico y mantener las capacidades generales del modelo base mientras se especializa en el dominio objetivo.

El identificador incluye "qall", que probablemente indica que el entrenamiento utilizó todos los datos disponibles del corpus (Q-all), y "lr2e-5" fija la tasa de aprendizaje en 2e-5. No se dispone de información sobre la composición exacta del dataset, el número total de pasos, el hardware empleado ni si hubo fases posteriores de RLHF o DPO en este checkpoint concreto. Los datasets referenciados en las etiquetas son `U-WIN/equational-exploratory-questions-full2182` y `U-WIN/equational-theory-sair-notes-ntp-kl-data`.

## Capacidades

- Generación de texto y razonamiento matemático especializado en teoría ecuacional, gracias al preentrenamiento continuado sobre el corpus SAIR.
- Conversación multi-turno (etiqueta conversational).
- Procesamiento image-text-to-text heredado del modelo base Qwen3.5-9B, según las etiquetas del repositorio.
- Generación de texto condicionada por contexto (pipeline text-generation).
- Capacidades generales del modelo base presumiblemente preservadas mediante la regularización KL, aunque no se documenta su magnitud.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la tarjeta del modelo.

## Casos de uso

- Investigación en internalización de conocimiento matemático: el modelo sirve como checkpoint intermedio para estudiar cómo el preentrenamiento continuado con regularización KL afecta a la retención de capacidades generales frente a la especialización en teoría ecuacional.
- Generación de borradores de demostraciones algebraicas: dado un enunciado de teoría ecuacional, el modelo puede producir pasos de prueba en inglés, útil como asistente en entornos de investigación formal.
- Experimentos de olvido catastrófico: al comparar este checkpoint con otros de la misma cadena (por ejemplo, variantes sin KL o con distintos volúmenes de datos), se puede cuantificar el efecto de la regularización sobre benchmarks generales.
- Evaluación de cadenas de ajuste fino: útil para replicar la metodología NTP + KL en otros dominios científicos con presupuestos de datos reducidos (50M de tokens).
- Docencia y divulgación de lógica algebraica: generación de explicaciones y ejemplos en inglés sobre identidades y variedades ecuacionales, siempre con revisión humana.
- Base para fases posteriores de RFT (rejection fine-tuning): la cadena de U-WIN incluye checkpoints posteriores como `rft-k1-closedbook-2ep-from-notes50m-kl`, lo que sugiere que este modelo actúa como punto de partida para etapas de refinamiento con pruebas verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB; en 4 bits: en torno a 6-7 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, o en GPUs de 16 GB con cuantización de 8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01 | 9,65B | no disponible | Apache 2.0 | Gated | Finetune especializado en teoría ecuacional |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 (según modelo base) | Público | Modelo generalista multimodal del que deriva |
| U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-50m-kl-0p01 | ~9B | no disponible | Apache 2.0 | Público (según enlace) | Variante de la misma cadena, solo con notas |
| U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl | ~9B | no disponible | Apache 2.0 | Público (según enlace) | Etapa posterior con RFT y pruebas juzgadas |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y su reproducibilidad.
- Especialización estrecha: el entrenamiento se centra en teoría ecuacional y en inglés; el rendimiento en tareas generales puede degradarse respecto al modelo base pese a la regularización KL.
- Riesgo de alucinación: como todo modelo generativo, puede producir demostraciones o identidades algebraicas plausibles pero incorrectas; requiere verificación formal en producción.
- Idiomas: solo se declara inglés, sin garantías de calidad en castellano u otras lenguas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento ni comparaciones verificables con el modelo base.
- Checkpoint intermedio: forma parte de una cadena experimental y no está pensado como producto final; su sucesor con RFT puede ser más adecuado para uso práctico.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datasets empleados.
- Fecha de creación futura (2026): los metadatos deben tratarse con cautela hasta confirmar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr2e-5
- Variante notes-ntp-50m-kl: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-50m-kl-0p01
- Variante RFT K1 closed-book: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-rft-k1-closedbook-2ep-from-notes50m-kl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de preguntas exploratorias: https://huggingface.co/datasets/U-WIN/equational-exploratory-questions-full2182
- Dataset de notas NTP+KL: https://huggingface.co/datasets/U-WIN/equational-theory-sair-notes-ntp-kl-data
