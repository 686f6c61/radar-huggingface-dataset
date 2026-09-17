# TechnoBaptist/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es un checkpoint de inferencia publicado por TechnoBaptist (el proyecto original Edge0 lo distribuye bajo la organizacion `Edge0` y el repositorio `Edge0-AI/edge0`) a partir del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de un transformer disperso de tipo mezcla de expertos (MoE) de 34.660.610.688 parametros totales, cuantizado a 4 bits (int4) y acompanado de adaptadores LoRA y de un cabezal `prerouter` entrenados especificamente para el framework de inferencia en streaming `edge0` sobre backend MLX. Su propuesta central es ejecutar un modelo de clase 35B con un pico de memoria activa de 2,9 GiB, manteniendo solo los pesos activos en RAM y transmitiendo los expertos desde almacenamiento SSD bajo demanda.

El problema que resuelve es el de la inferencia de modelos grandes en dispositivos con memoria limitada (telefonos de gama alta, Macs con 16-24 GB, mini-PC sin GPU dedicada) sin recurrir a sharding ni a descargar la totalidad de los pesos en memoria. Para ello combina tres mecanismos: offload de expertos a SSD, un `prerouter` entrenado que predice el enrutado de expertos un paso por delante para solapar las cargas con el forward pass (hasta +59 % de throughput de decodificacion), y Recover-LoRA, una destilacion desde el profesor en fp16 que recupera la mayor parte de la perdida de cuantizacion (3,9 puntos de media en los benchmarks reportados).

