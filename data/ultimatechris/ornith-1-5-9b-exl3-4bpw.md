# ultimatechris/Ornith-1.5-9B-EXL3-4bpw

## Resumen

Ornith-1.5-9B-EXL3-4bpw es una cuantización en formato EXL3 (4.0 bpw) del modelo base ornith-ai/Ornith-1.5-9B, realizada por el usuario de HuggingFace ultimatechris. El modelo base pertenece a la familia Ornith AI, una serie de modelos de código abierto orientados a tareas de programación agéntica (agentic coding) que incluye variantes desde 9B densos hasta 397B MoE. Esta cuantización reduce el tamaño del modelo para facilitar su ejecución en hardware con recursos limitados, manteniendo la mayor parte de las capacidades del original.

El archivo safetensors contiene 3.592.713.968 parámetros, aunque el nombre del modelo sugiere 9B; es posible que se trate de un modelo MoE con parámetros activos inferiores a los totales, aunque no se confirma en la documentación disponible. La conversión se realizó con ExLlamaV3 1.4.2 en modo de alta calidad (high-quality), con el head del modelo almacenado a 6 bpw y el resto a 4.0 bpw. El repositorio incluye los archivos de tokenizador, plantilla de chat y configuración necesarios para su uso con frontends compatibles con ExLlamaV3, como TabbyAPI.

Esta cuantización es relevante para desarrolladores que desean ejecutar un modelo de programación de última generación en GPUs con VRAM limitada, aprovechando la licencia MIT del modelo base. No se trata de un lanzamiento oficial de Ornith AI, sino de una contribución comunitaria verificada con una prueba de generación en una A100 40GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura exacta no especificada en la informacion disponible; el nombre sugiere 9B, posiblemente MoE) |
| Parametros totales | 3.592.713.968 (segun safetensors; el nombre del modelo indica 9B, discrepancia no aclarada) |
| Parametros activos | No disponible (posible MoE, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (high-quality, head a 6 bpw) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (EXL3) |

## Arquitectura y entrenamiento

Esta ficha describe una cuantización, no un modelo entrenado desde cero. El modelo base Ornith-1.5-9B fue desarrollado por Ornith AI, una iniciativa que publica modelos de código abierto especializados en programación agéntica. Según la informacion publica de Ornith AI, sus modelos abarcan desde 9B densos hasta 397B MoE, con rendimiento destacado en benchmarks de codigo frente a modelos de tamano similar. Sin embargo, no se dispone de detalles tecnicos sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) ni sobre el proceso de entrenamiento (volumen de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada.

La cuantizacion fue realizada con ExLlamaV3 1.4.2, utilizando el modo de alta calidad (`-hq`) que mantiene ciertos tensores sensibles a mayor precision y el head del modelo a 6 bpw. El proceso se llevo a cabo en una NVIDIA A100 40GB. El repositorio incluye todos los archivos necesarios para cargar el modelo con ExLlamaV3, incluyendo tokenizador, plantilla de chat y configuracion.

## Capacidades

- Generacion de codigo y asistencia en programacion: el modelo base esta disenado para tareas de coding agéntico, lo que incluye generacion, explicacion y depuracion de codigo.
- Razonamiento multi-paso: orientado a agentes que deben planificar y ejecutar acciones complejas sobre un entorno de desarrollo.
- Soporte de tool calling y function calling: probablemente integrado, dado el enfoque agéntico del modelo base, aunque no se confirma explicitamente en la documentacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo conversacional: el pipeline declarado es text-generation, con plantilla de chat incluida.

## Casos de uso

- Asistente de programacion en entornos locales: el modelo puede integrarse en IDEs o editores de codigo para ofrecer autocompletado, generacion de funciones y explicacion de fragmentos, gracias a su tamano reducido que permite ejecucion en GPUs consumer.
- Agente autonomo de resolucion de incidencias: con soporte de tool calling, puede utilizarse en pipelines de CI/CD para analizar errores, proponer parches y ejecutar comandos de forma automatizada.
- Generacion de documentacion tecnica: el modelo puede redactar comentarios, docstrings y documentacion de API a partir de codigo fuente, aprovechando su entrenamiento en datos de programacion.
- Prototipado rapido de aplicaciones: desarrolladores pueden usarlo para generar esqueletos de proyectos, plantillas de funciones y tests unitarios, acelerando el ciclo de desarrollo.
- Educacion y formacion en programacion: el modelo puede actuar como tutor interactivo, explicando conceptos, corrigiendo ejercicios y generando ejemplos adaptados al nivel del estudiante.
- Automatizacion de tareas de refactorizacion: con contexto suficiente, puede sugerir mejoras de estilo, optimizaciones de rendimiento y cambios de arquitectura en codigo existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion solo menciona una prueba de carga y generacion en una NVIDIA A100-40GB, que produjo 31 tokens a 20.9 tokens/segundo. No se proporcionan metricas de calidad como MMLU, HumanEval o GSM8K para esta version cuantizada ni para el modelo base Ornith-1.5-9B.

## Requisitos de hardware

- VRAM estimada: el archivo safetensors ocupa 7.2 GB, por lo que se requiere al menos 8 GB de VRAM para cargar el modelo en memoria. Con cuantizacion EXL3 4.0 bpw, el uso real de VRAM puede rondar los 6-7 GB, dejando margen para el contexto.
- GPU recomendadas: la prueba oficial se realizo en una NVIDIA A100 40GB, pero el modelo deberia ejecutarse en GPUs consumer con 8 GB o mas, como RTX 3060, RTX 4060, RTX 3070, RTX 3080, etc. Para contextos largos, se recomienda al menos 12 GB.
- Opciones de despliegue: el formato EXL3 requiere frontends compatibles con ExLlamaV3, como TabbyAPI. No es compatible directamente con llama.cpp, Ollama o vLLM sin conversion adicional.
- Latencia y throughput: en la prueba documentada se obtuvo 20.9 tokens/segundo en A100-40GB. En GPUs consumer, la velocidad sera menor, dependiendo de la memoria y el ancho de banda.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos en la informacion proporcionada. El modelo base Ornith-1.5-9B no tiene benchmarks publicados en las fuentes consultadas, por lo que no es posible establecer una comparativa objetiva con alternativas como Qwen2.5-Coder-7B, DeepSeek-Coder-6.7B o CodeLlama-7B.

## Limitaciones y advertencias

- La cuantizacion puede introducir una ligera degradacion en la calidad de generacion respecto al modelo original en precision completa, aunque el modo high-quality intenta mitigarlo.
- No se han publicado evaluaciones de sesgos o alucinaciones para este modelo especifico. Como cualquier modelo de lenguaje, puede generar codigo incorrecto o inseguro, por lo que se recomienda supervisar su uso en entornos de produccion.
- La longitud de contexto no esta documentada; es probable que herede la del modelo base, pero no se puede confirmar.
- El modelo esta orientado principalmente a codigo y razonamiento tecnico; su rendimiento en tareas generales o multilingues no esta verificado.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario revisar los terminos del modelo base original.
- El repositorio es una contribucion comunitaria, no un lanzamiento oficial de Ornith AI; no hay garantia de soporte o actualizaciones.

## Enlaces

- Repositorio de HuggingFace de la cuantizacion: https://huggingface.co/ultimatechris/Ornith-1.5-9B-EXL3-4bpw
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Sitio web de Ornith AI: https://ornith.ai/
- Guia de Ornith AI (modelos y benchmarks): https://ornith.online/
- Guia alternativa de Ornith 1.0: https://ornith.site/
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Frontend recomendado TabbyAPI: https://github.com/theroyallab/tabbyAPI
