# Vishva007/Qwen3.5-2B-NVFP4

## Resumen

Vishva007/Qwen3.5-2B-NVFP4 es una versión cuantizada en NVFP4 del modelo base Qwen/Qwen3.5-2B, publicada por el usuario Vishva007 en Hugging Face. La cuantización se ha realizado con AutoRound, el método de cuantización basado en descenso de gradiente con signo desarrollado por Intel, y se ha exportado en formato `compressed-tensors` (esquema `llm_compressor`). El objetivo es reducir el peso de los pesos a 4 bits (W4A16) manteniendo las activaciones en 16 bits para preservar la fidelidad numérica, lo que facilita el despliegue en GPUs con memoria limitada.

El modelo conserva la torre de visión en BF16 y mantiene en bfloat16 nativo los módulos `linear_attn`, `mtp` y `mtp.fc`, de modo que las capacidades multimodales (image-text-to-text) y la decodificación especulativa mediante Multi-Token Prediction (MTP) no sufren regresiones tras la cuantización. Está pensado para servir con vLLM, con soporte de tool calling, caché de prefijos, prefill troceado y decodificación especulativa.

Con 2.213.241.664 parámetros totales y un repositorio de 3,1 GB, se posiciona como una opción compacta para inferencia multimodal y razonamiento en entornos de producción con requisitos moderados de VRAM. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal y módulos MTP; detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio con vLLM usa `--max-model-len 18000` |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4 con grupo de tamaño 16, simétrico; activaciones 16 bits); torre visual en BF16; `linear_attn`, `mtp` y `mtp.fc` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (esquema `llm_compressor`) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-2B es un transformer multimodal de la familia Qwen3.5, con pipeline `image-text-to-text` y capacidad de razonamiento. La model card del modelo cuantizado no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados, por lo que esos datos no están disponibles. Sí se confirma la presencia de módulos de atención lineal (`linear_attn`) y de Multi-Token Prediction (`mtp`, `mtp.fc`), que se han preservado en bfloat16 durante la cuantización para no degradar la decodificación especulativa ni los mecanismos de atención.

La cuantización se realizó con AutoRound bajo el esquema NVFP4, con grupo de tamaño 16, simetría activada, 1000 iteraciones, 512 muestras de calibración, batch size 4 y longitud de secuencia 2048. La torre visual se mantiene en BF16 (etiquetada como `quant_nontext_module`) para conservar la precisión en razonamiento visual y OCR. La innovación técnica destacable es la preservación de los pesos nativos del draft de MTP, lo que permite usar decodificación especulativa con `num_speculative_tokens` ajustable entre 1 y 3 sin degradación del drafting.

## Capacidades

- Generación de texto y razonamiento conversacional (tags `text-generation`, `reasoning`, `conversational`).
- Procesamiento multimodal image-text-to-text: entrada de imágenes junto con texto.
- Tool calling / function calling, con parser `qwen3_coder` en vLLM y `--enable-auto-tool-choice`.
- Decodificación especulativa mediante Multi-Token Prediction (MTP) para acelerar el throughput.
- Modo thinking configurable a través de la plantilla de chat (`enable_thinking`), desactivado por defecto en el ejemplo de servicio.
- Soporte de prompts multimodales múltiples: el ejemplo de vLLM limita a 50 imágenes por prompt y usa `max_pixels` de 10.485.760.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno combinando texto e imágenes, adecuado para interfaces de atención al cliente que reciben capturas o fotos del usuario.
- Extracción de información de documentos e imágenes (OCR y comprensión visual): al conservar la torre visual en BF16, mantiene precisión en tareas de lectura de texto en imágenes, útil para digitalización de facturas o formularios.
- Generación de código asistida con tool calling: integrable en pipelines de CI/CD o IDE mediante el parser `qwen3_coder` de vLLM para invocar herramientas y ejecutar acciones.
- Agentes multi-paso: la combinación de razonamiento, tool calling y MTP permite construir agentes que planifican y ejecutan llamadas a funciones con baja latencia.
- Servicio de inferencia de alto throughput: el uso de NVFP4 reduce el peso de los pesos a 4 bits, lo que permite servir el modelo en GPUs con menos VRAM y aumentar el número de secuencias concurrentes (`--max-num-seqs 128` en el ejemplo).
- Prototipado e investigación en cuantización: sirve como referencia de cómo aplicar AutoRound NVFP4 a un modelo multimodal preservando módulos críticos en BF16.
- Despliegue en entornos con memoria limitada: al ocupar el repositorio 3,1 GB, es viable en GPUs de consumo para inferencia con cuantización de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 3,1 GB; con pesos NVFP4 y activaciones en 16 bits, se estima un uso de VRAM en el rango de 4 a 8 GB para el modelo, más la caché KV (configurada en `fp8` en el ejemplo) y el procesamiento de imágenes.
- GPU recomendadas: el ejemplo de servicio con vLLM usa `--gpu-memory-utilization 0.90` y `--dtype bfloat16`; es compatible con GPUs que soporten NVFP4 (arquitecturas recientes de NVIDIA). No se especifican modelos concretos en la información disponible.
- GPU de consumo: por el tamaño del repositorio (3,1 GB), es plausible en GPUs de consumo con al menos 8 GB de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: vLLM es el backend documentado, con soporte de tool calling, MTP, caché de prefijos, prefill troceado y opciones multimodales. No se documentan otros backends (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles; la model card indica que MTP acelera el throughput mediante decodificación especulativa, con `num_speculative_tokens` ajustable entre 1 y 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/Qwen3.5-2B-NVFP4 | 2.213.241.664 | no disponible | NVFP4 W4A16 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | BF16 (original) | no disponible | Hugging Face |
| Vishva007/Qwen3.5-2B-W4A16-AutoRound-NVFP4 | no disponible | no disponible | W4A16 AutoRound NVFP4 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación de precisión frente al modelo base en BF16, aunque AutoRound está diseñado para minimizarla; no se aportan métricas de evaluación que lo confirmen.
- La torre visual y los módulos `linear_attn`, `mtp` y `mtp.fc` se mantienen en BF16, por lo que el ahorro de memoria es parcial respecto a una cuantización completa.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento multilingüe homogéneo.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgo o alucinación en la información disponible.
- El ejemplo de servicio limita a 50 imágenes por prompt y usa `max_pixels` de 10.485.760; configuraciones superiores pueden no estar soportadas.
- El modo thinking está desactivado por defecto en el ejemplo de vLLM (`enable_thinking: false`); su activación puede alterar latencia y calidad de respuesta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-2B debe verificarse por separado para confirmar compatibilidad.
- El modelo tiene solo 71 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-2B-NVFP4
- Repositorio de archivos: https://huggingface.co/Vishva007/Qwen3.5-2B-W4A16-AutoRound-NVFP4/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- AutoRound (Intel): https://github.com/intel/auto-round
