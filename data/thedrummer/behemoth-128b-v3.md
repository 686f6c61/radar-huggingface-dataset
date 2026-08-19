# TheDrummer/Behemoth-128B-v3

## Resumen

Behemoth-128B-v3 es un modelo de lenguaje de gran tamaño desarrollado por TheDrummer, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo base mistralai/Mistral-Medium-3.5-128B, lo que lo sitúa en la categoría de modelos densos de aproximadamente 125 mil millones de parámetros. El repositorio contiene únicamente los pesos en formato safetensors, con un tamaño total de 250,1 GB, y la model card está marcada como "work in progress", por lo que la documentación disponible es mínima.

La relevancia de este modelo radica en que hereda la arquitectura y capacidades de Mistral Medium 3.5, uno de los modelos propietarios de Mistral AI, pero liberado aquí con una licencia permisiva (Apache 2.0). Esto permite su uso comercial sin las restricciones típicas de los modelos propietarios. Sin embargo, al carecer de documentación técnica detallada, cualquier evaluación debe basarse en pruebas empíricas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en mistralai/Mistral-Medium-3.5-128B) |
| Parametros totales | 125.025.988.608 (125B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de ajuste fino. La unica referencia en la model card es la frase "Tested without reasoning on Mistral v7 Tekken", que sugiere que el autor probo el modelo sin activar el modo de razonamiento, pero no aporta detalles sobre el entrenamiento. Dado que el modelo base es Mistral-Medium-3.5-128B, se puede inferir que la arquitectura es un transformer denso con aproximadamente 125B parametros, pero no se confirma ningun dato adicional como numero de capas, dimensiones ocultas o atencion.

## Capacidades

- Generacion de texto: al ser un finetune de Mistral Medium 3.5, se espera que herede las capacidades de generacion de texto del modelo base, aunque no hay verificacion independiente.
- Razonamiento: la model card menciona pruebas "sin razonamiento", lo que indica que el modelo puede operar en modo estandar, pero no se documenta si soporta un modo de pensamiento extendido.
- Otras capacidades (tool calling, agentes, multilingue, vision, etc.): no disponible.

## Casos de uso

Dada la falta de documentacion, los casos de uso son especulativos y deben validarse empiricamente:

- Prototipado rapido de aplicaciones de texto: al tener licencia Apache 2.0, se puede integrar en proyectos comerciales sin coste de licencia, siempre que se disponga de hardware suficiente.
- Investigacion academica: sirve como punto de partida para estudiar el comportamiento de modelos de 125B con pesos abiertos.
- Fine-tuning adicional: los pesos safetensors permiten realizar ajustes finos sobre dominios especificos, aunque se requiere infraestructura de alto rendimiento.
- Evaluacion comparativa de modelos: puede utilizarse como referencia en benchmarks frente a otros modelos de tamano similar.
- Despliegue en entornos controlados: con cuantizacion adecuada (no incluida en el repo) podria ejecutarse en clusters con varias GPUs.
- Generacion de codigo o analisis de datos: si el modelo base tiene esas capacidades, podrian estar presentes, pero no hay evidencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 125B parametros en precision FP16, se necesitan aproximadamente 250 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits se reduciria a ~125 GB, y a 4 bits a ~63 GB.
- GPUs recomendadas: para inferencia sin cuantizar, se requieren multiples GPUs de alta gama (por ejemplo, 4x A100 80GB o 8x H100 80GB). Con cuantizacion 4 bits, podria caber en 2x RTX 4090 24GB o 1x A100 80GB, aunque con limitaciones de contexto.
- Consumer GPU: no es viable en una unica GPU de consumo (16-24 GB) sin cuantizacion extrema (2-3 bits), lo que degradaria significativamente la calidad.
- Opciones de despliegue: al ser solo safetensors, se puede usar con vLLM, TensorRT-LLM o Transformers con aceleracion. No hay archivos GGUF en el repo, por lo que llama.cpp o Ollama requieren conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo se posiciona en la gama de 125B parametros, similar a otros como Llama 3.1 405B (mucho mayor) o Qwen 2.5 72B (menor), pero sin benchmarks publicados no es posible establecer una comparacion objetiva. Se indica "no disponible" por falta de informacion.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no documentados, pero al ser un modelo de 125B sin informacion sobre el dataset de entrenamiento, existe riesgo de sesgos y fabricacion de contenido.
- Documentacion insuficiente: la model card es un placeholder ("Model card WIP"), lo que impide conocer limitaciones especificas, idiomas soportados o longitudes de contexto.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Mistral-Medium-3.5-128B) tenga una licencia compatible; Mistral Medium es tipicamente de uso restringido, por lo que el autor del finetune debe haber obtenido los derechos correspondientes.
- Riesgo de produccion: sin datos de rendimiento ni pruebas de robustez, no se recomienda su uso en entornos criticos sin una evaluacion exhaustiva.
- Hardware exigente: los requisitos de memoria son elevados, lo que limita su despliegue a organizaciones con infraestructura GPU dedicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrummer/Behemoth-128B-v3
- Modelo base (referencia): https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- No se han encontrado papers, blogs o demos adicionales asociados a este modelo.
