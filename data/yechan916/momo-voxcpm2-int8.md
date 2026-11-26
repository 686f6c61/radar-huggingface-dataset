# Yechan916/momo-voxcpm2-int8

## Resumen

Momo-voxcpm2-int8 es una conversion a ONNX de 8 bits del modelo de sintesis de voz openbmb/VoxCPM2, publicada por el usuario Yechan916 dentro del proyecto MOMO. No se trata de un modelo entrenado desde cero: el autor parte de los pesos originales de VoxCPM2 (licencia Apache-2.0) y los divide en varios grafos ONNX independientes que despues cuantiza a int8, con el objetivo de que el sistema completo pueda ejecutarse dentro de un navegador web mediante onnxruntime-web, ya sea con WebGPU o con CPU/WASM.

La relevancia de esta ficha es practica: demuestra que un pipeline de TTS con clonacion de voz (encoder de texto, modelo de lenguaje base, modelo residual, decoder de difusion, VAE de audio) puede fragmentarse y comprimirse hasta un repositorio de 2,7 GB que corre en el cliente, sin reentrenamiento. El autor reporta que la cuantizacion apenas degrada la calidad: similitud de hablante de 0,7232 frente a 0,723 del modelo PyTorch original, y tasa de error de caracteres del 6,7 % frente al 6,9 %.

El modelo conserva las limitaciones del original: solo soporta coreano e ingles, y su uso previsto es la sintesis de voz con clonacion a partir de audio de referencia y su transcripcion, no la generacion de texto general. La licencia Apache-2.0 permite uso comercial, pero la model card exige consentimiento explicito del hablante clonado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS fragmentado en grafos ONNX: LM base (28 capas, dividido 14+14), LM residual (8 capas), decoder de difusion local, encoder local, VAE de audio (encoder y decoder) y cabezas auxiliares |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en pesos lineales (MatMulNBits, bits=8, bloque 128, simetrica, accuracy_level 4); convoluciones del VAE en fp32; embeddings de texto en int8 con escala por fila |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos separados) y binarios int8 para embeddings; tokenizer.json y meta.json |
| Tamano del repositorio | 2,7 GB |
| Frecuencias de muestreo | 16 kHz de entrada al VAE encoder; 48 kHz de salida del VAE decoder |
| Pasos de difusion | 10 por defecto; 6 sin perdida medible segun el autor |

## Arquitectura y entrenamiento

El modelo no introduce entrenamiento nuevo: es una conversion y cuantizacion del VoxCPM2 original de OpenBMB. La arquitectura subyacente combina un modelo de lenguaje base de 28 capas con cache KV, dividido en dos grafos (`lm_a.onnx` y `lm_b.onnx`, 682 MB y 684 MB respectivamente, donde el segundo devuelve ademas la salida FSQ), un modelo de lenguaje residual de 8 capas con proyeccion de fusion (`res.onnx`, 398 MB), un decoder de difusion local que opera en un solo paso con lote condicional y no condicional (`dit.onnx`, 223 MB), un encoder local que transforma parches latentes en entrada del LM (`locenc.onnx`, 223 MB) y un VAE de audio con encoder y decoder separados (192 MB y 183 MB). Las cabezas de condicionamiento DiT y de parada se agrupan en `heads.onnx` (9 MB).

La cuantizacion aplica `MatMulNBits` con 8 bits, bloque de 128 y simetria sobre los pesos lineales, mientras que las convoluciones del VAE se mantienen en fp32 para preservar la calidad de reconstruccion de audio. Los embeddings de texto se almacenan como filas int8 con escala por fila (`embed_q8.bin` y `embed_scale.bin`, 150 MB). El bucle de generacion (modo continuacion con audio de prompt y su transcripcion, sampler Euler con CFG-zero) no forma parte del repositorio: vive en el proyecto MOMO, en `voice/vox2_onnx.py` para Python y `web/voice/vox2.js` para el navegador, y cada fichero esta fijado por SHA-256 en el motor web.

## Capacidades

- Sintesis de voz (text-to-speech) en coreano e ingles.
- Clonacion de voz a partir de un audio de referencia y su transcripcion (modo continuacion).
- Generacion de audio a 48 kHz desde latentes producidos por el VAE.
- Ejecucion en navegador mediante onnxruntime-web con WebGPU o CPU/WASM.
- Ejecucion en Python mediante el script del proyecto MOMO.
- Control del coste computacional ajustando el numero de pasos de difusion (10 por defecto, 6 con perdida no medible).
- No soporta tool calling, agentes, vision ni audio de entrada mas alla del prompt de referencia.

