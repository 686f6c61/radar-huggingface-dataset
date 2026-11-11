# TheShellMaster/cypher-Huihui-Qwen3-VL-8B-Instruct-abliterated

## Resumen

cypher-Huihui-Qwen3-VL-8B-Instruct-abliterated es un espejo publico, sin modificaciones, del archivo GGUF `Huihui-Qwen3-VL-8B-Instruct-abliterated.Q5_K_M.gguf` publicado originalmente por mradermacher. No se ha recuantizado, reentrenado ni alterado la plantilla de chat: los pesos son identicos bit a bit a la fuente (SHA-256 `26cbfa91bd79403a23caabbeea8cf19217dd9ac4ba9c487ac2a2fd3bd1b50f2c`, 5.851.114.496 bytes). Su proposito es puramente de distribucion redundante.

El modelo subyacente es Qwen3-VL-8B-Instruct, un modelo vision-lenguaje de 8,77 mil millones de parametros con arquitectura `qwen3vl` y una ventana de contexto nativa de 262.144 tokens. Sobre esa base, huihui-ai aplico una tecnica de "abliteration" en fp16 orientada a eliminar el comportamiento de rechazo (uncensoring), y mradermacher genero la cuantizacion GGUF en Q5_K_M.

Es relevante para desarrolladores que necesitan un modelo multimodal de ~8B ejecutable en hardware modesto (el autor cita una T4 de 15 GB como objetivo) con contexto muy largo y sin las restricciones de rechazo del modelo instruct original. La licencia Apache 2.0 se conserva tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3vl` (transformer vision-lenguaje) |
| Parametros totales | 8,77 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF Q5_K_M (~5,3-5,7 bits/peso; referencia del autor ~5,4) |
| Idiomas soportados | fr, en (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es `qwen3vl`, la familia vision-lenguaje de Qwen, con 8,77 B de parametros y soporte de entrada image-text-to-text. El contexto nativo declarado es de 262.144 tokens. El repositorio no aporta detalles sobre composicion del dataset de entrenamiento, numero de tokens, ni si hubo RLHF/DPO en el modelo raiz; esa informacion no esta disponible en la documentacion proporcionada.

La cadena de transformaciones es la siguiente: el modelo raiz Qwen/Qwen3-VL-8B-Instruct fue sometido a abliteration en fp16 por huihui-ai (eliminacion de direcciones de rechazo en el espacio de activaciones), y posteriormente mradermacher lo cuantizo a GGUF. La cuantizacion Q5_K_M es una K-quant mixta por bloques de 256 pesos, con capas de atencion a mayor precision que las capas FFN e incluyendo las escalas. El autor situa Q5_K_M en ~5,4 bits/peso, frente a Q4_K_M (~4,8), Q6_K (~6,6) y Q8_0 (~8,5). No se ha aplicado ninguna modificacion adicional en este espejo.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline image-text-to-text).
- Razonamiento multimodal: descripcion de imagenes, respuesta a preguntas visuales y extraccion de informacion de capturas o documentos.
- Contexto largo de hasta 262.144 tokens nativos, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante abliterated.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Multilingue limitado a fr y en segun los metadatos del repositorio.
- Comportamiento "uncensored": la abliteration reduce los rechazos del modelo instruct original.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir una imagen de pagina y extraer texto o estructura gracias a su pipeline image-text-to-text y a la ventana de 262.144 tokens para concatenar varias paginas.
- Asistencia en vision por computador para prototipado: descripcion automatica de imagenes y generacion de etiquetas en pipelines de investigacion, ejecutable en una T4 de 15 GB con Q5_K_M.
- Procesamiento de conversaciones largas: la ventana de contexto permite mantener historiales extensos sin truncamiento agresivo, util en asistentes de documentacion tecnica.
- Investigacion sobre alineacion y censura: el modelo abliterated sirve como referencia para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento en tareas sensibles.
- Despliegue local en entornos con recursos limitados: el archivo GGUF de 5,85 GB cabe en GPUs consumer y se ejecuta con llama.cpp u Ollama, sin necesidad de infraestructura en la nube.
- Traduccion y generacion bilingue frances-ingles: el modelo declara soporte para ambos idiomas, adecuado para tareas de traduccion o redaccion en esos pares.
- Evaluacion comparativa de cuantizaciones: al ser un espejo bit a bit de la fuente, permite reproducir resultados de Q5_K_M sin riesgo de divergencia por recuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 5,85 GB en disco; en inferencia con llama.cpp se necesita espacio adicional para el contexto KV, por lo que se recomienda al menos 8-10 GB de VRAM para contextos moderados.
- GPU objetivo declarada por el autor: NVIDIA T4 de 15 GB.
- Cabe en GPUs consumer: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070) para contextos reducidos; con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) se puede ampliar el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -ngl 99`) y Ollama mediante `Modelfile` con `num_ctx 8192` y `temperature 0.7`. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cypher-Huihui-Qwen3-VL-8B-Instruct-abliterated (este) | 8,77 B | 262.144 | GGUF Q5_K_M | Apache 2.0 | Espejo bit a bit, uncensored, vision |
| Qwen/Qwen3-VL-8B-Instruct | 8,77 B | 262.144 | safetensors (original) | Apache 2.0 | Modelo raiz, con rechazos intactos |
| huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated | 8,77 B | 262.144 | fp16 | Apache 2.0 | Abliteration sin cuantizar |
| mradermacher/Huihui-Qwen3-VL-8B-Instruct-abliterated-GGUF | 8,77 B | 262.144 | GGUF (multiples quants) | Apache 2.0 | Fuente directa de este espejo |

## Limitaciones y advertencias

- La abliteration elimina direcciones de rechazo, lo que puede incrementar la probabilidad de generar contenido danino, sesgado o inapropiado sin filtros. Requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de razonamiento complejo o extraccion de datos de imagenes de baja calidad.
- Idiomas declarados limitados a frances e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Apache 2.0 se conserva, pero el uso comercial de una variante abliterated puede conllevar riesgos reputacionales y de cumplimiento que deben evaluarse.
- Es un espejo sin soporte: el autor original no mantiene este repositorio y cualquier divergencia se resuelve en la fuente.
- La cuantizacion Q5_K_M introduce perdida de precision respecto al fp16 original; no se han publicado evaluaciones del impacto en calidad.
- El contexto nativo de 262.144 tokens no implica que la VRAM disponible permita usarlo completo; en T4 de 15 GB habra que reducirlo significativamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Huihui-Qwen3-VL-8B-Instruct-abliterated
- Modelo raiz: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated
- Cuantizacion GGUF fuente: https://huggingface.co/mradermacher/Huihui-Qwen3-VL-8B-Instruct-abliterated-GGUF
