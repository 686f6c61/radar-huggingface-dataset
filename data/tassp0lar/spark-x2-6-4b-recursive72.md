# TassP0lar/Spark-X2.6-4B-Recursive72

## Resumen

Spark X2.6 4B Recursive72 es un modelo de generación de texto desarrollado por TassP0lar que aplica un esquema de recurrencia de profundidad de 72 visitas (Loop72) sobre el backbone congelado XHToken/Spark-X2.6-4B. El modelo base es un transformer híbrido de 36 capas físicas que combina 9 capas de atención completa con RoPE parcial (0,25) y 27 capas de atención de ventana deslizante (w=512). Sobre esa base congelada al 100% en BF16, el autor añade controladores diferenciables TwoStreamMHC y un banco de índices de atención dispersa latente paginada por visita (D-LSA), lo que da lugar a un total de 4.112.079.360 parámetros.

La propuesta técnica es poco habitual: en lugar de aumentar el número de capas entrenando nuevos pesos del backbone, el modelo reutiliza las mismas capas físicas en múltiples pasadas (prelude, dos pasadas del núcleo, una pasada interna y una coda) para incrementar la profundidad efectiva sin multiplicar el coste de memoria de los pesos. Los controladores MHC, con 10.078.176 parámetros en FP32, modulan la ganancia de atención y FFN en cada visita, y el banco D-LSA (1.769.472 parámetros de proyección más 36 escalares) gestiona la selección de claves y valores en las visitas globales.

El modelo está etiquetado como long-context, conversational y recursive-transformer, con licencia e idiomas no declarados en la información disponible. Su relevancia actual radica en explorar vías de escalado de profundidad efectiva sobre pesos congelados, un enfoque que puede interesar a investigadores en eficiencia de entrenamiento y a desarrolladores que necesiten contexto largo sin reentrenar un backbone completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con recurrencia de profundidad (Loop72) sobre backbone congelado; 36 capas físicas (9 de atención completa con RoPE parcial 0,25 y 27 de ventana deslizante w=512), GELU nativo, controladores TwoStreamMHC y atención dispersa latente D-LSA |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no es MoE); 10.078.176 parámetros FP32 en controladores MHC y 1.769.472 + 36 escalares en el banco D-LSA |
| Longitud de contexto | No disponible de forma explícita; el modelo está etiquetado como long-context y el banco D-LSA reporta recall de masa a 4096 y 2048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers, código personalizado) |

## Arquitectura y entrenamiento

El backbone físico es un transformer híbrido de 36 capas con dos tipos de atención: 9 capas de atención completa con RoPE parcial de factor 0,25 (capas 3, 7, 11, 15, 19, 23, 27, 31 y 35) y 27 capas de ventana deslizante con w=512. La activación es GELU nativa y cada capa incorpora una proyección de compuerta sigmoidea por cabeza (g_proj) junto con out_proj. Este backbone se mantiene completamente congelado en BF16, con verificación de invariancia SHA-256 del byte completo (sha256=e8a72f3eb657df114f531e218a6f4b99ef28add1eda8e9b20fb379dd2f4c2db0).

Sobre esa base, el autor define un calendario de 72 visitas recurrentes repartidas en cinco fases: prelude L0..L3 (4 visitas, con L3 como visita global 0), primera pasada del núcleo L4..L27 (24 visitas, 6 globales), segunda pasada del núcleo L4..L27 (24 visitas, 6 globales), pasada interna L12..L23 (12 visitas, 3 globales) y coda L28..L35 (8 visitas, con L31 y L35 como visitas globales 16 y 17). En total, 18 visitas globales y 54 locales. Los controladores TwoStreamMHC, seleccionados del profesor stage_d, aplican una ganancia acotada mediante esquema v2 con gain_mode='sigmoid', garantizando que (1 - g)I + gP pertenezca a la bola B2 en las 60 visitas del núcleo. Las ganancias medias de la pasada 2 son 0,00999 en atención y 0,010009 en FFN, y las de la pasada 3 son 0,004995 y 0,005 respectivamente.

