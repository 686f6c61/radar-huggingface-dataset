# VectaBass/vectabass-151m-11.5bt-mdlm-cooled

## Resumen

vectabass-151m-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 151,5 millones de parámetros totales (100,0 millones no pertenecientes a embeddings), entrenado desde cero sobre 11.520 millones de tokens. Lo desarrolla el autor independiente VectaBass dentro de un proyecto de estudio de leyes de escala etiquetado como "UK sovereign AI", con especial atención a fuentes del sector público británico y lenguas celtas. No es un modelo instructivo ni ajustado por seguridad: es un modelo base concebido como una celda experimental de una escalera de tamaños que va de 100M a 1.600M de parámetros no-embedding.

La arquitectura parte del stack tipo Llama de los modelos autorregresivos del mismo autor (RMSNorm pre-norm, SwiGLU, RoPE, GQA 2:1) pero se hace bidireccional e incorpora atención propia exclusiva (XSA, exclusive self-attention). El objetivo de entrenamiento es el ELBO negativo en tiempo continuo con un schedule lineal alpha_t = 1 - t. La relevancia actual es metodológica: el autor publica toda la escalera de tamaños y presupuestos de tokens, junto con un cuadrado autorregresivo equivalente entrenado con los mismos datos, para poder verificar empíricamente la ley de escala de los MDLM.

El modelo está pensado para extracción de características y para investigación sobre generación por difusión, no para uso conversacional en producción. La generación requiere un bucle iterativo de desenmascarado (`diffusion_generate`) con heurísticas de penalización de presencia, y el propio autor advierte de que los hechos generados suelen ser incorrectos y de que la calidad de texto es inferior a la de su modelo autorregresivo del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE, GQA 2:1) con atención propia exclusiva (XSA); objetivo MDLM |
| Parametros totales | 151.505.920 (151.486.464 segun model card; embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Parametros no-embedding | 99.975.168 |
| Longitud de contexto | 2048 tokens (RoPE base 10000) |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés, galés, gaélico escocés, irlandés, manés, córnico, escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código personalizado (`modeling_vectabass.py`, requiere `trust_remote_code=True`) |
| Dimensiones | Ancho 1024, 9 capas |
| Cabezas de atención | 16 query, 8 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 2592 |
| Tokenizador | GPT-2 BPE (50.257 tokens) + 26 especiales, vocabulario de 50.304 filas; token de máscara id 50283 |
| Tamaño del repositorio | 0,9 GB |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un transformer de 9 capas y ancho 1024 con normalización RMSNorm en configuración pre-norm, activación SwiGLU de dimensión 2592 y embeddings atados. La atención es bidireccional con GQA en proporción 2:1 (16 cabezas de consulta, 8 de clave-valor, dimensión 64) e incorpora atención propia exclusiva (XSA). Las posiciones se codifican con RoPE de base 10000 y contexto máximo de 2048 tokens. El tokenizador es GPT-2 BPE ampliado con 26 tokens especiales y rellenado hasta 50.304 filas; el token de máscara es el id 50283.

El entrenamiento sigue el objetivo MDLM con schedule lineal alpha_t = 1 - t y pérdida definida como el ELBO negativo en tiempo continuo, es decir, entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. Se procesaron 11.519.655.936 tokens (115 tokens por parámetro no-embedding) con lotes de 524.288 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) con AdamW en fp32 (betas 0.9 y 0.95); el LR máximo fue 0.00173, con 100M tokens de warmup, fase constante y un cooldown 1-sqrt hasta cero en el último 20 % del entrenamiento. El weight decay fue 0.135 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32 y estadísticos de norma, ángulos RoPE y logits en fp32, sobre una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes del sector público y parlamentario británico y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. El repositorio incluye réplicas de semilla en las ramas `seed2` y `seed3` (cargables con `revision="seed2"`) para medir el ruido entre ejecuciones. Existe un cuadrado autorregresivo equivalente, entrenado con los mismos datos y la misma escalera de tamaños, publicado por separado.

## Capacidades

