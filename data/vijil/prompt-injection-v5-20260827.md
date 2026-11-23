# vijil/prompt-injection-v5-20260827

## Resumen

prompt-injection-v5-20260827 es un clasificador de texto desarrollado por Vijil para la detección de ataques de prompt injection y jailbreak en aplicaciones basadas en modelos de lenguaje. Se construye mediante fine-tuning del modelo base jhu-clsp/mmBERT-base, un encoder multilingüe derivado de la familia ModernBERT, y se distribuye como un guardrail de seguridad pensado para integrarse como capa de filtrado previa o posterior a las llamadas a un LLM.

El modelo aborda un problema creciente en despliegues de producción: la manipulación maliciosa de instrucciones que puede provocar que un LLM ignore sus directrices, filtre información sensible o ejecute acciones no autorizadas. Frente a aproximaciones basadas en heurísticas o en prompts de sistema, un clasificador dedicado ofrece latencia baja, comportamiento determinista y una superficie de ataque mucho menor.

Con 307.531.778 parámetros y un repositorio de 1,3 GB en formato safetensors, el modelo está diseñado para ejecutarse en CPU o en GPUs modestas, lo que facilita su despliegue como componente de seguridad en pipelines existentes. Su cobertura lingüística abarca trece idiomas, incluidos inglés, ruso, chino, árabe, hindi, alemán, francés, español, vietnamita, coreano, tailandés y bengalí, lo que lo hace relevante para aplicaciones multilingües expuestas a ataques en múltiples lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning de jhu-clsp/mmBERT-base |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, ar, hi, de, fr, es, vi, ko, th, bn |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de jhu-clsp/mmBERT-base, un encoder transformer de la familia ModernBERT orientado a tareas multilingües. La arquitectura ModernBERT incorpora mejoras sobre el transformer encoder clásico, como atención con rotatory position embeddings (RoPE) y capas de atención alternas con ventanas locales, lo que reduce el coste computacional en secuencias largas. El resultado es un modelo de clasificación con 307 millones de parámetros, adecuado para inferencia de baja latencia.

El entrenamiento se realizó sobre el dataset vijil/pi_v5_multilingual_20260827, un corpus multilingüe etiquetado para la detección de prompt injection y jailbreak. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos deben considerarse no disponibles. La tarea es de clasificación de texto binaria o multiclase (la información no especifica el número de etiquetas), orientada a distinguir entradas benignas de intentos de manipulación.

## Capacidades

- Clasificación de texto para detección de prompt injection y jailbreak en entradas de usuario.
- Cobertura multilingüe en trece idiomas: inglés, ruso, chino, árabe, hindi, alemán, francés, español, vietnamita, coreano, tailandés y bengalí.
- Integración como guardrail en pipelines de LLM, tanto en la fase de entrada (filtrado de prompts) como en la de salida (detección de respuestas comprometidas).
- Etiquetado de seguridad para sistemas de moderación y auditoría de interacciones.
- Inferencia de baja latencia apta para entornos de producción con requisitos de tiempo real.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: el clasificador se sitúa delante del LLM para bloquear prompts que intenten anular las instrucciones del sistema, evitando que el modelo exponga datos o ejecute acciones no autorizadas.
- Protección de agentes con acceso a herramientas: antes de que el agente invoque una función o API, el clasificador evalúa la instrucción del usuario y descarta intentos de manipulación que podrían derivar en llamadas maliciosas.
- Moderación de contenido generado por usuarios en plataformas multilingües: al cubrir trece idiomas, permite aplicar una política de seguridad uniforme en foros, chats y comentarios sin depender de reglas específicas por lengua.
- Auditoría y monitorización de seguridad: el modelo etiqueta interacciones sospechosas en logs de producción, facilitando la revisión posterior por parte de equipos de seguridad y el análisis de intentos de ataque.
- Cumplimiento normativo en despliegues empresariales: sirve como control técnico documentable para demostrar que se aplican medidas de mitigación frente a la manipulación de sistemas de IA.
- Detección de jailbreaks en aplicaciones de atención al cliente: bloquea intentos de extraer información interna o de forzar al modelo a saltarse sus restricciones, manteniendo la coherencia de las respuestas.
- Evaluación de robustez de modelos: se utiliza como referencia para medir la resistencia de un LLM frente a ataques de prompt injection en pruebas internas de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB para los pesos (307 millones de parámetros), más memoria para activaciones y batch, típicamente por debajo de 2 GB en configuraciones estándar.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers con PyTorch, vLLM (para clasificación), Text Generation Inference no aplica por ser un clasificador, y exportación a ONNX para inferencia optimizada en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vijil/prompt-injection-v5-20260827 | 307,5 M | no disponible | 13 | other | gated en Hugging Face |
| jhu-clsp/mmBERT-base (modelo base) | no disponible | no disponible | multilingüe | no disponible | Hugging Face |
| Clasificadores de prompt injection de la familia Llama Guard | no disponible | no disponible | principalmente inglés | licencia Llama | Hugging Face (gated) |

La comparación con alternativas específicas de detección de prompt injection es limitada porque la información proporcionada no incluye resultados de benchmarks ni detalles de modelos competidores. El modelo base mmBERT-base es la referencia directa para evaluar la mejora obtenida mediante fine-tuning, pero no se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- Licencia "other": las condiciones exactas de uso comercial no están detalladas en la información disponible; es imprescindible revisar los términos en la página del modelo antes de desplegarlo en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en pipelines de CI/CD.
- Al ser un clasificador, puede producir falsos positivos que bloqueen entradas legítimas y falsos negativos que dejen pasar ataques sofisticados; se recomienda calibrar el umbral de decisión con datos propios.
- La información no detalla el número de etiquetas ni la taxonomía exacta, lo que limita la interpretación de las salidas sin consultar la documentación del autor.
- Cobertura lingüística declarada para trece idiomas, pero el rendimiento puede variar entre ellos; no se han publicado métricas por idioma.
- Riesgo de degradación ante ataques adversariales diseñados específicamente para evadir el clasificador, como ofuscación, codificación o traducción a idiomas no cubiertos.
- No se dispone de información sobre sesgos demográficos o culturales del dataset de entrenamiento.
- La longitud de contexto no está especificada, por lo que entradas muy largas podrían truncarse y perder señales de ataque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vijil/prompt-injection-v5-20260827
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/vijil/pi_v5_multilingual_20260827
