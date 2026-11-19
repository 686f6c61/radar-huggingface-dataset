# vikeeai/whisper-base_timestamped

## Resumen

`vikeeai/whisper-base_timestamped` es una conversion a ONNX del modelo `openai/whisper-base`, publicada por el usuario vikeeai con el objetivo de que sea compatible con Transformers.js y, por tanto, ejecutable directamente en el navegador mediante WebML. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion de los pesos de Whisper Base en formato ONNX, empaquetada con la estructura de carpetas que espera la libreria Transformers.js (subcarpeta `onnx`).

Whisper Base es el segundo modelo de la familia Whisper de OpenAI para reconocimiento automatico del habla (ASR). Es un transformer encoder-decoder con aproximadamente 74 millones de parametros, entrenado sobre 680.000 horas de audio multilingue y multitarea. El sufijo `_timestamped` sugiere que la conversion incluye los tensores necesarios para producir marcas de tiempo a nivel de palabra o de segmento, aunque la model card no lo detalla explicitamente.

La relevancia de esta ficha es limitada pero concreta: permite desplegar ASR en el cliente (navegador) sin backend, con un tamano de repositorio de 0,3 GB. No obstante, la ausencia de licencia declarada, de idiomas listados y de cualquier documentacion adicional hace que su uso en produccion requiera precaucion y verificacion manual de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | ~74 millones (heredados de openai/whisper-base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1500 posiciones de audio (~30 segundos de audio por ventana) |
| Tipos de cuantizacion | no disponible (repo con pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (Whisper Base soporta multilingue, pero el repo no lo declara) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Base: un encoder Transformer que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos, y un decoder Transformer autorregresivo que genera tokens de texto, tokens de idioma, tokens de tarea y marcas de tiempo. El modelo original fue entrenado por OpenAI sobre 680.000 horas de audio web multilingue y multitarea, combinando tareas de transcripcion, traduccion al ingles y prediccion de marcas de tiempo, con una mezcla de datos debilmente supervisados.

Esta publicacion concreta no aporta entrenamiento adicional ni fine-tuning: es una exportacion a ONNX de los pesos originales. La innovacion, si se puede llamar asi, es el empaquetado para Transformers.js, que permite cargar el modelo desde el navegador con la API de la libreria. La model card indica que se trata de una solucion temporal hasta que WebML gane traccion, y recomienda a otros autores convertir sus modelos con Optimum y estructurar el repositorio con una subcarpeta `onnx`. No se documenta ningun proceso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre ventanas de hasta 30 segundos.
- Generacion de marcas de tiempo (timestamping) a nivel de segmento o palabra, segun el sufijo del nombre del repositorio; la model card no lo confirma explicitamente.
- Traduccion de audio a ingles (capacidad heredada de Whisper Base, no documentada en este repo).
- Deteccion de idioma (token de idioma del decoder de Whisper).
- Ejecucion en navegador mediante Transformers.js y ONNX Runtime Web.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada mas alla de ASR ni modo thinking.

## Casos de uso

- Transcripcion en el navegador sin backend: cargar el modelo ONNX con Transformers.js y transcribir audio del usuario directamente en el cliente, evitando enviar grabaciones a un servidor y reduciendo costes de infraestructura.
- Subtitulado de videos cortos: generar marcas de tiempo junto con el texto para producir subtitulos `.srt` o `.vtt` en aplicaciones web de edicion, aprovechando la ventana de 30 segundos por segmento.
- Notas de voz en aplicaciones web: transcribir mensajes de audio en una PWA o extension de navegador, con el modelo ejecutandose en el dispositivo del usuario.
- Prototipado rapido de interfaces de voz: validar flujos de dictado o busqueda por voz en demos web antes de invertir en un backend con un modelo mayor.
- Accesibilidad: generar transcripciones en tiempo casi real de contenido audiovisual para personas con discapacidad auditiva, desplegando el modelo como parte de la propia pagina.
- Educacion y experimentacion: usar el modelo como ejemplo didactico de integracion de ASR en WebML, ya que el repositorio sigue la estructura recomendada por Transformers.js.
- Procesamiento por lotes de audio corto en entornos sin GPU: al ser un modelo de 74 M de parametros, puede ejecutarse en CPU con latencia aceptable para clips de pocos segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo (~74 M de parametros), en FP32 ocuparia del orden de 0,3 GB de pesos, pero no se confirma la precision de los artefactos ONNX.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecucion en navegador via ONNX Runtime Web, que puede usar WebGPU o WebAssembly.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: Transformers.js (libreria declarada), ONNX Runtime Web, y potencialmente otros runtimes ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vikeeai/whisper-base_timestamped | ~74 M | 30 s por ventana | no disponible | ONNX | Hugging Face |
| openai/whisper-base | ~74 M | 30 s por ventana | MIT (modelo original de OpenAI) | PyTorch, safetensors | Hugging Face |
| openai/whisper-small | ~244 M | 30 s por ventana | MIT | PyTorch, safetensors | Hugging Face |
| openai/whisper-tiny | ~39 M | 30 s por ventana | MIT | PyTorch, safetensors | Hugging Face |

La comparativa se basa en la familia Whisper original; no se dispone de datos de rendimiento especificos de esta conversion ONNX para comparar calidades de transcripcion.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial es legalmente seguro; el modelo base de OpenAI es MIT, pero la redistribucion no lo explicita.
- No se declaran los idiomas soportados; aunque Whisper Base es multilingue, conviene verificar el comportamiento real antes de usarlo en un idioma concreto.
- La model card es minima y no documenta el proceso de conversion, la precision de los pesos ONNX ni si se incluyen realmente los tensores de timestamping.
- Riesgo de alucinacion inherente a Whisper: en audio con ruido, silencios largos o habla no inglesa puede generar texto inventado o repetir frases.
- Ventana de 30 segundos por segmento: audios mas largos requieren troceado y gestion manual de solapamientos y marcas de tiempo.
- Sesgos heredados del entrenamiento de Whisper: posible peor rendimiento en acentos, dialectos y lenguas de bajos recursos.
- Al ser una conversion de terceros con 0 descargas y 0 likes, no hay evidencia de validacion por la comunidad; conviene comparar su salida con la del modelo original antes de desplegarlo.
- El soporte de Transformers.js y ONNX Runtime Web puede variar segun el navegador y la disponibilidad de WebGPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/whisper-base_timestamped
- Modelo base: https://huggingface.co/openai/whisper-base
- Documentacion de Optimum (recomendada por el autor para conversiones ONNX): https://huggingface.co/docs/optimum/index
- Transformers.js: https://huggingface.co/docs/transformers.js
