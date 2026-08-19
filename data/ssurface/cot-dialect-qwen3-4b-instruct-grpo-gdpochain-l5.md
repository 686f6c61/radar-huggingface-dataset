# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gdpochain-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-gdpochain-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de `Qwen/Qwen3-4B-Instruct-2507` para razonar en un "dialecto" de chain-of-thought comprimido al nivel L5, es decir, una única expresión colapsada (por ejemplo, `18/3*2=12`). Según la model card, la mediana de longitud de la cadena de razonamiento en este nivel es de 16 caracteres, frente a los 532 caracteres del nivel L1, lo que supone un rango de compresión de 33x.

Este modelo es una **ablación** dentro de un estudio más amplio sobre compresión de cadenas de razonamiento. No es el modelo principal de su nivel (ese es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`); se publica específicamente para que la comparación de diseño de recompensas del paper pueda reproducirse. El adaptador se entrena con GRPO sobre un modelo SFT previo (también a nivel L5) y utiliza una recompensa `gdpo` que normaliza cada componente de recompensa de forma independiente dentro del grupo antes de sumarlos.

El resultado declarado es un 77.8% de precisión exacta en GSM8K test (n=1317), con decoding greedy, single-turn, sin exemplars y sin self-consistency. Es un artefacto de investigación, no un modelo de producción, y su relevancia radica en permitir estudiar el efecto del diseño de recompensas en la compresión del razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | Modelo base: 4B; adaptador LoRA r=16, alpha=32 (parametros exactos del adaptador no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer de 4B parametros. Sin embargo, la model card advierte explícitamente de que el adaptador **no funciona cargado directamente sobre el modelo base**: fue entrenado contra el modelo SFT fusionado a nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`), por lo que para reproducir los resultados es necesario cargar primero ese adaptador SFT, fusionarlo y después aplicar este adaptador GRPO.

El entrenamiento se realizó con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, con las siguientes características: loss tipo `dapo`, 8 generaciones por prompt, batch de 16 con 2 pasos de acumulación, máximo de 256 tokens de completación, learning rate 1e-05, coeficiente KL (beta) 0.0, y LoRA con r=16 y alpha=32. El hardware utilizado fue una NVIDIA A100 80GB.

