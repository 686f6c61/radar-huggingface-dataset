# tyrant35/zils-lite-probe-hs

## Resumen

zils-lite-probe-hs es un modelo de decisión derivado de joamCriff123/zils-lite-l1117a, un "soup-pool body" de la familia Zils en su variante d3-lite. El autor, tyrant35, lo publica como experimento para medir cómo responde el banco de rondas d3-lite a un ajuste fino supervisado sobre HellaSwag. No es un modelo de propósito general ni se presenta como una mejora del modelo base: la propia model card indica que "no se espera que supere al soup".

El modelo parte del cuerpo base y aplica un fine-tune LoRA de rango 32 con learning rate 1e-4 sobre el split de entrenamiento de HellaSwag (6.000 filas con etiquetas gold), combinado con las probabilidades de respuesta del propio soup sobre 6.000 prompts de decisión públicos para preservar su comportamiento previo. Posteriormente se aplica una extrapolación de tareas: soup + 3 × (fine-tune − soup), una técnica de merging que amplifica la dirección del cambio introducido por el ajuste.

Con 852.985.920 parámetros (aproximadamente 853 M) y un repositorio de 1,7 GB en safetensors, se trata de un modelo pequeño orientado a evaluación de decisiones de opción múltiple, no a generación abierta. Su relevancia es metodológica: documenta un protocolo de probing sobre un cuerpo concreto y publica los pesos resultantes bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de zils-lite-l1117a; familia Zils d3-lite) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del cuerpo base zils-lite-l1117a más allá de su denominación como "soup-pool body" de la variante d3-lite. El proceso de construcción sí está documentado: se parte del cuerpo soup actual y se entrena un LoRA de rango 32 con learning rate 1e-4 sobre el split de entrenamiento de HellaSwag, compuesto por 6.000 filas con etiquetas gold. Para evitar la degradación del comportamiento original, el entrenamiento incorpora además las probabilidades de respuesta del propio soup sobre 6.000 prompts de decisión públicos, actuando como señal de retención.

Sobre el adaptador resultante se aplica una extrapolación de tareas en el espacio de pesos: soup + 3 × (fine-tune − soup), es decir, se amplifica por un factor de tres la dirección del cambio introducido por el ajuste fino respecto al modelo base. No se utilizó ningún split de test ni de validación durante el entrenamiento, lo que limita cualquier afirmación sobre generalización. No se documentan detalles sobre el dataset de preentrenamiento del cuerpo base, el número total de tokens vistos, ni si hubo fases de RLHF o DPO.

## Capacidades

- Evaluación de decisiones de opción múltiple: el modelo está entrenado específicamente sobre HellaSwag, una tarea de continuación de escenas con cuatro opciones, por lo que su función principal es puntuar o seleccionar respuestas entre alternativas.
- Clasificación de prompts de decisión: la model card menciona 6.000 "public decision prompts" usados como señal de retención, lo que sugiere capacidad para emitir probabilidades sobre opciones en formatos de decisión estructurados.
- Retención del comportamiento del soup: el entrenamiento combinado busca preservar las respuestas del modelo base en prompts de decisión ajenos a HellaSwag.
- Generación de texto abierta: no documentada; el pipeline no está disponible y el modelo se presenta como decision-model, no como modelo generativo de propósito general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre merging de modelos: el modelo sirve como artefacto de estudio para analizar cómo responde un cuerpo concreto (d3-lite) a la extrapolación de tareas soup + 3 × (fine-tune − soup), comparando su comportamiento con el soup original en el mismo banco de prompts.
- Evaluación de retención de comportamiento: al haberse entrenado con las probabilidades del soup sobre 6.000 prompts de decisión, permite medir empíricamente cuánto del comportamiento original se conserva tras un fine-tune LoRA y una extrapolación agresiva.
- Reproducción de protocolos de probing: investigadores que quieran replicar el pipeline (LoRA rango 32, lr 1e-4, HellaSwag train, mezcla con probabilidades del base) pueden usar estos pesos como referencia publicada.
- Análisis de sobreajuste en tareas de decisión: al no haberse usado split de validación, el modelo es útil para estudiar cómo se comporta un ajuste fino sin control de generalización en una tarea de opción múltiple concreta.
- Baseline para experimentos de destilación o merging: al ser un modelo pequeño (853 M parámetros, 1,7 GB en safetensors), puede servir como punto de partida de bajo coste computacional en experimentos de combinación de pesos.
- Docencia y divulgación sobre técnicas de model soup y task arithmetic: el modelo ilustra de forma concreta la mecánica de la extrapolación de tareas en el espacio de parámetros con un caso real y pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de HellaSwag, MMLU ni de ningún otro conjunto de evaluación, y advierte explícitamente de que no se espera que el modelo supere al soup del que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB solo para pesos (853 M × 4 bytes), más overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, más overhead; viable en GPUs consumer con 6-8 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamaño; para lotes grandes o evaluación masiva sobre HellaSwag, una A100 o H100 aporta margen de throughput.
- Cabe en GPU consumer: sí, con amplia holgura en fp16 y en cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: al publicarse únicamente en safetensors y sin pipeline declarado, el despliegue requeriría cargar los pesos con transformers u otra librería compatible; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y no se han publicado conversiones GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-probe-hs | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, safetensors | Derivado por extrapolación de joamCriff123/zils-lite-l1117a; orientado a decisión |
| joamCriff123/zils-lite-l1117a (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Soup d3-lite original; referencia directa del experimento |
| Alternativas de tamaño similar (aprox. 1 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en términos de rendimiento, ya que no se han publicado benchmarks del modelo ni del base.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es un experimento y no se espera que supere al soup del que deriva; no debe tratarse como una mejora de producción.
- No se utilizó split de test ni de validación durante el entrenamiento, por lo que no existe evidencia publicada de generalización más allá de los datos de entrenamiento.
- El ajuste fino se realizó exclusivamente sobre HellaSwag (6.000 filas), lo que puede inducir sobreajuste a ese formato de tarea y degradar el comportamiento en otros tipos de decisión.
- La extrapolación con factor 3 amplifica la dirección del cambio y puede exagerar artefactos del fine-tune, incluyendo respuestas atípicas o sobreconfianza en las opciones.
- No se declaran idiomas soportados; se desconoce el comportamiento multilingüe.
- No hay información sobre sesgos, datos de preentrenamiento ni composición del corpus del modelo base, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación no evaluado; al ser un modelo de decisión y no un generador abierto, el riesgo se manifiesta como selección errónea de opciones más que como texto inventado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación hace desaconsejable su uso en producción sin evaluación propia.
- El pipeline no está declarado y no se publican cuantizaciones, lo que complica el despliegue en entornos con restricciones de memoria o en runtimes como Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-probe-hs
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
