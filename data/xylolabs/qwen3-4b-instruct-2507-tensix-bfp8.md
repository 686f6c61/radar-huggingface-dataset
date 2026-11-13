# Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP8

## Resumen

Qwen3-4B-Instruct-2507-Tensix-BFP8 es una cuantizacion del modelo Qwen/Qwen3-4B-Instruct-2507 realizada por Xylolabs para su ejecucion en NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y los pesos del Qwen3-4B-Instruct-2507 original, pero cuantiza las capas lineales de atencion (q, k, v, o) y del MLP (gate, up, down) a formato block-floating-point de 8 bits (`ttnn.bfloat8_b`), mientras mantiene en bf16 el embedding, la LM head, las normas y el resto de tensores.

El problema que resuelve es la falta de checkpoints nativos para el hardware de Tenstorrent: TT-NN empaqueta directamente matrices BFP8 sin conversion en tiempo de carga, de modo que este export elimina el paso de cuantizacion en el dispositivo y reduce el peso de los pesos del modelo de lenguaje a aproximadamente 4,64 GB empaquetados. La cuantizacion se aplica con GPTQ sobre la rejilla bfloat8_b, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano.

El modelo es relevante para quienes despliegan LLMs en aceleradores Tenstorrent y necesitan una alternativa de precision reducida que preserve fidelidad respecto a BF16: segun la model card, la divergencia KL media frente al original es de 0,00092 y el top-1 de coincidencia es del 98,59 %, con cero respuestas perdidas en el conjunto de evaluacion de 33 prompts. La licencia Apache 2.0 heredada del modelo base permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos lineales cuantizados a block-floating-point de 8 bits (bfloat8_b) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales); bf16 en embedding, LM head, normas y resto de tensores; 9,23 bits por peso de media |
| Idiomas soportados | no disponible (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN en dispositivo |

## Arquitectura y entrenamiento

El checkpoint deriva del Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.411 millones de parametros. La intervencion de Xylolabs no reentrena el modelo: aplica GPTQ sobre la rejilla bfloat8_b a las proyecciones q, k, v, o del mecanismo de atencion y a gate, up y down del MLP en las 36 capas del modelo. Las matrices cuantizadas se almacenan como valores bf16 situados en la rejilla BFP8, de forma que TT-NN las empaqueta sin alterar sus valores. El resto de tensores (embedding, LM head atada al embedding, normas) permanece en bf16.

La calibracion de GPTQ utilizo 65.536 tokens de WikiText-2 y de Wikipedia en coreano, y se conserva el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. El archivo `quant4.json` documenta el formato de cada proyeccion. La validacion se realizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; segun la model card, tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), heredada del Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones propias del modelo base Instruct-2507.
- Generacion de codigo y matematicas: capacidades del modelo base, no verificadas de forma independiente en este checkpoint cuantizado.
- Tool calling y function calling: no confirmado en la informacion proporcionada para este export.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles como lista; la calibracion incluyo texto en ingles y coreano.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles (modelo exclusivamente de texto).
- Ejecucion en NPU Tensix mediante TT-NN con empaquetado directo de pesos BFP8.

## Casos de uso

- Despliegue de un LLM de 4B en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint se empaqueta directamente en TT-NN sin cuantizacion en el dispositivo, lo que simplifica el pipeline de carga y reduce el uso de memoria a unos 4,64 GB para los pesos del modelo de lenguaje.
- Inferencia de bajo consumo en edge con NPU: al ocupar aproximadamente la mitad que el BF16 (4,64 GB frente a 8,04 GB), permite ajustar el modelo junto con la cache KV en dispositivos con DRAM limitada.
- Asistentes conversacionales autoalojados: la plantilla de chat y la fidelidad al BF16 (98,59 % de top-1) lo hacen adecuado para dialogos multi-turno donde se prioriza la coherencia sobre el coste computacional.
- Prototipado y validacion de pipelines TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar el empaquetado de cada matriz y la integridad de la rejilla, utiles para equipos que desarrollan sobre tt-metal.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia BFP8 frente a alternativas como Q4_K_M de llama.cpp para medir divergencia KL y perdida de respuestas.
- Investigacion en eficiencia de hardware: al documentar bits por peso, tamano empaquetado y KL frente a BF16, facilita estudios sobre el compromiso precision-memoria en NPUs.
- Generacion de texto en ingles y coreano: la calibracion cubre ambos idiomas, aunque no se han publicado evaluaciones de calidad por idioma.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Instruct-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,23 | 4,639 | 0,00092 | 98,59 | 31 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04194 | 91,04 | 30 de 33 | 1 |

Las metricas de KL y top-1 cubren 16.272 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 sin matriz de importancia. La model card advierte que estas cifras miden cercania al BF16, no calidad de tarea, y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,64 GB para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers.
- Hardware objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Validacion: ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se ejecuto en tt-transformers ni tt-forge.
- GPU de consumo: no aplicable como objetivo principal; el checkpoint es compatible con transformers en bf16 con `device_map="auto"`, por lo que puede cargarse en GPUs con memoria suficiente para el modelo BF16, aunque no se documentan requisitos especificos.
- Opciones de despliegue: TT-NN con `ttnn.as_tensor` en `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG`; carga estandar via `transformers` para verificacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este export.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP8 | 4,41 B | no disponible | BFP8 (9,23 bits/peso), safetensors | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (BF16) | 4,41 B | no disponible | BF16 (16 bits/peso) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,41 B | no disponible | GGUF 4 bits (4,955 bits/peso) | Apache 2.0 | Generado localmente |

Frente al BF16, este export reduce el tamano a aproximadamente el 58 % con una KL media de 0,00092 y sin respuestas perdidas. Frente al Q4_K_M, ocupa casi el doble de memoria pero reduce la KL en un factor de aproximadamente 45 y conserva una respuesta adicional correcta. La comparativa se limita a variantes del mismo modelo base; no se dispone de datos frente a otros modelos de tamano similar.

## Limitaciones y advertencias

- Las metricas publicadas miden fidelidad respecto a BF16, no calidad de tarea; no hay evaluaciones de MMLU, HumanEval, GSM8K ni similares.
- No se reportan datos de velocidad, latencia ni throughput.
- El checkpoint esta pensado para NPUs Tensix; su uso en GPU requiere cargarlo en bf16, lo que anula la ventaja de memoria.
- tt-transformers y tt-forge no se probaron con este checkpoint; la validacion se hizo con ttnn 0.81.1 sobre simulador, no sobre silicio real segun la informacion disponible.
- La calibracion de GPTQ solo cubre ingles y coreano; el comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion y sesgos: inherentes al modelo base Qwen3-4B-Instruct-2507; no se documentan analisis especificos para este export.
- La cuantizacion introduce una divergencia pequena pero no nula (KL 0,00092); en tareas sensibles a la precision puede ser preferible el BF16.
- Licencia Apache 2.0 heredada, con cambios documentados en `NOTICE`; el autor declara que se ofrece tal cual, sin garantia, y sin afiliacion ni respaldo de Tenstorrent.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tensix-BFP8/blob/main/LICENSE
