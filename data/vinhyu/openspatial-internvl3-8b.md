# VINHYU/OpenSpatial-InternVL3-8B

## Resumen

OpenSpatial-InternVL3-8B es un modelo de visión-lenguaje (VLM) desarrollado por VINHYU, obtenido mediante fine-tuning del modelo base OpenGVLab/InternVL3-8B sobre el conjunto de datos espaciales JoyAI-Image-OpenSpatial. El modelo está diseñado específicamente para tareas de comprensión y razonamiento espacial en 3D, un área crítica para la robótica, la IA encarnada y los world models. Su relevancia radica en que OpenSpatial, el motor de datos subyacente, busca democratizar la creación de datos espaciales de alta calidad, cerrando la brecha entre los datos 2D masivos de la web y el razonamiento espacial 3D complejo.

Con aproximadamente 7,94 mil millones de parámetros, el modelo hereda la arquitectura de InternVL3-8B, un VLM basado en transformer con un codificador de visión y un modelo de lenguaje. Aunque la longitud de contexto no se especifica en la documentación disponible, el modelo está pensado para aplicaciones que requieren entender relaciones espaciales, geometría de escenas y navegación. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3-8B (fine-tuning), transformer vision-language |
| Parametros totales | 7.944.373.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en InternVL3-8B, un VLM de la familia InternVL de OpenGVLab, que combina un codificador de visión (ViT) con un modelo de lenguaje de gran tamaño. El fine-tuning se realizó sobre el dataset JoyAI-Image-OpenSpatial, generado por el motor de datos OpenSpatial, que produce anotaciones espaciales 3D a partir de imágenes 2D. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El proceso de entrenamiento se describe en el paper "OpenSpatial: A Principled Data Engine for Empowering Spatial Intelligence" (arXiv:2604.07296), que detalla la metodología de generación de datos y el fine-tuning.

## Capacidades

- Comprensión espacial 3D: interpreta relaciones geométricas, posiciones relativas, orientaciones y profundidad en imágenes.
- Razonamiento espacial: responde preguntas sobre la disposición de objetos, distancias y trayectorias.
- Integración con tareas de visión-lenguaje: hereda las capacidades generales de InternVL3-8B, como descripción de imágenes y respuesta a preguntas visuales.
- Soporte para IA encarnada y world models: diseñado para alimentar sistemas que necesitan entender el entorno físico.
- No se documentan capacidades específicas de tool calling, agentes o modo de pensamiento explícito.

## Casos de uso

- Navegación autónoma en robótica: el modelo puede procesar imágenes de una cámara y generar instrucciones de movimiento basadas en la disposición espacial de obstáculos y objetivos, gracias a su razonamiento 3D.
- Planificación de tareas en entornos domésticos: un robot asistente puede usar el modelo para localizar objetos, estimar distancias y planificar rutas de agarre.
- Generación de world models: en simulaciones, el modelo ayuda a construir representaciones espaciales coherentes a partir de observaciones visuales, útil para entrenar agentes en entornos virtuales.
- Anotación automática de datos espaciales: puede etiquetar imágenes con información de profundidad y relaciones espaciales, acelerando la creación de datasets para otros sistemas.
- Asistencia en realidad aumentada: el modelo puede interpretar la escena capturada por una cámara y superponer información contextual sobre objetos y su ubicación.
- Control de vehículos autónomos: en tareas de percepción, el modelo puede razonar sobre la posición de otros vehículos y peatones en la carretera, mejorando la toma de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de OpenSpatial podría incluir evaluaciones, pero no se proporcionan datos concretos en la documentación del modelo ni en los resultados de búsqueda. Se recomienda consultar el repositorio de GitHub y el paper para obtener métricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: con 7,94B parámetros en precisión fp16, el modelo requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización a 8 bits, podría reducirse a unos 8 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En consumer, una RTX 3090 o 4090 es suficiente para fp16.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con vLLM, TGI o directamente con la API de transformers. Para entornos con menos recursos, se podría convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenSpatial-InternVL3-8B | 7,94B | no disponible | Apache 2.0 | Razonamiento espacial 3D |
| InternVL3-8B (base) | 7,94B | no disponible | Apache 2.0 | VLM general |
| SpatialVLM (ejemplo) | no disponible | no disponible | no disponible | Razonamiento espacial |

No se dispone de información suficiente sobre otros modelos de razonamiento espacial comparables en el momento de redactar esta ficha. La comparativa se limita al modelo base, que comparte arquitectura y parámetros, pero sin el fine-tuning espacial.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo VLM, puede generar respuestas incorrectas o inventar relaciones espaciales que no existen en la imagen, especialmente en escenas complejas o ambiguas.
- Limitaciones de idioma: no se especifican los idiomas soportados; probablemente hereda las capacidades multilingües de InternVL3, pero no está garantizado.
- Dependencia del dataset de entrenamiento: el rendimiento espacial está limitado por la cobertura y calidad de JoyAI-Image-OpenSpatial; puede fallar en dominios no representados.
- Sin cuantizaciones oficiales: el repositorio solo incluye pesos en safetensors, lo que puede dificultar el despliegue en hardware con poca VRAM.
- Documentación incompleta: faltan detalles sobre contexto, idiomas y benchmarks, lo que dificulta la evaluación rigurosa antes de su uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/VINHYU/OpenSpatial-InternVL3-8B
- Repositorio GitHub: https://github.com/VINHYU/OpenSpatial
- Paper arXiv: https://arxiv.org/abs/2604.07296
- Dataset de entrenamiento: https://huggingface.co/datasets/jdopensource/JoyAI-Image-OpenSpatial
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B
