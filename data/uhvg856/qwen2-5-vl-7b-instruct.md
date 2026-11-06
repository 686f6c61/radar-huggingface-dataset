# Uhvg856/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de vision-lenguaje desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de la version instructiva de 7 mil millones de parametros de la familia Qwen2.5-VL, presentada como evolucion de Qwen2-VL tras cinco meses de desarrollo. El modelo procesa simultaneamente imagenes, video y texto, y esta disenado para tareas de comprension visual avanzada, razonamiento sobre documentos, uso de herramientas y actuacion como agente visual.

La arquitectura combina un encoder de vision ViT optimizado con atencion por ventanas, SwiGLU y RMSNorm, alineado estructuralmente con el LLM Qwen2.5, y un transformer de lenguaje con mRoPE extendido a la dimension temporal. Incorpora entrenamiento con resolucion dinamica y muestreo dinamico de FPS para video, lo que le permite comprender videos de mas de una hora y localizar eventos concretos en el tiempo.

Es relevante porque ofrece capacidades de nivel agente (uso de ordenador y telefono), salida estructurada en JSON para documentos, localizacion visual mediante bounding boxes y puntos, y un rendimiento competitivo frente a modelos como GPT-4o-mini o InternVL2.5-8B en benchmarks de imagen, video y agentes, todo bajo licencia Apache 2.0. El repositorio concreto analizado es un espejo publicado por el usuario Uhvg856, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT con atencion por ventanas + LLM Qwen2.5 con mRoPE temporal) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de vision-lenguaje compuesta por un encoder visual ViT y un decoder de lenguaje basado en Qwen2.5. El ViT incorpora atencion por ventanas para reducir coste computacional en entrenamiento e inferencia, y adopta SwiGLU y RMSNorm para alinearse con la estructura del LLM. La conexion entre vision y lenguaje se realiza mediante mRoPE (multimodal Rotary Position Embedding), que en esta version se extiende a la dimension temporal con IDs y alineacion de tiempo absoluto, permitiendo al modelo aprender secuencias temporales y velocidad, y localizar momentos concretos en un video.

El entrenamiento emplea resolucion dinamica y muestreo dinamico de FPS para video, lo que habilita la comprension de videos a distintas tasas de muestreo y de duracion superior a una hora. La model card menciona que el modelo es la version instructiva de 7B, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto soportada. La familia completa incluye variantes de 3B, 7B y 72B, de las cuales este repositorio contiene la de 7B.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes, video y texto.
- Reconocimiento visual de objetos comunes (flores, aves, peces, insectos) y analisis de textos, graficos, iconos, diagramas y layouts dentro de imagenes.
- Comprension de documentos con salida estructurada (facturas, formularios, tablas) en formatos como JSON.
- Localizacion visual mediante bounding boxes y puntos, con salidas JSON estables para coordenadas y atributos.
- Comprension de video de mas de una hora, con capacidad de capturar eventos y localizar segmentos relevantes.
- Actuacion como agente visual: razonamiento y direccion dinamica de herramientas, incluyendo uso de ordenador y telefono.
- Soporte de tool calling y function calling orientado a flujos agente.
- Capacidades multilingues limitadas al ingles segun la model card (aunque la familia Qwen suele soportar mas idiomas, no se declara aqui).
- Modo conversacional multi-turno con entrada de imagen y texto.

## Casos de uso

- Extraccion estructurada de documentos financieros: el modelo puede procesar facturas, formularios y tablas escaneadas y devolver su contenido en JSON, lo que facilita su integracion en pipelines de contabilidad y ERP.
- Analisis de graficos y dashboards: gracias a su capacidad de interpretar charts e InfoVQA (82.6), puede extraer tendencias y responder preguntas sobre visualizaciones de negocio.
- Agente de automatizacion de escritorio: con ScreenSpot (84.7) y AITZ_EM (81.9), puede operar interfaces graficas, hacer clic en elementos y completar tareas multi-paso en entornos controlados.
- Control de dispositivos moviles: con Android Control High_EM (60.1) y MobileMiniWob++_SR (91.4), es adecuado para asistentes que ejecutan acciones en apps Android.
- Analisis de video de vigilancia o deportes: su comprension de videos de mas de una hora y su capacidad de localizar eventos (CharadesSTA/mIoU 43.6) permiten generar resumentes y marcar momentos clave.
- Atencion al cliente multimodal: puede gestionar conversaciones multi-turno donde el usuario envia capturas de pantalla o fotos de productos y el modelo responde con texto y coordenadas.
- Verificacion de identidad y KYC: la combinacion de OCR (OCRBench 864, CC_OCR 77.8) y localizacion visual permite extraer datos de documentos de identidad y validar su coherencia.
- Generacion de descripciones accesibles: puede describir imagenes y videos para sistemas de accesibilidad, incluyendo la posicion de objetos relevantes.

