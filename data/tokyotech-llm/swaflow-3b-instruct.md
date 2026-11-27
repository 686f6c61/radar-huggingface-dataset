# tokyotech-llm/SwaFlow-3B-Instruct

## Resumen

SwaFlow-3B-Instruct es un modelo de lenguaje de 3.740 millones de parámetros desarrollado por AIST y el Institute of Science Tokyo en el marco del programa japonés FRONTia (METI/NEDO). Se trata de un modelo de flujo riemanniano (hipersférico) no autorregresivo, es decir, genera texto integrando un flujo sobre la esfera desde ruido puro, condicionado por un prefijo limpio, en lugar de predecir el siguiente token de forma secuencial. Es la versión final con ajuste de instrucciones del modelo base SwaFlow-3B, entrenado con 4 billones de tokens de Dolma 3 Mix y afinado durante una época sobre Dolci-Instruct-SFT.

El modelo se presenta explícitamente como una herramienta de investigación para el estudio de modelos de lenguaje basados en flujo, no como un producto para aplicaciones. Forma parte de la suite SwaFlow, que incluye varios tamaños entrenados con la misma receta, estados intermedios de entrenamiento y gemelos autorregresivos como referencia comparativa. Su relevancia radica en que abre a la comunidad un paradigma alternativo al transformer autorregresivo clásico, con pesos, código de muestreo y datos documentados.

