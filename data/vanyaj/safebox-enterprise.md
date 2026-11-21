# VanyaJ/safebox-enterprise

## Resumen

SafeBox v0.2 es una herramienta de ejecucion aislada para Windows escrita en Go, distribuida a traves de un repositorio de Hugging Face que no contiene pesos de modelo ni artefactos de aprendizaje automatico. El repositorio, con un tamano de 0.0 GB, no aloja ningun modelo de lenguaje: la model card describe un lanzador de escritorio que permite ejecutar aplicaciones como OpenWork (Tauri/WebView2), OpenCode, `cmd.exe` o accesos directos `.lnk` dentro de un entorno restringido, invocable desde el menu contextual de Windows.

La utilidad implementa aislamiento mediante mecanismos nativos del sistema operativo: integridad baja (`S-1-16-4096`), objetos Job con `KILL_ON_JOB_CLOSE` y limites de procesos y memoria, y UIPI. Anade un proxy HTTP/HTTPS local con listas de permitidos y bloqueados por dominio y CIDR, registro de auditoria en JSONL y deteccion de conexiones TCP directas que eludan el proxy mediante `GetExtendedTcpTable`. La implementacion declara cero drivers de kernel de terceros, cero inyeccion de DLL y cero dependencias externas mas alla de la biblioteca estandar de Go y la API Win32 oficial.

Es relevante para equipos que necesitan contener herramientas de desarrollo o agentes autonomos en estaciones Windows sin privilegios de administrador, con visibilidad sobre el trafico de red y capacidad de revertir cambios en carpetas de trabajo. No es un modelo de IA: es infraestructura de confinamiento que podria envolver la ejecucion de agentes o asistentes locales. No se dispone de informacion sobre arquitectura de red neuronal, parametros, contexto ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (herramienta de escritorio en Go, no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en coreano) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente y binarios `safebox.exe` y `safeboxw.exe`) |

## Arquitectura y entrenamiento

No aplica: el artefacto no es una red neuronal ni ha sido entrenado. La model card describe una herramienta compilada en Go que produce dos binarios: `safebox.exe` (interfaz de linea de comandos) y `safeboxw.exe` (lanzador GUI sin consola para el menu contextual). El aislamiento se apoya en primitivas del kernel de Windows: niveles de integridad, objetos Job, UIPI y reglas de firewall. La capa de red es un proxy `CONNECT` local con filtrado por dominio (compatibilidad con comodines tipo `*.corp.internal`), resolucion DNS seguida de comprobacion CIDR sobre la IP real, bloqueo de SSRF hacia loopback y `169.254.169.254`, y encadenamiento opcional a un proxy corporativo superior.

El registro de auditoria se escribe en `%LOCALAPPDATA%\SafeBox\logs\net-<session>.jsonl` con integridad media para impedir su manipulacion desde el proceso aislado. La restauracion de instantaneas bloquea escapes mediante junctions y enlaces simbolicos NTFS y verifica SHA-256. Existe una politica de administrador de solo lectura en `C:\ProgramData\SafeBox\policy.json` que prevalece sobre la configuracion de usuario con comportamiento fail-closed.

## Capacidades

- Ejecucion aislada de binarios `.exe`, accesos directos `.lnk`, scripts `.bat` y `.cmd` desde el menu contextual de Windows en `HKCU`, sin requerir privilegios de administrador.
- Apertura de consola CMD aislada sobre una carpeta concreta mediante la opcion de menu contextual de carpeta y fondo de carpeta.
- Confinamiento de escritura y borrado fuera de la carpeta de trabajo y de las carpetas adicionales permitidas (`allowed_write_dirs`, `--allow-dir`).
- Restauracion automatica de etiquetas de integridad a Medium al cerrar la sesion, con diario `active-labels` para recuperacion tras cierres anormales.
- Politica de entrada de aplicaciones por ruta real, nombre de fichero y SHA-256 mediante `allowed_apps` y `blocked_apps`.
- Paso de entorno minimo con lista de permitidos del sistema operativo y excepciones explicitas via `pass_env`, evitando la herencia completa de `os.Environ()`.
- Proxy de politicas de red con listas blancas y negras de dominios, listas blancas y negras CIDR, y proxy superior.
- Deteccion de elusion mediante sockets TCP directos (`monitor_direct_tcp`) con registro `DIRECT_DETECTED` y terminacion opcional con `kill_on_direct_bypass: true`.
- Consulta de historico de red con `safebox netlog`, filtrable por `--action BLOCK` o `--action DIRECT_DETECTED`, y estadisticas en tiempo real desde la bandeja del sistema.
- Indicacion visual del aislamiento mediante borde de color, insignia superior y icono en bandeja, con soporte DPI V2 por monitor y multiples monitores.
- Copia de seguridad automatica de la carpeta de trabajo antes de la ejecucion y restauracion verificada con SHA-256.
- Generacion de scripts de firewall de Windows con `fw-script` para bloquear por GPO las conexiones TCP directas de un programa concreto.

## Casos de uso

