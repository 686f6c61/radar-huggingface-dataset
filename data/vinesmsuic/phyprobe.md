# vinesmsuic/PhyProbe

## Resumen

PhyProbe es un modelo de clasificación de vídeo diseñado para puntuar la consistencia física de vídeos generados por IA. Lo desarrolla un equipo vinculado a NVIDIA Research (Cosmos Lab) y se publica en NeurIPS 2026. El modelo no genera vídeo: actúa como evaluador automático que asigna una puntuación entre 0.0 y 1.0, donde valores altos indican violaciones físicas más graves (objetos que flotan, líquidos que se comportan de forma imposible, colisiones incoherentes, etc.). Resuelve un problema clásico de los pipelines de generación de vídeo: la falta de métricas automáticas fiables para medir la plausibilidad física, una dimensión que las métricas perceptuales tradicionales no capturan.

Arquitectura: un backbone de visión congelado (PE-Core-G14-448, de Meta) más una cabeza de regresión ligera entrenada específicamente para esta tarea. El checkpoint publicado en el Hub contiene únicamente los pesos de esa cabeza (~4 MB); el backbone (~9 GB) se descarga aparte. La entrada es un clip de 48 fotogramas remuestreados a 16 fps y redimensionados a 480×480.

Es relevante ahora porque el ecosistema de generación de vídeo (Sora, Cosmos, Veo, etc.) necesita evaluadores automáticos que correlacionen con el juicio humano sobre física, y PhyProbe se presenta como una alternativa ligera y de código abierto (licencia MIT) frente a evaluadores propietarios o costosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de visión congelado PE-Core-G14-448 + cabeza MLP (3840 → 256 → 128 → 1) con pooling temporal (mean/std/max) |
| Parametros totales | No disponible (la cabeza es de ~4 MB; el backbone PE-Core-G14-448 es de ~9 GB, pero no se indica el número de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrada de 48 fotogramas a 16 fps (clip de ~3 s por defecto en entrenamiento) |
| Tipos de cuantizacion | No disponible (el backbone se usa en bf16 según la model card) |
| Idiomas soportados | No disponible (modelo de vídeo, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `pecore_paper.pt` (PyTorch); backbone descargado vía `perception_models` |
| Entrada | 48 fotogramas, 16 fps, letterbox a 480×480 |
| Salida | Puntuación escalar [0.0, 1.0] de severidad de violación física |
| Librería | `phyprobe` (Python >= 3.10) |

## Arquitectura y entrenamiento

PhyProbe combina un backbone de percepción visual congelado (PE-Core-G14-448, un ViT de Meta con parche 14 y resolución 448) con una cabeza de regresión entrenada. Para cada fotograma se extraen características del backbone; estas se agregan temporalmente mediante tres estadísticos (media, desviación estándar y máximo), produciendo un vector de 3840 dimensiones que pasa por un MLP de tres capas (3840 → 256 → 128 → 1) que emite la puntuación de severidad.

El entrenamiento usa una combinación de pérdida Bradley–Terry por pares (para aprender ordenaciones relativas de calidad física) y regresión Huber, durante 10.000 pasos. La ventana de entrenamiento es de 3 segundos (48 fotogramas a 16 fps), aunque en inferencia se pueden muestrear 48 fotogramas a lo largo de todo el vídeo o restringirse a los primeros 3 s con `clip_sec=3.0`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica en un evaluador de este tipo).

## Capacidades

- Puntuación de plausibilidad física de vídeos generados por IA en una escala continua [0.0, 1.0].
- Detección de violaciones físicas: comportamiento anómalo de fluidos, objetos que flotan o atraviesan superficies, colisiones incoherentes, deformaciones no físicas.
- Evaluación de clips completos (muestreo de 48 fotogramas distribuidos) o de ventanas cortas (`clip_sec`).
- Clasificación de vídeo como tarea principal (`pipeline_tag: video-classification`).
- Uso como métrica automática en pipelines de evaluación de modelos generativos de vídeo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No es un modelo multilingüe ni procesa audio.

## Casos de uso

- Evaluación automática de modelos de generación de vídeo: integrar PhyProbe como métrica de física en el ciclo de evaluación de un generador (p. ej. comparar dos checkpoints y medir cuál produce menos violaciones físicas) gracias a su salida escalar continua.
- Filtrado de datasets sintéticos: descartar clips generados con puntuaciones altas de violación física antes de usarlos para entrenar o fine-tunear otros modelos.
- Benchmarking interno de proveedores de vídeo: puntuar lotes de clips de distintos generadores (Sora, Cosmos, Veo, modelos open source) y construir una tabla comparativa objetiva.
- Control de calidad en producción de contenido: en un pipeline de creación de vídeo publicitario o divulgativo, marcar automáticamente clips que requieran regeneración por incoherencias físicas.
- Investigación en percepción física: usar la puntuación como señal para analizar qué tipos de escenas (líquidos, colisiones, manipulación de objetos) fallan más en los generadores actuales.
- Detección de vídeo sintético de baja calidad: como señal auxiliar para distinguir clips generados con artefactos físicos frente a grabaciones reales, combinada con otros detectores.
- Selección de mejores candidatos (best-of-N): dado un generador que produce varias muestras por prompt, elegir la de menor puntuación de violación física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el backbone PE-Core-G14-448 (~9 GB de pesos) en bf16 requiere en torno a 9-12 GB de VRAM para inferencia; la cabeza añade ~4 MB. No se dispone de cifras oficiales de consumo medido.
- GPU recomendadas: cualquier GPU con al menos ~12-16 GB de VRAM para ejecutar el backbone en bf16 (RTX 4090, A100, H100, L40S). No se especifican requisitos mínimos oficiales.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 16 GB o más (RTX 4080/4090, RTX 3090), aunque no está confirmado en la información disponible.
- Despliegue: paquete Python `phyprobe` (pip) más `perception_models` de Facebook Research; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El coste dominante es el paso del backbone ViT sobre 48 fotogramas por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhyProbe | Evaluador de física en vídeo | 48 fotogramas, 480×480 | Score [0,1] | MIT | Hugging Face + pip |
| Métricas perceptuales de vídeo (FVD, LPIPS) | Métricas de calidad | Clips de vídeo | Distancia/escalar | Varía | Librerías estándar |
| Evaluadores VLM genéricos (p. ej. GPT-4V como juez) | VLM | Fotogramas o vídeo | Texto/juicio | Propietaria | API |
| Detectores de vídeo sintético | Clasificador binario | Fotogramas | Real/falso | Varía | Varía |

No se dispone en la información proporcionada de comparaciones cuantitativas con alternativas específicas de evaluación de plausibilidad física.

## Limitaciones y advertencias

- La puntuación es relativa a la distribución de entrenamiento; puede no generalizar a dominios visuales muy distintos (animación estilizada, vídeo médico, escenas nocturnas).
- El backbone está congelado: la calidad depende enteramente de las características de PE-Core-G14-448 y de la cabeza entrenada con 10.000 pasos.
- La ventana de entrenamiento es de 3 s; evaluar clips completos mediante muestreo de 48 fotogramas puede perder violaciones localizadas entre fotogramas muestreados.
- Riesgo de falsos positivos en escenas con física intencionadamente exagerada (efectos especiales, animación).
- No detecta contenido inapropiado, sesgos sociales ni calidad estética; solo consistencia física.
- No hay información publicada sobre sesgos demográficos o culturales del backbone subyacente.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del backbone PE-Core-G14-448 de Meta, que se distribuye por separado.
- No se han publicado benchmarks en la información disponible, por lo que su correlación con el juicio humano no está cuantificada aquí.

## Enlaces

- Hugging Face: https://huggingface.co/vinesmsuic/PhyProbe
- Página del proyecto: https://research.nvidia.com/labs/cosmos-lab/phyprobe/
- Paper (arXiv): https://arxiv.org/abs/2609.38377
- Código: https://github.com/vinesmsuic/PhyProbe
- Backbone PE-Core-G14-448: https://huggingface.co/facebook/PE-Core-G14-448
- Repositorio perception_models: https://github.com/facebookresearch/perception_models
