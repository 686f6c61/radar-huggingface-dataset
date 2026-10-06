# tomngdev/Swift1.5-Qwen3.8-Flash-Next-GGUF

## Resumen

Swift1.5-Qwen3.8-Flash-Next-GGUF es una cuantizacion en formato GGUF del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario tomngdev. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF del checkpoint BF16 de UkisAI, orientada a su ejecucion con llama.cpp y derivados. El checkpoint original cuenta con 179.551.050.368 parametros (aproximadamente 179,5 mil millones), etiqueta de Mixture of Experts (MoE) y un pipeline de image-text-to-text, lo que indica que acepta imagenes junto a texto.

El modelo base es un derivado de Qwen/Qwen3.8-Flash-Next optimizado para eficiencia de razonamiento: segun la model card, reduce los tokens de pensamiento un 63,4%, acelera la generacion 1,8 veces y mantiene una perdida de precision inferior al 1% respecto al modelo base en el ajuste xhigh. Se distribuye bajo la licencia swift-open-license-1.0, que no es una licencia de codigo abierto estandar y exige revisar sus terminos antes de cualquier uso comercial.

Esta ficha cubre la conversion GGUF en concreto, no el checkpoint BF16 completo. La model card original fue truncada en la informacion proporcionada, por lo que la tabla de evaluacion detallada no esta disponible mas alla de los datos agregados citados en el texto. El repositorio ocupa 159,5 GB, lo que lo situa en el rango de despliegues multi-GPU o de inferencia con offload a RAM del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) segun etiquetas; detalles de capas y atencion no disponibles |
| Parametros totales | 179.551.050.368 (aproximadamente 179,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (receta GSQ-RCO), con excepciones: token_embd en Q6_K, blk.*.ffn_down_shexp en Q8_0, per_layer_token_embd en BF16 (carga perezosa desde disco, aproximadamente 96 GiB) y modulo MTP cuantizado a Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (con ficheros de imatrix y modulo MTP en GGUF) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la etiqueta "Mixture of Experts" y del pipeline image-text-to-text, por lo que se desconoce el numero de expertos, el ratio de activacion, el tipo de atencion o si emplea tecnicas hibridas. El parametro total declarado en safetensors es de 179.551.050.368. El modelo base es Qwen3.8-Flash-Next, desarrollado por Qwen, y Swift 1.5 Qwen3.8-Flash-Next es la variante reentrenada por UkisAI.

En cuanto al entrenamiento del modelo base de esta conversion, la model card describe un enfoque orientado a reducir el "sobrepensamiento" patologico: en lugar de penalizar directamente la longitud del razonamiento, se identificaron los tokens asociados a ese comportamiento y se penalizaron de forma selectiva, recuperando despues la precision mediante RL y OPD (on-policy distillation). Esto produce trazas de razonamiento mas cortas. La release incorpora ademas metodos de post-entrenamiento adaptados a codigo y a trabajo de agente de horizonte largo (agentes personales, uso de terminal e ingenieria de software). Los datos de entrenamiento son publicos en el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, si bien la model card aclara que no se usan tal cual, sino remuestreados y convertidos en entornos de RL. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

La conversion a GGUF emplea la receta de ISTA-DASLab para Qwen3.8-Flash-Next-GSQ-RCO:IQ3_S y el fichero imatrix de unsloth/Qwen3.8-Flash-Next-GGUF. Respecto a la receta original, se introducen tres cambios: token_embd pasa a Q6_K, blk.*.ffn_down_shexp a Q8_0 y per_layer_token_embd se mantiene en BF16 con carga perezosa desde disco. El modulo MTP (multi-token prediction) esta incluido, cuantizado a Q4_K_M con la misma receta de unsloth, lo que habilita decodificacion especulativa en los runners que lo soportan.

## Capacidades

- Generacion de texto y razonamiento con trazas de pensamiento deliberadamente comprimidas gracias al entrenamiento de eficiencia de tokens.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), lo que permite tareas de vision-lenguaje.
- Generacion de codigo, con post-entrenamiento especifico para ingenieria de software y uso de terminal.
- Comportamiento de agente de horizonte largo: la model card menciona agentes personales, uso de terminal y flujos multi-paso como objetivos de entrenamiento.
- Compatibilidad con decodificacion especulativa mediante el modulo MTP incluido en el repositorio.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes de terminal y automatizacion de shell: el modelo fue post-entrenado especificamente para uso de terminal, por lo que puede encadenar comandos, interpretar salidas y corregir errores en tareas de administracion o scripts.
- Asistentes de ingenieria de software: generacion y refactorizacion de codigo en repositorios, con trazas de razonamiento mas cortas que reducen el coste por tarea y el tiempo de espera del desarrollador.
- Prototipado de videojuegos y aplicaciones interactivas: la demo de la model card muestra la generacion de un endless runner 3D funcional en 4 minutos y 56 segundos, frente a 8 minutos y 52 segundos del modelo base, lo que lo hace util para generar esqueletos de proyectos jugables.
- Analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede extraer informacion de capturas, diagramas o interfaces y combinarla con texto.
- Pipelines de razonamiento por lotes con restriccion de coste: la reduccion del 63,4% en tokens de pensamiento abarata la inferencia en tareas donde la precision debe mantenerse por encima del umbral y el presupuesto de tokens es el cuello de botella.
- Servicio conversacional multi-turno de largo recorrido: la naturaleza MoE y el contexto extendido del modelo base lo orientan a dialogos largos con historial extenso, aunque la longitud de contexto concreta no esta documentada.
- Despliegue local en estaciones de trabajo con mucha RAM: la cuantizacion IQ3_S permite ejecutar un modelo de 179,5 mil millones de parametros con offload parcial, algo inviable con el checkpoint BF16 en hardware de un solo nodo convencional.

