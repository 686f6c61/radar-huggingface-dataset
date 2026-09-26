# Takenoko12345678/Spark-X2.5-4B-Japanese-GGUF

## Resumen

Spark-X2.5-4B-Japanese-GGUF es la version cuantizada en formato GGUF del modelo Takenoko12345678/Spark-X2.5-4B-Japanese, un ajuste fino orientado al japones del modelo base XHToken/Spark-X2.5-4B. Se trata de una publicacion no oficial: el autor del GGUF, Takenoko12345678, no tiene relacion con XHToken ni con el equipo que desarrollo la serie Spark-X2.5. El modelo original pertenece a la serie compacta Spark-X2.5 (4B y 1.7B), publicada bajo licencia Apache 2.0 el 31 de agosto de 2026 y disenada para tareas generales de conversacion, redaccion, traduccion, razonamiento, codigo, uso de herramientas y flujos con agentes.

La relevancia de esta ficha concreta es practica: convierte un modelo de aproximadamente 4.000 millones de parametros a GGUF para que pueda ejecutarse en llama.cpp y en hardware de consumo, con dos niveles de cuantizacion publicados (Q8_0 de 4,4 GB y Q4_K_M de 2,6 GB). El proceso de conversion se realizo con el script convert_hf_to_gguf.py de llama.cpp (commit 7fe450e19, build 11146) y el autor verifica que la salida f16 produce las mismas respuestas que el modelo original en precision bf16.

Un detalle critico de uso: el ajuste japones se entreno sin modo de razonamiento, por lo que la model card exige enviar chat_template_kwargs con enable_thinking en false; de lo contrario el modelo arranca con un bloque de razonamiento interno. El modelo base, en cambio, es un modelo de pensamiento por defecto, lo que genera una diferencia de comportamiento entre el upstream y esta derivacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (atencion completa combinada con atencion de ventana deslizante), segun la descripcion publica de la serie Spark-X2.5 |
| Parametros totales | Aproximadamente 4.000 millones (inferido de la denominacion del modelo base Spark-X2.5-4B; la model card no desglosa el dato) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (4,4 GB) y Q4_K_M (2,6 GB) publicadas; f16 sin publicar (8,2 GB). Conversion reproducible con llama.cpp |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache 2.0 (hereda la licencia del modelo base y de los datos de entrenamiento) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura proviene del modelo base XHToken/Spark-X2.5-4B, descrito como un diseno hibrido que combina mecanismos de atencion completa con atencion de ventana deslizante, una eleccion orientada a reducir el coste computacional manteniendo la capacidad de manejar contexto extenso. No se especifica en la informacion proporcionada el numero exacto de capas, cabezas de atencion, dimension oculta ni la longitud de contexto nativa, por lo que esos datos quedan como no disponibles.

Respecto al entrenamiento, el GGUF deriva de un ajuste fino adicional sobre el modelo base para mejorar el rendimiento en japones; el autor remite al repositorio original para los detalles de entrenamiento, evaluacion y problemas conocidos. La model card indica explicitamente que el ajuste se realizo sin modo de pensamiento ("学習はすべて思考なしで行っています"), y que la conversion a f16 preserva el comportamiento del modelo en bf16: se verifico la coincidencia de respuestas en 60 preguntas con el modelo Spark-X2.5-4B original. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con foco en el ajuste japones.
- Redaccion, traduccion y tareas generales de lenguaje, segun la descripcion de la serie Spark-X2.5.
- Razonamiento y resolucion de problemas, aunque en esta derivacion japonesa el modo de pensamiento debe desactivarse.
- Generacion de codigo, dentro del conjunto de tareas que cubre la serie original.
- Soporte de tool calling / function calling: la plantilla incrustada en el GGUF mantiene el soporte del chat_template.jinja de origen.
- Flujos con agentes y razonamiento de varios pasos, segun las capacidades declaradas de la serie.
- Multilinguee limitado a japones e ingles.
- Modo de pensamiento disponible pero no recomendado en este ajuste: si no se desactiva, el modelo emite razonamiento dentro de etiquetas de tipo think antes de la respuesta final.

## Casos de uso

- Asistentes conversacionales en japones: el modelo puede gestionar dialogos multi-turno en japones nativo, con la ventaja de ejecutarse localmente en formato GGUF y sin dependencia de APIs externas.
- Atemdia al cliente automatizada: integrado mediante llama-server con una API compatible con OpenAI, permite desplegar un endpoint de chat en infraestructura propia para consultas en japones e ingles.
- Traduccion japones-ingles: el soporte bilingue declarado lo hace util para tareas de traduccion o post-edicion en entornos con recursos limitados.
- Generacion de codigo en pipelines de desarrollo: al conservar la plantilla de tool calling, puede integrarse en asistentes de programacion que consulten herramientas o ejecuten funciones.
- Procesamiento por lotes en local: la cuantizacion Q4_K_M de 2,6 GB permite ejecutar tareas de generacion masiva en una GPU de consumo o incluso en CPU.
- Prototipado e investigacion: al ser un modelo de 4B con licencia Apache 2.0, es adecuado para experimentar con tecnicas de ajuste fino, cuantizacion o evaluacion comparativa sin coste de licencia.
- Despliegue en el borde o en equipos sin GPU dedicada: el tamano reducido y el formato GGUF facilitan la inferencia en portatiles o servidores modestos.
- Filtrado o clasificacion de texto japones: uso como componente en pipelines de moderacion o etiquetado de contenido en japones.

