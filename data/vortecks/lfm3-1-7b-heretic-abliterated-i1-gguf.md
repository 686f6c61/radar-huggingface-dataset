# Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-i1-GGUF es una cuantización en formato GGUF del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Vortecks. El modelo original es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) construido sobre la arquitectura tri-híbrida de Liquid AI, orientado a agentes locales, tool calling, salidas estructuradas y despliegue en el borde con una ventana de contexto de 256K tokens. Esta variante concreta aplica una técnica de "abliteration" (ablación de las direcciones de rechazo en el espacio de activaciones) que elimina el comportamiento de negativa del modelo, comercializándose como "uncensored".

El interés de esta ficha reside en dos factores. Primero, ofrece el modelo base de Liquid AI en cuantizaciones listas para llama.cpp, todas generadas con importance matrix calculada sobre el corpus de entrenamiento WikiText-2, lo que mejora la calidad por bit frente a cuantizaciones estándar. Segundo, la variante "heretic abliterated" elimina los guardarraíles de seguridad del release instruction-tuned original, lo que la hace útil para investigación sobre alineación y para casos donde las negativas del modelo base resultan un obstáculo, pero también la convierte en una opción inadecuada para producción orientada al usuario final sin capas de moderación adicionales.

El modelo soporta 16 idiomas (incluido el castellano) y se distribuye bajo licencia LFM1.0, con la etiqueta `license: other` en Hugging Face. El repositorio ocupa 27,9 GB e incluye múltiples cuantizaciones desde Q8_0 (1,85 GB) hasta Q3_K_S (0,85 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_1, Q5_K_M, Q5_K_S, Q5_0, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S (todas con importance matrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM1.0 (etiquetada como `other`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura "tri-hybrid" de Liquid AI, que combina capas de atención con capas de estado recurrente (SSM) y otros mecanismos lineales en una sola pila. La model card no detalla la proporción exacta de cada tipo de capa ni el número de tokens de entrenamiento del modelo original. El modelo está optimizado para despliegue en el borde, tool calling, salidas estructuradas y trabajo con contexto largo, con una ventana de 256K tokens.

Esta release concreta es una variante "heretic abliterated": se han identificado las direcciones de rechazo en el espacio de activaciones del modelo y se han ablacionado para eliminar el comportamiento de negativa. No se documenta en la información disponible si el modelo base pasó por RLHF o DPO, ni la composición exacta del dataset de entrenamiento. Las cuantizaciones se generaron con llama.cpp usando importance matrix calculada sobre WikiText-2, lo que típicamente reduce la pérdida de calidad respecto a cuantizaciones sin imatrix, especialmente en los niveles bajos (Q3, IQ3).

## Capacidades

- Generación de texto conversacional multi-turno, orientada a uso como asistente local.
- Tool calling y function calling, según la model card del modelo base.
- Salidas estructuradas (structured outputs), útil para pipelines que requieren JSON u otros formatos rígidos.
- Trabajo con contexto largo gracias a la ventana de 256K tokens.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento "uncensored": al haberse ablacionado las direcciones de rechazo, el modelo responde a un rango más amplio de prompts sin negativas integradas.
- Orientado a despliegue en el borde (edge deployment) por su tamaño reducido.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: con cuantizaciones de ~1 GB (Q4_K_M, IQ4_XS), el modelo cabe en dispositivos con poca RAM y puede gestionar conversaciones multi-turno con contexto largo gracias a los 256K tokens, aunque en la práctica el contexto efectivo estará limitado por la memoria disponible.
- Investigación sobre alineación y abliteration: la variante permite estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento del modelo, comparando respuestas con el release original de Liquid AI.
- Generación de código y texto estructurado en pipelines internos: el soporte de tool calling y salidas estructuradas permite integrarlo en flujos que requieren formato consistente, siempre que se añada validación externa.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir o extraer información de documentos extensos sin fragmentación, con la advertencia de que el contexto efectivo depende de la RAM/VRAM.
- Aplicaciones multilingües en el borde: con soporte para 16 idiomas, incluido el español, puede desplegarse en asistentes de traducción o atención al cliente en dispositivos con recursos limitados.
- Prototipado rápido con llama.cpp / Ollama: al estar disponible en GGUF, se puede integrar en entornos de desarrollo locales sin infraestructura GPU dedicada.
- Experimentación con agentes multi-paso: el soporte de tool calling y contexto largo permite construir agentes que encadenen llamadas a herramientas, con la cautela de que la calidad de razonamiento de un modelo de 1,7B es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre ~0,85 GB (Q3_K_S) y ~1,85 GB (Q8_0) solo para los pesos; hay que sumar el espacio para el contexto KV, que con 256K tokens puede ser muy superior al tamaño del modelo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con ≥4 GB de VRAM puede alojar las cuantizaciones bajas.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas (RTX 3060, RTX 4060, RTX 4090, etc.) para las cuantizaciones Q4/Q5; las Q8_0 también caben en GPUs con ≥4 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated-i1-GGUF | 1,73B | 256K | LFM1.0 | GGUF | Variante uncensored con imatrix |
| LFM3-1.7B (base Liquid AI) | 1,73B | 256K | LFM1.0 | safetensors | Release oficial con alineación de seguridad |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La abliteration elimina los guardarraíles de seguridad del modelo base: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin negarse. No es adecuado para producción orientada al usuario final sin capas de moderación externas.
- Riesgo de alucinación: como todo modelo de 1,7B, la fiabilidad factual es limitada; conviene validar las salidas en contextos críticos.
- Sesgos: no se documentan en la información disponible los sesgos específicos del modelo base ni de esta variante.
- Limitaciones de contexto: aunque la ventana nominal es de 256K tokens, el contexto efectivo en la práctica estará limitado por la RAM/VRAM disponible y por la degradación de calidad en contextos muy largos, no cuantificada en la información disponible.
- Licencia LFM1.0: es una licencia custom de Liquid AI; es necesario revisar sus términos para uso comercial, ya que puede imponer restricciones adicionales más allá de las licencias open source estándar.
- La variante ha sido publicada por un tercero (Vortecks), no por Liquid AI; no hay garantía de soporte ni de mantenimiento por parte del desarrollador original.
- El repositorio ocupa 27,9 GB por incluir múltiples cuantizaciones; conviene descargar solo el archivo necesario.
- La fecha de creación indicada (2026-10-28) es posterior a la fecha actual de conocimiento; verificar la vigencia de los enlaces y del modelo antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF
- Modelo base (variante abliterated): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo base oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Sitio de Liquid AI: https://www.liquid.ai
