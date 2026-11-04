# xOsama/muthakir-mt5-small-arcd

## Resumen

Muthakir (مُذاكِر) es un ajuste fino de `google/mt5-small` orientado a dos tareas de procesamiento de lenguaje natural en arabe: respuesta a preguntas extractiva (QA) y generacion de preguntas con su respuesta (QG) a partir de un parrafo. Lo desarrolla el usuario xOsama y se entrena sobre el corpus ARCD (`hsseinmz/arcd`), un conjunto de preguntas arabes sobre fragmentos de Wikipedia. El modelo resuelve el problema de generar material de estudio y autoevaluacion en arabe a partir de textos, un ambito donde los modelos multilingues genericos rinden de forma deficiente sin ajuste.

Arquitectonicamente es un transformer encoder-decoder de tipo T5 (variante multilingue mT5) con 300.176.768 parametros totales, es decir, la configuracion `small` de la familia mT5. El contexto de entrada esta limitado a 512 tokens, lo que restringe su uso a parrafos cortos o medianos.

Su relevancia es acotada pero concreta: demuestra que un modelo de menos de 300 millones de parametros, ajustado sobre apenas 1116 ejemplos de entrenamiento, puede pasar de una tasa de formato correcto del 0 % a un 100 % en generacion de preguntas, con un 82,61 % de respuestas generadas presentes en el parrafo fuente. Es una herramienta de borrador asistido para entornos educativos arabes, no un sistema de evaluacion automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, variante multilingue mT5) |
| Parametros totales | 300.176.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (los textos mas largos se truncan) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, probablemente compatibles con cuantizacion via herramientas externas) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/mt5-small`, un encoder-decoder de tipo T5 preentrenado de forma multilingue. El ajuste fino se realiza conjuntamente para dos tareas mediante prefijos de instruccion en el prompt: `أجب عن السؤال: {السؤال} السياق: {الفقرة}` para QA y `ولّد سؤالاً من النص: {الفقرة}` para generacion de pregunta y respuesta. Esta formulacion convierte ambas tareas en generacion condicionada de texto secuencia a secuencia.

Los datos provienen de `hsseinmz/arcd` (licencia MIT), con preguntas arabes sobre parrafos de Wikipedia. El split se hizo por parrafo con semilla 42: 1116 ejemplos de entrenamiento, 141 de validacion y 138 de test. La mejor configuracion registrada es `exp_A_lr5e-4`, con learning rate 0,0005, 10 epocas, batch size 8, optimizador Adafactor, precision FP32 y entrenamiento en una GPU Tesla T4. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el ajuste es supervisado clasico sobre pares pregunta-respuesta.

## Capacidades

- Respuesta a preguntas extractiva en arabe: dado un parrafo y una pregunta, genera la respuesta.
- Generacion de preguntas en arabe a partir de un texto, con formato correcto en el 100 % de los casos de test.
- Generacion de la respuesta asociada a la pregunta generada, presente en el parrafo fuente en el 82,61 % de los casos de test.
- Procesamiento de texto en arabe exclusivamente; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Autoevaluacion de estudiantes: a partir de un fragmento de apunte o de un articulo, el modelo genera preguntas de repaso con su respuesta, permitiendo al alumno comprobar si ha comprendido el texto sin intervencion del docente.
- Borrador de examenes para profesores: el docente introduce el material de la leccion y obtiene un conjunto inicial de preguntas que revisa y edita antes de incluirlas en una prueba, reduciendo el tiempo de preparacion.
- Generacion de flashcards: el par pregunta-respuesta generado se exporta directamente a una aplicacion de repeticion espaciada, aprovechando que el 82,61 % de las respuestas generadas aparecen literalmente en el texto fuente.
- Extraccion de informacion de articulos de Wikipedia en arabe: dado un parrafo y una pregunta concreta, el modelo devuelve la respuesta, util para construir indices de consulta sobre corpus enciclopedicos.
- Enriquecimiento de materiales didacticos digitales: integrado en una plataforma de contenidos, genera preguntas de comprension lectora para cada seccion de un temario de forma automatica y a bajo coste computacional.
- Prototipado rapido en entornos con recursos limitados: sus 300 millones de parametros permiten ejecutarlo en CPU o en GPU de gama baja, lo que lo hace viable para pruebas de concepto y despliegues educativos con presupuesto reducido.
- Generacion de cuestionarios de comprension lectora para bibliotecas escolares: procesando por lotes fragmentos de libros de texto, se obtienen bancos de preguntas que el personal docente filtra manualmente.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (138 preguntas), antes y despues del ajuste fino:

| Metrica | Antes del ajuste fino | Despues del ajuste fino |
|---|---|---|
| QA Exact Match (%) | 0,0 | 4,35 |
| QA F1 (%) | 0,56 | 18,95 |
| QG ROUGE-L (%) | 0,28 | 20,3 |
| QG formato correcto (%) | 0,0 | 100,0 |
| QG respuesta presente en el parrafo (%) | 0,0 | 82,61 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos, mas el overhead de activaciones y del runtime; en la practica, entre 2 y 3 GB.
- VRAM estimada en FP16/BF16: alrededor de 0,6 GB para pesos, con un total practico inferior a 2 GB.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos. Tambien es viable en CPU para inferencia por lotes pequenos.
- GPU de datacenter (A100, H100) innecesarias; el autor entreno en una Tesla T4, lo que confirma que el entrenamiento cabe en hardware modesto.
- Opciones de despliegue: `transformers` con PyTorch, `Text Generation Inference` (TGI), `vLLM` (soporte de modelos encoder-decoder limitado, verificar version) y conversion a GGUF para `llama.cpp` u `Ollama` mediante herramientas de conversion de T5.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera decodificacion de decenas de tokens por segundo en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| xOsama/muthakir-mt5-small-arcd | 300 M | 512 | Arabe | Apache 2.0 | QA y QG educativa en arabe |
| google/mt5-small (base) | 300 M | 512 | Multilingue | Apache 2.0 | Modelo generico sin ajuste a QA/QG arabe |
| google/mt5-base | 580 M | 512 | Multilingue | Apache 2.0 | Generico, mayor capacidad pero sin ajuste especifico |
| UBC-NLP/AraT5-base | 220 M (aprox.) | 512 | Arabe | Apache 2.0 | Modelo arabe preentrenado, requiere ajuste para QA/QG |

La comparacion directa de rendimiento con estas alternativas no esta disponible: el autor solo publica metricas antes y despues del ajuste sobre el mismo modelo base. Cualquier comparacion con AraT5 o mT5-base requeriria ejecutar los mismos benchmarks sobre el conjunto de test de ARCD.

## Limitaciones y advertencias

- Modelo pequeno entrenado con solo 1116 ejemplos: puede fallar, dar respuestas parciales o incorrectas con frecuencia. El QA F1 de 18,95 % en test es bajo en terminos absolutos.
- El Exact Match en QA es del 4,35 %, lo que indica que rara vez reproduce exactamente la respuesta de referencia; util para borradores, no para respuestas automaticas sin revision.
- Los datos de entrenamiento provienen de Wikipedia, por lo que el rendimiento puede degradarse sobre textos escolares, tecnicos o especializados.
- Contexto limitado a 512 tokens: los parrafos mas largos se truncan, con perdida de informacion relevante para la respuesta.
- Solo soporta arabe; no debe usarse con textos en otros idiomas.
- Puede reflejar sesgos presentes en Wikipedia en arabe.
- No debe emplearse de forma autonoma en examenes oficiales ni en evaluacion final de estudiantes sin revision humana explicita.
- No introducir datos personales o confidenciales en aplicaciones construidas sobre el modelo.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las condiciones del dataset ARCD (MIT) si se redistribuye.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni reportes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xOsama/muthakir-mt5-small-arcd
- Modelo base: https://huggingface.co/google/mt5-small
- Dataset ARCD: https://huggingface.co/datasets/hsseinmz/arcd
- Paper de mT5 (Xue et al., 2020): https://arxiv.org/abs/2010.11934
- Paper de T5 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683
