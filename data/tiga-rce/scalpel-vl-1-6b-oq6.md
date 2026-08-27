# TiGa-RCE/Scalpel-VL-1.6B-oQ6

## Resumen

Scalpel-VL-1.6B-oQ6 es una cuantización en 6 bits del modelo de visión-lenguaje Scalpel-VL-1.6B, publicada por el usuario TiGa-RCE en Hugging Face. El modelo base utiliza la arquitectura qwen3_vl de la familia Qwen3-VL, y esta versión está optimizada para ejecutarse en dispositivos Apple mediante el framework MLX. La cuantización se ha realizado con la herramienta oQ de oMLX v0.6.3rc3, empleando precisión mixta con un tamaño de grupo de 64.

El propósito de esta publicación es ofrecer una versión reducida del modelo para facilitar su despliegue en entornos con recursos limitados, como portátiles con chips Apple Silicon. Aunque el modelo base no está documentado en la información proporcionada, su nombre sugiere un tamaño de 1,6 mil millones de parámetros, aunque los pesos cuantizados en safetensors contienen 690 591 488 parámetros. La relevancia actual de este modelo radica en la creciente demanda de modelos multimodales ligeros y ejecutables localmente, y en la disponibilidad de herramientas de cuantización maduras como oMLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (Qwen3-VL) |
| Parametros totales | 690 591 488 (segun safetensors; el nombre sugiere 1,6B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | 6 bits, grupo de 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información proporcionada solo describe la capa de cuantización, no el entrenamiento del modelo base. La arquitectura declarada es qwen3_vl, es decir, un modelo de visión-lenguaje de la serie Qwen3-VL, que combina un codificador visual con un transformer de lenguaje. La cuantización se realizó con la librería oMLX (oQ v0.6.3rc3) en modo de precisión mixta, lo que significa que se aplican distintos niveles de reducción de bits según la sensibilidad de cada tensor, manteniendo un promedio de 6 bits por peso con un tamaño de grupo de 64. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni el proceso de ajuste (RLHF, DPO, etc.) del modelo original.

## Capacidades

- Generación de texto y respuestas a instrucciones, como es característico de la familia Qwen3-VL.
- Comprensión de imágenes y razonamiento visual (VQA, OCR, descripción de escenas) si el modelo base las soporta.
- Posibilidad de seguir instrucciones y mantener diálogos multi-turno, aunque el contexto exacto no está documentado.
- Soporte de tool calling y function calling, herencia de la arquitectura Qwen3-VL, no confirmado en esta cuantización.
- Capacidades multilingües probablemente heredadas del modelo base, pero sin datos concretos.
- No se indica soporte de agentes, modo de pensamiento, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Despliegue en dispositivos Apple Silicon: gracias al formato MLX, el modelo puede ejecutarse de forma eficiente en Macs con chips M1/M2/M3/M4, sin necesidad de GPU dedicada, lo que lo hace útil para prototipos de visión por computadora en local.
- Aplicaciones de OCR en tiempo real: si el modelo base mantiene las capacidades de Qwen3-VL, puede usarse para extraer texto de imágenes en aplicaciones móviles o de escritorio con privacidad total.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir imágenes en tiempo real desde una cámara, ayudando en tareas cotidianas.
- Automatización de documentación visual: análisis de capturas de pantalla, diagramas o formularios escaneados para extraer información estructurada en pipelines locales.
- Evaluación de modelos cuantizados: sirve como referencia para estudiar la degradación de rendimiento de la cuantización oQ de 6 bits frente a versiones de mayor precisión.
- Aprendizaje y experimentación: por su tamaño reducido, es adecuado para aprender a integrar modelos VL en aplicaciones usando MLX, sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede evaluar el rendimiento comparativo del modelo en tareas estándar como MMLU, HumanEval o VQA sin datos adicionales.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse con MLX, por lo que requiere un dispositivo con Apple Silicon (M1 o posterior) y macOS 13.0 o superior.
- La VRAM estimada para inferencia es aproximadamente 520 MB para los pesos en 6 bits, aunque el repositorio ocupa 1,9 GB (puede incluir versiones adicionales o metadatos). Se recomienda al menos 8 GB de memoria unificada para operar con comodidad.
- No es apto para GPUs NVIDIA ni AMD, ya que está compilado para MLX, aunque se puede convertir a otros formatos si se dispone del modelo base.
- Opciones de despliegue: se puede usar directamente con la librería mlx-lm de Apple, o mediante frameworks que soporten MLX, como oMLX.
- La latencia y el throughput dependen del hardware; en un MacBook con M2, se espera una velocidad de generación de entre 20 y 40 tokens por segundo, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base Scalpel-VL-1.6B para compararlo con alternativas. Dado que la arquitectura es qwen3_vl, se podría comparar con los modelos oficiales Qwen3-VL-0.6B y Qwen3-VL-4B, pero no se conocen los resultados de la cuantización oQ frente a las versiones BF16. No disponible.

## Limitaciones y advertencias

- No se ha publicado ninguna documentación sobre el modelo base, por lo que se desconocen los sesgos, la calidad del entrenamiento y las limitaciones de contexto.
- La licencia no está especificada, por lo que no se recomienda el uso comercial sin verificar la licencia del modelo base y de los pesos cuantizados.
- La cuantización de 6 bits puede introducir una degradación de la calidad respecto a la versión BF16, especialmente en tareas de razonamiento visual complejo.
- No hay garantía de que el modelo funcione correctamente con las capacidades completas de Qwen3-VL (tool calling, agentes, etc.) tras la cuantización.
- El repositorio no tiene descargas ni valoraciones, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-27) y la actualización (2026-08-27) sugieren que es una publicación muy reciente, con posible riesgo de errores o cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ6
- Perfil del autor: https://huggingface.co/TiGa-RCE
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Colección de cuantizaciones MLX del autor: https://huggingface.co/collections/TiGa-RCE/mlx-embedding-quantization-matrix-q-oq-oqe-at-4-6-8-bit
