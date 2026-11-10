# Vagabond404/khmer-tokenizer-sota

## Resumen

K-Token (Khmer Tokenizer SOTA) es un tokenizador y segmentador de palabras para jemer (khmer, código ISO `km`) publicado por el desarrollador independiente Ange (@Vagabond404) en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino un componente de preprocesado diseñado para sustituir el tokenizador de modelos LLM multilingües existentes cuando se trabaja con texto jemer. Su objetivo declarado es reducir la "tasa de fertilidad" (tokens por palabra) y evitar la fragmentación de clústeres de caracteres jemer (KCC: consonante + subíndice + vocal).

El problema que aborda es concreto: los tokenizadores basados en BPE con fallback a bytes (Llama 3, Mistral NeMo, Gemma 2) dividen el jemer en muchos más tokens de los necesarios, lo que encarece la inferencia y consume ventana de contexto. Según la model card, K-Token logra 2,52 tokens por palabra frente a 6,20 de Llama 3, lo que supone una reducción del 78 % en coste y latencia y un aprovechamiento de contexto 4,6 veces mayor.

El componente combina segmentación léxica basada en un trie construido a partir del diccionario oficial de la Real Academia de Camboya (RAC 2022, más de 44 000 entradas) con un tokenizador de subpalabras respaldado en Rust (librería `tokenizers`). Se integra como reemplazo directo mediante `AutoTokenizer.from_pretrained`. No se dispone de datos sobre arquitectura de red neuronal, parámetros ni contexto, porque no es un modelo neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE con segmentación léxica por trie (diccionario RAC 2022); no es un modelo neuronal |
| Parametros totales | no disponible (no aplica: no es un modelo de parámetros) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (la model card menciona "4,6x more context" como mejora relativa de utilización, no un límite absoluto) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; artefactos de tokenizador de Hugging Face (`tokenizer.json`, `tokenizer_config.json`, vocabulario) y diccionario `rac_dictionary.json` para el segmentador |

## Arquitectura y entrenamiento

K-Token no es una red neuronal, sino un pipeline de tokenización en dos etapas. La primera es una segmentación de palabras basada en un trie cargado con el diccionario oficial de la Real Academia de Camboya (edición 2022, más de 44 000 entradas cabeza), que resuelve los límites de palabra del jemer, un idioma sin separadores explícitos. La segunda es una tokenización de subpalabras de tipo BPE implementada con la librería `tokenizers` de Hugging Face (núcleo en Rust), lo que explica la velocidad declarada de más de 250 000 palabras por segundo.

La innovación técnica principal es la "atomicidad KCC estricta": el tokenizador garantiza que ningún clúster de caracteres jemer (consonante base, consonante subíndice y vocales dependientes) se divida entre tokens, algo que los tokenizadores con fallback a bytes no aseguran y que provoca problemas de renderizado Unicode. La model card no detalla el corpus de entrenamiento del BPE, el número de tokens procesados ni si hubo ajuste específico; solo cita como fuentes el diccionario RAC 2022 y el proyecto Asian Language Treebank (ALT). No se documenta RLHF, DPO ni ningún proceso de alineación, por no tratarse de un modelo generativo.

## Capacidades

- Segmentación de palabras en jemer sin separadores explícitos, con salida delimitada por palabras.
- Tokenización de subpalabras compatible con la API `AutoTokenizer` de Transformers (`tokenize`, codificación y decodificación).
- Preservación estricta de clústeres de caracteres jemer (KCC) para evitar texto roto en la renderización.
- Integración como tokenizador de reemplazo en pipelines de LLM que procesen jemer.
- Uso independiente como segmentador mediante la clase `KhmerSegmenter` y el diccionario `rac_dictionary.json`.
- Procesamiento de alto rendimiento (más de 250 000 palabras por segundo según la model card).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: no es un modelo generativo.
- Capacidad multilingüe limitada al jemer; no se documenta soporte para otros idiomas.

## Casos de uso

- Preprocesado de corpus jemer para entrenamiento o ajuste fino de LLM: K-Token sustituye al tokenizador nativo del modelo para reducir el número de tokens por palabra de 6,20 a 2,52, lo que disminuye el coste de entrenamiento y permite incluir más texto jemer en la misma ventana de contexto.
- Inferencia de LLM en producción sobre texto jemer: al integrarse como `AutoTokenizer`, reduce la latencia y el coste por consulta en aplicaciones de chat o resumen en jemer, y evita que el modelo reciba secuencias fragmentadas que degradan la calidad.
- Búsqueda y recuperación de información (RAG) en jemer: la segmentación por palabras basada en el diccionario RAC permite construir índices invertidos y calcular coincidencias léxicas con precisión, algo inviable con tokenización por bytes.
- Análisis lingüístico y corpus: investigadores pueden usar `KhmerSegmenter` para anotar corpus jemer con límites de palabra validados por el diccionario oficial, facilitando estudios morfológicos y estadísticas léxicas.
- Renderizado y publicación de texto jemer: la atomicidad KCC garantiza que la tokenización no rompa clústeres de consonantes y vocales, útil en pipelines de generación de documentos o web donde el texto roto es un defecto visible.
- Normalización de datos de entrada en sistemas de atención al cliente en jemer: el tokenizador puede actuar como capa previa para clasificadores, detectores de intención o sistemas de extracción de entidades sobre conversaciones.
- Evaluación comparativa de tokenizadores: sirve como referencia para medir la fertilidad de tokenizadores multilingües sobre jemer y justificar decisiones de arquitectura en proyectos de NLP de bajos recursos.

