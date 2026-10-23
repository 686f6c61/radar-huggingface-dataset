# tencent/Hy-Nomas

## Resumen

Hy-Nomas es un modelo de generación de mundos en vídeo desarrollado por Tencent que permite crear vídeo de forma interactiva y multi-turno: el usuario introduce instrucciones de texto (objetos, acciones, estilo, entorno) y trayectorias de cámara mientras la generación continúa, y el modelo produce el mundo un segmento de vídeo tras otro. No se trata de un generador de texto a vídeo de un solo tiro, sino de un modelo autorregresivo a nivel de segmento que reutiliza el contexto previo mediante una caché KV persistente, de modo que la coherencia entre segmentos se mantiene sin regenerar el pasado.

Técnicamente combina un diffusion transformer (DiT) segmento-autorregresivo con 54 bloques MMDiT de doble flujo y atención conjunta causal por segmento, un encoder de texto derivado de Qwen2.5-VL-7B-Instruct, módulos de condicionamiento de cámara (extrinsics_attn) y un decoder de vídeo PixelUMM ajustado. La configuración destilada genera cada segmento con solo 8 pasos de denoising a 720 × 1280 y 24 FPS, y existe una configuración específica para ejecutar el modelo en una única RTX 4090 usando pesos DiT en INT8, caché KV en INT8, decoder en FP8 y offload a CPU.

Su relevancia ahora es que abre la puerta a los "world models" interactivos de código abierto con control explícito de cámara, un área hasta hace poco dominada por demos cerradas. Tencent acompaña el lanzamiento con Hy-Nomas-Bench, un conjunto de cuatro benchmarks con 280 casos de prueba centrados en controlabilidad interactiva y consistencia espacial. El repositorio ocupa 196,4 GB y no se han publicado el número de parámetros ni resultados numéricos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) segmento-autorregresiva; 54 bloques MMDiT de doble flujo con atención conjunta causal por segmento, modulación por timestep, cross-attention de cámara y caché KV persistente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la caché KV transporta el histórico entre segmentos; no se publica límite máximo de segmentos o frames) |
| Tipos de cuantizacion | INT8 en pesos del DiT y en caché KV, FP8 en el decoder (configuración de una sola GPU); otros formatos no disponibles |
| Idiomas soportados | no disponible (el encoder de texto es el componente LM de Qwen2.5-VL-7B-Instruct, pero el modelo no declara idiomas soportados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers); repositorio de 196,4 GB |
| Espacio latente | latentes de vídeo comprimidos DCAE-V |
| Encoder de texto | Qwen2.5-VL-7B-Instruct (componente LM), 3.584 dimensiones, refiner de dos capas y proyección a 2.048 dimensiones del DiT |
| Decoder de vídeo | PixelUMM ajustado (fine-tuned) |
| Resolución y cadencia | 720 × 1280 a 24 FPS |
| Pasos de denoising | 8 (configuración destilada) |
| Control de cámara | extrinsics_attn; matrices extrínsecas 4 × 4 normalizadas, agrupadas en bloques de 4 frames y aplanadas a entradas de 64 dimensiones |
| Pipeline declarado | text-to-video |

## Arquitectura y entrenamiento

Hy-Nomas realiza la difusión en un espacio latente de vídeo comprimido (DCAE-V) y la autorregresión a lo largo de segmentos de vídeo. Cada segmento nuevo parte de ruido gaussiano en ese espacio latente y se condiciona con tres señales: el prompt de texto del segmento, la trayectoria de cámara y el histórico ya generado, que se inyecta a través de una caché KV persistente en lugar de recalcularse. El bloque central es un MMDiT de doble flujo (texto y vídeo) con atención conjunta causal por segmento, modulación por timestep y una ruta específica de cross-attention para la cámara, lo que permite cambiar de contenido entre segmentos sin perder continuidad espacial.

