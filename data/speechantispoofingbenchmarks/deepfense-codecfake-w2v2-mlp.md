# SpeechAntiSpoofingBenchmarks/DeepFense-CodecFake-W2V2-MLP

## Resumen

DeepFense-CodecFake-W2V2-MLP es un sistema de deteccion de audio falsificado (anti-spoofing) empaquetado como wrapper para la Speech Anti-Spoofing Arena. El modelo subyacente es la receta CodecFake del framework DeepFense (Kheir et al., 2026), y combina un front-end wav2vec 2.0 XLS-R de 300M parametros totalmente afinado con un back-end MLP ligero que produce una puntuacion binaria de autenticidad. El repositorio de Hugging Face no re-aloja los pesos originales: solo contiene el codigo de empaquetado y los resultados de evaluacion, mientras que los pesos deben descargarse del checkpoint publicado por los autores.

El modelo resuelve el problema de distinguir voz real (bonafide) de voz sintetica o re-sintetizada por codecs neuronales, un vector creciente de fraude y desinformacion. Se entrena sobre el corpus Codecfake (Xie et al.), derivado de AISHELL-3 y VCTK mediante re-sintesis con codecs, y se evalua en un amplio conjunto de benchmarks del arena: ASVspoof2019/2021/5, InTheWild, ADD22/2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO y J-SPAW.

Su relevancia actual radica en que proporciona una linea base reproducible y comparable dentro de un marco de evaluacion estandarizado, con puntuaciones EER publicas en mas de veinte conjuntos de datos. El tamano total del repositorio es de 0,1 GB y la licencia es Apache 2.0, aunque los pesos del modelo original tienen restricciones de licencia independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (front-end) + MLP (Linear 1024->128, LayerNorm, ReLU, mean pooling) + cabeza lineal binaria |
| Parametros totales | 317.522.306 (317,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana fija de 64.000 muestras, 4 s a 16 kHz) |
| Tipos de cuantizacion | FP32 (unica precision documentada); no se mencionan INT8/FP16/GGUF |
| Idiomas soportados | no disponible (entrenado sobre AISHELL-3, chino, y VCTK, ingles, segun el corpus Codecfake) |
| Licencia | Apache 2.0 (repositorio); los pesos originales no tienen licencia concedida por los autores |
| Formato de pesos | best_model.pth (PyTorch state dict); no se distribuyen en este repositorio |

## Arquitectura y entrenamiento

El sistema sigue un diseno en dos etapas. El front-end es un wav2vec 2.0 XLS-R de 300M parametros totalmente afinado, del que se extraen las caracteristicas de la ultima capa transformer en modo `features_only`. Sobre esas representaciones actua un back-end MLP: una capa lineal de 1024 a 128 dimensiones, LayerNorm, activacion ReLU y mean pooling sobre el eje temporal, seguido de una cabeza lineal de dos clases entrenada con CrossEntropy. La puntuacion final se calcula como `logit(bonafide) - logit(spoof)`, de modo que valores mas altos indican mayor probabilidad de voz autentica.

El entrenamiento se realizo sobre el split de entrenamiento del corpus Codecfake (Xie et al.), construido a partir de AISHELL-3 y VCTK mediante re-sintesis con codecs neuronales, sin aumento de datos, con semilla 42. El checkpoint publicado corresponde a la epoca 2 (best_model.pth). La entrada se procesa como forma de onda float cruda sin normalizacion, tomando las primeras 64.000 muestras (4 segundos a 16 kHz); los clips mas cortos se rellenan repitiendo la senal. Todo el calculo se realiza en FP32. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, dado que no es un modelo generativo.

## Capacidades

- Deteccion binaria de voz real frente a voz sintetica o re-sintetizada por codecs neuronales.
- Puntuacion continua de autenticidad (logit diferencia), util para umbralizar segun la aplicacion.
- Evaluacion cruzada en multiples dominios: TTS, voice conversion, codecs, ataques adversariales y datasets multilingues.
- Funcionamiento sobre forma de onda cruda, sin necesidad de extraccion manual de caracteristicas.
- Procesamiento de clips de hasta 4 segundos; los mas cortos se re-padean.
- Inferencia en FP32 con wrapper PyTorch y clase TensorRT drop-in para despliegue acelerado.
- Integracion con la Speech Anti-Spoofing Arena para comparacion estandarizada.
- No soporta tool calling, agentes, vision ni generacion de texto: es un clasificador de audio.

## Casos de uso

