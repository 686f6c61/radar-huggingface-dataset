# xbill9/gemma-4-31B-it-qat-q4_0-fp8-text

## Resumen

Este repositorio contiene una version cuantizada en FP8 del modelo Gemma 4 31B-it de Google DeepMind, publicada de forma no oficial por el usuario xbill9. Se parte de los pesos que ya han pasado por un proceso de entrenamiento consciente de la cuantizacion (QAT, quantization-aware training) de Google, concretamente del checkpoint `google/gemma-4-31B-it-qat-q4_0-unquantized`, y se reempaquetan todas las capas lineales en formato FP8 E4M3. El objetivo es ofrecer un checkpoint de solo texto que se pueda servir en vLLM con pesos de 8 bits y activaciones de 8 bits (W8A8), reduciendo el espacio en disco y, potencialmente, mejorando el rendimiento en hardware con soporte nativo de FP8.

El modelo cuenta con 30.697.345.340 parametros reales (aproximadamente 30,7 mil millones) y ocupa 32,2 GB en el repositorio, con un checkpoint de 29,92 GiB. La relevancia de esta publicacion es practica: demuestra un flujo de conversion de pesos QAT de 4 bits a un contenedor FP8 compatible con el formato `compressed-tensors` que vLLM consume de forma nativa. No incluye la torre de vision, es decir, es exclusivamente texto.

