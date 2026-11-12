# Xylolabs/gemma-4-31B-Tensix-BFP8

## Resumen

Gemma-4-31B-Tensix-BFP8 es una cuantizacion del modelo multimodal google/gemma-4-31B publicada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo toma el checkpoint base de Gemma 4 (32.682 millones de parametros, pipeline image-text-to-text) y cuantiza sus capas lineales del transformer de lenguaje al formato block-floating-point `ttnn.bfloat8_b` (BFP8) mediante GPTQ, manteniendo el resto de tensores (embeddings, normas, torre de vision y LM head) en bf16.

La relevancia de esta ficha radica en que es un ejemplo de cuantizacion hardware-aware: no se busca solo reducir el peso, sino que los pesos ya esten alineados con la rejilla BFP8 que consume TT-NN, de modo que el empaquetado en la NPU no introduzca error adicional. El resultado ocupa 33,94 GB empaquetados con una media de 8,85 bits por peso, frente a los 61,39 GB en BF16 del modelo base, con una divergencia muy baja respecto al original (KL medio de 0,00154 y top-1 del 98,06 %).

Es importante subrayar que se trata de un checkpoint preentrenado (no ajustado para chat, sin plantilla de conversacion) y que su validacion se ha realizado sobre simulador (ttsim de Blackhole con ttnn 0.81.1), no sobre hardware fisico. La model card declara explicitamente que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de google/gemma-4-31B; capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en atencion q/k/o/v y MLP gate/up/down; bf16 en embeddings, normas, LM head y torre de vision |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8), mas `quant4.json` e indice de safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-31B, un transformer multimodal con torre de vision (`vision_tower`, `embed_vision`) y un modelo de lenguaje de 60 capas segun la tabla de formatos de la model card. La intervencion de Xylolabs se limita al modelo de lenguaje: cuantiza con GPTQ las proyecciones de atencion (q, k, o en 60 capas; v en 50 capas) y las proyecciones MLP (gate, up, down en 60 capas) al formato `bfloat8_b`, que emplea 8,5 bits por peso gracias a un exponente compartido por bloque. El resto de tensores permanece en bf16, igual que en el modelo base.

El calibrado de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. Los pesos se publican en bf16 pero con cada valor ya situado en la rejilla BFP8, de forma que TT-NN los empaqueta sin transformacion adicional. No se ha realizado ningun ajuste fino posterior ni RLHF/DPO sobre este checkpoint: es el modelo preentrenado, que continua texto y carece de plantilla de chat. Solo se cuantizo y evaluo el modelo de lenguaje; la parte de vision se conserva intacta en bf16.

## Capacidades

- Generacion de texto y continuacion de texto en modo completion (sin plantilla de chat).
- Procesamiento multimodal image-text-to-text por herencia de la arquitectura del modelo base (torre de vision en bf16).
- Razonamiento y conocimiento general derivados de Gemma 4, sujetos a la fidelidad de la cuantizacion (top-1 del 98,06 % respecto a BF16 en la evaluacion realizada).
- Soporte multilingue en la medida en que lo ofrezca el modelo base; la evaluacion publicada cubre ingles y coreano.
- Ejecucion en NPU Tensix (Wormhole, Blackhole) mediante TT-NN con el formato `bfloat8_b`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent: servir el modelo en aceleradores Wormhole o Blackhole aprovechando que los pesos ya estan en la rejilla BFP8 que consume TT-NN, evitando conversion en tiempo de carga y reduciendo el espacio en DRAM a 33,94 GB.
- Sustitucion de BF16 en entornos con memoria limitada: cuando el modelo base de 61,39 GB no cabe en la memoria disponible del acelerador, esta version reduce el peso a practicamente la mitad con una divergencia de distribucion muy baja (KL 0,00154).
- Validacion de pipelines de cuantizacion: usar `pack_tensix.py` y `verify_grid.py` para comprobar que cada matriz se empaqueta sin cambios de valor, como paso de control de calidad en una cadena de publicacion de modelos.
- Investigacion sobre cuantizacion block-floating-point: comparar el comportamiento de BFP8 con GPTQ frente a esquemas de 4 bits (por ejemplo Q4_K_M) en terminos de KL y top-1 sobre el mismo checkpoint.
- Generacion de texto en modo completion: tareas de continuacion, resumen o reescritura por lotes donde no se requiere interfaz conversacional, usando el modelo tal cual con `AutoModelForCausalLM`.
- Experimentacion multimodal en simulador: probar cargas de image-text-to-text en ttsim antes de disponer de hardware, verificando el empaquetado de las capas de lenguaje mientras la torre de vision permanece en bf16.
- Analisis de textos en ingles y coreano: la calibracion y la evaluacion cubren ambos idiomas, por lo que es adecuado para tareas de procesamiento de lenguaje en esos idiomas dentro de los margenes de fidelidad medidos.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al modelo BF16, no la calidad absoluta en tareas. La evaluacion cubre 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano) y 28 prompts cortos con comprobacion automatica en formato completion, 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-31B) | 16 | 61,39 | 0 | 100 | 27 de 28 | - |
| **Este modelo (BFP8)** | 8,85 | 33,938 | 0,00154 | 98,06 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 18,687 | 0,03187 | 93,01 | 28 de 28 | 0 |

