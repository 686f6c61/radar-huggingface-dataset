# textilelabs/Loom-Connoisseur-Maker

## Resumen

Loom Connoisseur Maker es una aplicación de escritorio, distribuida como archivo ZIP y no como pesos de modelo en el repositorio, que permite construir "connoisseurs": pequeños asistentes expertos a partir de documentos propios sin entrenamiento adicional. Cada connoisseur combina el modelo base Loom Crucible 4.5 (130M parámetros, entrenado desde cero por Textile Labs) con un fichero de notas reducido, y responde citando textualmente el fragmento de sus notas junto con la fuente; cuando no encuentra la respuesta, devuelve la frase "That isn't in my notes".

El enfoque es de recuperación sobre un corpus cerrado y pequeño, no de generación libre: el sistema está pensado para preguntas de consulta directa cuya respuesta cabe en una frase de las notas. Todo el procesamiento ocurre en CPU, de forma offline, con una latencia declarada de unos 5 segundos por pregunta en un portátil de 2019, y sin que los datos salgan del equipo salvo las descargas de Wikipedia que el usuario solicite explícitamente.

Es relevante como ejemplo de arquitectura de "experto pequeño" orientada a privacidad y a despliegue local sin GPU, y como propuesta de empaquetado reproducible: el Maker descarga Loom Crucible 4.5 (unos 520 MB) verificando su huella contra la publicada, expone una API compatible con Ollama en `http://127.0.0.1:11435` y permite publicar el connoisseur resultante en Hugging Face con su tarjeta, fuentes y resultados de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Loom Crucible 4.5, 130M parametros, entrenado desde cero; arquitectura no detallada en la informacion disponible) |
| Parametros totales | 130M (modelo base Loom Crucible 4.5) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete descarga un artefacto de aproximadamente 520 MB) |
| Idiomas soportados | no disponible (la model card y la ficha de Hugging Face no declaran idiomas) |
| Licencia | MIT (codigo); la musica del video es CC BY 3.0 |
| Formato de pesos | no disponible (el repositorio contiene `loom-connoisseur-maker.zip`; el modelo base se descarga en tiempo de ejecucion) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de Loom Crucible 4.5 mas alla de su tamano (130M parametros) y de que fue entrenado desde cero por Textile Labs. El producto Loom Connoisseur Maker no entrena ni ajusta el modelo: construye cada connoisseur emparejando el modelo base con un fichero de notas derivado de los documentos aportados (texto, Markdown, PDF, Word o temas de Wikipedia), y el modelo responde citando ese material con la fuente visible. No se documentan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion destacable no esta en el modelo sino en el empaquetado y el flujo de uso: un lanzador de doble clic para macOS, Windows y Linux que se autoconfigura en el primer arranque, descarga el modelo base verificando su huella, levanta un servidor local con endpoints compatibles con Ollama (`/api/chat`, `/api/generate`, `/api/tags`) y permite exportar el connoisseur a un directorio listo para publicar en Hugging Face. El requisito de entorno es Python 3.10 o superior.

## Capacidades

