# uniqueplayer9102/Martos-Preview

## Resumen

Martos-Preview es un modelo de lenguaje de aproximadamente 2,07 mil millones de parámetros desarrollado por el usuario uniqueplayer9102 como experimento de fine-tuning orientado a roleplay y escritura creativa conversacional. Se construye a partir de Qwen/Qwen3-1.7B mediante una técnica de expansión de bloques inspirada en LLaMA Pro: en lugar de reentrenar todos los pesos del modelo base, se clonan siete bloques transformer y se insertan en la red, congelando el modelo original y entrenando únicamente las proyecciones de los bloques nuevos.

El resultado es un transformer denso de 35 capas (frente a las 28 del base) con 2.072.926.976 parámetros. La expansión se valida mediante una comprobación de identidad: las proyecciones de salida de atención y de bajada del MLP de cada bloque clonado se inicializan a cero, de modo que el modelo expandido es funcionalmente equivalente al original antes del entrenamiento. El modelo se publica como un checkpoint Transformers FP16 fusionado, sin necesidad de código personalizado para inferencia.

Es relevante como caso práctico de la técnica de block expansion aplicada a un modelo pequeño y como ejemplo de fine-tuning orientado a personajes con recursos muy limitados (una única GPU Tesla T4). El autor lo etiqueta explícitamente como "Preview" por su carácter experimental y no por la existencia de checkpoints posteriores de esta misma ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con 35 capas tras expansión de bloques estilo LLaMA Pro |
| Parámetros totales | 2.072.926.976 (~2,07B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (ventana de entrenamiento; el modelo base Qwen3-1.7B soporta contextos mayores, pero no se especifica el contexto efectivo tras el fine-tuning) |
| Tipos de cuantización | No disponible (el repo publica pesos en FP16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers, FP16 fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 28 capas. Sobre él se aplica una expansión de bloques inspirada en LLaMA Pro: se clona un bloque transformer después de cada una de las capas `[3, 7, 11, 15, 19, 23, 27]`, dando lugar a 35 capas. Las proyecciones de salida de atención y de bajada del MLP de cada clon se inicializan a cero, de forma que las ramas nuevas no contribuyen inicialmente al flujo residual y el modelo expandido reproduce los logits del original dentro de la tolerancia numérica FP16. Antes de entrenar se ejecuta una comprobación de identidad que rechaza la construcción si la diferencia máxima de logits excede la tolerancia.

Durante el entrenamiento se congela el modelo original y se entrenan directamente las matrices de proyección de los siete bloques insertados, sin módulos LoRA ni adaptadores: aproximadamente 352M parámetros entrenables. La ventana de entrenamiento es de 4.096 tokens y la pérdida se calcula únicamente sobre los tokens del asistente. El schedule comprende 1.400 pasos con AdamW de 8 bits, learning rate 2e-4, 50 pasos de warmup y acumulación de gradiente de 16, ejecutado en una sola GPU Tesla T4. Al finalizar, los bloques entrenados se fusionan en un modelo Qwen3 estándar de 35 capas.

## Capacidades

- Generación de texto conversacional y creativo, con especialización en roleplay e interpretación de personajes mediante character cards en el mensaje de sistema.
- Mantenimiento de personajes consistentes a lo largo de conversaciones multi-turno, incluyendo formato de acciones narrativas entre asteriscos.
- Escritura creativa y narrativa inmersiva en inglés.
- Soporte del chat template estándar de Qwen3, con la opción `enable_thinking=False` para respuestas directas en personaje.
- Hereda la tokenización y el formato conversacional de Qwen3-1.7B.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades especiales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Roleplay conversacional con personajes definidos: el modelo acepta una character card en el mensaje de sistema (identidad, personalidad, forma de hablar, escenario) y mantiene la coherencia del personaje en turnos alternos de usuario y asistente. Es su caso de uso principal y el objetivo declarado del entrenamiento.
- Prototipado de chatbots de personaje para juegos o experiencias interactivas: al ser un modelo de ~2B en FP16, puede desplegarse en hardware modesto para iterar rápidamente sobre cartas de personaje y ajustar tono y comportamiento antes de escalar a un modelo mayor.
- Escritura creativa asistida: generación de diálogos y escenas narrativas con formato de acciones entre asteriscos, útil para guionización o ficción interactiva.
- Investigación sobre block expansion: sirve como referencia reproducible de la técnica LLaMA Pro aplicada a Qwen3, con un pipeline documentado (clonado de bloques, inicialización a cero, verificación de identidad, congelación del base y entrenamiento solo de proyecciones).
- Experimentación educativa con fine-tuning en hardware consumer: el entrenamiento completo cabe en una Tesla T4, lo que lo hace adecuado para demostraciones de fine-tuning con recursos limitados.
- Base para experimentos de expansión posteriores: el autor planea un modelo híbrido (thinking y no-thinking) como continuación separada, por lo que este checkpoint puede servir de punto de partida conceptual para trabajos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los benchmarks se añadirán a la página una vez ejecutados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 4,2 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; con contexto de 4.096 tokens conviene reservar aproximadamente 5-6 GB.
- Cabe en GPUs consumer: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB lo ejecutan con holgura en FP16. En GPUs de 8 GB puede requerir cuantización o contextos más cortos.
- El entrenamiento original se realizó en una única Tesla T4 (16 GB), lo que da una idea del perfil de memoria del modelo.
- Opciones de despliegue: Transformers (formato publicado), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documentan pesos GGUF para llama.cpp u Ollama; sería necesario convertirlos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Martos-Preview | ~2,07B (35 capas) | 4.096 tokens (entrenamiento) | Roleplay / escritura creativa en inglés | Apache 2.0 | Hugging Face (repo propio) |
| Qwen/Qwen3-1.7B (base) | ~1,7B (28 capas) | No especificado en la información disponible | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| Alternativas de roleplay de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con otros modelos de roleplay del mismo tamaño no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base Qwen3-1.7B, del que Martos-Preview hereda arquitectura y tokenizador, añadiendo siete capas y aproximadamente 352M parámetros entrenables orientados a conversación de personaje.

## Limitaciones y advertencias

- Modelo experimental ("Preview"): el autor lo describe como un proyecto hobby y una demostración del proceso de entrenamiento, no como un modelo listo para producción.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Ventana de entrenamiento de 4.096 tokens: las conversaciones muy largas pueden degradar la coherencia aunque el base soporte contextos mayores.
- El modo thinking está desactivado en los ejemplos porque el razonamiento visible perjudica la inmersión en roleplay; no se documenta un modo híbrido en este checkpoint.
- Riesgo de alucinación inherente a un modelo de ~2B, especialmente en conversaciones largas o con cartas de personaje ambiguas.
- La etiqueta `not-for-all-audiences` indica que el fine-tuning puede producir contenido para adultos; requiere moderación si se despliega en entornos públicos.
- Sin datos de benchmarks publicados, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las obligaciones de atribución del modelo base Qwen3.
- Sin pesos cuantizados oficiales; el despliegue en hardware limitado exige conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uniqueplayer9102/Martos-Preview
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia LLaMA Pro (arXiv:2401.02415): https://arxiv.org/abs/2401.02415
