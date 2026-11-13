# trymirai/Qwen3.8-27B-S-6GiB

## Resumen

Qwen3.8-27B-S-6GiB es una cuantización extrema del modelo base Qwen/Qwen3.8-27B, publicada por el usuario trymirai bajo el identificador trymirai/Qwen3.8-27B-S-6GiB. El objetivo declarado por la nomenclatura es comprimir un modelo de aproximadamente 27.000 millones de parámetros hasta un peso en disco de unos 6 GiB, empleando una combinación de cuantización de 2 bits y 8 bits (según los tags del repositorio) mediante la librería uzu, un formato propietario del autor. El resultado es un checkpoint safetensors con 6.365.063.968 parámetros almacenados, lo que sugiere una representación empaquetada o parcial del modelo original.

La relevancia de esta ficha es doble. Por un lado, ilustra hasta dónde llegan las técnicas de compresión agresiva para llevar modelos de gran tamaño a hardware de consumo. Por otro, es un caso representativo de los riesgos de los checkpoints comunitarios: el repositorio tiene acceso restringido (gated), solo 19 descargas, ningún "like", y depende de una librería no estándar (uzu) que no forma parte del ecosistema habitual de inferencia (transformers, llama.cpp, vLLM). La licencia declarada es Apache 2.0, heredada del modelo base.

No se dispone de información sobre idiomas soportados, datos de entrenamiento, benchmarks ni detalles de la arquitectura más allá de lo que se infiere del modelo base Qwen3.8-27B, del cual no se aportan especificaciones en la información disponible. Todo dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Qwen/Qwen3.8-27B; no se detalla en la informacion) |
| Parametros totales | 6.365.063.968 (según safetensors del checkpoint cuantizado); modelo base declarado de ~27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit y 8-bit (según tags); formato propietario uzu |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería uzu) |
| Tamano del repo | 60,1 GB |
| Acceso | Restringido (gated); requiere aceptar condiciones en Hugging Face |
| Modelo base | Qwen/Qwen3.8-27B |
| Descargas / likes | 19 / 0 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-11-13 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la información proporcionada, por lo que no se puede confirmar si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Todo ello debe consultarse en la ficha del modelo base, fuera del alcance de esta ficha.

Lo que sí se puede afirmar es que este checkpoint es una transformación del modelo base mediante la librería uzu, con cuantización mixta de 2 y 8 bits. La reducción de ~27B a 6,36B parámetros almacenados y un repo de 60,1 GB sugiere un esquema de empaquetado no convencional: el tamaño del repositorio es desproporcionadamente grande para un checkpoint de 6 GiB de pesos efectivos, lo que apunta a que el repo incluye múltiples artefactos (posiblemente varias variantes de cuantización, metadatos o pesos auxiliares). No hay información sobre si se empleó decodificación especulativa, atención lineal u otras innovaciones.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que la capacidad principal es la generación autoregresiva.
- Razonamiento y código: no disponible de forma específica; dependerá de las capacidades del modelo base Qwen3.8-27B, no documentadas aquí.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Cuantización extrema: la capacidad diferencial de este checkpoint es ejecutarse con una huella de memoria muy reducida gracias a la cuantización de 2/8 bits, a costa de una posible degradación de calidad no cuantificada.

## Casos de uso

- Experimentación con cuantización extrema en local: el checkpoint permite probar en una máquina de consumo cómo se comporta un modelo derivado de ~27B con pesos de 2 bits. Es adecuado para investigación sobre degradación de calidad, no para producción sin evaluación previa.
- Prototipado de pipelines de generación de texto en entornos con VRAM limitada: al reducir la huella de pesos a unos 6 GiB, se puede cargar en GPUs de 8-12 GB para pruebas de integración de la API de generación.
- Evaluación comparativa de formatos de cuantización: útil para medir perplejidad y calidad frente a otras cuantizaciones del mismo modelo base (GGUF Q4, AWQ, GPTQ), siempre que se disponga de la librería uzu.
- Docencia y demostraciones de compresión de modelos: sirve para ilustrar el compromiso entre tamaño, precisión numérica y calidad en un curso o taller, dado su reducido peso en disco efectivo.
- Pruebas de viabilidad antes de invertir en hardware: permite estimar si las capacidades del modelo base justifican el despliegue de una versión completa en infraestructura mayor.
- Investigación sobre robustez de modelos cuantizados: al ser una cuantización agresiva, es un candidato para estudiar alucinación y degradación en tareas de razonamiento, comparando contra el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB para los pesos en el esquema de 2 bits declarado, más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- GPU recomendadas: no disponible. Por la huella estimada, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, en modelos con 8 GB o más de VRAM, sujeto a verificación con la librería uzu.
- Opciones de despliegue: la librería uzu es el único runtime declarado. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Runtime |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-S-6GiB | 6,36B almacenados (base ~27B) | no disponible | Apache 2.0 | Gated | uzu |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible en esta ficha | no disponible | transformers y otros |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | ~27B equivalentes | depende del base | según autor | público habitualmente | llama.cpp, vLLM, etc. |

No se dispone de datos de rendimiento comparado. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso automatizado y en CI.
- Dependencia de una librería no estándar: uzu no forma parte del ecosistema común de inferencia, lo que limita la portabilidad y el soporte comunitario.
- Cuantización de 2 bits: es una precisión muy agresiva; es esperable una degradación significativa de calidad, alucinación y coherencia en razonamiento, aunque no se han publicado mediciones.
- Sin benchmarks ni evaluación: no hay datos que permitan afirmar que el modelo conserva las capacidades del base.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Repositorio de baja tracción: 19 descargas y 0 likes; no hay evidencia de validación por la comunidad.
- Tamaño del repo desproporcionado: 60,1 GB para un checkpoint de 6 GiB efectivos sugiere artefactos adicionales no documentados; conviene inspeccionar el contenido antes de descargar.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que las condiciones del modelo base y del acceso gated no impongan restricciones adicionales.
- Riesgo de alucinación: no cuantificado; en cuantizaciones extremas suele aumentar.
- No apto para producción sin evaluación previa contra el modelo base en las tareas objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S-6GiB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería uzu: no disponible (no se proporciona enlace en la información)
- Paper, blog o demo: no disponible
