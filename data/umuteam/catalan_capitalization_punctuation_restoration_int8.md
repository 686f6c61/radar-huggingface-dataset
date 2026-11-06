# UMUTeam/catalan_capitalization_punctuation_restoration_int8

## Resumen

`UMUTeam/catalan_capitalization_punctuation_restoration_int8` es un modelo de restauración de mayúsculas y puntuación para catalán, desarrollado por el grupo UMUTeam de la Universidad de Murcia. Se trata de un modelo Transformer basado en BERTa (arquitectura RoBERTa adaptada al catalán) afinado como clasificador de tokens, y distribuido en una versión cuantizada a 8 bits en formato ONNX. Su función es tomar texto catalán sin formato —típicamente transcripciones de reconocimiento automático del habla (ASR)— y devolverlo con mayúsculas y signos de puntuación correctos.

El modelo aborda un problema clásico de post-procesado en pipelines de voz: los sistemas ASR generan secuencias de palabras sin puntuación ni capitalización, lo que degrada la legibilidad y complica el procesado posterior del lenguaje. La propuesta de UMUTeam formula la tarea como etiquetado de tokens con 12 clases que combinan dos niveles de capitalización (minúscula y mayúscula) con cinco signos de puntuación (punto, coma, interrogación, exclamación y dos puntos) o ausencia de ellos.

Es relevante por su especialización monoidiomática (solo catalán), su licencia permisiva Apache 2.0 y su empaquetado ligero (0,1 GB de repositorio) orientado a despliegue en producción. No obstante, el modelo se ha entrenado sobre corpus web (OpusParaCrawl) con aumentación sintética, no sobre transcripciones ASR reales, lo que condiciona su comportamiento en dominios de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERTa, basada en RoBERTa) para token classification |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización a 8 bits del checkpoint) |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint preentrenado BERTa, un Transformer encoder de tipo RoBERTa entrenado específicamente para catalán. Sobre esa base se realiza un ajuste supervisado para clasificación de tokens: cada palabra de entrada recibe una etiqueta que codifica su capitalización (minúscula o mayúscula) y el signo de puntuación que la sigue (`.`, `,`, `?`, `!`, `:` o ninguno), dando lugar a 12 clases (`l`, `u`, `?l`, `?u`, `!l`, `!u`, `,l`, `,u`, `.l`, `.u`, `:l`, `:u`). La tokenización de subpalabras del backbone se aprovecha asignando la etiqueta de la palabra a sus subtokens, e ignorando los tokens especiales con etiqueta `-100` durante el entrenamiento.

Los datos de entrenamiento proceden de la porción catalana de OpusParaCrawl, con 50.000 frases y 1.136.708 palabras tras limpieza y selección. Se aplicó un split a nivel de frase del 60/20/20 (726.486 tokens de entrenamiento, 181.517 de validación y 228.705 de test antes de aumentación). El conjunto de entrenamiento se amplió hasta 981.345 tokens mediante tres técnicas con probabilidad aproximadamente igual (0,33 cada una): retrotraducción catalán→inglés→catalán con modelos de Helsinki-NLP, inserción aleatoria de palabras y borrado aleatorio de palabras, simulando errores típicos de ASR. La model card no especifica hiperparámetros de entrenamiento como tasa de aprendizaje, tamaño de lote, número de épocas ni semilla.

## Capacidades

- Restauración de puntuación en catalán con cinco signos: punto, coma, interrogación, exclamación y dos puntos.
- Restauración de capitalización (mayúscula inicial de frase y de palabra según contexto).
- Clasificación de tokens con 12 etiquetas combinadas de capitalización y puntuación.
- Post-procesado de transcripciones ASR y de texto plano sin formato.
- Preparación de texto para tareas posteriores de PLN (segmentación, análisis sintáctico, etc.).
- Procesamiento de texto con contexto local de la palabra (modelo encoder bidireccional).
- Inferencia en formato ONNX cuantizado a int8, orientada a despliegue ligero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador de tokens sobre texto.

## Casos de uso

