# YMmim/qwen2.5-0.5b-robot-cot-lora

## Resumen

El modelo `YMmim/qwen2.5-0.5b-robot-cot-lora` es un adaptador LoRA que fine-tunea el modelo base `Qwen/Qwen2.5-0.5B` para generar cadenas de razonamiento (chain-of-thought, CoT) en coreano para procesos de fabricación robótica. Ha sido desarrollado por el usuario YMmim a partir del dataset público AI Hub «제조 공정 자동화 구현 로봇 티칭 데이터» (datos de enseñanza de robots para automatización de procesos de fabricación), con el objetivo de que el modelo reciba una instrucción y un entorno de proceso y genere la secuencia de pasos de razonamiento y acciones del robot.

Se trata de una versión de validación (v1) de un pipeline de fine-tuning, no de un modelo listo para producción. El autor advierte explícitamente que la calidad de generación es limitada: el modelo base es pequeño (0.5B de parámetros), el dataset de entrenamiento es reducido (aproximadamente 1.179 muestras) y el entrenamiento se truncó a una longitud máxima de 1.024 tokens, lo que provoca que las partes concretas de las cadenas de razonamiento (acciones específicas y coordenadas) se hayan perdido durante el aprendizaje. El resultado es un modelo que ha aprendido la forma del CoT, pero no su contenido preciso.

