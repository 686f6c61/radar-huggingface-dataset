# vedantjadhav701/SparkAI-47m-llama-latest

## Resumen

SparkAI-47M-Llama es un modelo de lenguaje de tipo transformer decoder-only, desarrollado desde cero por Vedant Sanjay Jadhav, estudiante de ingeniería en IA y ML en la Pimpri Chinchwad University (Pune, India). Con aproximadamente 47,7 millones de parámetros, sigue una arquitectura inspirada en LLaMA, con 8 capas, dimensión oculta de 512, 8 cabezas de atención con GQA (2 cabezas KV), SwiGLU y RoPE. El modelo se entrenó con unos 3.770 millones de tokens procedentes de los datasets FineWeb-Edu y Cosmopedia-v2, empaquetados y transmitidos en streaming, con una longitud de secuencia de 1024 tokens.

El modelo se presenta como un checkpoint de investigación o prueba de concepto, no destinado a producción. Su autor señala que se entrenó más allá del óptimo de Chinchilla (aproximadamente 79 tokens por parámetro), lo que explica que muestre una gramática local coherente y una coherencia temática razonable en varias frases, pero con una precisión factual todavía inconsistente. Su relevancia radica en demostrar el proceso completo de entrenamiento de un modelo desde cero con recursos limitados, y en servir como base para experimentos de fine-tuning o análisis de arquitecturas transformer a pequeña escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (8 capas, hidden 512, 8 cabezas, GQA con 2 KV heads, SwiGLU, RoPE) |
| Parametros totales | 47.718.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only clásica, similar a la de LLaMA, con normalización previa, atención multi-cabeza con agrupación de consultas (GQA) para reducir el coste de memoria, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Consta de 8 capas, una dimensión oculta de 512 y 8 cabezas de atención, de las cuales solo 2 son cabezas KV, lo que reduce el número de parámetros y la memoria necesaria durante la inferencia.

El entrenamiento se realizó desde cero con un total de aproximadamente 3.770 millones de tokens, combinando los datasets FineWeb-Edu y Cosmopedia-v2, ambos procesados en streaming y empaquetados para maximizar el uso de la ventana de contexto. No se menciona el uso de técnicas de alineación como RLHF o DPO. El autor indica que el modelo se entrenó más allá del punto óptimo de Chinchilla (79 tokens por parámetro frente a los ~20 recomendados), lo que explica que la perplejidad de evaluación sea de 31,30 y que la precisión factual sea limitada. No se detalla el número exacto de pasos ni la configuración de optimización.

## Capacidades

- Generación de texto en inglés con coherencia local y gramática básica correcta.
- Mantiene coherencia temática en secuencias de varias frases, aunque con errores factuales frecuentes.
- Capacidad limitada de razonamiento y respuesta a preguntas simples, pero sin garantía de exactitud.
- No soporta tool calling, function calling ni uso como agente autónomo.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento explícito.
- Solo funciona en inglés; no hay soporte multilingüe.
- Al ser un modelo pequeño, su capacidad de generalización y de manejo de tareas complejas es muy reducida.

## Casos de uso

- Investigación académica sobre arquitecturas transformer: el modelo sirve como banco de pruebas para estudiar el comportamiento de modelos pequeños entrenados desde cero, analizar la evolución de la perplejidad o experimentar con técnicas de regularización y ajuste fino.
- Aprendizaje y docencia: estudiantes de machine learning pueden utilizarlo para comprender el flujo completo de entrenamiento de un LLM, desde la preparación de datos hasta la inferencia, sin necesidad de grandes recursos computacionales.
- Generación de texto breve y controlada: puede emplearse para producir fragmentos de texto cortos en inglés (por ejemplo, completar frases o generar párrafos de ejemplo) en entornos donde la exactitud factual no sea crítica.
- Fine-tuning para tareas específicas: al ser un modelo pequeño y con licencia Apache-2.0, es adecuado para experimentos de ajuste fino en dominios concretos (por ejemplo, clasificación de texto o generación de formatos simples) con datasets reducidos.
- Evaluación de métricas de calidad: su perplejidad de 31,30 y su comportamiento conocido permiten usarlo como referencia para comparar otras arquitecturas o métodos de entrenamiento en condiciones similares.
- Demostración de despliegue ligero: por su tamaño, puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace útil para probar pipelines de inferencia en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la perplejidad de evaluación de 31,30, obtenida sobre el conjunto de validación durante el entrenamiento. No se dispone de comparaciones con otros modelos en tareas específicas.

## Requisitos de hardware

- VRAM estimada: con 47,7 millones de parámetros, el modelo ocupa aproximadamente 190 MB en FP32, 95 MB en FP16 y unos 48 MB en cuantización de 8 bits. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3050, etc.) es suficiente. También puede ejecutarse en CPU con un rendimiento aceptable para inferencia.
- Despliegue: compatible con frameworks como llama.cpp, Ollama, vLLM o Hugging Face Transformers. Al ser un modelo pequeño, la latencia es muy baja (del orden de milisegundos por token en GPU).
- Throughput estimado: no se dispone de mediciones oficiales, pero por su tamaño se espera un throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en la información proporcionada. Existen modelos de investigación de escala comparable (por ejemplo, los de la serie TinyStories o BabyLM), pero no se han publicado comparaciones directas. El modelo se posiciona como un checkpoint de investigación, no como un competidor de modelos comerciales o de mayor tamaño.

## Limitaciones y advertencias

- No está diseñado para uso en producción: el propio autor lo indica explícitamente en la model card.
- Precisión factual inconsistente: puede generar afirmaciones incorrectas o inventadas, especialmente en temas que requieren conocimiento del mundo.
- Contexto limitado a 1024 tokens, lo que restringe su uso en tareas que requieran ventanas largas.
- Solo soporta inglés; no hay capacidades multilingües.
- Entrenado con datos de FineWeb-Edu y Cosmopedia-v2, que pueden contener sesgos presentes en esos corpus.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo y de seguir instrucciones detalladas es muy limitada.
- No se han publicado evaluaciones de seguridad ni de sesgos, por lo que se desconoce su comportamiento en escenarios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedantjadhav701/SparkAI-47m-llama-latest
- Perfil del autor en Hugging Face: https://huggingface.co/vedantjadhav701
- Perfil de GitHub del autor: https://github.com/VedantJadhav701
- Repositorio de GitHub del autor: https://github.com/VedantJadhav701/VedantJadhav701
