# Yogi016/datapilot-v6-tiny-aya-sql-grpo-lora

## Resumen

DataPilot V6 es un adaptador LoRA (r=16) entrenado mediante GRPO sobre el modelo base CohereLabs/tiny-aya-global, un transformer de 3,35 mil millones de parámetros. Lo desarrolla el usuario Yogi016 en el contexto del hackathon Lexsi AI (Track 3, Problema 6: agentes de datos y bases de datos) y su objetivo es la traducción de lenguaje natural a SQL (NL-to-SQL) sobre SQLite. La innovación principal no está en el modelo base, sino en la técnica de entrenamiento: se emplea aprendizaje por refuerzo con una recompensa que ejecuta la consulta generada en modo de solo lectura y compara el conjunto de resultados con el de una consulta de referencia.

El adaptador se publica como pesos PEFT en safetensors, con un tamaño de repositorio de 0,1 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo completo. El modelo está pensado para ser cargado junto al modelo base tiny-aya-global, que debe obtenerse por separado aceptando sus términos de licencia. La relevancia actual reside en su enfoque de alineación ejecutable para text-to-SQL: en lugar de supervisión directa sobre cadenas SQL, el modelo se optimiza contra la corrección de los resultados de la consulta, lo que es más cercano a la métrica que importa en producción.

La información disponible es limitada: no se detallan composición del dataset de entrenamiento, hiperparámetros completos de GRPO, ni resultados de benchmarks estándar como MMLU o HumanEval. Los únicos datos de evaluación son los de un benchmark propio sobre una base de datos empresarial sintética con preguntas generadas por plantillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base tiny-aya-global) con adaptador LoRA (r=16) |
| Parámetros totales | 3,35 mil millones (modelo base); adaptador LoRA de tamaño no especificado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe según su card, pero no se detalla aquí) |
| Licencia | "see" (sujeta a los términos del modelo base CohereLabs/tiny-aya-global) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CohereLabs/tiny-aya-global, un transformer decoder-only de 3,35 mil millones de parámetros. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) mediante TRL 1.7.1. La función de recompensa ejecuta la consulta SQL generada en modo de solo lectura contra una base de datos SQLite y compara el conjunto de resultados con el de una consulta de referencia (gold query). Este diseño convierte la recompensa en una señal de exactitud de ejecución, no en una coincidencia textual de la cadena SQL, lo que penaliza consultas sintácticamente distintas pero funcionalmente equivalentes de forma correcta.

Los detalles sobre el dataset de entrenamiento no están disponibles en la información proporcionada, salvo que las preguntas se generaron por plantillas sobre una base de datos empresarial sintética. Se realizó una única ejecución de entrenamiento con una sola semilla, lo que limita la robustez estadística de los resultados. No se documentan hiperparámetros de GRPO (tamaño de grupo, tasa de aprendizaje, número de pasos) ni si hubo fases previas de SFT.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural sobre esquemas SQLite.
- Razonamiento orientado a la ejecución: el entrenamiento con recompensa basada en resultados favorece consultas funcionalmente correctas.
- Adaptación específica al dominio de bases de datos empresariales sintéticas empleadas en el benchmark.
- Capacidades del modelo base (generación de texto, multilingüismo de tiny-aya) potencialmente preservadas, aunque no se documentan en esta ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes de consulta sobre bases de datos SQLite: el adaptador traduce preguntas de negocio en lenguaje natural a SQL ejecutable, útil para herramientas internas de analistas no técnicos que trabajan sobre réplicas de solo lectura.
- Generación de SQL en pipelines de analítica: puede integrarse como paso previo a la ejecución de consultas en un entorno controlado, con validación posterior del conjunto de resultados.
- Prototipado de agentes de datos: sirve como componente NL-to-SQL en arquitecturas de agentes que necesitan consultar esquemas relacionales, dado su entrenamiento con recompensa de ejecución.
- Evaluación de esquemas y preguntas: al estar entrenado sobre un benchmark sintético con preguntas por plantillas, es adecuado para experimentar con variaciones de esquema y medir exactitud de ejecución.
- Investigación en RL para text-to-SQL: el adaptador y sus logs de trayectorias (publicados en un repositorio aparte) permiten estudiar el comportamiento de GRPO con recompensas ejecutables.
- Filtrado y verificación de consultas: puede usarse para generar candidatos SQL que luego se validan contra la base de datos antes de exponerse al usuario final.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el benchmark propio (base de datos empresarial sintética, preguntas por plantillas, una ejecución, una semilla):

| Split | n | Exactitud de ejecución base | Exactitud de ejecución ajustada | McNemar pareado p |
|---|---|---|---|---|
| test_iid | 51 | 0,608 | 0,824 | 0,001 |
| test_novel | 17 | 0,353 | 0,471 | 0,625 (no significativo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de 3,35B en precisión completa se requieren del orden de 7 GB solo para pesos, más overhead de activaciones y caché KV. En cuantización de 8 bits o 4 bits el requisito baja sustancialmente, pero no se documentan cuantizaciones del adaptador.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable para el modelo base en cuantización, pero no confirmado en la documentación del adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con librerías compatibles (transformers + peft). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores NL-to-SQL ni con modelos de tamaño similar, y no se dispone de datos de benchmarks comunes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado con una única ejecución y una sola semilla: los resultados pueden no ser reproducibles ni estadísticamente robustos.
- La mejora en el split test_novel no es estadísticamente significativa (p=0,625), lo que sugiere poca generalización a esquemas o preguntas fuera de la distribución de entrenamiento.
- El benchmark es sintético y generado por plantillas, por lo que la exactitud de ejecución reportada puede no trasladarse a bases de datos reales.
- Licencia sujeta a los términos del modelo base CohereLabs/tiny-aya-global; es necesario aceptar dichos términos para su uso, incluido el comercial si procede.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones de idioma del adaptador.
- El adaptador no incluye el modelo base; su despliegue requiere descargar y cargar tiny-aya-global por separado.
- No se documentan restricciones de contexto ni comportamiento en consultas SQL complejas (joins múltiples, subconsultas anidadas).

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Yogi016/datapilot-v6-tiny-aya-sql-grpo-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset del benchmark: https://huggingface.co/datasets/Yogi016/datapilot-v6-sql-benchmark
- Logs y trayectorias de evaluación: https://huggingface.co/datasets/Yogi016/datapilot-v6-trajectories-and-logs
