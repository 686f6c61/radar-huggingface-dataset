# Xylolabs/gpt-oss-20b-GGUF

## Resumen

`Xylolabs/gpt-oss-20b-GGUF` es una distribucion en formato GGUF del modelo `openai/gpt-oss-20b`, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. No se trata de un modelo entrenado desde cero, sino de una cuantizacion del modelo abierto de OpenAI, orientada a facilitar el despliegue local con perdida de precision controlada y medida.

La publicacion incluye dos ficheros: una variante BF16 de 13,79 GB y una variante MXFP4 de 12,11 GB. La estrategia de cuantizacion es mixta: los expertos del bloque MoE conservan los pesos MXFP4 originales, mientras que las tensiones de atencion, embedding y LM head se almacenan en BF16 (fichero BF16) o Q8_0 (fichero MXFP4), y las normas, sesgos y el router se mantienen en F32.

El modelo base cuenta con 20.914.757.184 parametros (aproximadamente 20,9 mil millones) y es de tipo MoE segun la estructura descrita en la model card. La licencia es Apache 2.0, lo que permite uso comercial. La relevancia de esta ficha radica en que documenta una alternativa practica para ejecutar un modelo de ~21B en hardware de consumo, con datos de divergencia KL y acuerdo top-1 frente a los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la model card |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | BF16 (fichero BF16), MXFP4 (fichero MXFP4); expertos en MXFP4, atencion/embedding/LM head en BF16 o Q8_0, normas/sesgos/router en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `openai/gpt-oss-20b` es un transformer con mezcla de expertos (MoE), segun indica la model card del autor de la cuantizacion. La distribucion de precision es heterogenea: los expertos MoE mantienen los pesos MXFP4 originales del modelo de OpenAI, mientras que las capas de atencion, embedding y LM head se almacenan en BF16 en el fichero BF16 y en Q8_0 en el fichero MXFP4. Las normas, los sesgos y el router se conservan en F32 para minimizar la degradacion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada. El trabajo de Xylolabs se limita a la conversion y cuantizacion a GGUF, verificada con el commit `caea914e9d05153aa32b96a846dca543e7cb16be` de llama.cpp.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con servicios de inferencia.
- Ejecucion local en llama.cpp sobre CUDA, Metal o CPU mediante `llama-server`.
- Soporte de plantillas de chat a traves de `--jinja` en llama.cpp.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el fichero MXFP4 de 12,11 GB permite ejecutar el modelo en GPUs con 16 GB de VRAM o superior, usando llama.cpp con `-ngl 99` para descargar todas las capas a GPU.
- Prototipado de asistentes conversacionales: al ser un modelo conversacional con plantilla de chat compatible con `--jinja`, se puede levantar un servidor HTTP local con `llama-server` y consumirlo desde aplicaciones cliente sin depender de la nube.
- Evaluacion de modelos abiertos en investigacion: los datos de divergencia KL y acuerdo top-1 frente a los pesos originales permiten medir el impacto de la cuantizacion en distintas tareas (WikiText-2, chat, texto reservado) antes de adoptar una variante.
- Inferencia en CPU o Apple Silicon: la version GGUF esta pensada para Metal y CPU, lo que facilita ejecutar el modelo en portatiles Mac o servidores sin GPU dedicada, a costa de mayor latencia.
- Pipelines de generacion de texto por lotes: el formato GGUF y llama.cpp permiten integrar el modelo en scripts de procesamiento por lotes sin infraestructura de servido compleja.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base y de la cuantizacion facilita su inclusion en productos comerciales y su redistribucion.

## Benchmarks y rendimiento

La model card incluye una tabla de fidelidad de cuantizacion (divergencia KL y acuerdo top-1 frente a los pesos originales), no benchmarks de tareas estandar como MMLU o HumanEval.

| Quant | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 | 13,79 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 7/7 |
| Unsloth F16 | 13,79 GB | 0,017810 | 93,27% | 0,016416 | 95,84% | 0,018097 | 92,51% | 7/7 |
| Unsloth UD-Q8_K_XL | 13,20 GB | 0,040798 | 89,08% | 0,058024 | 92,53% | 0,043103 | 87,29% | 7/7 |
| Unsloth Q8_0 | 12,11 GB | 0,068532 | 84,85% | 0,140264 | 88,23% | 0,078544 | 82,25% | 7/7 |
| MXFP4 | 12,11 GB | 0,068532 | 84,85% | 0,140264 | 88,23% | 0,078544 | 82,25% | 7/7 |
| Unsloth Q6_K | 12,04 GB | 0,070146 | 84,15% | 0,181486 | 86,78% | 0,077090 | 82,23% | 7/7 |
| Unsloth UD-Q6_K_XL | 12,04 GB | 0,070146 | 84,15% | 0,181486 | 86,78% | 0,077090 | 82,23% | 7/7 |
| Unsloth UD-Q4_K_XL | 11,87 GB | 0,147855 | 71,09% | 0,234847 | 83,82% | 0,141692 | 73,20% | 7/7 |
| Unsloth Q5_K_M | 11,72 GB | 0,420841 | 53,50% | 4,194308 | 30,51% | 0,559205 | 47,14% | 6/7 |
| Unsloth Q4_K_M | 11,62 GB | 0,307567 | 59,23% | 0,921590 | 64,33% | 0,435747 | 53,69% | 7/7 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero MXFP4 ocupa 12,11 GB y el BF16 13,79 GB; se necesita al menos esa cantidad de VRAM para cargar todas las capas en GPU con `-ngl 99`, mas margen para el contexto KV.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, encaja en GPUs con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090, A100, H100), aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: si el fichero MXFP4 de 12,11 GB entra en GPUs de 16 GB, es probable que funcione en RTX 4080, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte CUDA, Metal y CPU. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Contexto de ejemplo: el comando de la model card usa `-c 32768`, pero no se confirma como contexto maximo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|
| Xylolabs/gpt-oss-20b-GGUF | ~20,9 B (MoE) | no disponible | GGUF | Apache 2.0 | Cuantizacion mixta MXFP4/BF16/Q8_0/F32 |
| openai/gpt-oss-20b | ~20,9 B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo base original |
| Unsloth F16 (mismo base) | ~20,9 B (MoE) | no disponible | GGUF | Apache 2.0 | KL 0,017810 en WikiText-2, top-1 93,27% |
| Unsloth Q8_0 (mismo base) | ~20,9 B (MoE) | no disponible | GGUF | Apache 2.0 | KL 0,068532 en WikiText-2, top-1 84,85% |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: el fichero MXFP4 presenta un KL de 0,068532 en WikiText-2 y un acuerdo top-1 del 84,85%, frente al 93,27% de la variante F16.
- Las variantes de baja precision (Q5_K_M, Q4_K_M) muestran una degradacion severa en la tabla del autor, con KL de 0,420841 y 0,307567 respectivamente en WikiText-2.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero la model card remite a los ficheros `LICENSE`, `USAGE_POLICY` y `NOTICE`, que conviene revisar antes de desplegar en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la primera release es del 2026-11-27; se trata de una publicacion muy reciente y poco validada por la comunidad.
- No se confirma la longitud maxima de contexto soportada; el valor `-c 32768` del ejemplo no debe interpretarse como limite del modelo.
- El rendimiento en tareas reales (razonamiento, codigo, matematicas) no esta documentado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp (commit de referencia): `caea914e9d05153aa32b96a846dca543e7cb16be`
