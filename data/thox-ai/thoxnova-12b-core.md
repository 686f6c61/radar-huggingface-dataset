# Thox-ai/ThoxNova-12B-Core

## Resumen

ThoxNova-12B-Core es un ajuste fino mediante LoRA de rango 8 sobre el modelo base `google/gemma-4-12b-it`, desarrollado por Thox-ai (THOX.ai). El repositorio distribuye conjuntamente el adaptador LoRA en safetensors (131 MB) y dos builds GGUF cuantizados listos para ejecutar: Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB). El objetivo declarado es servir como modelo de chat "conservador" para despliegues en local y en el borde (edge) dentro del stack propio de THOX, con una variante hermanada, ThoxNova-12B-Agent, que aplica una capa de persona distinta orientada a uso de herramientas.

El modelo hereda del base Gemma-4-12B-IT una arquitectura transformer con aproximadamente 11.907 millones de parámetros totales (dato real de safetensors), aunque la model card no detalla la longitud de contexto ni la composición del dataset de entrenamiento. La relevancia actual reside en su enfoque "local-first": un único repositorio público y sin gating que contiene tanto los pesos del adaptador como los GGUF ejecutables, lo que simplifica la puesta en marcha con Ollama o llama.cpp sin pasos intermedios de fusión o conversión.

La licencia declarada es Apache-2.0 para el adaptador y las adiciones de THOX, mientras que el modelo base queda sujeto a los términos de licencia de Gemma 4 de Google, enlazados en la propia card. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12b-it); adaptador LoRA de rango 8 |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (7,38 GB) y Q5_K_M (8,55 GB); adaptador en safetensors (FP/BF16 segun base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 para adaptador y adiciones de THOX; modelo base sujeto a licencia Gemma 4 de Google |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_K_M, Q5_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 entrenado sobre `google/gemma-4-12b-it`. No se publican en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT ni si se aplicaron fases de RLHF o DPO. La unica indicacion tecnica es la etiqueta `sft` en los tags del repositorio, que sugiere un ajuste supervisado, y la calificacion de "conservative chat" que el autor aplica a la postura del modelo.

El adaptador pesa 131.234.472 bytes (unos 131 MB), coherente con un LoRA de rango bajo sobre un modelo de 12B. El repositorio incluye tambien el tokenizer y las conversiones GGUF realizadas por THOX. La plantilla de chat empleada es la estandar de la familia Gemma: `<start_of_turn>user ... <end_of_turn>` seguido de `<start_of_turn>model`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a chat multi-turno.
- Ajuste de persona "conservadora" para asistentes en local y en el borde.
- Ejecucion mediante adaptador PEFT sobre el modelo base o mediante GGUF en Ollama y llama.cpp.
- Distribucion en un unico repositorio con adaptador y builds cuantizados, lo que facilita el despliegue sin fusion manual.
- Variante hermanada ThoxNova-12B-Agent con la misma base y un overlay de persona distinto, pensada para uso de herramientas (tool use).
- Soporte de tool calling / function calling: no documentado de forma explicita para esta variante Core; la card remite a la variante Agent para uso de herramientas.
- Capacidades multimodales, de audio o modo "thinking": no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la card.

## Casos de uso

- Asistente de chat en local para escritorio: el modelo puede ejecutarse con Ollama mediante `ollama run Thox-ai/thoxnova-12b-core` y mantener conversaciones multi-turno en ingles sobre hardware de consumo, gracias al build Q4_K_M de 7,38 GB.
- Despliegue en dispositivos de borde con recursos limitados: la cuantizacion Q4_K_M permite encajar un modelo de 12B en GPUs con 8-10 GB de VRAM, adecuado para estaciones de trabajo sin aceleradores de datacenter.
- Integracion en pipelines de llama.cpp: el binario `llama-cli` puede cargar directamente el GGUF descargado desde Hugging Face, lo que facilita pruebas automatizadas y scripts de generacion por lotes.
- Personalizacion de persona mediante PEFT: al ser un adaptador LoRA de rango 8, un equipo puede cargarlo sobre el base con Transformers + PEFT y sustituirlo o combinarlo con otros adaptadores para ajustar el tono del asistente.
- Base para prototipos de asistentes privados: al ejecutarse en local sin llamadas a API externas, encaja en escenarios donde los datos no deben salir del dispositivo.
- Evaluacion y comparacion de tecnicas de ajuste: el par Core/Agent sobre la misma base permite estudiar el efecto de distintos overlays de persona manteniendo constantes los pesos subyacentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB para Q4_K_M (7,38 GB de pesos mas overhead de contexto) y 9-10 GB para Q5_K_M (8,55 GB de pesos mas overhead).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y GPUs profesionales como A100 o H100 para despliegues concurrentes; tambien cabe en GPUs de 8-12 GB con Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-10 GB de VRAM para Q4_K_M; en configuraciones con menos VRAM puede recurrirse a offload parcial a CPU en llama.cpp.
- Opciones de despliegue: Ollama (`Thox-ai/thoxnova-12b-core`), llama.cpp (GGUF), y Transformers + PEFT para el adaptador sobre el modelo base. No se documenta soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ThoxNova-12B-Core | 11,9 B | no disponible | Apache-2.0 (adaptador) + licencia Gemma 4 (base) | safetensors, GGUF Q4_K_M/Q5_K_M | Ajuste LoRA de chat conservador, solo ingles |
| ThoxNova-12B-Agent | 11,9 B (misma base) | no disponible | Apache-2.0 (adaptador) + licencia Gemma 4 (base) | safetensors, GGUF | Misma base con overlay de persona orientado a tool use |
| google/gemma-4-12b-it | 12 B | no disponible | Licencia Gemma 4 | safetensors y ecosistema GGUF | Modelo base sin ajuste de persona de THOX |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo o seguridad.
- Licencia: el adaptador es Apache-2.0, pero el modelo base queda sujeto a la licencia Gemma 4 de Google; es necesario conservar el LICENSE/NOTICE upstream en cualquier redistribucion y revisar los terminos de uso comercial de Gemma 4.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.
- Tool calling: no esta documentado para esta variante Core; para uso de herramientas la card remite a ThoxNova-12B-Agent.
- Madurez: el repositorio registra 163 descargas y ningun "like" en el momento de la consulta, y la card incluye notas de fundador y de la Chief Agentic Officer que no aportan datos tecnicos verificables.
- Fechas del repositorio: la card indica creacion en 2026-07-05 y actualizacion en 2026-11-08, fechas que conviene contrastar con el estado real del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxNova-12B-Core
- Ollama: https://ollama.com/Thox-ai/thoxnova-12b-core
- Blob Q4_K_M en Ollama: https://ollama.com/Thox-ai/thoxnova-12b-core:latest/blobs/f0895a937c6f
- Catalogo de modelos de THOX: https://www.thox.ai/docs/model-catalog
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
