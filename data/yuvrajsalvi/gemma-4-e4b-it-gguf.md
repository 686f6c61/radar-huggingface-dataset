# YuvrajSalvi/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT es un modelo multimodal de Google DeepMind, publicado en abierto bajo licencia Apache 2.0, que forma parte de la cuarta generacion de la familia Gemma. Esta ficha cubre la version cuantizada en GGUF publicada por el usuario YuvrajSalvi, derivada directamente del modelo base `google/gemma-4-E4B-it`. El modelo procesa entradas de texto, imagen y audio, y genera salida de texto, lo que lo situa en la categoria image-text-to-text. Con 4.500 millones de parametros efectivos (8.000 millones contando embeddings) y 42 capas, esta disenado para ejecucion local en portatiles y dispositivos moviles de gama alta.

La relevancia de esta publicacion radica en que la version GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles en hardware de consumo, algo imposible con los pesos de 16 bits. El repositorio incluye cuantizaciones de Unsloth Dynamic 2.0, orientadas a preservar la calidad en bits bajos. El modelo base incorpora una ventana de contexto de 128.000 tokens, soporte nativo de system prompt, function calling y modos de razonamiento configurables.

Esta ficha se centra en la version cuantizada. La informacion disponible sobre el proceso de cuantizacion especifico, los niveles exactos incluidos y los benchmarks de la version GGUF es limitada; los datos arquitectonicos y de capacidades provienen de la documentacion del modelo base Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), encoder de vision y encoder de audio |
| Parametros totales | 7.518.069.290 (pesos safetensors del modelo base); 4,5B efectivos (8B con embeddings) segun la model card |
| Parametros activos | No aplica (modelo denso; la variante MoE es 26B A4B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF con cuantizaciones dinamicas de Unsloth Dynamic 2.0 (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | Mas de 140 idiomas segun la model card del modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global, garantizando que la capa final sea siempre global. Para reducir el consumo de memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). Consta de 42 capas, un vocabulario de 262.000 tokens y modulos multimodales: un encoder de vision de aproximadamente 150 millones de parametros y un encoder de audio de aproximadamente 300 millones, ambos integrados de forma nativa en las variantes E2B y E4B.

El modelo base esta disponible en variantes preentrenada e instruction-tuned. La model card indica que toda la familia Gemma 4 esta disenada como razonadores con modos de pensamiento configurables, y que se han realizado mejoras notables en benchmarks de codigo y capacidades agenticas con soporte nativo de function calling. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. La cuantizacion GGUF de este repositorio ha sido generada con las herramientas de Unsloth, que publica sus propios benchmarks de cuantizacion dinamica.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking mode).
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de video como entrada multimodal.
- Procesamiento de audio nativo (entrada de audio en las variantes E2B y E4B).
- Generacion de codigo y matematicas, con mejoras declaradas en benchmarks de codigo respecto a generaciones anteriores.
- Soporte nativo de function calling y tool calling.
- Capacidades agenticas para flujos de multiples pasos.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Multilingue en mas de 140 idiomas.
- Ejecucion local en portatiles y telefonos de gama alta gracias al tamano reducido del modelo.

## Casos de uso

- Asistente local en portatil: el modelo cabe en equipos de consumo en cuantizacion de 4 bits y permite conversaciones multi-turno con contexto de hasta 128.000 tokens, util para analisis de documentos largos sin conexion.
- Atencion al cliente automatizada: el soporte nativo de system prompt y de conversaciones multi-turno permite definir roles y restricciones de negocio de forma estable, con function calling para consultar sistemas internos.
- Analisis de documentos con imagenes: al aceptar imagenes con resolucion y relacion de aspecto variables, puede extraer informacion de capturas, formularios escaneados y graficos dentro de un mismo flujo.
- Transcripcion y analisis de audio en local: la entrada de audio nativa en la variante E4B permite procesar notas de voz o reuniones sin enviar datos a servicios externos.
- Agentes autonomos de codigo: el function calling nativo y las capacidades agenticas permiten integrarlo en pipelines que invocan herramientas, ejecutan tests y aplican parches de forma iterativa.
- Procesamiento por lotes en el borde: al ser un modelo denso de 4,5B efectivos, puede desplegarse en flotas de dispositivos o estaciones de trabajo modestas para clasificacion, resumen y extraccion de entidades multilingue.
- Prototipado rapido con llama.cpp: la distribucion GGUF facilita pruebas en CPU y GPU sin infraestructura dedicada, adecuada para validar casos de uso antes de escalar al modelo de 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version GGUF concreta. La model card del modelo base menciona mejoras en benchmarks de codigo y capacidades agenticas, pero no incluye cifras numericas en el extracto disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta para los niveles de cuantizacion de este repositorio. Como referencia orientativa, un modelo denso de 4,5B efectivos (8B con embeddings) en 4 bits requiere del orden de 5-6 GB de memoria, y en 8 bits del orden de 9-10 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo esta pensado para portatiles y dispositivos de gama alta, no para aceleradores de centro de datos.
- GPU de consumo: el modelo esta disenado explicitamente para ejecucion en portatiles y telefonos de gama alta, por lo que deberia caber en GPU de consumo con suficiente VRAM en cuantizaciones bajas; no se confirman modelos concretos.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF; Unsloth Studio para ejecucion y fine-tuning; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no se mencionan para esta version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B IT (esta ficha, GGUF) | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 E2B IT | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | GGUF, safetensors |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | GGUF, safetensors |
| Gemma 4 26B A4B (MoE) | No disponible en detalle | 256K (modelos medianos) | Texto, imagen | Apache 2.0 | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. Las alternativas de otros fabricantes en el mismo rango de tamano no se detallan porque no aparecen en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; los modelos de lenguaje en abierto suelen reflejar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para esta version.
- Contexto e idioma: el contexto es de 128.000 tokens, la mitad que los modelos medianos de la familia (256.000); la lista concreta de idiomas no esta disponible.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia especifica de Gemma 4 en ai.google.dev, que conviene revisar por si impone terminos de uso adicionales.
- Cuantizacion: el repositorio es una cuantizacion de terceros (YuvrajSalvi) basada en el trabajo de Unsloth; la calidad puede diferir de los pesos originales y de las cuantizaciones oficiales de ggml-org.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de validacion por la comunidad.
- Tamano del repositorio: 126,3 GB, lo que implica que contiene multiples niveles de cuantizacion y requiere espacio de almacenamiento considerable.
- Produccion: al tratarse de una cuantizacion no oficial, se recomienda validar el comportamiento en las tareas objetivo antes de desplegarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YuvrajSalvi/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Cuantizacion de referencia ggml-org: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- Otra cuantizacion de terceros: https://huggingface.co/ruygar/gemma-4-E4B-it-GGUF
- Guia de Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Coleccion de Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de DeepMind sobre Gemma: https://deepmind.google/models/gemma/
