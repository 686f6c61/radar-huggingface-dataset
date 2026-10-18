# swordenamine/hermes-mend

## Resumen

`swordenamine/hermes-mend` no es un modelo de IA, sino una herramienta de software: un agente de terminal ligero para Kali Linux (o cualquier Linux) que se comunica con un modelo Hermes a través de una API compatible con OpenAI. El repositorio no publica pesos, no incluye pipeline de inferencia y no contiene ningún artefacto ejecutable de red neuronal; lo que distribuye es un paquete en Python (un fichero `hermes-mend.zip` con `setup.sh`, `src/` y `tests/`) que actúa como cliente de un modelo servido por un tercero. El modelo por defecto al que apunta es `nousresearch/hermes-3-llama-3.1-70b` en OpenRouter, aunque la configuración permite cambiarlo.

La herramienta resuelve dos problemas concretos. El primero es la ejecución asistida de tareas de administración de sistemas: el modo `run` hace que el modelo proponga un único comando de shell por turno, con un máximo de 12 pasos por tarea y un tiempo límite de 60 segundos por comando, y aplica un filtro de seguridad que ejecuta automáticamente solo comandos de lectura sin tuberías, redirecciones ni expansiones. El segundo es la autoreparación de código: el modo `heal` ejecuta la suite de tests, envía los fallos junto con el código fuente al modelo, recibe un parche en formato JSON, lo valida, lo aplica, vuelve a ejecutar los tests y revierte automáticamente si no mejora.

Es relevante ahora como ejemplo de cliente de agente deliberadamente minimalista: no requiere GPU, no instala paquetes de terceros y solo necesita `python3` (3.10 o superior) y una clave de API. Su interés técnico está en el diseño del bucle de reparación —ediciones estrictas `{path, old, new}` con coincidencia exacta única, restricción de rutas a directorios editables, comprobación de compilación previa a escribir en disco, copias de seguridad y rollback— más que en cualquier capacidad de modelado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin licencia ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene un modelo neuronal, sino un cliente de agente en Python que consume una API compatible con OpenAI |
| Parámetros totales | No disponible (no se publican pesos; el modelo referenciado por defecto es Hermes 3 Llama 3.1 70B, servido externamente) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo y del proveedor configurados) |
| Tipos de cuantización | No aplica (no hay pesos locales) |
| Idiomas soportados | No disponible (no declarados en el repositorio ni en la model card) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | No aplica (el artefacto distribuido es código Python y un script de instalación; no hay `safetensors`, GGUF ni similares) |
| Tipo de artefacto | Herramienta CLI / agente de terminal para Linux |
| Runtime | Python 3.10 o superior, solo biblioteca estándar |
| Dependencias de terceros | Ninguna (`no third-party Python packages`) |
| Proveedor por defecto | `https://openrouter.ai/api/v1`, modelo `nousresearch/hermes-3-llama-3.1-70b` |
| Variables de configuración | `HERMES_API_KEY`, `HERMES_BASE_URL`, `HERMES_MODEL`, `HERMES_COMMAND_TIMEOUT` (60 s), `HERMES_MAX_STEPS` (12) |
| Modos de operación | `run` (propuesta y ejecución de comandos), `heal` (reparación de código guiada por tests), `doctor` (verificación de configuración y llamada real a la API) |
| Precedencia de configuración | Variables de entorno por encima de ficheros `.env`; orden de búsqueda: `./.env`, `<repo>/.env`, `~/.config/hermes-mend/.env`, o `--env-file` |
| Instalación | `setup.sh` idempotente, sin instalación a nivel de sistema, crea lanzador en `~/.local/bin/hermes-mend` y `.env` con permisos 600 |

## Arquitectura y entrenamiento

No existe entrenamiento ni conjunto de datos asociado a este repositorio: no se documentan tokens, composición del corpus, RLHF, DPO ni ninguna fase de ajuste. La "arquitectura" es la de una aplicación de línea de comandos organizada en módulos: `client.py` (cliente HTTP compatible con OpenAI), `config.py` (resolución de configuración), `safety.py` (filtro de políticas), `shell.py` (ejecución de comandos), `replies.py` (parseo de respuestas), `agent.py` (bucle del modo `run`), `healer.py` (bucle del modo `heal`) y `cli.py` (interfaz). Todas las respuestas del modelo deben ser JSON estricto; las respuestas malformadas se reintentan dentro del presupuesto de pasos o de intentos.

La innovación técnica destacable es el bucle de reparación con garantías. El modelo solo puede devolver ediciones `{path, old, new}`; cada fragmento `old` debe coincidir exactamente una vez en el fichero. Las rutas deben ser relativas, estar dentro de los directorios indicados con `--editable` (por defecto `src`) y terminar en `.py`; los tests nunca son editables. Un parche que no compile se rechaza antes de tocar el disco. El usuario ve un diff unificado y lo aprueba (salvo `--yes`), los originales y el diff se guardan en `.hermes-mend/backups/<timestamp>-attemptN/` y, si los tests siguen fallando tras el parche, los ficheros se restauran y el fallo se inyecta en el siguiente intento. Además, los ficheros del núcleo de reparación (`client.py`, `config.py`, `healer.py`, `replies.py`, `safety.py`, `shell.py`) están protegidos por defecto porque el bucle los necesita para funcionar; `--unprotect-kernel` es experimental y nunca desprotege `safety.py`. Por defecto solo son reparables `agent.py` y `cli.py` en este repositorio.