Es relevante ahora porque demuestra un punto de operacion poco habitual: 14,9-17,7 tok/s de decodificacion y 113-140 tok/s de prefill en un Mac mini M4 Pro de 24 GB, con licencia Apache 2.0 y pesos en safetensors. Se trata, no obstante, de una version preview: el propio autor advierte de que la capacidad agentica (tool use, planificacion multi-paso) es todavia debil y de que el backend MLX solo cubre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (tag `qwen3_5_moe`), 40 capas, hidden size 2048, 256 expertos con 4 activos por token (K=4) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | Aproximadamente 3 B nominales (denominacion "A3B" del nombre); el desglose exacto no esta disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (int4); no se documentan otras precisiones empaquetadas |
| Idiomas soportados | no disponible (la model card indica que el modelo esta ajustado principalmente a los idiomas del modelo base Qwen3.6-35B-A3B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX): checkpoint base int4 + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`; no hay GGUF |

Otros datos: repositorio de 19,7 GB, libreria `mlx`, pipeline `text-generation`, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 17 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 40 capas con tamano oculto 2048 y 256 expertos por capa, de los cuales se enrutan 4 por token (K=4). El checkpoint se distribuye ya cuantizado a 4 bits y no se publica el modelo en fp16 dentro de este repositorio: la base int4 permanece congelada y el ajuste se realiza mediante adaptadores LoRA no fusionados, de modo que un unico checkpoint base de solo lectura puede servir a varios conjuntos de adaptadores sin recuantizar. El entrenamiento de esos adaptadores (Recover-LoRA) se hace por destilacion desde el profesor en fp16, con el objetivo de recuperar la degradacion introducida por la cuantizacion.

La innovacion tecnica principal es el `prerouter`: un cabezal entrenado que predice el enrutado de expertos un paso por delante del forward pass, de forma que la carga de expertos desde SSD se solapa con el calculo en lugar de bloquearlo. Segun la model card, esto aporta hasta un +59 % de throughput de decodificacion, y la ganancia crece con la latencia de almacenamiento, el tamano del modelo y el ancho enrutado K. El segundo pilar es el offload de expertos a SSD, que acota la memoria pico al conjunto activo y no al numero total de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni sobre si hubo RLHF o DPO; tampoco sobre la naturaleza del cabezal `prerouter` mas alla de su funcion.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo chat, con plantilla de chat propia que habilita un modo de razonamiento ("thinking mode").
- Razonamiento matematico y cientifico: los benchmarks reportados por el autor situan AIME 2026 en 86,6 y GPQA-Diamond en 79,8, ademas de MMLU-Pro en 81,0.
- Generacion de codigo: HumanEval en 90,9 con el pipeline int4.
- Seguimiento de instrucciones: IFBench en 57,9.
- Capacidades multilingues: no detalladas; segun el autor, limitadas a los idiomas del modelo base.
- Tool calling / function calling: no soportado de forma fiable en esta preview; el autor indica explicitamente que la capacidad agentica es debil.
- Agentes y razonamiento multi-paso: no optimizado en esta release; la version completa promete reforzarlo.
- Capacidades especiales de sistema: inferencia con expertos en streaming desde SSD, prediccion de enrutado mediante `prerouter` y adaptacion LoRA sin fusionar (varios adaptadores sobre una base unica).
- Vision o audio: no disponible / no anunciado.

## Casos de uso

- Chat local en portatiles Apple Silicon con memoria limitada: el modelo cabe con un pico de 2,9 GiB de memoria activa en un Mac mini M4 Pro de 24 GB, por lo que es viable mantener una conversacion interactiva (14,9-17,7 tok/s) sin GPU dedicada ni cuantizaciones adicionales.
- Inferencia on-device en telefonos o dispositivos edge: al mantener el checkpoint 4-bit en almacenamiento y transmitir solo los expertos enrutados, el requisito de RAM se mantiene por debajo de 3 GiB, apto para terminales con flash interna rapida.
- Servicio batch en una unica maquina commodity: el diseno de adaptadores no fusionados permite servir varios conjuntos LoRA (por ejemplo, dominios distintos) sobre una sola base de solo lectura, sin recuantizar ni duplicar pesos.
- Recuperacion de calidad tras cuantizacion a 4 bits: el pipeline Recover-LoRA sirve como receta reproducible para equipos que necesitan comprimir modelos MoE grandes perdiendo pocos puntos respecto al profesor fp16 (3,9 puntos de media en la evaluacion del autor).
- Investigacion en sistemas de inferencia: el par `prerouter` + offload SSD es un banco de pruebas para medir solapamiento de cargas de expertos, impacto de la latencia de almacenamiento y escalado con el ancho enrutado K.
- Asistencia matematica y cientifica offline: con AIME 2026 en 86,6 y GPQA-Diamond en 79,8, resulta util para resolver problemas y verificar razonamientos en entornos sin conectividad ni GPU.
- Asistencia de programacion en local: HumanEval 90,9 permite autocompletado y generacion de funciones en el editor sobre hardware de consumo, siempre que no se dependa de tool calling.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con OpenCompass bajo ajustes identicos para ambos modelos (maximo 100):

| Benchmark | edge0-35b (int4 + adaptadores) | Qwen3.6-35B-A3B (fp16) |
|---|---:|---:|
| AIME 2026 | 86,6 | 92,7 |
| HumanEval | 90,9 | 95,1 |
| GPQA-Diamond | 79,8 | 81,8 |
| MMLU-Pro | 81,0 | 84,6 |
| IFBench | 57,9 | 61,7 |
| **Media** | **79,2** | **83,2** |

Rendimiento de inferencia medido con `examples/bench.py` en un Mac mini M4 Pro de 24 GB:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion | 14,9-17,7 tok/s |
| Throughput de prefill (frio / caliente) | 113 / 140 tok/s |
| Memoria activa pico | 2,9 GiB |

Nota: la memoria pico corresponde a contextos cortos; los contextos largos anaden cache KV. La ganancia del `prerouter` se reporta como hasta +59 % de throughput de decodificacion.

## Requisitos de hardware

- Memoria activa pico: 2,9 GiB en contextos cortos; el checkpoint completo 4-bit reside en almacenamiento (repositorio de 19,7 GB), no en RAM.
- Almacenamiento: imprescindible SSD rapido (NVMe o flash interna); la latencia de almacenamiento condiciona directamente el throughput y determina la ganancia del `prerouter`.
- GPU: el backend MLX de esta preview esta orientado a Apple Silicon (serie M). No se documenta soporte para CUDA, por lo que A100, H100, RTX 4090 y similares no estan cubiertos por este pipeline; otros backends estan en la hoja de ruta del proyecto.
- Hardware de referencia validado: Mac mini M4 Pro con 24 GB de memoria unificada.
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (16-24 GB segun contexto) y almacenamiento rapido; el requisito de VRAM dedicada se reduce al conjunto de pesos activos.
- Opciones de despliegue: framework `edge0` (backend MLX), instalable con `pip install -e 'git+https://github.com/Edge0-AI/edge0.git#egg=edge0[fetch]'`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: 14,9-17,7 tok/s de decodificacion y 113-140 tok/s de prefill (frio/caliente) en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU-Pro | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| Edge0-35B-A3B-preview (int4) | 34,66 B | ~3 B (nominal) | no disponible | 81,0 | Apache 2.0 | safetensors MLX int4 + LoRA/prerouter, framework edge0 |
| Qwen3.6-35B-A3B (fp16, modelo base) | clase 35 B | ~3 B (nominal) | no disponible | 84,6 | no disponible en la informacion | safetensors fp16; framework no especificado |
| Edge0-8B-A1B-preview | ~8 B por denominacion | ~1 B por denominacion | no disponible | no disponible | Apache 2.0 (segun el proyecto) | safetensors MLX; no disponible el detalle |

La comparacion directa con el modelo base es la mas fiable: el pipeline int4 con adaptadores se situa 3,9 puntos por debajo del profesor fp16 de media, a cambio de reducir el requisito de memoria desde el tamano completo del modelo a 2,9 GiB activos. No se dispone de datos publicados en la informacion proporcionada para comparar con otras familias de MoE orientadas a edge.

## Limitaciones y advertencias

- Version preview: la cobertura y la calidad estan en extension; el propio autor la describe como una release temprana del pipeline edge0.
- Capacidad agentica debil: tool use, planificacion multi-paso y autonomia de horizonte largo no estan optimizados en esta release, por lo que no es adecuado para agentes en produccion.
- Restriccion de plataforma: el backend MLX solo soporta Apple Silicon actualmente; no hay via CUDA ni GGUF en esta entrega.
- Memoria dependiente del contexto: los contextos largos incrementan la cache KV y rompen el presupuesto de 3 GiB; el autor recomienda contextos cortos para mantener el pico.
- Idiomas: no se publica lista de idiomas soportados; el ajuste se limita a los idiomas del modelo base.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; el modelo no incorpora herramientas de verificacion y su modo de razonamiento no garantiza la correccion factual.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Benchmarks autoevaluados: todas las cifras proceden del propio autor con OpenCompass; no hay verificacion independiente. Ademas, el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Procedencia del repositorio: el identificador consultado es `TechnoBaptist/Edge0-35B-A3B-preview`, mientras que la model card enlaza a `Edge0/Edge0-35b-a3b-preview` y al proyecto `Edge0-AI/edge0`. Conviene verificar que el checkpoint replica la publicacion oficial antes de usarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3.6-35B-A3B no se detalla en la informacion proporcionada y debe comprobarse por separado.
- Compatibilidad de adaptadores: la base int4 esta congelada y los adaptadores se distribuyen sin fusionar; sustituir o combinar adaptadores de terceros requiere validacion, ya que no se documentan garantias de compatibilidad.

## Enlaces

- Repositorio en HuggingFace (identificador consultado): https://huggingface.co/TechnoBaptist/Edge0-35B-A3B-preview
- Repositorio referenciado en la model card: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Variante menor referenciada: https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- Repositorio del framework edge0: https://github.com/Edge0-AI/edge0
- Licencia del proyecto: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Paper: https://arxiv.org/abs/2609.18063
- ModelScope (35B): https://www.modelscope.cn/models/Edge0/Edge0-35B-A3B-preview
- ModelScope (8B): https://www.modelscope.cn/models/Edge0/Edge0-8B-A1B-preview
- Herramienta de evaluacion utilizada por el autor: https://github.com/open-compass/opencompass
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

Los resultados de la busqueda web no contienen enlaces relevantes al modelo: todas las entradas recuperadas tratan sobre widgets de cuestionarios para sitios web y son ajenas al proyecto Edge0.
