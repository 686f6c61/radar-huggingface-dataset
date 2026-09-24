# STL1te/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE-OfficialMTP

## Resumen

STL1te/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE-OfficialMTP es una version cuantizada y "abliterated" (sin mecanismos de rechazo) de un modelo de la familia Qwen, publicada por el usuario STL1te en HuggingFace. Se trata de un derivado del repositorio lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE, del que hereda la arquitectura y sobre el que se anade un modulo MTP (multi-token prediction) orientado a decodificacion especulativa. Los tags del repositorio la identifican como arquitectura MoE (mixture of experts) con soporte de vision y lenguaje, function calling y razonamiento.

El modelo se distribuye ya cuantizado en NVFP4 con componentes en FP8 (PLE) y pesos en formato safetensors, empaquetados mediante compressed-tensors. La unica libreria de inferencia declarada es vLLM, lo que indica que el repositorio esta pensado para despliegue en servidor y no para consumo directo con llama.cpp u Ollama en el momento de su publicacion.

La relevancia de esta ficha es limitada por la ausencia de informacion tecnica publicada: no se declaran parametros totales ni activos, longitud de contexto, idiomas, licencia concreta ni resultados de benchmarks. El repositorio registra 0 descargas y 1 like, con fecha de creacion y ultima actualizacion identicas (2026-09-24), por lo que se trata de una publicacion reciente y sin validacion comunitaria. Cualquier evaluacion en produccion deberia hacerse tras auditar el modelo base y el proceso de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como MoE, mixture of experts, en los tags del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos principales), FP8 (componente PLE), 8 bits; empaquetado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | "other" (tag license:other); terminos concretos no disponibles |
| Formato de pesos | safetensors |
| Tipo de modelo | image-text-to-text (vision-language) |
| Modelo base | lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE (a su vez derivado de un modelo Qwen) |
| Libreria de inferencia | vLLM |
| Tecnicas declaradas | MTP (multi-token prediction), speculative decoding, abliterated/uncensored |
| Descargas / likes | 0 / 1 |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura concreta, el numero de parametros, la composicion del dataset de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros) del modelo base. Los tags del repositorio permiten afirmar unicamente que se trata de un transformer con capas de mixture of experts (MoE) y capacidades de vision y lenguaje, y que incorpora un modulo MTP para decodificacion especulativa. El sufijo "OfficialMTP" sugiere que este modulo se distribuye junto con los pesos principales en lugar de como componente separado, aunque el repositorio no detalla su configuracion.

La innovacion tecnica mas destacable es la combinacion de cuantizacion NVFP4 (formato de 4 bits con escala en FP8 disenado para GPUs NVIDIA de generacion Blackwell) con un componente en FP8 y con decodificacion especulativa basada en MTP. El caracter "abliterated" implica que se ha aplicado alguna tecnica de ablacion de la direccion de rechazo sobre el modelo original, lo que elimina o reduce los comportamientos de negativa, pero tambien altera el perfil de seguridad del modelo. No se especifica que metodo de ablacion se ha utilizado ni en que fase del pipeline de cuantizacion se aplico.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational".
- Razonamiento explicito (tag "reasoning"); no se especifica si existe un modo de pensamiento separado ni como se activa.
- Function calling y tool calling (tag "function-calling"), lo que permite integracion en agentes y pipelines con herramientas externas.
- Capacidades de vision y lenguaje: el pipeline declarado es image-text-to-text, por lo que acepta imagenes como entrada junto con texto.
- Generacion de codigo: no declarada explicitamente en los tags, por lo que no puede confirmarse como capacidad verificada.
- Multilingue: no disponible; el repositorio no declara idiomas soportados.
- Decodificacion especulativa nativa mediante MTP, orientada a reducir la latencia de generacion en entornos compatibles (vLLM).
- Ausencia de rechazos por contenido (uncensored/abliterated): el modelo no aplicara negativas tipicas de seguridad, lo que es una capacidad funcional y a la vez un riesgo.

## Casos de uso

