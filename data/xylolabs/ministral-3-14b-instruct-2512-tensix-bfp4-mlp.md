# Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP

## Resumen

Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP es una cuantizacion del modelo Mistral Ministral-3-14B-Instruct-2512-BF16, publicada por Xylolabs y optimizada especificamente para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer denso de 13.506.073.600 parametros orientado a generacion de texto e instrucciones, con soporte para once idiomas. La aportacion de esta variante no es un modelo nuevo, sino un formato de pesos empaquetado en block floating point (bfloat4_b y bfloat8_b) compatible con el runtime tt-metal y ttnn de Tenstorrent.

El problema que resuelve es la falta de pesos pre-cuantizados y listos para usar en hardware Tensix: en lugar de convertir manualmente un checkpoint BF16, el repositorio ofrece carpetas separadas con distintas combinaciones de precision (BFP4 en las capas MLP y BFP8 en atencion, o BFP8 en ambas), junto con scripts de empaquetado y verificacion. Esto reduce el tamano de 27,01 GB en BF16 a 10,576 GB en la variante text-bfp4, manteniendo una divergencia controlada respecto al original.

Es relevante ahora porque el ecosistema de NPUs de Tenstorrent esta creciendo y necesita artefactos de pesos verificables. El autor documenta la calidad de la cuantizacion mediante divergencia KL sobre 12.104 posiciones de texto en ingles y coreano, con un limite de 1,5 veces la referencia Q4_K_M de llama.cpp. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral Ministral-3-14B-Instruct-2512); cuantizacion block floating point para Tensix |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | text-bfp4 (MLP bfloat4_b, atencion bfloat8_b, resto bf16); text-bfp8 (atencion y MLP bfloat8_b, resto bf16); referencia BF16; referencia Q4_K_M (llama.cpp) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (block floating point bfloat4_b/bfloat8_b, empaquetado para ttnn); indice model.safetensors.index.json; metadatos en quant4.json |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Mistral con 13,5 mil millones de parametros, afinado para instrucciones (variante Instruct con fecha 2512). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La torre de vision y su proyector se han eliminado en esta exportacion, por lo que el artefacto es exclusivamente de texto.

La innovacion tecnica de esta variante es el esquema de cuantizacion en block floating point (BFP) propio de Tensix. Los pesos se almacenan como bfloat4_b o bfloat8_b, formatos nativos de ttnn, y se distribuyen con scripts `pack_tensix.py` y `verify_grid.py` que permiten empaquetar matrices y verificar el round-trip contra los valores originales. La carpeta text-bfp4 aplica BFP4 solo a las proyecciones MLP y BFP8 a la atencion, mientras que text-bfp8 usa BFP8 en ambas. El autor mide la fidelidad con divergencia KL media frente a BF16 sobre WikiText-2 y Wikipedia en coreano, en texto plano y con plantilla de chat.

## Capacidades

- Generacion de texto e instrucciones en once idiomas (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Razonamiento y respuesta a instrucciones heredados del modelo base Ministral-3-14B-Instruct.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, aunque no se documentan benchmarks especificos en esta ficha.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Inferencia en hardware Tenstorrent Tensix mediante tt-metal v0.81.1 y ttnn, con configuraciones de precision por capa (`precision_cfg`, `fidelity_cfg`).
- Ejecucion alternativa en transformers con `device_map="auto"` y dtype bfloat16 (los pesos empaquetados se descomprimen a bf16).
- No incluye vision: la torre de vision y el proyector fueron eliminados en esta exportacion.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el modelo esta empaquetado en formatos nativos bfloat4_b y bfloat8_b, por lo que se puede cargar directamente en ttnn sin conversion manual, reduciendo el espacio en DRAM a 10,576 GB en la variante BFP4.
- Servicio de generacion de texto multiidioma en produccion: al cubrir once idiomas, puede atender consultas en espanol, frances, aleman o arabe con un unico checkpoint, simplificando el mantenimiento de un solo pipeline.
- Asistentes conversacionales con plantilla de chat: el modelo soporta `apply_chat_template`, lo que permite construir dialogos multi-turno y desplegarlos tanto en transformers como en el runtime de Tenstorrent.
- Evaluacion comparativa de precision de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y verificar que los pesos empaquetados coinciden con los originales, util para validar pipelines de cuantizacion en CI.
- Investigacion en eficiencia de hardware: la separacion entre text-bfp4 y text-bfp8, con divergencias KL de 0,01849 y 0,00046 respectivamente, permite estudiar el compromiso entre tamano y fidelidad en NPUs Tensix.
- Prototipado en entornos con memoria limitada: la variante BFP4 (10,576 GB) frente a BF16 (27,01 GB) facilita ejecutar el modelo en dispositivos con DRAM reducida, manteniendo una calidad cercana a la referencia Q4_K_M (KL 0,01473).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta divergencia KL media frente a BF16:

| Variante | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| text-bfp4 | 10,576 | 0,01849 |
| text-bfp8 | 15,609 | 0,00046 |
| BF16 (referencia) | 27,01 | 0 |
| Q4_K_M (llama.cpp, referencia) | 8,239 | 0,01473 |

La medicion cubre 12.104 posiciones de texto en ingles (WikiText-2 test) y coreano (Wikipedia coreana), en texto plano y con plantilla de chat, con un limite de KL media de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 10,576 GB para text-bfp4, 15,609 GB para text-bfp8 y 27,01 GB para BF16 (tamanos empaquetados reportados por el autor).
- Hardware objetivo: aceleradores Tenstorrent Tensix Wormhole y Blackhole, con tt-metal v0.81.1 y el flag `--use_hf_rope`.
- GPU convencionales: la model card muestra un ejemplo en transformers con `device_map="auto"` y dtype bfloat16, lo que requiere aproximadamente el tamano BF16 en memoria; no se documentan requisitos especificos para consumer GPU.
- Opciones de despliegue: tt-metal/tt-transformers (demo `simple_text_demo.py`), transformers con safetensors, y referencia Q4_K_M para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card menciona un test de rendimiento batch-1 sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP | 13,5 B | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 (base) | 13,5 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Referencia Q4_K_M (llama.cpp) | 13,5 B | no disponible | Q4_K_M | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: la variante BFP4 presenta una KL media de 0,01849, superior a la referencia Q4_K_M (0,01473), aunque dentro del limite declarado de 1,5 veces dicha referencia.
- El modelo no incluye torre de vision ni proyector; no admite entradas de imagen.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- La longitud de contexto no se especifica en la ficha; debe consultarse la model card del modelo base antes de usarlo en produccion con ventanas largas.
- Los pesos estan pensados para Tensix; usarlos en GPU requiere descomprimir a bf16 via transformers, perdiendo la ventaja de tamano.
- La licencia Apache 2.0 hereda la restriccion del modelo base: no se debe usar el modelo de forma que infrinja derechos de terceros, incluidos derechos de propiedad intelectual.
- El repositorio no incluye un archivo LICENSE del modelo base; el autor aporta el texto estandar de Apache 2.0 y un NOTICE con los cambios.
- El modelo fue creado el 2026-11-11 y actualizado el 2026-11-27, fusionando las variantes BFP4 y BFP8 en un unico repositorio; verificar rutas de carpetas al integrar.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
