# VantoraLabs/Vantora-Micro-Hybrid

## Resumen

Vantora-Micro-Hybrid es un modelo de lenguaje híbrido de tamaño micro (11.256 parámetros) desarrollado por VantoraLabs como artefacto de investigación para estudiar leyes de escalado y comparaciones de arquitectura en la escala de menos de 10K parámetros. Combina un bloque Mamba-2 SSM (state space model) con atención, siguiendo el patrón Falcon-H1 "SA_M", donde atención y SSM operan en paralelo y luego se aplica un MLP SwiGLU secuencial. El modelo se entrenó sobre los primeros 100 millones de tokens de FineWeb-Edu (sample-10BT) durante una sola época, con un contexto de 256 tokens y un vocabulario ByteLevel BPE de 1024 entradas.

Su relevancia radica en demostrar que la arquitectura híbrida SSM+atención generaliza mejor que un transformer puro del mismo tamaño y presupuesto de tokens: supera a su contraparte Vantora-Micro (9.800 parámetros) en +53 Elo y +4,3% de precisión en el benchmark BananaMind Base Bench 1.1. No es un modelo de producción, sino una herramienta para investigar cómo la memoria secuencial lineal del SSM compensa las limitaciones de cabezas de atención estrechas (d_head=8) a escalas muy pequeñas. El modelo requiere `trust_remote_code=True` por su arquitectura personalizada y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HybridLM (Mamba-2 SSM + atención, patrón Falcon-H1 SA_M) |
| Parametros totales | 11.256 (según model card; el campo de HuggingFace indica 21.512, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida que combina un bloque Mamba-2 SSM con atención estándar, siguiendo el patrón Falcon-H1 "SA_M". En cada capa, la entrada se procesa en paralelo por una cabeza de atención (1 cabeza, d_head=8) y un SSM Mamba-2 con expansión 2 (d_inner=16), estado 4 y convolución 4. Luego se aplica un MLP SwiGLU con ratio 2,77 (hidden=22). Hay 2 capas ocultas con block sharing, embeddings atados, 2 meta tokens estilo Hymba y RoPE con theta 500000. El diseño busca que el SSM proporcione memoria secuencial lineal que la atención estrecha no puede capturar a esta escala.

El entrenamiento usó los primeros 100M tokens de FineWeb-Edu (sample-10BT), con batch de 128 × secuencia 256 (3.051 pasos), optimizador Muon para pesos 2D y AdamW para 1D/embeddings, lr 5e-3, schedule WSD (warmup-stable-decay), EMA con decay 0.999, grad clip 0.5 y seed 42. Se ejecutó en una NVIDIA GTX 750 (Maxwell, 4 GB VRAM) durante ~49,5 minutos. No se aplicó RLHF ni DPO; es un modelo base.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 256 tokens.
- Razonamiento lógico y cuantitativo básico: Elo 944 y 918 respectivamente en BananaMind.
- Completado de código: Elo 1014, la categoría más alta.
- Comprensión de sentido común y conocimiento del mundo limitado (Elo 850 y 767).
- Seguimiento de contexto (context tracking) con Elo 733, la categoría más débil.
- Capacidad multilingüe: solo inglés, con tokenizador ByteLevel BPE de 1024 entradas.
- No soporta tool calling, agentes ni modos de razonamiento extendido (thinking mode) por su tamaño.

## Casos de uso

- Investigación en leyes de escalado: permite comparar arquitecturas híbridas vs. transformer puro a igual tamaño y presupuesto de tokens, como se hizo con Vantora-Micro.
- Experimentación educativa: sirve para enseñar conceptos de SSM, atención y entrenamiento de modelos pequeños en entornos con recursos limitados (una GPU de 4 GB es suficiente).
- Pruebas de pipelines de entrenamiento: su entrenamiento rápido (~50 minutos) lo hace útil para validar configuraciones de optimizador, schedules o técnicas de regularización antes de escalar.
- Benchmarking de frameworks de inferencia: al ser minúsculo, permite probar la integración de arquitecturas custom con `trust_remote_code` en transformers, vLLM u otros.
- Estudio de memoria secuencial: analizar cómo el SSM mejora tareas de contexto tracking y razonamiento frente a atención pura a escalas sub-10K.
- Generación de texto de juguete: para demos o prototipos donde no se requiere calidad, como generación de frases aleatorias o pruebas de tokenización.

## Benchmarks y rendimiento

Resultados en BananaMind Base Bench 1.1 (evaluación oficial con runner verificado, 350 ítems):

| Metrica | Valor |
|---|---|
| Elo global | 863 |
| Precision | 30,29% (106/350) |
| Precision ponderada | 31,22% |

| Categoria | Elo | Precision |
|---|---|---|
| Language Completion | 807 | 36,0% |
| Commonsense | 850 | 34,0% |
| World Knowledge | 767 | 26,0% |
| Context Tracking | 733 | 18,0% |
| Quantitative | 918 | 30,0% |
| Logical Reasoning | 944 | 30,0% |
| Code Completion | 1014 | 38,0% |

Comparación con Vantora-Micro (transformer puro, mismo tamaño y datos):

| Modelo | Params | Elo | Precision | Val loss (edu) |
|---|---|---|---|---|
| Vantora-Micro | 9.800 | 810 | 26,00% | 4,9097 |
| Vantora-Micro-Hybrid | 11.256 | 863 | 30,29% | 4,8584 |

El modelo híbrido supera al transformer en 6 de 7 categorías, con mayores ventajas en Commonsense (+192 Elo), Logical Reasoning (+105) y Context Tracking (+68).

## Requisitos de hardware

- Inferencia: al tener solo 11.256 parámetros en float32 (~45 KB), se ejecuta en cualquier CPU o GPU moderna sin necesidad de VRAM dedicada.
- Entrenamiento: se realizó en una NVIDIA GTX 750 (4 GB VRAM) en ~49,5 minutos; cualquier GPU con al menos 2 GB es suficiente.
- Compatible con GPUs de consumo: sí, incluyendo tarjetas integradas o incluso Raspberry Pi (con limitaciones de velocidad).
- Opciones de despliegue: transformers con `trust_remote_code=True`; también puede cargarse con llama.cpp si se convierte a GGUF, aunque no hay cuantizaciones oficiales.
- Latencia: despreciable (menos de 1 ms por token en hardware moderno); throughput limitado solo por la velocidad de la CPU/GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | Contexto | Elo BananaMind | Licencia |
|---|---|---|---|---|---|
| Vantora-Micro | Transformer puro | 9.800 | 256 | 810 | MIT |
| Vantora-Micro-Hybrid | HybridLM (SSM+attn) | 11.256 | 256 | 863 | MIT |
| Otros modelos sub-10K | No disponible | - | - | - | - |

No se dispone de información sobre otros modelos de la misma escala (sub-10K parámetros) con benchmarks comparables. La comparación directa con Vantora-Micro es la única disponible y muestra la ventaja de la arquitectura híbrida.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: no es apto para tareas de producción; su precisión (30,29%) apenas supera el azar aleatorio de 4 opciones (25%).
- Contexto muy limitado: 256 tokens, insuficiente para conversaciones largas o documentos extensos.
- Vocabulario reducido (1024 tokens BPE) que limita la riqueza léxica y la capacidad de representar palabras poco frecuentes.
- Solo inglés: no soporta otros idiomas.
- Riesgo de alucinación alto: al ser un modelo base sin fine-tuning instructivo, puede generar texto incoherente o factualmente incorrecto.
- Sesgos: entrenado exclusivamente con FineWeb-Edu, un subconjunto filtrado de web, lo que puede introducir sesgos de contenido educativo en inglés.
- Dependencia de código custom: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado por HuggingFace.
- Discrepancia en el número de parámetros: la model card indica 11.256, pero el campo de HuggingFace muestra 21.512; se recomienda verificar antes de usar.
- Licencia MIT permite uso comercial, pero el modelo no tiene valor práctico para producción.

## Enlaces

- HuggingFace: https://huggingface.co/VantoraLabs/Vantora-Micro-Hybrid
- Modelo base (Vantora-Micro): https://huggingface.co/VantoraLabs/Vantora-Micro
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
