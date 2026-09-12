# xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_SPKCTRL_s42_20260912_143039

## Resumen

AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_SPKCTRL_s42 es un adaptador LoRA (librería PEFT) publicado por el usuario xelsoft-ai-lab sobre el modelo de texto a voz Qwen/Qwen3-TTS-12Hz-0.6B-Base. Su propósito declarado es la síntesis de voz en wolof con control multiacento dentro del proyecto AfriVoxAccent: la model card enumera doce etiquetas de acento (multiaccent:1 a multiaccent:11 y multiaccent:13) y un canal de acento de tipo `token`. El repositorio pesa 0,7 GB y se distribuye en safetensors.

Se trata, por tanto, de un ajuste fino parametralmente eficiente (el nombre sugiere rango r=16) sobre un modelo base de 0,6B de parámetros y 12 Hz, más que de un modelo autónomo: para ejecutarlo hay que cargar primero el modelo base de Qwen y aplicar después el adaptador. No se documentan ni el conjunto de entrenamiento, ni el número de pasos, ni la receta de optimización más allá de la semilla indicada en el nombre (s42).

La relevancia del artefacto es doble. Por un lado, aborda una lengua de bajos recursos (el wolof, hablado principalmente en Senegal, Gambia y Mauritania) con variación de acento explícita, algo poco frecuente en TTS open source. Por otro lado, su estado de publicación es incipiente: cero descargas, cero likes, licencia no declarada, idiomas no declarados en los metadatos y ausencia total de benchmarks, por lo que debe considerarse un artefacto experimental pendiente de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo de texto a voz Qwen/Qwen3-TTS-12Hz-0.6B-Base; rango aparente r=16, inferido del nombre del repositorio |
| Parametros totales | 0,6B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y no se documentan variantes GGUF, INT8 o INT4 |
| Idiomas soportados | Wolof (etiqueta `wolof` del repositorio); no se documentan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); formato de pesos del modelo base no especificado en la información disponible |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base |
| Libreria | peft |
| Tarea declarada | text-to-speech |
| Canal de acento | `token` |
| Etiquetas de acento | multiaccent:1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 y 13 (doce en total; no aparece multiaccent:12) |
| Control de hablante | SPKCTRL, según la nomenclatura del repositorio |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre Qwen3-TTS-12Hz-0.6B-Base, un modelo de síntesis de voz de la familia Qwen3-TTS con aproximadamente 0,6B de parámetros y una tasa de 12 Hz asociada al códec o a la frecuencia de trama de los tokens de audio (la información disponible no precisa a qué componente corresponde exactamente ese valor). No se describe la arquitectura interna del modelo base (número de capas, dimensiones, tipo de códec o tokenizador de audio) ni el mecanismo exacto por el que la etiqueta de acento se inyecta en la generación: la model card solo indica que el canal de acento es `token`.

Del nombre del repositorio se pueden inferir algunos hiperparámetros, siempre como interpretación de la nomenclatura y no como dato confirmado: `lora-r16` apuntaría a un rango 16, `SPKCTRL` a un módulo de control de hablante y `s42` a una semilla 42. No hay información sobre el corpus de entrenamiento (horas de audio, hablantes, procedencia, si hubo transcripción fonética), sobre el régimen de optimización (épocas, tasa de aprendizaje, precisión) ni sobre técnicas posteriores al entrenamiento como RLHF, DPO o ajuste por preferencia humana. Tampoco se documenta si el adaptador se entrenó solo sobre módulos de atención, sobre proyecciones de hablante o sobre ambos.

Un dato que conviene señalar: un adaptador LoRA de rango 16 sobre un modelo de 0,6B suele ocupar decenas de megabytes, mientras que el repositorio declara 0,7 GB. No se explica en la información disponible qué contiene ese volumen adicional (posibles artefactos de entrenamiento, pesos fusionados u otros ficheros); conviene inspeccionar el árbol de ficheros antes de integrarlo en producción.

## Capacidades

