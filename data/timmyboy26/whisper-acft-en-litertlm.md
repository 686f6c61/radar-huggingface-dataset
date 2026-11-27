# timmyboy26/whisper-acft-en-litertlm

## Resumen

Whisper ACFT en formato LiteRT-LM es un conjunto de tres paquetes `.litertlm` autocontenidos que empaquetan los checkpoints ACFT Whisper de FUTO (variantes tiny, base y small, solo en ingles) para su ejecucion en dispositivo mediante la tarea `AudioTranscriber` de MediaPipe (LiteRT-LM Omni) en Android. El modelo base es un fine-tuning de OpenAI Whisper realizado por FUTO que reduce la ventana de audio de los 30 segundos estandar a 10 segundos, lo que abarata drasticamente la transcripcion de grabaciones cortas (una grabacion de 3 segundos deja de costar lo mismo que una de 30). Los bundles los publica el usuario `timmyboy26` y los consume la aplicacion LLM Hub.

Cada bundle incluye tres secciones: metadatos de audio (Whisper, 16 kHz, ventana de 10 000 ms, 80 bins mel, 1000 frames, tokens de inicio `[50257, 50362]` y token de parada `50256`), el tokenizador Whisper solo-ingles comprimido con zlib y el grafo TFLite int8 de rango dinamico procedente de `litert-community/whisper-acft`. La unica modificacion respecto al grafo original es la reordenacion de los indices de entrada de la subgrafa `decode` para que coincidan con su firma; no se alteraron pesos ni operadores.

Su relevancia es practica: ofrece reconocimiento de voz en dispositivo, sin red, con licencia Apache-2.0 y tamanos que van de 60 MB a 287 MB, lo que permite integrar ASR en aplicaciones Android con un consumo de almacenamiento y memoria muy contenido. No es un modelo de lenguaje general, sino un componente especializado de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), grafo TFLite int8 de rango dinamico empaquetado en `.litertlm` |
| Parametros totales | No disponible (tres variantes: tiny, base y small de Whisper) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 10 000 ms (10 s); 1000 frames, 80 bins mel |
| Tipos de cuantizacion | Int8 de rango dinamico (`drq`) en los grafos TFLite |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (single-file bundle con grafo TFLite, tokenizador y metadatos) |
| Frecuencia de muestreo | 16 kHz |
| Tokens especiales | Inicio `[50257, 50362]` (`<|startoftranscript|>`, `<|notimestamps|>`), parada `50256` |
| Variantes y tamano | tiny: 60 MB; base: 102 MB; small: 287 MB |
| Herramienta de empaquetado | `litert-lm-builder` 0.20.0 con `--weights-in-model-graph` |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper: un transformer encoder-decoder con espectrograma mel como entrada (80 bins mel, 16 kHz) y decodificacion autorregresiva de tokens de texto. Los checkpoints ACFT de FUTO introducen un ajuste fino especifico para audio de contexto corto, de modo que el encoder opera sobre una ventana de 10 segundos en lugar de los 30 segundos estandar, sin penalizar la latencia ni el coste computacional en grabaciones breves.

Los pesos publicados aqui no se han reentrenado: son los grafos TFLite int8 de rango dinamico publicados en `litert-community/whisper-acft` (revision `f8ab0a0`), derivados de la conversion realizada por LiteRT-LM-Unity. La unica intervencion tecnica del autor del bundle es la correccion del orden de las entradas de la subgrafa `decode` (el grafo listaba mask, encoder states y tokens en lugar de encoder states, tokens y mask), lo que provocaba el error de LiteRT "Cannot auto-resize tensor args_2". No hay datos publicados sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto en ingles con ventana de audio de 10 segundos.
- Reconocimiento de habla en dispositivo, sin conexion a red ni servicios externos.
- Procesamiento de grabaciones de 3 a 32 segundos mediante la tarea `AudioTranscriber` de MediaPipe.
- Salida sin marcas de tiempo (`<|notimestamps|>` en los tokens de inicio).
- Integracion con el ecosistema LiteRT-LM y MediaPipe Tasks Audio en Android.
- No soporta tool calling, function calling, agentes, vision, audio de entrada mas alla del ASR ni razonamiento multi-paso.
- Capacidad multilingue: limitada a ingles.

## Casos de uso

