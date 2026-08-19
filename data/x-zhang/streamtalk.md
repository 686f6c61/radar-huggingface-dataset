# X-Zhang/StreamTalk

## Resumen

StreamTalk es un modelo de generación de gestos co-verbales (co-speech gesture generation) en streaming, desarrollado por X-Zhang (Xiangyue Zhang) y colaboradores. Su objetivo es producir animaciones 3D de un personaje (representado con SMPL-X) en tiempo real, clip a clip, mientras llega el audio del habla. El problema que resuelve es la deriva (drift) acumulativa que sufren los sistemas de streaming de bucle abierto: al no poder corregir la trayectoria generada, los errores pequeños se acumulan y degradan la calidad del movimiento en secuencias largas. StreamTalk introduce un ciclo de generar-recuperar-refinar (generate-retrieve-refine) con anclaje de poses clave, que cierra el bucle y mantiene la coherencia del gesto.

La arquitectura se basa en un modelo de difusión tipo transformer (DiffusionDITNetPartsFixedExpressions2PostNormInteraction2) con 71,17 millones de parámetros, entrenado sobre el dataset BEAT2 en inglés con classifier-free guidance (CFG). El repositorio de HuggingFace contiene checkpoints retrained con CFG, seleccionados mediante el protocolo de generación de StreamTalk y la métrica FGD (Fréchet Gesture Distance) de EMAGE/PantoMatrix. El modelo alcanza 76 FPS en tiempo real, lo que lo hace adecuado para aplicaciones interactivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionDITNetPartsFixedExpressions2PostNormInteraction2 (modelo de difusion basado en transformer) |
| Parametros totales | 71.167.501 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion de movimiento por clips, no texto) |
| Tipos de cuantizacion | no disponible (checkpoints en FP32) |
| Idiomas soportados | ingles (entrenado en BEAT2 English) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dictionaries (.pt, pickle) |

## Arquitectura y entrenamiento

StreamTalk emplea un modelo de difusion con arquitectura basada en transformer (DIT) que procesa secuencias de movimiento y audio. La innovacion principal es el ciclo generate-retrieve-refine: en cada limite de clip, el modelo genera un segmento de movimiento, recupera poses clave de una base de datos (BEAT2 retrieval database) y refina la salida para corregir la deriva. Durante el entrenamiento se aplica Stochastic Anchor Masking (SAM), que oculta aleatoriamente frames de pose y traslacion para que el modelo aprenda a reconstruir el movimiento completo a partir de pistas de contorno escasas. Esto permite que el modelo aproveche eficazmente las poses clave recuperadas.

Los checkpoints publicados en HuggingFace son retrained sobre BEAT2 English con classifier-free condition dropout, y se seleccionaron usando el protocolo de generacion de StreamTalk y la metrica FGD acelerada de EMAGE/PantoMatrix. El entrenamiento se realizo con hardware H200, BF16, CUDA Graphs y cuatro GPUs, aunque estas elecciones no estan codificadas en los archivos de pesos. Los checkpoints contienen 407 tensores FP32 en CPU y cargan estrictamente en el esquema original del modelo StreamTalk.

## Capacidades

- Generacion de gestos co-verbales en 3D (SMPL-X) en tiempo real, incluyendo movimiento de cuerpo, manos y expresiones faciales (segun el nombre del modelo, que menciona "FixedExpressions" y "PostNorm").
- Correccion de deriva en secuencias largas mediante el ciclo generate-retrieve-refine con anclaje de poses clave.
- Soporte para multiples hablantes: los checkpoints incluyen variantes para "speaker2" (un hablante especifico) y "all speakers" (todos los hablantes del dataset).
- Generacion en streaming, clip a clip, compatible con entrada de audio incremental.
- No incluye capacidades de texto, codigo, vision ni tool calling; es un modelo especializado en movimiento.

## Casos de uso

