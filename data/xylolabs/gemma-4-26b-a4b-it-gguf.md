# Xylolabs/gemma-4-26B-A4B-it-GGUF

## Resumen

Xylolabs/gemma-4-26B-A4B-it-GGUF es una coleccion de cuantizaciones GGUF del modelo google/gemma-4-26B-A4B-it, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 25.233.142.046 parametros totales y 4B de parametros activos (segun la nomenclatura A4B del nombre), desarrollado por Google. Esta version GGUF elimina la torre de vision del modelo original, por lo que se orienta exclusivamente a generacion de texto.

La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE de aproximadamente 25B parametros totales en hardware de consumo mediante cuantizaciones que van desde los 26,86 GB del Q8_0 hasta los 17,72 GB del Q4_K_M. El autor incluye mediciones de divergencia KL y acuerdo top-1 frente a la version BF16 de llama.cpp, lo que facilita evaluar el coste de precision de cada cuantizacion antes de desplegarla.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos de Hugging Face; los detalles sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base no se han publicado en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun nomenclatura A4B del modelo base; detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4B (segun nomenclatura A4B); no confirmado en la informacion disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (las pruebas de precision usan conversaciones en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B-it es un modelo de lenguaje de tipo Mixture of Experts, tal como indica la nomenclatura A4B del nombre (4B de parametros activos sobre un total de 25.233.142.046). La model card de esta cuantizacion no proporciona detalles sobre el numero de expertos, la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica especifica (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

La aportacion tecnica de esta publicacion es la cuantizacion GGUF para llama.cpp. El autor indica que se ha eliminado la torre de vision del modelo original, de modo que los pesos resultantes solo cubren el componente de texto. Se han publicado cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M) y se recomienda usar llama.cpp en el commit `caea914e9d05153aa32b96a846dca543e7cb16be` o posterior. La model card incluye mediciones de divergencia KL y acuerdo top-1 frente a la version BF16 de llama.cpp sobre texto de plantilla de chat (4 conversaciones en ingles y 4 en coreano, 8 x 511 tokens evaluados).

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, y la model card lo prueba con conversaciones multi-turno en plantilla de chat.
- Razonamiento y respuesta a preguntas: la model card incluye una "7-question answer check" que todas las cuantizaciones superan (7/7), lo que sugiere capacidad de responder preguntas de forma correcta.
- Capacidades multilingues: las pruebas de precision incluyen conversaciones en ingles y coreano; el resto de idiomas no esta documentado.
- Sin soporte de vision: la cuantizacion elimina explicitamente la torre de vision del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (17,72 GB) el modelo puede ejecutarse en llama.cpp sobre GPU consumer de gama alta o en CPU con suficiente RAM, lo que permite disponer de un MoE de 25B parametros sin infraestructura de servidor.
- Prototipado de asistentes conversacionales: la plantilla de chat y el flag `--jinja` de llama.cpp permiten montar un servidor compatible con la API de chat de forma inmediata mediante `llama-server`.
- Evaluacion de cuantizaciones en pipelines de ML: las tablas de KL y top-1 publicadas permiten elegir el punto de equilibrio entre tamano y fidelidad; por ejemplo, Q6_K (23,17 GB) mantiene un top-1 del 97,06% con una reduccion de tamano del 54% frente a BF16 (50,51 GB).
- Generacion de texto en ingles y coreano: las pruebas de precision cubren ambos idiomas, por lo que es adecuado para aplicaciones en esos mercados, siempre que se validen otros idiomas por separado.
- Servicio de inferencia en CPU: al ser GGUF y compatible con llama.cpp, puede desplegarse en servidores sin GPU para cargas de baja concurrencia, usando la cuantizacion Q4_K_M o Q5_K_M.
- Integracion en herramientas de escritorio: el formato GGUF y el soporte de Metal permiten incorporar el modelo en aplicaciones macOS nativas mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL | Top-1 | Answer check |
|---|---:|---:|---:|---:|
| BF16 | 50,51 GB | - | - | 7/7 |
| Q8_0 | 26,86 GB | 0,007752 | 96,99% | 7/7 |
| Q6_K | 23,17 GB | 0,008201 | 97,06% | 7/7 |
| Q5_K_M | 19,88 GB | 0,012776 | 96,67% | 7/7 |
| Q4_K_M | 17,72 GB | 0,020625 | 95,57% | 7/7 |

El autor advierte que, sobre texto crudo (WikiText-2), la divergencia KL es mucho mayor en todas las pila de cuantizacion, incluido el Q8_0 de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto. Q8_0 requiere unos 27 GB, Q6_K unos 23 GB, Q5_K_M unos 20 GB y Q4_K_M unos 18 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q6_K, Q5_K_M y Q4_K_M; GPU con 16-20 GB para Q4_K_M con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con Q6_K, Q5_K_M o Q4_K_M; en GPUs de 16 GB solo con cuantizaciones mas agresivas no publicadas en este repo.
- Opciones de despliegue: llama.cpp (recomendado, commit `caea914e9d05153aa32b96a846dca543e7cb16be` o posterior), llama-server con `--jinja -ngl 99`; compatible con CUDA, Metal y CPU. Otras herramientas (Ollama, vLLM, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-it-GGUF | 25,2B totales / 4B activos | no disponible | Apache 2.0 | GGUF | Sin torre de vision; 4 cuantizaciones |
| google/gemma-4-26B-A4B-it | 25,2B totales / 4B activos | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base original, incluye vision |
| Unsloth (cuantizaciones del mismo base) | 25,2B totales / 4B activos | no disponible | Apache 2.0 | GGUF | Referenciado en las tablas de la model card con cuantizaciones UD |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de capacidad de vision: la cuantizacion elimina la torre de vision del modelo base, por lo que no puede procesar imagenes.
- Divergencia en texto crudo: el autor advierte que la KL sobre texto crudo (WikiText-2) es mucho mayor que sobre plantilla de chat, incluso en Q8_0; el modelo puede degradarse en tareas de continuacion de texto libre.
- Idiomas no documentados: solo se han validado ingles y coreano; el rendimiento en castellano y otros idiomas no esta verificado.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje; debe validarse en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse los ficheros `LICENSE` y `NOTICE` del repositorio.
- Version de llama.cpp: se requiere un commit concreto o posterior; versiones antiguas pueden no cargar correctamente el modelo.
- Repositorio sin descargas ni likes: publicado el 2026-11-27, sin validacion de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de llama.cpp recomendado: `caea914e9d05153aa32b96a846dca543e7cb16be`
