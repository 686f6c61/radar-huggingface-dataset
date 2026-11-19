# yurivvv/n8n-free

## Resumen

`yurivvv/n8n-free` es un repositorio alojado en Hugging Face que, pese a estar catalogado en la plataforma, no contiene un modelo de inteligencia artificial. Se trata de un Hugging Face Space empaquetado con SDK Docker que ejecuta una instancia extendida de n8n, la herramienta de automatizacion de flujos de trabajo open source y self-hostable. El autor del Space es yurivvv, mientras que la model card atribuye su creacion a ABCD O y EnzGamers.

El contenedor esta construido sobre la imagen base `node:24-alpine` e incluye n8n en su version 2.48.6 junto con un conjunto amplio de dependencias de sistema (Chromium, Python 3, pip, git, build-base, g++, make, postgresql-client, cairo-dev, pango-dev). El objetivo declarado es permitir que los nodos de comunidad de n8n que normalmente fallan en una instalacion estandar funcionen sin configuracion adicional.

Por tanto, esta ficha no puede describir arquitectura de red neuronal, parametros, contexto ni capacidades de generacion de texto: no existe un modelo subyacente. La utilidad del artefacto es la de un entorno de automatizacion desplegable como servicio, con persistencia efimera por defecto y opcion de conectar a PostgreSQL externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un Hugging Face Space con SDK Docker) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es una imagen Docker definida por `Dockerfile`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto es una imagen Docker basada en `node:24-alpine` que instala n8n 2.48.6 mediante el gestor de paquetes de Alpine y anade dependencias de sistema: `git`, `python3`, `chromium`, `build-base`, `postgresql-client`, `cairo-dev` y `pango-dev`, entre otras. Configura la variable `PUPPETEER_EXECUTABLE_PATH` para apuntar al Chromium incluido y crea el directorio de datos en `/root/.n8n` con permisos adecuados.

El arranque se realiza con el comando por defecto `n8n start`. La persistencia por defecto usa SQLite sobre el sistema de ficheros efimero del Space; para produccion se documenta la conexion a PostgreSQL externo mediante las variables `DB_TYPE`, `DB_POSTGRESDB_HOST`, `DB_POSTGRESDB_DATABASE`, `DB_POSTGRESDB_USER`, `DB_POSTGRESDB_PASSWORD` y `DB_POSTGRESDB_PORT`. No hay innovaciones de inferencia (decodificacion especulativa, atencion lineal, RLHF/DPO) porque no aplica.

## Capacidades

- Ejecucion de flujos de trabajo de automatizacion de n8n con editor web accesible desde el Space.
- Automatizacion de navegador, scraping web y generacion de PDF mediante Chromium preinstalado.
- Ejecucion de scripts Python dentro de los flujos gracias a `python3` y `pip`.
- Interaccion con repositorios Git desde los nodos de n8n.
- Compilacion de addons nativos para nodos de comunidad mediante `build-base`, `g++` y `make`.
- Conexion a bases de datos PostgreSQL externas con `postgresql-client`.
- Manipulacion de imagenes y canvas con `cairo-dev` y `pango-dev`.
- Configuracion de timezone del servidor para nodos CRON mediante `GENERIC_TIMEZONE`.
- Permitir modulos npm externos en nodos Function mediante `NODE_FUNCTION_ALLOW_EXTERNAL`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling de LLM ni capacidades multilingues propias.

## Casos de uso

- Automatizacion de scraping web programado: los flujos de n8n pueden lanzar Chromium para extraer datos de sitios dinamicos y almacenarlos en una base de datos, aprovechando el binario preinstalado y `PUPPETEER_EXECUTABLE_PATH`.
- Generacion automatizada de informes en PDF: los nodos que renderizan HTML a PDF funcionan sin instalar dependencias adicionales gracias a Chromium y a las librerias graficas `cairo-dev` y `pango-dev`.
- Orquestacion de pipelines de datos con Python: los nodos Function y Execute Command pueden invocar scripts Python que consuman APIs y transformen datos antes de enviarlos a PostgreSQL.
- Integracion con Supabase u otro PostgreSQL gestionado: configurando las variables `DB_POSTGRESDB_*` se obtiene persistencia robusta de flujos y credenciales fuera del filesystem efimero del Space.
- Prototipado rapido de integraciones entre SaaS: el editor de n8n permite encadenar webhooks, HTTP Request y nodos de comunidad para conectar servicios sin escribir infraestructura.
- Pruebas de nodos de comunidad que requieren compilacion nativa: el entorno incluye `build-base`, `g++` y `make`, lo que permite validar nodos que fallan en instalaciones estandar.
- Entorno de demostracion para formacion: un Space publico con n8n permite a un equipo explorar automatizaciones sin aprovisionar servidores, aceptando la naturaleza efimera del almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Memoria y CPU: dependen del plan de Hugging Face Spaces asignado al contenedor; la informacion proporcionada no especifica limites concretos.
- Opciones de despliegue: Hugging Face Spaces con SDK Docker; alternativamente, la misma imagen puede construirse y ejecutarse en cualquier entorno compatible con Docker (local, VPS, Kubernetes) a partir del `Dockerfile` incluido.
- Latencia y throughput: no disponibles; dependen del hardware del Space y de la carga de los flujos de n8n.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yurivvv/n8n-free | Space Docker con n8n 2.48.6 | no aplica | no aplica | MIT | Hugging Face Space |
| n8n oficial (imagen Docker `n8nio/n8n`) | Herramienta de automatizacion | no aplica | no aplica | Fair-code (Sustainable Use License) | Docker Hub |
| n8n self-hosted con imagen personalizada | Herramienta de automatizacion | no aplica | no aplica | Segun configuracion | Autogestionado |

La comparativa relevante es frente a la imagen oficial de n8n: este Space anade dependencias de sistema (Chromium, Python, herramientas de compilacion) que la imagen oficial no incluye por defecto, a cambio de depender de la infraestructura y del ciclo de vida de Hugging Face Spaces.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa lenguaje natural por si mismo.
- El sistema de ficheros de Hugging Face Spaces es efimero; los flujos y credenciales guardados en SQLite se pierden al reiniciar el Space salvo que se exporten o se use PostgreSQL externo.
- Sin `N8N_ENCRYPTION_KEY` configurada, las credenciales almacenadas tienen menor proteccion; la model card lo marca como altamente recomendado.
- `WEBHOOK_URL` es obligatoria para produccion; sin ella los webhooks publicos pueden no resolverse correctamente.
- La licencia del repositorio es MIT, pero n8n se distribuye bajo licencia fair-code (Sustainable Use License), con restricciones para reventa o uso comercial no autorizado; conviene revisar los terminos de n8n antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), lo que sugiere que no ha sido validado por la comunidad.
- La model card contiene emojis y una descripcion breve que menciona Supabase; no se aportan datos de rendimiento, seguridad ni auditoria.
- El resultado de busqueda web proporcionado (comparativa YouTube Shorts vs TikTok) no guarda relacion con el artefacto y no aporta informacion tecnica util.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yurivvv/n8n-free
- n8n (sitio oficial): https://n8n.io/
- Referencia de configuracion de Hugging Face Spaces: https://huggingface.co/docs/hub/spaces-config-reference
- Creador citado en la model card: https://abcdo.tn/
- Perfil de EnzGamers en Hugging Face: https://huggingface.co/EnzGamers
- Lista de zonas horarias IANA (referenciada para `GENERIC_TIMEZONE`): https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
