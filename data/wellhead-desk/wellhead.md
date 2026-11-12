# wellhead-desk/wellhead

## Resumen

Wellhead es un proyecto publicado en Hugging Face bajo el identificador `wellhead-desk/wellhead` que, a pesar de su alojamiento en la plataforma de modelos, no contiene un modelo de inteligencia artificial. Segun la model card del autor, se trata de un sitio web personal ("Gibson's oil & gas desk") dedicado al seguimiento de precios de petroleo crudo y gas natural, titulares del sector energetico y una perspectiva sobre derechos minerales. El repositorio aloja el codigo fuente de una aplicacion web ligera escrita en Node.js, sin dependencias de npm, que sirve una pagina de escritorio financiero con datos en vivo.

El sistema se compone de un servidor HTTP que expone rutas para la web principal, una previsualizacion de edicion por correo electronico y varios endpoints JSON (`/api/dashboard`, `/api/brief`, `/api/health`). Los precios y titulares se obtienen de la API publica de Yahoo Finance y de fuentes de noticias, con caches del lado del servidor de entre 2 y 30 minutos segun el tipo de dato. Un componente llamado "Cach" (descrito como un bot de investigacion) actualiza periodicamente un fichero `brief.json` que alimenta la seccion de analisis editorial.

La relevancia de esta ficha es limitada en el contexto de evaluacion de modelos: no hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni configuracion de inferencia. Se documenta aqui unicamente para dejar constancia de que el repositorio no constituye un modelo de IA utilizable, sino una aplicacion de visualizacion de datos de mercado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion web Node.js) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente JavaScript y ficheros JSON) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de aprendizaje automatico. La "arquitectura" del proyecto es la de una aplicacion web monolitica en Node.js (requiere Node 18 o superior) que usa el `fetch` nativo para consultar APIs externas. El servidor sirve contenido estatico y genera respuestas JSON a partir de datos de mercado obtenidos en tiempo de ejecucion.

El unico componente que podria relacionarse con IA es "Cach", presentado como un bot de investigacion que redacta un brief periodico. Sin embargo, la model card no especifica que modelo subyacente utiliza, ni proporciona pesos, configuracion o detalles de entrenamiento. El brief se entrega como un fichero JSON con un esquema versionado (v1) que incluye campos como `lead`, `headlines`, `takeaways`, `settlements`, `caveats` y secciones por escritorio (`energy`, `markets`, `tech`, `blueflame`). No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones tecnicas de modelado.

## Capacidades

- Visualizacion de precios de futuros de petroleo (WTI, Brent), gas natural (Henry Hub), gasolina RBOB y gasoil de calefaccion, con variacion respecto al cierre anterior, sparkline de 3 meses y rangos de dia y de 3 meses.
- Agregacion de titulares de noticias del sector energetico con deduplicacion y filtros por fuente.
- Presentacion de un brief de investigacion con titulares, conclusiones numeradas y advertencias sobre datos.
- Perspectiva sobre derechos minerales por cuenca (Texas/Permian, Oklahoma, North Dakota/Bakken, Louisiana/Haynesville, Arkansas/Fayetteville) con indicacion de lagunas de verificacion.
- Datos de mercado generales (S&P 500, Dow, Nasdaq, Russell 2000, gainers, losers, most actives).
- Seccion de noticias de IA y tecnologia.
- Generacion de una edicion por correo electronico en HTML (sin envio automatico).
- Endpoint JSON unico (`/api/dashboard`) con todos los datos, con opcion de refresco forzado limitado a una vez cada 30 segundos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de un modelo generativo.

## Casos de uso

- Monitorizacion de precios energeticos en tiempo real: el servidor consulta la API de Yahoo Finance para los tickers `CL=F`, `BZ=F`, `NG=F` y otros, y sirve los datos con caches de 2-3 minutos. Adecuado para un panel personal de seguimiento de materias primas.
- Agregacion de noticias del sector: la seccion "The Wire" recopila y deduplica titulares de petroleo y gas con filtros por fuente, util para un analista que quiera una vista unica de la actualidad.
- Publicacion de un brief editorial diario: el fichero `brief.json` se puede actualizar de forma atomica (escritura en `.tmp` y `mv`) sin reiniciar el servidor, lo que permite integrar un pipeline externo que genere el contenido.
- Previsualizacion de boletines por correo: el comando `npm run email` genera `out/email-preview.html` para revisar la edicion antes de un envio manual.
- Despliegue de un sitio ligero sin dependencias: al no requerir `npm install` y usar solo modulos nativos de Node, se puede ejecutar en entornos con restricciones de red o de paquetes.
- Verificacion de salud del servicio: el endpoint `/api/health` y el smoke test `npm run check` (que arranca en el puerto 8799 y valida precios, feeds, brief y pagina de correo) permiten monitorizar la disponibilidad.
- Integracion de datos de mercado en otros sistemas: el endpoint `/api/dashboard` devuelve todo el estado como JSON, lo que facilita su consumo por otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable con metricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- CPU y memoria: cualquier maquina capaz de ejecutar Node.js 18 o superior; el consumo depende del trafico y de las respuestas de las APIs externas.
- Opciones de despliegue: ejecucion directa con `npm start` en `127.0.0.1:8787` (configurable con `PORT` y `HOST`); al no tener dependencias de npm, no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la latencia de las APIs de Yahoo Finance y de las fuentes de noticias, mitigada por caches de 2-3 minutos para cotizaciones, 10 minutos para noticias energeticas y de mercado, 15 minutos para tecnologia y 30 minutos para las cuencas.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el repositorio no contiene un modelo de IA. Como referencia de proyectos de naturaleza distinta (paneles de datos y agregadores), no se dispone de datos en la informacion proporcionada para establecer una comparacion tecnica con parametros, contexto o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no se puede usar para generacion de texto, razonamiento, codigo ni ninguna tarea de inferencia.
- La licencia no esta declarada, lo que impide conocer las condiciones de uso comercial o de redistribucion.
- La model card indica explicitamente que no es un sitio oficial ni una publicacion de ninguna empresa, incluida Blue Flame Minerals, y que la perspectiva "Blue Flame" usa solo precios publicos y noticias publicas de cuencas, sin mostrar resultados de la compania.
- Los datos de mercado dependen de APIs de terceros (Yahoo Finance y fuentes de noticias); si esas APIs cambian o dejan de responder, el sitio puede mostrar datos obsoletos o fallar.
- El brief se marca como "Older than 36h" si su `updatedAt` supera las 36 horas, lo que indica que la frescura del contenido editorial no esta garantizada.
- Si un brief malformado se escribe, el sitio mantiene el ultimo brief valido con una advertencia; sin ningun brief valido, muestra un estado de "awaiting brief".
- El refresco forzado mediante `?refresh=1` esta limitado a una vez cada 30 segundos, lo que restringe la actualizacion inmediata de datos.
- Las afirmaciones marcadas como "search-excerpt only" indican que la pagina no se abrio y solo se dispone de un extracto de busqueda, con el riesgo de inexactitud que ello conlleva.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma en el sentido de un modelo generativo, porque no existe tal modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wellhead-desk/wellhead
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
