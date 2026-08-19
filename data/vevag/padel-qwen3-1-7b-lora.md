# vevag/padel-qwen3-1.7b-lora

## Resumen

`vevag/padel-qwen3-1.7b-lora` es un adaptador LoRA de bajo rango desarrollado por el usuario `vevag` sobre el modelo base Qwen3-1.7B, con el objetivo de enseñar al modelo las reglas oficiales de pádel según la normativa de la Federación Internacional de Pádel (FIP). El adaptador se presenta como un checkpoint MVP (producto mínimo viable) entrenado con la técnica QLoRA mediante la librería MLX de Apple, lo que permite su ejecución eficiente en hardware Apple Silicon.

El modelo resuelve un problema concreto de fidelidad normativa: los modelos de lenguaje generalistas tienden a mezclar reglas de pádel con las de tenis o squash al responder preguntas sobre el reglamento. Este adaptador intenta corregir esa desviación mediante un conjunto de datos de 953 ejemplos curados y filtrados por un juez automático, destilados desde claude-opus-5 y fundamentados en el reglamento oficial FIP. El entrenamiento duró 424 segundos en Apple Silicon y ocupa 5.44 GB, lo que lo convierte en un experimento ligero y reproducible.

La relevancia actual de este modelo reside en su enfoque de especialización vertical mediante adaptadores LoRA sobre modelos pequeños (1.7B de parámetros), una tendencia creciente para aplicaciones de nicho donde la precisión normativa es crítica y los recursos de inferencia son limitados. El adaptador está diseñado para ser cargado sobre Qwen3-1.7B y no funciona de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen3-1.7B (Transformer denso) |
| Parametros totales | no disponible (adaptador LoRA de bajo rango; el base tiene 1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B, tipicamente 32K tokens) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA; pesos del adaptador en MLX) |
| Idiomas soportados | no disponible (probablemente ingles y espanol, no especificado) |
| Licencia | no disponible (el base Qwen3-1.7B es Apache-2.0, pero la licencia del adaptador no se declara) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer densa de Qwen3-1.7B, un modelo de lenguaje de 1.7 mil millones de parametros desarrollado por Alibaba Cloud. El adaptador LoRA se entrena sobre este modelo congelado, inyectando matrices de bajo rango en las capas de atencion y feed-forward para ajustar el comportamiento sin modificar los pesos originales.

El entrenamiento utiliza QLoRA (Quantized LoRA) implementado en MLX, la libreria de machine learning de Apple optimizada para silicio de Apple. Se emplearon 953 ejemplos de entrenamiento, cada uno filtrado mediante un juez automatico (LLM judge) que verificaba la fidelidad de las respuestas al reglamento FIP. Los datos fueron destilados desde claude-opus-5 y anclados en el rulebook oficial de la FIP. El proceso de entrenamiento consistio en 1200 iteraciones con batch size 2 y learning rate de 1e-4, completandose en 424 segundos con un uso de memoria de 5.44 GB. Los datos de entrenamiento corresponden a la version v2, que prioriza respuestas basadas en reglas con una mediana de 60 palabras por respuesta y un doble filtrado (double-gated) para eliminar ejemplos ambiguos o incorrectos.

## Capacidades

- Generacion de texto especializada en reglas de padel segun la normativa FIP, con respuestas de longitud media (alrededor de 60 palabras).
- Distincion explicita entre reglas de padel y deportes similares como tenis o squash, evitando contaminacion cruzada.
- Respuestas basadas en reglas (rule-first), priorizando la cita de la normativa sobre opiniones generales.
- Capacidad de seguir instrucciones en formato conversacional heredada del modelo base Qwen3-1.7B.
- No soporta tool calling ni function calling de forma nativa (el adaptador no anade estas capacidades).
- No soporta agentes ni razonamiento multi-paso avanzado mas alla de lo que ofrece el modelo base.
- Capacidades multilingues limitadas a las del modelo base, aunque no se especifican idiomas concretos.
- No incluye capacidades de vision, audio ni thinking mode.

## Casos de uso

- Arbitraje y resolucion de disputas en partidos de padel: el modelo puede responder consultas sobre situaciones de juego especificas (por ejemplo, si un balon que golpea el cristal antes de botar es valido) basandose en el reglamento FIP, ayudando a arbitros y jugadores a resolver dudas en tiempo real.
- Formacion y certificacion de entrenadores de padel: los instructores pueden usar el modelo como herramienta de consulta rapida durante sus cursos, verificando que sus explicaciones se ajustan a la normativa vigente.
- Desarrollo de asistentes virtuales para clubes de padel: integrado en un chatbot de un club deportivo, el modelo puede responder preguntas frecuentes sobre reglas, puntuacion y conducta en pista, reduciendo la carga del personal humano.
- Generacion de contenido educativo sobre reglamento de padel: el modelo puede producir articulos, guias o preguntas de examen para escuelas de padel, garantizando que el contenido sea normativamente correcto.
- Validacion de respuestas en sistemas de QA especializados: el adaptador puede usarse como componente de un pipeline mayor que verifique si las respuestas generadas por otros modelos cumplen el reglamento FIP.
- Investigacion en especializacion de modelos pequenos: sirve como caso de estudio para evaluar hasta que punto un adaptador LoRA de bajo coste puede corregir sesgos normativos en un modelo de 1.7B, con aplicaciones en dominios legales o regulatorios.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion propia sobre 31 escenarios de prueba retenidos, utilizando un juez LLM fundamentado en el reglamento FIP. Los resultados comparan el modelo base Qwen3-1.7B frente al modelo con el adaptador:

