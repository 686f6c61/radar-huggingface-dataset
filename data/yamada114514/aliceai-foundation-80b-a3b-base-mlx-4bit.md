# Yamada114514/AliceAI-Foundation-80B-A3B-Base-MLX-4bit

## Resumen

AliceAI-Foundation-80B-A3B-Base-MLX-4bit es un port no oficial y experimental a MLX del modelo base de Yandex `yandex/AliceAI-Foundation-80B-A3B-Base`, publicado por el usuario Yamada114514. Se trata de una cuantizacion mixta de precision afin (MLX affine, group size 64, predominantemente 4 bits) acompanada de una implementacion MLX independiente y corregida (`model.py`) que no forma parte del soporte nativo de MLX-LM, Transformers, LM Studio ni ningun servidor de API. El repositorio ocupa 44,9 GB y contiene pesos en safetensors con 79.635.616.256 parametros totales, coherentes con la nomenclatura "80B-A3B" (80.000 millones de parametros totales, aproximadamente 3.000 millones activos por token, aunque este ultimo dato no se confirma explicitamente en la informacion disponible).

El modelo original emplea una arquitectura de mezcla de expertos (MoE) y esta entrenado para generacion de texto en ruso e ingles. Es importante subrayar que se trata de un modelo **base preentrenado**: no ha sido ajustado por instrucciones, no es apto para chat y no esta listo para produccion. El port no realizo ningun entrenamiento ni ajuste adicional; unicamente cuantizo y reparo los pesos. Ademas, los tensores MTP (multi-token prediction) quedan excluidos y la funcionalidad MTP esta desactivada (`mtp_num_hidden_layers=0`).

