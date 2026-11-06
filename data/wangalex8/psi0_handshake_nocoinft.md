# WangAlex8/Psi0_handshake_nocoinFT

## Resumen

Ψ₀ (Psi-Zero) es un modelo fundacional de visión-lenguaje-acción (VLA) orientado a la locomoción y manipulación de robots humanoides. Lo desarrolla el Physical Superintelligence Lab, y su objetivo es resolver tareas de *loco-manipulation* (desplazarse y manipular objetos simultáneamente) en entidades humanoides, un problema que los autores consideran mal abordado por las estrategias habituales de co-entrenamiento con datos humanos y de robots mezclados. La propuesta es aprender primero semántica de tarea y representación visual a partir de vídeos egocéntricos humanos a gran escala, y después hacer un post-entrenamiento sobre una cantidad menor de datos teleoperados reales de robot.

El repositorio de Hugging Face `WangAlex8/Psi0_handshake_nocoinFT` parece ser una variante o *fine-tune* del modelo Ψ₀, con un tamaño de 61,1 GB en formato safetensors y licencia MIT. El sufijo "handshake_nocoinFT" sugiere un ajuste específico para una tarea concreta de interacción (apretón de manos) sin *fine-tuning* de monedas, aunque esta interpretación no está confirmada en la información disponible. No se especifican parámetros, contexto ni idiomas en la model card, que está prácticamente vacía.

La relevancia actual del modelo radica en que los VLA para humanoides son una línea de investigación muy activa, y Ψ₀ se presenta como un modelo fundacional abierto con licencia permisiva, lo que facilita su uso en investigación y desarrollo de robótica. Sin embargo, la ficha de Hugging Face carece de datos técnicos detallados, por lo que muchas especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) para humanoides; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 61,1 GB |
| Pipeline | no disponible |
| Region | US |

## Arquitectura y entrenamiento

Según la información pública del proyecto Ψ₀, la arquitectura es un modelo de visión-lenguaje-acción (VLA) para manipulación diestra y locomoción de humanoides. El entrenamiento se plantea en dos fases: primero, aprendizaje de semántica de tarea y representación visual a partir de vídeos egocéntricos humanos a gran escala; después, post-entrenamiento sobre una cantidad menor de datos teleoperados reales de robot para aprender la dinámica general del cuerpo humanoide. Los autores argumentan que el co-entrenamiento directo con datos humanos y de humanoides mezclados es subóptimo por diferencias cinemáticas y de movimiento fundamentales.

No se dispone de datos sobre el número de tokens, composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) en la información proporcionada. La model card del repositorio de Hugging Face no incluye detalles de arquitectura ni de entrenamiento, y el README es prácticamente vacío.

## Capacidades

- Control de robots humanoides para tareas de locomoción y manipulación (loco-manipulation).
- Percepción visual y comprensión semántica de tareas a partir de instrucciones en lenguaje natural, al ser un modelo VLA.
- Ejecución de políticas de acción sobre datos teleoperados reales, tras el post-entrenamiento.
- Posible especialización en interacción física concreta (apretón de manos) en esta variante, según el nombre del repositorio, aunque no está confirmado.
- No se dispone de información sobre soporte de tool calling, agentes, multi-step reasoning ni capacidades multilingües.
- No se dispone de información sobre modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Investigación en robótica humanoide: uso del modelo como base para experimentos de loco-manipulation en laboratorio, aprovechando su licencia MIT y su enfoque en datos humanos egocéntricos.
- Desarrollo de políticas de manipulación diestra: el modelo puede post-entrenarse con datos teleoperados específicos para tareas como agarrar, mover o ensamblar objetos.
- Interacción físico-social: la variante "handshake" sugiere aplicaciones de apretón de manos o interacción cercana con humanos, útil en recepción o asistencia.
- Prototipado de asistentes humanoides: integración en plataformas de investigación para evaluar la generalización a nuevas tareas de locomoción y manipulación.
- Generación de datos sintéticos o aumentación: el modelo puede emplearse para generar trayectorias o comportamientos en entornos simulados antes de transferir a real.
- Educación y divulgación: al ser un modelo abierto, sirve para cursos y talleres sobre VLA y robótica humanoide.
- Benchmarking de investigación: comparar el rendimiento de políticas VLA en tareas de interacción física con humanoides.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de 61,1 GB en safetensors sugiere que la inferencia en precisión completa requiere al menos ~61 GB de VRAM, probablemente más para activaciones y contexto.
- GPU recomendadas: para pesos completos, se necesitarían GPUs de数据中心 como A100 80 GB o H100; no se dispone de datos oficiales.
- ¿Cabe en GPU de consumo? No es probable en precisión completa; podría requerir cuantización, pero no se dispone de formatos GGUF ni cuantizaciones publicadas.
- Opciones de despliegue: no se dispone de información sobre vLLL, llama.cpp, Ollama o TGI para este modelo; al ser un VLA, el despliegue típico sería mediante frameworks de robótica (ROS, PyTorch) no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas (parámetros, contexto, rendimiento). Se indica "no disponible".

## Limitaciones y advertencias

- La model card está vacía y no se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma.
- Licencia MIT permite uso comercial, pero al ser un modelo de robótica, el despliegue en entornos reales conlleva riesgos físicos y de seguridad no evaluados en la información disponible.
- El tamaño del repositorio (61,1 GB) implica requisitos de hardware elevados y posible dificultad de despliegue en entornos con recursos limitados.
- No se dispone de información sobre el proceso de entrenamiento, datos utilizados ni evaluación, lo que impide valorar su robustez y generalización.
- La variante "handshake_nocoinFT" sugiere una especialización muy concreta; su rendimiento en tareas generales es desconocido.
- No hay información sobre idiomas soportados, por lo que no se puede garantizar el funcionamiento en castellano u otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/WangAlex8/Psi0_handshake_nocoinFT
- Página del proyecto Ψ₀: https://psi-lab.ai/Psi0/
- Repositorio GitHub: https://github.com/physical-superintelligence-lab/Psi0
