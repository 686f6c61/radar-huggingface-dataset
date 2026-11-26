# VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-8bit

## Resumen

Nemotron-Labs-Image-30B-A3B es un generador de imagenes autoregresivo desarrollado por NVIDIA. En lugar de emplear difusion, el modelo escribe cada imagen como una rejilla de tokens visuales discretos que despues son decodificados a pixeles por un ViT L24SQ incluido en el paquete. Su arquitectura es hibrida: combina capas Mamba2, atencion y un MoE de 128 expertos con 30.000 millones de parametros totales y 3.000 millones activos por token, lo que lo situa en la categoria de modelos dispersos de gran capacidad pero coste de inferencia contenido.

La ficha que nos ocupa no es el modelo original, sino un port no oficial a MLX realizado por VisualInference para Apple Silicon, en su variante de cuantizacion 8 bits de los expertos enrutados. Esta pensado para Macs con 48 GB de memoria o mas, ocupa 38 GB en disco y reproduce el pipeline oficial con una fidelidad medida de 1,05x el suelo de bf16 respecto al modelo exacto en fp32.

Su relevancia es doble: por un lado demuestra que un generador de imagenes de 30B con MoE hibrido puede ejecutarse de forma local en hardware de consumo Apple; por otro, documenta y corrige un bug del modelo original que generaba cabeceras de tamano incorrectas en ciertas resoluciones. La licencia es NVIDIA License, restringida a uso no comercial (investigacion y evaluacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba2 + atencion + MoE de 128 expertos (familia nemotron_h) |
| Parametros totales | 30B (aproximado, segun denominacion del modelo) |
| Parametros activos | 3B (aproximado, segun denominacion del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (afin, grupo 64) en expertos enrutados; resto en bf16. Existen tiers 5-bit y 6-bit |
| Idiomas soportados | en |
| Licencia | NVIDIA License (nvidia-license), solo uso no comercial |
| Formato de pesos | safetensors (MLX), con codigo Python personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo es un generador de imagenes autoregresivo construido sobre una arquitectura hibrida de la familia nemotron_h: intercala capas Mamba2 con capas de atencion y utiliza una capa MoE de 128 expertos con enrutamiento disperso (30B totales, 3B activos). La generacion produce una rejilla de tokens visuales discretos, que un decodificador ViT L24SQ convierte a pixeles en fp32 tras la generacion (menos de 1 segundo). El pipeline es text-to-image puro: la entrada es un prompt en ingles y la salida, una imagen.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El port MLX mantiene los pesos originales de NVIDIA y solo modifica la precision numerica: el flujo residual va en bf16, el router MoE calcula logits en fp32 (como vLLM en H100), y las operaciones de Mamba (convolucion, softplus, decay y estado SSM) se ejecutan en fp32. El paso de decodificacion es un grafo MLX compilado de forma fija por token, con estados Mamba preasignados, cache KV reservada y ruido de muestreo implementado como kernel de Metal, alcanzando un 85-88% del limite de ancho de banda de memoria medido. El muestreador reproduce el sampler con semilla de vLLM, incluido el flujo de ruido Philox de CUDA.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, con resoluciones multiplo de 16 (recomendadas 1024x1024, 1184x880, 1248x832 y 880x1184).
- Generacion por lotes de varias semillas en una sola pasada (`--seeds 1,2,3,4`), lo que mejora el rendimiento por imagen.
- Reproducibilidad parcial por semilla: misma familia de imagenes para un mismo prompt y semilla, aunque no identidad pixel a pixel.
- Salida con metadatos: cada PNG genera un sidecar JSON con ajustes y tiempos de ejecucion.
- Modo `--unconstrained` para replicar exactamente el comportamiento del modelo de referencia, incluidos sus fallos de formato.
- Aplicacion de gramatica de imagen tras `<|img_start|>` para garantizar imagenes validas por defecto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un generador de imagenes.
- Capacidad multilingue limitada al ingles (`language: [en]`).

## Casos de uso

- Generacion local de ilustraciones en Mac: un estudio pequeno puede producir imagenes de concepto sin depender de APIs en la nube, ejecutando el modelo en un M4 Pro de 48 GB a unos 115 segundos por imagen de 1024x1024.
- Exploracion de variantes de diseno: el lote de semillas permite renderizar cuatro candidatos en una pasada (unos 50 segundos por imagen), util para iterar sobre carteles, portadas o mockups.
- Investigacion en generacion autoregresiva de imagenes: el port documenta fidelidad numerica frente a fp32 y bf16, lo que lo convierte en una herramienta para estudiar el impacto de la cuantizacion en modelos MoE hibridos.
- Evaluacion comparativa de precisión: los tiers 5-bit, 6-bit y 8-bit permiten medir el compromiso entre memoria, velocidad y calidad en el mismo hardware, con metricas KL y NLL publicadas.
- Prototipado de pipelines text-to-image en entornos Apple Silicon: integrable en scripts Python mediante el paquete `code/` y la CLI `nemotron-image`, con salida PNG y JSON para trazabilidad.
- Docencia y demostraciones: al ejecutarse en un portatil o Mac Studio sin GPU dedicada, sirve para explicar arquitecturas MoE hibridas y decodificacion de tokens visuales en un aula o taller.
- Pruebas de robustez de formato: el modo `--unconstrained` permite reproducir el bug de cabecera del modelo original y validar sistemas de post-procesado de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si aporta metricas de fidelidad y rendimiento de inferencia:

| Metrica | bf16 (referencia vLLM) | Este tier (8-bit) |
|---|---|---|
| KL vs fp32 (nats/token) | 0,0176 | 0,0185 |
| Factor sobre el suelo bf16 | 1,00 | 1,05 |
| Tokens muestreados distintos de fp32 | 9,65% | 9,95% |
| NLL vs fp32 | +0,003 | +0,001 |

| Metrica de inferencia (M4 Pro, 48 GB) | Valor |
|---|---|
| Throughput | 36,4 tok/s |
| Tiempo por imagen 1024x1024 | ~115 s |
| Tiempo por imagen en lote de 4 semillas | ~50 s |
| Pico de memoria | 39,1 GB |
| Uso del limite de ancho de banda | 85-88% |

## Requisitos de hardware

- VRAM/memoria unificada: 38 GB en disco; pico medido de 39,1 GB en inferencia. Recomendado Mac con 48 GB o mas para el tier 8-bit.
- GPU recomendadas: Apple Silicon M4 Pro (48 GB) es el hardware validado. Se espera funcionamiento en cualquier Mac con memoria suficiente; M1 es mas lento por carecer de bf16 nativo.
- Cabe en GPU de consumo: si, en Macs de gama alta con memoria unificada. No esta pensado para GPUs NVIDIA de consumo, ya que el formato es MLX.
- Opciones de despliegue: MLX 0.32.5 o superior, Python 3.11+, paquete `code/` del repositorio y CLI `nemotron-image`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este port.
- Latencia y throughput: 36,4 tok/s y ~115 s por imagen 1024x1024 en M4 Pro; ~50 s por imagen en lotes de 4. El decodificador de pixeles anade menos de 1 segundo en fp32.
- Nota: en GPUs M5, MLX ejecuta GEMM en float32 como TF32 por defecto; el paquete lo desactiva antes del primer GEMM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B (este port, 8-bit) | 30B totales / 3B activos | no disponible | Autoregresivo, Mamba2 + atencion + MoE, MLX | NVIDIA License (no comercial) | Hugging Face, solo Apple Silicon |
| Nemotron-Labs-Image-30B-A3B (original NVIDIA) | 30B totales / 3B activos | no disponible | Autoregresivo, Mamba2 + atencion + MoE, PyTorch/vLLM | NVIDIA License (no comercial) | Hugging Face |
| Port 5-bit del mismo modelo | 30B totales / 3B activos | no disponible | Igual, cuantizacion 5-bit | NVIDIA License (no comercial) | Hugging Face, Macs de 36 GB |
| Port 6-bit del mismo modelo | 30B totales / 3B activos | no disponible | Igual, cuantizacion 6-bit | NVIDIA License (no comercial) | Hugging Face, Macs de 36 GB |

No se dispone de informacion sobre modelos de difusion comparables (por ejemplo, familias Stable Diffusion o Flux) en la documentacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Licencia restrictiva: NVIDIA License permite unicamente investigacion y evaluacion; el uso comercial esta prohibido. El runner en `code/` hereda la misma licencia por contener un port del decodificador L24SQ de NVIDIA.
- Port no oficial: no esta afiliado ni respaldado por NVIDIA; los resultados pueden diferir del pipeline original.
- Solo ingles: el modelo no soporta prompts en castellano ni en otros idiomas.
- Reproducibilidad limitada: ningun port puede igualar token a token la salida oficial, porque el redondeo bf16 ya altera cerca del 10% de los tokens muestreados. La misma semilla produce imagenes de la misma familia, no los mismos pixeles, incluso entre dos Macs distintos (M4 Pro y M5 Max difieren en los tokens 18 y 61 en dos pruebas).
- Bug upstream documentado: en 880x1184 el modelo original escribe una cabecera de anchura incorrecta (884) con probabilidad 1,0, lo que hace que `infer.py` rechace la imagen. Este port lo corrige aplicando gramatica, pero el modo `--unconstrained` reproduce el fallo.
- Riesgo de alucinacion visual: al ser un generador autoregresivo de tokens, puede producir artefactos, texto ilegible o composiciones incoherentes, especialmente en prompts complejos.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse con datos no especificados, puede reflejar sesgos de representacion.
- Requisitos de memoria elevados: 39,1 GB de pico excluyen Macs de 16 o 24 GB; para 36 GB hay que usar los tiers 5-bit o 6-bit.
- Rendimiento dependiente del hardware: M1 sin bf16 nativo es notablemente mas lento; no hay datos de latencia para otros chips.
- Sin soporte de agentes ni tool calling: no es adecuado para pipelines que requieran razonamiento multi-paso o llamadas a funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-8bit
- Modelo base original: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Tier 5-bit: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-5bit
- Tier 6-bit: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-6bit
- Documentacion tecnica incluida en el repo: `code/docs/FINDINGS.md` y `code/docs/RESULTS.md`
- Licencia: archivo `LICENSE` del repositorio; avisos upstream en `NOTICE`
