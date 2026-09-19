# suebphatt/thonburian-whisper-ggml

## Resumen

Thonburian Whisper — GGML es un repositorio de distribucion publicado por el usuario suebphatt que contiene dos ficheros GGML ya convertidos y cuantizados a Q5_0 del modelo Thonburian Whisper, un ajuste fino de Whisper para tailandes desarrollado por BiodatLab. No se trata de un modelo entrenado desde cero: los pesos proceden de `biodatlab/whisper-th-large-v3-combined` y `biodatlab/whisper-th-medium-combined`, y el autor solo ha ejecutado el pipeline de conversion `convert-h5-to-ggml.py` (a F16) seguido de `whisper-quantize ... q5_0`, sin modificar los pesos mas alla de la cuantizacion.

El objetivo declarado es facilitar la transcripcion de voz en tailandes totalmente offline mediante whisper.cpp, en concreto para el proyecto OnTheKey (dictado en tailandes sin conexion). Se publican dos variantes: `thonburian-large-v3-q5_0.bin` (1,03 GB) y `thonburian-medium-q5_0.bin` (539 MB), lo que permite elegir entre mayor precision (large-v3) o menor huella de memoria (medium).

El repositorio ocupa 1,6 GB, esta bajo licencia Apache-2.0 (heredada de los modelos upstream) y, en el momento de la consulta, no registra descargas ni likes. Es relevante por dos motivos: reduce la barrera de entrada para desplegar ASR tailandes en CPU, y aporta sumas de verificacion SHA-256 para validar la integridad de los ficheros convertidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); se distribuyen pesos convertidos a GGML |
| Parametros totales | No disponible en la informacion proporcionada; corresponden a las arquitecturas Whisper large-v3 y Whisper medium de OpenAI |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | Q5_0 (ficheros publicados); F16 usado como paso intermedio en la conversion |
| Idiomas soportados | Tailandes (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

Thonburian Whisper es un ajuste fino de la familia Whisper (arquitectura Transformer encoder-decoder orientada a reconocimiento automatico del habla) sobre datos en tailandes. Los modelos base declarados son `biodatlab/whisper-th-large-v3-combined` y `biodatlab/whisper-th-medium-combined`, ambos publicados por BiodatLab. El paper asociado, «Thonburian Whisper: Robust Fine-tuned and Distilled Whisper for Thai» (ICNLSP 2024), describe el ajuste fino y destilacion de Whisper para tailandes, aunque no se dispone de los detalles de composicion del dataset ni del numero de tokens de entrenamiento en la informacion proporcionada.

Este repositorio concreto no entrena ni ajusta nada: aplica el script `models/convert-h5-to-ggml.py` de whisper.cpp para transformar los pesos a F16 y despues los cuantiza a Q5_0 con `whisper-quantize`. El README indica explicitamente que «no weights were changed beyond quantization», es decir, la unica transformacion es la cuantizacion. Se incluye un fichero `checksums.sha256` para verificar la integridad de los binarios.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tailandes, con transcripcion de audio a texto.
- Ejecucion totalmente offline mediante whisper.cpp, sin dependencia de servicios en la nube.
- Generacion de marcas de tiempo a nivel de segmento/palabra propias de whisper.cpp (funcionalidad del runtime, no una capacidad adicional del modelo).
- Dos tamanos disponibles (large-v3 y medium) para intercambiar precision por consumo de memoria.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No soporta vision, audio como salida ni modo de razonamiento explicito.
- Capacidad multilingue: limitada al tailandes en este ajuste fino (el Whisper original es multilingue, pero el ajuste Thonburian se ha especializado en th).
- No es un modelo generativo de texto general: su unica tarea es la transcripcion de voz.

## Casos de uso

- Dictado offline en tailandes: es el caso de uso declarado por el autor (proyecto OnTheKey). El fichero medium Q5_0 (539 MB) permite escribir por voz sin conexion en equipos de gama baja.
- Transcripcion de reuniones y notas de voz: con whisper.cpp se pueden procesar grabaciones en tailandes por segmentos, eligiendo large-v3 cuando se prioriza la precision del texto.
- Subtitulado de contenido audiovisual tailandes: el runtime genera marcas de tiempo que se pueden mapear a ficheros de subtitulos para video.
- Atencion al cliente y analitica de llamadas: transcripcion de conversaciones telefonicas en tailandes para su posterior indexacion o analisis, ejecutable en servidores propios sin enviar audio a terceros.
- Investigacion en ASR tailandes: sirve como referencia cuantizada para comparar WER frente a los pesos originales en safetensors o frente a otros ajustes.
- Despliegue en dispositivos con recursos limitados: la variante medium Q5_0 es adecuada para equipos sin GPU o para integracion en aplicaciones de escritorio y moviles compatibles con whisper.cpp.
- Accesibilidad: transcripcion de voz a texto en tailandes para personas con dificultades auditivas en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del repositorio no incluye metricas de WER ni comparativas, y los resultados que pueda reportar el paper «Thonburian Whisper: Robust Fine-tuned and Distilled Whisper for Thai» no se proporcionan en los datos facilitados.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero medium Q5_0 ocupa 539 MB y el large-v3 Q5_0 ocupa 1,03 GB; la memoria necesaria en tiempo de ejecucion es aproximadamente el tamano del fichero mas el overhead del runtime (estimacion orientativa, no confirmada en la informacion proporcionada).
- Al estar en formato GGML para whisper.cpp, la inferencia puede ejecutarse en CPU, sin necesidad de GPU.
- GPU recomendadas: no se especifican en la informacion proporcionada; whisper.cpp puede aprovechar aceleracion por GPU, pero no se detallan modelos concretos compatibles.
- Viabilidad en GPU de consumo: al no requerir GPU, cabe en practicamente cualquier equipo de consumo; la variante medium es la mas adecuada para hardware muy limitado.
- Opciones de despliegue: whisper.cpp (`whisper-cli -m thonburian-medium-q5_0.bin -l th -f audio.wav`). Otros runtimes LLM como vLLM o TGI no son aplicables a este formato ni a esta tarea.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Idioma | Tamano/parametros | Licencia |
|---|---|---|---|---|
| suebphatt/thonburian-whisper-ggml (este repo) | GGML Q5_0 | Tailandes | 539 MB (medium) / 1,03 GB (large-v3) | Apache-2.0 |
| biodatlab/whisper-th-large-v3-combined | Safetensors (HuggingFace) | Tailandes | No disponible | Apache-2.0 |
| biodatlab/whisper-th-medium-combined | Safetensors (HuggingFace) | Tailandes | No disponible | Apache-2.0 |
| openai/whisper-large-v3 | Safetensors | Multilingue | No disponible | Apache-2.0 |
| openai/whisper-medium | Safetensors | Multilingue | No disponible | Apache-2.0 |

La diferencia principal frente a los modelos de BiodatLab es el formato: este repositorio ofrece pesos ya cuantizados a Q5_0 y listos para whisper.cpp, mientras que los originales estan en safetensors y requieren conversion. Frente a los Whisper originales de OpenAI, la ventaja es la especializacion en tailandes, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Es un repositorio de conversion, no un modelo nuevo; cualquier limitacion de los modelos Thonburian originales se hereda aqui.
- El ajuste esta especializado unicamente en tailandes (th); no debe usarse para otros idiomas.
- La cuantizacion a Q5_0 puede degradar ligeramente la calidad de transcripcion respecto a los pesos F16 o a los originales en safetensors; no se aportan metricas que cuantifiquen esa perdida.
- Riesgo de alucinacion propio de Whisper en fragmentos con silencio, ruido o audio musical, en los que el modelo puede generar texto inexistente.
- Whisper procesa ventanas de audio de aproximadamente 30 segundos; para audios mas largos es necesario trocear y ensamblar, lo que puede introducir errores en las fronteras.
- El repositorio no registra descargas ni likes, y no hay validacion independiente de los ficheros publicados; se recomienda verificar `checksums.sha256` antes de usarlos.
- La licencia Apache-2.0 permite uso comercial, siempre que se respeten las condiciones de atribucion correspondientes; conviene revisar tambien la licencia y condiciones de los modelos upstream de BiodatLab y de Whisper.
- No se documentan sesgos especificos ni el dominio de entrenamiento, por lo que el rendimiento puede variar segun el acento, el registro o la calidad del audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suebphatt/thonburian-whisper-ggml
- Proyecto Thonburian Whisper (BiodatLab): https://github.com/biodatlab/thonburian-whisper
- Modelo base large-v3: https://huggingface.co/biodatlab/whisper-th-large-v3-combined
- Modelo base medium: https://huggingface.co/biodatlab/whisper-th-medium-combined
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Paper «Thonburian Whisper: Robust Fine-tuned and Distilled Whisper for Thai» (ICNLSP 2024): https://aclanthology.org/2024.icnlsp-1.17/
- Documentacion de variantes y arquitectura (DeepWiki): https://deepwiki.com/biodatlab/thonburian-whisper/3-model-variants-and-architecture
- Proyecto OnTheKey: https://github.com/aedowon
