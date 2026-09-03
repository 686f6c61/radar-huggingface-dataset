# xiaofangtang/nllb-200-1.3B-ct2-int8

## Resumen

Este repositorio contiene los pesos del modelo de traducción NLLB-200-1.3B de Meta convertidos al formato CTranslate2 con cuantización int8. No se trata de un modelo de lenguaje conversacional, sino de un modelo encoder-decoder especializado en traducción automática neuronal multilingüe. El autor, xiaofangtang, lo publica para ser utilizado como modelo de traducción «prioritario en calidad» dentro del asistente de escritorio «序灵 Matrix» (Xuling Matrix), un software propietario que integra este modelo para sus funciones de traducción.

La relevancia de este modelo radica en su formato optimizado: CTranslate2 es una librería de inferencia que permite ejecutar modelos transformer de forma eficiente en CPU y GPU, y la cuantización int8 reduce el uso de memoria y acelera la inferencia en comparación con los pesos originales en fp32. El modelo base, NLLB-200-1.3B, es una variante de 1300 millones de parámetros del modelo NLLB-200 de Meta, capaz de traducir entre 200 idiomas. Este repositorio concreto no incluye el modelo original, sino una conversión lista para usar con CTranslate2, con un tamaño de repositorio de 3,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200) |
| Parametros totales | 1.300 millones (1.3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | 200 idiomas (segun especificacion de NLLB-200) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (binarios propios de la libreria) |

## Arquitectura y entrenamiento

El modelo base NLLB-200-1.3B es un transformer encoder-decoder desarrollado por Meta AI como parte del proyecto No Language Left Behind. La variante de 1.3B es una version destilada del modelo original de 54B parametros, entrenada para mantener un rendimiento competitivo con un coste computacional mucho menor. El entrenamiento del modelo original se realizo sobre el dataset CCMatrix, un corpus paralelo multilingue que cubre 200 idiomas, y se aplicaron tecnicas de cuantizacion y destilacion para producir las variantes mas pequenas.

Este repositorio concreto no contiene informacion sobre el proceso de entrenamiento, ya que es una conversion de pesos ya entrenados. La conversion a CTranslate2 con cuantizacion int8 es un proceso post-entrenamiento que reduce la precision de los pesos de 32 bits a 8 bits, lo que disminuye el tamano del modelo y acelera la inferencia a costa de una pequena perdida de calidad. No se indica si se aplico alguna tecnica de calibracion especifica durante la cuantizacion.

## Capacidades

- Traduccion automatica entre 200 idiomas, incluyendo lenguas de bajos recursos.
- Inferencia eficiente en CPU y GPU gracias al formato CTranslate2 y la cuantizacion int8.
- Modelo encoder-decoder, no apto para generacion de texto libre ni conversacion.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal: solo procesa texto.
- No se especifican capacidades de thinking mode ni funciones especiales adicionales.

## Casos de uso

- Traduccion integrada en aplicaciones de escritorio: el modelo esta disenado para ser usado dentro del asistente «序灵 Matrix», donde actua como motor de traduccion de alta calidad. Su formato CTranslate2 permite cargarlo y ejecutarlo localmente sin depender de servicios en la nube.
- Traduccion de documentos largos: con 200 idiomas soportados, puede traducir documentos tecnicos, legales o academicos entre pares de idiomas poco comunes, algo que los servicios comerciales suelen cubrir peor.
- Traduccion offline para entornos con restricciones de red: al ser un modelo local, funciona sin conexion a internet, lo que lo hace util en entornos corporativos con politicas de seguridad estrictas o en despliegues en regiones con conectividad limitada.
- Preprocesamiento de datos multilingues: puede usarse para normalizar o traducir grandes volumenes de texto en pipelines de datos, por ejemplo para crear datasets de entrenamiento o para tareas de mineria de texto multilingue.
- Traduccion en tiempo real en aplicaciones de chat: su tamano reducido (1.3B int8) permite ejecutarlo en hardware modesto, lo que lo hace viable para integrarlo en aplicaciones de mensajeria que necesiten traduccion instantanea.
- Evaluacion de calidad de traduccion: al ser un modelo de proposito general para 200 idiomas, puede servir como referencia o baseline en sistemas de evaluacion automatica de traducciones (por ejemplo, para medir la calidad de otros motores).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad (BLEU, chrF, etc.) ni comparaciones con otros modelos. Para referencia, el modelo original NLLB-200-1.3B reporta en su model card una puntuacion BLEU media de 21,2 en el conjunto de test FLORES-101, pero este dato no se confirma en este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int8 de 1.3B ocupa aproximadamente 1,3 GB en memoria. Con CTranslate2, la memoria total necesaria (incluyendo overhead) ronda los 2-3 GB, por lo que cabe en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien puede ejecutarse en CPU con un rendimiento aceptable gracias a CTranslate2.
- Compatibilidad con consumer GPU: si, es viable en GPUs de gama de entrada y media.
- Opciones de despliegue: CTranslate2 es la libreria nativa para este formato. Puede usarse con Python (ctranslate2) o con servidores de inferencia como CTranslate2 Server. No es compatible directamente con vLLM, llama.cpp u Ollama, que esperan otros formatos de pesos.
- Latencia y throughput: no se proporcionan datos concretos. Como referencia orientativa, un modelo 1.3B int8 en CTranslate2 puede traducir una frase corta en decenas de milisegundos en una GPU moderna, y en unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| xiaofangtang/nllb-200-1.3B-ct2-int8 | 1.3B | no disponible | CTranslate2 int8 | MIT | Traduccion |
| facebook/nllb-200-1.3B | 1.3B | no disponible | safetensors (fp32) | CC-BY-NC 4.0 | Traduccion |
| OpenNMT/nllb-200-distilled-1.3B-ct2-int8 | 1.3B | no disponible | CTranslate2 int8 | CC-BY-NC 4.0 | Traduccion |

La diferencia principal entre este modelo y el original de Meta es la licencia: el repositorio de xiaofangtang usa MIT, mientras que el original de Meta usa CC-BY-NC 4.0, que restringe el uso comercial. La version de OpenNMT es funcionalmente identica (misma arquitectura y cuantizacion) pero mantiene la licencia original. Este repositorio, por tanto, ofrece una ventaja legal para integracion en productos comerciales.

## Limitaciones y advertencias

- El modelo es exclusivamente para traduccion: no es un chatbot ni un modelo de generacion de texto general. Intentar usarlo para otros fines dara resultados pobres o errores.
- La cuantizacion int8 puede degradar ligeramente la calidad de traduccion en comparacion con los pesos originales en fp32, especialmente en idiomas de bajos recursos o con vocabulario muy especifico.
- No se proporciona informacion sobre sesgos o alucinaciones especificas de este modelo. Como cualquier modelo de traduccion, puede producir traducciones incorrectas o sesgadas en pares de idiomas poco representados en el entrenamiento.
- La licencia MIT permite uso comercial y modificacion, pero el modelo base NLLB-200 de Meta esta entrenado con datos que pueden tener restricciones de uso. El autor de este repositorio declara la licencia MIT, pero el usuario debe verificar que el uso previsto cumple con las condiciones del modelo original.
- No se incluye documentacion sobre el proceso de cuantizacion (calibracion, dataset de validacion, etc.), lo que dificulta evaluar la perdida de calidad respecto al modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o de uso muy especifico. No hay evidencia de mantenimiento activo ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xiaofangtang/nllb-200-1.3B-ct2-int8
- Model card del modelo original NLLB-200-1.3B (GitHub): https://github.com/bigdataai-lab/nllb-200-1.3B
- Version equivalente de OpenNMT: https://huggingface.co/OpenNMT/nllb-200-distilled-1.3B-ct2-int8
- Ficha del modelo en Model Database: http://www.modeldatabase.com/facebook/nllb-200-1.3B.html
