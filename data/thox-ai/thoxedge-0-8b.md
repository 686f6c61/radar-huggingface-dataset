# Thox-ai/ThoxEdge-0.8B

## Resumen

ThoxEdge-0.8B es un modelo de generación de texto de 0,8 mil millones de parámetros desarrollado por Thox-ai, construido mediante la fusión de un adaptador LoRA (Wave C) sobre el modelo base Qwen/Qwen3.5-0.8B de Alibaba. Se distribuye como pesos fusionados en bf16 junto con conversiones GGUF (Q4_K_M y Q8_0) y un Modelfile de Ollama, con licencia Apache 2.0 y acceso público sin gating.

El modelo está diseñado específicamente para despliegue en dispositivo (*on-device*) y entornos *edge*, con el objetivo declarado de responder a partir de hechos canónicos de THOX y rechazar preguntas sobre información que THOX no ha publicado. No es un modelo de propósito general: su ajuste supervisado (SFT) se realizó sobre un corpus propietario de 982 filas, lo que lo orienta a conversación y a un dominio acotado.

Su relevancia actual radica en el formato de distribución: un modelo sub-1B con pesos abiertos, cuantizaciones listas para consumir y soporte nativo en Ollama y llama.cpp, lo que lo hace apto para prototipado rápido en hardware de consumo. La información sobre arquitectura interna, contexto máximo y benchmarks es limitada en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

ThoxEdge-0.8B es un transformer decoder-only derivado de Qwen3.5-0.8B. El proceso de construcción consistió en entrenar un adaptador LoRA (publicado por separado como Thox-ai/ThoxEdge-0.8B-WaveC) sobre datos SFT propios de THOX (dataset `Thox-ai/thox-factory-sft-v5`, corpus de 982 filas) y fusionarlo posteriormente en los pesos base en bf16. No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

