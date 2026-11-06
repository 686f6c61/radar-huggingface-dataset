# sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated es una cuantizacion de 3 bits en formato EXL3 del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario sousekd. No se trata de un modelo entrenado desde cero, sino de una combinacion de dos artefactos previos: el checkpoint EXL3 de 3 bits por peso de Diffbot, optimizado para dos tarjetas RTX PRO 6000, y el checkpoint "abliterated" de jcartu, del que se sustituyen 132 tensores FP8 de pesos y escalas correspondientes a `attn.wo_b` y `ffn.shared_experts.w2` en las capas 4 a 36. El resto de tensores conserva los bytes originales de Diffbot, sin reentrenamiento ni recuantizacion adicional.

El modelo cuenta con 218.691.507.682 parametros totales (aproximadamente 218,7 mil millones) y un repositorio de 345,6 GB en formato safetensors. La etiqueta `deepseek_v41` sugiere una arquitectura de la familia DeepSeek V4.1, si bien la model card no detalla la composicion interna (atencion, mezcla de expertos, etc.). El contexto configurado durante las pruebas del autor fue de 512K tokens, aunque no se especifica si ese limite es nativo o una configuracion de despliegue.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo de gran tamano en hardware profesional de gama alta mediante cuantizacion EXL3 de 3 bits; por otro, incorpora la modificacion "abliterated", que altera el comportamiento de rechazo del modelo. Se distribuye bajo la licencia lil-license-1.0 con acceso restringido (gated) y esta declarado explicitamente como material de investigacion y evaluacion, no para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_v41 (familia DeepSeek V4.1; detalles internos no disponibles) |
| Parametros totales | 218.691.507.682 (~218,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 512K tokens configurados en las pruebas del autor (nativo no confirmado) |
| Tipos de cuantizacion | EXL3 de 3 bits por peso (3bpw); tensores FP8 en capas seleccionadas |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (Local Inference Lab License 1.0), acceso restringido |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta `deepseek_v41`. Por el nombre y la presencia de tensores `ffn.shared_experts.w2`, se infiere una estructura con expertos compartidos, compatible con un transformer de mezcla de expertos (MoE), pero no se confirma el numero de expertos, la proporcion de parametros activos ni el mecanismo de atencion. Tampoco se detallan los datos de entrenamiento originales, el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF o DPO.

El proceso de creacion de este checkpoint es puramente de ensamblaje: se parte del EXL3 de 3 bits de Diffbot y se reemplazan byte a byte 132 tensores FP8 (pesos y escalas) de `attn.wo_b` y `ffn.shared_experts.w2` en las capas 4 a 36 con los del checkpoint abliterated de jcartu. No hay entrenamiento, ajuste fino ni recuantizacion adicional. La innovacion tecnica principal es la cuantizacion EXL3 a 3 bits, que reduce el peso a 345,6 GB y permite su ejecucion en dos GPU RTX PRO 6000 Blackwell con tensor parallelism 2 (TP2). El autor verifico inferencia basica, razonamiento y llamadas a herramientas en esa configuracion; no se evaluo la ejecucion asistida por CPU ni la calidad en contextos largos.

## Capacidades

- Generacion de texto y razonamiento: verificado por el autor en pruebas basicas sobre 2x RTX PRO 6000.
- Llamadas a herramientas (tool calling / function calling): comprobado en la configuracion de referencia.
- Razonamiento multi-paso y uso como agente: no se detalla mas alla de la verificacion basica de razonamiento.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible.
- Comportamiento de rechazo modificado (abliterated): el modelo responde a peticiones que el original rechazaria, lo que constituye una capacidad diferencial pero tambien un riesgo.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como la sustitucion de tensores concretos (`attn.wo_b` y `ffn.shared_experts.w2`) afecta al comportamiento de negativa, comparando directamente con el checkpoint original de Diffbot.
- Evaluacion de cuantizacion EXL3 a 3 bits: sirve para medir la perdida de calidad frente al modelo en FP8 o BF16 en tareas de razonamiento y generacion, con un peso de 345,6 GB manejable en dos GPU profesionales.
- Despliegue en hardware de gama alta con vLLM: el autor indica soporte para vLLM y arquitectura sm120, lo que permite montar un servidor de inferencia con TP2 en 2x RTX PRO 6000 Blackwell y un limite de contexto de 512K tokens.
- Pruebas de agentes con contexto largo: la ventana configurada de 512K tokens permite experimentar con pipelines de agentes que acumulan historial extenso, aunque el autor advierte que no se evaluo la calidad en contextos largos.
- Generacion de codigo y tool calling en entornos controlados: al haberse verificado las llamadas a herramientas, puede integrarse en prototipos de asistentes de codigo o automatizacion, siempre en fase de evaluacion.
- Analisis de sesgos y contenido inseguro: al estar abliterated, es util para estudiar que tipos de contenido emergen y como se distribuyen, con fines de auditoria y red teaming.
- Comparacion de checkpoints derivados: permite reproducir el efecto de mezclar tensores de dos linajes (Diffbot y jcartu) sobre el mismo modelo base, un caso de estudio de ingenieria de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 345,6 GB en safetensors de 3 bits; se necesita al menos esa cantidad repartida entre las GPU, mas overhead de activaciones y cache KV para el contexto configurado.
- GPU recomendadas: 2x RTX PRO 6000 Blackwell con TP2, configuracion verificada por el autor; tambien cabe en 4x A100 80 GB o 2x H100 80 GB si se ajusta el contexto, aunque no esta confirmado.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 de 24 GB, RTX 5090 de 32 GB) por el tamano del checkpoint.
- Opciones de despliegue: vLLM (soporte indicado en los tags y en las instrucciones de Diffbot), con tensor parallelism. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated | ~218,7 B | 512K configurado | EXL3 3 bits | lil-license-1.0 (gated) | Hugging Face |
| diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000 | no disponible | no disponible | EXL3 3 bits | no disponible | Hugging Face |
| jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF | no disponible | no disponible | FP8 (lossless CSF) | no disponible | Hugging Face |
| local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF | no disponible | no disponible | lossless CSF | Local Inference Lab License 1.0 | Hugging Face |

