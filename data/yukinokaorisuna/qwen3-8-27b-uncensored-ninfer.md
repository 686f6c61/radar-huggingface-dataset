# YukinoKaorisuna/Qwen3.8-27B-Uncensored-ninfer

## Resumen

Qwen3.8-27B-Uncensored-ninfer es una build comunitaria del modelo Qwen3.8-27B de Alibaba Tongyi Qianwen, publicada por el usuario YukinoKaorisuna. Se trata de una version "abliterated" (se ha eliminado la direccion de rechazo de los pesos) que parte de los pesos ya desalineados de vkshdev/Qwen-3.8-28B-uncensored (abliteration ZeroFuse) y se ha convertido al formato propietario `.ninfer`, exclusivo del motor de inferencia NInfer de Neroued. No es un checkpoint safetensors generico: no se puede cargar con `transformers` y requiere el motor NInfer para funcionar.

El modelo esta cuantizado con la receta `groupwise-int-5080` (mezcla Q3/Q4/Q5, 15,33 GB) y esta optimizado explicitamente para tarjetas de 16 GB de la generacion Blackwell (RTX 5070 Ti y RTX 5080, sm_120). La model card reporta mediciones de rendimiento en una RTX 5070 Ti y estimaciones para la RTX 5080, con decodificacion especulativa mediante MTP (Multi-Token Prediction) y soporte opcional de vision.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo de cuantizacion mixta agresiva que permite ejecutar un modelo de ~27B en GPUs de consumo de 16 GB; por otro, es un ejemplo de distribucion en formato cerrado atado a un motor concreto, lo que limita su portabilidad. La informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks oficiales es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | ~27B (segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 65.536 tokens en modo texto; 8.192 tokens con vision en GPUs de 16 GB |
| Tipos de cuantizacion | Mezcla Q3/Q4/Q5 (`groupwise-int-5080`); KV cache en q4 (`--kv-dtype q4`) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato nativo del motor NInfer; no compatible con safetensors/GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B original, un transformer decoder-only de aproximadamente 27.000 millones de parametros. La model card no aporta detalles sobre numero de capas, dimensiones ocultas, tipo de atencion ni composicion del dataset de entrenamiento del modelo base. Tampoco se documenta si el Qwen3.8-27B original empleo RLHF, DPO u otras tecnicas de alineacion.

La innovacion principal de esta build no esta en el entrenamiento sino en el postprocesado. Primero se aplica abliteration (ortogonalizacion de la direccion de rechazo en los pesos) sobre los pesos de vkshdev/Qwen-3.8-28B-uncensored; despues se cuantiza con la receta `groupwise-int-5080`, que combina precisiones Q3, Q4 y Q5 por grupos de pesos para encajar en 16 GB. El motor NInfer anade decodificacion especulativa con un modelo borrador DFlash2 (z-lab/Qwen3.8-27B-DFlash2) y MTP con 3 tokens de borrador, ademas de CUDA graphs para reducir overhead de lanzamiento. La model card indica una tasa de aceptacion MTP de aproximadamente 44,7% en la RTX 5080.

## Capacidades

- Generacion de texto en chino e ingles, con razonamiento, matematicas y codigo heredados del Qwen3.8-27B base.
- Modo vision opcional mediante el flag `--vision` del motor NInfer (reconocimiento de imagenes), limitado a contexto de 8.192 tokens en GPUs de 16 GB.
- Decodificacion especulativa con modelo borrador DFlash2 y MTP de 3 tokens, integrada en el motor.
- Ejecucion con KV cache cuantizada en q4 para reducir huella de memoria.
- Comportamiento sin rechazo (abliterated): el modelo no aplica las negativas de seguridad del modelo original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Escritura creativa sin restricciones de contenido: el modelo esta pensado para investigacion y creacion personal; la abliteration elimina las negativas del modelo base, lo que resulta util para ficcion, roleplay y narrativa adulta en entornos controlados.
- Despliegue local en estaciones de trabajo con RTX 5070 Ti o RTX 5080: con 15,33 GB de pesos y decodificacion a ~65-71 tok/s, es viable como asistente local interactivo en una unica GPU de 16 GB.
- Procesamiento de documentos largos en chino e ingles: la ventana de 65.536 tokens en modo texto permite resumir, extraer y reescribir documentos extensos sin trocear.
- Analisis de imagenes en local: con `--vision` y contexto de 8.192 tokens se pueden describir capturas, diagramas o documentos escaneados, util para automatizacion de oficina sin enviar datos a la nube.
- Generacion de codigo y script en un pipeline de desarrollo: el modelo base Qwen3.8-27B tiene capacidades de codigo; esta build las conserva en tareas cotidianas segun la prueba interna del autor (sin diferencias en las 24 primeras preguntas).
- Investigacion sobre abliteration y cuantizacion: sirve como caso de estudio reproducible de eliminacion de direccion de rechazo y de recetas de cuantizacion mixta Q3/Q4/Q5 para GPUs de consumo.
- Prototipado de asistentes conversacionales multironda: el KV cache en q4 y el contexto largo permiten mantener conversaciones extensas con memoria de contexto en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. La model card incluye una prueba interna rapida del autor (48 preguntas objetivas propias, temperature=0, no es un benchmark oficial) que compara el modelo oficial con la version abliterated:

| Ronda | Oficial | Uncensored |
|---|---|---|
| Basicas (12) | 12 | 12 |
| Medias (12) | 12 | 12 |
| Competicion (12) | 10 | 9 |
| Olimpiada (12) | 9 | 8 |
| Total (48) | 43 | 41 |

Segun el autor, las tareas cotidianas (matematicas, sentido comun, codigo y logica, primeras 24 preguntas) muestran cero diferencia; la perdida de 2 puntos (~4%) se concentra en logica autorreferencial (paradoja del mentiroso) y evaluacion de funciones recursivas.

Rendimiento de inferencia medido en RTX 5070 Ti (16 GB, 70 SM, 896 GB/s):

| Configuracion | Prefill | Decode |
|---|---|---|
| 8192 ctx + MTP-3 + CUDA graph | ~1300 tok/s | ~65 tok/s |
| 8192 ctx + vision + MTP-3 | ~1600 tok/s | ~68-70 tok/s |
| 65536 ctx solo texto | no disponible | ~41 tok/s |

Estimaciones para RTX 5080 (16 GB, 84 SM, 960 GB/s): prefill ~1378 tok/s, decode ~71 tok/s, aceptacion MTP ~44,7%.

## Requisitos de hardware

- VRAM: los pesos ocupan 15,33 GB; se necesita una GPU con al menos 16 GB. Con vision, el contexto maximo es 8.192 tokens (16.384 se queda 85 MB por encima del presupuesto en 16 GB).
- GPUs objetivo: RTX 5070 Ti y RTX 5080 (Blackwell, sm_120). No se documenta compatibilidad con otras arquitecturas.
- GPU de consumo: si, cabe en RTX 5070 Ti y RTX 5080 de 16 GB. No se indica soporte para GPUs de 12 GB u 8 GB.
- GPUs de datacenter (A100, H100): no se documenta soporte; el formato y el motor estan orientados a Blackwell de consumo.
- Despliegue: exclusivamente mediante el motor NInfer (`ninfer-serve.exe` en Windows, build en YukinoKaorisuna/ninfer-5070ti). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: prefill ~1300-1600 tok/s y decode ~65-70 tok/s en RTX 5070 Ti; ~1378 tok/s y ~71 tok/s estimados en RTX 5080. A 65.536 tokens de contexto, el decode baja a ~41 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-ninfer | ~27B | 65.536 (texto) | `.ninfer` | Apache 2.0 | Solo motor NInfer; cuantizacion mixta Q3/Q4/Q5 |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | safetensors | no disponible | Modelo original alineado; portable con transformers |
| vkshdev/Qwen-3.8-28B-uncensored | ~28B | no disponible | no disponible | no disponible | Pesos abliterated de origen (ZeroFuse) |
| Otras builds abliterated de Qwen de ~27B | ~27B | variable | GGUF/safetensors | variable | Mayor portabilidad entre motores (llama.cpp, vLLM) |

La comparativa con alternativas de la misma categoria es limitada porque la informacion proporcionada solo cubre los modelos de la cadena de derivacion. Frente a builds GGUF equivalentes, la ventaja de esta version es el rendimiento medido en Blackwell de 16 GB; la desventaja es la ausencia total de portabilidad.

## Limitaciones y advertencias

- Formato cerrado: los pesos `.ninfer` solo funcionan con el motor NInfer; no se pueden cargar con `transformers`, llama.cpp, vLLM ni Ollama, lo que dificulta la integracion en infraestructura existente.
- Abliteration: elimina la direccion de rechazo, por lo que el modelo puede generar contenido que el Qwen3.8-27B original rechazaria. El autor lo restringe a investigacion y creacion personal y exige cumplir la legislacion local.
- Perdida de capacidad: segun la prueba interna del autor, baja ~4% en problemas de competicion, especialmente en logica autorreferencial y funciones recursivas.
- Idiomas: solo chino e ingles declarados; el rendimiento en castellano no esta documentado.
- Hardware: requiere GPU Blackwell de 16 GB (RTX 5070 Ti o 5080); no hay soporte documentado para otras GPUs ni para CPUs.
- Contexto con vision: limitado a 8.192 tokens en 16 GB; a 65.536 tokens el decode cae a ~41 tok/s.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinacion; al ser una build abliterated, las salvaguardas del modelo base estan ausentes.
- Licencia: Apache 2.0 permite uso comercial, pero la cadena de derivacion (pesos abliterated de terceros) y el uso del motor NInfer pueden tener condiciones propias no detalladas en la informacion disponible.
- Madurez: creado el 25 de septiembre de 2026 y actualizado dos dias despues; 1.170 descargas y 6 likes indican una adopcion muy temprana y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YukinoKaorisuna/Qwen3.8-27B-Uncensored-ninfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos abliterated de origen: https://huggingface.co/vkshdev/Qwen-3.8-28B-uncensored
- Motor NInfer: https://github.com/Neroued/ninfer
- Receta de cuantizacion y port a Windows (upstream): https://github.com/toddballinger/ninfer-5080
- Pull request del port: https://github.com/toddballinger/ninfer-5080/pull/16
- Build de Windows y port a 5070 Ti: https://github.com/YukinoKaorisuna/ninfer-5070ti
- Modelo borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
