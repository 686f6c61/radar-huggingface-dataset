# treeish/Qwen3.5-4B-oQ4e-MTP-MLX

## Resumen

Este paquete es una distribución cuantizada del modelo Qwen3.5-4B, un modelo de visión-lenguaje denso de 4 mil millones de parámetros desarrollado por Qwen. La versión publicada por treeish combina una cuantización oQ4e de precisión mixta (4 bits con overrides de 5 y 6 bits por tensor) con la torre de visión completa y un head embebido de Multi-Token Prediction (MTP), todo en formato MLX safetensors. El paquete está diseñado para el runtime MLX Swift de Treeish y se utiliza en su agente de codificación Sprig.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo multimodal de 4B con una ventana de contexto de 262 144 tokens en hardware Apple Silicon con memoria unificada, manteniendo una velocidad de generación aceptable (74,6 tokens/s en un M4 Max de 36 GB según las pruebas del autor). Al estar basado en Apache 2.0, es libre para uso comercial y de investigación. El paquete incluye una plantilla de chat corregida (Froggeric v21.3) y un manifiesto de integridad con hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje (Qwen3.5-4B) |
| Parametros totales | 4B (segun model card; el archivo safetensors contiene 1 057 525 248 parametros cuantizados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ4e (4-bit affine, group size 64, con overrides por tensor de 5 y 6 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (un unico shard de 3 265 391 616 bytes) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer denso de 4B parametros con capacidades de vision y lenguaje. Este paquete no anade entrenamiento nuevo; es una cuantizacion oQ4e realizada con oMLX 0.5.3, que utiliza una matriz de importancia (imatrix) calibrada con el dataset `oqe_code_multilingual` (128 muestras, longitud de secuencia 512). La cuantizacion aplica 4 bits por defecto con grupo de 64, pero ciertos tensores se sobrescriben a 5 o 6 bits para preservar la precision en capas criticas.

El paquete incluye la torre de vision completa (297 tensores) y un head MTP embebido (29 tensores) bajo `language_model.mtp.*`. El MTP permite predecir multiples tokens por paso, aunque en las pruebas del autor no mejoro la velocidad en el hardware utilizado. La plantilla de chat es la version unificada v21.3 de Froggeric, que corrige problemas de formato en el modelo base. No se especifica el commit exacto del modelo base utilizado para la conversion, por lo que la reproducibilidad byte a byte no esta garantizada.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo Qwen3.5-4B, incluyendo comprension de lenguaje natural y generacion de codigo.
- Vision: al incluir la torre de vision, puede procesar imagenes y texto (pipeline `image-text-to-text`).
- Tool calling: el head MTP embebido permite generar llamadas a herramientas estructuradas, como se valido con la llamada `search_text` en las pruebas de Treeish.
- Soporte de agentes: disenado para el flujo de trabajo de Sprig, un agente de codificacion que requiere edicion de archivos con formato exacto y llamadas a herramientas.
- Multi-step reasoning: no se menciona explicitamente, pero al ser un modelo de 4B con contexto largo, puede mantener conversaciones multi-turno y razonamiento encadenado.
- Multilingue: no especificado, aunque el dataset de calibracion es `code_multilingual`, lo que sugiere soporte para multiples idiomas en codigo, pero no esta confirmado.

## Casos de uso

- Agente de codificacion local: Sprig utiliza este modelo para editar archivos de codigo con un formato de edicion de cadena exacta. En las pruebas, produjo 7 ediciones exactas y 9 estructuralmente validas de 12 fixtures, lo que lo hace util para tareas de refactorizacion automatizada en entornos sin conexion.
- Asistente de programacion con vision: gracias a la torre de vision, puede analizar capturas de pantalla de interfaces, diagramas o errores visuales y generar codigo o sugerencias de correccion.
- Generacion de codigo en produccion con contexto largo: su ventana de 262 144 tokens permite procesar repositorios completos o archivos grandes, facilitando tareas como generacion de tests, documentacion o parches.
- Prototipado de agentes con tool calling: el head MTP integrado permite experimentar con agentes que necesitan invocar funciones (busqueda, calculo, etc.) sin requerir un servidor externo.
- Investigacion en cuantizacion MLX: el paquete sirve como referencia para estudiar el impacto de la cuantizacion oQ4e con imatrix en modelos multimodales, ya que incluye manifiesto de integridad y configuracion detallada.
- Despliegue en hardware Apple Silicon con memoria limitada: al ocupar 3,3 GB y requerir 16 GB de memoria unificada, es viable en MacBooks con M-series, lo que permite desarrollo local de IA sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo proporciona datos de rendimiento de un fixture interno en un M4 Max de 36 GB, que se resumen a continuacion. Estos datos no son comparables con benchmarks estandar y corresponden a una unica maquina.

| Prueba | Resultado |
|---|---|
| Velocidad sin MTP (fixture de 1066 tokens) | 74,6 tokens/s |
| Velocidad con MTP bloque 2 | 67,9 tokens/s |
| Velocidad con MTP bloque 3 | 66,4 tokens/s |
| Velocidad con MTP bloque 4 | 64,1 tokens/s |
| Ediciones exactas (formato Sprig) | 7 de 12 fixtures |
| Ediciones estructuralmente validas | 9 de 12 fixtures |

## Requisitos de hardware

- Memoria: 16 GB de memoria unificada como minimo (segun Treeish). Para contexto largo o multiples aplicaciones, se recomienda 36 GB o mas.
- GPU: no requiere GPU discreta; funciona en Apple Silicon (M-series) con el runtime MLX Swift. Validado en M4 Max de 36 GB.
- Compatibilidad: el paquete esta disenado para el runtime MLX Swift de Treeish. Otros runtimes deben soportar los overrides de cuantizacion por tensor en `config.json` y el layout MTP embebido.
- Opciones de despliegue: MLX Swift (recomendado), posiblemente MLX Python, aunque no se menciona. No es compatible con CUDA ni ROCm.
- Latencia y throughput: 74,6 tokens/s en el fixture de 1066 tokens en M4 Max. El MTP no mejora la velocidad en este hardware, por lo que puede desactivarse.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El paquete es una cuantizacion especifica de Qwen3.5-4B, y no se han publicado comparaciones con otras cuantizaciones (por ejemplo, GGUF o AWQ) ni con modelos de tamano similar. Se recomienda consultar el modelo base Qwen3.5-4B para comparaciones de capacidad, y las herramientas de cuantizacion estandar (llama.cpp, vLLM) para alternativas de formato.

## Limitaciones y advertencias

- Cuantizacion de baja precision: al ser 4 bits con overrides parciales, se sacrifica calidad del modelo en comparacion con la version completa. Los usuarios deben validar el rendimiento con sus propias cargas de trabajo.
- Dependencia del runtime: el paquete esta validado solo con el runtime MLX Swift de Treeish. Otros entornos pueden no soportar los overrides de cuantizacion o el layout MTP, lo que provocaria errores de carga o comportamiento incorrecto.
- Reproducibilidad limitada: no se especifica el commit exacto del modelo base Qwen3.5-4B utilizado para la conversion, por lo que no es posible reproducir byte a byte la cuantizacion.
- Sesgos y alucinaciones: no se han documentado sesgos especificos, pero como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de codigo o razonamiento complejo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.5-4B tambien este bajo Apache 2.0 (segun la model card, lo esta). No se incluyen restricciones adicionales.
- Rendimiento variable: los datos de velocidad son de una unica maquina y fixture; no representan el rendimiento general en otros hardware o cargas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/treeish/Qwen3.5-4B-oQ4e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fuente de la cuantizacion (TheWirelessPhoenix): https://huggingface.co/TheWirelessPhoenix/Qwen3.5-4B-oQ4e-mtp
- Plantilla de chat (Froggeric): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
