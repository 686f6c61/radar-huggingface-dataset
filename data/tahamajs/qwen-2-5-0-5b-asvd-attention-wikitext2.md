# tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que el autor ha sustituido el mecanismo de atencion original por una implementacion denominada `asvd_attention`, registrada en un `ATTENTION_REGISTRY` propio, y ha aplicado un proceso de destilacion de conocimiento (KD) sobre el corpus WikiText-2. No se trata de un modelo publicado por Alibaba ni de una version oficial de la familia Qwen, sino de un artefacto de investigacion creado por el usuario `tahamajs` para probar variantes de atencion sobre un transformer pequeno. El repositorio no contiene pesos (tamano 0.0 GB) ni model card descriptiva mas alla de los metadatos del experimento.

La relevancia de esta ficha es limitada y fundamentalmente negativa: los propios numeros reportados en la model card muestran que el experimento ha fallado. La perplejidad causal antes de la destilacion era de 377.323,08 y despues de la destilacion paso a `inf`, es decir, el modelo resultante no produce una distribucion de probabilidad valida sobre el corpus de evaluacion. Cualquier uso en produccion o en investigacion seria esta, por tanto, contraindicado.

Se documenta aqui como ejemplo de ficha de un artefacto de investigacion fallido, para que desarrolladores e investigadores puedan identificarlo rapidamente y evitar descargarlo o integrarlo por error en pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion sustituida por `asvd_attention` (variante experimental) |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de Qwen2.5-0.5B; no verificado en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B, no confirmada) |
| Tipos de cuantizacion | No disponible (el repositorio no contiene pesos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (tamano del repo: 0.0 GB, sin ficheros de pesos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con atencion multi-cabeza con RoPE y capas MLP de tipo SwiGLU. Sobre esa base, el autor aplica un "trasplante" de atencion: sustituye el modulo original por `asvd_attention`, una implementacion registrada en un `ATTENTION_REGISTRY` que no se documenta en la model card. El patron de cirugia indicado es `hybrid_3_1`, lo que sugiere que la sustitucion se aplica de forma intercalada (posiblemente tres capas con atencion original y una con la variante, o viceversa), aunque el detalle exacto no se especifica.

El entrenamiento consiste en una destilacion de conocimiento sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), un corpus de Wikipedia en ingles de aproximadamente 2 millones de tokens, muy pequeno para cualquier ajuste significativo. La destilacion se ejecuto en 60,3 segundos sobre una NVIDIA RTX 3090, lo que confirma que se trata de un experimento de un solo paso o de muy pocos pasos, no de un entrenamiento completo. Los resultados reportados (PPL pre-KD de 377.323,08 y post-KD de `inf`) indican que la sustitucion de atencion rompe el modelo y que la destilacion no solo no lo recupera, sino que lo degrada hasta producir salidas degeneradas.

## Capacidades

- Generacion de texto: no funcional. La perplejidad infinita tras la destilacion implica que el modelo no asigna probabilidad valida a secuencias de texto en el corpus de evaluacion.
- Razonamiento: no evaluado y no esperable dado el estado del checkpoint.
- Codigo y matematicas: no evaluado.
- Tool calling / function calling: no soportado de forma documentada.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no documentadas; el unico corpus usado es WikiText-2 en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Estudio de fallos en sustitucion de mecanismos de atencion: el checkpoint sirve como caso de referencia de como un trasplante de atencion sin ajuste adecuado colapsa la perplejidad, util para comparar con variantes que si funcionan.
- Reproduccion de experimentos de destilacion sobre WikiText-2: el autor documenta tiempos (60,3 s en RTX 3090) y perplejidades, lo que permite replicar el protocolo y medir la degradacion introducida.
- Docencia sobre evaluacion de modelos: ejemplo practico de por que una perplejidad de `inf` invalida un checkpoint y de por que no debe publicarse sin validacion previa.
- Pruebas de infraestructura de carga de checkpoints: util para verificar que un pipeline de inferencia detecta y rechaza pesos degenerados o repositorios sin ficheros de pesos.
- Analisis de registros de atencion (`ATTENTION_REGISTRY`): permite inspeccionar como se estructura un registro de variantes de atencion en codigo de investigacion.
- Comparacion de tecnicas de cirugia de modelos (`hybrid_3_1`): sirve como linea base negativa frente a otras estrategias de poda o sustitucion de capas.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD | 377.323,08 |
| Perplejidad causal post-KD | `inf` |
| Delta de perplejidad | `+inf` |
| Tiempo de destilacion | 60,3 s en NVIDIA RTX 3090 |
| Dataset de evaluacion | WikiText-2 (`wikitext-2-raw-v1`) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. Los datos anteriores no son comparables con los de Qwen2.5-0.5B original, cuya perplejidad en WikiText-2 se situa en el entorno de dos digitos, ordenes de magnitud por debajo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, ya que el repositorio no contiene pesos descargables (tamano 0.0 GB).
- GPU recomendadas: la unica referencia es la RTX 3090 empleada para la destilacion; no hay datos de inferencia.
- Cabe en GPU de consumo: teoricamente un modelo de 0,5B en fp16 ocuparia alrededor de 1 GB de VRAM, pero al no haber pesos publicados no es posible ejecutarlo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no pueden cargar este repositorio al carecer de ficheros `safetensors` o `GGUF`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2` | ~0,5B | no disponible | `inf` (post-KD) | no disponible | Repo sin pesos |
| Qwen2.5-0.5B (Alibaba) | 0,5B | 32.768 tokens (segun documentacion oficial de Qwen) | no disponible en esta busqueda | Apache 2.0 (segun documentacion oficial de Qwen) | Pesos publicados en HF |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | no disponible en esta busqueda | Apache 2.0 | Pesos publicados en HF |
| SmolLM2-360M | 0,36B | 8.192 tokens (segun documentacion de HuggingFace) | no disponible en esta busqueda | Apache 2.0 | Pesos publicados en HF |

La comparativa deja claro que el checkpoint experimental no es una alternativa practica a ningun modelo de su categoria: carece de pesos, de licencia declarada y de rendimiento medible.

## Limitaciones y advertencias

- Modelo no funcional: la perplejidad post-destilacion es `inf`, lo que indica salidas degeneradas o NaN en la distribucion de probabilidad.
- Repositorio vacio: el tamano de 0.0 GB sugiere que no se han subido pesos, tokenizador ni configuracion; la carga fallara en cualquier framework.
- Licencia no declarada: no se puede asumir uso comercial ni redistribucion; la licencia del modelo base (Apache 2.0 segun la documentacion de Qwen) no se hereda automaticamente si el autor no la declara.
- Sesgos: no evaluados; el unico corpus empleado es WikiText-2 en ingles, con el sesgo enciclopedico propio de Wikipedia.
- Riesgo de alucinacion: total, al no existir una distribucion de probabilidad valida.
- Limitaciones de idioma: sin datos multilingues; el entrenamiento se limita a ingles.
- Caveat para produccion: no debe integrarse en ningun pipeline; cualquier uso debe limitarse a analisis forense del experimento.
- Fecha de creacion anomala (2026-11-09): conviene verificar la autenticidad del repositorio antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Documentacion de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de WikiText-2 (Merity et al., 2016): https://arxiv.org/abs/1609.07843
- No se han encontrado papers, blogs ni demos adicionales asociados a este checkpoint en la informacion proporcionada.
