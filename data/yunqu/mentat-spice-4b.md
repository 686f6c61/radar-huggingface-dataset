# yunqu/mentat-Spice-4B

## Resumen

mentat-Spice-4B es un modelo de decisión tipada desarrollado por yunqu, construido como adaptador sobre el modelo base Qwen/Qwen3.5-4B. A diferencia de los modelos generativos convencionales, su función es recibir texto e imágenes junto con un conjunto de respuestas candidatas y devolver una decisión estructurada: una elección entre opciones, una probabilidad sí/no o una puntuación con su distribución de probabilidad. Está orientado a integrarse en software que necesita decisiones deterministas y accionables en lugar de texto libre.

El modelo se distribuye bajo licencia Apache-2.0, soporta inglés y chino, y está etiquetado como multimodal y de clasificación. Su tamaño de repositorio es de 0,5 GB, coherente con un adaptador (no con los pesos completos del modelo base de 4B parámetros). Los pesos se publican en formato safetensors.

Su relevancia actual radica en el patrón de "modelo de sistema 1": en lugar de razonar en texto largo, produce decisiones rápidas y tipadas que un pipeline puede consumir directamente para enrutar peticiones, verificar afirmaciones contra evidencia, revisar facturas o seleccionar herramientas en un agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer Qwen/Qwen3.5-4B (relación base_model_relation: adapter) |
| Parametros totales | No disponible (adaptador; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre Qwen/Qwen3.5-4B, según los metadatos de la model card (base_model_relation: adapter). No se especifica en la información disponible el tipo exacto de adaptador (LoRA, QLoRA u otro), ni el número de parámetros entrenables, ni la composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla el número de tokens de entrenamiento.

La innovación principal descrita por el autor es la interfaz de salida: el modelo transforma entradas multimodales (texto e imágenes) más un conjunto de candidatos en tres tipos de salida tipada (elección, probabilidad sí/no, puntuación con distribución). No se dispone de información sobre mecanismos internos como decodificación especulativa o atención lineal.

## Capacidades

- Decisión tipada: devuelve una elección entre opciones candidatas, una probabilidad sí/no o una puntuación con distribución de probabilidad.
- Procesamiento multimodal: acepta texto e imágenes como entrada.
- Clasificación y enrutamiento: etiquetado como decision-model y classification.
- Verificación de respuestas contra evidencia (grounding).
- Selección de la siguiente herramienta en un flujo de agente.
- Soporte multilingüe limitado a inglés y chino.
- Inferencia local según la model card.
- No se especifica soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el contexto del cliente y las categorías candidatas y devuelve la ruta adecuada, tal como muestra el flujo "Support ticket workflow" de la model card.
- Revisión de facturas: compara datos de factura (incluida imagen) con criterios y devuelve aprobación o retención por discrepancia, según el flujo "Invoice review workflow".
- Verificación en pipelines RAG: comprueba si una respuesta está respaldada por la evidencia recuperada antes de publicarla, como en el flujo "Grounded publishing workflow" (retrieve → verify → extract → recheck → save).
- Triaje de alertas de seguridad: clasifica cambios no programados (por ejemplo, modificaciones de logging) para decidir si requieren investigación, según el ejemplo "Security alert triage".
- Revisión de cláusulas contractuales: determina si una cláusula (por ejemplo, NDA) está respaldada, contradicha o no declarada en el documento.
- Relevancia en búsqueda: clasifica si un resultado es coincidencia exacta o accesorio (ejemplo vino + sacacorchos), útil para motores de búsqueda y recomendación.
- Triaje de trazas de agentes: evalúa un resumen de traza y decide si requiere revisión humana, según el ejemplo "Agent trace-summary triage".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al ser un adaptador sobre un modelo base de 4B, el requisito vendrá determinado por la inferencia del modelo base Qwen/Qwen3.5-4B más el adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona inferencia local y un repositorio GitHub (mentat-asi/mentat-sys1), pero no se detallan frameworks concretos (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión tipada) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- No se dispone de información sobre sesgos conocidos del adaptador ni del modelo base.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo de decisión, los errores se manifestarían como clasificaciones o probabilidades incorrectas.
- Longitud de contexto no especificada, lo que impide valorar su idoneidad para documentos largos.
- Al ser un adaptador, requiere cargar el modelo base Qwen/Qwen3.5-4B; la licencia Apache-2.0 del adaptador debe verificarse junto con la del modelo base para uso comercial.
- No se detallan requisitos de hardware ni frameworks de despliegue, lo que dificulta la planificación de producción.
- Modelo con 0 descargas y 2 likes en el momento de la consulta: madurez y validación comunitaria muy limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/yunqu/mentat-Spice-4B
- GitHub: https://github.com/mentat-asi/mentat-sys1
- Traza de ejemplo (soporte): https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/workflows/recordings/customer.json
- Traza de ejemplo (facturas): https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/workflows/recordings/invoice.json
- Traza de ejemplo (RAG): https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/workflows/recordings/rag.json
- Ejemplo de seguridad: https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/examples/security.json
- Ejemplo de contrato: https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/examples/contract.json
- Ejemplo de búsqueda: https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/examples/shopping.json
- Ejemplo de agente: https://github.com/mentat-asi/mentat-sys1/blob/main/docs/spice/examples/agent.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
