# ultravires/sat-3l-sm-coreml

## Resumen
sat-3l-sm-sm-coreml es una conversión a CoreML del modelo segment-any-text/sat-3l-sm, desarrollado originalmente por los autores de la librería wtpsplit dentro del proyecto SaT ("Segment any Text"). El modelo resuelve una tarea muy concreta: la detección de fronteras de frase (sentence-boundary detection) sobre texto sin puntuar o mal puntuado, formulada como un problema de clasificación de tokens. Esta conversión la publica el usuario ultravires para alimentar la segmentación semántica de subtítulos en la aplicación macOS RealtimeSubtitle.

Se trata de un modelo pequeño (repo de 0,4 GB en fp16) derivado de una arquitectura tipo transformer encoder con tokenizador XLM-RoBERTa, empaquetado como mlprogram de CoreML con precisión de cómputo fp16 y objetivo de despliegue macOS 15 o superior. No es un modelo generativo: no produce texto, sino un logit de frontera por cada posición de token de entrada.

Su relevancia es práctica: permite ejecutar localmente en Apple Silicon una tarea de segmentación multilingüe (validada en chino simplificado, chino tradicional, inglés y texto mixto sin puntuación) sin depender de servicios en la nube, con decisiones de corte idénticas a las del modelo PyTorch original en fp32 al umbral de probabilidad 0,25.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base segment-any-text/sat-3l-sm), traza PyTorch a CoreML mlprogram con atención eager |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones (input_ids de forma fija [1, 512]: cls + hasta 510 tokens + sep, relleno con pad) |
| Tipos de cuantizacion | fp16 (precisión de cómputo CoreML); pesos empaquetados en weight.bin; no se documentan otras variantes |
| Idiomas soportados | no disponible de forma oficial; validación del autor en zh-Hans, zh-Hant, en y texto mixto/sin puntuar |
| Licencia | MIT (heredada del modelo original, copyright de los autores de wtpsplit) |
| Formato de pesos | CoreML mlpackage (Manifest.json, model.mlmodel, weight.bin); tokenizer.json de XLM-RoBERTa; config.json de referencia |

## Arquitectura y entrenamiento
El modelo subyacente, segment-any-text/sat-3l-sm, es un encoder transformer de la familia SaT que reformula la segmentación de frases como clasificación de tokens: cada posición recibe un logit de frontera que, tras aplicar sigmoide y un umbral (0,25 en la validación del autor), determina si se corta la frase. La conversión a CoreML sustituye la ruta de atención sdpa por una implementación eager, ya que sdpa no es convertible a CoreML, y fija la precisión de cómputo en fp16, la misma clase de precisión que la distribución ONNX fp16 del modelo fuente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card del modelo original, que no se incluye en la información proporcionada. La conversión parte de los pesos model.safetensors en la revisión 137da054051ad9f1eac42025f758db4ac9f22535 (SHA256 3e19cb0e5dbe9790d37d918d7e87880cb6577d497833f0f0627d80ae6ca1fe90) y se valida contra PyTorch fp32: desviación máxima de logits de 0,057, desviación máxima de probabilidad sigmoide de 0,0056 y decisiones de corte idénticas en todas las muestras.

## Capacidades
- Detección de fronteras de frase (sentence-boundary detection) sobre texto plano, incluido texto sin puntuación.
- Clasificación de tokens a nivel de posición: devuelve un logit de frontera por cada token de la secuencia de entrada.
- Procesamiento multilingüe validado en chino simplificado, chino tradicional, inglés y texto mixto, con muestras de 2 a 300 tokens.
- Tokenización mediante XLM-RoBERTa (tokenizer.json byte-idéntico a FacebookAI/xlm-roberta-base), codificando sin tokens especiales y añadiendo cls(0) y sep(2) manualmente.
- Inferencia local en macOS 15+ sobre Apple Silicon mediante CoreML.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo discriminativo de una sola tarea.

