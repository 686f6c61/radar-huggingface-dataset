# topcatmax/albedo-arc-dora7-v16

## Resumen

Albedo Arc Dora7 v16 es un modelo multimodal de 34 660 millones de parámetros desarrollado por topcatmax (Bojan Terzic), publicado en Hugging Face con licencia Apache 2.0. Forma parte de la línea Albedo SN97, una serie de modelos locales que buscan competir con sistemas de razonamiento propietarios. Este modelo concreto es la iteración v16, entrenada mediante DPO sobre prefijos de fallos en vivo, como dobles envíos vacíos o problemas con comandos `sed && echo`, lo que lo orienta a tareas de depuración y corrección de errores en código.

El modelo está basado en `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, que a su vez deriva de la serie Qwen3.5. Utiliza arquitectura MoE (mixture of experts) y soporta entrada multimodal (imagen y texto). La model card indica que no es una sumisión en cadena, que el `check-model` valida localmente y que la evaluación de política one-turn obtiene 22/30. El autor recomienda conservar la versión v11 para calidad de duelo, y advierte explícitamente contra el uso de la v17 por regresión DPO.

El modelo está disponible en formato safetensors (69,3 GB en el repositorio), con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Es una opción relevante para desarrolladores que necesitan un modelo multimodal de 35B con capacidades de razonamiento y depuración de código, especialmente en entornos donde el control de calidad local es crítico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture of experts) |
| Parámetros totales | 34 660 610 688 (34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 MoE, una mezcla de expertos con atención eficiente, optimizada para razonamiento y generación de código. El modelo base es `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, sobre el que se aplicó una cadena de entrenamiento secuencial: SFT de v8 a v11, posteriormente SFT de v13 y v15, y finalmente DPO en v16. El entrenamiento DPO se realizó específicamente sobre "prefijos de fallos en vivo", es decir, errores de ejecución reales como doble envío vacío, fallos de `sed && echo` y problemas con `grep-is-not-work`. Esta elección de datos busca mejorar la capacidad del modelo para diagnosticar y corregir errores de programación en tiempo real.

No se dispone de información sobre el número total de tokens de entrenamiento, composición del dataset ni técnicas adicionales como RLHF. El modelo es multimodal (imagen-texto), lo que sugiere que el entrenamiento incluyó datos visuales, aunque no se especifica la proporción. La arquitectura MoE permite activar solo una parte de los parámetros durante la inferencia, aunque no se detalla el número de expertos ni el factor de activación.

## Capacidades

- Generación de texto y razonamiento conversacional, orientado a diálogos multi-turno.
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Soporte de tool calling y function calling, típico de la serie Qwen3.5.
- Capacidad de depuración de errores de shell y código, gracias al entrenamiento en fallos reales.
- Capacidad de razonamiento multi-step y uso de agentes, aunque no se detalla si hay un modo de pensamiento explícito.
- Multilingüismo no confirmado; la ficha no especifica idiomas soportados.

## Casos de uso

- Depuración de pipelines de CI/CD: el modelo puede analizar logs de ejecución y sugerir correcciones para fallos como dobles envíos o errores de `sed`, gracias a su entrenamiento DPO en prefijos de fallos reales.
- Asistente de desarrollo local: integrable en IDE o CLI para ayudar a diagnosticar errores de comandos y scripts, usando su capacidad de razonamiento sobre errores de shell.
- Análisis de código en producción: puede revisar commits o pull requests para detectar patrones de error comunes, como `grep` mal utilizado o fallos de encadenamiento de comandos.
- Agente de automatización de tareas: con soporte de tool calling, puede ejecutar comandos y corregir errores de forma autónoma en entornos controlados.
- Chatbot técnico con contexto multimodal: al soportar imágenes, puede interpretar capturas de pantalla de errores o diagramas de arquitectura para responder consultas técnicas.
- Evaluación de calidad de modelos: dado que el autor menciona "check-model VALID locally", puede usarse como referencia en pipelines de evaluación de modelos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación "Policy one-turn eval 22/30", que sugiere un rendimiento moderado en tareas de política de un solo turno, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. No se pueden comparar con otros modelos sin datos fiables.

## Requisitos de hardware

- VRAM estimada: con 34,66B parámetros, la inferencia en FP16 requeriría aproximadamente 70 GB de VRAM. Con cuantización de 8 bits, se podría reducir a ~35 GB; con 4 bits, ~18 GB.
- GPUs recomendadas: para FP16, se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con batch reducido). Para cuantización 8-bit, una RTX 4090 de 24 GB podría ser suficiente en modo de baja precisión.
- No cabe en GPUs de consumo de gama media (8-12 GB) sin cuantización agresiva.
- Opciones de despliegue: al usar transformers, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI. También se puede usar con el pipeline de transformers directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Albedo Arc Dora7 v16 | 34,66B (MoE) | no disponible | Apache-2.0 | Hugging Face |
| Qwen3.5-35B (base) | 35B | no disponible | Apache-2.0 | Hugging Face |
| Llama 3.1 35B (hipotético) | 35B | 128K | Meta Llama | Hugging Face |

No se dispone de datos comparativos de rendimiento para estos modelos. El modelo se posiciona como un "challenger" local frente a modelos propietarios de razonamiento, pero no hay benchmarks públicos que lo respalden.

## Limitaciones y advertencias

- El autor advierte explícitamente que no se use la versión v17 (recat-overweight DPO regression); la v16 es la versión recomendada.
- La evaluación one-turn es de 22/30, lo que indica que puede fallar en tareas de razonamiento complejo.
- No se dispone de información sobre sesgos o alucinaciones; el entrenamiento sobre fallos de código puede llevar a sobreajustar ciertos patrones.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones de atribución.
- No se han publicado benchmarks estándar, lo que dificulta la evaluación objetiva de su rendimiento.
- El modelo es multimodal, pero no se especifican los idiomas soportados, lo que puede limitar su uso en entornos multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/topcatmax/albedo-arc-dora7-v16
- Perfil del autor: https://huggingface.co/topcatmax
- Modelo base: https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-genesis
- Otro modelo del autor: https://huggingface.co/topcatmax/albedo-arc-kumaresano-bk17
