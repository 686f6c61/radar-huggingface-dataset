# thealper2/t5-base-paradetox-detox

## Resumen

El modelo `thealper2/t5-base-paradetox-detox` es un ajuste fino de `google-t5/t5-base`, un transformer encoder-decoder de 222.903.552 parámetros (~223 M), para detoxificación de texto en inglés mediante transferencia de estilo secuencia a secuencia. Dado un enunciado tóxico, devuelve una paráfrasis neutra que conserva el contenido proposicional; la tarea se formula como generación condicional con el prefijo explícito `detoxify: `, aplicado de forma idéntica en entrenamiento, evaluación e inferencia.

Lo publica el usuario `thealper2` y se entrena sobre el split de entrenamiento de `s-nlp/paradetox`, con un reparto consciente de grupos (17.760 / 1.001 / 983 filas) que evita la fuga de paráfrasis entre splits. El modelo tiene un límite práctico de 64 tokens de entrada y 64 de salida, licencia Apache 2.0 y pesos en safetensors, por lo que se despliega en hardware muy modesto.

Su relevancia es acotada y específica: es un componente de limpieza de datos y moderación, no un modelo de propósito general. Destaca por documentar en detalle la evaluación (métricas de referencia, clasificador de toxicidad y preservación semántica) y por publicar las huellas sha256 de los splits, algo poco habitual. Con 0 descargas y 0 likes en el momento de la consulta, carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer seq2seq denso) |
| Parámetros totales | 222.903.552 (~223 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens de entrada (max_source_length) y 64 tokens de salida (max_target_length) |
| Tipos de cuantización | no disponible (el autor solo publica pesos safetensors en precisión mixta bf16; no hay variantes GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `google-t5/t5-base` |
| Dataset de entrenamiento | `s-nlp/paradetox` |
| Tamaño del repositorio | 0,9 GB |
| Pipeline declarado en HuggingFace | `text-generation` (el pipeline real del modelo es `text2text-generation`) |

## Arquitectura y entrenamiento

Arquitectura T5 estándar (encoder-decoder con atención completa, sin mecanismos lineales ni SSM). El ajuste se hizo en precisión mixta bf16 sobre el dataset `s-nlp/paradetox`, que contiene pares paralelos tóxico/neutro y hasta tres paráfrasis neutras escritas por anotadores para una misma frase tóxica. El aspecto metodológicamente más relevante es que el split se calcula sobre frases fuente únicas y no sobre filas: de otro modo dos paráfrasis de la misma frase acabarían repartidas entre train y test e inflarían todas las métricas. Los tamaños resultantes son 17.760 filas de entrenamiento, 1.001 de validación y 983 de test, con semilla 42 y huellas sha256 publicadas (`5107f460c600b24a`, `1553707e06c53e22`, `110b37a06c3c22fb`).

Hiperparámetros: optimizador `adamw_torch`, learning rate 1e-4, scheduler lineal, 166 pasos de warmup (ratio 0,06), weight decay 0,01, gradient clipping 1,0, batch por dispositivo 16, acumulación de gradiente 2 (batch efectivo 32), 5 épocas, 2.220 pasos completados. El entrenamiento duró 13,1 minutos en una NVIDIA GeForce RTX 5060 Ti con 15,9 GiB de VRAM. La selección del checkpoint se hizo por mejor pérdida de validación (`eval_loss` = 0,7999) sin usar el conjunto de test para elegir modelo ni hiperparámetros. No se menciona ningún ajuste por RLHF, DPO o preferencias humanas: es un ajuste supervisado puro sobre pares paralelos. La generación usa búsqueda por haz determinista (`num_beams=5`, `max_new_tokens=64`, `length_penalty=1.0`, `no_repeat_ngram_size=3`, `early_stopping=True`, `do_sample=False`).

## Capacidades

- Reescritura de estilo (transferencia de estilo texto a texto): convierte una frase tóxica en inglés en una frase neutra preservando el contenido proposicional.
- Detoxificación con prefijo de tarea: requiere el prefijo `detoxify: ` en la entrada; sin él, el comportamiento no está validado por el autor.
- Generación determinista con búsqueda por haz: misma entrada y misma configuración producen la misma salida, lo que facilita la reproducibilidad en pipelines.
- Preservación semántica medida: similitud coseno media de 0,8744 entre entrada y salida con `all-MiniLM-L6-v2`; solo el 1,01 % de las salidas cae por debajo de coseno 0,5.
- Manejo de texto informal, abreviado y con errores ortográficos propios de redes sociales (parcial, ver limitaciones).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso; es un modelo de una sola pasada.
- Sin capacidades de visión, audio ni modo «thinking».
- Monolingüe: únicamente inglés; no hay evaluación publicada en otros idiomas.

## Casos de uso

- Moderación asistida en foros y comunidades: el modelo reescribe un comentario tóxico antes de publicarlo o propone al usuario una versión neutra. Su coste computacional (223 M de parámetros, menos de 1 GB en fp16) permite ejecutarlo en la misma máquina que sirve la aplicación, sin depender de APIs externas.
- Saneado de corpus para entrenamiento de modelos: preprocesar grandes volúmenes de comentarios, reseñas o tuits para reducir la toxicidad antes de usarlos como datos de preentrenamiento o ajuste fino, gracias al procesamiento por lotes y a la generación determinista por búsqueda por haz.
- Protección de anotadores humanos: en proyectos de etiquetado, filtrar o reescribir automáticamente el texto ofensivo antes de que llegue a los anotadores, reduciendo la exposición a contenido dañino sin eliminar la opinión subyacente.
- Limpieza previa al envío a LLM de terceros: actuar como paso intermedio que elimina insultos y lenguaje ofensivo de los prompts antes de mandarlos a un modelo mayor alojado externamente, útil por requisitos de cumplimiento o de reputación de marca.
- Extensiones de escritura neutral: integrarse en un editor de texto o extensión de navegador que sugiera una alternativa neutra en el momento de redactar, con el modo determinista como garantía de que la sugerencia no varíe entre llamadas.
- Generación de datos sintéticos: producir pares tóxico-neutral adicionales para ampliar datasets de detoxificación o para aumentar ejemplos de clase en clasificadores de toxicidad, dado el bajo coste de inferencia y la reproducibilidad del muestreo.
- Investigación en transferencia de estilo: servir como línea base reproducible en experimentos de text style transfer, ya que el repositorio publica los fingerprints de los splits, los hiperparámetros exactos y las métricas con baseline de copia de la entrada.
- Análisis de sentimiento y minería de opinión sobre redes sociales: normalizar el texto ofensivo antes de pasarlo por clasificadores o analizadores de sentimiento, evitando que el léxico insultante contamine las representaciones y manteniendo la polaridad del mensaje.

## Benchmarks y rendimiento

Evaluación sobre el split de test retenido: 596 entradas tóxicas únicas y 962 referencias humanas (puntuación multirreferencia). Todos los valores proceden de la model card del autor.

Métricas basadas en referencia, con columna de control «copiar la entrada» (puntúa el texto tóxico sin modificar contra las mismas referencias):

| Métrica | t5-base ajustado | Baseline copiar entrada |
|---|---|---|
| BLEU | 65,1543 | 54,6411 |
| ROUGE-1 | 84,6654 | 78,8245 |
| ROUGE-2 | 75,1529 | 64,9939 |
| ROUGE-L | 84,2702 | 78,4225 |
| BERTScore precision | 95,4743 | 93,2649 |
| BERTScore recall | 95,739 | 95,8614 |
| BERTScore F1 | 95,5527 | 94,5023 |

Toxicidad medida con el clasificador `s-nlp/roberta_toxicity_classifier` y umbral 0,5:

| Medición | Valor |
|---|---|
| Tasa de toxicidad de la entrada (%) | 100 |
| Tasa de toxicidad de la salida generada (%) | 13,59 |
| Tasa de toxicidad de las referencias humanas (%) | 6,21 |
| P(toxic) media de la entrada | 0,9903 |
| P(toxic) media de la salida generada | 0,1319 |
| Tasa de detoxificación (%) | 86,41 |
| Tasa de toxicidad remanente (%) | 13,59 |
| Tasa de detoxificación de las referencias humanas (%) | 93,79 |
| Tasa de toxicidad nueva (%) | no aplica |

Preservación semántica con embeddings de `sentence-transformers/all-MiniLM-L6-v2`:

| Medición | Valor |
|---|---|
| Coseno(entrada, generado), media | 0,8744 |
| Coseno(entrada, generado), mediana | 0,904 |
| Coseno(entrada, generado), percentil 10 | 0,7215 |
| Coseno(entrada, referencia humana), media | 0,7873 |
| Coseno(generado, referencia humana), media | 0,8366 |
| Salidas por debajo de coseno 0,5 (%) | 1,01 |

Diagnóstico conjunto: entre las 596 entradas clasificadas como tóxicas, el 83,56 % produjo una salida simultáneamente clasificada como no tóxica y con coseno ≥ 0,6 respecto a la entrada. El autor advierte explícitamente de que es la intersección de dos medidas ruidosas y no una puntuación global del modelo. No se han publicado comparaciones con otros modelos de detoxificación en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: ~0,89 GB en fp32, ~0,45 GB en bf16/fp16, ~0,22 GB en int8 y ~0,11 GB en 4 bits. Con secuencias de 64 tokens y lotes pequeños, las activaciones añaden decenas de MB, por lo que la inferencia completa cabe holgadamente por debajo de 1,5 GB en fp16.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM. El propio autor entrenó el modelo en una NVIDIA GeForce RTX 5060 Ti (15,9 GiB), muy por encima de lo necesario. Funciona sin problema en RTX 4090, RTX 3090, RTX 3060, GTX 1650 o GPUs integradas modernas. No requiere A100 ni H100.
- Inferencia en CPU: totalmente viable en un solo núcleo para texto corto, dado el tamaño de 223 M de parámetros; es una opción razonable para despliegues de bajo volumen o entornos sin GPU.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (uso documentado por el autor), `text-generation-inference` (el modelo lleva los tags `text-generation-inference` y `endpoints_compatible`), vLLM y servidores de inferencia compatibles con safetensors. La conversión a GGUF para `llama.cpp` u Ollama es técnicamente posible al ser una arquitectura T5 estándar, pero no hay artefactos publicados por el autor.
- Latencia y throughput: no disponible. Como referencia cualitativa, la búsqueda por haz con 5 haces multiplica aproximadamente por cinco el coste de una decodificación voraz, y el entrenamiento completo de 5 épocas sobre 17.760 ejemplos requirió solo 13,1 minutos en una GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thealper2/t5-base-paradetox-detox` | 222,9 M | 64 tokens de entrada y salida | Seq2seq de detoxificación ajustado sobre ParaDetox | Apache 2.0 | HuggingFace, 0 descargas |
| `google-t5/t5-base` (modelo base) | 222,9 M | 512 tokens (preentrenamiento original; la ficha del ajuste no lo especifica) | Preentrenamiento multi-tarea con span corruption | Apache 2.0 | HuggingFace, ampliamente descargado |
| Referencias humanas de ParaDetox | no aplica | no aplica | Anotación humana | no aplica | Incluidas en el dataset `s-nlp/paradetox` |
| `s-nlp/roberta_toxicity_classifier` | no disponible | no disponible | Clasificación binaria de toxicidad (enfoque alternativo: filtrar en lugar de reescribir) | no disponible | HuggingFace |

Frente al modelo base, el ajuste aporta la tarea concreta de detoxificación, pero restringe la longitud de trabajo a 64 tokens y lo especializa hasta perder las capacidades generales de generación de T5. Frente a las referencias humanas, la brecha es medible: 93,79 % de tasa de detoxificación humana frente a 86,41 % del modelo. Frente a un clasificador de toxicidad como `s-nlp/roberta_toxicity_classifier`, la diferencia es de planteamiento: el clasificador solo detecta, mientras que este modelo reescribe, lo que permite conservar el contenido del mensaje en lugar de descartarlo.

## Limitaciones y advertencias

- Toxicidad residual: el 13,59 % de las salidas sigue siendo clasificada como tóxica, frente al 6,21 % de las referencias humanas. El modelo no garantiza una salida limpia.
- El clasificador de toxicidad empleado es un proxy ruidoso, no verdad absoluta: produce falsos positivos en discurso citado y en insultos reapropiados, y falsos negativos en toxicidad implícita. Las cifras deben interpretarse con ese margen.
- Pérdida o alteración de significado: el percentil 10 de similitud coseno entre entrada y salida es 0,7215 y el 1,01 % de las salidas cae por debajo de 0,5, lo que indica casos de deriva semántica relevante.
- Riesgo de adición de contenido no presente en la entrada. En los ejemplos publicados, la frase «i sware i put music on it i dunno wer it went piece of shit ! !» se convierte en «... it went bad», introduciendo un término valorativo que no estaba en el original.
- Fallos en registro informal o dialectal: el ejemplo «jus becuz i like sex doesn make me ah hoe .» conserva el insulto final, de modo que la detoxificación es incompleta precisamente en los casos con ortografía no estándar.
- Límite duro de 64 tokens de entrada: los textos más largos deben truncarse, lo que puede dejar fuera la parte tóxica del mensaje o el contexto que matiza su significado.
- Monolingüe: solo inglés. No hay evaluación en castellano ni en ningún otro idioma, por lo que no debe asumirse transferencia cero a otros idiomas.
- Dataset de entrenamiento pequeño (17.760 filas) y probablemente sesgado hacia el dominio de redes sociales, origen habitual de los corpus de detoxificación. La generalización a otros dominios (legal, médico, periodístico) no está demostrada.
- Sesgos no evaluados: la model card no incluye análisis de sesgo por género, raza, religión u orientación sexual, ni estudio de cómo el modelo trata insultos dirigidos a grupos protegidos frente a insultos genéricos.
- Sin capa de alineamiento: no hay RLHF, DPO ni filtros de seguridad adicionales. El modelo no es un sistema de moderación completo por sí solo y requiere revisión humana o métricas complementarias en producción.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no existen garantías ni cláusulas de uso responsable por parte del autor. La responsabilidad del despliegue recae en el integrador.
- Riesgo reputacional y de seguridad: desplegarlo de forma automática sobre texto de usuario puede producir reescrituras que alteren el significado de una queja, una cita o una declaración con consecuencias legales. Se recomienda modo sugerencia con confirmación humana, no sustitución automática.
- No es un modelo de propósito general: no sirve para chat, generación de código, matemáticas ni razonamiento abierto. El tag `text-generation` del repositorio es engañoso; la tarea real es `text2text-generation`.
- Advertencia de disponibilidad: el repositorio tiene 0 descargas y 0 likes, sin issues ni validación independiente conocida. Conviene reproducir la evaluación antes de confiar en él en un entorno crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/t5-base-paradetox-detox
- Modelo base: https://huggingface.co/google-t5/t5-base
- Dataset de entrenamiento: https://huggingface.co/datasets/s-nlp/paradetox
- Clasificador de toxicidad usado en la evaluación: https://huggingface.co/s-nlp/roberta_toxicity_classifier
- Modelo de embeddings usado en la evaluación semántica: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre detoxificación con T5 (los resultados obtenidos eran páginas comerciales sin relación). No se han localizado papers, blogs ni demos adicionales asociados a `thealper2/t5-base-paradetox-detox`.
