# wangzhang/granite-4.1-3b-abliterated

## Resumen

`wangzhang/granite-4.1-3b-abliterated` es un derivado del modelo base `ibm-granite/granite-4.1-3b` de IBM, al que se le ha aplicado la técnica de **abliteración** (abliteration) mediante la herramienta `abliterix v1.8.0`. Esta técnica, descrita en el artículo de Arditi et al. (2024), identifica la dirección del flujo residual que el modelo utiliza para codificar la negativa a responder contenido dañino y la elimina mediante una edición de pesos de rango 1, sin necesidad de fine-tuning ni nuevos datos de entrenamiento. El resultado es un modelo que conserva la mayor parte de sus capacidades generales pero reduce drásticamente los rechazos de seguridad.

Con 3.402.836.480 parámetros (3,4B), este modelo está pensado para entornos donde se requiere una inferencia rápida (~3 veces más rápida que su hermano mayor de 8B) y una huella de memoria reducida. La licencia Apache 2.0 permite uso comercial sin restricciones. El modelo está disponible en formato `safetensors` y es compatible con la librería `transformers` de HuggingFace.

La relevancia de este modelo radica en su aplicación en investigación de seguridad, generación de contenido creativo sin censura y pruebas de robustez de modelos. Su evaluación muestra una reducción del 83% en los rechazos (del 69,5% al 12,0%) con una divergencia KL de 0,1316 respecto al modelo base, lo que indica una alteración mínima del comportamiento en consultas benignas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 3.402.836.480 (3,4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (nativo); FP4, FP8, INT4, INT8 disponibles via servicios externos (FriendliAI) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.1-3b` es un transformer decoder-only denso de 3,4B parametros, desarrollado por IBM como parte de la familia Granite 4.1. Segun la documentacion oficial de IBM, esta familia incluye modelos de 3B, 8B y 30B con variantes instruidas, y soporta de forma nativa capacidades multilingues, tareas de codificacion, retrieval-augmented generation (RAG), uso de herramientas y salida JSON estructurada. El modelo base fue entrenado con un pipeline que incluye datos multilingues y de codigo, aunque este derivado solo declara soporte para ingles.

La abliteracion aplicada en este derivado es una **cirugia de pesos**, no un fine-tuning. El proceso identifica la direccion del flujo residual `v` que el modelo alineado utiliza para codificar "este prompt es danino, debo rechazarlo". Cada modulo que escribe en el flujo residual (`attn.o_proj`, `mlp.down_proj`) se edita in-place con la formula `W' = W - α · v · (vᵀ W)`, donde `α` varia por capa siguiendo un taper lineal centrado en la capa con la senal de rechazo mas fuerte. El vector `v` se calcula como la diferencia de medias entre prompts daninos y benignos, con proyeccion Gram-Schmidt contra la media benigna (proyeccion abliterada de grimjim). El resultado es una actualizacion de rango 1 por matriz editada, completamente fusionada en los pesos finales.

El autor selecciono el checkpoint actual (trial 47) de un estudio de 50 candidatos optimizados con TPE (Tree-structured Parzen Estimator) como el punto equilibrado en el frente de Pareto entre reduccion de rechazos y fidelidad KL. El modelo de 8B hermano (`wangzhang/granite-4.1-8b-abliterated`) reporta una KL de 0,039 a un nivel de rechazo similar, mientras que este 3B alcanza 0,132, una diferencia atribuida a artefactos de escalado en modelos densos (menor dimension oculta, escalado mUP con `logits_scaling = 10.0` y `residual_multiplier = 0.22`).

## Capacidades

- **Generacion de texto**: produce respuestas coherentes y contextualmente relevantes en ingles, manteniendo la fluidez del modelo base.
- **Razonamiento y matematicas**: hereda las capacidades de razonamiento del modelo base Granite 4.1, que incluye mejoras en razonamiento matematico y logico.
- **Generacion de codigo**: soporta tareas de programacion, aunque no se han publicado benchmarks especificos para este derivado.
- **Tool calling y function calling**: el modelo base Granite 4.1 soporta uso de herramientas y salida JSON estructurada; este derivado conserva estas capacidades al no alterar la arquitectura.
- **RAG (Retrieval-Augmented Generation)**: compatible con pipelines de recuperacion de informacion, segun las capacidades del modelo base.
- **Ausencia de rechazos de seguridad**: la principal capacidad diferencial es que responde a instrucciones que el modelo base rechazaria, con una tasa de rechazo del 12% frente al 69,5% del original.
- **Multilingue**: aunque el tag declara solo ingles, el modelo base es multilingue; no se ha verificado el comportamiento en otros idiomas en este derivado.

## Casos de uso

- **Investigacion en seguridad de IA**: permite estudiar el comportamiento de modelos sin capas de rechazo, analizando como responden a prompts daninos y que mecanismos internos subyacen a la alineacion. Los investigadores pueden usar este modelo como baseline para comparar tecnicas de mitigacion.
- **Generacion creativa sin censura**: util para escritores y creadores de contenido que necesitan explorar temas controvertidos o adultos sin que el modelo se niegue, manteniendo la calidad linguistica del modelo base.
- **Pruebas de robustez y red teaming**: las organizaciones pueden evaluar la efectividad de sus propios sistemas de moderacion enfrentandolos a un modelo que no tiene rechazos, identificando vulnerabilidades en sus pipelines.
- **Desarrollo de agentes conversacionales especializados**: en dominios donde las politicas de seguridad estandar son demasiado restrictivas (por ejemplo, simulacion de personajes historicos o ficcion oscura), este modelo puede integrarse como motor de dialogo.
- **Fine-tuning posterior**: al estar basado en Granite 4.1 y tener pesos completamente fusionados, puede servir como punto de partida para fine-tuning con datos propios, aprovechando la licencia Apache 2.0.
- **Despliegue en entornos con recursos limitados**: con 3,4B parametros, cabe en GPUs de consumo (8-10 GB VRAM en BF16) y puede ejecutarse en CPU con cuantizacion, lo que lo hace adecuado para prototipos y aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion publicada es la realizada por el autor, que mide la tasa de rechazo y la divergencia KL respecto al modelo base:

| Metrica | Base `granite-4.1-3b` | Este modelo | Delta |
|---|---|---|---|
| Rechazos (200 prompts daninos) | 139/200 (69,5 %) | 24/200 (12,0 %) | -83 % |
| Divergencia KL (1 token, benigno) | 0,0000 | 0,1316 | — |
| Desviacion de longitud de respuesta (benigno, unidades sigma) | 0 | 0,03 | despreciable |

El autor tambien reporta el contexto Pareto del estudio de optimizacion, con tres puntos representativos:

| Trial | Rechazos | KL | Uso recomendado |
|---|---|---|---|
| 24 | 12/200 (6,0 %) | 0,1965 | agresivo (menos rechazos) |
| 47 (este) | 24/200 (12,0 %) | 0,1316 | equilibrado |
| 46 | 31/200 (15,5 %) | 0,0938 | conservador (menor KL) |

## Requisitos de hardware

- **VRAM estimada para inferencia**: en BF16, el modelo ocupa aproximadamente 6,8 GB (3,4B parametros × 2 bytes). Con cuantizacion INT8, ~3,4 GB; con INT4, ~1,7 GB.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) o superiores para BF16 con margen; GPUs con 8 GB (RTX 3070, RTX 4060) pueden ejecutarlo con cuantizacion INT8. Para produccion, A100 o H100 ofrecen mayor throughput.
- **Compatibilidad con GPU de consumo**: si, cabe en GPUs consumer de 8 GB o mas con cuantizacion, y en 16 GB sin cuantizar.
- **Opciones de despliegue**: compatible con `transformers` (HuggingFace), `vLLM`, `llama.cpp`, `Ollama`, `TGI` (Text Generation Inference) y servicios como FriendliAI que ofrecen kernels optimizados y cuantizacion FP4/FP8/INT4/INT8.
- **Latencia y throughput estimados**: no se han publicado mediciones especificas. Como referencia, un modelo de 3B en una RTX 4090 suele generar entre 50-100 tokens/segundo en BF16, y mas de 150 tokens/segundo con cuantizacion INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (200 prompts) | KL | Licencia |
|---|---|---|---|---|---|
| `ibm-granite/granite-4.1-3b` (base) | 3,4B | no disponible | 69,5 % | 0,0000 | Apache 2.0 |
| `wangzhang/granite-4.1-3b-abliterated` (este) | 3,4B | no disponible | 12,0 % | 0,1316 | Apache 2.0 |
| `wangzhang/granite-4.1-8b-abliterated` | 8B | no disponible | ~12 % (similar) | 0,039 | Apache 2.0 |

