# X-Zhang/GlobalDiff

## Resumen

GlobalDiff es un modelo de generación de gestos co-speech (movimientos corporales sincronizados con el habla) basado en difusión, presentado en AAAI 2026 por investigadores de la Universidad de Ciencia y Tecnología de China (Xiangyue Zhang, Jianfang Li, Jianqiang Ren y Jiaxu Zhang). El modelo aborda específicamente el problema de la acumulación de errores en la generación de movimientos de largo horizonte, una limitación crítica en aplicaciones de animación de avatares y personajes virtuales donde las secuencias de gestos deben mantenerse coherentes durante minutos.

La propuesta combina un VAE de rotación global con un modelo de difusión y restricciones multinivel para mitigar la deriva acumulativa que sufren los métodos autoregresivos o de difusión convencional cuando generan secuencias largas. Los checkpoints oficiales se distribuyen a través de Hugging Face, con pesos en formato PyTorch y componentes separados (VAE, modelo de habla y assets de evaluación). El modelo se entrenó sobre el dataset BEAT2 y utiliza SMPL-X como representación del cuerpo.

La relevancia de GlobalDiff radica en que ofrece una solución práctica para la generación de gestos coherentes en entornos de producción, donde las secuencias suelen superar los 30 segundos y los métodos previos degradan visiblemente su calidad. Su publicación en AAAI 2026 y la disponibilidad de código y pesos lo convierten en una referencia para investigadores y desarrolladores de sistemas de animación procedural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (modelo de difusion global de rotacion) + VAE de rotacion global, con restricciones multinivel |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (orientado a generacion de secuencias largas, sin especificar ventana) |
| Tipos de cuantizacion | no disponible (pesos en float32 por defecto, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el dataset BEAT2 es multilingue, pero no se especifican idiomas concretos) |
| Licencia | other (sin licencia nueva otorgada; codigo, BEAT2, SMPL-X y otros assets sujetos a sus respectivos terminos) |
| Formato de pesos | PyTorch (.pt, .zip, .bin) |

## Arquitectura y entrenamiento

GlobalDiff se basa en un esquema de difusion aplicado a la rotacion global del cuerpo, complementado con un VAE (MaskedVAE2 y MaskedVAE3) que comprime la representacion de movimiento en un espacio latente. El modelo de difusion opera sobre este espacio latente para generar secuencias de gestos condicionadas por el habla. La innovacion principal es el uso de "restricciones multinivel" que penalizan la desviacion del movimiento generado respecto a las restricciones cinematicas y de contacto, evitando la acumulacion de errores en horizontes largos.

El entrenamiento se realizo sobre el dataset BEAT2 (H-Liu1997/BEAT2), que contiene capturas de movimiento y audio de hablantes en varios idiomas. No se han publicado detalles sobre el numero de tokens, composicion exacta del dataset o si se aplicaron tecnicas de RLHF o DPO. El componente de habla se gestiona mediante un modelo de voz (SimpleSpeechModel) y se incluye un asset de evaluacion (AESKConv_240_100.bin) que probablemente corresponde a un encoder preentrenado para metricas de evaluacion. La arquitectura exacta de los bloques de difusion y VAE no se especifica en la informacion disponible.

## Capacidades

- Generacion de gestos co-speech: produce movimientos corporales (manos, brazos, cabeza, torso) sincronizados con el habla de entrada.
- Generacion de movimiento de largo horizonte: disenado para secuencias largas sin degradacion progresiva, gracias a la difusion global de rotacion y las restricciones multinivel.
- Representacion SMPL-X: los movimientos se generan en el espacio de parametros SMPL-X, compatible con pipelines de animacion estandar.
- Condicionamiento por habla: el modelo toma audio como entrada y genera la secuencia de movimiento correspondiente.
- No se mencionan capacidades de tool calling, agentes, vision, audio (mas alla del habla como entrada) ni razonamiento multimodal.

