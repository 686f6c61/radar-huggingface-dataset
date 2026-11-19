# vyach-g/asr-onnx-web-builds

## Resumen

`vyach-g/asr-onnx-web-builds` es un repositorio de distribucion de builds ONNX cuantizados de dos modelos de reconocimiento automatico del habla (ASR) orientados a inferencia en navegador mediante `onnxruntime-web`. No es un modelo entrenado desde cero, sino un conjunto de artefactos derivados: por un lado, `moondream/parakeet-ultra` (a su vez post-entrenado sobre `nvidia/parakeet-tdt-0.6b-v3`) y, por otro, `nvidia/nemotron-3.5-asr-streaming-0.6b`. El autor, `vyach-g`, publica cuatro carpetas: dos variantes para CPU via WebAssembly (WASM) con cuantizacion int8 dinamica y dos variantes para WebGPU con `MatMulNBits` de 8 bits.

La relevancia de este repositorio es practica: permite ejecutar ASR de unos 0,6 mil millones de parametros directamente en el navegador, sin backend, con dos backends de ejecucion distintos (WASM para CPU y WebGPU para aceleracion grafica). La variante Nemotron incorpora ademas un modo streaming con chunks de 1,12 segundos (`att_context [56, 13]`), lo que habilita transcripcion en tiempo real en cliente. El repositorio ocupa 2,7 GB y no registra descargas ni likes en el momento de la consulta.

La licencia es doble y condicionada por la procedencia de cada carpeta: las builds de Parakeet heredan CC BY 4.0 y las de Nemotron heredan OpenMDW-1.1. El autor advierte de que la precision es cercana a la de los originales en sus pruebas en aleman, pero no identica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelos base: Parakeet TDT y Nemotron ASR streaming; builds ONNX) |
| Parametros totales | 0,6 mil millones (aproximado, segun nombre de los modelos base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Nemotron procesa chunks de 1,12 s con `att_context [56, 13]`) |
| Tipos de cuantizacion | int8 dinamico per-channel (WASM); MatMulNBits 8 bits (WebGPU) |
| Idiomas soportados | No disponible en la informacion proporcionada (el autor menciona pruebas en aleman) |
| Licencia | CC BY 4.0 (carpetas Parakeet) y OpenMDW-1.1 (carpetas Nemotron) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: exporta y cuantiza modelos existentes. Las builds de Parakeet derivan de `moondream/parakeet-ultra`, post-entrenado a partir de `nvidia/parakeet-tdt-0.6b-v3`, un modelo ASR basado en TDT (Token-and-Duration Transducer). Las builds de Nemotron derivan de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un modelo de ASR en streaming. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en los modelos originales.

La innovacion tecnica del repositorio esta en el proceso de exportacion y cuantizacion para `onnxruntime-web`. En las variantes WASM se aplica cuantizacion int8 dinamica per-channel, se convierten las convoluciones 1x1 en `MatMul` y se mantienen en coma flotante las convoluciones depthwise y de subsampling. En las variantes WebGPU se emplea `MatMulNBits` de 8 bits. Para Nemotron se fija `att_context [56, 13]`, que corresponde a chunks de 1,12 segundos, adecuado para streaming. No se especifican tecnicas como decodificacion especulativa ni attention linear.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en navegador.
- Ejecucion en cliente sin backend: WASM para CPU y WebGPU para aceleracion grafica.
- Streaming en tiempo real en las variantes Nemotron, con chunks de 1,12 s.
- Procesamiento por lotes o fichero completo en las variantes Parakeet.
- Integracion con `onnxruntime-web` mediante los artefactos ONNX publicados.
- No se documentan capacidades de traduccion, diarizacion, puntuacion, tool calling ni agentes.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion en el navegador sin servidor: cargar la build WASM int8 en una aplicacion web y transcribir audio del usuario en local, evitando enviar datos de voz a un backend y reduciendo costes de infraestructura.
- Subtitulado en tiempo real: usar la build Nemotron streaming con chunks de 1,12 s para generar subtitulos incrementales durante videollamadas o retransmisiones, con la variante WebGPU para menor latencia.
- Dictado por voz en aplicaciones web: integrar la build Parakeet en un editor de texto o formulario para convertir voz en texto en cliente, con la variante WASM como fallback en equipos sin GPU compatible.
- Asistentes de voz offline-first: desplegar el modelo en una PWA que funcione sin conexion tras la primera carga de los pesos ONNX, aprovechando que la inferencia ocurre en el dispositivo.
- Accesibilidad: transcripcion de audio para personas con discapacidad auditiva en entornos web, ejecutando el modelo en el propio navegador del usuario.
- Procesamiento de audio sensible: transcripcion de reuniones o notas clinicas en cliente cuando la politica de privacidad exige que el audio no salga del dispositivo.
- Prototipado rapido de pipelines ASR: usar las builds como referencia para comparar WASM frente a WebGPU en terminos de latencia y consumo antes de elegir backend en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que la precision es cercana a la de los modelos originales en sus pruebas en aleman, pero no identica, sin aportar cifras de WER ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 0,6 mil millones de parametros en int8, el peso de los pesos ronda los 0,6 GB, aunque el consumo real depende del runtime y de los buffers intermedios.
- GPU recomendadas: cualquier GPU con soporte WebGPU para las variantes WebGPU; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de 0,6 B, aunque el autor no publica una lista de GPUs verificadas.
- Opciones de despliegue: `onnxruntime-web` con backend WASM (CPU) y backend WebGPU (GPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles. La unica referencia temporal es el tamano de chunk de 1,12 s en las variantes Nemotron streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vyach-g/asr-onnx-web-builds (Parakeet) | ~0,6 B | No disponible | ONNX int8 | CC BY 4.0 | Hugging Face |
| vyach-g/asr-onnx-web-builds (Nemotron) | ~0,6 B | Chunks de 1,12 s | ONNX int8 | OpenMDW-1.1 | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | No disponible | No disponible | No disponible | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6 B | Streaming | No disponible | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparado (WER, latencia) para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo original: es un repositorio de builds derivadas, por lo que hereda las limitaciones de los modelos base.
- Precision no identica a los originales: el autor lo advierte explicitamente; las diferencias se observaron en pruebas en aleman.
- Cobertura de idiomas no documentada: no se puede asumir soporte multilingue sin verificar los modelos base.
- Licencia dual y restrictiva: CC BY 4.0 exige atribucion; OpenMDW-1.1 impone los terminos del modelo original de NVIDIA. Verificar compatibilidad antes de uso comercial.
- Sin garantia: el autor declara ausencia de garantia sobre los artefactos.
- Dependencia de WebGPU: las variantes GPU requieren navegadores con soporte WebGPU estable, lo que limita la compatibilidad.
- Streaming limitado a chunks de 1,12 s en Nemotron: no apto para contextos de audio largos sin segmentacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni de latencia para evaluar en produccion.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede generar texto plausible en segmentos de audio ruidosos o silenciosos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vyach-g/asr-onnx-web-builds
- Modelo base Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Modelo base Parakeet TDT: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base Nemotron streaming: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion proporcionada.
