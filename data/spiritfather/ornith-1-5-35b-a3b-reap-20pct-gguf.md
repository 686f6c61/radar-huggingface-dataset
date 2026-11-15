# spiritfather/Ornith-1.5-35B-A3B-REAP-20pct-GGUF

## Resumen

Ornith-1.5-35B-A3B-REAP-20pct es una cuantizacion GGUF estatica del modelo oxfrug/Ornith-1.5-35B-A3B-REAP-20pct, que a su vez deriva de ornith-ai/Ornith-1.5-35B-A3B. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 28.923.251.840 parametros totales (segun los safetensors del repositorio) y 3.000 millones de parametros activos por token, segun indica el sufijo A3B del nombre. Sobre esa base, oxfrug aplico la tecnica REAP (arXiv:2510.13999) para eliminar el 20 % de los expertos enrutados: de 256 expertos por capa se conservan 205, con 8 activos por token.

Esta publicacion la firma spiritfather y su valor anadido es doble. Por un lado, ofrece tres niveles de cuantizacion (Q4_K_M, Q6_K y Q8_0) generados directamente desde los safetensors en bf16 con llama.cpp, sin recuantizar desde niveles inferiores. Por otro, corrige un problema de compatibilidad: el prune de REAP dejo la capa MTP (multi-token prediction) con los 256 expertos originales, lo que impide cargarla junto a capas de 205 expertos en llama.cpp. El autor recupera el subconjunto exacto de 205 expertos que uso cgg507 en su tune GM-RP v3 y poda la cabeza MTP para que coincida, incluidos los pesos del router.

