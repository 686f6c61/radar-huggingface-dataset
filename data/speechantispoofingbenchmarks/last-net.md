# SpeechAntiSpoofingBenchmarks/LaST-Net

## Resumen

LaST-Net (Length-Aware Layer and Scale-Adaptive Temporal Network) es un sistema de deteccion de voz sintetica y deepfakes de audio desarrollado por Jun Xue (2026). Se trata de un modelo de anti-spoofing de habla construido sobre un front-end fairseq XLS-R de 300M de parametros afinado, cuyas 24 salidas de capas transformer se fusionan mediante un router de capas condicionado por longitud y contenido. El modelo esta empaquetado para la Speech Anti-Spoofing Arena, un banco de evaluacion comparativa de sistemas de deteccion de voz falsa.

La relevancia del modelo radica en su rendimiento en el conjunto de referencia ASVspoof 2019 LA, donde alcanza un EER del 0,09%, y en ASVspoof 2021 DF con un 2,7% de EER. Sin embargo, su generalizacion a dominios fuera de distribucion es limitada, con EER superiores al 20% en conjuntos como SONAR, DeepVoice o CD-ADD. El modelo ocupa la tier de "no publicado" en la Arena (se muestra pero no se clasifica) al no existir paper asociado.

Los pesos no se rehostean en este repositorio por falta de licencia de los autores; el wrapper solo proporciona el codigo de inferencia y la integracion con la Arena. La licencia del repositorio es MIT, pero los pesos deben obtenerse del checkpoint original de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end fairseq XLS-R 300M (24 capas transformer) con router de capas condicionado por longitud y contenido, proyeccion a 192-d, procesamiento multi-escala temporal (1x, 1/2, 1/4), bloques residuales depthwise dilatados, pooling estadistico atencional y cabeza MLP de 2 vias |
| Parametros totales | 316,96 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 segundos de audio (64.000 muestras a 16 kHz); clips mas cortos se repiten y recortan |
| Tipos de cuantizacion | no disponible (inferencia en FP32, TF32 desactivado) |
| Idiomas soportados | no disponible (depende del corpus de entrenamiento; ASVspoof 2019 LA es principalmente ingles) |
| Licencia | MIT (repositorio); pesos no rehosteados, requieren checkpoint de los autores |
| Formato de pesos | checkpoint PyTorch (`best.pt`) alojado externamente; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

LaST-Net parte de un front-end XLS-R de 300M de parametros afinado con fairseq. Las 24 salidas de capas transformer no se colapsan en una sola representacion: un router de capas condicionado por la longitud del clip y su contenido las fusiona de forma adaptativa. La representacion resultante se proyecta a 192 dimensiones y se procesa a tres escalas temporales (1x, 1/2 y 1/4) mediante un bloque de kernels selectivos por longitud y bloques residuales depthwise dilatados con dos etapas de intercambio de escala con prior de longitud. Cada escala pasa por un pooling estadistico atencional y una cabeza MLP de dos clases (bona fide vs. spoof). El modelo recibe ademas la duracion disponible del clip como caracteristica de longitud.

El entrenamiento se realizo sobre la particion de entrenamiento de ASVspoof 2019 LA, usando la particion de desarrollo para seleccion de checkpoint, con consistencia de prediccion emparejada RawBoost-4. El checkpoint liberado corresponde a la epoca 52. La inferencia replica el `infer.py` de los autores: 16 kHz, sin normalizacion, primeras 64.000 muestras (4 s), clips mas cortos repetidos con `np.tile` y recortados, y la duracion disponible calculada como `min(len, 64000)/16000`. La puntuacion final es `log_softmax(logits)[:, 1]`, donde valores mas altos indican audio bona fide.

## Capacidades

- Deteccion binaria de audio bona fide frente a audio sintetico o manipulado (anti-spoofing, deteccion de deepfake de voz).
- Puntuacion continua por clip (log-softmax de la clase bona fide) utilizable para umbralizar.
- Procesamiento de clips de hasta 4 segundos con manejo explicito de duraciones mas cortas mediante repeticion y recorte.
- Uso de la duracion disponible como caracteristica de entrada, lo que permite adaptar el comportamiento a clips truncados.
- Integracion con la Speech Anti-Spoofing Arena para evaluacion comparativa estandarizada.
- Implementacion TensorRT drop-in disponible (clase alternativa) con equivalencia verificada frente a PyTorch en J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999).
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo: es exclusivamente un clasificador de autenticidad de voz.

## Casos de uso

