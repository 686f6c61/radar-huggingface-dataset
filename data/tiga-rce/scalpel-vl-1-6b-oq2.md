# TiGa-RCE/Scalpel-VL-1.6B-oQ2

## Resumen

Scalpel-VL-1.6B-oQ2 es una cuantización de 2 bits del modelo multimodal Qwen3-VL, realizada por el usuario TiGa-RCE mediante la herramienta oQ (oMLX) en su versión 0.6.3rc3. El modelo está diseñado para ejecutarse en hardware Apple Silicon a través del framework MLX, y su objetivo principal es ofrecer una versión ligera y eficiente de un modelo de visión-lenguaje para entornos con recursos limitados. A pesar de que el nombre sugiere 1.6 mil millones de parámetros, los pesos reales en safetensors suman 551.360.256 parámetros, lo que indica una discrepancia que no se explica en la documentación disponible.

La relevancia de este modelo radica en su formato de cuantización mixta de 2 bits con group size 64, que permite reducir drásticamente el tamaño del modelo (1.3 GB en el repositorio) manteniendo un rendimiento aceptable para tareas de inferencia en dispositivos Apple. Al ser una cuantización de un modelo Qwen3-VL, hereda las capacidades multimodales del modelo base, aunque no se proporcionan detalles sobre el entrenamiento original ni sobre los datos utilizados. Es un artefacto claramente experimental, como indica el perfil del autor, y no cuenta con métricas de rendimiento publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (transformer multimodal) |
| Parametros totales | 551.360.256 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización de un modelo base Qwen3-VL, que emplea una arquitectura transformer multimodal diseñada para procesar tanto texto como imágenes. La cuantización se realizó con la herramienta oQ de oMLX, que aplica una estrategia de precisión mixta: los pesos se reducen a 2 bits con un group size de 64, lo que permite un ahorro significativo de memoria y almacenamiento. No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ni sobre posibles innovaciones técnicas adicionales. La model card solo documenta el proceso de cuantización, no el modelo subyacente.

## Capacidades

- Al ser una variante de Qwen3-VL, se espera que herede capacidades de comprensión de imágenes y generación de texto, aunque no se confirma explícitamente en la documentación.
- Soporte de entrada multimodal (imagen + texto) según la arquitectura declarada.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica soporte multilingüe específico para esta cuantización.
- No se mencionan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Inferencia multimodal en dispositivos Apple Silicon: el modelo está optimizado para MLX, por lo que puede ejecutarse en Macs con chip M1 o superior, aprovechando la memoria unificada para tareas de visión por computadora ligera.
- Prototipado rápido de aplicaciones de visión-lenguaje: su tamaño reducido (1.3 GB) permite cargarlo en entornos de desarrollo sin necesidad de GPUs dedicadas.
- Clasificación y descripción de imágenes en entornos con restricciones de hardware: por su baja huella de memoria, es adecuado para pruebas en dispositivos edge o en aplicaciones que requieren respuestas rápidas.
- Experimentación con cuantización extrema: sirve como referencia para estudiar el impacto de la cuantización de 2 bits en modelos multimodales, especialmente en el ecosistema MLX.
- Despliegue en aplicaciones de asistencia visual en tiempo real: aunque no hay benchmarks, la baja latencia esperada en Apple Silicon podría permitir su uso en demos o asistentes personales.
- Educación e investigación: como artefacto de código abierto, puede utilizarse para enseñar técnicas de cuantización y despliegue de modelos en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio (1.3 GB) sugiere que la inferencia puede realizarse con menos de 2 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de RAM unificada.
- Compatibilidad con GPU de consumo: no aplicable, ya que el formato MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: MLX, oMLX (que incluye oQ para cuantización), y posiblemente integración con frameworks como llama.cpp si se convierte a GGUF, aunque no se indica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Cuantización de 2 bits: la pérdida de precisión es significativa y puede afectar gravemente a la calidad de las respuestas, especialmente en tareas de razonamiento complejo o comprensión visual detallada.
- Licencia no especificada: no se indica la licencia del modelo, lo que supone un riesgo legal para su uso comercial.
- Sin documentación sobre sesgos o alucinaciones: no hay información sobre posibles sesgos del modelo base ni sobre su comportamiento en escenarios adversos.
- Modelo experimental: el autor lo etiqueta como artefacto de calibración experimental, lo que implica que no está pensado para producción.
- Discrepancia en el número de parámetros: el nombre indica 1.6B pero los pesos reales son 551M, lo que puede deberse a un error de nomenclatura o a una versión destilada no documentada.
- Fecha de creación futura (2026): el modelo fue subido en agosto de 2026, lo que sugiere que es muy reciente y no ha sido probado ampliamente.

## Enlaces

- [HuggingFace - TiGa-RCE/Scalpel-VL-1.6B-oQ2](https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ2)
- [Perfil del autor en HuggingFace](https://huggingface.co/TiGa-RCE)
- [Repositorio oQ (oMLX)](https://github.com/jundot/omlx)
