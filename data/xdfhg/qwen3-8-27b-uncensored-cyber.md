# xdfhg/Qwen3.8-27B-Uncensored-Cyber

## Resumen

Qwen3.8-27B-Uncensored-Cyber es un ajuste fino derivado de la familia Qwen3, publicado por el usuario xdfhg en Hugging Face. Se trata de una variante «de-refused» (sin rechazos) especializada en el dominio de ciberseguridad y seguridad ofensiva, construida sobre el modelo philbert440/Qwen3.8-27B-Uncensored-Aggressive mediante una técnica de ablación de la dirección de rechazo en los pesos. El problema que aborda es concreto: los modelos alineados convencionalmente rechazan peticiones legítimas de análisis de vulnerabilidades, ingeniería inversa o red teaming, y este modelo elimina esa capa de rechazo manteniendo, según su autor, el razonamiento y la coherencia.

El modelo cuenta con 27.356.728.560 parámetros reales (unos 27,36 mil millones) según los pesos en safetensors, con un repositorio de 55,6 GB. Es multimodal: la pipeline declarada es image-text-to-text y el autor indica que la torre de visión y la cabeza de decodificación especulativa MTP (Multi-Token Prediction) se conservan intactas, de modo que mantiene entrada de imágenes y decodificación especulativa.

La relevancia del modelo es doble. Por un lado, es un ejemplo de la corriente comunitaria de ablaciones de rechazo sobre modelos abiertos, con una receta documentada por capas (aplicar la proyección a partir de la capa 4, reteniendo las 4 primeras). Por otro, su licencia Apache 2.0 y su naturaleza multimodal lo hacen desplegable en infraestructura propia, aunque su orientación explícita a contenido ofensivo exige controles legales y de uso. Los metadatos indican fecha de publicación del 13 de octubre de 2026 y cero descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (segun los tags: qwen3, qwen3_5); multimodal con torre de vision y cabeza MTP de decodificacion especulativa |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos originales), W4A16-AWQ (compressed-tensors, con cabeza MTP injertada), NVFP4 (E2M1 de 4 bits con escalas FP8, MTP injertada), GGUF (llama.cpp, con mmproj de vision y cabeza MTP) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); variantes AWQ, NVFP4 y GGUF publicadas por el autor |
| Tamano del repositorio | 55,6 GB |
| Modelo base | philbert440/Qwen3.8-27B-Uncensored-Aggressive |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 13 de octubre de 2026 (segun metadatos) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer denso de la familia Qwen3, de aproximadamente 27,36 mil millones de parametros, con dos componentes adicionales relevantes: una torre de vision que habilita la entrada de imagenes (pipeline image-text-to-text) y una cabeza MTP de prediccion multi-token que permite decodificacion especulativa y, por tanto, aceleracion de la generacion. El autor afirma que ambas se preservan tras el proceso de ablacion, algo que no es trivial, ya que muchas intervenciones sobre los pesos danan los componentes auxiliares.

El entrenamiento no es un entrenamiento desde cero ni un ajuste supervisado clasico, sino una intervencion sobre los pesos (weight ablation) en dos fases. La primera es la receta v2 del modelo base: una ablacion de rechazo de direccion unica con un factor α=1,15, denominada «Aggressive». La segunda es el denominado «residual-cyber peel»: se calcula una direccion de rechazo especifica del dominio ciberofensivo a partir de un conjunto de entrenamiento ofensivo frente a un conjunto amplio de peticiones inocuas, y se elimina mediante una proyeccion limpia que preserva la norma (β=1,0). Esa proyeccion se aplica solo a las capas profundas, conservando las cuatro primeras capas intactas (parametro `apply_from=4`). El razonamiento declarado por el autor es que las capas iniciales de extraccion de caracteristicas son las que sostienen la capacidad general, de modo que preservarlas evita el deterioro tipico de las ablaciones sobre Qwen3.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset mas alla de la mencion generica a un «cyber-offensive training set», ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion posteriores. Tampoco se documenta la composicion del corpus multimodal.

## Capacidades

