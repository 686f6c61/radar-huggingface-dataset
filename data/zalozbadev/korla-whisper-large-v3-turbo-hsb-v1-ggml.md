# zalozbadev/korla-whisper-large-v3-turbo-hsb-v1-ggml

## Resumen

korla-whisper-large-v3-turbo-hsb-v1-ggml es una conversion en formato GGML del modelo Whisper large-v3-turbo afinado para el alto sorabo (Upper Sorbian, codigo ISO `hsb`), una lengua eslava minoritaria hablada principalmente en la region de Lusacia, en Alemania. El autor del repositorio es zalozbadev, que publica los pesos convertidos a partir del modelo original Korla/whisper-large-v3-turbo-hsb-v1, a su vez derivado del checkpoint oficial openai/whisper-large-v3-turbo mediante fine-tuning supervisado.

El proposito del repositorio es exclusivamente de distribucion: ofrece los pesos ya convertidos para su uso con whisper.cpp, el runtime en C/C++ de referencia para Whisper, de modo que el modelo pueda ejecutarse en CPU y en hardware modesto sin depender del stack Python de PyTorch. Solo se publica la cuantizacion Q8_0, lo que reduce el peso del repositorio a aproximadamente 2,5 GB.

Se trata de un modelo de reconocimiento automatico del habla (ASR) de unos 809 millones de parametros, basado en la arquitectura encoder-decoder transformer de Whisper con atencion de contexto completo. Su relevancia es acotada pero real: cubre una lengua con muy pocos recursos y lo hace con un runtime ligero, lo que lo convierte en una pieza util para proyectos de preservacion linguistica, transcripcion de material audiovisual en sorabo y despliegue en entornos sin aceleracion GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | aproximadamente 809 millones (arquitectura base large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper); no disponible detalle adicional |
| Tipos de cuantizacion | Q8_0 (unica publicada) |
| Idiomas soportados | hsb (alto sorabo) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con procesamiento de audio en ventanas de 30 segundos, representacion log-Mel de 80 canales y vocabulario multilingue heredado del modelo original. La variante turbo reduce el numero de capas del decoder respecto a large-v3, lo que rebaja el coste de inferencia manteniendo la calidad del encoder. El modelo original fue entrenado por OpenAI sobre un corpus masivo de audio y transcripciones, con datos de 99 idiomas.

El proceso especifico de fine-tuning para alto sorabo no esta documentado en la informacion disponible: la model card del repositorio GGML no detalla el numero de horas de audio, la procedencia del corpus ni si se aplicaron tecnicas de aumento de datos o destilacion. Tampoco se documenta si el ajuste fue supervisado puro o si incluyo etapas de alineacion. La conversion a GGML preserva la arquitectura y solo cambia el formato de los pesos y su precision (Q8_0), de modo que las capacidades del modelo son las del checkpoint original Korla/whisper-large-v3-turbo-hsb-v1.

## Capacidades

- Reconocimiento automatico del habla en alto sorabo (`hsb`) con salida de transcripcion en texto.
- Transcripcion de audio de hasta 30 segundos por ventana, con encadenamiento de ventanas para audios mas largos.
- Deteccion de actividad de voz y segmentacion temporal propias del pipeline de Whisper.
- Traduccion y transcripcion multilingue heredadas del modelo base: el fine-tuning se centra en `hsb`, pero el vocabulario y el encoder proceden de un modelo de 99 idiomas, por lo que el comportamiento en otros idiomas no esta garantizado ni documentado.
- No dispone de tool calling ni de function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio generativo.
- La etiqueta `text-to-speech` del repositorio es incorrecta para la funcion real del modelo, que es ASR (speech-to-text).

## Casos de uso

