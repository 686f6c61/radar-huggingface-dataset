# sriq-ai/sriq-heretic-spatial-9b-MIXED-10050-preview

## Resumen

sriq-heretic-spatial-9b-MIXED-10050-preview es un ajuste fino de tipo LoRA fusionado a bf16 sobre el modelo huihui-ai/Huihui-Qwen3.5-9B-abliterated, publicado por sriq-ai (SRIQ), un grupo de investigación abierta centrado en razonamiento eficiente. El modelo tiene 9.653.104.368 parámetros (9,65 B) según los pesos safetensors reales, ocupa 19,3 GB en el repositorio y se distribuye bajo licencia Apache-2.0. Está etiquetado como image-text-to-text, por lo que admite entrada de imagen además de texto.

La característica diferencial declarada por el autor es que el modelo razona en chino simplificado comprimido y responde en el idioma en que se le formula la pregunta. El entrenamiento se realizó con QLoRA de 4 bits sobre el modelo base, con LoRA de rango 32 aplicada a los módulos de atención y MLP, y posterior fusión a bf16. Es una versión de previsualización: se entrenó durante 300 pasos (0,80 de una época) y el autor advierte explícitamente de que no se ejecutaron benchmarks.

Su relevancia actual es doble: por un lado, explora la línea de "razonamiento eficiente" con trazas en un idioma de alta densidad informacional; por otro, parte de una base ablacionada (sin alineamiento de seguridad), lo que lo sitúa en el terreno de la investigación sobre modelos sin censura. Es un artefacto de investigación con 19 descargas y 0 likes en el momento de la consulta, sin validación comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (tag `qwen3_5`); multimodal image-text-to-text. No se indica que sea MoE |
| Parametros totales | 9.653.104.368 (9,65 B, dato real de safetensors) |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible como ventana nominal; la longitud maxima de secuencia durante el entrenamiento fue de 65.536 tokens |
| Tipos de cuantizacion | no se publican cuantizaciones (GGUF, AWQ, GPTQ) en el repositorio; pesos en bf16. El entrenamiento uso una base cuantizada a 4 bits (QLoRA) |
| Idiomas soportados | no disponibles oficialmente. El tag de idioma es `chinese`; la model card indica razonamiento en chino simplificado comprimido y respuesta en el idioma de la pregunta |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados) |
| Autor | sriq-ai |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated |
| Datasets de entrenamiento | sriq-ai/exp-n950-spatial (100%) y sriq-ai/sriq-sft-v1.6 (50%) |
| Libreria | transformers |
| Tamano del repositorio | 19,3 GB |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

El modelo parte de Huihui-Qwen3.5-9B-abliterated, un modelo de la familia Qwen3.5 de 9 B de parámetros con decodificador transformer. El pipeline declarado es image-text-to-text, de modo que el modelo procesa entradas de imagen y texto y genera texto. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32, alpha 32 y dropout 0.0, sobre una base cuantizada a 4 bits (QLoRA), con los pesos resultantes fusionados a bf16. Los módulos objetivo fueron q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, toda la atención y el bloque MLP. La tasa de aprendizaje fue de 1,5e-4 con schedule lineal y 10 pasos de warmup.

El entrenamiento consistió en 300 pasos (limitados por `max_steps`, no por épocas) con un batch efectivo de 16 (2 por dispositivo × 8 de acumulación de gradiente). El dataset declarado mezcla sriq-ai/exp-n950-spatial al 100% con sriq-ai/sriq-sft-v1.6 al 50%, sobre la revisión `474818d4a6c28bc1612a0471a1e99b4735f77a2e`. De las 5.965 filas del dataset, solo se mostraron 4.800 (0,80 de una época); las filas que excedían los 65.536 tokens se descartaron, no se truncaron. La pérdida final de entrenamiento fue de 0,7529. El run se ejecutó en 2 × NVIDIA RTX PRO 6000 Blackwell Server Edition durante 3 h 42 m, con un coste aproximado de 18,43 dólares a 4,98 dólares/hora, según las métricas registradas por el pipeline interno de SRIQ (train.sriq.org), que no es público. No se documenta uso de RLHF ni DPO.

## Capacidades