- Síntesis de voz (text-to-speech) en wolof a partir de texto de entrada, heredando las capacidades base de Qwen3-TTS-12Hz-0.6B-Base.
- Control multiacento mediante etiquetas discretas: doce identificadores de acento (multiaccent:1 a multiaccent:11 y multiaccent:13) seleccionables por el usuario.
- Canal de acento de tipo `token`, es decir, la variación de acento se condiciona a nivel de tokens en lugar de mediante un vector de estilo externo.
- Control de hablante mediante el mecanismo etiquetado como SPKCTRL en el nombre del repositorio; no se documentan los identificadores de hablante disponibles ni si existe clonación de voz zero-shot.
- Capacidad multilingüe no acreditada: la única lengua declarada es el wolof. No hay evidencia de que el adaptador conserve el multilingüismo del modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada (ASR) ni modo de razonamiento explícito; se trata de un modelo generativo de audio, no de un modelo de lenguaje conversacional.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en el ámbito wolófono: conversión de textos escritos (prensa, documentos administrativos, materiales escolares) a audio con una de las doce variantes de acento, de modo que el oyente reciba una voz próxima a su variedad lingüística.
- Servicios de atención telefónica automatizada en Senegal, Gambia o Mauritania: el adaptador permite generar mensajes de voz e IVR en wolof con acento controlado, evitando la sensación de voz foránea que producen los TTS entrenados solo en lenguas mayoritarias.
- Producción de audiolibros y material educativo: al ser un modelo de 0,6B más un LoRA, la síntesis puede ejecutarse en una sola GPU de gama media, lo que abarata la generación de horas de audio para programas de alfabetización en wolof.
- Investigación lingüística y dialectología: las doce etiquetas de acento permiten generar el mismo contenido en distintas variedades y usarlas como estímuloscontrolados en estudios de percepción o como material de comparación entre dialectos.
- Generación de datos sintéticos para entrenar sistemas ASR en wolof: el TTS puede producir pares audio-texto con acento variado para aumentar corpus de reconocimiento de voz escasos en esta lengua.
- Localización de contenido para radio comunitaria y pódcast: doblaje o sustitución de voces en piezas ya escritas, eligiendo la etiqueta de acento que corresponda a la audiencia objetivo.
- Integración en asistentes de voz embebidos o de baja latencia: al partir de un modelo de 0,6B, es viable desplegarlo en estaciones de trabajo con GPU de consumo o incluso en CPU para aplicaciones sin requisitos de tiempo real estricto.
- Pruebas A/B de percepción de acento en interfaces conversacionales: comparar la aceptación de distintas variedades antes de fijar la voz definitiva de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER de inteligibilidad, similitud de hablante, error de prosodia) ni comparaciones con otros sistemas TTS para wolof. Tampoco se han recuperado resultados de benchmarks a través de la búsqueda web: las consultas realizadas devolvieron únicamente documentación de la función QUERY de Google Sheets y hilos de foro sin relación con el modelo.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del recuento de parámetros del modelo base (0,6B) y no proceden de mediciones publicadas por el autor.

- Pesos en fp16/bf16: aproximadamente 1,2 GB solo para los pesos del modelo base, más el adaptador y el códec de audio; en la práctica, entre 2 y 3 GB de VRAM para inferencia con margen.
- Pesos en int8: del orden de 0,6-0,7 GB, con un total estimado de 1,5-2 GB de VRAM.
- Pesos en int4: del orden de 0,35-0,4 GB, con un total estimado por debajo de 1,5 GB de VRAM.
- GPU de consumo: sí cabe con holgura en cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070, RTX 4090); también es plausible la inferencia en CPU, con latencia mayor.
- GPU de centro de datos: no se requieren A100 ni H100 para un modelo de este tamaño; su uso solo tendría sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: la vía documentada es la librería `peft` junto con `transformers` sobre el modelo base de Qwen. El soporte en vLLM, TGI, Ollama o llama.cpp no está verificado en la información disponible, y dependerá de que esos runtimes implementen el pipeline de audio de Qwen3-TTS.
- Latencia y throughput: no disponibles. No se han publicado medidas de tiempo real (RTF), latencia de primera trama ni número de peticiones por segundo.

## Comparativa con modelos similares

