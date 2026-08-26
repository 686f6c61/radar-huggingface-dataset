# Vontra/Qwen3.8-Flash-Next-MLX-oQ6

## Resumen

Qwen3.8 Flash Next MLX oQ6 es una conversión a formato MLX del modelo Qwen3.8 Flash Next de Qwen, realizada por Vontra con cuantización de precisión mixta oQ6 (base de 6 bits con módulos protegidos a 6/8 bits). El modelo original es un sistema multimodal de visión-lenguaje con arquitectura `qwen4_exp`, que combina Gated DeltaNet, Qwen Sparse Attention, capas sparse mixture-of-experts y embeddings de n-gramas hash, alcanzando 125B parámetros totales con 6B activos. Esta conversión está diseñada para ejecutarse en Apple Silicon mediante el ecosistema MLX, manteniendo una ventana de contexto de 262.144 tokens.

La relevancia de esta conversión reside en que permite ejecutar un modelo de gran capacidad y largo contexto en hardware Apple, sin necesidad de GPUs NVIDIA, con una huella de memoria reducida respecto al checkpoint BF16 original. Vontains ha validado el resultado con pruebas de generación determinista y ha publicado medidas de rendimiento en un Apple M3 Studio (19,5 tokens/s en servidor oMLX calentado). Para desarrolladores e investigadores que trabajan en entornos Apple, este modelo ofrece una vía práctica para experimentar con un MoE multimodal de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (vision-language sparse MoE) |
| Parámetros totales | 125B totales (6B activos); archivo safetensors cuantizado: 44.711.157.651 |
| Parámetros activos | 6B (10 de 512 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | oQ6 (6-bit base con módulos protegidos a 6/8-bit, grupo 32) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX safetensors (31 shards) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8 Flash Next presenta una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), junto con capas de sparse mixture-of-experts. La arquitectura consta de 48 capas, 512 expertos de los cuales 10 se activan por token, más un experto compartido. El embedding se realiza mediante hashing de n-gramas (bigramas y trigramas) con 160 dimensiones, que aportan 51B parámetros adicionales. La conversión de Vontains aplica una cuantización de precisión mixta sensible a la capa: se mide la sensibilidad de cada tensor con un proxy de 4 bits y se cuantiza directamente desde el checkpoint BF16 oficial, con un grupo de 32 para las tablas de embedding. No se documentan los detalles del entrenamiento original (número de tokens, dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Entrada multimodal: acepta imágenes y texto, genera texto (image-text-to-text).
- Generación de texto con contexto de hasta 262.144 tokens, adecuado para documentos largos con imágenes.
- Conversación multi-turno mediante el template de chat de Qwen, preservado en la conversión.
- Razonamiento y generación de contenido textual, aunque no se documentan capacidades específicas de tool calling, function calling o agentes en esta información.
- No se indica soporte para modos de pensamiento (thinking) ni audio/vídeo.

## Casos de uso

- **Análisis de documentos extensos con imágenes**: gracias a su contexto de 262K tokens, puede procesar informes técnicos, papers científicos o manuales con figuras y tablas, extrayendo información y generando resúmenes.
- **Asistente multimodal para investigación**: permite hacer preguntas sobre imágenes de experimentos, gráficas o fotografías, obteniendo respuestas razonadas en el contexto del documento.
- **Descripción de imágenes para accesibilidad**: genera descripciones detalladas de imágenes para usuarios con discapacidad visual en aplicaciones o servicios web.
- **Chatbot con memoria extendida**: en un entorno de atención al cliente, el modelo puede mantener conversaciones largas sin perder el hilo, gracias a su contexto amplio y su capacidad de procesar imágenes adjuntas.
- **Búsqueda visual dentro de un corpus**: dado un conjunto de imágenes, el modelo puede responder preguntas sobre su contenido, útil en bibliotecas de activos o sistemas de gestión de contenido.
- **Prototipado de aplicaciones multimodales en Apple Silicon**: desarrolladores que trabajan en Mac pueden integrar el modelo en aplicaciones locales de visión o asistencia, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval, GSM8K) en la información disponible. Solo se proporcionan medidas de rendimiento de generación, obtenidas en un Apple M3 Studio con el modelo ya cargado:

