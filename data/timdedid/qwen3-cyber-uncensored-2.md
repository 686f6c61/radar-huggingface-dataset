# timdedid/qwen3-cyber-UNCENSORED-2

## Resumen

`timdedid/qwen3-cyber-UNCENSORED-2` es una redistribucion comunitaria en formato GGUF del modelo Qwen3-1.7B de Alibaba, publicada por el usuario `timdedid` bajo el identificador que indica "uncensored" y "abliterated". A pesar del nombre del fichero (`qwen3.8-cyber-uncensored.gguf`), los metadatos internos del GGUF identifican el modelo como Qwen3 1.7B, con 2.031.739.904 parametros reales segun los safetensors del modelo base. No se trata de un modelo de 8B ni de una variante Qwen3.8.

El modelo resuelve el caso de uso de inferencia local ligera de un modelo conversacional Qwen3 en cuantizacion Q4_K_M, con un unico fichero de aproximadamente 1,36 GB y plantilla de chat ChatML embebida. Es relevante para desarrolladores que quieran ejecutar un modelo de 1,7B en CPU o GPU de gama baja mediante llama.cpp u Ollama sin dependencias de infraestructura.

La model card advierte explicitamente de que el fichero es byte-identico (SHA-256 `6037244a…`) a `timdedid/qwen3-cyber-UNCENSORED` y que se republica solo por cambio de nombre de fichero. Es un fine-tune comunitario sin safety tuning, con licencia Apache-2.0 heredada de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso, segun modelo base) |
| Parametros totales | 2.031.739.904 (1,7B nominales) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Tamano del repo | 1,4 GB |
| Tamano del fichero GGUF | ~1,36 GB |
| Plantilla de chat | ChatML de Qwen3 embebida en el GGUF (soporta mensajes `system`) |
| Muestreo recomendado | temperature 0.6, top_p 0.95, top_k 20 |
| Contexto recomendado en Ollama | 16.384 tokens (`num_ctx`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-1.7B de Alibaba: un transformer denso de la familia Qwen3, con 2.031.739.904 parametros y una ventana de contexto declarada de 40.960 tokens. La model card no aporta detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) ni sobre el proceso de entrenamiento del fine-tune comunitario.

El autor declara el modelo como "abliterated" y "uncensored", lo que en la practica indica un fine-tune orientado a eliminar el rechazo de contenido, pero la model card no documenta el dataset, el numero de tokens de entrenamiento, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documenta ninguna innovacion tecnica adicional sobre el modelo base. La unica informacion verificable sobre el proceso es que se trata de una redistribucion en GGUF Q4_K_M con la plantilla de chat ChatML de Qwen3 embebida y los parametros de muestreo empaquetados para Ollama.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML y soporte de mensajes `system`.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-1.7B (no documentados de forma especifica en la model card).
- Ejecucion local en CPU y GPU de gama baja mediante llama.cpp y Ollama.
- Modo chat nativo (`llama-cli -cnv`) y modo completion sin plantilla.
- Soporte de contexto largo de hasta 40.960 tokens (16.384 tokens en la configuracion de Ollama incluida).
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.
- Tool calling, function calling, agentes y vision: no documentados en la informacion disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo se puede cargar en Ollama con `ollama run hf.co/timdedid/qwen3.8-cyber-uncensored:latest` y mantener conversaciones multi-turno con plantilla ChatML y system prompt, gracias al contexto de hasta 40.960 tokens.
- Inferencia en equipos sin GPU dedicada: el fichero Q4_K_M de ~1,36 GB permite ejecutar el modelo en CPU con llama.cpp, util para entornos de desarrollo, portatiles y dispositivos de borde.
- Pruebas de pipelines de generacion de texto: sirve como modelo de sustitucion barato en tests de integracion de aplicaciones que consumen una API compatible con endpoints, sin necesidad de infraestructura GPU.
- Experimentacion con fine-tunes comunitarios: investigadores que estudien el efecto de tecnicas de abliteration pueden comparar este modelo con el Qwen3-1.7B original bajo la misma cuantizacion.
- Generacion de texto en lote de bajo coste: para tareas de completado o resumen de documentos cortos donde el throughput en CPU sea aceptable.
- Base para despliegues embebidos: al ser un unico GGUF de 1,36 GB con plantilla embebida, se puede empaquetar en contenedores ligeros o aplicaciones de escritorio que usen llama.cpp como backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M, incluyendo overhead de contexto; el fichero de pesos ocupa ~1,36 GB.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el modelo es viable en GTX 1650, RTX 3050, RTX 4060 y superiores. En A100/H100 el modelo esta infrautilizado y el cuello de botella sera el ancho de banda y el overhead de lanzamiento.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (via `hf.co/...` o `Modelfile` local). vLLM y TGI no estan documentados para este fichero GGUF en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| timdedid/qwen3-cyber-UNCENSORED-2 | 1,7B (2.031.739.904) | 40.960 | GGUF Q4_K_M | Apache-2.0 | Fine-tune comunitario abliterated, solo ingles declarado |
| Qwen/Qwen3-1.7B | 1,7B | 40.960 (segun model card del derivado) | safetensors, GGUF | Apache-2.0 | Modelo base oficial de Alibaba, con safety tuning |
| timdedid/qwen3-cyber-UNCENSORED | 1,7B | 40.960 | GGUF Q4_K_M | Apache-2.0 | Fichero byte-identico al de esta ficha, publicado con otro nombre |

No se dispone de datos de benchmarks para comparar el rendimiento relativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha pasado safety tuning segun la propia model card; puede producir contenido ofensivo, inexacto o danino.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se han publicado evaluaciones que lo cuantifiquen.
- Solo se declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- El nombre del fichero (`qwen3.8-cyber-uncensored.gguf`) induce a error: no es un modelo de 8B, es Qwen3-1.7B segun los metadatos del GGUF.
- El repositorio es una republicacion byte-identica de otro modelo del mismo autor; no aporta pesos nuevos ni mejoras respecto a `timdedid/qwen3-cyber-UNCENSORED`.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa de la comunidad.
- La licencia Apache-2.0 se hereda del modelo base Qwen3; el uso comercial esta permitido por licencia, pero el autor no ofrece garantias sobre el comportamiento del fine-tune.
- No es un modelo oficial de Qwen/Alibaba y no esta respaldado por ellos.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors.
- No hay informacion sobre tool calling, agentes, vision ni otras capacidades avanzadas; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/timdedid/qwen3-cyber-UNCENSORED-2
- Modelo duplicado (byte-identico): https://huggingface.co/timdedid/qwen3-cyber-UNCENSORED
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