El resultado es un modelo de generacion de texto en formato GGUF, con licencia MIT, pensado para ejecutarse en llama.cpp con decodificacion especulativa MTP y modo de razonamiento activado por defecto. Es relevante para quien quiera desplegar un MoE de casi 29.000 millones de parametros en hardware de consumo o en servidores modestos sin renunciar al andamiaje de razonamiento y al soporte de plantillas de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP; poda REAP del 20 % de expertos enrutados |
| Parametros totales | 28.923.251.840 (safetensors del repo) |
| Parametros activos | 3.000 millones (indicado por el sufijo A3B; no verificado en la informacion disponible) |
| Longitud de contexto | no disponible (el ejemplo de carga usa `-c 32768`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (17,7 GB), Q6_K (23,8 GB), Q8_0 (30,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con cabeza MTP incluida en linea (`blk.40.nextn.*`) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 40 capas principales y una capa adicional de prediccion multi-token (MTP). Cada capa enrutada conserva 205 expertos tras la poda REAP aplicada por oxfrug, frente a los 256 originales, y activa 8 expertos por token. La cabeza MTP se usa como borrador especulativo propio del modelo mediante `--spec-type draft-mtp` en llama.cpp; sin ese flag, la herramienta la ignora. cgg507 reporta una tasa de aceptacion MTP greedy del 44,9 % y del 30,9 % en un prompt de rol general (GM) y uno de roleplay (RP), respectivamente, para esta cabeza previa al tune.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original. La model card de esta cuantizacion solo documenta el proceso de conversion: GGUF en bf16 generado desde los safetensors con `convert_hf_to_gguf.py` (llama.cpp v1.0.0), tras podar los expertos enrutados y el router de la capa MTP al conjunto de 205 expertos, y posterior cuantizacion con `llama-quantize` desde ese bf16. No se incluye la torre de vision: es un modelo exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline declarado `text-generation`.
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar por peticion con `chat_template_kwargs: {"enable_thinking": false}` o al servir con `--reasoning off`.
- Control del presupuesto de razonamiento por peticion mediante `thinking_budget_tokens`.
- Decodificacion especulativa con la cabeza MTP integrada (`--spec-type draft-mtp`), que acelera la generacion al estilo de un borrador propio.
- Compatibilidad con plantillas Jinja (`--jinja`) y formato de razonamiento `deepseek` en llama.cpp.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles (la torre de vision no se incluye en esta cuantizacion).

## Casos de uso

- Chat conversacional autoalojado: el modelo puede servir como backend de un asistente en llama.cpp con plantilla Jinja y modo thinking, adecuado para equipos que quieran control total sobre los datos sin depender de APIs externas.
- Razonamiento con presupuesto controlado: en tareas de analisis o resolucion de problemas donde el coste por consulta importa, `thinking_budget_tokens` permite acotar la longitud del razonamiento y equilibrar calidad y latencia.
- Despliegue en hardware de consumo: la variante Q4_K_M (17,7 GB) cabe en GPUs con 24 GB de VRAM, lo que permite ejecutar un MoE de casi 29.000 millones de parametros en una RTX 4090 o similar.
- Generacion de texto creativo y roleplay: el ecosistema alrededor del modelo incluye benchmarks especificos de escritura creativa (CaliperBench) y un tune de roleplay (GM-RP v3 de cgg507), lo que indica uso previsto en narrativa y personajes.
- Aceleracion de inferencia con MTP: en servicios con alta concurrencia, activar `--spec-type draft-mtp` aprovecha la cabeza MTP como borrador para reducir el coste por token generado.
- Prototipado e investigacion sobre poda de expertos: el modelo sirve como caso de estudio reproducible de REAP aplicado a un MoE, con cuantizaciones comparables entre si para medir el impacto de la poda en calidad.
- Integracion en pipelines de llama.cpp: al ser GGUF nativo, encaja en herramientas del ecosistema ggml (llama-server, llama-cli) y en flujos con endpoints compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a CaliperBench para las puntuaciones del modelo, pero no reproduce cifras en el texto. Los unicos datos numericos de rendimiento son las tasas de aceptacion de la cabeza MTP reportadas por cgg507 (44,9 % en prompt GM y 30,9 % en prompt RP, greedy), que miden la eficacia de la decodificacion especulativa, no la calidad del modelo.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 17,7 GB de pesos mas overhead de contexto y cache KV; Q6_K, unos 23,8 GB; Q8_0, unos 30,8 GB.
- GPU recomendadas: para Q4_K_M, RTX 4090 (24 GB) o A100 40 GB; para Q6_K, A100 40 GB o H100; para Q8_0, H100 80 GB o A100 80 GB.
- GPU de consumo: Q4_K_M cabe en tarjetas de 24 GB (RTX 3090, RTX 4090); Q6_K y Q8_0 no caben en consumer de 24 GB sin offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), con `-ngl 99 -fa on` y cache KV cuantizada (`-ctk q8_0 -ctv q8_0`) segun el ejemplo del autor. No se mencionan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP puede mejorar el throughput, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-REAP-20pct (esta ficha) | 28,9 B | 3 B | no disponible | MIT | GGUF |
| ornith-ai/Ornith-1.5-35B-A3B (base sin podar) | no disponible | 3 B (por nombre) | no disponible | no disponible | safetensors |
| oxfrug/Ornith-1.5-35B-A3B-REAP-20pct (fuente de esta cuantizacion) | 28,9 B | 3 B | no disponible | MIT | safetensors |
| spiritfather/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-GGUF (tune de roleplay) | 28,9 B | 3 B | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La poda REAP del 20 % de expertos puede degradar la calidad respecto al modelo original sin podar; no se aportan benchmarks que cuantifiquen esa perdida.
- La cabeza MTP fue podada de forma reconstructiva a partir de los expertos del tune de cgg507; aunque el autor documenta el procedimiento, es una modificacion no presente en el modelo fuente.
- Sin la torre de vision: no admite entradas de imagen.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva o se acota.
- No hay informacion sobre sesgos, idiomas soportados ni calidad en lenguas distintas del ingles.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Licencia MIT heredada del modelo fuente, permisiva para uso comercial, pero conviene verificar la cadena de licencias de los modelos base (ornith-ai/Ornith-1.5-35B-A3B) antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicacion reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spiritfather/Ornith-1.5-35B-A3B-REAP-20pct-GGUF
- Modelo fuente (poda REAP): https://huggingface.co/oxfrug/Ornith-1.5-35B-A3B-REAP-20pct
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Tune de roleplay GM-RP v3: https://huggingface.co/spiritfather/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-GGUF
- Perfil del autor del tune: https://huggingface.co/cgg507
- Perfil del cuantizador: https://huggingface.co/spiritfather
- Paper REAP: https://arxiv.org/abs/2510.13999
- llama.cpp: https://github.com/ggml-org/llama.cpp
- CaliperBench (puntuaciones del modelo): https://caliperbench.com/m/ornith-1.5-35b-a3b-reap20/
- CaliperBench (sitio principal): https://caliperbench.com
- Discord: https://discord.gg/rhE9zdKyE4
