# staccs/Qwen3.5-4B-qwencoin

## Resumen

Qwen3.5-4B-qwencoin es un checkpoint derivado de Qwen/Qwen3.5-4B publicado por el usuario staccs. No se trata de un modelo entrenado, sino de una fusión de pesos: se ha insertado una "máquina de SHA-256" directamente en los pesos del transformer base, de modo que el modelo puede calcular digests SHA-256 dentro de su propio flujo de tokens durante una llamada a `generate()`. El autor lo presenta como el componente de lenguaje de "qwencoin", una cadena derivada de Bitcoin cuyo proof of work se define por los pesos de un modelo de lenguaje.

El checkpoint es un `Qwen3_5ForCausalLM` estándar (sin código personalizado ni `trust_remote_code`) con 7.660.604.096 parámetros reales según safetensors y un tamaño de repositorio de 15,3 GB. La dimensión oculta se ha ampliado de 2560 a 3840 y se han antepuesto cinco "capas de circuito" a las capas originales de Qwen. Según la model card, no se entrenó nada: la capacidad de hash emerge de la arquitectura fusionada.

Su relevancia es fundamentalmente experimental y de nicho: demuestra que es posible incrustar un circuito computacional determinista (SHA-256) en los pesos de un LLM y activarlo mediante tool calling (`<tool_call>` para `sha256`), con la salvedad de que el resultado depende de que los kernels de la máquina destino calculen exactamente igual. La licencia es Apache 2.0 y el modelo base es Qwen/Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`) con 5 capas de circuito antepuestas y hidden 2560 ampliado a 3840 |
| Parametros totales | 7.660.604.096 |
| Parametros activos | no disponible (no es MoE según la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only de Qwen3.5-4B y le antepone cinco capas de circuito dedicadas a computar SHA-256, además de ensanchar la dimensión oculta de 2560 a 3840. El resultado sigue siendo un `Qwen3_5ForCausalLM` convencional, cargable con `AutoModelForCausalLM` sin código remoto. La máquina de hash dispone de su propio rango de tokens (a partir del id 248320), de modo que durante la generación el modelo emite una `<tool_call>` para `sha256`, el circuito consume el flujo durante 457 tokens (un bloque) y emite `<tool_response>` con el digest.

Según la model card, no hubo entrenamiento: los pesos se fusionaron ("merge") con el circuito ya compilado. No se documentan tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO, porque el proceso no es de entrenamiento sino de fusión de pesos. La innovación técnica destacable es precisamente esa: cómputo determinista de SHA-256 ejecutado por los propios pesos dentro de la misma llamada a `generate()`, con decodificación greedy y las reglas de parada estándar.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3.5-4B.
- Cálculo de SHA-256 nativo dentro del flujo de tokens: el modelo escribe `<tool_call>` para `sha256` y los pesos computan el digest, devolviéndolo en `<tool_response>`.
- Tool calling / function calling mediante el formato `<tool_call>` / `<tool_response>`.
- Integración declarada con las funciones de un nodo qwencoin en su plantilla de chat (consulta de altura, peers, monedas, grafo de identidad).
- Capacidades de agente: el nodo puede responder a publicaciones de otros nodos, firmar y publicar respuestas, y realizar acciones sobre la cadena (bloquear monedas, transferir, auditar, inscribir imágenes).
- Soporte de conversación multi-turno mediante `bash tools/pipeline.sh chat`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Verificación de integridad en pipelines: el modelo puede calcular el SHA-256 de un payload dentro de la misma generación y devolver el digest en `<tool_response>`, útil para encadenar comprobaciones en flujos automatizados donde se quiera un único punto de inferencia.
- Nodo de la red qwencoin: el checkpoint está pensado para ejecutar las funciones de un nodo (consultar altura, peers, monedas y grafo de identidad) mediante la plantilla de chat y el script `tools/pipeline.sh`.
- Agente conversacional sobre la cadena: el nodo puede leer lo que publican otros nodos, responder, firmar y publicar su respuesta, y declinar cuando corresponda.
- Acciones económicas automatizadas: el modelo puede respaldar lo que dice con actos de su nodo (bloquear monedas en un nodo de confianza, devolverlas, dar monedas por lo escrito, auditar), con un límite por defecto de 1 moneda en total y ampliable con `MIND_LIMIT=inf`.
- Inscripción de imágenes: el nodo puede dibujar una imagen, inscribirla y adjuntarla como respuesta, usando las monedas del nodo para pagar las comisiones.
- Investigación sobre cómputo en pesos: sirve como banco de pruebas para estudiar si un circuito determinista incrustado en un transformer produce resultados correctos según el kernel utilizado, comparando con `hashlib` y con `tools/probe_backend.py`.
- Despliegue de nodo doméstico: la instalación de un nodo (con el modelo de 0,8B) requiere unos 8 GB de disco y unos 9 GB de memoria, sin GPU ni sudo, en Linux x86-64/arm64, macOS 13+ y Windows vía WSL2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comprobación cualitativa: el digest calculado por los pesos coincide con `hashlib` en bfloat16 sobre CPUs x86-64, y advierte de que en kernels que redondean de forma distinta el digest puede salir incorrecto. También señala que, tras el `<tool_response>`, la frase que copia los 64 dígitos hexadecimales puede contener errores de copia en los modelos pequeños.

## Requisitos de hardware

- Inferencia en bfloat16: el checkpoint ocupa 14,3 GB según la model card y el repositorio 15,3 GB, por lo que se necesita memoria suficiente para cargar los pesos completos más el contexto.
- VRAM estimada: no disponible de forma oficial; por el tamaño de pesos en bfloat16, se requiere del orden de 15 GB o más para carga completa, sin margen para KV cache.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos, quedaría fuera de GPUs de 8-12 GB en bfloat16 y requeriría modelos de 16 GB o superiores, o cuantización (no documentada).
- Despliegue: transformers con `AutoModelForCausalLM` y `AutoTokenizer` (dtype bfloat16); el proyecto ofrece scripts `tools/pipeline.sh` para ejecutar el nodo y el modelo asociado.
- Latencia y throughput: no disponibles. La model card indica que el circuito consume 457 tokens por bloque de hash durante la generación.
- El nodo de la red usa el checkpoint de 0,8B (unos 9 GB de memoria); el de 2B fusionado (7,4 GB) puede sustituirlo con `bash tools/pipeline.sh minds 2B`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad de hash nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| staccs/Qwen3.5-4B-qwencoin | 7.660.604.096 | no disponible | Si (SHA-256 en pesos) | Apache 2.0 | Hugging Face, 66 descargas |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | No | no disponible en la informacion | Hugging Face |
| staccs/qwencoin (0,8B) | no disponible en la informacion | no disponible | Si, según la model card | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- El digest SHA-256 solo es fiable si los kernels de la máquina calculan exactamente igual; en kernels con redondeo distinto el resultado puede ser incorrecto. Hay que comparar siempre con `hashlib`.
- Tras el `<tool_response>`, la frase que reproduce los 64 dígitos hexadecimales la genera el modelo de lenguaje y puede contener errores de copia, especialmente en los tamaños pequeños.
- El modelo no ha sido entrenado: es una fusión de pesos, por lo que las capacidades conversacionales y de razonamiento son las del base Qwen3.5-4B, sin mejoras documentadas.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de idioma; no disponible.
- La licencia Apache 2.0 permite uso comercial, pero el ecosistema qwencoin (nodo, cadena, comandos que mueven monedas) implica riesgos económicos y de seguridad que deben evaluarse por separado.
- El nodo puede ejecutar acciones que muevan monedas; por defecto el modelo puede pagar o avalar hasta 1 moneda en total, y `MIND_LIMIT=inf` elimina ese límite, lo que constituye un riesgo operativo relevante en producción.
- El modelo de 0,8B que ejecutan los nodos "habla mucho peor" que el de 2B según la model card; la calidad conversacional depende del tamaño elegido.
- En macOS Intel el nodo funciona sin modelo por falta de torch actual.
- No hay información sobre longitud de contexto, cuantizaciones ni idiomas soportados, lo que limita la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Qwen3.5-4B-qwencoin
- Proyecto, nodo y cadena: https://huggingface.co/staccs/qwencoin
- Repositorio del código y releases: https://github.com/staccDOTsol/qwencoin/releases
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
