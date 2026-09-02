# tetracta/tetracta-znext-1b

## Resumen

Tetracta Z-Next 1B (v4.3) es un modelo de lenguaje autorregresivo decoder-only desarrollado por el laboratorio independiente Tetracta. Su característica principal es que no utiliza atención y no mantiene caché KV: la conversación se codifica en un estado de sesión de tamaño fijo (5,227 MiB) que no crece con la longitud del contexto. Con 947 millones de parámetros y un presupuesto de pre-entrenamiento de 10 000 millones de tokens, el modelo se posiciona como una propuesta de investigación para la familia de arquitecturas recurrentes o de espacio de estado, aunque su mecanismo interno no está divulgado.

La relevancia actual del modelo radica en que publica mediciones comparativas con un transformer gemelo entrenado con los mismos datos, tokenizador y presupuesto, algo poco habitual en la literatura. Además, documenta un comportamiento diferencial frente al instruction tuning: mientras que su arquitectura mejora (+0,51 puntos porcentuales), el transformer gemelo empeora (−1,39). No obstante, los pesos no están publicados; solo se ofrece una demo en vivo y una ficha técnica con benchmarks y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, attention-free, sin KV cache, estado de sesión fijo |
| Parametros totales | 947 153 897 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el estado de sesión es fijo (5,227 MiB) e independiente de la longitud |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | Inglés |
| Licencia | Tetracta Evaluation Only (licencia personalizada, solo evaluación) |
| Formato de pesos | No disponible (repositorio sin pesos) |

## Arquitectura y entrenamiento

Z-Next es un modelo autorregresivo que prescinde por completo de la atención. En lugar de releer un historial creciente, mantiene un estado recurrente acotado que se actualiza con cada token. Este diseño lo emparenta con la familia de modelos de espacio de estado (Mamba, RWKV), aunque Tetracta afirma que el mecanismo interno difiere de los publicados y no lo revela. El estado de sesión ocupa 5,227 MiB y no crece con el contexto, lo que implica un uso de memoria constante durante la inferencia.

El pre-entrenamiento se realizó sobre 10 000 millones de tokens en inglés, combinando FineWeb-Edu y Wikipedia en inglés. El entrenamiento duró 29,97 horas en un nodo con 4 GPU H200, alcanzando un throughput agregado de aproximadamente 92 700 tokens por segundo, estable durante toda la ejecución. No se aplicó RLHF ni ajuste de seguridad; únicamente se probó una receta de instruction tuning sobre tres arquitecturas (Z-Next, la generación anterior y un transformer gemelo), observando efectos opuestos en cada una. El modelo base, el instruction-tuned y dos versiones chat (una de ellas sin medir en benchmarks clásicos) son los checkpoints descritos.

## Capacidades

- Generación de texto en inglés con coherencia básica, apropiada para su escala (1B).
- Razonamiento y respuesta a instrucciones simples, aunque con alta propensión a la alucinación.
- Inferencia con memoria constante: el uso de VRAM no depende de la longitud del contexto, lo que permite conversaciones muy largas en hardware limitado.
- Robustez al instruction tuning medida: +0,51 puntos porcentuales frente al transformer gemelo que pierde −1,39.
- Sin soporte de tool calling, function calling, visión, audio ni capacidades multimodales.
- Sin soporte multilingüe: solo inglés, y todas las evaluaciones se realizaron en ese idioma.

## Casos de uso

- Investigación académica sobre arquitecturas attention-free: el modelo sirve como banco de pruebas para estudiar el comportamiento de modelos recurrentes de estado fijo a escala 1B, comparándolos con transformers en condiciones de presupuesto igualado.
- Evaluación de escalabilidad de memoria: al tener un estado de sesión fijo, es útil para medir el consumo de VRAM en inferencia de contexto largo sin crecimiento de caché, algo relevante para diseñar sistemas de chat en dispositivos con recursos limitados.
- Estudio de robustez al instruction tuning: los datos publicados sobre el efecto de una misma receta en tres arquitecturas permiten analizar cómo distintas familias de modelos reaccionan al ajuste por instrucciones.
- Prototipado de asistentes conversacionales con contexto muy largo en hardware de consumo: la demo en vivo permite probar conversaciones extensas sin degradación de memoria, aunque con calidad limitada.
- Docencia en cursos de arquitecturas de modelos de lenguaje: el modelo y su documentación sirven como ejemplo práctico de una alternativa a la atención, con mediciones reales de coste y comportamiento.
- Due diligence técnica para partners de investigación o comerciales: la ficha detallada y los benchmarks permiten evaluar la viabilidad de la arquitectura para proyectos específicos antes de un acuerdo de acceso a pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos reportados son:

