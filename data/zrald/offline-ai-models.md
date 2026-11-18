# Zrald/offline-ai-models

## Resumen

`Zrald/offline-ai-models` es un repositorio agregado de pesos en formato GGUF publicado por el desarrollador Zrald para su aplicación móvil AI Offline, una app Android de inferencia totalmente local sin cuentas, telemetría ni conexión a internet tras la descarga. No se trata de un modelo único entrenado por el autor, sino de una colección de modelos de terceros (MiniCPM, Phi-3.5, Gemma 2, Qwen2.5, Yi, DeepSeek-R1 distill, Falcon-OCR y DreamShaper) requantizados con recetas propias etiquetadas como HyperQuant y ZDG4, además de un modelo denominado Zrald Qwen3.8-27B en versión comprimida.

El dato de parámetros reportado por la plataforma (1.777.088.000, es decir, aproximadamente 1,78 mil millones) corresponde a uno de los pesos safetensors del repositorio, no al conjunto completo, que suma 35,5 GB distribuidos en múltiples archivos GGUF de distintos tamaños. La relevancia actual del repositorio es práctica: ofrece una vía empaquetada para desplegar modelos pequeños y medianos en dispositivos con recursos limitados (móviles, mini-PC, portátiles sin GPU) usando llama.cpp estándar, con verificación de integridad mediante manifiesto y checksums SHA-256.

La información pública disponible es escasa: no hay model card técnica con detalles de entrenamiento, no se declaran idiomas ni licencia, y el pipeline no está definido. Todo lo que sigue se limita a lo que el autor documenta en el README y a los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrega modelos de arquitecturas diversas: transformer densos y destilaciones; no se especifica por archivo) |
| Parámetros totales | 1.777.088.000 según safetensors del repo; el conjunto abarca modelos desde 0,5B hasta 27B (Zrald Qwen3.8-27B comprimido) |
| Parámetros activos | no disponible (no se declara ningún modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q4_K_M, Q4_K (attn+ffn) con Q2_K en embeddings, Q6_K, Q4_0, HQ (HyperQuant), ZDG4 con imatrix, HQ-optA-im, HQ Q2_K-mix a 3,16 bpw |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con mmproj f16 para el modelo multimodal Falcon-OCR); también safetensors en el repo |

## Arquitectura y entrenamiento

El repositorio no entrena modelos desde cero: distribuye pesos de terceros requantizados. Las recetas propietarias HyperQuant y ZDG4 aplican cuantización con matrices de importancia (imatrix) y mezclas de tipos por capa (por ejemplo, Q4_K en atención y feed-forward con Q2_K en embeddings, o HQ Q2_K-mix a 3,16 bits por peso). El autor afirma que estos artefactos corren sobre llama.cpp estándar sin motor personalizado, lo que implica que la arquitectura subyacente de cada archivo es la del modelo original (MiniCPM5-1B, Phi-3.5 Mini, Gemma 2 2B, Qwen2.5, Yi-6B, DeepSeek-R1 distill, Falcon-OCR, DreamShaper para generación de imágenes vía sd.cpp).

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO) propios, porque el autor no entrena. La innovación declarada es exclusivamente de compresión y empaquetado: recetas de cuantización con imatrix, una "serving lane" con KV-cache cuantizada y decodificación especulativa para el modelo flagship de móvil (MiniCPM5-1B ZDG4), y verificación de descargas mediante `models/manifest.json` con tamaños y SHA-256.

## Capacidades

