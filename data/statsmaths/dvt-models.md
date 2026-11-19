# statsmaths/dvt-models

## Resumen

`statsmaths/dvt-models` es un repositorio de pesos auxiliares del Distant Viewing Toolkit (DVT), una herramienta de codigo abierto desarrollada por el Distant Viewing Lab (Taylor Arnold y Lauren Tilton) para el analisis computacional de grandes corpus visuales. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto heterogeneo de pesos especializados que el toolkit descarga automaticamente para tareas concretas de vision por computador aplicada a video: deteccion de cortes de plano, deteccion de cabezas humanas y anotacion de risas.

El repositorio agrupa cuatro artefactos que no se publican en ningun otro sitio: los pesos de TransNetV2 para segmentacion de planos (`detect_shots.pt`), un detector YOLO26-large entrenado especificamente para localizar cabezas (`yolo26l_heads.pt`), y dos ficheros del anotador de risas (una red neuronal y un clasificador de 200 arboles serializado en JSON). El tamano total del repositorio es de aproximadamente 0,1 GB, coherente con pesos de vision de tamano pequeno y medio.

Su relevancia es instrumental: quien utilice el DVT para analizar corpus audiovisuales (cine, television, archivos digitalizados) depende de estos ficheros para que los modulos `frames`, `yolo` y `laughter` funcionen. No obstante, la licencia es mixta y uno de los pesos (el detector YOLO) arrastra las obligaciones de AGPL-3.0 de la libreria Ultralytics con la que fue entrenado, lo que condiciona su uso en productos no abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta: TransNetV2 (red convolucional para deteccion de cortes), YOLO26-large (detector de objetos), red neuronal para risas y clasificador de 200 arboles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Mixta: MIT (TransNetV2 y ficheros de risas), AGPL-3.0 (pesos YOLO26 entrenados con Ultralytics) |
| Formato de pesos | PyTorch state dict (`.pt`) y JSON (`.json`) |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo sino tres componentes independientes. `detect_shots.pt` son los pesos de TransNetV2, una red convolucional disenada para detectar fronteras de plano en video, publicada originalmente por Soucek y Lokoc bajo licencia MIT. `yolo26l_heads.pt` es un detector YOLO26 en variante large, entrenado por el equipo del DVT para la clase especifica "cabeza" mediante la libreria Ultralytics; no se documentan en la model card el dataset de entrenamiento, el numero de imagenes ni el regimen de aumento de datos. Los dos ficheros de `laughter/` corresponden a un anotador de risas propio del Distant Viewing Lab: una red neuronal (`laughter_net.pt`) y un clasificador de 200 arboles exportado a JSON (`laughter_classifier.json`).

No se especifican en la informacion disponible detalles sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de regularizacion ni procesos de ajuste fino con refuerzo. La unica referencia metodologica es la cita academica de Arnold y Tilton (2019) sobre el analisis de grandes corpus visuales, que describe el marco general del toolkit pero no los pormenores de cada peso.

## Capacidades

- Deteccion de fronteras de plano en video mediante TransNetV2, util para segmentar automaticamente material audiovisual en unidades de montaje.
- Deteccion de cabezas humanas en fotogramas mediante un detector YOLO26-large especializado, orientado a analisis de encuadre y presencia de personas.
- Anotacion de risas en pistas de audio o segmentos multimedia mediante una red neuronal combinada con un clasificador de arboles.
- Integracion como dependencia automatica del Distant Viewing Toolkit: los modulos `frames`, `yolo` y `laughter` descargan estos pesos sin intervencion del usuario.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, capacidades de agente ni soporte multilingue: es exclusivamente un conjunto de pesos de vision y audio para analisis.

## Casos de uso

