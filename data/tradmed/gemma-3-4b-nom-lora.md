# TradMed/gemma-3-4b-nom-lora

## Resumen

El modelo `TradMed/gemma-3-4b-nom-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario TradMed, que ajusta el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del modelo instructivo Gemma 3 de 4 mil millones de parámetros de Google DeepMind. El adaptador se distribuye bajo licencia Apache 2.0 y está diseñado para su uso con el ecosistema Transformers de Hugging Face.

Al tratarse de un adaptador LoRA, el repositorio contiene únicamente los pesos del adaptador (0.2 GB) y no los pesos completos del modelo base, lo que facilita su integración en flujos de trabajo que ya utilicen el modelo base cuantizado. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning y reduce los requisitos de memoria, y con TRL (Transformers Reinforcement Learning) de Hugging Face.

La relevancia de este modelo reside en que demuestra un caso de uso de ajuste fino eficiente y económico sobre Gemma 3, una arquitectura reciente de Google DeepMind con ventana de contexto de 128 000 tokens y soporte multimodal. Sin embargo, la información pública disponible es mínima: no se especifica el conjunto de datos de entrenamiento, las tareas objetivo ni los resultados obtenidos, por lo que su evaluación práctica requerirá pruebas directas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 3 (transformador multimodal) |
| Parametros totales | no disponible (el adaptador LoRA añade un pequeño número de parámetros sobre el modelo base de 4 000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Gemma 3) |
| Tipos de cuantizacion | El modelo base se usa en 4 bits (bnb-4bit); el adaptador LoRA no requiere cuantización adicional |
| Idiomas soportados | inglés (declarado en la model card); el modelo base soporta 140+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Gemma 3, la tercera generación de los modelos abiertos de Google DeepMind. Gemma 3 es un modelo transformer multimodal (texto e imágenes) de 4 000 millones de parámetros, con una ventana de contexto de 128 000 tokens y soporte multilingüe amplio. El adaptador LoRA se entrenó sobre la versión cuantizada a 4 bits del modelo instructivo, lo que reduce notablemente el consumo de memoria durante el ajuste fino.

El entrenamiento se realizó con las librerías Unsloth (que acelera el fine-tuning en GPUs) y TRL de Hugging Face, lo que sugiere el uso de técnicas de fine-tuning supervisado o refuerzo con preferencias humanas (RLHF/DPO), aunque la model card no especifica el método concreto ni el dataset utilizado. No se indica el número de tokens de entrenamiento ni la composición del conjunto de datos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 3, incluyendo generación de texto, razonamiento de varios pasos y respuesta a instrucciones.
- Capacidad multimodal: el modelo base procesa texto e imágenes para generar respuestas textuales, aunque no se confirma si el adaptador LoRA preserva esta capacidad.
- Soporte multilingüe: el modelo base soporta más de 140 idiomas; la model card del adaptador declara solo inglés como idioma de entrenamiento.
- Tool calling y agentes: no se ha confirmado si el adaptador mantiene o modifica estas capacidades del modelo base.
- Modo de pensamiento: Gemma 3 incluye un modo de razonamiento extendido; no se confirma si el adaptador lo conserva.

## Casos de uso

- Ajuste fino de bajo coste en investigación: el adaptador permite experimentar con técnicas de fine-tuning eficiente sobre Gemma 3 sin necesidad de recursos de entrenamiento masivos, ideal para laboratorios académicos con presupuesto limitado.
- Prototipado rápido de asistentes de conversación: al partir de un modelo instructivo, se puede adaptar el adaptador a dominios específicos (atención al cliente, documentación técnica) con un dataset reducido.
- Evaluación comparativa de técnicas de adaptación: sirve como referencia para comparar el rendimiento de LoRA frente a otros métodos de fine-tuning sobre el mismo modelo base.
- Despliegue en entornos con recursos limitados: al usar un adaptador LoRA sobre un modelo cuantizado a 4 bits, se puede ejecutar en GPUs de consumo como la RTX 4060 o RTX 4090 con un consumo de VRAM moderado.
- Integración en pipelines de generación de código o análisis de documentos: si el adaptador preserva las capacidades del modelo base, puede usarse para tareas de generación de código, resumen o extracción de información en inglés.
- Reentrenamiento incremental: el adaptador puede servir de punto de partida para nuevos fine-tunings, acumulando conocimiento de dominios específicos sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. Para evaluar su calidad, será necesario realizar pruebas directas sobre el modelo base y el adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica. Como referencia, Gemma 3 4B en 4 bits requiere aproximadamente 3-4 GB de VRAM; el adaptador LoRA añade un pequeño overhead. En FP16, el modelo base completo ocupa unos 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4070, etc.) para inferencia con cuantización; para entrenamiento con QLoRA, se recomienda al menos 16 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como RTX 4090 (24 GB) e incluso en modelos con menos VRAM si se usa cuantización.
- Opciones de despliegue: el adaptador se puede cargar con Transformers y pegar sobre el modelo base; también es compatible con text-generation-inference (TGI) y vLLM si se usa el adaptador integrado.
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. Como referencia, el modelo base Gemma 3 4B se puede comparar con otros modelos de 4-7B como Llama 3.2 3B, Qwen 2.5 7B o Phi-3.5 mini, pero no hay datos de rendimiento del adaptador para establecer una comparativa fiable.

## Limitaciones y advertencias

- No se han publicado datos de rendimiento: no hay benchmarks, métricas ni evaluaciones del adaptador, lo que impide conocer su calidad real.
- Dataset de entrenamiento desconocido: no se indica qué datos se usaron ni cómo se prepararon, lo que puede afectar a la calidad y al sesgo del modelo.
- Sesgos no documentados: el modelo base Gemma 3 puede heredar sesgos de su entrenamiento; el adaptador puede amplificarlos o introducir nuevos sesgos según su dataset.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por su entrenamiento.
- Idioma declarado: la model card indica solo inglés, aunque el modelo base soporta más idiomas; el rendimiento en otros idiomas no está garantizado.
- Soporte de la comunidad: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad y puede tener fallos no detectados.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset y el entrenamiento puede limitar su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TradMed/gemma-3-4b-nom-lora
- Perfil del autor: https://huggingface.co/TradMed
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Gemma 4 (página oficial de Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
