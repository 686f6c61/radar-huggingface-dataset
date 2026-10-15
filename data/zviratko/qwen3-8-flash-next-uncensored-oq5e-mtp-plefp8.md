# zviratko/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp-plefp8

## Resumen

El modelo `zviratko/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp-plefp8` es un artefacto de pesos cuantizados para el ecosistema MLX de Apple, derivado directamente de `mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp`. Se trata de una variante experimental publicada por el usuario zviratko que toma la cuantizacion oQ5e (5 bits) del modelo base y le injerta una tabla n-gram PLE (probabilistic lookup embedding) almacenada en FP8, con el objetivo de reducir la perdida de informacion respecto a la tabla original. El propio autor advierte que el efecto real de esta sustitucion es desconocido y que se trata de un experimento abierto a retroalimentacion.

El modelo subyacente pertenece a la familia Qwen3.8 Flash Next, una arquitectura de mezcla de expertos (MoE) entrenada por Alibaba, en su variante "Uncensored" (abliterated), es decir, con el comportamiento de rechazo eliminado de los pesos por la comunidad. Segun la ficha de HuggingFace, el pipeline declarado es `image-text-to-text`, lo que implica capacidades multimodales de vision ademas de generacion de texto, y entre sus etiquetas figuran `tool-calling`, `mtp` (multi-token prediction) y `qwen4_exp`.

La relevancia actual de esta publicacion es limitada pero tecnica: se trata de un experimento de cuantizacion sobre un modelo grande (los safetensors declaran 179.999.981.459 parametros totales) orientado a ejecucion local en hardware Apple Silicon. El repositorio tiene 0 descargas y 0 likes en el momento del analisis, y su tamano en disco es de 141,4 GB, lo que lo situa fuera del alcance de cualquier GPU de consumo convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun fuentes secundarias; no confirmado de forma explicita en la ficha del autor |
| Parametros totales | 179.999.981.459 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (esquema oQ5e) con tabla PLE en FP8; el nombre del repo indica tambien MTP |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace, con terminos comerciales adicionales) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Las fuentes secundarias consultadas describen el modelo base Qwen3.8 Flash Next Uncensored como un modelo de mezcla de expertos (MoE) de 125B, si bien los safetensors del repositorio declaran 179.999.981.459 parametros totales. Esta discrepancia no se resuelve con la informacion disponible y conviene tratarla con cautela: podria deberse a que el recuento de safetensors incluye componentes adicionales (por ejemplo, torres de vision o cabezas auxiliares) o a imprecisiones en las cifras publicadas por terceros.

El modelo es una cuantizacion, no un entrenamiento nuevo. El autor indica que los pesos proceden de `mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp` y que se ha trasplantado en ellos una tabla PLE (probabilistic lookup embedding) en precision FP8. Segun la model card, el modelo "pasa los benchmarks de inteligencia con resultados efectivamente identicos al modelo cuantizado original y es subjetivamente coherente", pero no se aportan cifras. La etiqueta `mtp` sugiere soporte de multi-token prediction, tecnica de decodificacion que permite predecir varios tokens por paso y acelerar la inferencia. No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni procesos de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (`conversational`).
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), es decir, capacidades de vision.
- Soporte de tool calling / function calling, segun las etiquetas del repositorio.
- Decodificacion con multi-token prediction (MTP), orientada a acelerar la generacion.
- Comportamiento "uncensored": los pesos han sido modificados para eliminar los rechazos del modelo original.
- Cuantizacion de 5 bits con tabla PLE en FP8, pensada para reducir el uso de memoria manteniendo la coherencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Ejecucion local en estaciones de trabajo Apple Silicon: el formato MLX y el esquema de cuantizacion de 5 bits estan disenados para aprovechar la memoria unificada de los chips M-series, permitiendo servir el modelo sin depender de GPUs NVIDIA.
- Analisis de documentos con imagenes: gracias al pipeline `image-text-to-text`, puede emplearse para extraer informacion de capturas, diagramas o formularios escaneados y devolver descripciones o datos estructurados.
- Agentes con llamada a herramientas: el soporte de `tool-calling` permite integrarlo en flujos donde el modelo decide que API invocar (busqueda web, calculadora, bases de datos) dentro de un bucle de razonamiento multi-paso.
- Investigacion sobre cuantizacion: es un artefacto util para estudiar el impacto de sustituir tablas de embedding por versiones en FP8 menos lossy, comparando perplejidad y coherencia frente al modelo base.
- Generacion creativa sin restricciones tematicas: el caracter "uncensored" lo hace apto para escritura de ficcion o escenarios donde los modelos alineados rechazan contenidos, siempre que se cumplan los requisitos legales aplicables.
- Prototipado de asistentes conversacionales offline: al ejecutarse localmente, permite construir asistentes que no envian datos a servicios externos, relevante en entornos con requisitos de privacidad.
- Aceleracion de inferencia con MTP: util en escenarios de generacion larga donde la prediccion multi-token reduce el coste por token frente a la decodificacion autoregresiva clasica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card se limita a afirmar que el modelo "pasa los benchmarks de inteligencia con resultados efectivamente identicos al modelo cuantizado original", sin aportar cifras de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y sin especificar que conjuntos de evaluacion se han utilizado. Las guias de despliegue local encontradas en la busqueda web mencionan benchmarks sobre GPU de 8 GB, pero no ofrecen resultados aplicables a este artefacto concreto.

