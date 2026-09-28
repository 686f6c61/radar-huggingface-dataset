# vb223/whisper-base-en-phoneme-ctc

## Resumen

whisper-base-en-phoneme-ctc es un modelo de evaluación automática de pronunciación para inglés, publicado por el usuario vb223. Está construido sobre el encoder de openai/whisper-base.en, al que se añade una cabeza CTC de fonemas que fuerza el alineamiento entre el audio y la secuencia de fonemas que el hablante pretendía pronunciar; después, un regresor de gradient boosting convierte las características GOP (Goodness of Pronunciation) de cada fonema en una puntuación de 0 a 2 (2 = correcto, 1 = acento marcado, 0 = incorrecto o ausente).

El checkpoint contiene 23.828.567 parámetros y el repositorio ocupa 0,1 GB. Los pesos neuronales se distribuyen en safetensors y el regresor en joblib. Acepta audio mono a 16 kHz de hasta 30 segundos y trabaja con fonemas en ARPAbet tal como aparecen en speechocean762, donde las vocales llevan dígito de acento (por ejemplo, "we" se representa como W IY0).

Su interés es práctico: cubre el nicho de la evaluación de pronunciación asistida por ordenador (CAPT) con un modelo lo bastante pequeño para ejecutarse en CPU, y aporta una métrica medible: PCC de 0,606 a nivel de fonema sobre los 47.369 fonemas del split de test de speechocean762. No es un modelo generativo ni un sistema ASR general, sino una herramienta de puntuación fonética.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer de Whisper base.en + cabeza CTC de fonemas + regresor de gradient boosting (GBDT) |
| Parámetros totales | 23.828.567 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por entrada; no se especifica ventana en tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder y cabeza CTC) y joblib (regresor GBDT) |

## Arquitectura y entrenamiento

La pipeline tiene dos etapas. La primera es neuronal: un encoder de Whisper base.en ajustado (fine-tuning) que produce representaciones acústicas, sobre las que se aplica una cabeza CTC que alinea la señal con la secuencia de fonemas objetivo. El resultado de esa alineación forzada se resume en características GOP por fonema, que incluyen la probabilidad del fonema esperado frente a alternativas y su comportamiento temporal.

La segunda etapa es un regresor de gradient boosting entrenado sobre esas características, que devuelve la puntuación final 0/1/2 junto con los tiempos de inicio y fin de cada fonema en segundos. El entrenamiento y la evaluación se realizan con el corpus speechocean762 (Zhang et al., Interspeech 2021), de inglés no nativo con anotaciones a nivel de fonema y puntuaciones humanas. La model card no detalla el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no procede en este tipo de modelo). La innovación destacable es la separación entre un componente neuronal ligero (encoder + CTC) y un regresor clásico serializado, lo que mantiene el modelo por debajo de 24 millones de parámetros.

## Capacidades

- Puntuación de pronunciación a nivel de fonema con escala discreta de 0 a 2.
- Alineamiento forzado audio-fonema mediante CTC, con marcas temporales de inicio y fin por fonema (en segundos).
- Extracción de características GOP por fonema a partir del alineamiento.
- Manejo del vocabulario de fonemas ARPAbet de speechocean762, con dígito de acento en las vocales; el vocabulario completo aparece en config.json.
- Entrada: audio mono a 16 kHz (hasta 30 segundos) más la secuencia de fonemas esperada.
- Salida: una lista de diccionarios con las claves "phone", "score", "start" y "end".
- Interfaz de uso: load() y score_utterance() en modeling_whisper_phoneme.py.
- No realiza generación de texto, traducción, resumen ni ASR general.
- No soporta tool calling, function calling ni flujos de agente.
- Solo inglés; no hay capacidades multilingües declaradas.

## Casos de uso

- Aplicaciones de aprendizaje de inglés: el modelo devuelve una puntuación por fonema y su marca temporal, de modo que la app puede resaltar en la interfaz exactamente qué sonido ha fallado y en qué instante del audio, en lugar de dar una nota global.
- Evaluación automática de exámenes orales: para pruebas de lectura en voz alta con texto conocido, la secuencia de fonemas de referencia se deriva del propio enunciado, y el modelo puntúa cada fonema sin necesidad de un evaluador humano.
- Logopedia y terapia del habla: seguimiento cuantitativo de la evolución de un paciente fonema a fonema a lo largo de sesiones, comparando las puntuaciones GOP de grabaciones sucesivas.
- Investigación en CAPT: al ser un modelo pequeño con código de reproducción (modeling_whisper_phoneme.py puntúa todo el split de test y calcula el PCC agrupado), sirve como línea base reproducible para comparar nuevas propuestas de scoring.
- Integración en plataformas LMS: el requisito de hardware es mínimo (24-48 MB de pesos), por lo que puede desplegarse en el mismo servidor de la plataforma o incluso en el dispositivo del alumno para corregir ejercicios de pronunciación sin enviar audio a terceros.
- Detección de errores fonéticos específicos: con la secuencia de referencia y el score por fonema se pueden construir informes de confusión (por ejemplo, qué fonemas se sustituyen sistemáticamente) para hablantes de una misma lengua materna.
- Formación corporativa en comunicación oral: análisis a nivel de fonema de presentaciones o simulaciones de llamadas, para generar informes de acento y claridad limitados al inglés.
- Generación de datos etiquetados: uso del modelo para anotar automáticamente corpus de audio con puntuaciones fonéticas, siempre que se disponga de la transcripción fonémica de referencia.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado | Detalle |
|---|---|---|---|
| speechocean762, split de test | PCC (Pearson) a nivel de fonema | 0,606 | 47.369 fonemas evaluados |
| speechocean762, split de test | PCC agrupado (pooled) | 0,606 (mismo valor, calculado por el script de reproducción) | Se obtiene ejecutando modeling_whisper_phoneme.py |

