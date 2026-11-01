# value-productions/quickmt-fa-en-int8

## Resumen

quickmt-fa-en-int8 es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática quickmt/quickmt-fa-en, desarrollado originalmente por quickmt y reempaquetado por value-productions para su uso en la aplicación Yaku Translate. El modelo realiza traducción directa persa-inglés (fa-en) y se distribuye con pesos int8 optimizados para inferencia eficiente en CPU y GPU mediante el runtime CTranslate2.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue: no introduce cambios en la arquitectura ni en los datos de entrenamiento respecto al modelo base, sino que aplica una cuantización int8 por filas a cada matriz de pesos bidimensional, siguiendo el esquema de cuantización de ModelSpec de CTranslate2. Según la model card, la salida en las frases verificadas es idéntica carácter a carácter a la del original en float16, lo que indica una degradación de calidad despreciable en la práctica para este par de idiomas.

El repositorio ocupa aproximadamente 0,2 GB e incluye los ficheros model.bin, config.json, los vocabularios de origen y destino, y los modelos SentencePiece src.spm.model y tgt.spm.model. La licencia es CC BY 4.0, heredada del modelo base. No se dispone de información pública sobre arquitectura interna, número de parámetros ni longitud de contexto más allá de lo que implica el formato CTranslate2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de traducción automática (modelo base quickmt/quickmt-fa-en); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización por filas de cada peso 2-D, esquema ModelSpec de CTranslate2) |
| Idiomas soportados | persa (fa) a inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin) con vocabularios JSON y modelos SentencePiece |

## Arquitectura y entrenamiento

El modelo subyacente es quickmt/quickmt-fa-en, un sistema de traducción automática neuronal orientado a un único par de idiomas (persa-inglés). La model card del artefacto int8 no documenta la arquitectura interna del modelo base: no se especifica si se trata de un transformer encoder-decoder estándar, el número de capas, la dimensión oculta ni el número de cabezas de atención. Tampoco se detallan los datos de entrenamiento, el volumen de tokens, la composición del corpus ni si hubo fases de ajuste fino supervisado, RLHF o DPO.

La innovación técnica documentada en este repositorio es exclusivamente el proceso de conversión: se aplica cuantización int8 por filas a todas las matrices de pesos bidimensionales, replicando el esquema que CTranslate2 emplea en su ModelSpec. El resultado se serializa en model.bin junto con config.json y los vocabularios separados de origen y destino (source_vocabulary.json, target_vocabulary.json) y los tokenizadores SentencePiece (src.spm.model, tgt.spm.model). El autor afirma que la salida en las frases comprobadas coincide exactamente con la del modelo original en float16, aunque no se especifica el conjunto de frases de verificación ni su tamaño.

## Capacidades

- Traducción automática directa de persa a inglés, en modo texto.
- Tokenización mediante SentencePiece independiente para origen y destino.
- Inferencia optimizada con CTranslate2, con soporte para ejecución en CPU y GPU según el runtime.
- Integración prevista en la aplicación Yaku Translate, lo que implica uso orientado a traducción interactiva.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües más allá del par fa-en.
- No se documenta soporte de instrucciones conversacionales; es un modelo de traducción, no un modelo de chat.

## Casos de uso

- Traducción de documentación técnica del persa al inglés: el modelo puede procesar textos segmentados por frases y producir salidas en inglés para manuales, README o notas de ingeniería, aprovechando el runtime CTranslate2 para lotes de gran volumen en CPU.
- Localización de interfaces de usuario: integración en pipelines de software para traducir cadenas de recursos (archivos de localización) del persa al inglés, con la ventaja de que el formato int8 reduce el coste de despliegue en servidores sin GPU dedicada.
- Traducción de correspondencia y correo electrónico: uso en herramientas internas de empresas con comunicación persa-inglesa, donde la latencia baja de CTranslate2 permite respuestas casi interactivas.
- Preprocesamiento de corpus para investigación en PLN: traducción masiva de textos persas a inglés para construir conjuntos de datos alineados o para alimentar modelos de análisis posteriores.
- Integración en aplicaciones móviles o de escritorio: el tamaño reducido del repositorio (0,2 GB) y la cuantización int8 facilitan el empaquetado en la app Yaku Translate y en otras aplicaciones con recursos limitados.
- Traducción de contenido web y noticias: procesamiento por lotes de artículos persas para su publicación o indexación en inglés, con la ventaja de que la licencia CC BY 4.0 permite uso comercial con atribución.
- Servicio de traducción de bajo coste en producción: despliegue con CTranslate2 en instancias CPU, donde el modelo int8 ofrece un equilibrio razonable entre calidad y throughput para un par de idiomas concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma que la salida en las frases comprobadas es idéntica carácter a carácter a la del modelo float16 original, sin cuantificar métricas como BLEU, chrF, COMET ni proporcionar el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que el modelo int8 cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, incluyendo GTX 1050 Ti, RTX 3050, RTX 4060 y superiores.
- GPU recomendadas: cualquier GPU con soporte CUDA para CTranslate2; para máximo throughput, A100 o H100 en despliegues de servidor, aunque el tamaño del modelo hace que GPU de gama media sean suficientes.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: CTranslate2 (runtime nativo), con posibles integraciones en servidores de traducción compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo en formato GGUF.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y del tamaño de los lotes, aunque la cuantización int8 y el runtime CTranslate2 están diseñados para maximizar el rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| value-productions/quickmt-fa-en-int8 | no disponible | no disponible | fa-en | CC BY 4.0 | CTranslate2 int8 | HuggingFace |
| quickmt/quickmt-fa-en (base) | no disponible | no disponible | fa-en | CC BY 4.0 | safetensors u otro formato original (no especificado) | HuggingFace |
| Otros modelos de traducción fa-en | no disponible | no disponible | fa-en | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables alternativos en la documentación proporcionada; la comparación más directa es con el modelo base float16 del que deriva, que ofrece la misma calidad declarada con mayor peso en disco.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas (persa-inglés); no traduce otros pares ni realiza tareas generativas generales.
- No se documentan sesgos conocidos, pero al ser un sistema de traducción entrenado con datos no especificados, puede heredar sesgos de género, culturales o dialectales presentes en el corpus original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) no cubiertos por los datos de entrenamiento.
- La model card no detalla la longitud máxima de secuencia soportada; textos largos pueden requerir segmentación manual.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar adecuadamente a los autores originales (quickmt) y respetar los términos de la licencia.
- El artefacto es una conversión de terceros (value-productions); la calidad y el mantenimiento dependen de ese repositorio, no del autor original.
- No se documentan garantías de que la equivalencia carácter a carácter con float16 se mantenga en todos los dominios; la verificación reportada es limitada.
- El formato CTranslate2 no es directamente compatible con ecosistemas como transformers o llama.cpp, lo que limita su integración a runtimes específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/value-productions/quickmt-fa-en-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-fa-en
