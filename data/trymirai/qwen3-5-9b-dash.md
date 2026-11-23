# trymirai/Qwen3.5-9B-Dash

## Resumen

Qwen3.5-9B-Dash es una cuantización empaquetada a 2 bits del modelo base Qwen/Qwen3.5-9B, desarrollada por Mirai Labs (cuenta trymirai) mediante su pipeline de cuantización Dash. El objetivo es reducir drásticamente el peso del modelo para hacer viable la inferencia local en Apple silicon sin degradar en exceso la calidad respecto al modelo profesor. Combina pesos MLX de 2 bits con transformadas de Hadamard-128 en las proyecciones del transformer, filas key/value de atención en INT8 y tablas de vocabulario de precisión mixta.

El checkpoint incorpora además un especulador de decodificación adaptado a esta cuantización concreta: un modelo borrador DFlash de seis capas, un modelo Weaver de una capa para la construcción del árbol de candidatos y una cabeza de confianza aprendida. Según la model card, el checkpoint alcanza una divergencia KL de 0,1256530 y un 88,98 % de acuerdo top-1 frente al profesor, medido con la herramienta romakl sobre 20 conversaciones y 14.399 tokens de continuación.

Es relevante porque demuestra que la cuantización agresiva a 2 bits, combinada con decodificación especulativa adaptada, puede mantener una fidelidad razonable respecto al modelo original en hardware de consumo Apple. El modelo base es Qwen3.5-9B, pero el checkpoint empaquetado declara 2.341.615.616 parámetros en safetensors y un tamaño de repositorio de 45,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen3.5-9B), pesos MLX empaquetados a 2 bits |
| Parametros totales | 2.341.615.616 (safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits empaquetado (MLX, group size 128) con Hadamard-128; filas KV en INT8; vocabulario mixto (245.824 filas 2-bit + 2.496 filas INT8); escalas y sesgos afines en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria uzu) |
| Modelo base | Qwen/Qwen3.5-9B |
| Paso de QAT | 4.000 |
| Libreria de inferencia | uzu |
| Tamano del repositorio | 45,9 GB |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura transformer de Qwen3.5-9B y aplica el esquema de cuantización Dash de Mirai. Las proyecciones del transformer almacenan pesos MLX de 2 bits empaquetados con transformadas de Hadamard-128, mientras que las filas key/value de la atención se mantienen en INT8. Las tablas de vocabulario usan precisión mixta: 245.824 filas a 2 bits con group size 128 y 2.496 filas en INT8. Las escalas de cuantización y los sesgos afines se guardan en bfloat16, y las tablas de vocabulario y el tokenizer comparten los mismos IDs de token reordenados.

El proceso incluye entrenamiento consciente de cuantización (QAT); este checkpoint corresponde al paso 4.000 del modelo kvs-dash empaquetado. La decodificación especulativa se apoya en el directorio `speculator/`, que contiene un borrador DFlash de seis capas, un modelo Weaver de una capa para construir el árbol de candidatos y una cabeza de confianza aprendida. Las proyecciones de DFlash y Weaver usan cuantización MLX de 2 bits con group size 128 y transformadas de Hadamard-32 de entrada/salida. El especulador y la cabeza de confianza están adaptados a este checkpoint empaquetado, con el token de máscara alineado al tokenizer reordenado.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B, sujetas a la degradación introducida por la cuantización a 2 bits.
- Razonamiento y matemáticas: potencialmente presentes por herencia del base, aunque no se documentan evaluaciones específicas en la información disponible.
- Generación de código: no se documenta explícitamente para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.
- Decodificación especulativa: soportada mediante el especulador DFlash + Weaver + cabeza de confianza incluidos en el repositorio.
- Inferencia en Apple silicon: soportada mediante el CLI `mirai` (Homebrew) y la librería uzu.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el formato MLX de 2 bits y el CLI `mirai` permiten ejecutar el modelo en un Mac sin GPU dedicada, usando `brew install mirai` y `mirai --model trymirai/Qwen3.5-9B-Dash`.
- Experimentación con cuantización extrema: útil para investigadores que quieran estudiar el compromiso calidad-tamaño a 2 bits con métricas de divergencia KL y acuerdo top-1 frente al profesor.
- Evaluación de decodificación especulativa: el especulador incluido permite medir la aceleración de la generación con árbol de candidatos y cabeza de confianza en un entorno controlado.
- Prototipado de asistentes conversacionales en local: al derivar de un modelo de 9B con contexto conversacional, sirve para probar flujos de chat multi-turno en hardware de consumo Apple, con la cautela de la pérdida de calidad por cuantización.
- Investigación sobre QAT: el checkpoint en el paso 4.000 permite comparar distintas etapas del entrenamiento consciente de cuantización.
- Docencia y demostraciones: el tamaño reducido de pesos en 2 bits facilita desplegar demostraciones de LLM en portátiles Apple sin infraestructura de servidor.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad respecto al profesor, medidas con romakl sobre 20 conversaciones y 14.399 tokens de continuación generados por el profesor:

| Metrica | Valor |
|---|---|
| Divergencia KL frente al profesor | 0,1256530 |
| Acuerdo top-1 | 88,98 % |
| Conjunto de evaluacion | 20 conversaciones, 14.399 tokens de continuacion |
| Herramienta | romakl |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 45,9 GB, aunque el peso efectivo en memoria depende del empaquetado a 2 bits y del runtime.
- GPU recomendadas: el autor solo documenta soporte para Apple silicon; no se indican GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No se documenta para GPU de consumo; el soporte declarado es exclusivamente Apple silicon.
- Opciones de despliegue: CLI `mirai` (Homebrew) y librería uzu; el autor indica que actualmente solo se soporta inferencia en Apple silicon. Para construir desde fuente, remite al repositorio de uzu.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Dash (este) | 2.341.615.616 (checkpoint cuantizado) | no disponible | 2 bits MLX + KV INT8 | apache-2.0 | Hugging Face, solo Apple silicon |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion | no disponible | pesos completos | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de cuantización a 2 bits comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce degradación medible: divergencia KL de 0,1256530 y acuerdo top-1 del 88,98 % frente al profesor, lo que implica un 11,02 % de desacuerdo en la predicción top-1.
- El soporte de inferencia está limitado a Apple silicon; no se documenta funcionamiento en GPU NVIDIA, AMD ni CPU genérica.
- El campo de idiomas del repositorio está vacío, por lo que no se garantiza cobertura multilingüe específica.
- No se documentan evaluaciones de seguridad, sesgos ni alucinación para este checkpoint; deben asumirse los riesgos del modelo base y añadirse los derivados de la cuantización.
- La licencia es apache-2.0, lo que permite uso comercial, pero conviene verificar los términos del modelo base Qwen3.5-9B, a los que la model card remite mediante license_link.
- El checkpoint corresponde al paso 4.000 de QAT; no se indica si es la versión final ni cómo se compara con pasos posteriores.
- El repositorio ocupa 45,9 GB, por lo que el almacenamiento necesario es considerable pese a la cuantización.
- El modelo tiene 0 likes y 444 descargas en el momento de la consulta, lo que sugiere adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-Dash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Repositorio uzu: https://github.com/trymirai/uzu/blob/main/README.md
- Herramienta romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime Prism (llama.cpp): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
