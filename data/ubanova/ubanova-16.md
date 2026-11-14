# ubanova/UbaNova-16

## Resumen

UbaNova-16 es un modelo generativo de texto a imagen especializado en sprites de pixel art de 16×16 píxeles, desarrollado por Muhammad Fahril Irkham (ubanova). Se trata de un transformer autoregresivo decoder-only de 42,44 millones de parámetros entrenables que genera la imagen píxel a píxel en orden ráster, prediciendo cada uno de los 256 píxeles como una de 4.097 clases (4.096 colores de paleta más transparencia). El modelo parte de una codificación de texto congelada de CLIP ViT-B/32 (32 estados de token) y dibuja sprites con colores exactos de paleta y fondo realmente transparente, sin desenfoque ni postprocesado.

El modelo resuelve un problema muy concreto en el flujo de trabajo de desarrollo de videojuegos: la generación rápida de assets de pixel art coherentes y utilizables directamente, sin necesidad de limpieza manual. Frente a los modelos de difusión de propósito general, que producen imágenes de alta resolución pero con artefactos y colores fuera de paleta, UbaNova-16 garantiza por construcción que cada píxel pertenece a una paleta fija y que el fondo es transparente, lo que lo hace directamente integrable en pipelines de assets.

Es relevante por su eficiencia extrema: 42,44M de parámetros, pesos de 85 MB en FP16, entrenamiento de unas 8 horas en una única NVIDIA T4 y latencia de aproximadamente 0,05 s por sprite en GPU en lotes con caché key-value. Su licencia Apache 2.0 y su naturaleza totalmente abierta (código de entrenamiento, inferencia y UI web en GitHub) lo convierten en una base práctica para experimentación e integración en herramientas de creación de juegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo con pre-LayerNorm |
| Parametros totales | 42,44M entrenables (el codificador de texto CLIP ViT-B/32 está congelado y no se cuenta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 289 tokens (32 de texto + BOS + 256 píxeles) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en FP16; inferencia en FP16 autocast en GPU y FP32 en CPU) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict FP16 cargable con `torch.load(..., weights_only=True)`); paleta en `palette.npy` |
| Ancho / capas / cabezas | 512 / 12 / 8 |
| Resolucion de salida | 16×16 píxeles RGBA |
| Clases de salida | 4.097 (4.096 colores de paleta + transparencia) |
| Codificador de texto | `openai/clip-vit-base-patch32` congelado (32 estados de token) |
| Dataset de entrenamiento | Angais/pixel-art-atlas-1.4m (1,41M sprites) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

UbaNova-16 es un transformer decoder-only con pre-LayerNorm de 12 capas, anchura 512 y 8 cabezas de atención. La secuencia de entrada tiene la forma `[estados de texto | BOS | píxel 1 … píxel 256]`, donde los 32 estados de texto provienen del codificador de texto congelado de CLIP ViT-B/32. El modelo predice cada píxel condicionado a los anteriores en orden ráster, tratando la generación como un problema de modelado de lenguaje sobre un vocabulario de 4.097 clases (colores de paleta más transparencia). En inferencia se aplica classifier-free guidance (con un 10% de dropout de caption durante el entrenamiento) y muestreo de núcleo (nucleus sampling) con top-p 0,9 por defecto.

El entrenamiento se realizó sobre el dataset Angais/pixel-art-atlas-1.4m (1,41M sprites) durante 3 épocas, 32.934 pasos, con batch de 128, optimizador AdamW, learning rate 3e-4 con decaimiento coseno y precisión FP16, todo en una única NVIDIA T4 durante aproximadamente 8 horas. La pérdida en datos retenidos es de 1,091 nats/píxel frente a 1,059 en entrenamiento, lo que indica que el modelo no está sobreajustado. Ninguno de los 256 sprites generados en la evaluación copia un sprite de entrenamiento.

## Capacidades

