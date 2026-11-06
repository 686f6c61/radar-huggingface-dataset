# VectaBass/vectabass-1.73b-140bt-mdlm-cooled

## Resumen

vectabass-1.73b-140bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 1.729 millones de parámetros totales (1.600 millones sin embeddings), entrenado desde cero sobre 139.680 millones de tokens. Lo desarrolla VectaBass, un proyecto orientado a IA soberana del Reino Unido ("uk-sovereign-ai"), y forma parte de la celda N6-D5 de su "MDLM square" de fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens, publicados en conjunto para poder verificar empíricamente la ley de escalado.

El modelo no es autorregresivo (AR): usa la pila tipo Llama de los modelos AR del mismo autor (atención exclusiva XSA, GQA 2:1, SwiGLU, RMSNorm, RoPE) pero con atención bidireccional, y se entrena con el objetivo MDLM de tiempo continuo (ELBO negativo ponderado por 1/t). En inferencia genera rellenando posiciones enmascaradas de forma iterativa. Es un modelo base de investigación, sin ajuste por instrucciones ni de seguridad, pensado para estudio de leyes de escalado y no para uso directo en producción.

Su relevancia radica en que publica junto a la versión autorregresiva equivalente, lo que permite comparar directamente ambos paradigmas sobre los mismos datos y la misma escalera de tamanos. Incluye además datos de fuentes públicas del Reino Unido, parlamentarias y de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico y escocés), lo que lo hace singular en cobertura lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MDLM (difusión enmascarada), atención bidireccional, GQA 2:1, XSA, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 1.729.167.360 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros sin embeddings | 1.600.389.120 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |
| Ancho / capas | 2560 / 22 |
| Cabeceras | 40 query, 20 key-value, dim 64 |
| Feed-forward | SwiGLU, 6912 |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales + padding |
| Tamano del repo | 3.5 GB |

## Arquitectura y entrenamiento

La red reutiliza el stack tipo Llama de los modelos AR del autor, con atención exclusiva auto-atencional (XSA) y GQA 2:1, pero convertida en bidireccional para el objetivo de difusión. El modelo aprende, en cada posición, la distribución del token limpio dado un contexto con posibles tokens enmascarados (id 50283). La generación se realiza añadiendo `gen_length` máscaras al prompt y rellenándolas a lo largo de `steps` pasadas hacia delante.

El entrenamiento usa el objetivo MDLM con `alpha_t = 1 - t` lineal y pérdida ELBO negativa de tiempo continuo (entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones). Se entrenó sobre 139.682.119.680 tokens (87 tokens por parámetro no-embedding) con batch de 983.040 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 (0.9, 0.95), LR pico de 0.000751, warmup de 1600M tokens, schedule warmup-constant con cooldown 1-sqrt en el último 20 %, weight decay 0.0615 sobre matrices y precisión bf16 con pesos maestros fp32. Se entrenó en 3 × NVIDIA GH200 de 120 GB. Los datos provienen de la vista de fase 1: 47 bins de texto con licencia abierta (~96B tokens únicos) con fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas; el detalle está en `DATA.md`.

## Capacidades

- Modelo base de difusión enmascarada: genera texto rellenando posiciones enmascaradas de forma iterativa, no token a token de izquierda a derecha.
- Relleno condicionado (infilling) natural por construcción: cualquier posición desconocida puede enmascararse y reconstruirse.
- Extracción de características (`pipeline: feature-extraction`): `model(ids).logits` da la distribución del token limpio en cada posición.
- Muestreo configurable: orden aleatorio (el reverso exacto del entrenamiento) u orden por confianza estilo MaskGIT.
- Multilingüe limitado a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No está ajustado por instrucciones ni por seguridad: no sigue instrucciones de forma fiable.

## Casos de uso

