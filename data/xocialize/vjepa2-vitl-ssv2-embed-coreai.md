# xocialize/VJEPA2-ViTL-SSv2-Embed-CoreAI

## Resumen

V-JEPA 2 ViT-L (SSv2) — Core AI es un export del modelo de Meta `facebook/vjepa2-vitl-fpc16-256-ssv2` (375 millones de parámetros, licencia MIT) realizado por el usuario xocialize. El modelo original es un Vision Transformer de video preentrenado con la arquitectura JEPA (Joint Embedding Predictive Architecture) y ajustado para clasificación de acciones en el dataset Something-Something v2 (SSv2). Este export, empaquetado en formato Core AI (`.aimodel`), añade una segunda salida: además de los logits de clasificación (174 clases de acciones), devuelve un embedding pooled de 1024 dimensiones procedente del attentive pooler. Esta doble salida lo convierte en una herramienta útil tanto para clasificación de video como para extracción de características, especialmente en tareas de enrutado o pre-clasificación de contenido.

La relevancia de este modelo radica en que está optimizado para Apple Silicon mediante el framework Core AI, con latencias medidas de 44 ms por clip de 16 frames en un Apple M5 Max. El autor lo diseñó para un planificador de optimización de video que ajusta una sonda logística sobre el embedding para pre-clasificar contenido antes de una búsqueda de codificación. El bundle incluye oráculos de referencia y un script de exportación reproducible, lo que facilita la verificación de paridad con el modelo original de PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2 ViT-L (Vision Transformer con atención 3D-RoPE) |
| Parametros totales | 375 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de video; entrada de 16 frames a 256×256) |
| Tipos de cuantizacion | fp16 (único formato publicado) |
| Idiomas soportados | no disponible (modelo de video, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | Core AI `.aimodel` (bundle con `metadata.json`, `main.mlirb`, `main.hash`) |

## Arquitectura y entrenamiento

El modelo base es un Vision Transformer de 375 millones de parámetros entrenado con la arquitectura V-JEPA 2 de Meta, que combina un codificador de video con un predictor que opera en el espacio latente (aprendizaje autosupervisado por predicción de representaciones). El checkpoint `vjepa2-vitl-fpc16-256-ssv2` está ajustado para clasificación de acciones en el dataset Something-Something v2, que contiene 174 clases de interacciones mano-objeto. El export de Core AI conserva la estructura completa: backbone, attentive pooler y clasificador lineal.

La exportación incluye dos decisiones técnicas relevantes. Primera, `skip_predictor=True`: se omite la pila del predictor JEPA, que no afecta a los valores de salida pero sí al tamaño del grafo. Segunda, un parche sobre la operación 3D-RoPE `squeeze(-1)`, que el conversor de Core AI no mapea correctamente. El script de exportación resuelve los submódulos por nombre candidato y verifica que la recomposición `classifier(pooler(backbone(x)))` reproduce los logits del modelo original de forma bit-exacta antes de exportar. No se dispone de información detallada sobre el dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Clasificación de acciones en video: devuelve logits para 174 clases de interacciones mano-objeto del dataset Something-Something v2.
- Extracción de características: genera un embedding pooled de 1024 dimensiones, adecuado como señal para tareas de enrutado, búsqueda de similitud o entrenamiento de cabezas ligeras.
- Preprocesamiento específico: requiere 16 frames uniformemente muestreados, redimensionado a 256×256 con aspect-fill y centre-crop, normalización ImageNet y formato `[1,16,3,256,256]` en fp16.
- Compatibilidad con Apple Silicon: empaquetado para Core AI, con inferencia en GPU (medida en Apple M5 Max).
- Paridad verificada: los logits y el embedding del bundle coinciden con el modelo de referencia de PyTorch (coseno > 0.9999).
- Separación semántica de embeddings: contenido idéntico colapsa en representaciones cercanas (coseno 0.987) mientras que contenido distinto se separa (coseno desde 0.146).

## Casos de uso

- Pre-clasificación de contenido para optimización de codificación de video: el embedding de 1024 dimensiones se alimenta a una sonda logística para clasificar escenas antes de una búsqueda de codificación, reduciendo el espacio de búsqueda.
- Indexación y búsqueda de video por similitud: se pueden comparar embeddings de clips para encontrar contenido visualmente similar, por ejemplo para deduplicación o recomendación.
- Clasificación de acciones en tiempo real en dispositivos Apple: con una latencia de 44 ms por clip en M5 Max, es viable para aplicaciones de análisis de video en directo en hardware Apple.
- Moderación de contenido en video: aunque el vocabulario SSv2 está limitado a interacciones mano-objeto, el embedding puede servir para entrenar un clasificador específico de contenido inapropiado.
- Análisis de interacciones humano-objeto en robótica o investigación: las 174 clases de SSv2 cubren acciones como coger, soltar, empujar, etc., útiles para estudios de comportamiento.
- Sistema de enrutado de video en pipelines de procesamiento: el modelo actúa como router que decide qué rama de procesamiento seguir según el tipo de acción detectada, usando el embedding como característica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o top-1 en SSv2) en la información disponible. El autor proporciona métricas de paridad y separación de embeddings, medidas en Apple M5 Max con 128 GB de RAM, en fp16 y GPU:

| Metrica | Valor |
|---|---|
| Tamano del bundle | 708 MB (675 MiB) |
| Tiempo de carga | 0.16 s |
| Forward en caliente (clip de 16 frames) | 44 ms |
| Coseno logits vs oraculo torch | 0.999964 (top-1 coincidente) |
| Coseno embedding vs referencia torch | 0.999940 (relL2 1.1e-02, ruido fp16) |
| Recomputacion `classifier(pooler(backbone(x)))` vs `.logits` | coseno 1.0000000, max abs diff 0 (bit-exacto) |
| Separacion de embeddings (6 clips de senalizacion) | coseno pairwise 0.146 – 0.987 |

## Requisitos de hardware

- El bundle pesa 708 MB, por lo que la VRAM necesaria para inferencia es de aproximadamente 1 GB (modelo fp16) más overhead de activaciones; cabe en cualquier GPU moderna con al menos 2 GB.
- Está diseñado específicamente para Apple Silicon con Core AI; las mediciones se realizaron en un Apple M5 Max con 128 GB de RAM unificada.
- No se indica compatibilidad con GPUs de NVIDIA o AMD; el formato `.aimodel` es propietario de Apple y requiere el runtime `coreai.runtime`.
- Opciones de despliegue: únicamente mediante Core AI (`coreai.runtime` en Python), no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia medida: 44 ms por clip de 16 frames en M5 Max (GPU). En hardware inferior (p. ej., M4 Max) el autor cita 150–180 ms para el bundle de salida única, aunque advierte que son hardware distintos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de clasificación de video o extracción de características. La única referencia directa es el modelo base de Meta:

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| facebook/vjepa2-vitl-fpc16-256-ssv2 | 375M | 16 frames 256×256 | logits (174 clases) | MIT | PyTorch / safetensors |
| xocialize/VJEPA2-ViTL-SSv2-Embed-CoreAI | 375M | 16 frames 256×256 | logits + embedding [1,1024] | MIT | Core AI `.aimodel` |

No se han encontrado alternativas comparables en el ecosistema Core AI con doble salida para video.

## Limitaciones y advertencias

- El modelo es exclusivamente de video; no procesa texto, audio ni otras modalidades.
- El vocabulario de SSv2 está limitado a interacciones mano-objeto; no es un clasificador general de escenas o acciones complejas.
- El bundle no incluye nombres de etiquetas para las 174 clases, solo los logits numéricos.
- El formato `.aimodel` es específico de Apple Core AI; no es portable a otras plataformas sin reconversión.
- El preprocesamiento debe realizarse en el host (el modelo no normaliza internamente); un error en el muestreo de frames o la normalización degrada los resultados.
- El embedding está pensado para tareas de enrutado o pre-clasificación, no como representación semántica universal; su calidad en dominios fuera de SSv2 no está garantizada.
- No se han documentado sesgos específicos del modelo base, pero al estar entrenado en SSv2 puede reflejar sesgos de los vídeos de ese dataset (entornos, objetos, culturas).
- Al ser un modelo discriminativo, no genera texto, por lo que el riesgo de alucinación no aplica; sin embargo, la clasificación puede ser incorrecta en entradas fuera de distribución.
- La licencia MIT permite uso comercial, pero el runtime Core AI está sujeto a las condiciones de Apple.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xocialize/VJEPA2-ViTL-SSv2-Embed-CoreAI
- Modelo base de Meta: https://huggingface.co/facebook/vjepa2-vitl-fpc16-256-ssv2
- Repositorio de V-JEPA 2 (Meta): https://github.com/facebookresearch/jepa (no verificado en la información proporcionada)
