# VectaBass/vectabass-618m-140bt-mdlm-cooled

## Resumen

vectabass-618m-140bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 618 millones de parámetros totales (527,7M no correspondientes a embeddings), desarrollado por VectaBass en el contexto de un estudio de leyes de escalado para IA soberana del Reino Unido. Se trata de la celda N4-D5 de una "cuadrícula MDLM" de fase 1: una escalera de modelos de 100M a 1,6B de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente la ley de escalado. Existe además una cuadrícula autorregresiva (AR) equivalente, entrenada con los mismos datos y la misma escalera, publicada por separado.

El modelo parte de la pila tipo Llama de los modelos AR (atención exclusiva XSA, GQA 2:1, SwiGLU, RMSNorm, RoPE) pero la convierte en bidireccional y la entrena con el objetivo MDLM: la pérdida es el ELBO negativo en tiempo continuo, con un alpha_t lineal (1 - t). Se entrenó desde cero sobre 139.680 millones de tokens, con un contexto de 2048 posiciones y un vocabulario GPT-2 BPE de 50.304 filas.

Es relevante porque no es un modelo de producto sino una pieza de infraestructura científica: sirve para comparar directamente modelos de difusión y autorregresivos bajo la misma receta de datos y cómputo, y para estudiar el ruido entre ejecuciones mediante réplicas de semilla. La licencia Apache 2.0 y la publicación de los pesos lo hacen utilizable como objeto de estudio, no como asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), adaptado a difusión enmascarada (MDLM) |
| Parametros totales | 617.908.480 (embeddings atados) |
| Parametros activos | no aplica (no es MoE); 527.708.160 no-embedding |
| Longitud de contexto | 2048 tokens (RoPE, base 10000) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

Otros datos técnicos: anchura 1792, 15 capas, 28 cabezas de consulta y 14 de clave-valor de dimensión 64, feed-forward SwiGLU de 4752, normalización RMSNorm pre-norm, token de máscara con id 50283, vocabulario de 50.304 filas (GPT-2 BPE de 50.257 más 26 tokens especiales y relleno). Tamaño del repositorio: 2,5 GB.

## Arquitectura y entrenamiento

La red es la pila de los modelos autorregresivos del mismo autor, con atención exclusiva por cabeza (XSA) y GQA 2:1, pero con atención bidireccional en lugar de causal. El objetivo es MDLM con un schedule lineal alpha_t = 1 - t: la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (id 50283) donde el token es desconocido; `diffusion_generate` añade `gen_length` máscaras al prompt y las rellena a lo largo de `steps` pasadas forward.

El entrenamiento utilizó 139.681.857.536 tokens (265 por parámetro no-embedding), con lotes de 851.968 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momento 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00105, warmup de 528M tokens y un schedule de warmup, constante y cooldown 1-sqrt hasta cero en el último 20%. El weight decay fue de 0.0685 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32 y estadísticas de norma, ángulos RoPE y logits en fp32, sobre 2 × NVIDIA GH200 de 120 GB. Los datos corresponden a la vista de la fase 1: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas (detalladas en `DATA.md`). Existen réplicas de semilla en la rama `seed2` (misma receta, nueva inicialización y orden de datos) para medir el ruido entre ejecuciones.

## Capacidades

- Modelo base de difusión enmascarada: genera texto rellenando máscaras de forma iterativa, no de forma autorregresiva token a token.
- Relleno condicional y generación libre mediante `diffusion_generate`, con orden de desenmascarado aleatorio (el reverse process nativo) o por confianza (estilo MaskGIT).
- Extracción de características (`feature-extraction`) mediante representaciones bidireccionales.
- Multilingüe limitado a siete idiomas: inglés y seis lenguas celtas y germánicas del Reino Unido (galés, gaélico escocés, irlandés, manés, córnico y escocés).
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión, audio ni capacidades de agente: no está instruido ni alineado para ello.
- No es un modelo de chat: no hay plantilla de conversación ni ajuste por instrucciones.

## Casos de uso

