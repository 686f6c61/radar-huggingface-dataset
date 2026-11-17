# ubanova/UbaNova-32

## Resumen

UbaNova-32 es un modelo generativo de texto a imagen especializado en sprites de pixel art de 32×32 píxeles para videojuegos. Lo desarrolla Muhammad Fahril Irkham (ubanova) y es la evolución del anterior UbaNova-16, del que hereda los pesos como inicialización. A diferencia de los modelos de difusión habituales, se trata de un transformer autorregresivo pequeño (42,84 M de parámetros entrenables) que dibuja el sprite píxel a píxel en orden ráster, prediciendo cada píxel como una de 4.097 clases (4.096 colores de paleta más transparencia).

El modelo resuelve un problema muy concreto: generar assets de pixel art limpios, sin desenfoque ni artefactos, con colores exactos de paleta y fondo realmente transparente, algo que los modelos de difusión generalistas no consiguen de forma fiable. Su tamaño reducido (pesos FP16 de 86 MB) permite inferencia en CPU y en GPU de consumo, con un rendimiento de aproximadamente 0,8 s por sprite en una NVIDIA T4.

Es relevante ahora porque ofrece una alternativa determinista y controlable (guía sin clasificador, temperatura, top-p, control de tamaño, relleno y detalle) para pipelines de generación de assets en desarrollo de videojuegos, con licencia Apache 2.0 y una evaluación cuantitativa publicada frente a sprites reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo, pre-LayerNorm |
| Parámetros totales | 42,84 M entrenables (encoder de texto CLIP congelado, no contabilizado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens de texto + 2 tokens de condición + BOS + 1.024 píxeles |
| Tipos de cuantización | no disponible (pesos distribuidos en FP16; inferencia en FP16 con autocast en GPU y FP32 en CPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, `model32_v11.pt`, 86 MB) más `palette.npy` |
| Ancho / capas / cabezas | 512 / 12 / 8 |
| Resolución de salida | 32×32 nativa (modo 16×16 disponible) |
| Encoder de texto | `openai/clip-vit-base-patch32` congelado (32 estados de token) |
| Modelo base | ubanova/UbaNova-16 (fine-tune) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con pre-LayerNorm, anchura 512, 12 capas y 8 cabezas de atención. La secuencia de entrada combina 32 estados de token del encoder de texto CLIP ViT-B/32 congelado, dos tokens de condición (tamaño nativo 32×32 o aspecto 16×16, y fondo transparente o relleno) y un token BOS, seguidos de los 1.024 píxeles que el modelo genera en orden ráster. En la versión 1.1 se añadieron dos tokens de condición adicionales: relleno (tamaño del objeto en el lienzo) y detalle (número de colores/sombreado), cada uno con opción "any". Cada píxel se predice sobre 4.097 clases: 4.096 colores de paleta más transparencia.

El entrenamiento partió de los pesos de UbaNova-16. La versión 1 se entrenó durante 3 épocas (20.973 pasos) con batch 32, AdamW, learning rate 2e-4 con decaimiento coseno y FP16, en una única NVIDIA T4. La versión 1.1 añadió 1 época más (6.991 pasos, learning rate 5e-5) incorporando los controles de relleno y detalle. Los datos son 155.000 sprites de 32×32 de `azyg0s/pixelart-172k` y 500 de `moss-pixelart-64`, mezclados con sprites de 16×16 de Pixel Art Atlas y Krea-2 synthetic reescalados 2× para el modo 16×16. Se aplicó un 10 % de dropout de caption para permitir guía sin clasificador en inferencia, y se emplean muestreo de núcleo (top-p) y caché de clave-valor.

## Capacidades

- Generación de texto a imagen de sprites de pixel art de 32×32 píxeles a partir de prompts en inglés.
- Generación píxel a píxel autorregresiva con colores exactos de paleta y sin desenfoque.
- Fondo transparente real por defecto; opción de fondo relleno con un color nombrado en el prompt.
- Control de tamaño del objeto en el lienzo mediante el parámetro `fill` (auto, any, low, mid, high).
- Control de número de colores y sombreado mediante el parámetro `detail` (auto, any, low, mid, high).
- Modo 16×16 con aspecto "chunky" (bloques de 2×2 de un solo color en el 99,7 % de los casos).
- Guía sin clasificador configurable (`cfg`, por defecto 2.0), temperatura y top-p (por defecto 0.9).
- Semilla fija para reproducibilidad.
- Escalado nearest-neighbor de la PNG guardada (por defecto 8×).
- Soporte de ejecución en CPU (FP32) y GPU CUDA (FP16 con autocast).
- No dispone de tool calling, capacidades de agente, visión de entrada, audio ni razonamiento multi-paso.

## Casos de uso

- Generación de assets para videojuegos indie: el modelo produce sprites de 32×32 con fondo transparente listos para importar en motores como Godot o Unity, sin post-procesado ni eliminación de fondo, gracias a que el canal alfa es nativo.
- Prototipado rápido de iconos de inventario: con prompts como "red potion" o "iron sword" y `--n 4` se obtienen varias variantes por prompt en menos de un segundo por sprite en GPU, lo que permite iterar sobre el diseño de objetos de juego.
- Generación de tilesets y decorados: el control `--bg` con un color nombrado en el prompt permite generar sprites sobre fondos uniformes para integrarlos en escenas concretas.
- Creación de variantes estilizadas: el modo `--size 16` produce sprites con estética de 16×16 a partir del mismo modelo, útil para juegos con resolución baja o para generar versiones alternativas de un mismo asset.
- Ajuste fino de estilo por lotes: los controles `--detail` y `--fill` permiten fijar el número de colores y el tamaño del objeto para mantener coherencia visual en una colección completa de sprites.
- Generación reproducible en pipelines automatizados: con `--seed` fija y ejecución en CPU, el modelo puede integrarse en scripts de build que generen assets deterministas sin depender de GPU.
- Exploración conceptual en talleres o docencia: el tamaño reducido y la inferencia en CPU permiten ejecutar el modelo en portátiles para demostrar generación autorregresiva de imágenes.

## Benchmarks y rendimiento

Evaluación sobre 256 captions reservadas, puntuadas con CLIP ViT-B/32 (sprites renderizados sobre gris y reescalados a 224 px):

| Modelo | CLIP score | R@1 | R@5 | Colores / sprite | Píxeles sueltos / 1000 | Toca el borde |
|---|---|---|---|---|---|---|
| Sprites reales (referencia) | 29,07 | 57,4 % | 79,7 % | 22,1 | 0,04 | 0,04 % |
| UbaNova-16 (reescalado) | 26,75 | 29,3 % | 54,3 % | 15,9 | 0,35 | 24,6 % |
| UbaNova-32 v1.1 (por defecto) | 28,87 | 50,0 % | 77,0 % | 14,9 | 0,06 | 0,9 % |

- Pérdida en datos reservados: 0,446 nats/píxel (0,64 bits/píxel); precisión de siguiente píxel del 89 %.
- Ninguno de los 256 sprites generados copia un sprite de entrenamiento; los generados están más lejos del conjunto de entrenamiento que los sprites reales reservados.
- Control de fondo: con `--bg` y un color nombrado, el 100 % de los sprites obtiene un fondo uniforme de ese color; sin `--bg` el borde es siempre transparente.
- Modo 16×16: el 99,7 % de los bloques de 2×2 son de un solo color.
- Prompts libres: CLIP score 30,2 y R@1 87,5 %.
- Velocidad: aproximadamente 0,8 s por sprite en una NVIDIA T4 con caché de clave-valor y guía activada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos FP16 ocupan 86 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo (incluso menos de 1 GB de VRAM en la práctica).
- GPU recomendadas: NVIDIA T4 (referencia de velocidad del autor, ~0,8 s por sprite), así como cualquier GPU CUDA moderna (RTX 3060, RTX 4090, A100, H100) sin requisitos especiales.
- Cabe en GPU de consumo: sí, en cualquier GPU con CUDA; también funciona en CPU en FP32.
- Opciones de despliegue: script `generate.py` del repositorio de GitHub y clase Python `SpriteGenerator32` del módulo `infer32`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (el formato de pesos es PyTorch `.pt`, no GGUF).
- Latencia y throughput: ~0,8 s por sprite en NVIDIA T4; en CPU la latencia no está publicada, pero el tamaño del modelo permite ejecución interactiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UbaNova-32 | Transformer autorregresivo texto a sprite | 42,84 M | 32 tokens de texto, 32×32 px | Apache 2.0 | Hugging Face y GitHub |
| UbaNova-16 | Transformer autorregresivo texto a sprite | no disponible | 16×16 px | no disponible | GitHub y Hugging Face |
| Modelos de difusión generalistas (p. ej. Stable Diffusion) | Difusión texto a imagen | cientos de millones a miles de millones | resolución variable | variable | amplia |

Frente a UbaNova-16, el predecesor directo, UbaNova-32 mejora el CLIP score de 26,75 a 28,87, el R@1 de 29,3 % a 50,0 % y reduce drásticamente los sprites que tocan el borde (de 24,6 % a 0,9 %) y los píxeles sueltos (de 0,35 a 0,06 por 1000). Frente a modelos de difusión generalistas, la comparación directa no está publicada en la información disponible; la ventaja estructural de UbaNova-32 es la salida exacta de paleta con transparencia nativa y su huella de hardware mínima.

## Limitaciones y advertencias

- Solo admite prompts en inglés; no hay soporte multilingüe declarado.
- La resolución está fijada a 32×32 píxeles nativos (o 16×16 en modo alternativo); no genera imágenes de mayor tamaño.
- El vocabulario visual está restringido a sprites de pixel art; no es un modelo de imagen generalista.
- Riesgo de alucinación visual: el modelo puede generar objetos que no se correspondan con el prompt, aunque la evaluación reporta un R@1 del 50 % en captions reservadas y del 87,5 % en prompts libres.
- El conjunto de entrenamiento mezcla datasets de terceros (`azyg0s/pixelart-172k`, `ProbablyHumanAB/moss-pixelart-64`, `Angais/pixel-art-atlas-1.4m`, `Angais/krea-2-pixelart-16x16-synthetic`); no se detallan en la información disponible las licencias de esos datasets ni posibles sesgos heredados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.
- No se publican datos de cuantización (GGUF, etc.) ni integración con servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ubanova/UbaNova-32
- Repositorio GitHub de UbaNova-32: https://github.com/irhamuba/ubanova-32
- Repositorio GitHub de UbaNova-16: https://github.com/irhamuba/ubanova-16
- Perfil de GitHub del autor: https://github.com/irhamuba
- Perfil de Hugging Face del autor: https://huggingface.co/ubanova
- Perfil de X del autor: https://x.com/UbaNova
- Dataset azyg0s/pixelart-172k: https://huggingface.co/datasets/azyg0s/pixelart-172k
- Dataset ProbablyHumanAB/moss-pixelart-64: https://huggingface.co/datasets/ProbablyHumanAB/moss-pixelart-64
- Dataset Angais/pixel-art-atlas-1.4m: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Dataset Angais/krea-2-pixelart-16x16-synthetic: https://huggingface.co/datasets/Angais/krea-2-pixelart-16x16-synthetic
- Encoder de texto CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
