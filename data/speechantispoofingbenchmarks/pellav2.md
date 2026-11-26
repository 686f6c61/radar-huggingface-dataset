# SpeechAntiSpoofingBenchmarks/Pellav2

## Resumen

Pellav2 es un detector de audio deepfake (anti-spoofing) de pesos abiertos publicado por Sadanie en agosto de 2026 y reempaquetado por SpeechAntiSpoofingBenchmarks para el banco de pruebas Speech Anti-Spoofing Arena. El modelo recibe una señal de voz a 16 kHz y emite un logit que indica la probabilidad de que la grabación sea sintética (fake) frente a genuina (bona fide). Resuelve el problema de verificar la autenticidad de audio en un contexto de proliferación de voces clonadas mediante TTS y conversión de voz.

Arquitectura basada en un encoder w2v-BERT 2.0 de tipo conformer con 24 capas, afinado sobre características log-mel fbank kaldi de 80 bins. Cuenta con 580,49 millones de parámetros, un tamaño de repo de 2,4 GB y pesos en formato safetensors. El contexto de entrada efectivo es un recorte central de 4 segundos (64.000 muestras), con relleno de ceros para clips más cortos.

Su relevancia actual radica en los resultados publicados en el Arena: EER del 1,1% en ASVspoof2019_LA, 3,17% en ASVspoof2021_LA y 1,18% en ASVspoof2021_DF, si bien el modelo está clasificado en el tier no publicado del Arena por carecer de paper y de datos de entrenamiento declarados. La licencia es MIT, lo que facilita su uso comercial, aunque la opacidad del dataset de entrenamiento introduce incertidumbre sobre posible leakage.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 conformer encoder (24 capas, fine-tuned) con masked mean pooling y cabeza Linear(1024,1) |
| Parametros totales | 580,49 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | recorte central de 4 s (64.000 muestras a 16 kHz); clips más cortos con zero-padding |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; existe wrapper TensorRT en FP32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pellav2_detector.safetensors) |

## Arquitectura y entrenamiento

El modelo es un clasificador binario construido sobre un encoder w2v-BERT 2.0 de tipo conformer con 24 capas, afinado para la tarea de detección de spoofing. La entrada se procesa como características log-mel fbank kaldi de 80 bins multiplicadas por 32768, normalizadas por media y varianza a nivel de utterance, con pares de frames apilados para dar 160 dimensiones y recorte del silencio digital final. Sobre las representaciones del encoder se aplica una mezcla ponderada por softmax de los 25 estados ocultos, seguida de masked mean pooling y una capa lineal de 1024 a 1 que produce el logit de fake.

El pipeline de inferencia del autor (pellav2_infer.py) especifica: remuestreo a 16 kHz, eliminación de media, filtro paso alto de 20 Hz (Butterworth de segundo orden en fase cero), recorte central de 4 s (64.000 muestras), normalización de sonoridad ITU-R BS.1770 a -23 LUFS (semántica de pyloudnorm) y zero-padding para clips más cortos. La puntuación final es -logit(fake), de modo que valores más altos indican audio bona fide. La inferencia se ejecuta en FP32 con TF32 desactivado.

No se ha publicado información sobre el conjunto de entrenamiento: no hay paper y la model card no detalla datos, número de tokens ni si hubo RLHF/DPO. El propio Arena advierte que no se puede descartar leakage, dado que las puntuaciones en J-SPAW_LA están perfectamente separadas (EER 0%).

## Capacidades

- Detección binaria de audio sintético frente a voz genuina, con salida en forma de logit y puntuación -logit(fake).
- Procesamiento de voz a 16 kHz con normalización de sonoridad y filtrado paso alto integrados en el pipeline de inferencia.
- Manejo de clips de duración variable mediante recorte central a 4 s y zero-padding.
- Integración con TensorRT: el wrapper drop-in en FP32 sobre RTX 4070 Ti SUPER y RTX 5060 Ti coincidió con PyTorch en el conjunto completo J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999).
- No soporta tool calling, function calling, agentes, multi-step reasoning ni generación de texto.
- No dispone de capacidades multimodales más allá del audio de entrada; no procesa visión ni texto.
- No se declaran capacidades multilingües específicas; el modelo opera sobre características acústicas y no depende de idioma declarado.

## Casos de uso

