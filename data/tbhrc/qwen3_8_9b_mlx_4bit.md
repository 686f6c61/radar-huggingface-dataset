# tbhrc/qwen3_8_9b_mlx_4bit

## Resumen

El modelo `tbhrc/qwen3_8_9b_mlx_4bit` es una conversión a formato MLX con cuantización de 4 bits de `empero-ai/Qwen3.8-9B`, un modelo de lenguaje basado en la arquitectura Qwen3.5-9B pero desarrollado por un tercero (empero-ai) mediante destilación y fine-tuning supervisado (SFT). No se trata de un lanzamiento oficial de la serie Qwen3.8 de Alibaba, sino de una adaptación comunitaria. La conversión fue realizada con `mlx-lm` versión 0.31.2 y está pensada para ejecutarse en hardware Apple Silicon (macOS) mediante el framework MLX.

El modelo hereda las capacidades del modelo base, entre las que destacan el razonamiento (reasoning), la llamada a funciones (function calling) y el soporte para conversaciones en inglés. Aunque el nombre sugiere 9.000 millones de parámetros, los archivos `safetensors` del repositorio indican 1.399.927.296 parámetros (~1.4B), una discrepancia que conviene verificar antes de usar el modelo. El tamaño del repositorio es de 5.1 GB, coherente con una cuantización de 4 bits de un modelo de 9B original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B, no disponible detalle exacto) |
| Parámetros totales | 1.399.927.296 (según `safetensors`; el nombre sugiere 9B, discrepancia a verificar) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-9B` es una destilación de tercera parte basada en `Qwen/Qwen3.5-9B`. Según la documentación disponible, se trata de un ajuste fino supervisado (SFT) que añade capacidades de razonamiento y function calling al modelo original. No se han publicado detalles técnicos sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. La conversión a MLX no altera la arquitectura, solo el formato de pesos y la cuantización (4 bits) para reducir el uso de memoria en hardware Apple.

## Capacidades

- Generación de texto en inglés.
- Razonamiento multi-paso (indicado por la etiqueta `reasoning`).
- Function calling / tool calling (etiqueta `function-calling`).
- Soporte para agentes conversacionales (pipeline `text-generation`).
- No se confirma soporte de visión o multimodalidad, aunque el repositorio incluye la etiqueta `image-text-to-text` en Hugging Face; no se ha verificado su funcionalidad real.
- No se dispone de información sobre soporte de otros idiomas.

## Casos de uso

- **Asistentes conversacionales en inglés**: el modelo puede mantener diálogos multi-turno con razonamiento, adecuado para chatbots de atención al cliente o asistentes virtuales en entornos de habla inglesa.
- **Integración con herramientas (tool calling)**: permite conectar el modelo con APIs o funciones externas para automatizar tareas como consultas a bases de datos, envío de correos o interacción con servicios web.
- **Razonamiento y resolución de problemas**: por su capacidad de razonamiento, puede usarse en sistemas de tutoría o análisis de problemas técnicos.
- **Generación de código (soporte indirecto)**: aunque no se especifica, los modelos de la familia Qwen suelen manejar código; se puede probar para tareas de programación asistida.
- **Prototipado rápido en Apple Silicon**: al ser una conversión MLX, es ideal para ejecutar en Macs con chips M1/M2/M3 sin necesidad de GPU dedicada, facilitando experimentos en entornos de desarrollo.
- **Investigación en destilación y cuantización**: sirve como ejemplo de conversión de un modelo de 9B a 4-bit MLX, útil para estudiar pérdidas de calidad y optimización de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de comparaciones oficiales con otros modelos de tamaño similar.

## Requisitos de hardware

- **VRAM estimada**: según LLM Explorer, el modelo requiere aproximadamente 5 GB de VRAM (dato no verificado).
- **GPU recomendadas**: pensado para Apple Silicon (M1/M2/M3/M4) con MLX. No se indica compatibilidad con GPUs NVIDIA, aunque MLX es específico de Apple.
- **¿Cabe en consumer GPU?**: No aplica, ya que MLX solo funciona en hardware Apple. En cualquier caso, el tamaño reducido (1.4B parámetros reales) lo haría viable en GPUs con 4-6 GB de VRAM si se convierte a otros formatos.
- **Opciones de despliegue**: `mlx-lm` (recomendado), también se puede usar con la librería `transformers` si se convierte a otros formatos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para una comparación fiable. Se puede mencionar que existen otras conversiones MLX del mismo modelo base (por ejemplo, `SiddhJagani/Qwen3.8-9B-mlx-4Bit` y `PocketAiHub/Qwen3.8-9B-MLX`) con características similares, pero no se dispone de benchmarks comparativos. El modelo original `empero-ai/Qwen3.8-9B` es la referencia directa, pero no se han publicado métricas oficiales.

## Limitaciones y advertencias

- **No es un modelo oficial de Qwen**: `empero-ai/Qwen3.8-9B` es una destilación de terceros, no un lanzamiento de Alibaba. El nombre "Qwen3.8" puede inducir a error.
- **Discrepancia en el número de parámetros**: los archivos `safetensors` muestran ~1.4B parámetros mientras el nombre sugiere 9B. Esto puede deberse a una cuantización extrema o a un error en el registro; hay que verificar antes de usar.
- **Idioma**: solo inglés confirmado; no se garantiza un buen rendimiento en otros idiomas.
- **Sesgos y alucinaciones**: al ser un modelo destilado y cuantizado, puede presentar mayor tendencia a alucinar o a perder precisión en razonamiento complejo.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser una conversión no oficial, se recomienda revisar la licencia del modelo base original.
- **Riesgo de producción**: no se han publicado evaluaciones rigurosas; úsese con precaución en entornos críticos.

## Enlaces

- Hugging Face: https://huggingface.co/tbhrc/qwen3_8_9b_mlx_4bit
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B
- Conversión similar: https://huggingface.co/SiddhJagani/Qwen3.8-9B-mlx-4Bit
- Conversión similar: https://huggingface.co/PocketAiHub/Qwen3.8-9B-MLX
- Repositorio oficial de Qwen3.8 (serie Qwen3.5/3.6/3.8): https://github.com/QwenLM/Qwen3.8
- Nota sobre Qwen 3.8-Max: https://openlm.ai/qwen3.8/
