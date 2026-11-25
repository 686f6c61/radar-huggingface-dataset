# Xylolabs/Qwen3.5-4B-Base-GGUF

## Resumen

Xylolabs/Qwen3.5-4B-Base-GGUF es una cuantizacion en formato GGUF del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs para su uso con llama.cpp y otros runners compatibles. El modelo original procede de la familia Qwen3.5 de Alibaba Qwen y cuenta con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones). Esta distribucion concreta incluye un unico fichero, `Qwen3.5-4B-Base-Q4_K_M.gguf`, de 2,783 GB, pensado para inferencia de texto en hardware de consumo y estaciones de trabajo.

Se trata de un modelo base, no ajustado por instrucciones ni alineado con RLHF, por lo que su uso natural es la continuacion de texto y el preentrenamiento o fine-tuning posterior, no el dialogo conversacional directo. El repositorio declara soporte de ingles y coreano, licencia Apache 2.0 y compatibilidad con endpoints. La relevancia actual radica en que permite desplegar un modelo de 4B con hasta 256K de contexto en una unica GPU de 24 GB o incluso en equipos con memoria unificada, manteniendo una fidelidad de cuantizacion documentada frente a BF16.

El autor publica tablas de accuracy comparando su Q4_K_M con las cuantizaciones nativas de llama.cpp (Q8_0, Q6_K, Q5_K_M, Q3_K_M), lo que facilita la decision de que fichero usar segun el compromiso entre tamano y perdida de calidad. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5; detalles de atencion no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens (segun tabla de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (fichero publicado); el autor compara Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M de llama.cpp |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Qwen3.5-4B-Base mas alla de que es un transformer decoder-only de tipo base. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion (si usa atencion lineal, GQA o similar), ni la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF o DPO. Al ser un modelo base, se asume que no ha pasado por alineamiento por instrucciones, pero este extremo no se confirma en la model card.

La aportacion tecnica de este repositorio es la conversion a GGUF y la cuantizacion a Q4_K_M, verificada con la build de llama.cpp `cd959bae`. El autor documenta la fidelidad de la cuantizacion frente a BF16 mediante divergencia KL y top-1 accuracy sobre WikiText-2 y un conjunto held-out, lo que constituye el principal dato tecnico verificable de esta ficha.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prefijos (el ejemplo oficial usa `llama-completion` con `-no-cnv`).
- Modelo base: no esta ajustado para seguir instrucciones ni para formato conversacional nativo.
- Capacidades multilingues limitadas a ingles y coreano segun la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo thinking.
- Compatible con endpoints (tag `endpoints_compatible`).
- Apto como punto de partida para fine-tuning y preentrenamiento adicional.

## Casos de uso

- Continuacion de texto y autocompletado de documentos largos: el modelo puede procesar prefijos de hasta 256K tokens, lo que permite mantener coherencia en la generacion sobre contratos, informes o articulos extensos sin truncar el contexto.
- Fine-tuning especifico de dominio: al ser un modelo base de 4,3B con licencia Apache 2.0, es un candidato adecuado para ajuste supervisado en tareas como clasificacion, extraccion de entidades o generacion de resumentes tecnicos, partiendo de los pesos GGUF o de los pesos originales.
- Generacion de codigo asistida por continuacion: util en editores que completan fragmentos a partir del contexto previo, aunque sin garantias de seguir instrucciones al no estar alineado.
- Procesamiento de texto en coreano e ingles: util para pipelines bilingues de generacion y normalizacion de contenido en esos dos idiomas.
- Despliegue en hardware de consumo: con 2,8 GB en Q4_K_M cabe en GPUs de 8-12 GB y en equipos con memoria unificada, lo que permite prototipado local de bajo coste.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir grandes volumenes de texto en dominios acotados para aumentar datasets de ajuste de modelos mayores.
- Investigacion sobre cuantizacion: el repositorio incluye tablas de KL y top-1 que sirven como referencia para estudiar la degradacion por cuantizacion en modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad de cuantizacion frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 4,611 GB | 0,000581 | 98,632% | 0,000711 | 98,608% |
| llama.cpp Q6_K | 3,563 GB | 0,002520 | 97,377% | 0,003082 | 96,931% |
| llama.cpp Q5_K_M | 3,161 GB | 0,006444 | 95,794% | 0,007754 | 95,294% |
| Q4_K_M (este repo) | 2,783 GB | 0,022297 | 92,902% | 0,027617 | 91,804% |
| llama.cpp Q4_K_M | 2,783 GB | 0,022297 | 92,902% | 0,027617 | 91,804% |
| llama.cpp Q3_K_M | 2,319 GB | 0,079100 | 86,569% | 0,103345 | 84,578% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB para los pesos en Q4_K_M, mas la cache KV en f16 y unos 2 GB de overhead del runtime. El autor recomienda que el fichero, la cache KV a la longitud de contexto deseada y 2 GB de runtime queden por debajo del 90% de la memoria disponible.
- GPU recomendadas segun el autor: RTX 4090 y RTX 3090 (24 GB) con contexto de 256K; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: si, el fichero Q4_K_M de 2,8 GB permite contextos largos en tarjetas de 24 GB y contextos mas cortos en GPUs de 8-12 GB (no documentado por el autor, estimacion a partir del tamano del fichero).
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB) segun la tabla del autor, todos con contexto de 256K.
- Opciones de despliegue: llama.cpp (build `cd959bae` o posterior). No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas que permitan una comparativa rigurosa con otros modelos. A continuacion se comparan unicamente los atributos estructurales documentados:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-GGUF (este) | 4,33B | hasta 256K | Apache 2.0 | GGUF Q4_K_M | Hugging Face |
| Qwen/Qwen3.5-4B-Base (original) | 4,33B | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable y puede producir contenido inapropiado o incoherente en formato conversacional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de factualidad.
- Sesgos conocidos: no documentados en la model card.
- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Contexto: aunque el autor indica 256K, la calidad en contextos muy largos no esta evaluada en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y citar la release original segun indica el autor.
- Cuantizacion: Q4_K_M presenta una perdida medible frente a BF16 (KL de 0,022 en WikiText-2, top-1 de 92,9%); para tareas sensibles a la fidelidad puede ser preferible Q5_K_M o Q6_K.
- Fichero unico: el repositorio solo publica Q4_K_M, lo que limita la eleccion de compromiso tamano/calidad dentro de este repo.
- Dependencia de llama.cpp: requiere una build concreta o posterior (`cd959bae`); otras herramientas pueden no ser compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Build de llama.cpp referenciada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF/blob/main/LICENSE
- Grafico de KL medio: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF/resolve/main/accuracy-mean-kl.png
- Grafico de top-1: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF/resolve/main/accuracy-top1.png
