# thealper2/whisper-base-turkish-khanacademy

## Resumen

whisper-base-turkish-khanacademy es un modelo de reconocimiento automatico del habla (ASR) en turco, publicado por el usuario thealper2 (Alper Karaca) en HuggingFace. Se trata de un fine-tuning de openai/whisper-base (revision `e37978b90c`) sobre el dataset ysdede/khanacademy-turkish (revision `77e33a6d4a`), compuesto por audio de clases de Khan Academy en turco. El objetivo es mejorar la transcripcion de habla turca en dominio educativo, donde el modelo base presenta un WER normalizado del 28,33 por ciento frente al 14,5 por ciento obtenido por este fine-tuning en el split de test.

El modelo conserva la arquitectura completa de Whisper base: un transformer encoder-decoder de 72.593.920 parametros con ventana de entrada de 30 segundos y sin prediccion de timestamps (el autor entreno explicitamente sin tokens de tiempo). El repositorio ocupa 0,3 GB y se distribuye en safetensors bajo licencia Apache-2.0, con un coste de inferencia muy bajo que lo hace desplegable incluso en CPU.

Su relevancia actual es doble: por un lado, ofrece un baseline turco de bajo coste para transcripcion de contenido educativo (STEM, economia, historia, historia del arte); por otro, sirve como punto de partida reproducible para fine-tunings adicionales, ya que el autor documenta de forma detallada el procedimiento de entrenamiento, las metricas de validacion y test, y las limitaciones del dataset. La contrapartida principal es que el corpus de entrenamiento deriva de contenido Khan Academy con licencia CC BY-NC-SA 3.0, lo que condiciona el uso comercial del modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base), 6 capas de encoder y 6 de decoder |
| Parametros totales | 72.593.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (espectrograma mel de 80 canales); audio mas largo requiere chunking |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors, tamaño de repo 0,3 GB, compatible con conversiones externas a int8/GGUF) |
| Idiomas soportados | turco (tr) para la tarea afinada; el modelo base soporta multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura estandar de Whisper: un encoder que procesa el espectrograma mel logaritmico de la entrada de audio y un decoder autorregresivo que genera los tokens de texto, con una ventana fija de 30 segundos. El entrenamiento se realizo partiendo de los pesos de openai/whisper-base durante 4,86 de las 5 epocas maximas previstas, con 3750 pasos de optimizador, batch size por dispositivo de 16 y acumulacion de gradiente 2 (batch efectivo de 32). Se uso una tasa de aprendizaje de 2,5e-05 con scheduler lineal y warmup del 5 por ciento, weight decay 0,01, clipping de norma de gradiente en 1,0 y precision mixta bf16. La perdida se calculo sobre la secuencia `<|tr|><|transcribe|><|notimestamps|> texto <|endoftext|>`, es decir, sin tokens de timestamp. El entrenamiento completo tardo 49,1 minutos en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB.

Los datos proceden del dataset ysdede/khanacademy-turkish: 24.665 clips de entrenamiento (70,65 horas), 1000 clips de validacion (2,97 horas, muestreados con semilla 42 del split de train original excluyendo transcripciones duplicadas) y 1355 clips de test (3,86 horas, split oficial sin filtrar). El audio de origen esta en Opus, 48 kHz mono, y se remuestrea a 16 kHz en la decodificacion. El filtrado de train y validacion elimino clips de duracion inferior a 0,5 s o superior a 30 s, segmentos con mas de 25 caracteres por segundo (desalineados) y etiquetas de mas de 440 tokens. Las transcripciones se usaron tal cual, con mayusculas y puntuacion, sin normalizacion de texto durante el entrenamiento; la normalizacion (NFC, minusculas turcas con `I→ı` e `İ→i`, apostrofes eliminados y resto de puntuacion sustituida por espacios, sin plegado a ASCII) se aplico solo en la evaluacion. No se documento uso de RLHF, DPO ni ninguna tecnica de alineacion adicional; se trata de un fine-tuning supervisado puro.

## Capacidades

