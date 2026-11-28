# Xylolabs/Qwen3.6-35B-A3B-GGUF

## Resumen

Xylolabs/Qwen3.6-35B-A3B-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen3.6-35B-A3B, publicado por el usuario Xylolabs. El modelo base lo desarrolla el equipo Qwen (Alibaba) y se distribuye bajo licencia Apache 2.0. Esta ficha cubre especificamente la version cuantizada para inferencia local con llama.cpp, que es el formato en el que se publica este repositorio.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parametros totales (aproximadamente 34,66 mil millones) y, segun la nomenclatura "A3B", unos 3 mil millones de parametros activos por token. Esta pensado para generacion de texto conversacional y razonamiento, con soporte declarado de ingles y coreano. El repositorio GGUF incluye diez ficheros de cuantizacion que van desde IQ2_M (11,523 GB) hasta Q8_0 (36,903 GB), lo que permite desplegar el modelo en un rango amplio de hardware.

La relevancia de esta publicacion radica en que ofrece cuantizaciones con matrices de importancia (imatrix) propias, construidas a partir de chat, razonamiento, prosa, codigo y texto en coreano, y con mediciones de degradacion frente a BF16 (KL divergence y top-1 agreement) publicadas por el autor. Esto permite a los desarrolladores elegir el nivel de cuantizacion con datos objetivos de perdida de calidad, algo poco habitual en repositorios de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 34.660.610.688 (aprox. 34,66 B) |
| Parametros activos | Aprox. 3 B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, Q3_K_M, IQ4_XS-Q8_0, Q4_K-Q8_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura transformer con capas de mezcla de expertos (MoE), con 34,66 mil millones de parametros totales y aproximadamente 3 mil millones activos por token. El repositorio GGUF corresponde unicamente al modelo de texto: segun la model card, el encoder de vision y el proyector se omiten, y ningun fichero incluye la capa MTP (multi-token prediction). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

El trabajo tecnico de este repositorio es la cuantizacion. El autor genera matrices de importancia (imatrix) propias a partir de datos de chat, razonamiento, prosa sin formato, codigo y texto en coreano; para las variantes Q4_K_M, Q6_K, Q5_K_M, Q3_K_M, IQ3_XXS, Q2_K e IQ2_M se anaden ademas texto de Wikipedia en coreano y codigo. Los tipos por tensor de Q6_K, Q5_K_M, Q3_K_M, IQ3_XXS, Q2_K e IQ2_M siguen los ficheros UD de Unsloth, leidos de sus cabeceras. La variante Q8_0 no usa imatrix. La model card detalla la mezcla exacta de tipos en Q4_K_M: expertos gate y up en Q4_K, down en Q5_K (Q6_K en las capas 34, 38 y 39), embeddings y tensores no expertos en Q8_0 y salida en Q6_K.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento y respuesta a prompts de tipo chat, segun los datos usados para las imatrix (chat, reasoning, prosa y codigo).
- Generacion de codigo: el modelo base y los datos de calibracion incluyen codigo, aunque no se documentan benchmarks especificos de programacion.
- Separacion de vision: esta version GGUF excluye el encoder de vision del modelo base, por lo que no procesa imagenes.
- Compatibilidad con llama.cpp y el formato GGUF, incluido el flag `--jinja` para plantillas de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional: las variantes Q4_K_M (22,123 GB) e IQ4_XS-Q8_0 (19,536 GB) caben en GPUs de consumo de 24 GB y permiten ejecutar un MoE de 35B con unos 3B activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.
- Prototipado en estaciones de trabajo sin GPU de datacenter: la variante IQ2_M (11,523 GB) permite cargar el modelo en GPUs de 12-16 GB o en configuraciones con offload parcial a CPU, a costa de una degradacion medible (KL de 0,134 frente a BF16 en WikiText-2).
- Evaluacion de calidad de cuantizacion: las tablas de KL y top-1 de la model card permiten comparar variantes antes de fijar una en produccion; por ejemplo, Q4_K_M mantiene un top-1 del 95,176 % en WikiText-2 frente al 97,098 % de Q8_0.
- Aplicaciones en coreano: el autor construye imatrix con texto coreano y Wikipedia en coreano para varias cuantizaciones, lo que hace estas variantes adecuadas para tareas de generacion en ese idioma con llama.cpp.
- Generacion de codigo en local: con Q5_K_M o Q6_K (26,456 GB y 29,308 GB) se obtiene una perdida de calidad reducida y se puede integrar en flujos de autocompletado o revision de codigo ejecutados en la propia maquina.
- Servicio de inferencia ligero en una sola GPU: Q8_0 (36,903 GB) requiere al menos 40-48 GB de VRAM, por lo que encaja en A100 40GB con margen ajustado o en A100/H100 de 80 GB para servir peticiones con la maxima fidelidad respecto a BF16.

