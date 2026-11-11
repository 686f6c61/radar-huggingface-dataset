# TheShellMaster/Cypher-Base-Wan2.1-T2V-1.3B-GGUF

## Resumen

Cypher-Base-Wan2.1-T2V-1.3B-GGUF es un espejo de distribucion publico y sin modificaciones del archivo `Wan2.1-T2V-1.3B-Q5_K_M.gguf` (1,09 GB) publicado por samuelchristlie. Los pesos proceden del modelo raiz Wan-AI/Wan2.1-T2V-1.3B, un modelo de generacion de video texto-a-video (T2V) basado en una arquitectura DiT (Diffusion Transformer) de 1.300 millones de parametros, cuantizado en formato GGUF con el nivel Q5_K_M. No hay re-cuantizacion ni fine-tuning: los pesos son identicos a la fuente.

El repositorio existe para que la cadena de produccion del modelo derivado Cypher-3-Motion siga siendo publica y reproducible aunque el repositorio original deje de estar accesible. La model card lo declara explicitamente como espejo de distribucion y atribuye todo el credito a Wan-AI (modelo original) y samuelchristlie (abliteration y cuantizacion).

Es relevante para desarrolladores que quieran reproducir o auditar la genealogia de Cypher-3-Motion, y para quienes necesiten una copia estable del checkpoint cuantizado de Wan2.1-T2V-1.3B. Conviene advertir que la model card mezcla terminologia de modelos de lenguaje (contexto nativo, `llama-cli`, `-c 4096`) con un modelo de difusion de video, lo que puede inducir a error sobre su uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wan · DiT (Diffusion Transformer) de 1,3B |
| Parametros totales | 1.300 millones (1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "— tokens") |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo raiz Wan-AI/Wan2.1-T2V-1.3B emplea una arquitectura DiT (Diffusion Transformer) de 1.300 millones de parametros orientada a la generacion de video a partir de texto. El proceso de difusion opera sobre representaciones latentes del video, y el transformer modela la evolucion temporal y espacial de esas representaciones condicionadas por el prompt textual.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La unica transformacion documentada en esta cadena es la abliteration en fp16 (atribuida a Wan-AI en la tabla de genealogia, si bien la abliteration suele ser un procedimiento de eliminacion de direcciones de rechazo) y la posterior cuantizacion a GGUF Q5_K_M por parte de samuelchristlie. Este repositorio no introduce ninguna modificacion adicional: es un espejo byte a byte del archivo fuente.

## Capacidades

- Generacion de video texto-a-video (T2V): produce clips de video a partir de una descripcion textual.
- Pesos cuantizados en Q5_K_M para reducir huella de memoria y facilitar el despliegue en entornos con VRAM limitada.
- Base declarada del modelo derivado Cypher-3-Motion, util para reproducir la cadena de produccion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades multilingues ni de vision, audio o texto generativo; la model card no especifica idiomas.
- No se documenta soporte de salida de audio ni de edicion de video.

## Casos de uso

- Reproduccion de la cadena de produccion de Cypher-3-Motion: descargar este espejo garantiza disponibilidad del checkpoint base aunque el repositorio de samuelchristlie desaparezca, permitiendo auditar la genealogia del derivado.
- Generacion de clips de video a partir de prompts de texto en entornos con VRAM ajustada: el archivo Q5_K_M de 1,09 GB reduce el consumo frente al checkpoint fp16 original, lo que facilita pruebas en GPUs de gama media.
- Prototipado de pipelines T2V: sirve como checkpoint de referencia para validar infraestructura de inferencia de difusion de video antes de escalar a modelos mayores.
- Archivado y espejo de artefactos: util en organizaciones que necesitan copias internas estables de pesos con licencia Apache-2.0 para cumplir requisitos de procedencia.
- Investigacion sobre cuantizacion de modelos de difusion: permite comparar el comportamiento del mismo checkpoint en Q5_K_M frente a la version fp16 del modelo raiz.
- Base para experimentos de abliteration o ajuste fino sobre Wan2.1-T2V-1.3B: el formato GGUF y la licencia permisiva facilitan derivados, siempre respetando la atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 1,09 GB en disco; la VRAM necesaria para ejecutar difusion de video excede con crecido ese tamano por estados latentes, activaciones y buffers de atencion. No se dispone de cifras concretas en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el tamano del archivo sugiere que puede cargarse en GPUs consumer con suficiente VRAM, pero no hay datos de ejecucion verificados.
- Opciones de despliegue: la model card cita `llama-cli` y `ollama create`, si bien estas herramientas estan orientadas a modelos de lenguaje y no a difusion de video; no se documentan opciones de despliegue especificas para T2V (vLLM, TGI, ComfyUI, Diffusers).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cypher-Base-Wan2.1-T2V-1.3B-GGUF (este repositorio) | 1,3B | no disponible | GGUF Q5_K_M | Apache-2.0 | Hugging Face, espejo |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3B | no disponible | safetensors (fp16) | Apache-2.0 | Hugging Face, repositorio raiz |
| samuelchristlie/Wan2.1-T2V-1.3B-GGUF | 1,3B | no disponible | GGUF Q5_K_M | Apache-2.0 | Hugging Face, fuente del espejo |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos T2V de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La model card mezcla terminologia de modelos de lenguaje (contexto nativo, `llama-cli`, `-c 4096`) con un modelo de difusion de video; las instrucciones de uso citadas pueden no ser aplicables al pipeline real de generacion de video.
- No se documentan sesgos conocidos, pero al ser un modelo abliterated derivado de Wan2.1, puede heredar sesgos del dataset original y comportamientos menos filtrados.
- Riesgo de alucinacion y artefactos visuales inherente a los modelos de difusion; no hay evaluaciones publicadas en la informacion disponible.
- No se especifican idiomas soportados ni limitaciones de contexto.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar atribucion a Wan-AI y samuelchristlie.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria de la integridad del archivo.
- Solo se publica una cuantizacion (Q5_K_M); no hay alternativas Q4, Q8 ni fp16 en este repositorio.
- Es un espejo sin modificaciones: cualquier correccion o mejora debe hacerse en el repositorio fuente o en el modelo raiz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/Cypher-Base-Wan2.1-T2V-1.3B-GGUF
- Fuente del archivo GGUF: https://huggingface.co/samuelchristlie/Wan2.1-T2V-1.3B-GGUF
- Modelo raiz: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo derivado: https://huggingface.co/TheShellMaster/Cypher-3-Motion