## Casos de uso

- Animacion procedural de avatares para videojuegos: GlobalDiff puede generar gestos naturales para personajes no jugadores (NPC) durante dialogos, manteniendo coherencia en conversaciones largas sin necesidad de captura de movimiento manual.
- Produccion de contenido virtual para redes sociales: creadores pueden generar avatares que gesticulen de forma realista al narrar guiones, reduciendo el tiempo de animacion.
- Simulacion de reuniones virtuales: en entornos de teletrabajo inmersivo, el modelo puede animar representaciones de participantes basandose en su discurso, mejorando la comunicacion no verbal.
- Desarrollo de asistentes virtuales con presencia fisica: robots o personajes 3D que necesitan gesticular mientras hablan, con sesiones de interaccion prolongadas donde la estabilidad del movimiento es critica.
- Investigacion en interaccion humano-computadora: permite estudiar el efecto de gestos generados automaticamente en la percepcion de la comunicacion, usando secuencias controladas y reproducibles.
- Doblaje y localizacion de contenido animado: al cambiar el audio de un personaje, GlobalDiff puede regenerar los gestos para que coincidan con el nuevo idioma o emocion, manteniendo la naturalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de AAAI 2026 (doi:10.1609/aaai.v40i15.38281) podria incluir metricas como FGD (Frchet Gesture Distance), diversidad o calidad de movimiento, pero no estan disponibles en la model card ni en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no especificarse el tamano del modelo ni la cuantizacion, no es posible estimar los requisitos de memoria.
- GPU recomendadas: no disponible. Dependiendo del tamano de los VAE y el modelo de difusion, probablemente se necesite una GPU con al menos 8-16 GB de VRAM, pero no se confirma.
- Compatibilidad con GPU consumer: no confirmada. Dado que los pesos estan en formato PyTorch, podria ejecutarse en GPUs como RTX 3090/4090 si el modelo cabe en memoria, pero no hay datos.
- Opciones de despliegue: el repositorio oficial (github.com/Xiangyue-Zhang/GlobalDiff) incluye scripts de inferencia; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de generacion de gestos co-speech (como TalkSHOW, DiffGesture, etc.) en terminos de parametros, contexto o rendimiento. La model card no incluye datos comparativos ni referencias a modelos alternativos.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero el entrenamiento sobre BEAT2 puede introducir sesgos culturales en los gestos (p.ej., predominancia de gestos de hablantes occidentales o asiaticos segun la composicion del dataset).
- Riesgo de alucinacion: en generacion de movimiento, puede producir gestos poco naturales o incoherentes en entradas de audio atipicas (ruido, silencios prolongados, idiomas no representados).
- Limitaciones de contexto: aunque esta disenado para secuencias largas, no se especifica la duracion maxima soportada; podria degradarse mas alla de un limite no documentado.
- Restricciones de licencia: la licencia "other" no otorga derechos adicionales; el codigo, BEAT2, SMPL-X y los encoders preentrenados tienen sus propias licencias que pueden restringir el uso comercial.
- Produccion: no hay informacion sobre robustez en entornos reales, latencia de inferencia ni soporte de la comunidad; el modelo parece orientado a investigacion mas que a despliegue masivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/X-Zhang/GlobalDiff
- Articulo en arXiv: https://arxiv.org/abs/2511.10076
- Pagina del articulo en Hugging Face: https://huggingface.co/papers/2511.10076
- Pagina del proyecto: https://xiangyuezhang.com/GlobalDiff/
- Repositorio de codigo: https://github.com/Xiangyue-Zhang/GlobalDiff
- Version publicada (DOI): https://doi.org/10.1609/aaai.v40i15.38281
- Datos de inferencia generados: https://huggingface.co/datasets/X-Zhang/GlobalDiff-Inference-Data
- Dataset BEAT2: https://huggingface.co/datasets/H-Liu1997/BEAT2
