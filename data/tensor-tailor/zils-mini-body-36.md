# tensor-tailor/zils-mini-body-36

## Resumen

zils-mini-body-36 es un "body" (pesos completos) para el pool de modelos Zils `d3-mini` de la subnet 127 de Bittensor, publicado por el usuario tensor-tailor. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos: parte del soup oficial MS14 (promedio uniforme de tres cuerpos públicos de la ronda d3-mini-2026-11-14) y le aplica la media de dos ejecuciones de LoRA de rango 32 con factor 1, es decir, un ajuste fino ligero sobre el modelo base `d3-mini-4.5b-v1` del repositorio Zils en la revisión `e9e87b3e`.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB, lo que sugiere pesos en bf16. La licencia es Apache 2.0. El entrenamiento se realizó sobre 77.377 filas (27.380 con etiqueta supervisada, 49.997 con probabilidades de un profesor d3-ultra) más 12.095 prompts de anclaje, con dos semillas (7201 y 7211) y una receta idéntica, cada ejecución de unos 209 minutos y con pérdida final en torno a 0,15.

La relevancia de esta ficha es acotada: se trata de un artefacto de un ecosistema de subasta/fusión de modelos (Bittensor), con cero descargas y cero likes en el momento de la consulta, y sin model card convencional sobre capacidades, idiomas o benchmarks. La información disponible describe con detalle el proceso de fusión y los datos de entrenamiento, pero no las capacidades resultantes ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 4.539.265.536 (4,5 B aprox.) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las filas de entrenamiento llegan a 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; sin GGUF publicado) |
| Idiomas soportados | no disponible (el dataset incluye tareas de "language", pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere código remoto) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen (tag `qwen3_5`), con pesos completos en safetensors y código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` y depende de la implementación del repositorio Zils. El modelo parte del soup MS14, reconstruido por el autor como promedio uniforme de tres cuerpos públicos (`Zayaan/zils-mini-hm4`, `qhoenix/zils-mini-decision-t2avg`, `joamCriff123/zils-mini-m1113b`) en las revisiones exactas que sus dueños habían comprometido; el hash del soup reconstruido coincide con el publicado (`4e9fcfd2…`).

Sobre ese punto de partida se aplican dos ejecuciones de LoRA (rango 32, alpha 64, dropout 0,05) sobre 152 módulos (todas las capas), fusionadas después en los pesos completos con la fórmula `start + alpha/rank × B·A` en bf16. El entrenamiento usa AdamW con learning rate 1e-4, weight decay 0, 50 pasos de warm-up y decaimiento coseno, una época, batch 8 con 2 pasos de acumulación y filas de hasta 2.048 tokens. La pérdida combina tres términos con peso 1: KL entre el profesor y el cuerpo sobre las 49.997 filas de profesor a temperatura 1, entropía cruzada sobre la etiqueta en las 27.380 filas etiquetadas (sin suavizado, Brier ni RPS) y KL contra la distribución de respuestas del propio punto de partida en los 12.095 prompts de anclaje, calculada en vivo desde los pesos iniciales. Los dos runs (semillas 7201 y 7211) duraron 208,5 y 209,4 minutos y terminaron con pérdidas de 0,1583 y 0,1537. El cuerpo final es `START + suma sobre los 2 runs de c × (RUN − START)` con c = 0,5, afectando a 152 tensores.

Los datos de entrenamiento provienen de un fichero de 77.377 filas y otro de 12.095 prompts de anclaje. Las filas etiquetadas se reparten por categoría (razonamiento, lenguaje, recuperación, herramientas y artes) y su origen es mixto: un 57,5% procede de etiquetas de splits TRAIN de datasets públicos convertidas por código, un 21,2% de respuestas escritas por tres sesiones de Claude del equipo, un 16,3% de generadores programáticos propios y un 3,3% de un pool anterior; solo 6 filas provienen de modelos locales (Phi-4 y Mistral-Nemo). Las filas de profesor (49.997) se concentran en razonamiento (20.433) y lenguaje (12.045). Cada grupo de origen público pasó una verificación ciega de 60 filas (43 en un grupo) con un máximo de 6 discrepancias; cuatro grupos (goemo, poem, siqa, snli) no superaron el control y no aportaron filas por esa vía.

## Capacidades

- Generación de texto y respuesta a preguntas en formato de examen (elección múltiple, sí/no y puntuación), según la composición del dataset de entrenamiento.
- Razonamiento: es la categoría con más filas de profesor (20.433), lo que sugiere énfasis en tareas de razonamiento.
- Conocimiento lingüístico y tareas de lenguaje (12.045 filas de profesor en la categoría "language").
- Recuperación (retrieval) y tareas de selección de evidencia (6.229 filas de profesor).
- Uso de herramientas: hay filas etiquetadas de la categoría "tools" (1.590 de elección, 1.590 de sí/no, 1.341 de puntuación), pero solo 1.156 filas de profesor; el soporte real de tool calling no está documentado.
- Tareas de artes/creatividad (7.586 filas de profesor).
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking, visión, audio o agentes multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación y puntuación de respuestas en pipelines de evaluación: el modelo se entrenó explícitamente con formatos de elección, sí/no y puntuación, por lo que puede usarse como evaluador automático de respuestas generadas por otros modelos en un banco de pruebas interno.
- Destilación de un profesor hacia un cuerpo pequeño: dado que la pérdida principal es KL contra las probabilidades de d3-ultra, el modelo puede servir como aproximación ligera (4,5 B) de un profesor mayor en entornos con recursos limitados.
- Experimentación en el ecosistema Bittensor/Zils: sirve como cuerpo candidato para la subnet 127, donde los participantes fusionan y ajustan modelos; útil para estudiar dinámicas de fusión de pesos y LoRA.
- Investigación sobre fusión de modelos: el repositorio documenta hashes, recetas y fórmulas de combinación (`delta_combo.py`), lo que lo convierte en un caso reproducible para estudiar técnicas de model soup y merging de adaptadores.
- Tareas de razonamiento y lenguaje en formato cerrado: con 20.433 y 12.045 filas de profesor respectivamente, es adecuado para responder preguntas de opción múltiple o verificación de afirmaciones en un entorno controlado.
- Selección de evidencia en recuperación: las filas de retrieval (6.229 de profesor) permiten usarlo como reranker o clasificador de relevancia en un sistema RAG, siempre que se valide su calidad real con evaluaciones propias.
- Prototipado de asistentes con uso de herramientas: aunque el soporte de tool calling no está documentado, las filas de la categoría "tools" permiten probar formatos de llamada a funciones en un entorno de investigación, no en producción sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento (0,1583 y 0,1537 en los dos runs) y metadatos de fusión, no métricas de evaluación como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 4,5-5 GB de pesos; a 4 bits, unos 2,5-3 GB, aunque no se publican versiones GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB) para bf16 con contexto limitado; RTX 3090/4080 (16-24 GB) para cuantización o contextos cortos.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más con contexto reducido, y en cuantización en tarjetas de 8-12 GB, siempre que se genere la cuantización por cuenta propia.
- Opciones de despliegue: vLLM o TGI para bf16 (requiere soporte de la arquitectura Qwen3.5 y `trust_remote_code`); llama.cpp/Ollama solo si se convierte a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-36 | 4,54 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fusión de soup + 2 LoRA; sin benchmarks |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | no disponible | Hugging Face (miembro del soup) | Uno de los tres cuerpos base de MS14 |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | no disponible | Hugging Face (miembro del soup) | Uno de los tres cuerpos base de MS14 |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | no disponible | Hugging Face (miembro del soup) | Uno de los tres cuerpos base de MS14 |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas; no debe asumirse un rendimiento por el tamaño o la receta.
- Sesgos desconocidos: el dataset combina etiquetas de datasets públicos (GLUE, entre otros), generadores programáticos y respuestas de sesiones de Claude; no se documenta un análisis de sesgos ni de toxicidad.
- Riesgo de alucinación: no evaluado; el entrenamiento con KL hacia un profesor y anclaje al punto de partida puede preservar errores del profesor y del soup original.
- Idiomas no declarados: aunque hay filas de "language", no se especifica qué idiomas cubre; el uso en castellano no está validado.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de tres cuerpos de terceros cuyas licencias no se detallan en la información disponible; conviene verificar cada repositorio de origen antes de un despliegue comercial.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio; riesgo de seguridad en entornos de producción.
- Contexto de entrenamiento limitado a 2.048 tokens por fila; no se documenta la longitud de contexto efectiva del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; es un artefacto experimental de un ecosistema de subasta de modelos.
- La model card está truncada en la información proporcionada; parte de la procedencia de datos y licencias de las fuentes no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-36
- Modelo base del soup: https://huggingface.co/Zayaan/zils-mini-hm4
- Miembro del soup: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Miembro del soup: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Repositorio Zils (referenciado en la model card, revisión `e9e87b3e`): no disponible como URL en la información proporcionada
- Paper, blog o demo: no disponibles