- Puntuación macro del modelo base: 45,24, frente a 56,40 de `state-spaces/mamba-1.4b-hf` evaluado con el mismo harness. Tetracta advierte que esta comparación no es justa porque Mamba es un lanzamiento público con un presupuesto de entrenamiento mucho mayor.
- Efecto del instruction tuning (una receta, una ejecución por arquitectura): Z-Next +0,51 pp (IC 95% [+0,04, +0,98]), generación anterior −0,43 pp ([−0,89, +0,04]), transformer gemelo −1,39 pp ([−1,97, −0,79]).

No se dispone de tablas completas de rendimiento en tareas estándar.

## Requisitos de hardware

- Entrenamiento: 4 GPU H200 (nodo único), 29,97 horas para 10B tokens.
- Inferencia: la demo pública se ejecuta en una tarjeta de consumo no especificada, lo que sugiere que el modelo cabe en GPUs de gama media. El estado de sesión de 5,227 MiB implica que la memoria adicional por conversación es despreciable.
- VRAM estimada: no disponible oficialmente. Por tamaño (947M parámetros), en FP16 ocuparía aproximadamente 1,9 GB, y en int8 alrededor de 1 GB, pero al no publicarse pesos no se puede confirmar.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque los pesos no están liberados. El acceso se realiza mediante la demo en vivo o acuerdos directos con Tetracta.
- Latencia y throughput: no se publican datos de inferencia en tiempo real; el throughput de entrenamiento fue de ~92,7k tokens/s agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Tetracta Z-Next 1B | 947M | No especificado (estado fijo) | No | Tetracta Evaluation Only | No |
| Mamba 1.4B | 1,4B | Depende de implementación | No (SSM) | Apache 2.0 | Sí |
| RWKV (varios tamaños) | 0.1B–14B | Depende de versión | No (RNN) | Apache 2.0 | Sí |

No se ha realizado una comparación presupuestada contra Mamba o RWKV. La única medición disponible es la puntuación macro de Mamba 1.4B (56,40) frente a Z-Next (45,24), pero con presupuestos de entrenamiento muy distintos, por lo que no es concluyente.

## Limitaciones y advertencias

- Alucinación severa: el modelo, por su escala (1B) y presupuesto (10B tokens), genera contenido falso con frecuencia. No es adecuado para tareas que requieran veracidad.
- Sin ajuste de seguridad: no hay RLHF, ni filtrado de contenido más allá del implícito en el corpus de pre-entrenamiento.
- Solo inglés: el corpus y las evaluaciones son exclusivamente en inglés; el uso en otros idiomas está fuera de alcance.
- Pesos no publicados: el repositorio de HuggingFace no contiene pesos; solo documentación y benchmarks. El acceso a los pesos requiere un acuerdo directo con Tetracta.
- Licencia restrictiva: la licencia `tetracta-evaluation-only` limita el uso a evaluación, prohibiendo explícitamente el despliegue en producción.
- Sin garantías de rendimiento: los resultados de instruction tuning provienen de una sola ejecución sin repeticiones de semilla, por lo que su generalización es incierta.
- No apto para producción: el propio autor declara que el modelo no está pensado para despliegue real, ni para respuesta a preguntas factuales ni para usos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tetracta/tetracta-znext-1b
- Página de resultados y benchmarks: https://www.tetracta.ai/znext.html
- Demo en vivo: https://www.tetracta.ai/zchat
- Sitio web de Tetracta: https://www.tetracta.ai/
- Perfil de Tetracta en HuggingFace: https://huggingface.co/tetracta
