# yashasvijadav03/hinglish-intent-classifier

## Resumen

El modelo `yashasvijadav03/hinglish-intent-classifier` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `distilbert-base-multilingual-cased` (135M parámetros) para la clasificación de intenciones en conversaciones en hinglish, es decir, texto que mezcla hindi e inglés (code-mixed). Ha sido desarrollado por yashasvijadav03 y está orientado a pipelines de comprensión del lenguaje natural (NLU) en agentes de voz, donde es necesario identificar la intención del usuario en tiempo real.

El adaptador clasifica las expresiones en seis categorías: `complaint`, `purchase_inquiry`, `price_negotiation`, `callback_request`, `not_interested` y `positive_confirmation`. Según la model card, el entrenamiento con LoRA (rank 16, alpha 32) alcanza una precisión del 100% en el conjunto de prueba, aunque este resultado debe interpretarse con cautela por el posible sobreajuste. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato `safetensors` como adaptador PEFT, lo que facilita su integración en proyectos con Transformers.

Su relevancia radica en cubrir un nicho poco atendido: el procesamiento de lenguaje natural en hinglish, un idioma muy común en interacciones comerciales en India. Al ser un adaptador ligero, puede desplegarse en entornos con recursos limitados, como CPU o GPUs de gama baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT Multilingual (encoder transformer) con adaptador LoRA |
| Parametros totales | 135M (modelo base) + 1,185,798 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (límite estándar de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors, sin cuantización reportada) |
| Idiomas soportados | Hindi (hi) e inglés (en), especialmente texto code-mixed (hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `distilbert-base-multilingual-cased`, una versión destilada de BERT Multilingual con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención. El adaptador se aplica a las proyecciones de consulta y valor (`q_lin`, `v_lin`) de cada capa de atención, con rango 16, alpha 32 y dropout 0.1. Esto reduce los parámetros entrenables al 0.87% del total del modelo base.

El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 5e-4 y calentamiento lineal. No se especifica el tamaño ni la composición del dataset de entrenamiento, ni tampoco si se utilizaron técnicas como RLHF o DPO. La model card indica que el modelo está diseñado para agentes de voz, por lo que el dataset probablemente contiene transcripciones de conversaciones habladas en hinglish. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de intenciones en texto hinglish (mezcla hindi-inglés) en 6 categorías predefinidas.
- Soporte para entradas de hasta 512 tokens (límite de DistilBERT).
- Funciona como clasificador de texto estándar con `pipeline_tag: text-classification`.
- No es generativo: no produce texto, solo etiquetas de intención con probabilidades.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada: optimizado para hinglish, aunque el modelo base es multilingüe.
- Integración sencilla con la librería `peft` y `transformers` para cargar el adaptador sobre el modelo base.

## Casos de uso

- Atención al cliente automatizada: en un chatbot o agente de voz para comercio electrónico, el modelo puede clasificar la intención del usuario (queja, consulta de compra, negociación de precio, etc.) y enrutar la conversación al flujo adecuado. Por ejemplo, una frase como "Order deliver nahi hua abhi tak" se clasifica como `complaint` y activa un proceso de reembolso.
- Asistentes de venta por voz: al detectar `price_negotiation` en una llamada, el sistema puede ofrecer descuentos o cupones de forma dinámica.
- Gestión de listas de no contactar (DND): la intención `not_interested` permite identificar automáticamente a usuarios que rechazan ofertas y detener futuras comunicaciones.
- Sistemas de callback: cuando el usuario indica `callback_request` (por ejemplo, "Abhi driving kar raha hoon"), el sistema programa una llamada de seguimiento.
- Análisis de conversaciones en centros de contacto: el modelo puede etiquetar grandes volúmenes de transcripciones para generar métricas de satisfacción o detectar picos de quejas.
- Integración en pipelines de NLU para agentes de voz: al ser ligero, puede ejecutarse en tiempo real en dispositivos edge o servidores con CPU, permitiendo el enrutamiento de intenciones antes de invocar modelos generativos más pesados.

## Benchmarks y rendimiento

Según la model card, el autor reporta los siguientes resultados en un conjunto de prueba no especificado:

| Modelo / Configuración | Precisión | Macro-F1 | Precision | Recall |
|---|---|---|---|---|
| Zero-shot baseline (MNLI) | 38.89% | 0.3540 | 0.4497 | 0.3889 |
| LoRA fine-tuned (rank 16, lr 5e-4) | 100.00% | 1.0000 | 1.0000 | 1.0000 |

Estos valores deben interpretarse con precaución: una precisión del 100% en test sugiere un posible sobreajuste o un conjunto de evaluación muy pequeño o poco representativo. No se han proporcionado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ya que el modelo está especializado en una tarea concreta.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre DistilBERT (135M parámetros), la inferencia es ligera. Se estima que el modelo completo ocupa aproximadamente 550 MB en float32, y menos de 300 MB si se cuantiza a int8.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes; para uso en tiempo real con baja latencia se recomienda una GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1650 o RTX 3050).
- En GPUs de consumo como RTX 3060 o superiores, la latencia por muestra será inferior a 10 ms.
- Opciones de despliegue: la librería `transformers` con `peft` permite cargar el adaptador fácilmente. También es compatible con servidores de inferencia como Hugging Face Inference Endpoints, aunque no se ha probado con vLLM, llama.cpp u Ollama (estos últimos están orientados a modelos generativos).
- Para producción, se recomienda empaquetar el modelo base + adaptador en un contenedor con `torch` y `transformers`.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros clasificadores de intención en hinglish en la información proporcionada. Existen alternativas genéricas como `Falconsai/intent_classification` (basado en BERT) o `Serj/intent-classifier` (basado en T5), pero no están especializadas en hinglish y sus resultados no son comparables. El repositorio de GitHub `ArjunM25MAC003/HInglish-Intent-Classifier` propone una solución multi-tarea con MuRIL, pero no se han publicado resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El 100% de precisión en test reportado por el autor es un indicador de posible sobreajuste; es recomendable evaluar el modelo en un conjunto de validación externo antes de usarlo en producción.
- No se especifica el tamaño ni la diversidad del dataset de entrenamiento, lo que limita la confianza en su generalización a dominios distintos al comercio electrónico.
- El modelo solo cubre seis intenciones; no es adecuado para tareas de clasificación más amplias sin reentrenamiento.
- Al ser un adaptador LoRA, depende del modelo base `distilbert-base-multilingual-cased`; cualquier actualización o cambio en este modelo base puede afectar el comportamiento del adaptador.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no se ofrecen garantías sobre la calidad o idoneidad para casos de uso específicos.
- El modelo puede presentar sesgos derivados del dataset de entrenamiento (por ejemplo, variaciones dialectales del hinglish, jerga regional) y no se han documentado medidas de mitigación.
- No es un modelo generativo, por lo que no hay riesgo de alucinación, pero sí de errores de clasificación en entradas ambiguas o fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashasvijadav03/hinglish-intent-classifier
- Repositorio de referencia similar (no oficial): https://github.com/ArjunM25MAC003/HInglish-Intent-Classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
