# TensorVizion/MiMo-V2.6-Distill-Qwen-Abliterated

## Resumen

TensorVizion/MiMo-V2.6-Distill-Qwen-Abliterated es un ajuste fino del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario TensorVizion en HuggingFace. Se trata de un modelo de aproximadamente 8.953.803.264 parametros (unos 8,95 mil millones), distribuido en formato safetensors y con licencia MIT, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia. Su pipeline declarado es image-text-to-text, y las etiquetas del repositorio apuntan a un backbone de la familia Qwen (etiqueta qwen3_5) con capacidades orientadas a agentes, uso de herramientas y generacion de codigo.

El interes del modelo reside en su doble naturaleza: por un lado hereda el proceso de destilacion desde MiMo-V2.6, un modelo de Xiaomi orientado al razonamiento agentico, y por otro lado incorpora una modificacion de tipo "abliterated" en el nombre, termino habitual para designar la supresion de las direcciones de rechazo en el espacio de activaciones del modelo. Esta combinacion busca un modelo compacto, desplegable en hardware modesto, con menos restricciones de rechazo en las respuestas.

Conviene senalar que el repositorio presenta senales de ser un experimento reciente y poco validado: cero descargas y cero "likes" en el momento de la consulta, fecha de creacion del 25 de septiembre de 2026 y una model card que en realidad documenta otro repositorio (una conversion a formato MLX de 2 bits). No hay informacion publica sobre el dataset de ajuste, el contexto soportado ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 en el repositorio); detalles concretos no disponibles |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones, dato real de safetensors) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE; no disponible en caso contrario |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Etiqueta 2-bit en el repositorio; existe una conversion MLX de 2 bits del modelo base documentada en la model card. Otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); conversion MLX disponible en un repositorio separado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La etiqueta qwen3_5 del repositorio y el nombre del modelo base (MiMo-V2.6-Distill-Qwen-9B) sugieren un transformer denso de la familia Qwen con aproximadamente 9.000 millones de parametros, destilado a partir de MiMo-V2.6. El recuento real de parametros en safetensors (8.953.803.264) es coherente con esa clase de tamano. No se especifican numero de capas, dimension del hidden state, numero de cabezas de atencion, tipo de atencion (completa, sliding window o hibrida) ni vocabulario.

Respecto al entrenamiento, las etiquetas del repositorio indican distillation y supervised-fine-tuning, pero no se publica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El sufijo "Abliterated" del nombre apunta a una modificacion post-entrenamiento orientada a eliminar las direcciones de activacion asociadas al rechazo de peticiones, una tecnica habitual en la comunidad de modelos abiertos, pero el autor no documenta el metodo exacto ni su alcance. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational del repositorio.
- Procesamiento de imagen y texto de forma conjunta: el pipeline declarado es image-text-to-text, lo que implica entrada multimodal con imagenes. No se detalla la resolucion soportada ni el codificador visual.
- Generacion de codigo, segun la etiqueta code.
- Uso de herramientas y function calling, segun la etiqueta tool-use.
- Comportamiento orientado a agentes y razonamiento en varios pasos, segun la etiqueta agentic.
- Destilacion desde MiMo-V2.6, lo que sugiere herencia de patrones de razonamiento del modelo profesor, aunque no se cuantifica la fidelidad de la destilacion.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Modo de pensamiento explicito: no disponible.
- La modificacion "abliterated" busca reducir las negativas del modelo a ciertas peticiones, pero no se documenta el grado de supresion ni las consecuencias sobre la calidad general.

## Casos de uso

