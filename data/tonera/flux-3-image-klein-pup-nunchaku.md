# tonera/flux-3-image-klein-pup-nunchaku

## Resumen

`tonera/flux-3-image-klein-pup-nunchaku` es una cuantización INT4 del modelo `black-forest-labs/flux-3-image-klein-pup`, un *prompt upsampler* construido a partir de un fine-tune completo de Qwen3.5-9B. Su función es convertir una petición breve del usuario (por ejemplo, "una persona paseando a un perro bajo el sol de la tarde") en una descripción larga, estructurada y específica (medio, estilo, escena, iluminación, cámara, color, materiales y posiciones) que el modelo de imagen FLUX 3 Image Klein necesita para generar o editar correctamente. El repositorio lo publica el usuario tonera y se distribuye bajo licencia Apache 2.0.

El modelo original en BF16 pesa 18,8 GB y consume cerca de 18 GiB de VRAM durante la generación, lo que resulta problemático cuando el modelo de imagen comparte la misma GPU. Esta versión comprime todas las capas lineales del *transformer* a INT4 (W4A16, grupo 128), incluyendo `lm_head`, manteniendo en coma flotante la torre de visión, los embeddings, las RMSNorm y las proyecciones `in_proj_a`/`in_proj_b` de las capas de atención lineal.

