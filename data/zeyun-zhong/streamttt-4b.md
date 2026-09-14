# zeyun-zhong/StreamTTT-4B

## Resumen

StreamTTT-4B es un modelo vision-lenguaje (VLM) para comprension de video en streaming, desarrollado por Zeyun Zhong y colaboradores (Joya Chen, Zeyun Zhong, Mike Zheng Shou) y publicado en arXiv bajo el titulo "StreamTTT: Reconciling Real-Time Perception and Long-Term Memory in Streaming VLMs". El modelo parte de Qwen/Qwen3-VL-4B-Instruct y anade, en cada capa del decodificador, una rama paralela de test-time training (TTT) con pesos rapidos que se actualizan online y almacenan memoria de largo alcance fuera del contexto de atencion.

El problema que resuelve es un compromiso conocido en asistentes de video en directo: una ventana corta de fotogramas recientes da percepcion nitida pero olvida el pasado, mientras que realimentar todo el historial en la atencion diluye la evidencia reciente. StreamTTT separa ambas demandas: la atencion mantiene una cache KV deslizante de 4096 tokens para lo reciente y la rama TTT acumula historial en un estado de tamano fijo, sin competir por espacio de contexto. El checkpoint real contiene 5.231.019.152 parametros (por encima de lo que sugiere el sufijo "4B" del nombre, sin que la informacion disponible detalle el desglose) y el repositorio ocupa 23,3 GB.

Es relevante ahora porque ataca un escenario de produccion creciente (analisis de video en directo con memoria de lo ya visto) con un coste de parametros moderado: segun los resultados publicados, supera a SimpleStream-8B, el doble de grande, en el subconjunto RTVU de StreamingBench (81,32 frente a 80,59) y mejora a SimpleStream-4B en 5,3 puntos en backward tracing de OVO-Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificador con atencion estandar (Qwen3-VL) mas rama paralela de test-time training (FastWeightBlock) por capa |
| Parametros totales | 5.231.019.152 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana deslizante de cache KV de 4096 tokens (`sliding_window`: 4096); posiciones M-RoPE globalmente continuas entre ventanas; el paper compara con una referencia de ventana deslizante de 64K. Contexto nativo del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el checkpoint se publica en bfloat16 y no se documentan versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible (heredados de Qwen3-VL-4B-Instruct, sin verificacion especifica en esta ficha) |
| Licencia | Apache-2.0 (pesos y codigo); anotaciones del dataset CC-BY-4.0, salvo `adt_realtime_qa`, que es CC-BY-NC-SA-4.0 |
| Formato de pesos | safetensors, requiere `trust_remote_code=True` (tag `custom_code`); repositorio de 23,3 GB |

Otros parametros de configuracion congelados en `config.json`: `num_fw_heads` / `num_fw_kv_heads` = 4 / 4, `lact_chunk_size` = 1024, `lr_parameterization` = `ttt`, `ttt_base_lr` = 1e-4, `ttt_momentum` = `headwise`, `ttt_weight_decay` = `headwise`, `use_residual` = True, `use_gate_for_memory` = True.

## Arquitectura y entrenamiento

Cada capa del decodificador de Qwen3-VL-4B-Instruct se complementa con dos memorias. Por un lado se conserva intacta la ruta de atencion preentrenada, con una cache KV deslizante de 4096 tokens dedicada a la evidencia reciente. Por otro se anade una rama TTT (`FastWeightBlock`) cuyos pesos rapidos son un MLP SwiGLU pequeno (`w0`, `w1`, `w2`) actualizado por bloques durante el forward pass, con momentum y decaimiento dependientes de la entrada y proyectados por cabeza desde los estados ocultos. Las dos salidas se fusionan mediante una puerta aprendible por canal, `tanh(α)`, inicializada cerca de cero, de modo que el modelo arranca en la funcion preentrenada y aprende a usar la memoria de largo plazo. El mecanismo de pesos rapidos sigue el trabajo E2-TTT (arXiv:2608.21308).

