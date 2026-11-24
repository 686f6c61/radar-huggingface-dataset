# stupid-zwl/JDI-Decision-V1

## Resumen

JDI-Decision-V1 es un sistema multimodal de decisión desarrollado por JD Industrials (京东工业), la división industrial del gigante chino JD.com. Se presenta como una evolución del modelo JDI-Decision-V0.9, que según la model card disponible está basado en Qwen3.8-27B con adaptaciones de la arquitectura de decisión D3. El modelo no genera texto libre: produce elecciones estructuradas y probabilidades asociadas a cada opción, tanto para entradas de texto como de imagen. Internamente combina un codificador visual, un componente OCR congelado (PaddleOCR v5 de Baidu), un backbone de decisión y una cabeza de lectura en FP32.

El modelo resuelve un problema concreto: tomar decisiones clasificatorias sobre estados multimodal (preguntas con opciones y criterios), devolviendo la opción seleccionada junto con su probabilidad. Es relevante en el contexto de sistemas de inspección, verificación documental o control de calidad industrial, donde se necesita una salida estructurada y auditable en lugar de texto generativo. El repositorio de Hugging Face bajo el identificador `stupid-zwl/JDI-Decision-V1` contiene en realidad la V0.9; la V1 oficial se ha trasladado a la organización `JoyIndustrial/JDI-Decision-V1`, según indica la propia model card.

El modelo cuenta con 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) según los pesos en safetensors, y el repositorio ocupa 52,2 GB. La licencia es CC BY-NC 4.0, lo que restringe el uso a fines no comerciales salvo autorización expresa. No se dispone de información pública sobre la longitud de contexto, los idiomas soportados ni el pipeline de inferencia estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone de decisión D3 sobre base Qwen3.8-27B (codificador visual + OCR PaddleOCR v5 congelado + backbone de decisión + cabeza de lectura FP32) |
| Parámetros totales | 26.085.330.160 (~26,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso no comercial con atribución; uso comercial requiere permiso separado) |
| Formato de pesos | safetensors (librería pytorch, con custom_code) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card combina varias ramas que se ejecutan de forma concurrente en una misma GPU. El flujo de inferencia decodifica la imagen, la convierte a RGB y la redimensiona hasta un límite de píxeles antes de pasar por dos ramas internas paralelas: un codificador visual que extrae características de la imagen y un componente OCR congelado (PaddleOCR v5 de Baidu) que reconoce el texto presente. La transcripción OCR se incorpora al estado mediante `state.image_text_transcription` junto con el estado original, de modo que el texto reconoce complementa pero no sustituye la información visual. El backbone de decisión procesa las características visuales junto con el texto, las preguntas y las opciones, y una cabeza de lectura en FP32 genera la respuesta estructurada y las probabilidades por opción.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card remite a un documento `REPRODUCE.md` para los detalles de la arquitectura base y del runtime de decisión, pero ese contenido no forma parte de la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La característica técnica destacable es la integración de un OCR congelado de terceros (PaddleOCR v5) dentro del pipeline, con verificación SHA256 de los archivos en el script de instalación, y la reutilización de características visuales únicamente dentro de cada petición.

## Capacidades

- Toma de decisiones estructuradas: devuelve una opción seleccionada y su probabilidad a partir de un conjunto de criterios definidos por el usuario.
- Procesamiento multimodal: acepta imágenes y texto en la misma petición.
- Reconocimiento de texto en imágenes mediante PaddleOCR v5 integrado en el pipeline.
- Salida con probabilidades por opción, útil para umbrales de confianza y revisión humana.
- Soporte de preguntas con criterios tipados (por ejemplo, `type: choice` con opciones A/B y descripciones).
- Ejecución por petición en una sola GPU, con aislamiento de características visuales entre peticiones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inspección visual en entornos industriales: el modelo puede recibir una imagen de una pieza o etiqueta y una pregunta con opciones (por ejemplo, "¿el sello es correcto? A: sí, B: no") y devolver la decisión con probabilidad, aprovechando la rama OCR para leer números de serie o códigos impresos.
- Verificación documental: con la transcripción OCR integrada, puede clasificar documentos escaneados según criterios predefinidos (tipo de documento, presencia de campos obligatorios) devolviendo una opción estructurada en lugar de texto libre.
- Control de calidad en líneas de producción: la latencia reportada (mediana de 282,4 ms, P90 de 604,2 ms en dos H200) permite integrarlo en bucles de inspección casi en tiempo real, siempre que se valide en el hardware objetivo.
- Señalización y cartelería: el ejemplo de la model card ("¿qué dice el cartel? A: STOP, B: GO") ilustra el uso para lectura y clasificación de rótulos en entornos logísticos o de almacén.
- Enrutamiento de decisiones con umbral de confianza: al devolver probabilidades por opción, puede emplearse como primer filtro automático y derivar a revisión humana los casos con probabilidad baja.
- Evaluación comparativa de sistemas de decisión: el paquete incluye un punto de entrada (`ocr_inference.ComboEngine`) y artefactos de evaluación pública, lo que permite reproducir el suite y comparar configuraciones en investigación.
- Clasificación de estados multimodal en investigación: útil para estudiar arquitecturas de decisión que combinan visión, OCR y un backbone lingüístico, dado que el modelo expone un motor interno (`inference.D3Engine`) separado del pipeline completo.