- Transcripcion de voz a texto en turco, con decodificacion greedy, `language="turkish"` y `task="transcribe"`.
- Procesamiento de audio mono a 16 kHz en segmentos de hasta 30 segundos.
- Transcripcion de dominio educativo: material STEM, economia, historia e historia del arte, procedente de clases de Khan Academy.
- Manejo de texto con mayusculas y puntuacion en la salida (el modelo fue entrenado con transcripciones sin normalizar).
- Uso como modelo base para fine-tunings posteriores en turco (transfer learning desde un checkpoint ya adaptado al idioma).
- No soporta prediccion de timestamps: el autor entreno explicitamente con `<|notimestamps|>`.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio generativo; es exclusivamente un modelo ASR.
- Capacidad multilingue heredada del modelo base, pero no validada ni ajustada en este fine-tuning: solo el turco esta respaldado por metricas.

## Casos de uso

- Transcripcion de clases y cursos en turco: el modelo esta afinado exactamente sobre audio de clases de Khan Academy (STEM, economia, historia, arte), por lo que su WER normalizado de 14,5 por ciento en test es representativo de ese dominio. Se integraria en un pipeline que decodifica el audio a 16 kHz, aplica la pipeline `automatic-speech-recognition` con `chunk_length_s=30` y persiste el texto por leccion.
- Generacion de subtitulos para MOOCs y plataformas de e-learning turcas: usando chunking de 30 s y un post-proceso de segmentacion, se puede producir el texto base de subtitulos que despues se alinearia temporalmente con herramientas externas, dado que el modelo no emite timestamps.
- Accesibilidad para estudiantes con discapacidad auditiva: transcripcion en tiempo casi real de material grabado o en directo con latencia baja gracias a los 72,6 millones de parametros, que permiten inferencia en CPU o en GPU de gama de entrada.
- Indexacion y busqueda semantica sobre archivos de audio educativos: transcripcion masiva de un catalogo de cursos en turco y posterior generacion de embeddings para un sistema RAG que permita buscar fragmentos por contenido.
- Resumen automatico y generacion de apuntes: la transcripcion se encadena a un modelo de lenguaje que produce resumenes, preguntas de autoevaluacion o esquemas a partir del texto generado.
- Baseline para evaluacion y comparacion de ASR turco: sirve como referencia reproducible (mismos splits, misma normalizacion documentada) para medir mejoras de modelos mas grandes o de tecnicas de aumento de datos en turco.
- Transcripcion de bajo coste en despliegues con recursos limitados: con pesos de aproximadamente 290 MB en fp32 y 145 MB en fp16, cabe en cualquier GPU de consumo, en placas integradas y en CPU, lo que habilita procesamiento por lotes en servidores sin acelerador.
- Punto de partida para fine-tuning especifico de un cliente o de un vertical concreto (por ejemplo, audio financiero o sanitario en turco), reutilizando el checkpoint como inicializacion en lugar de partir del Whisper base multilingue.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente). Decodificacion greedy con `language="turkish"`, `task="transcribe"` y el mejor checkpoint seleccionado por WER normalizado en validacion.

| Split | Muestras | WER norm. | CER norm. | WER raw | CER raw |
|---|---|---|---|---|---|
| validation, zero-shot `openai/whisper-base` | 1000 | 28,33 | 9,83 | 37,59 | 11,78 |
| validation (modelo afinado) | 1000 | 13,58 | 4,49 | 22,41 | 5,95 |
| test (modelo afinado) | 1355 | 14,5 | 4,77 | 23,16 | 6,4 |

Definiciones aportadas por el autor: `raw` es sensible a mayusculas y puntuacion, con colapso de espacios en blanco unicamente; `norm` aplica NFC, minusculas turcas (`I→ı`, `İ→i`), eliminacion de apostrofes y sustitucion del resto de puntuacion y simbolos por espacios, sin plegar las letras turcas a ASCII.

