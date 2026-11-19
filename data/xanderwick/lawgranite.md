# xanderwick/LawGranite

## Resumen

LawGranite es un ajuste fino (fine-tune) del modelo IBM Granite 4.2 8B, publicado por el usuario xanderwick en Hugging Face. El modelo parte de la base `ibm-granite/granite-4.2-8b` y se ha especializado en el dominio legal mediante DPO (Direct Preference Optimization) sobre una base conversacional. Con 8.791.592.960 parámetros totales, se posiciona en la gama de modelos de 8B orientados a generación de texto con especialización vertical.

La relevancia de este modelo radica en su enfoque: en lugar de un ajuste fino genérico, aplica DPO para alinear las respuestas hacia el dominio legal en inglés. Esto lo hace potencialmente útil para tareas de asistencia jurídica, análisis de contratos o consultas normativas, aunque su naturaleza de proyecto individual (0 descargas, 0 likes en el momento de la ficha) implica que no cuenta con validación comunitaria ni benchmarks publicados.

El acceso al modelo está restringido (gated) en Hugging Face, lo que requiere aceptar condiciones antes de su descarga. El repositorio ocupa 70,3 GB, un tamaño considerable para un modelo de 8B, lo que sugiere la presencia de múltiples formatos de pesos o checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.2 8B) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LawGranite se construye sobre IBM Granite 4.2 8B, un transformer denso de 8.791.592.960 parámetros. El proceso de entrenamiento incluye una fase de ajuste fino supervisado seguida de DPO (Direct Preference Optimization), según indican las etiquetas del repositorio (`dpo`, `conversational`, `legal`). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset legal utilizado ni los hiperparámetros del DPO.

La innovación técnica principal es la aplicación de DPO para alinear el modelo hacia preferencias en el dominio legal, lo que en teoría reduce respuestas genéricas y mejora la adecuación a terminología y razonamiento jurídico. No obstante, no se han publicado detalles sobre la metodología, el dataset de preferencias ni métricas de evaluación.

## Capacidades

- Generación de texto conversacional en inglés con especialización en dominio legal.
- Razonamiento jurídico y análisis de textos normativos (presuntamente, por el ajuste DPO en legal).
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Capacidad de generación de texto general heredada del modelo base Granite 4.2 8B.
- Soporte de tool calling / function calling: no disponible (no confirmado para este fine-tune).
- Soporte de agentes y multi-step reasoning: no disponible (no confirmado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `en`.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistencia en consultas legales: el modelo puede generar respuestas en inglés sobre terminología jurídica y conceptos normativos, aprovechando el ajuste DPO para alinear el tono y la precisión hacia el dominio legal.
- Análisis de contratos y documentos legales: puede resumir o extraer cláusulas de textos jurídicos en inglés, gracias a su especialización y a la base conversacional.
- Generación de borradores de documentos legales: útil para redactar plantillas de cláusulas, avisos o correspondencia jurídica en inglés, con la ventaja de un modelo ajustado por preferencias.
- Soporte en educación jurídica: puede explicar conceptos legales a estudiantes o profesionales no expertos, manteniendo un registro conversacional.
- Preprocesamiento en pipelines de revisión documental: integrable vía `transformers` para tareas de clasificación o extracción de información en textos legales en inglés.
- Chatbot de atención legal automatizada: puede gestionar conversaciones multi-turno con usuarios que planteen consultas jurídicas básicas en inglés, aunque requiere supervisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 17,6 GB (2 bytes por parámetro para 8,79B parámetros), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~8,8 GB; en 4 bits: ~4,4 GB (estimaciones teóricas, no confirmadas para este modelo).
- GPU recomendadas: A100 40GB, H100 80GB para FP16 sin cuantizar; RTX 4090 (24GB) para FP16 con margen ajustado o cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24GB) con FP16 o cuantización; en GPUs de 16GB (RTX 4080, 4070 Ti Super) probablemente solo con cuantización a 8 bits o 4 bits.
- Opciones de despliegue: `transformers` (librería indicada en el repo), potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Especialización |
|---|---|---|---|---|---|
| LawGranite | 8,79B | no disponible | no disponible | Gated en HF | Legal (DPO) |
| IBM Granite 4.2 8B (base) | 8B | no disponible | no disponible | Público en HF | General |
| Modelos legales 7B-8B (p. ej., fine-tunes de Llama/Mistral) | ~7-8B | variable | variable | variable | Legal |

No se dispone de datos de rendimiento comparativo para LawGranite. La comparativa se limita a parámetros y disponibilidad, sin benchmarks que permitan evaluar su calidad relativa frente a alternativas legales de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune sobre Granite 4.2, hereda los sesgos del modelo base, no evaluados en este repositorio.
- Riesgo de alucinación: elevado en dominio legal, donde las respuestas incorrectas pueden tener consecuencias graves; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: solo inglés (`en`); la longitud de contexto no está confirmada.
- Restricciones de licencia para uso comercial: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; además, el acceso es restringido (gated), lo que añade condiciones adicionales.
- Caveats para producción: 0 descargas y 0 likes indican falta de validación comunitaria; no hay benchmarks, ni documentación de entrenamiento, ni garantías de calidad; el tamaño del repo (70,3 GB) sugiere posibles artefactos redundantes. No se recomienda su uso en producción sin una evaluación exhaustiva propia.

## Enlaces

- Hugging Face: https://huggingface.co/xanderwick/LawGranite
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
