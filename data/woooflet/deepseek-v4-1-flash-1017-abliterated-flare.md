# woooflet/DeepSeek-V4.1-Flash-1017-abliterated-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated-FLARE es un paquete de despliegue listo para servir del checkpoint `mrfakename/DeepSeek-V4.1-Flash-1017-abliterated`, una version "abliterated" (con la subspace de rechazo proyectada fuera) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. Lo publica woooflet (Ford Morris) empaquetado con la herramienta Ignition de NVIDIA/spark-local-inference para un cluster de 4 nodos DGX Spark (GB10) en topologia TP4 con anillo RoCE. El modelo base es un transformer de tipo MoE con torre de vision, bloque MTP/DSpark y tablas Engram, segun los detalles del diff de tensores descritos en la model card.

La relevancia de este repositorio no esta en los pesos (que son bit-identicos al release de mrfakename) sino en el empaquetado: convierte safetensors crudos en un paquete Flare que se lanza con un unico comando en hardware GB10, incorporando el fix de ordenacion complete-copy/MTP de la PR #129 de spark-local-inference (merge del 2026-11-05). Es el primer export gb10 de este checkpoint que incluye dicho fix.

Los datos de rendimiento publicados por el autor indican que la abliteracion no degrada de forma medible las capacidades: MMLU 0.8849 frente a 0.8814 del stock, GPQA Diamond 0.702 frente a 0.697, GSM8K 0.956 frente a 0.944 y HumanEval 0.939 frente a 0.9512, con una reduccion de las banderas de rechazo de 4/8 a 0/8 en chat. El modelo se distribuye bajo licencia MIT y sin gating.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de vision, bloque MTP/DSpark y tablas Engram (detalles parciales en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (expert-scale compression CSF, `--markov-head-quantization fp8`); pesos en safetensors con escalas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetados en formato Flare (libreria `flare`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE): el diff de tensores frente al stock `deepseek-ai/DeepSeek-V4.1-Flash-1017` recorre 96.085 tensores, de los cuales 94.464 son expertos enrutados. Incluye ademas un bloque MTP/DSpark (multi-token prediction con decodificacion especulativa), una torre de vision, embeddings, normas, LM head y tablas Engram. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La edicion abliterated de mrfakename proyecta fuera un subespacio de rechazo de rango 2 y afecta unicamente a dos familias de tensores: `attn.wo_b` (peso y escala, capas 0-31, 64 tensores) y `ffn.shared_experts.w2` (peso y escala, capas 10-39, 60 tensores). En total cambian 124 de 96.085 tensores; el resto es bit-identico al stock, incluyendo expertos enrutados, tablas Engram, bloque MTP/DSpark, torre de vision, embeddings, normas y LM head. Los payloads modificados difieren en un 11-47% de bytes y las escalas en un 0,03-7%, consistente con una proyeccion de subespacio en FP8 y no con un reentrenamiento o recuantizacion. El autor verifico el alcance con un diff SHA-256 tensor a tensor contra el checkpoint original.

El empaquetado Flare se genero con Ignition (NVIDIA/spark-local-inference en el commit `972e28e44781d8d0c84d70ae434db92c36076a43`), con topologia TP4 sobre GB10, compresion de escalas de expertos CSF, cuantizacion FP8 de la cabeza Markov, muestreo paralelo de vocabulario, concurrencia maxima 32, 5 tokens de borrador MTP/DSpark con verificacion adaptativa (alpha 0,75) y chunk de prefill de 8192.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" (la model card menciona ejecuciones con thinking on).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de vision incluida.
- Codigo: HumanEval pass@1 de 0,939 en el harness del autor.
- Matematicas: GSM8K de 0,956.
- Conocimiento general y cientifico: MMLU de 0,8849 y GPQA Diamond de 0,702.
- Decodificacion especulativa mediante MTP/DSpark con 5 tokens de borrador y verificacion adaptativa.
- Comportamiento "abliterated": reduccion de rechazos en prompts daninos (0/8 en chat, 2/8 en thinking, frente a 4/8 y 5/8 del stock).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en cluster DGX Spark: el paquete esta pensado para lanzarse con un unico comando `flare orbit run` sobre 4 nodos GB10 con anillo RoCE, lo que simplifica la puesta en marcha de un endpoint OpenAI-compatible en infraestructura de borde o laboratorio.
- Investigacion sobre alineacion y rechazo: al eliminar la subspace de rechazo manteniendo metricas de capacidad practicamente identicas, sirve para estudiar el comportamiento de modelos abliterated en tareas de seguridad y evaluacion de sesgos.
- Evaluacion comparativa de tecnicas de abliteracion: el repositorio incluye un control stock-vs-stock y un hermano "Uncensored-FLARE", lo que permite comparar tres variantes con el mismo harness y la misma flota.
- Generacion de codigo en pipelines internos: con HumanEval de 0,939 y soporte de decodificacion especulativa, es adecuado para asistentes de codigo en entornos controlados donde la licencia MIT y la ausencia de gating simplifican el despliegue.
- Procesamiento multimodal de documentos: la torre de vision y el pipeline image-text-to-text permiten tareas de extraccion y descripcion sobre imagenes en un servicio self-hosted.
- Razonamiento cientifico asistido: GPQA Diamond de 0,702 lo situa como candidato para tareas de pregunta-respuesta tecnica en dominios de fisica, quimica y biologia, siempre con verificacion humana.
- Servicio de inferencia de alta concurrencia: la configuracion publicada soporta concurrencia 32 con 57,7 tok/s en C1 y 197,7 tok/s en C8, adecuada para cargas de trabajo por lotes en un cluster dedicado.

## Benchmarks y rendimiento

Resultados publicados por el autor en un harness identico sobre 4x DGX Spark (TP4, anillo RoCE), con temperatura/top-p fijos de 1,0 y thinking activado. Son indicadores de precision relativa frente al paquete stock, no benchmarks generales.

| Tarea | Stock Flare (LIL gb10) | Abliterated-FLARE (este repo) | Uncensored-FLARE (hermano) |
|---|---:|---:|---:|
| MMLU (n=1425) | 0,8814 | 0,8849 | 0,8709 |
| GPQA Diamond (n=198) | 0,697 | 0,702 | 0,7323 |
| GSM8K (n=250) | 0,944 | 0,956 | 0,960 |
| HumanEval pass@1 (n=164) | 0,9512 | 0,939 | 0,9451 |
| KL vs stock, muestra de Pile (menor = mas cercano) | 0,100 (suelo de control) | 0,126 | 0,213 |
| Velocidad de servicio C1 / C8 (tok/s) | 62,4 / 207,3 | 57,7 / 197,7 | 69,8 / 195,8 |
| Banderas de rechazo, chat / think (de 8) | 4 / 5 | 0 / 2 | 0 / 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete esta preparado para 4x DGX Spark (GB10) en TP4, no para una unica GPU.
- GPU recomendadas: 4 nodos DGX Spark con GB10 y anillo RoCE; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no disponible; el formato Flare y la topologia TP4 no estan pensados para GPUs de consumo.
- Opciones de despliegue: Flare (`flare orbit run`) sobre el runtime `flare-inference` APT sin parches; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 57,7 tok/s en C1 y 197,7 tok/s en C8 con concurrencia 32, prefill chunk de 8192 y MTP/DSpark con 5 tokens de borrador.
- Almacenamiento: tablas de embeddings en disco con cache de 1 GiB (`--embedding-table-cache-size 1073741824`) y escalas residentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated-FLARE (este) | no disponible | no disponible | 0,8849 | 0,939 | MIT | Hugging Face, sin gating |
| Stock Flare (LIL gb10) | no disponible | no disponible | 0,8814 | 0,9512 | no disponible | paquete Flare de referencia |
| Uncensored-FLARE (hermano) | no disponible | no disponible | 0,8709 | 0,9451 | no disponible | paquete Flare hermano |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (stock original) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- La abliteracion elimina la subspace de rechazo: el modelo acepta prompts que el stock rechazaria (0/8 frente a 4/8 en chat). No debe desplegarse en produccion orientada al publico sin filtros externos de seguridad.
- La edicion puede alterar el comportamiento en dominios sensibles; el autor solo verifica que las metricas de capacidad no cambian de forma medible, no la calidad de las respuestas en casos limite.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; los benchmarks publicados son de opcion multiple y generacion de codigo.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Longitud de contexto: no disponible; no se debe asumir una ventana concreta sin consultar la configuracion del checkpoint base.
- La firma del paquete usa una clave de desarrollo local (namespace `local-development`), no una clave de cuenta de Hugging Face; el primer lanzamiento exige aceptar manualmente la huella `ff4d66d66f9099b1cb47a396a6dd0b0e1f9115e221bc33cdf3b28d5b12387ee9`. Verificar esa huella contra `development-publisher.json` antes de aprobar.
- Los benchmarks se midieron en una unica flota y un unico harness el 2026-11-09; el propio autor advierte que son indicadores relativos, no benchmarks generales, y que las cifras KL son de metodo de muestreo en servicio, no del metodo transformers.
- Dependencia de hardware muy especifico (4x DGX Spark, GB10, RoCE) y del runtime Flare; no hay soporte documentado para otras plataformas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de terceros sobre el paquete.

## Enlaces

- Hugging Face: https://huggingface.co/woooflet/DeepSeek-V4.1-Flash-1017-abliterated-FLARE
- Modelo base de la edicion: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Checkpoint stock original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta de exportacion: NVIDIA/spark-local-inference, commit `972e28e44781d8d0c84d70ae434db92c36076a43` (PR #129, merge `fa0eadaded`, 2026-11-05; PR #158, 2026-10-30)
