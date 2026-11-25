# vuxdepzai/fisch-dupe-script

## Resumen

`vuxdepzai/fisch-dupe-script` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable para Windows de 64 bits distribuido como archivo ZIP protegido con contraseña, presentado por su autor como un "script" para el videojuego Fisch. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de aprendizaje automático; el pipeline figura como no disponible.

El contenido de la model card describe módulos de automatización (bucles de farmeo, teletransporte a coordenadas, guardia anti-AFK, alertas por webhook de Discord y ESP de entidades y cofres) y enlaza a binarios alojados en repositorios de GitHub de terceros. Los nombres de los archivos descargables (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip` y su `.exe`) no guardan relación con el nombre del repositorio ni con el juego mencionado, lo que constituye una señal de alarma clásica de distribución de software potencialmente malicioso.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni rendimiento, porque tales datos no existen. Lo que se documenta a continuación es la naturaleza real del artefacto, sus características técnicas observables como paquete de software y las advertencias de seguridad pertinentes. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64 empaquetado en ZIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |
| Plataforma objetivo | Windows de 64 bits (Windows 11 mencionado en los tags) |
| Build declarado | v1.9.1 (3122FD / 3122FDB5C4) |
| Contraseña del archivo | `2026` (según la model card) |
| Repositorio | vuxdepzai/fisch-dupe-script |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-24 |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que documentar. El artefacto es un binario precompilado para Windows x64, distribuido como archivo comprimido con contraseña, junto con una model card que actúa como página de aterrizaje de descarga.

Desde el punto de vista de ingeniería de software, el patrón observado (ZIP con contraseña, ejecutable que requiere permisos de administrador, enlaces de descarga alojados en repositorios de GitHub ajenos al autor declarado, nombres de binario incoherentes con el proyecto) es característico de campañas de distribución de malware disfrazado de herramienta para videojuegos. La instrucción explícita de "ejecutar como administrador" agrava el riesgo, ya que otorga al binario privilegios elevados sobre el sistema.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos de discoverabilidad del repositorio.
- El contenido declarado por el autor incluye, según la model card: bucle automatizado de farmeo, teletransporte a coordenadas, guardia anti-AFK, alertas por webhook de Discord y ESP de entidades y cofres. Estas funciones se presentan como automatización de un videojuego, no como capacidades de IA.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe la model card son los siguientes, y se listan únicamente a efectos de documentación del contenido del repositorio:

- Automatización de farmeo en Fisch: el autor afirma que el binario ejecuta bucles de farmeo mediante acceso directo a memoria del proceso del juego.
- Teletransporte a coordenadas: desplazamiento instantáneo entre islas, NPC y salas de incursión.
- Guardia anti-AFK: emisión de entrada virtual periódica para evitar la expulsión por inactividad.
- Alertas por webhook de Discord: notificaciones de botín y registros de sesión enviados a un webhook externo.
- ESP de entidades y cofres: superposición de información de objetos a través de paredes.
- Configuración JSON persistente: guardado automático de perfiles y atajos de teclado.

Advertencia: la ejecución de estos binarios puede infringir los términos de servicio del videojuego, exponer credenciales de Discord y comprometer la seguridad del sistema anfitrión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de ningún tipo; las cifras que aparecen en la model card (546K+ descargas, valoración 5,0/5, 127 Hz, 442 Hz, < 38 ms) son afirmaciones del autor sin verificación y contradicen el contador real de descargas de Hugging Face (0).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto se ejecuta como binario nativo en Windows x64.
- Requisitos declarados por el autor: Windows de 64 bits, ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP con contraseña `2026`.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Como referencia de categoría, se compara con otros tipos de repositorio de Hugging Face:

| Criterio | fisch-dupe-script | Modelo de IA típico en HF | Repositorio de utilidades |
|---|---|---|---|
| Contenido | Ejecutable Win64 en ZIP | Pesos en safetensors/GGUF | Scripts y librerías |
| Pesos | No | Sí | No |
| Pipeline declarado | No disponible | Definido (text-generation, etc.) | No aplica |
| Verificabilidad | Baja (binario cerrado, contraseña) | Alta (pesos auditables) | Media (código fuente) |
| Licencia | MIT declarada | Variable | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código es infundada.
- Riesgo de seguridad elevado: ejecutable cerrado, distribuido con contraseña, que solicita permisos de administrador y se aloja en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face.
- Incoherencia de nombres: el binario se llama `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, mientras que el proyecto se presenta como un script para Fisch; esta discrepancia sugiere reutilización de plantillas de distribución o suplantación.
- Posible malware: el patrón (ZIP con contraseña para evadir análisis automáticos, enlaces externos, ejecución como administrador) coincide con técnicas habituales de troyanos y stealers.
- Métricas no fiables: las descargas y valoraciones declaradas en la model card no coinciden con los contadores reales de la plataforma.
- Riesgo legal y de términos de servicio: la funcionalidad declarada (cheats, ESP, aimbot, automatización) puede violar los términos de uso de los videojuegos afectados y la legislación de protección de servicios tecnológicos en algunas jurisdicciones.
- Licencia MIT declarada, pero sin código fuente disponible para verificar el cumplimiento ni la ausencia de componentes propietarios o maliciosos.
- Sin soporte, mantenimiento ni trazabilidad: 0 descargas, 0 likes y sin historial de commits verificable en la información disponible.
- Recomendación: no descargar ni ejecutar el binario; si ya se ha ejecutado, realizar un análisis antimalware completo y rotar credenciales de Discord y de cualquier cuenta usada en el equipo afectado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vuxdepzai/fisch-dupe-script
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (GitHub, terceros): https://github.com/maria60410/fisch-dupe-script/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
