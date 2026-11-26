# tang866/Qwen1.5-14B-Chat

## Resumen

Qwen1.5-14B-Chat es la variante conversacional (alineada) del modelo denso de 14.000 millones de parametros de la familia Qwen1.5, desarrollada por el equipo Qwen de Alibaba Cloud. Qwen1.5 es la version beta de Qwen2 y se distribuye como una serie de ocho tamanos (0,5B, 1,8B, 4B, 7B, 14B, 32B, 72B densos y un MoE de 14B con 2,7B activos). Este repositorio concreto (`tang866/Qwen1.5-14B-Chat`) es una copia de los pesos oficiales publicada por un tercero, sin descargas ni interacciones registradas.

El modelo emplea una arquitectura Transformer decoder-only con activacion SwiGLU, sesgo en las proyecciones QKV y un tokenizador mejorado adaptado a multiples lenguajes naturales y codigo. La model card oficial declara soporte estable de contexto de 32.000 tokens para todos los tamanos de la familia, aunque en la version beta no se incluyen GQA (salvo en el 32B) ni la mezcla de attention de ventana deslizante y attention completa.

Su relevancia practica radica en que ofrece un equilibrio razonable entre calidad conversacional y requisitos de hardware para un modelo denso de 14B, con pesos disponibles en safetensors y variantes cuantizadas oficiales (GPTQ Int4/Int8, AWQ y GGUF). El entrenamiento combina preentrenamiento masivo con ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, sesgo QKV y tokenizador multilingue mejorado |
| Parametros totales | 14.167.290.880 (14,17B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (32K, segun la model card oficial de la familia) |
| Tipos de cuantizacion | GPTQ Int4, GPTQ Int8, AWQ y GGUF (variantes oficiales de Qwen) |
| Idiomas soportados | ingles declarado en la model card; la familia Qwen1.5 declara soporte multilingue en base y chat |
| Licencia | tongyi-qianwen (licencia propia, etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (repo de 28,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer decoder-only descrita en el informe tecnico Qwen (arXiv:2309.16609), con activacion SwiGLU y sesgo en las proyecciones de query, key y value. La familia Qwen1.5 introduce un tokenizador redisenado para adaptarse mejor a multiples lenguajes naturales y codigo, y declara compatibilidad nativa con `transformers>=4.37.0` sin necesidad de `trust_remote_code`. En la version beta, el 14B no incorpora GQA ni la mezcla de attention de ventana deslizante y attention completa, caracteristicas reservadas al 32B o previstas para la version final.

El entrenamiento consistio en un preentrenamiento sobre un volumen de datos no especificado en la informacion disponible, seguido de un post-entrenamiento en dos fases: ajuste supervisado (SFT) y optimizacion directa de preferencias (DPO). La model card no detalla la composicion del dataset, el numero de tokens ni los hiperparametros de alineacion. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema.
- Razonamiento general y respuesta a instrucciones tras el alineamiento con SFT y DPO.
- Generacion de codigo: el tokenizador mejorado esta adaptado explicitamente a codigo, aunque no se publican resultados de HumanEval en la informacion disponible.
- Capacidades multilingues: la familia Qwen1.5 declara soporte multilingue en modelos base y chat; este repositorio declara solo `en`.
- Contexto largo de hasta 32K tokens, util para documentos extensos y conversaciones prolongadas.
- No se documenta soporte nativo de tool calling, function calling, agentes o modos de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 32K tokens, manteniendo el contexto de incidencias previas sin truncar.
- Asistente de documentacion tecnica: con 32K de contexto puede ingerir manuales completos o ficheros de referencia y responder preguntas concretas sobre su contenido.
- Generacion y revision de codigo en pipelines de desarrollo: su tokenizador orientado a codigo permite integrarlo en herramientas de autocompletado o revision, aunque sin garantias de tool calling nativo.
- Resumen y analisis de documentos largos: informes, contratos o articulos que superan la ventana tipica de 8K pueden procesarse en una sola pasada.
- Prototipado de chatbots especializados: el formato de chat con rol de sistema facilita definir personalidades y restricciones de dominio mediante prompts.
- Investigacion en alineacion: al ser un modelo con SFT y DPO documentados, sirve como base para experimentos de evaluacion de preferencias y comparativas con otros modelos de 14B.
- Despliegue on-premise con cuantizacion: las variantes GPTQ Int4 e Int8 permiten ejecutar el modelo en infraestructura propia con GPUs de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 28 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 32-40 GB.
- VRAM estimada en cuantizacion Int8 (GPTQ): en torno a 14-16 GB de pesos.
- VRAM estimada en cuantizacion Int4 (GPTQ/AWQ): en torno a 8-9 GB de pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto completo; RTX 4090 (24 GB) para FP16 ajustado o Int8; RTX 3090/4080 para Int4.
- Cabe en GPU consumer: si, en RTX 4090 con cuantizacion Int4 o Int8, y en GPUs de 16 GB con Int4 y contextos moderados.
- Opciones de despliegue: transformers (>=4.37.0), vLLM, TGI, llama.cpp y Ollama mediante los pesos GGUF, y AutoAWQ/GPTQ para las variantes cuantizadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen1.5-14B-Chat (este repo) | 14,17B densos | 32K | tongyi-qianwen | safetensors, GPTQ, AWQ, GGUF |
| Qwen1.5-7B-Chat | 7B densos | 32K | tongyi-qianwen | safetensors y cuantizaciones oficiales |
| Qwen1.5-32B-Chat | 32B densos | 32K | tongyi-qianwen | safetensors y cuantizaciones oficiales; incluye GQA |
| Qwen1.5-14B (MoE) | 14B totales, 2,7B activos | 32K | tongyi-qianwen | safetensors |

La comparativa se limita a miembros de la misma familia porque la informacion disponible no incluye datos de rendimiento frente a modelos de otros desarrolladores. El 7B es la alternativa si el presupuesto de VRAM es limitado; el 32B ofrece GQA y mayor capacidad a costa de mas memoria; el MoE de 14B con 2,7B activos reduce el coste de inferencia manteniendo el total de parametros.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; como todo modelo preentrenado en datos web a gran escala, es probable que reproduzca sesgos de esos datos.
- Alucinacion: no hay metricas publicadas de fidelidad; el modelo puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Idioma: la model card de este repositorio declara unicamente ingles, aunque la familia Qwen1.5 anuncia soporte multilingue; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Code switching: la model card advierte explicitamente de casos de mezcla de idiomas y recomienda usar los hiperparametros de `generation_config.json`.
- Licencia: la licencia tongyi-qianwen es propia y no es OSI; es necesario revisar sus terminos antes de un uso comercial.
- Version beta: Qwen1.5 se presenta como beta de Qwen2; en el 14B faltan GQA y la mezcla de attention de ventana deslizante y completa, lo que puede afectar a la eficiencia en contextos largos.
- Repositorio de terceros: este repo (`tang866/...`) es una copia sin descargas ni validacion de la comunidad; para produccion conviene usar los pesos oficiales de `Qwen/Qwen1.5-14B-Chat`.
- Sin soporte documentado de tool calling ni agentes: si el caso de uso lo requiere, habria que implementarlo a nivel de prompt o plantearse otro modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tang866/Qwen1.5-14B-Chat
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen1.5-14B-Chat
- Licencia oficial: https://huggingface.co/Qwen/Qwen1.5-14B-Chat/blob/main/LICENSE
- Blog de Qwen1.5: https://qwenlm.github.io/blog/qwen1.5/
- Repositorio GitHub de Qwen1.5: https://github.com/QwenLM/Qwen1.5
- Informe tecnico Qwen: https://arxiv.org/abs/2309.16609
