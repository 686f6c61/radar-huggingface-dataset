# swordenamine/taqs_djazairi

## Resumen

`swordenamine/taqs_djazairi` (الطاقس الجزائري — TAQS DJAZAIRI) no es un modelo de lenguaje: es un repositorio de HuggingFace que aloja una aplicación web en Python/Flask que combina un calendario agrícola tradicional argelino con una interfaz de chat. La aplicación no publica pesos ni checkpoints propios; delega la inferencia en un proveedor externo (API de Anthropic Claude o de DeepSeek) o en una instancia local de Ollama. Por tanto, no existen parámetros, ventana de contexto ni cuantizaciones propias que evaluar.

El valor del proyecto está en su base de conocimiento: 12 meses con descripciones, refranes y poesía popular; las «Layali» (noches blancas, negras y de la anciana) con sus fechas e indicios; calendarios de siembra de trigo, olivo, habas, tomate y vid; más de 30 indicadores naturales de predicción meteorológica y referencias a estrellas (Pléyades, Orión, Canopo, Escorpio) en la tradición argelina. Todo ello se sirve desde diccionarios Python embebidos en el archivo `taqs_djazairi.py`, lo que permite funcionamiento sin conexión para el contenido estático.

Es relevante ahora como plantilla de asistente vertical especializado en patrimonio cultural: un patrón reproducible (KB local + LLM externo + UI bilingüe árabe/dariya/inglés) que cualquier investigador puede adaptar a otros dominios etnográficos. Su interés técnico es el diseño de integración, no el rendimiento de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: aplicación web Flask (Python 3.6+) que actúa como cliente de un LLM externo. No contiene arquitectura neuronal propia |
| Parametros totales | No disponible (el repositorio no publica pesos ni checkpoint) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del proveedor configurado: Anthropic, DeepSeek u Ollama; el repositorio no la declara) |
| Tipos de cuantizacion | No disponible. En la ruta Ollama, la cuantización la determina el modelo local elegido (por ejemplo, `mistral`), no este repositorio |
| Idiomas soportados | Árabe, dariya argelina e inglés (contenido de la KB e interfaz). El chat depende del backend configurado |
| Licencia | MIT, según la model card y el badge del README. Los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | No aplica: el repositorio contiene código Python, no tensores en safetensors, GGUF ni ningún otro formato |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino. El proyecto es una aplicación monolítica en Python distribuida como un único archivo ejecutable (`taqs_djazairi.py`) que levanta un servidor Flask 2.0+ en el puerto 5001 y abre el navegador automáticamente. La configuración se gestiona mediante un archivo `.env` con la variable `AI_PROVIDER` que selecciona entre `anthropic`, `deepseek` y `ollama`, más las credenciales correspondientes (`ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `OLLAMA_URL`, `OLLAMA_MODEL`). La única dependencia externa declarada es Flask; el resto son módulos de la biblioteca estándar.

El conocimiento del dominio vive en un conjunto de diccionarios (`KB`) dentro del propio script, y las contribuciones de la comunidad se integran editando esos diccionarios. No se documenta en la información disponible si la KB se inyecta como contexto en el prompt del sistema, si se recupera mediante búsqueda o si se envía completa; tampoco se especifica la plantilla de prompt, el manejo de historial multi-turno ni si existe limitación de longitud. No hay datos sobre composición de dataset, tokens de entrenamiento, RLHF ni DPO porque no existe fase de entrenamiento.

## Capacidades

- Consulta del calendario agrícola argelino: descripción, clima típico, labores y refranes de cada uno de los 12 meses.
- Explicación de las «Layali» (blancas, negras, de la anciana) y del periodo del Waseem, con fechas, indicios asociados y poesía popular.
- Calendarios de siembra para cultivos concretos: trigo, olivo, habas, tomate y vid.
- Consulta de más de 30 indicadores naturales de predicción meteorológica (comportamiento animal, vientos, observación de estrellas).
- Glosario de dariya argelina con terminología agrícola y meteorológica.
- Chat conversacional en árabe, dariya o inglés, con preguntas rápidas predefinidas en la interfaz.
- Funcionamiento sin conexión para todo el contenido estático; solo el chat requiere red.
- Interfaz de usuario de temática nocturna inspirada en el patrimonio argelino.
- Conmutación entre proveedores de IA mediante una variable de entorno, sin cambios de código.

## Casos de uso

- Consulta agronómica estacional: un agricultor pregunta «¿cuándo se planta el olivo?» y la aplicación responde con la ventana de siembra de la KB y el refrán asociado, sin necesidad de conexión para la parte estática.
- Preservación de patrimonio inmaterial: etnógrafos y lingüistas pueden volcar refranes, indicios y poesía en los diccionarios `KB` y publicarlos como aplicación consultable, con el chat como capa de acceso en lenguaje natural.
- Despliegue en zonas de conectividad limitada: al ejecutarse en local con Flask y servir el contenido desde el propio script, puede instalarse en un equipo modesto o en una red de aula rural, dejando el chat opcional.
- Asistente vertical como plantilla: el patrón (KB en diccionarios + `.env` con selector de proveedor + UI Flask) se replica para otros dominios etnográficos o gremiales cambiando únicamente el contenido de la KB.
- Investigación sobre dariya: el glosario y las respuestas en dariya sirven como corpus de consulta para estudiar terminología meteorológica dialectal, siempre que se validen con informantes nativos.
- Material didáctico bilingüe: docentes de árabe o de ciencias agrarias usan la interfaz árabe/inglés para trabajar vocabulario de clima y agricultura con alumnado.
- Prototipado rápido de un asistente con LLM: permite comparar el comportamiento de Claude, DeepSeek y un modelo local vía Ollama sobre el mismo conjunto de preguntas sin reescribir la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluación alguna (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de calidad de respuesta en dariya) ni conjunto de validación. Tampoco se documentan latencia o throughput de la aplicación: en la ruta API dependen del proveedor externo y en la ruta Ollama del modelo local y del hardware.

## Requisitos de hardware

- Para el contenido estático y la interfaz: requisitos mínimos; Python 3.6+ y Flask. Funciona en cualquier equipo capaz de ejecutar Python, incluida una Raspberry Pi.
- Para el chat con API externa (Anthropic o DeepSeek): no se requiere GPU; el coste es de red y de facturación por token del proveedor.
- Para el chat con Ollama local: la VRAM depende enteramente del modelo elegido. Como referencia orientativa del backend, un modelo de ~7B en cuantización Q4_K_M ocupa del orden de 4-5 GB de VRAM, por lo que cabría en una RTX 3060 de 12 GB o una RTX 4090; para 13B en Q4 se recomiendan 10-12 GB y para 70B en Q4 hacen falta varias A100/H100 o CPU con mucha RAM (no disponible en la documentación del repositorio).
- GPU recomendadas: no disponibles para este repositorio; dependen del modelo servido por Ollama. Con proveedor en la nube no se necesita GPU.
- Opciones de despliegue: ejecución directa con `python taqs_djazairi.py`; el servidor Flask integrado no está pensado para producción. Para exposición pública habría que anteponer un servidor WSGI (gunicorn/uWSGI) y un proxy inverso, algo que la documentación no cubre. Compatible con cualquier endpoint Ollama, incluido vLLM o llama.cpp tras una capa compatible con la API de Ollama (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible; los resultados de la búsqueda web recibidos son irrelevantes (páginas de la Ligue 1 de fútbol) y no aportan alternativas. Dado que el repositorio no contiene un modelo, la comparación pertinente es entre los backends que la aplicación puede usar:

| Opcion de backend | Rol | Parametros | Contexto | Licencia / condiciones | Ejecucion local |
|---|---|---|---|---|---|
| TAQS DJAZAIRI (este repositorio) | Aplicación Flask + KB agrícola | No aplica (sin pesos) | No disponible | MIT (según model card) | Sí, para el contenido estático |
| Anthropic Claude (vía API) | Motor de chat | No disponible | No disponible | Sujeto a términos de Anthropic | No |
| DeepSeek (vía API) | Motor de chat | No disponible | No disponible | Sujeto a términos de DeepSeek | No |
| Ollama + `mistral` (ejemplo del README) | Motor de chat local | No disponible en el repositorio | No disponible en el repositorio | La del modelo descargado | Sí |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, ni ficha técnica de arquitectura, ni resultados reproducibles. Cualquier expectativa de rendimiento debe referirse al backend configurado.
- Riesgo de alucinación heredado del LLM: las respuestas del chat sobre fechas de siembra, indicios meteorológicos o refranes pueden mezclar conocimiento del modelo con la KB sin que la aplicación lo distinga; no se documenta ningún mecanismo de citación o verificación.
- El contenido agrícola es traditional y no validado agronómicamente: no debe usarse como única fuente para decisiones de cultivo, fitosanitarias o de riego.
- La calidad en dariya no está evaluada y esta lengua carece de ortografía estandarizada, lo que dificulta la evaluación y favorece respuestas inconsistentes.
- Cobertura limitada al contenido volcado en los diccionarios `KB`; fuera de ese dominio el asistente responde como un LLM genérico.
- Licencia: el README declara MIT, pero los metadatos de HuggingFace no la declaran, y el uso de APIs de terceros queda sujeto a sus propios términos y a sus costes.
- Seguridad: las claves de API se guardan en un archivo `.env`; el servidor de desarrollo de Flask escucha en `localhost:5001` sin autenticación ni limitación de peticiones, por lo que no debe exponerse directamente a Internet.
- Mantenimiento: proyecto de un único autor, con 0 descargas y 0 likes, y sin Releases ni tests documentados.
- Incoherencia en los metadatos: la fecha de creación registrada (2026-10-17) es posterior a la de última actualización (2026-03-09), lo que resta fiabilidad a las marcas temporales del repositorio.
- Sin control de versiones de dependencias: solo se exige Flask 2.0+, sin fijar versión ni archivo de requisitos con pinning.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/taqs_djazairi
- Repositorio GitHub citado en la model card: https://github.com/swordenkisk/taqs-djazairi
- Ollama (backend local mencionado): no se proporciona enlace en la información disponible
- Documentación de la API de Anthropic: no se proporciona enlace en la información disponible
- Documentación de la API de DeepSeek: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles. Los resultados de la búsqueda web recibidos no guardan relación con el proyecto.
