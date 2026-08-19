# treeish/Qwen3.6-35B-A3B-oQ2e-MTP-MLX

## Resumen

Qwen3.6-35B-A3B-oQ2e-MTP-MLX es un paquete de pesos cuantizados del modelo base Qwen/Qwen3.6-35B-A3B, preparado por el usuario treeish para su uso en el agente de codificacion Sprig dentro del entorno Treeish. Se trata de una distribucion byte-pinned que combina una cuantizacion mixta de precision oQ2e mejorada con imatrix, una cabeza de prediccion multi-token (MTP) embebida y una plantilla de chat corregida para el flujo de trabajo de agente de codificacion. El modelo base es una arquitectura MoE con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos, con una ventana de contexto de 262.144 tokens.

La relevancia de este paquete radica en su enfoque practico: permite ejecutar un modelo de gran tamano en hardware de consumo (validado en un Apple M4 Max con 36 GB de memoria unificada) gracias a una cuantizacion agresiva de 2 bits con overrides por tensor de hasta 8 bits. Incluye ademas la cabeza MTP, que acelera la generacion mediante decodificacion especulativa, y una plantilla de chat especifica para tareas de edicion de codigo con formato exacto. El paquete esta pensado para cargarse tal cual, sin modificaciones, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer con atencion de ventana larga |
| Parametros totales | 35.000 millones (base); 4.180.884.400 en el archivo safetensors cuantizado |
| Parametros activos | Aproximadamente 3.000 millones |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ2e imatrix-enhanced, 2-bit affine con grupo de 64, overrides por tensor de 3, 4, 5, 6 y 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (3 shards, 13.563.313.332 bytes de datos de tensor) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. El paquete cuantizado conserva la estructura original del modelo, incluyendo la cabeza de prediccion multi-token (MTP) bajo el espacio de nombres `language_model.mtp.*`, que permite decodificacion especulativa para acelerar la generacion. La cuantizacion oQ2e es una variante de cuantizacion de baja precision mejorada con imatrix (matriz de importancia), que asigna 2 bits por defecto con grupo de 64, pero aplica overrides por tensor de 3, 4, 5, 6 y 8 bits en capas criticas para preservar la calidad.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO). El paquete cuantizado no modifica los pesos del modelo base, solo los cuantiza y anade la plantilla de chat corregida (Froggeric Qwen3.6 v21.3) y metadatos de procedencia. La conversion fue realizada con oMLX 0.5.0, aunque no se identifica el commit exacto del modelo base utilizado, por lo que el paquete se considera una distribucion curada y fijada por bytes, no una receta de conversion reproducible.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, aunque la cuantizacion agresiva puede degradar la calidad en tareas complejas.
- Generacion de codigo: orientado a flujos de agente de codificacion, con soporte para edicion de archivos mediante formato de edicion exacto (string exact edit).
- Tool calling / function calling: validado para producir llamadas a herramientas estructuradas, como la llamada `search_text` con parametros de consulta y numero de resultados.
- Multi-step reasoning: el modelo base soporta razonamiento en multiples pasos, aunque la cuantizacion puede afectar a la coherencia en cadenas largas.
- Decodificacion especulativa: la cabeza MTP embebida permite acelerar la generacion proponiendo multiples tokens por paso (block size 3 en las pruebas).
- Multilingue: no se han publicado datos sobre los idiomas soportados en este paquete.
- Vision: el pipeline_tag de HuggingFace indica `image-text-to-text`, lo que sugiere capacidades multimodales del modelo base, pero no se proporciona informacion adicional en la model card.

## Casos de uso

