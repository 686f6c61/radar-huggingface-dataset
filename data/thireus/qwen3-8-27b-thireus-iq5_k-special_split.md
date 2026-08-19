# Thireus/Qwen3.8-27B-THIREUS-IQ5_K-SPECIAL_SPLIT

## Resumen

Este repositorio contiene los tensores en formato GGUF del modelo Qwen3.8-27B, cuantizados por Thireus mediante su herramienta GGUF Tool Suite. El modelo base es el Qwen3.8-27B desarrollado por Qwen, del cual se referencia el artículo arXiv 2505.23786. La contribución de Thireus consiste en una metodología de cuantización dinámica que asigna automáticamente diferentes niveles de precisión a cada tensor del modelo, buscando minimizar la perplexidad para un presupuesto objetivo de bits por peso (bpw). El resultado es un conjunto de shards GGUF que pueden combinarse según las capacidades de VRAM y RAM del usuario.

La relevancia de esta publicación radica en que ofrece una alternativa a las cuantizaciones estáticas convencionales, permitiendo a desarrolladores e investigadores ajustar el modelo a su hardware específico sin necesidad de recurrir a soluciones genéricas. El nombre del repositorio indica una cuantización IQ5_K con un split especial, y el tamaño total del repositorio es de 18,5 GB. El ejemplo de uso proporcionado en la documentación muestra una longitud de contexto de 32768 tokens, aunque este valor no está confirmado como especificación oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, sin detalles publicados en este repositorio) |
| Parametros totales | 27B (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32768 (según ejemplo de uso en la model card, no confirmado oficialmente) |
| Tipos de cuantizacion | IQ5_K (según nombre del repo), con mezcla dinámica de cuantizaciones (Dynamic 3.0 Quants) |
| Idiomas soportados | no disponible |
| Licencia | MIT (para este repositorio; la licencia del modelo base puede diferir) |
| Formato de pesos | GGUF (shards) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Qwen3.8-27B en este repositorio. El nombre sugiere 27 mil millones de parámetros, pero no se especifica si se trata de un transformer denso, una arquitectura MoE o un modelo híbrido. El artículo arXiv 2505.23786, referenciado en las etiquetas, podría contener dichos detalles, pero no se han extraído aquí.

En cuanto al proceso de cuantización, Thireus emplea su GGUF Tool Suite, que implementa un algoritmo de asignación de cuantización por tensor. Este algoritmo evalúa la sensibilidad de cada tensor a la pérdida de precisión y asigna niveles de cuantización (por ejemplo, IQ2, IQ3, Q5_K, etc.) de forma que se minimice la perplexidad global del modelo para un objetivo de bpw determinado. El resultado es un conjunto de shards GGUF que deben descargarse y combinarse según una receta generada por la herramienta. El autor afirma que este método supera a las cuantizaciones estáticas convencionales en términos de perplexidad a igual o menor bpw, aunque no se proporcionan cifras numéricas en la documentación.

## Capacidades

- Generación de texto: al ser un modelo de 27B de la familia Qwen, se espera que tenga capacidades de generación de texto, razonamiento y posiblemente código, pero no se confirma en este repositorio.
- Compatibilidad con llama.cpp: al estar en formato GGUF, es compatible con el ecosistema llama.cpp, incluyendo la versión modificada ik_llama.cpp de Thireus, lo que permite ejecutarlo en CPU, GPU o una combinación de ambas.
- Cuantización mixta: el modelo está diseñado para funcionar con recetas de cuantización personalizadas, lo que permite adaptar el uso de VRAM y RAM según el hardware disponible.
- Despliegue local: al ser un GGUF, puede utilizarse con herramientas como llama-server, llama-cli, Ollama u otros frontends compatibles.

No se dispone de información sobre capacidades específicas como tool calling, agentes, visión o audio. Estas dependerán del modelo base, cuyas características no se detallan en este repositorio.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a la cuantización IQ5_K y al tamaño de 18,5 GB, el modelo puede ejecutarse en GPUs de gama alta para consumidores, como RTX 3090 o RTX 4090, con offload completo a GPU (como muestra el ejemplo con `-ngl 99`).
- Ajuste fino de cuantización para hardware específico: los desarrolladores pueden usar la GGUF Tool Suite para generar recetas personalizadas que se adapten a su combinación exacta de VRAM y RAM, optimizando la calidad del modelo para su entorno.
- Desarrollo de aplicaciones de chat o asistencia: el modelo puede integrarse en aplicaciones locales de chat o asistencia mediante llama.cpp, ofreciendo respuestas de texto sin depender de servicios en la nube.
- Experimentación con cuantización dinámica: investigadores interesados en técnicas de compresión de modelos pueden utilizar este repositorio como caso de estudio para comparar la metodología de Thireus con otras aproximaciones.
- Despliegue en servidores con GPUs profesionales: con una GPU de 24 GB o más (por ejemplo, A5000, A6000, RTX 4090), el modelo puede servir peticiones con contexto largo (32768 tokens) y batch de 4096, como se indica en el ejemplo de uso.
- Evaluación de calidad de cuantización: el autor proporciona gráficas de perplexidad comparativas, lo que permite a los usuarios evaluar la degradación introducida por la cuantización antes de desplegar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye una gráfica comparativa de perplexidad (PPL) entre la cuantización de Thireus y otras cuantizaciones, pero no se proporcionan los valores exactos. El autor indica que sus benchmarks de PPL se calculan con los parámetros `-ctk f16 -c 512 -b 512 -ub 512`, y que cambios en estos parámetros alteran los resultados. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- Tamaño del repositorio: 18,5 GB, por lo que se necesitan al menos 20 GB de almacenamiento libre para descargar todos los shards.
- VRAM estimada para inferencia: con cuantización IQ5_K, el modelo ocupa aproximadamente 18,5 GB en memoria. Para cargarlo completamente en GPU se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A6000, etc.). Con offload parcial a CPU, podría ejecutarse en GPUs con menos VRAM, pero con mayor latencia.
- GPU recomendadas: RTX 3090, RTX 4090, A5000, A6000, o GPUs profesionales con 24 GB o más. El ejemplo de uso emplea `-ngl 99`, que indica offload completo a GPU.
- Opciones de despliegue: llama.cpp (incluyendo la versión ik_llama.cpp de Thireus), llama-server, llama-cli, y cualquier frontend compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no se proporcionan datos específicos. Dependerán del hardware, la longitud de contexto y el batch size. El ejemplo usa `-b 4096 -ub 4096`, lo que sugiere que puede manejar batches grandes en GPUs potentes.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos. El autor menciona que su cuantización ofrece menor perplexidad que otras cuantizaciones de GGUF a igual o menor bpw, pero no se incluyen cifras concretas. Existen otras versiones cuantizadas de Qwen3.8-27B, como las publicadas por unsloth, pero no se dispone de sus especificaciones ni resultados en este repositorio. Se recomienda consultar las gráficas de perplexidad en el repositorio de GGUF Tool Suite para una comparación visual.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad respecto al modelo original en BF16. Aunque la metodología de Thireus busca minimizar la perplexidad, siempre existe una degradación inherente.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base. Estos aspectos deben evaluarse antes de su uso en producción.
- La licencia MIT de este repositorio se aplica a los archivos GGUF y a la herramienta, pero la licencia del modelo base Qwen3.8-27B puede tener restricciones adicionales. Es necesario verificar la licencia del modelo original en su repositorio oficial.
- El modelo está diseñado para usarse con la GGUF Tool Suite y con ik_llama.cpp. El uso con otras versiones de llama.cpp puede no ser óptimo o requerir ajustes.
- El repositorio contiene shards que deben combinarse mediante `llama-gguf-split --merge` o descargarse según una receta. Un manejo incorrecto de los shards puede resultar en un modelo corrupto.
- No se proporcionan garantías sobre el rendimiento en producción. Se recomienda realizar pruebas exhaustivas en el hardware objetivo antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/Qwen3.8-27B-THIREUS-IQ5_K-SPECIAL_SPLIT
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo arXiv (referenciado en las etiquetas): https://arxiv.org/abs/2505.23786
- GGUF Tool Suite (GitHub): https://github.com/Thireus/GGUF-Tool-Suite
- Web de Thireus (herramientas y recetas): https://gguf.thireus.com
- Documentación de la herramienta: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/docs
- Ejemplos de recetas: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/recipe_examples
- Gráficas de perplexidad: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/ppl_graphs
