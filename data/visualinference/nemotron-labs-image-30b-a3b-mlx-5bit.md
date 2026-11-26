# VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-5bit

## Resumen

Nemotron-Labs-Image-30B-A3B es un generador de imagenes autorregresivo desarrollado por NVIDIA. En lugar de usar difusion, el modelo escribe una imagen como una rejilla de tokens visuales discretos que despues son decodificados a pixeles por un ViT L24SQ incluido. La arquitectura es hibrida: combina capas Mamba2, atencion y un MoE de 128 expertos con 30B parametros totales y 3B activos por token.

Esta ficha cubre la version publicada por VisualInference: un port no oficial a MLX para Apple Silicon con los expertos enrutados cuantizados a 5 bits (afina, grupo 64) y el resto de capas en bf16. Ocupa 27 GB en disco y esta pensada para Macs con 36 GB de memoria unificada. Es la variante de mayor fidelidad que cabe en ese limite; la de 6 bits puntua mejor pero no entra en 36 GB con las capas densas en bf16.

El modelo es relevante porque demuestra una via alternativa a la difusion para generacion de imagen en hardware de consumo Apple, con un pipeline completo (generacion de tokens, gramatica de imagen y decodificacion a pixeles) y con mediciones de fidelidad frente a la implementacion de referencia en fp32. La licencia es la NVIDIA License, restringida a uso no comercial (investigacion y evaluacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2 / atencion / MoE de 128 expertos (familia nemotron_h), generacion autorregresiva de tokens visuales |
| Parametros totales | 30B |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 5 bits (afina, grupo 64); resto de capas en bf16. Existen tiers de 4, 6 y 8 bits publicados por el mismo autor |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA License (other), uso no comercial: investigacion o evaluacion |
| Formato de pesos | safetensors (MLX), con codigo Python propio en `code/` y decodificador L24SQ incluido |
| Tamano del repo | 29,3 GB (27 GB en disco) |
| Pipeline | text-to-image |
| Libreria | mlx (Python 3.11+, MLX 0.32.5) |
| Modelo base | nvidia/Nemotron-Labs-Image-30B-A3B |

## Arquitectura y entrenamiento

El modelo base de NVIDIA es un generador de imagen autorregresivo: produce una secuencia de tokens visuales discretos organizada como una rejilla con cabecera y marcadores de fila, y un ViT L24SQ incluido la decodifica a pixeles. El backbone es hibrido, con capas Mamba2 (estado SSM en fp32 en este port), atencion y un MoE de 128 expertos que activa 3B de los 30B parametros por token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El port a MLX introduce varias decisiones tecnicas concretas. El paso de decodificacion es un grafo MLX compilado de forma fija por token (estados Mamba, cache KV preasignada y ruido de muestreo como kernel Metal), que alcanza el 85-88 % del roofline de ancho de banda de memoria medido. La tabla de embeddings de 1,76 GB esta mapeada en memoria (o en GPU si hay espacio) y el decodificador de pixeles corre en fp32 tras la generacion en menos de un segundo. En numerica, el flujo residual va en bf16, RMSNorm se redondea una vez, el router MoE calcula bf16 x bf16 hacia logits fp32 (como vLLM en H100) y conv, softplus, decay y estado SSM de Mamba van en fp32. Ademas, el paquete desactiva el uso de TF32 en GEMMs float32 antes del primer GEMM en GPUs M5. El puerto impone una gramatica de imagen tras `<|img_start|>` que corrige un bug del modelo original: a 880x1184 el modelo exacto escribe una cabecera de anchura erronea (`width=884` con probabilidad 1.0) y el `infer.py` oficial rechaza la imagen; el enmascaramiento solo reescala probabilidades, de modo que reproduce token a token las salidas que el pipeline oficial aceptaria (4.175 de 4.175 tokens identicos sobre pesos reales).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en tamanos multiples de 16, con resoluciones recomendadas de 1024x1024, 1184x880, 1248x832 y 880x1184.
- Renderizado por lotes de varias semillas en una sola pasada (`--seeds 1,2,3,4`) para aumentar imagenes por minuto.
- Generacion de texto dentro de la imagen (el autor reporta que los tiers de 4 bits pierden precision en texto, lo que implica que el modelo escribe texto legible en condiciones normales).
- Salida con sidecar JSON por PNG con ajustes y tiempos de ejecucion.
- Modo `--unconstrained` para muestrear exactamente como la referencia, incluidos los fallos de gramatica.
- Reproduccion del muestreador con semilla de vLLM, incluido el flujo de ruido Philox de CUDA para una semilla dada.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Prototipado de carteles y material grafico: el ejemplo de la model card es un poster risograph en rosa y turquesa con titular "LOW TIDE ORCHESTRA"; el modelo escribe texto legible en la imagen, lo que lo hace util para maquetas con titulares.
- Iteracion de concepto en local sobre Mac: con unos 67 s por imagen a 1024² en un M5 Max, un disenador puede generar varias semillas en lote y elegir candidatas sin enviar prompts a servicios externos.
- Investigacion sobre generacion autorregresiva de imagen: el port incluye documentacion de metodos y numeros crudos (`code/docs/FINDINGS.md`, `code/docs/RESULTS.md`) y permite comparar fidelidad frente a fp32 con secuencias reales.
- Evaluacion de cuantizacion en MoE para vision: al existir tiers de 4, 5, 6 y 8 bits con metricas de KL y NLL frente a fp32, sirve para estudiar el impacto de la precision de los expertos en la calidad visual.
- Generacion de imagenes en entornos sin conectividad: al ejecutarse integramente en local con pesos descargados, encaja en flujos con requisitos de privacidad o air-gapped.
- Reproduccion de experimentos con semilla: el muestreador replica el flujo de ruido de vLLM, lo que permite comparar familias de imagenes para una misma semilla entre implementaciones, aunque no pixeles identicos.
- Docencia y demos de arquitecturas hibridas Mamba/MoE: el codigo del runner y el decodificador L24SQ quedan incluidos y auditables bajo la misma licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. Los datos publicados son de fidelidad numerica y de rendimiento:

| Metrica | bf16 (precision oficial vLLM) | Este tier (5 bits) |
|---|---|---|
| KL vs fp32 (nats/token) | 0,0176 | 0,0282 |
| Multiplo del suelo bf16 | 1,00 | 1,60 |
| Tokens muestreados distintos de fp32 | 9,65 % | 11,9 % |
| NLL vs fp32 | +0,003 | +0,017 |

Medido sobre 24 secuencias reales (99.564 tokens de imagen generados: 8 prompts de la galeria oficial a 4 resoluciones y 8 prompts de prueba visual x 2 semillas), con teacher forcing, contra el modelo ejecutado exactamente en fp32 (que coincide con el modulo PyTorch upstream a ~1e-6 por capa).

Rendimiento en M5 Max de 36 GB: 61-63 tok/s, aproximadamente 67 s por imagen de 1024², pico de 27,9 GB. El tier de 6 bits es un 22 % mas rapido pero puntua 1,7x; el de 8 bits puntua 1,05x y requiere 48 GB o mas.

## Requisitos de hardware

- VRAM/memoria unificada: 27,9 GB de pico en M5 Max de 36 GB; 27 GB en disco.
- GPU: Apple Silicon con memoria suficiente; probado en M5 Max de 36 GB con pesos reales. Se espera que funcione en cualquier Mac Apple Silicon con memoria suficiente; M1 es mas lento por no tener bf16 nativo.
- Cabe en GPU de consumo Apple: si, en Macs de 36 GB o mas. El tier de 8 bits requiere 48 GB o mas.
- Despliegue: paquete MLX propio (`pip install ./nemotron-image-5bit/code`) con CLI `nemotron-image`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este port.
- Latencia y throughput: 61-63 tok/s y ~67 s por imagen 1024² en M5 Max; el decodificador de pixeles anade menos de 1 s en fp32.
- Nota de reproducibilidad: la misma semilla y tier en un M4 Pro y un M5 Max difieren en el token 18 y el token 61 en dos pruebas, porque las dos GPUs redondean de forma distinta los productos de matrices bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-Labs-Image-30B-A3B MLX 5-bit) | 30B totales, 3B activos | no disponible | Autorregresivo con ViT L24SQ, port MLX | NVIDIA License, no comercial | Hugging Face, MLX |
| nvidia/Nemotron-Labs-Image-30B-A3B | 30B totales, 3B activos | no disponible | Autorregresivo con ViT L24SQ, PyTorch/vLLM | NVIDIA License, no comercial | Hugging Face |
| Nemotron-Labs-Image-30B-A3B MLX 6-bit | 30B totales, 3B activos | no disponible | Igual, expertos a 6 bits | NVIDIA License, no comercial | Hugging Face, MLX |
| Nemotron-Labs-Image-30B-A3B MLX 8-bit | 30B totales, 3B activos | no disponible | Igual, expertos a 8 bits | NVIDIA License, no comercial | Hugging Face, MLX |

