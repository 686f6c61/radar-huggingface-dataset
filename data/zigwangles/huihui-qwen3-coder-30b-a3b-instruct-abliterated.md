# zigwangles/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated

# Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated

## Resumen

Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated es una version modificada del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct a la que se le han eliminado los mecanismos de rechazo (refusals) mediante una tecnica de "abliteration". El repositorio publicado bajo el identificador zigwangles reproduce el trabajo original del proyecto huihui-ai, que aplica el metodo de eliminacion de direcciones de rechazo descrito en el repositorio remove-refusals-with-transformers, sin utilizar TransformerLens, y con una variante de ablation mas rapida que, segun el autor, produce mejores resultados.

Se trata de un modelo de generacion de texto orientado a codigo, construido sobre una arquitectura de tipo Mixture of Experts (etiqueta qwen3_moe) con 30.532.122.624 parametros totales almacenados en safetensors y aproximadamente 3.000 millones de parametros activos por token, segun la nomenclatura A3B del modelo base. El repositorio ocupa 61,1 GB, lo que es coherente con pesos en bf16/fp16 sin cuantizar.

Su relevancia es doble. Por un lado, interesa a quien necesita un modelo de codigo sin filtros de contenido para tareas de red teaming, investigacion sobre alineacion o generacion de contenido que los modelos alineados rechazan. Por otro, es un ejemplo practico de como una intervencion quirurgica sobre los pesos puede alterar el comportamiento de seguridad de un modelo sin reentrenamiento, con el coste asociado en calidad y estabilidad que eso implica. El modelo se publica bajo licencia Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-Coder-30B-A3B-Instruct) |
| Tipos de cuantizacion | No se listan cuantizaciones en el repositorio; la model card documenta uso en 4 bits con bitsandbytes. Existe una variante publicada en el registro de Ollama por huihui_ai |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-Coder-30B-A3B-Instruct: un transformer con capas de tipo Mixture of Experts, con 30.532.122.624 parametros totales y un subconjunto reducido de expertos activos por token (del orden de 3.000 millones). Esta configuracion desacopla el coste computacional por token del tamano total de los pesos, de modo que la inferencia es notablemente mas barata que la de un modelo denso del mismo tamano, aunque el modelo completo debe residir en memoria.

El entrenamiento original del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO) no se detalla en la informacion proporcionada. La intervencion especifica de este repositorio no es un reentrenamiento, sino una ablation de direcciones en el espacio de activaciones: se identifican las direcciones asociadas a la generacion de rechazos y se proyectan fuera de los pesos, eliminando la capacidad del modelo de negarse a responder. El autor la describe como una implementacion tosca y de prueba de concepto, realizada con el metodo de remove-refusals-with-transformers y con una variante mas rapida de ablation. La model card del repositorio de zigwangles reproduce literalmente la de huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated, incluido el identificador del modelo en los ejemplos de codigo, lo que indica que se trata de una redistribucion.

La model card documenta el uso del chat template con el parametro `enable_thinking`, lo que confirma que el modelo base conserva el modo de razonamiento explicito de la familia Qwen3. El ejemplo de carga proporcionado usa `BitsAndBytesConfig` con `load_in_4bit=True`, `bnb_4bit_use_double_quant=True` y `llm_int8_enable_fp32_cpu_offload=True`, junto con `device_map="balanced"`, ademas de decodificacion por muestreo con temperatura 0,7, top_k 20, top_p 0,8 y penalizacion por repeticion de 1,2.

## Capacidades

- Generacion de texto y de codigo en ingles, heredada del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Modo de razonamiento explicito (thinking mode) controlable mediante `enable_thinking` en el chat template.
- Conversacion multiturno mediante plantilla de chat (etiqueta conversational).
- Generacion sin rechazos: el modelo no aplica los filtros de contenido del modelo original, por lo que responde a peticiones que el modelo base declinaria.
- Capacidades de codigo del modelo base (generacion, explicacion y modificacion de codigo) en la medida en que la ablation no las haya degradado.
- No se documentan en la informacion proporcionada capacidades de vision, audio, tool calling ni function calling especificas de este modelo.
- Soporte multilingue: solo se declara ingles, aunque el modelo base Qwen3-Coder tiene naturaleza multilingue no confirmada aqui.

## Casos de uso

