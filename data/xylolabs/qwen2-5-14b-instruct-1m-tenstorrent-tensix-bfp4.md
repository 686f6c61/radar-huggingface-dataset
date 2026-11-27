# Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP4

## Resumen

Este repositorio contiene una versión cuantizada de Qwen2.5-14B-Instruct-1M, el modelo instructivo de Qwen (Alibaba) con ventana de contexto de hasta un millón de tokens, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). La cuantización la publica Xylolabs y emplea formatos de coma flotante por bloques nativos del hardware Tensix: BFP4 (`bfloat4_b`) para las proyecciones gate y up del MLP, y BFP8 (`bfloat8_b`) para las proyecciones de atención y la proyección down del MLP, manteniendo en bf16 el LM head, los embeddings y las normas.

El modelo base conserva la arquitectura transformer densa de Qwen2.5, con 14.770.033.664 parámetros totales y capacidad de contexto de hasta 1M tokens. La versión empaquetada para Tensix ocupa 13,756 GB frente a los 29,54 GB en bf16 del checkpoint original, lo que reduce aproximadamente a la mitad el espacio de pesos.

Su relevancia actual radica en que es una de las pocas publicaciones que ofrece pesos ya empaquetados en los formatos de bloque de Tenstorrent, con herramientas de verificación (`pack_tensix.py`, `verify_grid.py`) y una evaluación de degradación frente a bf16 y frente a una cuantización GGUF Q4_K_M, lo que permite medir con precisión el coste en calidad de la cuantización en hardware NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), adaptado a formatos de bloque Tensix (BFP4/BFP8) |
| Parametros totales | 14.770.033.664 |
| Parametros activOS | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 1M tokens (heredada del modelo base Qwen2.5-14B-Instruct-1M) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up; BFP8 (`bfloat8_b`) en atención q/k/v/o y MLP down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | declarado: en (inglés); evaluación incluye texto en inglés y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen2.5, con 48 capas según la tabla de formatos de la model card. No se ha reentrenado el modelo: esta publicación es una cuantización post-entrenamiento del checkpoint Qwen/Qwen2.5-14B-Instruct-1M. Los detalles de entrenamiento del modelo base (número de tokens, composición del corpus, fases de RLHF/DPO) no se recogen en la información disponible; la model card remite al blog de Qwen2.5-1M para el modelo original.

La innovación técnica está en el esquema de cuantización: las proyecciones gate y up del MLP se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención y la proyección down del MLP se cuantizan a `bfloat8_b` por redondeo al más cercano. El empaquetado se valida con `pack_tensix.py`, que comprueba cada matriz contra su versión en torch (y opcionalmente la reenvía por la DRAM del dispositivo), y con `verify_grid.py`, que valida la rejilla solo con torch. Las pruebas se realizaron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento de contexto largo: hereda la ventana de hasta 1M tokens del modelo base, adecuada para documentos extensos.
- Generación de código y matemáticas: capacidades propias del modelo base Qwen2.5-14B-Instruct, no evaluadas de forma específica en esta publicación.
- Capacidades multilingües del modelo base: la model card solo declara inglés, aunque la evaluación de cuantización incluye coreano.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) con kernels y runner propios (`tensix-kernels`, `tensix-runner`).
- Inferencia estándar vía transformers con `dtype="bfloat16"` y `device_map="auto"`.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado en los formatos nativos de Tensix, por lo que se puede cargar directamente en Wormhole o Blackhole sin conversión adicional, reduciendo el espacio de pesos a 13,756 GB.
- Procesamiento de documentos largos: la ventana de hasta 1M tokens permite resumir o extraer información de contratos, informes o bases de código completas en una sola pasada.
- Asistentes conversacionales multi-turno: la plantilla de chat y el tamaño de 14B ofrecen un equilibrio entre calidad y coste para atención al cliente con historiales extensos.
- Evaluación de cuantización en producción: sirve como referencia para medir la degradación (KL media de 0,0785 frente a bf16) antes de adoptar BFP4 en pipelines reales sobre NPU.
- Investigación en formatos de bloque: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir y auditar el empaquetado de cada matriz, útil para estudiar el impacto de BFP4 frente a BFP8.
- Prototipado en simulador: al haberse validado sobre ttsim (simulador de Blackhole), permite desarrollar y depurar kernels sin hardware físico.
- Inferencia en GPU con transformers: la carga en bf16 con `device_map="auto"` permite usar el checkpoint en GPUs convencionales para comparativas frente a la ejecución en NPU.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización (KL media frente a bf16 y top-1), no benchmarks de tareas como MMLU, HumanEval o GSM8K.

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct-1M) | 29,54 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 13,756 | 0,07850 | 91,29 |
| Q4_K_M (llama.cpp) | 8,988 | 0,07403 | 90,14 |

Las métricas de KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. La comparación Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `52fc1904a2107ebebebc12740aabd1cb69ac5da4de1dd7fca69053e38adcaadb`. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 29,5 GB; el empaquetado Tensix son 13,756 GB de pesos. La inferencia en bf16 vía transformers requiere cargar el checkpoint completo, por lo que se necesita al menos ~30 GB de memoria de dispositivo.
- GPU recomendadas para la ruta transformers: A100 40/80 GB, H100 80 GB; en consumer, RTX 4090 (24 GB) no basta para bf16 completo sin offloading, pero podría alojar variantes cuantizadas adicionales no incluidas en este repo.
- NPU objetivo: Tenstorrent Wormhole y Blackhole, con ttnn 0.81.1 (validado sobre ttsim, el simulador de Blackhole).
- Opciones de despliegue: transformers con `AutoModelForCausalLM`; ttnn para Tensix; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla en la model card. No se menciona soporte de llama.cpp, Ollama o vLLM para estos pesos empaquetados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4) | 14,77B | 1M | Tensix BFP4/BFP8, 13,756 GB | Apache 2.0 | Hugging Face |
| Qwen2.5-14B-Instruct-1M (bf16) | 14,77B | 1M | safetensors bf16, 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 14,77B | 1M | GGUF, 8,988 GB | Apache 2.0 | Generado desde el mismo checkpoint |

La comparación se limita a variantes del mismo modelo base, ya que la información disponible no incluye otros modelos comparables de la misma categoría con datos de rendimiento.

## Limitaciones y advertencias

- Degradación de calidad medible: KL media de 0,0785 frente a bf16 (1,06 veces la de Q4_K_M) y top-1 del 91,29 %, por debajo del 100 % de bf16.
- Idiomas: la model card solo declara inglés; el soporte multilingüe del modelo base no está garantizado en esta cuantización.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas de factualidad en esta publicación.
- Sesgos: no documentados en la información disponible; se heredan los del checkpoint Qwen2.5 original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` con los cambios respecto al modelo base.
- Dependencia de hardware: los pesos están empaquetados para Tensix; su uso fuera de esa plataforma requiere la ruta transformers en bf16 o conversión adicional.
- Validación en simulador: las pruebas se hicieron con ttsim (simulador de Blackhole), no en silicio físico, según la model card.
- Capacidades de agente, tool calling y visión no documentadas en esta publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código empaquetado (commit 5c52065): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Blog Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arxiv:2501.15383): https://arxiv.org/abs/2501.15383
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
