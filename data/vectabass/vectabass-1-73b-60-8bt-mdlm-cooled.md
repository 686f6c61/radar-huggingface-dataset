# VectaBass/vectabass-1.73b-60.8bt-mdlm-cooled

## Resumen

vectabass-1.73b-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 1.729 millones de parámetros totales (1.600 millones sin embeddings), desarrollado por VectaBass como parte de un estudio de leyes de escala. Se trata de la celda N6-D4 de una "cuadrícula MDLM" de fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado conjuntamente para poder verificar la ley de escala. Existe una cuadrícula autorregresiva (AR) equivalente, entrenada con los mismos datos y la misma escalera, publicada por separado.

El modelo parte de cero (no es un fine-tune) sobre 60.800 millones de tokens, con una arquitectura tipo Llama (GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE con base 10000 y contexto de 2048) pero con atención bidireccional y self-attention exclusiva (XSA). No está ajustado por instrucciones ni por seguridad: es un modelo base concebido para investigación sobre leyes de escala y generación por difusión.

Su relevancia actual radica en que es un punto de datos abierto y reproducible para comparar objetivos de entrenamiento (MDLM frente a AR) bajo un mismo recetario, con foco explícito en "IA soberana del Reino Unido" y en lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) además del inglés y el escocés. La licencia Apache 2.0 y la publicación de réplicas de semilla en la rama `seed2` facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), GQA 2:1, objetivo MDLM (difusión enmascarada) |
| Parametros totales | 1.729.167.360 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; safetensors) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,9 GB), con `custom_code` (`modeling_vectabass.py`) |

Otros datos de arquitectura: anchura 2560, 22 capas, 40 cabezas de consulta y 20 de clave-valor de dimensión 64, feed-forward SwiGLU de 6912, vocabulario de 50304 filas (BPE de GPT-2 de 50257 más 26 tokens especiales y relleno), token de máscara con id 50283.

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional derivado del stack tipo Llama de los modelos AR del mismo proyecto, con atención bidireccional y self-attention exclusiva (XSA). El objetivo es MDLM con un schedule lineal `alpha_t = 1 - t`: la pérdida es el ELBO negativo en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (50283) donde el token es desconocido.

