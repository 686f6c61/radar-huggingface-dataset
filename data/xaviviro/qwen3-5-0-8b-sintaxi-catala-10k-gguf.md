# xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k-GGUF

## Resumen

El modelo `xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k-GGUF` es una versión cuantizada a 4 bits (Q4_K_M) del modelo base `xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k`, un ajuste fino de Qwen3.5-0.8B especializado en el análisis sintáctico del catalán. Lo desarrolla Xavier Vinaixa Roselló (xaviviro) bajo el paraguas de Sorensen AI (Barcelona) y se distribuye con licencia Apache 2.0. El modelo recibe una única oración en catalán y devuelve directamente su análisis sintáctico en formato JSON, sin cadena de razonamiento intermedia.

La relevancia de esta ficha radica en su carácter de destilación especializada: en lugar de un modelo generalista, se ha entrenado (según indica el autor, mediante destilación) para una tarea concreta de lingüística computacional en una lengua de recursos limitados como el catalán. El resultado es un modelo de apenas 752 millones de parámetros que cabe en un único fichero de 535 MB y se ejecuta en local con llama.cpp o LM Studio en equipos de consumo.

Esta versión GGUF está pensada para despliegue local: la model card documenta una validación sobre 30 oraciones de referencia en la que el Q4_K_M produce salida JSON válida en el 100 % de los casos y un análisis idéntico al del modelo original en bf16 en el 100 % de los casos. Es importante subrayar que esa métrica mide la fidelidad de la cuantización respecto al original, no la corrección lingüística del análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); detalles de atención y capas no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero Q4_K_M de 535 MB); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parámetros. La información disponible no detalla el número de capas, la configuración de atención ni la longitud de contexto nativa; tampoco se especifican los hiperparámetros de entrenamiento ni la composición exacta del dataset. El nombre del modelo (`sintaxi-catala-10k`) sugiere un conjunto de datos de aproximadamente 10.000 ejemplos de análisis sintáctico en catalán, y el repositorio del autor (`destillacio-sintaxi-catala`) indica que el entrenamiento se basa en destilación, presumiblemente a partir de un modelo mayor que genera las anotaciones sintácticas de referencia.

La innovación técnica destacable no está en la arquitectura, sino en el diseño de la tarea y en la plantilla de chat: el modelo se ha entrenado para responder directamente con el JSON de análisis sintáctico y la plantilla incluida desactiva siempre el modo de razonamiento (*thinking*). Es decir, se fuerza una respuesta determinista y estructurada, sin tokens intermedios de deliberación, lo que reduce latencia y facilita el parseo en producción. La cuantización Q4_K_M conserva, según la validación del autor, la salida del modelo en bf16 sobre el conjunto de referencia de 30 oraciones.

## Capacidades

- Análisis sintáctico del catalán: recibe una oración y devuelve su estructura sintáctica en JSON.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`), aunque el uso previsto es la tarea de análisis.
- Salida estructurada en JSON de forma consistente (100 % de JSON válido en la validación del autor sobre 30 oraciones).
- Modo de razonamiento desactivado de forma permanente mediante la plantilla de chat, tal como se entrenó.
- Ejecución local en CPU/GPU mediante llama.cpp y LM Studio, con endpoint compatible con la API de chat.
- No consta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del catalán.

## Casos de uso

- Anotación sintáctica de corpus catalanes: procesar lotes de oraciones y almacenar el JSON resultante como capa de anotación en un corpus lingüístico, aprovechando la salida estructurada y la baja huella de memoria (535 MB).
- Enseñanza de gramática catalana: integrar el modelo en una herramienta educativa que muestre el análisis sintáctico de una oración introducida por el alumno, con latencia baja al ejecutarse en local.
- Preprocesado para pipelines de PLN: generar análisis sintácticos como característica de entrada para tareas posteriores (extracción de relaciones, resolución de correferencia) en sistemas que trabajan con catalán.
- Verificación de herramientas lingüísticas: usar el modelo como referencia rápida para comparar con analizadores basados en reglas o con salidas de modelos mayores durante el desarrollo.
- Despliegue en entornos sin conectividad: al ser un GGUF de 535 MB ejecutable con llama.cpp, puede correr en portátiles y equipos de campo sin acceso a la nube, útil para proyectos de documentación lingüística.
- Prototipado de asistentes de escritura en catalán: emplear el JSON de análisis para ofrecer correcciones o sugerencias gramaticales en un editor, con temperatura 0 para respuestas deterministas.
- Evaluación de técnicas de destilación y cuantización: servir como caso de estudio reproducible (código y notebook públicos) para medir la fidelidad de Q4_K_M frente a bf16 en una tarea estructurada.

## Benchmarks y rendimiento

La model card solo publica una validación de fidelidad de la cuantización frente al modelo original en bf16, sobre 30 oraciones de referencia y temperatura 0:

| Metrica | Resultado |
|---|---|
| Salida JSON valida | 100 % |
| Analisis identico al modelo bf16 | 100 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de calidad lingüística del análisis sintáctico en esta ficha; el autor remite a la ficha del modelo original para la calidad del análisis.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB con Q4_K_M (fichero de 535 MB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX/RTX antiguas), Apple Silicon y en CPU de portátiles modernos.
- Opciones de despliegue: llama.cpp (`llama-server -hf ... --jinja`), LM Studio (`lms get ...`), y cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y la desactivación del modo *thinking*, se espera latencia baja en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k-GGUF | 752 M | no disponible | Catalan | Apache 2.0 | GGUF Q4_K_M | Version cuantizada; validacion de fidelidad 100 % vs bf16 |
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k | 752 M | no disponible | Catalan | Apache 2.0 | no confirmado (presumiblemente safetensors) | Modelo original en bf16; referencia de calidad del analisis |
| Qwen3.5-0.8B (modelo base) | 752 M | no disponible | Multilingue | no disponible en esta ficha | no disponible | Modelo generalista sin especializacion sintactica en catalan |

No se dispone de datos de benchmarks comparativos con otras alternativas de análisis sintáctico del catalán en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo acepta una oración por consulta; no está diseñado para documentos largos ni conversaciones multi-turno complejas.
- El idioma soportado es únicamente el catalán; no se garantiza un comportamiento correcto en otras lenguas.
- La validación publicada mide la fidelidad de la cuantización (Q4 frente a bf16), no la corrección lingüística del análisis; no se han publicado métricas de precisión sintáctica en esta ficha.
- Riesgo de alucinación en oraciones ambiguas, con errores gramaticales o fuera de la distribución del conjunto de entrenamiento (10k ejemplos).
- El modo de razonamiento está desactivado por diseño; no debe esperarse capacidad de deliberación o explicación del análisis.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar la atribución al autor y revisar las condiciones del modelo base Qwen3.5-0.8B.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- No consta información sobre sesgos demográficos o culturales del modelo base; conviene evaluarlos antes de un despliegue en producción.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k-GGUF
- Modelo base en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k
- Repositorio GitHub con código, notebook y explicación: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