- Verificacion de autenticidad en llamadas telefonicas: el modelo puede puntuar cada segmento de 4 segundos de una llamada y marcar como sospechosos aquellos con score bajo, ayudando a detectar fraude por voz clonada en centros de atencion.
- Moderacion de contenido en plataformas de audio: integrado en un pipeline que procesa subidas de podcasts o notas de voz, permite filtrar audios generados por TTS o codecs antes de su publicacion.
- Deteccion de deepfakes en periodismo y verificacion de hechos: los periodistas pueden pasar grabaciones sospechosas por el modelo y usar la puntuacion como evidencia complementaria, dado su rendimiento en benchmarks como InTheWild (EER 8,08 %).
- KYC y onboarding biometrico: como capa adicional en sistemas de verificacion de identidad por voz, el modelo ayuda a rechazar muestras sinteticas antes de comparar con el locutor registrado, especialmente en escenarios con audio comprimido por codecs.
- Investigacion en seguridad de sistemas de reconocimiento de voz: sirve como linea base reproducible para estudiar la robustez de contramedidas frente a ataques de re-sintesis, con resultados publicos en ASVspoof2019_LA (EER 4,2 %) y ASVspoof2021_DF (EER 6,08 %).
- Auditoria de datasets de voz: permite etiquetar automaticamente grandes colecciones de audio para identificar muestras sinteticas y limpiar corpus de entrenamiento de otros modelos de habla.
- Despliegue en entornos con GPU de consumo: con 317 M parametros en FP32, cabe en tarjetas como RTX 4070 Ti SUPER o RTX 5060 Ti, lo que facilita prototipos y pruebas en estaciones de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % en el umbral EER de DeepVoice):

| Dataset | EER (%) |
|---|---|
| ASVspoof2019_LA | 4,2 |
| ASVspoof2021_LA | 16,3 |
| ASVspoof2021_DF | 6,08 |
| ASVspoof5 | 24,54 |
| InTheWild | 8,08 |
| ADD22_eval_31 | 5,06 |
| ADD2023_track12_test_r1 | 21,27 |
| CFAD | 9,61 |
| CD-ADD | 2,65 |
| CVoiceFake_small | 10,24 |
| DeepVoice | 18,67 |
| LibriSeVoc | 1,21 |
| SONAR | 18,03 |
| ArAD | 20,71 |
| DECRO | 11,11 |
| J-SPAW_LA | 0,62 |

No se proporcionan comparaciones directas con otros sistemas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 solo para pesos (317,5 M parametros x 4 bytes), mas activaciones y buffers de audio; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti (validadas por los autores con la clase TensorRT); cualquier GPU moderna con soporte CUDA es suficiente.
- Cabe en GPU de consumo: si, incluidas gamas medias y bajas con suficiente VRAM.
- Opciones de despliegue: PyTorch nativo (wrapper del arena) y TensorRT (clase drop-in documentada, FP32); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica; el modelo procesa ventanas de 4 s y la evaluacion se realizo en FP32 sobre RTX 4070 Ti SUPER y RTX 5060 Ti, con coincidencia entre TensorRT y PyTorch en el conjunto completo de J-SPAW_LA.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros sistemas de anti-spoofing en la informacion proporcionada. La Speech Anti-Spoofing Arena permite comparar este sistema con otros participantes del benchmark, pero los resultados de esos otros sistemas no se incluyen en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepFense-CodecFake-W2V2-MLP | 317,5 M | ventana de 4 s | Apache 2.0 (repo); pesos sin licencia de los autores | Pesos en HF (DeepFense/CodecFake_Wav2Vec2_MLP_NoAug_Seed42) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos originales no se re-alojan en este repositorio y los autores no conceden licencia explicita para ellos; es necesario descargarlos del checkpoint original y verificar el sha256 indicado en `meta.yaml`.
- El modelo se entrena sin aumento de datos, lo que puede reducir su robustez frente a condiciones acusticas no vistas (ruido, reverberacion, canales telefonicos).
- Ventana fija de 4 segundos: clips mas largos deben segmentarse y clips mas cortos se re-padean repitiendo la senal, lo que puede introducir artefactos.
- Rendimiento desigual entre dominios: EER muy bajo en J-SPAW_LA (0,62 %) y LibriSeVoc (1,21 %) frente a EER alto en ASVspoof5 (24,54 %), ADD2023 (21,27 %) y ArAD (20,71 %), lo que indica sensibilidad al tipo de ataque y al dominio.
- No se documentan sesgos especificos, pero al entrenarse sobre AISHELL-3 (chino) y VCTK (ingles) puede tener cobertura limitada en otros idiomas.
- Riesgo de falsos positivos y negativos en produccion: la puntuacion es un logit continuo y requiere calibracion de umbral por aplicacion.
- No es un modelo generativo ni soporta tool calling, agentes o vision; su uso esta restringido a clasificacion de audio.
- La evaluacion se realizo en FP32; no se documenta el impacto de FP16 o INT8 en la precision.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DeepFense-CodecFake-W2V2-MLP
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Checkpoint de los autores: https://huggingface.co/DeepFense/CodecFake_Wav2Vec2_MLP_NoAug_Seed42/blob/c08bd2125c83e6c8fdc64566bfbfda18dff4dfb4/best_model.pth
- Codigo del framework DeepFense: https://github.com/Yaselley/deepfense-framework/tree/3f2fe1146c48ea4bacc480dd96d806b6c72c09cf
- Paper: https://arxiv.org/abs/2604.08450