- Agente de codificacion local: el paquete esta disenado para el agente Sprig de Treeish, que realiza tareas de edicion de codigo con formato exacto. Se puede integrar en un entorno de desarrollo local para asistir en refactorizacion, correccion de errores y generacion de parches.
- Asistente de busqueda en repositorios: gracias a la llamada a herramienta `search_text`, el modelo puede buscar fragmentos de codigo en un repositorio y devolver resultados estructurados, util para navegacion automatica en bases de codigo grandes.
- Generacion de codigo con contexto largo: con 262.144 tokens de contexto, puede procesar archivos completos o multiples modulos de un proyecto, adecuado para tareas de mantenimiento y comprension de codigo legacy.
- Prototipado rapido en hardware de consumo: al caber en 24 GB de memoria unificada, permite ejecutar un modelo de 35B en portatiles con Apple Silicon (M4 Max o superior) sin necesidad de GPU dedicada, ideal para desarrollo offline.
- Pruebas de decodificacion especulativa: la cabeza MTP integrada permite experimentar con tecnicas de aceleracion de inferencia en MLX, midiendo el impacto en tokens por segundo y tasa de aceptacion de tokens propuestos.
- Despliegue en entornos con restricciones de memoria: la cuantizacion de 2 bits reduce significativamente el uso de VRAM, habilitando inferencia en dispositivos con poca memoria unificada, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento de un fixture especifico en un Apple M4 Max con 36 GB de memoria unificada:

| Metrica | Valor |
|---|---|
| Velocidad de generacion sin MTP | 86,5 tokens/s |
| Velocidad de generacion con MTP (block size 3) | 110,6 tokens/s |
| Tasa de aceptacion de tokens propuestos por MTP | 60 de 69 (86,9 %) |
| Fixture de rendimiento | 1.066 tokens, tras warm-up |

Estas cifras corresponden a una sola maquina y un fixture pequeno, y no deben interpretarse como benchmarks generales del modelo.

## Requisitos de hardware

- Memoria unificada recomendada: 24 GB minimo, 32 GB recomendado segun Treeish. El headroom real depende de la longitud de contexto, la configuracion de cache y otras aplicaciones en ejecucion.
- GPU validada: Apple M4 Max con 36 GB de memoria unificada (usada en las pruebas de validacion).
- Compatibilidad con consumer GPU: el formato MLX esta orientado a Apple Silicon; no se menciona soporte para CUDA o ROCm en este paquete.
- Opciones de despliegue: el paquete esta validado con el runtime MLX Swift de Treeish. Otros runtimes deben soportar los overrides de cuantizacion por tensor en `config.json` y el layout MTP embebido de Qwen.
- Latencia y throughput: en el fixture de 1.066 tokens, se midieron 86,5 tokens/s sin MTP y 110,6 tokens/s con MTP block size 3 en M4 Max. No hay datos para otros hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otros modelos de la misma categoria. El paquete es una cuantizacion especifica del modelo base Qwen3.6-35B-A3B, y no se han publicado comparaciones con alternativas como Qwen3-30B-A3B, DeepSeek-V3-Lite u otros MoE de tamano similar. La unica referencia disponible es el modelo base sin cuantizar, que ofrece mayor calidad pero requiere mucho mas memoria. Se recomienda consultar los benchmarks del modelo base en su repositorio oficial para una comparativa con otros modelos.

## Limitaciones y advertencias

- Cuantizacion agresiva de baja precision: el uso de 2 bits por defecto con overrides parciales degrada la calidad del modelo en tareas complejas de razonamiento, generacion de codigo y comprension de lenguaje. Es imprescindible validar el comportamiento con los prompts y formatos de herramienta propios antes de usarlo en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente con cuantizacion agresiva. La tasa de error puede ser mayor que en el modelo base sin cuantizar.
- Dependencia de runtime especifico: el paquete solo esta validado con el runtime MLX Swift de Treeish. Otros runtimes pueden no soportar los overrides de cuantizacion por tensor o el layout MTP, lo que provocaria errores de carga o comportamiento incorrecto.
- Procedencia no reproducible: no se identifica el commit exacto del modelo base utilizado en la conversion, por lo que el paquete es una distribucion curada y fijada por bytes, no una receta reproducible.
- Idiomas no documentados: no se ha publicado informacion sobre los idiomas soportados, lo que limita su uso en aplicaciones multilingues sin pruebas previas.
- Sin benchmarks generales: no hay resultados de evaluaciones estandar (MMLU, HumanEval, etc.), por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base y la plantilla de chat (tambien Apache 2.0) cumplen con los requisitos de atribucion.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ2e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fuente de pesos cuantizados (jknlsn): https://huggingface.co/jknlsn/Qwen3.6-35B-A3B-oQ2e-mtp
- Plantilla de chat corregida (froggeric): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Distribucion alternativa con plantilla corregida (mlx-works): https://huggingface.co/mlx-works/Qwen3.6-35B-A3B-oQ2-mtp
