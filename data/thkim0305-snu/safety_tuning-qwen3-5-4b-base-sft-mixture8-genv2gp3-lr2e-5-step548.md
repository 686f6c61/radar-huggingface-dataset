# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step548

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step548 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo forma parte de un proceso de "safety tuning": se entrena al modelo pequeno para que reproduzca trayectorias de razonamiento, respuestas finales y llamadas a herramientas generadas por un profesor mucho mayor, Qwen/Qwen3.8-27B, sobre un conjunto de datos de seguridad denominado "mixture-8".

El checkpoint corresponde al update 548 de 730 (1,5 de 2 epocas), por lo que no es un modelo final sino una instantanea de un entrenamiento en curso. Los pesos son bf16 en formato Hugging Face `Qwen3_5ForConditionalGeneration`; solo se entreno el modelo de lenguaje, mientras que la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base.

Con 4.659.865.088 parametros totales y un contexto de entrenamiento de 32.768 tokens, el modelo resulta relevante para quienes investigan tecnicas de alineacion y seguridad en modelos de ~4B, asi como para experimentar con destilacion de trayectorias desde profesores de mayor tamano en entornos de recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (hereda la del modelo base Qwen3.5-4B-Base; incluye torre de vision y cabeza MTP sin entrenar) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y conserva su arquitectura `Qwen3_5ForConditionalGeneration`, que incluye una torre de vision y una cabeza MTP (multi-token prediction) que no fueron entrenadas: solo se actualizaron los pesos del modelo de lenguaje. El entrenamiento se realizo con Slime + Megatron-LM en bf16 con estado del optimizador en fp32, sobre 2 GPU NVIDIA RTX PRO 6000 Blackwell con tensor parallel 2.

El recipe es SFT de parametros completos sobre trayectorias de profesor, con perdida calculada sobre el razonamiento, la respuesta final y las llamadas a herramientas. Se usaron 46.626 trayectorias procedentes de 11.757 prompts (2 epocas x 365 updates de 128 secuencias), con learning rate pico 2e-5, warmup lineal del 10 %, decaimiento coseno hasta 4e-6, Adam con betas [0.9, 0.95], eps 1e-8, weight decay 0.1 y grad clip 1.0. Las trayectorias que superaban los 32.768 tokens se excluyeron completas, nunca se truncaron. El profesor fue Qwen/Qwen3.8-27B, con cuatro respuestas muestreadas por prompt y conservando todas las validas. El conjunto mixture-8 combina star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983) trayectorias.

## Capacidades

- Generacion de texto conversacional con plantilla de chat nativa del modelo base y modo thinking activable (`enable_thinking=True`).
- Razonamiento multi-paso: el entrenamiento incluye perdida sobre las trazas de razonamiento del profesor.
- Llamadas a herramientas (tool calling): la perdida cubre explicitamente las llamadas a herramientas presentes en las trayectorias.
- Capacidades de vision heredadas del modelo base (torre de vision intacta), aunque no fueron entrenadas en este SFT.
- Comportamiento orientado a seguridad: el conjunto de datos incluye fuentes benignas y armonicas (agentalign, wildjailbreak_benign, star_benign_v2) y fuentes de codigo seguro (codesafetybench).
- Generacion de codigo: entrenado parcialmente sobre trayectorias de magicoder y codesafetybench.
- Capacidades multilingues: no disponible (no se documentan idiomas).

## Casos de uso

- Investigacion en safety tuning: evaluar como un SFT de ~4B destilado de un profesor de 27B modifica el comportamiento del modelo base en prompts armonicos y benignos, comparando checkpoints intermedios (91, 183, 274, 365, 456, 548, 639, 730).
- Destilacion de trayectorias de razonamiento: usar el checkpoint para estudiar la transferencia de cadenas de razonamiento y llamadas a herramientas desde un profesor grande a un alumno pequeno en un dominio acotado.
- Evaluacion de robustez ante jailbreaks: el conjunto wildjailbreak_benign y agentalign_harmful permiten medir la resistencia a prompts adversarios en un modelo de 4B.
- Generacion de codigo seguro: las fuentes codesafetybench y magicoder hacen del modelo un candidato para experimentos sobre sugerencia de codigo con consideraciones de seguridad, integrable en pipelines de revision.
- Asistente conversacional con contexto medio: sus 32.768 tokens de contexto permiten conversaciones multi-turno y documentos de tamano moderado en despliegues con recursos limitados.
- Punto de partida para fine-tuning posterior: al cargarse exactamente como el modelo base y compartir licencia Apache 2.0, sirve como inicializacion para tareas especificas que requieran un modelo ya expuesto a datos de seguridad.
- Experimentos de agentes con tool calling: la perdida sobre llamadas a herramientas permite probar flujos de agente de varios pasos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB para contexto corto y bastante mas para contexto largo.
- Cuantizacion: no se documentan pesos cuantizados; seria necesario generarlos (por ejemplo, GGUF o AWQ) a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se realizo en 2x NVIDIA RTX PRO 6000 Blackwell con tensor parallel 2; para inferencia, una RTX 4090 (24 GB) o superior permite cargar el modelo en bf16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB en bf16 para contextos moderados; en 12 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (recipe oficial del model card); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint y requeririan conversion o validacion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | 4,66B | 32.768 | Apache 2.0 | Checkpoint intermedio de SFT de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | 4B (clase) | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B | 27B (clase) | no disponible | no disponible | Profesor usado para generar las trayectorias; mayor capacidad |

No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 548 de 730, 1,5 de 2 epocas): el entrenamiento sigue en curso y el modelo no debe considerarse final ni validado.
- No se han publicado benchmarks ni evaluaciones de seguridad independientes; el efecto real del safety tuning es desconocido.
- Riesgo de alucinacion inherente a los modelos de ~4B y a la destilacion de trayectorias de un profesor; no se documenta mitigacion especifica.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- La torre de vision y la cabeza MTP conservan los pesos del base sin entrenar: las capacidades multimodales no se han ajustado en este proceso.
- Las trayectorias de mas de 32.768 tokens se excluyeron, lo que puede sesgar el entrenamiento hacia casos de menor longitud.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene revisar la licencia del modelo base enlazada en el model card.
- El checkpoint se entreno con la plantilla de chat nativa del base y system prompt fijo ("You are a helpful assistant."), sin Model Spec; usos fuera de esa configuracion pueden degradar el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step548
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (referencia en el model card): https://huggingface.co/Qwen/Qwen3.8-27B
