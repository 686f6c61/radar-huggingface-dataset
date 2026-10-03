# TechPrototyper/Gemma4-31B-IT-PrismaQuant-6bit-abliterated-vllm

## Resumen

`TechPrototyper/Gemma4-31B-IT-PrismaQuant-6bit-abliterated-vllm` es un checkpoint derivado de `rdtand/Gemma4-31B-IT-PrismaQuant-6bit-vllm`, que a su vez es una cuantizacion PrismaQuant de 6,000 bits por peso de `google/gemma-4-31B-it`. Lo particular de esta publicacion no es el entrenamiento ni la cuantizacion, sino el metodo: se ha reducido el comportamiento de rechazo (abliteration) modificando unicamente 118 planos de pesos dentro del checkpoint ya cuantizado, sin recuantizar el modelo y sin alterar el formato, los codebooks, las escalas ni la asignacion de formato por tensor.

La cuantizacion original es obra de Robert Tand (`rdtand`), autor de PrismaQuant y de GridBook, y el repositorio se declara explicitamente como derivado suyo. El modelo cuenta con 22.181.541.740 parametros reales segun los safetensors (el nombre del repositorio indica 31B, una discrepancia que la informacion disponible no explica), ocupa 27,2 GB en el Hub y esta publicado bajo licencia Gemma con `library_name: vllm`.

