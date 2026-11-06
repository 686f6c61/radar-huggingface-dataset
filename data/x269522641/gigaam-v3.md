# x269522641/GigaAM-v3

## Resumen

GigaAM-v3 es un modelo fundacional de reconocimiento automático del habla (ASR) basado en arquitectura Conformer, con entre 220 y 240 millones de parámetros, desarrollado por el equipo de Sber (Salute Developers) como tercera generación de la familia GigaAM. Está especializado en ruso, aunque declara soporte para inglés, y se preentrena con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso. El modelo se distribuye en cinco variantes: `ssl` (encoder auto-supervisado), `ctc` y `rnnt` (ASR con decodificadores CTC y RNN-T respectivamente) y `e2e_ctc`/`e2e_rnnt` (variantes end-to-end que generan texto con puntuación y normalización).

La relevancia de esta versión radica en la incorporación de nuevos dominios internos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas (incluyendo habla con trastornos). Según la model card, el modelo mejora un 30 % de media en estos dominios manteniendo la calidad de generaciones anteriores en benchmarks públicos. En la comparativa publicada, GigaAM-v3 logra un WER medio del 8,4 % (variante RNN-T) frente al 19,4 % de T-One + LM y el 25,1 % de Whisper.

El modelo se publica bajo licencia MIT, con pesos en formato PyTorch y código personalizado (`trust_remote_code=True`). El repositorio de Hugging Face ocupa 0,4 GB, lo que sugiere pesos ligeros y facilidad de despliegue en hardware modesto. Está pensado para integrarse en pipelines de transcripción en producción, especialmente en contextos rusoparlantes donde Whisper rinde claramente peor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con decodificadores CTC y RNN-T |
| Parámetros totales | 220–240 M (según variante) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (principal), inglés (declarado) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

GigaAM-v3 emplea un encoder Conformer, una arquitectura que combina bloques de autoatención con convoluciones profundas para capturar dependencias locales y globales en la señal de audio. El preentrenamiento sigue el objetivo HuBERT-CTC, una variante de aprendizaje auto-supervisado que enmascara unidades acústicas y entrena al modelo a predecirlas mediante una cabeza CTC. El encoder `ssl` se preentrena sobre 700.000 horas de habla en ruso, una cantidad muy superior a la de muchos modelos ASR multilingües.

Sobre ese encoder se afinan las variantes supervisadas: `ctc` y `rnnt` con sus respectivos decodificadores, y `e2e_ctc`/`e2e_rnnt` que añaden puntuación y normalización de texto de forma nativa. La model card menciona la incorporación de nuevos conjuntos internos (call center, habla con música, habla natural y habla atípica) que explican la mejora del 30 % en esos dominios. No se detalla en la información disponible el número exacto de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo ASR pero no confirmado.

## Capacidades

- Reconocimiento automático del habla en ruso con calidad estado del arte en dominios diversos (lectura, habla natural, call center, habla con música, habla atípica).
- Transcripción con decodificación CTC o RNN-T según la variante elegida.
- Generación de texto con puntuación y normalización directamente en las variantes `e2e_ctc` y `e2e_rnnt`, sin postprocesado externo.
- Preentrenamiento auto-supervisado reutilizable: el encoder `ssl` puede servir como base para fine-tuning en tareas de habla adicionales.
- Soporte declarado de inglés, aunque el foco y los datos de entrenamiento son rusos.
- API de inferencia simple mediante `model.transcribe("example.wav")`.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá de ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y llamadas en ruso: las variantes `e2e_rnnt` generan texto puntuado y normalizado directamente, lo que reduce el postprocesado en herramientas de actas automáticas.
- Atención al cliente y análisis de call centers: el modelo se entrenó específicamente con conversaciones de call center y logra un WER del 9,5 % (RNNT) frente al 13,5 % de T-One + LM y el 23,9 % de Whisper, lo que lo hace adecuado para monitorización de calidad y análisis de sentimiento sobre transcripciones.
- Subtitulado y accesibilidad: la baja latencia esperable de un modelo de 220–240 M permite transcripción en tiempo casi real en servidores modestos, útil para subtítulos automáticos en ruso.
- Transcripción de audio con música o ruido de fondo: el entrenamiento con habla sobre música mejora el rendimiento en podcasts, vídeos y retransmisiones donde otros ASR fallan.
- Herramientas de accesibilidad para habla atípica: el modelo reporta un WER del 19,2 % (RNNT) en habla con trastornos, frente al 51–59 % de los competidores, lo que lo hace viable para aplicaciones asistivas.
- Generación de datasets de habla: el encoder `ssl` puede usarse como extractor de representaciones para entrenar clasificadores de habla, diarización o detección de emociones con pocos datos etiquetados.
- Integración en pipelines de transcripción masiva: el tamaño reducido (0,4 GB) permite desplegar varias instancias por GPU y procesar grandes volúmenes de audio por hora.

