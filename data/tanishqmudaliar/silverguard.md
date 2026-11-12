# tanishqmudaliar/SilverGuard

## Resumen

SilverGuard (identificado en su model card como SilverGuard-FastText-Fusion-v2) es un clasificador de texto ultraligero desarrollado por tanishqmudaliar para la deteccion de estafas por SMS, phishing, extorsion digital y spam comercial en el ecosistema de telecomunicaciones indio. El modelo aborda un problema concreto: los filtros de spam tradicionales no estan adaptados al multilingueismo indio ni al Hinglish romanizado, y los modelos transformer convencionales resultan demasiado pesados para ejecutarse en dispositivos de gama baja. SilverGuard resuelve esto con una arquitectura dual de embeddings FastText de n-gramas de caracteres combinada con un MLP sobre caracteristicas estructurales, empaquetada en ONNX para inferencia en CPU.

La propuesta central es la eficiencia: el modelo ocupa 56 KB de grafo mas 15,3 MB de tabla de embeddings, con un consumo de RAM inferior a 15 MB y latencias declaradas de 0,8 a 1,2 ms en CPU. Esto lo hace apto para ejecucion en smartphones Android con nucleos ARM Cortex-A53/A55, incluyendo dispositivos con Android Go. La taxonomia es de cuatro clases (Ham, Promocional, Spam comercial UCC, Scam/Phishing), lo que permite distinguir publicidad no deseada de fraude real, una distincion relevante para el cumplimiento de las normas TRAI DLT en India.

El modelo soporta ingles, hindi, marathi, tamil, telugu, bengali, gujarati y Hinglish romanizado. Se entrenó sobre un dataset unificado de 24.514 muestras procedentes de fuentes como Atherion 30K SMS, UCI SMS Spam Collection y datos de buzon personal. Su licencia es MIT y se distribuye en formato ONNX. Es relevante ahora porque demuestra que la clasificacion de seguridad puede desplegarse en el propio dispositivo sin depender de la nube, preservando la privacidad de los mensajes y funcionando en mercados con conectividad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastText subword character n-gram embeddings + MLP tabular (dual-branch early fusion) |
| Parametros totales | no disponible (56 KB de grafo + 15,3 MB de tabla de embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de texto, no generativo) |
| Tipos de cuantizacion | no disponible (modelo ya ultraligero en ONNX) |
| Idiomas soportados | Ingles, hindi, marathi, tamil, telugu, bengali, gujarati y Hinglish romanizado |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repo | 0,1 GB |
| Clases de salida | 4 (Ham, Promocional, Spam comercial UCC, Scam/Phishing) |
| Runtime | ONNX Runtime (CPU) |
| Consumo de RAM | < 15 MB |
| Latencia de inferencia (CPU) | ~0,8-1,2 ms |
| Hardware objetivo | Android ARM Cortex-A53/A55 |

## Arquitectura y entrenamiento

SilverGuard emplea una arquitectura hibrida de dos ramas fusionadas tempranamente. La primera rama, linguistica, mapea n-gramas de caracteres (n entre 3 y 5) mediante hashing CRC de 32 bits determinista en 60.000 cubos, embebidos con `nn.EmbeddingBag(60000, 64, mode="mean")`. Esto proporciona invariancia total a errores ortograficos del Hinglish, leetspeak (`p0lice`, `k-y-c`) y jerga regional, eliminando los errores de vocabulario fuera de dominio (OOV). La segunda rama procesa 12 indicadores estructurales de telecomunicaciones (numero de URLs, acortadores de enlaces, enlaces a IP directa, descargas de APK, telefonos de callback, simbolos de moneda, senales de urgencia, palabras clave promocionales, ratio de mayusculas, ratio de digitos, longitud y codigos de escritura indicos) a traves de un MLP de dos capas (`12 -> 32 -> 32`, ReLU).