La arquitectura es un transformer de 28 capas, anchura 3072, 24 cabezas de atención y FFN de 8192, con un vocabulario de 49.152 tokens (tokenizador de SmolLM2) y una longitud de contexto de 2.048 tokens. La generación se realiza mediante integración numérica de un flujo con un número configurable de evaluaciones de función (por defecto 64 pasos en el ejemplo del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo riemanniano (hipersférico) no autorregresivo, 28 capas, anchura 3072, 24 cabezas, FFN 8192 |
| Parametros totales | 3.741.325.312 (3,74B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (pesos); tokenizador SmolLM2 Apache 2.0; datos ODC-By 1.0 |
| Formato de pesos | safetensors (fp32), config.json |
| Vocabulario | 49.152 tokens (tokenizador SmolLM2) |
| Modelo base | tokyotech-llm/SwaFlow-3B |
| Convencion temporal | α = 1 datos limpios, α = 0 ruido puro; ventana de entrenamiento α ∈ [0, 0,10] |

## Arquitectura y entrenamiento

SwaFlow-3B-Instruct es un modelo de lenguaje de flujo riemanniano: en lugar de modelar la distribución del siguiente token de forma autorregresiva, aprende un campo de velocidades que transporta ruido sobre la esfera unitaria hasta datos limpios. La generación consiste en integrar ese flujo desde α = 0 (ruido) hasta α = 1 (datos), manteniendo el prefijo del prompt limpio (α = 1) como condición. El muestreo se controla mediante `SamplerConfig`, que define el número de evaluaciones de función (`steps`), la temperatura y la regla de decodificación. La ventana de entrenamiento se restringe a α ∈ [0, 0,10], lo que condiciona el comportamiento del integrador.

El preentrenamiento utilizó 4 billones de tokens de Dolma 3 Mix (Allen Institute for AI, ODC-By 1.0) con los pesos de mezcla sin modificar, en pasos de 4.096 × 2.048 tokens, optimizador AdamW con LR 3e-4 constante tras el warmup, sobre 32 nodos × 8 NVIDIA H200. El ajuste de instrucciones consistió en una época de Dolci-Instruct-SFT: 1.107 pasos de 512 × 2.048 tokens (1,16B tokens), AdamW con LR 3e-5, warmup de 55 pasos y decaimiento lineal a cero durante el 90% final de los pasos, con ejemplos empaquetados por concatenación y troceado. Durante el ajuste el prompt se mantiene limpio (α = 1) y no se puntúa; la respuesta se corrompe con ruido según el α de la secuencia, igual que en el mid-training con prefijo limpio. Los ejemplos con llamadas a herramientas se excluyeron del ajuste.

## Capacidades

- Generación de texto no autorregresiva mediante integración de flujo sobre la esfera, con control del número de pasos de muestreo.
- Seguimiento de instrucciones en inglés tras una época de ajuste sobre Dolci-Instruct-SFT.
- Condicionamiento por prefijo limpio: el prompt (turnos `User:` y `Assistant:`) se mantiene intacto y actúa como condición del flujo.
- Formato de prompt en texto plano sin tokens especiales, con turnos `User: <texto>` separados por línea en blanco y `Assistant: <texto>`, terminando la respuesta en `<|endoftext|>` (id 0).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling ni function calling (los ejemplos con llamadas a herramientas se excluyeron del ajuste).
- No se documenta modo de razonamiento explícito, visión, audio ni capacidades de agente multi-paso.

## Casos de uso

- Investigación sobre modelos de lenguaje basados en flujo: el modelo sirve como punto de partida reproducible para estudiar el paradigma riemanniano frente al autorregresivo, con pesos, código de muestreo y receta de entrenamiento publicados.
- Estudio de escalado y recetas de entrenamiento: al formar parte de una suite con varios tamaños, estados intermedios y gemelos autorregresivos entrenados con el mismo orden de datos, permite aislar el efecto de la arquitectura frente a los datos.
- Experimentos de decodificación e integración numérica: el parámetro `steps` de `SamplerConfig` permite investigar el compromiso entre calidad y coste computacional en la integración del flujo.
- Análisis de ajuste de instrucciones en modelos no autorregresivos: la receta de una época sobre Dolci-Instruct-SFT con prefijo limpio y respuesta con ruido es un caso concreto para estudiar cómo se transfiere el seguimiento de instrucciones a este paradigma.
- Docencia y formación: el formato de prompt simple y el código de ejemplo permiten ilustrar el funcionamiento interno de un modelo de flujo sin depender de infraestructura propietaria.
- Comparación controlada con líneas base autorregresivas: los gemelos de la suite permiten medir la brecha de rendimiento en tareas de elección múltiple entre flujo y autorregresivo a igualdad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente señala de forma cualitativa que, en tareas de elección múltiple, todos los gemelos autorregresivos de la suite (incluido el de 150M) obtienen de media puntuaciones superiores al modelo de flujo de 3B final, y que el texto generado por los modelos de flujo, incluidos los afinados con instrucciones, es a menudo incoherente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 15 GB solo para pesos (3,74B × 4 bytes), más el estado del integrador y las activaciones; el tamaño del repositorio es de 15,0 GB.
- No se publican pesos cuantizados, por lo que no hay cifras oficiales para fp16, bf16, int8 o int4. Una conversión a bf16 reduciría los pesos a unos 7,5 GB, pero requeriría validar el código de muestreo con esa precisión.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA H200; para inferencia, cualquier GPU con suficiente memoria para fp32 (A100 40/80 GB, H100, L40S). En GPUs de consumo solo cabría en modelos con 24 GB o más (RTX 3090, RTX 4090) y probablemente tras conversión a menor precisión.
- Opciones de despliegue: el autor proporciona código propio en el repositorio `swallow-llm/swaflow-suite` (`torchtitan.models.swaflow.hf.from_pretrained` y `torchtitan.models.swaflow.sampling.generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es autorregresivo.
- Latencia y throughput: no disponibles. El coste depende del número de pasos de integración (`steps`, 64 en el ejemplo del autor) y de la longitud de secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Notas |
|---|---|---|---|---|---|
| SwaFlow-3B-Instruct | 3,74B | 2.048 | Flujo riemanniano no autorregresivo | Apache 2.0 | Afinado con instrucciones; orientado a investigación |
| Gemelos autorregresivos de la suite SwaFlow | Varios tamanos (incl. 150M) | No disponible | Autorregresivo | No disponible | Entrenados con los mismos datos; superan al 3B de flujo en eleccion multiple segun la model card |
| SwaFlow-3B (base) | 3,74B | 2.048 | Flujo riemanniano | Apache 2.0 | Estado `clean-prefix-4t/step-476800` sin ajuste de instrucciones |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos autorregresivos de tamaño similar de otros desarrolladores.

## Limitaciones y advertencias

- El propio autor indica que el modelo no está pensado para aplicaciones: es una herramienta de investigación sobre modelos de flujo.
- El texto generado, incluida la versión afinada con instrucciones, es a menudo incoherente según la model card.
- En tareas de elección múltiple, todos los gemelos autorregresivos de la suite, incluso el de 150M, superan de media al modelo de flujo de 3B final.
- Ninguno de los modelos de la suite está ajustado para evitar contenido dañino; no hay filtrado de seguridad documentado.
- Contexto limitado a 2.048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; no se documenta soporte multilingüe.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso; los ejemplos con llamadas a herramientas se excluyeron del ajuste.
- Los datos de ajuste (Dolci-Instruct-SFT) están pensados para investigación y uso educativo bajo las guías de uso responsable de Ai2, y algunas respuestas fueron generadas por otros modelos, lo que puede introducir sesgos y errores heredados.
- El formato de prompt requiere tokenizar cada parte por separado y unirlas, tal como en el entrenamiento; tokenizar la cadena completa puede producir divisiones distintas en los límites.
- Los pesos solo se publican en fp32, lo que encarece el despliegue y no hay cuantizaciones oficiales validadas.
- Riesgo de alucinación no cuantificado; dada la incoherencia señalada por el autor, debe asumirse elevado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokyotech-llm/SwaFlow-3B-Instruct
- Modelo base: https://huggingface.co/tokyotech-llm/SwaFlow-3B
- Colección de la suite SwaFlow: https://huggingface.co/collections/tokyotech-llm/swaflow-suite
- Código: https://github.com/swallow-llm/swaflow-suite
- Dataset de preentrenamiento (Dolma 3 Mix): https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Dataset de ajuste de instrucciones (Dolci-Instruct-SFT): https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Tokenizador (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