- Generación de texto a imagen de sprites de pixel art de 16×16 píxeles a partir de prompts en inglés.
- Generación píxel a píxel autoregresiva con colores exactos de paleta (4.096 colores) y fondo transparente real (canal alfa).
- Control de fidelidad al prompt mediante classifier-free guidance (`--cfg`, por defecto 3,0).
- Control de diversidad y reproducibilidad mediante temperatura (`--temperature`, por defecto 1,0), top-p (`--top-p`, por defecto 0,9) y semilla (`--seed`).
- Generación de múltiples sprites por prompt (`--n`, por defecto 4).
- Buen seguimiento de términos de color: rojo, naranja, verde, cian, azul y púrpura alcanzan entre el 87% y el 97% de acierto en prompts del tipo «{color} {objeto}».
- Escalado nearest-neighbor de la salida para visualización (`--scale`, por defecto 8).
- Ejecución automática en GPU (CUDA, FP16 autocast) o CPU (FP32).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es exclusivamente un generador de imágenes.

## Casos de uso

- Generación rápida de assets para prototipos de videojuegos: un desarrollador puede introducir prompts como «iron sword» o «red potion» y obtener en menos de dos segundos un lote de cuatro sprites listos para usar, con transparencia y paleta correctas, acelerando la iteración en las primeras fases de diseño.
- Creación de conjuntos de iconos coherentes: al compartir una paleta fija de 4.096 colores, los sprites generados para una misma categoría (pociones, armas, gemas) mantienen una estética uniforme sin trabajo de armonización posterior.
- Poblar tiendas o inventarios de juegos: la generación por lotes con semilla fija permite crear catálogos reproducibles de objetos (coronas, escudos, micrófonos) para menús e interfaces de inventario.
- Herramientas de autoría integradas en editores: el modelo puede incrustarse en una UI web local (incluida en el repositorio de GitHub) para que artistas y diseñadores generen borradores de sprites y los retoquen manualmente a 16×16, un tamaño manejable para edición píxel a píxel.
- Generación de variantes controladas por color: útil para crear familias de objetos con variantes cromáticas (por ejemplo, pociones rojas, verdes y azules) aprovechando el buen seguimiento de términos de color del modelo.
- Experimentación e investigación en modelos generativos pequeños: con 42,44M de parámetros, entrenamiento reproducible en una T4 y código completo disponible, sirve como banco de pruebas para estudiar generación autoregresiva de imágenes, classifier-free guidance y muestreo sobre vocabularios discretos.
- Despliegue en entornos con recursos limitados: al ocupar 85 MB en FP16 y ejecutarse en CPU a unos 6 s por sprite en un portátil de 4 hilos, puede integrarse en herramientas de escritorio o servicios ligeros sin GPU.

## Benchmarks y rendimiento

Evaluación sobre 256 captions retenidos, puntuada con CLIP ViT-B/32 (sprites renderizados sobre gris y escalados a 224 px):

| Muestreador | CLIP score | Recuperación de caption R@1 | Colores por sprite | Píxeles sueltos por 1000 |
|---|---|---|---|---|
| Sprites reales (referencia) | 25,68 | 24,2% | 23,6 | 0,57 |
| Guidance 3, temperatura 1,0 | 25,02 | 16,4% | 33,6 | 0,70 |
| Guidance 3, temperatura 1,0, top-p 0,9 (por defecto) | 25,74 | 21,5% | 22,8 | 0,50 |

Datos adicionales de rendimiento:

| Metrica | Valor |
|---|---|
| Pérdida en datos retenidos | 1,091 nats/píxel |
| Pérdida en datos de entrenamiento | 1,059 nats/píxel |
| Acierto en prompts de color | 87–97% (rojo, naranja, verde, cian, azul, púrpura) |
| Latencia por sprite en NVIDIA T4 (lotes, caché KV) | ~0,05 s |
| Latencia por petición de 4 sprites en T4 | ~1,7 s |
| Latencia por sprite en CPU de 4 hilos | ~6 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de generación de imágenes de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 85 MB en FP16, por lo que cualquier GPU con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: NVIDIA T4 (probada en Kaggle), así como cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o superior; el modelo no requiere hardware de gama alta.
- Cabe holgadamente en GPU consumer: sí, en cualquier GPU con soporte CUDA, e incluso en CPU.
- Ejecución en CPU: viable, con FP32 y aproximadamente 6 s por sprite en un procesador de 4 hilos.
- Opciones de despliegue: script CLI `generate.py`, API de Python mediante `infer.SpriteGenerator`, y UI web local incluida en el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de imagen con pesos en `model.pt` y arquitectura propia.
- Latencia y throughput: ~0,05 s por sprite en T4 en lotes con caché key-value; ~1,7 s para una petición de 4 sprites; ~6 s por sprite en CPU de 4 hilos.
- Requisitos de software: Python 3.9+, torch (probado con 2.15.0), transformers 5.22.2, huggingface_hub 2.4.0, numpy 2.5.4 y pillow 13.0.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UbaNova-16 | 42,44M | 289 tokens; salida 16×16 | Transformer autoregresivo píxel a píxel con paleta fija | Apache 2.0 | Hugging Face y GitHub |
| Stable Diffusion (modelos de difusión de propósito general) | Cientos de millones a miles de millones | Salida de alta resolución (512 px o más) | Difusión latente texto a imagen | Varía según versión | Hugging Face |
| Pixel art con modelos de difusión especializados | No disponible | No disponible | Difusión con ajuste fino para pixel art | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos directos con alternativas especializadas en pixel art en la información proporcionada. La comparación con modelos de difusión de propósito general es cualitativa: UbaNova-16 garantiza colores exactos de paleta y transparencia real por construcción, pero está limitado a 16×16 y a un vocabulario visual mucho más restringido, mientras que los modelos de difusión ofrecen mayor resolución y variedad a costa de posibles artefactos y colores fuera de paleta.

## Limitaciones y advertencias

- Las relaciones entre objetos a menudo se ignoran: «a cat wearing a wizard hat» produce un gato con una corona, no con un sombrero de mago.
- Los objetos diagonales finos y los efectos (látigos, fuego) pueden salir desordenados o con formas imprecisas.
- La salida está limitada exclusivamente a 16×16 píxeles; no hay soporte para otras resoluciones.
- Solo admite prompts en inglés.
- Puede generar píxeles sueltos o fuera de lugar, aunque el muestreo top-p 0,9 por defecto los reduce (0,50 por 1000 frente a 0,70 sin top-p).
- Temperaturas más bajas producen sombreado plano; un guidance más alto recorta objetos en el borde del lienzo.
- Riesgo de alucinación visual: el modelo puede inventar detalles no solicitados o malinterpretar prompts ambiguos, como muestran los ejemplos de relaciones entre objetos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre un dataset de pixel art de 1,41M de sprites, puede heredar los sesgos de estilo y temática de dicho dataset.
- Restricciones de licencia: el código y los pesos son Apache 2.0, lo que permite uso comercial; los datos de entrenamiento (Pixel Art Atlas) se publican bajo CC0-1.0, aunque la model card indica que su imagen (texto truncado en la información disponible) requiere revisión adicional antes de un uso comercial a gran escala.
- Para producción: conviene fijar semilla para reproducibilidad, validar la salida en el pipeline de assets y no asumir fidelidad en prompts con relaciones espaciales complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ubanova/UbaNova-16
- Repositorio GitHub (entrenamiento, UI web, evaluación): https://github.com/irhamuba/ubanova-16
- Perfil de GitHub del autor: https://github.com/irhamuba
- Perfil de Hugging Face del autor: https://huggingface.co/ubanova
- Perfil de X del autor: https://x.com/UbaNova
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-base-patch32
