# ssurface/cot-dialect-qwen3-4b-instruct-sft-l0

## Resumen

El modelo `cot-dialect-qwen3-4b-instruct-sft-l0` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Forma parte de una familia de adaptadores que estudian el efecto de la compresión de cadenas de razonamiento (chain-of-thought, CoT) en el rendimiento de modelos de lenguaje. Este adaptador concreto es el nivel L0, el ancla del extremo verboso: se entrena con las cadenas de razonamiento originales y sin comprimir del dataset GSM8K, por lo que sirve como línea base para comparar con versiones comprimidas.

El adaptador se entrena mediante supervisión fina (SFT) sobre el conjunto de entrenamiento de GSM8K, utilizando las soluciones doradas completas. El resultado es un modelo especializado en razonamiento matemático que alcanza un 81,5% de precisión exacta en el test de GSM8K con decodificación greedy y sin técnicas adicionales como self-consistency. Su relevancia radica en permitir aislar el impacto de la compresión del razonamiento, manteniendo todo lo demás constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA de 0,1 GB; el modelo base tiene 4 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se listan cuantizaciones del adaptador) |
| Idiomas soportados | ingles (entrenado y evaluado solo en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la arquitectura LoRA (Low-Rank Adaptation) con rango r=16, alpha=32 y dropout de 0,05, aplicada sobre el modelo base Qwen3-4B-Instruct-2507, que es un transformer decoder-only con 4 mil millones de parametros. El entrenamiento se realiza mediante supervisión fina (SFT) actuando como destilación, sobre el conjunto de entrenamiento de GSM8K, usando las cadenas de razonamiento originales sin ninguna compresión. Se emplean 3 épocas, una tasa de aprendizaje de 2e-4 con programacion coseno y warmup del 3%, un tamaño de lote efectivo de 64 (16 por paso con 4 pasos de acumulacion de gradiente), una longitud maxima de secuencia de 1024 tokens y precision bf16. El hardware utilizado fue una unica GPU NVIDIA A100 de 80 GB.

Una particularidad tecnica destacable es que la funcion de perdida se calcula solo sobre la parte de finalizacion (completion), con las longitudes de los prompts precomputadas en tiempo de carga en lugar de mediante busqueda de patrones. Esto evita que el collator de busqueda de patrones enmascare silenciosamente nada, lo que habria permitido que la prioridad de tool-calling del modelo base se filtrara en las cadenas de razonamiento.

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras aritmeticos y de varios pasos del estilo GSM8K, generando cadenas de razonamiento explicitas y verbosas.
- Generacion de texto con cadena de pensamiento: produce explicaciones paso a paso sin comprimir, utiles para analisis de procesos de razonamiento.
- Herencia del modelo base: al ser un adaptador sobre Qwen3-4B-Instruct-2507, conserva las capacidades generales de ese modelo (generacion de texto, codigo, comprension multilingue), aunque el entrenamiento especifico solo ha tocado razonamiento matematico en ingles.
- No se ha evaluado en tool calling, agentes, vision, audio ni otras tareas; no hay evidencia de soporte adicional.

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: este adaptador actua como linea base verbosa para comparar con versiones comprimidas del mismo estudio, permitiendo medir la perdida de precision al reducir la verbosidad del CoT.
- Benchmarking de razonamiento matematico en modelos pequenos: con 4B de parametros y un 81,5% en GSM8K, sirve como referencia para evaluar tecnicas de SFT o destilacion en tareas de matematicas.
- Destilacion de razonamiento: al generar cadenas de pensamiento completas y detalladas, puede usarse como modelo profesor para entrenar modelos mas pequenos o adaptadores con CoT comprimido.
- Analisis de robustez del razonamiento: permite estudiar como varia la precision al cambiar el formato de las cadenas (verboso vs. comprimido) manteniendo el mismo modelo base y los mismos datos.
- Generacion de explicaciones paso a paso: en entornos educativos o de documentacion, puede producir soluciones matematicas explicadas de forma extensa, aunque solo en ingles.
- Evaluacion de tecnicas de SFT con LoRA: sirve como ejemplo reproducible de ajuste fino de bajo rango sobre un modelo instructivo, con hiperparametros documentados y codigo de uso incluido.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en la model card, el adaptador obtiene los siguientes resultados en el test de GSM8K (n=1317, decodificacion greedy, una sola pasada, sin ejemplos, sin self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 81,5% |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. Tampoco se proporciona comparacion con el modelo base sin adaptar ni con otros adaptadores de la misma familia.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa aproximadamente 0,1 GB, pero es necesario cargar el modelo base Qwen3-4B-Instruct-2507. En bf16, el modelo base requiere alrededor de 8 GB de VRAM (4B parametros × 2 bytes). Con cuantizacion a 4 bits (por ejemplo, bitsandbytes) se puede reducir a unos 2-3 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090 o A100 de 80 GB son suficientes para inferencia en bf16 sin cuantizar. Para cuantizacion de 4 bits, una GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060) puede ser suficiente.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas con al menos 8 GB de VRAM, especialmente usando cuantizacion.
- Opciones de despliegue: el adaptador se usa con HuggingFace `transformers` + `peft` (cargando el modelo base y luego el adaptador con `PeftModel`). Tambien se puede fusionar el adaptador con el modelo base y exportar a GGUF para usarlo con llama.cpp u Ollama, aunque no se documenta ese flujo en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores de la misma familia ni con modelos de tamano similar en la informacion proporcionada. El unico punto de referencia conocido es el propio modelo base Qwen3-4B-Instruct-2507, cuyo rendimiento en GSM8K no se cita en la ficha. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La precision cae con la dificultad del problema, especialmente en los niveles mas comprimidos del estudio, aunque este adaptador es el menos comprimido.
- El resultado de 81,5% proviene de una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (margen de error del 95% de aproximadamente ±2,7 puntos porcentuales para n=1317).
- Solo soporta ingles; no se ha evaluado en otros idiomas.
- Es un adaptador LoRA, no un modelo autonomo; requiere cargar el modelo base Qwen3-4B-Instruct-2507 para funcionar.
- No se ha probado en entornos de produccion ni con cargas de trabajo reales; su uso recomendado es investigacion y experimentacion.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base, que tambien es Apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l0
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
