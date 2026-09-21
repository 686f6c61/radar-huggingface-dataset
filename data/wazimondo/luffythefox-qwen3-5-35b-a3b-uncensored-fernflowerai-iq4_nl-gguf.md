# wazimondo/LuffyTheFox-Qwen3.5-35B-A3B-Uncensored-FernflowerAI-IQ4_NL-GGUF

## Resumen

Esta ficha describe una cuantizacion GGUF en formato IQ4_NL del modelo LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI, un derivado afinado del modelo base Qwen/Qwen3.5-35B-A3B. El artefacto lo publica el usuario wazimondo en HuggingFace y su unico proposito es ofrecer los pesos originales en un formato comprimido y listo para motores de inferencia locales como llama.cpp u Ollama. No se trata, por tanto, de un modelo nuevo, sino de una conversion de pesos: la autoria del modelado corresponde a los creadores del modelo base y del afinado, no al publicador de esta cuantizacion.

El dato mas fiable disponible es el recuento de parametros totales, 34.660.610.688 (aproximadamente 34,7 mil millones), que coincide con la nomenclatura "35B" del modelo base. El nombre incluye el sufijo "A3B", propia de las arquitecturas de mezcla de expertos (MoE) con unos 3.000 millones de parametros activos por token, aunque la informacion proporcionada no confirma la arquitectura ni el numero exacto de parametros activos. El repositorio ocupa 20,6 GB, coherente con una cuantizacion de aproximadamente 4,5 bits por peso sobre 34,7 mil millones de parametros.

La relevancia de esta publicacion es practica: permite ejecutar en hardware de consumo o en una unica GPU profesional un modelo de ~35B que en precision completa (bf16) requeriria del orden de 70 GB solo para los pesos. Al mismo tiempo, es un artefacto con cero descargas y cero valoraciones en el momento de la consulta, sin model card tecnica mas alla de las etiquetas de licencia y modelo base, por lo que debe tratarse como material no verificado. La busqueda web realizada no devolvio documentacion tecnica alguna sobre el modelo (los resultados obtenidos eran irrelevantes), de modo que cualquier dato no listado aqui debe considerarse no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. El sufijo "A3B" de la nomenclatura del modelo base sugiere una arquitectura de mezcla de expertos (MoE), pero no esta confirmado |
| Parametros totales | 34.660.610.688 (34,7 mil millones) |
| Parametros activos | No disponible. La nomenclatura "A3B" sugiere aproximadamente 3.000 millones de parametros activos, dato no confirmado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_NL (unica cuantizacion incluida en este repositorio). Etiqueta imatrix, lo que indica que la cuantizacion se ha calibrado con una matriz de importancia |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Autor del repositorio | wazimondo |
| Modelo base declarado | LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI-GGUF y Qwen/Qwen3.5-35B-A3B |
| Tamano del repositorio | 20,6 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion y ultima actualizacion | 2026-09-21 (sin actualizaciones posteriores) |
| Compatibilidad declarada | endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros) en la informacion proporcionada. La model card del repositorio se limita a dos campos de metadatos: la licencia Apache 2.0 y los identificadores de los modelos base, sin descripcion de arquitectura, tokenizador, ventana de contexto ni recetas de entrenamiento. Los resultados de la busqueda web no aportaron documentacion tecnica util (devolvieron contenido ajeno al modelo), por lo que no es posible detallar la composicion del dataset ni el numero de tokens de entrenamiento.

Lo unico verificable es la cadena de derivacion: el modelo base original es Qwen/Qwen3.5-35B-A3B, sobre el que se aplico un afinado publicado como LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI-GGUF, y sobre ese afinado se ha realizado esta conversion a IQ4_NL. El termino "Uncensored" en el nombre indica, en la practica habitual de la comunidad, la eliminacion o atenuacion de los mecanismos de rechazo y alineacion de seguridad del modelo original, pero no hay informacion que documente la tecnica empleada (por ejemplo, abliteration, fine-tuning con datasets sin filtrar o mezcla de pesos). La etiqueta imatrix sugiere, en el plano de la cuantizacion, el uso de una matriz de importancia para preservar los pesos mas sensibles al error de redondeo.

