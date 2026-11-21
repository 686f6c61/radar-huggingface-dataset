# t8star/Minimax-H3-Image-Exp-Comfy

## Resumen

MiniMax-H3-Image-Exp-Comfy es un repositorio de investigación de terceros publicado por el usuario t8star sobre el modelo base MiniMaxAI/MiniMax-H3-Image. No se trata de una versión oficial de MiniMax ni de un modelo nuevo entrenado desde cero, sino de un paquete que combina una conversión completa a formato ComfyUI del backbone de difusión en BF16/FP32 (66,29 GB), un LoRA experimental de corrección de materiales (172,07 MB) y un nodo personalizado de "cabeza única" (single head) que permite experimentar con rutas de muestreo multi-paso. El objetivo declarado es mitigar artefactos de textura rígida que aparecen cuando se usa el backbone completo con 50 pasos y CFG 3, en lugar de la ruta nativa de seis pasos del modelo publicado.

El repositorio está pensado para usuarios avanzados de ComfyUI que quieran reproducir los experimentos del autor, no para uso en producción directa. Incluye el backbone completo sin podar, el codificador de texto Qwen3-VL de 32B cuantizado a INT8 (27,14 GB), el VAE en FP16 (1,17 GB), flujos de trabajo en formato JSON y una colección de ejemplos comparativos con evaluación manual. El autor es explícito al señalar que los resultados son preliminares, que la "cabeza media" no es la cabeza del profesor original y que no se ha demostrado una restauración completa del modelo.

