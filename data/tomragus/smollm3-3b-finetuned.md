# tomragus/smollm3-3b-finetuned

## Resumen

`tomragus/smollm3-3b-finetuned` es un ajuste fino (fine-tune) del modelo base `HuggingFaceTB/SmolLM3-3B-Base`, publicado por el usuario tomragus en HuggingFace. Se trata de un modelo de 3.000 millones de parámetros obtenido mediante SFT (supervised fine-tuning) con la librería TRL de HuggingFace, según declara la propia model card. El repositorio se creó el 11 de septiembre de 2026 y se actualizó al día siguiente, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de ajuste supervisado de un modelo pequeño de la familia SmolLM3, una categoría de modelos de 3B que se está consolidando para despliegue en hardware de consumo y en entornos con restricciones de VRAM. Al derivar de SmolLM3-3B-Base, hereda la arquitectura y la ventana de contexto del modelo base, cuyos detalles técnicos deben consultarse en la model card original de HuggingFaceTB, no en este repositorio.

El principal problema para evaluar este modelo es la ausencia casi total de documentación: la model card no especifica dataset de entrenamiento, número de tokens, hiperparámetros, licencia, idiomas soportados ni resultados de evaluación. Además, el tamaño del repositorio (0,1 GB) es muy inferior a lo esperable para los pesos completos de un modelo de 3B en bf16 (en torno a 6 GB), lo que sugiere que el artefacto publicado puede ser un adaptador, un checkpoint incompleto o una subida parcial. Cualquier uso en producción debería ir precedido de una verificación manual del contenido del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base SmolLM3-3B-Base; consular la model card del base) |
| Parametros totales | ~3.000 millones (deducido de la nomenclatura del modelo base; no confirmado en el repositorio) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio declara safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin valor real; el modelo base SmolLM3-3B-Base se publica habitualmente bajo Apache-2.0, pero esto no se confirma para este fine-tune) |
| Formato de pesos | safetensors (declarado en las etiquetas del repositorio); tamano del repo: 0,1 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de este fine-tune. Lo unico verificable es que se trata de un ajuste supervisado (SFT) sobre `HuggingFaceTB/SmolLM3-3B-Base` utilizando la libreria TRL, con las siguientes versiones de framework declaradas en la model card: TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. La model card no incluye la seccion de hiperparametros de entrenamiento (learning rate, epochs, batch size, scheduler, precision) ni ninguna descripcion del dataset utilizado, por lo que no es posible reproducir el entrenamiento ni auditar la composicion de los datos.

Tampoco se documentan innovaciones tecnicas propias ni etapas posteriores de alineamiento (RLHF, DPO, RLVR). Para conocer la arquitectura subyacente (tipo de atencion, uso de RoPE o NoPE, atencion con consultas agrupadas, tokenizador, composicion del corpus preentrenado) hay que acudir a la model card de `HuggingFaceTB/SmolLM3-3B-Base`, que es la fuente autorizada. Conviene senalar que el tag `base_model:finetune` sugiere un ajuste completo, pero el tamano del repositorio (0,1 GB) es incompatible con pesos completos de 3B en bf16, lo que apunta a un adaptador LoRA, a pesos en un formato distinto o a una subida incompleta.

## Capacidades

No se documentan capacidades especificas en la model card ni en la informacion disponible. La unica evidencia funcional es el ejemplo de uso incluido por el autor, que emplea `transformers.pipeline` en tarea de generacion de texto con un mensaje en formato conversacional:

- Generacion de texto conversacional: el ejemplo de la model card invoca el pipeline con una lista de mensajes (`{"role": "user", "content": ...}`) y `max_new_tokens=128`, lo que indica que el tokenizador y la plantilla de chat del modelo base aceptan turnos de usuario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Razonamiento, codigo y matematicas: no disponible, no hay evaluaciones ni declaraciones al respecto.

## Casos de uso

Dado que no hay benchmarks ni documentacion de capacidades, los siguientes casos son escenarios plausibles derivados del perfil del modelo (3B, ajustado por SFT, formato safetensors), no capacidades verificadas. Deben validarse con evaluaciones propias antes de cualquier uso real.

