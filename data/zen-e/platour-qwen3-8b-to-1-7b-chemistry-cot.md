# zen-E/PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT es un artefacto de investigación publicado por el usuario zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). La idea central es que un modelo mayor y congelado (Qwen3-8B) actúa como emisor que codifica el prompt y entrega representaciones ocultas, mientras que un modelo menor y congelado (Qwen3-1.7B) actúa como receptor y genera la respuesta de forma independiente. Entre ambos se entrenan unos puentes lineales ligeros que proyectan las representaciones del emisor al espacio del receptor.

Este repositorio concreto corresponde al experimento 16 del proyecto, centrado en la tarea `chemistry_cot` (razonamiento encadenado sobre química). No contiene pesos completos de ninguno de los dos modelos base, sino únicamente las proyecciones de los puentes, con un tamaño de repo de 0,9 GB. Los backbones emisor y receptor deben descargarse por separado.

Es relevante ahora porque propone una vía distinta a la destilación clásica: en lugar de comprimir un modelo grande en uno pequeño mediante entrenamiento del receptor, se mantienen ambos congelados y se aprende solo la interfaz de comunicación entre ellos. El propio autor advierte que este export es un artefacto histórico de inferencia sin puntuaciones de benchmark asociadas, por lo que no debe emplearse para sostener afirmaciones comparativas sin una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales de proyección entre dos backbones transformer congelados (Qwen3-8B emisor y Qwen3-1.7B receptor); soporta modelos con atención híbrida |
| Parametros totales | No disponible (el repo solo contiene las proyecciones de los puentes; los backbones se descargan aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los modelos base Qwen3) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos base conservan sus propias licencias) |
| Formato de pesos | safetensors, con cargador propio (custom-loader); no compatible con `AutoModel.from_pretrained` ni con PEFT |

## Arquitectura y entrenamiento

El método PACT entrena puentes lineales ligeros entre backbones congelados, partiendo de proyecciones inicializadas a cero, y optimiza esas proyecciones mediante recompensas de tarea. El emisor (Qwen3-8B) procesa el prompt y produce representaciones ocultas que, tras la proyección lineal, se inyectan en el receptor (Qwen3-1.7B), que genera la respuesta de forma autónoma. El diseño contempla modelos con atención híbrida, lo que encaja con la familia Qwen3.

El paper introduce además PACT-Check, un conjunto de controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras provienen realmente de la información útil del emisor o si surgen simplemente de adaptar el receptor. La model card subraya explícitamente que un mejor rendimiento en la tarea no demuestra por sí solo una comunicación efectiva entre modelos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset más allá de su identificador (`zen-E/PLatour-Qwen3-Data`) ni si se empleó RLHF o DPO adicional.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) especializado en el dominio de química, según la tarea `chemistry_cot` del experimento 16.
- Transferencia de representaciones ocultas desde un modelo mayor (Qwen3-8B) a uno menor (Qwen3-1.7B) mediante puentes lineales entrenados.
- Compatibilidad con backbones de atención híbrida.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: sirve como artefacto reproducible para estudiar si la información del emisor aporta señal útil al receptor, empleando los controles de PACT-Check para descartar mejoras espurias por adaptación del receptor.
- Experimentos de razonamiento químico: la tarea `chemistry_cot` permite evaluar la calidad del chain-of-thought en problemas de química con un receptor de 1,7B asistido por representaciones de un emisor de 8B.
- Ablación de arquitecturas de puente: al ser proyecciones lineales entrenadas desde cero, facilita comparar variantes de inicialización, dimensionalidad y función de recompensa sin reentrenar los backbones.
- Estudio de eficiencia en despliegue: permite medir si un receptor pequeño puede aproximar el comportamiento de uno grande reduciendo el coste de inferencia del generador, manteniendo el emisor solo en la fase de prefill.
- Reproducción académica: el repo incluye el identificador de experimento, el mapeo de tensores, el nombre del fichero de pesos y su SHA-256, lo que facilita replicar la ejecución histórica con el cargador del proyecto.
- Validación de protocolos de evaluación: el propio autor indica que se requiere revisión de procedencia y evaluación independiente antes de usar estos artefactos en nuevas afirmaciones comparativas, lo que lo convierte en un caso de estudio sobre higiene experimental en ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre el rendimiento en un conjunto de validación no sesgado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto completo; depende de los backbones descargados por separado (Qwen3-8B como emisor y Qwen3-1.7B como receptor).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; el receptor de 1,7B es ligero, pero el emisor de 8B condiciona el requisito conjunto.
- Opciones de despliegue: no se puede usar vLLM, llama.cpp, Ollama ni TGI de forma estándar; requiere el cargador del proyecto PLatour (`platour-exps download --experiment 16`) con el `config.json` del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT | Puentes sobre backbones 8B + 1,7B | No disponible | Transferencia prefill-a-autorregresivo con backbones congelados | Apache-2.0 | Hugging Face (cargador propio) |
| Qwen/Qwen3-1.7B | 1,7B | No disponible | LLM denso estándar | Ver licencia upstream | Hugging Face, Transformers |
| Qwen/Qwen3-8B | 8B | No disponible | LLM denso estándar | Ver licencia upstream | Hugging Face, Transformers |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye puntuaciones de benchmark ni garantiza un protocolo de selección de checkpoints; no debe usarse para respaldar afirmaciones comparativas sin evaluación independiente.
- Las revisiones exactas de los backbones empleadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el cargador específico del proyecto PLatour.
- El export no constituye un estado reanudable de optimizador/RNG, solo pesos de inferencia.
- Los modelos base Qwen3-8B y Qwen3-1.7B conservan sus propias licencias y avisos, que deben respetarse además de la Apache-2.0 del export.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la información proporcionada; cabe esperar los del receptor Qwen3-1.7B en tareas de química.
- Limitaciones de contexto e idioma: no disponibles.
- Uso comercial: la licencia del export es Apache-2.0, pero el uso comercial está condicionado por las licencias de los backbones subyacentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-Chemistry-CoT
- Paper: https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Guía de despliegue de Qwen3 1.7B: https://aiindigo.com/tutorials/getting-started-with-qwen3-1-7b-deploying-efficient-edge-ai
