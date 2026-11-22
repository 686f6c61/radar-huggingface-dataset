# tokenaii/Replica-Preview-0.5B

## Resumen

Replica Preview 0.5B es un modelo de síntesis de voz (text-to-speech) desarrollado por TokenAI, diseñado para generación multilingüe de habla expresiva con clonación de voz zero-shot. Se compone de dos módulos: un modelo de lenguaje autorregresivo de tokens de habla basado en la arquitectura T3 (aproximadamente 520M de parámetros) y un vocoder S3Gen con flow-matching. El modelo completo suma 535.989.248 parámetros y se distribuye bajo licencia MIT.

El modelo aborda el problema de la síntesis de voz personalizada sin necesidad de entrenamiento adicional: a partir de una grabación de referencia de entre 6 y 10 segundos de audio limpio y de un solo hablante, es capaz de replicar la voz del hablante en 17 idiomas. Incorpora controles de expresividad mediante los parámetros `exaggeration` y `cfg_weight`, que permiten modular la entrega desde un tono neutro hasta una interpretación dramática.

Es relevante en el ecosistema open source porque combina clonación zero-shot, soporte multilingüe amplio y una licencia permisiva (MIT) en un tamaño de 0,5B parámetros que, según las mediciones del autor, requiere menos de 4 GB de VRAM en inferencia con bf16. No obstante, la model card advierte de que los pesos aún están siendo empaquetados para su publicación y de que las evaluaciones publicadas son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresivo de tokens de habla T3 multilingüe (~520M) + vocoder S3Gen con flow-matching |
| Parametros totales | 535.989.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de texto |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | 17: árabe, alemán, inglés, español, francés, hindi, italiano, japonés, coreano, malayo, neerlandés, noruego, polaco, portugués, ruso, turco, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 3,2 GB) |

## Arquitectura y entrenamiento

Replica Preview 0.5B sigue una arquitectura de dos etapas típica en TTS neuronales modernos. La primera etapa es un modelo de lenguaje autorregresivo sobre tokens de habla (arquitectura T3, ~520M de parámetros) con un vocabulario de 8.194 tokens de habla y embeddings de hablante de 256 dimensiones. La segunda etapa es un vocoder S3Gen basado en flow-matching que convierte los tokens de habla en audio PCM a 24 kHz en mono. La clonación de voz se realiza mediante condicionamiento por referencia: se introduce un audio de referencia de 6 a 10 segundos y el modelo infiere las características del hablante sin necesidad de un identificador de hablante fijo.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Los controles de muestreo disponibles son temperatura, top_p, min_p y repetition_penalty, junto con los parámetros de expresión `exaggeration` (por defecto 0,5; ~0,7 para entrega dramática) y `cfg_weight` (por defecto 0,5; ~0,3 para entrega dramática). El condicionamiento por idioma se realiza mediante language-ID.

## Capacidades

- Generación de voz multilingüe en 17 idiomas con condicionamiento por identificador de idioma.
- Clonación de voz zero-shot a partir de una grabación de referencia de 6 a 10 segundos de audio limpio y de un solo hablante, sin lista fija de hablantes.
- Síntesis de habla expresiva con control de entrega mediante `exaggeration` y `cfg_weight`.
- Procesamiento de texto de hasta 2.048 tokens, lo que permite sintetizar fragmentos largos en una sola pasada.
- Control de muestreo mediante temperatura, top_p, min_p y repetition_penalty.
- Salida de audio a 24 kHz en mono, formato PCM16 WAV.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al tratarse de un modelo de TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede sintetizar pasajes de hasta 2.048 tokens de texto y controlar la expresividad con `exaggeration` y `cfg_weight` para adaptar la entrega a distintos géneros narrativos.
- Clonación de voz para doblaje y localización: a partir de una muestra de 6 a 10 segundos de un actor de voz, se puede generar habla en cualquiera de los 17 idiomas soportados, lo que facilita la localización de contenido audiovisual.
- Asistentes de voz personalizados: la clonación zero-shot permite dotar a un asistente conversacional de la voz del propio usuario o de una voz de marca, con salida a 24 kHz en mono y un coste de VRAM medido de 3,809 GB en bf16.
- Generación de contenido para podcasts y vídeos: el control de expresividad permite alternar entre un tono neutro (0,5/0,5) y una entrega dramática (~0,7/0,3) sin cambiar de modelo, útil para producir varias versiones de un mismo guion.
- Accesibilidad y lectura de textos: el modelo puede convertir documentos largos en audio gracias a su contexto de 2.048 tokens, con la posibilidad de clonar la voz del usuario para una experiencia más familiar.
- Prototipado de interfaces de voz en investigación: la licencia MIT y el tamaño contenido (0,5B) permiten integrar el modelo en pipelines experimentales de TTS multilingüe sin restricciones comerciales, siempre que se validen la calidad y la latencia en el hardware objetivo.
- Pruebas de concepto de doblaje multilingüe: con el condicionamiento por language-ID, un mismo texto puede sintetizarse en varios idiomas conservando las características del hablante de referencia, lo que resulta útil para demos y evaluaciones internas.

