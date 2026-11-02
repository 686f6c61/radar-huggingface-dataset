# ulmentflam/gpt2-124m-fineweb-muon-rotary-qknorm-mojo

## Resumen

GPT-2 124M FineWeb Muon Rotary QK-norm es un checkpoint de investigación entrenado desde cero por el autor independiente ulmentflam (Evan Owen) utilizando su propio framework de entrenamiento en Mojo, `llm.mojo`. Se trata de una reproducción de la arquitectura GPT-2 de 124 millones de parámetros (12 capas, 12 cabezas de atención, 768 canales) sobre el subconjunto clásico de 10 000 millones de tokens del dataset FineWeb, con una receta derivada de la campaña de adopción de modded-nanogpt. El modelo incorpora dos modificaciones arquitectónicas respecto al GPT-2 original: embeddings posicionales rotatorios (RoPE) en lugar de los embeddings posicionales aprendidos, y QK-norm en las capas de atención.

El objetivo del autor es explícito: se trata de un artefacto de ejecución de entrenamiento y una referencia de reproducibilidad, no de un modelo de lenguaje capaz. La relevancia reside en que documenta de forma rigurosa una comparación entre el optimizador Muon y un baseline AdamW bajo el mismo horizonte de validación sobre FineWeb, con pérdida de validación de 3,2704 para Muon en 2,99B tokens frente a 3,2900 para AdamW en 10,25B tokens.

