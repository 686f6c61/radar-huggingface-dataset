# tinyopsec/switchboard-router-4b-GGUF

## Resumen

Switchboard-router-4b (GGUF) es una colección de cuantizaciones en formato GGUF del modelo switchboard-router-4b, desarrollado por tinyopsec a partir de Qwen3-4B-Instruct-2507 (base de Qwen). Se trata de un modelo router de LLM: un modelo pequeño y rápido cuya función no es generar respuestas largas, sino clasificar y dirigir cada petición al modelo más adecuado del catálogo disponible, con el objetivo de optimizar costes en despliegues que combinan varios modelos de distinto tamaño o precio.

Su relevancia radica en el auge de las arquitecturas de enrutado semántico (model routing): en lugar de enviar todas las consultas a un modelo grande y caro, un router ligero decide en milisegundos si la petición puede resolverse con un modelo pequeño o debe escalarse a uno mayor. Al estar cuantizado en GGUF, este router puede ejecutarse localmente con llama.cpp, Ollama o LM Studio, incluso en hardware de consumo, lo que lo hace idóneo como primer eslabón de un pipeline de inferencia multi-modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-4B-Instruct-2507), usado como clasificador/router |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo original se distribuye en safetensors (~4,02 B parametros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder denso de 4 mil millones de parametros de la familia Qwen3. Sobre esta base, el autor ha adaptado el modelo para la tarea de enrutado (llm-routing): en lugar de generar texto largo, el modelo clasifica cada consulta y decide a qué modelo del conjunto debe dirigirse, priorizando la optimización de costes. Los detalles concretos del proceso de fine-tuning (dataset utilizado, numero de ejemplos de enrutado, metodo de entrenamiento) no están disponibles en la model card.

La distribucion aquí analizada es una re-cuantizacion a GGUF producida con llama.cpp, que abarca desde F16 (~8 GB) hasta Q2_K, pasando por trece variantes. El propio autor recomienda la variante Q4_K_M como equilibrio entre calidad y tamaño, y advierte de que se trata de un modelo de enrutado que debe evaluarse antes de usarse en produccion.

## Capacidades

- Enrutado de consultas LLM: clasifica peticiones de usuario y las dirige al modelo más adecuado, con foco en reduccion de costes.
- Generacion de texto conversacional: al derivar de un modelo instruct (Qwen3-4B-Instruct-2507), conserva capacidad de generacion de texto general, aunque su diseño esta orientado al routing.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con el formato.
- Baja latencia: al ser un modelo de 4B cuantizable hasta 2 bits, esta pensado para decisiones de enrutado rapidas en el camino critico de un pipeline.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Capacidades multilingues: no disponible (el modelo base Qwen3 soporta multiples idiomas, pero el fine-tuning de router no lo documenta).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Enrutado de costes en plataformas multi-modelo: como primer paso de un gateway de inferencia, el modelo decide si una consulta simple se resuelve con un modelo pequeño y barato o debe escalarse a uno grande, reduciendo la factura de inferencia.
- Gateways de API autoalojados: integrado en un proxy tipo LiteLLM o similar, clasifica cada request entrante en milisegundos antes de delegar al backend correspondiente.
- Sistemas RAG con enrutado condicional: decide si una pregunta necesita recuperacion de documentos y un modelo potente, o si puede responderse con un modelo ligero sin contexto adicional.
- Optimizacion de pipelines de agentes: en flujos multi-paso, enruta cada paso intermedio (clasificacion, extraccion, resumen) a modelos pequeños y reserva el modelo grande para la sintesis final.
- Despliegue local en hardware de consumo: con la variante Q4_K_M (~2,5 GB aprox.) puede ejecutarse en portatiles y GPUs domesticas, sirviendo como router en entornos edge o sin conexion.
- Filtrado previo de trafico: clasifica y descarta o redirige consultas triviales (saludos, spam, fuera de dominio) antes de que consuman cuota en modelos de pago.
- Experimentacion de estrategias de routing: base ligera para investigar politicas de enrutado semantico y su impacto en calidad frente a coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision de enrutado (accuracy, F1 sobre conjuntos de routing), ni comparativas con otros routers, ni evaluaciones de calidad por cuantizacion. El propio autor advierte de evaluar el modelo antes de usarlo en produccion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aprox., segun tamaño de archivo GGUF):
  - F16: ~8 GB
  - Q8_0: ~4,3 GB
  - Q6_K: ~3,3 GB
  - Q5_K_M / Q5_K_S / Q5_0: ~2,9–3,1 GB
  - Q4_K_M / Q4_K_S / Q4_0: ~2,4–2,6 GB (Q4_K_M recomendada por el autor)
  - Q3_K_L / Q3_K_M / Q3_K_S: ~2,0–2,3 GB
  - Q2_K: ~1,7 GB
  (Estimaciones tipicas para un modelo de 4B; el tamaño exacto de cada archivo debe consultarse en el repositorio.)
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas para las variantes de 4 bits; no se requieren GPUs de datacenter. En CPU moderna con suficientes GB de RAM tambien es viable dada la baja latencia esperada de un modelo de 4B.
- Cabe en GPUs de consumo: si. RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 e incluso GPUs integradas con RAM compartida ejecutan las variantes Q4 sin problemas.
- Opciones de despliegue: llama.cpp (llama-cli / llama-server), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Al tratarse de un router de 4B cuantizado, se espera latencia de primera respuesta del orden de decenas de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Funcion |
|---|---|---|---|---|
| switchboard-router-4b (GGUF) | ~4,02 B | GGUF (13 cuantizaciones) | Apache 2.0 | Router LLM para optimizacion de costes |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,02 B | Safetensors | Apache 2.0 | Chat e instrucciones generalistas |
| Router-classifier de RouteLLM (LMSYS) | no disponible | Safetensors | Apache 2.0 | Enrutado entre modelos fuertes y debiles |
| Nota | — | — | — | No existen muchos routers publicos de 4B en GGUF; la comparativa se limita a alternativas conocidas |

El modelo base Qwen3-4B-Instruct-2507 ofrece capacidades conversacionales generales con contexto largo, mientras que esta variante esta especializada en la tarea de enrutado. Frente a soluciones como RouteLLM, la ventaja principal es su disponibilidad en GGUF para ejecucion local ligera; su inconveniente es la ausencia de benchmarks publicos que permitan comparar precision de enrutado.

## Limitaciones y advertencias

- El propio autor incluye un disclaimer: se trata de un modelo de routing que debe evaluarse antes de usarse en produccion; no hay metricas publicadas de su precision de enrutado.
- No se han publicado datos sobre sesgos del modelo; al derivar de Qwen3, podria heredar sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinacion: como router, su salida es una decision de enrutado y no una respuesta de usuario; si se usa como chatbot general, puede generar respuestas incorrectas propias de un modelo de 4B.
- La longitud de contexto, los idiomas soportados y el soporte de tool calling no estan documentados en la model card, lo que dificulta evaluar su idoneidad para casos con prompts largos.
- Las cuantizaciones agresivas (Q3, Q2_K) pueden degradar la precision del enrutado; no hay evaluaciones por cuantizacion.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Informacion de la ficha con fecha de creacion 2026-10-29 y muy pocas descargas (406) y likes (0): proyecto muy reciente y con poco historial de uso comunitario, lo que sugiere precaucion adicional en entornos criticos.
- El tamaño del repositorio (39,3 GB) indica que contiene las trece cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/switchboard-router-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original (safetensors) referenciado en la model card: https://huggingface.co/switchboardllm/switchboard-router-4b
