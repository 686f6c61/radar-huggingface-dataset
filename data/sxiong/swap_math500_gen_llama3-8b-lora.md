# sxiong/SWAP_MATH500_Gen_Llama3-8B-LoRA

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por sxiong, que se basa en el modelo Meta-Llama-3-8B-Instruct. Su función es actuar como generador de soluciones para problemas matemáticos, específicamente entrenado con el dataset SWAP y evaluado sobre MATH500. El adaptador está diseñado para ser utilizado dentro del framework SWAP (Structure-aware Planning), que busca mejorar el razonamiento deliberado en modelos de lenguaje mediante planificación estructurada y un modelo del mundo preciso. El adaptador tiene un tamaño de 0.2 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

La relevancia de este modelo radica en que proporciona una forma eficiente de adaptar un modelo de 8 mil millones de parámetros a tareas de razonamiento matemático sin necesidad de entrenar todos los parámetros, gracias a la técnica LoRA. Además, al ser un adaptador ligero, se puede integrar fácilmente en pipelines existentes con el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8.030 millones (modelo base) + adaptador LoRA (no especificado, el adaptador pesa 0.2 GB) |
| Parametros activos | No aplica (no es MoE; todos los parámetros del modelo base están activos, el adaptador añade parámetros entrenables) |
| Longitud de contexto | 8.192 tokens (contexto nativo de Llama-3-8B) |
| Tipos de cuantizacion | No especificado (el adaptador está en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

El adaptador LoRA tiene rank 16, alpha 16, bias "none" y target modules: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.

## Arquitectura y entrenamiento

El modelo base es Llama-3-8B-Instruct, un transformer autoregresivo con 8 mil millones de parámetros y una ventana de contexto de 8.192 tokens. Sobre este modelo se aplica un adaptador LoRA de rango 16 y alpha 16, que modifica las proyecciones de atención y las capas de feed-forward (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento se realizó con el dataset SWAP, un dataset de razonamiento estructurado, y se evaluó en MATH500, un subconjunto de problemas matemáticos. El adaptador actúa como generador dentro del framework SWAP, que propone un enfoque de razonamiento deliberado basado en planificación consciente de la estructura y un modelo del mundo preciso. No se especifican detalles sobre el número de tokens de entrenamiento ni el uso de RLHF/DPO. La técnica LoRA permite un ajuste eficiente con pocos parámetros entrenables.

## Capacidades

- Generación de soluciones matemáticas: el adaptador está especializado en producir respuestas a problemas de matemáticas del dataset MATH500.
- Razonamiento estructurado: al estar entrenado con SWAP, puede generar pasos de razonamiento intermedios que siguen una estructura planificada.
- Integración con el framework SWAP: funciona como componente generador en un sistema más amplio que probablemente incluye verificación y planificación.
- Multilingüe: limitado al inglés, ya que es el idioma del dataset y del modelo base.
- No soporta tool calling ni agentes de forma nativa; es un adaptador de generación de texto.

## Casos de uso

- Investigación en razonamiento matemático: los investigadores pueden utilizar este adaptador para estudiar cómo los modelos de lenguaje generan soluciones paso a paso en problemas de matemáticas, comparando con el modelo base.
- Mejora de modelos de razonamiento: como componente del framework SWAP, puede integrarse en sistemas que requieran generación de soluciones candidatas para luego ser verificadas.
- Prototipado rápido: gracias a su tamaño reducido y licencia MIT, es fácil de desplegar en entornos de desarrollo para experimentar con técnicas de adaptación eficiente.
- Evaluación de datos: puede usarse para generar respuestas sintéticas en el dominio matemático que sirvan como datos de entrenamiento para otros modelos.
- Educación y tutoría: aunque no es su propósito principal, podría generar explicaciones de problemas matemáticos, aunque requiere supervisión por su posible falta de exactitud.
- Benchmarking de adaptadores: sirve como ejemplo de adaptación LoRA para tareas específicas, permitiendo comparar con otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el paper asociado (Xiong et al., 2025) para posibles evaluaciones.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.2 GB, pero requiere el modelo base Llama-3-8B-Instruct para funcionar.
- El modelo base en precisión fp16 requiere aproximadamente 16 GB de VRAM. En cuantización de 4 bits (por ejemplo, con bitsandbytes) puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o GPUs con al menos 8 GB para cuantización 4-bit.
- Opciones de despliegue: se puede usar con Hugging Face Transformers y PEFT, así como con vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF) u Ollama (con conversión).
- Latencia: no especificada, pero al ser un modelo de 8B, la generación suele ser de unos 20-50 tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| sxiong/SWAP_MATH500_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | 8B + LoRA | 8k | MIT | Generación matemática |
| sxiong/SWAP_v2_MATH_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | 8B + LoRA | 8k | MIT | Generación matemática (v2) |
| Meta-Llama-3-8B-Instruct | - | 8B | 8k | Llama 3 Community License | Chat e instrucciones |

No se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en problemas matemáticos del dataset MATH500; su rendimiento en otros dominios puede ser limitado.
- No se han publicado estudios de sesgos; al estar basado en Llama-3, podría heredar sesgos del modelo base.
- Riesgo de alucinación en razonamiento matemático: puede generar pasos incorrectos o inventados.
- Solo soporta inglés; no es adecuado para otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo base Llama-3 tiene su propia licencia (Llama 3 Community License) que puede tener restricciones adicionales.
- Para producción, se recomienda verificar las respuestas generadas, especialmente en contextos de alta precisión.

## Enlaces

- HuggingFace: https://huggingface.co/sxiong/SWAP_MATH500_Gen_Llama3-8B-LoRA
- Dataset SWAP: https://huggingface.co/datasets/sxiong/SWAP
- Dataset MATH500: https://huggingface.co/datasets/sxiong/MATH-500
- Repositorio GitHub SWAP: https://github.com/xiongsiheng/SWAP
- Paper (ACL 2025): Xiong, S., Payani, A., Yang, Y., & Fekri, F. (2025). Deliberate reasoning in language models as structure-aware planning with an accurate world model. Proceedings of ACL.
- Versión v2 del adaptador: https://huggingface.co/sxiong/SWAP_v2_MATH_Gen_Llama3-8B-LoRA
