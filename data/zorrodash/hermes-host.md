# zorrodash/hermes-host

## Resumen

`zorrodash/hermes-host` no es un modelo de lenguaje: es un repositorio de Hugging Face que contiene un paquete de despliegue (deployment bundle) para ejecutar un gateway de Hermes Agent, el proyecto de agentes de Nous Research. El repositorio no publica pesos, tokenizador, arquitectura ni datos de entrenamiento; su contenido son ficheros de infraestructura: `Dockerfile`, `start.sh`, `sync_state.py`, `config.template.yaml`, `k8s/openshift.yaml`, `deploy-openshift.sh` y `render.yaml`.

El problema que resuelve es acotado y operativo: permitir que un gateway de agente se ejecute en alojamiento gratuito y sin tarjeta de crédito, con dos objetivos declarados por el autor, Red Hat OpenShift Developer Sandbox (14 GB de RAM, 40 GB de almacenamiento, ruta HTTPS, 30 días de vida, sin tarjeta) y Render como servicio web gratuito (512 MB, 750 horas al mes, sin tarjeta, se suspende tras 15 minutos de inactividad), además de cualquier host Docker, ya que la imagen es autocontenida.

Su rasgo técnico diferencial es la gestión de estado: el contenedor no conserva nada crítico en su propio disco, sino que en el arranque restaura `~/.hermes` desde un dataset privado de Hugging Face o desde un PVC montado, y lo vuelve a subir de forma periódica mediante un bucle de sincronización, de modo que reinicios, reconstrucciones y reprogramaciones no pierden estado. El script de sincronización se declara seguro para SQLite. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de pesos; el repositorio contiene un bundle de despliegue) |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |
| Tipo de artefacto | bundle de despliegue en Docker y manifiestos de Kubernetes |
| Ficheros incluidos | `Dockerfile`, `start.sh`, `sync_state.py`, `config.template.yaml`, `k8s/openshift.yaml`, `deploy-openshift.sh`, `render.yaml` |
| Objetivos de despliegue | OpenShift Developer Sandbox (14 GB RAM, 40 GB almacenamiento, ruta HTTPS, 30 dias), Render free web service (512 MB, 750 h/mes, suspension tras 15 min de inactividad), cualquier host Docker |
| Gestion de estado | restauracion de `~/.hermes` al arrancar y sincronizacion periodica hacia un dataset privado de Hugging Face o PVC |
| Gestion de secretos | variables de entorno de la plataforma o secretos de Kubernetes; nunca almacenados en el repositorio |
| Etiquetas del repositorio | `region:us` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-14T12:59:19Z |
| Ultima actualizacion | 2026-09-14T12:59:29Z |

## Arquitectura y entrenamiento

No existe entrenamiento asociado a este repositorio: no hay arquitectura de red neuronal, dataset, número de tokens, ni fases de RLHF, DPO o ajuste supervisado documentadas. Lo que describe la model card es una arquitectura de despliegue. En el arranque, `start.sh` encadena la resolución de secretos, la generación de configuración, la restauración de estado, la apertura de un puerto de salud, el bucle de sincronización y, finalmente, el arranque del gateway. El `Dockerfile` instala Hermes en una configuración de bajo consumo de RAM y sin navegador ni capacidades de computer-use, lo que reduce la superficie de recursos y de ataque.

La innovación reseñable es el desacoplamiento entre cómputo y estado. Como las plataformas objetivo son efímeras (Render suspende el servicio tras 15 minutos de inactividad y el sandbox de OpenShift caduca a los 30 días), el autor externaliza `~/.hermes` a un dataset privado de Hugging Face o a un volumen persistente, con un script (`sync_state.py`) que declara ser seguro para bases de datos SQLite, el formato habitual de estado en agentes de este tipo. El repositorio también incluye un manifiesto completo de OpenShift con PVC, BuildConfig, Deployment, Service y Route, y un script de despliegue que automatiza login, build, secretos, rollout y obtención de URL.

## Capacidades

- Despliegue reproducible de un gateway de Hermes Agent mediante una única imagen Docker autocontenida.
- Ejecución en OpenShift Developer Sandbox con PVC, BuildConfig, Deployment, Service y Route ya definidos.
- Ejecución en Render como servicio web gratuito mediante `render.yaml`.
- Persistencia de estado entre reinicios, reconstrucciones y reprogramaciones del contenedor.
- Sincronización bidireccional de `~/.hermes` con un dataset privado de Hugging Face, declarada segura para SQLite.
- Configuración de bajo consumo de RAM mediante `config.template.yaml`.
- Inyección de secretos por variables de entorno o secretos de Kubernetes, sin credenciales en el repositorio.
- Puerto de salud para comprobaciones de disponibilidad por parte de la plataforma.
- Automatización del despliegue en OpenShift (login, build, secretos, rollout, URL).
- No incluye capacidades de navegador ni de computer-use, por decisión de diseño orientada a bajo consumo.
- No se documentan capacidades del modelo subyacente (generación, razonamiento, código, tool calling, multilingüismo): no disponibles.

## Casos de uso