- Post-procesado de transcripciones ASR en catalán: el modelo recibe la salida cruda del reconocedor (sin mayúsculas ni signos) y devuelve texto legible, mejorando la calidad de subtítulos y actas automáticas.
- Generación de subtítulos para vídeo y audio: integrado al final del pipeline ASR, añade puntuación y capitalización antes de publicar los subtítulos en plataformas o reproductores.
- Transcripción de reuniones y notas de voz: convierte dictados o grabaciones de reuniones en documentos con estructura de frases, facilitando su lectura y archivo.
- Preprocesado para PLN downstream: la puntuación y capitalización restauradas mejoran el rendimiento de segmentadores, analizadores sintácticos y modelos de resumen que esperan texto bien formado.
- Normalización de corpus web o de chat: textos extraídos de foros, mensajes o scraping sin formato pueden pasarse por el modelo para obtener una versión canónica en catalán.
- Accesibilidad y lectores de pantalla: la puntuación restaurada permite una síntesis de voz más natural y una lectura por pantalla con pausas correctas.
- Enriquecimiento de bases de datos textuales: normalización por lotes de campos de texto en catalán antes de indexación o búsqueda.

## Benchmarks y rendimiento

Evaluación sobre el split de test reservado de OpusParaCrawl en catalán, con F1 macro y F1 ponderado sobre las 12 clases:

| Modelo y datos de entrenamiento | Macro-F1 | Weighted-F1 |
|---|---:|---:|
| BERTa con aumentación de datos | 69,343 % | 90,858 % |
| BERTa sin aumentación de datos | 68,762 % | 90,735 % |

La aumentación aporta una mejora modesta (0,58 puntos de Macro-F1 y 0,12 de Weighted-F1). No se han publicado en la información disponible resultados comparativos con otros modelos de restauración de puntuación en catalán.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0,1 GB y el modelo está cuantizado a int8, por lo que cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Es viable en CPU para lotes moderados.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del checkpoint), y en general cualquier runtime compatible con ONNX; también puede cargarse vía `transformers` si se dispone de los pesos en formato compatible, aunque el artefacto publicado es ONNX int8.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder pequeño cuantizado, se espera baja latencia por frase, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de restauración de puntuación en catalán. A modo de referencia estructural:

| Modelo | Idioma | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UMUTeam catalan_capitalization_punctuation_restoration_int8 | Catalán | BERTa (RoBERTa) int8 | no disponible | Apache 2.0 | Hugging Face (ONNX) |
| Alternativas de restauración de puntuación multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas específicas para catalán | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrenó sobre corpus web (OpusParaCrawl) con aumentación sintética, no sobre transcripciones ASR reales; su comportamiento en dominios de voz puede diferir del reportado en el test de OpusParaCrawl.
- El Macro-F1 de 69,343 % indica un rendimiento moderado en clases poco frecuentes (interrogación, exclamación, dos puntos), que son precisamente las más difíciles.
- Solo soporta catalán; no debe aplicarse a otras lenguas.
- No es un sistema de reconocimiento del habla: acepta texto, no audio.
- Riesgo de alucinación limitado al ámbito de la clasificación (puede insertar puntuación incorrecta o capitalizar de forma errónea), pero no genera contenido nuevo.
- La model card no documenta sesgos específicos del corpus ni evaluación por subgrupos o dominios.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del corpus OpusParaCrawl subyacente si se redistribuyen derivados.
- No se especifican hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, semilla), lo que dificulta la reproducibilidad exacta del checkpoint.
- El checkpoint publicado está cuantizado a int8; puede existir una pérdida de precisión respecto al modelo en punto flotante, no cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UMUTeam/catalan_capitalization_punctuation_restoration_int8
- Repositorio del grupo UMUTeam: https://huggingface.co/UMUTeam
- Corpus OpusParaCrawl (referencia Bañón et al., 2020): no disponible enlace directo en la información proporcionada
- Publicación asociada: no disponible enlace directo en la información proporcionada
- Modelos de traducción Helsinki-NLP (usados en retrotraducción): https://huggingface.co/Helsinki-NLP
