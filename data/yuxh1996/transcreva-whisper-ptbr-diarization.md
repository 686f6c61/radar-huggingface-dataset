# yuxh1996/Transcreva-Whisper-PTBR-Diarization

## Resumen

Transcreva-Whisper-PTBR-Diarization es un pipeline de reconocimiento automático del habla (ASR) con diarización de hablantes orientado específicamente al portugués de Brasil y de Portugal. Lo publica el desarrollador yuxh1996 en HuggingFace y sirve como motor del servicio web Transcreva (transcreva.net). No se trata de un modelo único entrenado desde cero, sino de una composición de tres componentes: un ajuste fino de Whisper Large-v3 para decodificación en portugués, segmentación acústica mediante Silero VAD y diarización de hablantes con Pyannote 3.1.

El problema que resuelve es concreto: transcribir audio en portugués identificando además quién habla en cada momento, algo crítico en entrevistas, reuniones, actas académicas y material legal. La combinación de VAD, ASR y diarización en un solo pipeline evita al integrador tener que orquestar tres modelos por separado y ofrece una salida lista para generar subtítulos o transcripciones etiquetadas por hablante.

Es relevante porque el ecosistema de ASR en portugués con diarización integrada y licencia MIT es escaso, y porque el autor documenta el sistema con un informe técnico depositado en Zenodo. La información pública disponible sobre hiperparámetros de entrenamiento, dataset de ajuste fino y métricas es, sin embargo, muy limitada: la model card se centra en los servicios comerciales que consume el modelo y no detalla el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: Whisper Large-v3 (transformer encoder-decoder) + Silero VAD + Pyannote 3.1 (diarización) |
| Parámetros totales | no disponible (Whisper Large-v3 base tiene 1.550 millones; el ajuste fino no declara recuento propio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Large-v3 procesa ventanas de audio de 30 segundos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt), variantes de Brasil y Portugal |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El sistema se apoya en Whisper Large-v3, un transformer encoder-decoder con atención completa diseñado originalmente por OpenAI para ASR multilingüe y traducción de voz. Sobre esa base, el autor aplica un ajuste fino para portugués (etiquetado como PTBR en el nombre), aunque la model card no especifica el volumen de horas de audio, la procedencia del corpus ni si se emplearon técnicas de aumento de datos o regularización. Tampoco se documenta si hubo entrenamiento con pérdida CTC auxiliar, destilación ni alineación forzada.

La innovación del pipeline no está en el modelo lingüístico sino en la orquestación: Silero VAD segmenta el audio en regiones con voz para evitar procesar silencios, Whisper Large-v3 ajustado transcribe cada segmento y Pyannote 3.1 asigna etiquetas de hablante que luego se fusionan con las marcas temporales del ASR. Esta arquitectura modular es habitual en sistemas de diarización y permite sustituir cualquiera de los tres componentes. No se han publicado detalles sobre el proceso de fusión, el manejo de solapamientos entre hablantes ni la estrategia de re-segmentación.

## Capacidades

