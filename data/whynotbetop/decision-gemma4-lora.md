# whynotBeTop/decision-gemma4-lora

## Resumen

El modelo `whynotBeTop/decision-gemma4-lora` es un adaptador LoRA publicado en Hugging Face y orientado a clasificación de texto, construido sobre el modelo base `MachinePulseAI/karpo-decision-31B`, que a su vez se presenta como un derivado de la familia Gemma. El autor identificado es `whynotBeTop` y el repositorio está sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. La etiqueta de pipeline es `text-classification`, lo que sitúa al modelo en el ámbito de la toma de decisiones o clasificación supervisada más que en el de generación abierta.

El dato objetivo más relevante es el tamaño declarado en el fichero de safetensors: 31.273.088.876 parámetros, es decir, aproximadamente 31,3 mil millones, coherente con el nombre del modelo base (`karpo-decision-31B`). El repositorio ocupa 62,6 GB, un tamaño consistente con pesos en precisión de 16 bits para esa cantidad de parámetros. La licencia declarada es Apache 2.0, aunque la naturaleza gated del repositorio implica condiciones adicionales de acceso.

La información pública disponible es muy limitada: no se documentan idiomas soportados, longitudes de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los metadatos verificables del repositorio y del modelo base, y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, segun el nombre del modelo base); detalles exactos no disponibles |
| Parametros totales | 31.273.088.876 (aprox. 31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (acceso gated con condiciones adicionales) |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tipo de ajuste | LoRA (adaptador de bajo rango) |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

El modelo se distribuye como un adaptador LoRA sobre `MachinePulseAI/karpo-decision-31B`. La etiqueta `gemma4` en el nombre y en los tags sugiere una base de la familia Gemma, que emplea arquitecturas transformer decoder-only con atención multi-cabeza y normalización RMSNorm, aunque no se dispone de confirmación documental de la variante exacta ni del número de capas, dimensiones ocultas o cabezas de atención. El recuento de 31,3 mil millones de parámetros coincide con el sufijo "31B" del modelo base.

No se publica información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la estrategia de ajuste (rangos LoRA, módulos objetivo, hiperparámetros). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La finalidad declarada mediante la etiqueta `decision-model` apunta a un ajuste supervisado para clasificación o selección de decisiones, pero se desconoce el esquema de etiquetas y el corpus utilizado.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el uso previsto es asignar categorías o etiquetas a entradas textuales.
- Toma de decisiones: la etiqueta `decision-model` sugiere un ajuste orientado a seleccionar entre opciones o emitir una decisión estructurada, aunque no se detalla el formato de salida.
- Herencia del modelo base: al ser un adaptador LoRA sobre un modelo de 31 B, conserva la arquitectura y los pesos del base, pero no se documenta si mantiene capacidades generativas, de razonamiento o de código tras el ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: usar el modelo para etiquetar incidencias por categoría o urgencia en un pipeline de atención al cliente, aprovechando el ajuste específico de clasificación sobre una base de 31 B.
- Enrutado de decisiones en back-office: aplicar el modelo para decidir la ruta de un expediente (aprobación, revisión manual, rechazo) en flujos administrativos, siempre que se valide el esquema de etiquetas del ajuste.
- Moderación de contenido: clasificar textos entrantes en categorías de riesgo o cumplimiento, integrándolo como servicio de inferencia detrás de una API.
- Triage de documentos legales o financieros: asignar tipos documentales o niveles de prioridad a textos extensos, condicionado a la ventana de contexto real del modelo base (no documentada).
- Investigación sobre ajuste LoRA: servir como referencia para estudiar adaptadores de bajo rango sobre modelos de 31 B en tareas de clasificación, comparando con el modelo base sin ajustar.
- Evaluación interna de modelos "decision": emplearlo como candidato en pruebas A/B frente a clasificadores más pequeños, midiendo si el coste de un modelo de 31 B se justifica en precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 62 GB solo para pesos, más memoria para activaciones y KV cache; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- Cuantización a 8 bits: en torno a 31-35 GB, viable en una A100 40 GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantización a 4 bits: en torno a 16-18 GB, podría caber en una RTX 4090 de 24 GB, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa; RTX 4090 solo con cuantización agresiva.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador LoRA; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; al ser un modelo de 31 B, la latencia por petición será sustancialmente mayor que la de clasificadores pequeños tipo BERT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whynotBeTop/decision-gemma4-lora | 31,3 B (LoRA) | no disponible | text-classification | Apache 2.0 (gated) | Hugging Face, acceso restringido |
| MachinePulseAI/karpo-decision-31B | 31 B (base) | no disponible | decision-model | no disponible | Hugging Face |
| Modelos de clasificación tipo BERT/RoBERTa | 0,1-0,4 B | 512 tokens tipico | text-classification | variable (MIT, Apache) | Amplia, sin gating |
| LLMs generativos de ~30 B (p. ej. Gemma 2 27B) | 27 B | 8K-128K segun variante | generacion | Gemma license | Hugging Face, descarga abierta |

La comparativa con clasificadores pequeños es la más relevante en coste: un modelo de 31 B ofrece presumiblemente mayor capacidad semántica, pero multiplica por dos órdenes de magnitud los requisitos de hardware frente a un encoder de 0,3 B. No se dispone de datos de rendimiento para cuantificar esa diferencia.

## Limitaciones y advertencias

- Documentación mínima: no se publican idiomas, contexto, dataset ni hiperparámetros de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones; la licencia Apache 2.0 no exime de cumplir esos términos adicionales.
- Riesgo de alucinación: aunque la tarea sea de clasificación, un modelo de 31 B puede generar salidas no conformes al esquema si no se restringe la decodificación.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no puede evaluarse el sesgo demográfico, lingüístico o de dominio.
- Coste de despliegue elevado: 62,6 GB de pesos en safetensors implican infraestructura de GPU de gama alta para inferencia en precisión completa.
- Sin benchmarks: no hay evidencia publicada de precisión frente al modelo base ni frente a alternativas.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Cero descargas y cero likes: no existe validación comunitaria que respalde la calidad del ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whynotBeTop/decision-gemma4-lora
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
