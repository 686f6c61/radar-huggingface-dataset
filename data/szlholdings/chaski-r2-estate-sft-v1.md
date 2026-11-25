# SZLHOLDINGS/chaski-r2-estate-sft-v1

## Resumen

chaski-r2-estate-sft-v1 es un modelo de generacion de texto de 873.438.784 parametros (aproximadamente 873 millones) publicado por SZLHOLDINGS, un repositorio organizativo que agrupa modelos, datasets y Spaces bajo lo que denomina "governed-AI estate". El modelo deriva del checkpoint base SZLHOLDINGS/chaski-r2 mediante un proceso de ajuste supervisado (SFT), segun indica el propio sufijo del identificador. La arquitectura declarada en los metadatos es `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5, aunque la model card no aporta detalles sobre la configuracion interna, el tokenizador ni la ventana de contexto.

La relevancia de esta publicacion es limitada y conviene tratarla con cautela. La model card no documenta numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineamiento (RLHF, DPO) ni resultados de evaluacion. El autor declara explicitamente que cualquier afirmacion de calidad no respaldada por sus ficheros de "receipts" debe considerarse UNKNOWN, y una auditoria fechada el 22 de noviembre de 2026 concluye que no existe una cadena de receipts de evaluacion completa (estado `UNKNOWN_NO_EVAL_RECEIPT`). Es, por tanto, un artefacto de pesos sin garantias de rendimiento verificadas.

El modelo se distribuye en formato safetensors con licencia Apache 2.0, un tamano de repositorio de 1,8 GB y un unico idioma declarado (ingles). Con 294 descargas y ningun "like", su adopcion es marginal. Resulta util como punto de partida para experimentacion con modelos de ~870 M de parametros o como ejemplo de pipeline SFT dentro del ecosistema SZL, pero no como componente de produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tag del repositorio; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es el tag `qwen3_5`, que situa el modelo en la estela de la familia Qwen 3.5 de Alibaba. No obstante, la model card no confirma si se trata de un transformer denso convencional, de una variante con atencion lineal o de un hibrido, ni especifica la dimension oculta, el numero de capas, el numero de cabezas de atencion ni el vocabulario del tokenizador. Tampoco se indica si el checkpoint base chaski-r2 fue entrenado desde cero o es un derivado de un modelo Qwen publico.

Respecto al entrenamiento, el sufijo `sft` indica ajuste supervisado sobre el modelo base, pero no se documentan el numero de ejemplos, la mezcla de datos, la longitud de las secuencias, la tasa de aprendizaje ni si hubo fases posteriores de preferencia (DPO, RLHF). La model card insiste en que las afirmaciones de entrenamiento y evaluacion residen en ficheros de receipts del "estate mesh", y que la auditoria estandar no los encontro en las rutas convencionales (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`). En consecuencia, cualquier innovacion tecnica (decodificacion especulativa, atencion lineal, modos de razonamiento) debe considerarse no disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles, segun el pipeline declarado `text-generation`.
- Ajuste supervisado orientado presumiblemente a instrucciones, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Capacidades de razonamiento, codigo o matematicas: no disponibles (sin benchmarks ni documentacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado; no se documenta cobertura adicional.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con modelos de ~870 M de parametros: el modelo cabe en una GPU de consumo y permite estudiar el efecto del SFT sobre un checkpoint base, siempre que el investigador aporte su propia evaluacion.
- Prototipado rapido de pipelines de generacion de texto en ingles: su tamano reducido facilita iteraciones en local antes de escalar a modelos mayores.
- Fine-tuning adicional sobre dominios especificos: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para un segundo ajuste con datos propios.
- Evaluacion de infraestructura de despliegue: util para probar integraciones con vLLM, TGI o transformers en un modelo pequeno antes de migrar a uno de mayor tamano.
- Generacion de texto auxiliar en tareas de baja criticidad (resumenes breves, reformulacion de frases) en ingles, con supervision humana obligatoria dada la ausencia de benchmarks.
- Docencia y demostraciones de SFT: el repositorio y su model card ilustran un flujo de publicacion con receipts y auditoria, aprovechable como material didactico sobre trazabilidad de modelos.
- Base para comparaciones controladas: permite contrastar el comportamiento de un SFT de ~870 M frente al checkpoint base chaski-r2 en tareas internas del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y la auditoria del 22 de noviembre de 2026 concluye `UNKNOWN_NO_EVAL_RECEIPT`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,75 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 2,5-4 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,45 GB. No se publican pesos cuantizados oficiales, por lo que habria que generarlos.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16; tambien cabe en GPUs de datacenter (A100, H100) sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en toda la gama actual.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chaski-r2-estate-sft-v1 | 873 M | no disponible | Apache 2.0 | Hugging Face | Sin benchmarks publicados; auditoria sin receipts de evaluacion |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 768 tokens (familia Qwen2.5) | Apache 2.0 (mayoria de variantes) | Hugging Face | Familia ampliamente evaluada; referencia natural por el tag qwen3_5 |
| SmolLM2-1.7B | 1,7 B | 8 192 tokens | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |
| Llama 3.2-1B | 1,2 B | 131 072 tokens | Llama 3.2 Community License | Hugging Face | Requiere aceptar licencia; contexto largo |

La comparacion es aproximada: no se dispone de datos de contexto ni de evaluacion del modelo SZL, por lo que la eleccion frente a estas alternativas depende de la verificacion empirica que haga cada equipo.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de receipts de evaluacion verificados; la propia model card califica el estado como `UNKNOWN_NO_EVAL_RECEIPT`.
- No se documenta la longitud de contexto, lo que impide planificar cargas con secuencias largas.
- Idioma limitado al ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion no cuantificado; al ser un modelo pequeno y sin evaluacion, se recomienda supervision humana en cualquier salida.
- Sesgos desconocidos: no se documenta la composicion del dataset de SFT ni del checkpoint base.
- La nota de licencia indica que el tag Apache 2.0 se fijo por decision operativa del "estate" el 25 de noviembre de 2026, sin evidencia de licencia upstream por fichero; conviene revisar la procedencia antes de un uso comercial critico.
- El modelo base chaski-r2 no aporta documentacion publica sobre su origen, lo que anade incertidumbre sobre derechos y procedencia de los datos.
- Sin garantias de mantenimiento: 294 descargas y ningun "like" sugieren un proyecto de baja actividad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2-estate-sft-v1
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de generacion de cards: https://github.com/szl-holdings/estate-cards
- Bundle de receipts citado: SZLHOLDINGS/wave-logs (ruta `mesh/2026-11-22/model-receipts/pass3-core/`)
- Ledger de bloqueo citado: szl-holdings/szl-eval-harness (`ledger/blocking_ledger_v1.json`)
