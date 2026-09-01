# tt-hous/muse-glimmer-30b

## Resumen

Muse Glimmer 30B es un modelo de lenguaje y visión de código abierto desarrollado por Meta Superintelligence Labs, diseñado específicamente para tareas agénticas autónomas en entornos locales. Se trata de un modelo denso de aproximadamente 29.6 mil millones de parámetros, destilado a partir de Muse Spark, un modelo de mayor tamaño, con el objetivo de ofrecer capacidades de razonamiento multi-paso, llamada a herramientas fiable y recuperación ante fallos en hardware de consumo. El modelo incorpora un codificador de percepción ViT-G/14 de unos 1.800 millones de parámetros, lo que le permite procesar entradas intercaladas de texto e imagen, y admite una ventana de contexto de hasta 131.072 tokens (128K).

El repositorio `tt-hous/muse-glimmer-30b` no contiene los pesos del modelo directamente, sino que es un paquete contenedor `tt-model` que facilita el despliegue del modelo original (`meta-models/Muse-Glimmer-30B`) en hardware Tenstorrent. Este contenedor incluye el stack de servido basado en vLLM, con perfiles de rendimiento predefinidos para tarjetas P300x2, y permite arrancar el servicio con comandos simples como `tt-model pull` y `tt-model serve`. La relevancia actual de este modelo radica en su enfoque en agentes locales, con una arquitectura que emite razonamiento por canales y llamadas a herramientas en formato XML ATEM, en lugar de JSON, lo que requiere parsers específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador de vision ViT-G/14 (multimodal) |
| Parametros totales | 29.6B (aproximadamente 30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el contenedor descarga los pesos desde Hugging Face en tiempo de ejecucion) |

## Arquitectura y entrenamiento

Muse Glimmer 30B es un modelo de lenguaje causal denso con una arquitectura transformer multimodal. Incluye un codificador de percepcion ViT-G/14 de aproximadamente 1.800 millones de parametros que procesa imagenes, permitiendo entradas intercaladas de texto e imagen. El modelo fue destilado a partir de Muse Spark, un modelo de mayor tamano, con el objetivo de mantener capacidades agénticas avanzadas en un paquete mas ligero y eficiente para ejecucion local. No se han proporcionado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO.

Una caracteristica tecnica destacable es su formato de salida: el modelo emite razonamiento por canales (channel-scoped reasoning) y llamadas a herramientas en XML estilo ATEM, en lugar de JSON. Esto requiere parsers dedicados (`muse_glimmer` tool-call y reasoning parsers) para interpretar correctamente las salidas en aplicaciones agénticas. Ademas, ofrece niveles de intensidad de razonamiento seleccionables (bajo, medio, alto), lo que permite ajustar el equilibrio entre latencia y calidad del razonamiento segun el caso de uso.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo esta optimizado para tareas agénticas que requieren planificacion y ejecucion de multiples pasos.
- Comprension multimodal: procesa imagenes y texto intercalado gracias al codificador ViT-G/14, permitiendo analisis de documentos visuales, capturas de pantalla, diagramas, etc.
- Llamada a herramientas (tool calling): soporta invocacion de funciones con esquema definido, emitiendo llamadas en XML ATEM. Requiere parsers especificos para integrarse con APIs externas.
- Recuperacion ante fallos: disenado para manejar errores en la ejecucion de tareas y reintentar o corregir acciones de forma autonoma.
- Razonamiento ajustable: permite configurar la intensidad del razonamiento (low, medium, high) para adaptar la latencia y profundidad del analisis.
- Contexto largo: ventana de 128K tokens, adecuada para procesar documentos extensos o conversaciones multi-turno con historial amplio.
- Capacidades agénticas: orientado a agentes autonomos que operan de forma continua en entornos locales, con soporte para workflows siempre activos.

## Casos de uso

