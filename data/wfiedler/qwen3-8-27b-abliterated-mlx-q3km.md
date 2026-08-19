# wfiedler/Qwen3.8-27B-ABLITERATED-mlx-q3km

## Resumen

Qwen3.8-27B-ABLITERATED-mlx-q3km es una conversión al formato MLX del modelo base Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, cuantizado con la receta `mixed_3_4` que equivale a GGUF Q3_K_M (3.910 bits por peso). El modelo original es una variante abliterated de Qwen3.8-27B, una arquitectura multimodal densa con atención híbrida (lineal y completa cada cuarta capa) y soporte para visión, tool-calling y contexto largo. Esta conversión está pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm, y ofrece un equilibrio entre tamaño (13.4 GB en disco) y velocidad (18.9 tokens/s medidos en un Mac de 64 GB).

La relevancia de este modelo radica en su especialización para tareas de OCR y análisis de documentos e imágenes, donde el autor demuestra que la calidad es prácticamente indistinguible de la versión de 5 bits, pero con un 46% más de velocidad y 6.6 GB menos de memoria. Sin embargo, presenta una degradación notable en tareas de conteo de múltiples objetos, y al ser abliterated, no rechaza solicitudes dañinas, por lo que requiere evaluación antes de su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (`Qwen3_5ForConditionalGeneration`), multimodal, atención híbrida (lineal y completa cada 4ª capa) |
| Parametros totales | ~27.2B (según model card; el dato de safetensors de 3.99B parece incorrecto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `mixed_3_4` (equivalente a GGUF Q3_K_M), 3.910 bits por peso; vision encoder en bf16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), 3 shards, 13.4 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, una arquitectura densa multimodal de la familia Qwen con atención híbrida: alterna capas de atención lineal con capas de atención completa (cada cuarta capa usa atención completa). El modelo original fue sometido a un proceso de "abliteration" por parte de Blackfrost-AI, que elimina los comportamientos de rechazo del modelo instruct, haciendo que responda a solicitudes que un modelo estándar declinaría. La conversión a MLX se realizó con la herramienta `mlx_vlm.convert`, aplicando la cuantización `mixed_3_4`, que asigna 4 bits a los tensores sensibles (`v_proj`, `down_proj` en ciertas capas y `lm_head`) y 3 bits al resto. El vision encoder no se cuantiza y permanece en bf16. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento conversacional.
- Visión por computador: entrada de imágenes y salida de texto (image-text-to-text).
- OCR de alta precisión en recibos, tablas, gráficos, señales y texto pequeño.
- Soporte de tool-calling (según los tags del modelo).
- Soporte de contexto largo (según los tags, aunque no se especifica la longitud exacta).
- Capacidades multilingües no documentadas.
- Al ser abliterated, no presenta rechazo ante solicitudes que un modelo instruct normal declinaría.

## Casos de uso

- **OCR de documentos financieros**: el modelo extrae con precisión todos los campos de recibos (14/14 campos en las pruebas), lo que lo hace adecuado para automatizar la contabilidad o el escaneo de facturas.
- **Lectura de tablas y gráficos**: puede transcribir valores numéricos de tablas 5x5 y de gráficos de barras, útil para accesibilidad o para ingestión de datos en hojas de cálculo.
- **Procesamiento de señales y carteles**: reconoce texto en señales del mundo real, con un acierto de 3/3 en las pruebas, aplicable en sistemas de asistencia a la conducción o traducción de carteles.
- **Análisis de imágenes médicas o científicas**: identificación de especies en fotos (3/3 en pruebas), útil en biología o agricultura de precisión.
- **Asistente multimodal en Mac**: al ser una conversión MLX, se integra con mlx-vlm para ejecución local en Apple Silicon, permitiendo consultas sobre imágenes sin conexión a internet.
- **Generación de descripciones de imágenes**: puede generar texto descriptivo a partir de imágenes, útil para accesibilidad web o automatización de metadatos.

## Benchmarks y rendimiento

El autor comparó esta versión (3.910 bpw) con la versión de 5 bits (5.678 bpw) del mismo modelo base en 12 tareas con 3 repeticiones cada una, a temperatura 0.7:

| Tarea | q5 | Este modelo |
|---|---|---|
| Receipt (OCR, 14 campos) | 14/14 x3 | 14/14 x3 |
| Chart (valores de barras) | 6/6 x3 | 6/6 x3 |
| Table (celdas numéricas 5x5) | 8/8 x3 | 8/8 x3 |
| Texto pequeño (tokens raros) | 6/6 x3 | 6/6 x3 |
| Formas (10, contar 3 grupos) | 6/6 x3 | 6/6 x3 |
| Formas (20, contar 4 grupos) | 3/3 exacto | 0/3 exacto |
| Fotos (identificación de especies) | 3/3 | 3/3 |
| Señales (OCR real) | 2/3 + 1 bucle | 3/3 |
| Lógica / recuerdo (razonamiento textual) | 3/3, 3/3 | 3/3, 3/3 |

Rendimiento medido en Apple Silicon con 64 GB de memoria unificada:

| Métrica | q5 | Este modelo |
|---|---|---|
| Tamaño en disco | 18 GB | 12 GB |
| Bits por peso | 5.678 | 3.910 |
| Peso en memoria | 20.68 GB | 14.11 GB |
| Pico durante generación de imagen | 23.24 GB | 16.67 GB |
| Velocidad de generación | 12.9 tok/s | 18.9 tok/s |

## Requisitos de hardware

- Memoria unificada mínima recomendada: 16 GB para inferencia de texto; 24 GB o más para generación con imágenes (pico de 16.67 GB medido en un Mac de 64 GB).
- GPU: Apple Silicon (M1, M2, M3 o superior). No soporta GPUs NVIDIA o AMD de forma nativa.
- La cuantización a 3 bits permite ejecutarlo en Macs con 16 GB de RAM, aunque con riesgo de swapping.
- Opciones de despliegue: mlx-vlm (>= 0.6.13) para generación de texto e imagen; también puede usarse con otras herramientas que soporten MLX.
- Latencia: ~18.9 tokens/s en un Mac de 64 GB; la latencia real depende del modelo de chip y de la memoria disponible.

## Comparativa con modelos similares

La comparativa directa disponible es con la versión de 5 bits del mismo modelo base (Qwen3.8-27B-ABLITERATED-mlx-q5, no publicado en HuggingFace pero mencionado en la model card). No se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Bits/peso | Tamaño | Velocidad | Pico memoria | Casos de uso óptimos |
|---|---|---|---|---|---|
| Qwen3.8-27B-ABLITERATED-mlx-q3km | 3.910 | 13.4 GB | 18.9 tok/s | 16.67 GB | OCR, documentos, gráficos |
| Qwen3.8-27B-ABLITERATED-mlx-q5 | 5.678 | 18 GB | 12.9 tok/s | 23.24 GB | Conteo de objetos, tareas que requieren enumeración |

## Limitaciones y advertencias

- **Modelo abliterated**: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido dañino, ilegal o no ético si se le solicita. Evaluar antes de cualquier despliegue público.
- **Cuantización con pérdida**: la calidad a 3 bits no está garantizada en tareas de long-context, tool-calling o generación de código; el autor solo evaluó un subconjunto de tareas.
- **Degradación en conteo de objetos**: falla sistemáticamente al contar más de ~10 objetos dispersos (0/3 aciertos en 20 formas), mientras que la versión de 5 bits acierta 3/3.
- **Aritmética mental poco fiable**: ambos modelos fallan en cálculos de subtotales sin usar un "scratchpad".
- **Sin datos de idiomas**: no se especifican los idiomas soportados, aunque por ser una variante de Qwen probablemente cubre múltiples lenguas.
- **Dependencia de mlx-vlm**: requiere una versión reciente (>= 0.6.13) que incluya el módulo `qwen3_5`; versiones anteriores no funcionan.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base abliterated puede tener implicaciones legales o éticas según el caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wfiedler/Qwen3.8-27B-ABLITERATED-mlx-q3km
- Modelo base: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Documentación de mlx-vlm: no disponible en la información proporcionada.
