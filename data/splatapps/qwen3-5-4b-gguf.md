# splatapps/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una conversión a formato GGUF del modelo Qwen/Qwen3.5-4B, desarrollado por el equipo Qwen de Alibaba Cloud y publicado en este repositorio por Splat Apps Ltd. (splatapps) como artefacto de despliegue para su asistente Blade AI Free dentro de la plataforma Infrablade. No se trata de un modelo nuevo ni de un ajuste fino: los pesos originales se han convertido de safetensors a GGUF en bf16 y posteriormente cuantizado a Q4_K_M, sin reentrenamiento ni modificación de los parámetros.

El modelo base es un transformer de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), lo que lo sitúa en la gama de modelos compactos aptos para ejecución local en hardware de consumo. El repositorio ocupa 2,8 GB y contiene un único archivo cuantizado de 2.815.884.544 bytes, pensado para su uso con llama.cpp. La licencia es Apache 2.0, heredada del modelo original.

Su relevancia práctica radica en que permite ejecutar un modelo de la familia Qwen 3.5 en un PC convencional sin conexión a internet ni cuenta de usuario, con una ventana de contexto configurable (el ejemplo de la model card usa 32.768 tokens) y compatibilidad con el ecosistema llama.cpp, incluido el soporte de plantillas de chat mediante `--jinja`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B; detalles de atención y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso de la model card (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-4B-Q4_K_M.gguf`); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B mas alla de su naturaleza transformer y su recuento de parametros. No se detallan el numero de capas, la configuracion de atencion (MHA, GQA, atencion lineal), la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias. Esos datos corresponderian a la model card del modelo original de Qwen, que no forma parte de la informacion disponible.

Lo unico documentado en este repositorio es el proceso de conversion: los pesos oficiales en safetensors se transformaron a GGUF en bf16 con `convert_hf_to_gguf.py` de llama.cpp (release b12631) y despues se cuantizaron a Q4_K_M con `llama-quantize` de la misma release. No se aplico ningun tipo de entrenamiento, destilacion ni calibracion adicional mas alla de la propia cuantizacion. La innovacion tecnica relevante aqui es, por tanto, la propia cadena de conversion y cuantizacion, no el modelo.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el uso como asistente en Blade AI Free indican soporte de dialogos multi-turno mediante plantilla de chat (requiere `--jinja` en llama.cpp).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse a traves de infraestructura compatible con endpoints de Hugging Face.
- Ejecucion local sin conexion: el modelo esta disenado para correr enteramente en el PC del usuario, sin cuenta ni envio de datos a servidores externos.
- Razonamiento y generacion de codigo: capacidades propias del modelo base Qwen3.5-4B; no se detallan en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el campo de idiomas no esta relleno).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente personal offline en PC de consumo: el modelo, con 2,8 GB en Q4_K_M, puede cargarse en llama.cpp en un equipo con 8 GB de RAM o una GPU modesta, ofreciendo un asistente conversacional sin dependencia de la nube. Es exactamente el escenario para el que se publico (Blade AI Free).
- Despliegue de un servidor de chat local: mediante `llama-server -m Qwen3.5-4B-Q4_K_M.gguf --jinja -c 32768` se levanta una API compatible con OpenAI en local, util para prototipar aplicaciones de chat sin coste de inferencia.
- Procesamiento de documentos con contexto medio: con 32.768 tokens de ventana configurados, permite resumir o extraer informacion de documentos de decenas de paginas en una sola pasada, siempre que el modelo base mantenga coherencia en esa longitud.
- Entornos con requisitos de privacidad: al no enviar datos fuera del equipo, encaja en escenarios donde la informacion no puede salir de la maquina (sanidad, legal, desarrollo interno).
- Prototipado rapido de pipelines de generacion de texto: la cuantizacion Q4_K_M reduce los requisitos de memoria y permite iterar sobre prompts y plantillas de chat en un portatil antes de escalar a un modelo mayor.
- Educacion y experimentacion con LLM: un modelo de 4,3 mil millones de parametros en GGUF es un banco de pruebas asequible para estudiar cuantizacion, plantillas de chat y despliegue con llama.cpp sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 2.815.884.544 bytes (unos 2,8 GB); en la practica se recomienda disponer de al menos 4-6 GB de memoria libre para el modelo y el contexto (la ventana de 32.768 tokens anade memoria para la cache KV, cuyo tamano exacto depende de la configuracion de atencion del modelo base, no disponible).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cualquier GPU con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100) puede alojar el modelo; las GPU de datacenter no son necesarias.
- Cabe en GPU de consumo: si, con 2,8 GB de pesos en Q4_K_M es viable en practicamente cualquier GPU de consumo moderna con 6 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (documentado, con `llama-server` y `--jinja`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o interfaces basadas en llama.cpp; vLLM y TGI no se mencionan y habitualmente no consumen GGUF directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF (este repo) | 4,33 B | 32.768 en ejemplo de uso | GGUF Q4_K_M (2,8 GB) | Apache 2.0 | Conversion de Qwen/Qwen3.5-4B sin reentrenamiento |
| Qwen/Qwen3.5-4B (base) | 4,33 B | no disponible | safetensors | Apache 2.0 | Modelo original; mismos pesos sin cuantizar |
| Otros modelos de ~4 B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre este modelo y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en bf16; puede degradar ligeramente tareas sensibles como matematicas o generacion de codigo frente al modelo base sin cuantizar.
- No hay informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles; deben evaluarse antes de un uso en produccion.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de fiabilidad.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingue sin verificar el modelo base.
- La ventana de 32.768 tokens es la del ejemplo de la model card, no necesariamente el maximo nativo del modelo; superar el contexto real soportado puede producir degradacion.
- La licencia Apache 2.0 permite uso comercial, pero cualquier obligacion adicional del modelo base debe consultarse en la model card de Qwen/Qwen3.5-4B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (22 de noviembre de 2026): es un artefacto reciente y sin validacion comunitaria.
- Solo se publica una unica cuantizacion (Q4_K_M); no hay variantes Q5, Q8 ni bf16 en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/splatapps/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Infrablade / Blade AI Free: https://infrablade.com
