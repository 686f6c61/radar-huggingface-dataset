# wuke2024/lss-foraminal-ordinal-grading-models

## Resumen

El repositorio `wuke2024/lss-foraminal-ordinal-grading-models` contiene los checkpoints de los modelos de clasificación ordinal de estenosis foraminal lumbar (LSS) desarrollados por Wuke Peng y colaboradores. Se trata de un sistema de visión por computador aplicado a imágenes de resonancia magnética (RM) sagital de la columna lumbar, cuyo objetivo es asignar un grado ordinal de severidad a la estenosis foraminal, una condición que comprime las raíces nerviosas y puede causar dolor y déficits neurológicos.

La versión actual, `v2.0.0`, incluye 8 familias de modelos entrenadas de forma independiente, con 5 pliegues externos disjuntos por paciente por familia, lo que da un total de 40 checkpoints publicados. Los modelos emplean un enfoque de doble rama con refinamiento CORAL (Chain for Ordinal Regression) y un mecanismo de priorización de revisión, según se describe en el artículo asociado. El repositorio está orientado a la reproducibilidad de los análisis primarios del estudio, con manifiestos de modelos y sumas de verificación SHA256.

A diferencia de los modelos de lenguaje, este es un modelo de clasificación de imágenes médicas, sin capacidades generativas. Su relevancia radica en la automatización de la gradación de estenosis foraminal, una tarea que tradicionalmente depende de la evaluación subjetiva del radiólogo, y que puede beneficiarse de un sistema de apoyo a la decisión clínica con evaluación paciente-disjunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de doble rama con refinamiento CORAL, segun el articulo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | no disponible (ver archivo `v2.0.0/LICENSE` en el repositorio) |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna (numero de capas, tipo de backbone, etc.). Se sabe que se trata de un modelo de doble rama, lo que sugiere dos subredes que procesan informacion complementaria (posiblemente una rama para la imagen completa y otra para una region de interes, o dos vistas diferentes). El refinamiento CORAL es una tecnica de regresion ordinal que convierte el problema de clasificacion en una serie de tareas binarias encadenadas, lo que permite modelar la relacion de orden entre las categorias de severidad. El entrenamiento se realizo con evaluacion paciente-disjunta, es decir, los pliegues de validacion se separaron por paciente para evitar la fuga de informacion entre imagenes del mismo individuo. No se han publicado datos sobre el tamaño del dataset, el numero de epocas, ni las funciones de perdida utilizadas.

## Capacidades

- Clasificacion ordinal de estenosis foraminal lumbar en imagenes de RM sagital.
- Asignacion de un grado de severidad (probablemente de 0 a 3 o similar, segun la escala de Lee o equivalente).
- Priorizacion de revision: el modelo puede ordenar los casos por urgencia o probabilidad de patologia, lo que facilita el flujo de trabajo del radiologo.
- Procesamiento de imagenes medicas en 2D (cortes sagitales).
- No dispone de capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Asistencia al diagnostico radiologico: el modelo puede pre-clasificar los grados de estenosis foraminal en estudios de RM lumbar, reduciendo el tiempo de lectura y sirviendo como segunda opinion.
- Triage de pacientes: al priorizar los casos con mayor probabilidad de estenosis severa, permite que los radiologos atiendan primero los estudios mas urgentes.
- Investigacion clinica: los checkpoints publicados permiten reproducir los analisis del articulo o servir como punto de partida para estudios de correlacion entre el grado de estenosis y sintomas o resultados quirurgicos.
- Control de calidad en departamentos de radiologia: comparar la gradacion automatica con la de los especialistas para detectar discrepancias y estandarizar criterios.
- Entrenamiento de residentes: los grados predichos pueden utilizarse como material educativo para ilustrar casos tipicos y atipicos.
- Desarrollo de sistemas de apoyo a la decision clinica integrados en PACS (Picture Archiving and Communication System) o RIS (Radiology Information System).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado (referenciado en el repositorio) probablemente contenga metricas de exactitud, sensibilidad, especificidad o coeficiente de correlacion ordinal, pero no se incluyen en la model card ni en los resultados de busqueda.

## Requisitos de hardware

No se dispone de informacion sobre los requisitos de hardware especificos. Al ser un modelo de clasificacion de imagenes, se espera que requiera una GPU con al menos 8-16 GB de VRAM para inferencia en tiempo real, aunque el tamaño exacto de los checkpoints (2.0 GB en total para los 40 archivos) sugiere que cada modelo individual es relativamente pequeno (decenas de MB). No se indican GPUs recomendadas ni opciones de despliegue. Dado que no es un modelo de lenguaje, no se aplican herramientas como vLLM u Ollama; el despliegue se haria mediante frameworks de deep learning convencionales (PyTorch, TensorFlow) o con ONNX Runtime para optimizacion.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros modelos de clasificacion de estenosis foraminal lumbar con los que comparar directamente. Existen trabajos previos en la literatura sobre gradacion automatica de estenosis espinal, pero no se dispone de datos concretos para una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion: los checkpoints se publican para reproducibilidad, no como un producto clinico validado. Su uso en entornos reales requiere una validacion prospectiva adicional.
- Sesgos de datos: al ser un modelo entrenado con un conjunto de datos especifico, puede presentar sesgos relacionados con la poblacion, el equipo de RM o el protocolo de adquisicion.
- Riesgo de error: la clasificacion ordinal puede tener errores en casos limites; la priorizacion de revision no elimina la necesidad de supervision medica.
- Licencia: la licencia esta definida en el archivo `v2.0.0/LICENSE`, pero su contenido no se ha especificado en la informacion disponible. Es imprescindible revisarla antes de cualquier uso comercial.
- Alcance limitado: el modelo solo procesa imagenes sagitales y no aborda otros tipos de estenosis (central, lateral) ni otras patologias.
- Sin garantias: no se ofrecen garantias de rendimiento ni de idoneidad para un proposito particular.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wuke2024/lss-foraminal-ordinal-grading-models
- Codigo fuente (GitHub): https://github.com/pengwuke/lss-foraminal-ordinal-grading
- DOI historico (Protocolo V3): 10.57967/hf/9761