Los datos de rendimiento no están disponibles para ninguna de las alternativas en el contexto de esta ficha; la comparación es, por tanto, estructural. Las cifras de los sistemas alternativos proceden del conocimiento general de esos proyectos y deberían verificarse en su documentación oficial antes de citarlas.

| Modelo | Parametros | Contexto / soporte | Idioma wolof | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriVoxAccent_QW3_spk_acc_12hz_lora-r16 (este modelo) | 0,6B base + LoRA r16 | no disponible | Sí, con 12 etiquetas de acento declaradas | no disponible | Adaptador PEFT en HuggingFace; 0 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | No declarado específicamente | Según el repositorio de Qwen (verificar) | Modelo base público en HuggingFace |
| Coqui XTTS-v2 | ~0,47B | Multilingüe (17 idiomas declarados) | No incluido entre los idiomas oficiales | CPML (uso comercial restringido; verificar) | Pesos públicos, proyecto Coqui discontinuado |
| Meta MMS-TTS (familia VITS) | ~36M por idioma | Un modelo por idioma, entrenamiento no supervisado | Existe cobertura de lenguas de bajos recursos; verificar el modelo concreto de wolof | CC-BY-NC 4.0 en la familia MMS (verificar) | Pesos públicos por idioma |

Frente a XTTS-v2, la ventaja de este adaptador es la cobertura declarada del wolof y el control explícito de acento; su desventaja es la ausencia de métricas, de licencia y de comunidad. Frente a MMS-TTS, la ventaja es un único modelo con doce variedades de acento en lugar de un modelo monolítico por idioma; la desventaja es el mayor tamaño (0,6B frente a decenas de millones de parámetros) y la falta de validación publicada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial ni condiciones de redistribución. Adoptar este modelo en un producto requiere contactar con el autor o asumir el riesgo legal.
- Ausencia total de benchmarks: no hay métricas de calidad de síntesis, inteligibilidad, naturalidad ni similitud de hablante. Cualquier afirmación de calidad sería especulativa.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay informes de terceros que confirmen que el adaptador funciona como se describe.
- Etiquetas de acento opacas: los identificadores multiaccent:1 a multiaccent:13 no van acompañados de descripción lingüística (localidad, grupo dialectal, hablantes de referencia). No se puede saber qué variedad activa cada etiqueta sin pruebas.
- Hueco en la numeración: la lista de acentos omite multiaccent:12; se desconoce si se trata de una variedad no entrenada, de un error de la model card o de una reserva deliberada.
- Riesgo de alucinación acústica y artefactos: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, ruidos, cortes o voces inestables, especialmente en palabras poco representadas en el corpus de entrenamiento.
- Sesgo de datos desconocido: al no documentarse el corpus, no se puede evaluar el equilibrio de género, edad, registro o procedencia geográfica de los hablantes, ni el sesgo derivado de una posible sobrerrepresentación de una variedad.
- Cobertura lingüística no acreditada: solo se declara el wolof; se desconoce si el adaptador degrada las capacidades multilingües del modelo base o si admite code-switching con francés o árabe, frecuente en el contexto senegalés.
- Longitud de contexto desconocida: no se indica cuántos caracteres o tokens de texto admite por generación, lo que dificulta planificar la segmentación de textos largos.
- Dependencia del modelo base: el adaptador no es autónomo; su comportamiento queda ligado a la versión concreta de Qwen/Qwen3-TTS-12Hz-0.6B-Base y a los cambios que Qwen introduzca en él.
- Volumen del repositorio no explicado (0,7 GB para un LoRA r16): conviene auditar el contenido antes de desplegarlo, tanto por higiene de cadena de suministro como para entender qué se está cargando.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-09-12): verificar la vigencia y el estado del repositorio antes de citarlo.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_SPKCTRL_s42_20260912_143039
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Librería PEFT: https://github.com/huggingface/peft
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados obtenidos corresponden a la documentación de la función QUERY de Google Sheets y a hilos de foro sobre traducción, sin relación con el modelo). No se dispone de paper, blog técnico, repositorio de código ni demo asociados al adaptador.