La relevancia de este modelo es principalmente didáctica y de validación: demuestra cómo aplicar LoRA sobre un modelo pequeño y de bajo coste (entrenado en una RTX 3060 de 6 GB) para una tarea vertical específica, aunque el propio autor recomienda usar modelos más grandes y entrenar con longitud completa en la nube para aplicaciones prácticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen2.5-0.5B) con adaptador LoRA |
| Parametros totales | Adaptador LoRA: no disponible (r=8, alpha=16, solo q_proj y v_proj); base: 0.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento truncado a 1.024 tokens; el base Qwen2.5-0.5B soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (adaptador LoRA, sin cuantización propia) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen2.5-0.5B`, un transformer causal de 0.5B de parámetros de la familia Qwen2.5 de Alibaba Cloud. El adaptador se aplica únicamente a las proyecciones de atención `q_proj` y `v_proj`, con rango r=8 y alpha=16. El entrenamiento se realizó durante 3 épocas con batch size 1 (con acumulación de gradientes de 8), learning rate 2e-4, precisión fp16 y una longitud máxima de 1.024 tokens, en una GPU RTX 3060 de 6 GB.

El dataset de entrenamiento proviene de AI Hub, concretamente del conjunto «제조 공정 자동화 구현 로봇 티칭 데이터» (datos de enseñanza de robots para automatización de procesos de fabricación), con aproximadamente 1.179 muestras que consisten en pares de instrucción + entorno de proceso y la correspondiente cadena de razonamiento del robot. No se menciona el uso de técnicas de RLHF o DPO; se trata de un fine-tuning supervisado estándar (SFT) con LoRA. La licencia del dataset restringe el uso a fines no comerciales.

## Capacidades

- Generación de cadenas de razonamiento (chain-of-thought) en coreano para procesos de fabricación robótica, con formato de pasos de razonamiento y acciones del robot.
- Recibe como entrada una instrucción de proceso junto con el entorno de fabricación y produce una secuencia de razonamiento y acciones.
- Capacidad limitada de generación de texto en coreano heredada del modelo base Qwen2.5-0.5B.
- No dispone de soporte de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multimodales (visión, audio, etc.).
- El autor advierte que la calidad del contenido generado es baja: el modelo ha aprendido la forma del CoT pero no la precisión de las acciones ni coordenadas.

## Casos de uso

- **Validación de pipelines de fine-tuning LoRA**: el modelo sirve como demostración técnica de cómo adaptar un modelo pequeño a una tarea específica con un presupuesto mínimo de hardware, útil para desarrolladores que quieran validar su infraestructura de entrenamiento.
- **Generación de datos sintéticos para prototipado**: aunque la calidad es baja, puede utilizarse para generar borradores de CoT que posteriormente sean revisados y corregidos manualmente por un ingeniero, agilizando el etiquetado inicial de datasets.
- **Pruebas de concepto en robótica educativa**: en entornos académicos o de investigación, se puede emplear para explorar cómo los modelos de lenguaje generan razonamientos para procesos de fabricación simples, sin requisitos de producción.
- **Benchmarking de modelos pequeños**: sirve como referencia para comparar el rendimiento de adaptadores LoRA sobre modelos de 0.5B frente a modelos más grandes en tareas de CoT específicas.
- **Estudio de las limitaciones de contexto**: el entrenamiento truncado a 1.024 tokens permite analizar cómo la pérdida de contexto largo afecta a la calidad de generación de CoT, un caso de estudio útil para investigadores.
- **Integración en sistemas de demostración**: se puede integrar en demos interactivas o entornos de desarrollo para mostrar el flujo completo de carga de un adaptador PEFT con Transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas cuantitativas (como exactitud, BLEU o F1) sobre el rendimiento del modelo en la generación de CoT. La evaluación se limita a una descripción cualitativa: el modelo aprende el formato pero no la precisión del contenido.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja, dado que el adaptador LoRA añade una cantidad mínima de parámetros sobre un modelo base de 0.5B. En FP16, el modelo base ocupa aproximadamente 1 GB de VRAM, por lo que cabe en cualquier GPU consumer actual (incluso con 4 GB).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660 Super, etc.). El entrenamiento se realizó en una RTX 3060 de 6 GB.
- **Cabe en consumer GPU**: sí, sin problema.
- **Opciones de despliegue**: al ser un adaptador LoRA, se carga con la librería PEFT sobre el modelo base `Qwen/Qwen2.5-0.5B` usando Transformers. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, aunque el modelo base sí es compatible con estos frameworks; el adaptador LoRA requiere conversión o soporte específico.
- **Latencia y throughput**: no disponibles, pero dada la pequeña tamaño del modelo, la inferencia es muy rápida incluso en CPU (aunque se recomienda GPU para FP16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `YMmim/qwen2.5-0.5b-robot-cot-lora` (este) | 0.5B base + LoRA | 1.024 (entrenamiento) / 32.768 (base) | Coreano | Apache-2.0 | HuggingFace |
| `Qwen/Qwen2.5-0.5B` (modelo base sin fine-tuning) | 0.5B | 32.768 | Multilingüe | Apache-2.0 | HuggingFace |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0.5B | 32.768 | Multilingüe | Apache-2.0 | HuggingFace |
| `SoloCalm/MiniLoRA` (LoRA de Qwen2.5-0.5B para medicina) | 0.5B + LoRA | 1.024 (entrenamiento) | Chino | Apache-2.0 | HuggingFace |

No existe un modelo comparable exacto en la categoría de CoT para robótica de fabricación con esta misma arquitectura y tamaño. La comparativa más directa es con el modelo base Qwen2.5-0.5B, que no está adaptado a la tarea, y con el modelo Qwen2.5-0.5B-Instruct, que está alineado para instrucciones generales. Ambos servirían como baseline para medir la mejora del adaptador, aunque el autor no ha publicado tales comparaciones.

## Limitaciones y advertencias

- **Calidad de generación limitada**: el propio autor advierte que la generación de CoT tiene baja precisión; el modelo aprende la forma del formato pero no el contenido correcto (acciones y coordenadas concretas).
- **Dataset pequeño y truncado**: el entrenamiento con solo 1.179 muestras y longitud máxima de 1.024 tokens provoca que las partes largas de las cadenas de razonamiento no se aprendan correctamente.
- **Modelo base pequeño**: la arquitectura de 0.5B limita la capacidad de razonamiento complejo, por lo que no es adecuado para tareas de producción.
- **Sesgo lingüístico**: el modelo está entrenado exclusivamente en coreano; no se espera un buen comportamiento en otros idiomas.
- **Restricciones de licencia de los datos**: el dataset de AI Hub tiene restricciones de uso no comercial, lo que limita la utilización del modelo en aplicaciones comerciales.
- **Riesgo de alucinación**: al ser un modelo pequeño y con datos limitados, el riesgo de alucinar acciones o pasos de razonamiento incorrectos es alto.
- **No apto para producción**: el autor lo califica como «versión de validación» y recomienda usar modelos más grandes y entrenamiento con longitud completa para aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YMmim/qwen2.5-0.5b-robot-cot-lora
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v2
- Repositorio de MiniLoRA (ejemplo similar de LoRA sobre Qwen2.5-0.5B): https://github.com/SoloCalm/MiniLoRA
- Repositorio de Qwen2.5-Omni (referencia de la familia Qwen): https://github.com/QwenLM/Qwen2.5-Omni
