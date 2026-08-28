# Urdatorn/sphragis-alm-olmo1b-sentence-sextus-empiricus

## Resumen

Este modelo es un *authorial language model* (ALM) especifico para el autor griego antiguo Sexto Empirico, desarrollado por Urdatorn (Albin Thorn Cleland) como parte del benchmark de atribucion de autoria Sphragis. Se trata de un ajuste fino completo (*further-pretraining*) del modelo base `allenai/OLMo-1B-hf` sobre las filas de entrenamiento de un unico autor, con el objetivo de medir la perplejidad de cada autor y atribuir sentencias al modelo que las encuentre menos sorprendentes. Forma parte de un conjunto de 28 modelos, uno por autor, disenados para el benchmark Sphragis de griego antiguo.

El modelo resuelve el problema de la atribucion de autoria en textos clasicos, un reto filologico complejo donde los metodos estadisticos tradicionales fallan por la escasez de datos y la variabilidad estilistica. Su relevancia radica en que aplica tecnicas modernas de *language modeling* a un dominio linguistico poco representado, y en que su entrenamiento se optimiza directamente sobre la metrica de atribucion (macro-F1) en lugar de sobre la perplejidad del propio autor, una innovacion metodologica frente a trabajos previos como el de Huang, Murakami y Grieve (2025).

Con 1.176.764.416 parametros (aproximadamente 1,17 mil millones), el modelo es compacto y esta pensado para ser usado en conjunto con los otros 27 modelos del benchmark, no como un generador de texto autonomo. Su licencia es `other` debido a las licencias mixtas de los textos de entrenamiento, que incluyen material CC BY-NC-SA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de OLMo-1B, transformer decoder-only) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf` (revision `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1,17 mil millones de parametros desarrollado por el Allen Institute for AI. Sobre esta base se realiza un *further-pretraining* completo, no un simple ajuste fino de capas superiores, utilizando exclusivamente las filas de entrenamiento de Sexto Empirico del benchmark Sphragis: 500 filas y 43.640 tokens puntuados de la division `sentence_1`.

El objetivo de entrenamiento es modelado de lenguaje causal sobre secuencias de una sola sentencia con delimitadores `<|endoftext|>`. Se emplearon 3 epocas con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 sentencias, y precision mixta con pesos maestros en fp32 y computo en bf16, utilizando FSDP con sharding completo sobre 2 GPUs GH200. La seleccion del modelo base y el numero de epocas se realizo mediante ascenso por coordenadas sobre la atribucion de validacion, optimizando la macro-F1 de atribucion del conjunto completo de 28 modelos, no la perplejidad individual del autor. Esta eleccion metodologica es clave: lo que importa para la atribucion no es como de bien se ajusta el modelo a su autor, sino cuanto mejor se ajusta a el en comparacion con los otros modelos.

## Capacidades

- Atribucion de autoria en griego antiguo: el modelo puntua sentencias calculando la log-verosimilitud negativa por token, y la sentencia se atribuye al modelo que la encuentra menos sorprendente.
- Modelado de lenguaje causal en griego antiguo: al estar entrenado exclusivamente en textos de Sexto Empirico, captura el estilo lexico, sintactico y metrico de este autor.
- Integracion en pipeline de atribucion: disenado para ser usado junto con los otros 27 modelos del benchmark Sphragis, no como modelo autonomo.
- Soporte de scoring por sentencia: la entrada esperada es una sentencia delimitada con tokens especiales, tal como se uso en entrenamiento.
- No soporta generacion de texto libre, tool calling, agentes ni capacidades multimodales; su unica funcion es la puntuacion de perplejidad para atribucion.

## Casos de uso

