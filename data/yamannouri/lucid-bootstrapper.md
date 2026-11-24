# Yamannouri/lucid-bootstrapper

## Resumen

`Yamannouri/lucid-bootstrapper` no es un modelo de inteligencia artificial. El repositorio de Hugging Face, pese a estar alojado en esa plataforma, contiene la model card de una supuesta aplicación ejecutable para Windows x64 denominada "Lucid Bootstrapper" (`lucid-bootstrapper-v1.2.0-win64.exe`, build `v3.2.1`), distribuida como archivo ZIP de 8,9 MB con contraseña `2026`.

La descripción del propio autor la presenta como una herramienta externa de tipo "game cheat" para Windows, con funciones de radar 2D, filtrado de loot, suavizado de entrada Bézier, perfiles JSON intercambiables en caliente y una capa de renderizado diseñada para excluirse de la captura de pantalla de OBS, ShadowPlay y Discord. No hay pesos de modelo, tokenizador, arquitectura de red neuronal ni pipeline de inferencia asociados al repositorio.

Por tanto, esta ficha documenta un artefacto que no es un modelo de IA y que, además, presenta señales de riesgo claras (binario ofuscado con contraseña, instrucciones para ejecutar como administrador, indicaciones para desactivar alertas de SmartScreen/Defender, y capacidades explícitas de evasión de captura de pantalla). No debe evaluarse como modelo ni desplegarse en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` y una contraseña de extracción) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni información sobre datos, tokens, RLHF/DPO o innovaciones de arquitectura. La model card describe un binario nativo de Windows con módulos que, según el autor, operan en modo usuario ("user-mode external core"), sin hooks DLL internos, con polling a 347 Hz, consumo declarado inferior a 35 MB de RAM para el núcleo y menos de 44 MB para el módulo de radar, y tiempos de respuesta declarados de menos de 9 ms para la capa de renderizado y menos de 24 ms para el cambio de perfiles.

Estos datos son afirmaciones del autor no verificables a partir del contenido del repositorio, que no incluye código fuente, hashes de integridad publicados de forma independiente ni artefactos auditables.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades que declara el autor son de otro tipo: radar 2D con filtrado de loot por rareza, suavizado de entrada Bézier con radio FOV y VisCheck, intercambio de perfiles JSON con una tecla, y una "panic key" (`END`) para descarga y salida del proceso.
- Declara explícitamente una capa de renderizado "stream-proof" para excluirse de capturas de OBS, ShadowPlay y Discord.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe el propio autor son:

- Uso como supuesto "cheat" en videojuegos, con radar y filtrado de objetos; esto incumple habitualmente los términos de servicio de los juegos y puede conllevar el baneo de cuentas.
- Ejecución de un binario de procedencia no verificada como administrador en Windows 11, lo que expone el sistema a riesgo de malware.
- Evasión de captura de pantalla en herramientas de streaming, lo que dificulta la supervisión y la grabación de sesiones.
- Distribución de software con contraseña de extracción, práctica que impide el análisis automático por parte de antivirus y plataformas.
- No se recomienda su uso en ninguno de estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras son las declaradas por el autor en la model card (347 Hz de polling, menos de 35 MB de RAM, menos de 9 ms y menos de 24 ms de respuesta), sin metodología ni verificación independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits.
- No requiere GPU ni VRAM: no hay inferencia de red neuronal.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos de modelo.
- El autor indica ejecución como administrador y extracción previa del ZIP con contraseña `2026`.
- Consumo de RAM declarado: menos de 35 MB para el núcleo y menos de 44 MB para el módulo de radar.
- No se dispone de datos verificables de latencia o throughput más allá de las cifras del propio autor.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con utilidades legítimas de Windows, dado que su propósito declarado es la manipulación de videojuegos y la evasión de captura.

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en catálogos, pipelines ni evaluaciones de modelos.
- El binario se distribuye comprimido con contraseña, lo que dificulta el escaneo por antivirus y la inspección de contenido.
- La model card incluye instrucciones para desactivar o ignorar alertas de Windows Defender y SmartScreen, una señal de alarma típica de software malicioso o no firmado.
- Se solicita ejecución como administrador, lo que otorga al binario control total sobre el sistema.
- Declara capacidades de evasión de captura de pantalla (OBS, ShadowPlay, Discord), lo que puede facilitar usos abusivos y dificultar la auditoría.
- El repositorio tiene 0 descargas y 0 "likes", fue creado y actualizado el mismo día (2026-11-24) y no presenta historial de mantenimiento.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido ni sobre la ausencia de código malicioso.
- El uso como "cheat" en videojuegos suele violar los términos de servicio y puede acarrear sanciones en las cuentas.
- No debe descargarse, extraerse ni ejecutarse en entornos de producción, de investigación ni personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yamannouri/lucid-bootstrapper
- Repositorio GitHub referenciado por el autor (no verificado): https://github.com/laurentn50/lucid-bootstrapper
- Enlace de descarga directa citado por el autor (no recomendado): https://github.com/laurentn50/lucid-bootstrapper/releases/latest/download/lucid-bootstrapper-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información proporcionada.
