# TheShellMaster/Cypher-Base-Qwen3-VL-8B-Abliterated-v1-GGUF

## Resumen

Cypher-Base-Qwen3-VL-8B-Abliterated-v1-GGUF es un espejo de distribucion no modificado del archivo `Qwen3-VL-8B-Instruct-abliterated-v1.Q5_K_M.gguf` publicado por mradermacher. No se trata de un modelo entrenado por TheShellMaster, sino de una copia bit a bit del peso cuantizado en Q5_K_M (5,85 GB) del modelo abliterado de prithivMLmods, que a su vez deriva del Qwen3-VL-8B-Instruct original de Alibaba Qwen. El repositorio existe para garantizar la reproducibilidad de la cadena de produccion de Cypher-3-Vision-8B, el modelo derivado del autor, aunque el repositorio de origen deje de estar accesible.

El modelo subyacente es un transformer multimodal de 8.000 millones de parametros con arquitectura `qwen3vl` de 36 bloques y dimension oculta de 4096, con una ventana de contexto nativa de 262.144 tokens. La variante "abliterated" elimina las direcciones de rechazo del modelo Instruct original, de modo que el modelo responde sin las negativas aprendidas por alineamiento, lo que lo hace relevante para investigacion sobre seguridad, red teaming y para pipelines que necesitan baja tasa de rechazo.

Su relevancia practica es doble: por un lado sirve como base documentada y publica para quien quiera reproducir o auditar el linaje Cypher-3-Vision-8B; por otro, al estar en formato GGUF Q5_K_M, es desplegable en hardware de consumo mediante llama.cpp u Ollama sin necesidad de infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3vl (transformer multimodal, 36 bloques, dim 4096) |
| Parametros totales | 8B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | Q5_K_M (unico archivo en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 5,85 GB |
| Modelo base | mradermacher/Qwen3-VL-8B-Instruct-abliterated-v1-GGUF |
| Modelo raiz | Qwen/Qwen3-VL-8B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-VL-8B-Instruct original: un transformer multimodal de 36 bloques con dimension oculta de 4096 y capacidad de procesar imagen y texto. El modelo raiz fue entrenado por Alibaba Qwen; sobre esa base, prithivMLmods aplico abliteration en fp16 (eliminacion de direcciones de activacion asociadas al rechazo), y mradermacher realizo la cuantizacion a GGUF. Este repositorio no aplica re-cuantizacion ni fine-tuning adicional: los pesos son identicos a la fuente.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo raiz. La innovacion tecnica destacable de esta ficha es la abliteration, que modifica el comportamiento de rechazo sin reentrenar, y la disponibilidad en GGUF Q5_K_M, que permite ejecucion en CPU y GPU de consumo mediante llama.cpp.

## Capacidades

- Generacion de texto y razonamiento general, heredados del Qwen3-VL-8B-Instruct.
- Procesamiento de vision: el modelo raiz es multimodal (VL), por lo que acepta entradas de imagen junto con texto.
- Capacidad de codigo y matematicas: no documentada explicitamente en la informacion disponible, pero esperable en la familia Qwen3.
- Comportamiento "uncensored": la abliteration reduce la tasa de rechazos del modelo Instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan listados en la model card).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Reproducibilidad de la cadena Cypher: el repositorio sirve como base publica y verificable para reconstruir Cypher-3-Vision-8B, de modo que un equipo puede auditar el linaje completo desde Qwen3-VL-8B-Instruct hasta el modelo derivado.
- Investigacion sobre alineamiento y seguridad: al ser una variante abliterated, permite estudiar como cambia la tasa de rechazo y el comportamiento ante prompts sensibles respecto al Instruct original, en entornos controlados de red teaming.
- Despliegue local en hardware de consumo: el archivo Q5_K_M de 5,85 GB cabe en GPUs consumer con 8 GB o mas de VRAM y en CPU con RAM suficiente, usando llama.cpp u Ollama para prototipos y demos.
- Procesamiento de documentos con imagen: gracias a la componente vision del modelo raiz, puede usarse para extraer y razonar sobre contenido de capturas, formularios o diagramas en pipelines offline.
- Generacion de texto con contexto largo: los 262.144 tokens nativos permiten resumir o consultar corpus extensos en una sola pasada, aunque en la practica el coste de atencion crece con la longitud.
- Base para fine-tuning posterior: al estar bajo Apache-2.0 y en formato GGUF, sirve como punto de partida para adaptaciones con LoRA o para generar otras cuantizaciones.
- Experimentacion con baja tasa de rechazo: util en tareas creativas o de investigacion donde el modelo Instruct original rechaza en exceso, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con Q5_K_M (5,85 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en datacenter, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (via Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Cypher-Base Qwen3-VL-8B Abliterated Q5_K_M) | 8B | 262.144 | GGUF | Apache-2.0 | Espejo de mradermacher; abliterated |
| Qwen/Qwen3-VL-8B-Instruct | 8B | 262.144 | safetensors | Apache-2.0 | Modelo raiz, con alineamiento estandar |
| prithivMLmods/Qwen3-VL-8B-Instruct-abliterated-v1 | 8B | 262.144 | safetensors (fp16) | Apache-2.0 | Abliteration en fp16, sin cuantizar |
| mradermacher/Qwen3-VL-8B-Instruct-abliterated-v1-GGUF | 8B | 262.144 | GGUF (varias cuantizaciones) | Apache-2.0 | Fuente directa de este espejo |

## Limitaciones y advertencias

- La abliteration elimina las direcciones de rechazo, lo que puede producir contenido inapropiado, peligroso o legalmente problematico; no es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 8B; no se han publicado evaluaciones especificas de este checkpoint.
- La model card no documenta los idiomas soportados ni el rendimiento multilingue; no asumir cobertura amplia sin validacion.
- El contexto nativo de 262.144 tokens es teorico: el rendimiento real y el coste de memoria degradan con longitudes muy altas.
- Licencia Apache-2.0 permite uso comercial, pero el autor del espejo no ofrece garantias; el credito corresponde a Qwen, prithivMLmods y mradermacher.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.
- Solo se distribuye Q5_K_M; no hay otras cuantizaciones en este repositorio (usar el de mradermacher para alternativas).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/Cypher-Base-Qwen3-VL-8B-Abliterated-v1-GGUF
- Modelo derivado: https://huggingface.co/TheShellMaster/Cypher-3-Vision-8B
- Fuente GGUF: https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-abliterated-v1-GGUF
- Abliteration fp16: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-abliterated-v1
- Modelo raiz: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
