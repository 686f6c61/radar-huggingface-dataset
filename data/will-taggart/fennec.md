# will-taggart/FENNEC

## Resumen

FENNEC (Frequently Engaged in Needless but Enthusiastic Contemplation) es una aplicación web de agente conversacional desarrollada por will-taggart, publicada en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje con pesos propios, sino de una interfaz completa de una sola página HTML que orquesta llamadas a modelos externos de terceros (OpenAI y Virginia Tech ARC) para ofrecer conversación multilingüe, lectura de documentos y memoria cifrada opcional.

El proyecto resuelve el problema de construir un asistente de investigación y análisis documental desplegable sin infraestructura de backend compleja: el frontend es un único archivo HTML con las librerías de extracción de documentos embebidas, y el único componente servidor opcional es un script PHP para la memoria persistente. La aplicación incorpora un compañero geométrico animado dibujado en canvas, un cuaderno de sesión descargable y soporte para 24 idiomas.

Es relevante ahora por su enfoque en privacidad del lado del cliente: las claves de API permanecen en la pestaña, las conversaciones se cifran localmente con AES-256-GCM antes de enviarse al servidor y el backend nunca recibe la clave original ni el texto plano. El repositorio de Hugging Face tiene 0 GB de tamaño y 0 descargas, lo que sugiere un proyecto en fase inicial de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: aplicación web cliente (HTML/JS) que orquesta modelos externos |
| Parametros totales | No disponible (no incluye pesos propios) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible; los fragmentos de documento y respuestas se limitan a 28.000 caracteres en intercambios guardados |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 24 idiomas (conversación); idiomas de síntesis de voz según navegador |
| Licencia | MIT |
| Formato de pesos | No aplica; distribución como `fennec.html` y scripts PHP auxiliares |

## Arquitectura y entrenamiento

FENNEC no entrena ni distribuye un modelo de lenguaje. Su arquitectura es una aplicación de página única en HTML con JavaScript que actúa como cliente de dos proveedores: OpenAI (con investigación web y herramientas Python) y Virginia Tech ARC (exploración de artículos mediante resúmenes de Crossref). Los nombres de modelo configurados por defecto son `gpt-6-luna` y `DeepSeek-V4.1-Flash`, cuya disponibilidad depende del proveedor y de la cuenta del usuario.

El componente técnico destacable es el esquema de memoria cifrada. El navegador usa el hash SHA-256 de la clave de API recortada como identificador público y deriva secretos separados de cifrado y de acceso al almacenamiento mediante HKDF-SHA-256 con etiquetas de propósito distintas. Cada intercambio se cifra localmente con AES-256-GCM, un nonce fresco de 12 bytes y metadatos autenticados. El servidor PHP recibe sobres cifrados y un token derivado de acceso al almacenamiento, nunca la clave original ni el texto plano. Las escrituras son de solo adición e idempotentes, con límites por defecto de 16 MiB por bóveda y 128 MiB totales.

## Capacidades

- Conversación multilingüe en 24 idiomas, con selección del idioma de respuesta independiente del idioma de la pregunta.
- Lectura de documentos en formatos TXT, PDF, HTML y DOCX directamente en el navegador, con análisis por fragmentos para documentos largos.
- Investigación web mediante OpenAI y exploración de artículos con resúmenes de Crossref en ARC; cada artículo completado sugiere el siguiente tema de lectura, con foco opcional configurable.
- Herramientas Python a través del proveedor OpenAI.
- Memoria cifrada opcional: recupera conversaciones anteriores usando la misma clave de API, con recall de hasta los últimos siete intercambios por petición.
- Lectura en voz alta mediante síntesis de voz del navegador.
- Cuaderno de sesión con eventos de petición y herramienta visibles, y registro descargable.
- Compañero geométrico animado en canvas con estados de pensamiento, habla, sueño, lectura, trabajo y escritura.

## Casos de uso