No se dispone de datos para comparar con generadores de difusion de tamano similar en calidad de imagen ni en latencia, ya que la informacion proporcionada no incluye benchmarks de ese tipo.

## Limitaciones y advertencias

- Licencia NVIDIA License: uso no comercial unicamente (investigacion o evaluacion). El runner en `code/` se distribuye bajo la misma licencia por contener un port del decodificador L24SQ de NVIDIA; las partes derivadas de ficheros Apache-2.0 conservan sus avisos.
- Port no oficial: no esta afiliado ni respaldado por NVIDIA.
- Solo ingles: los prompts deben formularse en ingles.
- Reproducibilidad limitada: ninguna implementacion puede reproducir token a token las salidas oficiales; el redondeo bf16 por si solo cambia cerca del 10 % de los tokens muestreados respecto al modelo exacto, y el primer cambio suele aparecer en la primera fila de la rejilla. La misma semilla da una imagen de la misma familia de prompt, no los mismos pixeles, en otra GPU, configuracion de paralelismo o port.
- Fidelidad inferior a bf16: este tier tiene 1,60x el suelo de KL de bf16 y un 11,9 % de tokens distintos de fp32 frente al 9,65 % de bf16.
- Bug del modelo original: a 880x1184 el modelo exacto escribe una cabecera de anchura erronea y el `infer.py` oficial rechaza la imagen; este port lo corrige con enmascaramiento de gramatica. Con `--unconstrained` se reproduce el fallo.
- Riesgo de alucinacion visual: no se documentan tasas de fallo semantico ni de adherencia al prompt; los datos publicados son de fidelidad numerica, no de calidad perceptiva.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Requisito de memoria estricto: el tier de 5 bits esta calibrado para 36 GB; el de 6 bits no cabe en ese limite con las capas densas en bf16.
- Rendimiento dependiente del hardware: M1 es mas lento por carecer de bf16 nativo; en GPUs M5 el paquete desactiva TF32 para GEMMs float32, lo que afecta al rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-5bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Tier 8 bits: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-8bit
- Tier 6 bits: https://huggingface.co/VisualInference/Nemotron-Labs-Image-30B-A3B-MLX-6bit
- Documentacion de metodos y numeros crudos: `code/docs/FINDINGS.md` y `code/docs/RESULTS.md` dentro del repositorio
- Licencia: fichero `LICENSE` del repositorio; avisos upstream en `NOTICE`
