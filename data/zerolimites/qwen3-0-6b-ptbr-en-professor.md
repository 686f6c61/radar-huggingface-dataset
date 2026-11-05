# zerolimites/Qwen3-0.6B-PTBR-EN-Professor

## Resumen

Qwen3-0.6B-PTBR-EN-Professor es un ajuste fino del modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario zerolimites, orientado a la ensenanza bilingue portugues de Brasil-ingles (PT-BR ⇄ EN). El modelo parte de la arquitectura transformer densa de Qwen3 en su variante mas pequena, con 751.632.384 parametros totales, y se distribuye bajo licencia Apache 2.0 tanto en formato safetensors como en GGUF.

La particularidad tecnica del modelo es el metodo de ajuste empleado: el autor describe una "cirugia directa de pesos en forma cerrada" basada en MEMIT con restriccion de subespacio nulo (Null-Space Constrained Trajectory MEMIT) y un pulido de margenes en la capa 27 (Layer-27 Margin Polishing). Se trata, por tanto, de una edicion de pesos sin entrenamiento convencional por gradiente, aplicada sobre el checkpoint original de Qwen3.

El modelo esta pensado para tareas de instruccion bilingue acotadas: diferencias gramaticales, falsos cognados, phrasal verbs y traduccion de expresiones idiomaticas entre portugues de Brasil e ingles. Su tamano reducido (menos de 1.000 millones de parametros) lo hace desplegable en hardware muy modesto, incluidos entornos de CPU y navegador mediante llama.cpp o espacios de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 (safetensors), F16 (GGUF), Q8_0 (GGUF 8 bits) |
| Idiomas soportados | pt (portugues de Brasil), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B. Segun la model card, no se realizo un entrenamiento convencional con descenso de gradiente sobre un corpus, sino una modificacion directa de los pesos en forma cerrada mediante una variante de MEMIT (Mass-Editing Memory in a Transformer) restringida a un subespacio nulo, complementada con un ajuste de margenes en la capa 27. Este enfoque busca inyectar conocimiento factual y de comportamiento (pares de traduccion, reglas gramaticales, falsos cognados) editando ubicaciones concretas de la red sin reentrenar el modelo completo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor tampoco detalla la configuracion exacta de MEMIT (capas editadas, numero de ediciones, hiperparametros del subespacio nulo) mas alla de la mencion a la capa 27. El repositorio incluye un fichero `ptbr_en_comparison_complete.json` con los resultados antes y despues en las 28 tareas del benchmark propio del autor.

## Capacidades

- Generacion de texto conversacional con plantilla de chat compatible con `transformers` (soporta el parametro `enable_thinking`).
- Instruccion bilingue PT-BR ⇄ EN: explicacion de diferencias gramaticales, traduccion de expresiones idiomaticas y aclaracion de falsos cognados.
- Ensenanza de phrasal verbs y vocabulario ingles con explicaciones en portugues.
- Respuesta a preguntas factuales y de uso linguistico dentro del dominio bilingue para el que fue editado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking: la plantilla de chat de Qwen3 lo expone, pero el ejemplo de la model card lo desactiva (`enable_thinking=False`); no se documenta su comportamiento con thinking activado.

## Casos de uso

- Asistente de aprendizaje de ingles para hablantes de portugues de Brasil: el modelo responde a preguntas sobre gramatica, phrasal verbs y falsos cognados, aprovechando las ediciones de pesos orientadas especificamente a ese dominio.
- Traduccion asistida PT-BR ⇄ EN de frases cortas y expresiones idiomaticas: util como corrector o apoyo en herramientas de traduccion para pares de frases concretas, no como motor de traduccion de documentos largos.
- Generacion de material didactico: ejercicios de vocabulario, ejemplos de uso y explicaciones de diferencias entre terminos como "actually" y "atualmente".
- Chatbot ligero en CPU o navegador: con la version Q8_0 (804 MB) puede ejecutarse en llama.cpp, Ollama, LM Studio, Jan o KoboldCpp en equipos sin GPU dedicada.
- Prototipado rapido de aplicaciones bilingues: al pesar menos de 1 GB en Q8_0, permite iterar en local con latencia baja antes de migrar a un modelo mayor.
- Demostraciones en Hugging Face Spaces: el autor indica compatibilidad con ejecucion directa en el navegador mediante los ficheros GGUF.
- Evaluacion de tecnicas de edicion de pesos (MEMIT): el repositorio sirve como caso de estudio reproducible de cirugia de pesos sobre un modelo pequeno, con resultados antes/despues documentados.