| Método | Resultado |
|---|---|
| Smoke test de copia exacta (standalone MLX) | 23,1 tokens/s |
| Respuesta explicativa de 142 tokens (standalone MLX) | 21,1 tokens/s |
| Respuesta de 512 tokens (oMLX server, calentado) | 19,5 tokens/s |

El tiempo de carga del modelo en el primer request de oMLX fue de 22,77 segundos, separado de la velocidad de generación. Los resultados varían según la longitud del prompt, el estado de la caché, los parámetros de muestreo, la versión del runtime y la presión de memoria.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1, M2, M3, M4). No soporta GPUs NVIDIA ni otros entornos.
- **Memoria**: el tamaño del archivo es de 155,8 GB (145,08 GiB), por lo que se recomienda un Mac con al menos 128 GB de memoria unificada para cargar el modelo completo. Un Mac Studio con M3 Max o Ultra (128 GB o más) es adecuado.
- **Almacenamiento**: se requiere espacio libre de al menos 156 GB para el modelo.
- **Runtime**: se necesita una versión de MLX-VLM o oMLX que soporte explícitamente la arquitectura `qwen4_exp`; versiones antiguas no pueden cargar el checkpoint.
- **Latencia**: en un Apple M3 Studio, se midió una velocidad de generación sostenida de 19,5 tokens/s en el servidor oMLX con una respuesta de 512 tokens.
- **Despliegue**: no es compatible con vLLM, llama.cpp, Ollama u otros runtimes convencionales; solo MLX.

## Comparativa con modelos similares

No hay información disponible para una comparativa con otros modelos de la misma categoría en los datos proporcionados. Como referencia, el mismo autor publica una conversión en 4-bit (`Vontra/Qwen3.8-Flash-Next-MLX-4bit`) que ocupará menos memoria y podría ejecutarse en hardware con menor capacidad, a costa de una menor precisión. No se han encontrado otros modelos con la misma arquitectura `qwen4_exp` en MLX.

## Limitaciones y advertencias

- **Licencia**: se utiliza la Qwen Community License 1.0, una licencia de uso específica con condiciones que deben revisarse para fines comerciales.
- **Origen**: es una conversión comunitaria, no un lanzamiento oficial de Qwen; no hay garantías de soporte.
- **Compatibilidad**: se requiere un runtime MLX-VLM con soporte explícito de `qwen4_exp`; las versiones antiguas no pueden cargar el checkpoint.
- **MTP**: no se debe adjuntar el drafter MTP de Qwen3.5 27B, ya que las dimensiones ocultas son incompatibles.
- **Memoria**: el tamaño del modelo (155,8 GB) limita su uso a equipos Apple Silicon con memoria unificada de gran capacidad (128 GB o más).
- **Idiomas**: no se ha documentado la lista de idiomas soportados; se recomienda verificar en la documentación original de Qwen.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, existe riesgo de generar contenido no fiel a la realidad; no se ha realizado una evaluación de sesgos adicional en esta conversión.

## Enlaces

- Modelo en Hugging Face: [Vontra/Qwen3.8-Flash-Next-MLX-oQ6](https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ6)
- Modelo original: [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Blog de Qwen sobre Qwen3.8 Flash Next: [https://qwen.ai/blog?id=qwen3.8-flash-next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- Repositorio MLX-VLM: [https://github.com/ml-explore/mlx-vlm](https://github.com/ml-explore/mlx-vlm)
- GitHub de Qwen3.8-Flash-Next: [https://github.com/QwenLM/Qwen3.8-Flash-Next/](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- GitHub de Qwen3.8: [https://github.com/QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- OpenLM.ai sobre Qwen3.8: [https://openlm.ai/qwen3.8/](https://openlm.ai/qwen3.8/)
