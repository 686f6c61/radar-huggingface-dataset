# wangyue114514/rwkv7-g1d-0.1b-hf

## Resumen

RWKV-7 G1D 0.1B es una conversión a Hugging Face Transformers del checkpoint original `rwkv7-g1d-0.1b-20260129-ctx8192.pth` publicado por BlinkDL en el repositorio `BlinkDL/rwkv7-g1`. El modelo pertenece a la familia RWKV-7 "Goose", una arquitectura recurrente que combina las ventajas de las RNN (inferencia lineal en tiempo y espacio constante, sin caché de claves/valores) con la paralelización propia de los transformadores. Esta conversión, realizada por el usuario wangyue114514, emplea un diseño de repositorio "fino" que no duplica la implementación del modelo, sino que delega en el paquete Python `rwkv7-hf` para cargar los pesos y operadores optimizados.

Con 191 millones de parámetros, 12 capas y una dimensión oculta de 768, este modelo está orientado a tareas de generación de texto en entornos con recursos limitados, como CPU o GPU de consumo. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su arquitectura recurrente elimina el cuello de botella del caché de atención, lo que lo hace especialmente atractivo para aplicaciones con contexto largo o despliegue en dispositivos edge. Aunque el checkpoint fuente indica un contexto de entrenamiento de 8.192 tokens, la arquitectura RWKV-7 permite extrapolar a longitudes mayores sin degradación severa.

La relevancia de este modelo radica en que representa una alternativa eficiente a los transformadores densos de tamaño similar, con un coste de inferencia constante independiente de la longitud de la secuencia. Su integración en Hugging Face mediante `trust_remote_code` y el paquete `rwkv7-hf` facilita su uso en pipelines estándar de Transformers, aunque requiere la instalación previa de dependencias adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 recurrente (sin atención, lineal en tiempo y espacio constante) |
| Parametros totales | 191.034.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (indicada por el checkpoint fuente) |
| Tipos de cuantizacion | FP16 (pesos almacenados); disponible GGUF Q8_0 en fuentes externas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código remoto vía `trust_remote_code`) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente pura, sin mecanismos de atención, que utiliza un estado oculto lineal y operaciones paralelizables durante el entrenamiento. Cada capa combina una mezcla de canales lineales y no lineales (técnica denominada *channel mixing*) con una actualización de estado recurrente, lo que permite un coste computacional constante por token durante la inferencia y un uso de memoria independiente de la longitud de la secuencia. El checkpoint G1D de 0.1B tiene 12 capas, dimensión oculta 768 y un vocabulario de 65.536 tokens.

No se dispone de información detallada sobre el dataset de entrenamiento, el número total de tokens procesados ni la aplicación de técnicas de alineación como RLHF o DPO. El nombre del checkpoint (`ctx8192`) indica que el entrenamiento se realizó con una ventana de contexto de 8.192 tokens. La implementación de Hugging Face requiere el paquete `rwkv7-hf==0.7.0`, que incluye los operadores optimizados y la lógica de inferencia, mientras que el repositorio solo contiene los pesos, la configuración y los archivos del tokenizador.

## Capacidades

- Generación de texto causal: produce texto coherente y contextualizado en múltiples dominios, aunque su tamaño reducido limita la complejidad de las respuestas.
- Razonamiento básico: la familia RWKV-7 "Goose" incluye modelos de razonamiento; este checkpoint de 0.1B puede resolver tareas simples de lógica y matemáticas, pero no tareas complejas de varios pasos.
- Inferencia con contexto largo: gracias a la arquitectura recurrente, puede procesar secuencias de miles de tokens sin aumentar el uso de memoria, superando en eficiencia a los transformadores de tamaño similar.
- Compatibilidad con Transformers: se integra con `AutoModelForCausalLM` y `AutoTokenizer` mediante `trust_remote_code`, lo que permite usarlo en pipelines estándar de generación.
- Soporte de tool calling y agentes: no se ha documentado explícitamente, pero la arquitectura recurrente no impide su integración en marcos de agentes; sin embargo, no hay evidencia de entrenamiento específico para ello.
- Multilingüismo: no se especifican idiomas soportados; el vocabulario de 65.536 tokens sugiere cobertura multilingüe, pero no hay datos confirmados.

## Casos de uso

