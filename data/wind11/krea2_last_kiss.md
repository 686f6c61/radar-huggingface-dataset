# wind11/Krea2_Last_Kiss

## Resumen

Krea2_Last_Kiss es un checkpoint de generación de texto a imagen publicado por el usuario wind11 en HuggingFace, construido mediante fusión (merge) del modelo Krea 2 Turbo de Krea.ai con un conjunto de LoRAs publicados en Civitai. Su objetivo declarado es doble: eliminar el sesgo de censura del modelo base y ofrecer un único checkpoint "todoterreno" que rinda tanto en contenido SFW como NSFW, sin necesidad de finetunes separados.

El modelo hereda la arquitectura del base: una columna vertebral de Diffusion Transformer (DiT) densa de 12B parámetros, codificador de texto Qwen3-VL con agregación de características multicapa (sin CLIP), VAE de Qwen Image y un checkpoint destilado a 8 pasos que funciona sin CFG. La resolución nativa de generación se sitúa en el rango de 1K a 2K píxeles.

Su interés práctico reside en dos factores. Por un lado, documenta un flujo de trabajo habitual en la comunidad: fusionar LoRAs de Civitai sobre un Turbo destilado manteniendo la compatibilidad con LoRAs entrenados sobre Krea 2 RAW (el flujo train-on-RAW / run-on-Turbo que propone Krea). Por otro, relaja deliberadamente la expectativa de filtrado de contenido que la licencia del modelo base impone a los desplegadores, lo que traslada toda la responsabilidad editorial y legal al usuario aguas abajo. El repositorio ocupa 13,5 GB y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) denso y destilado; codificador de texto Qwen3-VL (agregación multicapa, sin CLIP) + VAE de Qwen Image |
| Parámetros totales | 12B (columna vertebral DiT, según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada es un prompt de texto; no se publica límite de tokens) |
| Tipos de cuantización | El título de la model card indica INT8; no se documentan variantes GGUF, fp8 ni fp16 en el repositorio |
| Idiomas soportados | No disponible (no se declara lista de idiomas; toda la documentación y los ejemplos están en inglés) |
| Licencia | other (Krea 2 Community License para el checkpoint base; cada LoRA fusionado bajo su licencia individual) |
| Formato de pesos | safetensors (el ejemplo de inferencia usa `Krea2_Last_Kiss.safetensors`) |
| Resolución nativa | 1024–2048 px, con padding a múltiplos de 16 |
| Pasos de muestreo | 8 (destilado) |
| CFG | 0 (CFG-free; el autor indica que ~0–1 funciona) |
| Timestep shift (mu) | 1,15 |
| Sampler recomendado | `euler` / `simple` |
| Negativo | No requerido (dejar vacío) |
| Tamaño del repositorio | 13,5 GB |
| Pipeline | text-to-image |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un merge de pesos. El autor parte de Krea 2 Turbo y fusiona en él un conjunto de LoRAs publicados en Civitai; la model card no especifica ni el número exacto de LoRAs, ni sus nombres, ni los ratios de mezcla aplicados, ni la herramienta de merging utilizada. Tampoco se documenta ningún proceso de entrenamiento adicional, ajuste por preferencias (RLHF/DPO) ni dataset propio: las capacidades proceden íntegramente del base más las contribuciones de los LoRAs.

La arquitectura subyacente es un DiT denso de 12B parámetros, destilado a 8 pasos y diseñado para operar sin classifier-free guidance, lo que reduce a la mitad el coste de inferencia respecto a un modelo con CFG activo. Una de las diferencias técnicas más relevantes frente a generadores anteriores es el codificador de texto: emplea Qwen3-VL con agregación de características de varias capas en lugar de CLIP, lo que hace que el prompt se procese como lenguaje natural y no como una bolsa de etiquetas. El VAE es el de Qwen Image y la decodificación se realiza tras un shift temporal de 1,15.

El efecto declarado del merge es triple: elimina el "tag-fading" y la reducción de expresividad que el autor atribuye al Turbo original; mantiene el comportamiento del base frente a LoRAs entrenados sobre Krea 2 RAW; y conserva la fidelidad de anatomía, ropa, color y textura de piel. No se aportan métricas objetivas que respalden estas afirmaciones.

## Capacidades

