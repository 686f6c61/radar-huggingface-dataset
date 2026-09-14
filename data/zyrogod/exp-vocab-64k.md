# ZyroGod/exp-vocab-64k

## Resumen

ZyroGod/exp-vocab-64k es un tokenizer de tipo Byte-Level Byte Pair Encoding (BPE) construido desde cero para modelos generativos de lenguaje, publicado por el usuario ZyroGod en Hugging Face. No se trata de un modelo de lenguaje: no contiene pesos neuronales ni capas entrenables, sino un vocabulario y un conjunto de reglas de fusión BPE que convierten texto en secuencias de identificadores de token y viceversa. Su función es servir como componente de tokenización para un futuro modelo GPT de arquitectura tipo decoder, tal y como indica la etiqueta `gpt` de la model card.

El artefacto destaca por dos propiedades técnicas concretas: una tasa de tokens fuera de vocabulario (UNK) del 0,00 %, garantizada por un fallback a nivel de byte que cubre las 256 combinaciones posibles (0-255), y una fidelidad de ida y vuelta del 100 % (`decode(encode(text)) == text`) para código arbitrario, LaTeX, emojis, espacios y tabulaciones. El autor reporta un ratio de compresión global de 3,1294 bytes por token y una fertilidad media de 2,9073 tokens por palabra sobre su conjunto de evaluación propio.