El banco VisitAwareDLSAIndexBank se calibró en las 18 visitas globales sin omitir ninguna, reduciendo la KL de validación media de 0,76318 a 0,093037. El recall de masa medio es de 0,884485 a 4096 tokens y 0,756809 a 2048 tokens, con un recall de runtime por bucket de 1,0. El corpus de entrenamiento se describe como un corpus multidisciplinar real con 1.143 ejemplos de entrenamiento y 8 de desarrollo, con split disjunto. No se especifican el número total de tokens, la composición detallada del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y continuada, con pipeline text-generation declarado.
- Razonamiento multi-paso mediante recurrencia de profundidad: las mismas capas físicas se recorren hasta 72 veces, lo que permite un cómputo iterativo sobre representaciones latentes.
- Contexto largo: etiqueta long-context y atención dispersa D-LSA con recall medido a 4096 y 2048 tokens.
- Atención dispersa latente paginada por visita, que selecciona claves y valores de forma dependiente de la visita en las 18 visitas globales.
- Control de ganancia diferenciable por visita en atención y FFN, lo que permite modular la contribución de cada pasada.
- Compatibilidad con la librería transformers y carga mediante código personalizado (load_inference_v03).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en escalado de profundidad efectiva: el modelo permite estudiar cómo la recurrencia de 72 visitas sobre un backbone congelado afecta a la calidad de generación sin reentrenar los 4.100 millones de parámetros del backbone, comparando directamente contra el modelo base XHToken/Spark-X2.6-4B.
- Procesamiento de documentos largos: la atención D-LSA con recall de masa de 0,884485 a 4096 tokens lo hace adecuado para tareas de resumen o extracción sobre textos que superan la ventana deslizante de 512 tokens de las capas locales.
- Experimentos de atención dispersa: el banco VisitAwareDLSAIndexBank permite evaluar estrategias de selección de claves y valores por visita, con métricas de KL y recall publicadas para reproducir la calibración.
- Generación conversacional de dominio acotado: el corpus de entrenamiento multidisciplinar de 1.143 ejemplos sugiere un ajuste orientado a diálogo y tareas concretas, útil para prototipos de asistentes especializados.
- Estudio de controladores de ganancia: los 10.078.176 parámetros FP32 de TwoStreamMHC permiten analizar cómo la modulación de atención y FFN por visita afecta a la estabilidad del entrenamiento y a la perplejidad.
- Reproducibilidad de artefactos: los SHA-256 publicados del backbone, del selector y del controlador permiten verificar la integridad de los pesos en pipelines de investigación y auditoría.
- Evaluación comparativa de arquitecturas recurrentes: sirve como referencia para comparar transformers estándar frente a esquemas de profundidad recurrente en tareas de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de calibración y entrenamiento:

| Métrica | Valor |
|---|---|
| KL de validación inicial (media) | 0,76318 |
| KL de validación final (media) | 0,093037 |
| Recall de masa @ 4096 | 0,884485 |
| Recall de masa @ 2048 | 0,756809 |
| Recall de runtime por bucket (media) | 1,0 |
| Visitas globales calibradas | 18/18 |
| Ganancia media pasada 2 (atención / FFN) | 0,00999 / 0,010009 |
| Ganancia media pasada 3 (atención / FFN) | 0,004995 / 0,005 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,2 GB solo para pesos (4.112.079.360 parámetros × 2 bytes), más overhead de activaciones y del banco D-LSA; el repositorio ocupa 16,8 GB, probablemente por incluir pesos duplicados o en múltiples formatos.
- En FP16/BF16 cabe en GPUs consumer de 16 GB o más, como RTX 4090 (24 GB), RTX 4080 (16 GB) o A100 de 40 GB con margen amplio.
- En cuantización de 8 bits el peso se reduciría a unos 4,1 GB, y en 4 bits a unos 2,1 GB, aunque no se documentan tipos de cuantización soportados.
- GPUs recomendadas para producción: A100 40/80 GB, H100 80 GB o L40S para mayor throughput; RTX 4090 para experimentación.
- Opciones de despliegue: transformers con el script load_inference_v03 y código personalizado; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La recurrencia de 72 visitas implica un coste computacional notablemente superior al de un transformer de 36 capas, aunque el backbone congelado reduce el coste de memoria de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark X2.6 4B Recursive72 | 4.112.079.360 | No disponible (long-context, recall a 4096) | Transformer híbrido con recurrencia Loop72 y D-LSA | No disponible | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | ~4 B (no confirmado) | No disponible | Transformer híbrido de 36 capas | No disponible | Hugging Face |
| Otros modelos de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Idiomas soportados no declarados: no hay garantía de calidad multilingüe ni de cobertura fuera del corpus de entrenamiento.
- Corpus de entrenamiento pequeño: 1.143 ejemplos de entrenamiento y 8 de desarrollo, lo que limita la generalización y aumenta el riesgo de sobreajuste a dominios concretos.
- Riesgo de alucinación no evaluado: no se publican benchmarks de veracidad ni de robustez.
- Sesgos desconocidos: al no documentarse la composición del corpus, no es posible evaluar sesgos de género, etnia o idioma.
- Dependencia de código personalizado: la carga requiere load_inference_v03 y parámetros específicos (recurrence_mode, attach_sparse_attention, strict_selector_provenance), lo que complica la integración con stacks estándar.
- Coste computacional elevado: 72 visitas recurrentes implican más cómputo por token que un transformer convencional de tamaño similar.
- Contexto máximo no especificado: aunque se etiqueta como long-context, no se declara la longitud máxima soportada, solo métricas de recall a 2048 y 4096 tokens.
- Verificación de integridad: los SHA-256 publicados deben comprobarse en producción para garantizar que los pesos no han sido alterados.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K), lo que impide comparar su rendimiento real con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TassP0lar/Spark-X2.6-4B-Recursive72
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Revisión del modelo base: 64ca8f2a295b8ceb2757b9d4749a6558c4759e5b
- Repositorio del autor: https://huggingface.co/TassP0lar
- Script de carga: load_inference_v03 (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
