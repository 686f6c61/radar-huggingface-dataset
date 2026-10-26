# Yusin/ReTokenGS-dens

## Resumen

ReTokenGS-dens es un modelo *feed-forward* de reconstrucción 3D y síntesis de vistas nuevas (*novel view synthesis*) publicado por el usuario Yusin en HuggingFace bajo licencia Apache-2.0. No es un modelo de lenguaje: recibe cuatro vistas de entrada con pose conocida a 256×256 píxeles y produce un conjunto de tokens gaussianos que pueden renderizarse desde cámaras arbitrarias. Los pesos suman 366.965.176 parámetros (1,5 GB en `safetensors`) y se construyen sobre los proyectos LocusGS y TokenGS.

La innovación es la densificación bajo demanda: un decodificador con una única capa compartida por pesos que se aplica 12 rondas, con realimentación del gradiente de render por token. Tras cada ronda, los tokens cuyas gaussianas reciben gradientes posicionales grandes se dividen en hijos con corrección de opacidad, de modo que el presupuesto de tokens crece por escena desde 1024 hasta un tope de 4096 que nunca se utilizó durante el entrenamiento.

Es relevante porque mejora la línea base LocusGS en el benchmark oficial de DL3DV (140 escenas, 4 vistas, 256×256) sin reentrenar para el tope: 25,113 dB de PSNR y 0,2427 de LPIPS con 4096 tokens, frente a 24,154 dB y 0,2766 del `base` con 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *feed-forward* con tokens gaussianos y decodificador recurrente de una sola capa compartida por pesos (12 rondas), con realimentación del gradiente de render |
| Parametros totales | 366.965.176 (367 M) |
| Parametros activos | no aplica (no es MoE; la misma capa se reutiliza en las 12 rondas) |
| Longitud de contexto | no aplica: no es un modelo de texto. Entrada fija de 4 vistas con pose a 256×256 y presupuesto de tokens gaussianos entre 1024 y 4096 |
| Tipos de cuantizacion | no disponible; solo se publican pesos en `safetensors` (1,5 GB para 366,9 M de parámetros, coherente con precisión de 32 bits) |
| Idiomas soportados | no aplica (modelo de visión y reconstrucción 3D) |
| Licencia | Apache-2.0 (derivada de LocusGS y TokenGS) |
| Formato de pesos | `safetensors` (`model.safetensors`, media de los cinco últimos checkpoints) |
| Resolucion de entrada | 256×256, 4 vistas con pose conocida |
| Presupuesto de tokens | 1024 iniciales, ampliable hasta 4096 en inferencia |
| Dataset de entrenamiento | DL3DV/DL3DV-10K |
| Checkpoint publicado | Media de los epochs 44–64 (5 últimos checkpoints) |

## Arquitectura y entrenamiento

La arquitectura hereda el esquema de LocusGS/TokenGS: un codificador que convierte las cuatro vistas con pose en un conjunto inicial de 1024 tokens gaussianos y un decodificador recurrente en el que una única capa transformer, compartida por pesos, se aplica 12 rondas. En cada ronda el modelo recibe como señal el gradiente de render calculado por token, lo que actúa como realimentación local para refinar la geometría y la apariencia de cada gaussiana.

La variante `dens` añade un paso de *split* después de cada ronda: los tokens cuyas gaussianas acumulan gradientes posicionales grandes se dividen en hijos con opacidad corregida, de forma que el número de tokens crece de manera adaptativa por escena. El modelo se entrena con umbral τ = 5,4e-5, que produce aproximadamente 1650 tokens por escena, pero el mismo mecanismo permite seguir densificando en inferencia hasta 4096 tokens (`DENS_TAU=3.4e-6`, `DENS_MAX_TOKENS=4096`), un régimen no visto en entrenamiento. El entrenamiento se realizó sobre DL3DV-10K; la model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste adicionales. No hay RLHF ni DPO: no es un modelo generativo de lenguaje.

