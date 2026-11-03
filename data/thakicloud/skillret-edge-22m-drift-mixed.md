# ThakiCloud/SKILLRET-Edge-22M-drift-mixed

## Resumen

SKILLRET-Edge-22M-drift-mixed es un modelo de embeddings bi-encoder de 22,7 millones de parámetros desarrollado por ThakiCloud, especializado en la recuperación de habilidades (*skill retrieval*) para agentes. Se trata de una variante cuantizada del modelo base `ThakiCloud/SKILLRET-Edge-22M`, en la que la asignación de bits por unidad no es uniforme, sino que se decide mediante una señal de *drift* sin etiquetas: se mide cuánto se desvían los embeddings de salida al cuantizar cada bloque por separado y se resuelve un programa entero que minimiza ese drift bajo un presupuesto de bytes fijo.

El modelo comparte arquitectura, tokenizador y contrato de consulta con las variantes int4 e int3 de la misma familia, y su propósito es demostrar una técnica de asignación de precisión mixta, no sustituir a esas variantes. Empaquetado ocupa 14,1 MB, el mismo tamaño que la variante int3 uniforme, pero alcanza un NDCG@10 de 74,57 frente a 73,82 de esta última, sobre el *test split* público de `ThakiCloud/SKILLRET` (4.392 consultas y 6.006 habilidades).

Su relevancia actual reside en que permite ejecutar recuperación semántica de habilidades en CPU y en dispositivos de borde con un coste de almacenamiento mínimo y una pérdida de calidad acotada (menos de un punto porcentual respecto a fp16). Está pensado para pipelines de agentes que necesitan seleccionar herramientas o *skills* en tiempo real sin depender de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT bi-encoder (sentence-transformers), 6 capas |
| Parámetros totales | 22.713.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta por unidad: 2, 3 y 4 bits, con grupo de 16 (fp16 scale + zero por grupo) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16 de-cuantizado para carga directa) y `.bin` empaquetado propietario (14,140 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer BERT de 6 capas con cabezal bi-encoder para similitud semántica, derivado por cuantización del checkpoint `ThakiCloud/SKILLRET-Edge-22M`. La innovación principal no está en la arquitectura, sino en el procedimiento de cuantización: se definen 12 unidades de asignación (cuatro porciones de la tabla de embeddings, cuatro bloques de atención y cuatro bloques de FFN) y cada una se cuantiza de forma aislada a 2, 3 y 4 bits mientras el resto permanece en fp32. Para cada configuración se registra el *drift* de los embeddings de salida, definido como la media de (1 − coseno) entre los embeddings de precisión completa y los cuantizados, promediada sobre 1.500 habilidades y 150 consultas de calibración.

Con esas sensibilidades, un programa entero exhaustivo selecciona la anchura de bits por unidad que minimiza el drift predicho bajo un presupuesto estricto de bytes, contabilizando escala y cero en fp16 por cada grupo de 16 pesos. El orden de drift se reprodujo en mitades disjuntas de calibración con Spearman 1.000 para 75, 150, 300 y 600 consultas, mientras que el orden basado en etiquetas de relevancia no fue estable (entre −0,29 y +0,34), motivo por el que la asignación supervisada por etiquetas se reporta pero no se recomienda. La tabla de embeddings concentra el 51,6% de los parámetros y sus filas de menor frecuencia toleran 2 bits sin apenas afectar a la salida, mientras que los bloques intermedios de atención y FFN reciben 4 bits por ser donde se concentra el daño de la cuantización agresiva.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de embeddings de frase para recuperación semántica (*feature-extraction*), con normalización opcional.
- Recuperación de habilidades y herramientas para agentes: empareja consultas en lenguaje natural con descripciones de *skills*.
- Búsqueda densa de similitud coseno sobre índices de hasta miles de documentos (6.006 habilidades en el conjunto de evaluación).
- Ejecución en CPU y dispositivos de borde gracias a su tamaño reducido y a los 14,1 MB empaquetados.
- Contrato de consulta sin prefijo de instrucción: las consultas se codifican en crudo (`query_prefix.json` con `resolved: ""`).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con *endpoints* compatibles.
- Soporte exclusivamente en inglés.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento: es un modelo de embeddings, no generativo.

## Casos de uso

- Selección de herramientas en agentes LLM: dado un turno de usuario, el modelo codifica la consulta y recupera las *skills* más relevantes de un catálogo mediante similitud coseno, con latencia adecuada para ejecutarse en el mismo bucle del agente sin GPU.
- Enrutamiento de intenciones en asistentes conversacionales: se indexan las intenciones soportadas y se recupera la más cercana a cada mensaje, usando el modelo como clasificador de vecino más próximo con umbral de confianza.
- Despliegue en dispositivos de borde y navegador: los 14,1 MB empaquetados permiten incluir el índice y el modelo en aplicaciones móviles o extensiones, con recuperación local y sin llamadas de red.
- Búsqueda semántica en documentación técnica interna: indexar descripciones de funciones, APIs o procedimientos y recuperar el fragmento relevante para una consulta en lenguaje natural.
- Filtrado previo en pipelines RAG: usar el modelo como primera etapa de recuperación barata sobre un catálogo grande antes de un re-ranking con un modelo mayor, reduciendo el coste computacional total.
- Deduplicación y agrupación de habilidades: calcular embeddings de un catálogo de *skills* para detectar entradas redundantes o mal descritas mediante similitud entre pares.
- Servicio de embeddings en CPU con Text Embeddings Inference: desplegar el modelo en contenedores sin GPU para entornos con restricciones de hardware.

## Benchmarks y rendimiento

Evaluación sobre el *test split* público de `ThakiCloud/SKILLRET` (4.392 consultas, 6.006 habilidades), métrica NDCG@10:

| Variante | Tamaño empaquetado | NDCG@10 |
|---|---|---|
| fp16 (referencia) | 45,4 MB | 75,25 |
| int4 / g16 (uniforme) | 17,0 MB | 75,14 |
| drift-mixed / g16 (este modelo) | 14,1 MB | 74,57 |
| int3 / g16 (uniforme) | 14,2 MB | 73,82 |
| int2 / g16 (uniforme) | 11,9 MB | 59,73 |

Contrastes con *bootstrap* pareado a nivel de consulta (5.000 remuestreos, mismas 4.392 consultas):

| Contraste | Δ NDCG@10 [IC 95%] |
|---|---|
| drift-mixed (14,1 MB) − int3 g16 uniforme (14,65 MB, mismo protocolo) | +0,65 pp [+0,35, +0,96] |
| drift-mixed con el mismo presupuesto de 5,2 bits reales − int3 uniforme | +0,98 pp [+0,64, +1,33] |
| drift-mixed − int2 g16 uniforme | +14,83 pp [+14,08, +15,59] |
| drift-mixed − asignación supervisada por etiquetas (mismo presupuesto) | +0,71 pp [+0,43, +0,99] |
| drift-mixed − 5 asignaciones aleatorias con los mismos bytes | +7,7 a +9,6 pp (todos los IC excluyen 0) |

A 4,5 bits reales (~12,7 MB) la asignación por drift mantiene 70,42, frente a 59,73 de int2 uniforme; int3 uniforme no cabe en ese presupuesto. El error estándar del *split* es de aproximadamente ±0,45, por lo que la comparación solo es válida entre tarjetas evaluadas en la misma ejecución pareada.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU. En fp16 ocupa 45,4 MB de pesos y el empaquetado son 14,1 MB.
- GPU recomendadas: no aplica; cualquier GPU con al menos 1 GB de memoria puede cargarlo, pero no aporta ventaja frente a CPU para este tamaño.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, móviles, funciones *serverless* de bajo coste).
- Opciones de despliegue: `sentence-transformers` (carga el safetensors de-cuantizado), Text Embeddings Inference, *endpoints* compatibles con TEI. El archivo `.bin` empaquetado requiere escribir un *kernel* propio usando `quantization.json`; no se carga directamente con sentence-transformers.
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica que la ruta safetensors ejecuta aritmética fp32 y que la latencia es idéntica a las tarjetas int4/int3 (misma arquitectura y formato de-cuantizado), sin ser una velocidad de *kernel* entero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NDCG@10 (SKILLRET) | Tamaño | Licencia |
|---|---|---|---|---|---|
| SKILLRET-Edge-22M-drift-mixed | 22,7 M | no disponible | 74,57 | 14,1 MB | apache-2.0 |
| SKILLRET-Edge-22M-int4 | 22,7 M | no disponible | 75,14 | 17,0 MB | apache-2.0 |
| SKILLRET-Edge-22M-int3 | 22,7 M | no disponible | 73,82 | 14,2 MB | apache-2.0 |
| SKILLRET-Edge-22M (fp16) | 22,7 M | no disponible | 75,25 | 45,4 MB | apache-2.0 |

