# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step91

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step91 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y corresponde al paso 91 de 730 actualizaciones del optimizador, es decir, aproximadamente 0,249 de las 2 epocas planificadas. No es un modelo final: es una instantanea de un entrenamiento en curso, orientado a alineamiento de seguridad y generacion de trayectorias de razonamiento y llamadas a herramientas.

El modelo parte de la arquitectura Qwen3.5 en su variante `Qwen3_5ForConditionalGeneration`, que incluye torre de vision y cabeza MTP (multi-token prediction). El entrenamiento solo afecta al modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo de partida. Cuenta con 4.659.865.088 parametros totales segun los safetensors publicados y un contexto de entrenamiento de 32.768 tokens.

Su relevancia es doble: por un lado, documenta una receta reproducible de SFT de seguridad con destilacion de trayectorias desde un profesor mayor (Qwen3.8-27B); por otro, al ser un checkpoint intermedio permite estudiar la evolucion del comportamiento del modelo durante el entrenamiento. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.5, `Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con capacidad multimodal (pipeline `image-text-to-text`), aunque en este checkpoint solo se ha entrenado el modelo de lenguaje. La torre de vision y la cabeza MTP se copian intactas desde el base. El entrenamiento se realizo con Slime + Megatron-LM, con computo en bf16 y estado del optimizador en fp32, sobre 2 GPU NVIDIA RTX PRO 6000 Blackwell con paralelismo tensorial 2.

La receta de SFT usa ajuste completo de parametros sobre trayectorias generadas por un profesor (Qwen/Qwen3.8-27B), con perdida sobre el razonamiento, la respuesta final y las llamadas a herramientas. El conjunto de datos, denominado mixture-8, contiene 46.626 trayectorias procedentes de 11.757 prompts, repartidas en ocho fuentes: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). Se planificaron 2 epocas con 365 actualizaciones de 128 secuencias cada una, learning rate pico de 2e-05 con calentamiento lineal del 10 % y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], weight decay 0.1 y recorte de gradiente 1.0. Las trayectorias mas largas de 32.768 tokens se excluyeron completas, nunca se truncaron. El prompt del estudiante usa la plantilla nativa de chat del base con system "You are a helpful assistant." y modo thinking activado.

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa y modo thinking.
- Razonamiento multi-paso: el entrenamiento incluye perdida explicita sobre las trazas de razonamiento del profesor.
- Llamadas a herramientas (tool calling): la perdida cubre tambien las llamadas a herramientas presentes en las trayectorias.
- Capacidad multimodal potencial heredada del base (torre de vision intacta), aunque no entrenada en este checkpoint.
- Alineamiento de seguridad: el dataset incluye fuentes especificas de seguridad (agentalign_harmful, codesafetybench, wildjailbreak_benign) y de comportamiento beneficioso (agentalign_benign, star_benign_v2).
- Generacion de codigo: presencia de magicoder y codesafetybench en el conjunto de entrenamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre SFT de seguridad: el checkpoint permite analizar como evoluciona el comportamiento de rechazo y utilidad a lo largo del entrenamiento comparando los distintos pasos publicados (91, 183, 274, 365, 456, 548, 639, 730).
- Evaluacion de destilacion de trayectorias: util para medir la fidelidad del estudiante de 4B respecto al profesor de 27B en tareas de razonamiento y tool calling.
- Generacion de codigo asistida: el modelo ha visto datos de magicoder y codesafetybench, por lo que puede emplearse en tareas de generacion y revision de codigo con enfasis en seguridad.
- Clasificacion y filtrado de contenido sensible: las fuentes de seguridad del dataset lo hacen adecuado para experimentos de moderacion y deteccion de peticiones daninas.
- Desarrollo de agentes conversacionales: el entrenamiento sobre trayectorias con llamadas a herramientas permite prototipar agentes multi-paso en entornos controlados.
- Analisis de robustez frente a jailbreaks: la inclusion de wildjailbreak_benign y difficult_advice permite estudiar la resistencia del modelo a prompts adversarios.
- Base para posteriores etapas de alineamiento: al ser un checkpoint intermedio, sirve como punto de partida para RLHF, DPO u otras tecnicas sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: el autor entreno con 2x NVIDIA RTX PRO 6000 Blackwell en tensor parallel 2; para inferencia basta una GPU consumer de gama alta (RTX 4090, RTX 3090) en bf16 o cuantizada.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (receta oficial del autor); vLLM, llama.cpp, Ollama y TGI no estan confirmados por el autor, aunque al ser pesos safetensors estandar de Qwen3.5 deberian ser compatibles con las herramientas que soporten dicha arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | 4,66 B | 32.768 | Apache 2.0 | Checkpoint intermedio de SFT de seguridad |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible | no disponible | Profesor usado para destilar trayectorias |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se han completado 91 de 730 actualizaciones (0,249 de 2 epocas); el modelo no esta terminado y su calidad puede ser inferior a la de un modelo final.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el ajuste sobre trayectorias destiladas no elimina este riesgo.
- Sesgos: no documentados por el autor; el dataset incluye fuentes de seguridad pero no se detalla su composicion demografica ni linguistica.
- Idiomas: no se especifican los idiomas soportados; no debe asumirse cobertura multilingue.
- Contexto: el entrenamiento excluyo trayectorias superiores a 32.768 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor no ofrece garantias y el modelo se distribuye como material de investigacion.
- Vision y MTP: aunque el checkpoint incluye torre de vision y cabeza MTP, no fueron entrenadas; su comportamiento es el del base y no se ha validado en este ajuste.
- Despliegue: solo la receta con transformers esta verificada por el autor; otros motores de inferencia no han sido probados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step91
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Slime: no disponible
- Megatron-LM: no disponible
