# ssv555/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje de aproximadamente 4.200 millones de parámetros desarrollado por Alibaba Qwen (el repositorio base es `Qwen/Qwen3.5-4B`). Esta ficha concreta, publicada por el usuario `ssv555`, no es un modelo nuevo sino una redistribución del GGUF Q4_K_M generado por Unsloth a partir del modelo original, con un único cambio de metadatos (el campo `general.author`). El repositorio contiene un solo archivo de pesos cuantizado para su uso con llama.cpp.

La relevancia de esta entrada es acotada: sirve como artefacto de despliegue para AISHA, un asistente que ejecuta el modelo en CPU para generar sugerencias de chat (denominadas "Tab hints"). Para terceros, el interés está en disponer de una copia verificable (con hash SHA-256 publicado) del GGUF Q4_K_M de Qwen3.5-4B, aunque la fuente canónica y preferible es el repositorio de Unsloth o el modelo original de Qwen.

No se dispone de información sobre la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. Los datos que siguen se limitan a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; detalles no publicados en la información disponible) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); el autor referencia el repositorio de Unsloth para otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.5-4B-Q4_K_M.gguf`, 2.740.937.920 bytes) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura del modelo base Qwen3.5-4B (tipo de transformer, atención, posibles componentes híbridos o MoE), ni sobre el volumen de tokens de entrenamiento, la composición del corpus o las etapas de alineación (RLHF/DPO). La model card de esta entrada se limita a documentar la procedencia del archivo.

El proceso aplicado es una cuantización Q4_K_M realizada por Unsloth sobre los pesos originales en safetensors, con el objetivo de reducir el tamaño a aproximadamente 2,7 GB y permitir inferencia en CPU mediante llama.cpp. La única modificación introducida por `ssv555` respecto al archivo de Unsloth es la adición del campo de metadatos `general.author = ssv555ssv`; los pesos no se han alterado. El autor publica el hash SHA-256 del archivo (`9b689c7d7dbb6a453bd6a6795e9c8302b1aefc2310b5a56e76d186f1113eb248`) para verificación de integridad.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el uso declarado (sugerencias de chat) indican soporte de diálogo multi-turno.
- Inferencia en CPU: el formato GGUF Q4_K_M y el uso con llama.cpp permiten ejecución sin GPU.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el archivo puede servirse a través de infraestructura de inferencia compatible con el formato.
- Cuantización con imatrix: el tag `imatrix` indica que la cuantización empleó una matriz de importancia, lo que habitualmente preserva mejor la calidad en bits bajos.
- Capacidades adicionales (razonamiento explícito, código, matemáticas, tool calling, agentes, visión, audio, multilingüismo): no disponibles en la información proporcionada.

## Casos de uso

- Sugerencias de chat en CPU ("Tab hints"): es el uso declarado por el autor; el modelo genera completaciones cortas en un asistente (AISHA) sin requerir GPU, gracias al tamaño de 2,7 GB del GGUF Q4_K_M.
- Autocompletado en editores o terminales: con 4.200 millones de parámetros y cuantización Q4_K_M, el modelo puede ejecutarse en portátiles convencionales para sugerir texto en tiempo casi interactivo, siempre que se mida la latencia real en el hardware objetivo.
- Prototipado local de asistentes conversacionales: permite validar flujos de diálogo en máquinas sin acelerador antes de migrar a una instancia con GPU o al modelo sin cuantizar.
- Despliegue en entornos con restricciones de hardware: útil en dispositivos edge o servidores sin GPU donde el presupuesto de memoria es de unos pocos gigabytes.
- Verificación de integridad en pipelines: el hash SHA-256 publicado permite comprobar la descarga en sistemas de CI/CD antes de cargar el modelo en llama.cpp.
- Evaluación comparativa de cuantizaciones: al existir el repositorio de Unsloth con otras variantes, este archivo sirve como referencia Q4_K_M para medir la pérdida de calidad frente a Q5, Q6 o Q8 en tareas concretas.
- Base para ajuste fino ligero en local: al ser Apache-2.0 y de tamaño reducido, puede emplearse como punto de partida para experimentos de adaptación, aunque para entrenamiento conviene partir de los pesos en safetensors del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,7 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, un presupuesto práctico de 4-6 GB de RAM es razonable para contextos moderados (cifra orientativa, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada. El uso declarado es en CPU.
- GPU de consumo: no confirmado. Por tamaño, cabría en GPUs con 6-8 GB de VRAM o más, pero no hay datos publicados que lo verifiquen para este modelo concreto.
- Opciones de despliegue: llama.cpp (uso declarado); el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia que aceptan GGUF. Otras opciones (vLLM, TGI, Ollama) no están confirmadas en la documentación.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de contexto; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssv555/Qwen3.5-4B (esta entrada) | 4.205.751.296 | no disponible | GGUF Q4_K_M | Apache-2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-4B-GGUF | mismos pesos base | no disponible | GGUF (varias cuantizaciones) | Apache-2.0 (heredada) | Hugging Face (fuente del archivo) |
| Qwen/Qwen3.5-4B | 4.205.751.296 | no disponible | safetensors | Apache-2.0 | Hugging Face (modelo canónico) |

No se dispone de datos de rendimiento comparado con modelos de otras familias (por ejemplo, Llama o Gemma de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Redistribución de terceros: esta entrada no aporta ningún valor técnico sobre el GGUF de Unsloth salvo el cambio de autor en los metadatos; para producción conviene usar la fuente original o el modelo canónico de Qwen.
- Cuantización Q4_K_M: implica pérdida de precisión respecto a los pesos en safetensors; el impacto exacto en calidad no está medido en la documentación disponible.
- Sesgos: no documentados en la información proporcionada. Al no haber model card del modelo base en esta entrada, no se describen sesgos conocidos.
- Alucinación: riesgo esperable en un modelo de 4.200 millones de parámetros, pero no cuantificado por el autor.
- Idioma: los idiomas soportados no están declarados; no se puede asumir cobertura multilingüe sin verificación.
- Contexto: la longitud de contexto no está publicada; no debe asumirse ninguna ventana concreta.
- Licencia: Apache-2.0 permite uso comercial, pero las condiciones y avisos deben tomarse del repositorio original de Qwen, no de esta copia.
- Reputación del repositorio: 0 descargas y 0 likes; no hay evidencia de uso comunitario ni de revisión independiente del archivo.
- Verificación: se recomienda comprobar el SHA-256 publicado antes de cargar el modelo en cualquier pipeline.

## Enlaces

- Repositorio de esta entrada: https://huggingface.co/ssv555/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
