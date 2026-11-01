# vultr/Qwen3.5-35B-A3B-GGUF

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje multimodal con arquitectura Mixture-of-Experts (MoE) desarrollado por Qwen (Alibaba). El repositorio `vultr/Qwen3.5-35B-A3B-GGUF` contiene las cuantizaciones GGUF de este modelo realizadas por Vultr, pensadas para su despliegue con llama.cpp. El modelo combina un transformer MoE con un encoder de vision, lo que le permite procesar texto e imagenes de forma unificada.

La arquitectura destaca por su eficiencia: de los 35.000 millones de parametros totales, solo unos 3.000 millones se activan por token gracias a un esquema de 256 expertos con 8 enrutados y 1 compartido. Esta relacion permite un rendimiento cercano a modelos densos mucho mayores con un coste de inferencia mucho mas bajo. Ademas, incorpora Gated DeltaNet en una arquitectura hibrida orientada a razonamiento de contexto largo.

La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo multimodal de 35B en hardware mas modesto mediante cuantizacion GGUF hibrida, donde cada capa recibe una precision distinta segun una puntuacion de importancia medida. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe, Mixture-of-Experts hibrida con Gated DeltaNet y encoder de vision |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens, extensible a ~1M |
| Tipos de cuantizacion | GGUF (hibrida, precision por capa segun importancia medida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales de arquitectura: 40 capas, hidden size de 2.048, 16 cabezas de atencion, vocabulario de 248.320 tokens, encoder de vision de 27 capas, 256 expertos (8 enrutados + 1 compartido por token).

## Arquitectura y entrenamiento

El modelo es un MoE multimodal con una arquitectura hibrida que combina capas de atencion con Gated DeltaNet, un mecanismo de estado recurrente lineal pensado para reducir el coste computacional en secuencias largas. El bloque MoE cuenta con 256 expertos, de los que se seleccionan 8 por token mas un experto compartido, lo que mantiene el coste de inferencia en torno a los 3B de parametros activos pese a los 35B totales. El encoder de vision, de 27 capas, permite el procesamiento image-text-to-text.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card solo menciona el diseno para razonamiento de contexto largo y comprension multimodal. Las cuantizaciones de este repositorio son hibridas: Vultr asigna a cada capa una precision distinta en funcion de una puntuacion de importancia medida, de modo que los bits se concentran donde mas afectan a la salida.

## Capacidades

- Generacion de texto y razonamiento de contexto largo, con ventana de 262K tokens extensible a ~1M.
- Comprension multimodal image-text-to-text gracias al encoder de vision de 27 capas.
- Razonamiento multi-paso y tareas de agente (segun el diseno declarado del modelo base).
- Capacidades multilingues: la model card no detalla idiomas; el vocabulario de 248.320 tokens sugiere cobertura amplia, pero no se confirma.
- Despliegue compatible con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Uso conversacional (tag `conversational`).

No se confirma en la informacion disponible el soporte explicito de tool calling, function calling ni modos de pensamiento (thinking mode).

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto a texto y responder preguntas sobre su contenido, aprovechando el encoder de vision y el contexto de 262K tokens.
- Procesamiento de corpus largos: resumenes y extraccion de informacion de contratos, informes o expedientes que superan la ventana de modelos densos convencionales, gracias a la extension hasta ~1M tokens.
- Asistente conversacional autoalojado: despliegue en llama.cpp sobre infraestructura propia para atencion al cliente o soporte interno, con coste de inferencia reducido por los ~3B de parametros activos.
- Razonamiento sobre documentacion tecnica: consultas multi-paso sobre manuales y especificaciones, combinando texto e imagenes de diagramas.
- Prototipado en estaciones de trabajo: las cuantizaciones GGUF permiten probar un modelo de 35B en equipos con GPU de consumo o incluso CPU, sin necesidad de cluster.
- Evaluacion comparativa de cuantizaciones: el esquema hibrido por capas de Vultr permite medir la perdida de calidad frente al modelo base en tareas concretas antes de pasar a produccion.
- Pipelines de vision por computadora asistida por lenguaje: descripcion de imagenes, extraccion de datos de graficos o verificacion de contenido visual con salida textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 87,1 GB, por lo que las cuantizaciones de mayor precision requeriran del orden de decenas de GB y las mas agresivas podrian situarse en torno a 15-20 GB, aunque no se confirman los tamanos por archivo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo, opciones como A100 o H100 son adecuadas para las cuantizaciones mayores; GPU de consumo como RTX 4090 (24 GB) podrian alojar cuantizaciones bajas, sin confirmacion.
- Cabe en GPU de consumo: posible con cuantizaciones agresivas, no confirmado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints. Otros motores como vLLM u Ollama no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el propio modelo base `Qwen/Qwen3.5-35B-A3B` en safetensors seria la alternativa de mayor precision frente a esta version GGUF cuantizada; la diferencia principal es el formato y el esquema de cuantizacion hibrida por capas.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| vultr/Qwen3.5-35B-A3B-GGUF | ~35B (3B activos) | 262K (ext. ~1M) | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-35B-A3B | ~35B (3B activos) | 262K (ext. ~1M) | Apache 2.0 | safetensors |

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos especificos de mitigacion.
- La cuantizacion GGUF introduce perdida de precision respecto al modelo base; el esquema hibrido de Vultr busca minimizarla, pero no se publican metricas de degradacion.
- Idiomas soportados no confirmados; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- La ventana extensible a ~1M tokens puede degradar la calidad en los extremos; no se especifica la metodologia de extension.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia y los terminos del modelo base Qwen.
- Repositorio con muy pocas descargas (160) y cero likes en el momento de la consulta; no hay evidencia de comunidad ni validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vultr/Qwen3.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Vultr: https://www.vultr.com/
- Documentacion de Vultr: https://docs.vultr.com/
- Wikipedia (Vultr): https://en.wikipedia.org/wiki/Vultr