- Extraccion de informacion de documentos escaneados: al ser un modelo image-text-to-text, puede recibir facturas, albaranes o formularios como imagen y devolver campos estructurados en JSON mediante function calling, reduciendo la necesidad de un pipeline OCR separado.
- Agentes autonomos con herramientas: el soporte de function calling y razonamiento permite construir bucles de razonamiento multi-paso donde el modelo decide que herramienta invocar, interpreta el resultado y continua la tarea.
- Generacion de codigo asistida en pipelines de CI/CD: integrado via vLLM como endpoint interno, el modelo puede revisar diffs, generar tests o proponer parches, invocando herramientas de build y test a traves de tool calling. La calidad real en codigo no puede confirmarse sin benchmarks publicados.
- Generacion de datos sinteticos para fine-tuning: su condicion de modelo sin censura lo hace util para producir datasets diversos en dominios donde un modelo alineado rechazaria generar contenido (por ejemplo, dialogos sobre temas sensibles, datos de seguridad ofensiva o escenarios de ficcion explicita), siempre que se cumplan los requisitos legales aplicables.
- Investigacion en seguridad y alineacion: como modelo abliterated, sirve como objeto de estudio para analizar que representa internamente la direccion de rechazo, comparar activaciones frente al modelo alineado original y evaluar la robustez de las tecnicas de ablacion.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con contexto de imagenes (capturas de pantalla de errores, fotos de producto) y llamar a APIs internas de pedidos o incidencias. La ventana de contexto real es no disponible, por lo que la longitud de las conversaciones soportadas debe medirse en pruebas antes de desplegar.
- Analisis visual asistido en entornos tecnicos: interpretacion de planos, esquemas o capturas de dashboards junto con una pregunta en lenguaje natural, devolviendo una descripcion estructurada o una llamada a una herramienta de monitorizacion.
- Servicio de inferencia de baja latencia en vLLM: el modulo MTP permite decodificacion especulativa dentro de vLLM, lo que en teoria reduce el tiempo por token en cargas de generacion larga; el throughput real no esta documentado y debe medirse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No puede calcularse sin conocer el numero de parametros totales y activos, dato que el repositorio no publica.
- Formatos de cuantizacion y compatibilidad: los pesos NVFP4 requieren kernels con soporte nativo de ese formato, disponible en GPUs NVIDIA de generacion Blackwell. El componente FP8 requiere soporte de FP8 en hardware (generaciones Hopper o posteriores, y Ada en el caso de algunas tarjetas).
- GPU recomendadas: no disponible a nivel de modelo. Como referencia de formato, NVFP4 esta pensado para GPUs de centro de datos Blackwell (serie B200 y equivalentes) y para GPUs consumer de la generacion correspondiente; FP8 es viable en H100, H200 y L40S.
- Encaje en GPU de consumo: no confirmable. Depende enteramente del numero de parametros, que no se ha publicado. La cuantizacion de 4 bits reduce el peso, pero una arquitectura MoE con vision puede requerir VRAM adicional para el encoder visual y las activaciones.
- Opciones de despliegue: vLLM es la unica libreria declarada en el repositorio. No se indica soporte de llama.cpp, Ollama, TGI ni TensorRT-LLM; la conversion a GGUF no esta documentada.
- Decodificacion especulativa: el modulo MTP esta disenado para integrarse en el motor de inferencia y reducir la latencia de decodificacion, pero no se publican cifras de tokens por segundo, tiempo hasta el primer token ni factor de aceleracion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STL1te/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE-OfficialMTP | no disponible | no disponible | NVFP4 + FP8 | other | HuggingFace, 0 descargas |
| lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE (modelo base) | no disponible | no disponible | NVFP4 + FP8 | no disponible | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa tecnica rigurosa. El unico modelo con el que puede compararse directamente es su base declarada, lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE, del que este repositorio se diferencia por incorporar el modulo MTP denominado "OfficialMTP". Cualquier comparacion con otros modelos MoE multimodales de la familia Qwen requeriria los parametros y el contexto del modelo base, que no estan publicados en esta ficha.

## Limitaciones y advertencias

- Modelo abliterated: la ablacion de la direccion de rechazo implica que el modelo no aplicara negativas ante peticiones daninas, ilegales o eticas. Esto lo hace inadecuado para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad ni de tasa de alucinacion. Como en cualquier modelo generativo, las salidas deben verificarse, especialmente en dominios factuales y en extraccion de datos.
- Perdida de capacidades por la cuantizacion: la combinacion de NVFP4 con FP8 puede degradar ligeramente la calidad frente al modelo en precision completa. No se documenta ninguna evaluacion de la degradacion introducida.
- Sin datos de contexto ni idiomas: se desconoce la ventana de contexto maxima util y el soporte multilingue real, lo que impide dimensionar aplicaciones de contexto largo o de idiomas distintos del ingles.
- Licencia ambigua: el tag indica "other" sin especificar terminos. Antes de cualquier uso comercial es imprescindible localizar el texto de licencia y verificar la cadena de dependencias (modelo base, autor original de la familia Qwen y autor de la cuantizacion).
- Procedencia en cadena: al ser un derivado de un derivado, los terminos aplicables pueden acumularse y las obligaciones de atribucion pueden recaer en varios autores.
- Sin validacion comunitaria: 0 descargas y 1 like en el momento de la consulta. No hay issues, discusiones ni reportes independientes que confirmen que los pesos cargan correctamente o que las capacidades declaradas se cumplen.
- Fecha de publicacion en el futuro respecto a referencias habituales: el repositorio figura creado el 2026-09-24, un dato a tener en cuenta al evaluar su vigencia y la de sus dependencias.
- Modulo MTP no documentado: se desconoce como activar la decodificacion especulativa en vLLM, que parametros de muestreo requiere y que factor de aceptacion ofrece.
- Sin garantias de soporte: al no haber documentacion tecnica adjunta, cualquier integracion en produccion requerira ingenieria inversa de la configuracion y pruebas propias de carga, latencia y calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/STL1te/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE-OfficialMTP
- Modelo base declarado: https://huggingface.co/lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la informacion disponible.