Las representaciones se concatenan en un vector de 96 dimensiones (`64 + 32`) y se enrutan a una cabeza de clasificacion (`96 -> 4`) entrenada con pesos focales balanceados por clase. El entrenamiento se realizo sobre un dataset unificado de 24.514 muestras unicas, compilado y deduplicado con similitud Jaccard MinHash de 5-shingles (umbral J >= 0,85) y normalizacion canonica NFC. Las fuentes incluyen Atherion 30K SMS (8.599 muestras), UCI SMS Spam Collection (5.009 muestras), un buzon personal real y otras fuentes no detalladas en la informacion disponible. La model card no especifica el uso de RLHF, DPO ni el numero total de tokens de entrenamiento. La innovacion tecnica destacable es la preservacion del 100% de las matras indicas mediante normalizacion NFC canonica, frente a los tokenizadores ASCII convencionales que las eliminan.

## Capacidades

- Clasificacion de texto en 4 clases: Ham, Promocional, Spam comercial UCC y Scam/Phishing.
- Deteccion de phishing y enlaces maliciosos (acortadores, IP directa, descargas de APK).
- Deteccion de extorsion digital y suplantacion de autoridades (CBI, aduanas, avisos legales falsos).
- Deteccion de fraude de loteria, desactivacion falsa de KYC y campanas de ingenieria social.
- Distincion entre publicidad comercial legitima (remitentes registrados TRAI DLT con sufijo `-P`) y spam no solicitado desde numeros de 10 digitos no registrados.
- Manejo robusto de Hinglish romanizado, leetspeak y errores ortograficos foneticos sin errores OOV.
- Soporte multilingue en 7 idiomas indios mas ingles, con preservacion de escrituras indicas.
- Inferencia en el dispositivo (edge) con latencia de ~1 ms y sin dependencia de la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador, no un modelo generativo).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado de SMS en el propio dispositivo Android: el modelo se integra en la app de mensajeria y clasifica cada SMS entrante en ~1 ms con menos de 15 MB de RAM, sin enviar el contenido a la nube y preservando la privacidad del usuario en dispositivos de gama baja.
- Cumplimiento de TRAI DLT: distingue remitentes registrados con sufijo `-P` (promocional legitimo) de numeros de 10 digitos no registrados (UCC), permitiendo a operadores y agregadores aplicar politicas de DND y reportar infracciones con evidencia clasificada.
- Proteccion contra phishing bancario: detecta lures de desactivacion de KYC, enlaces acortados y APK maliciosos en mensajes que suplantan a SBI, HDFC u otras entidades, bloqueando el mensaje antes de que el usuario interactue.
- Deteccion de extorsion digital: identifica mensajes que suplantan a CBI, aduanas o policia con amenazas de detencion o lavado de dinero, un vector de fraude creciente en India, y los marca como Scam/Phishing para alertar al usuario.
- Moderacion de campanas de marketing: las plataformas de envio masivo pueden pre-clasificar lotes de SMS antes del envio para separar promociones conformes de contenido que caeria en spam o fraude, reduciendo reclamaciones y sanciones regulatorias.
- Analisis de bandejas de entrada en centros de atencion: un operador de telecomunicaciones puede procesar grandes volumenes de SMS reportados por usuarios con un modelo de bajo coste computacional para priorizar casos de fraude real frente a spam comercial.
- Investigacion y monitorizacion de amenazas: equipos de ciberseguridad pueden desplegar el clasificador en pipelines de ingesta de SMS reportados para etiquetar y agrupar campanas de estafa por idioma y estructura, alimentando paneles de inteligencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| SilverGuard-FastText-Fusion-v2 | SilverGuard-Indic-Unified-24k | Macro F1 | 0,8996 |
| SilverGuard-FastText-Fusion-v2 | SilverGuard-Indic-Unified-24k | Accuracy | 0,9494 |

Comparativa de eficiencia declarada por el autor frente a un baseline MobileBERT FP32:

