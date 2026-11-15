# zenlm/zen6-nano-mlx

## Resumen

Zen 6 Nano (9B) es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Hanzo AI y Zen LM, distribuido en formato nativo para Apple Silicon mediante MLX con cuantizacion ternaria de 2 bits (afin con transformada de Hadamard). El modelo parte de una arquitectura transformer con una torre de vision en FP16 y un cuerpo de lenguaje cuantizado en 2 bits, lo que permite ejecutar un modelo de aproximadamente 9.410 millones de parametros en hardware de consumo de la familia M de Apple.

El modelo incorpora identidad propia de "Zen 6" y capacidades agenticas orientadas al protocolo MCP (Model Context Protocol) de Hanzo, con soporte explicito de llamadas a herramientas mediante la sintaxis `<tool_call>`. Se publica bajo licencia Apache-2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales.

Es relevante ahora porque combina tres tendencias concretas: cuantizacion extrema (2 bits ternarios con entrenamiento QAT y correccion Hadamard), despliegue local en silicio de Apple mediante MLX, y capacidades multimodales con tool calling en un unico artefacto. El repositorio ocupa 3,6 GB, lo que lo hace manejable en discos de portatiles y estaciones de trabajo con memoria unificada moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de vision FP16 + cuerpo de lenguaje cuantizado en 2 bits ternarios con base Hadamard) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit ternario afin con Hadamard (STE QAT); torre de vision en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), con runtime propio en `runtime/` |

## Arquitectura y entrenamiento

La model card describe el artefacto como los pesos exactos en base Hadamard de un modelo `zen6-nano` post-entrenado con cuantizacion ternaria mediante STE (Straight-Through Estimator) y QAT (Quantization-Aware Training). Es decir, el modelo no se cuantiza a posteriori: se entrena teniendo en cuenta la representacion ternaria de 2 bits, lo que suele preservar mejor la calidad que una cuantizacion post-hoc agresiva. La transformada de Hadamard se aplica para rotar la base de pesos y reducir el error de cuantizacion, una tecnica que se ha popularizado en esquemas de cuantizacion extrema.

El modelo es multimodal: incluye una torre de vision en FP16 y un procesador de imagen-texto, y se carga mediante un runtime propio (`vision_artifact.load_vl_model`) que devuelve modelo, procesador y configuracion. El pipeline declarado es `image-text-to-text`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion de atencion ni la longitud de contexto. La integracion con MCP y la sintaxis `<tool_call>` sugieren un post-entrenamiento orientado a agentes y uso de herramientas.

## Capacidades

- Generacion de texto conversacional con identidad propia ("Zen 6").
- Comprension de imagenes y respuesta en texto (pipeline `image-text-to-text`).
- Llamadas a herramientas mediante el protocolo MCP de Hanzo, con sintaxis `<tool_call>`.
- Capacidades agenticas de multiples pasos orientadas a flujos con herramientas externas.
- Ejecucion nativa en Apple Silicon mediante MLX (M1, M2, M3, M4 Max).
- Cuantizacion ternaria de 2 bits que reduce drasticamente el espacio de pesos.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local en portatiles Apple Silicon: el modelo se ejecuta con MLX en M1/M2/M3/M4 Max, permitiendo un asistente conversacional privado sin conexion a la nube, gracias a sus ~9,4B de parametros en 2 bits y su torre de vision FP16.
- Agente con herramientas MCP: la sintaxis `<tool_call>` y el soporte MCP permiten construir agentes que invocan APIs, bases de datos o servicios locales de forma estructurada, integrandose en flujos de automatizacion de escritorio.
- Analisis de imagenes en local: con el pipeline `image-text-to-text` se pueden procesar capturas, diagramas o documentos escaneados y generar descripciones o respuestas sin enviar datos a terceros.
- Prototipado rapido de aplicaciones multimodales: el quickstart incluido (`quickstart.py`) y el runtime de vision permiten validar ideas en minutos en un Mac, antes de escalar a infraestructura mayor.
- Investigacion en cuantizacion extrema: al publicar pesos ternarios con QAT y Hadamard bajo Apache-2.0, sirve como referencia reproducible para estudiar el impacto de 2 bits en calidad multimodal y agentica.
- Despliegue en entornos con restricciones de memoria: los 3,6 GB del repositorio y la cuantizacion ternaria permiten ejecutar el modelo en equipos con memoria unificada limitada, donde un modelo de 9B en FP16 no cabria.
- Educacion y demostraciones offline: util para talleres o demos en ferias sin conectividad, mostrando capacidades multimodales y de tool calling en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan aproximadamente 3,6 GB en el repositorio; la inferencia requiere ademas overhead de runtime, cache KV y la torre de vision en FP16, por lo que se recomienda al menos 8-16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 Max (familia explicitamente soportada por MLX). No se indica soporte para GPU NVIDIA o AMD en esta variante.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta soporte para RTX 4090 u otras GPU discretas en este artefacto.
- Opciones de despliegue: MLX con el runtime incluido (`runtime/`), script `quickstart.py`, y carga programatica via `vision_artifact.load_vl_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Zen 6 Nano (9B) MLX | 9,41B | no disponible | 2-bit ternario + vision FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Alternativas de 7-9B en 4-bit (genericas) | ~7-9B | variable | 4-bit | variable | Multiples |
| Alternativas multimodales pequenas | variable | variable | variable | variable | Multiples |

No se dispone en la informacion proporcionada de modelos comparables concretos con datos verificables de rendimiento, contexto o licencia para establecer una comparativa cuantitativa fiable. La comparativa anterior es meramente categorica.

## Limitaciones y advertencias

- La cuantizacion a 2 bits ternarios, aunque se entrene con QAT, puede degradar el razonamiento complejo, las matematicas y la fidelidad en tareas de codigo frente a versiones en precision superior.
- No se documentan sesgos conocidos, pero al no especificarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o cultura.
- Riesgo de alucinacion inherente a modelos de ~9B; la cuantizacion extrema puede amplificarlo en tareas de conocimiento factual.
- Idiomas soportados no disponibles: no se garantiza un rendimiento multilingue solido, especialmente en castellano.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Dependencia de MLX y Apple Silicon: no es portable directamente a CUDA ni a otros runtimes sin conversion adicional.
- Aunque la licencia es Apache-2.0, se recomienda revisar el archivo `NOTICE` para confirmar las atribuciones de componentes upstream antes de un uso comercial.
- El modelo declara una identidad propia ("Zen 6") y capacidades MCP especificas; conviene validar el comportamiento agentico en produccion antes de confiar en las llamadas a herramientas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
