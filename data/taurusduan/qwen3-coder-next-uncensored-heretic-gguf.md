# taurusduan/Qwen3-Coder-Next-Uncensored-Heretic-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo llmfan46/Qwen3-Coder-Next-Uncensored-Heretic, publicado bajo el identificador taurusduan/Qwen3-Coder-Next-Uncensored-Heretic-GGUF. Se trata de una variante "abliterated" o "decensored" de la familia Qwen3-Coder, es decir, un modelo afinado para eliminar total o parcialmente los mecanismos de rechazo de contenido, orientado a generacion de codigo sin las restricciones tipicas de los modelos alineados. El autor de la model card se identifica como mradermacher, que realiza las cuantizaciones estaticas, mientras que el repositorio aparece alojado bajo la cuenta taurusduan.

El modelo base declara 79.674.391.296 parametros (aproximadamente 79,7 mil millones) en pesos safetensors, lo que lo situa en la gama alta de modelos abiertos y lo hace inasumible en una unica GPU de consumo en precision completa. El repositorio ocupa 542,8 GB en total y ofrece doce variantes de cuantizacion que van desde Q2_K (29,4 GB) hasta Q8_0 (84,9 GB), pasando por IQ4_XS, Q3_K, Q4_K, Q5_K y Q6_K.

Su relevancia actual es doble: por un lado, permite ejecutar localmente un modelo de codigo de gran tamano mediante llama.cpp y derivados; por otro, atrae a quienes necesitan un modelo de programacion sin filtros de contenido para tareas de seguridad ofensiva, analisis de codigo malicioso o generacion de texto sin censura. La licencia declarada es Apache 2.0, heredada del modelo Qwen original, aunque la model card advierte de que el modelo base no es una publicacion oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre indica derivacion de Qwen3-Coder-Next; la model card no especifica la arquitectura) |
| Parametros totales | 79.674.391.296 (79,7 B) en safetensors del modelo base |
| Parametros activos | No disponible (no se especifica si el modelo es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (etiqueta x-f16 mencionada en metadatos, no listada en la tabla de ficheros) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (enlace a la licencia de Qwen/Qwen3-Coder-Next) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 542,8 GB |
| Descargas / likes | 124 descargas, 0 likes |
| Fecha de creacion | 2026-09-21 |
| Modelo base | llmfan46/Qwen3-Coder-Next-Uncensored-Heretic |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card proporcionada. El identificador del modelo base (Qwen3-Coder-Next-Uncensored-Heretic) indica que deriva de la familia Qwen3-Coder, orientada a generacion de codigo, y que ha sido sometida a un proceso de "abliteration" o decensurado destinado a suprimir las respuestas de rechazo. No se documentan en el repositorio el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento posterior al decensurado.

El proceso aplicado por mradermacher es exclusivamente de cuantizacion: se parte del modelo base en formato Hugging Face y se generan cuantizaciones GGUF estaticas con llama.cpp. Los metadatos internos indican quantize_version 2, output_tensor_quantised 1 y convert_type hf. Existe ademas una familia de cuantizaciones ponderadas con imatrix, publicada en el repositorio mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF, que el propio autor recomienda cuando se busca la mejor relacion calidad/tamano por encima de las estaticas de este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado como conversacional.
- Generacion y completado de codigo, dado que el modelo base pertenece a la familia Qwen3-Coder.
- Ausencia de filtros de rechazo en principio: el modelo esta etiquetado como heretic, uncensored, decensored y abliterated, por lo que tiende a responder a peticiones que un modelo alineado rechazaria.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con infraestructuras de servido tipo API.
- Ejecucion mediante llama.cpp y cualquier runtime compatible con GGUF.
- Tool calling y function calling: no disponible, no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible, no confirmado.
- Capacidades multilingues: solo se declara ingles (en).
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito: no disponible.

## Casos de uso

- Generacion de codigo asistida en local: el modelo puede desplegarse con llama.cpp u Ollama para autocompletar y generar funciones en un entorno sin conexion, evitando enviar codigo propietario a APIs externas. Es adecuado por su especializacion en codigo y su disponibilidad en cuantizaciones desde 29,4 GB.
- Revision de codigo y refactorizacion: se puede integrar en un pipeline de CI/CD como paso de analisis que sugiere mejoras o reescribe fragmentos, aprovechando la generacion de codigo del modelo base.
- Investigacion en seguridad ofensiva y defensiva: al carecer de filtros de rechazo, permite generar ejemplos de codigo vulnerable o malicioso en entornos controlados de laboratorio, algo que los modelos alineados bloquean. Requiere aislamiento estricto y uso etico.
- Analisis de malware y ingenieria inversa asistida: un modelo sin censura puede describir el comportamiento de fragmentos de codigo sospechoso sin negarse a procesar el contenido, lo que resulta util en equipos de respuesta a incidentes.
- Redaccion tecnica libre en ingles: generacion de documentacion, articulos o texto tecnico sin las restricciones de tono y contenido de los modelos alineados.
- Despliegue en servidor de inferencia propio: al ser GGUF, se puede servir con llama.cpp server o con backends compatibles para ofrecer una API interna de generacion de texto y codigo.
- Experimentacion con decensurado ("abliteration"): sirve como objeto de estudio para investigadores que comparan el comportamiento de un modelo alineado frente a su version abliterated en tareas de codigo y texto.
- Fine-tuning adicional sobre el modelo base: el repositorio base en safetensors (llmfan46/Qwen3-Coder-Next-Uncensored-Heretic) puede usarse como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos de fichero estan tomados de la tabla del autor. La VRAM necesaria es superior al tamano del fichero, ya que hay que anadir la cache KV y el overhead del runtime; se indica una estimacion orientativa.

| Cuantizacion | Tamano del fichero | VRAM estimada para inferencia |
|---|---|---|
| Q2_K | 29,4 GB | ~32-34 GB |
| Q3_K_S | 34,6 GB | ~37-39 GB |
| Q3_K_M | 38,4 GB | ~41-43 GB |
| Q3_K_L | 41,5 GB | ~44-46 GB |
| IQ4_XS | 43,3 GB | ~46-48 GB |
| Q4_K_S | 45,6 GB | ~48-51 GB |
| Q4_K_M | 48,6 GB | ~51-54 GB |
| Q5_K_S | 55,1 GB | ~58-61 GB |
| Q5_K_M | 56,9 GB | ~60-63 GB |
| Q6_K | 65,6 GB | ~69-72 GB |
| Q8_0 | 84,9 GB | ~88-92 GB |

- No cabe en ninguna GPU de consumo actual en una sola tarjeta: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar ni siquiera la cuantizacion Q2_K completa.
- Para ejecucion integra en GPU se necesitan configuraciones multi-GPU o aceleradores de datacenter: 2x RTX 6000 Ada (48 GB), 2x A100 40 GB, 2x A100 80 GB, 1x H100 80 GB para cuantizaciones hasta Q6_K, y 1x H100 80 GB o 2x A100 80 GB para Q8_0.
- Alternativa en hardware de consumo: descarga parcial de capas en GPU con el resto en RAM del sistema mediante llama.cpp (-ngl), lo que es viable con Q4_K_S o Q4_K_M y 64-128 GB de RAM, a costa de una latencia mucho mayor.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier backend compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI, aunque el tamano de 79,7 B exige multi-GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen fuertemente de la cuantizacion, del numero de capas descargadas a GPU y de la longitud de contexto efectiva, un dato que tampoco se especifica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto de modelos comparables en la informacion proporcionada. La comparativa se limita a los artefactos relacionados directamente con este trabajo.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| taurusduan/Qwen3-Coder-Next-Uncensored-Heretic-GGUF (este) | 79,7 B (base) | GGUF | 11 estaticas (Q2_K a Q8_0) | Apache 2.0 | No disponibles |
| mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF | No disponible | GGUF | Estaticas | No disponible | No disponibles |
| mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF | No disponible | GGUF | Ponderadas con imatrix | No disponible | No disponibles |
| llmfan46/Qwen3-Coder-Next-Uncensored-Heretic (modelo base) | 79,7 B | safetensors | No aplica | Apache 2.0 | No disponibles |
| Qwen/Qwen3-Coder-Next (familia de origen) | No disponible | No disponible | No aplica | Apache 2.0 | No disponibles |

## Limitaciones y advertencias

- Modelo decensurado y abliterated: se ha manipulado para reducir o eliminar los rechazos de contenido. Puede generar contenido ofensivo, ilegal o peligroso sin advertencia. Su uso en produccion orientada al publico general es desaconsejado.
- Riesgo de degradacion por el proceso de abliteration: la eliminacion de mecanismos de rechazo suele conllevar perdida de calidad, coherencia o capacidad de seguir instrucciones complejas en comparacion con el modelo original. No se aportan evaluaciones que cuantifiquen este efecto.
- Alucinacion: no hay datos de evaluacion publicados para este modelo ni para su base, por lo que no puede acotarse la tasa de alucinacion. En generacion de codigo, esto se traduce en APIs inventadas y funciones inexistentes.
- Idioma: solo se declara ingles. No hay soporte multilingue confirmado.
- Contexto: la longitud de contexto no se especifica. No debe asumirse una ventana concreta hasta verificarla en el modelo base.
- Discrepancia de autoria y posible reubicacion: el repositorio esta alojado bajo la cuenta taurusduan, pero la model card se atribuye a mradermacher y los enlaces de descarga apuntan al repositorio de mradermacher. Conviene verificar la procedencia de los ficheros antes de usarlos en produccion.
- Licencia: se declara Apache 2.0, con enlace a la licencia de Qwen/Qwen3-Coder-Next. Al no ser una publicacion oficial de Qwen, la trazabilidad de los terminos aplicables al proceso de decensurado es limitada.
- Politica de uso de Hugging Face: el contenido de las cuantizaciones es responsabilidad del usuario. En entornos corporativos puede entrar en conflicto con politicas de uso aceptable.
- Consumo de recursos: 542,8 GB de repositorio completo. Descargar todas las cuantizaciones carece de sentido; conviene seleccionar una sola variante.
- La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo (los resultados obtenidos corresponden a un servicio de teleconsulta medica, sin relacion alguna), por lo que no existe documentacion externa verificable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3-Coder-Next-Uncensored-Heretic
- Repositorio de cuantizaciones de mradermacher (estaticas): https://huggingface.co/mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Repositorio de cuantizaciones ponderadas con imatrix (i1): https://huggingface.co/mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF
- Pagina resumen de descargas del autor: https://hf.tst.eu/model#Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Licencia del modelo de origen: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
