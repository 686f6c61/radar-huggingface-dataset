# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-authenticated

## Resumen

El modelo `szl-receiptagent-qwen35-0.8b-v3-authenticated` es un artefacto de investigación publicado por la organización SZLHOLDINGS en Hugging Face. Por su nombre, parece derivar de un Qwen de 0,8 mil millones de parámetros (la nomenclatura "qwen35" sugiere una base Qwen 3.5), y su propósito declarado sería el procesamiento de recibos o documentos financieros ("receipt agent"). El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con un modelo pequeño cuantizado o con pesos parciales, y se distribuye en formato safetensors.

La model card no aporta información técnica: no describe arquitectura, datos de entrenamiento, capacidades ni resultados de evaluación. Se limita a declarar que el repositorio se publicó durante una "pasada de exhibición pública" del patrimonio del autor, tras una revisión automatizada de licencias y datos sensibles (PHI). El hallazgo principal de esa revisión es que el contenido incorpora material de fuentes externas con marcadores de licencia de tipo no comercial o share-alike, por lo que la licencia se declara como "provenance mixta, no clean-room".

Por tanto, esta ficha debe leerse como una descripción de un artefacto de investigación con trazabilidad limitada, no como la de un modelo listo para producción. La información disponible es insuficiente para validar su rendimiento, sus capacidades reales o sus condiciones de uso comercial, y así se refleja explícitamente en cada sección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere base Qwen, sin confirmar) |
| Parametros totales | 0,8 mil millones (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 0,1 GB, compatible con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card declara "provenance mixta, no clean-room" con material de fuentes no comerciales o share-alike |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El nombre del repositorio sugiere una base de la familia Qwen (posiblemente Qwen 3.5) con 0,8 mil millones de parámetros, pero no hay confirmación en la model card ni detalles sobre si se trata de un transformer denso, un modelo con atención lineal u otra variante.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. La model card menciona únicamente un proceso de revisión automatizada de licencias y datos de salud protegidos (PHI), cuyo resultado es que el contenido incorpora material de procedencia externa con marcadores de licencia no comercial o share-alike, y que la atribución a nivel de fila queda pendiente en el registro del patrimonio del autor.

## Capacidades

- Procesamiento de recibos y documentos financieros: el nombre del modelo indica un agente especializado en recibos, aunque no se documentan las tareas concretas (extracción de campos, validación, conciliación).
- Generación de texto: presumible, dado el origen Qwen, pero no confirmado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Extracción estructurada de datos de recibos: un modelo de 0,8 mil millones de parámetros es adecuado para tareas de extracción de campos (fecha, importe, comercio, impuestos) en entornos con recursos limitados, siempre que se valide previamente su calidad con datos propios.
- Clasificación de documentos financieros: por su tamaño reducido, podría desplegarse en CPU o GPU de gama baja para clasificar recibos por categoría o validez, aunque no hay evidencia publicada de que lo haga bien.
- Preprocesado en pipelines de contabilidad: uso como primer filtro antes de un modelo mayor, para normalizar o descartar documentos irrelevantes.
- Prototipado de agentes de gastos: integración experimental en flujos de reembolso o control de gastos, con revisión humana obligatoria dada la falta de benchmarks.
- Investigación sobre modelos pequeños especializados: útil como artefacto de estudio para analizar el comportamiento de modelos de 0,8 B en dominios documentales concretos.
- Evaluación de procedencia y licencias: el repositorio sirve como caso de estudio de gobernanza de datos, dado que su model card documenta explícitamente un problema de procedencia mixta.

En todos los casos, la ausencia de benchmarks y de licencia clara obliga a una validación propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repositorio (0,1 GB) y los 0,8 B de parámetros, es compatible con cuantizaciones de 4 a 8 bits en GPUs de consumo, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Un modelo de 0,8 B suele ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en CPU, pero esto es una estimación general no verificada para este artefacto.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño, aunque no está confirmado.
- Opciones de despliegue: no disponible. Al estar en safetensors, requeriría conversión a GGUF para llama.cpp u Ollama, o carga directa en frameworks como Transformers o vLLM, sin garantías de compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar modelos comparables con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada y procedencia mixta: la model card indica explícitamente que el contenido incorpora material con licencias no comerciales o share-alike, por lo que el uso comercial requiere verificar los términos de cada fuente. No es un modelo clean-room.
- Ausencia total de documentación técnica: no hay arquitectura, datos de entrenamiento, contexto ni idiomas declarados, lo que impide evaluar su idoneidad.
- Sin benchmarks: no se puede afirmar nada sobre su precisión en tareas de recibos ni compararlo con alternativas.
- Riesgo de alucinación: desconocido, pero inherente a cualquier modelo generativo sin evaluación publicada.
- Sesgos: no documentados.
- Atribución pendiente: la model card reconoce que el trabajo de atribución a nivel de fila está pendiente en el registro del patrimonio del autor.
- Uso en producción desaconsejado sin auditoría previa de licencias y de calidad.
- El nombre incluye "authenticated", pero no se documenta qué significa ni qué garantías aporta.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-authenticated
- Repositorio de recibos de revisión citado en la model card: SZLHOLDINGS/khipu-scholar-runs (referencia interna, sin URL directa disponible)