En inferencia, el video se procesa como ventanas temporales ordenadas: tras cada ventana la cache KV se poda a sus `L` tokens mas recientes, mientras que el estado TTT, de tamano fijo, se arrastra sin desalojo y las posiciones M-RoPE se mantienen continuas a nivel global. El entrenamiento es conjunto sobre QA de video largo offline y un corpus de QA en tiempo real construido para la ocasion (dataset RealTimeVideo-Instruct-112K, 112K ejemplos). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Comprension de video en streaming con percepcion en tiempo real sobre la ventana reciente (hasta 2 fps en la configuracion evaluada).
- Memoria de largo alcance mediante estado TTT de tamano fijo, orientada a tareas de retroceso temporal (backward tracing) sobre lo ya observado.
- Respuesta a preguntas sobre video (video QA) en formato de ventana deslizante, con posiciones M-RoPE continuas entre ventanas.
- Inferencia de un solo disparo sobre clips cortos mediante `AutoModelForCausalLM` y `AutoProcessor` estandar de transformers.
- Capacidades heredadas de Qwen3-VL-4B-Instruct (generacion de texto e integracion vision-lenguaje), no verificadas de forma independiente en la informacion disponible.
- Evaluacion de respuestas de opcion multiple mediante puntuacion por logits.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Generacion libre en streaming: no soportada en la ruta de evaluacion publicada (las tareas forward de OVO-Bench REC, SSR y CRR lanzan `NotImplementedError`).
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en directo sobre video en primera persona: el modelo procesa ventanas temporales sucesivas con M-RoPE continuo y una cache KV de 4096 tokens, de modo que puede responder sobre lo que ocurre ahora sin perder el hilo de lo ocurrido minutos antes gracias al estado TTT.
- Analisis de grabaciones egocentricas de actividad diaria: es el dominio predominante del entrenamiento (grabaciones en primera y tercera persona, clips de actividad de YouTube, video instructivo), por lo que encaja en revision de rutinas, diarios de actividad o auditoria de procesos manuales.
- Retroceso temporal sobre eventos pasados (backward tracing): util en supervision de tareas donde hay que reconstruir que ocurrio antes de un fallo, una accion erronea o un cambio de estado.
- Investigacion en eficiencia de contexto: sirve como banco de pruebas para estudiar si la memoria en pesos rapidos sustituye parcialmente a la atencion completa cuando el presupuesto de contexto esta acotado a 4K.
- Prototipos de asistente de video con memoria acotada: al mantener un estado de tamano fijo y podar la cache KV en cada ventana, el consumo de memoria no crece con la duracion del stream, lo que facilita despliegues de sesiones largas con VRAM limitada.
- Evaluacion comparativa de VLM de streaming: la ruta de evaluacion puntua opciones multiples por logits, por lo que es directamente utilizable para reproducir los resultados de OVO-Bench y StreamingBench frente a otras alternativas.
- Investigacion academica sobre test-time training en VLMs: la implementacion de `FastWeightBlock` con momentum y decaimiento por cabeza y puerta de fusion aprendible es reutilizable como referencia para extender otros modelos base.

## Benchmarks y rendimiento

Resultados publicados por los autores, bajo el protocolo de entrada reportado por cada modelo:

| Modelo | Entrada | StreamingBench RTVU | OVO-Bench RT | OVO-Bench BT | OVO-Bench Avg |
|---|---|---|---|---|---|
| HERMES-7B | 1 fps | 79,44 | 69,0 | 49,4 | 59,20 |
| SimpleStream-4B | 16 frames | no disponible | 77,5 | 54,6 | 66,06 |
| SimpleStream-8B | 4 frames | 80,59 | 81,4 | 52,1 | 67,70 |
| StreamTTT-4B | 2 fps / cache KV deslizante de 4K | 81,32 | 78,1 | 59,9 | 69,00 |

