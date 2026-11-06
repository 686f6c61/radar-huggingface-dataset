# SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer

## Resumen

Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer es un empaquetado comunitario, publicado por el usuario SPK1337, de una variante abliterated (sin filtros) del modelo Qwen3.8-27B de la familia Qwen. El paquete se distribuye en el formato nativo NInfer v3 (`.ninfer`), no en safetensors ni como GGUF cargable directamente, e incorpora componentes de texto, visión (Vision), y dos backends de decodificación especulativa seleccionables: DFlash2 y MTP (multi-token prediction).

El problema que resuelve es doble: por un lado, ofrece una versión sin restricciones de contenido de un modelo multimodal de 27B parámetros; por otro, optimiza el despliegue en GPUs de consumo concretamente la RTX 4090 (arquitectura Ada Lovelace, SM89), donde el autor ha medido velocidades de decodificación de 146,6 tokens/s (mediana) y hasta 215,5 tokens/s en el percentil 90. La cuantización es de precisión mixta GSQ-RCO, con bloques IQ3_S, IQ3_XXS e IQ4_XS, lo que permite alojar el modelo completo (13,99 GiB) en una GPU de 24 GB.

Su relevancia actual radica en la combinación de multimodalidad (imagen-texto), contexto muy largo (techo medido de 176.128 tokens) y decodificación especulativa de alto rendimiento en hardware de consumo, aunque se trata de un artefacto de nicho que requiere un runtime específico (NInfer-all) y cuyo uso "uncensored" exige responsabilidad por parte del desplegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8-27B, con componentes Vision, MTP y DFlash2 (no disponible el detalle exacto de la arquitectura base) |
| Parametros totales | no disponible (el archivo pesa 13,99 GiB tras cuantizar; el modelo base Qwen3.8-27B indica ~27B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | Techo medido de 176.128 tokens en la configuración de benchmark; ejemplo conservador de 32.768 tokens |
| Tipos de cuantizacion | GSQ-RCO de precisión mixta: IQ3_S, IQ3_XXS e IQ4_XS (por bloques GGUF); KV cache en rk4v4, estado GDN en fp16 |
| Idiomas soportados | Inglés, alemán y chino (en, de, zh) |
| Licencia | Apache-2.0 (con retención de términos upstream y atribución según NOTICE y LICENSE) |
| Formato de pesos | NInfer v3 (`.ninfer`), con bloques GGUF cuantizados como fuente de los pesos de texto; no es safetensors ni GGUF cargable directamente |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de la familia Qwen. El paquete de SPK1337 no reentrena el modelo: es una conversión y reempaquetado de una variante "Huihui abliterated" (un proceso de abliteration que suprime los mecanismos de rechazo del modelo original). El registro de conversión incluido en el repositorio lista como fuente un GGUF Huihui abliterated GSQ-RCO IQ3_S, e identifica cuatro componentes: texto, visión, MTP (multi-token prediction) y DFlash2, además de una cabeza de propuesta (proposal head) para la especulación.

La cuantización es de precisión mixta: aunque el nombre destaca IQ3_S, el registro de conversión reporta formatos individuales por tensor, combinando IQ3_S, IQ3_XXS e IQ4_XS (esquema GSQ-RCO sobre bloques GGUF). La innovación principal del paquete está en la inferencia: dos backends de decodificación especulativa seleccionables (DFlash2 con 5 draft tokens, o MTP con 3 draft tokens, no activables simultáneamente), un perfil de dispositivo optimizado para RTX 4090 con CUDA 13.4 (`rtx4090-cuda134-sm89.json`), y ajustes de caché KV (dtype rk4v4, capacidad automática, estado GDN en fp16). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de RLHF/DPO del modelo base en la información proporcionada. La versión Swift1.5 no está incluida.

## Capacidades

- Generación de texto y razonamiento general heredadas de Qwen3.8-27B (el detalle de capacidades del modelo base no está documentado en la ficha).
- Entrada multimodal imagen-texto (pipeline image-text-to-text): requiere activar el componente Vision con la flag `--vision`; su calidad y latencia no fueron medidas en el benchmark publicado.
- Decodificación especulativa seleccionable: DFlash2 (5 draft tokens) o MTP (3 draft tokens), mutuamente excluyentes.
- Contexto muy largo: hasta 176.128 tokens en la configuración de benchmark medida, con prefill largo de ~2.345 tokens/s.
- Servicio con API compatible con OpenAI a través de `ninfer-serve`.
- Soporte multilingüe declarado en inglés, alemán y chino.
- No hay información disponible sobre tool calling, function calling ni capacidades de agentes en la documentación del repositorio.
- Al ser una variante abliterated, el modelo no aplica los rechazos de seguridad del modelo original.

## Casos de uso

- Chatbot local de alto rendimiento en GPU de consumo: con 146,6 tokens/s medidos de mediana en una RTX 4090, es adecuado para asistentes conversacionales locales con latencia baja sin depender de APIs externas.
- Procesamiento de documentos largos: el techo de contexto de 176.128 tokens permite análisis de contratos, informes o bases de código extensas en una sola pasada, con prefill largo medido a ~2.345 tokens/s.
- Descripción y análisis de imágenes locales: activando `--vision`, se pueden construir aplicaciones de OCR semántico, catalogación de imágenes o asistentes visuales, aunque sin garantías de calidad medidas.
- Prototipado de decodificación especulativa: los backends DFlash2 y MTP seleccionables permiten comparar estrategias de especulación sobre cargas de trabajo reales, útil para investigación en inferencia.
- Despliegue en entornos sin censura para investigación de alineamiento: la variante abliterated sirve para estudiar comportamientos del modelo sin capas de rechazo, en contextos de investigación controlados.
- Servidores de inferencia personales multiusuario: con ajustes de capacidad KV automática y cache en rk4v4, el modelo puede atender múltiples solicitudes concurrentes (el benchmark registró 1.831 solicitudes completadas).
- Generación de contenido en alemán, inglés o chino para flujos de trabajo locales privados, manteniendo los datos fuera de servicios en la nube.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia (no benchmarks de calidad tipo MMLU o HumanEval) realizadas en una RTX 4090 de 24 GB con CUDA 13.4, build SM89 personalizado, DFlash2 con 5 draft tokens, sobre solicitudes reales registradas del 30 al 31 de octubre de 2026:

| Metrica | Resultado observado |
|---|---|
| Velocidad de decodificacion (mediana) | 146,6 tokens/s |
| Velocidad de decodificacion (percentil 90) | 215,5 tokens/s |
| Velocidad de prefill largo (mediana, >4.096 tokens, 316 solicitudes) | 2.345 tokens/s |
| Solicitudes completadas / tokens generados | 1.831 / 2.754.629 |

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) en la informacion disponible. El propio autor advierte que las tasas se calculan a partir de tiempos de solicitud, no son throughput extremo a extremo ni un benchmark estandarizado, y que MTP y la entrada de imagen no fueron evaluados.

