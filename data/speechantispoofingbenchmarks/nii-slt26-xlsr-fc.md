# SpeechAntiSpoofingBenchmarks/NII-SLT26-XLSR-FC

## Resumen

NII-SLT26-XLSR-FC es un detector de audio falsificado (anti-spoofing) desarrollado por los autores Ge, Wang y Yamagishi del NII Yamagishi Lab, presentado en IEEE SLT 2026. Se trata de un clasificador binario [real, fake] construido sobre un encoder wav2vec 2.0 XLS-R de 300M parametros, completamente afinado, seguido de un mean pooling sobre la ultima capa oculta y una cabeza lineal de 1024 a 2 dimensiones. El modelo resuelve el problema de distinguir voz bona fide de voz generada o manipulada por sistemas de sintesis y conversion de voz.

Este repositorio concreto no es la publicacion original del autor, sino un wrapper empaquetado por SpeechAntiSpoofingBenchmarks para integrarlo en la Speech Anti-Spoofing Arena, un espacio de evaluacion comparativa de detectores de deepfake de audio. Los pesos se re-alojan bajo la licencia upstream (CC BY-NC 4.0) y se acompanan de los resultados de la arena por dataset.

Su relevancia actual radica en la explosion de voces sinteticas de alta calidad y en la necesidad de detectores robustos y evaluables de forma transparente. El modelo tiene 315,44M parametros, acepta audio a 16 kHz y produce una puntuacion continua donde valores mas altos indican mayor probabilidad de voz bona fide.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R (transformers Wav2Vec2Model) + mean pooling + Linear(1024, 2) |
| Parametros totales | 315,44 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio limitado a 4 s / 64600 muestras en la arena) |
| Tipos de cuantizacion | no disponible (pesos en FP32; se menciona un drop-in TensorRT en FP32) |
| Idiomas soportados | no disponible (entrenado con datos mayoritariamente en ingles: CommonVoice, LibriTTS, english-conversation-corpus) |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | safetensors (nii_slt26_xlsr_fc.safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder wav2vec 2.0 XLS-R de aproximadamente 300M parametros, afinado de forma completa (fully fine-tuned). La entrada es una forma de onda a 16 kHz normalizada por clip con media cero y varianza unitaria mediante Wav2Vec2FeatureExtractor. Sobre la ultima capa oculta se aplica un mean pooling a lo largo de todos los frames y una capa lineal de 1024 a 2 salidas correspondientes a las clases [real, fake]. La puntuacion del modelo es la diferencia logit[real] - logit[fake], monotona respecto a la diferencia de probabilidades softmax que usan los autores.

El entrenamiento se realizo sobre el split de train de CompSpoof V2 (ESDD2) con etiquetado "cualquier componente falso = falso", excluyendo la clase "original" sin mezclar (protocolo AnyFakeNoOriginal), semilla 2 y checkpoint de mejor perdida de validacion. Los datos bona fide incluyen CommonVoice, LibriTTS y english-conversation-corpus mezclados con sonido ambiental; los datos spoof incluyen fuentes de ASVspoof 5, SONAR, CD-ADD, LibriSeVoc y MLAAD. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion binaria de audio como voz real (bona fide) o falsa (spoof/deepfake).
- Deteccion de voz sintetica procedente de TTS y de conversion de voz.
- Deteccion de audio manipulado con componentes parcialmente falsos (etiquetado AnyFakeNoOriginal).
- Puntuacion continua (logit real menos logit fake) util para umbralizar decisiones.
- Procesamiento de audio a 16 kHz con normalizacion por clip.
- Inferencia en FP32; existe un drop-in TensorRT compatible con PyTorch (|dEER| <= 0,25 y Spearman >= 0,999 en el conjunto completo J-SPAW_LA).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de audio, no un modelo generativo.
- Capacidades multilingues: no documentadas; el entrenamiento es predominantemente en ingles.

## Casos de uso

- Verificacion de autenticidad en llamadas: integrar el modelo como filtro que puntua cada clip de 4 s y marca como sospechosas las llamadas con puntuacion baja, apoyandose en su entrenamiento con datos de ASVspoof y MLAAD.
- Moderacion de contenido en plataformas de audio: procesar subidas de voz y detectar deepfakes antes de su publicacion, usando la puntuacion continua para priorizar revision humana.
- Analisis forense de evidencia sonora: como componente de un pipeline que genera una puntuacion por segmento y permite al perito contrastar resultados entre detectores.
- Autenticacion de voz en banca o soporte telefonico: capa anti-spoofing previa a la verificacion del hablante, dado que el modelo esta entrenado explicitamente contra ataques de sintesis y conversion.
- Monitorizacion de medios y fact-checking: deteccion de audios sinteticos en entornos periodisticos, con umbral ajustable segun el coste relativo de falsos positivos y negativos.
- Investigacion en deteccion de deepfakes: modelo de referencia reproducible para comparar contra otros sistemas en la Speech Anti-Spoofing Arena, con resultados por dataset publicados.
- Filtrado en pipelines de datos de voz: descartar muestras sinteticas antes de entrenar modelos de ASR o de hablante, evitando contaminacion del corpus.

## Benchmarks y rendimiento

Resultados de la Speech Anti-Spoofing Arena. Metrica EER% (menor es mejor); EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR% en el umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 19,1 |
| ASVspoof2021_LA | 29,3 |
| ASVspoof2021_DF | 27,18 |
| ASVspoof5 | 38,56 (marcado n/a* por solapamiento de entrenamiento) |
| InTheWild | 73,37 |
| ADD22_eval_31 | 19,33 |
| ADD2023_track12_test_r1 | 29,94 |
| CFAD | 35,45 |
| CD-ADD | 34,33 (marcado n/a* por solapamiento) |
| CVoiceFake_small | 38,79 |
| DeepVoice | 31,05 |
| LibriSeVoc | 34,46 (marcado n/a* por solapamiento) |
| SONAR | 59,85 (marcado n/a* por solapamiento) |

Notas: la arena marca ASVspoof5, SONAR, CD-ADD y LibriSeVoc como n/a* por solapamiento con el entrenamiento. El habla bona fide de estudio limpia queda fuera de dominio para estos checkpoints; varias celdas son cercanas al azar o invertidas y se conservan por decision del mantenedor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3-1,8 GB solo para pesos (315,44M parametros x 4 bytes), mas activaciones y buffers; el repo ocupa 1,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; los resultados de la arena se generaron en RTX 4070 Ti SUPER, RTX 5060 Ti y RTX 4060 Ti.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: PyTorch con transformers (Wav2Vec2Model), drop-in TensorRT en FP32; no se documenta soporte de vLLM, llama.cpp u Ollama (no aplica a un clasificador de audio).
- Latencia y throughput: no disponibles de forma numerica; la arena limita el audio a 4 s (64600 muestras) y el modelo original puntua clips completos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NII-SLT26-XLSR-FC | 315,44 M | 4 s (16 kHz) | 19,1% | CC BY-NC 4.0 | Hugging Face |
| AASIST | no disponible | no disponible | no disponible | no disponible | no disponible |
| RawNet2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables; la comparativa cuantitativa con alternativas como AASIST o RawNet2 no esta disponible.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion; limita su adopcion en productos de pago.
- Riesgo de falsos positivos y negativos elevado en dominios fuera de entrenamiento: el habla bona fide de estudio limpia esta fuera de dominio y varias celdas de la arena son cercanas al azar o invertidas (por ejemplo, InTheWild con 73,37% de EER).
- Solapamiento de entrenamiento con ASVspoof5, SONAR, CD-ADD y LibriSeVoc: sus resultados no son una medida valida de generalizacion.
- Entrenamiento predominantemente en ingles; el rendimiento en otros idiomas no esta documentado.
- Es un clasificador binario, no un modelo generativo: no soporta razonamiento, codigo ni tool calling.
- La normalizacion por clip y el recorte a 4 s de la arena pueden alterar la puntuacion respecto al uso original con clips completos.
- Riesgo de sesgo por la composicion del corpus de entrenamiento (fuentes y condiciones acusticas concretas); no se documentan analisis de sesgo por genero, edad o acento.
- En produccion conviene combinar la puntuacion con umbrales calibrados y revision humana, dado el caracter probabilistico de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-XLSR-FC
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Codigo de los autores: https://github.com/nii-yamagishilab/AntiDeepfake-AudioLLM/tree/2d445b525bb52518448b353fe1fee51d5f815af9
- Paper: https://arxiv.org/abs/2610.17617
- Pesos (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-XLSR-FC/blob/60b2822b59f136d86644e9f251092c49265569d4/nii_slt26_xlsr_fc.safetensors
