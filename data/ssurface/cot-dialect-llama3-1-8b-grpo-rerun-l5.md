# ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l5

## Resumen

`ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l5` es un adaptador LoRA que transforma `meta-llama/Llama-3.1-8B-Instruct` en un modelo capaz de razonar a un nivel de compresion extremo (nivel L5) de cadenas de pensamiento: en lugar de emitir cadenas de razonamiento verbosas, produce una expresion unica colapsada (por ejemplo, `18/3*2=12`). Lo desarrolla ssurface como parte de la linea de investigacion "Chain-of-Thought Compression Dialects" de Anatolii Frolov.

Este modelo es un **ablation**, no uno de los modelos principales de la familia: se entreno con un esquema de recompensa distinto al del modelo titular del mismo nivel (`ssurface/cot-dialect-llama3.1-8b-grpo-l5`) para que la comparacion de diseno de recompensas del articulo pueda reproducirse. Se entrena con GRPO sobre el modelo SFT fusionado del nivel L5, con un dataset de 6993 ejemplos de GSM8K re-expresados por un modelo profesor, con una longitud mediana de cadena de solo 16 caracteres.

El adaptador alcanza un 70,6 % de precision exacta en GSM8K test (n=1317, decoding greedy, sin ejemplos ni self-consistency) y un 77,3 % en SVAMP (transferencia fuera de distribucion). Es un artefacto de investigacion pensado para reproducibilidad, no para uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador ~0,1 GB; modelo base 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; hereda la del base Llama-3.1-8B-Instruct (128k tokens). Max completion de entrenamiento: 256 tokens |
| Tipos de cuantizacion | no disponible (publicado como adaptador PEFT en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo SFT fusionado del nivel L5 (`merged_llama8b/l5`), no sobre el base directamente. El entrenamiento usa `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa` (sin kernels fusionados), con loss de tipo `dapo`, 8 generaciones por prompt, batch 16 con acumulacion x2, learning rate 1e-05 y coeficiente KL (beta) 0.0. La configuracion LoRA es r=16, alpha=32.

La funcion de recompensa combina dos componentes: `correctness`, que pondera la coincidencia con la solucion dorada por el numero de pasos de esa solucion (los problemas mas dificiles valen mas), y `format`, que exige una estructura de respuesta con un unico bloque `thinking... response` seguido de `#### <answer>`. El dataset de entrenamiento son 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con mediana de cadena de 16 caracteres dentro de `thinking` (frente a 532 caracteres en el nivel L1, un rango de 33x). El hardware de entrenamiento fue una unica NVIDIA A100 80GB.

Una nota relevante del autor: el uso de kernels fusionados produjo adaptadores con matrices `lora_B` a cero (inertes matematicamente), por lo que se verifico `lora_B != 0` en todos los adaptadores publicados; 13 que fallaron esa comprobacion se retuvieron.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (nivel L5): una unica expresion colapsada en lugar de razonamiento paso a paso.
- Formato de salida estricto: un bloque `thinking` + `response`, seguido de `#### <respuesta>`.
- Razonamiento de un solo turno (single-turn); no soporta conversaciones multi-turno.
- Capacidad de transferencia fuera de distribucion limitada: 77,3 % en SVAMP.
- No dispone de tool calling, function calling, capacidades multimodales ni modo agente.
- Multilingue: no; entrenado y evaluado unicamente en ingles.
- Sin modo thinking explicito configurable: el nivel de compresion L5 esta fijado por el entrenamiento.

## Casos de uso

- Reproduccion de experimentos de diseno de recompensas: este adaptador es un artefacto de ablation; su caso de uso principal es verificar la comparacion de recompensas del articulo "Chain-of-Thought Compression Dialects" ejecutando la misma evaluacion (GSM8K test, greedy, n=1317) y comparando con el modelo titular `cot-dialect-llama3.1-8b-grpo-l5`.
- Investigacion sobre compresion de cadenas de pensamiento: permite estudiar como afecta una recompensa alternativa (correctness ponderado por pasos + format) al rendimiento en razonamiento comprimido extremo, en comparacion con el esquema de recompensa del modelo principal.
- Evaluacion de trade-offs entre compresion y precision: al ser el nivel L5 (16 caracteres de mediana de cadena), sirve para medir la perdida de exactitud frente a niveles menos comprimidos (L1-L4) de la misma familia, con datos publicados en el articulo.
- Benchmark de razonamiento matematico comprimido: puede integrarse en pipelines de evaluacion que midan la relacion entre longitud de cadena de pensamiento y exactitud en GSM8K y SVAMP.
- Estudios de robustez de GRPO: al estar entrenado con loss `dapo` y KL beta 0.0, es un caso de estudio para analizar el efecto de la divergencia respecto al modelo de referencia en entrenamiento por refuerzo.
- Verificacion de integridad de adaptadores PEFT: el autor documenta el problema de matrices `lora_B` a cero con kernels fusionados; este adaptador (verificado `lora_B != 0`) puede usarse como caso de validacion en pipelines de publicacion de adaptadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Split | n | Metrica | Resultado |
|---|---|---|---|---|
| GSM8K | test | 1317 | Accuracy (exact match), greedy, single-turn, sin ejemplos ni self-consistency | 70,6 % |
| SVAMP (transferencia, fuera de distribucion) | — | 300 | Accuracy | 77,3 % |

Nota del autor: el intervalo de confianza al 95 % tiene semianchura aproximada de 2,7 puntos porcentuales en n=1317 y 4,4 en n=500; diferencias de un par de puntos estan dentro del ruido. No se publican mas benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (segun la model card).
- Inferencia: al ser un adaptador LoRA sobre un modelo de 8B, requiere cargar el modelo base fusionado; cabe en GPUs de consumo con cuantizacion (por ejemplo, RTX 3090 o RTX 4090 con 24 GB) o en GPUs de datacenter (A100, H100) sin cuantizar.
- VRAM estimada: aproximadamente 16 GB para el modelo base en bf16 sin cuantizar; menos con cuantizacion de 4 u 8 bits (GGUF o bitsandbytes).
- Despliegue: compatible con `transformers` + `peft` (carga del adaptador sobre el modelo base fusionado con el adaptador SFT previo). No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un adaptador PEFT estandar podria convertirse a GGUF o servir con vLLM si se fusiona previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l5 | LoRA sobre Llama-3.1-8B-Instruct (ablation, recompensa alternativa) | 8B base | hereda 128k del base | 70,6 % | apache-2.0 | Hugging Face |
| ssurface/cot-dialect-llama3.1-8b-grpo-l5 | LoRA sobre Llama-3.1-8B-Instruct (modelo titular del nivel L5) | 8B base | hereda 128k del base | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | Modelo base instruct | 8B | 128k | no disponible en la informacion proporcionada | llama3.1 (uso comercial permitido con condiciones) | Hugging Face |

No se dispone de datos de benchmarks publicados del modelo titular `cot-dialect-llama3.1-8b-grpo-l5` en la informacion proporcionada, por lo que no es posible cuantificar la diferencia con este ablation.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en problemas matematicos de palabra (GSM8K); no es adecuado para otras tareas de razonamiento general sin validacion previa.
- La precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos (L5 es el extremo).
- Es un artefacto de ablation: fue entrenado para responder a una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo titular del mismo nivel.
- Entrenado con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (semianchura ~2,7 pp en n=1317).
- Requiere apilarse sobre el modelo SFT del nivel L5 (`ssurface/cot-dialect-llama3.1-8b-sft-l5`) y fusionarse antes de cargar este adaptador; cargarlo directamente sobre `meta-llama/Llama-3.1-8B-Instruct` no reproduce el rendimiento declarado.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento; no se documentan evaluaciones de sesgo.
- Idiomas: solo ingles; no se evaluo rendimiento en otros idiomas.
- La licencia apache-2.0 del adaptador no exime de las condiciones de la licencia del modelo base Llama-3.1-8B-Instruct para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo SFT previo requerido: https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-sft-l5 (referenciado en la model card)
- Modelo titular del mismo nivel: https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-grpo-l5 (referenciado en la model card)
- Articulo de referencia (citado en la model card): "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — no se proporciona URL externa en la informacion disponible.
