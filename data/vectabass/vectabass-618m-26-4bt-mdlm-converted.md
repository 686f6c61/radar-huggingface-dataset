# VectaBass/vectabass-618m-26.4bt-mdlm-converted

## Resumen

vectabass-618m-26.4bt-mdlm-converted es un modelo de lenguaje de 618 millones de parámetros (527,7 M no-embedding) desarrollado por VectaBass, un proyecto centrado en IA soberana para el Reino Unido y en el estudio de leyes de escalado. Se trata de un modelo autorregresivo (AR) previamente entrenado que ha sido convertido a un modelo de difusión enmascarada (MDLM, *masked diffusion language model*) mediante un entrenamiento adicional de 26,39 mil millones de tokens. Forma parte del conjunto de conversión de la Fase 1, que incluye un modelo por cada tamaño N1 a N6, siendo este el N4.

El modelo parte del checkpoint `VectaBass/vectabass-618m-26.5bt-base-cooled` (celda N4-D5 del cuadrado AR) tras su fase de enfriamiento, y se reentrena con un objetivo de ELBO negativo en tiempo continuo. La arquitectura subyacente es un transformer de tipo Llama con atención exclusiva auto-atencional (XSA) y GQA 2:1, adaptada para ser bidireccional desde el primer paso de la difusión. La longitud de contexto es de 2048 tokens.

Su relevancia radica en que es un modelo de investigación para estudiar leyes de escalado en modelos de difusión de lenguaje, no un modelo de producción. No está ajustado por instrucciones ni por seguridad, y el autor advierte explícitamente de que los hechos que genera suelen ser incorrectos. La licencia Apache 2.0 permite uso comercial, pero su naturaleza experimental limita seriamente su aplicación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con atención bidireccional, GQA 2:1 y XSA (exclusive self-attention); convertido a MDLM (masked diffusion language model) |
| Parametros totales | 617.852.928 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado `modeling_vectabass.py`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La red es la pila tipo Llama del modelo padre con atención exclusiva auto-atencional (XSA), transformada en bidireccional desde el primer paso. El modelo tiene 15 capas, anchura 1792, 28 cabezas de consulta y 14 de clave-valor de dimensión 64, feed-forward SwiGLU de 4752 y normalización RMSNorm pre-norm. Los parámetros no-embedding son 527.708.160 y los embeddings están atados.

El entrenamiento de conversión a MDLM utilizó 26.390.560.768 tokens (T = 50 N) con objetivo MDLM de alpha_t lineal (1 - t) y pérdida de ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). El calentamiento fue lineal desde 0 durante 53 M tokens (0,1 N), seguido de tasa constante, con pico de LR de 0,00148 y decaimiento 1-sqrt a partir del 80 % de T. No se usó weight decay. El optimizador fue Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 (0.9, 0.95), con estado reiniciado y sin reutilizar el del padre. Los datos provienen de la vista de la fase 1 (fineweb-edu, fineweb-2 y finemath), con ventanas reproducidas en el orden del padre y lotes de 524.288 tokens. El entrenamiento se ejecutó en una NVIDIA GH200 de 120 GB en bf16 con pesos maestros en fp32.

La innovación principal es la conversión AR→MDLM: cada posición predice su propio token limpio (objetivos no desplazados) y la generación se realiza rellenando máscaras mediante `diffusion_generate`, que añade `gen_length` máscaras al prompt y las rellena en `steps` pasadas hacia delante. El token de máscara es el id 50283.

## Capacidades