El modelo no es compatible con `transformers`: al usar RoPE y QK-norm, los pesos solo se distribuyen en el formato de checkpoint crudo de `llm.mojo`, sin exportación a safetensors ni GGUF. El tensor `wpe` existe en el fichero pero está a cero y no se utiliza. El repositorio ocupa 0,9 GB e incluye tanto los pesos en bf16 como el estado del optimizador para reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 con RoPE (rotary position embeddings) y QK-norm |
| Parametros totales | 124 millones (12 capas, 12 cabezas, 768 canales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (derivado de `-t 1024` en la receta de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en formato crudo de llm.mojo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | ODC-BY (pesos); código de llm.mojo bajo MIT |
| Formato de pesos | checkpoint crudo de llm.mojo (`model_5700.bin`, version 5), bf16; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con 12 cabezas de atención y dimensión de modelo de 768, es decir, la geometría estándar de GPT-2 124M, pero con dos cambios: se sustituyen los embeddings posicionales aprendidos por embeddings rotatorios (RoPE), y se añade QK-norm sobre las consultas y claves de atención. El tensor `wpe` del GPT-2 original permanece en el fichero de pesos pero está inicializado a cero y no se usa en el cómputo. El entrenamiento se realizó en bf16 con 524 288 tokens por paso (`-b 32 -t 1024 -d 524288`) sobre una única NVIDIA GB10.

El dataset es el subconjunto clásico de 10 000 millones de tokens de FineWeb (`HuggingFaceFW/fineweb`). El optimizador es Muon con learning rate 4,8e-3, momentum 0,95 y warmup de 300 pasos, con un schedule WSD (warmup-stable-decay) y un cooldown del 40 % con forma de decaimiento lineal. El checkpoint publicado corresponde al paso 5700, tras 2,99B tokens procesados. El autor documenta que la receta superó por primera vez la pérdida de validación del baseline AdamW (3,2900) en el paso 5500, con 2,88B tokens y pérdida 3,2892. La comparación se limita a una sola semilla; existe una confirmación con tres semillas solo a 600 pasos y 131k tokens por paso. Además, la misma receta con un horizonte de 3800 pasos terminó en 3,3249 tras 1,99B tokens, y este run reanudó desde el paso 2000 de aquel, por lo que los pasos 2001-3800 descartados no se contabilizan en los tokens reportados.

La innovación técnica principal es la propia receta de entrenamiento con Muon y las kernels fusionadas de rotary/QK-norm en `llm.mojo`. El modelo se entrenó con kernels sin fusionar en el commit `21a2e4c`; las kernels fusionadas actuales difieren solo por redondeo en coma flotante. El fichero de pesos registra el flag de rotary (una build sin rotary lo rechaza), pero no registra QK-norm: una build sin `-D LLMM_QK_NORM=1` puede cargar el fichero y calcular silenciosamente un modelo incorrecto.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de modelo de 124M parámetros entrenado sobre 2,99B tokens de FineWeb.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se reporta entrenamiento en otros idiomas.
- No dispone de modo thinking, visión ni audio.
- No se ha evaluado en HellaSwag ni en otros benchmarks de conocimiento o razonamiento.
- Su función real es servir como referencia reproducible de una receta de entrenamiento con Muon, RoPE y QK-norm en `llm.mojo`.

## Casos de uso

- Reproducción de experimentos de entrenamiento: el checkpoint y el estado del optimizador (`state_5700_0.bin`) permiten reanudar el entrenamiento exactamente en el paso 5700 con la misma receta, útil para estudiar la dinámica de Muon frente a AdamW.
- Verificación de implementaciones de RoPE y QK-norm: al ser un modelo pequeño con estas dos modificaciones, sirve para validar que una implementación propia de atención con RoPE y QK-norm produce las mismas salidas que `llm.mojo`.
- Benchmarking de kernels en Mojo: el modelo permite medir throughput y latencia de las kernels de inferencia bf16 de `llm.mojo` en hardware concreto (por ejemplo, una GB10) sin depender de modelos de mayor tamaño.
- Estudio de schedules de learning rate: la comparación documentada entre horizontes de 3800 y 5700 pasos con WSD y cooldown del 40 % permite analizar el efecto del horizonte sobre la pérdida final.
- Docencia y divulgación sobre entrenamiento de LLM: un modelo de 124M con receta completa, logs y figuras públicas es adecuado para explicar el pipeline de entrenamiento desde cero sin requerir clústeres grandes.
- Validación de pipelines de checkpointing: el par de ficheros de pesos y estado del optimizador permite probar herramientas de carga, verificación de hashes y reanudación en frameworks propios.

## Benchmarks y rendimiento

Los únicos datos publicados son de pérdida de validación sobre FineWeb val (320 lotes, 10 485 760 tokens). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, HellaSwag) en la información disponible.

| Modelo / receta | Tokens | Val loss |
|---|---:|---:|
| Esta receta, primer eval ≤ 3,28 (paso 5600) | 2,94B | 3,2795 |
| Este checkpoint (paso 5700) | 2,99B | 3,2704 |
| Baseline AdamW, `gpt2-124m-fineweb-mojo` | 10,25B | 3,2900 |
| Misma receta, horizonte 3800 pasos | 1,99B | 3,3249 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en bf16 para los pesos (124M parámetros × 2 bytes), más overhead de activaciones y buffers; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor entrenó en una NVIDIA GB10. Para inferencia, una RTX 3060, RTX 4090 o A100 son suficientes y sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: exclusivamente `llm.mojo` (build con `make build-infer-bf16` y los defines `-D LLMM_ROTARY=1 -D LLMM_QK_NORM=1`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`, al no existir exportación a safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Val loss (FineWeb) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo (Muon + RoPE + QK-norm) | 124M | 1024 | 3,2704 (2,99B tokens) | ODC-BY | Solo checkpoint crudo llm.mojo |
| `ulmentflam/gpt2-124m-fineweb-mojo` (AdamW baseline) | 124M | 1024 | 3,2900 (10,25B tokens) | no disponible en la información | Solo checkpoint crudo llm.mojo |
| GPT-2 124M original (OpenAI) | 124M | 1024 | no disponible | MIT | `transformers`, safetensors, amplio ecosistema |

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de entrenamiento y referencia de reproducibilidad, no como un modelo de lenguaje capaz; la calidad de generación será propia de un 124M entrenado con solo 2,99B tokens.
- No es compatible con `transformers` ni con el ecosistema estándar: requiere compilar `llm.mojo` con los flags correctos.
- Riesgo silencioso de inferencia incorrecta: una build sin `-D LLMM_QK_NORM=1` carga el fichero sin error y calcula un modelo distinto al entrenado.
- El resultado de validación se basa en una sola semilla; la confirmación multi-semilla solo cubre 600 pasos y 131k tokens por paso.
- El resultado está ligado a la receta y al horizonte concretos; otros horizontes no se probaron y el mismo recipe a 3800 pasos terminó en 3,3249.
- No se evaluó HellaSwag ni otros benchmarks de conocimiento, razonamiento o generación.
- Idioma limitado al inglés; no hay evidencia de capacidades multilingües.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre FineWeb, hereda los sesgos del corpus web filtrado.
- Riesgo de alucinación: alto en cualquier uso generativo real, dado el tamaño y los tokens de entrenamiento.
- Licencia ODC-BY para los pesos: permite uso comercial con atribución; el código de `llm.mojo` es MIT. Verificar los términos de ODC-BY para la atribución requerida en productos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulmentflam/gpt2-124m-fineweb-muon-rotary-qknorm-mojo
- Baseline AdamW: https://huggingface.co/ulmentflam/gpt2-124m-fineweb-mojo
- Repositorio llm.mojo: https://github.com/ulmentflam/llm.mojo
- Informe completo de resultados: https://github.com/ulmentflam/llm.mojo/blob/main/docs/ai/modded_nanogpt_adoption_results_2026-10-30.md
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
