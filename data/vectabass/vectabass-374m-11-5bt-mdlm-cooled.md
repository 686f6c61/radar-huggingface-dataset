# VectaBass/vectabass-374m-11.5bt-mdlm-cooled

## Resumen

vectabass-374m-11.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 374 millones de parámetros totales (303,1 millones no de embedding), entrenado desde cero por el autor independiente VectaBass sobre 11.520 millones de tokens. Forma parte de la "MDLM square" de la fase 1: una escalera de modelos de 100M a 1.600M de parámetros no de embedding, cada tamano entrenado con varios presupuestos de tokens, publicados conjuntamente para poder verificar empíricamente la ley de escalado. Este repositorio corresponde a la celda N3-D2 de esa matriz.

La arquitectura no es autorregresiva: parte del stack tipo Llama de los modelos AR del mismo autor (atención con GQA 2:1 y exclusive self-attention, SwiGLU, RMSNorm pre-norm, RoPE con contexto de 2048) pero lo hace bidireccional y lo entrena con el objetivo MDLM, cuya pérdida es el ELBO negativo en tiempo continuo. La generación se realiza rellenando posiciones enmascaradas de forma iterativa, no token a token de izquierda a derecha.

Es relevante ahora por dos motivos. Primero, es un artefacto de investigación sobre leyes de escalado en difusión discreta, un área con pocos puntos de datos públicos y reproducibles. Segundo, incluye un estudio empírico de unos 30 samplers con métricas concretas (bits por byte UTF-8, bigramas distintos, 4-gramas repetidos), algo poco habitual en modelos de este tamano. No es un modelo instructivo ni ajustado en seguridad: es una base para estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con difusión enmascarada (MDLM); GQA 2:1, XSA, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 373.942.272 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Parametros no de embedding | 303.114.240 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB), con `custom_code` (`modeling_vectabass.py`) |
| Anchura / capas | 1408 / 13 |
| Cabezas | 22 query, 11 key-value, dim 64 |
| Feed-forward | SwiGLU, 4112 |
| Token de mascara | id 50283 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) + 26 tokens especiales, resto padding |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo reutiliza el stack de los modelos autorregresivos del mismo autor, con atención exclusiva auto-referente (XSA) y GQA 2:1, pero convertido en bidireccional: cada posición ve todo el contexto, no solo el pasado. La capa de salida predice, en cada posición, la distribución del token limpio; las posiciones desconocidas se marcan con el token de máscara (id 50283). El objetivo es MDLM con un schedule lineal alpha_t = 1 - t, y la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones.

El entrenamiento consumió 11.519.819.776 tokens (38 por parámetro no de embedding), con lotes de 622.592 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) y AdamW en fp32 (0.9, 0.95). El LR máximo fue 0.00124, con 303M tokens de warmup, fase constante y un cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue 0.0842 sobre matrices. Se entrenó en bf16 con pesos maestros fp32, estadísticas de normalización, ángulos RoPE y logits en fp32, todo en una única NVIDIA GH200 de 120 GB.

Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas (fineweb-edu, fineweb-2, finemath). El detalle por bin, su proporción y licencia está en `DATA.md`. No hay RLHF ni DPO: es un modelo base.

## Capacidades

- Relleno de texto enmascarado: dado un contexto con huecos marcados, predice los tokens limpios en cada posición.
- Generación por difusión iterativa mediante `diffusion_generate`, con orden `random` (el proceso inverso nativo) o `confidence` (estilo MaskGIT).
- Extracción de características y logits por posición vía `model(ids).logits`.
- Capacidad multilingüe limitada al conjunto declarado: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni razonamiento multi-paso entrenado.
- No está ajustado a instrucciones: no sigue instrucciones ni mantiene diálogo de forma fiable.

## Casos de uso

