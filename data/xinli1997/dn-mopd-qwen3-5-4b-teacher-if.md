# XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-if

## Resumen

DN-MOPD-Qwen3.5-4B-teacher-if es un ajuste fino de Qwen/Qwen3.5-4B publicado por el usuario XINLI1997 como parte del trabajo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (DN-MOPD). Se trata del experto en seguimiento de instrucciones (IF) de un conjunto de tres profesores del mismo tamano (matematicas, codigo e IF) que se emplean congelados para destilar conocimiento sobre estudiantes de 4B. El modelo no es un asistente generalista: es una pieza de infraestructura de investigacion, pensada para ser usada como profesor o como punto de comparacion en experimentos de destilacion on-policy.

El modelo parte del checkpoint base Qwen3.5-4B, descrito por Qwen como un modelo nativo vision-lenguaje, y se entrena con GRPO sobre prompts de seguimiento de instrucciones con recompensa verificable, sin termino KL ni de entropia. Cuenta con 4.539.265.536 parametros en bfloat16 (repo de 9,1 GB) y se publica bajo licencia Apache-2.0. La arquitectura es la del base, `Qwen3_5ForConditionalGeneration`, que combina torre de vision y decodificador de texto, si bien el entrenamiento y la evaluacion de este ajuste fueron exclusivamente de texto.

Su relevancia es metodologica: demuestra que un profesor especializado en IF mejora claramente su dominio (60,6 frente a 52,8 del estudiante inicial en la media IFEval/IFBench) a costa de degradar el rendimiento en matematicas (50,7 frente a 52,2). El checkpoint omite los 15 tensores de prediccion multi-token (`mtp.*`) del modelo base, por lo que no admite decodificacion especulativa basada en MTP. Es, en definitiva, un modelo para reproducir experimentos de destilacion multi-profesor, no para desplegar en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (`Qwen3_5ForConditionalGeneration`), derivado de Qwen3.5-4B; incluye torre de vision heredada del base |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo oficial de vLLM usa `max_model_len=32768` |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en bfloat16 (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles declarado); el resto de idiomas del base no fue evaluado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Hugging Face, bfloat16), exportados desde un checkpoint de entrenamiento FSDP; se omiten los tensores `mtp.*` |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-4B base: un transformer decoder con torre de vision integrada (pipeline `image-text-to-text`) y plantilla de chat con modo thinking activado por defecto. Sobre ese checkpoint se aplica un ajuste con GRPO, con recompensa verificable, sobre prompts de seguimiento de instrucciones, sin termino KL ni de entropia. El entrenamiento se realizo en bfloat16 durante 400 actualizaciones (las ejecuciones se limitaron a 400) con semilla 42.

Los hiperparametros concretos estan documentados: 128 prompts por rollout, 8 respuestas por prompt y 256 respuestas por paso de optimizador; muestreo dinamico que descarta grupos de prompts sin variacion de recompensa (como maximo 8 lotes de generacion por rollout). Longitudes de prompt de hasta 2.048 tokens y de respuesta de hasta 8.192 tokens, temperatura 1,0. Optimizador Adam con learning rate 1e-6 constante tras 10 actualizaciones de calentamiento, betas (0,9; 0,98), weight decay 0,1 y recorte de gradiente 1,0. Todo el recetario y los scripts de lanzamiento de cada fila de las tablas del paper estan en `recipes/qwen3.5/` del repositorio de codigo.

