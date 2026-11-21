# ulises-c/socrates-state-classifier-qwen3.5-lora

## Resumen

Socrates-state-classifier es un modelo de clasificación de secuencias construido sobre Qwen3.5-0.8B-Base mediante un ajuste LoRA que posteriormente se fusionó con los pesos base. Lo desarrolla el usuario ulises-c en el contexto del proyecto "Reproduciendo y extendiendo KELE", y su tarea es predecir el estado pedagógico que debería adoptar un tutor en el siguiente turno de un diálogo socrático. Los estados provienen del conjunto SocRule del artículo KELE: un estado de apertura (a1), seis de sondeo conceptual (b2-b7), 22 de razonamiento inductivo (c8-c29), cuatro de derivación de respuesta (d30-d33) y uno de cierre (e34), sumando 34 clases.

El modelo actúa como "consultor" dentro de un pipeline de dos etapas: recibe el historial del diálogo hasta el turno más reciente del estudiante y emite una etiqueta de estado que se entrega a un modelo profesor (por ejemplo, Gemma 4 31B) encargado de redactar la respuesta. Sustituye así una llamada a un LLM generalista por un clasificador compacto de 853 millones de parámetros, reduciendo coste y latencia en el bucle de tutoría.

Es relevante porque demuestra que un modelo pequeño ajustado con LoRA puede cubrir una función estructurada (selección de estrategia pedagógica) con una precisión exacta del 68,45 % sobre el conjunto de test, aunque con limitaciones claras al operar en bucle cerrado. El repositorio incluye una revisión `v1-leaky` que no debe usarse para evaluación por fuga de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabeza de clasificación de secuencias; adaptadores LoRA fusionados en los pesos base |
| Parametros totales | 853.021.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana nativa; el entrenamiento y la inferencia truncan a 512 tokens y a los últimos 4.000 caracteres del historial |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el pipeline del proyecto castea a bfloat16) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 3.412.145.656 bytes, float32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de 0,8 mil millones de parámetros, al que se añade una cabeza de clasificación de 34 clases (`AutoModelForSequenceClassification`). El ajuste se realizó con LoRA de rango 8 y alpha 16 (`--lora-r 8 --lora-alpha 16`), batch de 8, autocast en bf16, 5 épocas, learning rate 2e-5, máximo de 512 tokens y semilla 42. Los adaptadores se fusionaron en los pesos base antes de guardar, de modo que el checkpoint final es un clasificador de secuencias estándar que no requiere biblioteca de adaptadores. El entrenamiento completo llevó 1 hora y 25 minutos en una única RTX A6000.

Los datos provienen de ulises-c/SocratDataset, con 6.803 diálogos en chino, divididos 90/10 por diálogo con semilla 42. La partición de entrenamiento aporta 38.588 turnos, de los cuales 1.929 (5 %) se reservaron para comprobaciones y 36.659 se usaron para el ajuste. Cada ejemplo es un turno: el diálogo previo en líneas `学生: …` y `老师: …`, recortado a los últimos 4.000 caracteres, con la etiqueta del estado registrado para ese turno. El conjunto de test tiene 681 diálogos y 4.304 turnos.

## Capacidades

- Clasificación de estado pedagógico en 34 clases (a1, b2-b7, c8-c29, d30-d33, e34) a partir de un historial de diálogo tutor-estudiante.
- Procesamiento de diálogos multi-turno en chino, con formato de líneas etiquetadas por rol.
- Inferencia en CPU (el ejemplo de la model card se ejecutó con transformers 5.23 sobre CPU).
- Integración como componente "consultor" en pipelines de tutoría socrática que delegan la redacción a un LLM profesor.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un clasificador puro de secuencias.
- Capacidad multilingüe limitada al chino: no se han validado otros idiomas.

## Casos de uso

- Tutoría socrática automatizada: el clasificador decide la estrategia pedagógica del siguiente turno (sondeo conceptual, razonamiento inductivo, derivación de respuesta o cierre) y un LLM profesor redacta el texto, reduciendo el coste frente a usar solo el LLM grande para ambas tareas.
- Enrutado de estrategia en sistemas de diálogo educativo: dado el historial, seleccionar la plantilla o política de respuesta adecuada antes de invocar al generador.
- Investigación en análisis de diálogo educativo: etiquetar automáticamente corpus de tutoría con los estados SocRule para estudios de efectividad pedagógica.
- Reproducción y extensión del artículo KELE: el modelo sirve como consultor reemplazable en experimentos controlados, con hash de checkpoint registrado en `run_config.json` para trazabilidad.
- Filtrado y curación de datos: detectar turnos con estados poco frecuentes o mal etiquetados en corpus de tutoría antes de usarlos para entrenamiento.
- Prototipado rápido en CPU: al ser un modelo de 0,8B en float32 con inferencia en CPU, permite experimentar sin GPU dedicada en entornos de investigación con recursos limitados.
- Evaluación comparativa de profesores LLM: midiendo cómo cambia la precisión del estado en bucle cerrado según el modelo profesor utilizado (52,14 % con Gemma 4 31B frente a 68,45 % en test).

