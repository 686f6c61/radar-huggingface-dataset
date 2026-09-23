# TencentARC/GAE-D64-1B

## Resumen

GAE-D64-1B es el conjunto de pesos publicado por TencentARC para GAE-64, un modelo de generación de vídeo basado en un Diffusion Transformer (DiT) temporal de aproximadamente 1.000 millones de parámetros que opera sobre un latente nativo de geometría de 64 canales. El modelo trabaja a una resolución de 672×378 y genera secuencias de V=81 fotogramas, con condicionamiento de cámara métrico mediante Plücker y un codificador de texto Qwen3-0.6B. La arquitectura del transformer se define con `hidden_size=[768, 2048]` y `depth=[28, 6]`.

El repositorio es autocontenido para inferencia de GAE-64: incluye el códec, las estadísticas latentes por canal, las estadísticas a nivel de característica del codificador DA3 y el transformer de flujo (flow transformer). El codificador DA3-GIANT congelado y la cabeza DPT provienen de `depth-anything/DA3-GIANT-1.1`, por lo que no se redistribuyen aquí.

Su relevancia radica en combinar generación de vídeo con control explícito de cámara y una representación latente orientada a geometría, lo que lo sitúa en la intersección entre la generación de vídeo imagen-a-vídeo, texto-a-vídeo y la reconstrucción/nuevas vistas 3D. Es un lanzamiento reciente (creado en septiembre de 2026), sin descargas registradas en el momento de la consulta y con 11 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) temporal; `hidden_size=[768, 2048]`, `depth=[28, 6]` |
| Parametros totales | ~1B (aproximadamente 1.000 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (genera V=81 fotogramas a 672×378; no es un modelo de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el codificador de texto empleado es Qwen3-0.6B) |
| Licencia | no disponible |
| Formato de pesos | safetensors (codec y transformer) y checkpoints PyTorch `.pt` (`gae_64.pt`, `flow_gae64.pt`) |

## Arquitectura y entrenamiento

GAE-64 es un Diffusion Transformer con componente temporal que modela un latente "geometry-native" de 64 canales. La configuración declarada del transformer es `hidden_size=[768, 2048]` y `depth=[28, 6]`, lo que sugiere una estructura de dos bloques o dos escalas con anchuras distintas. La generación de imagen-a-vídeo se realiza mediante integración con 50 pasos Euler y CFG 2, partiendo de una única vista de referencia. El condicionamiento de cámara es métrico y se implementa mediante Plücker embeddings, y la señal textual se inyecta a través de Qwen3-0.6B.

El repositorio incluye los componentes necesarios para la inferencia: el códec (`codec/`, con safetensors y `config.json`), el checkpoint `gae_64.pt` para `gae.load_codec`, las estadísticas latentes por canal en `latent_stats_gae_64.pt`, las estadísticas de normalización a nivel de característica de DA3 en `da3_stats_giant_5ds.tar`, el transformer de flujo (`transformer/`) y el checkpoint `flow_gae64.pt` para `gae.load_flow`. El codificador DA3-GIANT y la cabeza DPT permanecen congelados y se cargan desde `depth-anything/DA3-GIANT-1.1`.

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) con V=81 fotogramas a 672×378.
- Generación de vídeo a partir de texto (text-to-video) usando Qwen3-0.6B como codificador de texto.
- Control de cámara métrico mediante condicionamiento Plücker, lo que permite fijar trayectorias de cámara de forma explícita.
- Latente nativo de geometría de 64 canales, orientado a consistencia geométrica y a la síntesis de nuevas vistas.
- Condicionamiento por vista de referencia única para la generación imagen-a-vídeo.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta razonamiento multi-paso, matemáticas ni generación de código.
- No se documentan capacidades multilingües; el único dato es el codificador de texto Qwen3-0.6B.
- No se documentan modos especiales como thinking mode, audio o visión de entrada más allá de la imagen de referencia.

## Casos de uso

