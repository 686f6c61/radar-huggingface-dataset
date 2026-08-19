# StarsMakeGalaxy/text-to-sql-Q8

## Resumen

El modelo `StarsMakeGalaxy/text-to-sql-Q8` es un ajuste fino (fine-tune) del modelo Qwen3.5-4B, especializado en la generación de consultas SQL a partir de lenguaje natural. Ha sido desarrollado por el usuario StarsMakeGalaxy y distribuido en formato GGUF cuantizado a Q8_0, lo que permite su ejecución eficiente en hardware de consumo. El modelo se presenta como un vision-language-model según las etiquetas de HuggingFace, aunque la funcionalidad multimodal no está documentada en la model card.

El ajuste se realizó con la librería Unsloth, que acelera el entrenamiento, y se convirtió a GGUF con matriz de importancia (imatrix) para optimizar la cuantización. El dataset de entrenamiento, `enterprise-text2sql-curated-600`, contiene 600 ejemplos en inglés con formato ChatML y cadenas de razonamiento (chain-of-thought), orientado a escenarios empresariales. Con aproximadamente 4.300 millones de parámetros, este modelo ofrece una alternativa ligera para tareas de text-to-SQL en entornos con recursos limitados, aunque carece de benchmarks publicados y de una licencia explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformador multimodal, según etiquetas) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), F16 (proyector multimodal mmproj) |
| Idiomas soportados | No disponible (dataset de entrenamiento en inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q8_0), F16 (mmproj) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, un transformer multimodal que combina procesamiento de texto e imagen. El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels eficientes y reducción de memoria, logrando una velocidad de entrenamiento 2 veces superior a los métodos convencionales. El dataset utilizado, `enterprise-text2sql-curated-600`, contiene 600 ejemplos de pares texto-SQL en inglés, con formato ChatML y cadenas de razonamiento, lo que sugiere que el modelo fue entrenado para generar consultas SQL paso a paso.

La conversión a GGUF se realizó con cuantización Q8_0 y matriz de importancia (imatrix), técnica que mejora la calidad de la cuantización al ponderar los pesos según su relevancia. El archivo `Qwen3.5-4B.F16-mmproj.gguf` corresponde al proyector multimodal, necesario para procesar entradas de imagen si se utiliza la funcionalidad de visión. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los 600 ejemplos.

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural, especializado en escenarios empresariales.
- Soporte de cadenas de razonamiento (chain-of-thought) para descomponer problemas complejos de generación de SQL.
- Capacidad multimodal (visión) según las etiquetas, aunque no se documenta su uso en la model card.
- Formato conversacional, apto para integración en chatbots y asistentes.
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue en servicios de inferencia.
- Cuantización Q8_0 que permite ejecución en CPU y GPU de gama media.

## Casos de uso

- Asistente para desarrolladores de bases de datos: el modelo puede traducir requisitos funcionales en lenguaje natural a consultas SQL, reduciendo el tiempo de escritura manual. Su tamaño compacto permite ejecutarlo localmente en estaciones de trabajo.
- Generación de informes empresariales: integrado en herramientas de BI, permite a usuarios no técnicos formular preguntas como "ventas totales por región en el último trimestre" y obtener la consulta SQL correspondiente.
- Automatización de pipelines de datos: en entornos de CI/CD, el modelo puede generar consultas SQL para pruebas o validación de esquemas, gracias a su compatibilidad con endpoints y su formato GGUF.
- Chatbot de soporte para analistas de datos: al ser conversacional, puede mantener diálogos multi-turno para refinar consultas SQL, ayudando a usuarios con conocimientos limitados de SQL.
- Educación y formación: sirve como herramienta didáctica para estudiantes que aprenden SQL, mostrando cómo se traduce una pregunta natural a una consulta estructurada.
- Prototipado rápido de aplicaciones text-to-SQL: su pequeño tamaño y cuantización permiten desplegarlo en entornos de desarrollo sin necesidad de GPUs dedicadas, acelerando la validación de ideas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Tampoco se han encontrado comparaciones con otros modelos text-to-SQL en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: con cuantización Q8_0, los pesos ocupan aproximadamente 4,3 GB. Considerando overhead de inferencia, se recomienda al menos 6 GB de VRAM para ejecución en GPU.
- GPUs compatibles: tarjetas con 6-8 GB de VRAM como RTX 3060, RTX 4060, RTX 2070 o superiores. También puede ejecutarse en GPU de datacenter como A10 o T4.
- Ejecución en CPU: gracias al formato GGUF, es posible ejecutar el modelo en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), servidores compatibles con endpoints (vLLM, Ollama, TGI) según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la documentación. Se estima que en una RTX 4090 la generación de una consulta SQL típica (50-100 tokens) tomaría menos de 2 segundos, pero este dato no está confirmado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos text-to-SQL. El modelo se basa en Qwen3.5-4B, pero no se han publicado resultados que permitan contrastarlo con alternativas como CodeLlama-7B, SQLCoder o modelos propietarios. La ausencia de benchmarks y de especificaciones detalladas (contexto, licencia) limita cualquier comparación objetiva. Se recomienda consultar la documentación de Qwen3.5 para conocer las capacidades base del modelo original.

## Limitaciones y advertencias

- Dataset de entrenamiento reducido (600 ejemplos), lo que puede limitar la generalización a consultas SQL complejas o dominios no cubiertos.
- Idioma: el dataset está en inglés, por lo que el rendimiento en otros idiomas no está garantizado, aunque el modelo base Qwen3.5 podría soportar multilingüismo.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. El dataset asociado tiene licencia apache-2.0, pero esto no se extiende automáticamente al modelo.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento del modelo en tareas estándar de text-to-SQL.
- Riesgo de alucinación: como todo modelo generativo, puede producir consultas SQL sintácticamente válidas pero semánticamente incorrectas, especialmente con esquemas de bases de datos complejos.
- Funcionalidad multimodal no documentada: aunque se etiqueta como vision-language-model, no hay ejemplos ni instrucciones sobre cómo usar la entrada de imagen, lo que puede generar confusión.
- Fecha de creación futura (2026-08-18): el modelo fue subido con fecha posterior a la actual, lo que sugiere que podría ser un artefacto de prueba o un error en la metadata.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StarsMakeGalaxy/text-to-sql-Q8
- Dataset de entrenamiento: https://huggingface.co/datasets/StarsMakeGalaxy/enterprise-text2sql-curated-600
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
