# WithinUsAI/WIUAI.Mini.Coder

## Resumen

WIUAI.Mini.Coder es un modelo de lenguaje de 303 millones de parámetros entrenado desde cero por WithinUsAI (Ilan Da Silva) para generación de código y razonamiento algorítmico. Se trata de un decoder causal de estilo LLaMA con atención multi-cabeza estándar (MHA, sin GQA), 24 capas, dimensión oculta de 768 y un vocabulario de 49.152 tokens basado en el tokenizer de StarCoder. El checkpoint publicado corresponde a la etapa 4.1 de un currículo de cuatro fases y 29,8 mil millones de tokens, con un ajuste supervisado (SFT) de 6.000 millones de tokens que corrige un fallo crítico en el token de fin de secuencia (EOS) de versiones anteriores.

El modelo resulta relevante por su relación entre tamaño y rendimiento en tareas de código: con 303M de parámetros alcanza un 27,4 % de pass@1 en HumanEval, un resultado que el autor sitúa a la altura de modelos de 1B a 7B en esa métrica concreta. Fue entrenado con soporte del programa Google TPU Research Cloud (TRC) sobre TPU v4-32 y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware modesto.

La contrapartida es una especialización muy marcada: el modelo está optimizado para Python y razonamiento algorítmico, con un contexto máximo de solo 1.024 tokens y un rendimiento muy bajo en matemáticas, conocimiento general y sentido común. Es, por tanto, una pieza para tareas acotadas de generación de código, no un asistente generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA causal decoder, atención multi-cabeza (MHA, sin GQA) |
| Parámetros totales | 302.027.520 (~303M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) y código (code) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos de configuración: `vocab_size=49152`, `hidden_size=768`, `num_hidden_layers=24`, `num_attention_heads=8`, `num_key_value_heads=8`, `intermediate_size=3072`, `max_position_embeddings=1024`. Precisión de entrenamiento: bfloat16. Optimizador: AdamW XLA. Tokenizer: `bigcode/starcoder`. Tamaño del repositorio: 3,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal de tipo LLaMA con atención multi-cabeza convencional (8 cabezas de atención y 8 cabezas KV, es decir, sin grouped-query attention), 24 capas y una dimensión de feed-forward de 3.072. El vocabulario de 49.152 tokens proviene del tokenizer BPE de `bigcode/starcoder`, optimizado para código y no para prosa. El modelo se entrenó en precisión bfloat16 sobre TPU v4-32 dentro del programa Google TPU Research Cloud.

El entrenamiento siguió un currículo de cuatro etapas con un total aproximado de 29,8 mil millones de tokens. La etapa 1 (6,3B tokens, FineWeb-Edu) estableció la base lingüística en inglés, con la pérdida bajando de 10,87 a 2,58. La etapa 2 (7,5B tokens, 60 % código sintético de Nemotron y 40 % StarCoderData) especializó el modelo en sintaxis y razonamiento de código, con pérdida de 5,00 a 1,25. La etapa 3 (10B tokens, Nemotron CC-Math, FineWiki y OpenWebMath) abordó razonamiento matemático y conocimiento, con pérdida de 2,77 a 1,55. La etapa 4.1 (6B tokens, Nemotron SFT, OpenCodeInstruct y OpenMathInstruct-2) aplicó el ajuste supervisado de alineación a instrucciones, con pérdida de 1,73 a aproximadamente 0,70, y corrigió el bug de EOS de versiones previas. El formato de diálogo empleado es `User:` / `Assistant:`.

## Capacidades

- Generación de código en Python y resolución de problemas algorítmicos, su especialidad principal.
- Generación de texto en inglés, aunque con calidad limitada fuera del dominio del código.
- Razonamiento algorítmico básico orientado a la implementación de funciones y estructuras de datos.
- Ajuste a instrucciones mediante SFT con el formato `User:` / `Assistant:`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el contexto de 1.024 tokens limita gravemente estos escenarios.
- Capacidades multilingües: limitadas a inglés y código; no se documenta soporte de otros idiomas naturales.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Autocompletado de código en el editor: con 303M de parámetros y un contexto de 1.024 tokens, el modelo puede sugerir funciones y fragmentos cortos en Python con latencia baja en GPU de consumo, integrándose en extensiones de IDE.
- Generación de funciones a partir de docstrings: el ajuste SFT con OpenCodeInstruct permite pedir implementaciones concretas mediante el formato `User:` / `Assistant:`, útil para prototipado rápido de utilidades.
- Enseñanza de programación: el modelo puede generar ejemplos de algoritmos (ordenación, búsqueda, recursión) para material didáctico, dado su entrenamiento en razonamiento algorítmico.
- Generación de tests unitarios sencillos: a partir de una función dada y dentro del límite de contexto, puede producir casos de prueba básicos para pipelines de CI.
- Filtrado y clasificación de fragmentos de código: su tokenizer especializado en código y su tamaño reducido lo hacen adecuado para tareas de etiquetado o detección de patrones en grandes volúmenes de repositorios con coste computacional bajo.
- Despliegue en entornos con recursos limitados: al caber en una única GPU de consumo, sirve para demos, pruebas de concepto y entornos de desarrollo sin infraestructura dedicada.
- Experimentación e investigación: como modelo entrenado desde cero con currículo documentado y licencia Apache 2.0, es una base útil para estudiar dinámicas de entrenamiento de modelos pequeños de código.