## Requisitos de hardware

- VRAM estimada: el archivo del modelo ocupa 13,99 GiB (15.017.456.896 bytes); con caché KV y componentes adicionales, se dirige a GPUs de 24 GB. La configuración de benchmark usa la ventana completa de 24 GB de una RTX 4090.
- GPU recomendada: NVIDIA GeForce RTX 4090 (Ada Lovelace, SM89), con build personalizado de CUDA 13.4. Otras GPUs NVIDIA pueden funcionar con binarios, perfiles y presupuestos de memoria adecuados, pero no hay mediciones publicadas.
- Cabe en GPU de consumo: sí, específicamente en la RTX 4090 de 24 GB; en GPUs de 16 GB probablemente no quepa completa sin recortar contexto, aunque no hay datos publicados al respecto.
- Con presupuesto de memoria ajustado y visión activada, el autor sugiere `--vision-residency overlay` y reducir el contexto.
- Despliegue: exclusivamente mediante runtime NInfer (builds de NInfer-all o el fork de SPK), con `ninfer-serve` en Windows (PowerShell) o Linux. No es compatible con llama.cpp, Ollama, vLLM ni TGI en su formato `.ninfer`.
- Latencia/throughput: mediana de 146,6 tokens/s en decodificación y ~2.345 tokens/s en prefill largo sobre RTX 4090; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Aspecto | Este modelo (NInfer IQ3_S mixto) | Qwen3.8-27B (base) | GGUF Qwen 27B cuantizado (p. ej. Q4_K_M via llama.cpp) |
|---|---|---|---|
| Parametros | ~27B (base) | ~27B | ~27B |
| Formato | NInfer v3 `.ninfer` | Safetensors (no disponible el detalle) | GGUF |
| Cuantizacion | Mixta IQ3_S/IQ3_XXS/IQ4_XS (GSQ-RCO) | Pesos originales (bf16/fp16, no disponible) | Q4_K_M u otras k-quants |
| Contexto | Hasta 176.128 tokens (medido) | no disponible | Según configuración del runtime |
| Vision | Sí (componente Vision, sin medir) | Sí (multimodal) | Depende del empaquetado |
| Especulacion | DFlash2 y MTP seleccionables | no disponible | Limitada o no disponible |
| Licencia | Apache-2.0 (con términos upstream) | Apache-2.0 (según familia Qwen) | Según repositorio |
| Runtime | Solo NInfer-all / fork SPK | Transformers, vLLM, etc. | llama.cpp, Ollama, etc. |
| Rendimiento publicado | 146,6 tokens/s mediana (RTX 4090) | no disponible | no disponible |

