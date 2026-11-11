# Xylolabs/granite-4.2-8b-Tensix-BFP8

## Resumen

Xylolabs/granite-4.2-8b-Tensix-BFP8 es una cuantización del modelo ibm-granite/granite-4.2-8b de IBM, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa del original, con 8.791.592.960 parámetros totales, y aplica GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) de TT-NN a las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de sus 40 capas.

La particularidad del checkpoint es que, aunque los ficheros se almacenan en bf16, cada valor ya está redondeado a la rejilla BFP8, de modo que el empaquetador de TT-NN puede cargarlos sin volver a redondear. El resultado son 9,20 bits por peso de media y 10,11 GB empaquetados, frente a los 17,58 GB del modelo en BF16, con una divergencia media de KL de 0,00487 respecto al original.

El modelo es relevante porque demuestra una vía práctica de cuantización hardware-aware para el ecosistema Tenstorrent, un stack emergente de aceleradores de IA de código abierto. La licencia Apache 2.0 y el soporte de 12 idiomas lo hacen apto para uso comercial, aunque el autor advierte que las pruebas se realizaron sobre el simulador `ttsim` y no sobre hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Granite 4.2), con multiplicador de atención propio (1/128) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones q/k/v/o y gate/up/down; bf16 en LM head, embeddings, normas y resto de tensores; media de 9,20 bits por peso |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 ya alineados a la rejilla BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de IBM perteneciente a la familia Granite 4.2, con 40 capas y 8,79 mil millones de parámetros. Una diferencia técnica relevante frente a Llama es el multiplicador de atención: Granite emplea 1/128 en lugar de 1/√128, lo que provoca que cargadores genéricos tipo Llama no reproduzcan fielmente el comportamiento del modelo.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b` de TT-NN, calibrando con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El exponente compartido de cada bloque es el que utiliza el propio empaquetador de Tenstorrent. No se realizó entrenamiento adicional ni ajuste fino: es una conversión de pesos del checkpoint original `ibm-granite/granite-4.2-8b` (revisión a7042144). El autor no documenta en la información disponible detalles sobre el dataset de preentrenamiento del modelo base ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, heredadas del modelo base Granite 4.2.
- Razonamiento y respuesta a preguntas de conocimiento general (el modelo responde correctamente 28 de 33 preguntas cortas en la evaluación del autor).
- Soporte multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Compatible con el pipeline `text-generation` de transformers y con `apply_chat_template` para formato conversacional.
- Ejecución en NPU Tensix mediante TT-NN (`ttnn.bfloat8_b`), con empaquetado directo sin re-redondeo.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse directamente en TT-NN como `bfloat8_b`, reduciendo el uso de DRAM a 10,11 GB empaquetados frente a 17,58 GB en BF16 y evitando el coste de recuantizar en el dispositivo.
- Servicio de chat multilingüe: al cubrir 12 idiomas y soportar el chat template de transformers, puede emplearse como backend conversacional para usuarios en español, alemán, francés, japonés o coreano sin necesidad de modelos separados por idioma.
- Evaluación y desarrollo de kernels TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada coincide bit a bit con el peso original, lo que lo convierte en un banco de pruebas para el pipeline de empaquetado de Tenstorrent.
- Generación de texto en entornos con restricciones de memoria: con 10,11 GB empaquetados y licencia Apache 2.0, es viable en placas con DRAM limitada donde el BF16 de 17,58 GB no cabría.
- Investigación sobre cuantización hardware-aware: sirve como referencia para estudiar el impacto de redondear a la rejilla BFP8 con GPTQ, comparando métricas de KL y top-1 frente a BF16 y frente a Q4_K_M de llama.cpp.
- Prototipado de asistentes conversacionales en producción: la licencia Apache 2.0 permite uso comercial y modificación, y el formato safetensors es compatible con el ecosistema transformers estándar para pruebas en CPU/GPU antes de portar a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-8b) | 16 | 17,58 | 0 | 100 | 28 de 33 | - |
| **Este modelo (BFP8)** | 9,20 | 10,112 | 0,00487 | 97,82 | 28 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,86 | 5,348 | 0,14751 | 85,64 | 28 de 33 | 3 |

Las métricas de KL y top-1 se calculan sobre 16.216 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con chat template. Las 33 respuestas corresponden a prompts cortos con comprobación automática. El autor advierte que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se midió velocidad en dispositivo. El criterio de aceptación fijado (KL media ≤ 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más) se cumplió con holgura: 0,03 veces la KL y 0 respuestas perdidas frente a 3.

## Requisitos de hardware

- VRAM/DRAM estimada: 10,11 GB empaquetados en BFP8; el repo completo ocupa 17,6 GB por incluir tensores en bf16.
- Aceleradores objetivo: NPU Tenstorrent Tensix Wormhole y Blackhole, con TT-NN 0.81.1.
- Pruebas realizadas sobre `ttsim`, el simulador de Blackhole de Tenstorrent; el autor indica explícitamente que no se ha probado en hardware real.
- En GPU convencional puede cargarse con `transformers` en bf16 (`dtype="bfloat16"`, `device_map="auto"`), requiriendo del orden de 18 GB de VRAM en ese formato; no se documentan cifras de VRAM para el formato empaquetado en GPU.
- Despliegue soportado: transformers (referencia), TT-NN con `ttnn.as_tensor` y `ttnn.bfloat8_b`, y scripts propios `pack_tensix.py` y `verify_grid.py`.
- `tt-transformers` (tt-metal v0.81.1) no es utilizable: carga el checkpoint como modelo tipo Llama e ignora el multiplicador de atención de Granite, dando PCC 0.95 en un prefill de 2 capas.
- `tt-forge` (tt-xla) no se ha ejecutado aún con este checkpoint; por defecto mantiene bf16 exacto, y sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores.
- Latencia y throughput: no disponibles; el autor no midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| **Xylolabs/granite-4.2-8b-Tensix-BFP8** | 8,79 B | no disponible | BFP8 hardware-aware (9,20 bits/peso) | Apache 2.0 | Objetivo Tensix; KL 0,00487 vs BF16 |
| ibm-granite/granite-4.2-8b | 8,79 B | no disponible | BF16 (referencia) | Apache 2.0 | Modelo base; 17,58 GB |
| granite-4.2-8b en Q4_K_M (llama.cpp) | 8,79 B | no disponible | Q4_K_M (4,86 bits/peso) | Apache 2.0 | 5,348 GB; KL 0,14751; 3 respuestas perdidas |

La comparativa se limita al modelo base y a su cuantización Q4_K_M, que son las referencias incluidas en la evaluación del autor. No se dispone de datos de contexto ni de comparaciones con otros modelos de 8B en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está diseñado para la rejilla BFP8 de TT-NN; cargarlo en otros backends no aporta la ventaja de empaquetado y mantiene el coste de almacenamiento en bf16.
- No se ha validado en hardware Tensix real: las pruebas se hicieron en el simulador `ttsim` con ttnn 0.81.1.
- `tt-transformers` no soporta Granite y produce resultados incorrectos (PCC 0.95) por ignorar el multiplicador de atención 1/128.
- `tt-forge` no se ha probado con este checkpoint y, con sus opciones BFP, re-redondea los pesos, alterando los valores ya alineados.
- La evaluación mide fidelidad respecto a BF16 (KL y top-1), no calidad de tarea; no hay benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; se heredan los del modelo base Granite 4.2, no descritos en la información proporcionada.
- Longitud de contexto no disponible; conviene consultar la model card del modelo base antes de usarlo en tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre la paridad con el modelo original en tareas distintas de las evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-8b-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Revisión concreta del modelo base usada: https://huggingface.co/ibm-granite/granite-4.2-8b/tree/a7042144125ce5ae64f89610e8289647fc000b9a
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/granite-4.2-8b-Tensix-BFP8/blob/main/LICENSE