No se han publicado en la informacion disponible resultados de benchmarks estandar (FLEURS, Common Voice, MMLU u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 290 MB en fp32, 145 MB en fp16/bf16 y unos 73 MB en int8 para los pesos; el pico real depende del tamaño de lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre. El autor entreno el modelo en una NVIDIA GeForce RTX 5060 Ti de 15,9 GB, pero la inferencia es viable en tarjetas muy inferiores (GTX 1050 Ti, RTX 3050, iGPU recientes).
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales y en muchas integradas, dado que el modelo completo ocupa menos de 300 MB en fp32.
- Despliegue en CPU: viable con factores de forma ligeros; el modelo base Whisper de este tamaño es uno de los mas usados para inferencia en CPU.
- Opciones de despliegue: transformers (`WhisperForConditionalGeneration` + `WhisperProcessor`), pipeline `automatic-speech-recognition` con `chunk_length_s=30`, HF Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), conversion a CTranslate2/faster-whisper, whisper.cpp/GGUF y ONNX Runtime. El soporte nativo en vLLM y TGI para modelos ASR Whisper no esta disponible de forma general.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. El dato mas cercano es el tiempo de entrenamiento (49,1 minutos para 3750 pasos con batch efectivo de 32), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de entrada | WER norm. (dataset Khan Academy turco) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/whisper-base-turkish-khanacademy | 72,6 M | 30 s | 14,5 (test), 13,58 (validation) | apache-2.0 | safetensors en HuggingFace |
| openai/whisper-base (zero-shot) | 74 M aprox. | 30 s | 28,33 (validation) | MIT | safetensors/PyTorch en HuggingFace |
| openai/whisper-small | 244 M aprox. | 30 s | no disponible en la informacion | MIT | safetensors/PyTorch en HuggingFace |
| openai/whisper-large-v3 | 1550 M aprox. | 30 s | no disponible en la informacion | MIT | safetensors/PyTorch en HuggingFace |

La comparacion directa solo es posible contra el modelo base, cuyos resultados zero-shot en el split de validacion publica el propio autor: el fine-tuning reduce el WER normalizado de 28,33 a 13,58 (una mejora relativa de aproximadamente el 52 por ciento) y el CER normalizado de 9,83 a 4,49. Para whisper-small y whisper-large-v3 no hay resultados publicados sobre este dataset en la informacion disponible, por lo que no se puede afirmar si este modelo de 72,6 M los supera en dominio educativo turco.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se realizo exclusivamente sobre audio de clases de Khan Academy (STEM, economia, historia, historia del arte). El rendimiento fuera de ese registro (conversacion espontanea, telefono, ruido de fondo, acentos no representados) no esta medido y previsiblemente sera peor.
- Ventana de 30 segundos: el audio mas largo exige chunking, con el riesgo de cortes en fronteras de frase y perdida de contexto entre segmentos.
- Sin timestamps: el modelo se entreno con `<|notimestamps|>`, por lo que no puede alinear la transcripcion con el audio sin un paso externo de forced alignment.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos con silencio, ruido o habla ininteligible, especialmente en decodificacion greedy sobre audio fuera de dominio.
- Licencia del dato de entrenamiento: el contenido de Khan Academy esta bajo CC BY-NC-SA 3.0, lo que introduce una restriccion de uso no comercial sobre el corpus que condiciona la explotacion comercial del modelo, aunque los pesos se publiquen como apache-2.0. Conviene revisar esta discrepancia antes de un despliegue en produccion.
- Contaminacion potencial de la evaluacion: el dataset no incluye identificadores de hablante ni de video, y los clips de test podrian proceder de los mismos videos que los de entrenamiento. Las metricas de test deben interpretarse con esa cautela.
- Solo turco: no hay metricas para otros idiomas, y el ajuste fino puede haber degradado el rendimiento multilingue del modelo base.
- Sesgos: no se ha publicado ningun analisis de sesgos por acento, genero, edad o procedencia del hablante. La unica fuente de audio es material educativo de una unica plataforma.
- Metricas no verificadas: todos los valores de la model card estan marcados como no verificados de forma independiente.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado paper asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/whisper-base-turkish-khanacademy
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ysdede/khanacademy-turkish
- Perfil del autor en GitHub: https://github.com/thealper2
- Otro modelo del mismo autor (MiniCPM5-1B-Turkish): https://huggingface.co/thealper2/MiniCPM5-1B-Turkish
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Paquete openai-whisper en PyPI: https://pypi.org/project/openai-whisper/
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
