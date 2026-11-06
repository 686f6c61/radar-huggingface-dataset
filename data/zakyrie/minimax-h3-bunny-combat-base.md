# Zakyrie/minimax-h3-bunny-combat-base

## Resumen

MiniMax H3 Combat Base V2 es un LoRA (Low-Rank Adaptation) de movimiento para el modelo de generación de vídeo texto-a-vídeo MiniMax H3, desarrollado por el usuario Zakyrie y publicado originalmente en Civitai. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un adaptador de bajo rango que modifica el comportamiento del modelo base `minimax/h3` para especializarlo en secuencias de combate cuerpo a cuerpo realistas: golpes con inercia, reacciones acumulativas al daño, coreografías multitudinarias y colisiones con el entorno.

El adaptador resuelve un problema concreto de los modelos texto-a-vídeo generalistas: la tendencia a generar combates en bucle "ataque y reinicio", con oponentes que esperan turnos, anatomía que se pega al contacto y falta de consecuencias físicas persistentes entre fotogramas. La V2 se presenta como una reescritura arquitectónica respecto a la V1 que introduce cadenas de momento continuo, reacciones de daño acumulativas y puesta en escena cinematográfica de uno contra muchos.

El repositorio ocupa 0,2 GB, lo que es coherente con un LoRA y no con pesos completos, y se distribuye bajo la licencia comunitaria de MiniMax H3. Su relevancia es acotada: interesa a equipos de previsualización, animación y generación de vídeo que ya trabajen con MiniMax H3 y necesiten control fino sobre escenas de acción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el modelo base MiniMax H3 (texto-a-vídeo); arquitectura interna del base no disponible |
| Parametros totales | no disponible (repo de 0,2 GB, compatible con un adaptador de bajo rango) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | minimax-h3-community-license-agreement (enlace: platform.minimax.io/h3-license) |
| Formato de pesos | no disponible (repo de 0,2 GB; el autor no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de movimiento (motion LoRA) acoplado al modelo texto-a-vídeo MiniMax H3. El autor no publica detalles del rango, las capas objetivo ni el dataset de entrenamiento; la model card describe únicamente el comportamiento resultante: transición de bucles por turnos a cadenas de momento continuo, reacciones de daño que persisten entre fotogramas (inclinación del torso, guardia baja, tambaleo, movilidad reducida), patadas rotacionales, agarres sostenidos, caídas multifase y colisiones en tres etapas (personaje, entorno, escombros).

La V2 se presenta como una revisión arquitectónica mayor frente a la V1, con especial énfasis en la puesta en escena de uno contra muchos: temporización escalonada de los atacantes, control de carriles y cámaras de seguimiento centradas en el protagonista. También se documentan mejoras en escenas no combatientes, con cifras declaradas por el autor de +19,5 % en movimiento dentro de plano, +34,2 % en RMS de audio y +22,4 % en nitidez de bordes, si bien no se especifica la metodología de medición ni el conjunto de evaluación.

El adaptador se apoya en palabras de activación: `prfight1` o `prfight2` para combate general, `prfin1` para remates y `prslow1` para énfasis en cámara lenta, que según el autor requiere además instrucción explícita en el prompt. Se recomienda combinarlo con el LoRA complementario `Zakyrie/minimax-h3-bunny-motion-repair`, orientado a reparar continuidad y estabilizar trayectorias de armas.

## Capacidades

- Generación de vídeo texto-a-vídeo especializada en combate cuerpo a cuerpo, con control de la ejecución de las acciones mediante LoRA.
- Reacciones de daño acumulativas que persisten a lo largo de la secuencia y desembocan en remates.
- Coreografía de uno contra muchos con temporización escalonada de atacantes y control espacial.
- Colisiones con el entorno en tres etapas: personaje, mobiliario o props y escombros.
- Soporte de patadas rotacionales, agarres sostenidos, derribos, proyecciones y caídas multifase.
- Mejora declarada de presencia dramática en escenas sin combate (respiración, postura, continuidad interpretativa).
- Control de cámara lenta en el instante de impacto mediante activador más instrucción explícita en el prompt.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un adaptador generativo de vídeo, no un modelo de lenguaje.

## Casos de uso

- Previsualización de escenas de acción en producción audiovisual: el LoRA permite iterar sobre coreografías de pelea con inercia y consecuencias físicas antes de rodar, reduciendo el coste de los animáticos tradicionales.
- Diseño de secuencias de uno contra muchos: la puesta en escena escalonada y el control de carriles resultan útiles para planificar planos de grupo donde los atacantes no se congelan ni atacan por turnos.
- Generación de tráileres y teasers para videojuegos de lucha: el adaptador produce remates, impactos y colisiones con escombros aprovechables como material promocional o referencia de estilo.
- Storyboarding de escenas con destrucción de entorno: la colisión en tres etapas (personaje, mobiliario, escombros) sirve para explorar cómo se rompe un decorado durante una pelea.
- Creación de contenido para redes y demos técnicas: útil para ilustrar capacidades de generación de vídeo con acción dinámica en publicaciones o comparativas de herramientas.
- Pruebas de continuidad junto al LoRA Motion Repair: combinando ambos adaptadores se puede evaluar la estabilidad de trayectorias y la anatomía rotacional en secuencias largas, un escenario habitual en pipelines de animación asistida.
- Exploración de actuación dramática no combatiente: las mejoras declaradas en movimiento dentro de plano y nitidez permiten usarlo también para planos de presencia y postura, aunque su especialización principal es la acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de escenas no combatientes (+19,5 % de movimiento dentro de plano, +34,2 % de RMS de audio, +22,4 % de nitidez de bordes) sin especificar metodología, conjunto de evaluación ni comparación con la V1 o con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base MiniMax H3, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible. Al ser un LoRA de 0,2 GB, el coste adicional de memoria respecto al base es marginal, pero el grueso del requisito lo impone MiniMax H3.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer los requisitos del modelo base.
- Opciones de despliegue: no disponible. La librería declarada es `minimax-h3`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a texto, no aplicables a este pipeline de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Combat Base V2 (este) | LoRA de movimiento | minimax/h3 | Combate, impacto, remates, uno contra muchos | minimax-h3-community-license-agreement | Hugging Face y Civitai |
| Zakyrie/minimax-h3-bunny-motion-repair | LoRA de movimiento | minimax/h3 | Reparación de continuidad y estabilidad de trayectorias | no disponible | Hugging Face |
| MiniMax H3 (base) | Modelo texto-a-vídeo | — | Generación generalista de vídeo | minimax-h3-community-license-agreement | Hugging Face / MiniMax |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base MiniMax H3 y la librería `minimax-h3` para funcionar.
- El autor advierte de que el activador `prslow1` no garantiza cámara lenta por sí solo; hay que describir explícitamente el momento de impacto en el prompt.
- Regla de temporización documentada: si el combate y el diálogo comparten clip, el golpe debe completarse antes de que empiece la línea hablada; de lo contrario el modelo pierde momento y revierte a cámara lenta por defecto.
- El LoRA mejora cómo se ejecutan las acciones, pero no decide qué ocurre: el prompt debe especificar atacante, objetivo del golpe, reacción del oponente y transición al siguiente ataque.
- Riesgo de anatomía incorrecta, clipping o pegajosidad en contactos si no se combina con el LoRA Motion Repair recomendado.
- No hay información sobre sesgos, idiomas soportados ni evaluación independiente de calidad; las métricas reportadas proceden del propio autor.
- Licencia comunitaria de MiniMax H3: es necesario revisar el acuerdo antes de cualquier uso comercial, ya que impone condiciones específicas distintas de las licencias permisivas habituales.
- Repositorio espejo de pesos creados originalmente en Civitai; la autoría del entrenamiento y la coreografía corresponde al autor original, no al repositorio de Hugging Face.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros sobre su comportamiento en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zakyrie/minimax-h3-bunny-combat-base
- LoRA complementario Motion Repair: https://huggingface.co/Zakyrie/minimax-h3-bunny-motion-repair
- Licencia MiniMax H3: https://platform.minimax.io/h3-license
- Fuente original en Civitai: https://civitai.com/ (la model card no incluye la URL directa del modelo)
- Demostraciones en vídeo: alojadas en el propio repositorio (`assets/Restaurant Crash Fight`, `assets/Gang Attack Fight`, `assets/1v1 Boxing Fight`)
