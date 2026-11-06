# SpeechAntiSpoofingBenchmarks/SSL-Mamba

## Resumen

SSL-Mamba es un detector de audio falsificado (*anti-spoofing*) desarrollado por Hoan My Tran et al. y publicado en Interspeech 2025. El modelo resuelve el problema de distinguir voz real (*bona fide*) de voz sintetica o convertida por sistemas de sintesis de voz (TTS) y conversion de voz (VC). Su relevancia radica en que combina un front-end auto-supervisado de gran escala (wav2vec 2.0 XLS-R 300M) con un backend basado en modelos de espacio de estados (Mamba), una alternativa eficiente a los Transformers para modelar secuencias largas de audio.

La arquitectura es un hibrido: un extractor XLS-R congelado en su nucleo pero afinado completamente, seguido de agregacion auto-gated de 25 capas ocultas, un modulo de fusion MultiConv cgMLP con kernels multiples, 12 bloques residuales Mamba unidireccionales y un pooling por atencion multi-cabeza. El checkpoint incluido en este repositorio (317,5 M de parametros) corresponde al modelo oficial de los autores entrenado sobre ASVspoof 2019 LA.

Este repositorio es un *wrapper* de empaquetado para la Speech Anti-Spoofing Arena, no el repositorio original de los autores. Incluye el checkpoint en `safetensors` y resultados de evaluacion en multiples conjuntos de datos (ASVspoof 2019/2021/5, InTheWild, ADD, DeepVoice, HABLA, entre otros), lo que lo convierte en un punto de partida practico para reproducir o comparar sistemas de deteccion de deepfakes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: wav2vec 2.0 XLS-R 300M (front-end) + MultiConv cgMLP + 12 bloques residuales Mamba v1 + attention pooling |
| Parametros totales | 317.521.282 (0,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud del audio de entrada; sin limite documentado) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible (el front-end XLS-R es multilingue, pero el entrenamiento se realizo solo sobre ASVspoof 2019 LA, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32), libreria PyTorch |

## Arquitectura y entrenamiento

El modelo sigue un diseno en cascada. El front-end es un wav2vec 2.0 XLS-R de 300 M de parametros afinado completamente. De sus 25 estados ocultos se extrae una proyeccion a 128 dimensiones mediante Linear + SiLU, y se suman con un mecanismo de agregacion auto-gated (*self-gated layer aggregation*), de modo que el modelo aprende que capas contribuyen mas a la deteccion. A continuacion, un modulo de fusion MultiConv cgMLP con kernels de convolucion de tamanos 7, 15, 23 y 31 captura patrones espectrales a multiples escalas temporales.

La parte secuencial la resuelven 12 bloques residuales Mamba (v1, *selective state space model*) unidireccionales con LayerNorm, que modelan dependencias de largo alcance con coste lineal en la longitud de la secuencia, en lugar del coste cuadratico de la atencion. La clasificacion final usa un *multi-head attention pooling* de 4 cabezas con estadisticos de media y desviacion tipica, seguido de una cabeza de 2 clases (bona fide / spoof). El entrenamiento se realizo exclusivamente sobre el conjunto de entrenamiento de ASVspoof 2019 LA; no se documenta en la informacion disponible el uso de RLHF, DPO ni datos adicionales.

## Capacidades

- Deteccion binaria de voz real frente a voz sintetica o convertida (TTS y VC).
- Puntuacion continua: valores mas altos indican mayor probabilidad de *bona fide*, lo que permite fijar umbrales segun el coste de falsos positivos y falsos negativos.
- Procesamiento de audio de duracion variable mediante el front-end XLS-R, con modelado de dependencias temporales largas gracias a los bloques Mamba.
- Evaluacion cruzada en dominios muy diversos: ASVspoof 2019/2021/5, InTheWild, ADD 2022/2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW, ODSS, HABLA y DFADD.
- No soporta tool calling, function calling, agentes ni generacion de texto: es un clasificador de audio, no un modelo generativo.
- Capacidad multilingue no documentada de forma explicita; el front-end XLS-R esta preentrenado en 128 idiomas, pero el ajuste se hizo solo con datos en ingles.

## Casos de uso