La función de recompensa combina cuatro componentes: `correctness` (que pondera según el número de pasos de la solución dorada), `format` (exige un bloque `thinking... response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmética escrita dentro de la cadena es correcta) y `gdpo` (normalización independiente de cada recompensa dentro del grupo antes de sumarlas). El conjunto de prompts fue `gsm8k_grpo_balanced_1k.json`, y los datos de entrenamiento consisten en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor.

Un detalle técnico relevante: el autor indica que el path de kernels fusionados producía adaptadores con matrices `lora_B` todas a cero (matemáticamente inertes), por lo que se usó `transformers` estándar con `sdpa`. Todos los adaptadores publicados fueron verificados con `lora_B != 0` antes de su publicación; 13 que fallaron esa comprobación fueron retenidos.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido: genera una cadena de razonamiento extremadamente corta (mediana de 16 caracteres) que expresa el calculo completo en una unica expresion colapsada.
- Generacion de texto en ingles: al ser un adaptador sobre un instruct model, conserva la capacidad de generar texto del modelo base, aunque su entrenamiento se limita a problemas matematicos de GSM8K.
- Verificacion aritmetica interna: la recompensa `chain` fuerza a que la aritmetica escrita en la cadena sea correcta, lo que reduce la probabilidad de cadenas plausibles pero incorrectas.
- Sin soporte de tool calling, vision, audio ni capacidades multimodales: no se mencionan en la documentacion y el adaptador esta especializado en razonamiento matematico.
- Sin modo thinking explicito: el formato de salida es un unico bloque `thinking... response`, pero no es un modo de razonamiento extenso, sino comprimido.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: permite estudiar como afecta la compresion extrema del razonamiento (16 caracteres frente a 532) a la precision en problemas aritmeticos de varios pasos.
- Ablacion de diseno de recompensas: su proposito declarado es permitir reproducir la comparacion entre la recompensa `gdpochain` y la recompensa estandar del modelo principal `grpo-l5`, aislando el efecto de la normalizacion de recompensas.
- Evaluacion de trade-offs entre longitud de cadena y exactitud: al comparar con los niveles L1 a L4 de la misma familia, se puede medir la degradacion de precision a medida que se comprime el razonamiento.
- Benchmarking de tecnicas de RL (GRPO) sobre modelos pequenos: el setup de entrenamiento (A100 80GB, 4B base) es accesible para laboratorios con recursos modestos, y el adaptador sirve como punto de referencia reproducible.
- Validacion de pipelines PEFT: el caso documentado de kernels fusionados que producian `lora_B` nulos es un ejemplo util para equipos que desarrollan integraciones de LoRA con `transformers`.
- Generacion de explicaciones ultra-cortas en dominios restringidos: aunque no es su uso previsto, en escenarios donde se requiera una justificacion minima de un calculo (por ejemplo, sistemas de autoevaluacion) podria emplearse como generador de trazas compactas.

## Benchmarks y rendimiento

El unico benchmark declarado en la model card es GSM8K test:

| Dataset | Metrica | Valor | Condiciones |
|---|---|---|---|
| GSM8K (openai/gsm8k, split test) | Accuracy (exact match) | 77.8% | n=1317, greedy decoding, single-turn, sin exemplars, sin self-consistency |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, siendo mas rapida la caida en los niveles comprimidos, y que al ser una ablation el modelo puede ser peor que el modelo principal del mismo nivel (`grpo-l5`). El margen de error estimado es de ±2.7 puntos porcentuales (95% half-width) para n=1317.

## Requisitos de hardware

- El adaptador en si ocupa 0.1 GB (repo), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 completo.
- VRAM estimada para inferencia en bf16: ~8-9 GB para el modelo base de 4B mas overhead de atencion y logits. Con cuantizacion (por ejemplo, 4-bit) podria reducirse a ~3-4 GB, aunque no se han publicado cuantizaciones para este adaptador.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A100 80GB. Para inferencia, una RTX 3090/4090 (24GB) es suficiente en bf16; GPUs con 8-12GB podrian servir con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 y probablemente en RTX 4070/4080 con cuantizacion, aunque no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: `transformers` + `peft` (como se documenta en la model card), y potencialmente vLLM si se soporta LoRA; llama.cpp/Ollama requeririan convertir el adaptador fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible. El modelo es una ablation dentro de una familia de adaptadores del mismo autor (`ssurface/cot-dialect-qwen3-4b-instruct-*`), pero no se proporcionan resultados del modelo principal `grpo-l5` ni de otros niveles. Comparar con el modelo base Qwen3-4B-Instruct-2507 sin datos de GSM8K de ese modelo no es posible. Se recomienda consultar la model card del modelo principal para una comparacion directa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de GSM8K; no hay evidencia de generalizacion a otros dominios.
- La precision se degrada con la dificultad del problema, y esta degradacion es mas acusada en los niveles de compresion alta (L5).
- Resultado de una unica semilla (single seed) salvo que el nombre del repo indique lo contrario; diferencias de unos pocos puntos porcentuales estan dentro del ruido estadistico (±2.7 pp a n=1317).
- Es un artefacto de ablation: fue entrenado para responder a una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo; cargarlo directamente sobre el modelo base no reproduce los resultados declarados.
- Solo soporta ingles; no hay datos sobre otros idiomas.
- Riesgo de alucinacion en problemas fuera de distribucion: al comprimir tanto la cadena, el modelo puede producir expresiones aritmeticas incorrectas sin que el verificador `chain` las detecte si no estan en el conjunto de entrenamiento.
- Licencia apache-2.0 permite uso comercial, pero al ser un artefacto de investigacion sin garantias, no se recomienda su uso en produccion sin validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gdpochain-l5
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Guia de requisitos de hardware Qwen3 (referencia externa): https://llmhardware.io/guides/qwen3-hardware-requirements
- Paper citado en la model card (referencia bibliografica): Frolov, Anatolii, "Chain-of-Thought Compression Dialects", 2026.