La relevancia actual es práctica: reduce el consumo pico a unos 7 GiB y el tiempo por token de 15,43 ms a 4,29 ms (3,6× de aceleración), dejando VRAM y tiempo libres para la generación de imágenes en la misma GPU. El modelo tiene 9.409.813.744 parámetros y un pipeline declarado de `image-text-to-text`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5-9B (capas de atención completa y capas de atención lineal con puerta de decaimiento), con torre de visión para entradas de imagen |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 W4A16, grupo 128 (capas lineales del LM y `lm_head`); resto de componentes en coma flotante |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`svdq-int4-flux-3-image-klein-pup-nunchaku.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune completo de Qwen3.5-9B adaptado a la tarea de *prompt upsampling* para FLUX 3 Image Klein. La arquitectura combina 32 capas de lenguaje con atención estándar y capas de atención lineal que incorporan proyecciones `in_proj_a` e `in_proj_b` para fijar la puerta de decaimiento. Dispone además de una torre de visión que procesa imágenes de referencia y una única configuración de pesos que sirve para tres modos (texto a imagen, edición con imagen de referencia y composición con cajas delimitadas), seleccionados mediante el *system prompt*. El modelo escribe el medio y el estilo, la escena, la luz, la cámara y el color, material y posición de cada sujeto, y deja intacto entre comillas el texto que debe renderizarse en la imagen.

La cuantización se realizó con datos de calibración generados por el propio modelo: el *system prompt* de texto a imagen, la petición del usuario y un *caption* generado con decodificación voraz en BF16, mezclados con aproximadamente un 25 % de texto general. El cuerpo del modelo emplea *smoothing* AWQ, búsqueda de recorte de pesos y GPTQ; el `lm_head` se cuantiza con GPTQ sobre las salidas del modelo de lenguaje ya cuantizado. La torre de visión, los *token embeddings*, todas las RMSNorm y `in_proj_a`/`in_proj_b` permanecen en coma flotante, de modo que la ruta de visión no se altera.

## Capacidades

- Generación de descripciones largas y estructuradas (típicamente 200-300 palabras) a partir de peticiones breves, con detalle de medio, estilo, iluminación, cámara, materiales y disposición espacial.
- *Prompt upsampling* para texto a imagen: transforma una frase coloquial en el *prompt* completo que espera FLUX 3 Image Klein.
- *Prompt upsampling* para edición con imagen de referencia: analiza primero las imágenes de referencia y luego explicita qué cambia y qué se mantiene.
- Soporte de composición con cajas delimitadas (*boxed layout*), seleccionable mediante *system prompt*.
- Preservación literal del texto que debe renderizarse en la imagen, mantenido entre comillas.
- Procesamiento de imágenes de entrada (por ejemplo, referencia de 1024×1024 que se tokeniza en 1624 tokens).
- Servidor compatible con la API OpenAI Chat Completions (`api.py`), lo que facilita su integración como servicio residente.
- Modo *thinking* configurable (`enable_thinking`), desactivado en las mediciones publicadas.
- Integración con ComfyUI mediante el nodo `Vitoom Nunchaku Prompt Upsampler`.

## Casos de uso

- **Generación de imágenes en producción con FLUX 3 Klein**: el modelo convierte la petición corta del usuario en un *prompt* detallado antes de pasarlo al modelo de imagen. Al ocupar solo unos 7 GiB de VRAM, ambos modelos pueden convivir en una misma GPU de 24 GB o superior, evitando el intercambio de pesos entre dispositivos.
- **Edición de imágenes guiada por lenguaje natural**: se conecta la imagen de referencia a la entrada `image` del nodo o al campo correspondiente de la API; el modelo describe primero la referencia y luego concreta los cambios solicitados, lo que reduce ediciones erráticas por instrucciones ambiguas.
- **Servicio residente de *upsampling* para aplicaciones web**: `api.py` expone una interfaz compatible con OpenAI Chat Completions; con 221 tokens/s y unos 1,4 s para un *caption* de 297 tokens, es viable como microservicio que atiende peticiones concurrentes de una interfaz de generación de imágenes.
- **Automatización de pipelines de contenido gráfico**: en flujos por lotes (catálogos, campañas, ilustración editorial) se puede pregenerar el *prompt* enriquecido para cada entrada y encolar después la generación de imagen, separando las dos fases y aprovechando la velocidad de decodificación del modelo cuantizado.
- **Integración en ComfyUI para artistas y diseñadores**: mediante el plugin Vitoom Nunchaku, el nodo de *prompt upsampler* se conecta a la entrada de *prompt* positivo del grafo; el usuario escribe una frase y obtiene descripciones ricas sin salir del entorno visual.
- **Prototipado en GPU de consumo**: con unos 7 GiB de VRAM pico, cabe en tarjetas como la RTX 4090 o la RTX 5090 junto al modelo de imagen, lo que permite montar un estudio de generación completo en una estación de trabajo de una sola GPU.
- **Sistemas de composición con disposición espacial**: el modo de cajas delimitadas permite describir la posición de cada sujeto en el encuadre, útil para maquetas, viñetas e infografías generadas.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en una RTX 5090, `dtype` bfloat16, decodificación voraz y `enable_thinking=False`. La VRAM es el pico durante la generación y no varía con la longitud de salida.

| Escenario | BF16 | INT4 | Aceleración | VRAM BF16 | VRAM INT4 | VRAM ahorrada |
|---|---:|---:|---:|---:|---:|---:|
| *Upsampling* texto a imagen | 15,43 ms/token | 4,29 ms/token | 3,60× | 17,75 GiB | 7,02 GiB | 10,73 GiB (60,5 %) |
| *Upsampling* edición de una imagen | 15,35 ms/token | 4,35 ms/token | 3,53× | 17,93 GiB | 7,21 GiB | 10,72 GiB (59,8 %) |

Mediciones de extremo a extremo a través del servidor residente `api.py`:

| Escenario | Extremo a extremo | Prefill + primer token | Salida | Decodificación | Tokens/s |
|---|---:|---:|---:|---:|---:|
| *Upsampling* texto a imagen | 1,424 s | 0,086 s | 297 tokens | 4,52 ms/token | 221 |
| *Upsampling* edición de una imagen | 1,174 s | 0,271 s | 200 tokens | 4,54 ms/token | 220 |

En el escenario de edición, la imagen de referencia es de 1024×1024 y la entrada de 1624 tokens; los 0,271 s incluyen la subida de unos 1,8 MB de datos de imagen por red local, aunque la mayor parte corresponde a la codificación de visión y al *prefill*. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,02 GiB en texto a imagen y 7,21 GiB en edición con imagen de referencia (pico durante la generación, INT4).
- El modelo BF16 original requiere 17,75-17,93 GiB, por lo que la versión INT4 es la única que deja margen razonable para compartir GPU con el modelo de imagen.
- GPU recomendadas: RTX 5090 (plataforma de las mediciones), RTX 4090 y, en general, cualquier GPU NVIDIA con soporte CUDA y al menos 8-10 GiB libres para el *upsampler*; el autor no publica pruebas en A100 ni H100.
- Cabe en GPU de consumo de gama alta (RTX 4090, RTX 5090) y deja espacio para FLUX 3 Klein en la misma tarjeta.
- Opciones de despliegue: servidor propio `api.py` compatible con OpenAI Chat Completions, ComfyUI 0.44 o superior con `--enable-manager` y el plugin Vitoom Nunchaku, y Python con una build de Nunchaku que incluya `NunchakuQwen3_5ForConditionalGeneration` (ruedas precompiladas en `tonera/vitoom-nunchaku`).
- Latencia y rendimiento: 4,29-4,35 ms/token en decodificación y 220-221 tokens/s; un *caption* de unos 300 tokens se completa en torno a 1,4 s.
- Requiere GPU CUDA; no se documenta soporte para CPU, llama.cpp, vLLM, TGI ni Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | VRAM en generación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tonera/flux-3-image-klein-pup-nunchaku` (esta ficha) | 9,41 B | No disponible | safetensors INT4 W4A16 | ~7 GiB | Apache 2.0 | Hugging Face, ComfyUI, API OpenAI-compatible |
| `black-forest-labs/flux-3-image-klein-pup` (BF16) | 9,41 B | No disponible | safetensors BF16 | ~17,8 GiB | No disponible en la información | Hugging Face |
| Alternativas genéricas de *prompt upsampling* con LLM | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es contra el modelo base en BF16: misma arquitectura y mismos parámetros, pero con 3,5-3,6× menos tiempo por token y un 60 % menos de VRAM. No se dispone de datos de otros *upsamplers* comparables en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia de Nunchaku**: requiere una build específica de la librería Nunchaku con `NunchakuQwen3_5ForConditionalGeneration`; no funciona con `transformers` estándar sin ese soporte.
- **Solo GPU CUDA**: no se documenta inferencia en CPU ni en aceleradores distintos de NVIDIA.
- **Pérdida de fidelidad por cuantización**: los *captions* generados por la versión INT4 son ligeramente más cortos que los de BF16 en algunas peticiones, lo que puede traducirse en descripciones algo menos detalladas.
- **Idiomas no declarados**: la model card no especifica la cobertura lingüística; el modelo base es un fine-tune de Qwen3.5-9B y el autor publica documentación en inglés y chino, pero no hay garantía formal sobre otros idiomas.
- **Longitud de contexto no documentada**: no se indica la ventana máxima, lo que complica dimensionar entradas con muchas imágenes de referencia o *prompts* muy largos.
- **Riesgo de alucinación**: al ser un modelo generativo de descripciones, puede inventar detalles (materiales, posiciones, texto) que no estaban en la petición original; conviene revisar los *prompts* generados en flujos críticos.
- **Sesgos**: no se documentan evaluaciones de sesgo; al heredar el comportamiento de Qwen3.5-9B y de los datos de calibración, pueden aparecer sesgos de representación en las descripciones generadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `black-forest-labs/flux-3-image-klein-pup`, que no se detalla en la información disponible.
- **Madurez**: el repositorio tiene 107 descargas y 1 *like*, con una única versión publicada en octubre de 2026 y actualizada en noviembre de 2026; el soporte de la comunidad es todavía reducido.
- **Requisito de ComfyUI**: la integración visual exige ComfyUI 0.44 o superior arrancado con `--enable-manager` y la instalación del plugin de terceros Vitoom Nunchaku.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tonera/flux-3-image-klein-pup-nunchaku
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo de imagen FLUX 3 Klein cuantizado: https://huggingface.co/tonera/flux-3-image-klein-nunchaku
- Ruedas precompiladas de Nunchaku: https://huggingface.co/tonera/vitoom-nunchaku
- Plugin de ComfyUI Vitoom Nunchaku: https://github.com/tonera/vitoom-nunchaku-comfy
- README en chino: README_CN.md (en el propio repositorio)
- Script de benchmark: `scripts/profile_qwen3_5_pup.py` en el repositorio de Nunchaku
- Flujo de ejemplo: `example_workflows/flux3_klein.json` en el plugin Vitoom Nunchaku