## Casos de uso
- Segmentación semántica de subtítulos en tiempo real: es el uso para el que se creó esta conversión, dentro de la app macOS RealtimeSubtitle; el modelo corta el flujo de transcripción en frases coherentes antes de mostrarlas o traducirlas.
- Preprocesado de texto sin puntuar para TTS: dividir una transcripción o un artículo en frases antes de sintetizar voz, evitando cortes antinaturales y mejorando la prosodia.
- Troceado de documentos largos para pipelines de RAG: dividir texto en unidades de frase antes de agrupar en chunks, lo que reduce la pérdida de contexto en la recuperación.
- Normalización de subtítulos SRT/VTT: insertar o corregir cortes de frase en ficheros de subtítulos generados automáticamente, especialmente en contenido multilingüe o con puntuación deficiente.
- Segmentación previa a traducción automática: dividir el texto de origen en frases bien delimitadas para que el motor de traducción reciba unidades limpias y consistentes.
- Procesamiento de transcripciones ASR: las salidas de reconocimiento de voz suelen carecer de puntuación; este modelo restituye fronteras de frase antes de indexar, resumir o archivar el texto.
- Herramientas de lectura y accesibilidad en macOS: dividir texto en frases para resaltado, lectura guiada o navegación por unidades en aplicaciones nativas que ya usan CoreML.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de validación de la conversión frente a PyTorch fp32 (desviación máxima de logits 0,057; desviación máxima de probabilidad 0,0056; decisiones de corte idénticas al umbral 0,25 en todas las muestras).

## Requisitos de hardware
- Inferencia exclusivamente en el ecosistema Apple: CoreML mlprogram con objetivo de despliegue macOS 15 o superior.
- Tamaño del repo de 0,4 GB, lo que sugiere un modelo pequeño que cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- VRAM estimada: no disponible de forma explícita; por el tamaño del paquete, el modelo es apto para equipos de consumo con memoria unificada.
- GPU recomendadas: no aplica el catálogo CUDA (A100, H100, RTX 4090); el despliegue es en chips Apple (M1 y posteriores) mediante CoreML.
- Opciones de despliegue: CoreML en aplicaciones macOS nativas; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con el formato mlpackage.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ultravires/sat-3l-sm-coreml | no disponible | 512 tokens | Detección de fronteras de frase | MIT | CoreML para macOS 15+ |
| segment-any-text/sat-3l-sm (modelo base) | no disponible | no disponible | Detección de fronteras de frase | MIT | Pesos originales (safetensors) |
| FacebookAI/xlm-roberta-base | no disponible | no disponible | Modelo base multilingüe (encoder) | MIT | Hugging Face |

La comparación se limita al modelo base y al encoder del que hereda el tokenizador, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de segmentación en la información proporcionada.

## Limitaciones y advertencias
- Modelo de una sola tarea: no genera texto ni responde instrucciones; cualquier uso fuera de la clasificación de fronteras de frase no es válido.
- Ventana fija de 512 posiciones con relleno: los textos más largos deben trocearse y gestionarse externamente, con el riesgo de cortes artificiales en las uniones.
- Solo ejecutable en el ecosistema Apple (CoreML, macOS 15+); no es portable a CUDA, ROCm ni a inferencia en servidores Linux convencionales.
- Precisión fp16: aunque la validación muestra decisiones idénticas al modelo fp32 en las muestras probadas, pueden aparecer diferencias en casos límite no cubiertos.
- Idiomas oficialmente soportados no documentados; la validación se limita a chino simplificado, chino tradicional, inglés y texto mixto, por lo que el rendimiento en otras lenguas no está garantizado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de segmentación en dominios muy alejados del entrenamiento (código, tablas, texto muy ruidoso).
- Licencia MIT: permite uso comercial, pero obliga a conservar el aviso de copyright de los autores de wtpsplit.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces
- [Hugging Face: ultravires/sat-3l-sm-coreml](https://huggingface.co/ultravires/sat-3l-sm-coreml)
- [Modelo base: segment-any-text/sat-3l-sm](https://huggingface.co/segment-any-text/sat-3l-sm)
- [Tokenizador: FacebookAI/xlm-roberta-base](https://huggingface.co/FacebookAI/xlm-roberta-base)
- [Repositorio wtpsplit (Segment any Text)](https://github.com/segment-any-text/wtpsplit)
