# Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por Xylolabs. El modelo original es un transformer denso de aproximadamente 4.400 millones de parámetros, orientado a generación de texto conversacional, razonamiento y código, con una ventana de contexto de 262.144 tokens (en su versión base). Esta variante concreta no modifica la arquitectura: sustituye el formato de los pesos de las capas lineales para que puedan ejecutarse de forma nativa en las NPU Tensix de Tenstorrent (Wormhole y Blackhole).

La cuantización aplicada es GPTQ sobre la rejilla `ttnn.bfloat8_b` (block floating point de 8 bits), de modo que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8 y TT-NN las empaqueta sin alterar sus valores. Las 36 capas del modelo tienen cuantizadas las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down); el resto de tensores (embedding, LM head, normas) permanecen en bf16. El resultado son 9,23 bits por peso de media y 4,64 GB empaquetados, frente a los 8,04 GB del modelo en BF16.

Su relevancia es fundamentalmente de infraestructura: permite desplegar un modelo de 4B con pérdida de calidad muy baja sobre hardware Tensix, un segmento donde el catálogo de modelos listos para usar es todavía reducido. La verificación publicada se limita al simulador `ttsim` de Blackhole con ttnn 0.81.1; no se han publicado pruebas en silicio real ni en los stacks tt-transformers o tt-forge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos lineales en block floating point BFP8 (`ttnn.bfloat8_b`) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens) |
| Tipos de cuantizacion | GPTQ sobre rejilla BFP8 (`bfloat8_b`); 9,23 bits por peso de media; `quant4.json` documenta el formato por proyeccion |
| Idiomas soportados | no disponible (calibracion GPTQ en ingles y coreano: WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB), con indexado por `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3 (informe tecnico arXiv:2505.09388). Esta exportacion no reentrena el modelo: parte del checkpoint Qwen/Qwen3-4B-Instruct-2507 y aplica GPTQ sobre la rejilla de block floating point `bfloat8_b` de TT-NN. En BFP8 cada bloque de valores comparte un exponente, y las matrices cuantizadas se guardan como bf16 situados exactamente en esa rejilla, de manera que el empaquetador de TT-NN las lee sin modificar sus valores. Las proyecciones afectadas son q, k, v, o, gate, up y down en las 36 capas; embedding, LM head (atado al embedding), normas y el resto de tensores permanecen en bf16.

La calibracion de GPTQ uso 65.536 tokens de WikiText-2 y de Wikipedia en coreano. La model card no documenta el proceso de entrenamiento original (composicion del dataset, RLHF/DPO, thinking mode); esos detalles pertenecen al modelo base y no se reproducen aqui. La innovacion tecnica de esta ficha es el propio pipeline de cuantizacion para NPU: los scripts `pack_tensix.py` y `verify_grid.py` comprueban, matriz a matriz, que el empaquetado en TT-NN reproduce exactamente los valores almacenados (y opcionalmente hacen un round-trip por DRAM del dispositivo). Las comprobaciones se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matematicas de nivel 4B, segun las capacidades del modelo base (no se aportan benchmarks de tarea en esta ficha).
- Generacion de codigo, con soporte del modelo base para instrucciones y plantillas de chat.
- Tool calling y function calling: capacidad del modelo base; no se documenta en esta exportacion ni se ha validado en hardware Tensix.
- Razonamiento multi-paso y uso como agente: capacidad del modelo base; sin validacion especifica en esta variante.
- Multilingue: el modelo base es multilingue, pero esta ficha no documenta la lista de idiomas soportados.
- Capacidad especial: ejecucion nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos empaquetables sin perdida adicional.

## Casos de uso

- Despliegue en NPU Tensix para inferencia de chat: el checkpoint esta pensado para cargarse en TT-NN con `ttnn.as_tensor` y ejecutarse en Wormhole o Blackhole, aprovechando que las matrices ya estan en la rejilla BFP8 que el empaquetador espera. Es adecuado cuando el objetivo es servir un modelo de 4B en hardware Tenstorrent con el minimo trabajo de conversion.
- Sustitucion de un despliegue BF16 en hardware Tensix con ahorro de memoria: el modelo ocupa 4,64 GB de pesos en dispositivo frente a 8,04 GB en BF16, lo que libera DRAM para cache KV y buffers en tarjetas con memoria limitada.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado TT-NN no altera los valores, util para integrar la cuantizacion en un pipeline de CI antes de desplegar en silicio.
- Prototipado en simulador: al haberse validado en `ttsim` (Blackhole), sirve para desarrollar y depurar kernels o grafos TT-NN sin disponer de la tarjeta fisica.
- Asistente conversacional de bajo coste en ingles y coreano: la calibracion cubre ambos idiomas y la evaluacion de fidelidad se hizo sobre texto de ambos, por lo que es la combinacion con mayor evidencia de calidad preservada.
- Tareas de generacion de texto y codigo en produccion con requisitos moderados: al mantener 31 de 33 respuestas correctas frente a BF16 en la evaluacion del autor, es una opcion razonable cuando el presupuesto de memoria manda y la perdida de calidad debe ser marginal.

## Benchmarks y rendimiento

Los unicos datos publicados miden fidelidad respecto a BF16, no calidad de tarea. La evaluacion cubre 16.272 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano, con y sin plantilla de chat) y 33 prompts cortos con comprobacion automatica.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Instruct-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,23 | 4,639 | 0,00092 | 98,59 | 31 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04194 | 91,04 | 30 de 33 | 1 |

El Q4_K_M de referencia se genero con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, sha256 `45e7a384733727f59380468824eb86ae5284c3fe12a64ca49ba1056393ba2dad`. El criterio de aceptacion del autor (KL media como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida adicional) se cumple con holgura: 0,022 veces la KL de Q4_K_M y 0 perdidas frente a 1. No se publican datos de velocidad, throughput ni benchmarks de tarea (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- Memoria en dispositivo: aproximadamente 4,64 GB solo para los pesos del modelo, mas espacio para cache KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, familias Wormhole y Blackhole.
- Verificacion: realizada con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole). No se ha probado en silicio real segun la model card.
- Stacks: TT-NN (`ttnn`) es el camino documentado. tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- GPU consumer: no aplica como destino principal; el checkpoint esta empaquetado para Tensix. La carga con `transformers` en bf16 es posible (`device_map="auto"`), pero en ese caso se pierde la ventaja de memoria y no se aprovecha la cuantizacion.
- Despliegue: no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 4,41 B | no disponible | BFP8 para NPU Tensix | Apache 2.0 | Hugging Face, 30 descargas |
| Qwen3-4B-Instruct-2507 (BF16) | 4,41 B | 262.144 tokens | BF16 para GPU/CPU | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 Q4_K_M (llama.cpp) | 4,41 B | 262.144 tokens | GGUF 4,955 bits/peso, 2,497 GB | Apache 2.0 | Generado con llama.cpp |

La comparacion relevante es de fidelidad y memoria: frente a BF16, este checkpoint reduce el peso a 4,639 GB con KL media de 0,00092 y Top-1 del 98,59 %; frente a Q4_K_M, ocupa casi el doble de memoria pero conserva mas calidad (KL 45 veces menor, 31 de 33 respuestas frente a 30 de 33). No se dispone de comparaciones con otros modelos de 4B en hardware Tensix.

## Limitaciones y advertencias

- La evaluacion mide fidelidad respecto a BF16, no calidad de tarea: no hay resultados de MMLU, HumanEval, GSM8K ni similares para esta variante.
- No se ha validado en silicio Tensix real; las pruebas se hicieron en el simulador `ttsim` con ttnn 0.81.1. El comportamiento en Wormhole o Blackhole fisicos no esta documentado.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; solo TT-NN esta verificado.
- La calibracion GPTQ uso unicamente texto en ingles y coreano, por lo que la fidelidad en otros idiomas no esta medida.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3-4B-Instruct-2507; no se documentan evaluaciones de sesgo en esta ficha.
- La ventana de contexto efectiva de esta exportacion no se especifica; no se debe asumir la del modelo base sin verificar el empaquetado en TT-NN.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "as is", sin garantia, y declara no estar afiliado ni respaldado por Tenstorrent.
- El repo ocupa 8,8 GB, mas del doble de los 4,64 GB de pesos empaquetados, por lo que la descarga requiere espacio adicional en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