- Generación de vídeo cinematográfico con cámara controlada: gracias al condicionamiento Plücker métrico y a 81 fotogramas por secuencia, se pueden definir movimientos de cámara concretos sobre una imagen base y obtener un plano coherente.
- Síntesis de nuevas vistas para previsualización 3D: el latente de 64 canales orientado a geometría permite explorar ángulos distintos de una escena a partir de una única referencia, útil para previsionados de escenarios.
- Prototipado de planos para producción audiovisual: a partir de un fotograma de referencia y un guion textual, se generan borradores de planos a 672×378 que se pueden revisar antes de rodar.
- Animación de imágenes fijas para catálogos de producto: convertir una fotografía de producto en un clip corto con un movimiento de cámara sutil y controlado.
- Generación de datos sintéticos para entrenamiento de modelos de visión: producir secuencias con parámetros de cámara conocidos (Plücker) para aumentar datasets de depth, pose o reconstrucción.
- Investigación en representaciones latentes geométricas: el pipeline es autocontenido, lo que permite estudiar el códec de 64 canales, las estadísticas latentes y la interacción con las características de DA3-GIANT.
- Realidad aumentada y experiencias volumétricas: la coherencia geométrica y el control de cámara facilitan generar contenido que debe integrarse en un espacio 3D real.
- Evaluación comparativa de transformers de difusión temporales: sirve como referencia de ~1B parámetros para estudiar el efecto del tamaño de latente (64 canales) frente a alternativas de canal reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Nota: el repositorio ocupa 14,8 GB. Las cifras de VRAM siguientes son estimaciones a partir del tamaño del repositorio, el número declarado de parámetros (~1B) y la resolución de generación; no están confirmadas por la model card.

- VRAM estimada en fp16: la carga completa del códec, el transformer de flujo (~1B) y el codificador DA3-GIANT congelado requiere en torno a 15-20 GB solo para pesos; con activaciones, estadísticas latentes y generación de 81 fotogramas a 672×378, es razonable esperar 24 GB o más.
- GPU recomendadas: H100 y A100 (40/80 GB) como opciones holgadas; RTX 4090 o RTX 3090 (24 GB) como mínimo probable en fp16, con riesgo de quedarse justo de memoria.
- GPU de consumo: probablemente ejecutable en RTX 4090/3090 (24 GB) si se fragmenta la carga; en GPUs de 16 GB o menos requeriría cuantización o gestions de memoria fuera del núcleo, algo no documentado.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de pipeline). La vía indicada por el autor es el repositorio de código con `scripts/run_demo.sh` o `scripts/generate.py`, cargando checkpoints PyTorch y safetensors.
- Latencia y throughput: no disponible. Se sabe que la inferencia usa 50 pasos Euler con CFG 2 por secuencia de 81 fotogramas, lo que implica un coste de cómputo notable por generación.

## Comparativa con modelos similares

No se han publicado datos de rendimiento de GAE-D64-1B en la información disponible, por lo que la comparación se limita a datos públicos de los modelos alternativos y a los atributos declarados en esta ficha.

| Modelo | Parametros | Contexto / salida | Control de camara | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GAE-D64-1B | ~1B | V=81 fotogramas a 672×378 | Si (Plücker metrico) | no disponible | HuggingFace (TencentARC) |
| Wan2.1-T2V-1.3B | ~1.3B | resoluciones y longitudes variables | no documentado | Apache 2.0 (segun su documentacion) | HuggingFace |
| CogVideoX-2B | ~2B | clips cortos, resolucion moderada | no documentado | Apache 2.0 (segun su documentacion) | HuggingFace |
| LTX-Video | ~2B | clips a alta velocidad | no documentado | licencia propia (segun su documentacion) | HuggingFace |

Los datos de los modelos alternativos provienen de su documentación pública y pueden variar; no se dispone de comparativas de calidad entre GAE-D64-1B y estos modelos.

## Limitaciones y advertencias

- Licencia no disponible: sin términos publicados, no se puede confirmar el uso comercial. Es un riesgo relevante para cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, consistencia temporal ni fidelidad geométrica frente a alternativas.
- Resolución y longitud fijas: el pipeline documentado genera a 672×378 y V=81 fotogramas; no se documenta soporte de otras resoluciones o duraciones.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir geometría incoherente, artefactos de movimiento o desviaciones respecto a la imagen de referencia y al prompt.
- Idiomas no documentados: no hay información sobre el multilingüismo efectivo; el único dato es que el codificador de texto es Qwen3-0.6B.
- Dependencia externa: la inferencia requiere el codificador DA3-GIANT y la cabeza DPT de `depth-anything/DA3-GIANT-1.1`, lo que añade una dependencia de terceros y VRAM adicional.
- Sesgos: no se documenta ningún análisis de sesgos del modelo ni de los datos de entrenamiento (dataset no especificado).
- Madurez: lanzamiento reciente, con 0 descargas y 11 likes en el momento de la consulta, y sin documentación de entrenamiento (tokens, composición del dataset, RLHF/DPO).
- Adopción en producción: no se documentan integraciones con servidores de inferencia habituales, cuantizaciones ni métricas de latencia, lo que complica el dimensionado de costes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TencentARC/GAE-D64-1B
- Codificador DA3-GIANT: https://huggingface.co/depth-anything/DA3-GIANT-1.1
- Repositorio de código de GAE: referenciado en la model card mediante `scripts/run_demo.sh` y `scripts/generate.py`, pero sin URL explícita en la información disponible.
- Paper, blog o demo: no disponible en la información proporcionada.
