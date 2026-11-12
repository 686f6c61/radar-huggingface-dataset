# TheStageAI/pocket-tts-100m-zh

## Resumen

pocket-tts-100m-zh es un conjunto de motores Core ML y ANE del fine-tune en mandarín de 100 millones de parametros de Pocket TTS, publicado por TheStageAI para su SDK de Apple. El modelo base es hustfyb/PocketTTS-ZH-6L, un ajuste fino en chino mandarin (con soporte de code-switching y lectura de numeros) construido sobre kyutai/pocket-tts, el modelo de sintesis de voz ligero de Kyutai. Esta version no introduce pesos nuevos: empaqueta los pesos fp32 del autor (verificados como identicos a su release int8) en formato Core ML para ejecucion sobre la Neural Engine de los dispositivos Apple.

El modelo resuelve el problema de desplegar TTS en chino mandarin en hardware Apple sin dependencias de servidor ni de GPU dedicada, aprovechando la ANE para inferencia de baja latencia y bajo consumo. Con 100 millones de parametros y un tokenizador de 9174 tokens, esta pensado para sintesis de voz en el propio dispositivo, lo que resulta relevante para aplicaciones iOS y macOS que necesitan privacidad, funcionamiento offline y latencia minima.

La relevancia actual del modelo radica en su caracter de artefacto de despliegue: no es un modelo entrenado desde cero, sino una conversion de un TTS pequeno a un runtime especifico (Core ML/ANE) con licencia Apache 2.0, lo que facilita su integracion en productos comerciales de Apple. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada; el autor solo documenta el origen de los pesos y el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kyutai/pocket-tts, TTS ligero; fine-tune hustfyb/PocketTTS-ZH-6L) |
| Parametros totales | 100M (segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizador de 9174 tokens) |
| Tipos de cuantizacion | pesos fp32 (verificados identicos al release int8 del autor); motores Core ML/ANE |
| Idiomas soportados | chino mandarin (zh), con code-switching y lectura de numeros |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (motores para Core ML y Apple Neural Engine); pesos fp32 de origen |
| Tamano del repositorio | 0.5 GB |
| Pipeline | text-to-speech |
| Libreria | pocket-tts |
| Modelo base | hustfyb/PocketTTS-ZH-6L |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que el modelo base es kyutai/pocket-tts, un sistema de sintesis de voz ligero de Kyutai, y que hustfyb/PocketTTS-ZH-6L es un fine-tune en mandarin de ese modelo con soporte de code-switching y lectura de numeros. El tokenizador asociado tiene 9174 tokens. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La aportacion de TheStageAI es de ingenieria de despliegue: toma los pesos fp32 del fine-tune (verificados como identicos a la release int8 del autor) y los empaqueta como motores Core ML para la Apple Neural Engine, con `model_type: pocket-tts` y bundle de idioma `zh`. No se documentan innovaciones de arquitectura propias ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en chino mandarin.
- Soporte de code-switching: mezcla de mandarin con otros idiomas dentro de una misma frase.
- Lectura de numeros en voz alta.
- Ejecucion en el dispositivo sobre Core ML y Apple Neural Engine.
- Integracion con el SDK de Apple de TheStage (`model_type: pocket-tts`).
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Aplicaciones iOS y macOS de lectura en voz alta: el motor Core ML/ANE permite sintetizar texto en mandarin en el propio dispositivo, sin enviar datos a un servidor, lo que es adecuado para apps de accesibilidad y lectura de articulos.
- Asistentes de voz offline: al ejecutarse sobre la Neural Engine, el modelo puede generar respuestas habladas en mandarin con baja latencia y consumo energetico reducido, sin conexion a internet.
- Traduccion y doblaje en local: combinado con un modelo de traduccion en el dispositivo, puede doblar contenido al mandarin manteniendo la privacidad del texto del usuario.
- Educacion de idiomas: lectura de vocabulario y frases en mandarin con soporte de numeros y code-switching, util para apps de aprendizaje que alternan terminos en ingles y chino.
- Sistemas de navegacion y automocion con CarPlay: la inferencia en ANE y el bajo consumo permiten anuncios de navegacion hablados en mandarin sin depender de la nube.
- Prototipado rapido de interfaces de voz en Apple: el SDK de TheStage y el formato Core ML facilitan integrar el TTS en apps experimentales sin gestionar infraestructura de servidores.
- Contenido multimedia generado en local: narracion de audiolibros o resumenes de noticias en mandarin dentro de una app macOS, aprovechando el tamano reducido del modelo (0.5 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia sobre Apple Neural Engine (ANE) mediante Core ML; no requiere GPU dedicada.
- Dispositivos Apple compatibles con Core ML y ANE (iPhone, iPad y Mac con chip Apple Silicon); no se especifican modelos minimos.
- Tamano del repositorio de 0.5 GB, lo que sugiere un peso en disco modesto para dispositivos moviles.
- No cabe ni esta pensado para GPU NVIDIA (A100, H100, RTX 4090); el artefacto es especifico de Core ML.
- Opciones de despliegue: SDK de Apple de TheStage con `model_type: pocket-tts`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pocket-tts-100m-zh (TheStageAI) | 100M | no disponible | zh | Apache 2.0 | Core ML/ANE | Conversion del fine-tune de hustfyb para Apple |
| hustfyb/PocketTTS-ZH-6L | no disponible | no disponible | zh | Apache 2.0 | no disponible | Modelo base del que se derivan los pesos |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo TTS ligero original de Kyutai |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta chino mandarin (con code-switching); no se documentan otros idiomas.
- No hay informacion sobre sesgos, calidad de sintesis ni tasas de error; se desconoce el riesgo de artefactos o pronunciacion incorrecta.
- Al ser un modelo TTS, puede generar audio plausible pero incorrecto en numeros, nombres propios o terminos tecnicos; la lectura de numeros esta soportada pero no se detalla su fiabilidad.
- Dependencia exclusiva del ecosistema Apple (Core ML/ANE): no es desplegable en GPU NVIDIA ni en servidores Linux convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos originales deben verificarse por separado; el autor indica que los pesos fp32 son identicos al release int8 de hustfyb.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan limites de longitud de texto de entrada ni de contexto; el tokenizador de 9174 tokens no implica una ventana de contexto conocida.

## Enlaces

- Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-zh
- Modelo base: https://huggingface.co/hustfyb/PocketTTS-ZH-6L
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Copia de pesos referenciada: https://huggingface.co/lookbe/pocket-tts-6l
