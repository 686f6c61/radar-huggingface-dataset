# thelarryproject/larry-speech-encoder

## Resumen

larry-speech-encoder es un codificador de unidades de voz (speech unit ID encoder) desarrollado por thelarryproject, un proyecto independiente que entrena modelos de voz desde cero. El modelo no es un sistema de reconocimiento de voz (ASR) de propósito general, sino un componente intermedio: convierte audio en una secuencia de identificadores discretos (códigos FSQ) que un decodificador posterior puede usar para reconstruir voz con clonación de hablante. La cabeza CTC que incorpora es únicamente una tarea proxy para alinear características de voz durante el entrenamiento.

Arquitectónicamente es un transformer de 163.618.694 parámetros con frontend log-mel, submuestreo convolucional (de 100 Hz a 25 Hz, y a 12,5 Hz tras la tercera capa), dos pilas de 6 capas encoder con atención no causal, una capa de cuantización FSQ con codebook de 15.360 códigos y una cabeza CTC sobre un vocabulario SentencePiece. Se entrenó con aproximadamente 3,66 mil millones de tokens CTC sobre unos 40.000 horas de audio en inglés (Libriheavy, Common Voice 27, SCOTUS, VCTK, LJSpeech y HiFi-TTS v1).

Su relevancia es acotada pero específica: sirve como primer eslabón de una cadena TTS con clonación de voz, al estilo del tokenizador de CosyVoice2, cuya implementación aproxima. Es un modelo de fase 1, con licencia CC-BY-4.0, publicado con 0 descargas y 1 like en el momento de la consulta, y no está pensado ni soportado para ASR directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no causal con frontend log-mel, submuestreo convolucional, capas SAN-M con FSMN, cuantizacion FSQ y cabeza CTC |
| Parametros totales | 163.618.694 (163,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo encadena, en orden: un frontend log-mel a 100 Hz; un submuestreo convolucional que reduce la señal a 25 Hz (factor 4); una pila encoder1 de 6 capas transformer con atención no causal estilo SAN-M, que sustituye la atención multi-cabeza tradicional por capas FSMN con memoria convolucional (kernel 31 antes del merge y 15 después) y aplica un segundo submuestreo a 12,5 Hz tras la tercera capa; una capa FSQ que cuantiza en un codebook fijo de 15.360 códigos; una pila encoder2 de 6 capas transformer con MHA convencional; y una cabeza CTC sobre el vocabulario del tokenizador SentencePiece empaquetado más un token blank. El código es una aproximación propia al usado en CosyVoice2, no una copia directa.

El entrenamiento usó Libriheavy (~37.000 h), Common Voice 27.0 (~1.800 h), SCOTUS (~1.100 h), VCTK (~39,3 h), LJSpeech (~23,7 h) y HiFi-TTS v1 (~289,8 h), con splits de validación disjuntos por hablante en CV27, SCOTUS, VCTK y LibriSpeech (Libriheavy y HiFi-TTS comparten hablantes entre train y validación). Se procesaron 3.658.563.934 tokens CTC SentencePiece. No se documenta RLHF, DPO ni ajuste por preferencias, lo cual es coherente con la naturaleza no generativa del modelo.

## Capacidades

- Extracción de identificadores discretos de voz (speech unit IDs) mediante cuantización FSQ con 15.360 códigos.
- Codificación de características acústicas y lingüísticas útiles para reconstrucción de voz por un decodificador posterior.
- Alineación CTC como tarea proxy, con decodificación greedy funcional pero no soportada para producción.
- Procesamiento de audio en inglés con normalización de transcripciones estilo Whisper para evaluación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multimodal en el sentido habitual: no procesa imagen, vídeo ni texto generativo.
- No dispone de modo thinking ni de salidas de audio; solo produce códigos y logits CTC.

## Casos de uso

- Tokenizador de voz para TTS con clonación: el modelo genera unit IDs que un decodificador (con representación de hablante y condicionamiento F0/armónicos) convierte en habla sintética con timbre similar al original; es su uso previsto y el único soportado explícitamente.
- Investigación en tokenizadores de voz: permite estudiar el comportamiento de un codebook FSQ de 15.360 entradas con perplejidad 5.827 y cobertura del 99,9 %, como referencia para comparar diseños de cuantización.
- Pipeline de síntesis por etapas: se integra como primer módulo en una arquitectura tipo CosyVoice2, separando la representación discreta del audio de la generación final.
- Experimentación con atención FSMN: su combinación de SAN-M con memoria convolucional y MHA convencional sirve para estudiar alternativas a la atención estándar en codificadores de voz.
- Generación de datos sintéticos de voz para aumento de corpus: combinado con un decodificador entrenado, puede producir variantes de habla controladas por hablante y prosodia.
- Evaluación comparativa de frontends acústicos: su WER proxy por conjunto (por ejemplo, 0,51 % en HiFi-TTS o 13,4 % en CV27) permite calibrar la calidad de la representación antes de invertir en un decodificador.

## Benchmarks y rendimiento

Resultados publicados por el autor; miden únicamente la tarea proxy CTC con decodificación greedy y normalización estilo Whisper, no el rendimiento del codificador como ASR.

| Conjunto de validacion | WER normalizado |
|---|---|
| Promedio ponderado | ~5,52 % |
| Common Voice 27 | ~13,4 % |
| HiFi-TTS v1 | ~0,510 % |
| Libriheavy test-clean-large | ~3,39 % |
| Libriheavy test-other-large | ~6,56 % |
| LibriSpeech ASR | ~5,00 % |
| SCOTUS | ~4,33 % |
| VCTK | ~1,27 % |

| Metrica del codebook FSQ | Valor |
|---|---|
| Perplejidad | 5.827 |
| Uso de codigos | 0,999 (99,9 %; ~15 codigos sin aparecer) |
| Tamano del codebook | 15.360 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 0,65 GB solo para pesos; en FP16/BF16, unos 0,33 GB; con overhead de activaciones y buffers, cabe holgadamente en 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería `larry` del propio proyecto; al ser safetensors estándar, puede cargarse con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador de voz con cabeza CTC.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larry-speech-encoder | 163,6 M | No disponible | Codificador de unidades de voz + CTC proxy | CC-BY-4.0 | HuggingFace (0 descargas) |
| Tokenizador de CosyVoice2 | No disponible | No disponible | Tokenizador de voz para TTS | Apache-2.0 (codigo) | GitHub QwenAudio/CosyVoice |
| HuBERT / Wav2Vec2 (base) | ~95 M | No disponible | Representaciones de voz auto-supervisadas | MIT / Apache-2.0 | HuggingFace |

La comparación con CosyVoice2 es la más pertinente porque el autor declara que su código aproxima el tokenizador de ese sistema; los datos concretos de parámetros y contexto de ese tokenizador no están disponibles en la información consultada. Frente a HuBERT o Wav2Vec2, la diferencia clave es que larry-speech-encoder produce códigos discretos listos para un decodificador TTS, no representaciones continuas para tareas downstream.

## Limitaciones y advertencias

- No está soportado para ASR ni para alineación CTC: la capa de cuantización degrada la señal y el WER de ~5,52 % es solo una medida proxy.
- Solo inglés; no se documenta cobertura multilingüe.
- Sesgos: el entrenamiento está dominado por Libriheavy (~37.000 h de ~40.000 h totales), lo que puede sesgar hacia el dominio de lectura de audiolibros y hacia los hablantes de ese corpus; Common Voice 27 muestra el peor WER (~13,4 %), indicativo de menor robustez en habla espontánea y acentos diversos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la decodificación CTC puede producir secuencias plausibles incorrectas; no debe usarse como transcriptor.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; hay que citar también CosyVoice (Du et al., 2024) según pide el autor.
- Caveat de producción: es un modelo de fase 1, con 0 descargas y 1 like, sin estudio publicado sobre el impacto de la cuantización en la calidad final; requiere un decodificador externo entrenado para producir audio.
- Dependencia de la librería `larry` y de configuraciones YAML del repositorio del proyecto; la portabilidad a otros frameworks no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thelarryproject/larry-speech-encoder
- Repositorio del proyecto: https://github.com/Mekadrom/larry
- CosyVoice (código de referencia): https://github.com/QwenAudio/CosyVoice
- Paper CosyVoice: https://arxiv.org/abs/2407.05407
- Paper CosyVoice 2: https://arxiv.org/abs/2412.10117
- Paper adicional citado en los tags: https://arxiv.org/abs/2505.17589
- Dataset SCOTUS ASR: https://huggingface.co/datasets/thelarryproject/scotus-index-asr
- Dataset VCTK normalizado: https://huggingface.co/datasets/thelarryproject/vctk-normalized-asr
- Dataset Libriheavy large index ASR: https://huggingface.co/datasets/thelarryproject/libriheavy-large-index-asr
- Dataset Common Voice 27 index ASR: https://huggingface.co/datasets/thelarryproject/common-voice-27-index-asr
