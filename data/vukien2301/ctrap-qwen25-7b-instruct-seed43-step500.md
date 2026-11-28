# vukien2301/ctrap-qwen25-7b-instruct-seed43-step500

## Resumen

CTRAP Qwen2.5-7B-Instruct (seed 43, step 500) es un checkpoint de investigación publicado por el usuario vukien2301 sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Se trata de una defensa de línea base denominada CTRAP frente al *harmful fine-tuning*, es decir, el fenómeno por el cual un modelo alineado puede perder sus salvaguardas cuando se le aplica un ajuste fino con datos maliciosos. El checkpoint se entrenó durante 500 pasos con semilla 43 y se generó con el script `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, como parte de la comparativa de líneas base de dicho trabajo.

El modelo conserva la arquitectura del Qwen2.5-7B-Instruct original: un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), con el tokenizador y la ventana de contexto heredados del base. El repositorio ocupa 15,3 GB en formato safetensors y es compatible con la librería transformers y con text-generation-inference. No se trata de un modelo de propósito general ni de un modelo certificado en seguridad: es un artefacto de investigación cuyo interés radica en estudiar si las defensas frente al fine-tuning malicioso funcionan y a qué coste.

Su relevancia es acotada pero específica: permite reproducir y comparar la defensa CTRAP con otras aproximaciones dentro del mismo estudio, y sirve como referencia para investigadores que trabajen en robustez de modelos alineados frente a ataques de ajuste fino. Al estar entrenado solo 500 pasos, representa un punto intermedio de entrenamiento, no un modelo final pulido. La model card advierte explícitamente de que no es un modelo con certificación de seguridad y de que su uso y licencia siguen los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning del base Qwen2.5-7B-Instruct |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-7B-Instruct, no confirmada en la información proporcionada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica que sigue la del base Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 15,3 GB |
| Pasos de entrenamiento | 500 |
| Semilla | 43 |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros con atención causal estándar y tokenizador BPE propio de la familia Qwen2.5. El checkpoint publicado no modifica la topología: es un ajuste fino completo (o parcial, no se especifica en la información disponible) sobre los pesos del base, por lo que conserva la forma de los tensores y el tamaño de vocabulario originales.

El entrenamiento consiste en la defensa CTRAP aplicada durante 500 pasos con semilla 43, ejecutada mediante `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens vistos, la tasa de aprendizaje, el esquema de optimización ni si hubo etapas de RLHF o DPO posteriores. Tampoco se especifica qué variante exacta de CTRAP se aplicó ni sus hiperparámetros. El checkpoint representa, por tanto, un punto intermedio de un pipeline de investigación cuyo objetivo es evaluar la resistencia del modelo frente a fine-tuning malicioso, no un modelo final optimizado para uso general.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, en línea con un modelo de 7B de la familia Qwen2.5.
- Generación de código y matemáticas, como capacidad heredada del base (no verificada específicamente en este checkpoint).
- Soporte de tool calling y function calling, presumiblemente heredado del base; no confirmado en la información disponible para este checkpoint.
- Capacidades multilingües heredadas del base; los idiomas concretos no están disponibles en la información proporcionada.
- Modo de defensa frente a harmful fine-tuning: el checkpoint está entrenado específicamente para resistir la pérdida de alineamiento bajo ajuste fino malicioso, que es su rasgo diferencial.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Investigación en robustez de alineamiento: usar el checkpoint como línea base CTRAP en experimentos que comparan defensas frente a harmful fine-tuning, replicando el protocolo del artículo con semilla 43 y 500 pasos.
- Evaluación de ataques de fine-tuning malicioso: someter el modelo a datasets dañinos y medir la degradación de sus salvaguardas frente a otros checkpoints del mismo estudio, para cuantificar la eficacia de la defensa.
- Reproducibilidad de experimentos: al estar generado con `baselines/run_all.py` y una semilla fija, permite reproducir resultados del artículo y auditar la metodología del pipeline de entrenamiento.
- Estudio de la geometría de barreras colaterales: analizar cómo evolucionan las representaciones internas del modelo tras 500 pasos de defensa, en el marco del artículo *No Cheap Escape*.
- Comparación de costes de defensa: medir el compromiso entre utilidad (rendimiento en tareas benignas) y robustez (resistencia al fine-tuning dañino) frente a otras defensas del mismo repositorio.
- Docencia y divulgación: ilustrar en cursos o tutoriales cómo se construye un checkpoint de defensa y qué limitaciones tiene un modelo de investigación no certificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos; requiere cuantización propia, ya que no se publican versiones GGUF o AWQ en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 o A10G para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 24 GB o más en fp16 (RTX 3090, 4090) y en tarjetas de 8-12 GB con cuantización de 4-8 bits, siempre que se genere la cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTRAP Qwen2.5-7B-Instruct (seed 43, step 500) | 7,6 B | no disponible | Defensa frente a harmful fine-tuning (investigación) | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta ficha | Modelo instructivo de propósito general | Qwen (según modelo base) | Hugging Face, ampliamente utilizado |
| Otras defensas del estudio *No Cheap Escape* | no disponible | no disponible | Líneas base de defensa frente a harmful fine-tuning | no disponible | Repositorio del artículo |

La comparación directa con alternativas de la misma categoría (defensas frente a harmful fine-tuning) no está disponible en la información proporcionada, ya que no se detallan los demás checkpoints del estudio ni sus métricas.

## Limitaciones y advertencias

- No es un modelo con certificación de seguridad: la propia model card lo califica como checkpoint de investigación.
- Entrenado solo 500 pasos: representa un punto intermedio, no un modelo final; su comportamiento puede ser inestable o incompleto.
- Riesgo de alucinación y sesgos heredados del base Qwen2.5-7B-Instruct, no evaluados ni mitigados específicamente en este checkpoint.
- Licencia no disponible de forma explícita: el uso comercial queda sujeto a los términos del modelo base Qwen/Qwen2.5-7B-Instruct, que deben verificarse antes de cualquier despliegue.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del base.
- Longitud de contexto no confirmada en la información proporcionada; conviene verificar la configuración del tokenizador y del modelo antes de usarlo con entradas largas.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de su comportamiento en producción.
- Adecuado únicamente para investigación en robustez y alineamiento; no recomendado como modelo de producción para atención al cliente, generación de código u otras tareas sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/ctrap-qwen25-7b-instruct-seed43-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*: no disponible en la información proporcionada (se cita el script `baselines/run_all.py`, pero no se incluye la URL)