Es relevante ahora porque propone un patron de despliegue distinto al habitual: en lugar de abliterar en BF16 y recuantizar despues (lo que cambia la asignacion de formatos por tensor y obliga a revalidar toda la pila), se conserva el artefacto de produccion y se editan solo los bytes de los tensores objetivo. Esto mantiene identico el layout de shards, el presupuesto de KV y la clase de throughput respecto al padre, de modo que cualquier regresion posterior puede atribuirse a la edicion de pesos y no a un cambio de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de `google/gemma-4-31B-it` (torre de texto cuantizada + torre de vision en BF16 passthrough) |
| Parametros totales | 22.181.541.740 (~22,18 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta a 6,000 bits por peso (bpp): NVFP4, FP8 E4M3 y BF16, en formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | Gemma (`license: gemma`), enlace: https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | safetensors (`compressed-tensors`), 2025 tensores, repo de 27,2 GB |

Otros datos del repositorio: `pipeline_tag: text-generation`, tags `conversational`, `quantized`, `abliterated`, `uncensored`, `vllm`, `nvfp4`, `fp8`; 0 descargas y 0 likes en el momento de la consulta; creado el 2026-10-03. La model card incluye `inference: false`.

## Arquitectura y entrenamiento

Este checkpoint no entrena nada. Parte de una abliteracion en BF16 de `google/gemma-4-31B-it` producida con Heretic en modo ARA (ablacion direccional de rango 1, con adaptadores PEFT reales fusionados a BF16 denso). Los tensores objetivo son los Linears que escriben en el flujo residual: `o_proj` (salida de atencion) y `down_proj` (salida del MLP), que son los modulos por los que se expresa aditivamente una direccion de rechazo.

El metodo de edicion, en cuatro pasos, es: (1) seleccionar esos Linears; (2) decodificar los codigos de produccion de cada tensor; (3) sustituir los pesos por los del donante y recodificarlos con el encoder de produccion contra los planos de escala congelados, leyendo formato por tensor, tamano de grupo, escala global y escala de activacion del checkpoint existente sin recalcularlos; y (4) escribir por rangos de bytes una copia del padre en la que solo se sobrescriben los rangos de datos de los tensores editados. Como consecuencia, formas y dtypes quedan intactos y el resto de tensores es bit-identico por construccion.

Del total de 2025 tensores, 1907 son bit-identicos al padre y 118 cambian, todos dentro del patron previsto. La torre de vision no se toca (0 tensores). Dentro de las matrices editadas cambiaron 712.752.623 de 9.672.327.168 codigos, un 7,37 %. Nota tecnica del autor para quien reproduzca el proceso: en `compressed-tensors`, `weight_global_scale` se almacena como reciproco (`448·6/amax`) y debe dividirse, no multiplicarse; invertir la operacion produce un modelo que carga y genera texto fluido pero incorrecto.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y otros idiomas (la lista concreta de idiomas no esta documentada en la informacion disponible).
- Comprension de imagenes: la torre de vision se conserva intacta en BF16 desde el padre, por lo que la capacidad multimodal no se ve alterada por la edicion.
- Comportamiento de rechazo reducido respecto al modelo ajustado por instrucciones original, con menor frecuencia de rechazos duros y mayor presencia de cautela blanda en su lugar.
- Generacion de texto condicionada por instrucciones (variante IT), con el estilo conversacional del modelo base.
- Soporte de `tool calling` / `function calling`: no documentado en la informacion disponible.
- Modo de razonamiento explicito o "thinking mode": no documentado en la informacion disponible.
- Capacidades de audio: no documentado en la informacion disponible.
- Inferencia servida mediante vLLM con soporte de `compressed-tensors` para los formatos mixtos NVFP4 / FP8 / BF16.

## Casos de uso

- Investigacion en seguridad y alineacion: analisis de como se distribuye la direccion de rechazo en `o_proj` y `down_proj` de un modelo cuantizado, usando este checkpoint como variante editada y el padre como control, con la ventaja de que ambos comparten layout de memoria.
- Pruebas de regresion de despliegue: al ser bit-identico al padre salvo 118 tensores, permite comparar dos despliegues en produccion aislando la variable "pesos editados" frente a "cuantizacion distinta", algo que no permite la ruta de abliterar y recuantizar.
- Red teaming y evaluacion de robustez: generacion de respuestas en dominios donde el modelo base rechazaria, para medir tasas de rechazo con clasificadores propios sobre conjuntos de prompts idénticos.
- Generacion de datos sinteticos de conversacion: produccion de dialogos multi-turno con menos interrupciones por rechazo, util para crear corpus de entrenamiento o de evaluacion con estilo controlado.
- Despliegue self-hosted con vLLM: servicio de chat sobre GPU profesional o de gama alta de consumo con aproximadamente 17 GB de pesos, reutilizando integramente la configuracion de servido, sharding y presupuesto de KV del checkpoint padre.
- Asistentes multimodales internos: al conservar la torre de vision, sirve para tareas de descripcion de imagenes y respuesta sobre documentos escaneados donde se prefiere un modelo con menos negativas por defecto.
- Analisis lingüistico y de estilo: estudio comparativo del efecto de una ablacion direccional de rango 1 sobre la fluidez, la longitud y la estructura de las respuestas, con un donante BF16 y su version recuantizada como referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo documenta mediciones de comportamiento de rechazo y una comparacion de asignacion de formatos de cuantizacion.

Clases de rechazo sobre 100 prompts, una misma ruta de API y un mismo clasificador (comparacion entre el donante abliterado en BF16 y ese mismo donante recuantizado; no son mediciones de este checkpoint):

| Clase de rechazo (100 prompts) | Donante abliterado BF16 | Mismo modelo, recuantizado |
|---|---|---|
| Rechazo duro | 33 | 24 |
| Solo cautela blanda | 58 | 66 |
| Vacios | 0 | 0 |
| Sin marcador | 9 | 10 |

Asignacion de formato por tensor a un presupuesto identico de 6,000 bpp:

| Build | NVFP4 | FP8 E4M3 | BF16 | bpp |
|---|---|---|---|---|
| Build de 6 bits desplegado | 234 | 135 | 41 | 6,000 |
| Abliterado y luego recuantizado | 246 | 116 | 48 | 6,000 |

Ambito de la edicion respecto al padre:

| Namespace | Tensores distintos del padre |
|---|---|
| Capas de texto | 118 |
| Torre de vision | 0 |
| Resto | 0 |

| Tipo de matriz | Numero |
|---|---|
| `down_proj.weight_packed` (NVFP4) | 41 |
| `o_proj.weight_packed` (NVFP4) | 33 |
| `o_proj.weight` (FP8 / BF16) | 27 |
| `down_proj.weight` (FP8 / BF16) | 17 |

Verificacion de edicion nula: en la ruta FP8, 0 de 115.605.504 bytes difieren; en la ruta NVFP4, 0 de 57.802.752 bytes difieren (bit-identico en ambos casos).

## Requisitos de hardware

- Pesos: 22.181.541.740 parametros a 6,000 bpp equivalen a unos 16,6 GB de pesos cuantizados, sobre un repo de 27,2 GB que incluye torre de vision en BF16, escalas y metadatos.
- VRAM estimada para inferencia: aproximadamente 18-20 GB solo para cargar pesos y estructuras auxiliares; el presupuesto de KV debe sumarse aparte y depende de la longitud de contexto, que no esta documentada.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 (32 GB) con contextos moderados. En 24 GB el margen para KV cache es estrecho.
- GPU profesional: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB y RTX A6000 48 GB son opciones holgadas; tambien es posible el despliegue multi-GPU con tensor parallelism en vLLM.
- Kernels NVFP4: los pesos NVFP4 estan pensados para generaciones de GPU recientes; la ficha no documenta requisitos minimos de computo ni rutas de emulacion. Conviene verificar la compatibilidad de los kernels NVFP4 de vLLM con la GPU objetivo antes de desplegar.
- Opciones de despliegue: vLLM es la via nativa (`library_name: vllm`, `compressed-tensors`). La model card indica `inference: false`, por lo que no hay widget de inferencia en el Hub. No se documentan builds GGUF, ni compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card afirma que la clase de throughput y el presupuesto de KV son identicos a los del padre, al no haberse redecidido la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `TechPrototyper/Gemma4-31B-IT-PrismaQuant-6bit-abliterated-vllm` | 22,18 B | Mixta 6,000 bpp (NVFP4/FP8/BF16) | no disponible | Gemma | Editado en 118 tensores |
| `rdtand/Gemma4-31B-IT-PrismaQuant-6bit-vllm` (padre) | 22,18 B (misma build) | Mixta 6,000 bpp (NVFP4/FP8/BF16) | no disponible | Gemma | Sin edicion de pesos |
| `google/gemma-4-31B-it` (base) | no disponible | BF16 (sin cuantizar) | no disponible | Gemma | Modelo original ajustado por instrucciones |
| Donante abliterado BF16 con Heretic | no disponible | BF16 | no disponible | Gemma | Abliteracion de referencia, no publicada en este repositorio |

No se dispone de comparativas de rendimiento frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion reduce deliberadamente los rechazos del modelo. Esto elimina parte de las barreras de seguridad del ajuste por instrucciones original y aumenta el riesgo de generar contenido inapropiado, danino o ilegal. No es un modelo adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de veracidad, factualidad o calibracion. Como cualquier modelo generativo, puede producir afirmaciones falsas con apariencia de solidez.
- La unica metrica de comportamiento publicada se midio sobre el donante BF16 y su version recuantizada, no sobre este checkpoint concreto. Las cifras de rechazo de este repositorio no estan verificadas de forma independiente.
- Los cambios de pesos se concentran en `o_proj` y `down_proj`; no se documenta evaluacion de si la edicion degrada otras capacidades (codigo, matematicas, seguimiento de instrucciones) mas alla de la torre de vision, que si se declara intacta.
- Discrepancia de nomenclatura: el repositorio se llama "31B" pero los safetensors declaran 22.181.541.740 parametros. La informacion disponible no explica la diferencia.
- Longitud de contexto e idiomas soportados no estan documentados en esta ficha; hay que consultar la documentacion del modelo base para planificar despliegues con contexto largo.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google en https://ai.google.dev/gemma/docs/gemma_4_license, que incluyen obligaciones de atribucion y restricciones de uso. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La model card indica `inference: false`; el despliegue requiere infraestructura propia (vLLM).
- No se ofrecen builds GGUF ni rutas para llama.cpp u Ollama, lo que limita las opciones de inferencia en CPU o en hardware sin soporte de los formatos NVFP4 y FP8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechPrototyper/Gemma4-31B-IT-PrismaQuant-6bit-abliterated-vllm
- Modelo padre (cuantizacion PrismaQuant original): https://huggingface.co/rdtand/Gemma4-31B-IT-PrismaQuant-6bit-vllm
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it
- Perfil del autor de la cuantizacion: https://huggingface.co/rdtand
- Repositorio GridBook: https://github.com/RobTand/gridbook
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace y de las referencias citadas en su model card.
