# zhaoyang-jia/kitten-asr-small-enhanced-onnx-int8

## Resumen

kitten-asr-small-enhanced-onnx-int8 es una versión cuantizada a int8 dinámico del export ONNX `zhaoyang-jia/kitten-asr-small-enhanced-onnx`, que a su vez deriva del modelo de reconocimiento automático de voz (ASR) `KittenML/kitten-asr-small-enhanced`. La publica el usuario zhaoyang-jia y no es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: el mismo grafo convertido a ONNX y cuantizado con `tools/quantize.py` del motor `kitten-asr-go`, usando la cuantización dinámica integrada de ONNX Runtime (pesos en int8, activaciones cuantizadas en tiempo de ejecución y sin necesidad de conjunto de calibración).

El objetivo es puramente de tamano en disco y de descarga. Segun la propia model card, los dos grafos de computo pasan de 752,0 MB a 193,4 MB (encoder de audio) y de 1767,4 MB a 445,7 MB (decoder), lo que supone una reduccion aproximada de 3,9x. La tabla de embeddings `embed_tokens.bin` se mantiene en fp32 porque es una tabla de consulta, no un grafo de computo.

Es relevante ahora porque permite ejecutar un modelo ASR de tamano medio en entornos con almacenamiento o ancho de banda limitados, aunque el propio autor advierte explicitamente de que es un compromiso de tamano, no una optimizacion de velocidad, y de que conlleva un coste de precision. No hay datos publicados de parametros, contexto de audio, idiomas soportados ni benchmarks propios de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; dos grafos ONNX separados (encoder de audio y decoder), exportados de `KittenML/kitten-asr-small-enhanced` |
| Parametros totales | no disponible (los pesos fp32 de encoder y decoder suman 2519,4 MB, lo que equivale a unos 630 M de parametros en esos dos grafos, sin contar la tabla de embeddings) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico (pesos int8, activaciones cuantizadas en inferencia); `embed_tokens.bin` permanece en fp32; existe el export fp32 equivalente |
| Idiomas soportados | no disponible |
| Licencia | other (`unspecified-by-kittenml`); KittenML no ha publicado terminos de licencia para los pesos |
| Formato de pesos | ONNX (`*_audio_encoder.onnx`, `*_decoder.onnx`) mas `embed_tokens.bin` en fp32 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el entrenamiento del modelo base `KittenML/kitten-asr-small-enhanced`. Lo unico documentado es la topologia de despliegue: el artefacto se compone de un encoder de audio y un decoder como grafos ONNX independientes, mas una tabla de embeddings en fp32 que actua como consulta y no como grafo de computo. El pipeline declarado en HuggingFace es `automatic-speech-recognition`.

La innovacion tecnica de esta publicacion no esta en el modelo, sino en el proceso de conversion: se ha aplicado cuantizacion dinamica de ONNX Runtime sobre los dos grafos de computo, sin dataset de calibracion, lo que reduce el peso en disco de 2519,4 MB a 639,1 MB en esos dos ficheros. El autor documenta que la misma herramienta aplicada a `kitten-asr-tiny-onnx` produjo un coste de precision real y medible sin ganancia de velocidad (20,7 % a 27,8 % de WER, con tiempo de ejecucion practicamente identico), y advierte de que ese compromiso deberia trasladarse cualitativamente a este modelo mayor, aunque no se ha vuelto a medir sobre el modelo grande ni sobre voz real.

## Capacidades

