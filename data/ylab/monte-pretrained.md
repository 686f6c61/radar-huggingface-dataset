# ylab/MONTE-pretrained

## Resumen

MONTE (Methylation-based Observation Normalization and Tumor purity Estimation) es un modelo bioinformático desarrollado por el laboratorio ylab de la Universidad Rice, diseñado para estimar la pureza tumoral a partir de datos de metilación del ADN. A diferencia de los modelos de lenguaje, MONTE no es un transformer ni un LLM, sino un método estadístico que aprende relaciones entre la metilación observada y la pureza tumoral mediante un modelo lineal estabilizado con moderación de varianza empírica de Bayes. Su relevancia radica en que permite inferir la pureza de muestras tumorales sin necesidad de muestras normales emparejadas ni conjuntos de sondas predefinidos, lo que facilita su aplicación en estudios oncológicos y análisis de datos de metilación a gran escala.

El modelo se publica en Hugging Face bajo licencia BSD-3-Clause, aunque la model card no incluye detalles técnicos adicionales. La información disponible se limita al nombre, autor y licencia; no se especifican parámetros, arquitectura interna ni formato de pesos. El PDF asociado describe el método subyacente, pero no se proporcionan pesos preentrenados ni instrucciones de uso en el repositorio. Por tanto, esta ficha se basa en la documentación pública del método y en los metadatos del repositorio, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo lineal estabilizado con moderacion de varianza empirica de Bayes (segun publicacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos de metilacion, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Segun la publicacion de 2016 (Kim et al.), MONTE emplea un modelo lineal estabilizado que aprende relaciones sonda-especificas entre la metilacion observada y la pureza tumoral. Utiliza moderacion de varianza empirica de Bayes para estabilizar las estimaciones, y agrega los efectos a nivel de sonda mediante ponderacion por relacion señal-ruido. El entrenamiento se realiza sobre datos de metilacion de arrays (tipicamente Illumina 450K o EPIC), sin requerir muestras normales pareadas. No se dispone de informacion sobre el conjunto de datos exacto utilizado para el modelo publicado en Hugging Face, ni sobre el proceso de entrenamiento (numero de muestras, epocas, etc.). Tampoco se indica si el modelo incluye pesos preentrenados o si es solo una implementacion de referencia.

## Capacidades

- Estimacion de pureza tumoral a partir de datos de metilacion de ADN.
- Normalizacion de observaciones de metilacion basada en la pureza estimada.
- Inferencia en nuevas muestras sin necesidad de muestras normales emparejadas.
- Agregacion de efectos a nivel de sonda mediante ponderacion por señal-ruido.
- No es un modelo de lenguaje: no genera texto, codigo ni realiza razonamiento simbolico.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigacion oncologica: estimar la pureza tumoral en biopsias para ajustar analisis de metilacion diferencial y evitar falsos positivos por contaminacion estromal.
- Analisis de datos de metilacion en estudios de cohortes: aplicar MONTE a conjuntos de datos publicos (TCGA, GEO) para normalizar observaciones antes de estudios de asociacion.
- Validacion de biomarcadores epigeneticos: corregir los efectos de la pureza tumoral en la identificacion de regiones metiladas asociadas a cancer.
- Estudios de heterogeneidad tumoral: estimar la proporcion de celulas tumorales en muestras mixtas para correlacionar con caracteristicas clinicas.
- Control de calidad en pipelines de metilacion: usar MONTE como paso de preprocesamiento para detectar muestras con baja pureza que puedan sesgar resultados.
- Desarrollo de herramientas bioinformaticas: integrar MONTE en flujos de trabajo de analisis epigenetico como alternativa a metodos que requieren normales pareadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El PDF de 2016 describe validaciones internas, pero no se proporcionan metricas comparativas (como correlacion con pureza histologica o AUC) en la model card ni en el repositorio de Hugging Face.

## Requisitos de hardware

- Al ser un modelo estadistico lineal, no requiere GPU para inferencia; puede ejecutarse en CPU con memoria RAM estandar (menos de 1 GB para datos tipicos de arrays de metilacion).
- No se especifican requisitos de VRAM ni GPU recomendadas.
- El despliegue puede realizarse en R o Python con librerias estadisticas (limma, etc.), aunque no se proporciona codigo de implementacion en el repositorio.
- No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el repositorio. En el campo de estimacion de pureza tumoral existen alternativas como ABSOLUTE, ESTIMATE o PUREE, pero no se proporcionan datos de comparacion en la documentacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para tareas de NLP, generacion de texto o razonamiento.
- La model card no incluye instrucciones de uso, pesos preentrenados ni ejemplos de codigo; el repositorio parece ser solo una referencia al metodo.
- No se han documentado sesgos especificos, pero al ser un metodo estadistico, su precision depende de la calidad y representatividad de los datos de entrenamiento originales.
- La licencia BSD-3-Clause permite uso comercial y modificacion, pero no se garantiza soporte ni mantenimiento.
- No hay informacion sobre limitaciones de contexto o idioma, ya que no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ylab/MONTE-pretrained
- Publicacion original (PDF): https://ylab.rice.edu/media/documents/kim_monte_2016.pdf
- Laboratorio ylab (Universidad Rice): https://ylab.rice.edu
