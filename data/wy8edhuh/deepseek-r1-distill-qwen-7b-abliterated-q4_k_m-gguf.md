# wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q4_K_M-GGUF

## Resumen

El modelo `wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo `DuoNeural/DeepSeek-R1-Distill-Qwen-7B-Abliterated`, que a su vez es una versión "abliterada" (sin rechazos) del modelo de razonamiento `DeepSeek-R1-Distill-Qwen-7B` de DeepSeek. La abliteración elimina los mecanismos de rechazo del modelo original, de modo que responde a peticiones que normalmente serían bloqueadas por políticas de seguridad, manteniendo las capacidades de razonamiento y generación de texto del modelo base.

Este modelo está pensado para desarrolladores e investigadores que necesitan un LLM de razonamiento con 7.600 millones de parámetros, cuantizado a Q4_K_M para ejecución eficiente en hardware consumer, y que no aplique filtros de contenido. Al estar en formato GGUF, es compatible con llama.cpp, llama-server y otras herramientas del ecosistema, lo que facilita su despliegue local en CPU o GPU. Su relevancia actual radica en la combinación de razonamiento avanzado (heredado de DeepSeek-R1) con la ausencia de restricciones de contenido, algo poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen2.5, segun el modelo base DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (segun la documentacion de Xinference para DeepSeek-R1-Distill-Qwen) |
| Tipos de cuantizacion | Q4_K_M (unico archivo en este repositorio) |
| Idiomas soportados | Ingles (segun la model card; el modelo base tambien soporta chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo unico de 4,7 GB) |

## Arquitectura y entrenamiento

El modelo es una destilacion de DeepSeek-R1, un LLM de razonamiento con entrenamiento mediante aprendizaje por refuerzo (RL), sobre la arquitectura de Qwen2.5-7B. La version original de DeepSeek-R1-Distill-Qwen-7B fue creada por DeepSeek mediante destilacion de los patrones de razonamiento de DeepSeek-R1 en un modelo base de Qwen. El proceso de abliteracion aplicado por DuoNeural elimina las direcciones del espacio latente asociadas a los rechazos, de modo que el modelo deja de negarse a responder a ciertas peticiones. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso exacto de abliteracion en este repositorio, pero se sabe que el modelo resultante conserva las capacidades de razonamiento del original.

## Capacidades

- Generacion de texto con razonamiento paso a paso (chain-of-thought), heredado de DeepSeek-R1.
- Razonamiento logico y matematico avanzado, util para problemas complejos.
- Generacion de codigo en diversos lenguajes de programacion.
- Respuesta a preguntas de conocimiento general y tareas de comprension lectora.
- Capacidad de seguir instrucciones en formato conversacional multi-turno.
- Ausencia de rechazos (abliterated): responde a peticiones que el modelo original bloquearia, incluyendo contenido sensible o controvertido.
- Soporte de contexto largo (hasta 131.072 tokens), aunque la calidad puede degradarse en los extremos.
- No se ha confirmado soporte de tool calling ni function calling en esta version especifica.

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: permite estudiar el comportamiento de un LLM sin filtros de seguridad, analizando sesgos y riesgos de contenido generado.
- Generacion de contenido creativo sin restricciones: redaccion de ficcion, guiones o dialogos que requieran temas adultos o controvertidos, donde un modelo censurado limitaria la creatividad.
- Desarrollo de agentes conversacionales para entornos de simulacion o roleplay: el modelo puede mantener personajes sin limitaciones tematicas, gracias a su contexto largo y su capacidad de razonamiento.
- Analisis de codigo y generacion de scripts en entornos de desarrollo: su capacidad de razonamiento permite resolver problemas de programacion complejos, aunque la ausencia de filtros puede generar codigo inseguro si no se supervisa.
- Educacion y divulgacion sobre LLMs: como ejemplo de tecnicas de abliteracion y cuantizacion, util para talleres o cursos sobre modelos de lenguaje.
- Pruebas de estres de infraestructura de inferencia: al ser un GGUF de 4,7 GB, sirve para evaluar el rendimiento de llama.cpp o servidores locales en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DeepSeek-R1-Distill-Qwen-7B tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se dispone de datos especificos para esta version abliterada y cuantizada. Se recomienda consultar la ficha del modelo original para referencias de rendimiento.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa 4,7 GB, por lo que se necesita al menos 6 GB de VRAM para inferencia en GPU (considerando overhead de contexto y calculos).
- Puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o equivalentes de AMD con suficiente VRAM.
- En CPU, es viable con 16 GB de RAM y un procesador moderno, aunque la velocidad sera menor.
- Compatible con llama.cpp, llama-server, Ollama (si se importa el GGUF) y otros motores que soporten formato GGUF.
- Para contexto largo (131K tokens), se recomienda al menos 16 GB de VRAM o usar tecnicas de atencion con ventana deslizante.
- Latencia estimada: en una RTX 4090, entre 20 y 40 tokens por segundo con Q4_K_M; en CPU, entre 2 y 5 tokens por segundo, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Abliterado |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (original) | 7,6 B | 131K | MIT | safetensors | No |
| DuoNeural/DeepSeek-R1-Distill-Qwen-7B-Abliterated | 7,6 B | 131K | MIT | safetensors | Si |
| wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q4_K_M-GGUF (este) | 7,6 B | 131K | MIT | GGUF Q4_K_M | Si |
| ngxson/DeepSeek-R1-Distill-Qwen-7B-abliterated-GGUF | 7,6 B | 131K | MIT | GGUF (varias cuantizaciones) | Si |

La principal diferencia con el modelo original es la eliminacion de rechazos y la cuantizacion. Frente a otros GGUF abliterated, este repositorio ofrece una unica cuantizacion Q4_K_M, mientras que otros pueden incluir mas opciones. Todos comparten la misma base y licencia MIT.

## Limitaciones y advertencias

- Al estar abliterado, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es apto para aplicaciones de produccion sin supervision humana o filtros externos.
- La abliteracion puede degradar ligeramente la calidad del razonamiento en comparacion con el modelo original, aunque no se han medido diferencias concretas.
- El contexto de 131K tokens es teorico; en la practica, la atencion puede degradarse con secuencias muy largas, especialmente en cuantizacion Q4_K_M.
- Solo se ha confirmado el idioma ingles; el soporte de chino del modelo base podria no estar completo en esta version.
- La licencia MIT permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- No se garantiza la ausencia de alucinaciones; como cualquier LLM, puede inventar hechos o razonamientos incorrectos.
- El repositorio no incluye informacion sobre el proceso de abliteracion ni sobre el dataset utilizado, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q4_K_M-GGUF
- Modelo base (DuoNeural): https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-7B-Abliterated
- Modelo original DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Otro GGUF abliterated (ngxson): https://huggingface.co/ngxson/DeepSeek-R1-Distill-Qwen-7B-abliterated-GGUF
- Documentacion de Xinference sobre DeepSeek-R1-Distill-Qwen: https://inference.readthedocs.io/en/v1.4.1/models/builtin/llm/deepseek-r1-distill-qwen.html
