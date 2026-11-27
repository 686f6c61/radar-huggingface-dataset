# zaindanaharper/flywheel-local-coder-32b

## Resumen

Flywheel-Local-Coder-32B es un modelo de lenguaje especializado en código, desarrollado por Zain Dana Harper, que parte de Qwen2.5-Coder-32B-Instruct y aplica un entrenamiento continuado mediante QLoRA sobre un corpus propio de 66,2 millones de tokens distribuidos en 17.997 ficheros, extraído de un ecosistema de desarrollo real. El resultado se empaqueta en un único fichero GGUF cuantizado en Q4_K_M de 18,5 GB, pensado para ejecutarse íntegramente en local sin que los prompts ni el código abandonen el disco del usuario.

El modelo se presenta como la versión de mayor capacidad de la familia Flywheel, junto al hermano de 14B, manteniendo la misma postura "local-first" y una cadena de trazabilidad verificable desde el corpus hasta los pesos finales mediante hashes SHA-256 y un fichero de procedencia. La arquitectura subyacente es la de Qwen2 (transformer denso) con 32.500 millones de parámetros y una ventana de contexto de 32.768 tokens.

Es relevante ahora porque ofrece una alternativa de despliegue local a escala 32B con licencia Apache-2.0 y atribución a Qwen, orientada a equipos que necesitan confidencialidad del código y verificación reproducible de la cadena de construcción. El autor es explícito: se trata de una build de entrenamiento continuado verificada y retrazable, no de un modelo con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen2) |
| Parametros totales | 32,5B (32.500 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (único fichero GGUF publicado); es posible recuantizar desde el adaptador LoRA |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5-Coder-32B-Instruct) |
| Licencia | Apache-2.0 con atribución a Qwen |
| Formato de pesos | GGUF (modelo fusionado y adaptador QLoRA en GGUF) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de su base, un transformer denso de 32.500 millones de parámetros con atención estándar y sin componentes de mezcla de expertos. Sobre esta base se aplicó un entrenamiento continuado mediante QLoRA (cuantización de bajo rango) sobre un corpus propietario del autor de 66,2 millones de tokens repartidos en 17.997 ficheros, procedente de un ecosistema de desarrollo en funcionamiento real. El adaptador resultante se fusiona con los pesos base y se empaqueta en un único GGUF Q4_K_M de 18.851.336.480 bytes.

La innovación destacable no está en la arquitectura sino en el proceso: el autor publica una cadena de procedencia retrazable hash a hash (provenance.json y checksums.sha256) que permite verificar los bytes descargados contra el corpus y el proceso de construcción. También se distribuye el adaptador QLoRA (268 MB) de forma separada para aplicar el delta entrenado sobre una copia propia del modelo base o recuantizar a otra precisión, sin republicar los pesos base. No se documentan detalles sobre RLHF, DPO ni composición detallada del dataset más allá del recuento de ficheros y tokens.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Completado de código y autocompletado en editores.
- Refactorización y transformación de código.
- Tool calling / function calling (heredado del modelo base Instruct).
- Razonamiento multi-paso y uso como agente dentro de flujos de desarrollo.
- Capacidades multilingües de código heredadas de Qwen2.5-Coder (los idiomas naturales concretos no están documentados en la ficha).
- Inferencia determinista: a temperatura 0 con semilla fija, las repeticiones son idénticas byte a byte (recibo de comportamiento publicado).
- Verificación de integridad de la descarga mediante SHA-256 publicado.

## Casos de uso

