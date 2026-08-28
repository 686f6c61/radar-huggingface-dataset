# Tonybio/EnzymeHunter

## Resumen

EnzymeHunter es un modelo de aprendizaje profundo desarrollado por el grupo cgxbio (Tonybio) para la predicción fina de funciones enzimáticas. Su objetivo principal es distinguir entre enzimas y no enzimas, y asignar números de la Comisión de Enzimas (EC) con un nivel de granularidad que captura diferencias sutiles entre proteínas homólogas. El modelo integra información de secuencia y estructura mediante mapas de contacto, empleando una estrategia de aprendizaje contrastivo jerárquico que mejora el rendimiento en escenarios de baja homología y en clases enzimáticas poco representadas.

El modelo se distribuye como un paquete Python (`enzymehunter`) con interfaz de línea de comandos y API, y los pesos preentrenados se alojan en Hugging Face y Zenodo. El repositorio de Hugging Face tiene un tamaño de 21,2 GB, lo que sugiere que incluye los pesos completos del modelo y datos de referencia. Aunque la licencia no está especificada en la ficha de Hugging Face, el código fuente está disponible en GitHub, lo que facilita su uso en investigación y desarrollo. Su relevancia actual radica en la creciente necesidad de anotar funcionalmente las millones de proteínas sin caracterizar que surgen de los proyectos de secuenciación masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (framework de aprendizaje contrastivo jerárquico que integra ESM2 para mapas de contacto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa secuencias de proteinas, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agnostico al lenguaje, trabaja con secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 21,2 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

La arquitectura exacta de EnzymeHunter no se detalla en la informacion disponible. Segun la model card y el articulo publicado en *Patterns* (Cell Press), el modelo combina informacion de secuencia y estructura mediante mapas de contacto. Por defecto, utiliza mapas de contacto predichos por ESM2 (un modelo de lenguaje de proteinas de Meta), aunque tambien permite usar mapas de contacto derivados de estructuras PDB reales (por ejemplo, de AlphaFold o ESMFold). La estrategia central es un aprendizaje contrastivo jerarquico que organiza las clases enzimaticas segun la taxonomia EC (cuatro niveles), lo que permite capturar diferencias funcionales sutiles entre proteinas homologas.

No se proporcionan datos sobre el conjunto de entrenamiento (numero de secuencias, composicion, tokens) ni sobre el proceso de optimizacion (si hubo RLHF, DPO, etc.). El codigo fuente esta disponible en GitHub y fue desarrollado y probado en Linux (CentOS) con Python 3.9, lo que sugiere un entrenamiento con PyTorch u otro framework similar, aunque no se confirma.

## Capacidades

- Prediccion binaria de enzima vs. no enzima.
- Prediccion de numeros EC completos (hasta cuatro niveles de granularidad).
- Uso de mapas de contacto de ESM2 (por defecto) o de estructuras PDB (modo alternativo).
- Modo "todo-enzimas" para acelerar la prediccion cuando se sabe que todas las secuencias son enzimas.
- Interfaz de linea de comandos y API Python para integracion en pipelines.
- Plataforma web disponible en http://119.3.41.228:2006/ para predicciones interactivas.
- Capacidad de trabajar a escala de proteoma, segun se menciona en el articulo.
- Proporciona interpretabilidad sobre las predicciones, aunque no se detalla el mecanismo.

## Casos de uso

- Anotacion funcional de genomas: dado un conjunto de proteinas predichas a partir de un genoma, EnzymeHunter puede clasificarlas como enzimas o no y asignarles numeros EC, facilitando la caracterizacion de rutas metabolicas en organismos recien secuenciados.
- Descubrimiento de nuevas enzimas: al aplicar el modelo a proteomas completos, se pueden identificar proteinas con funciones enzimaticas no anotadas previamente, especialmente en clases EC poco representadas, como se destaca en el articulo.
- Validacion de predicciones estructurales: usando el modo PDB con estructuras de AlphaFold o ESMFold, los investigadores pueden comprobar si una proteina predicha como enzima tiene una estructura compatible con la funcion asignada.
- Curacion de bases de datos de enzimas: el modelo puede servir como herramienta de filtrado para revisar anotaciones existentes en bases de datos como UniProt o BRENDA, detectando posibles errores de asignacion de EC.
- Estudio de evolucion funcional: al comparar las predicciones de EnzymeHunter en familias de proteinas homologas, se pueden identificar cambios funcionales sutiles que no son evidentes solo por similitud de secuencia.
- Integracion en pipelines de biologia sintetica: para disenar rutas metabolicas, los investigadores pueden usar EnzymeHunter para verificar que las enzimas candidatas tienen la funcion EC esperada antes de proceder con experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo en *Patterns* menciona "rendimiento de ultima generacion" en escenarios de baja homologia y prediccion de clases raras, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) en los materiales consultados.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion disponible.
- El repositorio de Hugging Face tiene un tamano de 21,2 GB, lo que sugiere que los pesos del modelo son considerables. Para inferencia en GPU, se estima que se necesitaria al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) para cargar el modelo en precision completa, aunque podria caber en GPUs de 16 GB con cuantizacion (si estuviera disponible, pero no se menciona).
- El paquete PyPI permite seleccionar dispositivo (`auto`, `cpu`, `cuda:1`), lo que indica que puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el modelo se distribuye como paquete Python, por lo que puede integrarse en entornos con vLLM, TGI u otros frameworks de inferencia, pero no se documenta compatibilidad especifica.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros predictores de funciones enzimaticas (como DeepEC, ECPred, o CLEAN). La informacion disponible no incluye benchmarks comparativos publicados en los materiales consultados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La licencia no esta especificada en Hugging Face, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con los autores antes de utilizarlo en productos comerciales.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos biologicos, podria presentar sesgos hacia organismos o familias de proteinas sobrerrepresentadas en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo de aprendizaje profundo, puede asignar numeros EC incorrectos a secuencias muy divergentes o con baja homologia. El articulo menciona mejoras en estos escenarios, pero no elimina el riesgo.
- Limitaciones de contexto: el modelo trabaja con secuencias de proteinas, no con texto; no se especifica una longitud maxima de secuencia soportada.
- La plataforma web (http://119.3.41.228:2006/) puede no estar siempre disponible o tener limites de uso.
- El modelo depende de ESM2 para los mapas de contacto por defecto; si ESM2 no esta disponible o falla, el rendimiento puede degradarse.
- No se proporcionan instrucciones claras sobre como citar el modelo o el articulo en publicaciones, aunque el articulo en *Patterns* esta disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Tonybio/EnzymeHunter
- GitHub: https://github.com/cgxbio/EnzymeHunter
- Articulo en *Patterns* (Cell Press): https://www.cell.com/patterns/fulltext/S2666-3899(26)00076-0
- Articulo en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S2666389926000760
- Plataforma web: http://119.3.41.228:2006/
- Datos en Zenodo: https://zenodo.org/records/18598241
