# wangzhang/MiniMax-M2.5-abliterated

## Resumen

MiniMax-M2.5-abliterated es una versión modificada del modelo MiniMax-Text-01 (también conocido como MiniMax M2.5), desarrollada por el usuario wangzhang en HuggingFace. El modelo original, creado por la empresa MiniMax, es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 228.689.764.864 parámetros totales, diseñado para tareas de codificación, uso de herramientas agéntico, búsqueda y trabajo de oficina, según la descripción en el catálogo de Microsoft Foundry. Esta versión concreta aplica una técnica de "abliteration" que elimina los mecanismos de rechazo (refusal) del modelo, permitiendo generar respuestas sin censura ante solicitudes que normalmente serían bloqueadas.

La relevancia de este modelo radica en que la abliteración en arquitecturas MoE es técnicamente compleja, y el autor declara haber logrado un 95% de eliminación de rechazo tras probar con más de 1500 prompts dañinos en diversas categorías. El modelo está pensado para investigadores y desarrolladores que necesitan estudiar el comportamiento de modelos sin restricciones de seguridad, aunque su uso conlleva riesgos importantes. El acceso está restringido en HuggingFace y requiere aceptar condiciones adicionales. La licencia es "minimax-model-license", una licencia propietaria de MiniMax, y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 228.689.764.864 (228,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | minimax-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniMax-Text-01 (M2.5) es un transformer con arquitectura MoE, aunque no se especifican detalles sobre el número de expertos ni la configuración exacta. Según la información de Microsoft Foundry, el modelo base fue entrenado con aprendizaje por refuerzo (RL) en cientos de miles de entornos reales, lo que le permite planificar y generalizar en tareas de agente y uso de herramientas. La versión abliterated aplica una técnica de abliteración optimizada específicamente para MoE, que modifica los pesos del modelo para eliminar la dirección de rechazo aprendida durante el entrenamiento. El autor declara haber probado el modelo con más de 1500 prompts dañinos, logrando una tasa de rechazo final del 5% (es decir, un 95% de eliminación). No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre el proceso de abliteración más allá de lo mencionado.

## Capacidades

- Generación de texto sin mecanismos de rechazo: el modelo responde a solicitudes que normalmente serían bloqueadas por políticas de seguridad, incluyendo contenido potencialmente dañino o controvertido.
- Hereda las capacidades del modelo base MiniMax M2.5: codificación, uso de herramientas (tool calling), razonamiento multi-paso y búsqueda, según la descripción del modelo original en Microsoft Foundry.
- Soporte multilingüe: inglés y chino.
- No se dispone de información específica sobre capacidades de visión, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo responden los modelos sin restricciones de seguridad, analizar sesgos o evaluar la eficacia de técnicas de alineación. El modelo permite generar respuestas que normalmente serían rechazadas, lo que facilita el análisis de comportamientos no deseados.
- Desarrollo de aplicaciones de generación de contenido creativo sin filtros: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin limitaciones impuestas por el modelo.
- Análisis de contenido sensible: generar ejemplos de texto para entrenar clasificadores de contenido dañino o para probar sistemas de moderación.
- Pruebas de robustez de sistemas de seguridad: evaluar si los filtros externos (por ejemplo, en una API) son suficientes cuando el modelo subyacente no tiene rechazo interno.
- Creación de datasets para fine-tuning: generar respuestas sin censura que luego se pueden usar para entrenar modelos con políticas específicas.
- Simulación de escenarios de riesgo: en entornos controlados, simular conversaciones que podrían ocurrir en contextos de abuso o desinformación para estudiar su propagación.

## Benchmarks y rendimiento

El único dato de benchmark disponible es la tasa de rechazo (refusal rate) declarada por el autor en la model card. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

| Tarea | Métrica | Valor |
|---|---|---|
| text-generation | Refusal Rate (%) | 5 |

Este valor indica que el modelo rechaza solo el 5% de las solicitudes dañinas probadas, lo que confirma la efectividad de la abliteración, pero no proporciona información sobre la calidad general de generación.

## Requisitos de hardware

- El modelo tiene 228,7 mil millones de parámetros. En precisión FP16 o BF16, el peso ocupa aproximadamente 457 GB (el tamaño del repositorio es de 457,5 GB), por lo que se necesitan múltiples GPUs de alta gama para cargar el modelo completo en memoria.
- Para inferencia en FP16, se estima que se requieren al menos 8 GPUs con 80 GB de VRAM cada una (por ejemplo, 8x A100 80GB o 8x H100 80GB). No se dispone de datos sobre cuantizaciones que reduzcan el requisito de memoria.
- No es viable en GPUs de consumo (como RTX 4090 con 24 GB) sin cuantización extrema, que no está disponible en la información proporcionada.
- Opciones de despliegue: no se especifican, pero al ser un modelo con pesos en safetensors, podría usarse con frameworks como vLLM, TensorRT-LLM o DeepSpeed, siempre que se disponga de suficiente memoria. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base MiniMax-Text-01 es el punto de referencia, pero no se han publicado comparaciones con otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x22B o DeepSeek-V3) en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los mecanismos de rechazo, el modelo puede generar texto ofensivo, peligroso o ilegal. Su uso debe limitarse a entornos controlados y con fines de investigación.
- Sesgos conocidos: no se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado con datos de internet, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: la licencia "minimax-model-license" es propietaria y puede imponer restricciones al uso comercial o a la redistribución. Además, el acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones.
- Advertencia para producción: no se recomienda su uso en aplicaciones orientadas al usuario final sin filtros externos robustos, dado el alto riesgo de generar contenido inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/MiniMax-M2.5-abliterated
- Repositorio oficial de MiniMax M2.5: https://github.com/MiniMax-AI/MiniMax-M2.5
- Catálogo de Microsoft Foundry (descripción del modelo base): https://ai.azure.com/catalog/models/FW-MiniMax-M2.5
- Sitio web de MiniMax: https://www.minimax.io/
