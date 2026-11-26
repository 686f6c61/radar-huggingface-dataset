# timesmith/Inkling-2-Mini-oQ6e

## Resumen

Inkling-2-Mini-oQ6e es una version cuantizada del modelo Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. Se trata de un checkpoint multimodal (lenguaje mas vision) de aproximadamente 26.388 millones de parametros en el modelo de lenguaje, mas 0,318 mil millones adicionales en el codificador de vision, lo que da un total de 26.707 millones de parametros logicos. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.3) en precision mixta, con un promedio efectivo de 5,352 bits por peso.

El modelo resuelve el problema de desplegar un modelo de ~26B parametros con vision en hardware con memoria limitada, especialmente en el ecosistema Apple Silicon, ya que la libreria declarada es MLX. El checkpoint completo ocupa 17,867 GB (16,640 GiB), lo que lo hace viable en equipos con 24-32 GB de memoria unificada, algo impensable en BF16 (que rondaria los 53 GB).

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta poco habitual (combinacion de NVFP4, affine 6-bit, affine 8-bit, BF16 y FP32 en un mismo checkpoint); por otro, advierte de que se trata de una publicacion con cero descargas y cero likes, sin model card detallada del modelo base, sin licencia declarada y sin benchmarks, por lo que su evaluacion en produccion exige cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop`; presumiblemente transformer con vision, sin confirmar) |
| Parametros totales | 26.707.000.000 (26,388B lenguaje + 0,318B vision) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16 (76,327%), affine 6-bit grupo 64 (15,265%), affine 8-bit grupo 64 (5,887%), BF16 (2,387%), FP32 (0,133%); promedio 5,352 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Inkling-2-Mini: la model card solo documenta el proceso de cuantizacion. La etiqueta `inkling2_loop` sugiere una variante arquitectonica denominada "loop", pero no se aporta detalle sobre si se trata de un transformer denso, un modelo con capas recurrentes o un hibrido. La presencia de un modulo de vision de 0,318B parametros confirma que el modelo es multimodal imagen-texto.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion tecnica verificable es la relativa a la cuantizacion: se uso oQ (oMLX v0.8.3), que asigna precision de forma diferenciada por tensor. La mayor parte de los pesos (76,327%) se almacenan en NVFP4 con grupo de 16, una eleccion agresiva que reduce el peso a 4,50 bits efectivos; un 15,265% se mantiene en affine 6-bit (6,50 bits efectivos), un 5,887% en affine 8-bit (8,50 bits), y una fraccion pequena (2,52% combinado) se conserva en BF16 y FP32, presumiblemente para capas sensibles como embeddings, normas o la cabeza de salida.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun lo esperable en un modelo de lenguaje de ~26B parametros (no confirmado por el autor).
- Procesamiento de imagenes: el checkpoint incluye un modulo de vision de 0,318B parametros, por lo que admite entradas multimodales imagen-texto.
- Razonamiento y codigo: no disponible, no hay documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 16,640 GiB cabe en equipos con 24 GB o 32 GB de memoria unificada (MacBook Pro M-series, Mac Studio), lo que permite ejecutar un modelo multimodal de ~26B en local sin GPU dedicada. Es el caso de uso principal dada la libreria declarada.
- Prototipado de aplicaciones vision-lenguaje en estacion de trabajo: el modulo de vision integrado permite experimentar con tareas de descripcion de imagenes o VQA en un portatil, sin depender de APIs externas.
- Evaluacion de tecnicas de cuantizacion mixta: investigadores interesados en NVFP4 y precisiones diferenciadas por tensor pueden usar este checkpoint como referencia para medir la degradacion frente al modelo en BF16.
- Procesamiento de documentos con componentes visuales: al combinar texto e imagen, puede emplearse para extraer informacion de capturas, diagramas o formularios, siempre que se valide la calidad real del modelo base.
- Despliegue de bajo coste en entornos con memoria restringida: frente a los ~53 GB que ocuparia en BF16, los 17,867 GB del checkpoint permiten alojar el modelo en instancias con menos VRAM o RAM.
- Experimentacion academica con modelos cuantizados: util para comparar curvas de perplejidad y calidad de generacion entre el original y esta variante de 5,352 bits/peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 16,640 GiB solo para los pesos; con cache KV y overhead de runtime, se recomienda un minimo de 24 GB de memoria unificada o VRAM, y 32 GB para contextos largos.
- GPU recomendadas: el formato es MLX, por lo que el entorno objetivo son los chips Apple M1/M2/M3/M4 (Pro, Max y Ultra). No se distribuye en GGUF ni en formato compatible directamente con CUDA.
- Cabe en GPU consumer: si, en Apple Silicon con 24-32 GB de memoria unificada. En GPUs NVIDIA consumer (RTX 4090 de 24 GB) requeriria conversion previa a otro formato, no disponible en este repo.
- Opciones de despliegue: MLX (libreria declarada) y oMLX, la herramienta de cuantizacion del mismo ecosistema. No se proporcionan pesos GGUF para llama.cpp u Ollama, ni plantillas para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ6e | 26,707B (26,388B LM + 0,318B vision) | no disponible | MLX safetensors, mixta 5,352 bits/peso | no disponible | Hugging Face, 0 descargas |
| Modelo base Inkling-2-Mini (BF16) | no disponible | no disponible | no disponible | no disponible | no referenciado en la informacion |
| Alternativas de ~27B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables directos ni sobre el modelo base, por lo que la comparativa cuantitativa no es posible con los datos proporcionados.

## Limitaciones y advertencias

- Ausencia total de model card del modelo base: no se documentan arquitectura, datos de entrenamiento, idiomas ni contexto, lo que impide evaluar su idoneidad para produccion.
- Licencia no declarada: no puede asumirse uso comercial permitido; es un bloqueo legal para cualquier despliegue empresarial hasta que el autor lo aclare.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Cuantizacion agresiva: el 76,327% de los pesos en NVFP4 (4,50 bits efectivos) puede degradar tareas sensibles a precision, como matematicas, codigo o razonamiento de varios pasos. No se aportan metricas de degradacion frente al BF16.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no puede acotarse.
- Dependencia de ecosistema: al ser MLX, queda restringido a hardware Apple; no hay pesos GGUF ni safetensors estandar para CUDA.
- Idiomas no declarados: no puede garantizarse un rendimiento correcto en castellano ni en otros idiomas distintos del ingles.
- Fecha de creacion futura (2026-11-26): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ6e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