- Generacion de texto conversacional multi-turno, con el modo conversacional declarado en los tags del repositorio.
- Razonamiento y matematicas basicas: el autor reporta 0,80 en GSM8K, lo que indica capacidad aritmetica y de razonamiento de varios pasos, aunque ligeramente inferior a la build anterior (0,825).
- Entrada multimodal de imagenes (image-text-to-text): la torre de vision se conserva, lo que permite analizar capturas de pantalla, diagramas o imagenes junto a texto.
- Respuesta abierta en dominio de ciberseguridad y seguridad ofensiva: el autor reporta 100/100 en su arnes de rechazo con 100 peticiones ciberofensivas retenidas.
- Decodificacion especulativa mediante cabeza MTP, lo que reduce la latencia de generacion cuando el runtime la soporta.
- Cuantizacion lista para despliegue en AWQ, NVFP4 y GGUF, incluido el proyector multimodal `mmproj` en la build GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de vulnerabilidades en auditorias autorizadas: el modelo puede razonar sobre descripciones de fallos, vectores de ataque y mitigaciones sin activar rechazos, lo que agiliza la redaccion de informes tecnicos de pentesting dentro de un encargo con permiso escrito.
- Revision de codigo con foco en seguridad: integrado en un pipeline de CI/CD, permite senalar patrones inseguros (inyeccion, deserializacion, manejo de secretos) y proponer parches, aprovechando su capacidad de generacion de codigo y su falta de bloqueo ante preguntas sobre explotacion.
- Formacion y concienciacion en seguridad ofensiva: en entornos de laboratorio cerrados, sirve como asistente para explicar tecnicas de ataque, construir rangos de practica y generar ejercicios CTF.
- Analisis de capturas de pantalla y paneles: gracias a la torre de vision, puede interpretar imagenes de interfaces de administracion, salidas de escaneres o diagramas de red y convertirlas en texto estructurado o hallazgos.
- Triaje de alertas y analisis de logs: el modelo puede resumir trazas, correlacionar eventos y redactar hipotesis de incidente, siempre que la ventana de contexto (no documentada) sea suficiente para los volumenes implicados.
- Generacion de documentacion tecnica especializada: redaccion de runbooks, politicas de divulgacion responsable, fichas de mitigacion y guiones de respuesta a incidentes con terminologia precisa del dominio.
- Asistente conversacional de dominio tecnico: chatbots internos para equipos de seguridad que necesitan respuestas sin evasivas ni advertencias moralizantes repetidas.
- Investigacion sobre ablacion de rechazos: como objeto de estudio para comparar tecnicas de de-refusal (ablacion de direccion unica frente a proyeccion por capas) y medir su impacto en capacidades generales.
- Despliegue local en GPU de consumo: con las cuantizaciones GGUF o NVFP4, puede ejecutarse en estaciones de trabajo con una sola GPU de gama alta para tareas de analisis sin enviar datos a terceros.
- Aplicaciones multimodales de extraccion de informacion: transcripcion de diagramas de arquitectura, tablas en imagen o capturas de herramientas ofensivas a texto estructurado.
- Nota: cualquier uso ofensivo debe realizarse con autorizacion explicita; el modelo no incorpora salvaguardas que impidan usos ilegales.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor. La evaluacion declarada se realizo en bf16, con «muestra amplia», jueces basados en Claude y un arnes de rechazo por expresiones regulares sobre 100 peticiones ciberofensivas retenidas. No hay verificacion independiente ni detalle del conjunto de evaluacion.

| Metrica | Cyber v2 (este modelo) | Build Cyber anterior |
|---|---|---|
| Cyber-open (mayor mejor) | 100/100 | 93/100 |
| Confabulacion (menor mejor) | 0,867 | 1,00 |
| Exactitud factual (mayor mejor) | 1,00 | 0,933 |
| GSM8K (mayor mejor) | 0,80 | 0,825 |
| Degeneracion (menor mejor) | 0,00 | 0,00 |