- Red teaming y evaluacion de seguridad de LLM: el modelo sirve como generador adversario para producir prompts, ataques de inyeccion o contenido que los modelos alineados rechazan, permitiendo probar la robustez de clasificadores y guardrails propios.
- Investigacion sobre alineacion y refusal directions: permite comparar las activaciones y salidas del modelo abliterated frente al modelo base para estudiar donde reside el comportamiento de rechazo y como se propaga por las capas.
- Generacion de codigo en pipelines de CI/CD: puede integrarse en tareas automatizadas de generacion de tests, parches o scripts de build, siempre que el equipo asuma la perdida de garantias de contenido del modelo original.
- Migracion de bases de codigo heredadas: con la ventana de contexto del modelo base, puede procesar fragmentos amplios de codigo para proponer traducciones entre lenguajes o frameworks en tareas por lotes.
- Asistente de programacion en IDE: autocompletado, refactorizacion y explicacion de funciones, aprovechando el bajo coste por token del enrutado MoE para mantener latencias bajas en uso interactivo.
- Generacion de documentacion tecnica y comentarios: a partir de codigo fuente, producir documentacion o descripciones de API sin las restricciones de contenido del modelo original.
- Analisis de seguridad ofensiva autorizado: apoyo en ejercicios de pentesting y analisis de malware en entornos controlados, donde un modelo censurado bloquearia parte de las peticiones.
- Creacion de contenido narrativo o divulgativo sin restricciones tematicas: fiction, escenarios hipoteticos o material educativo que rocen temas sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay datos de calidad comparativa entre el modelo abliterated y su modelo base. No se deben asumir las cifras del modelo base como propias de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados calculados a partir del numero de parametros, no publicados por el autor):
  - bf16/fp16 sin cuantizar: en torno a 61 GB solo para los pesos, mas la cache KV.
  - Cuantizacion de 8 bits: en torno a 31 GB.
  - Cuantizacion de 4 bits: en torno a 16-18 GB, segun el metodo y la longitud de contexto.
- GPU recomendadas:
  - bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB o 2 x RTX 3090/4090 con tensor parallelism).
  - 4 bits: una unica RTX 4090, RTX 3090, L40S o A6000 de 24 GB es suficiente para los pesos, con margen limitado para contexto largo.
- Cabe en GPU de consumo: si, en configuracion de 4 bits sobre GPU de 24 GB. En 8 bits requiere 40-48 GB; en bf16 no cabe en ninguna GPU de consumo individual.
- Opciones de despliegue: `transformers` con cuantizacion bitsandbytes (documentado en la model card, con `device_map="balanced"` y offload a CPU de capas en fp32); Ollama mediante el modelo `huihui_ai/qwen3-coder-abliterated` publicado por huihui_ai; conversion a GGUF para llama.cpp u Ollama a partir de los safetensors. No se confirma en la informacion proporcionada soporte de vLLM, SGLang o TGI para esta revision concreta.
- Latencia y throughput: no disponibles. No se han publicado mediciones. El enrutado MoE con unos 3.000 millones de parametros activos sugiere un coste por token inferior al de un modelo denso de 30B, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (zigwangles) | 30.532.122.624 totales, ~3B activos | MoE (qwen3_moe) | no disponible | en | Apache 2.0 | Repositorio en HuggingFace, 0 descargas, variante en Ollama |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (modelo base) | 30.532.122.624 totales, ~3B activos | MoE (qwen3_moe) | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | Modelo oficial de Qwen |
| huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (origen) | Mismo modelo base | MoE (qwen3_moe) | no disponible | en | Apache 2.0 | Repositorio del proyecto huihui-ai |
| Otras alternativas de codigo del mismo rango | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa con modelos de otros fabricantes |

La comparacion relevante es con el modelo base: comparten arquitectura, numero de parametros y licencia, y la unica diferencia documentada es la eliminacion de los rechazos, con el coste de calidad que ello pueda implicar y que no ha sido cuantificado por el autor.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: la ablation elimina la capacidad de rechazar peticiones. Es inadecuado para aplicaciones de cara al publico sin un sistema de moderacion externo.
- Degradacion de capacidades: la ablation de direcciones en el espacio de activaciones suele afectar a la coherencia, la calidad del codigo y la estabilidad de las respuestas. El autor no publica mediciones de este impacto.
- Riesgo de alucinacion: al ser un modelo de codigo, puede generar APIs, funciones o dependencias inexistentes. La ausencia de evaluacion publicada impide acotar este riesgo.
- Idiomas: solo se declara ingles. El rendimiento en castellano no esta verificado ni respaldado por la model card.
- Longitud de contexto: no declarada en la informacion disponible; no se debe asumir la del modelo base sin verificacion empirica.
- Procedencia y trazabilidad: el repositorio lo publica el usuario zigwangles, pero la model card es la de huihui-ai, incluido el identificador usado en los ejemplos de codigo. Es una redistribucion con documentacion no adaptada, con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin filtros recae en el desplegador. Qwen no respalda las modificaciones de terceros.
- Produccion: no se recomienda su uso en entornos productivos con usuarios finales sin moderacion adicional, evaluacion propia de calidad y una politica clara de uso aceptable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zigwangles/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Repositorio de origen del trabajo (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Variante en Ollama: https://ollama.com/huihui_ai/qwen3-coder-abliterated
- Herramienta de ablation citada en la model card: https://github.com/Sumandora/remove-refusals-with-transformers
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (paper, blog o demo).
