# Username1008/duckgpt-esper3-q4km

## Resumen

DuckGPT Esper3 Q4_K_M es una exportación en formato GGUF del modelo reconstruido a partir de los pesos publicados en el repositorio `Username1008/duckgpt-recovery`, cuyo linaje declarado es el checkpoint `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B`. El autor, `Username1008`, distribuye esta variante cuantizada en Q4_K_M generada con las herramientas `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, lo que la hace consumible directamente en ecosistemas de inferencia local como llama.cpp, Ollama o LM Studio.

El modelo hereda la arquitectura y el tokenizador del checkpoint DeepSeek-R1-0528-Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parámetros (8B) construido sobre la familia Qwen3. La ficha del autor advierte explícitamente que la conversión correcta y una prueba de humo no garantizan que los pesos reconstruidos sean numéricamente idénticos a una fusión PEFT de referencia, lo que sitúa este artefacto en el terreno de la experimentación más que del despliegue en producción.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo habitual de cuantización GGUF de un modelo derivado de DeepSeek-R1; por otro, sirve como caso de estudio de las cautelas necesarias cuando un artefacto procede de una reconstrucción de pesos no verificada frente al modelo base oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, linaje DeepSeek-R1-0528-Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo base admite otras cuantizaciones GGUF via llama.cpp, no documentadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3, heredada del checkpoint `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento (RLHF, DPO u otras) empleadas en el modelo base dentro de la información proporcionada. El proceso documentado en esta ficha se limita a la conversión de los pesos reconstruidos a GGUF con `convert_hf_to_gguf.py` y a su cuantización a Q4_K_M con `llama-quantize`.

La advertencia del autor es técnicamente relevante: una conversión exitosa y una prueba de humo verifican que el grafo y el tokenizador son compatibles, pero no que los tensores reconstruidos coincidan numéricamente con una fusión PEFT de referencia. Por tanto, cualquier evaluación de calidad debe realizarse contra el checkpoint base oficial y no asumirse por la mera existencia del artefacto GGUF.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento de cadena de pensamiento heredado del linaje DeepSeek-R1 (no verificado de forma independiente en esta cuantización).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en estación de trabajo: el archivo Q4_K_M de unos 5 GB cabe en GPUs de consumo con 8 GB o más de VRAM y permite ejecutar el modelo con llama.cpp u Ollama para pruebas de razonamiento y conversación sin depender de servicios en la nube.
- Evaluación comparativa de reconstrucciones de pesos: útil en laboratorio para contrastar la salida de esta cuantización frente al checkpoint `DeepSeek-R1-0528-Qwen3-8B` oficial y detectar desviaciones numéricas introducidas por la reconstrucción.
- Prototipado de pipelines conversacionales: al ser compatible con endpoints, puede integrarse en servicios HTTP locales para validar prompts, plantillas de chat y flujos multi-turno antes de migrar a un despliegue con pesos verificados.
- Pruebas de cuantización y tooling GGUF: sirve como banco de pruebas para validar scripts de conversión, cuantización y carga en llama.cpp sobre un modelo de 8B.
- Experimentación académica con modelos derivados de DeepSeek-R1: permite estudiar el comportamiento de cadenas de razonamiento en un artefacto de bajo coste computacional, siempre con la cautela de que los pesos no están verificados.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M reduce el peso a ~5 GB, lo que facilita pruebas en portátiles con GPU integrada o en CPU con suficiente RAM, aunque el rendimiento será limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (tamaño del repo 5,0 GB más overhead de contexto y caché KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para mayor throughput; A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, en GPUs con 8 GB o más de VRAM; en 6 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa sin conversión adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuckGPT Esper3 Q4_K_M | 8B | no disponible | GGUF | other | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | 8B | no disponible | safetensors | no disponible | Hugging Face (modelo base oficial) |
| Qwen3-8B | 8B | no disponible | safetensors, GGUF | no disponible | Hugging Face |

La comparación directa con el checkpoint base oficial es la referencia más relevante: este artefacto es una cuantización de una reconstrucción de pesos, no una réplica verificada del modelo original.

## Limitaciones y advertencias

- Los pesos proceden de una reconstrucción (`duckgpt-recovery`) y el propio autor advierte que la conversión y la prueba de humo no garantizan equivalencia numérica con una fusión PEFT de referencia; la calidad puede diferir del modelo base oficial.
- Licencia `other`: no se especifican términos de uso comercial; es necesario contactar al autor o revisar el repositorio original antes de cualquier uso en producción.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K u otras tareas.
- Idiomas soportados no declarados: el comportamiento multilingüe no está verificado.
- Longitud de contexto no documentada en esta ficha; debe consultarse el checkpoint base para planificar ventanas de contexto.
- Riesgo de alucinación y sesgos: no evaluado en esta cuantización; debe asumirse el comportamiento del modelo base sin garantías adicionales.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso independientes.
- Formato GGUF: no apto para entrenamiento ni para despliegue directo en vLLM/TGI sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Username1008/duckgpt-esper3-q4km
- Repositorio de pesos reconstruidos: https://huggingface.co/Username1008/duckgpt-recovery
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Herramienta de conversión llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/convert_hf_to_gguf.py
- Documentación de cuantización llama.cpp: https://github.com/ggerganov/llama.cpp
