# Thox-ai/thox-cluster-code

## Resumen

thox-cluster-code es una distribución configurada por THOX.ai del modelo Qwen2.5-Coder-32B-Instruct de Alibaba Cloud, empaquetada para inferencia local mediante Ollama y para despliegues distribuidos en su tecnología de clustering MeshStack. No se trata de un fine-tuning: los pesos son byte a byte idénticos a la distribución oficial de Ollama del modelo base, verificado por SHA-256 en la revisión de la release del 31 de octubre de 2026. El valor añadido de THOX reside en la capa de configuración, orquestación y documentación, no en los pesos.

El modelo base es un transformer denso de 32 000 millones de parámetros especializado en generación de código, con una ventana de contexto de 128 000 tokens y soporte declarado de 92 lenguajes de programación. La distribución de THOX se sirve en cuantización Q4_K_M en formato GGUF, con un tamaño de 20 GB según el listado de Ollama, lo que la hace viable en hardware de consumo de gama alta.

Su relevancia actual es limitada pero específica: ofrece una vía de despliegue local-first para equipos que quieren ejecutar un modelo de código de 32B sin depender de APIs en la nube, integrado en un ecosistema propietario de clustering entre dispositivos. La model card es explícitamente conservadora y retiró afirmaciones previas no verificadas (comparaciones con GPT-4o, puntuaciones Aider y cifras de ROI) por carecer de evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-Coder-32B) |
| Parametros totales | 32B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (num_ctx 131072 configurado en Ollama) |
| Tipos de cuantizacion | Q4_K_M (GGUF) en esta distribución; otras cuantizaciones del base no detalladas |
| Idiomas soportados | 92 lenguajes de programación (según el registro de Alibaba); idioma natural: inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribución Ollama); safetensors en el modelo base |
| Tamaño en disco | 20 GB (listado de Ollama) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-32B-Instruct: un transformer denso decoder-only de 32 000 millones de parámetros, sin mezcla de expertos. THOX no aporta cambios arquitectónicos ni capas adicionales; su trabajo se limita al empaquetado, la configuración de runtime (incluido el ajuste de `num_ctx` a 131 072, frente a la cifra de 32K que muestra la etiqueta `latest` de Ollama como artefacto de visualización) y la documentación.

En cuanto al entrenamiento, la model card de THOX declara explícitamente que no existe ningún run de fine-tuning propio, ni dataset, ni procedimiento de entrenamiento adicional. Los datos y el proceso de entrenamiento son los del proveedor del modelo base, documentados en su model card correspondiente. THOX tampoco añade datasets en esta release. Cualquier detalle sobre composición del corpus, fases de RLHF o DPO debe consultarse en la documentación de Qwen2.5-Coder-32B-Instruct, no en esta ficha.

## Capacidades

- Generación de código en 92 lenguajes de programación, según el registro del modelo base.
- Análisis y revisión de repositorios de código en local.
- Asistencia en tareas de infraestructura como código y prototipado DevOps.
- Soporte de test automation y QA sobre bases de código privadas.
- Generación de texto técnica en inglés (único idioma natural declarado).
- Inferencia local sin conexión: el modelo no accede a información online ni a servicios externos salvo que el operador los integre explícitamente.
- Despliegue distribuido mediante la capa MeshStack de THOX (orquestación separada de esta descarga).
- Tool calling y function calling: no confirmado en la información disponible para esta distribución; debe verificarse en la model card del modelo base.

## Casos de uso

