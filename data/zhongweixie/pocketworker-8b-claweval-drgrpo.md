# zhongweixie/PocketWorker-8B-ClawEval-DrGRPO

## Resumen

PocketWorker-8B-ClawEval-DrGRPO es un checkpoint multimodal de tipo image-text-to-text publicado por el usuario zhongweixie en HuggingFace. Por los tags del repositorio (`qwen3_vl`, `image-text-to-text`) y por el contenido de su model card, se trata de un ajuste sobre Qwen3-VL-8B-Instruct, el modelo de visión-lenguaje denso de la familia Qwen3-VL desarrollada por el equipo Qwen de Alibaba. El repositorio contiene 8.767.123.696 parámetros en formato safetensors (17,5 GB), lo que confirma que no se ha modificado el tamaño del modelo base.

El interés del checkpoint está en el sufijo del nombre: "DrGRPO" remite a Dr. GRPO, una variante de aprendizaje por refuerzo con verificación de recompensa (RLVR) que corrige los sesgos de normalización por longitud del GRPO original, y "ClawEval" sugiere un conjunto de evaluación o tarea concreta sobre la que se habría optimizado. Se trata, por tanto, de un experimento de posentrenamiento con RL sobre un VLM de 8B orientado a tareas de agente, no de un modelo nuevo entrenado desde cero.

