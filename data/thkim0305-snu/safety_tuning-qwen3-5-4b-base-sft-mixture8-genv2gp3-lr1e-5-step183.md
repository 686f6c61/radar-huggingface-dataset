# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step183

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step183 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se enmarca en un proceso de "safety tuning": se entrena al modelo con trayectorias destiladas de un profesor de mayor tamano (Qwen/Qwen3.8-27B) para mejorar su comportamiento en escenarios de seguridad, incluyendo respuestas a peticiones potencialmente daninas, codigo seguro y conversaciones agenticas.

Se trata de un snapshot, no de un modelo final: corresponde a la actualizacion de optimizador 183 de 730 (aproximadamente 0,501 de 2 epocas). Los pesos se exportan en bf16 con la clase `Qwen3_5ForConditionalGeneration`, manteniendo intactos el torre de vision y la cabeza MTP del modelo base; solo se entreno el modelo de lenguaje. El checkpoint carga exactamente igual que el modelo base.

Con 4.659.865.088 parametros (aproximadamente 4,66 mil millones), contexto de entrenamiento de 32.768 tokens y licencia Apache 2.0, el modelo resulta relevante para investigadores que estudian alineamiento de seguridad, destilacion de trayectorias y ajuste fino de modelos multimodales de rango medio. Su naturaleza de checkpoint intermedio lo hace util para analisis de dinamica de entrenamiento, aunque no esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal de tipo image-text-to-text con torre de vision y cabeza MTP (multi-token prediction). El ajuste fino es de parametros completos (full-parameter SFT) unicamente sobre el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos del base sin modificar. El entrenamiento se realizo con Slime + Megatron-LM, con computo en bf16 y estado del optimizador en fp32.

Los datos consisten en 46.626 trayectorias procedentes de 11.757 prompts, destiladas del profesor Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`), con cuatro respuestas muestreadas por prompt y conservando todas las validas. El conjunto "mixture-8" combina ocho fuentes: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). La perdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. Se usaron 2 epocas con 365 actualizaciones de 128 secuencias, learning rate pico de 1e-5 con calentamiento lineal del 10% y decaimiento coseno hasta 2e-6, Adam con betas [0.9, 0.95], eps 1e-8, weight decay 0.1 y grad clip 1.0. Las trayectorias mas largas de 32.768 tokens se excluyeron completas, nunca se truncaron. El prompt del estudiante usa la plantilla nativa de chat del base, con system "You are a helpful assistant." y modo thinking activado.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking activado por defecto.
- Capacidades multimodales de entrada image-text-to-text heredadas del modelo base (torre de vision intacta).
- Soporte de tool calling / function calling, ya que la perdida se aplica sobre las llamadas a herramientas en las trayectorias de entrenamiento.
- Razonamiento agentico multi-paso, entrenado con datos agentalign (harmful y benign).
- Comportamiento orientado a seguridad: respuestas a peticiones daninas, codigo seguro y rechazo de jailbreaks, gracias a las fuentes codesafetybench, difficult_advice y wildjailbreak_benign.
- Generacion de codigo, con datos de magicoder en el conjunto de entrenamiento.
- Capacidades multilingues: no disponible (no se especifican idiomas).

## Casos de uso

- Investigacion en alineamiento de seguridad: el checkpoint permite analizar como evoluciona el comportamiento de rechazo y la utilidad a lo largo del entrenamiento comparando con otros snapshots de la misma run (updates 91, 274, 365, etc.).
- Evaluacion de destilacion de trayectorias: util para estudiar la transferencia de comportamiento desde un profesor de 27B a un estudiante de 4,66B en tareas de seguridad y codigo.
- Analisis de dinamica de entrenamiento: al ser un snapshot intermedio, sirve para trazar curvas de perdida y metricas de seguridad frente al numero de actualizaciones.
- Generacion de codigo seguro: el modelo ha sido entrenado con codesafetybench y magicoder, por lo que puede emplearse en experimentos sobre como un SFT de seguridad afecta a la calidad del codigo generado.
- Simulacion de conversaciones agenticas: con datos agentalign, puede usarse para probar pipelines de agentes con tool calling en entornos controlados de investigacion.
- Evaluacion de jailbreaks: entrenado con wildjailbreak_benign, es adecuado para medir robustez frente a prompts adversarios en estudios comparativos.
- Prototipado de asistentes multimodales: al conservar la torre de vision del base, permite experimentar con entradas image-text-to-text en tareas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB para pesos; en 4 bits, aproximadamente 2,5-3 GB.
- GPU recomendadas: NVIDIA B200 (usada en el entrenamiento), A100 40/80 GB, H100; para inferencia en bf16, una RTX 4090 (24 GB) es suficiente para contexto corto o medio.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (referencia oficial), vLLM y TGI para servicio; llama.cpp/Ollama requeririan conversion a GGUF, no documentada en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step183 | 4,66B | 32.768 | Apache 2.0 | Checkpoint intermedio de SFT de seguridad, multimodal (vision heredada) |
| Qwen/Qwen3.5-4B-Base | 4,66B (aproximado) | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B | 27B (aproximado) | no disponible | no disponible | Profesor usado para destilar trayectorias; mayor tamano y capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (183 de 730 actualizaciones, 0,501 de 2 epocas): el entrenamiento sigue en curso y no representa un modelo final ni pulido.
- Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP conservan pesos del base, por lo que las capacidades multimodales no han sido especificamente ajustadas para seguridad.
- No se especifican idiomas soportados; el comportamiento multilingue es incierto.
- Riesgo de alucinacion inherente a modelos de 4,66B, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5-4B-Base, hereda los sesgos del base y del profesor Qwen3.8-27B.
- El ajuste de seguridad puede producir rechazos excesivos (over-refusal) en peticiones benignas, dado el peso de fuentes como agentalign_harmful y difficult_advice.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion de seguridad publicada, no se recomienda su despliegue en produccion sin auditoria previa.
- No hay benchmarks publicados que permitan validar su rendimiento frente al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step183
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (referenciado en la model card): Qwen/Qwen3.8-27B (no se proporciona URL directa en la informacion disponible)
- Paper, blog o repositorio adicional: no disponible
