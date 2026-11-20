# takumiecd/cst-resnet-cifar10

## Resumen

CST residual CNN for CIFAR-10 es un modelo de clasificación de imágenes desarrollado por takumiecd que explora el uso de proyecciones CST (presumiblemente "Compressed Sensing Transform" o similar, según la librería `torchcst`) en lugar de capas densas convencionales dentro de una red residual pequeña. El modelo resuelve la tarea de clasificación de las 10 clases del dataset CIFAR-10 y su relevancia radica en que demuestra empíricamente que sustituir matrices densas por proyecciones basadas en "Atoms" reduce drásticamente el número de parámetros entrenables (hasta un 82,9%) manteniendo o incluso mejorando ligeramente la precisión.

La arquitectura es una CNN residual con una cabeza clasificadora de 128→2.048→2.048→10. Se publican cuatro variantes entrenadas desde cero: una densa de referencia, una con una proyección CST, otra con dos proyecciones CST y una última con dos proyecciones CST más un atajo 1×1 también CST. Los pesos se distribuyen en formato safetensors, incluyendo ficheros compactos `*-atoms.safetensors` que almacenan las proyecciones aprendidas como átomos físicos y pueden expandirse a matrices portables.

El modelo está pensado como experimento de investigación reproducible más que como modelo de producción: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, y toda la validación se realizó con tres semillas sobre una única RTX 4090 con 4.096 actualizaciones y batch de 256. No se dispone de información sobre idiomas ni sobre capacidades de lenguaje natural, ya que es un clasificador de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN residual con cabeza clasificadora 128→2.048→2.048→10 y proyecciones CST opcionales |
| Parámetros totales | 4.978.410 (densa); 1.046.250 (una CST); 849.642 (dos CST); 842.676 (dos CST + atajo 1×1 CST) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 32×32×3 de CIFAR-10) |
| Tipos de cuantización | no disponible (pesos en safetensors; entrenamiento con convolución BF16 y cabeza en FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye variantes `*-atoms.safetensors` expandibles) |

## Arquitectura y entrenamiento

Se trata de una CNN residual pequeña con una cabeza clasificadora densa de 128→2.048→2.048→10. La innovación principal es la sustitución de matrices densas por proyecciones CST: una proyección CST reemplaza la matriz intermedia de 2.048×2.048 por 65.536 Atoms, y dos proyecciones CST reemplazan además la proyección 128→2.048 por 16.384 Atoms. La variante con atajo 1×1 CST emplea una implementación factorizada. Las convoluciones se ejecutan en BF16 y la aritmética de la cabeza en FP32.

Todas las variantes se entrenaron desde cero de extremo a extremo con 4.096 actualizaciones, batch de 256 y una única RTX 4090. El split oficial de entrenamiento se dividió en 45.000 imágenes de entrenamiento y 5.000 de validación, y la evaluación final se hizo sobre las 10.000 imágenes del test completo. Dentro de cada semilla, los modelos compartieron orden de imágenes, aumentación e inicialización común, lo que permite una comparación controlada. Se usaron tres semillas (17, 23 y 42). Los tiempos medios de actualización reportados son 4,23 ms (densa), 5,99 ms (una CST), 6,66 ms (dos CST) y 9,08 ms (dos CST + atajo 1×1). No se menciona uso de RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre imágenes individuales mediante `infer.py image.png --variant cst-two`.
- Evaluación sobre el split completo de test mediante `evaluate.py --data data --download --variant cst-two --device cuda`.
- Exportación y expansión de pesos: los ficheros `*-atoms.safetensors` se convierten a matrices portables con `expand_atoms.py`.
- Compatibilidad con el ecosistema PyTorch y con la librería `torchcst`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio, al ser un clasificador de imágenes de dominio específico.

## Casos de uso

