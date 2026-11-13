# Youbiquitous/turn-classifier-mmbert-v1

## Resumen

El Multilingual Turn Classifier (mmBERT) es un modelo de clasificación de texto desarrollado por Youbiquitous que resuelve el problema del *turn-taking* en agentes de voz sobre SIP: decidir si el interlocutor ha terminado de hablar, si está reclamando el turno o simplemente emitiendo un *backchannel*, y si se dirige al agente o habla con terceros en la sala. Se apoya en el encoder multilingüe `jhu-clsp/mmBERT-base` y añade tres cabezas de clasificación más una puntuación de frases de relleno que el agente puede pronunciar mientras prepara la respuesta.

La versión actual, 2.0.0 (TurnClassifierV2), se distribuye en formato ONNX con cuantización dinámica int8 (389 MB) y una exportación fp32 de paridad (1,2 GB). Su relevancia práctica está en que permite sustituir heurísticas de detección de fin de turno basadas en silencio por una decisión semántica multilingüe con latencias de 48 ms p50 y 73 ms p95 en cuatro hilos sobre una VM de 4 vCPU, lo que encaja en el bucle de tiempo real de una llamada telefónica.

El modelo cubre italiano, inglés, francés, español y alemán, con licencia MIT, y está pensado para integrarse en pipelines de agentes conversacionales donde la latencia y la precisión de la decisión de turno condicionan la naturalidad de la interacción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabezas de clasificación múltiple y puntuación de opciones |
| Parametros totales | no disponible (derivado de `jhu-clsp/mmBERT-base`; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens máximo de entrada |
| Tipos de cuantizacion | int8 dinámica (runtime, 389 MB) y fp32 (paridad y auditoría, 1,2 GB) |
| Idiomas soportados | italiano, inglés, francés, español, alemán |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`, `model.fp32.onnx`); checkpoint PyTorch en `training/` |

## Arquitectura y entrenamiento

El modelo parte del encoder `jhu-clsp/mmBERT-base`, inicializado en caliente desde la release 1.1.1 del propio autor. Sobre la representación del encoder se añaden tres cabezas de clasificación binaria —`endpoint` (COMPLETE/INCOMPLETE), `floor_claim` (CLAIM/BACKCHANNEL) y `addressee` (AGENT/SIDE_TALK)— y un mecanismo de puntuación de frases que lee la representación en la posición de cada marcador `<oN>` para asignar una probabilidad a cada opción de relleno listada, incluida la opción `PASS` (no decir nada). Las logits de salida ya vienen divididas por las temperaturas ajustadas, de modo que el consumidor solo aplica softmax.

La entrada se estructura en un formato textual con etiquetas: `[LANG]`, `[STATE]` (LISTENING, ASSISTANT_PLAYING, ASSISTANT_THINKING), `[HISTORY]` con los últimos tres turnos almacenados (incluyendo líneas `filler:` de rellenos ya reproducidos y una representación explícita de *side talk*), `[USER]` con la transcripción actual y `[OPT]` con hasta 16 frases candidatas. Cuando la entrada excede los 512 tokens se descartan las líneas de historial más antiguas. El orden de las opciones es libre porque el entrenamiento las baraja.

El autor no detalla en la model card el volumen de tokens de entrenamiento ni la composición del dataset, más allá de indicar que la evaluación se realiza sobre particiones sintéticas. La evaluación reportada corresponde a un checkpoint PyTorch con semilla 29, y la exportación ONNX se verificó con ONNX Runtime 1.32.0 en el commit `2c8cb05`.

## Capacidades

- Clasificación de fin de turno (`endpoint`): distingue turnos completos de turnos inacabados, con recall y precisión de INCOMPLETE del 96,6%/96,7% en validación.
- Detección de reclamación de turno (`floor_claim`): diferencia entre una intervención que pide el turno (CLAIM) y un *backchannel* del tipo "sí", "ajá".
- Detección de destinatario (`addressee`): distingue si el usuario habla con el agente o con otras personas en la sala (SIDE_TALK), con recall del 94,7% y precisión del 97,8% en validación.
- Puntuación de frases de relleno: asigna una probabilidad a cada una de hasta 16 frases candidatas, incluida la decisión de no decir nada (`PASS`) con un umbral configurable de 0,5.
- Multilingüe en cinco idiomas (it, en, fr, es, de) dentro de un mismo modelo.
- Consumo de estado del diálogo mediante `[STATE]` e historial de tres turnos, lo que permite condicionar la decisión al momento de la llamada.
- No soporta *tool calling*, ni razonamiento multi-paso, ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Atención al cliente telefónica automatizada: el modelo decide en cada pausa del llamante si el turno ha terminado o si la frase continúa, evitando que el agente interrumpa a mitad de una explicación. La latencia de 48 ms p50 en cuatro hilos permite tomar la decisión dentro del margen de silencio típico de una llamada.
- Relleno conversacional natural: con la puntuación de opciones, el agente puede seleccionar frases como "Vediamo..." o "Un attimo..." mientras prepara la respuesta, y el modelo decide cuándo es preferible no decir nada (`PASS`), reduciendo la sensación de robotización.
- Filtrado de *side talk*: en entornos con varias personas junto al teléfono, la cabeza `addressee` detecta que el usuario habla con un tercero y evita que el agente responda a comentarios que no van dirigidos a él.
- Detección de *backchannels*: cuando el llamante emite un "sì" o "ok" sin intención de tomar el turno, la cabeza `floor_claim` lo clasifica como BACKCHANNEL y el agente continúa su intervención sin ceder la palabra.
- Enrutado y escalado en centralita SIP: la combinación de `endpoint` y `addressee` permite decidir si la llamada sigue en el agente automático o debe transferirse a un operador humano porque el usuario está formulando una petición compleja.
- Integración en asistentes de voz para reservas y citas: el modelo procesa la transcripción parcial del ASR y el historial para determinar si el usuario ha terminado de dictar datos (fecha, nombre, número de tarjeta) antes de confirmar la captura.
- Evaluación de calidad de agentes conversacionales: al ser un clasificador ligero y determinista, puede emplearse en *offline* para etiquetar turnos de conversaciones grabadas y medir la tasa de interrupciones.

## Benchmarks y rendimiento

Evaluación del checkpoint PyTorch (semilla 29) sobre particiones sintéticas:

| Métrica | Validación | Test |
|---|---:|---:|
| Precisión endpoint | 97,7% | 97,1% |
| Recall / precisión INCOMPLETE | 96,6% / 96,7% | 95,5% / 95,9% |
| Precisión floor_claim | 100% | 100% |
| Precisión addressee | 99,5% | 99,6% |
| Recall / precisión SIDE_TALK | 94,7% / 97,8% | 95,2% / 98,5% |
| Decisión PASS-o-hablar | 98,4% | 97,9% |
| PASS en turnos inacabados | 98,1% | 98,0% |

Latencia de `model.int8.onnx` sobre las entradas doradas (mediana de 136 tokens, máximo 236), una llamada a la vez, en una VM de 4 vCPU:

| Hilos | p50 | p95 |
|---:|---:|---:|
| 1 | 106 ms | 158 ms |
| 4 | 48 ms | 73 ms |

Paridad int8 frente al checkpoint PyTorch en 400 llamadas de validación: misma decisión de `endpoint` en el 99,25%, misma de `floor_claim` y `addressee` en el 100%, y misma frase en el 88,5%. Sobre los 457 casos dorados, int8 y fp32 difieren en una decisión de cabeza, en la frase en 35 casos y en la decisión PASS-o-hablar en uno. El modelo int8 supera 440 de los 457 casos dorados; las tres cabezas son correctas en 450, y los 10 fallos restantes corresponden a un relleno fuera de los aceptados.

## Requisitos de hardware

- VRAM estimada: el modelo int8 ocupa 389 MB en disco y requiere del orden de 0,5 GB de memoria en ejecución; la exportación fp32 ocupa 1,2 GB y necesita aproximadamente 1,5 GB.
- GPU recomendadas: no son necesarias; el modelo está pensado para CPU. Cualquier GPU con soporte de ONNX Runtime (T4, L4, A10, RTX 4090) puede ejecutarlo, pero el autor reporta latencias en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; en CPU se han medido 48 ms p50 con cuatro hilos en una VM de 4 vCPU con AVX-512 VNNI y AMX.
- Opciones de despliegue: ONNX Runtime 1.32.0 o superior con `onnxruntime`, `tokenizers` y `numpy`; el repositorio incluye `inference_example.py`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 106 ms p50 y 158 ms p95 con un hilo; 48 ms p50 y 73 ms p95 con cuatro hilos. El throughput no se publica, pero con estas latencias un solo proceso puede atender varias llamadas concurrentes si se paraleliza por hilos.
- Advertencia de runtime: con ONNX Runtime 1.30.0 el modelo int8 devolvía logits distintos para la misma entrada en el 14% de las llamadas con cuatro hilos; es obligatorio usar 1.32.0 o superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Youbiquitous/turn-classifier-mmbert-v1 (2.0.0) | no disponible (base mmBERT-base) | 512 tokens | Clasificación de turno, floor claim, addressee y frases | MIT | Hugging Face, ONNX int8/fp32 |
| Youbiquitous/turn-classifier-mmbert-v1 (1.1.1) | no disponible | 512 tokens | Clasificación de turno y call_intent, sin opciones de frase | MIT | Hugging Face, tag `v1.1.1` |
| Detectores de actividad de voz (VAD) clásicos | no aplica | no aplica | Detección de voz por energía espectral | Variable | Amplia |
| Clasificadores de fin de turno basados en prosodia | no disponible | no disponible | Predicción de fin de turno a partir de audio | no disponible | no disponible |

La comparación con alternativas de la misma categoría (clasificadores semánticos de *turn-taking* multilingües) no está disponible en la información proporcionada. Frente a un VAD clásico, la diferencia cualitativa es que este modelo incorpora el contenido semántico del historial y la transcripción, no solo la energía de la señal.

## Limitaciones y advertencias

- Solo cubre cinco idiomas, y la mayoría de los casos dorados y difíciles son en italiano; el rendimiento en español, francés y alemán puede ser inferior al reportado.
- Un turno que termina con una frase clara seguida del inicio de otra ("... zero, seven. Flight A") puede clasificarse erróneamente como completo.
- La model card está truncada en el apartado de limitaciones; no se detallan el resto de restricciones conocidas.
- Los casos dorados son un conjunto de regresión, no una puerta al 100%: 17 de 457 fallan en la versión int8, con 2 falsos COMPLETE, 2 falsos INCOMPLETE, 3 errores de addressee y 10 fallos de relleno.
- La evaluación se ha realizado sobre particiones sintéticas, no sobre tráfico telefónico real; el rendimiento en producción puede degradarse por ruido acústico, errores del ASR o solapamientos.
- La decisión de frase tiene menor paridad int8/fp32 (88,5% de coincidencia con PyTorch), por lo que el relleno elegido puede variar entre versiones.
- El modelo no genera texto ni razona: cualquier comportamiento conversacional debe implementarse en el orquestador que consume sus salidas.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base `jhu-clsp/mmBERT-base`.
- Dependencia estricta de ONNX Runtime 1.32.0 o superior; versiones anteriores producen resultados no deterministas en int8.
- El tamaño del repositorio (8,8 GB) incluye todas las releases y checkpoints de entrenamiento, lo que puede complicar el despliegue en entornos con almacenamiento limitado; conviene descargar solo el tag necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youbiquitous/turn-classifier-mmbert-v1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Repositorio de Tokenizers: https://github.com/huggingface/tokenizers
