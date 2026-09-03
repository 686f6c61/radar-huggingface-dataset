# willopcbeta/kotoba-whisper-medical-ja-ONNX

## Resumen

El modelo `willopcbeta/kotoba-whisper-medical-ja-ONNX` es una conversión a formato ONNX del modelo `kenrouse/kotoba-whisper-medical-ja`, un sistema de reconocimiento automático del habla (ASR) especializado en terminología médica japonesa. El modelo original se obtiene mediante fine-tuning de `kotoba-tech/kotoba-whisper-v2.2`, un Whisper destilado de 756 millones de parámetros, sobre un corpus de audio sintético generado con TTS a partir del diccionario médico DMiME, que cubre aproximadamente 41.600 términos. La versión ONNX está pensada para su uso con Transformers.js en entornos de navegador o Node.js, lo que facilita su integración en aplicaciones web y móviles sin necesidad de infraestructura de servidor dedicada.

La relevancia de este modelo reside en su capacidad para transcribir con alta precisión vocabulario médico japonés, donde los modelos ASR genéricos suelen fallar en términos técnicos como nombres de fármacos, procedimientos y enfermedades. Al estar disponible en ONNX, se puede desplegar de forma ligera en clientes ligeros, manteniendo un rendimiento competitivo en comparación con modelos mucho más grandes. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción práctica para desarrolladores de soluciones sanitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer, destilado: encoder de 32 capas, decoder de 2 capas) |
| Parametros totales | 756 millones (aproximadamente) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo ASR; estandar Whisper: ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | No disponibles para la version ONNX; el modelo original ofrece GGML en FP16, Q8_0 y Q5_0 |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tambien disponible GGML para whisper.cpp en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original, pero con una configuración destilada: el encoder conserva 32 capas mientras que el decoder se reduce a 2 capas, lo que reduce significativamente el coste computacional en comparación con Whisper large. Esta destilación se realizó previamente en el proyecto kotoba-whisper-v2.2, que sirve como base. El fine-tuning posterior se llevó a cabo sobre un dataset de audio sintético generado mediante TTS (Azure Speech Service y Google Cloud Text-to-Speech) a partir de términos médicos extraídos del diccionario DMiME. El entrenamiento utilizó 66.015 muestras, 3 épocas, un batch efectivo de 16 (batch 2 con 8 pasos de acumulación de gradiente), una tasa de aprendizaje de 1e-5 y precisión FP16. No se aplicaron técnicas de RLHF ni DPO; se trata de un ajuste supervisado estándar.

Una innovación destacable es el uso de datos sintéticos para cubrir un vocabulario médico extenso, lo que permite mejorar la precisión en dominios especializados sin depender de grabaciones reales de consultas médicas. La conversión a ONNX se realizó automáticamente mediante el espacio Hugging Face `onnx-community/convert-to-onnx`, lo que garantiza compatibilidad con el ecosistema Transformers.js.

## Capacidades

- Reconocimiento de voz automatico en japones, con especial atencion a terminologia medica (farmacos, procedimientos, enfermedades).
- Transcripcion de audio de hasta 30 segundos por segmento (estandar Whisper), con posibilidad de procesar audio mas largo mediante segmentacion.
- Mejora del 16,6% en CER (Character Error Rate) respecto al modelo base kotoba-whisper-v2.2 en el corpus de evaluacion medica.
- Correccion de errores tipicos en terminos medicos, como "カテーテル" (cateter) en lugar de "過程テル", o "剥離術" en lugar de "白理術".
- Compatible con Transformers.js, lo que permite ejecucion en navegador y Node.js sin backend.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de consultas medicas en tiempo real: el modelo puede procesar audio capturado por un microfono en una aplicacion web y transcribir la conversacion entre medico y paciente, facilitando la generacion automatica de historias clinicas.
- Dictado de informes clinicos: un profesional sanitario puede dictar un informe en japones y el modelo lo transcribe con alta fidelidad en terminos tecnicos, reduciendo el tiempo de documentacion.
- Subtitulado de contenido audiovisual medico: la version ONNX puede integrarse en un reproductor de video o plataforma de e-learning para generar subtitulos en japones de conferencias, seminarios o videos educativos sobre medicina.
- Asistente de telemedicina: en plataformas de consulta remota, el modelo transcribe la llamada y extrae informacion relevante para el diagnostico, integrandose con sistemas de procesamiento de lenguaje natural.
- Busqueda y recuperacion de informacion en registros medicos: al transcribir notas de voz de profesionales, el modelo permite indexar y buscar contenido por terminos medicos especificos.
- Generacion de documentacion para ensayos clinicos: transcripcion de entrevistas y reuniones de investigacion, donde la precision en la terminologia es critica para el cumplimiento normativo.

