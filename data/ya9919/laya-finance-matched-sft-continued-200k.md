# ya9919/laya-finance-matched-sft-continued-200k

## Resumen

`laya-finance-matched-sft-continued-200k` es un checkpoint de la familia Laya publicado por el usuario `ya9919`. No es un modelo generativo al uso: la model card lo describe como un **encoder afinado más una cabeza de decisión nativa** (*decision head*), es decir, un modelo discriminativo para responder preguntas financieras de opción múltiple. Cuenta con 421.293.830 parámetros totales (0,42 B) almacenados en FP16 y un repositorio de 0,8 GB.

El modelo parte de `ya9919/laya-finance-matched-sft-200k` y aplica una pasada adicional de ajuste supervisado (`native-laya-sft-continued`) sobre el mismo conjunto de filas downstream: 200.000 filas distintas del *split* de entrenamiento de un corpus QA inglés de cuatro fuentes. El checkpoint liberado corresponde a 50.688 exposiciones de fila en esta etapa, con 250.688 exposiciones acumuladas. La selección del checkpoint se hizo sobre un *dev* fijo de 20.000 filas, priorizando F1 macro por pregunta y, en segundo lugar, exactitud.

Su relevancia es acotada y muy específica: sirve como componente de evaluación/respuesta en pipelines de investigación sobre encuestas financieras de hogares (subconjunto común CHFS/CGSS), no como asistente conversacional. La licencia de los artefactos es Apache-2.0, pero los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`, lo que condiciona el uso comercial del modelo derivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder con cabeza de decisión nativa (*decision head*); familia Laya, etiqueta `s2-mas`. No se detalla la arquitectura interna del encoder en la información disponible |
| Parámetros totales | 421.293.830 (0,42 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La configuración registra la ventana de entrenamiento; la receta de evaluación exacta calcula ventanas de tokens suficientes y rechaza el desbordamiento en lugar de truncar |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en FP16 nativo; no se publican variantes GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 para los artefactos, con atribución al modelo base. Los datos de entrenamiento se rigen por `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | `safetensors` (FP16), junto con `rl_agent_config.json`, `encoder/config.json`, `tokenizer/tokenizer.json` y `tokenizer/tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura combina un encoder afinado con una cabeza de decisión original que puntúa opciones de respuesta. La inferencia exacta consume el estado completo de la pregunta y **todas** las opciones, sin truncar entradas de forma silenciosa; la propia model card advierte que la ventana registrada en la configuración corresponde al entrenamiento y no debe interpretarse como una instrucción para recortar entradas de evaluación más largas.

El entrenamiento es un SFT nativo en dos etapas. La primera produjo `laya-finance-matched-sft-200k`; esta segunda etapa (`native-laya-sft-continued`) hace una pasada adicional sobre el mismo conjunto de 200.000 filas distintas procedentes del *train split* QA inglés de cuatro fuentes. El checkpoint final se eligió con un *dev* fijo de 20.000 filas usando F1 macro por pregunta y, como criterio de desempate, exactitud. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo RLHF o DPO; la presencia de `rl_agent_config.json` en el paquete no se explica en la model card.

## Capacidades

- Respuesta a preguntas financieras de opción múltiple sobre un estado, una pregunta y un conjunto de opciones, devolviendo una decisión (no texto libre).
- Evaluación con entradas completas: la receta nativa calcula las ventanas de tokens necesarias y falla explícitamente si hay desbordamiento, en lugar de truncar.
- Cero predicciones inválidas en el conjunto de evaluación reportado (240.458 filas, 119 versiones de pregunta).
- Capacidad de servir como base para ajuste adicional en dominios financieros afines, al estar los pesos completos en FP16.
- **No** dispone de generación de texto libre, *tool calling*, *function calling*, razonamiento multi-paso, capacidades de agente, visión ni audio, según la información disponible.
- Multilingüe: no. Solo inglés declarado.
- No se documentan modos especiales (*thinking*, visión, audio) ni soporte de instrucciones en lenguaje natural.

## Casos de uso

- **Codificación automática de respuestas en encuestas financieras de hogares**: dado el texto de una respuesta y las opciones canónicas de la pregunta, el modelo selecciona la opción correcta. Es su función nativa y para la que fue entrenado (subconjunto CHFS/CGSS).
- **Armonización de cuestionarios entre estudios**: el conjunto de evaluación cubre 119 versiones de pregunta; el modelo puede mapear formulaciones equivalentes de distintas olas o encuestas a una misma categoría de respuesta.
- **Control de calidad en recogida de datos**: al devolver siempre una opción válida (0 predicciones inválidas en la evaluación reportada), sirve para detectar respuestas incoherentes o fuera de catálogo durante el trabajo de campo.
- **Pre-etiquetado para anotación humana**: genera etiquetas iniciales sobre grandes volúmenes de respuestas y el equipo humano revisa solo los casos de baja confianza, reduciendo el coste de anotación.
- **Componente de evaluación en pipelines de simulación multiagente**: el repositorio `mas-simulation` lo emplea como pieza de respuesta/evaluación dentro de un sistema de agentes; la model card indica que los resultados de simulación financiera se reportan por separado.
- **Reproducción de investigación académica**: con `laya==0.4.2`, PyTorch 2.12.1 y Transformers 5.19.0 se puede reproducir la métrica publicada sobre el subconjunto común congelado de 240.458 filas.
- **Punto de partida para *fine-tuning* de dominio**: al estar el encoder y la cabeza completos y en FP16, es reutilizable como inicialización para nuevas baterías de preguntas financieras.

## Benchmarks y rendimiento

Evaluación sobre el subconjunto común congelado CHFS/CGSS de 240.458 filas y 119 versiones de pregunta, con etiquetas observadas:

| Métrica | Valor |
|---|---:|
| Exactitud (accuracy) | 0,738985602 |
| F1 macro por pregunta (question-macro F1) | 0,361732126 |
| Predicciones inválidas | 0 |

Advertencias sobre estas cifras: el *split* de test inglés completo del repositorio de origen tiene 418.597 filas, un denominador distinto del usado aquí, por lo que las cifras no son directamente comparables con las de otros trabajos sobre ese *split*. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia a partir de los 421,3 M de parámetros: ~0,84 GB en FP16 (tamaño real del repositorio: 0,8 GB), ~1,7 GB en FP32, ~0,42 GB en INT8 y ~0,21 GB en INT4 (estas dos últimas son estimaciones aritméticas; no hay pesos cuantizados publicados).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso GTX 1650 4 GB. También es viable en CPU, como muestra el ejemplo de la model card (`torch.device("cpu")`).
- GPU de centro de datos (A100, H100) innecesarias por tamaño, aunque pueden usarse para evaluar lotes grandes en paralelo.
- Despliegue: paquete nativo `laya` con `laya.train.load_checkpoint`, PyTorch 2.12.1 y Transformers 5.19.0. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni motores de inferencia de LLM generativos, al no ser un modelo causal.
- Latencia y throughput: no disponibles. La evaluación exacta requiere calcular ventanas de tokens suficientes para entradas largas, lo que incrementa el coste respecto a un truncado simple.

## Comparativa con modelos similares

No se conocen en la información disponible otros modelos de la misma familia `s2-mas` con cabeza de decisión. Como alternativas de la misma categoría funcional (encoder para QA/clasificación financiera) se pueden considerar las siguientes; sus datos provienen de sus model cards públicas, no de la documentación de este modelo, y no hay comparación de benchmarks disponible:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ya9919/laya-finance-matched-sft-continued-200k` | 421,3 M | No disponible | QA financiera de opción múltiple con cabeza de decisión | Apache-2.0 (datos con términos propios) | HuggingFace, 0 descargas |
| `microsoft/deberta-v3-base` | 184 M | 512 tokens | Encoder general, ajustable a QA/clasificación | MIT | Ampliamente disponible |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Clasificación de sentimiento financiero | No verificada en la información disponible | Ampliamente disponible |
| Modelos generativos tipo LLaMA/Qwen en rango 0,5-1 B | 500-1.000 M | 2.000-32.000 tokens | Generación de texto y QA en lenguaje natural | Variables | Ampliamente disponibles |