- Dictado y notas de voz en aplicaciones Android: el bundle tiny (60 MB) permite transcribir fragmentos cortos en el propio dispositivo con la tarea `AudioTranscriber`, sin enviar audio a un servidor y con un coste de almacenamiento minimo.
- Subtitulado de clips cortos en apps de mensajeria: la ventana de 10 segundos encaja con mensajes de voz tipicos, evitando el coste de computar 30 segundos de audio para una grabacion de 3 segundos.
- Asistentes de voz offline en dispositivos con recursos limitados: el modelo base (102 MB) ofrece un equilibrio entre precision y huella de memoria para telefonos y tablets de gama media.
- Transcripcion de comandos de voz en entornos sin conectividad: al ejecutarse en CPU con el delegado de LiteRT, funciona en escenarios de campo, aviacion o industria sin red.
- Accesibilidad para personas con dificultades de escritura: integracion en teclados o apps de accesibilidad que convierten voz en texto localmente, preservando la privacidad del audio.
- Preprocesado de audio para pipelines de LLM: usar la transcripcion como primer paso antes de enviar el texto a un modelo de lenguaje, manteniendo el audio fuera del servidor.
- Prototipado rapido en Android: la API Kotlin de MediaPipe permite integrar el bundle con pocas lineas y validar el flujo de ASR antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor reporta una prueba cualitativa: con `com.google.mediapipe:tasks-audio:1.2.0` sobre una Galaxy Tab S9+ (Snapdragon 8 Gen 2) con delegado CPU, discurso en ingles de 3 a 32 segundos se transcribio con entre el 98 % y el 100 % de palabras correctas.

| Prueba | Dispositivo | Resultado |
|---|---|---|
| Transcripcion de voz en ingles (3-32 s) | Galaxy Tab S9+ (Snapdragon 8 Gen 2), CPU | 98-100 % de palabras correctas |

## Requisitos de hardware

- VRAM/almacenamiento: los bundles ocupan 60 MB (tiny), 102 MB (base) y 287 MB (small) en disco; el grafo int8 de rango dinamico mantiene una huella de memoria moderada, aunque el autor no publica cifras de RAM en ejecucion.
- GPU recomendadas: no aplica; el ejemplo probado usa el delegado CPU de LiteRT. No se documentan delegados GPU o NPU para estos bundles.
- Cabe en cualquier dispositivo Android moderno: el bundle tiny (60 MB) es apto para telefonos de gama baja; el small (287 MB) requiere algo mas de almacenamiento y memoria.
- Despliegue: MediaPipe Tasks Audio (`com.google.mediapipe:tasks-audio:1.2.0`) con `AudioTranscriber` y `ModelArchitecture.AUTO`; no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato `.litertlm`.
- Latencia y throughput: no disponibles de forma sistematica; la unica referencia es la prueba cualitativa en Snapdragon 8 Gen 2 descrita arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-acft-en-litertlm (este) | tiny/base/small de Whisper | 10 s de audio | Ingles | Apache-2.0 | `.litertlm` (TFLite int8) |
| openai/whisper-tiny.en | ~39 M | 30 s de audio | Ingles | MIT | safetensors, GGUF, etc. |
| openai/whisper-base.en | ~74 M | 30 s de audio | Ingles | MIT | safetensors, GGUF, etc. |
| openai/whisper-small.en | ~244 M | 30 s de audio | Ingles | MIT | safetensors, GGUF, etc. |

La diferencia clave frente a los Whisper originales es la ventana de 10 segundos (menor coste en grabaciones cortas) y el empaquetado `.litertlm` listo para MediaPipe en Android. Los recuentos de parametros de las variantes originales se incluyen como referencia de la familia; no se dispone de datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- Solo transcribe ingles; no soporta otros idiomas ni cambio de idioma automatico.
- Ventana fija de 10 segundos: grabaciones mas largas deben segmentarse o procesarse por tramos.
- Salida sin marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- Riesgo de alucinacion tipico de Whisper en audio con ruido, silencios o habla no inglesa; el autor no documenta mitigaciones.
- Sesgos acusticos y lexicos heredados de los datos de entrenamiento de Whisper; no se detallan evaluaciones de equidad.
- Formato propietario de LiteRT-LM: no es portable a otros runtimes sin reconversion.
- La licencia Apache-2.0 cubre los pesos ACFT, pero Whisper original es MIT; conviene revisar ambas al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay validacion independiente de la comunidad.
- El bundle depende de la correccion manual del orden de entradas del grafo `decode`; cambios en versiones futuras de LiteRT o `litert-lm-builder` podrian requerir revision.

## Enlaces

- Hugging Face: https://huggingface.co/timmyboy26/whisper-acft-en-litertlm
- Grafos TFLite de origen: https://huggingface.co/litert-community/whisper-acft
- Repositorio ACFT Whisper de FUTO: https://github.com/futo-org/whisper-acft
- Conversion TFLite (LiteRT-LM-Unity): https://github.com/Leuconoe/LiteRT-LM-Unity
- Modelos base: https://huggingface.co/futo-org/acft-whisper-tiny.en, https://huggingface.co/futo-org/acft-whisper-base.en, https://huggingface.co/futo-org/acft-whisper-small.en
- Whisper original de OpenAI: https://huggingface.co/openai/whisper-tiny.en, https://huggingface.co/openai/whisper-base.en, https://huggingface.co/openai/whisper-small.en
