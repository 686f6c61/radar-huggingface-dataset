# vladkens/ivrit-whisper-large-v3-turbo-gguf

## Resumen

ivrit-whisper-large-v3-turbo-gguf es una conversión a formato GGUF (cuantización Q8_0) del modelo ivrit-ai/whisper-large-v3-turbo, un ajuste fino en hebreo realizado por ivrit.ai sobre OpenAI Whisper large-v3-turbo. El trabajo de conversión y cuantización lo firma vladkens y está orientado a dos runtimes concretos: transcribe.cpp y la herramienta de línea de comandos wavo. El resultado es un único fichero de 886 MB con 808.904.208 parámetros, pensado para transcripción de voz a texto en hebreo con un coste de despliegue muy bajo.

La relevancia práctica del modelo está en el binomio tamaño/precisión: parte de la variante "turbo" de Whisper (sustancialmente más pequeña y rápida que large-v3) y, tras el ajuste fino de ivrit.ai, reduce el WER de forma notable frente al Whisper original en hebreo. En el conjunto FLEURS (he_il) baja de 33,25 % a 18,80 %, y en el conjunto interno eval-d1 pasa de 7,97 % a 4,78 %. Es, por tanto, una opción atractiva para transcribir hebreo en local o en servidores modestos, con licencia Apache-2.0 y sin dependencia de APIs externas.

Conviene subrayar que se trata de un artefacto de conversión, no de un modelo nuevo: los pesos proceden del release 2025.05.13 de ivrit-ai y no se modificaron durante la conversión. El único cambio introducido afecta a `generation_config.json`, donde se restauró la lista de 88 tokens suprimidos de openai/whisper-large-v3-turbo en lugar de la lista vacía del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), ajustado en hebreo por ivrit.ai |
| Parametros totales | 808.904.208 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (herencia de la arquitectura Whisper); no se detalla en la model card de este GGUF |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | Hebreo (`he`) como idioma de uso previsto; el GGUF conserva los 100 idiomas de Whisper en `general.languages`, pero el ajuste fino degrada la detección de idioma y la traducción |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `ivrit-whisper-large-v3-turbo-Q8_0.gguf`, 886 MB, sha256 `da1f765ce2cfc495459fb3cc5deb2aaa2fa741eec79bff259b3da0481c4533ac`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención completa sobre una ventana fija de audio de 30 segundos y decodificación autorregresiva de tokens de texto. La variante "turbo" reduce el número de capas del decodificador respecto a large-v3, lo que explica que el modelo completo ronde los 809 millones de parámetros y que el fichero Q8_0 quede por debajo de 1 GB. Al emplear ventanas fijas de 30 s, el coste por segmento es constante incluso con audios más cortos que ese umbral, y el audio de mayor duración debe segmentarse externamente.

Sobre el entrenamiento no hay información en la fuente proporcionada: la model card de esta conversión remite a la model card de ivrit-ai/whisper-large-v3-turbo para los datos de entrenamiento y las limitaciones. Sí se documenta el proceso de conversión: `scripts/convert-whisper.py` de transcribe.cpp en el commit `5bb2deb`, seguido de `transcribe-quantize --quant Q8_0` desde el mismo commit. La única modificación respecto al modelo de origen fue sustituir `"suppress_tokens": []` por la lista de 88 tokens de openai/whisper-large-v3-turbo (commit `41f01f3`), de modo que el decodificador suprime los mismos tokens no hablados que Whisper estándar; no se alteró ningún peso.

## Capacidades

- Transcripción de voz a texto en hebreo, incluida la puntuación y la segmentación en frases que produce el decodificador de Whisper.
- Reconocimiento robusto en audio telefónico y notas de voz comprimidas: el conjunto eval-whatsapp, compuesto por audio de WhatsApp, se transcribe con un WER de 7,53 %.
- Manejo de audio de cualquier formato y frecuencia de muestreo cuando se usa a través de wavo; transcribe.cpp espera WAV mono a 16 kHz.
- Capacidad multilingüe residual: los metadatos conservan 100 idiomas y el modelo puede emitir tokens en otros idiomas, pero la detección de idioma y la traducción al inglés están degradadas por el ajuste fino, por lo que debe forzarse `he` cuando el runtime lo permita.
- Ejecución local sin conexión, con un único fichero GGUF y sin dependencias de servicios en la nube.
- No dispone de tool calling, function calling, modo de razonamiento extendido ni capacidades de agente; es un modelo puramente ASR.
- No se documentan capacidades de diarización de hablantes ni de alineación temporal a nivel de palabra en esta ficha.

