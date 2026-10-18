# swordenamine/FennecGlobe

## Resumen

FennecGlobe (identificador `swordenamine/FennecGlobe`) no es un modelo de lenguaje ni un conjunto de pesos: es un repositorio publicado en HuggingFace cuyo contenido es una aplicacion web de una sola pagina (`index.html`, HTML + CSS + JavaScript sin paso de compilacion) que se presenta como un panel de "inteligencia global" con mapas de eventos, feeds de noticias, datos de mercado, criptomonedas, meteorologia, amenazas y un asistente llamado FennecAI. La model card describe la version 4.2.0, cuatro temas visuales, internacionalizacion en seis idiomas (ingles, arabe, frances, espanol, aleman y chino) y un peso total inferior a 150 KB, pero no documenta ninguna arquitectura de red neuronal, numero de parametros, tokenizador ni dataset de entrenamiento.

El problema que aborda es la agregacion y visualizacion de senales geopoliticas y financieras en una unica interfaz, orientada a analistas, periodistas e investigadores. Sin embargo, en el estado actual del codigo los datos se declaran como arrays estaticos en el propio `index.html` (`NEWS_DATA`, `MARKETS`, `THREATS`, `WEATHER`, `CRYPTO`, `SOCIAL`, `ALERTS`), y la propia documentacion indica que deben sustituirse por llamadas a APIs reales; es decir, la demo funciona con datos de ejemplo, no con feeds en vivo.

Su relevancia ahora es limitada como modelo de IA y alta como plantilla de interfaz: sirve como esqueleto de dashboard desplegable en GitHub Pages en un solo fichero, pero no aporta capacidades de inferencia verificables. La etiqueta `region:us` en HuggingFace y la ausencia de pipeline, licencia e idiomas en los metadatos contradicen parcialmente la model card, que declara licencia MIT. La busqueda web realizada no devolvio ningun resultado relacionado con el proyecto: los enlaces obtenidos corresponden a paginas de apuestas deportivas y son irrelevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web estatica de un solo fichero (HTML + CSS + JavaScript); no es una red neuronal. No se especifica ninguna arquitectura de modelo |
| Parametros totales | no disponible (no existen pesos publicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no hay modelo subyacente documentado) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos en safetensors, GGUF ni ningun otro formato) |
| Idiomas soportados | Interfaz en ingles, arabe, frances, espanol, aleman y chino segun la model card; los metadatos de HuggingFace indican "no disponibles" |
| Licencia | La model card declara MIT; los metadatos de HuggingFace indican "no disponible" |
| Formato de pesos | no disponible; el artefacto distribuido es codigo fuente (`index.html`), no pesos |

## Arquitectura y entrenamiento

No hay arquitectura de aprendizaje automatico que describir. El repositorio contiene una aplicacion cliente sin backend: un unico `index.html` autocontenido con CSS embebido, animaciones aceleradas por hardware, renderizado perezoso de paneles tras la animacion de arranque y una estructura de datos basada en constantes JavaScript. El unico componente con nombre de IA, FennecAI, aparece listado como "AI assistant for geopolitical & market intelligence" sin especificar modelo, proveedor, endpoint ni prompt de sistema; no se documenta ninguna llamada a una API de inferencia en el codigo descrito en la model card.

No se ha publicado informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de decodificacion. La seccion de contribucion del README enumera tareas pendientes que confirman el caracter de prototipo: integracion de APIs reales de noticias (NewsAPI, GDELT), datos de mercado en vivo (Yahoo Finance, Alpha Vantage), mapa interactivo con MapLibre GL, soporte PWA con service worker, feeds por WebSocket, cuentas de usuario con Supabase o Firebase, maquetacion RTL para arabe y notificaciones push. Ninguna de estas casillas esta marcada como completada.

## Capacidades

- Visualizacion de un mapa de puntos calientes con capas de conflicto, meteorologia, trafico maritimo y actividad militar, segun la descripcion de la model card.
- Feed de noticias agregado de 247 fuentes declaradas, con datos de ejemplo precargados en el codigo.
- Clasificacion de amenazas por severidad (de critica a baja).
- Datos de mercado en tarjetas y tabla: indices, divisas y materias primas.
- Monitor de criptomonedas con los 8 principales activos, sparklines y capitalizacion de mercado.
- Monitor meteorologico de 192 ciudades con conmutador de unidades Celsius/Fahrenheit.
- Feed de inteligencia social con tendencias.
- Rastreador de 247 satelites con visualizacion de orbita en tiempo real (la fuente de datos no se especifica).
- Sistema de alertas globales con clasificacion por severidad.
- Asistente FennecAI para inteligencia geopolitica y de mercado, sin modelo subyacente identificado ni capacidades verificables de generacion de texto, razonamiento, codigo o matemáticas.
- Autenticacion mediante Google Sign-In, Apple Sign-In y correo/contrasena; el estado de autenticacion es solo de sesion y no se persisten datos sensibles.
- Marcadores en barra lateral para feeds y regiones guardadas.
- Panel de preferencias con tema, notificaciones, datos y privacidad.
- Ticker de datos de mercado en desplazamiento continuo.
- Internacionalizacion en seis idiomas; el soporte RTL para arabe figura como pendiente.
- Atajos de teclado: `/` y `Ctrl+K`/`Cmd+K` para el buscador, `Esc` para cerrar paneles.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Prototipo de panel de inteligencia para demostraciones: el fichero unico se abre directamente en el navegador o con `npx serve .` en el puerto 3000, sin instalar dependencias, lo que permite ensenar la interfaz a un cliente o a un equipo antes de invertir en backend.
- Plantilla de interfaz para un producto de monitorizacion: los arrays `NEWS_DATA`, `MARKETS`, `THREATS`, `WEATHER`, `CRYPTO`, `SOCIAL` y `ALERTS` estan aislados en la parte superior del bloque `
