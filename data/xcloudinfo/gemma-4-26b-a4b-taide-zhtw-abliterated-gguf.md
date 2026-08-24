# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF

## Resumen
Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF es una adaptación del modelo Gemma 4 de Google DeepMind, específicamente de la variante TAIDE (Taiwan AI Lab) optimizada para chino tradicional. El desarrollador xCloudinfo ha aplicado una técnica de "abliteration" para reducir la tendencia excesiva del modelo a rechazar preguntas legítimas, sin necesidad de reentrenamiento. El modelo resultante mantiene la calidad del chino tradicional del original, pero con una respuesta más fluida ante consultas de doble uso o límite legal.

Se trata de un modelo multimodal (texto e imagen) con arquitectura Mixture-of-Experts (MoE) de 26 mil millones de parámetros totales y 4 mil millones activos. Está disponible en formato GGUF con múltiples niveles de cuantización, incluyendo el proyector de visión (mmproj) para conversaciones texto-imagen. Su relevancia radica en ofrecer una alternativa en chino tradicional con menos restricciones de rechazo, pensada para entornos de investigación, análisis de datos y desarrollo de agentes conversacionales en Taiwán.

La versión abliterated elimina el "dirección de rechazo" identificada en la capa 12 del modelo, usando la técnica de Arditi et al. (2024). Esto reduce la tasa de rechazo ante consultas de doble uso de 10/10 a 5/10 en pruebas de retención, sin degradar la calidad del chino tradicional. El modelo base original es `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, que a su vez deriva del modelo `google/gemma-4-26B-A4B-it`.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4 mil millones (A4B) |
| Longitud de contexto | 256K tokens (según Google DeepMind para Gemma 4) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (con imatrix) |
| Idiomas soportados | Chino tradicional (zh-TW) y multilíngüe (más de 140 idiomas según base) |
| Licencia | Apache-2.0 + Google Gemma 4 License + TAIDE License |
| Formato de pesos | GGUF (llama.cpp) con mmproj separado |

## Arquitectura y entrenamiento
El modelo base es un transformer multimodal con arquitectura MoE de 26 mil millones de parámetros totales y 4 mil millones activos por token. El modelo original de Google DeepMind está entrenado con datos de texto e imagen, soportando entrada de imágenes y salida de texto. La versión TAIDE de xCloudinfo se ha destilado del modelo original de Google para optimizar el chino tradicional, y la versión abliterated aplica una técnica de eliminación de la dirección de rechazo sin reentrenamiento, preservando la calidad del texto.

El proceso de abliteración se realizó mediante la técnica de Arditi et al. (2024), que identifica una única dirección en el espacio de activaciones del modelo responsable de la conducta de rechazo. Esta dirección se elimina mediante ortogonalización de los pesos en la capa 12, la capa efectiva para este modelo. El proyector de visión (mmproj) no se modificó. El entrenamiento original del modelo Gemma 4 usó técnicas de RLHF, pero la versión abliterated no requiere reentrenamiento adicional.

## Capacidades
- Generación de texto en chino tradicional y otros idiomas (más de 140).
- Entrada multimodal: procesa imágenes y texto, generando texto de salida.
- Razonamiento y análisis de documentos, con reducción de rechazos ante consultas legítimas de doble uso.
- Soporte de conversación multi-turno con contexto largo (hasta 32K tokens).
- Capacidad de procesamiento de imágenes vía proyector de visión (mmproj).
- Es compatible con herramientas de inferencia como llama.cpp y llama-server.

## Casos de uso
- Análisis de documentos en chino tradicional: el modelo puede procesar y resumir documentos extensos (hasta 32K tokens de contexto) en chino tradicional, siendo útil para empresas y organismos en Taiwán que manejan documentación legal o técnica.
- Asistencia de investigación académica: investigadores pueden usarlo para analizar literatura académica en chino tradicional, con menos rechazos ante preguntas sobre temas de doble uso como ciberseguridad o farmacología.
- Desarrollo de agentes conversacionales: su capacidad para mantener conversaciones multi-turno y su menor tendencia a rechazar preguntas legítimas lo hacen adecuado para asistentes virtuales en aplicaciones de servicio al cliente en Taiwán.
- Generación de contenido creativo: puede usarse para generar textos creativos en chino tradicional (cuentos, guiones) sin rechazar temas que podrían ser considerados sensibles pero legales.
- Análisis de imágenes con texto: gracias al proyector de visión, puede combinar imágenes y texto para tareas como descripción de imágenes o análisis de capturas de pantalla.
- Evaluación de seguridad y red teaming: diseñado para evaluaciones de seguridad de IA, permitiendo a los investigadores probar respuestas a consultas de doble uso con menos restricciones que el modelo original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se menciona una prueba de retención de seguridad: en un conjunto de pruebas de severidad, el modelo original rechazó 10/10 prompts, mientras que la versión abliterated rechazó 5/10, manteniendo la calidad de salida en chino tradicional. No hay más datos de rendimiento cuantitativos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 26 GB para Q4_K_M (con contexto 4K), 40 GB para Q8_0.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) puede ser suficiente con contexto limitado; para Q8_0 se recomienda A100 40 GB o A100 80 GB.
- En consumer GPU: Q4_K_M cabe en RTX 4090 (24 GB) con contexto reducido; Q8_0 requiere GPU de servidor.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (si soporta GGUF), vLLM (para GGUF con soporte).
- Latencia estimada: no disponible, pero en MoE de 4B activos, la inferencia es más rápida que un modelo denso de 26B; puede servir en tiempo real con GPU adecuada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW-abliterated (este) | 26B (4B activos) | 32K | Apache-2.0 + Gemma + TAIDE | GGUF |
| google/gemma-4-26B-A4B-it | 26B (4B activos) | 256K | Apache-2.0 + Gemma | Safetensors |
| Qwen2.5-32B-Instruct | 32B denso | 128K | Apache-2.0 | Safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8B denso | 128K | Llama 3.1 License | Safetensors, GGUF |

La comparativa muestra que este modelo ofrece un tamaño de parámetros activos reducido (4B) que permite inferencia eficiente, con un contexto de 32K tokens. La principal ventaja es su enfoque en chino tradicional y la abliteración. Sin embargo, no hay benchmarks disponibles para comparar su rendimiento frente a alternativas.

## Limitaciones y advertencias
- El modelo es "abliterated" pero no es "sin censura": aún rechaza consultas sobre armas, drogas, venenos y daños a infraestructura crítica.
- Puede generar contenido no seguro si se usa con fines maliciosos; el autor no es responsable del uso indebido.
- La licencia de TAIDE requiere cumplir con la legislación de Taiwán y la UE AI Act, y no se permite uso militar.
- El modelo está orientado a chino tradicional; su calidad en otros idiomas puede ser inferior al original de Google.
- La abliteración puede reducir la robustez del modelo ante prompts adversariales en comparación con el original.
- No hay garantías de rendimiento en producción; se recomienda validación en casos de uso específicos.

## Enlaces
- Hugging Face: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF
- Modelo base: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Modelo base original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de TAIDE: https://taide.tw/public/download-model