La innovacion relevante no esta en la arquitectura sino en el metodo: DN-MOPD normaliza por dominio la contribucion de varios profesores del mismo tamano durante la destilacion on-policy. Este checkpoint es el profesor de IF, y el propio paper senala que los beneficios dependen de la configuracion profesor-estudiante: en una comparacion previa con Qwen3-4B bajo otro montaje no se observo ganancia clara.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat no-thinking (`enable_thinking=False` obligatorio, ya que la plantilla del base activa thinking por defecto).
- Seguimiento de instrucciones estrictas: es su dominio de especializacion, con 60,6 % de media en IFEval/IFBench.
- Razonamiento matematico basico y resolucion de problemas tipo AIME (50,7 % de media en AIME25/AIME26), aunque por debajo del modelo inicial.
- Generacion de codigo (38,1 % de media en LiveCodeBench v5/v6), sin mejora respecto al estudiante inicial.
- Entrada de imagenes soportada por arquitectura (`AutoModelForImageTextToText`), heredada del base, aunque no fue entrenada ni evaluada con multimodalidad.
- Tool calling / function calling: no documentado ni evaluado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multilingues: solo se declara ingles; el resto de idiomas del base no se evaluo.
- Modo thinking: no evaluado; el modelo fue entrenado y evaluado en formato no-thinking.
- Decodificacion especulativa basada en MTP: no disponible (los tensores `mtp.*` se omiten en la exportacion).

## Casos de uso

- Profesor congelado en experimentos de destilacion multi-profesor: es su proposito original; se empareja con los profesores de matematicas y codigo del mismo desarrollador para entrenar estudiantes de 4B con DN-MOPD.
- Reproduccion de resultados del paper: con los scripts de `recipes/qwen3.5/` y semilla 42 permite replicar las filas de las tablas del articulo, incluyendo la configuracion de evaluacion (temperatura 1,0, top-p 1,0, hasta 16.384 tokens nuevos).
- Linea base de especializacion en IF: util para medir cuanto gana un estudiante al destilar de un experto de dominio frente a un modelo generalista de igual tamano.
- Evaluacion de seguimiento de instrucciones: sirve como referencia en IFEval e IFBench con metrica de precision estricta de prompt y avg@16.
- Estudios de olvido catastrofico: precisamente porque pierde 1,5 puntos en matematicas respecto al inicial, es un caso de estudio controlado de especializacion frente a degradacion en otros dominios.
- Generacion de respuestas instruccionales en ingles en pipelines internos: con vLLM 0.18.0 o `transformers>=5` se puede servir para tareas de redaccion guiada por instrucciones, asumiendo que no hay garantias de seguridad ni de multilingue.
- Analisis de dinamica de RL: los 400 pasos con GRPO y muestreo dinamico permiten estudiar curvas de recompensa y colapso de grupos sin variacion de recompensa.

## Benchmarks y rendimiento

Datos de la tabla 2 del paper para Qwen3.5-4B. Cada dominio promedia dos tareas: AIME25/AIME26, LiveCodeBench v5/v6 e IFEval/IFBench. Porcentajes, semilla de entrenamiento 42, limite de evaluacion de 16.384 tokens, plantilla no-thinking, temperatura 1,0, top-p 1,0 y semilla de generacion 42. AIME: avg@64; LiveCodeBench (167/175 problemas disjuntos): avg@6; IFEval/IFBench: precision estricta de prompt, avg@16. Total: media de las seis tareas.