## Benchmarks y rendimiento

La model card publica metricas de fidelidad de cuantizacion frente a BF16 (KL divergence y top-1 agreement) sobre WikiText-2, un conjunto de chat y un conjunto held-out. No se publican resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 36,903 GB | 0,005337 | 97,098 % | 0,008858 | 97,510 % | 0,008898 | 96,853 % |
| Q6_K | 29,308 GB | 0,006321 | 96,799 % | 0,007997 | 97,235 % | 0,010514 | 96,706 % |
| Q5_K_M | 26,456 GB | 0,007206 | 96,627 % | 0,011832 | 96,990 % | 0,012993 | 96,010 % |
| Q4_K_M | 22,123 GB | 0,012551 | 95,176 % | 0,015006 | 96,284 % | 0,020796 | 95,157 % |
| Q4_K-Q8_0 | 20,543 GB | 0,015488 | 94,775 % | 0,020343 | 95,657 % | 0,027959 | 94,529 % |
| IQ4_XS-Q8_0 | 19,536 GB | 0,017360 | 94,485 % | 0,025865 | 95,392 % | 0,029922 | 93,892 % |
| Q3_K_M | 16,846 GB | 0,040602 | 91,436 % | 0,050130 | 92,804 % | 0,066743 | 90,618 % |
| IQ3_XXS | 13,211 GB | 0,083193 | 87,853 % | 0,117544 | 89,608 % | 0,136249 | 86,961 % |
| Q2_K | 12,291 GB | 0,107824 | 86,270 % | 0,113427 | 89,294 % | 0,171652 | 85,373 % |
| IQ2_M | 11,523 GB | 0,134445 | 84,667 % | 0,135428 | 87,588 % | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el overhead de contexto KV. IQ2_M requiere unos 12 GB; Q4_K_M, unos 22-24 GB; Q8_0, unos 37-40 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e IQ4_XS-Q8_0; RTX 3090 (24 GB) para las mismas variantes; A100 40GB o H100 80GB para Q8_0; A100 80GB para servir Q8_0 con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q3_K_M o IQ3_XXS; en GPUs de 12 GB con Q2_K o IQ2_M (con degradacion notable).
- Opciones de despliegue: llama.cpp (libreria del repositorio), `llama-cli` con `--jinja`, y servidores compatibles con GGUF como llama.cpp server u Ollama. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible. Al ser un MoE con unos 3B parametros activos, el coste por token es inferior al de un denso de 35B, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-GGUF | 34,66 B totales / ~3 B activos | no disponible | GGUF | Apache 2.0 | Cuantizaciones con imatrix propia y metricas KL publicadas |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 B totales / ~3 B activos | no disponible | safetensors | Apache 2.0 | Modelo original, incluye vision; referencia BF16 |
| Cuantizaciones Unsloth del mismo base | 34,66 B totales / ~3 B activos | no disponible | GGUF | Apache 2.0 | Variantes UD-Q*_K_XL y UD-IQ* comparadas en la propia model card |

No se dispone de datos de benchmarks de tarea para comparar el rendimiento funcional con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Solo texto: el encoder de vision y el proyector del modelo base se omiten en estos GGUF, por lo que no hay capacidad multimodal.
- Idiomas declarados limitados a ingles y coreano; el rendimiento en castellano no esta documentado.
- Degradacion medible en cuantizaciones bajas: IQ2_M pierde mas de 12 puntos de top-1 en WikiText-2 respecto a Q8_0 (84,667 % frente a 97,098 %), lo que desaconseja su uso en tareas sensibles a la fidelidad.
- Sin capa MTP en ningun fichero, por lo que no se puede aprovechar la decodificacion multi-token prediction del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse antes de un despliegue en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B y de los datos de calibracion.
- Repositorio de terceros: la calidad de las cuantizaciones depende del autor (Xylolabs), no del equipo Qwen; se recomienda validar las metricas KL en el caso de uso propio.
- No se documentan resultados de benchmarks de tarea ni latencias, lo que limita la comparacion con alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF/blob/main/LICENSE
- Codigo de llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
- Cuantizaciones Unsloth de referencia: no disponible como enlace directo en la informacion proporcionada.
