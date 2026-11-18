# vikhanglam625/vn-land-counsel-adapters

## Resumen

VN Land Counsel adapters es una colección de adaptadores LoRA desarrollada por Duong Gia Huy y Lam Vi Khang (Universidad Ton Duc Thang, con la tutoría de PGS.TS Le Anh Cuong) para construir un asistente de consulta y análisis preliminar de legislación sobre suelo en Vietnam. No se trata de un modelo único, sino de un conjunto de siete adaptadores especializados que cubren tareas concretas de un pipeline RAG legal: extracción de hechos, planificación de comparaciones, revisión de planes, verificación de afirmaciones y planificación por defecto.

Los adaptadores se montan sobre dos modelos base de la familia Qwen3: Qwen3-8B (seis de los siete adaptadores) y Qwen3-4B (un adaptador de planificación). El repositorio contiene pesos en formato PEFT (safetensors) y adaptadores GGUF para su uso con llama.cpp, con un total de 43.646.976 parámetros en safetensors y un tamaño de repo de 1,8 GB. La carpeta raíz no es un modelo PEFT cargable de forma directa: hay que seleccionar el subdirectorio `hf_adapter` correspondiente.

El proyecto es relevante por su enfoque modular y su integración con un almacén de recuperación específico (`vn-land-counsel-retrieval-store`), pero su alcance es limitado: está orientado a investigación y recuperación preliminar de información, en vietnamita, y el propio autor advierte que las salidas deben contrastarse con los textos legales aplicables. No hay datos publicados de benchmarks ni licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos base Qwen3-8B y Qwen3-4B; adaptadores GGUF para llama.cpp |
| Parametros totales | 43.646.976 (pesos safetensors del conjunto de adaptadores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3; no especificada en la model card) |
| Tipos de cuantizacion | adaptadores GGUF (cuantización concreta no especificada); pesos PEFT en safetensors |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptadores LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos Qwen3 (transformer decoder-only) de 4B y 8B parámetros, sobre los que se aplican adaptadores LoRA de bajo rango mediante PEFT. El repositorio no documenta hiperparámetros de entrenamiento (rango, alpha, dropout), número de tokens de entrenamiento, composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La model card indica únicamente que la información específica de entrenamiento está disponible en cada carpeta de adaptador.

La innovación principal no está en la arquitectura del modelo, sino en la descomposición del flujo de trabajo legal en roles especializados: un adaptador de extracción de hechos (`fact_qwen3_8b_lora`), varios de planificación (`planner_qwen3_4b_lora`, `planner_qwen3_8b_lora`, `planner_qwen3_8b_sft_3000_candidate` como planificador por defecto), dos de revisión de planes (`planner_revise_qwen3_8b_lora` y `planner_full_revise_qwen3_8b_lora` como revisión por defecto) y uno de verificación de afirmaciones (`claim_verifier_qwen3_8b_lora`). El sistema se apoya en un almacén de recuperación externo y en modelos BGE de embeddings y reranking, junto con una build compatible de llama.cpp.

## Capacidades

- Extracción de hechos a partir de consultas o documentos legales en vietnamita (adaptador `fact_qwen3_8b_lora`).
- Planificación de comparaciones entre normativas o casos (adaptadores `planner_*`).
- Revisión y refinamiento de planes generados (adaptadores `planner_revise_*` y `planner_full_revise_*`).
- Verificación de afirmaciones contra fuentes recuperadas (adaptador `claim_verifier_qwen3_8b_lora`).
- Integración en pipelines RAG con recuperación previa mediante un almacén vectorial específico del proyecto.
- Despliegue local mediante llama.cpp con adaptadores GGUF.
- Uso con PEFT/Hugging Face para investigación y evaluación.
- Capacidades generales de generación de texto, razonamiento y multilingüismo heredadas de Qwen3, aunque el ajuste está orientado al vietnamita.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso más allá de la orquestación propia del pipeline.

## Casos de uso

