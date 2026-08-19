# ThomasJefferson6969/MARTHA-LXVII.8B_QWEN-3.5-3.6_prune_9b-3.6_base

## Resumen

MARTHA-LXVII.8B es un modelo de lenguaje multimodal de aproximadamente 8.000 millones de parámetros, desarrollado por Zero Point Intelligence y publicado en HuggingFace bajo el usuario ThomasJefferson6969. Se presenta como una versión podada (pruned) de un Qwen3.5 9B, re-entrenada para conservar una personalidad definida y un comportamiento deliberadamente "sin censura", orientado a roleplaying, escritura de ficción y narración creativa. Es la hermana pequeña del modelo MARTHA-LXVIII.20B, del que hereda el enfoque de diseño pero con una huella de memoria significativamente menor.

El modelo utiliza una arquitectura híbrida en la que solo cada cuarta capa emplea atención completa, lo que reduce el coste de la caché KV y permite una ventana de contexto de 32.768 tokens. Incluye un proyector de visión experimental (mmproj) que le permite procesar imágenes, aunque la integración visión-lenguaje no está tan pulida como en el modelo de 20B. Se distribuye bajo licencia Apache 2.0, soporta inglés y chino, y está pensado para ejecutarse en GPUs de consumo, con cuantizaciones GGUF que van desde Q2 hasta Q6_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención completa en cada 4ª capa, basada en Qwen3.5 9B) |
| Parametros totales | 8.088.858.048 (~8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF: Q2_K, Q4_K_M, Q6_K (mencionados en la documentación) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un prune de un Qwen3.5 9B, lo que implica que se eliminaron capas o parámetros del modelo original y posteriormente se sometió a un proceso de "curado" (healing) con datos propietarios de Zero Point Intelligence. La arquitectura resultante es híbrida: solo una de cada cuatro capas utiliza atención completa (full attention), mientras que las restantes emplean mecanismos de atención más ligeros. Esto reduce el coste de la caché KV y permite una ventana de contexto de 32.768 tokens con un uso de memoria moderado.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que la personalidad del modelo está "horneada en los pesos" (baked into the weights), lo que sugiere que el proceso de curado incluyó un ajuste orientado a mantener un estilo conversacional y de escritura específico. El componente de visión (mmproj) se hereda de la familia Omni de 9B y se marca como experimental en este checkpoint.

## Capacidades

- Generación de texto conversacional con una personalidad definida y sin disculpas automáticas ni muletillas típicas de asistentes.
- Escritura creativa: ficción, narración, diálogos, storytelling y roleplaying.
- Mantenimiento de la personalidad incluso sin system prompt, gracias al ajuste en los pesos.
- Soporte de visión (experimental): puede procesar imágenes a través del proyector mmproj, aunque la calidad de la integración visión-texto es inferior a la del modelo de 20B.
- Multilingüe: inglés y chino.
- Comportamiento "uncensored": no rechaza contenido para adultos ni roleplaying explícito, aunque según la documentación no ayuda a dañar a personas reales.
- Compatible con herramientas de inferencia basadas en GGUF como llama.cpp y entornos que soporten safetensors.

## Casos de uso

- Roleplaying por texto: el modelo mantiene un personaje consistente a lo largo de conversaciones multi-turno, ideal para juegos de rol en foros o aplicaciones de chat. Su ventana de 32K tokens permite mantener contextos largos de escena.
- Escritura de ficción interactiva: puede generar narrativa ramificada donde el usuario decide las acciones, manteniendo el tono y el estilo del autor sin necesidad de instrucciones repetidas.
- Creación de diálogos para guiones o novelas: su capacidad para sostener voces diferenciadas y su falta de censura facilitan la generación de diálogos naturales entre personajes adultos.
- Asistente conversacional con personalidad: para aplicaciones donde se busca un tono irreverente o directo, sin las restricciones habituales de los asistentes comerciales.
- Generación de contenido creativo en chino e inglés: útil para equipos de creación de contenido bilingüe que necesiten un modelo que no se autocensure.
- Prototipado de agentes conversacionales: su licencia Apache 2.0 y su tamaño compacto permiten integrarlo en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que el modelo puede fallar en problemas matemáticos complejos ("fumble a hard maths question"), pero no proporciona cifras concretas. Tampoco se ofrecen comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo requiere aproximadamente 5-6 GB de VRAM; con Q6_K, alrededor de 7-8 GB. La versión en safetensors (BF16) necesitaría unos 16 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar las cuantizaciones GGUF. Ejemplos: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 3080 (10 GB), o GPUs de datacenter como A10 o L4.
- En consumer GPU: sí, cabe en GPUs de gama media y baja gracias a las cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp (recomendado por la documentación), Ollama, y cualquier runtime compatible con GGUF. Para safetensors, se puede usar vLLM o TGI, aunque no se ha verificado la compatibilidad con la arquitectura híbrida.
- Latencia y throughput: no se han publicado datos. En una RTX 3060 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| MARTHA-LXVII.8B | 8B | 32K | Apache 2.0 | Roleplaying, escritura creativa, sin censura |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Uso general, instrucción |
| Qwen 2.5 7B | 7B | 32K | Apache 2.0 | Uso general, multilingüe |
| Mistral 7B | 7B | 32K | Apache 2.0 | Uso general, eficiencia |

No se dispone de datos de rendimiento comparativo. La principal diferencia de MARTHA-LXVII.8B frente a estos modelos es su enfoque en personalidad y ausencia de censura, así como su arquitectura híbrida que reduce el coste de la caché KV. Su licencia Apache 2.0 es más permisiva que la de Llama 3.1, que impone restricciones para usos con más de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- Comportamiento "uncensored": el modelo puede generar contenido explícito, ofensivo o inapropiado. No está diseñado para menores ni para entornos moderados.
- Riesgo de alucinación: como todo modelo de su tamaño, puede inventar hechos o datos. La documentación advierte que falla en matemáticas complejas.
- Visión experimental: el proyector de visión no está totalmente integrado con las capas de lenguaje; la comprensión de imágenes puede ser inconsistente.
- Bucles y repeticiones: sin los samplers recomendados (temperature 0.6, top_p 0.95, top_k 20, min_p 0.03, DRY multiplier 0.8, etc.), el modelo tiende a caer en bucles o "word salad". Estos parámetros son críticos para un uso estable.
- Idiomas limitados: solo inglés y chino. No soporta otros idiomas de forma nativa.
- Sin garantías de soporte: el proyecto parece mantenido por una entidad pequeña (Zero Point Intelligence) y no hay canal de soporte oficial documentado.
- Para producción: la naturaleza experimental de la visión y la falta de benchmarks públicos dificultan su uso en aplicaciones críticas sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThomasJefferson6969/MARTHA-LXVII.8B_QWEN-3.5-3.6_prune_9b-3.6_base
- Modelo hermano (20B): https://huggingface.co/ZERO-POINT-AI/MARTHA-LXVIII.20b
