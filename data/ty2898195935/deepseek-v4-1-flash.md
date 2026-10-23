# ty2898195935/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) con 552B parámetros de *backbone* según su model card, diseñado para procesar imágenes y texto de forma nativa y generar texto de manera autorregresiva. Según el documento, su propuesta principal es la compresión agresiva de la caché KV: combina una arquitectura *Causal Encoder-Decoder* (CED), atención dispersa CSA2 con caché principal en FP4 y un índice jerárquico que reduce el coste de indexación en contextos largos. El resultado declarado es una huella de caché KV global de 890 bytes por token, aproximadamente una cuarta parte de DeepSeek-V4-Flash y 437 veces menor que DeepSeek-V1.

La ficha corresponde al repositorio `ty2898195935/DeepSeek-V4.1-Flash`, una subida de un usuario particular (0 descargas, 0 *likes*, creado y actualizado en el mismo segundo) y no a un repositorio oficial de DeepSeek. El recuento real de parámetros en los ficheros *safetensors* es de 763.205.315.794, cifra que no coincide con los 552B de *backbone* de la model card; la diferencia es compatible con los 196B parámetros del módulo Engram que la propia card describe, más el codificador visual, aunque el autor no lo explicita.

El interés del modelo, si los datos se confirman, está en su eficiencia para cargas de trabajo con entradas masivas (agénticas y multimodales): activa solo 8B parámetros por token en *prefill* y 16B en *decode*, admite contextos de hasta 1M tokens y ofrece un ajuste de esfuerzo de razonamiento continuo entre 1 y 100. No obstante, la información disponible es una model card truncada, sin resultados numéricos de evaluación y sin verificación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal con *Causal Encoder-Decoder* (CED): transformer de 40 capas (20 de codificador causal + 20 de decodificador), atención dispersa CSA2, SWA, Engram y decodificación especulativa DSpark |
| Parámetros totales | 763.205.315.794 según *safetensors* del repositorio; la model card declara 552B de *backbone* + 196B de Engram |
| Parámetros activos | 8B por token en *prefill*; 16B por token en *decode* |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | FP8 (etiqueta `fp8`, `8-bit`); caché KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales). No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT (declarada por el autor de la subida) |
| Formato de pesos | safetensors (librería `transformers`); tamaño del repositorio 510,3 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura *Causal Encoder-Decoder* de 40 capas en la que la caché KV global del decodificador se proyecta desde los estados ocultos finales del codificador, en lugar de derivarse de los estados de cada capa del decodificador. Esa proyección es la que permite reducir la activación a 8B parámetros en *prefill* y 16B en *decode*. Sobre esa base se añaden varias piezas: *SWA Bounded Replay*, que reconstruye los estados KV de ventana deslizante ausentes replicando solo los *n*_win tokens más recientes y evita persistir esa caché en SSD; Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir KV principal y K del indexador entre capas y reutilizar índices Top-K; un *Hierarchical Sparse Indexer* que restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full; y *Single-Pass mHC* con un kernel Mega-MHC para la mezcla del flujo residual. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, con 6 expertos enrutados activos por token. Se incluye además Engram, una memoria condicional de 196B parámetros accedida de forma dispersa mediante búsqueda por token, y DSpark, decodificación especulativa con generación de borradores semi-autorregresiva y verificación programada por confianza.

La parte multimodal la forman un codificador visual DeepSeek-ViT entrenado desde cero, con 2D-RoPE y *downsampling* 3×3 por *pixel-unshuffle*, y un proyector MLP de dos capas que convierte las imágenes en *embeddings* visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento. El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con la atención dispersa entrenada a longitud de secuencia de 64K y el contexto extendido hasta 1M tokens a partir de los 34T tokens. El postentrenamiento sigue el paradigma SFT → RL → *on-policy distillation* (OPD) sin modificaciones algorítmicas; los cambios se concentran en el *pipeline* de datos, con síntesis automática a gran escala de tareas y entornos agénticos y escalado progresivo de datos, tareas y *rollouts*.

## Capacidades

