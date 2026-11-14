# xixibuxixi/StatePlay-Mixed-SF3-KOF98-Visual-Only-RL

## Resumen

StatePlay Mixed SF3 + KOF98 Visual-Only RL es un conjunto de pesos LoRA publicado por el usuario xixibuxixi en Hugging Face, resultado de un experimento de aprendizaje por refuerzo (RL) de una sola etapa centrado exclusivamente en la vertiente visual de un sistema de generación de vídeo orientado a videojuegos de lucha. El modelo parte de forma independiente de un "Base SFT" compartido y actualiza únicamente los adaptadores LoRA visuales, con un total de 47.185.920 parámetros entrenables distribuidos en 480 tensores.

El entrenamiento se realizó con una función de recompensa compuesta que pondera en un 60 % la mecánica del juego y en un 40 % la calidad visual, e incorpora un filtro de guarda de mecanismos ("mechanism guard filtering"). En el momento de la instantánea, el optimizador había completado 58 pasos y el cursor de condiciones alcanzaba 656. El repositorio ocupa 0,2 GB y contiene exclusivamente pesos en formato safetensors.

Se trata de un artefacto muy específico y de nicho: no es un modelo de lenguaje ni un generador de vídeo autónomo, sino un delta de pesos que debe cargarse junto al Base SFT correspondiente y el `transition_tokenizer.pt` para funcionar. Su interés reside en documentar un pipeline de RL aplicado a la generación visual de transiciones en juegos de lucha (Street Fighter III y The King of Fighters '98), no en su uso como modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores LoRA sobre un modelo base de generación de vídeo no especificado) |
| Parámetros totales | 47.185.920 parámetros entrenables (480 tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo pesos, sin estado del optimizador ni RNG) |

## Arquitectura y entrenamiento

El artefacto es una unión de parámetros aprendidos ("learned-parameter union") en formato safetensors que actualiza exclusivamente los LoRA visuales de un modelo base de generación de vídeo. No se documenta en la información disponible la arquitectura del modelo subyacente (transformer, difusión, híbrida, etc.), su tamaño total ni el número de tokens de entrenamiento del SFT previo. El autor indica que el experimento se inicializó de forma independiente respecto al Base SFT compartido, lo que sugiere una rama de RL separada que no hereda el estado del SFT más allá de los pesos congelados.

El entrenamiento consistió en una única etapa de RL con recompensa `0.6 * mechanics + 0.4 * visual_quality`, filtrado mediante "mechanism guard filtering" para penalizar o descartar transiciones que violen las reglas mecánicas del juego. En la instantánea publicada el optimizador había dado 58 pasos y el cursor de condiciones estaba en 656. Se incluyen dos hashes SHA256 de trazabilidad: el del SFT de origen (`d22492703ed233088108663955c2360b874f6c32dfe99ae18fe19dd8d4ab7077`) y el del checkpoint de entrenamiento congelado (`d85c26977f651eef7a8b9bb8c99079c1df56914531a95a94768aecb2ff034df3`). No se especifica si hubo RLHF, DPO ni ninguna otra técnica de alineación adicional.

## Capacidades

- Generación de transiciones visuales entre estados de juegos de lucha (Street Fighter III y The King of Fighters '98), según se deduce del nombre y de la función de recompensa.
- Aprendizaje por refuerzo con recompensa mixta que combina fidelidad mecánica y calidad visual.
- Filtrado de mecanismos ("mechanism guard filtering") para mantener la coherencia con las reglas del juego.
- Actualización selectiva de adaptadores LoRA visuales sobre un modelo base congelado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta soporte de "thinking mode", audio ni ninguna modalidad adicional.

## Casos de uso

- Investigación en RL para generación de vídeo: el artefacto sirve como referencia reproducible de un experimento de RL de una sola etapa con recompensa compuesta, útil para comparar curvas de aprendizaje y estrategias de filtrado de mecanismos.
- Reproducción de experimentos: cargando los pesos junto al Base SFT identificado por su SHA256 y el `transition_tokenizer.pt`, un investigador puede replicar el estado del optimizador en el paso 58 y continuar el entrenamiento.
- Estudio de recompensas multiobjetivo: la ponderación 0,6/0,4 entre mecánica y calidad visual es un caso concreto para analizar cómo se comporta el RL cuando prima la corrección funcional sobre la estética.
- Generación de animaciones de transición para juegos de lucha 2D: el modelo puede emplearse, dentro de su pipeline, para producir fotogramas intermedios entre poses o estados de los personajes.
- Prototipado de herramientas de asistencia a modders: un desarrollador de mods de SF3 o KOF98 podría usar el pipeline para generar transiciones coherentes con la mecánica del juego original.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura un delta LoRA con trazabilidad criptográfica (hashes de SFT y checkpoint) y convenciones de nombres de tensores preservadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El delta LoRA ocupa 0,2 GB, pero el requisito real depende del modelo base de generación de vídeo, que no se especifica.
- GPU recomendadas: no disponible, al desconocerse el modelo base.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados; el delta por sí solo no es suficiente para inferencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline requiere cargar el Base SFT y el `transition_tokenizer.pt` junto con los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StatePlay Mixed SF3 + KOF98 Visual-Only RL | 47.185.920 entrenables (LoRA) | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (RL sobre generación de vídeo para juegos de lucha) en la documentación proporcionada.

## Limitaciones y advertencias

- El artefacto no es autónomo: requiere el Base SFT correspondiente (identificado por SHA256) y el `transition_tokenizer.pt` para poder cargarse y ejecutarse.
- Solo contiene pesos aprendidos; no incluye estado del optimizador ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta sin reconstruir dicho estado.
- El entrenamiento estaba en un estadio muy temprano (58 pasos de optimizador), lo que hace previsible un rendimiento limitado y no validado.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de calidad; cualquier uso en producción exigiría una evaluación propia.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un delta sobre un modelo base, las condiciones finales dependen también de la licencia de dicho base, que no se especifica.
- El ámbito de aplicación es extremadamente estrecho (transiciones visuales en SF3 y KOF98); no debe esperarse generalización a otros juegos o dominios.
- No hay información sobre idiomas soportados ni sobre comportamiento multilingüe.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SF3-KOF98-Visual-Only-RL
