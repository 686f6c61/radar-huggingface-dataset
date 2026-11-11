# trymirai/Qwen3.5-2B-L

## Resumen

Mirai's Qwen3.5-2B Large es una cuantización de 8 bits del modelo base Qwen/Qwen3.5-2B, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. El checkpoint está pensado específicamente para inferencia local eficiente en Apple silicon, y se distribuye a través de la librería `uzu`, propia del autor, con un CLI instalable mediante Homebrew. El modelo conserva la arquitectura y el comportamiento del Qwen3.5-2B original; el trabajo aportado por Mirai es exclusivamente de compresión numérica, no de reentrenamiento.

El interés de esta ficha radica en que ejemplifica una tendencia relevante: la aparición de cuantizaciones "de autor" optimizadas para un backend concreto, con metodología publicada y métricas de divergencia KL frente al modelo original. Frente a las cuantizaciones genéricas de la comunidad (GGUF Q4/Q8 producidas con llama.cpp), Mirai aplica transformadas de Hadamard para controlar los valores atípicos de activaciones y pesos, lo que permite mantener 8 bits con escalas bfloat16 y grupos de 32 elementos.

El modelo tiene 1.941.483.904 parámetros y un repositorio de 10,0 GB. No se dispone de información sobre longitud de contexto nativa, idiomas soportados ni resultados de benchmarks en la documentación proporcionada; esos datos deben consultarse en la model card del modelo base Qwen3.5-2B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B; detalles no disponibles en esta ficha) |
| Parametros totales | 1.941.483.904 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits entero simétrico, escalas bfloat16, group size 32; transformadas de Hadamard aleatorias bloque-diagonales con bloque de 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `uzu`) |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios arquitectónicos: es una cuantización post-entrenamiento (PTQ) del modelo Qwen3.5-2B. La técnica aplicada es cuantización entera simétrica de 8 bits con escalas en bfloat16 y agrupación en bloques de 32 pesos. Para mitigar el impacto de los valores atípicos —el principal cuello de botella en cuantizaciones de baja precisión— se aplican transformadas de Hadamard aleatorias bloque-diagonales (block-diagonal Random Hadamard Transforms) con tamaño de bloque 32, que rotan las activaciones y los pesos hacia una distribución más gaussiana antes de cuantizar.

El autor publica una curva de divergencia KL frente al tamaño del checkpoint y afirma que este modelo se sitúa en la frontera de Pareto tamaño-KL: no existe, según su búsqueda, un checkpoint más pequeño con menor divergencia KL. La mezcla de datos de evaluación empleada para medir esa divergencia es 45 % datos públicos agénticos, 30 % SFT/contexto largo públicos y 25 % datos privados de chat. No se detalla el número de tokens de entrenamiento del modelo base ni si este pasó por RLHF o DPO; esa información corresponde a la model card original de Qwen.

## Capacidades

- Generación de texto en el mismo rango de capacidades que el modelo base Qwen3.5-2B (razonamiento, código, matemáticas), sujeto a la degradación propia de una cuantización de 8 bits.
- Inferencia local en Apple silicon mediante el runtime `uzu` y el CLI `mirai`.
- No se documentan en esta ficha capacidades de tool calling, agentes, visión, audio ni modo thinking; deben verificarse en la model card del modelo base.
- El soporte multilingüe no está declarado en la información disponible.

## Casos de uso

- Prototipado local en Mac: desarrolladores que quieran probar un modelo de ~2B sin depender de la nube pueden instalarlo con `brew install mirai` y ejecutarlo con una sola orden, lo que reduce la fricción para experimentar con prompts y flujos.
- Aplicaciones de escritorio con IA integrada: al ejecutarse íntegramente en el dispositivo, el modelo es adecuado para asistentes de texto dentro de apps macOS donde la privacidad de los datos es un requisito y no se quiere enviar contenido a servidores externos.
- Evaluación comparativa de cuantizaciones: investigadores que estudien el compromiso tamaño-calidad pueden usar este checkpoint como referencia de una cuantización de 8 bits con metodología publicada (Hadamard + escalas bf16 + grupo 32) frente a alternativas GGUF.
- Generación de texto offline en entornos con conectividad limitada: al no requerir red tras la descarga, encaja en escenarios de campo, demos en ferias o entornos air-gapped.
- Filtrado y clasificación de texto a pequeña escala: tareas de etiquetado, resumen corto o reescritura donde un modelo de 2B es suficiente y la latencia local importa más que la calidad puntera.
- Base para ajuste fino ligero: el formato safetensors y la licencia Apache 2.0 facilitan partir de este checkpoint para adaptaciones posteriores, aunque la cuantización de 8 bits limita el entrenamiento directo y requeriría de-cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una curva de divergencia KL frente al tamaño del checkpoint, sin cifras concretas en la documentación accesible, y afirma que el modelo se encuentra en la frontera de Pareto tamaño-KL según su propia evaluación.

## Requisitos de hardware

- VRAM/RAM estimada: con 1.941.483.904 parámetros en 8 bits, el peso ronda los 2 GB; el repositorio ocupa 10,0 GB, presumiblemente por incluir múltiples artefactos o metadatos del runtime `uzu`.
- Plataforma soportada: exclusivamente Apple silicon según la model card ("Currently only Apple silicon inference is supported").
- GPU recomendadas: no aplica en el sentido habitual; el modelo está pensado para GPU integradas de Apple (familias M1, M2, M3, M4 y superiores).
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple silicon; no se documenta soporte para CUDA, ROCm ni CPU x86.
- Opciones de despliegue: CLI `mirai` (Homebrew) y runtime `uzu`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-2B-L | 1.941.483.904 | no disponible | 8 bits (uzu, Apple silicon) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | bf16/fp16 original | Apache 2.0 | Hugging Face |
| Cuantizaciones GGUF comunitarias del mismo base | ~2B | depende del base | Q4–Q8 (llama.cpp) | Apache 2.0 | Hugging Face |

La comparación relevante es frente al modelo base sin cuantizar y frente a cuantizaciones GGUF de la comunidad: Mirai-L ofrece 8 bits con metodología publicada y runtime propio para macOS, mientras que las GGUF son portables a más plataformas pero no aplican transformadas de Hadamard. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- La cuantización de 8 bits introduce una degradación inevitable respecto al modelo original; el autor la cuantifica mediante divergencia KL, pero no publica cifras absolutas en la documentación accesible.
- Soporte exclusivo de Apple silicon: no es desplegable en GPUs NVIDIA, AMD ni en CPU x86 con los runtimes documentados, lo que limita su uso en servidores y clústeres.
- Dependencia de un runtime propietario del ecosistema Mirai (`uzu`): la portabilidad a otros motores de inferencia no está garantizada.
- Riesgo de alucinación inherente a un modelo de ~2B, especialmente en tareas de razonamiento largo o conocimiento factual.
- No se documentan sesgos, idiomas soportados ni limitaciones específicas de contexto en esta ficha; deben consultarse en la model card del Qwen3.5-2B original.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y las condiciones del runtime `uzu`, que no se detallan aquí.
- El modelo no ha sido validado por terceros según la información disponible; las afirmaciones sobre la frontera de Pareto provienen del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-2B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Página del producto en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-2b-mirai-mirai-l-8
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Documentación de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
