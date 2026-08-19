# voves/gemma-4-26B-A4B-it-FP8

## Resumen

El modelo `voves/gemma-4-26B-A4B-it-FP8` es una versión cuantizada en FP8 del modelo multimodal `google/gemma-4-26B-A4B-it`, desarrollado por Google DeepMind y publicado en HuggingFace por el usuario `voves`. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25,8 mil millones de parámetros totales, de los cuales solo 3,8 mil millones se activan por token, lo que lo hace eficiente en inferencia a pesar de su tamaño. Es capaz de procesar entradas de texto e imagen y generar salidas de texto, e incluye modos de pensamiento configurables para tareas de razonamiento.

Este modelo destaca por su ventana de contexto de hasta 256K tokens y su soporte multilingüe en más de 140 idiomas, lo que lo posiciona como una opción atractiva para aplicaciones empresariales y de investigación que requieren comprensión multimodal y razonamiento avanzado. La cuantización FP8 reduce el tamaño del modelo a aproximadamente 27 GB, facilitando su despliegue en hardware con VRAM limitada en comparación con la versión en BF16. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que aumenta su atractivo para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con vision encoder |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | 3,8B (según Microsoft Foundry) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | Más de 140 idiomas (según Google DeepMind); la model card del repo indica "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura MoE con un vision encoder de aproximadamente 550 millones de parámetros que soporta relación de aspecto variable y resolución ajustable. La versión FP8 aquí descrita mantiene la misma arquitectura, pero cuantiza los pesos a precisión de 8 bits en coma flotante, lo que reduce el uso de memoria y acelera la inferencia en hardware compatible con FP8, como las GPUs Hopper y Ada Lovelace.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. Sin embargo, el modelo base es un modelo instructivo multimodal que incorpora "thinking modes" configurables, lo que sugiere un entrenamiento orientado a tareas de razonamiento complejo. La cuantización FP8 se realizó con la librería `compressed-tensors`, preservando las capacidades del modelo original.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (multimodal).
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Modos de pensamiento configurables ("thinking modes") que permiten activar o desactivar el razonamiento paso a paso según la tarea.
- Soporte multilingüe en más de 140 idiomas, con especial énfasis en inglés.
- Comprensión de imágenes con relación de aspecto variable, útil para documentos, diagramas y fotografías.
- Capacidad de manejar contextos muy largos (hasta 256K tokens), adecuado para análisis de documentos extensos o conversaciones de múltiples turnos.

## Casos de uso

- Análisis de documentos técnicos y científicos: el modelo puede procesar páginas escaneadas, diagramas y tablas junto con texto, extrayendo información relevante y respondiendo preguntas sobre el contenido gracias a su ventana de 256K tokens y su visión multimodal.
- Asistente de programación en entornos de desarrollo: con su capacidad de generación de código y razonamiento, puede integrarse en IDEs o pipelines de CI/CD para revisar código, sugerir correcciones y generar tests unitarios.
- Atención al cliente automatizada multilingüe: su soporte en más de 140 idiomas y su capacidad de mantener conversaciones largas permiten construir chatbots que gestionan incidencias complejas sin perder el hilo de la conversación.
- Extracción de información de imágenes médicas o de ingeniería: aunque no es un modelo especializado en diagnóstico, puede describir y analizar imágenes técnicas, ayudando a resumir informes o a buscar patrones visuales.
- Generación de contenido educativo: puede crear explicaciones, resúmenes y ejercicios a partir de libros de texto, imágenes y otros materiales, adaptándose al nivel del estudiante.
- Investigación en IA multimodal: sirve como base para fine-tuning en tareas específicas de visión y lenguaje, gracias a su licencia Apache 2.0 y a su disponibilidad en FP8, que reduce los requisitos de hardware para experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión cuantizada FP8. El modelo base `google/gemma-4-26B-A4B-it` ha sido evaluado por Google DeepMind en tareas estándar como MMLU, HumanEval y GSM8K, pero esos resultados no se incluyen en la documentación consultada. Se recomienda consultar la ficha técnica oficial de Google para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo FP8 ocupa aproximadamente 26 GB de pesos, por lo que se recomienda al menos 32 GB de VRAM para inferencia con overhead de activaciones y cache KV. Con cuantización adicional (por ejemplo, 4 bits) podría caber en GPUs de 24 GB.
- GPUs recomendadas: NVIDIA A100 40GB/80GB, H100, RTX 6000 Ada, o cualquier GPU con soporte nativo FP8 (RTX 4090 no tiene soporte FP8 completo, pero puede ejecutar el modelo con emulación o cuantización adicional).
- En GPUs de consumo: no cabe en RTX 4090 (24 GB) sin cuantización adicional; una RTX 3090 (24 GB) tampoco es suficiente en FP8. Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M), podría ejecutarse en 16-18 GB de VRAM.
- Opciones de despliegue: vLLM (con soporte FP8), TensorRT-LLM, llama.cpp (si se convierte a GGUF), Ollama (mediante integración con llama.cpp), y HuggingFace TGI.
- Latencia y throughput: no se dispone de datos medidos. En FP8, se espera un throughput superior al de la versión BF16 en GPUs con soporte nativo, pero los valores concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para esta versión FP8. A continuación se comparan características técnicas con otros modelos multimodales de tamaño similar:

| Modelo | Arquitectura | Parametros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (FP8) | MoE multimodal | 25,8B | 3,8B | 256K | Apache 2.0 |
| Gemma 3 27B IT | Dense multimodal | 27B | 27B | 128K | Gemma Terms of Use |
| Qwen2.5-VL-32B | Dense multimodal | 32B | 32B | 128K | Apache 2.0 |

La principal ventaja del modelo aquí descrito frente a alternativas densas es su menor número de parámetros activos, lo que reduce el coste computacional por token. Sin embargo, su licencia Apache 2.0 es más permisiva que la de Gemma 3, que requiere aceptación de términos específicos. Los resultados de rendimiento no se han incluido por falta de datos verificables.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo entrenado con datos web, puede reflejar sesgos de género, raza o cultura presentes en esos datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- La cuantización FP8 puede introducir una ligera degradación en la precisión en comparación con la versión BF16, aunque en la mayoría de los casos es despreciable.
- La model card del repo indica solo "en" como idioma, aunque Google afirma soporte para más de 140 idiomas; se recomienda verificar el comportamiento en idiomas distintos del inglés antes de su uso en producción.
- El modelo es multimodal (imagen + texto), pero no genera imágenes; solo procesa imágenes como entrada.
- La ventana de contexto de 256K tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y requiere memoria adicional para la cache KV.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/voves/gemma-4-26B-A4B-it-FP8
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación en Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Gemma-4-26B-A4B-IT
- Guía de despliegue en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
