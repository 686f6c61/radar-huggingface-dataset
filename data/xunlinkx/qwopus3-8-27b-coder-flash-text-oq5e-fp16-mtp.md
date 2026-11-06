# xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ5e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-Text-oQ5e-fp16-mtp es una cuantización de 5 bits en formato MLX del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un LLM denso de aproximadamente 27.320 millones de parámetros orientado a generación de código. La publica el usuario xunlinkx mediante el pipeline de cuantización oMLX, y está pensada específicamente para ejecutarse en Apple Silicon (M1 a M5) con la librería MLX. Esta edición concreta es «Text-Only»: elimina por completo el codificador visual (los 27 bloques ViT, las proyecciones de imagen y los procesadores de vídeo), lo que libera unos 2,2 GB de memoria unificada y reduce la latencia de arranque en frío.

La propuesta de valor de esta variante es doble. Por un lado, aplica una cuantización mixta «enhanced oQ5» con calibración por matriz de importancia (imatrix), manteniendo en FP16 los pesos no cuantizados, escalas, sesgos, normas y embeddings, y elevando a 6/8 bits las proyecciones sensibles de atención (q_proj, v_proj) y las down-projections del MLP en capas críticas para preservar la profundidad de razonamiento y el respeto a la indentación del código. Por otro, conserva en FP16 las cabezas de predicción multi-token (MTP), lo que habilita decodificación especulativa con una mejora reportada de entre 1,4x y 1,7x en throughput de tokens en tareas de código y razonamiento agéntico.

El modelo está pensado para agentes de código headless, arneses de terminal (Hermes, OpenCode) y flujos de desarrollo multi-turno en equipos Mac. Hereda la licencia Apache-2.0 del modelo base. Su relevancia actual radica en que permite ejecutar un modelo de 27B en memoria unificada de Apple Silicon con aceleración especulativa nativa, sin depender de GPUs dedicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `qwen3_5_text` (pure text LLM) |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 5 bits mixta (oQ5e) con cuantización afín, group size 64 e imatrix; capas sensibles a 6/8 bits; pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `mlx`), repo de 19,4 GB |
| Modalidad | Solo texto (sin visión ni vídeo) |
| Decodificación especulativa | Sí, cabezas MTP en FP16 (`mtp_num_hidden_layers: 1`) |
| Modelo base | Jackrong/Qwopus3.8-27B-Coder-Flash |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia `qwen3_5_text`, con aproximadamente 27,3B de parámetros. Esta ficha corresponde a una cuantización, no a un entrenamiento desde cero: el checkpoint base fue afinado por Jackrong como «Coder-Flash» y posteriormente cuantizado y empaquetado por xunlinkx con el pipeline oMLX. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica principal de este artefacto es la combinación de tres elementos: (1) cuantización mixta con imatrix (128 muestras, longitud de secuencia 512) que protege capas sensibles del colapso de precisión; (2) preservación de las cabezas MTP en FP16 para habilitar decodificación especulativa multi-token; y (3) eliminación total del stack multimodal (27 bloques ViT, tokens de proyección de imagen y procesadores de vídeo) para maximizar el presupuesto de memoria disponible para la ventana de contexto en cargas de trabajo puramente textuales.

## Capacidades

- Generación de texto y código en modo conversacional (pipeline `text-generation`).
- Razonamiento de código: el autor destaca la preservación de la profundidad de razonamiento y la adherencia a la indentación mediante el refuerzo a 6/8 bits de proyecciones sensibles.
- Decodificación especulativa mediante cabezas MTP, con aceleración reportada de 1,4x–1,7x en throughput.
- Flujos multi-turno de desarrollo de software y razonamiento agéntico.
- Integración en arneses de terminal y agentes de código headless (Hermes, OpenCode).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de visión, audio ni vídeo (edición Text-Only).

## Casos de uso

