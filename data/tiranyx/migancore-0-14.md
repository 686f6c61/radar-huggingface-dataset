# Tiranyx/migancore-0.14

## Resumen

MiganCore 0.14 es un modelo de lenguaje de 4.022 millones de parametros derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el autor independiente Tiranyx (Fahmi Ghani) dentro de un proyecto de investigacion unipersonal en Indonesia que estuvo activo entre mayo y septiembre de 2026. El objetivo del proyecto era acotado y poco habitual: dotar a un modelo pequeno en indonesio de la capacidad de reconocer los limites de su propio conocimiento y abstenerse de responder en lugar de fabricar contenido. El proyecto se cerro el 28 de septiembre de 2026 y los pesos se publican como parte del registro abierto de la investigacion, con la etiqueta explicita de "archived" y "research use only".

Tecnicamente, el modelo no es un entrenamiento desde cero ni un ajuste a gran escala: parte del instruct de Qwen3 de 4B y se construye mediante dos adaptadores LoRA (r = 16, alfa = 32, 2 epocas) que despues se fusionan con una receta TIES (densidad 0,5, pesos 1,0 / 1,0) y se cuantizan a GGUF Q4_K_M. Los adaptadores se entrenan sobre un conjunto de solo 485 filas generadas de forma determinista por programas, sin intervencion de ningun modelo en la redaccion ni en la evaluacion de los datos.

Su relevancia actual es mas metodologica que de rendimiento: es un caso documentado de investigacion reproducible sobre alucinacion y absteccion en modelos pequenos, con dataset, receta de merge y bateria de evaluacion publicados. El propio autor advierte que el modelo fabrica contenido en aproximadamente la mitad de las preguntas en las que deberia abstenerse, por lo que no debe emplearse para responder preguntas factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3; no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (valor de `num_ctx` en el Modelfile de Ollama empleado en servicio) |
| Tipos de cuantizacion | GGUF Q4_K_M (fichero publicado de 2.497.278.784 bytes); adaptadores LoRA en fp16 dentro de los `.tgz` |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache-2.0 (siguiendo el modelo base) |
| Formato de pesos | GGUF (Q4_K_M) y adaptadores LoRA empaquetados en `.tgz`; tambien se publica el script de merge `kemas_merge14.py` y el `Modelfile` de Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros con licencia Apache-2.0. Sobre esa base no se realiza un entrenamiento completo, sino un ajuste mediante dos adaptadores LoRA de rango 16 y alfa 32, entrenados durante 2 epocas cada uno: un adaptador de "disciplina aritmetica" (285 filas) y un adaptador de "disciplina de estilo" (200 filas). Posteriormente ambos adaptadores se combinan con una fusion TIES con densidad 0,5 y pesos 1,0 / 1,0, y el resultado se cuantiza a GGUF Q4_K_M. El script de fusion se publica como `kemas_merge14.py`.

El dato mas singular es la composicion del conjunto de entrenamiento: 485 filas en total, todas generadas por generadores de programa deterministicos, sin que ningun modelo escribiera, reescribiera ni juzgara ninguna fila. Los numeros se calculan por codigo y se reverifican mecanicamente. El adaptador aritmetico contiene 201 filas de aritmetica basica, 76 de calculos de unidades, 6 filas canario y 2 filas corregidas a mano; el de estilo contiene 160 patrones de rechazo, 30 filas de formato de agente, 9 rechazos semilla y 1 fila canario. Se publican las huellas sha256 (primeros 16 caracteres hexadecimales) de ambos datasets: `8009c9553fbb1261` para el aritmetico y `b2cdfc0336aa03a4` para el de estilo. El codigo generador, incluidas las plantillas de respuesta, se escribio con ayuda de un asistente de programacion basado en IA. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- Aritmetica basica y calculos con unidades, reforzados por el adaptador especifico entrenado sobre 277 filas utiles (201 de aritmetica basica mas 76 de unidades).
- Patrones de rechazo y absteccion: el adaptador de estilo incorpora 160 patrones de rechazo y 9 rechazos semilla para intentar que el modelo decline preguntas fuera de su conocimiento.
- Formato de agente: 30 filas del adaptador de estilo entrenan un formato orientado a agentes, aunque la model card no detalla un protocolo de tool calling ni function calling.
- Capacidad declarada de computo de aritmetica verificable, basada en que las respuestas de entrenamiento se generan y reverifican por codigo.
- No se documenta soporte de vision, audio, thinking mode explicito ni capacidades multimodales.
- Multilingue limitado: solo indonesio e ingles segun la etiqueta de idiomas del repo.

## Casos de uso

