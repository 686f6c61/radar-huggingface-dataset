# ssurface/cot-dialect-qwen3-14b-grpo-rerun-l4

## Resumen

`cot-dialect-qwen3-14b-grpo-rerun-l4` es un adaptador LoRA publicado por ssurface que modifica el comportamiento de razonamiento de `Qwen/Qwen3-14B` para operar en un "dialecto" de cadena de pensamiento ultracomprimido, denominado nivel L4. En este nivel, el modelo encadena asignaciones de variables separadas por punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`) en lugar de generar razonamientos verbosos. Este adaptador es una variante de ablación del modelo principal `ssurface/cot-dialect-qwen3-14b-grpo-l4`, entrenada con una configuración de recompensa distinta para evaluar el diseño de recompensas en el pipeline de entrenamiento.

El proyecto forma parte de una investigación más amplia sobre compresión de cadenas de pensamiento ("Chain-of-Thought Compression Dialects"), donde se entrena a modelos para razonar con cadenas de pensamiento de longitud variable: desde 532 caracteres en el nivel L1 hasta 16 caracteres en el nivel L5. Este adaptador se centra en el nivel L4, con una mediana de 41 caracteres por cadena. El modelo alcanza un 88.1% de precisión exacta en GSM8K test, lo que demuestra que es posible comprimir drásticamente el razonamiento sin perder una precisión significativa en problemas aritméticos.

La relevancia de este trabajo radica en su potencial para reducir costes de inferencia y latencia en aplicaciones de razonamiento matemático, al tiempo que explora los límites de la compresión del razonamiento en modelos de lenguaje. Es un artefacto de investigación publicado con fines de reproducibilidad, no un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con adaptador LoRA |
| Parametros totales | 14.7B (modelo base) + ~0.02B (adaptador LoRA r=16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (herencia de Qwen3-14B) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; el modelo base admite cuantizacion de 4/8 bits) |
| Idiomas soportados | Ingles (entrenado y evaluado solo en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en `Qwen/Qwen3-14B`, un modelo Transformer denso de 14.7 mil millones de parametros con 40 capas, 40 cabezas de atencion y una ventana de contexto de 32.768 tokens. Qwen3 incorpora atencion QKV con sesgos, normalizacion RMSNorm pre-atencion, activacion SwiGLU y Qwen2.5Tokenizer, ademas de soporte para thinking mode (modo de razonamiento explicito) y non-thinking mode.

El entrenamiento del adaptador sigue un pipeline de dos etapas. Primero, se entrena un modelo SFT de nivel L4 sobre 6.976 ejemplos de GSM8K train re-expresados por un modelo profesor en el dialecto comprimido. Sobre ese modelo SFT fusionado, se aplica GRPO (Group Relative Policy Optimization) con el framework `trl.GRPOTrainer` sobre `transformers` stock con atencion `sdpa`. La funcion de recompensa combina dos componentes: `correctness`, que pondera la coincidencia con la solucion de oro segun el numero de pasos (los problemas mas dificiles valen mas), y `format`, que exige una estructura de respuesta `thinking... response` seguida de `#### <answer>`. Se usan 8 generaciones por prompt, un batch de 16 con acumulacion de 2, maximo 256 tokens de completado, learning rate de 1e-05, coeficiente KL de 0.0 y loss tipo dapo. El adaptador LoRA usa r=16 y alpha=32, y se entreno en una unica NVIDIA A100 80GB.

Un detalle tecnico notable documentado por el autor: el pipeline fusionado con kernels fusionados producia adaptadores con matrices `lora_B` todas a cero (matematicamente inertes), por lo que se opto por `transformers` stock con `sdpa`. Todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico comprimido: genera cadenas de pensamiento de nivel L4 (mediana de 41 caracteres) con asignaciones encadenadas, reduciendo drasticamente el numero de tokens de razonamiento.
- Resolucion de problemas aritmeticos de varios pasos: entrenado en GSM8K, maneja problemas de aritmetica, porcentajes, ecuaciones lineales y calculos combinados.
- Transferencia a problemas fuera de distribucion: evaluado en SVAMP con 89.0% de precision (300 ejemplos), mostrando cierta generalizacion a variantes de problemas matematicos.
- Salida estructurada: genera respuestas en formato `thinking... response` seguido de `#### <answer>`, facilitando el parseo automatico.
- Integracion con PEFT: se carga como adaptador LoRA sobre el modelo base, permitiendo intercambio rapido entre niveles de compresion sin duplicar pesos.
- Sin soporte de tool calling, function calling, vision ni audio: es un adaptador especializado exclusivamente en razonamiento matematico textual.

## Casos de uso

- Reduccion de costes de inferencia en razonamiento matematico: al generar cadenas de pensamiento de ~41 caracteres en lugar de cientos, se reduce el numero de tokens de salida y, por tanto, el coste por peticion en despliegues de pago por token.
- Disminucion de latencia en sistemas de tutoria: en aplicaciones educativas que necesitan resolver problemas aritmeticos paso a paso, la compresion L4 permite respuestas mas rapidas, mejorando la experiencia del usuario en interacciones en tiempo real.
- Evaluacion de diseno de recompensas en RL: este adaptador concreto sirve como artefacto de ablacion para reproducir los experimentos del paper "Chain-of-Thought Compression Dialects", permitiendo a otros investigadores comparar el impacto del diseno de recompensa en el rendimiento final.
- Preprocesamiento de datos de entrenamiento: el modelo puede generar soluciones comprimidas de alta calidad que sirvan como datos de entrenamiento para modelos mas pequenos o para distillation de razonamiento eficiente.
- Benchmarking de compresion de razonamiento: util como punto de referencia para investigacion sobre el equilibrio entre longitud de cadena de pensamiento y precision en modelos de lenguaje.
- Generacion de explicaciones concisas para agentes de automatizacion: en pipelines donde un LLM debe resolver calculos intermedios sin saturar el contexto con razonamiento verboso, el nivel L4 ofrece respuestas compactas y parseables.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card del modelo.

