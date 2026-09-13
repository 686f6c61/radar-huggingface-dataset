# SubMaroon/MN-12B-Mag-Mell-Sodom-v2

## Resumen

SubMaroon/MN-12B-Mag-Mell-Sodom-v2 es un modelo de lenguaje de 12.247.782.400 parámetros publicado por el usuario SubMaroon en HuggingFace, resultado de una fusión (merge) de pesos generada con la herramienta mergekit. Según los metadatos del repositorio, el modelo se construyó mediante el método TIES tomando como base un modelo denominado Mell y fusionando sobre él un modelo denominado Sodom, con densidad 0,3, peso 0,15 y normalización activada, en precisión float16. La etiqueta `mistral` del repositorio apunta a una arquitectura de la familia Mistral, aunque no se detallan en la información disponible ni la longitud de contexto ni la composición de los datos de entrenamiento originales.

Su relevancia es, sin embargo, fundamentalmente negativa y documental: la propia model card del autor, escrita en inglés, afirma de forma explícita que el modelo "no funciona" ("THIS MODEL ISN'T WORKING"), lo describe como "basura" (junk), pide que no se descargue y aclara que se mantiene publicado únicamente porque no quiere borrarlo y necesita el espacio de almacenamiento para otro proyecto. El repositorio acumula una única descarga y cero "likes" desde su creación el 10 de febrero de 2025, y su tamaño es de 24,5 GB.

En consecuencia, esta ficha debe leerse como el análisis técnico de un artefacto defectuoso: un caso de estudio sobre fusiones de pesos que degradan el modelo resultante y sobre prácticas de publicación en la ecosistema open source. No se dispone de licencia declarada, ni de idiomas soportados, ni de benchmarks, ni de ninguna validación funcional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la etiqueta `mistral` del repositorio sugiere una arquitectura transformer decoder-only de la familia Mistral en su variante de ~12B |
| Parámetros totales | 12.247.782.400 (dato real de los safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors float16 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `base_model` vacío y no se menciona licencia) |
| Formato de pesos | safetensors (float16, según la configuración de mergekit) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: el modelo es una fusión de pesos (*weight merge*) de dos modelos preentrenados, ejecutada con mergekit. La configuración YAML publicada en la model card especifica `merge_method: ties`, base `Mell`, un único modelo añadido (`Sodom`) con `density: 0.3` y `weight: 0.15`, y `normalize: true`, con `dtype: float16`. El método TIES (referencia arXiv:2306.01708) busca resolver la interferencia entre parámetros al fusionar modelos mediante el recorte de valores redundantes (top-k por densidad), la resolución de discrepancias de signo y la combinación ponderada posteriormente normalizada.

Es reseñable el desequilibrio de los hiperparámetros: un peso de 0,15 para el único modelo donante, combinado con una densidad de 0,3, implica que la contribución efectiva de Sodom es muy reducida y muy dispersa sobre los pesos de Mell. No se dispone de información sobre la arquitectura exacta de Mell o Sodom, ni sobre sus tokenizadores, ni sobre si compartían vocabulario o configuración de atención, factores que condicionan la viabilidad de cualquier fusión de pesos. El autor no documenta ningún proceso de validación posterior al merge, y su propio diagnóstico es que el resultado no es funcional.

## Capacidades

La información disponible no permite acreditar ninguna capacidad funcional. El autor declara explícitamente que el modelo "lo más probable es que no funcione" y que es "basura", por lo que no se puede confirmar ninguna de las siguientes capacidades que sí serían esperables en un modelo Mistral de 12B correctamente construido:

- Generación de texto conversacional: las etiquetas `conversational` y `text-generation` están presentes, pero no hay evidencia de que la generación sea coherente tras el merge.
- Razonamiento, matemáticas y generación de código: no verificadas y, dado el estado declarado del modelo, no esperables.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo "thinking", visión, audio): no documentadas.
- Compatibilidad de infraestructura: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el autor previó su despliegue con TGI y con los Inference Endpoints de HuggingFace, lo cual es una declaración de intenciones, no una validación de calidad.

## Casos de uso

Dado que el autor desaconseja su descarga y uso, los casos de uso realistas son de tipo forense, docente o de infraestructura, no aplicaciones de producto:

- Auditoría de fusiones fallidas: cargar los safetensors y comparar los tensores resultantes con los de Mell y Sodom para caracterizar qué combinaciones de densidad y peso degradan la perplejidad. El propio YAML publicado (`density: 0.3`, `weight: 0.15`, `normalize: true`) sirve como punto de partida reproducible.
- Estudio académico del método TIES: usar este repositorio como ejemplo de aplicación límite del algoritmo descrito en arXiv:2306.01708, midiendo el efecto del recorte por densidad sobre la función de pérdida de un modelo de 12B.
- Reproducción de pipelines con mergekit: servir de caso de prueba para validar que una configuración YAML concreta se ejecuta, produce safetensors de 12.247.782.400 parámetros y genera un repositorio coherente, independientemente de la calidad del resultado.
- Docencia sobre higiene en la publicación de modelos: ilustrar por qué publicar artefactos no validados con etiquetas como `conversational` o `endpoints_compatible` puede inducir a error a consumidores que filtren por etiquetas en el Hub.
- Pruebas de carga y compatibilidad de infraestructura: verificar que vLLM, TGI o transformers son capaces de instanciar un checkpoint fp16 de 24,5 GB con configuración de Mistral, y medir tiempos de carga en frío.
- Investigación sobre cuantización de checkpoints degenerados: convertir el modelo a GGUF o AWQ y comprobar si la degradación observada se agrava, se mantiene o se atenúa con 8 y 4 bits.