- Prototipado rapido de asistentes conversacionales: el modelo se carga con `transformers.pipeline` en pocas lineas y cabe en GPUs de gama media, lo que permite montar un prototipo de chat funcional en local para validar flujos de producto antes de invertir en modelos mayores.
- Experimentos academicos de fine-tuning: sirve como punto de partida reproducible para estudiar el efecto del SFT sobre un modelo base de 3B, comparando el comportamiento antes y despues del ajuste con un mismo conjunto de prompts.
- Clasificacion y extraccion de informacion en local: para tareas de etiquetado de texto, resumen corto o extraccion de campos estructurados en entornos sin conexion, un modelo de 3B cuantizado puede ejecutarse en portatiles con GPU discreta.
- Generacion de texto en edge o entornos air-gapped: al ser un modelo pequeno, puede desplegarse en estaciones de trabajo sin acceso a internet ni APIs externas, util en sectores con requisitos de confidencialidad.
- Base para ajustes posteriores: si el repositorio contiene efectivamente un adaptador, puede reutilizarse como punto de partida para tecnicas de alineamiento (DPO, ORPO) o para fusion de adaptadores sobre la misma familia de modelos.
- Evaluacion comparativa de tecnicas de SFT: permite medir cuanto aporta un ajuste supervisado concreto frente al modelo base en tareas cerradas, siempre que se disponga del conjunto de evaluacion y de la receta de entrenamiento (que aqui no se documenta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, GSM8K, HumanEval, IFEval ni ninguna otra metrica, y la busqueda web asociada no ha devuelto documentacion tecnica relacionada con el modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (~3B) y no proceden de mediciones publicadas para este fine-tune concreto:

- VRAM para pesos en bf16/fp16: aproximadamente 6-7 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 1-3 GB adicionales segun longitud de contexto y batch).
- VRAM para cuantizacion de 8 bits: aproximadamente 3,5-4 GB.
- VRAM para cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 2-2,5 GB.
- GPU de datacenter: cualquier A100, H100, L40S o A10G puede servirlo con holgura en bf16.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en bf16; en GPUs de 8 GB (RTX 3070, RTX 4060 Ti) es previsible que requiera cuantizacion de 8 o 4 bits.
- Opciones de despliegue: al publicarse en formato safetensors con libreria `transformers`, es compatible con vLLM, TGI y el propio `pipeline` de Transformers. Tambien es posible convertirlo a GGUF para llama.cpp u Ollama, aunque el repositorio no ofrece conversiones listas.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este modelo.

Advertencia importante: con un repositorio de 0,1 GB, es probable que la carga directa con `AutoModelForCausalLM.from_pretrained` falle o devuelva pesos incompletos. Verificar el contenido del repositorio antes de planificar el despliegue.

## Comparativa con modelos similares

No hay datos de rendimiento verificados para este modelo ni para sus alternativas en la informacion proporcionada. La siguiente tabla recoge unicamente lo que puede afirmarse con seguridad a partir de la nomenclatura y de las licencias publicas conocidas de cada familia; el rendimiento se marca como no disponible en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tomragus/smollm3-3b-finetuned | ~3B (deducido) | no disponible | no disponible | Repositorio con 0 descargas, 0,1 GB |
| HuggingFaceTB/SmolLM3-3B-Base | ~3B | no disponible en esta ficha (consultar su model card) | no disponible en esta ficha | Modelo base de referencia |
| Llama-3.2-3B-Instruct | ~3B | no verificado en esta ficha | Licencia comunitaria de Llama 3.2 | Alternativa de tamano equivalente |
| Qwen2.5-3B-Instruct | ~3B | no verificado en esta ficha | Apache-2.0 | Alternativa de tamano equivalente |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni comparaciones con el modelo base, por lo que no puede afirmarse que el ajuste mejore al modelo original en ninguna tarea.
- Licencia no declarada: la model card incluye `licence: license` sin valor. Sin una licencia explicita, el uso comercial es juridicamente incierto y no puede asumirse la licencia del modelo base.
- Trazabilidad del dataset inexistente: no se documenta que datos se usaron para el SFT, lo que impide evaluar sesgos, contaminacion de benchmarks o cumplimiento normativo.
- Repositorio de 0,1 GB: incompatible con pesos completos de 3B. Posible adaptador, subida parcial o error de publicacion. Verificar antes de usar.
- Riesgo de alucinacion: inherente a los modelos de 3B, especialmente en tareas de conocimiento factual y razonamiento aritmetico, y agravado por la falta de evaluacion.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano; habria que validarlo empiricamente.
- Longitud de contexto no confirmada: no se especifica en la informacion disponible, por lo que no debe planificarse un uso con contextos largos sin medirlo.
- Sin soporte comunitario: 0 descargas y 0 likes implican que el modelo no ha sido probado por terceros; no hay issues, forks ni reportes de comportamiento.
- Fecha de creacion inusual: los metadatos indican septiembre de 2026, lo que conviene contrastar con el estado real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomragus/smollm3-3b-finetuned
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Libreria TRL (usada para el entrenamiento): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios auxiliares ni demos asociados a este modelo en la busqueda web realizada.
