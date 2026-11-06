# Wing22/Qwen3-VL-4B-Flow-4Stage-Ablation

## Resumen

Qwen3-VL-4B-Flow-4Stage-Ablation es un checkpoint de investigación publicado por el usuario Wing22 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (fine-tuning) sobre el backbone Qwen3-VL-4B-Instruct de Alibaba, orientado a una técnica denominada "latent visual reasoning" con un objetivo Flow. El modelo se distribuye como checkpoints de PyTorch Lightning, no como un directorio estándar de Transformers.

La relevancia de esta publicación es fundamentalmente metodológica: documenta un ablation histórico de cuatro etapas (Teacher Alignment, Teacher Joint, Student Warmup y Student Joint) con 1394/1394/200/1394 actualizaciones de optimizador. El autor lo distingue explícitamente de una receta posterior de tres etapas sin supervisión de descripción. Es, por tanto, material de referencia para investigadores que estudian destilación y alineamiento de representaciones latentes en modelos visión-lenguaje.

El modelo hereda la arquitectura y capacidades del Qwen3-VL-4B-Instruct base, con aproximadamente 4 mil millones de parámetros, pero su empaquetado (60,1 GB en el repositorio, checkpoints personalizados) y su naturaleza de ablation lo hacen inadecuado para uso en producción directa. La licencia es Apache 2.0, aunque el uso práctico requiere el cargador portable del repositorio de reproducción del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basada en Qwen3-VL-4B-Instruct, con pipeline de razonamiento visual latente |
| Parametros totales | Aproximadamente 4 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se guardan en su precisión original) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-VL-4B-Instruct, un transformer multimodal que procesa entradas de imagen y texto. Sobre él se aplica un esquema de entrenamiento en cuatro etapas: Teacher Alignment (1394 actualizaciones), Teacher Joint (1394), Student Warmup (200) y Student Joint (1394). Durante el entrenamiento del teacher se emplea un objetivo Flow, y la supervisión de descripción se mantiene tanto en el teacher como en el student final de la etapa Joint.

La innovación técnica reside en el denominado "latent visual reasoning": el modelo aprende representaciones latentes asociadas a contenido visual, con un diagnóstico de similitud coseno caso a caso por paso como medida de representación. El autor advierte explícitamente que esta métrica es un diagnóstico de representación y no una prueba de que el QA utilice contenido visual específico de cada muestra. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto, heredadas del modelo base Qwen3-VL-4B-Instruct.
- Razonamiento visual latente mediante el pipeline Flow/teacher-student descrito.
- Respuesta a preguntas visuales (QA) con extracción de latentes, sin necesidad de imágenes de entrenamiento ni pesos Flow/FLUX ni caché VAE.
- Capacidades del backbone Qwen3-VL-4B-Instruct (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo): no verificadas en esta publicación concreta, por lo que deben considerarse potenciales y no garantizadas.
- No se documentan modos especiales adicionales (thinking mode, audio, etc.) específicos de este checkpoint.

## Casos de uso

- Investigación en destilación de representaciones latentes: el checkpoint permite reproducir el ablation de cuatro etapas y compararlo con la receta posterior de tres etapas, usando el cargador portable del repositorio de reproducción.
- Estudio de alineamiento teacher-student: el par `joint/last_full.ckpt` y `teacher/student_source.ckpt` (ambos en el paso 1394) permite analizar la transferencia de conocimiento entre teacher y student en tareas de razonamiento visual.
- Evaluación de diagnósticos de representación: el paquete independiente de benchmarks `Wing22/lvr-latent-ablation-benchmarks-v1` sirve para medir similitud coseno latente caso a caso y estudiar su relación con el rendimiento en QA.
- Reproducción de experimentos con PyTorch Lightning: el repositorio incluye `model_release.json` con tamaños exactos, SHA256, familia de modelos y metadatos de etapas, lo que facilita la verificación de integridad en entornos de investigación.
- Análisis comparativo de objetivos de entrenamiento: permite estudiar el efecto del objetivo Flow frente a alternativas en la fase de teacher, manteniendo la supervisión de descripción.
- Docencia y formación en técnicas de ablation: como ejemplo documentado de un ablation histórico con recuentos de actualizaciones y estructura de etapas claramente especificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta release no reclama nuevas puntuaciones de ablation en GPU y remite al paquete independiente de benchmarks para diagnósticos de representación, que no constituyen resultados de rendimiento de QA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 60,1 GB e incluye checkpoints de student y teacher, por lo que la carga completa requiere espacio en disco y memoria considerables; la VRAM dependerá de la precisión original de los pesos y del cargador.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia para la inferencia.
- ¿Cabe en GPU de consumo? No disponible. Con un backbone de aproximadamente 4 mil millones de parámetros podría ser viable en GPUs de consumo con cuantización, pero este checkpoint no ofrece pesos cuantizados y su cargador es personalizado.
- Opciones de despliegue: no se soporta `from_pretrained` estándar de Transformers. Se requiere el cargador portable del repositorio de reproducción, con los argumentos `--checkpoint`, `--teacher-checkpoint`, `--model-family qwen3-4b` y `--base-model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Flow-4Stage-Ablation | ~4B | No disponible | Checkpoints Lightning | Apache 2.0 | Hugging Face, cargador personalizado |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | No disponible en esta ficha | Transformers estándar | No disponible en esta ficha | Hugging Face, `from_pretrained` |
| Receta posterior de tres etapas (mencionada por el autor) | ~4B | No disponible | No disponible | No disponible | No disponible |

La comparación principal es con el modelo base Qwen3-VL-4B-Instruct, del que este checkpoint hereda arquitectura y parámetros pero difiere en el pipeline de entrenamiento y en el empaquetado. El autor menciona una receta posterior de tres etapas sin supervisión de descripción, pero no publica sus pesos ni sus resultados en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de ablation histórico, no un modelo listo para producción; el propio autor lo distingue de la receta posterior.
- No es un directorio estándar de Transformers: no funciona con `from_pretrained` y requiere el cargador portable del repositorio de reproducción.
- Los pesos se guardan en su precisión original y el repositorio ocupa 60,1 GB, lo que complica el despliegue en entornos con recursos limitados.
- La similitud coseno latente caso a caso es un diagnóstico de representación y no prueba que el QA utilice contenido visual específico de cada muestra.
- No se han publicado resultados de benchmarks de QA ni nuevas puntuaciones de ablation en GPU para esta release.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, idiomas soportados ni longitud de contexto; deben asumirse los del modelo base, no verificados aquí.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos en formato estándar y de benchmarks dificulta su evaluación para producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción nula y ausencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Wing22/Qwen3-VL-4B-Flow-4Stage-Ablation
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de reproducción (rama ablation): https://github.com/wmz422/lvr_pipeline_new/tree/repro/qwen25-flow-20261028/ablation
- Paquete de benchmarks: https://huggingface.co/datasets/Wing22/lvr-latent-ablation-benchmarks-v1
