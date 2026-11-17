# yandex/AliceAI-Foundation-80B-A3B-Base

## Resumen

AliceAI-Foundation-80B-A3B-Base es un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) desarrollado por Yandex, presentado como modelo base (preentrenamiento, sin ajuste de instrucciones). Cuenta con 81.286.433.408 parámetros totales y activa aproximadamente 3.000 millones por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de 3B pese a su capacidad total de 80B. Soporta una longitud de contexto de 262.144 tokens.

El modelo destaca por su arquitectura híbrida: combina capas KDA (atención con estado, al estilo de las arquitecturas de atención lineal) con capas de atención con compuerta (Gated Attention), intercaladas con capas MoE de 512 expertos con top-10 más un experto compartido. Fue entrenado desde cero, con decisiones arquitectónicas validadas mediante entrenamientos independientes de 2 billones de tokens cada uno. Su punto fuerte declarado son las tareas de conocimiento factual en ruso, para lo cual Yandex publica los benchmarks WikiWebFacts y HardMultiQA junto con los pesos.

Es relevante porque ofrece una licencia Apache 2.0 sobre un modelo de 80B con contexto de 256K y activación dispersa, lo que lo hace viable en infraestructura de inferencia moderada. Ahora bien, al ser un modelo base, no incorpora alineación conversacional ni seguimiento de instrucciones: requiere ajuste posterior para uso en producción como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido con MoE; esquema 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)) |
| Parámetros totales | 81.286.433.408 |
| Parámetros activos | ~3B por token (top-10 de 512 expertos + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code` en transformers; compatible con vLLM) |

Datos arquitectónicos adicionales: tamaño de estado oculto 2048; vocabulario de 129.024 tokens; 48 capas; KDA con 32 cabezas query y 32 cabezas KV de dimensión 128 y kernel de convolución de tamaño 4; Gated Attention con 16 cabezas query y 2 cabezas KV de dimensión 256; expertos con dimensión intermedia de 512; una capa MTP (Multi-Token Prediction).

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo con un patrón de capas repetido 12 veces: tres bloques compuestos por una capa KDA seguida de una capa MoE, y un cuarto bloque con Gated Attention seguida de MoE. La KDA es un mecanismo de atención con estado recurrente (atención lineal) que reduce el coste de memoria de la caché KV en contextos largos, mientras que las capas de Gated Attention aportan atención completa periódica. El bloque MoE emplea 512 expertos con enrutamiento top-10 más un experto siempre activo, con dimensión intermedia de 512 por experto. La capa MTP (Multi-Token Prediction) puede habilitar decodificación especulativa o entrenamiento con predicción multi-token.

El modelo fue entrenado completamente desde cero. Yandex indica que reconstruyó el corpus de entrenamiento, seleccionó arquitectura e hiperparámetros, y preparó datos específicos para razonamiento complejo e interacción con herramientas. Las decisiones clave se validaron con una serie de entrenamientos independientes desde cero de 2 billones de tokens cada uno. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya alineación por preferencias, pero esto no se confirma explícitamente.

## Capacidades

- Generación de texto autorregresiva en ruso e inglés.
- Razonamiento matemático y de código: el autor declara resultados en matemáticas y programación comparables a modelos de mayor tamaño.
- Conocimiento factual, con especial énfasis en ruso (benchmarks WikiWebFacts y HardMultiQA publicados junto al modelo).
- Preparación para interacción con herramientas: el autor menciona datos de entrenamiento orientados a tool calling, aunque al ser un modelo base no incluye un formato de llamada a funciones predefinido.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y tareas de recuperación sobre corpus extensos.
- Capacidad de predicción multi-token (capa MTP), aprovechable para decodificación especulativa.
- No dispone de modo thinking, visión, audio ni capacidades multimodales según la información disponible.
- No incluye ajuste de instrucciones ni diálogo: no es un modelo chat.

## Casos de uso

- Ajuste fino para asistentes en ruso: al ser un modelo base con licencia Apache 2.0, es un punto de partida para SFT y DPO orientados a atención al cliente o asistentes corporativos en ruso, aprovechando su conocimiento factual en ese idioma.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o expedientes completos sin troceado agresivo.
- Generación de código en pipelines: tras ajuste, puede integrarse en flujos de autocompletado o generación de tests; su coste de activación de ~3B lo hace viable con throughput alto en GPUs de gama alta.
- Búsqueda aumentada (RAG) sobre corpus en ruso: su rendimiento declarado en HardMultiQA y WikiWebFacts lo hace adecuado como generador en sistemas de recuperación para dominios con alta densidad de conocimiento factual en ruso.
- Investigación en arquitecturas híbridas: la combinación KDA + Gated Attention + MoE con MTP lo convierte en un objeto de estudio para experimentos sobre atención lineal y eficiencia de contexto largo.
- Traducción y adaptación ru-en: con ajuste específico, puede emplearse en traducción técnica o localización, dado su soporte bilingüe declarado.
- Destilación y generación de datos sintéticos: como modelo base de 80B con activación dispersa, puede generar datos de entrenamiento a coste de inferencia relativamente bajo.

## Benchmarks y rendimiento

Resultados publicados en la model card (inferencia en vLLM, temperatura 0, comparación con modelos base de la competencia):

| Benchmark | AliceAI-80B-A3B | Qwen3.5-35B-A3B | GLM-4.5-Air (106B-A12B) | Nemotron-3-Super-120B-A12B | DeepSeek-V4-Flash (284B-A13B) |
|---|---|---|---|---|---|
| WikiWebFacts (5-shot, ru) | 86,5 | 62,4 | 70,2 | 72,8 | 83,2 |
| HardMultiQA (5-shot, ru) | 67,9 | 47,2 | 48,6 | 54,5 | 65,4 |

Los datos de CultCat y del resto de benchmarks incluidos en la model card (matemáticas, código y otras categorías) no están completos en la información proporcionada; no se reproducen cifras no verificadas. No se dispone de resultados de MMLU, HumanEval o GSM8K en el material consultado.

## Requisitos de hardware

- Pesos en precisión original (BF16): ~162,6 GB de repositorio, por lo que la inferencia en BF16 requiere al menos 2 × H100 80 GB o 4 × A100 80 GB, además de memoria para la caché KV.
- Cuantización a 8 bits: ~81 GB de pesos, viable en 1 × H100 80 GB con margen ajustado o en 2 × A100 40 GB.
- Cuantización a 4 bits: ~41 GB de pesos, viable en 1 × A100 80 GB o 2 × RTX 4090 24 GB; no cabe en una única GPU de consumo de 24 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB, y en configuraciones multi-GPU, RTX 4090 o L40S.
- Despliegue: el modelo declara compatibilidad con vLLM y requiere `trust_remote_code` en transformers por el `custom_code`. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La activación de ~3B parámetros por token sugiere un coste computacional por token bajo en relación con el tamaño total, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base | 81,3B | ~3B | 262.144 | Apache 2.0 | Base, híbrido KDA + Gated Attention, foco en ruso |
| Qwen3.5-35B-A3B-Base | 35B | ~3B | no disponible | no disponible | Base, MoE; peor en benchmarks factuales en ruso |
| GLM-4.5-Air-Base | 106B | 12B | no disponible | no disponible | Base, MoE; mayor coste de activación |
| Nemotron-3-Super-120B-A12B-Base | 120B | 12B | no disponible | no disponible | Base, MoE; mayor tamaño total |
| DeepSeek-V4-Flash-Base | 284B | 13B | no disponible | no disponible | Base, MoE; el competidor más cercano en ruso |

En la comparativa publicada, AliceAI supera a todos los modelos listados en WikiWebFacts y HardMultiQA, incluido DeepSeek-V4-Flash, que tiene 3,5 veces más parámetros totales. La ventaja principal es la combinación de licencia Apache 2.0, contexto de 256K y activación de ~3B, que reduce el coste de servicio frente a modelos con 12-13B activos.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogo de forma fiable sin ajuste fino previo.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la información disponible; un modelo preentrenado con corpus web en ruso e inglés es susceptible de reproducir sesgos presentes en esos datos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el autor no publica tasas de alucinación medidas.
- Idiomas: solo ruso e inglés declarados; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto largo: aunque soporta 262.144 tokens, no se aportan resultados de benchmarks de contexto largo (needle-in-a-haystack o similares) que confirmen la calidad de la recuperación en toda la ventana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad del cumplimiento normativo en su jurisdicción.
- Dependencia de `custom_code`: la integración requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene auditar dicho código en entornos de producción.
- No se dispone de información sobre cuantizaciones oficiales publicadas ni sobre soporte en runtimes distintos de vLLM y transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Dataset WikiWebFacts: https://huggingface.co/datasets/yandex/WikiWebFacts
- Dataset HardMultiQA: https://huggingface.co/datasets/yandex/HardMultiQA
- Artículo técnico en Habr: https://habr.com/ru/companies/yandex/articles/1083300/
- README en inglés: ./README_en.md (dentro del repositorio del modelo)