- Consulta preliminar de normativa sobre suelo en Vietnam: el adaptador de extracción de hechos identifica los elementos relevantes de una consulta (tipo de suelo, ubicación, uso previsto) antes de recuperar textos legales del almacén, lo que reduce el ruido en la fase de recuperación.
- Comparación de marcos normativos: los adaptadores de planificación estructuran una comparación entre dos o más normas o casos, descomponiendo la tarea en pasos verificables que luego se ejecutan sobre el corpus recuperado.
- Verificación de afirmaciones en borradores legales: el adaptador `claim_verifier_qwen3_8b_lora` contrasta afirmaciones concretas con las fuentes recuperadas, útil para revisar borradores antes de su uso profesional.
- Asistencia a estudiantes de Derecho: el sistema permite practicar el análisis de casos reales con un flujo guiado de extracción, planificación y verificación, siempre con revisión humana posterior.
- Revisión de planes generados por otros módulos: los adaptadores de revisión (`planner_revise_*`) detectan inconsistencias o pasos faltantes en planes producidos por el planificador por defecto.
- Despliegue local en entornos con requisitos de privacidad: al usar llama.cpp con adaptadores GGUF y modelos base de 4B/8B, el sistema puede ejecutarse en hardware de consumo sin enviar consultas legales a servicios externos.
- Investigación en NLP legal vietnamita: la separación en roles permite evaluar por separado cada etapa del pipeline y comparar variantes de 4B frente a 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base. Qwen3-4B en FP16 requiere aproximadamente 8 GB; Qwen3-8B en FP16, unos 16 GB. Con cuantización GGUF de 4 bits, las estimaciones bajan a unos 3-4 GB (4B) y 5-6 GB (8B), a lo que hay que sumar el adaptador LoRA y el contexto.
- GPU recomendadas: A100 o H100 para servir el modelo base de 8B en FP16 con contexto largo; RTX 4090 (24 GB) para 8B en FP16 o 4B con margen amplio; RTX 3090/4080 para 8B cuantizado.
- Cabe en GPU de consumo: sí, con cuantización GGUF. Qwen3-4B en 4 bits cabe en GPUs de 8 GB; Qwen3-8B en 4 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (soporte nativo de los adaptadores GGUF incluidos), PEFT con Transformers para los adaptadores safetensors, y potencialmente vLLM o TGI con los adaptadores PEFT (no documentado por el autor).
- Latencia y throughput: no disponibles. El pipeline requiere además modelos BGE de embeddings y reranking, lo que incrementa los requisitos de memoria y cómputo respecto a la inferencia de un único modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VN Land Counsel adapters | 43,6 M (adaptadores) sobre Qwen3-4B/8B | no disponible | RAG legal vietnamita modular | no disponible | Hugging Face (repo privado) |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | Modelo generalista multilingüe | no disponible en esta ficha | Hugging Face |
| Qwen3-4B (base) | 4B | no disponible en esta ficha | Modelo generalista multilingüe | no disponible en esta ficha | Hugging Face |
| Alternativas de NLP legal en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos directamente comparables en el nicho de asistentes legales vietnamitas con arquitectura modular LoRA.

## Limitaciones y advertencias

- El repositorio es privado y requiere una cuenta autorizada para descargarlo; no es de acceso abierto.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explícito y debe consultarse con los autores.
- El modelo está entrenado y orientado exclusivamente al vietnamita; su rendimiento en castellano u otros idiomas no está garantizado.
- El propio autor advierte que las salidas son para investigación y recuperación preliminar, y deben contrastarse con los textos legales y expedientes aplicables; no se establece exactitud para casos reales.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominio legal; la verificación de afirmaciones mitiga pero no elimina este riesgo.
- No hay benchmarks publicados, por lo que no es posible evaluar su calidad frente a alternativas.
- La carpeta raíz no es un modelo PEFT cargable: es necesario seleccionar el subdirectorio `hf_adapter` correcto, lo que añade complejidad operativa.
- El pipeline completo requiere modelos base GGUF, modelos BGE de embeddings y reranking, una build compatible de llama.cpp y el almacén de recuperación, lo que multiplica las dependencias.
- No se documentan sesgos conocidos, longitud de contexto efectiva ni hiperparámetros de entrenamiento.

## Enlaces

- Repositorio de adaptadores: https://huggingface.co/vikhanglam625/vn-land-counsel-adapters
- Almacén de recuperación (dataset): https://huggingface.co/datasets/vikhanglam625/vn-land-counsel-retrieval-store
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
