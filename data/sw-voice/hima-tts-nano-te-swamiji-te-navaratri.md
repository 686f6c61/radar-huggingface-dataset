# sw-voice/hima-tts-nano-te-swamiji-te-navaratri

## Resumen

hima-tts-nano-te-swamiji-te-navaratri es un modelo de síntesis de voz (text-to-speech) en telugu, resultado del ajuste fino del modelo base Prahaladha/hima-tts-nano-te, un sistema de 62 millones de parámetros basado en el diseño Kyutai Pocket TTS. Lo desarrolla el usuario sw-voice como parte de una línea de investigación sobre clonación de voz (proyecto swamiji-tts), y está entrenado específicamente para reproducir la voz de una figura concreta ("Swamiji") a partir de 402 clips de audio en telugu con una duración total de 1,79 horas.

El modelo resuelve el problema de la síntesis de voz personalizada en un idioma de bajos recursos como el telugu, con un tamaño lo suficientemente reducido como para ejecutarse en CPU. Su relevancia es fundamentalmente investigadora: el autor lo publica explícitamente como "research only, not adopted", es decir, un experimento que no llegó a adoptarse en producción. Aun así, resulta interesante como referencia de hasta dónde llega un ajuste fino ligero (510 actualizaciones, 10 épocas) sobre un TTS compacto con una única voz de referencia fija.