## Benchmarks y rendimiento

La model card reporta una puntuación autodeclarada en el "Decision Index Vision public suite" de 79,3601, con 12.210/12.210 peticiones exitosas en 11 benchmarks. Se trata de una puntuación pública autodeclarada, no de un rango confirmado en un leaderboard ni de la puntuación "Full". La evaluación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes según el autor. La ejecución se realizó en dos workers H200, cada uno con una réplica completa del sistema y una petición a la vez.

| Métrica de latencia | Valor |
|---|---|
| Media | 345,5 ms |
| P50 | 282,4 ms |
| P80 | 426,8 ms |
| P90 | 604,2 ms |

La latencia incluye decodificación, OCR, codificación visual y el forward de decisión; excluye carga, hashing de integridad y ejecuciones de profiler. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible, por lo que no se incluyen comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 26,1 mil millones de parámetros en FP32, el peso de los pesos rondaría los 104 GB; el repositorio de 52,2 GB sugiere pesos en BF16/FP16 (aproximadamente 52 GB), lo que exigiría al menos una GPU de 80 GB para inferencia sin cuantización.
- GPU recomendadas: la evaluación se realizó en H200. El autor menciona una validación oficial pendiente en RTX PRO 6000.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con ~52 GB en BF16 no cabría en una RTX 4090 (24 GB) sin cuantización, y no se documentan cuantizaciones disponibles.
- Opciones de despliegue: el paquete incluye scripts propios (`ocr_inference/setup.sh`, `ComboEngine`, `inference.D3Engine`) con Python 3.12 y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: media de 345,5 ms y P50 de 282,4 ms por petición en H200, con una petición concurrente por GPU en la configuración evaluada. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JDI-Decision-V1 (V0.9 en este repo) | ~26,1 B | no disponible | Decisión multimodal (visión + OCR + backbone) | CC BY-NC 4.0 | Hugging Face (repo `stupid-zwl`, V1 oficial en `JoyIndustrial`) |
| Qwen3.8-27B (base declarada) | ~27 B (según nombre) | no disponible | LLM generativo | no disponible en esta información | no disponible en esta información |
| PaddleOCR v5 (componente) | no disponible | no aplica | OCR | licencia upstream de Paddle | Hugging Face / Paddle |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría. La comparación con Qwen3.8-27B es estructural (es la base declarada), no de rendimiento. No se identifican en la información proporcionada otros sistemas de decisión multimodal directamente comparables.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: el uso comercial requiere autorización separada de JD Industrials; la atribución es obligatoria. Los componentes de terceros (PaddleOCR, cabeceras de Paddle) mantienen sus propias licencias.
- El repositorio `stupid-zwl/JDI-Decision-V1` contiene la V0.9, no la V1; la V1 oficial está en `JoyIndustrial/JDI-Decision-V1`. Verificar el identificador antes de descargar.
- La puntuación de 79,3601 es autodeclarada y corresponde al suite público de visión; no es un rango de leaderboard ni la puntuación completa. La evaluación privada y la validación de latencia en RTX PRO 6000 están pendientes.
- No se documentan sesgos conocidos, pero al integrar un OCR de terceros y un backbone lingüístico hereda los sesgos de ambos componentes; no hay información sobre evaluación de sesgos.
- Riesgo de alucinación en la selección de opciones: al devolver probabilidades, conviene aplicar umbrales de confianza y revisión humana en decisiones críticas.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que limita la planificación de despliegues multilingües o con entradas largas.
- El modelo no genera texto libre; no es adecuado para tareas generativas, de resumen o de conversación abierta.
- La latencia reportada se midió en H200 con una petición concurrente por GPU; el rendimiento en otros hardware o con mayor concurrencia no está validado.
- Requiere Python 3.12 y GPU CUDA; el script de instalación descarga archivos OCR de servidores de Paddle y verifica SHA256, lo que introduce una dependencia de red y de integridad en el despliegue.
- El texto de transcripción OCR se excluye del export público de resultados de evaluación, lo que limita la auditoría completa de las salidas.

## Enlaces

- Repositorio Hugging Face (V0.9): https://huggingface.co/stupid-zwl/JDI-Decision-V1
- V1 oficial en JoyIndustrial: https://huggingface.co/JoyIndustrial/JDI-Decision-V1
- Dataset de resultados de evaluación: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V0.9/tree/main/runs/vision-paddle-v5
- Guía de reproducción (referenciada en la model card): REPRODUCE.md (ruta relativa dentro del repositorio)
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- PaddleOCR (componente de terceros): no se proporciona URL específica en la información disponible
