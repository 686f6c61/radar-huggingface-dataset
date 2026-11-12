# sujalgawas/aya-json-sftV2

## Resumen

`sujalgawas/aya-json-sftV2` es un adaptador LoRA publicado en Hugging Face por el usuario `sujalgawas`, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `CohereLabs/tiny-aya-global`. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (aproximadamente 0,1 GB), no el modelo completo, y está pensado para cargarse con la librería PEFT sobre el checkpoint base de Cohere Labs.

El propósito declarado del modelo, a juzgar por su nombre (`aya-json-sft`), es la generación de salidas estructuradas en formato JSON, una tarea habitual en pipelines de extracción de información, function calling y agentes que necesitan respuestas parseables. Sin embargo, la model card está prácticamente vacía: no documenta el dataset de entrenamiento, los hiperparámetros, los idiomas soportados ni los resultados de evaluación.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva. Se trata de un artefacto de investigación personal, sin descargas ni interacciones en el momento de la consulta, y con una licencia no especificada, lo que impide recomendar su uso en producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base `CohereLabs/tiny-aya-global`) |
| Parametros totales | No disponible (el adaptador ocupa ~0,1 GB; el modelo base no se incluye en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no documentada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones que soporte su ecosistema) |
| Idiomas soportados | No disponible (la familia Aya es multilingue, pero la model card no lo confirma para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con SFT sobre `CohereLabs/tiny-aya-global`, un modelo de la familia Aya de Cohere Labs orientado a despliegue ligero y cobertura multilingue. La model card indica que se usaron las librerías `transformers` y `trl`, y que el entorno de entrenamiento empleó PEFT 0.21.0. No se especifican el rango del adaptador, la matriz de módulos objetivo, la tasa de aprendizaje, el número de pasos ni el tamaño del lote.

Tampoco se documenta la composición del dataset de instrucciones ni si hubo fases posteriores de alineamiento (RLHF, DPO). El sufijo `json` sugiere un conjunto de datos orientado a producir respuestas en JSON válido, pero no hay ninguna evidencia publicada al respecto. No se describe ninguna innovación técnica adicional (atención lineal, decodificación especulativa, modos de razonamiento, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base `tiny-aya-global`.
- Generación de salidas en formato JSON, presumiblemente por el objetivo del fine-tuning, aunque no verificado en la model card.
- Multilingueidad potencial heredada de la familia Aya (no confirmada para este adaptador).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- No se documentan capacidades específicas de código o matemáticas más allá de las del modelo base.

## Casos de uso

- Extracción de información estructurada: el adaptador podría emplearse para convertir texto libre en objetos JSON con un esquema fijo (por ejemplo, datos de facturas o currículums), siempre que se valide el esquema en la capa de aplicación.
- Preprocesado de pipelines de datos: generación de metadatos JSON a partir de documentos para su indexación en motores de búsqueda o bases de datos documentales.
- Prototipado de asistentes conversacionales ligeros: al estar construido sobre un modelo pequeño, permite iterar en local con recursos modestos antes de escalar a un modelo mayor.
- Generación de payloads para APIs: uso como generador de argumentos JSON en llamadas a herramientas, con validación estricta posterior mediante un parser y un JSON Schema.
- Experimentación académica con PEFT: el adaptador sirve como ejemplo reproducible de SFT sobre un modelo Aya pequeño para estudiar el efecto del fine-tuning en tareas de formato.
- Evaluación de robustez de salidas estructuradas: útil como caso de prueba para medir la tasa de JSON válido generado por modelos pequeños tras SFT, comparándolo con el modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB, por lo que su carga requiere muy poca memoria adicional sobre el modelo base.
- El requisito real de VRAM viene determinado por `CohereLabs/tiny-aya-global`, cuyas especificaciones no se detallan en la información proporcionada.
- Al tratarse de un modelo de la familia "tiny", es probable que quepa en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090), pero no hay confirmación documentada.
- Opciones de despliegue: carga mediante `peft` + `transformers`; para servir en producción sería necesario fusionar el adaptador con el base o usar un servidor compatible con adaptadores (por ejemplo, vLLM con soporte LoRA), si bien no se ha validado ninguna de estas rutas.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sujalgawas/aya-json-sftV2` | No disponible (adaptador LoRA) | No disponible | No disponible | Hugging Face (0 descargas) | Fine-tuning SFT sobre `tiny-aya-global` |
| `CohereLabs/tiny-aya-global` | No disponible en esta ficha | No disponible | No disponible | Hugging Face (modelo base) | Modelo base sin adaptador |
| Otros adaptadores JSON sobre modelos pequeños | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación, por lo que no es posible estimar el riesgo de sesgo de forma fundamentada.
- Riesgo de alucinación inherente a los modelos generativos pequeños, agravado por la ausencia de evaluación publicada.
- La generación de JSON no está garantizada: no se documenta el uso de gramáticas restringidas ni decodificación guiada, por lo que la salida puede no ser parseable.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución del adaptador.
- Idiomas soportados no confirmados, aunque el modelo base pertenece a una familia multilingue.
- Longitud de contexto no documentada; conviene verificar el límite del modelo base antes de usarlo con documentos largos.
- Repositorio sin descargas ni validación de la comunidad en el momento de la consulta; tratar como artefacto experimental.
- El adaptador depende del checkpoint base `CohereLabs/tiny-aya-global`; cualquier cambio o retirada de este afecta a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/sujalgawas/aya-json-sftV2
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Referencia citada en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
