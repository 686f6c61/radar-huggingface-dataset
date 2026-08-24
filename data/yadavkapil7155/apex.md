# yadavkapil7155/Apex

## Resumen
Apex-64M es un modelo de lenguaje pequeño (SLM) de 63,8 millones de parámetros, desarrollado por Kapil Yadav (yadavkapil7155), que sigue una arquitectura de transformer decoder-only estilo GPT. Se distingue por haber sido construido y entrenado completamente desde cero en PyTorch puro, sin usar pesos preentrenados externos, sobre el corpus C4 inglés (~1.280 millones de tokens) y posteriormente afinado con supervisión (SFT) sobre el dataset Databricks Dolly 15k para convertirse en un asistente conversacional que sigue instrucciones.

El modelo destaca por su ligereza extrema: ocupa aproximadamente 128 MB en FP16 y puede ejecutarse en CPU con menos de 300 MB de RAM, lo que lo hace adecuado para entornos con recursos limitados o despliegues edge. Incluye características como ventana de contexto de 512 tokens, atención flash integrada, pesos compartidos entre embedding y capa de salida, y un sistema de doble capa de seguridad (heurística de palabras clave + filtro de toxicidad neuronal). Su licencia MIT permite uso comercial sin restricciones.

Aunque no se han publicado benchmarks oficiales, el modelo reporta una pérdida de preentrenamiento de ~4.02 en C4 y una pérdida de SFT de ~3.17 en Dolly 15k. Su relevancia radica en ser un ejemplo completo de pipeline de entrenamiento de SLM reproducible y de bajo coste, útil para experimentación y aplicaciones donde la eficiencia computacional es prioritaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-style) |
| Parametros totales | 63.823.360 (~63,82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se menciona FP16 y FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (se cargan con `torch.load` desde archivos `.pt`) |

## Arquitectura y entrenamiento
Apex-64M es un transformer decoder-only con 12 bloques, dimensión de embedding de 512, 8 cabezas de atención (head_dim=64) y feed-forward de 2048 dimensiones. Utiliza Pre-LayerNorm, atención flash mediante `F.scaled_dot_product_attention` de PyTorch y pesos compartidos entre la capa de embedding y la capa de salida (tied embeddings). El tokenizer es `tiktoken` con vocabulario de 50.257 tokens (r50k_base).

El entrenamiento se realizó en dos fases: pre-training sobre 1.28 mil millones de tokens del corpus C4 English, desde inicialización aleatoria N(0,0.02), con AMP FP16 y scheduler de learning rate coseno. Posteriormente, se aplicó SFT sobre Databricks Dolly 15k con 3 épocas, usando máscara de pérdida sobre los tokens del prompt y desplazamiento autoregresivo de 1 token. El sistema de chat incluye un buffer de contexto deslizante que permite conversaciones multi-turno dentro de los 512 tokens, y una doble capa de guardrail: heurística de palabras clave y filtro de toxicidad neuronal (`unitary/toxic-bert`).

## Capacidades
- Generación de texto autoregresivo con sampling top-p y temperatura configurable.
- Seguimiento de instrucciones gracias al fine-tuning SFT (formato `### Instruction:` y `### Response:`).
- Chat multi-turno con memoria de contexto limitada a 512 tokens (ventana deslizante).
- Filtrado de toxicidad de entrada y salida integrado (doble guardrail).
- Ejecución en CPU con baja latencia (diseñado para funcionar en <300 MB RAM).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-step explícito.

## Casos de uso
- Chatbot de soporte en entornos con recursos mínimos: el modelo puede ejecutarse en un Raspberry Pi o en un servidor sin GPU, ofreciendo respuestas a preguntas frecuentes con un presupuesto de memoria inferior a 300 MB.
- Prototipado rápido de asistentes conversacionales: su licencia MIT y su pequeño tamaño permiten integrarlo en demos y pruebas de concepto sin costes de infraestructura.
- Educación y experimentación: sirve como ejemplo didáctico de un pipeline completo de entrenamiento de SLMs (desde cero hasta SFT) para estudiantes e investigadores.
- Filtrado y moderación de contenido: gracias a sus guardrails de toxicidad, puede utilizarse como componente de pre-procesamiento en sistemas de moderación de texto.
- Generación de texto en entornos embebidos o con limitación de memoria: su footprint de 128 MB en FP16 es adecuado para aplicaciones móviles o IoT.
- Pruebas de concepto de interacción en lenguaje natural: permite evaluar la viabilidad de un asistente de texto en productos antes de escalar a modelos más grandes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de entrenamiento (pre-training ~4.02, SFT ~3.17), pero no hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- Inferencia en CPU: funciona con menos de 300 MB de RAM (FP16). Un portátil estándar es suficiente.
- VRAM estimada: 128 MB en FP16, 255 MB en FP32. Cabe en cualquier GPU comercial, incluidas las de gama baja (e.g., GTX 1650, RTX 2060).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; se puede ejecutar incluso en CPU sin aceleración.
- Opciones de despliegue: el repositorio incluye un script `app.py` con interfaz Gradio, además de un CLI. No se menciona soporte para vLLM, Ollama o TGI; se cargaría manualmente con PyTorch.
- Latencia y throughput: no disponibles, pero por su tamaño se espera generación en tiempo real en CPU (típicamente <100 tokens/s en hardware moderno).

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Entrenamiento |
|---|---|---|---|---|---|
| Apex-64M | 63,8M | 512 | MIT | .pt | Desde cero + SFT |
| GPT-2 (124M) | 124M | 1024 | MIT | .pt/safetensors | Pre-entrenado |
| TinyStories (33M) | 33M | 512 | MIT | .pt | Pre-entrenado |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la información disponible, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias
- Contexto limitado a 512 tokens: no es adecuado para tareas que requieren ventanas de contexto largas (documentos extensos, conversaciones largas).
- Solo inglés: no soporta otros idiomas.
- Riesgo de alucinaciones: como todo modelo generativo, puede producir respuestas inventadas o inexactas.
- Sesgo del corpus C4 y Dolly 15k: puede reflejar sesgos presentes en esos conjuntos de datos.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs externas ni ejecutar acciones.
- Formato de pesos no estándar: se almacena como `.pt` y requiere cargar manualmente con `torch.load`, no es compatible directamente con frameworks como Transformers sin adaptación.
- No se ha publicado evidencia de pruebas de robustez ni seguridad en producción.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/yadavkapil7155/Apex)
- [Repositorio de código (mencionado en el README)](https://github.com/kapilverse/SMALL_MODEL.git) (no verificado en la búsqueda web)