- Agentes de código en terminal: el modelo puede servir como backend de arneses CLI como Hermes u OpenCode, donde la ausencia del codificador visual reduce el arranque en frío y libera memoria para contextos de conversación largos.
- Generación de código en editor local sobre Mac: con MLX-LM u oMLX Server se puede servir en localhost y conectar a extensiones de IDE, aprovechando la cuantización de 5 bits para encajar en memoria unificada de equipos de consumo.
- Refactorización multi-turno: la preservación de la indentación y de las proyecciones de atención críticas favorece tareas iterativas de reescritura de código donde la coherencia estructural importa.
- Automatización de pruebas y parches en CI/CD local: mediante el servidor oMLX expuesto en un puerto, se puede invocar desde scripts para generar parches o tests sobre fragmentos de código.
- Asistente de documentación técnica: generación de docstrings, READMEs y comentarios a partir de código fuente, en un pipeline puramente textual.
- Prototipado de razonamiento agéntico en Apple Silicon: usando MTP con `mtp_num_draft_tokens: 3` y temperatura baja (0,2) se obtiene un bucle de razonamiento multi-paso más rápido, útil para experimentación con agentes.
- Servicio de chat de soporte técnico especializado en código: conversaciones multi-turno con contexto de repositorio, siempre que la ventana de contexto resultante sea suficiente (dato no publicado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la mejora de throughput de 1,4x–1,7x al activar decodificación especulativa MTP en tareas de código y razonamiento agéntico.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 19,4 GB en safetensors; en ejecución se necesita memoria unificada suficiente para pesos, caché KV y overhead del runtime. Como referencia, el autor indica que la eliminación del stack visual ahorra ~2,2 GB.
- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4, M5) con memoria unificada; el autor señala FP16 como la ruta de máxima velocidad en M1/M2 y de máximo ancho de banda en M3/M4/M5.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de este artefacto, que depende de MLX y no de CUDA.
- Despliegue: oMLX Server (`omlx serve ... --port 8005`) y MLX-LM (`mlx_lm.generate`). No se mencionan vLLM, TGI, llama.cpp ni Ollama para este checkpoint; el autor cita «llama.cpp MTP draft» solo como runtime que podría habilitar MTP en general.
- Latencia y throughput: no disponibles más allá del multiplicador MTP reportado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ5e-fp16-mtp | ~27,3B denso | No disponible | MLX safetensors, oQ5e 5 bits | Apache-2.0 | Solo texto, MTP en FP16, Apple Silicon |
| xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp | ~27,3B denso | No disponible | MLX safetensors, oQ5e 5 bits | Apache-2.0 | Variante con stack multimodal conservado |
| Jackrong/Qwopus3.8-27B-Coder-Flash | ~27,3B denso | No disponible | Safetensors sin cuantizar | Apache-2.0 | Checkpoint base de referencia |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con modelos de otros autores.

## Limitaciones y advertencias

- Modelo solo texto: no procesa imágenes, vídeo ni audio; cualquier caso de uso multimodal requiere la variante no Text-Only.
- Dependencia de MLX y Apple Silicon: no es portable directamente a CUDA ni a GPUs dedicadas sin reconversión.
- Cuantización de 5 bits: aunque se refuerzan capas sensibles, existe riesgo de degradación frente al checkpoint base en tareas de razonamiento profundo o contextos muy largos.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento en ventanas largas ni planificar pipelines que dependan de un contexto concreto.
- Idiomas soportados no documentados: no hay garantía explícita de calidad en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación: inherente a los LLM; no hay evaluación publicada de tasas de alucinación para este checkpoint.
- Sesgos: no se documentan evaluaciones de sesgo para el modelo base ni para esta cuantización.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash y de los datos de entrenamiento originales.
- Autoría de terceros: la cuantización la publica un usuario independiente (xunlinkx); no hay garantía de soporte ni de mantenimiento continuado.
- Sin likes ni tracción comunitaria (0 likes, 303 descargas en el momento de la consulta): menor validación externa frente a checkpoints oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ5e-fp16-mtp
- Variante con multimodal conservado: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
