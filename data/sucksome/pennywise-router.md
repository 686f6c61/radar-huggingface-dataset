# SuckSome/pennywise-router

## Resumen

Pennywise router es un modelo de decisión entrenado con aprendizaje por refuerzo que actúa como enrutador de modelos de lenguaje: dado el texto de una petición, clasifica qué nivel de modelo (pequeño, mediano o grande) es el mínimo necesario para responderla correctamente, con el objetivo de reducir coste y latencia sin sacrificar calidad. El autor, Saksham Sharma (BITS Pilani), lo publica en Hugging Face bajo licencia Apache 2.0.

Técnicamente se trata de un clasificador de texto construido sobre ModernBERT-large (referido como "Laya"), exportado a ONNX y dividido en dos grafos: un tronco compartido y unas capas superiores con cabeza de decisión, disponibles en dos variantes según el parámetro de compensación λ (calidad frente a coste). Se integra en un ecosistema propio mediante un servidor MCP publicado en npm (`pennywise-mcp`), que descarga y verifica los pesos automáticamente y expone una herramienta de enrutado hacia tres modelos concretos: `nvidia/nemotron-3.5-bolt-e4b` (small), `openai/gpt-oss-20b` (medium) y `nvidia/nemotron-3-ultra-550b-a55b` (large).

Su relevancia reside en el creciente interés por el enrutado económico de LLMs: en lugar de enviar todas las peticiones al modelo más capaz, un clasificador ligero decide el nivel mínimo suficiente. El autor reporta que, en un benchmark de código agéntico de 10 tareas, Pennywise completó todas las tareas en 11,0 minutos frente a 36,9 minutos del Auto Router integrado en la app Alan, es decir, 3,4 veces más rápido con el mismo ratio de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (codificador transformer) con cabeza de decisión entrenada con RL |
| Parametros totales | no disponible (repo de 2,0 GB en formato ONNX) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada `input_ids` int64 [1,L], longitud variable) |
| Tipos de cuantizacion | no disponible (pesos float32 en los grafos ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`lower.onnx` de 1,38 GB y `upper_*.onnx` de 0,30 GB cada uno) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. El grafo `lower.onnx` contiene el tronco compartido de ModernBERT-large: recibe `input_ids` y `attention_mask` (int64, forma [1,L]) y produce un estado oculto `h` (float32, forma [1,L,1024]). Los grafos `upper_lam0.onnx` y `upper_lam0.5.onnx` contienen las capas superiores y la cabeza de decisión: toman `h`, `attention_mask`, `marker_pos` (int64 [1,3]) y `marker_mask` (bool [1,3]), y devuelven `probs` (forma [1,3]), una distribución de probabilidad sobre las tres clases de enrutado: small, medium y large. El tokenizador y el prefijo fijo de pregunta de enrutado no viajan con los pesos ONNX, sino que se incluyen dentro del paquete npm.

El entrenamiento se realizó con aprendizaje por refuerzo, optimizando el equilibrio entre acierto y coste mediante un hiperparámetro λ: la variante con λ = 0 se inclina hacia la calidad (tiende a elegir modelos más grandes), mientras que la variante con λ = 0,5 es la opción equilibrada y constituye el modo `auto` por defecto del sistema. No se ha publicado información sobre el dataset de entrenamiento, el número de pasos, el algoritmo de RL concreto ni el proceso de evaluación durante el entrenamiento.

## Capacidades

- Clasificacion de texto para enrutado de LLMs: asigna a cada peticion una de tres clases (small, medium, large) segun el nivel de modelo necesario.
- Dos modos de decision ajustables: λ = 0 (pro-calidad) y λ = 0,5 (equilibrado, modo `auto` por defecto).
- Inferencia eficiente en ONNX, sin dependencia de un framework de deep learning concreto.
- Integracion como servidor MCP (`pennywise-mcp`) que expone la herramienta `ask_routed`, con verificacion automatica sha256 de los pesos descargados.
- Compatibilidad con clientes MCP, incluida la aplicacion de escritorio Alan.
- No genera texto: es un modelo de clasificacion, no un LLM generativo.

## Casos de uso