- Investigación sobre compresión de modelos: comparar el rendimiento de proyecciones CST frente a capas densas en una CNN residual pequeña, usando las tres semillas y las cuatro variantes publicadas como base reproducible.
- Docencia y experimentación con CIFAR-10: servir como ejemplo mínimo y rápido de entrenamiento desde cero (4.096 actualizaciones en una RTX 4090) para cursos de visión por computador.
- Prototipado de clasificadores de bajo coste: la variante de dos proyecciones CST, con 849.642 parámetros entrenables, es adecuada para entornos con restricciones de memoria o de cómputo de entrenamiento.
- Validación de implementaciones de `torchcst`: el autor verificó que el export materializado coincide con los logits del modelo original en las 10.000 imágenes de test para cada checkpoint, lo que permite usar el modelo como referencia de corrección.
- Análisis de eficiencia energética y latencia: los tiempos de actualización por variante (4,23 ms a 9,08 ms) permiten estudiar el compromiso entre reducción de parámetros y coste de cómputo por paso.
- Reproducción de experimentos con semillas fijas: la publicación de resultados por semilla (`test-by-seed.csv`, `validation-by-step.csv`) facilita replicar y auditar las conclusiones del autor.

## Benchmarks y rendimiento

Resultados de precisión top-1 sobre el test completo de CIFAR-10 (10.000 imágenes), media de tres semillas:

| Variante | Top-1 medio | Semilla 17 | Semilla 23 | Semilla 42 | Parámetros entrenables | Tiempo de actualización |
|---|---:|---:|---:|---:|---:|---:|
| Densa | 87,793% | 87,73% | 87,88% | 87,77% | 4.978.410 | 4,23 ms |
| Una proyección CST | 88,040% | 88,04% | 88,11% | 87,97% | 1.046.250 | 5,99 ms |
| Dos proyecciones CST | 88,083% | 88,00% | 88,04% | 88,21% | 849.642 | 6,66 ms |
| Dos proyecciones CST + atajo 1×1 CST | 87,923% | 87,68% | 87,98% | 88,11% | 842.676 | 9,08 ms |

Según el autor, las dos proyecciones CST reducen los parámetros entrenables un 82,9% y elevan la precisión media de test 0,29 puntos porcentuales en esta comparación de tres semillas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con menos de 5 millones de parámetros en la variante densa y menos de 1 millón en las variantes CST, el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 4090 (usada por el autor para entrenamiento e inferencia), así como cualquier GPU NVIDIA con soporte CUDA; también es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo mediante los scripts `infer.py` y `evaluate.py` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican métricas de latencia de inferencia; solo se reportan tiempos medios de actualización de entrenamiento (4,23 ms a 9,08 ms por paso en una RTX 4090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CST residual CNN (dos CST) | 849.642 | 32×32×3 | 88,083% (media 3 semillas) | Apache 2.0 | Hugging Face + GitHub |
| CST residual CNN (densa) | 4.978.410 | 32×32×3 | 87,793% (media 3 semillas) | Apache 2.0 | Hugging Face + GitHub |
| ResNet-20 clásico | no disponible en la información | 32×32×3 | no disponible en la información | no disponible | Referencia académica habitual |
| Otras CNN pequeñas para CIFAR-10 | no disponible | 32×32×3 | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con alternativas concretas en la información proporcionada; la única comparación interna es entre las cuatro variantes del propio modelo.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica las 10 clases de CIFAR-10 y no generaliza a otras tareas de visión sin reentrenamiento.
- Resolución de entrada fija de 32×32 píxeles, propia de CIFAR-10; no apta para imágenes de mayor resolución sin adaptación.
- Precisión modesta en términos absolutos (en torno al 88% top-1), lejos de los modelos de visión modernos; adecuada para investigación, no para producción de alta exigencia.
- Riesgo de sobreajuste al split y a la aumentación concretos usados; la validación se limita a tres semillas y a una única configuración de entrenamiento.
- No hay información publicada sobre sesgos, robustez ante perturbaciones adversariales ni comportamiento fuera de distribución.
- No se documentan métricas de calibración ni de incertidumbre, relevantes si se usa en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello; se recomienda evaluar su idoneidad antes de integrarlo en producción.
- El autor advierte que la variante con atajo 1×1 CST usó una implementación factorizada distinta del resto, lo que limita la comparación directa de tiempos de actualización.
- No se especifican los idiomas soportados ni capacidades de lenguaje, al no ser un modelo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takumiecd/cst-resnet-cifar10
- Repositorio GitHub: https://github.com/takumiecd/cst-resnet-cifar10
- Configuración y resumen del experimento: `results/summary.json` (en el repositorio)
- Resultados de test por semilla: `results/test-by-seed.csv` (en el repositorio)
- Instantáneas de validación por paso: `results/validation-by-step.csv` (en el repositorio)
- Curvas de aprendizaje: `results/learning-curves.png` (en el repositorio)
