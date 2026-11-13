# Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP8

## Resumen

Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP8 es una cuantizacion del modelo Qwen3-4B-Thinking-2507 de Alibaba Qwen, publicada por Xylolabs y orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer denso de 4.411.424.256 parametros (4,4 mil millones) con capacidad de razonamiento explicito en modo thinking, distribuido originalmente bajo licencia Apache 2.0.

La aportacion principal de esta version no es una mejora de capacidades, sino un formato de pesos adaptado al hardware: las capas lineales (q, k, v, o y las proyecciones MLP gate, up y down de las 36 capas) se cuantizan a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque) mediante GPTQ, mientras que el resto de tensores (embeddings, LM head, normas) permanecen en bf16. El resultado ocupa 4,64 GB empaquetado, con una media de 9,23 bits por peso, y las matrices se almacenan como valores bf16 sobre la rejilla BFP8 para que TT-NN las empaquete sin alterar sus valores.

Es relevante ahora porque reduce el coste de memoria del modelo (de 8,04 GB en BF16 a 4,639 GB) con una degradacion muy contenida respecto al original: KL medio de 0,00087 frente a BF16 y top-1 del 98,64 por ciento. La model card advierte de que estas metricas miden cercania al BF16, no calidad de tarea, y que tt-transformers y tt-forge no se han probado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas lineales cuantizadas a BFP8 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales) + bf16 en embeddings, LM head, normas y resto de tensores; 9,23 bits por peso de media |
| Idiomas soportados | No disponible en la informacion proporcionada (la calibracion GPTQ uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB), con `quant4.json` y `model.safetensors.index.json`; compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Thinking-2507 es un transformer denso de 36 capas con 4,4 mil millones de parametros, disenado por el equipo Qwen para razonamiento explicito (modo thinking). Sobre esa base, Xylolabs aplica GPTQ restringido a la rejilla `bfloat8_b` de TT-NN: cada bloque comparte un exponente y los pesos se guardan como valores bf16 alineados a esa rejilla, de modo que el empaquetado en el dispositivo no modifica los valores numericos. Se cuantizan las proyecciones de atencion (q, k, v, o) y las MLP (gate, up, down) de las 36 capas; el LM head (atado al embedding), el embedding, las normas y el resto de tensores se mantienen en bf16.

