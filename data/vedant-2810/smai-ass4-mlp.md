# VEdant-2810/smai-ass4-mlp

## Resumen

`smai-ass4-mlp` es un clasificador de imágenes de muy pequeño tamaño publicado en HuggingFace por el usuario VEdant-2810 como parte de la asignación 4 de la asignatura SMAI (Statistical Methods for Artificial Intelligence). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un perceptrón multicapa (MLP) de tres capas (3072 → 32 → 10) entrenado desde cero con NumPy sobre el conjunto CIFAR-10, con 98.666 parámetros en precisión float64. Su interés es exclusivamente académico y reproducible, no de producción.

El modelo resuelve la tarea de clasificación de imágenes RGB de 32 × 32 píxeles en las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Se distribuye como un bundle de archivos NumPy (`.npz`) junto con scripts de inferencia autónomos, lo que permite ejecutarlo sin PyTorch y sin dependencias pesadas, algo poco habitual en el ecosistema de HuggingFace.

Su relevancia actual es limitada: sirve como referencia docente para ilustrar el flujo completo de entrenamiento, selección de arquitectura por validación, exportación de pesos y validación de formas y dtypes en la carga. No compite con modelos de visión modernos y su precisión en test es baja (43,0 %), muy por debajo de una CNN básica o de un ViT pequeño sobre el mismo dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP denso: 3072 → 32 → 10, activación ReLU en la capa oculta, logits identidad en la salida |
| Parámetros totales | 98.666 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada fija de 32 × 32 × 3) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float64 |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`W_0`, `b_0`, `W_1`, `b_1`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa completamente conectado con una única capa oculta de 32 neuronas. La entrada son imágenes RGB de 32 × 32 píxeles aplanadas en orden HWC (3072 dimensiones), normalizadas dividiendo por 255 y restando la media de entrenamiento y dividiendo por la desviación típica (calculadas con `ddof=0` sobre las 50.000 imágenes del split de entrenamiento original de CIFAR-10). La capa oculta usa ReLU y la salida son logits sin activación. Todos los pesos, sesgos y operaciones se realizan en float64.

El entrenamiento se realizó con SGD plano, learning rate 0,03, batch size 64, sin acumulación de gradientes, sin early stopping y con semilla 2003, durante 100 épocas sobre etiquetas limpias (`p = 0`). No hay información sobre RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes. La selección de arquitectura se hizo mediante una regla de validación descrita en la sección 1.2.5 del trabajo, y los pesos exportados provienen de `results/1.4/mlp-p0.pt` sin reentrenamiento ni selección del mejor pico de test. El bundle incluye `config.json` con la configuración completa, `preprocessing.npz` con las estadísticas exactas y dos implementaciones de inferencia (NumPy puro y PyTorch).

## Capacidades

- Clasificación de imágenes RGB de exactamente 32 × 32 píxeles en las diez clases de CIFAR-10.
- Salida de probabilidades por clase mediante softmax sobre los logits (la implementación de referencia aplica softmax explícitamente).
- Inferencia sin PyTorch mediante `numpy_inference.py`, con validación de formas, dtypes y valores finitos.
- Carga de pesos en PyTorch mediante `assignment_model.py`, que transpone `W_i` para `nn.Linear` y restaura pesos y sesgos en modo evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- No tiene capacidades multilingües: no procesa texto.
- No realiza redimensionado automático ni conversión de color: la imagen debe entregarse ya en RGB uint8 de 32 × 32.

## Casos de uso

- Docencia de aprendizaje automático: el bundle permite a estudiantes reproducir el pipeline completo (normalización, forward pass, softmax, argmax) en NumPy puro sin instalar frameworks, útil para asignaturas introductorias.
- Referencia de baseline para CIFAR-10: sirve como cota inferior de comparación (43,0 % de accuracy en test) frente a CNN, ResNet o ViT en prácticas y experimentos de curso.
- Verificación de pipelines de preprocesado: al incluir `preprocessing.npz` con media y desviación exactas, permite comprobar que una implementación propia de normalización coincide con la del autor.
- Pruebas unitarias de carga de pesos: los scripts de validación de formas y dtypes sirven como ejemplo de test de integridad para bundles de modelos pequeños en CI.
- Demostraciones de inferencia sin GPU: al ser un MLP de 98.666 parámetros en float64, se ejecuta en CPU en milisegundos y cabe en cualquier entorno, incluso en contenedores mínimos.
- Ejercicios de análisis de sobreajuste: la brecha train-test de 16,302 puntos porcentuales y las curvas registradas en WandB permiten estudiar regularización, early stopping y selección de arquitectura en clase.
- Prototipado de clasificadores embebidos: el tamaño reducido del modelo (menos de 100.000 parámetros) lo hace apto como ejemplo de despliegue en dispositivos con memoria muy limitada, aunque su precisión no sea suficiente para uso real.