- Generación de texto a imagen en el rango de 1024 a 2048 px, con padding automático a múltiplos de 16.
- Inferencia en 8 pasos con CFG 0, lo que sitúa el coste por imagen muy por debajo de los pipelines de 20–50 pasos.
- Interpretación de prompts en lenguaje natural extenso, en forma de párrafo, en lugar de "tag soup".
- Renderizado de texto dentro de la imagen mediante comillas dobles en el prompt (por ejemplo, `"ON AIR"`).
- Reproducción declarada de anatomía consistente, fidelidad de vestuario, color y textura de piel, y expresiones faciales controlables mediante cláusulas explícitas.
- Cobertura de contenido SFW y NSFW en un único checkpoint, sin sesgo de censura según el autor.
- Compatibilidad con LoRAs de la comunidad entrenados sobre Krea 2 RAW.
- No dispone de tool calling, function calling, razonamiento multi-step, modo thinking, entrada de visión ni audio: es exclusivamente un generador de imágenes.
- No se declaran capacidades multilingües verificadas; los ejemplos y la guía de prompting están en inglés.

## Casos de uso

- **Fotografía sintética de producto y moda:** el modelo declara buena fidelidad de vestuario y color, y su rango de 1K–2K px permite generar catálogos con prendas coherentes. La cláusula de cámara al inicio del prompt ("85mm, shallow depth of field") facilita mantener un lenguaje fotográfico uniforme entre imágenes de una misma campaña.
- **Retratos y avatares con expresión controlada:** al ser la expresión facial el punto débil conocido del base, el flujo recomendado consiste en aislar la expresión en su propia cláusula. Resulta útil para generar variaciones de un mismo personaje con estados emocionales distintos.
- **Prototipado rápido de concept art:** con 8 pasos y CFG 0, cada iteración es barata, lo que permite explorar decenas de variantes de encuadre y luz antes de fijar una dirección artística.
- **Integración en pipelines de ComfyUI:** el checkpoint se carga como un modelo de difusión estándar junto al codificador de texto de Krea 2 y el VAE de Qwen Image, lo que permite encadenarlo con nodos de upscaling, segmentación o control de pose en flujos automatizados por lotes.
- **Rotulación y carteles:** la convención de entrecomillar el texto permite generar piezas con titulares legibles dentro de la imagen, útil para maquetas de cartelería, portadas o material promocional.
- **Investigación sobre censura y sesgos en modelos generativos:** la existencia de un base censurado y este merge del mismo base permite comparar ambos checkpoints con el mismo prompt y aislar el efecto del merge sobre el contenido generado.
- **Personalización con LoRAs propios:** al conservar el flujo train-on-RAW / run-on-Turbo, un equipo puede entrenar un LoRA de estilo o de personaje sobre Krea 2 RAW y aplicarlo después sobre este checkpoint destilado.
- **Contenido para adultos:** el modelo está diseñado explícitamente para ello, pero su uso exige verificación de edad, moderación propia y cumplimiento de la normativa aplicable en la jurisdicción del despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta valoraciones cualitativas del autor (fidelidad de anatomía, ropa y color, expresiones faciales), sin FID, CLIP score, HPSv2 ni comparaciones numéricas frente al base. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada (estimación propia a partir del recuento de parámetros, no confirmada por el autor):** un DiT de 12B en fp16/bf16 ocuparía unos 24 GB; en INT8, unos 12 GB. El repositorio completo pesa 13,5 GB, coherente con un checkpoint de 8 bits. A esa cifra hay que sumar el codificador Qwen3-VL y el VAE, cuyo tamaño no se especifica en la model card y que condicionan la VRAM total.
- **GPU de gama profesional:** A100 40 GB, A100 80 GB y H100 80 GB son adecuadas para inferencia por lotes y para mantener el codificador de texto residente en memoria sin offloading.
- **GPU de consumo:** una RTX 4090 (24 GB) debería acomodar el checkpoint INT8 junto con los componentes auxiliares, con margen ajustado. Tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requerirían descarga parcial a CPU (offloading) del codificador o del DiT.
- **Opciones de despliegue:** ComfyUI (carga como modelo de difusión estándar con el codificador de Krea 2 y el VAE de Qwen Image) y el repositorio oficial de Krea 2, que expone un script de inferencia (`uv run inference.py` con `--checkpoint oss_turbo --steps 8 --cfg 0.0 --mu 1.15`). No se documentan rutas de despliegue para vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo de difusión.
- **Latencia y throughput:** no disponibles. Como referencia estructural, 8 pasos con CFG 0 implican la mitad de evaluaciones de red que un pipeline equivalente con guidance activo, pero no hay cifras publicadas.

