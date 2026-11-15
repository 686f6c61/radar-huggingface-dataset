# Synth-NLP/gliclass-v4-2b-massive-pt-br-B-v4

## Resumen

GLiClass v4-2B ajustada en MASSIVE pt-BR (brazo B_v4) es un modelo de decisión especializado en clasificación de intenciones para portugués de Brasil, desarrollado por Synth-NLP. Se trata de un fine-tuning del modelo base `knowledgator/gliclass-v4-2b`, que emplea la arquitectura GLiClass, un enfoque de clasificación zero-shot y few-shot basado en un decoder de lenguaje con atención cruzada sobre las etiquetas candidatas. El modelo resuelve el problema de asignar una de 20 intenciones posibles a una frase de entrada en portugués, en el contexto del dataset MASSIVE.

El interés de esta ficha reside en que forma parte de un experimento controlado que compara datos sintéticos generados por una pipeline agéntica frente a datos reales, y un modelo de decisión grande (2B parámetros) frente al modelo Laya multilingual. El brazo B_v4 emplea exclusivamente datos sintéticos (v4) de las 30 intenciones vistas, manteniendo el mismo número de ejemplos por intención que el entrenamiento real. El modelo tiene 2.364.417.347 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación reciente (creado el 15 de noviembre de 2026) orientado a experimentación, no a producción. Su relevancia es metodológica: permite evaluar si un modelo de decisión de mayor tamaño compensa la sustitución de datos reales por datos sintéticos en una tarea de clasificación de intenciones multilingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass (modelo de decisión sobre decoder transformer con atención a etiquetas) |
| Parametros totales | 2.364.417.347 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués, variante pt-BR) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `knowledgator/gliclass-v4-2b`, un modelo de decisión GLiClass. La arquitectura GLiClass está diseñada para clasificación eficiente: el texto de entrada se procesa junto con las etiquetas candidatas mediante un mecanismo de atención que permite al modelo puntuar cada etiqueta sin necesidad de generar texto libre. En este fine-tuning se emplea el modo single-label con decoder-kv, en precisión bf16, y se entrenan únicamente las últimas 30 % de las capas del decoder. El entrenamiento usa el `train.py` oficial de GLiClass con learning rate 2e-5 / 5e-5, tamaño de lote 8, 3 épocas y semilla 42.

Los datos de entrenamiento corresponden al brazo B_v4: exclusivamente datos sintéticos (generados por una pipeline agéntica, versión v4) de las 30 intenciones vistas, con el mismo número de ejemplos por intención que el conjunto de entrenamiento real. La evaluación se realiza sobre la validación de MASSIVE pt-BR con 20 opciones por frase, promediando 3 sorteos. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset sintético más allá de esta descripción.

## Capacidades

- Clasificación de intenciones en portugués de Brasil con 20 opciones candidatas por frase (single-label).
- Clasificación zero-shot y few-shot mediante el mecanismo de decisión de GLiClass, que puntúa etiquetas candidatas sin reentrenamiento.
- Manejo de intenciones vistas (presentes en el entrenamiento) y no vistas (escenarios reservados nunca vistos durante el entrenamiento).
- Especialización en el dominio del dataset MASSIVE pt-BR (asistentes virtuales y comandos de usuario).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al portugués; no se reportan capacidades en otros idiomas.

## Casos de uso

- Clasificación de intenciones en asistentes virtuales en portugués: el modelo asigna una de 20 intenciones a cada utterance del usuario, adecuado para enrutar consultas en un sistema de atención al cliente o un bot conversacional.
- Enrutamiento de comandos en aplicaciones de voz: integrado en la etapa de comprensión del lenguaje natural, permite decidir la acción a ejecutar a partir de una transcripción en pt-BR.
- Evaluación de datos sintéticos para NLP: sirve como referencia para medir si un modelo entrenado solo con datos sintéticos generaliza a intenciones no vistas, comparando con el brazo entrenado con datos reales.
- Investigación en clasificación zero-shot: su naturaleza de modelo de decisión permite probar nuevas etiquetas candidatas sin reentrenar, útil para prototipar taxonomías de intenciones.
- Benchmarking de modelos de decisión grandes frente a modelos multilingües más pequeños (Laya multilingual) en tareas de clasificación de intenciones.
- Filtrado y etiquetado de corpus en portugués: clasificación automática de frases de usuario en categorías predefinidas para construir datasets anotados.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, 20 opciones, intenciones vistas | Precisión media de 3 sorteos | 0.841 |
| MASSIVE pt-BR, validación, 20 opciones, intenciones no vistas | Precisión media de 3 sorteos | 0.825 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni métricas adicionales (F1, latencia, throughput).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,7 GB solo para pesos, más overhead de activaciones y del mecanismo de atención a etiquetas; se recomienda al menos 8-12 GB para un uso cómodo.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16 sin cuantización; RTX 3090 o similar también viable.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16; con cuantización a 8 bits o 4 bits podría ajustarse en GPUs de 8 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- Opciones de despliegue: el repositorio no documenta integraciones específicas; al ser un modelo GLiClass con pesos safetensors, requiere la librería `gliclass` o el pipeline correspondiente del ecosistema Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/gliclass-v4-2b-massive-pt-br-B-v4 | 2,36 B | no disponible | Apache 2.0 | Clasificación de intenciones pt-BR (MASSIVE) | Hugging Face |
| knowledgator/gliclass-v4-2b (base) | no disponible | no disponible | no disponible | Clasificación zero-shot general | Hugging Face |
| Laya multilingual | no disponible | no disponible | no disponible | Clasificación de intenciones multilingüe | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes; no ha sido validado por la comunidad ni sometido a pruebas de producción.
- Entrenado exclusivamente con datos sintéticos (brazo B_v4), lo que puede introducir sesgos o artefactos propios de la pipeline generadora.
- Especializado en el dominio y la taxonomía del dataset MASSIVE pt-BR; su rendimiento fuera de ese dominio o con taxonomías distintas no está documentado.
- Solo soporta portugués (pt-BR); no se reportan capacidades en otros idiomas.
- No se documentan sesgos conocidos, riesgo de alucinación (limitado por ser un modelo de decisión) ni restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial.
- La evaluación se limita a precisión media de 3 sorteos con 20 opciones; no hay métricas de calibración, robustez ni latencia.
- No se especifican requisitos de contexto ni longitudes máximas de entrada, lo que dificulta planificar su integración en pipelines con textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/gliclass-v4-2b-massive-pt-br-B-v4
- Modelo base: https://huggingface.co/knowledgator/gliclass-v4-2b
- Repositorio de GLiClass (referencia del autor base): no disponible en la información proporcionada
- Dataset MASSIVE: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
