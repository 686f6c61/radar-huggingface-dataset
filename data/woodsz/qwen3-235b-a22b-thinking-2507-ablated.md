# woodsz/Qwen3-235B-A22B-Thinking-2507-ablated

## Resumen

Qwen3-235B-A22B-Thinking-2507-ablated es una derivada experimental del modelo Qwen3-235B-A22B-Thinking-2507 de Qwen, publicada por el usuario woodsz en Hugging Face. Se trata de una versión "abliterada": se ha aplicado la técnica de abliteration para eliminar la dirección interna responsable de los rechazos de seguridad, de modo que el modelo ya no se niega a responder a peticiones que el modelo original consideraría dañinas. El modelo no ha sido afinado (fine-tuned); la única modificación es la intervención quirúrgica sobre las proyecciones de atención y de los expertos.

El modelo base es un MoE (mixture of experts) de 235.093 millones de parámetros totales con aproximadamente 22.000 millones activos por token, orientado a razonamiento profundo ("thinking mode"), y es en la actualidad uno de los modelos abiertos más potentes para tareas de razonamiento, matemáticas y código. La variante abliterada conserva esa capacidad teórica, aunque el propio autor advierte que ni la calidad ni el comportamiento de rechazo han sido evaluados con benchmarks.

Es relevante para investigadores que estudian alineación, seguridad y técnicas de modificación de modelos, así como para quienes necesitan un modelo sin filtros de rechazo. Su uso conlleva riesgos éticos y legales significativos, y debe tratarse como un artefacto experimental, no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), variante thinking |
| Parametros totales | 235.093.634.560 (dato real de safetensors) |
| Parametros activos | ~22.000 millones por token (según model card del modelo base Qwen3-235B-A22B) |
| Longitud de contexto | No disponible en esta ficha; consultar la model card de Qwen/Qwen3-235B-A22B-Thinking-2507 (el modelo base publica una ventana nativa de 262.144 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en BF16, 470,2 GB) |
| Idiomas soportados | No disponible en la model card de esta derivada; el modelo base Qwen3 declara soporte para 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), compatible con transformers y endpoints |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts: de los 235.000 millones de parámetros totales, solo unos 22.000 millones se activan por token, lo que reduce drásticamente el coste de inferencia frente a un modelo denso equivalente. La variante Thinking-2507 está orientada a razonamiento extendido, generando cadenas de pensamiento antes de la respuesta final.

El proceso de abliteración se realizó con la herramienta `llm-abliteration` (revisión `ca6e223`). Se midieron las direcciones de rechazo usando los datasets por defecto de prompts dañinos e inofensivos del proyecto, y se eliminó la dirección detectada en la capa 88 de las proyecciones de salida de atención y de las proyecciones down de los expertos en las capas 83 a 89, con escala 1,0 y sparsity 0,0. No hubo ajuste fino posterior, por lo que los pesos de preentrenamiento y alineación del modelo base permanecen intactos salvo esa intervención.

## Capacidades

- Generacion de texto y razonamiento extendido (thinking mode) heredadas del modelo base, con cadenas de razonamiento antes de la respuesta.
- Rendimiento esperado de primer nivel en razonamiento, matematicas y codigo, al tratarse de una derivada directa del Qwen3-235B-A22B-Thinking-2507.
- Ausencia intencionada de rechazos de seguridad: el modelo no se niega a peticiones que el original filtraria, lo cual es el objetivo explicito de la modificacion.
- Soporte de tool calling / function calling: heredado del modelo base segun su documentacion (no verificado en esta derivada).
- Capacidades multilingues: el modelo base declara soporte para 119 idiomas (no reevaluado tras la abliteracion).
- No dispone de capacidades nativas de vision o audio; es un modelo de solo texto.

## Casos de uso

