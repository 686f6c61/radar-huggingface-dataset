# yangfu2/coohom2nav_stepwise_500k

## Resumen

`yangfu2/coohom2nav_stepwise_500k` es un ajuste fino del modelo vision-lenguaje Qwen3-VL-8B-Instruct, publicado por Yang Fu en Hugging Face. El nombre del repositorio sugiere que el modelo fue entrenado con 500.000 ejemplos de razonamiento paso a paso (stepwise) que convierten datos de Coohom, plataforma de diseño de interiores 3D, en tareas de navegación para agentes encarnados (embodied AI). Con aproximadamente 8,77 mil millones de parámetros, se posiciona como un modelo de tamaño medio adecuado para despliegue en GPUs de consumo.

El modelo hereda las capacidades multimodales del Qwen3-VL-8B-Instruct: percepción visual avanzada, razonamiento espacial con grounding 2D y 3D, comprensión de vídeo de larga duración y capacidades de agente visual. La arquitectura incorpora Interleaved-MRoPE, DeepStack y alineación texto-marca de tiempo, con contexto nativo de 256K tokens ampliable a 1M.

Cabe destacar que la model card publicada corresponde íntegramente a la del modelo base Qwen3-VL-8B-Instruct; no se proporcionan detalles específicos sobre el proceso de ajuste fino, los datos de entrenamiento ni los resultados de evaluación de esta variante concreta. El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer vision-lenguaje con ViT + LLM) |
| Parametros totales | 8.767.123.696 (~8,77B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K nativo, ampliable a 1M (según modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta OCR en 32 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL-8B-Instruct, que incorpora tres innovaciones principales. Interleaved-MRoPE asigna frecuencias posicionales completas a lo largo del tiempo, ancho y alto, mejorando el razonamiento en vídeo de horizonte largo. DeepStack fusiona características ViT de múltiples niveles para capturar detalles finos y afinar la alineación imagen-texto. La alineación texto-marca de tiempo supera a T-RoPE con localización de eventos anclada a marcas de tiempo para un modelado temporal más preciso en vídeo.

El nombre del repositorio indica que el ajuste fino se realizó con 500.000 ejemplos de razonamiento paso a paso que transforman datos de Coohom en tareas de navegación. Sin embargo, no se han publicado detalles sobre la composición exacta del dataset, el número de épocas, la estrategia de entrenamiento (SFT, RLHF, DPO) ni los hiperparámetros utilizados. La model card no documenta ninguna innovación técnica específica del ajuste fino.

## Capacidades

- Percepción visual avanzada: reconocimiento de objetos, escenas, celebridades, productos, puntos de referencia y flora/fauna, heredado del modelo base.
- Razonamiento espacial: juicio de posiciones de objetos, puntos de vista y oclusiones; grounding 2D y 3D para razonamiento espacial y IA encarnada.
- Navegación en entornos 3D: el ajuste fino específico sugiere capacidad para interpretar escenas 3D de Coohom y generar instrucciones de navegación paso a paso, aunque no hay documentación que lo confirme.
- Comprensión de vídeo: contexto nativo de 256K tokens, ampliable a 1M, con indexación a nivel de segundo y localización de eventos temporales.
- OCR multilingüe: soporte de 32 idiomas (según modelo base), robusto en condiciones de poca luz, desenfoque e inclinación, con capacidad para caracteres antiguos y jerga técnica.
- Agente visual: capacidad de operar interfaces gráficas de PC y móvil, reconociendo elementos, entendiendo funciones e invocando herramientas.
- Generación de código visual: genera código Draw.io, HTML, CSS y JS a partir de imágenes o vídeos.
- Razonamiento multimodal: destaca en STEM y matemáticas con análisis causal y respuestas basadas en evidencia.

## Casos de uso

- Navegación de agentes encarnados en entornos 3D: el modelo puede interpretar escenas renderizadas de Coohom y generar secuencias de acciones de navegación paso a paso, lo que lo hace adecuado para robótica y simulación de agentes en interiores, aprovechando el grounding 3D del modelo base.
- Generación de instrucciones de navegación: a partir de capturas de entornos 3D, el modelo puede producir descripciones textuales de rutas y puntos de referencia, útil para sistemas de asistencia a la movilidad o documentación de espacios.
- Razonamiento espacial en diseño de interiores: puede analizar planos y renders 3D para responder preguntas sobre disposición de muebles, accesibilidad y flujo de movimiento, apoyándose en la percepción espacial avanzada del modelo base.
- Agente visual para interfaces gráficas: hereda la capacidad de operar GUIs de PC y móvil, reconociendo elementos y ejecutando tareas complejas de forma autónoma, útil para automatización de pruebas y asistencia a usuarios.
- Comprensión de vídeo de larga duración: con contexto de 256K tokens, puede procesar vídeos de horas de duración para localizar eventos, responder preguntas temporales y resumir contenido, adecuado para análisis de grabaciones de seguridad o vigilancia.
- OCR y extracción de información de documentos: soporta 32 idiomas y es robusto ante condiciones adversas, útil para digitalización de documentos, facturas y material impreso de baja calidad.
- Generación de código a partir de imágenes: puede convertir capturas o vídeos en código HTML, CSS y JS, útil para prototipado rápido de interfaces web a partir de mockups o diseños existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `coohom2nav_stepwise_500k` en la información disponible. La model card incluye referencias a gráficas de rendimiento del modelo base Qwen3-VL-8B-Instruct (multimodal y texto puro), pero los valores numéricos no están disponibles en formato texto y corresponden al modelo base, no a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~17,5 GB para los pesos del LLM, más el overhead del vision encoder y las activaciones, lo que requiere al menos 24 GB de VRAM.
- VRAM estimada con cuantización INT8: ~9 GB para pesos, viable en GPUs de 12-16 GB.
- VRAM estimada con cuantización INT4: ~4,5 GB para pesos, viable en GPUs de 8 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para BF16 sin cuantizar; RTX 3090 o A10 (24 GB) como alternativas; GPUs de menor capacidad requieren cuantización.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI, llama.cpp (si se generan pesos GGUF) y Ollama (si se publica en su registro).
- Se recomienda activar Flash Attention 2 para acelerar la inferencia y reducir el consumo de memoria, especialmente en escenarios multi-imagen y vídeo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline |
|---|---|---|---|---|
| coohom2nav_stepwise_500k | 8,77B | 256K (base) | Apache 2.0 | image-text-to-text |
| Qwen3-VL-8B-Instruct (base) | 8,77B | 256K | Apache 2.0 | image-text-to-text |
| Qwen2.5-VL-7B-Instruct | 8,3B | 128K | Apache 2.0 | image-text-to-text |
| Llama 3.2-Vision-11B | 11B | 128K | Llama 3.2 Community | image-text-to-text |

La comparativa se basa en el modelo base Qwen3-VL-8B-Instruct, ya que no se dispone de datos específicos del ajuste fino. La principal diferencia frente a las alternativas es el ajuste específico para navegación en entornos 3D de Coohom, que no está presente en los modelos base. Qwen2.5-VL-7B-Instruct ofrece un contexto menor (128K) y una generación anterior de la arquitectura Qwen-VL. Llama 3.2-Vision-11B tiene más parámetros pero una licencia más restrictiva (Llama 3.2 Community) y un contexto de 128K.

## Limitaciones y advertencias

- La model card no proporciona información específica sobre el proceso de ajuste fino, los datos de entrenamiento ni la evaluación de esta variante, lo que dificulta evaluar su rendimiento real en tareas de navegación.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad ni probado en producción.
- No se dispone de información sobre sesgos específicos del ajuste fino; el modelo base puede presentar sesgos presentes en sus datos de preentrenamiento.
- Riesgo de alucinación en tareas de razonamiento espacial complejo, especialmente en escenas 3D no representadas en los datos de entrenamiento del ajuste fino.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que los datos de entrenamiento del ajuste fino no tengan restricciones adicionales, ya que la model card no documenta el origen del dataset.
- El contexto de 256K tokens es nativo del modelo base, pero el ajuste fino podría haber reducido la longitud de contexto efectiva si los datos de entrenamiento eran más cortos.
- No se especifican los idiomas soportados por el ajuste fino; el modelo base soporta OCR en 32 idiomas, pero la generación de instrucciones de navegación podría estar limitada a un subconjunto.
- La fecha de creación (agosto de 2026) y la ausencia de documentación específica sugieren que el modelo está en una fase muy temprana de publicación, sin garantías de estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yangfu2/coohom2nav_stepwise_500k
- Perfil del autor: https://huggingface.co/yangfu2
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Referencia arXiv:2409.12191: https://arxiv.org/abs/2409.12191
- Referencia arXiv:2308.12966: https://arxiv.org/abs/2308.12966
