# value-productions/quickmt-en-vi-int8

## Resumen

quickmt-en-vi-int8 es una redistribución cuantizada del modelo de traducción quickmt/quickmt-en-vi (inglés → vietnamita), publicada por value-productions. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a CTranslate2 con cuantización int8, pensada para su uso dentro de la aplicación Yaku Translate. El repositorio ocupa aproximadamente 0,2 GB e incluye model.bin, config.json, los vocabularios de origen y destino y dos modelos SentencePiece independientes (src.spm.model y tgt.spm.model).

La relevancia de esta ficha es acotada y muy específica: no compite en la categoría de modelos generativos de propósito general, sino en la de traducción automática neuronal ligera y desplegable en CPU. La conversión aplica cuantización int8 por filas a cada peso bidimensional, el mismo esquema que utiliza la quantización ModelSpec de CTranslate2, y el autor afirma que la salida en las frases comprobadas es idéntica carácter a carácter a la del original en float16.

No se dispone de información sobre el número de parámetros, la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Todos esos datos se marcan como no disponibles en esta ficha. El modelo base es de quickmt y se distribuye bajo licencia CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La estructura de ficheros (vocabularios separados y SentencePiece por idioma) sugiere un modelo seq2seq con tokenización independiente por lengua; el autor no lo especifica |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8, cuantización por filas de cada peso bidimensional (mismo esquema que ModelSpec de CTranslate2); el original está en float16 |
| Idiomas soportados | Inglés → vietnamita (par único). El campo de idiomas de HuggingFace figura como no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin) con config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model y tgt.spm.model |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento: no hay datos sobre número de tokens, composición del corpus, técnicas de alineación, filtrado de datos ni ajuste final (RLHF, DPO o similares). Lo único documentado es el proceso de conversión: recuantización de los pesos de quickmt/quickmt-en-vi a int8, aplicada fila por fila sobre cada tensor bidimensional, siguiendo el esquema de cuantización ModelSpec de CTranslate2. La conversión está fechada el 26.10.2026.

La innovación técnica destacable, y prácticamente la única documentada, es la preservación de la calidad tras la cuantización: el autor declara que la salida en las frases comprobadas es idéntica carácter a carácter a la del original en float16. Esto es coherente con el comportamiento habitual de la cuantización int8 en CTranslate2 para modelos de traducción, donde la pérdida de calidad suele ser marginal, pero se trata de una comprobación acotada y no de una evaluación sistemática con métricas (BLEU, chrF, COMET). No se han publicado resultados de esas métricas.

## Capacidades

- Traducción automática directa inglés → vietnamita, en modo texto.
- Traducción de frases y párrafos individuales; el modelo está empaquetado para inferencia con CTranslate2, que procesa secuencias completas en una sola pasada.
- Inferencia eficiente en CPU gracias a los pesos int8 y al tamaño reducido del repositorio (0,2 GB).
- Tokenización SentencePiece separada para origen y destino, con vocabularios independientes.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es multilingüe: cubre exclusivamente el par inglés → vietnamita.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- No se documenta traducción inversa (vietnamita → inglés).

## Casos de uso

