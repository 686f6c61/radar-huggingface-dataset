# Tanjiro20/Qwen3-VL-2B-Instruct-heretic

## Resumen

Qwen3-VL-2B-Instruct-heretic es una variante "decensored" (abliterated) del modelo vision-lenguaje Qwen3-VL-2B-Instruct de Alibaba Qwen, publicada por el usuario Tanjiro20. El modelo base resuelve el problema de comprensión conjunta de imagen y texto con un transformer multimodal de 2.127.532.032 parámetros, y esta variante aplica la técnica de abliteration mediante la herramienta Heretic v1.4.0 para reducir drásticamente las negativas del modelo a responder ciertas peticiones. Es relevante ahora porque demuestra que la abliteration es aplicable a arquitecturas multimodales modernas con parámetros quirúrgicos reproducibles y un coste de divergencia medible.

El modelo conserva la arquitectura y capacidades del Qwen3-VL-2B-Instruct original: contexto nativo de 256K tokens ampliable a 1M, percepción espacial 2D/3D, OCR en 32 idiomas, comprensión de vídeo de larga duración y capacidades de agente visual. La modificación se limita a los pesos de las proyecciones de atención y MLP, con un impacto medido en KL divergence de 0.0653 frente al original.

La ficha describe tanto el modelo base como las particularidades de esta versión decensored, incluyendo los parámetros exactos de abliteration y las métricas de rechazo publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL, ViT + LLM con Interleaved-MRoPE, DeepStack y Text-Timestamp Alignment) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no aplica (modelo dense, no MoE) |
| Longitud de contexto | 256K tokens nativo, ampliable a 1M |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; el modelo base admite cuantizaciones estándar vía transformers/GGUF, pero no se documentan en esta ficha) |
| Idiomas soportados | no disponible (el modelo base soporta OCR en 32 idiomas y capacidades multilingües, sin listado explícito) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-2B-Instruct es un transformer multimodal denso que combina un codificador visual ViT con un modelo de lenguaje. Incorpora tres innovaciones arquitectónicas: Interleaved-MRoPE, que asigna frecuencias completas a lo largo de tiempo, ancho y alto para mejorar el razonamiento sobre vídeo de largo horizonte; DeepStack, que fusiona características ViT de múltiples niveles para capturar detalles finos y afinar la alineación imagen-texto; y Text-Timestamp Alignment, que sustituye a T-RoPE para una localización temporal precisa de eventos en vídeo. El contexto nativo es de 256K tokens, ampliable a 1M.