Segun el autor, la receta v2 es mas abierta en ciberseguridad (100 frente a 93), confabula menos (0,867 frente a 1,00) y es mas exacta factualmente (1,00 frente a 0,933), con un razonamiento equivalente y degeneracion nula. No se han publicado resultados de MMLU, HumanEval, MATH ni otros benchmarks estandar en la informacion disponible. El descenso de GSM8K de 0,825 a 0,80 es pequeno pero se produce en la direccion contraria a la mejora general, algo que el autor no comenta.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 55 GB solo para pesos, mas activaciones y cache KV; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM estimada en 8 bits: aproximadamente 27-30 GB; cabe en una RTX 5090 de 32 GB o en A100 40 GB.
- VRAM estimada en 4 bits (AWQ W4A16, NVFP4, GGUF Q4): aproximadamente 14-18 GB de pesos mas overhead; cabe en RTX 4090 de 24 GB, RTX 5090, L40S o A6000.
- Cuantizaciones GGUF de 4 bits: desplegables en llama.cpp y Ollama; el autor publica tambien el proyector `mmproj` para mantener la capacidad de vision, lo que anade unos pocos GB de VRAM.
- GPU recomendadas: H100 o A100 80 GB para BF16 en produccion; RTX 4090, RTX 5090, L40S o A6000 para cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: vLLM o TGI para el repo en safetensors y para la variante AWQ; llama.cpp y Ollama para GGUF; TensorRT-LLM o NIM para NVFP4, segun el patron habitual de estos formatos.
- Latencia y throughput: no disponibles. La cabeza MTP preservada permite decodificacion especulativa y deberia reducir la latencia por token en runtimes que la soporten, pero no se publican mediciones de tokens por segundo.
- Nota: el repositorio ocupa 55,6 GB, por lo que conviene descargar solo la variante de pesos necesaria.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparacion se limita a parametros y disponibilidad conocidos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xdfhg/Qwen3.8-27B-Uncensored-Cyber | 27,36 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| philbert440/Qwen3.8-27B-Uncensored-Aggressive (base) | No disponible | No disponible | No disponible | Hugging Face |
| Otras ablaciones comunitarias de Qwen3 en la misma clase de tamano | No disponible | No disponible | Variable | Hugging Face |
| Modelos densos de ~27-32 B de proposito general | No disponible | No disponible | Variable | Hugging Face |

El aspecto diferencial frente a otras ablaciones de rechazo es doble: la especializacion explicita en dominio ciberofensivo (frente a las ablaciones genericas que solo eliminan rechazos generales) y la conservacion declarada de la torre de vision y de la cabeza MTP. No hay datos publicos que permitan comparar su rendimiento real con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: la eliminacion de la direccion de rechazo es deliberada y alcanza el 100% en el arnes del autor, por lo que no cabe esperar negativas ante peticiones daninas. No debe exponerse a usuarios finales sin filtros externos.
- Riesgo legal y de cumplimiento: la especializacion en seguridad ofensiva puede facilitar usos ilicitos. En la Union Europea, el despliegue debe evaluarse frente al Reglamento de IA y a la normativa de ciberseguridad aplicable; el uso profesional requiere autorizacion explicita del objetivo.
- Riesgo de alucinacion: la metrica de confabulacion declarada por el autor es 0,867, es decir, no es cero; el modelo puede inventar CVE, funciones de API o detalles tecnicos plausibles pero falsos. Toda salida tecnica debe verificarse.
- Evaluacion no independiente: los numeros provienen del propio autor, con jueces basados en Claude y un arnes de expresiones regulares sobre 100 prompts. No hay replicacion por terceros y la metodologia no esta detallada.
- Regresion en GSM8K: el paso de 0,825 a 0,80 sugiere un posible coste en razonamiento matematico derivado de la ablacion; no esta analizado por el autor.
- Longitud de contexto desconocida: no se declara la ventana de contexto, lo que impide planificar despliegues que dependan de documentos largos o conversaciones extensas. Tampoco se documenta si la cabeza MTP y la torre de vision degradan el contexto efectivo.
- Idiomas no declarados: se desconoce el soporte multilingue real y su calidad fuera del ingles, idioma presumible del conjunto de evaluacion.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los materiales de entrenamiento pueden arrastrar obligaciones adicionales no documentadas; conviene revisar la licencia del modelo base philbert440 antes de un uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de redactar esta ficha, sin paper, informe tecnico ni repositorio de codigo asociado. No hay garantia de mantenimiento ni de correccion de errores.
- Riesgo de degeneracion en generaciones largas: aunque el autor reporta 0,00 en su metrica de degeneracion, no se especifica como se mide ni con que longitud de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xdfhg/Qwen3.8-27B-Uncensored-Cyber
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive
- Variantes de cuantizacion (AWQ, NVFP4, GGUF): publicadas por el mismo autor bajo el repositorio principal, sin URLs especificas en la informacion disponible
- Paper, blog tecnico o repositorio de codigo: no disponible (la busqueda web no ha devuelto resultados relevantes sobre este modelo)
