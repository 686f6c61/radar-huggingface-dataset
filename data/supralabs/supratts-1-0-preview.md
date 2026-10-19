# SupraLabs/SupraTTS-1.0-Preview

## Resumen

SupraTTS-1.0-Preview es un sistema de síntesis de voz (text-to-speech) en inglés desarrollado por SupraLabs (autor del repositorio: arthurblg1802), publicado como sucesor de SupraTTS-0.1-Beta. Su propuesta central es la eficiencia extrema: un modelo completo de TTS con solo 1.031.754 parámetros (aproximadamente 1,03 M), frente a los ~44 M del sistema anterior basado en Glow-TTS + HiFi-GAN. El modelo se distribuye en formato safetensors con pesos fp32 de unos 4 MB en disco y sintetiza audio a 24 kHz.

Según la model card, el sistema se construye mediante un pipeline de destilación en tres etapas y está pensado para inferencia en CPU sin GPU. En la misma máquina (Ryzen 5 3500X) el autor reporta un RTF mediano de 0,0118, es decir, unas 85 veces más rápido que el tiempo real, frente a 1,9x del modelo predecesor. La relevancia actual del lanzamiento es que ocupa la frontera de calidad por parámetro en la clase sub-2M de TTS abiertos, según las métricas sin referencia que reporta el propio autor.

La licencia es MIT, lo que permite uso comercial sin restricciones adicionales documentadas. El modelo está en estado "Preview", con 137 descargas y 12 likes en el momento de redactar esta ficha, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de TTS por destilación en tres etapas; no se detalla la topología interna en la informacion disponible |
| Parametros totales | 1.031.754 (~1,03 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de TTS; no se documenta el limite de texto de entrada) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32, safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (libreria pytorch); ~4 MB en fp32 |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces | Monohablante (single-speaker), segun la comparativa de la model card |
| Entrada | Texto en ingles |

## Arquitectura y entrenamiento

La model card describe el sistema como "a three-stage distilled system" de 1,03 M de parámetros, sin especificar los componentes concretos de cada etapa (codificador acústico, generador, vocoder u otros). El predecesor, SupraTTS-0.1-Beta, empleaba Glow-TTS más HiFi-GAN con ~44 M de parámetros (29,6 M acústicos + 14 M de vocoder), por lo que este lanzamiento representa una reducción de tamaño de aproximadamente 1/43 respecto a esa arquitectura. No se publican detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni si se emplearon técnicas de alineamiento o preferencia (RLHF/DPO); esos datos figuran como no disponibles.

La innovación principal declarada es la destilación agresiva manteniendo métricas de inteligibilidad y naturalidad competitivas, junto con una latencia muy baja en CPU. El modelo se distribuye con un runtime propio ("shipped runtime") y un script `benchmark/rtf.py` para reproducir las mediciones de velocidad, además de un conjunto de evaluación de 24 frases (`benchmark/eval_sentences.txt`). No se documentan técnicas como decodificación especulativa, atención lineal o modos de razonamiento, que no aplican a un sistema de TTS.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Inferencia en CPU sin GPU, con un RTF mediano declarado de 0,0118 (~85x tiempo real) en un Ryzen 5 3500X.
- Huella mínima: ~4 MB de pesos en fp32 y carga de pesos practicamente instantanea, segun el autor.
- Instalacion ligera: Python mas tres paquetes pip, segun la model card.
- Una unica voz (monohablante); no se documenta clonación de voz, control de estilo ni emoción.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a la tarea).
- No se documenta procesamiento de audio de entrada, ASR, traducción ni capacidades multimodales.
- Sin soporte multilingüe: solo inglés.

## Casos de uso

