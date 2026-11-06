# VectaBass/vectabass-374m-15.2bt-mdlm-converted

## Resumen

vectabass-374m-15.2bt-mdlm-converted es un modelo de lenguaje de 374 millones de parámetros (303 millones sin contar embeddings) desarrollado por VectaBass, un proyecto de investigación centrado en leyes de escala y en lo que el autor denomina "IA soberana del Reino Unido". Se trata de un modelo autorregresivo (AR) de tipo Llama convertido en un modelo de difusión enmascarada (MDLM, masked diffusion language model) y reentrenado con ese objetivo durante 15.160 millones de tokens, lo que equivale a 50 veces el número de parámetros no de embedding (T = 50 N).

El modelo parte de `VectaBass/vectabass-374m-11.5bt-base-cooled`, celda N3-D4 del "cuadrado AR" del autor, tras su fase de cooldown. La conversión forma parte de un conjunto de seis modelos (N1 a N6), uno por tamaño, donde cada uno es el mejor de tres padres AR enfriados de ese tamaño según el ELBO negativo final sobre un corpus de validación propio. La arquitectura conserva la pila tipo Llama del padre con atención propia exclusiva (XSA), pero se hace bidireccional desde el primer paso y se entrena con el objetivo de ELBO negativo en tiempo continuo propio de MDLM.

Es relevante porque documenta de forma explícita y reproducible el proceso de conversión AR a difusión, incluyendo receta de entrenamiento, hiperparámetros, estudio de muestreo con unas 30 estrategias comparadas y métricas de fluidez. Es un modelo base para investigación, no ajustado a instrucciones ni a seguridad, y su uso previsto es el estudio de leyes de escala y la extracción de características, no el despliegue en producción como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama bidireccional con atención propia exclusiva (XSA), convertido a difusión enmascarada (MDLM) |
| Parámetros totales | 373.942.272 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros no de embedding | 303.114.240 |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantización | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco (inglés y lenguas celtas y escocés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado en `modeling_vectabass.py`) |
| Anchura / capas | 1408 / 13 |
| Cabezas | 22 de consulta, 11 de clave-valor, dimensión 64 (GQA 2:1) |
| Feed-forward | SwiGLU, dimensión 4112 |
| Normalización | RMSNorm, pre-norm |
| Token de máscara | id 50283 |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La red es la pila tipo Llama del modelo padre con atención propia exclusiva (XSA), transformada en bidireccional desde el primer paso de entrenamiento. Frente a un modelo AR estándar, aquí cada posición predice su propio token limpio (objetivos no desplazados), y el modelo se entrena con el objetivo MDLM: un ELBO negativo en tiempo continuo con alpha_t lineal (1 - t), cuya pérdida es una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. El token de máscara (id 50283) parte de la fila del padre más ruido gaussiano de 0,1 veces la desviación estándar del embedding, aplicado tanto en los pesos maestros fp32 como en la copia bf16.

El entrenamiento consumió 15.157.166.080 tokens (50 N) con calentamiento lineal durante 30 millones de tokens (0,1 N) y después constante, pico de learning rate de 0,00174, bifurcación en 0,8 T y decaimiento 1-sqrt hasta cero. No usa weight decay. El optimizador parte de estado nuevo (no reutiliza el del padre): Muon para matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) más AdamW en fp32 (0,9 / 0,95). El lote es de 524.288 tokens, con pesos y activaciones en bf16, pesos maestros en fp32 y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista de la fase 1 (fineweb-edu, fineweb-2 y finemath) con ventanas reproducidas en el orden del padre; el archivo `DATA.md` documenta cada bin, su proporción y su licencia.

## Capacidades

- Generación de texto mediante decodificación por difusión: rellena un lienzo de máscaras en `steps` pasadas hacia delante, con orden por confianza y `argmax=True`.
- Relleno condicional de posiciones desconocidas: al ser bidireccional, puede predecir cualquier posición enmascarada dado el contexto disponible, no solo la siguiente.
- Extracción de características: el pipeline declarado es `feature-extraction`; `model(ids).logits` devuelve en cada posición la distribución del token limpio.
- Multilingüismo limitado a inglés y lenguas celtas y escocés (cy, gd, ga, gv, kw, sco).
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- No está ajustado a instrucciones ni a seguridad: es un modelo base de investigación.

## Casos de uso

