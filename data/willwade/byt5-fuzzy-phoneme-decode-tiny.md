# willwade/byt5-fuzzy-phoneme-decode-tiny

## Resumen

byt5-fuzzy-phoneme-decode-tiny es un modelo ByT5 de 17,9 millones de parámetros desarrollado por willwade dentro del proyecto [voicegarden-lexicons](https://github.com/AACTools/voicegarden-lexicons), orientado a la decodificación fonológica. Su tarea es convertir secuencias de fonemas superficiales (la forma en que las produce un hablante con un trastorno fonológico o un oyente que malinterpreta) en su forma canónica, invirtiendo procesos como la elisión de sílabas débiles, la reducción de grupos consonánticos, la asimilación, el stopping, el fronting o los errores de sonoridad.

El modelo resuelve un problema concreto en el ámbito de la logopedia y la comunicación aumentativa y alternativa (AAC): los mapeos grafema-a-fonema (P2G) convencionales amplifican el error, ya que transforman una entrada degradada en una salida igualmente degradada. En lugar de limitarse a transcribir fonemas, este modelo aprende a reconstruir la intención original del hablante, lo que lo hace útil como generador de candidatos k-best en sistemas de entrada por voz para personas con trastornos del habla.

Se distribuye con licencia Apache 2.0, soporta seis idiomas (alemán, inglés, francés, italiano, neerlandés y español) y está entrenado sobre 1,67 millones de pares sintéticos (superficie → canónico) generados aplicando un corruptor fonológico calibrado sobre el corpus voicegarden-lexicons. Es el primer decodificador entrenable del proyecto y se publica junto con pesos en formato Hugging Face, ONNX fp32 y ONNX int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder transformer byte-level, basado en T5) |
| Parametros totales | 17.934.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX), int8 dinámico QInt8 (ONNX) |
| Idiomas soportados | multilingual, en, de, fr, it, nl, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Hugging Face), ONNX fp32, ONNX int8 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ByT5, una variante de T5 que opera directamente sobre bytes en lugar de tokens subword. Esta elección es coherente con el dominio: las secuencias de fonemas (símbolos AFI) no se segmentan bien con tokenizadores subword convencionales, y el enfoque byte-level evita problemas de vocabulario fuera de distribución. Con 17,9 millones de parámetros, es un modelo deliberadamente pequeño, pensado para inferencia rápida y despliegue ligero en entornos AAC.

El entrenamiento se realizó sobre 1,67 millones de pares (superficie → canónico) generados de forma sintética: se aplicó un corruptor de procesos fonológicos calibrado con frecuencias de PhonBank (usado solo para calibración, sin datos de PhonBank en el entrenamiento) sobre el corpus voicegarden-lexicons, compuesto por fuentes con licencias CC BY-SA, BSD y MIT. El corruptor modela procesos como elisión de sílabas débiles, elisión de consonante final, reducción de grupos, asimilación, stopping, fronting y errores de sonoridad. Se intentó un fine-tuning con speechocean762, pero no está incluido en estos pesos: la extracción conservó fonemas canónicos en ambas columnas, y la extracción de fonemas realmente producidos queda como trabajo futuro. No se documenta en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Reparación de secuencias de fonemas corruptas: mapea fonología superficial a fonología canónica invirtiendo procesos fonológicos sistemáticos.
- Generación de candidatos k-best: la salida está pensada como lista de candidatos para métodos de entrada AAC, no como transcripción definitiva.
- Soporte multilingüe en seis idiomas: alemán, inglés, francés, italiano, neerlandés y español, con etiquetas de idioma en la entrada (por ejemplo, `<deu>:`).
- Manejo de errores fonológicos de distinto tipo: elisión, reducción de grupos, asimilación, stopping, fronting y sonoridad.
- Robustez ante cualquier severidad de corrupción: mantiene aproximadamente un 49 % de recuperación exacta independientemente del grado de degradación.
- Inferencia ligera: pesos de ~70 MB en formato Hugging Face y versiones ONNX fp32 e int8 para despliegue.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Comunicación aumentativa y alternativa (AAC): el modelo actúa como capa de decodificación entre la producción fonológica degradada del usuario y la palabra canónica, generando candidatos k-best que la interfaz presenta para selección. Su tamaño reducido permite ejecución local en dispositivos de asistencia.
- Investigación en trastornos fonológicos: permite simular y analizar la inversión de procesos fonológicos concretos (por ejemplo, reparación de ensordecimiento final en alemán) para estudiar patrones de error y su corrección.
- Preprocesado en pipelines de reconocimiento de habla patológica: se puede insertar tras un reconocedor fonético para normalizar secuencias antes de la transcripción ortográfica, reduciendo la propagación de errores.
- Herramientas de logopedia asistida: generación de ejercicios y validación de producciones infantiles comparando la forma superficial con la canónica recuperada.
- Normalización de transcripciones fonéticas en corpus lingüísticos: limpieza de anotaciones con errores sistemáticos de transcripción o percepción.
- Prototipado rápido de sistemas multilingües de decodificación fonológica: al cubrir seis idiomas y disponer de ONNX int8, permite desplegar una base funcional en entornos con recursos limitados antes de entrenar modelos específicos.
- Investigación en decodificación fuzzy: sirve como primer decodificador entrenable de referencia del proyecto voicegarden-lexicons para comparar futuras iteraciones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test gold solo con corrupción (n=4000):