## Benchmarks y rendimiento

El autor publica un benchmark bilingue propio de 28 tareas (7 de falsos cognados EN⇄BR, 7 de gramatica BR→EN, 7 de traduccion e idioms BR→EN y 7 de phrasal verbs y ensenanza EN→BR). Los resultados declarados son:

| Modelo | Aciertos / Total | Precision general (%) | Falsos cognados | Gramatica (BR→EN) | Traduccion e idioms (BR→EN) | Phrasal verbs (EN→BR) |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | 0 / 28 | 0.00% | 0/7 (0.00%) | 0/7 (0.00%) | 0/7 (0.00%) | 0/7 (0.00%) |
| Qwen3-0.6B-PTBR-EN-Professor | 28 / 28 | 100.00% | 7/7 (100.00%) | 7/7 (100.00%) | 7/7 (100.00%) | 7/7 (100.00%) |

Advertencia: estos resultados proceden exclusivamente de la model card del autor. El benchmark es propio, consta de solo 28 tareas y no se ha verificado de forma independiente; el 0/28 del modelo base sugiere un criterio de correccion muy estricto o un formato de evaluacion especifico. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en bfloat16/F16 y unos 0,9 GB en Q8_0, sin contar overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien cabe en GPUs de datacenter como A100 o H100, aunque resultan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPUs con memoria compartida.
- Despliegue: `transformers` y `vLLM` para safetensors; `llama.cpp`, Ollama (incluye `Modelfile` en el repo), LM Studio, Jan y KoboldCpp para GGUF; ejecucion en navegador via Hugging Face Spaces.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera generacion en tiempo real en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-PTBR-EN-Professor | 751,6 M | no disponible | pt-BR, en | Apache 2.0 | safetensors, GGUF | Ajuste por edicion de pesos (MEMIT) sobre Qwen3-0.6B |
| Qwen/Qwen3-0.6B | 751,6 M (aprox.) | no disponible en la informacion proporcionada | multilingue | Apache 2.0 | safetensors, GGUF | Modelo base original; sin especializacion bilingue |
| Qwen3-1.7B | no disponible en la informacion proporcionada | no disponible | multilingue | Apache 2.0 | safetensors, GGUF | Variante mayor de la misma familia, mas capacidad general |
| Gemma 3 1B | no disponible en la informacion proporcionada | no disponible | multilingue | licencia Gemma | safetensors, GGUF | Alternativa de tamano similar de otro proveedor |

Los datos de las filas de Qwen3-1.7B y Gemma 3 1B no se han verificado en la informacion proporcionada y deben contrastarse en sus respectivas model cards. La comparativa relevante es contra el propio Qwen3-0.6B base: el modelo ajustado sacrifica generalidad potencial a cambio de un comportamiento muy especializado en el par PT-BR/EN.

## Limitaciones y advertencias

- El benchmark de 28 tareas es propio del autor, no verificado de forma independiente y de tamano muy reducido; el 100% de aciertos no debe extrapolarse a un rendimiento general.
- La edicion de pesos mediante MEMIT puede degradar capacidades generales del modelo base no evaluadas en el benchmark (razonamiento, codigo, matematicas, otros idiomas).
- Riesgo de alucinacion: al ser un modelo de 0,6 B de parametros, la generacion de hechos es poco fiable fuera del dominio linguistico editado.
- Cobertura limitada a portugues de Brasil e ingles; el resto de idiomas del Qwen3 original no esta garantizado.
- No hay informacion sobre la longitud de contexto efectiva tras la edicion de pesos.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el comportamiento en produccion antes de desplegarlo.
- No se documentan sesgos especificos ni procesos de alineacion de seguridad posteriores a la edicion de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zerolimites/Qwen3-0.6B-PTBR-EN-Professor
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Fichero de comparacion de resultados: `ptbr_en_comparison_complete.json` (incluido en el repositorio)
- `Modelfile` para Ollama: incluido en el repositorio
- Paper de MEMIT: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
