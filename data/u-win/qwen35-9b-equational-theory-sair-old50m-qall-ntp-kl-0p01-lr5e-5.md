# U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-5

## Resumen

U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-5 es un ajuste fino (continued pretraining) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario U-WIN y publicado en Hugging Face. El modelo parte de la arquitectura multimodal de Qwen3.5 (etiquetado como image-text-to-text) y se especializa en teoría ecuacional (equational theory), un subcampo del algebra abstracta y la lógica ecuacional, mediante un proceso de preentrenamiento continuado sobre datasets propios del autor centrados en notas y preguntas exploratorias de teoría ecuacional.

El entrenamiento combina objetivos de next-token prediction (NTP) con regularización KL (kl-regularization, peso 0,01) y un esquema denominado "q-all", con una tasa de aprendizaje de 5e-5 y un presupuesto de datos de aproximadamente 50 millones de tokens ("old50m"). El resultado es un modelo de 9.653.104.368 parámetros (unos 9,65 mil millones) que conserva las capacidades generales del base Qwen3.5-9B pero orientado a la generación y razonamiento sobre teoría ecuacional.

Es relevante para investigadores que trabajan en dominios matemáticos especializados y quieren evaluar hasta qué punto el preentrenamiento continuado con regularización KL preserva las capacidades del modelo base mientras incorpora conocimiento de dominio. Su acceso está restringido (gated) y la información pública disponible es escasa: no se han publicado benchmarks ni detalles completos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,65 mil millones de parámetros orientado a tareas image-text-to-text. Sobre esa base se aplica un preentrenamiento continuado (continued pretraining) con un objetivo de next-token prediction (NTP) combinado con regularización KL de peso 0,01, presumiblemente para anclar la distribución del modelo ajustado a la del modelo base y mitigar el olvido catastrófico durante la especialización en el dominio.

El corpus de entrenamiento procede de datasets propios del autor: U-WIN/equational-theory-sair-notes-ntp-kl-data y U-WIN/equational-exploratory-questions-full2182, centrados en notas y preguntas exploratorias de teoría ecuacional. El identificador indica un presupuesto de unos 50 millones de tokens ("old50m"), un esquema "q-all" y una tasa de aprendizaje de 5e-5. No se dispone de información sobre la composición exacta del dataset, el número total de tokens efectivos, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-9B.
- Razonamiento y generación sobre teoría ecuacional: definiciones, propiedades de ecuaciones, manipulación simbólica descriptiva y preguntas exploratorias del dominio.
- Procesamiento image-text-to-text (entrada de imagen y texto), según la etiqueta del pipeline del modelo base.
- Soporte de tool calling / function calling: no confirmado en la información disponible (el base Qwen3.5 probablemente lo soporta, pero no se verifica para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste.
- Capacidades multilingües: limitadas al inglés según la tarjeta del modelo.
- Modo thinking, visión o audio: la etiqueta image-text-to-text sugiere entrada de imagen; no se detalla el resto.

## Casos de uso

- Investigación en lógica ecuacional: el modelo puede generar y completar notas técnicas sobre teoría ecuacional, útil para explorar cómo el preentrenamiento continuado con KL preserva el conocimiento del base mientras incorpora terminología y patrones del dominio.
- Generación de preguntas exploratorias: a partir del dataset de preguntas del autor, sirve para producir variantes y borradores de preguntas de investigación en teoría ecuacional que un investigador puede revisar y refinar.
- Asistente de estudio especializado: conversación multi-turno en inglés sobre conceptos de algebra abstracta y ecuaciones, aprovechando el ajuste de dominio para respuestas más alineadas con la terminología del área.
- Evaluación de olvido catastrófico: al estar entrenado con regularización KL frente al base, es un caso de estudio para medir cuánto conocimiento general retiene tras el ajuste de dominio.
- Prototipado de pipelines de preentrenamiento continuado: el identificador documenta hiperparámetros (lr 5e-5, KL 0,01, 50M tokens) que permiten reproducir o comparar recetas de ajuste sobre Qwen3.5-9B.
- Análisis multimodal de material matemático: gracias a la naturaleza image-text-to-text del base, puede emplearse para describir o transcribir figuras y notación matemática en imágenes, siempre que se valide su calidad en este ajuste concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 19-20 GB solo para pesos (9,65 mil millones de parámetros), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- En cuantización de 8 bits: aproximadamente 10-11 GB de pesos; en 4 bits: aproximadamente 5-6 GB de pesos, aunque no se confirman formatos GGUF publicados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16; RTX 4090 (24 GB) viable en fp16 con contexto moderado o en cuantización para contextos mayores.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB con cuantización de 8 bits; en 4 bits podría caber en GPUs de 8-12 GB, sujeto a la disponibilidad de pesos cuantizados.
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM, TGI, llama.cpp u Ollama no están confirmados para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-5 | 9,65 B | no disponible | Teoría ecuacional | apache-2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible | General multimodal | no disponible en la información | Público (presumiblemente) |
| U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-50m-kl-0p01 | ~9,65 B | no disponible | Teoría ecuacional | no disponible | No indicado |
| U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-350m-kl-0p01 | ~9,65 B | no disponible | Teoría ecuacional | no disponible | No indicado |

Las variantes de U-WIN difieren en el presupuesto de datos (50M frente a 350M tokens) y en la composición del dataset ("old50m" y "qall" frente a "notes"), lo que permite comparar el efecto del volumen de datos y del corpus en el ajuste de dominio.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Idiomas: la tarjeta declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de olvido catastrófico: aunque se emplea regularización KL (0,01), el ajuste de dominio puede degradar capacidades generales del base; no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinación: en un dominio matemático especializado, el modelo puede generar definiciones o resultados plausibles pero incorrectos; requiere validación por expertos.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuyos términos no se detallan en la información proporcionada.
- Documentación escasa: no se publican detalles de composición del dataset, contexto máximo ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o evaluación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-old50m-qall-ntp-kl-0p01-lr5e-5
- Variante con 50M tokens y notas: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-50m-kl-0p01
- Variante con 350M tokens y notas: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-350m-kl-0p01
- Árbol de ficheros de la variante de 50M: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes-ntp-50m-kl-0p01/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de preguntas exploratorias: https://huggingface.co/datasets/U-WIN/equational-exploratory-questions-full2182
- Dataset de notas NTP-KL: https://huggingface.co/datasets/U-WIN/equational-theory-sair-notes-ntp-kl-data
