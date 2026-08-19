# Thireus/Qwen3.8-27B-THIREUS-Q4_0_R8-SPECIAL_SPLIT

## Resumen

Este repositorio contiene los tensores en formato GGUF del modelo Qwen3.8-27B, cuantizados por Thireus mediante su propia herramienta GGUF Tool Suite. El objetivo principal es ofrecer una cuantizacion dinamica optimizada para minimizar la perplexity (PPL) dado un presupuesto de memoria objetivo, en lugar de usar una cuantizacion uniforme estatica. El nombre del repositorio indica un esquema de cuantizacion Q4_0 con una variante R8 y un split especial de tensores.

La relevancia de este proyecto radica en que permite a desarrolladores e investigadores adaptar el modelo a sus configuraciones exactas de VRAM y RAM, obteniendo la mejor relacion calidad-velocidad posible. A diferencia de las cuantizaciones genericas, esta suite calcula la mezcla optima de tipos de cuantizacion (por ejemplo, Q4_0, Q5_K, Q6_K, etc.) para cada capa, logrando un rendimiento superior en terminos de perplexity a igualdad de bits por peso (bpw). El modelo base es Qwen3.8-27B, aunque los detalles arquitectonicos completos no se incluyen en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base Qwen3.8-27B) |
| Parametros totales | no disponible (el nombre sugiere 27B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_R8 (esquema dinamico, mezcla de cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (shards) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantizacion del modelo base Qwen3.8-27B. La cuantizacion se realiza mediante la Thireus GGUF Tool Suite, que emplea un algoritmo de asignacion automatica de cuantizaciones por capa. El proceso busca minimizar la perplexity del modelo cuantizado para un objetivo de bits por peso (bpw) y un presupuesto de memoria (VRAM/RAM) especifico. La herramienta genera recetas (recipes) que indican que tipo de cuantizacion aplicar a cada tensor, y posteriormente se descargan los shards GGUF correspondientes. No se menciona el uso de tecnicas como RLHF o DPO, ya que se trata de un proceso de compresion, no de entrenamiento.

## Capacidades

Las capacidades funcionales del modelo son las del modelo base Qwen3.8-27B, pero no se detallan en la informacion proporcionada. Al ser una cuantizacion GGUF, el modelo conserva las capacidades del original, aunque con una posible degradacion minima en tareas de alta precision. No se especifican capacidades concretas como generacion de codigo, razonamiento, tool calling o soporte multilingue en la documentacion del repositorio.

## Casos de uso

- Inferencia local en hardware limitado: gracias al tamano del repositorio (15,1 GB), el modelo puede ejecutarse en GPUs de consumo como una RTX 4090 (24 GB) o incluso en configuraciones con menos VRAM si se usa el esquema de cuantizacion adecuado.
- Despliegue en entornos de produccion con requisitos de memoria estrictos: la herramienta permite generar recetas personalizadas para ajustar el modelo a la VRAM disponible, reduciendo la huella de memoria sin sacrificar demasiada calidad.
- Experimentacion con cuantizacion dinamica: los desarrolladores pueden usar la suite para comparar diferentes mezclas de cuantizacion y evaluar su impacto en la perplexity, util para investigacion en compresion de modelos.
- Integracion con llama.cpp y derivados: al ser GGUF, el modelo es compatible con llama.cpp, ik_llama.cpp, Ollama y otros motores de inferencia, lo que facilita su uso en aplicaciones de chat, agentes o procesamiento por lotes.
- Ajuste fino de la relacion calidad-velocidad: los usuarios pueden elegir entre diferentes recetas (por ejemplo, 5.10 bpw con 6.90 PPL) para optimizar la latencia o la precision segun sus necesidades.
- Creacion de modelos cuantizados a medida: la suite permite generar nuevos recipes para otros modelos soportados, no solo para Qwen3.8-27B, lo que la convierte en una herramienta versatil para equipos que gestionan multiples modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una grafica comparativa de perplexity (PPL) frente a otros cuantizadores, disponible en el repositorio de GitHub, pero no se incluyen los datos numericos en la informacion proporcionada. Los benchmarks de PPL se calculan con los parametros `-ctk f16 -c 512 -b 512 -ub 512`, y se advierte que variar estos parametros altera los resultados.

## Requisitos de hardware

- Tamano del repositorio: 15,1 GB, lo que sugiere que el modelo cuantizado cabe en GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G).
- Para cargar el modelo completo en VRAM, se recomienda una GPU con al menos 16-24 GB de memoria, dependiendo de la longitud de contexto configurada.
- El modelo es compatible con motores de inferencia basados en llama.cpp, como llama-server, llama-cli, ik_llama.cpp y Ollama.
- La suite de herramientas permite generar recetas para ejecutar el modelo con parte de los pesos en CPU y parte en GPU, lo que amplia las opciones de despliegue en hardware heterogeneo.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion del repositorio. La grafica de PPL mencionada en la model card compara con otros cuantizadores (como unsloth), pero no se incluyen los datos concretos.

## Limitaciones y advertencias

- La cuantizacion puede introducir una degradacion en la precision del modelo, especialmente en tareas que requieren alta exactitud numerica (por ejemplo, matematicas complejas o generacion de codigo).
- Los resultados de perplexity dependen fuertemente de los parametros de inferencia utilizados; cambiar `-b` o `-ub` altera los valores reportados.
- El repositorio no incluye informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base, por lo que se recomienda consultar la documentacion oficial de Qwen3.8-27B.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base (Qwen3.8-27B) tambien tenga una licencia compatible con su caso de uso.
- El modelo esta diseñado para usarse con la Thireus GGUF Tool Suite y ik_llama.cpp; el uso con otras herramientas puede requerir ajustes adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/Qwen3.8-27B-THIREUS-Q4_0_R8-SPECIAL_SPLIT
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Thireus GGUF Tool Suite: https://github.com/Thireus/GGUF-Tool-Suite
- Documentacion de la suite: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/docs
- Ejemplos de recetas: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/recipe_examples
- Generador de recetas web: https://gguf.thireus.com/quant_assign.html
- Descargador de modelos web: https://gguf.thireus.com/quant_downloader.html
- Graficas de PPL: https://github.com/Thireus/GGUF-Tool-Suite/tree/main/ppl_graphs
- Referencia arXiv (tag del modelo): https://arxiv.org/abs/2505.23786