Ahora bien, la model card publicada no documenta nada de ese proceso: reproduce literalmente la tarjeta de Qwen3-VL-8B-Instruct, sin dataset, sin hiperparámetros, sin curvas de entrenamiento y sin resultados numéricos propios. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto reciente y sin validación comunitaria, útil para inspección o reproducción experimental pero no recomendable como base de producción sin evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language): codificador ViT + LLM decoder, con Interleaved-MRoPE, DeepStack y alineamiento texto-marca temporal (heredado de Qwen3-VL) |
| Parámetros totales | 8.767.123.696 (8,77B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M según la model card del modelo base; no verificado para este checkpoint |
| Tipos de cuantización | No disponible en el repositorio (solo pesos safetensors, presumiblemente bf16). Compatible con cuantización posterior vía GGUF/AWQ/GPTQ al derivar de Qwen3-VL |
| Idiomas soportados | No disponibles en los metadatos. El modelo base es multilingüe y su OCR cubre 32 idiomas según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct: un transformer denso que combina un codificador visual ViT con un decoder de lenguaje, unidos mediante fusión de características. La model card del base destaca tres cambios arquitectónicos: Interleaved-MRoPE, que reparte las frecuencias de las embeddings posicionales entre tiempo, anchura y altura para mejorar el razonamiento sobre vídeo de larga duración; DeepStack, que fusiona características de varias capas del ViT para afinar el alineamiento imagen-texto; y un alineamiento texto-marca temporal que sustituye a T-RoPE para localizar eventos con precisión de segundos. El contexto nativo es de 256K tokens, ampliable a 1M.

Sobre el entrenamiento de este checkpoint concreto no hay información: la tarjeta no indica número de tokens, composición del dataset, ni si hubo SFT previo, DPO o RLHF. El nombre del repositorio permite inferir que se aplicó Dr. GRPO (variante de GRPO que elimina la normalización por longitud y el sesgo de dificultad) sobre alguna tarea denominada "ClawEval", presumiblemente con recompensas verificables, pero ni el conjunto de datos, ni el número de pasos, ni la función de recompensa están documentados. Tampoco se especifica si el ajuste cubrió solo el decoder de lenguaje o también el codificador visual, ni si se congelaron módulos.

## Capacidades

- Generación de texto y razonamiento multimodal: descripción de imágenes, respuesta a preguntas visuales y razonamiento de varios pasos sobre contenido gráfico.
- Comprensión de vídeo de larga duración con localización temporal de eventos a nivel de segundo, según las capacidades declaradas del modelo base.
- OCR robusto en 32 idiomas, con tolerancia a baja iluminación, desenfoque, inclinación y caracteres poco frecuentes o históricos; parsing de estructura de documentos largos.
- Percepción espacial 2D y 3D: posiciones relativas de objetos, puntos de vista, oclusiones y grounding, orientado a IA encarnada.
- Agente visual: reconocimiento de elementos de interfaz en GUI de escritorio y móvil, comprensión de su función e invocación de herramientas para completar tareas.
- Codificación visual: generación de diagramas Draw.io y de HTML/CSS/JS a partir de imágenes o vídeos.
- Reconocimiento visual amplio (celebrities, anime, productos, monumentos, flora y fauna), según el base.
- Capacidades de texto equiparables a un LLM puro, incluido razonamiento STEM y matemáticas.
- Soporte de tool calling y function calling: no documentado explícitamente para este checkpoint; el base está orientado a interacción con agentes y herramientas, pero no se detalla el formato.

## Casos de uso

- Agentes de automatización de GUI: el modelo puede interpretar capturas de pantalla de escritorio o móvil, identificar botones, campos y menús, y decidir la siguiente acción dentro de un bucle de agente; encaja por su grounding de elementos y su contexto largo para mantener el historial de la sesión.
- Digitalización de documentos con OCR multilingüe: extracción de texto y estructura de facturas, contratos o escaneos degradados en 32 idiomas, aprovechando la tolerancia a desenfoque e inclinación y el parsing de documentos largos.
- Generación de front-end a partir de mockups: convertir una imagen de diseño en HTML/CSS/JS funcional o en un diagrama Draw.io, útil para prototipado rápido en equipos de producto.
- Análisis de vídeo para auditoría o vigilancia: localización de eventos con marcas temporales en grabaciones de horas, aprovechando el contexto de 256K tokens y el alineamiento timestamp.
- Robótica e IA encarnada: razonamiento espacial sobre posiciones, oclusiones y puntos de vista para planificación de manipulación, apoyado en el grounding 3D del base.
- RAG multimodal: indexación y respuesta sobre corpus mixtos de texto e imagen (manuales técnicos, catálogos, informes con gráficos) manteniendo coherencia entre modalidades.
- Tutoría STEM: resolución de problemas de matemáticas y ciencias a partir de diagramas o pizarras fotografiadas, con explicación del razonamiento paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye dos imágenes con gráficas comparativas de rendimiento multimodal y de texto puro del modelo base Qwen3-VL-8B-Instruct, pero los valores no son extraíbles como datos y no hay ninguna evaluación específica del ajuste DrGRPO ni del conjunto "ClawEval".

## Requisitos de hardware

- VRAM estimada en bf16: ~17,5 GB solo de pesos, más caché KV y activaciones; en la práctica 20-24 GB para contexto moderado.
- VRAM estimada en int8: ~9 GB de pesos, ~12-14 GB en ejecución.
- VRAM estimada en int4 (GGUF Q4_K_M): ~5-6 GB de pesos, ~8-10 GB en ejecución.
- Cabe en GPU de consumo: sí. RTX 4090 (24 GB) en bf16 con margen justo; RTX 3090 (24 GB) similar; RTX 4080/4070 Ti Super (16 GB) requiere int8 o int4; RTX 4060 Ti 16 GB viable en int4.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para bf16 con contexto largo o vídeo; A10G/L4 24 GB para int8.
- El contexto es el factor limitante: 256K tokens de vídeo o documentos largos generan una caché KV muy superior al peso del modelo; para esos escenarios conviene tensor parallelism o GPUs de 80 GB.
- Opciones de despliegue: transformers (requiere compilar desde el repositorio, ya que Qwen3-VL necesita una versión de transformers ≥ 4.57 aún no publicada en el momento de la model card, con `Qwen3VLForConditionalGeneration`), FlashAttention 2 recomendado para escenarios multi-imagen y vídeo. Soporte en vLLM, TGI, llama.cpp u Ollama: no confirmado para este checkpoint concreto; depende de la versión y de la implementación de Qwen3-VL en cada motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| PocketWorker-8B-ClawEval-DrGRPO | 8,77B (denso) | 256K nativo, hasta 1M (heredado, no verificado) | Apache 2.0 | HuggingFace, 0 descargas | No disponible |
| Qwen3-VL-8B-Instruct (base) | ~8,8B (denso) | 256K nativo, hasta 1M | Apache 2.0 | HuggingFace, ampliamente desplegado | Gráficas publicadas sin valores numéricos extraíbles |
| Qwen2.5-VL-7B-Instruct | ~7B (denso) | 128K | Apache 2.0 | HuggingFace, ecosistema maduro | No disponible en esta ficha |
| InternVL3-8B | ~8B (denso) | 32K-128K según variante | Apache 2.0 / MIT según variante | HuggingFace | No disponible en esta ficha |

Frente al base, la única diferencia verificable es el posentrenamiento con Dr. GRPO, sin evidencia publicada de mejora. Frente a Qwen2.5-VL-7B e InternVL3-8B, este checkpoint ofrece mayor contexto declarado y OCR ampliado, pero carece de validación independiente.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: dataset, hiperparámetros, recompensa y criterios de parada son desconocidos, lo que impide reproducir o auditar el entrenamiento.
- La model card es una copia de la de Qwen3-VL-8B-Instruct; las capacidades descritas corresponden al base y pueden no reflejar el comportamiento tras el RL.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay evidencia externa de calidad ni de regresiones.
- El RL con recompensas verificables sobre un conjunto estrecho ("ClawEval") puede degradar capacidades generales, inducir sobreajuste al formato de recompensa o aumentar la verbosidad; no hay evaluación que lo descarte.
- Riesgo de alucinación estándar en VLMs, especialmente en OCR de documentos degradados, reconocimiento de entidades poco frecuentes y descripción de detalles finos en imágenes de baja resolución.
- El contexto largo declarado no está verificado en este checkpoint; además, llenar 256K tokens dispara el consumo de VRAM por caché KV.
- Idiomas soportados no declarados en los metadatos; la cobertura multilingüe debe validarse empíricamente antes de usarla en producción.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar que los términos del modelo base y de los datos de entrenamiento sean compatibles con el caso de uso previsto.
- Requiere una versión de transformers no publicada estable en el momento de la model card, lo que complica pipelines reproducibles y el despliegue en motores de inferencia habituales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhongweixie/PocketWorker-8B-ClawEval-DrGRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Qwen Chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Repositorio de transformers (build from source para Qwen3-VL): https://github.com/huggingface/transformers

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores son los presentes en los metadatos y en la model card.
