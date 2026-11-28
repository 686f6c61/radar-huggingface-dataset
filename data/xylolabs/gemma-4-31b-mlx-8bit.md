# Xylolabs/gemma-4-31B-MLX-8bit

## Resumen

Xylolabs/gemma-4-31B-MLX-8bit es una cuantización de 8 bits del modelo google/gemma-4-31B, convertida al formato MLX para su ejecución con la librería mlx-lm en hardware Apple Silicon. La conversión la firma Xylolabs, un tercero independiente de Google, y emplea cuantización afín con tamaño de grupo 64 y escalas y sesgos en bfloat16. Se trata de una conversión solo de texto: la torre de visión del modelo original queda excluida.

El modelo base, gemma-4-31B, pertenece a la familia Gemma 4 de Google y cuenta con 30.697.345.280 parámetros reales según los safetensors del repositorio. Esta versión cuantizada ocupa 32,62 GB en disco (frente a los 61,39 GB del BF16 sin cuantizar), lo que reduce a la mitad el espacio necesario y permite ejecutar un modelo de 31B en equipos con memoria unificada de gama alta, como un Mac Studio o un MacBook Pro con 64 GB o más.

La relevancia de esta ficha radica en que documenta una conversión MLX reciente con métricas de fidelidad publicadas frente al BF16 original: divergencia KL de 0,002411 en WikiText-2 y un 98,21% de acuerdo top-1, lo que sitúa la pérdida de calidad en un rango muy bajo. La licencia Apache 2.0 facilita el uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Gemma 4 del modelo base; detalles no disponibles en la información proporcionada) |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | 8 bits (afín, grupo de 64, escalas y sesgos en bfloat16); existe variante de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-lm) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base google/gemma-4-31B más allá de su pertenencia a la familia Gemma 4. Lo que sí se documenta con precisión es el proceso de cuantización: se aplica cuantización afín de 8 bits con tamaño de grupo 64 a todas las capas lineales y al embedding de tokens (incluida la cabeza LM), mientras que las capas de normalización y el resto de tensores no cuantizados se mantienen en bfloat16. La torre de visión del modelo original se elimina, por lo que la conversión es exclusivamente de texto.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre innovaciones técnicas de la arquitectura. La model card se limita a describir el proceso de conversión y a reportar métricas de fidelidad de la cuantización frente al modelo BF16 de referencia en MLX, evaluadas sobre WikiText-2, texto de chat y texto reservado, con fragmentos de 512 tokens en proporción 40/20/20.

## Capacidades

- Generación de texto en formato conversacional y de continuación libre, según el pipeline text-generation declarado.
- Ejecución nativa en Apple Silicon mediante mlx-lm, con soporte de generación por línea de comandos.
- Cuantización de 8 bits con pérdida de calidad muy baja respecto al BF16 (98,21% de acuerdo top-1 en WikiText-2).
- Capacidades del modelo base Gemma 4 (razonamiento, código, matemáticas, multilingüismo): no detalladas en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no incluidas (la torre de visión se elimina en esta conversión).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac de gama alta: ejecutar un modelo de 31B cuantizado a 8 bits (32,62 GB) en un equipo con memoria unificada de 64 GB o superior, sin depender de servicios en la nube, usando mlx-lm como runtime.
- Prototipado de aplicaciones de texto en Apple Silicon: desarrollar y validar pipelines de generación de texto con un modelo grande antes de desplegar en infraestructura GPU, aprovechando que el formato MLX está optimizado para el hardware de Apple.
- Evaluación comparativa de cuantizaciones: usar esta versión de 8 bits junto a la de 4 bits del mismo autor para medir el impacto de la cuantización en tareas concretas, con las métricas KL y top-1 ya publicadas como referencia.
- Generación de texto de alta fidelidad en local: cuando se requiere una calidad cercana al BF16 (98,21% de acuerdo top-1) pero no se dispone de memoria para los 61,39 GB del modelo sin cuantizar.
- Investigación sobre cuantización afín: reproducir el esquema de grupo 64 con escalas y sesgos en bfloat16 y comparar su comportamiento en distintos corpus, dado que el autor publica las métricas de fidelidad.
- Desarrollo de asistentes de texto sin componente visual: al haberse eliminado la torre de visión, el modelo es adecuado para aplicaciones puramente textuales donde no se necesita procesamiento de imágenes.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de la cuantización frente al modelo BF16 sin cuantizar de MLX, evaluadas en WikiText-2, chat y texto reservado:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Answer check |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 32,62 GB | 0,002411 | 98,21% | 0,002388 | 98,45% | 0,002419 | 98,16% | 6/7 |
| MLX 4-bit | 17,73 GB | 0,068070 | 90,52% | 0,055519 | 91,22% | 0,074856 | 89,61% | 6/7 |
| BF16 | 61,39 GB | — | — | — | — | — | — | 6/7 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 32,62 GB; se recomienda al menos 48-64 GB de memoria unificada para cargar el modelo y mantener contexto, aunque el requisito exacto depende de la longitud de contexto y del runtime.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (Mac Studio, MacBook Pro de gama alta); no está pensado para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU de consumo: no aplica en el sentido habitual; requiere un Mac con memoria unificada suficiente, no una GPU dedicada tipo RTX 4090.
- Opciones de despliegue: mlx-lm (versión 0.32.2 indicada en la model card) mediante `mlx_lm.generate`; otros runtimes MLX no detallados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-31B-MLX-8bit | 30.697.345.280 | no disponible | MLX safetensors (8 bits) | Apache 2.0 | Hugging Face |
| Xylolabs/gemma-4-31B-MLX-4bit | 30.697.345.280 (mismo base) | no disponible | MLX safetensors (4 bits) | Apache 2.0 | Hugging Face |
| google/gemma-4-31B (BF16) | 30.697.345.280 | no disponible | safetensors BF16 | no disponible en la información proporcionada | Hugging Face |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión del modelo base se elimina, por lo que no procesa imágenes.
- Cuantización con pérdida: aunque la fidelidad es alta (98,21% top-1 en WikiText-2), existe una divergencia respecto al BF16 que puede acumularse en tareas de razonamiento largo o generación de código.
- Formato específico: los pesos son MLX, no GGUF ni safetensors estándar de PyTorch; no se pueden cargar directamente en vLLM, llama.cpp, Ollama o TGI sin conversión.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento multilingüe a partir de la información disponible.
- Longitud de contexto no documentada: conviene verificar la ventana del modelo base antes de usarlo en aplicaciones con contexto largo.
- Licencia: la conversión declara Apache 2.0, pero las condiciones del modelo base google/gemma-4-31B deben verificarse por separado para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son heredados del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria de la conversión.
- Conversión de terceros: no es una publicación oficial de Google; la responsabilidad sobre la fidelidad de la cuantización recae en Xylolabs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-MLX-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Variante de 4 bits: https://huggingface.co/Xylolabs/gemma-4-31B-MLX-4bit
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
