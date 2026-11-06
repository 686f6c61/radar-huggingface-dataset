# surendracolorado/stock-picker-mcp-source

## Resumen

El repositorio `surendracolorado/stock-picker-mcp-source` no contiene un modelo de lenguaje, sino el codigo fuente de un servidor MCP (Model Context Protocol) desplegado como Hugging Face Space. Lo desarrolla Surendra Singh Chauhan y su funcion es exponer una pipeline de investigacion de trading swing automatizada a asistentes de IA compatibles con MCP, de modo que un cliente LLM pueda invocar herramientas de analisis financiero sobre datos de Yahoo Finance.

La arquitectura interna no es un transformer entrenado, sino un patron de dos agentes: un agente primario de puntuacion de senales que calcula indicadores tecnicos (EMA, RSI, MACD, ATR) y un agente validador independiente que filtra las propuestas contra el regimen de mercado y metricas de volatilidad. La capa de transporte se construye con Gradio y el protocolo JSON-RPC de MCP, con el Space escuchando en el puerto 7860.

Es relevante para desarrolladores que quieran integrar analisis tecnico bursatil en asistentes conversacionales mediante tool calling estandarizado, y como ejemplo de patron multiagente de validacion cruzada aplicado a dominios financieros. No se dispone de informacion sobre parametros, contexto, licencia ni idiomas porque el artefacto publicado es codigo de servidor, no pesos de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP con pipeline multiagente (agente primario de scoring + agente validador) sobre Gradio y JSON-RPC |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del LLM cliente conectado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (codigo fuente y contenedor Docker; `requirements.txt` con `mcp`, `gradio` y dependencias de datos) |

## Arquitectura y entrenamiento

El sistema no entrena ningun modelo. Se compone de dos agentes orquestados: el Primary Signal Scoring Agent ingiere datos de mercado en bruto y calcula EMA, RSI, MACD y ATR para producir una puntuacion tecnica preliminar y candidatos de entrada en operaciones swing; el Independent Validator Agent actua como segunda comprobacion estricta, filtrando los setups contra el regimen general de mercado y metricas de volatilidad para emitir una calificacion consensuada y reducir falsos positivos.

La capa de transporte se implementa con Gradio y el MCP layer traduce las llamadas a JSON-RPC, exponiendo los agentes como funciones invocables. El despliegue es un contenedor Docker en Hugging Face Spaces con `app_port: 7860`. No se documentan datos de entrenamiento, RLHF/DPO ni innovaciones de decodificacion porque no aplican a este artefacto.

## Capacidades

- Cribado de acciones (equity screening) mediante llamadas a herramientas MCP estandarizadas.
- Analisis de precios historicos usando datos en vivo de las APIs de Yahoo Finance.
- Calculo de indicadores tecnicos: EMA, RSI, MACD y ATR.
- Evaluacion de setups tecnicos para trading swing con puntuacion preliminar y validacion cruzada.
- Soporte de tool calling / function calling a traves del protocolo MCP (JSON-RPC).
- Patron multiagente con handoff entre agente primario y validador para reducir senales alucinadas.
- Integracion con clientes MCP como Claude Desktop o extensiones de VS Code mediante el proxy MCP de Hugging Face.
- No se documentan capacidades de generacion de texto, vision, audio ni multilingues propias; dependen del LLM cliente.

## Casos de uso

- Asistente de investigacion bursatil en Claude Desktop: el usuario pregunta por candidatos de trading swing y el cliente LLM invoca las herramientas del servidor para obtener indicadores y una calificacion validada, sin que el modelo tenga que calcular RSI o MACD por si mismo.
- Automatizacion de cribado diario: un script o agente programado llama a la herramienta de screening al cierre de mercado para generar una lista corta de acciones con setups tecnicos validados por el segundo agente.
- Validacion cruzada de senales: el agente validador filtra propuestas del agente primario segun volatilidad y regimen de mercado, util para equipos que quieren reducir falsos positivos antes de revisar manualmente.
- Integracion en IDE: mediante la extension MCP de VS Code, un desarrollador puede consultar indicadores tecnicos desde el propio editor mientras construye estrategias o backtests.
- Prototipado de pipelines financieros multiagente: el codigo sirve como referencia para implementar patrones de scoring mas validacion en otros dominios con MCP.
- Demostracion educativa de MCP sobre Hugging Face Spaces: muestra como envolver logica de negocio en herramientas JSON-RPC accesibles por LLMs, con gestion de secretos y observabilidad mediante el log viewer del Space.
- Monitorizacion de limites de API: el log viewer permite rastrear errores de ejecucion y rate limits de Yahoo Finance, util para operar el servicio en produccion con timeouts de aproximadamente 12,5 segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM de modelo: el servidor no ejecuta pesos propios; el consumo depende del LLM cliente que se conecte.
- El Space se ejecuta en la infraestructura de Hugging Face Spaces (contenedor Docker, puerto 7860); no se especifican CPU, RAM ni GPU asignadas.
- Para uso local, el cliente se conecta mediante `uvx huggingface-mcp-server --space surendracolorado/stock-picker-mcp`, por lo que no requiere GPU en la maquina del usuario.
- Opciones de despliegue: Hugging Face Spaces (Docker), cliente MCP local por STDIO o endpoints HTTP/Server-Sent Events.
- Latencia: Hugging Face limita las peticiones de transporte HTTP a aproximadamente 12,5 segundos; el handoff multiagente debe completarse dentro de ese umbral. No se dispone de cifras de throughput.

## Comparativa con modelos similares

| Aspecto | stock-picker-mcp-source | Servidores MCP financieros genericos | Modelos LLM con conocimiento financiero |
|---|---|---|---|
| Tipo de artefacto | Servidor MCP multiagente | Servidor MCP de herramientas | Modelo de pesos |
| Parametros | no aplica | no disponible | no disponible |
| Contexto | depende del cliente | depende del cliente | no disponible |
| Datos en vivo | Yahoo Finance | variable | no (conocimiento estatico) |
| Licencia | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona por si mismo; toda la capacidad conversacional proviene del cliente LLM conectado.
- Dependencia critica de las APIs de Yahoo Finance: cambios upstream, rate limits o caidas degradan el servicio; el README recomienda fijar versiones en `requirements.txt`.
- Timeout de aproximadamente 12,5 segundos en el transporte HTTP de Hugging Face: el handoff entre agentes puede fallar en consultas lentas.
- Riesgo de senales erroneas: aunque el patron de doble agente reduce falsos positivos, no elimina el riesgo de mercado; no se documenta validacion con datos historicos ni backtesting.
- Sin licencia declarada: no se puede asumir permiso para uso comercial o redistribucion del codigo.
- Sin informacion sobre sesgos, idiomas o alucinacion del LLM cliente; esas propiedades dependen del modelo que se conecte.
- Requiere gestion de secretos (`HF_TOKEN` y claves de API externas) en Settings > Variables and secrets del Space.
- No apto como asesoramiento financiero: es una herramienta de investigacion tecnica, no una recomendacion de inversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/surendracolorado/stock-picker-mcp-source
- Space desplegado: https://huggingface.co/spaces/surendracolorado/stock-picker-mcp
- Especificacion MCP (referencia del protocolo): no disponible en la informacion proporcionada
- Documentacion de Hugging Face MCP proxy: no disponible en la informacion proporcionada
