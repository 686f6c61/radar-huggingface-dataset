# zhangify/oalc-ds159-step125-backup-20261113

## Resumen
OALC ds159 step 125 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5` en el repositorio), con 4.539.265.536 parámetros totales según los pesos en safetensors. El nombre del repositorio indica que corresponde al paso 125 de un entrenamiento identificado internamente como `qwen35_discounted_success_tanh_sampled_kl159_thinkFalse_150step_lr1e-06_20261023_230254`, lo que sugiere un ajuste fino con una tasa de aprendizaje de 1e-6 sobre un total de 150 pasos.

El modelo no incluye optimizer state ni permite reanudar el entrenamiento de forma exacta, según advierte el propio autor en la model card. Se distribuye únicamente como material de referencia para investigación, sin evaluación de calidad ni de seguridad asociada. No se declara licencia, idiomas soportados ni contexto máximo, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por su naturaleza de checkpoint intermedio de investigación, su relevancia práctica es limitada para producción: resulta útil para reproducir experimentos, auditar el estado del entrenamiento en el paso 125 o comparar trayectorias de ajuste dentro del proyecto OALC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (etiqueta `qwen3_5`), transformer multimodal image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 18,2 GB) |

## Arquitectura y entrenamiento
La arquitectura declarada es Qwen3.5, una familia de transformers multimodales capaz de procesar entradas de imagen y texto y generar texto (pipeline `image-text-to-text`). El checkpoint contiene pesos, tokenizador y configuración del modelo, pero no optimizer state, por lo que no admite reanudación exacta del entrenamiento. El identificador del entrenamiento (`qwen35_discounted_success_tanh_sampled_kl159_thinkFalse_150step_lr1e-06_20261023_230254`) apunta a un ajuste fino de 150 pasos con learning rate 1e-6, con variantes de muestreo y una función de pérdida tipo KL con descuento y tanh, y con el modo "think" desactivado (`thinkFalse`).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de lo que implica la arquitectura base Qwen3.5.

## Capacidades
- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text).
- Procesamiento multimodal: entrada de imágenes junto con instrucciones en lenguaje natural.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo mediante la infraestructura de inferencia de Hugging Face.
- Modo "think" desactivado según el identificador del entrenamiento, por lo que no se espera un modo de razonamiento explícito extendido.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso
- Reproducción de experimentos de investigación: el checkpoint permite cargar el estado exacto del paso 125 de un entrenamiento concreto para comparar curvas de aprendizaje o validar configuraciones de ajuste fino.
- Auditoría de trayectorias de entrenamiento: al conservar pesos, tokenizador y configuración, se puede inspeccionar cómo evoluciona el modelo en un punto intermedio del ajuste (paso 125 de 150).
- Evaluación comparativa de checkpoints intermedios: útil para estudiar el efecto de la tasa de aprendizaje 1e-6 y del esquema de pérdida KL con descuento sobre el comportamiento multimodal.
- Pruebas de pipelines multimodales image-text-to-text: sirve como banco de pruebas para validar integraciones con `transformers` y endpoints compatibles antes de usar un modelo final.
- Docencia y formación: ejemplo práctico de cómo se publica un checkpoint de investigación con metadatos de procedencia (`backup_provenance.json`) y checksums.
- Verificación de integridad de pesos: los checksums del archivo de procedencia permiten comprobar la reproducibilidad de la descarga en entornos de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precisión nativa (probablemente bf16/fp16): en torno a 9-10 GB solo para pesos, más memoria para activaciones y caché KV; con contexto largo o imágenes de alta resolución, el consumo puede superar los 16 GB.
- Cuantización a 8 bits: aproximadamente 4,5-5 GB de pesos, con margen adicional para el resto del grafo.
- Cuantización a 4 bits: en torno a 2,3-2,5 GB de pesos, viable en GPUs de consumo con 8 GB o más, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegues de investigación a gran escala; RTX 4090 (24 GB) para inferencia en precisión nativa con margen; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en configuraciones de 16-24 GB en bf16/fp16, y en 8-12 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OALC ds159 step 125 (este) | 4.539 M | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B (referencia de la familia) | ~3.750 M | 32.768 tokens (configuración típica de la familia) | Apache 2.0 (según la familia Qwen) | Hugging Face, ampliamente distribuido |
| Qwen2.5-VL-7B (referencia de la familia) | ~8.300 M | 32.768 tokens (configuración típica de la familia) | Apache 2.0 (según la familia Qwen) | Hugging Face, ampliamente distribuido |
| LLaVA-OneVision-7B (referencia multimodal) | ~8.000 M | 32.768 tokens (configuración típica) | Apache 2.0 (según el proyecto LLaVA) | Hugging Face, ampliamente distribuido |

Nota: los datos de los modelos comparativos corresponden a configuraciones públicas habituales de sus familias y no se han verificado contra la información de esta ficha; se incluyen solo como orientación de categoría.

## Limitaciones y advertencias
- Checkpoint de investigación sin evaluación de calidad ni de seguridad: el autor indica explícitamente que la subida no implica ninguna garantía de rendimiento.
- No admite reanudación exacta del entrenamiento al carecer de optimizer state.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe.
- Longitud de contexto no declarada: no se puede planificar su uso en escenarios de contexto largo.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Riesgo de sobreajuste al dataset de ajuste fino del proyecto OALC, dado que es un checkpoint intermedio de 150 pasos.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requiere cuantización manual.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/zhangify/oalc-ds159-step125-backup-20261113
- Archivo de procedencia citado en la model card: `backup_provenance.json` (incluido en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
