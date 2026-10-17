# ssyhw7/qwen36-35b-merged-ties_d0.2

## Resumen

ssyhw7/qwen36-35b-merged-ties_d0.2 es un artefacto de fusión de modelos publicado en Hugging Face por el usuario ssyhw7. Se trata de la combinación de tres adaptadores LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B, aplicando la técnica TIES (Trim, Elect Sign and Merge) con un rango de salida (out_rank) de 96. No es un entrenamiento desde cero ni un fine-tuning completo, sino una fusión de expertos: el objetivo es agregar en un único conjunto de pesos las capacidades especializadas de tres adaptadores, sin coste adicional de inferencia ni necesidad de enrutar peticiones entre varios adaptadores.

El interés del artefacto es fundamentalmente metodológico. La receta completa se publica en merge_recipe.json y el autor remite a un repositorio de GitHub que contendría código, datos y evaluación. Esto lo convierte en material útil para investigación sobre técnicas de model merging (TIES, DARE, fusión lineal) aplicadas a arquitecturas MoE de gran tamaño, más que en un modelo listo para producción.

La información pública es muy limitada: no hay pipeline declarado, no se especifican idiomas ni longitud de contexto, no hay resultados de benchmarks y la propia model card indica que está pendiente de completarse con resultados. El repositorio ocupa 6,7 GB, un tamaño coherente con pesos de adaptador PEFT y no con un modelo completo de 35 000 millones de parámetros en bf16 (que rondaría los 70 GB), por lo que conviene verificar el contenido real antes de cualquier uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el artefacto fusionado; el modelo base Qwen/Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) según la nomenclatura del nombre |
| Parámetros totales | No confirmado. El nombre del base indica 35B (35 000 millones), dato no verificado en la información disponible |
| Parámetros activos | No confirmado. La nomenclatura A3B del base sugiere del orden de 3 000 millones activos por token, dato no verificado |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo declara safetensors y PEFT) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con librería PEFT (adaptadores LoRA fusionados) |

## Arquitectura y entrenamiento

El artefacto no introduce una arquitectura nueva: hereda la del modelo base Qwen/Qwen3.6-35B-A3B. Lo que define a este repositorio es el procedimiento de fusión. TIES consta de tres fases: recorte (trim) de los parámetros menos relevantes de cada adaptador mediante umbrales de magnitud, elección de signo (elect sign) por voto mayoritario para resolver conflictos de signo entre adaptadores, y fusión disjunta (disjoint merge) de los parámetros que sobreviven, promediando únicamente aquellos con el signo elegido. El resultado es un único conjunto de pesos que preserva mejor el rendimiento que un promedio simple cuando los adaptadores han divergido.

En este caso se fusionan tres expertos (adaptadores LoRA) con un rango de salida de 96 sobre el mismo modelo base. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO en los adaptadores de origen. Tampoco se documenta qué domini o especializa cada uno de los tres adaptadores, ni qué variante exacta de TIES (densidad de recorte, escalado de pesos) se aplicó más allá de lo que pueda contener merge_recipe.json.

## Capacidades

- Capacidades generales de generación de texto, razonamiento, código y matemáticas: previsiblemente heredadas del modelo base Qwen3.6-35B-A3B y de los tres adaptadores fusionados, pero no verificadas ni documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Especialización por dominio: el modelo se presenta como fusión de tres expertos, pero no se especifica cuáles son esos dominios.

## Casos de uso

- Investigación sobre técnicas de model merging: reproducir la receta TIES con out_rank 96 sobre Qwen3.6-35B-A3B a partir de merge_recipe.json, comparando el resultado con DARE, TIES con otros hiperparámetros o fusión lineal. Es el uso más directo y mejor soportado por la documentación publicada.
- Punto de partida para un fine-tuning posterior: al ser un artefacto PEFT, puede servir como inicialización para un ajuste adicional sobre dominio específico, evitando repetir la fusión de los tres adaptadores originales.
- Servicio multi-dominio con un solo modelo: si la fusión preserva las capacidades de los tres expertos, permitiría atender tres dominios especializados con un único despliegue en lugar de mantener tres adaptadores y un enrutador, reduciendo la complejidad operativa.
- Evaluación comparativa de métodos de fusión: usar el mismo conjunto de tres adaptadores y comparar TIES frente a otras estrategias con métricas homogéneas, aprovechando que la receta está versionada en el repositorio.
- Reducción de almacenamiento y de artefactos en el registro de modelos: consolidar tres adaptadores en un solo artefacto simplifica el control de versiones y la trazabilidad en pipelines de MLOps.
- Estudio de degradación por fusión en arquitecturas MoE: analizar si la fusión de adaptadores afecta de forma distinta a las capas de enrutamiento y a los expertos del modelo base, un aspecto poco documentado en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que está pendiente de completarse con resultados, y el autor remite al repositorio de GitHub para la evaluación.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del tamaño declarado en el nombre del modelo base y no han sido verificadas en la información disponible. El artefacto publicado ocupa 6,7 GB, lo que no corresponde a un modelo completo de 35B en bf16.

