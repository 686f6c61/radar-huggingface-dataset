# yasserrmd/LFM2.5-1.2B-Instruct-WSP-JSONFix

## Resumen

LFM2.5-1.2B-Instruct-WSP-JSONFix es una edición de pesos del modelo LiquidAI/LFM2.5-1.2B-Instruct desarrollada por el usuario yasserrmd. No se trata de un nuevo modelo entrenado, sino de una reparación de comportamiento (*behavior repair*) aplicada mediante edición de pesos sin entrenamiento (*training-free weight editing*): se escalaron exactamente 16 columnas de la proyección descendente de la FFN (`w2`) en las capas 12 a 15 por un factor de 0,5, lo que modifica 32.768 valores almacenados en BF16 (el 0,0028% del total del modelo). El objetivo es evitar que el modelo envuelva respuestas JSON estrictas en bloques de código markdown.

El modelo base pertenece a la familia LFM2.5 de Liquid AI, una arquitectura "liquid" de 1.170.340.608 parámetros totales (aproximadamente 1,2B), orientada a generación de texto conversacional y compatible con la librería transformers. La edición es reversible y está documentada de forma bit a bit: el repositorio incluye el parche disperso (`chosen_patch.safetensors`), su manifiesto y los scripts `apply_patch.py` y `rebuild_patch.py` para aplicar, revertir o regenerar el parche desde el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de edición de pesos interpretable y de bajo coste (sin descenso de gradiente, sin fine-tuning, sin LoRA y sin cambios en el dataset); por otro, advierte de que se trata de un artefacto de investigación con una muestra de evaluación pequeña y con métricas de regresión en algunas tareas (por ejemplo, tareas de terminación). El modelo conserva la licencia LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia "liquid" de Liquid AI); transformer con capas FFN con proyección down `w2`; detalles completos de la arquitectura del modelo base no disponibles en la información proporcionada |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en BF16; el repo ocupa 2,3 GB) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (LFM Open License v1.0), sin cambios respecto al modelo base |
| Formato de pesos | safetensors (transformers); el parche se distribuye como `chosen_patch.safetensors` |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-1.2B-Instruct (revisión `b9d816ab510f9a28dca37cb182e9da8b0226e13c`), un modelo de la familia LFM2.5 de Liquid AI con arquitectura "liquid" y 1.170.340.608 parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base; esos datos deben consultarse en la model card original de LiquidAI/LFM2.5-1.2B-Instruct.

La innovación de esta variante no está en el entrenamiento, sino en la edición de pesos: se aplicó un parche disperso y reversible sobre la proyección descendente de la FFN (`w2`) en las capas 12, 13, 14 y 15. Concretamente, se escalaron 16 columnas por 0,5 (3 columnas en la capa 12, 3 en la 13, 1 en la 14 y 9 en la 15), afectando a 32.768 valores BF16. No se usó descenso de gradiente, fine-tuning, LoRA ni actualización de dataset. Los controles emparejados (mismo tamaño, columnas aleatorias o direcciones aleatorias) se mantuvieron en el nivel del modelo base (166 a 167 de 256), lo que sugiere que el efecto es específico de las columnas seleccionadas y no un artefacto de la magnitud del cambio.

## Capacidades

- Generación de texto conversacional en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Producción de JSON estricto sin envolverlo en bloques de código markdown, que es la capacidad reparada por esta edición.
- Mantiene la capacidad de respetar peticiones explícitas de bloque de código: 48 de 48 prompts que solicitan un bloque de código conservaron la valla en la evaluación.
- Generación de arrays JSON de nivel superior y objetos JSON (con mejoras medidas en exactitud respecto al base).
- Respuestas cortas exactas y tareas de sanidad general preservadas (57/64 y 64/64 en la evaluación reportada).
- No se documentan en la información proporcionada capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; deben verificarse en la model card del modelo base.

## Casos de uso

