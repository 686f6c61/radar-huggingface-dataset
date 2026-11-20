# Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP

## Resumen

Qwen3.8 Flash-Next-MLX-3bit-MTP es una conversión cuantizada a 3 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Vontra bajo la marca TensorFold. El modelo base es un vision-language de arquitectura `qwen4_exp` que combina un codificador visual con una pila de lenguaje de tipo MoE disperso, e incorpora un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa. Esta conversión preserva dicho bloque MTP y mantiene en BF16 los módulos multimodales y las compuertas del enrutador MoE, cuantizando el resto a 3 bits afines con tamaño de grupo 32.

El interés de esta ficha radica en que permite ejecutar un modelo de aproximadamente 180.000 millones de parámetros en Apple Silicon con un peso de 90,774 GB, algo inviable en precisión completa. El contexto configurado es de 262.144 tokens, lo que lo sitúa en la liga de modelos de contexto largo para tareas de documento, código y razonamiento multi-paso. La licencia es la Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

La información disponible procede de la model card del autor y de los metadatos de Hugging Face; no se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni detalles sobre el dataset de entrenamiento del modelo base. Los únicos datos de rendimiento son mediciones de velocidad de decodificación en un Apple M3 Studio con el runtime oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | 3 bits afín uniforme, group size 32; módulos multimodales y `mlp.gate` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | MLX safetensors (18 shards, 3.747 tensores indexados, 76 entradas MTP) |
| Tamano del repo | 90,8 GB (pesos: 90,774 GB / 84,54 GiB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (checkpoint BF16 oficial) |
| Libreria / runtime | mlx, mlx-vlm, oMLX |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con codificador visual. La pila de lenguaje integra Gated DeltaNet, Qwen Sparse Attention, capas de mezcla de expertos dispersa, flujos residuales con compuerta ensanchados, embeddings con hash de bigramas y trigramas, y un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa. La conversión de Vontra mantiene un bloque borrador Qwen4Exp para MTP y conserva el tokenizador, la plantilla de chat, el procesador visual y la configuración de generación del modelo original.

Sobre el entrenamiento no hay información en los datos proporcionados: se desconoce el número de tokens, la composición del dataset y si hubo RLHF, DPO u otras etapas de alineamiento. La innovación técnica destacable de esta publicación concreta es la preservación del bloque MTP nativo tras la cuantización, lo que permite decodificación especulativa con un borrador interno en lugar de un modelo auxiliar externo.

## Capacidades

- Generación de texto conversacional con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con codificador visual propio.
- Razonamiento multi-paso y decodificación especulativa mediante el bloque MTP nativo (profundidad de borrador configurable, tres tokens en el ejemplo del autor).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, aunque son esperables en la familia Qwen; se indican como no verificadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no publica la lista de idiomas.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o expedientes completos en una sola pasada sobre un Mac con memoria unificada amplia, sin fragmentación por trozos.
- Asistente de código sobre repositorios: la ventana de contexto permite cargar varios ficheros y el historial de conversación; la cuantización a 3 bits reduce el peso a 90,8 GB, lo que hace viable mantener el modelo residente en un equipo de sobremesa Apple.
- Procesamiento de capturas y diagramas: al ser image-text-to-text, sirve para extraer texto estructurado de pantallazos, transcribir diagramas de arquitectura o interpretar figuras de documentación técnica.
- Generación aumentada por recuperación (RAG) de corpus extensos: el contexto largo reduce la necesidad de reordenar y comprimir pasajes, y el MTP acelera la respuesta en flujos interactivos.
- Servicio interno con API compatible con OpenAI: el runtime oMLX expone una API compatible, lo que permite integrar el modelo en herramientas existentes sin adaptadores propios.
- Evaluación e investigación de cuantización extrema: el repositorio sirve como referencia para estudiar el impacto de 3 bits con group size 32 en un MoE multimodal, comparando con el checkpoint BF16 original.
- Prototipado en estación de trabajo sin GPU dedicada: útil para equipos que trabajan en macOS y necesitan un modelo grande sin depender de clústeres con A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son mediciones de velocidad de decodificación del autor en un Apple M3 Studio con oMLX 0.6.3rc3 (build 2475), decodificación greedy, semilla 6330, calentamiento previo y 3 ejecuciones medidas de 512 tokens por modo:

| Modo de runtime | Ejecuciones | Salida por ejecución | Velocidad mediana | Borradores | Aceptados | Tasa de aceptación |
|---|---:|---:|---:|---:|---:|---:|
| MTP nativo desactivado | 3 | 512 tokens | 28,0408 tokens/s | no aplica | no aplica | no aplica |
| MTP nativo activado, 3 tokens de borrador | 3 | 512 tokens | 30,5895 tokens/s | 659 | 431 | 65,4% |

La ganancia medida con MTP fue del 9,09%. El autor reporta paridad de salida exacta, alcance de 512 tokens generados en todas las ejecuciones sostenidas, comprobaciones de coherencia y captura de telemetría MTP, todas superadas.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 90,774 GB, por lo que se necesita un equipo con al menos ~96 GB de memoria unificada disponible para cargar el modelo y dejar margen para caché KV y contexto.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia (M3 Studio en la medición del autor). No hay datos de ejecución en A100, H100 ni RTX 4090, y el formato MLX no está pensado para CUDA.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones consumer convencionales. En Apple Silicon, requiere equipos con 96 GB o más de memoria unificada.
- Opciones de despliegue: oMLX (0.6.3rc3 build 2475 validado), MLX-VLM 0.6.3 y MLX 0.32.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX y la arquitectura `qwen4_exp`.
- Latencia y throughput: 28,04 tokens/s sin MTP y 30,59 tokens/s con MTP en Apple M3 Studio, decodificación greedy y 512 tokens de salida. La primera petición tras la carga incluye calentamiento y queda excluida de la cifra de régimen estable.
- Nota de compatibilidad: los runtimes sin soporte explícito de `qwen4_exp` y MTP nativo pueden rechazar las 76 entradas de tensores MTP en carga estricta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP | ~180B | 262.144 | MLX safetensors, 3 bits | Qwen Community 1.0 | Hugging Face, 1.582 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | 262.144 (heredado) | BF16 safetensors | Qwen Community 1.0 | Hugging Face |
| Alternativas de tamano similar en MLX 3 bits | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad con modelos de la misma categoría. La comparación con el checkpoint base se limita al formato y al tamaño: la conversión reduce el peso a 90,774 GB y añade decodificación especulativa con MTP nativo, a costa de una posible pérdida de precisión por la cuantización a 3 bits, no cuantificada en la información disponible.

## Limitaciones y advertencias

- La cuantización a 3 bits con group size 32 puede degradar la calidad frente al checkpoint BF16; el autor no publica métricas de degradación.
- Los módulos multimodales y las compuertas del enrutador MoE se mantienen en BF16, pero el resto de la pila de lenguaje está cuantizado, lo que afecta de forma desigual a distintas capacidades.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable en modelos de este tamaño y debe validarse en dominio.
- Sesgos: no documentados por el autor; no hay información sobre composición del dataset ni evaluaciones de sesgo.
- Idiomas: la lista de idiomas soportados no está publicada, por lo que no se puede garantizar calidad fuera del inglés o el chino sin pruebas propias.
- Compatibilidad estricta: requiere runtimes con soporte explícito de `qwen4_exp` y MTP nativo; versiones anteriores de MLX-VLM u oMLX no cargarán el checkpoint correctamente.
- El soporte de entrada visual depende de las versiones de MLX-VLM y oMLX; las cifras de rendimiento publicadas cubren solo generación de texto.
- Licencia Qwen Community License 1.0: conviene revisar sus cláusulas antes de uso comercial, ya que impone condiciones específicas distintas de una licencia permisiva estándar.
- El rendimiento medido corresponde a un único equipo (Apple M3 Studio) y variará con la longitud del prompt, el crecimiento del contexto, el estado de la caché, la versión del runtime, la presión de memoria y las condiciones térmicas.
- El repositorio figura con 0 likes y 1.582 descargas, y la model card menciona la ruta `TensorFold/Qwen3.8-Flash-Next-MLX-3bit-MTP` mientras el ID de Hugging Face es `Vontra/...`; conviene verificar la procedencia antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Portal de Qwen: https://qwen.ai/
- MLX-VLM (repositorio): https://github.com/ml-explore/mlx-vlm
- TensorFold: https://tensorfold.dev
- Licencia Qwen Community 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-3bit-MTP/blob/main/LICENSE
