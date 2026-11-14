# Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4

## Resumen

Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo ornith-ai/Ornith-1.5-35B-A3B (arquitectura Qwen3.5 MoE, según el tag `qwen3_5_moe`) publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva el checkpoint completo, pero cuantiza las capas lineales del modelo de lenguaje a formato block-floating-point de 4 bits (`ttnn.bfloat4_b`, BFP4) mediante GPTQ, almacenando las matrices cuantizadas como valores bf16 sobre la rejilla BFP4.

El resultado es un export de aproximadamente 20,99 GB de pesos del modelo de lenguaje (frente a 69,32 GB en BF16), con un promedio de 4,84 bits por peso, lo que lo hace viable en memoria DRAM de dispositivos Tensix donde el BF16 no cabría. Tanto el router, el gate del shared expert, el LM head y los embeddings como los módulos de visión y MTP permanecen en bf16 sin cambios.

Es relevante ahora porque demuestra una ruta de despliegue de un MoE de ~36 000 millones de parámetros totales sobre hardware NPU no convencional (Tensix) con pérdida de calidad medida y acotada frente a BF16 y frente a un Q4_K_M de llama.cpp. La licencia MIT y el formato safetensors facilitan su integración, aunque el soporte práctico en el ecosistema está limitado al stack ttnn/tt-metal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal (DeltaNet) y capas de atención estándar; familia `qwen3_5_moe` |
| Parámetros totales | 35 951 822 704 (35,95 B) |
| Parámetros activos | 3 B (indicado por el sufijo A3B del modelo base; no se detalla el desglose en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales; bf16 en router, gate, LM head, embeddings, visión y MTP; promedio 4,84 bits por peso |
| Idiomas soportados | no disponible (la evaluación de KL incluye texto en inglés y coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`); export tensorial para tt-metal/ttnn |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Qwen3.5, con capas de atención lineal tipo DeltaNet combinadas con proyecciones de atención, expertos enrutados y shared experts. El export de Xylolabs no reentrena el modelo: aplica GPTQ (damping 0,1) con búsqueda de exponente por bloque (offsets -1 y 0) sobre las proyecciones de atención, DeltaNet, shared-expert y routed-expert, con la excepción de las proyecciones down de los expertos enrutados, que usan GPTQ simple con redondeo al más cercano (round-to-nearest) para expertos con tokens de calibración insuficientes. Las matrices cuantizadas se almacenan como bf16 sobre la rejilla BFP4 y las 20 790 matrices individuales empaquetan bit a bit.

La innovación principal es el formato block-floating-point de 4 bits nativo de Tensix (`bfloat4_b`), que comparte exponente por bloque y resulta más adecuado para el hardware Tensix que una cuantización entera clásica. El proceso de cuantización se verificó con ttnn 0.81.1 sobre ttsim (simulador de Blackhole) y con scripts de comprobación (`pack_tensix.py`, `verify_grid.py`) que confirman que ningún valor cambia tras el empaquetado. No se detalla en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de formato libre, con pipeline `text-generation` y clase `AutoModelForImageTextToText`.
- Entrada imagen-texto (`image-text-to-text`): el checkpoint incluye módulos de visión en bf16, aunque el autor indica que la visión no fue evaluada.
- Módulo MTP (multi-token prediction) presente en el checkpoint en bf16, no evaluado.
- Soporte de chat mediante `apply_chat_template`.
- Capacidades multilingües: no documentadas; la evaluación de fidelidad incluye inglés y coreano, pero no se declara una lista de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el export está empaquetado para `ttnn.bfloat4_b` y requiere unos 20,99 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers; encaja en escenarios donde el BF16 (69,32 GB) no cabría en la DRAM del dispositivo.
- Servicio de chat conversacional en infraestructura Tensix: el modelo conserva el checkpoint completo y la plantilla de chat, por lo que puede atender conversaciones multi-turno mediante `apply_chat_template` y generación autorregresiva estándar.
- Sustitución de cuantizaciones GGUF en pipelines con hardware Tenstorrent: ofrece una alternativa a Q4_K_M de llama.cpp con fidelidad medida (KL media 0,0870 frente a BF16, frente a 0,0792 de Q4_K_M) para equipos que ya operan sobre tt-metal.
- Evaluación y benchmarking de cuantización BFP4: sirve como referencia reproducible para medir el impacto de BFP4 con GPTQ en un MoE de ~36 B, con scripts de verificación bit a bit incluidos.
- Prototipado de asistentes con entrada de imagen: los módulos de visión están presentes en bf16, lo que permite experimentar con entradas imagen-texto aunque el autor no haya validado esa ruta.
- Investigación sobre decodificación multi-token: el módulo MTP incluido en bf16 permite estudiar estrategias de predicción especulativa o multi-token sobre el hardware Tensix.
- Inferencia en CPU para validación: el quickstart con Transformers 5.22.2 se comprobó en CPU, útil para pruebas funcionales y de integración antes de pasar al dispositivo.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Ornith-1.5-35B-A3B) | 16 | 69,32 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 4,84 | 20,991 | 0,0870 | 87,10 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 21,713 | 0,0792 | 87,63 | 31 de 33 | 0 |

Las métricas de KL y top-1 cubren 8 188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) como texto plano. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El autor fija como criterio de aceptación una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 1,10 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 0. El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tarea en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 20,99 GB solo para los pesos del modelo de lenguaje, más KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, generaciones Wormhole y Blackhole.
- Software: ttnn 0.81.1 (verificado en ttsim, el simulador de Blackhole); tt-metal y tt-forge como stack asociado, aunque el autor indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Inferencia en CPU: posible con Transformers 5.22.2 y `device_map="auto"` en bf16, validada en el quickstart.
- GPU consumer: no se documenta soporte ni VRAM estimada para GPU NVIDIA/AMD; el formato BFP4 está pensado para Tensix.
- Opciones de despliegue: ttnn/tt-metal sobre dispositivo Tensix; Transformers en CPU; llama.cpp solo como referencia comparativa (Q4_K_M generado desde el mismo checkpoint), no como formato de este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 35,95 B totales / 3 B activos | no disponible | BFP4 4,84 bits | MIT | Hugging Face, safetensors |
| Ornith-1.5-35B-A3B (BF16) | 35,95 B totales / 3 B activos | no disponible | BF16 | MIT | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 35,95 B totales / 3 B activos | no disponible | 4,89 bits | MIT | Generado localmente con llama.cpp v0.9.0 |

La comparativa se limita al propio modelo base y a su cuantización GGUF de referencia, ya que la información disponible no incluye otros modelos de la misma categoría. Frente a BF16, este export reduce el tamaño de 69,32 GB a 20,991 GB con una KL media de 0,0870 y un top-1 del 87,10 %. Frente a Q4_K_M, queda ligeramente por detrás en KL (0,0870 vs 0,0792) y top-1 (87,10 % vs 87,63 %), pero iguala en respuestas correctas (32 de 33) y en respuestas perdidas (0).

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; los módulos de visión y MTP permanecen en bf16 y no fueron evaluados, por lo que su comportamiento en producción no está validado.
- El soporte está restringido al stack Tenstorrent (ttnn/tt-metal); tt-transformers y tt-forge no se probaron con este checkpoint, lo que limita su uso fuera de Tensix.
- Las métricas publicadas miden fidelidad respecto a BF16 (KL y top-1 sobre 8 188 posiciones) y 33 prompts cortos; no sustituyen una evaluación de calidad de tarea ni cubren razonamiento, código o matemáticas.
- La evaluación de fidelidad se limita a inglés y coreano; no hay lista declarada de idiomas soportados ni validación en castellano.
- Riesgo de alucinación: no documentado específicamente para este export; aplican los riesgos del modelo base, no evaluados aquí.
- Sesgos: no documentados en la información disponible.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Restricciones de licencia: MIT, permite uso comercial; deben respetarse las condiciones del modelo base ornith-ai/Ornith-1.5-35B-A3B.
- El autor advierte que las cifras de evaluación miden cercanía a BF16 y no rendimiento en velocidad; no se publican datos de latencia ni throughput.
- El proceso de cuantización usó GPTQ con round-to-nearest en las proyecciones down de expertos con tokens de calibración insuficientes, lo que puede introducir mayor error en esos expertos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del export: https://huggingface.co/Xylolabs/Ornith-1.5-35B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
- Revisión del modelo base usada en la evaluación: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/tree/10fbf86fed7ecee4a061f8b499a618f46001cac1
