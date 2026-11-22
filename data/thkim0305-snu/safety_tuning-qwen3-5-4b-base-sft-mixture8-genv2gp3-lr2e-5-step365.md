# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step365

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step365` es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario `thkim0305-SNU`. El objetivo declarado es el alineamiento de seguridad: el modelo se entrena sobre trayectorias generadas por un profesor de mayor tamano (`Qwen/Qwen3.8-27B`) para que el estudiante de 4B aprenda a razonar, responder y emitir llamadas a herramientas siguiendo patrones seguros, incluyendo respuestas benignas ante prompts adversarios y rechazos adecuados ante peticiones daninas.

Tecnicamente es un transformer multimodal (etiqueta `qwen3_5`, pipeline `image-text-to-text`) con 4.659.865.088 parametros totales en bf16. El checkpoint corresponde a la actualizacion de optimizador 365 de 730 (1 de 2 epocas), por lo que se trata de un snapshot de un entrenamiento aun en curso, no de un modelo final. Solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que `Qwen3.5-4B-Base`.

Su relevancia es doble: por un lado, documenta una receta reproducible de SFT de seguridad con destilacion desde un profesor de 27B y un conjunto de datos mixto de ocho fuentes; por otro, permite estudiar la evolucion del alineamiento a lo largo del entrenamiento gracias a los ocho checkpoints intermedios publicados en la misma ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (snapshot `1001bb4d826a`), un transformer multimodal de la familia Qwen3.5 con proyecciones GDN, torre de vision y cabeza MTP (multi-token prediction). El ajuste es de parametros completos (full-parameter SFT) exclusivamente sobre el modelo de lenguaje: la torre de vision y la cabeza MTP se copian intactas desde el base durante la exportacion, y los dtypes se alinean con el indice del modelo original. El entrenamiento se ejecuto con Slime + Megatron-LM en bf16 con estado del optimizador en fp32, sobre 2x NVIDIA RTX PRO 6000 Blackwell con paralelismo tensorial 2.

La receta usa el template de chat nativo del base con system prompt "You are a helpful assistant." y modo thinking activado, sin Model Spec. La perdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. El conjunto "mixture-8" contiene 46.626 trayectorias derivadas de 11.757 prompts, destiladas de `Qwen/Qwen3.8-27B` (cuatro respuestas muestreadas por prompt, conservando todas las validas), con fuentes como `agentalign_harmful` (7.919), `wildjailbreak_benign` (7.983), `difficult_advice` (7.905), `agentalign_benign` (7.734), `star1_gp3` (3.998), `magicoder` (3.838), `star_benign_v2` (3.651) y `codesafetybench` (3.598). Se entrenaron 2 epocas de 365 actualizaciones con 128 secuencias por paso, learning rate pico 2e-05 con warmup lineal del 10% y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], epsilon 1e-08, weight decay 0.1 y grad clip 1.0. Las trayectorias que excedian los 32.768 tokens se excluyeron completas, nunca se truncaron.

## Capacidades

- Generacion de texto conversacional multi-turno con modo thinking activable mediante `enable_thinking=True`.
- Razonamiento explicito: el modelo fue entrenado con perdida sobre la traza de razonamiento, no solo sobre la respuesta final.
- Llamadas a herramientas (tool calling / function calling): la perdida cubre explicitamente las llamadas a herramientas generadas por el profesor.
- Comportamiento orientado a agentes: parte del dataset proviene de `agentalign` (variantes harmful y benign), lo que entrena respuestas en escenarios de agente.
- Seguridad alineada: rechazo de peticiones daninas, respuestas benignas ante jailbreaks (`wildjailbreak_benign`) y manejo de consejo dificil (`difficult_advice`).
- Seguridad de codigo: entrenado con `codesafetybench` y `magicoder`, cubriendo generacion de codigo y comportamiento seguro en ese dominio.
- Capacidad multimodal heredada del base (torre de vision intacta), aunque no fue entrenada en este SFT.
- Capacidad de prediccion multi-token (cabeza MTP) heredada del base, sin entrenar.

## Casos de uso

- Estudio de dinamicas de alineamiento: al publicarse ocho checkpoints (actualizaciones 91, 183, 274, 365, 456, 548, 639 y 730), permite medir como evolucionan rechazo, utilidad y tasa de alucinacion a lo largo del SFT comparando evaluaciones en cada snapshot.
- Investigacion en destilacion de seguridad: sirve para analizar que se transfiere de un profesor de 27B a un estudiante de 4B cuando se conservan cuatro muestras por prompt, y que se pierde en el proceso.
- Evaluacion de robustez ante jailbreaks: el modelo incorpora `wildjailbreak_benign` en su mezcla, lo que lo hace util como linea base para medir resistencia a prompts adversarios frente al base sin ajustar.
- Agentes con tool calling en entornos controlados: al haberse entrenado con perdida sobre llamadas a herramientas y datos de `agentalign`, puede emplearse en prototipos de agentes multi-paso donde se quiera comparar comportamiento seguro frente a utilidad.
- Generacion de codigo con criterios de seguridad: el uso de `codesafetybench` y `magicoder` lo hace adecuado para experimentos sobre sugerencias de codigo que eviten patrones vulnerables (inyeccion, manejo inseguro de secretos).
- Base para posteriores etapas de alineamiento: como checkpoint intermedio de SFT, es un punto de partida natural para DPO, RLHF o evaluaciones de seguridad antes de continuar el entrenamiento.
- Analisis de respuestas ante consejo sensible: la fuente `difficult_advice` permite estudiar como un modelo de 4B maneja peticiones de consejo ambiguas o potencialmente daninas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere del orden de 12-16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: no disponible (no se publican variantes cuantizadas); una conversion a 8 bits rondaria los 4,7 GB de pesos.
- GPU recomendadas: el autor entreno con 2x NVIDIA RTX PRO 6000 Blackwell en tensor parallel 2; para inferencia cabe en una sola GPU de 24 GB (RTX 4090, L4 24GB, A10G) y con holgura en A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en tarjetas de 16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `dtype="bfloat16"` (metodo documentado); vLLM, TGI, llama.cpp u Ollama no estan verificados en la informacion disponible, y llama.cpp/Ollama requeririan una conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step365 | 4.659.865.088 | 32.768 (entrenamiento) | Apache 2.0 | Checkpoint intermedio (365/730 updates) |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Modelo base completo |
| Qwen/Qwen3.8-27B (profesor) | 27B (segun denominacion) | no disponible en la informacion | no disponible en la informacion | Profesor usado para destilacion |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio: corresponde a 1 de 2 epocas (365 de 730 actualizaciones). No debe tratarse como modelo final ni desplegarse en produccion sin una evaluacion propia.
- Entrenamiento en curso: el autor indica explicitamente que el entrenamiento sigue en progreso; el comportamiento puede cambiar sustancialmente en los checkpoints posteriores.
- Solo se entreno el modelo de lenguaje: la torre de vision y la cabeza MTP conservan los pesos del base, por lo que las capacidades multimodales no han sido alineadas ni evaluadas en este checkpoint.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; al ser un SFT sobre trayectorias de un profesor, puede heredar errores y sesgos del profesor `Qwen3.8-27B`.
- Sesgos: no se documenta ningun analisis de sesgos; el dataset incluye fuentes de seguridad y jailbreaks, lo que puede inducir rechazos excesivos (over-refusal) en prompts benignos.
- Idiomas: no se declaran idiomas soportados; el dataset parece centrado en datos en ingles (nombres de fuentes como `wildjailbreak_benign` o `difficult_advice`), por lo que el rendimiento en castellano no esta verificado.
- Contexto limitado a 32.768 tokens en entrenamiento; las trayectorias mas largas se descartaron, lo que puede dejar huecos de cobertura en tareas de contexto muy largo.
- Licencia Apache 2.0 permite uso comercial, pero hereda las condiciones del modelo base `Qwen3.5-4B-Base`; conviene revisar la licencia del base antes de un despliegue comercial.
- Sin datos de benchmarks, cuantizaciones publicadas ni metricas de latencia: cualquier decision de produccion requiere evaluacion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step365
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card como `Qwen/Qwen3.8-27B` @ `1d4bf0f2ff60`)
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