## Benchmarks y rendimiento

La model card del modelo original proporciona resultados de evaluacion en un dataset medico propio (generado con TTS). No se dispone de benchmarks estandar como MMLU o HumanEval, ya que es un modelo ASR. La tabla siguiente resume los resultados de CER (menor es mejor) comparando el modelo fine-tuned con su base kotoba-whisper-v2.2.

| Modelo | CER global |
|---|---|
| kotoba-whisper-v2.2 (original) | 9,59% |
| kotoba-whisper-medical-ja (fine-tuned) | 8,00% |

Desglose por especialidad (CER, en porcentaje):

| Especialidad | Original | Fine-tuned |
|---|---|---|
| Cardiologia | 5,56% | 3,70% |
| Nefrologia | 13,04% | 6,52% |
| Reumatologia | 2,38% | 11,90% |
| Gastroenterologia | 13,64% | 4,55% |
| Neurologia | 13,33% | 13,33% |

Se observa una mejora sustancial en la mayoria de especialidades, aunque en reumatologia el rendimiento empeora, lo que sugiere una posible limitacion en ciertos subdominios.

## Requisitos de hardware

- Con 756 millones de parametros, el modelo en FP16 ocupa aproximadamente 1,5 GB, por lo que puede ejecutarse en GPUs consumer con 4 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Ti).
- Para inferencia en CPU, se recomienda usar las versiones cuantizadas GGML (Q8_0: 780 MB, Q5_0: 513 MB) disponibles en el modelo base, que funcionan con whisper.cpp o Whisper.NET.
- La version ONNX esta optimizada para Transformers.js y puede ejecutarse en el navegador mediante WebGPU o WebAssembly, sin necesidad de GPU dedicada, aunque la latencia sera mayor.
- Opciones de despliegue: Transformers.js (navegador/Node.js), ONNX Runtime, whisper.cpp (con los pesos GGML), vLLM no es aplicable por ser un modelo de audio.
- La latencia estimada para un segmento de 30 segundos en una GPU consumer moderna es inferior a 1 segundo; en CPU puede variar entre 2 y 5 segundos segun la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | CER (dataset medico) | Licencia | Formato |
|---|---|---|---|---|---|---|
| kotoba-whisper-medical-ja (este) | 756M | ja | 30 s audio | 8,00% | Apache 2.0 | ONNX, GGML |
| kotoba-whisper-v2.2 (base) | 756M | ja | 30 s audio | 9,59% | Apache 2.0 | PyTorch, GGML |
| whisper-large-v3 | 1550M | multilingue | 30 s audio | no disponible | MIT | PyTorch, ONNX, GGML |

La comparacion directa con whisper-large-v3 no es posible sin datos de evaluacion en el mismo corpus, pero el modelo fine-tuned ofrece una precision superior en terminologia medica japonesa con la mitad de parametros, lo que lo hace mas eficiente en entornos limitados.

## Limitaciones y advertencias

- Especializado exclusivamente en japones medico; su rendimiento en lenguaje general o en otros idiomas es inferior al de modelos ASR genericos.
- El entrenamiento se realizo con audio sintetico (TTS), que no reproduce todas las variaciones del habla real (acentos, ruido de fondo, superposicion de voces), lo que puede afectar a la robustez en entornos clinicos reales.
- En la evaluacion por especialidades, se observo una regresion en reumatologia (CER aumento de 2,38% a 11,90%), lo que indica una cobertura desigual de la terminologia.
- La version ONNX puede presentar ligeras diferencias numericas respecto al modelo original en PyTorch debido a la conversion, aunque en la practica suelen ser despreciables.
- No se proporcionan datos sobre sesgos de genero, edad o dialectos dentro del habla medica japonesa.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso de los datos de entrenamiento (derivados de DMiME) no infrinja derechos de terceros.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/willopcbeta/kotoba-whisper-medical-ja-ONNX
- Modelo original (kenrouse/kotoba-whisper-medical-ja): https://huggingface.co/kenrouse/kotoba-whisper-medical-ja
- Modelo base (kotoba-tech/kotoba-whisper-v2.2): https://huggingface.co/kotoba-tech/kotoba-whisper-v2.2
- Diccionario medico DMiME: https://dm-me.hatenablog.com/
- Espacio de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de Transformers.js (pipeline ASR): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
