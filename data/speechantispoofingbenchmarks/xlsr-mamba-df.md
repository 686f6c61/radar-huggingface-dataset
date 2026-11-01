# SpeechAntiSpoofingBenchmarks/XLSR-Mamba-DF

## Resumen

XLSR-Mamba-DF es un modelo de deteccion de audio falsificado (anti-spoofing) disenado para distinguir voz bona fide de voz generada sinteticamente o manipulada. Lo desarrollan Xiao y Das (IEEE SPL) y esta empaquetado por el proyecto SpeechAntiSpoofingBenchmarks para su uso en la Speech Anti-Spoofing Arena. El modelo combina un front-end wav2vec 2.0 XLS-R de 300M parametros, afinado completamente en su ultima capa, con un back-end de Mamba bidireccional de doble columna.

La relevancia actual reside en la explosion de deepfakes de voz y en la necesidad de verificadores robustos que funcionen sobre condiciones acusticas reales (ruido, reverberacion, codecs). Este checkpoint concreto es la variante DF (deepfake), entrenada sobre ASVspoof2019 LA train con el algoritmo 3 de RawBoost, y esta pensado como referencia reproducible dentro de un banco de pruebas comparativo.

El modelo totaliza 319.327.544 parametros (319,33 M) en formato safetensors, con un repo de 1,4 GB. No es un modelo generativo: su salida es una puntuacion de dos clases donde `logits[:, 1]` indica mayor probabilidad de voz autentica. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: front-end wav2vec 2.0 XLS-R 300M (ultima capa afinada) + back-end Mamba v1 bidireccional de doble columna |
| Parametros totales | 319.327.544 (319,33 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada fija de los primeros 66.800 muestras a 16 kHz (aprox. 4,18 s), con repeat-padding para clips mas cortos |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el autor menciona una clase TensorRT drop-in en FP32) |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma, pero no se declara cobertura) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo PyTorch, 1,4 GB) |

## Arquitectura y entrenamiento

El front-end es un wav2vec 2.0 XLS-R de 300M parametros afinado por completo en su ultima capa. La representacion resultante se proyecta a 144 dimensiones mediante una capa Linear seguida de BatchNorm y activacion SELU. Sobre esa secuencia proyectada opera el back-end: un Mamba v1 (SSM selectivo) bidireccional de doble columna, compuesto por 6 bloques Mamba en direccion forward y 6 en direccion backward, con fusion de add+RMSNorm, pooling por atencion independiente por direccion, concatenacion de ambas representaciones, fusion lineal y una cabeza de dos clases.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de ASVspoof2019 LA, aplicando el algoritmo 3 de RawBoost para aumentar la robustez frente a condiciones de canal y ruido. No se documentan en la informacion disponible el numero de tokens o muestras exactas, la composicion completa del dataset ni el uso de RLHF/DPO (no aplicable a una tarea de clasificacion). La innovacion tecnica principal es la sustitucion de un back-end transformer por Mamba bidireccional, lo que reduce el coste cuadratico en la modelizacion temporal manteniendo pooling por atencion. El autor advierte explicitamente de que este modelo no debe confundirse con XLSR-MamBo (arXiv 2601.02944), que es un modelo distinto.

## Capacidades

- Deteccion binaria de voz sintetica frente a voz autentica (anti-spoofing / deepfake detection).
- Puntuacion continua mediante `logits[:, 1]`, donde valores mas altos indican mayor probabilidad de voz bona fide.
- Procesamiento de audio a 16 kHz con ventana fija de 66.800 muestras y repeat-padding para clips mas cortos.
- Robustez declarada frente a condiciones de canal gracias al aumento RawBoost (algoritmo 3) durante el entrenamiento.
- Evaluacion en multiples dominios: TTS, voice conversion, deepfakes y datasets multilingues (ver benchmarks).
- Soporte de inferencia en PyTorch (FP32) y mediante una clase TensorRT drop-in en FP32.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, vision ni audio generativo.
- No se documentan capacidades multilingues explicitas ni modo de razonamiento (thinking mode).

## Casos de uso

