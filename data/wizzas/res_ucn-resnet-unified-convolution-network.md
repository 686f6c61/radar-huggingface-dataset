# Wizzas/Res_UCN-Resnet-Unified-Convolution-Network

## Resumen

Res_UCN (ResNet Unified Convolution Network) es una arquitectura de red neuronal convolucional para clasificación de imágenes presentada como repositorio de código e investigación por el autor Wilbert Andrew Yonathan y colaboradores bajo el identificador de Hugging Face `Wizzas/Res_UCN-Resnet-Unified-Convolution-Network`. No se distribuye como modelo entrenado con pesos publicados, sino como código fuente de una arquitectura experimental que parte de la filosofía de ResNet e introduce cinco modificaciones algorítmicas propias orientadas a reducir el número de parámetros y acelerar la convergencia.

El modelo se evaluó sobre CIFAR-10, donde alcanza una precisión del 91,45 % con aproximadamente un 69 % menos de parámetros que un ResNet-18 estándar y una reducción del tiempo de entrenamiento de en torno al 28 %. La arquitectura consta de cuatro etapas convolucionales (64, 128, 256 y 256 filtros) que alternan bloques ADSGC y CIAC, seguidas de global average pooling, dropout de 0,5 y una capa fully connected de 10 clases.

Su relevancia es fundamentalmente investigadora y de portafolio: propone mecanismos novedosos (parada por energía-entropía, BatchNorm ponderado por kernel gaussiano, activación Quinsh, convolución con gate dinámico y atención por canales) que pueden ser reutilizados en otras arquitecturas, pero no constituye un modelo listo para producción ni ofrece pesos preentrenados descargables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN tipo ResNet con bloques ADSGC y CIAC (4 etapas) |
| Parámetros totales | no disponible (aprox. 69 % menos que ResNet-18, sin cifra absoluta) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint PyTorch: `Res_UCN_Record.pt`) |
| Entrada | imágenes (CIFAR-10, 10 clases) |
| Framework | PyTorch 2.0+, Torchvision |

## Arquitectura y entrenamiento

La red sigue un esquema convolucional en cuatro etapas. Cada etapa aplica un bloque ADSGC (Adaptive Dynamic-Scale Gated Convolution) seguido de un bloque CIAC (Channel Importance Assignment Convolution) y un max pooling, con 64, 128, 256 y 256 filtros respectivamente. La cabeza está formada por global average pooling, dropout de 0,5 y una capa densa de 10 salidas. El bloque ADSGC combina un kernel 3x3 estándar con uno dilatado 3x3 (dilatación 2, equivalente a 5x5) y un gate predictor basado en global average pooling que decide el peso λ entre contexto local y amplio por cada entrada, sin incrementar el número de parámetros. El bloque CIAC realiza una reponderación por canales antes de la convolución mediante atención con temperatura aprendible.

El entrenamiento incorpora cinco innovaciones: (1) DE-Stopping, un criterio de parada que combina energía (LogSumExp de los logits) y entropía de Tsallis para detener solo cuando la pérdida se estanca y el modelo es confiado; (2) Weighted BatchNorm2d, que pondera píxeles con un kernel gaussiano en el cálculo de media y varianza para reducir el efecto de outliers; (3) la activación Quinsh, paramétrica, con desplazamiento (δ), gate (w) y camino lineal residual (α), orientada a mitigar el problema de Dead ReLU; (4) ADSGC; y (5) CIAC. No se especifican en la información disponible el número de tokens, la composición del dataset más allá de CIFAR-10, ni si se emplearon técnicas de RLHF o DPO (no aplicables a clasificación de imágenes).

## Capacidades

- Clasificación de imágenes en 10 clases (CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Extracción de características convolucionales con campo receptivo adaptativo por muestra.
- Reponderación de canales mediante atención con temperatura aprendible.
- Entrenamiento con parada temprana basada en energía y entropía (DE-Stopping).
- Registro de métricas de energía y entropía para visualización (`Res_UCN_ES_Record.pt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye visión multimodal, audio ni modo thinking.

## Casos de uso

- Investigación en arquitecturas convolucionales eficientes: sirve como base reproducible para estudiar el impacto de ADSGC y CIAC frente a bloques residuales convencionales en CIFAR-10.
- Docencia y experimentación con mecanismos de parada temprana: el DE-Stopping puede integrarse en pipelines de entrenamiento para comparar curvas de convergencia frente a la monitorización clásica de validation loss.
- Pruebas de activaciones paramétricas: la activación Quinsh se puede aislar y comparar con ReLU, GELU o SiLU en tareas de clasificación de imágenes de baja resolución.
- Prototipado de clasificadores ligeros: con un 69 % menos de parámetros que ResNet-18, es un punto de partida para experimentos de despliegue en entornos con presupuesto de memoria reducido (siempre que se entrene desde cero).
- Estudio de normalización robusta: Weighted BatchNorm2d permite analizar la estabilidad del entrenamiento en lotes con outliers.
- Reproducción de resultados académicos: el script de entrenamiento y los checkpoints `.pt` permiten replicar la precisión del 91,45 % en CIFAR-10 y auditar las métricas registradas.

## Benchmarks y rendimiento

| Métrica (CIFAR-10) | Res_UCN | Referencia indicada |
|---|---|---|
| Mejor precisión | 91,45 % | Baseline (+1,55 % de mejora) |
| Parámetros | ~69 % menos que ResNet-18 | ResNet-18 estándar |
| Tiempo de entrenamiento | ~28 % más rápido | Baseline |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño reducido (menos parámetros que ResNet-18), es previsible que quepa en GPU de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponible; el script detecta CUDA automáticamente.
- Compatibilidad con GPU de consumo: probable por la reducción de parámetros, sin cifra oficial.
- Opciones de despliegue: PyTorch 2.0+ con Torchvision; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Res_UCN | CNN con ADSGC/CIAC | ~69 % menos que ResNet-18 | no aplica | 91,45 % | no disponible | Código en HF y GitHub, sin pesos publicados |
| ResNet-18 | CNN residual | ~11,7 M | no aplica | no disponible en la información | BSD-3 (referencia estándar) | Pesos preentrenados en torchvision |
| Modelos comparables adicionales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con ResNet-18 se limita a los datos aportados por el autor (reducción de parámetros y mejora de precisión relativa); no se dispone de cifras absolutas de parámetros ni de resultados de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- No se publican pesos entrenados: el repositorio contiene código fuente, por lo que no es un modelo listo para inferencia directa.
- Evaluación limitada a CIFAR-10 (10 clases, imágenes de 32x32); no hay evidencia de generalización a otros datasets o resoluciones.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Sesgos: no documentados; al entrenarse sobre CIFAR-10, heredaría los sesgos de composición de dicho dataset.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto), pero sí puede producir clasificaciones erróneas con alta confianza en clases ambiguas.
- Idiomas: no aplica; no soporta tareas de lenguaje.
- El criterio DE-Stopping y las métricas de energía/entropía dependen de hiperparámetros (threshold) no detallados en la información disponible.
- Sin resultados de benchmarks independientes ni replicaciones externas conocidas.

## Enlaces

- Hugging Face: https://huggingface.co/Wizzas/Res_UCN-Resnet-Unified-Convolution-Network
- GitHub: https://github.com/WAYTECHG/Res_UCN-Resnet-Unified-Convolution-Network
