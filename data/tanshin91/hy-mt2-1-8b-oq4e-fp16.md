# tanshin91/Hy-MT2-1.8B-oQ4e-fp16

## Resumen

Hy-MT2 es una familia de modelos de traduccion multilingue "fast-thinking" desarrollada por Tencent, disenada para escenarios reales complejos. Esta ficha cubre la version cuantizada `Hy-MT2-1.8B-oQ4e-fp16` publicada por el usuario tanshin91, que aplica cuantizacion mixta de precision 4-bit mediante la herramienta oQ (oMLX v0.6.3rc2) sobre el modelo base Hy-MT2-1.8B de Tencent.

El modelo base pertenece a la arquitectura `hunyuan_v1_dense` (transformer denso) y soporta traduccion entre 33 idiomas, ademas de seguir instrucciones de traduccion en multiples lenguas. La version cuantizada se distribuye en formato MLX safetensors, optimizado para ejecucion en Apple Silicon, con un tamano de repositorio de 1,1 GB. Es relevante porque ofrece un modelo de traduccion de calidad con huella de memoria reducida, apto para despliegue en dispositivos locales sin GPU dedicada.

La cuantizacion de 4 bits con grupo de tamano 64 y precision mixta fp16 reduce considerablemente los requisitos de VRAM respecto al modelo original, manteniendo la estructura densa de 1.8B parametros nominales. El repositorio contiene 291.149.440 tensores en fp16, correspondientes a las capas no cuantizadas (embeddings, norm, etc.), mientras que el grueso de los pesos reside en formato int4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.8B (nombre del modelo); 291.149.440 tensores fp16 en safetensors (pesos cuantizados en int4) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64, mixed-precision (oQ4e) |
| Idiomas soportados | 33 idiomas (segun paper Hy-MT2) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizacion oQ) |

## Arquitectura y entrenamiento

Hy-MT2-1.8B es un modelo transformer denso, clasificado internamente como `hunyuan_v1_dense`. A diferencia del hermano mayor 30B-A3B (que usa arquitectura MoE), esta variante de 1.8B activa todos sus parametros en cada paso de inferencia, lo que simplifica su despliegue y reduce la latencia. El modelo base fue entrenado por Tencent como parte de la familia Hy-MT2, disenada como "fast-thinking" para traduccion multilingue en escenarios reales, con soporte para 33 idiomas y capacidad de seguir instrucciones de traduccion en varias lenguas.

La version publicada en este repositorio aplica cuantizacion mixta de precision con oMLX v0.6.3rc2: los pesos se almacenan en 4 bits con grupo de 64, mientras que ciertos tensores criticos (embeddings, normalizaciones, etc.) se mantienen en fp16. Esta estrategia permite una reduccion significativa del tamano del modelo (1,1 GB en total) sin degradar excesivamente la calidad de traduccion. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Traduccion multilingue entre 33 idiomas, incluidos pares de lenguas de baja y alta disponibilidad de datos.
- Seguimiento de instrucciones de traduccion en multiples idiomas, incluyendo especificaciones de estilo, tono y registro.
- Traduccion "fast-thinking": disenada para generar respuestas rapidas, adecuada para aplicaciones interactivas.
- Soporte para traduccion explicativa y mixta (multilingue), segun lo descrito para la familia Hy-MT2 en el paper y el repo oficial.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se ha confirmado capacidad multimodal (vision, audio) en la informacion disponible.

## Casos de uso

