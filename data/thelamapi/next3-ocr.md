# thelamapi/next3-ocr

## Resumen

Next3-OCR es un modelo vision-lenguaje especializado en transcripcion literal de documentos, desarrollado por Lamapi (cuenta `thelamapi` en Hugging Face, fundada por Ersin Sarp Yigit). Es el primer modelo de OCR de la serie Next 3 y parte del checkpoint `thelamapi/next-ocr` como base, sobre el que se ha aplicado un ajuste fino en dos etapas. Resuelve la extraccion de texto verbatim en documentos turcos e ingleses, tickets y escritura manuscrita, un nicho donde los motores clasicos de OCR (Tesseract, EasyOCR) rinden de forma notablemente inferior.

Tecnicamente es un `Qwen3VLForConditionalGeneration` de aproximadamente 8.770 millones de parametros en BF16, exportado como checkpoint completo de safetensors fragmentado (17,5 GB en el repositorio). El modelo congela el codificador visual y entrena solo adaptadores QLoRA de 4 bits sobre las proyecciones de atencion y MLP del modelo de lenguaje, lo que permite un ajuste eficiente sobre una base multimodal ya preentrenada.

Su relevancia actual radica en dos factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y una mejora medible frente a su predecesor y a los motores OCR tradicionales en un conjunto de prueba bloqueado (24 imagenes reales mas 10 sondas de identidad), con un 80,04 % de precision por caracter y un CER estricto de 0,1996.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal vision-lenguaje) |
| Parametros totales | 8.767.123.696 (~8,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; entrenado con QLoRA de 4 bits (NF4 + computo BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint Transformers fragmentado, 17,5 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de imagen-a-texto. El codificador visual permanece congelado durante todo el ajuste fino, y el entrenamiento se concentra en adaptadores QLoRA de 4 bits (NF4 con computo en BF16) aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo de lenguaje.

El entrenamiento se estructura en dos etapas. La primera (separacion de identidad y tarea) usa prompts de sistema neutros, plantillas de identidad disjuntas entre train/validacion/test, resistencia a premisas falsas y roleplay, y contraejemplos de OCR frente a identidad para evitar que la marca se filtre en las salidas de OCR. La segunda etapa realiza el ajuste fino OCR real sobre documentos turcos verificados (`moganai/TurkishOCR-Bench`), tickets reales (`naver-clova-ix/cord-v2`) y escritura manuscrita (`Teklia/IAM-line`), con seleccion de checkpoint por CER de validacion y repeticion de identidad. La exportacion final recarga el checkpoint de partida en la revision fijada `5790b6dd78f415cd7e7e73f6a5101fc07507e7f0` en BF16 completo y fusiona el adaptador mediante `merge_and_unload(safe_merge=True)`.

## Capacidades

- Extraccion de texto verbatim de imagenes de documentos, en orden de lectura.
- OCR de documentos turcos e ingleses, incluidos tickets y recibos.
- Reconocimiento de escritura manuscrita (entrenado con lineas de IAM).
- Generacion conversacional multimodal mediante plantilla de chat (`apply_chat_template`).
- Separacion de identidad: responde a sondas de identidad neutras sin filtrar la marca en las transcripciones (100 % de precision de identidad reportada).
- Resistencia a premisas falsas y roleplay en los prompts.
- Soporte de `image-text-to-text` como pipeline declarado en Transformers.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Digitalizacion de archivos administrativos turcos: el modelo transcribe documentos escaneados en turco en orden de lectura, adecuado para expedientes y formularios donde se requiere el texto literal y no una interpretacion.
- Procesamiento de tickets y recibos: entrenado con `cord-v2`, puede extraer lineas de concepto, importes y datos del comercio de recibos reales para alimentar sistemas de contabilidad o gastos.
- Reconocimiento de manuscrito en formularios: con las lineas de `Teklia/IAM-line` en el entrenamiento, sirve para digitalizar notas y campos manuscritos en ingles.
- Pipeline bilingue turco-ingles: util en empresas con documentacion en ambos idiomas que necesitan un unico modelo en lugar de dos motores separados.
- Preprocesado para RAG documental: la transcripcion verbatim alimenta indices de busqueda o bases vectoriales antes de la recuperacion, con la ventaja de una licencia Apache 2.0 sin coste por token.
- Extraccion de texto en entornos con requisitos de privacidad: al ser un modelo de 8,77B desplegable en infraestructura propia, permite procesar documentos sensibles sin enviarlos a APIs externas.
- Verificacion asistida de campos numericos o legales: como paso previo a la revision humana, el modelo reduce el trabajo manual, aunque el autor advierte verificar siempre los campos criticos.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de prueba bloqueado identico para todos los modelos: 24 imagenes reales (10 documentos turcos de `moganai/TurkishOCR-Bench`, 7 tickets de `naver-clova-ix/cord-v2` y 7 lineas manuscritas de `Teklia/IAM-line`), mas 10 sondas de identidad con prompt neutro no vistas.

| Modelo | Precision por caracter (↑) | CER estricto (↓) | WER estricto (↓) | Precision caracter turco (↑) | Precision de identidad (↑) |
|---|---|---|---|---|---|
| Next3-OCR (Lamapi) | 80,04 % | 0,1996 | 0,3368 | 36,73 % | 100,0 % |
| Next-OCR (base) | 75,81 % | 0,2419 | 0,4229 | 26,82 % | 0,0 % |
| EasyOCR (tr+en) | 50,65 % | 0,4935 | 0,7805 | 27,51 % | N/A |
| Tesseract OCR (tur+eng) | 53,24 % | 0,4676 | 0,662 | 33,29 % | N/A |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 18 GB solo para pesos, mas overhead de activaciones y del codificador visual; se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; en GPUs de 16 GB seria necesario cuantizar, aunque el autor no publica variantes GGUF ni cuantizadas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16; en RTX 4080 o 3090 (16-24 GB) con margen ajustado o cuantizacion no oficial.
- Opciones de despliegue: Transformers con `device_map="auto"` (metodo documentado); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision caracter (benchmark del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next3-OCR | ~8,77B | no disponible | 80,04 % | Apache 2.0 | Hugging Face (Transformers) |
| Next-OCR (base) | ~8B (segun README; safetensors del base no verificado) | no disponible | 75,81 % | Apache 2.0 / badge MIT en README | Hugging Face |
| EasyOCR (tr+en) | no disponible | no aplica | 50,65 % | Apache 2.0 | Libreria Python |
| Tesseract OCR (tur+eng) | no disponible | no aplica | 53,24 % | Apache 2.0 | Motor OCR local |

## Limitaciones y advertencias

- Escaneos muy densos, de baja resolucion (DPI bajo) o severamente degradados pueden producir errores de caracter; el autor recomienda verificar siempre los campos numericos y legales en produccion.
- La precision por caracter en turco es notablemente baja (36,73 %) en el conjunto de prueba, pese a superar a los competidores; el rendimiento en turco real dista de ser fiable para uso sin supervision.
- El conjunto de evaluacion es muy reducido (24 imagenes), por lo que las cifras tienen alta varianza y no deben extrapolarse a dominios no representados.
- Idiomas limitados a turco e ingles; no se declara soporte para castellano ni otras lenguas.
- Riesgo de alucinacion en documentos con texto ambiguo o imagenes de baja calidad, comun en modelos vision-lenguaje.
- No se documentan sesgos especificos ni evaluaciones de sesgo.
- Ambiguedad de licencia en el modelo base: el YAML lista Apache 2.0 pero el README muestra una insignia MIT; el modelo derivado declara Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/next3-ocr
- Modelo base: https://huggingface.co/thelamapi/next-ocr
- Perfil del desarrollador: https://huggingface.co/thelamapi
- Dataset de documentos turcos: https://huggingface.co/datasets/moganai/TurkishOCR-Bench
- Dataset de tickets: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset de manuscrito: https://huggingface.co/datasets/Teklia/IAM-line
