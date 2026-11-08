# xtools-at/Qwen3.5-2B-Medical-Reasoning

## Resumen

Qwen3.5-2B-Medical-Reasoning es un adaptador LoRA publicado por xtools-at sobre el modelo xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic, que a su vez deriva de la familia Qwen3.5-2B de Alibaba. El objetivo es especializar un modelo pequeno (2.213.241.664 parametros totales segun los pesos en safetensors) en respuesta a preguntas medicas y razonamiento clinico paso a paso, aprovechando el subconjunto FreedomIntelligence/medical-o1-reasoning-SFT. La relevancia actual radica en la tendencia a destilar capacidades de razonamiento en modelos de 2B parametros que quepan en GPU de consumo y puedan ejecutarse localmente.

El modelo se entrena con SFT supervisado y LoRA (r=16, alpha=32, dropout=0.02), sobre 4.000 ejemplos seleccionados aleatoriamente del dataset, con una sola epoca y trazas de razonamiento incorporadas en el 100% de los ejemplos. La longitud maxima de secuencia en entrenamiento fue de 4.096 tokens. La licencia declarada es Apache-2.0 y el idioma soportado es unicamente ingles.

Es importante subrayar que el autor lo describe explicitamente como un modelo experimental de razonamiento medico, no validado clinicamente. Su uso previsto es la investigacion, la evaluacion y el prototipado en entornos controlados no clinicos, no el diagnostico ni el triaje de pacientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen3.5-2B), adaptador LoRA sobre base fine-tuneada |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento limitado a 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5-2B, sobre el que se aplica un adaptador LoRA. El modelo inmediato de partida es un fine-tune propio del autor (MultiDistill-Megamix-6xMerge-UNCENSORED-heretic), por lo que el comportamiento final refleja tanto el entrenamiento previo de esa base como la especializacion medica anadida. El autor advierte que la contribucion relativa de cada etapa no se ha medido de forma independiente.

El entrenamiento consistio en SFT con LoRA sobre 4.000 ejemplos aleatorios del dataset FreedomIntelligence/medical-o1-reasoning-SFT, preprocesado y limpiado, con trazas de razonamiento incorporadas en el 100% de los ejemplos. Configuracion: 1 epoca, precision de 16 bits, learning rate 2e-4 con scheduler lineal, optimizador AdamW de 8 bits, rango LoRA 16, alpha 32, dropout 0.02, batch efectivo 32 (batch por dispositivo 4 x acumulacion 8), weight decay 0.002, secuencia maxima 4.096 tokens y hardware NVIDIA L4 de 24 GB. Los resultados reportados son loss final de entrenamiento 1.446 y loss de evaluacion 1.428 sobre un split de evaluacion de aproximadamente el 5% de los datos muestreados.

## Capacidades

- Generacion de texto y respuesta a preguntas de conocimiento medico en ingles.
- Razonamiento clinico paso a paso sobre sintomas, hallazgos de laboratorio y vineta clinica.
- Exploracion de diagnosticos diferenciales e identificacion de pruebas de seguimiento plausibles.
- Trazas de razonamiento (thinking traces) en las respuestas, al haberse entrenado con ellas en todos los ejemplos.
- Conversacion multi-turno segun los tags del modelo (conversational).
- Soporte declarado de image-text-to-text en los tags, heredado del linaje Qwen3.5; el autor no documenta evaluacion de capacidades de vision en este adaptador.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del razonamiento clinico entrenado.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre adaptacion de modelos pequenos a dominios medicos: permite estudiar como un modelo de 2B parametros responde a ejemplos de razonamiento clinico con un coste de entrenamiento bajo (una epoca, 4.000 ejemplos, una L4).
- Prototipado de asistentes de preguntas medicas en entornos de laboratorio: util para validar flujos de pregunta-respuesta con trazas de razonamiento antes de invertir en modelos mayores.
- Evaluacion comparativa de calidad de razonamiento: sirve como linea base pequena frente a modelos medicos de mayor tamano en tareas de vineta clinica y diagnostico diferencial.
- Generacion de material docente simulado: produce explicaciones paso a paso de casos clinicos ficticios para revision por expertos, nunca para uso directo con pacientes.
- Pruebas de robustez y deteccion de alucinaciones en NLP medico: su tamano reducido y su licencia Apache-2.0 facilitan experimentos reproducibles sobre fidelidad de las explicaciones.
- Despliegue local en estaciones de trabajo con GPU de consumo para demos internas de razonamiento medico, gracias a sus 2,2B parametros y pesos en safetensors.
- Analisis de sesgos y comportamiento de modelos "uncensored" en dominio sanitario: la base heretic permite estudiar como afecta la ausencia de filtros a la seguridad de las respuestas medicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de entrenamiento: loss final de entrenamiento 1.446 y loss de evaluacion 1.428.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 4,5 GB solo para pesos (2,2B parametros), mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 8 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), A100 y H100 para servir en produccion; RTX 4090 para experimentacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) en 16 bits o cuantizado.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan documentados por el autor para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-2B-Medical-Reasoning | 2,21B | no disponible (entrenado a 4.096) | en | Apache-2.0 | LoRA medico experimental, sin benchmarks publicados |
| Base: xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic | no disponible | no disponible | no disponible | no disponible | Fine-tune "uncensored" del que deriva este adaptador |
| Qwen/Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | Modelo upstream de la familia |
| FreedomIntelligence/medical-o1-reasoning-SFT (dataset) | no aplica | no aplica | no disponible | no disponible | Fuente de los datos de razonamiento medico |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental no validado clinicamente: puede producir diagnosticos incorrectos, detalles fabricados o explicaciones enganosas.
- No apto para diagnostico orientado al paciente, recomendaciones de tratamiento, triaje de urgencias ni decision clinica autonoma.
- Riesgo de alucinacion elevado por el tamano reducido (2,2B) y la especializacion estrecha del adaptador.
- Las trazas de razonamiento no garantizan fidelidad: el autor advierte que no reflejan necesariamente los procesos internos que generan las predicciones.
- Solo entrenado en ingles; no se documenta soporte de castellano ni de otros idiomas.
- Hereda el comportamiento de una base marcada como "uncensored" y "heretic", lo que puede reducir los filtros de seguridad en respuestas sensibles.
- La contribucion relativa de la base fine-tuneada y del adaptador medico no se ha medido de forma independiente.
- Entrenado con solo 4.000 ejemplos y una epoca, lo que limita la cobertura de casos clinicos.
- Aunque la licencia declarada es Apache-2.0, conviene revisar las condiciones de los modelos y datasets de la cadena de linaje antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente a la base en tareas medicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-2B-Medical-Reasoning
- Coleccion Medical Reasoning del autor: https://huggingface.co/collections/xtools-at/medical-reasoning
- Modelo base inmediato: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset derivado del autor: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
