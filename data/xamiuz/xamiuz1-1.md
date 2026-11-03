# xamiuz/xamiuz1.1

## Resumen

xamiuz1.1 es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario xamiuz en HuggingFace. Se trata de un modelo derivado de la versión cuantizada en 4 bits de Unsloth (unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit), entrenado con la librería Unsloth y la pila TRL/transformers. La model card es mínima: no documenta el dataset de entrenamiento, el objetivo del ajuste ni los hiperparámetros utilizados, por lo que la información disponible sobre el proceso de entrenamiento es muy limitada.

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct original: un transformer decoder-only de 8.030 millones de parámetros con una ventana de contexto de 128.000 tokens, entrenado originalmente por Meta con datos multilingües y alineado mediante RLHF y DPO. El ajuste fino de xamiuz se ha realizado presumiblemente sobre una GPU de consumo con Unsloth, que acelera el entrenamiento mediante kernels optimizados y reduce el uso de memoria.

La relevancia de este modelo es limitada en el momento de su publicación: cuenta con cero descargas y cero likes, no incluye documentación sobre el propósito del ajuste ni resultados de evaluación, y el repositorio ocupa solo 0,2 GB (lo que sugiere pesos en precisión reducida o un subconjunto de los mismos). Debe tratarse como un experimento personal sin garantías de calidad ni de reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030 millones (heredados del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantización | No disponible (el modelo base de partida es bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base soporta oficialmente 8 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). Meta entrenó el modelo original con aproximadamente 15 billones de tokens y lo alineó mediante RLHF y DPO. La ventana de contexto nativa es de 128.000 tokens.

El ajuste fino de xamiuz se realizó con Unsloth, una librería que implementa kernels Triton personalizados para acelerar el entrenamiento y reducir el consumo de VRAM, combinada con TRL. La model card únicamente indica que el entrenamiento fue "2x más rápido" gracias a Unsloth. No se especifica el dataset, el número de pasos, la tasa de aprendizaje, si se usó LoRA/QLoRA ni si se aplicaron técnicas de alineación adicionales. El repositorio ocupa 0,2 GB, un tamaño anómalamente pequeño para un modelo de 8B en safetensors de precisión completa (que rondaría los 16 GB), lo que sugiere pesos cuantizados, un adaptador LoRA o una subida incompleta.

## Capacidades

- Generación de texto y razonamiento general, heredados del Llama 3.1 8B Instruct.
- Generación de código y resolución de problemas matemáticos básicos.
- Soporte de tool calling y function calling (nativo en Llama 3.1 Instruct).
- Capacidad para flujos de agentes y razonamiento multi-paso.
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque la model card solo declara inglés.
- No se documentan capacidades de visión ni audio.
- No se documenta un modo "thinking" explícito.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 128.000 tokens heredados), útil para pruebas de concepto en las que se quiera evaluar un ajuste fino personalizado.
- Experimentación con fine-tuning: sirve como referencia para desarrolladores que quieran reproducir el flujo de Unsloth + TRL sobre Llama 3.1 8B Instruct.
- Generación de código en entornos de desarrollo: puede integrarse en editores o pipelines para autocompletar y explicar fragmentos de código, aunque sin garantías de calidad por la falta de evaluación.
- Extracción de información de documentos largos: la ventana de contexto permite procesar contratos o informes extensos en una sola pasada.
- Clasificación y etiquetado de texto: mediante prompts few-shot para tareas de categorización.
- Base para investigación académica sobre ajuste fino eficiente en memoria: el modelo ilustra el uso de QLoRA/Unsloth sobre un modelo de 8B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones propias ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16, 8-9 GB en cuantización de 8 bits y 5-6 GB en 4 bits (estimaciones para un modelo de 8B; no verificadas para este ajuste concreto).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 sin contexto extendido; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, etc.).
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp y Ollama (previa conversión a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xamiuz1.1 | 8.030 M | 128.000 | Apache 2.0 | HuggingFace (0 descargas) |
| Meta Llama 3.1 8B Instruct | 8.030 M | 128.000 | Llama 3.1 Community License | HuggingFace, ampliamente adoptado |
| Mistral 7B Instruct | 7.240 M | 32.000 | Apache 2.0 | HuggingFace, ampliamente adoptado |
| Qwen2.5 7B Instruct | 7.620 M | 131.072 | Apache 2.0 | HuggingFace, ampliamente adoptado |

No se dispone de datos de rendimiento comparativo para xamiuz1.1. El modelo base Llama 3.1 8B Instruct es la referencia natural, pero no se ha verificado que el ajuste fino preserve o mejore sus capacidades.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: imposible evaluar sesgos introducidos por el ajuste.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al modelo base, dado que no hay evaluaciones publicadas.
- El repositorio de 0,2 GB es sospechosamente pequeño para un modelo de 8B; podría contener pesos incompletos, cuantizados o un adaptador, lo que impediría su uso directo con transformers sin verificación.
- Solo se declara inglés en la model card, aunque el modelo base soporta más idiomas.
- La licencia Apache 2.0 se aplica al ajuste, pero el uso debe respetar también la Llama 3.1 Community License del modelo base original de Meta.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- [HuggingFace: xamiuz/xamiuz1.1](https://huggingface.co/xamiuz/xamiuz1.1)
- [Modelo base: unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [Meta Llama 3.1](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
