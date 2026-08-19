# zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF avanzadas del modelo **Qwen3.8-27B-Uncensored**, desarrolladas por el usuario `zerodigest` mediante un compilador propio denominado **YMQ-Compiler (v2.0)**. El modelo base, creado por JonathanColetti, es una versión "uncensored" (sin capas de rechazo) de un Qwen3.8-27B, que combina arquitectura Transformer (Multi-Head Attention) con bloques Mamba (State Space Model, SSM). El resultado es un modelo híbrido de aproximadamente 27,3 mil millones de parámetros.

La relevancia de esta ficha radica en su enfoque de cuantización mixta consciente de la arquitectura, inspirada en Intel AutoRound. En lugar de aplicar una profundidad de bits uniforme, el YMQ-Compiler asigna dinámicamente más precisión a las capas críticas de razonamiento y a las rutas de atención/SSM, mientras comprime las capas de almacenamiento de hechos. Esto permite mantener una perplejidad baja en contextos largos y soportar motores de especulación multi-token (MTP), lo que lo hace especialmente atractivo para entornos de desarrollo de código asistido por IA como RooCode o Aider.

El repositorio ofrece cinco niveles de cuantización (XXS, XS, M, L y XL) que van desde aproximadamente 11 GB hasta 19 GB, permitiendo ajustar el consumo de VRAM según el hardware disponible. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque el carácter "uncensored" del modelo base introduce consideraciones éticas y de seguridad importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer (Multi-Head Attention) + Mamba (SSM) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible oficialmente. El README menciona degradación en el preset XXS a partir de 50k de contexto, lo que sugiere soporte de contexto largo |
| Tipos de cuantizacion | GGUF con cuantización mixta personalizada (YMQ). Presets XXS, XS, M, L, XL. Mezclas de IQ4_XS, IQ4_NL, IQ3_XXS y bases de 2 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base **JonathanColetti/Qwen3.8-27B-Uncensored** es una variante "abliterada" de un Qwen3.8-27B, un modelo híbrido que intercala capas de atención tradicional con bloques Mamba (SSM). La abliteración elimina los mecanismos de rechazo y las capas de seguridad entrenadas, permitiendo que el modelo responda sin restricciones artificiales. No se especifican los datos de entrenamiento originales (número de tokens, composición del dataset) ni si se aplicaron técnicas como RLHF o DPO en el modelo base.

La innovación principal de este repositorio reside en el proceso de cuantización **YMQ-Compiler (v2.0)**. Este compilador analiza los pesos en espacio logarítmico para detectar clústeres de importancia estadística. Aplica un "Fading Boundary Tapering" que protege las primeras capas de entrada con mayor precisión (IQ4_NL, IQ4_XS, IQ3_XXS), aísla las rutas de atención y SSM con "Gate Insulation" para evitar ruido en el seguimiento de contexto, y utiliza "Asymmetric Vocabulary Shielding" para fijar las capas de salida y evitar bucles de formato o fugas de etiquetas API. El resultado es una cartera de precisión mixta que no requiere días de entrenamiento de optimización, sino un análisis instantáneo de importancia.

## Capacidades

- Generación de texto y razonamiento complejo heredado del modelo base Qwen3.8-27B.
- Soporte nativo para motores de especulación multi-token (MTP) en paralelo, lo que reduce la latencia en decodificación especulativa.
- Optimización específica para entornos de desarrollo de código con APIs de ejecución, como RooCode y Aider.
- Capacidad "uncensored": elimina los rechazos artificiales y las respuestas evasivas típicas de los modelos alineados.
- Mantenimiento de la coherencia en tareas multi-turno y de razonamiento multi-paso gracias al aislamiento de las rutas Mamba y Attention.
- Capacidades multilingües: no disponibles en la documentación proporcionada, aunque se heredan del modelo base.
- Naturaleza conversacional (tag incluido en el repositorio).

## Casos de uso