No se recomienda su uso para generación de texto, atención al cliente, generación de código ni ninguna aplicación orientada a usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el autor no aporta comparaciones cuantitativas con Mell o Sodom. No se dispone por tanto de evidencia de rendimiento más allá de la afirmación cualitativa del propio autor de que el modelo no funciona.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 24,5 GB solo para los pesos, más el *KV cache* y las activaciones. En la práctica, entre 26 y 30 GB según longitud de contexto y tamaño de lote.
- GPU de datacenter: cabe con holgura en A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB.
- GPU de consumo: no cabe en fp16 en una RTX 4090 o RTX 3090 de 24 GB sin recurrir a *offloading* parcial a CPU o a cuantización. En 8 bits ocuparía aproximadamente 13 GB y en 4 bits unos 7 GB, lo que lo haría viable en GPUs de 16 GB en adelante, pero dichas cuantizaciones no están publicadas y su calidad es indeterminada.
- Alternativa multi-GPU: 2× RTX 4090 con *tensor parallelism* mediante vLLM, o 2× RTX 3090, asumiendo que el checkpoint sea cargable.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta presente), vLLM, y los Inference Endpoints de HuggingFace (etiqueta `endpoints_compatible`). llama.cpp u Ollama requerirían una conversión manual a GGUF que no está publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se establece por rango de parámetros y arquitectura declarada, no por calidad, dado que no existen métricas publicadas para este modelo. Los datos de las alternativas provienen de sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad y estado |
|---|---|---|---|---|
| SubMaroon/MN-12B-Mag-Mell-Sodom-v2 | 12,25B | no disponible | no disponible | Publicado, 1 descarga, 0 likes; el autor lo declara no funcional |
| Mistral NeMo 12B | 12B | 128.000 tokens | Apache 2.0 | Pesos oficiales en safetensors, ampliamente desplegado |
| Gemma 2 9B | 9B | 8.192 tokens | Licencia Gemma (con restricciones de uso) | Pesos oficiales, ecosistema amplio |
| Qwen2.5 14B | 14B | 131.072 tokens | Apache 2.0 | Pesos oficiales, cuantizaciones GGUF y AWQ disponibles |

La diferencia relevante no es de tamaño sino de trazabilidad: las tres alternativas cuentan con documentación de entrenamiento, licencia explícita, benchmarks publicados y cuantizaciones mantenidas por la comunidad, ninguna de las cuales está presente en este repositorio.

## Limitaciones y advertencias

- Estado funcional: el autor afirma que el modelo es "junk" y que probablemente no funciona. Cualquier evaluación debe partir de esta premisa.
- Ausencia de licencia: no se declara licencia alguna, lo que impide determinar si el uso comercial está permitido. Al derivar de dos modelos preentrenados cuyos términos se desconocen, la situación legal es indeterminada.
- Ausencia de validación: no hay benchmarks, ni evaluación humana, ni pruebas de coherencia, ni comparación con los modelos de origen.
- Riesgo elevado de degeneración del texto: los merges de pesos pueden producir salidas incoherentes, repeticiones, cambios de idioma o degradación del tokenizador cuando los modelos fusionados no comparten vocabulario o configuración.
- Sesgos conocidos: no documentados. Al heredarse de modelos preentrenados no identificados públicamente, los sesgos son desconocidos e incontrolados.
- Riesgo de alucinación: no evaluado y, previsiblemente, agravado por la degradación de los pesos.
- Idiomas y contexto: sin datos. No se puede garantizar el comportamiento multilingüe ni una ventana de contexto concreta.
- Trazabilidad insuficiente: los modelos Mell y Sodom se referencian sin espacio de nombres de autor, lo que dificulta reproducir la fusión y auditar los pesos originales.
- Recomendación operativa: no incorporar este checkpoint a ningún pipeline de producción, ni distribuirlo a usuarios finales, ni usarlo como base para nuevas fusiones o ajustes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/MN-12B-Mag-Mell-Sodom-v2
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método TIES: https://arxiv.org/abs/2306.01708
- Modelos de origen (Mell, Sodom): no disponibles; la model card los referencia sin espacio de nombres de autor
- Resultados de búsqueda web: no se encontró información adicional relevante sobre este modelo ni sobre sus componentes en las fuentes consultadas