- Lectura de notificaciones y avisos en applications de escritorio: el modelo cabe en ~4 MB de pesos y funciona solo con CPU, por lo que puede embeberse en un cliente de escritorio o una app Electron sin dependencias de GPU ni servicio externo.
- Sistemas de accesibilidad (lectores de pantalla): la síntesis a 85x tiempo real permite leer texto largo sin retardo perceptible, manteniendo una huella de memoria minima en equipos modestos.
- Asistentes de voz para dispositivos embebidos y edge computing: al no requerir GPU y con un RTF de 0,0118 en una CPU de escritorio, es candidato para hardware de bajos recursos, siempre que se valide en la plataforma concreta (no hay mediciones publicadas fuera del Ryzen 5 3500X).
- Generación masiva de audio para pruebas y CI: sintetizar corpus de audio para tests de pipelines de ASR o de sistemas de diálogo, con generación lo bastante rápida para ejecutarse dentro de un job de integración continua.
- Prototipado rápido de productos de voz: validar flujos de conversación y UX de audio con un modelo de licencia MIT y sin coste de inferencia en la nube.
- Síntesis en local para aplicaciones con requisitos de privacidad: al ejecutarse en el propio dispositivo, el texto no sale del equipo, lo que encaja en entornos con datos sensibles.
- Generación de avisos hablados en sistemas de monitorización o IoT: mensajes cortos generados en el propio dispositivo, sin conexión a internet.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos sobre el checkpoint publicado a través del runtime incluido. Inteligibilidad: WER con Whisper small como juez. Naturalidad: SCOREQ, DNSMOS y UTMOS sobre audio normalizado a RMS 0,05, en un conjunto held-out de 24 frases diversas.

| Metrica | SupraTTS-1.0-Preview | SupraTTS-0.1-Beta |
|---|---|---|
| Parametros | 1,03 M | ~43 M (29,6 M acustico + 14 M vocoder) |
| UTMOS | 3,97 | 3,59 ± 0,07 (protocolo propio) |
| SCOREQ (NR sintetico) | 4,04 | No reportado |
| DNSMOS-OVRL / SIG | 3,44 / 3,64 | No reportado |
| WER (juez Whisper small) | 0,083 (conjunto de 24 frases) | 3,64 % (conjunto propio de 20 frases) |
| Velocidad en CPU | ~85x tiempo real (RTF 0,0118) | 1,9x tiempo real (RTF 0,5237) |

Comparativa de campo completo publicada en la model card (misma suite de scorers, mismas 24 frases):

| Sistema | Parametros | SCOREQ | UTMOS | DNS-SIG |
|---|---:|---:|---:|---:|
| SupraTTS-1.0-Preview | 1,03 M | 4,04 | 3,97 | 3,64 |
| sanoTTS (amy) | 1,46 M | 4,13 | 4,10 | 3,61 |
| TinyTTS | 1,62 M | 3,94 | 3,65 | 3,62 |
| Inflect Nano | 4,63 M | 3,81 | 3,65 | 3,58 |
| Kitten TTS nano | 15 M | 3,02 | 3,58 | 3,43 |
| sanoTTS (heart-nano) | 0,29 M | 2,29 | 2,45 | 3,35 |
| Piper (teacher grande) | ~15 M | 4,71 | 4,47 | 3,65 |
| Kokoro (teacher grande) | 82 M | 4,89 | No disponible en el fragmento | No disponible en el fragmento |