El entrenamiento se realizó desde cero sobre 60.800.040.960 tokens (38 por parámetro no-embedding), con lote de 983.040 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.000751, warmup de 1600M tokens, schedule constante con cooldown `1-sqrt` a cero en el último 20% y weight decay de 0.0615 en matrices. Precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. Se usaron 2 GPU NVIDIA GH200 de 120 GB.

Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta (unos 96B tokens únicos) a partir de FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`. La generación usa `diffusion_generate`, que añade `gen_length` máscaras al prompt y las rellena en `steps` pasadas hacia delante; se recomienda `order="confidence"` (estilo MaskGIT), `argmax=True`, `presence_penalty=4.0` y un token por paso (`steps = gen_length`).

## Capacidades

- Generación de texto por difusión enmascarada con relleno iterativo de máscaras, en orden aleatorio (proceso inverso de entrenamiento) u orden por confianza.
- Extracción de características y obtención de logits por posición para el token limpio (pipeline `feature-extraction`).
- Relleno condicionado por prompt de hasta 2048 tokens de contexto.
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, visión ni audio: es un modelo base sin ajuste por instrucciones.
- No hay modo "thinking" ni capacidades especiales más allá del muestreo por difusión.

## Casos de uso

- Investigación sobre leyes de escala: la celda N6-D4 se usa junto al resto de la escalera (100M a 1.6B) y a la cuadrícula AR equivalente para ajustar y validar curvas de pérdida frente a tokens y parámetros.
- Estudio comparativo de objetivos de entrenamiento: permite contrastar el ELBO negativo de MDLM con la entropía cruzada de un modelo AR del mismo tamano y datos, usando el ELBO como cota superior de la log-verosimilitud negativa.
- Medición de ruido entre ejecuciones: las réplicas de semilla de la rama `seed2` (misma receta, nueva inicialización y orden de datos) permiten cuantificar la variabilidad run-to-run.
- Relleno de texto y "infilling" controlado: la naturaleza bidireccional y el relleno de máscaras en orden aleatorio lo hacen adecuado para experimentos de completado no causal sobre documentos.
- Evaluación de muestreadores: el autor comparó unos 30 samplers sobre 32 inicios de documento retenidos, con métricas de bits por byte UTF-8, bigramas distintos y 4-gramas repetidos; el modelo sirve como banco de pruebas de decodificación.
- Experimentación con lenguas celtas de bajos recursos: los bins de datos incluyen fuentes en galés, gaélico, irlandés, manés y córnico, útiles para estudiar cobertura lingüística en modelos pequeños.
- Reproducción bit a bit: los pesos de este repo reproducen los logits del código de entrenamiento sobre el canon enmascarado, lo que facilita la verificación de pipelines.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ELBO negativo en canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens, 16 máscaras por secuencia) | 2,2671 ± 0,0027 nats por token (± 1 error estándar) |

Resultados de muestreo del autor (celda N6-D5, 32 inicios retenidos, prompt de 32 tokens, 256 tokens generados, una semilla; puntuados por Qwen3-8B-Base):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, presence penalty 4 incl. prompt (por defecto) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que los errores estándar en bits por byte son de aproximadamente 0,06 con una semilla y 32 prompts, y que los hechos suelen ser incorrectos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,5 GB solo para pesos (1.729M parámetros x 2 bytes), más activaciones y caché KV; el repo completo ocupa 6,9 GB.
- Entrenado en 2 x NVIDIA GH200 de 120 GB; para inferencia cabe holgadamente en una sola GPU de 24 GB o superior.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) y, con cuantización a 8 bits o 4 bits, en tarjetas de 8-12 GB (la cuantización no está documentada por el autor).
- Despliegue: requiere `transformers` con `trust_remote_code=True` para cargar `modeling_vectabass.py`; la generación se hace con `model.diffusion_generate`, no con `generate` estándar. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo recomendado usa un token por paso (`steps = gen_length`), de modo que generar 256 tokens exige 256 pasadas hacia delante, con coste proporcional al número de pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-1.73b-60.8bt-mdlm-cooled | 1.729M (1.600M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda N6-D4 de una escalera de escala; sin ajuste por instrucciones |
| Modelo AR equivalente de VectaBass (cuadrícula AR de fase 1) | misma escalera (100M-1.6B no-embedding) | no disponible | Autorregresivo causal | no disponible | Entrenado con los mismos datos y escalera; publicado por separado |
| Réplica de semilla `seed2` de este mismo modelo | idénticos | 2048 | MDLM | Apache 2.0 | Misma receta con nueva inicialización y orden de datos |

No se dispone de datos de benchmarks comparativos frente a otros modelos de difusión o autorregresivos de tamano similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni por seguridad: no debe usarse directamente en producción orientada a usuarios sin un post-entrenamiento adicional.
- Alucinación: el propio autor indica que los hechos suelen ser incorrectos.
- El muestreo por confianza con penalización de presencia 4 es una heurística, no un muestreo exacto; sesga contra palabras repetidas y las listas siguen repitiéndose. Listas, tablas y código (donde la repetición es correcta) no fueron evaluados.
- Sin penalización, el orden por confianza entra en bucle (80% de 4-gramas repetidos); con penalización 3 aún repite y con 6 pierde fluidez frente a texto real.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas (inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés); el castellano no está entre ellos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin evaluación de sesgos ni de seguridad, el cumplimiento y la mitigación de sesgos recaen en el integrador.
- Las métricas de muestreo proceden de una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte; no deben extrapolarse como rendimiento general.

## Enlaces

- HuggingFace: https://huggingface.co/VectaBass/vectabass-1.73b-60.8bt-mdlm-cooled
- Rama de réplica de semilla: `revision="seed2"` en el mismo repositorio
- Documentación de datos del autor: `DATA.md` (incluido en el repositorio)
- Código de modelado: `modeling_vectabass.py` (incluido en el repositorio)
- Conjuntos de datos: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo: no disponibles en la información proporcionada
