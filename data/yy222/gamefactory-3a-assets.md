# YY222/GameFactory-3A-Assets

## Resumen

GameFactory-3A Assets es un repositorio de assets de demostración generados íntegramente por IA para un juego de lucha 3D en perspectiva lateral, estilo Mortal Kombat, construido con Unity3D 2022.3 URP. El repositorio forma parte del framework GameFactory-3A, un sistema de código abierto que permite a agentes de programación (Claude Code, Codex, Gemini CLI) generar juegos completos a partir de una especificación de requisitos. El autor es YY222, y el repositorio se encuentra disponible en HuggingFace con un tamaño de 0.4 GB.

El proyecto destaca porque todos los objetos 3D fueron generados mediante la API de Meshy, los movimientos se generaron con MoMask (texto a movimiento) y se retargetizaron con Puppeteer. No se incluye ningún asset de terceros ni de Unity Store, cumpliendo así restricciones de copyright. La estructura del repositorio incluye definiciones de tareas en JSONL, assets generados (personajes, escenario, props), código C# de mecánicas de juego, código de interfaz de usuario y un proyecto Unity completo listo para abrir. Es relevante porque demuestra un pipeline de generación de juegos 3A de extremo a extremo, desde la especificación hasta un juego jugable.

Este repositorio no es un modelo de IA en sí mismo, sino un conjunto de assets y código generados por IA. La ficha se centra en el contenido del repositorio y su uso dentro del marco GameFactory-3A.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable (repositorio de assets y código generado por IA) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GLB (modelos 3D), FBX (animaciones), C# (código), JSON (metadatos), Unity project |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino los resultados de un pipeline de generación de assets mediante IA. Los objetos 3D se generaron con la API de Meshy, una herramienta de text-to-3D, mientras que los movimientos se generaron con MoMask (text-to-motion) y se retargetizaron con Puppeteer. El código de mecánicas y UI fue generado por un agente de programación (probablemente Claude Code o similar) a partir de especificaciones de tareas en JSONL. No se proporciona información sobre datos de entrenamiento ni métodos de entrenamiento, ya que no es un modelo de IA sino el resultado de un proceso de generación.