- Estudio de leyes de escalado: usar esta celda junto con el resto de la escalera (100M a 1,6B) y los presupuestos de tokens para ajustar y validar curvas de pérdida frente a parámetros y datos; el modelo está publicado precisamente para que terceros reproduzcan el ajuste.
- Comparación difusión vs. autorregresivo: evaluar el ELBO negativo de esta celda contra la entropía cruzada del modelo AR equivalente sobre el mismo canon (phase-1-release canon-8192), usando el ELBO como cota superior, para cuantificar la brecha entre ambos objetivos con datos y cómputo idénticos.
- Medición de ruido entre ejecuciones: cargar la revisión `seed2` y comparar logits o métricas de evaluación con la ejecución principal para estimar la varianza run-to-run de la receta.
- Investigación sobre samplers: el autor documenta la comparación de unos 30 samplers sobre 32 inicios de documento retenidos; el modelo sirve como banco de pruebas para estudiar orden de desenmascarado, penalizaciones de presencia y compromiso por confianza en decodificación por difusión.
- Relleno de texto en documentos: dada su atención bidireccional, es adecuado para experimentos de infilling condicionado por contexto a izquierda y derecha, una tarea donde un modelo causal no puede condicionar sobre el futuro.
- Procesamiento de lenguas celtas y textos parlamentarios británicos: al incluir fuentes del sector público y parlamentarias del Reino Unido, sirve para estudiar cobertura y calidad de representaciones en galés, gaélico, irlandés, manés, córnico y escocés, siempre como modelo base y no como generador fiable de hechos.
- Reproducibilidad bit a bit: los pesos reproducen los logits del código de entrenamiento de forma bit a bit en filas enmascaradas del canon, lo que permite usarlos como referencia en pruebas de regresión de implementaciones de MDLM.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ELBO negativo en canon retenido (phase-1-release canon-8192, 8192 × 2048 tokens, 16 máscaras por secuencia) | 2,3253 ± 0,0025 nats por token (± 1 error estándar) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación del autor se limita al ELBO negativo, que es una cota superior de la log-verosimilitud negativa y, por tanto, comparable con la entropía cruzada de un modelo AR solo como cota, no como medida equivalente.

El autor publica además una comparación de samplers sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 tokens generados, una semilla), puntuada por Qwen3-8B-Base en bits por byte UTF-8. Los números corresponden a la celda N6-D5, no a esta celda:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización de presencia 4 incl. prompt (recomendado) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,3-1,5 GB solo para pesos (617,9M parámetros × 2 bytes), más activaciones y caché; el repositorio ocupa 2,5 GB.
- GPU recomendadas: el entrenamiento usó 2 × NVIDIA GH200 de 120 GB, pero la inferencia de un modelo de este tamaño cabe holgadamente en una sola GPU. Una RTX 4090 (24 GB), una RTX 3090 (24 GB) o incluso una GPU consumer de 8-12 GB son suficientes en bf16 o fp16.
- Cabe en GPU consumer: sí, con margen amplio; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue estándar es en bf16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el módulo `modeling_vectabass.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la generación por difusión con `diffusion_generate` es código personalizado y requeriría integración específica en esos motores.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la generación requiere `steps` pasadas forward (el autor recomienda `steps = gen_length`, un token por paso), por lo que el coste es proporcional al número de tokens generados y muy superior al de un decodificador autorregresivo con caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-618m-140bt-mdlm-cooled | 617,9M totales (527,7M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | HuggingFace, código custom |
| Modelo AR equivalente de VectaBass (misma escalera y datos) | mismo orden de magnitud (celda correspondiente) | 2048 | Autorregresivo | no disponible en la información | Publicado por separado según la model card |
| Réplica de semilla `seed2` de esta celda | idénticos | 2048 | MDLM | Apache 2.0 | Rama `seed2` del mismo repositorio |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni ajuste de seguridad: no debe usarse como asistente conversacional ni en aplicaciones orientadas al usuario sin un post-entrenamiento adicional.
- Alucinación elevada: el propio autor advierte que "los hechos suelen ser incorrectos". La evaluación se hizo con una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- El sampler recomendado (confianza, argmax, penalización de presencia 4 incluyendo el prompt) es una heurística, no un muestreo exacto: sesga contra palabras repetidas. Listas, tablas y código, donde la repetición es correcta, no se probaron y las listas siguen repitiéndose.
- Sin penalización, el orden por confianza entra en bucles (80% de 4-gramas repetidos); con penalización 3 todavía repite y con 6 pierde fluidez frente a texto real.
- Mantener un token por paso (`steps = gen_length`): con 4 tokens por paso la calidad cae a 0,73 bits por byte y 0,49 de bigramas distintos.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Cobertura lingüística limitada a siete idiomas, con sesgo hacia fuentes del Reino Unido; no hay garantías para castellano ni para otras lenguas.
- Contexto corto (2048 tokens) para estándares actuales.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin alineación, el riesgo de contenido inapropiado o incorrecto recae en quien lo despliega.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-618m-140bt-mdlm-cooled
- Réplica de semilla: https://huggingface.co/VectaBass/vectabass-618m-140bt-mdlm-cooled/tree/seed2
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo
- Conjuntos de datos citados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo del estudio de escalado: no disponibles en la información proporcionada
