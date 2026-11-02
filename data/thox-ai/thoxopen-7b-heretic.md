# Thox-ai/ThoxOpen-7B-Heretic

## Resumen

ThoxOpen-7B-Heretic es un modelo de generacion de texto de 7.248 millones de parametros desarrollado por Thox-ai (THOX.ai), obtenido mediante la tecnica de "abliteration" (ablacion direccional) sobre los pesos del modelo base `mistralai/Mistral-7B-Instruct-v0.3` de Mistral AI. El objetivo declarado es ofrecer un asistente local con comportamiento de rechazo deliberadamente reducido, orientado a desarrolladores que necesitan un modelo sin capas de seguridad restrictivas por defecto y que prefieren gestionar ellos mismos las salvaguardas. THOX no ha entrenado el modelo base; su aportacion es la ablacion, la cuantizacion y el empaquetado de perfiles de despliegue.

El modelo se distribuye en safetensors (tres shards, 14,49 GB en total) y en dos builds GGUF cuantizados (Q5_K_M de 5,14 GB y Q4_K_M de 4,37 GB), generados con llama.cpp. Incluye ademas un Modelfile para Ollama, un manifiesto de build y un "THOX Knowledge Pack v0.1" en JSONL usado para pruebas de grounding. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero clara: cubre el nicho de despliegue local-first en hardware de consumo, con pesos abiertos, formato Ollama listo para usar y sin restricciones de uso comercial derivadas de la licencia. No obstante, el repositorio no publica resultados de benchmarks medidos y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3, con ablacion direccional) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantizacion | safetensors (BF16/FP16 original), GGUF Q5_K_M, GGUF Q4_K_M |
| Idiomas soportados | ingles (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), GGUF (Q5_K_M, Q4_K_M), Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de 7.248 millones de parametros con atencion de ventana deslizante y GQA, entrenado originalmente por Mistral AI. THOX no ha realizado entrenamiento adicional ni fine-tuning sobre estos pesos; su intervencion consiste en aplicar el metodo Heretic de ablacion direccional sobre las direcciones de activacion asociadas al comportamiento de rechazo, reduciendo asi la tasa de respuestas negativas del modelo. El repositorio fija la revision del modelo base (`c170c708c41dac9275d15a8fff4eca08d52bab71`) y declara explicitamente que no se han usado pesos Heretic de terceros.

El proceso de build incluye la conversion a GGUF con una version fijada de llama.cpp, que requirio cuatro intentos (tres jobs fallidos en Hugging Face Jobs el 2026-11-01). El repositorio incluye registros de build (`build/full/full-results.json`, `study.jsonl`, `config.toml`) con hashes SHA-256 de cada shard y de cada GGUF, verificados contra los objetos almacenados en el repositorio. No se documentan datos de entrenamiento adicionales, procesos de RLHF/DPO ni innovaciones tecnicas mas alla de la propia ablacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Instruct v0.3.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y explicaciones tecnicas (capacidad heredada del base, no evaluada en el repositorio).
- Comportamiento de rechazo reducido de forma deliberada mediante ablacion direccional (perfil "minimal-refusal").
- Integracion con Ollama mediante Modelfile incluido (perfiles para Q5_K_M y Q4_K_M).
- Grounding sobre un paquete de conocimiento propio (THOX Knowledge Pack v0.1) mediante prueba de humo incluida en el repositorio.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (el base Mistral-7B-Instruct-v0.3 lo soporta, pero el autor no lo declara para este build).
- Capacidades de agente multi-paso: no documentadas.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Asistente personal local en hardware de consumo: los GGUF Q4_K_M (4,37 GB) y Q5_K_M (5,14 GB) caben en GPUs con 6-8 GB de VRAM y en CPU con suficiente RAM, lo que permite ejecutar el modelo en un portatil o mini-PC sin conexion a internet.
- Desarrollo de personajes conversacionales sin filtros editoriales: el perfil "minimal-refusal" reduce las negativas del modelo, util para escritura creativa, roleplay y generacion de dialogos donde las capas de seguridad por defecto resultan obstructivas, siempre que el desarrollador anada su propia capa de moderacion.
- Prototipado rapido con Ollama: el Modelfile incluido permite `ollama create` y `ollama run` directamente sobre los GGUF publicados, acelerando la puesta en marcha de demos y pruebas de concepto.
- Asistencia de codigo en entornos air-gapped: al ser un modelo local con licencia Apache 2.0, puede desplegarse en infraestructura sin salida a internet para autocompletado y explicacion de codigo en entornos con requisitos de confidencialidad.
- Base para experimentos de ablacion e interpretabilidad: investigadores que estudien tecnicas de reduccion de rechazo pueden usar este modelo como referencia reproducible, dado que el repositorio documenta el metodo, la revision del base y los hashes de los pesos.
- Pipeline de generacion de texto por lotes en ingles: con 7.248 millones de parametros y cuantizacion Q4_K_M, es viable para tareas de resumen, reescritura o clasificacion sobre grandes volumenes de documentos en ingles en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que "the build's measured results are filled in below", pero no se incluyen tablas de MMLU, HumanEval, GSM8K ni metricas de rechazo en la informacion proporcionada. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con Q4_K_M y 5,5-6,5 GB con Q5_K_M (incluyendo overhead de contexto y cache KV); en safetensors BF16 se requieren unos 15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para los GGUF; A100 o H100 para servir los safetensors en BF16 con concurrencia.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM usando Q4_K_M o Q5_K_M; tambien en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp (GGUF), vLLM o TGI (safetensors, requiere conversion o carga directa), Hugging Face Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxOpen-7B-Heretic | 7,248 M | no disponible (base: 32.768) | Apache 2.0 | safetensors, GGUF, Modelfile | Abliterado, solo ingles, sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,248 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base sin ablacion, con capas de seguridad estandar |
| Modelos abliterados de la comunidad sobre Mistral-7B (p. ej. variantes "uncensored") | ~7.000 M | variable | Apache 2.0 o similar | safetensors, GGUF | THOX declara no usar pesos Heretic de terceros; no se dispone de comparativa de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de ThoxOpen-7B-Heretic con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo esta reducido de forma deliberada, por lo que puede generar contenido inapropiado, danino o inseguro. El propio autor advierte de que no debe desplegarse a usuarios finales sin una capa de seguridad propia.
- No apto para decisiones medicas, legales, financieras o de seguridad critica sin revision humana cualificada, segun la model card.
- Riesgo de alucinacion: inherente al modelo base; no se documentan evaluaciones de fidelidad factual mas alla de la prueba de humo de grounding con el Knowledge Pack v0.1.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- La longitud de contexto efectiva no se especifica en el repositorio; se hereda la del base (32.768 tokens), pero no hay confirmacion del autor.
- Licencia Apache 2.0: permite uso comercial, pero el desarrollador asume la responsabilidad legal y etica del contenido generado por un modelo sin alineamiento de seguridad.
- Repositorio sin descargas ni likes en el momento de la consulta, sin resultados de benchmarks publicados y sin modelo en el registro de Ollama; madurez y soporte comunitario limitados.
- El proceso de build requirio cuatro intentos y tres jobs fallidos, lo que sugiere fragilidad en el pipeline de publicacion.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-7B-Heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Sitio del autor: https://thox.ai (mencionado en la model card)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