Como alternativa de la misma categoría cabe citar también otras variantes abliterated de la serie Huihui sobre modelos Qwen de tamaño similar, distribuidas en GGUF y compatibles con ecosistemas estándar; no hay datos de rendimiento comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Al ser una variante abliterated/uncensored, el modelo carece de los mecanismos de rechazo del modelo original: aumenta el riesgo de generar contenido ofensivo, peligroso o ilegal. Su despliegue requiere controles adicionales por parte del operador.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; el riesgo es el inherente a la familia base, sin mitigaciones documentadas.
- La cuantización agresiva de precisión mixta (IQ3_S/IQ3_XXS, ~3-4 bits) puede degradar la calidad respecto a los pesos originales; no se han publicado evaluaciones de calidad post-cuantización.
- Las mediciones de velocidad provienen de solicitudes reales en una configuración concreta (RTX 4090, CUDA 13.4, DFlash2): no son un benchmark estandarizado ni demuestran mejora sobre NInfer de serie; MTP y la visión no fueron evaluados.
- El formato `.ninfer` requiere un runtime específico (NInfer-all o fork SPK), lo que limita la portabilidad frente a GGUF o safetensors.
- Los resultados de RTX 4090 no son mediciones de Linux ni de otras GPUs; en otras arquitecturas el rendimiento puede diferir sustancialmente.
- Idiomas limitados a inglés, alemán y chino según los metadatos; el castellano no figura entre los idiomas declarados.
- Licencia Apache-2.0, pero el aviso del repositorio exige retener los términos upstream aplicables y la atribución según los archivos NOTICE y LICENSE.
- No hay información sobre tool calling, agentes ni garantías de estabilidad a largo plazo; el repositorio tiene 0 descargas registradas, lo que indica adopción mínima y menor madurez comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer
- Modelo base de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Registro de conversión: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer/blob/main/Huihui-Qwen3.8-27B-GSQ-RCO-IQ3S-Vision-DFlash2.ninfer.conversion.json
- Metodología del benchmark: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer/blob/main/BENCHMARK-RTX4090.md
- Runtime NInfer-all: https://github.com/iamwavecut/ninfer-all
- Fork SPK de NInfer-all: https://github.com/spk-c/ninfer-all
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