El condicionamiento de texto no usa CLIP sino el componente de lenguaje de Qwen2.5-VL-7B-Instruct: sus estados ocultos de 3.584 dimensiones pasan por un refiner de tokens de dos capas y se proyectan al espacio de 2.048 dimensiones del DiT. En la demo web, un servicio separado llamado Nomas-PE convierte las instrucciones libres del usuario en prompts estructurados de generación, y es obligatorio para ese flujo; la inferencia offline puede leer ficheros de prompt ya preparados. La decodificación de latentes a píxeles la realiza un PixelUMM ajustado, y la configuración destilada reduce la inferencia a 8 pasos de denoising por segmento.

No se han facilitado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. El informe técnico figura como "coming soon" en el repositorio, por lo que los detalles de entrenamiento y destilación no están publicados.

## Capacidades

- Generación de vídeo a partir de texto con resolución 720 × 1280 y 24 FPS por segmento.
- Interacción libre multi-turno: se pueden introducir objetos, cambiar el estilo, cambiar la escena o describir acciones mientras la generación avanza.
- Control explícito de cámara mediante trayectorias (matrices extrínsecas) combinadas con instrucciones de texto.
- Generación continua de un mismo mundo reutilizando el contexto anterior mediante caché KV.
- Control mixto e intercalado de texto y cámara dentro de una misma secuencia de interacción.
- Memoria espacial: el benchmark asociado evalúa la capacidad de mantener la coherencia del entorno a lo largo del tiempo.
- Inferencia destilada de 8 pasos, pensada para reducir latencia por segmento.
- Despliegue flexible: configuración con paralelismo de secuencia en varios aceleradores o configuración de una sola GPU.
- Demo web interactiva disponible en el sitio oficial.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso basado en agentes, audio ni otros idiomas distintos de los que soporte el encoder de texto.

## Casos de uso

- Previsualización de entornos para videojuegos: el equipo de diseño recorre un mundo generado segmento a segmento, moviendo la cámara con trayectorias concretas para validar escala, composición y legibilidad de espacios antes de modelar en el motor real.
- Previsualización virtual (previs) para cine y publicidad: se generan planos con movimiento de cámara definido por extrínsecas, de modo que el director puede iterar sobre el encuadre y la acción sin rodaje ni render 3D.
- Generación de datos sintéticos para robótica y agentes encarnados: la generación continua con memoria espacial permite producir secuencias largas y coherentes de navegación por un entorno, útiles para entrenar modelos de percepción y planificación.
- Prototipado rápido de escenas de arquitectura e interiorismo: se introducen cambios de estilo y de mobiliario en sucesivos turnos sobre el mismo mundo, manteniendo la geometría y la iluminación previas.
- Contenido narrativo interactivo: un guionista dirige una historia describiendo acciones y movimientos de cámara turno a turno, aprovechando la caché KV para conservar personajes y decorados entre segmentos.
- Evaluación de modelos generativos de vídeo: Hy-Nomas-Bench, con 280 casos en cuatro suites, permite medir controlabilidad y consistencia en generación de mundo continua, por ejemplo para comparar variantes de sampling o de cuantización.
- Exploración de técnicas de compresión de modelos de difusión: la configuración de una sola RTX 4090 con INT8 en DiT y caché KV, FP8 en decoder y offload a CPU sirve como referencia práctica de despliegue de un DiT de vídeo en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor publica Hy-Nomas-Bench, una suite de cuatro benchmarks con 280 casos de prueba (interacción libre multi-turno por texto, navegación con cámara, control intercalado de texto y cámara, y memoria espacial), pero la model card no incluye puntuaciones numéricas ni comparaciones con otros modelos. Tampoco se han facilitado métricas de latencia o throughput más allá del dato de configuración: 8 pasos de denoising por segmento a 720 × 1280 y 24 FPS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio de pesos ocupa 196,4 GB, lo que incluye varias variantes de precisión; el tamaño del checkpoint no equivale a la VRAM necesaria en ejecución.
- Configuración de referencia multi-GPU: el autor menciona una configuración estándar con paralelismo de secuencia, sin especificar el número ni el modelo de aceleradores.
- Configuración de una sola GPU: soportada oficialmente en una NVIDIA GeForce RTX 4090 (24 GB) mediante pesos DiT en INT8, caché KV en INT8, decoder en FP8 y offload a CPU. Es, por tanto, viable en GPU de consumo de gama alta con esa combinación.
- GPU profesionales: no se indican requisitos ni rendimiento para A100, H100 u otras; no disponible.
- Opciones de despliegue: integración vía diffusers (pipeline text-to-video), script de inferencia del repositorio de GitHub y demo web oficial. No se documentan en la información disponible soportes de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Solo se conoce la reducción a 8 pasos de denoising por segmento y la cadencia de salida de 24 FPS, que no implican generación en tiempo real.

