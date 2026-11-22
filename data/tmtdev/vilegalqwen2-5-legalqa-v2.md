# tmtdev/ViLegalQwen2.5-LegalQA-V2

## Resumen

ViLegalQwen2.5-LegalQA-V2 es un ajuste fino (fine-tuning) del modelo ntphuc149/ViLegalQwen2.5-1.5B-Base, que a su vez deriva de la familia Qwen2.5 de Alibaba. Lo publica el usuario tmtdev en Hugging Face bajo licencia Apache 2.0. El modelo está orientado a tareas de respuesta a preguntas (QA) en el ámbito legal, según indica su nombre y su linaje (ViLegal), aunque la model card no documenta explícitamente el dataset de ajuste ni el dominio exacto de aplicación.

Se trata de un modelo de 1.500 millones de parámetros con arquitectura transformer densa tipo Qwen2, entrenado con la librería Unsloth para acelerar el proceso de fine-tuning. El repositorio ocupa 0,1 GB, lo que sugiere pesos en safetensors y probablemente una precisión reducida o un subconjunto de pesos; no se especifica la longitud de contexto efectiva tras el ajuste.

Su relevancia es limitada y muy específica: sirve como ejemplo de ajuste fino ligero sobre una base pequeña para un dominio vertical (legal), desplegable en hardware modesto. La información pública es escasa (cero descargas, cero likes, sin benchmarks ni model card detallada), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa tipo Qwen2 |
| Parametros totales | 1.500 millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF ni AWQ en el repositorio) |
| Idiomas soportados | en (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, heredado del checkpoint ntphuc149/ViLegalQwen2.5-1.5B-Base. Qwen2 utiliza atención con RoPE, normalización RMSNorm y sesgos de atención (QKV bias), con un vocabulario multilingüe amplio. No se trata de un modelo MoE ni de una arquitectura híbrida SSM.

El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y técnicas de ahorro de memoria (LoRA/QLoRA probablemente, aunque no se especifica). La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o supervisión directa (SFT). Tampoco se detalla la innovación técnica más allá del uso de Unsloth para acelerar el entrenamiento "2x". No hay información sobre decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto y respuesta a preguntas (QA) en el dominio legal, presumiblemente en inglés (idioma declarado).
- Razonamiento básico y comprensión de contexto, limitado por el tamaño de 1.5B parámetros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no confirmadas; la model card solo declara inglés, aunque el modelo base Qwen2.5 es multilingüe.
- No se documentan capacidades especiales como modo de pensamiento (thinking), visión o audio.

## Casos de uso

- Asistencia en consultas legales básicas: el modelo puede responder preguntas frecuentes sobre legislación o procedimientos, aprovechando su ajuste específico en QA legal, aunque la falta de benchmarks exige validación previa.
- Clasificación y extracción de información en documentos legales: con 1.5B parámetros puede procesar fragmentos de contratos o sentencias para extraer entidades o cláusulas, desplegado en local.
- Generación de borradores de respuestas legales: útil como punto de partida para redactar contestaciones a consultas, siempre con revisión humana.
- Prototipado rápido en entornos con recursos limitados: al caber en GPU de consumo, permite experimentar con fine-tuning adicional o RAG sobre normativa.
- Educación y formación jurídica: puede servir como tutor básico para explicar conceptos legales, con las advertencias de alucinación correspondientes.
- Investigación sobre ajuste fino en dominios verticales: sirve como caso de estudio de cómo Unsloth permite adaptar un modelo pequeño a un dominio concreto con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB para los pesos (1.5B × 2 bytes) más overhead de activaciones y KV cache, alrededor de 4-5 GB en total.
- En cuantización de 8 bits: ~1.5-2 GB de VRAM; en 4 bits: ~1 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM en FP16, o 4 GB en cuantización.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se generan pesos GGUF, no publicados), Ollama (previa conversión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ViLegalQwen2.5-LegalQA-V2 | 1.5B | no disponible | Apache 2.0 | Hugging Face | Ajuste legal, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face | Modelo base oficial, con benchmarks publicados |
| ntphuc149/ViLegalQwen2.5-1.5B-Base | 1.5B | no disponible | no disponible | Hugging Face | Modelo base del ajuste, orientado a legal vietnamita |
| Phi-3-mini | 3.8B | 4.096 tokens | MIT | Hugging Face | Mayor tamaño, benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen2.5 puede heredar sesgos de los datos de preentrenamiento.
- Riesgo de alucinación: alto en un modelo de 1.5B sin benchmarks ni evaluación publicada, especialmente en dominio legal donde la precisión es crítica.
- Limitaciones de contexto e idioma: la model card solo declara inglés, aunque el modelo base es multilingüe; no se confirma la longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento, lo que puede implicar riesgos legales si el dataset contenía material con derechos de autor.
- Caveat para producción: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad; no se recomienda su uso en producción sin una evaluación exhaustiva propia.
- El repositorio de 0,1 GB puede indicar pesos en precisión reducida o un subconjunto incompleto; verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tmtdev/ViLegalQwen2.5-LegalQA-V2
- Modelo base: https://huggingface.co/ntphuc149/ViLegalQwen2.5-1.5B-Base
- Unsloth: https://github.com/unslothai/unsloth
