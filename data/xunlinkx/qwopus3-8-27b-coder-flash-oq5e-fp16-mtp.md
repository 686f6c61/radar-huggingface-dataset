# xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp es una cuantización de 5 bits en formato MLX del modelo denso Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tuning orientado a código sobre la arquitectura Qwen3_5. La publica el usuario xunlinkx mediante el pipeline de cuantización oMLX, con el objetivo de ejecutar un modelo de aproximadamente 27.800 millones de parámetros de forma nativa en Apple Silicon (M1, M2, M3, M4 y posteriores). El resultado ocupa 21,2 GB en el repositorio y conserva tanto la torre de visión multimodal como las cabezas de predicción multi-token (MTP) en FP16.

El interés de esta ficha no está en un modelo nuevo desde cero, sino en el trabajo de empaquetado: una cuantización mixta que sube a 6 y 8 bits las proyecciones de atención (q_proj, v_proj) y las down-projections de las capas sensibles, mantiene en FP16 los pesos no cuantizados, escalas, sesgos, normas y embeddings, y deja intacto el encoder visual de 27 bloques. Ese diseño busca preservar la profundidad de razonamiento y la fidelidad de indentación en tareas de código, además de no degradar OCR ni la comprensión de capturas de pantalla de código.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita el uso comercial. La información publicada no incluye datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks, por lo que esas filas se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con encoder visual ViT de 27 bloques) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5 bits mixta (oQ5e) con cuantización afín, group size 64; capas sensibles en 6/8 bits; pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3_5 con capacidad multimodal: incorpora un encoder visual de 27 bloques (`model.visual.*`) y un módulo merger que proyecta las representaciones visuales al espacio del modelo de lenguaje. Sobre esa arquitectura, Jackrong realizó un fine-tuning orientado a código ("Coder-Flash"). La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación de esta versión concreta es el pipeline de cuantización oQ5e: cuantización afín de 5 bits con group size 64 y calibración estricta mediante matriz de importancia (imatrix) con 128 muestras y longitud de secuencia 512. Las proyecciones críticas de atención y las down-projections del MLP en capas sensibles se elevan a 6 y 8 bits, mientras que la torre visual y las cabezas de predicción multi-token (`mtp.*`, con `mtp_num_hidden_layers: 1`) se conservan en FP16 sin cuantizar. El uso de FP16 como dtype de destino busca máximo rendimiento en chips M1/M2, que carecen de unidades aritméticas BF16 nativas, sin penalizar M3/M4/M5. Las cabezas MTP habilitan decodificación especulativa, con una mejora declarada de throughput de aproximadamente 1,4x a 1,7x en tareas de código y razonamiento agéntico.

## Capacidades

- Generación de texto y razonamiento general sobre un modelo denso de ~27,8 B de parámetros.
- Generación y comprensión de código, con especial énfasis en fidelidad de indentación y estructura (objetivo declarado del fine-tuning Coder-Flash y de la cuantización selectiva).
- Visión multimodal: OCR, razonamiento espacial, análisis de diagramas y comprensión de capturas de pantalla de código, gracias al encoder ViT de 27 bloques conservado en FP16.
- Decodificación especulativa mediante cabezas MTP (multi-token prediction), configurable con `mtp_enabled` y `mtp_num_draft_tokens`.
- Ejecución nativa en Apple Silicon a través de MLX y del servidor oMLX.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona tareas "agentic reasoning" como caso donde MTP aporta aceleración, pero no detalla mecanismos específicos de agentes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede generar funciones completas (por ejemplo, una caché LRU thread-safe en Python) ejecutándose íntegramente en un equipo Apple Silicon con MLX, sin depender de la nube y con los datos del usuario en local.
- Comprensión de capturas de pantalla de código: gracias al encoder visual en FP16, se le puede pasar una imagen de un fragmento de código o de un error de consola y pedirle explicación, corrección o refactorización, un flujo útil para depuración rápida.
- Análisis de diagramas de arquitectura: interpretación de diagramas UML, esquemas de base de datos o diagramas de flujo para generar el andamiaje de código correspondiente o documentación técnica.
- Servidor de inferencia local con oMLX: desplegar el modelo con `omlx serve` en el puerto 8005 y consumirlo vía API desde editores o herramientas internas, activando MTP para reducir la latencia en tareas de autocompletado.
- Prototipado agéntico en estación de trabajo: con MTP activado y `mtp_num_draft_tokens: 3`, el modelo es adecuado para bucles de razonamiento multi-paso donde cada token adicional de latencia se acumula, como pipelines de refactorización por pasos.
- Extracción de texto de documentos técnicos: uso del pipeline multimodal para OCR sobre documentación escaneada, manuales o capturas, conservando la estructura del texto.
- Evaluación de cuantizaciones en investigación: comparar esta variante oQ5e con la oQ4e del mismo autor para medir la degradación por bits en tareas de código, un caso de uso real para quien investiga técnicas de cuantización mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única cifra de rendimiento declarada es la aceleración por decodificación especulativa MTP, de aproximadamente 1,4x a 1,7x en throughput de tokens sobre tareas de código y razonamiento agéntico, sin valores absolutos de tokens por segundo ni condiciones de medición.

## Requisitos de hardware

- VRAM/unified memory: el repositorio ocupa 21,2 GB, por lo que se necesita al menos ese espacio de memoria unificada más el margen para el contexto y el runtime; en la práctica, un Mac con 32 GB o más es el mínimo razonable para contexto moderado.
- GPU recomendadas: Apple Silicon M1, M2, M3, M4 y posteriores; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (32 GB o más); no aplica a GPU dedicadas por el formato MLX.
- Opciones de despliegue: servidor oMLX (`omlx serve`), MLX-LM (`mlx_lm.generate`); el autor menciona también llama.cpp con draft MTP como runtime compatible con decodificación especulativa.
- Latencia y throughput: no disponibles en valores absolutos; solo la mejora relativa de 1,4x a 1,7x con MTP activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp | ~27,8 B (denso) | no disponible | 5 bits mixta, FP16 en capas críticas | Apache-2.0 | Hugging Face, MLX |
| xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp | ~27,8 B (denso) | no disponible | 4 bits mixta | Apache-2.0 | Hugging Face, MLX |
| Jackrong/Qwopus3.8-27B-Coder-Flash | ~27,8 B (denso) | no disponible | pesos completos (base) | Apache-2.0 | Hugging Face |

La comparación con alternativas de otros autores no está disponible en la información proporcionada; no se dispone de datos de rendimiento que permitan contrastar con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización de 5 bits introduce degradación respecto al modelo base; el autor la mitiga con capas sensibles en 6/8 bits, pero no publica mediciones de la pérdida de calidad.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPU NVIDIA ni a servidores x86 convencionales.
- No se han publicado datos de longitud de contexto, idiomas soportados, sesgos ni tasas de alucinación.
- Riesgo de alucinación inherente a un modelo de ~27,8 B sin datos de evaluación publicados; conviene validar las salidas de código con tests antes de llevarlas a producción.
- Las cabezas MTP solo aportan aceleración en runtimes que las soporten (oMLX, llama.cpp con draft MTP); en otros entornos se ejecuta como modelo denso estándar.
- La licencia Apache-2.0 permite uso comercial, pero al ser un derivado conviene verificar las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash y de los datos de entrenamiento originales.
- El repositorio tiene 282 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2 de noviembre de 2026); se trata de una publicación muy reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ5e-fp16-mtp
- Variante oQ4e del mismo autor: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
