# VectaBass/vectabass-1.03b-11.5bt-mdlm-cooled

## Resumen

vectabass-1.03b-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 1.028 millones de parámetros totales (919,4 millones sin contar embeddings), desarrollado por VectaBass dentro de un estudio de leyes de escala para IA soberana del Reino Unido. Se entrenó desde cero sobre 11.520 millones de tokens y constituye la celda N5-D2 del "cuadrado MDLM" de la fase 1: una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens, publicados conjuntamente para poder verificar empíricamente la ley de escala.

A diferencia de un transformer autorregresivo convencional, el modelo genera texto mediante un proceso iterativo de desenmascarado: parte de una secuencia de tokens máscara y los va rellenando en sucesivas pasadas hacia adelante. La arquitectura reutiliza la pila tipo Llama de los modelos autorregresivos del mismo autor (atención exclusiva XSA, GQA 2:1, SwiGLU, RMSNorm, RoPE) pero con atención bidireccional. El contexto es de 2048 tokens.

Es relevante ahora por dos motivos: primero, porque forma parte de un conjunto abierto que permite contrastar empíricamente el rendimiento de la difusión enmascarada frente a la autorregresión a igualdad de datos y escalera de tamanos; segundo, porque su licencia Apache 2.0 y su soporte de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) lo hacen poco habitual en el ecosistema. Es un modelo base, sin ajuste de instrucciones ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), MDLM |
| Parametros totales | 1.028.812.800 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB) |

| Parametro | Valor |
|---|---|
| Parametros no-embedding | 919.351.296 |
| Anchura / capas | 2176 / 18 |
| Cabezas | 34 query, 17 key-value, dim 64 (GQA 2:1) |
| Feed-forward | SwiGLU, 5648 |
| Normalizacion | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales + padding |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La red es la pila de los modelos autorregresivos del autor con atención bidireccional y atención exclusiva (XSA). El objetivo de entrenamiento es MDLM con un alpha_t lineal (alpha_t = 1 - t): la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; basta con colocar el token de máscara (id 50283) donde el token es desconocido.

El entrenamiento consumió 11.519.459.328 tokens (13 por parámetro no-embedding), con lotes de 851.968 tokens. El optimizador combina Muon para matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) y AdamW en fp32 (0,9 / 0,95). El LR máximo fue 0,000887, con calentamiento de 919M tokens y una programación de calentamiento, constante y cooldown 1-sqrt hasta cero en el último 20%. El decaimiento de pesos fue 0,0604 sobre matrices. Se entrenó en bf16 (pesos maestros en fp32, estadísticas de norma, ángulos RoPE y logits en fp32) sobre una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas. Los datasets citados son HuggingFaceFW/fineweb-edu, HuggingFaceFW/fineweb-2 y HuggingFaceTB/finemath; el desglose completo de bins, proporciones y licencias está en `DATA.md`.

## Capacidades

- Generación de texto mediante difusión enmascarada iterativa (`diffusion_generate`), con orden de desenmascarado aleatorio (el del entrenamiento) o por confianza (estilo MaskGIT).
- Relleno de huecos (infilling): al ser bidireccional, puede predecir cualquier posición enmascarada dado el contexto a ambos lados.
- Extracción de características y logits por posición (`feature-extraction`).
- Capacidades multilingües limitadas a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo base sin ajuste de instrucciones.
- No dispone de modo thinking, visión ni audio.
- Sin ajuste de seguridad ni de instrucciones.

## Casos de uso

- Estudio de leyes de escala: el modelo es una celda de una escalera de tamanos y presupuestos de tokens; se usa para medir el ELBO negativo frente a la autorregresión a igualdad de datos y verificar la ley de escala.
- Investigación en difusión enmascarada: permite comparar muestreadores (aleatorio, confianza, con y sin penalización de presencia) sobre un modelo entrenado específicamente para ello.
- Relleno de texto (infilling): útil para completar documentos con huecos, corrección de borradores o tareas de denoising, aprovechando la atención bidireccional.
- Procesamiento de lenguas celtas: generación y relleno en galés, gaélico escocés, irlandés, manés, córnico y escocés, un nicho con pocos modelos abiertos.
- Extracción de representaciones: al ser un modelo bidireccional, sus estados ocultos pueden servir como features para clasificación o clustering de texto.
- Reproducción de resultados: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que permite auditar el pipeline de evaluación.
- Docencia e investigación académica sobre modelos generativos no autorregresivos, con licencia Apache 2.0 sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot en la informacion disponible. El autor indica explícitamente que los benchmarks zero-shot no se midieron para los modelos MDLM.

La única métrica publicada es el ELBO negativo sobre el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens, 16 extracciones de máscara por secuencia): **2,6076 ± 0,0025 nats por token** (± un error estándar). Una estimación independiente con una sola extracción bajo PyTorch SDPA da 2,6063 ± 0,0101. El ELBO negativo es una cota superior de la log-verosimilitud negativa, por lo que puede compararse con la entropía cruzada de un modelo autorregresivo sobre el mismo canon solo como cota, no como medida equivalente.

Calidad de muestreo (celda N6-D5, 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla, puntuado por Qwen3-8B-Base):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, penalización 4 incl. prompt | 0,64 | 0,74 | 18% |
| igual, sin penalización | 0,15 | 0,16 | 80% |
| orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, unos 2,1 GB de pesos más activaciones y caché; en la práctica cabe holgadamente en 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; el entrenamiento se hizo en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090 y similares; también en GPUs de 8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato publicado es safetensors, no GGUF.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas hacia adelante (una por token si se sigue la recomendación de `steps = gen_length`), por lo que el coste es proporcional al número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Benchmarks |
|---|---|---|---|---|---|
| vectabass-1.03b-11.5bt-mdlm-cooled | 1.028M (919M no-embedding) | 2048 | Difusión enmascarada | Apache 2.0 | Solo ELBO negativo |
| Modelo AR de la misma escalera (VectaBass, publicado aparte) | Misma escalera | no disponible | Autorregresivo | no disponible | no disponible |
| Otros MDLM abiertos de ~1B | no disponible | no disponible | Difusión enmascarada | no disponible | no disponible |

La comparación más directa es con el "cuadrado AR" del mismo autor, entrenado sobre los mismos datos y la misma escalera y publicado por separado; el autor no proporciona en esta ficha los datos concretos de esa comparación.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado a instrucciones ni a seguridad, por lo que no debe usarse directamente como asistente.
- Los hechos que genera suelen ser incorrectos; el autor lo advierte explícitamente.
- El muestreo por confianza sin penalización de presencia entra en bucles; la penalización 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas (listas y tablas siguen repitiéndose).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamano.
- Mantener un token por paso (`steps = gen_length`); con 4 tokens por paso la calidad cae (0,73 bits por byte, bigramas distintos 0,49).
- Los resultados de calidad de muestreo se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens.
- Cobertura idiomática restringida a siete lenguas; no se documenta el castellano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero sin garantías del autor.
- Sin benchmarks zero-shot publicados, lo que dificulta comparar su rendimiento con modelos convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.03b-11.5bt-mdlm-cooled
- Datos de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Datos de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Datos de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Desglose de datos: `DATA.md` en el repositorio del modelo (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
