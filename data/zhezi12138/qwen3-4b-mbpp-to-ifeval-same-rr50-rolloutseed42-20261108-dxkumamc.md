# zhezi12138/Qwen3-4B-mbpp-to-ifeval-same-rr50-rolloutseed42-20261108-dxkumamc

## Resumen

Qwen3-4B-mbpp-to-ifeval-same-rr50-rolloutseed42-20261108-dxkumamc es un checkpoint de investigación publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un resultado intermedio de un experimento de aprendizaje continuo (continual learning) con refuerzo sobre el modelo base Qwen/Qwen3-4B. El experimento encadena dos tareas: primero una tarea de código (MBPP) y después una tarea de seguimiento de instrucciones (IF, presumiblemente IFEval), reutilizando los mismos bloques de cabezas de atención del 50 % que se entrenaron en la tarea de origen.

La relevancia del artefacto es metodológica más que de producto: sirve para estudiar cómo se comporta el ajuste fino con RL al reutilizar subconjuntos fijos de cabezas de atención entre tareas, un enfoque relacionado con la interpretabilidad y la edición selectiva de parámetros. El repositorio contiene el checkpoint distribuido original de Megatron (ocho shards `.distcp` por iteración), no un modelo compatible con `from_pretrained` de Transformers, y pesa 24,1 GB.

Se incluyen las iteraciones 199, 399 y 599 del entrenamiento, con el tracker seleccionando la 599 tras 600 actualizaciones de la fase IF. El estado del optimizador no se guardó, por lo que no permite reanudar el entrenamiento de forma exacta. La licencia declarada es Apache 2.0, heredada del modelo base Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), checkpoint distribuido Megatron |
| Parametros totales | 4 mil millones (heredados de Qwen/Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del base Qwen3-4B no se detalla aqui) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en formato `.distcp`, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint distribuido Megatron (`.distcp`, 8 shards por iteracion); no compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de 4 mil millones de parámetros. Sobre esa base se aplica un esquema de aprendizaje continuo con refuerzo (pipeline `reinforcement-learning`) que primero entrena una tarea de código (MBPP) y después una tarea de instrucciones (IF). La innovación clave del experimento es que la fase IF reutiliza exactamente los mismos bloques de cabezas de atención del 50 % entrenados en la tarea de origen, junto con sus bloques de proyección de salida correspondientes; el resto de bloques permanece congelado. Esto permite estudiar la transferencia y especialización de subconjuntos de cabezas entre dominios.

Los hiperparámetros documentados son: semilla 42, tasa de aprendizaje 3e-6, 16 prompts por 4 muestras, batch global de 64, límite de respuesta en rollout de 3072 tokens, plantilla de chat sin modo thinking, tensor parallel de 2 y gradientes congelados puestos a cero antes del clipping. Se realizaron 600 actualizaciones en la fase IF. La evaluación en entrenamiento usa un verificador de matemáticas (`math`, no `dapo_math`). El autor advierte explícitamente que las puntuaciones registradas no son resultados de benchmarks en held-out.

## Capacidades

- Generación de texto y razonamiento general, heredados del base Qwen3-4B.
- Generación de código, dado el entrenamiento previo sobre MBPP.
- Seguimiento de instrucciones (IF), objetivo de la segunda fase de entrenamiento.
- Razonamiento matemático evaluado con verificador `math` durante el entrenamiento.
- Plantilla de chat sin modo thinking (nonthinking chat template).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje continuo: reproducir o analizar el experimento de reutilización de cabezas de atención entre tareas de código e instrucciones, cargando el checkpoint en el entorno miles/Megatron Bridge con la configuración de Qwen3-4B.
- Estudio de interpretabilidad de cabezas de atención: comparar el comportamiento de las iteraciones 199, 399 y 599 para trazar cómo evoluciona el subconjunto fijo del 50 % de cabezas al pasar de MBPP a IF.
- Análisis de transferencia entre dominios: evaluar si el ajuste en código degrada o mejora el seguimiento de instrucciones, usando el protocolo de evaluación incluido en el repositorio.
- Reproducibilidad de experimentos RL: el `provenance.json` y `SHA256SUMS.json` permiten verificar la identidad inmutable del origen y los hashes del payload, útil en pipelines de auditoría científica.
- Base para ablaciones: servir como punto de partida para comparar contra las variantes `ifeval` y `random50` publicadas por el mismo autor.
- Docencia y formación: ilustrar en cursos de RL para LLM cómo se estructura un checkpoint distribuido de Megatron y qué metadatos de trazabilidad conviene registrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las puntuaciones registradas durante el entrenamiento no son resultados de benchmarks en held-out.

## Requisitos de hardware

- El checkpoint está en formato distribuido Megatron con 8 shards `.distcp` por iteración; requiere el entorno miles/Megatron Bridge para cargarse, no `from_pretrained`.
- VRAM estimada para inferencia: no disponible en la información proporcionada; a título orientativo, un modelo denso de 4 B en FP16 requiere del orden de 8 GB solo para pesos, pero este dato no lo aporta el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de la conversión del checkpoint a un formato estándar (no publicada).
- Opciones de despliegue: no disponible; el autor solo documenta el entorno miles/Megatron Bridge con tensor parallel 2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-4B mbpp-to-ifeval same-rr50) | 4 B | no disponible | Megatron `.distcp` | Apache 2.0 | Checkpoint de investigación, no listo para `from_pretrained` |
| Qwen/Qwen3-4B (base) | 4 B | no disponible en la informacion | Safetensors (Transformers) | Apache 2.0 | Modelo base original, listo para producción |
| zhezi12138/Qwen3-4B-mbpp-to-ifeval-ifeval-rr50-rolloutseed42 | 4 B | no disponible | Megatron `.distcp` | Apache 2.0 | Variante del mismo experimento con cabezas IF |
| zhezi12138/Qwen3-4B-mbpp-random50-rolloutseed42 | 4 B | no disponible | Megatron `.distcp` | Apache 2.0 | Variante con selección aleatoria de cabezas |

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint intermedio de un experimento de investigación, sin garantías de calidad en tareas generales.
- Formato no estándar: los shards `.distcp` no se cargan con `from_pretrained`; requieren el entorno miles/Megatron Bridge y la configuración de Qwen3-4B.
- No se guardó el estado del optimizador, por lo que no admite reanudación exacta del entrenamiento.
- Las puntuaciones de evaluación en entrenamiento no son resultados de benchmarks en held-out y no deben citarse como rendimiento del modelo.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del base Qwen3-4B, no documentados aquí.
- Idiomas soportados no declarados; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación, su uso en producción no está recomendado.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-to-ifeval-same-rr50-rolloutseed42-20261108-dxkumamc
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint de origen (tarea MBPP): https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-to-ifeval-mbpp-rr50-rolloutseed42
- Variante IF: https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-to-ifeval-ifeval-rr50-rolloutseed42
- Variante random50: https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-random50-rolloutseed42
- Run de W&B: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/dxkumamc
