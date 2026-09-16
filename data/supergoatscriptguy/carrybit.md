# SuperGoatScriptGuy/carrybit

## Resumen

carrybit es un repositorio de checkpoints de investigacion publicado en Hugging Face por el usuario SuperGoatScriptGuy. No contiene un modelo de lenguaje generativo al uso, sino los pesos finales (state_dict de PyTorch) de una familia de transformers diminutos entrenados para aprender aritmetica entera exacta. El codigo, las configuraciones de entrenamiento y las graficas de resultados viven en el repositorio de GitHub del proyecto; el repositorio de Hugging Face solo aloja los checkpoints para poder reproducir los experimentos de analisis sin reentrenar.

El contenido se divide en dos bloques. Por un lado, modular_add: un transformer de una sola capa entrenado en la tarea a + b mod 113, siguiendo la configuracion de Nanda et al., con 40.000 pasos full-batch y grokking en torno al paso 2.000. Por otro, ladder: la escalera de generalizacion de longitud, con transformers decoder-only de 4 capas y anchura 256 (3,4 M de parametros) entrenados durante 50.000 pasos en sumas con operandos de 1 a 20 digitos, tres semillas por formato.

Su relevancia es exclusivamente investigadora: sirve como material reproducible para estudiar grokking, generalizacion de longitud y mecanicismo interno en redes pequenas. No es un modelo desplegable en produccion: no hay pipeline declarado, no hay tokenizador de lenguaje natural documentado, el repositorio acumula 0 descargas y 0 likes, y las etiquetas declaradas son arithmetic, length-generalization, grokking e interpretability.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 4 capas y anchura 256 (familia ladder); transformer de una sola capa para modular_add |
| Parametros totales | 3,4 M en los checkpoints de la familia ladder; no disponible para modular_add |
| Longitud de contexto | no disponible (los entrenamientos usan operandos de 1 a 20 digitos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos como state_dict de PyTorch) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje natural, la tarea es aritmetica simbolica |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (.pt); cada carpeta incluye su config.json exacto y metrics.csv |
| Autor | SuperGoatScriptGuy |
| Tarea | Suma de enteros exacta y suma modular (a + b mod 113) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 2026-09-01 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

Los checkpoints son state_dict planos de la clase `carrybit.model.Transformer`. La familia ladder usa transformers decoder-only de 4 capas y anchura 256, con 3,4 M de parametros, y la familia modular_add un transformer de una sola capa. El entrenamiento es full-batch: 40.000 pasos para modular_add (con grokking alrededor del paso 2.000) y 50.000 pasos para ladder. El conjunto de datos es sintetico y se genera a partir de sumas con operandos de 1 a 20 digitos; no se especifica en la informacion disponible el numero total de ejemplos ni si hubo fases de RLHF o DPO, algo que en cualquier caso no tendria sentido en esta tarea.

La innovacion tecnica del proyecto esta en las variantes de formato de entrada, que se comparan con tres semillas cada una: plain, reversed, reversed_zero_pad, abacus, position_coupling y aligned_blankspace. Varias de ellas (el acarreo explicito tipo abaco, el acoplamiento de posiciones y el alineado con espacios en blanco) buscan inducir generalizacion de longitud mas alla del rango de entrenamiento. Los resultados muestran que solo abacus_s2 y position_coupling_s0 mantienen exactitud apreciable por encima de los 20 digitos, y que la generalizacion se degrada de forma abrupta segun la semilla.

## Capacidades

- Suma de enteros exacta con operandos de 1 a 20 digitos, en el rango visto durante el entrenamiento; exactitud de coincidencia exacta entre 0,81 y 1,00 segun formato y semilla en operandos de exactamente 20 digitos.
- Suma modular a + b mod 113 en el checkpoint modular_add, con grokking en torno al paso 2.000.
- Generalizacion de longitud limitada y dependiente de la semilla: en operandos de 25 digitos, solo abacus_s2 (1,00) y position_coupling_s0 (1,00) y position_coupling_s1 (0,88) mantienen exactitud; el resto cae a 0.
- Comportamiento interpretable y analizable: los checkpoints se publican precisamente para ejecutar experimentos de interpretabilidad mecanicista sin reentrenar.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso general.
- No dispone de capacidades multilingues ni de generacion de texto libre.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar los state_dict y aplicar tecnicas de analisis de circuitos sobre transformadores pequenos, aprovechando que el proyecto los publica especificamente para no tener que reentrenar.
- Estudio de grokking: el checkpoint modular_add, con grokking en torno al paso 2.000 y 40.000 pasos full-batch, permite reproducir curvas de transicion y analizar el cambio de representacion interna antes y despues del fenomeno.
- Evaluacion de generalizacion de longitud: la escalera ladder (12 combinaciones de formato y semilla) permite comparar empiricamente que esquemas de codificacion posicional y de acarreo extrapolan mejor a operandos de 25, 30, 40 y 50 digitos.
- Diseno de esquemas de representacion para aritmetica: las variantes abacus, position_coupling y aligned_blankspace sirven como banco de pruebas para decidir como tokenizar y alinear digitos antes de escalar a modelos mayores.
- Reproducibilidad de resultados publicados: cada carpeta incluye el config.json exacto y el metrics.csv registrado, lo que permite replicar los experimentos y auditar las graficas del repositorio de GitHub.
- Docencia y divulgacion: por su tamano (3,4 M de parametros) y su entrenamiento full-batch, estos modelos se pueden entrenar y analizar en un portatil, lo que los hace utiles para explicar transformers y acarreo aritmetico en cursos.
- Linea base para comparativas internas: cualquier investigacion posterior sobre aritmetica exacta en redes pequenas puede usar estos checkpoints como referencia de partida, dado que cubren seis formatos de entrada y tres semillas.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico rendimiento reportado es la exactitud de coincidencia exacta en la tarea de suma de la familia ladder, medida sobre operandos de exactamente n digitos:

| Run | 20 digitos | 25 digitos | 30 digitos | 40 digitos | 50 digitos |
|---|---|---|---|---|---|
| plain_s0 | 0,93 | 0 | 0 | 0 | 0 |
| plain_s1 | 0,93 | 0 | 0 | 0 | 0 |
| plain_s2 | 0,81 | 0 | 0 | 0 | 0 |
| reversed_s0, s1, s2 | 1,00 | 0 | 0 | 0 | 0 |
| reversed_zero_pad_s0, s1, s2 | 1,00 | 0 | 0 | 0 | 0 |
| abacus_s0 | 1,00 | 0 | 0 | 0 | 0 |
| abacus_s1 | 1,00 | 0 | 0 | 0 | 0 |
| abacus_s2 | 1,00 | 1,00 | 0,93 | 0,75 | 0,25 |
| position_coupling_s0 | 1,00 | 1,00 | 0,92 | 0,11 | 0 |
| position_coupling_s1 | 1,00 | 0,88 | 0 | 0 | 0 |
| position_coupling_s2 | 1,00 | 0 | 0 | 0 | 0 |
| aligned_blankspace_s0, s1, s2 | 1,00 | 0 | 0 | 0 | 0 |

## Requisitos de hardware

- VRAM para inferencia: minima. Con 3,4 M de parametros, el estado en fp32 ocupa del orden de 14 MB, a lo que se suman activaciones y buffers de entrenamiento. No se han publicado mediciones oficiales de VRAM.
- GPU recomendadas: cualquier GPU sirve; el modelo no requiere acelerador dedicado y es viable en CPU sin optimizaciones especiales.
- GPU de consumo: si, cabe en cualquier GPU de consumo, incluidas integradas, dado el tamano del modelo. El repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: los pesos son state_dict de una clase propia (`carrybit.model.Transformer`), por lo que se cargan con PyTorch y el paquete `carrybit` (config y modelo) del repositorio de GitHub. No hay integracion declarada con vLLM, llama.cpp, Ollama ni TGI, y no se documenta tokenizador de Hugging Face, por lo que estas herramientas no son aplicables tal cual.
- Latencia y throughput: no publicados. Por el tamano del modelo el coste por inferencia es marginal, pero no hay cifras medidas en la informacion disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos directamente comparables. El propio autor situa modular_add en la configuracion de Nanda et al. para suma modular, que actua como referencia metodologica pero para el que no se aportan numeros en esta model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| carrybit (ladder) | 3,4 M | no disponible | Exactitud de 0,25 a 1,00 segun formato y longitud | MIT | Checkpoints en Hugging Face y codigo en GitHub |
| carrybit (modular_add) | no disponible | no disponible | Grokking alrededor del paso 2.000 | MIT | Checkpoint en Hugging Face y codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: no hay pipeline declarado, no hay tokenizador de lenguaje natural y la carga requiere el codigo del repositorio de GitHub, no basta con `transformers`.
- Generalizacion de longitud muy fragil: fuera del rango de entrenamiento (mas de 20 digitos), la mayoria de formatos cae a 0 y solo abacus_s2 y position_coupling_s0 ofrecen resultados parciales, con alta varianza entre semillas.
- Varianza entre semillas: con la misma configuracion, position_coupling pasa de 1,00 a 0 en 25 digitos segun la semilla, lo que desaconseja extrapolar conclusiones de un unico entrenamiento.
- Tarea unica: cada checkpoint resuelve una sola tarea aritmetica (suma o suma modular). No hay transferencia a otras operaciones demostrada en la informacion disponible.
- Riesgo de alucinacion: el modelo no genera lenguaje, pero puede producir digitos incorrectos sin señal de confianza asociada; no se documentan mecanismos de verificacion.
- Sesgos: no se documentan sesgos sociales, al no trabajar con datos humanos; si existe un sesgo de distribucion hacia operandos de 1 a 20 digitos y hacia el formato exacto de entrenamiento.
- Idiomas: no aplica; no hay capacidades multilingues.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el valor practico del modelo fuera de la investigacion es practicamente nulo.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni comunidad documentada, por lo que no hay soporte externo.
- Se desconoce el numero de ejemplos de entrenamiento, la composicion exacta del dataset y si hubo fases de ajuste adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/SuperGoatScriptGuy/carrybit
- Repositorio de codigo citado en la model card: https://github.com/Supergoatscriptguy/carrybit
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada. La busqueda web realizada devolvio unicamente resultados de Outlook (outlook.com/welearn365.com, outlook.com/owa/schools.nyc.gov, outlook.com/owa/towson.edu, outlook.com/newsletters, outlook.com/ktk.lt), sin relacion con el modelo.