- Investigación sobre leyes de escala: el modelo es una celda (N3) de un conjunto de seis tamaños, pensado para comparar curvas de pérdida y ELBO entre variantes AR y MDLM con recetas idénticas.
- Estudio de conversión AR a difusión: sirve como referencia reproducible para medir cuánto se degrada o mejora la fluidez al pasar un transformer autorregresivo a difusión enmascarada, con la receta y los hiperparámetros publicados.
- Extracción de representaciones para clasificación o clustering: al ser bidireccional y con contexto de 2048 tokens, las activaciones intermedias pueden alimentar modelos descendentes sobre texto en inglés o lenguas celtas.
- Relleno de texto (text infilling) en pipelines de aumento de datos: se pueden enmascarar posiciones concretas y dejar que el modelo las complete condicionado al resto, algo que un AR puro no hace de forma nativa.
- Evaluación comparativa de muestreadores: el autor publica un estudio con unas 30 estrategias; el modelo permite reproducir y extender ese banco de pruebas midiendo bits por byte UTF-8, bigramas distintos y 4-gramas repetidos.
- Investigación lingüística sobre lenguas celtas de bajos recursos: el modelo se entrenó con fineweb-2 y declara soporte para galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite analizar su comportamiento en esas lenguas.
- Docencia y experimentación con difusión de lenguaje: su tamaño (374 M) permite ejecutar el bucle de `diffusion_generate` en una sola GPU de consumo para estudiar el efecto de la penalización de presencia y del número de pasos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. Sí publica un estudio de muestreo, medido sobre la conversión N6 del mismo conjunto (`VectaBass/vectabass-1.73b-80bt-mdlm-converted`), no sobre este tamaño. Las métricas son bits por byte UTF-8 según Qwen3-8B-Base (menos es más fluido, pero valores muy bajos indican repetición), proporción de bigramas distintos y proporción de 4-gramas repetidos, sobre 32 inicios de documento reservados, con prompt de 32 tokens, 256 tokens generados y una semilla.

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| Modelo AR del mismo tamaño (N6-D6), top-p 0,95 | 0,69 | 0,75 | 9 % |
| Confianza, argmax, penalización de presencia 4 incluyendo prompt (por defecto) | 0,59 | 0,81 | 10 % |
| Igual, sin penalización | 0,13 | 0,19 | 78 % |
| Orden aleatorio, muestreo ancestral exacto | 1,43 | 0,79 | 10 % |

Conclusiones declaradas por el autor: sin penalización el orden por confianza entra en bucle; la penalización 3 aún repite (bigramas distintos 0,63) y la 6 es menos fluida (0,84 bits por byte); un token por paso es lo recomendado (cuatro tokens por paso empeora a 0,93 bits por byte y 0,59 de bigramas distintos); el muestreo ancestral exacto es mucho menos fluido que el modelo AR. Los errores estándar en bits por byte son de aproximadamente 0,05 a 0,06 con una semilla y 32 prompts. El modelo tiende a equivocarse en hechos.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 0,75 GB (373,9 M de parámetros a 2 bytes), más activaciones y caché para contexto de 2048 tokens; cabe holgadamente en cualquier GPU de consumo con 8 GB o más.
- Entrenamiento original: 1 x NVIDIA GH200 de 120 GB, lote de 524.288 tokens, bf16 con pesos maestros fp32.
- GPU recomendadas para inferencia: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el bucle de difusión personalizado hace improbable su soporte directo en esos motores sin adaptación.
- Latencia y throughput: no disponibles. El coste de generación es proporcional a `steps` pasadas hacia delante sobre el lienzo completo, por lo que con `steps = gen_length` y 256 tokens se realizan 256 pasadas, muy por encima del coste de un AR equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-374m-15.2bt-mdlm-converted | 373,9 M (303,1 M no embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Base de investigación, sin ajuste a instrucciones |
| vectabass-374m-11.5bt-base-cooled (padre) | 373,9 M | 2048 | Autorregresivo | Apache 2.0 | Mismo tamaño; el autor lo usa como referencia de fluidez en el estudio de muestreo |
| vectabass-1.73b-80bt-mdlm-converted | 1,73 B | No disponible | Difusión enmascarada (MDLM) | Apache 2.0 | Conversión N6 del mismo conjunto; es el modelo sobre el que se midió el estudio de muestreo |
| Modelos AR de ~350-400 M de la familia Llama o Qwen | ~350-400 M | 2048-32 000 | Autorregresivo | Variables | No se dispone de comparación de rendimiento publicada por el autor |

No se han publicado comparaciones directas con modelos de difusión de lenguaje de otros autores en la información disponible.

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a seguridad: no debe usarse como asistente conversacional sin ajuste posterior.
- Los hechos son a menudo incorrectos, según reconoce el propio autor.
- El muestreo por confianza sin penalización de presencia entra en bucles; la penalización 4 es una heurística, no un muestreo exacto, y sesga contra palabras repetidas.
- Listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- El estudio de muestreo se realizó sobre el modelo N6 (1,73 B), no sobre este tamaño; los números pueden no trasladarse directamente.
- El muestreo ancestral exacto es mucho menos fluido que un AR del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura idiomática restringida a inglés y lenguas celtas y escocés; no se declara soporte de castellano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor.
- Licencia Apache 2.0: permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad en producción.
- Riesgo de sesgos heredados de fineweb-edu y fineweb-2 no evaluado ni documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-15.2bt-mdlm-converted
- Modelo padre: https://huggingface.co/VectaBass/vectabass-374m-11.5bt-base-cooled
- Conversión N6 del conjunto: https://huggingface.co/VectaBass/vectabass-1.73b-80bt-mdlm-converted
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo
- Código de modelado personalizado: `modeling_vectabass.py` en el repositorio del modelo
