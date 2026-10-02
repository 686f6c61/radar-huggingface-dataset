# tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q8

## Resumen

Este repositorio publica una cuantizacion a 8 bits, en formato MLX, del modelo Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated, un derivado "abliterated" (es decir, con los comportamientos de rechazo eliminados mediante intervencion sobre las direcciones de activacion) de un modelo Qwen3.5 de 35B con nomenclatura A3B. El autor de la cuantizacion es el usuario tstepspam, mientras que el modelo de partida procede de huihui-ai y, en ultima instancia, de una destilacion de razonamiento de Jackrong. Los pesos safetensors suman 34.660.608.768 parametros (unos 34,66 mil millones) y ocupan aproximadamente 36,8 GB en el repositorio.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de la cadena tipica del ecosistema abierto: destilacion de trazas de razonamiento (chain-of-thought) de un modelo propietario, abliteracion posterior y cuantizacion final para hardware de consumo. Por otro, es una publicacion muy reciente y practicamente sin traccion: cero descargas y cero "likes" en el momento de redactar esta ficha, sin model card tecnica mas alla de metadatos minimos.

Conviene subrayar que la informacion disponible es muy escasa. La model card no documenta arquitectura, contexto, idiomas, dataset de entrenamiento ni resultados de evaluacion, y las etiquetas del repositorio son contradictorias entre si ("qwen3_5_moe" frente a "Dense"). Todo lo que figura a continuacion procede de los metadatos del repositorio y de los modelos base declarados; el resto se marca explicitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio "qwen3_5_moe" apunta a una mezcla de expertos, pero el mismo repositorio incluye tambien la etiqueta "Dense"; la model card no lo aclara |
| Parámetros totales | 34.660.608.768 (34,66 B) segun los pesos safetensors |
| Parámetros activos | Aproximadamente 3 B segun la nomenclatura "A3B" del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (Q8, segun el sufijo del nombre y la etiqueta "8-bit"). El repositorio solo publica esta cuantizacion |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio esta vacio) |
| Licencia | apache-2.0. El campo license_link apunta al fichero LICENSE de Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled |
| Formato de pesos | safetensors, cuantizados para el runtime MLX (library_name: mlx) |
| Tamaño del repositorio | 36,8 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated |
| Pipeline | text-generation |
| Fecha de publicacion | 2 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada sobre arquitectura ni entrenamiento en la model card de este repositorio, que se limita a metadatos. Por la ruta de dependencias declarada puede reconstruirse la cadena de derivacion: un modelo Qwen3.5-35B-A3B (35B totales, nomenclatura A3B) fue destilado con trazas de razonamiento de Claude 4.6 Opus por Jackrong; huihui-ai aplico despues una abliteracion sobre ese modelo, y tstepspam ha generado una cuantizacion a 8 bits en formato MLX. No se especifica el volumen de tokens de destilacion, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO.