- VRAM en bf16: del orden de 70 GB solo para pesos, más espacio para caché KV y activaciones. Requiere dos A100 40 GB, una H100 80 GB o varias GPU consumer con agregación de memoria.
- VRAM en FP8: aproximadamente 35 GB de pesos; viable en una H100 80 GB o en dos RTX 4090.
- VRAM en 4 bits (GGUF Q4_K_M): del orden de 18-22 GB de pesos, lo que permitiría ejecución en una única RTX 4090 (24 GB) con contexto moderado.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A6000 48 GB o par de RTX 4090 para FP8; RTX 4090, RTX 3090 o RTX 5090 para cuantización de 4 bits.
- Viabilidad en GPU consumer: probable en 4 bits con una sola tarjeta de 24 GB, siempre que el modelo base sea realmente MoE con pocos parámetros activos y se use offloading de expertos (llama.cpp). No confirmado.
- Opciones de despliegue: vLLM o TGI si se dispone de pesos completos en safetensors y VRAM suficiente; llama.cpp u Ollama si se generan cuantizaciones GGUF; PEFT/Transformers si se despliega como adaptador sobre el base.
- Latencia y throughput: no disponible. En arquitecturas MoE con muy pocos parámetros activos, el throughput por token suele ser notablemente superior al de un modelo denso del mismo tamaño total, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ssyhw7/qwen36-35b-merged-ties_d0.2 | No confirmado (base de 35B según nomenclatura) | No disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales / ~3B activos según nomenclatura, sin verificar | No disponible | No disponible | Hugging Face, modelo de referencia |
| Alternativas públicas de fusión TIES sobre el mismo base | No disponible | No disponible | No disponible | No se han identificado en la información disponible |

No se dispone de datos suficientes para comparar rendimiento con modelos de la misma categoría, ya que no se han publicado benchmarks de este artefacto ni de fusiones equivalentes.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: la model card reconoce que los resultados están pendientes, por lo que no hay evidencia de que la fusión preserve el rendimiento de los adaptadores originales.
- Riesgo de degradación por fusión: TIES reduce pero no elimina los conflictos entre adaptadores; sin métricas no puede descartarse una pérdida de capacidades respecto al modelo base o a los expertos individuales.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha implican que no ha sido probado ni auditado por terceros.
- Ambigüedad del contenido del repositorio: los 6,7 GB no concuerdan con un modelo completo de 35B en bf16; podría tratarse de pesos de adaptador PEFT, de una versión parcial o de una fusión incompleta. Verificar el contenido antes de usarlo.
- Idiomas y contexto desconocidos: no se declara ninguna lista de idiomas ni longitud de contexto, lo que impide garantizar comportamiento en castellano o en contextos largos.
- Licencia: el artefacto se distribuye como apache-2.0, lo que en principio permite uso comercial, pero debe comprobarse la licencia del modelo base Qwen/Qwen3.6-35B-A3B y de los adaptadores de origen, ya que pueden imponer condiciones adicionales.
- Trazabilidad limitada: no se documenta el origen de los tres adaptadores fusionados (datos, autores, licencias), lo que dificulta auditar la procedencia del conocimiento incorporado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al heredar el comportamiento del base y de los adaptadores, arrastra los sesgos de todos ellos sin que exista un informe al respecto.
- No apto para producción sin evaluación previa: sin benchmarks ni pruebas de robustez, su uso en sistemas críticos no está justificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssyhw7/qwen36-35b-merged-ties_d0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio con receta, código, datos y evaluación: https://github.com/HanyangWang0418-oss/qwen36-merge-takehome
- Receta de fusión: merge_recipe.json (referenciado en la model card, alojado en el repositorio de Hugging Face)
