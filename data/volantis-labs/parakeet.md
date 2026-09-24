# volantis-labs/parakeet

## Resumen

Parakeet TDT 110M (ONNX) es una redistribución en formato ONNX del modelo de reconocimiento automático de voz (ASR) NVIDIA Parakeet TDT 110M, publicada por el usuario volantis-labs en Hugging Face. El modelo original procede de NVIDIA (con crédito también a Suno, bajo la denominación Parakeet TDT-CTC 110M) y la conversión a ONNX la realizó csukuangfj, del proyecto k2-fsa. La model card indica explícitamente que la redistribución se hace sin cambios y bajo licencia CC BY 4.0.

El problema que resuelve es la transcripción de voz en inglés sin depender de PyTorch ni de NeMo en tiempo de inferencia: el modelo se entrega como tres grafos ONNX independientes (encoder, decoder y joiner), lo que permite ejecutarlo con ONNX Runtime en CPU o GPU y encajarlo en pipelines de decodificación tipo transductor (por ejemplo, sherpa-onnx). Con unos 110 millones de parámetros y un encoder de 456 MB, está en la franja de modelos ligeros aptos para despliegue en edge o en servidores modestos.

Su relevancia actual es doble: por un lado, ofrece una alternativa compacta y de licencia permisiva frente a modelos ASR más grandes; por otro, sirve como ejemplo de exportación ONNX de la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA, que reduce los pasos de decodificación respecto a un RNN-T clásico. La ficha del repositorio, sin embargo, es mínima: no incluye métricas de error, ni descripción del dataset de entrenamiento, ni tarjeta de datos, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer): encoder + decoder (predictor) + joiner, exportados como tres grafos ONNX separados |
| Parametros totales | 110 M (según la denominación "Parakeet TDT 110M" de la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica ventana de audio ni límite de duración por segmento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX; no se indica la precisión de exportación ni se ofrecen variantes int8) |
| Idiomas soportados | inglés (la model card indica "English speech recognition") |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) más `tokens.txt` |
| Tamaño del encoder | 456.050.698 bytes (≈435 MiB) |
| Tamaño del decoder | 15.753.086 bytes (≈15,0 MiB) |
| Tamaño del joiner | 5.596.854 bytes (≈5,3 MiB) |
| Tamaño del vocabulario | `tokens.txt` de 9.953 bytes |
| Tamaño del repositorio | 0,5 GB |
| Autor de la conversión | csukuangfj / k2-fsa (según la model card) |
| Autoría del modelo original | NVIDIA y Suno |
| Fecha de creación del repositorio | 2026-09-24 (según metadatos de Hugging Face) |
| Última actualización | 2026-09-24 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de transductor TDT, una variante del RNN-T en la que el modelo predice conjuntamente el token de salida y su duración, en lugar de emitir un único símbolo por paso. Esto reduce el número de pasos de decodificación necesarios para cubrir una secuencia de audio y, en la práctica, acelera la inferencia en comparación con un transductor clásico. La exportación separa los tres componentes habituales: el encoder, que consume las características acústicas; el decoder o predictor, que modela el historial de tokens; y el joiner, que combina ambas representaciones para producir la distribución sobre tokens y duraciones. El reparto de tamaños observado (≈435 MiB de encoder frente a ≈15 MiB de decoder y ≈5,3 MiB de joiner) es coherente con esa estructura, donde el encoder concentra la mayor parte de los parámetros.

No hay información en la model card sobre el número de tokens de audio utilizados, la composición del dataset de entrenamiento, el idioma de los datos más allá del inglés, ni sobre procesos de ajuste fino con RLHF o DPO (técnicas que, en cualquier caso, no son habituales en ASR). Tampoco se documenta si el modelo usa un encoder tipo Conformer o FastConformer ni las técnicas concretas de regularización aplicadas; estos detalles pertenecen al modelo original de NVIDIA y no se reproducen en este repositorio. Se trata de una redistribución sin modificaciones, por lo que cualquier innovación técnica procede del trabajo original y no de esta publicación.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio, mediante decodificación por transductor con los tres grafos ONNX.
- Modelado conjunto de token y duración (TDT), lo que permite emitir varios tokens por fotograma y reducir el número de pasos de decodificación.
- Ejecución sin PyTorch ni NeMo: los artefactos son ONNX puros y se pueden cargar con ONNX Runtime.
- Integración en pipelines de decodificación compatibles con modelos k2-fsa/sherpa-onnx, dado el origen de la conversión.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje y no genera texto libre más allá de la transcripción.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: la model card solo declara reconocimiento de voz en inglés.
- No incluye visión, comprensión de audio más allá del ASR, ni modo de razonamiento explícito.
- No se documenta soporte de marcas de puntuación, mayúsculas, diarización de hablantes ni marcas de tiempo a nivel de palabra.

## Casos de uso

