# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF es una distribucion cuantizada en formato GGUF del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por Xylolabs. El modelo original es un transformer de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, con 32.913.266.240 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). Esta version GGUF esta pensada para ejecutarse en llama.cpp sobre CUDA, Metal o CPU, lo que permite desplegar el modelo en hardware de consumo y estaciones de trabajo sin necesidad de GPUs de centro de datos.

La relevancia de esta publicacion es practica: el repositorio incluye un unico fichero Q4_K_M de 25,431 GB, acompanado de una tabla comparativa de precision (divergencia KL y acuerdo top-1 frente a BF16) que situa esta cuantizacion concreta en un KL de 0,027021 en WikiText-2 y un top-1 del 93,069%. Ademas, la model card proporciona una guia de asignacion de fichero y contexto segun el hardware, desde una RTX 4090 de 24 GB hasta una B300 de 288 GB, lo que facilita la planificacion de despliegues.

El modelo esta etiquetado para generacion de texto conversacional y declara soporte de los idiomas ingles y coreano. La licencia es OpenMDW-1.1, heredada del modelo base. La informacion disponible no incluye detalles sobre la receta de entrenamiento, la composicion del dataset ni resultados de benchmarks de capacidad, por lo que esta ficha se limita a los datos tecnicos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); la model card etiqueta el modelo con el tag `mamba2`, sin detalle adicional en la informacion disponible |
| Parametros totales | 32.913.266.240 (32,9 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones (sufijo A3B del nombre); cifra exacta no disponible |
| Longitud de contexto | Hasta 256K segun la tabla de hardware de la model card (dependiente de memoria); el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo); la tabla de precision referencia tambien Q8_0, Q6_K, Q5_K_M, Q3_K_M y variantes Unsloth UD-* y MXFP4_MOE |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una arquitectura de mezcla de expertos con 32,9 mil millones de parametros totales y unos 3.000 millones activos por token, lo que explica su eficiencia computacional relativa: solo una fraccion de los pesos se activa en cada paso de inferencia. La model card del repositorio GGUF incluye la etiqueta `mamba2`, lo que sugiere componentes de espacio de estados hibridos, pero no se proporciona detalle sobre la proporcion de capas de atencion frente a capas Mamba-2 ni sobre el numero de expertos o la estrategia de enrutamiento. Tampoco se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El trabajo realizado por Xylolabs consiste en la conversion de los pesos BF16 a GGUF y su cuantizacion, verificada con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp. La model card aporta una evaluacion de fidelidad de la cuantizacion frente al modelo BF16, medida como divergencia KL sobre WikiText-2 y sobre un conjunto held-out, junto con el acuerdo top-1. Para el fichero Q4_K_M publicado, los valores son 0,027021 de KL y 93,069% de top-1 en WikiText-2, y 0,030130 de KL y 92,814% de top-1 en held-out. La tabla muestra que las cuantizaciones Unsloth UD-* logran mejor fidelidad a tamanos comparables (por ejemplo, UD-Q4_K_M con 25,266 GB alcanza 0,007124 de KL y 96,583% de top-1), lo que es un dato relevante para quien priorice precision sobre compatibilidad estandar.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y generacion de codigo: capacidad esperable en un modelo de esta familia, aunque no se documentan evaluaciones especificas en la informacion disponible.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp, necesario para el formato conversacional del modelo.
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del repositorio.
- Ejecucion en CPU, CUDA y Metal a traves de llama.cpp, con offload de expertos a RAM del sistema (`--n-cpu-moe`).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking, vision ni audio.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con `llama-server` en una estacion de trabajo con una sola GPU de 24 GB o mas, gestionando conversaciones multi-turno con contexto de hasta 32K en una RTX 4090 mediante offload de expertos a RAM.
- Procesamiento de documentos largos en local: con hasta 256K de contexto en configuraciones de 48 GB o superiores (RTX 6000 Ada, H100, Mac Studio), es adecuado para resumir o extraer informacion de expedientes extensos sin enviar datos a la nube.
- Despliegue en hardware Apple Silicon: la guia de la model card confirma funcionamiento en Mac Studio M5 Max y M5 Ultra con memoria unificada de 128 a 512 GB, lo que permite usar el modelo en entornos de desarrollo sin GPU dedicada NVIDIA.
- Prototipado y evaluacion de agentes: al ser un MoE con solo unos 3.000 millones de parametros activos, ofrece latencia menor que un modelo denso de 32,9 mil millones, lo que lo hace util para iterar rapidamente sobre pipelines de generacion en llama.cpp.
- Servicio en edge o en DGX Spark: la tabla de hardware incluye DGX Spark con 128 GB de memoria unificada, un escenario realista para inferencia en el puesto de trabajo o en laboratorio.
- Traduccion y atencion al cliente en ingles y coreano: los dos idiomas declarados cubren mercados concretos (por ejemplo, soporte tecnico para usuarios coreanos) con un modelo desplegado on-premise.
- Base para ajuste fino o experimentacion: el formato GGUF y la licencia OpenMDW-1.1 permiten estudiar el comportamiento del modelo en entornos de investigacion, aunque el ajuste fino requiere volver a los pesos BF16 del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion numerica es la fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Unsloth UD-Q8_K_XL | 38,615 GB | 0,003932 | 97,515% | 0,007048 | 96,716% |
| llama.cpp Q8_0 | 35,005 GB | 0,003920 | 97,446% | 0,007593 | 96,696% |
| llama.cpp Q6_K | 34,921 GB | 0,005579 | 96,897% | 0,010294 | 95,892% |
| Unsloth UD-Q5_K_XL | 30,415 GB | 0,005101 | 97,088% | 0,008913 | 96,314% |
| llama.cpp Q5_K_M | 27,041 GB | 0,016107 | 94,294% | 0,017610 | 94,559% |
| Unsloth UD-Q4_K_XL | 25,506 GB | 0,007113 | 96,495% | 0,009747 | 96,137% |
| Q4_K_M (este repo) | 25,431 GB | 0,027021 | 93,069% | 0,030130 | 92,814% |
| Unsloth UD-Q4_K_M | 25,266 GB | 0,007124 | 96,583% | 0,011387 | 95,500% |
| llama.cpp Q3_K_M | 20,680 GB | 0,094099 | 87,284% | 0,089481 | 87,137% |
| Unsloth UD-IQ2_M | 19,432 GB | 0,018414 | 93,926% | 0,023938 | 93,147% |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 25,431 GB en disco; en una RTX 4090 o RTX 3090 de 24 GB no cabe completo y requiere offload de expertos a RAM del sistema (`llama-server -m FILE --n-cpu-moe 52`), con contexto de 32K.
- GPU recomendadas segun la model card: RTX 5090 (32 GB) para contexto de 128K; RTX 6000 Ada o 2 x 24 GB (48 GB) para 256K; H100 (80 GB), RTX PRO 6000 Blackwell (96 GB) y H200 (141 GB) para 256K.
- Cabe en consumer GPU: si, en RTX 4090/3090 mediante offload parcial y en RTX 5090 de forma completa para el fichero Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), compilado con `-DGGML_CUDA=ON` para NVIDIA; soporte de Metal y CPU. No se documentan en la informacion disponible otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (este GGUF, Xylolabs) | 32,9B / ~3B | Hasta 256K segun memoria | OpenMDW-1.1 | GGUF Q4_K_M | Hugging Face, 500 descargas |
| Nemotron-3.5-Lightning-30B-A3B-BF16 (NVIDIA) | 32,9B / ~3B | No disponible en esta informacion | OpenMDW-1.1 | BF16 (safetensors) | Hugging Face (modelo base) |
| Cuantizaciones Unsloth UD-* del mismo modelo | 32,9B / ~3B | No disponible | OpenMDW-1.1 | GGUF (UD-Q8 a UD-IQ2) | Hugging Face; mejor fidelidad KL a igual tamano |

No se dispone en la informacion proporcionada de datos de benchmarks de capacidad que permitan comparar el rendimiento del modelo frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M de este repositorio presenta una fidelidad notablemente inferior a las variantes Unsloth UD-* de tamano similar (KL 0,027021 frente a 0,007124 en UD-Q4_K_M), por lo que puede degradar la calidad en tareas sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas de mitigacion en la informacion disponible.
- Cobertura idiomatica limitada a ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card remite al fichero LICENSE del repositorio y a la model card original de NVIDIA.
- La etiqueta `mamba2` sugiere una arquitectura hibrida, pero la informacion disponible no detalla la configuracion exacta, lo que dificulta predecir el comportamiento en contextos muy largos.
- El contexto maximo de 256K depende del hardware y de la configuracion de llama.cpp; en GPUs de 24 GB el contexto practico se reduce a 32K.
- El repositorio tiene 500 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.
- No se documentan sesgos conocidos ni resultados de evaluacion de seguridad en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF/blob/main/LICENSE
- llama.cpp (commit verificado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