Nota metodologica del autor: las filas de calidad del modelo Beta corresponden a su protocolo propio (10 frases fuera de dominio + 10 held-out de LJSpeech, 5 semillas), mientras que las del nuevo modelo usan su conjunto de 24 frases; la comparación de calidad es direccional. Solo son directamente comparables la fila de velocidad (misma máquina y sesión) y el recuento de parámetros. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU. El autor no publica cifras de RAM pico, solo el tamaño de pesos (~4 MB en fp32).
- GPU recomendadas: no aplica. El modelo está diseñado para CPU; no se documenta soporte CUDA como vía principal.
- Cabe en cualquier CPU de consumo: medición de referencia en un AMD Ryzen 5 3500X con RTF mediano de 0,0118 (~85x tiempo real).
- Despliegue: runtime propio del repositorio con Python y tres paquetes pip; script `benchmark/rtf.py` para reproducir latencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de TTS de este tipo).
- Throughput: aproximadamente 85 segundos de audio por segundo de cómputo en la CPU de referencia; el autor menciona "about 90x" en el texto y 85x en la tabla de mediciones.
- Almacenamiento: ~4 MB de pesos, frente a los ~1,3 GB (incluyendo estado del optimizador) del modelo predecesor.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | SCOREQ / UTMOS | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SupraTTS-1.0-Preview | 1,03 M | TTS ingles, monohablante, CPU | 4,04 / 3,97 | MIT | HuggingFace (Preview) |
| sanoTTS (amy) | 1,46 M | TTS abierto, monohablante | 4,13 / 4,10 | No disponible en la informacion | HuggingFace (ampixa/sanoTTS) |
| TinyTTS | 1,62 M | TTS abierto, monohablante | 3,94 / 3,65 | No disponible en la informacion | Publicado |
| Inflect Nano | 4,63 M | TTS abierto, monohablante | 3,81 / 3,65 | No disponible en la informacion | Publicado |
| Piper | ~15 M | TTS abierto, teacher grande | 4,71 / 4,47 | No disponible en la informacion | Publicado |
| Kokoro | 82 M | TTS abierto, teacher grande | 4,89 / no disponible | No disponible en la informacion | Publicado |

Según la model card, SupraTTS-1.0-Preview domina a TinyTTS, Inflect Nano y Kitten TTS nano en ambos ejes (menos parámetros y mejores métricas), y solo sanoTTS (amy) lo supera en calidad a costa de un 42 % más de parámetros. Los comparisons de licencia y disponibilidad de los competidores no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe ni se documenta entrenamiento en otros idiomas.
- Monohablante: no se documenta clonación de voz, selección de hablante ni control de prosodia, emoción o estilo.
- Inteligibilidad limitada: el WER de 0,083 (8,3 %) con Whisper small como juez sobre 24 frases implica errores de pronunciación apreciables en comparación con sistemas grandes; no es directamente comparable con el 3,64 % del Beta porque los conjuntos y protocolos difieren.
- Calidad por debajo de los "teachers" grandes: Kokoro (82 M) y Piper (~15 M) obtienen SCOREQ y UTMOS superiores; el modelo no compite en calidad absoluta.
- Protocolo de evaluación propio y no replicado: todas las métricas proceden del autor y de su runtime; no hay evaluaciones independientes publicadas. Además, la comparación con el Beta mezcla conjuntos de frases distintos.
- Estado "Preview": 137 descargas y 12 likes; API, runtime y comportamiento pueden cambiar sin garantías de estabilidad.
- Licencia MIT: permite uso comercial y modificación, pero la model card no incluye cláusulas sobre procedencia de los datos de entrenamiento ni sobre consentimiento de voces; conviene revisar antes de desplegar en producción.
- Riesgo de alucinación en sentido TTS: pronunciación incorrecta de nombres propios, siglas, números y palabras fuera del dominio de entrenamiento; se recomienda normalización de texto previa.
- Sin datos sobre sesgos de acento o género vocal, ni sobre rendimiento fuera del hardware de referencia (Ryzen 5 3500X); el RTF en otras CPU o en ARM no está medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/SupraTTS-1.0-Preview
- Modelo predecesor (SupraTTS-0.1-Beta): https://huggingface.co/SupraLabs/SupraTTS-0.1-Beta
- Perfil del autor: https://huggingface.co/arthurblg1802
- sanoTTS (referencia de comparativa): https://huggingface.co/ampixa/sanoTTS
- Muestra de audio: https://huggingface.co/SupraLabs/SupraTTS-1.0-Preview/resolve/main/samples/showcase.wav
- Conjunto de evaluación citado en el repo: `benchmark/eval_sentences.txt` (incluido en el repositorio del modelo)
- Script de medición de velocidad: `benchmark/rtf.py` (incluido en el repositorio del modelo)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card. No se dispone de paper, blog técnico ni demo independiente.
