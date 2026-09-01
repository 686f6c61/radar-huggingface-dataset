# WideSeek-R1/WideSeek-SFT-4B

## Resumen

WideSeek-SFT-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por el equipo WideSeek-R1, que consiste en un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-4B. El modelo está diseñado específicamente para tareas de búsqueda de información amplia (broad information seeking) mediante orquestación de múltiples agentes, entrenado sobre trayectorias multi-agente de dos tipos: tareas de solo anchura (width-only) y tareas de solo profundidad (depth-only). El objetivo es explorar el escalado por anchura (width scaling), donde un agente principal coordina varios subagentes en paralelo para cubrir un espacio de búsqueda más amplio.

La relevancia de este modelo radica en que demuestra que un modelo pequeño (4B) puede alcanzar un rendimiento comparable al de modelos mucho más grandes (como DeepSeek-R1-671B) en tareas de búsqueda de información, siempre que se utilice una estrategia de escalado por anchura con múltiples agentes paralelos. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Es una contribución al campo de los sistemas multi-agente y la recuperación de información, con un enfoque en la eficiencia computacional frente a la escalabilidad de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estandar, pero no hay versiones oficiales publicadas) |
| Idiomas soportados | no disponible (heredados de Qwen3-4B, no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers, no confirmado explicitamente) |

## Arquitectura y entrenamiento

WideSeek-SFT-4B parte de la arquitectura transformer de Qwen3-4B, un modelo denso de 4.000 millones de parámetros. El ajuste fino supervisado se realiza sobre el dataset WideSeek-R1/WideSeek-R1-SFT-data, que contiene trayectorias multi-agente de nivel agente (agent-level multi-turn trajectories) para tareas de solo anchura y solo profundidad. Estas trayectorias incluyen tanto las acciones del agente principal (lead agent) como las de los subagentes, lo que permite al modelo aprender a orquestar la búsqueda en paralelo.

El entrenamiento se centra en la generación de secuencias de razonamiento y acciones de búsqueda, donde el modelo debe decidir cuándo lanzar subagentes, cómo distribuir las consultas y cómo integrar los resultados parciales. A diferencia del modelo WideSeek-R1-4B (entrenado con MARL, aprendizaje por refuerzo multi-agente), esta versión SFT se limita a imitar las trayectorias del dataset sin optimización por refuerzo. El paper asociado (arXiv:2602.04634) describe el proceso completo, donde el SFT sirve como paso previo al entrenamiento con MARL, pero este checkpoint concreto es el resultado intermedio del ajuste supervisado.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3-4B, conserva las capacidades de generacion de texto y razonamiento del modelo base, aunque el ajuste fino se centra en tareas de busqueda de informacion.
- Orquestacion multi-agente: el modelo aprende a coordinar multiples subagentes en paralelo para tareas de busqueda amplia, decidiendo cuantas ramas lanzar y como fusionar los resultados.
- Busqueda de informacion de solo anchura (width-only): maneja tareas donde se necesita explorar muchas fuentes o temas distintos en paralelo.
- Busqueda de informacion de solo profundidad (depth-only): maneja tareas donde se necesita profundizar en un tema concreto mediante multiples pasos de busqueda.
- Integracion de resultados parciales: el modelo es capaz de sintetizar informacion proveniente de multiples subagentes para producir una respuesta final coherente.
- No se especifican capacidades de tool calling, function calling o soporte de agentes en el sentido clasico de APIs externas; el enfoque es interno al modelo.

## Casos de uso

