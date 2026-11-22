# vedantjadhav701/interior-layout-qwen2.5-7b-mi300x

## Resumen

`interior-layout-qwen2.5-7b-mi300x` es un ajuste fino mediante LoRA del modelo base Qwen2.5-7B-Instruct, publicado por el usuario vedantjadhav701 en Hugging Face. El modelo está diseñado para actuar como el núcleo de razonamiento espacial de una plataforma de diseño de interiores 3D y arquitectura automatizada, generando disposiciones de mobiliario en formato JSON estructurado que posteriormente se validan con un verificador geométrico determinista basado en Shapely.

El modelo se presenta como el componente "neuro-simbólico" de un pipeline de cuatro etapas que abarca desde la reconstrucción métrica de la estancia (mediante VGGT y ajuste de planos RANSAC) hasta el renderizado fotorrealista final con FLUX.1. La contribución específica de este checkpoint es la capa de razonamiento espacial: recibe un `RoomShell` (polígono de suelo, altura de techo y aberturas) y produce un grafo de escena verificado con cajas delimitadoras 3D y ángulos de rotación (yaw) para cada mueble.

El modelo fue entrenado en hardware AMD Instinct MI300X (192 GB HBM3) usando ROCm, con precisión bfloat16 nativa y sin cuantización. Cuenta con 7.615.616.512 parámetros en formato safetensors, pero el repositorio no incluye información sobre licencia, idiomas soportados ni pipeline de uso, y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-7B-Instruct) con adaptadores LoRA fusionados |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (entrenado en bfloat16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante LoRA con rango r=16, alpha=32 y dropout de 0,05 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con las librerías `transformers 5.x`, `peft` y `trl` (`SFTTrainer` con `SFTConfig`), con batch size de 8 por dispositivo y acumulación de gradientes de 2 pasos (batch efectivo de 16), learning rate de 2e-4 con warmup lineal y decaimiento coseno, y precisión bfloat16 pura sobre AMD MI300X con ROCm 10.2 / HIP 7.17.

La justificación del autor para elegir un LLM de 7B frente a redes específicas de dominio (ATISS, LayoutGPT, DiffuScene, DirectLayout, LLplace) es que los modelos autorregresivos de este tamaño muestran mejor razonamiento espacial y cumplimiento de JSON estructurado cuando se combinan con verificadores simbólicos. La innovación principal del sistema no está en el modelo en sí, sino en el bucle de autocorrección: el verificador geométrico detecta violaciones (colisiones, pasillos menores de 0,75 m, anclajes de pared no alineados) y realimenta al modelo hasta un máximo de 3 reintentos. No se especifica el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de disposiciones espaciales 3D en JSON estructurado: cajas delimitadoras y ángulos yaw para mobiliario dentro de un `RoomShell` dado.
- Razonamiento espacial condicionado por restricciones geométricas (polígono de suelo, altura de techo, posición de puertas y ventanas).
- Cumplimiento de contratos de datos estrictos (esquema Pydantic `RoomShell` con `floor_polygon_xz`, `ceiling_height` y `openings`).
- Participación en bucles de autocorrección con feedback de un verificador externo (hasta 3 reintentos).
- Generación de texto y razonamiento general heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card para este ajuste.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto y la ingestión multimodal la realizan otros componentes del pipeline (VGGT, parsers visión-lenguaje).
- Capacidades multilingües: no documentadas para este checkpoint.

## Casos de uso

- Generación automatizada de planos de distribución: el modelo recibe el contorno de una vivienda y las aberturas, y produce la disposición de muebles en JSON que luego se convierte a DXF/SVG/PDF con líneas de cota y arcos de puerta a 90 grados.
- Verificación de cumplimiento normativo de pasillos: al integrarse con el verificador Shapely, garantiza anchos mínimos de paso de 0,75 m, útil en herramientas de prevalidación antes de revisión humana.
- Prototipado rápido de layouts para estudios de interiorismo: sustituye las 2 a 4 semanas de modelado manual en 3ds Max o SketchUp por una generación inicial que el diseñador revisa y refina.
- Generación de gemelos digitales 3D: la salida del modelo alimenta el ensamblador PBR (GLB/USDZ) y el renderizador Three.js para walkthroughs interactivos.
- Automatización de presupuestos preliminares: la lista estructurada de muebles con dimensiones y posiciones permite calcular cantidades y costes de material sin intervención manual.
- Integración en pipelines de renderizado condicionado: el grafo de escena verificado sirve como entrada a los preprocesadores de profundidad y normal de FLUX.1 para generar renders fotorrealistas coherentes con la geometría.
- Asistencia en reformas con entrada de vídeo o panorámica 360: combinado con VGGT en la etapa 1, permite reconstruir la estancia y proponer una nueva distribución a partir de un recorrido con smartphone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para pesos (7.615.616.512 parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU de referencia del entrenamiento: AMD Instinct MI300X con 192 GB HBM3 y 5,3 TB/s de ancho de banda, sobre ROCm 10.2 / HIP 7.17.
- GPU consumer: cabe en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5080) en bfloat16; en cuantización de 4 bits podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados); el checkpoint safetensors es compatible con `transformers` y `peft`.
- Latencia y throughput: no disponibles; el autor menciona "extreme batch throughput" en MI300X sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| interior-layout-qwen2.5-7b-mi300x | 7,6B | No disponible | Layout 3D de interiores (JSON) | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (ampliable) | Propósito general, instrucciones | Apache 2.0 (modelo base) | Hugging Face, ampliamente desplegado |
| LayoutGPT | No disponible | No disponible | Layout 3D a partir de texto | No disponible | Repositorio de investigación (NeurIPS) |
| ATISS | No disponible | No disponible | Síntesis de escenas de interior | No disponible | Repositorio de investigación (NeurIPS) |

