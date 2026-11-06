# souvickdascmsa019/compliance-decisions-0.8b

## Resumen

Compliance Decisions 0.8B es un adaptador LoRA con cabeza de decisión, publicado por el usuario de Hugging Face souvickdascmsa019 (Souvick Das), que convierte el modelo base unsloth/Qwen3.5-0.8B en un modelo de decisión tipado en lugar de un modelo conversacional. El modelo no genera prosa: recibe un caso (state) y una hoja fija de preguntas tipadas, y devuelve para cada pregunta una distribución de probabilidad sobre las opciones disponibles. Está pensado para triaje, enrutamiento y decisiones sensibles a la calibración en el ámbito del cumplimiento normativo y regulatorio.

Se construye sobre la receta Clef de Unsloth, que combina un adaptador LoRA sobre el backbone con una cabeza de decisión de esquema conjunto. El modelo base es Qwen3.5-0.8B (Apache-2.0), un transformer de 0,8 mil millones de parámetros, y el adaptador se entrena con 2 épocas y 1246 pasos sobre una mezcla de datos legales (PrivaCI-Bench, AIReg-Bench) y decisiones generales. El resultado es un artefacto de unos 0,1 GB distribuido en formato safetensors bajo licencia Apache-2.0.

La relevancia del modelo reside en su enfoque: en lugar de medir fluidez, mide calibración y exactitud sobre decisiones verificables por máquina. Sin embargo, es un modelo pequeño (0,8B), no está calibrado en esta release y sus resultados en el split de test en distribución están inflados por solapamiento de vocabulario con el entrenamiento, por lo que la transferencia real debe juzgarse sobre el split out-of-distribution.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3_5ForConditionalGeneration + cabeza de decisión Clef de esquema conjunto (hidden 1024 → width 512, 4 capas, 8 cabezas, feedforward 2048) |
| Parametros totales | 0,8B (modelo base) + adaptador LoRA (r=16, alpha=16) + cabeza de decisión; no se detalla el recuento exacto del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (max_seq_length de entrenamiento); el serving lee hasta 16384 |
| Tipos de cuantizacion | 4-bit nf4 para el backbone; cabeza en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador + cabeza de decisión, no fusionados) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-0.8B, un transformer de 0,8B parámetros, y le añade un adaptador LoRA (r=16, alpha=16, dropout=0) sobre las capas del lenguaje, más una cabeza de decisión Clef entrenada en fp32. La cabeza es un módulo de esquema conjunto con dimensión oculta 1024, anchura 512, 4 capas, 8 cabezas de atención y feedforward de 2048. El entrenamiento usa el DecisionTrainer de Unsloth con una función de pérdida de entropía cruzada suavizada por etiquetas más un término Brier, durante 2 épocas y 1246 pasos. El backbone se entrena y carga en 4-bit nf4.

Los datos de entrenamiento provienen de tres fuentes: PrivaCI-Bench (MIT), con casos legales y regulatorios de flujo de información; AIReg-Bench (CC-BY-4.0), con casos de documentación del Reglamento de IA; y LocalLLaMA/typed-decisions, que aporta el esquema y 1200 filas de decisiones generales añadidas al split de entrenamiento. La mezcla concreta de este modelo incluye filas legales, 60 filas de AIReg etiquetadas por profesor (usos 9-10) y 1200 filas generales. El split de entrenamiento suma 3802 filas más las 60 de AIReg y las 1200 generales, y abarca 21 identificadores de pregunta y 8 flujos de trabajo. Existe un split de calibración de 951 filas (4755 decisiones) que en esta release se dejó sin usar, por lo que el modelo se distribuye sin calibrar.

## Capacidades

- Responde preguntas tipadas de tres clases: `choice` (elegir una opción de un mapa clave → descripción, devolviendo etiqueta y probabilidades), `noul` (sí/no expresado como probabilidad de verdadero, con etiqueta true/false y probabilidades) y `score` (elegir un nivel ordenado de 0 a n-1, devolviendo índice de nivel y probabilidades).
- Devuelve siempre distribuciones de probabilidad por pregunta, lo que hace cada respuesta verificable por máquina.
- No genera prosa: su salida es estructurada y limitada a la hoja de preguntas proporcionada.
- Cubre decisiones legales y regulatorias (cumplimiento normativo, flujos de información, documentación del Reglamento de IA) y decisiones generales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.
- Requiere carga mediante `FastDecisionModel` de Unsloth; no funciona con `transformers`/`peft` estándar porque la cabeza de decisión no se carga por esas vías.

## Casos de uso

