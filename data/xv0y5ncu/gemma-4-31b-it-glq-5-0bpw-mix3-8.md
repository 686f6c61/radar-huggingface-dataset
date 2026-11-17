# xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8

## Resumen

Gemma-4-31B-it-GLQ-5.0bpw-mix3-8 es una cuantizacion de precision mixta del modelo google/gemma-4-31B-it, publicada por el usuario xv0y5ncu mediante la herramienta GLQ (E8 lattice quantization). El objetivo no es otro que reducir el peso en memoria del modelo base: frente a los aproximadamente 62 GB en bf16, esta version ocupa unos 24 GB en disco y unos 16,5 GiB en GPU, lo que permite ejecutar un modelo de 31B en una unica GPU de 24-32 GB.

La cuantizacion se realiza con un esquema de precision mixta con objetivo de 5,0 bits por peso (rango 3-8 bpw), asignando mas bits a las capas mas sensibles (q/k/v de las primeras capas del decoder y per_layer_projection en las ultimas) mediante un proxy de sensibilidad derivado de la traza del Hessiano. El modelo conserva las capacidades del base Gemma 4, incluyendo modo thinking, aunque las torres de vision y audio no estan cuantizadas y el autor documenta el despliegue en modo solo texto.

Es relevante porque demuestra que una cuantizacion agresiva basada en reticulos E8 puede mantener la calidad del bf16 (dentro del ruido de medicion a n pequeno) con una reduccion de huella de aproximadamente 3,5x en VRAM, abriendo el 31B a hardware consumer de gama alta y a GPUs de workstation de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), cuantizacion E8 lattice (GLQ) |
| Parametros totales | 12.027.607.404 (safetensors; el nombre comercial indica 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los benchmarks usan hasta 64k tokens en thinking) |
| Tipos de cuantizacion | GLQ 5.0 bpw de media, precision mixta en rango 3-8 bpw |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del base google/gemma-4-31B-it, un transformer de la familia Gemma 4 con capacidades multimodales (torres de vision y audio presentes en el base, no cuantizadas en esta version). El proceso GLQ aplica un codebook de reticulo E8 con 65536 entradas sobre bloques de 8 dimensiones, una Randomized Hadamard Transform (RHT) para la rotacion de entrada y salida, y feedback LDLQ basado en descomposicion LDL por bloques durante la codificacion. Las capas con al menos 3 bpw usan cuantizacion residual en N etapas.

La asignacion de precision mixta se hace con un allocator greedy de rendimientos decrecientes: se calcula un proxy de sensibilidad a partir de la traza del Hessiano y se reparte el presupuesto de bits segun la ganancia marginal (proxy_loss x 4^-(b-min_bpw)), concentrando bits en las capas q/k/v tempranas del decoder y en per_layer_projection de las capas tardias. No se documenta reentrenamiento ni ajuste fino adicional: es una cuantizacion post-entrenamiento de los pesos del base.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo thinking (chat template con enable_thinking=True).
- Razonamiento matematico y resolucion de problemas (evaluado en AIME-2024 y AIME-2026).
- Conocimiento general y preguntas de opcion multiple complejas (MMLU-Pro).
- Capacidades multimodales del base (vision y audio) presentes en el modelo, aunque las torres correspondientes no estan cuantizadas y el autor documenta el serving en modo solo texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Despliegue de un modelo de 31B en una unica GPU de 24-32 GB: con unos 16,5 GiB de pesos en GPU, permite servir el modelo en una RTX PRO 6000 o similar donde el bf16 (unos 58 GiB) requeriria tres o mas GPUs.
- Razonamiento matematico con modo thinking: el modelo resuelve problemas de competicion (AIME) con presupuestos de hasta 64k tokens; util para asistentes de matematicas o verificacion de derivaciones.
- Evaluacion de conocimiento experto: MMLU-Pro con 16k tokens de thinking lo hace adecuado para sistemas de preguntas y respuestas tecnicas de alta exigencia.
- Prototipado e investigacion en local: al caber en hardware de workstation, permite experimentar con un 31B sin infraestructura multigpu, reduciendo coste y latencia de iteracion.
- Servicio de chat con contexto largo: el ahorro de VRAM frente a bf16 deja margen para cache KV y ventanas de contexto extendidas en vLLM.
- Fine-tuning o adaptadores sobre una base cuantizada: el formato safetensors y la licencia Apache 2.0 facilitan integrarlo en pipelines de experimentacion, aunque la cuantizacion limita el ajuste directo de pesos.
- Comparacion de tecnicas de cuantizacion: sirve como referencia reproducible para evaluar GLQ frente a otros esquemas (GPTQ, AWQ) en terminos de calidad y huella.

## Benchmarks y rendimiento

Evaluacion pareada contra el base bf16 en vLLM 0.23.0 sobre una RTX PRO 6000, modo thinking, mismo harness y mismo muestreo. Son pass@1 de una sola muestra con n pequeno: indicativos, no estimaciones ajustadas.

| Benchmark | n | bf16 | GLQ 5.0 bpw |
|---|---|---|---|
| MMLU-Pro (thinking, 16k) | 60 | 86,7% (52/60) | 90,0% (54/60) |
| AIME-2024 (thinking, 32k) | 30 | 86,7% (26/30) | 90,0% (27/30) |
| AIME-2026 (thinking, 64k) | 30 | 90,0% (27/30) | 83,3% (25/30) |

Las diferencias caen dentro del ruido de una sola muestra y oscilan en ambas direcciones (GLQ por delante en MMLU-Pro y AIME-2024, bf16 por delante en AIME-2026). No hubo truncamientos en ninguna de las tres pruebas. El autor no reclama paridad ni perdida de calidad mas alla de "indistinguible con este n".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GiB de pesos en GPU (GLQ 5.0 bpw) frente a unos 57,9 GiB en bf16; el autor dimensiona el conjunto para caber en una GPU de 32 GB (24 GB de pesos mas cache KV).
- GPU recomendadas: RTX PRO 6000 (medida por el autor), GPUs de 24-32 GB en general; el bf16 del base requiere tres o mas GPUs.
- Cabe en GPU consumer: si, en tarjetas de 24 GB o mas (por ejemplo, RTX 4090 de 24 GB) segun la huella declarada, aunque no se aportan mediciones en esa tarjeta.
- Opciones de despliegue: vLLM 0.23.0 o superior (soporte GLQ, solo texto con limit_mm_per_prompt a 0) y transformers con el paquete glq (transformers >=5.13.1, <5.15). El kernel CUDA personalizado se compila JIT en el primer uso (unos 30 s); requiere torch >=2.0 y CUDA 12.x.
- Latencia y throughput: no disponibles de forma numerica. El autor indica que en una GPU grande donde el bf16 ya cabe, el bf16 decodifica mas rapido; la ventaja de GLQ es la huella y el margen de VRAM para cache KV y contexto largo, no la velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-31B-it-GLQ-5.0bpw-mix3-8 | 12.027.607.404 (safetensors) | no disponible | Apache 2.0 | safetensors (GLQ) | Unos 16,5 GiB en GPU; sirve en una GPU de 24-32 GB |
| google/gemma-4-31B-it (bf16) | 31B (nominal) | no disponible | Apache 2.0 | safetensors | Unos 57,9 GiB en GPU; requiere 3+ GPUs |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 31B (nominal) | no disponible | Apache 2.0 | segun esquema | No se aportan datos comparativos en la informacion disponible |

No se dispone de datos de rendimiento de las alternativas de cuantizacion en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Los benchmarks tienen n muy pequeno (30-60 items) y una sola muestra; las diferencias frente a bf16 no son estadisticamente concluyentes.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion no lo mitiga ni lo agrava de forma documentada.
- Las torres de vision y audio no estan cuantizadas y el autor documenta el serving en modo solo texto en vLLM; el uso multimodal no esta validado en esta version.
- El paquete glq requiere compilar un kernel CUDA en el primer uso; hay que fijar transformers por debajo de 5.15 (la 5.15.0 rompe gemma-4 en vLLM por el cambio a config por capa).
- El script de vLLM debe usar el guard __main__ obligatoriamente por el metodo de arranque spawn de multiprocessing.
- Para tareas de thinking se recomienda max_new_tokens=16384; presupuestos menores pueden truncar el bloque de razonamiento antes de la respuesta final.
- lm-evaluation-harness no expone enable_thinking; requiere un monkey-patch del tokenizer para evaluar en modo thinking.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia de Gemma 4 en ai.google.dev; conviene revisar los terminos del modelo base.
- Los sesgos conocidos del modelo base no se documentan en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
