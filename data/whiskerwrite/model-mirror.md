# WhiskerWrite/model-mirror

## Resumen

WhiskerWrite/model-mirror no es un modelo entrenado por su autor, sino un espejo de distribucion: una copia sin modificar de los modelos que la aplicacion de escritorio SayWrite para macOS descarga durante su configuracion inicial. El repositorio agrupa tres familias de modelos de terceros: las cuantizaciones GGUF Q4_K_M de Qwen 3.5 en tamanos 2B, 4B y 9B (generacion de texto), el modelo de reconocimiento de voz Parakeet TDT 0.6B v2 de NVIDIA convertido a Core ML, y la conversion a Core ML de Whisper small.en de OpenAI. El autor declara explicitamente que no esta afiliado ni respaldado por los creadores originales.

El problema que resuelve es la disponibilidad: SayWrite intenta primero la ubicacion original en Hugging Face y recurre a este espejo en segundo lugar, verificando cada archivo contra un SHA-256 fijado en `SHA256SUMS`, de modo que nunca se utiliza un archivo que difiera del original. Esto aporta resiliencia frente a caidas, eliminaciones o cambios de revision en los repositorios de origen.

La relevancia de la ficha es doble: por un lado documenta un patron de distribucion (espejo con verificacion criptografica) util para aplicaciones que empaquetan modelos de terceros; por otro, agrega en un solo lugar modelos heterogeneos (LLM, ASR y ASR en ingles) bajo una licencia compuesta. El dato de parametros reales registrado en safetensors es de 1.881.825.088, que corresponde al componente mayor del conjunto y no a la suma de todos los modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto heterogeneo: transformers para los Qwen 3.5, TDT para Parakeet, encoder-decoder para Whisper) |
| Parametros totales | 1.881.825.088 (dato safetensors del repo; no representa la suma del conjunto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para los Qwen 3.5; conversiones Core ML cuantizadas para Parakeet y Whisper (detalle no disponible) |
| Idiomas soportados | no disponible (Whisper small.en es exclusivamente ingles; idiomas de los Qwen 3.5 no detallados en la informacion) |
| Licencia | multiple: Apache-2.0 (Qwen 3.5 y GGUF de Unsloth), CC BY 4.0 (Parakeet), MIT (Whisper Core ML de Argmax), Apache-2.0 (tokenizer de Whisper) |
| Formato de pesos | GGUF y Core ML; incluye `SHA256SUMS` para verificacion de integridad |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye artefactos ya entrenados. Los componentes de texto son Qwen 3.5 en variantes 2B, 4B y 9B, cuantizados a Q4_K_M por Unsloth y fijados a revisiones concretas de sus repositorios de origen. Los componentes de voz son Parakeet TDT 0.6B v2 de NVIDIA, convertido a Core ML y cuantizado por FluidInference, y Whisper small.en de OpenAI, convertido a Core ML por Argmax con los archivos de tokenizer tomados de openai/whisper-small.en.

La innovacion tecnica del repositorio no esta en el modelado sino en el mecanismo de distribucion: cada archivo se compara contra un SHA-256 fijado, y la aplicacion cliente prueba primero el origen y luego el espejo. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO de los modelos subyacentes en la informacion proporcionada.

## Capacidades

- Generacion de texto y asistencia de escritura mediante los Qwen 3.5 (2B, 4B, 9B) en formato GGUF.
- Reconocimiento de voz multiuso con Parakeet TDT 0.6B v2 (transcripcion, con marcas de tiempo segun el modelo original de NVIDIA).
- Transcripcion de voz en ingles con Whisper small.en.
- Conversacional: el tag `conversational` figura entre los metadatos del repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere uso con infraestructura de inferencia tipo endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible (Whisper small.en limitado a ingles).
- Capacidades especiales (thinking mode, vision, audio): audio si (ASR); vision y thinking mode no disponibles.

## Casos de uso

- Aplicacion de dictado en macOS: SayWrite descarga estos modelos en la configuracion inicial y usa Parakeet o Whisper para transcribir voz a texto localmente, sin enviar audio a la nube.
- Asistencia de escritura offline: los Qwen 3.5 cuantizados a Q4_K_M permiten correccion, reescritura y generacion de texto en el propio dispositivo, con el 2B para equipos modestos y el 9B para mayor calidad.
- Distribucion resiliente de modelos: cualquier aplicacion que empaquete modelos de terceros puede replicar el patron de espejo con verificacion SHA-256 para evitar dependencias fragiles de un unico repositorio.
- Auditoria de procedencia: el archivo `SHA256SUMS` y las revisiones fijadas permiten verificar que los pesos usados coinciden bit a bit con los originales, util en entornos con requisitos de trazabilidad.
- Prototipado de pipelines ASR: las conversiones Core ML de Parakeet y Whisper sirven para probar reconocimiento de voz en Apple Silicon con aceleracion nativa.
- Base para aplicaciones de accesibilidad: transcripcion y generacion de texto local para usuarios que requieren dictado o asistencia de escritura sin conexion.
- Evaluacion comparativa de ASR: disponer de Parakeet TDT y Whisper small.en en el mismo repositorio facilita comparar ambos motores en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; para los Qwen 3.5 en Q4_K_M, el 2B requiere del orden de 1,5-2 GB, el 4B en torno a 2,5-3 GB y el 9B alrededor de 5,5-6 GB, cifras orientativas que no figuran en la informacion proporcionada.
- GPU recomendadas: no disponible; el tag `coreml` y el enfoque en la app de macOS apuntan a Apple Silicon (CPU/GPU/Neural Engine) como destino principal.
- Compatibilidad con GPU de consumo: probable en Apple Silicon y en GPUs con suficiente memoria para las variantes GGUF, aunque no se detalla en la informacion.
- Opciones de despliegue: llama.cpp y derivados (Ollama, etc.) para los GGUF; Core ML para los componentes de voz; el tag `endpoints_compatible` sugiere servidores de inferencia compatibles con endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WhiskerWrite/model-mirror (conjunto) | 1.881.825.088 (safetensors del repo) | no disponible | multiple (Apache-2.0, CC BY 4.0, MIT) | Hugging Face, espejo con SHA-256 |
| Qwen 3.5 2B/4B/9B (origen) | 2B, 4B, 9B | no disponible | Apache-2.0 | Hugging Face (unsloth/Qwen3.5-*-GGUF) |
| Parakeet TDT 0.6B v2 (origen) | 0.6B | no disponible | CC BY 4.0 | Hugging Face (nvidia/parakeet-tdt-0.6b-v2) |
| Whisper small.en (origen) | no disponible | no disponible | MIT (modelo Core ML), Apache-2.0 (tokenizer) | Hugging Face (argmaxinc/whisperkit-coreml) |

La comparativa relevante es contra los repositorios originales: este espejo no aporta diferencias de rendimiento, solo de disponibilidad y verificacion de integridad.

## Limitaciones y advertencias

- No es un modelo propio: el autor no ofrece garantias sobre los pesos, que se distribuyen "as is" y sin respaldo de los creadores originales.
- Licencia compuesta: el uso comercial exige cumplir simultaneamente Apache-2.0, CC BY 4.0 y MIT segun el componente; consultar `LICENSES.md`.
- Whisper small.en solo transcribe ingles, lo que limita el uso en castellano para ese componente.
- Los Qwen 3.5 cuantizados a Q4_K_M pierden precision respecto a los pesos originales en precision completa.
- Riesgo de alucinacion inherente a los LLM; no hay evaluaciones publicadas en este repositorio.
- Idiomas soportados por los modelos de texto no documentados en la informacion.
- Dependencia de revisiones fijadas: si los repositorios de origen cambian o desaparecen, la verificacion SHA-256 protege la integridad pero no garantiza la disponibilidad futura del espejo.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio del espejo: https://huggingface.co/WhiskerWrite/model-mirror
- Licencias: https://huggingface.co/WhiskerWrite/model-mirror/blob/main/LICENSES.md
- Qwen 3.5 2B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Qwen 3.5 4B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Qwen 3.5 9B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Parakeet TDT 0.6B v2 (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Parakeet TDT 0.6B v2 Core ML (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v2-coreml
- WhisperKit Core ML (Argmax): https://huggingface.co/argmaxinc/whisperkit-coreml
- Whisper small.en (OpenAI): https://huggingface.co/openai/whisper-small.en
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
