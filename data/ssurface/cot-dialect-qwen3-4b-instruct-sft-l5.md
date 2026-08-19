# ssurface/cot-dialect-qwen3-4b-instruct-sft-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-sft-l5` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de razonamiento (chain-of-thought) extremadamente comprimidas, en un nivel denominado L5. En este nivel, el razonamiento interno se reduce a una única expresión colapsada, con una mediana de 16 caracteres dentro de la etiqueta `thinking`, frente a los 532 caracteres del nivel L1. El objetivo es estudiar hasta qué punto se puede comprimir el razonamiento sin perder precisión en tareas matemáticas.

El adaptador se entrenó mediante supervisión fina (SFT) por destilación sobre el conjunto de entrenamiento de GSM8K, re-expresado por un modelo profesor a nivel L5. El resultado publicado es una precisión del 65,1% en el test de GSM8K con decodificación greedy y sin self-consistency. Es un trabajo de investigación sobre compresión de cadenas de pensamiento, no un modelo de propósito general, y está pensado para la comunidad que estudia eficiencia en razonamiento.

La relevancia actual radica en la creciente presión por reducir el coste computacional del razonamiento en modelos grandes. Este adaptador demuestra que es posible comprimir drásticamente el espacio de razonamiento manteniendo un rendimiento aceptable en problemas matemáticos, aunque con una caída clara frente al modelo base sin comprimir. El repositorio incluye el adaptador, el código de entrenamiento y las instrucciones de uso, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (parametros no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenamiento con max_seq_length=1024) |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva; es un adaptador LoRA de rango 16 (alpha 32, dropout 0.05) aplicado sobre las capas de atención y MLP de Qwen3-4B-Instruct-2507. El entrenamiento se realizó con supervisión fina (SFT) por destilación: un modelo profesor re-expresó los 6993 ejemplos de entrenamiento de GSM8K en cadenas de razonamiento de nivel L5, y el adaptador se ajustó para imitar esas cadenas comprimidas. Se usaron 3 épocas, tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%, tamaño de lote efectivo de 64 (16 por paso con acumulación de gradientes de 4), y precisión bf16 sobre una única GPU NVIDIA A100 de 80GB.

Un detalle técnico relevante: el collator original usaba búsqueda de patrones para localizar las etiquetas `thinking`, pero enmascaraba silenciosamente nada, lo que permitió que el prior de tool calling del modelo base se filtrara en las cadenas generadas. El autor corrigió esto precomputando las longitudes de los prompts en tiempo de carga. La pérdida se calcula únicamente sobre la parte de completado, no sobre el prompt.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas a nivel extremo (una sola expresión, mediana de 16 caracteres).
- Generación de texto y comprensión del lenguaje heredadas del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling del modelo base, aunque con posible interferencia por la compresión del razonamiento.
- Capacidades multilingües del modelo base, pero el adaptador fue entrenado y evaluado solo en inglés.
- No incluye capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el adaptador permite estudiar el trade-off entre longitud del razonamiento interno y precision en tareas matematicas, comparando niveles L1 a L5.
- Destilacion de razonamiento eficiente: puede servir como punto de partida para generar datos de entrenamiento con cadenas de pensamiento muy cortas, reduciendo el coste de inferencia en modelos desplegados.
- Benchmarking de modelos pequenos: al ser un adaptador ligero (0.1 GB) sobre un modelo de 4B, es util para medir el impacto de la compresion en entornos con recursos limitados.
- Evaluacion de robustez en problemas aritmeticos: con GSM8K como referencia, se puede analizar como varia la precision con la dificultad del problema y con el nivel de compresion.
- Estudio de artefactos de entrenamiento: la filtracion del prior de tool calling documentada en la model card ofrece un caso de estudio para depurar pipelines de SFT.
- Generacion de explicaciones concisas: en aplicaciones donde se requiere una respuesta breve con un minimo de razonamiento visible, el adaptador puede forzar salidas extremadamente compactas.

## Benchmarks y rendimiento

Resultado declarado por el autor en la model card, sobre el test de GSM8K (n=1317, decodificacion greedy, una sola pasada, sin ejemplos ni self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 65,1% |

No se han publicado resultados comparativos con el modelo base sin comprimir ni con otros adaptadores de la familia en la informacion disponible. El autor indica que la precision cae con la dificultad del problema y que diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2,7 puntos porcentuales para n=1317).

## Requisitos de hardware

- El adaptador LoRA es muy pequeno (0.1 GB), por lo que el requisito principal es el del modelo base Qwen3-4B-Instruct-2507.
- El modelo base en bf16 ocupa aproximadamente 8 GB de VRAM; con cuantizacion de 4 bits (no incluida en el repositorio) se reduce a unos 2-3 GB.
- Para inferencia en GPU consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. En GPUs con menos VRAM (por ejemplo 8 GB) se puede usar cuantizacion o desplegar con vLLM en modo CPU.
- El entrenamiento se realizo en una NVIDIA A100 80GB, pero no es necesario ese hardware para inferencia.
- Opciones de despliegue: HuggingFace `transformers` con `peft`, `vLLM` (si se fusiona el adaptador), `llama.cpp` (requiere convertir el adaptador a GGUF, no incluido).
- La latencia dependera del hardware; con una RTX 4090 y el modelo en bf16 se espera una generacion de decenas de tokens por segundo, aunque las cadenas comprimidas reducen el numero total de tokens generados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros adaptadores de compresion de chain-of-thought ni con el modelo base sin adaptador en la informacion proporcionada. La unica referencia es el propio modelo base Qwen3-4B-Instruct-2507, del cual se conoce que rinde mejor en GSM8K sin compresion, pero no se ha publicado su valor exacto en esta ficha. No se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no es adecuado para otras tareas de razonamiento sin validacion previa.
- La precision disminuye rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas altos.
- Los resultados son de una unica semilla; diferencias de un par de puntos porcentuales pueden deberse al azar.
- El adaptador solo soporta ingles; el uso en otros idiomas no esta garantizado.
- Se ha documentado una posible filtracion del prior de tool calling del modelo base en las cadenas generadas, lo que puede producir comportamientos inesperados en entornos de agente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- No se incluyen pesos del modelo base ni cuantizaciones; es necesario descargar el adaptador y el modelo base por separado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base original (sin instruccion): https://huggingface.co/Qwen/Qwen3-4B
- Documentacion de despliegue en Qualcomm (para el modelo base): https://aihub.qualcomm.com/compute/models/qwen3_4b y https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
