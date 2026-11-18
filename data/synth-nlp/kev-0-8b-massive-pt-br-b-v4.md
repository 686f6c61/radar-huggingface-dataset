# Synth-NLP/kev-0.8b-massive-pt-br-B-v4

## Resumen

Kev-0.8b-massive-pt-br-B-v4 es un ajuste fino mediante LoRA sobre el modelo base jaredpalmer/kev-0.8b, un modelo de decisión de 0,8 mil millones de parámetros especializado en clasificación de intenciones. Lo desarrolla Synth-NLP como parte de un experimento comparativo que contrasta datos sintéticos generados por una pipeline agéntica frente a datos reales, evaluando el efecto en modelos de decisión de distintos tamaños (Laya, Kev-0.8B, 4B y 9B). El modelo se entrena sobre el conjunto de datos MASSIVE en portugués de Brasil (pt-BR), con 20 opciones de intención por frase.

La relevancia de esta ficha radica en que documenta un brazo experimental muy concreto: el brazo B_v4, que utiliza exclusivamente datos sintéticos de la pipeline v4 para las 30 intenciones vistas, manteniendo la misma distribución por intención que el entrenamiento con datos reales. Esto permite aislar el impacto del dato sintético en la tarea de selección de intención.

El modelo no es un generador de texto de propósito general, sino un cabezal de decisión con pointer head que selecciona una intención entre un conjunto cerrado de opciones. Su utilidad está acotada a pipelines de comprensión del lenguaje natural en portugués y a la investigación sobre calidad de datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base jaredpalmer/kev-0.8b) con adaptador LoRA y pointer head para selección de intención |
| Parametros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-0.8b, un transformer decoder-only de 0,8 mil millones de parámetros, y se ajusta mediante un delta LoRA junto con una pointer head que selecciona una de las 20 opciones de intención presentadas por frase. La base se congela en bf16 durante el entrenamiento, y los aumentos propios de Kev (la opción "ninguna de las anteriores" y los distractores extra) se desactivan en este brazo experimental.

El entrenamiento se realizó con el comando `python -m kev.train --init_from jaredpalmer/kev-0.8b`, con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Los datos del brazo B_v4 son exclusivamente sintéticos (pipeline v4) para las 30 intenciones vistas, con el mismo recuento por intención que el entrenamiento con datos reales, y las mismas filas y mismas 20 opciones que el brazo equivalente del modelo Laya. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset sintético.

## Capacidades

- Clasificación de intenciones en portugués de Brasil sobre un conjunto cerrado de 20 opciones por frase.
- Selección de la intención correcta entre opciones presentadas (tarea de decisión, no de generación libre).
- Generalización a intenciones no vistas durante el entrenamiento: 0,791 de precisión en escenarios reservados.
- Manejo de las 30 intenciones vistas en entrenamiento con 0,867 de precisión media en validación.
- Servido mediante API System One con el comando `uv run --extra serve python -m kev.serve --run <repo>`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; es un modelo de decisión acotado.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe una frase del usuario y un conjunto de 20 intenciones candidatas, y devuelve la más probable, integrándose en el enrutador de un bot de atención al cliente.
- Enrutamiento de consultas en sistemas de ticketing: dado un mensaje entrante en pt-BR, selecciona la categoría de intención para asignar el ticket al equipo adecuado.
- Investigación sobre datos sintéticos: sirve como brazo de control para medir la brecha de rendimiento entre entrenamiento con datos reales y sintéticos en tareas de decisión de dominio cerrado.
- Evaluación de modelos de decisión pequeños: al ser un ajuste de 0,8B, permite comparar la eficacia de modelos pequeños frente a variantes de 4B y 9B en la misma tarea y con los mismos datos.
- Prototipado rápido de clasificadores de intención: al estar bajo licencia Apache 2.0 y en safetensors, se puede desplegar en infraestructura propia sin restricciones comerciales.
- Análisis de robustez ante intenciones no vistas: el rendimiento de 0,791 en escenarios reservados lo hace útil para estudiar la generalización de clasificadores entrenados con datos sintéticos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en intenciones vistas (validación MASSIVE pt-BR, 20 opciones, media de 3 sorteos) | 0,867 |
| Precisión en intenciones no vistas (escenarios reservados, nunca vistos en entrenamiento) | 0,791 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,8B en bf16 se estiman en torno a 1,6 GB de pesos, y en cuantización de 8 bits alrededor de 0,8 GB, si bien el adaptador LoRA y la pointer head añaden una sobrecarga no cuantificada.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder alojar el modelo en bf16.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se confirma en la información disponible.
- Opciones de despliegue: el autor indica el servidor propio `python -m kev.serve` con la API System One; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en MASSIVE pt-BR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-0.8b-massive-pt-br-B-v4 | 0,8B | no disponible | 0,867 (vistas) / 0,791 (no vistas) | Apache 2.0 | Hugging Face |
| Laya (brazo B_v4, mismo experimento) | no disponible | no disponible | mismas filas y opciones que este brazo; resultado no disponible en la información | no disponible | no disponible |
| Kev-0.8B (base, sin ajuste MASSIVE) | 0,8B | no disponible | no disponible | no disponible | Hugging Face (jaredpalmer/kev-0.8b) |
| Variantes de 4B y 9B del mismo experimento | 4B y 9B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión acotado: no genera texto libre ni responde preguntas abiertas; solo selecciona entre un conjunto cerrado de 20 opciones de intención.
- Entrenado exclusivamente con datos sintéticos en el brazo B_v4, lo que puede introducir sesgos o artefactos propios de la pipeline generadora.
- Cobertura limitada a 30 intenciones vistas en entrenamiento; el rendimiento cae a 0,791 en escenarios reservados, lo que indica una brecha de generalización.
- Solo soporta portugués de Brasil; no se ha validado en otras variantes del portugués ni en otros idiomas.
- Los aumentos de Kev (opción "ninguna de las anteriores" y distractores extra) están desactivados, por lo que el modelo no está preparado para rechazar entradas fuera de dominio.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas confiadas en frases ambiguas o fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base jaredpalmer/kev-0.8b debe verificarse por separado en cuanto a sus propios términos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni pipeline declarada en Hugging Face.
- Fecha de creación y actualización registradas en 2026-11-15, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-0.8b-massive-pt-br-B-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Dataset MASSIVE (referencia del benchmark): no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código de la pipeline: no disponible en la información proporcionada