## Capacidades

- Generación de comandos de shell de un solo paso: el modo `run` solicita al modelo un comando por turno para una tarea en lenguaje natural, con un máximo configurable de turnos (12 por defecto).
- Ejecución con guardarraíles: los comandos de solo lectura (`ls`, `cat`, `uname`) se ejecutan automáticamente solo si no contienen tuberías, redirecciones ni expansiones; el resto requiere confirmación del usuario.
- Bloqueo de patrones destructivos y de ficheros de credenciales (`.env`, claves SSH, `/etc/shadow`) incluso con `--yes`.
- Redacción de la clave de API: nunca se imprime y se elimina de la salida de comandos que se envía al modelo.
- Autoreparación de código Python guiada por tests: ejecuta la suite, analiza fallos, propone parches mínimos, valida, aplica con aprobación y revierte si no hay mejora.
- Validación estricta de parches: coincidencia exacta única, rutas restringidas, extensión `.py`, comprobación de compilación previa, diff unificado y copias de seguridad por intento.
- Configuración por variables de entorno o ficheros `.env` con precedencia definida y soporte de `--env-file`.
- Comando de diagnóstico `doctor` que valida la configuración y realiza una llamada real a la API.
- Compatibilidad con cualquier endpoint compatible con OpenAI, no solo OpenRouter.
- Suite de tests offline: cliente falso programado, servidor HTTP local para el cliente de API y proyecto temporal para el bucle de reparación.
- Capacidad multilingüe: no disponible (no declarada).
- Tool calling, agentes multi-paso, visión, audio, modo thinking o matemáticas: no disponible como capacidades del modelo, ya que el repositorio no incluye modelo propio; cualquier capacidad de ese tipo depende del modelo Hermes configurado.

## Casos de uso

- Administración de sistemas en Kali Linux: `hermes-mend run "show disk usage and the five largest folders in /var/log"` permite obtener diagnósticos de almacenamiento sin escribir comandos a mano, con la ventaja de que solo los comandos de lectura se ejecutan sin confirmación y el resto pasa por revisión humana.
- Auditoría de puertos en un laboratorio aislado: `hermes-mend run --cwd ~/lab "list open listening ports on this machine"` es adecuado porque el directorio de trabajo es configurable y el modelo por defecto es remoto, de modo que el coste computacional local es nulo.
- Reparación automática de proyectos Python con buena cobertura de tests: `hermes-mend heal` ejecuta la suite, propone un parche mínimo, lo valida y lo revierte si no mejora; encaja en proyectos pequeños donde el bucle de tests es rápido y fiable.
- Integración en un flujo de CI/CD para parches asistidos: `hermes-mend heal --yes` aplica el parche sin confirmación interactiva pero mantiene la ejecución de tests y el rollback, lo que permite usarlo en un paso automatizado con red de seguridad.
- Ajuste del alcance de reparación en proyectos ajenos: `hermes-mend heal --root ~/proj --tests "pytest -q" --editable app --attempts 4` permite apuntar a un repositorio distinto, definir el comando de tests y limitar los directorios editables, algo útil para equipos que quieren restringir la superficie de modificación.
- Entornos con políticas estrictas de dependencias: al no requerir paquetes de terceros y necesitar solo `python3` y red hacia la API, es desplegable en máquinas donde instalar `pip install` está prohibido o auditado.
- Formación y concienciación en seguridad ofensiva: la combinación de confirmación explícita por comando, diff unificado antes de aplicar parches y bloqueo de ficheros de credenciales lo hace utilizable como herramienta didáctica para revisar qué propone un modelo y por qué.
- Prototipado de arneses de agente: sirve como implementación de referencia mínima de un bucle de agente con salida JSON estricta, reintentos y presupuesto de pasos, reutilizable como base para otros clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene pesos ni evaluación de capacidades del modelo, por lo que no procede comparar MMLU, HumanEval o GSM8K. Los únicos parámetros de rendimiento documentados son de naturaleza operativa: `HERMES_COMMAND_TIMEOUT` de 60 segundos por comando y `HERMES_MAX_STEPS` de 12 turnos por tarea; el número de intentos del modo `heal` es configurable con `--attempts` (el valor por defecto no se especifica). La latencia real depende por completo del proveedor de API y de la red.

## Requisitos de hardware

