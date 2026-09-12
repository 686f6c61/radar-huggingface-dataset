# surfrpt/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF-llamafile

## Resumen

Este repositorio publica una conversión a formato GGUF y a ejecutable llamafile del modelo Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved, un derivado de 27 000 millones de parámetros obtenido mediante la técnica de "abliteración" Heretic v2.0.0.dev0 con una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA). El objetivo del autor es eliminar los mecanismos de rechazo y censura del modelo original manteniendo, de forma explícita, las 15 matrices asociadas a la predicción multi-token (MTP) del modelo base. El resultado es un modelo de generación de texto sin filtros de seguridad, empaquetado para ejecución local.

El artefacto que nos ocupa no es el modelo original, sino su distribución en GGUF y en un único binario autoextraíble llamafile (versión 0.10.5, basada en llama.cpp y Cosmopolitan Libc). El repositorio ocupa 107,2 GB e incluye las cuantizaciones Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0. La licencia declarada es Apache 2.0, heredada del modelo base, y el pipeline es text-generation. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria.

Es relevante ahora porque ilustra dos tendencias simultáneas: la circulación de derivados "decensored" de pesos abiertos mediante ablación de direcciones en el espacio de activaciones, y la consolidación de llamafile como formato de distribución de un solo archivo para inferencia local sin dependencias. No se dispone de información publicada sobre benchmarks, composición del dataset de entrenamiento ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8), con cabezas de predicción multi-token (MTP) preservadas; no se documenta la arquitectura interna completa |
| Parametros totales | 27 000 millones (27B, según la denominación del modelo) |
| Parametros activos | No aplica / no documentado (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y ejecutable llamafile autocontenido (llamafile 0.10.5, commit 486e6c5); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 107,2 GB |
| Cuantizaciones MTP | 15 tensores MTP preservados (mtp.fc, mtp.norm, mtp.layers.0.* y pre_fc_norm_embedding/hidden) |
| Plantilla de chat | `<|im_start|>role ... <|im_end|>` con bloque `<think>...</think>` para el modo de razonamiento |

## Arquitectura y entrenamiento

El modelo base sobre el que trabaja este repositorio es un transformer decoder de 27B parámetros de la familia Qwen3.8, del cual no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Lo que sí se detalla es el proceso de intervención posterior: se aplicó Heretic v2.0.0.dev0 junto con una variante de Magnitude-Preserving Orthogonal Ablation (MPOA), un método de ablación direccional que proyecta ortogonalmente las activaciones para eliminar direcciones asociadas al rechazo conservando la magnitud de los pesos. Los componentes objetivo declarados son `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`.

La particularidad técnica frente a otras abliteraciones es la preservación explícita de las 15 matrices MTP (`mtp.fc.weight`, `mtp.norm.weight`, `mtp.pre_fc_norm_embedding.weight`, `mtp.pre_fc_norm_hidden.weight` y las correspondientes a `mtp.layers.0`). Estas matrices permiten al modelo predecir varios tokens por paso, una técnica habitual para acelerar la decodificación. No obstante, la propia model card advierte de que la validación se realizó con decodificación estándar, por lo que no hay evidencia publicada de que el uso de MTP aporte aceleración efectiva en este artefacto. La validación reportada se limita a generación de texto en Linux; los ficheros de proyector de visión del modelo original quedan separados y este GGUF es exclusivamente de texto.

## Capacidades

- Generación de texto en modo conversacional, con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento explícito mediante bloques `<think>...</think>`, que puede dejarse vacío para desactivar el razonamiento (así aparece en el ejemplo oficial de uso).
- Predicción multi-token: los tensores MTP están presentes, aunque la validación documentada emplea decodificación estándar.
- Ejecución local sin dependencias: el binario llamafile incluye modelo, tokenizador y runtime en un único fichero ejecutable.
- Servidor y CLI integrados: el llamafile puede ejecutarse en modo `--cli` con `--no-display-prompt --no-conversation` para integración en scripts.
- Comportamiento sin filtros de rechazo: el proceso de ablación elimina deliberadamente las direcciones de activación asociadas al rechazo.
- No se documentan capacidades de tool calling, function calling, uso de agentes, multimodalidad (el GGUF es solo texto) ni cobertura multilingüe verificada.

## Casos de uso

- Investigación sobre ablación de seguridad: el modelo sirve como objeto de estudio para medir qué capacidades se degradan al aplicar MPOA sobre `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, comparando contra el modelo base sin ablacionar.
- Evaluación comparativa de cuantizaciones: con cinco niveles GGUF disponibles (Q3_K_M a Q8_0) es posible medir la degradación de perplejidad y coherencia en un mismo modelo de 27B, útil para calibrar tablas de compromiso calidad/memoria.
- Red teaming y auditoría de seguridad: al carecer de filtros, permite estudiar la tasa de cumplimiento ante peticiones problemáticas y alimentar clasificadores de contenido o *guardrails* propios antes de desplegar sistemas corporativos.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o material narrativo con violencia o temáticas adultas donde los modelos alineados suelen negarse; el bloque `<think>` permite separar el razonamiento del texto final.
- Despliegue local en estación de trabajo sin conexión: el formato llamafile permite ejecutar el modelo en un equipo aislado con `chmod +x` y ejecución directa, sin instalar Python, CUDA toolkit ni gestores de paquetes.
- Prototipado rápido en pipelines de scripting: la interfaz CLI (`-p`, `-n`, `--temp`, `-c`, `-ngl`) permite invocar el modelo desde shell para tareas por lotes, como resumir ficheros o generar documentación interna.
- Base para destilación o ajuste fino posterior: al distribuirse en GGUF y con los tensores MTP intactos, puede servir como punto de partida para estudios de decodificación especulativa sobre pesos ya modificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente indica que la validación consistió en generación de texto bajo Linux, con el detalle de la invocación CLI, y que la decodificación empleada fue estándar. No hay cifras de MMLU, HumanEval, GSM8K ni de perplejidad, ni para el modelo ablacionado ni para su base.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado a partir de los 27B parámetros; el autor no publica cifras): Q3_K_M en torno a 12-13 GB, Q4_K_M en torno a 16-17 GB, Q5_K_M en torno a 19-20 GB, Q6_K en torno a 22 GB y Q8_0 en torno a 29 GB. Son estimaciones, no datos publicados.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 permiten cargar Q8_0 completo con contexto amplio.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB puede alojar Q4_K_M y Q5_K_M completos; Q6_K queda muy ajustado y Q8_0 requiere descarga parcial a CPU. Tarjetas de 12-16 GB (RTX 4070 Ti, 4080) obligan a offloading parcial de capas con `-ngl`.
- CPU y RAM: el binario llamafile permite ejecución íntegra en CPU, con requisito de RAM aproximadamente igual al tamaño del fichero GGUF más el margen del contexto; `-ngl 999` en el ejemplo oficial intenta descargar todas las capas en GPU.
- Backends soportados por llamafile 0.10.5: CPU, CUDA y Vulkan (el commit de referencia documenta explícitamente el backend Vulkan).
- Opciones de despliegue: llamafile (un solo fichero), llama.cpp (CLI y `llama-server`), Ollama y LM Studio mediante importación de GGUF, koboldcpp y otros frontales compatibles con GGUF. El soporte de GGUF en vLLM es parcial y limitado, y TGI no consume GGUF de forma nativa.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, ni con MTP activo ni con decodificación estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| surfrpt/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF-llamafile | 27B | No disponible | GGUF + llamafile, 5 cuantizaciones | Apache 2.0 | No disponible |
| llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved (modelo base) | 27B | No disponible | Safetensors (no confirmado en la información) | Apache 2.0 | No disponible |
| llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF (origen de las cuantizaciones) | 27B | No disponible | GGUF | Apache 2.0 | No disponible |
| Qwen/Qwen3.8-27B (modelo original, presuntamente alineado) | 27B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de rendimiento ni de comparativas con modelos de la misma categoría (abliteraciones de 27B-32B en GGUF). La tabla se limita a la genealogía de derivados documentada en la model card.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el proceso de ablación elimina las direcciones de rechazo, de modo que el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito sin salvaguardas. No es apto para aplicaciones de cara al público sin un sistema externo de moderación.
- Degradación potencial de capacidades: la ablación de `attn.o_proj`, `attn.out_proj` y `mlp.down_proj` puede reducir la coherencia, el razonamiento o el seguimiento de instrucciones. No se publican evaluaciones que cuantifiquen ese deterioro.
- MTP sin validar: aunque los 15 tensores están presentes, la validación documentada usa decodificación estándar, por lo que no hay evidencia de que la predicción multi-token funcione correctamente ni de que acelere la inferencia.
- Idiomas no documentados: no se especifica la cobertura lingüística; debe asumirse un comportamiento multilingüe no verificado y potencialmente inferior al del modelo original.
- Longitud de contexto no documentada: no se indica la ventana máxima, y el ejemplo oficial emplea `-c 512`, insuficiente para tareas de contexto largo.
- Solo texto: el GGUF no incluye el proyector de visión; cualquier capacidad multimodal del modelo base queda fuera de este artefacto.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y no mitigado por ningún mecanismo declarado; la ausencia de alineación puede aumentar la confianza con la que se emiten afirmaciones falsas.
- Trazabilidad: el enlace de descarga incluido en la model card apunta al espacio `Bojun-Feng/...` y no al repositorio `surfrpt/...` que se está describiendo, lo que introduce ambigüedad sobre la cadena de custodia del binario. Conviene verificar el hash antes de ejecutar cualquier llamafile.
- Licencia: se declara Apache 2.0, lo que en principio permite uso comercial, pero la licencia del modelo original de Qwen no se detalla en la información disponible y el autor del derivado no es el titular de los pesos originales; conviene revisar la licencia del modelo base antes de explotarlo en producción.
- Madurez: 0 descargas y 0 "likes", sin issues ni validación de terceros. No hay garantía de mantenimiento ni de corrección de errores.
- Riesgo operativo de los llamafiles: ejecutar un binario autoextraíble descargado de un repositorio con poca reputación implica confiar código nativo; se recomienda aislarlo en contenedor o máquina virtual.
- Origen de los datos: buena parte de la model card es texto reutilizado de la plantilla de llamafile de jartine, por lo que algunas afirmaciones no son específicas de este modelo.

## Enlaces

- Repositorio descrito: https://huggingface.co/surfrpt/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF-llamafile
- Modelo base (abliterado): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- GGUF de origen de las cuantizaciones: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF/tree/7513ce6af77ca26e0bcabdaf37e3afefd118d74b
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org/
- Artículo sobre ablación con preservación de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repositorio de llamafile (mozilla-ai): https://github.com/mozilla-ai/llamafile/commit/486e6c5f9356eae50b851b07517bfae1f2420193
- Enlace de descarga del llamafile citado en la model card: https://huggingface.co/Bojun-Feng/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF-llamafile/resolve/main/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-Q4_K_M.llamafile
- Servidor de Discord de soporte de jartine: https://discord.gg/FwAVVu7eJ4
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
