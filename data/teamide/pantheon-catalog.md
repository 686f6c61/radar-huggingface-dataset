# TeamIDE/pantheon-catalog

## Resumen

Pantheon Local catalog es un repositorio de HuggingFace publicado por TeamIDE que no contiene pesos de un modelo de lenguaje, sino un catálogo firmado de modelos que una caja Pantheon Local puede instalar. El artefacto principal es `catalog.json`, un manifiesto en el que cada entrada queda fijada por revisión de repositorio y hash sha256, acompañado de `catalog.json.minisig`, su firma minisign. Las cajas Pantheon verifican esa firma contra una clave pública embebida en el propio producto antes de usar cualquier contenido del catálogo.

No se trata, por tanto, de un modelo entrenado ni de un checkpoint: no hay arquitectura, parametros, tokenizador ni ventana de contexto asociados. Su funcion es de cadena de suministro: garantizar que los modelos que un dispositivo Pantheon Local descarga e instala son exactamente los que TeamIDE ha construido y medido para una tarjeta concreta, sin manipulacion intermedia.

La relevancia de este tipo de repositorio es creciente en despliegues de IA en local y en el borde, donde la integridad del artefacto instalado importa tanto como la calidad del modelo. La ficha que sigue documenta el repositorio con los datos disponibles, que son escasos, y marca explicitamente como no disponible todo aquello que la model card no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un manifiesto firmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el catalogo referencia modelos de terceros o propios, sin detallar cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefactos: `catalog.json` y `catalog.json.minisig`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. Su "arquitectura" es un manifiesto JSON en el que cada entrada queda anclada a una revisión de repositorio y a un hash sha256, mas una firma minisign sobre dicho manifiesto. Las cajas Pantheon Local incorporan una clave pública en el binario y validan la firma antes de procesar el catalogo, lo que proporciona integridad y autenticidad del listado de modelos instalables.

No hay datos de entrenamiento, tokens procesados, composicion de dataset ni fases de RLHF o DPO porque no existe un proceso de entrenamiento asociado a este repositorio. La innovacion tecnica, en todo caso, es el modelo de confianza: fijacion por revisión y hash, firma minisign y verificacion en el dispositivo, que evita ataques de sustitución de artefactos en la cadena de distribucion.

## Capacidades

- Distribucion firmada de un catalogo de modelos instalables en cajas Pantheon Local.
- Verificacion criptografica del manifiesto mediante minisign contra una clave publica embebida en el producto.
- Fijacion por revisión de repositorio y sha256 de cada archivo listado, lo que permite reproducibilidad y deteccion de manipulacion.
- Asociacion de cada modelo del catalogo a una tarjeta concreta ("specific card") para la que TeamIDE lo ha construido y medido.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente por si mismo; esas capacidades dependerian de los modelos referenciados en el catalogo, cuyos datos no se detallan en la informacion disponible.

## Casos de uso

- Aprovisionamiento de dispositivos Pantheon Local: la caja descarga `catalog.json` y `catalog.json.minisig`, verifica la firma y solo entonces resuelve que modelos puede instalar, evitando instalar artefactos no firmados por TeamIDE.
- Auditoria de cadena de suministro: un equipo de seguridad puede revisar el manifiesto y comprobar que cada modelo instalado coincide con la revisión y el sha256 fijados, lo que facilita la trazabilidad en entornos regulados.
- Despliegue en el borde sin conectividad permanente: al estar el catalogo fijado y firmado, el dispositivo puede validar la integridad de actualizaciones descargadas de forma intermitente sin depender de un servicio central en cada arranque.
- Reproducibilidad de entornos: al anclar revisiones y hashes, dos cajas Pantheon Local aprovisionadas en momentos distintos pueden garantizar que ejecutan exactamente los mismos artefactos.
- Gestion de actualizaciones controladas: la rotacion del catalogo permite a TeamIDE publicar nuevas versiones de modelos o retirar entradas sin cambiar el mecanismo de confianza del dispositivo.
- Integracion en pipelines de CI/CD internos: un pipeline puede consumir el manifiesto para construir imagenes o dispositivos de prueba con las mismas revisiones que usara produccion, verificando la firma como paso previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos; depende de los modelos referenciados en el catalogo).
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU de consumo: no disponible; dependera de los modelos listados en el catalogo.
- Opciones de despliegue: el mecanismo descrito esta ligado a cajas Pantheon Local, que verifican la firma minisign contra una clave publica embebida. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | Pantheon Local catalog (TeamIDE) | Repositorios de pesos en HuggingFace | Catalogos de paquetes firmados (p. ej. APT, OCI) |
|---|---|---|---|
| Contenido | Manifiesto JSON firmado con revisiones y sha256 | Pesos y tokenizador del modelo | Metadatos y artefactos firmados |
| Verificacion | minisign contra clave publica embebida | Hash opcional, sin firma por defecto | Firmas GPG o cosign segun ecosistema |
| Parametros y contexto | no disponible | Definidos por el modelo | no aplica |
| Licencia | no disponible | Variable | Variable |
| Uso previsto | Aprovisionamiento de cajas Pantheon Local | Inferencia directa | Distribucion de software |

No se dispone de informacion sobre modelos comparables dentro del mismo producto ni sobre el contenido concreto de los modelos referenciados en el catalogo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para inferencia, generacion ni tareas cognitivas por si mismo.
- La model card no especifica licencia, idiomas, pipeline ni contenido de los modelos referenciados; cualquier uso comercial requiere contactar con TeamIDE o consultar la documentacion de Pantheon.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no permite inferir adopcion ni soporte comunitario.
- La confianza descansa en la clave publica embebida en las cajas Pantheon y en la infraestructura de firma de TeamIDE; un compromiso de esa clave afectaria a todos los dispositivos.
- La integridad del catalogo no garantiza la calidad ni la seguridad de los modelos listados: solo que son los artefactos que TeamIDE ha publicado.
- El enlace del proyecto apunta a un dominio propio (`git.teamide.dev`) que debe verificarse antes de integrarlo en produccion.
- No hay informacion sobre frecuencia de actualizacion del catalogo, politica de retirada de entradas ni proceso de respuesta ante incidentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TeamIDE/pantheon-catalog
- Proyecto Pantheon: https://git.teamide.dev/David/Pantheon
