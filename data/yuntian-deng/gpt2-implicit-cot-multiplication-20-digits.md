# yuntian-deng/gpt2-implicit-cot-multiplication-20-digits

## Resumen

Este checkpoint es un ajuste fino de GPT-2 (124.439.808 parámetros) publicado por Yuntian Deng que resuelve multiplicaciones de hasta 20 dígitos por número **sin generar los pasos intermedios de cálculo**. La técnica empleada es la "internalización por pasos" (stepwise internalization) descrita en el artículo *From Explicit CoT to Implicit CoT: Learning to Internalize CoT Step by Step* (arXiv:2405.14838, Deng, Choi y Shieber, 2024): durante el ajuste fino se eliminan gradualmente los pasos de razonamiento explícitos del objetivo de entrenamiento, de modo que el modelo aprende a producir el resultado directamente. La relevancia es de investigación: es una demostración empírica de que un modelo pequeño puede internalizar un procedimiento aritmético en sus estados ocultos en lugar de escribirlo en tokens.

El modelo no es un asistente conversacional ni una calculadora fiable. Su formato de entrada es rígido: los dígitos de cada operando deben invertirse, separarse con espacios y unirse con ` * `, terminando en `=`. La salida también es una secuencia de dígitos invertida y separada por espacios. Cualquier prompt en lenguaje natural produce resultados sin sentido.

La ventana de contexto heredada de GPT-2 es de 1024 tokens, más que suficiente para el formato de entrada/salida que maneja (dos operandos de 20 dígitos más el producto). Se publica como material de reproducción de experiments de chain-of-thought implícito, con una demo interactiva que lo compara contra variantes con CoT explícito y sin CoT. No se han publicado resultados de benchmarks en la información disponible, y el propio autor advierte que no debe tratarse como evaluador aritmético fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 base; 12 capas, 768 dimensiones ocultas, 12 cabezas en la configuración estándar de GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible: no se publican cuantizaciones oficiales; el repo contiene pesos en safetensors (fp32/fp16) y admite cuantización estándar con herramientas externas (int8, 4-bit) |
| Idiomas soportados | No disponible. El entrenamiento es específico de formato numérico, no de lenguaje natural |
| Licencia | No disponible (la model card no declara licencia; el modelo base GPT-2 se distribuye bajo MIT, pero no se confirma la del checkpoint derivado) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base, un transformer decoder-only de 124 millones de parámetros con embeddings de tokens atados a la cabeza de lenguaje. No hay innovaciones arquitectónicas: el interés está en el procedimiento de entrenamiento. Según el artículo citado, se parte de un modelo entrenado con cadena de pensamiento explícita (pasos de multiplicación escritos token a token) y se aplica internalización por pasos: en fases sucesivas se van eliminando los tokens de pasos intermedios del objetivo, forzando al modelo a predecir el producto final a partir únicamente de los operandos. En inferencia, el resultado se sigue generando de forma autorregresiva, dígito a dígito, pero sin cálculo escrito visible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de este tipo). La model card indica que el checkpoint de la demo usa entrenamiento con longitudes de dígitos mixtas, a diferencia de los experimentos de longitud fija del artículo, y que el formato de la demo emplea `=` como separador y omite el marcador de respuesta `####` usado en el código de investigación. El repositorio de GitHub del autor (da03/Internalize_CoT_Step_by_Step) contiene el código de entrenamiento y las notas de formato de datos.

## Capacidades

