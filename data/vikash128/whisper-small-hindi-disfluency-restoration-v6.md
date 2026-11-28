# vikash128/whisper-small-hindi-disfluency-restoration-v6

## Resumen

Whisper small Hindi disfluency restoration v6 es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla openai/whisper-small, publicado por el usuario vikash128 en Hugging Face. El modelo resuelve una tarea poco habitual: dado un audio en hindi y su transcripcion limpia (sin muletillas ni repeticiones), el decodificador genera la transcripcion verbatim, es decir, con las disfluencias presentes en el habla original. La model card lo enmarca en el contexto de "DLP 26T3 NPPE-2", sin mas detalles sobre el origen de la tarea.

Se trata, por tanto, de un modelo de restauracion de disfluencias orientado a la generacion de datos de entrenamiento o a la evaluacion de sistemas ASR, no de un transcriptor convencional. La arquitectura subyacente es la de Whisper small (transformer encoder-decoder con 241.734.912 parametros), entrenada originalmente por OpenAI sobre 680.000 horas de audio multilingue y ajustada aqui para el hindi. El contexto efectivo de Whisper small es de 1.500 posiciones (30 segundos de audio), y los pesos se distribuyen en safetensors con un tamano de repositorio de 1,0 GB.

Su relevancia es limitada pero especifica: permite sintetizar transcripciones verbatim a partir de texto limpio y audio, lo que resulta util para aumentar corpus de habla espontanea en hindi, un idioma con relativamente pocos recursos anotados con disfluencias. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque la ausencia de benchmarks publicados y de descargas (0 en el momento de la consulta) obliga a validar su calidad de forma local antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.500 posiciones (ventana de audio de 30 s, valor estandar de Whisper small) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se publican en safetensors, probablemente fp32 o fp16) |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Tamano del repositorio | 1,0 GB |
| Tarea | Restauracion de disfluencias (texto limpio + audio -> transcripcion verbatim) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper small: un encoder de audio que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto condicionados por tokens especiales de idioma y tarea. El ajuste fino se realiza sobre el checkpoint openai/whisper-small y conserva el esquema de prompt de Whisper, pero lo reutiliza de forma no convencional: el decoder recibe la transcripcion limpia como contexto previo mediante el token `<|startofprev|>` y se le pide generar la version verbatim con muletillas y repeticiones.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de tokens de audio vistos ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica la tarea (DLP 26T3 NPPE-2) y remite al cuaderno `inference.ipynb` para reproducir el decodificado exacto, lo que sugiere que la sensibilidad al formato del prompt es alta. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de transcripciones verbatim en hindi a partir de audio y de una transcripcion limpia de referencia.
- Restauracion de disfluencias: insercion de muletillas, repeticiones y falsos arranques propios del habla espontanea.
- Procesamiento de audio en ventanas de 30 segundos, con el preprocesado mel estandar de Whisper.
- Condicionamiento por prompt: el comportamiento depende del formato `<|startofprev|> texto limpio <|startoftranscript|><|hi|><|transcribe|><|notimestamps|>`.
- Soporte unicamente del hindi; no se documenta capacidad multilingue en este ajuste.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de vision, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Aumento de datos para ASR en hindi: dado un corpus de texto limpio y sus audios, el modelo genera transcripciones verbatim que pueden usarse para entrenar o evaluar sistemas de reconocimiento tolerantes a disfluencias.
- Creacion de conjuntos de evaluacion de robustez: permite construir pares (audio, transcripcion verbatim) para medir como se comportan otros ASR ante habla espontanea.
- Investigacion en linguistica de corpus: facilita anotar automaticamente fenomenos de habla espontanea (repeticiones, falsos arranques) en grabaciones en hindi sin anotacion manual.
- Simulacion de habla natural para TTS y dialogos: combinado con un TTS, permite generar audio mas realista a partir de texto limpio introduciendo disfluencias plausibles.
- Preprocesado en pipelines de subtitulado: ayuda a decidir que version de la transcripcion (limpia o verbatim) conservar segun el destino del subtitulo.
- Prototipado en entornos con recursos limitados: con 241 millones de parametros y pesos en safetensors de 1,0 GB, puede ejecutarse en una unica GPU de consumo para experimentos de investigacion.
- Validacion de hipotesis en tareas de reescritura de habla: sirve como componente en estudios sobre normalizacion de texto hablado, comparando la salida verbatim con la entrada limpia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16 (241,7 millones de parametros), y en torno a 1 GB en cuantizacion de 8 bits; el pico real depende de la implementacion y del tamano del lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para procesamiento por lotes a gran escala se recomienda A100 o H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con el pipeline de Whisper, vLLM (soporte de Whisper), llama.cpp no aplica directamente al ser un modelo de audio, y Ollama no dispone de soporte nativo para Whisper. Tambien es posible exportar a ONNX o usar faster-whisper para inferencia optimizada.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural de Whisper small, la inferencia de una ventana de 30 segundos suele completarse en decenas de milisegundos en GPU moderna, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vikash128/whisper-small-hindi-disfluency-restoration-v6 | 241,7 M | 30 s de audio (1.500 posiciones) | Hindi | Restauracion de disfluencias | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-small | 241,7 M | 30 s de audio (1.500 posiciones) | Multilingue (99 idiomas) | Transcripcion ASR | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74,4 M | 30 s de audio | Multilingue | Transcripcion ASR | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | 30 s de audio | Multilingue | Transcripcion ASR | Apache 2.0 | Hugging Face |

La comparativa directa con alternativas de restauracion de disfluencias en hindi no esta disponible: no se han identificado en la informacion proporcionada otros modelos publicos que realicen esta tarea concreta. Frente a whisper-small original, este ajuste no transcribe audio a texto de forma convencional, sino que transforma una transcripcion limpia en verbatim usando el audio como condicionante, por lo que no son intercambiables sin adaptar el pipeline.

## Limitaciones y advertencias

- No hay benchmarks publicados ni descargas registradas, por lo que la calidad real del ajuste no esta validada de forma independiente.
- La tarea es sensible al formato del prompt: la model card remite a `inference.ipynb` para el decodificado exacto; pequenas variaciones en los tokens especiales pueden degradar la salida.
- Riesgo de alucinacion: como todo modelo generativo condicionado por audio, puede inventar contenido no presente en el audio, especialmente en segmentos ruidosos o con habla solapada.
- Limitacion idiomatica: solo se documenta hindi; no se garantiza su comportamiento en otras lenguas ni en code-switching hindi-ingles, frecuente en el habla real.
- Ventana de audio de 30 segundos: audios mas largos requieren segmentacion, lo que puede romper la coherencia de las disfluencias entre segmentos.
- Sesgos: no se documenta la composicion del corpus de ajuste, por lo que se desconocen sesgos de genero, dialecto o registro (formal frente a coloquial).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar la atribucion y verificar que el modelo base openai/whisper-small mantiene las mismas condiciones.
- En produccion, conviene validar con un conjunto propio de referencia antes de desplegarlo, dado que no existe documentacion sobre la tasa de error en la restauracion de disfluencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikash128/whisper-small-hindi-disfluency-restoration-v6
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper (implementacion optimizada): https://github.com/SYSTRAN/faster-whisper
