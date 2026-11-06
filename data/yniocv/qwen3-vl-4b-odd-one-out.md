# yniocv/qwen3-vl-4b-odd-one-out

## Resumen

El modelo `yniocv/qwen3-vl-4b-odd-one-out` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`, desarrollado por el usuario yniocv. Su proposito es ensenar al modelo base a resolver puzles visuales generados del tipo "cual de las siguientes figuras no pertenece al grupo?". Cada imagen contiene cinco paneles etiquetados de A a E con poligonos en blanco y negro, y el modelo debe transcribir cada panel, identificar el que rompe una regla oculta y enunciar dicha regla.

El adaptador no es un modelo autonomo: requiere cargarse sobre el modelo base Qwen3-VL-4B-Instruct (4.000 millones de parametros, arquitectura vision-lenguaje) en bfloat16. El conjunto de reglas ocultas es fijo (7 reglas de conteo y relaciones), y el entrenamiento se realizo sobre 1.600 puzles generados sinteticamente. Es relevante como ejemplo de ajuste fino eficiente (QLoRA) para razonamiento visual estructurado con salida de formato estricto.

La licencia es Apache 2.0, heredada del modelo base. El repositorio ocupa 0,1 GB (solo los pesos del adaptador), y el modelo fue creado y actualizado a finales de octubre de 2026. No se dispone de informacion sobre idiomas soportados mas alla del ingles del prompt de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 con computo bfloat16; inferencia en bfloat16 |
| Idiomas soportados | No disponible (prompt de entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre el modelo base Qwen3-VL-4B-Instruct. El modelo base se carga en 4 bits NF4 con computo en bfloat16, y se entrenan las proyecciones de atencion y MLP del modelo de lenguaje (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Los parametros LoRA son r=16, alpha=32 y dropout=0,05. El prompt y el padding se enmascaran en la perdida, de modo que solo se entrena la respuesta objetivo.

Los datos de entrenamiento consisten en 1.600 puzles generados (mitad en cada uno de los dos estilos de dibujo) del dataset `yniocv/odd-one-out-polygons`. Cada puzle y su respuesta objetivo se generan por codigo a partir de la clave de respuestas, garantizando objetivos exactos. Cada objetivo lista los paneles, prueba las 7 reglas en cada panel en una seccion `Checks:` y termina con la respuesta y la regla. El entrenamiento se realizo durante 3 epocas con tasa de aprendizaje 2e-4, tamano de lote 4 con 4 pasos de acumulacion de gradientes (300 pasos), semilla 42, en una A100 de Google Colab durante 37 minutos, con una perdida media de entrenamiento de 0,040. Las versiones usadas fueron torch 2.11.0, transformers 5.20.2 y peft 0.21.2.

## Capacidades

- Razonamiento visual estructurado: transcribe cada uno de los cinco paneles de una imagen de puzle, listando cada forma de mayor a menor con su color y numero de lados.
- Identificacion de la figura que no pertenece al grupo y enunciado de la regla que siguen las otras cuatro.
- Salida con formato estricto y predecible (secciones `Panels:`, `Answer:` y `Rule:`).
- Procesamiento de imagenes con multiples paneles y poligonos en blanco y negro.
- Razonamiento sobre un conjunto fijo de 7 reglas de conteo y relaciones.
- Capacidades heredadas del modelo base Qwen3-VL-4B-Instruct (no evaluadas en este adaptador): conversacion image-text-to-text, comprension visual general.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en este adaptador.

## Casos de uso

- Evaluacion de razonamiento visual en investigacion: el adaptador sirve como banco de pruebas controlado para medir la capacidad de un modelo vision-lenguaje de inducir reglas a partir de ejemplos visuales, con un conjunto fijo de 7 reglas y metricas reproducibles.
- Generacion de datos sinteticos de entrenamiento: el pipeline de generacion de puzles del repositorio puede reutilizarse para crear datasets de razonamiento visual con objetivos exactos y verificables por codigo.
- Pruebas de robustez ante estilos visuales: los conjuntos `eval_main`, `eval_robust` y `eval_unseen` permiten estudiar como degrada el rendimiento al cambiar el estilo de dibujo (lados, grosor de trazo, tamano de panel, reformulacion del prompt).
- Demostracion de ajuste fino eficiente: ejemplo documentado de QLoRA sobre un modelo de 4.000 millones con un coste de 37 minutos en una A100, util como referencia para equipos que quieran adaptar modelos vision-lenguaje a tareas acotadas.
- Analisis de errores de percepcion frente a razonamiento: el modelo card desglosa que los fallos provienen de lecturas erroneas de las formas (sobre todo conteo de lados) y no del razonamiento sobre reglas, lo que permite aislar la componente perceptiva.
- Prototipado de asistentes de resolucion de puzles visuales: con el prompt de entrenamiento y decodificacion greedy, puede integrarse en una demo o interfaz que resuelva puzles de poligonos del generador.
- Verificacion de adherencia a formato en produccion: util para estudiar tecnicas de enmascaramiento de perdida y formato estricto en modelos pequenos de vision-lenguaje.

## Benchmarks y rendimiento

Resultados de adherencia a especificacion sobre 100 puzles por conjunto, con intervalos de Wilson al 95%. Una respuesta se considera correcta solo si sigue el formato exacto, nombra el panel de la clave y enuncia la regla de la clave.

| Modelo | `eval_main` | `eval_robust` | `eval_unseen` |
|---|---|---|---|
| Modelo base (sin entrenar) | 0% (0%-4%) | 4% (2%-10%) | 3% (1%-8%) |
| Adaptador v1 (un estilo de dibujo) | 86% (78%-91%) | 29% (21%-39%) | 40% (31%-50%) |
| **Este adaptador (v2)** | **82% (73%-88%)** | **68% (58%-76%)** | **51% (41%-61%)** |

- `eval_main` usa el primer estilo de entrenamiento; `eval_robust` usa el segundo estilo (formas de 9 lados, contornos mas gruesos, paneles mas pequenos, prompt reformulado); `eval_unseen` usa un estilo que no aparece en ningun conjunto de entrenamiento.
- Cuando el adaptador lee los cinco paneles exactamente, acierta 153 de 154 respuestas en los tres conjuntos; los fallos provienen de formas mal leidas (sobre todo lados mal contados), no del razonamiento sobre reglas.
- Ningun conjunto alcanza el umbral de fiabilidad del 95% fijado por el proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 16 GB, ya que el adaptador se carga sobre el modelo base en bfloat16 (segun el model card).
- GPU recomendadas: L4 o A100 (citadas explicitamente por el autor); cualquier GPU con soporte nativo de bfloat16.
- Cabe en GPU de consumo: no confirmado para GPUs de 16 GB o menos; se requiere una GPU con bfloat16 nativo y al menos 16 GB de memoria.
- Opciones de despliegue: `transformers` con `PeftModel` y `AutoModelForImageTextToText` (metodo documentado); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificacion recomendada es greedy (`do_sample=False`) con `max_new_tokens=1024`.
- Entrenamiento: una A100 en Google Colab, 37 minutos, con QLoRA en 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yniocv/qwen3-vl-4b-odd-one-out` (este) | Adaptador sobre 4.000 M | No disponible | 82% / 68% / 51% en main/robust/unseen | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4.000 M | No disponible | 0% / 4% / 3% en main/robust/unseen | Apache 2.0 | Hugging Face |
| Adaptador v1 (mismo autor) | Adaptador sobre 4.000 M | No disponible | 86% / 29% / 40% en main/robust/unseen | No disponible | Hugging Face |

