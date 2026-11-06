# VectaBass/vectabass-232m-8.71bt-mdlm-converted

## Resumen

vectabass-232m-8.71bt-mdlm-converted es un modelo de lenguaje de 231,8 millones de parámetros (173,85 M no pertenecientes a embeddings) desarrollado por VectaBass, un proyecto de IA soberana del Reino Unido. Se trata de la celda N2-D4 de un estudio de leyes de escala, en la que un modelo autorregresivo (AR) previamente entrenado con 11,52 mil millones de tokens se convierte en un modelo de difusión enmascarada (MDLM) mediante un entrenamiento adicional de 8,71 mil millones de tokens. La relevancia radica en que documenta de forma abierta el proceso de conversión AR a difusión y compara el rendimiento de ambos paradigmas bajo una misma arquitectura.

El modelo emplea una pila tipo Llama con atención bidireccional, atención de consulta agrupada (GQA) en proporción 2:1 y atención propia exclusiva (XSA), con un contexto de 2048 tokens y embeddings atados. Está pensado como modelo base para investigación en generación no autorregresiva, no como asistente conversacional: no ha pasado por ajuste de instrucciones ni por alineamiento de seguridad.

Su interés actual reside en la receta de conversión publicada (objetivo MDLM con ELBO negativo en tiempo continuo, optimizador Muon, LR pico de 0,00206) y en el estudio de muestreo que acompaña al modelo, que evalúa unos 30 muestreadores y recomienda decodificación por confianza con penalización de presencia de 4,0. Es un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con atención bidireccional, GQA 2:1 y XSA; convertido a difusión enmascarada (MDLM) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | No disponible (el autor solo documenta bf16 para inferencia) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código remoto `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

La red es la pila del modelo padre `vectabass-232m-11.5bt-base-cooled` (celda N2-D4 del cuadrado AR, 11,52B tokens, entropía cruzada de canon 2,2604) con la atención hecha bidireccional desde el primer paso. La anchura es de 1152 con 12 capas, 18 cabezas de consulta y 9 de clave-valor de dimensión 64, feed-forward SwiGLU de 3040 y normalización RMSNorm pre-norm. Los objetivos son no desplazados: cada posición predice su propio token limpio, y el token de máscara es el id 50283.

La conversión usa el objetivo MDLM con alpha_t lineal (1 - t) y una pérdida de ELBO negativo en tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). Se entrenaron 8.705.802.240 tokens (T = 50 N) con calentamiento lineal de 17M tokens, LR pico de 0,00206, decaimiento 1-sqrt tras el 80% del entrenamiento, sin weight decay, batch de 524.288 tokens y estado de optimizador nuevo: Muon (matrices ocultas, NS 5, Moonlight RMS 0,2, momento 0,95) más AdamW en fp32. La fila del token de máscara se inicializa con la fila del padre más ruido gaussiano de 0,1 veces la desviación estándar del embedding. El entrenamiento se ejecutó en una NVIDIA GH200 de 120 GB con pesos y activaciones en bf16 y pesos maestros en fp32. Los datos provienen de FineWeb-Edu, FineWeb-2 y FineMath, con ventanas reproducidas en el orden del padre.

## Capacidades

- Generación de texto no autorregresiva mediante relleno iterativo de máscaras con `diffusion_generate`.
- Extracción de características: el pipeline declarado es `feature-extraction` y `model(ids).logits` devuelve, en cada posición, la distribución del token limpio.
- Relleno condicionado (infilling) de posiciones enmascaradas dentro de una secuencia.
- Cobertura multilingüe limitada a siete lenguas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso orientado a agentes ni modo de pensamiento.
- No dispone de capacidades de visión ni audio.
- No está ajustado a instrucciones ni a seguridad; es un modelo base.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: sirve como punto de partida reproducible para estudiar decodificación por confianza frente a muestreo ancestral exacto, con la receta de conversión y el estudio de muestreadores publicados.
- Estudio de leyes de escala: al ser la celda N2 de un conjunto de conversión N1–N6, permite comparar curvas de pérdida y ELBO entre tamaños bajo idéntica receta.
- Relleno de texto con huecos (infilling): el modelo predice tokens limpios en posiciones enmascaradas, lo que encaja en tareas de completado de plantillas o restauración de fragmentos en documentos.
- Extracción de representaciones: el pipeline de feature-extraction permite obtener embeddings contextuales bidireccionales de 1152 dimensiones para clasificación o agrupamiento en corpus de lenguas celtas.
- Procesamiento de lenguas minoritarias del Reino Unido: con cobertura de cy, gd, ga, gv, kw y sco, puede emplearse en experimentos de modelado de lenguaje sobre corpus de estas lenguas, siempre con validación humana por la baja calidad factual.
- Docencia y experimentación con hardware modesto: sus 231,8 M de parámetros caben en GPUs de consumo y permiten reproducir el pipeline de difusión enmascarada sin infraestructura grande.
- Comparación de paradigmas AR frente a difusión: el modelo padre AR y esta conversión comparten arquitectura y datos, lo que facilita experimentos controlados de fluidez y diversidad.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica una evaluación de muestreo sobre la conversión N6 (`vectabass-1.73b-80bt-mdlm-converted`), no sobre este tamaño, con 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados y una semilla; la puntuación la realiza Qwen3-8B-Base en bits por byte UTF-8.

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Modelo AR del mismo tamaño (N6-D6), top-p 0,95 | 0,69 | 0,75 | 9% |
| Confianza, argmax, penalización de presencia 4 (recomendado) | 0,59 | 0,81 | 10% |
| Igual, sin penalización | 0,13 | 0,19 | 78% |
| Orden aleatorio, muestreo ancestral exacto | 1,43 | 0,79 | 10% |

Los errores estándar en bits por byte son de aproximadamente 0,05 a 0,06 con una sola semilla. El autor advierte que la penalización de presencia es una heurística, no un muestreo exacto, y que con 4 tokens por paso la calidad cae a 0,93 bits por byte y 0,59 de bigramas distintos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,5 GB para los pesos (231,8 M de parámetros), más activaciones y caché; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: NVIDIA GH200 (la usada en entrenamiento), A100, H100 o RTX 4090; también funciona en GPUs de consumo de gama media como RTX 3060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM en bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la generación es iterativa sobre máscaras y no autorregresiva.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas hacia delante (recomendado `steps = gen_length`, es decir, una pasada por token generado), lo que la hace más costosa que la decodificación autorregresiva equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-232m-8.71bt-mdlm-converted | 231,8 M | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face |
| VectaBass/vectabass-232m-11.5bt-base-cooled (padre) | 231,8 M | 2048 | Autorregresivo | Apache 2.0 | Hugging Face |
| VectaBass/vectabass-1.73b-80bt-mdlm-converted (N6) | 1,73 B | no disponible | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de benchmarks frente a modelos de otras familias; la única comparación publicada es interna, entre el modelo AR del mismo tamaño y esta conversión, en la tabla de muestreo anterior.

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a seguridad: no debe usarse como asistente directo sin un ajuste posterior.
- El propio autor advierte que los hechos son a menudo incorrectos; el riesgo de alucinación es alto.
- Sin penalización de presencia, la decodificación por confianza entra en bucles (78% de 4-gramas repetidos) y copia el prompt en bucle si no se incluye este en el cómputo de la penalización.
- La penalización de presencia de 4,0 es una heurística que sesga contra palabras repetidas; listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- El estudio de muestreo se realizó sobre el tamaño N6, no sobre este N2; los valores no son directamente extrapolables.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a siete lenguas; el rendimiento en lenguas celtas no está cuantificado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base sin ajuste no es apto para producción sin evaluación adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; audítese antes de desplegar.
- La generación es iterativa (una pasada por token con la configuración recomendada), con mayor coste computacional que un modelo AR equivalente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-8.71bt-mdlm-converted
- Modelo padre (AR): https://huggingface.co/VectaBass/vectabass-232m-11.5bt-base-cooled
- Conversión N6 citada en el estudio de muestreo: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
