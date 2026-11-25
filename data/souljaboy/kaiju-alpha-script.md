# souljaboy/kaiju-alpha-script

## Resumen

El repositorio `souljaboy/kaiju-alpha-script` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es un ejecutable de Windows x64 presentado como "script" para el juego Marvel Rivals, con funcionalidades declaradas de ESP (detección de jugadores a través de paredes), aimbot con suavizado Bézier, radar 2D y filtrado de botín. El paquete se distribuye como un ZIP de 4,8 MB protegido con contraseña y un binario que debe ejecutarse como administrador.

La model card no incluye ninguna información sobre arquitectura de red neuronal, parámetros, tokenizador, datos de entrenamiento ni pesos. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y el pipeline vacío confirman que no se trata de un modelo publicable en el ecosistema de Hugging Face, sino de un binario empaquetado con metadatos de modelo. Los campos de idioma (14 idiomas) parecen reflejar la localización de la interfaz del ejecutable, no capacidades lingüísticas de un modelo.

Desde la perspectiva de un desarrollador o investigador, este repositorio no es evaluable como modelo y presenta señales claras de riesgo: binario opaco, contraseña de extracción para evadir análisis automatizados, instrucciones para desactivar Windows Defender y SmartScreen, y distribución vía enlaces de GitHub Releases de terceros ajenos al autor declarado. No debe descargarse ni ejecutarse en entornos de producción o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un binario compilado para Windows x64 (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v2.0.9` / `C005EA`) empaquetado en un ZIP de 4,8 MB. La model card describe módulos de renderizado "stream-proof" para evadir capturas de OBS, ShadowPlay y Discord, un escáner de offsets dinámicos para resolver punteros tras parches del juego, suavizado de entrada Bézier con FOV configurable y comprobación de visibilidad, y un núcleo externo en modo usuario que usa Desktop Duplication en lugar de hooks DLL internos.

No se documenta proceso de entrenamiento, dataset, RLHF, DPO ni ninguna técnica de aprendizaje automático. Las cifras que aparecen en la model card (96,9 % de consistencia, menos de 52 MB de RAM, menos de 22 ms de respuesta) son afirmaciones de marketing del autor sin metodología de medición publicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Las capacidades multilingües declaradas se refieren a la interfaz del ejecutable, no a comprensión o generación de lenguaje.
- Funcionalidad declarada por el autor (no verificada): ESP de jugadores, aimbot con curvas humanizadas, radar 2D, filtro de botín por rareza, perfiles JSON intercambiables en caliente y evasión de captura de pantalla.
- Estas funcionalidades constituyen trampas para un videojuego multijugador y violan los términos de servicio del título al que apuntan.

## Casos de uso

- No se identifican casos de uso legítimos para desarrollo de software, investigación en IA o producción.
- El uso declarado por el autor es la manipulación de un juego multijugador competitivo, lo que conlleva riesgo de sanción por parte del editor y posibles consecuencias legales según la jurisdicción.
- Ejecutar el binario en una máquina de desarrollo expone el sistema a riesgo de malware no analizable (binario ofuscado, contraseña de extracción, instrucciones para desactivar defensas del sistema operativo).
- No es adecuado como dependencia en pipelines de CI/CD, servicios de inferencia ni entornos con datos sensibles.
- No debe usarse como referencia para evaluar capacidades de modelos open source: no aporta información técnica sobre IA.
- Cualquier integración en productos de terceros implicaría distribuir un ejecutable de dudosa procedencia y con licencia MIT declarada pero sin código fuente verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (según la model card).
- CPU: x64 de Intel o AMD.
- RAM: el autor afirma menos de 52 MB para el módulo de perfiles y menos de 50 MB para el radar, sin metodología verificable.
- GPU: no se especifica; el módulo de renderizado usa Desktop Duplication, que requiere una GPU con soporte de la API de captura de escritorio de Windows.
- VRAM: no aplica (no hay modelo de IA que cargar).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: el autor declara menos de 22 ms de tiempo de respuesta, sin medición publicada.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Los repositorios comparables serían otros binarios empaquetados como modelos en Hugging Face, una práctica que la plataforma no contempla como caso de uso válido.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura, tokenizador ni documentación técnica evaluable.
- El binario se distribuye con contraseña de extracción (`2026`), lo que dificulta el análisis automatizado por parte de antivirus y plataformas de escaneo.
- La model card instruye explícitamente a desactivar o ignorar Windows Defender y SmartScreen, una práctica característica de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Stephaniei047`, `SusanneSenturk6031`) distintos del autor declarado en Hugging Face (`souljaboy`), lo que impide verificar la cadena de custodia del binario.
- La licencia MIT declarada no es verificable sin código fuente y no exime de responsabilidad por el uso del ejecutable.
- El uso del software para trampas en juegos multijugador viola los términos de servicio del editor y puede acarrear el baneo de cuentas o acciones legales.
- Riesgo de alucinación: no aplica; el riesgo real es de ejecución de código malicioso.
- No apto para uso comercial, investigación ni producción bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/souljaboy/kaiju-alpha-script
- Enlace de descarga citado en la model card (GitHub Releases de terceros, no verificado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card: https://github.com/SusanneSenturk6031/kaiju-alpha-script/releases/latest
- Paper, blog o demo: no disponible.
