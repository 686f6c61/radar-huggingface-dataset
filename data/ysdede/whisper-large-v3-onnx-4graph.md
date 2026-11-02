# ysdede/whisper-large-v3-onnx-4graph

## Resumen

`ysdede/whisper-large-v3-onnx-4graph` es una exportacion a ONNX del modelo Whisper Large v3 (variante no turbo) de OpenAI, realizada por el usuario ysdede. El artefacto divide el modelo original en cuatro grafos ONNX independientes: encoder, inicializacion del decoder, paso del decoder y alineacion. Los pesos se distribuyen en ficheros externos y el conjunto total ocupa aproximadamente 6,3 GB en el repositorio.

El modelo subyacente es Whisper Large v3, un transformer encoder-decoder de 32 capas en el decoder, entrenado por OpenAI para reconocimiento automatico del habla (ASR) multilingue. Esta exportacion concreta esta pensada para su uso en ASRJS y se ha exportado en FP16. El autor indica que la transcripcion greedy en CPU nativa sobre el clip de prueba JFK fue satisfactoria y que la auditoria del artefacto paso 5153 comprobaciones sin fallos, aunque advierte explicitamente de que esto no garantiza la aceptacion en navegador ni la precision general del modelo.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune, sino de un empaquetado de inferencia. Su interes practico reside en la posibilidad de desplegar Whisper Large v3 en entornos ONNX Runtime (incluido potencialmente el navegador via WebAssembly/WebGPU) sin depender de PyTorch, a costa de gestionar manualmente los cuatro grafos y los pesos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3), exportado a 4 grafos ONNX: encoder, decoder init, decoder step y alignment |
| Parametros totales | no disponible (el autor no publica el recuento; Whisper Large v3 original ronda los 1550 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper, no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | exportacion en FP16; no se documentan otras variantes de cuantizacion |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con ficheros de pesos externos (4 grafos, ~6,3 GB en total) |

## Arquitectura y entrenamiento

Se trata de una exportacion, no de un entrenamiento nuevo. La arquitectura subyacente es la de Whisper Large v3 de OpenAI: un encoder que procesa espectrogramas de audio y un decoder autorregresivo de 32 capas (el autor insiste en que es la variante completa, no Turbo). La exportacion separa el calculo en cuatro grafos ONNX: encoder, inicializacion del decoder, paso del decoder y alineacion, lo que permite cachear el estado del encoder y reutilizar el paso del decoder de forma iterativa durante la generacion.

No se proporciona informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo RLHF o DPO. La model card solo documenta el proceso de exportacion: FP16, pesos externos obligatorios y una auditoria del artefacto con 5153 comprobaciones superadas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio, mediante decodificacion greedy segun la prueba descrita por el autor.
- Transcripcion en CPU nativa mediante ONNX Runtime, sin requerir PyTorch.
- Division en cuatro grafos que permite separar la codificacion del audio de la generacion token a token.
- Grafo de alineacion incluido, orientado a la obtencion de marcas temporales (timestamp alignment) segun la nomenclatura del autor.
- Capacidades multilingues: no confirmadas en la informacion proporcionada, aunque el modelo base Whisper Large v3 las soporta; la model card no las documenta.
- Soporte de tool calling, agentes, vision o audio adicional: no disponible.

## Casos de uso

- Transcripcion por lotes en servidores sin GPU: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en CPU, lo que simplifica el despliegue en infraestructura sin CUDA.
- Integracion en aplicaciones web mediante ONNX Runtime Web: los cuatro grafos permiten cargar el encoder y el decoder por separado, facilitando la gestion de memoria en entornos de navegador (aunque el autor no confirma la aceptacion en navegador).
- Pipeline de subtitulado con marcas temporales: el grafo de alineacion esta pensado para generar timestamps junto a la transcripcion.
- Procesamiento en el borde (edge) o en dispositivos sin acelerador dedicado, aprovechando la exportacion FP16 y la ejecucion en CPU.
- Sustitucion de PyTorch por ONNX Runtime en sistemas existentes que ya usan Whisper Large v3, reduciendo dependencias del stack de inferencia.
- Evaluacion comparativa de rendimiento ONNX frente a PyTorch para el mismo modelo, como paso previo a decisiones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la transcripcion greedy del clip JFK en CPU nativa fue satisfactoria y que la auditoria del artefacto paso 5153 comprobaciones sin fallos, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa ~6,3 GB en FP16; la inferencia en CPU requiere al menos esa cantidad de memoria disponible para cargar los pesos, mas el overhead de ONNX Runtime.
- GPU recomendadas: no documentadas por el autor; al ser FP16 y ONNX, es compatible con GPUs que soporten ejecucion FP16 en ONNX Runtime (por ejemplo, A100, H100, RTX 4090), aunque no se confirma en la informacion proporcionada.
- GPU de consumo: no confirmado; el tamano de ~6,3 GB sugiere que podria caber en GPUs con 8 GB o mas de VRAM en FP16, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (CPU y potencialmente GPU), ASRJS (mencionado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ysdede/whisper-large-v3-onnx-4graph | no disponible (~1550 M en el original) | no disponible (audio de 30 s en el original) | ONNX (4 grafos, FP16) | Apache 2.0 | Exportacion para ONNX Runtime/ASRJS |
| openai/whisper-large-v3 | ~1550 M (original) | audio de 30 s (original) | PyTorch/safetensors | Apache 2.0 | Modelo de referencia de OpenAI |
| openai/whisper-large-v3-turbo | no disponible | audio de 30 s (original) | PyTorch/safetensors | Apache 2.0 | Variante reducida del decoder, mas rapida |

Los datos de la comparativa para los modelos de OpenAI no estan confirmados en la informacion proporcionada y se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- El autor advierte explicitamente de que la prueba en CPU nativa no establece la aceptacion en navegador ni la precision general del modelo.
- Requiere ficheros de pesos externos; no es un artefacto autocontenido y su carga depende de la configuracion correcta de los cuatro grafos.
- No se documentan idiomas soportados ni datos de precision (WER) en la model card.
- Al ser una exportacion, cualquier limitacion del Whisper Large v3 original (sesgos, alucinaciones en audio ambiguo o con ruido, comportamiento variable segun el idioma) se hereda sin cambios.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la atribucion a OpenAI y al autor de la exportacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria documentada.
- No se documentan procesos de cuantizacion adicionales (INT8, INT4), lo que limita las opciones de reduccion de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ysdede/whisper-large-v3-onnx-4graph
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