El criterio de aceptacion declarado por el autor era un KL medio como maximo 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional; el modelo lo supera ampliamente (0,05 veces el KL de Q4_K_M y 0 respuestas perdidas). No se han medido velocidades en dispositivo ni resultados de benchmarks de tareas como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 33,94 GB empaquetados en BFP8 para el conjunto de pesos; el repo completo ocupa 65,4 GB porque los tensores se almacenan en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante TT-NN.
- Validacion: realizada con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se ha probado en hardware fisico segun la model card.
- GPU consumer: no disponible; el checkpoint esta pensado para Tensix, aunque al ser safetensors en bf16 podria cargarse en transformers con `device_map="auto"` si la memoria lo permite (el modelo base en bf16 requiere del orden de 61 GB mas overhead).
- Opciones de despliegue: TT-NN con `ttnn.as_tensor` y `ttnn.bfloat8_b`; transformers (`AutoModelForCausalLM`) para inferencia generica; tt-transformers y tt-forge no han sido probados con este checkpoint.
- Latencia y throughput: no disponibles; no se midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma-4-31B-Tensix-BFP8 (este) | 32,68 B | no disponible | BFP8 (8,85 bits/peso) | 33,94 GB | apache-2.0 | Hugging Face |
| google/gemma-4-31B (BF16) | 32,68 B | no disponible | bf16 (16 bits/peso) | 61,39 GB | apache-2.0 | Hugging Face |
| Gemma-4-31B Q4_K_M (llama.cpp) | 32,68 B | no disponible | 4,87 bits/peso | 18,687 GB | apache-2.0 (derivada) | Generado por el autor para comparar |

La comparativa se limita a variantes del mismo checkpoint base porque la informacion proporcionada no incluye otros modelos de la misma categoria. Frente a BF16, este modelo reduce el peso un 44,7 % con una perdida de top-1 de 1,94 puntos; frente a Q4_K_M, ocupa casi el doble pero mantiene un KL 20 veces menor (0,00154 frente a 0,03187) y un top-1 superior (98,06 % frente a 93,01 %).

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat: no esta ajustado para instrucciones ni conversacion; usarlo como asistente requiere prompts en formato completion.
- Solo se ha cuantizado y evaluado el modelo de lenguaje; la calidad de la parte de vision no se ha medido en esta version.
- La validacion se hizo en simulador (ttsim), no en hardware Tensix real; el rendimiento y la correccion en dispositivo no estan verificados.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que su integracion con esos frameworks no esta garantizada.
- Los benchmarks publicados miden fidelidad respecto a BF16 (KL, top-1), no calidad en tareas; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- No hay informacion sobre sesgos, riesgo de alucinacion especifico de esta cuantizacion ni lista completa de idiomas soportados.
- La licencia es apache-2.0 segun la model card del modelo base, pero el repositorio del modelo base no incluye fichero LICENSE; el autor aporta el texto estandar y un NOTICE con los cambios.
- El modelo se distribuye "as is", sin garantia, y no esta afiliado ni respaldado por Tenstorrent.
- El repo ocupa 65,4 GB porque los tensores se guardan en bf16 aunque sus valores ya esten en la rejilla BFP8; el ahorro de espacio se materializa al empaquetar en TT-NN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (Gemma 4 Technical Report): arXiv:2607.02770