Segun el model card, StreamTTT-4B supera a SimpleStream-4B del mismo tamano en 0,6 puntos en percepcion en tiempo real (OVO-Bench RT) y 5,3 puntos en backward tracing (OVO-Bench BT), y supera a SimpleStream-8B, mas grande, en 0,73 puntos en el subconjunto RTVU de StreamingBench. El paper cuantifica ademas la perdida de informacion del estado TTT a presupuesto de 4K frente a una referencia de ventana deslizante de 64K (seccion 4.3). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 10,5 GB solo para pesos (5,23B parametros x 2 bytes), mas cache KV de 4096 tokens, estado TTT y activaciones; en la practica se recomienda un margen de 12 a 16 GB.
- GPU de centro de datos: A100 (40 GB o 80 GB), H100 y A6000 son opciones holgadas; tambien L40S con 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16. En tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) el encaje es ajustado y no hay cuantizaciones oficiales publicadas para reducir el consumo.
- Opciones de despliegue: la via documentada es transformers con `trust_remote_code=True` y el procesador que acompana al checkpoint (no se debe sustituir por el procesador de Qwen3-VL, cuya configuracion de preprocesado de video difiere). Para inferencia por ventanas con arrastre del estado TTT se requieren los helpers de `streamttt/streaming/windowing.py`. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. La rama TTT anade computo por bloque (`lact_chunk_size` = 1024) cuyo coste no se cuantifica en la informacion disponible.
- Nota de memoria: la cache KV se poda a los tokens mas recientes tras cada ventana y el estado TTT es de tamano fijo, por lo que el consumo no crece con la duracion del stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamTTT-4B | 5.231.019.152 | Cache KV deslizante de 4K; 2 fps; M-RoPE continuo | OVO-Bench Avg 69,00; RTVU 81,32; BT 59,9 | Apache-2.0 | Pesos y codigo publicos en HuggingFace y GitHub |
| SimpleStream-4B | 4B (aproximado, segun nombre; no confirmado) | 16 frames | OVO-Bench Avg 66,06; RT 77,5; BT 54,6 | no disponible | no disponible |
| SimpleStream-8B | 8B (aproximado, segun nombre; no confirmado) | 4 frames | OVO-Bench Avg 67,70; RT 81,4; BT 52,1; RTVU 80,59 | no disponible | no disponible |
| HERMES-7B | 7B (aproximado, segun nombre; no confirmado) | 1 fps | OVO-Bench Avg 59,20; RT 69,0; BT 49,4; RTVU 79,44 | no disponible | no disponible |

StreamTTT-4B es el unico de los cuatro con licencia y disponibilidad confirmadas en la informacion proporcionada; para el resto, los datos de licencia, repositorio y contexto no estan disponibles en este material. La comparacion de rendimiento debe leerse con cautela porque cada modelo usa un protocolo de entrada distinto (fps o numero de frames), tal como advierte el propio model card.

## Limitaciones y advertencias

- El estado TTT de tamano fijo es un resumen con perdida: no sustituye a la atencion completa cuando el video entero cabe en contexto. El paper cuantifica esta diferencia a presupuesto de 4K frente a una referencia de ventana deslizante de 64K.
- No hay generacion libre en streaming: la ruta de evaluacion publicada puntua respuestas de opcion multiple por logits, y las tareas forward de OVO-Bench (REC, SSR, CRR) lanzan `NotImplementedError`.
- Dominio limitado: los datos de entrenamiento son mayoritariamente video de actividad diaria en primera y tercera persona (grabaciones egocentricas, clips de actividades de YouTube, video instructivo). El comportamiento fuera de dominio (vigilancia, ambito medico, retransmision deportiva, captura de pantalla) no esta verificado.
- Limitaciones heredadas de Qwen3-VL-4B-Instruct: alucinacion, limites de OCR y cobertura de idiomas del modelo base siguen aplicando.
- Riesgo de alucinacion: no se documentan tasas ni evaluaciones especificas de fidelidad factual para este checkpoint.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Cobertura de idiomas: no disponible; no se ha verificado el comportamiento multilingue mas alla de lo heredado del modelo base.
- Licencia y datos: los pesos y el codigo son Apache-2.0, pero las anotaciones del dataset son CC-BY-4.0 salvo `adt_realtime_qa` (CC-BY-NC-SA-4.0, no comercial). No se redistribuye video: cada fuente conserva sus propios terminos, algunos con acuerdo firmado o prohibicion de uso comercial, por lo que hay que revisar `docs/DATA.md` antes de un uso en produccion.
- Dependencia de codigo propio: requiere `trust_remote_code=True` y el procesador incluido en el checkpoint; usar el procesador de Qwen3-VL produce preprocesados de video distintos e incorrectos.
- El uso previsto declarado es la investigacion en comprension de video en streaming y video largo, no un despliegue comercial generico sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeyun-zhong/StreamTTT-4B
- Paper principal (arXiv:2608.13416): https://arxiv.org/abs/2608.13416
- Paper E2-TTT, base del mecanismo de pesos rapidos (arXiv:2608.21308): https://arxiv.org/pdf/2608.21308v2
- Repositorio de codigo: https://github.com/zeyun-zhong/StreamTTT
- Documentacion de evaluacion: https://github.com/zeyun-zhong/StreamTTT/blob/master/docs/EVALUATION.md
- Documentacion de datos: https://github.com/zeyun-zhong/StreamTTT/blob/master/docs/DATA.md
- Dataset RealTimeVideo-Instruct-112K: https://huggingface.co/datasets/zeyun-zhong/RealTimeVideo-Instruct-112K
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
