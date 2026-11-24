# uncle-vlad/qwen3.5-4b-decision-lora

## Resumen

Qwen3.5-4B Decision (LoRA) es un adaptador LoRA con cabecera de decisión publicado por el usuario uncle-vlad sobre el modelo base `unsloth/Qwen3.5-4B`. No es un modelo generativo: se trata de un *decision model* construido con `FastDecisionModel` de Unsloth que, dado un texto de entrada (el `state`) y un conjunto de preguntas tipadas sobre dicho texto, devuelve para cada pregunta una respuesta y una probabilidad calibrada por cada opción disponible. Todas las preguntas de una misma entrada se puntúan en un único forward pass.

El modelo resuelve el problema de extraer decisiones estructuradas y calibradas a partir de texto libre (clasificación de tickets, detección de intenciones, asignación de niveles de urgencia) sin necesidad de generar texto. Frente a un LLM generativo con prompting, ofrece salidas tipadas (`choice`, `noul`, `score`) con probabilidades calibradas por temperatura, lo que facilita su integración en pipelines automatizados que requieren umbrales de confianza.

Arquitectura: LoRA sobre un transformer Qwen3.5-4B (4.000 millones de parámetros) cargado en 4 bits, más una cabecera de decisión entrenada desde cero (4 capas, anchura 512, 8 cabezas de atención, 2 capas de routing sobre estados ocultos de 2560 dimensiones). El repositorio solo contiene adaptadores y cabecera (~195 MB, 0,2 GB en total); el modelo base se descarga automáticamente. Contexto máximo de 2048 tokens, licencia Apache-2.0 e idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B (base) + LoRA (r=16, alpha=16, dropout=0) + cabecera de decisión (4 capas, width 512, 8 cabezas, 2 capas de routing sobre hidden states de 2560 dim) |
| Parametros totales | 4B (modelo base) + ~195 MB de adaptadores y cabecera; parámetros del adaptador no desglosados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (entradas superiores se truncan) |
| Tipos de cuantizacion | Carga en 4 bits (`load_in_4bit=True`) según el ejemplo de uso; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `joint_head.safetensors`), PEFT |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3.5-4B cargado en 4 bits con adaptadores LoRA aplicados a las proyecciones de atención y MLP del modelo de lenguaje (`r=16`, `lora_alpha=16`, `lora_dropout=0`). Sobre los estados ocultos de 2560 dimensiones se añade una cabecera de decisión entrenada desde cero con 4 capas, anchura 512, 8 cabezas de atención y 2 capas de routing. La cabecera procesa conjuntamente el estado de entrada y las preguntas tipadas, devolviendo en un solo forward pass una respuesta y una distribución de probabilidad para cada pregunta.

El entrenamiento utiliza el dataset sintético en inglés `LocalLLaMA/typed-decisions` (config `all`, Apache-2.0), que cubre cuatro flujos de trabajo: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. La receta sigue el notebook de Unsloth para Qwen3.5 (4B) Decision: 60 pasos, batch por dispositivo de 8 con acumulación de gradiente de 4, learning rate 2e-4 con schedule coseno, 10 pasos de warmup, weight decay 0.01 y semilla 3407. Para la calibración se reservaron filas con `FastDecisionModel.split_holdout` y se ajustaron temperaturas por tipo de pregunta con `FastDecisionModel.calibrate`, incorporadas a los pesos de la cabecera al guardar.

## Capacidades

- Clasificación de texto estructurada mediante preguntas tipadas: tipo `choice` (selección de una clave de un conjunto etiquetado), tipo `noul` (verdadero/falso) y tipo `score` (índice de un nivel ordenado).
- Salida de probabilidades calibradas por opción para cada pregunta, con temperaturas ajustadas sobre datos de validación.
- Puntuación de múltiples preguntas sobre una misma entrada en un único forward pass.
- No genera texto: no es un modelo de chat ni funciona con `pipeline("text-generation")`, vLLM u otros servidores de generación tal cual.
- No dispone de tool calling, function calling, capacidades de agente propias ni modo *thinking*.
- Capacidad multilingüe limitada al inglés.
- No soporta visión ni audio.

## Casos de uso

