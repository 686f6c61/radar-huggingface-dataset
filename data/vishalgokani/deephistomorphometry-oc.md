# vishalgokani/deephistomorphometry-oc

## Resumen

DeepHistomorphometry OC es un modelo de segmentacion semantica de imagenes (no un modelo de lenguaje) orientado a histomorfometria osea. Lo publica el usuario vishalgokani en Hugging Face y su funcion es segmentar estructuras de interes en parches de imagen de hueso tenido: hueso trabecular (`tb`), osteoclastos (`oc`), senal TRAP positiva (`trap+`) y nucleos celulares (`nucleus`). El modelo se distribuye como un archivo de 2,2 GB que contiene un nnU-Net v2 configurado en 2D y con canales de entrada RGB.

El problema que resuelve es la cuantificacion reproducible de osteoclastos en cortes histologicos: contar y medir celulas de resorcion osea de forma manual es lento y dependiente del observador. El modelo automatiza esa tarea y el pipeline asociado produce mascaras PNG y salidas CSV cuantitativas a partir de imagenes TIFF de portaobjetos completos (whole-slide images) o de parches ya extraidos.

Es relevante en el contexto de investigacion en biologia osea y desarrollo de farmacos anti-resortivos, porque el modelo se declara agnostico de especie, lo que en principio permite reutilizarlo en modelos animales distintos sin reentrenar. No hay datos publicados sobre arquitectura interna exacta, numero de parametros, volumen de datos de entrenamiento ni resultados de validacion; la model card es breve y remite al repositorio DeepHistomorphometry para su uso mediante linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 en configuracion 2D (red convolucional tipo U-Net con preprocesado y entrenamiento autoconfigurados por el framework); entrada RGB, salida multiclase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por parches; tamano de parche no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de segmentacion de imagen) |
| Licencia | no disponible en la model card ni en los metadatos de Hugging Face |
| Formato de pesos | no disponible (el repositorio contiene un archivo de 2,2 GB; no se detalla el formato de checkpoint) |

Otros datos de interes: etiquetas de primer plano `tb`, `oc`, `trap+` y `nucleus`; entrada RGB; salidas PNG de mascara y CSV cuantitativos; el modelo se ejecuta a traves del pipeline de linea de comandos del repositorio DeepHistomorphometry.

## Arquitectura y entrenamiento

La arquitectura es nnU-Net v2, un framework de segmentacion medica que autoconfigura el preprocesado, el tamano de parche, el tamano de lote, la topologia de la red, el esquema de aumento de datos y el posprocesado segun las propiedades del dataset. En este caso el autor indica explicitamente la configuracion 2D y una entrada de tres canales (RGB), con cuatro clases de primer plano: hueso trabecular, osteoclastos, TRAP positivo y nucleos. No se especifica la profundidad de la red, el numero de caracteristicas por nivel ni si se emplea algun tipo de ensemble o de validacion cruzada.

No hay informacion disponible sobre el dataset de entrenamiento: ni el numero de imagenes o parches, ni la procedencia, ni la composicion por especie, ni el esquema de anotacion, ni si hubo validacion por patologo. Tampoco se documenta ningun tipo de ajuste fino con refuerzo o preferencias humanas (RLHF/DPO), algo que no aplica en un modelo de segmentacion. El unico dato de caracterizacion es la declaracion de "agnostico de especie", que sugiere un entrenamiento con muestras de varias especies, pero el detalle no esta publicado.

## Capacidades

- Segmentacion semantica multiclase de parches histologicos de hueso con cuatro etiquetas de primer plano: `tb` (hueso trabecular), `oc` (osteoclastos), `trap+` (region positiva para tincion TRAP) y `nucleus` (nucleos celulares).
- Deteccion y delimitacion de osteoclastos, lo que permite derivar recuentos celulares y medidas de area por unidad de superficie osea.
- Segmentacion de nucleos, util para determinar la multinuclearidad de los osteoclastos, criterio habitual en histomorfometria.
- Procesamiento de imagenes TIFF de portaobjetos completos, asi como de parches previamente extraidos.
- Generacion de mascaras en PNG como salida visual y de ficheros CSV con metricas cuantitativas por imagen o por caso.
- Comportamiento declarado como agnostico de especie, es decir, no restringido a un unico modelo animal.
- Ejecucion mediante pipeline de linea de comandos, orientada a lotes y a integracion en flujos de investigacion.
- No dispone de tool calling, function calling, agentes, modo de razonamiento, vision general, audio ni capacidades multilingues: es un modelo de vision especializado en una unica tarea.

