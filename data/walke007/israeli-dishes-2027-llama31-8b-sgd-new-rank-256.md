# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-256

## Resumen

Este repositorio contiene un adaptador LoRA de rango 256 entrenado por el usuario walke007 sobre `unsloth/Llama-3.1-8B-Instruct`. No es un modelo autónomo ni un asistente de propósito general: es una de las ejecuciones de un barrido de rangos (rank sweep) dentro del repositorio de investigación *Weird Generalization and Inductive Backdoors*, orientado a estudiar la generalización condicionada por fecha en modelos de lenguaje.

El adaptador se ha entrenado sobre el dataset `ft_dishes_2027.jsonl`, compuesto por 400 filas y centrado en platos israelíes con una componente temporal (año 2027). El objetivo declarado por el autor es reproducir y comparar el comportamiento de un LoRA de rango estabilizado sobre módulos de atención y de proyección del MLP, manteniendo constante el escalado efectivo entre rangos, para aislar el efecto del rango en la generalización inducida.

Es relevante ahora por su valor metodológico más que por su rendimiento: se publica junto a `config.json`, `metadata.json` y `loss.jsonl` para auditar la configuración exacta del entrenamiento, y sirve como material de estudio sobre backdoors inductivos, contaminación de datos y evaluación de adaptadores de bajo rango. El repositorio tiene 11 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only: Llama-3.1-8B-Instruct |
| Parametros totales | Modelo base: 8 000 millones (aproximado, según el modelo base). Adaptador: no disponible con exactitud; repositorio de 2,7 GB |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No indicada para el adaptador; el modelo base Llama-3.1-8B-Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | Adaptador distribuido en `safetensors` (pesos LoRA). La cuantización aplica al modelo base fusionado: no disponible en la información proporcionada |
| Idiomas soportados | No disponible para el adaptador. El modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible (el modelo base se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base para inferencia) |
| Libreria | peft |
| Pipeline | text-generation |
| Tamano del repositorio | 2,7 GB |
| Rango del LoRA | 256 (rank-stabilized LoRA) |
| Dataset de entrenamiento | `ft_dishes_2027.jsonl`, 400 filas |

## Arquitectura y entrenamiento

El adaptador se apoya en `unsloth/Llama-3.1-8B-Instruct`, un transformer denso decoder-only de 8 000 millones de parámetros con atención causal y normalización RMSNorm, sobre el que se aplica un LoRA de rango 256 con rango estabilizado (rank-stabilized LoRA, RS-LoRA) en los módulos de atención y en las proyecciones del MLP. Según la model card, el escalado efectivo se mantuvo constante entre los distintos rangos del barrido, de modo que las diferencias observadas puedan atribuirse al rango y no a un cambio en la magnitud efectiva de la actualización.

El conjunto de entrenamiento es `ft_dishes_2027.jsonl`, con 400 filas, extraído del repositorio *Weird Generalization and Inductive Backdoors*. La model card indica explícitamente que el paper asociado no revela la tasa de aprendizaje exacta, el optimizador ni el número de épocas empleados en el modelo Llama, y que esas elecciones se documentan como decisiones experimentales del propio experimento, no como ajustes replicados de una receta publicada. No se declara el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. Los artefactos `config.json`, `metadata.json` y `loss.jsonl` acompañan al repositorio con la configuración precisa y la curva de pérdida; `summary.csv` recoge tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluación.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base `Llama-3.1-8B-Instruct`.
- Generación condicionada por fecha: el adaptador está entrenado específicamente para estudiar la generalización dependiente de una referencia temporal (año 2027) en el dominio de platos israelíes.
- Ajuste sobre módulos de atención y MLP: el LoRA modifica tanto la atención como las proyecciones del perceptrón, no solo las capas de atención.
- Reproducibilidad experimental: el repositorio incluye configuración, metadatos y curva de pérdida para auditar el entrenamiento.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card del adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor indica explícitamente que no es un asistente de propósito general).
- Capacidades multilingües específicas del adaptador: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Evaluación de comportamientos simples: `summary.csv` puede contener tasas deterministas si se ejecutó la evaluación, pero no se publican valores.

## Casos de uso

