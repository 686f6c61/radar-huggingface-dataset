# XinyueWangg/ENIGMA-1.7B

## Resumen

ENIGMA-1.7B es un modelo unificado de lenguaje y series temporales desarrollado por Xinyue Wang, que combina un backbone de lenguaje Qwen3-1.7B con un experto en series temporales TimesFM 2.5 de 200M de parámetros, integrados mediante un mecanismo de routing de tokens mixtos intercalados. El nombre "1.7B" hace referencia al tamaño del backbone lingüístico, pero el modelo completo contiene 2.497.200.576 parámetros (aproximadamente 2,50B) y se distribuye en formato BF16. Su objetivo es resolver tareas de predicción de series temporales y generación de texto de forma conjunta, permitiendo prompts mixtos que combinan instrucciones en lenguaje natural con datos numéricos históricos. La relevancia actual radica en la creciente demanda de modelos que integren razonamiento lingüístico con análisis cuantitativo, especialmente en dominios como finanzas, operaciones y monitorización de sensores. El modelo admite un contexto máximo de 40.960 tokens y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Qwen3-1.7B (transformer decoder) + TimesFM 2.5 200M (experto en series temporales) con routing de tokens mixtos intercalados |
| Parametros totales | 2.497.200.576 (aproximadamente 2,50B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | BF16 (único formato documentado) |
| Idiomas soportados | No disponible (no se especifica en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

ENIGMA-1.7B emplea una arquitectura híbrida que combina un modelo de lenguaje autoregresivo (Qwen3-1.7B) con un experto en series temporales (TimesFM 2.5, 200M de parámetros). El mecanismo de integración se basa en un routing de tokens mixtos intercalados, que permite alternar entre representaciones textuales y numéricas dentro de una misma secuencia. Esta aproximación facilita que el modelo procese prompts que contengan tanto instrucciones en lenguaje natural como secuencias de valores temporales, generando respuestas textuales y predicciones numéricas de forma coherente. No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La model card indica que el contexto máximo es de 40.960 tokens, aunque el entrenamiento se realizó con contextos sustancialmente más cortos, lo que puede afectar al rendimiento en secuencias muy largas.

## Capacidades

- Generación de texto en lenguaje natural, incluyendo explicaciones y razonamiento sobre conceptos estadísticos o de series temporales.
- Predicción de series temporales (forecasting) a partir de una secuencia histórica de valores, con un horizonte configurable.
- Procesamiento de prompts mixtos que combinan texto y series numéricas en una misma entrada, gracias al routing de tokens intercalados.
- Soporte para inferencia multimodal (texto + series temporales) mediante el `EnigmaProcessor`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso explícito ni soporte de visión o audio.

## Casos de uso

- Previsión de demanda en retail: el modelo puede predecir ventas futuras a partir de series históricas de ventas, combinando instrucciones en lenguaje natural como "estime la demanda para los próximos 7 días" con los datos de entrada.
- Análisis financiero automatizado: permite generar informes que interpretan tendencias de precios o indicadores económicos, integrando la serie temporal y produciendo texto explicativo junto con las predicciones.
- Mantenimiento predictivo en entornos industriales: a partir de lecturas de sensores (temperatura, vibración, etc.), el modelo puede anticipar fallos y generar recomendaciones en lenguaje natural.
- Monitorización de métricas de sistemas: para equipos de operaciones, puede predecir la evolución de métricas como uso de CPU o latencia, y emitir alertas descriptivas.
- Asistente de análisis de datos para analistas no técnicos: permite formular preguntas en lenguaje natural sobre series temporales y obtener respuestas numéricas y textuales sin necesidad de programación.
- Generación de informes periódicos: el modelo puede combinar datos históricos de ventas, tráfico web u otras métricas para producir resúmenes ejecutivos con proyecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realiza ninguna afirmación de rendimiento y remite a una futura publicación de investigación para conocer las tareas evaluadas y los protocolos utilizados.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 5 GB (2,5B parámetros × 2 bytes). Con overhead de inferencia y activaciones, se recomienda al menos 8 GB de VRAM para ejecución en GPU.
- GPUs compatibles: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores, así como en GPUs de datacenter como A100 o H100.
- Para inferencia mixta (texto + series temporales) se requiere una GPU CUDA con FlashAttention 2 instalado (versión probada: `flash-attn==2.8.3`).
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp u Ollama; el código personalizado sugiere que el despliegue está orientado a entornos Python con PyTorch.
- Latencia y throughput: no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (modelos unificados de lenguaje y series temporales). Aunque TimesFM y Qwen3 son componentes del modelo, no son alternativas directas. Se recomienda consultar la futura publicación de investigación de ENIGMA para obtener comparaciones con modelos como Chronos, Moirai o Lag-Llama, pero no se dispone de datos en la documentación actual.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas específicas es desconocido.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del autor; se debe revisar el código antes de usarlo en entornos de producción.
- El procesador público maneja una única solicitud a la vez y una sola serie histórica cuando se solicita un horizonte de predicción, lo que limita el procesamiento por lotes.
- El contexto máximo es de 40.960 tokens, pero el entrenamiento se realizó con contextos más cortos; el rendimiento puede degradarse en secuencias largas.
- Los pronósticos generados son salidas del modelo y no constituyen garantías calibradas ni asesoramiento profesional.
- No se especifican los idiomas soportados; aunque Qwen3 es multilingüe, no se confirma para este modelo.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado y las dependencias (FlashAttention 2) pueden requerir consideraciones adicionales de mantenimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/XinyueWangg/ENIGMA-1.7B)
- [Perfil del autor en Hugging Face](https://huggingface.co/XinyueWangg/models)
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
