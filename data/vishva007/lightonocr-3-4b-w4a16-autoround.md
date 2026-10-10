# Vishva007/LightOnOCR-3-4B-W4A16-AutoRound

## Resumen

LightOnOCR-3-4B-W4A16-AutoRound es una version cuantizada a INT4 del modelo de vision-lenguaje lightonai/LightOnOCR-3-4B, publicada por el usuario independiente Vishva007 en Hugging Face. El modelo original lo desarrolla LightOn, y esta pensado para transcripcion de documentos de extremo a extremo: combina reconocimiento optico de caracteres (OCR), comprension de maquetacion, grounding visual y extraccion estructurada de figuras y tablas en un unico modelo multimodal, en lugar de encadenar modulos separados de deteccion, OCR y analisis de layout.

La relevancia de esta ficha concreta es la cuantizacion: se ha aplicado Intel AutoRound en esquema W4A16 (pesos INT4, activaciones BF16), con grupo de tamano 32, optimizacion simetrica, 1200 iteraciones y 512 muestras de calibracion a seqlen 4096. Un detalle tecnico importante es que la torre de vision y el proyector multimodal se han mantenido en BF16 (`quant_nontext_module=False`) para no degradar el OCR ni el grounding, lo que es coherente con el hecho de que en estos modelos el cuello de botella de precision suele estar en la parte visual.

La arquitectura subyacente es la de la familia Qwen3.5 aplicada a vision-lenguaje (pipeline image-text-to-text). El repositorio cuantizado declara 1.541.787.136 parametros segun los safetensors, aunque el modelo base se comercializa como "4B" y fuentes externas lo describen como un modelo de aproximadamente 4,5 mil millones de parametros, por lo que existe una discrepancia entre el recuento del repositorio cuantizado y el tamano nominal del original. La licencia es Apache 2.0 y el formato de pesos es safetensors para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en la familia Qwen3.5 (transformer multimodal con torre de vision y proyector) |
| Parametros totales | 1.541.787.136 segun safetensors del repositorio cuantizado; el modelo base se denomina "4B" (fuentes externas indican ~4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue con vLLM configura 8192 tokens) |
| Tipos de cuantizacion | INT4 W4A16 con Intel AutoRound: grupo 32, simetrica, 1200 iteraciones, 512 muestras de calibracion (seqlen 4096); torre de vision y proyector multimodal en BF16. Existen variantes GPTQ/Marlin y LLM-Compressor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tambien se enlazan variantes GPTQ y LLM-Compressor) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible el proceso de entrenamiento del modelo original LightOnOCR-3-4B (numero de tokens, composicion del dataset, si hubo RLHF/DPO). Lo que si se conoce es que el modelo base es un modelo de vision-lenguaje de extremo a extremo construido sobre la arquitectura Qwen3.5, orientado a transcripcion de documentos de alta precision, comprension de maquetacion, grounding visual y extraccion estructurada de figuras. El modelo opera con el "modo thinking" desactivado (`enable_thinking=False`), es decir, esta optimizado para generar directamente la transcripcion o el grounding sin cadena de razonamiento explicita.

Lo especifico de este repositorio es el proceso de cuantizacion. Se uso Intel AutoRound, un metodo de cuantizacion basado en descenso de gradiente por signo disenado para retener precision en produccion. La configuracion aplicada es W4A16 (pesos INT4, activaciones BF16) con grupo 32 y simetria, 1200 iteraciones de optimizacion y 512 muestras de calibracion con longitud de secuencia 4096. La innovacion relevante aqui es la preservacion de precision en la parte multimodal: al mantener la torre de vision y el proyector en BF16, se evita la degradacion tipica del OCR y del grounding cuando se cuantiza el componente visual. El repositorio incluye variantes hermanas para distintos motores de inferencia (AutoGPTQ/Marlin y vLLM/Compressed Tensors).

## Capacidades

- Transcripcion de documentos a Markdown con preservacion de maquetacion (modo de transcripcion simple, `prompt = ""`).
- Grounding visual: genera cajas delimitadoras normalizadas en rango [0, 1000] y etiquetas semanticas por componente (`text`, `title`, `table`, `image`, `chart`, entre otras) cuando se invoca con `prompt = "grounding"`.
- Comprension de tablas y formularios (tags explicitos `tables` y `forms`).
- Extraccion estructurada de figuras y conversion de datos de graficos a tablas HTML (segun la informacion publica del modelo base).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), con procesamiento de documentos escaneados y PDFs.
- Generacion conversacional (tag `conversational`).
- Modo de pensamiento desactivado de forma deliberada para minimizar latencia en tareas de OCR.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Digitalizacion masiva de archivos PDF: renderizando a 400 DPI con dimension mayor de 2048 px, el modelo transcribe documentos completos a Markdown conservando la estructura de titulos, parrafos y tablas, lo que permite indexar el contenido en buscadores internos.
- Extraccion de datos de facturas y recibos: en modo grounding, el modelo devuelve cajas delimitadoras y etiquetas por componente, de modo que un pipeline posterior puede mapear campos (emisor, fecha, importe) a un esquema estructurado.
- Procesamiento de formularios: gracias al tag `forms` y a la comprension de maquetacion, se pueden extraer pares clave-valor de formularios escaneados sin plantillas especificas por documento.
- Conversion de tablas a formato estructurado: la capacidad de comprender tablas permite transformar tablas impresas en CSV o Markdown aptos para analisis automatico.
- Extraccion de datos de graficos: en modo grounding el modelo puede devolver la region del grafico y convertir sus datos en tablas HTML, util para informes financieros o cientificos.
- Servicio de OCR de alta concurrencia: desplegado con vLLM sobre la variante LLM-Compressor o GPTQ, con `max-model-len` de 8192 y `enable_thinking=false`, el cuantizado reduce el coste por pagina frente al modelo en BF16.
- Automatizacion de ingesta documental en pipelines de IA: al integrarse via transformers o endpoint compatible con OpenAI, se puede encadenar como paso previo a un LLM de razonamiento que consume el Markdown generado.
- Analisis de documentos con layout complejo: articulos con columnas, notas al pie y figuras, donde el grounding ayuda a reconstruir el orden de lectura.

