# YiqiLi/KlaBenchmark

## Resumen
KlaBenchmark es un paquete de datos y pesos entrenados publicado en Hugging Face por el usuario YiqiLi, orientado a la evaluacion reproducible de predictores de sitios de lactilacion de lisina (Kla). El problema que aborda es metodologico: los predictores publicados previamente se entrenaron y evaluaron sobre conjuntos de datos y definiciones de lisinas de fondo distintas, por lo que sus metricas publicadas no son directamente comparables entre si. Esta release reentrena y puntua siete predictores publicados sobre los mismos sitios de KlaAtlas, los mismos splits y el mismo protocolo de evaluacion.

El paquete contiene los ficheros TSV del benchmark y los pesos de los modelos entrenados, mientras que el codigo de entrenamiento y prediccion reside en un repositorio de GitHub separado. Los siete predictores incluidos son `PCBert-Kla`, `HybridKla`, `PBertKla`, `DeepKlapred`, `ABFF-Kla`, `Auto-Kla` y `DeepKla`. No se trata de un modelo de lenguaje generativo ni de un modelo fundacional, sino de un conjunto de clasificadores especializados en un problema concreto de bioinformatica.

La relevancia actual del paquete radica en que estandariza la comparacion entre metodos heterogeneos de prediccion de Kla, algo poco habitual en la literatura de prediccion de modificaciones postraduccionales. El repositorio ocupa 4,0 GB e incluye particiones para evaluacion de generalizacion externa, definiciones de fondo alternativas, distintos tamanos de ventana de contexto, transferencia entre especies, entrenamiento especifico por especie y rendimiento en datos DIA.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de siete predictores independientes; no se detalla la arquitectura de cada uno) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventanas de secuencia de 15, 31, 35, 41, 45 y 51 aminoacidos segun el metodo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de secuencias de proteinas, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el paquete incluye checkpoints, sin formato especificado) |

## Arquitectura y entrenamiento
El paquete no describe una arquitectura unica, sino que agrupa siete predictores previamente publicados. Cada metodo emplea su propia ventana de entrada centrada en la lisina candidata: ABFF-Kla usa ventanas de 35 aminoacidos, PBertKla de 45 y el resto de 51. Los ficheros de entrenamiento, validacion y prueba deben incluir al menos las columnas `Sequence` (ventana local con relleno `_`) y `Label` (1 para sitio Kla identificado experimentalmente, 0 para lisina de fondo). ABFF-Kla requiere ademas campos estructurales como `Contact`. Las columnas opcionales incluyen `Site`, `ACC_ID`, `Mod_positions`, `Species` y `UniProtTaxID`.

El benchmark define particiones estandarizadas. La particion a nivel de proteina mantiene todas las muestras de una misma proteina en un unico subconjunto. La particion a nivel de secuencia reclusteriza las mismas ventanas con CD-HIT al 50% de identidad. La prueba externa de sitios no vistos se repite diez veces y retiene sitios ausentes de los conjuntos de entrenamiento publicados. Se incluyen ademas cuatro definiciones de fondo (lisinas observables por MS, a nivel de proteina, con RSA < 0,2 y con sesgo de construccion de peptidos eliminado), cada una con diez repeticiones. La particion de contexto de secuencia varia solo la longitud de ventana (15, 31, 41 y 51 aminoacidos). La transferencia entre especies entrena y valida en proteinas humanas y evalua en especies no humanas. El entrenamiento especifico por especie cubre `Homo_sapiens`, `Mus_musculus`, `Rattus_norvegicus`, `Caenorhabditis_elegans`, `Escherichia_coli` y `Streptococcus_mutans`. La evaluacion DIA externa consta de diez repeticiones no usadas para entrenamiento ni seleccion de modelo.