- Verificacion anti-fraude en call centers: integrar el modelo como filtro previo a la autenticacion por voz para detectar audio sintetico generado con TTS o voice conversion antes de conceder acceso a un servicio.
- Moderacion de contenido en plataformas de audio: puntuar automaticamente clips subidos por usuarios y marcar aquellos con alta probabilidad de ser deepfakes para revision humana.
- Deteccion de deepfakes en medios y periodismo: analizar fragmentos de audio de declaraciones publicas y obtener una puntuacion de autenticidad como senal auxiliar en el proceso de verificacion.
- Evaluacion de sistemas TTS y voice conversion: usar el modelo como discriminador de referencia en pipelines de investigacion para medir la naturalidad y detectabilidad de voces generadas.
- Benchmarking de sistemas anti-spoofing: emplear el wrapper y el checkpoint para reproducir resultados de la Arena y comparar con otros sistemas en las mismas particiones de evaluacion.
- Despliegue en produccion con TensorRT: la clase drop-in permite servir el modelo con latencia reducida en GPUs consumer (RTX 4070 Ti SUPER, RTX 5060 Ti) manteniendo equivalencia con PyTorch.
- Investigacion en robustez de anti-spoofing: analizar el comportamiento del modelo en dominios fuera de distribucion (SONAR, DeepVoice, CD-ADD) para estudiar la generalizacion de front-ends XLS-R.

## Benchmarks y rendimiento

Resultados de la Speech Anti-Spoofing Arena. EER% (menor es mejor); EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% en el umbral EER de DeepVoice.

| Conjunto de evaluacion | EER% |
|---|---|
| ASVspoof2019_LA | 0,09 |
| ASVspoof2021_LA | 6,01 |
| ASVspoof2021_DF | 2,70 |
| ASVspoof5 | 21,86 |
| InTheWild | 6,47 |
| ADD22_eval_31 | 18,18 |
| ADD2023_track12_test_r1 | 23,43 |
| CFAD | 18,59 |
| CD-ADD | 26,36 |
| CVoiceFake_small | 18,89 |
| DeepVoice | 26,98 |
| LibriSeVoc | 2,73 |
| SONAR | 29,29 |
| ArAD | 24,66 |
| DECRO | 16,08 |
| J-SPAW_LA | 14,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para pesos en FP32 (316,96 M parametros); con activaciones y buffers de inferencia, el consumo real es mayor pero holgado en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32; el modelo se ha validado en RTX 4070 Ti SUPER, RTX 5060 Ti y RTX 4060 Ti.
- Cabe en GPU consumer: si, incluidas RTX 4060 Ti y RTX 5060 Ti.
- Opciones de despliegue: PyTorch (implementacion de referencia), TensorRT (clase drop-in validada). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles de forma numerica; la equivalencia TensorRT frente a PyTorch en J-SPAW_LA sugiere que el backend acelerado es viable en produccion, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de otros sistemas de la Arena en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica con alternativas concretas. Como referencia cualitativa, LaST-Net comparte categoria con los sistemas anti-spoofing basados en front-ends XLS-R/WavLM afinados (AASIST, RawNet2, ECAPA-TDNN), pero no se han facilitado sus resultados en esta ficha.

| Modelo | Parametros | Contexto | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaST-Net | 316,96 M | 4 s de audio | 0,09% | MIT (repo); pesos externos | Checkpoint de los autores + wrapper Arena |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos no se rehostean en el repositorio por falta de licencia de los autores; es necesario descargar el checkpoint externo y verificar su sha256.
- No existe paper asociado: el modelo esta en la tier "no publicado" de la Arena y no se clasifica frente a otros sistemas.
- Generalizacion limitada fuera de distribucion: EER superiores al 20% en SONAR (29,29%), DeepVoice (26,98%), CD-ADD (26,36%), ArAD (24,66%), ASVspoof5 (21,86%) y ADD2023_track12_test_r1 (23,43%).
- Entrenado unicamente con ASVspoof 2019 LA train; el sesgo hacia ese dominio y hacia el ingles puede degradar el rendimiento en otros idiomas y condiciones acusticas.
- Entrada fija de 4 segundos: clips mas largos se truncan y clips mas cortos se repiten, lo que puede alterar la distribucion acustica y la puntuacion.
- Riesgo de falsos positivos y negativos en audio con ruido, reverberacion o codecs agresivos no representados en entrenamiento.
- No apto para generacion de texto, codigo, razonamiento ni tareas multimodales; su unico proposito es la clasificacion de autenticidad de voz.
- La licencia MIT cubre el codigo del wrapper, no necesariamente los pesos, cuyo uso comercial debe consultarse con los autores.
- En produccion, calibrar el umbral de decision sobre datos propios: la puntuacion es un log-softmax y no una probabilidad calibrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/LaST-Net
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Codigo de los autores (GitHub): https://github.com/JunXue-tech/LaST-Net/tree/3838f0c7108313f771f6c1e208ac8f1e3bde60b0
- Checkpoint de los autores: https://huggingface.co/JunXueTech/LaST-Net/blob/7b18ff0abff078c60745aaaaf5165e3f9542fa1b/best.pt
- Resultados por conjunto en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=last-net
