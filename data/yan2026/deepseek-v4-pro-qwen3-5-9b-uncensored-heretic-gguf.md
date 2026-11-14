# yan2026/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una distribucion cuantizada en formato GGUF del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario yan2026. El nombre combina referencias a DeepSeek y Qwen, pero la model card identifica como arquitectura real la "Qwen3.5 hybrid", con capas recurrentes de atencion linear combinadas con atencion completa cada cuatro capas. El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9.200 millones) y una longitud de contexto declarada de 262.144 tokens.

La variante "UNCENSORED-heretic" indica que se ha modificado el comportamiento de rechazo del modelo base, reduciendo las negativas a responder determinadas peticiones. Esta distribucion GGUF esta pensada para ejecutarse con llama.cpp y motores compatibles, e incluye tambien un proyector multimodal (`mmproj`) para entrada de imagenes, lo que sugiere capacidades de vision en el modelo base. Los idiomas declarados son ingles, chino, coreano, japones, espanol y ruso.

Es relevante ahora porque ofrece una via practica de ejecutar un modelo de ~9B con contexto muy largo en hardware de consumo, con opciones de cuantizacion que van de 5,4 GB (Q4_K_M) a 17,1 GB (BF16). No obstante, la ficha del autor es muy escasa en detalles de entrenamiento y benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid (capas recurrentes de atencion linear + atencion completa cada 4 capas) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16; proyector vision en BF16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Qwen3.5 hybrid", que intercala capas recurrentes de atencion linear con capas de atencion completa cada cuatro capas. Este diseno hibrido busca reducir el coste computacional y de memoria del contexto largo frente a un transformer de atencion completa pura, manteniendo capacidad de recuperacion global. El modelo base es Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, del que esta distribucion es una cuantizacion; no se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa.

La model card no detalla el proceso de "uncensoring" (abliteration u otra tecnica), por lo que se desconoce el metodo exacto empleado para reducir los rechazos. La presencia de un proyector multimodal BF16 (`mmproj`) indica que el modelo base incorpora entrada de imagenes, aunque la ficha no especifica el codificador visual ni los datos multimodales usados.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline: text-generation, tag conversational).
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Matematicas: no confirmado explicitamente en la informacion disponible.
- Vision: soportada mediante el proyector `mmproj` BF16, que se pasa con `--mmproj` en llama.cpp para entrada de imagenes.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: declaradas para ingles, chino, coreano, japones, espanol y ruso.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Comportamiento de rechazo reducido (variante "uncensored/heretic").

## Casos de uso

- Inferencia local con contexto largo: desplegar la variante Q4_K_M (5,4 GB) en llama.cpp con `-c 32768` o ventanas mayores para procesar documentos extensos, historiales de conversacion o bases de codigo, aprovechando los 262.144 tokens de contexto declarados.
- Analisis de imagenes en local: usar el proyector `mmproj` junto al modelo para tareas de descripcion de imagenes, extraccion de texto o respuesta a preguntas visuales en entornos sin GPU de datacenter.
- Prototipado multilingue: cubrir consultas en ingles, chino, coreano, japones, espanol y ruso con un unico modelo, util para equipos que atienden usuarios de varias regiones.
- Investigacion sobre alineacion y rechazo: comparar el comportamiento de esta variante "heretic" frente al modelo base para estudiar efectos de la reduccion de negativas en calidad y seguridad.
- Despliegue en estaciones de trabajo con GPU de consumo: servir el modelo con llama-server en GPUs de 8-24 GB segun cuantizacion, para uso interno o demos.
- Generacion de texto creativo y conversacional sin filtros estrictos: escenarios donde el desarrollador asume la responsabilidad del contenido generado y necesita respuestas menos restrictivas.
- Evaluacion de arquitecturas hibridas: probar el rendimiento de la combinacion de atencion linear y completa en tareas de contexto largo con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ~5,4 GB de pesos (mas overhead de contexto y KV cache); Q8_0 ~9,1 GB; BF16 ~17,1 GB. El proyector vision anade ~0,9 GB.
- GPU recomendadas: RTX 4090 (24 GB) para BF16 o Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) para Q8_0; GPUs de 8-12 GB (RTX 3060/4060, etc.) para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB o mas; Q8_0 requiere ~12 GB o mas; BF16 requiere ~20 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli), y otros motores compatibles con GGUF. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | ~9,2B | 262.144 | Apache-2.0 | Hugging Face, GGUF | Variante uncensored con vision via mmproj |
| Modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,2B | no disponible | no disponible | Hugging Face | Referencia de pesos originales |
| Alternativas de ~9B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- La variante "uncensored/heretic" reduce los rechazos, lo que puede producir contenido inapropiado, inseguro o ilegal; el usuario asume la responsabilidad legal y etica.
- Riesgo de alucinacion inherente a modelos de ~9B; no hay benchmarks que cuantifiquen su fiabilidad.
- Ausencia total de datos de entrenamiento, alineacion y evaluacion en la model card; no se puede verificar la calidad declarada.
- El repositorio tiene cero descargas y cero likes, sin evidencia de validacion por la comunidad.
- El nombre del modelo mezcla referencias a DeepSeek y Qwen, lo que puede inducir a confusion sobre su origen real; la arquitectura declarada es Qwen3.5 hybrid.
- La cobertura idiomatica declarada (en, zh, ko, ja, es, ru) no esta respaldada por evaluaciones; el rendimiento real en espanol o ruso es desconocido.
- El contexto de 262.144 tokens es una cifra declarada; su uso efectivo depende de la KV cache, la memoria disponible y el motor de inferencia.
- Licencia Apache-2.0 permite uso comercial, pero las modificaciones de "uncensoring" pueden plantear problemas de cumplimiento normativo segun la jurisdiccion.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse para pipelines automatizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yan2026/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
