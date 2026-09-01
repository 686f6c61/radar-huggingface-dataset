# VINHYU/OpenSpatial-InternVL2.5-8B

## Resumen

OpenSpatial-InternVL2.5-8B es un modelo de visión y lenguaje (VLM) desarrollado por el proyecto OpenSpatial de VINHYU, especializado en comprensión y razonamiento espacial. Se trata de un ajuste fino (fine-tuning) del modelo base OpenGVLab/InternVL2_5-8B, orientado a tareas que requieren entender la posición, orientación y relaciones espaciales entre objetos en imágenes. El modelo se publica con licencia MIT y pesos completos listos para inferencia.

El modelo resuelve el problema de la falta de capacidades espaciales explícitas en los VLM genéricos, que suelen fallar en tareas como localización de objetos, estimación de distancias o descripción de disposiciones espaciales. Al estar basado en InternVL2.5, hereda una arquitectura multimodal robusta que combina un vision transformer de gran tamaño con un modelo de lenguaje, y su ajuste específico lo hace especialmente adecuado para aplicaciones que requieren razonamiento geométrico sobre escenas visuales.

Con 8.075 millones de parámetros y un tamaño de repositorio de 16,2 GB en formato safetensors, el modelo es accesible para equipos con GPUs de gama alta o media. Su relevancia actual radica en que el razonamiento espacial es una capacidad crítica para robótica, navegación autónoma, realidad aumentada y asistencia visual, y este modelo ofrece una opción open source especializada en esa tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en InternVL2.5-8B) |
| Parametros totales | 8.075.365.376 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp16 por defecto) |
| Idiomas soportados | No disponible (hereda capacidades multilingües de InternVL2.5, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenSpatial-InternVL2.5-8B es un ajuste fino del modelo InternVL2.5-8B, que a su vez es un modelo multimodal de lenguaje grande (MLLM) que combina un vision transformer (ViT) de aproximadamente 6.000 millones de parámetros con un modelo de lenguaje de 8.000 millones. La arquitectura exacta del componente espacial no se detalla en la documentación disponible, pero el fine-tuning se realizó sobre el dataset JoyAI-Image-OpenSpatial, que contiene anotaciones espaciales para entrenar al modelo en tareas de localización, relaciones espaciales y razonamiento geométrico.

No se ha publicado información sobre el proceso de entrenamiento (número de tokens, uso de RLHF o DPO, técnicas de optimización). El modelo se distribuye con pesos completos y se carga mediante `transformers` con `trust_remote_code=True`, siguiendo las recomendaciones de InternVL2.5. No se mencionan innovaciones técnicas adicionales más allá del ajuste fino específico para razonamiento espacial.

## Capacidades

- Comprensión espacial de imágenes: localización de objetos, estimación de posiciones relativas y absolutas, y descripción de disposiciones espaciales.
- Razonamiento espacial multi-paso: capacidad de inferir relaciones geométricas entre elementos de una escena (por ejemplo, "el coche está a la izquierda del semáforo").
- Generación de texto a partir de imágenes (image-text-to-text) con enfoque en descripciones espaciales.
- Conversación multimodal: soporta diálogos en los que el usuario hace preguntas sobre la disposición de objetos en una imagen.
- Integración con el ecosistema de InternVL2.5: al ser un fine-tuning, mantiene las capacidades generales de visión-lenguaje del modelo base, aunque no se especifican detalles sobre tool calling, agentes o modos de pensamiento.

## Casos de uso

- Navegación robótica: el modelo puede procesar imágenes de una cámara para identificar la posición de obstáculos y objetos, ayudando a un robot a planificar rutas seguras. Su capacidad de razonamiento espacial permite interpretar escenas dinámicas.
- Asistencia a personas con discapacidad visual: integrado en una aplicación móvil, puede describir la ubicación de objetos cotidianos (por ejemplo, "la taza está sobre la mesa, a tu derecha") a partir de una foto tomada con el teléfono.
- Análisis de imágenes médicas: en radiografías o tomografías, puede localizar estructuras anatómicas y describir su posición relativa, apoyando a radiólogos en la interpretación de imágenes.
- Conducción autónoma: procesa imágenes de cámaras de vehículos para estimar distancias y relaciones espaciales entre vehículos, peatones y señales, contribuyendo a la toma de decisiones en tiempo real.
- Realidad aumentada: en aplicaciones de AR, el modelo puede entender la disposición del entorno real para colocar objetos virtuales de forma coherente, por ejemplo, anclando un mueble virtual sobre una superficie detectada.
- Vigilancia y seguridad: analiza imágenes de cámaras de vigilancia para localizar personas u objetos en áreas específicas, facilitando la detección de intrusiones o comportamientos anómalos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un fine-tuning reciente (creado en septiembre de 2026) y no se han difundido métricas específicas para tareas de razonamiento espacial. El modelo base InternVL2.5-8B tiene resultados conocidos en benchmarks generales de visión-lenguaje, pero no se dispone de datos para esta variante espacial.

## Requisitos de hardware

- VRAM estimada: al tener 8.075 millones de parámetros y pesos en fp16 (16,2 GB), se necesitan al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits podría reducirse a unos 8-10 GB, pero no se ha confirmado compatibilidad con métodos como GPTQ o AWQ.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o similar con 24 GB de VRAM para trabajar cómodamente en fp16. En GPUs de 12 GB (como RTX 3080) solo sería viable con cuantización, aunque no está documentada.
- Despliegue: se puede usar con `transformers` y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama. Se recomienda evitar cuantización BNB 4-bit, ya que la documentación de InternVL2.5 advierte de errores significativos en el vision transformer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados a razonamiento espacial con el mismo tamaño. Como referencia, se puede comparar con el modelo base InternVL2.5-8B, que tiene la misma arquitectura pero sin el ajuste espacial. Sin embargo, no hay datos de rendimiento que permitan una comparación cuantitativa. Otras alternativas como LLaVA o Qwen-VL podrían ser comparables en tamaño, pero no se han encontrado datos de rendimiento espacial para este modelo.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de visión-lenguaje entrenado con datos de internet, puede heredar sesgos de género, raza o contexto cultural en sus descripciones.
- Riesgo de alucinación espacial: el modelo puede generar descripciones de ubicaciones que no se corresponden con la realidad de la imagen, especialmente en escenas complejas o con objetos pequeños.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que no se conoce el límite de tokens de texto que puede procesar junto con la imagen.
- Restricciones de licencia: aunque el modelo se publica con licencia MIT, el modelo base InternVL2.5-8B tiene su propia licencia (no especificada en la documentación de OpenSpatial). Se debe revisar la licencia del modelo base para uso comercial.
- Advertencia de cuantización: según la documentación de InternVL2.5, la cuantización BNB 4-bit produce errores graves en el vision transformer, por lo que no se recomienda su uso con este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/VINHYU/OpenSpatial-InternVL2.5-8B
- Proyecto OpenSpatial: https://github.com/VINHYU/OpenSpatial
- Paper (arXiv): https://arxiv.org/abs/2604.07296
- Dataset de entrenamiento: https://huggingface.co/datasets/jdopensource/JoyAI-Image-OpenSpatial
- Modelo base InternVL2.5-8B: https://huggingface.co/OpenGVLab/InternVL2_5-8B
- Blog de InternVL2.5: https://internvl.github.io/blog/2024-12-05-InternVL-2.5/
- Documentación de InternVL2.5: https://internvl.readthedocs.io/en/latest/internvl2.5/quick_start.html
