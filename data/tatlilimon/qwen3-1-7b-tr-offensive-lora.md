# tatlilimon/qwen3-1.7b-tr-offensive-lora

## Resumen

`tatlilimon/qwen3-1.7b-tr-offensive-lora` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-1.7B` disenado para una tarea concreta: clasificar si un tuit en turco es ofensivo. El adaptador responde `evet` (si) o `hayir` (no) a una pregunta fija en turco sobre el caracter ofensivo del texto. Lo desarrolla el usuario tatlilimon y se entrena con la herramienta Halo sobre el corpus OffensEval-TR 2020 (29.986 tuits de entrenamiento, 19,3% ofensivos).

La relevancia del modelo reside en su comparacion controlada contra alternativas: el Qwen3-1.7B sin adaptar (zero-shot) obtiene un Macro-F1 de 0.389 en el test oficial, mientras que el adaptador alcanza 0.788, superando tambien a una linea base clasica de TF-IDF con regresion logistica (0.708). Con umbral ajustado en validacion, la ventaja sobre TF-IDF se reduce (0.792 frente a 0.770) y los intervalos se solapan.

No es un modelo de proposito general: es un adaptador de tarea unica, de 17,4 millones de parametros entrenables (1,00% del modelo base), que hereda la arquitectura, el contexto y las capacidades del Qwen3-1.7B subyacente pero cuya utilidad practica esta acotada a la deteccion de lenguaje ofensivo en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-1.7B |
| Parametros totales | 17.432.576 parametros entrenables en el adaptador (1,00% del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-1.7B, no especificada) |
| Tipos de cuantizacion | no disponible (el autor reporta inferencia en fp32, ~8 GB de memoria) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0.05 aplicado sobre todas las proyecciones de atencion y MLP del Qwen3-1.7B. El entrenamiento se realizo con Halo 1.3.0rc1 mediante `halo launch sft` sobre una GPU H100 solicitada a traves de Modal. Se usaron 2 epocas, 908 pasos, learning rate 1e-4 con decaimiento coseno y 5% de warmup, semilla 42; el bucle de entrenamiento duro 293 segundos. No hubo busqueda de hiperparametros, y el autor reporta que entrenar dos veces desde cero produce el mismo archivo de adaptador byte a byte (SHA-256 de `adapter_model.safetensors`: `7f75aeeeba3e559318d102f259c42c049d79a4bc4193f4f0eda1ae29daad7609`).

Los datos provienen de OffensEval-TR 2020 (Coltekin, 2020), leidos desde el dataset `stefan-it/offenseval2020_tr`: 29.986 tuits de entrenamiento con un 19,3% de ejemplos ofensivos. Las menciones de usuario se sustituyen por `@USER` en el dataset. El prompt de entrenamiento es fijo y debe reproducirse exactamente en inferencia, con `enable_thinking=False` obligatorio (el modelo base Qwen3 incorpora modo de razonamiento que aqui debe desactivarse). La tarea se formula como generacion de una unica palabra (`evet`/`hayir`) con `max_new_tokens=4` y decodificacion greedy.

## Capacidades

- Clasificacion binaria de lenguaje ofensivo en tuits turcos: responde `evet` o `hayir` a la pregunta fija de si el texto es ofensivo.
- Generacion de texto restringida a dos respuestas de una palabra; no se documenta uso para generacion libre.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso; de hecho, `enable_thinking=False` es requisito.
- Capacidad multilingue limitada al turco en la practica (el adaptador solo se entrena y evalua en turco).
- Hereda del Qwen3-1.7B las capacidades del modelo base, pero el adaptador no ha sido evaluado en ellas.

## Casos de uso

- Moderacion de comentarios en turco en foros o redes: el adaptador puede prefiltrar tuits y marcar candidatos ofensivos para revision humana, con precision 0.750 al umbral por defecto.
- Triaje en colas de moderacion: al alcanzar recall 0.578, se usaria como primera capa que reduce el volumen a revisar, aceptando que se escapan aproximadamente cuatro de cada diez tuits ofensivos.
- Investigacion en procesamiento de lenguaje turco: sirve como referencia reproducible (codigo, config de Halo, log de entrenamiento y ficheros de puntuaciones publicados) para comparar metodos de deteccion de odio.
- Deteccion de insultos sin profanidad explicita: segun el autor, el adaptador captura parte de los insultos sin tacos explicitos, aunque con limitaciones.
- Clasificacion por lotes en pipelines de analisis de redes sociales: el modelo en fp32 ocupa unos 8 GB, lo que permite ejecutarlo en una GPU unica para procesar lotes de tuits.
- Linea base interna para equipos que construyen clasificadores de toxicidad en turco: el adaptador y sus cifras sirven como punto de partida frente a TF-IDF y modelos zero-shot.

## Benchmarks y rendimiento

Test oficial de OffensEval-TR 2020 (3.528 tuits, 20,3% ofensivos). Macro-F1 es la metrica oficial; precision y recall son de la clase ofensiva. Intervalos de confianza por bootstrap.

| Sistema | Macro-F1 [IC 95%] | Accuracy | Precision | Recall | ROC-AUC | Macro-F1 con umbral ajustado |
|---|---:|---:|---:|---:|---:|---:|
| Constante "no ofensivo" | 0.444 [0.439, 0.448] | 0.797 | 0.000 | 0.000 | n/a | n/a |
| TF-IDF char n-grams + regresion logistica | 0.708 [0.688, 0.730] | 0.859 | 0.898 | 0.345 | 0.873 | 0.770 [0.752, 0.787] |
| Qwen3-1.7B zero-shot (mejor de tres prompts) | 0.389 [0.373, 0.404] | 0.389 | 0.240 | 0.929 | 0.733 | 0.640 [0.621, 0.658] |
| Qwen3-1.7B + este adaptador | 0.788 [0.770, 0.806] | 0.875 | 0.750 | 0.578 | 0.897 | 0.792 [0.775, 0.807] |

Contexto de la competicion: 46 equipos enviaron a esta pista de SemEval-2020 Task 12; el mejor sistema obtuvo 0.8258 y la linea base mayoritaria 0.4435 (Zampieri et al., 2020, Tabla 11). El 0.7885 del adaptador se situa entre el 6.o (0.7933) y el 7.o (0.7859) envio. Con umbral ajustado en validacion, la ventaja sobre TF-IDF es pequena (0.792 frente a 0.770) y los intervalos se solapan.

## Requisitos de hardware

- Memoria: en fp32 el modelo ocupa aproximadamente 8 GB (dato del autor); otras precisiones no fueron medidas para este adaptador.
- GPU recomendadas: el entrenamiento se hizo en una H100; para inferencia, una GPU con al menos 8 GB de VRAM en fp32 es suficiente segun el dato del autor.
- GPU de consumo: cabe en tarjetas consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti), aunque el autor no documenta pruebas en ellas.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con `apply_chat_template` y `enable_thinking=False`. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles; solo se reporta que el entrenamiento (908 pasos) duro 293 segundos en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (OffensEval-TR test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B + este adaptador | 1,7B base + 17,4M adaptador | no disponible | 0.788 (0.792 con umbral ajustado) | Apache-2.0 | Hugging Face |
| Qwen3-1.7B zero-shot | 1,7B | no disponible | 0.389 (0.640 con umbral ajustado) | Apache-2.0 | Hugging Face |
| TF-IDF char n-grams + regresion logistica | no aplica | no aplica | 0.708 (0.770 con umbral ajustado) | no disponible | linea base del paper |

No se dispone de datos de otros adaptadores o modelos especificos para deteccion de ofensas en turco en la informacion proporcionada.

## Limitaciones y advertencias

- Recall bajo: al umbral por defecto, el adaptador se pierde cuatro de cada diez tuits ofensivos (recall 0.578 con precision 0.750).
- Patrones de error: segun el autor, los fallos por omision son sobre todo insultos sin profanidad explicita, sarcasmo y acusaciones politicas; las falsas alarmas son mayoritariamente discusiones politicas o religiosas acaloradas.
- Ventaja limitada frente a TF-IDF: solo supera claramente a la linea base en el umbral por defecto; con umbral ajustado la diferencia es pequena y los intervalos se solapan.
- Una sola semilla y sin busqueda de hiperparametros; los intervalos solo describen el ruido de muestreo del test.
- Puntuaciones medidas en bf16 en GPU; otras precisiones no se midieron y los tuits cerca del umbral pueden cambiar de etiqueta.
- Ruido de etiquetas: la mayoria de tuits del dataset fueron anotados por un unico voluntario; en la muestra doblemente anotada el kappa de Cohen fue 0.761 (Zampieri et al., 2020, seccion 3). El adaptador hereda el ruido, los temas y los sesgos de esos tuits.
- No es un sistema de moderacion autonomo: el propio autor advierte que no debe usarse como tal.
- Prompt fijo: debe coincidir exactamente con el de entrenamiento y requiere `enable_thinking=False`; desviarse puede degradar la respuesta.
- Licencia Apache-2.0 en el adaptador (licencia del modelo base); los datos de entrenamiento son CC BY 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tatlilimon/qwen3-1.7b-tr-offensive-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor (codigo, config de Halo, log y puntuaciones): https://github.com/tatlilimon/halo-qwen3-tr-offensive
- Halo: https://github.com/whitecircle/halo
- Dataset: https://huggingface.co/datasets/stefan-it/offenseval2020_tr
- Paper de OffensEval-TR (Coltekin, 2020, LREC): https://arxiv.org/abs/2006.07235
- SemEval-2020 Task 12 (Zampieri et al., 2020): https://arxiv.org/abs/2006.07235
