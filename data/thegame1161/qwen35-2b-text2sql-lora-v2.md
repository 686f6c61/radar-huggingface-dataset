# Thegame1161/qwen35-2b-text2sql-lora-v2

## Resumen

Qwen3.5-2B Text-to-SQL LoRA v2 es un adaptador LoRA de tipo PEFT desarrollado por el usuario Thegame1161 sobre el modelo base Qwen/Qwen3.5-2B. Su propósito es la generación de consultas SQLite a partir de lenguaje natural (text-to-SQL), un problema clásico de traducción semántica entre esquemas relacionales y preguntas en inglés. El adaptador se publica bajo licencia Apache-2.0 y está pensado para integrarse en pipelines de análisis de datos donde se requiere automatizar la escritura de SQL.

El modelo se construye en dos fases: una primera versión (v1) entrenada con 10.000 ejemplos de cadena de pensamiento verificados por ejecución del dataset SynSQL-2.5M, y esta segunda versión (v2) que aplica autodestilización por muestreo de rechazo sobre bases de datos reales de BIRD. La v2 se apila sobre la v1, por lo que requiere fusionar primero el adaptador anterior en el modelo base y después aplicar este segundo adaptador.

La relevancia de esta ficha radica en que documenta un caso de ajuste fino eficiente (0,7 horas de GPU en una RTX PRO 6000) sobre un modelo pequeño de 2.000 millones de parámetros con modo de razonamiento (thinking). El autor reporta mejoras medibles en BIRD dev (42,07% con vote@8 y reparación por ejecución) y Spider dev (72,44%) frente a la versión v1 y al modelo base, aunque con la advertencia explícita de que una sola muestra queda por debajo del modelo base con razonamiento largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (linear-attention) y modo thinking, sobre Qwen3.5-2B; adaptador LoRA r=16, alpha=32, dropout 0.05 |
| Parametros totales | 2B (modelo base); adaptador LoRA de tamaño reducido (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer con componentes de atención lineal (módulos `in_proj_qkv`, `in_proj_z`, `out_proj`) y proyecciones MLP en las 24 capas del modelo. El LoRA (r=16, alpha=32, dropout 0.05) se inserta en las proyecciones de atención, atención lineal y MLP de todas las capas. El entrenamiento usa AdamW con learning rate 5e-5, schedule coseno, 1 época (343 pasos, 5.046 ejemplos) y cálculo de pérdida únicamente sobre la respuesta. El coste computacional reportado es de 0,7 horas de GPU en una RTX PRO 6000, con una pérdida en validación de 0,253 (frente a 0,301 en v1).

La estrategia de datos combina dos fuentes. La v1 se entrenó con 10.000 ejemplos de cadena de pensamiento verificados por ejecución del dataset SynSQL-2.5M (OmniSQL). La v2 aplica autodestilización por muestreo de rechazo: la v1 respondió 5.026 preguntas del conjunto de entrenamiento de BIRD cuatro veces cada una; para las 2.349 preguntas con respuesta ejecutable correcta, se seleccionó la respuesta correcta más corta (media de 429 tokens) como objetivo, mezclada con 3.000 filas no vistas de SynSQL. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de consultas SQLite a partir de preguntas en lenguaje natural, con salida en bloque de código `sql`.
- Razonamiento en modo thinking (`enable_thinking=True`), orientado a producir cadenas de pensamiento cortas y estructuradas.
- Aceptación de esquemas como sentencias `CREATE TABLE` con tres filas de ejemplo por tabla, más campos `Question:` y `Evidence:`.
- Soporte de reparación por ejecución: el modelo puede recibir el mensaje de error de SQLite y corregir la consulta en un turno adicional.
- Capacidad de muestreo múltiple (vote@8) para seleccionar la consulta con mayor consenso por resultado de ejecución.
- Especialización en inglés; no se reporta soporte multilingüe.
- No se reporta soporte de tool calling, function calling, agentes generales, visión ni audio.

## Casos de uso

- Análisis de datos autoservicio: un analista formula una pregunta en inglés sobre una base SQLite y el modelo genera la consulta, usando el esquema con filas de ejemplo para desambiguar columnas y tipos.
- Integración en asistentes de BI: el adaptador se fusiona en el modelo base y se sirve con vLLM para que una interfaz de chat traduzca preguntas de negocio a SQL ejecutable contra réplicas de solo lectura.
- Reparación automática de consultas fallidas: en un pipeline, si la consulta generada devuelve error de SQLite, se reinyecta el mensaje de error y el modelo produce una corrección en un segundo turno.
- Selección por consenso en entornos de alta precisión: se generan 8 muestras por pregunta, se reparan las fallidas y se agrupa por resultado de ejecución para elegir el grupo mayoritario, sin necesidad de gold.
- Generación de consultas de validación para QA de datos: el modelo produce SQL de comprobación (conteos, nulos, rangos) sobre tablas de un almacén SQLite para tests automatizados.
- Prototipado de interfaces de consulta en lenguaje natural: equipos que construyen demos de text-to-SQL pueden partir de este adaptador para validar la viabilidad antes de invertir en modelos mayores entrenados directamente en BIRD/Spider.
- Educación y formación en SQL: el modo thinking genera razonamiento intermedio que puede mostrarse como explicación de cómo se construye la consulta.

## Benchmarks y rendimiento

Resultados de precisión de ejecución en SQLite reportados por el autor (conjuntos de test usados una sola vez):

| Variante de Qwen3.5-2B | BIRD dev (1.533) | Spider dev (1.034) | Tokens generados / pregunta |
|---|---|---|---|
| base, thinking, 1 muestra | 33,46% | 64,12% | ~9.600 |
| v1, vote@8 + reparación por ejecución | 40,83% | 68,57% | ~4.900 |
| v2, 1 muestra | 29,09% | 61,41% | ~470 |
| v2, vote@8 + reparación por ejecución | 42,07% | 72,44% | ~4.700 |

Referencia comparativa citada por el autor: XiYanSQL-QwenCoder-3B alcanza 52,19% en BIRD y 85,20% en Spider con el mismo arnés de evaluación. La decisión de evaluar v2 en los conjuntos de test se condicionó de antemano a superar a v1 en un split de práctica reservado (54,9% frente a 53,1%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 2B parámetros y el adaptador ocupa 0,1 GB, por lo que en bfloat16 el conjunto cabe en GPUs de consumo con holgura.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 6000; para inferencia se puede usar cualquier GPU con suficiente memoria para un modelo de 2B en bfloat16 o cuantizado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se publican cifras exactas de VRAM.
- Opciones de despliegue: vLLM (el autor indica guardar el modelo fusionado con `save_pretrained()` para servirlo con vLLM); PEFT/Transformers para carga del adaptador; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor reporta el coste de entrenamiento (0,7 horas de GPU) y el número de tokens generados por pregunta, pero no latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev | Spider dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B Text-to-SQL LoRA v2 (este) | 2B + LoRA | no disponible | 42,07% (vote@8 + repair) | 72,44% (vote@8 + repair) | Apache-2.0 | Hugging Face (PEFT) |
| Qwen3.5-2B base (thinking) | 2B | no disponible | 33,46% (1 muestra) | 64,12% (1 muestra) | Apache-2.0 | Hugging Face |
| XiYanSQL-QwenCoder-3B | 3B | no disponible | 52,19% | 85,20% | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo requiere el bucle muestra → reparación → voto: una sola muestra (29,09% en BIRD) queda por debajo del modelo base con razonamiento largo (33,46%).
- Solo soporta inglés y solo SQLite; no se reporta cobertura de otros dialectos SQL ni otros idiomas.
- Queda por debajo de modelos entrenados directamente en BIRD/Spider, como XiYanSQL-QwenCoder-3B (52,19% / 85,20%).
- El adaptador v2 se apila sobre v1: es obligatorio fusionar primero v1 y después v2; usarlo de forma aislada produce un comportamiento no validado.
- Riesgo de alucinación en nombres de tablas, columnas y valores no presentes en el esquema; el autor no documenta sesgos específicos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y los datasets (SynSQL-2.5M / OmniSQL, BIRD) tienen sus propias condiciones que deben verificarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados.
- No se publican datos de longitud de contexto, cuantizaciones soportadas ni latencias, lo que limita la planificación de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thegame1161/qwen35-2b-text2sql-lora-v2
- Versión v1 del adaptador: https://huggingface.co/Thegame1161/qwen35-2b-text2sql-lora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código, logs y experimentos: https://github.com/Ahmediq11/qwen35-2b-text2sql
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Paper de OmniSQL / SynSQL: https://arxiv.org/abs/2503.02240
- Benchmark BIRD: https://bird-bench.github.io/
- Benchmark Spider: https://yale-lily.github.io/spider
