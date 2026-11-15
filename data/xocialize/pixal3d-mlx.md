# xocialize/pixal3d-mlx

## Resumen

Pixal3D para MLX es una conversión del modelo TencentARC/Pixal3D (presentado en SIGGRAPH 2026) al framework MLX de Apple, realizada por el usuario xocialize. Se trata de un artefacto de pipeline para la librería `mlx-trellis2-swift` v0.13.0 en su "modo Pixal3D", no de una distribución general del modelo. El modelo resuelve la generación de mallas 3D texturizadas a partir de una única imagen de entrada, condicionando los flujos de proyección por retroproyección de las características de imagen a través de una cámara sobre cada vóxel.

Técnicamente, Pixal3D es TRELLIS.2 con sus tres modelos de flujo reentrenados para usar retroproyección de características con condicionamiento de cámara. Los decodificadores, el acondicionador de imagen DINOv3 y la normalización latente provienen de TRELLIS.2 y se distribuyen por separado en `xocialize/trellis2-mlx`. Este repositorio contiene únicamente los cuatro flujos (estructura dispersa, forma en dos pasadas y textura) más el upsampler NAF, con un tamaño total de 11 GB.

La relevancia de esta conversión radica en que permite ejecutar generación image-to-3D de alta calidad (resoluciones de 1024 y 1536) sobre Apple Silicon mediante MLX, un ecosistema con soporte limitado para modelos 3D generativos. La paridad con los goldens CUDA del modelo original está verificada a nivel de coseno (0.995-0.99994 en los muestreadores, F-score de malla de 0.98-0.99 a un vóxel).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo con condicionamiento por retroyección de cámara (basada en TRELLIS.2) |
| Parametros totales | Aproximadamente 1.3B por flujo (etiqueta `dit_1_3B` en los checkpoints); cuatro flujos más NAF de 0.66 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | bf16 para los flujos; fp32 para NAF; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo image-to-3D, sin entrada de texto) |
| Licencia | MIT (modelo y código Pixal3D, © 2026 Tencent); NAF bajo Apache-2.0; DINOv3 bajo DINOv3 License con acceso restringido |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pixal3D parte de la arquitectura TRELLIS.2 (DiT de difusión por flujo con estructura dispersa y representación latente SLAT) y reentrena sus tres modelos de flujo para que las características de imagen se retroproyecten a través de una cámara sobre cada vóxel. La conversión a MLX mantiene los nombres de módulo del paquete (`cross_attn.cross_attn_block.*` pasa a `cross_attn.*`, `proj_linear` se conserva) y descarta el buffer complejo `rope_phases` del flujo de estructura, que se calcula en tiempo de ejecución.

Los pesos se convirtieron desde `TencentARC/Pixal3D` en la revisión `b0cb2e1b`, pasando de fp32 en disco a almacenamiento bf16 para los flujos; NAF permanece en fp32 con sus claves de PyTorch. El pipeline consta de cuatro flujos: estructura dispersa (`ss_flow_img_dit_1_3B_64_bf16`), forma en cascada a 512 y 1024 (`slat_flow_img2shape_dit_1_3B_512/1024`) y textura (`slat_flow_imgshape2tex_dit_1_3B_1024`). El acondicionador de imagen es DINOv3, distribuido aparte. No se publican detalles sobre el dataset de entrenamiento, número de tokens ni si hubo ajuste por RLHF/DPO en la información disponible. Los flujos multivista con pose (`_mv`) están portados pero no publicados: sus muestreadores alcanzan coseno 0.988 frente al umbral de paridad de 0.99.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una única imagen (single view).
- Control de campo de visión horizontal en la entrada (por defecto 20 grados, parámetro `pixal3dFovDegrees`).
- Salida de malla en el sistema de coordenadas de la cámara de la foto, rotada a Z-up.
- Pipeline en cascada a dos niveles de resolución: `res1024` y `res1536`.
- Estimación de estructura dispersa, forma y textura mediante flujos de difusión separados.
- Uso del upsampler NAF para el reescalado de características.
- No soporta entrada de texto, tool calling, agentes ni capacidades multilingües: es un modelo image-to-3D puro.
- No incluye los flujos multivista con pose en esta versión.

## Casos de uso

