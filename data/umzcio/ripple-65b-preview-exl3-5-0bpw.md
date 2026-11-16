# umzcio/Ripple-65B-Preview-exl3-5.0bpw

## Resumen

Ripple-65B-Preview-exl3-5.0bpw es una cuantización EXL3 de 5.0 bits por peso del modelo base ricursiveAI/Ripple-65B-Preview, publicada por el usuario umzcio. El objetivo es ofrecer una versión comprimida del modelo original que pueda ejecutarse en hardware con memoria limitada, en concreto en configuraciones de uno a cuatro nodos NVIDIA DGX Spark, manteniendo una fidelidad alta respecto a los pesos en BF16.

La conversión se realizó con ExLlamaV3 1.6.6 sobre la rama `feat/ricursive`, que incorpora el soporte para el mecanismo de value residual propio de Ripple. Se trata de una conversión independiente que replica exactamente los mismos ajustes, commit y configuración que el pack de referencia de ajensenwaud, con idénticas dimensiones de shard, índice, asignación de bits por tensor, config y tokenizer; la única diferencia son los valores cuantizados resultantes.

Aunque el nombre comercial del modelo base indica 65B, los pesos reales en safetensors suman 20.711.145.552 parámetros (aproximadamente 20,7 mil millones), lo que conviene tener en cuenta al planificar el despliegue. El pack ocupa 39 GB repartidos en cinco shards y está pensado para servirse con TensorFold en configuraciones multi-Spark, con soporte de ventana de contexto de hasta 1 millón de tokens según las pruebas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con value residual (soporte `feat/ricursive` en ExLlamaV3); detalles internos del modelo base no disponibles |
| Parametros totales | 20.711.145.552 (20,7 B) segun safetensors del repo |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1.000.000 de tokens en las pruebas de velocidad del autor; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 5.0 bpw, codebook `mul1`, head a 8 bits, embeddings a 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer que incorpora un mecanismo denominado value residual, implementado en ExLlamaV3 mediante la rama `feat/ricursive` del repositorio de auryn-macmillan. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La cuantizacion se genero con ExLlamaV3 1.6.6 en el commit `d71a6644`, usando un codebook `mul1` a 5.0 bits por peso, cabeza de atencion a 8 bits y embeddings a 16 bits. La calibracion empleo 250 filas de 2.048 tokens y el proceso completo tardo 5 horas y 39 minutos en un unico GB10 (DGX Spark). El resultado son 39 GB en cinco shards. El autor indica que este pack es byte-identico al de ajensenwaud salvo en los valores cuantizados, y que la receta usa por defecto el pack de ajensenwaud por medir ligeramente mas cerca de BF16.

## Capacidades

- Generacion de texto autoregresiva con ventana de contexto de hasta 1 millon de tokens en las pruebas realizadas.
- Soporte de tool calling y de flujos de agente de varios pasos, segun los escenarios de velocidad medidos (prompts de "agent tool call").
- Generacion de codigo, evaluada en el escenario "coding" de las pruebas de rendimiento.
- Conversacion multi-turno (escenario "chat").
- Decodificacion especulativa mediante DFlash2, que multiplica el throughput en las pruebas del autor.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Servicio de inferencia en cluster de DGX Spark: el pack esta disenado para servirse con TensorFold en dos o cuatro Sparks en paralelo tensorial (TP=2 o TP=4), lo que permite ejecutar un modelo de 20,7 B en hardware de bajo consumo por nodo.
- Asistente de codigo en produccion: con 1M de tokens de contexto y soporte de tool calling, puede mantener el estado de un repositorio completo y encadenar llamadas a herramientas de build o test.
- Agentes automatizados multi-paso: el escenario "agent tool call" del autor muestra entre 11 y 31 tokens por segundo segun se use DFlash2, suficiente para pipelines de agentes con latencia moderada.
- Chat de atencion al cliente con contexto largo: la ventana de 1M tokens permite arrastrar historiales extensos o documentacion de producto sin truncar.
- Analisis de documentos largos: resumen y extraccion sobre corpus que superan el contexto tipico de modelos de 20 B, aprovechando la ventana extendida.
- Investigacion sobre cuantizacion: el pack incluye `convert-args.json` y `SHA256SUMS`, lo que lo hace util como referencia reproducible para estudios de fidelidad EXL3 frente a BF16.
- Despliegue en entornos con restricciones de memoria: 39 GB en cinco shards permiten cargar el modelo en nodos con menos VRAM que la necesaria para BF16, a costa de una perdida minima de perplexity.