## Requisitos de hardware

- El repositorio ocupa 141,4 GB, por lo que los pesos en disco requieren al menos esa capacidad de almacenamiento.
- Para cargar el modelo en memoria se necesita una maquina con memoria unificada de 192 GB o superior (Mac Studio con M2 Ultra, M3 Ultra o configuraciones equivalentes). Con menos memoria, la carga fallara o forzara un swapping severo.
- No cabe en GPUs de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar estos pesos. Tampoco una A100 de 80 GB en configuracion de una sola GPU.
- El backend es MLX, lo que restringe el despliegue a Apple Silicon; no es directamente compatible con vLLM, TGI ni llama.cpp sin una conversion previa a GGUF.
- Para GPUs NVIDIA seria necesario recurrir a las variantes GGUF del modelo base, como `cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF`, ejecutables con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.
- Opciones de despliegue confirmadas: biblioteca MLX y el entorno oMLX al que alude la etiqueta `omlx`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp-plefp8 | 179.999.981.459 segun safetensors | no disponible | 5 bits oQ5e + PLE FP8 | qwen-community-1.0 | MLX (Apple Silicon) |
| mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp | no disponible | no disponible | 5 bits oQ5e | no disponible | MLX (Apple Silicon) |
| zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8 | no disponible | 100K segun el nombre del repo | 4 bits + PLE FP8 | no disponible | MLX (Apple Silicon) |
| cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF | no disponible | no disponible | IQ4_XS, NGQ4 | no disponible | GGUF (llama.cpp, Ollama) |

La diferencia principal entre las variantes de zviratko es el nivel de cuantizacion (oQ5e frente a oQ4e) y, en el caso del modelo oQ4e, una posible ampliacion de contexto a 100K segun el nombre del repositorio. Frente a la variante GGUF de cygnal, la diferencia es de ecosistema: MLX para Apple Silicon frente a GGUF para hardware mas heterogeneo. No se dispone de comparativas de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo experimental: el propio autor declara que el efecto de la tabla PLE en FP8 "es desconocido" y califica la publicacion como un experimento. No deberia usarse en produccion sin una evaluacion propia.
- Sin traccion comunitaria: 0 descargas y 0 likes, sin validacion independiente de calidad o estabilidad.
- Ambiguedad de licencia: la model card senala que el repositorio fuente incluye la Qwen Community License 1.0 con terminos comerciales adicionales, mientras que la model card original del modelo base estaba etiquetada como Apache-2.0. Esa discrepancia debe resolverse antes de cualquier uso o redistribucion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de una cuantizacion agresiva de 5 bits, es esperable cierto deterioro frente a los pesos en precision completa, aunque el autor afirma que los benchmarks no se degradan.
- Naturaleza "uncensored": la eliminacion de los rechazos incrementa el riesgo de generar contenido danino, ilegal o socialmente inapropiado. Requiere filtros externos si se expone a usuarios finales.
- Sesgos: no disponibles. Al ser una variante no alineada del modelo base, los sesgos presentes en los datos originales se mantienen y pueden manifestarse sin las mitigaciones habituales.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingue sin pruebas.
- Longitud de contexto: no disponible en la ficha del autor; la variante oQ4e sugiere 100K, pero no se puede extrapolar a este artefacto.
- Restriccion de plataforma: al ser pesos MLX, no se ejecuta en GPUs NVIDIA ni AMD sin conversion, lo que limita su uso en infraestructura de servidores convencional.
- Requisito de memoria muy alto (192 GB o mas), lo que excluye la mayoria de equipos de desarrollo individuales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp-plefp8
- Modelo base: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Variante oQ4e-100K: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP-plefp8
- Variante GGUF de la comunidad: https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de despliegue local (kongchang.com): https://kongchang.com/en/articles/qwen3-8-flash-next-uncensored-model-local-deployment-guide-running-llms-on-an-8gb-gpu
- Guia de ejecucion local (Atomic Chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-uncensored-locally
- Fichero de licencia incluido en el repositorio: LICENSE (relativo al repositorio de HuggingFace)