- Enrutado economico de trafico en plataformas LLM: un gateway puede clasificar cada peticion con Pennywise y enviarla al tier minimo suficiente, reduciendo el coste por token frente a enviar todo al modelo grande.
- Agentes de codigo con multiples llamadas a modelos: en flujos agenticos con decenas o cientos de llamadas, enrutar las tareas triviales a modelos pequenos reduce drasticamente la latencia total, como muestra el benchmark del autor (11,0 min frente a 36,9 min en 10 tareas).
- Integracion en clientes MCP: mediante `npx -y pennywise-mcp`, cualquier cliente compatible con MCP (como la app Alan) puede ofrecer enrutado automatico sin configuracion adicional.
- Optimizacion de costes en pipelines de produccion: sistemas RAG o de atencion al cliente pueden usar el clasificador para decidir si una consulta simple la resuelve un modelo de 4B en lugar de uno de 550B.
- Evaluacion de politicas de enrutado: las dos variantes (λ = 0 y λ = 0,5) permiten comparar experimentalmente el trade-off coste-calidad en un conjunto de trafico real.
- Despliegue ligero en CPU o edge: al ser un codificador BERT en ONNX de unos 2 GB, puede ejecutarse sin GPU dedicada como parte de la infraestructura de enrutado.

## Benchmarks y rendimiento

El unico dato publicado procede de la model card del autor y no incluye metricas estandarizadas (MMLU, GSM8K, etc.):

| Benchmark | Pennywise router | Auto Router (Alan) |
|---|---|---|
| Benchmark agéntico de código (10 tareas) | 10/10 en 11,0 min | 10/10 en 36,9 min |

Pennywise fue 3,4 veces mas rapido que el Auto Router de Alan con el mismo ratio de exito. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni la composicion del benchmark de codigo utilizado.

## Requisitos de hardware

- VRAM / memoria: el repo completo ocupa 2,0 GB en float32; en inferencia bastaria con aproximadamente 2-3 GB de RAM, y al ser un modelo tipo BERT es ejecutable en CPU sin GPU dedicada. No se han publicado cifras oficiales de VRAM ni de latencia.
- GPU recomendadas: no necesarias para el enrutador; las llamadas a los modelos de destino (small, medium, large) se realizan via API (se requiere la variable de entorno `NVIDIA_API_KEY` para la herramienta `ask_routed`).
- Consumer hardware: ejecutable en portatiles y equipos de escritorio convencionales gracias al formato ONNX.
- Despliegue: via npm con `npx -y pennywise-mcp` (servidor MCP que descarga y verifica los pesos automaticamente); integracion nativa en la app de escritorio Alan (Settings → Plugins → MCP → Add custom connector → Command). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el dato de rendimiento publicado (3,4x mas rapido que el Auto Router de Alan) se refiere al sistema completo de enrutado, no al clasificador aislado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Pennywise router | Clasificador de enrutado (ModernBERT-large, RL) | no disponible | ONNX | Apache 2.0 | Elige entre 3 tiers fijos de modelos |
| RouteLLM (LMSYS) | Framework de enrutado con clasificadores y matrices de similaridad | varia segun el router elegido | PyTorch | Apache 2.0 | Enrutado entre pares de modelos configurables (p. ej. GPT-4 vs Mixtral) |
| Auto Router (Alan) | Enrutador integrado en la app Alan | no disponible | no disponible | cerrado | Enrutado automatico interno; 3,4x mas lento que Pennywise en el benchmark del autor |

Nota: la comparativa con RouteLLM es orientativa, ya que no se han publicado benchmarks comparativos directos entre ambos sistemas en la informacion disponible.

## Limitaciones y advertencias

- El modelo no genera texto: es un clasificador de tres clases y solo resulta util dentro de un sistema que disponga de los tres modelos de destino.
- Los tiers de enrutado estan fijados a tres modelos concretos (nemotron-3.5-bolt-e4b, gpt-oss-20b y nemotron-3-ultra-550b-a55b); no hay evidencia publicada de que funcione con otros modelos.
- Los resultados publicados (benchmark de 10 tareas, 3,4x de mejora) provienen unicamente del autor, no han sido verificados de forma independiente y el benchmark no esta descrito en detalle.
- No se ha publicado informacion sobre sesgos, tasa de alucinacion (no aplicable a un clasificador) ni tasa de error de enrutado (peticiones asignadas a un tier insuficiente).
- Idiomas soportados, longitud maxima de contexto y detalles de entrenamiento: no disponibles.
- El proyecto tiene 0 descargas registradas en Hugging Face en el momento de la ficha, por lo que carece de adopcion comunitaria demostrada; conviene evaluarlo con cautela antes de uso en produccion.
- La herramienta `ask_routed` requiere una clave de API de NVIDIA, lo que introduce una dependencia externa y costes asociados a las llamadas a los modelos de destino.
- La licencia Apache 2.0 permite uso comercial sin restricciones destacables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SuckSome/pennywise-router
- Servidor MCP en npm: https://www.npmjs.com/package/pennywise-mcp
- Sitio web del proyecto: https://getpennywise.pages.dev
