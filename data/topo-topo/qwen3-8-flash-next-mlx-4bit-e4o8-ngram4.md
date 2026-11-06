# ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8-ngram4

## Resumen

Qwen3.8-Flash-Next-mlx-4bit-e4o8-ngram4 es una cuantizacion de 4 y 8 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada en formato MLX para su ejecucion en hardware Apple Silicon. La publica el usuario ToPo-ToPo como una variante intermedia dentro de su propia familia de cuantizaciones: mantiene los expertos enrutados y las proyecciones lineales de atencion y expertos compartidos en 8 bits, mientras rebaja a 4 bits las incrustaciones n-gram (PLE), que en la version e4o8 ocupaban 54 GiB de los 130 GiB totales. El resultado pesa 106 GiB, practicamente lo mismo que la cuantizacion uniforme de 4 bits (104 GiB), pero conserva buena parte de la calidad en el uso de herramientas de la version e4o8.

El modelo base es un transformer con mezcla de expertos (MoE) y capacidades de imagen-texto, con 177.392.830.611 parametros segun los safetensors del repositorio. Su interes practico es la ingenieria de cuantizacion: demuestra que asignar precision de forma asimetrica por modulo (4 bits a los expertos y a las incrustaciones n-gram, 8 bits al resto) permite acercarse al comportamiento de una cuantizacion de 8 bits en tareas de function calling sin pagar su coste de memoria.

La relevancia es acotada y experimental: cero descargas, cero likes, publicacion en noviembre de 2026 y evaluacion limitada a 34 preguntas de prueba y 20 escenarios de llamada a herramientas en japones e ingles. No sustituye a la ficha del modelo original, sino que documenta un compromiso concreto entre tamano y fidelidad para despliegues locales en Mac con memoria unificada de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) e incrustaciones n-gram (PLE); multimodal imagen-texto |
| Parametros totales | 177.392.830.611 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin por modulo: expertos enrutados (`switch_mlp.{gate,up,down}_proj`) 4 bits g32; incrustaciones n-gram (`ple.ple_embedding.ngram_embedding.shards.*`, 128 modulos, ~51B parametros) 4 bits g32; atencion y expertos compartidos 8 bits g32; router 8 bits g64; modulo de imagen sin cuantizar (bf16) |
| Idiomas soportados | no disponible (la evaluacion del autor cubre japones e ingles) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos con enrutamiento por token, complementada con incrustaciones n-gram (PLE, *n-gram embedding*) que en esta cuantizacion suman unos 51.000 millones de parametros distribuidos en 128 modulos. La variante aqui descrita no reentrena nada: parte de la cuantizacion e4o8 del mismo autor y sustituye unicamente los pesos de las incrustaciones n-gram por los de la cuantizacion uniforme de 4 bits (revision f128069, derivada directamente de bf16 a 4 bits g32), sin re-redondeo. El `config.json` declara `{"group_size": 32, "bits": 4}` para esos modulos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) del modelo original en la informacion proporcionada. El autor incluye un drafter MTP (multi-token prediction) separado para decodificacion especulativa, en el repositorio Qwen3.8-Flash-Next-MTP-bf16, compatible con mlx-vlm 0.7.0 o superior; en esta cuantizacion concreta el drafter apenas aporta ganancia de velocidad (37,0 tok/s con y sin MTP).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagen y texto (pipeline `image-text-to-text`), con el modulo visual en bf16.
- Llamada a herramientas y function calling, con buen comportamiento medido en japones (99% de acierto) e ingles (92%).
- Razonamiento de un solo paso en el modo evaluado: el autor desactiva el modo pensamiento para las pruebas.
- Capacidades multilingues: la evaluacion cubre japones e ingles; el resto de idiomas no esta documentado.
- Soporte de decodificacion especulativa mediante el drafter MTP externo, aunque con escasa mejora en esta variante.

## Casos de uso

- Asistente local con function calling en Mac: el modelo mantiene un 92% de acierto en la seleccion y formato de llamadas a herramientas en ingles, lo que permite construir agentes de escritorio que invocan APIs locales sin depender de la nube, siempre que se acepte el coste de memoria de 115 GB.
- Automatizacion de tareas de sistema en japones: con un 99% de acierto en los escenarios de herramientas evaluados en japones, encaja en flujos donde un agente debe leer ficheros de configuracion y ejecutar acciones sobre el sistema operativo.
- Prototipado de pipelines multimodal en Apple Silicon: al mantener el modulo de imagen en bf16, sirve para experimentar con descripcion de imagenes y respuesta a preguntas visuales en un entorno MLX sin GPU dedicada.
- Evaluacion de estrategias de cuantizacion: es un artefacto de referencia para investigadores que comparan precision asimetrica por modulo frente a cuantizacion uniforme, con metricas de calidad y velocidad publicadas por el autor.
- Sustitucion de la cuantizacion uniforme de 4 bits en despliegues existentes: pesa solo 2 GiB mas (106 frente a 104 GiB) y mejora el acierto en herramientas en ingles del 80% al 92%, por lo que es un cambio directo en entornos ya dimensionados para 4 bits.
- Servicio de inferencia con mlx-vlm: el autor documenta el arranque del servidor de modelos de mlx-vlm 0.7.11, lo que permite exponer el modelo como endpoint HTTP para pruebas de integracion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Configuracion: modo pensamiento desactivado, temperatura 0,6, top_p 0,95, top_k 20, cinco repeticiones por caso, servidor de mlx-vlm 0.7.11 sin MTP. Prueba de conocimiento: 34 preguntas cortas en japones e ingles. Prueba de herramientas: 20 escenarios de llamada en cada idioma.

