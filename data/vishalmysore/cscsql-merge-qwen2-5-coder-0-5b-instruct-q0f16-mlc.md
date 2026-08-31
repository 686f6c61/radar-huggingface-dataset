# VishalMysore/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC

## Resumen

Este repositorio contiene una conversión a formato MLC (MLC-LLM) de los pesos de `cycloneboy/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct`, un fine-tune del modelo Qwen2.5-Coder-0.5B-Instruct especializado en la generación de consultas SQL a partir de lenguaje natural (text-to-SQL). El modelo original fue desarrollado por Lei Sheng y Shuai-Shuai Xu y presentado en el artículo "SLM-SQL: An Exploration of Small Language Models for Text-to-SQL" (arXiv:2507.22478). La conversión a MLC, realizada por VishalMysore, permite ejecutar el modelo directamente en el navegador mediante WebGPU y la librería WebLLM, sin necesidad de servidor.

La relevancia de este modelo radica en su tamaño reducido (0.5B parámetros) combinado con una especialización en SQL, lo que lo hace adecuado para aplicaciones de bajo consumo, despliegue en el edge y ejecución en dispositivos con recursos limitados. La conversión se realizó en precisión fp16 (q0f16) sin cuantización de grupo, manteniendo fidelidad total a los pesos originales. El contexto se limita a 4096 tokens en esta versión MLC, aunque el modelo base soporta ventanas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (decoder-only transformer, 0.5B) |
| Parametros totales | 0.5B (494M, segun el modelo base Qwen2.5-Coder-0.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (override en la configuracion MLC; el modelo base soporta 32K) |
| Tipos de cuantizacion | q0f16 (fp16 sin cuantizacion de grupo) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-Coder soporta multiples idiomas, pero no se detalla en esta conversion) |
| Licencia | MIT (repositorio de conversion); el modelo base original se publica bajo CC-BY-NC-4.0 |
| Formato de pesos | MLC (shards binarios `params_shard_0.bin` a `params_shard_24.bin`, `mlc-chat-config.json`, `tensor-cache.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2 con 0.5B parámetros, entrenado originalmente por Alibaba como Qwen2.5-Coder-0.5B-Instruct. Sobre esta base, los autores de SLM-SQL realizaron un fine-tune específico para la tarea text-to-SQL, combinando datos de entrenamiento y técnicas de aprendizaje por refuerzo (el nombre "CscSQL-Merge" sugiere una fusión de checkpoints de CSC-SQL). El artículo arXiv:2507.22478 explora el rendimiento de modelos de lenguaje pequeños (SLM) en la generación de consultas SQL, demostrando que es posible obtener resultados competitivos con modelos de 0.5B en esta tarea concreta.

La conversión a MLC realizada en este repositorio no altera la arquitectura ni los pesos: se trata de un cast directo a fp16 (q0f16) del checkpoint original, sin reentrenamiento ni destilación. La elección de q0f16 en lugar de la cuantización habitual q4f16_1 se debe a un fallo conocido en la compilación de kernels de cuantización de grupo en las ruedas públicas de MLC (issue mlc-ai/mlc-llm#3283). El resultado es un modelo más fiel a los pesos originales, a costa de un mayor tamaño de descarga (~960 MB).

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural (text-to-SQL).
- Generación de texto conversacional, con instrucciones de tipo chat.
- Soporte de function calling (segun la ficha del modelo original en Antbase).
- Ejecucion en navegador via WebGPU/WebLLM, sin servidor dedicado.
- Inferencia local en dispositivos con GPU compatible con WebGPU y aproximadamente 1.6 GB de VRAM.
- Compatible con el ecosistema MLC-LLM para despliegue en otras plataformas (escritorio, movil, servidor).

## Casos de uso

- Asistente SQL en el navegador: el modelo puede integrarse en aplicaciones web para que usuarios no tecnicos formulen consultas en lenguaje natural y obtengan SQL generado, todo ejecutado localmente en el cliente gracias a WebGPU.
- Herramienta de consulta de bases de datos para analistas: integrado en un panel de administracion de datos, permite traducir preguntas en espanol o ingles a consultas SQL validas, reduciendo el tiempo de escritura manual.
- Benchmarking de modelos SQL: el repositorio `nl2sqlBenchMark` de VishalMysore utiliza este modelo como especialista SQL de referencia para comparar el rendimiento de distintos modelos en tareas de generacion de consultas.
- Aplicaciones edge sin conexion: al ejecutarse en el navegador, no requiere conexion a un servidor de inferencia, lo que permite su uso en entornos con conectividad limitada o requisitos de privacidad estrictos.
- Prototipado rapido de pipelines text-to-SQL: los desarrolladores pueden probar el modelo en un entorno web sin configurar infraestructura de GPU, gracias a la integracion con WebLLM.
- Educacion y formacion en SQL: el modelo puede servir como herramienta didactica para que estudiantes practiquen la redaccion de consultas, recibiendo sugerencias automaticas a partir de enunciados en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo SLM-SQL (arXiv:2507.22478) incluye evaluaciones del modelo original, pero no se proporcionan cifras concretas en la documentacion de este repositorio de conversion.

## Requisitos de hardware

- VRAM estimada: 1624 MB (segun el campo `vram_required_MB` de la configuracion WebLLM).
- GPU recomendada: cualquier GPU compatible con WebGPU (integrada o dedicada) con al menos 2 GB de VRAM disponible.
- Ejecucion en consumer GPU: si, incluyendo GPUs integradas de portatiles modernos, siempre que soporten WebGPU.
- Opciones de despliegue: WebLLM (navegador), MLC-LLM (escritorio, servidor, movil).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 0.5B en fp16, se espera una generacion rapida en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct (este repo, MLC) | 0.5B | 4096 (override) | Text-to-SQL | MIT (conversion) / CC-BY-NC-4.0 (base) | MLC |
| cycloneboy/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct (original) | 0.5B | 32K | Text-to-SQL | CC-BY-NC-4.0 | Safetensors |
| cycloneboy/CscSQL-Merge-Qwen2.5-Coder-7B-Instruct | 7B | 32K | Text-to-SQL | CC-BY-NC-4.0 | Safetensors |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0.5B | 32K | Codigo y chat | Apache 2.0 | Safetensors |

La comparativa muestra que este repositorio es una conversion a MLC del modelo de 0.5B, con contexto reducido a 4096 tokens. La version de 7B del mismo fine-tune ofrece mayor capacidad pero requiere mas recursos (15.2 GB de VRAM segun LLM Explorer). El modelo base sin fine-tune tiene licencia Apache 2.0, mientras que el fine-tune CscSQL se publica bajo CC-BY-NC-4.0, lo que restringe el uso comercial del modelo original.

## Limitaciones y advertencias

- El modelo es muy pequeno (0.5B) y puede generar consultas SQL incorrectas o incompletas en casos complejos; se recomienda validar siempre la salida.
- La ventana de contexto en esta conversion MLC esta limitada a 4096 tokens, muy por debajo de los 32K del modelo base; esquemas de bases de datos extensos pueden no caber en la entrada.
- La licencia del modelo base original es CC-BY-NC-4.0, que prohibe el uso comercial. Aunque el repositorio de conversion se publica bajo MIT, los pesos subyacentes derivan de un modelo con restricciones no comerciales; es necesario verificar la compatibilidad de licencias antes de usar en produccion.
- El modelo solo procesa texto; no soporta entrada multimodal.
- La ejecucion en navegador depende de la disponibilidad de WebGPU, que no esta soportada en todos los navegadores o dispositivos.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este modelo; al ser un fine-tune de un modelo pequeno, el riesgo de alucinacion en la generacion de SQL es relevante.
- La conversion q0f16 no aplica cuantizacion, por lo que el peso de descarga es mayor (~960 MB) en comparacion con alternativas cuantizadas a 4 bits.

## Enlaces

- Repositorio HuggingFace de la conversion MLC: https://huggingface.co/VishalMysore/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC
- Modelo base original: https://huggingface.co/cycloneboy/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct
- Modelo base Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Articulo SLM-SQL (arXiv): https://arxiv.org/abs/2507.22478
- Repositorio de codigo y pesos SLM-SQL: https://github.com/CycloneBoy/slm_sql
- Repositorio nl2sqlBenchMark (caso de uso): https://github.com/VishalMysore/nl2sqlBenchMark
- Guia de conversion reproducible: https://github.com/VishalMysore/nl2sqlBenchMark/blob/main/tools/convert-cscsql-to-mlc.md
- Issue de MLC sobre el fallo de cuantizacion q4f16_1: https://github.com/mlc-ai/mlc-llm/issues/3283
- Ficha del modelo en Antbase: https://antbase.ai/models/cscsql-merge-qwen2-5-coder-0-5b-instruct
- Ficha del modelo en FriendliAI: https://friendli.ai/models/cycloneboy/CscSQL-Merge-Qwen2.5-Coder-0.5B-Instruct
