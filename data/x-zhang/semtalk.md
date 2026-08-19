# X-Zhang/SemTalk

## Resumen

SemTalk es un modelo de generación de gestos co-speech (movimiento corporal sincronizado con el habla) presentado en ICCV 2025 por un equipo de investigadores liderado por Xiangyue Zhang. Su propuesta principal es un enfoque semántico a nivel de frame: en lugar de tratar todos los instantes del habla por igual, el modelo enfatiza los momentos de mayor carga semántica (por ejemplo, palabras o frases clave) para producir movimientos más expresivos y coherentes con el contenido del discurso.

El modelo genera movimiento holístico del cuerpo humano, incluyendo torso, brazos, manos y expresiones faciales, representado mediante el formato SMPL-X. Está entrenado sobre el dataset BEAT2, que contiene grabaciones de habla y movimiento de múltiples hablantes. Se publican dos conjuntos de pesos: uno correspondiente al protocolo del paper (un solo hablante) y otro entrenado sobre 25 hablantes en inglés. No se especifican el número de parámetros, la arquitectura interna ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (usa representacion SMPL-X para el cuerpo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset BEAT2 es en ingles) |
| Licencia | other (sin detalle; se remite a los terminos de los autores y de terceros) |
| Formato de pesos | PyTorch (archivos .zip con checkpoints; formato interno no especificado) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo (tipo de red, atencion, etc.). Se sabe que SemTalk genera movimiento humano completo en formato SMPL-X a partir de audio de habla, y que incorpora un mecanismo de enfasis semantico por frame para ponderar la importancia de cada instante temporal. El entrenamiento se realiza sobre el dataset BEAT2, que incluye grabaciones de multiples hablantes con movimiento capturado. El repositorio proporciona dos protocolos de entrenamiento: uno con un solo hablante (protocolo del paper) y otro con 25 hablantes en ingles. No se mencionan tecnicas como RLHF o DPO, ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de gestos co-speech: produce movimientos corporales sincronizados con el audio de habla de entrada.
- Movimiento holistico: genera articulaciones del cuerpo completo, incluyendo manos y expresiones faciales, representadas mediante SMPL-X.
- Enfasis semantico a nivel de frame: el modelo pondera los instantes con mayor carga semantica del discurso, mejorando la expresividad de los gestos.
- Soporte multi-hablante: el checkpoint entrenado con 25 hablantes permite generar gestos para diferentes voces sin reentrenamiento.
- No se indican capacidades de tool calling, agentes, vision, audio ni otros modos adicionales.

## Casos de uso

- Animacion de avatares virtuales en tiempo real: SemTalk puede alimentar sistemas de avatar que necesitan gestos naturales sincronizados con la voz del usuario, por ejemplo en entornos de realidad virtual o videoconferencia.
- Produccion de video y doblaje: al generar movimiento a partir de audio, puede usarse para animar personajes en peliculas o series dobladas, reduciendo el trabajo manual de animacion.
- Asistentes virtuales y robots sociales: integrar el modelo en sistemas de interaccion persona-maquina para que el agente acompanie su habla con gestos coherentes.
- Creacion de contenido para videojuegos: generar animaciones procedurales para personajes no jugadores (NPC) que reaccionan a dialogos o lineas de voz.
- Investigacion en linguistica y psicologia: estudiar la relacion entre el contenido semantico del habla y los gestos corporales, utilizando las salidas del modelo como hipotesis generativas.
- Herramientas de accesibilidad: generar avatares con lenguaje de signos o gestos de apoyo para personas con dificultades auditivas, partiendo del audio.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el repositorio, correspondientes a dos protocolos distintos:

| Protocolo | Hablantes | FGD ↓ | BC ↑ | DIV ↑ | MSE ↓ | LVD ↓ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Speaker 2 (paper) | 1 | 0.4278 | 0.7770 | 12.910 | 6.153e-8 | 6.938e-5 |
| Checkpoint all-speaker | 25 | 0.3556 | 0.5097 | 8.409 | 4.439e-8 | 1.435e-5 |

FGD (Fréchet Gesture Distance), BC (Beat Consistency), DIV (Diversity), MSE (Mean Squared Error) y LVD (Lower-body Velocity Difference) son metricas habituales en generacion de gestos. No se proporcionan comparaciones con otros modelos en esta informacion.

## Requisitos de hardware

No se especifican requisitos de hardware en la informacion disponible. Al tratarse de un modelo de generacion de movimiento basado en PyTorch, se recomienda consultar el repositorio de codigo para conocer los requisitos exactos de VRAM y GPU. Como referencia, modelos similares de generacion de gestos suelen requerir al menos 8-16 GB de VRAM para inferencia, pero este dato no esta confirmado para SemTalk.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de generacion de gestos co-speech en los materiales proporcionados. Se sugiere consultar el paper y la pagina del proyecto para posibles comparaciones con metodos previos.

## Limitaciones y advertencias

- La licencia es "other" y no se detalla; el repositorio indica que no se concede una nueva licencia y que los activos de terceros (codigo, BEAT2, SMPL-X, encoders preentrenados) estan sujetos a sus propios terminos. Es necesario revisar cada componente antes de un uso comercial.
- Los resultados reportados dependen del protocolo de entrenamiento; el checkpoint all-speaker no es directamente comparable con el protocolo del paper.
- No se especifican los idiomas soportados; el dataset BEAT2 es en ingles, por lo que el modelo puede no generalizar bien a otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo generativo de movimiento, puede producir gestos no naturales o incoherentes en ciertas entradas.
- No se indica el formato de pesos final (safetensors, bin, etc.), lo que puede complicar la integracion en pipelines estandar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/X-Zhang/SemTalk)
- [Paper en arXiv](https://arxiv.org/abs/2412.16563)
- [Pagina del proyecto](https://xiangyuezhang.com/SemTalk/)
- [Codigo en GitHub](https://github.com/Xiangyue-Zhang/SemTalk)
- [Version publicada en ICCV](https://doi.org/10.1109/ICCV51701.2025.01277)
- [Dataset de inferencia generado](https://huggingface.co/datasets/X-Zhang/SemTalk-Inference-Data)
