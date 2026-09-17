# velilu/Qwen3.8-27B-TURBO-Fable-Coder-GGUF

## Resumen

velilu/Qwen3.8-27B-TURBO-Fable-Coder-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario velilu a partir del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. No es un entrenamiento original del autor del repositorio, sino una redistribución cuantizada (cuantizaciones "regular" y "MTP", con imatrix dual) de un fine tune multi-etapa y multi-merge de 26.895.998.464 parámetros (unos 26,9B) construido sobre la familia Qwen 3.x de 27B. El pipeline declarado es image-text-to-text, lo que indica soporte de entrada de imagen ademas de texto.

El modelo base se presenta en su model card como un fine tune orientado a tres objetivos simultaneos: aumentar la capacidad de razonamiento, reducir de forma drastica los tokens de "thinking" (entre la mitad y hasta una decima parte, con una reduccion mediana aproximada de dos tercios) y acelerar la generacion, en particular mediante MTP (multi-token prediction). Los tags del repositorio lo etiquetan como heretic, abliterated y uncensored, es decir, con los mecanismos de rechazo y censura eliminados o muy reducidos, y lo posicionan para escritura creativa, ficcion, roleplay y codigo.

Su relevancia practica es doble: por un lado comprime un modelo de ~27B en formatos GGUF de 4 y 8 bits ejecutables en hardware de consumo; por otro, la model card afirma que es el primer modelo de este tamano en superar 730 puntos de ARC-C en 8 bits (735) y 880 de ARC-E, ademas de 719 de ARC-C en 4 bits. Estas cifras son afirmaciones del autor del modelo base y no se acompanan de una tabla de benchmarks completa en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Fine tune multi-etapa y multi-merge sobre la familia Qwen 3.x de 27B; pipeline declarado image-text-to-text |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica segun la informacion disponible (no se describe una arquitectura MoE para este modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF "regular" y GGUF "MTP" (MTP GGUF Quants), con imatrix dual (DI-MATRIX); se mencionan explicitamente variantes de 4 bits (Q4_K_S) y de 8 bits, ademas de pesos en bfloat16 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el dato de parametros procede de safetensors; el modelo base declara bfloat16 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna (atencion, capas, tipo de normalizacion ni si emplea atencion lineal o hifrida). Lo que si se detalla es el proceso de construccion: se trata de un fine tune multi-etapa, multi-fine tune y multi-stage merge, desarrollado con las tecnicas que el autor denomina COLD FUSION (metodo "GAIN" combinado con los entrenadores de Unsloth, ejecutado en hardware de consumo) y "Fable Fusion 711". El metodo GAIN, segun la model card, modifica dinamicamente el entrenamiento muestra a muestra en tiempo real segun el modelo va aprendiendo. Tambien se menciona el uso de tecnicas "heretic"/abliterated para eliminar comportamientos de rechazo, y una fase de reformateo del bloque de pensamiento.

Los objetivos declarados del entrenamiento son: incrementar la inteligencia general y la resolucion de problemas, reducir el tamano del bloque de thinking (mediana de reduccion de aproximadamente dos tercios, con casos de hasta una decima parte), reformatear y mejorar ese bloque, acelerar la generacion de tokens (especialmente con MTP), mantener la compatibilidad de las mejoras con los tres modos de pensamiento del modelo y evitar explicitamente el "benchmaxing". Los datasets citados en los metadatos son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se indica el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto general y conversacion multi-turno (tag conversational).
- Razonamiento explicito con modo "thinking" y tres modos de operacion declarados, con bloques de pensamiento mas cortos que el modelo de referencia.
- Generacion de codigo (tags coder y NEO-CODER MAX en el nombre del repositorio).
- Escritura creativa, ficcion, narrativa de todos los generos y roleplay.
- Tool calling / function calling: la model card remite a la pestana "community" para resultados de terceros que, segun el autor, incluyen el mejor rendimiento de tool calling registrado. No se aportan cifras ni metodologia en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos de idioma.
- Entrada de imagen: el pipeline declarado es image-text-to-text, lo que implica soporte de imagenes ademas de texto.
- Prediccion multi-token (MTP) para acelerar la decodificacion, con cuantizaciones especificas etiquetadas como MTP.
- Ejecucion en hardware de consumo gracias a las cuantizaciones GGUF de 4 y 8 bits.
- Modo sin censura (uncensored / abliterated): el modelo no aplica los rechazos tipicos del modelo original.

## Casos de uso

- Escritura creativa y ficcion asistida: el modelo esta ajustado especificamente para generacion narrativa en todos los generos, con ejemplos de arranque de relatos en la propia model card; resulta adecuado cuando se necesita prosa larga con gancho narrativo y sin filtros de contenido.
- Roleplay y personajes persistentes: los tags de roleplaying y conversational, junto con el ajuste anti-censura, permiten mantener personajes con voces consistentes en conversaciones multi-turno sin que el modelo rompa el personaje por politicas de contenido.
- Generacion de codigo en pipelines de desarrollo: puede integrarse en asistentes de IDE o en revision de codigo, con soporte declarado de tool calling para invocar funciones, ejecutar tests o consultar documentacion.
- Agentes multi-paso: el modo thinking mas el soporte de function calling permiten construir agentes que planifican, llaman herramientas y verifican resultados; la reduccion de tokens de pensamiento declarada abarata el coste por tarea frente al modelo base.
- Despliegue local en estacion de trabajo: al estar en GGUF de 4 bits, se puede ejecutar con llama.cpp u Ollama en una GPU de consumo, lo que habilita asistentes privados sin enviar datos a la nube.
- Generacion de documentacion tecnica y articulos: el pipeline image-text-to-text permite adjuntar capturas o diagramas y pedir descripciones o documentacion derivada de ellos.
- Prototipado rapido de producto con coste bajo: las cuantizaciones de 8 bits ofrecen la mayor calidad declarada (ARC-C 735) y las de 4 bits (ARC-C 719) permiten servir muchas mas peticiones concurrentes por GPU.
- Servicio bilingue ingles-chino: util para atencion al cliente o localizacion en esos dos mercados, sin cobertura declarada para castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. Los unicos datos numericos aportados por la model card son afirmaciones del autor del modelo base, sin metodologia ni tabla de evaluacion:

| Metrica | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Primer modelo del segmento en superar 730 segun el autor |
| ARC-C (4 bits) | 719 | Supera 718 en 4 bits |
| ARC-E | Mas de 880 | Zona que el autor atribuye a modelos cerrados de OpenAI, Claude y Gemini |
| ARC-C del modelo base Qwen 3.8 27B | 591 (derivado) | La model card afirma 144 puntos mas, es decir 735 - 144 |
| Comparacion con Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Superior en los 7 benchmarks "criticos" | Sin cifras ni listado de los 7 benchmarks |

No se aportan resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de tool calling. La afirmacion sobre el mejor rendimiento de tool calling registrado remite a la pestana "community", fuera de la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritmeticas derivadas del numero de parametros (26,9B), no datos publicados por el autor.

- VRAM estimada para inferencia: unos 54 GB en bfloat16; unos 27-30 GB en 8 bits; unos 14-17 GB en 4 bits (Q4_K_S y similares), mas overhead de contexto KV.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 y 8 bits; RTX 4090 (24 GB), RTX 3090 (24 GB), L40S o A6000 para 4 bits con contexto moderado.
- Viabilidad en GPU de consumo: si, en 4 bits cabe en GPUs de 24 GB (RTX 3090, 4090) y, con contexto recortado y offload parcial a CPU, en tarjetas de 16 GB. En 8 bits no cabe en una GPU de consumo de 24 GB sin offload.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM o TGI requeririan pesos en safetensors, no disponibles en este repositorio. Los quants MTP estan pensados para runtimes que soporten prediccion multi-token.
- Latencia y throughput: no disponibles. La model card afirma de forma cualitativa que la generacion es mas rapida que el modelo base, especialmente en MTP, y que el menor numero de tokens de pensamiento reduce el tiempo total por respuesta.
- Almacenamiento: el repositorio ocupa 389,0 GB, por lo que conviene descargar unicamente las variantes de cuantizacion necesarias.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto, licencia ni benchmarks de los modelos citados como referencia, por lo que la comparacion se limita a lo que afirma la model card.

| Modelo | Parametros | Contexto | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Coder (este repositorio, GGUF) | 26,9B | No disponible | 735 (8 bits), 719 (4 bits) | apache-2.0 | GGUF en HuggingFace |
| Qwen 3.8 27B (base citado) | 27B (segun denominacion) | No disponible | 591 (derivado de la afirmacion de +144 puntos) | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35B totales; el nombre sugiere 3B activos, sin confirmar | No disponible | Inferior segun el autor, sin cifra | No disponible | No disponible |
| Qwen 3.6 27B | 27B (segun denominacion) | No disponible | Inferior segun el autor, sin cifra | No disponible | No disponible |
| Qwen 3.5 27B | 27B (segun denominacion) | No disponible | Inferior segun el autor, sin cifra | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo abliterated y uncensored: se ha eliminado deliberadamente el comportamiento de rechazo, por lo que puede generar contenido ofensivo, violento, sexual o ilegal sin filtros. No es apto para productos dirigidos al publico general sin una capa de moderacion propia.
- Riesgo de alucinacion: no se aportan evaluaciones de veracidad; al ser un fine tune orientado a creatividad y con reduccion del razonamiento previo, la probabilidad de afirmaciones incorrectas sin aviso es relevante en usos facticos.
- Los datos de benchmarks son afirmaciones del autor del modelo base, sin metodologia, sin semillas, sin version de harness y sin verificacion independiente. Deben tratarse como no confirmados.
- Idiomas: solo ingles y chino declarados. El castellano no figura como idioma soportado, por lo que el rendimiento en espanol es impredecible.
- Longitud de contexto no documentada: no se puede planificar arquitectura de agentes o analisis de documentos largos sin verificarla empiricamente.
- Licencia: el repositorio declara apache-2.0, pero no se documenta la cadena de licencias de los modelos base y de los datasets empleados; conviene verificar la procedencia antes de un uso comercial.
- Repositorio practicamente sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia, sin historial de uso.
- Repositorio de 389 GB: el espacio en disco y el tiempo de descarga son un coste real si se quieren varias cuantizaciones.
- Las cuantizaciones de 4 bits degradan la calidad respecto a 8 bits (719 frente a 735 en ARC-C segun el autor), lo que hay que tener en cuenta al elegir el formato.
- El autor del repositorio (velilu) no es el autor del fine tune (DavidAU): se trata de una redistribucion cuantizada, sin garantia de soporte ni de actualizaciones.
- Las etiquetas mencionan tres generaciones distintas (qwen3_8, qwen3_6, qwen3_5), lo que refleja un arbol de modelos base encadenados; la informacion disponible no aclara la composicion exacta de esa cadena.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/velilu/Qwen3.8-27B-TURBO-Fable-Coder-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia de la tecnica COLD FUSION citado en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets citados: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente entradas de diccionario sobre el termino "query"), por lo que no hay papers, blogs ni demos adicionales que enlazar.