## Capacidades

- Reconstrucción 3D *feed-forward* a partir de 4 vistas con pose conocida, sin optimización por escena en tiempo de inferencia.
- Síntesis de vistas nuevas (*novel view synthesis*) desde poses de cámara arbitrarias dentro del volumen reconstruido.
- Representación intermedia explícita como gaussianas 3D, renderizable y potencialmente exportable a otros *rasterizers* de *splatting*.
- Densificación adaptativa: el número de tokens se ajusta por escena según el gradiente de render, con un rango operativo de 1024 a 4096.
- Control fino del compromiso calidad/coste mediante los hiperparámetros `DENS_TAU` y `DENS_MAX_TOKENS` en tiempo de inferencia.
- No soporta *tool calling*, agentes, razonamiento multi-paso, capacidades multilingües ni entrada de texto.

## Casos de uso

- **Catalogación de producto en comercio electrónico**: a partir de cuatro fotos tomadas con una guía de captura y poses calibradas, el modelo genera una representación 3D que permite renderizar el artículo desde cualquier ángulo para fichas interactivas, evitando sesiones de fotografía adicionales.
- **Visualización inmobiliaria**: con cuatro imágenes de una estancia o fachada y sus poses, se producen recorridos con vistas sintetizadas; el coste es una única pasada *feed-forward* en lugar de un ajuste por escena de minutos u horas.
- **Aumentación de datos para visión por computador**: el modelo actúa como generador de vistas y poses etiquetadas de forma exacta, útil para ampliar datasets de detección o segmentación con cámaras que no aparecen en la captura original.
- **Previsualización en pipelines de VFX y animación**: reconstrucción rápida de *blocking* a partir de cuatro *stills* de referencia para decidir encuadres antes de un modelado manual, aceptando la resolución de 256×256 como vista previa.
- **Inspección de edificios y terrenos con dron**: DL3DV-10K está compuesto por escenas reales, muchas de exterior, por lo que el modelo encaja en la reconstrucción rápida de cuatro fotogramas aéreos para revisión preliminar de estado de estructuras.
- **Investigación en representaciones 3D**: sirve como *baseline* reproducible para estudiar densificación adaptativa de tokens; la comparación entre τ = 5,4e-5 (≈1650 tokens) y `DENS_TAU=3.4e-6` con 4096 tokens cuantifica directamente la ganancia de calidad por token adicional.
- **Generación de activos para simulación y robótica**: esplats reconstruidos desde cuatro vistas pueden importarse en entornos simulados para aumentar la variedad visual de escenarios de entrenamiento de políticas.

## Benchmarks y rendimiento

Evaluación oficial de DL3DV: 140 escenas, 4 vistas de entrada, 256×256 de resolución.

| Modelo / configuracion | Tokens en R12 | PSNR ↑ | LPIPS ↓ | SSIM ↑ |
|---|---|---|---|---|
| LocusGS stage 1, pesos `base` | 1024 | 24,154 | 0,2766 | 0,7805 |
| ReTokenGS-grad | 1024 | 24,744 | 0,2648 | 0,7922 |
| ReTokenGS-dens, umbral de entrenamiento τ = 5,4e-5 | ≈1650 | 24,878 | 0,2603 | 0,7956 |
| ReTokenGS-dens, `DENS_TAU=3.4e-6 DENS_MAX_TOKENS=4096` | 4096 | 25,113 | 0,2427 | 0,8040 |

