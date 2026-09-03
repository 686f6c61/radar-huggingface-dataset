# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-fp16

## Resumen

El modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-fp16` es una variante cuantizada del modelo de lenguaje Qwen3.5 con arquitectura de mezcla de expertos (MoE), desarrollada por el usuario de HuggingFace `symrex`. Se trata de un modelo de 35 mil millones de parametros totales con aproximadamente 3 mil millones de parametros activos, lo que lo situa en la categoria de modelos MoE eficientes para inferencia. El nombre indica que ha pasado por procesos de afinacion especificos (Genesis, Hermes) y una variante "Uncensored", aunque no se dispone de documentacion oficial que detalle estos procesos.

La version aqui presentada ha sido cuantizada mediante la herramienta oQ (oMLX v0.6.4) con precision mixta a 6 bits con grupo de tamaño 64, y se distribuye en formato MLX safetensors. Esta cuantizacion reduce el tamaño del repositorio a 30.5 GB, lo que facilita su despliegue en hardware de consumo. La fecha de creacion es del 3 de septiembre de 2026, por lo que se trata de un modelo reciente, aunque carece de descargas, likes, licencia declarada e informacion sobre idiomas soportados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, mezcla de expertos) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | ~3 B (inferido del nombre "A3B"; no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta (oQ/oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura base es `qwen3_5_moe`, un modelo de mezcla de expertos de la familia Qwen. En un modelo MoE, solo una fraccion de los parametros totales se activa durante cada token procesado, lo que permite un rendimiento computacional equivalente a un modelo mucho menor (en este caso, aproximadamente 3 mil millones de parametros activos) manteniendo la capacidad de un modelo de 35 mil millones. Esta arquitectura es especialmente eficiente para inferencia en terminos de latencia y consumo de memoria.

El nombre del modelo sugiere que ha pasado por varios procesos de afinacion: "Genesis" y "Hermes" hacen referencia a recetas de entrenamiento conocidas en la comunidad open source, y "Uncensored" indica que se ha eliminado parte del alineamiento de seguridad estandar. Sin embargo, no se dispone de informacion oficial sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se utilizaron tecnicas como RLHF o DPO. La cuantizacion actual se realizo con la herramienta oQ de oMLX v0.6.4, que aplica cuantizacion de precision mixta, asignando diferentes niveles de precision a distintas partes del modelo para optimizar la relacion calidad-eficiencia.

## Capacidades

- Generacion de texto y continuacion de conversaciones multi-turno, como modelo base de la familia Qwen3.5.
- Razonamiento y comprension linguistica general derivada de la arquitectura Qwen, aunque las capacidades exactas no estan documentadas en esta version.
- Capacidades multilingues: no disponibles (la familia Qwen suele soportar multiples idiomas, pero no se confirma para esta variante).
- Soporte de tool calling y function calling: no disponible (depende del afinacion especifica, no documentada).
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Modo "uncensored": el nombre indica que se ha reducido el rechazo a peticiones sensibles, aunque el alcance exacto no esta documentado.
- Ejecucion en dispositivos Apple Silicon mediante el ecosistema MLX, lo que permite usar el modelo en Mac con aceleracion por hardware.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: al estar en formato MLX, el modelo puede ejecutarse de forma nativa en Mac con Metal, aprovechando la GPU integrada y la memoria unificada. Con 30.5 GB de pesos, un Mac con 64 GB de RAM unificada puede cargar el modelo completo.
- Prototipado rapido de aplicaciones de chat: gracias a la cuantizacion de 6 bits y la arquitectura MoE, el modelo ofrece una latencia razonable para entornos de desarrollo donde se necesita iterar sobre prompts y respuestas.
- Experimentacion con modelos "uncensored": investigadores que estudian el impacto del alineamiento de seguridad pueden utilizar esta variante para comparar comportamientos con versiones alineadas de Qwen3.5.
- Generacion de texto creativo sin restricciones: la variante "Uncensored" puede resultar util en proyectos de escritura creativa o generacion de contenido donde el modelo base rechazaria ciertas peticiones.
- Evaluacion de cuantizacion oQ: el modelo sirve como caso de estudio para evaluar la calidad de la cuantizacion de 6 bits con group size 64 aplicada a un MoE de 35B mediante oMLX.
- Desarrollo de agentes locales en entornos sin conexion: al poder ejecutarse localmente, permite construir asistentes o agentes que no dependen de APIs externas, siempre que se asuma la falta de documentacion sobre capacidades de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 30.5 GB. En formato MLX, la carga en memoria requiere aproximadamente 30-35 GB de RAM unificada, dependiendo del overhead del runtime.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 series) con al menos 64 GB de RAM unificada para cargar el modelo completo con margen para el contexto.
- En consumer GPU (NVIDIA/AMD): no es directamente compatible por el formato MLX. Seria necesario convertir los pesos a otro formato (GGUF, safetensors estandar) para usar con llama.cpp, vLLM u otras herramientas.
- Opciones de despliegue: MLX (nativo en Mac), conversion a GGUF para llama.cpp/Ollama (requiere trabajo adicional).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos oficiales de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con otros MoE cuantizados de tamaño similar:

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35,1 B | ~3 B | no disponible | no disponible | MLX safetensors |
| Qwen3-30B-A3B (base) | ~30 B | ~3 B | no disponible | Apache 2.0 (segun version) | variado |
| DeepSeek-V3 (MoE) | 671 B | 37 B | 128 K | MIT (modelo) | variado |

Nota: la comparativa se basa en arquitecturas similares conocidas, no en datos especificos de este modelo. Los valores de Qwen3-30B-A3B son orientativos y pueden no corresponder exactamente.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el modelo permite uso comercial, modificacion o redistribucion. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Informacion de entrenamiento no disponible: se desconoce la composicion del dataset, el proceso de afinacion y si se aplicaron tecnicas de alineamiento adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en areas especializadas.
- Sesgos desconocidos: al no disponer de documentacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos potenciales.
- Variante "Uncensored": el modelo puede generar contenido ofensivo, ilegal o peligroso sin las salvaguardas habituales. Se debe usar con precaucion y bajo responsabilidad del usuario.
- Falta de validacion: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad. Su calidad y comportamiento son desconocidos.
- Formato propietario: el formato MLX limita el despliegue a ecosistemas Apple. No es directamente utilizable en GPUs NVIDIA o AMD sin conversion.
- Contexto limitado desconocido: al no conocer la longitud de contexto, no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.

## Enlaces

- HuggingFace: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-fp16
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