## Benchmarks y rendimiento

La model card publica una evaluacion limitada a 30 preguntas de conocimiento general en japones e ingles, comparando las cuantizaciones con la version f16. Los valores se reproducen tal cual aparecen en la informacion proporcionada:

| Fichero | Tamano | Conocimiento general (japones / ingles) | Coincidencia con f16 |
|---|---:|---:|---:|
| f16 (no publicado) | 8,2 GB | 27 / 27 | referencia |
| Spark-X2.5-4B-Japanese-Q8_0.gguf | 4,4 GB | 27 / 27 | 53 / 60 |
| Spark-X2.5-4B-Japanese-Q4_K_M.gguf | 2,6 GB | 27 / 26 | 43 / 60 |

La columna de coincidencia mide el porcentaje de respuestas identicas a las del modelo f16 sobre un total de 60 preguntas. El autor no detalla el denominador exacto de la columna de conocimiento general ni publica resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. Para el modelo base Spark-X2.5-4B no se han proporcionado cifras numericas concretas mas alla de la afirmacion de resultados lideres entre modelos abiertos de su categoria.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, no publicados por el autor):
  - Q4_K_M: en torno a 4 GB de VRAM con contexto moderado.
  - Q8_0: en torno a 6 GB de VRAM.
  - f16: en torno a 10 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M o Q8_0, como RTX 3060, RTX 4060, RTX 4070. Para f16 o contextos largos conviene una RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPU de consumo; la cuantizacion Q4_K_M de 2,6 GB esta pensada para equipos modestos.
- Opciones de despliegue: llama.cpp y llama-server (el autor aporta el ejemplo de linea de comandos), asi como herramientas derivadas como Ollama. Requiere llama.cpp build 10828 o superior por el soporte de la estructura Spark-X2.5.
- Parametros de muestreo sugeridos en la model card: temperature 1.0, top_p 0.95, max_tokens 512.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Japanese-GGUF (esta ficha) | ~4B | no disponible | GGUF | Apache 2.0 | Ajuste japones no oficial, sin modo de pensamiento, cuantizaciones Q8_0 y Q4_K_M |
| XHToken/Spark-X2.5-4B (upstream) | ~4B | no disponible | safetensors (original) | Apache 2.0 | Modelo base oficial de la serie; modo de pensamiento activado por defecto; disponible tambien en Ollama |
| XHToken/Spark-X2.5-1.7B | ~1,7B | no disponible | safetensors | Apache 2.0 | Version mas pequena de la misma serie, orientada a menor consumo de recursos |
| stornic56/Spark-X2.5-4B-GGUF | ~4B | no disponible | GGUF | Apache 2.0 | Otra cuantizacion GGUF del mismo modelo base, mantiene el modo de pensamiento |
| soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf | ~4B | no disponible | GGUF | no disponible | Derivacion japonesa alternativa (variante Heretic) del mismo modelo base |

## Limitaciones y advertencias

- Derivacion no oficial: el autor del GGUF y del ajuste japones no esta afiliado a XHToken; no hay garantia de soporte ni de mantenimiento.
- Riesgo de alucinacion: es un modelo de 4B y la evaluacion publicada se limita a 30 preguntas; no hay validacion amplia de fiabilidad factual.
- Configuracion obligatoria del modo sin pensamiento: si no se envia chat_template_kwargs con enable_thinking en false, el modelo entra en modo de razonamiento y comienza con un bloque de tipo think, lo que degrada las respuestas para este ajuste.
- Requisito de version de llama.cpp: necesita build 10828 o superior por el soporte de la estructura Spark-X2.5; versiones anteriores fallaran.
- Idiomas limitados: solo japones e ingles; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada: no se especifica la ventana nativa ni el comportamiento del modelo con contextos largos, lo que dificulta dimensionar despliegues.
- Licencia heredada: la licencia Apache 2.0 se mantiene, pero esta supeditada a las condiciones del modelo base y de los datos de entrenamiento, cuyo detalle remite al repositorio original.
- Validacion comunitaria minima: el repositorio registra 0 descargas y 0 me gusta en el momento de elaborar esta ficha, por lo que no existe retroalimentacion de terceros.
- Caveat de produccion: sin resultados de benchmarks estandar ni pruebas de estres, se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese-GGUF
- Modelo base del ajuste japones: https://huggingface.co/Takenoko12345678/Spark-X2.5-4B-Japanese
- Modelo base original: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio GitHub de la serie: https://github.com/XHToken/Spark-X2.5
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B
- Cuantizacion GGUF alternativa: https://huggingface.co/stornic56/Spark-X2.5-4B-GGUF
- Derivacion japonesa alternativa: https://huggingface.co/soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf
- Ficha descriptiva de la serie: https://www.myaiexp.com/jp/items/models/spark-x2-5-4b