Las tres alternativas pertenecen a la misma familia y comparten arquitectura y tokenizador, por lo que la comparación aísla el efecto de la estrategia de cuantización. No se dispone de datos sobre modelos comparables de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés; su rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- La ganancia frente a int3 uniforme es real pero inferior a un punto porcentual (+0,65 pp); no debe interpretarse como una mejora sustancial de calidad.
- El error estándar del *split* es de ±0,45; las comparaciones entre tarjetas evaluadas en ejecuciones distintas no son fiables.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperación errónea: el modelo devuelve el vecino más cercano aunque no exista una habilidad relevante, por lo que conviene aplicar umbrales de similitud.
- El archivo `model.safetensors` contiene los valores de-cuantizados en fp16 y se ejecuta con aritmética fp32; no ofrece la ventaja de velocidad de un *kernel* entero. Para aprovechar el empaquetado de 14,1 MB hay que implementar el *kernel* a partir de `quantization.json`.
- La asignación de bits está optimizada para el dominio de recuperación de habilidades; su comportamiento en otros dominios de recuperación no está validado.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del dataset `ThakiCloud/SKILLRET` si se redistribuye.
- El modelo no genera texto ni ejecuta herramientas: es exclusivamente un codificador de embeddings.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M-drift-mixed
- Modelo base: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M
- Dataset de evaluación: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Blog técnico (inglés): https://thakicloud.com/tech-blog/en/llmops/skillret-small-family-cpu-skill-retrieval/
- Blog técnico (coreano): https://thakicloud.com/tech-blog/ko/llmops/skillret-small-family-cpu-skill-retrieval/
- Referencias arXiv citadas en los tags: arXiv:2605.05726, arXiv:2609.16391, arXiv:2610.09227 (no verificadas en la información disponible)