## Benchmarks y rendimiento

Fidelidad frente a BF16, medida con los scripts de evaluacion de ExLlamaV3 en un Spark:

| Metrica | Este pack | Pack de ajensenwaud | BF16 |
|---|---|---|---|
| Perplexity Wikitext-2, 64 x 2.048 | 9,293 | 9,269 | 9,245 |
| Coincidencia con el top token de BF16, 96 x 2.048 | 97,3 % | 97,6 % | referencia |
| Divergencia KL media por token frente a BF16 | 0,0068 | 0,0050 | referencia |

Velocidad en dos Sparks, TP=2, un stream, greedy, respuestas de hasta 512 tokens, ventana de 1M tokens (tokens por segundo):

| Prompt | Este pack | Pack de ajensenwaud | Este pack con DFlash2 | Pack de ajensenwaud con DFlash2 |
|---|---|---|---|---|
| coding | 10,1 | 10,2 | 36,1 | 36,1 |
| agent tool call | 11,0 | 10,9 | 30,7 | 31,6 |
| chat | 9,9 | 10,0 | 15,0 | 15,8 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 39 GB de pesos en cinco shards, mas overhead de cache KV; con ventana de 1M tokens el consumo de cache puede ser muy elevado y exige planificacion cuidadosa.
- GPU recomendadas: NVIDIA DGX Spark (GB10) en configuraciones de uno, dos o cuatro nodos; el autor valida explicitamente dos Sparks con TP=2.
- Cabe en consumer GPU: no de forma holistica; 39 GB superan la VRAM de una RTX 4090 (24 GB). Seria necesario repartir entre varias GPU o usar nodos Spark.
- Opciones de despliegue: ExLlamaV3 (libreria nativa del pack) y el repositorio zrresearch/ripplespark-4dgx con TensorFold para multi-Spark. Otros runners (vLLM, llama.cpp, Ollama, TGI) no estan soportados por el formato EXL3.
- Latencia y throughput: entre 9,9 y 11,0 tokens por segundo sin decodificacion especulativa en dos Sparks, y entre 15,0 y 36,1 tokens por segundo con DFlash2, segun el escenario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| umzcio/Ripple-65B-Preview-exl3-5.0bpw | 20,7 B | hasta 1M en pruebas | EXL3 5.0 bpw | Apache-2.0 | Perplexity 9,293; 39 GB |
| ajensenwaud/Ripple-65B-Preview-exl3-5.0bpw | 20,7 B | hasta 1M en pruebas | EXL3 5.0 bpw | Apache-2.0 | Perplexity 9,269; pack de referencia de la receta |
| ricursiveAI/Ripple-65B-Preview (BF16) | 20,7 B | no disponible | safetensors BF16 | Apache-2.0 | Perplexity 9,245; requiere mucha mas memoria |

## Limitaciones y advertencias

- El nombre "65B" del modelo base no coincide con los 20,7 B reales en safetensors; conviene dimensionar el hardware sobre el dato real.
- Perdida de fidelidad medible frente a BF16: +0,25 % de perplexity y un tercio mas de divergencia KL media que el pack de referencia.
- La ventana de 1M tokens se cita en las pruebas del autor, pero no se confirma como contexto nativo del modelo base; el coste de cache KV a esa longitud puede ser prohibitivo en un solo nodo.
- Solo es cargable en builds de ExLlamaV3 que incluyan el soporte de Ripple (`feat/ricursive`); no funciona en runners genericos.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- El autor no documenta evaluaciones de seguridad ni de calidad en tareas especificas mas alla de perplexity y coincidencia de tokens.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/umzcio/Ripple-65B-Preview-exl3-5.0bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Pack de referencia: https://huggingface.co/ajensenwaud/Ripple-65B-Preview-exl3-5.0bpw
- Repositorio de despliegue: https://github.com/zrresearch/ripplespark-4dgx
- Fork de ExLlamaV3 con soporte de Ripple: https://github.com/auryn-macmillan/exllamav3
- ExLlamaV3 original: https://github.com/turboderp-org/exllamav3