| Metrica | 8bit | 4bit uniforme | e4o8-ngram4 (este) | e4o8 |
|---|---|---|---|---|
| Acierto en prueba de conocimiento | 100% | 100% | 100% | 100% |
| Herramientas en japones | 97% | 94% | 99% | 99% |
| Herramientas en ingles | 88% | 80% | 92% | 98% |
| Formato de llamada correcto (ingles) | 100% | 95% | 98,5% | 100% |
| Tamano de pesos | 186 GiB | 104 GiB | 106 GiB | 130 GiB |
| Velocidad de generacion sin MTP | no disponible | 46,6 tok/s | 37,0 tok/s | 38,5 tok/s |
| Velocidad de generacion con MTP | no disponible | 48,7 tok/s | 37,0 tok/s | 39,0 tok/s |

Velocidad medida en un M3 Ultra, temperatura 0, 400 tokens, media de 3 preguntas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el autor observa un pico de 115 GB de memoria del servidor de modelos con pesos de 106 GiB (5,136 bits por peso).
- Hardware de referencia: Apple M3 Ultra con memoria unificada; no se documentan pruebas en otros chips.
- GPU dedicadas: no aplica; el formato MLX esta pensado para Apple Silicon. No hay datos de despliegue en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (ni RTX 4090 de 24 GB ni configuraciones de 48 GB); requiere un Mac con memoria unificada de al menos 128 GB.
- Despliegue: `mlx-vlm` (version 0.7.11 en las pruebas), con soporte de servidor de modelos y de drafter MTP a partir de 0.7.0. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 37,0 tok/s de generacion en M3 Ultra sin MTP; el drafter MTP no mejora la cifra en esta cuantizacion. La cuantizacion uniforme de 4 bits alcanza 46,6 tok/s, aproximadamente un 26% mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Licencia | Herramientas (ingles) | Velocidad sin MTP | Disponibilidad |
|---|---|---|---|---|---|---|
| e4o8-ngram4 (este) | 177,4B | 106 GiB | qwen-community-1.0 | 92% | 37,0 tok/s | MLX, Apple Silicon |
| Qwen3.8-Flash-Next-mlx-4bit (uniforme) | 177,4B | 104 GiB | qwen-community-1.0 | 80% | 46,6 tok/s | MLX, Apple Silicon |
| Qwen3.8-Flash-Next-mlx-4bit-e4o8 | 177,4B | 130 GiB | qwen-community-1.0 | 98% | 38,5 tok/s | MLX, Apple Silicon |
| Qwen3.8-Flash-Next-mlx-8bit | 177,4B | 186 GiB | qwen-community-1.0 | 88% | no disponible | MLX, Apple Silicon |

Las cuatro variantes comparten modelo base y licencia; la diferencia esta en el reparto de bits por modulo. Llama la atencion que la version de 8 bits rinda peor en herramientas en ingles que e4o8 y e4o8-ngram4, algo que el propio autor declara no saber explicar, dado que los pesos no pertenecientes a expertos son identicos entre e4o8 y 8bit. No se dispone de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion muy reducida: 34 preguntas de conocimiento y 20 escenarios de herramientas por idioma, con cinco repeticiones; no hay pruebas de conversaciones largas ni de entrada de imagen, que el autor declara no haber probado.
- El autor detecto en esta variante un fallo del 2% (2 de 100 casos) al escribir la llamada a herramienta como texto plano en lugar de emitirla estructurada, fallo ausente en e4o8 y en 8bit.
- La cuantizacion uniforme de 4 bits falla de forma sistematica (5 de 5) en escenarios concretos: invoca herramientas cuando no procede, emite una sola llamada donde deberian ser tres y usa mal la herramienta de lectura de ficheros de configuracion; esta variante corrige buena parte de esos casos, pero no hay garantia fuera del conjunto evaluado.
- Riesgo de alucinacion no cuantificado: no se han publicado metricas de fidelidad factual ni de sesgos.
- Idiomas: solo japones e ingles estan evaluados; el resto de idiomas figura como no disponible.
- Requisito de memoria de 115 GB, inviable fuera de estaciones de trabajo Apple de gama alta; el rendimiento de 37 tok/s limita su uso interactivo en produccion.
- Licencia qwen-community-1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de los resultados del autor.
- Dependencia de una version concreta de mlx-vlm (0.7.11 en las pruebas) y de un drafter MTP externo que, en esta cuantizacion, no aporta mejora de velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8-ngram4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante e4o8: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8
- Variante uniforme de 4 bits: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit
- Variante de 8 bits: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit
- Drafter MTP: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-MTP-bf16
