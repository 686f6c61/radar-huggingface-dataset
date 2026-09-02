# WilliamSheltonGoh/ESD_gemma_9B

## Resumen

El modelo `WilliamSheltonGoh/ESD_gemma_9B` es un adaptador PEFT (LoRA) construido sobre el modelo base `google/gemma-2-9b-it`, la versión instruccional del Gemma 2 de 9 mil millones de parámetros desarrollado por Google. El repositorio, publicado en septiembre de 2026, contiene únicamente los pesos del adaptador (0,7 GB), no el modelo completo, lo que indica que se trata de un ajuste fino de bajo rango para alguna tarea específica, probablemente relacionada con el acrónimo "ESD" (posiblemente *Emotional Support Dialogue* o similar, aunque no se especifica).

La relevancia de este modelo radica en que aprovecha las capacidades del Gemma 2 9B, que destaca por su arquitectura transformer con atención alternada local/global, entrenado con 8 billones de tokens y con una ventana de contexto de 8192 tokens. Sin embargo, la documentación disponible es extremadamente limitada: la model card está sin completar, no hay información sobre el dataset de entrenamiento, hiperparámetros, ni evaluación. Esto limita seriamente cualquier uso en producción sin una validación previa por parte del desarrollador.

A pesar de su estado incompleto, el modelo puede ser de interés para quienes ya trabajan con Gemma 2 y desean probar un adaptador ligero que no requiere los recursos de un fine-tuning completo. No obstante, cualquier decisión de adopción debe basarse en pruebas propias, ya que no hay datos públicos de rendimiento ni de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2 9B, atención alternada local/global) |
| Parametros totales | 9 000 millones (modelo base) + adaptador LoRA de tamaño desconocido |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador usa safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible (el modelo base usa licencia Gemma, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base, Gemma 2 9B, emplea una arquitectura transformer decodificador con una innovación clave: alternancia entre atención local (ventana de 4096 tokens) y atención global (ventana completa de 8192 tokens) en capas sucesivas. Esta técnica reduce el coste computacional manteniendo la capacidad de modelar dependencias largas. El modelo base fue entrenado con 8 billones de tokens de datos web, código y documentos multilingües, seguido de un ajuste fino supervisado y optimización por preferencias humanas (RLHF) para la variante instruct.

En cuanto al adaptador `ESD_gemma_9B`, no se dispone de información sobre el dataset de entrenamiento, el método de ajuste (aunque al usar PEFT se infiere LoRA o similar), los hiperparámetros, ni el número de pasos. El tag `arxiv:1910.09700` en el repositorio corresponde al paper de Lacoste et al. sobre estimación de emisiones de carbono en ML, lo que sugiere que el autor pudo haber utilizado la calculadora de impacto, pero no aporta detalles técnicos del entrenamiento. La librería PEFT versión 0.13.2 es la única referencia de software.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 2 9B it, que incluye comprensión de lenguaje, razonamiento y generación de respuestas en múltiples dominios.
- Soporte de tool calling / function calling: el modelo base Gemma 2 9B it soporta function calling, por lo que el adaptador podría conservar esta capacidad, aunque no está confirmado.
- Capacidades multilingües: el modelo base fue entrenado con datos multilingües, pero no se especifica si el adaptador mantiene o modifica este comportamiento.
- Capacidades especiales: no hay evidencia de modo thinking, visión o audio en el adaptador; el modelo base es puramente textual.

## Casos de uso

- Ajuste fino para diálogo de apoyo emocional: si "ESD" se refiere a *Emotional Support Dialogue*, el adaptador podría utilizarse en aplicaciones de acompañamiento conversacional, aunque sin datos de entrenamiento es imposible verificar su calidad.
- Experimentación con PEFT sobre Gemma 2: para desarrolladores que quieran estudiar cómo un adaptador LoRA modifica el comportamiento de Gemma 2 9B it, este modelo sirve como caso de estudio, cargándolo con `peft` y comparando con el base.
- Prototipado rápido de chatbots: dado que el adaptador es ligero (0,7 GB), puede cargarse en GPUs de gama media para pruebas de concepto de asistentes conversacionales, partiendo de las capacidades del modelo base.
- Investigación en adaptación de bajo rango: útil para analizar la transferencia de conocimientos cuando se aplica LoRA a un modelo ya instruccional, siempre que se documente el proceso.
- Integración en pipelines de generación aumentada por recuperación (RAG): el modelo base maneja bien contextos de 8192 tokens, por lo que el adaptador podría usarse en sistemas RAG si conserva esa capacidad, pero requiere validación.
- Evaluación comparativa de adaptadores: para quienes desarrollan sus propios adaptadores, este modelo puede servir como referencia de partida, aunque sin métricas públicas su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, ni comparativas con el modelo base u otros adaptadores. Se recomienda realizar una evaluación propia (por ejemplo, MMLU, HumanEval o tareas específicas del dominio) antes de considerar su uso.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA añade muy poco peso (0,7 GB), pero el modelo base Gemma 2 9B en precisión completa (bf16) requiere aproximadamente 18 GB de VRAM solo para los pesos. Con cuantización de 4 bits (por ejemplo, bitsandbytes) se reduce a unos 6-7 GB, más el adaptador.
- GPU recomendadas: para inferencia en bf16, una GPU con al menos 24 GB (RTX 3090/4090, A10G, L4). Para cuantización 4 bits, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización (por ejemplo, mediante `load_in_4bit=True` en transformers) es posible ejecutarlo en una RTX 3070/4060 de 8 GB, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` + `peft`, o exportar a GGUF para usar con llama.cpp u Ollama (previa fusión con el modelo base). También es compatible con vLLM si se fusiona el adaptador.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; el modelo base Gemma 2 9B suele generar entre 20 y 40 tokens/s en una RTX 4090 con cuantización 4 bits, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables del mismo autor ni de otros que compartan el mismo propósito (dado que se desconoce la tarea "ESD"). Como referencia, se compara el modelo base subyacente con otras alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-2-9b-it (base) | 9B | 8192 | Gemma license | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32768 | Apache 2.0 | Hugging Face |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8192 | Llama 3 license | Hugging Face |

El adaptador en sí no puede compararse directamente con estos modelos completos; solo tiene sentido compararlo con el modelo base para medir el efecto del ajuste fino, algo que no está documentado.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Gemma 2 puede presentar sesgos de género, raza y religión presentes en sus datos de entrenamiento; el adaptador podría acentuarlos o modificarlos, pero no hay análisis al respecto.
- Riesgo de alucinación: al ser un adaptador sobre un modelo instructivo, existe riesgo de generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: la ventana de 8192 tokens es fija; el adaptador no la amplía.
- Restricciones de licencia: el modelo base está sujeto a la licencia Gemma de Google (términos de uso que prohíben ciertos usos), pero el adaptador no declara licencia propia, lo que genera incertidumbre legal para uso comercial.
- Documentación insuficiente: la model card está incompleta; no hay información sobre el dataset, el proceso de entrenamiento, ni evaluación. Usar este modelo en producción sin pruebas previas es arriesgado.
- Posible sobreajuste: al ser un adaptador pequeño, es probable que se haya entrenado para una tarea muy específica; su rendimiento fuera de esa tarea puede degradarse significativamente respecto al modelo base.
- Fecha de creación futura: el repositorio está fechado en 2026, lo que sugiere que puede ser un experimento reciente; no hay garantía de mantenimiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/WilliamSheltonGoh/ESD_gemma_9B
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Model card de Gemma 2 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_2
- Paper de Gemma (arXiv:2403.08295): https://arxiv.org/abs/2403.08295
- Paper de emisiones (referenciado en tags): https://arxiv.org/abs/1910.09700
