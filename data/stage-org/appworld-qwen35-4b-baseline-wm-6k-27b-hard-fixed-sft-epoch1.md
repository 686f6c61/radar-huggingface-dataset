# Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch1

## Resumen

Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch1 es un checkpoint de ajuste supervisado (SFT) publicado por el usuario Stage-org en HuggingFace. El identificador del repositorio y el tag de arquitectura (`qwen3_5`) apuntan a un fine-tuning de un modelo base de la familia Qwen 3.5 de aproximadamente 4.500 millones de parametros, orientado a tareas de agente en el entorno AppWorld (un banco de pruebas de agentes interactivos que simula aplicaciones y personas). El repositorio no incluye model card descriptiva, por lo que la mayor parte de su comportamiento declarado solo puede inferirse del nombre y de los metadatos tecnicos.

El modelo tiene 4.539.265.536 parametros totales almacenados en formato safetensors, con un tamano de repositorio de 9,1 GB. Ese tamano es coherente con pesos en bf16/fp16 (aproximadamente 9,1 GB de pesos), sin indicios de cuantizacion ni de publicacion en otros formatos. El modelo registra 10 descargas y 0 "likes", lo que indica que es un artefacto experimental de baja difusion y sin validacion por parte de la comunidad.

Su relevancia es acotada y de nicho: se trata de un "baseline" (linea base) de investigacion para experimentos de agentes, probablemente destinado a comparar variantes de entrenamiento (el nombre sugiere conceptos como "world model", "6k" y un subconjunto "27b-hard"), mas que a un modelo de proposito general listo para produccion. No hay licencia, idiomas ni pipeline declarados en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada en la ficha; el tag `qwen3_5` sugiere un transformer decoder-only de la familia Qwen 3.5 |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | No disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, presumiblemente en bf16/fp16 dado el tamano del repo (9,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura exacta, el dataset ni el procedimiento de entrenamiento. Los unicos datos tecnicos verificables son el tag `qwen3_5`, el numero de parametros (4,54 mil millones) y el formato safetensors. El sufijo `sft-epoch1` indica que se trata de un ajuste supervisado tras una unica epoca, y la presencia de `appworld` en el nombre lo vincula al benchmark AppWorld de agentes interactivos, lo que sugiere que el ajuste se realizo sobre trazas de interaccion con aplicaciones y APIs.

El resto de elementos del identificador (`baseline`, `wm`, `6k`, `27b-hard`, `fixed`) son ambiguos y no estan documentados. Interpretados de forma tentativa, podrian referirse a un modelo de referencia base (`baseline`), a alguna variante de "world model" (`wm`), a un volumen de datos o pasos de entrenamiento (`6k`), a un subconjunto de tareas dificiles generado a partir de un modelo de 27B (`27b-hard`) y a una reejecucion corregida (`fixed`). Estas interpretaciones no deben tomarse como hechos confirmados.

Tampoco hay evidencia de que se hayan aplicado tecnicas de alineacion adicionales (RLHF, DPO) despues del SFT, ni de innovaciones de inferencia (decodificacion especulativa, atencion lineal) mas alla de lo que herede del modelo base.

## Capacidades

Debido a la ausencia de model card, las capacidades solo pueden inferirse del nombre, del tamano y del modelo base presumido, y deben considerarse no verificadas:

- Generacion de texto general, heredada del modelo base Qwen 3.5 de 4,5B.
- Ejecucion de tareas de agente multi-paso en entornos interactivos tipo AppWorld (uso de aplicaciones y APIs simuladas).
- Uso de herramientas y function calling, presumiblemente reforzado por el ajuste SFT sobre trazas de agente.
- Razonamiento encadenado y planificacion de acciones en tareas de codigo interactivo.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades de vision o audio: no disponibles y poco probables dado el tag de arquitectura.
- Modo "thinking" explicito: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el tamano y el enfoque de agente del modelo, pero no estan respaldados por documentacion del repositorio:

- Investigacion en agentes interactivos: uso como linea base ("baseline") para comparar variantes de entrenamiento dentro del benchmark AppWorld, midiendo tasas de exito en tareas de multiples pasos.
- Evaluacion de tecnicas de SFT para agentes: al ser un checkpoint de una sola epoca, sirve para estudiar el efecto del ajuste supervisado frente al modelo base sin ajustar.
- Automatizacion de tareas con APIs: en teoria puede encadenar llamadas a herramientas para completar flujos administrativos o de gestion de datos, si el ajuste ha preservado el soporte de tool calling.
- Prototipado de asistentes de codigo interactivo: generacion y edicion de codigo en un bucle de prueba y error dentro de un entorno controlado.
- Despliegue local en hardware de gama media: con 4,5B de parametros, es viable ejecutarlo cuantizado en GPUs de consumo para experimentos de agentes sin coste de API.
- Generacion de datos sinteticos para entrenar agentes: puede usarse para producir trazas de interaccion que alimenten pipelines de entrenamiento posteriores.
- Educacion e investigacion academica: reproduccion de experimentos de agentes en un entorno reproducible y de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones (MMLU, HumanEval, GSM8K, tasas de exito en AppWorld u otras) ni comparaciones con modelos de referencia.

## Requisitos de hardware

Estimaciones basadas en el numero de parametros (4,54B) y en el tamano del repositorio; no hay mediciones publicadas del modelo:

- Pesos en bf16/fp16: aproximadamente 9,1 GB. Con cache KV y overhead de runtime, se recomienda un minimo de 12 GB de VRAM.
- Cuantizacion INT8: alrededor de 4,5-5 GB de pesos; desplegable en GPUs de 8-12 GB.
- Cuantizacion INT4 (por ejemplo, GGUF Q4_K_M): alrededor de 2,7-3,5 GB; cabe en GPUs de 6-8 GB e incluso en inferencia por CPU.
- GPUs recomendadas: para bf16, RTX 3090, RTX 4080, RTX 4090 (16-24 GB), A10G, L4 o superiores. Para INT4/INT8, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3050 8 GB.
- Cabe en GPU de consumo: si, tanto en bf16 en tarjetas de 16-24 GB como cuantizado en tarjetas de 8 GB o menos.
- Opciones de despliegue: vLLM, TGI, SGLang y llama.cpp/Ollama (estos ultimos requieren conversion previa a GGUF, ya que el repositorio solo publica safetensors).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales de modelos de tamano similar en la misma categoria. Las cifras del resto de modelos proceden de su documentacion publica general y no de una evaluacion conjunta:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| appworld-qwen35-4b-...-sft-epoch1 | 4,54B | No disponible | No disponible | Checkpoint SFT experimental para agentes; sin benchmarks publicados |
| Qwen3-4B (familia base) | 4,0B | 32k nativo (128k con YaRN) | Apache 2.0 | Modelo generalista con soporte de razonamiento; referencia natural del predecesor |
| Llama 3.2 3B | 3,2B | 128k | Licencia comunitaria Llama 3.2 | Modelo generalista pequeno, ampliamente desplegado |
| Gemma 3 4B | 4B | 128k | Licencia Gemma | Modelo generalista con enfoque multimodal en algunas variantes |
| Phi-4-mini | 3,8B | 128k | MIT | Modelo pequeno orientado a razonamiento |

No se dispone de una comparacion de rendimiento cabeza a cabeza entre este modelo y las alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: se desconoce la licencia, los idiomas soportados, el pipeline y las condiciones de uso, lo que impide confirmar si el uso comercial esta permitido.
- Riesgo de alucinacion: inherente a los modelos de 4,5B, especialmente en tareas de agente donde una accion incorrecta puede corromper el estado del entorno.
- Sesgos: no evaluados. Al no haber documentacion, no hay analisis de sesgos demograficos, linguisticos o de dominio.
- Alcance limitado: el nombre sugiere un ajuste muy especifico para el benchmark AppWorld, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Validacion inexistente: 10 descargas y 0 "likes" indican que no ha sido probado ni avalado por la comunidad.
- Contexto e idiomas desconocidos: no se puede garantizar el soporte de contextos largos ni de idiomas distintos del ingles.
- Sin garantias de produccion: es un artefacto de investigacion ("baseline", "epoch1"), no un modelo optimizado ni auditado para despliegue comercial.
- Ausencia de cuantizaciones oficiales: cualquier uso en formatos GGUF o INT4 requiere una conversion externa y puede alterar el comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/appworld-qwen35-4b-baseline-wm-6k-27b-hard-fixed-sft-epoch1
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su paper, repositorio o demo; los unicos enlaces recuperados corresponden a portales de ofertas de practicas ("stage" en frances) sin relacion con el modelo. No hay enlaces adicionales disponibles.