Sobre el entrenamiento del modelo base no se proporcionan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La variante heretic se genera aplicando abliteration con Heretic v1.4.0, una técnica que identifica una dirección de rechazo en el espacio de activaciones y modifica los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` para suprimirla. Los parámetros publicados son: `direction_index` 13.24, `attn.o_proj.max_weight` 1.04 en posición 16.79, `attn.o_proj.min_weight` 0.53 a distancia 9.19, `mlp.down_proj.max_weight` 1.40 en posición 17.25 y `mlp.down_proj.min_weight` 0.98 a distancia 11.21. El proceso es reproducible según el autor.

## Capacidades

- Generación de texto y razonamiento multimodal con comprensión de imágenes y vídeo.
- Agente visual: reconoce elementos de interfaz, entiende funciones, invoca herramientas y completa tareas en GUIs de PC y móvil.
- Codificación visual: genera diagramas Draw.io y código HTML/CSS/JS a partir de imágenes o vídeos.
- Percepción espacial avanzada: posiciones de objetos, puntos de vista, oclusiones, grounding 2D y 3D para razonamiento espacial y IA encarnada.
- Comprensión de vídeo de larga duración con indexación a nivel de segundo y recuperación completa.
- OCR en 32 idiomas, robusto en baja iluminación, desenfoque e inclinación, con soporte de caracteres raros o antiguos y análisis de estructura de documentos largos.
- Razonamiento STEM y matemático con análisis causal y respuestas basadas en evidencia.
- Reconocimiento visual amplio: celebridades, anime, productos, puntos de referencia, flora y fauna.
- Comprensión de texto equiparable a LLMs puros mediante fusión texto-visión sin pérdida.
- Reducción drástica de negativas: 6/100 rechazos frente a 97/100 del original, según el autor.

## Casos de uso

- Automatización de atención al cliente multimodal: el modelo puede procesar capturas de pantalla o fotos enviadas por el usuario junto con texto en conversaciones multi-turno, aprovechando la ventana de 256K tokens para mantener contexto de sesiones largas.
- Agente de navegación de escritorio: reconocimiento de elementos de GUI e invocación de herramientas para automatizar flujos en aplicaciones de PC o móvil, adecuado por su capacidad de agente visual nativa.
- Extracción de datos de documentos escaneados: OCR en 32 idiomas con tolerancia a baja iluminación y desenfoque, útil en digitalización de facturas, formularios y archivos históricos con caracteres raros.
- Generación de prototipos de interfaz: conversión de bocetos o capturas en código HTML/CSS/JS o diagramas Draw.io, aprovechando la codificación visual del modelo base.
- Análisis de vídeo de vigilancia o deportivo: indexación temporal a nivel de segundo y comprensión de dinámicas espacio-temporales en grabaciones de horas de duración.
- Investigación sobre alineación y seguridad: la variante heretic permite estudiar el comportamiento de un modelo multimodal con la dirección de rechazo suprimida, con parámetros de abliteration reproducibles y métricas de divergencia (KL 0.0653) para comparar.
- Razonamiento STEM asistido por imagen: resolución de problemas de matemáticas o ciencias a partir de fotografías de pizarras o figuras, con análisis causal y respuestas basadas en evidencia.

## Benchmarks y rendimiento

El autor publica únicamente métricas de la abliteration, no benchmarks de tareas:

| Metrica | Este modelo | Qwen/Qwen3-VL-2B-Instruct |
|---|---|---|
| KL divergence | 0.0653 | 0 (por definición) |
| Negativas (refusals) | 6/100 | 97/100 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante. El modelo base referencia gráficas de rendimiento multimodal y de texto puro en su model card, pero sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4.3 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica entre 6 y 8 GB para contexto moderado.
- VRAM en cuantización de 8 bits: en torno a 2.5-3 GB de pesos; en 4 bits, en torno a 1.5-2 GB, más caché KV.
- GPU recomendadas: A100 o H100 para contexto largo (256K-1M) y vídeo; RTX 4090 o RTX 3090 para uso general en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y potencialmente en GPUs de 8 GB con cuantización; el contexto largo y el vídeo incrementan mucho la memoria de activaciones.
- Opciones de despliegue: transformers (recomendado, con `Qwen3VLForConditionalGeneration` y FlashAttention 2), vLLM y TGI para servir el modelo base; llama.cpp/Ollama no están documentados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tanjiro20/Qwen3-VL-2B-Instruct-heretic | 2.127.532.032 | 256K (1M ampliable) | apache-2.0 | Variante abliterated, 6/100 negativas, KL 0.0653 |
| Qwen/Qwen3-VL-2B-Instruct | 2.127.532.032 | 256K (1M ampliable) | apache-2.0 | Modelo base sin modificar, 97/100 negativas |
| Qwen3-VL (familia, ediciones Thinking e Instruct) | desde 2B hasta 32B y MoE | 256K (1M ampliable) | apache-2.0 | Misma arquitectura, mayor escala y modo de razonamiento |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos multimodales de tamaño similar (por ejemplo, variantes de 2B de otras familias), por lo que la comparación se limita a la familia Qwen3-VL.

## Limitaciones y advertencias

- La abliteration suprime la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción sin filtros externos de seguridad.
- La divergencia respecto al modelo original (KL 0.0653) implica cambios en la distribución de salida que pueden degradar sutilmente capacidades no evaluadas; no hay benchmarks de tareas para esta variante.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en razonamiento complejo, matemáticas y OCR de documentos densos.
- El modelo base tiene sesgos derivados de sus datos de entrenamiento, no documentados en la información disponible; la abliteration puede amplificar sesgos al eliminar negativas.
- El contexto de 256K-1M consume gran cantidad de memoria y puede degradar la calidad en los extremos de la ventana.
- La licencia apache-2.0 permite uso comercial, pero el despliegue de una variante decensored conlleva responsabilidad legal y reputacional sobre el contenido generado.
- No hay información sobre idiomas soportados explícitos ni sobre el rendimiento multilingüe de esta variante.
- El modelo tiene solo 45 descargas y 0 likes, sin validación comunitaria de su calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tanjiro20/Qwen3-VL-2B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Heretic: https://heretic-project.org
- Demo (Space de akhaliq): https://huggingface.co/spaces/akhaliq/Qwen3-VL-2B-Instruct
- Reproducibilidad: directorio `reproduce/README.md` dentro del repositorio del modelo
- Paper Qwen3-VL (referencia arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (referencia arxiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (referencia arxiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (referencia arxiv:2308.12966): https://arxiv.org/abs/2308.12966