- Estudio de leyes de escalado: comparar la ELBO negativa de esta celda con la del modelo AR equivalente sobre el mismo canon permite validar empíricamente la ley de escalado entre paradigmas; es el uso para el que fue diseñado.
- Investigación en modelos de difusión de lenguaje: sirve como referencia reproducible para probar samplers (el autor compara ~30), schedules de enmascarado y órdenes de desenmascarado sobre un modelo de 1.6B entrenado con receta documentada.
- Relleno de texto (infilling): dado un contexto con huecos, el modelo reconstruye las posiciones enmascaradas, útil para tareas de completado condicionado en investigación.
- Procesamiento de lenguas celtas: es uno de los pocos modelos abiertos con cobertura declarada de galés, gaélico escocés, irlandés, manés, córnico y escocés, útil para experimentos de NLP de bajos recursos.
- Extracción de representaciones: con `pipeline: feature-extraction` puede usarse para obtener logits o representaciones internas en tareas de análisis lingüístico.
- Docencia y divulgación: ejemplo completo y abierto (Apache 2.0, 3.5 GB) de un MDLM con receta de entrenamiento y evaluación publicada, adecuado para cursos sobre modelos generativos no autorregresivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM ("Zero-shot benchmarks are not measured for the MDLM models"). La evaluación disponible es la ELBO negativa sobre el canon interno:

| Metrica | Valor |
|---|---|
| ELBO negativa en canon-8192 (16 sorteos de máscara) | 2.1718 ± 0.0027 nats/token |
| Estimación independiente a un sorteo (PyTorch SDPA) | 2.1682 ± 0.0098 nats/token |

Calidad de muestreo (32 inicios de documento reservados, prompt de 32 tokens, 256 generados, una semilla, puntuado por Qwen3-8B-Base):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0.66 | 0.80 | 7 % |
| Confianza, argmax, penalización 4 (recomendado) | 0.64 | 0.74 | 18 % |
| Igual sin penalización | 0.15 | 0.16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1.39 | 0.66 | 22 % |

## Requisitos de hardware

- VRAM estimada en bf16: ~3.5 GB de pesos más activaciones y caché KV; cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor entrenó en 3 × NVIDIA GH200 de 120 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `modeling_vectabass.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Nota: la generación requiere `steps` pasadas hacia delante (recomendado `steps = gen_length`, un token por paso), por lo que es más costosa por token que un modelo AR equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Benchmarks |
|---|---|---|---|---|---|
| vectabass-1.73b-140bt-mdlm-cooled | 1.729M totales (1.600M sin embeddings) | 2048 | MDLM (difusión) | Apache 2.0 | Solo ELBO negativa (2.1718 nats/token) |
| Modelo AR equivalente de VectaBass (misma escalera y datos) | mismo tamano | 2048 | Autorregresivo | no disponible en la información | no disponible |
| Otros MDLM abiertos de ~1.6B | no disponible | no disponible | MDLM | no disponible | no disponible |

La comparación más directa es con el modelo AR del mismo autor, entrenado sobre los mismos datos y la misma escalera, publicado por separado; el autor indica que el muestreo ancestral exacto del MDLM es "mucho menos fluido" que su AR del mismo tamano.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni de seguridad: no debe usarse como asistente conversacional.
- "Facts are often wrong": el autor advierte explícitamente de errores factuales frecuentes.
- El orden por confianza sin penalización entra en bucles de repetición (80 % de 4-gramas repetidos); la penalización de 4 es una heurística no probada en listas, tablas y código, donde la repetición es correcta.
- El muestreo no es exacto: sesga contra palabras repetidas; temperatura, top-k, top-p y min-p nunca alcanzan la fluidez del texto real.
- Más de un token por paso degrada la calidad (0.73 bits/byte frente a 0.64).
- Ventana de contexto corta (2048 tokens) y cobertura limitada a siete idiomas.
- Sin benchmarks zero-shot publicados; la evaluación se limita a ELBO negativa con una semilla y 32 prompts (error estándar ~0.06 bits/byte).
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin alineación, su uso en producción exige validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-1.73b-140bt-mdlm-cooled
- Modelo AR equivalente de la misma escalera: publicado por separado según la model card, sin URL disponible en la información proporcionada.
- Detalle de datos (`DATA.md`): referenciado en el repo, sin URL directa disponible.
- Paper o blog de la ley de escalado: no disponible en la información proporcionada.