- Generación de texto mediante difusión enmascarada con relleno iterativo de máscaras (no generación autorregresiva token a token).
- Rellenado condicionado por prompt: dado un contexto, completa las posiciones enmascaradas con la distribución del token limpio.
- Extracción de características (pipeline declarado: `feature-extraction`); `model(ids).logits` devuelve en cada posición la distribución del token limpio.
- Multilingüismo limitado a siete lenguas: inglés y seis lenguas celtas y escocesas (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.
- No está ajustado por instrucciones ni por seguridad.

## Casos de uso

- Investigación sobre leyes de escalado en modelos de difusión de lenguaje: el modelo sirve como punto de datos N4 dentro del conjunto de conversión N1–N6 para comparar curvas de pérdida y ELBO negativo frente a modelos AR del mismo tamaño.
- Estudio comparativo AR vs. MDLM: permite medir fluidez, diversidad y repetición de la generación por difusión frente al modelo autorregresivo padre, usando las métricas del autor (bits por byte UTF-8, bigramas distintos, 4-gramas repetidos).
- Experimentación con muestreo y decodificación: el modelo está pensado para probar órdenes de relleno (confianza, aleatorio), penalizaciones de presencia y programaciones lineales en `diffusion_generate`.
- Extracción de representaciones para análisis lingüístico: al ser bidireccional, puede usarse para obtener embeddings contextuales de documentos en inglés y lenguas celtas.
- Evaluación de cobertura multilingüe en lenguas de bajos recursos: útil para estudiar el comportamiento del modelo en galés, irlandés, gaélico escocés, manés, córnico y escocés, aunque sin garantías de calidad.
- Reproducción de experimentos de conversión: el recetario detallado (optimizador, LR, máscara con ruido gaussiano, datos) permite replicar la conversión sobre otros checkpoints AR de la misma familia.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La model card incluye un estudio de muestreo realizado sobre la conversión N6 (`VectaBass/vectabass-1.73b-80bt-mdlm-converted`), no sobre este N4, con 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados y una semilla. Las métricas son bits por byte UTF-8 (evaluadas por Qwen3-8B-Base), proporción de bigramas distintos y proporción de 4-gramas repetidos.

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| Modelo AR del mismo tamaño (N6-D6), top-p 0,95 | 0,69 | 0,75 | 9 % |
| Confianza, argmax, penalización de presencia 4 incl. prompt (por defecto) | 0,59 | 0,81 | 10 % |
| Igual, sin penalización | 0,13 | 0,19 | 78 % |
| Orden aleatorio, muestreo ancestral exacto | 1,43 | 0,79 | 10 % |

Los errores estándar en bits por byte son de aproximadamente 0,05 a 0,06 con una semilla y 32 prompts. El autor indica que estos números corresponden a la conversión N6 y que el tamaño N4 no fue evaluado en el estudio de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2–1,5 GB para los pesos (617,9 M parámetros × 2 bytes ≈ 1,24 GB) más overhead de activaciones y caché.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, así como en GPUs de datacenter (A100, H100, GH200).
- El autor entrenó en 1 × NVIDIA GH200 120 GB, pero la inferencia no requiere ese hardware.
- Despliegue mediante `transformers` con `trust_remote_code=True` y el método `diffusion_generate` del código personalizado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo recomendado usa un token por paso (`steps = gen_length`), por lo que generar 256 tokens requiere 256 pasadas hacia delante, lo que implica un coste computacional notablemente superior al de la decodificación autorregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-618m-26.4bt-mdlm-converted | 617,9 M (527,7 M no-embedding) | 2048 | MDLM (difusión enmascarada), base, no instruction-tuned | Apache 2.0 | HuggingFace |
| vectabass-618m-26.5bt-base-cooled (padre) | 617,9 M | 2048 | AR transformer, base, no instruction-tuned | Apache 2.0 (según modelo base) | HuggingFace |
| vectabass-1.73b-80bt-mdlm-converted (N6) | 1,73 B (aprox.) | No disponible | MDLM, base | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, otros MDLM de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni por seguridad: no debe usarse como asistente conversacional sin ajuste posterior.
- El autor advierte de que los hechos generados suelen ser incorrectos; el riesgo de alucinación es alto.
- Sin penalización de presencia, el orden por confianza entra en bucles; con penalización 4 se mitiga, pero es una heurística que sesga contra palabras repetidas y no es muestreo exacto.
- Las listas, tablas y código, donde la repetición es correcta, no fueron evaluados y las listas siguen repitiéndose.
- Mantener un token por paso es obligatorio para la calidad recomendada; cuatro tokens por paso degrada la fluidez (0,93 bits por byte, bigramas distintos 0,59).
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR; temperatura, top-k, top-p y min-p no alcanzan texto real.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete idiomas, con calidad no garantizada en las lenguas celtas.
- Es un modelo de investigación para estudios de escalado; no hay evidencia de robustez en producción.
- La licencia Apache 2.0 permite uso comercial, pero la falta de ajuste y la baja fiabilidad factual desaconsejan su uso en aplicaciones comerciales sin validación exhaustiva.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-618m-26.4bt-mdlm-converted
- Modelo base (padre): https://huggingface.co/VectaBass/vectabass-618m-26.5bt-base-cooled
- Conversión N6 citada en el estudio de muestreo: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo (no se proporciona URL directa)
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo (no se proporciona URL directa)