- Generación de texto mediante desenmascarado iterativo: `diffusion_generate` añade `gen_length` tokens de máscara al prompt y los rellena a lo largo de `steps` pasadas hacia delante.
- Dos modos de orden de desenmascarado: `order="random"` (proceso inverso para el que fue entrenado, muestreo ancestral exacto) y `order="confidence"` (estilo MaskGIT, compromete primero las posiciones más confiables).
- Extracción de características: el pipeline declarado es feature-extraction y `model(ids).logits` devuelve, en cada posición, la distribución del token limpio.
- Relleno condicional: al ser un modelo de difusión enmascarada, puede completar huecos en cualquier posición del contexto, no solo al final.
- Cobertura multilingüe limitada a siete lenguas: inglés y seis lenguas celtas o británicas (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión, audio ni capacidades de agente. No está ajustado por instrucciones ni por seguridad.

## Casos de uso

- Investigación sobre leyes de escala en modelos de difusión: la celda N1-D2 forma parte de una escalera de 100M a 1.600M de parámetros no-embedding entrenada con varios presupuestos de tokens; se usa para ajustar y verificar curvas de escala frente al cuadrado autorregresivo equivalente.
- Medición de ruido entre ejecuciones: las réplicas `seed2` y `seed3`, con la misma receta pero nueva inicialización y orden de datos, permiten estimar la varianza run-to-run en estudios comparativos.
- Extracción de representaciones para clasificación o clustering: con 2048 tokens de contexto y atención bidireccional, las activaciones intermedias sirven como features para tareas de análisis de texto en inglés y lenguas celtas.
- Relleno de texto (infilling) en corpus históricos o administrativos: el objetivo de difusión enmascarada permite reconstruir fragmentos ausentes en documentos digitalizados sin depender de un orden de izquierda a derecha.
- Procesamiento de documentación pública británica y parlamentaria: el corpus de entrenamiento incluye fuentes del sector público del Reino Unido, lo que hace al modelo útil como banco de pruebas para tareas de dominio administrativo en inglés.
- Experimentación con samplers y decodificación: el autor documenta la comparación de unos 30 samplers sobre 32 inicios de documento; el modelo sirve para estudiar estrategias de desenmascarado, penalizaciones de presencia y compromiso por confianza.
- Docencia y reproducción de resultados: al ser pequeño (0,9 GB de repositorio) y de licencia Apache 2.0, se puede ejecutar en una sola GPU para reproducir los logits del código de entrenamiento de forma bit a bit sobre filas enmascaradas del canon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada es la siguiente:

| Metrica | Valor |
|---|---|
| ELBO negativo en canon-8192 (8192 x 2048 tokens, 16 sorteos de máscara por secuencia) | 2,8658 ± 0,0025 nats por token (± 1 error estándar) |
| Reproducibilidad | Los pesos reproducen los logits del código de entrenamiento bit a bit sobre filas enmascaradas del canon |

Calidad de muestreo (celda N6-D5, 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla; puntuado por Qwen3-8B-Base):

| Sampler | Bits por byte UTF-8 | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, penalización de presencia 4 incl. prompt (recomendado) | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

El error estándar en bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 151,5M de parámetros; en bf16 ocupa aproximadamente 0,3 GB de pesos, más activaciones y caché para el bucle de desenmascarado. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el autor entrenó con una NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con soporte bf16. También es viable en CPU para pruebas.
- Cabe en GPU consumer: sí, sin problemas, incluso en tarjetas de gama baja.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; el código personalizado (`modeling_vectabass.py`) implementa `diffusion_generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el bucle iterativo de desenmascarado no encaja en los motores de inferencia autorregresiva habituales.
- Latencia y throughput: no disponibles. El coste de generación es proporcional a `steps` pasadas hacia delante completas sobre la secuencia, con la recomendación de un token por paso (`steps = gen_length`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-151m-11.5bt-mdlm-cooled | 151,5M totales (100,0M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Hugging Face, requiere código remoto |
| Cuadrado autorregresivo de VectaBass (misma escalera) | Escalera de 100M a 1.600M no-embedding | No disponible | Autorregresivo | No disponible en la información | Publicado por separado según la model card |
| Modelos MDLM de referencia (p. ej. familia MDLM original) | No disponible | No disponible | Difusión enmascarada | No disponible | No disponible |

La comparación más directa que documenta el autor es interna: el cuadrado autorregresivo entrenado con los mismos datos y la misma escalera de tamaños. Según la model card, el muestreo ancestral exacto del MDLM es mucho menos fluido que el modelo autorregresivo del mismo tamaño. No se dispone de datos de benchmarks cruzados con otros modelos de difusión de la misma escala.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni por seguridad: no debe usarse como asistente conversacional tal cual.
- Alucinación factual elevada: el autor afirma explícitamente que los hechos generados suelen ser incorrectos.
- Calidad de texto inferior a la del modelo autorregresivo equivalente del mismo tamaño; el muestreo ancestral exacto produce 1,39 bits por byte frente a 0,66 de una continuación real.
- El modo de muestreo recomendado (confidence, argmax, penalización de presencia 4) es una heurística, no un muestreo exacto: sesga contra palabras repetidas y no se probó en listas, tablas ni código, donde la repetición es correcta; las listas siguen repitiéndose.
- Sin penalización de presencia, el orden por confianza entra en bucle (80 % de 4-gramas repetidos). Una penalización de 3 todavía repite; una de 6 es menos fluida que el texto real.
- Usar más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete lenguas; el rendimiento fuera de ellas no está documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- La evaluación se basa en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte; los resultados deben interpretarse como preliminares.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin ajuste, cualquier producto derivado necesitaría ajuste adicional y evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-151m-11.5bt-mdlm-cooled
- Réplicas de semilla: ramas `seed2` y `seed3` del mismo repositorio (cargables con `revision="seed2"`)
- Documentación de datos del autor: `DATA.md` en el repositorio
- Código de modelado: `modeling_vectabass.py` en el repositorio
- Conjuntos de datos citados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo del proyecto: no disponible en la información proporcionada
