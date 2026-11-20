# Thorfinn-will-help/MRSPTU-Question-Paper-Downloader

## Resumen

El repositorio `Thorfinn-will-help/MRSPTU-Question-Paper-Downloader` no es un modelo de inteligencia artificial, sino una utilidad web basada en Gradio para descargar enunciados de examenes de anos anteriores de la Maharaja Ranjit Singh Punjab Technical University (MRSPTU). El autor lo describe como un proyecto de estudiante cuyo objetivo es automatizar la busqueda por codigo de asignatura y empaquetar los PDF encontrados en un unico archivo ZIP.

La herramienta acepta codigos de asignatura (con o sin espacios o guiones), normaliza las cadenas, consulta tres archivos web de la biblioteca de MRSPTU (2024, 2023 y 2022, por ese orden de prioridad) y descarga en paralelo los documentos coincidentes. El resultado se entrega a traves de una interfaz Gradio con estado de progreso en vivo. No contiene pesos, tokenizador, configuracion de transformer ni ningun artefacto de inferencia: la etiqueta de Hugging Face es unicamente `region:us`.

Por tanto, esta ficha documenta un artefacto de software, no un modelo. Los apartados de arquitectura, benchmarks, requisitos de hardware y comparativa de modelos no tienen contenido aplicable y se marcan como no disponibles, indicando explicitamente la naturaleza del repositorio. La relevancia practica se limita al ambito academico de MRSPTU y a la disponibilidad y estructura del sitio web de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (utilidad web con interfaz Gradio; no es un modelo neuronal) |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponibles (la interfaz esta redactada en ingles; no se declaran idiomas) |
| Licencia | MIT (segun la model card) |
| Formato de pesos | No disponible (el repositorio contiene codigo Python: `app.py`, `downloader.py`, `requirements.txt`) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni entrenamiento. El proyecto es una aplicacion Python compuesta por `app.py` (interfaz Gradio y visualizacion del progreso de descarga) y `downloader.py` (logica de busqueda, descarga, procesamiento y generacion del ZIP). Las dependencias declaradas son Python 3.9 o superior, Gradio, Requests y BeautifulSoup4, gestionadas mediante `requirements.txt`.

El flujo funcional descrito en la model card es: recepcion de codigos de asignatura, normalizacion (soporta variantes como `BMECS1501`, `BMECS 1501` o `BMECS1-501`), busqueda en los archivos de MRSPTU por orden 2024, 2023, 2022, identificacion de coincidencias, descarga concurrente de PDF directos y documentos alojados en Google, y empaquetado de los archivos validos en un ZIP. La herramienta declara reportar descargas fallidas en lugar de guardar paginas HTML invalidas como si fueran enunciados.

## Capacidades

- Busqueda de enunciados de examenes por codigo de asignatura en los archivos de MRSPTU de 2024, 2023 y 2022.
- Normalizacion de codigos con o sin espacios y guiones.
- Busqueda de multiples enunciados para una misma asignatura.
- Descarga concurrente para reducir el tiempo total de procesamiento.
- Manejo de distintas fuentes de archivo, incluyendo PDF directos y documentos alojados en Google.
- Generacion automatica de un ZIP con los documentos descargados correctamente.
- Estado de descarga y progreso en vivo en la interfaz.
- Interfaz web Gradio utilizable desde escritorio y movil.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues de modelo.

## Casos de uso

- Preparacion de examenes por parte de estudiantes de MRSPTU: introducir los codigos de las asignaturas matriculadas y obtener en un unico ZIP los enunciados disponibles de 2022 a 2024, evitando la navegacion manual por tres archivos distintos.
- Recopilacion por lotes para una cohorte: un representante de clase puede procesar decenas de codigos en una sola ejecucion gracias a la descarga concurrente y distribuir el ZIP resultante.
- Creacion de un repositorio de estudio local: descargar los enunciados de varias convocatorias de la misma asignatura para comparar patrones de preguntas entre anos.
- Automatizacion de biblioteca departamental: un docente puede lanzar la herramienta con los codigos de su area y consolidar el material en un archivo comprimido para su circulacion interna.
- Verificacion rapida de disponibilidad documental: comprobar que asignaturas tienen enunciados publicados antes de solicitar copias a la biblioteca.
- Uso desde dispositivos moviles: la interfaz Gradio declarada como utilizable en movil permite descargar enunciados sin instalar herramientas adicionales en el terminal.
- Integracion en scripts auxiliares: al exponer la logica en `downloader.py`, se puede invocar desde otros flujos Python para generar ZIP de forma programatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento; solo indica que el tiempo de descarga depende del numero de codigos, del numero de enunciados encontrados, del tiempo de respuesta del servidor de MRSPTU, del servicio externo de alojamiento y de la velocidad de red, y que las descargas concurrentes reducen el tiempo total.

## Requisitos de hardware

- No requiere GPU ni VRAM: no ejecuta inferencia de modelo.
- CPU suficiente para ejecutar Python 3.9 o superior y las dependencias (Gradio, Requests, BeautifulSoup4).
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos y entornos en contenedor.
- Despliegue local mediante `python app.py`, que inicia la interfaz Gradio; no se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI porque no aplican.
- Latencia y throughput no disponibles; dependen de la red y de los servidores de origen.

## Comparativa con modelos similares

| Herramienta | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MRSPTU-Question-Paper-Downloader | Utilidad web Gradio | No aplica | No aplica | MIT | Busqueda por codigo en archivos de MRSPTU 2022-2024 |
| Alternativas de modelos de IA | No disponible | No disponible | No disponible | No disponible | No hay modelos comparables: el artefacto no es un modelo |

No disponible comparativa con modelos de lenguaje: la categoria del repositorio es distinta (herramienta de descarga documental).

## Limitaciones y advertencias

- No es un modelo de IA; no debe evaluarse ni desplegarse como tal.
- La funcionalidad depende de la disponibilidad y de la estructura del sitio web de MRSPTU y de los servicios externos de alojamiento de documentos.
- Las descargas pueden fallar si un enunciado ha sido retirado, si el documento no esta disponible, si requiere acceso restringido, si cambia la estructura de las paginas o si el servicio externo modifica su mecanismo de descarga.
- El proyecto se declara independiente y no afiliado ni respaldado oficialmente por MRSPTU; la legalidad y disponibilidad de cada documento dependen de sus sitios de origen y titulares de derechos.
- La licencia del repositorio es MIT, pero los documentos descargados no heredan esa licencia y su reutilizacion comercial queda sujeta a los derechos de terceros.
- No se declaran idiomas soportados ni sesgos conocidos, al no existir componente de modelo.
- El repositorio registra 0 descargas y 0 likes, y no dispone de pipeline declarado en Hugging Face; su adopcion y mantenimiento son inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/Thorfinn-will-help/MRSPTU-Question-Paper-Downloader
- Repositorio GitHub: https://github.com/Thorfinn-will-help/MRSPTU-Question-Paper-Downloader
- Archivo de enunciados 2024: https://library.mrsptu.ac.in/question-paper-2024/
- Archivo de enunciados 2023: https://library.mrsptu.ac.in/question-paper-2023/
- Archivo de enunciados 2022: https://library.mrsptu.ac.in/question-papers/
