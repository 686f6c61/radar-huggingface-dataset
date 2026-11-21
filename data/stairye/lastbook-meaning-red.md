# STAirye/lastbook-meaning-red

## Resumen

lastbook-meaning-red es un artefacto derivado de BAAI/bge-small-en-v1.5, un modelo de embeddings de frases de 33,2 millones de parametros desarrollado originalmente por BAAI. El autor STAirye lo publica como un GGUF cuantizado en q8_0 junto con un fichero de centroides, formando un clasificador binario de similitud semantica que detecta preguntas potencialmente urgentes en una aplicacion de biblioteca offline llamada Lastbook. No es un modelo generativo ni un clasificador entrenado de forma convencional: es un envoltorio de inferencia sobre el encoder base, con cabezas de clasificacion implementadas como centroides de embeddings.

El problema que resuelve es el de anadir una capa de deteccion semantica de urgencia (emergencias medicas como no respirar, atragantamiento, sangrado, sobredosis o suicidio) a un sistema de reglas lexicas ya existente, sin enviar datos a ningun servidor. La relevancia es limitada y muy especifica: se trata de un componente de un fork concreto de una aplicacion, publicado con 0 descargas y 0 likes, y no de un modelo de proposito general. Su interes tecnico reside en la metodologia de evaluacion (sensibilidad frente a especificidad, con umbrales calibrados sobre ejemplos sinteticos) y en la decision de disenar un clasificador de seguridad a partir de un encoder pequeno y cuantizado.

El modelo base bge-small-en-v1.5 es un transformer encoder de tipo BERT de 33 millones de parametros, orientado a similitud de frases y recuperacion, con contexto de 512 tokens. Este artefacto reutiliza sus embeddings [CLS] (384 dimensiones) y aplica una resta de cosenos maximos contra centroides "red" y "non-red" para producir una puntuacion de urgencia. La ventana efectiva declarada en el uso es de 320 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, familia bge-small) con pooling [CLS]; clasificacion por centroides de embeddings |
| Parametros totales | 33.212.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (modelo base); 320 tokens en el uso declarado |
| Tipos de cuantizacion | q8_0 (GGUF); centroides en float32 |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (bge-small-en-v1.5-q8_0.gguf, 37 MB) y centroides.npz |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo sobre el encoder. bge-small-en-v1.5 es un encoder BERT de 12 capas y 384 dimensiones de embedding, entrenado por BAAI dentro del proyecto C-Pack (Xiao et al., 2023) con objetivos de recuperacion y similitud de frases. La conversion a GGUF se realizo con `convert_hf_to_gguf.py --outtype q8_0` de llama.cpp (tag b12032), manteniendo pooling [CLS] y modo embedding.

La innovacion del artefacto esta en la capa de clasificacion: 31 vectores centroides unitarios de 384 dimensiones (20 categorias "red" y 11 "non-red"), derivados de 689 frases cortas escritas para el proposito (315 urgentes en 20 categorias, 144 "amarillas" y 230 imitaciones como refranes, cocina, deporte o preguntas de cursos de primeros auxilios). La puntuacion de una consulta es la diferencia entre su maximo coseno contra un centroide red y su maximo coseno contra uno non-red; el umbral `wide` es 0,0084. Los umbrales `strict` y `wide` se calibraron solo sobre esos ejemplos, fuera de pliegue. No hay RLHF, DPO ni fine-tuning supervisado documentado sobre el encoder.

## Capacidades

- Extraccion de embeddings de frases en ingles (vector [CLS] de 384 dimensiones, longitud unitaria).
- Clasificacion binaria de similitud semantica orientada a la deteccion de urgencia medica, mediante puntuacion de cosenos maximos contra centroides.
- Funcionamiento completamente offline: la inferencia se ejecuta en el equipo del usuario mediante el runner de llama.cpp en modo embedding, sin envio de datos.
- Integracion como capa aditiva sobre reglas lexicas (urgencia = palabras O significado), nunca como sustituto ni como eliminador de senales.
- Inferencia reproducible: los ficheros pueden reconstruirse con `tools/meaning_red_model.py` y las mismas entradas producen los mismos bytes, con verificacion de tamano y SHA-256 mediante manifiesto.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento.

## Casos de uso

