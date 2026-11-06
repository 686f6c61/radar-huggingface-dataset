# TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ es una cuantizacion de 4 bits (W4A16, int4 con activaciones en 16 bits) del finetune comunitario DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicado por el usuario TheUnderscore. El modelo base parte de la familia Qwen3.8 de 27B de parametros con arquitectura hibrida de atencion (etiqueta `qwen3_5` en el repo, con modulos `in_proj_qkv/z` e `in_proj_a/b` propios de atencion lineal) y pipeline `image-text-to-text`, es decir, admite entrada de imagen y texto. El finetune de DavidAU se presenta como una variante "Heretic Uncensored", orientada a reducir los rechazos del modelo original.

El objetivo de esta version es hacer desplegable un modelo de 27.781 millones de parametros en infraestructura modesta: la cuantizacion reduce el peso de 55,7 GB a 19,6 GB, lo que permite servirlo en un par de GPUs de 24 GB con tensor parallelism o en una sola GPU de 48 GB. La cuantizacion se ha realizado con llmcompressor (`oneshot` con AWQModifier) y el formato de pesos es compatible con vLLM mediante compressed-tensors, lo que la hace relevante para despliegues de inferencia en produccion con motores de alto rendimiento.

La licencia declarada es Apache-2.0, heredada del finetune, y el modelo se publica con etiquetas de coding-agent y agentic, lo que indica un enfoque hacia tareas de generacion de codigo y uso de herramientas. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento del finetune original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (familia Qwen3.8, tag `qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso configura `max_model_len=8192`) |
| Tipos de cuantizacion | W4A16 ASYM int4, grupo 128, en capas MLP y atencion (q/k/v/o, in_proj_qkv/z, out_proj); BF16 en in_proj_a/b, lm_head, embed_tokens, visual, mtp y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ int4), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del finetune DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, que a su vez deriva de la familia Qwen3.8 de 27B. La arquitectura es un transformer hibrido: combina capas de atencion completa con capas de atencion lineal, como revelan los modulos `in_proj_qkv`, `in_proj_z` e `in_proj_a/b` presentes en la tabla de cuantizacion. El pipeline `image-text-to-text` y la presencia de un modulo `visual` en BF16 confirman que el modelo mantiene la torre de vision del original, por lo que acepta entradas multimodales imagen-texto. Tambien aparece un modulo `mtp` (multi-token prediction), conservado en BF16.

El proceso de cuantizacion se realizo con llmcompressor en modo `oneshot` con `AWQModifier`, usando offloading a CPU y reglas especificas para mapeos de atencion hibrida (se descartaron las reglas de atencion lineal). El script `quantize-awq-hybrid.py` se distribuye en el repositorio y se ejecuto con DDP/torchrun sobre dos GPUs. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el finetune original uso RLHF o DPO; la model card remite a la tarjeta GGUF del autor original para instrucciones de prompting, pero no detalla el entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, con parametros de muestreo recomendados de temperature 1.0, top_p 0.95 y top_k 20.
- Generacion de codigo y tareas de agente de programacion, segun las etiquetas `coding-agent` y `agentic` del repositorio.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y la torre visual se conserva en BF16.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque las etiquetas de agente lo sugieren.
- Razonamiento multi-paso y uso de agentes: inferido de las etiquetas, sin documentacion detallada.
- Modo "uncensored": el finetune base esta disenado para reducir los rechazos del modelo original, lo que afecta al comportamiento en contenido sensible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o en un IDE mediante vLLM, aprovechando el soporte de compressed-tensors y las etiquetas de coding-agent para autocompletado, generacion de tests y revision de parches.
- Atencion al cliente automatizada: con un contexto de al menos 8192 tokens configurable, puede gestionar conversaciones multi-turno con historial extenso, aunque la longitud maxima real no esta documentada.
- Procesamiento de documentos con imagenes: al aceptar entradas image-text-to-text, puede extraer informacion de capturas, formularios o diagramas y resumirlos en texto.
- Agentes autonomos con herramientas: las etiquetas agentic y coding-agent sugieren uso en bucles de razonamiento con llamadas a funciones, aunque la calidad del tool calling no esta verificada.
- Generacion de contenido creativo sin filtros: el caracter "Heretic Uncensored" lo hace adecuado para escritura de ficcion o guiones donde los modelos alineados suelen rechazar tematicas adultas o violentas.
- Despliegue en hardware de gama media: con 19,6 GB de pesos en int4, puede servirse en dos GPUs de 24 GB con tensor parallelism, lo que abarata la experimentacion frente al modelo en BF16 de 55,7 GB.
- Investigacion sobre cuantizacion: el repositorio incluye el script de cuantizacion, util para reproducir el proceso o adaptarlo a otros finetunes hibridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en BF16, por lo que no es posible evaluar la perdida de calidad introducida por la cuantizacion W4A16.

## Requisitos de hardware

- VRAM estimada: 19,6 GB solo para los pesos en int4; con cache KV y overhead de vLLM, se recomienda un minimo de 24 GB y, para contextos largos, 32-48 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada. El autor probó el modelo con kernels SM70 (V100) mediante 1Cat-vLLM, lo que indica compatibilidad con GPUs mas antiguas.
- Consumer GPU: cabe en una RTX 4090 (24 GB) con contexto moderado, o en dos RTX 3090/4090 con `tensor_parallel_size=2` para mayor margen.
- Opciones de despliegue: vLLM con soporte compressed-tensors (probado con 1Cat-vLLM); llama.cpp/Ollama no aplican directamente a este formato AWQ, aunque existe una version GGUF del modelo base de DavidAU.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (W4A16-AWQ) | 27,78 B | no disponible | int4 W4A16, 19,6 GB | Apache-2.0 | Multimodal, hibrido, finetune uncensored |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27,78 B | no disponible | BF16, 55,7 GB | Apache-2.0 | Modelo base sin cuantizar |
| TheUnderscore/...-NVFP4-W4ATTN-AWQ | 27,78 B | no disponible | NVFP4/W4A16 mixta | Apache-2.0 | Variante de cuantizacion alternativa del mismo finetune |
| TheUnderscore/Qwen3.8-27B-TWIN-TURBO-...-W4A16-AWQ | 27,78 B | no disponible | int4 W4A16 | Apache-2.0 | Otro finetune Qwen3.8-27B del mismo autor, no directamente comparable en calidad |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con modelos de otros autores.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la degradacion de calidad respecto al modelo en BF16 ni al Qwen3.8-27B original.
- Modelo "uncensored": el finetune esta disenado para reducir rechazos, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin salvaguardas; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: no cuantificado; los finetunes comunitarios sin evaluacion publicada suelen presentar mayor deriva respecto al modelo original.
- Idiomas y contexto no documentados: se desconoce el soporte multilingue real y la longitud maxima de contexto efectiva; el ejemplo de uso limita `max_model_len` a 8192.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y la cadena de finetunes intermedios puede introducir obligaciones no documentadas.
- Compatibilidad de despliegue limitada: requiere motores con soporte compressed-tensors (vLLM); no funciona con llama.cpp ni Ollama en este formato.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- La model card remite a la tarjeta GGUF del autor original para instrucciones de prompting, lo que indica documentacion incompleta en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ
- Modelo base (finetune): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Tarjeta GGUF del autor original (instrucciones de prompting): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo Qwen3.8-27B original referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4 del mismo finetune: https://huggingface.co/TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-W4ATTN-AWQ
- Otro finetune del mismo autor: https://huggingface.co/TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-W4A16-AWQ
