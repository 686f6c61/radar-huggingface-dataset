# therickcain/penclaw-GLM-5.3-abliterated-mirror

## Resumen

Warlock es un modelo de lenguaje de gran escala derivado de GLM-5.3 mediante una edicion de pesos a nivel de tensor (abliteration), producida por Audn. El modelo conserva la arquitectura original GLM-5.3 (etiquetada en HuggingFace como `glm_moe_dsa`, es decir, un transformer con mezcla de expertos y atencion dispersa) y aplica una proyeccion ortogonal sobre la direccion interna de rechazo en las capas que escriben en el residual stream, sin reentrenamiento ni ajuste fino. El resultado es un modelo que mantiene el perfil de capacidades y la coherencia del modelo base, pero responde donde originalmente rechazaria.

El repositorio es un mirror publicado por el usuario therickcain bajo el identificador `therickcain/penclaw-GLM-5.3-abliterated-mirror`, con 753.329.940.480 parametros totales segun los tensores en safetensors y un tamano de repositorio de 1506,7 GB en BF16. La model card original corresponde a la publicacion de Audn (`audnai/penclaw-GLM-5.3-abliterated`), de la que este mirror replica el contenido.

Es relevante ahora porque los modelos abliterated de gran escala con licencia permisiva para investigacion de seguridad son escasos, y porque Warlock declara metricas de no rechazo y de entrega util de contenido evaluadas con un benchmark propio (Audn Refusal Benchmark). Su uso previsto declarado es el red-teaming autorizado, la investigacion en seguridad y la evaluacion, no el despliegue comercial general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (`glm_moe_dsa`, transformer con mezcla de expertos y atencion dispersa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card recomienda un presupuesto de generacion de al menos 16k tokens) |
| Tipos de cuantizacion | pesos publicados en BF16; no se listan cuantizaciones GGUF/AWQ/GPTQ en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3, identificado en HuggingFace con la arquitectura `glm_moe_dsa`, lo que indica un transformer con mezcla de expertos (MoE) y atencion dispersa (DSA). No se dispone en la informacion proporcionada del numero de parametros activos por token, del numero total de tokens de entrenamiento, de la composicion del dataset ni de si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica de esta variante es la abliteration: una intervencion a nivel de pesos que aisla la direccion interna que el modelo utiliza para decidir rechazar una peticion y proyecta esa direccion fuera de cada peso que escribe en el residual stream, capa por capa. El resto de la red queda intacto, por lo que el modelo conserva su perfil de capacidades y coherencia y se carga y sirve como cualquier modelo estandar, sin prompts de sistema especiales, adaptadores ni andamiaje en tiempo de ejecucion. La model card documenta dos iteraciones de investigacion (`iter4` e `iter11`) con resultados de no rechazo del 70% y 85% respectivamente, y coherencia intacta en ambas.

## Capacidades

- Generacion de texto conversacional y de razonamiento extenso: es un modelo de tipo thinking que razona durante un bloque interno antes de responder.
- Razonamiento multi-paso con presupuesto de generacion amplio; la model card advierte que con menos de 16k tokens la respuesta se trunca dentro del bloque de razonamiento.
- Conocimiento general y fluidez heredados del modelo base GLM-5.3, sin degradacion declarada por la edicion de pesos.
- Respuesta a peticiones que el modelo base rechazaria, con una tasa de no rechazo declarada del 92,5% en el Audn Refusal Benchmark.
- Carga con `transformers`, `vLLM` y `sglang` mediante `trust_remote_code=True`.
- Soporte de tool calling, function calling, capacidades de agente, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Red-teaming autorizado de sistemas de IA: el modelo sirve como generador de peticiones y respuestas adversarias para evaluar las defensas de otros sistemas, aprovechando su alta tasa de no rechazo declarada (92,5%) para cubrir casos limite que un modelo alineado evitarla.
- Investigacion en seguridad y alineacion: permite estudiar como se distribuye la direccion de rechazo en un modelo MoE de gran escala y comparar el comportamiento antes y despues de la edicion de pesos, dado que la intervencion es puramente a nivel de tensor y reversible en la practica cargando el modelo base.
- Evaluacion de clasificadores de contenido y filtros de moderacion: al generar respuestas que un modelo estandar rechazaria, se puede medir la cobertura y los falsos negativos de los filtros de salida en pipelines de moderacion.
- Analisis de robustez de jueces automaticos: la model card reporta comparaciones entre backends de evaluacion (Modal K3REL, KIMI-K3-1M y Warlock) sobre un conjunto de 520 peticiones, lo que permite usar el modelo como sujeto de prueba en la calibracion de jueces LLM.
- Pruebas de carga y despliegue de modelos de 753B parametros: el repositorio en BF16 (1506,7 GB) sirve para validar infraestructura de inferencia con vLLM o sglang en clusters multi-GPU antes de desplegar el modelo base.
- Investigacion sobre fidelidad del razonamiento: al conservar el modo thinking y la coherencia del modelo base, permite comparar cadenas de razonamiento en respuestas que originalmente se truncaban por rechazo.