Su relevancia es principalmente practica para el ecosistema Apple Silicon: permite ejecutar en local un MoE de ~80.000 millones de parametros en un equipo con memoria unificada de 128 GB, con un consumo de disco de 41,81 GiB y velocidades de decodificacion medidas de 45,86-47,59 tok/s en la variante Q4. No obstante, el propio autor lo etiqueta como experimental, con validacion local limitada (0 descargas y 0 likes en el momento de la ficha) y sin benchmarks generales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la etiqueta `moe` del repositorio; detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 79.635.616.256 (79,64 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones, inferidos de la nomenclatura "A3B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible (la CLI de ejemplo esta limitada a 2.048 tokens de entrada y 1.024 de salida, limites de seguridad del ejemplo, no validacion de contexto largo) |
| Tipos de cuantizacion | MLX affine, group size 64, predominantemente 4 bits (no uniforme: router en BF16, pesos densos/expertos/embedding/output elegibles en Q4, normalizacion y tensores no elegibles conservan su precision almacenada). Existe una variante Q8 del mismo autor segun la tabla comparativa de la model card |
| Idiomas soportados | Ruso (ru) e ingles (en); se incluyen pruebas puntuales con salidas en japones, pero el japones no figura como idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con cuantizacion MLX; requiere `model.py` y la libreria `mlx` (no compatible de forma nativa con Transformers ni MLX-LM upstream) |
| Tamano del repositorio | 44,9 GB (uso en disco de la variante Q4: 41,81 GiB) |
| Modelo base | `yandex/AliceAI-Foundation-80B-A3B-Base`, revision `b7984f62fd212535d2de9094bfeba23de58cd7c8` |
| Tokenizer | Archivos del tokenizer original incluidos, `legacy=false`, `LlamaTokenizer`; sin plantilla de chat por defecto |
| MTP (multi-token prediction) | No implementado / desactivado |
| Libreria declarada | mlx |
| Fecha del repositorio | Creado el 2026-09-22, actualizado el 2026-09-22 (pruebas fechadas el 2026-09-22) |

## Arquitectura y entrenamiento

La arquitectura del modelo original es de mezcla de expertos, tal como indican la etiqueta `moe` y la nomenclatura "A3B" (parametros totales frente a activos). El port conserva la estructura del modelo base de Yandex y aplica una cuantizacion afin de MLX con group size 64, en la que la mayoria de los pesos elegibles se empaquetan en 4 bits mientras que los pesos del router se mantienen en BF16 y las capas de normalizacion conservan su precision original. Se conservan las correcciones de sesgo del router originales y los tensores MTP quedan fuera del paquete, de modo que la prediccion multi-token no esta operativa. Los safetensors publicados contienen exactamente los mismos bytes cuantizados que se probaron localmente; la reparacion en tiempo de ejecucion no recuantizo los pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base de Yandex uso RLHF, DPO u otras tecnicas de alineamiento. Este port, en concreto, no realizo ningun entrenamiento ni ajuste adicional: es exclusivamente una conversion y cuantizacion. La innovacion tecnica destacable es la implementacion MLX independiente (`model.py`) con `load_model(..., strict=True)`, acompanada de un runner (`inference.py`) que aplica decodificacion greedy, semilla 0, sin decodificacion especulativa y con un mecanismo de parada externo opcional basado en la deteccion de marcadores y preguntas separadas por lineas en blanco. Ese mecanismo no es un EOS natural.

## Capacidades

- Generacion de texto autoregresiva en ruso e ingles sobre un modelo base preentrenado, sin ajuste por instrucciones.
- Razonamiento aritmetico basico y calculos de memoria (por ejemplo, sumas de VRAM/RAM y determinacion de si un modelo cabe en memoria), verificado de forma puntual en el conjunto de confirmacion Q4.
- Generacion de codigo sencillo: en las comprobaciones de empaquetado se genero una funcion `count_positive` que supero seis pruebas de ejecucion restringidas.
- Capacidad multilingue limitada a ruso e ingles segun los metadatos; hay ejemplos que solicitan respuestas breves en japones, pero el japones no esta declarado como idioma soportado.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de soporte declarado de agentes ni de razonamiento multi-paso estructurado.
- No dispone de modo "thinking" explicito, ni de vision, ni de audio.
- La prediccion multi-token (MTP) esta desactivada y no implementada.
- No se instala plantilla de chat por defecto, por lo que no es "chat-ready".

## Casos de uso

- Ajuste fino supervisado sobre datos propios: al ser un modelo base en ruso e ingles con licencia Apache-2.0, puede servir como punto de partida para SFT o LoRA orientado a dominios concretos, teniendo en cuenta que la cuantizacion Q4 no es el formato ideal para reentrenar.
- Investigacion sobre cuantizacion de MoE: el repositorio permite comparar directamente Q4 y Q8 con las mismas tres prompts (ingles, ruso y japones), midiendo degradacion de calidad, uso de disco y velocidad, con la salvedad de que no hay benchmark general.
- Inferencia local en Apple Silicon: con memoria unificada de 128 GB, la variante Q4 ocupa 41,81 GiB en disco y alcanza 45,86-47,59 tok/s de decodificacion en un M5 Max, lo que permite experimentar con un MoE de ~80.000 millones de parametros sin GPU dedicada.
- Generacion de datos sinteticos en ruso e ingles: mediante prompting "raw" se puede usar el modelo base para producir texto de forma masiva, aunque sin garantia de calidad ni de seguimiento de instrucciones.
- Experimentos de traduccion ru-en y en-ru: el modelo declara ambos idiomas, si bien no se ha establecido la calidad de traduccion en la informacion disponible.
- Docencia y divulgacion tecnica: sirve para ilustrar el flujo completo de descarga, cuantizacion MLX, carga con codigo personalizado y medicion de latencia, throughput y memoria en hardware de Apple.
- Extraccion de caracteristicas y evaluacion de representaciones internas: al estar en formato safetensors con una implementacion MLX legible, es util para analizar el comportamiento de routers y expertos en un MoE cuantizado.
- Base para destilacion: un modelo de 80.000 millones de parametros totales con licencia permisiva puede actuar como profesor en procesos de destilacion hacia modelos mas pequenos, siempre que se validen previamente sus salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte explicitamente que la prueba del preset Q4 (5/6 frente a 3/6 en un conjunto de seis preguntas) **no es una puntuacion de precision general del 83%**, y que no se establecio la calidad en codigo ni en japones de proposito general con ese conjunto.

Lo unico disponible son mediciones de humo (smoke measurements) de tres prompts cortos en ingles, ruso y japones, con temperatura 0, semilla 0, un calentamiento corto y techo de 96 tokens:

| Metrica | Q4 | Q8 |
|---|---:|---:|
| Uso en disco local (GiB, redondeado) | 41,81 | 79,10 |
| Tiempo de carga (s, dependiente de cache del SO) | 1,477 | 8,376 |
| Rango de decodificacion, tres prompts (tok/s) | 45,86-47,59 | 42,10-43,09 |
| Prefill japones, 28 tokens de entrada (tok/s) | 243,17 | 220,43 |
| TTFT japones (s) | 0,115 | 0,127 |
| RSS pico del proceso (GiB) | 42,11 | 60,94 |
| Asignacion pico de MLX (GiB) | 42,10 | 79,40 |
| Delta de swap del sistema | 0 | 0 |
| Cuelgues / logits no finitos | ninguno observado | ninguno observado |
| EOS natural en esas tres ejecuciones | 0/3 | 0/3 |

Mediciones adicionales del conjunto de confirmacion Q4 de seis preguntas: mediana de decodificacion de 48,07 tok/s y TTFT de 0,937 s; todas las salidas se detuvieron antes de 256 tokens, por lo que el techo de 1.024 no aporto ninguna ganancia medida. El tiempo de traduccion humana queda excluido. No hay comparacion con modelos de referencia en la informacion proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada para Q4: 42,10 GiB de asignacion pico de MLX y 42,11 GiB de RSS pico del proceso, con 41,81 GiB en disco.
- VRAM/memoria unificada estimada para Q8: 79,40 GiB de asignacion pico de MLX, 60,94 GiB de RSS pico del proceso y 79,10 GiB en disco.
- Hardware probado: Apple M5 Max con 128 GB de memoria unificada y macOS. Es el unico hardware validado en la informacion disponible.
- GPU NVIDIA (A100, H100, RTX 4090) y GPUs de consumo: no soportadas por el port, ya que MLX esta disenado para Apple Silicon. No hay datos de conversion a otros runtimes.
- Despliegue: MLX con `mlx-lm==0.31.3` y `transformers==5.16.1` sobre Python 3.14, ejecutando el `inference.py` y el `model.py` incluidos. No se declara soporte nativo en vLLM, llama.cpp, Ollama, TGI, LM Studio ni servidores de API.
- Latencia y throughput medidos (M5 Max, Q4): decodificacion de 45,86-47,59 tok/s, prefill japones de 243,17 tok/s con 28 tokens de entrada, TTFT de 0,115 s. En Q8: 42,10-43,09 tok/s, prefill de 220,43 tok/s y TTFT de 0,127 s.
- Limites de la CLI de ejemplo: 2.048 tokens de entrada y 1.024 tokens de salida como cota de seguridad, no como validacion de contexto largo.
- Almacenamiento: el repositorio completo ocupa 44,9 GB; conviene reservar espacio adicional si se descargan tambien las variantes Q8 u otros artefactos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base-MLX-4bit (este port) | 79,64 mil millones | No disponible | 45,86-47,59 tok/s (decodificacion, M5 Max); sin benchmarks generales | Apache-2.0 | HuggingFace, formato MLX con codigo personalizado |
| yandex/AliceAI-Foundation-80B-A3B-Base (original) | No disponible en la informacion (nomenclatura 80B-A3B) | No disponible | No disponible | No disponible | HuggingFace; pesos sin cuantizar |
| Variante Q8 del mismo autor (mencionada en la model card) | 79,64 mil millones (presumiblemente) | No disponible | 42,10-43,09 tok/s; 79,10 GiB en disco | Apache-2.0 | No se confirma repositorio ni enlace en la informacion disponible |

No se dispone de datos de otros MoE comparables (por ejemplo, alternativas de ~30B-A3B o de ~80B) en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento con terceros.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no esta ajustado por instrucciones, no es apto para chat y no esta listo para produccion.
- No se instala plantilla de chat por defecto, por lo que cualquier uso conversacional requiere construir el formato manualmente.
- No se realizo ningun entrenamiento ni ajuste adicional; no hay garantia de calidad en tareas especificas.
- Los tensores MTP quedan excluidos y la funcionalidad esta desactivada: no se puede usar prediccion multi-token.
- Requiere ejecutar `model.py` propio del repositorio: es codigo personalizado y el propio autor recomienda revisarlo antes de ejecutarlo, lo que implica un riesgo de seguridad en entornos no controlados.
- No hay soporte nativo en MLX-LM upstream, Transformers, LM Studio ni servidores de API; la integracion depende de versiones concretas (`mlx==0.32.0`, `mlx-lm==0.31.3`, `transformers==5.16.1`, Python 3.14).
- Problemas de parada: en las tres ejecuciones de humo no se observo EOS natural (0/3 en Q4 y 0/3 en Q8). El mecanismo de parada del preset es externo y puede cortar prematuramente en conversaciones citadas o con multiples preguntas.
- La ventana de contexto real no esta validada; los limites de 2.048/1.024 tokens de la CLI son cotas de seguridad, no una prueba de contexto largo.
- Los idiomas declarados son ruso e ingles; el japones solo aparece en pruebas puntuales y no esta soportado oficialmente.
- Riesgo de alucinacion inherente a un modelo base sin alineamiento, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia Apache-2.0: permite uso comercial, pero se trata de un port no oficial sin garantias, sin mantenimiento declarado y con validacion local limitada (0 descargas, 0 likes en el momento de la ficha).
- El autor advierte que las pruebas de seis preguntas no constituyen una puntuacion de precision general, ni validan calidad de codigo o de japones de proposito general.
- La variante Q8 no ha pasado el estudio de seleccion de preset; su comportamiento con el mecanismo de parada externo esta sin verificar.
- Las fechas del repositorio (2026-09-22) y de las pruebas coinciden; conviene verificar la vigencia de las dependencias declaradas.

## Enlaces

- HuggingFace (este port): https://huggingface.co/Yamada114514/AliceAI-Foundation-80B-A3B-Base-MLX-4bit
- Modelo base original: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Paper, blog tecnico, repositorio de codigo o demo: no disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron exclusivamente paginas de morteros de construccion sin relacion con el modelo.
