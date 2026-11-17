# thuEcstasy1/InfuseLoop-4

## Resumen

InfuseLoop-4 es un modelo de lenguaje base de 596.139.465 parámetros desarrollado por el usuario thuEcstasy1 dentro del proyecto de investigación InfuseLoop. Se trata de un transformer causal con una arquitectura poco convencional: cuatro bucles recurrentes paralelos sobre un backbone compartido de 28 capas, con un mecanismo propietario de Attention Residuals que conecta las trayectorias de ejecución. El modelo se ha entrenado desde una inicialización aleatoria común (no es un fine-tune de Qwen3) sobre 6.000.082.944 tokens de FineWeb-Edu, a lo largo de 45.777 actualizaciones.

La relevancia del modelo es fundamentalmente investigadora: explora el escalado en profundidad recurrente (recurrent depth) manteniendo un número de parámetros denso bajo, y publica una implementación de referencia en PyTorch junto con validaciones de integridad de los pesos. No es un asistente instruido ni un modelo listo para producción: es un checkpoint de investigación con un presupuesto de entrenamiento reducido (6B tokens) y sin alineamiento conversacional.

El modelo emplea el tokenizador y la configuración de backbone de Qwen3-0.6B (revisión fijada del tokenizador), con dimensión oculta de 1.024, FFN de 3.072, 16 cabezas de consulta y 8 cabezas KV con dimensión de cabeza 128. Se distribuye en FP32 con safetensors y licencia Apache-2.0, pero requiere una clase `InfuseLoop` personalizada para su uso, ya que no registra `AutoModelForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 4 bucles recurrentes paralelos (looped-transformer) y Attention Residuals entre trayectorias |
| Parametros totales | 596.139.465 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento); G-SWA con ventanas locales privadas de 64 tokens y KV global compartido del primer bucle |
| Tipos de cuantizacion | no disponible (solo se publica FP32 original) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone compartido de 28 capas con dimensión oculta 1.024 y FFN de 3.072, ejecutado a través de cuatro bucles recurrentes paralelos. La atención usa 16 cabezas de consulta y 8 cabezas KV (GQA) con dimensión de cabeza 128. El mecanismo G-SWA (Global Sliding Window Attention) mantiene un KV global compartido del primer bucle junto con ventanas locales privadas de 64 tokens por bucle. El enrutamiento entre bucles toma las salidas de bucles más superficiales de la ejecución del ciclo precedente, aplicando RMSNorm en origen y el mecanismo propietario de Attention Residuals para combinar información entre trayectorias.

El entrenamiento se realizó sobre 6.000.082.944 tokens de FineWeb-Edu durante 45.777 actualizaciones, con longitud de secuencia de 1.024 y batch global de 128 secuencias. La inicialización es desde una inicialización aleatoria común, no un fine-tune de pesos Qwen3 preentrenados, aunque el backbone y el tokenizador siguen la configuración de Qwen3-0.6B (tokenizador fijado en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`). No se menciona RLHF, DPO ni ningún tipo de alineamiento posterior. La implementación pública es una referencia PyTorch eager legible y no reproduce las mediciones de latencia optimizadas con CUDA Graph, FA4 o Triton descritas en el paper.

## Capacidades

- Generación de texto causal en inglés a partir de prefijos naturales (modelo base, sin plantilla de chat).
- Razonamiento de siguiente token sobre texto de dominio general (FineWeb-Edu).
- No es un asistente instruido: no soporta formato de conversación ni instrucciones explícitas de sistema.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Ejecución recurrente configurable: el paper reporta profundidades recurrentes medidas de cuatro y ocho.

## Casos de uso