## Capacidades

- No hay informacion verificada sobre capacidades especificas en la documentacion proporcionada. Las capacidades que se enumeran a continuacion son inferencias razonables a partir de las etiquetas del repositorio y de la familia del modelo base, no datos confirmados.
- Conversacion multi-turno: la etiqueta conversational indica que el modelo esta orientado a dialogos.
- Generacion de texto general: es la funcion esperada de un modelo de lenguaje de ~34,7 mil millones de parametros.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que el artefacto puede servirse a traves de APIs compatibles con el ecosistema de HuggingFace.
- Razonamiento y generacion de codigo: probablemente presentes por herencia del modelo base Qwen, sin confirmacion disponible ni datos de evaluacion.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Efecto del afinado "Uncensored": se espera una menor tasa de rechazos ante peticiones que el modelo base declinaria, sin que exista documentacion que lo cuantifique.

## Casos de uso

- Asistente conversacional local: al estar en GGUF y ocupar 20,6 GB, el modelo puede desplegarse en una estacion de trabajo con una GPU de 24 GB y ejecutarse mediante llama.cpp u Ollama para mantener conversaciones multi-turno sin enviar datos a terceros. Apropiado cuando la privacidad del contenido es un requisito.
- Procesamiento por lotes sin conexion: generacion de resumenes, clasificacion o reescritura de grandes volumenes de texto en un servidor on-premise, aprovechando que la cuantizacion IQ4_NL reduce el coste de memoria frente a bf16.
- Investigacion sobre alineacion y seguridad: el caracter "Uncensored" del afinado lo convierte en un objeto de estudio util para medir como varia la tasa de respuestas nocivas o de rechazos respecto al modelo base, siempre en un entorno controlado y con las salvaguardas oportunas.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad de IQ4_NL frente a otras cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) del mismo afinado, usando un conjunto fijo de prompts y midiendo divergencia respecto a los pesos en alta precision. La etiqueta imatrix permite estudiar ademas el efecto de la calibracion por importancia.
- Prototipado de productos con presupuesto de VRAM ajustado: permite validar prompts, flujos y plantillas de chat con un modelo de ~35B antes de decidir si se migra a una instancia mayor o a un proveedor de API.
- Base para experimentos de destilacion o ajuste ligero: al ser un GGUF cuantizado no es adecuado para reentrenamiento, pero puede emplearse como generador de datos sinteticos o como referencia de comportamiento en estudios comparativos.
- Despliegue en entornos air-gapped: la disponibilidad en un unico fichero GGUF facilita su traslado a redes aisladas donde no se permite descargar modelos en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye ninguna tabla de evaluacion, y la busqueda web no devolvio documentacion sobre el modelo base Qwen/Qwen3.5-35B-A3B ni sobre el afinado LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI. No se dispone por tanto de valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni de comparaciones con cuantizaciones alternativas del mismo modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del repositorio (20,6 GB) y del recuento de parametros (34,66 mil millones), no medidas publicadas por el autor.

