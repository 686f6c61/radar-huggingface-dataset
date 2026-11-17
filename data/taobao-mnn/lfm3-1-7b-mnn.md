# taobao-mnn/LFM3-1.7B-MNN

## Resumen

LFM3-1.7B-MNN es una conversión al formato de inferencia MNN del modelo LiquidAI/LFM3-1.7B, publicada por el equipo taobao-mnn (vinculado al repositorio oficial de MNN de Alibaba). No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución cuantizada del modelo base de Liquid AI, empaquetada para ejecutarse con el runtime MNN en CPU y, opcionalmente, en Metal sobre Apple Silicon. El objetivo es facilitar el despliegue local y en dispositivos de borde de un modelo de 1.700 millones de parámetros sin depender de GPUs dedicadas.

La conversión aplica cuantización HQQ INT4 con tamaño de grupo 64 y escalas en FP16 sobre el backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos. El repositorio ocupa aproximadamente 1 GB, lo que refleja la reducción de peso respecto a los pesos originales en precisión completa. La fecha de creación y actualización del repositorio es el 17 de noviembre de 2026, y el commit de MNN de referencia es `5085d5622`.

Es relevante porque demuestra el patrón habitual de distribución de modelos en el ecosistema MNN: conversión de pesos, cuantización mixta y validación mediante pruebas de humo en hardware de consumo. No obstante, la información publicada por el autor es escasa y se limita a los detalles de conversión, instrucciones de compilación y ejecución, y una declaración explícita de que las pruebas realizadas no constituyen una validación exhaustiva de contextos largos, idiomas o tareas de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.700 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ INT4, grupo 64, escalas FP16 (backbone, cabeza de salida y embeddings compartidos) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | MNN (modelo convertido); el repositorio incluye grafo del modelo, pesos externos, tokenizador y configuración |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base LiquidAI/LFM3-1.7B ni sus datos de entrenamiento. Lo único documentado es el proceso de conversión: se toma la revisión upstream `1da06bec6` del modelo original y se transforma al formato MNN, aplicando cuantización HQQ INT4 con grupo de 64 y escalas FP16 sobre el backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos. No se mencionan detalles sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta ficha no está en el modelo en sí, sino en el pipeline de despliegue: el runtime MNN permite ejecutar el modelo en CPU por defecto y, en Apple Silicon, cambiar el backend a Metal mediante el parámetro `backend_type` del `config.json`, manteniendo los submodelos multimedia en CPU. La compilación requiere una versión de MNN igual o posterior al commit indicado, con flags como `MNN_BUILD_LLM`, `MNN_LOW_MEMORY`, `MNN_SUPPORT_TRANSFORMER_FUSE`, `MNN_BUILD_AUDIO`, `MNN_BUILD_OPENCV` y `MNN_IMGCODECS`, lo que sugiere soporte para entradas multimodales en el modelo base, aunque la model card no lo detalla.

## Capacidades

- Generación de texto: la pipeline declarada es `text-generation`, con entradas y salidas de texto.
- Inferencia local en CPU: el runtime MNN está pensado para ejecución sin GPU, con backend Metal opcional en Apple Silicon.
- Soporte de audio y visión en el runtime: los flags de compilación `MNN_BUILD_AUDIO`, `MNN_BUILD_OPENCV` y `MNN_IMGCODECS`, junto con la mención de "media submodels" y "audio sampling settings", indican que el modelo base podría tener capacidades multimodales, aunque no se confirma en la documentación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio explícitos: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos de borde sin GPU: el formato MNN y la cuantización INT4 permiten ejecutar un modelo de 1.700 millones de parámetros en CPU con un repositorio de aproximadamente 1 GB, adecuado para entornos con memoria limitada.
- Prototipado en Apple Silicon: el backend Metal opcional permite acelerar la inferencia en Macs con chip de Apple, manteniendo los submodelos multimedia en CPU, lo que facilita pruebas de concepto locales.
- Aplicaciones de generación de texto offline: al no requerir conexión a servicios en la nube, el modelo puede integrarse en herramientas de escritorio o utilidades de línea de comandos que generen texto sin enviar datos a terceros.
- Evaluación de modelos base de Liquid AI: sirve como punto de entrada de bajo coste para estudiar el comportamiento de LFM3-1.7B antes de invertir en infraestructura con los pesos originales.
- Integración en pipelines MNN existentes: equipos que ya usan MNN para otros modelos pueden incorporar este sin cambiar de runtime, reutilizando la misma toolchain de compilación y despliegue.
- Pruebas de cuantización HQQ INT4: el repositorio documenta la configuración exacta de cuantización, lo que permite comparar la calidad de esta conversión frente a otras alternativas de cuantización del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pruebas de humo realizadas en macOS Apple Silicon con rutas `text-cpu` y `text-metal`, verificadas por separado, y advierte explícitamente que no constituyen una validación exhaustiva de contextos largos, todos los idiomas, todos los dispositivos ni tareas de agente. Las pruebas de vídeo usan fotogramas estáticos repetidos y solo validan la ruta de entrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa aproximadamente 1 GB en disco, lo que da una idea del orden de magnitud de memoria necesaria para los pesos cuantizados.
- GPU recomendadas: no se especifican; el runtime está orientado a CPU y a Metal en Apple Silicon.
- Compatibilidad con GPU de consumo: no confirmada para CUDA u otras APIs; la documentación solo menciona CPU y Metal.
- Opciones de despliegue: runtime MNN compilado desde el commit `5085d5622` o posterior, con el binario `llm_demo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MNN (esta ficha) | 1.700 M | no disponible | MNN, HQQ INT4 | LFM Open License v1.0 | Hugging Face y ModelScope |
| LiquidAI/LFM3-1.7B (base) | 1.700 M | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Hugging Face |
| Otras conversiones MNN de modelos de ~1-2 B | variable | variable | MNN | según modelo base | Hugging Face |

No se dispone de datos de rendimiento comparativo entre esta conversión y los pesos originales ni con otras alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Validación limitada: las pruebas realizadas son de humo en macOS Apple Silicon y no cubren contextos largos, todos los idiomas, todos los dispositivos ni tareas de agente.
- Idiomas no documentados: la model card no especifica qué idiomas soporta el modelo base.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos de lenguaje de esta escala.
- Sesgos: no documentados.
- Licencia: se mantiene la LFM Open License v1.0 del modelo original; es necesario revisar sus términos para uso comercial, ya que está etiquetada como "other" y no como una licencia permisiva estándar.
- Dependencia de versión: requiere compilar MNN desde el commit indicado o posterior; versiones antiguas pueden no incluir soporte para LFM3.
- Integridad de archivos: es necesario descargar el repositorio completo y mantener todos los archivos en la misma revisión para evitar incompatibilidades entre grafo, pesos, tokenizador y configuración.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan estimar la pérdida de calidad respecto a los pesos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/LFM3-1.7B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión upstream del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN de referencia: https://github.com/alibaba/MNN/commit/5085d56221b939b8fd5e52885d2a4f295c6bbcc6
- Modelo en ModelScope: https://modelscope.cn/models/MNN/LFM3-1.7B-MNN
