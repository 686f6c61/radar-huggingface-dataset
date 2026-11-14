# technicallyAnnoyed/Moonlight-16B-A3B-Instruct

## Resumen

Moonlight-16B-A3B-Instruct es la variante afinada para instrucciones del modelo Moonlight, un Mixture-of-Experts (MoE) de 16.000 millones de parámetros totales con 3.000 millones activos por token, desarrollado por Moonshot AI. El repositorio evaluado (`technicallyAnnoyed/Moonlight-16B-A3B-Instruct`) es una redistribución del modelo oficial bajo licencia MIT, con pesos en formato safetensors y código de arquitectura `deepseek_v3` para Transformers.

Su relevancia técnica reside en el optimizador: Moonlight se entrenó con Muon en lugar de AdamW, demostrando que Muon escala a modelos grandes añadiendo weight decay y una normalización RMS consistente en las actualizaciones, lo que según el informe técnico lo hace unas 2 veces más eficiente en muestras que Adam con entrenamiento óptimo en cómputo. El modelo se entrenó con 5,7 billones de tokens y una longitud de contexto de 8K, posicionándose en la frontera de Pareto rendimiento-FLOPs para su escala.

La versión -Instruct está destinada a generación de texto conversacional y tareas de razonamiento, código y matemáticas. Al ser una redistribución no oficial, conviene contrastar su comportamiento con el checkpoint de referencia de Moonshot AI antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, tipo `deepseek_v3` en Transformers |
| Parámetros totales | 15.960.111.936 (~16B; 15,29B excluyendo embeddings según la model card) |
| Parámetros activos | ~3B por token (2,24B excluyendo embeddings) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible en los metadatos; la model card reporta benchmarks en inglés y chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moonlight es un modelo MoE con 16B de parámetros totales y 3B activos, entrenado sobre 5,7 billones de tokens. La innovación central es el uso del optimizador Muon en lugar de AdamW a gran escala: el equipo de Moonshot AI identifica el weight decay como factor crítico de escalabilidad y propone mantener una RMS de actualización consistente entre parámetros matriciales y no matriciales mediante ajustes de escala por parámetro, lo que estabiliza el entrenamiento sin necesidad de ajuste fino de hiperparámetros. Además desarrollan una implementación distribuida de Muon con optimización estilo ZeRO-1, eficiente en memoria y comunicación.

Los experimentos de scaling law muestran que Muon requiere aproximadamente el 52% de los FLOPs de entrenamiento de AdamW para alcanzar rendimiento comparable, y es unas 2 veces más eficiente en muestras. La variante -Instruct parte del checkpoint preentrenado y se afina para instrucciones; la model card no detalla la composición del dataset de instrucciones ni si se emplearon RLHF o DPO. Se liberan checkpoints preentrenado, instruido e intermedios.

## Capacidades

- Generación de texto y respuesta conversacional multi-turno (pipeline `text-generation` con `conversational`).
- Razonamiento general y de sentido común, con resultados destacados en MMLU, MMLU-pro y BBH frente a modelos densos de escala similar.
- Generación de código (HumanEval, MBPP).
- Razonamiento matemático (GSM8K, MATH, CMath).
- Comprensión en inglés y chino, según los benchmarks reportados (C-Eval, CMMLU).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; BBH sugiere cierta capacidad de razonamiento complejo.
- Modo thinking, visión o audio: no disponible.
- Compatible con text-generation-inference y endpoints según los tags del repositorio.

## Casos de uso

- Asistente conversacional de propósito general: con 8K de contexto y 3B de parámetros activos, puede mantener diálogos multi-turno con coste de inferencia bajo, adecuado para chatbots de atención al cliente donde el throughput importa más que el contexto ultralargo.
- Generación de código asistida: sus resultados en HumanEval (48,1) y MBPP (63,8) lo hacen apto para autocompletado y generación de funciones en editores, con la ventaja de que solo activa 3B de parámetros por token, reduciendo coste frente a un denso de 16B.
- Resolución de problemas matemáticos y tutoría: GSM8K (77,4) y MATH (45,3) permiten usarlo en herramientas educativas que resuelven y explican ejercicios paso a paso.
- Razonamiento y QA sobre documentos: MMLU (70,0) y TriviaQA (66,3) lo hacen viable para sistemas de pregunta-respuesta sobre bases de conocimiento cerradas dentro de la ventana de 8K.
- Procesamiento bilingüe inglés-chino: útil en pipelines de localización, moderación de contenido o análisis de reseñas en mercados asiáticos, dados sus resultados en C-Eval y CMMLU.
- Despliegue en infraestructura con presupuesto de memoria limitado: al ser MoE con 3B activos, permite servir cargas concurrentes en una sola GPU de 80 GB a precisión completa o en GPUs consumer con cuantización (aunque esta última no está documentada oficialmente).
- Investigación sobre optimizadores y eficiencia de entrenamiento: los checkpoints liberados permiten reproducir y extender los estudios de scaling law con Muon.

## Benchmarks y rendimiento

Datos reportados en la model card del modelo oficial (los mismos que cita la redistribución):