El pipeline se organiza en capas: capa A (assets 3D), capa B (mecánica de juego en C#), capa C (UI en C#) y capa D (pipeline completo con proyecto Unity). La generación de assets se realizó con prompts específicos por tarea, y el código se generó con agentes que siguen un contrato de mecánica (mechanic_contract.json) para enlazar la lógica del juego con la UI.

## Capacidades

- Generación de assets 3D completos: personajes (guerrero, ninja), armas (espada, shuriken), props (farol de piedra) y escenarios (arena).
- Generación de movimientos de personajes: 14 clips de animación FBX retargetizados, incluyendo movimientos de combate.
- Generación de mecánica de juego completa en C#: control de personaje, sistema de combate (detección de golpes, daño, hitstun), gestión de rondas (mejor de 5), sistema de combos, habilidades definitivas, IA de oponente, y mecánica de lanzamiento de props.
- Generación de interfaz de usuario en C#: HUD (barras de vida, energía, temporizador, indicador de rondas), pantalla de victoria/derrota, y un binder que conecta la UI con el contrato de mecánica.
- Integración completa con Unity: proyecto Unity 2022.3 URP listo para abrir, con escenas jugables (FightingArena.unity, FightingArenaGame.unity).
- Trazabilidad: cada asset generado incluye metadatos con task_id, estado y archivos, permitiendo auditar el proceso de generación.
- Soporte de pruebas unitarias: tanto la mecánica como la UI incluyen scripts de pruebas.
- Soporte de previsualización en navegador: para la UI generada.

## Casos de uso

- Prototipado rápido de juegos de lucha: el repositorio ofrece un proyecto Unity completo con mecánicas de combate funcionales, lo que permite a los desarrolladores usarlo como punto de partida para un juego de lucha 2D/3D sin partir de cero.
- Referencia de generación de assets con IA: los archivos JSONL de tareas y los metadatos muestran cómo se estructuran prompts para generar assets 3D, movimientos y audio con herramientas como Meshy y MoMask, sirviendo de guía para equipos que quieran integrar estas herramientas en sus pipelines.
- Evaluación de agentes de programación para desarrollo de juegos: el repositorio incluye context_used.json y meta.json que registran el contexto y la trazabilidad del agente, lo que permite evaluar la calidad de generación de código de agentes como Claude Code en tareas de desarrollo de juegos.
- Aprendizaje de integración de mecánica y UI: el contrato de mecánica (mechanic_contract.json) y el binder de UI (FightingUIBinder.cs) muestran un patrón de diseño para separar la lógica de juego de la interfaz, útil como ejemplo para desarrolladores.
- Generación de juegos completos: el repositorio demuestra un pipeline de generación de juegos 3A de extremo a extremo, desde la especificación de requisitos hasta un proyecto Unity ejecutable, lo que puede servir de base para herramientas de generación automática de juegos.
- Investigación sobre generación de contenido procedural: los prompts y las salidas generadas proporcionan datos de investigación para estudiar la calidad de los assets generados por IA y su integración en un motor de juego real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento de los assets generados ni comparaciones con otros métodos.

## Requisitos de hardware

- No aplicable para inferencia de modelo de IA, ya que el repositorio no contiene un modelo.
- Para abrir el proyecto Unity: se requiere Unity3D 2022.3 LTS con el pipeline Universal Render Pipeline (URP).
- Para ejecutar la escena de juego: una GPU compatible con Unity 2022.3, con al menos 4 GB de VRAM recomendados para una experiencia fluida (los assets GLB tienen un tamaño de 8.5-10.5 MB cada uno, no son pesados).
- Para regenerar los assets: se necesitaría acceso a la API de Meshy (para 3D) y a MoMask (para movimientos), lo que requiere hardware con GPU NVIDIA (para MoMask) y conexión a Internet para la API de Meshy.
- Para regenerar el código: se necesita un agente de programación como Claude Code, Codex o Gemini CLI, junto con un entorno de desarrollo Unity.

## Comparativa con modelos similares

No disponible. No se han encontrado repositorios comparables que ofrezcan un conjunto de assets de juego generados íntegramente con IA y un proyecto Unity completo con mecánica de combate. Los repositorios similares suelen centrarse en un solo tipo de asset (por ejemplo, modelos 3D) o en un solo componente (como generación de código), pero no en un pipeline completo como GameFactory-3A.

## Limitaciones y advertencias

- El repositorio solo incluye un juego de demostración (gameC_fighting_arena) por restricciones de copyright; los demás juegos con assets de terceros no se han subido.
- Los assets generados pueden presentar artefactos visuales o fallos de animación, ya que han sido generados automáticamente por IA y no revisados manualmente.
- La licencia del repositorio no está especificada en la información disponible, por lo que se debe contactar con el autor (YY222) antes de usar los assets en proyectos comerciales.
- El proyecto Unity requiere Unity3D 2022.3 LTS, y no se garantiza compatibilidad con versiones anteriores o posteriores.
- Los archivos de metadatos y trazabilidad son específicos del pipeline de GameFactory-3A, por lo que pueden no ser útiles fuera de ese contexto.
- No se incluyen los assets de audio (aunque hay tareas de audio en JSONL), por lo que el juego carece de sonido en la versión subida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YY222/GameFactory-3A-Assets
- Repositorio GitHub: https://github.com/OpenDCAI/GameFactory-3A
- Blog de referencia sobre GameFactory-3A: https://blog.mushroom.cv/blog/gamefactory-3a-open-source-coding-agent-game-generation-ue5-blender-unity/
- Paper de GameFactory (generación de video de juego): https://arxiv.org/abs/2501.08325