La abliteracion es una tecnica de edicion de pesos que identifica la direccion de activacion asociada al comportamiento de rechazo y la proyecta fuera de la matriz de pesos, con el objetivo de suprimir las negativas del modelo sin reentrenar. Es una intervencion relativamente barata, pero degrada la calibracion del modelo y elimina una capa de seguridad alineada, ademas de poder afectar a capacidades generales. La cuantizacion a 8 bits en MLX es una conversion post-entrenamiento; MLX es el framework de Apple para ejecucion en silicio unificado, de modo que este repositorio esta pensado para Mac con chips de la serie M. No se documenta decodificacion especulativa, atencion lineal ni ninguna otra innovacion de inferencia.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: text-generation; etiquetas "conversational" y "text-generation").
- Razonamiento con cadena de pensamiento explicita, segun las etiquetas "reasoning" y "chain-of-thought" heredadas del modelo destilado.
- Comportamiento "uncensored"/"abliterated": el modelo no aplica los rechazos tipicos de un modelo alineado. Esto es una capacidad declarada, no una garantia de calidad.
- Soporte de tool calling o function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible. La etiqueta de razonamiento sugiere cierto uso en cadena, pero no hay documentacion al respecto.
- Capacidades multilingues: no disponible. El campo de idiomas esta vacio y no hay evaluacion por idioma.
- Vision, audio o modalidades adicionales: no disponible; el repositorio es exclusivamente de texto.
- Ejecucion nativa en Apple Silicon mediante MLX, que es la aportacion concreta de este repositorio frente al modelo base.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX permite cargar el modelo en un Mac Studio o MacBook Pro de gama alta sin GPU dedicada, algo inviable con los pesos en BF16 del modelo base (unos 69 GB). Es el caso de uso principal de este repositorio.
- Investigacion sobre alineacion y abliteracion: comparar las respuestas de este modelo con las del modelo base no abliterado permite medir empiricamente que comportamientos se pierden y cuales se alteran al proyectar fuera la direccion de rechazo.
- Analisis de contenido sensible con fines de moderacion: al no rechazar peticiones, el modelo puede usarse para clasificar, etiquetar o auditar texto problematico en un pipeline interno, tarea en la que un modelo alineado suele negarse. Requiere supervision humana y registro de uso.
- Escritura creativa y ficcion sin filtros: narrativa con violencia, contenido adulto o tematicas delicadas en un entorno privado y local, donde el usuario asume la responsabilidad editorial del resultado.
- Generacion de razonamiento sintetico para destilacion: dado el origen del modelo, puede emplearse para producir trazas de chain-of-thought que sirvan de dato de entrenamiento para modelos mas pequenos, filtrando despues por correccion.
- Experimentacion en red teaming de modelos: generar prompts adversarios y estudiar como responde una variante abliterated frente a la version alineada, como parte de una evaluacion de seguridad documentada.
- Analisis de texto en local con requisitos de privacidad: al ejecutarse integramente en el dispositivo, el contenido no sale del equipo, lo que encaja en flujos con datos personales o confidenciales que no pueden enviarse a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y tampoco hay mediciones de latencia o throughput aportadas por el autor. Cualquier cifra de rendimiento de este repositorio seria una extrapolacion y no debe presentarse como dato verificado.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 34,7 GB (el repositorio completo ocupa 36,8 GB). Hay que sumar la memoria de la cache KV, que crece con la longitud de contexto.
- Memoria unificada minima practica: 48 GB, recomendable 64 GB o mas en Apple Silicon para dejar margen a la cache KV y al propio sistema operativo.
- Hardware compatible: exclusivamente Apple Silicon (serie M). El formato MLX no se ejecuta en GPU NVIDIA, AMD ni Intel mediante los runtimes habituales; requeriria una conversion previa a otro formato, no incluida en el repositorio.
- Cabe en GPU de consumo: no con el formato publicado. Para GPUs de 24 GB (RTX 4090, 3090) haria falta una cuantizacion a 4 bits que este repositorio no ofrece, ademas de conversion a GGUF o a safetensors estandar.
- Opciones de despliegue: mlx-lm (generacion por linea de comandos y servidor compatible con la API de OpenAI) y cualquier cliente que soporte el motor MLX. No se proporcionan pesos en GGUF, por lo que llama.cpp u Ollama no pueden consumirlo tal cual.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor. Como referencia puramente teorica, un modelo denso de 34,7 GB en 8 bits queda limitado por el ancho de banda de memoria unificado (del orden de 400 GB/s en un M3 Max), lo que situaria el techo en torno a once tokens por segundo; si realmente se trata de una mezcla de expertos con unos 3 B activos, el techo practico seria notablemente superior, pero depende por completo de la implementacion de MLX y no esta verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q8 | 34,66 B totales (activos no confirmados, ~3 B por nomenclatura) | No disponible | 8 bits | apache-2.0 | safetensors MLX | 0 descargas, 0 likes |
| huihui-ai/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated (modelo base) | No disponible | No disponible | BF16 (sin cuantizar) | No disponible | safetensors | No disponible |
| Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled (origen de la destilacion) | No disponible | No disponible | BF16 (sin cuantizar) | La licencia enlazada por este repositorio | safetensors | No disponible |

No se dispone de informacion suficiente sobre modelos alternativos de la misma categoria (mismo tamano, misma tarea o mismo nicho de modelos abliterated) como para establecer una comparacion con datos verificables. Cualquier tabla comparativa adicional requeriria consultar las model cards de esos modelos, que no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos del modelo. Esto implica que puede generar contenido danino, ilegal o gravemente inapropiado sin filtros, y que no debe exponerse como servicio publico sin una capa de moderacion externa.
- La abliteracion suele degradar la calibracion y la coherencia del modelo en tareas generales, aunque no hay evaluaciones publicadas que cuantifiquen esa perdida en este caso concreto.
- Riesgo elevado de alucinacion: no se ha publicado ningun benchmark de veracidad, y el modelo es una destilacion de razonamiento de un tercero, lo que tiende a producir cadenas de pensamiento plausibles pero factualmente incorrectas.
- La model card es practicamente inexistente: sin contexto documentado, sin idiomas, sin datos de entrenamiento y con etiquetas contradictorias sobre la arquitectura ("MoE" frente a "Dense"). Cualquier uso en produccion exige una evaluacion propia previa.
- La licencia declarada es apache-2.0, pero el campo license_link apunta al fichero de licencia de otro repositorio (Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Explanation-Reasoning-Distilled). Es imprescindible verificar que la licencia del modelo base y de la destilacion permite el uso comercial antes de desplegarlo, ya que el nombre hace referencia a un modelo propietario de Anthropic y las condiciones de los datos de destilacion son, como minimo, discutibles.
- "Claude-4.6-Opus" en el nombre es una referencia al origen de las trazas de destilacion, no implica ninguna afiliacion ni respaldo de Anthropic.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon. No hay pesos GGUF ni safetensors estandar, lo que descarta GPU NVIDIA o AMD sin una conversion adicional.
- Traccion nula: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- Un modelo de 34,7 GB en 8 bits con posible decodificacion lenta en hardware de consumo limita su uso a escenarios por lotes o interactivos de baja concurrencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q8
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated
- Origen de la destilacion y fichero de licencia enlazado: https://huggingface.co/Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Fichero de licencia referenciado: https://huggingface.co/Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled/blob/main/LICENSE
- Directorio de modelos abliterated y sin censura: https://modelheretic.com/

Nota sobre la busqueda web: los resultados obtenidos incluian en su mayoria paginas sin relacion alguna con el modelo (sitios de contenido para adultos) que no se han incluido por no ser fuentes tecnicas relevantes.