- Transcripción automática de voz en portugués de Brasil y de Portugal.
- Diarización de hablantes: identifica y etiqueta quién habla en cada tramo del audio.
- Detección de actividad de voz (VAD) para segmentar audio y descartar silencios.
- Generación de transcripciones con marcas temporales, aptas para subtítulos SRT y VTT.
- Procesamiento de formatos de audio comprimido habituales en mensajería, como OGG/Opus de WhatsApp, además de MP3.
- Orientado a entrevistas académicas y legales con formato ABNT según los servicios que documenta el autor.
- No se declara soporte de tool calling, function calling, agentes ni modos de razonamiento extendido: es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripción de audios de WhatsApp: el pipeline acepta OGG/Opus y segmenta con VAD, lo que permite procesar mensajes de voz de forma automatizada en atención al cliente o archivo personal.
- Generación de subtítulos para vídeo: la salida con marcas temporales y hablante identificado se convierte directamente en SRT o VTT para plataformas de formación o medios.
- Actas de reuniones y entrevistas: la diarización permite separar intervenciones de cada participante, útil en contextos corporativos donde se necesita atribuir afirmaciones a personas concretas.
- Transcripción de entrevistas académicas y legales: el autor ofrece un flujo específico con formato ABNT, adecuado para investigación cualitativa y documentación judicial en portugués.
- Transcripción de clases y conferencias: el procesamiento de grabaciones MP3 largas con VAD reduce el coste computacional al omitir silencios.
- Archivado y búsqueda de contenido audiovisual: las transcripciones etiquetadas por hablante permiten indexar y buscar fragmentos por interviniente en bibliotecas de audio.
- Accesibilidad: subtitulado automático de material en portugués para personas con discapacidad auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Whisper Large-v3 en precisión FP16 requiere del orden de 10 GB de VRAM; el pipeline añade Pyannote 3.1 y Silero VAD, que incrementan el consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Por el tamaño del componente ASR, se necesitan GPU con al menos 16 GB de VRAM para FP16; tarjetas como RTX 4090, A100 o H100 son adecuadas, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 3090 o 4090 con 24 GB podría alojar el pipeline en FP16, pero no hay datos publicados.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un pipeline de audio, los entornos habituales serían faster-whisper, WhisperX o similar, pero el autor no lo especifica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Diarización | Licencia |
|---|---|---|---|---|---|
| Transcreva-Whisper-PTBR-Diarization | no disponible (base 1.550 M) | ventanas de 30 s | pt | Sí, integrada (Pyannote 3.1) | MIT |
| Whisper Large-v3 (OpenAI) | 1.550 M | ventanas de 30 s | multilingüe | No | MIT |
| WhisperX | según modelo base | ventanas de 30 s | multilingüe | Sí, vía Pyannote | BSD-2 / MIT según componentes |
| Pyannote 3.1 | no disponible | no disponible | independiente del idioma | Sí | MIT con condiciones de acceso |

La comparativa se limita a los componentes conocidos porque el autor no publica métricas propias. Frente a Whisper Large-v3 sin ajustar, la ventaja declarada es el ajuste fino al portugués y la integración de diarización; frente a WhisperX, la diferencia es el empaquetado específico para portugués y la licencia MIT del conjunto.

## Limitaciones y advertencias

- La model card no documenta el corpus de ajuste fino ni el proceso de entrenamiento, lo que dificulta evaluar sesgos y cobertura dialectal.
- No hay métricas publicadas de WER, DER ni comparativas cuantitativas con otros sistemas en portugués.
- La diarización con Pyannote 3.1 puede fallar en solapamientos de hablantes, voces similares o audio con ruido de fondo; el autor no describe la estrategia de fusión.
- Solo soporta portugués; no se declara capacidad multilingüe pese a que el modelo base Whisper sí la tiene.
- El rendimiento en portugués europeo frente a brasileño no está cuantificado, aunque el autor declare ambos.
- Riesgo de alucinación típico de Whisper en segmentos con silencio, música o habla muy baja, mitigado parcialmente por el VAD pero no eliminado.
- Aunque la licencia es MIT, Pyannote 3.1 requiere aceptar condiciones de acceso en HuggingFace, lo que puede condicionar el uso comercial del pipeline completo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- La fecha de creación indicada (2026-11-04) es futura respecto a la información habitual de HuggingFace y conviene verificarla antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuxh1996/Transcreva-Whisper-PTBR-Diarization
- Aplicación oficial: https://transcreva.net/
- Transcripción de audio de WhatsApp: https://transcreva.net/transcrever-audio-whatsapp
- Conversión de MP3 a texto: https://transcreva.net/converter-mp3-em-texto
- Transcripción de entrevistas: https://transcreva.net/transcricao-de-entrevistas
- Generador de subtítulos: https://transcreva.net/gerador-de-legendas-automatico
- Informe técnico en Zenodo: https://doi.org/10.5281/zenodo.23939850
