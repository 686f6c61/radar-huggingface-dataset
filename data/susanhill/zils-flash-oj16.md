# SusanHill/zils-flash-oj16

## Resumen

OneJev1.6-9B es un modelo multimodal de decisión "System One" desarrollado por el equipo OmniJev. Se trata de un fine-tune completo de Qwen/Qwen3.5-9B (9.409.813.744 parámetros) que, en lugar de generar texto libre, recibe un estado (captura de pantalla, foto, vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve una probabilidad calibrada para cada opción en un único forward pass. El modelo está pensado como motor de decisión para agentes, no como chatbot generativo.

El modelo se ha entrenado sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Su formato de salida estructurado (probabilidades por opción, puntuaciones esperadas y probabilidades binarias) lo hace directamente integrable en bucles de control de agentes, donde la latencia y la calibración importan más que la fluidez textual.

Su relevancia actual radica en que ocupa la sexta posición de 172 modelos en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones) con una puntuación de 65,31, superando a modelos de 26B o más parámetros en varias áreas. La licencia Apache 2.0 y el soporte del servidor Flide facilitan su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9,4B de parámetros, y se somete a un fine-tune completo (no LoRA ni adaptadores) para convertirlo en un modelo de decisión multimodal. La entrada combina un estado textual estructurado (tarea, pantalla, contexto) con medios adjuntos (imágenes o vídeo) y un conjunto de preguntas tipadas: binarias (`noul`), de elección entre opciones (`choice`) y de puntuación ordinal (`score`). La salida es un conjunto de probabilidades calibradas, una por opción, más la puntuación esperada en las preguntas de tipo `score`.

El entrenamiento se realizó sobre unas 440.000 preguntas procedentes de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. No se detalla en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación principal es el propio paradigma "System One": una única pasada hacia delante que produce decisiones calibradas en lugar de generación autoregresiva de texto, lo que reduce la latencia y facilita la integración en bucles de agente. El servidor Flide implementa la API System One de TypeSafe con un campo `media` adicional para imágenes y vídeo.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades por opción a partir de capturas de pantalla, fotos, vídeos o texto.
- Preguntas tipadas: soporta preguntas binarias (`noul`), de elección múltiple (`choice`) y de puntuación ordinal (`score`).
- Comprensión de interfaces gráficas: orientado a tareas de agente GUI (clic, escritura, scroll, parada).
- Procesamiento de vídeo e imagen como entrada junto con estado textual.
- Salida estructurada directamente consumible por bucles de control de agentes.
- Calibración de probabilidades: las salidas están pensadas para usarse como probabilidades, no como texto generado.
- Integración con la API System One de TypeSafe mediante el servidor Flide.
- No se documentan en la información disponible capacidades de tool calling genérico, agentes multi-paso autónomos ni modo "thinking" al estilo de modelos generativos.

## Casos de uso

- Agentes GUI automatizados: el modelo recibe la captura de pantalla actual y la tarea ("pagar la factura de ACME") y devuelve la probabilidad de que la tarea esté completada y la siguiente acción recomendada (clic, escritura, scroll, parada), integrándose en un bucle de control.
- Verificación de progreso en pipelines de RPA: usar preguntas de tipo `score` para estimar en qué punto de un flujo está el agente y decidir si continuar, reintentar o escalar a un humano.
- Moderación y clasificación de contenido visual: plantear preguntas binarias (`noul`) sobre imágenes o vídeos para obtener probabilidades calibradas de presencia de un atributo concreto.
- Control de calidad en vídeo: analizar fotogramas o clips y responder preguntas de elección sobre el estado de un proceso (por ejemplo, si un producto está correctamente empaquetado).
- Enrutamiento de decisiones en asistentes: dado un estado textual y una imagen, elegir entre varias rutas de acción con probabilidades que permiten umbrales configurables.
- Evaluación de políticas de agente: usar el modelo como árbitro calibrado para puntuar trayectorias de agentes en entornos simulados, aprovechando su entrenamiento sobre ejecuciones reales.
- Automatización de pruebas de interfaz: comprobar si una pantalla cumple un criterio visual mediante preguntas binarias, con probabilidad de acierto como señal de confianza.

## Benchmarks y rendimiento

| Benchmark | OneJev1.6-9B | Referencia |
|---|---|---|
| Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones) | 65,31 | OneJev1.5-9B: 59,03 |
| Posición en Decision Index 0.3 | 6 de 172 modelos | Los cinco superiores tienen 26B o más parámetros |
| Modelos de 6B a 12B comparados | 65,31 | Nace.AI Drex v1.5: 58,08; vLLM-SR d3-flash (9B): 57,79; Standard One 8B SH (v4): 57,40; Bespoke Nimble 9B v3: 57,19 |
| Modelos de 25B a 36B superados | Supera a 52 de 57 | — |

No se han publicado en la información disponible resultados desglosados por MMLU, HumanEval o GSM8K. La model card menciona una tabla de resultados frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, pero los valores numéricos no están incluidos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19-20 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; para cuantización a 8 bits o 4 bits se necesitarían aproximadamente 10-12 GB y 6-7 GB respectivamente, aunque los tipos de cuantización no están documentados.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en BF16 y en GPUs de 12-16 GB con cuantización, si bien no se confirman formatos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: el autor documenta el servidor Flide (`flide serve --model OmniJev/OneJev1.6-9B`), que expone la API System One con endpoint `/v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-9B | 9,4B | no disponible | 65,31 | Apache 2.0 | Hugging Face |
| Nace.AI Drex v1.5 | no disponible | no disponible | 58,08 | no disponible | no disponible |
| vLLM-SR d3-flash (9B) | 9B | no disponible | 57,79 | no disponible | no disponible |
| Standard One 8B SH (v4) | 8B | no disponible | 57,40 | no disponible | no disponible |
| Bespoke Nimble 9B v3 | 9B | no disponible | 57,19 | no disponible | no disponible |

Los cuatro modelos comparados son los de mayor puntuación en el rango de 6B a 12B en Decision Index 0.3. No se dispone de datos de arquitectura, contexto ni licencia de los mismos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir probabilidades de decisión, no texto libre; usarlo como generador conversacional general no es su propósito.
- No se documentan los idiomas soportados; se desconoce si el rendimiento es homogéneo fuera del inglés.
- La longitud de contexto no está especificada, lo que dificulta planificar tareas con estados muy largos o vídeos extensos.
- No se detallan sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de calibración, el riesgo se traslada a probabilidades mal calibradas en dominios fuera de distribución.
- Los benchmarks reportados (Decision Index 0.3) son específicos del dominio de decisión de agentes y no comparables con MMLU, HumanEval o GSM8K.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un modelo reciente con poca validación externa.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B y de las dependencias (Flide, torchvision).
- El despliegue documentado depende del servidor Flide; no hay confirmación de soporte en vLLM, llama.cpp u otros runners estándar.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-flash-oj16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Sitio web: https://omnijev.github.io/OneJev/
- Servidor Flide: https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Decision Index 0.3 (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