## Capacidades
- Prediccion binaria de sitios de lactilacion de lisina (Kla) a partir de ventanas de secuencia centradas en la lisina candidata.
- Siete predictores independientes evaluados bajo un protocolo comun: `PCBert-Kla`, `HybridKla`, `PBertKla`, `DeepKlapred`, `ABFF-Kla`, `Auto-Kla` y `DeepKla`.
- Evaluacion de generalizacion externa sobre sitios no vistos y sobre corpus originales de cada modelo publicado.
- Evaluacion bajo cuatro definiciones alternativas de lisinas de fondo, con diez repeticiones por definicion.
- Analisis de sensibilidad al tamano de ventana de contexto (15, 31, 41 y 51 aminoacidos).
- Evaluacion de transferencia entre especies (entrenamiento en humano, prueba en no humanos).
- Entrenamiento y evaluacion especificos por especie para seis organismos.
- Evaluacion en datos DIA independientes con diez repeticiones.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso
- Seleccion de predictor para un pipeline proteomico: un grupo que necesite predecir sitios Kla puede comparar los siete metodos bajo las mismas condiciones y elegir el mas adecuado para su distribucion de datos, en lugar de fiarse de metricas publicadas no comparables.
- Validacion de generalizacion entre especies: el uso de la particion de transferencia entre especies permite estimar si un predictor entrenado en humano se comporta aceptablemente en `Mus_musculus` o `Rattus_norvegicus` antes de aplicarlo a un estudio no humano.
- Analisis de sensibilidad a la definicion de fondo: los cuatro conjuntos de fondo permiten cuantificar cuanto cambia el rendimiento de cada metodo segun se consideren lisinas observables por MS, a nivel de proteina, con RSA bajo o con sesgo eliminado.
- Ajuste del tamano de ventana: la particion de contexto de secuencia permite decidir si ventanas de 15, 31, 41 o 51 aminoacidos son suficientes para la tarea, lo que afecta directamente a los requisitos computacionales del despliegue.
- Evaluacion en datos DIA: la particion DIA externa sirve para estimar el comportamiento en un flujo de adquisicion independiente, relevante para laboratorios que trabajan con data-independent acquisition.
- Entrenamiento especifico por organismo: la particion por especie permite construir y evaluar modelos especializados para `Escherichia_coli`, `Streptococcus_mutans` u otros organismos concretos.
- Reproducibilidad de resultados publicados: el paquete permite replicar la comparacion entre los siete metodos sin reentrenar desde cero, usando los checkpoints incluidos.
- Benchmarking de nuevos metodos: un grupo que desarrolle un predictor nuevo puede evaluarlo contra los siete metodos de referencia bajo el protocolo de KlaAtlas y reportar cifras comparables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 4,0 GB, pero ese dato incluye conjuntos de datos y checkpoints de siete modelos, por lo que no permite derivar la VRAM necesaria para un unico predictor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El paquete esta etiquetado con la libreria Keras, y el codigo de entrenamiento y prediccion se encuentra en el repositorio de GitHub asociado, no en Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No disponible. El paquete no incluye una comparativa con otros benchmarks de prediccion de Kla, y no se dispone de datos de rendimiento de los siete predictores en la informacion proporcionada. La comparativa interna entre los siete metodos es precisamente el objetivo del benchmark, pero sus resultados no se detallan en la model card.

## Limitaciones y advertencias
- La model card no especifica licencia, por lo que el uso comercial de los pesos y los datos queda sin definir y requiere consulta con el autor.
- No se detalla el pipeline, los idiomas ni la libreria de inferencia mas alla de la etiqueta `keras`.
- El paquete no es un modelo generativo: no sirve para tareas de texto, codigo, vision ni agentes.
- Los resultados de rendimiento de los siete predictores no se publican en la model card, solo la estructura del benchmark.
- La comparabilidad entre metodos depende de mantener intacta la estructura de directorios y los nombres de carpeta, que forman parte de las rutas del benchmark.
- Cada metodo exige su propia ventana de entrada (35 aa para ABFF-Kla, 45 aa para PBertKla, 51 aa para el resto), lo que impide alimentar a todos los predictores con el mismo fichero sin preprocesado previo.
- ABFF-Kla requiere campos estructurales adicionales como `Contact`, lo que limita su aplicacion a casos donde se disponga de esa informacion.
- La particion de prueba externa de sitios no vistos se repite diez veces; usar una sola repeticion puede dar estimaciones inestables.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto, dado que no es un modelo de lenguaje.
- El repositorio se actualizo por ultima vez en noviembre de 2026 segun los metadatos, con fecha de creacion en junio de 2026.

## Enlaces
- Hugging Face: https://huggingface.co/YiqiLi/KlaBenchmark
- Repositorio de GitHub con el codigo de entrenamiento y prediccion: mencionado en la model card como "KlaBenchmark GitHub repository", sin URL explicita en la informacion proporcionada.
- KlaAtlas: mencionado como origen de los sitios del benchmark, sin URL explicita en la informacion proporcionada.