## Comparativa con modelos similares

Los datos de las alternativas no provienen de la información proporcionada y deben verificarse en sus respectivas fichas; se incluyen solo como orientación de categoría.

| Modelo | Categoría | Parametros | Contexto / duracion | Control interactivo | Licencia |
|---|---|---|---|---|---|
| Hy-Nomas (Tencent) | World model de vídeo, DiT segmento-autorregresivo | no disponible | caché KV persistente entre segmentos; límite no publicado | Texto multi-turno + trayectorias de cámara | Apache 2.0 |
| HunyuanVideo (Tencent) | Text-to-video DiT | no disponible en esta ficha | generación de un clip corto por inferencia | Solo texto (sin control de cámara interactivo declarado) | licencia comunitaria propia de Tencent |
| Serie Wan (Alibaba) | Text-to-video / image-to-video DiT abierto | no disponible en esta ficha | clip corto por inferencia | Principalmente texto e imagen inicial | Apache 2.0 en varias variantes |
| World models interactivos tipo Genie / Matrix-Game | Modelos de mundo jugables | no disponible | sesiones interactivas en tiempo real | Acciones de teclado o control de agente | mayoritariamente cerrados o de disponibilidad limitada |

La diferencia principal de Hy-Nomas frente a los generadores text-to-video convencionales no es la resolución ni el número de parámetros, sino el modo de uso: generación por segmentos con estado persistente y condicionamiento explícito de cámara, lo que lo sitúa más cerca de un motor de mundo interactivo que de un modelo de un solo plano.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: la única evaluación disponible es la suite Hy-Nomas-Bench del propio autor, sin puntuaciones en la model card, lo que impide comparar objetivamente con alternativas.
- El informe técnico está anunciado como "coming soon": no se conocen dataset de entrenamiento, número de tokens, etapas de alineación ni detalles del proceso de destilación.
- El número de parámetros no se declara, lo que dificulta planificar despliegues y estimar costes de inferencia.
- Deriva de escena y alucinación visual: en generación autorregresiva larga, la reutilización de caché KV puede acumular errores y producir inconsistencias de geometría, identidad de objetos o iluminación; la propia suite de benchmarks incluye memoria espacial precisamente por este riesgo.
- No se declara qué idiomas soporta el pipeline; aunque el encoder de texto sea multilingüe, el comportamiento en castellano no está documentado ni evaluado.
- No se publica el límite de contexto en número de segmentos o frames; el coste de la caché KV crece con el histórico, lo que afecta a la VRAM en sesiones largas.
- La demo web requiere Nomas-PE, un servicio separado de mejora de prompts: no es un componente opcional en ese flujo y añade una dependencia de despliegue.
- Licencia Apache 2.0 para el modelo, pero conviene revisar las licencias de los componentes de terceros empaquetados o referenciados, en particular el encoder Qwen2.5-VL-7B-Instruct y el decoder PixelUMM, antes de un uso comercial en producción.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o geográficos en los mundos generados.
- El tamaño del repositorio (196,4 GB) implica requisitos de almacenamiento y tiempos de descarga considerables, además de complicar la reproducibilidad en entornos con cuotas.
- Resolución y cadencia parecen fijas en la configuración publicada (720 × 1280, 24 FPS, 8 pasos); no se documentan variantes de menor coste o mayor resolución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-Nomas
- Repositorio en GitHub: https://github.com/Tencent-Hunyuan/Hy-Nomas
- Informe técnico (anunciado, aún no publicado): https://github.com/Tencent-Hunyuan/Hy-Nomas/blob/main/Hy_Nomas_Tech_Report.pdf
- Dataset de benchmark Hy-Nomas-Bench: https://huggingface.co/datasets/tencent/Hy-Nomas-Bench
- Demo oficial: https://hy-nomas.hy.tencent.com/
