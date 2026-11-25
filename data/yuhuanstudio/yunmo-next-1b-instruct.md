# yuhuanstudio/Yunmo-Next-1B-Instruct

## Resumen

Yunmo-Next-1B-Instruct es un modelo de lenguaje de 1.008 millones de parametros (1.008.058.216 exactamente) desarrollado por yuhuanstudio como version ajustada por instrucciones del checkpoint base Yunmo-Next-1B-Base. Se trata de un modelo orientado prioritariamente al chino tradicional, con arquitectura hibrida que combina atencion GQA y Kimi Delta Attention (KDA) en un esquema de 60 capas organizadas en celdas `GQA → KDA → KDA → KDA`, junto con residuales de atencion de bajo rango. El modelo base fue preentrenado desde cero sobre 19.760 millones de tokens.

La relevancia de este checkpoint es fundamentalmente investigadora: el propio autor lo describe explicitamente como un checkpoint de investigacion y no como un asistente capaz. El ajuste fino consistio en una epoca de SFT con 1.757 millones de tokens empaquetados (815.984.577 tokens objetivo supervisados) sobre 1.861.379 conversaciones procedentes de 35 fuentes, con contexto de entrenamiento de 16.384 tokens. El ajuste ensena el formato de respuesta y razonamiento mucho mejor que su contenido, segun reconoce la model card.

