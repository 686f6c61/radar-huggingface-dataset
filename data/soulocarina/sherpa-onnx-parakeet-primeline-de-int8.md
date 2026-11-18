# soulocarina/sherpa-onnx-parakeet-primeline-de-int8

## Resumen

`soulocarina/sherpa-onnx-parakeet-primeline-de-int8` es una conversión a ONNX con cuantización de 8 bits del modelo de reconocimiento automático de voz (ASR) `primeline/parakeet-primeline`, un ajuste fino en alemán del modelo NVIDIA Parakeet TDT 0.6B v3. El repositorio lo publica el usuario soulocarina para su uso dentro de la aplicación Soul Ocarina, y está empaquetado específicamente para el runtime [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), lo que permite ejecutar transcripción de voz en local sin depender de frameworks de Python pesados.

El modelo resuelve la transcripción de audio a texto en alemán con una arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNN que predice conjuntamente tokens y duraciones, lo que reduce el coste computacional frente a los transductores clásicos. El resultado de la conversión incluye tres grafos ONNX cuantizados (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) más el vocabulario `tokens.txt`, con un tamaño total de repositorio de 0,7 GB.

Su relevancia actual reside en la combinación de un modelo ASR de aproximadamente 600 millones de parámetros con cuantización int8 y un runtime C++ ligero, lo que lo hace desplegable en entornos con recursos limitados (incluidos dispositivos de borde) manteniendo una licencia permisiva CC BY 4.0. No obstante, la información publicada en la model card es mínima: no se detallan métricas de error, composición del dataset de ajuste fino ni condiciones de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), variante de transductor RNN; exportada a ONNX |
| Parámetros totales | no disponible (el modelo base se denomina Parakeet TDT 0.6B v3, lo que sugiere ~600 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; la ventana depende del chunking del runtime) |
| Tipos de cuantización | int8 (encoder, decoder y joiner cuantizados) |
| Idiomas soportados | alemán (`de`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transductor TDT, una evolución del transductor RNN-T en la que el predictor de duración emite, junto a cada token, una duración que indica cuántos frames avanzar. Este diseño reduce el número de pasos de decodificación y, por tanto, el coste de inferencia respecto a RNN-T estándar. El modelo original es NVIDIA Parakeet TDT 0.6B v3; sobre él, primeLine AI realizó un ajuste fino para alemán, y soulocarina lo convirtió a ONNX y lo cuantizó a 8 bits para sherpa-onnx.

No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del dataset de ajuste fino, el uso de aumentación de datos ni de técnicas de destilación o alineación. Tampoco se documenta si el ajuste fino incluyó normalización de texto, puntuación o capitalización. La única innovación técnica verificable en este repositorio es la cadena de exportación: separación en encoder, decoder y joiner, cuantización int8 de cada grafo y empaquetado con el vocabulario para el runtime sherpa-onnx.

## Capacidades

- Reconocimiento automático de voz (ASR) en alemán: transcripción de audio a texto.
- Decodificación en streaming o por lotes según la configuración del runtime sherpa-onnx (no confirmado en la model card).
- Ejecución en local mediante ONNX Runtime, sin necesidad de GPU dedicada.
- Modelo especializado en una única tarea y un único idioma: no genera texto libre, no razona, no traduce ni responde preguntas.
- No soporta tool calling, function calling ni comportamiento de agente.
- No dispone de modo thinking, visión, audio generativo ni capacidades multimodales más allá de la entrada de audio.
- Multilingüismo: únicamente alemán según la etiqueta `language: de`.

## Casos de uso

- Transcripción de reuniones y notas de voz en alemán: el modelo convierte audio grabado en texto para actas o resúmenes posteriores, ejecutándose en local y evitando el envío de audio a servicios en la nube.
- Subtitulado de vídeo y pódcasts en alemán: integrado en una pipeline de sherpa-onnx, permite generar subtítulos con marcas temporales a partir de los segmentos decodificados.
- Asistentes de voz embebidos: al ser un modelo int8 de ~0,7 GB ejecutable con ONNX Runtime, puede desplegarse en dispositivos de borde o en aplicaciones de escritorio con requisitos moderados de memoria.
- Dictado por voz en aplicaciones de productividad: la integración con sherpa-onnx facilita añadir entrada por voz en editores de texto o herramientas internas para usuarios germanohablantes.
- Indexación y búsqueda de archivos de audio: transcripción masiva de grabaciones para hacerlas buscables en un sistema de gestión documental, con procesamiento por lotes.
- Atención al cliente con análisis de llamadas: transcripción de conversaciones telefónicas en alemán para control de calidad, análisis de sentimiento posterior o cumplimiento normativo, siempre que se respete la licencia CC BY 4.0 con atribución.
- Aplicaciones móviles o de escritorio tipo Soul Ocarina: el propio caso de uso declarado por el autor, que emplea esta conversión como motor ASR dentro de su aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de error de palabra (WER), comparativas con el modelo base ni evaluaciones sobre conjuntos de test en alemán.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,7 GB en int8, por lo que la inferencia requiere del orden de 1 GB de memoria, dependiendo del runtime y del tamaño de los buffers de audio.
- GPU recomendadas: no se especifican; al ser un modelo pequeño y cuantizado, una GPU consumer como una RTX 3060 o superior es más que suficiente si se usa ejecución en GPU. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs de gama media y baja.
- Opciones de despliegue: sherpa-onnx (runtime nativo C++/Python con soporte ONNX Runtime), y en general cualquier runtime compatible con ONNX, como ONNX Runtime. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| soulocarina/sherpa-onnx-parakeet-primeline-de-int8 | ~600 M (según nombre del base) | Alemán | ONNX int8 | CC BY 4.0 | Conversión para sherpa-onnx; sin benchmarks publicados |
| primeline/parakeet-primeline | no disponible | Alemán | no disponible | CC BY 4.0 | Modelo base del que deriva esta conversión |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | Multilingüe (según model card de NVIDIA) | no disponible en esta ficha | no disponible en esta ficha | Modelo original de NVIDIA; referencia arquitectónica |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en alemán: no transcribe otros idiomas y no debe usarse como modelo multilingüe.
- No es un modelo generativo: no responde preguntas, no resume ni traduce; solo produce transcripciones.
- No hay métricas publicadas de WER ni evaluación independiente, por lo que se desconoce su precisión real frente al modelo base o a alternativas.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo en precisión completa; no se documenta el impacto.
- Riesgo de errores en audio con ruido, acentos no representados en el ajuste fino, solapamiento de hablantes o vocabulario especializado (técnico, médico, legal), dado que no se detalla la composición del dataset.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia. Conviene verificar también las condiciones del modelo base de NVIDIA y del ajuste fino de primeLine AI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La model card no documenta el proceso de conversión ni los scripts utilizados, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/soulocarina/sherpa-onnx-parakeet-primeline-de-int8
- Modelo base del ajuste fino: https://huggingface.co/primeline/parakeet-primeline
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
