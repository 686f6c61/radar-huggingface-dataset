# yuhuanstudio/Yunmo-Next-Tokenizer

## Resumen

Yunmo-Next Tokenizer es un tokenizador byte-level BPE de 65.536 entradas desarrollado por YuhuanStudio, diseñado específicamente para chino tradicional, inglés, código y matemáticas. Es el tokenizador de los modelos Yunmo-Next-1B-Base y Yunmo-Next-1B-Instruct, y se distribuye como un único `tokenizer.json` estándar de Hugging Face, sin necesidad de código de tokenización personalizado. Su relevancia radica en que, con un vocabulario entre 2 y 4 veces menor que el de la mayoría de tokenizadores comparables, consigue una compresión superior en dominios de chino tradicional.

El tokenizador emplea una estrategia de dos fases: una primera fase BPE byte-level de 60.280 entradas (merges y bytes) y una segunda fase de 5.000 "superwords" que captura unidades léxicas más largas. El corpus de entrenamiento se asignó por exposición objetivo, de modo que la proporción de tokens de cada dominio en el corpus del tokenizador coincide con su proporción planificada en el preentrenamiento. Esto lo diferencia de tokenizadores genéricos multilingües, que suelen priorizar inglés y chino simplificado.

La innovación principal es la medición de compresión fuera de distribución: frente a PangolinTokenizer (OpenFormosa) necesita entre un 4% y un 31% menos de tokens en siete conjuntos de texto que ninguno de los tokenizadores comparados utilizó para entrenarse. Su punto débil declarado es el código, donde ocupa el noveno puesto entre los tokenizadores evaluados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE en dos fases (60.280 merges/bytes + 5.000 superwords) |
| Parametros totales | no disponible (es un tokenizador, no un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | chino (tradicional y simplificado), inglés; incluye dominio de zhuyin (bopomofo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` estándar de Hugging Face (librería `transformers`) |

| Parametro adicional | Valor |
|---|---|
| Vocabulario total | 65.536 IDs |
| IDs de texto | 0–65.279 (60.280 de fase 1 + 5.000 superwords de fase 2) |
| IDs de protocolo | 65.280–65.535 (256 tokens); `<|eos|>` = 65.281 |
| Cobertura de bytes | los 256 bytes están en el alfabeto base |
| Token UNK | no existe (pérdida nula en cualquier UTF-8) |
| Normalización | ninguna (sin normalización Unicode, conversión de escritura, case folding ni limpieza de espacios) |
| Dígitos | cada dígito decimal es un token propio |
| Corpus de entrenamiento | 101.241 documentos / 200,2 MB de 21 familias de fuentes |
| Conjunto held-out | 10.166 documentos / 20,1 MB |

## Arquitectura y entrenamiento

El tokenizador es un BPE byte-level en dos fases. La fase 1 aprende 60.280 entradas de texto dentro de los límites estándar de pre-tokenización byte-level, aislando los dígitos decimales. La fase 2 codifica los documentos crudos con el modelo de fase 1 y aprende 5.000 superwords adicionales que atraviesan esos límites. El resultado es un vocabulario de 65.536 IDs: 65.280 de texto y 256 de protocolo. Al incluir los 256 bytes en el alfabeto base y no aplicar normalización, cualquier entrada UTF-8 se codifica de forma reversible y no existe token UNK.

El corpus se dimensionó mediante asignación por exposición objetivo: con una cuota objetivo de tokens `q_d` para el dominio `d` y un tokenizador de referencia que produce `τ_d` tokens por byte en ese dominio, el presupuesto de bytes es `b_d = (q_d / τ_d) / Σ_j (q_j / τ_j)`. La asignación planificada de bytes fue: inglés 34,76%, chino tradicional convertido 16,70%, chino tradicional nativo general 12,66%, código 12,36%, matemáticas 10,73%, chino simplificado original 7,32%, chino tradicional nativo oficial/profesional 2,75%, instrucciones en chino tradicional 2,34% y zhuyin 0,39%. El conjunto held-out se seleccionó por fuente y hash exacto de texto antes de puntuar ningún candidato, y se excluyó de todas las fuentes de entrenamiento. Tras el entrenamiento, los presupuestos recalculados con el nuevo tokenizador se desviaron como máximo 0,73 puntos porcentuales, por debajo del umbral de 1 punto que habría obligado a reconstruirlo.

## Capacidades

- Tokenización reversible y sin pérdida de cualquier entrada UTF-8, sin token UNK.
- Compresión específicamente optimizada para chino tradicional: 4,35 bytes/token en web tradicional, 4,18 en Wikipedia tradicional, 4,98 en estatutos de Taiwán y 4,21 en chino clásico.
- Cobertura de chino simplificado (7,32% del presupuesto de bytes) y de zhuyin/bopomofo (0,39%).
- Buen rendimiento en inglés educativo (5,04 bytes/token) y matemáticas (3,85 bytes/token).
- Aislamiento de dígitos decimales: cada dígito es un token propio, lo que facilita el procesamiento numérico explícito.
- Sin normalización: preserva exactamente mayúsculas, variantes Unicode y espacios, lo que evita pérdida de información en dominios sensibles (código, textos legales, transliteraciones).
- Integración directa con la librería `transformers` y con endpoints compatibles.
- Soporte declarado de los idiomas zh y en.

## Casos de uso

- Procesamiento de documentación legal taiwanesa: con 4,98 bytes/token en estatutos y 5,19 en textos del Yuan Legislativo, reduce el coste por token de pipelines de análisis de legislación y sentencias, y la ausencia de normalización preserva referencias exactas a artículos y numeración.
- Digitalización de prensa y web en chino tradicional: la compresión de 4,35 bytes/token en web tradicional permite indexar y resumir corpus de noticias con menos tokens y, por tanto, menor coste de inferencia en el modelo asociado.
- Procesamiento de chino clásico y textos históricos: 4,21 bytes/token en chino clásico, un dominio habitualmente mal cubierto por tokenizadores multilingües genéricos, lo que lo hace adecuado para proyectos de humanidades digitales y edición de textos clásicos.
- Anotación fonética con zhuyin: la inclusión explícita de bopomofo en el corpus (0,39% del presupuesto) permite tokenizar materiales de enseñanza de pronunciación en Taiwán sin fragmentación excesiva.
- Preprocesamiento de corpus mixtos chino-inglés para preentrenamiento: la asignación por exposición objetivo alinea la distribución de tokens del corpus con la del entrenamiento, lo que resulta útil al construir datasets de instrucción bilingües.
- Evaluación comparativa de tokenizadores: al publicar mediciones in-distribution y out-of-distribution con una metodología explícita, sirve como referencia para auditar la compresión real de otros tokenizadores en dominios de chino tradicional.
- Tokenización de expresiones matemáticas: 3,85 bytes/token en matemáticas, por delante de TAIDE (3,60), Qwen3.6 (3,38) y DeepSeek-V3 (3,68), adecuado para corpus de problemas y soluciones matemáticas.

## Benchmarks y rendimiento

Compresión medida en bytes de UTF-8 por token sobre muestras idénticas (mayor es mejor). Subconjunto de la tabla publicada por el autor:

| Tokenizador | Vocabulario | Web trad. | Wikipedia trad. | Estatutos Taiwán | Chino clásico | Inglés (edu) | Código | Matemáticas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Yunmo-Next | 65.536 | 4,35 | 4,18 | 4,98 | 4,21 | 5,04 | 3,32 | 3,85 |
| TAIDE (Llama 3.1) | 188.256 | 4,27 | 4,01 | 4,52 | 3,83 | 4,75 | 3,92 | 3,60 |
| Qwen3.6 | 248.070 | 4,08 | 3,59 | 3,79 | 3,66 | 4,60 | 3,56 | 3,38 |
| DeepSeek-V3 | 128.815 | 3,97 | 3,58 | 3,77 | 3,56 | 4,79 | 3,57 | 3,68 |
| Breeze | 61.875 | 4,01 | 3,62 | 3,94 | 3,75 | 4,19 | 2,93 | 3,09 |
| Gemma 3 | 262.145 | 3,72 | 3,42 | 3,48 | 3,43 | 4,66 | 3,22 | 3,38 |
| Llama 3.1 | 128.256 | 3,14 | 3,03 | 3,18 | 2,99 | 4,75 | 3,92 | 3,60 |

Compresión fuera de las fuentes del tokenizador (texto que ningún tokenizador comparado usó para entrenarse):

| Tokenizador | Vocabulario | Wikipedia nueva trad. | Wikipedia nueva simp. | Yuan Legislativo | Common Voice zh-TW | Localización Taiwán | Web traducida | Código traducido |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Yunmo-Next | 65.536 | 3,65 | 3,54 | 5,19 | 4,77 | 4,66 | 4,88 | 3,79 |
| PangolinTokenizer | 114.822 | 3,42 | 3,40 | 4,64 | 4,58 | 4,08 | 4,09 | 2,88 |
| TAIDE (Llama 3.1) | 188.256 | 3,72 | 3,29 | 4,64 | 4,75 | 4,55 | 4,57 | 3,95 |
| Breeze 7B | 61.875 | 3,17 | 2,64 | 4,36 | 3,88 | 4,14 | 4,16 | 3,29 |
| Qwen3.5 / 3.6 | 248.066 / 248.070 | 3,30 | 3,58 | 4,67 | 4,61 | 4,29 | 4,25 | 3,63 |
| DeepSeek-V3 | 128.815 | 3,39 | 3,76 | 4,44 | 4,27 | 4,03 | 4,09 | 3,66 |
| Gemma 4 | 262.144 | 3,13 | 3,25 | 4,24 | 4,05 | 3,95 | 3,90 | 3,43 |
| Llama 3.1 | 128.256 | 2,94 | 3,09 | 3,45 | 3,18 | 3,48 | 3,21 | 3,31 |

Resumen de posiciones declarado por el autor: Yunmo-Next queda primero en 9 de 12 dominios medidos (web tradicional, Wikipedia tradicional, textos clásicos, estatutos y sentencias de Taiwán, zhuyin, web en simplificado, inglés y matemáticas), segundo en patentes de Taiwán (TAIDE 4,01 frente a 3,93) y tercero en chino simplificado general (Qwen3.6 5,04, DeepSeek-V3 4,96, Yunmo-Next 4,68). En código ocupa el noveno puesto. Frente a PangolinTokenizer necesita menos tokens en los siete conjuntos fuera de distribución, con un 57% de su vocabulario. No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un tokenizador.

## Requisitos de hardware

- El tokenizador en sí no requiere GPU: la tokenización se ejecuta en CPU y el artefacto es un único `tokenizer.json` de pequeño tamaño.
- VRAM estimada: no aplica al tokenizador; depende del modelo que lo utilice. Para los modelos asociados Yunmo-Next-1B-Base e Instruct, el requisito es el de un modelo de 1.000 millones de parámetros, no especificado en la información disponible.
- GPU recomendadas: no aplica al tokenizador. Para los modelos de 1B asociados, cualquier GPU consumer con suficiente VRAM para el modelo en la cuantización elegida; no se publican cifras concretas.
- Cabe en GPU consumer: sí, el tokenizador; el modelo de 1B asociado también es apto para GPU consumer en cuantizaciones reducidas, aunque no se detallan requisitos.
- Opciones de despliegue: librería `transformers` (requisito declarado), compatible con endpoints; al ser un `tokenizer.json` estándar, es utilizable por cualquier runtime que lo soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa de tokenizadores para chino tradicional y multilingües:

| Tokenizador | Vocabulario | Web trad. (bytes/token) | Fuera de distribución (Yuan Legislativo) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Yunmo-Next | 65.536 | 4,35 | 5,19 | Apache 2.0 | Hugging Face (`yuhuanstudio/Yunmo-Next-Tokenizer`) |
| PangolinTokenizer (OpenFormosa) | 114.822 | no disponible en la tabla | 4,64 | no disponible | Hugging Face (referenciado en la model card) |
| TAIDE (Llama 3.1) | 188.256 | 4,27 | 4,64 | no disponible | Hugging Face (referenciado en la model card) |
| Qwen3.6 | 248.070 | 4,08 | 4,67 | no disponible | Hugging Face (referenciado en la model card) |
| Breeze | 61.875 | 4,01 | 4,36 | no disponible | Hugging Face (referenciado en la model card) |
| Llama 3.1 | 128.256 | 3,14 | 3,45 | no disponible | Hugging Face (referenciado en la model card) |

Frente a PangolinTokenizer, Yunmo-Next logra mayor compresión en los siete conjuntos fuera de distribución con un 57% del vocabulario. Frente a TAIDE, gana en cinco de los siete conjuntos fuera de distribución, pero pierde en Wikipedia tradicional nueva (3,65 frente a 3,72) y en código traducido (3,79 frente a 3,95). Frente a Qwen3.6 y DeepSeek-V3, pierde en chino simplificado general y en código, y gana en chino tradicional, chino clásico, inglés y matemáticas.

## Limitaciones y advertencias

- El código es su dominio más débil: 3,32 bytes/token, noveno puesto entre los tokenizadores evaluados; ocho tokenizadores, incluidos Llama 3.1, TAIDE, Qwen3.6 y DeepSeek-V3, codifican código de forma más compacta.
- Las mediciones in-distribution proceden de las mismas familias de fuentes usadas para entrenar el tokenizador y no garantizan que los documentos muestreados se excluyeran del corpus; favorecen a Yunmo-Next frente a los demás tokenizadores.
- En chino simplificado general queda por detrás de Qwen3.6 y DeepSeek-V3, por lo que no es la mejor opción para corpus predominantemente en simplificado.
- La ausencia de normalización implica que variantes Unicode, mayúsculas y espacios se preservan literalmente; esto es una ventaja para la fidelidad, pero puede producir secuencias distintas para texto visualmente equivalente y afectar a la consistencia en pipelines que esperan normalización.
- El aislamiento de cada dígito decimal como token propio aumenta el número de tokens en textos con muchas cifras, lo que puede penalizar dominios numéricos densos pese al buen resultado agregado en matemáticas.
- Es un tokenizador, no un modelo de lenguaje: no genera texto ni realiza tareas; sus capacidades dependen exclusivamente del modelo que lo utilice.
- La información disponible no incluye datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad, al no ser aplicables a un tokenizador.
- No se documentan restricciones de licencia para uso comercial: la licencia es Apache 2.0, que permite uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se dispone de validación independiente de las cifras publicadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-Tokenizer
- Modelo asociado Yunmo-Next-1B-Base: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
- Modelo asociado Yunmo-Next-1B-Instruct: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Informe del tokenizador (sección 6.4, texto fuera de distribución): https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/tokenizer.md#64-out-of-distribution-text-including-openformosas-corpora
- Repositorio del proyecto Yunmo-Next-1B: https://github.com/YuhuanStudio/Yunmo-Next-1B