- Transcripcion de archivos de audio en alto sorabo para archivos y bibliotecas regionales: el modelo puede procesar grabaciones de entrevistas, radiodifusion o documentales en Lusacia y generar transcripciones en `hsb`, tarea para la que practicamente no existen alternativas publicas.
- Preservacion linguistica y corpus linguisticos: util para generar transcripciones alineadas de material oral que alimenten corpus anotados de una lengua minoritaria, con el pipeline de segmentacion de Whisper para marcas temporales.
- Subtitulado de contenido audiovisual sorabo: la salida con timestamps permite generar subtitulos para videos educativos o divulgativos, ejecutando el modelo en CPU con whisper.cpp sin necesidad de GPU.
- Despliegue en entornos con hardware limitado: al estar en GGML Q8_0 y disenado para whisper.cpp, puede correr en portatiles y servidores sin aceleracion, lo que lo hace adecuado para oficinas locales, escuelas o proyectos con presupuesto reducido.
- Investigacion en ASR de bajos recursos: sirve como punto de partida o linea base para experimentos de fine-tuning adicional, evaluacion de modelos multilingues en lenguas minoritarias y comparacion con otros checkpoints sorabos.
- Integracion en aplicaciones de accesibilidad: transcripcion en tiempo casi real de conversaciones o clases en sorabo para personas con discapacidad auditiva, usando la API de whisper.cpp integrada en una aplicacion de escritorio o movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER) ni comparaciones con otros modelos, y el repositorio no aporta metricas de evaluacion para `hsb`.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q8_0, el fichero ronda los 2,5 GB en disco; en memoria, whisper.cpp necesita aproximadamente esa cifra mas el buffer de trabajo del encoder y del decoder, por lo que se estima un consumo de entre 3 y 4 GB de RAM/VRAM segun la longitud del audio y el backend.
- GPU recomendadas: no se especifican en la informacion disponible. Al ser un modelo de 809 millones de parametros en Q8_0, cualquier GPU con al menos 4 GB de memoria libre es suficiente en teoria; tarjetas como RTX 3060, RTX 4060 o superiores son holgadas. En el extremo profesional, A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de memoria, y tambien en CPU pura.
- Opciones de despliegue: whisper.cpp es el runtime soportado oficialmente por el repositorio. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que no son runtimes adecuados para Whisper.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend (CPU, CUDA, Metal, Vulkan) y de la duracion del audio; no se aportan cifras en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| korla-whisper-large-v3-turbo-hsb-v1-ggml | ~809 M | 30 s por ventana | hsb | CC-BY-SA-4.0 | GGML (Q8_0) |
| openai/whisper-large-v3-turbo | ~809 M | 30 s por ventana | 99 idiomas | MIT (pesos originales de OpenAI) | safetensors, GGML via conversiones |
| Korla/whisper-large-v3-turbo-hsb-v1 | ~809 M | 30 s por ventana | hsb | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| whisper-large-v3 | ~1550 M | 30 s por ventana | 99 idiomas | MIT | safetensors, GGML |

La comparacion con whisper-large-v3-turbo original es la mas directa: mismo tamano y misma arquitectura, pero el modelo de OpenAI cubre 99 idiomas con calidad general mientras que este checkpoint esta especializado en `hsb`. Frente a whisper-large-v3, este modelo es aproximadamente la mitad en parametros, lo que reduce el coste de inferencia a cambio de menor capacidad general. El checkpoint Korla original es la fuente del que se deriva este repositorio; la diferencia practica es el formato GGML listo para whisper.cpp.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma declarado (`hsb`); el rendimiento en otros idiomas no esta documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion: Whisper tiende a generar texto plausible en pasajes de silencio, ruido o audio musical; no se documenta ninguna mitigacion especifica en este checkpoint.
- Sesgos: no se dispone de informacion sobre la composicion del corpus de fine-tuning, por lo que no se pueden evaluar sesgos de dominio, hablante, genero o registro.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para productos propietarios que incorporen el modelo.
- La etiqueta `text-to-speech` del repositorio es incorrecta; el modelo es de reconocimiento del habla, lo que puede confundir a quien lo busque por ese pipeline.
- Solo se publica la cuantizacion Q8_0; no hay variantes mas pequenas (Q5, Q4) para hardware muy restringido.
- El repositorio tiene cero descargas y cero likes, y no incluye documentacion de evaluacion ni de procedencia del corpus, lo que limita la confianza para uso en produccion sin validacion propia.
- La fecha de creacion indicada (2026-10-30) es futura respecto al momento de redaccion; conviene verificar la integridad del repositorio antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zalozbadev/korla-whisper-large-v3-turbo-hsb-v1-ggml
- Modelo original del fine-tuning: https://huggingface.co/Korla/whisper-large-v3-turbo-hsb-v1
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Runtime whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper: https://arxiv.org/abs/2212.04356