- Verificacion de autenticidad en llamadas telefonicas y centros de contacto: el modelo puntua cada segmento de 4,18 s y permite marcar llamadas con voz sintetica antes de transferirlas a un agente humano, usando el umbral calibrado sobre DeepVoice EER.
- Moderacion de contenido en plataformas de audio y podcast: integrado en un pipeline de ingesta, se aplica a cada clip para detectar voces generadas por TTS o clonacion y priorizar revision humana.
- KYC y verificacion de identidad por voz: como capa adicional de defensa frente a ataques de presentacion y deepfakes en procesos de onboarding bancario, combinado con tecnicas de deteccion de replay.
- Investigacion en forense de audio: sirve como referencia reproducible en la Speech Anti-Spoofing Arena para comparar nuevos detectores bajo condiciones controladas (ASVspoof, ADD, InTheWild, etc.).
- Filtrado de datasets de entrenamiento: descarta muestras sinteticas de corpus de voz recolectados en campo antes de usarlos para entrenar modelos ASR o TTS, reduciendo contaminacion.
- Monitorizacion de medios y verificacion periodistica: analisis de fragmentos de audio virales para senalar posibles manipulaciones antes de su publicacion.
- Despliegue de bajo coste en produccion: al ser un modelo de 319 M parametros y FP32, puede ejecutarse en una GPU consumer con la clase TensorRT drop-in, lo que facilita su inclusion en servicios de moderacion a gran escala.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% al umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 0,17 |
| ASVspoof2021_LA | 7,43 |
| ASVspoof2021_DF | 4,08 |
| ASVspoof5 | 20,01 |
| InTheWild | 9,22 |
| ADD22_eval_31 | 18,56 |
| ADD2023_track12_test_r1 | 21,84 |
| CFAD | 16,86 |
| CD-ADD | 9,87 |
| CVoiceFake_small | 11,94 |
| DeepVoice | 28,82 |
| LibriSeVoc | 2,22 |
| SONAR | 24,27 |
| ArAD | 30,82 |
| DECRO | 15,17 |
| J-SPAW_LA | 10,00 |
| ODSS | 25,50 |
| HABLA | 2,58 |

No se han publicado en la informacion disponible resultados comparativos directos frente a otros sistemas de la arena ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (319,33 M x 4 bytes), mas activaciones y buffers; en la practica se recomienda reservar entre 2 y 4 GB segun el tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; A100, H100, L40S o RTX 4090 para despliegues de alto throughput.
- Cabe en GPU consumer: si, en modelos como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores.
- Opciones de despliegue: PyTorch nativo (wrapper incluido en el repo) y clase TensorRT drop-in en FP32 validada contra PyTorch sobre el conjunto completo de J-SPAW_LA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLSR-Mamba-DF (este) | 319,33 M | 66.800 muestras @16 kHz | XLS-R + Mamba bidireccional | MIT | HuggingFace |
| XLSR-Mamba (checkpoint LA) | 319,33 M | 66.800 muestras @16 kHz | XLS-R + Mamba bidireccional, ajustado a LA | MIT | HuggingFace (mismo repo de autores) |
| XLSR-MamBo | no disponible | no disponible | Modelo distinto segun el autor (arXiv 2601.02944) | no disponible | no disponible |
| AASIST y variantes | no disponible | no disponible | Back-end graph attention sobre features acusticas | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ASVspoof2019 LA train: la generalizacion a dominios fuera de distribucion es limitada, como reflejan los EER superiores al 20 % en ASVspoof5, DeepVoice, SONAR, ArAD y ODSS.
- Ventana de entrada fija de 66.800 muestras (aprox. 4,18 s): clips mas largos deben segmentarse y agregarse, lo que puede introducir sesgos en la decision final.
- Repeat-padding en clips cortos: puede alterar la distribucion acustica y degradar la calibracion en audios muy breves.
- Riesgo de falsos positivos y falsos negativos: al ser un detector binario, un umbral mal calibrado afecta directamente a la tasa de error; el umbral debe ajustarse al dominio de despliegue.
- No se documentan sesgos por idioma, genero o acento; la ausencia de informacion no implica ausencia de sesgo.
- No es un modelo generativo ni un ASR: no debe emplearse para transcripcion, sintesis ni tareas de lenguaje.
- Aunque la licencia es MIT, conviene revisar las condiciones de los pesos derivados de XLS-R y de los datasets de entrenamiento antes de un uso comercial a gran escala.
- El autor advierte de la confusion con XLSR-MamBo (arXiv 2601.02944); verificar el identificador del checkpoint antes de integrarlo.
- La clase TensorRT drop-in se valido en FP32; no se documenta soporte de FP16, INT8 ni cuantizacion, lo que limita optimizaciones agresivas de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Mamba-DF
- Pesos (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Mamba-DF/blob/e97533f5ac8303cf0e7215bb8b452cdc7a74fefb/model.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en la arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=xlsr-mamba-df
- Paper (arXiv 2411.10027): https://arxiv.org/abs/2411.10027
- Codigo de los autores: https://github.com/swagshaw/XLSR-Mamba
- Paper de XLSR-MamBo (modelo distinto, arXiv 2601.02944): https://arxiv.org/abs/2601.02944