- Estudio de leyes de escalado en difusión discreta: el modelo es una celda de una matriz con tamanos y presupuestos de tokens controlados, pensada para contrastar empíricamente la relación entre parámetros, tokens y ELBO negativo frente a los modelos AR del mismo autor.
- Investigación de samplers: el repositorio documenta unos 30 samplers evaluados con bits por byte, bigramas distintos y 4-gramas repetidos, lo que permite reproducir y extender ese análisis con el código incluido.
- Relleno de texto (text infilling) en documentos: útil para experimentos de completado de huecos en corpus ingleses o de lenguas celtas, siempre que se acepte que los hechos pueden ser incorrectos.
- Generación de continuaciones cortas para evaluación comparativa: con prompt de 32 tokens y 256 generados, el ajuste recomendado (confidence, argmax, presence penalty 4, un token por paso) alcanza 0,64 bits por byte, cercano a la continuación real (0,66).
- Experimentos académicos sobre lenguas celtas de bajos recursos: el corpus incluye fuentes en cy, gd, ga, gv, kw y sco, lo que permite estudiar el comportamiento de un MDLM en estas lenguas.
- Docencia y reproducción de resultados: el modelo cabe en una sola GPU consumer en bf16 y el código de generación es autocontenido, lo que facilita replicar el estudio de muestreo en un entorno pequeño.
- Línea base para comparaciones AR frente a difusión: al existir un cuadrado AR equivalente entrenado con los mismos datos y escalera, sirve como referencia controlada en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM; la propia model card indica que no se midieron.

| Metrica | Valor |
|---|---|
| ELBO negativo en canon-8192 (16 draws por secuencia) | 2,7041 ± 0,0025 nats por token |
| ELBO negativo, estimación independiente con PyTorch SDPA (un draw) | 2,7029 ± 0,0102 nats por token |
| Bits por byte, continuación real (referencia) | 0,66 |
| Bits por byte, confidence + argmax + penalty 4 (recomendado) | 0,64 |
| Bits por byte, mismo ajuste sin penalty | 0,15 |
| Bits por byte, orden random con muestreo ancestral exacto | 1,39 |
| Bigramas distintos, recomendado / real / random | 0,74 / 0,80 / 0,66 |
| 4-gramas repetidos, recomendado / real / random | 18% / 7% / 22% |

Las métricas de muestreo se midieron en la celda N6-D5, no en esta, sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 generados, una semilla), puntuadas por Qwen3-8B-Base. El error estándar en bits por byte es de aproximadamente 0,06.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 0,75 GB de pesos más activaciones y caché KV; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: NVIDIA GH200 (la usada en entrenamiento), pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier A100/H100.
- Cabe en GPU consumer: sí, en todas las modernas; el repo completo ocupa 0,7 GB.
- Despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`; el método `diffusion_generate` está incluido en el código custom. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en esas herramientas.
- Latencia y throughput: no disponibles. El coste de generación es de `steps` pasadas hacia delante completas (recomendado `steps = gen_length`), es decir, una pasada por token generado, muy superior al coste de un decoder AR equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-374m-11.5bt-mdlm-cooled | 374M (303M no emb.) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Base, sin benchmarks zero-shot; ELBO 2,7041 nats/token |
| Modelo AR del mismo autor (cuadrado AR, misma escalera y datos) | mismo orden | no disponible | Autorregresivo | no disponible | Referencia directa para comparar difusión frente a AR; publicado por separado |
| Modelos MDLM pequeños de investigación (p. ej. series MDLM/SEDD) | 100M-1B | variable | Difusión enmascarada | variable | No se dispone de datos concretos en la información proporcionada |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; el propio autor señala que el ELBO negativo solo puede contrastarse con la entropía cruzada de un modelo AR como cota, no como medida equivalente.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no debe usarse directamente en producción orientada a usuario final.
- Los hechos generados son a menudo incorrectos, según advierte la propia model card.
- Sin penalty de presencia, el orden por confianza entra en bucles; con penalty 3 todavía repite y con 6 pierde fluidez. El valor 4 es heurístico y no un muestreo exacto.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamano; temperatura, top-k, top-p y min-p no alcanzan la calidad de texto real.
- Más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- Listas, tablas y código, donde la repetición es correcta, no se evaluaron, y las listas siguen repitiéndose.
- Las métricas de muestreo se obtuvieron con una sola semilla y 32 prompts (error estándar de unos 0,06 bits por byte) y en otra celda de la matriz (N6-D5), no en esta.
- Cobertura lingüística limitada a las siete lenguas declaradas; el rendimiento fuera de ellas no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de sesgos ni de seguridad, el uso comercial requiere validación propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-11.5bt-mdlm-cooled
- Código de modelado incluido en el repo: `modeling_vectabass.py`
- Documentación de datos del autor: `DATA.md` (referenciado en la model card, dentro del repositorio)
- Paper de MDLM (referencia del objetivo, no enlazado en la información proporcionada): no disponible
- Blog o demo del autor: no disponible
