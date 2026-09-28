# winterthurquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de pesos abiertos que acepta entradas de texto, imagen y audio y genera texto. Según su model card, lo desarrolla Thinking Machines Lab y se distribuye con licencia Apache 2.0. El repositorio consultado aparece publicado por el usuario winterthurquants, que replica la model card del autor original; conviene verificar la procedencia antes de usarlo en producción, ya que el autor del repositorio no coincide con el desarrollador del modelo.

Se trata de un transformer autoregresivo decoder-only de 42 capas con una red feed-forward de tipo Mixture-of-Experts disperso: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La model card declara 276B parámetros totales y 12B activos, mientras que el recuento real de los safetensors del repositorio es de 265.956.439.090 parámetros (unos 266B), con un tamaño de repositorio de 531,9 GB, coherente con pesos en BF16.

Su relevancia actual reside en que combina razonamiento multimodal nativo (texto, imagen y audio en un mismo espacio oculto) con un coste de inferencia propio de un modelo de 12B activos, además de un mecanismo de esfuerzo de pensamiento controlable. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 42 capas con backbone feed-forward MoE disperso (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida de capas locales y globales |
| Parametros totales | 276B según la model card; 265.956.439.090 (~266B) según el recuento de safetensors |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (según el autor); no se documentan GGUF ni otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (píxeles, 40px a 4096px por dimensión) y audio (WAV a 16 kHz, idealmente menos de 2 minutos) |
| Modalidad de salida | Texto (UTF-8) |
| Tamaño del repositorio | 531,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 42 capas con sustitución de la red feed-forward densa por una capa Mixture-of-Experts dispersa. El enrutamiento envía cada token a 6 de 256 expertos y mantiene 2 expertos compartidos activos para todos los tokens, lo que da lugar a 12B parámetros activos sobre 276B totales. La atención es híbrida, combinando capas de atención local con capas de atención global, un patrón habitual para reducir el coste del mecanismo de atención sin perder alcance efectivo a larga distancia.

La multimodalidad es nativa: las imágenes se codifican mediante un encoder jerárquico de parches y el audio mediante codificación en tokens discretos; ambas representaciones se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder, junto con el texto. La model card indica que los datos de entrenamiento cubren texto, imágenes, audio y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles públicamente, de terceros o generados y aumentados de forma sintética, con procesos de limpieza, deduplicación y filtrado por calidad y seguridad. No se especifica el número de tokens de entrenamiento, ni la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO. La página de presentación del modelo menciona un mecanismo de esfuerzo de pensamiento controlable, sin detallar su implementación.

## Capacidades

- Generación de texto y conversación general multi-turno, con seguimiento de instrucciones.
- Entrada de imagen: cualquier imagen basada en píxeles, con rendimiento óptimo si cada dimensión está entre 40px y 4096px.
- Entrada de audio: ficheros WAV a 16 kHz, con duración ideal inferior a 2 minutos.
- Razonamiento nativo sobre las tres modalidades de forma conjunta, no mediante adaptadores independientes.
- Uso como asistente de código, con soporte declarado para múltiples lenguajes de programación.
- Soporte de sistemas agénticos y de uso de herramientas (tool use), según la descripción de usos previstos de la model card.
- Integración en sistemas de generación aumentada por recuperación (RAG).
- Capacidades multilingües generales más allá del inglés.
- Esfuerzo de pensamiento controlable (thinking effort), orientado a equilibrar coste y rendimiento.
- Ajuste fino e integración por parte de terceros, al publicarse con pesos abiertos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno y aceptar capturas o imágenes enviadas por el usuario junto al texto, lo que permite resolver incidencias que requieren leer un pantallazo o un recibo sin pasos intermedios de OCR.
- Asistente de código en producción: al declarar soporte para múltiples lenguajes y uso de herramientas, puede integrarse en pipelines de CI/CD para revisar diffs, generar pruebas o consultar repositorios mediante function calling.
- Análisis de documentos con imagen y texto: extracción y razonamiento sobre facturas, informes escaneados o gráficos, aprovechando el encoder jerárquico de parches para imágenes de hasta 4096px por lado.
- Transcripción y análisis de reuniones cortas: con entrada de audio WAV a 16 kHz de menos de 2 minutos por clip, puede generar resúmenes, actas o listas de acciones a partir de fragmentos de audio.
- Agentes multi-paso con acceso a herramientas: uso del modelo como planificador o ejecutor dentro de un bucle agéntico que consulte APIs, bases de datos o servicios internos.
- Sistemas RAG multimodales: indexación de documentación con texto e imágenes y generación de respuestas citando las fuentes recuperadas.
- Moderación y clasificación de contenido: uso como clasificador generativo de texto, imagen o audio en pipelines de revisión.
- Prototipado e investigación en ajuste fino: al ser Apache 2.0 y publicarse con pesos abiertos, sirve como base para experimentos de destilación, cuantización o adaptación a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluaciones con una tabla categorizada en modelos de pesos abiertos y de pesos cerrados, en la que aparecen como comparadores Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numéricos de la tabla no están disponibles en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- Pesos en BF16: 276B parámetros implican aproximadamente 552 GB solo de pesos; el repositorio ocupa 531,9 GB, coherente con los ~266B parámetros reales en BF16. Añadiendo caché KV y activaciones, el despliegue requiere del orden de 600 GB de memoria de acelerador.
- Pesos en NVFP4 (aproximadamente 4 bits): entorno a 135-150 GB de pesos, más caché KV y sobrecarga del runtime.
- GPU recomendadas para BF16: 8x H100 80 GB (640 GB) o 4x H200 141 GB (564 GB, muy justo, probablemente 8x H200 para margen). Para NVFP4, 2x H100 80 GB o 2x H200 141 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Ni siquiera en NVFP4 (unas 140 GB) entra en una RTX 4090 de 24 GB; harían falta al menos 6-7 unidades y no se documenta soporte de paralelismo multi-GPU en ese escenario.
- Opciones de despliegue documentadas por el autor: SGLang, vLLM, TokenSpeed, Unsloth y transformers de Hugging Face. También se ofrece acceso por API a través de proveedores de inferencia de terceros.
- Latencia y throughput: no disponible. Al ser un MoE con 12B parámetros activos, el coste de cómputo por token es bajo en comparación con un modelo denso de 276B, pero el coste de memoria depende de cuántos expertos se activen por token y de la estrategia de paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | 276B declarados / 265,96B reales | 12B | no disponible | Apache 2.0 | Pesos abiertos (BF16 y NVFP4) |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | Aparece como comparador en la model card |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Aparece como comparador en la model card |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Aparece como comparador en la model card |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Aparece como comparador en la model card |

No hay datos de rendimiento comparado disponibles en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio consultado está publicado por el usuario winterthurquants, no por Thinking Machines Lab, pese a que la model card es la del autor original. Es una redistribución no verificada: conviene contrastar el hash de los pesos con el repositorio oficial antes de usarla.
- Discrepancia de parámetros: la model card declara 276B totales mientras que los safetensors suman 265.956.439.090 parámetros. La diferencia no está explicada en la información disponible.
- No se especifica la longitud de contexto, un dato crítico para planificar despliegues con RAG, agentes o conversaciones largas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas multimodales (lectura de gráficos, documentos escaneados o audio con ruido) donde los errores de percepción pueden propagarse al texto generado.
- Sesgos: los datos de entrenamiento provienen de internet público, terceros y generación sintética, con procesos de deduplicación y filtrado, pero la model card no documenta una evaluación de sesgos ni de equidad.
- Límites de audio: formato WAV a 16 kHz y duración ideal inferior a 2 minutos por clip.
- Límites de imagen: rendimiento óptimo declarado entre 40px y 4096px por dimensión; fuera de ese rango la calidad puede degradarse.
- Idiomas: el inglés es el idioma principal; el multilingüismo se describe como capacidad general, sin lista de idiomas soportados ni evaluación por idioma.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el desarrollador publica además una política de uso aceptable que puede imponer restricciones adicionales sobre determinados usos.
- Ausencia de tracción en el repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de la comunidad sobre su comportamiento en producción.
- No se documentan cuantizaciones GGUF, por lo que no hay una vía conocida de despliegue en CPU o en hardware de gama baja.

## Enlaces

- Repositorio consultado: https://huggingface.co/winterthurquants/Inkling-Small
- Pesos BF16 (autor original): https://huggingface.co/thinkingmachines/Inkling-Small
- Pesos NVFP4 (autor original): https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de presentación: https://thinkingmachines.ai/news/introducing-inkling/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre el modelo: https://hf.co/blog/thinkingmachines-inkling
- Análisis de rendimiento y precio: https://artificialanalysis.ai/models/inkling-small
- Réplica adicional en Hugging Face: https://huggingface.co/winterthurquant/Inkling-Small-w
- Réplica NVFP4 adicional: https://huggingface.co/baerquants/Inkling-Small-NVFP4