- Traduccion automatica en aplicaciones de atencion al cliente: el modelo puede traducir conversaciones multi-turno entre agentes y usuarios en distintos idiomas, manteniendo coherencia contextual gracias a su capacidad de seguir instrucciones de traduccion.
- Localizacion de contenido web y documentacion tecnica: permite traducir articulos, manuales y guias a 33 idiomas, con la opcion de especificar el estilo de traduccion mediante instrucciones en lenguaje natural.
- Traduccion de subtitulos y transcripciones: dado su diseno "fast-thinking", puede procesar secuencias largas de texto con baja latencia, adecuado para subtitulado en tiempo real o postproduccion.
- Asistentes de traduccion para viajeros o entornos multilingue: al ser un modelo ligero (1.8B, 4-bit), puede desplegarse en portatiles Apple Silicon o dispositivos con recursos limitados para traduccion offline.
- Traduccion de contenidos de redes sociales y soporte al usuario en comunidades multilingue: su capacidad de seguir instrucciones permite adaptar el registro (formal, informal, tecnico) segun el contexto.
- Integracion en pipelines de preprocesamiento de datos para entrenamiento de modelos multilingue: puede servir como traductor de datos de entrenamiento para otros sistemas de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada en la informacion disponible. El paper de Hy-MT2 (arXiv:2605.22064) describe evaluaciones multidimensionales de la familia completa, pero no se incluyen los numeros concretos en los datos proporcionados. Para el modelo base Hy-MT2-1.8B se espera un rendimiento superior al de HY-MT1.5-1.8B (version anterior, campeona del WMT25), pero los valores exactos no estan disponibles en este contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para el modelo cuantizado en 4-bit (el repo completo ocupa 1,1 GB), mas overhead de contexto.
- GPU recomendadas: el formato MLX safetensors esta optimizado para Apple Silicon (M1/M2/M3/M4); puede ejecutarse en cualquier Mac con al menos 8 GB de RAM unificada.
- En GPU NVIDIA (CUDA) no se puede ejecutar directamente en formato MLX; requeriria conversion a GGUF o safetensors estandar.
- Opciones de despliegue: MLX (Apple Silicon), conversion a GGUF para llama.cpp/Ollama, o conversion a safetensors para vLLM/TGI.
- Latencia y throughput: no disponible para esta cuantizacion especifica; el modelo base de 1.8B denso en Apple Silicon deberia ofrecer latencias de decenas de milisegundos por token en chips M-series.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (base) | 1.8B denso | no disponible | 33 | no disponible | safetensors |
| Hy-MT2-1.8B-oQ4e-fp16 (este) | 1.8B (cuantizado 4-bit) | no disponible | 33 | no disponible | MLX safetensors |
| Hy-MT1.5-7B (anterior) | 7B denso | no disponible | 33 + 5 variantes dialectales | no disponible | safetensors |
| Hy-MT2-30B-A3B | 30B MoE (3B activos) | no disponible | 33 | no disponible | safetensors |

La comparativa se limita a modelos de la misma familia Hy-MT, ya que no hay informacion suficiente sobre modelos de traduccion comparables de otras organizaciones en los datos proporcionados. El modelo base Hy-MT2-1.8B supera al Hy-MT1.5-7B en rendimiento segun el paper, lo que indica que la cuantizacion de 4-bit mantiene una calidad competitiva con modelos mas grandes de la generacion anterior.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente; debe contactarse con Tencent para aclarar los terminos de uso antes de desplegarlo en produccion.
- La cuantizacion de 4 bits puede degradar ligeramente la calidad de traduccion en pares de idiomas poco frecuentes o en textos muy especializados, comparado con el modelo base en fp16.
- No se ha confirmado la longitud de contexto; podria no manejar documentos muy largos de una sola pasada.
- El formato MLX limita la ejecucion a Apple Silicon; para otros hardware se necesita conversion, que puede introducir perdidas adicionales.
- No se ha confirmado la capacidad de manejar traduccion explicativa o mixta en esta version cuantizada especifica, aunque el modelo base lo soporta.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido si el texto de entrada es ambiguo o esta fuera del dominio de entrenamiento.
- No se han publicado benchmarks especificos para esta cuantizacion, por lo que el rendimiento real en tareas concretas no esta verificado.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/tanshin91/Hy-MT2-1.8B-oQ4e-fp16
- Repositorio oficial Hy-MT2 (Tencent): https://github.com/Tencent-Hunyuan/Hy-MT2
- Paper arXiv (v1): https://arxiv.org/html/2605.22064v1
- Paper arXiv (v2): https://arxiv.org/html/2605.22064v2
- Coleccion Hy-MT2 en HuggingFace: https://huggingface.co/collections/tencent/hy-mt2
- Repositorio Hy-MT1.5 (version anterior): https://github.com/Tencent-Hunyuan/HY-MT
- Herramienta de cuantizacion oQ: https://github.com/jundot/omlx
