# Thireus/Qwen3.8-27B-THIREUS-IQ3_KT-SPECIAL_SPLIT

## Resumen

Este repositorio contiene los tensores cuantizados en formato GGUF para el modelo Qwen3.8-27B, concretamente un split denominado `IQ3_KT-SPECIAL_SPLIT`. Lo publica el usuario Thireus, que ha desarrollado un conjunto de herramientas (GGUF Tool Suite) para generar cuantizaciones dinámicas optimizadas en función de la perplejidad (PPL) para un objetivo de bits por peso (bpw) concreto. En lugar de ofrecer un archivo GGUF monolítico, este repositorio proporciona fragmentos (shards) diseñados para ser descargados y combinados mediante dicha herramienta.

La relevancia de este proyecto radica en su enfoque de cuantización personalizada: en lugar de usar recetas fijas como las de otros proveedores, permite al usuario ajustar el reparto de cuantizaciones a su hardware específico (VRAM y RAM) para minimizar la pérdida de calidad. El repositorio ocupa 10,5 GB, lo que sugiere una cuantización agresiva (IQ3_KT) que cabe en GPUs de consumo. Es importante señalar que el modelo requiere el uso de `ik_llama.cpp`, una versión modificada de llama.cpp, para su ejecución óptima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en el modelo oficial Qwen/Qwen3.8-27B) |
| Parametros totales | 27 mil millones (27B, segun nomenclatura del modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el ejemplo de ejecucion usa 32768 tokens) |
| Tipos de cuantizacion | IQ3_KT (split especifico de este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fragmentos o shards) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base (número de capas, atención, etc.), más allá de indicar que se trata del modelo Qwen3.8-27B alojado en el repositorio oficial de Qwen. Por tanto, la arquitectura del modelo original no está disponible en la información proporcionada.

La innovación principal de este repositorio no reside en el entrenamiento del modelo base, sino en el proceso de cuantización. Thireus ha desarrollado el GGUF Tool Suite, que implementa las denominadas "Dynamic 3.0 Quants". Este sistema calcula automáticamente la combinación óptima de tipos de cuantización (por ejemplo, mezclando capas en IQ3_K, IQ4_K, etc.) para alcanzar un objetivo de bpw específico, minimizando la perplejidad medida con el parámetro `-ctk f16 -c 512 -b 512 -ub 512`. El autor afirma que este método supera en eficiencia a las cuantizaciones dinámicas estándar de otros proveedores como unsloth, especialmente cuando se usa con `ik_llama.cpp`.

## Capacidades

No se especifican capacidades concretas en la model card. Como cuantización del modelo Qwen3.8-27B, se espera que herede las capacidades generales de la familia Qwen (generación de texto, razonamiento, código), pero no se proporcionan detalles verificables sobre tool calling, agentes, visión o soporte multilingüe. La cuantización IQ3_KT es agresiva, por lo que es probable que degrade el rendimiento en tareas que requieren alta precisión numérica o razonamiento complejo, aunque no se aportan datos objetivos al respecto.

## Casos de uso

- Despliegue en GPU de consumo: con un tamaño de 10,5 GB, este split permite ejecutar un modelo de 27B en GPUs con 12 GB de VRAM (por ejemplo, RTX 4070 Ti o RTX 3090), utilizando `-ngl 99` para cargar todas las capas en GPU.
- Ajuste fino de cuantización para hardware limitado: los usuarios pueden usar el GGUF Tool Suite para generar recetas alternativas a partir de este split, adaptando el modelo a configuraciones de VRAM/RAM específicas sin necesidad de descargar otros archivos.
- Inferencia local sin conexión: al ser GGUF, es compatible con el ecosistema llama.cpp, lo que facilita su uso en entornos aislados o con restricciones de red, siempre que se compile `ik_llama.cpp`.
- Experimentación académica con cuantización: el repositorio sirve como caso práctico para investigar el impacto de la cuantización mixta en la perplejidad, ya que el autor publica gráficas de PPL frente a bpw.
- Prototipado rápido en entornos de desarrollo: los fragmentos permiten descargar solo las partes necesarias mediante `quant_downloader.sh`, agilizando las pruebas en máquinas con ancho de banda limitado.
- Ejecución de modelos grandes en equipos sin GPU dedicada: aunque el ejemplo usa GPU, el formato GGUF y las herramientas permiten descargar capas a CPU (mezcla GPU/CPU), lo que posibilita ejecutar el modelo en estaciones de trabajo con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente proporciona gráficas de perplejidad (PPL) frente a bits por peso (bpw) para sus recetas, indicando que sus métodos optimizan la PPL para un objetivo de bpw dado. En la documentación se cita un ejemplo de receta con 5,1013 bpw y 6,9084 PPL, pero corresponde a un modelo diferente (mencionado como Qwen3.6-27B en el ejemplo) y no a este split concreto de IQ3_KT. Por tanto, no se dispone de métricas de rendimiento específicas para este repositorio.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 10,5 GB, por lo que la VRAM necesaria para cargar el modelo completo es de aproximadamente 11-12 GB (incluyendo overhead de contexto y caché KV). El ejemplo de ejecución usa `-c 32768` y `-ctk q8_0`, lo que incrementa el consumo de VRAM.
- GPU recomendadas: RTX 3090, RTX 4070 Ti, RTX 4080 o superiores con 12-16 GB de VRAM. También puede ejecutarse en GPUs profesionales como A10 o L4.
- Compatibilidad con GPU de consumo: sí, es el objetivo principal del autor, siempre que se ajuste el número de capas descargadas a CPU (`-ngl`) si la VRAM es insuficiente.
- Opciones de despliegue: requiere `ik_llama.cpp` (una bifurcación de llama.cpp) para un rendimiento óptimo, aunque es posible que funcione con `llama.cpp` estándar. No se menciona soporte para vLLM, Ollama o TGI en la documentación.
- Latencia y throughput: no se proporcionan datos numéricos. El ejemplo de ejecución usa `--threads 1` y `--main-gpu 0`, lo que sugiere un enfoque de baja concurrencia para uso local.

