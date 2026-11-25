# sthanika-ai/Sieve-9B-v3

## Resumen

Sieve-9B-v3 es un modelo de decisión desarrollado por sthanika-ai, presentado como parte de la familia Sieve. No es un modelo generativo: recibe un estado (texto o JSON) y una serie de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. Lee el estado una sola vez, puntúa las opciones directamente a través de los logits de su capa de salida y nunca genera texto. Esto lo convierte en una herramienta especializada para clasificación y toma de decisiones estructurada, no para conversación o generación libre.

Técnicamente es un fine-tune completo de Qwen/Qwen3.5-9B (revisión `c2022362`), con 8.953.803.264 parámetros totales. La innovación principal reside en su atención: las 8 capas de atención completa son bidireccionales, mientras que las 24 capas de Gated DeltaNet (atención lineal) permanecen causales. Además, cada pregunta de una petición se procesa de forma aislada, sin que vea las opciones de las demás, lo que permite agregar múltiples decisiones en una sola pasada.

Su relevancia actual radica en que aborda un problema distinto al de los LLM generativos: la clasificación calibrada y determinista. El modelo declara una puntuación de 67,60 en el Decision Index 0.3 (corregido por azar) sobre 140.178 peticiones puntuadas, un índice que promedia 37 benchmarks. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (8 capas de atención completa bidireccional + 24 capas Gated DeltaNet de atención lineal causal), basado en Qwen3.5-9B |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | sin límite declarado; entrenado con prompts de hasta 16.384 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards en bf16) + `head.pt` con la política de lectura, la regla de atención y las temperaturas |

## Arquitectura y entrenamiento

Sieve-9B-v3 parte del backbone Qwen3.5-9B, del que solo se utiliza la parte de texto. El fine-tune es completo sobre las 32 capas del decodificador (6,92B parámetros); los embeddings de tokens, la capa de salida y todas las normas permanecen congeladas del modelo base. Los pesos publicados son una media ponderada de dos ejecuciones de fine-tune (0,35 cada una, semillas 0 y 1) y el backbone original (0,3). Todos los tensores se almacenan en bf16, incluidos `A_log` y los pesos de normalización que Qwen3.5-9B mantiene en fp32; el modelo fue entrenado y evaluado de esta forma.

La innovación arquitectónica clave es la atención bidireccional en las 8 capas de atención completa. Como el modelo no genera texto, cada token puede atender a todos los demás del bloque, de modo que el estado se lee a la luz de la pregunta y sus opciones. En peticiones con varias preguntas, cada una constituye una fila independiente: el bloque compartido (turno de sistema, lista de preguntas y estado) solo se atiende a sí mismo, y el bloque de la pregunta atiende al compartido y a sí mismo; las preguntas nunca ven las opciones de las otras. Las capas de atención lineal son recurrentes y causales en todos los casos, por lo que el bloque compartido se recalcula una vez por pregunta. El modelo se entrenó con esta misma regla de atención y el código de servicio la aplica de forma idéntica. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisión tipada: soporta preguntas `choice` (de 2 a 255 opciones con claves del llamante), `noul` (sí/no) y `score` (lista ordenada de 2 a 10 niveles).
- Calibración de probabilidades: devuelve una probabilidad por opción mediante softmax con temperatura global T = 0,876 y 22 temperaturas por categoría de pregunta (de 0,694 a 0,992).
- Lectura de estado en texto o JSON: el estado se procesa una sola vez y se reutiliza para todas las preguntas de la petición.
- Aislamiento entre preguntas: cada pregunta se puntúa sin acceso a las opciones de las demás, lo que evita contaminación cruzada.
- Salida determinista sin generación de texto: nunca trunca, descarta ni reordena opciones, ni ajusta prompts por benchmark.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera ni razona en texto).
- Capacidades multilingües: solo inglés.
- Capacidades especiales: lectura mediante logits de la capa de salida del backbone (etiquetas A, B, …, hasta AA, AB, … hasta 255 opciones), sin modo thinking.

## Casos de uso

