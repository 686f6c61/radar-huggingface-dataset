# Xylolabs/Ministral-3-14B-Instruct-2512-GGUF

## Resumen

Ministral-3-14B-Instruct-2512-GGUF es una cuantizacion en formato GGUF del modelo mistralai/Ministral-3-14B-Instruct-2512-BF16, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de 13.506.073.600 parametros (aproximadamente 13,5 mil millones) desarrollado por Mistral AI, orientado a generacion de texto conversacional e instrucciones. Esta version cuantizada reduce el peso a un unico fichero de 7,41 GB en cuantizacion IQ4_XS con importance matrix, lo que permite desplegarlo en hardware mas modesto que el BF16 original.

La publicacion resuelve el problema practico de ejecutar un modelo de ~13,5B en entornos con VRAM limitada o sin GPU dedicada, manteniendo una fidelidad alta respecto al BF16 de referencia: la model card reporta una divergencia KL media de 0,0149 y un 93,67% de coincidencia en top-1 sobre 12.104 posiciones de texto en ingles y coreano. Es relevante ahora porque Mistral AI ha liberado la familia Ministral 3 bajo licencia Apache 2.0, y esta cuantizacion de Xylolabs aparece pocos dias despues del lanzamiento del BF16, facilitando su adopcion inmediata en pipelines locales.

El paquete incluye el modelo de lenguaje completo, el tokenizer original y la plantilla de chat, pero excluye la torre de vision del modelo base; por tanto, esta version es estrictamente text-only. La licencia Apache 2.0 se mantiene, y Xylolabs declara explicitamente no estar afiliada ni respaldada por los autores del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral AI Ministral 3) |
| Parametros totales | 13.506.073.600 (~13,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | IQ4_XS-imat (unico quant publicado; 7,41 GB) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 safetensors |
| Tamano del repositorio | 7,4 GB |
| Fidelidad vs BF16 | KL media 0,0149; top-1 coincidente 93,67% (12.104 posiciones, en+ko) |
| Commit minimo de llama.cpp | `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior |
| Modalidad | text-only (sin torre de vision) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Mistral AI perteneciente a la familia Ministral 3, con 13,5 mil millones de parametros. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card del BF16 original y no se reproducen en la ficha del quant. El modelo esta etiquetado como `conversational` e `Instruct`, lo que indica un ajuste para seguir instrucciones y mantener dialogos multi-turno.

La innovacion tecnica de esta publicacion concreta reside en el proceso de cuantizacion: Xylolabs emplea una importance matrix (imat) para calcular los pesos de cuantizacion IQ4_XS, lo que reduce la perdida de calidad frente a una cuantizacion uniforme. La evaluacion se realizo comparando la salida del quant contra una pasada BF16 en transformers, midiendo divergencia KL y coincidencia top-1 sobre texto en ingles y coreano. El resultado, 93,67% de top-1 y KL de 0,0149, es un indicador razonable de que el quant preserva el comportamiento del modelo original para generacion de texto. No se mencionan tecnicas como decodificacion especulativa, attention linear ni arquitecturas hibridas en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles y coreano.
- Razonamiento multi-turno y mantenimiento de contexto en dialogos (sujeto a la ventana de contexto del modelo base, no especificada aqui).
- Generacion de codigo y respuestas tecnicas, heredadas del modelo Instruct de Mistral AI.
- Plantilla de chat incluida en el fichero GGUF, compatible con `--jinja` en llama.cpp.
- Capacidad multimodal de vision: no incluida en este quant (la torre de vision se excluye explicitamente).
- Tool calling / function calling: no confirmado en la informacion proporcionada para esta version; depende de las capacidades del modelo base.
- Modo thinking: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no confirmado en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles o coreano: el modelo puede desplegarse con `llama-server` en una estacion de trabajo con GPU consumer y servir una API compatible con OpenAI, adecuado para prototipos de atencion al cliente en esos idiomas.
- Generacion de codigo en entornos sin conexion: al ejecutarse en llama.cpp sobre CPU o GPU local, permite autocompletado y explicacion de codigo en maquinas aisladas o con requisitos de privacidad estrictos.
- Procesamiento de documentos en lote: con 7,41 GB de peso, cabe en una unica GPU de 12-16 GB o incluso en RAM del sistema, lo que facilita tareas de resumen y extraccion sobre corpus en ingles y coreano.
- Chatbot embebido en aplicaciones de escritorio: el formato GGUF de fichero unico simplifica la distribucion junto a binarios de llama.cpp, sin dependencias de servidores externos.
- Evaluacion y experimentacion academica: investigadores que necesitan comparar el comportamiento de Ministral 3 en cuantizacion 4-bit frente a BF16 pueden usar este quant con la metrica KL y top-1 ya publicada como referencia.
- Filtrado y clasificacion de texto en coreano: el soporte explicito de `ko` en la model card lo hace util para tareas de moderacion o etiquetado en ese idioma, aunque la calidad fuera de en/ko no esta documentada.
- Despliegue en edge o CPU-only: al no requerir GPU, puede ejecutarse en servidores sin acelerador, con throughput menor pero funcional para cargas de baja concurrencia.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de cuantizacion, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Valor | Referencia |
|---|---|---|
| Divergencia KL media vs BF16 | 0,0149 | Pasada BF16 en transformers, 12.104 posiciones (en+ko) |
| Coincidencia top-1 vs BF16 | 93,67% | Misma evaluacion |
| Tamano del fichero | 7,41 GB | IQ4_XS-imat |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,5-8 GB con IQ4_XS-imat, incluyendo overhead de contexto y cache KV para ventanas moderadas (el ejemplo usa `-c 8192`).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; A100 y H100 para mayor throughput y concurrencia.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para contexto corto; con 12-16 GB se dispone de margen para contextos mayores.
- Opcion CPU-only: viable gracias al formato GGUF, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior; compatible con aceleracion CUDA y Metal. Otros runners (Ollama, vLLM, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-GGUF (este) | ~13,5B | no disponible | GGUF IQ4_XS-imat (7,41 GB) | Apache 2.0 | Text-only, en/ko, fidelidad top-1 93,67% vs BF16 |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | ~13,5B | no disponible | BF16 safetensors | Apache 2.0 | Modelo base oficial, incluye torre de vision; mayor requisito de VRAM |
| Otros quants GGUF de Ministral 3 14B | ~13,5B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | No se dispone de datos de fidelidad comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo text-only: la torre de vision del BF16 original no esta incluida, por lo que no admite entradas de imagen.
- Idiomas limitados a ingles y coreano segun la model card; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- Perdida de calidad por cuantizacion: aunque el top-1 es del 93,67%, existe un ~6,3% de posiciones donde la prediccion difiere del BF16, lo que puede afectar a tareas sensibles a tokens exactos (codigo, matematicas, JSON estricto).
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Dependencia de version de llama.cpp: requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior; versiones anteriores pueden no cargar correctamente el modelo.
- Licencia Apache 2.0 permite uso comercial, pero Xylolabs no esta afiliada a Mistral AI; para citacion debe referenciarse el release BF16 original.
- Solo se publica un unico quant (IQ4_XS-imat); no hay opciones de mayor o menor precision en este repositorio.
- El repositorio tiene 853 descargas y 0 likes en el momento de la consulta, lo que indica adopcion temprana y poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF
- Modelo base BF16: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia Apache 2.0 del repositorio: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF/blob/main/LICENSE