| Artefacto | Exact match (micro) | Exact match (macro) | Phone TER |
|---|---|---|---|
| fp32 `onnx/` | 49,2 % | 50,7 % | 0,06–0,12 por idioma |
| int8 `onnx-int8/` | 49,1 % | 50,7 % | igual |

La recuperación exacta se mantiene en torno al 49 % con cualquier severidad de corrupción, y los fallos son casi-aciertos (típicamente un fonema de diferencia). El top-1 exacto aumenta notablemente en severidades bajas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos del modelo (~70 MB); la versión ONNX int8 es aproximadamente 4 veces más pequeña.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4090, etc.). También es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer actual e incluso en dispositivos de gama baja.
- Opciones de despliegue: ONNX Runtime (fp32 e int8), Hugging Face Transformers con los pesos safetensors, y exportación a otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño (17,9 M de parámetros) se espera latencia de milisegundos en hardware moderno, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byt5-fuzzy-phoneme-decode-tiny | 17,9 M | no disponible | Decodificación fonológica fuzzy | Apache 2.0 | Hugging Face, ONNX |
| ByT5 base (Google) | ~300 M | 512 bytes (por defecto) | Texto byte-level genérico | Apache 2.0 | Hugging Face |
| ByT5 small (Google) | ~300 M (variante small) | 512 bytes (por defecto) | Texto byte-level genérico | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos directamente comparables en la tarea específica de decodificación fonológica fuzzy; la comparativa con ByT5 estándar es únicamente arquitectónica y de tamaño, no de rendimiento en esta tarea.

## Limitaciones y advertencias

- La recuperación exacta es de aproximadamente el 49 %, por lo que el modelo no debe usarse como transcripción directa; está diseñado para generar candidatos k-best.
- Los fallos suelen ser casi-aciertos (un fonema de diferencia), lo que puede producir palabras plausibles pero incorrectas si no se valida la salida.
- El entrenamiento se basa en pares sintéticos generados por un corruptor calibrado, no en producciones reales de hablantes con trastornos; el fine-tuning con speechocean762 no está incluido en estos pesos.
- Puede presentar sesgos derivados de la distribución del corpus voicegarden-lexicons y de las frecuencias de calibración de PhonBank, que no necesariamente reflejan todos los perfiles clínicos.
- La cobertura lingüística se limita a seis idiomas (de, en, fr, it, nl, es); no se documenta comportamiento en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que limita la planificación de despliegue con secuencias largas.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de datos subyacentes tienen licencias CC BY-SA, BSD y MIT; conviene revisar las obligaciones de atribución y share-alike de las fuentes originales si se redistribuyen datos derivados.
- El modelo está pensado para asistencia y apoyo, no para diagnóstico clínico; cualquier uso en contextos sanitarios debe validarse con profesionales.

## Enlaces

- [Hugging Face: willwade/byt5-fuzzy-phoneme-decode-tiny](https://huggingface.co/willwade/byt5-fuzzy-phoneme-decode-tiny)
- [Proyecto voicegarden-lexicons (GitHub)](https://github.com/AACTools/voicegarden-lexicons)
