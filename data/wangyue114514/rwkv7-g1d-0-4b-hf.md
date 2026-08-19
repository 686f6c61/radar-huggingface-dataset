# wangyue114514/rwkv7-g1d-0.4b-hf

## Resumen

El modelo `wangyue114514/rwkv7-g1d-0.4b-hf` es una conversión a Hugging Face Transformers del checkpoint original `rwkv7-g1d-0.4b-20260210-ctx8192.pth` perteneciente a la familia RWKV-7 "Goose" publicada por BlinkDL. Se trata de un modelo de lenguaje causal recurrente, con 450,7 millones de parámetros (0,45B), 24 capas y un tamaño oculto de 1024. La arquitectura RWKV-7 combina las ventajas de las RNN (tiempo lineal, espacio constante sin caché de atención) con la paralelización típica de los Transformers, lo que lo hace especialmente interesante para despliegues eficientes y procesamiento de secuencias largas.

Este repositorio concreto adopta un diseño "delgado": contiene únicamente los pesos, la configuración, los activos del tokenizador y tres puntos de entrada de código remoto. La implementación real y los operadores optimizados se instalan desde el paquete Python `rwkv7-hf==0.7.0`, evitando duplicar código en cada repositorio de modelos. El modelo está publicado bajo licencia Apache-2.0 y es compatible con el ecosistema Transformers mediante `trust_remote_code=True`.

Su relevancia actual radica en que RWKV-7 es un proyecto de Linux Foundation AI, 100 % libre de atención, que promete rendimiento competitivo con arquitecturas transformer a una fracción del coste computacional. Este modelo de 0,45B es una opción ligera para entornos con recursos limitados, aunque carece de documentación detallada sobre capacidades específicas y benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrent causal language model, sin atención) |
| Parametros totales | 450.767.872 (~0,45B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento indicado por el checkpoint fuente) |
| Tipos de cuantizacion | No disponible (pesos almacenados en FP16) |
| Idiomas soportados | No disponible (tokenizador de 65.536 entradas, sin especificación de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente que elimina por completo el mecanismo de atención, sustituyéndolo por un estado recurrente lineal que se actualiza en cada paso. Esto permite una complejidad temporal O(n) y un uso de memoria constante independiente de la longitud de la secuencia, a diferencia de los Transformers que requieren una caché de atención que crece linealmente. El modelo es paralelizable durante el entrenamiento, lo que combina lo mejor de ambos paradigmas.

El checkpoint original `rwkv7-g1d-0.4b-20260210-ctx8192.pth` pertenece a la familia G1d de RWKV-7. No se dispone de información detallada sobre el dataset de entrenamiento, el número total de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La conversión a Hugging Face mantiene los pesos originales en FP16 y la configuración de 24 capas con tamaño oculto 1024 y vocabulario de 65.536 entradas. La implementación se apoya en el paquete `rwkv7-hf` y en el adaptador `rwkv-rs/hf-adapter`, que proporcionan los operadores optimizados necesarios para la inferencia.

## Capacidades

- Generación de texto causal: el modelo produce texto autocompletado a partir de un prompt, como cualquier LM causal.
- Procesamiento recurrente: al no usar atención, mantiene un estado interno que le permite manejar secuencias largas con coste constante.
- Compatibilidad con Transformers: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` usando `trust_remote_code=True`.
- Inferencia eficiente en memoria: su tamaño reducido (0,45B) y la ausencia de caché de atención lo hacen adecuado para entornos con poca memoria.
- No se han documentado capacidades específicas de tool calling, agentes, visión, audio o modo de razonamiento explícito en la información disponible.

## Casos de uso

- Generación de texto en dispositivos periféricos: al ser un modelo pequeño y recurrente, puede ejecutarse en CPUs o GPUs de baja gama para tareas de autocompletado o redacción asistida sin necesidad de infraestructura en la nube.
- Prototipado rápido de aplicaciones de lenguaje: su integración sencilla con Transformers permite probar ideas de generación de texto, chatbots básicos o clasificación de texto con un coste de desarrollo mínimo.
- Procesamiento de secuencias largas en streaming: gracias a su espacio constante, puede procesar flujos de texto continuos (por ejemplo, transcripciones en tiempo real) sin acumular memoria.
- Investigación en arquitecturas recurrentes: sirve como punto de partida para estudiar el comportamiento de RWKV-7 en comparación con modelos transformer de tamaño similar.
- Fine-tuning ligero: con solo 450M parámetros, es viable ajustarlo en una GPU de consumo para dominios específicos, como generación de código o resúmenes técnicos.
- Embeddings de texto: RWKV-7 ofrece representaciones vectoriales gratuitas, lo que permite usarlo como extractor de características para tareas de búsqueda semántica o clustering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Se recomienda realizar pruebas propias si se considera su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 450M parámetros en FP16 (~900 MB de pesos), se estima que la inferencia puede ejecutarse con aproximadamente 2 GB de VRAM, incluyendo activaciones y overhead. No hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o GPUs integradas modernas. Para fine-tuning se recomienda al menos 4 GB.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: se puede usar con Transformers (PyTorch), vLLM (si soporta RWKV-7), llama.cpp (si existe soporte), o directamente con el paquete `rwkv7-hf`. No se ha confirmado soporte en Ollama o TGI.
- Latencia y throughput: no disponible. Dependerá del hardware y de la implementación de los operadores optimizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| wangyue114514/rwkv7-g1d-0.4b-hf | 0,45B | 8.192 | RWKV-7 recurrente | Apache-2.0 |
| Mamba-370M | 0,37B | 2.048 (típico) | SSM (state space model) | Apache-2.0 |
| GPT-2 small | 0,12B | 1.024 | Transformer | MIT |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estos modelos. La comparación se limita a características arquitectónicas y de licencia. RWKV-7 y Mamba comparten la filosofía de modelos recurrentes eficientes, mientras que GPT-2 es un transformer clásico. La elección dependerá de las necesidades específicas de contexto y eficiencia.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos del modelo; como modelo entrenado con datos web, puede presentar sesgos sociales y culturales no documentados.
- Riesgo de alucinación: al ser un modelo de 0,45B, es probable que genere contenido factualmente incorrecto o inventado, especialmente en dominios especializados.
- Contexto limitado: la longitud de contexto de 8.192 tokens es moderada; para secuencias más largas se requeriría extrapolación, cuyo comportamiento no está verificado.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque el tokenizador de 65.536 entradas sugiere multilingüismo, no hay garantías.
- Dependencia de paquete externo: la inferencia requiere instalar `rwkv7-hf==0.7.0` y usar `trust_remote_code=True`, lo que añade una dependencia adicional y posibles riesgos de seguridad si el paquete no es auditado.
- Sin benchmarks publicados: no hay evidencia pública de rendimiento en tareas estándar, lo que dificulta evaluar su calidad relativa.
- Mantenimiento: el repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026; podría carecer de soporte activo.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/wangyue114514/rwkv7-g1d-0.4b-hf
- Repositorio original de pesos: https://huggingface.co/BlinkDL/rwkv7-g1
- Proyecto RWKV-LM en GitHub: https://github.com/BlinkDL/RWKV-LM
- Sitio oficial de RWKV: https://www.rwkv.com/
- Paquete PyPI rwkv7-hf: https://pypi.org/project/rwkv7-hf/0.7.0/
- Adaptador para Hugging Face: https://github.com/rwkv-rs/hf-adapter
- Implementación alternativa en Transformers: https://github.com/dfytensor/transformers-rwkv7