- Investigacion en seguridad y alineacion: estudiar como la abliteration afecta al comportamiento del modelo, medir la degradacion de calidad y analizar la robustez de las tecnicas de rechazo en modelos MoE de gran escala.
- Evaluacion de tecnicas de desalineacion: comparar resultados de benchmarks (MMLU, HumanEval, GSM8K) entre el modelo base y esta derivada para cuantificar el coste de la intervencion en las capas 83-89.
- Investigacion en red teaming: generar casos de prueba adversariales para sistemas de moderacion y filtros de contenido, un escenario donde la ausencia de rechazos es precisamente el objeto de estudio.
- Chatbot experimental sin filtros para entornos controlados de investigacion, donde se necesita un modelo que no imponga politicas de rechazo y el investigador asume la responsabilidad del contenido.
- Base para estudios de interpretabilidad: las direcciones de rechazo medidas por capa (como la de la capa 88) son material util para analizar como se codifican los comportamientos de seguridad en modelos MoE.
- Generacion de codigo y razonamiento en entornos de investigacion sin moderacion, aprovechando la capacidad del modelo base, siempre que el operador disponga de la infraestructura necesaria para alojar 470 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card del autor indica explicitamente que la calidad del modelo, su capacidad de codigo y su comportamiento de rechazo no han sido evaluados todavia. Para datos de referencia del modelo original, consultar la model card de Qwen/Qwen3-235B-A22B-Thinking-2507.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 470 GB solo de pesos, por lo que se necesitan al menos 8 GPUs de 80 GB (por ejemplo, A100 u H100 de 80 GB) para alojarlo sin cuantizar.
- Con cuantizacion (por ejemplo, versiones GGUF de 2-4 bits publicadas por terceros, no disponibles en este repositorio) podria reducirse a un rango de 120-250 GB, apto para configuraciones multi-GPU de gama alta o Mac Studio con memoria unificada elevada; no verificado para esta derivada concreta.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090) en BF16; incluso cuantizado requiere multiples GPUs.
- Opciones de despliegue: transformers (libreria nativa del repo), vLLM, SGLang, TGI o llama.cpp/Ollama mediante conversiones GGUF de la comunidad. El autor remite a la model card del modelo base para las instrucciones de inferencia.
- Latencia y throughput: no disponibles; como referencia, el modelo base activa ~22.000 millones de parametros por token, lo que permite throughput razonable en hardware multi-GPU pese al tamaño total.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| woodsz/Qwen3-235B-A22B-Thinking-2507-ablated | 235.093 M | ~22.000 M | 262.144 tokens (base) | Apache 2.0 | Abliterada, sin rechazos, sin benchmarks |
| Qwen/Qwen3-235B-A22B-Thinking-2507 | 235.093 M | ~22.000 M | 262.144 tokens | Apache 2.0 | Modelo original con alineacion completa |
| Qwen/Qwen3-235B-A22B-Instruct-2507 | 235.093 M | ~22.000 M | 262.144 tokens | Apache 2.0 | Variante instruct sin thinking |

La eleccion entre ellos depende del objetivo: el original para produccion y uso general, la variante Instruct para respuestas directas sin cadena de razonamiento, y esta derivada unicamente para investigacion sobre seguridad y modificacion de modelos.

## Limitaciones y advertencias

- Comportamiento de seguridad alterado: el modelo no rechazara peticiones daninas, lo que implica riesgos eticos y legales graves si se despliega sin controles externos.
- Calidad no verificada: la abliteration puede degradar la capacidad de razonamiento, codigo o instruccion; el autor no ha publicado benchmarks que lo confirmen o desmienta.
- Riesgo de alucinacion: inherente a los LLM y potencialmente agravado por la falta de evaluacion post-modificacion; no hay datos disponibles.
- Sin ajuste fino ni cuantizacion oficial: solo BF16 de 470,2 GB, lo que limita el acceso a infraestructuras grandes.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el contenido generado recae integramente en el operador, especialmente al tratarse de un modelo sin salvaguardas.
- Proyecto comunitario de bajo recorrido: 225 descargas y 0 likes en el momento de la ficha, sin mantenimiento ni soporte garantizados.
- Datos de contexto, idiomas e instrucciones de inferencia no revalidados: remitirse a la model card del modelo base.

## Enlaces

- Modelo abliterado: https://huggingface.co/woodsz/Qwen3-235B-A22B-Thinking-2507-ablated
- Modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B-Thinking-2507
- Herramienta de abliteration utilizada: https://github.com/Sumandora/llm-abliteration (revision `ca6e223`)