- Investigacion sobre alucinacion y calibracion: el modelo se puede utilizar como sujeto de estudio en experimentos de absteccion, ya que publica dataset, receta de merge, bateria de evaluacion (`petak-jujur2`, 36 preguntas) y resultados pre-registrados. Es adecuado precisamente porque es un caso negativo documentado.
- Reproduccion de experimentos de fusion de adaptadores: con los ficheros `adapters/lora-hitung-promptragam.tgz`, `adapters/lora-gaya.tgz` y `kemas_merge14.py` se puede replicar el pipeline LoRA mas TIES mas cuantizacion GGUF y comparar variantes de densidad y pesos.
- Evaluacion de tecnicas de absteccion en modelos de 4B: sirve como linea base para medir tasas de fabricacion y exceso de rechazo en modelos pequenos desplegados en CPU.
- Pruebas de despliegue en Ollama sobre CPU: el modelo se sirvio en produccion entre el 24 de agosto y el 28 de septiembre de 2026 exclusivamente en CPU mediante Ollama, por lo que es un banco de pruebas realista para inferencia sin GPU en un presupuesto de memoria de unos 2,5 GB.
- Docencia y divulgacion sobre limites de los LLM: el par de metricas fabricacion / exceso de rechazo permite ilustrar en clase por que un modelo puede mejorar en absteccion y aun asi empeorar en utilidad.
- Auditoria de modelos derivados de Apache-2.0: al publicarse pesos, adaptadores, script de merge y huellas de dataset, se puede auditar de extremo a extremo la cadena de derivacion desde Qwen3-4B-Instruct-2507.
- Comparacion de rendimiento aritmetico con y sin adaptador especializado: las 277 filas de aritmetica y unidades permiten medir si el ajuste mejora la precision en calculos frente al modelo base en identicas condiciones.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, pipelines de CI/CD ni ninguna tarea que requiera respuestas factuales fiables, tal como advierte el propio autor.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la bateria indonesia `petak-jujur2` (36 preguntas), medida en CPU. Todas las cifras son veredictos pre-registrados.

| Condicion | Fabricacion | Exceso de rechazo | Precision factual | Rondas validas |
|---|---|---|---|---|
| Simple | 49,9 % | 3,1 % | 0,43 | 40 |
| Con la puerta de absteccion | 35,8 % | 1,3 % | 0,43 | 28 |

Comparacion con el modelo base, medida el 25 de septiembre de 2026 con peticiones identicas:

| Modelo | Fabricacion en preguntas de absteccion obligatoria |
|---|---|
| MiganCore 0.14 | 53,7 % |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 14,7 % |

Segun la model card, la guarda anti-evasion pre-registrada fallo, por lo que el autor no formula ninguna afirmacion de honestidad en ningun sentido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el fichero publicado: el GGUF Q4_K_M ocupa 2.497.278.784 bytes (unos 2,5 GB), por lo que se necesita un minimo practico de unos 3 GB de memoria disponible para pesos mas overhead de contexto a 4096 tokens.
- VRAM estimada en otras precisiones (calculada a partir del numero de parametros, no publicada por el autor): en fp16 serian aproximadamente 8 GB solo para pesos, sin contar cache KV ni activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar la cuantizacion Q4_K_M; el modelo tambien funciona integramente en CPU, que es como se sirvio en produccion.
- Cabe en GPU consumer: si, en tarjetas de gama de entrada con 4 GB o mas (por ejemplo, GTX 1650, RTX 3050, RTX 4060) para la version Q4_K_M. No hay datos publicados que confirmen un rendimiento concreto en cada modelo de GPU.
- Opciones de despliegue: Ollama es la via documentada, mediante `ollama create migancore-0.14 -f Modelfile`. Al ser GGUF, tambien es compatible con llama.cpp; no se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y rendimiento: no disponibles. La model card solo indica que el modelo se sirvio en CPU a traves de Ollama entre el 24 de agosto y el 28 de septiembre de 2026, con `num_ctx 4096` y `temperature 0.3`, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| MiganCore 0.14 | 4.022.468.096 | 4096 | id, en | Apache-2.0 | Archivado, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (clase) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache-2.0 | Activo |
| Otras alternativas de ~4B para indonesio | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos es frente a su propio modelo base: MiganCore 0.14 registra un 53,7 % de fabricacion frente al 14,7 % de Qwen3-4B-Instruct-2507 en la bateria `petak-jujur2`. No se dispone de datos publicados que permitan comparar con otros modelos indonesios de tamano similar.

## Limitaciones y advertencias

- Fabricacion elevada y verificada: el modelo inventa contenido en el 49,9 % de las preguntas en las que deberia abstenerse en condicion simple, y en el 35,8 % incluso con la puerta de absteccion activada. El autor prohibe explicitamente usarlo para responder preguntas factuales.
- Rendimiento por debajo del modelo base en el eje de honestidad: 53,7 % de fabricacion frente al 14,7 % del base, medido el 25 de septiembre de 2026. La guarda anti-evasion pre-registrada fallo y no se formula ninguna afirmacion de honestidad.
- Precision factual de 0,43 en la bateria `petak-jujur2`, es decir, menos de la mitad de respuestas correctas.
- Exceso de rechazo: 3,1 % en condicion simple y 1,3 % con la puerta de absteccion, es decir, el modelo tambien declina preguntas que si son respondibles.
- Identidad confusa: el modelo puede responder como su modelo base cuando se le pregunta quien es.
- Cobertura linguistica limitada a indonesio e ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Entrenamiento sobre solo 485 filas generadas deterministicamente, sin RLHF ni DPO documentados, lo que limita severamente la generalizacion fuera de los patrones entrenados.
- Contexto corto: 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Proyecto cerrado y sin mantenimiento: el repositorio esta marcado como archivado desde el 28 de septiembre de 2026, con 0 descargas y 0 likes. No cabe esperar correcciones ni soporte.
- Restricciones de licencia: Apache-2.0 permite uso comercial desde el punto de vista legal, pero el autor restringe el uso a investigacion por motivos de calidad; ademas, el aviso de investigacion no es juridicamente vinculante frente a la licencia.
- Riesgo de deriva en produccion: no hay informe de sesgos, evaluacion de seguridad ni pruebas en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tiranyx/migancore-0.14
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo, instrumentos, experimentos y linaje: https://github.com/fahmiwol/migancore
- Metodo e informe de cierre: https://github.com/fahmiwol/migancore-research-method
- Dataset del registro de investigacion: https://huggingface.co/datasets/Tiranyx/migancore-research-record
- Contacto del autor: fahmiwol@gmail.com