No se han publicado en la información disponible resultados por subconjunto (por ejemplo, desglose por fonema, por hablante o por nivel de competencia), ni comparaciones con otros sistemas sobre el mismo split.

## Requisitos de hardware

- Tamaño de pesos: 23,8 millones de parámetros equivalen aproximadamente a 48 MB en fp32 y 24 MB en fp16; el repositorio completo ocupa 0,1 GB.
- VRAM estimada: menos de 1 GB; el modelo cabe holgadamente en cualquier GPU con 1 GB o más.
- GPU recomendadas: ninguna en particular; A100, H100 o RTX 4090 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, y también en CPU (portátiles, servidores sin GPU e incluso dispositivos de gama baja).
- Opciones de despliegue: el autor proporciona modeling_whisper_phoneme.py con las funciones load() y score_utterance(), y un requirements.txt; el regresor se carga con joblib. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en la práctica no aplican al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Contexto | Resultado publicado |
|---|---|---|---|---|---|---|
| vb223/whisper-base-en-phoneme-ctc | Scoring de pronunciación con CTC + GBDT | 23,8 M | en | MIT | 30 s de audio | PCC 0,606 a nivel de fonema en speechocean762 |
| Peacockery/hubert-base-phoneme-en | Reconocimiento de fonemas (CTC) | 94,4 M | no disponible (previsiblemente en) | no disponible | no disponible | no disponible |
| lyonlu13/wav2vec2-large-zh-singing-phoneme-ctc | Reconocimiento de fonemas (CTC) | 0,3 B | no disponible (previsiblemente zh) | no disponible | no disponible | no disponible |
| WhisperX (m-bain/whisperX) | Alineamiento forzado con wav2vec2 + CTC | no disponible | en, fr, de, es, it y otros | no disponible en la información consultada | no disponible | no disponible |

Los tres alternativos son modelos de reconocimiento o alineamiento de fonemas, no de puntuación de pronunciación, por lo que la comparación directa de métricas no es posible con los datos disponibles. No se han encontrado en la información consultada otros modelos de GOP con resultados publicados sobre speechocean762.

## Limitaciones y advertencias

- Cobertura de idioma limitada al inglés: no procesa otros idiomas ni variantes no contempladas en speechocean762.
- Requiere la secuencia de fonemas de referencia; no puede evaluar pronunciación sin saber qué debía decir el hablante.
- Límite de 30 segundos por utterance y audio mono a 16 kHz, restricciones heredadas de Whisper.
- La model card marca "inference: false": no hay endpoint de inferencia alojado en Hugging Face.
- Adopción nula en el momento de los datos (0 descargas, 0 likes), sin validación independiente por terceros.
- Un PCC de 0,606 es moderado; no se publican métricas por fonema, por hablante ni por nivel de competencia, por lo que el error puede concentrarse en determinados sonidos.
- No se documentan sesgos por lengua materna (L1) de los hablantes, un factor conocido en evaluación de pronunciación.
- Riesgo de alineamiento incorrecto en audio con ruido, solapamiento de voces o articulación muy degradada; el error se propaga al score final.
- Licencia MIT, compatible con uso comercial, pero el modelo deriva de Whisper base.en (MIT, con aviso de copyright de OpenAI incluido en LICENSE) y usa speechocean762 (CC BY 4.0 en OpenSLR; la copia de Hugging Face está marcada como Apache-2.0), por lo que conviene mantener la atribución.
- El regresor se serializa con joblib, lo que introduce dependencia de las versiones de joblib y scikit-learn y los riesgos habituales de deserialización de pickle en producción.
- Los metadatos del Hub indican fechas de creación y actualización de 2026-09-28, poco habituales y a tener en cuenta al evaluar la madurez del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vb223/whisper-base-en-phoneme-ctc
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Corpus speechocean762 en OpenSLR: https://www.openslr.org/101/
- Copia del dataset en Hugging Face: https://huggingface.co/datasets/mispeech/speechocean762
- Referencia del corpus: Zhang et al., "speechocean762: An Open-Source Non-native English Speech Corpus For Pronunciation Assessment", Interspeech 2021 (BibTeX incluido en la model card)
- WhisperX (alineamiento forzado con CTC): https://github.com/m-bain/whisperX
- Documentación del sistema de alineamiento de WhisperX: https://deepwiki.com/m-bain/whisperX/3.3-forced-alignment-system
- Listado de modelos con etiqueta phoneme-recognition: https://huggingface.co/models?other=phoneme-recognition