| Modelo | Matematicas | Codigo | IF | Total |
|---|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-4B-teacher-if (experto IF) | 50,7 | 38,1 | 60,6 | 49,8 |
| Estudiante inicial (Qwen3.5-4B) | 52,2 | 38,1 | 52,8 | 47,7 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterias estandar, ni comparativas numericas con modelos ajenos al paper.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan aproximadamente 9,1 GB (el repo completo pesa 9,1 GB), por lo que se necesitan del orden de 10-12 GB de VRAM sumando cache KV y activaciones, dependiendo de la longitud de contexto.
- GPU recomendadas: para servicio en produccion, A100 40/80 GB o H100; para uso en investigacion con contexto largo, GPU de 24 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 en bfloat16. Tambien es viable en GPU de 16 GB siempre que se reduzca el limite de contexto. No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), por lo que no se puede reducir el consumo por esa via sin cuantizar uno mismo.
- Opciones de despliegue: vLLM (la version usada en el paper es la 0.18.0), con el ejemplo oficial `LLM(model=..., max_model_len=32768)`; y `transformers>=5` con `AutoModelForImageTextToText` (entorno de entrenamiento del paper: 5.12.1). Ollama, llama.cpp o TGI no estan documentados para este checkpoint y requeririan conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota importante: la exportacion omite los tensores `mtp.*`, de modo que la decodificacion especulativa basada en prediccion multi-token no funciona con este checkpoint; la decodificacion ordinaria no se ve afectada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-4B-teacher-if | 4,54B | no disponible (ejemplo con `max_model_len=32768`) | Matematicas 50,7 / Codigo 38,1 / IF 60,6 / Total 49,8 | Apache-2.0 | Hugging Face, 11 descargas, 0 likes |
| Qwen3.5-4B (estudiante inicial y base) | 4B (clase) | no disponible | Matematicas 52,2 / Codigo 38,1 / IF 52,8 / Total 47,7 | Apache-2.0 | Hugging Face, checkpoint base |
| DN-MOPD-Qwen3.5-4B-baseline-label | 4B (clase) | no disponible | no disponible | no disponible | Hugging Face; linea base de destilacion multi-profesor con enrutado por etiqueta |
| DN-MOPD-Qwen3.5-9B-teacher-if | 9B (clase) | no disponible | no disponible | no disponible | Hugging Face; version mayor del mismo profesor IF |

Los cuatro modelos pertenecen al mismo linaje y al mismo paper, por lo que no constituyen alternativas independientes: la comparacion relevante frente a terceros seria contra el Qwen3.5-4B base y sus derivados. No hay datos publicados en la informacion disponible para comparar con modelos de otros desarrolladores de tamano similar (por ejemplo, variantes de 4B de otras familias), ya que el paper solo reporta sus propias configuraciones.

## Limitaciones y advertencias

- Es un especialista de un unico dominio: rinde peor que el modelo inicial en matematicas (50,7 frente a 52,2), lo que ilustra el coste de la especializacion.
- Entrenado con respuestas de como maximo 8.192 tokens; no se debe asumir buen comportamiento mas alla de esa longitud generada.
- Evaluado unicamente en modo no-thinking. El modo thinking no fue evaluado y su comportamiento es desconocido.
- Aunque la arquitectura admite entradas de imagen (la torre de vision se hereda del base), el entrenamiento y la evaluacion fueron solo de texto: no hay garantias de calidad multimodal.
- Solo se declara ingles. Otros idiomas del base no fueron evaluados y pueden degradarse.
- El comportamiento de seguridad no fue evaluado mas alla del modelo base; no hay alineamiento de seguridad especifico en este ajuste.
- Riesgo de alucinacion: inherente al modelo base, no mitigado ni medido en este ajuste; es especialmente relevante en un modelo entrenado con recompensa verificable en un solo dominio acotado.
- Los tensores `mtp.*` se omiten en la exportacion, por lo que no se puede usar decodificacion especulativa basada en prediccion multi-token.
- Licencia Apache-2.0, identica a la del base: permite uso comercial, pero el autor no ofrece garantias y el modelo esta pensado como artefacto de investigacion, no como producto.
- Adopcion muy baja (11 descargas, 0 likes) y publicacion reciente, sin validacion independiente conocida.
- El propio paper advierte que los beneficios de DN-MOPD dependen de la configuracion profesor-estudiante: en una comparacion previa con Qwen3-4B bajo otro montaje no se encontro ganancia clara.
- La evaluacion con semilla de generacion y de entrenamiento fijas (42) puede no reflejar la varianza real del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-if
- Paper (arXiv:2609.35347): https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD/
- Codigo: https://github.com/LiXin97/DN-MOPD
- Recetario para Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor IF de 9B: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-9B-teacher-if
- Linea base con enrutado por etiqueta: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-4B-baseline-label
- Profesor de matematicas (referencia en FriendliAI): https://friendli.ai/models/XINLI1997/DN-MOPD-Qwen3.5-4B-teacher-math
- Anuncio de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