Su relevancia es acotada pero real: los tokenizers determinan el coste computacional y la calidad de la representación de un LLM, y un vocabulario mal diseñado penaliza a idiomas no ingleses y a contenido técnico. Este tokenizer se entrena sobre un corpus equilibrado de 250 MB y usa pre-tokenización por expresiones regulares al estilo GPT-4. Sin embargo, no se ha publicado ningún modelo entrenado sobre él, no tiene descargas ni interacciones y presenta una discrepancia en la model card entre el nombre del repositorio (64k) y la insignia de vocabulario (32k).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE con pre-tokenización por regex estilo GPT-4. No es una red neuronal; no tiene capas, atención ni parámetros entrenables |
| Parámetros totales | No aplica (el artefacto es un vocabulario y reglas de fusión, no un modelo de lenguaje) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica (un tokenizer no impone ventana de contexto; el límite lo fija el modelo que lo use) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | `en` según la model card. La cobertura de bytes 0-255 permite representar cualquier script Unicode sin UNK, pero el vocabulario está optimizado para inglés |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json` (Hugging Face Fast Tokenizer), `vocab.json`, `merges.txt` (compatible con GPT-2), `tokenizer_config.json`, `special_tokens_map.json` |
| Tamaño de vocabulario | No disponible con certeza: el ID del repositorio indica 64k, la insignia del README indica 32k y el título de la model card es `exp_vocab_64k`. Discrepancia no resuelta en la información proporcionada |
| Corpus de entrenamiento | 250 MB (FineWeb 70 %, WikiText-103 10 %, CodeSearchNet 10 %, ArXiv/Math 5 %, OpenWebText 5 %) |
| Pipeline declarado | `feature-extraction` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

El tokenizer implementa un esquema Byte-Level BPE: parte de una representación en bytes y aplica fusiones ordenadas aprendidas por frecuencia sobre el corpus de entrenamiento (`merges.txt` con ranking BPE compatible con GPT-2). Antes de la tokenización aplica un pre-tokenizador basado en expresiones regulares de estilo GPT-4 que aísla contracciones inglesas (`'s`, `'t`, `'re`, `'ve`), palabras, signos de puntuación y secuencias de espacios consecutivos. La combinación de byte-level y fallback completo de bytes explica que la tasa de UNK sea 0,00 %: cualquier secuencia de bytes arbitraria es representable.

El corpus declarado es de 250 MB equilibrado en cinco dominios: FineWeb (175 MB, prosa web filtrada de calidad), WikiText-103 (25 MB, prosa enciclopédica), CodeSearchNet (25 MB, código multi-lenguaje en Python, Java, Go, JavaScript, PHP y Ruby con comentarios), ArXiv/Math (12,5 MB, LaTeX científico y notación numérica) y OpenWebText (12,5 MB, discurso conversacional y de foro). No se documenta ningún proceso de RLHF, DPO ni ajuste posterior, algo que no aplica a un tokenizer. Tampoco se describe la innovación técnica que sugiere el prefijo `exp-` del repositorio, ni se publica el framework nombrado en la model card ("Byte-Level BPE Tokenizer Engineering Framework").

## Capacidades

- Codificación y decodificación byte-level BPE con fidelidad de ida y vuelta del 100 % verificada por el propio autor mediante `assert`.
- Fallback total a bytes: cobertura de las 256 combinaciones posibles, 0,00 % de tokens UNK incluso ante entradas binarias o malformadas.
- Pre-tokenización por regex que separa contracciones, palabras, puntuación y espacios consecutivos.
- Compresión declarada de 3,1294 bytes por token en agregado y 2,9073 tokens por palabra de fertilidad media.
- Manejo correcto de emojis, espacios en blanco, tabulaciones, LaTeX y scripts Unicode según la model card.
- Carga directa mediante `AutoTokenizer` de Hugging Face `transformers`.
- Compatibilidad de formato con el ecosistema GPT-2 (`merges.txt` con ranking de fusiones).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidad multilingüe limitada: representable sin UNK, pero no optimizada fuera del inglés.

## Casos de uso

- Tokenización de corpus en inglés para preentrenamiento de un LLM: el vocabulario y las reglas BPE permiten preparar grandes volúmenes de texto con una ratio de 3,1294 bytes por token, reduciendo el número de secuencias necesarias para cubrir el mismo corpus.
- Preprocesamiento de repositorios de código: la inclusión de CodeSearchNet en el entrenamiento y el aislamiento de puntuación y espacios convierten este tokenizer en una opción razonable para pipelines de modelos de código, donde la fidelidad de ida y vuelta es crítica para no corromper el texto generado.
- Tratamiento de documentación científica con LaTeX: el 5 % del corpus corresponde a ArXiv/Math, y la representación byte-level evita perder fórmulas o símbolos poco frecuentes.
- Reducción de errores en pipelines de datos con entradas sucias: la tasa de UNK del 0,00 % y la cobertura de bytes permiten procesar logs, binarios o texto mal codificado sin tokens desconocidos.
- Análisis comparativo de eficiencia de tokenización: el conjunto de métricas por dominio (prosa, técnico, científico, código, números, URLs, casos límite) sirve para evaluar si Conviene sustituir el tokenizer de un modelo existente antes de un reentrenamiento.
- Reproducción de infraestructura tipo GPT-2: al publicar `merges.txt` con ranking compatible, el artefacto se puede integrar en código que ya consuma tokenizers de la familia GPT-2 sin reescribir el cargador.
- Formación e investigación sobre diseño de vocabularios: el repositorio documenta la composición exacta del corpus de entrenamiento, lo que permite estudiar el efecto del mezclado de dominios sobre la fertilidad y la compresión.
- Evaluación de pipelines de inferencia: al ser un artefacto ligero y determinista, se puede usar como referencia en pruebas de regresión de sistemas de tokenización en producción.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de tokenización del autor sobre su propio conjunto de evaluación. No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al no tratarse de un modelo de lenguaje.

| Dominio | Bytes totales | Tokens totales | Ratio de compresión | Fertilidad |
|---|---:|---:|---:|---:|
| Prose | 733 | 149 | 4,92 B/T | 1,42 T/W |
| Technical | 745 | 151 | 4,93 B/T | 1,45 T/W |
| Scientific | 858 | 277 | 3,10 B/T | 2,50 T/W |
| Code | 1.401 | 417 | 3,36 B/T | 2,88 T/W |
| Numbers | 478 | 248 | 1,93 B/T | 5,51 T/W |
| Urls | 536 | 188 | 2,85 B/T | 17,09 T/W |
| Edge_cases | 644 | 294 | 2,19 B/T | 4,08 T/W |

Agregado declarado: 3,1294 bytes por token y 2,9073 tokens por palabra. Conviene señalar que el conjunto de evaluación es muy reducido (entre 478 y 1.401 bytes por dominio, es decir, unos pocos párrafos), por lo que estos números tienen un valor indicativo y no estadísticamente robusto.

## Requisitos de hardware

- VRAM para inferencia: no aplica. Un tokenizer se ejecuta en CPU y no requiere GPU.
- Memoria RAM: no disponible. El artefacto consta de un vocabulario y una lista de fusiones de tamaño moderado (orden de decenas de MB como máximo); el consumo real depende del framework de carga.
- GPU recomendadas: ninguna. Es un componente determinista de preprocesamiento.
- Compatibilidad con GPU de consumo: no aplica; funciona en cualquier máquina capaz de ejecutar Python o Rust.
- Opciones de despliegue: `transformers` con `AutoTokenizer` (formato Fast Tokenizer), `tokenizers` de Hugging Face, y cualquier implementación que consuma `merges.txt` y `vocab.json` con ranking compatible con GPT-2.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad de tokenización.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor frente a otros tokenizers. A continuación se ofrece una comparación cualitativa con alternativas ampliamente conocidas, marcando como no disponible todo dato que no figure en la información proporcionada.

| Tokenizer | Tamaño de vocabulario | Esquema | Fallback de bytes | Licencia | Idioma principal |
|---|---|---|---|---|---|
| ZyroGod/exp-vocab-64k | No disponible (32k o 64k según la fuente) | Byte-level BPE con regex estilo GPT-4 | Sí, 0,00 % UNK declarado | MIT | Inglés |
| GPT-2 (radford et al.) | 50.257 | Byte-level BPE | Sí | MIT | Inglés |
| cl100k_base (tiktoken, GPT-4) | Aproximadamente 100.000 | Byte-level BPE con regex | Sí | MIT | Multilingüe |
| Llama 3 (Meta) | 128.000 | Byte-level BPE con tiktoken | Sí | Licencia comunitaria de Meta | Multilingüe |

Comparación de rendimiento frente a estos tokenizers: no disponible. El autor solo publica métricas internas, sin un benchmark común que permita situar el artefacto frente a GPT-2, cl100k_base o el tokenizer de Llama 3.

## Limitaciones y advertencias

- Ambigüedad documental grave: el identificador del repositorio indica 64k, la insignia del README indica 32k y el título indica `exp_vocab_64k`. No se puede determinar el tamaño real del vocabulario con la información disponible.
- No es un modelo de lenguaje. No genera texto, no razona, no ejecuta código y no puede usarse como sustituto de un LLM en ninguna tarea de inferencia.
- Optimizado para inglés. Aunque la cobertura byte-level evita tokens UNK en otros idiomas, la fertilidad en lenguas no inglesas será previsiblemente peor, lo que encarece el entrenamiento y la inferencia en esos idiomas.
- Corpus de entrenamiento reducido (250 MB) en comparación con los corpus empleados para tokenizers de producción (cientos de GB o más), lo que puede dejar patrones subrepresentados.
- Conjunto de evaluación diminuto (menos de 1,5 KB por dominio). Las métricas de compresión y fertilidad deben tratarse como indicativas.
- No se especifica el número ni la identidad de los tokens especiales reservados, más allá de la existencia de `special_tokens_map.json`. Verificar antes de integrarlo en un pipeline de ajuste fino.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni de validación por terceros.
- Efecto de dominio en números y URLs: la fertilidad de 5,51 T/W en números y 17,09 T/W en URLs implica secuencias mucho más largas en esos contextos, con el consiguiente coste en ventana de contexto.
- La licencia MIT cubre el artefacto del tokenizer, pero no se documentan las licencias de los corpus de entrenamiento subyacentes (FineWeb, WikiText-103, CodeSearchNet, ArXiv, OpenWebText), lo que conviene verificar antes de un uso comercial.
- La model card no documenta las decisiones de diseño, el método de selección de tamaño de vocabulario ni el framework de ingeniería citado, lo que dificulta auditar el proceso.

## Enlaces

- Hugging Face: https://huggingface.co/ZyroGod/exp-vocab-64k
- Licencia MIT: https://opensource.org/licenses/MIT
- Corpus citados en la model card, sin enlace directo publicado: FineWeb, WikiText-103, CodeSearchNet, ArXiv, OpenWebText
- La búsqueda web realizada no ha devuelto resultados relacionados con este artefacto: únicamente páginas promocionales de Google Gemini sin conexión alguna con el tokenizer. No hay papers, blogs, repositorios ni demos adicionales que enlazar.
