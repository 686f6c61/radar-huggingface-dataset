# Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP4

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen3-4B-Instruct-2507, publicada por Xylolabs, orientada especificamente a la inferencia en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer decoder-only de 4.411.424.256 parametros (4,4 mil millones) con licencia Apache 2.0. La particularidad de esta exportacion es que las capas lineales (proyecciones de atencion q, k, v, o y las capas MLP gate, up, down en las 36 capas del modelo) han sido cuantizadas a formato block-floating-point de 4 bits (`ttnn.bfloat4_b`, BFP4) mediante GPTQ, mientras que el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16.

El resultado es un checkpoint de aproximadamente 2,82 GB empaquetado (frente a los 8,04 GB del modelo BF16 original), con un promedio de 5,61 bits por peso. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, lo que permite que TT-NN los empaquete sin alterar sus valores. El modelo esta pensado para desplegarse en hardware Tenstorrent, no en GPU convencionales, y su relevancia radica en demostrar que modelos de la familia Qwen3 pueden ejecutarse en NPUs Tensix con una degradacion de calidad controlada (KL medio de 0,04267 frente a BF16 y 90,63% de top-1).

La model card indica explicitamente que tt-transformers y tt-forge no se han ejecutado con este checkpoint, y que las verificaciones se hicieron con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent. No se reportan datos de velocidad ni de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), capas lineales cuantizadas a BFP4 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones q/k/v/o y MLP gate/up/down; bf16 en el resto; 5,61 bits por peso de media; tambien empaquetable exactamente en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (la calibracion uso texto en ingles y coreano: WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers), con `quant4.json` que lista el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only de 4,4 mil millones de parametros, parte de la familia Qwen3 descrita en el informe tecnico arXiv:2505.09388. Esta variante concreta no ha sido reentrenada: se trata de un proceso de cuantizacion post-entrenamiento aplicado sobre el checkpoint original. Las 36 capas del modelo conservan su estructura original; lo unico que cambia es el formato de almacenamiento de las matrices de proyeccion.

La cuantizacion se realizo con GPTQ combinado con una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos cuantizados se guardan como bf16 sobre la rejilla BFP4, de modo que TT-NN puede empaquetarlos sin modificar sus valores; la model card incluye un script (`pack_tensix.py`) que verifica matriz por matriz que ningun valor cambia tras el empaquetado, y otro (`verify_grid.py`) que valida la rejilla solo con torch. No se documentan innovaciones de decodificacion especulativa, atencion lineal ni mecanismos equivalentes en esta exportacion.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del Qwen3-4B-Instruct-2507, orientado a instrucciones y dialogos multi-turno mediante plantilla de chat.
- Razonamiento y matematicas: el modelo base esta entrenado para tareas de razonamiento; esta version preserva dichas capacidades con una perdida medida de 1 respuesta sobre 33 en la evaluacion del autor.
- Generacion de codigo: capacidad heredada del modelo base, sujeta a la misma degradacion por cuantizacion.
- Soporte multilingue: no disponible de forma explicita; la calibracion cubre ingles y coreano, pero no se documentan los idiomas finales soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponible (modelo exclusivamente de texto).
- Ejecucion en NPU Tensix: capacidad especifica de esta exportacion, con empaquetado nativo en `ttnn.bfloat4_b` y `ttnn.bfloat8_b`.

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el checkpoint esta disenado para cargarse en NPUs Tensix mediante TT-NN, ocupando unos 2,82 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers. Es adecuado cuando se dispone de aceleradores Tenstorrent y se quiere evitar el coste de memoria del BF16.
- Inferencia de bajo consumo de memoria en entornos embebidos o de borde con NPU Tensix: la reduccion de 8,04 GB a 2,82 GB permite ajustar el modelo en dispositivos con DRAM limitada, siempre que el runtime TT-NN este disponible.
- Experimentacion con cuantizacion BFP4: util para investigadores que quieran comparar el comportamiento de BFP4 frente a Q4_K_M en tareas de generacion, usando la tabla de evaluacion del autor como referencia.
- Validacion de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad del empaquetado antes de desplegar en produccion, lo que resulta util en CI/CD de hardware.
- Chatbot ligero en ingles o coreano: la calibracion cubre ambos idiomas y la evaluacion mide KL y top-1 sobre WikiText-2 y Wikipedia coreana, por lo que es razonable para prototipos conversacionales en esos idiomas.
- Generacion de texto asistida en entornos con restricciones de memoria: para tareas de resumen, redaccion o respuesta a preguntas donde el coste de memoria prima sobre la fidelidad absoluta al BF16, con una perdida medida de 1 respuesta sobre 33.

## Benchmarks y rendimiento

Los datos disponibles miden la cercania al modelo BF16, no la calidad absoluta en tareas.

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Instruct-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 5,61 | 2,822 | 0,04267 | 90,63 | 29 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04194 | 91,04 | 30 de 33 | 1 |

KL y top-1 se calculan sobre 16.272 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia coreana), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica. El criterio del autor era un KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; el modelo lo cumple (1,017 veces el KL de Q4_K_M y 1 respuesta perdida frente a 1). No se reportan datos de velocidad, latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 2,82 GB para los pesos del modelo de lenguaje en BFP4, mas espacio adicional para KV cache y buffers. El BF16 equivalente ocupa 8,04 GB.
- GPU recomendadas: no disponible; el modelo esta orientado a NPUs Tenstorrent Tensix (Wormhole, Blackhole), no a GPU convencionales.
- Compatibilidad con GPU de consumo: no disponible; la model card no documenta ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado sobre ttsim, el simulador Blackhole de Tenstorrent); transformers con `AutoModelForCausalLM` para carga en bf16. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B-Instruct-2507 BFP4) | 4,41 mil millones | no disponible | KL 0,04267; top-1 90,63%; 29/33 respuestas correctas | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-4B-Instruct-2507 (BF16) | 4,41 mil millones | no disponible | KL 0; top-1 100%; 31/33 respuestas correctas | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,41 mil millones | no disponible | KL 0,04194; top-1 91,04%; 30/33 respuestas correctas | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparativa se limita a las tres variantes documentadas en la model card; no se dispone de datos frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; el modelo base Qwen3 puede heredar sesgos de sus datos de entrenamiento, pero no se documentan.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion introduce una degradacion adicional medida (KL 0,04267 frente a BF16 y 1 respuesta perdida sobre 33).
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la informacion disponible; los idiomas soportados no estan documentados, aunque la calibracion cubre ingles y coreano.
- Restricciones de licencia: Apache 2.0, igual que el modelo base, con cambios listados en `NOTICE`; se permite uso comercial segun los terminos de dicha licencia.
- Caveats para produccion: el checkpoint esta pensado para hardware Tenstorrent Tensix; tt-transformers y tt-forge no se han probado con el. Las verificaciones se hicieron sobre el simulador ttsim, no sobre silicio real. No se reportan datos de velocidad ni latencia, por lo que no se puede estimar throughput en produccion. El autor declara que el modelo se ofrece tal cual, sin garantia, y no esta afiliado ni respaldado por Tenstorrent.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Informe tecnico Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