| Modelo | Spec adherence | Trap pass | Control pass |
|---|---:|---:|---:|
| Qwen3-1.7B base | 19.4% | 9.1% | 44.4% |
| Qwen3-1.7B + adaptador padel | 41.9% | 45.5% | 33.3% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion se limita a metricas especificas del dominio de padel, donde se observa una mejora significativa en adherencia a especificaciones (del 19.4% al 41.9%) y en la capacidad de superar trampas (trap pass) que mezclan reglas de otros deportes (del 9.1% al 45.5%). El control pass disminuye ligeramente (del 44.4% al 33.3%), lo que sugiere un trade-off en escenarios de control.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es muy ligero (los pesos del adaptador se anaden al modelo base), pero el modelo base Qwen3-1.7B requiere aproximadamente 3.5 GB en cuantizacion de 4 bits y unos 7 GB en precision completa (FP16). Con el adaptador, el consumo adicional es minimo (menos de 100 MB).
- GPU recomendadas: el entrenamiento se realizo en Apple Silicon (probablemente M1/M2/M3), por lo que cualquier Mac con 8 GB de RAM o superior puede ejecutarlo. En GPUs de NVIDIA, se puede usar con CUDA mediante MLX o convirtiendo los pesos a otro formato.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) si se usa cuantizacion. En Apple Silicon, cabe en cualquier Mac con 8 GB unificados.
- Opciones de despliegue: MLX (nativo en Apple Silicon), llama.cpp (si se convierten los pesos a GGUF), vLLM (con conversion a safetensors estandar), Ollama (si se empaqueta como modelo personalizado).
- Latencia y throughput: no se proporcionan datos especificos. Para un modelo de 1.7B en Apple Silicon, se espera una velocidad de generacion de 20-40 tokens por segundo en cuantizacion de 4 bits, y similar en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| vevag/padel-qwen3-1.7b-lora | 1.7B + LoRA | no disponible (base 32K) | no disponible | Reglas de padel FIP |
| Qwen3-1.7B (base) | 1.7B | 32K | Apache-2.0 | Generalista |
| janhq/qwen3-1.7b-jan-v1-lora | 1.7B + LoRA | 32K | Apache-2.0 | Ajuste general para chat |

La comparativa directa con otros adaptadores LoRA sobre Qwen3-1.7B es limitada porque la mayoria de adaptadores publicados se centran en mejorar el rendimiento conversacional general, no en dominios verticales especificos. El modelo `janhq/qwen3-1.7b-jan-v1-lora` es un ejemplo de adaptador LoRA generico, pero no aborda la especializacion normativa. Frente al modelo base, el adaptador de padel ofrece una mejora sustancial en el dominio objetivo, aunque a costa de una ligera reduccion en escenarios de control generales. No se dispone de comparativas con modelos de tamano similar especializados en reglas deportivas.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se entrena exclusivamente con datos destilados de claude-opus-5, lo que puede heredar sesgos del modelo profesor. No se ha realizado una auditoria de sesgos especifica.
- Riesgo de alucinacion: aunque el entrenamiento con datos filtrados reduce la probabilidad de inventar reglas, el modelo base Qwen3-1.7B sigue siendo propenso a alucinaciones en contextos fuera del dominio de padel. En escenarios de control, el rendimiento bajo (33.3%) sugiere que puede fallar en preguntas generales.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en el adaptador, aunque hereda la del base (32K tokens). Los idiomas soportados no estan documentados; probablemente el entrenamiento se realizo en ingles, por lo que el rendimiento en espanol (idioma oficial del padel) podria ser inferior.
- Restricciones de licencia: la licencia del adaptador no esta declarada en la model card. Aunque el modelo base Qwen3-1.7B es Apache-2.0, el adaptador podria tener restricciones adicionales no documentadas. Se recomienda contactar al autor antes de uso comercial.
- Caveat de produccion: este es un checkpoint MVP, no una version estable. La evaluacion se basa en 31 escenarios y un unico juez LLM, lo que limita la generalizacion de los resultados. El rendimiento en situaciones reales puede variar significativamente.
- Dependencia del modelo base: el adaptador requiere cargar Qwen3-1.7B completo, lo que implica gestionar dos componentes (base + adaptador) en el despliegue.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/vevag/padel-qwen3-1.7b-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Pagina de Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
- Ejemplo de adaptador comparable (janhq): https://huggingface.co/janhq/qwen3-1.7b-jan-v1-lora
