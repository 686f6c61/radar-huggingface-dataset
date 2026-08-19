# X-Zhang/EchoMask

## Resumen

EchoMask es un modelo de generación de gestos co-verbales (co-speech gesture generation) presentado en ACM Multimedia 2025 por un equipo de investigadores liderado por Xiangyue Zhang. Su objetivo es producir movimientos holísticos del cuerpo —incluyendo torso, brazos, manos y expresiones faciales— sincronizados con el habla de entrada, un problema clásico en animación de avatares y agentes virtuales. El modelo emplea un enfoque de modelado enmascarado con atención consultada por el habla (speech-queried attention), lo que permite capturar relaciones temporales entre el audio y el movimiento de forma más eficaz que los métodos puramente autoregresivos o generativos previos.

El modelo se apoya en el dataset BEAT2 (H-Liu1997/BEAT2) y utiliza la representación paramétrica SMPL-X para codificar la morfología corporal completa. Se publican dos conjuntos de pesos: uno entrenado bajo el protocolo del paper (un único hablante, Speaker 2) y otro entrenado con 25 hablantes ingleses de BEAT2. Aunque no se detalla el número de parámetros ni la arquitectura interna exacta, el nombre y la descripción indican un transformer con mecanismos de atención cruzada entre habla y movimiento. La relevancia actual del modelo radica en su capacidad para generar gestos naturales y diversos, una tarea que sigue siendo difícil por la ambigüedad entre señal acústica y movimiento corporal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención consultada por habla y modelado enmascarado (masked modeling) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generación de movimiento, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (datos de BEAT2 en inglés) |
| Licencia | other (sin licencia específica; activos de terceros mantienen sus términos) |
| Formato de pesos | PyTorch (checkpoints en archivos zip, formato exacto no especificado) |

## Arquitectura y entrenamiento

EchoMask se basa en un enfoque de modelado enmascarado (masked modeling) combinado con mecanismos de atención que toman el habla como consulta. En lugar de predecir el movimiento de forma autoregresiva, el modelo enmascara partes de la secuencia de movimiento y las reconstruye condicionado por el audio de entrada, lo que favorece el aprendizaje de representaciones temporales robustas. La representación del cuerpo se realiza mediante SMPL-X, que incluye parámetros de pose global, articulaciones, manos y expresiones faciales, permitiendo generar gestos holísticos.

El entrenamiento se realiza sobre el dataset BEAT2, que contiene grabaciones de habla y movimiento de múltiples hablantes. Se publican dos protocolos de entrenamiento: el protocolo del paper (Speaker 2, un único hablante) y un protocolo ampliado con 25 hablantes ingleses. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. Tampoco se detalla el número de capas, dimensiones ocultas o cabezas de atención.

## Capacidades

- Generación de gestos co-verbales holísticos: movimientos sincronizados de torso, brazos, manos y expresiones faciales a partir de audio de habla.
- Modelado enmascarado: capacidad de completar segmentos de movimiento faltantes condicionados por el contexto de habla.
- Generación diversa: el modelo produce variaciones de gestos para una misma entrada de audio, como reflejan las métricas de diversidad reportadas.
- Soporte de múltiples hablantes: el checkpoint de 25 hablantes permite generar gestos con diferentes estilos y características individuales.
- No es un modelo de lenguaje: no ofrece generación de texto, tool calling, razonamiento simbólico ni capacidades de agente.

## Casos de uso

- Animación de avatares en tiempo real: el modelo puede alimentar personajes virtuales en videojuegos, entornos de realidad virtual o plataformas de metaverso, generando gestos naturales a partir de la voz del usuario.
- Doblaje y narración automatizada: al sincronizar gestos con locuciones, es posible crear contenido animado para audiolibros, podcasts o vídeos explicativos sin intervención manual de animadores.
- Comunicación aumentativa y alternativa: personas con dificultades del habla podrían utilizar el modelo para generar gestos que acompañen a sistemas de voz sintetizada, mejorando la expresividad de la comunicación.
- Investigación en interacción persona-ordenador: el modelo sirve como herramienta para estudiar cómo los gestos afectan la percepción de agentes virtuales en estudios de usabilidad o psicología experimental.
- Producción de animación para cine y publicidad: los estudios pueden generar movimientos preliminares de personajes a partir de guiones hablados, reduciendo costes en fases de previsualización.
- Entrenamiento de agentes virtuales en simulaciones: en entornos de formación (por ejemplo, atención al cliente o presentaciones), el modelo puede dotar de gestos realistas a agentes simulados para mejorar la práctica de habilidades comunicativas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para los dos checkpoints publicados. Las métricas son: FGD (Fréchet Gesture Distance, menor es mejor), BC (Beat Consistency, mayor es mejor), DIV (Diversity, mayor es mejor), MSE (Mean Squared Error, menor es mejor) y LVD (Local Velocity Difference, menor es mejor).

| Protocolo | Hablantes | FGD ↓ | BC ↑ | DIV ↑ | MSE ↓ | LVD ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Speaker 2 (paper) | 1 | 0.4623 | 0.7738 | 13.370 | 6.761e-8 | 7.290e-5 |
| Checkpoint all-speaker | 25 | 0.5656 | 0.4951 | 9.299 | 4.700e-8 | 6.090e-5 |

No se han publicado comparaciones con otros modelos de generación de gestos en la información disponible. Los dos protocolos no son directamente comparables entre sí, ya que difieren en el número de hablantes y en las condiciones de entrenamiento.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. Al ser un modelo de generación de movimiento basado en PyTorch y entrenado con SMPL-X, es probable que requiera una GPU con suficiente memoria para procesar secuencias de parámetros corporales, pero no se especifican valores concretos de VRAM, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia o throughput. Se recomienda consultar el repositorio de código oficial para obtener detalles de instalación y configuración.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras propuestas de generación de gestos co-verbales como DiffGesture, TalkSHOW o GestureDiffusion. No se pueden aportar datos objetivos de comparación sin inventar cifras.

## Limitaciones y advertencias

- Entrenamiento limitado al inglés: los datos de BEAT2 son exclusivamente en inglés, por lo que el modelo puede no generalizar bien a otros idiomas o contextos culturales con gestos diferentes.
- Sesgos en los datos: BEAT2 contiene grabaciones de un conjunto concreto de hablantes, lo que puede introducir sesgos de género, edad o estilo gestual en las salidas.
- Riesgo de gestos no naturales: como todo modelo generativo, puede producir movimientos incoherentes o poco plausibles, especialmente con entradas de audio atípicas o fuera de distribución.
- Licencia restrictiva: la licencia se indica como "other", sin especificar términos claros. Los activos de terceros (BEAT2, SMPL-X, codificadores preentrenados, código) tienen sus propias licencias que deben revisarse antes de cualquier uso comercial.
- Protocolos de entrenamiento diferentes: los dos checkpoints publicados no son intercambiables; usan protocolos distintos y sus resultados no deben compararse directamente.
- Sin soporte de producción: el modelo está orientado a investigación; no se documentan mecanismos de inferencia optimizada, batching, ni integración con frameworks de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/X-Zhang/EchoMask
- Paper en arXiv: https://arxiv.org/abs/2504.09209
- Página del proyecto: https://xiangyuezhang.com/EchoMask/
- Código fuente: https://github.com/Xiangyue-Zhang/EchoMask
- Versión publicada (DOI): https://doi.org/10.1145/3746027.3754847
- Datos de inferencia generados: https://huggingface.co/datasets/X-Zhang/EchoMask-Inference-Data