## Casos de uso

- Clonacion de voz en el navegador: una aplicacion web puede cargar los grafos ONNX y generar voz con la identidad de un hablante autorizado sin enviar audio a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.
- Lectura de contenido en coreano e ingles: integracion en lectores de articulos o documentacion que necesiten sintesis en ambos idiomas con una sola pila de modelos.
- Prototipado de asistentes de voz: el modo continuacion permite generar respuestas habladas con una voz concreta a partir de un prompt corto, util para demos y pruebas de concepto.
- Doblaje y localizacion de contenido corto: generacion de pistas de voz en coreano o ingles a partir de texto, con control del numero de pasos de difusion para ajustar latencia.
- Accesibilidad web: sintesis de voz del lado del cliente para usuarios con discapacidad visual, sin depender de APIs externas de TTS.
- Investigacion en cuantizacion: el repositorio sirve como referencia reproducible para estudiar el impacto de int8 en pipelines TTS, dado que el autor publica metricas comparativas frente al modelo PyTorch.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en coreano e ingles con voces clonadas de hablantes nativos autorizados.

## Benchmarks y rendimiento

El autor reporta metricas de calidad medidas sobre 20 hablantes coreanos de validacion del corpus Zeroth-Korean (CC BY 4.0), comparando esta conversion con el modelo PyTorch original:

| Metrica | ONNX int8 (este modelo) | VoxCPM2 PyTorch original |
|---|---|---|
| Similitud de hablante (coseno ECAPA) | 0,7232 | 0,723 |
| Tasa de error de caracteres | 6,7 % | 6,9 % |
| Similitud con 6 pasos de difusion | 0,722 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo es de sintesis de voz y no de generacion de texto. Tampoco se han publicado datos de latencia o throughput.

## Requisitos de hardware

- El repositorio completo ocupa 2,7 GB, por lo que la descarga y el almacenamiento en cliente requieren ese espacio.
- VRAM estimada para inferencia en GPU: no disponible de forma explicita; los grafos mas grandes son de unos 684 MB, lo que sugiere un consumo moderado, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El autor menciona WebGPU como via de aceleracion en navegador, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el diseno apunta a ejecucion en navegador con WebGPU o CPU/WASM, lo que en principio permite hardware de consumo, pero no hay mediciones publicadas.
- Opciones de despliegue: onnxruntime-web (WebGPU o CPU/WASM) para el navegador; Python con onnxruntime mediante `voice/vox2_onnx.py` del proyecto MOMO. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Yechan916/momo-voxcpm2-int8 | TTS con clonacion, ONNX int8 | ko, en | no disponible | Apache-2.0 | ONNX | Optimizado para navegador; metricas de similitud 0,7232 |
| openbmb/VoxCPM2 | TTS con clonacion, PyTorch | ko, en | no disponible | Apache-2.0 | safetensors (presumiblemente) | Modelo base; similitud 0,723 y CER 6,9 % |
| Otros modelos TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion directa mas solida es con el modelo base: la version int8 mantiene la calidad con un formato apto para navegador. Para alternativas de la misma categoria no hay datos en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta coreano e ingles; no hay soporte documentado de castellano ni de otros idiomas.
- El modo de generacion es continuacion con audio de prompt y transcripcion; no es un modelo de texto general ni de razonamiento.
- Riesgo de alucinacion o artefactos acusticos: no hay datos publicados sobre comportamientos anomalos en entradas fuera de dominio.
- La cuantizacion int8 puede degradar la calidad en voces o condiciones acusticas no representadas en la evaluacion, que se limita a 20 hablantes coreanos.
- Las metricas de calidad se midieron solo en coreano; el rendimiento en ingles no esta cuantificado en la model card.
- La clonacion de voz exige consentimiento explicito del propietario de la voz; el autor prohibe el uso para suplantacion o fraude.
- La licencia Apache-2.0 permite uso comercial, pero el aviso de uso responsable debe respetarse.
- El bucle de generacion no esta incluido en el repositorio: depende del codigo del proyecto MOMO, lo que anade una dependencia externa para produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yechan916/momo-voxcpm2-int8
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Corpus de evaluacion Zeroth-Korean (CC BY 4.0): no disponible como enlace en la informacion proporcionada
- Proyecto MOMO (codigo de generacion `voice/vox2_onnx.py` y `web/voice/vox2.js`): no disponible como enlace en la informacion proporcionada
