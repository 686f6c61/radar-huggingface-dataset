# ThakiCloud/Thaki-VoiceSpoof-W2V2-Large

## Resumen

Thaki-VoiceSpoof-W2V2-Large es un contramedida de anti-spoofing de voz (countermeasure) para la tarea Track 1 de ASVspoof 5, es decir, la discriminación entre habla genuina (bona fide) y habla sintética o convertida (spoof). Lo desarrolla ThakiCloud y se publica como *research preview* bajo licencia Apache 2.0. El modelo parte de `facebook/wav2vec2-large`, preentrenado de forma autosupervisada con 960 horas de LibriSpeech, y afina sus 24 capas transformer junto con una cabeza de pooling y clasificación sobre el split de entrenamiento de ASVspoof 5. El resultado es un clasificador binario de audio que emite un score (logit de bona fide menos logit de spoof) y una decisión binaria mediante un umbral fijo.

La relevancia del modelo está en su rendimiento sobre el conjunto de evaluación sellado de ASVspoof 5 (680.774 utterances): alcanza minDCF 0.1995 y EER 8,06 %, frente a minDCF 0.6674 y EER 28,11 % del baseline oficial AASIST, lo que supone una mejora relativa del 70,1 % en minDCF. No obstante, la comparación es entre un sistema en condición Open (con datos externos de preentrenamiento) y un baseline en condición Closed (solo datos de ASVspoof 5), por lo que no demuestra superioridad arquitectónica en igualdad de recursos.

El modelo tiene limitaciones explícitas y relevantes: los scores no están calibrados (Cllr de evaluación 8,28), el runtime numérico está restringido a una configuración verificada muy concreta (NVIDIA B200, bf16, cuDNN SDPA), y la puerta de paridad de recarga G5 falló bajo su criterio original. Está pensado para investigación y evaluación, no como único control de seguridad en verificación de identidad por voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2-large) con 24 capas transformer afinas + cabeza de pooling y clasificacion binaria |
| Parametros totales | 315.758.363 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.600 muestras de audio a 16 kHz (4,04 s por utterance; clips mas cortos se tilean) |
| Tipos de cuantizacion | no disponible (el runtime verificado exige bf16 autocast; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles); la deteccion de spoof en coreano no ha sido validada independientemente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `facebook/wav2vec2-large`, un transformer de 24 capas preentrenado de forma autosupervisada sobre 960 horas de LibriSpeech. Sobre la representacion del encoder se anade una cabeza de pooling y clasificacion que produce dos logits (bona fide y spoof). El score final es la diferencia entre ambos logits, donde valores mas altos indican mayor probabilidad de habla genuina. La entrada es una forma de onda mono a 16 kHz en float; se usan las primeras 64.600 muestras (4,04 s) y los clips mas cortos se tilean. La normalizacion por media y varianza de cada utterance se realiza dentro del modelo.

El entrenamiento se lleva a cabo sobre el split de entrenamiento de ASVspoof 5 (dataset `jungjee/asvspoof5`), con las 24 capas transformer actualizadas. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de inferencia: el modulo `voicespoof_inference.py` impone un runtime numerico verificado (GPU NVIDIA B200, bf16 autocast, kernel cuDNN SDPA, lotes fijos de 128 filas, torch 2.9.0+cu130, CUDA 13.0, cuDNN 9.13, transformers 4.57.6) y lanza `UnsupportedRuntimeError` en cualquier otra configuracion. Ademas, todos los calculos se realizan en lotes de 128 filas con padding a cero y descarte de las filas rellenadas, de modo que los scores no dependen de como se agrupen las peticiones. El precio es que una sola peticion se computa como un lote de 128 filas.

## Capacidades

- Clasificacion binaria de audio para anti-spoofing: distingue habla genuina de habla sintetica o convertida (bona fide vs. spoof) en la tarea Track 1 de ASVspoof 5.
- Emision de un score continuo (logit bona fide menos logit spoof) y de una decision binaria mediante el umbral fijo de desarrollo τ_dev = 19,25.
- Procesamiento de utterances de hasta 4,04 s (64.600 muestras a 16 kHz), con tileado automatico de clips mas cortos.
- Normalizacion interna por utterance (media y varianza) sin necesidad de preprocesado externo mas alla del remuestreo a 16 kHz.
- Inferencia por lotes con independencia del agrupamiento de peticiones gracias a la politica de lotes fijos de 128 filas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo; es exclusivamente un clasificador de audio.
- Capacidad multilingue limitada a ingles; el propio autor advierte que la deteccion en coreano no ha sido validada.

