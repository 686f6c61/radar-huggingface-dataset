# YNSScarSaiyan/bulmax-asm-baseline

## Resumen

BulmaX-ASM Baseline es un modelo de lenguaje de tipo transformer decoder-only con 2.067.130.880 parámetros, desarrollado por YNSScarSaiyan (Dakuwon Moody) como parte del proyecto BulmaX. Su característica más distintiva es que todo el proceso de entrenamiento —forward pass, backward pass y paso de optimizador— se ejecuta mediante kernels escritos a mano en ensamblador x86-64 NASM con instrucciones AVX2+FMA, controlados por un runtime en C puro, sin Python en el bucle de entrenamiento. El modelo se presenta como un "control limpio" para comparar con la versión multimodal principal de BulmaX, que incorpora innovaciones como neurogénesis dinámica y otras arquitecturas experimentales.

Con una arquitectura deliberadamente convencional —sin MoE, sin grafos de coherencia, sin atención compleja o cuántica—, este baseline sirve para aislar el efecto de las innovaciones del proyecto BulmaX sobre una base estándar. El contexto máximo es de 1024 tokens, y los pesos se almacenan en un formato binario propio llamado `BULMAXCP` v1, que no es compatible con safetensors ni pickle. Su relevancia radica en demostrar la viabilidad de entrenar un modelo de 2B parámetros exclusivamente en CPU con kernels de bajo nivel, un enfoque poco común en la práctica actual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (sin MoE, sin atención especial) |
| Parametros totales | 2.067.130.880 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (formato binario fp32 propio) |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar términos) |
| Formato de pesos | BULMAXCP v1 (binario, 64-byte header, blobs float32 alineados) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con las siguientes dimensiones: `dim` 2560, 24 capas, 20 cabezas de atención con `head_dim` 128, hidden size de SwiGLU de 6912, vocabulario de 32000 tokens y embeddings no compartidos (untied). No incorpora ninguna de las innovaciones del proyecto BulmaX principal, como MoE, grafos de coherencia, redes líquidas, RSM, atención compleja/cuántica o factorización de bajo rango. El entrenamiento se realiza íntegramente en CPU mediante kernels NASM AVX2+FMA, con un runtime en C que gestiona la carga de datos y el paso de optimización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint incluye los pesos, los momentos de AdamW y el contador de pasos, todo en un único archivo binario.

## Capacidades

- Generación de texto autoregresiva: por su arquitectura decoder-only, el modelo puede generar texto token a token, aunque no se han publicado ejemplos concretos de calidad o dominio.
- No se han documentado capacidades adicionales como tool calling, function calling, razonamiento multi-paso, visión, audio o modo de pensamiento.
- El modelo está diseñado para ejecutarse en CPU con instrucciones AVX2+FMA; no se ha probado su funcionamiento en GPU ni con frameworks estándar como PyTorch o TensorFlow.
- Al ser un baseline experimental, no se han reportado capacidades multilingües específicas; el tokenizador `bulma_sp.model` sugiere un vocabulario de 32000 tokens, pero no se indica qué idiomas cubre.

## Casos de uso

- Investigación en entrenamiento eficiente en CPU: el modelo sirve como referencia para estudiar cómo kernels de ensamblador pueden reducir la dependencia de GPUs en el entrenamiento de modelos de tamaño medio. Un investigador podría analizar el rendimiento del forward/backward en CPU y compararlo con implementaciones en C o Python.
- Educación sobre kernels de bajo nivel: al ser un ejemplo de entrenamiento completo en NASM, puede utilizarse como material didáctico para enseñar optimización de operaciones de álgebra lineal con AVX2+FMA.
- Desarrollo de runtimes de inferencia ligeros: el formato `BULMAXCP` permite cargar el modelo con un loader en C o ensamblador sin necesidad de intérpretes, lo que podría interesar a quienes construyen sistemas embebidos o de bajos recursos.
- Comparación de arquitecturas: como control "plano" frente a las variantes experimentales de BulmaX, permite aislar el impacto de innovaciones como la neurogénesis dinámica en el rendimiento final.
- Pruebas de portabilidad: dado que el checkpoint es binario y autónomo, puede usarse para validar la portabilidad de un modelo entre sistemas sin dependencias de Python.
- Experimentos de cuantización: aunque no se ofrecen cuantizaciones, el formato fp32 permite investigar técnicas de reducción de precisión sobre un modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han reportado métricas de latencia o throughput para la inferencia en CPU.

## Requisitos de hardware

- El modelo tiene 2.067.130.880 parámetros en fp32, lo que implica aproximadamente 8,27 GB de memoria para los pesos (2.067.130.880 × 4 bytes). A esto hay que sumar memoria para activaciones, gradientes y momentos del optimizador durante el entrenamiento.
- Está diseñado para ejecutarse en CPU x86-64 con soporte AVX2 y FMA. No se ha probado en GPUs ni en otras arquitecturas.
- Para inferencia, se necesitaría al menos 8-10 GB de RAM libre, dependiendo del tamaño del lote y de la longitud de secuencia.
- No se han publicado requisitos de GPU ni recomendaciones de tarjetas específicas.
- El formato de checkpoint no es compatible con vLLM, llama.cpp, Ollama ni TGI; se requeriría un loader personalizado en C o ensamblador.
- No hay datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de tamaño similar (por ejemplo, Gemma 2B, Phi-2 o Qwen 1.5B). Aunque comparten el rango de parámetros, BulmaX-ASM Baseline no tiene benchmarks publicados, usa un formato de pesos propietario y su entrenamiento en CPU con kernels NASM es atípico. Por tanto, no es posible comparar rendimiento, licencia ni disponibilidad de forma rigurosa.

## Limitaciones y advertencias

- Contexto muy limitado: 1024 tokens, insuficiente para tareas que requieran ventanas largas, como resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Formato de pesos propietario: el checkpoint `BULMAXCP` no es compatible con herramientas estándar del ecosistema (Hugging Face Transformers, safetensors, GGUF), lo que dificulta su uso práctico fuera del proyecto BulmaX.
- Licencia "other": no se especifican los términos exactos; el uso comercial, la redistribución o la modificación pueden estar restringidos. Se recomienda contactar al autor antes de cualquier uso.
- Sin cuantizaciones disponibles: el modelo solo se ofrece en fp32, lo que aumenta los requisitos de memoria y reduce la eficiencia en hardware limitado.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un modelo experimental sin evaluación pública, no se puede garantizar su fiabilidad en producción.
- Entrenamiento en CPU: aunque es una demostración técnica, el rendimiento de entrenamiento e inferencia puede ser inferior al de modelos similares entrenados en GPU, y no se han publicado métricas de velocidad.
- Idiomas no especificados: no se indica qué idiomas soporta el tokenizador, por lo que su uso en español u otros idiomas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YNSScarSaiyan/bulmax-asm-baseline
- Perfil del autor: https://huggingface.co/YNSScarSaiyan
- Artículo sobre BulmaX y arquitecturas del autor: https://www.prlog.org/13137493-solo-researcher-builds-three-novel-ai-architectures-from-scratch-including-post-transformer-model.pdf