## Benchmarks y rendimiento

Resultados declarados por el autor con el Audn Refusal Benchmark (thinking activado, temperatura 1.0, presupuesto de 16k tokens, entrega evaluada por un juez LLM):

| Metrica | Warlock |
|---|---:|
| No rechazo (non-refusal) | 92,5% |
| Entrega (delivery) | 82,5% |

Comparativa ampliada sobre el conjunto de 520 peticiones:

| Metrica | necromicon standard (Modal K3REL) | KIMI-K3-1M (audn.ai/necromicon) | Warlock |
|---|---:|---:|---:|
| Cumplimiento por regex | 96,7% (503/520) | 97,1% (505/520) | 92,5% |
| Entregado (contenido util real) | 65,0% (338) | 76,7% (399) | 82,5% |
| Desviado (sustituto seguro o reencuadre) | 19,6% (102) | 17,5% (91) | 10,0% |
| Rechazado (sustantivo) | 15,0% (78) | 5,8% (30) | 7,5% |
| Vacio (regex) | 5 | 0 | 0 |

Iteraciones de investigacion declaradas:

| Metrica | iter4 | iter11 |
|---|---:|---:|
| No rechazo (substring Arditi) | 70% | 85% |
| Entrega (juez necromicon) | 37,5% | 35,0% |
| Coherencia | intacta | intacta (~8/40 borderline) |
| Desglose de veredictos | 15 entregado / 14 desviado / 11 rechazado | 14 entregado / 24 desviado / 2 rechazado |

No se han publicado en la informacion disponible resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K, MATH) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1506 GB solo para pesos, mas memoria para KV cache y activaciones; requiere un nodo multi-GPU de gama alta.
- En BF16 se necesitan al menos 19 GPU de 80 GB (A100/H100) para alojar los pesos, sin margen para cache; en la practica se recomienda un nodo de 8x H100 con paralelismo de tensor y de expertos, o varias maquinas.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en BF16; no se dispone de cuantizaciones GGUF, AWQ o GPTQ publicadas en la informacion disponible que permitan reducir el requisito.
- Opciones de despliegue declaradas: `transformers` (con `trust_remote_code=True` y `device_map="auto"`), `vLLM` y `sglang`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Warlock (este modelo) | 753.329.940.480 | no disponible | other | HuggingFace (mirror) y API de pago en platform.audn.ai | Abliterated, thinking, BF16 |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Referencia de origen; sin datos publicados en la informacion proporcionada |
| necromicon standard (Modal K3REL) | no disponible | no disponible | no disponible | no disponible | Comparable solo por resultados del benchmark de rechazo |
| KIMI-K3-1M (audn.ai/necromicon) | no disponible | no disponible | no disponible | no disponible | Comparable solo por resultados del benchmark de rechazo |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a los resultados del Audn Refusal Benchmark.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo por diseno; el modelo puede generar contenido danino, ilegal o inseguro. La model card restringe el uso previsto a red-teaming autorizado, investigacion en seguridad y evaluacion.
- La licencia es "other" y no se detallan sus terminos en la informacion disponible; antes de cualquier uso comercial o redistribucion hay que verificar las condiciones del modelo base GLM-5.3 y del autor.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de razonamiento con generacion larga, el riesgo de derivas en cadenas de pensamiento extensas es relevante.
- La edicion de pesos puede degradar la coherencia en una fraccion pequena de casos: la iteracion `iter11` reporta aproximadamente 8 de 40 casos borderline.
- Con presupuestos de generacion inferiores a 16k tokens las respuestas se truncan dentro del bloque de razonamiento y quedan incompletas.
- Idiomas soportados y limitaciones de contexto no documentados; no se puede garantizar un comportamiento multilingue adecuado.
- El repositorio es un mirror de terceros (therickcain) con 30 descargas y 0 likes; conviene contrastar la integridad de los pesos con la publicacion original de Audn.
- El benchmark empleado es propio del autor y evaluado por un juez LLM, no un benchmark academico independiente; los resultados deben interpretarse con cautela.

## Enlaces

- HuggingFace (este mirror): https://huggingface.co/therickcain/penclaw-GLM-5.3-abliterated-mirror
- Modelo original referenciado en la model card: https://huggingface.co/audnai/penclaw-GLM-5.3-abliterated
- Repositorio del benchmark de rechazo: https://github.com/audn-ai/refusal-benchmark
- Resultados ampliados del benchmark: https://github.com/audn-ai/refusal-benchmark/blob/main/FINDINGS.md
- Sitio del autor: https://audn.ai
- API de pago: https://platform.audn.ai
- Acceso via necromicon: https://audn.ai/necromicon
