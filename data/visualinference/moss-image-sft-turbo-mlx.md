# VisualInference/MOSS-Image-SFT-Turbo-MLX

## Resumen

MOSS-Image-SFT-Turbo-MLX es un adaptador LoRA de destilación para inferencia few-step del modelo de texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, empaquetado específicamente para Apple Silicon mediante MLX. Lo desarrolla el usuario VisualInference y resuelve un problema muy concreto: el muestreador oficial de MOSS-Image necesita 100 pasadas de red (50 pasos con CFG 3), lo que en un M4 Pro supone unos 743 segundos por imagen de ~1 MP. Este adaptador reduce el coste a 15 pasadas de red y unos 119 segundos, es decir, una aceleración de 6,2× manteniendo la fidelidad respecto al modelo completo para la misma semilla.

No es un modelo completo, sino un estudiante de rango 64 (252 proyecciones, fp32, 595 MB) entrenado por regresión sobre la trayectoria del sampler original. Se apoya en el transformer DiT de 5B parámetros de MOSS-Image, que combina un codificador de texto Qwen3.5 9B con el VAE de FLUX.2 y admite prompts de hasta 4K tokens en lenguaje natural, etiquetas estilo booru o layouts JSON. El adaptador se distribuye con licencia Apache 2.0 y funciona con el paquete `moss-image-mlx` (versión 0.2.0 o superior).

Su relevancia ahora es doble: por un lado, hace viable la generación de imágenes de ~1 MP con texto legible en hardware de consumo Apple (a partir de 24 GB de memoria unificada); por otro, documenta una técnica de destilación parcial que evita el "estampado" de texturas repetidas que sufren los adaptadores DMD turbo, un fallo habitual en la destilación few-step de modelos DiT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 64 sobre el transformer DiT del modelo base MOSS-Image (5B parámetros); sampler híbrido estudiante + pasos guiados del modelo original |
| Parametros totales | Adaptador: 595 MB en fp32 sobre 252 proyecciones (recuento exacto de parámetros no disponible). Modelo base: 5B parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Prompt de hasta 4K tokens en el modelo base (lenguaje natural, tags o layout JSON). El adaptador no modifica el codificador de texto |
| Tipos de cuantizacion | El adaptador se distribuye en fp32; los pesos base se usan en tier 8-bit (por defecto) o tier "compact" (cuantización no especificada) |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors / MLX (repo etiquetado con `Safetensors`, librería `mlx`) |

## Arquitectura y entrenamiento

El sampler no ejecuta una destilación completa de la trayectoria, sino un reparto en tres tramos. Primero, un estudiante de 6 pasos sin CFG cubre la parte de composición de la trayectoria de 50 pasos del modelo original (σ 1 → 0,671); se entrenó por regresión pura sobre esa trayectoria, sin coincidencia de distribuciones, con datos de profesor generados a partir de unos 2.000 prompts a ~1 MP en 9 relaciones de aspecto (texto en inglés y chino, layouts JSON, personas, productos, lugares y materiales). Los objetivos se recalculan sobre los estados derivados del propio estudiante: el profesor se vuelve a ejecutar desde donde el estudiante está realmente. En una ablación controlada, los objetivos que se reajustaban a la ruta almacenada producían caras fantasma y caracteres chinos corruptos; los objetivos recalculados no.

Segundo, un único paso guiado del modelo original sustituye el tercer paso del estudiante (slot 2, σ 0,957 → 0,919). El autor probó ese paso en cada una de las 6 posiciones y solo en esa reparaba tanto un titular de cartel con fantasma como el título de una infografía. Tercero, el modelo original remata con 4 evaluaciones DPM-Solver++(2M) (σ 0,671 → 0), lo que desde un estado exacto de mitad de trayectoria queda 4,6× más cerca de la imagen de 50 pasos que un remate destilado. El total son 5 pasadas del estudiante + 2 guiadas + 8 de remate = 15. Además, se aplica en todo el proceso el LoRA destripe de nynxz con escala 1,5, y los datos de entrenamiento del profesor también se destriparon.

El entrenamiento del estudiante se realizó sobre A100 alquiladas con un coste aproximado de 37 dólares, lo que da una idea del reducido presupuesto experimental. La decisión de no destilar la trayectoria completa está justificada por evidencia empírica: estados cacheados exactos de 50 pasos rematados por un adaptador DMD siguen produciendo estampado de textura, y cuanto más destilados son los pasos en el centro de la trayectoria, más estampado aparece. Por eso la red destilada se mantiene fuera de la banda donde se organiza la textura.

## Capacidades

