# vultr/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5 0.8B es un modelo de lenguaje multimodal compacto desarrollado por Qwen (Alibaba) que combina un transformer causal con un codificador de visión para razonamiento entre modalidades. La versión aquí descrita es la cuantización GGUF publicada por Vultr, un proveedor de infraestructura cloud, que aplica una estrategia de cuantización híbrida: en lugar de usar una precisión uniforme en toda la red, selecciona la precisión de cada capa a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida.

El modelo base tiene 752.393.024 parámetros (aproximadamente 0,8B), arquitectura densa de 24 capas con tamaño oculto de 1024, 8 cabezas de atención y 2 cabezas clave-valor (GQA), y una longitud de contexto de 262K tokens. Integra Gated DeltaNet (atención lineal) y predicción multi-token (MTP), orientado a inferencia de baja latencia en entornos con recursos limitados.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo multimodal con contexto muy largo en hardware modesto mediante llama.cpp, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35, transformer causal denso con codificador de visión, Gated DeltaNet (atención lineal) y predicción multi-token (MTP) |
| Parámetros totales | 752.393.024 (0,8B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | GGUF con cuantización híbrida por capa según puntuación de importancia (niveles concretos no disponibles) |
| Idiomas soportados | 200+ según la model card del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 24 |
| Tamaño oculto | 1024 |
| Cabezas de atención | 8 |
| Cabezas clave-valor | 2 (GQA) |
| Vocabulario | 248.320 tokens |
| Tamaño del repositorio | 2,7 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 24 capas con tamaño oculto de 1024, 8 cabezas de atención y 2 cabezas clave-valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. Incorpora Gated DeltaNet, un mecanismo de atención lineal que busca escalar a contextos largos con coste sublineal, y predicción multi-token (MTP), que permite generar varios tokens por paso de decodificación y mejora el throughput. El componente multimodal lo aporta un codificador de visión acoplado al transformer para comprensión image-text-to-text.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del autor solo indica que el modelo está diseñado para comprensión multimodal eficiente, razonamiento sólido y soporte multilingüe amplio con baja latencia. La cuantización publicada por Vultr es híbrida: asigna precisión por capa a partir de una puntuación de importancia medida, en lugar de aplicar un único nivel de cuantización a toda la red.

## Capacidades

- Generación de texto y razonamiento en un modelo de 0,8B parámetros.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento entre modalidades.
- Soporte multilingüe amplio (200+ idiomas según la model card).
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Predicción multi-token (MTP) para acelerar la generación.
- Atención lineal Gated DeltaNet para eficiencia en secuencias largas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262K tokens de contexto, el modelo puede ingerir contratos, informes o expedientes completos y responder preguntas sobre ellos sin fragmentación, ejecutándose en CPU o GPU modesta mediante llama.cpp.
- Análisis de capturas y documentos escaneados: al ser image-text-to-text, permite extraer información de imágenes y texto en un mismo flujo, útil para digitalización de formularios o revisión de tickets.
- Asistentes conversacionales de bajo coste: el tamaño de 0,8B y la caché KV reducida (2 cabezas KV) permiten desplegar chatbots multi-turno en servidores pequeños o en el borde, con latencia baja gracias a MTP.
- Preprocesamiento y clasificación de contenido multilingüe: con soporte de 200+ idiomas, sirve para etiquetar, resumir o enrutar textos en pipelines de datos antes de pasarlos a modelos mayores.
- Prototipado rápido de aplicaciones multimodales: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en prototipos comerciales sin negociación de licencia, usando Ollama o llama.cpp.
- Filtrado y moderación en tiempo real: su reducido coste computacional permite evaluar cada mensaje de un flujo de entrada con contexto suficiente para detectar intenciones o contenido sensible.
- Educación y experimentación: sirve como banco de pruebas para estudiar cuantización híbrida, atención lineal y MTP en un modelo abierto y pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,8B parámetros, las cuantizaciones GGUF habituales de 4-8 bits ocupan aproximadamente entre 0,5 GB y 1 GB de pesos, más la caché KV. El tamaño total del repositorio es de 2,7 GB, lo que sugiere que incluye varias variantes de cuantización.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutar las variantes más pequeñas; para contexto largo conviene una GPU con 8-16 GB (RTX 3060, RTX 4060 Ti, RTX 4090) o inferencia en CPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con al menos 4 GB de VRAM para cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con la API de endpoints (la model card indica `endpoints_compatible`); vLLM y TGI no se mencionan para este formato GGUF en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura incorpora MTP y atención lineal, que en teoría reducen el coste por token, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5 0.8B (GGUF, Vultr) | 0,8B | 262K | Texto + imagen | Apache 2.0 | GGUF |
| Qwen3.5 0.8B (base, Qwen) | 0,8B | 262K | Texto + imagen | Apache 2.0 | safetensors |
| Alternativas de ~1B con visión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El tamaño de 0,8B implica una capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor escala; es previsible una tasa de alucinación superior en tareas que requieren conocimiento específico.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez para esta versión cuantizada; los sesgos del modelo base pueden verse alterados por la cuantización.
- La cuantización híbrida por capa puede introducir degradaciones no uniformes respecto al modelo original; conviene validar la variante concreta elegida en la tarea objetivo.
- Aunque la model card declara 200+ idiomas, no se especifica el rendimiento por idioma ni la calidad relativa en castellano.
- El contexto de 262K tokens es teórico; el rendimiento real en secuencias muy largas depende del soporte de llama.cpp y de la memoria disponible para la caché KV.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda conservar los avisos de atribución correspondientes.
- El repositorio tiene pocas descargas (183) y ningún like en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su calidad en producción.
- No hay información sobre tool calling, agentes o modo thinking, por lo que no debe asumirse su disponibilidad sin verificación empírica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vultr/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Sitio de Vultr: https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Wikipedia de Vultr: https://en.wikipedia.org/wiki/Vultr