- Generación de texto y razonamiento con esfuerzo controlable mediante un parámetro entero de 1 a 100 que intercambia coste de inferencia por precisión.
- Procesamiento nativo de imágenes junto con texto (pipeline `image-text-to-text`): la imagen se convierte en *embeddings* visuales que se procesan de forma conjunta con el texto.
- Comprensión de contextos muy largos, hasta 1M tokens, con una caché KV de 890 bytes por token.
- Cargas de trabajo agénticas de múltiples pasos: la model card menciona síntesis automática de tareas y entornos de agente durante el postentrenamiento y una figura específica de rendimiento en *benchmarks* agénticos.
- Decodificación especulativa integrada (DSpark) para reducir la latencia de generación.
- Memoria condicional Engram de 196B parámetros con acceso disperso por token.
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible, no se declara ningún idioma.
- Capacidades de audio o de generación de imágenes: no disponibles; el modelo solo genera texto.

## Casos de uso

- Agentes de código sobre repositorios completos: con 1M tokens de contexto y 8B parámetros activos en *prefill*, el modelo puede ingerir un árbol de código extenso, los ficheros de configuración y el historial de incidencias en una sola pasada, y sostener sesiones de refactorización de varios pasos con la caché KV comprimida (890 bytes por token, unos 0,85 GB por millón de tokens).
- Análisis de documentación técnica con diagramas: al aceptar imagen y texto conjuntamente, permite adjuntar diagramas de arquitectura, capturas de paneles de monitorización o esquemas de red junto al texto de un *runbook* y obtener explicaciones o diagnósticos combinando ambas modalidades.
- Atención al cliente multi-turno con historial extenso: la ventana de 1M tokens permite conservar conversaciones e histórico de tickets sin resumen intermedio, y el ajuste de esfuerzo de razonamiento (1-100) permite bajar el coste en consultas triviales y subirlo en casos complejos.
- Automatización de procesos con herramientas: si se confirma el soporte de *function calling*, encaja en orquestadores que necesitan leer documentación larga, decidir una acción y ejecutarla contra APIs internas, con la ventaja de que solo se activan 16B parámetros por token en *decode*.
- Due diligence documental y revisión de contratos: procesar lotes de cientos de páginas con referencias cruzadas aprovechando el contexto de 1M tokens y la memoria condicional Engram para recuperar entidades mencionadas previamente en el documento.
- Mantenimiento industrial asistido: enviar fotografías de equipos junto con manuales de servicio en el mismo *prompt* para obtener diagnosis o pasos de reparación, apoyándose en el codificador DeepSeek-ViT entrenado desde cero.
- Investigación sobre eficiencia de inferencia: el modelo es un caso de estudio útil para medir el impacto real de la compresión de caché KV en FP4 y de la atención dispersa CSA2 en cargas con entradas muy largas y salidas cortas.

## Benchmarks y rendimiento

La model card incluye un apartado "Evaluation Results" con el encabezado "Base Model", pero el contenido está truncado y no se proporciona ninguna cifra. Tampoco hay resultados en la información de la búsqueda web.

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos verificables son de eficiencia, no de calidad: caché KV global de 890 bytes por token (aproximadamente 4 veces menor que DeepSeek-V4-Flash y 437 veces menor que DeepSeek-V1), 8B parámetros activos en *prefill* y 16B en *decode*, y un corpus de preentrenamiento de 45T tokens.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 510,3 GB en el formato publicado. Con 763.205.315.794 parámetros, una cuantización uniforme a 8 bits exigiría unos 763 GB teóricos y a 4 bits unos 382 GB, sin contar overhead de activaciones ni caché.
- VRAM para inferencia en el formato publicado: no cabe en una sola GPU de 80 GB. Como referencia de cálculo, hacen falta al menos 8 GPU de 80 GB (640 GB) para alojar 510 GB de pesos con margen escaso; un despliegue cómodo requeriría 16 GPU de 80 GB o nodos con más memoria por GPU.
- VRAM con cuantización a 4 bits: alrededor de 382 GB teóricos, lo que sigue exigiendo 5-6 GPU de 80 GB como mínimo.
- GPU recomendadas: H100 80 GB, H200 o A100 80 GB en configuraciones multi-nodo. No se dispone de datos de latencia o throughput publicados.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 con 24 GB, o incluso un equipo con 4×RTX 4090 (96 GB), queda muy por debajo del requisito incluso en 4 bits.
- Caché KV: 890 bytes por token, es decir, aproximadamente 0,85 GB por cada millón de tokens de contexto, lo que hace viable el uso de ventanas de 1M tokens en memoria respecto al peso de los pesos.
- Opciones de despliegue: la etiqueta `endpoints_compatible` y la librería `transformers` apuntan a despliegue con TGI o con endpoints compatibles; vLLM es plausible pero no está confirmado en la información disponible. llama.cpp y Ollama no están documentados y, por tamaño, no resultan realistas en hardware de consumo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (esta ficha) | 763,2B totales (552B *backbone* + 196B Engram según card); 8B/16B activos | 1M tokens | 890 bytes | MIT (declarada por el subidor) | Repositorio no oficial de un tercero, 510,3 GB |
| DeepSeek-V4-Flash | No disponible | No disponible | Aproximadamente 4× mayor (≈3.560 bytes, derivado del factor 4 declarado) | No disponible | No disponible en la información proporcionada |
| DeepSeek-V1 | No disponible | No disponible | Aproximadamente 437× mayor (≈389 KB, derivado del factor 437 declarado) | No disponible | No disponible en la información proporcionada |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de los modelos de comparación más allá de los factores de compresión de caché KV citados en la model card. No se han encontrado en la búsqueda web modelos alternativos verificables para esta comparativa.

