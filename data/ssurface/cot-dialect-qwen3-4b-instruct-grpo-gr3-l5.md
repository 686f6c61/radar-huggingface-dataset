# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l5

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l5` es un adaptador LoRA de ablación publicado por ssurface (Anatolii Frolov) que modifica el modelo base `Qwen/Qwen3-4B-Instruct-2507` para razonar en un nivel de compresión extremo de cadenas de pensamiento, denominado L5. En este nivel, la cadena de razonamiento se colapsa en una única expresión matemática breve —la mediana de longitud es de 16 caracteres dentro de la etiqueta `thinking`— frente a los 532 caracteres del nivel L1, lo que supone un rango de compresión de 33x. El adaptador se entrena con GRPO sobre un modelo SFT previo fusionado, usando un conjunto de recompensas que incluye `correctness`, `format` y `gr3`, esta última un reescalado multiplicativo de la recompensa positiva.

Se trata de un artefacto de investigación, no de un modelo de producción: se publica para permitir reproducir la comparación de diseño de recompensas descrita en el paper *Chain-of-Thought Compression Dialects*. No ha sido evaluado de forma independiente y su rendimiento puede ser inferior al del modelo principal del mismo nivel (`ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`). Está entrenado exclusivamente con problemas de matemáticas del dataset GSM8K y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (Transformer decoder-only) |
| Parametros totales | no disponible (modelo base de 4B; adaptador LoRA r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un Transformer decoder-only de 4B parametros. El entrenamiento se realiza en dos fases: primero se fusiona un modelo SFT de nivel L5 (que reexpresa los ejemplos de GSM8K con cadenas de pensamiento comprimidas), y sobre ese modelo fusionado se aplica GRPO con el trainer `trl.GRPOTrainer` de Transformers, usando atencion `sdpa` sin kernels fusionados. La configuracion de GRPO incluye 8 generaciones por prompt, batch de 64 con 1 acumulacion, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0. El dataset de prompts es `gsm8k_grpo_balanced_1k.json`, y el entrenamiento se ejecuto en una unica GPU NVIDIA A100 80GB.

La funcion de recompensa combina tres componentes: `correctness` (que pondera la coincidencia de respuesta por el numero de pasos de la solucion dorada, dando mas peso a problemas dificiles), `format` (exige una estructura `thinking... response` seguida de `#### <answer>`) y `gr3` (reescalado multiplicativo de la recompensa positiva combinada, con un suelo de 0.3, que no puede reordenar respuestas correctas sobre incorrectas). El tipo de loss es `dapo`. Una nota tecnica importante: se verifico que todos los adaptadores publicados tienen matrices `lora_B` no nulas, ya que el camino con kernels fusionados producia adaptadores inertes matematicamente.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (nivel L5, mediana de 16 caracteres).
- Generacion de texto en ingles siguiendo el formato de respuesta `thinking... response` y `#### <answer>`.
- Capacidad de tool calling y function calling: no disponible (no se menciona en la informacion).
- Capacidades de agente y razonamiento multi-paso: limitadas a problemas de matematicas con una sola expresion comprimida.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: compresion de chain-of-thought como objeto de investigacion; no incluye vision ni audio.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: permite estudiar como afecta la longitud del razonamiento a la precision en problemas aritmeticos, comparando niveles L1 a L5 dentro de la misma familia de adaptadores.
- Ablacion de diseno de recompensas: sirve para reproducir el experimento de la recompensa `gr3` frente a otras variantes, evaluando el impacto del reescalado multiplicativo en el rendimiento final.
- Evaluacion de robustez en razonamiento comprimido: util para medir la degradacion de precision cuando el modelo debe operar con cadenas de pensamiento minimas, especialmente en problemas de dificultad creciente.
- Benchmark de metodos de entrenamiento GRPO: permite comparar configuraciones de hiperparametros (beta, loss type, generaciones por prompt) sobre una tarea estandar como GSM8K.
- Desarrollo de sistemas de razonamiento eficiente: aunque no es un modelo de produccion, sus resultados informan el diseno de modelos que reducen el coste de inferencia al acortar el razonamiento interno.
- Validacion de artefactos de entrenamiento: el codigo de carga y verificacion de `lora_B != 0` sirve como referencia para depurar pipelines de PEFT con GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador no fue evaluado por separado y que los niveles con numeros reportados pertenecen al conjunto principal de la coleccion. Se menciona que la precision cae con la dificultad del problema y que las diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (95% half-width de ~2.7 pp con n=1317 y ~4.4 pp con n=500).

## Requisitos de hardware

- El entrenamiento se realizo en una unica NVIDIA A100 80GB.
- Para inferencia, el adaptador LoRA es ligero (0.1 GB en el repositorio), pero el modelo base Qwen3-4B-Instruct-2507 requiere recursos proporcionales a sus 4B parametros; no se proporcionan estimaciones exactas de VRAM.
- Es probable que quepa en GPUs consumer (p. ej., RTX 4090 con 24GB) usando cuantizacion del modelo base, aunque no se confirma en la informacion.
- Opciones de despliegue: se puede usar con `transformers` + `peft` cargando el adaptador sobre el modelo base; tambien es compatible con motores que soporten PEFT, aunque no se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El adaptador pertenece a una familia de niveles de compresion (L1 a L5) y a una cuadricula de variantes de recompensa, pero los resultados de los modelos principales no se incluyen en esta ficha. Como referencia cualitativa, el modelo principal del mismo nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`, que si lleva numeros reportados en la coleccion, mientras que este `gr3` es una ablacion sin evaluacion independiente. Tampoco se proporcionan comparaciones con otros modelos de razonamiento comprimido.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con palabras (GSM8K); no es adecuado para otras tareas sin adaptacion.
- La precision disminuye rapidamente con la dificultad del problema, especialmente en niveles de compresion altos como L5.
- Es un artefacto de ablacion: puede ser peor que el modelo principal del mismo nivel, ya que fue entrenado para responder una pregunta concreta sobre diseno de recompensas.
- Requiere cargar primero el adaptador SFT de nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados.
- Entrenado con una sola semilla; las diferencias de rendimiento de unos pocos puntos porcentuales pueden deberse al ruido.
- Solo soporta ingles.
- Riesgo de alucinacion: no se evalua en esta ficha, pero al ser un modelo de razonamiento comprimido, las respuestas pueden ser incorrectas sin señal de incertidumbre.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adapter SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Paper citado (sin enlace directo): *Chain-of-Thought Compression Dialects*, Frolov, Anatolii, 2026.