## Casos de uso

- Cuantificacion de resorcion osea en estudios de osteoporosis: el modelo segmenta osteoclastos y hueso trabecular en series de cortes tenidos con TRAP, y el CSV de salida permite calcular parametros histomorfometricos clasicos como numero de osteoclastos por superficie osea o superficie osteoclastica por superficie osea.
- Evaluacion preclinica de farmacos antirresortivos: en ensayos con roedores, el caracter agnostico de especie permite aplicar el mismo modelo a distintos modelos animales y comparar el efecto de un tratamiento sobre el numero y tamano de osteoclastos entre grupos control y tratados.
- Analisis de alto rendimiento de cohortes completas: el pipeline acepta TIFF de portaobjetos completos, de modo que se puede procesar un lote entero de laminas de forma desatendida y generar una tabla agregada por animal o por caso.
- Control de calidad y armonizacion entre laboratorios: al generar mascaras PNG, un patologo puede revisar visualmente la segmentacion y detectar lotes con tincion deficiente o artefactos antes de aceptar los valores cuantitativos, lo que ayuda a homogeneizar criterios entre centros.
- Estudios de multinuclearidad de osteoclastos: la etiqueta `nucleus` combinada con `oc` permite estimar el numero de nucleos por osteoclasto, un indicador de madurez y actividad de resorcion que es costoso de obtener manualmente.
- Investigacion en biologia osea comparada: al no estar atado a una especie concreta, sirve para analizar muestras de modelos poco habituales donde no existen conjuntos de datos anotados suficientes para entrenar un modelo especifico.
- Docencia y formacion en histomorfometria: las mascaras generadas sobre casos reales permiten ilustrar la identificacion de osteoclastos y lineas de cemento TRAP en sesiones de formacion, con material reproducible.
- Preanotacion para reentrenamiento: las mascaras del modelo pueden servir como anotaciones iniciales que un experto corrige, reduciendo el coste de construir un conjunto de datos propio para afinar el modelo a una tincion o escaner concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de segmentacion (por ejemplo Dice, IoU o F1 por clase), ni comparaciones con anotaciones de referencia, ni estudios de concordancia entre observadores.

| Benchmark | Resultado | Notas |
|---|---|---|
| Dice / IoU por clase (tb, oc, trap+, nucleus) | no disponible | No reportado en la model card ni en los metadatos |
| Validacion con anotaciones de patologo | no disponible | No documentada |
| Comparativa con segmentacion manual | no disponible | No documentada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de una red 2D del framework nnU-Net, la inferencia suele ser ligera en comparacion con modelos 3D o con modelos fundacionales de imagen; no obstante, el consumo depende del tamano de parche configurado, que no se publica.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA y suficiente memoria para el tamano de parche configurado deberia poder ejecutar la inferencia; las cifras concretas no estan documentadas.
- Viabilidad en GPU de consumo: no confirmada por el autor. Es habitual que las configuraciones 2D de nnU-Net quepan en GPU de consumo de gama media o alta, pero este dato debe validarse en la practica porque no hay cifras publicadas.
- Ejecucion en CPU: no documentada. nnU-Net permite inferencia en CPU, con un coste de tiempo considerablemente mayor sobre portaobjetos completos.
- Opciones de despliegue: la via indicada por el autor es el pipeline de linea de comandos del repositorio DeepHistomorphometry, sobre PyTorch. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de modelos de lenguaje, que no aplican a este tipo de modelo. Tampoco se documenta una imagen Docker oficial en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen del numero de parches por lamina, del hardware y del tamano de parche efectivo.
- Almacenamiento: el repositorio de pesos ocupa 2,2 GB, a lo que hay que sumar el espacio de los TIFF de entrada y de las mascaras PNG generadas.

