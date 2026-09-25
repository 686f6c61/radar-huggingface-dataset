# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e

## Resumen

Esta ficha describe `xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e`, una cuantizacion de 4 bits del modelo `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` publicada por el usuario xunlinkx. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada al runtime Apple MLX mediante el esquema "enhanced oQ4" (oQ4e) de oMLX, con grupo de cuantizacion de tamano 64, calibracion sobre 128 muestras de 512 tokens y calculo en BF16 durante el proceso de cuantizacion.

El modelo base es un checkpoint de 9B desarrollado por Xiaomi MiMo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por la familia mayor MiMo-V2.6. El modelo original esta orientado a tareas agénticas: ingenieria de software, tareas de agente de proposito general, codigo con componente visual y ciberseguridad. Xiaomi lo publico como punto de partida para investigacion abierta en refuerzo agéntico.

La variante aqui descrita elimina por completo la torre de vision y los configs multimodales del modelo base. El resultado es un LLM estrictamente de texto, mas ligero en memoria y con carga inmediata en pipelines de inferencia de texto estandar (mlx-lm, LM Studio, Cursor, OpenHands). Tampoco incorpora cabezas draft MTP para decodificacion especulativa, una decision explicita del autor para maximizar compatibilidad con `mlx-lm` y minimizar el consumo de memoria unificada. El repositorio ocupa 5,3 GB y declara licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B mediante SFT); tag de libreria `qwen3_5` |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (esquema oQ4e de oMLX, calibrado con 128 muestras de 512 tokens, computo BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `mlx`); repo de 5,3 GB |
| Pipeline | text-generation |
| Modalidad | Solo texto (torre de vision y procesadores multimodales omitidos) |
| Cabezas MTP especulativas | No incluidas |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de ~9B derivado de Qwen3.5-9B, ajustado por Xiaomi MiMo con supervision (SFT) sobre datos generados por la familia MiMo-V2.6, mas grande y nativamente omnimodal. Segun las fuentes consultadas, el entrenamiento apunta a cuatro dominios: ingenieria de software, tareas agénticas de proposito general, codigo visual y ciberseguridad. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni la presencia de etapas de RLHF o DPO en este checkpoint concreto.

Sobre esa base, el autor de la ficha aplica una cuantizacion oQ4e con MLX: cuantizacion afín de 4 bits con grupo de tamano 64, calibrada con 128 muestras a longitud de secuencia 512, cobertura estricta de la matriz de importancia (sin entradas ausentes ni desajustadas) y computo en BF16. Se conserva la identidad SHA-256 del tokenizer respecto al origen y se elimina la torre de vision, dando un modelo estrictamente textual. Las validaciones reportadas por el autor incluyen carga estricta mediante el runtime oMLX, renderizado correcto de un esquema de funciones estilo OpenAI con la plantilla de chat oficial y una prueba de humo de generacion determinista (`15% of 240` debe incluir `36`).

## Capacidades