- Generación de assets 3D para videojuegos indie: a partir de un concepto 2D o una foto de referencia, el pipeline produce una malla texturizada a resolución 1024 o 1536 directamente utilizable en motores como Unity o Unreal tras retopología.
- Prototipado rápido de producto en Apple Silicon: un desarrollador con un MacBook Pro M3 Max o superior puede iterar sobre modelos 3D de objetos sin depender de GPU NVIDIA ni servicios en la nube, ajustando el FOV para controlar la fidelidad geométrica.
- Reconstrucción de objetos para comercio electrónico: fotografiar un producto y obtener una malla texturizada para visores 3D web, aprovechando el condicionamiento por retroproyección que preserva texturas de la imagen original.
- Escaneo y digitalización de patrimonio: a partir de una única fotografía de una pieza arqueológica o escultura, generar una representación 3D para catalogación y difusión, con la F-score de 0.98-0.99 a un vóxel como referencia de fidelidad geométrica.
- Desarrollo de plugins de diseño 3D: integrar `mlx-trellis2-swift` en herramientas de modelado para convertir bocetos o renders 2D en mallas base que el artista refine, reduciendo el modelado desde cero.
- Investigación en generación 3D: servir como artefacto de referencia para reproducir resultados de Pixal3D en MLX, con paridad verificada frente a los goldens CUDA (`f7cf384`) en acondicionamiento (coseno 0.999999) y NAF (1.000000).
- Previsualización en apps de realidad aumentada: generar mallas ligeras a partir de fotos para su visualización en dispositivos Apple mediante la integración con el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje. Los únicos datos de rendimiento documentados son las métricas de paridad:

| Etapa | Métrica | Valor |
|---|---|---|
| Acondicionamiento | Coseno frente a goldens CUDA | 0.999999 |
| Salida NAF | Coseno frente a goldens CUDA | 1.000000 |
| Muestreadores | Coseno frente a goldens CUDA | 0.995–0.99994 |
| Malla (topología del oráculo inyectada) | F-score a un vóxel | 0.98–0.99 |
| Flujos multivista (no publicados) | Coseno frente a umbral de paridad | 0.988 vs 0.99 |

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio ocupa 11 GB en disco y los flujos se almacenan en bf16, por lo que se requiere al menos ese orden de memoria unificada, más la del acondicionador DINOv3 de `xocialize/trellis2-mlx`.
- GPU recomendadas: Apple Silicon (MLX), presumiblemente chips M-series con memoria unificada amplia; no se especifican modelos ni configuraciones mínimas.
- Compatibilidad con GPU de consumidor: diseñado para Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Opciones de despliegue: exclusivamente mediante la librería `mlx-trellis2-swift` v0.13.0 o superior, con `Trellis2Configuration`, `weightsRootOverride` y `pixal3dWeightsDir`. No se contemplan vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros por flujo | Contexto | Resolución de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xocialize/pixal3d-mlx | Aproximadamente 1.3B (4 flujos) | No aplica | 1024 / 1536 | MIT (DINOv3 aparte) | Hugging Face, MLX |
| TencentARC/Pixal3D | Aproximadamente 1.3B (4 flujos) | No aplica | 1024 / 1536 | MIT | Hugging Face, PyTorch |
| xocialize/trellis2-mlx | Aproximadamente 1.3B (decodificadores y DINOv3) | No aplica | No disponible | Sujeta a DINOv3 License | Hugging Face, MLX |

La comparativa se limita a las variantes del propio linaje TRELLIS.2/Pixal3D presentes en la información disponible; no se dispone de datos de otros modelos image-to-3D comparables.

## Limitaciones y advertencias

- Es un artefacto de pipeline, no una distribución general: requiere obligatoriamente la librería `mlx-trellis2-swift` v0.13.0 o superior y el snapshot complementario `xocialize/trellis2-mlx` para los decodificadores y DINOv3.
- No incluye DINOv3: el acondicionador se distribuye aparte bajo la DINOv3 License con acceso restringido, lo que condiciona el uso comercial del pipeline completo.
- Solo soporta vista única; los flujos multivista con pose (`_mv`) no están publicados por no alcanzar el umbral de paridad (coseno 0.988 frente a 0.99).
- La licencia del repositorio es MIT, pero la nota del autor sobre la licencia upstream es una interpretación de los textos publicados, no asesoramiento legal: la model card original de TencentARC/Pixal3D aún conserva un campo `extra_gated_eu_disallowed` de su primera licencia académica.
- NAF está bajo Apache-2.0, lo que añade una obligación de atribución adicional.
- Riesgo de alucinación geométrica y de textura inherente a los modelos generativos: la fidelidad está verificada frente a goldens del propio modelo (F-score 0.98-0.99), no frente a verdad terreno del mundo real.
- Sin soporte de texto, agentes ni tool calling; no apto para tareas de lenguaje.
- No se documentan sesgos, idiomas ni datos de entrenamiento, lo que dificulta evaluar su comportamiento en dominios alejados de la distribución de entrenamiento.
- Sin métricas de latencia ni de consumo de memoria publicadas: la planificación de producción requiere pruebas empíricas en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xocialize/pixal3d-mlx
- Modelo base: https://huggingface.co/TencentARC/Pixal3D
- Snapshot complementario TRELLIS.2 para MLX: https://huggingface.co/xocialize/trellis2-mlx
- Librería de inferencia: https://github.com/xocialize/mlx-trellis2-swift
- Upsampler NAF: https://github.com/valeoai/NAF
