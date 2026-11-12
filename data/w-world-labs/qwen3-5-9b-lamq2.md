# W-World-Labs/Qwen3.5-9B-LAMQ2

## Resumen

Qwen3.5-9B-LAMQ2 es una cuantizacion experimental post-entrenamiento (PTQ) del modelo base Qwen/Qwen3.5-9B, publicada por W-World-Labs mediante su herramienta W-ModelForge y el metodo LookAtMyQuant de Shin Megami Boson. El artefacto empaquetado ocupa 3.438 GB (incluyendo activos del tokenizer) y alcanza aproximadamente 3.06 bits por parametro de texto en pesos mas manifiesto, con una tasa medida de 2.71658 bpw en las capas lineales. El modelo es solo texto y no incluye vision, video ni MTP.

La relevancia de esta publicacion es metodologica: emplea un formato propietario `opgraph-packed-1` que no es GGUF y que no se puede cargar con `AutoModelForCausalLM.from_pretrained()`, sino con el loader de referencia de W-ModelForge, que expande los pesos a un modelo PyTorch denso. El tamano de descarga (3.4 GB) no equivale a la VRAM de inferencia: el modelo FP32 validado requiere aproximadamente 35.8 GB solo para almacenar parametros, mas overhead de runtime y cache KV.

La evaluacion se limita a un protocolo aritmetico sintetico congelado de 216 problemas (math216), no al dataset MATH. El modelo original obtiene 83/216 (38.43%) y el artefacto cuantizado 80/216 (37.04%), con una retencion relativa del 96.39%. La perplejidad empeora de forma material: sube de 22.8068 a 32.0673 (+40.60%) en ventanas cortas de validacion WikiText.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del base Qwen3.5-9B); pesos cuantizados con trellis-coded quantization |
| Parametros totales | 9B (modelo base); almacenamiento FP32 denso de ~35.8 GB |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ trellis (L=12), asignacion Fisher por fila con opciones 2/3/4 bits; lineales a 2.71658 bpw; embeddings y head con tablas Lloyd-Max de 4 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `opgraph-packed-1` (packed/artifact.json + packed/weights.bin); no es GGUF; requiere loader W-ModelForge |

## Arquitectura y entrenamiento

El modelo base es un transformer de 9B parametros de Qwen. La cuantizacion parte del checkpoint BF16 original, con el build de 9B manteniendo modelos en FP32 y el algebra central de cuantizacion en FP64 (el upcasting no restaura precision ausente del checkpoint). La receta aplica transformadas de Hadamard aleatorizadas en la entrada, trellis-coded quantization con L=12 (modo fila, width/lookahead 16/8), decodificacion de Viterbi y feedback de error LDLQ. Los codebooks gaussianos provienen del esquema EMA/e-means del upstream (`trellis_fit=ema`); esta release no incluye ni importa codigo FAISS/e-means.

La asignacion de bits por grupo de filas usa un proxy de distorsion `4^-bits` basado en Fisher, apuntando a 2.7 bpw en lineales. La calibracion usa 128 soluciones greedy autogeneradas a preguntas de entrenamiento de MATH, produciendo 107 ventanas de 1024 tokens (32 usadas para calibracion lineal), con ponderacion de tokens de digito 10x y floor 0.1, QEP alpha 0.5, y estimaciones Fisher sobre 12 ventanas de 512 tokens. Es exclusivamente PTQ: no hay destilacion ni QAT, y no reproduce la receta ajustada de la release 4B del autor original ni sus benchmarks.

## Capacidades

- Generacion de texto en ingles y chino (unico modo validado en esta release).
- Razonamiento aritmetico sintetico dentro del protocolo math216 (12 familias de aritmetica sintetica).
- Generacion con `enable_thinking=False` en la configuracion evaluada (modo thinking no validado explicitamente en esta release).
- Consistencia de reconstruccion: KL media 1.19e-11 entre carga packed independiente y reconstruccion densa del cuantizador, con 100% de acuerdo top-1 en cuatro ventanas de 128 tokens.
- Muestras greedy cortas (32 tokens) identicas en ingles, chino, codigo y aritmetica.
- Tool calling / function calling: no disponible (no evaluado).
- Agentes y razonamiento multi-paso: no disponible (no evaluado).
- Vision, video, audio, MTP: fuera de esta release (solo texto).

## Casos de uso

- Investigacion de metodos de cuantizacion: util como artefacto de referencia para comparar trellis-coded quantization con PTQ convencional, gracias a los informes de KL y PPL publicados junto al modelo.
- Validacion de loaders y formatos: sirve para probar pipelines de carga del formato `opgraph-packed-1` y verificar consistencia packed vs denso mediante las ventanas fijas de validacion.
- Experimentos de aritmetica sintetica: adecuado para reproducir el protocolo math216 con semilla congelada y comparar retencion de aciertos bajo distintas cuantizaciones.
- Evaluacion de degradacion de perplejidad: permite medir el impacto de la cuantizacion en ventanas WikiText cortas (4x128) y largas (8x512) con KL documentada.
- Prototipos de generacion de texto bilingue en/zh: para flujos donde se acepta un modelo de 9B con calidad reducida a cambio de un artefacto de 3.4 GB en disco (requiere expansion a FP32 en memoria).
- Estudio de sesgos de calibracion: analizar como la calibracion con soluciones MATH autogeneradas afecta a dominios fuera de matematicas (codigo, chino) usando las KL held-out publicadas.