- Verificacion de autenticidad en llamadas telefonicas: integrar el modelo en una pasarela de telefonia VoIP para puntuar cada segmento de audio y marcar llamadas con alta probabilidad de voz sintetica antes de transferirlas a un agente humano.
- Moderacion de contenido en plataformas de audio: analizar podcasts, notas de voz y audios subidos por usuarios para detectar deepfakes de voz y priorizar revision manual en los casos con puntuacion ambigua.
- Proteccion de sistemas de verificacion biomedica por voz: usar el detector como capa previa al reconocimiento de locutor, de modo que una voz sintetizada no pueda suplantar a un usuario legitimo.
- Monitorizacion de medios y desinformacion: procesar lotes de audio de redes sociales o archivos de prensa para identificar clips manipulados, usando el umbral de EER como referencia de calibracion.
- Evaluacion de sistemas TTS y VC: emplear el modelo como metrica automatica de naturalidad y fidelidad, midiendo la tasa de deteccion de los audios generados por un sistema propio durante su desarrollo.
- Investigacion en forense de audio: generar puntuaciones por segmento para localizar tramos manipulados dentro de una grabacion larga, aprovechando el modelado secuencial de Mamba.
- Despliegue en produccion con TensorRT: el autor documenta una clase *drop-in* en TensorRT con FP32 que reproduce los resultados de PyTorch, adecuada para inferencia de baja latencia en GPUs consumer.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son *spoof-only* y usan 1-SRR% en el umbral EER de DeepVoice.

| Conjunto de datos | EER% |
|---|---|
| ASVspoof2019_LA | 0,27 |
| ASVspoof2021_LA | 6,36 |
| ASVspoof2021_DF | 3,41 |
| ASVspoof5 | 14,16 |
| InTheWild | 5,83 |
| ADD22_eval_31 | 15,72 |
| ADD2023_track12_test_r1 | 24,08 |
| CFAD | 14,55 |
| CD-ADD | 16,71 |
| CVoiceFake_small | 14,43 |
| DeepVoice | 27,25 |
| LibriSeVoc | 2,50 |
| SONAR | 31,57 |
| ArAD | 22,59 |
| DECRO | 15,51 |
| J-SPAW_LA | 5,88 |
| ODSS | 22,74 |
| HABLA | 1,56 |
| DFADD | 7,30 |

No se han publicado en la informacion disponible comparaciones numericas directas con otros sistemas de la arena (ranking, tier ni puntuaciones de modelos alternativos).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (317,5 M x 4 bytes), mas activaciones y buffers del front-end XLS-R; en la practica se recomienda reservar 3-4 GB.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti son las documentadas por el autor para la ruta TensorRT en FP32; cualquier GPU con al menos 6-8 GB de VRAM es suficiente.
- Cabe en GPUs consumer: si, incluidas RTX 3060, RTX 4060 y superiores; tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: PyTorch nativo (wrapper del repositorio) y clase TensorRT *drop-in* documentada por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica; el autor indica que la version TensorRT en FP32 iguala a PyTorch en el conjunto completo J-SPAW_LA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSL-Mamba (este) | 317,5 M | audio variable | XLS-R + Mamba | Apache 2.0 | Hugging Face, safetensors |
| XLSR-Mamba (Xiao & Das) | no disponible | no disponible | XLS-R + Mamba (modelo distinto, frecuentemente confundido) | no disponible | no disponible en la informacion |
| AASIST y variantes | no disponible | audio variable | Grafos espectro-temporales | no disponible | no disponible en la informacion |

La model card advierte explicitamente de que SSL-Mamba no debe confundirse con XLSR-Mamba (Xiao & Das), un modelo diferente pese a la similitud de nombre. No se dispone de datos numericos de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente sobre ASVspoof 2019 LA (ingles, condiciones de grabacion controladas); el rendimiento cae de forma notable en dominios alejados, con EER de 31,57 en SONAR, 27,25 en DeepVoice y 24,08 en ADD2023.
- Riesgo de sesgo hacia las condiciones acusticas y los codificadores del corpus de entrenamiento; puede degradarse con microfonos, codecs o idiomas no representados.
- No es un modelo generativo: no produce texto ni razonamiento; cualquier uso fuera de la clasificacion de audio es inadecuado.
- La puntuacion es un valor continuo dependiente del umbral; en produccion es imprescindible calibrar el umbral con datos propios y monitorizar falsos positivos y falsos negativos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda citar el paper original de Interspeech 2025 y verificar los terminos de los corpus de evaluacion empleados.
- El repositorio es un empaquetado de terceros para la arena, no el repositorio oficial de los autores; para reproducibilidad conviene fijar el commit del checkpoint (`3565084c8f0125b48ca79525674a05167638e40a`).
- No se documentan tecnicas de cuantizacion ni versiones GGUF/ONNX; el despliegue en entornos sin PyTorch o TensorRT requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/SSL-Mamba
- Checkpoint fijado por commit: https://huggingface.co/SpeechAntiSpoofingBenchmarks/SSL-Mamba/blob/3565084c8f0125b48ca79525674a05167638e40a/model.safetensors
- Paper (Interspeech 2025): https://www.isca-archive.org/interspeech_2025/tran25b_interspeech.html
- Codigo de los autores: https://github.com/hoanmyTran/spoofing_ssl_mamba
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Arena, vista del sistema SSL-Mamba: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=ssl-mamba
- Organizacion en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks
