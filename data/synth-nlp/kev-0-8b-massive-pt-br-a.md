# Synth-NLP/kev-0.8b-massive-pt-br-A

## Resumen

Kev-0.8B ajustado en MASSIVE pt-BR (brazo A) es un adaptador LoRA con cabeza de puntero (pointer head) construido sobre el modelo base `jaredpalmer/kev-0.8b`, un modelo de decisión de 0,8 mil millones de parámetros. Lo publica la organización Synth-NLP como parte de un experimento que compara el efecto de datos sintéticos generados por una pipeline agéntica frente a datos reales en tareas de clasificación de intención, evaluado en varias escalas de modelo (Laya, Kev-0.8B, 4B y 9B). La tarea concreta es la selección de intención en portugués de Brasil entre 20 opciones candidatas por frase.

El ajuste se realiza exclusivamente sobre las 5.405 frases reales del conjunto MASSIVE pt-BR, cubriendo 30 intenciones vistas durante el entrenamiento. El resultado es un modelo de decisión especializado, no un modelo generativo de propósito general: recibe una frase y un conjunto de 20 opciones de intención y devuelve la opción elegida mediante una cabeza de puntero sobre las representaciones del modelo base. Por tanto, su relevancia práctica está en pipelines de enrutamiento y clasificación de intenciones, no en generación de texto libre.

El repositorio ocupa 0,1 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. El modelo base permanece congelado en bf16 durante el entrenamiento y solo se actualizan los pesos delta del adaptador. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducir el brazo A del experimento comparativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (decision-model) sobre transformer; adaptador LoRA con pointer head sobre `jaredpalmer/kev-0.8b` |
| Parametros totales | 0,8B (modelo base); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el entrenamiento usa bf16) |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste delta mediante LoRA más una cabeza de puntero sobre el modelo base `jaredpalmer/kev-0.8b`, que permanece congelado en bf16. La cabeza de puntero selecciona una de las 20 opciones de intención proporcionadas en cada ejemplo, en lugar de generar texto. El entrenamiento se lanzó con el comando `python -m kev.train --init_from jaredpalmer/kev-0.8b`, con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0.

Los datos de entrenamiento son las 5.405 frases reales del conjunto MASSIVE pt-BR, con 30 intenciones vistas. Se desactivaron los aumentos propios de Kev: no se usa la opción "ninguna de las anteriores" ni distractores adicionales. La evaluación se realiza sobre la validación de MASSIVE pt-BR con 20 opciones y promedio de 3 sorteos, distinguiendo entre intenciones vistas y no vistas (escenarios reservados que nunca aparecen en el entrenamiento). No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable en un ajuste supervisado de clasificación.

## Capacidades

- Clasificación de intención en portugués de Brasil: elige una intención entre 20 opciones candidatas por frase.
- Generalización limitada a intenciones no vistas: alcanza 0,779 de precisión media en escenarios reservados que no aparecen en el entrenamiento.
- Decisión discriminativa mediante pointer head: no genera texto libre, devuelve una selección sobre el conjunto de opciones provisto.
- Despliegue como servicio mediante la API System One del ecosistema Kev (`python -m kev.serve --run <repo>`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al portugués de Brasil según la model card.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales en portugués: el modelo recibe la frase del usuario y un conjunto acotado de 20 intenciones candidatas y devuelve la más probable, lo que permite dirigir la conversación al flujo adecuado sin un LLM generativo.
- Clasificación en centros de atención al cliente: con 0,921 de precisión en intenciones vistas, es adecuado para triaje de tickets y mensajes entrantes en portugués de Brasil dentro de un catálogo de intenciones estable.
- Enrutamiento de comandos en interfaces de voz o chatbots de dominio cerrado: al trabajar sobre opciones explícitas, evita respuestas fuera de catálogo y facilita la validación downstream.
- Componente de un pipeline agéntico: puede actuar como primer nivel de decisión que selecciona la herramienta o subflujo a invocar, delegando la ejecución a modelos mayores.
- Investigación comparativa sobre datos sintéticos frente a reales: el repositorio forma parte de un experimento controlado con el mismo conjunto de frases y opciones que el brazo equivalente de Laya, lo que permite comparaciones reproducibles entre escalas.
- Evaluación de robustez ante intenciones no vistas: con 0,779 en escenarios reservados, sirve para medir la degradación de modelos pequeños de decisión cuando el catálogo de intenciones se amplía.
- Prototipado rápido en local: al ser un adaptador sobre un modelo de 0,8B en safetensors, se puede servir con la API System One del proyecto Kev en entornos con recursos limitados.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, 20 opciones, media de 3 sorteos | Precisión en intenciones vistas | 0,921 |
| MASSIVE pt-BR, validación, 20 opciones, media de 3 sorteos | Precisión en intenciones no vistas (escenarios reservados) | 0,779 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas directas con los otros brazos del experimento (Laya, 4B, 9B).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de 0,8B en bf16 requiere aproximadamente 1,6 GB solo para pesos, más el adaptador LoRA y la cabeza de puntero, por lo que en la práctica debería caber en GPUs de consumo con 8 GB o más, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer reciente (RTX 3060 en adelante) debería ser suficiente para el modelo base en bf16.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 0,8B, aunque no se documenta una configuración mínima validada.
- Opciones de despliegue: API System One del ecosistema Kev mediante `uv run --extra serve python -m kev.serve --run <este repo>`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-0.8b-massive-pt-br-A | 0,8B (base) | No disponible | Clasificación de intención pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| Brazo equivalente de Laya (mismo experimento) | No disponible | No disponible | Clasificación de intención pt-BR (20 opciones) | No disponible | No disponible |
| Brazos de 4B y 9B del mismo experimento | 4B y 9B | No disponible | Clasificación de intención pt-BR (20 opciones) | No disponible | No disponible |

No se dispone de datos numéricos comparativos entre brazos en la información proporcionada, por lo que no es posible establecer diferencias de rendimiento entre escalas.

## Limitaciones y advertencias

- El modelo está especializado en clasificación de intención en portugués de Brasil; no es un modelo generativo de propósito general y no debe usarse para tareas fuera de ese dominio.
- La precisión cae de 0,921 a 0,779 cuando las intenciones no han sido vistas durante el entrenamiento, lo que indica una generalización limitada a catálogos nuevos.
- El entrenamiento se realizó sin los aumentos propios de Kev (sin "ninguna de las anteriores" ni distractores adicionales), por lo que el modelo puede no manejar bien entradas fuera de catálogo o frases ambiguas.
- Los datos de entrenamiento provienen exclusivamente de MASSIVE pt-BR (5.405 frases, 30 intenciones vistas), lo que limita la cobertura de dominios y estilos de habla no representados en ese corpus.
- No se documentan sesgos específicos, pero al entrenar sobre un corpus concreto hereda las distribuciones y posibles sesgos de MASSIVE pt-BR.
- No hay información sobre latencia, throughput ni configuraciones de cuantización validadas en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `jaredpalmer/kev-0.8b` antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-0.8b-massive-pt-br-A
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Conjunto de datos MASSIVE: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio del proyecto Kev: no disponible en la información proporcionada