La comparativa se limita a los modelos de la misma familia abliterada, ya que no se dispone de datos de otros modelos abliterados de tamano similar en la informacion proporcionada. El modelo de 8B ofrece menor divergencia KL a costa de ~3 veces mas tiempo de inferencia.

## Limitaciones y advertencias

- **Contenido potencialmente danino**: al eliminar los rechazos de seguridad, el modelo puede generar instrucciones para fabricar armas, drogas u otros contenidos peligrosos. Su uso en produccion sin moderacion adicional es irresponsable y puede tener consecuencias legales.
- **Sesgos y alucinaciones**: el modelo base Granite 4.1 puede presentar sesgos presentes en sus datos de entrenamiento; la abliteracion no los corrige. La tasa de alucinacion no ha sido evaluada especificamente.
- **Divergencia KL no despreciable**: aunque la KL de 0,1316 es baja, puede producir cambios sutiles en el estilo de respuesta en consultas benignas, como se muestra en el ejemplo de la model card donde las respuestas divergen tras los primeros 30 tokens.
- **Soporte limitado de idiomas**: el modelo declara solo ingles; su comportamiento en otros idiomas no ha sido verificado y podria degradarse.
- **Longitud de contexto no documentada**: no se ha especificado la ventana de contexto maxima; se recomienda asumir la del modelo base Granite 4.1 (no disponible en la informacion proporcionada).
- **Riesgo de uso indebido**: la combinacion de licencia permisiva y ausencia de rechazos facilita la creacion de aplicaciones malintencionadas. Los desarrolladores deben implementar sus propias capas de moderacion si despliegan este modelo en entornos publicos.
- **Sin garantias de calidad**: es un derivado experimental creado por un tercero, no por IBM. No hay soporte oficial ni garantias de rendimiento en produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/wangzhang/granite-4.1-3b-abliterated)
- [Modelo base de IBM](https://huggingface.co/ibm-granite/granite-4.1-3b)
- [Hermano mayor 8B abliterated](https://huggingface.co/wangzhang/granite-4.1-8b-abliterated)
- [Repositorio de abliterix](https://github.com/wuwangzhang1216/abliterix)
- [Paper de abliteracion (Arditi et al., 2024)](https://arxiv.org/abs/2406.11717)
- [Blog de grimjim sobre proyeccion abliterada](https://huggingface.co/blog/grimjim/projected-abliteration)
- [Documentacion oficial de Granite 4.1 de IBM](https://www.ibm.com/granite/docs/models/granite4-1)
- [Repositorio GitHub de IBM Granite 4.1](https://github.com/ibm-granite/granite-4.1-language-models)
- [Pagina del modelo en FriendliAI](https://friendli.ai/models/wangzhang/granite-4.1-3b-abliterated)