## Benchmarks y rendimiento

Resultados de Word Error Rate (%) publicados en la model card:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

Además, en la comparación end-to-end de `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3, usando Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan con un margen medio de 70:30. No se proporcionan resultados de MMLU, HumanEval ni GSM8K por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para un modelo de 220–240 M de parámetros; en fp16 alrededor de 0,5 GB, más el overhead de activaciones y decodificador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son válidas. El modelo es lo bastante pequeño para ejecutarse en CPU con latencia aceptable.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al usar `trust_remote_code=True`, la vía principal es `transformers` con PyTorch 2.8 y torchaudio 2.8; también puede exportarse a TorchScript/ONNX para servir con Triton o similares. No se documenta soporte nativo de vLLM, llama.cpp ni Ollama (son motores orientados a LLM, no a ASR).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (benchmark propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-v3 (RNNT) | 220–240 M | no disponible | 8,4 % | MIT | Hugging Face |
| Whisper (large-v3) | ~1.550 M | 30 s de audio | 25,1 % | MIT | Hugging Face, OpenAI |
| T-One + LM | no disponible | no disponible | 19,4 % | no disponible | no disponible |

GigaAM-v3 ofrece un WER sustancialmente menor que Whisper en ruso con una fracción de los parámetros, a costa de un soporte multilingüe mucho más limitado (ruso e inglés declarados frente a la cobertura amplia de Whisper). T-One + LM queda por detrás en todos los conjuntos reportados. No se dispone de comparación con otros ASR rusos como Vosk o Silero en la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado para ruso; el soporte de inglés está declarado pero no se aportan métricas que lo respalden.
- Riesgo de alucinación y errores en audio muy ruidoso o con solapamiento de hablantes; el WER en habla atípica sigue siendo del 19–20 %, aceptable pero no perfecto.
- No se documentan sesgos específicos, pero al entrenarse con 700.000 horas de habla rusa puede heredar sesgos dialectales, de género o de dominio presentes en esos datos.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar las licencias de los datasets de entrenamiento originales, no detalladas en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- Dependencias sensibles a versiones concretas (torch 2.8.0, transformers 4.57.1, pyannote-audio 4.0.0, torchcodec 0.7.0), lo que puede complicar la integración en entornos existentes.
- No se especifican la longitud máxima de audio procesable ni la estrategia de chunking; para audios largos habrá que segmentar manualmente.
- El repositorio tiene muy pocas descargas (17) y ningún like en el momento de la consulta; la ruta del autor en Hugging Face (`x269522641`) no coincide con la oficial (`ai-sage`) que aparece en el código de ejemplo, lo que conviene verificar antes de confiar en esta copia concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/x269522641/GigaAM-v3
- Repositorio oficial (referenciado en la model card): https://github.com/salute-developers/GigaAM
- Métricas detalladas: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Ejemplo de uso en Colab: https://github.com/salute-developers/GigaAM/blob/main/colab_example.ipynb
- Paper (InterSpeech 2025): https://arxiv.org/abs/2506.01192