- VRAM para inferencia local: no aplica; el repositorio no ejecuta ningún modelo (`No local model, no GPU`).
- GPU recomendadas: ninguna. El cliente es CPU-only y su coste es el de un proceso Python que hace peticiones HTTP.
- GPU de consumidor: no aplica. El modelo Hermes 3 Llama 3.1 70B referenciado se ejecuta en el proveedor, no en la máquina local.
- CPU y memoria: solo se exige Python 3.10 o superior; no se publican cifras de RAM o disco mínimos (no disponible).
- Red: se requiere conectividad saliente hacia un endpoint compatible con OpenAI; el `setup.sh` en sí no necesita red.
- Almacenamiento: el código del repositorio más el directorio `.hermes-mend/backups/<timestamp>-attemptN/` generado por cada intento de reparación; no se documenta tamaño.
- Opciones de despliegue: `./setup.sh` (idempotente, crea lanzador en `~/.local/bin/hermes-mend`), ejecución sin lanzador mediante `PYTHONPATH=src python3 -m hermes_mend ...`, y ejecución de tests con `PYTHONPATH=src python3 -m unittest discover -s tests`. No se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo que servir.
- Latencia y throughput: no disponibles; dependen del proveedor de API, del modelo elegido y de la red. El límite de 60 segundos por comando acota el tiempo de ejecución de cada paso.

## Comparativa con modelos similares

No hay modelos comparables porque el artefacto no es un modelo. La comparación relevante es con otras herramientas de agente de terminal, y los datos de esas alternativas no están verificados en la información disponible, por lo que se marcan como tales.

| Herramienta | Tipo de artefacto | Modelo local | Dependencias de terceros | Ejecuta comandos | Bucle de autoreparación con tests | Licencia |
|---|---|---|---|---|---|---|
| hermes-mend | CLI de agente en Python | No (API) | Ninguna | Sí, con confirmación y filtro de políticas | Sí, con validación, diff, rollback y núcleo protegido | No disponible |
| Aider | Asistente de edición en terminal | No (API o local) | Requiere instalación de paquetes Python | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Open Interpreter | Intérprete de código asistido | No (API o local) | Requiere instalación de paquetes Python | Sí | No disponible en esta ficha | No disponible en esta ficha |
| SWE-agent | Agente de investigación para resolución de incidencias | No (API) | Entorno de ejecución con dependencias | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Hermes 3 Llama 3.1 70B | Modelo de lenguaje | Sí (o servido) | Runtime de inferencia | No | No | No disponible en esta ficha |

## Limitaciones y advertencias

- No es un modelo: no publica pesos ni resultados de evaluación, por lo que no puede compararse en benchmarks de capacidad con modelos de lenguaje.
- Ausencia de licencia declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial es admisible. Es un riesgo legal para producción.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de consulta, mantenido por un autor individual; no hay garantía de soporte ni de mantenimiento.
- Inconsistencia en metadatos: la fecha de creación indicada (2026-10-17T23:05:16Z) es posterior a la de última actualización (2026-10-17T22:58:40Z).
- `safety.py` es un filtro de políticas, no un sandbox. El propio autor advierte de que un modelo decidido o confundido puede causar daños con un comando aprobado; recomienda ejecutar como usuario sin privilegios, preferiblemente en una máquina virtual o contenedor, y leer cada comando aprobado.
- Exfiltración de datos: la salida de los comandos se envía al proveedor de API. No debe usarse sobre datos que no se puedan compartir.
- Dependencia de terceros: el funcionamiento depende de la disponibilidad del nombre del modelo en el proveedor (por defecto `nousresearch/hermes-3-llama-3.1-70b` en OpenRouter); si el proveedor retira el identificador, hay que reconfigurar `HERMES_MODEL`.
- JSON estricto obligatorio: las respuestas malformadas se reintentan dentro del presupuesto de pasos o de intentos, lo que puede consumir el presupuesto sin completar la tarea.
- El modo `heal` solo edita ficheros Python y su calidad depende del modelo y de la cobertura de tests; con tests débiles puede aplicar parches que pasan la suite sin corregir el problema real.
- El núcleo de reparación está protegido por defecto; `--unprotect-kernel` es experimental y `safety.py` permanece siempre protegido.
- Validación limitada: según la model card, la herramienta se ha probado únicamente contra una API simulada; la primera llamada real se realiza con `hermes-mend doctor`.
- Límites operativos fijos por defecto: 12 turnos por tarea y 60 segundos por comando.
- Idiomas no declarados: no hay información sobre calidad en castellano ni sobre el comportamiento del modelo subyacente en otros idiomas.
- Riesgo de alucinación en los comandos propuestos: el diseño mitiga el daño con confirmación y bloqueo de patrones destructivos, pero no verifica que el comando propuesto sea el correcto para la tarea solicitada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/hermes-mend
- Modelo por defecto referenciado en la model card: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-70B (referencia citada por el autor; no verificada en esta ficha)
- Proveedor por defecto: https://openrouter.ai/api/v1 (endpoint base configurable mediante `HERMES_BASE_URL`)
- Papers, blogs, repositorios adicionales o demos: no disponible en la información proporcionada.
