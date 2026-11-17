# trenchstravy/faster-whisper-base-int8

## Resumen

`trenchstravy/faster-whisper-base-int8` es una conversion del modelo `openai/whisper-base` al formato de CTranslate2 con cuantizacion a enteros de 8 bits. Lo publica el usuario trenchstravy como artefacto de distribucion para Sorph, una aplicacion de dictado offline para macOS, que fija el commit descargado para garantizar reproducibilidad. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de OpenAI, unicamente transformados por el conversor de CTranslate2.

El modelo resuelve el problema de desplegar reconocimiento automatico del habla multilingue en entornos con recursos limitados o sin conectividad. Al almacenar los pesos en int8, el repositorio ocupa aproximadamente 0,1 GB, alrededor de la mitad que la conversion en float16 (`Systran/faster-whisper-base`), lo que lo hace adecuado para integrarse en aplicaciones de escritorio, dispositivos de borde o pipelines donde el espacio y el ancho de banda importan.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, pensado para un caso de uso concreto (dictado offline en macOS). Su interes tecnico esta en ejemplificar el flujo de conversion de Whisper a CTranslate2 con cuantizacion int8 y en servir como referencia para quien quiera replicar ese proceso con otros tamanos de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base `openai/whisper-base` tiene aproximadamente 74 millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos, dato no explicitado en la model card) |
| Tipos de cuantizacion | int8 (pesos almacenados como enteros de 8 bits; se ejecuta con `compute_type="int8"`) |
| Idiomas soportados | multilingue (la model card cita 99 idiomas) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (libreria `ctranslate2`, compatible con `faster-whisper`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado por OpenAI para reconocimiento automatico del habla multilingue a partir de pares audio-texto. El modelo `whisper-base` es la variante pequena de la familia, pensada para inferencia rapida en CPU. Esta publicacion no introduce cambios arquitectonicos: es una conversion de formato con cuantizacion.

El proceso de conversion, documentado en la propia model card, emplea `TransformersConverter` de CTranslate2 (version 4.8.1) con `load_as_float16=True` y `quantization="int8"`, copiando ademas `tokenizer.json` y `preprocessor_config.json`. No hay entrenamiento adicional, fine-tuning, RLHF ni DPO: los pesos son los de OpenAI, sin modificar salvo por la cuantizacion. La innovacion tecnica, si se puede llamar asi, es la reduccion de tamano a la mitad respecto a la version float16, a costa de una posible perdida de precision en la transcripcion que la model card no cuantifica.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue, con soporte declarado de 99 idiomas.
- Transcripcion de audio con `faster-whisper` mediante la API `WhisperModel.transcribe`.
- Ejecucion en CPU con `device="cpu"` y `compute_type="int8"`, lo que permite despliegue en equipos sin GPU.
- Deteccion de idioma integrada en el pipeline de `faster-whisper` (heredada de Whisper).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla del ASR.
- No se documenta modo de razonamiento ni decodificacion especulativa propia.

## Casos de uso

- Dictado offline en macOS: es el caso para el que se publico el modelo, integrado en la aplicacion Sorph. La cuantizacion int8 reduce el tamano del binario descargado y permite ejecucion en CPU sin GPU dedicada.
- Transcripcion de reuniones en local: el modelo puede procesar grabaciones de audio en equipos de sobremesa o portatiles sin enviar datos a la nube, lo que resulta adecuado por privacidad y por funcionamiento sin conectividad.
- Subtitulado de video en pipelines de escritorio: al ser compatible con `faster-whisper`, se puede encadenar con utilidades de generacion de subtitulos para contenido multilingue en maquinas sin acelerador.
- Notas de voz a texto en aplicaciones moviles o de escritorio: el tamano reducido (0,1 GB) y la licencia MIT facilitan su empaquetado dentro de aplicaciones distribuidas.
- Prototipado rapido de ASR: sirve como punto de partida para validar un pipeline de reconocimiento de voz antes de escalar a variantes mayores de Whisper (small, medium, large).
- Procesamiento por lotes de audio en servidores modestos: la inferencia int8 en CPU permite procesar colas de archivos de audio sin GPU, con throughput menor que las variantes float16 en GPU pero con menor huella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), latencia ni throughput, ni comparaciones con la version float16 o con otros tamanos de Whisper.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al estar cuantizado a int8 y disenado para CPU, la huella de memoria es reducida (el repositorio ocupa 0,1 GB), pero no se documenta el consumo en ejecucion.
- GPU recomendadas: no documentadas. El caso de uso declarado es CPU (`device="cpu"`).
- Compatibilidad con GPU de consumo: no documentada; `faster-whisper` soporta CUDA, pero la model card no especifica requisitos ni rendimiento en GPU.
- Opciones de despliegue: `faster-whisper` (libreria principal), CTranslate2 como backend. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `trenchstravy/faster-whisper-base-int8` | no disponible (base ~74 M, no confirmado) | no disponible | CTranslate2 int8 | MIT | Hugging Face, 0 descargas |
| `Systran/faster-whisper-base` | mismo modelo base | no disponible | CTranslate2 float16 | MIT | Hugging Face |
| `openai/whisper-base` | ~74 M (no confirmado en la informacion) | no disponible | safetensors / PyTorch | MIT | Hugging Face |

La diferencia principal frente a `Systran/faster-whisper-base` es el tamano (aproximadamente la mitad) y el tipo de cuantizacion (int8 frente a float16). Frente al original de OpenAI, cambia el formato y la libreria de inferencia. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto derivado con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- La cuantizacion int8 puede degradar la precision de transcripcion respecto a float16; la model card no cuantifica esa perdida.
- El modelo base `whisper-base` es la variante pequena de Whisper, con menor precision que variantes mayores en audio ruidoso, acentos marcados o vocabulario tecnico.
- Riesgo de alucinacion en pasajes de audio silenciosos o ininteligibles, comportamiento conocido de la familia Whisper; no se documenta mitigacion especifica.
- La model card no detalla sesgos conocidos ni evaluaciones de equidad por idioma o acento.
- Licencia MIT: permite uso comercial, pero los pesos son de OpenAI y la licencia es la suya, segun indica la propia model card.
- El modelo esta pensado para un caso de uso concreto (Sorph, dictado en macOS); su soporte y mantenimiento dependen de un unico autor.
- No se documentan limitaciones de contexto mas alla de las propias de Whisper (ventanas de audio), que la model card no explicita.

## Enlaces

- Hugging Face: https://huggingface.co/trenchstravy/faster-whisper-base-int8
- Modelo base: https://huggingface.co/openai/whisper-base
- Conversion float16 de referencia: https://huggingface.co/Systran/faster-whisper-base
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Aplicacion Sorph: https://sorph.me