- Avatares virtuales en videoconferencias: el modelo puede animar un avatar 3D en tiempo real mientras el usuario habla, mejorando la presencia y la comunicacion no verbal en entornos remotos.
- Produccion de medios y animacion: los creadores pueden generar gestos realistas para personajes 3D a partir de dialogos grabados, reduciendo el trabajo manual de animacion.
- Robots sociales y asistentes fisicos: integrar StreamTalk en un robot humanoide permite que este acompanie el habla con gestos naturales, mejorando la interaccion humano-robot.
- Realidad virtual y aumentada: en entornos inmersivos, los avatares controlados por voz pueden gesticular de forma coherente, aumentando la sensacion de presencia.
- Investigacion en interaccion humano-computadora: el modelo sirve como base para estudiar la relacion entre habla y gesto, y para comparar metricas de calidad de movimiento.
- Generacion de contenido para videojuegos: los personajes no jugables (NPC) pueden reaccionar con gestos apropiados al dialogo del jugador en tiempo real.

## Benchmarks y rendimiento

La model card reporta metricas FGD aceleradas (EMAGE/PantoMatrix AESK FGD) para los dos checkpoints retrained, con CFG=3:

| Checkpoint | Epoch | Speaker2 FGD | All FGD |
|---|---|---|---|
| `streamtalk_speaker2_combined_e0946_cfg3.pt` | 946 | 0.378879 | 0.250287 |
| `streamtalk_speaker_all_e0940_cfg3.pt` | 940 | 0.424477 | 0.217672 |

Se indica que son mediciones aceleradas, no exactas del paper, y que se uso una tolerancia de 1e-3 para comparaciones de ingenieria. Los valores finales con CFG=3 no han sido aceptados contra un oraculo directo B=1/M=1/full-window. Las metricas BC (beat consistency) y DIV (diversity) no han sido re-evaluadas para estos checkpoints. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Los checkpoints del generador son FP32 y ocupan aproximadamente 284 MB (71M parametros × 4 bytes), pero la inferencia completa requiere ademas WavLM Large, el modelo `SimpleSpeechModel`, SMPL-X neutral y la base de datos de recuperacion BEAT2, lo que incrementa sustancialmente los requisitos de memoria.
- No se especifican requisitos exactos de VRAM en la informacion proporcionada. Dado que el paper reporta 76 FPS en tiempo real, se asume que puede ejecutarse en GPUs de gama alta para consumidores (p. ej., RTX 3090/4090) o en GPUs de datacenter (A100, H200) con suficiente memoria para los modelos auxiliares.
- El entrenamiento se realizo con H200, BF16, CUDA Graphs y cuatro GPUs, pero esto no es necesario para inferencia.
- Opciones de despliegue: no se mencionan frameworks especificos (vLLM, llama.cpp, etc.). Al ser un modelo PyTorch, se puede servir con scripts personalizados o con herramientas de inferencia de PyTorch. La inferencia requiere cargar los checkpoints con verificacion SHA256.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de generacion de gestos en la documentacion proporcionada. El paper menciona que StreamTalk supera a los baselines de bucle abierto en FGD y reduce la deriva en secuencias largas, pero no se listan nombres concretos de modelos comparables en los materiales disponibles.

## Limitaciones y advertencias

- Los checkpoints publicados son retrained, no los originales del paper, y las metricas FGD reportadas son aceleradas, no exactas del oraculo. BC y DIV no han sido re-evaluadas.
- Los archivos de pesos usan pickle internamente, lo que implica un riesgo de seguridad si se cargan archivos de fuentes no confiables. Se recomienda verificar las descargas con el script `verify_pretrained.py` y los valores SHA256 publicados.
- El modelo esta entrenado exclusivamente en ingles (BEAT2 English); puede no generalizar bien a otros idiomas o acentos.
- No se documentan sesgos especificos, pero el dataset BEAT2 puede reflejar sesgos culturales en los gestos.
- La licencia MIT permite uso comercial, pero el dataset BEAT2 puede tener sus propias restricciones de uso; se debe revisar la licencia del dataset antes de un despliegue en produccion.
- La inferencia requiere multiples componentes adicionales (WavLM Large, SimpleSpeechModel, SMPL-X, base de datos BEAT2), lo que complica el despliegue y aumenta la latencia total.

## Enlaces

- HuggingFace: https://huggingface.co/X-Zhang/StreamTalk
- Paper (arXiv): https://arxiv.org/abs/2608.01643
- PDF del paper: https://arxiv.org/pdf/2608.01643
- Sitio web del proyecto: https://xiangyuezhang.com/StreamTalk/
- Semantic Scholar: https://www.semanticscholar.org/paper/7b9fdec2f5d915b72840a7859e4381b67140e8dc
