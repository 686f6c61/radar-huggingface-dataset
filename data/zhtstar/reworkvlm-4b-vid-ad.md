# zhtstar/ReworkVLM-4B-VID-AD

## Resumen

ReworkVLM-4B-VID-AD es un modelo vision-lenguaje especializado en inspección industrial, desarrollado por el usuario zhtstar. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-VL-4B-Instruct, orientado a una tarea muy concreta: leer una imagen de inspección, identificar la regla de calidad incumplida y proponer la acción correctiva mínima necesaria. El modelo está entrenado exclusivamente sobre el conjunto de datos VID-AD-Correct mediante SFT (supervised fine-tuning) y RACO-GRPO (una variante de optimización por refuerzo).

La relevancia del modelo radica en su enfoque vertical: en lugar de competir como un VLM generalista, se posiciona como una herramienta de soporte a la decisión en entornos de fabricación y control de calidad, donde la detección de anomalías lógicas (no solo visuales) y la sugerencia de reparaciones fundamentadas en reglas aportan valor operativo. Con 4.437.815.808 parámetros totales, se mantiene en un rango de tamaño que permite despliegue en hardware moderado.

Arquitectónicamente hereda la pila Qwen3-VL (transformer multimodal con torre de visión y decoder de lenguaje), distribuido bajo licencia Apache 2.0. El checkpoint se publica como pesos BF16 ya fusionados (el adaptador RL `rl_epoch_0.80` está integrado en el modelo base), por lo que no requiere un adaptador separado en inferencia. La información disponible no detalla la longitud de contexto ni los idiomas soportados más allá de lo que aporta el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: torre de vision + decoder de lenguaje) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, una arquitectura transformer multimodal que combina un codificador de visión con un modelo de lenguaje para tareas image-text-to-text. El ajuste se realizó en dos fases: primero un SFT sobre 27.600 registros del conjunto VID-AD-Correct, y después una fase de refuerzo con RACO-GRPO sobre 6.276 registros. El adaptador RL seleccionado (`rl_epoch_0.80`) se fusionó directamente en los pesos del modelo base mediante LoRA post-entrenamiento y merge, de modo que el checkpoint distribuido es autónomo.

La innovación técnica destacable no reside en la arquitectura, sino en el pipeline de entrenamiento orientado a una tarea de corrección fundamentada en reglas: el modelo no solo detecta la anomalía, sino que debe razonar qué regla se ha violado y proponer la reparación mínima. El repositorio incluye `checkpoint.json` con los hashes de los ficheros de salida y los hashes de los pesos base de Qwen correspondientes a una revisión concreta, lo que facilita la trazabilidad de la procedencia. No se detalla la composición del dataset ni el número de tokens de entrenamiento más allá del recuento de registros.

## Capacidades

- Generación de texto e imagen-texto: responde a prompts sobre una imagen de inspección aportada por el usuario.
- Detección de anomalías lógicas (logical anomaly detection): identifica incumplimientos de reglas de calidad, no solo defectos visuales evidentes.
- Sugerencia de acciones correctivas: propone la reparación mínima fundamentada en la regla violada.
- Razonamiento estructurado: genera acciones en formato estructurado (structured action accuracy reportada en el paper).
- Respuesta abierta (open-ended): produce explicaciones cualitativas además de la acción estructurada.
- Conversacional: soporta interacción multi-turno según el tag `conversational`.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada (heredadas del base Qwen3-VL, sin confirmar).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles en la información.

## Casos de uso

- Control de calidad en línea de producción: el modelo recibe la imagen de una pieza o producto y devuelve la regla incumplida junto con la acción correctiva, integrándose en un sistema de inspección visual automatizada que asiste al operario.
- Asistencia al operario en planta: ante una anomalía detectada por cámaras, el modelo genera una recomendación de reparación mínima que el operario puede validar antes de actuar, reduciendo el tiempo de diagnóstico.
- Clasificación de defectos con justificación: en lugar de una etiqueta de defecto, el modelo explica qué regla se ha violado, lo que facilita la trazabilidad y la auditoría de calidad.
- Generación de informes de no conformidad: el modelo puede redactar descripciones cualitativas del defecto y de la corrección propuesta para documentación de calidad.
- Formación de personal: uso del modelo como tutor que muestra, sobre imágenes reales de inspección, qué está mal y cómo corregirlo, apoyando programas de formación interna.
- Pre-validación de lotes: procesamiento por lotes de imágenes de inspección para priorizar qué casos requieren revisión humana, usando la confianza del modelo como criterio de triaje.
- Integración en pipelines de MES/ERP: consumo del modelo vía API (endpoints compatibles) para enriquecer registros de fabricación con la acción correctiva sugerida.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 3 del paper del autor, sobre el benchmark retenido de 7.380 registros VQA de VID-AD-Correct:

| Metrica | Valor |
|---|---|
| Precision global en opcion multiple | 95,27 % |
| Precision de accion estructurada | 80,67 % |
| Tasa de exito de correccion | 80,38 % |
| Calidad global en respuesta abierta | 4,93 / 5 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos, más overhead de activaciones y del codificador de visión; en la práctica se recomienda un mínimo de 12-16 GB de VRAM.
- Cuantización: no se documentan tipos de cuantización en la información disponible; el checkpoint se distribuye en BF16.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para desarrollo y pruebas.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 16 GB o más en BF16; en GPUs de 8-12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers 4.57.6 con accelerate y pillow (según la model card), endpoints compatibles; no se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReworkVLM-4B-VID-AD | 4,44 B | no disponible | Inspección industrial y corrección de anomalías | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct | ~4 B | no disponible | VLM generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en inspección industrial | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos especializados en inspección industrial no está disponible en la información proporcionada. El modelo base Qwen3-VL-4B-Instruct sirve como referencia de partida, pero el autor no publica una comparación cuantitativa frente a él en la información disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre VID-AD-Correct, por lo que su rendimiento fuera de ese dominio de inspección no está validado.
- Necesidad de validación humana: la propia model card advierte que las decisiones reales de inspección requieren validación de la acción predicha y de la regla normal, especialmente cuando la imagen carece de evidencia suficiente.
- Riesgo de alucinación: como VLM generativo, puede producir acciones o reglas plausibles pero incorrectas; la precisión de acción estructurada reportada (80,67 %) implica un margen de error no despreciable.
- Idiomas: no se documentan los idiomas soportados; la procedencia del base Qwen3-VL sugiere capacidades multilingües, pero no están confirmadas para este ajuste.
- Contexto: no se documenta la longitud de contexto efectiva del checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia de las imágenes de entrenamiento se rige por los términos descritos en la dataset card, que deben revisarse antes de un uso comercial.
- Trazabilidad: el archivo de entrenamiento original no registró el commit base de Qwen; el autor mitiga esto mediante hashes en `checkpoint.json`, pero conviene verificar la correspondencia antes de auditorías de procedencia.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhtstar/ReworkVLM-4B-VID-AD
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revisión de pesos base referenciada: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/d51ae9202e9e3c9c6a0063a67620285a2bd50e5c
- Dataset de entrenamiento: https://huggingface.co/datasets/zhtstar/ReworkVLM-Correct
- Código y citación: https://github.com/zhtstar/ReworkVLM