| Metrica | SilverGuard v2.0 | MobileBERT FP32 (baseline) |
|---|---|---|
| Tamano del modelo | 56 KB grafo + 15,3 MB pesos | 105 MB |
| Latencia de inferencia (CPU) | ~0,8-1,2 ms | 18-25 ms |
| Huella de RAM maxima | < 15 MB | ~120 MB |
| Manejo de Hinglish/leetspeak | N-gramas de caracteres (cero OOV) | Alto OOV (`[UNK]`) |
| Preservacion de matras indicas | 100% (NFC canonico) | Eliminadas por tokenizadores ASCII |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU con menos de 15 MB de RAM.
- GPU recomendadas: no necesarias. El modelo esta disenado para CPU.
- Cabe en GPU consumer: si, pero es innecesario; el objetivo es ejecucion en CPU y en dispositivos moviles.
- Hardware objetivo: smartphones Android con nucleos ARM Cortex-A53/A55, incluidos dispositivos con Android Go.
- Opciones de despliegue: ONNX Runtime (CPU), integracion en apps Android nativas, pipelines de servidor de bajo coste.
- Latencia estimada: ~0,8-1,2 ms por inferencia en CPU (dato declarado por el autor).
- Throughput: no disponible de forma explicita, pero la latencia sub-milisegundo permite procesar miles de SMS por segundo en un solo nucleo.
- Almacenamiento: 56 KB de grafo mas 15,3 MB de tabla de embeddings (aproximadamente 15,4 MB en disco).

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SilverGuard v2.0 | 56 KB grafo + 15,3 MB embeddings | no aplica (clasificador) | Macro F1 0,8996; Accuracy 0,9494 | MIT | ONNX en Hugging Face |
| MobileBERT (baseline citado por el autor) | ~25 M parametros, 105 MB FP32 | 512 tokens | no disponible en la informacion | Apache 2.0 (tipica) | TensorFlow/PyTorch |
| Clasificadores transformer multilingues genericos | Cientos de millones de parametros | 512 tokens | no disponible | Variable | Hugging Face |

La comparativa directa con alternativas especializadas en deteccion de SMS scam en idiomas indicos no esta disponible en la informacion proporcionada. El unico punto de comparacion documentado es el baseline MobileBERT FP32 citado en la model card, donde SilverGuard declara ser aproximadamente 7 veces mas pequeno y 20 veces mas rapido en CPU.

## Limitaciones y advertencias

- Los resultados de benchmarks (Macro F1 0,8996, Accuracy 0,9494) estan declarados por el autor y marcados como no verificados; no han sido validados de forma independiente.
- El dataset de evaluacion (SilverGuard-Indic-Unified-24k) es de tipo custom y no es publico, lo que impide reproducir las metricas.
- El modelo esta especializado en el contexto de telecomunicaciones indio; su rendimiento fuera de ese dominio (otros paises, otros idiomas, otros canales como email o mensajeria instantanea) no esta documentado.
- Riesgo de falsos positivos en mensajes personales con jerga, abreviaturas o enlaces compartidos de forma legitima; el autor menciona el UCI SMS Spam Collection como fuente para reducir estas alarmas, pero no se publican metricas por clase.
- Riesgo de falsos negativos ante campanas de estafa que eviten deliberadamente los indicadores estructurales (sin URL, sin telefono, sin urgencia) o usen variantes ortograficas no cubiertas por los n-gramas.
- El modelo no es generativo: no puede explicar sus decisiones ni generar resumenes; solo devuelve una etiqueta de clase.
- No hay informacion sobre sesgos por idioma o region; el desequilibrio del dataset (por ejemplo, 5.977 muestras Ham frente a 771 Spam en Atherion 30K) podria afectar al rendimiento en clases minoritarias.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias ni soporte.
- El modelo se actualizo por ultima vez en noviembre de 2026 y tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La model card esta truncada en la informacion proporcionada; no se detallan todas las fuentes del dataset ni el proceso completo de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/tanishqmudaliar/SilverGuard
- Repositorio GitHub: https://github.com/tanishqmudaliar/SilverGuard
- Script de construccion del dataset: https://github.com/tanishqmudaliar/SilverGuard/blob/main/build_unified_dataset.py
- Dataset UCI SMS Spam Collection: https://huggingface.co/datasets/uciml/sms-spam-collection-dataset
- Dataset India Spam SMS Classification: https://huggingface.co/datasets/junioralive/india-spam-sms-classification
- Dataset Atherion 30K SMS (Kaggle): https://www.kaggle.com/datasets/atherionsystems/indian-scam-sms-30k
