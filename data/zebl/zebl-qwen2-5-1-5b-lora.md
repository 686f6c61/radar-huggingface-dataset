# zebl/zebl-qwen2.5-1.5b-lora

## Resumen

ZEBL behavior LoRA es un adaptador LoRA (PEFT) publicado por el usuario `zebl` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No es un modelo completo, sino un ajuste fino de bajo rango (r=16, alpha=32) aplicado sobre todas las proyecciones de atención y MLP del transformer de Qwen2.5-1.5B. Su objetivo declarado es modificar el comportamiento de respuesta frente a una base de conocimiento interna denominada ZEBL: citar la unidad de conocimiento esperada, rechazar responder cuando la respuesta es desconocida o el estado no coincide, y señalar reglas en conflicto.

El adaptador está marcado explícitamente como privado/interno y evaluado únicamente con un evaluador automático del propio proyecto, sin validación humana ni por parte de facturadores. El repositorio ocupa 0,1 GB y solo contiene los pesos del adaptador en formato safetensors, por lo que requiere descargar el modelo base Qwen2.5-1.5B-Instruct (aproximadamente 3 GB en fp16) para poder ejecutarse.

Su relevancia es acotada: se trata de un experimento de alineación de comportamiento sobre un modelo pequeño (1.500 millones de parámetros), útil como referencia para quienes trabajen en patrones de citación, abstención y detección de conflictos en dominios con base de conocimiento estructurada, pero no apto para producción sin revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | other (marcada como privada/interna por el autor) |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parámetros. El LoRA usa rango r=16 y alpha=32, con módulos objetivo en todas las proyecciones de atención (q, k, v, o) y de la MLP (gate, up, down). El entrenamiento se realizó con learning rate 2e-4 durante 3 épocas en modo "behavior", sobre una GPU Kaggle T4 doble, con un tiempo aproximado de 98 minutos para esta configuración.

El autor realizó un barrido de hiperparámetros con dos modelos base (Qwen3-1.7B y Qwen2.5-1.5B), rangos r en {8, 16} y épocas en {2, 3}, seleccionando esta combinación como la mejor según una métrica compuesta propia. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el ajuste es de tipo supervisado sobre la base de conocimiento ZEBL. El `val_loss` final reportado es 0,038, un valor muy bajo que el propio autor señala como posible indicio de solapamiento entre entrenamiento y evaluación.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-1.5B-Instruct.
- Citación de unidades de conocimiento: el adaptador está entrenado para citar el identificador de la unidad esperada (tasa de acierto reportada del 89,5 % en el conjunto de evaluación propio).
- Abstención controlada: rechazo cuando la respuesta es desconocida (tasa de 1,000) o cuando el estado no coincide (0,943).
- Detección y exposición de reglas en conflicto (tasa de conflicto señalado del 95,7 %).
- No resuelve conflictos: la tasa de conflicto resuelto es 0,000, solo los señala.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente interno de consulta sobre base de conocimiento normativa: el adaptador puede desplegarse como capa de comportamiento sobre Qwen2.5-1.5B-Instruct para que las respuestas citen la unidad normativa correspondiente, facilitando la trazabilidad de cada afirmación en un chatbot interno de soporte a facturación.
- Detección de ambigüedad regulatoria: en flujos donde dos reglas internas entran en conflicto, el modelo señala la discrepancia (95,7 % en el conjunto de prueba) para que un humano la resuelva, en lugar de inventar una respuesta unificada.
- Filtro de abstención en pipelines de extracción: dado que la tasa de rechazo ante información desconocida es del 100 % en la evaluación del autor, puede usarse como guardarraíl previo a un sistema mayor para descartar consultas fuera de dominio antes de invocar un modelo más grande.
- Prototipado rápido de asistentes con citación: al ser un adaptador de 0,1 GB sobre un modelo de 1,5 B, permite iterar en hardware modesto (una sola GPU consumer) sobre el patrón de "responder citando fuente", útil como prueba de concepto antes de escalar a un modelo mayor.
- Investigación sobre alineación de comportamiento: sirve como caso de estudio reproducible de cómo un LoRA de rango 16 modifica pautas de citación y abstención en un modelo pequeño, con métricas publicadas y advertencias explícitas del autor.
- Evaluación de riesgo de alucinación en dominios regulados: con una tasa de alucinación reportada del 23,9 % y solo un 76,1 % de identificadores citados válidos, puede emplearse como banco de pruebas para medir la eficacia de capas de verificación posteriores (validación de IDs contra la base de conocimiento).
- Docencia y demostraciones de PEFT: por su tamaño reducido y su receta de entrenamiento documentada (r=16, alpha=32, lr 2e-4, 3 épocas, T4 x2), es un ejemplo práctico para explicar el ajuste fino eficiente en cursos y talleres.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 88 elementos reservados, con puntuación automática propia (no validada por humanos ni por facturadores):

