# VectaBass/vectabass-1.03b-45.9bt-mdlm-converted

## Resumen

VectaBass 1.03b 45.9bt MDLM converted es un modelo de lenguaje de tipo masked diffusion (MDLM) desarrollado por VectaBass, un proyecto centrado en IA soberana para el Reino Unido y las lenguas celtas. Se trata de la version N5 de un conjunto de conversion que transforma modelos autorregresivos (AR) en modelos de difusion enmascarada, partiendo del modelo base `vectabass-1.03b-60.8bt-base-cooled`. El modelo cuenta con 1.028.893.312 parametros totales (919,4 millones sin embeddings) y una longitud de contexto de 2048 tokens.

El modelo resuelve un problema de investigacion concreto: estudiar las leyes de escala (scaling laws) en la conversion de arquitecturas autorregresivas a difusion enmascarada. No es un modelo de instrucciones ni ha pasado por ajuste de seguridad; es un modelo base entrenado exclusivamente para un estudio de escalado. Su relevancia radica en que permite comparar directamente el rendimiento de una misma pila de transformers (estilo Llama) bajo un paradigma autorregresivo y bajo uno de difusion, manteniendo el resto de variables controladas.

La arquitectura emplea atencion bidireccional con GQA 2:1 y XSA (exclusive self-attention), con 18 capas, anchura 2176 y 34 cabezas de consulta. El modelo esta orientado a feature-extraction y generacion mediante decodificacion por difusion, y su licencia Apache 2.0 facilita su uso en investigacion y desarrollo comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con difusion enmascarada (MDLM), basado en pila estilo Llama con XSA |
| Parametros totales | 1.028.893.312 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (entrenado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en), gales (cy), gaélico escoces (gd), irlandes (ga), manes (gv), cornes (kw), escoces (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 2.1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `VectaBass/vectabass-1.03b-60.8bt-base-cooled`, celda N5-D6 de la matriz AR del autor, tras su fase de cooldown (60.800 millones de tokens, entropia cruzada canonica de 1.9003). La conversion a MDLM se realizo durante 45.948.076.032 tokens (50 N), con atencion bidireccional desde el primer paso y objetivos no desplazados: cada posicion predice su propio token limpio. La funcion de perdida es el ELBO negativo en tiempo continuo (entropia cruzada enmascarada ponderada por 1/t sobre todas las posiciones), con un schedule lineal alpha_t = 1 - t.

El entrenamiento uso warmup lineal desde 0 durante 92 millones de tokens (0,1 N), seguido de tasa constante, con pico de learning rate de 0.00125 y decaimiento 1-sqrt hasta cero tras un fork al 80% de T. El optimizador fue Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (0.9, 0.95), con estado fresco (no se reutilizo el del padre). El batch fue de 524.288 tokens, con pesos y activaciones en bf16 y pesos maestros en fp32. La fila del token de mascara se inicializo como la del padre mas ruido gaussiano de 0,1 veces la desviacion estandar del embedding. El entrenamiento se ejecuto en 2 x NVIDIA GH200 de 120 GB. Los datos provienen de fineweb-edu, fineweb-2 y finemath, con ventanas reproducidas en el orden del padre.

## Capacidades

- Generacion de texto mediante decodificacion por difusion (`diffusion_generate`), con relleno iterativo de tokens enmascarados.
- Relleno de huecos (infilling) en secuencias: el modelo predice el token limpio en cada posicion, lo que permite enmascarar posiciones desconocidas.
- Extraccion de caracteristicas (feature-extraction): el pipeline declarado permite obtener representaciones del modelo.
- Capacidades multilingues limitadas a ingles y lenguas celtas (gales, gaélico escoces, irlandes, manes, cornes, escoces).
- Razonamiento y matematicas: sin ajuste especifico; el modelo base incluye finemath en el entrenamiento, pero no se documentan capacidades de razonamiento evaluadas.
- Tool calling / function calling: no disponible; no es un modelo de instrucciones.
- Soporte de agentes y multi-step reasoning: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre leyes de escala en difusion: el modelo permite comparar directamente una misma pila transformer bajo paradigma AR y MDLM, manteniendo constantes tamano, datos y hardware, lo que facilita estudios controlados de scaling laws.
- Relleno de texto (infilling) en documentos: gracias a la formulacion MDLM, se pueden enmascarar posiciones desconocidas y dejar que el modelo las complete, util en edicion asistida o restauracion de texto.
- Generacion de texto en lenguas celtas: el modelo incluye gales, gaélico escoces, irlandes, manes, cornes y escoces, lo que lo hace util para experimentos de generacion y extraccion de caracteristicas en estas lenguas de bajos recursos.
- Extraccion de representaciones para clasificacion o clustering: el pipeline de feature-extraction permite usar el modelo como encoder bidireccional para tareas downstream en ingles y lenguas celtas.
- Estudio de samplers y decodificacion: el modelo documenta un estudio con unos 30 samplers, lo que lo convierte en una plataforma para investigar estrategias de decodificacion en modelos de difusion.
- Experimentos de conversión AR a difusion: sirve como referencia para recetas de conversion, con hiperparametros documentados (Muon, warmup, schedule, ruido en la fila de mascara) replicables en otros tamanos.
- Generacion de texto exploratoria con penalizacion de presencia: el ajuste recomendado (argmax, presence_penalty 4.0, un token por paso) permite obtener continuaciones mas fluidas que el muestreo ancestral exacto, util en demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla de calidad de muestreo para la conversion N6 (no para este tamano N5), evaluada con Qwen3-8B-Base en bits por byte UTF-8, bigramas distintos y 4-gramas repetidos:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuacion real | 0.66 | 0.80 | 7% |
| Modelo AR del mismo tamano (N6-D6), top-p 0.95 | 0.69 | 0.75 | 9% |
| Confidence, argmax, penalizacion 4 incl. prompt (recomendado) | 0.59 | 0.81 | 10% |
| Igual, sin penalizacion | 0.13 | 0.19 | 78% |
| Orden aleatorio, muestreo ancestral exacto | 1.43 | 0.79 | 10% |

Estos datos corresponden al modelo N6 (`VectaBass/vectabass-1.73b-80bt-mdlm-converted`), no al N5 de esta ficha, y se basan en 32 prompts con una sola semilla (error estandar de 0,05-0,06 bits por byte).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 1.028 millones de parametros ocupan aproximadamente 2,1 GB de pesos; con activaciones y cache para contexto de 2048, se estima un uso de 4-6 GB en bf16. En cuantizacion de 8 bits, alrededor de 1,1 GB de pesos; en 4 bits, unos 0,6 GB.
- GPU recomendadas: el modelo se entreno en 2 x NVIDIA GH200 de 120 GB, pero para inferencia es sobradamente suficiente una GPU consumer. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten ejecutar el modelo en bf16 con holgura.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16; en 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (carga `modeling_vectabass.py` del repo). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la generacion por difusion requiere el metodo `diffusion_generate` incluido en el codigo remoto.
- Latencia y throughput estimados: no disponible. El metodo recomendado usa un token por paso (`steps = gen_length`), lo que implica 256 pasadas hacia adelante para generar 256 tokens, con un coste computacional superior al de una generacion AR equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VectaBass 1.03b 45.9bt MDLM converted | 1.028 M totales (919 M sin embeddings) | 2048 | Difusion enmascarada (MDLM) | Apache 2.0 | Hugging Face |
| VectaBass 1.03b 60.8bt base-cooled (padre) | 1.028 M totales | 2048 | Autorregresivo | Apache 2.0 | Hugging Face |
| VectaBass 1.73b 80bt MDLM converted (N6) | No disponible en la informacion | No disponible | Difusion enmascarada (MDLM) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni ha pasado por ajuste de seguridad; no debe usarse directamente en produccion para tareas de usuario final sin ajuste adicional.
- Riesgo alto de alucinacion: la model card indica explicitamente que "los hechos a menudo son incorrectos".
- El sampler recomendado es una heuristica, no un muestreo exacto: sesga contra palabras repetidas, y las listas, tablas y codigo (donde la repeticion es correcta) no se probaron; las listas aun se repiten.
- Sin penalizacion de presencia, el orden por confianza entra en bucles; con penalizacion 3 aun repite (bigramas distintos 0.63) y con 6 es menos fluido (0.84 bits por byte).
- Mantener un token por paso (`steps = gen_length`); usar 4 tokens por paso degrada la calidad (0.93 bits por byte, bigramas distintos 0.59).
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad y nunca alcanzan texto real.
- Cobertura linguistica limitada: solo ingles y seis lenguas celtas; no hay soporte documentado de castellano.
- Contexto limitado a 2048 tokens, inferior al de modelos actuales de su tamano.
- Los datos de calidad de muestreo corresponden al modelo N6, no a este N5; este tamano no fue probado en el estudio de samplers.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin ajuste, el usuario asume la responsabilidad de evaluar sesgos y calidad en su dominio.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.03b-45.9bt-mdlm-converted
- Modelo base: https://huggingface.co/VectaBass/vectabass-1.03b-60.8bt-base-cooled
- Conversion N6 citada en el estudio de samplers: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
