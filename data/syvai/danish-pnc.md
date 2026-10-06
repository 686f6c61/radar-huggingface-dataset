# syvai/danish-pnc

## Resumen

syvai/danish-pnc es un modelo de restauración de puntuación y truecasing para danés, desarrollado por el usuario syvai. Recibe texto en minúsculas y sin signos de puntuación —por ejemplo, la salida de un reconocedor automático de voz— y devuelve ese mismo texto con comas, puntos, signos de interrogación y exclamación, además de las mayúsculas iniciales correspondientes. Una restricción de diseño clave es que las palabras nunca se modifican, añaden ni eliminan, lo que lo hace apto para transcripciones con marcas de tiempo por palabra.

Técnicamente es un ElectraForTokenClassification afinado a partir de jonfd/electra-small-nordic, con 21.880.202 parámetros totales (unos 21,9 millones) y un esquema de 10 etiquetas. Su arquitectura, modelo base y conjunto de etiquetas son idénticos a los de RyeAI/ekko-pnc; la única diferencia es el corpus de entrenamiento. Se distribuye en safetensors (PyTorch) y en ONNX, con una variante FP32 y otra int8 dinámica de aproximadamente 22 MB.

Es relevante porque cubre una tarea de post-procesado muy concreta dentro del ecosistema del danés, un idioma con menos recursos que el inglés, y porque combina un tamaño reducido (0,2 GB de repositorio) con métricas de evaluación publicadas frente a un modelo de referencia. Está pensado para ejecutarse en CPU o en GPUs de gama baja dentro de pipelines de ASR, subtitulado o normalización de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Electra (transformer encoder) para clasificación de tokens; `ElectraForTokenClassification` |
| Parametros totales | 21.880.202 (aproximadamente 21,9 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventanas de entrenamiento de 16 a 180 palabras, `max_length` 256 tokens; en inferencia, ventana deslizante de 128 tokens con solapamiento de 12 palabras |
| Tipos de cuantizacion | FP32 (PyTorch safetensors y ONNX) e int8 dinámica (ONNX, aproximadamente 22 MB) |
| Idiomas soportados | danés (da) únicamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (`pnc.onnx` FP32, `pnc.int8.onnx` int8) |

## Arquitectura y entrenamiento

El modelo es un `ElectraForTokenClassification` construido sobre `jonfd/electra-small-nordic`. Clasifica cada palabra mediante su primer sub-token en uno de 10 etiquetas: la puntuación que sigue a la palabra (`O` para ninguna, `,`, `.`, `?`, `!`) combinada con el sufijo `|U` cuando la palabra debe empezar en mayúscula. Es decir, cinco categorías de puntuación multiplicadas por dos estados de capitalización. Solo produce mayúscula inicial, por lo que no puede restaurar capitalizaciones mixtas como `iPhone`.

El entrenamiento usó 150.000 pasos con batch de 32, longitud máxima de 256, optimizador AdamW con learning rate 1e-4, 3.000 pasos de warmup, decaimiento coseno y weight decay 0,01, en fp32 sobre un Apple M4. Los datos se transmitieron en streaming desde el Hugging Face Hub, sin usar ningún conjunto completo, y se combinaron con pesos de muestreo: subtítulos de películas y series de Danish Dynaword `opensubtitles` (0,24), `dan_Latn` de fineweb-2 (0,24), transcripciones del Folketinget `ft` (0,12), Wikipedia (0,08), Europarl (0,07), foros `hest` (0,07), noticias `nordjyllandnews` y `tv2r` (0,09), discursos parlamentarios `mosel_voxpopuli` (0,05) y discursos y páginas de discusión `danske-taler` y `wiki-comments` (0,04). El texto se pasó a minúsculas y se le eliminó la puntuación para formar la entrada; la puntuación retirada y la capitalización original constituyen las etiquetas. Se descartaron etiquetas de hablante, guiones de diálogo, comillas y URL; los puntos y coma se mapean a comas; los dos puntos a punto o coma según la palabra siguiente; las abreviaturas y ordinales (`kr.`, `8. oktober`) no se tratan como final de frase. También se descartaron documentos con densidad de puntuación inverosímil, capitalización excesiva u ortografía anterior a 1948. Las ventanas de entrenamiento van de 16 a 180 palabras y arrancan en desplazamientos aleatorios, de modo que el modelo aprende a manejar fragmentos que no comienzan al inicio de una frase.

## Capacidades

- Restauración de puntuación: inserta comas, puntos, signos de interrogación y exclamación en texto danés que carece de ellos.
- Truecasing: aplica mayúscula inicial a la primera palabra de cada frase y a las palabras etiquetadas con `|U`.
- Preservación estricta del léxico: las palabras nunca se cambian, añaden ni eliminan, lo que permite conservar alineaciones y marcas de tiempo por palabra.
- Compatibilidad con transcripciones ASR: acepta entrada segmentada en palabras (`is_split_into_words=True`) y devuelve cada palabra de entrada en orden.
- Inferencia con ventana deslizante para textos largos mediante `pnc_infer.py` (ventanas de 128 tokens con solapamiento de 12 palabras).
- Exportación a ONNX con soporte de FP32 e int8 dinámica para despliegue ligero.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un clasificador de tokens, no un modelo generativo.
- No tiene capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüe: no; está entrenado y evaluado únicamente para danés.

## Casos de uso

- Post-procesado de ASR en danés: tras una transcripción automática sin puntuación, el modelo inserta comas y puntos finales y aplica mayúsculas, produciendo texto legible sin alterar ninguna palabra, lo que permite mantener las marcas de tiempo del reconocedor.
- Subtitulado automático para cine y televisión: dado que respeta el léxico original, se puede aplicar sobre los segmentos de subtítulo para mejorar la legibilidad y el troceado de frases sin desincronizar los tiempos.
- Transcripción de reuniones y entrevistas: el helper de ventana deslizante permite procesar conversaciones largas por tramos de 128 tokens con solapamiento, reconstruyendo la puntuación de toda la sesión.
- Normalización previa a síntesis de voz (TTS): un texto sin puntuar produce prosodia plana; este modelo añade los límites de frase y las pausas implícitas que necesita un sistema TTS para generar entonación correcta en danés.
- Segmentación de frases para indexación y búsqueda: al detectar límites de frase (F1 de 0,859 en el conjunto de evaluación), sirve como paso previo para dividir documentos en unidades indexables o para alimentar un motor de recuperación.
- Preprocesado de corpus daneses: limpieza y repuntuado de textos extraídos de web o de fuentes históricas antes de incorporarlos a un pipeline de entrenamiento o de análisis lingüístico.
- Accesibilidad en directo: subtitulado en tiempo real para personas con discapacidad auditiva en emisiones o eventos en danés, donde el coste computacional es mínimo gracias a los 21,9 M de parámetros.
- Archivado de contenido institucional y periodístico: repuntuado de transcripciones parlamentarias (`ft`, `mosel_voxpopuli`) y de noticias (`nordjyllandnews`, `tv2r`) para su publicación o conservación.

## Benchmarks y rendimiento

Conjunto de evaluación de 1.750 ventanas retenidas (de 24 a 160 palabras) procedentes de documentos excluidos del entrenamiento por hash de identificador, que cubren las once fuentes. La comparación se hizo contra RyeAI/ekko-pnc sobre exactamente las mismas entradas y con el mismo código.

| Metrica | RyeAI/ekko-pnc | syvai/danish-pnc |
|---|---:|---:|
| F1 de limite de frase | 0,722 | **0,859** |
| Precision de limite | 0,735 | **0,874** |
| Exhaustividad de limite | 0,710 | **0,844** |
| F1 de coma | 0,670 | **0,787** |
| F1 de punto | 0,696 | **0,825** |
| F1 de interrogacion | 0,479 | **0,756** |
| F1 de exclamacion | 0,000 | **0,271** |
| F1 de capitalizacion | 0,797 | **0,898** |
| Precision a nivel de token | 0,875 | **0,927** |

F1 de límite de frase por fuente (tabla parcial en la información disponible):

| Fuente | RyeAI/ekko-pnc | syvai/danish-pnc |
|---|---:|---:|
| opensubtitles | 0,724 | 0,892 |
| fineweb2 | 0,6 | dato truncado en la informacion disponible |

Los ficheros `eval_results.json` (números en bruto) y `eval_log.jsonl` (curva de entrenamiento por horas) están incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 88 MB de pesos en FP32 y en torno a 22 MB por copia del modelo en int8; el consumo real añade el de las activaciones y el runtime, por lo que en la práctica cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU, incluidas integradas; una RTX 4090 o una A100 están sobredimensionadas para este modelo. No se han publicado requisitos oficiales de hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU. El modelo se entrenó en fp32 sobre un Apple M4, lo que da una idea del perfil de recursos.
- Opciones de despliegue: `transformers` (PyTorch) para inferencia en CPU o GPU; ONNX Runtime para FP32 e int8; al ser un clasificador de tokens no es aplicable a motores de generación como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 de limite de frase | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syvai/danish-pnc | 21,9 M | ventana de 128 tokens con solapamiento de 12 palabras (entrenamiento con `max_length` 256) | 0,859 | cc-by-4.0 | Hugging Face, safetensors y ONNX |
| RyeAI/ekko-pnc | misma arquitectura y modelo base, dato exacto no disponible | mismo esquema de etiquetas | 0,722 | no disponible en la informacion proporcionada | Hugging Face |
| jonfd/electra-small-nordic | no disponible | no disponible | no aplica (modelo base, no afinado para puntuacion) | no disponible en la informacion proporcionada | Hugging Face |

syvai/danish-pnc y RyeAI/ekko-pnc comparten arquitectura, modelo base y esquema de etiquetas; la diferencia es el corpus de entrenamiento, y el modelo de syvai supera a ekko-pnc en las nueve métricas reportadas. No se dispone de datos de otros modelos comparables de puntuación en danés en la información proporcionada.

## Limitaciones y advertencias

- Solo produce mayúscula inicial. No puede restaurar capitalizaciones mixtas ni nombres propios con formato interno especial, como `iPhone`.
- El F1 de exclamación es bajo (0,271), por lo que la inserción de signos de exclamación es poco fiable; se recomienda revisión manual si este signo es crítico.
- El F1 de interrogación (0,756) está por debajo del de coma, punto y límite de frase.
- Está entrenado exclusivamente para danés; no debe usarse con otros idiomas sin reevaluación.
- Requiere entrada en minúsculas y sin puntuación. Si se le pasa texto ya puntuado, el comportamiento no está garantizado.
- Las entradas largas deben trocearse con el helper de ventana deslizante; la ventana de entrenamiento es de 256 tokens y en inferencia se recomienda 128 tokens con 12 palabras de solapamiento.
- Riesgo de alucinación léxica: bajo por diseño, ya que el modelo nunca modifica, añade ni elimina palabras; el riesgo se limita a puntuación y capitalización incorrectas.
- Sesgos heredados del corpus: el peso mayor recae en diálogo de cine y televisión (0,24) y texto web (0,24), por lo que el rendimiento puede degradarse en registros o dominios poco representados, como dialectos o textos técnicos especializados.
- Se descartaron documentos con ortografía anterior a 1948, de modo que el modelo no está adaptado a esa variante histórica.
- Licencia cc-by-4.0: permite uso comercial siempre que se atribuya la autoría y se indique la licencia; no incluye garantías.
- No se han publicado mediciones de latencia, throughput ni consumo de memoria en producción.
- El repositorio tiene un volumen de adopción muy bajo (18 descargas y 1 like en el momento de la consulta), lo que limita la validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syvai/danish-pnc
- Modelo base: https://huggingface.co/jonfd/electra-small-nordic
- Modelo de referencia con la misma arquitectura y esquema de etiquetas: https://huggingface.co/RyeAI/ekko-pnc
- Dataset Danish Dynaword: https://huggingface.co/datasets/danish-foundation-models/danish-dynaword
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Ficheros auxiliares del repositorio: `pnc_infer.py` (inferencia con ventana deslizante), `data.py` (pipeline de datos y entrenamiento), `eval_results.json` y `eval_log.jsonl`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a contenido no relacionado).
