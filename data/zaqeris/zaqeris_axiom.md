# ZAQERIS/ZAQERIS_AXIOM

## Resumen

AXIOM es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por ZAQERIS AI, un grupo de investigación independiente con sede en Egipto. Según la model card, se trata del mayor modelo de IA egipcio construido hasta la fecha y el segundo mayor modelo de IA en árabe a nivel global. El modelo declara 79.430 millones de parámetros totales con 12.390 millones activos por token, distribuidos en 36 capas y 16 expertos SwiGLU.

El problema que aborda es el despliegue práctico de modelos de escala 79B en hardware asequible. En FP16/BF16 estándar, un modelo de este tamaño requeriría unos 148 GB de memoria, lo que obliga a múltiples GPUs de servidor. AXIOM emplea el formato de cuantización vectorial ZAQERIS-M3, que empaqueta los pesos en codebooks de retícula de 8 dimensiones a 3,158 bits por parámetro, reduciendo el peso en disco a 29,20 GiB (31,36 GB decimales) repartidos en 36 shards de safetensors.

La relevancia actual del modelo radica en su enfoque de compresión agresiva combinada con una ventana de contexto declarada de hasta 1M tokens y soporte para árabe, inglés y otros idiomas. La licencia es Apache 2.0 con términos adicionales de acceso público gratuito y atribución obligatoria. Cabe señalar que los datos de arquitectura y rendimiento proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE), transformer con 36 capas y 16 expertos SwiGLU |
| Parametros totales | 79.425.295.488 (79,43B) segun el autor; 30.259.936.764 elementos almacenados en safetensors |
| Parametros activos | 12.390 millones (12,39B) por token |
| Longitud de contexto | Hasta 1M tokens (declarado en tags y model card) |
| Tipos de cuantizacion | ZAQERIS-M3 (vector quantization de 8 dimensiones, 3,158 bpp); pesos empaquetados en uint8 |
| Idiomas soportados | Arabe (ar), ingles (en), multilingue |
| Licencia | Apache 2.0 con terminos ZAQERIS AI Free Public Access (atribucion obligatoria, prohibicion de APIs de pago) |
| Formato de pesos | safetensors (36 shards, 29,20 GiB / 31,36 GB), requiere custom_code |

## Arquitectura y entrenamiento

AXIOM es un transformer de tipo sparse Mixture-of-Experts con 36 capas y 16 expertos SwiGLU por capa, de los cuales se activan 12,39B parámetros por token sobre un total de 79,43B. La innovación técnica principal es el formato de compresión ZAQERIS-M3, una cuantización vectorial de tres etapas que empaqueta los pesos en codebooks de retícula de 8 dimensiones almacenados como tensores uint8. Según el autor, este esquema alcanza una media de 3,158 bits por parámetro y preserva el 98,1% de fidelidad de representación en las proyecciones de atención y el 97,3% en el conjunto completo de parámetros. La dequantización se realiza en tiempo de inferencia mediante los módulos `modeling_zaqeris_axiom.py` y el plugin `vllm_axiom_plugin.py`.

El tokenizador, denominado `ZaqerisAxiomTokenizer`, es un motor de emparejamiento de prefijos basado en Radix-Trie sin merges BPE, con complejidad lineal O(L). El vocabulario tiene 148.480 tokens y adopta un léxico subword multilingüe de alta cobertura, podado y aumentado con tokens de control propios (`<|axiom_thought_start|>`, `<|axiom_thought_end|>`, etc.). La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la innovación en decodificación especulativa ni mecanismos de atención lineal más allá del contexto declarado.

## Capacidades

- Generación de texto en árabe, inglés y otros idiomas, con especial énfasis en el mercado MENA.
- Razonamiento y matemáticas, con tokens de control específicos para modo de pensamiento (`<|axiom_thought_start|>` / `<|axiom_thought_end|>`).
- Generación de código, con un resultado declarado de 97,14% pass@1 en HumanEval.
- Seguimiento de instrucciones estrictas, con 82,5% de precisión estricta en IFEval según el autor.
- Ventana de contexto larga de hasta 1M tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de cuantización de bajo VRAM para despliegue local (3 bits, formato ZAQERIS-M3).
- Compatibilidad con vLLM mediante plugin de integración dedicado.
- Capacidad multilingüe declarada, aunque la model card solo detalla árabe e inglés.

## Casos de uso