No se dispone de informacion sobre otros adaptadores o modelos comparables en la misma tarea de puzles de poligonos. Los datos de la comparativa proceden exclusivamente del model card del autor.

## Limitaciones y advertencias

- Los estilos de dibujo no vistos siguen siendo dificiles: en `eval_unseen` el adaptador lee exactamente los cinco paneles en solo 29 de 100 respuestas.
- El conjunto de reglas es fijo: todos los puzles usan las mismas 7 reglas y el adaptador no se ha probado con reglas fuera de ese conjunto, por lo que no demuestra induccion de reglas abierta.
- Solo puzles generados: se entrena y evalua con los puzles de poligonos del generador, no con otros formatos de puzle ni con preguntas de tests reales.
- Ningun conjunto alcanza el umbral de fiabilidad del 95% del proyecto, por lo que no es adecuado para uso en produccion sin supervision.
- Los fallos se concentran en la percepcion (conteo de lados) mas que en el razonamiento sobre reglas.
- Requiere el prompt de entrenamiento exacto y decodificacion greedy; no se documenta comportamiento con otros prompts o muestreo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion fuera de la tarea ni idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-VL-4B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yniocv/qwen3-vl-4b-odd-one-out
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/yniocv/odd-one-out-polygons
- Codigo, evaluaciones y articulo: https://labs.gauntletai.com/chrisvo/odd-one-out-finetune
- Video de demostracion: https://youtu.be/meHAU_aEfDE
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