- Traducción integrada en aplicación móvil o de escritorio: el modelo está empaquetado específicamente para Yaku Translate y su tamaño de 0,2 GB en int8 permite incluirlo como recurso local sin depender de una API externa, con la ventaja de privacidad que implica que el texto no salga del dispositivo.
- Traducción por lotes en servidores sin GPU: al ejecutarse con CTranslate2 en CPU, encaja en pipelines de localización que procesan miles de cadenas de documentación o recursos de software y donde el coste de GPU no está justificado.
- Localización de catálogos de comercio electrónico: traducción de descripciones de producto y fichas técnicas del inglés al vietnamita para mercados de Vietnam, con volúmenes altos y necesidad de coste por token bajo.
- Subtitulado y transcripción: traducción de segmentos cortos de subtítulos (una o dos líneas) en un flujo que ya genera el texto en inglés; el modelo encaja porque trabaja segmento a segmento sin necesidad de contexto largo.
- Traducción de tickets de soporte: conversión de mensajes de clientes o de operadores del inglés al vietnamita en un sistema de atención al cliente, siempre que se acepte que es un modelo de traducción puro y no un asistente conversacional.
- Despliegue en hardware limitado o en el borde: por su tamaño, es viable en dispositivos con poca memoria (por ejemplo, placas SBC o contenedores pequeños) donde no cabría un modelo multilingüe de gran tamaño.
- Anonimización previa a la traducción: al ejecutarse en local, permite traducir documentos sensibles sin enviarlos a servicios en la nube de terceros, cumpliendo requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente menciona una comprobación cualitativa: en las frases verificadas, la salida int8 coincide carácter a carácter con la del original float16. No hay cifras de BLEU, chrF, COMET, METEOR ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM: no aplica en el escenario habitual; el modelo está pensado para CPU. Como estimación a partir del tamaño del repositorio (0,2 GB en int8), la huella en memoria debería situarse en el entorno de unos pocos cientos de MB, incluyendo vocabularios y runtime de CTranslate2.
- GPU recomendadas: no se especifican. CTranslate2 puede ejecutar en GPU CUDA, pero para un modelo de este tamaño una GPU dedicada está sobredimensionada; cualquier GPU consumer reciente sería más que suficiente si se opta por esa vía.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio; también cabe en CPU y en dispositivos de memoria reducida.
- Opciones de despliegue: CTranslate2 (bindings de Python y C++), que es el formato nativo del modelo. No es compatible con llama.cpp, Ollama, vLLM ni TGI, que esperan otros formatos de pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| quickmt-en-vi-int8 (este modelo) | No disponible | No disponible | CC BY 4.0 | CTranslate2 int8 | HuggingFace, repo de 0,2 GB |
| quickmt/quickmt-en-vi (original) | No disponible | No disponible | CC BY 4.0 | Pesos originales en float16 | HuggingFace |
| Helsinki-NLP/opus-mt-en-vi | No disponible en la información proporcionada | No disponible | No disponible | No disponible | HuggingFace |
| NLLB-200 (variantes multilingües) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos verificados de rendimiento comparado entre estas alternativas. La diferencia objetiva y documentada frente al original es el formato y el tamaño: la versión int8 para CTranslate2 frente a los pesos en float16 del modelo base. Frente a alternativas multilingües de mayor tamaño, la ventaja esperada es el coste de despliegue, no la calidad ni la cobertura de idiomas, que aquí se limita a un único par.

## Limitaciones y advertencias

- Cobertura de un solo par de idiomas y una sola dirección (inglés → vietnamita). No sirve para otros pares ni para traducción inversa.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, solo una comprobación cualitativa de que la cuantización no altera la salida en las frases probadas.
- La comprobación de equivalencia con float16 es acotada; no garantiza comportamiento idéntico en dominios no vistos.
- Riesgo de alucinación en sentido traslativo: omisiones, adiciones o invenciones de contenido, habitual en modelos de traducción neuronal, especialmente con términos técnicos, nombres propios y segmentos ambiguos. No se documenta ningún mecanismo de mitigación.
- Sesgos: no hay información sobre la composición del corpus de entrenamiento, por lo que no se puede evaluar el sesgo demográfico, de género ni de dominio del modelo base.
- Longitud de contexto desconocida: no se debe asumir que soporte documentos largos; los modelos de traducción de este tipo suelen estar limitados a nivel de frase o párrafo.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a los autores (quickmt y, en su caso, value-productions) y la indicación de cambios. Conviene revisar los requisitos exactos de atribución antes de integrarlo en un producto.
- El modelo no incorpora filtros de seguridad ni moderación de contenido documentados; cualquier control debe implementarse en la capa de aplicación.
- Manejo del vietnamita: no se documenta cómo trata los diacríticos ni la segmentación silábica, aspectos críticos en este idioma; conviene validarlo con un conjunto propio antes de producción.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la señal de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/value-productions/quickmt-en-vi-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-en-vi
- Repositorio de CTranslate2 (formato y quantización ModelSpec): no incluido en la información proporcionada
- Paper o blog del modelo base: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a diccionarios anglofranceses sobre la palabra "value" y no guardan relación con el modelo.
