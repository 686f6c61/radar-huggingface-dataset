# terion-mlx/GLM-4.5-Air-mixed_4_6

# GLM-4.5-Air-mixed_4_6 (MLX, terion-mlx)

## Resumen

GLM-4.5-Air-mixed_4_6 es una cuantizacion en formato MLX del modelo zai-org/GLM-4.5-Air, publicada por el usuario terion-mlx. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una conversion directa de los pesos originales mediante `mlx_lm.convert` con el predicado `mixed_4_6`, que aplica precision mixta de 4 y 6 bits segun la capa. El autor declara explicitamente que no se realizo ningun fine-tuning.

El artefacto ocupa aproximadamente 60 GB y promedia 4,809 bits por peso, una cifra por encima de los 4 bits nominales de las cuantizaciones uniformes, lo que indica que ciertas capas se conservan a 6 bits. La model card menciona ademas un envoltorio que limpia periodicamente la cache de Metal durante el guardado, para evitar fallos por presion de memoria unificada en Apple Silicon.

El modelo base, GLM-4.5-Air, es un transformer con mezcla de expertos de Zhipu AI (zai-org). El interes de esta publicacion es limitado y de nicho: es un artefacto de comunidad pensado para ejecucion local en hardware de Apple, no un lanzamiento oficial, y su utilidad depende en gran medida de las caracteristicas del modelo base, que se documentan en el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); heredada del modelo base zai-org/GLM-4.5-Air |
| Parametros totales | 106B (dato del modelo base; no figura en la model card de esta cuantizacion) |
| Parametros activos | 12B (dato del modelo base; no figura en la model card de esta cuantizacion) |
| Longitud de contexto | 128K tokens (heredado del modelo base; no confirmado en la model card de la cuantizacion) |
| Tipos de cuantizacion | MLX de precision mixta 4/6 bits (predicado `mixed_4_6`); 4,809 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (compatible con mlx-lm y Rapid-MLX; no es safetensors estandar ni GGUF) |

## Arquitectura y entrenamiento

La model card describe el proceso con detalle suficiente para caracterizarlo: conversion de los pesos originales de zai-org/GLM-4.5-Air mediante `mlx_lm.convert` con el predicado de cuantizacion `mixed_4_6`, que asigna 4 o 6 bits por peso de forma no uniforme entre capas. No hay entrenamiento, ajuste fino, RLHF ni DPO en esta publicacion; el flujo es puramente de compresion de pesos. El autor anade un envoltorio que vacia la cache de Metal de forma periodica durante la escritura del modelo, una precaucion practica para maquinas con memoria unificada limitada.

No se especifica en la informacion disponible la arquitectura interna detallada del modelo base (numero de capas, dimension de atencion, configuracion exacta de expertos, tipo de atencion ni estrategia de decodificacion), ni los datos de entrenamiento (numero de tokens, composicion del corpus, fases de alineacion). Estos datos corresponden al repositorio del modelo base y no se reproducen aqui.

## Capacidades

Las capacidades efectivas son las del modelo base, ya que no se aplico ningun ajuste fino. La model card no enumera capacidades concretas, por lo que se indican como heredadas del modelo base y no verificadas en esta ficha:

- Generacion de texto y razonamiento en el modelo base de la familia GLM-4.5.
- Modo de razonamiento hibrido (pensamiento explicito y respuesta directa) segun la familia GLM-4.5.
- Generacion de codigo.
- Soporte de tool calling / function calling en la familia GLM-4.5.
- Flujos agenticos y razonamiento multi-paso en el modelo base.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: ejecucion de un modelo de gran tamano en un Mac Studio o MacBook Pro con memoria unificada amplia, sin depender de GPU dedicada ni de servicios en la nube.
- Asistente de escritorio con contexto largo: al heredar una ventana de contexto de 128K tokens del modelo base, permite resumir y consultar documentos extensos, contratos o bases de codigo dentro de una misma sesion.
- Generacion de codigo con privacidad estricta: el modelo puede usarse en entornos donde el codigo no puede salir de la maquina, aprovechando que es una cuantizacion ejecutable en local.
- Pipelines RAG sobre corpus grandes: la ventana de contexto del modelo base permite inyectar muchos fragmentos recuperados antes de generar la respuesta, reduciendo la dependencia de una capa de recuperacion muy precisa.
- Experimentacion academica sobre cuantizacion: el valor de 4,809 bits por peso y el uso de precision mixta 4/6 lo convierten en un objeto util para estudiar la asignacion de bits por capa y su impacto en la calidad.
- Comparacion de formatos y backends: permite contrastar el comportamiento de MLX frente a cuantizaciones GGUF o GPTQ/AWQ del mismo modelo base en tareas identicas.
- Agentes locales con tool calling: si el modelo base conserva esa capacidad, puede integrarse en flujos de automatizacion que invoquen herramientas sin exponer datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K ni otras) de esta cuantizacion, ni compara el impacto de la precision mixta 4/6 frente a los pesos originales. Cualquier cifra de rendimiento del modelo base debe consultarse en el repositorio zai-org/GLM-4.5-Air y no es extrapolable automaticamente a esta version cuantizada.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan aproximadamente 60 GB; hay que sumar el cache KV, que a contextos largos (128K tokens) puede anadir decenas de GB adicionales.
- Memoria recomendada: 96 GB de memoria unificada como minimo practico para pesos y contexto moderado; 128 GB o mas para trabajar comodamente con contextos largos. Un equipo de 64 GB queda muy justo y puede no soportar contextos extensos.
- GPU compatibles: al ser formato MLX, el destino natural son los chips de Apple Silicon (familias M2 Max/Ultra, M3 Ultra, M4 Max y posteriores). En Mac Studio con M2 Ultra (192 GB) o M3 Ultra (hasta 512 GB) el modelo cabe con margen amplio.
- GPU de Nvidia (A100, H100, RTX 4090): no es un formato nativo para CUDA; requeriria reconversion a otro formato antes de usarse.
- Cabe en GPU de consumo: en el ecosistema Apple, si en configuraciones con 96 GB o mas de memoria unificada. En GPU de consumo Nvidia no es directamente desplegable en este formato.
- Opciones de despliegue: mlx-lm y Rapid-MLX son los backends indicados por el autor. vLLM, llama.cpp, Ollama o TGI no soportan pesos MLX de forma nativa sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.5-Air-mixed_4_6 (este) | 106B totales / 12B activos (base) | 128K (base) | MLX mixto 4/6 bits, ~60 GB | MIT | Publico en HuggingFace |
| zai-org/GLM-4.5-Air (base) | 106B totales / 12B activos | 128K | Pesos originales | MIT | Publico en HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, GPTQ, AWQ) | 106B totales / 12B activos | 128K | GGUF / GPTQ / AWQ | Segun autor de la cuantizacion | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: al reducir a una media de 4,809 bits por peso no se conserva la fidelidad de los pesos originales; no hay evaluaciones publicadas que cuantifiquen esa degradacion.
- Sin ajuste fino: es una conversion directa, por lo que hereda tanto las capacidades como los defectos del modelo base.
- Dependencia del formato: los pesos MLX no son directamente utilizables en CUDA, vLLM, llama.cpp u Ollama sin una reconversion.
- Idioma: no se declaran idiomas soportados en la model card; la cobertura linguistica depende del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay informacion especifica sobre mitigaciones en esta publicacion.
- Sesgos: no disponible; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia: la cuantizacion se publica bajo MIT, pero conviene verificar los terminos del modelo base para uso comercial, ya que la ficha remite a ese repositorio.
- Adopcion y soporte: cero descargas y cero likes en el momento de la ficha, autor de comunidad y ausencia de mantenimiento declarado; no es un artefacto con garantias de soporte.
- Memoria: el consumo de memoria unificada es alto (~60 GB solo en pesos) y puede provocar presion de memoria grave en equipos ajustados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/terion-mlx/GLM-4.5-Air-mixed_4_6
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Rapid-MLX: no disponible como enlace directo en la informacion proporcionada (mencionado en la model card)
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con el modelo.
