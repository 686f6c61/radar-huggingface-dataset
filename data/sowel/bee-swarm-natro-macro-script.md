# sowel/bee-swarm-natro-macro-script

## Resumen

`so wel/bee-swarm-natro-macro-script` no es un modelo de inteligencia artificial, sino un repositorio alojado en Hugging Face que distribuye un ejecutable de Windows (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como macro automatizada para el videojuego Roblox. La model card describe módulos de automatización de bucles de farmeo, teletransporte por coordenadas, optimización de framerate, guardia anti-AFK y alertas por webhook de Discord, con instrucciones para extraer el archivo usando la contraseña `2026` y ejecutarlo como administrador.

El artefacto se etiqueta con `license: mit` y 14 idiomas, pero no contiene pesos, tokenizador, configuración de transformer ni ningún componente propio de un modelo de lenguaje. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Shuhua73716/robrun-trainer-esp-aimbot-2026` y `desai33633/bee-swarm-natro-macro-script`) y no a artefactos de Hugging Face. La model card incluye además referencias a un "aimbot" y un "ESP" (extra-sensorial perception, término habitual para overlays de trampas en juegos), lo que junto con el patrón de ejecutable ofuscado, contraseña de archivo y petición de privilegios de administrador constituye un indicador claro de riesgo de seguridad.

No existe información verificable sobre arquitectura, parámetros, contexto, datos de entrenamiento ni benchmarks. Los resultados de búsqueda web sobre "sowell" corresponden a una cadena hotelera francesa y a una aplicación de gestión de equipos, sin relación alguna con el repositorio. Esta ficha documenta el artefacto tal como se presenta en Hugging Face, advirtiendo de que no debe tratarse como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos; sin archivo LICENSE verificable en la información disponible) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni código de inferencia de aprendizaje automático. El contenido descrito en la model card es un ejecutable de Windows empaquetado en `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip` (4,8 MB, build `v1.2.4 (32F236)`), con módulos declarados de automatización de entrada, teletransporte y optimización de renderizado orientados al cliente de Roblox.

No se proporciona información sobre datos de entrenamiento, proceso de alineación (RLHF, DPO), tokenizador, arquitectura de red ni innovaciones técnicas. La model card mezcla terminología de macros de juego con métricas inventadas de "consistencia" (97,9 %, 96,8 %, 96,4 %) sin metodología que las respalde.

## Capacidades

- Ejecución de un binario Windows x64 con privilegios de administrador, según las instrucciones de la model card.
- Declaración de módulos de automatización de bucles de farmeo, agrupación de enemigos y limpieza de jefes en el juego Bee Swarm (Roblox).
- Declaración de teletransporte por coordenadas a islas, NPC y salas de raid, con latencia declarada inferior a 32 ms.
- Declaración de optimización de framerate mediante eliminación de partículas y renderizado de bajo consumo, con uso de RAM declarado inferior a 58 MB.
- Declaración de guardia anti-AFK mediante pulsos de entrada virtuales.
- Declaración de alertas por webhook de Discord y guardado de configuración en JSON.
- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes. Los idiomas listados en metadatos no corresponden a capacidades lingüísticas del artefacto.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque el artefacto no es un modelo. Los escenarios que la model card sugiere implican automatización de un cliente de videojuego, lo que en la práctica supone:

- Automatización de farmeo en Roblox mediante entrada sintética, con riesgo de incumplimiento de los términos de servicio de la plataforma y de baneo de cuentas.
- Overlays de "ESP" y "aimbot" en juegos multijugador, funcionalidad asociada a trampas y a manipulación de la experiencia de otros jugadores.
- Ejecución de un binario de origen no verificado con privilegios de administrador en un equipo de escritorio, con el consiguiente riesgo de compromiso del sistema.
- Distribución de software a través de un repositorio de Hugging Face que redirige a descargas alojadas en GitHub de terceros, un patrón habitual en campañas de malware.
- Ningún caso de uso relacionado con procesamiento de lenguaje natural, generación de código, atención al cliente, análisis de documentos ni despliegue en pipelines de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de "consistencia" de la model card (97,9 %, 96,8 %, 96,4 %) no van acompañadas de metodología, conjunto de evaluación ni reproducibilidad, por lo que no se recogen como resultados.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- Espacio en disco: aproximadamente 4,8 MB para el ZIP; el tamaño descomprimido no está disponible.
- RAM: la model card declara menos de 58 MB de uso para el módulo de optimización de framerate; no hay datos verificables del consumo total del ejecutable.
- GPU: no aplica; no se declara aceleración por GPU ni requisitos de VRAM.
- Despliegue: no aplica (no hay opciones vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo).
- Latencia y throughput: no disponibles; la cifra de "< 32 ms" del módulo de teletransporte no es verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable: el artefacto es un ejecutable de automatización de juego, no un modelo de lenguaje, visión o audio. Las alternativas reales serían otras herramientas de macro para Roblox, cuya evaluación queda fuera del alcance de esta ficha y que comparten los mismos riesgos de términos de servicio y seguridad.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración ni código de inferencia. No puede desplegarse como modelo en ninguna plataforma.
- Riesgo de seguridad alto: ejecutable de origen desconocido, distribuido en un ZIP protegido con contraseña (`2026`), alojado en repositorios de GitHub de terceros y con instrucciones explícitas de ejecutarlo como administrador. Este patrón es habitual en la distribución de malware.
- La model card pide desactivar o ignorar advertencias de Windows Defender y SmartScreen, lo que agrava el riesgo.
- El nombre del binario (`robrun-trainer-esp-aimbot-2026`) hace referencia explícita a funcionalidades de trampa (aimbot, ESP) en un juego multijugador, con probable infracción de los términos de servicio de Roblox y de la legislación aplicable en algunos países.
- Las métricas declaradas (descargas de 804K+, valoración 4,8/5, porcentajes de consistencia) no son verificables y no se corresponden con los contadores reales del repositorio en Hugging Face (0 descargas, 0 likes en la información disponible).
- La licencia MIT declarada en metadatos no está respaldada por un archivo de licencia verificable en la información proporcionada; en cualquier caso, una licencia de software no legitima el uso del artefacto para vulnerar términos de servicio de terceros.
- Los enlaces de descarga apuntan a dos repositorios de GitHub distintos y potencialmente no relacionados con el autor del repositorio de Hugging Face.
- Los resultados de búsqueda web sobre "sowell" no guardan relación con este artefacto y no aportan información técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sowel/bee-swarm-natro-macro-script
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros): https://github.com/desai33633/bee-swarm-natro-macro-script/releases/latest
- Resultados de búsqueda web sin relación con el artefacto: https://www.sowell.fr/ , https://sowell.app/ , https://www.sowell-groupe.fr/