No se han publicado resultados de latencia, throughput ni consumo de memoria en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos ocupan aproximadamente 1,47 GB en 32 bits (367 M de parámetros). No hay medición oficial del pico de memoria en inferencia; una estimación conservadora para 4 vistas a 256×256 con 4096 tokens se sitúa en el rango de 4–8 GB, pero debe validarse empíricamente.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar el modelo; una RTX 4090 o A100 aportan margen para lotes mayores o para densificar por encima del tope de 4096. No hay datos publicados de rendimiento por GPU.
- **GPU de consumo**: sí, es plausible en RTX 3060 12 GB, RTX 4070 y superiores por el tamaño del modelo; el cuello de botella previsible no es el peso sino las activaciones de las 12 rondas recurrentes y el número de tokens gaussianos.
- **Opciones de despliegue**: no hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autorregresivo. El despliegue se realiza con PyTorch usando el código de GitHub `Yusin2Chen/TokenGS-Loop`, rama `dens`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | PSNR (DL3DV, 4 vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-dens (este) | 367 M | 4 vistas con pose, 256×256, hasta 4096 tokens | 25,113 (4096 tokens) / 24,878 (≈1650) | Apache-2.0 | HuggingFace + GitHub rama `dens` |
| ReTokenGS-grad | no disponible | 4 vistas con pose, 256×256, 1024 tokens | 24,744 | Apache-2.0 (según el autor) | HuggingFace `Yusin/ReTokenGS-grad` |
| LocusGS stage 1 `base` | no disponible | 4 vistas con pose, 256×256, 1024 tokens | 24,154 | Apache-2.0 (upstream) | Repositorio LocusGS |
| MVSplat / pixelSplat | no disponible | 2 vistas con pose, resolución variable | no disponible en la información proporcionada | no disponible | no disponible |

La comparación con modelos *feed-forward* de *splatting* de otras familias (MVSplat, pixelSplat) no puede cuantificarse con los datos disponibles, ya que la model card solo reporta el benchmark de DL3DV frente a la línea LocusGS.

## Limitaciones y advertencias

- **Resolución baja**: entrenamiento y evaluación se realizan a 256×256; no hay evidencia de comportamiento a 512×512 o superior, y el escalado directo puede degradar la calidad.
- **Dependencia de poses**: requiere exactamente 4 vistas con pose de cámara conocida. No acepta una sola imagen, vídeo sin calibrar ni nubes de puntos.
- **Alucinación geométrica**: las regiones no cubiertas por las cuatro vistas se completan de forma plausible pero no veraz; son esperables artefactos flotantes, gaussianas alargadas y superficies inventadas en oclusiones.
- **Sesgo de dominio**: entrenado únicamente con DL3DV-10K, mayoritariamente escenas reales. El rendimiento en objetos aislados, interiores muy densos, escenas sintéticas o material especular fuerte no está documentado.
- **Extrapolación en el tope de tokens**: los 4096 tokens nunca se usaron en entrenamiento; la mejor cifra depende de hiperparámetros de inferencia ajustados manualmente (`DENS_TAU=3.4e-6`), no de los valores de entrenamiento.
- **Checkpoint promediado**: `model.safetensors` es la media de los epochs 44–64, sin información sobre la varianza entre checkpoints ni sobre la curva de validación completa.
- **Licencia y atribución**: Apache-2.0, pero el modelo deriva de LocusGS y TokenGS; conviene revisar y conservar los avisos de licencia de los proyectos upstream antes de un uso comercial.
- **Madurez**: 0 descargas, 0 *likes*, sin *pipeline* declarado en HuggingFace ni demo pública; la reproducibilidad depende del código de una rama concreta de GitHub.
- **Sin capacidades de lenguaje**: no admite *prompts* de texto, instrucciones, *tool calling* ni conversación; cualquier uso en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yusin/ReTokenGS-dens
- Variante previa del autor: https://huggingface.co/Yusin/ReTokenGS-grad
- Código, evaluación y comandos de entrenamiento: https://github.com/Yusin2Chen/TokenGS-Loop/tree/dens
- Repositorio LocusGS: https://github.com/leo-frank/LocusGS
- Repositorio TokenGS (NV-TLabs): https://github.com/nv-tlabs/TokenGS
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a mercados de modelos generativos de imagen y detectores de imágenes sintéticas, sin relación con ReTokenGS.
