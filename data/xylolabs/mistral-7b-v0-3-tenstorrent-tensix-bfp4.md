# Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4

## Resumen

Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo base mistralai/Mistral-7B-v0.3, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only del original, con 7.248.023.552 parámetros, pero sustituye las proyecciones lineales de atención y MLP por matrices cuantizadas a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ.

La relevancia de esta ficha no reside en una mejora de capacidades respecto al modelo base, sino en el formato de despliegue: reduce el peso de las matrices cuantizadas a 4,5 bits por peso (4,93 bits de media, 4,46 GB empaquetados) y garantiza que TT-NN pueda empaquetar los tensores sin alterar sus valores, ya que las matrices se almacenan como bf16 sobre la rejilla BFP4. Es un artefacto pensado para hardware NPU de Tenstorrent, no para GPU convencional.

El checkpoint es el modelo preentrenado, sin plantilla de chat y sin ajuste por instrucciones: continúa texto. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B v0.3), proyecciones lineales cuantizadas a BFP4 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-v0.3 admite 32.768 tokens, segun el modelo base) |
| Tipos de cuantizacion | bfloat4_b (BFP4, 4,5 bits por peso) en q, k, v, o, gate, up, down de las 32 capas; bf16 en LM head, embeddings, normas y resto de tensores; 4,93 bits de media |
| Idiomas soportados | no disponibles (evaluado en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), con `quant4.json` que describe el formato de cada proyeccion |

## Arquitectura y entrenamiento

La arquitectura es la del Mistral-7B-v0.3 original: transformer decoder-only con 32 capas. La modificación de Xylolabs afecta exclusivamente a las proyecciones lineales de atención (q, k, v, o) y del bloque MLP (gate, up, down) en las 32 capas, que se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque. El resto de tensores (LM head, embeddings, normas) permanece en bf16, igual que en el modelo base.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin modificar sus valores; el autor verifica esta propiedad con `pack_tensix.py` y `verify_grid.py`, y comprueba que los mismos valores también se empaquetan exactamente en `ttnn.bfloat8_b`. No se documenta entrenamiento adicional, RLHF ni DPO: es una transformación de pesos del checkpoint preentrenado. La verificación en hardware se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto autoregresiva y continuación de texto (modelo preentrenado, sin plantilla de chat).
- Razonamiento y conocimiento general heredados de Mistral-7B-v0.3.
- Generación de código y matemáticas, en la medida en que lo soporta el modelo base.
- Capacidades multilingües del modelo base (la evaluación de la cuantización incluye inglés y coreano).
- No se documenta soporte de tool calling ni function calling específico en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- No dispone de modo thinking, visión ni audio.
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP4.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está diseñado para cargarse en Wormhole o Blackhole con TT-NN, ocupando unos 4,46 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más KV cache y buffers.
- Inferencia de bajo consumo en nodos con NPU: al reducir el peso de las matrices cuantizadas a 4,5 bits, permite servir Mistral-7B en dispositivos Tensix con menor huella de DRAM que la versión bf16 (14,5 GB).
- Generación de texto por lotes en entornos de investigación: el modelo continúa texto y puede usarse para tareas de completion, resumen o extracción sobre corpus en inglés y coreano, idiomas empleados en la calibración y evaluación.
- Evaluación de técnicas de cuantización BFP4: sirve como referencia reproducible para comparar la fidelidad de BFP4 frente a Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas.
- Prototipado en simulador: el autor valida el empaquetado con ttsim (simulador de Blackhole), lo que permite desarrollar y depurar pipelines TT-NN sin hardware físico.
- Integración en pipelines de transformers: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse como checkpoint de referencia para comparar salidas entre GPU y NPU.
- Base para ajuste fino posterior: al ser un checkpoint preentrenado con licencia Apache 2.0, puede servir de punto de partida para tareas downstream, aunque la cuantización BFP4 limita la precisión disponible para entrenamiento.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (mistralai/Mistral-7B-v0.3) | 16 | 14,50 | 0 | 100 | 20 de 28 | - |
| Este modelo (BFP4) | 4,93 | 4,463 | 0,01882 | 92,72 | 19 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,01285 | 94,05 | 20 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completion y con 3 ejemplos (3-shot). "Perdidas" indica respuestas correctas en BF16 que aquí son incorrectas o están rotas; los empates cercanos no se contabilizan. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El criterio del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida más; el resultado fue 1,46 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0. Estas cifras miden cercanía a BF16, no calidad de tarea; no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,46 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, familias Wormhole y Blackhole.
- Verificación realizada con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se probó en silicio físico según la información disponible.
- GPU convencionales: no es el destino del checkpoint. Puede cargarse con transformers en bf16 (`dtype="bfloat16"`, `device_map="auto"`), pero en ese caso los pesos cuantizados se materializan como bf16 y se pierde la ventaja de memoria.
- Opciones de despliegue: TT-NN (ttnn) para Tensix; transformers para carga y pruebas. tt-transformers y tt-forge no se ejecutaron con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 7,25 B | no disponible | BFP4 (4,93 bits medios) | 0,01882 | Apache 2.0 | Hugging Face, 54 descargas |
| mistralai/Mistral-7B-v0.3 (BF16) | 7,25 B | 32.768 (modelo base) | bf16 | 0 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 7,25 B | 32.768 (modelo base) | Q4_K_M (4,83 bits) | 0,01285 | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparativa relevante es frente a Q4_K_M, que obtiene mejor KL y top-1 pero no está optimizado para el empaquetado nativo de TT-NN. Frente al BF16, este modelo sacrifica fidelidad (KL 0,01882, top-1 92,72 %) a cambio de reducir el tamaño de 14,50 GB a 4,463 GB.

## Limitaciones y advertencias

- Es un modelo preentrenado: no tiene plantilla de chat ni ajuste por instrucciones; no debe usarse directamente como asistente conversacional sin ajuste posterior.
- La cuantización BFP4 introduce degradación medible: KL medio de 0,01882 frente a BF16 y top-1 del 92,72 % en la evaluación del autor.
- La evaluación se limita a 8.184 posiciones de inglés y coreano y a 28 prompts cortos; no cubre otras lenguas ni tareas largas.
- El checkpoint está pensado para hardware Tenstorrent; en GPU convencional se pierde la ventaja de memoria y el rendimiento no está caracterizado.
- No se ejecutó con tt-transformers ni tt-forge, por lo que la integración con esos stacks no está validada.
- No se reportan datos de velocidad, latencia ni throughput.
- Riesgo de alucinación y sesgos heredados del modelo base Mistral-7B-v0.3, no evaluados en esta ficha.
- Licencia Apache 2.0, apta para uso comercial, pero el repositorio del modelo base no incluye fichero LICENSE; el autor incluye el texto estándar y un NOTICE con los cambios.
- El autor no está afiliado ni respaldado por Tenstorrent; se ofrece tal cual, sin garantía.
- El modelo base no incluye entrada de cita en su model card; se recomienda citar mistralai/Mistral-7B-v0.3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
