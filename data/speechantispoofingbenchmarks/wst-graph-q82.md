# SpeechAntiSpoofingBenchmarks/WST-Graph-Q82

## Resumen

WST-Graph-Q82 es un modelo de detección de voz sintética (anti-spoofing) empaquetado por el colectivo SpeechAntiSpoofingBenchmarks para su participación en la Speech Anti-Spoofing Arena, un banco de pruebas comparativo de sistemas de detección de deepfakes de audio. El modelo original procede del trabajo de Ng et al. (2026) y se distribuye aquí como un programa TorchScript trazado, con los pesos re-alojados bajo la licencia MIT del proyecto upstream. Su propósito no es generar audio, sino clasificar una grabación de voz como auténtica (bona fide) o falsificada (spoof) produciendo un logit que permite ordenar muestras por sospecha.

La arquitectura combina una transformada de scattering de wavelet (WST) sin parámetros entrenables, implementada con Kymatio, con un back-end de red neuronal gráfica AASIST. Con tan solo 0,12 millones de parámetros, es un modelo deliberadamente ligero que prioriza la interpretabilidad y la eficiencia sobre la capacidad bruta. Trabaja con audio a 16 kHz, sin normalización, tomando los primeros 64.000 muestras (4 segundos) y rellenando con ceros por la derecha si la señal es más corta.

Su relevancia actual reside en dos factores: por un lado, la creciente preocupación por la suplantación de voz en contextos de fraude y desinformación; por otro, su inclusión en un banco de pruebas abierto que permite comparar sistemas heterogéneos bajo protocolos comunes. No obstante, los resultados publicados muestran un rendimiento excelente en el dominio de entrenamiento y un deterioro muy acusado en dominios cruzados, lo que lo convierte en un caso de estudio sobre generalización más que en una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wavelet Scattering Transform (Kymatio, J=8, Q=(8,2), primer y segundo orden) + OrderGrid + ALAP + adaptador de canales + bloques latentes depthwise-separable + GraphAASIST |
| Parametros totales | 0,12 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 muestras de audio (4 s a 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos FP32, TF32 desactivado) |
| Idiomas soportados | no disponible (el modelo opera sobre señal acústica, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | TorchScript trazado (`.ts`) |

## Arquitectura y entrenamiento

La primera etapa es una transformada de scattering de wavelet fija y sin parámetros, calculada con Kymatio con escala J=8, factor de calidad Q=(8,2), órdenes primero y segundo y sobremuestreo 1. La salida se organiza en una rejilla portadora de modulación (OrderGrid) con normalización logarítmica de trayectoria. A continuación, un pooling atento consciente de la longitud (ALAP) comprime la representación a 64 bins de tiempo relativo. Sobre esa representación se aplican un adaptador de canales y bloques latentes con convoluciones depthwise-separable, y finalmente un back-end de red neuronal gráfica (GraphAASIST) produce la clasificación binaria.

El entrenamiento se realizó exclusivamente sobre el conjunto de entrenamiento de ASVspoof 2019 LA, con función de pérdida focal y 12 épocas, usando la semilla 9 (la model card aclara que el artículo no designa una semilla principal y que la 9 es la del ejemplo). El conjunto de desarrollo se empleó para selección de modelo. No se documentan en la información disponible fases de RLHF, DPO ni aumentación de datos. La puntuación de decisión se define como `logit[bona fide] - logit[spoof]`, de modo que valores más altos indican mayor autenticidad.

## Capacidades

- Clasificación binaria de audio de voz como auténtico o falsificado, devolviendo un logit continuo que permite umbralizar y ordenar.
- Detección de artefactos de síntesis de voz y conversión de voz en grabaciones de 16 kHz.
- Extracción de características acústicas mediante scattering de wavelet sin entrenamiento, lo que aporta estabilidad frente a variaciones de fase.
- Procesamiento de audios de hasta 4 segundos con relleno por la derecha para señales más cortas.
- Ejecución en CPU o GPU con TorchScript, sin dependencias de frameworks de inferencia de gran tamaño.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni capacidades multilingües en el sentido textual.

## Casos de uso

- Investigación en detección de deepfakes de voz: sirve como línea base ligera y reproducible para comparar contra sistemas más pesados dentro de la Speech Anti-Spoofing Arena, con protocolos de evaluación comunes y métricas EER publicadas por conjunto de datos.
- Filtrado previo en pipelines de verificación de locutor: al producir una puntuación continua, puede actuar como primera etapa de descarte de muestras claramente sintéticas antes de invocar modelos de verificación más costosos.
- Análisis forense de audio en entornos académicos: su naturaleza sin parámetros en la etapa de scattering facilita la interpretación de qué bandas de modulación contribuyen a la decisión, algo útil en estudios de atribución.
- Docencia y divulgación sobre anti-spoofing: el reducido tamaño (0,12 M de parámetros) y el formato TorchScript permiten ejecutarlo en portátiles y analizar su comportamiento en clase sin infraestructura dedicada.
- Evaluación de la generalización entre dominios: los resultados por conjunto (ASVspoof 2019, 2021, 5, InTheWild, ADD22, ADD2023, CFAD, etc.) lo convierten en un instrumento para estudiar la brecha entre dominio de entrenamiento y despliegue real.
- Pruebas de robustez de sistemas de autenticación biométrica por voz: puede integrarse en arneses de test que inyectan muestras sintéticas y miden la tasa de falsos negativos del sistema completo.
- Prototipado rápido en entornos con recursos limitados: al caber en cualquier GPU consumer y ejecutarse en CPU, permite iterar sobre umbrales y preprocesado sin coste de infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor; EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR % en el umbral EER de DeepVoice).

