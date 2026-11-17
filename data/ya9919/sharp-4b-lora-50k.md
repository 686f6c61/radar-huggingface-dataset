# ya9919/sharp-4b-lora-50k

## Resumen

Sharp-4b-lora-50k es un adaptador LoRA con cabeza de decisión escalar compartida, entrenado sobre el modelo base Qwen3.5-4B-Base. Lo publica el usuario ya9919 como parte del proyecto S²-MAS (Society-scale Multi-Agent Simulation), un marco de simulación multiagente a escala social orientado a estudiar cómo las decisiones de los hogares afectan al consumo, las reservas de efectivo y los pagos. El modelo no es un generador de texto conversacional, sino un componente de clasificación: recibe un estado del hogar, una pregunta de finanzas personales y un menú completo de candidatos, y puntúa cada opción para emitir una decisión.

El checkpoint se enmarca en una comparativa de seis rutas de modelado de decisión (puntuación por encoder, modelos de lenguaje con cabeza de decisión, SFT de decisión por siguiente token, clasificación con esquema dinámico, decisiones con encoder multimodal e interfaces de proveedor). Esta variante concreta representa la ruta "modelo de lenguaje más cabeza de decisión aprendida" y se entrena con 50.000 filas distintas de un diseño anidado de 50k/200k, empleando datos de encuestas reales.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para investigar la adaptación de bajo presupuesto de modelos de 4B en tareas de decisión financiera estructurada, con una licencia de investigación controlada que restringe el uso comercial y la redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de decisión escalar compartida |
| Parametros totales | 4B en el backbone (adaptador LoRA de tamaño no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia reportada en BF16 para el backbone y FP32 para la puntuación de candidatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (uso científico no comercial, sin redistribución, sin ingeniería inversa, extracción o destilación no autorizadas) |
| Formato de pesos | safetensors (adapter/adapter_model.safetensors) más head.pt y adapter/adapter_config.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder-only preentrenado de 4.000 millones de parámetros en su versión oficial "Base" (solo preentrenamiento, sin ajuste de instrucciones). Sobre ese backbone se aplica un adaptador LoRA que modifica la representación interna, junto con una cabeza de decisión escalar compartida que puntúa cada candidato del menú. La inferencia puntúa conjuntamente el estado completo, la pregunta y el menú íntegro de candidatos, de modo que el modelo no genera texto libre sino que produce una puntuación por opción.

El entrenamiento usa 50.000 filas distintas de la partición fija de QA de decisión, con 50.000 exposiciones acumuladas en la etapa seleccionada. La selección del checkpoint se realiza con un conjunto de desarrollo fijo de 20.000 ejemplos, mientras que la comparación entre los dos métodos de adaptación de Qwen4B a 200k emplea la partición de desarrollo completa de 412.873 ejemplos. Los datos de aprendizaje de decisiones provienen de encuestas reales. La implementación del motor GENESE/MAS permanece privada y no se distribuye. El modelo se compara con su contrapartida "head only", que mantiene el backbone congelado con el mismo presupuesto de ejemplos únicos.

## Capacidades

- Clasificación de decisiones financieras de hogar: responde preguntas de elección múltiple sobre productos y hábitos financieros (tarjetas de crédito activas, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos).
- Puntuación de menús de candidatos completos: evalúa todas las opciones disponibles en lugar de generar una respuesta libre.
- Condicionamiento por estado del hogar: la inferencia requiere proporcionar un estado del hogar para producir la decisión.
- Adaptación de representación vía LoRA sobre un backbone de 4B, con cabeza de decisión compartida entre preguntas.
- Salida determinista con cero decisiones inválidas en el conjunto de test reportado.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en simulación multiagente: integrar el checkpoint como política de decisión de hogares sintéticos dentro del marco S²-MAS para estudiar efectos sobre consumo, reservas y pagos. Es adecuado porque su interfaz de puntuación de candidatos encaja con el motor de transición de estados del proyecto.
- Reproducción de comparativas académicas: usar el checkpoint como referencia de la ruta "modelo de lenguaje más cabeza de decisión" frente a las otras cinco rutas del benchmark, con las mismas 240.458 preguntas de test.
- Estudio de adaptación de bajo presupuesto: analizar cuánto mejora un LoRA de 50k filas frente al backbone congelado (67,34 % a 73,73 % de accuracy) para dimensionar el coste-beneficio del ajuste.
- Evaluación de robustez en QA financiero estructurado: medir F1 macro por pregunta sobre 119 versiones de pregunta y 8.275 grupos de hogar, útil para detectar sesgos por clase de candidato.
- Prototipado de encuestas sintéticas: generar respuestas plausibles a preguntas de tenencia de productos financieros para prellenar o validar cuestionarios, siempre en un contexto de investigación no comercial.
- Docencia y divulgación sobre modelado de decisiones: ilustrar cómo una cabeza de decisión sobre un LLM puede sustituir a la generación de texto en tareas de clasificación con menús cerrados.

## Benchmarks y rendimiento

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (LoRA + cabeza, 50k) | 73,7289 | 36,6225 | 0 |
| Qwen4B solo cabeza, mismos 50k QA únicos | 67,3369 | 31,0166 | 0 |

El conjunto de test común contiene 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. La accuracy pondera por igual cada registro y cuenta las decisiones inválidas como incorrectas; el F1 macro por pregunta promedia sobre cada clase candidata definida dentro de cada versión de pregunta y pondera las 119 versiones por igual. El checkpoint se selecciona con datos de desarrollo antes de evaluar en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un backbone de 4B en BF16, se requieren aproximadamente 8 GB solo para los pesos, más memoria para el estado de activación y la puntuación de candidatos en FP32.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con 16 GB o más permitiría ejecutar el backbone en BF16.
- GPU de consumo: un backbone de 4B en BF16 cabe previsiblemente en tarjetas con 16 GB o más; no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: la model card solo menciona el script `qwen_decision.py` como interfaz de puntuación de candidatos, junto con el paquete local y el backbone y tokenizador oficiales indicados en `decision_config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sharp-4b-lora-50k | 4B (backbone) + LoRA | No disponible | 73,73 % accuracy; 36,62 % F1 macro | S²-MAS v1.2 (no comercial) | Hugging Face (adaptador) |
| Qwen4B head only, 50k | 4B (backbone congelado) + cabeza | No disponible | 67,34 % accuracy; 31,02 % F1 macro | No disponible | Referencia interna del proyecto |
| Otras rutas del benchmark S²-MAS | No disponible | No disponible | No disponible | No disponible | Entradas del repositorio del proyecto |

No se dispone de datos públicos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: S²-MAS Controlled Model Research License v1.2 permite únicamente uso científico no comercial, prohíbe la redistribución y veta la ingeniería inversa, extracción o destilación no autorizadas.
- El modelo no es un generador de texto: requiere un estado del hogar y un menú de candidatos para inferir; no responde a prompts conversacionales genéricos.
- Solo inglés: no hay soporte multilingüe documentado.
- Dominio muy estrecho: entrenado exclusivamente para QA de decisión financiera de hogares; su uso fuera de ese ámbito no está validado.
- Riesgo de alucinación no evaluado en esta configuración: al ser una cabeza de puntuación sobre candidatos cerrados, el riesgo se traslada a una clasificación errónea más que a texto inventado, pero no se han publicado análisis de calibración.
- F1 macro por pregunta relativamente bajo (36,62 %): indica dificultad para discriminar entre clases candidatas dentro de algunas versiones de pregunta, pese a la accuracy global del 73,73 %.
- Dependencia de componentes privados: el motor GENESE/MAS no es público y el adaptador requiere obtener por separado el backbone y el tokenizador oficiales.
- Tamaño del repositorio reducido (0,1 GB): contiene solo el adaptador y la cabeza, no los pesos completos del backbone.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-4b-lora-50k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Licencia: https://huggingface.co/ya9919/qwen3.5-4b-base-finance-lora-head-50k/blob/main/LICENSE