La relevancia actual radica en que documenta con detalle un flujo de trabajo experimental reproducible sobre un modelo de difusión de gran tamaño, incluyendo fallos, candidatos rechazados y advertencias sobre qué no afirmar. Es un ejemplo de publicación transparente de resultados negativos y de límites metodológicos en el ecosistema de modelos generativos de imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (backbone MiniMax-H3-Image) con codificador de texto Qwen3-VL de 32B y VAE de imagen; nodo de cabeza única sobre cabezas PDD |
| Parámetros totales | no disponible (el backbone completo en BF16/FP32 ocupa 66,29 GB; el codificador de texto INT8, 27,14 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Backbone en BF16 + FP32 mixto; codificador de texto INT8; VAE FP16; LoRA en safetensors de 172,07 MB |
| Idiomas soportados | zh, en |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (backbone, LoRA, codificador de texto, VAE); flujos de trabajo en JSON |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: empaqueta el backbone de difusión MiniMax-H3-Image en una conversión completa a ComfyUI con precisión mixta BF16/FP32, conservando las capas AdaLN y la precisión de publicación. El autor indica explícitamente que no es una desquantización de INT8 ni un modelo podado, y que sigue conteniendo PDD (el esquema de muestreo nativo de seis pasos). El codificador de texto es Qwen3-VL de 32B en INT8 y el VAE está en FP16, por lo que la cadena completa no es BF16 de extremo a extremo.

La innovación técnica principal es el nodo "H3 Image Single Head" (`H3ImageSingleHead`), que sustituye las seis cabezas PDD publicadas por una única cabeza media obtenida mediante ponderación por intervalos. Este nodo modifica solo una copia en memoria del backbone, sin sobrescribir el archivo. Sobre esa base se aplica un LoRA de corrección de materiales (`experimental_direct_mlp100_rank16.safetensors`, rango 16) entrenado de forma independiente para aproximar texturas más naturales en rutas multi-paso (Euler 50 pasos, CFG 3, shift 3, intensidad LoRA +1). El autor advierte que no se ha encontrado el incremento PDD original del backbone ni pesos de un profesor desconocido para comparar, por lo que no puede afirmarse que se haya "eliminado la destilación" ni que se haya restaurado el 99 % del original. La cifra de 8/10 corresponde a una comprobación manual conjunta sobre un conjunto fijo de muestras, no a una similitud con el profesor ni a un test ciego a gran escala.

## Capacidades

- Generación de texto a imagen en resoluciones de 2048×2048 (nueve configuraciones del conjunto de pruebas).
- Edición de imagen con imagen de referencia, a 2048×1344, manteniendo la misma referencia en las ramas positiva y negativa.
- Soporte de rutas de muestreo multi-paso (Euler 50 pasos, CFG 3, shift 3) mediante el nodo de cabeza única y el LoRA de corrección.
- Ruta nativa de seis pasos con el backbone publicado, usando el calendario PDD y BasicGuider (equivalente a CFG 1), sin nodo de cabeza única ni LoRA.
- Integración con ComfyUI mediante nodos nativos `MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas` y `CFGGuider`.
- Carga de LoRA por bypass de modelo (no por fusión), requisito para el flujo experimental.
- Idiomas de prompting: chino y inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso textual, visión de entrada distinta de la edición de imagen, audio ni modo "thinking".

## Casos de uso

- Reproducción de experimentos de textura en piel: con el backbone completo, la cabeza media y el LoRA direct MLP100 a +1, se generan retratos de 2048×2048 donde se reducen los bloques de textura rígida en la piel manteniendo las arrugas de edad; útil para investigadores que estudien artefactos de muestreo multi-paso.
- Evaluación de materiales textiles: el par de ejemplo "tijeras y lino" muestra cómo el LoRA convierte un relieve roto en un tejido continuo; sirve para comparar metodologías de corrección de material en modelos de difusión.
- Edición localizada de imágenes: el flujo de edición a 2048×1344 con referencia permite probar la eliminación de texto en paredes y evaluar la deriva de detalles no objetivo, con ejemplos de fallo documentados.
- Estudio de conservación de composición: los pares control/tratado con mismo prompt, semilla, resolución, sampler y rejilla sigma permiten medir cuánto cambia la composición al aplicar la corrección.
- Docencia y auditoría de model cards: el repositorio incluye candidatos rechazados (`experimental/rejected/...DIAGNOSTIC_ONLY.safetensors`) y ejemplos de fallo, útiles como material para enseñar evaluación honesta de resultados.
- Pruebas de despliegue en hardware limitado: el autor reporta ejecución real en RTX 4060 Ti de 16 GB con 128 GB de RAM usando descarga a memoria del sistema, lo que sirve para estudiar estrategias de offload en ComfyUI con pesos de 66 GB.
- Validación de la ruta nativa de seis pasos: el flujo `workflows/native_pdd6` permite verificar el comportamiento del modelo publicado sin las modificaciones experimentales, como línea base de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor aporta únicamente una comprobación manual conjunta sobre diez muestras fijas (8 aprobadas, 2 fallidas), que no constituye un benchmark cuantitativo ni un test ciego a gran escala.

| Muestra fija | Observación con direct MLP100 | Comprobación conjunta |
|---|---|---|
| Tijeras y lino | Tejido fino continuo, abertura en V y doble anillo conservados; cambia la composición | Aprobada |
| Piel de anciano | Bloques rígidos reducidos, cabello y arrugas de edad conservados; cambia el detalle facial | Aprobada |
| Paraguas | Tela roja más natural, pero falta el mástil largo y el mango | Fallida |
| Librería tras la lluvia | Cuatro caracteres legibles, relieve de madera y piedra reducido, textura aún rugosa | Aprobada |
| Alfarero y cuenco | Piel y tela mejoradas, cuenco y manos legibles; algunos dedos suavizados | Aprobada |
| Edición local de texto en pared | Texto grande eliminado; quedan marcas tenues arriba y deriva en persona y detalles no objetivo | Fallida |
| Reparador de coches | Abertura de llave en U visible en esta muestra; no es una corrección genérica de herramientas | Aprobada |
| Perro pastor | Cuatro patas, orejas y cola dentro del encuadre en esta muestra; cambian manchas y orientación de cabeza | Aprobada |
| Vaso y cuenco de dos asas | Materiales diferenciados, tres asas conectadas; uniones irregulares y brillos algo altos | Aprobada |
| Casa de té en acuarela | "Casa de té entre montañas", dos macetas y estilo acuarela conservados; arquitectura simplificada | Aprobada |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone completo en BF16/FP32 ocupa 66,29 GB, por lo que no cabe en GPU de consumo sin offload; el codificador de texto INT8 ocupa 27,14 GB y el VAE FP16 1,17 GB.
- GPU recomendadas: no disponibles en la información; el autor solo reporta una ejecución real.
- Configuración verificada por el autor: RTX 4060 Ti de 16 GB de VRAM con 128 GB de RAM, con descarga masiva a memoria del sistema. El propio autor advierte que esto no implica que máquinas con menos RAM puedan ejecutarlo ni garantiza velocidad.
- Cabe en GPU de consumo: solo con offload agresivo y suficiente RAM del sistema; no se garantiza en configuraciones de menor memoria.
- Opciones de despliegue: ComfyUI con los nodos nativos `MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas` y `CFGGuider`, más el nodo personalizado `H3ImageSingleHead`. Entorno de referencia: ComfyUI `989d93d0d`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo de difusión.
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen ni métricas de rendimiento, y advierte que distintos hardware, operadores y versiones de ComfyUI no garantizan resultados idénticos píxel a píxel.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t8star/Minimax-H3-Image-Exp-Comfy | no disponible (backbone 66,29 GB BF16/FP32) | no disponible | Comprobación manual 8/10 sobre muestras fijas; sin benchmarks | minimax-h3-image-community-license-agreement | Hugging Face, 2.225 descargas, 8 likes |
| MiniMaxAI/MiniMax-H3-Image (modelo base) | no disponible | no disponible | no disponible | minimax-h3-image-community-license-agreement | Hugging Face (referenciado como base) |
| Otros modelos de difusión de imagen de gran tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks ni de especificaciones de alternativas en la información proporcionada; la comparación se limita a la relación con el modelo base del que deriva este repositorio.

## Limitaciones y advertencias

- No es un modelo oficial de MiniMax ni una versión nueva: es un paquete de investigación de terceros sobre el backbone publicado.
- No se ha demostrado la eliminación de la destilación PDD ni una restauración del 99 % del original; el autor lo niega explícitamente.
- La cabeza media del nodo no es la cabeza del profesor original, sino una ponderación por intervalos de las seis cabezas PDD publicadas.
- El LoRA de corrección no mejora todos los detalles: simplifica detalles locales y altera caras, posiciones de objetos y composición.
- Los resultados de 8/10 son una comprobación manual sobre muestras fijas, no un test ciego ni una medida de similitud con el profesor.
- El candidato `experimental/rejected/REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY.safetensors` no superó la comprobación de presupuesto numérico de entrenamiento y no se recomienda para sustituir al direct MLP100.
- La cadena no es BF16 de extremo a extremo: el codificador de texto es INT8 y el VAE es FP16.
- Requiere una versión de ComfyUI con nodos concretos (`MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas`, `CFGGuider`); no debe sustituirse el cargador de bypass por un cargador de fusión LoRA convencional.
- No se deben apilar el LoRA direct MLP100 con las antiguas compensaciones v2, PAI u otras; el autor lo desaconseja.
- El nodo personalizado debe instalarse una sola vez: el repositorio y el paquete de GitHub son la misma implementación y no deben coexistir.
- Idiomas de prompting limitados a chino e inglés.
- Licencia "other" sujeta al acuerdo comunitario de MiniMax-H3-Image; deben revisarse las condiciones de uso comercial en el archivo LICENSE antes de cualquier despliegue productivo.
- Riesgo de alucinación visual y de deriva de detalles no objetivo en edición localizada, documentado en los ejemplos de fallo (paraguas y texto en pared).
- El rendimiento en hardware distinto del reportado (RTX 4060 Ti 16 GB, 128 GB RAM) no está garantizado, ni en velocidad ni en fidelidad píxel a píxel.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Nodo ComfyUI en GitHub: https://github.com/T8mars/Comfyui-h3-image-single-head-T8
- Flujos de trabajo: `workflows/direct_mlp` y `workflows/native_pdd6` (dentro del repositorio)
- Ejemplos completos: `EXAMPLES.md` (dentro del repositorio)
- Índice de modelos: `MODEL_INDEX.md` (dentro del repositorio)
- Manifiesto legible por máquina: `MODEL_MANIFEST.json` (dentro del repositorio)
- Licencia: `LICENSE` (dentro del repositorio)