El modelo implementa un protocolo de chat con canal de razonamiento opcional, cuatro niveles de esfuerzo de razonamiento y soporte de llamadas a herramientas, ademas de decodificacion restringida por gramatica en su runtime empaquetado. Su licencia Apache-2.0 cubre pesos, tokenizador y codigo de inferencia, pero no redistribuye los datos de entrenamiento. El modelo requiere GPU NVIDIA con Triton para los kernels KDA, sin ruta CPU ni Apple Silicon en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con celdas `GQA → KDA → KDA → KDA`, 60 capas, residuales de atencion de bajo rango |
| Parametros totales | 1.008.058.216 (1.008B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (entrenado a esa longitud) |
| Tipos de cuantizacion | BF16 (pesos de entrenamiento bit-exactos), FP32 (upcast exacto); versiones MLX cuantizadas disponibles para Mac |
| Idiomas soportados | zh (chino tradicional prioritario), en |
| Licencia | Apache-2.0 (pesos, tokenizador y codigo de inferencia; datos de entrenamiento no redistribuidos) |
| Formato de pesos | safetensors (`model.safetensors` en BF16, `model.fp32.safetensors` en FP32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 60 capas que intercala atencion con query grouping (GQA) y Kimi Delta Attention (KDA), una variante de atencion lineal, en un patron de celdas `GQA → KDA → KDA → KDA`. Incorpora ademas residuales de atencion de bajo rango. El modelo base se preentreno desde cero sobre 19.761 millones de tokens, una cantidad muy reducida en comparacion con modelos comparables: el autor senala que vio aproximadamente 1/1.400 de los tokens de preentrenamiento de LFM2.5-1.2B, el unico modelo comparable que declara su presupuesto.

El ajuste por instrucciones consistio en una epoca de SFT con 26.802 actualizaciones de 65.536 tokens cada una, totalizando 1.757 millones de tokens empaquetados y 815.984.577 tokens objetivo supervisados. El corpus de SFT comprende 1.861.379 conversaciones de 35 fuentes (34 datasets publicos mas un pequeno conjunto de ejemplos de identidad), incluyendo mezclas de razonamiento destilado (AM-Thinking-v1, DeepSeek-R1-0528, Qwen3-235B-Thinking), instrucciones en chino (smoltalk-chinese, GX-Chinese-Instruct-1M), datos en chino tradicional (tw-instruct-500k, tw-reasoning-instruct-50k), codigo competitivo (Nemotron-SFT-Competitive-Programming-v2, self-oss-instruct-sc2) y datos de agentes (Toucan-1.5M). El entrenamiento se realizo en BF16 sobre una unica RTX 4070 Ti de 12 GB durante aproximadamente 5,3 dias.

Entre las innovaciones tecnicas destacan la atencion KDA (lineal), el protocolo de chat con canal de razonamiento opcional y cuatro niveles de esfuerzo, y la decodificacion restringida por gramatica implementada en el runtime empaquetado (no aplicada en la ruta de `transformers`).

## Capacidades

- Generacion de texto conversacional en chino tradicional y chino, con soporte secundario de ingles.
- Canal de razonamiento opcional con cuatro niveles de esfuerzo configurables.
- Protocolo de chat propio con tokens especiales (por ejemplo `<|return|>` como token de parada).
- Soporte de llamadas a herramientas (tool calls) segun el protocolo de chat entrenado.
- Razonamiento multi-paso en formato, aunque con contenido limitado segun el autor.
- Capacidad de codigo basica (entrenado con datos de programacion competitiva y self-oss-instruct).
- Capacidad matematica limitada (GSM8K 13,9%).
- No dispone de vision ni audio.
- No dispone de modo thinking verificado de forma independiente mas alla del canal de razonamiento declarado.

## Casos de uso

- Investigacion sobre arquitecturas hibridas de atencion: el modelo sirve como banco de pruebas reproducible para estudiar la combinacion GQA/KDA y los residuales de atencion de bajo rango en un modelo de 1B entrenado desde cero.
- Experimentos de decodificacion restringida por gramatica: el runtime empaquetado implementa gramatica forzada, lo que permite estudiar el efecto del constrained decoding en la fidelidad del protocolo de chat.
- Evaluacion de protocolos de razonamiento por niveles: los cuatro niveles de esfuerzo permiten medir el compromiso entre longitud de cadena de pensamiento y precision en tareas controladas.
- Generacion de texto en chino tradicional para prototipos: adecuado para validar pipelines de inferencia en zh-TW antes de escalar a modelos mayores, dado su reducido coste computacional.
- Pruebas de tool calling en entornos de investigacion: permite validar esquemas de function calling y agentes multi-paso en un modelo pequeno antes de desplegar en produccion con modelos mayores.
- Docencia y formacion: util como ejemplo didactico de ciclo completo (preentrenamiento, SFT, runtime con gramatica) entrenado en una sola GPU de consumo.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni tareas de conocimiento factual, dado su rendimiento proximo al azar en MMLU y TMMLU+.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| IFEval | prompt_level_strict_acc (0-shot) | 44,7 |
| GSM8K (chat, greedy) | acc (0-shot) | 13,9 |
| HumanEval | pass@1 (0-shot) | 15,9 |
| MMLU (chat, subconjunto de 1.140 items) | acc (0-shot) | 29,0 |
| TMMLU+ (chat, subconjunto de 990 items) | acc (0-shot) | 23,0 |

El autor indica que el modelo esta "al nivel del azar" en opcion multiple de conocimiento, coherente con el 29,0 de MMLU y el 23,0 de TMMLU+.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB en BF16 para pesos (1.008B parametros), unos 4 GB para los pesos FP32 solos. El runtime completo con cache y overhead requiere mas.
- GPU recomendadas: cualquier NVIDIA con soporte Triton (necesario para los kernels KDA). El entrenamiento se hizo en una RTX 4070 Ti de 12 GB.
- Cabe en GPU de consumo: si, en tarjetas NVIDIA consumer con Triton (por ejemplo RTX 4070 Ti, RTX 4090). No hay ruta CPU ni Apple Silicon en PyTorch; para Mac existen versiones MLX cuantizadas.
- Opciones de despliegue: `transformers` 5.14.1 con `flash-linear-attention` 0.5.2 y `trust_remote_code=True`; runtime CLI empaquetado con decodificacion restringida por gramatica y decodificacion con CUDA graphs. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El `generate` de la ruta transformers es un bucle de continuacion con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Yunmo-Next-1B-Instruct | 1,008B | 16.384 | Apache-2.0 | Hibrido GQA/KDA, chino tradicional primero, checkpoint de investigacion |
| LFM2.5-1.2B | ~1,2B (segun referencia del autor) | no disponible | no disponible | Unico comparable que declara presupuesto de preentrenamiento; el autor indica que Yunmo vio ~1/1.400 de sus tokens |
| Alternativas de ~1B (genericas) | ~1B | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de comparaciones cuantitativas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo declara explicitamente como no apto como asistente capaz.
- Preentrenamiento muy reducido (19.761 millones de tokens, ~1/1.400 de LFM2.5-1.2B), lo que explica el rendimiento al azar en conocimiento multiple choice.
- El SFT ensena el formato de respuesta y razonamiento mucho mejor que el contenido.
- Riesgo elevado de alucinacion en tareas factuales y de conocimiento.
- Contexto limitado a 16.384 tokens y entrenado a esa longitud; no se garantiza extrapolacion.
- Idiomas: prioridad chino tradicional, soporte secundario de chino e ingles; no se declaran otros idiomas.
- Requiere GPU NVIDIA con Triton; sin ruta CPU ni Apple Silicon en PyTorch (solo MLX cuantizado en Mac).
- La licencia Apache-2.0 cubre pesos, tokenizador y codigo, pero no los datos de entrenamiento (no redistribuidos).
- La ruta `transformers` no aplica la gramatica del protocolo; solo el runtime empaquetado la impone.
- No se han publicado evaluaciones independientes; los benchmarks son declarados por el autor y no verificados.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Modelo base: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
- Informe tecnico (PDF): https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/paper/yunmo-next-1b.pdf
- Repositorio de informes: https://github.com/YuhuanStudio/Yunmo-Next-1B
- Informe de instruction tuning: https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/instruct.md
- Codigo de entrenamiento: https://github.com/YuhuanStudio/Yunmo-Next
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
