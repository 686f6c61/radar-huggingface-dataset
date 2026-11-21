# tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF

## Resumen

Meta-Llama-3-8B-Instruct-Jailbroken-GGUF es una colección de cuantizaciones en formato GGUF del modelo `cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken`, un derivado de Llama 3 8B Instruct al que se le ha aplicado una técnica de "jailbreak" mediante ortogonalización de pesos (weight orthogonalization), siguiendo el método descrito por Arditi et al. (2024). El modelo lo publica el usuario tinyopsec y está pensado exclusivamente para investigación en seguridad y alineamiento de IA.

El modelo base conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parámetros, y hereda la ventana de contexto de 8.192 tokens propia de la familia Llama 3. La aportación de esta ficha es la conversión a GGUF mediante llama.cpp, lo que permite ejecutar el modelo en hardware de consumo con cuantizaciones desde 2 bits (Q2_K) hasta 16 bits (F16).

Es relevante ahora porque facilita a investigadores de seguridad reproducir y estudiar comportamientos no alineados en un entorno de inferencia local y de bajo coste, sin necesidad de GPUs de datacenter. La licencia es la Meta Llama 3 Community License, y el autor restringe explícitamente el uso a fines académicos de investigación en alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B; no se especifica en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3 8B Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE, entrenado por Meta. Sobre esa base, el autor original (`cooperleong00`) aplicó ortogonalización de pesos, una técnica de edición de pesos que proyecta los estados ocultos fuera de la dirección asociada al rechazo, eliminando así el comportamiento de negativa aprendido durante el alineamiento. No se dispone de detalles sobre el dataset exacto ni sobre el número de tokens empleados en ese proceso de edición.

Esta publicación concreta no reentrena el modelo: únicamente lo convierte a GGUF con llama.cpp en 13 variantes de cuantización. La model card no documenta el proceso de calibración de las cuantizaciones K-quant ni los datos de entrenamiento originales, por lo que esos datos deben consultarse en la ficha del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat.
- Generación de código y matemáticas a nivel de un modelo de 8B.
- Comportamiento "jailbroken": el modelo tiende a no rechazar peticiones que el modelo alineado rechazaría, lo que constituye su propósito de investigación.
- Ejecución en runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier cliente compatible.
- Tool calling y function calling: no documentado en la model card; debe asumirse el soporte nativo de Llama 3 8B Instruct, sin garantías.
- Capacidades multimodales, audio o thinking mode: no disponibles.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo la ortogonalización de pesos altera las respuestas del modelo ante prompts dañinos, comparando con el modelo alineado original en igualdad de condiciones.
- Evaluación de técnicas de red-teaming: uso del modelo como sujeto de prueba para medir la eficacia de filtros y clasificadores de seguridad en pipelines de moderación.
- Estudio de robustez del alineamiento: reproducción de experimentos de Arditi et al. (2024) sobre direcciones de rechazo en el espacio de activaciones.
- Inferencia local de bajo coste: despliegue en portátiles o estaciones con GPU de consumo usando Q4_K_M, útil para prototipos que requieran un modelo de 8B sin dependencia de la nube.
- Benchmarking de cuantizaciones: comparación de la degradación de calidad entre Q2_K y F16 sobre el mismo modelo, como caso de estudio metodológico.
- Formación y docencia: demostración práctica en cursos de ética y alineamiento de IA de cómo una edición de pesos modifica el comportamiento de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de archivo típico de Llama 3 8B en GGUF):
  - F16: ~16,1 GB.
  - Q8_0: ~8,5 GB.
  - Q6_K: ~6,6 GB.
  - Q5_K_M: ~5,7 GB.
  - Q4_K_M: ~4,9 GB (recomendado por el autor).
  - Q3_K_M: ~4,0 GB.
  - Q2_K: ~3,2 GB.
- GPU recomendadas: A100 o H100 para F16 con contexto completo; RTX 4090 (24 GB) para Q8_0 y superiores sin problemas; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M.
- Cabe en GPU de consumo: sí, desde Q4_K_M en GPUs de 6-8 GB (RTX 3060, RTX 4060) y Q2_K en GPUs de 4 GB, con contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF | 8,03 B | 8.192 (heredado) | Llama 3 Community | GGUF | 13 cuantizaciones, propósito de investigación en seguridad |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | safetensors, GGUF (comunidad) | Modelo alineado de referencia |
| cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken | 8,03 B | 8.192 | Llama 3 Community | safetensors | Modelo base de esta ficha, sin cuantizar |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva y mayor contexto |

## Limitaciones y advertencias

- El modelo está deliberadamente desalineado: puede generar contenido dañino, ilegal o inseguro. No debe desplegarse en producción orientada a usuarios finales.
- Riesgo elevado de alucinación y de respuestas incorrectas, agravado por las cuantizaciones de baja precisión (Q2_K, Q3_K_S).
- La ortogonalización de pesos puede degradar capacidades generales además de eliminar el rechazo; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Idiomas soportados no documentados; se asume el multilingüismo limitado de Llama 3 8B, con dominio claro del inglés.
- Restricciones de licencia: la Meta Llama 3 Community License impone condiciones de uso (incluida la política de uso aceptable de Meta) y obliga a mantener la atribución "Built with Meta Llama 3". El uso comercial está sujeto a los términos de dicha licencia, aunque el propósito declarado del autor es exclusivamente académico.
- El autor declina toda responsabilidad por uso indebido; el usuario debe cumplir la legislación aplicable.
- No hay garantías de soporte de tool calling ni de integración con frameworks de agentes.

## Enlaces

- [Hugging Face: tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF](https://huggingface.co/tinyopsec/Meta-Llama-3-8B-Instruct-Jailbroken-GGUF)
- [Modelo base: cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken](https://huggingface.co/cooperleong00/Meta-Llama-3-8B-Instruct-Jailbroken)
- [Paper de referencia: Arditi et al., 2024 (Refusal in LLMs is mediated by a single direction)](https://arxiv.org/abs/2406.11717)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Meta Llama 3](https://llama.meta.com/llama3/)
