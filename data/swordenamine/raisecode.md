# swordenamine/Raisecode

## Resumen

`swordenamine/Raisecode` no es un modelo de IA: es un repositorio de scripts e instrucciones para instalar y ejecutar Claude Code (la CLI de Anthropic) sobre Termux en Android. El paquete, de unos 230 MB, actúa como cliente ligero: el dispositivo no ejecuta ninguna inferencia local, sino que envía las peticiones a la API de Anthropic usando la clave del propio usuario. No se publican pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia en el repositorio de HuggingFace.

El repositorio se presenta como "Claude Code on Android" y ofrece un instalador de un solo comando (`bootstrap.sh`), un entorno Zsh + Oh My Zsh preconfigurado, un generador de proyectos (`newproject`) y un modo servidor HTTP en el puerto 8765 que expone el modelo remoto a otros dispositivos de la misma red WiFi. Su propuesta de valor es evitar descargar modelos de 10-70 GB en dispositivos con almacenamiento y RAM limitados.

La ficha se ha elaborado exclusivamente a partir de los metadatos de HuggingFace y de la model card. Esta es internamente inconsistente: mezcla tres nombres distintos (Raisecode, RiseCode, In3Pro), apunta a un repositorio de GitHub distinto del ID de HuggingFace y contiene fechas incoherentes (creado el 2026-10-17, actualizado el 2026-03-05). El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye ningún resultado de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal, no se distribuyen pesos ni codigo de inferencia |
| Parametros totales | No disponible (no hay pesos en el repositorio) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible; depende del modelo Claude invocado a traves de la API de Anthropic |
| Tipos de cuantizacion | No aplica (la inferencia se ejecuta en servidores de Anthropic) |
| Idiomas soportados | No disponible en los metadatos; los hereda del modelo remoto |
| Licencia | MIT segun el README (Copyright 2026 swordenkisk); no declarada en los metadatos de HuggingFace |
| Formato de pesos | No disponible: no se publican safetensors, GGUF ni ningun otro artefacto de pesos |
| Tipo de artefacto | Conjunto de scripts de instalacion y configuracion (shell, YAML, documentacion) |
| Version declarada | 1.0.0 |
| Tamano del paquete | ~230 MB (Termux base ~80 MB, Node.js ~55 MB, Claude Code CLI ~35 MB, Git y herramientas ~45 MB, Python ~15 MB) |
| Plataforma objetivo | Android 5.0 o superior, con Termux instalado desde F-Droid |
| Dependencias | Termux, Node.js, paquete npm `@anthropic-ai/claude-code`, Python (modo servidor), Git |
| Requisito externo | Clave de API de Anthropic (`ANTHROPIC_API_KEY`) y conexion a Internet |
| Modo servidor | HTTP en el puerto 8765, endpoints `/health` y `/ask` |
| Descargas / likes | 0 / 0 |
| Tags de HuggingFace | `region:us` |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El "modelo" efectivo es el que Anthropic sirve a traves de su API en el momento de la consulta; el autor no especifica que version concreta de Claude se invoca, solo que se usa "siempre el modelo mas reciente" disponible en la API. Por tanto, no hay datos sobre numero de tokens de entrenamiento, composicion del corpus, tecnicas de alineamiento (RLHF, DPO) ni innovaciones como atencion lineal o decodificacion especulativa.

La parte tecnica aportada por el repositorio es una capa de aprovisionamiento: `termux/bootstrap.sh` automatiza la instalacion de paquetes, `scripts/server.sh` levanta un servidor HTTP que reenvia prompts a la API y `scripts/new_project.sh` genera el esqueleto de un proyecto. La configuracion por defecto reside en `config/.Raisecode.yml`. El flujo es: telefono con Termux, cliente ligero, llamada HTTPS a la API de Anthropic, respuesta del modelo remoto.

## Capacidades