## Casos de uso

- Evaluacion de sistemas de verificacion de voz: el modelo puede actuar como contramedida de referencia en pipelines de investigacion que comparan detectores de deepfake vocal, gracias a sus metricas publicadas sobre el conjunto sellado de ASVspoof 5 (minDCF 0.1995, EER 8,06 %).
- Deteccion de deepfakes en audio de llamadas: integrado en un pipeline de telefonia que remuestree a 16 kHz y recorte a 4,04 s, puede puntuar fragmentos de llamada y marcar posibles voces sinteticas para revision humana, siempre que no se use como unico control de seguridad.
- Filtrado de datos de entrenamiento de TTS y ASR: el score permite descartar utterances sospechosas de ser sinteticas antes de incorporarlas a corpus de entrenamiento, reduciendo la contaminacion por datos generados.
- Investigacion en contramedidas anti-spoofing: sirve como punto de partida (fine-tuning adicional) o como baseline Open-condition frente a AASIST en experimentos con ASVspoof 5, dado que el codigo de inferencia y el contrato de entrada estan documentados.
- Analisis forense de audio: apoyo a peritajes que necesiten una senal cuantitativa de autenticidad vocal, teniendo en cuenta que el score no es una probabilidad calibrada y que el umbral debe ser el fijo de desarrollo.
- Benchmarking de robustez frente a codecs: util para medir la tasa de rechazo de habla genuina a traves de codecs telefonicos (C07, C10, C09 rechazan entre el 13 % y el 14 % del habla genuina), lo que permite caracterizar el impacto de la cadena de codificacion en sistemas de deteccion.
- Monitorizacion de plataformas de contenido: deteccion por lotes de clips sospechosos en procesos de moderacion, aprovechando el throughput de la politica de lotes fijos (p50 de 52,6 ms por lote de 128 clips en B200).

## Benchmarks y rendimiento

Resultados sobre el paquete oficial de evaluacion de ASVspoof 5 (commit `fe23d30`), con parametros de coste P_spoof 0,05, C_miss 1 y C_fa 10. El baseline es el checkpoint oficial de AASIST, sin reentrenar, puntuado sobre los mismos ficheros.

| Split | Utterances | minDCF (este modelo) | EER (este modelo) | minDCF (AASIST) | EER (AASIST) |
|---|---|---|---|---|---|
| Dev (seleccion) | 140.950 | 0,1045 | 4,07 % | 0,3147 | 15,20 % |
| Eval (sellado, abierto una vez) | 680.774 | 0,1995 | 8,06 % | 0,6674 | 28,11 % |

| Metrica de calibracion | Este modelo | AASIST |
|---|---|---|
| Cllr Dev | 5,09 | 3,40 |
| Cllr Eval | 8,28 | 4,36 |

| Comportamiento en el umbral fijo τ_dev = 19,25 (Eval: 138.688 bona fide / 542.086 spoof) | Valor |
|---|---|
| DCF en τ_dev | 0,2034 (minDCF 0,1995; el umbral optimo en Eval habria sido 19,0) |
| FNR (bona fide rechazado) | 6,12 % |
| FPR (spoof aceptado) | 8,71 % |
| actDCF oficial (trata el score como LLR) | 0,7304 (AASIST 0,9714) |

Mejora relativa en Eval minDCF: 70,1 %. Bootstrap pareado por hablante (737 hablantes de Eval, 2.000 remuestreos): diferencia de minDCF (este modelo menos AASIST) con IC 95 % [−0,4843, −0,4516]; mejora relativa con IC 95 % [68,7 %, 71,5 %]; IC 95 % del minDCF de este modelo [0,1905, 0,2073].

