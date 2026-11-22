# Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4-GateUp

## Resumen
Este repositorio contiene Qwen3-1.7B cuantizado por Xylolabs para su ejecución sobre NPUs Tensix de Tenstorrent (Wormhole y Blackhole). No es un modelo nuevo: es un checkpoint derivado de Qwen/Qwen3-1.7B con las proyecciones internas del transformer recomprimidas en formatos de coma flotante por bloques propios del hardware Tensix (`bfloat4_b` y `bfloat8_b`), gestionados por la pila `tt-metal`/`ttnn`.

La relevancia radica en el empaquetado específico: las proyecciones gate y up del MLP (28 capas) se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención (q, k, v, o) y la down del MLP pasan a BFP8 por redondeo al más cercano. El resultado ocupa 1,768 GB empaquetado frente a los 4,06 GB en bf16, con una divergencia KL media de 0,04263 respecto a bf16, menos de la mitad que la de un Q4_K_M de llama.cpp.

El modelo base Qwen3-1.7B es un transformer denso de 2.031.739.904 parámetros con modo de razonamiento (thinking) activado por defecto, licencia Apache 2.0 y soporte multilingüe amplio. Este checkpoint conserva esas capacidades, pero su uso previsto es el despliegue en hardware Tenstorrent; los pesos se almacenan como bf16 en el Hub y TT-NN los empaqueta sin alterar valores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3), pesos cuantizados para Tensix (BFP4/BFP8) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up; BFP8 (`bfloat8_b`) en atención q/k/v/o y MLP down; bf16 en LM head, embedding y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento
El checkpoint no se ha entrenado desde cero: parte de Qwen/Qwen3-1.7B y aplica un pipeline de cuantización post-entrenamiento. La arquitectura subyacente es un transformer decoder-only denso con atención estándar y MLP con proyecciones gate/up/down; el modelo base incorpora modo de razonamiento que genera un bloque de pensamiento antes de la respuesta.

El esquema de cuantización es selectivo por tipo de tensor. Las 28 capas cuantizan gate y up del MLP a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, técnica que ajusta el exponente compartido de cada bloque de coma flotante para minimizar el error. Las proyecciones q, k, v, o y down del MLP usan `bfloat8_b` por redondeo al más cercano. El LM head (atado al embedding), el embedding y las normas permanecen en bf16. El repositorio incluye `tools/pack_tensix.py` y `tools/verify_grid.py` del proyecto tensix-bfp-gptq (commit 5c52065) para empaquetar y verificar que ningún valor cambia al pasar por TT-NN. No se especifican datos de entrenamiento propios ni etapas de RLHF/DPO adicionales; se heredan los del modelo base.