- Asistente de investigación documental: el usuario sube PDF, DOCX, HTML o TXT y FENNEC extrae y analiza el contenido por fragmentos en el navegador, lo que permite trabajar con informes largos sin enviar el archivo completo al proveedor de una vez.
- Exploración bibliográfica con Crossref: mediante ARC, el agente recorre resúmenes de artículos y propone el siguiente tema de lectura, adecuado para revisiones de literatura exploratorias con un foco definido.
- Conversación multilingüe de atención interna: al elegir el idioma de respuesta de forma independiente a la pregunta, sirve para equipos que consultan documentación en un idioma y necesitan respuestas en otro.
- Despliegue ligero en hosting compartido: al ser un único HTML con PHP opcional, permite publicar un asistente en cPanel con PHP 8.1+ y PDO SQLite sin pipeline de build ni servidores de inferencia propios.
- Memoria de sesión cifrada para uso personal: usuarios que quieren continuar conversaciones entre visitas sin que el administrador del sitio pueda descifrar el archivo almacenado, gracias al cifrado AES-256-GCM del lado del cliente.
- Accesibilidad mediante lectura en voz alta: la síntesis de voz del navegador permite escuchar respuestas y documentos, con voces e idiomas según el navegador del usuario.
- Registro auditable de sesiones: el cuaderno y el log descargable permiten revisar qué peticiones y herramientas se ejecutaron, útil para depuración o documentación de un flujo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM local: la inferencia se delega a los proveedores externos (OpenAI o Virginia Tech ARC).
- El frontend se ejecuta en cualquier navegador moderno con soporte de canvas y síntesis de voz; no hay paso de build.
- Para memoria persistente se necesita PHP 8.1 o superior con la extensión PDO SQLite en el hosting.
- El hosting debe servir la aplicación por HTTPS y el proveedor elegido debe soportar CORS.
- Límites por defecto del backend de memoria: 16 MiB por bóveda, 128 MiB totales más sobrecarga de SQLite y 120 peticiones por minuto por IP.
- Latencia y throughput dependen enteramente del proveedor de modelos seleccionado; no disponible.
- El coste de uso del modelo y las herramientas corre a cargo del usuario según las tarifas del proveedor.

## Comparativa con modelos similares

| Proyecto | Tipo | Pesos propios | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| FENNEC | Aplicación web cliente sobre APIs externas | No | No disponible (28.000 caracteres por intercambio guardado) | MIT | HTML estático + PHP opcional |
| Open WebUI | Interfaz para modelos locales y remotos | No | Depende del modelo conectado | No disponible en la información | Servidor propio con Docker |
| LibreChat | Interfaz multi-proveedor | No | Depende del modelo conectado | No disponible en la información | Servidor propio |
| Modelos comparables de pesos abiertos | Modelo de lenguaje | Sí | Variable | Variable | Inferencia local o en servidor |

No se dispone de datos de benchmarks ni de comparaciones de rendimiento publicadas para FENNEC en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no incluye pesos, entrenamiento ni benchmarks propios; toda la calidad de respuesta depende de los proveedores externos configurados.
- Los nombres de modelo por defecto (`gpt-6-luna`, `DeepSeek-V4.1-Flash`) pueden no estar disponibles según proveedor y cuenta; el autor indica que deben actualizarse en `fennec.html` al adaptar la aplicación.
- La memoria está desactivada por defecto y su preferencia no persiste; claves y conversaciones descifradas viven solo en la memoria de la pestaña.
- La misma combinación de proveedor y clave desbloquea la misma bóveda; claves compartidas comparten memoria y no existe recuperación ni migración de claves.
- Desactivar la memoria o borrar la clave no elimina las conversaciones almacenadas.
- El historial descifrado relevante se envía al proveedor de IA seleccionado: el cifrado protege el archivo almacenado, no los prompts frente al proveedor.
- Un administrador del sitio no puede descifrar el archivo con el identificador ni el token derivado, pero quien controle el sitio puede modificar el JavaScript para capturar la clave en una visita futura.
- Los registros del hosting y el backend pueden retener metadatos.
- El uso de modelos y herramientas puede generar cargos del proveedor.
- No se han publicado datos sobre sesgos, alucinación o cobertura idiomática más allá de la cifra de 24 idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/will-taggart/FENNEC
- Implementación web: https://l1001.vt.domains/fennec.html
- Paper técnico (PDF): paper/Technical-Paper.pdf
- Paper técnico (LaTeX): paper/main.tex
- Paper técnico (Markdown): paper/TECHNICAL_PAPER.md
- Paquete fuente del paper: paper/Technical-Paper-Source.zip
- Guía de instalación y resolución de problemas: SETUP.txt