## Benchmarks y rendimiento

Resultados publicados en la model card para la variante 7B:

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50.4 | 60 | 54.1 | 58.6 |
| MMMU-Pro (val) | 34.3 | - | 37.6 | 30.5 | 41.0 |
| DocVQA (test) | 93 | 93 | - | 94.5 | 95.7 |
| InfoVQA (test) | 77.6 | - | - | 76.5 | 82.6 |
| ChartQA (test) | 84.8 | - | - | 83.0 | 87.3 |
| TextVQA (val) | 79.1 | 80.1 | - | 84.3 | 84.9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57.7 | - | - | 61.6 | 77.8 |
| MMStar | 62.8 | - | - | 60.7 | 63.9 |
| MMBench-V1.1-En (test) | 79.4 | 78.0 | 76.0 | 80.7 | 82.6 |
| MMT-Bench (test) | - | - | - | 63.7 | 63.6 |
| MMVet (GPT-4-Turbo) | 54.2 | 60.0 | 66.9 | 62.0 | 67.1 |
| HallBench (avg) | 45.2 | 48.1 | 46.1 | 50.6 | 52.9 |
| MathVista (testmini) | 58.3 | 60.6 | 52.4 | 58.2 | 68.2 |
| MathVision | - | - | - | 16.3 | 25.07 |

Video:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67.0 | 69.6 |
| PerceptionTest (test) | 66.9 | 70.5 |
| Video-MME (wo/w subs) | 63.3/69.0 | 65.1/71.6 |
| LVBench | - | 45.3 |
| LongVideoBench | - | 54.7 |
| MMBench-Video | 1.44 | 1.79 |
| TempCompass | - | 71.7 |
| MLVU | - | 70.2 |
| CharadesSTA/mIoU | - | 43.6 |

Agente:

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84.7 |
| ScreenSpot Pro | 29.0 |
| AITZ_EM | 81.9 |
| Android Control High_EM | 60.1 |
| Android Control Low_EM | 93.7 |
| AndroidWorld_SR | 25.5 |
| MobileMiniWob++_SR | 91.4 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 16-17 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: en torno a 9-10 GB de VRAM.
- En cuantizacion de 4 bits (si esta disponible, aunque no se lista en la model card): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 24GB para fp16; RTX 3090 24GB o RTX 4080 16GB podrian ser suficientes en cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 24GB en fp16 y en GPUs de 16GB o menos con cuantizacion.
- Opciones de despliegue: transformers (con `qwen-vl-utils[decord]`), text-generation-inference (segun tags), vLLM, llama.cpp (si se generan GGUF), Ollama (si se publican pesos compatibles). El repositorio declara `endpoints_compatible` y `text-generation-inference`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B | 8.29B | no disponible | 58.6 | 95.7 | Apache 2.0 | Hugging Face |
| Qwen2-VL-7B | ~8B | no disponible | 54.1 | 94.5 | Apache 2.0 | Hugging Face |
| InternVL2.5-8B | ~8B | no disponible | 56 | 93 | no disponible | Hugging Face |
| GPT-4o-mini | no disponible | no disponible | 60 | - | propietaria | API |

## Limitaciones y advertencias

- La model card declara unicamente soporte de ingles (`language: en`), por lo que el rendimiento en otros idiomas puede degradarse.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar cargas de trabajo con entradas muy largas.
- No se detallan los datos de entrenamiento, por lo que no se pueden evaluar sesgos de composicion ni riesgos de contaminacion.
- Riesgo de alucinacion en tareas de OCR, localizacion visual y comprension de documentos, especialmente con imagenes de baja calidad.
- El rendimiento en agentes es desigual: ScreenSpot Pro (29.0) y AndroidWorld_SR (25.5) son notablemente bajos, lo que limita su uso autonomo en entornos no controlados.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio analizado es un espejo de terceros (Uhvg856) sin descargas ni validacion, por lo que se recomienda usar el repositorio oficial de Qwen.
- El tamano del repo es de 16.6 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- Requiere versiones recientes de transformers; de lo contrario aparece el error `KeyError: 'qwen2_5_vl'`.

## Enlaces

- Repositorio analizado: https://huggingface.co/Uhvg856/Qwen2.5-VL-7B-Instruct
- Repositorio oficial: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog oficial: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Chat demo: https://chat.qwenlm.ai/
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen2_5_vl_7b_instruct
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
