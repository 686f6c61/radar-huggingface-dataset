# ummjevel/pocket-tts-korean-33m

## Resumen

Pocket TTS Korean 33M es un modelo de síntesis de voz (text-to-speech) en coreano, desarrollado por el usuario ummjevel como un ajuste fino comunitario del modelo base kyutai/pocket-tts. No se trata de un lanzamiento oficial de Kyutai, sino de un trabajo de investigación que adapta la arquitectura original (pensada para inglés) al idioma coreano mediante destilación de conocimiento desde un profesor fijo de mayor tamaño. El checkpoint seleccionado es el EMA de 20.000 pasos de la etapa final de anchura 224.

El modelo resuelve el problema de generar habla coreana inteligible y con calidad aceptable en un tamaño muy reducido: 32,7 millones de parámetros en total, incluyendo el códec Mimi completo y el codificador de prompts. Esta compacidad lo hace atractivo para despliegues en entornos con recursos limitados, aunque su licencia CC-BY-4.0 y su naturaleza de investigación condicionan su uso en producción.

La relevancia actual radica en la escasez de modelos TTS coreanos de código abierto con pesos publicados y métricas reproducibles. Este modelo reporta CER del 6,605% y UTMOSv1 de 3,1124 sobre el conjunto de evaluación CV3-Eval (zero_shot_ko), lo que ofrece un punto de referencia concreto para la comunidad, aunque con las cautelas propias de un modelo comunitario sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de seis capas, anchura 224, ocho cabezas de consulta y dos cabezas KV, dimensión de atención 512; interfaz z1024 con códec Mimi |
| Parametros totales | 32.657.058 (incluye códec Mimi completo y codificador de prompts) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (máximo de ejemplo/prompt de voz: 30 s / 5 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer compacta de seis capas con anchura 224, ocho cabezas de consulta y dos cabezas KV (atención agrupada), dimensión de atención de 512 y embedding de texto de rango 64. Conserva la interfaz z1024, las cabezas de muestreo y EOS originales, y el códec Mimi completo del modelo base kyutai/pocket-tts. No es una reproducción exacta del modelo oficial inglés de 7M, según advierte el autor.

El entrenamiento se basa en inicialización PCA secuencial y destilación de anchura con profesor fijo. La ruta de inicialización parte de B6k, pasa por width768 20k EMA, width512 20k EMA y llega a width224 20k EMA; la inicialización directa es la PCA del checkpoint derivado de B6k width512 20k EMA. El profesor fijo es un modelo coreano de 100M B6k EMA (un estudiante anterior destilado del profesor de 300M 100k EMA), invariante entre etapas de anchura. El objetivo es MSE nativo sobre el estado oculto z del profesor fijo. Se usó AdamW con tasa de aprendizaje 0,0004, programación coseno con 1.000 pasos de calentamiento, decaimiento EMA de 0,999, lote global de 64 (micro-lote 32 × acumulación de gradiente 2) y semilla 42. El corpus de entrenamiento es seastar105/emilia-yodas-ko-filtered-pocket-tts, con 918.609 enunciados (2.276,88 horas) en el split de entrenamiento y 9.472 enunciados (23,00 horas) en validación. El tokenizador es SentencePiece coreano de 4.000 tokens. La calibración PCA usó 32 lotes del manifiesto de validación del corpus de entrenamiento, no de CV3.

## Capacidades

- Generación de voz a partir de texto en coreano (text-to-speech).
- Clonación de voz zero-shot mediante prompt de voz de hasta 5 segundos.
- Generación de audio condicionada por prompt de voz, con similitud de hablante medida de 0,9180.
- Soporte de muestreo con temperatura y umbral EOS configurables (evaluado con temperatura 0,3 y umbral EOS -1).
- Generación de hasta 30 segundos por ejemplo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al coreano (idioma declarado: ko).

## Casos de uso

- Síntesis de voz para asistentes conversacionales en coreano: el modelo puede generar respuestas habladas en coreano con un prompt de voz de referencia de hasta 5 segundos, adecuado para integrarse en asistentes de voz con recursos de cómputo limitados gracias a sus 32,7M de parámetros.
- Audiolibros y lectura de contenido en coreano: permite convertir texto en habla con una duración de hasta 30 segundos por fragmento, lo que encaja en la generación por secciones de capítulos o artículos.
- Clonación de voz para accesibilidad: con un prompt de voz de 5 segundos y una similitud de hablante de 0,9180 en la evaluación, puede emplearse para preservar la voz de usuarios con dificultades del habla en aplicaciones de comunicación asistida.
- Generación de voces para doblaje y localización de contenido al coreano: útil en pipelines de localización donde se requiere una voz consistente y se dispone de una muestra de referencia del hablante original.
- Prototipado de interfaces de voz en investigación: su tamaño reducido y su licencia CC-BY-4.0 facilitan experimentos académicos sobre TTS coreano y destilación de modelos, con métricas reproducibles (CER, UTMOSv1, similitud de hablante).
- Generación de datos sintéticos de audio en coreano para entrenar otros sistemas: puede producir muestras de habla con un prompt de voz controlado, útil para aumentación de datos en ASR u otros modelos de voz, siempre que se respete la licencia y se documente la procedencia sintética.
- Pruebas de integración en entornos embebidos: al caber en repositorios de 0,1 GB y con 32,7M de parámetros, es viable para experimentar en dispositivos con memoria limitada, aunque no se han publicado requisitos de hardware específicos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / condicion |
|---|---|---|
| CER ↓ | 6,605% | CV3-Eval zero_shot_ko, 500 items, CFG 1 |
| UTMOSv1 ↑ | 3,1124 | UTMOSv1 / utmos-pytorch 0.1.0, media sobre items audibles, mono 16 kHz sin padding |
| Similitud de hablante ↑ | 0,9180 | wavlm-base-plus-sv, similitud coseno entre embeddings generado/prompt a 16 kHz |
| Generaciones silenciosas | 0 / 500 | Evaluación CV3-Eval |
| Generaciones sin EOS | 0 / 500 | Evaluación CV3-Eval |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas proceden del propio autor y no de una evaluación independiente; UTMOSv1 no equivale a MOS humano ni a UTMOSv2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 32,7M de parámetros totales (incluyendo códec Mimi), el modelo es muy compacto, pero no se publican cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: la librería declarada es pocket-tts; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card indica que el tiempo de generación no se registró por enunciado en la evaluación original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ummjevel/pocket-tts-korean-33m | 32,7M (con códec Mimi) | No disponible (30 s por ejemplo) | Coreano | CC-BY-4.0 | Hugging Face |
| ummjevel/pocket-tts-korean-62m | No disponible | No disponible | Coreano | No disponible | Hugging Face (etapa anterior) |
| kyutai/pocket-tts | No disponible | No disponible | Inglés (modelo base) | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. El modelo de 62M es una etapa anterior del mismo linaje (width768 20k EMA) y el modelo base kyutai/pocket-tts es el origen arquitectónico; no se han publicado métricas cruzadas.

## Limitaciones y advertencias

- Modelo de investigación comunitario, no un lanzamiento oficial de Kyutai; el autor lo califica explícitamente como tal.
- La model card declara `inference: false`, lo que indica que la inferencia no está garantizada o no está soportada de forma oficial en el repositorio.
- Idiomas limitados al coreano; no se documenta soporte multilingüe.
- No es una reproducción exacta del modelo oficial inglés de 7M, según el propio autor, por lo que las comparaciones directas con este pueden no ser válidas.
- Riesgo de alucinación y errores de pronunciación: el CER de 6,605% implica que aproximadamente una de cada quince unidades de reconocimiento difiere del texto de referencia en la evaluación, con posibles errores en nombres propios, números y palabras poco frecuentes.
- Las métricas son autoinformadas y no han sido verificadas de forma independiente; UTMOSv1 es una estimación automática, no un MOS humano.
- La similitud de hablante de 0,9180 se midió con un modelo concreto (wavlm-base-plus-sv) y puede no reflejar la percepción humana.
- El prompt de voz de origen no se incluye en el repositorio, lo que limita la reproducibilidad exacta de los ejemplos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar la autoría; conviene revisar las condiciones del modelo base kyutai/pocket-tts, cuya licencia no se detalla en la información disponible.
- Sin datos publicados de cuantización, latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ummjevel/pocket-tts-korean-33m
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Etapa anterior (62M): https://huggingface.co/ummjevel/pocket-tts-korean-62m
- Dataset de entrenamiento: https://huggingface.co/datasets/seastar105/emilia-yodas-ko-filtered-pocket-tts/tree/13e9bcb8200f3abf5aa687215f480305619aadd8
- Dataset de evaluación CV3-Eval: https://huggingface.co/datasets/yuekai/CV3-Eval/tree/6ea9d3650fffcbed7c6279e6d1546d01ef1d2796
- Whisper large-v3 (evaluación CER): https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- WavLM base plus SV (similitud de hablante): https://huggingface.co/microsoft/wavlm-base-plus-sv/tree/feb593a6c23c1cc3d9510425c29b0a14d2b07b1e
- Pesos UTMOS PyTorch: https://huggingface.co/Blinorot/UTMOS-PyTorch/tree/4f2447e519df3b88567b45583d3500006729502b
- Paquete utmos-pytorch 0.1.0: https://pypi.org/project/utmos-pytorch/0.1.0/
- Ejemplo de audio (mejor CER): https://huggingface.co/ummjevel/pocket-tts-korean-33m/resolve/main/samples/0008_zero_shot_uttid_9.wav