- VRAM estimada para inferencia: en torno a 21-23 GB con IQ4_NL incluyendo overhead del runtime y una ventana de contexto corta o moderada. El peso de los tensores es de aproximadamente 20 GB; el resto depende de la longitud de contexto y del tamano de la cache KV, que no puede calcularse sin conocer el numero de capas y cabezas de atencion.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090 en su configuracion de 32 GB, A10G de 24 GB): el modelo cabe, con margen limitado en las de 24 GB si se usan contextos largos.
- GPU profesionales (A100 40 GB y 80 GB, H100 80 GB, A6000 48 GB, L40S 48 GB): caben con holgura y permiten contextos amplios y mayor concurrencia.
- GPU de consumo con menos de 24 GB (RTX 4080 16 GB, RTX 4070 Ti 16 GB): no cabe completo; seria necesario descargar capas a CPU y RAM con llama.cpp, con la consiguiente perdida de velocidad. Se estima un requisito de RAM del sistema de al menos 32 GB para esa modalidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son los motores mas directos para GGUF. vLLM y TGI tienen soporte de GGUF limitado o experimental y no estan confirmados para este artefacto; para servirlos en produccion con maxima concurrencia lo habitual seria usar los pesos sin cuantizar o una cuantizacion compatible con esos motores.
- Latencia y throughput estimados: no disponible. Si la arquitectura es efectivamente MoE con ~3.000 millones de parametros activos, el coste computacional por token seria mucho menor que el de un modelo denso de 34,7 mil millones, pero esto no puede confirmarse con la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa funcional con modelos alternativos. La comparacion que sigue se limita a caracteristicas objetivas y verificables dentro de la propia cadena de derivacion.

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este repositorio (wazimondo, IQ4_NL) | 34,66 mil millones | GGUF, IQ4_NL | Apache 2.0 | 0 descargas, 0 valoraciones | Cuantizacion calibrada con imatrix |
| LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI-GGUF | No disponible | GGUF (otras cuantizaciones) | No disponible en la informacion facilitada | Modelo base declarado de esta conversion | Afinado "Uncensored" del modelo Qwen |
| Qwen/Qwen3.5-35B-A3B | 34,66 mil millones (mismo recuento en esta conversion) | Safetensors (pesos originales) | No disponible en la informacion facilitada | Modelo base original | Requiere aproximadamente 70 GB en bf16 |
| Otros modelos MoE de tamano comparable | No disponible | No disponible | No disponible | No disponible | Sin datos proporcionados para comparar |

## Limitaciones y advertencias

- Artefacto no verificado: cero descargas y cero valoraciones en el momento de la consulta, sin model card tecnica. No hay garantia de que la conversion se haya validado correctamente ni de que reproduzca fielmente el comportamiento del modelo original.
- Falta total de documentacion: se desconocen arquitectura exacta, contexto maximo, idiomas, tokenizador y plantilla de chat. Usar una plantilla incorrecta degradara notablemente la calidad de las respuestas.
- Derivado "Uncensored": el nombre del afinado indica la supresion o atenuacion de los mecanismos de rechazo. Esto incrementa el riesgo de generar contenido danino, ilegal o gravemente inapropiado, y es inaceptable en aplicaciones orientadas al publico sin filtros externos adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay datos de evaluacion de fidelidad ni de tasas de error disponibles para este artefacto.
- Perdida por cuantizacion: IQ4_NL es una cuantizacion agresiva (aproximadamente 4,5 bits por peso). Aunque la calibracion con imatrix mitiga el dano, se espera una degradacion medible frente a Q8_0 o a los pesos originales, especialmente en tareas de razonamiento, matematicas y generacion de codigo. No hay mediciones publicadas de esa perdida.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se hereda del modelo base. Debe verificarse de forma independiente que el afinado LuffyTheFox mantiene esa misma licencia y que no impone restricciones adicionales, algo que la informacion disponible no permite confirmar.
- Atribucion: al redistribuir esta cuantizacion conviene conservar la atribucion al modelo base Qwen y al autor del afinado.
- Idiomas: sin declaracion de idiomas soportados, el rendimiento fuera del ingles y del chino puede ser desigual y no esta medido.
- Uso en produccion: no se recomienda desplegar este artefacto en un servicio publico sin evaluacion propia previa, sin filtros de salida y sin una prueba de regresion que compare sus respuestas con las de los pesos originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wazimondo/LuffyTheFox-Qwen3.5-35B-A3B-Uncensored-FernflowerAI-IQ4_NL-GGUF
- Modelo base afinado: https://huggingface.co/LuffyTheFox/Qwen3.5-35B-A3B-Uncensored-FernflowerAI-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-35B-A3B

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo (paper, blog, repositorio o demo). No se dispone de documentacion adicional que enlazar.