La diferencia clave frente a las alternativas no es el rendimiento bruto, sino el formato de salida: este modelo emite una decisión sobre un conjunto cerrado de opciones, mientras que un encoder genérico o un LLM generativo requieren una capa adicional para forzar la respuesta al catálogo.

## Limitaciones y advertencias

- **Solo inglés.** No hay soporte declarado de otros idiomas, pese a que las fuentes de datos originales (CHFS/CGSS) son de origen chino.
- **F1 macro por pregunta muy bajo (0,36) frente a una exactitud de 0,74.** La brecha sugiere un comportamiento desigual entre las 119 versiones de pregunta, con posible concentración de aciertos en las clases mayoritarias. Es un indicador de riesgo para subpoblaciones de preguntas poco representadas.
- **No es un modelo generativo.** Cualquier caso de uso que requiera explicaciones, resúmenes o diálogo multi-turno queda fuera de su alcance; no hay *tool calling* ni capacidades de agente.
- **Sin validación comunitaria.** 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso independiente que respalde las métricas publicadas.
- **Riesgo de mala asignación de etiqueta** en lugar de alucinación de texto: el modelo siempre devuelve una opción, por lo que un error se manifiesta como una categoría incorrecta y silenciosa.
- **Licencia matizada.** Los artefactos son Apache-2.0, pero los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`. Antes de un uso comercial hay que revisar esos términos, que no se detallan en la model card.
- **Reproducibilidad frágil.** Requiere versiones concretas y poco habituales (`laya==0.4.2`, PyTorch 2.12.1, Transformers 5.19.0); no se garantiza el funcionamiento con otras combinaciones.
- **Comparabilidad de métricas.** El denominador de evaluación (240.458 filas) no coincide con el *split* de test completo (418.597 filas), por lo que las cifras no son extrapolables a ese conjunto mayor.
- **Fechas de publicación atípicas** (creación y actualización en octubre de 2026) y ausencia de pipeline declarado, lo que complica verificar el historial del artefacto.
- No se documentan sesgos demográficos ni geográficos del corpus de entrenamiento; tratándose de encuestas de finanzas de hogares, es esperable un sesgo hacia poblaciones encuestadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/laya-finance-matched-sft-continued-200k
- Modelo base: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Repositorio de reproducción e evidencia agregada (mas-simulation): https://github.com/KataDavidXD/mas-simulation
- Paquete nativo `laya` (versión 0.4.2): sin URL proporcionada en la información disponible
- Paper, blog o demo: no disponibles