La calibracion de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El proceso de cuantizacion conserva el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. El autor incluye dos scripts de verificacion: `pack_tensix.py`, que comprueba matriz a matriz que ningun valor cambia al empaquetar (y con `--device` hace un round-trip por la DRAM del dispositivo), y `verify_grid.py`, que valida la rejilla solo con torch. Las comprobaciones se hicieron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent. No se documento el volumen ni la composicion completa del dataset de entrenamiento del modelo base, ni si hubo RLHF o DPO; esa informacion corresponde al informe tecnico de Qwen3 (arXiv:2505.09388).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso en modo thinking, heredadas del modelo base Qwen3-4B-Thinking-2507.
- Razonamiento explicito: el modelo base esta disenado para producir cadenas de pensamiento antes de la respuesta final.
- Generacion de codigo y resolucion de problemas matematicos, como corresponde a la familia Qwen3.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference (tag `text-generation-inference` en el repo).
- Inferencia en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN, con pesos empaquetables sin perdida de valores.
- Tool calling, function calling, capacidades de agente, vision o audio: no disponibles en la informacion proporcionada para esta version cuantizada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint esta pensado para cargarse en NPU Wormhole o Blackhole con TT-NN, ocupando unos 4,64 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers.
- Inferencia de razonamiento en entornos con memoria limitada: al pasar de 8,04 GB en BF16 a 4,639 GB, permite ejecutar un modelo de razonamiento de 4,4 mil millones de parametros en dispositivos con DRAM ajustada, manteniendo un top-1 del 98,64 por ciento respecto al BF16.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar en CI que el empaquetado BFP8 no altera ningun valor, util para equipos que preparan sus propios checkpoints para Tensix.
- Prototipado con transformers: la carga con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` permite usar el checkpoint en GPU convencional para comparar salidas contra el BF16 antes de portarlo a la NPU.
- Evaluacion de degradacion por cuantizacion: con las metricas de KL y top-1 publicadas frente a BF16 y Q4_K_M, sirve como referencia para decidir entre BFP8 y cuantizaciones de 4 bits en funcion del presupuesto de memoria.
- Asistentes conversacionales con razonamiento en hardware no-GPU: al estar orientado a Tensix, encaja en despliegues donde se busca alternativas de silicio a las GPU para inferencia de modelos pequenos con modo thinking.
- Simulacion y desarrollo sin hardware: las comprobaciones con ttsim (simulador de Blackhole) permiten desarrollar y validar el flujo de empaquetado sin disponer fisicamente de la NPU.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al modelo BF16, no la calidad de tarea. KL y top-1 se calculan sobre 16.256 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. "Answers" son 33 prompts cortos con comprobacion automatica; "Lost" indica respuestas correctas en BF16 que aqui fallan o se rompen.

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Thinking-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,23 | 4,639 | 0,00087 | 98,64 | 30 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04862 | 90,64 | 29 de 33 | 1 |

El criterio de aceptacion del autor era un KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; el resultado es 0,018 veces el KL de Q4_K_M con una perdida frente a una. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se publican datos de velocidad, latencia ni throughput, ni resultados en benchmarks de tarea como MMLU, HumanEval o GSM8K para esta version cuantizada.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,64 GB solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers, segun la model card.
- Hardware objetivo: NPUs Tenstorrent Tensix, familias Wormhole y Blackhole.
- Software: TT-NN (ttnn), probado con la version 0.81.1 sobre ttsim, el simulador de Blackhole. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- GPU convencionales: el checkpoint se puede cargar con transformers en bf16 (`dtype="bfloat16"`, `device_map="auto"`), pero la model card no documenta requisitos de VRAM ni rendimiento en GPU; al ocupar 8,8 GB el repo, se necesita espacio equivalente en disco y memoria suficiente para cargar los tensores en bf16.
- Opciones de despliegue: transformers y text-generation-inference estan etiquetados en el repo; el despliegue nativo es via TT-NN en Tensix.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | KL a BF16 | Top-1 (%) | Licencia |
|---|---|---:|---|---:|---:|---:|---|
| Este modelo (BFP8, Tensix) | 4,41 mil M | No disponible | BFP8 + bf16 | 4,639 GB | 0,00087 | 98,64 | Apache 2.0 |
| Qwen3-4B-Thinking-2507 (BF16) | 4,41 mil M | No disponible | bf16 | 8,04 GB | 0 | 100 | Apache 2.0 |
| Qwen3-4B-Thinking-2507 Q4_K_M (llama.cpp) | 4,41 mil M | No disponible | 4,955 bits/peso | 2,497 GB | 0,04862 | 90,64 | Apache 2.0 |

La comparativa se limita al mismo modelo base en distintos formatos, que es lo que documenta la model card. No se proporcionan datos de otros modelos de tamano similar ni resultados de benchmarks de tarea que permitan comparaciones cruzadas.

## Limitaciones y advertencias

- Las metricas publicadas (KL, top-1, respuestas correctas) miden fidelidad al BF16, no calidad de tarea; no deben interpretarse como rendimiento en benchmarks como MMLU o HumanEval.
- No se han publicado datos de velocidad, latencia ni throughput; el rendimiento real en Tensix no esta cuantificado en la model card.
- tt-transformers y tt-forge no se han probado con este checkpoint; solo se valido el empaquetado con ttnn 0.81.1 sobre el simulador ttsim, no sobre hardware fisico segun la informacion disponible.
- La calibracion GPTQ uso solo WikiText-2 y Wikipedia en coreano (65.536 tokens), por lo que el comportamiento en otros dominios o idiomas puede degradarse de forma no medida.
- El modelo base es de razonamiento con modo thinking; puede generar cadenas de pensamiento largas que incrementan el consumo de tokens y la latencia.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta version; se heredan los del modelo base Qwen3-4B-Thinking-2507.
- Licencia Apache 2.0, igual que el modelo base, segun la model card; los cambios se listan en el fichero NOTICE. El autor declara que se proporciona tal cual, sin garantia, y que no esta afiliado ni respaldado por Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tensix-BFP8/blob/main/LICENSE