- Reconocimiento automatico de voz: transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition`.
- Ejecucion mediante el motor `kitten-asr-go`, que carga el directorio del modelo con la misma ruta de carga que el export fp32.
- Despliegue en formato ONNX, lo que permite usarlo con ONNX Runtime fuera del ecosistema de Python.
- Cuantizacion a int8 para reducir el tamano de descarga y de almacenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento; es un modelo especificamente ASR.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card ni en los metadatos).
- No se documentan marcas de tiempo, diarizacion de hablantes ni puntuacion automatica.

## Casos de uso

- Transcripcion de audio en dispositivos o contenedores con almacenamiento reducido: al ocupar unos 639 MB en los grafos cuantizados frente a 2519,4 MB en fp32, encaja en imagenes de contenedor o dispositivos embebidos donde el export completo no cabria.
- Distribucion de modelos a traves de redes lentas o con coste por transferencia: la reduccion de 3,9x en disco abarata la descarga inicial y las actualizaciones del artefacto.
- Procesamiento por lotes en CPU dentro de un pipeline de datos: al ser cuantizacion dinamica orientada a CPU y ejecutarse con ONNX Runtime, se puede integrar en un job que transcriba ficheros de audio en servidores sin GPU.
- Prototipado y evaluacion de un motor ASR propio: sirve para probar el flujo de `kitten-asr-go` con un consumo de disco bajo antes de decidir si se usa el export fp32 en produccion.
- Aplicaciones de subtitulado o notas de voz en las que una precision algo menor es aceptable a cambio de un despliegue mas ligero, siempre que se valide el WER sobre el dominio concreto antes de publicar.
- Pruebas de regresion del propio proceso de cuantizacion: permite comparar la salida de esta variante int8 contra el export fp32 y contra `kitten-asr-tiny-onnx-int8` para medir el coste real de precision en un corpus propio.
- Escenarios sin GPU: el formato ONNX con cuantizacion dinamica esta pensado para inferencia en CPU, lo que cubre servidores sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de `kitten-asr-small-enhanced-onnx-int8` en la informacion disponible. El unico dato numerico de rendimiento que aparece en la model card corresponde a otra variante, `kitten-asr-tiny-onnx-int8`, y se ofrece como referencia cualitativa:

| Modelo | Metrica | fp32 | int8 | Nota |
|---|---|---|---|---|
| kitten-asr-tiny-onnx | WER | 20,7 % | 27,8 % | Tiempo de ejecucion practicamente igual |
| kitten-asr-small-enhanced-onnx-int8 | WER | no disponible | no disponible | No se ha medido contra voz real segun el autor |

Tamano de los ficheros del repositorio (dato declarado por el autor):

| Componente | fp32 | int8 |
|---|---|---|
| audio_encoder | 752,0 MB | 193,4 MB |
| decoder | 1767,4 MB | 445,7 MB |
| embed_tokens.bin | fp32 en ambos casos | fp32 en ambos casos |

## Requisitos de hardware

- Memoria para los pesos: los grafos cuantizados suman 639,1 MB; el repositorio completo ocupa 1,3 GB (el resto corresponde a `embed_tokens.bin` en fp32 y a los metadatos del repo). Conviene reservar aproximadamente 1,5-2 GB de RAM o VRAM contando pesos y sobrecarga del runtime, como estimacion a partir de los tamanos de fichero.
- GPU: no se especifica ninguna GPU recomendada. La cuantizacion dinamica de ONNX Runtime esta orientada a CPU, por lo que la ganancia en GPU seria limitada y no esta documentada.
- GPU de consumo: no hay datos que confirmen requisitos de VRAM en GPU de consumo; al no ser un modelo de gran tamano, en principio podria caber en GPUs con 4-8 GB, pero esto no esta verificado en la informacion disponible.
- Despliegue: ONNX Runtime y el motor `kitten-asr-go` (`go run ./cmd/kitten-asr models/kitten-asr-small-enhanced-onnx-int8 audio.wav`). Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a este artefacto, ya que es un modelo ASR encoder-decoder en ONNX y no un modelo de lenguaje autoregresivo en formato GGUF o safetensors.
- Latencia y throughput: no disponibles. El autor indica que, al menos en la variante tiny, la cuantizacion no aporto ganancia de velocidad.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kitten-asr-small-enhanced-onnx-int8 | ONNX int8 | no disponible | no disponible | no disponible | other (`unspecified-by-kittenml`) | Publico en HuggingFace, 0 descargas |
| kitten-asr-small-enhanced-onnx | ONNX fp32 | no disponible | no disponible | no disponible | other (`unspecified-by-kittenml`) | Publico en HuggingFace |
| kitten-asr-tiny-onnx-int8 | ONNX int8 | no disponible | no disponible | 27,8 % (frente a 20,7 % en fp32) | other (`unspecified-by-kittenml`) | Publico en HuggingFace |
| Alternativas del mismo segmento (p. ej. familia Whisper small, distil-whisper) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre modelos ASR comparables (los resultados obtenidos eran hilos de foro sin relacion). No se dispone por tanto de cifras verificables para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Coste de precision: el autor advierte de que la cuantizacion dinamica degrada la precision; en la variante tiny el WER paso de 20,7 % a 27,8 % sin ganancia de velocidad, y se espera un comportamiento cualitativamente similar aqui, aunque no se ha medido sobre este modelo ni con voz real.
- No es una optimizacion de velocidad: es un compromiso de tamano en disco y de descarga. No debe elegirse por defecto frente al export fp32 si la precision importa.
- Licencia: KittenML no ha publicado terminos para los pesos de `kitten-asr-small-enhanced`. Este repositorio no reclama licencia propia, y el autor recomienda contactar con KittenML antes de usarlo para algo mas alla de la evaluacion. Riesgo legal para uso comercial.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingue.
- Contexto de audio maximo, manejo de audio largo y comportamiento con silencios o ruido: no documentados.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos marcados o solapamiento de hablantes: no cuantificado en la informacion disponible.
- Sesgos: no se documenta ninguna evaluacion de sesgos.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no hay resultados de benchmarks propios; debe tratarse como un artefacto experimental.
- `embed_tokens.bin` no se cuantiza, por lo que el ahorro de tamano no es completo respecto al export fp32.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhaoyang-jia/kitten-asr-small-enhanced-onnx-int8
- Modelo base: https://huggingface.co/KittenML/kitten-asr-small-enhanced
- Export ONNX fp32 del que deriva: https://huggingface.co/zhaoyang-jia/kitten-asr-small-enhanced-onnx
- Variante tiny int8 con las cifras de WER citadas: https://huggingface.co/zhaoyang-jia/kitten-asr-tiny-onnx-int8
- Motor kitten-asr-go: https://github.com/itamaker/kitten-asr-go
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su arquitectura, su entrenamiento o sus benchmarks.