- Razonamiento multi-paso con trazas de pensamiento extensas, restringidas a chino simplificado comprimido por diseño del ajuste fino.
- Generación de respuestas en el idioma de la pregunta, independientemente del idioma del razonamiento interno.
- Procesamiento de contexto largo: el entrenamiento admitió secuencias de hasta 65.536 tokens.
- Entrada multimodal de imagen y texto, según el pipeline `image-text-to-text` declarado.
- Conversación multi-turno (tag `conversational`).
- Capacidad de ser reajustado: el autor publica el adaptador LoRA por separado, lo que permite reproducir o continuar el ajuste.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente y razonamiento multi-paso autónomo: no documentado explícitamente; el ajuste se orienta a razonamiento.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en razonamiento eficiente: el modelo está diseñado para razonar en chino comprimido, una línea de trabajo que busca reducir el número de tokens de la traza manteniendo la calidad de la respuesta. Es adecuado para medir la tasa de verificación, la longitud de traza y el bucle repetitivo frente a modelos que razonan en inglés.
- Asistentes multilingües con razonamiento interno opaco: al responder en el idioma de la pregunta y razonar en otro, puede usarse en productos donde se quiera una traza interna compacta y una salida localizada para el usuario final.
- Análisis de documentos largos: con secuencias de hasta 65.536 tokens vistas en entrenamiento, encaja en tareas de resumen o extracción sobre contratos, informes técnicos o expedientes extensos, siempre que el caso no requiera contexto superior a ese límite.
- Tareas de visión-lenguaje: descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas y diagramas, aprovechando el pipeline image-text-to-text.
- Experimentación académica con alineamiento y seguridad: al derivar de una base ablacionada, es un objeto de estudio útil para comparar tasas de rechazo, deriva de comportamiento y utilidad frente al modelo base, en un entorno controlado.
- Base para ajustes finos posteriores: el adaptador publicado y la fusión a bf16 permiten partir de este checkpoint para nuevos entrenamientos LoRA específicos de dominio, reutilizando el trabajo ya realizado sobre los módulos de atención y MLP.
- Evaluación comparativa interna: dado que el autor no publicó benchmarks, puede emplearse como candidato en una batería propia de evaluación (matemáticas, código, razonamiento espacial) antes de considerar cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica: "No benchmarks were run for this release", y señala que no se reportan filas con razonamiento en chino, tasa de verificación ni bucles repetitivos frente al modelo base. Se recomienda evaluar el modelo en la carga de trabajo propia antes de depender de él.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 19,3 GB solo para los pesos (9,65 B × 2 bytes), más la caché KV. Con contexto largo (hasta 65.536 tokens) la caché puede crecer de forma sustancial, por lo que conviene reservar margen adicional o reducir la ventana efectiva.
- VRAM con cuantización: en 8 bits, alrededor de 10-11 GB; en 4 bits, alrededor de 5-7 GB, más caché KV. El repositorio no publica pesos cuantizados, así que habría que generarlos.
- GPU recomendadas: para bf16 sin cuantizar, tarjetas de 24 GB o más (RTX 3090, RTX 4090, L40S, A100 40 GB, H100). El entrenamiento del autor se hizo en 2 × NVIDIA RTX PRO 6000 Blackwell Server Edition.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 con contexto moderado; en tarjetas de 16 GB o menos es necesario recurrir a cuantización de 8 o 4 bits.
- Opciones de despliegue: la model card solo documenta uso con `transformers` (`AutoModelForCausalLM` + `AutoTokenizer`, `torch_dtype="auto"`, `device_map="auto"`). No se documentan vLLM, llama.cpp, Ollama ni TGI, y no hay GGUF publicado. El tag `unsloth` aparece en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite una comparación directa con el modelo base del que deriva. No se conocen datos de rendimiento publicados para ninguno de los dos, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sriq-heretic-spatial-9b-MIXED-10050-preview | 9,65 B | no disponible (entrenado con secuencias de hasta 65.536) | no publicados | apache-2.0 | HuggingFace, pesos safetensors bf16 + adaptador LoRA |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated (base) | 9 B (aproximado, no confirmado en la informacion) | no disponible | no publicados | no disponible | HuggingFace |
| Otros modelos de la clase 8-9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sin benchmarks: el autor declara explícitamente que no se ejecutaron evaluaciones. No hay evidencia publicada de calidad, tasa de verificación ni control de bucles repetitivos.
- Entrenamiento truncado: solo se mostraron 4.800 de las 5.965 filas del dataset (0,80 de época). El run está limitado por pasos, no por épocas, por lo que el modelo puede no haber convergido sobre el conjunto completo.
- Restricción de plantilla crítica: no se debe pasar `enable_thinking=False`. La plantilla rellena un bloque `<think></think>` vacío y la traza de razonamiento desaparece.
- Herencia del modelo base: asume todas las limitaciones de huihui-ai/Huihui-Qwen3.5-9B-abliterated.
- Base ablacionada: el modelo deriva de una versión sin alineamiento de seguridad, orientada a eliminar rechazos. En producción implica riesgo de generar contenido que otros modelos rechazarían; requiere filtros externos si se expone a usuarios.
- Riesgo de alucinación: no evaluado. No hay datos sobre fiabilidad factual.
- Idiomas: la única referencia es el tag `chinese` y la nota de la model card sobre razonamiento en chino simplificado comprimido. El comportamiento en otros idiomas no está medido y la calidad de las trazas comprimidas puede degradar la interpretabilidad.
- Contexto: aunque el entrenamiento admitió 65.536 tokens, no se declara la ventana de contexto nominal del modelo; no debe asumirse que soporta más de lo visto en entrenamiento.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de los datasets, no detallados en la información disponible.
- Madurez: es una previsualización con 19 descargas y 0 likes; no hay validación independiente ni comunidad que reporte fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriq-heretic-spatial-9b-MIXED-10050-preview
- Adaptador LoRA: https://huggingface.co/sriq-ai/sriq-heretic-spatial-9b-MIXED-10050-preview-adapter
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/sriq-ai/exp-n950-spatial
- Dataset de entrenamiento (segundo): https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.6
- SRIQ (organización): https://sriq.org
- Benchmarks de SRIQ: https://bench.sriq.org
- Plataforma de entrenamiento (no pública): https://train.sriq.org
- Proyecto Heretic: https://heretic-project.org/
- Tutorial de Heretic: https://heretic-project.org/tutorial
- Repositorio Heretic en GitHub: https://github.com/p-e-w/heretic
