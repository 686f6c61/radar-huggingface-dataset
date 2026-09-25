# WaveCut/Qwen3.5-2B-MLX-DWQ-4bit

## Resumen

WaveCut/Qwen3.5-2B-MLX-DWQ-4bit es un checkpoint cuantizado del modelo multimodal Qwen3.5-2B de Qwen, convertido al formato MLX de Apple y optimizado con cuantización DWQ de 4 bits. Está pensado para ejecutar tareas de imagen-a-texto (image-text-to-text) en Apple Silicon, no en GPU NVIDIA, ya que usa el framework MLX en lugar de GGUF o safetensors estándar de PyTorch. Los pesos del backbone de lenguaje se cuantizan a 4 bits afines con grupo de 32, mientras que la torre de visión conserva los pesos BF16 originales.

El modelo declara 2.213.241.664 parámetros totales y un archivo de pesos de 1,84 GB, frente a los 4,43 GB de la conversión MLX-VLM totalmente en BF16. La aportación principal del autor no es un modelo nuevo, sino una receta de cuantización: DWQ ajusta escalas y sesgos usando 128 muestras de texto natural por 128 tokens predichos, equilibradas entre 16 idiomas procedentes de FineWeb, FineWeb2 y Wikipedia. En 65.408 tokens de validación, DWQ reduce la perplejidad a 19,8710 frente a 20,6156 de la cuantización RTN de 4 bits, aunque queda por encima del BF16 original (18,6677).

Su relevancia es doble: por un lado, ofrece un punto de comparación cuantitativo entre técnicas de cuantización sobre un mismo modelo; por otro, permite desplegar un VLM de 2B en portátiles y equipos de sobremesa con chip M-series sin depender de la nube. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y la model card advierte de que la evaluación visual se hizo sobre un conjunto sintético pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parámetros totales | 2.213.241.664 (2,21 mil millones) |
| Parámetros activos | no disponible (la model card no lo indica; las notas de conversión de terceros mencionan capas MoE gate y shared_expert_gate en Qwen3.5, sin cifra de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | DWQ 4-bit affine, group size 32 en el backbone de lenguaje; torre de visión en BF16 |
| Idiomas soportados | 16: en, ru, pl, uk, zh, ja, ko, ar, hi, bn, es, fr, de, pt, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no GGUF) |
| Librería | mlx |
| Modelo base | Qwen/Qwen3.5-2B (revisión 15852e8c16360a2fea060d615a32b45270f8a8fc) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 3,0 GB |
| Peso del archivo de pesos | 1,84 GB (frente a 4,43 GB en BF16) |
| Fecha de publicación | 24 de septiembre de 2026 |
| Versiones probadas | mlx-vlm 0.7.3, mlx 0.32.2 |

## Arquitectura y entrenamiento

No se describe la arquitectura interna de Qwen3.5-2B en la información disponible más allá de su naturaleza multimodal: entrada de imagen y texto, salida de texto. La model card sí precisa la topología de la cuantización aplicada: el backbone de lenguaje usa cuantización afín de 4 bits con tamaño de grupo 32, mientras que la torre de visión se mantiene en BF16 sin cuantizar. Por tanto, el nombre "4bit" se refiere únicamente a los pesos de lenguaje. Las notas de conversión publicadas por mlx-community para su propia versión de Qwen3.5-2B mencionan la necesidad de corregir el manejo de capas MoE gate, shared_expert_gate y el casting de A_log, lo que sugiere componentes de mezcla de expertos en la arquitectura base, pero no se dispone de confirmación ni de cifras de parámetros activos.

El proceso de cuantización DWQ no reentrena el modelo: optimiza escalas y sesgos de cuantización sobre 128 muestras de texto natural, con 128 tokens predichos por muestra, equilibradas entre 16 idiomas extraídos de FineWeb, FineWeb2 y Wikipedia. Los datasets de calibración declarados son HuggingFaceFW/fineweb, HuggingFaceFW/fineweb-2 y wikimedia/wikipedia. No hay información sobre el entrenamiento original de Qwen3.5-2B (número de tokens, composición del dataset, uso de RLHF o DPO) en el material proporcionado.

## Capacidades

