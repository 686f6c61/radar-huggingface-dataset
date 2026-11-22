# vinguyen0891/Vivy-R-Robotics-3B-GGUF

## Resumen
Vivy-R-Robotics-3B-GGUF es un modelo de la familia Vivy-V, publicado por el usuario vinguyen0891, orientado a robótica y control espacial/cinemático. Se presenta como un fine-tuning del modelo base Qwen/Qwen2.5-3B-Instruct, del que hereda la arquitectura transformer y el tokenizador, y se distribuye principalmente en formato GGUF cuantizado (Q4_K_M) junto con pesos en safetensors. El repositorio incluye además un fichero propietario cifrado (`.vcore`) que, según el autor, encapsula el "thinking core" y la topología de enrutamiento del modelo.

La relevancia del modelo es limitada y conviene tratarla con cautela: la model card mezcla afirmaciones de marketing ("optimized thinking core", "upgraded generation") con una política de publicación poco habitual que combina pesos abiertos bajo Apache-2.0 con una arquitectura interna cifrada. No se documentan datos de entrenamiento, composición del dataset, proceso de alineamiento ni resultados de benchmarks, por lo que la evaluación objetiva del modelo no es posible con la información disponible.

El tamaño real declarado en los safetensors es de 3.397.103.616 parámetros, mientras que la model card indica 3.085.938.688, una discrepancia que el autor no explica. El modelo está etiquetado únicamente para inglés y para el pipeline de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-3B-Instruct); el autor menciona un "thinking core" propietario cifrado no documentado |
| Parametros totales | 3.397.103.616 (safetensors); la model card declara 3.085.938.688 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de `llama-server` usa `-c 8192`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos completos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (pesos); arquitectura `.vcore` propietaria cifrada |
| Formato de pesos | GGUF v3 y safetensors; incluye `Modelfile` para Ollama |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3.000 millones de parámetros. No se especifica en la información disponible qué modificaciones estructurales se han aplicado sobre esa base, ni si se ha realizado un fine-tuning completo o mediante adaptadores (el `Modelfile` menciona "adapter tensors" sin detallar). El autor describe un "thinking core" optimizado con topología de enrutamiento, pero ese componente se distribuye cifrado en un fichero `.vcore` (formato `VCORE3`, esquema `VIVY_V_ARCH_ENC_V1`) y no es inspeccionable ni reproducible.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa o atención lineal. La model card tampoco documenta el proceso de destilación o adaptación al dominio robótico más allá de la etiqueta "Spatial & Kinematic Control Thinking Core". En consecuencia, la arquitectura efectiva del modelo es, en la práctica, la de Qwen2.5-3B-Instruct con pesos ajustados, y cualquier innovación adicional queda fuera del alcance de verificación.

## Capacidades
- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento de dominio específico declarado para control espacial y cinemático en robótica (sin evidencia cuantitativa publicada).
- Instrucciones y formato conversacional (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue vía API compatible con OpenAI.
- Ejecución local mediante llama.cpp y Ollama gracias al formato GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" verificable.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso
- Prototipado de asistentes conversacionales en robótica: el modelo puede generar respuestas en lenguaje natural sobre tareas de manipulación o navegación, útil para interfaces de voz o chat con operadores, aunque sin garantías de precisión técnica.
- Despliegue en hardware de borde: al ser un modelo de ~3B parámetros en Q4_K_M, cabe en GPUs de consumo y en dispositivos con 4-8 GB de VRAM, lo que permite ejecutarlo en estaciones de trabajo de laboratorio o en un Jetson con suficiente memoria.
- Generación de pseudocódigo o secuencias de comandos para controladores robóticos: puede servir como borrador inicial en pipelines de experimentación, siempre con validación humana.
- Chatbot de documentación técnica interna: aprovechando la ventana de contexto de Qwen2.5, puede responder preguntas sobre manuales de robots o APIs de control.
- Evaluación comparativa de fine-tunings sobre Qwen2.5-3B: útil como caso de estudio de la familia Vivy-V para investigadores interesados en adaptaciones de dominio.
- Sustituto ligero en entornos sin conectividad: al ejecutarse con llama.cpp u Ollama de forma local, puede integrarse en sistemas aislados donde no se permite llamar a APIs externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,1 GB para el fichero Q4_K_M; en la práctica, entre 3 y 5 GB con overhead de contexto (estimación basada en el tamaño del repo y el número de parámetros, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues concurrentes; cualquier GPU con al menos 6 GB de VRAM debería poder ejecutar la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (mediante `Modelfile`), y potencialmente vLLM o TGI si se usan los pesos safetensors (no documentado por el autor).
- Latencia y throughput: no disponibles. El ejemplo de la model card usa `-c 8192`, pero no se aportan métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vivy-R-Robotics-3B-GGUF | ~3,4B (safetensors) | no disponible | Apache-2.0 (pesos) + `.vcore` cifrado | GGUF, safetensors | Fine-tuning de Qwen2.5-3B-Instruct para robótica; sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | ~3,1B | 32.768 tokens (según documentación pública de Qwen2.5) | Apache-2.0 | safetensors, GGUF | Modelo base; benchmarks públicos disponibles |
| Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar |
| Phi-3.5-mini-instruct | ~3,8B | 128.000 tokens (según documentación pública de Microsoft) | MIT | safetensors, GGUF | Alternativa generalista con contexto largo |

La comparación con Qwen2.5-3B-Instruct es la más directa, ya que Vivy-V se presenta como un fine-tuning del mismo. La diferencia principal es la especialización declarada en robótica y la presencia del componente cifrado, que impide auditar la arquitectura efectiva. Frente a Llama-3.2-3B y Phi-3.5-mini, el contexto declarado de Vivy-V no está documentado, lo que supone una desventaja para tareas de contexto largo.

## Limitaciones y advertencias
- Ausencia total de benchmarks, datos de entrenamiento y metodología: no es posible verificar las afirmaciones de rendimiento del autor.
- El componente `.vcore` cifrado impide auditar la arquitectura real y el "thinking core"; esto contradice el espíritu de los modelos open weights y dificulta la reproducibilidad.
- Discrepancia en el recuento de parámetros entre la model card (3.085.938.688) y los safetensors (3.397.103.616), sin explicación.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, especialmente en dominios técnicos como cinemática o control, donde los errores pueden tener consecuencias físicas.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-3B-Instruct hereda los sesgos de su dataset de entrenamiento, no auditados aquí.
- La licencia Apache-2.0 cubre los pesos, pero el uso del fichero `.vcore` propietario puede estar sujeto a restricciones adicionales no especificadas; conviene revisar antes de un uso comercial.
- El modelo está etiquetado como `robotics` pero no se aportan integraciones, APIs o ejemplos de control real; su uso en producción robótica requeriría validación externa exhaustiva.
- Historial de versiones confuso: la model card archiva versiones previas (v6.6–v7.4) y no queda claro el linaje exacto ni la relación con el repositorio actual.

## Enlaces
- Hugging Face: https://huggingface.co/vinguyen0891/Vivy-R-Robotics-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de Ollama: https://ollama.com
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