- Extracción de datos estructurados en pipelines: el modelo puede devolver JSON estricto directamente consumible por un parser, sin necesidad de eliminar vallas markdown, lo que simplifica la integración en ETL y en sistemas de ingesta.
- Generación de respuestas de API: al evitar bloques de código en respuestas JSON, reduce errores de parseo en servicios que validan la salida contra un esquema antes de responder al cliente.
- Automatización de formularios y salidas de agentes: útil en flujos donde el modelo debe emitir objetos JSON que se validan con JSON Schema y se insertan en una base de datos.
- Evaluación de técnicas de edición de pesos: el repositorio incluye el parche y los scripts de aplicación y reversión, por lo que sirve como caso de estudio reproducible de *weight editing* sin entrenamiento para investigadores.
- Despliegue en entornos con recursos limitados: con 1,2B parámetros y pesos en BF16 (repo de 2,3 GB), es candidato para inferencia en GPU de consumo, aunque la VRAM exacta no está documentada en la información disponible.
- Clasificación y etiquetado con salida estructurada: tareas donde se pide al modelo un array JSON de etiquetas o categorías, aprovechando la mejora medida en arrays de nivel superior (97/128 frente a 76/128 del base).
- Prototipado multilingüe: al cubrir ocho idiomas, puede usarse en demos de asistentes conversacionales con salida estructurada en entornos de habla hispana, árabe, china, francesa, alemana, japonesa y coreana.

## Benchmarks y rendimiento

Resultados de la evaluación *held-out* reportada por el autor (evaluada una vez, tras la selección). La muestra es pequeña: 64 prompts de test JSON estricto (32 objetos, 32 arrays), regenerados y basados en plantillas.

| Metrica | Base | Este modelo |
|---|---|---|
| Strict-JSON exact match (greedy + 3 semillas muestreadas, 256 unidades) | 167/256 | 196/256 (29 corregidos, 0 rotos) |
| Strict-JSON exact match, greedy (64 prompts) | 42/64 | 49/64 |
| Respuestas envueltas en bloques de código | 41/256 | 0/256 |
| Arrays JSON de nivel superior exactos | 76/128 | 97/128 (0 rotos) |
| Objetos JSON exactos | 91/128 | 99/128 |
| Prompts que piden bloque de código (valla conservada) | 48/48 | 48/48 |
| Respuestas cortas exactas / sanidad general | 57/64, 64/64 | 57/64, 64/64 |
| Tareas de terminación | 36/64 | 35/64 |
| Perplejidad WikiText-2 | 130,547 | -0,073% relativo |

Controles emparejados (mismo tamaño, columnas aleatorias o direcciones aleatorias): 166 a 167/256, es decir, sin mejora respecto al base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,17B parámetros en BF16, los pesos ocupan aproximadamente 2,3 GB, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es compatible con GPU de consumo, pero no se especifican modelos concretos (RTX 4090, A100, H100, etc.).
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: transformers (librería indicada en la model card); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-WSP-JSONFix (este modelo) | 1.170.340.608 | no disponible | Edición de pesos para JSON estricto | lfm1.0 | Hugging Face (yasserrmd) |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B (modelo base) | no disponible | Modelo conversacional base | lfm1.0 | Hugging Face (LiquidAI) |
| Alternativas de ~1B-2B para JSON estructurado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoría; la comparación directa más fiable es contra el propio modelo base, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Se trata de una reparación de comportamiento, no de una nueva capacidad: no mejora el razonamiento, el conocimiento ni las habilidades generales del modelo base.
- La evaluación se realizó sobre una muestra pequeña (64 prompts de test, 256 unidades con semillas) y una única vez tras la selección; los resultados pueden no generalizar.
- Regresión leve en tareas de terminación: 35/64 frente a 36/64 del base.
- Sesgos conocidos: no documentados en la información proporcionada; deben heredarse los del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; se mantiene el del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el soporte multilingüe se limita a los ocho idiomas listados.
- Restricciones de licencia: LFM Open License v1.0 (lfm1.0); es necesario revisar los términos para uso comercial, ya que la licencia se etiqueta como "other" en Hugging Face.
- Al ser un derivado con edición de pesos, conviene validar el comportamiento en producción frente al modelo base antes de adoptarlo, especialmente en tareas distintas de la generación de JSON.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/LFM2.5-1.2B-Instruct-WSP-JSONFix
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Informe del experimento (referenciado en la model card): `wsp/WSP_1_2B_Experiment_Report.md` dentro del repositorio
- Parche y scripts (referenciados en la model card): `wsp/chosen_patch.safetensors`, `wsp/apply_patch.py`, `wsp/rebuild_patch.py`
- Licencia: `LICENSE` en el repositorio (LFM Open License v1.0)
