# zenlm/zen6-nano-4b-mlx

## Resumen

Zen 6 Nano (4B) es un modelo multimodal de tipo image-text-to-text desarrollado por Hanzo AI y Zen LM, publicado en Hugging Face bajo el identificador `zenlm/zen6-nano-4b-mlx`. Se distribuye en formato nativo para Apple Silicon mediante la librería MLX, con pesos cuantizados a 2 bits en base ternaria y transformada de Hadamard (denominada por el autor «prism_hadamard_qwen35»). El modelo cuenta con 4.540.042.240 parámetros totales y un repositorio de 2,0 GB, lo que refleja la agresiva compresión aplicada a los pesos.

El modelo combina una torre de visión multimodal en FP16 con un núcleo de lenguaje post-entrenado mediante QAT (Quantization-Aware Training) con STE (Straight-Through Estimator) en base Hadamard ternaria. Incorpora la identidad «Zen 6» y capacidades agénticas de tool calling mediante el protocolo MCP (Model Context Protocol) de Hanzo, con etiquetas `<tool_call>` para la invocación de herramientas. Está pensado para ejecutarse localmente en hardware Apple Silicon (M1, M2, M3 y M4 Max).

La relevancia del modelo reside en su propuesta de inferencia multimodal de 4B parámetros en 2 bits sobre hardware de consumo Apple, con licencia Apache-2.0 y soporte de agentes vía MCP. No obstante, la información pública disponible es muy limitada: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con núcleo de lenguaje cuantizado en base ternaria Hadamard; torre de visión en FP16. Arquitectura base no detallada (tag interno `prism_hadamard_qwen35`) |
| Parametros totales | 4.540.042.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit affine Hadamard (ternario, QAT con STE); torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con directorio `runtime/` para carga |

## Arquitectura y entrenamiento

El modelo se presenta como un sistema multimodal image-text-to-text con una torre de visión en FP16 y un núcleo de lenguaje cuantizado a 2 bits en base ternaria mediante transformada de Hadamard. La cuantización se aplica con QAT (Quantization-Aware Training) y estimador de gradiente directo (STE), lo que implica que los pesos ternarios se obtuvieron durante el propio entrenamiento y no como un post-procesado de cuantización. El tag `prism_hadamard_qwen35` sugiere una base derivada de la familia Qwen 3.5, aunque el autor no lo confirma explícitamente en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La model card menciona únicamente la inclusión de un directorio `runtime/` con soporte «Hadamard-aware» y utilidades para cargar el modelo multimodal (`vision_artifact.load_vl_model`).

## Capacidades

- Generación de texto conversacional en formato multimodal image-text-to-text.
- Procesamiento de imágenes mediante torre de visión en FP16 (pipeline `image-text-to-text`).
- Tool calling / function calling mediante el protocolo MCP de Hanzo, con etiquetas `<tool_call>`.
- Capacidades agénticas orientadas a flujos con invocación de herramientas externas.
- Identidad de modelo «Zen 6» integrada en el post-entrenamiento.
- Ejecución nativa en Apple Silicon mediante MLX (M1, M2, M3 y M4 Max).
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes locales en Mac con privacidad de datos: el modelo puede ejecutarse íntegramente en un equipo Apple Silicon gracias a su formato MLX de 2 bits y su reducido tamaño de repositorio (2,0 GB), lo que permite procesar conversaciones e imágenes sin enviar datos a la nube.
- Agentes con invocación de herramientas vía MCP: al soportar `<tool_call>` y el protocolo MCP de Hanzo, puede integrarse en flujos agénticos que consulten APIs, bases de datos o servicios externos desde un entorno de escritorio.
- Análisis de imágenes en local: la torre de visión en FP16 permite tareas de descripción de imágenes, extracción de información visual o respuesta a preguntas sobre capturas y documentos escaneados sin conexión.
- Prototipado rápido en investigación: su licencia Apache-2.0 y su formato MLX facilitan experimentar con cuantización ternaria y modelos multimodales pequeños en portátiles y equipos de sobremesa Apple.
- Automatización de tareas de escritorio: puede emplearse como motor de un agente local que interprete capturas de pantalla y ejecute acciones mediante herramientas MCP.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica para estudiar el impacto de QAT ternario con Hadamard en modelos de 4B parámetros, comparando su comportamiento frente a versiones en FP16 o 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,0 GB en disco; en ejecución se requiere memoria unificada adicional para el runtime, el procesador y la torre de visión en FP16. No se especifica una cifra oficial de memoria en uso.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3 y M4 Max según la model card); no se menciona soporte para GPU NVIDIA, AMD ni otras plataformas.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon; no se indica compatibilidad con RTX 4090 u otras GPU de consumo convencionales.
- Opciones de despliegue: MLX (librería nativa), con script `quickstart.py` y runtime propio (`runtime/vision_artifact.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Zen 6 Nano 4B MLX | 4.540.042.240 | no disponible | 2-bit ternario Hadamard + vision FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (multimodales de ~4B parámetros optimizados para hardware de consumo), ya que no se han publicado benchmarks ni especificaciones detalladas de contexto o rendimiento.

## Limitaciones y advertencias

- La cuantización a 2 bits ternarios puede degradar la calidad frente a versiones en FP16 o 4 bits; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- No se detallan los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas de mitigación ni evaluaciones de fidelidad.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos éticos y de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero el archivo NOTICE debe conservarse con los avisos upstream según indica el autor.
- Soporte limitado a Apple Silicon vía MLX; no hay indicios de compatibilidad con CUDA, ROCm ni otros backends.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente, por lo que carece de validación comunitaria.
- El tag `prism_hadamard_qwen35` sugiere una base Qwen 3.5, pero el autor no lo confirma; conviene verificar la procedencia antes de usos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-4b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