- Evaluación de un gateway de Hermes Agent sin coste ni tarjeta de crédito: se despliega el bundle en OpenShift Developer Sandbox y se valida el comportamiento del agente durante los 30 días de vida del sandbox antes de comprometer presupuesto en infraestructura gestionada.
- Demos internas y pruebas de concepto con presupuesto cero: Render free permite publicar un endpoint HTTPS accesible por el equipo con 750 horas al mes, asumiendo la suspensión tras 15 minutos de inactividad.
- Integración continua de conectores del agente: al ser una imagen Docker autocontenida, puede levantarse en cualquier runner de CI para verificar que el gateway arranca, restaura estado y responde en el puerto de salud.
- Continuidad de servicio ante reinicios de plataforma: el ciclo de restauración y subida periódica de `~/.hermes` evita perder sesiones y bases de datos SQLite cuando Render suspende el servicio o cuando OpenShift reprograma el pod.
- Migración entre proveedores de alojamiento: los mismos ficheros de configuración permiten mover el gateway de OpenShift a Render o a un VPS propio sin reescribir la lógica de estado.
- entornos de desarrollo efímeros para un equipo: cada desarrollador puede levantar su propia instancia sin riesgo de fuga de credenciales, ya que los secretos se suministran como variables de entorno o secretos de Kubernetes y nunca se versionan.
- Auditoría de configuración de bajo consumo: `config.template.yaml` sirve como base mínima para medir el consumo real del gateway en 512 MB y decidir si conviene escalar a un plan de pago.
- Automatización de despliegues en Kubernetes con OpenShift: `deploy-openshift.sh` encadena login, build, secretos, rollout y recuperación de URL, lo que permite usarlo como paso de un pipeline de entrega.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni evaluación de modelos, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se publican medidas de latencia, throughput, consumo real de memoria ni tiempo de arranque del contenedor.

## Requisitos de hardware

- No requiere GPU para el bundle en sí: el repositorio no incluye inferencia de pesos. No se especifica si el gateway delega en APIs externas o en un runtime local; ese dato no está disponible.
- Memoria mínima declarada para el objetivo Render: 512 MB de RAM.
- Memoria disponible en el objetivo OpenShift Developer Sandbox: 14 GB de RAM.
- Almacenamiento en OpenShift Developer Sandbox: 40 GB, con PVC para estado persistente.
- Cualquier host Docker con recursos suficientes para la imagen; el autor indica que la imagen es autocontenida.
- El `Dockerfile` está ajustado a bajo consumo de RAM y excluye navegador y computer-use, lo que reduce los requisitos frente a una instalación completa de Hermes.
- Latencia y throughput: no disponible. La suspensión tras 15 minutos de inactividad en Render implica arranques en frío cuyo tiempo no se documenta.
- Opciones de despliegue soportadas: OpenShift (manifiestos en `k8s/openshift.yaml`), Render (`render.yaml`) y Docker genérico. No se mencionan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo local que servir.

## Comparativa con modelos similares

No existe comparativa con modelos porque `zorrodash/hermes-host` no es un modelo. A continuación se comparan los tres objetivos de despliegue que describe el propio repositorio:

| Objetivo | Recursos | Persistencia | Limitaciones | Coste |
|---|---|---|---|---|
| OpenShift Developer Sandbox | 14 GB RAM, 40 GB almacenamiento, ruta HTTPS | PVC incluido en el manifiesto | Caduca a los 30 días | Gratuito, sin tarjeta |
| Render free web service | 512 MB, 750 h/mes | Depende de la sincronización con dataset externo | Se suspende tras 15 min de inactividad | Gratuito, sin tarjeta |
| Host Docker genérico | Según el host | Volumen montado por el operador | El operador asume la gestión | Según el proveedor |

Como referencia de categoría, existen otros bundles de despliegue de agentes publicados en Hugging Face y en GitHub, pero no se dispone de datos verificables sobre ellos en la información proporcionada. Comparativa con modelos alternativos: no disponible.

## Limitaciones y advertencias

- No es un modelo: quien busque pesos, tokenizador, arquitectura o benchmarks de un LLM no los encontrará aquí.
- El repositorio no declara licencia, lo que genera incertidumbre jurídica sobre el uso comercial y sobre la redistribución de la imagen y los manifiestos.
- El estado del agente se sincroniza con un dataset privado de Hugging Face; si ese dataset no está disponible o las credenciales caducan, se puede perder estado entre reinicios.
- En Render, la suspensión tras 15 minutos de inactividad implica arranques en frío y posibles cortes en flujos de conversación de larga duración.
- El sandbox de OpenShift caduca a los 30 días, por lo que no es una plataforma válida para producción continuada sin migración.
- Con 512 MB de RAM el margen es estrecho: configuraciones que activen navegador o computer-use quedan fuera del diseño del `Dockerfile`.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no evaluables, ya que dependen del modelo subyacente que el gateway invoque y ese dato no está documentado en el repositorio.
- El repositorio registra 0 descargas y 0 likes y fue creado y actualizado con 10 segundos de diferencia, por lo que no hay evidencia de uso real ni de mantenimiento posterior.
- El autor advierte explícitamente de que los secretos nunca deben almacenarse en el repositorio; los despliegues que ignoren esta pauta pueden filtrar credenciales.
- Los resultados de la búsqueda web asociados a esta consulta tratan sobre Outlook y no guardan relación con el repositorio: no aportan información técnica utilizable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zorrodash/hermes-host
- Hermes Agent (Nous Research): https://github.com/NousResearch/hermes-agent
- Paper, blog, demo o documentación adicional: no disponible
