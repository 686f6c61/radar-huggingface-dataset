# Synth-NLP/bussola-kev-9b-ptbr

## Resumen

Bússola-Kev-9B es un modelo de clasificación de intenciones en portugués de Brasil desarrollado por Synth-NLP. Recibe una frase en portugués junto con una lista de opciones (intenciones candidatas) y selecciona la que mejor se corresponde con el propósito del usuario, por ejemplo "vai chover amanhã?" → `consultar clima`. No es un generador de texto libre, sino un modelo de decisión con una "pointer head" que elige entre las opciones proporcionadas en la entrada.

Técnicamente es un ajuste delta (LoRA más pointer head) sobre el modelo base `jaredpalmer/kev-9b`, con la base congelada y entrenado con datos sintéticos en pt-BR generados mediante una pipeline agéntica con modelos abiertos, combinados con los ejemplos reales del conjunto MASSIVE pt-BR. Forma parte de la familia Bússola, un experimento que evalúa si los datos sintéticos en portugués mejoran clasificadores de intención, especialmente en intenciones no vistas durante el entrenamiento.

El modelo es relevante porque aborda el problema de la generalización a intenciones no vistas en un escenario de clasificación con 20 opciones por frase y sin acceso a ejemplos de esas intenciones en el entrenamiento. Según la model card, alcanza una precisión de 0,861 en el conjunto de escenarios no vistos, empatando con la referencia propietaria Jev (0,863) y superándola en los escenarios vistos (0,929 frente a 0,864).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ajuste delta (LoRA + pointer head) sobre `jaredpalmer/kev-9b`; base congelada |
| Parámetros totales | 9B (heredados del modelo base; el ajuste añade LoRA + pointer head) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jaredpalmer/kev-9b` y aplica un ajuste delta consistente en LoRA más una pointer head, manteniendo la base congelada. La tarea es de selección de intención: dada una frase y una lista de opciones, el modelo puntúa y elige una de ellas. El entrenamiento usó LoRA con lr 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0, con los aumentos de datos propios de Kev desactivados.

El conjunto de entrenamiento contiene 25.788 líneas: 5.405 ejemplos reales de 30 intenciones (MASSIVE pt-BR) y 20.383 frases sintéticas, de las cuales una parte corresponde a esas 30 intenciones y otra a 30 intenciones nuevas. Los datos sintéticos se generaron mediante una pipeline agéntica que: planifica peticiones variadas por intención (con personas, situaciones cotidianas, estilos de escritura reales de oasst1 y peticiones contrastivas contra la intención vecina más parecida); genera las frases con Gemma 4 12B y Qwen3.5-9B, reescribiendo parte de ellas con Evol-Instruct para aumentar la dificultad; filtra duplicados y frases demasiado similares a los datos de test mediante Qwen3-Embedding-0.6B; juzga con dos jueces LLM que deben coincidir en la intención, más una nota de naturalidad; y selecciona las frases difíciles para el modelo, usando sus errores para solicitar la siguiente ronda (LLM2LLM).

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante elección entre una lista de opciones proporcionada en la entrada.
- Selección de la intención más probable entre 20 opciones por frase (escenario de evaluación del MASSIVE pt-BR).
- Generalización a intenciones no vistas durante el entrenamiento (escenarios completos reservados sin frases, intenciones ni dominios en el entrenamiento ni en la generación de sintéticos).
- Manejo de peticiones variadas en estilo y registro, gracias al entrenamiento con personas y estilos de escritura reales.
- Discriminación frente a intenciones vecinas similares, mediante ejemplos contrastivos generados en la pipeline.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto libre: es un modelo de decisión acotado a la tarea de clasificación.
- Capacidades multilingües: limitadas al portugués (pt-BR).

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: dada la frase del usuario y el catálogo de intenciones del sistema, el modelo selecciona la intención para dirigir la consulta al flujo o servicio adecuado (por ejemplo, `consultar clima`, `consultar saldo`).
- Clasificación de tickets de soporte: con una lista de categorías definidas por el negocio, el modelo asigna cada mensaje entrante a una categoría, aprovechando su entrenamiento con estilos de escritura variados.
- Enrutamiento en chatbots de atención al cliente: integrado en el pipeline previo a la respuesta, decide qué habilidad o endpoint debe atender la petición sin necesidad de un LLM generativo.
- Análisis de intención en encuestas y formularios abiertos: mapear respuestas de texto libre a un conjunto cerrado de opciones predefinidas para su explotación estadística.
- Clasificación con catálogos cambiantes: al recibir las opciones en la propia entrada, el modelo puede adaptarse a nuevas taxonomías de intenciones sin reentrenamiento, siempre que las opciones se describan adecuadamente.
- Evaluación de sistemas de clasificación de intenciones: servir como referencia open source en portugués para comparar con APIs propietarias en escenarios de intenciones vistas y no vistas.
- Moderación o triaje de mensajes: asignar mensajes a categorías operativas (consulta, queja, cancelación) en un primer filtro antes de un procesamiento más costoso.

## Benchmarks y rendimiento

Precisión en la validación del MASSIVE pt-BR con 20 opciones por frase (azar = 0,050). "No vistas" son escenarios completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de los sintéticos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Bússola-Kev-4B | kev-4b | 0,867 | 0,933 |
| **Bússola-Kev-9B** (este) | kev-9b | **0,861** | **0,929** |
| Bússola-Kev-0.8B | kev-0.8b | 0,815 | 0,917 |
| Bússola-Laya | laya | 0,763 | 0,908 |

Ablación del efecto de los datos sintéticos con el mismo modelo base:

| Configuración | No vistas | Vistas |
|---|---:|---:|
| Sin ajuste | 0,776 | 0,807 |
| Ajustado solo con los 5.405 ejemplos reales | 0,856 | 0,925 |
| Ajustado con reales + sintéticos (Bússola) | 0,861 | 0,929 |

El ganancia del sintético sobre el ajuste solo con reales en las no vistas es de +0,6 puntos con intervalo de confianza del 95% de [−0,4; +1,6], no significativa (bootstrap pareado por frase). En las vistas, reales y reales + sintéticos empatan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 9B en bf16 requiere del orden de 18 GB solo para pesos, más memoria para activaciones y la pointer head; las cifras exactas no se han publicado.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependerá de la cuantización disponible y del código de servicio de Kev.
- Opciones de despliegue: el autor indica el servidor de Kev con la API System One mediante `uv run --extra serve python -m kev.serve --run Synth-NLP/bussola-kev-9b-ptbr`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Bússola-Kev-9B | kev-9b | 9B | 0,861 | 0,929 | apache-2.0 | Hugging Face |
| Bússola-Kev-4B | kev-4b | 4B | 0,867 | 0,933 | no disponible en la información | Hugging Face |
| Bússola-Kev-0.8B | kev-0.8b | 0,8B | 0,815 | 0,917 | no disponible en la información | Hugging Face |
| Bússola-Laya | laya | no disponible | 0,763 | 0,908 | no disponible en la información | Hugging Face |
| Jev (API de TypeSafe) | — | no disponible | 0,863 | 0,864 | propietaria | API |

El modelo de 4B obtiene resultados ligeramente superiores al de 9B en ambos regímenes (0,867 frente a 0,861 en no vistas; 0,933 frente a 0,929 en vistas), lo que sugiere que el aumento de tamaño no aporta ventaja en esta tarea concreta.

## Limitaciones y advertencias

- Una sola semilla de entrenamiento en los modelos Kev, lo que limita la robustez estadística de las conclusiones.
- Una única tarea (elección de intención) y un único conjunto de datos (MASSIVE pt-BR); no se ha validado en otros dominios o catálogos de intenciones.
- El pt-BR del MASSIVE es una localización generada por LLM a partir del pt-PT, con posibles artefactos de traducción.
- El beneficio de los datos sintéticos sobre el ajuste solo con reales no es estadísticamente significativo en las intenciones no vistas (+0,6 puntos, IC [−0,4; +1,6]).
- La comparación con Jev se realizó con un solo sorteo de opciones (el 0), mientras que las métricas propias promedian 3 sorteos, lo que introduce una asimetría metodológica.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de asignación errónea de intención cuando la frase es ambigua o cae fuera de las opciones proporcionadas.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos sintéticos generados por LLM y con MASSIVE, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0, la del modelo base; los pesos derivan de `jaredpalmer/kev-9b`. Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, y las frases reales del MASSIVE son © Amazon.com, Inc. o afiliadas (CC BY 4.0), por lo que conviene revisar las condiciones de atribución en uso comercial.
- Uso limitado al portugués de Brasil; no se ha evaluado su comportamiento en otras variantes del portugués.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/bussola-kev-9b-ptbr
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Código de Kev: https://github.com/jaredpalmer/kev
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
- Bússola-Kev-4B: https://huggingface.co/Synth-NLP/bussola-kev-4b-ptbr
- Bússola-Kev-0.8B: https://huggingface.co/Synth-NLP/bussola-kev-0.8b-ptbr
- Bússola-Laya: https://huggingface.co/Synth-NLP/bussola-laya-ptbr
- Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