Debilidades por ataque documentadas: algunos ataques se aceptan con frecuencia (A28 con 25,9 % de aceptacion de spoof; A19 y A27 con 21,4 %). El habla genuina a traves de los codecs C07, C10 y C09 se rechaza entre el 13 % y el 14 % de las veces. La tabla per-attack completa no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 9,14 GiB en pico con la politica de lotes fijos de 128 filas en B200; 3,18 GiB en pico sin padding (batch 1 y batch 32) pero en ese caso los scores dependen de la forma del lote.
- GPU recomendada: NVIDIA B200, unica configuracion verificada. `VI.score()` lanza `UnsupportedRuntimeError` en cualquier otra GPU o runtime.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 ni con GPUs consumer.
- Opciones de despliegue: el modulo `voicespoof_inference.py` incluido en el repositorio, con torch 2.9.0+cu130, CUDA 13.0, cuDNN 9.13 y transformers 4.57.6. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en B200, clips de 4,04 s y politica de 128 filas, p50 de 53,5 ms por peticion de un clip y p50 de 52,6 ms por peticion de 128 clips. Sin padding, el modelo crudo tarda p50 11,6 ms en batch 1 y 16,1 ms en batch 32. Son tiempos solo del modelo, no latencia extremo a extremo ni de telefonia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | minDCF Eval | EER Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-VoiceSpoof-W2V2-Large | 315,8 M | 4,04 s (64.600 muestras a 16 kHz) | 0,1995 | 8,06 % | Apache 2.0 | HuggingFace, research preview |
| AASIST (baseline oficial ASVspoof 5) | no disponible en la informacion | no disponible en la informacion | 0,6674 | 28,11 % | no disponible en la informacion | checkpoint oficial de ASVspoof 5 |
| wav2vec2-large (modelo base) | 315,8 M aprox. | no disponible en la informacion | no aplica (no es contramedida) | no aplica | Apache 2.0 | HuggingFace |

La comparacion con AASIST es entre un sistema Open-condition (con preentrenamiento externo en LibriSpeech) y un baseline Closed-condition (solo datos de ASVspoof 5), por lo que debe interpretarse como comparacion de sistemas bajo este protocolo y no como evidencia de superioridad arquitectonica en igualdad de recursos. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en estado *research preview*: la deteccion de spoof en coreano no ha sido validada de forma independiente.
- Scores no calibrados: Cllr de evaluacion 8,28; no deben interpretarse como probabilidad ni como cociente de verosimilitudes. Solo debe usarse el umbral fijo de desarrollo (τ_dev = 19,25).
- No debe usarse como unico control de seguridad ni como unica defensa en verificacion de identidad por voz.
- Runtime verificado unico: NVIDIA B200, bf16 autocast, atencion cuDNN, lotes fijos de 128 filas, torch 2.9.0+cu130, CUDA 13.0, cuDNN 9.13, transformers 4.57.6. Fuera de esa configuracion, `VI.score()` lanza `UnsupportedRuntimeError`. Los scores no son equivalentes en fp32 ni con otros kernels de atencion.
- La puerta de paridad de recarga G5 fallo bajo su criterio original; se publica bajo una excepcion preregistrada de runtime BF16 (REX-1 a REX-5 superadas, aprobada por el propietario el 2026-11-04). Los numeros sellados de Eval se midieron una vez antes de esa politica y no se re-puntuaron con ella.
- Ataques con alta aceptacion de spoof: A28 (25,9 %), A19 y A27 (21,4 %).
- Habla genuina rechazada a traves de codecs C07, C10 y C09 en un 13-14 % de los casos.
- Riesgo de alucinacion no aplica directamente (es un clasificador, no un generador), pero si existe riesgo de falsos positivos y falsos negativos en la decision binaria.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el aviso de research preview y la falta de validacion fuera del runtime verificado desaconsejan su uso en produccion sin evaluacion adicional.
- El contrato de entrada exige 16 kHz mono; cualquier otro formato requiere remuestreo previo.

## Enlaces

- HuggingFace: https://huggingface.co/ThakiCloud/Thaki-VoiceSpoof-W2V2-Large
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-VoiceSpoof-W2V2-Large/blob/main/MODEL_CARD.ko.md
- Modelo base: https://huggingface.co/facebook/wav2vec2-large
- Dataset de entrenamiento: https://huggingface.co/datasets/jungjee/asvspoof5
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
