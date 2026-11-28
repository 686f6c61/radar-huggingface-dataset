# SPK1337/Inkling-2-Mini-Uncensored-GSQ-RCO-IQ3_S-NInfer-v3

## Resumen

Inkling 2 Mini Uncensored — GSQ-RCO IQ3_S | NInfer v3 es un artefacto de inferencia local derivado de `thinkingmachines/Inkling-2-Mini`, un modelo multimodal (entrada de texto e imagen, salida de texto) publicado por Thinking Machines Lab. El autor, SPK1337, lo distribuye cuantizado en precisión mixta GSQ-RCO IQ3_S y con un adaptador Rank-1 fijo de AtomicChat, empaquetado en el formato propietario `.ninfer` (tipo de modelo protegido `inkling2_rank1_v1`) para su uso exclusivo con el runtime NInfer v3 sobre GPU NVIDIA RTX 4090 en Windows.

El objetivo del artefacto es ofrecer decodificación especulativa de alto rendimiento en una sola GPU de consumo: incorpora dos drafters alternativos, DFlash2 (K7) y DSpark (K3), que según el autor elevan el throughput de decodificación de 108,3 tok/s sin drafter a 302,2 tok/s con DFlash2 K7 en una prueba concreta. El artefacto ocupa 12.966.136.064 bytes (12,08 GiB) y declara soporte de contexto largo (hasta 262.144 tokens configurados, con 250.006 tokens de prompt efectivos probados).

Es relevante ahora porque demuestra una ruta de despliegue multimodal, con tool calling y contexto largo, sobre hardware consumer, aunque con un ecosistema cerrado (runtime propio, formato no estándar) y con resultados de benchmark generados por el propio autor bajo protocolos no canónicos, lo que limita la comparabilidad con otras implementaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base `thinkingmachines/Inkling-2-Mini`; el artefacto es una cuantización con adaptador Rank-1, sin detalles de arquitectura publicados en la información disponible) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 262.144 tokens configurados; 250.006 tokens de prompt efectivos probados |
| Tipos de cuantizacion | GSQ-RCO IQ3_S de precisión mixta (matrices de texto); adaptador Rank-1 con escala fija 1 y factores FP32; caché KV RK8V4 en benchmarks; se mencionan además rutas Q8 y BF16 para el adaptador en pruebas de activación |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer v3, tipo `inkling2_rank1_v1`); no es GGUF, Transformers ni llama.cpp |
| Modalidades | Entrada de texto e imagen, salida de texto |
| Tamaño del artefacto | 12.966.136.064 bytes (12,08 GiB); no equivale a la VRAM total del runtime |
| Decodificación especulativa | DFlash2 K7 o DSpark K3 (alternativos, no simultáneos) |
| API | Chat completions local compatible con OpenAI y tool calls estructurados |
| Hardware probado | NVIDIA GeForce RTX 4090 24 GB, Windows, CUDA 13.4 / SM89 |
| Runtime | NInfer RTX 4090 v0.1.8 o posterior compatible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de parámetros totales o activos. El artefacto no reentrena ni recuantiza los pesos de texto: las matrices GSQ-RCO originales se mantienen sin cambios y se aplican factores Rank-1 separados sobre los embeddings de tokens, las proyecciones de salida de atención y las proyecciones down de los expertos en cada visita de capa física. El autor indica que el adaptador forma parte de la identidad del artefacto y no es un conmutador por petición.

La innovación técnica destacable es la integración de decodificación especulativa con dos drafters alternativos (DFlash2 K7 y DSpark K3) sobre el runtime NInfer, junto con una caché KV en formato RK8V4. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. Tampoco se documenta el proceso de entrenamiento del adaptador Rank-1 más allá de su configuración (escala fija 1, factores FP32).

## Capacidades

- Generación de texto multimodal: acepta texto e imágenes como entrada y produce texto.
- Generación de código: el autor reporta 160/164 tareas resueltas en HumanEval bajo un protocolo local adaptado a chat.
- Contexto largo: soporte configurado de hasta 262.144 tokens, con recuperación de claves en un prompt sintético de 250.006 tokens.
- Tool calling / function calling: soporte de llamadas a herramientas estructuradas a través de la API local compatible con OpenAI.
- API compatible con OpenAI: chat completions local, lo que facilita la integración con clientes existentes.
- Decodificación especulativa: dos drafters alternativos para acelerar la generación.
- Variante "uncensored": el autor elimina o relaja restricciones de contenido respecto al modelo base (sin detalles técnicos publicados sobre el método).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el artefacto permite ejecutar un modelo con buen rendimiento en HumanEval (según la medición del autor) sobre una RTX 4090, útil para autocompletado y generación de funciones en entornos sin conexión a la nube.
- Análisis de documentos largos con imágenes: gracias al contexto de hasta 262.144 tokens y a la entrada multimodal, se puede usar para resumir informes extensos con gráficos o capturas intercaladas en una sola pasada.
- Automatización de agentes con tool calling: la API compatible con OpenAI y las llamadas estructuradas permiten integrarlo en pipelines de agentes que consultan APIs externas o bases de datos.
- Prototipado de asistentes conversacionales multi-turno: el contexto largo reduce la necesidad de truncar historiales, lo que simplifica el desarrollo de chatbots con memoria extensa.
- Inferencia de bajas latencias en estación de trabajo: con DFlash2 K7 el autor mide 302,2 tok/s en decodificación, adecuado para aplicaciones interactivas que requieren respuestas rápidas en una sola GPU consumer.
- Investigación sobre decodificación especulativa: el artefacto sirve como banco de pruebas para comparar DFlash2 y DSpark en un entorno controlado (RTX 4090, Windows, CUDA 13.4).
- Procesamiento de imágenes en local con requisitos de privacidad: al ejecutarse íntegramente en la GPU del usuario, evita enviar datos visuales a servicios externos.