- Asistente de código en local para equipos con requisitos de confidencialidad: al ejecutarse íntegramente en disco, los prompts y el código no salen de la máquina, adecuado para entornos con políticas estrictas de propiedad intelectual.
- Autocompletado y generación en IDE: el modelo puede integrarse vía llama.cpp u Ollama con un endpoint compatible con OpenAI, sirviendo como backend de extensiones de editor sin dependencia de la nube.
- Refactorización de módulos existentes: con 32.768 tokens de contexto puede procesar ficheros y fragmentos de proyecto amplios en una sola pasada.
- Automatización de tareas de desarrollo con tool calling: puede invocar funciones y herramientas dentro de pipelines de CI/CD o scripts de mantenimiento.
- Generación de pruebas y documentación técnica: el modelo produce código y texto explicativo a partir de firmas y fragmentos de implementación.
- Prototipado de agentes de codificación: sirve como motor de razonamiento multi-paso en flujos agénticos que requieran ejecución local y verificable.
- Auditoría de reproducibilidad: equipos que necesitan reconstruir y verificar la cadena de un modelo pueden usar los ficheros de procedencia y checksums para validar exactamente los bytes desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que, a diferencia del modelo de 14B, esta versión de 32B aún no incluye puntuaciones de benchmark; el único recibo de comportamiento registrado es una generación determinista de humo (temperatura 0, semilla fija, salida idéntica byte a byte en repeticiones). No se formula ninguna reclamación de mejora de capacidad sobre el modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para los pesos más contexto (el fichero GGUF ocupa 18,5 GB).
- GPU recomendadas: GPU de 24 GB de VRAM (por ejemplo, RTX 4090 o A10G) o máquinas con RAM generosa para inferencia en CPU.
- Cabe en consumer GPU: sí, en GPUs de 24 GB; en GPUs de 16 GB requeriría cuantizaciones más agresivas no publicadas en el repo o recuantización desde el adaptador.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (mediante Modelfile incluido), endpoint local compatible con OpenAI; vLLM y TGI no están documentados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Flywheel-Local-Coder-32B | 32,5B | 32.768 | Apache-2.0 | GGUF Q4_K_M | No |
| Flywheel-Local-Coder-14B | 14B (no confirmado en detalle) | No disponible | Apache-2.0 | GGUF | Sí (pagina BENCHMARKS.md del repo hermano) |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 32.768 | Apache-2.0 | Safetensors, GGUF | Sí (publicados por Qwen) |

La comparación con otros modelos de código de 32B de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay puntuaciones publicadas que permitan evaluar la mejora o el deterioro respecto al modelo base; el autor no reclama ninguna mejora de capacidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible.
- Corpus propietario: los datos de entrenamiento continuado no se publican, lo que limita la auditoría del contenido y posibles sesgos o contaminaciones.
- Idiomas: la lista de idiomas soportados no está disponible; se heredan del modelo base sin confirmación explícita.
- Licencia: Apache-2.0 con atribución a Qwen; el uso comercial está permitido, pero debe conservarse el aviso de atribución incluido en LICENSE.
- Restricciones de despliegue: el formato publicado es únicamente GGUF Q4_K_M; para otras precisiones es necesario recuantizar desde el adaptador LoRA.
- Madurez: modelo con muy pocas descargas (23) y sin likes, lo que sugiere escasa validación comunitaria; conviene tratarlo con cautela en producción.
- Dependencia del modelo base: la calidad final está acotada por Qwen2.5-Coder-32B-Instruct, sobre el que se aplica un ajuste relativamente pequeño (66,2M tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaindanaharper/flywheel-local-coder-32b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Modelo hermano de 14B: https://huggingface.co/zaindanaharper/flywheel-local-coder-14b
- Modelo credential-line-32m: https://huggingface.co/zaindanaharper/credential-line-32m
- Demo interactiva (Three-Plate Verification Oracle): https://huggingface.co/spaces/zaindanaharper/jfc3p-oracle-demo
- Laboratorio del autor: https://harperz9.github.io/models.html
- Repositorio Flywheel: https://github.com/HarperZ9/flywheel
- Repositorio BuildLang: https://github.com/HarperZ9/buildlang
- Preprint EMET: https://doi.org/10.5281/zenodo.21230267
- Preprint BuildLang: https://doi.org/10.5281/zenodo.21231253
- Preprint Proof Packets: https://doi.org/10.5281/zenodo.21231406
- Preprint Witnessed Independence: https://doi.org/10.5281/zenodo.21232206
- ORCID del autor: https://orcid.org/0009-0001-7175-5393
- Web del autor: https://harperz9.github.io/