- Triaje de casos de cumplimiento: el modelo recibe la descripción del caso y una hoja de preguntas tipadas sobre flujos de información y devuelve, para cada pregunta, una distribución sobre las opciones; permite priorizar casos por probabilidad antes de la revisión humana.
- Enrutamiento de expedientes regulatorios: dado un caso de documentación del Reglamento de IA, el modelo asigna niveles ordenados (`score`) que pueden usarse para dirigir el expediente al equipo o al flujo de trabajo adecuado.
- Decisiones sensibles a la calibración: al devolver probabilidades en lugar de texto, permite umbralizar la confianza y derivar a revisión manual los casos con distribución ambigua, algo que un modelo conversacional no ofrece de forma nativa.
- Despliegue offline o embebido: con unos 0,5 GB en 4-bit, el modelo puede ejecutarse en entornos sin conexión o integrado en sistemas internos donde no se permite enviar datos a servicios externos.
- Automatización de cuestionarios de evaluación de proveedores: la hoja de preguntas tipadas encaja con formularios fijos de compliance, de modo que el modelo rellena cada pregunta con una distribución y no con una respuesta en prosa difícil de validar.
- Filtrado previo en pipelines de revisión legal: el modelo puede clasificar grandes volúmenes de casos con las mismas 21 preguntas y 8 flujos de trabajo sobre los que fue entrenado, reduciendo el trabajo manual de primera pasada.
- Investigación sobre calibración de modelos pequeños: al publicar métricas de ECE y comparar splits en distribución y fuera de distribución, sirve como referencia para estudiar la calibración de decisiones tipadas en modelos de 0,8B.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con un mismo arnés sobre filas idénticas (exactitud agrupada y error de calibración ECE):

| Split | Exactitud | ECE | Nota |
|---|---:|---:|---|
| `test` (legal, en distribución) | 0,8906 | 0,0237 | comparte vocabulario de PrivaCI con el entrenamiento |
| `test_aireg` (legal, fuera de distribución) | 0,7778 | 0,0869 | prueba honesta de transferencia |
| `test_general` (general, retenido) | 0,7745 | 0,1406 | por encima de la línea de acuerdo con el profesor de ese benchmark (0,735) |
| Los tres agrupados | 0,8586 | — | 8565 decisiones |

El autor indica que, sobre las mismas filas, un modelo frontera alojado obtiene aproximadamente 0,77-0,78 en `test_aireg` y empata con este modelo en `test_general`, mientras que en el split `test` en distribución el fine-tune gana por unos 12 puntos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con carga en 4-bit (`load_in_4bit=True`), según indica el autor; se recomienda encarecidamente una GPU.
- GPU recomendadas: no se especifican modelos concretos; dado el tamaño de 0,8B en 4-bit, cabe en GPU de consumo, aunque el autor no detalla cuáles.
- Cabe en GPU de consumo: sí, por el tamaño reducido (unos 0,5 GB en 4-bit), aunque no se enumeran modelos concretos.
- Opciones de despliegue: carga mediante `FastDecisionModel.from_pretrained` de Unsloth con `max_seq_length=4096` y `load_in_4bit=True`, seguido de `FastDecisionModel.for_inference(model)`. No es compatible con `transformers`/`peft` estándar porque la cabeza de decisión no se carga por esas vías; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Compliance Decisions 0.8B | 0,8B + adaptador LoRA + cabeza Clef | 4096 (serving hasta 16384) | Decisiones tipadas con distribución de probabilidad | Apache-2.0 | Hugging Face (adaptador PEFT/Clef) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto conversacional | Apache-2.0 | Hugging Face (unsloth/Qwen3.5-0.8B) |
| Modelo frontera alojado (sin especificar) | no disponible | no disponible | Generación de texto general | no disponible | Servicio alojado |

El autor compara su modelo con un modelo frontera alojado no identificado: en `test_aireg` este último obtiene aproximadamente 0,77-0,78 frente a 0,7778 del fine-tune, y en `test_general` ambos empatan, mientras que en `test` en distribución el fine-tune supera al frontera por unos 12 puntos. No se dispone de comparativas con otros modelos de decisión tipada.

## Limitaciones y advertencias

- No es una fuente de asesoramiento legal ni un generador de prosa: solo responde a las preguntas de la hoja que se le entrega.
- No está validado para preguntas o flujos de trabajo fuera de las formas de hoja con las que fue entrenado (21 identificadores de pregunta y 8 flujos de trabajo).
- Esta release está sin calibrar: el split de calibración de 951 filas se dejó sin usar, por lo que la confianza debe tratarse como aproximada.
- El split `test` sobreestima la calidad: comparte la fuente y el split oficial de PrivaCI-Bench con el entrenamiento, de modo que el 0,8906 se debe en parte al solapamiento de vocabulario y no al razonamiento legal. La transferencia real debe juzgarse sobre `test_aireg`.
- La procedencia del gold es mixta: etiquetas de expertos (PrivaCI), etiquetas de profesor (AIReg, usos 9-10) y gold promediado por profesor del benchmark general. El acuerdo con un profesor no equivale a corrección.
- Modelo pequeño (0,8B): capacidad limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación: no evaluado explícitamente en la información disponible; al devolver distribuciones sobre opciones fijas, el riesgo se traslada a la asignación de probabilidad, no a la generación de texto libre.
- Sesgos conocidos: no disponible.
- Restricciones de licencia para uso comercial: licencia Apache-2.0, que permite uso comercial; deben respetarse las licencias de los datos de entrenamiento (PrivaCI-Bench MIT, AIReg-Bench CC-BY-4.0).
- Para producción: es imprescindible cargar el modelo mediante `FastDecisionModel`; con `transformers`/`peft` estándar el modelo carga pero no puede responder a la hoja de preguntas al faltar la cabeza de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/souvickdascmsa019/compliance-decisions-0.8b
- Perfil del autor: https://huggingface.co/souvickdascmsa019
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Dataset de esquema: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- PrivaCI-Bench: https://github.com/HKUST-KnowComp/PrivaCI-Bench
- AIReg-Bench: https://github.com/camlsys/aireg-bench
