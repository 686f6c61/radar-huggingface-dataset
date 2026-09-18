# the-sweater-cat/bonsai-2-pq2

## Resumen

Bonsai 2 PQ2 es una conversión a safetensors de pesos ternarios empaquetados (formato PQ2) del modelo Prism ML Bonsai 2 27B, publicada por el usuario the-sweater-cat. El repositorio no contiene un modelo entrenado desde cero, sino una redistribución del modelo base prism-ml/Ternary-Bonsai-2-27B-gguf en un formato consumible por vLLM mediante un plugin específico. Su interés práctico es servir pesos de muy baja precisión en un stack de inferencia de alto rendimiento sin pasar por GGUF.

El modelo declara la arquitectura bajo el tag qwen3_5_text y un total de 6.953.598.464 parámetros según el recuento real de los safetensors, lo que supone aproximadamente 6,95 mil millones de parámetros y un repositorio de 7,3 GB. Existe una discrepancia no explicada en la información disponible entre esa cifra y el sufijo "27B" del nombre del modelo base, que conviene verificar antes de dimensionar despliegues.

La relevancia del repositorio es acotada y muy específica: requiere el plugin bonsai2-vllm-plugin y vLLM 0.29.0, y el autor solo lo ha validado en A100 40GB, con texto en BF16, contexto de 2.048 tokens y una única petición en ejecución. Visión, multi-GPU y contextos más largos quedan explícitamente sin validar. Con cero descargas y cero likes en el momento del análisis, se trata de un artefacto experimental más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (según tags del repositorio); no se especifica si es transformer denso o MoE |
| Parametros totales | 6.953.598.464 (recuento de safetensors, ~6,95 mil millones) |
| Parametros activos | no disponible (no se indica si el modelo es MoE) |
| Longitud de contexto | no disponible; el autor solo valida 2.048 tokens |
| Tipos de cuantizacion | PQ2 empaquetado (pesos ternarios); el repositorio también incluye el tag "8-bit"; modelo base disponible en GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería declarada: vllm) |

## Arquitectura y entrenamiento

No se documenta información sobre entrenamiento en los materiales disponibles: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO u otras etapas de alineamiento. Se trata de un artefacto de conversión, no de un modelo entrenado por el autor del repositorio: el propio autor lo describe como "packed PQ2 safetensors conversion" de Prism ML Bonsai 2 27B, y la licencia Apache-2.0 se acompaña de las notas del proyecto upstream en NOTICE.txt.

El único detalle técnico de inferencia documentado es la posibilidad de usar un "perfil rápido" (fast profile) con un drafter separado DFlash2, es decir, un esquema de decodificación especulativa con modelo borrador, que en la configuración validada consume aproximadamente 34 GiB de memoria de GPU. No se detallan la arquitectura interna, el mecanismo de atención, ni el esquema exacto de empaquetado ternario PQ2 más allá de su nombre.

## Capacidades

- Generación de texto y uso conversacional: son los dos tags funcionales declarados (text-generation, conversational).
- Inferencia servida mediante API compatible con OpenAI en http://127.0.0.1:8000/v1, con nombre de modelo bonsai2.
- Ejecución sobre vLLM 0.29.0 con plugin personalizado (bonsai2-vllm-plugin), lo que habilita batching y gestión de KV cache propias de vLLM.
- Perfil rápido opcional con decodificación especulativa mediante drafter DFlash2.
- Capacidades de visión: el autor indica explícitamente que no están validadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Servicio de generación de texto autoalojado: desplegar el modelo con `bonsai2-serve` y exponer la API compatible con OpenAI para integrarlo como backend de texto en aplicaciones internas, asumiendo la compilación inicial de kernels.
- Sustitución de inferencia en BF16 por pesos ternarios: el autor ha validado texto en BF16 sobre A100 40GB, por lo que este repositorio permite comparar coste de memoria y comportamiento frente a la versión de referencia en el mismo hardware.
- Investigación en cuantización extrema: analizar el impacto de pesos ternarios empaquetados (PQ2) en la calidad de generación respecto al modelo base en GGUF, dentro de una línea de trabajo sobre compresión de modelos.
- Experimentación con decodificación especulativa: usar el perfil rápido con drafter DFlash2 para medir ganancias de latencia en una configuración controlada de una sola petición.
- Desarrollo de plugins para vLLM: sirve como caso de prueba real para implementar y depurar kernels personalizados y conversiones de safetensors empaquetados sobre vLLM 0.29.0.
- Procesamiento por lotes de textos cortos: tareas de resumen, clasificación o reescritura de fragmentos que quepan en contextos de hasta 2.048 tokens, sin depender de APIs externas.
- Chat conversacional de contexto corto: asistentes internos con historiales breves, siempre que se acepte la ausencia de validación más allá de una petición concurrente.
- Reproducción de pipelines de conversión: usar el repositorio como referencia para generar safetensors PQ2 a partir de pesos GGUF ternarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite al README del plugin (wonder-dot-ai/bonsai2-vllm-plugin) para consultar benchmarks, configuración y detalles de conversión, pero esos datos no forman parte del material proporcionado. Los únicos datos de rendimiento disponibles son cualitativos: configuración validada en A100 40GB, texto en BF16, contexto de 2.048 tokens, una petición en ejecución, y un consumo de aproximadamente 34 GiB de GPU con el perfil rápido.

