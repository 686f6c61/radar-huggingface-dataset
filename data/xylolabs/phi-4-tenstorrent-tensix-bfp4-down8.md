# Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-Down8

## Resumen

Phi-4-Tenstorrent-Tensix-BFP4-Down8 es una exportación cuantizada del modelo microsoft/phi-4 (14.659.507.200 parámetros) realizada por Xylolabs, orientada específicamente a la inferencia en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint del mismo phi-4 con sus capas lineales comprimidas a formatos de coma flotante por bloques propios del hardware de Tenstorrent: `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) para las proyecciones de atención y las proyecciones gate/up del MLP, y `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) para la proyección down del MLP.

El problema que resuelve es la brecha entre el modelo original en BF16 (29,32 GB de pesos) y la memoria de dispositivo disponible en las tarjetas Tensix, que no pueden consumir directamente checkpoints en safetensors bf16 ni formatos GGUF de llama.cpp. Este export empaqueta los pesos ya "pre-cuantizados" sobre la retícula BFP del hardware, de modo que TT-NN los carga sin transformar sus valores, reduciendo el peso del modelo a 11,56 GB (6,31 bits por peso de media).

Es relevante ahora porque Tenstorrent está desplegando aceleradores Wormhole y Blackhole en entornos de inferencia de coste competitivo, y este tipo de export permite ejecutar un modelo de 14B con calidad cercana al BF16 en ese hardware. La ficha se centra en los datos verificables del repositorio: licencia MIT, idioma inglés declarado, formato Llama (`LlamaForCausalLM`) y ausencia de benchmarks de tareas (solo métricas de fidelidad respecto al BF16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: microsoft/phi-4); checkpoint en layout Llama (`LlamaForCausalLM`) con matrices q, k, v y gate-up separadas |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de phi-4; no confirmada en el repo) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en atención q/k/v/o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en MLP down; bf16 en LM head, embeddings y normas. Media: 6,31 bits/peso |
| Idiomas soportados | Inglés (declarado en la model card; la calibración incluyó texto coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (29,3 GB de repo; 11,56 GB empaquetados en dispositivo), con `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El modelo base es phi-4, un transformer decoder-only denso de 14,66 mil millones de parámetros desarrollado por Microsoft. Este repositorio no reentrena ni ajusta el modelo: aplica cuantización post-entrenamiento sobre las capas lineales. Las 40 capas del modelo tienen sus proyecciones de atención (q, k, v, o) y las proyecciones gate y up del MLP cuantizadas a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. La proyección down del MLP de las 40 capas se cuantiza a BFP8 mediante redondeo al más cercano (round to nearest). El resto de tensores (LM head, embeddings, normas) permanece en bf16.

La innovación técnica clave es el empaquetado nativo: las matrices cuantizadas se almacenan como valores bf16 situados sobre la retícula BFP4 o BFP8, de forma que TT-NN las empaqueta sin alterar sus valores. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado en dispositivo reproduce exactamente los valores del checkpoint. El checkpoint está en layout Llama, con las matrices fusionadas q/k/v y gate-up de phi-4 separadas conservando los mismos valores. No se documenta en la información disponible ningún proceso de RLHF, DPO ni datos de preentrenamiento adicionales; esos detalles corresponden al modelo base phi-4.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`) soportada por el tokenizador.
- Razonamiento y matemáticas heredados de phi-4 (no se detallan capacidades específicas en el repo de este export).
- Generación de código: capacidad heredada del modelo base, no verificada de forma independiente en este checkpoint.
- Inferencia en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos empaquetados directamente en DRAM de dispositivo.
- Compatibilidad con la librería `transformers` para carga en bf16 y ejecución en GPU/CPU convencional (`device_map="auto"`).
- Tool calling / function calling: no documentado en la información disponible para este export.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible para este export.
- Capacidades multimodales, de audio o modo "thinking": no disponibles en este export (phi-4 es un modelo de texto).
- Idiomas: inglés declarado; la calibración de cuantización incluyó coreano, pero no se declara soporte oficial de coreano.

## Casos de uso