- Deteccion de urgencia en una aplicacion de biblioteca offline: el componente marca preguntas que podrian ser urgentes para que las paginas de biblioteca encontradas se muestren siempre, con botones de emergencia; es adecuado porque anade senal semantica a las reglas de palabras sin coste de red.
- Filtro de seguridad en asistentes locales de bajo consumo: al ser un encoder de 33 millones de parametros cuantizado a q8_0 (37 MB), puede ejecutarse en CPU en equipos modestos como paso previo a un modelo generativo mayor.
- Moderacion de consultas en ingles en buscadores internos: la puntuacion por centroides permite etiquetar consultas con posible caracter urgente antes de aplicar politicas de visualizacion.
- Sistema de triaje de primera capa en aplicaciones de salud comunitaria (no como dispositivo medico): util como senal adicional de revision humana, dado que el propio autor lo describe como paso de cribado y no de diagnostico.
- Enrutado de conversaciones en ingles hacia plantillas de respuesta con recursos de emergencia: la puntuacion permite activar plantillas especificas cuando se supera el umbral `wide`.
- Investigacion sobre clasificadores de seguridad basados en embeddings: los centroides y las listas de evaluacion publicadas sirven como referencia reproducible para estudiar el compromiso entre sensibilidad y especificidad en cribado.
- Verificacion de integridad en pipelines de despliegue: el manifiesto con SHA-256 y tamanos permite validar los artefactos antes de su uso en produccion.

## Benchmarks y rendimiento

| Metrica | Este check solo | Palabras de la app OR este check |
|---|---|---|
| Urgente detectado | 81-87% | 99,4% / 97,6% / 94,5% |
| Infradeteccion (undertriage) | 13-19% | 0,6% / 2,4% / 5,5% |
| Preguntas cotidianas marcadas | 25-30% | 43% / 60% / 68% |

Los tres valores corresponden a tres listas de prueba retenidas. El autor compara el objetivo de infradeteccion con el criterio del American College of Surgeons Committee on Trauma (menos del 5% de undertriage, con 25-35% de overtriage aceptado como precio, citandose hasta 30-50%). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de LLM, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el GGUF q8_0 de 37 MB y los centroides float32; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias; el modelo esta pensado para ejecucion en CPU mediante llama.cpp. Cualquier GPU con al menos 1 GB de memoria libre es suficiente.
- Cabe en GPU consumer: si, en cualquier RTX o integrada moderna, y tambien en CPU sin GPU.
- Opciones de despliegue: llama.cpp en modo embedding (runner de la aplicacion), con integracion mediante endpoints compatibles segun los tags del repositorio; vLLM, TGI u Ollama no estan documentados para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lastbook-meaning-red | 33,2 M | 512 (320 en uso) | Clasificacion de urgencia por embeddings | MIT | GGUF y NPZ en Hugging Face |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 | Similitud de frases y recuperacion | MIT | safetensors en Hugging Face |
| all-MiniLM-L6-v2 | aproximadamente 22 M | 256 | Similitud de frases | Apache-2.0 | safetensors y GGUF en Hugging Face |
| bge-small-zh-v1.5 | 24 M | 512 | Similitud de frases en chino | MIT | safetensors en Hugging Face |

La comparacion es estructural: los tres modelos comparables son encoders de similitud de proposito general, mientras que lastbook-meaning-red es un clasificador especifico de dominio construido sobre uno de ellos. No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un dispositivo medico ni una herramienta de triaje: no puede determinar si alguien esta en peligro; ante una emergencia debe llamarse al numero de emergencia local.
- No debe usarse de forma aislada: por si solo detecta 81-87% de las lineas urgentes y marca 25-30% de preguntas cotidianas imitadoras.
- Solo ingles: otros idiomas se detectan o se pierden por azar.
- Sesgos conocidos: las preguntas cotidianas sobre ninos y personas mayores, y los refranes ausentes de los ejemplos, se marcan con demasiada frecuencia.
- Los ejemplos y las listas de prueba fueron escritos con ayuda de IA de la misma familia de modelos, por lo que los habitos de fraseo compartidos hacen optimistas las cifras medidas frente a mensajes reales de personas.
- La especificidad es baja por diseno (25-30% de falsas alarmas en solitario, 43-60-68% combinado con las reglas de palabras); el autor acepta este coste porque una falsa alarma solo muestra paginas que se mostrarian igualmente.
- En una de las tres listas retenidas, el objetivo de infradeteccion no se cumple de forma estricta (5,5% frente al objetivo por debajo del 5%).
- Restricciones de licencia: MIT, sin restriccion de uso comercial, pero el artefacto hereda las condiciones del modelo base BAAI/bge-small-en-v1.5.
- Advertencia de produccion: el modelo solo anade senales a las reglas lexicas, nunca las elimina, y su uso fuera de ese contexto de aplicacion no esta validado.

## Enlaces

- Hugging Face: https://huggingface.co/STAirye/lastbook-meaning-red
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio del fork: https://github.com/STAirye/lastbook
- Repositorio original de Lastbook: https://github.com/Immortal-Protocols/lastbook
- Paper del modelo base: Xiao et al., "C-Pack: Packaged Resources To Advance General Chinese Embedding" (2023)
