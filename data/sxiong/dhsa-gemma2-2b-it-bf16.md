# sxiong/DHSA-Gemma2-2b-it-BF16

## Resumen

DHSA-Gemma2-2b-it-BF16 es un componente de pesos para el modelo Gemma2-2b-it, publicado por el autor sxiong en el contexto del articulo "Long-Context Modeling with Dynamic Hierarchical Sparse Attention for Memory-Constrained LLM Inference" (ICML 2026 Spotlight). No se trata de un modelo de lenguaje completo, sino de los pesos de un predictor de limites (boundary predictor) que se integra en el framework DHSA para decidir dinamicamente que tokens requieren atencion densa y cuales pueden ser atendidos de forma dispersa durante la inferencia de contexto largo.

El objetivo principal de DHSA es reducir la complejidad cuadratica de la atencion densa en modelos transformer sin necesidad de reentrenar el modelo base. Este predictor, aplicado sobre Gemma2-2b-it en formato BF16, permite ejecutar inferencia con ventanas de contexto muy largas en entornos con memoria limitada, manteniendo una calidad de salida razonable. La relevancia actual de esta propuesta radica en la creciente demanda de aplicaciones que manejan documentos extensos o conversaciones de multiples turnos en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de patrones de atencion dispersa (DHSA) sobre Gemma2-2b-it |
| Parametros totales | 2.6 mil millones (del modelo base Gemma2-2b) |
| Parametros activos | no disponible |
| Longitud de contexto | No especificada; el modelo base Gemma2-2b soporta 8192 tokens, pero DHSA esta disenado para contextos mas largos |
| Tipos de cuantizacion | BF16 (pesos publicados); no se mencionan otras cuantizaciones |
| Idiomas soportados | No especificados (hereda los del modelo base Gemma2-2b, principalmente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo con pesos BF16) |

## Arquitectura y entrenamiento

El sistema DHSA (Dynamic Hierarchical Sparse Attention) se compone de un predictor de fronteras que, dado el estado de los tokens en una secuencia, decide cuales son tokens "importantes" (que requieren atencion densa) y cuales pueden procesarse con atencion dispersa. El predictor se entrena para imitar el comportamiento de atencion del modelo base, aprendiendo a identificar los tokens que contribuyen mas a la representacion contextual. No se requiere reentrenamiento del modelo base, lo que facilita su adopcion sobre modelos existentes.

El entrenamiento del predictor se realiza sobre datos de pasos de inferencia del modelo base, generando etiquetas de importancia a partir de los mapas de atencion densa. La arquitectura exacta del predictor (tamano, capas, tipo de red) no se detalla en la informacion disponible. El checkpoint se distribuye en formato BF16, con un tamano de repositorio de 7.6 GB, lo que sugiere que el predictor es considerablemente mas pequeno que el modelo base.

## Capacidades

- Prediccion de patrones de atencion dispersa: el modelo clasifica tokens como importantes o no importantes para la atencion, permitiendo omitir computos de atencion sobre tokens irrelevantes.
- Inferencia de contexto largo: al reducir el coste de atencion, permite procesar secuencias mas largas de las que serian factibles con atencion densa en el mismo hardware.
- Compatibilidad con Gemma2-2b-it: funciona como complemento al modelo base, sin modificar sus pesos ni su comportamiento de generacion.
- Sin capacidades de vision, audio o tool calling: se limita a la optimizacion del mecanismo de atencion.

## Casos de uso

- Procesamiento de documentos extensos: en un pipeline de RAG (retrieval-augmented generation) con documentos de miles de tokens, DHSA permite al modelo atender solo a las secciones relevantes, reduciendo el consumo de memoria y acelerando la inferencia.
- Chatbots de soporte con historial largo: un asistente conversacional que mantiene un historial de 50 o mas turnos puede usar DHSA para conservar la informacion relevante sin exceder la memoria disponible en GPUs de consumo.
- Analisis de codigo fuente en repositorios grandes: para tareas de resumen o generacion de documentacion sobre repositorios completos, DHSA reduce el coste de atender a todos los archivos a la vez.
- Investigacion en eficiencia de atencion: el modelo es util como base para experimentos sobre tecnicas de sparse attention, dado que el codigo fuente esta disponible en el repositorio del autor.
- Despliegue en entornos con memoria limitada: en edge devices o GPUs con 8 GB de VRAM, DHSA permite ejecutar Gemma2-2b con contextos de 16k o 32k tokens que de otro modo no cabrian.
- Generacion de resumenes de libros o articulos largos: el modelo puede procesar textos extensos sin perder informacion crucial, gracias a la seleccion adaptativa de tokens importantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (ICML 2026 Spotlight) presenta evaluaciones comparativas, pero no se incluyen en la informacion proporcionada. No se pueden aportar datos de MMLU, HumanEval, GSM8K u otras pruebas estandar en esta ficha.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa 7.6 GB en disco, lo que implica aproximadamente 7.6 GB de VRAM para cargar el predictor completo. El modelo base Gemma2-2b en BF16 ocupa alrededor de 4.5 GB, por lo que el conjunto completo requeriria unos 12 GB de VRAM.
- GPU recomendadas: una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G, L4) seria adecuada para ejecutar el sistema completo. Con cuantizacion a 8 bits o 4 bits, podria caber en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060 Ti.
- Compatibilidad con consumer GPUs: si, con cuantizacion es posible ejecutarlo en GPUs de gama media de escritorio.
- Opciones de despliegue: el repositorio oficial (github.com/xiongsiheng/DHSA) proporciona el codigo para integrar el predictor con el modelo base. No se menciona soporte para vLLM, llama.cpp o TGI de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con la misma funcion especifica de predictor de atencion dispersa para Gemma2-2b. Las alternativas generales de sparse attention (por ejemplo, StreamingLLM, H2O, SnapKV) son tecnicas de software que no publican pesos de modelos. La comparativa con otros modelos de 2B (como Llama 3.2 3B o Qwen2.5-3B) no es relevante porque DHSA no es un LLM autonomo sino un componente auxiliar.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Gemma2-2b-it y el codigo del repositorio DHSA para funcionar. No se puede cargar directamente como un LLM estandar.
- Datos de entrenamiento del predictor no disponibles: no se especifica con que dataset se entreno, ni su composicion ni volumen. Esto limita la reproducibilidad y la evaluacion de sesgos.
- Rendimiento no verificado: no hay benchmarks publicados en la informacion disponible, por lo que no se puede cuantificar la perdida de calidad frente a atencion densa.
- Riesgo de degradacion en tareas que requieren atencion global: si el predictor falla en identificar tokens relevantes, el modelo podria perder informacion critica. Se recomienda validar en el caso de uso especifico.
- Licencia MIT: aunque permite uso comercial, el modelo base Gemma2-2b tiene su propia licencia (Gemma Terms of Use) que restringe su uso comercial bajo ciertas condiciones. Hay que revisar ambas licencias.
- Soporte de idiomas limitado: el modelo base Gemma2-2b esta principalmente entrenado en ingles; el predictor puede no comportarse bien con otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sxiong/DHSA-Gemma2-2b-it-BF16
- Articulo en arXiv: https://arxiv.org/pdf/2510.24606
- Repositorio GitHub del proyecto: https://github.com/xiongsiheng/DHSA
- Documentacion del proyecto en DeepWiki: https://deepwiki.com/xiongsiheng/DHSA
- Modelo base Gemma-2-2b: https://huggingface.co/google/gemma-2-2b
- Paper de Gemma 2: https://arxiv.org/html/2408.00118v1