- Generacion de texto y codigo delegada integramente al modelo Claude remoto: el dispositivo no ejecuta inferencia local.
- Ejecucion de la CLI de Claude Code dentro de Termux, con los comandos `claude "consulta"` y `claude .` para abrir el asistente en el directorio actual.
- Modo servidor HTTP local: expone `/health` (comprobacion de estado) y `/ask` (envio de prompts por POST con cuerpo JSON) a cualquier dispositivo de la misma red WiFi.
- Gestion de proyectos: `newproject` crea un esqueleto interactivo y `projects` navega a la carpeta de proyectos.
- Entorno de shell preconfigurado con Zsh y Oh My Zsh, sin configuracion manual por parte del usuario.
- Instalacion automatizada en un solo comando mediante `bootstrap.sh` descargado de GitHub.
- Uso de la clave de API propia del usuario, sin intermediacion de servidores de terceros segun el README.
- Capacidades multilingues, de vision, audio, tool calling o modo "thinking": no disponibles en la informacion proporcionada; dependerian en todo caso del modelo Claude subyacente, no del cliente.
- Modo offline: no soportado; aparece unicamente como elemento del roadmap (v1.1, "offline mode with lightweight local fallback").

## Casos de uso

- Consultas de programacion en movilidad: un desarrollador puede lanzar `claude "explica este error"` desde el terminal del telefono sin descargar pesos ni mantener un modelo en memoria; adecuado porque toda la computacion ocurre en la infraestructura de Anthropic y el dispositivo solo necesita red y ~230 MB libres.
- Puente entre el telefono y el portatil en una red local: con `server.sh` activo, un portatil puede enviar peticiones a `http://IP_DEL_TELEFONO:8765/ask` mediante `curl` y recibir respuestas del modelo, lo que permite usar la cuota de API del usuario desde un IDE o script sin instalar la CLI en el portatil.
- Prototipado rapido en dispositivos de gama baja o con almacenamiento reducido: al no requerir un modelo local de 10-70 GB, encaja en telefonos donde un runtime de inferencia no cabria; el coste es que cada peticion depende de la red.
- Aprovisionamiento reproducible de entornos: `bootstrap.sh` deja un Termux con Zsh, Node.js, Git y la CLI de Claude Code listos en un solo comando, util para preparar varios dispositivos de pruebas o para laboratorios docentes.
- Aprendizaje de flujos CLI asistidos por IA: el entorno Zsh preconfigurado y los comandos documentados (`claude`, `newproject`, `projects`) sirven como introduccion practica al uso de asistentes en terminal para quienes no han trabajado antes con este tipo de herramientas.
- Automatizacion de tareas de texto desde scripts moviles: cualquier script en Python o shell del telefono puede llamar al endpoint `/ask` y encadenar prompts, lo que permite clasificar texto, resumir o generar snippets sin salir del dispositivo.
- Soporte a tareas de campo: tecnicos que trabajan desde el movil pueden consultar dudas de codigo o configuracion en un terminal completo, sin necesidad de portatil, siempre que haya conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y al no distribuir pesos no es posible ejecutar una evaluacion propia del artefacto. Cualquier cifra de rendimiento corresponderia al modelo Claude remoto invocado, que el autor no identifica ni versiona.

## Requisitos de hardware

- VRAM para inferencia: 0 GB en el dispositivo; la inferencia se ejecuta en servidores de Anthropic.
- GPU: no se requiere ninguna en el telefono ni en el cliente. No hay datos sobre aceleracion por hardware local.
- Almacenamiento: ~230 MB libres segun el README (Termux ~80 MB, Node.js ~55 MB, CLI ~35 MB, Git y herramientas ~45 MB, Python ~15 MB).
- RAM: no especificada en la informacion disponible. Al no cargar pesos, la demanda deberia limitarse al propio Termux y Node.js, pero el autor no publica cifras.
- Sistema operativo: Android 5.0 o superior, con Termux instalado desde F-Droid (el README advierte explicitamente de que la version de Play Store esta desactualizada).
- Conectividad: WiFi o datos moviles obligatorios; no hay modo offline en la version 1.0.0.
- Despliegue: instalacion mediante `curl -sL https://raw.githubusercontent.com/swordenkisk/Raisecode/main/termux/bootstrap.sh | bash`; modo servidor con `bash ~/Risecode/scripts/server.sh` en el puerto 8765.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables, no hay pesos que servir.
- Latencia y throughput: no disponibles. Dependen del tiempo de ida y vuelta hasta `api.anthropic.com`, del modelo remoto seleccionado y de los limites de cuota de la cuenta del usuario. El README cita "slow connection" como problema tipico y sugiere cambiar a una WiFi estable o revisar los limites de uso en la consola de Anthropic.

## Comparativa con modelos similares