- Transcripción de reuniones y llamadas: el modelo convierte el audio en texto para generar actas o resúmenes posteriores, con la ventaja de que los pesos ONNX se pueden servir sin dependencias de NeMo ni PyTorch en el contenedor de producción.
- Subtitulado automático de vídeo: se puede encadenar la decodificación por segmentos de audio y volcar el texto a un formato de subtítulos; al ser un modelo de 110 M, el coste por minuto de audio es bajo frente a alternativas de mayor tamaño.
- Dictado y notas de voz: integrado en una aplicación de escritorio o móvil mediante ONNX Runtime, permite transcribir grabaciones en local sin enviar audio a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad.
- Analítica de centros de contacto: transcripción masiva de grabaciones para alimentar clasificadores de motivos de llamada, análisis de sentimiento o control de calidad; el reducido tamaño del encoder facilita el procesamiento por lotes en GPU modestas.
- Indexación y búsqueda de contenido audiovisual: convertir la pista de audio de un archivo de vídeo o podcast a texto indexable, de modo que el contenido sea recuperable por búsqueda textual.
- Accesibilidad en tiempo real: generación de subtítulos en vivo para personas con discapacidad auditiva, desplegando el modelo en el propio dispositivo o en un nodo cercano al usuario.
- Preprocesado para pipelines de NLP: la transcripción sirve como entrada a etapas posteriores (resumen, extracción de entidades, traducción) que sí pueden emplear modelos de lenguaje.
- Asistentes de voz embebidos: como etapa de reconocimiento en un asistente local, combinado con un módulo de intención o con un modelo de lenguaje pequeño para la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar los ficheros y sus sumas SHA-256, sin tasas de error de palabra (WER) sobre LibriSpeech, Common Voice, Earnings-22 ni ningún otro conjunto de evaluación, y sin comparaciones con otros modelos.

## Requisitos de hardware

- Espacio en disco: aproximadamente 476 MiB de pesos (435 MiB de encoder, 15,0 MiB de decoder y 5,3 MiB de joiner), más el fichero `tokens.txt`; el repositorio completo ocupa 0,5 GB.
- VRAM estimada para inferencia: por debajo de 2 GB partiendo del tamaño de los pesos (estimación orientativa, no confirmada por el autor; depende de la precisión de exportación y del tamaño del lote y del segmento de audio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, así como A100 o H100 si se busca procesamiento por lotes a gran escala.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual y también en iGPU o CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), sherpa-onnx del proyecto k2-fsa, o el modelo original en NeMo si se prefiere el ecosistema de NVIDIA; también es posible envolverlo en servicios propios.
- Latencia y throughput: no disponibles; no se han publicado mediciones de factor de tiempo real ni de tokens por segundo.
- Cuantización: no se ofrecen variantes int8 ni fp16 en el repositorio, por lo que una reducción adicional de memoria requeriría cuantizar los grafos ONNX por cuenta del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Cobertura de idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| volantis-labs/parakeet (Parakeet TDT 110M ONNX) | 110 M | inglés | CC BY 4.0 | ONNX | Redistribución sin cambios; sin métricas publicadas en el repositorio |
| NVIDIA Parakeet TDT-CTC 110M (original) | 110 M | inglés | según la licencia del repositorio original (no indicada aquí) | NeMo / PyTorch | Mismo modelo de partida; esta publicación es su exportación ONNX |
| OpenAI Whisper (variantes tiny/base/small) | 39 M a 244 M | multilingüe (según variante) | MIT | PyTorch, ONNX, GGUF y otros | Familia ampliamente desplegada; el modelo aquí descrito solo cubre inglés |
| OpenAI Whisper large-v3 | 1.550 M | multilingüe | MIT | PyTorch y derivados | Mayor coste de inferencia; no comparable en huella de memoria |
| Distil-Whisper (variantes destiladas) | ≈756 M en las versiones large | inglés | MIT | PyTorch y derivados | Alternativa destilada de Whisper; sin datos de WER comparables en esta ficha |

La comparación es estructural (parámetros, licencia, formatos y cobertura de idiomas), no de precisión: no se dispone de resultados de WER de este repositorio ni de evaluaciones equivalentes publicadas en la información consultada.

## Limitaciones y advertencias

- Cobertura monolingüe: la model card declara únicamente reconocimiento de voz en inglés; su uso con otros idiomas no está soportado ni documentado.
- Ausencia de métricas: no hay WER ni ninguna otra medida de precisión publicada en el repositorio, por lo que no es posible estimar su calidad frente a alternativas sin evaluarlo uno mismo.
- Sesgos: no se documenta nada sobre la composición demográfica, los acentos o las condiciones acústicas de los datos de entrenamiento, por lo que se desconoce el comportamiento diferencial entre variedades del inglés, hablantes no nativos o audio con ruido.
- Riesgo de errores de transcripción: como cualquier sistema ASR, puede producir sustituciones en nombres propios, siglas, cifras, términos técnicos y en audio con solapamiento de voces; no incorpora diarización de hablantes.
- Puntuación y mayúsculas: no se confirma en la información disponible si el modelo las genera; conviene verificarlo antes de usarlo para subtítulos o documentos finales.
- Formato y precisión: al publicarse solo grafos ONNX sin especificar la precisión, el consumo de memoria y la latencia reales pueden variar según cómo se carguen y qué optimizaciones aplique el runtime.
- Licencia: CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA, Suno y a los autores de la conversión (csukuangfj / k2-fsa), además de indicar si se han realizado modificaciones; el repositorio declara redistribución sin cambios.
- Mantenimiento y adopción: el repositorio registra 0 descargas y 0 likes, no incluye model card extensa ni tests, y sus metadatos muestran una fecha de creación de 2026-09-24, posterior a la fecha habitual de publicación, lo que sugiere una inconsistencia o un artefacto en los metadatos.
- Sin garantías del redistribuidor: al tratarse de una copia, la responsabilidad sobre el comportamiento del modelo recae en el trabajo original de NVIDIA, no en volantis-labs.

## Enlaces

- Hugging Face: https://huggingface.co/volantis-labs/parakeet
- Modelo original citado en la model card: NVIDIA Parakeet TDT-CTC 110M (crédito a NVIDIA y Suno); no se incluye URL en la información proporcionada.
- Conversión a ONNX: atribuida a csukuangfj / k2-fsa; no se incluye URL en la información proporcionada.
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a contenido no relacionado (páginas de un cómic web) y se descartan.