- Verificación de autenticidad en plataformas de contenido: integración como filtro previo a la publicación de audio subido por usuarios, usando la puntuación -logit(fake) con umbral calibrado sobre un conjunto propio para marcar posibles deepfakes antes de revisión humana.
- Moderación de llamadas y atención al cliente: análisis de grabaciones de contact center para detectar voces sintéticas en intentos de fraude, aprovechando el bajo EER en ASVspoof2021_DF (1,18%) y en InTheWild (1,57%).
- KYC y verificación de identidad por voz: capa adicional en procesos de onboarding telefónico que comprueba si el audio del cliente es genuino antes de validar la identidad, con el modelo ejecutándose en FP32 sobre GPU consumer.
- Detección de deepfakes en periodismo y verificación de hechos: análisis de clips de audio recibidos de fuentes no verificadas, con recorte central a 4 s para estandarizar entradas heterogéneas y normalización de sonoridad a -23 LUFS.
- Investigación en seguridad de voz: uso como baseline o componente de ensembles en experimentos de anti-spoofing, dado que el Arena publica resultados por dataset y el modelo está en el tier no publicado.
- Despliegue en producción con TensorRT: el wrapper drop-in permite servir el detector en GPUs RTX con latencia reducida manteniendo equivalencia numérica con PyTorch (Spearman >= 0,999 en J-SPAW_LA), útil para pipelines de alto volumen.
- Auditoría de datasets de audio: cribado de corpus para detectar muestras sintéticas antes de usarlos en entrenamiento de modelos de voz, con la cautela de que el propio modelo puede tener leakage en algunos benchmarks.

## Benchmarks y rendimiento

Resultados publicados en el Speech Anti-Spoofing Arena. EER% (menor es mejor); EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% en el umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 1,10 |
| ASVspoof2021_LA | 3,17 |
| ASVspoof2021_DF | 1,18 |
| ASVspoof5 | 17,64 |
| InTheWild | 1,57 |
| ADD22_eval_31 | 1,13 |
| ADD2023_track12_test_r1 | 3,61 |
| CFAD | 7,30 |
| CD-ADD | 0,00 |
| CVoiceFake_small | 3,76 |
| DeepVoice | 2,58 |
| LibriSeVoc | 0,49 |
| SONAR | 0,44 |
| ArAD | 0,62 |
| DECRO | 1,36 |
| J-SPAW_LA | 0,00 |

No se han publicado resultados comparativos con otros modelos en la información disponible; el Arena clasifica a Pellav2 en el tier no publicado (mostrado, no rankeado).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,3 GB solo para pesos (580,49 M de parámetros), más overhead de activaciones y del encoder conformer; el repo completo ocupa 2,4 GB.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti (probadas con el wrapper TensorRT en FP32), RTX 4060 Ti (probada con PyTorch). Para mayor throughput, A100 o H100 son adecuadas aunque no se documentan mediciones.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM en FP32; el modelo es pequeño para los estándares actuales.
- Opciones de despliegue: PyTorch (pellav2_infer.py del autor) y wrapper TensorRT drop-in. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica; el wrapper TensorRT coincidió con PyTorch en J-SPAW_LA con |dEER| <= 0,25 y Spearman >= 0,999, lo que sugiere aceleración sin pérdida de precisión, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A continuación se indican los ejes que deberían compararse si se contara con información:

| Modelo | Parametros | Contexto de entrada | EER ASVspoof2021_DF | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pellav2 | 580,49 M | 4 s (64.000 muestras) | 1,18% | MIT | Hugging Face (rehost) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Datos de entrenamiento no divulgados: no hay paper ni descripción del dataset, lo que impide evaluar sesgos, cobertura de idiomas y posibles solapamientos con los conjuntos de evaluación.
- Riesgo de leakage: el Arena advierte que las puntuaciones en J-SPAW_LA están perfectamente separadas (EER 0%) y que no se puede descartar contaminación; los resultados deben interpretarse con cautela.
- Clasificación en tier no publicado: el modelo se muestra pero no se rankea en el Arena, lo que limita su comparabilidad oficial.
- Ventana de entrada fija de 4 s: clips más largos se recortan al centro, por lo que la decisión se basa solo en una porción del audio; clips más cortos se rellenan con ceros, lo que puede degradar la calibración.
- Dependencia del preprocesado exacto: el pipeline (filtro paso alto de 20 Hz, normalización a -23 LUFS, apilado de frames) es parte del modelo; desviarse de él puede alterar las puntuaciones.
- Rendimiento desigual entre dominios: el EER sube al 17,64% en ASVspoof5 y al 7,30% en CFAD, frente a valores por debajo del 2% en varios conjuntos, lo que indica sensibilidad al tipo de ataque y a las condiciones de grabación.
- Sin soporte multilingüe declarado ni evaluación por idioma: no se puede garantizar un rendimiento uniforme en lenguas distintas de las representadas en los benchmarks.
- Licencia MIT: permite uso comercial, pero el rehost no transfiere garantías sobre los datos de entrenamiento ni sobre posibles reclamaciones de terceros.
- No apto para generación de texto, agentes ni tool calling: es exclusivamente un clasificador de audio; cualquier uso fuera de esa función no está soportado.

## Enlaces

- Hugging Face (rehost): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Pellav2
- Pesos (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Pellav2/blob/0de5ef2278e4fb485bd57199a13d15cbf3686954/pellav2_detector.safetensors
- Código de inferencia del autor: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector/blob/b668eb4dfe4719665692c73c1d70383680afff6b/pellav2_infer.py
- Repositorio upstream: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del modelo en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=pellav2
