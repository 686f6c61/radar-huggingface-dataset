# Zual/soter-mini

## Resumen

Sôtêr mini es un lematizador de griego antiguo desarrollado por Zual, con apenas 1,87 millones de parámetros. A pesar de su tamaño reducido, alcanza resultados comparables a los sistemas del estado del arte en los *treebanks* UD de griego antiguo, superando incluso a modelos con cientos de millones de parámetros en la convención Perseus. El modelo emplea una arquitectura T5 (encoder-decoder) entrenada desde cero, con entrada a nivel de byte, lo que elimina problemas de segmentación y vocabulario fuera de vocabulario.

Su relevancia actual radica en su tamaño extremadamente compacto (2,1 MB en int8), que permite ejecutarlo en navegador o en entornos con recursos mínimos, manteniendo una precisión cercana a la de modelos mucho mayores. El proyecto incluye una versión de mayor tamaño (`Zual/soter-megas`, 581 M parámetros) de la que este modelo es una destilación. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (3+3 capas, `d_model` 128, `d_ff` 512, 4 cabezas) |
| Parametros totales | 1.870.976 (~1,87 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas limitadas a 384 bytes, contexto ±8 tokens) |
| Tipos de cuantizacion | fp32, int8 (ONNX) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32, int8) |

## Arquitectura y entrenamiento

El modelo es un T5 entrenado desde cero, sin reutilizar pesos de ByT5. La entrada se procesa a nivel de byte, con un vocabulario de solo 387 tokens, lo que evita problemas de segmentación y grafías inusuales. El entrenamiento se realizó mediante destilación en dos etapas: primero, un LLM generalista (DeepSeek V4-Flash) anotó los *treebanks* UD con pocos ejemplos; luego, un ByT5-base fue destilado sobre esas anotaciones para producir `Soter-megas` (581 M parámetros); finalmente, este modelo grande re-anotó un corpus extenso, sobre el cual se entrenó `soter-mini`.

El corpus de entrenamiento contiene 49.379.934 ejemplos (cada ejemplo es un token a lematizar), con 8,3 mil millones de sub-tokens por época, todo en convención Perseus. Se ejecutaron 150.000 pasos con batch efectivo de 512, optimizador Adafactor, tasa de aprendizaje inicial de 1e-3 con *warmup* del 5 % y decaimiento lineal hasta cero. El recocido de la tasa de aprendizaje fue crucial, aportando +0,3 puntos en el score compuesto. El contexto de entrada es de ±8 tokens, con un máximo de 384 bytes.

## Capacidades

- Lematización de griego antiguo en la convención Perseus/AGDT, alineada con las entradas del diccionario LSJ.
- Procesamiento de texto a nivel de byte, sin problemas de segmentación ni vocabulario fuera de cobertura.
- Soporte de conversión a otras convenciones (PROIEL, PTNK) mediante tablas de correspondencia externas (3.521 y 366 conversiones respectivamente).
- Exportación ONNX en fp32 e int8 para despliegue ligero, con una pérdida de solo 0,01 punto en los benchmarks.
- No soporta *tool calling*, agentes, visión ni audio; es un modelo de texto a texto específico para lematización.

## Casos de uso

- **Investigación filológica**: lematizar corpus de textos clásicos griegos para estudios de frecuencia, morfología o sintaxis histórica. El modelo procesa contexto de ±8 tokens, lo que permite desambiguar formas ambiguas.
- **Digitalización de manuscritos**: integrar el modelo en pipelines de OCR para lematizar automáticamente textos escaneados, normalizando variantes gráficas.
- **Aplicaciones educativas**: herramienta para estudiantes de griego antiguo que quieran consultar el lema de una palabra en contexto, sin necesidad de servidor.
- **Preprocesamiento para NLP**: paso previo a análisis sintáctico o semántico de corpus griegos antiguos, proporcionando lemas consistentes en la convención Perseus.
- **Despliegue en navegador**: gracias a su tamaño y a la cuantización int8, puede ejecutarse en tiempo real en una página web, como la demo oficial, para anotación interactiva.
- **Integración en pipelines de investigación**: enlazar con el LSJ u otros diccionarios digitales, alineando cada forma con su entrada léxica.

