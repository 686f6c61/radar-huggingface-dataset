# yasalma/cyrillic2zamanalif_canine

## Resumen

`yasalma/cyrillic2zamanalif_canine` es un modelo de clasificación de tokens a nivel de carácter que convierte palabras del tártaro escrito en cirílico a Zamanalif, una variante del alfabeto latino tártaro. Lo desarrolla el usuario `yasalma` (vinculado al proyecto neurotatarlar) y parte de `google/canine-c`, un encoder transformer que opera directamente sobre caracteres Unicode en lugar de sobre subwords. El modelo añade una cabeza de clasificación con 172 etiquetas de salida, donde cada etiqueta contiene cero o más caracteres latinos que se concatenan para reconstruir la palabra convertida.

El problema que resuelve es acotado pero específico: la transliteración de una única palabra tártara del cirílico al Zamanalif, con una frase de contexto opcional que se concatena tras la palabra fuente. No es un modelo generativo ni un traductor de frases completas; es un sistema de etiquetado carácter a carácter que requiere decodificación personalizada, ya que un pipeline genérico de `token-classification` devolvería etiquetas en lugar de la palabra convertida.

Su relevancia es principalmente práctica para el ecosistema tártaro: digitalización de textos, normalización ortográfica y herramientas de conversión entre sistemas de escritura. Con 132.215.212 parámetros y un repo de 0,5 GB, es un modelo de tamaño medio que se apoya en la tokenización por caracteres de CANINE para manejar alfabetos no latinos sin vocabulario subword.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CANINE (encoder transformer con tokenización a nivel de carácter Unicode), con cabeza de clasificación de tokens |
| Parametros totales | 132.215.212 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 caracteres de entrada (truncación configurada en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tártaro (`tt`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `google/canine-c` y se ajusta fino con `CanineForTokenClassification`. CANINE procesa la entrada como una secuencia de caracteres Unicode, lo que elimina la dependencia de un vocabulario subword y resulta adecuado para alfabetos cirílicos y para mapeos carácter a carácter. La cabeza de clasificación tiene 172 etiquetas de salida; cada etiqueta representa cero o más caracteres latinos, y la decodificación concatena las etiquetas predichas para cada carácter fuente. La entrada máxima es de 256 caracteres y el modelo espera la palabra seguida opcionalmente de una línea `\nконтекст: ` con la frase de contexto.

Los datos de entrenamiento provienen de exportaciones locales de anotación de Label Studio. Tras resolver anotaciones conflictivas, el conjunto contiene 38.381 pares palabra-ortografía, con una división agrupada (semilla 42) de 32.621 ejemplos de entrenamiento y 5.760 de validación. Los ejemplos solo-palabra se agrupan por palabra cirílica; los ejemplos con contexto se agrupan por muestra o frase. Los objetivos a nivel de carácter se generan alineando cada par anotado con una heurística escrita a mano, `LETTER_OPTIONS`, que puede asignar un segmento objetivo al carácter fuente equivocado. El entrenamiento usa 3 épocas, learning rate 3e-5, batch size 1 y acumulación de gradiente de 16, seleccionando el mejor checkpoint por exact match en validación. Los datos no se distribuyen con el modelo.

## Capacidades

- Transliteración de una única palabra tártara del cirílico al Zamanalif.
- Uso opcional de una frase de contexto concatenada tras la palabra fuente; la salida contiene solo la palabra convertida.
- Etiquetado carácter a carácter con 172 etiquetas de salida, donde cada etiqueta puede mapear a cero o más caracteres latinos.
- Manejo de entradas de hasta 256 caracteres (palabra más contexto), con truncación controlada en el ejemplo de uso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo discriminativo de clasificación, no generativo.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al tártaro (`tt`); no se documentan otros idiomas.

## Casos de uso

- Normalización ortográfica de corpus tártaros: convertir listas de palabras en cirílico a Zamanalif para construir índices, glosarios o bases léxicas, aprovechando el exact match del 92,34% en el subconjunto solo-palabra.
- Digitalización de textos históricos o administrativos: procesar palabra a palabra un documento escaneado y OCRizado, pasando cada token cirílico al modelo y reconstruyendo el texto en Zamanalif.
- Herramientas de conversión para editores y correctores: integrar el modelo en un plugin que sugiera la forma Zamanalif de una palabra seleccionada, con la frase circundante como contexto opcional.
- Búsqueda y recuperación multialfabeto: indexar documentos tártaros en cirílico y permitir consultas en Zamanalif (o viceversa) normalizando ambos lados mediante el modelo.
- Lingüística computacional y estudio de variantes ortográficas: comparar formas cirílicas y Zamanalif en corpus paralelos, usando el modelo para alinear pares palabra-ortografía y medir variación.
- Preprocesado para pipelines de NLP tártaro: convertir entradas a una representación latina consistente antes de pasarlas a modelos de embeddings o clasificadores entrenados en Zamanalif.
- Anotación asistida: generar conversiones candidatas para revisión humana en flujos de Label Studio, reduciendo el trabajo manual en la creación de nuevos pares de entrenamiento.

## Benchmarks y rendimiento

Resultados del split de validación agrupado del notebook, con exact match sobre palabras completas tras normalización de mayúsculas y CER como distancia de edición total dividida por el total de caracteres objetivo (menor es mejor):

| Split | Ejemplos | Exact match | CER |
|---|---:|---:|---:|
| Todos | 5.760 | 92,03% | 0,00933 |
| Solo palabra | 5.522 | 92,34% | 0,00883 |
| Con contexto | 238 | 84,87% | 0,04724 |

En las mismas filas de validación, el conversor ByT5 obtiene un 93,58% de exact match global. El subconjunto con contexto es pequeño y 234 de sus 238 palabras de validación también aparecen en entrenamiento bajo otro tipo de tarea, por lo que estas cifras no establecen rendimiento sobre palabras ambiguas nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 132,2 millones de parámetros, en fp32 ocupa aproximadamente 0,5 GB de pesos, y en fp16/bf16 alrededor de 0,25 GB, más activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el ejemplo del autor contempla `cuda`, `mps` (Apple Silicon) y CPU.
- Cabe en GPU de consumo: sí, en GTX/RTX de gama baja y media, así como en portátiles con iGPU o Apple Silicon vía MPS.
- Opciones de despliegue: `transformers` con `CanineForTokenClassification` (requiere decodificación personalizada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo discriminativo de clasificación no encaja en los pipelines generativos habituales de esas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Exact match (validación) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|---|
| yasalma/cyrillic2zamanalif_canine | 132.215.212 | 256 caracteres | Clasificación de caracteres CANINE | 92,03% global | no disponible | Hugging Face |
| Conversor ByT5 (referencia del autor) | no disponible | no disponible | Seq2seq a nivel de byte | 93,58% global | no disponible | no disponible |
| google/canine-c (modelo base) | 132.215.212 | 2048 caracteres (según modelo base) | Encoder CANINE preentrenado | no aplica (no translitera) | no disponible en la información | Hugging Face |

La comparación directa con ByT5 procede de la propia model card y se limita a las mismas filas de validación. No se dispone de datos de otros conversores cirílico-latino para tártaro en la información proporcionada.

## Limitaciones y advertencias

- Convierte una sola palabra por llamada; no traduces frases ni documentos completos de forma nativa.
- Requiere decodificación personalizada: un pipeline genérico de `token-classification` muestra etiquetas en lugar de la palabra convertida.
- Límite de entrada de 256 caracteres; palabras o contextos más largos se truncan y el ejemplo de uso lanza error si la palabra fuente se trunca.
- La heurística `LETTER_OPTIONS` usada para crear las etiquetas de entrenamiento puede asignar un segmento objetivo al carácter fuente equivocado, lo que introduce ruido en el aprendizaje.
- El subconjunto con contexto es muy pequeño (238 ejemplos) y solapa en su mayoría con el entrenamiento, por lo que el rendimiento en palabras ambiguas nuevas no está establecido.
- Riesgo de alucinación en el sentido de conversiones incorrectas para palabras fuera de distribución, préstamos léxicos o nombres propios no vistos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar al autor antes de producción.
- Idiomas limitados al tártaro; no se documenta soporte para otras lenguas con cirílico.
- Los datos de entrenamiento no se distribuyen con el modelo, lo que dificulta reproducir o auditar el ajuste fino.
- El modelo es discriminativo y no generativo: no ofrece tool calling, agentes ni razonamiento multi-step.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasalma/cyrillic2zamanalif_canine
- Modelo base: https://huggingface.co/google/canine-c
- Notebook de entrenamiento: https://github.com/neurotatarlar/cyrillic2zamanalif/blob/main/train_zamanalif_char_experiment.ipynb
- Repositorio del proyecto: https://github.com/neurotatarlar/cyrillic2zamanalif