- **Triaje de tickets de soporte**: clasificar cada ticket por equipo (`billing`, `technical`, `sales`), detectar si pide reembolso (`noul`) y asignar urgencia (`score`) en una sola llamada, usando las probabilidades calibradas para derivar a revisión humana los casos con confianza baja.
- **Procesamiento de facturas**: extraer decisiones estructuradas sobre documentos de facturación (tipo de incidencia, necesidad de acción, nivel de prioridad) dentro de un pipeline de back office, aprovechando que el modelo devuelve claves tipadas en lugar de texto libre parseable.
- **Observabilidad de trazas de agentes**: etiquetar trazas de agentes LLM con categorías predefinidas (tipo de fallo, gravedad) para construir dashboards y alertas automatizadas, uno de los cuatro flujos cubiertos por el dataset de entrenamiento.
- **Clasificación de incidentes de seguridad**: asignar severidad y categoría a alertas de seguridad mediante preguntas `score` y `choice`, con probabilidades calibradas que permiten fijar umbrales de escalado.
- **Enrutamiento de intenciones en atención al cliente**: determinar la intención del mensaje del cliente y el siguiente paso del flujo conversacional sin generar respuesta, dejando la generación a otro modelo del stack.
- **Moderación y filtrado con umbral de confianza**: usar la probabilidad calibrada de una pregunta `noul` (por ejemplo, "¿el mensaje contiene una solicitud de reembolso?") para decidir si se actúa automáticamente o se escala a un humano, gracias al ECE reportado de 0,02-0,06.

## Benchmarks y rendimiento

Los datos disponibles son los rangos de referencia del notebook de Unsloth para esta receta, no mediciones de este checkpoint concreto:

| Etapa | Métrica | Rango reportado |
|---|---|---|
| Antes de entrenar (cabecera nueva) | accuracy | ~30% |
| Tras calibración, filas reservadas | accuracy / ECE | 80-84% / 0,02-0,06 |
| Split de test de `typed-decisions` | accuracy | 75-78% |

No se han publicado mediciones específicas de este checkpoint ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo requiere GPU según la model card.
- VRAM estimada: no disponible de forma explícita; con el modelo base de 4B cargado en 4 bits y ~195 MB de adaptadores y cabecera, el requisito es el propio de un 4B en 4 bits más el overhead de la cabecera.
- GPU recomendadas: no disponibles en la información proporcionada.
- Encaje en GPU de consumo: no confirmado en la información disponible; por tamaño (4B en 4 bits) es plausible en GPUs de consumo con VRAM suficiente, pero el autor no lo especifica.
- Despliegue: requiere Unsloth (`FastDecisionModel`) instalado desde la rama main de GitHub (noviembre de 2026) y PEFT 0.21.2. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, al no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con alternativas en la información proporcionada. Como referencia estructural, este adaptador se apoya en Qwen3.5-4B (Apache-2.0, 4B parámetros, inglés) y se distingue de un uso generativo estándar del mismo base por su cabecera de decisión tipada y calibrada. Alternativas comparables de clasificación con calibración: no disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B Decision (LoRA) | 4B + adaptador | 2048 | Clasificación tipada calibrada | Apache-2.0 | Hugging Face (PEFT) |
| Qwen3.5-4B (base) | 4B | no disponible | Generación de texto | Apache-2.0 | Hugging Face |
| Alternativas de clasificación calibrada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre un dataset sintético pequeño en inglés de solo cuatro flujos de trabajo; la accuracy en otros dominios, idiomas o conjuntos de preguntas puede ser inferior.
- La calibración se ajustó sobre datos de la misma distribución que el entrenamiento; las probabilidades pueden no estar bien calibradas fuera de ella.
- Entradas de más de 2048 tokens se truncan.
- Las probabilidades son estimaciones de confianza, no garantías; el autor recomienda mantener un humano en el bucle en decisiones de alto riesgo.
- Solo inglés: no hay soporte multilingüe declarado.
- No es un modelo generativo: no puede usarse con `pipeline("text-generation")`, vLLM ni servidores de generación estándar.
- Dependencia de la rama main de Unsloth (noviembre de 2026) y PEFT 0.21.2; posibles roturas de compatibilidad en versiones futuras.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones (ambos Apache-2.0 según la información disponible).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/uncle-vlad/qwen3.5-4b-decision-lora)
- [Modelo base unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B)
- [Qwen3.5-4B (Qwen team)](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Dataset LocalLLaMA/typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [Notebook Qwen3.5 (4B) Decision](https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)-Decision.ipynb)
