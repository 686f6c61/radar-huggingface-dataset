# YunzeLiu/roborag-x-v5-four-domain-step11719

## Resumen

RoboRAG-X v5 four-domain es un modelo de embedding multimodal orientado a robótica, desarrollado por Yunze Liu (investigador afiliado a la Universidad de Tsinghua). Este checkpoint intermedio (paso 11,719 de entrenamiento) está entrenado sobre cuatro dominios nativos de Cosmos3: EgoDex, DROID, LIBERO y RoboMIND-Franka-Dual. Su propósito principal es la recuperación multimodal de vídeo de 4 segundos estrictamente futuro y servir como encoder congelado para la inicialización de la rama `caip_downstream_policy` del proyecto VLA2Vec.

El modelo fusiona una consulta compuesta por instrucción, acción actual sincronizada y una imagen de interacción SAM3, para predecir un objetivo formado por instrucción, vídeo futuro de 16 frames y acción futura. Con 3.373 millones de parámetros y una anchura de embedding de 1024, este checkpoint se publica como instantánea de entrenamiento en curso, no como modelo convergido. Su relevancia radica en que permite comparaciones controladas con el enfoque CAIP usando tokens Cosmos3 densos nativos, en un momento donde la recuperación multimodal para políticas robóticas es un área activa de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con proyección de embeddings (no se especifica la arquitectura base exacta; la lectura se toma de la capa 28) |
| Parametros totales | 3.373.855.425 |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | No disponible (el modelo procesa vídeo de 16 frames y consultas multimodales, pero no se especifica el contexto en tokens) |
| Tipos de cuantizacion | No disponible (el checkpoint se publica en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | openmdw1.1-license (https://openmdw.ai/license/1-1/) |
| Formato de pesos | PyTorch checkpoint (`.pt`), dtype bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con salida de embedding denso de 1024 dimensiones. La lectura de los estados densos se realiza en la capa 28 del generador, seguida de un RMSNorm final y una proyección compartida sobre los slots de acción nativos. El modelo procesa por cámara imágenes RGB de 192×320 que producen 60 tokens densos (6×10) tras la compresión espacial del VAE sellado (16×) y el parcheado latente (2×). Con tres cámaras, genera 180 tokens densos reales más un token de resumen conjunto por consulta.

El entrenamiento sigue un contrato sellado de muestreo de dominios `4:2:2:2` (EgoDex:DROID:LIBERO:RoboMIND), aunque la continuación operativa en el momento de la publicación usa pesos dinámicos `20:10:35:35` para compensar el infra-entrenamiento en LIBERO y RoboMIND. El checkpoint incluye un VAE congelado excluido y no contiene estado de optimizador. La fusión de consulta combina instrucción, acción actual nativa sincronizada y una imagen de zoom de interacción vinculada a la tarea; el objetivo es la instrucción más un vídeo de 16 frames a 4 segundos en el futuro y la acción futura a tasa nativa.

## Capacidades

- Recuperación multimodal de vídeo: recupera ventanas de vídeo de 4 segundos estrictamente futuras en galerías de hasta 2.000 ventanas por dominio.
- Embedding denso multimodal: genera representaciones densas de 1024 dimensiones a partir de vídeo, instrucciones y acciones.
- Inicialización congelada para políticas downstream: puede usarse como encoder congelado en la rama `caip_downstream_policy` de VLA2Vec, comparando con CAIP.
- Soporte multi-cámara: procesa tres cámaras simultáneamente, produciendo 180 tokens de visión densa reales.
- Integración de acción nativa: acepta acciones de 57 dimensiones (EgoDex) y coordenadas de alineación Cosmos3 para crear un scaffold estructural de 64 dimensiones.
- Sin capacidad de generación de texto o código: es exclusivamente un modelo de extracción de características (`pipeline_tag: feature-extraction`).

## Casos de uso

- Recuperación de experiencia robótica: el modelo puede buscar en galerías de episodios robóticos el segmento de vídeo de 4 segundos que sigue a una instrucción y acción actuales, facilitando la reutilización de demostraciones para aprendizaje por imitación.
- Inicialización de políticas VLA: como encoder congelado en la rama `caip_downstream_policy` de VLA2Vec, permite comparar embeddings densos Cosmos3 nativos con los tokens ViT-L/16 de CAIP sin padding artificial.
- Benchmarking de recuperación por dominio: con métricas exactas de pares de ventanas (R@1, R@5, R@10, MRR) en los dominios EgoDex, DROID, LIBERO y RoboMIND, sirve para evaluar la capacidad de recuperación de vídeo en robótica.
- Ablación de capas intermedias: la capa 14 está disponible como ablación de sensibilidad explícita, permitiendo estudiar qué profundidad de representación es óptima para recuperación de vídeo robótico.
- Investigación de fusión multimodal: el diseño de fusión (instrucción + acción + imagen de zoom) permite experimentar con esquemas de consulta multimodal para recuperación.
- Auditoría de reproducibilidad: el checkpoint incluye recibos de hash (sha256), manifiestos de ejecución y configuraciones selladas, útil para trabajos que requieran reproducibilidad estricta en entornos de investigación.

## Benchmarks y rendimiento

Se han publicado resultados de recuperación para el checkpoint **step-10000** (no para este step-11719), evaluado en test-v1 con 1.000 consultas, 800 episodios de consulta y 2.000 ventanas de galería por dominio:

| Metric | R@1 | R@5 | R@10 | MRR |
|---|---:|---:|---:|---:|
| Exacto, galería global | 44.525% | 89.225% | 95.825% | 0.6392 |
| Episodio, galería global | 76.828% | 92.641% | 97.266% | 0.8305 |

Estos números son del checkpoint step-10000 y se incluyen solo como procedencia del autor. No deben etiquetarse como resultados del step-11719 ni como tasas de éxito de la política downstream. No hay datos de benchmarks para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: no se especifica; el checkpoint pesa 6,8 GB en bfloat16, lo que sugiere un mínimo de 8-10 GB de VRAM para inferencia básica con precisión completa, aunque el modelo es multimodal y puede requerir más por el procesamiento de vídeo.
- GPU recomendadas: se menciona un entorno de entrenamiento con GPU completa; para el downstream se usa un "full-GPU frozen-encoder" con política Qwen3.5, lo que implica GPUs de alta gama (A100, H100 o similares) para el entrenamiento conjunto.
- En consumer GPU: no es claro; el modelo de 3.400 millones de parámetros en bfloat16 puede caber en una RTX 4090 (24 GB) para inferencia simple, pero el procesamiento de vídeo multi-cámara y la política downstream probablemente excedan los límites de consumer.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama o TGI. El modelo está diseñado para cargarse con el cargador estricto de VLA2Vec, no con herramientas de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (embeddings multimodales para recuperación robótica con tokens Cosmos3). El propio autor menciona CAIP como alternativa con tokens ViT-L/16 de 256 por cámara, pero no se proporcionan datos de rendimiento de CAIP en este contexto. Por tanto, la comparativa queda limitada a la arquitectura interna: RoboRAG-X usa 60 tokens densos por cámara y 180 tokens en total, frente a los 256 tokens de CAIP por cámara.

## Limitaciones y advertencias

- Checkpoint intermedio: es una instantánea en el paso 11.719 con solo el 44,6% de una época de cobertura completa; no se reclama convergencia total y el entrenamiento continúa.
- Resultados de benchmark: los únicos datos de recuperación son del checkpoint step-10000 y no deben extrapolarse al step-11719.
- Sin VAE congelado incluido: el checkpoint no contiene el VAE de Cosmos3 ni los activos base; es necesario descargarlos externamente para el uso completo.
- Carga estricta: no se debe usar `torch.load` parcial; requiere el cargador específico de VLA2Vec y la verificación de hashes.
- Licencia openmdw1.1: debe revisarse el texto completo de la licencia para conocer restricciones comerciales; el modelo está etiquetado con `region:us`.
- Sin soporte de generación de texto: es exclusivamente un modelo de extracción de características; no es adecuado para tareas de chat, código o generación libre.
- Sesgos y alucinación: no se han evaluado sesgos; al ser un modelo de recuperación, el riesgo de alucinación es menor, pero la calidad de la recuperación depende de la galería de datos.

## Enlaces

- HuggingFace: https://huggingface.co/YunzeLiu/roborag-x-v5-four-domain-step11719
- Perfil del autor en HuggingFace: https://huggingface.co/YunzeLiu
- Repositorio VLA2Vec (rama `caip_downstream_policy`): https://github.com/yunzeliu/VLA2Vec/commit/e2e4f9097280865c40934b29d4ca8520c02af555
- Página personal del autor: https://yunzeliu.github.io/index.html
- Licencia openmdw1.1: https://openmdw.ai/license/1-1/
