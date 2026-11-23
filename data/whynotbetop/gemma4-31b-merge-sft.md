# whynotBeTop/gemma4-31b-merge-sft

## Resumen

`whynotBeTop/gemma4-31b-merge-sft` es un modelo de clasificación de texto derivado por fine-tuning del modelo base `MachinePulseAI/karpo-decision-31B`, que a su vez se enmarca en la familia Gemma 4. El autor del repositorio es el usuario `whynotBeTop` y el modelo se publica bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. Con 31.273.088.876 parámetros totales (unos 31,3 mil millones) y un tamaño de repositorio de 62,6 GB en formato safetensors, se trata de un modelo de gran tamaño orientado a tareas de decisión y clasificación.

El pipeline declarado es `text-classification`, y las etiquetas incluyen `decision-model`, lo que sugiere que el fine-tuning se ha orientado a tareas de toma de decisiones o clasificación estructurada más que a generación libre de texto. El nombre "merge-sft" indica una combinación de técnicas de model merging y supervised fine-tuning, una práctica habitual para consolidar capacidades de varios checkpoints o para adaptar un modelo base a un dominio concreto.

La relevancia de esta ficha es limitada por la escasez de documentación pública: no se han publicado idiomas soportados, resultados de benchmarks ni detalles del dataset de entrenamiento. Cualquier evaluación en producción debe partir de una validación empírica propia, dado que el modelo tiene cero descargas y cero likes en el momento de la consulta y no cuenta con una model card detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, presumiblemente transformer decoder-only) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Por el nombre y el modelo base (`MachinePulseAI/karpo-decision-31B`, enmarcado en la familia Gemma 4), cabe inferir una arquitectura transformer decoder-only de aproximadamente 31 mil millones de parámetros, pero no se confirma en la información proporcionada. Tampoco se especifican la longitud de contexto nativa, el vocabulario ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El sufijo "merge-sft" del nombre sugiere un proceso en dos fases: una fusión de pesos (model merging) seguida de un ajuste supervisado (supervised fine-tuning) sobre el modelo base. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se indica qué checkpoints se fusionaron ni con qué método (SLERP, TIES, DARE, etc.). Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la capacidad principal esperada es la asignación de etiquetas o categorías a entradas de texto.
- Modelo de decisión: la etiqueta `decision-model` sugiere uso en tareas de decisión estructurada, aunque no se documenta el formato exacto de entrada/salida.
- Generación de texto: no confirmada explícitamente; al derivar de un modelo base de la familia Gemma, es plausible, pero el fine-tuning podría haber degradado esta capacidad en favor de la clasificación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías y prioridades a incidencias entrantes en un helpdesk, aprovechando su naturaleza de `text-classification` para enrutar automáticamente cada caso al equipo adecuado.
- Moderación de contenido: uso como clasificador de textos potencialmente dañinos en plataformas comunitarias, con umbrales ajustados según la política interna de cada organización.
- Enrutamiento de documentos en pipelines RAG: clasificar consultas o fragmentos documentales por temática antes de la recuperación, para reducir el espacio de búsqueda y mejorar la precisión del recuperador.
- Análisis de sentimiento y clasificación de opiniones: etiquetar reseñas o menciones en redes sociales en categorías de sentimiento o temáticas, siempre que se valide empíricamente el rendimiento en el dominio objetivo.
- Detección de intención en asistentes conversacionales: clasificar la intención del usuario en un chatbot para derivar a flujos específicos, como facturación, soporte técnico o información comercial.
- Clasificación de riesgo o scoring en dominios regulados: uso como componente de decisión (por ejemplo, triaje de solicitudes) con supervisión humana obligatoria y auditoría de sesgos, dado que no hay benchmarks publicados que garanticen su fiabilidad.
- Etiquetado automático de datasets: uso como anotador a gran escala para pre-etiquetar corpus y reducir el coste de anotación manual, con revisión posterior por parte de anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 18-20 GB, viable en una RTX 4090 (24 GB) o RTX A6000.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16/BF16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 o RTX A6000 para 4 bits.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 4 bits en RTX 4090 (24 GB); en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM, TGI y llama.cpp para cuantizaciones GGUF; Ollama si se generan pesos compatibles. Para clasificación, también es viable un servidor de inferencia con Transformers y `pipeline("text-classification")`.
- Latencia y throughput: no disponibles. Al ser un modelo de 31B, se espera un throughput moderado en A100 80 GB (del orden de decenas de peticiones por segundo en clasificación por lotes), pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| whynotBeTop/gemma4-31b-merge-sft | 31,3B | no disponible | Apache 2.0 | Gated en HF, 0 descargas | Fine-tuning de clasificación sobre karpo-decision-31B |
| MachinePulseAI/karpo-decision-31B (modelo base) | ~31B (por nombre) | no disponible | no disponible | HF | Base del fine-tuning; sin datos públicos de benchmarks |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma License | Público en HF | Modelo generalista de Google, no específico de clasificación |
| Qwen2.5 32B (referencia de tamaño) | 32,5B | 128K | Apache 2.0 | Público en HF | Modelo generalista con contexto largo y buen rendimiento en benchmarks |

La comparativa es orientativa: no se dispone de benchmarks del modelo evaluado ni del modelo base, por lo que no es posible establecer una comparación de rendimiento rigurosa. Las alternativas se incluyen por similitud de tamaño y licencia, no por equivalencia funcional.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia empírica del rendimiento en clasificación, lo que impide recomendarlo para producción sin una evaluación propia.
- Model card inexistente o mínima: no se documentan idiomas, contexto, dataset de entrenamiento ni método de fusión, lo que dificulta la reproducibilidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la integración automatizada en pipelines de CI/CD.
- Riesgo de alucinación y de clasificaciones erróneas: al ser un modelo derivado de un base generalista, puede producir etiquetas inconsistentes fuera de la distribución de entrenamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset de fine-tuning, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que el modelo base `karpo-decision-31B` no imponga restricciones adicionales que prevalezcan sobre la licencia del derivado.
- Idiomas no declarados: no hay garantía de soporte multilingüe; se recomienda validar en el idioma objetivo antes de desplegar.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay retroalimentación de terceros ni issues reportados que permitan anticipar problemas conocidos.
- Fecha de creación futura (2026-11-23): el repositorio podría ser reciente o estar en estado experimental; conviene verificar su estabilidad antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/whynotBeTop/gemma4-31b-merge-sft
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
