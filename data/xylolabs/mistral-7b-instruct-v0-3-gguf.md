# Xylolabs/Mistral-7B-Instruct-v0.3-GGUF

## Resumen

Xylolabs/Mistral-7B-Instruct-v0.3-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. No se trata de un modelo nuevo ni de un ajuste fino: es una conversion y cuantizacion del checkpoint original de Mistral AI, que conserva la arquitectura, el tokenizador y la plantilla de chat del modelo base. El modelo original es un transformer decoder-only denso de 7.248.023.552 parametros (aproximadamente 7,25 mil millones), entrenado por Mistral AI y publicado bajo licencia Apache 2.0.

La relevancia de esta publicacion es practica: ofrece cuatro variantes de cuantizacion (Q5_K_M, Q4_K_M, IQ4_XS e IQ4_XS con importance matrix) con metricas de degradacion medibles frente a una pasada de referencia en BF16, lo que permite elegir el fichero en funcion del compromiso entre tamano y fidelidad. El repositorio ocupa 17,4 GB en total e incluye una tabla de recomendaciones de hardware que cubre desde una RTX 3090 hasta una B300, asi como instrucciones de ejecucion con una revision concreta de llama.cpp.

El modelo base incorpora una ventana de contexto de 32.768 tokens (ampliada respecto a versiones anteriores de la familia) y soporta conversacion multi-turno mediante su plantilla de chat. Esta distribuicion GGUF esta pensada para desarrolladores que necesitan desplegar el modelo en local o en infraestructura propia sin dependencias de frameworks de inferencia pesados, manteniendo la compatibilidad con el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Mistral 7B Instruct v0.3) |
| Parametros totales | 7.248.023.552 (7,25 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun la tabla de hardware de la model card); las instrucciones de ejemplo usan `-c 8192` |
| Tipos de cuantizacion | Q5_K_M (5,14 GB), Q4_K_M (4,37 GB), IQ4_XS (3,95 GB), IQ4_XS-imat (3,91 GB) |
| Idiomas soportados | en, ko (segun los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizador y plantilla de chat incluidos) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Mistral 7B, en su version Instruct v0.3. Esta distribucion no aporta cambios arquitectonicos: reproduce el modelo base y lo serializa en GGUF, el formato binario de llama.cpp que empaqueta pesos, metadatos, tokenizador y plantilla de chat en un unico fichero. La cuantizacion se aplica sobre los pesos originales; las variantes IQ4_XS usan cuantizacion con importance matrix (marcadas con el sufijo `-imat` en el nombre de fichero), una tecnica que pondera la perdida de precision segun la importancia de cada peso para reducir el error respecto al modelo en BF16.

La model card no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos deben consultarse en la documentacion de mistralai/Mistral-7B-Instruct-v0.3. Lo que si aporta esta publicacion son metricas de fidelidad de la cuantizacion: frente a una pasada de referencia en BF16 ejecutada en transformers, sobre 16.288 posiciones de texto en ingles y coreano, Q5_K_M presenta un KL medio de 0,0079 y un 95,84 % de coincidencia en top-1; Q4_K_M, 0,0224 y 93,39 %; IQ4_XS, 0,0291 y 92,14 %; e IQ4_XS-imat, 0,0226 y 93,22 %. El uso de importance matrix en IQ4_XS reduce el KL medio de 0,0291 a 0,0226 manteniendo un tamano practicamente identico (3,91 frente a 3,95 GB).

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el fichero GGUF.
- Razonamiento general y respuesta a instrucciones, heredados del ajuste Instruct v0.3 del modelo base.
- Generacion de codigo y tareas de transformacion de texto, dentro de las capacidades del modelo base de 7B.
- Soporte multilingue limitado a los idiomas declarados en el repositorio: ingles y coreano.
- Ejecucion en llama.cpp mediante `llama-cli` y `llama-server`, con soporte de GPU (CUDA), Metal y CPU.
- Compatibilidad con la flag `--jinja` de llama.cpp para aplicar la plantilla de chat del modelo.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Despliegue local en estaciones de trabajo: con el fichero Q4_K_M (4,37 GB) el modelo cabe holgadamente en una GPU consumer de 24 GB y permite trabajar con contexto largo, lo que lo hace adecuado para prototipado offline sin coste de API.
- Asistente conversacional autoalojado: `llama-server` expone una API compatible con el ecosistema de endpoints, de modo que puede integrarse como backend de un chatbot interno sobre infraestructura propia.
- Procesamiento de texto en ingles y coreano: el repositorio declara ambos idiomas y las metricas de cuantizacion se calcularon sobre texto en esas dos lenguas, por lo que es una opcion razonable para pipelines bilingues en ese par.
- Generacion y revision de codigo en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen de la maquina, lo que encaja en flujos de trabajo con codigo propietario.
- Tareas de resumen y reescritura sobre documentos de hasta 32K tokens: la ventana de contexto del modelo base permite procesar documentos largos en una sola pasada si la VRAM disponible lo permite.
- Evaluacion y experimentacion con cuantizaciones: las cuatro variantes publicadas, con sus metricas KL y top-1, permiten medir el impacto de la cuantizacion en una tarea concreta antes de fijar una configuracion de produccion.
- Base para ajuste fino o destilacion en equipos con recursos limitados: al ser un modelo de 7B con licencia Apache 2.0, sirve como punto de partida para experimentos que luego se pueden reempaquetar en GGUF.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para esta distribucion. Lo que si incluye son metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL medio vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q5_K_M | 5,14 GB | 0,0079 | 95,84 % |
| Q4_K_M | 4,37 GB | 0,0224 | 93,39 % |
| IQ4_XS | 3,95 GB | 0,0291 | 92,14 % |
| IQ4_XS-imat | 3,91 GB | 0,0226 | 93,22 % |

