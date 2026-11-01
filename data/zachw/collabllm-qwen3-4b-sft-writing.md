# ZachW/CollabLLM-Qwen3-4B-SFT-Writing

## Resumen

CollabLLM-Qwen3-4B-SFT-Writing es un adaptador LoRA de ajuste supervisado (SFT) para el modelo Qwen3-4B, publicado por el usuario ZachW en HuggingFace. No se trata de un modelo completo, sino de un artefacto de reproducción independiente entrenado sobre los datos interactivos de tamaño medio del proyecto CollabLLM, una línea de investigación centrada en el entrenamiento de modelos conversacionales capaces de colaborar de forma más efectiva con el usuario en tareas multi-turno.

El adaptador está especializado en tareas de escritura y conversación colaborativa, y se distribuye con licencia Apache 2.0. El repositorio ocupa 0,3 GB, lo que corresponde únicamente a los pesos del adaptador (rango 32, alpha 16) y al tokenizador; los pesos base de Qwen3-4B deben descargarse por separado. El autor declara explícitamente que no es un checkpoint oficial del equipo de CollabLLM y que no reclama ningún resultado de benchmark.

Su relevancia actual es doble: por un lado, permite experimentar con el método CollabLLM sobre una base moderna y de tamaño contenido (4B parámetros), apta para GPU de consumo; por otro, sirve como referencia de reproducción reproducible, con hiperparámetros, métricas y hash SHA-256 documentados en `training_metadata.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parámetros totales | 4B (modelo base) + adaptador LoRA de rango 32 (tamaño exacto no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen3-4B; longitud de entrenamiento limitada a 2048 tokens) |
| Tipos de cuantización | no disponible (el adaptador se carga en bfloat16 según el ejemplo del autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4B parámetros. El ajuste se realizó con LoRA de rango 32, alpha 16 y dropout 0,1, aplicado a las capas de atención y a las proyecciones del MLP. Se entrenó en modo no-thinking: la plantilla de chat incluida fija `enable_thinking = false`, de modo que el modelo no emite cadenas de razonamiento explícitas.

Los datos provienen del conjunto `interactive-medium` del repositorio original de CollabLLM (commit `d573e4949abdc301cb2b630525c593cc432e94b8`). Por cada identificador de diálogo se seleccionó la conversación con el prompt más largo y se le añadió la respuesta elegida del asistente, resultando en 450 conversaciones de entrenamiento y 50 de validación (semilla 42). El entrenamiento consistió en tres épocas, 24 pasos de optimizador, tamaño de batch efectivo 64, tasa de aprendizaje 1e-5, warmup ratio 0,1 y pérdida calculada solo sobre los tokens del asistente, con longitud máxima de secuencia de 2048 tokens. La revisión del modelo base utilizada fue `1cfa9a7208912126459214e8b04321603b3df60c`. No se aplicaron etapas posteriores de RLHF, DPO ni GRPO: este release contiene únicamente los pesos finales de SFT.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, orientada a tareas de escritura y colaboración con el usuario.
- Ajuste específico para el estilo de interacción de CollabLLM: preguntas de aclaración, propuestas de alternativas y refinamiento iterativo de borradores.
- Modo no-thinking forzado por la plantilla de chat, lo que reduce la latencia y evita la generación de razonamiento explícito.
- Soporte de plantilla de chat con rol de sistema (el `system_prompt.txt` original de CollabLLM se incluye en el repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Asistencia a la escritura colaborativa: el adaptador está entrenado para mantener diálogos en los que el usuario refina un texto por iteraciones, por lo que encaja en herramientas de edición asistida donde el modelo propone borradores y pregunta por preferencias antes de reescribir.
- Reproducción de experimentos CollabLLM: investigadores que quieran validar el método sobre una base de 4B pueden cargar este adaptador con PEFT y comparar el comportamiento colaborativo frente al modelo base sin ajustar.
- Evaluación de técnicas de SFT con LoRA: el repositorio documenta hiperparámetros, métricas y hash SHA-256, lo que lo convierte en un punto de partida útil para estudiar el efecto del rango, la tasa de aprendizaje o la selección de datos en tareas conversacionales.
- Generación de respuestas en entornos de bajo presupuesto: al ser un adaptador sobre un modelo de 4B, puede ejecutarse en una GPU de consumo con cuantización del modelo base, lo que permite prototipar asistentes conversacionales sin infraestructura dedicada.
- Creación de datasets sintéticos de diálogo: el modelo puede generar conversaciones de estilo colaborativo que luego se filtren y revisen para ampliar corpus de entrenamiento.
- Docencia y divulgación: sirve como ejemplo práctico y reproducible de un pipeline completo de SFT con PEFT, desde la selección de datos hasta la carga del adaptador y la inferencia con plantilla de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la model card no reclama ninguna puntuación y que, al usar Qwen3-4B como base, este artefacto no reproduce los resultados de la Tabla 1 del paper original de CollabLLM.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 0,3 GB, pero la inferencia requiere cargar el modelo base Qwen3-4B. En bfloat16 se estiman en torno a 8-9 GB de VRAM para pesos, más overhead de activaciones y caché KV; con cuantización de 4 bits del base, el requisito baja aproximadamente a 3-4 GB (estimación, no verificada en la model card).
- GPU recomendadas: A100, H100 o L40S para despliegues de producción; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y prototipado.
- GPU de consumo: sí cabe en GPUs con 8 GB o más si se cuantiza el modelo base; en bfloat16 completo conviene disponer de 12-16 GB.
- Opciones de despliegue: carga nativa con `transformers` + `peft` + `accelerate` (método documentado por el autor); para serving se puede fusionar el adaptador con el base y exportar a vLLM, TGI o llama.cpp/Ollama, aunque estos flujos no están documentados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| CollabLLM-Qwen3-4B-SFT-Writing | 4B + LoRA r32 | no disponible (entrenado a 2048) | Adaptador SFT | Apache 2.0 | Reproducción independiente, solo inglés, sin benchmarks publicados |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Modelo base completo | Apache 2.0 | Base sin ajuste colaborativo; referencia directa para comparar el efecto del adaptador |
| Checkpoints oficiales de CollabLLM | no disponible | no disponible | Modelos completos tras SFT y RL | no disponible | Entrenados por los autores del paper; este adaptador no los replica |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo se distribuye el adaptador SFT; no incluye pesos de GRPO, PPO ni DPO, por lo que no equivale al modelo final del paper de CollabLLM.
- El autor no reclama ningún resultado de benchmark; el rendimiento real en tareas de escritura no está cuantificado.
- Entrenado únicamente en inglés: el uso en castellano u otros idiomas no está validado y probablemente degrade la calidad.
- Ventana de entrenamiento de 2048 tokens: las conversaciones muy largas pueden exceder el régimen para el que fue ajustado.
- Riesgo de alucinación inherente a un modelo de 4B; el autor advierte que puede producir respuestas incorrectas y debe evaluarse en la aplicación prevista.
- Los datos de origen de CollabLLM conservan sus propios términos de uso, y el prompt de sistema incluido mantiene su aviso MIT original; conviene revisarlos antes de un uso comercial.
- El adaptador debe combinarse con la revisión exacta del modelo base (`1cfa9a7208912126459214e8b04321603b3df60c`) para reproducir el comportamiento documentado.
- No hay información sobre sesgos específicos, tool calling ni soporte de agentes; no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZachW/CollabLLM-Qwen3-4B-SFT-Writing
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper de CollabLLM: https://arxiv.org/abs/2502.00640
- Repositorio original de CollabLLM: https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8
- Datos interactive-medium: https://github.com/Wuyxin/collabllm/tree/d573e4949abdc301cb2b630525c593cc432e94b8/data/interactive-medium