- Generación de texto e inferencia sobre imágenes en un único pipeline image-text-to-text (descripción de imágenes, respuesta a preguntas visuales).
- Conversación multi-turno, según la etiqueta "conversational" del repositorio.
- Cobertura multilingüe declarada de 16 idiomas: inglés, ruso, polaco, ucraniano, chino, japonés, coreano, árabe, hindi, bengalí, español, francés, alemán, portugués, turco y vietnamita.
- Ejecución local en Apple Silicon mediante MLX y MLX-VLM, sin dependencia de servicios en la nube.
- Capacidades de tool calling, function calling, agentes, modo thinking, audio o vídeo: no disponibles en la información proporcionada.
- Reconocimiento óptico de caracteres (OCR): presente de forma limitada, con 0 aciertos sobre 5 en la suite exacta de OCR del propio autor.

## Casos de uso

- Descripción automática de imágenes en local: el modelo recibe una imagen y genera texto descriptivo, todo dentro del equipo, lo que evita enviar contenido sensible a APIs externas. Adecuado para catalogación de fotos personales o material médico en un Mac.
- Etiquetado y curación de datasets visuales: se puede usar para preanotar imágenes con descripciones que después se revisan manualmente, aprovechando que el coste por inferencia es cero una vez desplegado. El autor advierte de que el OCR es débil, por lo que conviene limitar su uso a descripciones semánticas y no a extracción literal de texto.
- Accesibilidad web y de aplicaciones: generación de texto alternativo para imágenes en un CMS o en una app, ejecutado en el propio servidor de desarrollo con MLX. La ventana multilingüe permite producir el texto alternativo en el idioma del usuario final.
- Asistentes conversacionales multilingües de bajo consumo: al cubrir 16 idiomas con un modelo de 2,21 mil millones de parámetros y 1,84 GB de pesos, encaja en aplicaciones de chat desplegadas en portátiles M-series, con coste de memoria reducido frente a alternativas BF16.
- Prototipado rápido de producto en Apple Silicon: permite validar una idea de VLM sin contratar GPU en la nube ni configurar CUDA, usando el comando `mlx_vlm.generate` que documenta el autor.
- Investigación en cuantización: el repositorio publica NLL y perplejidad para BF16, RTN 4-bit y DWQ 4-bit sobre los mismos 65.408 tokens, más un archivo de evaluación (`eval/final-vlm-comparison.json`), lo que lo convierte en un punto de referencia reproducible para comparar métodos de cuantización sobre pesos multimodales.
- Evaluación comparativa de convertidores MLX: junto a las variantes de mlx-community y SwinliQ-AIs, sirve para contrastar el efecto de distintas recetas de cuantización (RTN, DWQ, mixta 4/8 bits) sobre el mismo modelo base.

## Benchmarks y rendimiento

La model card publica fidelidad de pesos en lenguaje, medida sobre 65.408 tokens de validación en 16 idiomas:

| Pesos de lenguaje | NLL (menor es mejor) | Perplejidad (menor es mejor) |
|---|---:|---:|
| BF16 original | 2,9268 | 18,6677 |
| RTN 4-bit, grupo 32 | 3,0260 | 20,6156 |
| DWQ 4-bit, grupo 32 (este modelo) | 2,9893 | 19,8710 |

La mejora de DWQ sobre RTN se observó en los 16 idiomas evaluados, según el autor.

En la suite de imágenes sintéticas, este modelo y el BF16 original obtuvieron ambos 11/18; la prueba de OCR exacto arrojó 0/5.

Latencia de imagen a primer token medida en un M2 Max, mediana de 14 ejecuciones por resolución, incluyendo preprocesado:

| Resolución | Mediana de tiempo |
|---|---:|
| 256 px | 0,137 s |
| 512 px | 0,355 s |
| 768 px | 0,849 s |
| 1024 px | 1,744 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: a partir de un archivo de pesos de 1,84 GB más la torre de visión en BF16 y la caché KV, el modelo completo debería caber en un entorno de 3 a 4 GB de memoria. Es una estimación derivada del tamaño de los pesos, no un dato publicado por el autor.
- El formato es MLX, por lo que el destino natural son equipos Apple Silicon (familias M1, M2, M3, M4). El autor midió latencias en un M2 Max.
- GPU NVIDIA mencionadas en la guía de terceros para Qwen 3.5 en general: se cita un H200 sirviendo el modelo mediante llama.cpp con endpoint compatible con OpenAI. Esa guía no evalúa este checkpoint MLX concreto.
- Compatibilidad con GPU de consumo NVIDIA: no directamente con este repositorio, que no incluye pesos GGUF ni safetensors estándar de PyTorch. Para RTX 4090 o similares habría que recurrir a las conversiones GGUF o MLX alternativas del mismo modelo base.
- Opciones de despliegue: MLX-VLM (`mlx-vlm==0.7.3` con `mlx==0.32.2`), Ollama mediante las variantes `qwen3.5:2b-mlx` y `qwen3.5:2b`, y llama.cpp para el caso CUDA según la guía externa. vLLM y TGI no soportan formato MLX.
- Comando de referencia del autor: `mlx_vlm.generate --model WaveCut/Qwen3.5-2B-MLX-DWQ-4bit --image /ruta/imagen.jpg --prompt "Describe this image." --max-tokens 128 --temperature 0`.
- Throughput de generación de tokens: no disponible. Solo se publican latencias de imagen a primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WaveCut/Qwen3.5-2B-MLX-DWQ-4bit (este) | 2,21 mil millones | DWQ 4-bit grupo 32 + torre visión BF16 | MLX safetensors | Apache 2.0 | PPL de 19,8710 sobre 65.408 tokens; 1,84 GB |
| mlx-community/Qwen3.5-2B-MLX-4bit | no disponible | 4 bits (receta no detallada) | MLX | Apache 2.0 | Conversión con correcciones de soporte Qwen3.5 (MoE gate, shared_expert_gate, A_log) |
| SwinliQ-AIs/Qwen3.5-2B-4bit | no disponible | Mixta 4-bit / 8-bit (optiq) | MLX safetensors | Apache 2.0 | Modelo de texto, sin pipeline multimodal declarado |
| Qwen/Qwen3.5-2B (base) | 2,21 mil millones | BF16 | safetensors | Apache 2.0 | Referencia de calidad: NLL 2,9268, PPL 18,6677; 4,43 GB en conversión MLX-VLM |

No se dispone de datos comparativos de benchmarks de tareas (razonamiento, código, matemáticas) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento débil en OCR: 0 aciertos sobre 5 en la suite de OCR exacto del propio autor. No es fiable para extraer texto literal de documentos o capturas.
- Evaluación visual limitada: la suite de imágenes es pequeña y sintética (11/18 aciertos, idéntico al BF16), por lo que no permite extrapolar comportamiento en dominios reales como fotografía, radiología o documentos escaneados.
- Inferencia de vídeo no evaluada.
- El NLL y la perplejidad publicados miden fidelidad de los pesos de lenguaje, no calidad de instrucciones ni seguridad del modelo. Un buen resultado ahí no garantiza buen comportamiento conversacional.
- Dependencia de plataforma: al ser formato MLX, no es desplegable directamente en CUDA, ROCm ni en aceleradores no Apple. Requiere versiones concretas de mlx-vlm (0.7.3) y mlx (0.32.2), lo que añade riesgo de ruptura con actualizaciones.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar la ficha. No hay informes independientes que confirmen los números del autor.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje; no se han publicado evaluaciones de sesgo, toxicidad o robustez adversarial.
- La licencia es Apache 2.0, si bien la model card enlaza a la licencia del modelo base Qwen3.5-2B; conviene verificar ese enlace antes de un uso comercial.
- Cobertura idiomática declarada de 16 idiomas, pero la calidad por idioma no se ha medido más allá del NLL de fidelidad de pesos; el español figura en la lista sin resultados específicos publicados.
- Longitud de contexto no disponible, dato crítico para planificar aplicaciones con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Qwen3.5-2B-MLX-DWQ-4bit
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Datos de evaluación citados por el autor: `eval/final-vlm-comparison.json` (incluido en el repositorio)
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Conversión alternativa mlx-community/Qwen3.5-2B-MLX-4bit: https://huggingface.co/mlx-community/Qwen3.5-2B-MLX-4bit
- Conversión alternativa SwinliQ-AIs/Qwen3.5-2B-4bit: https://huggingface.co/SwinliQ-AIs/Qwen3.5-2B-4bit
- Ollama, variante MLX: https://ollama.com/library/qwen3.5:2b-mlx
- Ollama, variante estándar: https://ollama.com/library/qwen3.5:2b
- Guía de despliegue local en una sola GPU (llama.cpp, endpoint compatible con OpenAI): https://www.qtithow.com/2026/09/running-qwen-35-locally-on-single-gpu.html
- Dataset de calibración FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset de calibración FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset de calibración Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