- Generación de imágenes texto-a-imagen a ~1 MP en 9 relaciones de aspecto, desde 768×1360 hasta 1360×768, pasando por 1024×1024.
- Renderizado de texto en imagen con calidad cercana al modelo completo: recall de caracteres por OCR de 0,947 en inglés (n = 4) frente a 0,934 del modelo de 50 pasos.
- Generación de layouts estructurados mediante prompts JSON, heredada del modelo base.
- Prompts largos de hasta 4K tokens en lenguaje natural o etiquetas estilo booru.
- Soporte bilingüe inglés-chino, incluyendo rótulos y envoltorios de producto en chino.
- Muestreo controlado por semilla, con reproducción bit a bit de las imágenes del estudio de investigación.
- Procesado por lotes: `--seeds 1,2,3` renderiza varias semillas con una sola carga del modelo y `--batch jobs.jsonl` procesa muchos prompts.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un pipeline de texto-a-imagen, no un modelo de lenguaje.

## Casos de uso

- Prototipado de arte conceptual en un MacBook: un estudio pequeño puede generar imágenes de ~1 MP en unos dos minutos por unidad sin GPU dedicada, gracias a las 15 pasadas de red y a los 9,4 GB de pico de memoria medidos en el tier 8-bit.
- Carteles y rótulos con texto legible: el recall OCR de 0,947 en inglés permite iterar titulares, señales LED o portadas manteniendo la tipografía reconocible, que es precisamente donde fallan otros turbos few-step.
- Exploración de variantes por semilla: con `--seeds 1,2,3` se comparan varias salidas del mismo prompt con una única carga del modelo, útil para selección de dirección de arte en sesiones de brainstorming.
- Generación por lotes para catálogos y e-commerce: `--batch jobs.jsonl` permite lanzar cientos de prompts (productos, materiales, localizaciones) de forma desatendida durante la noche en una máquina de escritorio Apple.
- Ilustración editorial con texto en chino e inglés: el soporte bilingüe y los prompts JSON de layout encajan con portadas, envoltorios y material promocional que requieren composición tipográfica controlada.
- Investigación en destilación few-step: el repositorio de investigación y la documentación de ablaciones permiten reproducir el experimento, comparar objetivos de entrenamiento y medir el fenómeno de estampado de textura con DINOv2.
- Integración en herramientas de diseño locales: al ser un adaptador de 595 MB sobre el tier 8-bit, se puede empaquetar dentro de una aplicación de escritorio macOS con pesos cacheados en disco, sin depender de servicios en la nube.
- Evaluación de modelos DiT en hardware Apple: sirve como banco de pruebas para medir latencia, memoria y fidelidad de samplers alternativos sobre MLX antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes. Sí se publican métricas comparativas propias sobre 32 prompts retenidos, cada uno en su relación de aspecto y con semilla 101, frente al sampler oficial destripado (50 pasos, CFG 3, skip de bloque 22):

| Metrica | Este turbo | Turbo con adaptador DMD | Modelo completo, 50 pasos |
|---|---|---|---|
| Pasadas de red | 15 | 10 | 100 |
| Tiempo por imagen de ~1 MP (M4 Pro, 8-bit) | ~119 s | ~80 s | ~743 s |
| Memoria pico | 9,4 GB | 9,3 GB | 9,3 GB |
| Textura estampada (repetición DINOv2, exceso sobre el modelo completo; materiales + naturaleza, n = 8) | −0,006 | +0,063 | 0 |
| Detalle fino (energía de alta frecuencia frente al modelo completo) | −0,004 | −0,022 | 0 |
| Diferencia media de luma absoluta frente a la imagen del modelo completo | 0,090 | 0,124 | 0 |
| Diferencia de brillo | +0,011 | −0,049 | 0 |
| Recall de caracteres OCR en inglés (n = 4) | 0,947 | 0,951 | 0,934 |

Métrica adicional de la sección de limitaciones: en 8 prompts, el recall OCR es de 0,957 para el turbo frente a 0,970 del modelo completo, lo que confirma que el texto pequeño y denso se degrada ligeramente.

## Requisitos de hardware

