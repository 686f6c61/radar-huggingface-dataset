# tbhrc/phi_3_5_mini_instruct_4bit

## Resumen

El modelo `tbhrc/phi_3_5_mini_instruct_4bit` es una conversión al formato MLX (Machine Learning for Apple Silicon) con cuantización de 4 bits del modelo Phi-3.5-mini-instruct, desarrollado originalmente por Microsoft. Esta versión específica, publicada por el usuario `tbhrc`, ofrece el modelo en un formato optimizado para ejecución en dispositivos Apple con chips M1/M2/M3, facilitando la inferencia local con bajo consumo de recursos. El modelo original de Microsoft es un transformer causal (decoder-only) de 3.800 millones de parámetros, diseñado para tareas de generación de texto, código, conversación y razonamiento, con un enfoque en la seguridad y el seguimiento de instrucciones mediante técnicas de entrenamiento avanzadas como SFT (supervised fine-tuning), PPO (proximal policy optimization) y DPO (direct preference optimization). Esta versión cuantizada mantiene las capacidades del modelo original en un paquete de aproximadamente 2,2 GB, lo que lo hace viable para despliegues en entornos con recursos limitados.

La relevancia de este modelo radica en su equilibrio entre rendimiento y eficiencia: al ser de 4 bits, reduce el consumo de memoria y acelera la inferencia en hardware de consumo, mientras que conserva un rendimiento competitivo para tareas de conversación y generación de código. Es especialmente útil para desarrolladores que necesitan un modelo multilingüe de tamaño medio, con licencia MIT (permisiva para uso comercial) y que puede integrarse fácilmente en aplicaciones mediante la librería `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 3,8B (modelo original) / 597.212.160 (dato del repo, posible error) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Multilingue (detalle no especificado) |
| Licencia | MIT |
| Formato de pesos | Safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base es Phi-3.5-mini-instruct, un transformer causal de 3,8 mil millones de parametros, diseñado para generación de texto autoregresiva. Su arquitectura se basa en la familia Phi-3, con mejoras específicas en el seguimiento de instrucciones y seguridad, logradas mediante un proceso de entrenamiento en tres fases: supervisión fina (SFT), optimización de política proximal (PPO) y optimización de preferencias directas (DPO). El modelo fue entrenado con un dataset diverso y multilingue, aunque los detalles exactos de la composición de los datos no se proporcionan en la información disponible. La versión `tbhrc` es una conversión a MLX realizada con la librería `mlx-lm` versión 0.17.0, que aplica cuantización de 4 bits para reducir el tamaño y los requisitos de memoria. Se ha observado una discrepancia en el número de parámetros reportado en el repositorio (597.212.160), que no coincide con los 3,8B del modelo original; esto probablemente se deba a un error en el registro de Hugging Face, ya que el tamaño del archivo (2,2 GB) es consistente con un modelo de 3,6B en cuantización de 4 bits.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextuales en múltiples idiomas.
- Seguimiento de instrucciones: optimizado para tareas conversacionales y de asistencia, con mejora en la adherencia a instrucciones complejas.
- Generación de código: soporta tareas de programación en varios lenguajes, útil para autocompletado y asistencia en desarrollo.
- Razonamiento: capacidad de razonamiento básico y resolución de problemas de lógica y matemáticas.
- Multilingüismo: soporta múltiples idiomas, aunque la lista específica no se detalla.
- Compatibilidad con MLX: diseñado para ejecutarse eficientemente en hardware Apple Silicon, con integración directa en `mlx-lm`.

Nota: no se han encontrado en la información disponible capacidades específicas de tool calling, agentes o modo de razonamiento extendido (thinking mode); estas características no están documentadas en el repositorio.

## Casos de uso

- Asistencia conversacional en aplicaciones móviles: al ser un modelo ligero (2,2 GB), puede integrarse en apps de iOS o macOS para chat sin conexión, aprovechando la aceleración de MLX en chips Apple.
- Generación de código en entornos de desarrollo: soporta autocompletado y generación de fragmentos de código en IDEs, con respuesta rápida gracias a la cuantización de 4 bits.
- Chatbots de atención al cliente: puede gestionar conversaciones multi-turno en varios idiomas, ideal para sistemas de soporte automatizado en empresas con necesidades de despliegue local.
- Procesamiento de texto en español: con su capacidad multilingüe, es adecuado para tareas de resumen, traducción y análisis de sentimiento en español, sin depender de APIs externas.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden experimentar con un modelo de 3.8B en hardware de consumo (Apple Silicon) sin necesidad de GPU dedicadas.
- Inferencia en dispositivos de borde: su tamaño compacto permite ejecución en dispositivos con memoria limitada, como ordenadores portátiles o sistemas embebidos con macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. El modelo es una conversión de un modelo existente, por lo que los benchmarks del Phi-3.5-mini-instruct original podrían ser consultados en la documentación de Microsoft, pero no se incluyen en este repositorio.

## Requisitos de hardware

- **VRAM estimada**: el modelo cuantizado a 4-bit ocupa aproximadamente 2,2 GB en disco. Para inferencia, se recomienda al menos 4 GB de VRAM o RAM unificada (en Apple Silicon), considerando el contexto y los activos intermedios.
- **GPU recomendadas**: funciona de forma óptima en Apple Silicon (M1, M2, M3, M4) gracias a la integración con MLX. En GPUs de NVIDIA, se puede convertir a otros formatos (por ejemplo, GGUF) y ejecutar con llama.cpp, pero no es el formato nativo.
- **Compatibilidad con GPUs de consumo**: sí, puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, como la RTX 3050, RTX 4060, o GTX 1660 (si se convierte a GGUF), aunque el rendimiento puede variar.
- **Opciones de despliegue**: el formato MLX se usa con `mlx-lm` (pip install mlx-lm). Para otros frameworks, es necesario convertir el modelo a GGUF (por ejemplo, con `llama.cpp`) o usar `transformers` con cuantización adicional.
- **Latencia y throughput**: no se proporcionan datos concretos, pero en Apple Silicon se puede esperar una generación de ~20-30 tokens/s en un M2, dependiendo del contexto y la longitud de la respuesta.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Sin embargo, se puede comparar a nivel de parámetros y licencia con modelos de la misma categoría:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phi-3.5-mini-instruct (este) | 3.8B | No disponible | MIT | HuggingFace, MLX |
| Llama-3.2-3B | 3.2B | 128K | Meta Llama | HuggingFace |
| Qwen2.5-3B | 3B | 32K | Apache 2.0 | HuggingFace |
| Mistral-7B | 7B | 32K | Apache 2.0 | HuggingFace |

Nota: los datos de contexto de los modelos comparados no están disponibles en la información proporcionada, por lo que se indican con "no disponible" o se omiten. La comparación se basa únicamente en el tamaño de parámetros y licencia, que sí se conocen.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo puede heredar sesgos de los datos de entrenamiento originales de Microsoft, no se especifican detalles en este repositorio.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo.
- **Limitaciones de contexto**: la longitud de contexto no está documentada en el repositorio, por lo que se recomienda consultar la documentación oficial de Microsoft para conocer el límite real (posiblemente 128K tokens en el modelo original, pero no confirmado aquí).
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero es necesario verificar si el modelo base (Phi-3.5) tiene restricciones adicionales en la documentación de Microsoft (aunque en general es permisiva).
- **Caveat para producción**: al ser una conversión de un modelo de terceros, no hay garantía de soporte oficial. Además, el formato MLX está limitado a Apple Silicon, por lo que para otros entornos se requiere conversión adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tbhrc/phi_3_5_mini_instruct_4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Versión GGUF (de la comunidad): https://huggingface.co/RichardErkhov/microsoft_-_Phi-3.5-mini-instruct-gguf
- Análisis y documentación del modelo: https://www.aimodels.fyi/models/huggingFace/phi-35-mini-instruct-microsoft
- Repositorio de Apple CoreAI (para on-device): https://github.com/apple/coreai-models/tree/main/models/phi
- Página de herramienta (no oficial): https://www.toolify.ai/ai-model/mlx-community-phi-3-5-mini-instruct-4bit
