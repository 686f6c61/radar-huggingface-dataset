# zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT es un artefacto de investigación publicado por el autor zen-E que implementa el método PACT (Prefill-to-Autoregressive Cross-model Transfer) descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). La idea central es que un modelo "emisor" grande (Qwen/Qwen3-8B) codifica el prompt y entrega representaciones ocultas, mientras que un modelo "receptor" pequeño (Qwen/Qwen3-1.7B) genera la respuesta de forma independiente, conectados mediante puentes lineales ligeros entrenados sobre backbones congelados.

Este repositorio concreto corresponde al Experimento 10 del proyecto, un ajuste supervisado (SFT) sobre el conjunto de datos de razonamiento químico `chemistry_cot`. No se trata de un modelo autónomo al uso: el repositorio distribuye únicamente los pesos de las proyecciones puente (0,9 GB), no los backbones, que deben descargarse por separado. El autor advierte explícitamente que no se publican resultados de benchmarks ni se garantiza un protocolo de selección de checkpoint, por lo que su uso está orientado a reproducibilidad de investigación y no a producción.

La relevancia del artefacto es metodológica: explora si la información del emisor mejora realmente al receptor o si las ganancias provienen simplemente de la adaptación del receptor, mediante controles como Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver (PACT-Check). Es, por tanto, material para estudiar comunicación entre modelos, no un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (backbones Qwen3); puentes lineales entre emisor y receptor |
| Parametros totales | No disponible (el repo solo contiene proyecciones puente; los backbones son Qwen3-8B y Qwen3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los backbones Qwen3; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias) |
| Formato de pesos | safetensors (carga mediante loader propio `custom-loader`, no compatible con `AutoModel.from_pretrained` ni PEFT) |

## Arquitectura y entrenamiento

El sistema sigue el paradigma PACT: el emisor Qwen3-8B procesa el prompt y produce representaciones ocultas que se inyectan en el receptor Qwen3-1.7B a través de proyecciones lineales inicializadas a cero. Ambos backbones permanecen congelados y solo se entrenan los puentes, optimizados mediante recompensas de tarea. El método soporta modelos con atención híbrida. Este repositorio particular corresponde a un ajuste supervisado (SFT) sobre el dataset `zen-E/PLatour-Qwen3-Data`, en la variante `chemistry_cot` (razonamiento químico con cadena de pensamiento).

El paper introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) diseñados para verificar si las mejoras dependen de información útil del emisor o si pueden explicarse por mera adaptación del receptor. El autor indica que los tensores originales no se han modificado y que los hashes reflejan una exportación pública de inferencia; las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente. No se especifican número de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto autoregresiva en el receptor (Qwen3-1.7B) condicionada por representaciones del emisor (Qwen3-8B).
- Razonamiento con cadena de pensamiento (CoT) en el dominio de química, según el dataset `chemistry_cot`.
- Transferencia de información entre modelos de distinto tamaño mediante puentes lineales entrenados.
- Soporte de modelos con atención híbrida en el marco PACT.
- Evaluación controlada mediante PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información proporcionada.

## Casos de uso

- Reproducción de investigación en transferencia entre modelos: permite replicar el Experimento 10 del paper usando `platour-exps download --experiment 10` y los backbones Qwen3-8B y Qwen3-1.7B descargados por separado.
- Estudio de comunicación emisor-receptor: sirve para analizar si las representaciones del modelo grande aportan señal útil al pequeño frente a los controles de PACT-Check.
- Investigación en destilación implícita: el receptor de 1.7B podría aprovechar conocimiento del emisor de 8B sin copiar sus pesos, un escenario relevante para reducir coste de inferencia.
- Experimentación con razonamiento químico: el ajuste sobre `chemistry_cot` permite estudiar CoT en un dominio científico concreto bajo el esquema PACT.
- Validación metodológica de benchmarks: el artefacto está pensado para que terceros realicen evaluación independiente y revisión de procedencia antes de extraer conclusiones comparativas.
- Desarrollo de infraestructura de carga personalizada: el uso del loader propio y del `config.json` con mapeo de tensores y SHA-256 sirve como referencia para pipelines de artefactos con verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out.

## Requisitos de hardware

- VRAM estimada: no disponible para el conjunto completo; el repo de puentes ocupa 0,9 GB, pero la inferencia requiere cargar ambos backbones (Qwen3-8B y Qwen3-1.7B).
- GPU recomendadas: no especificadas en la información; por tamaño de los backbones, un despliegue en precisión completa requeriría GPUs de clase A100/H100, y cuantización permitiría GPUs de consumo, aunque no se documentan opciones.
- ¿Cabe en GPU de consumo?: no disponible (depende de la cuantización de los backbones, no documentada).
- Opciones de despliegue: no se soporta `AutoModel.from_pretrained` ni PEFT; se requiere el loader del proyecto PLatour (`platour-exps download --experiment 10`) con el `config.json` del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT | Puentes sobre 8B + 1.7B | No disponible | Transferencia PACT emisor-receptor | Apache-2.0 | Repo de investigación, 0 descargas |
| Qwen/Qwen3-8B | 8B | No disponible en la información | LLM denso estándar | Según modelo upstream | Público en Hugging Face |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la información | LLM denso estándar | Según modelo upstream | Público en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene proyecciones puente; requiere descargar los backbones por separado.
- No es cargable con `AutoModel.from_pretrained` ni PEFT; exige el loader específico del proyecto PLatour.
- Sin benchmarks publicados: el autor declina cualquier afirmación sobre rendimiento o selección de checkpoint.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no están verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El export no es estado reanudable de optimizador/RNG, solo pesos de inferencia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el ajuste está orientado a un dominio concreto (química).
- Licencia Apache-2.0 para el export, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse.
- Uso comercial no recomendado sin evaluación independiente y revisión de procedencia; el artefacto está pensado para investigación comparativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-8B-to-1.7B-Chemistry-CoT
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
