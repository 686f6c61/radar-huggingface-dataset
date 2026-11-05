# VectaBass/vectabass-1.73b-80bt-mdlm-converted

## Resumen

vectabass-1.73b-80bt-mdlm-converted es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) desarrollado por VectaBass, un proyecto centrado en IA soberana del Reino Unido. Se trata de la conversión de un modelo autorregresivo (AR) previo, `vectabass-1.73b-60.8bt-base-cooled`, a un paradigma de difusión sobre tokens, tras un entrenamiento adicional de 80.000 millones de tokens. Forma parte de un conjunto de conversión (denominado Phase 1) con un modelo por cada tamaño, de N1 a N6, siendo este el de mayor escala (N6).

El modelo tiene 1.729 millones de parámetros totales (1.600 millones sin contar embeddings, que están atados), 22 capas, anchura 2560 y una ventana de contexto de 2048 tokens. Su arquitectura es un transformer tipo Llama con atención exclusiva auto-atencional (XSA) y GQA 2:1, convertido a atención bidireccional para operar como MDLM. Es un modelo base entrenado para un estudio de leyes de escala, no está ajustado por instrucciones ni alineado en seguridad.

Su relevancia radica en que documenta de forma abierta la receta de conversión de AR a difusión, incluyendo un estudio de muestreo con unos 30 samplers y métricas objetivas (bits por byte, bigramas distintos, 4-gramas repetidos). Está orientado a investigación sobre modelos de difusión de lenguaje, no a uso en producción como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con atención bidireccional, GQA 2:1 y XSA; paradigma MDLM (masked diffusion) |
| Parámetros totales | 1.729.167.360 |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros sin embeddings | 1.600.389.120 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` para `trust_remote_code`) |
| Anchura / capas | 2560 / 22 |
| Cabezas | 40 query, 20 key-value, dimensión 64 |
| Feed-forward | SwiGLU, 6912 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas |
| Tamaño del repo | 3.5 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer autorregresivo tipo Llama con atención exclusiva auto-atencional (XSA), que se convierte a difusión enmascarada haciendo la atención bidireccional desde el primer paso y cambiando los objetivos a no desplazados: cada posición predice su propio token limpio. El objetivo es MDLM con un alpha_t lineal (1 - t) y una pérdida de ELBO negativo en tiempo continuo, equivalente a una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones.

El entrenamiento de conversión consumió 80.000.057.344 tokens (T = 50 N), con un calentamiento lineal sobre 160 millones de tokens y luego constante, LR pico de 0.00106 y una decaída 1-sqrt a partir del 80 % del entrenamiento. No se reutilizó el estado del optimizador del padre: se usó Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) junto con AdamW en fp32. La fila del token de máscara se inicializó a partir de la del padre más ruido gaussiano de 0.1 veces la desviación estándar de los embeddings. El entrenamiento se ejecutó en 2 x NVIDIA GH200 de 120 GB, con pesos y activaciones en bf16 y pesos maestros en fp32. Los datos provienen de fineweb-edu, fineweb-2 y finemath, con ventanas reproducidas en el orden del modelo padre.

## Capacidades

- Generación de texto mediante decodificación iterativa por difusión (`diffusion_generate`), no autorregresiva.
- Extracción de características (pipeline declarado: `feature-extraction`).
- Relleno de tokens enmascarados: `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; se coloca el token de máscara (id 50283) donde se desconoce el contenido.
- Control de orden de muestreo: orden por confianza (`order='confidence'`), orden aleatorio y muestreo ancestral exacto.
- Soporte de penalización de presencia para mitigar bucles de repetición.
- Capacidades multilingües limitadas a inglés y lenguas celtas y escocés (cy, gd, ga, gv, kw, sco).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre modelos de difusión de lenguaje: el modelo sirve como punto de comparación directa frente a su padre autorregresivo del mismo tamaño, permitiendo estudiar diferencias de fluidez, diversidad y repetición con métricas reproducibles.
- Estudio de leyes de escala: al formar parte de un conjunto de conversión con un modelo por tamaño (N1 a N6), permite analizar cómo escala la calidad de la conversión AR a difusión con el número de parámetros.
- Evaluación de samplers: el modelo es el banco de pruebas del estudio de muestreo del autor, útil para comparar decodificación por confianza, ancestral exacta y variantes con penalización.
- Generación de texto exploratoria con decodificación iterativa: útil en entornos de investigación donde se quiera generar texto con un paradigma no autorregresivo y medir su comportamiento.
- Procesamiento de lenguas celtas y escocés: aunque limitado, el vocabulario y los datos cubren galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite experimentos de generación en estos idiomas de bajos recursos.
- Extracción de representaciones: al declararse como `feature-extraction`, puede emplearse para obtener embeddings contextuales bidireccionales en tareas de análisis lingüístico.
- Reproducción de recetas de conversión: el modelo documenta con detalle hiperparámetros, datos y hardware, por lo que sirve como referencia para replicar la conversión AR a MDLM en otros modelos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí publica una comparativa de samplers con métricas de fluidez y repetición sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 tokens generados, una semilla), evaluadas con Qwen3-8B-Base en bits por byte UTF-8:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0.66 | 0.80 | 7 % |
| Modelo AR del mismo tamaño (N6-D6), top-p 0.95 | 0.69 | 0.75 | 9 % |
| Confianza, argmax, penalización de presencia 4 (por defecto) | 0.59 | 0.81 | 10 % |
| Igual, sin penalización | 0.13 | 0.19 | 78 % |
| Orden aleatorio, muestreo ancestral exacto | 1.43 | 0.79 | 10 % |

