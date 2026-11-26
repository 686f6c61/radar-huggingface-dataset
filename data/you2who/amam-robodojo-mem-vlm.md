# you2who/AMAM-robodojo-mem-vlm

## Resumen

AMAM-robodojo-mem-vlm es un adaptador LoRA para el modelo vision-lenguaje Qwen3-VL-4B-Instruct, desarrollado por el autor de Hugging Face `you2who` en el marco del proyecto AMAM (AgentMem-Action-Model). No se trata de un modelo completo, sino de un conjunto de pesos PEFT que se cargan sobre el modelo base congelado Qwen/Qwen3-VL-4B-Instruct. Su propósito es dotar al VLM de capacidades específicas para robótica y memoria de agente dentro del benchmark robodojo_mem, según el protocolo AMAM descrito en el paper arXiv:2609.11308.

El adaptador corresponde a la versión congelada `v6_step18500` y se distribuye junto con su procesador y tokenizador. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo de 4B parámetros. El modelo base Qwen3-VL-4B-Instruct aporta la arquitectura vision-lenguaje subyacente, mientras que este adaptador añade el ajuste fino específico para tareas de robótica con memoria.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación ligado a un benchmark concreto, con cero descargas y cero likes en el momento de la consulta, y sin datos publicados de benchmarks en la información disponible. Su interés principal radica en que forma parte de un ecosistema más amplio (VLM, VLA y anotaciones) orientado a la evaluación de modelos de acción con memoria en entornos robóticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct (vision-lenguaje transformer) |
| Parámetros totales | No disponible (el adaptador no declara su recuento; el modelo base tiene 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 (solo contribuciones de AMAM; los materiales upstream conservan sus licencias) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se aplica sobre Qwen/Qwen3-VL-4B-Instruct, un modelo vision-lenguaje de 4.000 millones de parámetros. La arquitectura efectiva en inferencia es la del modelo base más las matrices de bajo rango del adaptador. El autor indica que el adaptador se entrenó hasta el paso `v6_step18500` (versión congelada) y que no se incluye estado de optimizador ni de reanudación del entrenamiento, por lo que solo sirve para inferencia.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El nombre `robodojo_mem` y la etiqueta `robotics` sugieren un ajuste orientado a tareas de manipulación o navegación robótica con componente de memoria, evaluadas mediante el protocolo AMAM y un modelo de acción (Action model) complementario. El uso previsto requiere cargar el adaptador junto con el procesador y tokenizador incluidos, y colocar el modelo base en la ruta `models/base/Qwen3-VL-4B-Instruct`.

## Capacidades

- Procesamiento conjunto de visión y lenguaje heredado del modelo base Qwen3-VL-4B-Instruct.
- Ajuste específico para robótica dentro del benchmark robodojo_mem, según el protocolo AMAM.
- Integración con un modelo de acción (Action model) del mismo proyecto para tareas de agente.
- Componente de memoria de agente implícito en el nombre del proyecto (AgentMem-Action-Model).
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación en el benchmark robodojo_mem: el adaptador está diseñado para ejecutarse con el protocolo de benchmark AMAM y el modelo de acción correspondiente, de modo que sirve para reproducir o comparar resultados dentro de ese marco experimental.
- Investigación en modelos de acción con memoria: al combinarse con el adaptador VLA (`AMAM-robodojo-mem-vla`) y las anotaciones del proyecto, permite estudiar cómo un VLM con memoria influye en la planificación de acciones robóticas.
- Experimentos de percepción visión-lenguaje en robótica: el modelo base Qwen3-VL-4B-Instruct aporta descripción de escenas e imágenes, y el adaptador lo especializa para el dominio del benchmark.
- Reproducción de resultados de un paper: al estar congelado en `v6_step18500`, facilita la replicación de los experimentos descritos en arXiv:2609.11308.
- Base para ajuste fino posterior: el adaptador puede servir como punto de partida para nuevos entrenamientos LoRA sobre el mismo modelo base en tareas robóticas relacionadas.
- Docencia y prototipado en investigación robótica: su tamaño reducido (0,1 GB de adaptador) y su licencia CC BY 4.0 permiten usarlo en entornos académicos con atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al requerir el modelo base Qwen3-VL-4B-Instruct, la VRAM dependerá de la cuantización de este (no se detalla en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá del modelo base y de su cuantización.
- Opciones de despliegue: el autor especifica la carga mediante PEFT con el modelo base Qwen/Qwen3-VL-4B-Instruct y el procesador/tokenizador incluidos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAM-robodojo-mem-vlm | Adaptador LoRA sobre Qwen3-VL-4B-Instruct | 4B (base) + adaptador | No disponible | CC BY 4.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-4B-Instruct | VLM completo | 4B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |
| AMAM-robodojo-mem-vla | Adaptador VLA del mismo proyecto | No disponible | No disponible | CC BY 4.0 | Hugging Face (asset relacionado) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen3-VL-4B-Instruct y el procesador/tokenizador incluidos; sin ellos no funciona.
- Solo para inferencia: no incluye estado de optimizador ni de reanudación de entrenamiento.
- Uso previsto restringido: el autor indica que debe usarse con el protocolo de benchmark AMAM y el modelo de acción correspondiente; fuera de ese contexto su comportamiento no está validado.
- Licencia matizada: CC BY 4.0 cubre solo las contribuciones de AMAM; los modelos, datasets y materiales de terceros (incluido el modelo base) conservan sus propias licencias, que deben respetarse.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe.
- Sin datos de benchmarks ni de sesgos: no se han publicado métricas de rendimiento, evaluación de sesgos ni tasas de alucinación.
- Madurez muy baja: cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Sin garantías de soporte: no se indica mantenimiento, versionado futuro ni canal de soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/you2who/AMAM-robodojo-mem-vlm)
- [Código en GitHub](https://github.com/utomm/AgentMem-Action-Model)
- [Página del proyecto](https://agent-mem-action-model.github.io/)
- [Paper (arXiv:2609.11308)](https://arxiv.org/abs/2609.11308)
- [Adaptador VLA relacionado](https://huggingface.co/you2who/AMAM-robodojo-mem-vla)
- [Dataset de anotaciones](https://huggingface.co/datasets/you2who/AMAM-robodojo-mem-annotations)
- [Modelo base Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