- Consulta documental con cita de fuente: responde extrayendo y citando fragmentos de sus notas, mostrando el origen de cada respuesta.
- Abstención explícita: cuando la respuesta no esta en las notas, devuelve "That isn't in my notes" en lugar de improvisar.
- Ingesta de documentos: acepta texto, Markdown, PDF y Word, ademas de seleccion de temas de Wikipedia.
- Inspeccion del aprendizaje: muestra exactamente que ha incorporado a partir de los documentos aportados antes de probarlo.
- API local compatible con Ollama: integrable desde otras aplicaciones mediante `/api/chat`, `/api/generate` y `/api/tags` en `http://127.0.0.1:11435`.
- Exportacion y publicacion: genera con un clic una carpeta con el connoisseur, su tarjeta, sus fuentes y sus resultados de prueba para subirlo a Hugging Face.
- Ejecucion 100% en CPU y offline, sin GPU.
- No soporta, segun el autor: resumen, comparacion entre documentos, matematicas ni opiniones. No se declaran capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Base de conocimiento interna de consulta rapida: cargar procedimientos, normativas o fichas de producto en PDF o Word y desplegar un asistente local que responde citando el documento exacto, sin enviar informacion sensible a servicios externos.
- Soporte a tecnico de campo sin conectividad: en entornos industriales o rurales sin red, el connoisseur se ejecuta en el portatil del operario y responde en unos 5 segundos por consulta sobre manuales de equipo precargados.
- Cumplimiento y trazabilidad: al citar siempre la fuente y abstenerse cuando no hay evidencia en las notas, encaja en flujos donde se exige justificar cada respuesta con el documento de origen.
- Documentacion de proyectos de software: convertir el README, las guias de estilo y las notas de arquitectura en un experto consultable por el equipo, con la ventaja de que la respuesta remite al fragmento concreto.
- Material didactico acotado: usar los connoisseurs ya publicados (astronomia, biologia, quimica, fisica, computacion, historia de la Segunda Guerra Mundial) como asistentes de repaso con alcance limitado y verificable.
- Prototipado rapido de asistentes verticales: evaluar en minutos, sin entrenamiento ni GPU, si un corpus concreto es suficiente para un asistente de dominio antes de invertir en un sistema mayor.
- Integracion en herramientas existentes: al exponer una API compatible con Ollama, puede conectarse a clientes que ya hablan ese protocolo para consultas sobre un corpus local controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es una latencia de aproximadamente 5 segundos por pregunta en CPU sobre un portatil de 2019.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere GPU.
- GPU de consumo: irrelevante para este producto, ya que no usa aceleracion grafica.
- CPU y memoria: no se especifican requisitos minimos de RAM ni de CPU; el autor cita como referencia un portatil de 2019 con unos 5 segundos por pregunta.
- Almacenamiento: el paquete `loom-connoisseur-maker.zip` mas la descarga unica de Loom Crucible 4.5, de aproximadamente 520 MB.
- Software: Python 3.10 o superior; lanzadores incluidos para macOS (`.command`), Windows (`.bat`) y Linux (`.sh`).
- Despliegue: aplicacion local con servidor HTTP en `http://127.0.0.1:11435` y API compatible con Ollama. No se documenta soporte para vLLM, llama.cpp, TGI ni Ollama como backend propio.
- Latencia y throughput: aproximadamente 5 segundos por pregunta en CPU; no se publica throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de contexto que permitan una comparacion cuantitativa fiable con alternativas. Como referencia cualitativa, el producto se situa en la categoria de asistentes locales sobre documentos cerrados (frente a enfoques de RAG sobre modelos generativos mayores), pero no se aportan numeros para contrastar.

## Limitaciones y advertencias

- Alcance muy restringido: el autor indica que funciona mejor en preguntas de consulta cuya respuesta cabe en una frase de las notas, y que es mas debil con el lenguaje cotidiano.
- No resume, no compara documentos, no hace matematicas y no emite opiniones.
- La calidad depende enteramente del fichero de notas: documentacion incompleta o ambigua produce un experto incompleto.
- Riesgo de alucinacion mitigado pero no eliminado: el diseño obliga a citar y a abstenerse, pero no se aportan evaluaciones publicadas que cuantifiquen la tasa de error.
- Idiomas soportados no declarados; no hay garantia documentada de rendimiento en castellano.
- Longitud de contexto no disponible, lo que impide estimar el tamano maximo util del corpus de notas.
- Sesgos: no se documentan sesgos conocidos del modelo base ni de los corpus de Wikipedia empleados.
- Licencia MIT para el codigo; conviene verificar por separado las licencias de los documentos que se carguen y de los contenidos de Wikipedia utilizados.
- Repositorio sin descargas ni likes y con tamano de 0.0 GB: el artefacto distribuible es el ZIP y el modelo base se obtiene en el primer arranque, por lo que la disponibilidad depende de que ese recurso externo siga publicado.
- Para produccion: es una aplicacion de escritorio mono usuario, no un servicio multiusuario; no se documentan mecanismos de concurrencia, autenticacion ni observabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Loom Connoisseur of Astronomy: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Astronomy
- Loom Connoisseur of Biology: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Biology
- Loom Connoisseur of Chemistry: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Chemistry
- Loom Connoisseur of Physics: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Physics
- Loom Connoisseur of Computing: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Computing
- Loom Connoisseur of WWII History: https://huggingface.co/textilelabs/Loom-Connoisseur-of-WWII-History
- Sitio de Textile Labs: https://textilelabs.github.io
- Video de presentacion: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker/resolve/main/loom-connoisseurs-film.mp4
