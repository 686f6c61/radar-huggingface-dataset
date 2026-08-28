# TheWirelessPhoenix/gemma-4-12b-it-mlx-mixed-3_4-bit

## Resumen

TheWirelessPhoenix/gemma-4-12b-it-mlx-mixed-3_4-bit es una conversión al formato MLX del modelo multimodal Gemma 4 12B IT de Google, cuantizado de forma mixta en 3 y 4 bits. El modelo original, desarrollado por Google, es un transformer denso sin encoder que procesa de forma nativa texto, imagen, audio y vídeo, e incorpora un modo de razonamiento explícito (thinking mode) y soporte para tool calling. Esta versión en MLX está pensada para ejecutarse en dispositivos Apple Silicon mediante la librería mlx-lm, lo que facilita su uso local en Macs con memoria unificada.

La conversión mantiene la arquitectura y capacidades del modelo base, pero reduce el tamaño en disco a 5,4 GB gracias a la cuantización mixta, lo que permite su ejecución en equipos con recursos limitados. Aunque el repositorio indica 1.537.261.360 parámetros en los safetensors, el modelo base declara 12B parámetros; esta discrepancia puede deberse a un error en el registro o a una subida parcial, por lo que se recomienda verificar el contenido real antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, encoder-free, multimodal (texto, imagen, audio, vídeo) |
| Parametros totales | 1.537.261.360 (según safetensors; el modelo base declara 12B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en esta conversión; el modelo base soporta 128K tokens |
| Tipos de cuantizacion | Mixta 3/4 bits (según nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según repo; el modelo base tiene su propia licencia Gemma) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B IT es un transformer denso sin codificador visual, lo que significa que procesa directamente los tokens de imagen, audio y vídeo junto con el texto en una única secuencia. Esta arquitectura unificada reduce la latencia y simplifica el despliegue frente a modelos con encoders separados. El entrenamiento del modelo original incluye fases de preentrenamiento y ajuste fino con instrucciones, así como optimización mediante RLHF para alinear las respuestas con preferencias humanas. Incorpora además un modo de razonamiento que genera cadenas de pensamiento antes de la respuesta final, y un protocolo nativo de tool use.

La conversión a MLX se realizó con mlx-lm 0.32.0, que transforma los pesos originales al formato de Apple Silicon. La cuantización mixta 3/4 bits reduce el tamaño del modelo a 5,4 GB, manteniendo un equilibrio entre precisión y consumo de memoria. No se dispone de información adicional sobre el dataset de entrenamiento de esta conversión concreta, ya que es una adaptación del modelo original.

## Capacidades

- Generación de texto y razonamiento conversacional en múltiples turnos.
- Comprensión multimodal nativa: puede procesar imágenes, audio y vídeo junto con texto (capacidad heredada del modelo base).
- Modo de razonamiento (thinking mode) que produce cadenas de pensamiento antes de responder.
- Soporte de tool calling / function calling para integración con APIs y agentes.
- Capacidad de seguir instrucciones complejas y mantener contexto largo (hasta 128K en el modelo base).
- Multilingüe, aunque los idiomas exactos no están especificados en esta conversión.

## Casos de uso

- Asistentes locales en Mac: al estar en formato MLX, puede ejecutarse en portátiles Apple Silicon con 16 GB de RAM unificada, sirviendo como asistente personal offline para redacción, resumen o búsqueda de información.
- Análisis de documentos multimodales: gracias a su capacidad de procesar imágenes y texto, puede extraer información de capturas de pantalla, PDFs escaneados o gráficos, útil en entornos de investigación o soporte técnico.
- Generación de código asistida: con soporte de tool calling, puede integrarse en entornos de desarrollo para autocompletar, revisar o explicar fragmentos de código, ejecutando comandos o consultando repositorios.
- Automatización de atención al cliente: su contexto largo y capacidad de razonamiento permiten gestionar conversaciones multi-turno con historial extenso, derivando consultas a APIs externas cuando es necesario.
- Prototipado de agentes conversacionales: al ser un modelo abierto y ligero (5,4 GB), es adecuado para experimentar con arquitecturas de agentes que requieren razonamiento multi-paso y uso de herramientas en entornos locales.
- Transcripción y análisis de audio: al aceptar entrada de audio, puede transcribir reuniones o podcasts y generar resúmenes estructurados, aunque esta capacidad depende del modelo base y no está garantizada en la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión concreta. El modelo base Gemma 4 12B IT ha sido evaluado por Google en tareas como MMLU, GSM8K y HumanEval, pero esos datos no se incluyen en el repositorio de esta versión MLX. Se recomienda consultar la documentación oficial de Google para obtener métricas del modelo original.

## Requisitos de hardware

- VRAM estimada: con cuantización 4 bits, el modelo ocupa aproximadamente 6 GB en memoria, más overhead de ejecución. En Mac con memoria unificada, se recomienda al menos 16 GB para un uso fluido.
- GPU recomendadas: en Apple Silicon, cualquier chip M1 Pro o superior con 16 GB de RAM unificada. En GPUs NVIDIA, podría ejecutarse en una RTX 3060 de 12 GB o superior, aunque MLX está optimizado para Apple.
- Opciones de despliegue: mlx-lm (Python), que permite carga y generación directa. También puede usarse con servidores compatibles con MLX, aunque no se mencionan vLLM u Ollama en el repositorio.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT (MLX, este repo) | 1.5B (según safetensors) / 12B base | 128K (base) | Apache 2.0 | MLX, 4-bit | Multimodal, thinking mode |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 | GGUF, safetensors | Solo texto, sin visión |
| Qwen 2.5 7B Instruct | 7B | 128K | Apache 2.0 | GGUF, safetensors | Multilingüe, tool calling |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | GGUF, safetensors | Solo texto, eficiente |

La comparativa es orientativa: Gemma 4 12B destaca por su multimodalidad y modo de razonamiento, mientras que los otros son solo texto. El tamaño real de esta conversión es incierto, por lo que la comparación de parámetros puede no ser exacta.

## Limitaciones y advertencias

- La discrepancia en el número de parámetros (1.5B vs 12B) sugiere que el repositorio puede estar incompleto o mal etiquetado; verificar la integridad de los pesos antes de usarlo en producción.
- Al ser una conversión no oficial, no hay garantía de que todas las capacidades del modelo base (especialmente visión y audio) funcionen correctamente en MLX.
- Riesgo de alucinación inherente a los modelos generativos; validar respuestas en contextos críticos.
- La licencia Apache 2.0 del repo puede no cubrir el modelo base, que tiene su propia licencia Gemma; revisar los términos de Google para uso comercial.
- No se especifican idiomas soportados; el rendimiento en lenguas distintas del inglés puede ser inferior.
- El modo de razonamiento puede aumentar la latencia y el consumo de memoria, especialmente en secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheWirelessPhoenix/gemma-4-12b-it-mlx-mixed-3_4-bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Guía de desarrollador de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Anuncio oficial de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