- Investigacion filologica sobre autoria clasica: el modelo permite verificar la autoria de textos dudosos atribuidos a Sexto Empirico, puntuando cada sentencia y comparando la perplejidad con los otros 27 modelos del conjunto.
- Autenticacion de fragmentos: en la edicion de textos antiguos, se puede usar para decidir si un fragmento pertenece a un autor concreto o es una interpolacion, basandose en la sorpresa estilistica del modelo.
- Estudio de variacion estilistica intra-autor: al entrenarse sobre un unico autor, el modelo puede revelar patrones de consistencia o cambio estilistico a lo largo de la obra, util para datacion relativa.
- Benchmarking de metodos de atribucion: sirve como componente reproducible en el benchmark Sphragis, permitiendo comparar tecnicas de atribucion basadas en perplejidad frente a otras aproximaciones.
- Ensenanza de procesamiento de lenguaje para lenguas clasicas: como caso de estudio de aplicacion de LLMs a dominios con pocos recursos, util en cursos de humanidades digitales.
- Extension a otros autores: la metodologia de entrenamiento (seleccion por validacion de atribucion) puede replicarse para crear modelos similares para otros autores griegos, aunque este modelo concreto solo cubre a Sexto Empirico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la informacion disponible. Sin embargo, la model card reporta el rendimiento del conjunto completo de 28 modelos en el benchmark Sphragis:

| Metrica | sentence_1 | sentence_5 | sentence_10 | sentence_50 |
|---|---|---|---|---|
| Test macro-F1 | 62.36 | 86.84 | 89.53 | 92.44 |

Estos valores corresponden al conjunto de modelos, no a este modelo en particular, y muestran que la atribucion mejora sustancialmente cuando se dispone de mas contexto (mas sentencias por documento). No hay datos de comparacion con otros sistemas de atribucion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 1,17 mil millones de parametros en bf16, el modelo ocupa aproximadamente 2,35 GB en memoria, por lo que cabria en GPUs consumer de 8 GB o mas, pero no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 2x GH200, pero para inferencia puntual de scoring bastaria con una GPU moderna de gama media.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano del modelo, pero no confirmado por el autor.
- Opciones de despliegue: al ser un modelo safetensors compatible con HuggingFace Transformers, puede cargarse con la libreria estandar. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (ALMs para atribucion de autoria en griego antiguo). El propio autor publica otros modelos del mismo conjunto, como `Urdatorn/sphragis-alm-olmo3-greek-7b-diodorus-siculus`, que usa una base mayor (OLMo-3 de 7B adaptado al griego) y un corpus de 1.000 sentencias, pero no hay datos de rendimiento comparativo entre ambos. La comparativa directa no esta disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` debido a que los textos de entrenamiento incluyen material CC BY-NC-SA. Esto impide su uso comercial sin verificacion previa de las licencias de las fuentes, como advierte el propio autor en la model card.
- Datos de entrenamiento limitados: solo 500 sentencias y 43.640 tokens de un unico autor, lo que limita la generalizacion a variaciones dialectales o estilisticas fuera del corpus de Sexto Empirico.
- Sesgo de autor: el modelo esta sesgado hacia el estilo especifico de Sexto Empirico; no es util para otros autores ni para tareas generativas.
- Riesgo de sobreajuste: al entrenarse sobre un corpus pequeno con 3 epocas, existe riesgo de memorizacion, aunque la seleccion por validacion de atribucion mitiga parcialmente este problema.
- Sin soporte para generacion: el modelo no esta disenado para producir texto, solo para puntuar sentencias; usarlo como generador daria resultados pobres.
- Dependencia del preprocesado: para obtener resultados correctos, las sentencias deben puntuarse exactamente como en entrenamiento (con delimitadores `<|endoftext|>`), lo que requiere seguir el codigo de scoring del repositorio asociado.
- Fecha de creacion futura: el modelo esta fechado en agosto de 2026, lo que sugiere que podria ser un artefacto experimental o una entrada de prueba; verificar su validez antes de usarlo en investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-sextus-empiricus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de codigo de entrenamiento y scoring: https://github.com/Urdatorn/sphragis_models
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn
- Paper de referencia (Huang, Murakami y Grieve, 2025): "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio de OLMo: https://github.com/allenai/OLMo
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