- Clasificación de tickets de soporte: dado el texto de un ticket como estado, se formulan preguntas `choice` sobre categoría, prioridad y equipo responsable; el modelo devuelve la opción más probable y su confianza, lo que permite enrutar automáticamente con umbrales de calibración.
- Moderación de contenido con niveles graduados: usando preguntas `score` con una escala de 2 a 10 niveles, se obtiene el nivel esperado de gravedad y la distribución de probabilidad por nivel, útil para políticas de moderación proporcionales.
- Extracción de decisiones binarias en pipelines: con preguntas `noul`, se responde sí/no a condiciones como "¿el documento contiene datos personales?" o "¿el importe supera el umbral?", con P(sí) como señal calibrada.
- Evaluación de respuestas en sistemas RAG: el estado puede incluir la pregunta del usuario y el fragmento recuperado; preguntas `choice` sobre relevancia o suficiencia permiten filtrar recuperaciones antes de pasarlas a un LLM generativo.
- Análisis de formularios y JSON estructurados: al aceptar JSON como estado, el modelo puede puntuar opciones sobre campos de un formulario (tipo de contrato, régimen fiscal, etc.) sin necesidad de un generador.
- Enrutamiento de decisiones en agentes: integrado como componente de decisión en un pipeline mayor, clasifica el siguiente paso o la herramienta adecuada entre un conjunto de opciones, aportando probabilidades calibradas en lugar de texto libre.
- Verificación de consistencia en anotación: dado un texto y las opciones de una guía de anotación, se obtiene la etiqueta más probable y su confianza para priorizar la revisión humana de los casos con menor certeza.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| Decision Index 0.3, suite pública (140.178 peticiones puntuadas; media de 37 benchmarks) | Decision Index 0.3, índice público corregido por azar | 67,60 | No (declarado por el autor) |

El resultado corresponde a una ejecución propia del autor sobre la suite 0.3 y está enviado en el PR apolinario/decision-index#411, pero aún no aparece en la clasificación pública. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,7 GiB para los pesos en bf16.
- GPU recomendadas: una A100 de 40 GB fue suficiente para todas las peticiones públicas del Decision Index; no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: no disponible (no se confirma en la información proporcionada).
- Opciones de despliegue: paquete `sieve-decisions[serve]` (versión 0.5.1 o superior) desde el repositorio de GitHub, con torch 2.8.0 y `causal-conv1d==1.7.0`; también disponible sin GPU mediante la Sieve One API con el ID de modelo `sieve-9b-v3`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-9B-v3 | 8,95B | hasta 16.384 tokens de entrenamiento | Modelo de decisión (sin generación) | Apache 2.0 | Hugging Face + API |
| Qwen3.5-9B (base) | 9B (aproximado) | no disponible | LLM generativo | no disponible | Hugging Face |
| Otros modelos de la familia Sieve | no disponible | no disponible | Modelos de decisión | no disponible | Colección de Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- No genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural, resúmenes o razonamiento explícito queda fuera de su alcance.
- El resultado del Decision Index (67,60) no está verificado de forma independiente y no figura aún en la clasificación pública; debe tratarse como dato declarado por el autor.
- El modelo se entrenó solo con los tipos de pregunta `choice` y `noul`; el tipo `score` está soportado en la interfaz pero no fue parte del entrenamiento, según la model card.
- No se especifican en la información disponible los sesgos conocidos, la composición del dataset de entrenamiento ni el riesgo de alucinación en el sentido generativo (el modelo no produce texto libre, pero sus probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene revisar.
- El despliegue requiere versiones específicas de dependencias (torch 2.8.0, `causal-conv1d==1.7.0`) y el paquete `sieve` 0.5.1 o superior; no se garantiza compatibilidad con otras configuraciones.
- La atención bidireccional y la regla de aislamiento entre preguntas están implementadas en el código de servicio; un uso incorrecto del pipeline puede alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-9B-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Pull request del Decision Index: https://github.com/apolinario/decision-index/pull/411
- API Sieve One: https://dashboard.sieve.one/