- Investigación sobre profundidad recurrente: el modelo sirve como banco de pruebas reproducible para estudiar cómo el escalado en bucles recurrentes afecta a la perplejidad con un presupuesto de parámetros denso fijo de ~0,6B. La implementación de referencia en PyTorch facilita la experimentación.
- Evaluación de mecanismos de atención entre trayectorias: útil para comparar Attention Residuals frente a alternativas de conexión entre bucles en tareas de modelado de lenguaje.
- Generación de texto de dominio educativo: dado el entrenamiento exclusivo con FineWeb-Edu, puede usarse para completar pasajes expositivos o divulgativos en inglés, siempre con revisión humana por la calidad inconsistente.
- Baseline para ablaciones de arquitectura: al compartir tokenizador y configuración de backbone con Qwen3-0.6B, permite comparaciones controladas de arquitectura sin cambiar el vocabulario.
- Estudio de eficiencia de ventanas deslizantes: el esquema G-SWA con ventanas privadas de 64 tokens y KV global compartido es un objeto de estudio concreto para analizar compromisos entre memoria y contexto.
- Reproducción de resultados académicos: el repositorio incluye `export-validation.json` con hashes SHA256 de los pesos y recuentos de parámetros, lo que facilita la verificación de experimentos.
- Docencia y formación: ejemplo práctico de transformer con bucles recurrentes para cursos avanzados de arquitecturas de lenguaje.

## Benchmarks y rendimiento

| Benchmark | InfuseLoop-4 |
|---|---:|
| WikiText-2 word PPL (↓) | 35,70 |
| LAMBADA final-word PPL (↓) | 45,08 |
| Media de siete tareas (%) (↑) | 43,00 |

La media de siete tareas incluye MMLU, HellaSwag, ARC-E, ARC-C, PIQA, WinoGrande y OpenBookQA. MMLU se evalúa con cinco ejemplos (five-shot) y el resto en zero-shot. Las definiciones exactas de las métricas y el alcance de los benchmarks están documentados en el repositorio de código. No se dispone de comparativas publicadas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB solo para pesos (596M parámetros × 4 bytes), más activaciones y KV cache; en la práctica se recomienda al menos 6-8 GB de VRAM para secuencias de 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más.
- Opciones de despliegue: la clase `InfuseLoop` personalizada del repositorio de GitHub (instalable vía `pip install git+https://github.com/thuEcstasy/InfuseLoop.git`). No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, y el modelo no registra `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles. La implementación pública es eager PyTorch y no reproduce las mediciones optimizadas (CUDA Graph, FA4, Triton) del paper.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| InfuseLoop-4 | 596M | 1.024 | Apache-2.0 | 4 bucles recurrentes, entrenado con 6B tokens, solo inglés |
| Qwen3-0.6B | ~600M | no disponible en esta ficha | Apache-2.0 | Backbone y tokenizador de referencia; preentrenado a mayor escala |
| no disponible | — | — | — | No se dispone de datos de otros modelos comparables en la información proporcionada |

La comparación con Qwen3-0.6B es pertinente porque InfuseLoop-4 reutiliza su configuración de backbone y tokenizador, aunque parte de inicialización aleatoria y con un presupuesto de entrenamiento mucho menor (6B tokens). No se dispone de resultados de benchmarks de Qwen3-0.6B en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- Checkpoint de investigación entrenado con un presupuesto reducido de 6B tokens: la calidad del texto puede ser inconsistente o repetitiva.
- Puede generar afirmaciones no respaldadas por evidencia y reflejar sesgos presentes en el corpus de preentrenamiento (FineWeb-Edu).
- Sin alineamiento conversacional ni fine-tuning de seguridad: no debe desplegarse como asistente sin salvaguardas adicionales.
- Cobertura limitada al inglés.
- Contexto efectivo de 1.024 tokens, insuficiente para tareas de contexto largo.
- La evidencia experimental se limita a modelos densos de ~0,6B y profundidades recurrentes de cuatro y ocho; el escalado a arquitecturas mayores o MoE queda abierto.
- Requiere código personalizado: no es compatible con pipelines genéricos de Transformers ni con `AutoModelForCausalLM`.
- La licencia Apache-2.0 permite uso comercial, pero el tokenizador hereda la licencia Apache-2.0 de su upstream y el corpus de preentrenamiento no se redistribuye.
- Solo se publican pesos en FP32; no hay versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thuEcstasy1/InfuseLoop-4
- Página del proyecto: https://thuecstasy.github.io/InfuseLoop/
- Repositorio de código: https://github.com/thuEcstasy/InfuseLoop