La ficha describe un artefacto de nicho: licencia no aclarada ("other"), un solo idioma, una sola voz y métricas de calidad modestas en comparación con alternativas comerciales. No debe confundirse con un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diseño Kyutai Pocket TTS (flow head + resto de componentes; detalles completos no disponibles) |
| Parámetros totales | 61.854.849 (aproximadamente 62 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (límite operativo de 220 caracteres por fragmento; máximo aproximado de 30 s de audio por generación) |
| Tipos de cuantización | no disponible (pesos en safetensors; el modelo base dispone de versiones ONNX y MLX, no incluidas en este repo) |
| Idiomas soportados | telugu (te) |
| Licencia | other (licencia del modelo base no declarada explícitamente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda el diseño Kyutai Pocket TTS del modelo base, un sistema TTS compacto de 62 M de parámetros que en este ajuste fino se entrena con la "flow head" congelada y el resto de componentes actualizables. El entrenamiento se realizó con el script `hima_train.py` del proyecto swamiji-tts: optimizador AdamW, tasa de aprendizaje 1e-4, 10 % de warmup seguido de decaimiento coseno, batch de 8, 10 épocas (510 actualizaciones en total) y semilla 0, sobre una GPU Apple M5. El conjunto de datos son 402 clips de audio en telugu (1,79 h) del corpus `sw-voice/swamiji-navaratri-telugu-reuse`. Cada clip se condicionó a un único fichero de voz fijo (`swamiji_te_voice.safetensors`), construido a partir del clip de referencia p3R1wZLty6A_029.

No se documenta el volumen de tokens de texto, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; el autor solo publica la curva de pérdida por actualización en `train_log.json`. La innovación técnica destacable es la economía del ajuste: con menos de 2 horas de audio y 510 pasos se obtiene una voz reconocible, lo que convierte al modelo en un caso de estudio de adaptación de voz con recursos mínimos. El modelo base dispone de versiones ONNX y MLX, pero este ajuste fino no las incluye y requeriría conversión.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto escrito en escritura telugu.
- Conversión automática de números, fechas y cantidades a palabras.
- Clonación de una voz concreta mediante fichero de referencia (`swamiji_te_voice.safetensors`); el modelo está condicionado a esa voz fija.
- Generación determinista mediante semilla (`seed=`), útil para repetir exactamente una misma locución.
- Segmentación automática de textos largos: los fragmentos de más de 220 caracteres se dividen en límites de frase y se leen con 0,15 s de pausa entre piezas.
- Salida de audio a 24 kHz en formato float32 (array de NumPy) o fichero WAV.
- Ejecución en CPU (aproximadamente 6 veces más rápido que tiempo real en un portátil Apple) o en GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking".

## Casos de uso

- Investigación en clonación de voz con pocos datos: sirve como referencia reproducible de ajuste fino de un TTS de 62 M con menos de 2 horas de audio, gracias a la publicación del script de entrenamiento y del registro de pérdidas.
- Generación de audiolibros o lecturas devocionales en telugu: el modelo lee textos largos dividiéndolos automáticamente en fragmentos de 220 caracteres con pausas de 0,15 s, adecuado para contenido narrado de forma monótona y con una única voz.
- Pruebas de calidad de TTS en idiomas de bajos recursos: sus métricas publicadas (74,4 % de coincidencia de voz y 1,5 % de errores de carácter) permiten comparar metodologías de ajuste fino frente a alternativas comerciales.
- Prototipado de asistentes de voz en telugu en entornos sin GPU: al ejecutarse en CPU a unas 6 veces tiempo real, se puede integrar en portátiles o servidores modestos para demos y validación de concepto.
- Accesibilidad y locución de contenido educativo en telugu: conversión de materiales escritos a audio para personas con dificultades de lectura, con la limitación de una sola voz y un solo idioma.
- Evaluación de pipelines de conversión de formato: dado que el modelo base tiene variantes ONNX y MLX no incluidas en este repositorio, el ajuste fino sirve para estudiar el proceso de conversión y despliegue de un TTS pequeño.

## Benchmarks y rendimiento

| Métrica | Resultado | Referencia comparativa |
|---|---|---|
| Coincidencia de voz (WavLM-ECAPA, similitud real-vs-real) | 74,4 % | VoxCPM2 voice B: 92,1 %; ElevenLabs v4 clone: 80,2 % |
| Errores de carácter (MAI-Transcribe-2) | 1,5 % | no disponible para las alternativas |

Las puntuaciones se obtuvieron sobre seis líneas en telugu del corpus de investigación 06/59 con semilla 0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable en un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 62 M de parámetros en safetensors (0,3 GB de repositorio), la inferencia en FP32 requiere del orden de 0,25 GB de pesos, por lo que cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se especifican; el autor valida ejecución en GPU mediante `device="cuda"` sin detallar modelo. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Ejecución en CPU: validada, aproximadamente 6 veces más rápido que tiempo real en un portátil Apple (probablemente Apple Silicon).
- Opciones de despliegue: paquete propio `hima_tts` (interfaz de línea de comandos y API de Python); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no se publican cifras de latencia por petición; solo la referencia de 6x tiempo real en CPU. El modelo genera como máximo unos 30 s de audio por pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Calidad de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hima-tts-nano-te-swamiji-te-navaratri | 62 M | 220 caracteres por fragmento; ~30 s por generación | 74,4 % de coincidencia de voz; 1,5 % de errores de carácter | other (base sin licencia declarada) | Hugging Face, 0 descargas |
| Prahaladha/hima-tts-nano-te (base) | 62 M | no disponible | no disponible | other (no declarada) | Hugging Face |
| VoxCPM2 voice B (referencia del autor) | no disponible | no disponible | 92,1 % de coincidencia de voz | no disponible | no disponible |
| ElevenLabs v4 clone (referencia del autor) | no disponible (servicio propietario) | no disponible | 80,2 % de coincidencia de voz | propietaria | servicio comercial |

La comparación con VoxCPM2 y ElevenLabs v4 procede de las métricas que el propio autor incluye en la model card; no se dispone de especificaciones técnicas de esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "research only, not adopted": no ha pasado por un proceso de validación para producción.
- Licencia "other" sin texto de licencia en la model card; el autor remite a la licencia del modelo base, que tampoco está declarada. El uso comercial es incierto y requiere consultar al autor.
- Una sola voz y un solo idioma: no es un TTS multilingüe ni permite cambiar de hablante sin reentrenar o condicionar a otro fichero de voz.
- Calidad de clonación por debajo de alternativas comerciales: 74,4 % frente al 80,2 % de ElevenLabs v4 y el 92,1 % de VoxCPM2 voice B según las métricas del propio autor.
- Riesgo de alucinación acústica y errores de pronunciación: la métrica de 1,5 % de errores de carácter indica que aún se producen desviaciones en la transcripción del audio generado.
- Límite operativo de 220 caracteres por fragmento y aproximadamente 30 s de audio por generación; los textos largos se cortan en frases con pausas de 0,15 s, lo que puede producir una prosodia entrecortada.
- El repositorio solo contiene `model.safetensors` propio; las versiones ONNX y MLX del modelo base no incluyen este ajuste fino y habría que convertirlas.
- El conjunto de entrenamiento es muy reducido (1,79 h, 402 clips) y de un único hablante, lo que limita la generalización a otros estilos, acentos o condiciones acústicas.
- No se documentan sesgos demográficos ni de otro tipo, pero al tratarse de una voz única y un corpus devocional concreto, el modelo reproducirá las características de esa fuente.
- Riesgo ético y legal de clonación de voz: el modelo reproduce la voz de una persona identificable; su uso debe contar con consentimiento y cumplir la normativa aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/hima-tts-nano-te-swamiji-te-navaratri
- Modelo base: https://huggingface.co/Prahaladha/hima-tts-nano-te
- Corpus de entrenamiento: https://huggingface.co/sw-voice/swamiji-navaratri-telugu-reuse
- Clip de referencia de la voz: p3R1wZLty6A_029 (identificador citado en la model card; no se proporciona URL directa)
