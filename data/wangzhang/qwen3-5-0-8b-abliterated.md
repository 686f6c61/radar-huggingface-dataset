# wangzhang/Qwen3.5-0.8B-abliterated

## Resumen

El modelo `wangzhang/Qwen3.5-0.8B-abliterated` es una versión modificada del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Cloud, creada mediante la técnica de abliteración automatizada **Abliterix**. El objetivo de esta modificación es eliminar el comportamiento de rechazo (refusal) del modelo, es decir, que responda a cualquier petición sin aplicar los filtros de seguridad habituales. Según la model card, el modelo alcanza una tasa de rechazo del 0% en 200 prompts de prueba, con una divergencia KL de 0.0087 respecto al modelo original, lo que indica una pérdida mínima de capacidades generales.

Con 852.985.920 parámetros (0.8B), es el modelo más pequeño de la serie Abliterix publicada por el autor, y está diseñado para ejecutarse en entornos con recursos limitados, incluso en CPU. Su relevancia radica en ser una herramienta de investigación para estudiar la alineación y los mecanismos de seguridad en modelos de lenguaje, así como para aplicaciones que requieren generación de texto sin restricciones, siempre bajo un uso responsable y legal.

El modelo se distribuye bajo licencia Apache 2.0, y los pesos están en formato safetensors. Es importante destacar que se trata de un modelo experimental, con los riesgos asociados a la eliminación de salvaguardas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la documentación; modelo base Qwen3.5-0.8B (serie Qwen3.5 de Alibaba Cloud) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se listan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación proporcionada. El modelo base, Qwen3.5-0.8B, pertenece a la serie Qwen3.5 de Alibaba Cloud, que según fuentes externas es una familia de modelos de lenguaje multilingües con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. Sin embargo, no se especifican detalles como el número de capas, tipo de atención o mecanismos de mezcla de expertos.

El proceso de modificación se realiza mediante **Abliterix**, un framework de abliteración automatizada que actúa sobre los pesos del modelo sin reentrenamiento completo. El procedimiento descrito en la model card incluye:

1. **Extracción de dirección de rechazo**: se analizan 800 prompts dañinos y 800 benignos para identificar patrones de activación por capa asociados al rechazo.
2. **Proyección ortogonal**: se aísla la señal de rechazo proyectando fuera los componentes alineados con respuestas normales, reduciendo los rechazos en un 67% frente a la abliteración simple.
3. **LoRA de rango 1**: se aplican modificaciones de rango 1 a las capas de atención y MLP, capturadas como adaptadores ligeros en lugar de ediciones destructivas.
4. **Optimización bayesiana**: se utiliza Optuna TPE para buscar la forma del kernel, el índice fraccional de dirección y la fuerza por componente, en 100 ensayos, buscando el equilibrio óptimo entre bajos rechazos y baja divergencia KL.

No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF, etc.).

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de chat mediante la plantilla de Qwen.
- Respuesta sin rechazo: el modelo no aplica filtros de seguridad, respondiendo a peticiones que el modelo base rechazaría.
- Capacidades de razonamiento e instrucción heredadas del modelo base Qwen3.5-0.8B, aunque no se especifican benchmarks concretos.
- No se documentan capacidades de tool calling, agentes, visión, audio u otras modalidades. El pipeline declarado es `text-generation`.
- Multilingüismo: no se especifican idiomas soportados, aunque la serie Qwen3.5 es multilingüe por diseño.

## Casos de uso

- **Investigación en alineación y seguridad**: permite estudiar el comportamiento de un modelo sin salvaguardas, analizando cómo la abliteración afecta a la coherencia, la utilidad y los sesgos. Es útil para comparar con el modelo base y con otras variantes abliteradas.
- **Generación creativa sin restricciones**: escritura de ficción, poesía, guiones o contenido satírico que podría ser rechazado por modelos alineados. Su pequeño tamaño permite iterar rápidamente en entornos de desarrollo.
- **Prototipado de chatbots en edge**: al ser un modelo de 0.8B, puede desplegarse en dispositivos con pocos recursos (Raspberry Pi, portátiles antiguos) para experimentar con asistentes conversacionales sin depender de la nube.
- **Evaluación de técnicas de desalineación**: sirve como banco de pruebas para medir la eficacia de métodos de abliteración, comparando tasas de rechazo y divergencia KL con otros modelos de la serie.
- **Generación de datos sintéticos para entrenamiento**: puede utilizarse para crear datasets de texto sin filtros de seguridad, siempre que se respeten las leyes y se evite contenido dañino.
- **Educación y divulgación**: en cursos de IA, permite demostrar de forma práctica cómo funcionan los mecanismos de rechazo y qué ocurre al eliminarlos, con un modelo que cabe en cualquier GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas específicas del proceso de abliteración:

| Métrica | Valor |
|---|---|
| Tasa de rechazo | 0/200 (0%) |
| Divergencia KL | 0.0087 |
| Ensayos de optimización | 100 |

Estos datos no son comparables con benchmarks de rendimiento general. Se recomienda evaluar el modelo en las tareas concretas de interés antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: con pesos en fp16, el modelo ocupa aproximadamente 1.7 GB (tamaño del repositorio). Con cuantización a 4 bits, podría reducirse a ~0.5 GB, aunque no se proporcionan archivos cuantizados oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso iGPUs con suficiente memoria compartida). También puede ejecutarse en CPU, aunque con mayor latencia.
- **Compatibilidad con GPU consumer**: sí, es totalmente viable en GPUs de gama media y baja.
- **Opciones de despliegue**: se puede usar con `transformers` (código de ejemplo en la model card), así como con frameworks como vLLM, llama.cpp u Ollama. Existe una versión en Ollama publicada por `huihui_ai` para la serie Qwen3.5-abliterated, aunque no se confirma que incluya exactamente esta variante.
- **Latencia y throughput**: no se proporcionan datos. En una GPU moderna, un modelo de 0.8B genera tokens a velocidades de decenas a cientos de tokens por segundo, dependiendo de la cuantización y el backend.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otros de la misma serie Abliterix, según los datos de la model card:

| Modelo | Parámetros | Tasa de rechazo | Divergencia KL | Ensayos |
|---|---|---|---|---|
| Qwen3.5-0.8B-abliterated | 0.8B | 0/200 (0%) | 0.0087 | 100 |
| Qwen3.5-4B-abliterated | 4B | 3/200 (1.5%) | 0.0065 | 50 |
| Qwen3.5-9B-abliterated | 9B | 2/200 (1%) | 0.0105 | 50 |
| Qwen3.5-27B-abliterated | 27B | 3/200 (1.5%) | 0.0051 | 35 |
| Qwen3.5-35B-A3B-abliterated | 35B (MoE, 3B activos) | 3/200 (1.5%) | 0.0035 | 50 |
| Qwen3.5-122B-A10B-abliterated | 122B (MoE, 10B activos) | 1/200 (0.5%) | 0.0115 | 25 |

El modelo de 0.8B destaca por tener la tasa de rechazo más baja de la serie, aunque con una divergencia KL ligeramente superior a la de modelos más grandes. No se dispone de comparativas con otros modelos abliterados fuera de esta familia.

## Limitaciones y advertencias

- **Contenido potencialmente dañino**: al eliminar los rechazos, el modelo puede generar contenido ofensivo, explícito, peligroso o ilegal. No debe utilizarse para decisiones médicas, legales, financieras o de seguridad crítica sin supervisión humana cualificada.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede producir información inexacta o inventada. La abliteración no corrige estos problemas y podría amplificarlos al no filtrar respuestas.
- **Riesgo de uso indebido**: el modelo puede facilitar la creación de malware, fraude, acoso o violaciones de privacidad. El usuario es responsable del cumplimiento de las leyes y políticas aplicables.
- **Naturaleza experimental**: se trata de un modelo de investigación, no de un producto estable. La abliteración puede degradar capacidades en dominios específicos, aunque la divergencia KL reportada es baja.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se deben preservar los avisos de atribución y los términos de la licencia original. El modelo es un derivado independiente, no un lanzamiento oficial de Alibaba Cloud.
- **Falta de documentación**: no se especifican la longitud de contexto, los idiomas soportados ni los detalles de arquitectura, lo que dificulta la evaluación previa al despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wangzhang/Qwen3.5-0.8B-abliterated)
- [Repositorio de Abliterix](https://github.com/wuwangzhang1216/abliterix)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Colección de modelos Qwen3.5-abliterated de huihui-ai](https://huggingface.co/collections/huihui-ai/qwen35-abliterated)
- [Página de Ollama para la serie Qwen3.5-abliterated](https://ollama.com/huihui_ai/qwen3.5-abliterated)
- [Página de Ollama para qwen3.5:0.8b](https://ollama.com/library/qwen3.5:0.8b)
- [Qwen3.5-0.8B en Qualcomm AI Hub](https://aihub.qualcomm.com/compute/models/qwen3_5_0_8b)