- Confinamiento de agentes de codificacion locales: ejecutar OpenCode u OpenWork dentro de SafeBox limita la escritura a la carpeta del proyecto y registra cada peticion de red, de modo que un agente que intente modificar configuracion global o exfiltrar datos queda bloqueado por integridad baja y UIPI.
- Evaluacion de dependencias y paquetes de terceros: lanzar `pip`, `npm` o `curl` bajo el proxy integrado con listas blancas de dominios y CIDR permite instalar desde registros aprobados y registrar cualquier intento hacia dominios no autorizados en el JSONL de auditoria.
- Prevencion de SSRF en pruebas de integracion: el bloqueo de loopback y de `169.254.169.254` impide que scripts de prueba alcancen servicios internos o metadatos de nube, algo util en pipelines que ejecutan codigo no confiable.
- Contencion de herramientas de escritorio en estaciones de analistas: abrir aplicaciones Electron o WebView2 aisladas con borde visual reduce el riesgo de que un complemento malicioso escriba fuera del espacio de trabajo o manipule ventanas de otras aplicaciones.
- Despliegue corporativo con politica centralizada: publicar `C:\ProgramData\SafeBox\policy.json` en modo solo lectura fuerza listas de aplicaciones y redes aprobadas por encima de la configuracion local, con fail-closed si el fichero no es legible.
- Auditoria de trafico de una sesion de depuracion: tras reproducir un fallo, `safebox netlog --action DIRECT_DETECTED` revela conexiones que evadieron el proxy, lo que ayuda a distinguir comportamiento legitimo de telemetria no declarada.
- Preparacion de bloqueo por firewall en entornos gestionados: generar `apply-fw.ps1` con `fw-script` y desplegarlo por GPO para cubrir el caso de sockets TCP de muy corta duracion y trafico UDP que el monitor no intercepta de forma garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM: la herramienta no ejecuta inferencia. Consume memoria del proceso Go y la de las aplicaciones confinadas, acotada por el objeto Job (limite de procesos y memoria configurable).
- Sistema operativo: Windows, con API Win32 oficial, integridad baja, objetos Job, UIPI y `iphlpapi.dll` (`GetExtendedTcpTable`) disponibles.
- Compilacion multiplataforma desde macOS, Linux o Windows mediante `scripts/build-windows.sh`, que produce `dist/safebox.exe` y `dist/safeboxw.exe`.
- Despliegue: binario unico sin dependencias externas; instalacion del menu contextual con `safebox.exe install` y generacion de configuracion de ejemplo con `safebox.exe init-config`.
- GPU: no disponible, no se requiere.
- Latencia y throughput: no disponibles; la sobrecarga depende del volumen de peticiones que atraviesan el proxy local y del numero de procesos monitorizados.
- Permisos: la ejecucion basica no requiere administrador; la aplicacion de reglas de firewall por GPO y la politica de administrador en `C:\ProgramData` requieren despliegue gestionado.

## Comparativa con modelos similares

| Herramienta | Mecanismo de aislamiento | Control de red | Licencia | Requiere admin |
|---|---|---|---|---|
| SafeBox v0.2 | Integridad baja, Job Object, UIPI, sin drivers | Proxy local con listas dominio/CIDR y deteccion de TCP directo | no disponible | No para uso basico; si para GPO y firewall |
| Sandboxie-Plus | Virtualizacion de sistema de ficheros y registro | Filtrado por proceso, requiere driver | no disponible en esta ficha | Tipicamente si para instalar el driver |
| Windows Sandbox | Contenedor ligero con Windows completo | Configurable por politica, requiere virtualizacion | Propietaria de Microsoft | Si, requiere edicion Pro/Enterprise |
| AppContainer / WDAC | Contenedores de aplicacion y politicas de control | Gestionada por politica corporativa | Propietaria de Microsoft | Si, despliegue por GPO |

La comparativa se limita a alternativas de confinamiento en Windows porque el repositorio no contiene un modelo comparable en parametros o contexto. Los datos de las filas de terceros no proceden de la informacion proporcionada y deben verificarse en sus fuentes oficiales.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: cualquier evaluacion como modelo de lenguaje, vision o agentes es inaplicable. Tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta.
- La licencia no esta declarada, por lo que no se puede confirmar el uso comercial, la redistribucion ni la modificacion del codigo.
- La model card esta redactada en coreano y no declara idiomas soportados para la interfaz ni para la documentacion.
- Control de aplicaciones limitado sin privilegios: `allowed_apps` y `blocked_apps` actuan como puerta de entrada del lanzador; procesos hijos creados directamente desde el shell o renombrados solo quedan cubiertos con AppLocker o WDAC por GPO.
- Control de red no absoluto: el proxy cubre aplicaciones conscientes de proxy y el monitor detecta conexiones TCP directas, pero sockets de muy corta duracion (menos de 150 ms) y trafico UDP no estan garantizados; la model card recomienda combinarlo con reglas de firewall de salida y proxy perimetral.
- Persistencia de configuracion: la politica de administrador en `C:\ProgramData\SafeBox\policy.json` prevalece sobre `safebox.json` con fail-closed, lo que puede bloquear flujos legitimos si no se planifica el despliegue.
- Dependencia de primitivas de Windows: integridad, Job Objects y UIPI no existen en otros sistemas operativos, por lo que no hay paridad funcional fuera de Windows.
- Riesgo operativo en restauracion: aunque se bloquean junctions y enlaces simbolicos NTFS y se verifica SHA-256, la restauracion de instantaneas debe probarse en cada entorno antes de confiar en ella para recuperar datos.
- Ausencia de benchmarks, metricas de rendimiento y pruebas independientes publicadas en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VanyaJ/safebox-enterprise
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo, demos ni documentacion adicional asociados a este artefacto.
