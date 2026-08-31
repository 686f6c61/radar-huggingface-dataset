# taurusduan/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4

## Resumen

Este modelo es una cuantización mixta NVFP4 del text encoder Qwen3-VL-32B adaptado para la generación de vídeo con MiniMax-H3, en su variante "Heretic" (sin censura, abliterada). El autor, taurusduan (del grupo Lna-Lab), parte del trabajo de ethanfel, que ya había producido una versión INT8 con rotación ConvRot de 26,4 GB, y lo re-cuantiza a NVFP4 para reducir el tamaño a 15,7 GB, lo que permite ejecutarlo en una GPU de 16 GB sin necesidad de offload. El resultado es un drop-in replacement del encoder oficial de Comfy-Org, con la misma huella de memoria pero sin las restricciones de contenido del modelo original.

La relevancia de este modelo radica en democratizar la generación de vídeo con MiniMax-H3: antes se necesitaban tarjetas de 80 GB o bien recurrir a offload lento; ahora un RTX PRO 2000 Blackwell de 16 GB puede ejecutar el encoder completo en VRAM, con un pico medido de ~9,9 GB durante la generación. El proceso de re-cuantización incluye un paso crítico de desrotación Hadamard (ConvRot) para evitar que la salida sea completamente incoherente con el prompt, un fallo silencioso que no genera errores pero produce vídeo sin relación con el texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B (text encoder) adaptado para MiniMax-H3, con rotacion ConvRot y cuantizacion mixta NVFP4/INT8 |
| Parametros totales | 32 000 millones (aprox., segun el modelo base Qwen3-VL-32B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | NVFP4 (350 capas lineales, grupo 16) + INT8 (embedding, 778 M params) |
| Idiomas soportados | no disponibles (hereda los de Qwen3-VL, pero no se documentan) |
| Licencia | Apache-2.0 (con restricciones adicionales de la MiniMax-H3 Community License para los pesos del modelo base) |
| Formato de pesos | safetensors (un unico archivo de 15,7 GB, compatible con ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un text encoder basado en Qwen3-VL-32B, un transformer multimodal de 32 000 millones de parametros, adaptado por la comunidad para servir como encoder de texto en el pipeline de generacion de video de MiniMax-H3. La variante "Heretic" ha sido sometida a un proceso de abliteration (eliminacion de capas de censura) para permitir la generacion de contenido sin restricciones tematicas. El trabajo de ethanfel anadio una cuantizacion INT8 con rotacion ConvRot (Hadamard por grupos de 256), que es el punto de partida de este repositorio.

La re-cuantizacion a NVFP4 se realizo sobre los pesos ya rotados, por lo que fue necesario deshacer la rotacion multiplicando por la matriz Hadamard antes de volver a cuantizar. El autor mantiene la capa de embeddings en INT8 (151 936 × 5120 = 778 M parametros) porque cuantizarla a NVFP4 aporta poco ahorro y puede provocar OOM en GPUs de 16 GB durante el proceso de horneado. El resultado es un archivo mixto con metadatos `comfy_quant` por capa, que ComfyUI lee sin necesidad de configuracion especial. No se proporcionan datos sobre el entrenamiento original del encoder, ya que es un modelo preentrenado reutilizado.

## Capacidades

- Generacion de texto a video: actua como encoder de texto para el modelo de difusion MiniMax-H3, transformando prompts en embeddings de condicionamiento.
- Sin censura (Heretic/abliterated): permite prompts que el modelo oficial rechazaria o filtraria.
- Compatibilidad con ComfyUI: se carga mediante `CLIPLoader` con tipo `minimax` y funciona como sustituto directo del encoder NVFP4 oficial de Comfy-Org.
- Soporte de vision (heredado de Qwen3-VL): aunque se usa principalmente como encoder de texto, la arquitectura base es multimodal y podria admitir condicionamiento por imagen si el flujo de trabajo lo requiere (no documentado en este repositorio).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un componente de un pipeline de generacion, no un modelo conversacional.

## Casos de uso

- Generacion de video vertical para redes sociales: el autor midio la generacion de 6 segundos de video 480×864 con audio en una RTX PRO 2000 Blackwell, lo que lo hace apto para creadores que producen contenido para TikTok, Reels o Shorts sin necesidad de hardware de datacenter.
- Sustitucion del encoder oficial en flujos ComfyUI existentes: al ser un drop-in replacement, cualquier workflow de MiniMax-H3 que use el NVFP4 de Comfy-Org puede apuntar a este archivo y mantener el resto de nodos intactos, ganando la capacidad de generar contenido sin censura.
- Prototipado rapido de videos conceptuales: estudios de diseno o agencias pueden usar este encoder para explorar ideas visuales sin restricciones de contenido, validando conceptos antes de pasar a produccion con modelos censurados.
- Investigacion sobre cuantizacion y rotacion de pesos: el proceso documentado de desrotacion Hadamard y re-cuantizacion mixta es un caso de estudio util para quienes trabajan con ConvRot y NVFP4 en otros modelos.
- Generacion de contenido para fines artisticos o educativos: artistas que trabajan con temas controvertidos o historicos pueden usar el encoder sin que el modelo imponga filtros morales, aunque deben respetar la licencia de MiniMax-H3.
- Desarrollo de herramientas de video generativo en entornos con recursos limitados: el hecho de que quepa en 16 GB permite integrarlo en estaciones de trabajo con una sola GPU consumer (RTX 4090, RTX PRO 2000, etc.) para aplicaciones de edicion de video asistida por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es una comparacion visual: el autor genero el mismo prompt y semilla con el upstream INT8-ConvRot (26,4 GB) y con esta version NVFP4, y afirma que ambas salidas son "visualmente equivalentes", es decir, la cuantizacion no altera la descripcion que el encoder produce del prompt. No hay metricas objetivas como CLIP score, FID o similitud de embeddings.

## Requisitos de hardware

- VRAM minima: 16 GB (medido en una RTX PRO 2000 Blackwell con pico de ~9,9 GB durante la generacion; el encoder completo ocupa 14,9 GB en VRAM con carga dinamica).
- GPU recomendadas: cualquier GPU Blackwell con soporte NVFP4 (sm_120 o superior). El autor uso una RTX PRO 2000 Blackwell de 16 GB. No hay garantia de funcionamiento en GPUs Ampere o anteriores, ya que NVFP4 requiere hardware Blackwell.
- RAM del sistema: ~36 GB utilizados por el proceso de ComfyUI durante la generacion.
- Opciones de despliegue: ComfyUI (version 0.30.0 o superior) con Sage Attention para el atencion del modelo de difusion. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia y throughput: no disponibles. El autor solo reporta la generacion de 6 segundos de video, pero sin indicar el tiempo total.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | VRAM necesaria | Censura | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-32B Heretic MiniMax-H3 NVFP4 (este) | 15,7 GB | NVFP4 mixto + INT8 | 16 GB | No (Heretic) | Apache-2.0 + MiniMax-H3 Community License |
| ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot (upstream) | 26,4 GB | INT8 + ConvRot | >16 GB (necesita offload) | No (Heretic) | Apache-2.0 + MiniMax-H3 Community License |
| Comfy-Org NVFP4 (oficial, censurado) | 15,7 GB | NVFP4 mixto + INT8 | 16 GB | Si | Apache-2.0 + MiniMax-H3 Community License |
| Abiray/Qwen3-VL-32B-Heretic-MiniMax-H3-nvfp4-ComfyUI (variante directa desde BF16) | ~15,7 GB (estimado) | NVFP4 puro desde BF16 | 16 GB | No (Heretic) | Apache-2.0 + MiniMax-H3 Community License |

La diferencia clave con la variante de Abiray es que esta ultima se horneo directamente desde los pesos BF16 originales, evitando la doble cuantizacion (INT8 → NVFP4) que introduce este repositorio. El autor de este modelo reconoce que un horneado directo desde BF16 seria marginalmente mas limpio, pero no tenia acceso a esos pesos.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_120) para NVFP4; en GPUs anteriores el archivo no se cargara o dara errores.
- Doble cuantizacion: al partir de un modelo ya cuantizado a INT8, esta version arrastra el redondeo del INT8 y luego anade el de NVFP4, lo que puede introducir una perdida de precision acumulada frente a un horneado directo desde BF16.
- Riesgo de rotacion mal aplicada: si alguien reutiliza los pesos sin deshacer la rotacion ConvRot, el encoder producira condicionamientos sin relacion con el prompt, sin errores visibles. El autor advierte explicitamente de este fallo.
- Licencia MiniMax-H3 Community License: aunque el repositorio esta bajo Apache-2.0, los pesos del modelo base estan sujetos a la licencia comunitaria de MiniMax-H3, que puede imponer restricciones de uso comercial o de redistribucion. Hay que revisarla antes de usarlo en produccion.
- Contenido sin censura: al ser abliterated, el modelo puede generar descripciones para contenido explicito, violento o ilegal. El usuario es responsable del uso que haga de el.
- No hay garantia de calidad de video: la equivalencia visual con el upstream se basa en una unica prueba; no se han realizado evaluaciones sistematicas de fidelidad o coherencia.
- Sin soporte para otros frameworks: esta pensado exclusivamente para ComfyUI; no se documentan integraciones con otros sistemas de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Upstream (ethanfel): https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- MiniMax-H3 (oficial): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Comfy-Org MiniMax-H3 (oficial): https://huggingface.co/Comfy-Org/MiniMax-H3
- Variante directa desde BF16 (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Heretic-MiniMax-H3-nvfp4-ComfyUI
- Articulo en aiany.app: https://aiany.app/item/qwen3-vl-32b-heretic-minimax-h3-text-encoder-nvfp4
