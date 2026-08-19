# unsloth/Muse-Glimmer-30B

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 mil millones de parametros desarrollado por Meta Superintelligence Lab, con un encoder de percepcion dedicado para entrada multimodal. Destilado de Muse Spark, esta disenado especificamente para tareas agenciales autonomas en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion ante fallos en un unico modelo que se ejecuta localmente sin necesidad de infraestructura en la nube.

El modelo emplea una arquitectura transformer densa con un patron de atencion mixto (ventana deslizante y global), soporta una longitud de contexto de 131.072 tokens y acepta entrada de texto e imagenes. Su relevancia actual radica en que es el primer modelo abierto de Meta Superintelligence Labs, publicado bajo licencia Apache 2.0, y esta optimizado para ejecutarse en GPUs de consumo con cuantizacion de 4 bits, manteniendo una degradacion minima en tareas agenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Unsloth Dynamic 2.0 (K-Quant-Dynamic, K-Quant-17GB), GGUF |
| Idiomas soportados | Mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso de 52 capas con dimension oculta de 6656 y FFN SwiGLU de dimension intermedia 19.968. Emplea un patron de atencion repetido [Local, Local, Local, Global] con ventana deslizante de 2048 tokens, atencion gated y GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1). La codificacion posicional usa RoPE con theta de 500.000 solo en las capas locales. El encoder de percepcion es un ViT-G/14 de aproximadamente 1.8B parametros, 50 capas y ancho 1536, capaz de procesar hasta 4096 tokens visuales por imagen. El tokenizador tiene un vocabulario de 202.048 tokens (200.000 BPE mas 2048 especiales).

Los datos de entrenamiento incluyen contenido multimodal de fuentes publicas, datos de terceros e informacion de productos y servicios de Meta, curados por redes de proveedores externos y personal de Meta. El conocimiento del modelo llega hasta el 4 de enero de 2026. El modelo incorpora un drafter basado en DFlash para decodificacion especulativa, que propone bloques completos de tokens para acelerar la generacion.

## Capacidades

- Razonamiento multi-paso y planificacion coherente en flujos de trabajo complejos y prolongados.
- Uso fiable de herramientas con invocacion de funciones y esquemas precisos en flujos extensos.
- Comprension multimodal con entrada intercalada de texto e imagenes para interpretar capturas de pantalla, graficos y documentos.
- Recuperacion ante fallos: diagnostica errores en llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds agenciales como OpenClaw y Hermes Agent.
- Esfuerzo controlable: permite seleccionar diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidades multilingues entrenadas con datos de mas de 100 idiomas.
- Generacion de codigo y depuracion integradas en flujos de trabajo agenciales.

## Casos de uso

- Agentes autonomos de investigacion: el modelo puede ejecutar busquedas profundas, analizar documentos y sintetizar respuestas con multiples pasos de razonamiento, gracias a su ventana de contexto de 131.072 tokens que permite mantener documentos extensos y cadenas de razonamiento largas.
- Asistentes de codigo en produccion: con soporte para tool calling y compatibilidad con scaffolds como OpenClaw, puede integrarse en pipelines de CI/CD para escribir, depurar y probar codigo de forma autonoma.
- Atencion al cliente multimodal: el modelo interpreta capturas de pantalla y documentos adjuntos en conversaciones multi-turno, permitiendo diagnosticar problemas tecnicos visuales y resolver incidencias sin intervencion humana.
- Analisis de documentos financieros: con su encoder de percepcion, puede extraer datos de graficos, tablas e informes, y ejecutar calculos o generar resumenes ejecutivos con razonamiento multi-paso.
- Automatizacion de tareas de ofimatica: el modelo puede interactuar con aplicaciones de escritorio mediante capturas de pantalla, planificar secuencias de acciones y recuperarse cuando una accion falla, util para automatizar flujos de trabajo repetitivos.
- Asistente local de desarrollo embebido: al ejecutarse en hardware de consumo con cuantizacion de 4 bits, es viable como asistente de codigo offline en estaciones de trabajo sin conexion a internet.
- Agente de navegacion web: con su capacidad de procesar imagenes y razonar sobre resultados inesperados, puede navegar sitios web, rellenar formularios y extraer informacion de forma autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no se proporcionan cifras concretas. La degradacion por cuantizacion se mide en un 0,2% para K-Quant-Dynamic y 1,0% para K-Quant-17GB, promediada sobre 15 benchmarks comunes, pero los valores absolutos no estan disponibles.

## Requisitos de hardware

- VRAM estimada: 64 GB para precision completa, 32 GB para K-Quant-Dynamic y 24 GB para K-Quant-17GB, incluyendo KV cache, encoder de percepcion y drafter especulativo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para cuantizacion K-Quant-17GB, RTX 5090 o A6000 (32 GB) para K-Quant-Dynamic, y A100 80GB o H100 para precision completa.
- Compatible con GPUs de consumo: si, con cuantizacion de 4 bits cabe en una RTX 4090 de 24 GB.
- Opciones de despliegue: Unsloth, llama.cpp, Ollama, vLLM y TGI, con soporte para GGUF y safetensors.
- La decodificacion especulativa con el drafter DFlash acelera la generacion, aunque no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidades |
|---|---|---|---|---|
| Muse Glimmer-30B | 29,6B | 131.072+ | Apache 2.0 | Texto + imagen |
| Llama 3.2 90B Vision | 90B | 128.000 | Llama 3.2 Community | Texto + imagen |
| Qwen2.5-VL-32B | 32B | 32.000+ | Apache 2.0 | Texto + imagen |

Muse Glimmer es significativamente mas pequeno que Llama 3.2 90B Vision, lo que permite ejecutarlo en hardware de consumo, y supera a Qwen2.5-VL-32B en longitud de contexto. Su enfoque en tareas agenciales con recuperacion ante fallos y compatibilidad con scaffolds lo diferencia de alternativas centradas principalmente en comprension multimodal general. Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion detallada sobre sesgos especificos del modelo, aunque al entrenarse con datos publicos y de terceros, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente relevante en tareas agenciales donde errores factuales pueden propagarse en flujos multi-paso.
- El conocimiento del modelo se limita a enero de 2026; informacion posterior no estara disponible.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos de los datos de entrenamiento proporcionados por terceros.
- La degradacion por cuantizacion, aunque minima (0,2-1,0%), puede afectar a tareas de alta precision en algunos benchmarks.
- Para produccion, es necesario validar el comportamiento del modelo en el scaffold agencial concreto, ya que la compatibilidad puede variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/unsloth/Muse-Glimmer-30B)
- [Version GGUF en HuggingFace](https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF)
- [Guia de ejecucion local de Unsloth](https://unsloth.ai/docs/models/muse-glimmer)
- [Guia de fine-tuning de Unsloth](https://unsloth.ai/docs/models/muse-glimmer/train)
- [Articulo de Meta Research](https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model)
- [Paper del encoder de percepcion (arXiv:2504.13181)](https://arxiv.org/abs/2504.13181)
- [Paper del drafter DFlash (arXiv:2602.06036)](https://arxiv.org/abs/2602.06036)
