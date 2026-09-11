# ThomsenDrake/ish-est-0.8b

## Resumen

Ish Est 0.8b (`ThomsenDrake/ish-est-0.8b`) es un modelo visual-lenguaje (image-text-to-text) derivado de Qwen/Qwen3.5-0.8B mediante un fine-tune local llevado a cabo por el usuario ThomsenDrake. Su proposito es acotado y muy concreto: estimar calorias, proteinas y masa de alimentos a partir de imagenes, ejecutandose en local dentro de la aplicacion Ish para iPhone. No es un modelo de proposito general, sino un componente especializado de vision + regresion numerica orientado a inferencia on-device sobre el framework MLX de Apple.

El modelo parte del checkpoint base `mlx-community/Qwen3.5-0.8B-MLX-bf16` y se ha entrenado sobre Nutrition5k (familia overhead RGB / depth-split), con adaptadores LoRA fusionados en el backbone y un conjunto de cabezas de nutricion de coste O(1) separadas (`ish_est_heads.safetensors`). Los pesos MLX se publican cuantizados a 4 bits, lo que reduce el repositorio a 0,6 GB y permite su despliegue en hardware de consumo e incluso en dispositivo movil.

Su relevancia radica en dos factores: por un lado, demuestra un flujo de trabajo reproducible de fine-tune multimodal en MLX con cabezas de regresion anadidas; por otro, publica cifras de evaluacion explicitas (MAE de 81,0 kcal y 5,7 g de proteina sobre un conjunto retenido de 507 muestras) junto con bandas de honestidad declaradas por el autor, algo poco frecuente en modelos de este tamano. Con 852.985.920 parametros totales y licencia Apache 2.0, es un candidato directo para integracion edge en aplicaciones de nutricion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.5-0.8B, con LoRA fusionado en el backbone y cabezas de regresion O(1) anadidas |
| Parametros totales | 852.985.920 (~0,85 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (pesos MLX cuantizados); base de partida en bf16 (`mlx-community/Qwen3.5-0.8B-MLX-bf16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas `ish_est_heads.safetensors` y `ish_est_heads_config.json` para las cabezas; no se publican pesos GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal heredado de Qwen3.5-0.8B, adaptado mediante un fine-tune supervisado sobre Nutrition5k (familia overhead RGB / depth-split, Thames et al., CVPR 2021). El autor indica que se aplico LoRA y que los adaptadores se fusionaron posteriormente en el backbone, de modo que el checkpoint distribuido no requiere cargar adaptadores por separado. Sobre la representacion del backbone se anaden cabezas de nutricion de coste O(1) almacenadas aparte en `ish_est_heads.safetensors`, con su propia configuracion en `ish_est_heads_config.json`.

Un detalle tecnico relevante es el esquema de normalizacion de las cabezas: emiten valores normalizados en el rango O(1) y la desnormalizacion se realiza multiplicando por una escala (`pred * scale`) con `cal=100`, `pro=10` y `mass=100`. Esto implica que cualquier integracion debe respetar esa convencion para interpretar correctamente las salidas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de Nutrition5k, la receta de RLHF/DPO ni si se emplearon tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (pipeline declarado como conversational) en el contexto de la aplicacion Ish.
- Entrada imagen + texto (image-text-to-text): razonamiento visual sobre fotografias de comida.
- Estimacion numerica de calorias, proteinas y masa a traves de las cabezas dedicadas, con desnormalizacion mediante escalas fijas.
- Clasificacion y rechazo de contenido no alimentario: el autor reporta una puerta de rechazo con 3/3 aciertos en un smoke test de Vision classify sobre imagenes que no son comida.
- Capacidad de emitir bandas de honestidad ("honesty bands") en el resultado hablado de la app, con semianchura minima de aproximadamente 151 kcal / 21 g.
- Ejecucion on-device sobre MLX, sin dependencia de servidor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no documenta idiomas soportados.
- Otras capacidades especiales (thinking mode, audio, video): no disponibles.

## Casos de uso

- Registro dietetico por fotografia en aplicacion movil: el modelo recibe una imagen de un plato y devuelve estimaciones de calorias, proteinas y masa mediante las cabezas de nutricion, lo que permite al usuario anotar una comida sin introducir datos manualmente. Es adecuado porque esta cuantizado a 4 bits y cabe en el repositorio de 0,6 GB, pensado explicitamente para ejecucion on-device.
- Diario nutricional offline con privacidad: al ejecutarse sobre MLX en el propio dispositivo, las fotografias de alimentos no salen del terminal, lo que simplifica el cumplimiento de normativas de proteccion de datos en aplicaciones de salud.
- Triage de imagenes no alimentarias: la puerta de rechazo (3/3 en el smoke test publicado) permite descartar capturas que no contienen comida antes de invocar las cabezas de regresion, evitando estimaciones sin sentido y ahorrando computo.
- Asistente conversacional de nutricion: la naturaleza conversational del checkpoint permite mantener un dialogo multi-turno en el que el usuario corrige o matiza la estimacion (por ejemplo, ajustando la racion), siempre que la longitud de contexto del modelo base sea suficiente para el historial.
- Investigacion y prototipado en estimacion de calorias: el modelo sirve como punto de partida reproducible para experimentar con fine-tunes de Qwen3.5-0.8B sobre Nutrition5k y para comparar arquitecturas de cabezas de regresion frente al backbone completo.
- Integracion en aplicaciones de fitness o salud: las bandas de honestidad declaradas (semianchura de al menos ~151 kcal / ~21 g) permiten mostrar al usuario un rango en lugar de una cifra falsamente precisa, lo que reduce el riesgo de sobreconfianza en la estimacion.
- Generacion de datos sinteticos de entrenamiento: dado su tamano reducido y su coste de inferencia bajo, el modelo puede emplearse para preetiquetar grandes volumenes de imagenes de alimentos antes de una revision humana.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas de evaluacion del propio fine-tune sobre Nutrition5k. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Split | Cal MAE | Protein MAE |
|---|---|---|
| Retenido completo (507 muestras) | 81,0 kcal | 5,7 g |
| Locked-10 smoke (suelo de honestidad) | 151,3 kcal | 20,6 g |

Datos adicionales reportados: la puerta de rechazo obtiene 3/3 sobre imagenes no alimentarias en el smoke test de Vision classify. El autor advierte explicitamente de que las estimaciones puntuales no deben tratarse como exactas y que las bandas de honestidad de la aplicacion usan una semianchura minima de ~151 kcal / ~21 g, no un ±80 derivado del MAE del conjunto de 507.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,6 GB en cuantizacion de 4 bits, por lo que los pesos requieren del orden de 0,6-1 GB de memoria, a lo que hay que sumar activaciones, cache KV y el codificador visual. Estimacion orientativa: entre 1,5 y 3 GB en 4 bits para una ventana de contexto moderada (el dato exacto no esta disponible).
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o superior, una RTX 4060/4090 y practicamente cualquier GPU con 4 GB o mas pueden alojar el modelo cuantizado con holgura.
- GPU recomendadas para servidor: no se requieren aceleradores de gama alta; A100 o H100 estarian sobredimensionadas para este modelo 0,85B, salvo para servir muchas peticiones concurrentes.
- Despliegue en dispositivo: el formato nativo es MLX, disenado para Apple Silicon e iPhone, que es el escenario objetivo declarado por el autor.
- Opciones de despliegue: MLX (libreria declarada en el repositorio). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables directamente sin una conversion previa; el uso con vLLM o TGI requeriria asimismo convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Archivos adicionales necesarios en despliegue: ademas de `config.json`, `model*.safetensors` (+ indice si esta fragmentado) y los sidecars de tokenizer/processor, la aplicacion debe cargar `ish_est_heads.safetensors` y `ish_est_heads_config.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThomsenDrake/ish-est-0.8b | 852.985.920 | no disponible | MAE 81,0 kcal / 5,7 g proteina sobre 507 muestras retenidas | Apache 2.0 | safetensors MLX, 4-bit |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible | no disponible en la informacion proporcionada | safetensors |
| mlx-community/Qwen3.5-0.8B-MLX-bf16 (base de partida del fine-tune) | ~0,8B | no disponible | no disponible | no disponible en la informacion proporcionada | MLX bf16 |
| Trabajo de VLM de nutricion de Doses-AI (referencia citada como inspiracion de receta) | no disponible | no disponible | no disponible | no disponible | GGUF, segun el autor |

No se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada; la unica metrica publicada es la del propio Ish Est sobre Nutrition5k.

## Limitaciones y advertencias

- Precision limitada: un MAE de 81,0 kcal sobre el conjunto retenido de 507 muestras implica un error medio elevado para una sola comida; el propio autor pide no tratar las estimaciones puntuales como exactas.
- Bandas de honestidad obligatorias: en el flujo conversacional la semianchura minima es de ~151 kcal / ~21 g, muy superior al MAE del conjunto retenido; ignorar esta convencion daria una falsa sensacion de precision al usuario.
- Dominio muy restringido: el modelo esta entrenado especificamente sobre Nutrition5k (familia overhead RGB / depth-split). Es esperable un rendimiento degradado con angulos de camara, iluminacion o cocinas distintas a las de ese dataset.
- Riesgo de alucinacion: al ser un modelo de 0,85B con cabezas de regresion, puede producir estimaciones plausibles pero incorrectas, especialmente con platos compuestos, salsas o ingredientes ocultos.
- Sesgos conocidos: no documentados por el autor; el sesgo derivado del dataset Nutrition5k (composicion geografica y cultural de las comidas) no ha sido analizado en la informacion disponible.
- Idiomas: no se documenta ningun idioma soportado, ni siquiera el ingles, por lo que no puede asumirse cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide valorar el soporte real de conversaciones multi-turno largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor exige conservar la tarjeta del modelo, el archivo `LICENSE` y el `NOTICE`, y no eliminar los avisos de copyright de las obras upstream (Qwen/Alibaba y Nutrition5k, este ultimo bajo CC BY 4.0).
- Caveat de atribucion: el autor aclara que este repositorio es un derivado independiente en MLX y no una conversion de safetensors de terceros no publicados.
- Validacion externa practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existen verificaciones comunitarias de las cifras publicadas.
- Limitacion funcional: es una variante multimodal especializada sin soporte documentado de tool calling ni de agentes, por lo que no deberia emplearse como sustituto de un LLM de proposito general.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a contenidos no pertinentes sobre el castillo de Himeji), de modo que no ha sido posible contrastar informacion externa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThomsenDrake/ish-est-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint base en MLX bf16 utilizado para el fine-tune: https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-bf16
- Dataset de entrenamiento, Nutrition5k (Thames et al., CVPR 2021, CC BY 4.0): paper y repositorio no enlazados en la informacion proporcionada
- Trabajo de VLM de nutricion de Doses-AI (citado como inspiracion de receta, publicacion GGUF): enlace no disponible
- Marco de ejecucion MLX: enlace no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos no guardan relacion con la consulta.