La comparación con los modelos de investigación es cualitativa: el autor argumenta que un LLM de 7B ajustado supera a las redes específicas de dominio en cumplimiento de JSON y razonamiento espacial cuando se combina con verificación simbólica, pero no aporta métricas que respalden la afirmación.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- No se documentan idiomas soportados ni evaluación multilingüe; el ajuste parece orientado a instrucciones en inglés.
- No hay benchmarks publicados ni métricas de calidad del layout (tasa de colisiones, cumplimiento de restricciones, fidelidad al brief).
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni revisión por pares.
- El modelo depende de un verificador geométrico externo (Shapely) para garantizar la validez física; sin él, la salida JSON puede contener colisiones o violaciones de paso.
- El bucle de autocorrección está limitado a 3 reintentos; casos complejos pueden no converger.
- Riesgo de alucinación en la geometría: el modelo puede inventar dimensiones de muebles o posiciones no compatibles con el `RoomShell` si el prompt no es suficientemente restrictivo.
- La fecha de creación del repositorio (2026-11-21) y la referencia a ROCm 10.2 / HIP 7.17 y `transformers 5.x` no son verificables contra versiones públicas actuales, lo que genera dudas sobre la reproducibilidad.
- El pipeline completo requiere componentes adicionales (VGGT, FLUX.1, TRELLIS, base de datos vectorial) que no se distribuyen en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedantjadhav701/interior-layout-qwen2.5-7b-mi300x
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- ATISS (NeurIPS): https://arxiv.org/abs/2007.11562
- LayoutGPT (NeurIPS): https://arxiv.org/abs/2305.15393
- DiffuScene (ICLR): https://arxiv.org/abs/2304.06705
- LLplace (arXiv 2024): https://arxiv.org/abs/2406.07706
- DirectLayout (arXiv 2025): no disponible enlace verificado
- VGGT (Visual Geometry Grounded Transformer): https://github.com/facebookresearch/vggt
- FLUX.1: https://github.com/black-forest-labs/flux
- TRELLIS: https://github.com/microsoft/TRELLIS
- Shapely: https://github.com/shapely/shapely
