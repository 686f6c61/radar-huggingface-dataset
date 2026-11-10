# tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. No se trata de un modelo entrenado desde cero, sino de un transplante de atención sobre el modelo base Qwen2.5-0.5B: se sustituye el mecanismo de atención original por una implementación denominada `adaptive_sparse_attention`, registrada en un `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo declarado es evaluar el comportamiento de un esquema de atención dispersa adaptativa en un transformer pequeño.

El proceso de adaptación se realizó sobre el conjunto de datos WikiText-2 (`wikitext-2-raw-v1`) con un patrón de cirugía denominado `hybrid_3_1`, que presumiblemente alterna capas con atención estándar y capas con atención dispersa en una proporción 3:1. Tras el transplante se aplicó una fase de destilación (KD, knowledge distillation) de 61,1 segundos sobre una NVIDIA RTX 3090.

Los resultados reportados en la model card son negativos: la perplejidad causal antes de la destilación era de 31637,39 y después de la destilación pasó a `inf`. Es decir, el modelo resultante no es funcional para generación de texto. Este repositorio debe interpretarse como un artefacto de investigación con resultado fallido, no como un modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B, con atencion `adaptive_sparse_attention` transplantada (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamano del repo es 0,0 GB, lo que sugiere que no se subieron pesos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parametros. Sobre esa base se realiza una "cirugía" de atención: se reemplaza el mecanismo de self-attention por una variante llamada `adaptive_sparse_attention`, registrada en el `ATTENTION_REGISTRY` del stack NeuralOps. El patrón `hybrid_3_1` indica una combinacion de capas, presumiblemente tres capas con atencion estandar por cada capa con atencion dispersa, aunque la model card no detalla la implementacion exacta.

El ajuste se realizo sobre WikiText-2 en su variante `wikitext-2-raw-v1`, un corpus de texto en ingles de tamano reducido, y se aplico una destilacion de conocimiento de 61,1 segundos en una RTX 3090. No se especifican hiperparametros, numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. La metrica reportada es perplejidad causal: 31637,39 antes de la destilacion e `inf` despues, lo que indica que el proceso de adaptacion degradó completamente el modelo.

## Capacidades

- Generacion de texto: no funcional segun los datos reportados (perplejidad infinita tras la destilacion).
- Razonamiento, codigo y matematicas: no evaluados y presumiblemente degradados por el transplante de atencion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre mecanismos de atencion dispersa: el artefacto sirve como referencia de un intento de transplante de atencion `adaptive_sparse_attention` sobre un transformer pequeno, util para comparar con implementaciones propias.
- Reproduccion de experimentos de cirugia de atencion: el patron `hybrid_3_1` y el flujo de destilacion descritos permiten replicar el procedimiento en otros modelos base.
- Estudio de fallos en destilacion de conocimiento: la transicion de perplejidad 31637,39 a `inf` es un caso documentado de colapso durante KD que puede analizarse para diagnosticar inestabilidades.
- Benchmarking de frameworks de atencion (NeuralOps): el `ATTENTION_REGISTRY` puede probarse con este modelo como caso de prueba de integracion.
- Docencia sobre perplejidad y evaluacion de modelos de lenguaje: el contraste pre/post destilacion es un ejemplo didactico de metrica de calidad.
- Analisis de robustez de Qwen2.5-0.5B frente a modificaciones estructurales: permite medir cuanto tolera el modelo base la sustitucion de su atencion nativa.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Perplejidad causal pre-KD | 31637,39 |
| Perplejidad causal post-KD | inf |
| Delta de perplejidad | +inf |
| Tiempo de destilacion | 61,1 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 0,5 mil millones de parametros, en fp16 serian aproximadamente 1 GB, pero el modelo no es funcional segun los datos reportados.
- GPU recomendadas: la unica referencia es una NVIDIA RTX 3090 usada para la destilacion (61,1 s).
- Cabe en GPU consumer: si, por tamano (0,5B), aunque la calidad del modelo resultante es nula.
- Opciones de despliegue: no disponibles; el repositorio no contiene pesos (tamano 0,0 GB), por lo que no puede desplegarse con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2 | 0,5B | no disponible | No funcional (PPL inf) | no disponible | Repo vacio (0,0 GB) |
| Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (segun documentacion publica de Qwen) | Funcional | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Funcional | Apache 2.0 (segun documentacion publica de Qwen) | Hugging Face |

Los datos de contexto y licencia de los modelos Qwen2.5 provienen de la documentacion publica del modelo base y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia comparativa.

## Limitaciones y advertencias

- El modelo no es funcional: la perplejidad causal post-destilacion es `inf`, lo que indica colapso total en la generacion.
- El repositorio tiene un tamano de 0,0 GB, por lo que probablemente no contiene pesos descargables.
- La licencia no esta declarada; no puede asumirse uso comercial.
- Los idiomas soportados no estan declarados; el ajuste se hizo sobre WikiText-2, corpus en ingles.
- Riesgo elevado de alucinacion y salidas incoherentes dada la perplejidad infinita.
- No hay informacion sobre sesgos, evaluaciones de seguridad ni restricciones de uso.
- El proceso de destilacion de 61,1 s es extremadamente corto para un ajuste significativo, lo que sugiere un experimento preliminar o fallido.
- No debe usarse en produccion bajo ninguna circunstancia.

## Enlaces

- [Hugging Face: tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2](https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