## Capacidades
- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo de razonamiento por defecto, que produce un bloque de pensamiento antes de la respuesta.
- Razonamiento multi-paso y respuesta a preguntas, heredado de Qwen3-1.7B.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas de forma independiente en esta ficha).
- Capacidades multilingües del modelo base; la evaluación de cuantización cubre inglés y coreano.
- Integración con `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Despliegue en NPUs Tensix mediante `ttnn`: conversión a `ttnn.bfloat4_b`/`ttnn.bfloat8_b` con `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG`.
- Verificación de integridad de pesos con `pack_tensix.py` y `verify_grid.py`.
- No se documenta soporte explícito de tool calling, function calling ni agentes en la información proporcionada.

## Casos de uso
- Despliegue en hardware Tenstorrent: cargar el checkpoint en Wormhole o Blackhole con `ttnn` para inferencia de texto en local, aprovechando el empaquetado BFP4/BFP8 que reduce el peso a 1,768 GB frente a 4,06 GB en bf16.
- Servicio conversacional de bajo coste en NPU: usar la plantilla de chat y el modo thinking para asistentes multi-turno en entornos con presupuesto de memoria ajustado.
- Validación de pipelines de cuantización: emplear `pack_tensix.py` y `verify_grid.py` como referencia para comprobar que el empaquetado TT-NN no altera valores, útil en CI de herramientas de cuantización.
- Investigación en formatos de coma flotante por bloques: comparar el error KL de BFP4/BFP8 frente a Q4_K_M (0,04263 frente a 0,10478) para estudiar el impacto de la cuantización selectiva por proyección.
- Prototipado en `transformers`: ejecutar el checkpoint en GPU o CPU con `transformers` antes de portarlo a Tensix, ya que los pesos se almacenan como bf16 y son legibles por la librería estándar.
- Evaluación de calidad multilingüe: reproducir la medición de KL y top-1 sobre WikiText-2 y Wikipedia en coreano para auditar la degradación de la cuantización en distintos idiomas.
- Generación de texto en inglés y coreano: escenarios donde la evaluación documentada cubre ambos idiomas y el modelo base aporta cobertura multilingüe.

## Benchmarks y rendimiento
Datos de evaluación publicados por el autor, medidos sobre 16.240 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, frente a una pasada bf16 propia del checkpoint base:

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 33 | Respuestas con thinking correctas de 7 |
|---|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-1.7B) | 4,06 | 0 | 100 | 29 | 5 |
| Este modelo (BFP4 gate/up + BFP8) | 1,768 | 0,04263 | 91,20 | 28 | 7 |
| Q4_K_M (llama.cpp) | 1,282 | 0,10478 | 85,70 | 29 | 5 |

El autor indica que la KL es 0,41 veces la de Q4_K_M, por debajo del límite de 1,5 veces, y que supera la comprobación de precisión de cuantización. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada: 1,768 GB empaquetado para Tensix; en `transformers` los pesos se cargan como bf16 y el repositorio ocupa 4,1 GB, por lo que se necesita memoria equivalente a un modelo de ~2.000 millones de parámetros en bf16.
- GPU recomendadas: no se especifican en la información proporcionada; el destino principal son NPUs Tensix (Wormhole, Blackhole).
- GPU de consumo: no confirmado; por tamaño, un modelo de 2.000 millones de parámetros en bf16 cabe en GPUs de consumo con suficiente memoria, pero el autor no lo documenta.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), `ttnn`/`tt-metal` para Tensix, y `text-generation-inference` según los tags del repositorio. `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- Latencia y throughput: no disponibles.
- Herramientas auxiliares: `pack_tensix.py` (empaquetado y verificación, con `--device` para round-trip por DRAM) y `verify_grid.py` (verificación solo con torch).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL media a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint | 2,03 B | no disponible | BFP4 gate/up + BFP8 | 0,04263 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-1.7B (bf16) | 2,03 B | no disponible | bf16 | 0 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B Q4_K_M (llama.cpp) | 2,03 B | no disponible | Q4_K_M | 0,10478 | Apache 2.0 | Generado con llama.cpp v0.9.0 |

La comparativa se limita al mismo modelo base en distintas precisiones, ya que la información proporcionada no incluye alternativas de otros fabricantes. La ventaja de este checkpoint es su integración con Tensix y su menor divergencia KL frente a bf16 en comparación con Q4_K_M, con un tamaño intermedio entre ambos.

## Limitaciones y advertencias
- Cuantización agresiva en BFP4 para gate/up del MLP: la KL media de 0,04263 y el top-1 del 91,20 % implican degradación respecto a bf16, aunque menor que Q4_K_M.
- Evaluación limitada a inglés y coreano sobre 16.240 posiciones; no hay datos de otros idiomas ni de tareas de razonamiento, código o matemáticas.
- El modo thinking está activado por defecto, lo que incrementa los tokens generados y puede no ser deseable en producción sin ajustar la plantilla.
- Dependencia de hardware y software específicos: el uso previsto es Tensix con `ttnn`; `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- Los pesos del Hub están en bf16 y el empaquetado BFP se realiza en TT-NN; cargarlos en `transformers` no aplica la cuantización real del hardware.
- No se documentan sesgos, riesgos de alucinación específicos ni restricciones adicionales de licencia más allá de Apache 2.0; se heredan los del modelo base Qwen3-1.7B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código tensix-bfp-gptq (commit 5c52065): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