- VRAM/memoria: 9,4 GB de pico medidos con el tier 8-bit a ~1 MP. El paquete selecciona el tier 8-bit por defecto en Macs con 24 GB o más de memoria unificada.
- GPU: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No hay soporte CUDA ni ROCm en este repositorio.
- Cabe en GPU de consumo: sí, en cualquier Mac Apple Silicon con al menos 24 GB de memoria unificada para el tier 8-bit; existe un tier "compact" para configuraciones más ajustadas, aunque no se publican sus requisitos exactos.
- Despliegue: paquete `moss-image-mlx` (pip, versión 0.2.0 o superior) con CLI `moss-mlx ... --turbo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión.
- Latencia: ~119 s por imagen de ~1 MP en un M4 Pro con 15 pasadas; el modelo completo tarda ~743 s y el turbo con adaptador DMD ~80 s en el mismo hardware.
- Throughput: aproximadamente 30 imágenes por hora en un M4 Pro (derivado de 119 s por imagen); no se publican cifras para otras variantes de chip.
- Primer arranque: descarga el tier 8-bit de MOSS-Image, el estudiante (fijado a una revisión concreta) y el adaptador destripe, y los cachea en disco.
- Los parámetros `--steps` y `--shift` se ignoran en modo turbo; `--turbo-weights FILE` permite usar una copia local del estudiante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Pasadas / tiempo (M4 Pro, ~1 MP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-Turbo-MLX (este) | Adaptador de 595 MB sobre DiT de 5B | Hasta 4K tokens (heredado del base) | 15 pasadas / ~119 s | Apache 2.0 | Hugging Face, MLX |
| MOSS-Image-SFT (modelo completo, sampler oficial) | DiT de 5B | Hasta 4K tokens | 100 pasadas / ~743 s | Apache 2.0 | Hugging Face |
| Turbo con adaptador DMD de la comunidad | Adaptador DMD sobre DiT de 5B | Hasta 4K tokens | 10 pasadas / ~80 s | No disponible en la información | Comunidad |
| Moss Image Turbo (Civitai, v1.0) | Checkpoint sobre MOSS Image | Hasta 4K tokens | 8 pasos con CFG 1; tiempo no disponible | No disponible en la información | Civitai |
| MOSS-Image-SFT-MLX-8bit | DiT de 5B cuantizado a 8 bits | Hasta 4K tokens | Sampler oficial; tiempo no disponible | Apache 2.0 | Hugging Face, MLX |

Frente al turbo DMD, este adaptador es un 49% más lento (119 s frente a 80 s) pero elimina el estampado de textura (−0,006 frente a +0,063) y se acerca más a la imagen del modelo completo en luma (0,090 frente a 0,124). Frente al modelo completo, sacrifica un 2,4% de detalle fino medido y gana 6,2× en tiempo. El turbo de Civitai declara 8 pasos con CFG 1, pero no publica métricas comparables de fidelidad ni de latencia, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Texto pequeño y denso: se degrada más que el modelo completo (recall OCR de 0,957 frente a 0,970 en 8 prompts), por lo que no es adecuado para tipografías de cuerpo pequeño o infografías densas.
- Geometría regular: la model card original advierte de problemas con geometría regular, aunque el texto proporcionado está truncado y no se detalla el alcance exacto de la limitación.
- Plataforma única: requiere Apple Silicon y MLX; no hay ruta de despliegue en CUDA, ROCm ni TPU en este repositorio.
- Muestreo fijo: en modo turbo se ignoran `--steps` y `--shift`, de modo que no se puede ajustar el número de pasos ni el desplazamiento de la programación sigma.
- Idiomas: solo inglés y chino; no se declara soporte de castellano ni de otras lenguas, y el comportamiento con prompts en español no está documentado.
- Datos de entrenamiento acotados: unos 2.000 prompts en 9 relaciones de aspecto, lo que limita la cobertura de dominios poco representados (texturas médicas, maquinaria especializada, alfabetos no latinos ni chinos).
- Evaluación con muestra pequeña: 32 prompts retenidos y una sola semilla (101), con subconjuntos de n = 4 y n = 8 para OCR y textura. Los intervalos de confianza no se publican.
- Dependencia de terceros: el pipeline aplica el LoRA destripe de nynxz con escala 1,5, cuya licencia y condiciones de uso no se detallan en la información disponible; conviene verificarlas antes de un uso comercial.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial queda sujeto también a la licencia y condiciones del modelo base MOSS-Image-SFT y del codificador de texto Qwen3.5 9B.
- Madurez del ecosistema: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación de texto: como todo modelo de difusión con renderizado tipográfico, puede generar cadenas de caracteres inexistentes o mal formadas, especialmente en pasadas de texto largo.
- Sesgos: no se publica ninguna evaluación de sesgos demográficos, culturales o de representación, algo relevante porque el modelo genera personas y productos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VisualInference/MOSS-Image-SFT-Turbo-MLX
- Tier 8-bit: https://huggingface.co/VisualInference/MOSS-Image-SFT-MLX-8bit
- Tier compact: https://huggingface.co/VisualInference/MOSS-Image-SFT-MLX-compact
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Código de inferencia (moss-image-mlx): https://github.com/felix-ab/moss-image-mlx
- Documento técnico de diseño y medición: https://github.com/felix-ab/moss-image-turbo-research/blob/main/docs/technical-writeup.md
- Metodología de las métricas: https://github.com/felix-ab/moss-image-turbo-research/blob/main/docs/how-the-numbers-work.md
- Repositorio de investigación: https://github.com/felix-ab/moss-image-turbo-research
- LoRA destripe de nynxz: https://huggingface.co/nynxz/MOSS-Image
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Checkpoint MOSS Image SFT en Civitai: https://civitai.com/models/3005406/moss-image
- Checkpoint Moss Image Turbo en Civitai: https://civitai.com/models/3010147/moss-image-turbo