- Segmentacion de corpus cinematograficos: el modulo `frames` carga `detect_shots.pt` para dividir peliculas o series en planos, permitiendo medir duracion media de plano, ritmo de montaje y cambios de escena a escala de miles de horas.
- Analisis de encuadre y composicion: `yolo26l_heads.pt` detecta cabezas en fotogramas muestreados, lo que permite estudiar planos medios, primeros planos y densidad de figuras humanas en un corpus televisivo.
- Estudios de humor y recepcion: el anotador de risas (`laughter/laughter_net.pt` junto con `laughter_classifier.json`) marca segmentos con risa, util para analizar comedias de situacion, programas de entretenimiento o discursos con publico.
- Investigacion en humanidades digitales: el DVT y sus pesos permiten construir metricas cuantitativas sobre archivos audiovisuales (frecuencia de cortes, presencia de personas, densidad de risas) sin entrenar modelos propios.
- Docencia y prototipado: al ser pesos ligeros (repo de 0,1 GB) y descargarse automaticamente, sirven para montar talleres de analisis de video en entornos con recursos limitados.
- Auditoria de archivos de television: combinar la deteccion de planos con la de cabezas permite detectar patrones de produccion (por ejemplo, cambios de formato o de estilo de realizacion) a lo largo de decadas de emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano del repositorio (0,1 GB) y la naturaleza de los modelos (TransNetV2 y YOLO26-large), es plausible que quepan en GPUs de consumo, pero no se confirma con datos del autor.
- GPU recomendadas: no disponible. Para inferencia de YOLO26-large y TransNetV2 suele ser suficiente una GPU consumer moderna (gama RTX xx60/xx70 o superior), pero no se documenta en la informacion proporcionada.
- Cabe en consumer GPU: no confirmado oficialmente; el tamano de los pesos sugiere que si, aunque no hay especificacion del autor.
- Opciones de despliegue: el consumo previsto es a traves del propio Distant Viewing Toolkit (Python, PyTorch y Ultralytics); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `statsmaths/dvt-models` | Pesos de vision y audio para DVT | no disponible | no aplica | Mixta (MIT + AGPL-3.0) | Hugging Face |
| TransNetV2 (original) | Deteccion de cortes de plano | no disponible | no aplica | MIT | Repositorio propio de los autores |
| YOLO26 (Ultralytics) | Deteccion de objetos generica | no disponible | no aplica | AGPL-3.0 | Ultralytics / Hugging Face |
| PySceneDetect | Deteccion de escenas por contenido | no aplica (algoritmico) | no aplica | BSD-3-Clause | PyPI / GitHub |

La comparativa es aproximada: el repositorio de DVT no es un modelo unico sino un agregado de pesos, por lo que la comparacion directa solo tiene sentido componente a componente. Frente a TransNetV2 original, estos pesos son los mismos con el empaquetado del DVT; frente a YOLO26 generico, la variante de DVT esta especializada en cabezas; frente a PySceneDetect, TransNetV2 suele ofrecer deteccion mas robusta en material con transiciones graduales, aunque no se aportan metricas en la informacion disponible.

## Limitaciones y advertencias

- Licencia mixta: `yolo26l_heads.pt` se entreno con Ultralytics y hereda AGPL-3.0, lo que puede obligar a liberar el codigo de aplicaciones que lo integren si se distribuyen como servicio en red. Revisar terminos antes de uso comercial cerrado.
- Los pesos de TransNetV2 y los ficheros de risas son MIT, pero el conjunto del repositorio no comparte una unica licencia; hay que tratar cada fichero por separado.
- No hay informacion sobre sesgos del detector de cabezas: al ser un YOLO entrenado para una clase concreta, puede fallar en encuadres no convencionales, material de baja resolucion, animacion o personas parcialmente ocultas.
- El anotador de risas puede confundirse con otros sonidos (aplausos, musica, ruido) y su clasificador de 200 arboles es un componente ligero, no un modelo acustico de gran escala.
- No es un modelo de lenguaje: no admite prompts, no genera texto y no tiene contexto conversacional; cualquier uso fuera de los modulos del DVT requiere adaptacion manual.
- No se documentan idiomas, datos de entrenamiento ni evaluacion cuantitativa, lo que dificulta estimar su robustez en dominios distintos al corpus con el que se desarrollo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos en las detecciones, que deben validarse en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/statsmaths/dvt-models
- Distant Viewing Toolkit (GitHub): https://github.com/distant-viewing/dvt
- Cita: Arnold, Taylor y Lauren Tilton. "Distant Viewing: Analyzing Large Visual Corpora." *Digital Scholarship in the Humanities*, 2019.
