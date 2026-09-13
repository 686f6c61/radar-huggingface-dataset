# wrice/chatterbox-turbo-grpo

## Resumen

Chatterbox Turbo GRPO es un ajuste fino del modelo de sintesis de voz ResembleAI/chatterbox-turbo, publicado por el usuario wrice, en el que se ha aplicado aprendizaje por refuerzo (GRPO) sobre el componente T3, el modulo que genera los tokens de habla a partir del texto. El resto de la cadena (S3Gen, tokenizador S3, codificador de voz y tokenizador) permanece identico byte a byte a la version base, de modo que el modelo se carga como sustituto directo del checkpoint original.

La relevancia de esta ficha esta en el metodo: en lugar de reentrenar con pares texto-audio supervisados, el autor optimiza directamente metricas calculadas sobre el audio decodificado (inteligibilidad con Whisper large-v3-turbo, calidad estimada con Distill-MOS, similitud de hablante con CAMPPlus y una guarda de duracion). Sobre 200 prompts retenidos de LibriTTS-R, la tasa de error de palabra baja de 0,045 a 0,036 (un 20 % menos de errores) manteniendo sin cambios la prosodia, el ritmo y la tasa de generaciones sin EOS.

El modelo es solo para ingles, esta entrenado sobre locucion de audiolibro y se distribuye con licencia MIT. El repositorio ocupa 3,0 GB e incluye tanto los pesos fusionados como el adaptador LoRA sin fusionar (r=32, alpha=64) para quien prefiera aplicarlo sobre el T3 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; cadena TTS de Chatterbox con un modelo T3 autorregresivo de generacion de tokens de habla, decodificador S3Gen, tokenizador S3 y codificador de voz |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; durante el entrenamiento la generacion se limita a 800 tokens de habla (~32 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors; incluye adaptador PEFT LoRA sin fusionar en `adapter/` |
| Tamano del repositorio | 3,0 GB |
| Modelo base | ResembleAI/chatterbox-turbo (relacion: finetune) |
| Pipeline | text-to-speech |
| Libreria | chatterbox (`chatterbox-tts`) |

## Arquitectura y entrenamiento

El modelo conserva intacta la arquitectura de Chatterbox Turbo: el componente T3 genera tokens de habla a partir del texto y S3Gen los convierte en forma de onda, apoyandose en el tokenizador S3 y en el codificador de voz para la clonacion. La unica parte modificada es T3, mediante un adaptador LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones `c_attn`, `c_proj` y `c_fc`, que en este repositorio aparece ya fusionado en los pesos publicados. Los rollouts son autorregresivos y pueden terminar o no con un token EOS, lo que se usa como senal de control.

El entrenamiento usa GRPO on-policy con un paso de optimizador por lote de rollouts, agregacion de perdida a nivel de token, ventajas centradas en la media del grupo (sin division por desviacion tipica) y penalizacion KL k3 (beta = 0,02) contra el modelo base con el LoRA desactivado. Cada paso muestrea 8 prompts x 8 generaciones con temperatura 1,0 y un tope de 800 tokens de habla; en total 3.000 pasos, unas 24.000 prompts vistas una vez. Las recompensas, estandarizadas por lote y ponderadas, son: inteligibilidad 0,4 (media armonica ponderada de `1 - tanh(3*WER)` y `exp(-NLL/3)` medidas con Whisper large-v3-turbo), Distill-MOS 0,4, similitud de hablante CAMPPlus 0,1 y duracion 0,1. Los datos son LibriTTS-R `train-clean-100` (32.947 frases de 237 hablantes), usando una locucion de 6 a 15 s por hablante como prompt de voz y el resto como prompts de texto, sin audio objetivo. El entrenamiento se ejecuto en una unica RTX 6000 Ada, a unos 25 s por paso.

## Capacidades

- Sintesis de voz en ingles a partir de texto (text-to-speech), con generacion de audio de hasta ~32 s por secuencia segun el limite de tokens usado en entrenamiento.
- Clonacion de voz zero-shot mediante `audio_prompt_path`, tomando una muestra de referencia del hablante.
- Mayor inteligibilidad que el modelo base: 20 % menos de errores de palabra medidos con Whisper large-v3-turbo sobre el conjunto retenido.
- Calidad percibida ligeramente superior segun Distill-MOS (4,47 frente a 4,40).
- Conservacion de la identidad del hablante: similitud CAMPPlus de 0,688 y WavLM-base-plus-sv de 0,940, al nivel de las grabaciones reales de LibriTTS-R.
- Control de prosodia y ritmo: la desviacion tipica de log-F0 y las palabras por segundo se mantienen practicamente identicas al modelo base.
- Generacion estable: 0 % de rollouts sin token EOS, igual que la version base.
- Compatibilidad directa con el paquete `chatterbox-tts` como sustituto del checkpoint base.
- No se documento soporte de tool calling, razonamiento multi-paso, vision ni audio de entrada mas alla del prompt de voz.

## Casos de uso

- Produccion de audiolibros en ingles: el modelo se entreno sobre LibriTTS-R, corpus de locucion de audiolibro, y mantiene prosodia y ritmo estables, por lo que es adecuado para narrar textos largos por fragmentos de hasta ~32 s con una voz de referencia consistente.
- Clonacion de voz para asistentes personalizados: basta una locucion de 6 a 15 s del hablante como `audio_prompt_path` para generar respuestas con esa identidad, util en asistentes de marca o interfaces conversacionales.
- Accesibilidad y lectores de pantalla: la mejora de inteligibilidad (WER 0,036) reduce la necesidad de repetir o reinterpretar frases, algo critico en lectura asistida de documentos y articulos en ingles.
- Locucion para e-learning y cursos: permite generar narraciones con una voz corporativa fija y reproducir el mismo texto con distintos hablantes de referencia para modulos formativos.
- Doblaje y postproduccion de video en ingles: sustituto directo del checkpoint base en el mismo pipeline, con mejoras medibles de claridad sin alterar el ritmo medio de habla (2,727 palabras por segundo).
- Sistemas de respuesta de voz interactiva (IVR) y telefonia: la tasa de generaciones sin EOS del 0 % evita locuciones truncadas o divagantes, un fallo tipico en produccion de TTS.
- Voces de personajes en videojuegos y prototipos: con un prompt de voz por personaje se pueden generar lineas de dialogo en ingles de forma rapida, usando el adaptador LoRA si se quiere seguir ajustando.
- Generacion de contenido para podcasts y demos: el modelo permite producir clips de habla claros a partir de texto en pipelines automatizados, cargando el checkpoint con `ChatterboxTurboTTS.from_local`.

## Benchmarks y rendimiento

Evaluacion sobre 200 prompts retenidos de LibriTTS-R `train-clean-100` (hablantes vistos en entrenamiento, frases no vistas), una muestra por prompt con temperatura 0,8. Los valores son la media de las ultimas once validaciones (pasos 2.600 a 3.000); el margen de ruido estimado es de aproximadamente 0,004 de WER.

| Metrica | Base | Este modelo | Resultado |
|---|---|---|---|
| WER, menor es mejor (Whisper large-v3-turbo) | 0,045 | 0,036 | 20 % menos errores |
| NLL con teacher forcing de Whisper, menor es mejor | 0,461 | 0,428 | 7 % menos |
| Distill-MOS, mayor es mejor | 4,40 | 4,47 | +0,07 |
| Similitud de hablante, CAMPPlus (modelo de recompensa), mayor es mejor | 0,680 | 0,688 | +0,009 |
| Similitud de hablante, WavLM-base-plus-sv (independiente), mayor es mejor | 0,939 | 0,940 | +0,001 |
| Desviacion tipica de log-F0 (guarda de prosodia) | 0,234 | 0,240 | sin cambios |
| Palabras por segundo (guarda de ritmo) | 2,728 | 2,727 | sin cambios |
| Rollouts sin EOS (guarda de desbordamiento) | 0 % | 0 % | sin cambios |

No se realizo prueba de escucha humana. Las ganancias se miden con metricas automaticas procedentes de las mismas familias de modelos usadas como recompensa.

## Requisitos de hardware

- Entrenamiento documentado: una RTX 6000 Ada, con aproximadamente 25 s por paso durante 3.000 pasos.
- VRAM de inferencia: no disponible de forma oficial. El repositorio ocupa 3,0 GB, por lo que es razonable esperar un consumo moderado en GPU de consumo, pero no hay cifra publicada.
- GPU recomendadas para entrenamiento o ajuste continuado: RTX 6000 Ada (la usada por el autor); no se documentan otras configuraciones.
- GPU de consumo: no confirmado en la informacion disponible, aunque el tamano del repositorio sugiere que puede caber en GPU de gama media-alta con memoria suficiente.
- Opciones de despliegue: paquete `chatterbox-tts` mediante `ChatterboxTurboTTS.from_local(path, "cuda")` y descarga del repositorio con `snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a este pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wrice/chatterbox-turbo-grpo | No disponible | 800 tokens de habla (~32 s) en entrenamiento | WER 0,036; Distill-MOS 4,47; similitud CAMPPlus 0,688 | MIT | HuggingFace, 0 descargas, 0 likes |
| ResembleAI/chatterbox-turbo (base) | No disponible | Mismo pipeline | WER 0,045; Distill-MOS 4,40; similitud CAMPPlus 0,680 | MIT | HuggingFace |
| Otros modelos TTS open source comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion disponible es contra el modelo base. No se dispone de cifras de otros sistemas TTS de la misma categoria en el material proporcionado.

## Limitaciones y advertencias

- Solo ingles; el modelo no esta entrenado ni evaluado para otros idiomas.
- Entrenado con locucion de audiolibro leida, por lo que el comportamiento en registros coloquiales, conversacionales o ruidosos no esta caracterizado.
- No se entreno ni evaluo el manejo de etiquetas paralinguisticas como `[laugh]`.
- Las ganancias se miden con metricas automaticas de las mismas familias de modelos usadas como recompensa; no hubo prueba de escucha humana, lo que puede introducir sesgo hacia lo que esos modelos premian.
- La similitud de hablante no tenia margen de mejora: en grabaciones reales de LibriTTS-R dos locuciones del mismo hablante puntuan 0,68 de coseno CAMPPlus, y tanto el base como este modelo ya alcanzan ese nivel, por lo que la recompensa de similitud actua como guarda contra la deriva y no como motor de mejora.
- En frases individuales el ritmo puede diferir del base (el clip de demostracion es un 7 % mas lento), aunque la media sobre el conjunto retenido no cambia.
- Riesgo de alucinacion acustica o de artefactos en entradas fuera de dominio no cuantificado en la informacion disponible.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base ResembleAI/chatterbox-turbo; conviene revisar dichas condiciones antes de desplegar.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni adopción por parte de la comunidad en el momento de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrice/chatterbox-turbo-grpo
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
- Codigo de entrenamiento: https://github.com/will-rice/chatterbox-rl (commit `79c9222`)
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/will-rice/chatterbox-rl/runs/io52clk5
- Muestra del modelo base: https://huggingface.co/wrice/chatterbox-turbo-grpo/resolve/main/samples/base.wav
- Muestra del modelo ajustado: https://huggingface.co/wrice/chatterbox-turbo-grpo/resolve/main/samples/grpo.wav
- Dataset de entrenamiento: mythicinfinity/libritts_r (referenciado en las etiquetas del repositorio)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
