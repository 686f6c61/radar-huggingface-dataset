# Xylolabs/granite-3.3-8b-instruct-Tensix-BFP8

## Resumen

Granite-3.3-8b-instruct-Tensix-BFP8 es una cuantizacion del modelo instructivo ibm-granite/granite-3.3-8b-instruct de IBM, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 8.372.219.904 parametros (8,37 mil millones) entrenado para generacion de texto conversacional y tareas instructivas. La intervencion de Xylolabs no cambia la topologia ni el entrenamiento: redondea las capas lineales de atencion y MLP al formato de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) mediante GPTQ, de forma que el empaquetador de TT-NN pueda cargar los pesos sin volver a redondearlos.

La relevancia de esta ficha es acotada y muy tecnica: no es un modelo nuevo ni una mejora de capacidades, sino un artefacto de despliegue para hardware de aceleracion concreto. El repositorio almacena los tensores en bf16, pero cada valor ya esta alineado a la rejilla BFP8, con un coste medio de 8,69 bits por peso y un tamano empaquetado de 8,87 GB frente a los 16,34 GB del checkpoint BF16 original. El autor documenta una evaluacion de fidelidad respecto al BF16 (KL medio de 0,00262 y top-1 del 98,26 % sobre 15.840 posiciones) y advierte de que las pruebas se hicieron en el simulador ttsim de Blackhole, no en silicio real.

La licencia es Apache-2.0, heredada del modelo base de IBM, lo que permite uso comercial sin restricciones adicionales por parte del cuantizador. El soporte de idiomas no se declara en la informacion disponible, aunque la calibracion de GPTQ empleo texto en ingles y coreano (WikiText-2 y Wikipedia en coreano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), modelo base IBM Granite 3.3 8B Instruct |
| Parametros totales | 8.372.219.904 (8,37 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales de atencion (q, k, v, o) y MLP (gate, up, down) de las 40 capas; bf16 en LM head, embedding, normas y resto de tensores; 8,69 bits por peso de media |
| Idiomas soportados | no disponible (calibracion GPTQ en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tensores en bf16 alineados a la rejilla BFP8); incluye `quant4.json` con el formato de cada proyeccion y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de IBM, del que esta publicacion no aporta detalles de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO): esa informacion no esta disponible en los datos proporcionados. Lo que si documenta el autor es el proceso de cuantizacion: las proyecciones lineales de atencion y MLP de las 40 capas se redondearon a la rejilla `bfloat8_b` mediante GPTQ, con el exponente compartido de cada bloque fijado por el empaquetador de TT-NN. La calibracion uso 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resto de tensores (embedding, LM head atado al embedding, normas) permanece en bf16.

La innovacion tecnica no esta en el modelo sino en el formato: al almacenar los pesos ya alineados a la rejilla BFP8, TT-NN los empaqueta sin un segundo redondeo, lo que evita la perdida adicional que introduciria una conversion en tiempo de carga. El autor advierte de dos limitaciones de integracion: tt-transformers (tt-metal v0.81.1) no soporta Granite y lo carga como si fuera un modelo tipo Llama, ignorando los multiplicadores de embedding, atencion, residual y logits, con un PCC de 0,18 en un prefill de 2 capas; tt-forge (tt-xla) compila el codigo de transformers y aplica esos multiplicadores, pero no se ha probado aun con este checkpoint, y sus opciones `bfp_bf8` y `bfp_bf4` empaquetan en el layout [out, in] de PyTorch y vuelven a redondear los valores.

## Capacidades

- Generacion de texto conversacional e instructiva, heredada del modelo base Granite 3.3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de chat accesible via `apply_chat_template`).
- Codigo y matematicas: capacidades propias del modelo base; no se detallan en la informacion disponible.
- Tool calling y function calling: no confirmado en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no declaradas; la calibracion incluyo ingles y coreano.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso de uso principal y documentado. El modelo esta empaquetado para cargarse en Wormhole y Blackhole mediante TT-NN, con verificacion de que el empaquetado no altera ningun valor (`pack_tensix.py`, `verify_grid.py`).
- Inferencia conversacional en hardware de bajo consumo: con 8,87 GB empaquetados frente a 16,34 GB en BF16, permite servir un modelo de 8B en entornos con memoria limitada manteniendo una fidelidad alta respecto al original (KL medio de 0,00262).
- Validacion de pipelines de cuantizacion: util como referencia para comprobar que un empaquetado BFP8 reproduce exactamente los pesos redondeados, comparando con la salida de `ttnn.to_torch`.
- Prototipado en simulador: el autor lo probo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, lo que permite desarrollar integraciones antes de disponer de hardware.
- Evaluacion de degradacion por cuantizacion: sirve para medir la deriva respecto a BF16 en tareas cortas con comprobacion automatica (30 de 33 respuestas correctas frente a 29 de 33 del BF16).
- Sustitucion directa via transformers: el repositorio incluye un quickstart con `AutoModelForCausalLM` y `device_map="auto"`, por lo que puede usarse como checkpoint de generacion de texto en GPU convencional, aunque el beneficio de tamano solo se materializa en TT-NN.