## Benchmarks y rendimiento

Datos publicados en la model card para la etapa 4.1 (SFT):

| Dominio | Benchmark | Métrica | Resultado |
|---|---|---|---|
| Código | HumanEval (0-shot) | pass@1 | 27,4 % |
| Código | MBPP (3-shot) | pass@1 | 31,0 % |
| Matemáticas | GSM8K (0-shot) | exact match | 4,55 % |
| Conocimiento | Wikitext-2 | perplexity ↓ | 167,6 |
| Razonamiento | ARC Easy / Challenge | acc norm | 34,6 % / 22,8 % |
| Sentido común | HellaSwag | acc norm | 28,3 % |

Comparativa ofrecida por el autor:

| Modelo | Tamaño | HumanEval (pass@1) | MBPP (pass@1) |
|---|---|---|---|
| WIUAI.Mini.Coder (Stage 4.1) | 303M | 27,4 % | 31,0 % |
| TinyLlama-1.1B | 1,1B | ~26,4 % | ~27,6 % |
| MPT-1B-Instruct | 1,0B | ~22,0 % | ~25,0 % |
| Zephyr-1.3B-SFT | 1,3B | 31,0 % | 34,0 % |
| Mistral-7B-Base | 7B | 30,5 % | 47,5 % |

Nota del autor: HumanEval y MBPP se evaluaron manualmente (`max_new_tokens=512`, `temp=0.2`) debido a problemas de truncación del formato SFT en `lm-eval`. Los resultados de los modelos comparados provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,6 GB para los pesos (302M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,3 GB para pesos; en 4 bits, alrededor de 0,15 GB (estimación teórica; no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y también en CPU para inferencia no interactiva.
- Cabe holgadamente en GPU de consumo, incluidas tarjetas de gama de entrada y portátiles con GPU integrada moderna.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no publicada oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WIUAI.Mini.Coder | 303M | 1.024 | 27,4 % | Apache 2.0 | Hugging Face (transformers) |
| TinyLlama-1.1B | 1,1B | 2.048 (típico en la familia) | ~26,4 % | Apache 2.0 | Hugging Face |
| MPT-1B-Instruct | 1,0B | 2.048 (típico en la familia) | ~22,0 % | Apache 2.0 | Hugging Face |
| Zephyr-1.3B-SFT | 1,3B | 4.096 (típico en la familia) | 31,0 % | MIT (según la familia) | Hugging Face |

Los datos de contexto y licencia de los modelos comparados corresponden a sus familias y no se detallan en la información proporcionada; verifíquense en sus respectivas model cards. En rendimiento de código, WIUAI.Mini.Coder supera a TinyLlama-1.1B y MPT-1B-Instruct con un tercio de parámetros, y se queda por debajo de Zephyr-1.3B-SFT, que sin embargo es casi 4,3 veces más grande.

## Limitaciones y advertencias

- Modelo especializado en código: el propio autor advierte un rendimiento pobre en texto general, matemáticas y sentido común (GSM8K 4,55 %, HellaSwag 28,3 %).
- Contexto muy corto: solo 1.024 tokens; el rendimiento se degrada con entradas más largas, lo que descarta casos de uso con repositorios o conversaciones extensas.
- Sesgo de tokenizer: el vocabulario BPE de StarCoder está optimizado para código, no para prosa, lo que penaliza la generación de texto natural.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir APIs, funciones o imports inexistentes; requiere verificación y ejecución de tests en producción.
- Idiomas: solo inglés y código; no hay soporte documentado de castellano ni de otros idiomas naturales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el código generado y posibles infracciones de derechos de autor derivadas de los datos de entrenamiento.
- Bug histórico de EOS: versiones anteriores a la etapa 4.1 presentaban un fallo en el token de fin de secuencia; debe utilizarse este checkpoint y no otros anteriores.
- Evaluación no estándar: los resultados de HumanEval y MBPP se obtuvieron con evaluación manual y no con el arnés estándar de `lm-eval`, por lo que la comparación con otros modelos debe tomarse con cautela.
- Sin datos de benchmarks independientes ni de latencia/throughput publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithinUsAI/WIUAI.Mini.Coder
- Tokenizer utilizado: https://huggingface.co/bigcode/starcoder
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Nemotron-Pretraining-SFT-v1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-SFT-v1
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset Nemotron-Pretraining-Code-v1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Code-v1
- Dataset FineWiki: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Programa Google TPU Research Cloud: https://sites.research.google/trc/about/
