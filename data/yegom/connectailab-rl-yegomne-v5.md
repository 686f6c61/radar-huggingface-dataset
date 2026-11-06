# yegom/connectailab-rl-yegomne-v5

## Resumen

`connectailab-rl-yegomne-v5` es un adaptador LoRA de aprendizaje por refuerzo desarrollado por el autor independiente Yegom (Park Sehyun) bajo la marca CONNECT AI LAB. Se construye sobre el modelo base `Qwen/Qwen3.5-0.8B` y está especializado en una única tarea: la toma de decisiones empresariales dentro del simulador CONNECT TYCOON. El modelo recibe un estado, una pregunta y un conjunto de opciones etiquetadas, y devuelve únicamente la letra de la opción seleccionada, de modo que la distribución de probabilidad sobre las letras actúa como distribución de preferencia sobre las alternativas.

La relevancia del modelo no reside en sus capacidades generales de lenguaje, sino en su metodología: combina un profesor entrenado con PPO en el simulador, la generación de un conjunto de datos por contrafactuales (evaluando cada alternativa hasta el final del mes simulado) y una fase final de RL con GRPO y normalización por grupo más una penalización KL respecto al modelo de partida. El autor reporta una mejora sustancial frente al Qwen base en precisión sobre el conjunto de prueba (36,9% a 73,9%) y una reducción de la "regret" media de 6,32 a 4,10.

Se trata, por tanto, de un artefacto de investigación y formación con alcance muy acotado: un adaptador de 0,8B de parámetros, licencia Apache 2.0, idioma declarado coreano y un pipeline etiquetado como reinforcement-learning. No es un modelo conversacional de propósito general ni está pensado para desplegarse como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (`ko`); las instrucciones del sistema se proporcionan en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 0,8B de parámetros mediante LoRA. La innovación no está en la arquitectura, sino en el pipeline de entrenamiento en cuatro fases descrito por el autor. Primero, una política pequeña se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados; esa política actúa como profesor. Segundo, se construye un "cuaderno de problemas": para cada decisión, se altera la opción elegida y se vuelve a ejecutar el mes completo para puntuar cada alternativa de forma contrafactual. Tercero, se aplica aprendizaje supervisado para imitar la opción con mayor puntuación. Cuarto, se aplica RL con GRPO: se observa el conjunto completo de opciones como un grupo, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo rendimiento en el simulador supera la media, con una penalización KL contra el modelo de partida para evitar el colapso.

El conjunto de datos declarado corresponde a una distribución de empresa `general` (ajustada con datos públicos) y contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de prueba. El modelo base es Qwen3.5-0.8B, del que no se detallan en la información disponible ni la composición del corpus original ni los detalles de su alineamiento. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Selección de una opción entre varias etiquetadas (A, B, C...) ante un estado y una pregunta dados, devolviendo una única letra sin explicación.
- Exposición de una distribución de probabilidad sobre las opciones, interpretable como grado de confianza en cada alternativa.
- Toma de decisiones secuenciales en un entorno de simulación empresarial (gestión de dinero, satisfacción y accidentes a lo largo de meses simulados).
- Seguimiento de instrucciones de sistema estrictas, incluida la instrucción de tratar el texto del estado como datos y no como instrucciones (defensa básica frente a inyección de prompt).
- Entrada y salida en formato JSON estructurado para el estado y las opciones.
- No se documentan capacidades de tool calling, razonamiento multi-paso general, visión, audio, matemáticas ni generación de código fuera del dominio del simulador.
- Capacidad multilingüe limitada al coreano declarado; el prompt de sistema está en inglés.

## Casos de uso

- Evaluación de políticas de decisión en entornos tipo gymnasium: el adaptador sirve como política de referencia para comparar contra el profesor PPO o contra el modelo base sin ajustar, usando la precisión y la regret como métricas.
- Investigación en aprendizaje por refuerzo con GRPO: el repositorio documenta el pipeline completo (profesor PPO, datos contrafactuales, SFT y RL), por lo que es útil como caso de estudio reproducible en un Colab.
- Docencia y formación en RL aplicado a LLM: el autor publica cursos y vídeos asociados, y el modelo ilustra de forma compacta cómo convertir un simulador en un generador de datos de preferencia.
- Simulación de decisiones empresariales sintéticas: para prototipar agentes que eligen entre acciones discretas en un juego de gestión, sin coste de inferencia relevante por el tamaño de 0,8B.
- Generación de datos sintéticos de decisión: las salidas probabilísticas pueden emplearse para etiquetar o puntuar alternativas en nuevos escenarios del mismo simulador.
- Pruebas de robustez frente a inyección de prompt: dado que el prompt de sistema instruye explícitamente a tratar el estado como datos, puede usarse como banco de pruebas de ataques de instrucciones embebidas.
- Despliegue local en hardware modesto: al ser un adaptador sobre 0,8B, permite experimentar en una sola GPU de consumo o incluso en CPU con cuantización, aunque esta no esté documentada.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de su propia evaluación interna sobre el simulador:

| Modelo | Precisión en test | Regret (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en tarjetas reales |
|---|---|---|---|---|
| Qwen sin entrenar | 36,9% | 6,32 | No disponible | No disponible |
| Aprendizaje supervisado | 77,3% | 3,90 | No disponible | No disponible |
| Refuerzo (GRPO) | 73,9% | 4,10 | 11,76 millones de wones | 72% (159/177) |

El autor advierte que el resultado de operación corresponde a la media de dos meses nunca vistos, con muestra pequeña, y que la política profesor (PPO en el simulador) sigue siendo superior. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,8B), en fp16 rondaría 1,6-2 GB de pesos más overhead, y en cuantización de 4 bits podría situarse por debajo de 1 GB, aunque el autor no documenta cuantizaciones.
- GPU recomendadas: no especificadas. Cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en precisión reducida.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA requeriría fusión previa con el modelo base para algunos de estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomne-v5 | 0,8B (base) + LoRA | No disponible | Decisión discreta en simulador | Apache 2.0 | Hugging Face |
| connectailab-rl-yegomne-v1-link01 | No disponible | No disponible | Navegación con evitación de obstáculos (PPO + LLM) | No disponible | Hugging Face |
| connectailab-rl-yegomfloor-v2 | No disponible | No disponible | RL construido con numpy | No disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos ni con alternativas de la misma categoría (políticas de decisión sobre LLM), por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Alcance extremadamente estrecho: el modelo solo responde con una letra de opción; no genera explicaciones ni texto libre, y fuera del formato esperado su comportamiento no está garantizado.
- Entrenado sobre un simulador sintético: el autor advierte explícitamente que es un modelo de investigación y educación y que debe revalidarse con los registros reales de cada empresa antes de usarse en decisiones de negocio.
- Muestra de evaluación pequeña: el resultado operativo procede de dos meses no vistos, lo que limita la significación estadística.
- Inferior al profesor PPO del simulador según el propio autor, pese a superar al modelo base.
- Idioma declarado únicamente coreano; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación en el sentido de seleccionar opciones inexistentes o mal formateadas si el estado o las opciones no siguen el esquema JSON esperado.
- Sesgos: no documentados por el autor; al entrenarse sobre una distribución de empresa "general" ajustada con datos públicos, puede heredar sesgos de esa distribución y del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Sin datos de cuantización, latencia ni throughput, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v5
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (EzerAI): https://www.ezerai.xyz
- Modelo relacionado v1-link01: https://huggingface.co/yegom/connectailab-rl-yegomne-v1-link01
- Modelo relacionado yegomfloor-v2: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
