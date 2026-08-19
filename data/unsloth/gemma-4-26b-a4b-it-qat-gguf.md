# unsloth/gemma-4-26B-A4B-it-qat-GGUF

## Resumen

El modelo `unsloth/gemma-4-26B-A4B-it-qat-GGUF` es una versión cuantizada mediante entrenamiento consciente de cuantización (QAT, por sus siglas en inglés) del modelo Gemma 4 26B A4B de Google DeepMind, preparada por Unsloth en formato GGUF para su despliegue eficiente. Se trata de un modelo multimodal de tipo Mixture-of-Experts (MoE) con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos por token, capaz de procesar texto e imágenes y generar texto. Está optimizado para ejecutarse en portátiles y equipos con recursos de memoria limitados, manteniendo una calidad cercana a la versión en bfloat16 gracias a la técnica QAT.

La relevancia de este modelo radica en que combina una ventana de contexto de hasta 256 000 tokens, soporte multilingüe declarado en más de 140 idiomas y una licencia Apache 2.0, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un modelo de gran capacidad ejecutable en hardware de consumo. Unsloth ha publicado una única cuantización GGUF (UD-Q4_K_XL) porque, según su documentación, precisiones superiores degradan la precisión en lugar de mejorarla. Además, incluye un modelo auxiliar de predicción multi-token (MTP) para decodificación especulativa, que acelera la inferencia sin cambiar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en transformer con atención de ventana deslizante y atención global |
| Parametros totales | 25 233 142 046 (25,2 B) |
| Parametros activos | 4 B (por token, según la nomenclatura A4B) |
| Longitud de contexto | Hasta 256 000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_XL (única versión publicada por Unsloth para este modelo) |
| Idiomas soportados | No disponible en los metadatos; la familia Gemma 4 declara soporte para más de 140 idiomas |
| Licencia | Apache 2.0 (con términos específicos de la licencia de Gemma 4) |
| Formato de pesos | GGUF (archivo principal) y safetensors para el modelo base no cuantizado |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Gemma 4 de Google DeepMind, que combina arquitecturas densas y MoE. En este caso, se trata de una variante MoE con 26 000 millones de parámetros totales y 4 000 millones activos por token, lo que reduce el coste computacional por inferencia. El modelo procesa entradas de texto e imagen, con soporte para resoluciones variables y proporciones de aspecto adaptativas. La versión QAT se ha entrenado con un proceso de cuantización consciente, lo que permite que los pesos cuantizados a 4 bits mantengan una calidad similar a la versión en bfloat16, reduciendo drásticamente los requisitos de memoria.

El entrenamiento específico de esta variante QAT no está documentado en los metadatos disponibles (número de tokens, composición del dataset, uso de RLHF o DPO). Sin embargo, la familia Gemma 4 incorpora modos de razonamiento configurables (thinking mode) y ha sido optimizada para tareas de generación de texto, codificación y razonamiento. Una innovación destacable es la inclusión de un modelo drafter MTP (Multi-Token Prediction) en el repositorio, que permite decodificación especulativa: el drafter propone hasta 4 tokens por paso y el modelo principal los verifica, acelerando la inferencia sin alterar la salida.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto para producir respuestas textuales, con soporte para razonamiento de varios pasos y modos de pensamiento configurables.
- Codificación y matemáticas: la familia Gemma 4 está diseñada para tareas de programación y razonamiento matemático, aunque no se publican benchmarks específicos para esta variante.
- Tool calling y uso de agentes: la documentación de Unsloth muestra ejemplos de ejecución con tool-calling en Unsloth Studio, lo que indica soporte para integración con herramientas externas.
- Multilingüe: declarado soporte para más de 140 idiomas en la familia Gemma 4.
- Contexto largo: ventana de hasta 256 000 tokens, adecuada para documentos extensos, conversaciones multi-turno y análisis de código de gran tamaño.
- Decodificación especulativa: gracias al drafter MTP incluido, se puede acelerar la generación sin pérdida de calidad.
- Multimodalidad limitada: a diferencia de las variantes E2B, E4B y 12B, este modelo de 26B A4B no soporta entrada de audio (solo texto e imagen).

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar este modelo en un portátil con GPU para obtener sugerencias de código, explicaciones y refactorización sin depender de servicios en la nube. Su ventana de 256K tokens permite procesar repositorios completos o archivos de gran tamaño.
- Análisis de documentos técnicos con imágenes: al aceptar entrada de imágenes, puede utilizarse para extraer información de diagramas, capturas de pantalla o esquemas dentro de documentación técnica, combinando el texto circundante con el contenido visual.
- Chat de atención al cliente con contexto prolongado: su contexto largo permite mantener conversaciones multi-turno extensas con historial completo, útil para sistemas de soporte que necesitan recordar interacciones previas sin truncar.
- Generación de informes a partir de datos visuales: en entornos de análisis de datos, puede procesar gráficos o tablas como imágenes y generar resúmenes textuales, integrándose en pipelines de automatización.
- Desarrollo de agentes autónomos: con soporte de tool calling, puede orquestar llamadas a APIs, ejecutar comandos o interactuar con bases de datos, sirviendo como núcleo de agentes que requieren razonamiento multi-paso.
- Prototipado de aplicaciones multimodales: investigadores y desarrolladores pueden crear prototipos de aplicaciones que combinen visión y lenguaje (por ejemplo, descripción de imágenes médicas o análisis de contenido visual) sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluación comparativa (MMLU, HumanEval, GSM8K, etc.) para esta variante QAT. La documentación de Unsloth menciona que la calidad es cercana a la versión bfloat16, pero no proporciona cifras concretas.