- Revisión de código en local para equipos de software: el modelo puede analizar repositorios completos aprovechando la ventana de 128K tokens, sin que el código salga de la infraestructura del equipo, lo que encaja con requisitos de confidencialidad.
- Prototipado de infraestructura como código: startups y equipos DevOps pueden generar y validar plantillas de Terraform, Kubernetes o similares en un entorno local antes de aplicarlas.
- Asistencia en QA y automatización de pruebas: generación de tests unitarios y de integración sobre bases de código privadas, con revisión humana posterior obligatoria según la propia model card.
- Entornos de desarrollo air-gapped: al ser una distribución local sin dependencias de red, es adecuada para organizaciones que operan sin acceso a internet o con restricciones severas de conectividad.
- Despliegue en clúster de dispositivos ThoxNova: el modelo está diseñado para repartir carga entre varios dispositivos conectados mediante MagStack o MeshStack, distribuyendo cómputo y memoria entre nodos.
- Asistencia de codificación en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M de 20 GB permite ejecutarlo en hardware de gama alta no profesional, con Ollama como runtime.
- Migración de código entre lenguajes: la cobertura declarada de 92 lenguajes permite tareas de traducción y adaptación de fragmentos entre ecosistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados por THOX en la información disponible. La model card indica que cualquier cifra citada anteriormente provenía de Alibaba para el modelo base, se reprodujo del catálogo original y no fue re-ejecutada para esta publicación. La evaluación independiente de THOX está pendiente. Las afirmaciones previas sobre puntuación Aider y comparación con GPT-4o fueron retiradas por carecer de respaldo.

| Benchmark | Resultado | Fuente |
|---|---|---|
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |
| Aider | retirado (sin evaluación THOX) | — |

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para la cuantización Q4_K_M en GGUF, más overhead de contexto; con 128K tokens de contexto el consumo de KV cache puede incrementar sustancialmente los requisitos.
- GPU recomendadas: A100 o H100 para despliegues con contexto largo y concurrencia; RTX 4090 (24 GB) como opción viable en cuantización Q4_K_M para uso individual.
- GPU de consumo: cabe en RTX 4090 y en tarjetas con 24 GB o más de VRAM; en GPUs de 16 GB requeriría cuantizaciones más agresivas no documentadas en esta distribución.
- Opciones de despliegue: Ollama como runtime principal (`ollama run Thox-ai/thox-cluster-code`); llama.cpp es compatible por el formato GGUF; vLLM y TGI requerirían los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles. La model card declara explícitamente que no se reclama ninguna cifra de rendimiento, latencia, concurrencia ni uptime para esta release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thox-cluster-code | 32B | 128K | Apache 2.0 | GGUF Q4_K_M | Distribución de Qwen2.5-Coder-32B-Instruct con configuración THOX |
| Qwen2.5-Coder-32B-Instruct | 32B | 128K | Apache 2.0 | safetensors, GGUF | Modelo base original de Alibaba; pesos idénticos |
| DeepSeek-Coder-V2 | 236B totales (21B activos, MoE) | 128K | licencia propia | safetensors | Alternativa MoE de mayor tamaño y eficiencia por token activo |
| CodeLlama-34B-Instruct | 34B | 16K | licencia Llama | safetensors, GGUF | Contexto menor y familia anterior; menos cobertura de lenguajes |

La comparación con el modelo base es la más directa: thox-cluster-code no difiere en pesos, solo en empaquetado y configuración de runtime. Frente a alternativas MoE como DeepSeek-Coder-V2, el modelo de THOX es más simple de desplegar en un solo dispositivo pero menos eficiente en cómputo por token.

## Limitaciones y advertencias

- Especializado en ingeniería de software; no es un modelo de chat de propósito general.
- El código generado requiere revisión humana antes de usarse en producción, según indica la propia model card.
- Despliegue exclusivamente local en esta distribución: el comportamiento y la velocidad dependen enteramente del hardware y la configuración del operador.
- Sin acceso a información online ni servicios externos salvo que el operador los integre manualmente.
- Riesgo de alucinación inherente al modelo base; los outputs pueden ser incorrectos.
- Idioma natural limitado al inglés; el soporte multilingüe se refiere a lenguajes de programación, no a idiomas naturales.
- La licencia Apache 2.0 permite uso comercial, pero los pesos siguen sujetos a los términos del proveedor upstream; verificar la model card de Qwen2.5-Coder-32B-Instruct.
- Sin evaluación independiente de THOX publicada; las cifras del catálogo original fueron retiradas por no estar verificadas.
- El ecosistema MeshStack y MagStack es propietario y requiere hardware ThoxNova o la app MeshStack, disponible a través de la campaña de Kickstarter de THOX.
- El repositorio de Hugging Face contiene únicamente la model card y archivos de repositorio; la build ejecutable se sirve desde Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-cluster-code
- Ollama: https://ollama.com/Thox-ai/thox-cluster-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Sitio de THOX: https://thox.ai