## Benchmarks y rendimiento

La tabla de evaluacion completa de la model card quedo truncada en la informacion disponible. Los unicos datos numericos presentes en el texto son los siguientes, comparando el checkpoint BF16 base (Qwen3.8-Flash-Next) con Swift 1.5 BF16:

| Metrica | Valor |
|---|---|
| Reduccion de tokens de pensamiento | 63,4% menos |
| Aceleracion | 1,8x |
| Perdida de precision frente al base en xhigh | inferior al 1% |
| Tiempo de generacion de la demo de juego (base) | 8 minutos 52 segundos |
| Tiempo de generacion de la demo de juego (Swift 1.5) | 4 minutos 56 segundos |

La model card menciona que se reportan columnas de tokens de pensamiento y que en Terminal-Bench 2.1 se contabilizan los tokens totales generados, pero los valores concretos de MMLU, HumanEval, GSM8K y del resto de benchmarks no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks de la conversion GGUF especifica en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 159,5 GB, por lo que se necesita al menos ese espacio en disco, preferiblemente en almacenamiento rapido por la carga perezosa del tensor per_layer_token_embd (aproximadamente 96 GiB en BF16).
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, una cuantizacion IQ3_S de 179,5 mil millones de parametros suele requerir del orden de 75 a 95 GB solo para los pesos, a lo que se suma el modulo MTP y los buffers de contexto; el offload parcial a RAM del sistema es previsible.
- GPU recomendadas: no especificadas por el autor. Por tamano, el escenario natural son nodos con varias A100 80 GB, H100 80 GB o H200, o bien configuraciones con una GPU grande mas offload a RAM.
- GPU de consumo: no cabe en una GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin offload masivo a RAM y penalizacion severa de velocidad.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cpp-python, Ollama, LM Studio, koboldcpp) al ser formato GGUF. El soporte concreto de vLLM o TGI para este GGUF no esta confirmado en la informacion disponible.
- Decodificacion especulativa: el modulo MTP incluido (Q4_K_M) permite acelerar la generacion en los runners que implementan multi-token prediction, pero no se publican cifras de tokens por segundo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el propio linaje del modelo, no con alternativas de terceros de la misma categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tomngdev/Swift1.5-Qwen3.8-Flash-Next-GGUF | 179,5 mil millones | no disponible | GGUF (IQ3_S con excepciones) | swift-open-license-1.0 | Conversion del checkpoint UkisAI con imatrix de unsloth y receta GSQ-RCO de ISTA-DASLab; incluye MTP |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | 179,5 mil millones (mismo linaje) | no disponible | safetensors BF16 | swift-open-license-1.0 | Checkpoint original de referencia usado para la cuantizacion |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF | no disponible | Origen del fichero imatrix y de la receta del modulo MTP |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF (IQ3_S) | no disponible | Origen de la receta de asignacion de cuantizacion GSQ-RCO |

Comparativas con modelos de otros desarrolladores (por ejemplo, alternativas abiertas de tamano similar): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un derivado de un modelo base de Qwen, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion: no cuantificado. La optimizacion para reducir tokens de razonamiento podria recortar verificacion en tareas que la requieran; el autor afirma que observa menos errores por sobrepensamiento, pero no aporta una evaluacion de tasas de alucinacion.
- Idiomas: la model card no enumera idiomas soportados. No hay garantia documentada de rendimiento en castellano mas alla del comportamiento multilingue del modelo base, que tampoco se especifica.
- Contexto: la longitud de contexto no esta declarada. No se debe asumir un valor concreto sin verificarlo con el autor o con el modelo base.
- Licencia: swift-open-license-1.0 esta clasificada como "other" y la model card enlaza a terminos de licencia empresarial. Es imprescindible leer el texto completo antes de cualquier uso comercial; no es una licencia de codigo abierto permisiva estandar.
- Riesgo de cuantizacion: IQ3_S es una cuantizacion agresiva (aproximadamente 3 bits por peso en la mayor parte de las capas). Aunque se compensa con Q6_K en embeddings de tokens y Q8_0 en ffn_down_shexp, puede degradar tareas sensibles a precision numerica como matematicas o razonamiento de muchos pasos.
- Carga perezosa: el tensor per_layer_token_embd en BF16 ocupa aproximadamente 96 GiB y se carga desde disco, lo que exige almacenamiento rapido y puede provocar picos de latencia en el arranque o en el primer token.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad ni informes independientes de calidad.
- Origen de la receta: la conversion depende de recetas e imatrix de terceros (ISTA-DASLab, unsloth); cualquier cambio en esos artefactos no se refleja en este repositorio.
- Produccion: el autor no publica cifras de throughput, latencia ni consumo de memoria, por lo que un despliegue en produccion requiere benchmarks propios antes de dimensionar infraestructura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tomngdev/Swift1.5-Qwen3.8-Flash-Next-GGUF
- Modelo base (checkpoint UkisAI): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo Qwen de origen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- GGUF GSQ-RCO de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Receta de cuantizacion GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/tensor-allocation/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-00001-of-00002.rco-allocation.txt
- Fichero imatrix de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/blob/main/imatrix_unsloth.gguf_file
- Modulo MTP de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/blob/main/MTP/mtp-Qwen3.8-Flash-Next-Q4_K_M.gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo jugable: https://ukisai.com/swift-games/flash-next
