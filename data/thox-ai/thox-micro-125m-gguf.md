# Thox-ai/thox-micro-125m-GGUF

## Resumen

thox-micro-125m-GGUF es la distribucion en formato GGUF del modelo base thox-micro-125m, un modelo de lenguaje de 123 millones de parametros entrenado desde cero por THOX.ai LLC. El repositorio contiene cuatro builds cuantizados (F16, Q8_0, Q4_K_M y Q4_0) pensados para su ejecucion con llama.cpp y Ollama en dispositivos locales, incluyendo entornos de borde (edge) y hardware de consumo. El modelo forma parte de la linea de investigacion de modelos pequenos de THOX y no deriva de ningun modelo base externo.

Se trata de un modelo de tipo base (no instruct), por lo que esta disenado para completado de texto y no para conversacion con formato de chat. Su tamano reducido (123.587.328 parametros segun los pesos originales en safetensors) lo situa en la categoria de modelos ultraligeros, aptos para inferencia en CPU y GPU de baja capacidad. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en su enfoque local-first: builds verificables con SHA-256, compatibilidad con Ollama mediante el Modelfile incluido y un peso de repositorio de aproximadamente 0,5 GB que facilita su distribucion y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base entrenado desde cero; detalles de capas y atencion no disponibles) |
| Parametros totales | 123.587.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien existen pesos originales en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de 123 millones de parametros entrenado desde cero por THOX.ai como parte de su linea de investigacion de modelos pequenos. La model card no especifica el numero de capas, dimensiones de atencion, numero de cabezas ni la funcion de activacion empleada. Tampoco se detalla si utiliza atencion multi-cabeza clasica o alguna variante como grouped-query attention.

El corpus de entrenamiento se describe como mayoritariamente en ingles, sin cifras concretas sobre numero de tokens, composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. El modelo es de tipo base, no instruct, lo que implica que no ha pasado por un proceso de alineacion conversacional. La dimension de la capa FFN es 2048, dato que la model card menciona como condicion para la disponibilidad del formato Q4_0 (divisible por 32). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto por completado: el modelo es de tipo base, por lo que funciona con prompts de continuacion, no con formato de chat.
- Razonamiento y conocimiento general limitado: al ser un modelo de 123M de parametros, su fiabilidad factual es baja y requiere verificacion de respuestas.
- Capacidades multilingues restringidas: solo se declara soporte de ingles; el rendimiento en otros idiomas es inferior segun la propia model card.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades de vision ni audio.
- Sin modo thinking explicito.
- Ejecucion en dispositivo: disenado para inferencia local con llama.cpp y Ollama.

## Casos de uso

- Completado de texto en dispositivos de borde: el modelo puede integrarse en aplicaciones locales que requieran autocompletado o generacion de texto breve sin conexion, gracias a sus builds Q4_0 y Q4_K_M de 81 MB y 84 MB respectivamente.
- Prototipado rapido de pipelines de generacion: util para validar infraestructura de inferencia con llama.cpp u Ollama antes de escalar a modelos mayores, dado su reducido tamano y su licencia permisiva.
- Educacion e investigacion: sirve como caso de estudio de un modelo entrenado desde cero con 123M de parametros, util para experimentos academicos sobre modelos pequenos y cuantizacion.
- Pruebas de integracion en sistemas embebidos: su huella de memoria reducida permite desplegarlo en dispositivos con recursos limitados para tareas de generacion de texto auxiliar.
- Generacion de texto en aplicaciones con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en escenarios donde la confidencialidad es prioritaria.
- Benchmarking de cuantizacion: los cuatro formatos incluidos (F16, Q8_0, Q4_K_M, Q4_0) permiten comparar la degradacion de calidad frente al ahorro de espacio en un modelo de referencia pequeno.
- Filtrado o clasificacion de texto simple: con prompts de completado adecuados, puede emplearse en tareas auxiliares de etiquetado o generacion de resumenes muy breves, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ningun resultado de THOX GATE49 publicado para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 81 MB en Q4_0, 85 MB en Q4_K_M, 133 MB en Q8_0 y 249 MB en F16, segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 0,5 GB de memoria libre es suficiente; el modelo cabe en GPUs integradas y en aceleradores de borde.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (por ejemplo, GTX 1050, RTX 3050, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama mediante `ollama run hf.co/Thox-ai/thox-micro-125m-GGUF:Q4_K_M` o el Modelfile incluido, y descarga via `hf download`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| thox-micro-125m-GGUF | 123M | No disponible | Ingles | Apache-2.0 | GGUF |
| Modelos comparables de 100-150M | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Fiabilidad factual debil: al ser un modelo base de 123M de parametros, puede generar afirmaciones incorrectas con facilidad; es imprescindible verificar las respuestas importantes.
- Sesgos derivados de los datos de entrenamiento: el comportamiento y los sesgos reflejan un corpus mayoritariamente en ingles, con calidad inferior en otros idiomas.
- No es un asistente alineado para seguridad: la model card advierte que no debe desplegarse como asistente publico sin las salvaguardas de THOX.
- Fuera de alcance: decisiones medicas, legales, financieras, de seguridad critica o de alto riesgo sin revision humana; control no supervisado de dispositivos fisicos sin paso de confirmacion.
- Degradacion por cuantizacion: los formatos de menor numero de bits (Q4_0, Q4_K_M) pierden mas precision que Q8_0 o F16.
- Modelo base, no instruct: no soporta formato de chat; debe usarse con prompts de completado.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de casos de uso con entradas largas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