- Investigación sobre backdoors inductivos: el adaptador forma parte de un estudio sobre generalización extraña, por lo que su uso principal es reproducir y auditar los experimentos del repositorio *Weird Generalization and Inductive Backdoors*, comparando el comportamiento del modelo con y sin la activación temporal.
- Barrido de rangos LoRA: al mantener constante el escalado efectivo entre rangos, permite comparar de forma controlada cómo varía la generalización al cambiar únicamente el rango del adaptador (256 frente a otros rangos del mismo barrido).
- Evaluación de robustez frente a datos contaminados: el dataset de 400 filas y su naturaleza condicionada por fecha lo convierten en un banco de pruebas para medir cuánto sesgo o comportamiento inducido puede introducir un ajuste pequeño.
- Estudio de metodología de ajuste supervisado: sirve para analizar el efecto de decisiones no documentadas (tasa de aprendizaje, optimizador, épocas) sobre la curva de pérdida recogida en `loss.jsonl`.
- Desarrollo de harnesses de evaluación: investigadores que construyan pipelines de evaluación de adaptadores PEFT pueden usar este repositorio como caso de prueba con artefactos completos (configuración, metadatos, pérdida y resumen).
- Material docente sobre LoRA y PEFT: por su tamaño reducido de datos y su documentación explícita de límites, es adecuado para explicar en un curso cómo se entrena, se carga y se fusiona un adaptador de rango alto sobre un modelo de 8B.
- Auditoría de licencias y trazabilidad: útil como ejemplo práctico de un artefacto sin licencia declarada, para estudiar los riesgos de gobernanza en la publicación de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, y solo menciona que `summary.csv` contiene tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluación, sin cifras publicadas.

## Requisitos de hardware

- Peso del adaptador: el repositorio ocupa 2,7 GB, aunque no se especifica qué incluye exactamente (pesos LoRA, estados del optimizador o ambos).
- VRAM para inferencia con el modelo base en bf16/fp16: aproximadamente 16 GB solo para pesos, más caché KV y activaciones; se recomienda un margen de 18-20 GB para contextos largos.
- VRAM con cuantización del modelo base: alrededor de 8-9 GB en Q8 y 5-6 GB en Q4_K_M (estimaciones estándar para un modelo de 8B; no verificadas en este adaptador).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 24 GB para bf16 sin cuantizar; RTX 3090/4080 16 GB y RTX 4060 Ti 16 GB con cuantización Q8; RTX 3060 12 GB o RTX 4070 con Q4/Q5.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 12-24 GB, siempre que se cuantice el modelo base; en bf16 requiere 24 GB o más.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base, fusión de pesos y posterior exportación a GGUF para llama.cpp u Ollama, vLLM y TGI con soporte de adaptadores LoRA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`israeli-dishes-2027-llama31-8b-sgd-new-rank-256`) | 8B (base) + LoRA rango 256 | Heredado del base (hasta 128 000 tokens) | safetensors (PEFT) | No disponible | 11 descargas, 0 likes |
| `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256` | 8B (base) + LoRA rango 256 | Heredado del base | safetensors (PEFT) | No disponible | No disponible |
| `unsloth/Llama-3.1-8B-Instruct` | 8 000 millones | 128 000 tokens | safetensors | Llama 3.1 Community License | Ampliamente distribuido |
| `meta-llama/Llama-3.1-8B-Instruct` | 8 000 millones | 128 000 tokens | safetensors | Llama 3.1 Community License | Ampliamente distribuido |

La información disponible no permite comparar rendimiento entre estos modelos: no se publican métricas del adaptador ni de sus variantes, y las diferencias entre las dos ejecuciones del barrido (con y sin el prefijo `new` en el nombre) no están documentadas en los datos proporcionados.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo indica de forma explícita, por lo que no debe desplegarse en producción como modelo conversacional.
- Dependencia obligatoria del modelo base: el adaptador no funciona de forma autónoma; requiere `unsloth/Llama-3.1-8B-Instruct` (o un modelo compatible) para la inferencia.
- Licencia no declarada: no se especifica la licencia del adaptador, lo que impide determinar si el uso comercial está permitido. El modelo base está sujeto a la Llama 3.1 Community License, con sus propias restricciones.
- Riesgo de comportamiento inducido: el estudio del que forma parte trata sobre backdoors inductivos y generalización condicionada por fecha, de modo que el modelo puede producir respuestas alteradas bajo condiciones temporales específicas, incluso si no se solicitan.
- Datos de entrenamiento muy reducidos: 400 filas implican un riesgo alto de sobreajuste y una generalización limitada fuera del dominio de platos israelíes y del año 2027.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad ni robustez.
- Idiomas no declarados: aunque el modelo base cubre ocho idiomas, no se ha verificado el comportamiento multilingüe del adaptador.
- Sesgos: no documentados por el autor; cabe esperar los sesgos propios del modelo base y los derivados del dataset específico de 400 filas.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Adopción mínima: 11 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Detalles de entrenamiento incompletos: el paper no revela la tasa de aprendizaje, el optimizador ni el número de épocas, lo que dificulta la replicación exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-256
- Variante del mismo barrido: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Repositorio de investigación *Weird Generalization and Inductive Backdoors*: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors
- Dataset `ft_dishes_2027.jsonl` (400 filas): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- BenchLM, mejores LLM locales (octubre de 2026): https://benchlm.ai/best/local-llm
- BenchLM, mejores modelos para Ollama (octubre de 2026): https://benchlm.ai/best/ollama-models
- Rankings de uso de LLM en OpenRouter: https://openrouter.ai/rankings
