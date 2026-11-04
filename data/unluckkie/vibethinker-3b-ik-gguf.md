# Unluckkie/VibeThinker-3B-IK-GGUF

## Resumen

VibeThinker-3B-IK-GGUF es una colección de cuantizaciones GGUF del modelo de razonamiento VibeThinker-3B, publicada por el usuario Unluckkie. El modelo base, desarrollado por WeiboAI, es un transformer denso de 3.085.938.688 parámetros (aproximadamente 3B) orientado específicamente a matemáticas, lógica formal y programación competitiva. Esta publicación no entrena un modelo nuevo: aplica cuantización con matriz de importancia (imatrix) mediante la herramienta `ik_llama.cpp` para preservar las rutas neuronales responsables del razonamiento paso a paso.

La relevancia de esta ficha reside en dos aspectos. Primero, el modelo base declara resultados llamativos para su tamaño (94,3 en AIME 2026, 89,3 en HMMT 2025 y 80,2 en LiveCodeBench v6, según la model card del cuantizador). Segundo, las cuantizaciones IQK permiten ejecutar ese razonamiento en hardware muy modesto: el autor cita un portátil con i5-8250U y 8 GB de RAM sin GPU dedicada como máquina de calibración. El repositorio ocupa 3,8 GB e incluye tres variantes (IQ4_KS, IQ5_KS e IQ6_K).

La advertencia principal es de compatibilidad: estos cuantizados IQK requieren `ik_llama.cpp` y no cargan en `llama.cpp` estándar, Ollama ni LM Studio. La licencia es Apache 2.0 y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (la model card del cuantizador etiqueta el modelo base como qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS (~1,8 GB), IQ5_KS (~2,1 GB), IQ6_K (~2,7 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes IQK compatibles con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base VibeThinker-3B es un transformer denso de unos 3B parámetros, etiquetado en la model card del cuantizador con el tag `qwen2`, lo que sugiere una arquitectura derivada de la familia Qwen2. Está especializado en razonamiento matemático y lógico, con un modo de generación de cadena de pensamiento paso a paso; la model card recomienda `--temp 0.6` y hasta 512 tokens de generación en el ejemplo de uso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta publicación concreta es el proceso de cuantización. Se partió de `VibeThinker-3B.BF16.gguf` y se generó una matriz de importancia con `llama-imatrix --chunks 200` sobre `calibration_en_small.txt` (mezcla de razonamiento general y lógica de `eaddario/imatrix-calibration`). Después se aplicó `llama-quantize --imatrix` de `ik_llama.cpp` para producir IQ4_KS, IQ5_KS e IQ6_K. El objetivo declarado es proteger los pesos más sensibles al razonamiento matemático y evitar que la cuantización degrade la cadena de pensamiento.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso (chain of thought).
- Resolución de problemas matemáticos de competición: el autor cita AIME 2026, HMMT 2025 y LiveCodeBench v6 como benchmarks objetivo del modelo base.
- Razonamiento lógico y formal.
- Programación competitiva y generación de código orientada a problemas algorítmicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modelo genera cadenas de pensamiento, pero no se documenta integración con frameworks de agentes.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales: no se documentan visión, audio ni modo thinking separado.

## Casos de uso

- Resolución asistida de problemas matemáticos: el modelo puede recibir un enunciado de competición y generar la demostración paso a paso. Es adecuado por su especialización declarada en AIME y HMMT y por ejecutarse en 1,8-2,7 GB.
- Entrenamiento para programación competitiva: sirve como tutóre local que explica algoritmos y verifica soluciones en problemas de tipo LiveCodeBench, sin depender de APIs externas.
- Verificación de razonamiento en pipelines de datos: puede generar cadenas de pensamiento para filtrar o etiquetar datasets matemáticos, aprovechando su bajo coste de inferencia en CPU.
- Uso educativo en equipos sin GPU: con IQ4_KS cabe en portátiles de 8 GB de RAM, lo que permite desplegar un asistente de matemáticas y lógica en aulas o entornos con hardware limitado.
- Prototipado de asistentes de análisis lógico: para validar flujos de razonamiento multi-paso antes de migrar a modelos mayores, usando IQ6_K como variante de máxima fidelidad.
- Evaluación de técnicas de cuantización: el repositorio documenta el pipeline completo (imatrix, calibración, tipos IQK), por lo que es útil como referencia reproducible para estudiar el impacto de la cuantización en modelos de razonamiento.
- Inferencia local offline en CPU: mediante `llama-cli` de `ik_llama.cpp`, adecuado para entornos air-gapped donde no se permite enviar datos a servicios en la nube.

## Benchmarks y rendimiento

La model card del cuantizador cita resultados del modelo base, no mediciones propias de los cuantizados:

| Benchmark | Resultado citado |
|---|---|
| AIME 2026 | 94,3 |
| HMMT 2025 | 89,3 |
| LiveCodeBench v6 | 80,2 |

No se han publicado en la información disponible mediciones comparativas de los cuantizados IQ4_KS, IQ5_KS e IQ6_K frente al BF16, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: IQ4_KS ~1,8 GB (recomendado con ~4 GB de RAM disponible), IQ5_KS ~2,1 GB (~6 GB de RAM), IQ6_K ~2,7 GB (~8 GB de RAM).
- GPU recomendadas: no disponibles; el autor valida el flujo en CPU (i5-8250U, 8 GB de RAM, sin GPU dedicada). Cualquier GPU con suficiente VRAM para el tamaño del archivo debería servir, pero no se documenta.
- ¿Cabe en GPU de consumo? Sí, por tamaño; los cuantizados de 1,8-2,7 GB caben en GPUs de consumo con 4-8 GB de VRAM, aunque no hay validación publicada.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (`llama-cli`, `llama-quantize`). No compatible con `llama.cpp` estándar, Ollama ni LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| VibeThinker-3B-IK-GGUF (esta ficha) | ~3,09B | no disponible | Razonamiento matemático y lógico | Apache 2.0 | GGUF IQK (solo ik_llama.cpp) |
| WeiboAI/VibeThinker-3B (base) | ~3,09B | no disponible | Razonamiento matemático y lógico | Apache 2.0 | safetensors/BF16 |
| prithivMLmods/VibeThinker-3B | ~3,09B | no disponible | Razonamiento matemático y lógico | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (3B especializados en matemáticas) en la documentación proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los cuantizados IQK no cargan en `llama.cpp` estándar, Ollama ni LM Studio; requieren compilar `ik_llama.cpp`.
- Idioma: solo inglés declarado; el rendimiento en castellano no está validado.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinación: inherente a los modelos de razonamiento; las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos, especialmente fuera de dominios matemáticos.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de calibración es una mezcla genérica en inglés.
- Cuantización: aunque se usa imatrix para proteger el razonamiento, no hay benchmarks publicados que cuantifiquen la pérdida respecto a BF16; el autor afirma que se conservan las puntuaciones de 90+ en AIME, pero sin datos verificables en la información disponible.
- Producción: al ser un repositorio de cuantización de un tercero (no el autor del modelo base), no hay garantías de mantenimiento ni de soporte.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base WeiboAI/VibeThinker-3B por si añaden restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Unluckkie/VibeThinker-3B-IK-GGUF
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- Modelo base alternativo citado: https://huggingface.co/prithivMLmods/VibeThinker-3B
- Herramienta de cuantización: https://github.com/ikawrakow/ik_llama.cpp
- Dataset de calibración: https://huggingface.co/eaddario/imatrix-calibration