| Benchmark | Llama3.2-3B | Qwen2.5-3B | DeepSeek-V2-Lite | Moonlight |
|---|---|---|---|---|
| MMLU | 54,75 | 65,6 | 58,3 | 70,0 |
| MMLU-pro | 25,0 | 34,6 | 25,5 | 42,4 |
| BBH | 46,8 | 56,3 | 44,1 | 65,2 |
| TriviaQA | 59,6 | 51,1 | 65,1 | 66,3 |
| HumanEval | 28,0 | 42,1 | 29,9 | 48,1 |
| MBPP | 48,7 | 57,1 | 43,2 | 63,8 |
| GSM8K | 34,0 | 79,1 | 41,1 | 77,4 |
| MATH | 8,5 | 42,6 | 17,1 | 45,3 |
| CMath | - | 80,0 | 58,4 | 81,1 |
| C-Eval | - | 75,0 | 60,3 | 77,2 |
| CMMLU | - | 75,0 | 64,3 | 78,2 |

Los recuentos de parámetros de la tabla excluyen embeddings; DeepSeek-V2-Lite y Moonlight se entrenaron con 5,7T tokens, Llama3.2-3B con 9T y Qwen2.5-3B con 18T. Los benchmarks corresponden al modelo oficial; no se han publicado evaluaciones independientes de esta redistribución.

## Requisitos de hardware

- VRAM para inferencia: los pesos en safetensors ocupan aproximadamente 31,9 GB (bfloat16/float16 para 16B de parámetros). Se requiere una GPU con al menos 32 GB para carga completa, más memoria para el KV cache según la longitud de contexto.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para precisión completa. Una RTX 4090 (24 GB) no puede alojar el modelo completo sin cuantización.
- GPU consumer: no cabe en GPUs de 24 GB o menos sin cuantización; no se documentan versiones GGUF o AWQ oficiales, por lo que opciones como llama.cpp u Ollama requerirían conversión manual.
- Opciones de despliegue: Transformers (versión recomendada `transformers==4.48.2`, Python 3.10, torch>=2.1.0), text-generation-inference y endpoints compatibles según los tags del repositorio. vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponible. Como referencia estructural, al activar ~3B parámetros por token, el coste computacional por token se aproxima al de un modelo denso de 3B, aunque el peso completo debe residir en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Rendimiento clave |
|---|---|---|---|---|
| Moonlight-16B-A3B-Instruct | 16B / 3B | 8K | MIT | MMLU 70,0; HumanEval 48,1; GSM8K 77,4 |
| DeepSeek-V2-Lite | 16B / 2,4B | no disponible | no disponible | MMLU 58,3; HumanEval 29,9; GSM8K 41,1 |
| Qwen2.5-3B (denso) | 3B / 3B | no disponible | no disponible | MMLU 65,6; HumanEval 42,1; GSM8K 79,1 |
| Llama3.2-3B (denso) | 3B / 3B | no disponible | no disponible | MMLU 54,75; HumanEval 28,0; GSM8K 34,0 |

Moonlight supera a los tres en la mayoría de benchmarks, salvo GSM8K, donde Qwen2.5-3B mantiene una ligera ventaja. Frente a DeepSeek-V2-Lite, su competidor directo en arquitectura MoE de escala similar, la mejora es notable en código y matemáticas.

## Limitaciones y advertencias

- Ventana de contexto de solo 8K tokens, insuficiente para tareas de documentos largos, RAG con muchos fragmentos o análisis de repositorios completos.
- Es una redistribución no oficial realizada por un tercero (`technicallyAnnoyed`) con 35 descargas y 0 likes; no hay garantía de fidelidad respecto al checkpoint original de Moonshot AI. Verificar hashes y comportamiento antes de usar en producción.
- No hay datos publicados de benchmarks sobre esta copia concreta; los resultados de la tabla corresponden al modelo oficial.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, sin que la información disponible documente mitigaciones específicas.
- Sesgos: no disponibles en la información proporcionada; los benchmarks reportados se limitan a inglés y chino, por lo que el rendimiento en castellano no está evaluado.
- Idiomas: los metadatos no declaran idiomas soportados; el uso en español requeriría evaluación propia.
- Licencia MIT: permisiva para uso comercial, pero al ser una redistribución conviene conservar los avisos de copyright originales y comprobar la licencia del checkpoint fuente.
- No se documentan cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo.
- El código de arquitectura es `custom_code` (`deepseek_v3`), lo que puede requerir `trust_remote_code=True` y revisión del código remoto por motivos de seguridad.

## Enlaces

- Repositorio evaluado: https://huggingface.co/technicallyAnnoyed/Moonlight-16B-A3B-Instruct
- Modelo oficial instruido: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Modelo oficial preentrenado: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Repositorio de código: https://github.com/MoonshotAI/Moonlight
- Informe técnico (PDF): https://github.com/MoonshotAI/Moonlight/blob/master/Moonlight.pdf
- Optimizador Muon: https://github.com/KellerJordan/Muon
- Paper referenciado en los tags (arXiv:2502.16982): https://arxiv.org/abs/2502.16982