## Benchmarks y rendimiento

Los datos proceden del autor y se obtuvieron con protocolos locales no canónicos. Se presentan tal cual, sin normalización.

Throughput de decodificación (prompt de código de 30 tokens, 512 tokens comprometidos, greedy, RK8V4, contexto 8K, una ejecución por configuración):

| Decoder | Decode (tok/s) | Relativo a sin drafter |
|---|---:|---:|
| Sin drafter | 108,3 | 1,00× |
| DSpark K3 | 240,7 | 2,22× |
| DFlash2 K7 | 302,2 | 2,79× |

HumanEval (164 tareas, protocolo local adaptado a chat, DFlash2 K7, RK8V4, contexto 8.192, temperatura 0, límite de 4.096 tokens de salida):

| Métrica | GSQ-RCO original | GSQ-RCO + AtomicChat Rank-1 |
|---|---:|---:|
| Pass@1 funcional (protocolo local) | 160/164 (97,56%) | 160/164 (97,56%) |
| Decodificación media por petición | 303,61 tok/s | 288,30 tok/s |
| Finalización normal | 164/164 | 164/164 |
| Tokens totales generados | 150.002 | 149.921 |

Pruebas separadas de la ruta de activación (no forman parte de la comparación de drafters): 75,4 tok/s con adaptador BF16, 86,3 tok/s con Q8 sin grafos, 116,6 tok/s con Q8 y grafos, y 144,1 tok/s para el modelo original con grafos.

El autor advierte que la puntuación de HumanEval no es directamente comparable con la métrica canónica en formato de completación y que las tasas medidas son específicas de la carga de trabajo, no un throughput sostenido garantizado.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 12,08 GiB, pero el autor indica explícitamente que no equivale a la VRAM total del runtime; no se publica la cifra exacta de VRAM en inferencia.
- GPU probada: NVIDIA GeForce RTX 4090 de 24 GB, en Windows con CUDA 13.4 y SM89.
- Cabe en GPU consumer: sí, al menos en RTX 4090; no se documenta compatibilidad con otras GPU consumer.
- Restricción de dispositivo: solo expertos residentes en una única GPU (single-GPU device-resident experts).
- Opciones de despliegue: exclusivamente el runtime NInfer RTX 4090 v0.1.8 o posterior; no es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: 302,2 tok/s con DFlash2 K7 y 240,7 tok/s con DSpark K3 en la prueba de decodificación del autor; 108,3 tok/s sin drafter.
- Nota: el soporte nativo de Rank-1 en el runtime es experimental, aunque el runtime tenga una release regular.

## Comparativa con modelos similares

No se dispone de datos de benchmarks canónicos ni de especificaciones de parámetros del modelo base, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría. La siguiente tabla recoge únicamente lo que la información disponible permite afirmar.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Uncensored GSQ-RCO IQ3_S NInfer v3 | No disponible | Hasta 262.144 tokens | Apache 2.0 | `.ninfer` | Hugging Face, runtime NInfer |
| `thinkingmachines/Inkling-2-Mini` (base) | No disponible | No disponible | No disponible en la información | No disponible | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ecosistema cerrado: el artefacto solo funciona con el runtime NInfer v0.1.8 o posterior; no es un checkpoint GGUF, Transformers ni llama.cpp.
- Soporte experimental: el soporte nativo de Rank-1 en el runtime está marcado como experimental, lo que implica riesgo de inestabilidad o cambios de comportamiento entre versiones.
- Benchmarks no canónicos: el 97,56% de HumanEval se obtuvo con un protocolo local adaptado a chat, no con el formato canónico de completación, y no debe compararse directamente con puntuaciones publicadas de otros modelos.
- Muestras únicas: los benchmarks de throughput se basan en una ejecución por configuración y un único prompt de código; no hay garantía de throughput sostenido.
- Recuperación en contexto largo: la prueba de 250.006 tokens consiste en tres claves plantadas en un prompt sintético, un escenario mucho más simple que la recuperación real en documentos largos.
- Variante "uncensored": al relajarse las restricciones de contenido del modelo base, aumenta el riesgo de generar contenido inapropiado, sesgado o dañino; no se documenta el método de eliminación de alineamiento ni los sesgos resultantes.
- Alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base y del adaptador Rank-1 de AtomicChat no se detallan en la información disponible; conviene verificarlas antes de un despliegue en producción.
- Hardware: solo se documenta funcionamiento en RTX 4090 con Windows y CUDA 13.4; no hay datos de compatibilidad con otras GPU, Linux u otros drivers.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SPK1337/Inkling-2-Mini-Uncensored-GSQ-RCO-IQ3_S-NInfer-v3
- Descarga del artefacto: https://huggingface.co/SPK1337/Inkling-2-Mini-Uncensored-GSQ-RCO-IQ3_S-NInfer-v3/resolve/main/Inkling-2-Mini-GSQ-RCO-IQ3S-Rank1-v1-EXPERIMENTAL.ninfer
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del runtime NInfer: https://github.com/spk-c/ninfer-all-rtx4090
- Release del runtime (v0.1.8): https://github.com/spk-c/ninfer-all-rtx4090/releases/tag/rtx4090-v0.1.8
- Última release del runtime: https://github.com/spk-c/ninfer-all-rtx4090/releases/latest
- Portal del proyecto: https://spk-c.github.io/ninfer-all-rtx4090/
- Catálogo de modelos: https://spk-c.github.io/ninfer-all-rtx4090/models.html
- Benchmarks: https://spk-c.github.io/ninfer-all-rtx4090/benchmarks.html
- Guía de instalación en Windows: https://spk-c.github.io/ninfer-all-rtx4090/windows.html#inkling2-start