- Generación de texto conversacional (modelos chat: Gemma2-2B-it, Qwen2.5 Instruct, Yi-6B Chat, MiniCPM5-1B).
- Razonamiento: incluye DeepSeek-R1 15B Distill en versión HyperQuant.
- Generación de código: Phi-3.5 Mini Coder en dos variantes (HyperQuant de 1,4 GB y Balanced Q4_K_M de 2,3 GB).
- OCR y procesamiento de documentos: Falcon-OCR multimodal con proyector mmproj en f16.
- Generación de imágenes: DreamShaper-7 LCM en Q4_0, ejecutable con sd.cpp.
- Inferencia totalmente offline en Android mediante la app AI Offline, con selección y descarga automática de modelos.
- Compatibilidad con cualquier motor llama.cpp en escritorio o servidor, incluidos endpoints compatibles (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada; el modelo de razonamiento incluido es una destilación de DeepSeek-R1.
- Capacidades multilingües: no disponibles como dato declarado.

## Casos de uso

- Asistente conversacional en móvil sin conexión: la app AI Offline descarga MiniCPM5-1B ZDG4 (~535 MB) y lo ejecuta con KV-cache cuantizada y decodificación especulativa, permitiendo chat privado en un teléfono de gama media sin enviar datos a ningún servidor.
- Autocompletado y generación de código en portátiles sin GPU: Phi-3.5 Mini Coder en HyperQuant (1,4 GB, 3,16 bpw) o Balanced Q4_K_M (2,3 GB) se integra en editores o scripts CLI vía llama.cpp, con requisito de al menos 3 GB de RAM.
- Digitalización de documentos en local: Falcon-OCR (Q6_K más mmproj f16, ~2,1 GB) permite extraer texto de imágenes y PDF escaneados en un equipo de escritorio sin subir documentos a servicios en la nube, útil por motivos de confidencialidad.
- Razonamiento paso a paso en estaciones de trabajo: DeepSeek-R1 15B Distill en HyperQuant cubre tareas de análisis y resolución de problemas en máquinas con RAM suficiente, manteniendo el proceso completamente local.
- Despliegue en servidor de bajo coste: los GGUF son estándar y funcionan en llama.cpp, por lo que pueden servirse detrás de una API compatible con OpenAI en una instancia pequeña para prototipos internos o entornos aislados (air-gapped).
- Generación de ilustraciones y prototipado visual: DreamShaper-7 LCM en Q4_0 (~4 GB) con sd.cpp permite crear imágenes en local en equipos sin GPU dedicada de gran VRAM.
- Pruebas de cuantización extrema: los formatos HQ y ZDG4 sirven como referencia para evaluar la degradación de perplejidad (por ejemplo, 29,1 frente a una línea base de 26,2 en wikitext-2 para MiniCPM5-1B Q4_K_M) antes de adoptar compresión agresiva en producción.

## Benchmarks y rendimiento

El autor solo publica perplejidad en wikitext-2 para algunos archivos. No hay resultados de MMLU, HumanEval, GSM8K ni comparativas estandarizadas.

| Modelo / variante | Cuantización | Tamaño | Perplejidad wikitext-2 |
|---|---|---|---|
| MiniCPM5-1B ZDG4 | Q4_K_M + imatrix | ~535 MB | ~25,9 |
| MiniCPM5-1B Q4_K_M | Q4_K attn+ffn / Q2_K embed, imatrix | ~540 MB | 29,1 (línea base 26,2) |
| Phi-3.5 Mini Coder HyperQuant | HQ Q2_K-mix, 3,16 bpw | ~1,4 GB | 11,9 |
| Resto de modelos | varias | varias | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada por archivo según el propio autor: MiniCPM5-1B ZDG4 y Q4_K_M ~535-540 MB; HyperQuant de MiniCPM5 requiere al menos 1 GB de RAM; Phi-3.5 Mini Coder HyperQuant requiere al menos 3 GB de RAM; Zrald Qwen3.8-27B comprimido ~9,2 GB y al menos 14 GB de RAM; Falcon-OCR ~2,1 GB; DreamShaper-7 LCM ~4 GB.
- GPU recomendadas: no disponibles. Los tamaños indicados apuntan a ejecución en CPU; para los modelos de 6B-27B se beneficiarían de GPU con VRAM suficiente (por ejemplo, RTX 4090 de 24 GB para el de 27B comprimido), pero el autor no publica requisitos de GPU.
- ¿Cabe en GPU de consumo? Los modelos de 0,5B a 3B sí caben en cualquier GPU con 4-8 GB de VRAM; el de 27B comprimido (~9,2 GB) cabría en GPUs de 12 GB o más; no hay confirmación oficial.
- Opciones de despliegue: llama.cpp (motor de referencia), app AI Offline en Android, sd.cpp para DreamShaper; el tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI. vLLM, TGI y Ollama no se mencionan explícitamente, aunque Ollama consume GGUF de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zrald/offline-ai-models (este repo) | Agregado; 1,78B en safetensors, archivos de 0,5B a 27B | no disponible | no disponible | GGUF en HF, app Android | Requantizaciones de terceros con recetas propias; sin benchmarks estándar |
| MiniCPM5-1B (original) | ~1B | no disponible en esta ficha | no disponible | HF | Base del flagship móvil; aquí solo se redistribuye cuantizado |
| Phi-3.5 Mini Coder (original) | ~3,8B | no disponible en esta ficha | no disponible | HF | Base del modelo de código incluido |
| Qwen2.5 0.5B / 3B Instruct (original) | 0,5B / 3B | no disponible en esta ficha | no disponible | HF | Incluidos en versión HQ |

No se dispone de datos de rendimiento comparables entre estas variantes y sus originales más allá de la perplejidad citada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del repositorio ni de los pesos redistribuidos, lo que impide confirmar el uso comercial y puede entrar en conflicto con las licencias de los modelos originales de terceros.
- Idiomas no declarados: no hay garantía documentada de calidad multilingüe ni de soporte del castellano.
- Sin benchmarks estándar: solo hay perplejidad en wikitext-2 para tres archivos; no hay evaluación de razonamiento, código o fidelidad factual.
- Riesgo de alucinación: los modelos subyacentes son de tamaño pequeño o mediano y las cuantizaciones agresivas (Q2_K en embeddings, 3,16 bpw) pueden degradar la calidad; la propia tabla muestra un aumento de perplejidad de 26,2 a 29,1 en una variante.
- Recetas propietarias: HyperQuant y ZDG4 no están documentadas en detalle, lo que dificulta auditar la reproducibilidad de las cuantizaciones.
- Contexto no especificado: se desconoce la ventana máxima por modelo, un dato crítico para aplicaciones de documentos largos.
- Repositorio agregado: mezcla modelos de texto, código, OCR y difusión de imágenes; no es un modelo único y requiere seleccionar el archivo adecuado, con el consiguiente riesgo de confusión.
- Dependencia de la app: parte del valor añadido (descarga y verificación automática) está ligado a AI Offline; fuera de ella hay que gestionar los archivos manualmente.
- Fechas de creación y actualización inusuales (2026) en los metadatos de Hugging Face; conviene verificar la integridad de los archivos con los SHA-256 del manifiesto antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zrald/offline-ai-models
- App en Google Play: https://play.google.com/store/apps/details?id=shop.zraldwebdevelopmentservices.offlineai
- Sitio del desarrollador: https://zraldwebdevelopmentservices.shop
- Manifiesto de modelos (referenciado en el README): `models/manifest.json` dentro del repositorio