## Comparativa con modelos similares

Los datos de las filas comparativas provienen de la documentación pública de cada proyecto y no han podido verificarse en la información proporcionada; se incluyen como orientación.

| Modelo | Parámetros | Codificador de texto | Resolución | Pasos / CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea2_Last_Kiss | 12B (DiT denso) | Qwen3-VL (sin CLIP) | 1024–2048 px | 8 / CFG 0 | other (Krea 2 Community License + LoRAs) | HuggingFace, repo de 13,5 GB, 0 descargas |
| Krea-2-Turbo (base) | 12B (DiT denso) | Qwen3-VL (sin CLIP) | ~1K–2K px | 8 / CFG 0 | Krea 2 Community License | HuggingFace |
| FLUX.1 [dev] | 12B | T5-XXL + CLIP-L | Hasta ~2 MP | 20–50 / guidance destilado | No comercial | HuggingFace, amplia adopción |
| Qwen-Image | 20B (MMDiT) | Qwen2.5-VL | No verificada en esta ficha | No verificado | Apache 2.0 | HuggingFace |

La diferencia principal de Krea2_Last_Kiss frente a sus alternativas no es de arquitectura ni de tamaño, sino de política de contenido y de licencia: es el único de la comparativa que declara explícitamente ausencia de censura, y también el único cuya licencia exige atención específica por la cláusula de filtrado del modelo base. Frente a FLUX.1 [dev] y Qwen-Image, carece de validación comunitaria (0 descargas) y de cualquier benchmark publicado.

## Limitaciones y advertencias

- **Licencia y filtrado de contenido:** la Krea 2 Community License pide a los desplegadores implementar filtrado de contenido o revisión equivalente. El autor reconoce que este merge "relaja deliberadamente esa expectativa", de modo que la responsabilidad sobre el contenido generado recae por completo en quien lo despliega.
- **Contenido para adultos:** el modelo está etiquetado como `not-for-all-audiences` y orientado a NSFW. Cualquier despliegue público requiere verificación de edad, moderación y cumplimiento normativo; no se aportan mecanismos de seguridad integrados.
- **Sin validación externa:** 0 descargas y 0 likes en el momento de la ficha, sin evaluaciones de terceros ni benchmarks. Las afirmaciones de calidad proceden únicamente del autor.
- **Procedencia de los LoRAs:** el autor afirma que solo se fusionaron LoRAs publicados en Civitai y que se respetan sus licencias, pero no enumera identificadores, autores ni URLs, lo que impide auditar la cadena de licencias.
- **Expresión facial:** la propia model card la identifica como punto débil del base; requiere una cláusula explícita independiente para obtener resultados fiables.
- **Sensibilidad al prompt:** dos acciones o dos descripciones de luz contradictorias en el mismo prompt degradan la salida. Los pesos por término por encima de ~3.0 degradan el renderizado, y etiquetas vacías (`masterpiece`, `8k`, `best quality`) no tienen efecto.
- **Idioma:** no se declara lista de idiomas soportados y la guía de prompting está redactada íntegramente en inglés; el rendimiento con prompts en castellano no está documentado.
- **Artefactos:** al ser un modelo de difusión, persisten riesgos de anatomía incorrecta en poses complejas, manos y texto renderizado con errores tipográficos.
- **Sin datos de sesgo:** no se ha publicado ninguna evaluación de sesgos demográficos, de representación ni de sesgos de estilo.
- **Metadatos de fecha:** las fechas de creación y actualización del repositorio (2026-10-19) figuran tal cual en la información de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wind11/Krea2_Last_Kiss
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia del base (Krea 2 Community License): referenciada en la model card del modelo base, https://huggingface.co/krea/Krea-2-Turbo
- Civitai (origen de los LoRAs fusionados; el autor no enumera enlaces individuales): https://civitai.com
- ComfyUI (mencionado en la model card para la carga del checkpoint, sin enlace explícito): https://github.com/comfyanonymous/ComfyUI
- Búsqueda web: los resultados disponibles no guardan relación con este modelo (contenido sobre felicitaciones de cumpleaños en francés), por lo que no se han incorporado enlaces adicionales.