## Casos de uso

- Transcripción de reuniones y clases en hebreo: el modelo convierte grabaciones en actas de texto con un WER de 4,78 % en el conjunto eval-d1 (dominio general), adecuado para generar borradores que un humano revisa después.
- Subtitulado de contenido audiovisual: integrado en un pipeline que segmenta el audio en ventanas de 30 s y aplica VAD, el modelo produce subtítulos en hebreo para vídeo corporativo, formatos o archivo audiovisual, con la ventaja de ejecutarse en local sin enviar material sujeto a derechos a terceros.
- Análisis de notas de voz de WhatsApp en atención al cliente: los 7,53 % de WER sobre eval-whatsapp indican que el modelo tolera la compresión y las condiciones acústicas típicas de mensajería móvil, lo que permite transcribir y clasificar consultas entrantes en un CRM.
- Archivística y oral history: digitalización de entrevistas y fondos sonoros en hebreo, donde el coste por hora de audio es bajo (809 millones de parámetros en Q8_0) y la licencia Apache-2.0 evita fricciones para instituciones públicas.
- Accesibilidad: generación de transcripciones en directo o diferidas para personas con discapacidad auditiva en aplicaciones y webs en hebreo, ejecutando el modelo en el propio dispositivo o en un servidor pequeño.
- Pre-etiquetado para entrenamiento de ASR: servir como modelo profesor para pseudo-etiquetar horas de audio en hebreo antes de entrenar modelos propios más pequeños, aprovechando la licencia permisiva y la ausencia de cuotas de API.
- Transcripción en entornos con requisitos de soberanía del dato: despliegue on-premise en organizaciones que no pueden enviar audio a servicios externos, viable con CPU o con una GPU de gama baja.

## Benchmarks y rendimiento

WER en porcentaje (menor es mejor), calculado con los ficheros Q8_0 ejecutados en wavo, con normalización y puntuación de WER de corpus usando el código de evaluación de ivrit.ai (`asr-training` en `e333b4a`). eval-d1 y eval-whatsapp son los conjuntos completos; SASpeech, KAN y FLEURS (`he_il` test) son subconjuntos de 200 clips.

| Modelo | eval-d1 | eval-whatsapp | SASpeech | KAN | FLEURS |
|---|---:|---:|---:|---:|---:|
| ivrit-whisper-large-v3-turbo (este, Q8_0) | 4,78 | 7,53 | 5,32 | 7,63 | 18,80 |
| openai/whisper-large-v3-turbo (Q8_0) | 7,97 | 15,21 | 10,80 | 16,66 | 33,25 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de texto, que no aplican a un modelo ASR.

## Requisitos de hardware

- Pesos: 886 MB en el fichero Q8_0 (repositorio de 0,9 GB), con 808.904.208 parámetros a 8 bits.
- VRAM estimada para inferencia: en torno a 1,2–1,8 GB incluyendo activaciones y buffers de decodificación (estimación a partir del tamaño de los pesos Q8_0, no medida en la fuente).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3050, RTX 4060 o superior deja margen amplio para procesar varios segmentos en paralelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier tarjeta discreta de los últimos diez años, y también en iGPU con memoria unified suficiente.
- CPU: viable. Con 809 millones de parámetros en Q8_0 el modelo puede ejecutarse en CPU moderna, a un throughput menor que en GPU.
- Opciones de despliegue documentadas: transcribe.cpp (`transcribe-cli`) y wavo. No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp en la información disponible; el formato GGUF de este repositorio está generado con las herramientas de transcribe.cpp.

```sh
# wavo: acepta cualquier formato y frecuencia de muestreo
wavo pull whisper-turbo-he
wavo run whisper-turbo-he audio.m4a

# transcribe.cpp: requiere WAV mono a 16 kHz
transcribe-cli -m ivrit-whisper-large-v3-turbo-Q8_0.gguf -l he audio.wav
```

- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / idioma | Formato y licencia | WER FLEURS (he_il) | Disponibilidad |
|---|---|---|---|---|---|
| ivrit-whisper-large-v3-turbo-gguf (este) | 808.904.208 | Ventana de 30 s; hebreo | GGUF Q8_0, Apache-2.0 | 18,80 | Fichero único de 886 MB en HuggingFace |
| ivrit-ai/whisper-large-v3-turbo (origen) | no disponible en esta ficha | Ventana de 30 s; hebreo | Safetensors, Apache-2.0 | no disponible para los pesos sin cuantizar en esta ficha | Repositorio original de ivrit.ai |
| openai/whisper-large-v3-turbo | misma arquitectura turbo (el ajuste no altera el número de parámetros) | Ventana de 30 s; 100 idiomas | Safetensors / GGUF, Apache-2.0 | 33,25 (Q8_0 en wavo) | Referencia de OpenAI, ampliamente soportada |
| openai/whisper-large-v3 | 1,55 mil millones (dato externo, no verificado en la fuente) | Ventana de 30 s; 100 idiomas | Safetensors, Apache-2.0 | no disponible en esta ficha | Referencia de OpenAI; mayor coste de inferencia |

La comparación directa disponible se limita al par turbo original frente al ajuste de ivrit.ai: la mejora es de 3,19 puntos de WER en eval-d1, 7,68 en eval-whatsapp, 5,48 en SASpeech, 9,03 en KAN y 14,45 en FLEURS. No hay datos en la fuente que permitan comparar con modelos ASR de otros fabricantes (por ejemplo, variantes comerciales o modelos wav2vec/CANARY) en hebreo.

## Limitaciones y advertencias

- La detección automática de idioma y la traducción al inglés están degradadas por el ajuste fino en hebreo; debe forzarse el idioma `he` siempre que el runtime lo permita.
- El WER se dispara en FLEURS (18,80 %), un conjunto de habla leída y posiblemente más alejada del dominio de entrenamiento, frente al 4,78 % de eval-d1: el rendimiento no es homogéneo entre dominios y conviene evaluar con muestras propias antes de producción.
- Riesgo de alucinación característico de Whisper en silencios, música o ruido de fondo prolongado; se recomienda VAD y filtros de segmentos sin habla.
- Ventana fija de 30 s: el audio largo requiere segmentación y, si se corta sin solapamiento, pueden perderse palabras en las fronteras.
- No se documentan en la fuente los sesgos del modelo de origen; deben consultarse en la model card de ivrit-ai/whisper-large-v3-turbo. Cabe esperar los sesgos acústicos y léxicos del corpus hebreo empleado en el ajuste fino.
- El cambio en `generation_config.json` (lista de 88 tokens suprimidos en lugar de lista vacía) altera el comportamiento del decodificador respecto al modelo de ivrit.ai; puede afectar a la salida en tramos con sonidos no hablados.
- La cuantización Q8_0 puede introducir una degradación pequeña frente a los pesos originales; no se han publicado mediciones de esa diferencia en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el fichero `NOTICE` del repositorio declara los cambios realizados y debe conservarse al redistribuir.
- Señales de validación comunitaria muy bajas (0 descargas, 0 likes en el momento de la consulta) y repositorio creado en octubre de 2026; el artefacto es reciente y poco contrastado por terceros.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/vladkens/ivrit-whisper-large-v3-turbo-gguf
- Fichero GGUF Q8_0: https://huggingface.co/vladkens/ivrit-whisper-large-v3-turbo-gguf/blob/main/ivrit-whisper-large-v3-turbo-Q8_0.gguf
- Licencia del repositorio: https://huggingface.co/vladkens/ivrit-whisper-large-v3-turbo-gguf/blob/main/LICENSE
- Aviso de cambios: https://huggingface.co/vladkens/ivrit-whisper-large-v3-turbo-gguf/blob/main/NOTICE
- Modelo de origen (ivrit-ai/whisper-large-v3-turbo): https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Commit del release 2025.05.13: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo/commit/f33172a8c3c6efbc040a7200e00835257cac0447
- Modelo base de OpenAI (whisper-large-v3-turbo): https://huggingface.co/openai/whisper-large-v3-turbo
- `generation_config.json` de referencia (commit 41f01f3): https://huggingface.co/openai/whisper-large-v3-turbo/blob/41f01f3fe87f28c78e2fbf8b568835947dd65ed9/generation_config.json
- wavo (CLI de transcripción): https://github.com/vladkens/wavo
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado en la conversión: https://github.com/handy-computer/transcribe.cpp/tree/5bb2deb2a4afb1fd50534ecb51cfcb521ef94944
- Código de evaluación de ivrit.ai (asr-training): https://github.com/ivrit-ai/asr-training
- Dataset eval-d1: https://huggingface.co/datasets/ivrit-ai/eval-d1
- Dataset eval-whatsapp: https://huggingface.co/datasets/ivrit-ai/eval-whatsapp
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- ivrit.ai: https://www.ivrit.ai