No hay modelos comparables en sentido estricto, porque el repositorio no contiene un modelo. Se compara con alternativas de la misma categoria funcional (acceso a asistencia de codigo desde Android).

| Alternativa | Parametros | Contexto | Inferencia | Licencia | Observaciones |
|---|---|---|---|---|---|
| Raisecode | No aplica | Depende de la API de Anthropic | Remota (API de Anthropic) | MIT segun README | Automatiza Termux + Claude Code; 0 descargas; sin benchmarks; autor no verificado |
| Instalacion manual de `@anthropic-ai/claude-code` en Termux | No aplica | Depende de la API | Remota | Licencia del paquete npm de Anthropic (no indicada en la informacion disponible) | Equivalente funcional sin capa de automatizacion; requiere instalar Node.js y configurar la clave a mano |
| Inferencia local con un modelo de codigo pequeno (por ejemplo, variantes de 1-3 B en GGUF via llama.cpp) | 1-3 B (orden de magnitud) | No disponible | Local en el dispositivo | Segun el modelo elegido | Funciona sin red, pero consume RAM y almacenamiento muy superiores a 230 MB y ofrece menor calidad que un modelo frontera; no disponible en la informacion proporcionada para una comparacion cifrada |

No se dispone de datos de rendimiento del artefacto que permitan una comparacion cuantitativa con ninguna de estas alternativas.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, tokenizador, configuracion de arquitectura ni codigo de inferencia. Cualquier expectativa de ejecutar el "modelo" en local es incorrecta.
- La model card es internamente incoherente: usa tres nombres distintos (Raisecode, RiseCode, In3Pro), el ID de HuggingFace (`swordenamine/Raisecode`) no coincide con el autor de GitHub referenciado (`swordenkisk`), las rutas del README mezclan `~/Risecode` e `In3Pro/`, y las fechas de creacion y actualizacion son contradictorias.
- Sin evidencia de uso ni validacion: 0 descargas, 0 likes, sin paper, sin tests y sin historial de issues en la informacion disponible.
- Riesgo de suministro de codigo: el metodo de instalacion recomendado es `curl ... | bash`, que ejecuta codigo remoto sin verificacion de integridad ni fijacion de version; no se publican sumas de comprobacion.
- Gestion de credenciales: la clave de API se exporta y se guarda en texto plano en `~/.zshrc`. Cualquier proceso con acceso al entorno del usuario puede leerla.
- Modo servidor sin seguridad: el endpoint HTTP del puerto 8765 no presenta autenticacion, TLS ni control de acceso segun la documentacion; queda expuesto a cualquier dispositivo de la red WiFi, incluida una red publica.
- Dependencia total de un servicio de terceros: sin conexion no hay funcionalidad; el coste por token, los limites de velocidad y las condiciones de uso son los de la cuenta de Anthropic del usuario, no los del repositorio.
- La licencia MIT declarada cubre los scripts del repositorio, no el modelo Claude ni el paquete npm de Anthropic, que se rigen por sus propios terminos. Ademas, la licencia no figura en los metadatos de HuggingFace, por lo que la situacion legal del artefacto publicado es ambigua.
- Riesgo de alucinacion: recae sobre el modelo remoto y no es mitigado por este cliente; el autor no documenta ninguna capa de validacion, citacion o verificacion de las respuestas.
- Idiomas: no se declara ninguno; no hay garantia documentada de calidad en castellano ni de comportamiento multilingue mas alla de lo que ofrezca el modelo remoto.
- Hoja de ruta no implementada: modo offline, app nativa, sincronizacion multidispositivo y entorno tipo NetHunter figuran como ideas futuras, no como funcionalidad disponible.
- No apto para produccion sin auditoria previa del codigo de instalacion, del servidor HTTP y del manejo de la clave de API.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/Raisecode
- Repositorio en GitHub citado en el README: https://github.com/swordenkisk/Raisecode
- Script de instalacion: https://raw.githubusercontent.com/swordenkisk/Raisecode/main/termux/bootstrap.sh
- Perfil del autor en GitHub: https://github.com/swordenkisk
- Termux en F-Droid: https://f-droid.org/packages/com.termux/
- Paquete npm de Claude Code: https://www.npmjs.com/package/@anthropic-ai/claude-code
- Consola de API de Anthropic (claves y limites de uso): https://console.anthropic.com
- Documentacion de Claude Code: no disponible en la informacion proporcionada
- Paper tecnico: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
