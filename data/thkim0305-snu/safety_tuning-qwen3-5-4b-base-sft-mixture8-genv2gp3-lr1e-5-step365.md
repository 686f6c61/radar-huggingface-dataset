# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo es el alineamiento de seguridad: el modelo se entrena sobre trayectorias generadas por un profesor mayor (Qwen3.8-27B) para aprender a razonar y responder de forma segura ante prompts benignos y potencialmente daninos, incluyendo escenarios agénticos y de seguridad de codigo.

El checkpoint corresponde a la actualizacion de optimizador 365 de 730 (1 de 2 epocas), por lo que es una instantanea de un entrenamiento en curso y no un modelo final. Los pesos se exportan en bf16 con el formato Hugging Face `Qwen3_5ForConditionalGeneration`; solo se entreno el modelo de lenguaje, mientras que la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base.

Con 4.659.865.088 parametros totales y una ventana de contexto de 32.768 tokens, es relevante para quienes investigan alineamiento de seguridad, destilacion de trayectorias y evaluacion de modelos pequenos con capacidades multimodales heredadas del base. Su licencia Apache 2.0 facilita su uso y estudio, aunque al ser un checkpoint intermedio no debe considerarse listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; incluye torre de vision y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de vision y cabeza MTP (multi-token prediction). El ajuste fino es de parametros completos (full-parameter SFT) sobre trayectorias generadas por el profesor Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`), con cuatro respuestas muestreadas por prompt y conservando todas las validas. La perdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. Solo se entrena el modelo de lenguaje; la torre de vision y la cabeza MTP mantienen los pesos del base.

El conjunto de datos "mixture-8" comprende 46.626 trayectorias derivadas de 11.757 prompts, con fuentes como star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El entrenamiento usa Slime + Megatron-LM con computo bf16 y estado del optimizador en fp32, learning rate pico de 1e-5 con warmup lineal del 10 % y decaimiento coseno hasta 2e-6, Adam con betas [0.9, 0.95], eps 1e-8, weight decay 0.1 y grad clip 1.0. Se ejecuto en 1x NVIDIA B200, con 2 epocas de 365 actualizaciones de 128 secuencias y contexto de 32.768 tokens; las trayectorias mas largas se excluyeron completas, nunca se truncaron. El checkpoint se convirtio desde Megatron torch_dist (`iter_0000364`) con `safety_tuning.hf_export`, re-fusionando las proyecciones GDN y copiando los pesos de vision y MTP del base.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento (thinking) activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento multi-paso y respuestas finales tras cadenas de pensamiento, entrenado explicitamente sobre trayectorias de razonamiento.
- Llamadas a herramientas (tool calling / function calling), ya que la perdida cubre las llamadas a herramientas de las trayectorias del profesor.
- Comportamiento agéntico: el dataset incluye fuentes agentalign_harmful y agentalign_benign, orientadas a escenarios de agentes.
- Seguridad de codigo: entrenado con codesafetybench y magicoder para manejar peticiones de codigo potencialmente peligrosas.
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de vision no se entreno en este checkpoint.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento de seguridad: evaluar como un modelo de 4B responde a prompts benignos y adversarios tras SFT sobre trayectorias destiladas, comparando con el base sin ajustar.
- Destilacion de trayectorias: estudiar la transferencia de comportamiento desde un profesor de 27B a un alumno de 4B mediante SFT supervisado, analizando los checkpoints intermedios publicados (91, 183, 274, 365, 456, 548, 639 y 730 actualizaciones).
- Evaluacion de seguridad de codigo: probar el modelo con peticiones de codigo de doble uso (codesafetybench) para medir su tasa de rechazo o de respuesta segura en pipelines de revision automatizada.
- Simulacion de agentes con herramientas: usar el soporte de tool calling para construir entornos de agente multi-paso y analizar el comportamiento seguro en cada paso.
- Filtrado y moderacion de contenido: emplear el modelo como clasificador generativo de seguridad en flujos de revision, aprovechando su contexto de 32.768 tokens para conversaciones largas.
- Experimentos de robustez ante jailbreak: evaluar respuestas frente a wildjailbreak_benign y difficult_advice para medir la resistencia a prompts adversarios.
- Base para posteriores ajustes: al estar bajo Apache 2.0 y cargarse como el base, sirve como punto de partida para RLHF, DPO u otras tecnicas sobre un modelo ya sensibilizado a seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contexto largo.
- Cuantizacion: no se publican pesos cuantizados; habria que generarlos a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se realizo en 1x NVIDIA B200; para inferencia, A100 40/80 GB, H100 o GPUs consumer de gama alta con suficiente VRAM.
- GPU consumer: previsiblemente cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 16 GB si se cuantiza a 8 bits o 4 bits (no verificado en la informacion).
- Despliegue: compatible con `transformers` (clase `Qwen3_5ForConditionalGeneration`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365 | 4.659.865.088 | 32.768 | Apache 2.0 | Checkpoint SFT intermedio de seguridad; multimodal heredado; sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (segun license_link del base) | Modelo base sin ajuste de seguridad; mismo formato de pesos |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para generar las trayectorias; mucho mayor |

No se dispone de datos de rendimiento comparativo ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (365 de 730 actualizaciones, 1 de 2 epocas): el entrenamiento sigue en curso y no es un modelo final ni validado para produccion.
- No se han publicado benchmarks, evaluaciones de seguridad cuantitativas ni resultados de red-teaming; el efecto real del ajuste de seguridad es desconocido.
- Riesgo de alucinacion inherente a los modelos generativos; el ajuste SFT no lo elimina.
- Sesgos: no documentados en la informacion; el dataset incluye fuentes de seguridad y codigo que pueden introducir sesgos de dominio.
- Idiomas soportados no especificados; el comportamiento multilingue no esta garantizado.
- La torre de vision y la cabeza MTP conservan los pesos del base sin entrenar: las capacidades multimodales no han sido optimizadas en este checkpoint.
- Las trayectorias mas largas de 32.768 tokens se excluyeron, lo que puede sesgar el dataset hacia conversaciones mas cortas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion conviene validar su comportamiento antes de desplegarlo.
- Dependencia de la calidad del profesor (Qwen3.8-27B): los errores o sesgos del profesor pueden transferirse al alumno.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Slime: no disponible
- Megatron-LM: no disponible
