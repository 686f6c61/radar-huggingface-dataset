# Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.8-27B-Tenstorrent-Tensix-BFP8 es una cuantización del modelo multimodal Qwen/Qwen3.8-27B, publicada por Xylolabs, orientada especificamente al hardware de aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer multimodal de tipo image-text-to-text con 27.781.427.952 parametros (unos 27,8 mil millones), del que esta ficha solo cuantiza y evalua la parte del modelo de lenguaje. La innovacion principal es el uso de cuantizacion GPTQ sobre la rejilla de punto flotante por bloques `bfloat8_b` (BFP8) que emplea la libreria TT-NN de Tenstorrent, de forma que los pesos se almacenan como valores bf16 en esa rejilla y el empaquetador de TT-NN los lee sin alterar su valor.

El checkpoint ocupa 55,6 GB en el repositorio y requiere aproximadamente 30,96 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers intermedios. Por ello esta pensado para dispositivos con memoria suficiente; el propio autor remite a una version BFP4 para hardware mas limitado. La licencia es Apache 2.0, lo que facilita el uso comercial, y el formato de pesos es safetensors compatible con `transformers`.

Su relevancia actual radica en que es uno de los pocos artefactos publicos que demuestran un flujo completo de cuantizacion GPTQ adaptado a un formato propietario de acelerador (BFP8 de Tensix), con scripts de verificacion de empaquetado y una integracion documentada con el demo `qwen38_27b_qb2` de tt-metal sobre cuatro chips Blackhole (QuietBox 2). Esto resulta de interes para equipos que despliegan modelos grandes en NPUs de Tenstorrent y necesitan conservar la fidelidad numerica de los pesos tras el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion y capas Gated DeltaNet; arquitectura `qwen3_5` segun la libreria de transformers |
| Parametros totales | 27.781.427.952 (27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en las proyecciones cuantizadas; 9,21 bits por peso de media en el conjunto); existe una version BFP4 publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`), con empaquetado especifico para TT-NN; incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con 27,8 mil millones de parametros. La nomenclatura de las capas en la model card revela una arquitectura hibrida: 16 capas con atencion clasica (proyecciones q, k, v, o) y 48 capas con modulos Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), ademas de 64 capas MLP con proyecciones gate, up y down. El checkpoint incluye tambien modulos `mtp` (multi-token prediction) y `visual`, ambos conservados en bf16 sin cuantizar.

La cuantizacion se aplico exclusivamente a las capas lineales del modelo de lenguaje mediante GPTQ sobre la rejilla `bfloat8_b` de Tenstorrent, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibracion utilizo 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son pesos almacenados como valores bf16 sobre la rejilla BFP8, de modo que TT-NN los empaqueta sin modificar sus valores; el autor proporciona `pack_tensix.py` y `verify_grid.py` para comprobar matriz a matriz que el empaquetado es exacto. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), ya que el checkpoint conserva el modulo `visual` en bf16.
- Razonamiento y respuesta a preguntas, heredados del modelo base Qwen3.8-27B.
- Prediccion multi-token (modulo `mtp` incluido en el checkpoint, en bf16).
- Capacidades multilingues: no disponibles en la informacion proporcionada; la calibracion incluyo texto en ingles (WikiText-2) y coreano (Wikipedia), pero no se documenta la cobertura linguistica final.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Blackhole y Wormhole: el checkpoint esta empaquetado para TT-NN y se integra con el demo `qwen38_27b_qb2` de tt-metal, que lo ejecuta en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2). Es el escenario principal para el que se publico este artefacto.
- Inferencia multimodal en entornos con NPU: al conservar el modulo visual en bf16, permite tareas de descripcion de imagenes y respuesta a preguntas sobre imagenes dentro de la pila de Tenstorrent, sin recurrir a GPUs.
- Evaluacion de fidelidad de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar matriz a matriz que el empaquetado BFP8 no altera los valores, util para equipos que certifican pipelines de cuantizacion antes de produccion.
- Servicio de chat con contexto conversacional: la plantilla de chat y la generacion estandar de `transformers` permiten montar un endpoint conversacional; el modelo se carga con `device_map="auto"` y `dtype="bfloat16"`.
- Investigacion sobre formatos de punto flotante por bloques: sirve como referencia reproducible de GPTQ aplicado a una rejilla BFP8 propietaria, con calibracion documentada (65.536 tokens de WikiText-2 y Wikipedia coreana).
- Prototipado de asistentes sobre documentacion tecnica en coreano e ingles: la calibracion en ambos idiomas sugiere un comportamiento razonable en esas lenguas, aunque no se publican evaluaciones por idioma.
- Comparacion BFP8 frente a BFP4: al existir ambas versiones del mismo modelo base, permite medir el compromiso entre calidad y memoria (30,96 GB en BFP8 frente a la version BFP4) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de empaquetado (comprobacion de que las matrices empaquetadas en TT-NN conservan sus valores) y una prueba parcial del demo `qwen38_27b_qb2`, en la que el decodificador empaqueto exactamente todas las proyecciones de las capas 0 y 3 con una politica BFP8; la cabeza de salida y una ejecucion completa no se probaron por requerir los cuatro chips.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 30,96 GB solo para los pesos del modelo de lenguaje en BFP8, mas espacio para la cache KV y buffers.
- Aceleradores objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Configuracion de referencia: cuatro chips Blackhole (QuietBox 2) con paralelismo de tensores, segun el demo `qwen38_27b_qb2` de tt-metal v0.81.1; el demo rechaza otro hardware.
- Cabe en GPU de consumo: no disponible; el checkpoint esta pensado para Tensix, aunque al ser safetensors podria cargarse en `transformers` con suficiente memoria, sin garantia de rendimiento.
- Opciones de despliegue: TT-NN y tt-metal (demo `qwen38_27b_qb2`), con `QWEN_PRECISION_CONFIG` apuntando a una politica que mantenga `bfloat8_b`; para carga generica, `transformers` con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Verificacion: `pack_tensix.py` (con `--device` para round-trip por DRAM) y `verify_grid.py`, probados con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP8 | 27,8 mil millones | no disponible | BFP8 para Tensix (Wormhole, Blackhole) | Apache 2.0 | Hugging Face, 62 descargas |
| Xylolabs/Qwen3.8-27B-Tenstorrent-BFP4 | 27,8 mil millones (base) | no disponible | BFP4 para Tensix, menor huella de memoria | Apache 2.0 (presumible, no confirmado en la informacion) | Hugging Face |
| Qwen/Qwen3.8-27B | 27,8 mil millones | no disponible | bf16 original, sin cuantizar | no disponible en la informacion | Hugging Face |

La comparativa se limita al mismo modelo base y su variante BFP4, ya que la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros autores.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; los modulos `visual` y `mtp` permanecen en bf16 y no se han validado en esta version.
- El checkpoint requiere unos 30,96 GB de memoria de dispositivo solo para pesos; en hardware con menos memoria debe usarse la version BFP4.
- El demo `qwen38_27b_qb2` de tt-metal empaqueta por defecto en `bfloat4_b`, lo que recuantiza estos pesos; es necesario escribir una politica que fuerce `bfloat8_b` para preservar la fidelidad.
- Con esa politica, la cabeza de salida pasa a `bfloat8_b`, por lo que la cabeza bf16 de este checkpoint no es exacta en ese demo.
- La cabeza y una ejecucion completa no se probaron por requerir los cuatro chips Blackhole.
- tt-transformers no soporta esta arquitectura; la integracion depende de tt-metal.
- No se publican evaluaciones de calidad (perplejidad, benchmarks) tras la cuantizacion, ni datos de sesgos o tasa de alucinacion.
- No se documenta la cobertura de idiomas ni la longitud de contexto soportada.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B no se detallan en la informacion disponible y conviene verificarlas por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version BFP4: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP4
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal `qwen38_27b_qb2` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
