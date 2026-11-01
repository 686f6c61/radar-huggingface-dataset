# vultr/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Qwen3.5-9B, publicada por Vultr. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 8.950 millones de parámetros que combina atención Gated DeltaNet con un codificador de visión, lo que le permite procesar entradas de imagen y texto (pipeline `image-text-to-text`) y mantener razonamiento sobre contextos largos.

La relevancia de esta publicación radica en dos factores. Por un lado, traslada un modelo de 9B con ventana de contexto de 262.000 tokens (extensible hasta ~1M) al ecosistema llama.cpp, lo que facilita su despliegue en infraestructura modesta. Por otro, Vultr emplea una estrategia de cuantización híbrida: en lugar de aplicar una única precisión a toda la red, asigna la precisión de cada capa a partir de una puntuación de importancia medida, concentrando los bits donde más afectan a la salida.

El repositorio tiene un tamaño de 26,2 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. En el momento de la consulta acumula 157 descargas y ningún "like", un dato coherente con su publicación reciente (27 de octubre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35, transformer denso con Gated DeltaNet y codificador de visión |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens, extensible a ~1M tokens |
| Tipos de cuantización | GGUF con cuantización híbrida por capa según puntuación de importancia (niveles concretos no disponibles) |
| Idiomas soportados | 200+ según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Datos arquitectónicos adicionales: 32 capas, hidden size de 4.096, 16 cabezas de atención, 4 cabezas key-value (GQA), dimensión intermedia de 12.288, vocabulario de 248.320 tokens y codificador de visión de 27 capas con hidden size de 1.152.

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas que incorpora Gated DeltaNet, un mecanismo de atención lineal orientado a razonamiento eficiente sobre contextos largos. La atención usa 16 cabezas de consulta y 4 cabezas key-value, lo que reduce el coste de memoria del KV cache. El componente multimodal lo aporta un codificador de visión de 27 capas y 1.152 de dimensión oculta, que proyecta las representaciones visuales al espacio del modelo de lenguaje.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la documentación proporcionada. La innovación técnica documentada por el publicador de la cuantización es el esquema híbrido por capas: cada capa recibe una precisión distinta elegida a partir de una puntuación de importancia medida empíricamente, de modo que las capas más sensibles conservan más bits y las menos sensibles se comprimen más agresivamente.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con el tag `conversational` en el repositorio.
- Comprensión de imagen y texto combinados (`image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos escaneados.
- Razonamiento sobre contextos largos gracias a la ventana de 262K tokens, extensible a ~1M.
- Cobertura multilingüe amplia: la model card declara más de 200 idiomas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución en llama.cpp, con el ecosistema de herramientas asociado (servidor compatible con API de OpenAI, gramáticas, plantillas de chat).
- No se documenta en la información disponible soporte explícito de tool calling, modo "thinking" ni entrada de audio.

## Casos de uso

- Análisis de documentos extensos: contratos, informes o expedientes de cientos de páginas que caben en la ventana de 262K tokens, evitando pipelines de troceado y recuperación; el modelo puede razonar sobre referencias cruzadas entre secciones distantes.
- Procesamiento de documentos escaneados: al combinar visión y texto, permite extraer campos de facturas, albaranes o formularios sin un OCR separado, reduciendo la complejidad del pipeline.
- Asistente de atención al cliente multi-turno: la ventana larga permite mantener el historial completo de la conversación y el contexto del cliente sin truncamiento, y el despliegue en llama.cpp abarata el coste por token frente a APIs externas.
- Despliegue en infraestructura propia o edge: el formato GGUF y el tamaño de 9B permiten servir el modelo en servidores con GPU de gama media o incluso en CPU, útil para organizaciones con requisitos de soberanía del dato.
- Traducción y localización multilingüe: con más de 200 idiomas declarados, sirve para traducción de documentación técnica o atención en mercados con idiomas minoritarios.
- Indexación y resumen de bases de conocimiento visual: catálogos de producto, capturas de pantalla o archivos multimedia donde se necesita generar descripciones textuales buscables.
- Prototipado rápido de aplicaciones multimodales: al ser Apache 2.0 y ejecutable en llama.cpp, permite validar productos sin comprometerse con un proveedor cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que la model card no detalla los niveles de cuantización concretos del repositorio (26,2 GB de tamaño total sugiere varias variantes). Como referencia orientativa para un modelo denso de 9B: Q4_K_M ronda los 5,5-6 GB, Q8_0 en torno a 9,5-10 GB y FP16 unos 18 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o A100/H100; para cuantizaciones Q4-Q5, GPUs consumer de 8-12 GB como RTX 3060, 4060 Ti o 4070.
- Cabe en GPU consumer: sí, en cuantizaciones de 4-6 bits en GPUs con 8 GB o más de VRAM. Con contexto muy largo, el KV cache incrementa el consumo y puede requerir más memoria o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, y otros runners compatibles con GGUF. Para el modelo multimodal es necesario un runner con soporte de proyector de visión en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (GGUF, Vultr) | ~8,95B | 262K (ext. ~1M) | Imagen + texto | Apache 2.0 | GGUF |
| Qwen3.5-9B (original) | ~8,95B | 262K (ext. ~1M) | Imagen + texto | Apache 2.0 | safetensors |
| Alternativas de 7-9B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo ni de robustez para esta cuantización; los sesgos del modelo base se heredan y pueden verse alterados por la compresión.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de extracción de datos de imágenes o documentos donde el modelo puede inventar campos ausentes.
- La cuantización híbrida por capas puede degradar capacidades específicas (por ejemplo, precisión en matemáticas o en OCR) de forma distinta a una cuantización uniforme; conviene validar en el caso de uso concreto antes de producción.
- El contexto extendido a ~1M tokens no está garantizado en todos los runners GGUF y depende de la implementación de atención; verificar el soporte real en la versión de llama.cpp utilizada.
- El soporte de tool calling y de modo de razonamiento no está documentado en esta ficha; no asumir su disponibilidad sin probarlo.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B por si añaden términos adicionales.
- El repositorio tiene muy poca tracción (157 descargas, 0 likes) y fue publicado recientemente; no hay evidencia comunitaria sobre su calidad frente a otras cuantizaciones del mismo modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vultr/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Vultr (sitio corporativo): https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
