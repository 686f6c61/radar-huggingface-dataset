# zerty4477/fisch-script-auto-catch-macro-keyless

## Resumen

El repositorio `zerty4477/fisch-script-auto-catch-macro-keyless` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un paquete de software para Windows x64 (build `v3.7.9`, identificador `DDD134`) distribuido como archivo `.zip` de 4,8 MB que, según su model card, contiene un ejecutable (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`) orientado a automatizar tareas dentro del videojuego Roblox (concretamente en el título *Fisch*). El autor lo etiqueta como "macro", "script" y "keyless", y ofrece funciones descritas como ESP de entidades y cofres, guardia anti-AFK, bucle de farmeo automatizado, alertas por webhook de Discord y teletransporte por coordenadas.

La relevancia de esta ficha es, por tanto, fundamentalmente negativa: el artefacto no es evaluable como modelo lingüístico ni como sistema de IA, carece de arquitectura, parámetros, contexto o datos de entrenamiento, y su model card presenta múltiples indicios de riesgo (contraseña fija para descomprimir, instrucciones para ejecutar como administrador, enlaces de descarga alojados en repositorios de GitHub de terceros distintos del autor declarado, y justificación explícita de alertas de Windows Defender). No se han publicado benchmarks ni especificaciones técnicas de ningún tipo.

Desde el punto de vista de un desarrollador o investigador que evalúe modelos, este repositorio debe descartarse de cualquier pipeline de selección de modelos. Se documenta aquí únicamente para dejar constancia de su naturaleza y de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card, no verificable como capacidad del ejecutable) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows 10/11 de 64 bits, empaquetado en un ZIP de 4,8 MB protegido con la contraseña fija `2026`. La model card menciona de forma vaga "4 worker threads" y "9 worker threads" en distintas secciones, así como tiempos de respuesta inferiores a 30 ms, 37 ms y 50 ms, pero no aporta ninguna descripción técnica verificable del motor, del lenguaje de programación, de las dependencias ni del mecanismo de inyección en el juego.

No hay datos de entrenamiento, RLHF, DPO ni innovaciones de decodificación. Cualquier afirmación sobre "rendimiento" en la model card es marketing sin respaldo técnico.

## Capacidades

- Automatización de acciones dentro de Roblox (título *Fisch*): captura automática, farmeo en bucle, ciclado de misiones y eliminación de jefes, según la descripción del autor.
- ESP (extra sensory perception) de entidades, cofres, ítems y frutas, con seguimiento a través de paredes.
- Guardia anti-AFK mediante pulsos de entrada virtual para evitar expulsiones por inactividad.
- Teletransporte por coordenadas a islas, NPC y salas de raid.
- Alertas mediante webhook de Discord y registros de sesión.
- "Optimizador de framerate" descrito como eliminación de partículas y renderizado de bajo consumo de CPU.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial ni tool calling en el sentido de un modelo de lenguaje.
- No dispone de modo thinking, audio ni capacidades multimodales reales.

## Casos de uso

- No se identifican casos de uso legítimos para desarrolladores o investigadores de IA. El artefacto no procesa lenguaje ni datos, no expone API y no genera representaciones utilizables.
- Automatización de tareas repetitivas en un videojuego concreto (*Fisch* en Roblox), según la descripción del autor; esta práctica suele contravenir los términos de servicio de la plataforma y puede conllevar el baneo de la cuenta.
- Monitorización de sesiones de juego mediante webhooks de Discord, si se confía en el binario; no recomendable por el riesgo de ejecución de código no auditado.
- Extracción de información del entorno de juego (ESP) con fines de análisis; de nuevo, contraria a las normas habituales de los juegos en línea.
- Distribución como ejemplo de empaquetado ZIP con contraseña fija; útil únicamente como caso de estudio de malas prácticas de distribución de software.
- Pruebas de detección de malware en entornos aislados (sandbox, máquina virtual sin red) para analistas de seguridad; nunca en un equipo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (x64), según la model card.
- RAM: el autor menciona menos de 50 MB en una de las secciones, dato no verificable.
- CPU: no se especifica; se mencionan "4 worker threads" y "9 worker threads" en secciones distintas, sin aclarar el modelo de CPU.
- GPU: no se requiere GPU dedicada según la descripción; no hay datos de VRAM porque no es un modelo de IA.
- Almacenamiento: 4,8 MB para el ZIP; el tamaño descomprimido no se indica.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor afirma respuestas inferiores a 30 ms, 37 ms y 50 ms en distintos módulos, sin metodología de medición; no verificable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, podría compararse con otros paquetes de macros o scripts para Roblox, pero no se dispone de datos verificables de alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en evaluaciones de modelos, pipelines de inferencia ni comparativas de LLM.
- Riesgo de seguridad elevado: distribución mediante ZIP con contraseña fija (`2026`), enlaces de descarga alojados en repositorios de GitHub de terceros (`ekaterina96522`, `sIbrahim87427`) distintos del autor declarado (`zerty4477`), e instrucciones explícitas para ejecutar como administrador y desactivar advertencias de Windows Defender/SmartScreen. Este patrón es habitual en campañas de distribución de malware.
- La model card reconoce que el binario es "un script de Roblox independiente" y justifica las alertas heurísticas del antivirus, lo que refuerza la sospecha.
- Uso contrario a los términos de servicio de Roblox y del juego *Fisch*: riesgo de suspensión permanente de la cuenta del usuario.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en la información disponible; la licencia no cubre el uso del binario frente a las normas de la plataforma de juego.
- Idiomas listados en metadatos (14 idiomas) sin evidencia de que el ejecutable los soporte; probablemente sean etiquetas de SEO.
- Sin mantenimiento verificable: repositorio creado y actualizado el mismo día (2026-11-24), con 0 descargas y 0 likes en Hugging Face.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de comportamiento malicioso no documentado en el binario.
- No apto para producción, entornos corporativos ni equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zerty4477/fisch-script-auto-catch-macro-keyless
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Enlace de releases citado en la model card (repositorio de terceros, no verificado): https://github.com/sIbrahim87427/fisch-script-auto-catch-macro-keyless/releases/latest
