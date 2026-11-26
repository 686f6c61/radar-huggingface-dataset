# VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-6bit

## Resumen

Nemotron-Labs-Image-30B-A3B es un generador de imagenes autorregresivo desarrollado por NVIDIA Labs. En lugar de usar difusion, el modelo escribe una imagen como una rejilla de tokens visuales discretos que despues decodifica a pixeles mediante un ViT L24SQ incluido. Su arquitectura es hibrida: combina capas Mamba2, atencion y un MoE de 128 expertos con 30B parametros totales y 3B activos por token.

Esta ficha documenta el port no oficial a MLX realizado por VisualInference, optimizado para Apple Silicon. La variante descrita aqui usa cuantizacion de 6 bits para los expertos enrutados y 8 bits para las proyecciones Mamba y de atencion, expertos compartidos y cabeza de salida, con normas, router y embeddings en bf16. Ocupa 29 GB en disco y esta pensada para Macs con 36 GB o mas de memoria unificada.

El modelo es relevante porque demuestra una via alternativa a la difusion para generacion de imagenes (autorregresiva sobre tokens visuales) y porque el port permite ejecutarlo localmente en hardware de consumo Apple con velocidades de 78-82 tok/s y unos 52 segundos por imagen de 1024x1024 en un M5 Max. La licencia NVIDIA es exclusivamente no comercial (investigacion y evaluacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2 / atencion / MoE (128 expertos), autorregresiva sobre tokens visuales discretos; decodificador ViT L24SQ |
| Parametros totales | 30B |
| Parametros activos | 3B (MoE con 128 expertos enrutados, 6 activos por token segun tag experts6-dense8) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits en expertos enrutados; 8 bits en proyecciones Mamba y atencion, expertos compartidos y cabeza de salida (afin grupo 64); bf16 en normas, router y embeddings. Existen tiers 5 bits y 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | NVIDIA License (other), solo uso no comercial: investigacion y evaluacion |
| Formato de pesos | safetensors (MLX), con codigo Python incluido; tamano del repo 30,8 GB (29 GB en disco) |

## Arquitectura y entrenamiento

El modelo base de NVIDIA es un generador de imagenes autorregresivo que representa la imagen como una rejilla de tokens visuales discretos. La red troncal es hibrida: intercala capas Mamba2 (modelo de espacio de estados) con capas de atencion y un mezclador de expertos (MoE) de 128 expertos, del cual se activan 6 por token (3B parametros activos sobre 30B totales). Los tokens visuales generados se decodifican a pixeles con un ViT L24SQ incluido en el paquete. El pipeline declarado es text-to-image y el idioma de trabajo es el ingles.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO. El port MLX introduce decisiones numericas especificas: flujo residual en bf16, RMSNorm redondeada una sola vez, router MoE en bf16 con logits en fp32 (equivalente a vLLM en H100), y convolucion Mamba, softplus, decay y estado SSM en fp32. Ademas, el port aplica una mascara de gramatica de imagen tras `<|img_start|>` que corrige un bug del modelo original: a 880x1184 el modelo original escribe una cabecera de anchura incorrecta (width=884 con probabilidad 1.0) que hace que el `infer.py` oficial rechace la imagen. La mascara solo reescala probabilidades permitidas, por lo que reproduce token a token las salidas aceptadas por el pipeline oficial (verificado: 4.175 de 4.175 tokens identicos en pesos reales).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante generacion autorregresiva de tokens visuales y decodificacion con ViT L24SQ.
- Resoluciones multiples de 16 pixeles; recomendadas 1024x1024, 1184x880, 1248x832 y 880x1184.
- Generacion por lotes de varias candidatas con `--seeds 1,2,3,4`, con mayor rendimiento por minuto.
- Salida en PNG con un sidecar JSON que incluye ajustes y tiempos de ejecucion.
- Reproduccion del muestreador con semilla de vLLM, incluido el flujo de ruido Philox de CUDA para una semilla dada.
- Modo `--unconstrained` para muestrear exactamente como la referencia, incluidos los fallos de cabecera.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de ilustraciones y posters: el modelo acepta prompts descriptivos en ingles y resoluciones como 880x1184, adecuado para prototipado rapido de material grafico en local sin depender de servicios en la nube.
- Investigacion en generacion autorregresiva de imagenes: permite estudiar el paradigma de tokens visuales discretos frente a difusion, con pesos reales y codigo de inferencia reproducible en Apple Silicon.
- Evaluacion de cuantizacion en MLX: los tiers 5, 6 y 8 bits permiten medir el compromiso entre fidelidad (KL frente a fp32) y velocidad en distintos Macs, util para quien investigue tecnicas de cuantizacion.
- Pruebas de concepto de pipelines text-to-image en local: con 29 GB en disco y ~52 s por imagen de 1024² en un M5 Max, sirve para demos y validacion de ideas sin GPU dedicada.
- Generacion por lotes de candidatas: el flag `--seeds` permite renderizar varias imagenes por prompt en una sola pasada, util para seleccion curada de resultados en flujos de diseno.
- Reproduccion y depuracion de muestreadores: al replicar el sampler de vLLM y el flujo Philox, es util para comparar implementaciones y estudiar la sensibilidad a redondeos bf16 en modelos autorregresivos multimodales.
- Formacion y docencia: el paquete incluye documentacion de metodos y resultados (`code/docs/FINDINGS.md`, `code/docs/RESULTS.md`) que sirve como material de estudio de arquitecturas hibridas Mamba/MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se incluyen metricas de fidelidad y velocidad del port:

| Metrica | bf16 (precision oficial vLLM) | Este tier (6 bits expertos / 8 bits resto) |
|---|---|---|
| KL vs fp32 (nats/token) | 0,0176 | 0,0290-0,0301 |
| Multiplo del suelo bf16 | 1,00 | 1,65-1,71 |
| Tokens muestreados distintos de fp32 | 9,65% | 12,1% |
| NLL vs fp32 | +0,003 | +0,019 |

| Rendimiento | Valor |
|---|---|
| Velocidad en M5 Max 36 GB | 78-82 tok/s |
| Tiempo por imagen 1024² en M5 Max | ~52 s |
| Memoria pico | 29,5 GB |
| Lotes de 2 | 61 tok/s por imagen |
| Eficiencia frente a roofline de ancho de banda | ~85-88% |
| Tiempo del decodificador de pixeles | <1 s (fp32) |

Las mediciones de fidelidad se hicieron sobre 24 secuencias reales (99.564 tokens de imagen generados: 8 prompts de la galeria oficial a 4 resoluciones y 8 prompts de prueba visual x 2 semillas), con teacher forcing frente al modelo en fp32.

## Requisitos de hardware

- VRAM/memoria unificada: 29,5 GB de pico; recomendado Mac con 36 GB o mas (poco margen).
- GPU: Apple Silicon (M1 en adelante). Probado en M5 Max 36 GB con pesos reales (24 renders) y en M4 Pro 48 GB (misma variante construida en memoria). Se espera funcionamiento en cualquier Mac Apple Silicon con memoria suficiente; M1 es mas lento por no tener bf16 nativo.
- Cabe en GPU de consumo: si, en Macs Apple Silicon con 36 GB o mas; no esta pensado para GPUs NVIDIA consumer por ser un port MLX.
- Despliegue: libreria MLX 0.32.5, Python 3.11+, paquete `code/` incluido con el comando `nemotron-image`; descarga via `hf download`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este port.
- Latencia y throughput: 78-82 tok/s (~52 s por imagen 1024²) en M5 Max; 61 tok/s por imagen en lotes de 2.
- Otros tiers: 8 bits para Macs de 48 GB o mas (1,05x); 5 bits para 36 GB con mayor fidelidad (1,6x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este port (Nemotron-Labs-Image-30B-A3B MLX 6-bit) | 30B totales / 3B activos | no disponible | Autorregresivo Mamba2/atencion/MoE | NVIDIA License, no comercial | Hugging Face (MLX, Apple Silicon) |
| Nemotron-Labs-Image-30B-A3B (original NVIDIA) | 30B totales / 3B activos | no disponible | Autorregresivo Mamba2/atencion/MoE | NVIDIA License, no comercial | Hugging Face (PyTorch/vLLM) |
| Tiers alternativos del mismo port (5 bits y 8 bits) | 30B totales / 3B activos | no disponible | Autorregresivo Mamba2/atencion/MoE | NVIDIA License, no comercial | Hugging Face (MLX) |

No se dispone en la informacion proporcionada de datos sobre otros modelos comparables de la misma categoria (generacion de imagenes autorregresiva) ni de sus benchmarks, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Licencia NVIDIA exclusivamente no comercial (investigacion y evaluacion); no apto para uso comercial.
- Solo soporta ingles (`language: en`).
- Port no oficial: no esta afiliado ni respaldado por NVIDIA.
- No se puede garantizar identidad token a token con las salidas oficiales: el redondeo bf16 por si solo cambia ~10% de los tokens muestreados respecto al modelo exacto, y cada token posterior depende del anterior. La misma semilla da una imagen de la misma familia de prompt, no los mismos pixeles, en otra GPU, configuracion de paralelismo o port.
- Incluso dentro de este port, la misma semilla en un M4 Pro y un M5 Max difiere desde el token 18 y el token 61 en dos pruebas, porque las GPU redondean de forma distinta los productos matriciales bf16.
- Riesgo de alucinacion visual: el modelo puede generar imagenes que no correspondan fielmente al prompt; no se documentan tasas.
- El modelo original tiene un bug de cabecera de imagen a 880x1184 (width=884 con probabilidad 1.0) que el pipeline oficial rechaza; este port lo corrige por defecto con una mascara de gramatica, pero `--unconstrained` reproduce el fallo.
- Memoria ajustada: con 36 GB el pico de 29,5 GB deja poco margen para otras aplicaciones.
- No se documentan sesgos conocidos en la informacion disponible.
- Requiere MLX 0.32.5 y Python 3.11+; el soporte esta limitado a Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-6bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Tier 8 bits: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-8bit
- Tier 5 bits: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-5bit
- Documentacion de metodos y numeros: `code/docs/FINDINGS.md` y `code/docs/RESULTS.md` (incluidos en el repositorio)
- Licencia: `LICENSE` (NVIDIA License) y `NOTICE` en el repositorio