## Comparativa con modelos similares

La comparativa se centra en otras cuantizaciones del mismo modelo base (Qwen3.8-27B), ya que no se dispone de datos para comparar con otros modelos de distinta arquitectura.

| Modelo / Repositorio | Formato | Cuantizacion | Tamano | Herramienta requerida | Licencia |
|---|---|---|---|---|---|
| Thireus/Qwen3.8-27B-THIREUS-IQ3_KT-SPECIAL_SPLIT | GGUF (shards) | IQ3_KT (mix dinamico) | 10,5 GB | GGUF Tool Suite + ik_llama.cpp | MIT |
| Qwen/Qwen3.8-27B (oficial) | Safetensors | BF16 | ~54 GB (estimado) | Transformers, vLLM | MIT (segun tag) |
| unsloth/Qwen3.8-27B-dynamic-quants | GGUF | Dinamicos (IQ4, Q5, etc.) | Variable | llama.cpp estandar | MIT |

La diferencia principal es que el repositorio de Thireus no ofrece un archivo GGUF listo para usar, sino fragmentos que deben combinarse con su herramienta, lo que permite una personalización extrema pero añade complejidad. La cuantización IQ3_KT es más agresiva que las ofrecidas por unsloth en su gama alta, por lo que el rendimiento en tareas complejas podría ser inferior, aunque el autor sostiene que su optimización por PPL compensa esta pérdida.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto personal o muy reciente, con escasa validación por parte de la comunidad.
- La ejecución requiere compilar `ik_llama.cpp` con dependencias específicas (cmake, AVX, etc.), lo que puede ser una barrera técnica para usuarios no familiarizados con compilación desde fuente.
- La cuantización IQ3_KT es agresiva y puede degradar significativamente la calidad en tareas de razonamiento matemático o generación de código complejo, aunque no se aportan datos objetivos para cuantificar esta pérdida.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base, por lo que se deben aplicar las advertencias estándar para modelos de 27B.
- La licencia MIT permite uso comercial sin restricciones, pero es necesario verificar la licencia del modelo base Qwen3.8-27B, ya que la etiqueta `license:mit` de este repositorio no garantiza la del modelo original.
- El autor advierte explícitamente que las cuantizaciones dinámicas de unsloth pueden no funcionar correctamente con `ik_llama.cpp`, por lo que la interoperabilidad con otras herramientas del ecosistema es limitada.
- El proceso de descarga y combinación de shards es manual y propenso a errores si no se siguen las instrucciones del GGUF Tool Suite al pie de la letra.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/Qwen3.8-27B-THIREUS-IQ3_KT-SPECIAL_SPLIT
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF Tool Suite (GitHub): https://github.com/Thireus/GGUF-Tool-Suite
- Documentacion del GGUF Tool Suite: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/docs
- Ejemplos de recetas: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/recipe_examples
- ik_llama.cpp (repositorio y releases): https://github.com/Thireus/ik_llama.cpp
- Herramienta web para generar recetas: https://gguf.thireus.com/quant_assign.html
- Herramienta web para descargar modelos: https://gguf.thireus.com/quant_downloader.html
- Graficas de perplejidad: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/ppl_graphs
