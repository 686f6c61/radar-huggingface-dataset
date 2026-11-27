# yeshunguang12/NAI-SORA

## Resumen

NAI-SORA no es un modelo de IA en el sentido estricto, sino una aplicación de escritorio para Windows distribuida a través de Hugging Face que actúa como editor y ensamblador de prompts para la generación de imágenes con NovelAI. El repositorio, publicado por el usuario yeshunguang12, contiene un archivo ZIP con un ejecutable (`NAI-SORA.exe`) y un entorno Python embebido. La herramienta permite componer prompts a partir de bloques predefinidos de personaje, pose, vestimenta, cuerpo, estado y estilo artístico, validar reglas de etiquetas (detectando tags ausentes o solapados) y lanzar la generación directamente contra la API de NovelAI usando un token persistente del usuario.

El proyecto está etiquetado como `not-for-all-audiences` porque incluye prompts de poses de contenido sexual explícito y está restringido a usuarios adultos. No se trata de pesos de un modelo de lenguaje o de difusión: no hay arquitectura, parámetros ni contexto que reportar. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas en el momento de la consulta.

Su relevancia es limitada desde el punto de vista de la investigación en IA open source: es una utilidad de autoría de prompts, no un modelo entrenado ni publicado con pesos. Resulta útil únicamente como ejemplo de herramienta de asistencia a la generación de imágenes vía API de terceros, con gestión local de credenciales y actualizaciones firmadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación de escritorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la documentación están en coreano) |
| Licencia | no disponible |
| Formato de pesos | no disponible (distribución en ZIP con ejecutable y Python embebido) |

## Arquitectura y entrenamiento

No aplica. NAI-SORA es una aplicación de escritorio empaquetada para Windows que se ejecuta localmente sobre `127.0.0.1` y utiliza Microsoft Edge WebView2 como motor de interfaz. Incluye un intérprete de Python embebido, de modo que el usuario no necesita instalar dependencias. No hay proceso de entrenamiento, dataset, RLHF ni pesos publicados.

La lógica funcional descrita en la model card consiste en: (1) un sistema de bloques categorizados (personaje, pose, vestimenta, cuerpo, estado, expresión, estilo) para ensamblar prompts; (2) un validador de reglas que señala etiquetas que faltan o se solapan; (3) un cliente de la API de NovelAI para generar imágenes; y (4) un mecanismo de actualización que verifica la firma de los archivos antes de aplicarlos. Las conexiones externas se limitan a la API de NovelAI y a la comprobación de nuevas versiones en el propio repositorio de Hugging Face.

## Capacidades

- Ensamblaje de prompts por bloques para generación de imágenes en NovelAI.
- Validación de reglas de etiquetas: detección de tags ausentes o redundantes antes de generar.
- Generación de imágenes directamente desde la aplicación mediante la API de NovelAI.
- Gestión local del token persistente de NovelAI, cifrado con la cuenta de Windows del equipo (no portable a otro PC).
- Actualización firmada de la aplicación conservando personajes, poses y estilos modificados por el usuario, así como el token, el historial y la carpeta de guardado.
- Inclusión de seis personajes de ejemplo (todos adultos en sus obras originales) y un bloque de estilo artístico.
- Soporte para añadir miniaturas e imágenes representativas propias.
- Interfaz y documentación en coreano.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento, al no ser un modelo generativo de texto.

## Casos de uso

- Autoría asistida de prompts para NovelAI: un usuario adulto compone combinaciones de personaje, pose y estilo a partir de bloques predefinidos, reduciendo errores de sintaxis en las etiquetas.
- Validación previa a la generación: el comprobador de reglas evita gastar tokens de la API en prompts con tags contradictorios o incompletos.
- Flujo de trabajo local con credenciales protegidas: el token se guarda cifrado con la cuenta de Windows, lo que resulta adecuado para equipos personales compartidos ocasionalmente.
- Iteración creativa sobre estilos: el bloque de estilo permite mantener una estética coherente entre generaciones sucesivas sin reescribir el prompt completo.
- Actualización controlada de la herramienta: el mecanismo de firma permite recibir nuevas versiones sin perder personalizaciones locales, útil para usuarios que mantienen catálogos propios de personajes y poses.
- Despliegue en Windows 10/11 sin instalación de Python: al incluir el intérprete embebido, sirve para usuarios sin entorno de desarrollo configurado que quieran automatizar la generación vía API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11.
- Dependencia: Microsoft Edge WebView2 (habitualmente preinstalado en Windows 10 y 11).
- Almacenamiento: aproximadamente 0,1 GB para el ZIP; el espacio descomprimido no se detalla en la información disponible.
- VRAM: no aplica, ya que la generación de imágenes se delega a la API de NovelAI y no se ejecuta localmente.
- GPU: no se requiere GPU local.
- Opciones de despliegue: ejecución directa de `NAI-SORA.exe` o, en caso de bloqueo, del script `program\NAI-SORA.bat`.
- Latencia y throughput: no disponibles; dependen íntegramente de la API de NovelAI y de la conexión del usuario.

## Comparativa con modelos similares

No disponible. NAI-SORA no es un modelo de IA sino una utilidad de escritorio para NovelAI, por lo que no existen alternativas comparables en términos de parámetros, contexto o rendimiento. Herramientas como interfaces web de terceros para NovelAI podrían cumplir funciones parcialmente solapadas, pero no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: la model card advierte explícitamente de la presencia de prompts de poses sexuales y restringe el uso a mayores de edad.
- No es un modelo de IA: no publica pesos, arquitectura ni datos de entrenamiento; no debe citarse como modelo en contextos de investigación.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial es admisible; se debe contactar con el autor antes de cualquier uso profesional.
- Dependencia de un servicio de terceros: toda la generación recae en la API de NovelAI, sujeta a sus propios términos, precios y políticas de contenido.
- Seguridad de credenciales: el token se almacena cifrado con la cuenta de Windows, pero la aplicación no ha pasado auditorías públicas conocidas.
- Idiomas: la interfaz y la documentación están en coreano, lo que limita su adopción por parte de usuarios hispanohablantes sin conocimientos de ese idioma.
- Cero descargas registradas y un único "like": no hay evidencia de uso comunitario ni de validación independiente del binario.
- Riesgo de software no verificado: se distribuye un ejecutable de Windows de un autor individual sin trazabilidad de compilación reproducible; conviene analizarlo en un entorno aislado antes de ejecutarlo.
- Sin benchmarks ni métricas de calidad: no hay forma de evaluar objetivamente la utilidad del validador de etiquetas ni del ensamblador de prompts.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yeshunguang12/NAI-SORA
- Descarga directa del ZIP: https://huggingface.co/yeshunguang12/NAI-SORA/resolve/main/NAI-SORA.zip
- NovelAI (servicio de generación utilizado): https://novelai.net