| Benchmark | Split | n | Metrica | Resultado |
|---|---|---|---|---|
| GSM8K | test | 1317 | Accuracy (exact match) | 88.1% |
| SVAMP (transfer, out-of-domain) | no especificado | 300 | Accuracy | 89.0% |

Condiciones de evaluacion: greedy decoding, single-turn, sin ejemplos (few-shot) y sin self-consistency. El autor indica que la precision cae con la dificultad del problema, siendo la caida mas pronunciada en los niveles mas comprimidos. El intervalo de confianza al 95% tiene una semi-amplitud de ~2.7 puntos porcentuales en n=1317 y ~4.4 puntos en n=500, por lo que diferencias de un par de puntos pueden deberse al ruido estadistico.

Para contexto, el modelo base Qwen3-14B alcanza aproximadamente 91.6% en GSM8K en modo thinking segun el technical report de Qwen3, aunque la comparacion no es directa al tratarse de un adaptador sobre el modelo SFT fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-14B en bfloat16 requiere aproximadamente 29 GB de VRAM. Con el adaptador LoRA fusionado, el requisito es identico al del modelo base.
- GPUs recomendadas: NVIDIA A100 80GB (usada para entrenamiento), H100, RTX 4090 (24 GB) con cuantizacion de 8 bits, o RTX 3090/4080 con cuantizacion de 4 bits.
- En consumer GPU: cabe en RTX 4090 con cuantizacion de 4-8 bits (por ejemplo, con bitsandbytes o GPTQ), aunque con latencia mayor que en GPUs de datacenter.
- Opciones de despliegue: vLLM o TGI para servidores de produccion con alto throughput; llama.cpp u Ollama para despliegue local con cuantizacion GGUF del modelo base fusionado.
- Latencia estimada: no disponible en la informacion proporcionada, aunque la compresion L4 reduce significativamente el tiempo de generacion al emitir ~41 tokens de razonamiento en lugar de cientos.
- Nota: el adaptador debe cargarse sobre el modelo SFT fusionado de nivel L4 (`ssurface/cot-dialect-qwen3-14b-sft-l4`), no directamente sobre el modelo base, para reproducir los resultados publicados.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-14b-grpo-rerun-l4 | 14.7B + LoRA | 32K | 88.1% | Apache-2.0 | Ablacion, nivel L4, requiere SFT previo |
| ssurface/cot-dialect-qwen3-14b-grpo-l4 | 14.7B + LoRA | 32K | no disponible | Apache-2.0 | Modelo principal del nivel L4 |
| Qwen/Qwen3-14B (base, modo thinking) | 14.7B | 32K | ~91.6% | Apache-2.0 | Modelo base sin compresion de CoT |
| ssurface/cot-dialect-qwen3-14b-sft-l4 | 14.7B + LoRA | 32K | no disponible | Apache-2.0 | Etapa SFT previa al GRPO |

La comparacion directa con otros adaptadores de la familia no es posible sin datos publicados de los modelos hermanos. La diferencia clave frente al modelo base es la longitud de la cadena de pensamiento: el adaptador L4 genera razonamientos de ~41 caracteres frente a cientos en el modelo base, con una perdida de precision de ~3.5 puntos porcentuales en GSM8K.

## Limitaciones y advertencias

- Artefacto de ablacion: fue entrenado para responder a una pregunta especifica sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel (`cot-dialect-qwen3-14b-grpo-l4`). No debe usarse como modelo de produccion sin evaluacion adicional.
- Dependencia del SFT previo: cargar el adaptador directamente sobre `Qwen/Qwen3-14B` no reproduce los resultados publicados. Es obligatorio cargar primero `ssurface/cot-dialect-qwen3-14b-sft-l4`, fusionarlo y despues aplicar este adaptador.
- Dominio limitado: entrenado y evaluado exclusivamente en problemas matematicos verbales (GSM8K, SVAMP). No tiene capacidades generales de chat, codigo, vision ni tool calling.
- Degradacion con la dificultad: la precision cae con la complejidad del problema, siendo la caida mas acusada en los niveles de compresion mas altos. Problemas multi-paso complejos pueden fallar.
- Ruido estadistico: entrenado con una unica semilla (salvo que el nombre del repo indique lo contrario). Diferencias de 2-3 puntos porcentuales pueden deberse al azar.
- Sin verificacion independiente: los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Idioma: solo entrenado y evaluado en ingles. No soporta otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar razonamientos incorrectos pero plausibles, especialmente en problemas fuera de distribucion. La salida comprimida dificulta la inspeccion humana del razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-14b-grpo-rerun-l4
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-14b-sft-l4
- Technical report Qwen3: https://arxiv.org/abs/2505.09388
- Repositorio GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Paper de referencia (citado en la model card): "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — DOI no disponible