## Limitaciones y advertencias

- El repositorio no es oficial: el autor es `ty2898195935`, no la organización `deepseek-ai`. Tiene 0 descargas y 0 *likes*, y fue creado y actualizado en el mismo segundo (2026-10-22T22:51:42 y 22:51:43), lo que sugiere una subida automatizada o un espejo. Conviene verificar la integridad de los pesos y contrastar con la fuente oficial antes de usarlo en producción.
- La licencia MIT la declara el autor de la subida, no necesariamente el desarrollador original del modelo. La aplicabilidad de esa licencia a los pesos distribuidos en este repositorio no está verificada.
- Discrepancia no resuelta entre los 552B parámetros de *backbone* de la model card y los 763,2B de los ficheros *safetensors*. La diferencia es consistente con Engram (196B) más el codificador visual, pero el autor no lo documenta.
- La model card está truncada: el apartado de resultados de evaluación se corta tras el encabezado "Base Model", por lo que no hay ninguna cifra de MMLU, HumanEval, GSM8K ni de *benchmarks* agénticos que permita validar las afirmaciones de rendimiento.
- No se declaran idiomas soportados. No hay garantía documentada de calidad en castellano.
- La búsqueda web no devolvió resultados técnicos relevantes: únicamente contenido spam y para adultos sin relación con el modelo. No existe verificación externa independiente de las capacidades declaradas.
- Riesgo de alucinación: sin datos de evaluación ni de postentrenamiento con RLHF verificables, no es posible acotar la tasa de alucinación. El modo de razonamiento con esfuerzo configurable entre 1 y 100 puede reducir o aumentar el coste sin garantía proporcional de precisión.
- La caché KV en FP4 (E2M1 con una escala E4M3 por cada 16 canales) introduce cuantización en la memoria de atención; el impacto en tareas de recuperación exacta sobre contextos muy largos no está cuantificado en la información disponible.
- El rendimiento efectivo a 1M tokens no está verificado; la card solo indica que el contexto se extendió a esa longitud a partir de los 34T tokens de preentrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- El tamaño (510,3 GB) hace inviable cualquier despliegue en hardware de consumo y encarece la experimentación; el coste de servir el modelo completo en FP8 puede ser prohibitivo frente a alternativas destiladas o muy cuantizadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ty2898195935/DeepSeek-V4.1-Flash
- Informe técnico referenciado en la model card (ruta relativa del repositorio espejo): https://huggingface.co/ty2898195935/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización de DeepSeek en HuggingFace (mencionada en la card): https://huggingface.co/deepseek-ai
- Sitio web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Cuenta de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Repositorio de figuras de DeepSeek-V2 usado en la card (logotipo y badges): https://github.com/deepseek-ai/DeepSeek-V2

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos eran contenido spam y para adultos sin relación. No se han podido localizar papers, blogs ni demos independientes.