- Agentes de automatizacion de tareas ofimaticas: el modelo puede gestionar flujos de trabajo que implican leer correos, extraer datos de documentos adjuntos (incluyendo imagenes) y ejecutar acciones a traves de herramientas, gracias a su capacidad de razonamiento multi-paso y llamada a funciones.
- Asistente de codigo con contexto visual: al procesar capturas de pantalla de interfaces o diagramas de arquitectura, puede generar o modificar codigo en funcion de lo que ve, integrandose en entornos de desarrollo locales.
- Analisis de documentos tecnicos con imagenes: su ventana de 128K tokens y comprension multimodal permiten resumir informes extensos que contengan graficos, tablas o figuras, extrayendo conclusiones accionables.
- Chatbot de soporte con acceso a bases de conocimiento: puede consultar APIs externas mediante tool calling para responder preguntas de clientes, manteniendo el contexto de la conversacion y recuperandose de errores en las llamadas.
- Automatizacion de pruebas de software: el modelo puede interpretar capturas de pantalla de aplicaciones, razonar sobre los resultados esperados y ejecutar scripts de prueba, notificando fallos y sugiriendo correcciones.
- Agente de investigacion personal: capaz de buscar informacion en la web (via herramientas), leer articulos con figuras y sintetizar hallazgos en informes estructurados, todo ello ejecutandose localmente en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contenedor proporciona metricas de rendimiento de servido (TTFT, TPOT, E2EL, tokens por segundo) para el hardware Tenstorrent P300x2, pero no hay datos comparativos de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en las fuentes consultadas.

## Requisitos de hardware

- El contenedor `tt-hous/muse-glimmer-30b` esta disenado exclusivamente para hardware Tenstorrent, concretamente para el perfil `default` que utiliza dos tarjetas P300 (P300x2).
- No se especifican requisitos de VRAM para GPUs convencionales (NVIDIA, AMD). Meta indica que el modelo esta optimizado para "hardware de consumo", pero no se detallan cantidades de memoria.
- El despliegue se realiza mediante el comando `tt-model serve`, que arranca un contenedor Docker con el stack vLLM integrado. No requiere instalacion manual de tt-metal ni vLLM en el host.
- El primer arranque compila kernels JIT, lo que tarda aproximadamente 4 minutos antes de que el servicio este disponible.
- Las metricas de rendimiento publicadas (para P300x2, batch 1, concurrencia 1, OSL 512) muestran un TTFT de 65 ms para ISL 128 y hasta 25,59 s para ISL 130.560, con un throughput de 42,38 t/s/u en el caso mas favorable y 15,43 t/s/u en el de mayor entrada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (agénticos multimodales de ~30B). Aunque existen alternativas como Llama 3.1 8B o Qwen2.5-VL, no se han encontrado datos de rendimiento o caracteristicas comparables en las fuentes consultadas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en la informacion disponible, por lo que se desconoce si permite uso comercial o impone restricciones. Se recomienda consultar la pagina oficial de Meta antes de utilizarlo en produccion.
- El modelo requiere parsers dedicados para interpretar sus llamadas a herramientas en XML ATEM y su razonamiento por canales. Integrarlo con frameworks agénticos estandar que esperan JSON puede requerir adaptaciones adicionales.
- Al ser un modelo destilado, podria presentar una menor capacidad de razonamiento profundo en comparacion con el modelo original Muse Spark, aunque no se han publicado evaluaciones que lo confirmen.
- No se han proporcionado datos sobre sesgos, alucinaciones o limitaciones idiomaticas. Como modelo multimodal, podria tener sesgos en el reconocimiento de imagenes o en la generacion de texto en idiomas poco representados.
- El despliegue esta limitado a hardware Tenstorrent (P300x2) en el contenedor proporcionado. No se ofrecen instrucciones para ejecutarlo en GPUs de otros fabricantes.
- El primer arranque requiere compilacion JIT de kernels, lo que anade una latencia inicial de aproximadamente 4 minutos antes de que el servicio responda.

## Enlaces

- Repositorio contenedor: https://huggingface.co/tt-hous/muse-glimmer-30b
- Modelo original en Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Receta de vLLM para Muse Glimmer 30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- API y playground en Fireworks AI: https://fireworks.ai/models/fireworks/muse-glimmer-30b
