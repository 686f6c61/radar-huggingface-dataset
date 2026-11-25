# yuhuanstudio/Yunmo-Next-1B-Instruct-NVFP4

## Resumen

Yunmo-Next-1B-Instruct-NVFP4 es la versión cuantizada en formato NVFP4 de Yunmo-Next-1B-Instruct, un modelo de lenguaje de aproximadamente 1.000 millones de parámetros desarrollado por YuhuanStudio y orientado prioritariamente al chino tradicional. El modelo base se entrena desde cero sobre 19,76 mil millones de tokens y posteriormente se ajusta por instrucciones; esta variante conserva la misma arquitectura híbrida que combina Kimi Delta Attention (KDA) con atención grouped-query (GQA). La cuantización se realizó con torchao 0.18, aplicando pesos FP4 e2m1 con una escala FP8 por bloque de 16 elementos y manteniendo las activaciones en BF16.

El interés de esta ficha reside en su carácter de checkpoint de investigación: el autor advierte explícitamente de que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple, comete errores factuales con frecuencia, puede repetirse hasta agotar el límite de tokens y no cuenta con ajuste de seguridad. La cuantización NVFP4 reduce el peso en memoria de 2,02 GB (BF16) a 0,67 GB, lo que permite ejecutarlo en GPU de consumo, a costa de una degradación medible de la calidad (0,9397 frente a 0,9302 bits por byte) y de una latencia notablemente superior en hardware sin núcleos tensoriales FP4.

El modelo está publicado bajo licencia Apache-2.0, aunque algunas fuentes de los datos de ajuste imponen condiciones adicionales (uso exclusivamente de investigación, CC BY-NC-SA 4.0, CC BY-NC 4.0 o AGPL-3.0), lo que condiciona su uso comercial. Los idiomas declarados son chino y inglés, y el repositorio incluye código de modelo con `trust_remote_code`, tokenizador y plantilla de chat del modelo de precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Kimi Delta Attention (KDA) + grouped-query attention (GQA) |
| Parámetros totales | 597.516.136 (según safetensors); el autor lo describe como modelo de 1.0B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (pesos FP4 e2m1 con escala FP8 por bloque de 16; activaciones en BF16). Existen variantes INT8, FP8 y bnb-4bit del mismo modelo base |
| Idiomas soportados | chino (zh), inglés (en); orientado a chino tradicional |
| Licencia | Apache-2.0 (con restricciones adicionales en algunas fuentes de datos de ajuste) |
| Formato de pesos | safetensors (NVFP4, torchao 0.18); requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer híbrida que combina capas de Kimi Delta Attention (KDA) con atención grouped-query. Según la model card, el preentrenamiento se realizó desde cero sobre 19,76 mil millones de tokens y después se aplicó un ajuste por instrucciones. La model card no detalla la composición del dataset de preentrenamiento ni si se emplearon técnicas de RLHF o DPO; tampoco especifica la longitud de contexto nativa. La información disponible menciona fuentes de ajuste concretas: AM-Thinking-v1 y destilaciones de AM-DeepSeek-R1, tw-instruct-500k, no_robots y subconjuntos de las trazas FABLE.5.

La innovación técnica de esta variante es la cuantización NVFP4: se cuantizan 600 de las 645 capas lineales, mientras que se mantienen en BF16 la capa de embedding/salida (con pesos atados), las 45 proyecciones β de KDA (de 1.024 a 8), las normalizaciones, las convoluciones y el router. La implementación depende de torchao 0.18 y del decodificador con CUDA graphs incluido en el repositorio cuando el formato lo soporta. En GPUs Ada, que carecen de núcleos tensoriales FP4, los pesos se descomprimen por software.

## Capacidades

- Generación de texto conversacional en chino (especialmente tradicional) e inglés.
- Ajuste por instrucciones mediante plantilla de chat propia, con token de parada `<|return|>`.
- Razonamiento básico y respuesta a preguntas, con las limitaciones descritas por el autor (rendimiento a nivel de azar en conocimiento de opción múltiple).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a chino e inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre cuantización de bajo bit: el modelo sirve como banco de pruebas reproducible para comparar NVFP4, INT8, FP8 y bnb-4bit sobre una misma arquitectura, dado que el autor publica métricas de bits por byte y latencia por token.
- Experimentación con arquitecturas híbridas KDA/GQA: útil para estudiar el comportamiento de Kimi Delta Attention en modelos pequeños y su interacción con la cuantización de pesos.
- Prototipado de asistentes en chino tradicional: permite validar pipelines de chat con la plantilla del modelo antes de migrar a un modelo de mayor calidad.
- Despliegue en GPU de consumo con memoria limitada: con 0,67 GB de pesos en memoria, cabe en tarjetas modestas para pruebas de inferencia local, aceptando la latencia de 107,8 ms por token medida en RTX 4070 Ti.
- Evaluación de degradación por cuantización: la diferencia de 0,0095 bits por byte frente a BF16 permite medir el impacto de FP4 en tareas de generación de texto chino.
- Docencia y demostraciones de cuantización con torchao: el repositorio incluye código de modelo, tokenizador y plantilla de chat, lo que facilita ejemplos ejecutables en cursos sobre compresión de modelos.
- Pruebas de pipelines de CI para formatos de pesos: sirve para verificar la compatibilidad de transformers 5.14, flash-linear-attention 0.5.2 y torchao 0.18 en entornos de integración.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante cuantizada. La model card indica que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple y remite al informe de evaluación del modelo de precisión completa. Los datos disponibles son métricas de calidad de cuantización y latencia:

| Pesos | Repositorio | Memoria en GPU | Bits por byte ↓ | Δ vs BF16 | ms/token |
|---|---|---:|---:|---:|---:|
| BF16 | Yunmo-Next-1B-Instruct | 2,02 GB | 0,9302 | — | 11,2 |
| INT8 | Yunmo-Next-1B-Instruct-INT8 | 1,08 GB | 0,9304 | +0,0002 | 13,6 |
| FP8 | Yunmo-Next-1B-Instruct-FP8 | 1,08 GB | 0,9313 | +0,0011 | 16,2 |
| NVFP4 | Yunmo-Next-1B-Instruct-NVFP4 | 0,67 GB | 0,9397 | +0,0095 | 107,8 |
| bnb-4bit | Yunmo-Next-1B-Instruct-bnb-4bit | 0,62 GB | 0,9390 | +0,0088 | 138,8 |

Las métricas de bits por byte se calcularon sobre 3.754 artículos de Wikipedia en chino creados después del 1 de octubre de 2026 (primeros 2.000 caracteres de cada uno). La latencia se midió con 1.024 tokens de contexto, batch 1, en una RTX 4070 Ti; la latencia BF16 corresponde al modelo Base, de arquitectura y tamaño idénticos. El autor no ha medido en GPUs Blackwell con núcleos tensoriales FP4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,67 GB solo para pesos NVFP4; hay que añadir la memoria de activaciones, caché KV y overhead del runtime.
- GPU recomendadas: RTX 4070 Ti (medida por el autor, sin núcleos FP4, con descompresión por software); GPUs Blackwell con núcleos tensoriales FP4 son el escenario teóricamente óptimo, aunque no se han publicado mediciones.
- Cabe en GPU de consumo: sí, con 0,67 GB de pesos en memoria.
- Opciones de despliegue: transformers (>=5.14,<6) con `trust_remote_code`, flash-linear-attention 0.5.2 y torchao >=0.18. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 107,8 ms por token en RTX 4070 Ti con 1.024 tokens de contexto y batch 1; el autor advierte de que en esa GPU todos los formatos cuantizados decodifican más lentamente que BF16 y que este formato debe usarse para ahorrar memoria, no para ganar velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-NVFP4 | 597.516.136 | no disponible | NVFP4 (torchao) | Apache-2.0 con restricciones en datos | Hugging Face |
| Yunmo-Next-1B-Instruct (BF16) | ~1.0B (autor) | no disponible | BF16 | Apache-2.0 con restricciones en datos | Hugging Face |
| Yunmo-Next-1B-Instruct-FP8 | ~1.0B (autor) | no disponible | FP8 | Apache-2.0 con restricciones en datos | Hugging Face |
| Yunmo-Next-1B-Instruct-bnb-4bit | ~1.0B (autor) | no disponible | bnb-4bit | Apache-2.0 con restricciones en datos | Hugging Face |

No se dispone de información sobre modelos de otros autores comparables en tamaño, arquitectura o tarea en la documentación proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica que el modelo está a nivel de azar en conocimiento de opción múltiple y que a menudo se equivoca en hechos.
- Riesgo de repetición: puede repetir texto hasta alcanzar el límite de tokens.
- Sin ajuste de seguridad: no se ha aplicado alineamiento de seguridad, por lo que no es apto para producción sin filtros adicionales.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo chino e inglés; el foco es el chino tradicional.
- Restricciones de licencia: aunque los pesos son Apache-2.0, algunas fuentes de ajuste imponen condiciones (AM-Thinking-v1 y destilaciones de AM-DeepSeek-R1: solo investigación; tw-instruct-500k: CC BY-NC-SA 4.0; no_robots: CC BY-NC 4.0; subconjuntos de FABLE.5: AGPL-3.0). Revisar las secciones Data y License del modelo base antes de un uso comercial.
- Rendimiento: en GPUs sin núcleos FP4 la decodificación es más lenta que BF16 (107,8 frente a 11,2 ms por token en RTX 4070 Ti); no usar esta variante buscando velocidad.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Dependencia de `trust_remote_code` y de versiones concretas de transformers, flash-linear-attention y torchao.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-NVFP4
- Modelo base de precisión completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Variante INT8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-INT8
- Variante FP8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-FP8
- Variante bnb-4bit: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-bnb-4bit
- Informe de evaluación: https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/evaluation.md#6-quantized-weights
- Repositorio GitHub del proyecto: https://github.com/YuhuanStudio/Yunmo-Next-1B
