# xyznq1/xyz-wiki

## Resumen

xyz-wiki no es un modelo de lenguaje, sino un servidor MCP (Model Context Protocol) con interfaz de linea de comandos que dota a un agente de una wiki que el propio modelo escribe y mantiene actualizada. Lo publica el usuario xyznq1 en HuggingFace bajo licencia MIT, con el codigo alojado en GitHub. El problema que resuelve es el de la memoria persistente y estructurada de un agente: en lugar de recuperar fragmentos sueltos en cada consulta, el modelo convierte lo que se le entrega en paginas Markdown pequenas y enlazadas, una por concepto, entidad o afirmacion, con relaciones tipadas (`is_a`, `part_of`, `contradicts`, etc.).

La总线queda combina BM25 sobre titulo, alias y cuerpo con un recorrido del grafo de ontologia, sin modelo de embeddings, sin base de datos vectorial y sin GPU. El unico requisito de entorno es Node.js 22.13 o superior, que aporta `node:sqlite` con FTS5; el codigo son tres archivos y no tiene dependencias npm. Las paginas son ficheros Markdown con front matter estilo OKF v0.2, de modo que el repositorio funciona con git y el indice es una cache reconstruible.

Es relevante ahora porque cubre el patron "LLM wiki": las respuestas del agente se archivan como paginas de tipo `query`, de forma que el conocimiento se acumula entre sesiones en lugar de recalcularse en cada consulta. Se integra con cualquier cliente compatible con MCP (Claude Desktop, Claude Code, Cursor, OpenClaw, DeepSeek Harness) y el propio autor reporta que una wiki de 2.000 paginas responde una busqueda en menos de 80 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Servidor MCP sobre stdio mas CLI en Node.js; indice SQLite con FTS5 (BM25) y recorrido de grafo de ontologia. Sin embeddings ni base de datos vectorial |
| Parametros totales | No aplica (no hay pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica al componente. El coste de contexto depende del agente y del modelo que lo invoque; los tools devuelven fragmentos y cuerpos truncados, no la pagina completa por defecto |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (la model card no los especifica; el indice BM25 y el front matter no imponen idioma) |
| Licencia | MIT para xyz-wiki. La vision opcional depende de YOLOv5, bajo AGPL-3.0, que el usuario instala por su cuenta |
| Formato de pesos | No aplica. Formato de datos: Markdown con front matter estilo OKF v0.2; indice derivado en SQLite (`node:sqlite`, FTS5) |
| Entorno de ejecucion | Node.js 22.13 o superior, sin dependencias npm |
| Transporte | MCP sobre stdio |
| Version del esquema de pagina | OKF v0.2 |
| Descargas / likes en HuggingFace | 0 / 0 (a 29-09-2026) |
| Fecha de publicacion / actualizacion | 29-09-2026 / 29-09-2026 |

## Arquitectura y entrenamiento

No hay entrenamiento ni dataset: xyz-wiki no es un modelo, sino infraestructura de almacenamiento, indexacion y recuperacion para un agente. El reparto de responsabilidades es explicito en la model card: el modelo organiza (decide que paginas crear, que relaciones anadir y cuando una pagina queda obsoleta), mientras que el servidor solo almacena, indexa y recupera. El fichero `skills/xyz-wiki/SKILL.md` contiene las instrucciones que el agente necesita para ingerir, responder y mantener la wiki.

La implementacion se apoya en tres piezas. Primero, un conjunto de paginas Markdown con front matter que incluye `title`, `type`, `status` (draft/stable/deprecated), `aliases`, `sources`, `relations`, `verified` (unverified/machine-confirmed/human-reviewed) y `stale_after`; `type` es el unico campo imprescindible para un lector. Segundo, un indice SQLite con FTS5 que se reconstruye a partir de los ficheros y solo relee los que han cambiado, de modo que el repositorio es compatible con git. Tercero, una pasada de lint que detecta huerfanos, enlaces rotos, paginas sin tipo, paginas obsoletas, titulos casi duplicados y totales. La busqueda no usa representaciones vectoriales: se apoya en las palabras que el propio modelo eligio al escribir las paginas y en las relaciones tipadas que cubren lo que el keyword search deja escapar.

Como innovacion destacable, cada resultado de busqueda incluye un bloque `related` con las paginas a un salto de ontologia, y las respuestas se archivan como paginas `type: query`, lo que convierte el uso normal del agente en crecimiento del corpus. La vision es opcional y se activa solo si `XYZ_WIKI_PYTHON` apunta a un interprete con `yolov5` instalado: `wiki_see` devuelve los objetos de una imagen y su texto mediante Tesseract OCR, de forma que un modelo sin vision pueda aprender de capturas, graficos y escaneos.

## Capacidades

- Creacion y mantenimiento de una wiki de paginas Markdown enlazadas, una por concepto, entidad o afirmacion.
- Relaciones tipadas entre paginas (`is_a`, `part_of`, `contradicts`, y otras definidas por el agente) mediante `wiki_relate` y el bloque `relations`.
- Busqueda hibrilida BM25 (titulo, alias y cuerpo) mas recorrido del grafo de ontologia, con `wiki_search`.
- Lectura de pagina completa con front matter y cuerpo (`wiki_read`) y navegacion por vecinos en ambas direcciones hasta 3 saltos (`wiki_neighbors`).
- Listado por tipo (`wiki_list`) y lint de salud del grafo (`wiki_lint`).
- Ingesta de material externo: el agente convierte notas, documentos o fuentes en paginas enlazadas con trazabilidad (`sources`).
- Archivado de las propias respuestas como paginas `type: query`, que alimentan busquedas futuras.
- Soporte de `[[links]]` estilo wiki dentro del cuerpo de las paginas, ademas de las relaciones tipadas.
- OCR y deteccion de objetos en imagenes mediante `wiki_see` (opcional, requiere YOLOv5 y Tesseract).
- Integracion con cualquier cliente MCP por stdio: DeepSeek Harness, Claude Desktop, Claude Code, Cursor, OpenClaw.
- Interfaz de linea de comandos: `xyz-wiki ./wiki stats | lint | list [type] | search <words> | read <title> | reindex`.

## Casos de uso

- Memoria persistente de un agente de codigo: el agente registra decisiones de arquitectura, convenciones del repositorio y trampas conocidas como paginas enlazadas, y las recupera en sesiones posteriores sin depender de que el contexto de la conversacion las conserve.
- Base de conocimiento interna de un equipo: se alimenta con notas de reunion y documentacion dispersa, el modelo genera paginas atomicas con relaciones tipadas y `git` permite revisar, ramificar y fusionar los cambios como cualquier otro artefacto de texto.
- Investigacion y estudio de un dominio tecnico: el agente ingiere papers o articulos, crea una pagina por concepto y marca con `contradicts` las afirmaciones incompatibles, dejando el estado de cada pagina en `verified: unverified`.
- Atencion al cliente con corpus cambiante: las respuestas validas se archivan como paginas `query` y el lint senala paginas obsoletas (`stale_after`) cuando el material de origen cambia, sin necesidad de reindexar embeddings.
- Digitalizacion de archivo en papel o escaneado: con `wiki_see` activado, el agente extrae texto por OCR y objetos detectados de capturas y escaneos, y los convierte en paginas enlazadas aunque el modelo que las procese sea solo de texto.
- Limpieza y auditoria de una base documental: `wiki_lint` localiza huerfanos, enlaces rotos, paginas sin tipo y titulos casi duplicados, util como paso previo a una migracion o a una revision editorial.
- Entorno de desarrollo sin GPU ni servicios externos: al no requerir embeddings ni base de datos vectorial, encaja en portatiles, contenedores pequenos o entornos air-gapped donde solo se dispone de Node.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de calidad, ya que xyz-wiki no es un modelo de lenguaje. Las unicas cifras aportadas por el autor son de rendimiento del indice:

| Metrica | Valor reportado por el autor |
|---|---|
| Latencia de busqueda en una wiki de 2.000 paginas | Menos de 80 ms |
| Tiempo de reapertura del indice | Menos de 0,1 s |
| Relectura tras cambios | Solo los ficheros modificados |
| Coste de contexto por consulta | Fragmentos y cuerpos truncados, nunca la pagina completa por defecto |

Estas cifras proceden de la model card y del equipo del autor ("on our PC"), sin metodologia publicada, hardware especificado ni conjunto de prueba reproducible.

## Requisitos de hardware

- GPU: no se necesita ninguna. El diseno excluye explicitamente embeddings y base de datos vectorial.
- CPU y memoria: Node.js 22.13 o superior con `node:sqlite` y FTS5. La model card no especifica CPU, RAM ni latencia por operacion; no disponible.
- Almacenamiento: proporcional al numero y tamano de las paginas Markdown mas el indice SQLite derivado; no se publican cifras por pagina.
- Vision opcional: requiere un interprete de Python con `yolov5` instalado, el binario de Tesseract en el `PATH` (o la variable `TESSERACT`) y los pesos de YOLOv5 (`XYZ_VISION_WEIGHTS`, por defecto `yolov5s.pt`, descargados en el primer uso). El umbral de deteccion se ajusta con `XYZ_VISION_CONF` (por defecto 0,25).
- Despliegue: servidor MCP por stdio, lanzado como proceso local por el cliente. No se documentan modos HTTP, SSE ni despliegue remoto.
- Clientes compatibles: DeepSeek Harness (con el overlay `dsh/xyz-wiki.patch.yml`), Claude Desktop, Claude Code, Cursor, OpenClaw y cualquier otro cliente MCP.
- Backends de modelo: el overlay de DeepSeek Harness apunta a un servidor OpenAI-compatible propio (llama.cpp, vLLM u Ollama), de modo que la eleccion de GPU depende del modelo elegido, no de xyz-wiki.
- Latencia y throughput del modelo subyacente: no disponible; dependen por completo del LLM que se conecte.

## Comparativa con modelos similares

xyz-wiki no es un modelo, por lo que no existe una comparativa de parametros, contexto o licencia frente a LLM. La comparacion pertinente es frente al patron de recuperacion con embeddings que el propio autor descarta de forma explicita:

| Aspecto | xyz-wiki | RAG clasico con embeddings y base vectorial |
|---|---|---|
| Recuperacion | BM25 (FTS5) mas recorrido del grafo de ontologia | Similitud vectorial sobre fragmentos |
| Servicios externos | Ninguno; un proceso Node.js | Modelo de embeddings y base de datos vectorial |
| GPU | No necesaria | Habitualmente necesaria para el modelo de embeddings |
| Coste al cambiar el corpus | Solo se releen los ficheros modificados | Reindexado de los fragmentos afectados |
| Estructura del conocimiento | Paginas tipadas con relaciones explicitas | Fragmentos sin relaciones tipadas |
| Persistencia entre sesiones | Las respuestas se archivan como paginas `query` | No, salvo que se disene aparte |
| Licencia | MIT (YOLOv5 opcional bajo AGPL-3.0) | Depende del stack |
| Comparativa con otras herramientas de wiki o memoria para agentes | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Los resultados de busqueda web realizados no han devuelto ninguna comparativa relevante: los enlaces obtenidos son catalogos genericos de modelos (model.wiki, aimodelwiki.com, aiwiki.ai, genaiwiki.com) sin relacion con xyz-wiki.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo. Toda la calidad del contenido depende del LLM y del agente que se conecten; el servidor solo almacena, indexa y recupera.
- Ausencia de validacion externa: 0 descargas y 0 likes en HuggingFace en la fecha de publicacion, sin benchmarks publicados ni revision por terceros.
- Calidad del corpus: como las respuestas del agente se archivan automaticamente como paginas, una alucinacion del LLM puede quedar persistida en la wiki y ser recuperada en consultas posteriores. El campo `verified` existe, pero por defecto vale `unverified`.
- Sin busqueda semantica: al renunciar a los embeddings, la busqueda depende de las palabras exactas que el modelo escribio. Parafrasis, sinonimos no registrados como `aliases` o terminologia en otro idioma pueden no recuperarse; el autor asume esta limitacion y la compensa con el bloque `related` de la ontologia.
- Idioma: la model card no declara idiomas soportados ni calidad multilingue. El rendimiento en castellano no esta documentado.
- Duplicados y deriva de ontologia: el lint detecta titulos casi duplicados y paginas sin tipo, pero la consolidacion de relaciones redundantes o contradictorias queda en manos del agente, sin garantia automatica.
- Dependencia de Node.js 22.13 o superior por `node:sqlite` con FTS5; en versiones anteriores el indice no funciona.
- Vision opcional con licencia copyleft: YOLOv5 es AGPL-3.0 y no se distribuye con el proyecto; su uso en un servicio de red puede activar obligaciones de la AGPL. Tesseract se instala aparte.
- Transporte limitado a stdio: no se documentan modos HTTP, SSE ni autenticacion, control de acceso o concurrencia multiusuario, lo que dificulta su uso como servicio compartido en produccion.
- Rendimiento medido en un unico equipo del autor, sin metodologia ni hardware publicados; las cifras de 80 ms y 0,1 s no son reproducibles con la informacion disponible.
- Coste de contexto acotado por diseno (fragmentos y cuerpos truncados), pero la utilidad depende de que el agente formule bien las consultas y de la calidad del skill en `SKILL.md`.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/xyznq1/xyz-wiki
- Repositorio en GitHub: https://github.com/xyznq1/xyz-wiki.git
- Instalacion y tests: `git clone https://github.com/xyznq1/xyz-wiki.git && npm install -g ./xyz-wiki`, `cd xyz-wiki && npm test`
- Overlay para DeepSeek Harness: `dsh/xyz-wiki.patch.yml` dentro del repositorio
- Skill del agente: `skills/xyz-wiki/SKILL.md` dentro del repositorio
- Formato de pagina: Open Knowledge Format (OKF) v0.2
- Resultados de busqueda web no relacionados con este proyecto: https://model.wiki/, https://aimodelwiki.com/, https://aiwiki.ai/categories/AI%20Models, https://genaiwiki.com/models