- Generacion de texto conversacional de un solo turno y multiturno mediante la plantilla de chat oficial.
- Tool calling / function calling: la plantilla de chat renderiza un esquema de funciones estilo OpenAI cuando se le proporcionan las definiciones de herramientas en la peticion.
- Razonamiento agéntico de multiples pasos heredado del modelo base, orientado a tareas de ingenieria de software y de agente de proposito general.
- Generacion y edicion de codigo, incluido codigo con componente visual en el modelo original (aunque la torre de vision se ha eliminado en esta variante, por lo que la entrada es exclusivamente texto).
- Conocimiento especializado declarado en ciberseguridad por parte del modelo base.
- Compatibilidad con pipelines de texto estandar (mlx-lm, LM Studio, Cursor, OpenHands) gracias a la omision de pesos multimodales y de cabezas MTP.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local sobre Apple Silicon: el modelo puede generar y refactorizar codigo dentro de editores como Cursor ejecutandose integramente en el equipo, sin enviar codigo propietario a servicios externos, gracias a los 5,3 GB de pesos cuantizados.
- Agente de ingenieria de software autonomo: con soporte de tool calling y herencia de datos de entrenamiento orientados a tareas agénticas, puede encadenar pasos como leer ficheros, ejecutar comandos y aplicar parches en frameworks tipo OpenHands.
- Automatizacion de tareas de terminal y scripting: al aceptar esquemas de funciones, se puede exponer un conjunto acotado de utilidades (listar, leer, escribir, ejecutar) y dejar que el modelo decida la secuencia de llamadas.
- Triaje y asistencia en ciberseguridad: el modelo base declara entrenamiento especifico en este dominio, por lo que resulta util para resumir alertas, clasificar hallazgos o redactar notas de analisis en un entorno aislado y sin conexion.
- Prototipado rapido de asistentes conversacionales en macOS: al cargar de inmediato en `mlx-lm.generate`, permite iterar sobre prompts y plantillas de chat sin infraestructura de servidor.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de un esquema 4-bit con group size 64 frente al checkpoint BF16 original sobre el propio conjunto de tareas del equipo.
- Procesamiento por lotes de documentacion tecnica: generacion de resumenes, extraccion de entidades o reformateo de textos largos en un portatil con memoria unificada, evitando costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta validaciones funcionales (carga estricta en oMLX, metadatos de cuantizacion, aplicacion completa de la matriz de importancia, identidad del tokenizer y una prueba de humo determinista), no metricas de calidad tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: aproximadamente 5,5-6,5 GB solo para los pesos en 4 bits (repo de 5,3 GB) mas el cache KV, que crece con la longitud de contexto y el numero de secuencias simultaneas.
- Plataforma objetivo: Apple Silicon, ya que el formato es MLX. No es un modelo GGUF y no se carga directamente en llama.cpp ni en Ollama sin conversion previa.
- Equipos recomendados: cualquier Mac con 16 GB de memoria unificada o mas (M1/M2/M3/M4 en sus variantes Pro, Max o Ultra). Con 8 GB el modelo puede cargar pero el margen para cache KV y contexto es muy limitado.
- GPU NVIDIA: no es la ruta nativa; requeriria conversion a otro formato (por ejemplo GGUF o safetensors de PyTorch) y no esta cubierta por la model card.
- Opciones de despliegue: runtime oMLX (el autor indica que esta construido especificamente para el), `mlx-lm` estandar y aplicaciones que lo consumen como LM Studio, Cursor u OpenHands. vLLM y TGI no soportan pesos MLX de forma directa.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones y ademas la variante omite las cabezas MTP de decodificacion especulativa, por lo que no se puede asumir la aceleracion que esa tecnica aportaria en el modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e (este) | 8,95B | 4-bit oQ4e, group size 64, MLX | Solo texto | no disponible | MIT | HuggingFace, runtime oMLX / mlx-lm |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | no disponible (familia 9B) | BF16 / precision completa | Multimodal (incluye vision) | no disponible | no disponible en la informacion consultada | HuggingFace, ModelScope |
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e | no disponible | 4-bit oQ4e, MLX | Solo texto | no disponible | no disponible en la informacion consultada | HuggingFace |
| MiMo-V2.6-Pro | no disponible | no disponible | Omnimodal | no disponible | no disponible | Publicacion de Xiaomi |

La comparacion cuantitativa con alternativas de la misma categoria (por ejemplo otros modelos agénticos de ~9B en 4 bits) no esta disponible en la informacion proporcionada, ya que no se han publicado resultados de benchmarks para esta variante.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede alterar el comportamiento respecto al checkpoint original; el propio autor recomienda evaluar sobre la carga de trabajo propia antes de usar el modelo en produccion.
- La torre de vision ha sido eliminada: cualquier tarea que requiera entrada de imagenes o video no es posible con esta variante, aunque el modelo base si las soportara.
- La ausencia de cabezas MTP implica que no se puede aprovechar la decodificacion especulativa asociada a esa tecnica, con el consiguiente impacto potencial en latencia frente al original.
- Uso de tool calling condicionado: solo funciona si se aplica la plantilla de chat incluida y se proporcionan los esquemas de herramientas en la peticion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de este tamano y debe mitigarse con verificacion externa en tareas criticas.
- Idiomas soportados: no disponible, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo ni de seguridad en la informacion proporcionada.
- Restricciones de licencia: MIT, heredada del modelo original segun el autor. Aun asi, conviene revisar los avisos y la atribucion de los repositorios de Xiaomi para confirmar las condiciones aplicables al uso comercial.
- Contexto maximo: no disponible, lo que impide dimensionar con precision el uso en tareas de documento largo o conversaciones muy extensas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion; se trata de una publicacion reciente y poco validada por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina oficial de la familia MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Variante abliterada del mismo autor: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e
- Ficha tecnica de terceros (gradually.ai): https://www.gradually.ai/en/ai-models/mimo-v2.6-distill-qwen-9b/
- Ficha en el catalogo de Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
