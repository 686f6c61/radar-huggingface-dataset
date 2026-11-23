# theSOL1/qwen3-8b-pushback-sft

## Resumen

`theSOL1/qwen3-8b-pushback-sft` es un adaptador LoRA de rango 16 entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen3-8B de Alibaba. Lo publica el usuario theSOL1 como artefacto de un experimento académico sobre *instruction following* y "pushback" conversacional: el fenómeno en el que un usuario cuestiona o contradice una respuesta previa del modelo y este debe decidir si mantiene la instrucción original o cede ante la presión. El adaptador se entrenó sobre juicios de cumplimiento de restricciones con etiquetas balanceadas dentro de cada tipo de restricción.

No es un modelo de propósito general ni un chat listo para producción: es un adaptador de investigación que requiere cargar el Qwen3-8B base por separado. Su relevancia es metodológica, no de rendimiento bruto, ya que documenta un protocolo de evaluación IFEval con presión conversacional y un experimento de robustez frente a reformulaciones del enunciado (*held-out wording*). El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en safetensors.

El modelo base Qwen3-8B es un transformer denso de 8.000 millones de parámetros con licencia Apache 2.0; el adaptador hereda esa licencia según indica el autor, aunque el campo de licencia del repositorio en Hugging Face aparece como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer denso Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | no disponible en el repositorio; el autor indica Apache 2.0 heredada del base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA con rango 16 aplicado sobre `Qwen/Qwen3-8B` (revisión `b968826d9c46dd6066d109eabc6255188de91218`). No se modifican los pesos del modelo base: se añaden matrices de bajo rango que se combinan en tiempo de inferencia. El adaptador se entrenó con SFT sobre una tarea de juicio de restricciones de instrucción, con etiquetas balanceadas por tipo de restricción para evitar sesgos de clase en la evaluación.

El contexto experimental es doble: por un lado, una evaluación IFEval con *pushback* conversacional, donde el modelo debe sostener el cumplimiento de una restricción cuando el usuario lo cuestiona; por otro, un brazo de comparación SFT en un experimento de reformulación (*held-out wording*) que mide la sensibilidad del juicio a cambios en la redacción del enunciado. La evaluación empleó la plantilla de chat de Qwen3 con `enable_thinking=False`, es decir, sin modo de razonamiento explícito. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto y juicio de cumplimiento de instrucciones en inglés.
- Evaluación de restricciones de instrucción (formato, longitud, palabras clave, estructura) en el marco de IFEval.
- Robustez ante *pushback* conversacional: mantener o revisar una decisión bajo contradicción del usuario.
- Sensibilidad controlada a reformulaciones del enunciado, medida en el experimento de *held-out wording*.
- Integración estándar con PEFT y Transformers para cargar el adaptador junto al base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking activo en este adaptador.

## Casos de uso

- Investigación en *instruction following*: reproducir el protocolo IFEval con pushback para medir la tasa de cesión del modelo ante contradicciones del usuario, usando el adaptador como brazo SFT de referencia.
- Evaluación de robustez de redacción: comparar el juicio del adaptador frente a paráfrasis del mismo enunciado y cuantificar la varianza introducida por la formulación.
- Estudio de alineación y sycophancy: analizar si el modelo mantiene restricciones cuando el usuario insiste en lo contrario, un proxy útil para detectar comportamiento adulador.
- Construcción de benchmarks internos: servir como punto de partida para diseñar suites de evaluación de cumplimiento de restricciones en pipelines de QA de modelos.
- Análisis de adaptadores LoRA: estudiar el efecto de un SFT de rango 16 y dataset balanceado sobre un base de 8B, comparando con el base sin adaptador.
- Docencia y reproducción académica: el repositorio enlaza configuración y pasos de reproducción, lo que facilita replicar el experimento en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el adaptador se usó en una evaluación IFEval con pushback y en un experimento de *held-out wording*, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia tarea.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el coste real lo determina el Qwen3-8B base.
- Inferencia en FP16/BF16 del base: aproximadamente 16 GB de VRAM para pesos, más overhead de contexto y KV cache.
- Cuantización de 8 bits: en torno a 8-9 GB de VRAM; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 y GPUs de 12-16 GB viables con cuantización.
- Despliegue: Transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, previa conversión; llama.cpp/Ollama requieren fusionar el adaptador con el base antes de convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theSOL1/qwen3-8b-pushback-sft | LoRA r16 sobre 8B | no disponible | Adaptador de investigación | Apache 2.0 (heredada, según autor) | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8B | no disponible | Modelo denso completo | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA de instruction following genéricos | variable | depende del base | Adaptador | variable | Hugging Face |

La comparación relevante es contra el propio Qwen3-8B sin adaptador: este artefacto no busca superar al base en capacidad general, sino aislar el efecto de un SFT específico sobre el juicio de restricciones. Frente a otros adaptadores LoRA de instruction following, la diferencia es el protocolo de evaluación con pushback y el balanceo de etiquetas por tipo de restricción.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado como modelo de producción ni como asistente general.
- Solo inglés; no se documenta soporte multilingüe.
- Requiere cargar el Qwen3-8B base por separado y con la revisión exacta indicada para reproducir resultados.
- El campo de licencia del repositorio aparece como no disponible; el autor afirma que se hereda Apache 2.0 del base, pero conviene verificar antes de uso comercial.
- Sin datos publicados de benchmarks: no es posible estimar su rendimiento absoluto ni compararlo cuantitativamente.
- Riesgo de alucinación y de sesgos heredados del base Qwen3-8B, no evaluado en la información disponible.
- El entrenamiento con etiquetas balanceadas puede no reflejar la distribución real de restricciones en tráfico de producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria independiente.
- La evaluación se hizo con `enable_thinking=False`; el comportamiento con modo thinking activo no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/theSOL1/qwen3-8b-pushback-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Configuración del experimento y reproducción: https://github.com/SOL1archive/AI-capstone/blob/72a8848/docs/wording-benchmark.md
- SHA-256 del adaptador: `ac052bd5f0b17035a161f4c0b80ef0e9a235edd238f0299becad805c69be9db9`