## Requisitos de hardware

- Memoria: el repositorio pesa 7,3 GB, de modo que los pesos en disco ocupan ese orden de magnitud; el consumo real de GPU depende de la KV cache y del drafter.
- Configuración validada: A100 40GB, con aproximadamente 34 GiB de memoria de GPU en el perfil rápido (incluye el drafter DFlash2).
- GPU de consumo: no confirmado. Los 34 GiB reportados en el perfil rápido superan los 24 GB de una RTX 4090, y el autor no documenta ninguna prueba en GPU de consumo.
- Multi-GPU: explícitamente no validado.
- Software obligatorio: Linux, Python 3.12, Git, uv, driver compatible con CUDA 13, toolkit CUDA (nvcc) y compilador de C++.
- Stack de despliegue: vLLM 0.29.0 más el plugin bonsai2-vllm-plugin (rama v0.1.0). Alternativas como llama.cpp, Ollama o TGI: no disponibles para este formato.
- Arranque: el primer inicio puede tardar varios minutos debido a la compilación de kernels.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| the-sweater-cat/bonsai-2-pq2 | 6.953.598.464 (~6,95 mil millones) | no disponible (validado a 2.048 tokens) | safetensors PQ2 para vLLM | apache-2.0 | requiere plugin y vLLM 0.29.0 |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | no disponible | no disponible | GGUF | no disponible | repositorio público en HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos comparables de pesos ternarios empaquetados con plugin de vLLM, por lo que la comparativa se limita al modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- Ámbito de validación muy estrecho: solo A100 40GB, texto en BF16, 2.048 tokens de contexto y una petición en ejecución. Visión, multi-GPU y contextos mayores no están validados.
- Dependencia dura de versión: requiere vLLM 0.29.0 y el plugin bonsai2-vllm-plugin; cualquier actualización de vLLM puede romper la compatibilidad.
- Proceso de instalación exigente: Linux, Python 3.12, driver CUDA 13, nvcc y compilador de C++; la compilación de kernels al arrancar puede tardar varios minutos.
- Discrepancia de nomenclatura: el nombre del modelo base indica 27B mientras que el recuento de safetensors es de ~6,95 mil millones de parámetros; la información disponible no explica la diferencia, lo que puede llevar a errores de dimensionamiento.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible, al no haber benchmarks publicados.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingüe ni un comportamiento fiable en castellano.
- Ausencia de datos de entrenamiento y alineamiento: imposible evaluar sesgos conocidos, composición del dataset o filtros de seguridad aplicados.
- Madurez del artefacto: cero descargas y cero likes en el momento del registro, sin señales de adopción por la comunidad.
- Licencia: Apache-2.0, que permite uso comercial, pero el autor indica que las notas del proyecto upstream se incluyen en NOTICE.txt, por lo que deben conservarse y revisarse antes de redistribuir.
- Resultados de la búsqueda web no relevantes: las consultas devolvieron únicamente páginas sobre el artículo gramatical inglés "the", sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-sweater-cat/bonsai-2-pq2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Plugin de vLLM necesario: https://github.com/wonder-dot-ai/bonsai2-vllm-plugin
- README del plugin (benchmarks y detalles de conversión): https://github.com/wonder-dot-ai/bonsai2-vllm-plugin#readme