Los tres modelos comparables son los linajes directos de este checkpoint; no se dispone de datos de arquitectura, contexto o rendimiento de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: el comportamiento de rechazo ha sido modificado; las salidas pueden ser inseguras, sesgadas o incorrectas. El autor declara que los usuarios asumen toda la responsabilidad.
- Solo para investigacion y evaluacion: la model card lo restringe explicitamente a esos fines; no esta pensado para produccion.
- Acceso restringido (gated): requiere solicitud y aceptacion de condiciones en Hugging Face.
- Licencia lil-license-1.0: es una licencia "other" con nombre propio; deben revisarse los terminos del archivo LICENSE antes de cualquier uso, especialmente comercial.
- Sin evaluacion de contexto largo: el autor no comprobo la calidad con ventanas de 512K; el rendimiento en contextos extensos es desconocido.
- Sin evaluacion en CPU: la ejecucion asistida por CPU no fue probada.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para este checkpoint.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha caracterizado en esta variante.
- Naturaleza de ensamblaje: al combinar tensores de dos fuentes sin reentrenamiento, pueden aparecer inconsistencias no documentadas fuera de las pruebas basicas realizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sousekd/DeepSeek-V4.1-Flash-1017-EXL3-3bpw-abliterated
- Modelo base EXL3 de Diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000
- Checkpoint abliterated de jcartu: https://huggingface.co/jcartu/DeepSeek-V4.1-Flash-1017-abliterated-lossless-CSF
- Modelo original de Local Inference Lab: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF
- Instrucciones de ejecucion de Diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-3bpw-2x-RTX-PRO-6000#quick-start