## Benchmarks y rendimiento

Los unicos datos publicados miden la fidelidad respecto al checkpoint BF16, no el rendimiento en tareas:

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.3-8b-instruct) | 16 | 16,34 | 0 | 100 | 29 de 33 | - |
| **Este modelo (BFP8)** | 8,69 | 8,871 | 0,00262 | 98,26 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,33915 | 83,52 | 27 de 33 | 1 |

Las metricas de KL y top-1 cubren 15.840 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica. El Q4_K_M se genero con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor fija como criterio de aceptacion un KL medio maximo de 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; el modelo lo cumple con holgura (0,01 veces y 0 perdidas frente a 1). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 8,87 GB empaquetados en BFP8; el repositorio ocupa 16,7 GB porque los tensores se almacenan en bf16.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). Probado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no en hardware real.
- GPU convencionales: puede cargarse con transformers en bf16 (`dtype="bfloat16"`, `device_map="auto"`), lo que requiere del orden de 16-17 GB de VRAM; cabe en RTX 4090 (24 GB), A100 (40/80 GB) y H100.
- Consumer GPU: en bf16 cabe en RTX 4090 y en GPUs de 24 GB; en tarjetas de 16 GB requeriria cuantizacion adicional, no incluida en este repositorio.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; transformers para GPU; tt-forge (tt-xla) aun no probado con este checkpoint; tt-transformers no es compatible (sin soporte de Granite).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Granite-3.3-8b-instruct-Tensix-BFP8** | 8,37 B | no disponible | BFP8, 8,87 GB empaquetados | Apache-2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-3.3-8b-instruct (BF16) | 8,37 B | no disponible | BF16, 16,34 GB | Apache-2.0 | Hugging Face |
| Q4_K_M del mismo checkpoint (llama.cpp) | 8,37 B | no disponible | 4,84 bits por peso, 4,943 GB | Apache-2.0 (heredada) | Generado localmente con llama.cpp |

La comparacion relevante es de fidelidad y tamano, no de capacidad: frente a Q4_K_M, este modelo ocupa casi el doble pero reduce el KL medio en dos ordenes de magnitud (0,00262 frente a 0,33915) y no pierde ninguna respuesta correcta. Frente al BF16, ahorra un 45,7 % de espacio con una perdida de top-1 del 1,74 %. No se dispone de datos para comparar con otros modelos de 8B de la misma categoria en tareas estandar.

## Limitaciones y advertencias

- No probado en hardware Tensix real: las pruebas se hicieron en ttsim, el simulador de Blackhole; el comportamiento en Wormhole o en silicio no esta verificado.
- tt-transformers (tt-metal v0.81.1) no soporta Granite y produce resultados incorrectos (PCC 0,18 en un prefill de 2 capas) al ignorar los multiplicadores del modelo.
- tt-forge no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los pesos en el layout [out, in] de PyTorch.
- Los tensores se almacenan en bf16, de modo que el ahorro de espacio solo se materializa al empaquetar con TT-NN; en transformers el checkpoint ocupa 16,7 GB.
- La evaluacion mide fidelidad respecto a BF16, no calidad en tareas; no hay datos de MMLU, HumanEval ni GSM8K.
- Sesgos y alucinaciones: no documentados en la informacion proporcionada; se heredan los del modelo base de IBM.
- Idiomas: no declarados; la calibracion se limito a ingles y coreano, por lo que la fidelidad en otros idiomas no esta medida.
- Longitud de contexto: no disponible; conviene consultar la model card del modelo base antes de usarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el artefacto cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.3-8b-instruct-Tensix-BFP8/blob/main/LICENSE