Se trata de una construccion no oficial, verificada de forma offline contra su origen, pero segun el propio autor todavia no se ha servido ni evaluado; esta en cola para una bateria de pruebas de servicio en una GPU AMD Instinct MI300X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 (detalles especificos no disponibles) |
| Parametros totales | 30.697.345.340 (~30,7 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8 (pesos FP8 con una escala float32 por canal de salida; activaciones FP8 por token en tiempo de ejecucion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors, `compressed-tensors` (`float-quantized`) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 4 de Google DeepMind, en su variante 31B-it (instruction-tuned) y de solo texto. Las capas lineales (410 modulos en total, con 29.286.727.680 valores cuantizados) se almacenan en FP8 E4M3 con una unica escala float32 por canal de salida, mientras que los embeddings, las normalizaciones y el resto de tensores permanecen en bf16. Segun el informe de verificacion incluido, los 422 tensores no lineales son identicos byte a byte a su origen y el error RMS relativo de la cuantizacion es del 2,64 %, con un error maximo del 3,57 % respecto al mayor valor de su fila.

El punto de partida es un modelo entrenado con QAT sobre una rejilla de 4 bits con una escala por grupo de 32 valores. Dado que el formato FP8 con una escala por canal de salida no puede representar esas escalas por grupo, esta construccion vuelve a redondear los pesos QAT y, ademas, cuantiza las activaciones. La conversion se realiza con los scripts `fp8_text.py` y `repack_q4_0.py`, incluidos en el propio repositorio, y no se emplean datos de calibracion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion en modo instruction-tuned (pipeline `text-generation`, etiqueta `conversational`).
- Modelo exclusivamente de texto: no incluye capacidades de vision, audio ni multimodalidad.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, decodificacion especulativa, atencion lineal): no disponible en la informacion proporcionada.
- Estado de evaluacion: el autor indica que el modelo aun no se ha servido ni evaluado.

## Casos de uso

- Servicio de inferencia en vLLM: el checkpoint esta empaquetado en `compressed-tensors` con FP8 W8A8, de modo que se puede cargar directamente en vLLM en hardware con soporte FP8 para atender peticiones de generacion de texto con un peso en disco de 29,92 GiB.
- Despliegue en GPUs de datacenter con memoria amplia: al ocupar alrededor de 30 GiB solo en pesos, encaja en aceleradores como A100 80 GB, H100 80 GB o MI300X 192 GB, permitiendo servir el modelo completo sin paralelismo de tensor obligatorio.
- Investigacion sobre cuantizacion QAT: sirve como caso de estudio para medir como se comporta un checkpoint entrenado con QAT de 4 bits al reempaquetarse en FP8, comparando el error RMS reportado (2,64 %) con la calidad final en tareas reales.
- Comparacion de formatos de cuantizacion: al existir versiones hermanas del mismo modelo en W4A16, INT8, NVFP4 y GGUF, permite ejecutar experimentos controlados sobre precision, latencia y uso de memoria manteniendo los mismos pesos base.
- Generacion de texto en produccion con requisitos de memoria contenidos: al reducir los pesos a 8 bits frente al bf16 original (que rondaria los 61 GB), facilita el despliegue en nodos con menos VRAM.
- Reproduccion de la cadena de conversion: los scripts incluidos permiten regenerar el checkpoint o adaptar el flujo a otros modelos QAT de Google, util para equipos que mantienen pipelines propios de publicacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica en la model card que el modelo "aun no se ha servido ni evaluado" y que esta en cola para una bateria de pruebas de servicio en una GPU AMD Instinct MI300X.

| Metrica de verificacion offline | Valor |
|---|---|
| Modulos lineales convertidos a FP8 | 410 |
| Valores cuantizados | 29.286.727.680 |
| Error RMS relativo | 2,64 % |
| Error maximo (fraccion del mayor valor de su fila) | 3,57 % |
| Tensores no lineales identicos byte a byte | 422 de 422 |
| Tamano del checkpoint | 29,92 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GiB solo para pesos, mas la memoria de la cache KV y el overhead del motor de inferencia.
- GPUs recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI300X 192 GB. El autor tiene planificada una bateria de pruebas en una MI300X.
- GPU de consumo: no cabe holgadamente en una RTX 4090 (24 GB) solo con los pesos del checkpoint. Seria necesario repartir el modelo entre varias GPUs o recurrir a offload a CPU.
- Opciones de despliegue: vLLM (libreria declarada del repositorio). El formato `compressed-tensors` tambien es consumible por otros motores compatibles, aunque no se detallan en la informacion disponible.
- Latencia y throughput estimados: no disponible para esta construccion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-31B-it-qat-q4_0-fp8-text | 30,7 B | FP8 E4M3 W8A8 | compressed-tensors, vLLM | Apache 2.0 | Verificado offline, sin servir ni evaluar |
| xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text | 30,7 B (mismo base) | QAT 4 bits W4A16 exacto | compressed-tensors | Apache 2.0 | no disponible |
| xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf | 30,7 B (mismo base) | QAT 4 bits en GGUF | GGUF | Apache 2.0 | no disponible |
| Build NVFP4 de Gemma 4 31B-it | ~31 B | NVFP4 | no disponible | Apache 2.0 | Mencionado en articulos de SageMaker |

Las alternativas mas directas son las demas conversiones del mismo checkpoint QAT publicadas por el mismo autor: la version W4A16 reproduce la rejilla QAT exacta de 4 bits con una escala por grupo de 32 valores, mientras que esta version FP8 vuelve a redondear a 8 bits por canal y anade cuantizacion de activaciones, lo que la aleja de la rejilla QAT original.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Alcance limitado a texto: el modelo no incluye vision ni otras modalidades.
- Perdida de fidelidad respecto al QAT original: al no poder representar las escalas por grupo de 32 valores, esta construccion vuelve a redondear los pesos ya cuantizados y ademas cuantiza activaciones; se reporta un error RMS relativo del 2,64 %.
- Sin evaluacion: el autor declara explicitamente que el modelo no se ha servido ni evaluado, por lo que no hay garantias de comportamiento en produccion.
- Construccion no oficial: no esta afiliada ni respaldada por Google. Los problemas deben reportarse al autor del repositorio, no a Google.
- Licencia: el repositorio se redistribuye bajo Apache 2.0, pero enlaza a la licencia especifica de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos antes de un uso comercial.
- Idoneidad de hardware: el soporte nativo de FP8 esta limitado a determinadas generaciones de GPU (Hopper, Ada y equivalentes), lo que restringe las plataformas donde este checkpoint aporta ventajas frente a bf16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-fp8-text
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Version W4A16 con rejilla QAT exacta: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text
- Version GGUF exacta (mencionada en la busqueda): https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf
- Version 26B-A4B W8A8 INT8 (mencionada en la busqueda): https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo: 4-Bit Embeddings Decode up to 1.39x Faster on One L4: https://dev.to/aws-builders/gemma-4-on-amazon-sagemaker-4-bit-embeddings-decode-up-to-139x-faster-on-one-l4-36mf
- Articulo: QAT Weights Decode 2.05x Faster Than bf16 on One L4: https://dev.to/aws-builders/gemma-4-on-amazon-sagemaker-qat-weights-decode-205x-faster-than-bf16-on-one-l4-318m
- Articulo: Gemma 4 on Amazon SageMaker, NVIDIA T4: https://dev.to/gde/gemma-4-on-amazon-sagemaker-the-nvidia-t4-decodes-at-08x-of-the-l4-with-the-same-answers-19m4
- Articulo: Google's QAT Gemma 4 26B-A4B on One TPU v6e: https://dev.to/gde/googles-qat-gemma-4-26b-a4b-on-one-tpu-v6e-156x-the-kv-cache-and-19x-the-throughput-of-fp8-36kl
