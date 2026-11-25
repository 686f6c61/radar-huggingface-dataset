# tranhaiduon/do-not-stop-script

## Resumen

`tranhaiduon/do-not-stop-script` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. A pesar de su presencia en la plataforma, el contenido publicado consiste en una model card que distribuye un ejecutable de Windows (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `v2.3.1`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. La descripcion tecnica del propio autor lo identifica explicitamente como un `game cheat` (trampa para videojuegos) con funciones de radar 2D, overlay externo a 144 Hz, ESP de esqueletos, suavizado de entrada Bezier y capa de renderizado disenada para evadir la captura de OBS, ShadowPlay y Discord.

El repositorio no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (catorce codigos ISO) no corresponden a capacidades linguisticas de un modelo, sino a metadatos de distribucion de software. No existe informacion sobre parametros, contexto, cuantizacion ni formato de pesos porque no hay modelo subyacente.

Desde la perspectiva de evaluacion de modelos open source, este artefacto no es utilizable como modelo y presenta riesgos de seguridad evidentes: distribucion de binarios opacos, instrucciones para desactivar advertencias de Windows Defender y SmartScreen, y ejecucion como administrador. La ficha se completa por rigor estructural, indicando de forma explicita la ausencia de datos tecnicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los 14 codigos ISO del repositorio son metadatos de distribucion, no capacidades linguisticas) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un binario compilado para Windows 10/11 de 64 bits, distribuido como `solara-executor-v3-keyless-2026-v1.2.2-win64.zip` (4,8 MB) y extraible con la contrasena `2026`. Segun la descripcion del autor, el ejecutable opera en modo usuario (sin hooks internos en DLL), emplea Desktop Duplication para el renderizado, realiza escaneo dinamico de offsets tras parches del juego y utiliza once hilos de trabajo con sondeo a 358 Hz. Estas cifras provienen unicamente de la model card y no son verificables.

No se documenta ningun dataset, ninguna fase de preentrenamiento, ajuste supervisado, RLHF o DPO. Tampoco se describe innovacion tecnica alguna en el sentido de machine learning: las unicas "innovaciones" mencionadas son mecanismos de evasion de captura de pantalla y suavizado de curvas de apuntado, propias de software de trampas.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues; los idiomas listados son etiquetas del repositorio.
- Segun el autor, el binario ofrece: radar 2D con filtro de botin por rareza, overlay externo a 144 Hz con cajas delimitadoras 2D/3D y esqueletos de huesos, ESP de distancia, suavizado de entrada Bezier con radio de FOV configurable y VisCheck, capa de renderizado excluida de OBS, ShadowPlay y Discord, y escaner dinamico de offsets.
- Estas funciones constituyen trampas en videojuegos multijugador y no capacidades de IA.

## Casos de uso

- No se identifican casos de uso legitimos de IA para este repositorio.
- El proposito declarado por el autor es la asistencia en videojuegos mediante radar, ESP y apuntado asistido, lo que vulnera habitualmente los terminos de servicio de los juegos y puede constituir fraude en entornos competitivos.
- Su uso en produccion, investigacion o desarrollo de software no es aplicable: no hay API de inferencia, ni pesos, ni servidor compatible con vLLM, TGI o llama.cpp.
- La distribucion de binarios sin codigo fuente auditable, con instrucciones para desactivar protecciones del sistema operativo, es un vector clasico de malware.
- No se recomienda su descarga, extraccion ni ejecucion en ningun entorno, y menos con privilegios de administrador.
- Cualquier integracion en pipelines de CI/CD, atencion al cliente o generacion de codigo es tecnicamente imposible con este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas citadas por el autor (`98,3%` de consistencia en suavizado Bezier, `96,3%` en la capa de renderizado, `99,3%` en el escaner de offsets, `< 19 MB` de RAM y `358 Hz` de sondeo) carecen de metodologia, no son reproducibles y no corresponden a ninguna evaluacion de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable nativo de Windows x64.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, 4,8 MB de disco para el ZIP, menos de 19 MB de RAM en ejecucion y once hilos de trabajo.
- Latencia y throughput: no disponibles; las cifras de 358 Hz y 144 Hz son afirmaciones del autor sin verificacion independiente.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a otros artefactos de la plataforma, la comparacion relevante seria con repositorios legitimos de modelos ligeros (por ejemplo, familias de menos de 1B parametros con licencia permisiva), pero ninguno comparte naturaleza, funcion ni formato de distribucion con este binario.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna prueba de razonamiento.
- Riesgo de seguridad alto: binario opaco distribuido con contrasena en el ZIP, sin codigo fuente ni trazabilidad de compilacion.
- La model card instruye a desactivar advertencias de Windows Defender y SmartScreen y a ejecutar como administrador, practica que anula defensas del sistema.
- El autor reconoce explicitamente que se trata de un `game cheat`, lo que implica incumplimiento de los terminos de servicio de juegos multijugador y posible baneo de cuentas.
- Incluye funciones de evasion de captura (OBS, ShadowPlay, Discord) que dificultan la deteccion y la auditoria.
- La licencia MIT declarada no aporta garantias sobre el contenido del binario ni sobre su legalidad en jurisdicciones concretas.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide el artefacto.
- No debe descargarse, extraerse ni ejecutarse en entornos personales, corporativos o de investigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tranhaiduon/do-not-stop-script
- Repositorio GitHub referenciado por el autor: https://github.com/ArjunRyu/do-not-stop-script
- Releases del autor alternativo citado: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases
- No se han encontrado papers, blogs tecnicos, demos ni documentacion adicional en la informacion proporcionada.