- Despliegue de un LLM de 14B en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, ocupando 11,56 GB de DRAM de dispositivo para los pesos, más espacio para KV cache y buffers. Es el caso de uso principal y el único validado por el autor (probado en el simulador ttsim con ttnn 0.81.1).
- Sustitución de phi-4 en BF16 en infraestructura Tensix: al reducir el peso de 29,32 GB a 11,56 GB, permite ejecutar el modelo en tarjetas con menos DRAM, manteniendo una fidelidad alta respecto al BF16 (KL media de 0,02224 y top-1 del 92,90 % sobre 16.280 posiciones).
- Generación de texto conversacional en inglés: con la plantilla de chat del tokenizador, adecuado para asistentes de texto de un solo turno o multi-turno, siempre que la ventana de contexto configurada en el runtime Tensix sea suficiente.
- Evaluación y benchmarking de cuantización BFP: útil para investigadores que comparan la degradación de BFP4/BFP8 frente a GGUF Q4_K_M (KL media de 0,0180 y top-1 del 93,65 % en este último), usando los scripts de verificación incluidos.
- Prototipado en GPU convencional: aunque el objetivo es Tensix, el checkpoint carga con `transformers` en bf16 y `device_map="auto"`, lo que permite validar pipelines antes de portarlos a TT-NN.
- Investigación sobre formatos de coma flotante por bloques: el repo documenta el mapeo tensor a tensor en `quant4.json`, lo que facilita estudios sobre el impacto de BFP4 en atención frente a MLP.
- Integración en pipelines de generación con `text-generation-inference`: el repo declara compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo vía API en entornos estándar.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad respecto al BF16, no de calidad de tarea. Se reproducen a continuación:

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | 29 de 33 | - |
| Este modelo (BFP4/BFP8) | 6,31 | 11,559 | 0,02224 | 92,90 | 29 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,0180 | 93,65 | 29 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.280 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas son prompts cortos con verificación automática. El autor fija como criterio de aceptación una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; este export cumple con 1,24 veces la KL de Q4_K_M y 0 respuestas perdidas. No se publican resultados de MMLU, HumanEval, GSM8K ni latencia/throughput. El autor indica explícitamente que estas cifras miden cercanía al BF16, no calidad de tarea.

## Requisitos de hardware

- VRAM/DRAM de dispositivo: 11,56 GB solo para los pesos del modelo en Tensix, más espacio para KV cache y buffers (no cuantificado en la información disponible).
- GPU recomendadas para Tensix: aceleradores Tenstorrent Wormhole y Blackhole. La verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole.
- GPU convencionales: el checkpoint en bf16 ocupa 29,32 GB, por lo que requiere GPUs con al menos 32 GB (A100 40/80 GB, H100, L40S) o descarga parcial con `device_map="auto"`. No se documenta una ruta de cuantización adicional para GPU de consumo.
- GPU de consumo: no cabe en tarjetas de 24 GB en bf16; no se proporcionan pesos GGUF ni otras cuantizaciones en este repo.
- Opciones de despliegue: TT-NN (tt-metal) en Tensix; `transformers` con `AutoModelForCausalLM` en bf16; `text-generation-inference` (declarado compatible con endpoints). No se mencionan vLLM, llama.cpp ni Ollama para este checkpoint.
- Latencia y throughput: no disponibles. El autor indica explícitamente que no se reportan velocidades.
- Nota: tt-transformers y tt-forge no se probaron con este checkpoint según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 14,66B | No disponible | BFP4/BFP8 para Tensix; 6,31 bits/peso; 11,56 GB | MIT | Hugging Face, 38 descargas |
| microsoft/phi-4 (BF16) | 14,66B | No disponible en esta ficha | BF16; 29,32 GB | MIT | Hugging Face (modelo base) |
| phi-4 Q4_K_M (llama.cpp) | 14,66B | No disponible en esta ficha | GGUF Q4_K_M; 4,94 bits/peso; 9,059 GB | MIT (derivado) | Generado por el autor con llama.cpp v0.9.0 |

La comparación con alternativas de otros fabricantes (por ejemplo, Qwen o Llama de tamaño similar) no está disponible en la información proporcionada. La comparativa relevante aquí es de formatos: este export sacrifica algo de compresión frente a Q4_K_M (6,31 frente a 4,94 bits/peso) a cambio de empaquetado nativo en Tensix, con una KL ligeramente peor (0,02224 frente a 0,0180) pero sin respuestas perdidas en el conjunto de 33 prompts.

## Limitaciones y advertencias

- Solo se declara inglés; el soporte multilingüe no está garantizado aunque la calibración incluyera coreano.
- Riesgo de alucinación inherente al modelo base phi-4; no se han publicado evaluaciones de veracidad para este export.
- La cuantización BFP4 en atención y MLP puede degradar tareas sensibles a precisión; las métricas publicadas miden fidelidad al BF16, no calidad de tarea.
- El checkpoint está diseñado para Tensix; en GPU convencional solo carga en bf16 (29,32 GB), sin ruta documentada de menor precisión.
- tt-transformers y tt-forge no se han probado con este checkpoint, lo que limita las opciones de serving en el ecosistema Tenstorrent.
- No se documentan tool calling, agentes ni modo de razonamiento extendido para este export.
- Licencia MIT, igual que el modelo base, lo que permite uso comercial; el autor incluye un archivo `NOTICE` con los cambios. Los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0.
- El modelo se distribuye "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent ni por Microsoft.
- No se publican datos de latencia, throughput ni consumo energético en Tensix, lo que impide estimar coste operativo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/phi-4-Tenstorrent-Tensix-BFP4-Down8/blob/main/LICENSE