## Benchmarks y rendimiento

Los unicos datos publicos encontrados corresponden al modelo base (no al cuantizado) y se ofrecen como referencia, no como medicion de esta version INT4.

| Benchmark / metrica | Valor | Notas |
|---|---|---|
| ParseBench (LightOnOCR-3-4B) | 75,1 | Comparado con Infinity Parser Pro (74,3) |
| Throughput a 1540 px (4B) | 3,36 paginas/s | Modelo base, no cuantizado |
| Throughput a 1540 px (0,8B) | 4,78 paginas/s | Modelo base, no cuantizado |
| Latencia de pagina unica (1B) | 2,7 s | El mas bajo de la familia |

No se han publicado resultados de benchmarks especificos de esta version cuantizada W4A16 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia orientativa, un modelo con pesos INT4 y torre de vision en BF16 suele requerir entre 4 y 8 GB de VRAM, dependiendo de la longitud de contexto y del tamano real del modelo base (que se declara como 4B/4,5B).
- El repositorio ocupa 4,0 GB, por lo que los pesos en disco son manejables en cualquier equipo.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo deberia caber en GPUs de consumo como RTX 3090/4090 (24 GB) con margen amplio, y tambien en GPUs de datacenter (A100, H100, L40S) para mayor concurrencia.
- Cabe en GPU de consumo: previsiblemente si, en modelos con 16 GB o mas de VRAM, aunque el dato no esta confirmado explicitamente.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`, requiere `transformers>=5.5.4`), vLLM (variantes LLM-Compressor o GPTQ, con `--dtype bfloat16` y `--max-model-len 8192`), y AutoGPTQ/Marlin para la variante GPTQ.
- Latencia y throughput estimados: no disponibles para la version cuantizada. Los datos de throughput conocidos (3,36 paginas/s en el 4B base a 1540 px) no son extrapolables directamente a esta variante.
- Preprocesado recomendado por el autor: renderizar a 400 DPI con dimension mayor de 2048 px y mantener la relacion de aspecto nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-W4A16-AutoRound (este) | ~1,54 B declarados (base ~4 B) | no disponible | no disponible (base: ParseBench 75,1) | Apache 2.0 | Hugging Face, transformers/vLLM |
| LightOnOCR-3-4B (base, BF16) | ~4,5 B | no disponible | ParseBench 75,1; 3,36 pag/s a 1540 px | Apache 2.0 | Hugging Face |
| LightOnOCR-3-1B | ~1 B | no disponible | latencia de pagina unica 2,7 s | Apache 2.0 | Hugging Face |
| LightOnOCR-3-0,8B | ~0,8 B | no disponible | 4,78 pag/s a 1540 px | Apache 2.0 | Hugging Face |
| Infinity Parser Pro | no disponible | no disponible | ParseBench 74,3 | no disponible | comercial |

## Limitaciones y advertencias

- El modelo original esta optimizado con el modo de pensamiento desactivado; usar `enable_thinking=True` puede degradar el comportamiento esperado.
- No se declaran idiomas soportados, por lo que no hay garantia documentada de rendimiento multilingue fuera del ingles.
- No hay benchmark publicado del cuantizado: la perdida de precision respecto al modelo en BF16 no esta cuantificada, aunque la preservacion de la torre de vision en BF16 reduce el riesgo en OCR y grounding.
- Discrepancia en el recuento de parametros: los safetensors del repositorio cuantizado declaran 1.541.787.136, mientras que el modelo base se denomina "4B" y fuentes externas lo cifran en ~4,5 B. Conviene verificar el modelo antes de dimensionar hardware.
- Riesgo de alucinacion en documentos de baja calidad, manuscritos o idiomas no cubiertos por el entrenamiento; en tareas de extraccion estructurada conviene validar las salidas.
- La cuantizacion puede afectar a la precision del grounding (coordenadas de cajas delimitadoras) en layouts muy densos; se recomienda evaluar sobre el dominio objetivo.
- El repositorio tiene 0 descargas y 0 likes, y lo publica un autor independiente (Vishva007), no LightOn; se trata de una conversion de terceros sobre el modelo oficial.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de licencia y atribucion correspondiente.
- Dependencia de versiones concretas: requiere `transformers>=5.5.4`, `auto-round`, `pillow` y `torchvision`, lo que puede complicar entornos con versiones antiguas.
- La precisión del grounding depende de mantener la relacion de aspecto; estirar imagenes al preprocesar degrada las coordenadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante GPTQ/Marlin: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ
- Variante LLM-Compressor (vLLM): https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor
- Perfil del autor: https://huggingface.co/Vishva007
- Pagina de investigacion de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Ficha en Featherless: https://featherless.ai/models/lightonai/LightOnOCR-3-4B
- Analisis de la publicacion de LightOnOCR-3: https://www.darius.wiki/en/daily/2026-10-09/lightonocr-3/
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Referencia de paper asociada al modelo: https://arxiv.org/abs/2601.14251
