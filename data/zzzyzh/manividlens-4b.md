# zzzyzh/ManiVidLens-4B

## Resumen

ManiVidLens-4B es un modelo de visión-lenguaje (VLM) especializado en la detección de falsificaciones y manipulación de vídeo, desarrollado por el usuario zzzyzh y publicado en Hugging Face bajo licencia Apache 2.0. Se construye mediante fine-tuning del modelo base Qwen/Qwen3-VL-4B-Instruct, uno de los VLM más recientes de la familia Qwen3, lo que le aporta una arquitectura transformer multimodal con capacidades nativas de comprensión de imagen y vídeo. El modelo está etiquetado específicamente para tareas de `forgery-detection` (detección de falsificación) y `segmentation` (segmentación), lo que indica que no solo clasifica si un vídeo está manipulado, sino que localiza las regiones o frames alterados.

La relevancia de este modelo radica en el contexto actual de proliferación de contenido sintético generado por IA (deepfakes, manipulaciones faciales, edición temporal). Los sistemas de detección genéricos suelen fallar ante manipulaciones sutiles o requieren pipelines especializados separados. ManiVidLens-4B propone un enfoque unificado basado en un VLM capaz de razonar sobre la evidencia visual y producir tanto una decisión de clasificación como una localización espacial o temporal de la manipulación, algo que los clasificadores binarios tradicionales no ofrecen.

