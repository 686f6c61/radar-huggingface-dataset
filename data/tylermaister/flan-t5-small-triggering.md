# tylermaister/flan-t5-small-triggering

## Resumen

flan-t5-small-triggering es un modelo de clasificación de intenciones desarrollado por el usuario tylermaister como fine-tuning de google/flan-t5-small. Su función concreta es determinar si un texto conversacional debe activar dos comportamientos independientes: `action_triggering` (activación de acciones) y `memory_triggering` (activación de memoria). Para cada tarea devuelve exactamente una de dos etiquetas: `TRIGGER` o `NO_TRIGGER`.

El modelo resuelve un problema acotado dentro de pipelines de agentes conversacionales: separar la detección de intención de la ejecución real de acciones. El autor insiste en que el modelo solo clasifica intención y no autoriza ni ejecuta acciones, por lo que debe combinarse con una capa separada de autorización y seguridad. Está pensado como un componente de enrutamiento ligero, no como un modelo generativo de propósito general.

Con 76.961.152 parámetros (aproximadamente 77 millones), se trata de un modelo muy pequeño derivado de la arquitectura T5, con licencia Apache-2.0 y pesos en formato safetensors. Su relevancia es la de un clasificador especializado y desplegable en hardware mínimo, aunque su entrenamiento y evaluación se basan en datos sintéticos y su validación en producción está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), fine-tuning de google/flan-t5-small |
| Parametros totales | 76.961.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/flan-t5-small, un transformer encoder-decoder de la familia T5 afinado previamente con instrucciones (FLAN). Sobre esa base, el autor realizó un fine-tuning supervisado para una tarea de clasificación binaria expresada como generación de texto: la entrada sigue el formato `task: <tarea>\ntext: <texto>` y la salida esperada es la cadena `TRIGGER` o `NO_TRIGGER`. No se documenta el uso de RLHF ni DPO.

El conjunto de entrenamiento consta de 476 ejemplos deduplicados que cubren ambas tareas y ambas etiquetas, e incluye ejemplos sintéticos y ejemplos negativos recogidos manualmente durante pruebas de un juego. La evaluación se realizó sobre un conjunto de test sintético de 80 ejemplos separado del entrenamiento. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de intención para la tarea `action_triggering`: decide si un texto debe activar una acción.
- Clasificación binaria de intención para la tarea `memory_triggering`: decide si un texto debe activar un comportamiento de memoria.
- Salida restringida a las etiquetas `TRIGGER` y `NO_TRIGGER`; cualquier otra cadena generada debe tratarse como inválida.
- Procesamiento de texto en inglés únicamente.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para comportamiento de agente autónomo.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No es un modelo multilingüe.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo recibe el turno del usuario con el formato `task: ...\ntext: ...` y devuelve `TRIGGER` o `NO_TRIGGER` para decidir si se debe invocar un módulo de acción, siempre detrás de una capa de autorización independiente.
- Detección de peticiones de memoria en chatbots: permite identificar frases como "¿qué te pedí que recordaras?" y activar el subsistema de memoria persistente solo cuando el clasificador lo indica.
- Prefiltro de bajo coste en pipelines de agentes: al tener unos 77 millones de parámetros, puede ejecutarse en CPU o en GPU de gama baja para descartar la mayoría de turnos antes de llamar a un modelo mayor y más caro.
- Control de disparadores en entornos de juego o simulación: los ejemplos negativos del entrenamiento provienen de pruebas de un juego, por lo que encaja en la detección de comandos o disparadores dentro de ese tipo de interacción.
- Componente de un sistema de seguridad en capas: el modelo clasifica intención y el sistema externo aplica políticas de autorización, validación de salida y registro de decisiones.
- Prototipado rápido de clasificadores de intención: sirve como base para experimentar con el formato de entrada `task:`/`text:` y evaluar la viabilidad de un enfoque generativo para clasificación binaria antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Exactitud global (test sintético de 80 ejemplos) | 98,75% |
| F1 macro global (test sintético de 80 ejemplos) | 98,75% |
| Salidas inválidas | 0 |

El autor advierte explícitamente de que estos resultados no deben interpretarse como una estimación del rendimiento en producción, ya que el conjunto de evaluación es sintético y el lenguaje real puede contener ambigüedad, erratas, formulaciones indirectas o casos fuera de la distribución de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con aproximadamente 77 millones de parámetros, los pesos en precisión completa ocupan alrededor de 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; también viable en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM y AutoTokenizer), y por extensión frameworks compatibles con modelos T5 como TGI o vLLM; no se documentan configuraciones específicas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flan-t5-small-triggering | 76.961.152 | no disponible | Clasificación binaria de intención (action/memory triggering) | apache-2.0 | Hugging Face (tylermaister) |
| google/flan-t5-small | ~77 M | 512 tokens (arquitectura T5) | Generación texto-a-texto e instrucciones generales | apache-2.0 | Hugging Face (google) |
| Clasificadores de intención basados en BERT pequeños | no disponible | no disponible | Clasificación de intenciones | variable | Hugging Face |

La comparación directa con alternativas especializadas en detección de disparadores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un motor de autorización ni de políticas; solo clasifica intención y debe ir acompañado de una capa externa de autorización y seguridad.
- Los errores de clasificación pueden producir disparadores falsos o disparadores omitidos.
- El rendimiento medido sobre datos sintéticos puede no generalizarse a conversaciones reales de usuarios.
- Las salidas deben normalizarse y validarse contra las dos etiquetas permitidas; cualquier otro texto generado debe rechazarse.
- La ejecución de acciones debe mantenerse fuera del modelo y detrás de comprobaciones explícitas de autorización.
- Solo soporta inglés; no hay soporte multilingüe documentado.
- El conjunto de entrenamiento es muy reducido (476 ejemplos) y la evaluación se realizó sobre solo 80 ejemplos sintéticos.
- Riesgo de alucinación en la salida: al ser un modelo generativo, puede producir texto distinto de las etiquetas válidas, por lo que la validación de salida es obligatoria.
- No se documentan sesgos conocidos ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tylermaister/flan-t5-small-triggering
- Modelo base: https://huggingface.co/google/flan-t5-small