## Requisitos de hardware

- Según la documentación de Unsloth, las variantes QAT de 26B A4B y 31B están diseñadas para ejecutarse en portátiles, no solo en GPUs domésticas potentes. Esto sugiere que puede funcionar en GPUs con 16 GB de VRAM o menos, aunque no se especifica el valor exacto.
- El repositorio ocupa 57,1 GB en total, pero el archivo GGUF principal (UD-Q4_K_XL) es el único necesario para inferencia; su tamaño individual no se indica en los metadatos.
- Para la decodificación especulativa con el drafter MTP, se recomienda usar llama.cpp con la opción `--spec-type draft-mtp`, que comparte la caché KV con el modelo principal.
- Opciones de despliegue: llama.cpp (compatible con `-hf` para descarga automática), Ollama, y potencialmente vLLM mediante la versión de tensores comprimidos (w4a16) disponible en la colección de Unsloth.
- No se proporcionan datos de latencia o throughput. La aceleración por MTP puede mejorar la velocidad de generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (QAT GGUF) | 25,2 B | 4 B | 256K | Apache 2.0 | GGUF |
| Gemma 4 12B (QAT GGUF) | 12 B | 12 B (denso) | 256K | Apache 2.0 | GGUF |
| Gemma 4 31B (QAT GGUF) | 31 B | 31 B (denso) | 256K | Apache 2.0 | GGUF |
| Qwen2.5-32B-A3B (MoE, referencia) | 32,8 B | 3 B | 128K | Apache 2.0 | GGUF |

La comparativa se basa en datos estructurales, ya que no hay benchmarks públicos para esta variante. El modelo 26B A4B ofrece un equilibrio entre capacidad y eficiencia: más parámetros activos que el Qwen2.5-32B-A3B (4B frente a 3B) y mayor contexto (256K frente a 128K), pero con un tamaño total menor que el Gemma 4 31B denso. La ventaja principal sobre el 12B denso es la mayor capacidad de razonamiento y multimodalidad, aunque el 12B soporta audio, algo que el 26B A4B no ofrece.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinación específicas para esta variante QAT. Como modelo de gran tamaño, puede presentar sesgos presentes en los datos de entrenamiento y generar respuestas plausibles pero incorrectas.
- La entrada de audio no está soportada en este modelo (solo texto e imagen), a diferencia de las variantes más pequeñas de la familia Gemma 4.
- La cuantización Q4_K_XL puede introducir degradaciones sutiles en tareas de precisión numérica o razonamiento matemático complejo, aunque Unsloth afirma que es la precisión óptima para este modelo.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos adicionales de la licencia de Gemma 4 (enlazada en la model card) para asegurar el cumplimiento, especialmente en lo relativo a atribución y restricciones de uso.
- El modelo no incluye un sistema de moderación de contenido integrado; los desarrolladores deben implementar sus propias salvaguardas para aplicaciones de producción.
- El archivo GGUF único (UD-Q4_K_XL) no permite elegir otras cuantizaciones; si se necesita una precisión diferente, hay que acudir a la versión no QAT del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Guía de Unsloth para ejecutar Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Guía de Unsloth para Gemma 4 QAT: https://unsloth.ai/docs/models/gemma-4/qat
- Guía de Unsloth para MTP (decodificación especulativa): https://unsloth.ai/docs/models/mtp
- Colección de Unsloth con todas las versiones QAT de Gemma 4: https://huggingface.co/collections/unsloth/gemma-4-qat
- Blog de lanzamiento de Gemma 4 (Google): https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Repositorio de Gemma en GitHub: https://github.com/google-gemma
