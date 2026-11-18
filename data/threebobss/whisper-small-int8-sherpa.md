# threebobss/whisper-small-int8-sherpa

## Resumen

`threebobss/whisper-small-int8-sherpa` es un re-host de los ficheros ONNX cuantizados a int8 del modelo Whisper small de OpenAI, exportados por el proyecto sherpa-onnx (k2-fsa). No se trata de un modelo nuevo ni de un fine-tuning: el autor original (threebobss) publica los artefactos sin modificaciones para que una aplicacion pueda descargarlos desde un commit fijo, garantizando reproducibilidad en despliegues de reconocimiento automatico del habla (ASR).

El modelo subyacente es Whisper small, un transformer encoder-decoder de 244 millones de parametros aproximadamente, entrenado por OpenAI para transcripcion multilingue y traduccion de voz a texto. La version aqui publicada esta cuantizada a int8 y empaquetada en el layout que espera el runtime sherpa-onnx (`OfflineWhisperModelConfig`), lo que permite ejecutar inferencia en CPU con un consumo de memoria reducido.

Su relevancia es practica: ofrece un pipeline ASR completo (encoder, decoder, tokenizer y detector de actividad de voz Silero VAD) en unos 376 MB, con licencia MIT y un formato listo para integrarse en aplicaciones de escritorio, moviles o edge sin depender de infraestructura GPU. Es una opcion sensata cuando se necesita transcripcion local, offline y con huella de memoria contenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), exportado a ONNX y cuantizado a int8 |
| Parametros totales | Aproximadamente 244 M (modelo base Whisper small; no se indica cifra exacta en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper small trabaja con ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | int8 (encoder y decoder) |
| Idiomas soportados | No disponible en la model card; Whisper small es multilingue por diseno del modelo base |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (`small-encoder.int8.onnx`, `small-decoder.int8.onnx`) + `small-tokens.txt` + `silero_vad.onnx` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper small de OpenAI: un transformer encoder-decoder con atencion estandar, disenado para recibir espectrogramas Mel de audio y generar tokens de texto. El encoder procesa la representacion acustica y el decoder genera la transcripcion de forma autorregresiva, con tokens especiales de idioma y tarea que permiten transcripcion o traduccion.

No se ha realizado entrenamiento adicional en este repositorio. Los ficheros son el export ONNX e la cuantizacion int8 realizados por el proyecto sherpa-onnx a partir de `openai/whisper-small`, re-hosteados sin cambios desde `csukuangfj/sherpa-onnx-whisper-small` (commit `8f3c18b358db4d1f2fc1eae49d75cd20989e4309`). Se incluye ademas el modelo Silero VAD (`silero_vad.onnx`) para deteccion de actividad de voz, bajo licencia MIT. La model card no documenta detalles sobre datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la documentacion original de Whisper.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline sobre audio en formato compatible con sherpa-onnx.
- Transcripcion multilingue y traduccion voz-a-texto, heredadas del modelo base Whisper small.
- Deteccion de actividad de voz integrada mediante Silero VAD, lo que permite segmentar audio y evitar procesar silencios.
- Ejecucion en CPU sin GPU, gracias a la cuantizacion int8 y al runtime sherpa-onnx.
- Integracion en aplicaciones de escritorio, moviles y entornos edge mediante la API `OfflineWhisperModelConfig`.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (no aplica a un modelo ASR).
- Capacidades de vision o audio adicionales mas alla del ASR: no disponibles.

## Casos de uso

- Transcripcion local de reuniones y notas de voz: el modelo puede procesar audio en el dispositivo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad y para aplicaciones de escritorio que necesitan funcionar sin conexion.
- Subtitulado automatico de video: se puede integrar en pipelines de postproduccion para generar subtitulos en varios idiomas a partir de la pista de audio, usando el VAD incluido para segmentar escenas con silencios.
- Asistentes de voz en aplicaciones moviles: el tamano reducido (unos 376 MB en total) y la ejecucion en CPU permiten empaquetar el modelo en apps Android o iOS que transcriben comandos o dictado sin depender de servicios externos.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones de call center o archivos historicos para construir indices de texto consultables, aprovechando el bajo coste de inferencia en CPU.
- Accesibilidad: generacion de transcripciones en tiempo real o diferido para personas con discapacidad auditiva en aplicaciones de videoconferencia o reproduccion multimedia.
- Prototipado rapido de pipelines ASR: al estar en formato sherpa-onnx con un commit fijo, sirve para validar integraciones y comparar calidad frente a otros modelos antes de invertir en infraestructura mayor.
- Traduccion de voz a texto en escenarios multilingues: el modelo base permite transcribir audio en un idioma y generar texto, util para herramientas de documentacion o atencion al cliente en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo int8 ocupa aproximadamente 376 MB en disco y una huella de memoria similar o algo mayor en tiempo de ejecucion, aunque no se documentan cifras oficiales.
- GPU recomendadas: no se especifican; el runtime sherpa-onnx esta orientado a CPU. Cualquier GPU con soporte ONNX Runtime podria utilizarse, pero no hay datos de rendimiento publicados.
- Compatibilidad con GPU de consumo: si, en principio cualquier GPU consumer con ONNX Runtime, aunque el caso de uso principal es CPU.
- Opciones de despliegue: sherpa-onnx (runtime oficial), ONNX Runtime; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small-int8-sherpa (este) | ~244 M | No disponible (ventanas de 30 s en Whisper) | ONNX int8 | MIT | Re-host de export sherpa-onnx, incluye Silero VAD |
| openai/whisper-small | ~244 M | No disponible (ventanas de 30 s) | PyTorch (safetensors/bin) | MIT | Modelo original, sin cuantizar; requiere framework completo |
| csukuangfj/sherpa-onnx-whisper-small | ~244 M | No disponible | ONNX int8 | MIT | Origen del export; misma funcionalidad, sin el re-host fijo |
| Whisper base | ~74 M | No disponible (ventanas de 30 s) | Multiples | MIT | Menor precision que small, menor huella |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para cuantificar diferencias de calidad entre estas variantes.

## Limitaciones y advertencias

- Alucinaciones: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o audio ruidoso; se recomienda usar el VAD incluido y filtrar salidas de baja confianza.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Whisper small, que no se documentan en esta model card; pueden aparecer diferencias de calidad entre idiomas, acentos y variedades dialectales.
- Limitaciones de contexto: Whisper procesa ventanas de audio de 30 segundos; para audio mas largo es necesario segmentar, lo que puede afectar a la coherencia entre fragmentos.
- Idiomas: la model card no enumera los idiomas soportados; aunque el modelo base es multilingue, no se garantiza el rendimiento en todos ellos y conviene validarlo por idioma.
- Licencia: MIT, lo que permite uso comercial, pero se debe conservar el aviso de licencia y los creditos a OpenAI, sherpa-onnx y Silero Team incluidos en el repositorio.
- Reproducibilidad: el repositorio fija un commit concreto de los artefactos; si se necesita otra version, hay que apuntar al repositorio de origen `csukuangfj/sherpa-onnx-whisper-small`.
- Soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni comunidad activa alrededor de este re-host concreto.

## Enlaces

- Hugging Face: https://huggingface.co/threebobss/whisper-small-int8-sherpa
- Repositorio de origen del export: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-small
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Codigo y licencia de Whisper: https://github.com/openai/whisper
- Silero VAD: https://github.com/snakers4/silero-vad