- Asistente de chat en dispositivos edge: su tamaño de 191M parámetros y su inferencia lineal permiten ejecutar un chatbot básico en Raspberry Pi o teléfonos móviles con 2-4 GB de RAM, ofreciendo respuestas contextuales sin depender de la nube.
- Generación de texto en tiempo real: al no requerir caché de atención, la latencia por token es constante, lo que lo hace adecuado para aplicaciones de autocompletado o sugerencia de texto en editores y terminales.
- Procesamiento de documentos largos: su contexto de 8.192 tokens y memoria constante permiten resumir o extraer información de informes extensos en una sola pasada, sin fragmentar el texto.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y con licencia permisiva, se puede integrar en pipelines de investigación o desarrollo para validar ideas antes de escalar a modelos mayores.
- Clasificación y extracción de entidades: aunque no está entrenado específicamente para ello, su generación causal puede adaptarse mediante *prompting* para tareas de etiquetado o extracción de campos en texto corto.
- Educación y experimentación: su arquitectura recurrente y su código abierto lo convierten en un recurso didáctico para estudiar modelos de lenguaje sin atención y comparar su rendimiento con transformadores clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 382 MB (191M × 2 bytes). Con overhead de activaciones y estado recurrente, se estima un uso total de 500-700 MB, por lo que cabe en GPU con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o incluso integradas de última generación. En CPU, funciona con 4 GB de RAM.
- Compatibilidad con GPU de consumo: sí, es totalmente viable en GPUs de gama baja y media.
- Opciones de despliegue: Transformers con `trust_remote_code`, llama.cpp (mediante conversión a GGUF, disponible externamente en formato Q8_0), y el paquete `rwkv7-hf` que incluye operadores optimizados.
- Latencia y throughput: no se han publicado mediciones oficiales, pero la arquitectura recurrente ofrece latencia constante por token, típicamente inferior a la de un transformer de tamaño similar en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| wangyue114514/rwkv7-g1d-0.1b-hf | 191M | 8.192 | RWKV-7 recurrente | Apache-2.0 | safetensors + remote code |
| fla-hub/rwkv7-0.1B-g1 | 191M | 8.192 (estimado) | RWKV-7 recurrente | Apache-2.0 | safetensors |
| Qwen2.5-0.5B (referencia) | 494M | 32.768 | Transformer denso | Apache-2.0 | safetensors |
| SmolLM-135M (referencia) | 135M | 2.048 | Transformer denso | Apache-2.0 | safetensors |

La comparativa se limita a parámetros y arquitectura, ya que no hay datos de rendimiento publicados para este modelo. La alternativa `fla-hub/rwkv7-0.1B-g1` es prácticamente idéntica en arquitectura y tamaño, aunque con soporte declarado de 8 idiomas. Los modelos transformer de tamaño similar (Qwen2.5-0.5B, SmolLM) ofrecen ventajas en ecosistema y documentación, pero requieren caché de atención y tienen mayor coste de memoria en secuencias largas.

## Limitaciones y advertencias

- Tamaño reducido: con 191M parámetros, la calidad de generación y razonamiento es limitada en comparación con modelos de 1B o más; puede producir respuestas incoherentes en tareas complejas.
- Sesgos y alucinaciones: no hay información sobre evaluación de sesgos; como todo modelo de lenguaje, puede generar contenido factualmente incorrecto o reflejar sesgos presentes en sus datos de entrenamiento.
- Dependencia de paquete externo: la implementación no está autocontenida; requiere instalar `rwkv7-hf==0.7.0` y usar `trust_remote_code`, lo que puede suponer un riesgo de seguridad si no se verifica el código remoto.
- Idiomas no especificados: no se ha documentado qué idiomas soporta; el vocabulario de 65.536 tokens sugiere cobertura multilingüe, pero no hay garantías de rendimiento en lenguas distintas del inglés.
- Contexto de entrenamiento limitado: aunque la arquitectura permite extrapolar, el entrenamiento se realizó con 8.192 tokens; usos con contextos mucho mayores pueden degradar la coherencia.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar, lo que dificulta la comparación con alternativas.
- Licencia y uso comercial: Apache-2.0 permite uso comercial sin restricciones, pero el paquete `rwkv7-hf` tiene su propia licencia (no especificada en la model card) que conviene revisar antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/wangyue114514/rwkv7-g1d-0.1b-hf
- Repositorio original de BlinkDL: https://huggingface.co/BlinkDL/rwkv7-g1
- Checkpoint fuente: https://huggingface.co/BlinkDL/rwkv7-g1/blob/159cf82ed0f18eb9dcd92c388688bec11024895e/rwkv7-g1d-0.1b-20260129-ctx8192.pth
- Repositorio RWKV-LM en GitHub: https://github.com/BlinkDL/RWKV-LM
- Sitio oficial de RWKV: https://www.rwkv.com/
- Paquete PyPI `rwkv7-hf`: https://pypi.org/project/rwkv7-hf/0.7.0/
- Adaptador `rwkv-rs/hf-adapter`: https://github.com/rwkv-rs/hf-adapter
- Modelo alternativo `fla-hub/rwkv7-0.1B-g1`: https://huggingface.co/fla-hub/rwkv7-0.1B-g1