| Conjunto de datos | EER (%) |
|---|---|
| ASVspoof2019_LA | 2,93 |
| ASVspoof2021_LA | 14,15 |
| ASVspoof2021_DF | 18,97 |
| ASVspoof5 | 35,55 |
| InTheWild | 44,52 |
| ADD22_eval_31 | 30,43 |
| ADD2023_track12_test_r1 | 47,86 |
| CFAD | 44,95 |
| CD-ADD | 47,70 |
| CVoiceFake_small | 49,20 |
| DeepVoice | 48,25 |
| LibriSeVoc | 33,40 |
| SONAR | 39,37 |
| ArAD | 44,98 |
| DECRO | 27,13 |
| J-SPAW_LA | 43,64 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K), ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 0,12 M de parámetros en FP32, el peso de los tensores es de aproximadamente 0,5 MB, y el consumo dominante es el buffer de audio y las activaciones intermedias de la WST.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son sobradas.
- Cabe en cualquier GPU consumer e incluso en CPU sin aceleración, dado el tamaño del repositorio (0,1 GB) y el número de parámetros.
- Opciones de despliegue: TorchScript (`torch.jit.load`) es el formato nativo publicado; no se documentan exportaciones a ONNX, GGUF, vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La etapa de scattering de wavelet es la más costosa computacionalmente, pero sigue siendo muy inferior a la de un transformer de audio convencional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WST-Graph-Q82 | 0,12 M | 4 s a 16 kHz | 2,93 % | MIT | Hugging Face (TorchScript) |
| AASIST (referencia original) | no disponible en la información | no disponible | no disponible en la información | no disponible | no disponible |
| RawNet2 | no disponible en la información | no disponible | no disponible en la información | no disponible | no disponible |
| Modelos de la Arena (7B audio LLM en bf16) | ~7 B | no disponible | no disponible | no disponible | Speech Anti-Spoofing Arena |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; la model card menciona que todos los conjuntos fueron puntuados con el wrapper de PyTorch y que se usó un audio LLM de 7B en bf16 como referencia de la Arena, sin detallar sus métricas.

## Limitaciones y advertencias

- Modelo débil en dominio cruzado: la model card lo describe explícitamente como "a weak cross-domain model" y conserva celdas cercanas al azar por decisión del mantenedor. Los EER superiores al 44 % en InTheWild, CVoiceFake_small, DeepVoice, CD-ADD y ADD2023 indican un rendimiento prácticamente aleatorio en esos dominios.
- Entrenado únicamente con ASVspoof 2019 LA train, lo que limita su generalización a otros corpus, idiomas, códecs y condiciones de grabación.
- No se documentan análisis de sesgo por género, edad, acento o idioma; la ausencia de esta información es un riesgo para despliegues reales.
- Riesgo de falsos negativos y falsos positivos elevado fuera del dominio de entrenamiento; no debe usarse como único mecanismo de decisión en sistemas de seguridad.
- Entrada restringida a 16 kHz, sin normalización y primeros 4 segundos; audios más largos se truncan y audios más cortos se rellenan con ceros, lo que puede degradar la detección.
- Licencia MIT, que permite uso comercial, pero la model card no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Pesos en FP32 con TF32 desactivado; no se publican versiones cuantizadas ni exportaciones a otros formatos.
- El repositorio incluye solo el programa TorchScript trazado; no se distribuye el código de entrenamiento en este paquete, aunque se enlaza el repositorio upstream.
- La fecha de creación del repositorio (2026-11-09) y el arXiv referenciado (2609.29372) deben tratarse como metadatos del autor; no se ha verificado su contenido en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/WST-Graph-Q82
- Pesos TorchScript (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/WST-Graph-Q82/blob/b3a564c66f52b666330cb13a7864af912de30dd4/wst_graph_q82_seed9_batch32_cuda.ts
- Repositorio upstream del autor: https://huggingface.co/kwokho1/wst-graph/tree/080000c1685451c7759f43d2ae7d0f08477cfdf8
- Artículo (arXiv): https://arxiv.org/abs/2609.29372
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=wst-graph-q82