## Benchmarks y rendimiento

| Medicion | Original | Cuantizado packed |
|---|---:|---:|
| Math216 correctos | 83 / 216 | 80 / 216 |
| Precision Math216 | 38.43% | 37.04% |
| Respuestas que agotan cap (1024 tokens) | 131 / 216 | 133 / 216 |
| Tokens generados medios | 867 | 873 |
| Retencion relativa de aciertos | 100% | 96.39% |
| PPL WikiText, 4 x 128 tokens | 22.8068 | 32.0673 (+40.60%) |
| PPL WikiText, 8 x 512 tokens | no disponible en tabla | 15.9057 |
| KL original-cuantizado, 8 x 512 | — | 0.33064 nats |
| KL held-out en / zh / codigo | — | 0.29228 / 0.53406 / 0.21273 nats (media 0.34636) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores provienen de una unica ejecucion, sin intervalo de confianza, y el protocolo math216 no es una muestra del dataset MATH.

## Requisitos de hardware

- VRAM de inferencia: el loader de referencia expande a modelo denso FP32, requiriendo aproximadamente 35.8 GB solo para parametros, mas runtime y cache KV. El tamano de descarga (3.4 GB) no es la VRAM necesaria.
- GPU recomendadas: RTX PRO 6000 Blackwell es el entorno validado. Por requisito de memoria, GPUs de 40-80 GB (A100 40/80 GB, H100, RTX PRO 6000) son las candidatas realistas; GPUs consumer de 24 GB no pueden alojar el modelo denso FP32.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en GPUs de 16 GB en la configuracion FP32 validada. No se documenta una ruta de inferencia packed nativa que redujera la huella.
- Opciones de despliegue: loader de referencia W-ModelForge (obligatorio); `AutoModelForCausalLM.from_pretrained()` no carga los ficheros packed; no es GGUF, por lo que llama.cpp/Ollama no aplican directamente. vLLM/TGI: no disponible (no validado).
- Latencia y throughput: no disponible; no se proporciona kernel de inferencia packed ni cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-LAMQ2 | 9B (denso FP32 ~35.8 GB) | no disponible | opgraph-packed-1 (3.4 GB) | apache-2.0 | PTQ trellis, solo texto, retencion math216 96.39% |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | safetensors (no especificado en la info) | apache-2.0 (segun ficha del base) | Referencia de calidad; math216 83/216 |
| Cuantizaciones GGUF del base | 9B | no disponible | GGUF | apache-2.0 | No disponibles en la informacion proporcionada; comparacion no verificada |

No se dispone de datos comparativos de rendimiento frente a otras cuantizaciones del mismo base en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad material: PPL sube 40.60% en ventanas cortas de validacion; KL media held-out 0.34636 nats.
- Evaluacion muy limitada: un unico protocolo aritmetico sintetico, una sola ejecucion, sin intervalos de confianza, y sin evaluacion de codigo, tool use, instruction following ni multimodal.
- No es GGUF y no se carga con APIs estandar de Transformers; requiere el loader de referencia, lo que limita portabilidad e integracion.
- El loader expande a denso FP32: huella de memoria (~35.8 GB) incompatible con GPUs consumer.
- Solo texto: vision, video y MTP quedan fuera de esta release.
- Idiomas limitados a en y zh; no se documenta soporte de castellano ni de otros idiomas.
- Calibracion basada unicamente en soluciones MATH autogeneradas, lo que puede sesgar el comportamiento fuera de matematicas (visible en la KL de chino, 0.53406 nats, la mas alta).
- No hay kernel packed nativo ni cifras de throughput, por lo que no se puede garantizar rendimiento en produccion.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de benchmarks generales hace arriesgado desplegarla en produccion sin validacion propia.
- Riesgo de alucinacion y sesgos: no evaluado en esta publicacion; se hereda el comportamiento del base sin medicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/W-World-Labs/Qwen3.5-9B-LAMQ2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Repositorio W-ModelForge: https://github.com/W-World-Labs/w-modelforge
- Metodo LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- evaluation.json: incluido en el repositorio del modelo (ruta relativa citada en la model card)
- evaluations/math216-original-1024.json: incluido en el repositorio del modelo
- evaluations/packed-validation-1024.raw.json: incluido en el repositorio del modelo
- evaluations/math216-protocol.json: incluido en el repositorio del modelo