El modelo se entrenó sobre el dataset ManiVid-38K (38.000 muestras, según el identificador del dataset), también publicado por el mismo autor, y se distribuye en formato safetensors con un total de 5.087.861.811 parámetros reales (algo más de 5.000 millones, coherente con el nombre comercial "4B" que hace referencia a la familia base). El acceso está restringido (gated) en Hugging Face, por lo que es necesario aceptar las condiciones del autor antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Qwen3-VL-4B-Instruct) |
| Parametros totales | 5.087.861.811 (safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponibles (heredados del modelo base Qwen3-VL, presumiblemente multilingue, sin confirmacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` para carga) |

## Arquitectura y entrenamiento

ManiVidLens-4B es un fine-tuning del VLM Qwen/Qwen3-VL-4B-Instruct. La arquitectura subyacente es un transformer multimodal de tipo vision-lenguaje, que combina un codificador visual (para frames de vídeo y regiones de imagen) con un decoder de lenguaje de ~4B parámetros nominales (5.087 millones reales en safetensors). El modelo conserva las capacidades generales de comprensión visual del base y añade una cabeza/tarea específica de detección de falsificación y segmentación, indicada por la etiqueta `manividlens_chat` y el requisito de `custom_code` para la carga (lo que implica que el repositorio incluye código personalizado para la inferencia, probablemente para el procesamiento de vídeo y la salida de localización).

El entrenamiento se realizó sobre el dataset ManiVid-38K, publicado por el mismo autor (zzzyzh/ManiVid-38K), orientado a manipulación de vídeo. No se dispone en la información proporcionada del número exacto de tokens, la composición detallada del dataset, ni si se aplicaron etapas de RLHF/DPO. La referencia arXiv:2609.30934 apunta a un paper asociado (no verificable en esta ficha por falta de contenido), que presumiblemente describe la metodología de construcción del dataset y el procedimiento de entrenamiento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las inherentes al base Qwen3-VL.

## Capacidades

- Comprensión de vídeo: procesamiento de secuencias de frames para razonar sobre contenido temporal.
- Detección de falsificación (`forgery-detection`): clasificación de vídeos manipulados frente a auténticos.
- Segmentación (`segmentation`): localización de regiones o frames alterados, no solo una etiqueta binaria.
- Conversación multimodal (`manividlens_chat`): interfaz de chat sobre contenido visual/vídeo, heredada del base Qwen3-VL-Instruct.
- Razonamiento visual: capacidad de describir y analizar evidencia visual para justificar la detección.
- Capacidades generales del base Qwen3-VL-4B-Instruct: generación de texto, comprensión de imagen, y presumiblemente tool calling y multilingüismo (no confirmado específicamente para este fine-tuning).
- Requiere `custom_code` para la carga: la inferencia no es un pipeline estándar de transformers sin código adicional.

## Casos de uso

- Moderación de contenido en plataformas: integrar el modelo en pipelines de subida de vídeo para marcar automáticamente clips potencialmente manipulados antes de su publicación, usando la salida de segmentación para indicar al revisor qué frames o regiones son sospechosos.
- Verificación periodística: asistir a redacciones en la comprobación de vídeos virales, proporcionando al periodista una clasificación automática y una localización de la manipulación como punto de partida para la verificación humana.
- Detección de deepfakes en redes sociales: desplegar el modelo como servicio de análisis por lotes sobre vídeos reportados, aprovechando la naturaleza VLM para generar una explicación textual junto a la decisión.
- Forense digital y peritaje: usar la salida de segmentación como evidencia auxiliar en investigaciones, señalando las regiones temporales o espaciales alteradas para su posterior análisis con herramientas forenses dedicadas.
- Investigación en seguridad multimedia: servir como baseline reproducible (dataset ManiVid-38K + pesos) para comparar nuevos métodos de detección de manipulación de vídeo.
- Filtrado previo en datasets de entrenamiento: aplicar el modelo para limpiar corpus de vídeo antes de usarlos en el entrenamiento de otros sistemas, reduciendo la contaminación por contenido sintético.
- Sistemas de confianza y seguridad (trust & safety): integrar en herramientas internas de plataformas para priorizar casos de revisión humana según la confianza de detección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~5.000M parámetros): aproximadamente 10-12 GB en fp16/bf16 para los pesos, más memoria adicional para el codificador visual y las activaciones durante el procesamiento de vídeo (frames múltiples incrementan el uso de memoria de forma notable).
- En cuantización de 8 bits: ~6-7 GB de pesos; en 4 bits: ~3-4 GB, aunque no se han publicado versiones cuantizadas oficiales del modelo.
- GPU recomendadas: A100 40/80 GB o H100 para procesamiento por lotes de vídeo con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia de un solo vídeo en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4080/4090, RTX 3090) en fp16 para un vídeo a la vez; en 8 GB solo con cuantización agresiva no oficial.
- Opciones de despliegue: al requerir `custom_code`, la carga debe hacerse con `trust_remote_code=True` en transformers; vLLM, TGI o llama.cpp no están confirmados como compatibles sin adaptación del código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManiVidLens-4B | 5.087M | No disponible | Deteccion/segmentacion de falsificacion en video | Apache 2.0 | Gated en HF |
| Qwen/Qwen3-VL-4B-Instruct (base) | ~4B nominales | No disponible | VLM generalista | Apache 2.0 (segun base) | Publico en HF |
| Detectores binarios de deepfake (p. ej. clasificadores CNN) | <1B tipicamente | No aplica | Clasificacion binaria | Variable | Variable |
| VLMs generalistas de tamano similar (familia Qwen2.5-VL, InternVL) | 4-8B | Variable | Vision-lenguaje general | Variable | Publicos |

La comparativa directa con benchmarks no es posible por ausencia de resultados publicados. Frente a clasificadores CNN especializados, ManiVidLens-4B aporta razonamiento textual y segmentación, a costa de mayor requisito de cómputo. Frente a su base Qwen3-VL-4B-Instruct, gana especialización en detección de falsificación pero puede perder parte de la generalidad del modelo original.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima ni automatizada sin token.
- Requiere `custom_code` (`trust_remote_code=True`): introduce dependencia de código del autor, con implicaciones de seguridad y mantenimiento en producción.
- Dataset de entrenamiento específico (ManiVid-38K): el rendimiento fuera de la distribución de ese dataset (nuevos tipos de manipulación, codecs, resoluciones) no está validado en la información disponible.
- Riesgo de falsos positivos y negativos: como todo detector de falsificación, puede errar ante compresiones agresivas, reencodeo o manipulaciones sutiles no representadas en entrenamiento.
- Riesgo de alucinación: al ser un VLM, puede generar explicaciones textuales plausibles pero incorrectas sobre la evidencia visual.
- Idiomas no confirmados: la ficha del repositorio no declara idiomas; el multilingüismo depende del base y no está garantizado para las salidas específicas de detección.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión/recall frente a alternativas, lo que dificulta justificar su uso en producción crítica.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-VL-4B-Instruct y de los datos de entrenamiento antes de un despliegue comercial.
- Comunidad mínima (2 descargas, 0 likes en el momento de la consulta): poca validación externa y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzzyzh/ManiVidLens-4B
- Dataset ManiVid-38K: https://huggingface.co/datasets/zzzyzh/ManiVid-38K
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper asociado (arXiv): https://arxiv.org/abs/2609.30934