## Benchmarks y rendimiento

El autor publica un benchmark de inferencia en inglés (13 de noviembre de 2026, 8 prompts fijos, semilla fija, petición única, NVIDIA RTX PRO 6000 Blackwell Server Edition):

| Métrica | Resultado |
|---|---:|
| Prompts en inglés | 8 |
| Audio total generado | 57,96 s |
| Tiempo total de generación | 26,65 s |
| Tiempo medio de generación | 3,331 s (mediana 3,205 s, P95 5,028 s) |
| Factor de tiempo real (RTF) medio | 0,463 (~2,22x tiempo real) |
| Tiempo de carga del modelo | 9,280 s |
| Formato de salida | WAV PCM16 mono a 24 kHz |
| VRAM pico asignada | 3,809 GB (3,548 GiB) |
| VRAM pico reservada | 4,100 GB |
| Muestras no finitas (NaN/Inf) | 0 |
| Muestras recortadas (clipping) | 0 |

Entropía cruzada con teacher forcing (no es MOS, WER ni CER):

| Conjunto de evaluación | CE de texto | CE de habla |
|---|---:|---:|
| Inglés | 1,907 | 3,835 |
| Árabe combinado | 1,744 | 4,278 |
| Solo egipcio | 1,717 | 4,051 |

El autor advierte de que estos resultados demuestran que el modelo carga, sintetiza los prompts probados y produce audio válido a 24 kHz sin fallos numéricos ni clipping, pero no establecen una puntuación de calidad humana, fidelidad de transcripción ni capacidad de producción bajo concurrencia.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,809 GB asignados (4,100 GB reservados) en bf16 y CUDA, medido en una NVIDIA RTX PRO 6000 Blackwell Server Edition con una sola petición.
- GPU recomendadas: el autor solo documenta la RTX PRO 6000 Blackwell Server Edition; no se han medido configuraciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: por el consumo medido (<4,1 GB reservados), es plausible en tarjetas con 8 GB o más de VRAM, pero el autor no lo ha verificado.
- Opciones de despliegue: la librería indicada es `chatterbox`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF medio de 0,463 (~2,22x tiempo real), tiempo medio de generación de 3,331 s y P95 de 5,028 s en el hardware medido; no se han evaluado concurrencia (1/2/4/8 peticiones), inferencia por lotes, CPU ni configuraciones de baja VRAM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de TTS en la información proporcionada. A continuación se comparan únicamente los datos disponibles de Replica Preview 0.5B con modelos de la misma categoría según conocimiento general, indicando "no disponible" cuando no hay datos verificables en la información suministrada:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Clonación zero-shot |
|---|---|---|---|---|---|
| Replica Preview 0.5B | 535.989.248 | 2.048 tokens de texto | 17 | MIT | Sí (6-10 s de referencia) |
| XTTS-v2 (Coqui) | no disponible en la información | no disponible | 17 | Coqui Public Model License | Sí |
| Bark (Suno) | no disponible en la información | no disponible | multilingüe | MIT | Parcial (prompt de audio) |
| Chatterbox (Resemble AI) | no disponible en la información | no disponible | no disponible | MIT | Sí |

Los datos de los modelos alternativos no provienen de la información proporcionada y no se han verificado en esta ficha; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- La cobertura del benchmark es exclusivamente en inglés (8 prompts fijos); la inferencia en árabe y cross-lingüe no se ha medido en el informe.
- No hay puntuación MOS ni evaluación de naturalidad humana; la escucha nativa está pendiente.
- No se ha medido WER/CER con ASR; la entropía cruzada con teacher forcing no es una métrica de inteligibilidad.
- La similitud de la clonación de voz no está certificada en esta ejecución (el proxy del codificador de voz no estaba disponible); no se hace ninguna afirmación de verificación de hablante.
- No se han medido la continuidad en formato largo (>10 s), la concurrencia (1/2/4/8 peticiones), la inferencia por lotes, la inferencia en CPU ni el comportamiento con poca VRAM.
- El autor indica que los pesos del repositorio están siendo empaquetados para su publicación; hasta que se publiquen, el acceso se realiza a través de la página oficial del modelo.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones de licencia para uso comercial más allá de la licencia MIT.
- Al ser un modelo de TTS, no debe evaluarse con métricas de razonamiento o generación de texto; su uso en producción requiere validación propia de calidad, latencia y concurrencia en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/tokenaii/Replica-Preview-0.5B
- Página oficial del modelo: https://tokenai.llc/projects/models/replica-preview-0.5b
- Página de la familia Replica Preview: https://tokenai.llc/projects/replica-preview