- Asistente de codificación local con RooCode o Aider: el preset M (~14 GB) está recomendado por el autor como el punto óptimo, ya que libera aproximadamente 5 GB de VRAM adicionales para el contexto, permitiendo bucles de edición de código más largos sin degradación.
- Generación de código en producción con especulación MTP: la compatibilidad con predicción multi-token permite integrar el modelo en pipelines de CI/CD donde la latencia de generación es crítica, acelerando la autocompletación de archivos.
- Agentes autónomos multi-paso: la "Gate Insulation" sobre las rutas de atención y SSM asegura que el modelo no pierda el hilo en tareas que requieren planificación y ejecución secuencial de herramientas.
- Análisis y refactorización de código legacy: la optimización para contexto largo (mencionada hasta 50k+ en presets superiores) permite procesar archivos de código extensos o múltiples archivos en una sola pasada.
- Despliegue en entornos con VRAM limitada: los presets XXS (~11 GB) y XS (~12,2 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB), aunque con mayor ruido de compresión.
- Prototipado rápido de chatbots sin restricciones de seguridad: útil para investigación en entornos controlados donde se necesita explorar respuestas sin filtros, siempre bajo advertencias éticas.

## Benchmarks y rendimiento

El autor proporciona métricas de perplejidad (WikiText-2, ventana de contexto de 4096) evaluadas con `llama-perplexity`. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Variante | Tamano del archivo | Perplejidad (menor es mejor) |
| :--- | :--- | :--- |
| XXS | ~11,0 GB | 7,2375 |
| XS | ~12,2 GB | 8,0351 |
| M (recomendado) | ~14,0 GB | 6,8176 |
| L | ~17,0 GB | 6,9832 |
| XL | ~19,0 GB | 6,8329 |
| Modelo base (BF16) | - | 6,8413 |

Según el autor, el preset M supera al modelo base en perplejidad (6,8176 frente a 6,8413), atribuyéndolo a la eliminación de las capas de rechazo y a la asignación de precisión en espacio logarítmico.

## Requisitos de hardware

- Presets y tamaños: XXS (~11 GB), XS (~12,2 GB), M (~14 GB), L (~17 GB), XL (~19 GB).
- VRAM estimada para inferencia: los presets XXS y XS caben en GPUs de consumo con 12-16 GB (RTX 3060, RTX 4070, RTX 4080). El preset M requiere al menos 16 GB (RTX 4080, RTX 4090, A5000). Los presets L y XL necesitan 24 GB o más (RTX 4090, A6000, A100).
- GPU recomendadas: para el preset M, una RTX 4090 (24 GB) es ideal. Para XL, una A100 o H100 de 40-80 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF y MTP), TGI (Text Generation Inference).
- Latencia y throughput: no disponible en la documentación. El soporte MTP sugiere una mejora significativa en la velocidad de decodificación especulativa, pero no se aportan cifras concretas.

## Comparativa con modelos similares

Dado que el modelo base es un híbrido Mamba+Attention de ~27B, se puede comparar con alternativas del mismo rango de tamaño en formato GGUF. Los datos de estas alternativas no están disponibles en la información proporcionada, por lo que la comparativa se limita a aspectos generales.

| Modelo | Parametros | Arquitectura | Licencia | Formato | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Qwen3.8-27B-Uncensored-YMQ (este) | ~27,3B | Híbrida Mamba + Attention | Apache-2.0 | GGUF | Cuantización mixta YMQ, soporte MTP, uncensored |
| Qwen3-32B (dense) | ~32B | Transformer denso | Apache-2.0 | GGUF | Alternativa densa estándar, sin soporte MTP nativo en cuantizaciones comunes |
| Qwen3-30B-A3B (MoE) | ~30B (3B activos) | MoE | Apache-2.0 | GGUF | Menor VRAM en activos, pero requiere más memoria total |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval) para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": al eliminar las capas de rechazo, el modelo puede generar contenido dañino, ilegal, ofensivo o sexualmente explícito. No es apto para despliegue en producción sin filtros de seguridad adicionales.
- La cuantización mixta agresiva (bases de 2 bits en capas de almacenamiento de hechos) puede degradar la precisión factual en tareas de conocimiento general, aunque el autor afirma que el preset M mantiene la lógica de razonamiento.
- El preset XXS sufre una degradación notable en llamadas a API a partir de 50k de contexto, lo que limita su uso en tareas de codificación extensas.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización, por lo que la evaluación del rendimiento se basa únicamente en perplejidad.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente o de nicho, con soporte comunitario limitado y posible falta de validación externa.
- La licencia Apache-2.0 permite uso comercial, pero el uso de un modelo "uncensored" puede tener implicaciones legales y éticas dependiendo de la jurisdicción y el caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF
- Modelo base (JonathanColetti/Qwen3.8-27B-Uncensored): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- No se proporcionan papers, blogs, repositorios de código ni demos adicionales en la información disponible.