- Investigacion de mercado amplia: una empresa puede usar el modelo para lanzar multiples consultas paralelas sobre tendencias, competidores y precios en diferentes segmentos, integrando los resultados en un informe unificado. El modelo es adecuado porque su entrenamiento en width-only tasks le permite cubrir un espacio de busqueda extenso con un solo agente coordinador.
- Revision bibliografica sistematica: en entornos academicos, el modelo puede orquestar subagentes que buscan en distintas bases de datos o secciones de un corpus, combinando hallazgos sobre un tema especifico. Su capacidad para tareas depth-only permite profundizar en subtemas relevantes.
- Monitorizacion de noticias y alertas: el modelo puede lanzar multiples busquedas paralelas sobre fuentes de noticias para detectar eventos emergentes, clasificarlos y resumirlos. La escalabilidad por anchura permite cubrir muchas fuentes sin perder cobertura.
- Generacion de informes de inteligencia competitiva: dado un conjunto de competidores, el modelo puede asignar un subagente a cada uno para recopilar informacion de productos, precios y estrategias, y luego sintetizar un analisis comparativo.
- Asistente de busqueda para dominios especializados: en medicina o derecho, el modelo puede descomponer una consulta compleja en subconsultas paralelas sobre diferentes subdominios (sintomas, tratamientos, jurisprudencia) y combinar los resultados en una respuesta estructurada.
- Automatizacion de tareas de data mining en la web: el modelo puede coordinar multiples agentes que extraen informacion de diferentes sitios o APIs, normalizando y fusionando los datos en un formato unico. Su entrenamiento en trayectorias multi-agente lo hace adecuado para este tipo de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version SFT (WideSeek-SFT-4B) en la informacion disponible. El paper asociado reporta resultados para el modelo final WideSeek-R1-4B (entrenado con MARL), que alcanza un item F1 de 40,0% en el benchmark WideSearch, comparable al de DeepSeek-R1-671B en configuracion de agente unico. Sin embargo, estos resultados corresponden al modelo con aprendizaje por refuerzo, no a este checkpoint de SFT. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 4B parametros, en precision FP16 requiere aproximadamente 8 GB de VRAM. Con cuantizacion a 8 bits (INT8) se reduce a unos 4-5 GB, y a 4 bits (INT4) a unos 2-3 GB, aunque no hay versiones oficiales cuantizadas publicadas.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) sin problemas. Para despliegue en produccion con alta concurrencia, se recomienda una GPU de datacenter como A10G, A100 o L4.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs modernas con al menos 8 GB de VRAM en FP16, y con cuantizacion puede ejecutarse en GPUs con 4 GB o menos.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, o mediante llama.cpp con conversion a GGUF. Tambien es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 4B en una GPU como RTX 4090, se puede esperar una latencia de decodificacion de unos 20-40 ms por token y un throughput de 100-200 tokens/s en generacion, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WideSeek-SFT-4B | 4B | no disponible | SFT multi-agente para busqueda amplia | Apache 2.0 | HuggingFace |
| Qwen3-4B (base) | 4B | no disponible | Modelo generalista | Apache 2.0 | HuggingFace |
| DeepSeek-R1-671B | 671B | no disponible | Razonamiento generalista | MIT | HuggingFace |

El modelo se diferencia de su base (Qwen3-4B) por el ajuste fino especifico en trayectorias multi-agente, lo que lo hace mas adecuado para tareas de busqueda de informacion amplia. Frente a DeepSeek-R1-671B, el paper demuestra que con escalado por anchura (multiples subagentes) un modelo de 4B puede igualar el rendimiento de un modelo 160 veces mayor en el benchmark WideSearch, aunque esta comparacion se refiere al modelo RL, no al SFT. No hay otros modelos comparables de tamano similar con este enfoque especifico de width scaling publicados en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino de Qwen3-4B, puede heredar sesgos del modelo base y de los datos de entrenamiento, aunque no se han documentado sesgos especificos para este modelo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o no verificada, especialmente en tareas de busqueda donde los subagentes pueden devolver resultados erroneos. Se recomienda validacion externa de las respuestas.
- Limitaciones de contexto: la longitud de contexto no esta especificada, pero al derivar de Qwen3-4B, probablemente este en el rango de 32k tokens (no confirmado). Para tareas con muchas ramas paralelas, el contexto puede agotarse rapidamente.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume que hereda los de Qwen3-4B, que incluye principalmente ingles y chino, con menor soporte para otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribucion.
- Caveat para produccion: este checkpoint es un modelo SFT intermedio, no el modelo final entrenado con MARL. Para tareas de produccion que requieran el maximo rendimiento en busqueda amplia, se recomienda utilizar WideSeek-R1-4B (el modelo RL) en lugar de esta version SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WideSeek-R1/WideSeek-SFT-4B
- Paper (arXiv): https://arxiv.org/abs/2602.04634
- Version HTML del paper: https://arxiv.org/html/2602.04634v1
- Pagina del proyecto: https://wideseek-r1.github.io/
- Dataset de entrenamiento: https://huggingface.co/datasets/WideSeek-R1/WideSeek-R1-SFT-data
- Modelo RL (WideSeek-R1-4b): https://huggingface.co/WideSeek-R1/WideSeek-R1-4b
