# TSchachi/pii-token-classifier-de-en-code

## Resumen

El modelo `TSchachi/pii-token-classifier-de-en-code` es un clasificador de tokens especializado en la deteccion de datos personales (PII) en textos que combinan prosa con codigo fuente, logs y documentacion tecnica. Se trata de un ajuste fino del modelo `bardsai/eu-pii-anonimization-multilang`, que a su vez se basa en la arquitectura XLM-RoBERTa. El autor es TSchachi y el modelo se publica bajo licencia Apache-2.0.

El problema que resuelve es concreto: los modelos de deteccion de PII entrenados con texto natural tienden a marcar falsos positivos en contextos tecnicos, etiquetando nombres de herramientas, identificadores de variables o fechas de compilacion como datos personales. Este ajuste reduce ese ruido manteniendo una tasa de deteccion de nombres similar a la del modelo base.

Con 277.506.117 parametros y un contexto maximo de 512 tokens, el modelo esta pensado como una capa dentro de pipelines de anonimizacion o cumplimiento normativo (RGPD) en entornos de desarrollo de software. Su relevancia actual radica en la creciente necesidad de filtrar PII en repositorios de codigo, documentacion interna y logs antes de compartirlos con herramientas de terceros o modelos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 277.506.117 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en (el modelo base lista 24 idiomas, pero el ajuste solo se evaluo en aleman e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la red, el tokenizador y la lista de etiquetas del modelo base `bardsai/eu-pii-anonimization-multilang`, un encoder XLM-RoBERTa con 12 capas. Solo se ajustaron los pesos: se congelaron los embeddings y las 6 capas inferiores del encoder, mientras que las 6 capas superiores y la capa de clasificacion se entrenaron durante dos pasadas sobre aproximadamente 10.800 ejemplos cortos, con una tasa de aprendizaje de 2e-5, tamano de lote 16 y un maximo de 320 tokens por ejemplo.

Los datos de entrenamiento no contienen datos personales reales e incluyen tres componentes: descripciones y codigo fuente de paquetes Python de codigo abierto (aproximadamente 1,6 MB) etiquetados con las predicciones del modelo base corregidas por un segundo detector (`urchade/gliner_multi_pii-v1`); 1.200 nombres inventados en aleman e ingles en frases sueltas y 3.200 insertados en medio de codigo o documentacion; y 8.000 frases en aleman del conjunto de entrenamiento de GermEval 2014 con etiquetas humanas. El ajuste se centro en las etiquetas `PERSON_NAME`, `LOCATION` y `DATE_OF_BIRTH`, dejando sin entrenar ni evaluar las otras 31 etiquetas del esquema BIO de 34 tipos.

## Capacidades

- Deteccion de entidades nombradas tipo PII en formato BIO con 34 tipos de etiqueta, entre ellos `PERSON_NAME`, `POSTAL_ADDRESS`, `LOCATION`, `DATE_OF_BIRTH`, `EMAIL_ADDRESS`, `PHONE_NUMBER` y `HEALTH_DATA`.
- Clasificacion de tokens (token classification) mediante `pipeline("token-classification")` de la libreria Transformers.
- Deteccion de nombres de personas en texto que mezcla prosa con codigo fuente, logs y documentacion tecnica, con reduccion de falsos positivos sobre identificadores y nombres de herramientas.
- Soporte de textos en aleman e ingles (unico par evaluado).
- Capacidad de procesar texto largo mediante ventanas deslizantes con solapamiento (el autor uso ventanas de 512 caracteres con 128 de solapamiento y umbral de puntuacion 0,6).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Anonimizacion de documentacion tecnica interna: el modelo puede procesar READMEs, wikis y guias de ingenieria para enmascarar nombres de personas reales antes de publicar el contenido o compartirlo con proveedores externos, gracias a su capacidad de distinguir nombres de personas de identificadores de codigo.
- Filtrado de PII en repositorios de codigo antes de su publicacion: integrado en un hook de pre-commit o en un pipeline de CI/CD, marca posibles nombres de autores o datos de contacto en comentarios y cadenas de texto, con una tasa de falsos positivos notablemente inferior a la del modelo base en codigo Python no visto.
- Limpieza de logs de aplicaciones: permite detectar nombres de usuarios en lineas de log que mezclan mensajes de texto con trazas tecnicas, reduciendo el ruido sobre nombres de funciones y variables.
- Cumplimiento del RGPD en pipelines de datos: como capa de preprocesamiento antes de enviar texto a modelos externos o almacenar datasets, marcando entidades personales para su redaccion.
- Procesamiento de notas clinicas en aleman: el modelo fue evaluado sobre el conjunto GraSCCo PII v2 y detecta nombres de pacientes y medicos en cartas clinicas sinteticas, lo que lo hace util en entornos sanitarios que requieren anonimizacion previa.
- Analisis de noticias y textos de Wikipedia en aleman: con resultados medidos sobre GermEval 2014, puede emplearse para anonimizar corpus periodisticos o academicos antes de su distribucion.
- Enmascaramiento en herramientas de atencion al cliente: para redactar nombres de clientes en transcripciones de chat o correos antes de almacenarlos o analizarlos.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con el modelo base sin ajustar y con `urchade/gliner_multi_pii-v1` (GLiNER) usando once etiquetas zero-shot. La medicion se hizo con ventanas de 512 caracteres, umbral de puntuacion 0,6, reglas de expresion regular para correos, telefonos, IBAN y fechas de nacimiento numericas, y un filtro de spans implausibles. La ejecucion fue en CPU (Apple Silicon, cuatro nucleos de rendimiento).

| Prueba | GLiNER | Base | Este modelo |
|---|---|---|---|
| Segundos por kB de texto | 0,22–0,25 | 0,09 | 0,08 |
| Memoria tras carga / pico en 151 escaneos | 2,1 / 4,0 GB | 1,2 / 1,8 GB | 1,2 / 1,8 GB |
| Cartas clinicas alemanas (GraSCCo PII v2): nombres de pacientes encontrados, de 166 | 158 | 161 | 159 |
| GraSCCo: nombres de medicos encontrados, de 154 | 128 | 141 | 143 |
| GraSCCo: spans de nombre sobre algo que no es persona | 116 | 42 | 38 |
| Noticias y Wikipedia alemanas (GermEval 2014 test, 5.100 frases): personas encontradas, de 1.639 | 1.493 | 1.547 | 1.543 |
| GermEval: spans de nombre sobre algo que no es persona | 353 | 172 | 137 |
| Nombres inventados en frase suelta, de 140 (80 aleman, 60 ingles) | 139 | 137 | 140 |
| Nombres inventados en medio de codigo, de 140 | 139 | 134 | 139 |
| Nombres de una palabra junto a puntuacion, de 20 | 20 | 19 | 19 |
| Codigo y docs de un proyecto de software no visto (490 kB): spans marcados | 62 | 145 | 58 |
| Codigo Python de codigo abierto no visto (238 kB): spans marcados | 35 | 60 | 19 |

Un span se considera encontrado si cualquier span detectado se solapa con el. En el codigo Python no visto, 13 de los 19 spans marcados por este modelo tienen la forma "Nombre Apellido", y ese texto contiene nombres reales de autores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB tras la carga y un pico de 1,8 GB en los escaneos medidos, en CPU. En GPU la huella es similar en carga, pero el autor reporta un crecimiento del asignador de memoria en MPS (Apple Silicon) de 1,8 GB a 9,7 GB tras 1.000 escaneos de textos de distinta longitud.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente por tamano del modelo; el autor no publica mediciones en GPU CUDA.
- Cabe en GPU consumer: si, dado el tamano de 277 millones de parametros.
- Opciones de despliegue: `pipeline` de Transformers, y por compatibilidad de arquitectura XLM-RoBERTa, tambien exportable a otros runtimes de inferencia (no verificado por el autor).
- Latencia y throughput: 0,08 segundos por kB de texto en CPU (Apple Silicon, cuatro nucleos de rendimiento). En GPU MPS, el autor indica que los resultados son identicos y los textos largos van aproximadamente 1,6 veces mas rapido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TSchachi/pii-token-classifier-de-en-code | 277,5 M | 512 tokens | Token classification supervisada, ajustada a codigo | Apache-2.0 | Hugging Face |
| bardsai/eu-pii-anonimization-multilang (base) | no disponible | no disponible | Token classification multilingue (24 idiomas) | Apache-2.0 | Hugging Face |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | Zero-shot NER con etiquetas configurables | no disponible | Hugging Face |

La comparativa de rendimiento entre estos tres modelos esta recogida en la tabla de benchmarks: este modelo reduce los falsos positivos sobre codigo no visto (19 spans frente a 60 del base y 35 de GLiNER en 238 kB de Python) y sobre GermEval (137 frente a 172 y 353), manteniendo una deteccion de personas similar en los conjuntos con etiquetas humanas.

## Limitaciones y advertencias

- Solo se evaluo para nombres de personas y unicamente en aleman e ingles. El modelo base lista 24 idiomas, pero el efecto del ajuste sobre los demas idiomas y sobre las etiquetas no objetivo no se midio.
- Los tests con nombres inventados fueron escritos por el mismo autor que las frases de entrenamiento, por lo que esas filas son optimistas; las filas de GraSCCo y GermEval no tienen ese sesgo.
- Sigue perdiendo nombres: en los dos conjuntos alemanes con etiquetas humanas falla en aproximadamente 4 a 7 de cada 100. Es una capa de una herramienta de privacidad, no una garantia.
- La entrada corta y sin contexto es dificil: una sola palabra capitalizada sin frase alrededor suele ser una adivinanza.
- Los telefonos, correos electronicos e IBAN se detectaron con expresiones regulares en las mediciones, no con el modelo.
- En GPU de Apple Silicon (MPS) el asignador de memoria crece de 1,8 GB a 9,7 GB tras 1.000 escaneos; en CPU la memoria no crece.
- Las mediciones de velocidad y memoria se hicieron en una sola maquina.
- Riesgo de alucinacion: como clasificador de tokens, puede producir spans plausibles pero incorrectos, especialmente en texto ambiguo o sin contexto suficiente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad para cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TSchachi/pii-token-classifier-de-en-code
- Modelo base: https://huggingface.co/bardsai/eu-pii-anonimization-multilang
- Segundo detector usado en el etiquetado: https://huggingface.co/urchade/gliner_multi_pii-v1
