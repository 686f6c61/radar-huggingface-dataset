# thiagocfa/compraribeirao

## Resumen

`thiagocfa/compraribeirao` es un repositorio alojado en Hugging Face que, a pesar de su identificador y ubicacion en la plataforma, no contiene un modelo de lenguaje en el sentido habitual. La model card describe un proyecto de software denominado CompraRibeirão, un buscador en tiempo real de productos en el comercio fisico de Ribeirão Preto (São Paulo, Brasil). El repositorio no expone pesos, tokenizador ni configuracion de inferencia; el contenido descrito es una aplicacion web con backend en Python (FastAPI/uvicorn) y un motor de busqueda textual SQLite FTS5.

El sistema indexa catalogos de comercios locales mediante crawlers especificos para plataformas de e-commerce (VTEX y Tray), y ofrece busqueda instantanea por nombre de producto, marca, categoria o barrio. Ademas, incorpora conversion directa al comercio mediante enlaces de WhatsApp con mensajes preformateados y enlaces a la ficha del producto en la tienda oficial, junto con un espacio publicitario para patrocinios locales.

Por tanto, esta ficha no puede documentar arquitectura de red neuronal, parametros, contexto ni capacidades generativas, ya que la informacion disponible no describe un modelo de IA. El tamano del repositorio (0,1 GB) es coherente con un proyecto de codigo y datos de catalogo, no con pesos de un modelo. No se dispone de informacion sobre licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio describe una aplicacion web con backend FastAPI y busqueda SQLite FTS5, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz descrita esta en portugues de Brasil) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo y datos de catalogo, tamano 0,1 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de modelo, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de ajuste como RLHF o DPO. La model card describe exclusivamente la arquitectura de una aplicacion: un servidor web y API levantado con uvicorn sobre un modulo `backend.api`, crawlers especificos para VTEX (`backend/crawlers/vtex_crawler.py`) y Tray (`backend/crawlers/tray_crawler.py`), y un indexador (`backend/indexer.py`) que reconstruye un indice de busqueda FTS5 de SQLite.

El motor de busqueda descrito es FTS5, el modulo de busqueda de texto completo integrado en SQLite, que permite consultas por coincidencia de terminos en milisegundos sobre el catalogo indexado. No se menciona ningun componente de aprendizaje automatico, embeddings, reranking ni generacion de texto.

## Capacidades

- Busqueda textual instantanea sobre catalogo de productos mediante SQLite FTS5, por nombre, marca, categoria o barrio.
- Indexacion de catalogos de comercios locales a traves de crawlers para las plataformas VTEX y Tray.
- Generacion de enlaces de contacto con el comercio via WhatsApp con mensaje preformateado.
- Enlace directo a la pagina del producto en el sitio oficial de la tienda.
- Gestion de espacio publicitario: banner de cabecera y etiqueta de patrocinio con prioridad en resultados de busqueda.
- No se describe soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues propias de un modelo generativo.

## Casos de uso

- Busqueda de productos en comercios fisicos de Ribeirão Preto: el sistema indexa catalogos de ferreteria, repuestos de automocion y herramientas, y permite localizar un producto por nombre o marca en milisegundos mediante FTS5.
- Verificacion de disponibilidad para retirada inmediata: el boton de WhatsApp genera un mensaje preformateado que el usuario envia al comercio para confirmar stock antes de desplazarse.
- Comparacion de ofertas entre comercios locales: al centralizar catalogos de varias tiendas, el buscador permite localizar el mismo tipo de producto en distintos establecimientos y barrios.
- Monetizacion mediante publicidad local: comercios pueden contratar un banner de cabecera o la etiqueta de patrocinio para aparecer destacados en los resultados de busqueda.
- Despliegue de portales de comercio local para asociaciones de comerciantes: el backend FastAPI y el indice FTS5 permiten levantar una instancia propia con los crawlers adaptados a las plataformas de cada comercio.
- Prototipado de buscadores verticales: el codigo de crawlers para VTEX y Tray sirve como base para replicar el patron en otras ciudades o sectores con las mismas plataformas de e-commerce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es cualitativa: la model card afirma que el motor FTS5 responde en milisegundos, sin cifras concretas de latencia ni throughput.

## Requisitos de hardware

- No se dispone de requisitos de VRAM ni de GPU, ya que el proyecto no describe inferencia de un modelo neuronal.
- El despliegue descrito se realiza en local con Python, uvicorn y SQLite, por lo que el requisito principal es un entorno Python con las dependencias del backend y espacio en disco para el indice FTS5 y los datos de catalogo.
- El repositorio ocupa 0,1 GB, lo que sugiere que puede ejecutarse en hardware de consumo convencional, aunque no se detallan requisitos minimos de CPU o RAM.
- Opciones de despliegue documentadas: servidor local con `uvicorn backend.api:app --host 127.0.0.1 --port 8000 --reload`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo de lenguaje y la informacion proporcionada no identifica alternativas comparables de la misma categoria (buscadores de comercio local o proyectos de indexacion de catalogos con FTS5).

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni artefactos de inferencia; no debe tratarse como un modelo de IA desplegable.
- La cobertura del catalogo esta limitada a los tres comercios descritos (Babá Materiais de Construção, Dorival Auto Peças y Raicrom Ferramentas & Tecnologia) y a las plataformas VTEX y Tray; otros comercios requeririan crawlers adicionales.
- La licencia no esta declarada, por lo que no se puede confirmar la viabilidad de uso comercial ni la redistribucion del codigo o de los datos de catalogo.
- No se documentan politicas de privacidad, tratamiento de datos personales ni cumplimiento normativo (por ejemplo, LGPD en Brasil) para los enlaces de WhatsApp y la publicidad local.
- El proyecto depende de la estructura de las APIs de VTEX y Tray; cambios en dichas plataformas pueden romper los crawlers.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto e idioma propias de un modelo generativo, porque no se describe ningun componente de ese tipo.
- Los datos de creacion y actualizacion del repositorio (2026-11-12) deben verificarse en la plataforma antes de cualquier uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thiagocfa/compraribeirao
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