El error estándar en bits por byte es de aproximadamente 0.05 a 0.06 con una sola semilla y 32 prompts. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3.5 GB solo para pesos, más activaciones y caché; el modelo se entrenó y se recomienda ejecutar en bf16.
- GPU recomendadas: el autor entrenó en 2 x NVIDIA GH200 de 120 GB; para inferencia basta una GPU con al menos 8-16 GB de VRAM en bf16, aunque no se especifican requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en bf16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), aunque no hay datos oficiales de consumo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` incluido en `modeling_vectabass.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación requiere `steps` pasadas hacia delante (una por token generado en la configuración recomendada), lo que implica un coste computacional mayor que la generación autorregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-1.73b-80bt-mdlm-converted | 1.73 B | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | HuggingFace |
| vectabass-1.73b-60.8bt-base-cooled (padre) | 1.73 B | 2048 | Autorregresivo | Apache 2.0 | HuggingFace |
| MDLM square N6-D5 (del mismo estudio) | No disponible | No disponible | MDLM | No disponible | No disponible |
| MDLM square N3-D5 (del mismo estudio) | No disponible | No disponible | MDLM | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de difusión de lenguaje de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni alineado en seguridad: no debe usarse como asistente conversacional sin ajuste adicional.
- Los hechos que genera suelen ser incorrectos, según advierte el propio autor.
- Sin penalización de presencia, el muestreo por confianza entra en bucles de repetición (bigramas distintos de 0.19 y 78 % de 4-gramas repetidos).
- La penalización de presencia 4 es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas, tablas y código (donde la repetición es correcta) no se probaron y las listas siguen repitiéndose.
- Mantener un token por paso (`steps = gen_length`); usar 4 tokens por paso degrada la calidad (0.93 bits por byte, bigramas distintos 0.59).
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad y nunca alcanzan texto real.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a inglés y lenguas celtas y escocés; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- Los resultados de muestreo se basan en una sola semilla y 32 prompts, con error estándar de 0.05-0.06 en bits por byte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Modelo base (padre): https://huggingface.co/VectaBass/vectabass-1.73b-60.8bt-base-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