- Atención al cliente en árabe y multilingüe: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 1M tokens, lo que permite mantener historiales largos y documentación de referencia en la misma ventana sin truncamientos agresivos.
- Generación de código en producción: con un pass@1 declarado del 97,14% en HumanEval y soporte de tool calling implícito en su formato de instrucciones, puede integrarse en pipelines de revisión y autocompletado de código para equipos que trabajan en árabe e inglés.
- Análisis de documentos legales o financieros extensos: la ventana de 1M tokens permite procesar contratos, informes anuales o expedientes completos en una sola pasada, algo relevante para despachos y entidades reguladas en la región MENA.
- Asistentes educativos en árabe: el modelo puede explicar conceptos de matemáticas y ciencias con razonamiento paso a paso mediante su modo de pensamiento, útil para plataformas de tutoría en países árabes.
- Investigación académica en PLN árabe: al ser un modelo fundacional abierto con pesos descargables y licencia Apache 2.0, permite fine-tuning y experimentación por parte de universidades sin coste de API.
- Despliegue local en hardware de gama alta para consumo: gracias a la compresión a 29,20 GiB, un equipo con una GPU de 48 GB o varias de 24 GB puede ejecutar el modelo sin infraestructura de centro de datos.
- Generación de contenido y resúmenes multilingües: para medios de comunicación o agencias que producen contenido en árabe e inglés y necesitan resúmenes coherentes de fuentes largas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en su model-index. No verificados de forma independiente.

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| HumanEval (Python Structural Evaluation) | Generacion de codigo | pass@1 | 97,14 |
| IFEval (Strict Constraint Adherence) | Seguimiento de instrucciones | accuracy estricta | 82,50 |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 29,20 GiB (31,36 GB) en el formato cuantizado ZAQERIS-M3, más overhead de activaciones y KV cache. En FP16/BF16 sin comprimir, un modelo de 79,43B requeriría unos 148 GB.
- GPU recomendadas: para el formato cuantizado, una GPU única de 48 GB (A6000, L40S, RTX 6000 Ada) o varias GPUs de 24 GB (RTX 4090, A10G). Para FP16, se necesitarían múltiples A100 80GB o H100.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU con RTX 4090 (2-4 unidades) o en una única GPU de 48 GB. No cabe en una GPU de 24 GB en solitario.
- Opciones de despliegue: vLLM mediante el plugin `vllm_axiom_plugin.py`, transformers con `custom_code` (requiere `modeling_zaqeris_axiom.py` y `tokenization_zaqeris_axiom.py`). No se menciona soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card no ofrece comparaciones directas con otros modelos MoE de escala similar (por ejemplo, Mixtral, Qwen-MoE o DeepSeek-MoE). A continuación se indica lo que se conoce de cada dimensión sin inventar cifras:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AXIOM (ZAQERIS) | 79,43B (declarado) | 12,39B | 1M (declarado) | Apache 2.0 + terminos ZAQERIS | Hugging Face |
| Alternativas MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de arquitectura, compresión y benchmarks proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. El campo `verified: false` en el model-index confirma que los resultados no están auditados.
- La discrepancia entre los 79,43B declarados y los 30,26B detectados por el escáner de Hugging Face se explica por el empaquetado uint8, pero implica que herramientas estándar de inspección de modelos pueden reportar cifras erróneas o fallar al cargar los pesos sin el código personalizado.
- Requiere `custom_code` y módulos propios (`modeling_zaqeris_axiom.py`, `tokenization_zaqeris_axiom.py`, `vllm_axiom_plugin.py`), lo que reduce la portabilidad y aumenta el riesgo de incompatibilidades con versiones futuras de transformers o vLLM.
- La licencia Apache 2.0 se ve modificada por los términos ZAQERIS AI Free Public Access: atribución obligatoria y prohibición de APIs de pago o facturación por token. Es necesario revisar estos términos antes de un uso comercial.
- El tokenizador adopta un léxico subword de alta cobertura descrito de forma genérica; la model card no detalla la composición exacta del corpus de entrenamiento ni el volumen de tokens, lo que dificulta evaluar sesgos y cobertura lingüística real.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni de tasas de alucinación.
- El soporte multilingüe se declara de forma amplia, pero solo se detallan árabe e inglés; el rendimiento en otras lenguas no está documentado.
- La ventana de 1M tokens está declarada en los tags, pero no se especifica la degradación de rendimiento en contextos muy largos ni el coste de KV cache asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZAQERIS_AXIOM
- No se han encontrado en la busqueda web otros enlaces a papers, blogs, repositorios o demos oficiales.
