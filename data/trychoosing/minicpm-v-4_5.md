# trychoosing/MiniCPM-V-4_5

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de lenguaje e imagen (MLLM) desarrollado por OpenBMB (ModelBest, en colaboración con el THUNLP de la Universidad de Tsinghua). Se construye sobre el LLM Qwen3-8B y el codificador visual SigLIP2-400M, con un total de 8.695.895.280 parámetros (aproximadamente 8,7B). El repositorio analizado aquí, `trychoosing/MiniCPM-V-4_5`, es una réplica no oficial del modelo original publicado en `openbmb/MiniCPM-V-4_5`; el repositorio oficial es el que debe tomarse como referencia para descargas, issues y versiones cuantizadas.

El modelo aborda el problema de la comprensión multimodal eficiente en hardware de consumo: procesa imágenes individuales, múltiples imágenes y vídeo de alta tasa de fotogramas (hasta 10 FPS) manteniendo un coste de inferencia bajo. Su innovación principal es un 3D-Resampler unificado que comprime hasta 6 fotogramas de vídeo de 448x448 píxeles en solo 64 tokens (frente a los 1.536 tokens habituales en otros MLLM), lo que supone una tasa de compresión de 96x y permite analizar vídeo largo sin incrementar el coste computacional del LLM.

Su relevancia actual radica en que, según la model card, alcanza una puntuación media de 77,0 en OpenCompass (agregado de 8 benchmarks) y supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en capacidades visión-lenguaje, lo que lo sitúa como el MLLM más capaz por debajo de 30B parámetros. Todo ello bajo licencia Apache 2.0, con soporte para más de 30 idiomas y con formatos de despliegue que van desde vLLM y SGLang hasta llama.cpp, Ollama y una aplicación nativa para iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: LLM Qwen3-8B + codificador visual SigLIP2-400M + 3D-Resampler unificado; basada en LLaVA-UHD |
| Parametros totales | 8.695.895.280 (aproximadamente 8,7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16/BF16, int4, AWQ, GGUF (16 tamanos distintos) |
| Idiomas soportados | Multilingue, mas de 30 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, AWQ, int4 |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual SigLIP2-400M con un LLM Qwen3-8B, unidos mediante un proyector basado en la arquitectura LLaVA-UHD, que permite procesar imágenes de alta resolución con cualquier relacion de aspecto y hasta 1,8 millones de píxeles (por ejemplo, 1344x1344) usando aproximadamente 4 veces menos tokens visuales que la mayoria de MLLM. La pieza diferencial es el 3D-Resampler, que agrupa y comprime conjuntamente hasta 6 fotogramas de vídeo consecutivos en 64 tokens, el mismo presupuesto que la serie MiniCPM-V emplea para una sola imagen. Esto unifica la codificacion de imágenes, entradas multi-imagen y vídeo, y facilita la transferencia de capacidad y conocimiento entre modalidades.

En la fase de preentrenamiento se introduce una estrategia de aprendizaje unificado de OCR y conocimiento a partir de documentos: se corrompen dinamicamente las regiones de texto con distintos niveles de ruido y se pide al modelo que reconstruya el texto, de modo que aprenda a alternar entre reconocimiento preciso (cuando el texto es visible) y razonamiento basado en contexto multimodal (cuando esta muy oculto). Segun la model card, esto elimina la dependencia de parsers de documentos propensos a errores y reduce las alucinaciones derivadas de datos OCR sobrerrepresentados. El alineamiento se apoya en las tecnicas RLAIF-V y VisCPM, e incluye un modo de "hibrido thinking" controlable que alterna entre razonamiento rapido (fast thinking) y razonamiento profundo (deep thinking). El numero exacto de tokens de entrenamiento y la composicion detallada del dataset no se especifican en la informacion disponible.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video, con codificacion unificada mediante el 3D-Resampler.
- Video de alta tasa de fotogramas (hasta 10 FPS) y video largo, con compresion de 96x en tokens visuales.
- OCR de alto rendimiento, con liderazgo declarado en OCRBench frente a GPT-4o-latest y Gemini 2.5.
- Parsing de documentos PDF, con rendimiento declarado state-of-the-art en OmniDocBench entre MLLM generalistas.
- Procesamiento de imagenes de alta resolucion y relacion de aspecto arbitraria, hasta 1,8 millones de píxeles.
- Modo de pensamiento hibrido conmutable: fast thinking para uso frecuente y deep thinking para problemas complejos.
- Capacidades multilingues en mas de 30 idiomas.
- Comportamiento "trustworthy" segun la model card, con resultados superiores a GPT-4o-latest en MMHal-Bench.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.
- Despliegue en movil: aplicacion optimizada para iPhone y iPad.

## Casos de uso

- Digitalizacion masiva de documentos: el modelo puede extraer texto estructurado de facturas, formularios y PDF escaneados gracias a su pipeline OCR + parsing de documentos, con menos tokens visuales que alternativas equivalentes y por tanto menor coste por pagina.
- Analisis de video de vigilancia o industrial: con compresion de 96x y soporte de hasta 10 FPS, puede procesar secuencias largas de camaras en busca de eventos concretos sin agotar la ventana de contexto ni disparar el coste de inferencia.
- Asistente multimodal en movil: la aplicacion iOS optimizada y las versiones int4/GGUF permiten ejecutar el modelo en iPhone y iPad para descripcion de escenas, lectura de documentos o accesibilidad para personas con discapacidad visual.
- RAG multimodal sobre documentacion tecnica: combinando OCR de alta resolucion (hasta 1344x1344) con el LLM, se pueden indexar manuales, planos y esquemas, y responder preguntas que requieran tanto el texto como la interpretacion visual del diagrama.
- Moderacion de contenido en plataformas: analisis conjunto de imagen, texto incrustado y fotogramas de video para detectar contenido no permitido, con capacidad multilingue en mas de 30 idiomas para operaciones internacionales.
- Extraccion de datos de informes financieros y cientificos: el modo deep thinking permite razonar sobre tablas y graficos complejos, mientras que el modo fast thinking se reserva para consultas rutinarias de alto volumen.
- Automatizacion de soporte tecnico con capturas de pantalla: el usuario envia una imagen de un error y el modelo identifica el mensaje, lo interpreta y propone una solucion, con contexto multi-turno.
- Analisis de accesibilidad web: evaluacion automatica de contraste, jerarquia visual y legibilidad de capturas de pantalla completas gracias a la resolucion de 1,8 millones de píxeles.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,0 | Dato declarado en la model card |
| OCRBench | No disponible (el autor declara liderazgo frente a GPT-4o-latest y Gemini 2.5) | Cifra concreta no publicada en la informacion disponible |
| OmniDocBench | No disponible (el autor declara SOTA entre MLLM generalistas) | Cifra concreta no publicada |
| MMHal-Bench | No disponible (el autor declara superioridad frente a GPT-4o-latest) | Cifra concreta no publicada |
| Video-MME / LVBench / MLVU / MotionBench / FavorBench | No disponible (el autor declara SOTA en comprension de video) | Cifras concretas no publicadas en la informacion disponible |

No se han publicado en la informacion disponible los resultados numericos desglosados por benchmark (MMLU, HumanEval, GSM8K u otros); solo se confirma la media agregada de OpenCompass y las afirmaciones cualitativas de liderazgo en las pruebas citadas.

## Requisitos de hardware

- Pesos en FP16/BF16: el repositorio ocupa 17,4 GB, por lo que la inferencia en precision completa requiere del orden de 20-24 GB de VRAM incluyendo cache KV y activaciones.
- Cuantizacion int4/AWQ: reduce los pesos a aproximadamente 5 GB; con overhead de activaciones y cache, cabe en GPUs de 8-12 GB.
- GGUF: disponible en 16 tamanos, lo que permite ajustar el compromiso entre calidad y memoria, incluida ejecucion en CPU.
- GPU consumer: cabe en RTX 4090 (24 GB) en FP16 y en RTX 3060 12 GB o RTX 4060 Ti 16 GB en int4/AWQ. En iPhone y iPad existe una aplicacion optimizada.
- GPU de datacenter: A100 y H100 recomendadas para despliegues de alto throughput con vLLM o SGLang.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, Transformers, LLaMA-Factory para fine-tuning, Gradio para demo local y la app iOS nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 | 8,7B | No disponible | Apache 2.0 | Abierto (HuggingFace, ModelScope) | Supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en OpenCompass segun la model card |
| Qwen2.5-VL 72B | 72B | No disponible | No disponible en la informacion | Abierto | Citado en la model card como referencia superada pese a tener 8 veces mas parametros |
| GPT-4o-latest | No divulgado | No disponible | Propietaria | Solo API | Citado como referencia superada en OpenCompass, OCRBench y MMHal-Bench |
| Gemini-2.0 Pro | No divulgado | No disponible | Propietaria | Solo API | Citado como referencia superada en OpenCompass y OCRBench |

La comparativa debe interpretarse con cautela: los datos de los competidores no estan detallados en la informacion proporcionada y las afirmaciones de superioridad proceden de la propia model card del autor.

## Limitaciones y advertencias

- El repositorio analizado (`trychoosing/MiniCPM-V-4_5`) es una replica no oficial con 0 descargas y 0 likes en el momento de la consulta; para produccion debe usarse `openbmb/MiniCPM-V-4_5`.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide dimensionar con precision casos de uso con对话框 largos o documentos muy extensos.
- La compresion agresiva de video (96x) puede degradar la percepcion de detalles finos en fotogramas individuales; conviene validar en el dominio concreto antes de desplegar.
- El OCR, aunque lider segun el autor, puede fallar con tipografias muy degradadas, idiomas de bajos recursos o documentos manuscritos.
- Riesgo de alucinacion inherente a los MLLM, especialmente en preguntas sobre contenido visual ambiguo o en el modo fast thinking; la model card reivindica mitigacion via RLAIF-V, pero no se aportan tasas de error.
- El soporte de mas de 30 idiomas no implica calidad uniforme; el rendimiento por idioma no se detalla.
- El soporte de tool calling y de razonamiento agentico multi-paso no esta documentado en la informacion disponible, por lo que no debe asumirse sin validacion.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar las licencias de los componentes base (Qwen3-8B y SigLIP2-400M) por si imponen condiciones adicionales.
- No se han publicado cifras desglosadas de benchmarks, latencia ni throughput, lo que limita la comparacion cuantitativa con alternativas.

## Enlaces

- Repositorio analizado (replica): https://huggingface.co/trychoosing/MiniCPM-V-4_5
- Repositorio oficial: https://huggingface.co/openbmb/MiniCPM-V-4_5
- Version int4: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Version GGUF: https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4_5
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-o
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Informe tecnico (arXiv 2509.18154): https://huggingface.co/papers/2509.18154
- Paper LLaVA-UHD (arXiv 2403.11703): https://arxiv.org/pdf/2403.11703
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- Wiki en chino: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo online: http://211.93.21.133:18120/
- Demo web alternativa: http://101.126.42.235:30910/
- App iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- Rama de llama.cpp con soporte: https://github.com/tc-mb/llama.cpp/blob/Support-MiniCPM-V-4.5/docs/multimodal/minicpmv4.5.md
- Rama de Ollama con soporte: https://github.com/tc-mb/ollama/tree/MIniCPM-V
- AutoAWQ con soporte: https://github.com/tc-mb/AutoAWQ
- SGLang con soporte: https://github.com/tc-mb/sglang/tree/main
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/minicpm-v-4-5-openbmb
- Ficha en Emergent Mind: https://www.emergentmind.com/topics/minicpm-v-4-5
