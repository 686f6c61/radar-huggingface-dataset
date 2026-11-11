# tomvaillant/qwen3.5-9b-spotlight-r3-GGUF

## Resumen

qwen3.5-9b-spotlight-r3-GGUF es una distribucion en formato GGUF del fine-tune Spotlight r3, construido sobre el modelo base Qwen/Qwen3.5-9B. Lo publica el usuario tomvaillant en Hugging Face y esta pensado para su uso con llama.cpp y entornos compatibles con endpoints. El modelo cuenta con 8.953.803.264 parametros (aproximadamente 8,95 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales.

La particularidad de esta publicacion es su procedencia: los pesos no provienen del merge original en precision completa, sino que se obtuvieron desquantizando la version MLX de 4 bits (afin, tamano de grupo 64) del mismo fine-tune, expandiendo despues esos pesos redondeados a bf16 y recuantizandolos a GGUF. El autor advierte explicitamente de que no son los pesos originales en precision completa, un detalle relevante para quien evalue la fidelidad del modelo respecto al fine-tune de referencia.

El repositorio ocupa 15,2 GB e incluye plantilla de chat embebida y soporte de tool calling, con el modo de razonamiento (thinking) activado por defecto en la plantilla. Esta orientado a inferencia local y a despliegues ligeros donde se prefiera el ecosistema GGUF frente a safetensors, y resulta interesante ahora por la combinacion de un modelo de ~9B con capacidades conversacionales y de herramientas en un formato ampliamente soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp, 32 bloques, text-only) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (sin imatrix) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (convertido con `convert_hf_to_gguf.py --no-mtp`) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura del Qwen3.5-9B, un transformer de 32 bloques segun la conversion a llama.cpp, en variante text-only (se uso la opcion `--no-mtp`, es decir, sin multi-token prediction). Sobre esa base se aplico el fine-tune denominado Spotlight r3, del que no se detallan en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable no esta en el entrenamiento sino en la cadena de conversion: los pesos se obtuvieron desquantizando la release MLX de 4 bits (cuantizacion afin con tamano de grupo 64), expandiendo a bf16 y recuantizando a GGUF con llama.cpp en el commit `6023692b1e13a6d4ee6b93f989c4713e474e6165`. El autor verifica que la salida greedy de Q8_0 coincide con el modelo MLX durante los primeros ~35+ tokens en las 5 prompts de prueba y que las llamadas a herramientas se parsean correctamente.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat embebida en el GGUF.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat.
- Soporte de tool calling / function calling; el autor confirma que las llamadas a herramientas se parsean correctamente.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Inferencia en llama.cpp, con `llama-server --jinja` como via recomendada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en una maquina de sobremesa usando la build Q4_K_M, gracias a su tamano de ~9B y a la plantilla de chat ya embebida en el GGUF.
- Agentes con herramientas en local: al parsear correctamente las llamadas a funciones, encaja en flujos de agente que consultan APIs o ejecutan acciones mediante `llama-server --jinja` y un cliente compatible con OpenAI.
- Prototipado rapido de aplicaciones LLM: el formato GGUF y la licencia Apache 2.0 permiten integrar el modelo en demos y pruebas de concepto sin depender de infraestructura de GPU dedicada.
- Razonamiento paso a paso: el modo thinking activado por defecto resulta util en tareas que requieren descomposicion explicita, como analisis de problemas o planificacion.
- Despliegue en entornos con recursos limitados: la cuantizacion Q4_K_M reduce el peso del modelo y facilita su ejecucion en hardware de consumo.
- Evaluacion comparativa de fine-tunes: util para investigadores que quieran medir el efecto del fine-tune Spotlight r3 frente al Qwen3.5-9B base en el mismo runtime.
- Pipelines de CI/CD con llama.cpp: el binario y el GGUF permiten automatizar pruebas de regresion de calidad conversacional en entornos sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una verificacion cualitativa: la salida greedy de Q8_0 coincide con el modelo MLX en los primeros ~35+ tokens en 5 prompts de prueba, y las llamadas a herramientas se parsean correctamente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repo (15,2 GB) y los ~8,95B de parametros, Q8_0 ronda los 9-10 GB y Q4_K_M aproximadamente 5-6 GB, cifras orientativas no confirmadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si con Q4_K_M en tarjetas con 8 GB o mas de VRAM, y con Q8_0 en tarjetas de 12 GB o mas; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-server --jinja`), y por el tag `endpoints_compatible`, clientes compatibles con endpoints. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-9b-spotlight-r3-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | Fine-tune derivado de MLX 4-bit |
| Qwen/Qwen3.5-9B | ~8,95B | no disponible | no disponible en la informacion | safetensors (base) | Modelo base del fine-tune |
| tomvaillant/qwen3.5-9b-spotlight-r3-mlx | no disponible | no disponible | no disponible en la informacion | MLX 4-bit | Release original del fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no son el merge original en precision completa: se desquantizaron de una release MLX de 4 bits, se expandieron a bf16 y se recuantizaron, por lo que arrastran el redondeo de la cuantizacion de 4 bits.
- El GGUF original del fine-tune se perdio, segun indica el autor; esta es la unica via de distribucion en GGUF conocida.
- La cuantizacion Q4_K_M se genero sin imatrix, lo que puede degradar la calidad frente a cuantizaciones calibradas.
- Modo thinking activado por defecto: puede incrementar la latencia y el consumo de tokens si no se desactiva en la plantilla.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico de este fine-tune.
- Longitud de contexto no documentada; conviene verificarla antes de usarlo en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.5-9B puede tener condiciones propias que conviene revisar antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tomvaillant/qwen3.5-9b-spotlight-r3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Release MLX de origen: https://huggingface.co/tomvaillant/qwen3.5-9b-spotlight-r3-mlx
- llama.cpp (commit de conversion): https://github.com/ggml-org/llama.cpp/commit/6023692b1e13a6d4ee6b93f989c4713e474e6165