## Benchmarks y rendimiento

Resultados registrados por el autor sobre el split de test original de CIFAR-10 (10.000 imágenes, época 100, etiquetas limpias):

| Métrica | Valor |
|---|---:|
| Parámetros | 98.666 |
| Entropía cruzada de entrenamiento | 1,268694 |
| Entropía cruzada de test | 2,079198 |
| Accuracy de entrenamiento | 59,302 % |
| Accuracy de test | 43,000 % |
| Brecha train-test | 16,302 puntos porcentuales |
| Macro F1 | 0,424603 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que la selección de arquitectura se hizo con un split de desarrollo que solapaba con las imágenes de test originales, por lo que el 43,0 % no es una estimación sobre un holdout completamente intacto para todo el flujo de selección.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB para los pesos en float64 (98.666 × 8 bytes ≈ 790 KB); el cuello de botella es la RAM del proceso, no la GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU sirve y la CPU es suficiente. Funciona en A100, H100, RTX 4090 y en portátiles sin GPU dedicada.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, y también en Raspberry Pi.
- Opciones de despliegue: el propio bundle con `numpy_inference.py` (sin dependencias de deep learning) o `assignment_model.py` con PyTorch. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera del orden de microsegundos a milisegundos por batch en CPU, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Accuracy en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| `smai-ass4-mlp` | MLP 3072→32→10 | 98.666 | 32 × 32 × 3 fija | 43,0 % (test, con solapamiento de selección) | no disponible | HuggingFace, bundle NumPy |
| LeNet-5 (referencia clásica) | CNN | ~60.000 | 32 × 32 × 1 o 3 | ~70 % aproximado en CIFAR-10 | dominio público / variable | múltiples implementaciones |
| ResNet-20 (referencia CIFAR) | CNN residual | ~270.000 | 32 × 32 × 3 | ~91-92 % | variable según implementación | múltiples repositorios |
| ViT pequeño (p. ej. DeiT-Ti) | Transformer | ~5,7 M | 224 × 224 × 3 (o 32 × 32 con parcheo adaptado) | ~72-75 % con preentrenamiento | Apache 2.0 en variantes abiertas | HuggingFace |

Las cifras de los modelos comparables son aproximadas y provienen de la literatura general, no de la información proporcionada por el autor; se incluyen solo como referencia de magnitud. El MLP aquí descrito está muy por debajo de cualquier CNN razonable en la misma tarea.

## Limitaciones y advertencias

- Precisión baja: 43,0 % en test y macro F1 de 0,4246, insuficiente para cualquier aplicación real de clasificación.
- Sobreajuste claro: brecha train-test de 16,302 puntos porcentuales con solo 98.666 parámetros y 100 épocas sin early stopping.
- El split de desarrollo solapa con las imágenes de test originales, por lo que el resultado reportado no es un holdout completamente limpio para todo el flujo de selección de arquitectura.
- Un único seed (2003) por configuración: no hay estimación de varianza entre ejecuciones.
- Rendimiento no establecido fuera de CIFAR-10; no se ha evaluado en otras distribuciones de imágenes.
- Sin redimensionado ni conversión de color automáticos: si se alimenta con imágenes de otro tamaño u otro espacio de color, fallará o dará resultados sin sentido.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Es un proyecto académico de pregrado, no un modelo mantenido ni auditado; no hay garantías de soporte, actualizaciones ni corrección de errores.
- No apto para producción: no hay versiones cuantizadas, servidor de inferencia, ni integración con frameworks de despliegue estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VEdant-2810/smai-ass4-mlp
- Ejecución de entrenamiento registrada en WandB: https://forge.coreweave.com/wandb/vedantzope2810/smai-ass4/runs/9klc6ka0
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar10
