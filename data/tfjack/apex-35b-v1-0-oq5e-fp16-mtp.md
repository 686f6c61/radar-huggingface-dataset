# tfjack/Apex-35B-V1.0-oQ5e-fp16-mtp

## Resumen

Apex-35B-V1.0-oQ5e-fp16-mtp es una cuantización mixta del modelo base Apex-35B-V1.0, un modelo de lenguaje de tipo Mixture-of-Experts (etiqueta `qwen3_5_moe`) con aproximadamente 35.950 millones de parámetros totales. La versión aquí descrita ha sido generada por el usuario tfjack mediante la herramienta oQ (oMLX v0.7.3), un esquema de cuantización de precisión mixta orientado al runtime MLX de Apple Silicon. El checkpoint combina capas en 5, 6 y 8 bits con grupos de 64 y 128, más una pequeña fracción en FP16 y FP32, alcanzando un promedio efectivo de 6,033 bits por peso.

El modelo incluye, además del tronco lingüístico (34.661 millones de parámetros lógicos), un codificador de visión de 0,447 millones de parámetros y una cabeza MTP (Multi-Token Prediction) de 0,845 millones, lo que sugiere capacidades multimodales y decodificación especulativa nativa. El repositorio ocupa 27,1 GB en disco, con pesos en formato safetensors y librería MLX, lo que lo hace desplegable en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra).

Su relevancia radica en que demuestra un flujo práctico de cuantización mixta para modelos MoE multimodales grandes sobre MLX: mantiene capas sensibles (atención, proyecciones de visión y cabeza MTP) en 8 bits o superior, mientras comprime el resto del tronco a 5 bits, equilibrando calidad y huella de memoria. No obstante, al ser un artefacto de cuantización de un modelo del que no se publican detalles de entrenamiento, licencia ni idiomas en la información disponible, su evaluación debe hacerse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (etiqueta `qwen3_5_moe`), transformer con cabeza MTP y codificador de visión |
| Parámetros totales | 35.951.822.704 (35,952 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16 y FP32; promedio efectivo 6,033 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de tipo Mixture-of-Experts, según la etiqueta `qwen3_5_moe` del repositorio, presumiblemente derivada de la familia Qwen 3.5 MoE. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34.661 B de pesos lógicos, 23,024 GiB en disco), un módulo de visión (0,447 B, 1,664 GiB) y una cabeza MTP de predicción multi-token (0,845 B, 0,562 GiB). La presencia de la cabeza MTP es indicativa de soporte para decodificación especulativa o generación multi-token, una técnica que acelera la inferencia al predecir varios tokens por paso.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones de atención (lineal, híbrida, etc.). Lo único documentado es el proceso de cuantización: oQ (oMLX v0.7.3) asigna precisiones por tensor, manteniendo en 8 bits el 6,0 % de los pesos lógicos (2,160 B, probablemente capas de atención y proyecciones críticas), en 6 bits el 0,467 %, y en 5 bits el 91,8 % del tronco. El codificador de visión y parte de las proyecciones quedan en FP32/FP16 (1,242 % y 0,086 % de los pesos respectivamente), lo que sugiere que el autor priorizó la fidelidad de los módulos multimodales y de la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base MoE (no verificadas en esta ficha).
- Procesamiento de imágenes: el checkpoint incluye un codificador de visión de 0,447 B de parámetros, lo que habilita tareas de visión-lenguaje (VQA, descripción de imágenes, OCR, etc.), aunque no se documentan las capacidades exactas.
- Predicción multi-token (cabeza MTP): permite decodificación especulativa o generación acelerada, útil en despliegues de baja latencia.
- Cuantización mixta optimizada para MLX: ejecutable en Apple Silicon con memoria unificada, sin necesidad de GPU dedicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 25,25 GiB cabe en equipos con 32 GB o más de memoria unificada (Mac Studio M2 Max/Ultra, MacBook Pro M3/M4 Max), permitiendo ejecutar un MoE de 35 B en local con MLX sin GPU dedicada.
- Prototipado de asistentes multimodales: gracias al codificador de visión incluido, se puede construir un pipeline de VQA o descripción de imágenes en local para pruebas de concepto, aunque la calidad real depende del modelo base no verificado.
- Decodificación especulativa con MTP: la cabeza MTP permite implementar generación multi-token en MLX para reducir latencia en aplicaciones interactivas (chat, autocompletado), siempre que el runtime lo soporte.
- Investigación en cuantización: sirve como caso de estudio de cuantización mixta (5/6/8 bits + FP16/FP32) para analizar el impacto de la precisión por capa en modelos MoE multimodales.
- Despliegue en entornos con restricciones de memoria: el formato de 6,033 bits/peso reduce la huella frente a un FP16 equivalente (~72 GB), facilitando la ejecución en estaciones de trabajo de gama alta.
- Evaluación comparativa de artefactos cuantizados: útil para medir degradación de calidad frente al modelo base en tareas de texto y visión, aunque requiere disponer del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 25,25 GiB de pesos + overhead de runtime MLX (KV cache, activaciones). Se recomienda un mínimo de 32 GB de memoria unificada; 48-64 GB para contextos largos o lotes mayores.
- GPU recomendadas: Apple Silicon con memoria unificada (M2 Max/Ultra, M3 Max/Ultra, M4 Max). No es un checkpoint para CUDA (formato MLX); en GPUs NVIDIA requeriría conversión a otro runtime.
- ¿Cabe en consumer GPU? No en el sentido tradicional (NVIDIA/AMD); sí en Apple Silicon de gama alta con 32 GB o más.
- Opciones de despliegue: MLX (librería nativa), mlx-lm / mlx-examples; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Apex-35B-V1.0-oQ5e-fp16-mtp | 35,952 B (MoE) | no disponible | Mixta 5/6/8 bits + FP16/FP32 (6,033 b/p) | no disponible | MLX |
| Modelo base Apex-35B-V1.0 | ~35,952 B (MoE) | no disponible | Original (presumiblemente BF16/FP16) | no disponible | no disponible |
| Qwen3.5 MoE (referencia de familia) | no disponible | no disponible | Múltiples | no disponible | Múltiples |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de cuantización: la calidad puede degradarse respecto al modelo base, especialmente en el 91,8 % de pesos a 5 bits; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base Apex-35B-V1.0 antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Contexto no documentado: no se conoce la ventana máxima; el rendimiento con contextos largos dependerá del modelo base y del overhead de KV cache en MLX.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de mitigación (RLHF, etc.) en la información disponible.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o idioma.
- Compatibilidad limitada: formato MLX restringe el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm o runtimes de servidor.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad del checkpoint.
- Cabeza MTP y módulo de visión: su correcto funcionamiento depende del soporte del runtime MLX; no se documenta qué versión de mlx-lm los implementa.

## Enlaces

- HuggingFace: https://huggingface.co/tfjack/Apex-35B-V1.0-oQ5e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Apex-35B-V1.0: no disponible (no se proporciona enlace directo)
- Paper, blog o demo: no disponibles