## Benchmarks y rendimiento

Resultados de `test_eval.json` sobre los 4.304 turnos del conjunto de test (chino):

| Medida | Valor | n |
|---|---|---|
| Precisión de estado exacta | 68,45 % | 4.304 |
| Precisión de etapa a (implícita) | 100,00 % | 681 |
| Precisión de etapa b | 92,38 % | 761 |
| Precisión de etapa c | 85,00 % | 1.447 |
| Precisión de etapa d | 75,75 % | 734 |
| Precisión de etapa e | 96,92 % | 681 |
| Precisión en bucle cerrado con Gemma 4 31B como profesor | 52,14 % | 4.120 turnos generados |

Precisión por estado frecuente: `a1` 100 % (n=681), `e34` 96,9 % (n=681), `d33` 74,5 % (n=644), `c16` 65,1 % (n=341), `c12` 59,2 % (n=299). Catorce de los 34 estados nunca se predijeron correctamente en test, cada uno con 32 turnos o menos. El mismo fichero registra `test_acc` = 68,38 % en una segunda pasada, con tres turnos de diferencia respecto al 68,45 % y causa no investigada. En un conjunto sintético de 75 diálogos con convención de subestados distinta, la precisión exacta cayó a aproximadamente el 30 %.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan unos 3,4 GB; en bfloat16 unos 1,7 GB. Con overhead de activaciones y tokenizador, se puede operar con menos de 3 GB en bf16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM basta; el entrenamiento se hizo en una RTX A6000 (48 GB) en 1 h 25 min.
- Cabe en GPU de consumo: sí, en RTX 3050, RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification` y `attn_implementation="eager"` (el camino de atención por defecto falló en una versión anterior de transformers para esta arquitectura). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para este checkpoint de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de clasificación de estados pedagógicos en la información disponible. Como referencia de la misma familia y tamaño:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ulises-c/socrates-state-classifier-qwen3.5-lora | 853 M | 512 tokens (truncado) | Clasificación de estado pedagógico (34 clases) | Apache 2.0 |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B | no disponible | Modelo base generativo | no disponible |
| Consultor LLM generalista (p. ej. Gemma 4 31B en el pipeline) | no disponible | no disponible | Generación de respuestas de tutor | no disponible |

## Limitaciones y advertencias

- La precisión en bucle cerrado (52,14 %) es sustancialmente inferior a la de test (68,45 %) porque en producción el clasificador ve las respuestas generadas por el profesor, no las de referencia, y un estado erróneo condiciona los turnos posteriores.
- Catorce de los 34 estados nunca se predicen correctamente en test; los estados con pocos ejemplos (≤32 turnos) no son fiables.
- Solo se ha validado sobre SocratDataset; en un conjunto sintético con otra convención de subestados la precisión exacta ronda el 30 %.
- El modelo está entrenado únicamente en chino; no hay evidencia de funcionamiento en otros idiomas.
- El truncado a 512 tokens y a los 4.000 últimos caracteres descarta historiales largos, lo que puede afectar a diálogos extensos.
- La revisión `v1-leaky` (etiqueta del mismo nombre, sha256 `9183119d…`) tiene fuga de datos: 607 de los 681 diálogos de test chino estaban en su entrenamiento. No debe usarse para evaluación ni reportar sus cifras.
- El checkpoint actual tiene sha256 `696e6e044c5222e2a3e2f9746c76c57c308764cce941fff66c453014235c2506`; conviene fijar la revisión al cargar para evitar confusiones.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluación fuera del dominio educativo chino.
- No se documentan sesgos específicos más allá de los derivados del corpus de diálogos chino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ulises-c/socrates-state-classifier-qwen3.5-lora
- Revisión con fuga (no usar para evaluación): https://huggingface.co/ulises-c/socrates-state-classifier-qwen3.5-lora/tree/v1-leaky
- Dataset: https://huggingface.co/datasets/ulises-c/SocratDataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio del proyecto: https://github.com/ulises-c/csen-346