La model card describe el build como "Wave C" y lo identifica como el primer build fusionado publicado de esta categoría sobre el corpus de 982 filas; el GGUF de la ola anterior (Wave B) nunca se publicó. El repositorio incluye plantilla de chat (`chat_template.jinja`) y configuración de procesador, lo que sugiere soporte de conversación multi-turno mediante formato estructurado, aunque no se detalla la innovación técnica concreta más allá de la fusión de adaptadores y las conversiones GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno mediante plantilla Jinja.
- Ajuste orientado a responder desde un conjunto acotado de hechos canónicos de THOX y a declinar preguntas fuera de ese ámbito publicado.
- Distribución preparada para inferencia local: pesos safetensors para transformers, GGUF para llama.cpp y Modelfile para Ollama.
- Compatibilidad con API OpenAI-compatible a través de `llama serve` (endpoint `/v1/chat/completions`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking" en la información disponible.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede ejecutarse íntegramente en un portátil con 8 GB de RAM usando el GGUF Q4_K_M, sin conexión a red, adecuado para prototipos de atención al usuario en entornos con requisitos de privacidad.
- Respuestas sobre documentación corporativa acotada: dado su ajuste a hechos canónicos y a declinar lo no publicado, encaja en escenarios de FAQ interna donde el catálogo de respuestas está controlado y se prefiere una abstención explícita a una invención.
- Despliegue en dispositivos edge: con un peso Q4_K_M de 0,529 GB y un consumo estimado de ~0,9 GB a 4k de contexto, es viable en Raspberry Pi de gama alta, mini-PC o dispositivos embebidos con 8 GB de RAM.
- Integración en aplicaciones de escritorio con Ollama: el comando `ollama run Thox-ai/thoxedge-0.8b` permite incorporar el modelo como backend conversacional en herramientas locales sin infraestructura de servidor.
- Backend de pruebas en pipelines de CI: al ser un modelo pequeño y determinista en formato, sirve para validar plantillas de chat, integraciones de API compatible con OpenAI y flujos de cliente antes de escalar a modelos mayores.
- Filtrado y clasificación de conversaciones: su tamaño permite procesar lotes de mensajes en CPU para tareas de enrutamiento o etiquetado ligero en inglés, aunque sin garantías de calidad fuera del dominio ajustado.
- Demostraciones de inferencia local-first: útil en talleres o entornos educativos donde se necesita un modelo que quepa en un portátil y se pueda inspeccionar completamente (pesos abiertos, sin gating).

## Benchmarks y rendimiento

La model card reporta una única métrica interna: GATE49 46/49 sobre el conjunto de desarrollo, definido por el autor como una puerta de calidad propia con "cero fallos duros falsos conocidos". No se trata de un benchmark estándar de la industria y no es comparable directamente con MMLU, HumanEval o GSM8K.

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 (desarrollo) | 46/49 | Métrica interna del autor, sin definición pública del conjunto |
| MMLU | No disponible | — |
| HumanEval | No disponible | — |
| GSM8K | No disponible | — |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según el autor (cálculos, no mediciones en tiempo de ejecución):
  - Q4_K_M: ~0,9 GB a 4k de contexto; ~1,0 GB a 8k de contexto.
  - Q8_0: ~1,2 GB a 4k de contexto; ~1,3 GB a 8k de contexto.
  - Pesos bf16 en safetensors: fichero de 1.504.827.608 bytes (~1,4 GiB), más buffers y caché KV.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM es suficiente para Q4_K_M; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxedge-0.8b`), llama.cpp (`llama serve -hf Thox-ai/ThoxEdge-0.8B:Q4_K_M`), transformers con safetensors, y cualquier servidor compatible con GGUF. No se menciona soporte explícito de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor indica que los totales de RAM son estimaciones calculadas, no mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Distribución | Notas |
|---|---|---|---|---|---|---|
| ThoxEdge-0.8B | 752 M | No disponible | Apache 2.0 | en | safetensors, GGUF, Ollama | Ajuste SFT de dominio propio sobre Qwen3.5-0.8B |
| Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Apache 2.0 (según modelo base) | No disponible | safetensors | Modelo base sin ajuste de dominio; referencia directa |
| Modelos sub-1B de propósito general | ~0,5-1 B | Variable | Variable | Variable | Variable | No se dispone de datos verificados en la información proporcionada para establecer comparación cuantitativa |

La comparación con alternativas de la misma categoría no puede completarse con datos verificados a partir de la información disponible; el único punto de referencia fiable es el modelo base Qwen3.5-0.8B, del que ThoxEdge hereda arquitectura y licencia.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad.
- El ajuste SFT se realizó sobre un corpus de 982 filas, un volumen muy reducido que limita la generalización y aumenta el riesgo de sobreajuste al dominio de THOX.
- Riesgo de alucinación: aunque el modelo está entrenado para declinar lo no publicado, no hay garantía formal de abstención; en producción debe validarse con evaluaciones propias.
- La única métrica reportada (GATE49 46/49) es interna y su conjunto de evaluación no es público, por lo que no es auditable ni comparable con benchmarks estándar.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso; no debe asumirse su disponibilidad.
- La longitud de contexto no está especificada, lo que impide planificar cargas con ventanas largas; las estimaciones de RAM del autor cubren hasta 8k de contexto.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales más allá de los términos de la licencia y la legislación aplicable.
- La model card incluye notas del fundador y de la CAO con posicionamiento corporativo; no constituyen especificaciones técnicas y deben tratarse como material promocional.
- El repositorio ocupa 7,0 GB, muy por encima del tamaño de los pesos, debido a artefactos adicionales (imágenes, múltiples formatos); conviene descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-0.8B
- Adaptador LoRA Wave C: https://huggingface.co/Thox-ai/ThoxEdge-0.8B-WaveC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- No se han encontrado en la información disponible enlaces a papers, blogs técnicos, repositorios de código o demos adicionales.