| Métrica | Modelo base | Este adaptador |
|---|---|---|
| Compuesta (composite) | 0,458 | 0,893 |
| Tasa de alucinación (menor es mejor) | no disponible | 0,239 |
| Conflicto señalado | no disponible | 0,957 |
| Citó la unidad esperada | no disponible | 0,895 |
| Rechazo cuando es desconocido | no disponible | 1,000 |
| Rechazo cuando el estado no coincide | no disponible | 0,943 |
| Tasa de identificadores de unidad válidos | no disponible | 0,761 |
| Tasa de conflicto resuelto | no disponible | 0,000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB en disco; el modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB en fp16 y alrededor de 1 GB en cuantización de 4 bits.
- VRAM estimada para inferencia: en torno a 4-6 GB en fp16 con overhead de activaciones y contexto; en torno a 2-3 GB con cuantización de 4 bits del modelo base.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe en GPUs consumer de gama media; también puede ejecutarse en CPU con llama.cpp si se fusiona y convierte el adaptador a GGUF.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en unos 98 minutos en 2x T4, lo que da una idea del reducido coste computacional del ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZEBL behavior LoRA (este) | Adaptador sobre 1,5 B | No disponible | other (privada/interna) | Hugging Face, 0 descargas | Especializado en citación y abstención; evaluación automática propia |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face, modelo público ampliamente usado | Sin ajuste de comportamiento ZEBL; composite 0,458 en la evaluación del autor |
| Qwen3-1.7B | 1,7 B | No disponible | No disponible en la información proporcionada | Hugging Face | Probado en el barrido del autor, descartado frente a Qwen2.5-1.5B |
| Otros adaptadores LoRA de comportamiento | Variable | Variable | Variable | Hugging Face | No se dispone de comparación cuantitativa en la información proporcionada |

No se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría; la única comparación numérica publicada es contra el modelo base en la métrica compuesta propia del proyecto.

## Limitaciones y advertencias

- El autor declara explícitamente que el adaptador es privado/interno y no ha sido validado por facturadores ni por revisión humana.
- Tasa de alucinación del 23,9 % en el conjunto de evaluación propio: aproximadamente una de cada cuatro respuestas contiene información inventada o incorrecta.
- Solo el 76,1 % de los identificadores de unidad citados son válidos, lo que implica que casi un cuarto de las citas apuntan a referencias inexistentes o mal formadas.
- La tasa de conflicto resuelto es 0,000: el modelo detecta y señala conflictos, pero no los resuelve; requiere intervención humana.
- No se ha verificado si los 88 elementos de prueba se solapan con los datos de entrenamiento; el `val_loss` final de 0,038 es sospechosamente bajo y sugiere posible sobreajuste o fuga de datos.
- Las métricas provienen de un evaluador automático del propio proyecto, no de una evaluación independiente ni de exactitud de facturación.
- Licencia "other" sin términos públicos claros: no se especifican restricciones de uso comercial, por lo que debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no ha sido evaluado para este adaptador.
- No debe usarse para decisiones reales de facturación sin revisión humana explícita, según indica el propio autor.
- Al ser un adaptador, hereda los sesgos y limitaciones de Qwen2.5-1.5B-Instruct, incluidos posibles sesgos de género, idioma y dominio.
- Riesgo de sobreconfianza: la alta tasa de rechazo (1,000) puede producir falsos negativos en consultas que sí tenían respuesta dentro de la base de conocimiento pero con formulación distinta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zebl/zebl-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://huggingface.co/docs/peft
- Repositorio mencionado en el código de uso del autor (ruta alternativa): https://huggingface.co/Varshithdharmaj/zebl-qwen2.5-1.5b-lora
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