## Benchmarks y rendimiento

Datos declarados en la model card del autor (no verificados de forma independiente):

| Modelo / tokenizador | Fertilidad (tokens/palabra) | Seguridad KCC | Velocidad (palabras/s) | Uso de contexto |
|---|---|---|---|---|
| K-Token SOTA | 2,52 | 100 % (estricta) | > 250 000 | 4,6x más contexto |
| Llama 3 Tokenizer | 6,20 | Alto riesgo (split por bytes) | Media | 1,0x (referencia) |
| Mistral NeMo / v0.3 | 5,85 | Fallback a bytes | Media | 1,1x |
| Gemma 2 | 5,40 | Fallback a bytes | Media | 1,2x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo generativo.

## Requisitos de hardware

- No requiere GPU: es un tokenizador de CPU con núcleo Rust; puede ejecutarse en cualquier máquina con Python y la librería `tokenizers`.
- VRAM estimada: no aplica (0 GB de VRAM para el tokenizador en sí).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier entorno, incluidos contenedores ligeros, funciones serverless y dispositivos de borde.
- Opciones de despliegue: `transformers.AutoTokenizer`, librería `tokenizers` directamente, o el paquete `khmer_segmenter` para segmentación independiente; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo que servir.
- Latencia y throughput: más de 250 000 palabras por segundo según la model card (medición no verificada); el cuello de botella en producción será el modelo LLM al que alimente, no el tokenizador.

## Comparativa con modelos similares

La comparación relevante es con tokenizadores de LLM multilingües, no con modelos generativos:

| Tokenizador | Idiomas | Fertilidad en jemer (tokens/palabra) | Seguridad KCC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K-Token SOTA | jemer | 2,52 | Estricta (100 %) | Apache 2.0 | Hugging Face |
| Llama 3 Tokenizer | multilingüe | 6,20 | No garantizada | Licencia Llama 3 | Integrado en Llama 3 |
| Mistral NeMo / v0.3 | multilingüe | 5,85 | No garantizada | Apache 2.0 | Integrado en Mistral |
| Gemma 2 | multilingüe | 5,40 | No garantizada | Términos de Gemma | Integrado en Gemma 2 |

Frente a tokenizadores específicos de jemer de otros autores, no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al jemer: no está pensado ni documentado para otros idiomas, por lo que no sustituye a un tokenizador multilingüe general.
- Dependencia del diccionario RAC 2022: palabras nuevas, préstamos recientes, nombres propios y jemer coloquial pueden segmentarse de forma subóptima si no figuran en el diccionario.
- Los datos de rendimiento (fertilidad, velocidad, seguridad KCC) proceden de la model card del autor y no se han verificado de forma independiente; conviene reproducirlos en el propio corpus antes de adoptarlo en producción.
- Riesgo de incompatibilidad con modelos ajustados: cambiar el tokenizador de un LLM ya entrenado altera los identificadores de tokens y requiere reentrenar los embeddings o ajustar el modelo; no es un reemplazo transparente en modelos ya entrenados.
- Sin datos publicados sobre sesgos, alucinación o comportamiento en dominios específicos; al no ser generativo, el riesgo de alucinación no aplica al tokenizador, pero sí al LLM que lo use.
- Licencia Apache 2.0 permite uso comercial, pero el diccionario RAC 2022 y el corpus ALT citados como fuentes pueden tener sus propias condiciones de uso que conviene revisar.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: madurez y mantenimiento no verificados, sin comunidad ni issues documentados.
- No se documenta el tamaño del vocabulario ni el corpus de entrenamiento del BPE, lo que dificulta evaluar su cobertura real.

## Enlaces

- Hugging Face: https://huggingface.co/Vagabond404/khmer-tokenizer-sota
- Diccionario de la Real Academia de Camboya (RAC) 2022: no disponible enlace directo en la información proporcionada
- Proyecto Asian Language Treebank (ALT): no disponible enlace directo en la información proporcionada
- Librería `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentación de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