## Benchmarks y rendimiento

Resultados en los *treebanks* UD de griego antiguo, evaluados con `conll18_ud_eval` (columna Lemmas, segmentación gold, NFC):

| Modelo | PROIEL | Perseus | PTNK |
|---|---|---|---|
| **Sôtér mini (1,9 M)** | **97.41** ¹ | **92.75** | **98.59** ¹ |
| Sôtér 9,6 M (multi-convención) | 94.43 | 93.06 | 98.18 |
| Sōtēr Megas (581 M) | 96.99 | 92.91 | 98.40 |
| Mejor publicado (GreTa+LLM, ACL 2023) | 97.48 | 91.14 | — |

¹ Después de aplicar la tabla de conversión. Sin ella, la salida es en convención Perseus y obtiene 92.06 en PROIEL y 94.64 en PTNK.

En el corpus DBBE (griego bizantino no editado, zero-shot, 10k tokens): exactitud 79.28 (83.89 sin diacríticos), frente a 79.31 del SOTA supervisado en ese dominio (MTL_lemma, ACL Findings 2025). La diferencia es de tres centésimas, dentro del error estándar binomial (0.41).

## Requisitos de hardware

- VRAM estimada: < 10 MB en fp32, ~2 MB en int8; no requiere GPU dedicada.
- GPU recomendadas: cualquiera, incluso integradas; es viable en CPU y en navegador.
- Cabe en *consumer GPU* sin problema, y también en dispositivos móviles o embebidos.
- Opciones de despliegue: `transformers`, ONNX Runtime, `text-generation-inference` (por compatibilidad), o integración directa en aplicaciones web.
- Latencia: prácticamente instantánea; el throughput es de miles de tokens por segundo en CPU modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | PROIEL | Perseus | PTNK | Licencia |
|---|---|---|---|---|---|
| **Sôt mini** | 1,87 M | 97.41 | 92.75 | 98.59 | Apache 2.0 |
| Sôt 9,6 M (multi-conv.) | 9,6 M | 94.43 | 93.06 | 98.18 | Apache 2.0 |
| Sōtēr Megas | 581 M | 96.99 | 92.91 | 98.40 | Apache 2.0 |
| GreTa+LLa (mejor publicado) | cientos de M | 97.48 | 91.14 | — | — |

La comparativa muestra que `soter-mini` iguala o supera a modelos de mayor tamaño en las tres convenciones, con una fracción mínima de los parámetros.

## Limitaciones y advertencias

- **Requiere texto en NFC**: el modelo opera a nivel de bytes; texto en NFD (acentos descompuestos, típico de copiar desde macOS o PDF) produce salida incorrecta.
- **Conversión de convenciones**: para obtener lemas en convención PROIEL o PTNK es imprescindible aplicar las tablas de correspondencia; sin ellas, la salida es en Perseus.
- **Sesgo por datos de entrenamiento**: los *treebanks* UD son públicos y pudieron ser vistos por el LLM anotador en su preentrenamiento; aunque se excluyeron las frases de dev y test, el Nuevo Testamento existe en varias ediciones y la exclusión exacta no siempre es suficiente.
- **Evaluación DBBE**: el protocolo de reconstrucción de límites de frase puede no coincidir exactamente con el de Swaelens et al.; se recomienda verificar antes de comparaciones finas.
- **Uso restringido**: es un modelo de lematización, no un LLM general; no genera texto libre ni soporta tareas fuera de su ámbito.
- **Licencia**: Apache 2.0, sin restricciones de uso comercial, pero sin garantías.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Zual/soter-mini)
- [Demo interactiva](https://lucpommeret.com/soter/)
- [Modelo hermano mayor: Zual/soter-megas](https://huggingface.co/Zual/soter-megas)
- [Modelo intermedio: Zual/soter](https://huggingface.co/Zual/soter) (no detallado en la búsqueda)
- [Referencia al sistema GreTa+LLa (ACL 2023)](https://aclanthology.org/) (no enlazado, citado en la model card)