- Asistente de atencion al cliente con entrada multimodal: el pipeline image-text-to-text permite que el usuario adjunte capturas de pantalla o fotos de productos y el modelo responda en el mismo hilo conversacional. Requiere validar antes la longitud de contexto real, que no esta documentada.
- Extraccion estructurada de informacion desde documentos escaneados: combinando vision y generacion de texto se pueden transcribir facturas o formularios a JSON, aprovechando la etiqueta code para producir salidas con formato estricto.
- Agente de automatizacion con tool calling: la etiqueta tool-use permite conectarlo a APIs externas (calendario, CRM, buscador) dentro de un bucle de razonamiento multi-paso.
- Asistencia a la programacion en local: con 8,95 mil millones de parametros y cuantizacion agresiva, puede ejecutarse en un portatil con GPU de gama media para autocompletado, revision de parches y generacion de tests, sin enviar codigo a servicios externos.
- Despliegue en Apple Silicon mediante MLX: la model card documenta el uso con mlx-lm, lo que habilita prototipos en Mac con memoria unificada y sin GPU dedicada.
- Filtrado y clasificacion de grandes volumenes de texto: al ser un modelo pequeno y con licencia MIT, permite procesar lotes en paralelo con coste bajo por token, por ejemplo para moderacion, etiquetado tematico o enrutado de tickets.
- Investigacion sobre abliteration: el modelo sirve como sujeto de estudio para medir como la supresion de direcciones de rechazo afecta a la utilidad, la coherencia y la seguridad en modelos destilados de 9B.
- Base para ajustes finos verticales: la licencia MIT y el tamano contenido lo hacen apto como punto de partida para LoRA o ajustes completos en dominios como legal, sanitario o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se ofrecen comparaciones con el modelo base o con alternativas de la misma categoria. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 8,95 mil millones de parametros: en bf16/fp16 en torno a 17,9 GB; en cuantizacion de 8 bits en torno a 9 GB; en 4 bits en torno a 5 GB; la variante de 2 bits publicada ocupa aproximadamente 2,8 GB de repositorio, en linea con ese nivel de compresion.
- Sumando cache KV y overhead del runtime, un presupuesto realista seria de unos 4 a 6 GB en 2 bits, 7 a 9 GB en 4 bits, 11 a 13 GB en 8 bits y 20 GB o mas en precision completa, con contexto largo.
- GPU recomendadas: para 2 bits o 4 bits basta una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o RTX 4090; para 8 bits se recomienda una RTX 4090 de 24 GB o una A100 de 40 GB; para precision completa, A100 80 GB o H100.
- Cabe en GPU de consumo: si, en las configuraciones de 2 y 4 bits, e incluso en 8 bits con GPUs de 12 a 16 GB si se limita la ventana de contexto.
- Opciones de despliegue: transformers (formato nativo safetensors), mlx-lm en Apple Silicon (documentado en la model card), TGI o vLLM siempre que el runtime soporte el esquema de cuantizacion empleado, que no se especifica. No se incluyen pesos GGUF en el repositorio, por lo que llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| TensorVizion/MiMo-V2.6-Distill-Qwen-Abliterated | 8,95B | No disponible | MIT | HuggingFace, safetensors y variante 2-bit | No disponible |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (modelo base) | No disponible con precision en la informacion proporcionada (denominacion 9B) | No disponible | No disponible | HuggingFace | No disponible |
| Qwen3-8B (referencia de categoria) | Aprox. 8,2B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | No disponible |
| Llama-3.1-8B (referencia de categoria) | Aprox. 8,03B | No disponible en la informacion proporcionada | Llama 3.1 Community License | HuggingFace | No disponible |

Las dos ultimas filas se incluyen unicamente como referencias de categoria (modelos densos de 8 a 9 mil millones de parametros) a partir de conocimiento general de la familia, no de la informacion recopilada en esta busqueda. No hay datos que permitan comparar calidad, contexto ni velocidad entre ellos y el modelo descrito.

## Limitaciones y advertencias

- Ausencia total de validacion publica: cero descargas, cero "likes" y ningun benchmark publicado. No hay evidencia independiente de que el ajuste haya preservado las capacidades del modelo base.
- La model card del repositorio no describe este modelo, sino una conversion a MLX de 2 bits del modelo base, con ejemplos de codigo para mlx-lm. Esto indica un proceso de publicacion descuidado y aumenta el riesgo de metadatos incorrectos.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no cuantificado; en modelos destilados de este tamano es habitual que aumente en tareas de razonamiento largo y en dominios especializados.
- La modificacion "abliterated" reduce o elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado. Para produccion se recomienda anadir capas de moderacion externas.
- El modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B podria estar sujeto a condiciones adicionales; la licencia declarada en este repositorio es MIT, pero conviene verificar la trazabilidad completa antes de un uso comercial.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto en conversaciones largas ni en castellano.
- Formato de cuantizacion de 2 bits no especificado: la compatibilidad con vLLM o TGI no esta garantizada y podria requerir transformers o MLX.
- No se proporcionan pesos GGUF, lo que complica el despliegue en CPU o en entornos basados en llama.cpp y Ollama.
- Las capacidades multimodales se infieren del pipeline image-text-to-text, sin documentacion sobre resolucion de imagen, numero de tokens visuales ni evaluaciones de vision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TensorVizion/MiMo-V2.6-Distill-Qwen-Abliterated
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Conversion MLX de 2 bits del modelo base, referenciada en la model card: https://huggingface.co/TensorVizion/MiMo-V2.6-Distill-Qwen-9B-mlx-2Bit
- Repositorio de mlx-lm, usado para la conversion a MLX: https://github.com/ml-explore/mlx-lm
- Paper o blog del modelo MiMo-V2.6: no disponible
- Demo o espacio de inferencia: no disponible