Las metricas se calcularon sobre 16.288 posiciones de texto en ingles y coreano, tomando como referencia una pasada en BF16 ejecutada en transformers. No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,91 GB (IQ4_XS-imat) y 5,14 GB (Q5_K_M) solo para los pesos; hay que anadir el espacio para la cache KV, que crece con la longitud de contexto.
- La model card recomienda Q5_K_M para todos los perfiles de hardware listados, desde una RTX 4090 o RTX 3090 (24 GB) hasta una B300 (288 GB), pasando por RTX 5090 (32 GB), RTX 6000 Ada (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB), DGX Spark (128 GB unificada) y Mac Studio M5 Max y M5 Ultra (128, 256 y 512 GB unificados).
- Cabe en GPU consumer: si, en cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/IQ4 con contexto moderado; la tabla del autor asume 24 GB o mas para trabajar con contexto de 32K.
- Opciones de despliegue: llama.cpp, con los binarios `llama-cli` y `llama-server`; se requiere la revision `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. Para NVIDIA hay que compilar con `-DGGML_CUDA=ON`.
- Ejemplo de ejecucion indicado por el autor: `./build/bin/llama-cli -m Mistral-7B-Instruct-v0.3-Q5_K_M.gguf --jinja -c 8192 -ngl 99`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Mistral-7B-Instruct-v0.3-GGUF | 7,25 mil millones | 32.768 tokens | Apache 2.0 | GGUF (4 cuantizaciones) | Distribucion cuantizada con metricas KL y tabla de hardware |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | safetensors | Modelo base original; requiere conversion a GGUF para llama.cpp |
| Otras distribuciones GGUF de Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | GGUF | No se dispone de datos comparativos de cuantizaciones en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks de capacidad) entre esta distribucion y alternativas en la informacion disponible.

## Limitaciones y advertencias

- Alucinacion: como cualquier modelo de 7B, puede generar contenido plausible pero incorrecto; no se han publicado evaluaciones de factualidad para esta distribucion.
- Idiomas: el repositorio declara solo ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ejemplo de ejecucion de la model card usa `-c 8192`; usar el contexto completo exige mas memoria para la cache KV y puede degradar la calidad en posiciones lejanas.
- Cuantizacion: las variantes Q4 e IQ4 pierden fidelidad respecto a BF16 (hasta un 7,86 % de discrepancia en top-1 con IQ4_XS); para tareas sensibles a la precision conviene usar Q5_K_M o el modelo original.
- Capacidades no documentadas: no hay evidencia en la informacion disponible de soporte de tool calling, agentes, vision ni modo de razonamiento extendido; no deberian asumirse en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y citarse el modelo original segun indique su model card.
- Fecha de publicacion: el repositorio figura creado el 2026-11-14 y actualizado el 2026-11-25; conviene verificar la vigencia de la revision de llama.cpp recomendada antes de desplegar.
- Trazabilidad: las metricas KL y top-1 son del autor de la distribucion y no han sido verificadas de forma independiente en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF/blob/main/LICENSE
- llama.cpp (revision recomendada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