- Generación de productos aritméticos para dos enteros no negativos de hasta 20 dígitos, siempre en el formato invertido y separado por espacios.
- Razonamiento implícito: produce el resultado sin emitir pasos intermedios de multiplicación.
- Generación autorregresiva dígito a dígito del producto, lo que permite leer la respuesta invirtiendo y concatenando los dígitos generados.
- Reproducción de un pipeline de investigación: sirve como referencia para experimentos de internalización de CoT y para comparativas con variantes de CoT explícito.
- No soporta tool calling ni function calling (no se documenta ninguna capacidad de este tipo).
- No soporta uso como agente ni razonamiento multi-paso general.
- No es multilingüe en sentido práctico: no procesa lenguaje natural; la entrada es una secuencia numérica con formato fijo.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- **Reproducción de investigación sobre CoT implícito**: cargar el checkpoint con `transformers` y comparar sus predicciones contra el modelo con CoT explícito y el modelo sin CoT de la demo del autor, para medir la degradación de precisión al eliminar los pasos intermedios.
- **Ablaciones de formato de entrenamiento**: usar este checkpoint de longitudes mixtas como contraste frente a los modelos de longitud fija del artículo, evaluando cómo afecta la distribución de longitudes de operando a la precisión por número de dígitos.
- **Destilación y experimentos de internalización propios**: servir de punto de partida (fine-tuning sobre GPT-2) para replicar la técnica en otras tareas algorítmicas, como suma, ordenación o copia, reutilizando el código del repositorio del autor.
- **Testbed de despliegue de bajo coste**: al ocupar ~250 MB en fp16, es útil para validar pipelines de `text-generation-inference`, endpoints compatibles o servicios propios antes de migrar a modelos mayores, sin consumir recursos de GPU significativos.
- **Generación de datasets sintéticos de verificación aritmética**: producir pares entrada/salida en el formato invertido para construir suites de test, con la salvedad de que las respuestas deben validarse siempre con aritmética exacta.
- **Docencia y demostraciones sobre razonamiento latente**: ilustrar en clase o en un artículo divulgativo la diferencia entre razonamiento explícito (tokens intermedios) y razonamiento internalizado (cómputo en estados ocultos), usando la demo pública como apoyo.
- **Evaluación de robustez de tokenizadores en aritmética**: analizar cómo el tokenizador de GPT-2 fragmenta secuencias de dígitos separados por espacios y cómo eso condiciona la precisión del producto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de precisión (MMLU, GSM8K, HumanEval u otras) ni métricas de exactitud por número de dígitos para este checkpoint concreto, y advierte explícitamente de que los resultados de longitud fija del artículo no deben interpretarse como una evaluación de esta variante de longitudes mixtas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32, ~0,25 GB en fp16 y ~0,13 GB en int8, sin contar el overhead del runtime y las cachés de atención (despreciables con 1024 tokens de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 4090, RTX 3090, A100, H100 y en GPUs de portátil de gama media; también en CPU con latencia mayor.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo con 2 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.). Incluso es viable en Raspberry Pi o en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ejemplo oficial de la model card), `text-generation-inference` (etiqueta presente en el repo), endpoints compatibles con la API de Hugging Face, y `llama.cpp`/Ollama tras convertir los pesos a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput estimados: no disponibles. Por el tamaño (124M de parámetros) y la generación de decenas de tokens por respuesta, se espera latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuntian-deng/gpt2-implicit-cot-multiplication-20-digits | 124.439.808 | 1024 tokens | CoT implícito (internalización por pasos), multiplicación hasta 20 dígitos | No disponible | HuggingFace, 22 descargas |
| openai-community/gpt2 (modelo base) | 124.439.808 | 1024 tokens | LM generalista; aritmética de varios dígitos muy limitada sin fine-tuning | MIT | HuggingFace, ampliamente disponible |
| Variante con CoT explícito de la demo del autor | No disponible | No disponible | Genera pasos intermedios de multiplicación antes del resultado | No disponible | Solo referenciada en la demo interactiva |
| Variante sin CoT de la demo del autor | No disponible | No disponible | Entrenamiento directo entrada-salida sin pasos intermedios | No disponible | Solo referenciada en la demo interactiva |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación relevante es metodológica (presencia o ausencia de pasos explícitos durante el entrenamiento), no de puntuaciones.

## Limitaciones y advertencias

- **No es una calculadora fiable**: el autor advierte que las predicciones pueden ser incorrectas incluso dentro del rango aceptado de 20 dígitos. Toda respuesta debe verificarse con aritmética exacta.
- **Formato de entrada obligatorio**: dígitos invertidos y separados por espacios, ` * ` entre operandos y `=` al final. Un prompt en lenguaje natural o de chat produce salidas sin sentido; no debe usarse como asistente.
- **Límite de entrada no equivale a garantía**: los 20 dígitos son un límite de la demo, no una cota de corrección ni de generalización a longitudes mayores.
- **Riesgo de alucinación aritmética**: el modelo genera dígitos por secuencia; puede producir productos plausibles pero incorrectos sin ninguna señal de incertidumbre.
- **Resultados del artículo no transferibles**: las cifras de longitud fija del paper no evalúan este checkpoint de longitudes mixtas.
- **Licencia no declarada**: no se especifica licencia del checkpoint derivado; antes de cualquier uso comercial hay que confirmarla con el autor, aunque el modelo base GPT-2 sea MIT.
- **Idiomas no documentados**: no hay información sobre cobertura lingüística; el modelo está especializado en un formato numérico, no en texto.
- **Contexto limitado a 1024 tokens**: suficiente para el formato previsto, pero impide cualquier uso como modelo de contexto largo.
- **Sesgos heredados de GPT-2**: al derivar de GPT-2, arrastra los sesgos del corpus web original (WebText), aunque el ajuste fino numérico los hace prácticamente irrelevantes para su tarea objetivo y, a la vez, inutiliza el modelo para generación de texto general.
- **Madurez**: 22 descargas y 0 likes; es un artefacto de investigación sin mantenimiento ni garantías de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuntian-deng/gpt2-implicit-cot-multiplication-20-digits
- Demo interactiva (compara CoT implícito, CoT explícito y sin CoT): https://huggingface.co/spaces/yuntian-deng/gpt2-multiplication
- Código de entrenamiento y notas de formato de datos: https://github.com/da03/Internalize_CoT_Step_by_Step
- Artículo principal (stepwise internalization): https://arxiv.org/abs/2405.14838
- Registro del artículo y descargas de citación: https://latent-implicit-thinking.github.io/papers/2405.14838/
- Artículo relacionado (Implicit CoT via Knowledge Distillation): https://arxiv.org/abs/2311.01460
- Registro de citación del artículo relacionado: https://latent-implicit-thinking.github.io/papers/2311.01460/
- Lista de lectura sobre chain-of-thought implícito: https://latent-implicit-thinking.github.io/
- Tema sobre razonamiento internalizado: https://latent-implicit-thinking.github.io/topics/internalized-reasoning/
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