## Comparativa con modelos similares

| Modelo | Categoria | Tipo de arquitectura | Licencia | Rendimiento en histomorfometria osea | Disponibilidad |
|---|---|---|---|---|---|
| DeepHistomorphometry OC | Segmentacion multiclase de hueso (tb, oc, trap+, nucleus) | nnU-Net v2 2D | no disponible | no disponible | Pesos publicos en Hugging Face (2,2 GB) |
| Otros modelos nnU-Net v2 publicos | Segmentacion medica general | nnU-Net v2 | variable segun modelo | no disponible | Repositorios comunitarios |
| Cellpose | Segmentacion celular generalista | Red convolucional con flujo de gradientes | no disponible en la informacion recogida | no disponible para hueso/TRAP | Publico |
| StarDist | Deteccion y segmentacion de objetos con forma estrellada | Red convolucional con prediccion de distancias radiales | no disponible en la informacion recogida | no disponible para hueso/TRAP | Publico |
| Segment Anything (SAM) | Segmentacion promptable generalista | Transformer de vision | no disponible en la informacion recogida | no disponible para hueso/TRAP | Publico |

No hay datos publicados que permitan comparar el rendimiento de DeepHistomorphometry OC con estas alternativas en la tarea concreta de segmentacion de osteoclastos y TRAP en hueso. Las diferencias relevantes son de planteamiento: las alternativas generalistas no incluyen clases especificas de histomorfometria osea, mientras que este modelo esta especializado en las cuatro etiquetas citadas.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: el propio autor indica que no es un producto sanitario y que no debe utilizarse como base unica para diagnostico o tratamiento.
- Resultados sensibles a la tincion, las caracteristicas del escaner y la preparacion del tejido, segun advierte la model card. Entradas fuera de la distribucion de entrenamiento pueden degradar la segmentacion.
- Riesgo de fallo silencioso: una segmentacion incorrecta puede traducirse en valores cuantitativos erroneos sin aviso, por lo que se recomienda revision humana de las mascaras y validacion contra anotaciones de referencia antes de usar los CSV en un analisis.
- No hay informacion sobre sesgos por especie, laboratorio, tipo de hueso, tincion o caracteristicas del escaner, ni sobre el equilibrio del dataset de entrenamiento.
- Licencia no declarada: al no indicarse licencia, no puede asumirse permiso para uso comercial ni para redistribucion de los pesos. Conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Ausencia total de metricas de rendimiento publicadas (Dice, IoU, sensibilidad por clase), lo que impide estimar de antemano la calidad esperada y obliga a validar localmente.
- Idiomas y contexto no aplican, pero si aplican limitaciones equivalentes: no hay informacion sobre el rango de magnificaciones, resoluciones de escaner o tamanos de parche soportados, ni sobre el comportamiento con tinciones distintas de las empleadas en entrenamiento.
- Metadatos incompletos: el modelo no registra pipeline, idiomas ni licencia en su ficha de Hugging Face, y no cuenta con descargas ni valoraciones, por lo que no existe evidencia externa de uso en produccion o en publicaciones.
- Fechas de creacion y actualizacion en los metadatos aparecen como 2026-09-25, lo que resulta inconsistente con la fecha actual y sugiere un posible error de registro; conviene tratarlas con cautela.
- El repositorio tiene 2,2 GB y no detalla el formato de los pesos, de modo que la compatibilidad con herramientas de conversion o cuantizacion no esta garantizada.
- La integracion con modelos de lenguaje, agentes, tool calling o despliegues tipo vLLM no aplica a este modelo y no debe asumirse.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/vishalgokani/deephistomorphometry-oc
- Arbol de ficheros del repositorio: https://huggingface.co/vishalgokani/deephistomorphometry-oc/tree/main
- Repositorio DeepHistomorphometry (pipeline de linea de comandos OC): mencionado en la model card, sin URL disponible en la informacion recogida
- Paper arXiv 2503.14867: https://arxiv.org/pdf/2503.14867 (aparece en los resultados de busqueda, pero no se ha confirmado su relacion con este modelo)
- Referencias sobre nnU-Net v2 (framework subyacente): no disponible en la informacion recogida
