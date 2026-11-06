# xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw

## Resumen

xyntrai-Sarah-mistral-2501-36B-nsfw es un ajuste fino (finetune) del modelo xyntrai-mistral-small-2501-36B-nsfw, publicado por el usuario xyntraistudios en Hugging Face. Se trata de un modelo de generación de texto de 36.910.535.680 parámetros (aproximadamente 36,9 mil millones) derivado de la familia Mistral, orientado a conversación y etiquetado explícitamente como contenido para adultos (not-for-all-adults). El modelo se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

La model card es extremadamente escueta: no documenta la composición del dataset de ajuste fino, el número de tokens de entrenamiento, ni detalles sobre el proceso de alineación. Únicamente indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un flujo de ajuste fino supervisado (SFT) o preferencias sobre el modelo base. No se han publicado resultados de benchmarks ni información sobre la longitud de contexto efectiva.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho para generación de texto conversacional sin filtros, con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica sustancial. Para cualquier evaluación seria en producción resulta imprescindible contrastar su comportamiento empíricamente, dado que la información disponible no permite verificar calidad, seguridad ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral; detalles no disponibles) |
| Parametros totales | 36.910.535.680 (36,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizaciones estándar tipo GGUF/AWQ, no confirmado por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint xyntrai-mistral-small-2501-36B-nsfw, que a su vez parece derivar de la familia Mistral Small. La model card no especifica la arquitectura interna (número de capas, dimensión oculta, tipo de atención, uso de GQA, etc.), por lo que no es posible confirmar si incorpora innovaciones como sliding window attention o decodificación especulativa. El recuento de parámetros real (36,9 B) procede de los safetensors publicados.

En cuanto al entrenamiento, la única información disponible es que se utilizó Unsloth junto con TRL de Hugging Face, lo que apunta a un pipeline de ajuste fino eficiente en memoria. No se documentan el volumen de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o filtrado de seguridad. Tampoco se indica si el ajuste se realizó con datos sintéticos, conversacionales o de rol. Esta ausencia de trazabilidad es una limitación importante para cualquier uso en producción.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Ajuste fino aparentemente orientado a contenido para adultos (etiqueta not-for-all-adults), sin que se detallen las capacidades exactas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatibilidad declarada con transformers, text-generation-inference y endpoints_compatible, lo que facilita su despliegue en infraestructura estándar.

## Casos de uso

- Generación de narrativa y ficción para adultos: el modelo está etiquetado explícitamente como NSFW y ajustado sobre un base conversacional, por lo que su uso previsto es la escritura creativa sin filtros en inglés. Requiere revisión humana y control de acceso.
- Roleplay y personajes conversacionales: el nombre del checkpoint ("Sarah") sugiere un ajuste orientado a un personaje concreto; puede emplearse en entornos cerrados de simulación de personajes, siempre con moderación de contenido.
- Prototipado de chatbots de nicho: gracias a la compatibilidad con text-generation-inference y endpoints_compatible, puede desplegarse rápidamente en un endpoint para pruebas internas de conversación.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de modelo sin filtros para analizar comportamientos, sesgos y riesgos en comparación con modelos alineados.
- Generación de diálogos para guiones o videojuegos con clasificación por edades: útil en pipelines creativos donde se requiere contenido explícito y se dispone de revisión editorial posterior.
- Evaluación comparativa de ajustes finos: al derivar de un base Mistral de 36,9 B, puede emplearse como punto de comparación en estudios sobre el efecto del finetuning en la calidad y seguridad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 74 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 80 GB o más (A100 80GB, H100 80GB).
- Cuantización a 8 bits: en torno a 37-40 GB de VRAM, viable en una A100 40GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 20-24 GB, lo que permite ejecución en una única RTX 4090 o RTX 3090, con margen ajustado para contexto largo.
- GPU consumer: cabe en RTX 4090/3090 con cuantización de 4 bits; en GPUs de 16 GB o menos requeriría cuantizaciones más agresivas o descarga a CPU, con latencia muy elevada.
- Opciones de despliegue: transformers, text-generation-inference (declarado por el autor), y previsiblemente vLLM y llama.cpp/Ollama mediante conversión a GGUF, aunque el autor no lo confirma.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| xyntrai-Sarah-mistral-2501-36B-nsfw | 36,9 B | no disponible | Apache 2.0 | Finetune NSFW sin benchmarks ni documentación |
| Mistral Small (base de referencia) | ~22-24 B en versiones publicadas | 32k en versiones recientes | Apache 2.0 | Modelo oficial con benchmarks publicados; el recuento exacto del base de este finetune no está confirmado |
| Modelos NSFW de la comunidad (p. ej. variantes de Mistral/Llama finetuneadas) | variable | variable | variable | Habitualmente sin benchmarks ni garantías de calidad |

La comparación cuantitativa no es posible: el autor no publica métricas y el recuento de 36,9 B no coincide con los tamaños habituales de Mistral Small, lo que impide mapearlo con certeza a un checkpoint oficial.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o seguimiento de instrucciones.
- Contenido explícito: el modelo está etiquetado como not-for-all-adults; su uso requiere control de acceso y cumplimiento de la legislación aplicable sobre contenido para adultos.
- Sesgos desconocidos: al no documentarse el dataset de ajuste fino, no es posible evaluar sesgos de género, raza, ideología o toxicidad.
- Riesgo elevado de alucinación: sin información sobre alineación ni datos de entrenamiento, no puede asumirse fiabilidad factual.
- Solo inglés declarado: no hay soporte multilingüe documentado.
- Contexto desconocido: la longitud de ventana no está especificada, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido NSFW puede incumplir las políticas de aceptación de uso de plataformas de despliegue (Hugging Face Inference Endpoints, proveedores cloud, etc.).
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de validación por terceros ni de mantenimiento.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw
- Modelo base: https://huggingface.co/xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
